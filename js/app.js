(function () {
  'use strict';

  const DATA = window.MARVEL_VAULT;
  if (!DATA) throw new Error('Marvel Vault catalogue did not load.');

  const DB_NAME = 'MarvelReadingVaultV3';
  const DB_VERSION = 1;
  const STORE = 'issueProgress';
  const FALLBACK_KEY = 'marvel-reading-vault-v3-progress';
  const SETTINGS_KEY = 'marvel-reading-vault-v4-settings';
  const OLD_PROGRESS_KEYS = ['marvel-reading-vault-v3-progress', 'marvel-reading-vault-progress-v2', 'marvel-reading-vault-progress-v1'];

  const recommendationRank = { Peak: 1, Essential: 2, Current: 2, Recommended: 3, Optional: 4, Skim: 5, Skip: 6 };
  const modeMax = { peak: 1, core: 2, recommended: 3, curated: 4 };
  const pageTitles = {
    dashboard: 'Dashboard', master: 'Master Flow', phases: 'Phases', roadmaps: 'Roadmaps', events: 'Events', stories: 'Great Stories',
    ultimate: 'Ultimate Universe', elseworlds: 'Elseworlds & Crossovers', stats: 'Stats', settings: 'Settings'
  };

  const itemsById = Object.fromEntries(DATA.items.map(item => [item.id, item]));
  const issuesById = DATA.issues;
  const phasesById = Object.fromEntries(DATA.phases.map(phase => [phase.id, phase]));
  const roadmapsById = Object.fromEntries(DATA.roadmaps.map(r => [r.id, r]));
  const issueToItems = {};
  DATA.items.forEach(item => item.sections.forEach(section => section.issueIds.forEach(issueId => {
    if (!issueToItems[issueId]) issueToItems[issueId] = [];
    issueToItems[issueId].push(item.id);
  })));

  let db = null;
  let progress = {};
  let currentView = 'dashboard';
  let openItems = new Set();
  let activeRoadmap = 'x-men';
  let activeRoadmapTab = 'main';
  let activeRoadmapFamily = 'all';
  let openRouteSegments = new Set();
  let activePhase = 'all';
  let settings = loadSettings();
  let filters = {
    master: createFilter(), events: createFilter(), stories: createFilter(), ultimate: createFilter(), elseworlds: createFilter(), roadmaps: createFilter()
  };
  filters.master.phase = settings.masterPhase || 'phase-0';

  function createFilter() {
    return { search: '', phase: 'all', category: 'all', priority: 'all', status: 'all', audit: 'all' };
  }


  function safeLocalGet(key, fallback = null) {
    try { return localStorage.getItem(key); }
    catch { return fallback; }
  }

  function safeLocalSet(key, value) {
    try { localStorage.setItem(key, value); return true; }
    catch { return false; }
  }

  function safeLocalRemove(key) {
    try { localStorage.removeItem(key); }
    catch { /* storage unavailable */ }
  }

  function loadSettings() {
    try {
      return { routeMode: DATA.routeConfig?.defaultRouteMode || 'recommended', routeLanes: DATA.routeConfig?.defaultLanes || [], theme: 'dark', activeRoadmap: 'x-men', activeRoadmapTab: 'main', activeRoadmapFamily: 'all', ...JSON.parse(safeLocalGet(SETTINGS_KEY, '{}') || '{}') };
    } catch {
      return { routeMode: DATA.routeConfig?.defaultRouteMode || 'recommended', routeLanes: DATA.routeConfig?.defaultLanes || [], theme: 'dark', activeRoadmap: 'x-men', activeRoadmapTab: 'main', activeRoadmapFamily: 'all' };
    }
  }

  function saveSettings() {
    settings.activeRoadmap = activeRoadmap;
    settings.activeRoadmapTab = activeRoadmapTab;
    settings.activeRoadmapFamily = activeRoadmapFamily;
    safeLocalSet(SETTINGS_KEY, JSON.stringify(settings));
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  }

  function escapeAttr(value) { return escapeHtml(value).replace(/`/g, '&#96;'); }

  function toast(message) {
    const el = document.getElementById('toast');
    el.textContent = message;
    el.classList.add('show');
    window.clearTimeout(toast.timer);
    toast.timer = window.setTimeout(() => el.classList.remove('show'), 2200);
  }

  function applyTheme(theme) {
    settings.theme = theme;
    document.documentElement.dataset.theme = theme;
    document.getElementById('themeToggle').textContent = theme === 'dark' ? '☀' : '◐';
    saveSettings();
  }

  function openDatabase() {
    if (!('indexedDB' in window)) return Promise.resolve(null);
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(STORE)) database.createObjectStore(STORE, { keyPath: 'issueId' });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function loadProgress() {
    try {
      db = await openDatabase();
      if (db) {
        const records = await new Promise((resolve, reject) => {
          const tx = db.transaction(STORE, 'readonly');
          const req = tx.objectStore(STORE).getAll();
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => reject(req.error);
        });
        progress = Object.fromEntries(records.map(record => [record.issueId, record]));
        return;
      }
    } catch (error) {
      console.warn('IndexedDB unavailable, using LocalStorage fallback.', error);
    }
    try { progress = JSON.parse(safeLocalGet(FALLBACK_KEY, '{}') || '{}') || {}; }
    catch { progress = {}; }
  }

  async function persistRecords(records) {
    records.forEach(record => {
      if (record && record.issueId) progress[record.issueId] = record;
    });
    if (db) {
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite');
        const store = tx.objectStore(STORE);
        records.forEach(record => store.put(record));
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });
    } else {
      safeLocalSet(FALLBACK_KEY, JSON.stringify(progress));
    }
  }

  async function clearProgress() {
    progress = {};
    if (db) {
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite');
        const req = tx.objectStore(STORE).clear();
        req.onsuccess = resolve;
        req.onerror = () => reject(req.error);
      });
    }
    safeLocalRemove(FALLBACK_KEY);
  }

  function getIssueRecord(issueId) {
    return progress[issueId] || { issueId, read: false, rating: '', note: '', ownership: 'none', wishlist: false, readAt: '' };
  }

  function isPublished(issueId) { return issuesById[issueId]?.status !== 'solicited'; }
  function isRead(issueId) { return Boolean(progress[issueId]?.read); }

  function activeMax() { return modeMax[settings.routeMode] || 2; }
  function rank(value) { return recommendationRank[value] || 3; }
  function includedRecommendation(value) { return rank(value) <= activeMax(); }

  function itemVisibleByMode(item) {
    if (item.priority === 'Current') return settings.routeMode !== 'peak';
    return includedRecommendation(item.priority);
  }

  function getIncludedSections(item) {
    return item.sections.filter(section => includedRecommendation(section.recommendation));
  }

  function uniqueIssueIdsFromSections(sections, publishedOnly = true) {
    const set = new Set();
    sections.forEach(section => section.issueIds.forEach(issueId => {
      if (!publishedOnly || isPublished(issueId)) set.add(issueId);
    }));
    return [...set];
  }

  function itemIssueIds(item, publishedOnly = true) {
    return uniqueIssueIdsFromSections(getIncludedSections(item), publishedOnly);
  }

  function itemProgress(item) {
    const ids = itemIssueIds(item, true);
    const read = ids.filter(isRead).length;
    const total = ids.length;
    const percent = total ? Math.round((read / total) * 100) : 0;
    const status = total === 0 ? 'upcoming' : read === 0 ? 'unread' : read === total ? 'complete' : 'reading';
    return { ids, read, total, percent, status };
  }

  function sectionProgress(section) {
    const ids = [...new Set(section.issueIds.filter(isPublished))];
    const read = ids.filter(isRead).length;
    return { ids, read, total: ids.length, percent: ids.length ? Math.round(read / ids.length * 100) : 0 };
  }

  function itemsIssueSet(items, publishedOnly = true) {
    const set = new Set();
    items.filter(itemVisibleByMode).forEach(item => getIncludedSections(item).forEach(section => section.issueIds.forEach(issueId => {
      if (!publishedOnly || isPublished(issueId)) set.add(issueId);
    })));
    return set;
  }

  function phaseItems(phaseId) {
    return DATA.items.filter(item => item.page === 'main' && item.phaseId === phaseId);
  }

  function phaseProgress(phaseId) {
    const ids = DATA.routeConfig?.chapterWindows?.[phaseId] ? routePhaseIssueIds(phaseId) : [...itemsIssueSet(phaseItems(phaseId))];
    const read = ids.filter(isRead).length;
    return { total: ids.length, read, left: Math.max(0, ids.length - read), percent: ids.length ? Math.round(read / ids.length * 100) : 0 };
  }

  function roadmapItems(roadmapId) {
    return DATA.items.filter(item => item.roadmapIds.includes(roadmapId));
  }

  function roadmapProgress(roadmapId) {
    const ids = [...itemsIssueSet(roadmapItems(roadmapId))];
    const read = ids.filter(isRead).length;
    return { total: ids.length, read, left: ids.length - read, percent: ids.length ? Math.round(read / ids.length * 100) : 0 };
  }


  function routeSourceIssueIds(item) {
    if (Array.isArray(item.routeIssueIds) && item.routeIssueIds.length) {
      return [...new Set(item.routeIssueIds.filter(id => issuesById[id] && isPublished(id)))];
    }
    return uniqueIssueIdsFromSections(getIncludedSections(item), true);
  }

  function chunkIssues(issueIds, minSize = DATA.routeConfig?.blockMin || 6, maxSize = DATA.routeConfig?.blockMax || 12) {
    const ids = [...new Set(issueIds)];
    if (ids.length <= maxSize) return ids.length ? [ids] : [];
    const chunks = [];
    for (let index = 0; index < ids.length; index += maxSize) chunks.push(ids.slice(index, index + maxSize));
    if (chunks.length > 1 && chunks[chunks.length - 1].length < minSize) {
      const tail = chunks.pop();
      const previous = chunks[chunks.length - 1];
      if (previous.length + tail.length <= 15) previous.push(...tail);
      else {
        while (tail.length < minSize && previous.length > minSize) tail.unshift(previous.pop());
        chunks.push(tail);
      }
    }
    return chunks;
  }

  function segmentPhase(item, segmentNumber) {
    const rules = DATA.routeConfig?.phaseOverrides?.[item.id] || [];
    for (const rule of rules) if (segmentNumber <= rule.throughSegment) return rule.phaseId;
    return item.phaseId;
  }

  function primaryLane(item) {
    const preferred = item.roadmapIds?.find(id => !['great-stories', 'ultimate', 'legacy-heroes'].includes(id));
    return preferred || item.categories?.[0] || 'Marvel Universe';
  }

  function buildRunSegments(item) {
    const source = routeSourceIssueIds(item);
    const chunks = chunkIssues(source);
    return chunks.map((issueIds, index) => ({
      id: `route-segment--${item.id}--${index + 1}`,
      itemId: item.id,
      item,
      phaseId: segmentPhase(item, index + 1),
      order: item.order + ((index + 1) / 1000),
      segmentNumber: index + 1,
      segmentCount: chunks.length,
      issueIds,
      lane: primaryLane(item),
      title: chunks.length > 1 ? `${item.title}: Block ${index + 1}` : item.title,
      summary: item.summary,
      priority: item.priority,
      role: item.role,
      years: item.years
    }));
  }

  function routeEntities() {
    const selectedLanes = new Set(settings.routeLanes?.length ? settings.routeLanes : (DATA.routeConfig?.defaultLanes || []));
    const items = DATA.items.filter(item => {
      if (item.page !== 'main' || item.routeEligible === false || !itemVisibleByMode(item)) return false;
      if (item.kind === 'event') return true;
      return (item.roadmapIds || []).some(id => selectedLanes.has(id));
    });
    const rawSegments = [];
    const gates = [];
    items.forEach(item => {
      if (item.kind === 'event') {
        gates.push({
          id: `route-gate--${item.id}`,
          itemId: item.id,
          item,
          phaseId: item.phaseId,
          order: item.order,
          issueIds: routeSourceIssueIds(item),
          lane: 'Event Gate'
        });
      } else {
        rawSegments.push(...buildRunSegments(item));
      }
    });

    // Event gates own their crossover chapters. Shared issues are removed from run blocks,
    // and every remaining issue is assigned to only one segment per phase.
    const gateIssuesByPhase = {};
    gates.forEach(gate => {
      if (!gateIssuesByPhase[gate.phaseId]) gateIssuesByPhase[gate.phaseId] = new Set();
      gate.issueIds.forEach(id => gateIssuesByPhase[gate.phaseId].add(id));
    });
    const seenByPhase = {};
    const segments = rawSegments.sort((a, b) => a.order - b.order).map(segment => {
      if (!seenByPhase[segment.phaseId]) seenByPhase[segment.phaseId] = new Set();
      const gateSet = gateIssuesByPhase[segment.phaseId] || new Set();
      const issueIds = segment.issueIds.filter(id => !gateSet.has(id) && !seenByPhase[segment.phaseId].has(id));
      issueIds.forEach(id => seenByPhase[segment.phaseId].add(id));
      return { ...segment, issueIds };
    }).filter(segment => segment.issueIds.length);
    return { segments, gates };
  }

  function interleaveSegments(segments) {
    const grouped = new Map();
    segments.sort((a, b) => a.order - b.order).forEach(segment => {
      if (!grouped.has(segment.itemId)) grouped.set(segment.itemId, []);
      grouped.get(segment.itemId).push(segment);
    });
    const queues = [...grouped.values()].sort((a, b) => a[0].order - b[0].order);
    const output = [];
    let lastLane = '';
    while (queues.some(queue => queue.length)) {
      let used = false;
      for (const queue of queues) {
        if (!queue.length) continue;
        const candidate = queue[0];
        if (candidate.lane === lastLane && queues.some(other => other.length && other[0].lane !== lastLane)) continue;
        output.push(queue.shift());
        lastLane = candidate.lane;
        used = true;
      }
      if (!used) {
        const queue = queues.find(entry => entry.length);
        if (queue) {
          const candidate = queue.shift();
          output.push(candidate);
          lastLane = candidate.lane;
        }
      }
    }
    return output;
  }

  function chapterFlow(phaseId, chapter) {
    const { segments, gates } = routeEntities();
    const chapterSegments = segments.filter(segment => segment.phaseId === phaseId && segment.item.order >= chapter.min && segment.item.order < chapter.max);
    const chapterGates = gates.filter(gate => gate.phaseId === phaseId && gate.item.order >= chapter.min && gate.item.order < chapter.max).sort((a, b) => a.order - b.order);
    const flow = [];
    let minimum = chapter.min;
    chapterGates.forEach(gate => {
      const before = chapterSegments.filter(segment => segment.item.order >= minimum && segment.item.order <= gate.order);
      flow.push(...interleaveSegments(before), gate);
      minimum = gate.order + 0.0001;
    });
    const after = chapterSegments.filter(segment => segment.item.order >= minimum);
    flow.push(...interleaveSegments(after));
    const seen = new Set();
    return flow.filter(entity => {
      if (seen.has(entity.id)) return false;
      seen.add(entity.id);
      return true;
    });
  }

  function routePhaseIssueIds(phaseId) {
    const config = DATA.routeConfig?.chapterWindows?.[phaseId] || [];
    const set = new Set();
    config.forEach(chapter => chapterFlow(phaseId, chapter).forEach(entity => entity.issueIds.forEach(id => { if (isPublished(id)) set.add(id); })));
    return [...set];
  }

  function routeChapterProgress(flow) {
    const ids = [...new Set(flow.flatMap(entity => entity.issueIds).filter(isPublished))];
    const read = ids.filter(isRead).length;
    return { ids, read, total: ids.length, left: ids.length - read, percent: ids.length ? Math.round(read / ids.length * 100) : 0 };
  }

  function itemCompletionForPrerequisite(itemId) {
    const item = itemsById[itemId];
    if (!item) return false;
    const essentialSections = item.sections.filter(section => rank(section.recommendation) <= 2);
    const ids = uniqueIssueIdsFromSections(essentialSections, true);
    return ids.length > 0 && ids.every(isRead);
  }

  function lockState(item) {
    if (!item.prerequisites?.length) return null;
    const results = item.prerequisites.map(id => ({ id, complete: itemCompletionForPrerequisite(id), item: itemsById[id] })).filter(result => result.item);
    const complete = results.filter(r => r.complete).length;
    return {
      state: complete === results.length ? 'ready' : complete === 0 ? 'missing' : 'partial',
      results,
      missing: results.filter(r => !r.complete)
    };
  }

  function priorityBadge(value) {
    const cls = `badge-${String(value).toLowerCase().replace(/\s+/g, '-')}`;
    return `<span class="badge ${cls}">${escapeHtml(value)}</span>`;
  }

  function auditBadge(value) {
    const lowered = String(value).toLowerCase();
    const cls = lowered === 'verified' ? 'badge-verified' : lowered === 'current' ? 'badge-current' : 'badge-provisional';
    return `<span class="badge badge-audit ${cls}">${escapeHtml(value)}</span>`;
  }

  function setView(view) {
    currentView = view;
    document.querySelectorAll('.view').forEach(el => el.classList.toggle('active', el.id === view));
    document.querySelectorAll('.nav-link').forEach(el => el.classList.toggle('active', el.dataset.view === view));
    document.getElementById('pageTitle').textContent = pageTitles[view] || view;
    document.getElementById('sidebar').classList.remove('open');
    window.scrollTo({ top: 0, behavior: 'instant' });
    renderCurrentView();
  }

  function renderViewHeader(eyebrow, title, text, extra = '') {
    return `<div class="view-header"><div><p class="eyebrow">${escapeHtml(eyebrow)}</p><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></div>${extra}</div>`;
  }

  function renderKpi(label, value, detail) {
    return `<div class="kpi"><span class="label">${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><small>${escapeHtml(detail)}</small></div>`;
  }

  function renderProgressBar(percent) {
    return `<div class="progress-bar"><span style="width:${Math.max(0, Math.min(100, percent))}%"></span></div>`;
  }

  function renderPhaseCard(phase) {
    const p = phaseProgress(phase.id);
    return `<article class="phase-card" data-open-phase="${phase.id}">
      <div class="phase-card-top"><div><span class="badge badge-role">${escapeHtml(phase.short)}</span><h4>${escapeHtml(phase.title)}</h4><p>${escapeHtml(phase.years)} · ${escapeHtml(phase.description)}</p></div><strong>${p.percent}%</strong></div>
      ${renderProgressBar(p.percent)}
      <div class="phase-counts"><span><strong>${p.read}</strong> read</span><span><strong>${p.left}</strong> left</span><span><strong>${p.total}</strong> unique issues</span></div>
    </article>`;
  }

  function renderDashboard() {
    const mainItems = DATA.items.filter(item => item.page === 'main');
    const allIds = [...itemsIssueSet(mainItems)];
    const read = allIds.filter(isRead).length;
    const partial = mainItems.filter(item => itemVisibleByMode(item) && itemProgress(item).status === 'reading').sort((a, b) => a.order - b.order).slice(0, 5);
    const next = mainItems.filter(item => itemVisibleByMode(item) && ['Peak', 'Essential', 'Current'].includes(item.priority) && itemProgress(item).status === 'unread')
      .sort(sortItems).slice(0, 4);
    const topRoadmaps = ['x-men', 'fantastic-four', 'avengers', 'spider-man', 'daredevil', 'thor'].map(id => ({ roadmap: roadmapsById[id], progress: roadmapProgress(id) }));

    document.getElementById('dashboard').innerHTML = `
      <div class="hero">
        <p class="eyebrow">Canonical issue tracking</p>
        <h3>One issue. One identity. Every roadmap.</h3>
        <p>Checking a crossover chapter anywhere updates every run, event, phase and character page that references it. Phase totals count unique published issues, not repeated cards.</p>
        <div class="hero-actions"><button class="btn primary" data-view-target="master">Continue through Master Flow</button><button class="btn" data-view-target="roadmaps">Choose a roadmap</button><button class="btn ghost" data-view-target="events">Check event locks</button></div>
      </div>
      <div class="kpi-grid">
        ${renderKpi('Route issues read', read, `${Math.max(0, allIds.length - read)} remaining in the active route`)}
        ${renderKpi('Unique route issues', allIds.length, `${DATA.validation.counts.issues.toLocaleString()} canonical issues catalogued`)}
        ${renderKpi('Curated records', DATA.validation.counts.items, `${DATA.validation.counts.events} structured events`)}
        ${renderKpi('Active route', document.querySelector('#routeMode option:checked')?.textContent || settings.routeMode, 'Change this at the top of the site')}
      </div>
      <div class="section-title"><h4>Phase progress</h4><p>Counts are deduplicated across runs and events.</p></div>
      <div class="phase-grid">${DATA.phases.map(renderPhaseCard).join('')}</div>
      <div class="section-title"><h4>Continue reading</h4><p>Your partially completed runs and events.</p></div>
      <div class="item-list">${partial.length ? partial.map(item => renderItemCard(item, { compact: true })).join('') : '<div class="empty-state">Nothing is currently in progress. Open a roadmap and begin a block.</div>'}</div>
      <div class="section-title"><h4>Suggested next</h4><p>Unread Peak, Essential or Current blocks in phase order.</p></div>
      <div class="item-list">${next.map(item => renderItemCard(item, { compact: true })).join('')}</div>
      <div class="section-title"><h4>Main lanes</h4><p>Quick progress through the biggest roadmaps.</p></div>
      <div class="roadmap-grid">${topRoadmaps.map(({ roadmap, progress: p }) => `<button class="roadmap-card" data-open-roadmap="${roadmap.id}"><h4>${escapeHtml(roadmap.title)}</h4><p>${p.read}/${p.total} issues · ${p.left} left</p>${renderProgressBar(p.percent)}</button>`).join('')}</div>`;
  }

  function sortItems(a, b) {
    const phaseA = DATA.phases.findIndex(p => p.id === a.phaseId);
    const phaseB = DATA.phases.findIndex(p => p.id === b.phaseId);
    if (phaseA !== phaseB) return phaseA - phaseB;
    if (a.order !== b.order) return a.order - b.order;
    return a.title.localeCompare(b.title);
  }

  function categoriesFor(items) {
    return [...new Set(items.flatMap(item => item.categories))].sort();
  }

  function renderFilters(key, items, options = {}) {
    const f = filters[key];
    const categories = categoriesFor(items);
    const phaseOptions = options.noPhase ? [] : DATA.phases;
    return `<div class="filters">
      <div class="filter-control grow"><label>Search this page</label><input type="search" data-filter-key="${key}" data-filter-name="search" value="${escapeAttr(f.search)}" placeholder="Title, writer, issue, category…"></div>
      ${options.noPhase ? '' : `<div class="filter-control"><label>Phase</label><select data-filter-key="${key}" data-filter-name="phase"><option value="all">All phases</option>${phaseOptions.map(p => `<option value="${p.id}" ${f.phase === p.id ? 'selected' : ''}>${escapeHtml(p.short)} · ${escapeHtml(p.title)}</option>`).join('')}</select></div>`}
      <div class="filter-control"><label>Category</label><select data-filter-key="${key}" data-filter-name="category"><option value="all">All categories</option>${categories.map(cat => `<option value="${escapeAttr(cat)}" ${f.category === cat ? 'selected' : ''}>${escapeHtml(cat)}</option>`).join('')}</select></div>
      <div class="filter-control"><label>Priority</label><select data-filter-key="${key}" data-filter-name="priority"><option value="all">All labels</option>${['Peak','Essential','Current','Recommended','Optional','Skim','Skip'].map(value => `<option value="${value}" ${f.priority === value ? 'selected' : ''}>${value}</option>`).join('')}</select></div>
      <div class="filter-control"><label>Status</label><select data-filter-key="${key}" data-filter-name="status"><option value="all">All status</option>${['unread','reading','complete','upcoming'].map(value => `<option value="${value}" ${f.status === value ? 'selected' : ''}>${value}</option>`).join('')}</select></div>
      <div class="filter-control"><label>Audit</label><select data-filter-key="${key}" data-filter-name="audit"><option value="all">All data</option>${['Verified','Current','Provisional'].map(value => `<option value="${value}" ${f.audit === value ? 'selected' : ''}>${value}</option>`).join('')}</select></div>
    </div>`;
  }

  function filterItems(items, key, options = {}) {
    const f = filters[key];
    const q = f.search.trim().toLowerCase();
    return items.filter(item => {
      if (!options.ignoreMode && !itemVisibleByMode(item)) return false;
      if (f.phase !== 'all' && item.phaseId !== f.phase) return false;
      if (f.category !== 'all' && !item.categories.includes(f.category)) return false;
      if (f.priority !== 'all' && item.priority !== f.priority) return false;
      if (f.status !== 'all' && itemProgress(item).status !== f.status) return false;
      if (f.audit !== 'all' && item.auditStatus !== f.audit) return false;
      if (q) {
        const issueText = item.sections.flatMap(s => s.issueIds.slice(0, 25).map(id => issuesById[id]?.displayTitle || '')).join(' ');
        const haystack = [item.title, item.writer, item.summary, item.note, item.categories.join(' '), item.role, item.priority, issueText].join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    }).sort(sortItems);
  }

  function renderPhaseTabs(selected = 'all') {
    return `<div class="phase-tabs"><button class="phase-tab ${selected === 'all' ? 'active' : ''}" data-phase-filter="all">All phases</button>${DATA.phases.map(p => `<button class="phase-tab ${selected === p.id ? 'active' : ''}" data-phase-filter="${p.id}">${escapeHtml(p.short)} · ${escapeHtml(p.title)}</button>`).join('')}</div>`;
  }

  function renderGroupedByPhase(items, options = {}) {
    if (!items.length) return '<div class="empty-state">No entries match the current route and filters.</div>';
    return DATA.phases.map(phase => {
      const phaseList = items.filter(item => item.phaseId === phase.id);
      if (!phaseList.length) return '';
      const p = phaseProgress(phase.id);
      return `<section class="phase-section" id="section-${phase.id}"><div class="phase-heading"><div><span class="badge badge-role">${phase.short}</span><h3>${escapeHtml(phase.title)}</h3><p>${escapeHtml(phase.years)} · ${escapeHtml(phase.description)}</p></div><div class="phase-summary">${p.read}/${p.total} route issues<br>${p.left} remaining</div></div><div class="item-list">${phaseList.map(item => renderItemCard(item, options)).join('')}</div></section>`;
    }).join('');
  }

  function routeEntityProgress(entity) {
    const ids = [...new Set(entity.issueIds.filter(isPublished))];
    const read = ids.filter(isRead).length;
    return { ids, read, total: ids.length, left: ids.length - read, percent: ids.length ? Math.round(read / ids.length * 100) : 0 };
  }

  function renderRouteSegment(segment, nextEntity) {
    const p = routeEntityProgress(segment);
    const open = openRouteSegments.has(segment.id);
    const nextLabel = nextEntity ? (nextEntity.item?.title || nextEntity.title || 'Next block') : 'End of chapter';
    return `<article class="route-segment ${p.total && p.read === p.total ? 'complete' : ''}" id="${segment.id}">
      <div class="route-step">${segment.segmentNumber}</div>
      <div class="route-main">
        <div class="item-card-title">${priorityBadge(segment.priority)}<span class="badge badge-role">${escapeHtml(segment.lane)}</span><span class="badge badge-role">${segment.issueIds.length} issues</span></div>
        <h4>${escapeHtml(segment.title)}</h4>
        <p class="item-summary">${escapeHtml(segment.summary)}</p>
        <p class="route-switch"><strong>Switch after this block:</strong> ${escapeHtml(nextLabel)}</p>
        ${renderProgressBar(p.percent)}
        <div class="phase-counts"><span><strong>${p.read}</strong> read</span><span><strong>${p.left}</strong> left</span><span><strong>${p.total}</strong> in block</span></div>
        <div class="card-actions"><button class="btn primary" data-toggle-segment="${segment.id}">${open ? 'Close issues' : 'Show issues'}</button><button class="btn" data-mark-segment="${segment.id}" data-value="${p.total && p.read === p.total ? 'unread' : 'read'}">${p.total && p.read === p.total ? 'Clear block' : 'Mark block read'}</button><button class="btn ghost" data-open-run="${segment.itemId}">Open full run</button></div>
        ${open ? `<div class="route-issue-panel"><div class="issue-grid">${segment.issueIds.map(renderIssueRow).join('')}</div></div>` : ''}
      </div>
    </article>`;
  }

  function renderRouteGate(gate, nextEntity) {
    const item = gate.item;
    const p = routeEntityProgress(gate);
    const open = openRouteSegments.has(gate.id);
    const nextLabel = nextEntity ? (nextEntity.item?.title || nextEntity.title || 'Next block') : 'End of chapter';
    return `<article class="route-gate ${p.total && p.read === p.total ? 'complete' : ''}" id="${gate.id}">
      <div class="gate-ribbon">EVENT GATE</div>
      <div class="item-card-title">${priorityBadge(item.priority)}<span class="badge badge-role">${escapeHtml(item.role)}</span></div>
      <h4>${escapeHtml(item.title)}</h4>
      <p class="item-summary">${escapeHtml(item.summary)}</p>
      ${renderLock(item)}
      ${renderProgressBar(p.percent)}
      <div class="phase-counts"><span><strong>${p.read}</strong> read</span><span><strong>${p.left}</strong> left</span><span><strong>${p.total}</strong> unique event issues</span></div>
      <p class="route-switch"><strong>Resume after the event:</strong> ${escapeHtml(nextLabel)}</p>
      <div class="card-actions"><button class="btn primary" data-toggle-segment="${gate.id}">${open ? 'Close event issues' : 'Open event issues'}</button><button class="btn" data-mark-segment="${gate.id}" data-value="${p.total && p.read === p.total ? 'unread' : 'read'}">${p.total && p.read === p.total ? 'Clear event' : 'Mark event read'}</button><button class="btn ghost" data-open-run="${item.id}">Open full event</button></div>
      ${open ? `<div class="route-issue-panel">${item.sections.filter(section => includedRecommendation(section.recommendation)).map(section => `<section class="issue-section"><div class="issue-section-head"><div><div class="item-card-title">${priorityBadge(section.recommendation)}<span class="badge badge-role">${escapeHtml(section.role)}</span></div><h5>${escapeHtml(section.label)}</h5>${section.note ? `<p>${escapeHtml(section.note)}</p>` : ''}</div></div><div class="issue-grid">${section.issueIds.filter(id => gate.issueIds.includes(id)).map(renderIssueRow).join('')}</div></section>`).join('')}</div>` : ''}
    </article>`;
  }

  function renderRouteChapter(phase, chapter) {
    const flow = chapterFlow(phase.id, chapter);
    if (!flow.length) return '';
    const p = routeChapterProgress(flow);
    return `<section class="route-chapter" id="chapter-${chapter.id}">
      <div class="chapter-heading"><div><span class="badge badge-role">${escapeHtml(phase.short)}</span><h3>${escapeHtml(chapter.title)}</h3><p>${escapeHtml(chapter.subtitle)}</p></div><div class="phase-summary">${p.read}/${p.total} read<br>${p.left} remaining</div></div>
      <div class="chapter-progress">${renderProgressBar(p.percent)}</div>
      <div class="route-flow">${flow.map((entity, index) => entity.item?.kind === 'event' ? renderRouteGate(entity, flow[index + 1]) : renderRouteSegment(entity, flow[index + 1])).join('')}</div>
    </section>`;
  }

  function renderRouteLanePicker() {
    const choices = (DATA.routeConfig?.laneChoices || []).map(id => roadmapsById[id]).filter(Boolean);
    const selected = new Set(settings.routeLanes || []);
    return `<div class="lane-picker"><div class="lane-picker-head"><div><strong>Active reading lanes</strong><p>Choose which character and team routes are woven into Master Flow. Event gates remain visible.</p></div><button class="btn ghost" data-reset-lanes>Reset core lanes</button></div><div class="lane-chip-grid">${choices.map(roadmap => `<button class="lane-chip ${selected.has(roadmap.id) ? 'active' : ''}" data-route-lane="${roadmap.id}">${escapeHtml(roadmap.title)}</button>`).join('')}</div></div>`;
  }

  function renderMaster() {
    const selected = filters.master.phase;
    const phases = selected === 'all' ? DATA.phases : DATA.phases.filter(phase => phase.id === selected);
    const totalBlocks = phases.reduce((count, phase) => count + (DATA.routeConfig?.chapterWindows?.[phase.id] || []).reduce((sum, chapter) => sum + chapterFlow(phase.id, chapter).length, 0), 0);
    document.getElementById('master').innerHTML = `${renderViewHeader('Guided interleaving', 'Master Flow', 'Read 6–12 issue blocks, switch lanes, and stop at event gates exactly where they interrupt the surrounding runs. Optional material stays on character pages unless Expanded Route is selected.', `<div class="kpi"><span class="label">Visible reading blocks</span><strong>${totalBlocks}</strong><small>Canonical shared issues are shown only once per phase</small></div>`)}
      ${renderPhaseTabs(selected)}
      ${renderRouteLanePicker()}
      <div class="route-notice"><strong>How this route works:</strong> Finish a short block, switch to another character or team, then return later. Events own their crossover chapters so the same issue is not repeated under every affected run.</div>
      ${phases.map(phase => `<section class="phase-route"><div class="phase-heading"><div><span class="badge badge-role">${phase.short}</span><h2>${escapeHtml(phase.title)}</h2><p>${escapeHtml(phase.years)} · ${escapeHtml(phase.description)}</p></div><div class="phase-summary">${phaseProgress(phase.id).read}/${phaseProgress(phase.id).total}<br>${phaseProgress(phase.id).left} left</div></div>${(DATA.routeConfig?.chapterWindows?.[phase.id] || []).map(chapter => renderRouteChapter(phase, chapter)).join('')}</section>`).join('')}`;
  }

  function renderPhases() {
    document.getElementById('phases').innerHTML = `${renderViewHeader('Jump navigation', 'Phases', 'Open any era directly. Every total uses unique published issue IDs, so crossovers are never counted twice.')}
      <div class="phase-grid">${DATA.phases.map(phase => {
        const p = phaseProgress(phase.id);
        const top = phaseItems(phase.id).filter(itemVisibleByMode).sort(sortItems).slice(0, 5);
        return `<article class="phase-card"><div class="phase-card-top"><div><span class="badge badge-role">${phase.short}</span><h4>${escapeHtml(phase.title)}</h4><p>${escapeHtml(phase.years)} · ${escapeHtml(phase.description)}</p></div><strong>${p.percent}%</strong></div>${renderProgressBar(p.percent)}<div class="phase-counts"><span><strong>${p.read}</strong> read</span><span><strong>${p.left}</strong> left</span><span><strong>${p.total}</strong> unique</span></div><div class="hero-actions"><button class="btn primary" data-open-phase="${phase.id}">Open in Master Flow</button></div><div class="item-meta">${top.map(item => item.title).join(' · ')}</div></article>`;
      }).join('')}</div>`;
  }

  function roadmapTabItems(roadmapId, tab) {
    const all = roadmapItems(roadmapId);
    if (tab === 'optional') return all.filter(item => item.priority === 'Optional' && item.kind !== 'event');
    if (tab === 'events') return all.filter(item => item.kind === 'event');
    if (tab === 'stories') return all.filter(item => item.categories.includes('Great Stories') || item.page === 'elseworlds');
    return all.filter(item => item.kind !== 'event' && ['Peak', 'Essential', 'Recommended', 'Current'].includes(item.priority) && item.page !== 'elseworlds');
  }

  function renderRoadmapFamilies() {
    const families = DATA.roadmapFamilies || [];
    return `<div class="roadmap-families"><button class="phase-tab ${activeRoadmapFamily === 'all' ? 'active' : ''}" data-roadmap-family="all">All roadmaps</button>${families.map(family => `<button class="phase-tab ${activeRoadmapFamily === family.id ? 'active' : ''}" data-roadmap-family="${family.id}">${escapeHtml(family.title)}</button>`).join('')}</div>`;
  }

  function familyRoadmaps() {
    if (activeRoadmapFamily === 'all') return DATA.roadmaps.filter(r => r.id !== 'ultimate');
    const family = (DATA.roadmapFamilies || []).find(entry => entry.id === activeRoadmapFamily);
    if (!family) return DATA.roadmaps.filter(r => r.id !== 'ultimate');
    return family.roadmapIds.map(id => roadmapsById[id]).filter(Boolean);
  }

  function renderRoadmaps() {
    const roadmap = roadmapsById[activeRoadmap] || DATA.roadmaps[0];
    const base = roadmapTabItems(roadmap.id, activeRoadmapTab);
    const filtered = filterItems(base, 'roadmaps', { ignoreMode: true });
    const mainIds = [...new Set(roadmapTabItems(roadmap.id, 'main').flatMap(item => item.sections.filter(section => rank(section.recommendation) <= 3).flatMap(section => section.issueIds)).filter(isPublished))];
    const read = mainIds.filter(isRead).length;
    const percent = mainIds.length ? Math.round(read / mainIds.length * 100) : 0;
    const tabs = [
      ['main', 'Main Route'],
      ['optional', 'Worthwhile Optional'],
      ['events', 'Events & Crossovers'],
      ['stories', 'Great Stories']
    ];
    document.getElementById('roadmaps').innerHTML = `${renderViewHeader('Character and team lanes', roadmap.title, roadmap.description, `<div class="kpi"><span class="label">Main-route progress</span><strong>${percent}%</strong><small>${read}/${mainIds.length} unique issues · ${Math.max(0, mainIds.length - read)} left</small></div>`)}
      ${renderRoadmapFamilies()}
      <div class="roadmap-grid">${familyRoadmaps().map(r => { const rp = roadmapProgress(r.id); return `<button class="roadmap-card ${r.id === roadmap.id ? 'active' : ''}" data-roadmap="${r.id}"><h4>${escapeHtml(r.title)}</h4><p>${rp.read}/${rp.total} · ${rp.left} left</p></button>`; }).join('')}</div>
      <div class="roadmap-tabs">${tabs.map(([id, label]) => `<button class="phase-tab ${activeRoadmapTab === id ? 'active' : ''}" data-roadmap-tab="${id}">${label}</button>`).join('')}</div>
      <div class="route-notice">${activeRoadmapTab === 'main' ? 'Only Peak, Essential, Recommended and current material appears here.' : activeRoadmapTab === 'optional' ? 'Strong supporting material that stays out of the central Master Flow.' : activeRoadmapTab === 'events' ? 'Shared crossover issues update this roadmap, Events and every other connected character page together.' : 'Standalones and alternate-world stories that are excellent without being required continuity.'}</div>
      ${renderFilters('roadmaps', base, { noPhase: activeRoadmapTab === 'stories' })}
      ${activeRoadmapTab === 'stories' ? renderStandaloneGroup('Great Stories', 'Strong standalones and alternate worlds linked to this character.', filtered) : renderGroupedByPhase(filtered, { showLocks: activeRoadmapTab === 'events' })}`;
  }

  function renderEvents() {
    const base = DATA.events.map(id => itemsById[id]).filter(item => item && item.page === 'main');
    const filtered = filterItems(base, 'events');
    document.getElementById('events').innerHTML = `${renderViewHeader('Structured event gates', 'Events', 'Every event separates prelude, core chapters, character tie-ins, optional expansion and epilogue. Locks are advisory, never compulsory.')}${renderPhaseTabs(filters.events.phase)}${renderFilters('events', base)}${renderGroupedByPhase(filtered, { showLocks: true })}`;
  }

  function renderStories() {
    const base = DATA.items.filter(item => item.page === 'main' && item.categories.includes('Great Stories'));
    const filtered = filterItems(base, 'stories');
    document.getElementById('stories').innerHTML = `${renderViewHeader('Curated masterpieces', 'Great Stories', 'Peak standalones and compact runs that deserve a place even when they are not required continuity.')}${renderFilters('stories', base)}${renderGroupedByPhase(filtered)}`;
  }

  function itemUniverses(item) {
    const set = new Set();
    item.sections.forEach(section => section.issueIds.forEach(id => set.add(issuesById[id]?.universe || 'Unknown')));
    return [...set];
  }

  function renderUltimate() {
    const base = DATA.items.filter(item => item.page === 'ultimate');
    const filtered = filterItems(base, 'ultimate', { ignoreMode: false });
    const earth1610 = filtered.filter(item => itemUniverses(item).some(u => u === 'Earth-1610'));
    const earth6160 = filtered.filter(item => itemUniverses(item).some(u => u === 'Earth-6160'));
    document.getElementById('ultimate').innerHTML = `${renderViewHeader('Separate universe library', 'Ultimate Universe', 'Earth-1610 and Earth-6160 remain isolated from the main phase counters. Their crossover with Secret Wars is still linked through canonical event records.')}${renderFilters('ultimate', base, { noPhase: true })}
      <div class="phase-section"><div class="phase-heading"><div><span class="badge badge-role">Earth-1610</span><h3>Original Ultimate Universe</h3><p>2000–2015</p></div></div><div class="item-list">${earth1610.map(item => renderItemCard(item)).join('') || '<div class="empty-state">No matching Earth-1610 entries.</div>'}</div></div>
      <div class="phase-section"><div class="phase-heading"><div><span class="badge badge-role">Earth-6160</span><h3>New Ultimate Universe</h3><p>2023–2026</p></div></div><div class="item-list">${earth6160.map(item => renderItemCard(item)).join('') || '<div class="empty-state">No matching Earth-6160 entries.</div>'}</div></div>`;
  }

  function renderElseworlds() {
    const base = DATA.items.filter(item => item.page === 'elseworlds');
    const filtered = filterItems(base, 'elseworlds', { ignoreMode: false });
    const alternate = filtered.filter(item => !item.categories.includes('Crossover') || item.categories.includes('Elseworlds') || item.categories.includes('MAX'));
    const marvelDc = filtered.filter(item => item.categories.includes('Marvel/DC'));
    const other = filtered.filter(item => item.categories.includes('Image/DC'));
    document.getElementById('elseworlds').innerHTML = `${renderViewHeader('Outside the main timeline', 'Elseworlds & Crossovers', 'This page has no phase requirements. Alternate worlds, MAX books and intercompany crossovers are tracked independently.')}${renderFilters('elseworlds', base, { noPhase: true })}
      ${renderStandaloneGroup('Alternate Marvel Worlds', 'Elseworlds, MAX and retellings.', alternate)}
      ${renderStandaloneGroup('Marvel/DC Crossovers', 'The major meetings between both universes.', marvelDc)}
      ${renderStandaloneGroup('Other Publisher Crossovers', 'Important crossovers that do not belong to Marvel continuity.', other)}`;
  }

  function renderStandaloneGroup(title, text, items) {
    if (!items.length) return '';
    return `<section class="phase-section"><div class="phase-heading"><div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></div></div><div class="item-list">${items.map(item => renderItemCard(item)).join('')}</div></section>`;
  }

  function renderStats() {
    const phaseRows = DATA.phases.map(phase => { const p = phaseProgress(phase.id); return `<tr><td>${phase.short}</td><td>${escapeHtml(phase.title)}</td><td>${p.read}</td><td>${p.left}</td><td>${p.total}</td><td>${p.percent}%</td></tr>`; }).join('');
    const roadmapRows = DATA.roadmaps.map(roadmap => { const p = roadmapProgress(roadmap.id); return `<tr><td>${escapeHtml(roadmap.title)}</td><td>${p.read}</td><td>${p.left}</td><td>${p.total}</td><td>${p.percent}%</td></tr>`; }).join('');
    const readRecords = Object.values(progress).filter(record => record.read);
    const ratings = readRecords.map(record => Number(record.rating)).filter(value => Number.isFinite(value) && value > 0);
    const average = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : '—';
    document.getElementById('stats').innerHTML = `${renderViewHeader('Progress analytics', 'Stats', 'All numbers are calculated from unique canonical issue IDs.')}
      <div class="kpi-grid">${renderKpi('Issues read', readRecords.length, 'Across every universe and route')}${renderKpi('Rated issues', ratings.length, `Average rating: ${average}`)}${renderKpi('Owned issues marked', Object.values(progress).filter(r => r.ownership && r.ownership !== 'none').length, 'Physical, digital or both')}${renderKpi('Wishlist issues', Object.values(progress).filter(r => r.wishlist).length, 'Marked for future purchase')}</div>
      <div class="section-title"><h4>Phase completion</h4></div><table class="stat-table"><thead><tr><th>Phase</th><th>Title</th><th>Read</th><th>Left</th><th>Total</th><th>Complete</th></tr></thead><tbody>${phaseRows}</tbody></table>
      <div class="section-title"><h4>Roadmap completion</h4></div><table class="stat-table"><thead><tr><th>Roadmap</th><th>Read</th><th>Left</th><th>Total</th><th>Complete</th></tr></thead><tbody>${roadmapRows}</tbody></table>`;
  }

  function renderSettings() {
    const v = DATA.validation;
    document.getElementById('settings').innerHTML = `${renderViewHeader('Backup and data health', 'Settings', 'Progress is stored per canonical issue in IndexedDB, with a LocalStorage fallback.')}
      <div class="settings-grid">
        <article class="settings-card"><h4>Appearance</h4><p>Switch between dark and light themes.</p><div class="hero-actions"><button class="btn ${settings.theme === 'dark' ? 'primary' : ''}" data-set-theme="dark">Dark</button><button class="btn ${settings.theme === 'light' ? 'primary' : ''}" data-set-theme="light">Light</button></div></article>
        <article class="settings-card"><h4>Backup progress</h4><p>Export issue progress, ratings, notes, ownership and settings as JSON.</p><div class="hero-actions"><button class="btn primary" data-export>Export backup</button><label class="btn">Import backup<input type="file" id="importFile" accept="application/json" hidden></label></div></article>
        <article class="settings-card"><h4>Legacy v2 migration</h4><p>Best-effort migration of old card-based checkmarks into canonical issue IDs. Ambiguous labels are skipped rather than guessed.</p><button class="btn" data-migrate>Run migration</button><div id="migrationResult"></div></article>
        <article class="settings-card"><h4>Reset</h4><p>Delete all issue progress from this browser. Export first if you may want it later.</p><button class="btn danger" data-reset>Reset all progress</button></article>
        <article class="settings-card"><h4>Catalogue audit</h4><p>${v.counts.items} items · ${v.counts.series} series · ${v.counts.issues.toLocaleString()} canonical issues · ${v.counts.events} events.</p><p><strong>${v.errors.length}</strong> errors and <strong>${v.warnings.length}</strong> warnings.</p>${v.errors.length || v.warnings.length ? `<ul class="audit-list">${[...v.errors, ...v.warnings].map(msg => `<li>${escapeHtml(msg)}</li>`).join('')}</ul>` : '<span class="badge badge-verified">Audit clean</span>'}</article>
        <article class="settings-card"><h4>Data version</h4><p>Schema ${DATA.schemaVersion}<br>${escapeHtml(DATA.dataVersion)}</p><p>Ongoing and solicited issues are visibly separated; only published issues affect completion.</p></article>
      </div>`;
  }

  function renderLock(item) {
    const lock = lockState(item);
    if (!lock) return '';
    const label = lock.state === 'ready' ? 'Ready' : lock.state === 'partial' ? 'Partially ready' : 'Missing setup';
    const cls = lock.state === 'ready' ? 'lock-ready' : lock.state === 'partial' ? 'lock-partial' : 'lock-missing';
    return `<div class="lock-panel ${cls}"><strong>${label}</strong>${lock.missing.length ? `<div>Missing: ${lock.missing.map(m => `<button class="btn ghost" data-jump-item="${m.id}">${escapeHtml(m.item.title)}</button>`).join(' ')}</div>` : '<div>All listed prerequisites are complete.</div>'}</div>`;
  }

  function renderItemCard(item, options = {}) {
    const p = itemProgress(item);
    const isOpen = openItems.has(item.id);
    const compact = options.compact;
    const phase = phasesById[item.phaseId];
    const sharedCount = new Set(item.sections.flatMap(section => section.issueIds.filter(id => (issueToItems[id] || []).length > 1))).size;
    return `<article class="item-card ${p.status === 'complete' ? 'complete' : ''}" id="item-${item.id}">
      <div class="item-card-header"><div><div class="item-card-title">${priorityBadge(item.priority)}<span class="badge badge-role">${escapeHtml(item.role)}</span>${auditBadge(item.auditStatus)}${phase ? `<span class="badge badge-role">${escapeHtml(phase.short)}</span>` : ''}</div><h4>${escapeHtml(item.title)}</h4><div class="item-meta"><span>${escapeHtml(item.writer)}</span>${item.years ? `<span>· ${escapeHtml(item.years)}</span>` : ''}<span>· ${item.sections.length} sections</span>${sharedCount ? `<span>· ${sharedCount} shared crossover issues</span>` : ''}</div><p class="item-summary">${escapeHtml(item.summary)}</p>${item.note ? `<p class="item-note"><strong>Reading note:</strong> ${escapeHtml(item.note)}</p>` : ''}${options.showLocks || item.kind === 'event' ? renderLock(item) : ''}</div>
      <div class="item-right"><span class="progress-label">${p.read}/${p.total} route issues · ${p.status}</span>${renderProgressBar(p.percent)}<div class="card-actions"><button class="btn primary" ${compact ? `data-jump-item="${item.id}"` : `data-toggle-item="${item.id}"`}>${compact ? 'Open in context' : (isOpen ? 'Close issues' : 'Open issues')}</button><button class="btn" data-mark-item="${item.id}" data-value="${p.status === 'complete' ? 'unread' : 'read'}">${p.status === 'complete' ? 'Mark unread' : 'Mark route read'}</button></div></div></div>
      ${compact ? '' : `<div class="item-details ${isOpen ? 'open' : ''}">${isOpen ? renderItemDetails(item) : ''}</div>`}
    </article>`;
  }

  function renderItemDetails(item) {
    return `<div class="detail-grid">${item.sections.map((section, sectionIndex) => renderIssueSection(item, section, sectionIndex)).join('')}</div>`;
  }

  function renderIssueSection(item, section, sectionIndex) {
    const p = sectionProgress(section);
    return `<section class="issue-section"><div class="issue-section-head"><div><div class="item-card-title">${priorityBadge(section.recommendation)}<span class="badge badge-role">${escapeHtml(section.role)}</span></div><h5>${escapeHtml(section.label)}</h5>${section.note ? `<p>${escapeHtml(section.note)}</p>` : ''}</div><div class="issue-section-controls"><span class="progress-label">${p.read}/${p.total}</span><button class="btn" data-mark-section="${item.id}" data-section="${sectionIndex}" data-value="${p.total && p.read === p.total ? 'unread' : 'read'}">${p.total && p.read === p.total ? 'Clear' : 'Mark read'}</button></div></div><div class="issue-grid">${section.issueIds.map(issueId => renderIssueRow(issueId)).join('')}</div></section>`;
  }

  function renderIssueRow(issueId) {
    const issue = issuesById[issueId];
    const record = getIssueRecord(issueId);
    const solicited = issue.status === 'solicited';
    const shared = (issueToItems[issueId] || []).length;
    return `<label class="issue-row ${solicited ? 'solicited' : ''}" title="${escapeAttr(issue.note || '')}"><input type="checkbox" data-issue-check="${issueId}" ${record.read ? 'checked' : ''} ${solicited ? 'disabled' : ''}><span class="issue-name">${escapeHtml(issue.displayTitle)}${solicited ? ' · upcoming' : ''}</span><button type="button" class="issue-info-btn" data-issue-info="${issueId}" title="Issue details${shared > 1 ? ` · shared by ${shared} records` : ''}">⋯</button></label>`;
  }

  async function markIssue(issueId, read) {
    const record = { ...getIssueRecord(issueId), issueId, read, readAt: read ? (getIssueRecord(issueId).readAt || new Date().toISOString().slice(0, 10)) : '' };
    await persistRecords([record]);
  }

  async function markIssues(issueIds, read) {
    const records = [...new Set(issueIds)].filter(isPublished).map(issueId => ({ ...getIssueRecord(issueId), issueId, read, readAt: read ? (getIssueRecord(issueId).readAt || new Date().toISOString().slice(0, 10)) : '' }));
    await persistRecords(records);
  }

  function renderCurrentView() {
    document.getElementById('dataVersion').textContent = DATA.dataVersion;
    switch (currentView) {
      case 'dashboard': renderDashboard(); break;
      case 'master': renderMaster(); break;
      case 'phases': renderPhases(); break;
      case 'roadmaps': renderRoadmaps(); break;
      case 'events': renderEvents(); break;
      case 'stories': renderStories(); break;
      case 'ultimate': renderUltimate(); break;
      case 'elseworlds': renderElseworlds(); break;
      case 'stats': renderStats(); break;
      case 'settings': renderSettings(); break;
      default: renderDashboard();
    }
  }

  function rerenderPreservingScroll() {
    const y = window.scrollY;
    renderCurrentView();
    window.scrollTo(0, y);
  }

  function openIssueDialog(issueId) {
    const issue = issuesById[issueId];
    const record = getIssueRecord(issueId);
    const appearances = (issueToItems[issueId] || []).map(id => itemsById[id]).filter(Boolean);
    document.getElementById('issueDialogBody').innerHTML = `<h3>${escapeHtml(issue.displayTitle)}</h3><p class="item-meta">${escapeHtml(issue.universe)} · ${escapeHtml(issue.status)}${appearances.length ? ` · appears in ${appearances.length} records` : ''}</p><div class="dialog-form">
      <label class="check-row"><input type="checkbox" id="dialogRead" ${record.read ? 'checked' : ''} ${issue.status === 'solicited' ? 'disabled' : ''}> Read</label>
      <label>Personal rating<select id="dialogRating"><option value="">Not rated</option>${Array.from({ length: 10 }, (_, i) => i + 1).map(n => `<option value="${n}" ${String(record.rating) === String(n) ? 'selected' : ''}>${n}/10</option>`).join('')}</select></label>
      <label>Ownership<select id="dialogOwnership"><option value="none" ${record.ownership === 'none' ? 'selected' : ''}>Not owned</option><option value="physical" ${record.ownership === 'physical' ? 'selected' : ''}>Physical</option><option value="digital" ${record.ownership === 'digital' ? 'selected' : ''}>Digital</option><option value="both" ${record.ownership === 'both' ? 'selected' : ''}>Both</option></select></label>
      <label class="check-row"><input type="checkbox" id="dialogWishlist" ${record.wishlist ? 'checked' : ''}> Want to buy</label>
      <label>Read date<input type="date" id="dialogReadAt" value="${escapeAttr(record.readAt || '')}"></label>
      <label>Notes<textarea id="dialogNote" rows="5" placeholder="Your notes about this issue…">${escapeHtml(record.note || '')}</textarea></label>
      ${appearances.length ? `<div><strong>Appears in:</strong><div class="hero-actions">${appearances.slice(0, 12).map(item => `<button type="button" class="btn ghost" data-dialog-jump="${item.id}">${escapeHtml(item.title)}</button>`).join('')}</div></div>` : ''}
      <button type="button" class="btn primary" data-save-issue="${issueId}">Save issue details</button>
    </div>`;
    document.getElementById('issueDialog').showModal();
  }

  async function saveIssueDialog(issueId) {
    const existing = getIssueRecord(issueId);
    const record = {
      ...existing,
      issueId,
      read: document.getElementById('dialogRead').checked,
      rating: document.getElementById('dialogRating').value,
      ownership: document.getElementById('dialogOwnership').value,
      wishlist: document.getElementById('dialogWishlist').checked,
      readAt: document.getElementById('dialogReadAt').value,
      note: document.getElementById('dialogNote').value.trim()
    };
    await persistRecords([record]);
    document.getElementById('issueDialog').close();
    toast('Issue details saved');
    rerenderPreservingScroll();
  }

  function showSearchResults(query) {
    const box = document.getElementById('searchResults');
    const q = query.trim().toLowerCase();
    if (q.length < 2) { box.hidden = true; return; }
    const itemMatches = DATA.items.filter(item => [item.title, item.writer, item.summary, item.categories.join(' ')].join(' ').toLowerCase().includes(q)).slice(0, 12);
    const issueMatches = Object.values(issuesById).filter(issue => issue.displayTitle.toLowerCase().includes(q)).slice(0, 12);
    box.innerHTML = `<div class="section-title"><h4>Search results</h4><p>${itemMatches.length + issueMatches.length} shown</p></div>${itemMatches.map(item => `<div class="search-result" data-search-item="${item.id}"><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.writer)} · ${escapeHtml(item.priority)}</small></div>`).join('')}${issueMatches.map(issue => `<div class="search-result" data-search-issue="${issue.id}"><strong>${escapeHtml(issue.displayTitle)}</strong><small>${escapeHtml(issue.universe)} · ${(issueToItems[issue.id] || []).length} linked records</small></div>`).join('') || '<div class="empty-state">No matches.</div>'}`;
    box.hidden = false;
  }

  function jumpToItem(itemId) {
    const item = itemsById[itemId];
    if (!item) return;
    currentView = item.page === 'ultimate' ? 'ultimate' : item.page === 'elseworlds' ? 'elseworlds' : 'master';
    openItems.add(itemId);
    setView(currentView);
    window.setTimeout(() => document.getElementById(`item-${itemId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
  }


  function findRouteEntity(entityId) {
    const { segments, gates } = routeEntities();
    return [...segments, ...gates].find(entity => entity.id === entityId);
  }

  function openRunInRoadmap(itemId) {
    const item = itemsById[itemId];
    if (!item) return;
    if (item.page === 'ultimate') { setView('ultimate'); return; }
    if (item.page === 'elseworlds') { setView('elseworlds'); return; }
    const roadmapId = item.roadmapIds?.find(id => roadmapsById[id]) || activeRoadmap;
    activeRoadmap = roadmapId;
    activeRoadmapTab = item.kind === 'event' ? 'events' : item.priority === 'Optional' ? 'optional' : 'main';
    openItems.add(itemId);
    saveSettings();
    setView('roadmaps');
    window.setTimeout(() => document.getElementById(`item-${itemId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
  }

  function exportBackup() {
    const payload = {
      schemaVersion: DATA.schemaVersion,
      dataVersion: DATA.dataVersion,
      exportedAt: new Date().toISOString(),
      settings,
      progress
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marvel-reading-vault-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importBackup(file) {
    const text = await file.text();
    const payload = JSON.parse(text);
    const imported = payload.progress || payload;
    const records = Object.entries(imported).map(([issueId, record]) => ({ ...record, issueId: record.issueId || issueId })).filter(record => issuesById[record.issueId]);
    await persistRecords(records);
    if (payload.settings) {
      settings = { ...settings, ...payload.settings };
      applyTheme(settings.theme);
      document.getElementById('routeMode').value = settings.routeMode;
    }
    toast(`Imported ${records.length} issue records`);
    renderCurrentView();
  }

  function normalizeLegacyLabel(text) {
    return String(text).toLowerCase().replace(/\(\d{4}\)/g, '').replace(/[^a-z0-9.]+/g, ' ').replace(/\s+/g, ' ').trim();
  }

  async function migrateLegacy() {
    let legacy = null;
    for (const key of OLD_PROGRESS_KEYS) {
      try { legacy = JSON.parse(safeLocalGet(key, 'null') || 'null'); }
      catch { legacy = null; }
      if (legacy) break;
    }
    if (!legacy) { toast('No legacy v2 progress was found'); return { migrated: 0, unresolved: 0 }; }
    const normalizedIndex = {};
    Object.values(issuesById).forEach(issue => {
      const key = normalizeLegacyLabel(issue.displayTitle);
      if (!normalizedIndex[key]) normalizedIndex[key] = [];
      normalizedIndex[key].push(issue.id);
    });
    const records = [];
    let unresolved = 0;
    Object.values(legacy).forEach(entry => {
      Object.entries(entry.parts || {}).forEach(([label, checked]) => {
        if (!checked) return;
        const matches = normalizedIndex[normalizeLegacyLabel(label)] || [];
        if (matches.length === 1) records.push({ ...getIssueRecord(matches[0]), issueId: matches[0], read: true, readAt: '' });
        else unresolved += 1;
      });
    });
    await persistRecords(records);
    toast(`Migrated ${records.length} checkmarks; ${unresolved} ambiguous labels skipped`);
    return { migrated: records.length, unresolved };
  }

  document.addEventListener('click', async event => {
    const nav = event.target.closest('[data-view]');
    if (nav) { setView(nav.dataset.view); return; }
    const targetView = event.target.closest('[data-view-target]');
    if (targetView) { setView(targetView.dataset.viewTarget); return; }
    const toggleSegment = event.target.closest('[data-toggle-segment]');
    if (toggleSegment) { const id = toggleSegment.dataset.toggleSegment; openRouteSegments.has(id) ? openRouteSegments.delete(id) : openRouteSegments.add(id); rerenderPreservingScroll(); return; }
    const markSegment = event.target.closest('[data-mark-segment]');
    if (markSegment) { const entity = findRouteEntity(markSegment.dataset.markSegment); if (entity) await markIssues(entity.issueIds, markSegment.dataset.value === 'read'); rerenderPreservingScroll(); return; }
    const openRun = event.target.closest('[data-open-run]');
    if (openRun) { openRunInRoadmap(openRun.dataset.openRun); return; }
    const routeLane = event.target.closest('[data-route-lane]');
    if (routeLane) {
      const id = routeLane.dataset.routeLane;
      const lanes = new Set(settings.routeLanes || []);
      lanes.has(id) ? lanes.delete(id) : lanes.add(id);
      settings.routeLanes = [...lanes];
      saveSettings();
      renderMaster();
      return;
    }
    if (event.target.closest('[data-reset-lanes]')) {
      settings.routeLanes = [...(DATA.routeConfig?.defaultLanes || [])];
      saveSettings();
      renderMaster();
      return;
    }
    const roadmapTab = event.target.closest('[data-roadmap-tab]');
    if (roadmapTab) { activeRoadmapTab = roadmapTab.dataset.roadmapTab; saveSettings(); renderRoadmaps(); return; }
    const roadmapFamily = event.target.closest('[data-roadmap-family]');
    if (roadmapFamily) { activeRoadmapFamily = roadmapFamily.dataset.roadmapFamily; saveSettings(); renderRoadmaps(); return; }
    const toggle = event.target.closest('[data-toggle-item]');
    if (toggle) { const id = toggle.dataset.toggleItem; openItems.has(id) ? openItems.delete(id) : openItems.add(id); rerenderPreservingScroll(); return; }
    const issueCheck = event.target.closest('[data-issue-check]');
    if (issueCheck) { await markIssue(issueCheck.dataset.issueCheck, issueCheck.checked); rerenderPreservingScroll(); return; }
    const markItem = event.target.closest('[data-mark-item]');
    if (markItem) { const item = itemsById[markItem.dataset.markItem]; await markIssues(itemIssueIds(item), markItem.dataset.value === 'read'); toast(markItem.dataset.value === 'read' ? 'Route issues marked read' : 'Route issues cleared'); rerenderPreservingScroll(); return; }
    const markSection = event.target.closest('[data-mark-section]');
    if (markSection) { const item = itemsById[markSection.dataset.markSection]; const section = item.sections[Number(markSection.dataset.section)]; await markIssues(section.issueIds, markSection.dataset.value === 'read'); rerenderPreservingScroll(); return; }
    const issueInfo = event.target.closest('[data-issue-info]');
    if (issueInfo) { event.preventDefault(); openIssueDialog(issueInfo.dataset.issueInfo); return; }
    const saveIssue = event.target.closest('[data-save-issue]');
    if (saveIssue) { await saveIssueDialog(saveIssue.dataset.saveIssue); return; }
    const dialogJump = event.target.closest('[data-dialog-jump]');
    if (dialogJump) { document.getElementById('issueDialog').close(); jumpToItem(dialogJump.dataset.dialogJump); return; }
    const phaseButton = event.target.closest('[data-open-phase]');
    if (phaseButton) { filters.master.phase = phaseButton.dataset.openPhase; settings.masterPhase = filters.master.phase; saveSettings(); setView('master'); return; }
    const phaseFilter = event.target.closest('[data-phase-filter]');
    if (phaseFilter) { const key = currentView === 'events' ? 'events' : 'master'; filters[key].phase = phaseFilter.dataset.phaseFilter; if (key === 'master') { settings.masterPhase = filters[key].phase; saveSettings(); } renderCurrentView(); return; }
    const roadButton = event.target.closest('[data-roadmap], [data-open-roadmap]');
    if (roadButton) { const roadmapId = roadButton.dataset.roadmap || roadButton.dataset.openRoadmap; if (roadmapId === 'ultimate') { setView('ultimate'); return; } activeRoadmap = roadmapId; activeRoadmapTab = 'main'; saveSettings(); setView('roadmaps'); return; }
    const jump = event.target.closest('[data-jump-item]');
    if (jump) { jumpToItem(jump.dataset.jumpItem); return; }
    const theme = event.target.closest('[data-set-theme]');
    if (theme) { applyTheme(theme.dataset.setTheme); renderSettings(); return; }
    if (event.target.closest('[data-export]')) { exportBackup(); return; }
    if (event.target.closest('[data-migrate]')) { const result = await migrateLegacy(); const box = document.getElementById('migrationResult'); if (box) box.innerHTML = `<p>${result.migrated} migrated · ${result.unresolved} unresolved</p>`; renderCurrentView(); return; }
    if (event.target.closest('[data-reset]')) { if (confirm('Delete all Marvel Reading Vault progress from this browser?')) { await clearProgress(); toast('All progress reset'); renderCurrentView(); } return; }
    const searchItem = event.target.closest('[data-search-item]');
    if (searchItem) { document.getElementById('searchResults').hidden = true; document.getElementById('globalSearch').value = ''; jumpToItem(searchItem.dataset.searchItem); return; }
    const searchIssue = event.target.closest('[data-search-issue]');
    if (searchIssue) { document.getElementById('searchResults').hidden = true; document.getElementById('globalSearch').value = ''; openIssueDialog(searchIssue.dataset.searchIssue); return; }
  });

  document.addEventListener('input', event => {
    const filter = event.target.closest('[data-filter-key]');
    if (filter) {
      const key = filter.dataset.filterKey;
      const name = filter.dataset.filterName;
      const selectionStart = typeof filter.selectionStart === 'number' ? filter.selectionStart : null;
      filters[key][name] = filter.value;
      renderCurrentView();
      requestAnimationFrame(() => {
        const replacement = document.querySelector(`[data-filter-key="${key}"][data-filter-name="${name}"]`);
        if (replacement) {
          replacement.focus();
          if (selectionStart !== null && replacement.setSelectionRange) replacement.setSelectionRange(selectionStart, selectionStart);
        }
      });
      return;
    }
    if (event.target.id === 'globalSearch') showSearchResults(event.target.value);
  });

  document.addEventListener('change', async event => {
    if (event.target.id === 'routeMode') {
      settings.routeMode = event.target.value;
      saveSettings();
      renderCurrentView();
    }
    if (event.target.id === 'importFile' && event.target.files?.[0]) {
      try { await importBackup(event.target.files[0]); }
      catch (error) { alert(`Could not import backup: ${error.message}`); }
      event.target.value = '';
    }
  });

  document.getElementById('menuBtn').addEventListener('click', () => document.getElementById('sidebar').classList.toggle('open'));
  document.getElementById('themeToggle').addEventListener('click', () => applyTheme(settings.theme === 'dark' ? 'light' : 'dark'));
  document.addEventListener('click', event => {
    if (!event.target.closest('.global-search') && !event.target.closest('.search-results')) document.getElementById('searchResults').hidden = true;
  });

  async function init() {
    await loadProgress();
    activeRoadmap = settings.activeRoadmap || 'x-men';
    activeRoadmapTab = settings.activeRoadmapTab || 'main';
    activeRoadmapFamily = settings.activeRoadmapFamily || 'all';
    document.getElementById('routeMode').value = settings.routeMode;
    applyTheme(settings.theme);
    renderCurrentView();
  }

  init().catch(error => {
    console.error(error);
    document.getElementById('dashboard').innerHTML = `<div class="empty-state">The tracker could not start: ${escapeHtml(error.message)}</div>`;
  });
})();

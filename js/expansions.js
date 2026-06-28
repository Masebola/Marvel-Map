/* Marvel Reading Vault v4 expansions
   Curated family roadmaps + interleaved route configuration.
   Loaded after catalog.js and before app.js.
*/
(function () {
  'use strict';

  const D = window.MARVEL_VAULT;
  if (!D) throw new Error('Base Marvel catalogue must load before expansions.js');

  const slug = value => String(value)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  function ensureSeries(title, year, universe = 'Earth-616', opts = {}) {
    const id = opts.id || `${slug(universe)}-${slug(title)}-${year}`;
    if (!D.series[id]) {
      D.series[id] = {
        id,
        title,
        startYear: year,
        universe,
        displayYear: opts.displayYear !== false,
        status: opts.status || 'ended',
        publisher: opts.publisher || 'Marvel',
        note: opts.note || ''
      };
    }
    return id;
  }

  function ensureIssue(seriesId, number, meta = {}) {
    const numberText = String(number);
    const id = `${seriesId}--${slug(numberText) || 'one-shot'}`;
    const s = D.series[seriesId];
    if (!s) throw new Error(`Unknown series: ${seriesId}`);
    if (!D.issues[id]) {
      const isAnnual = /^annual\s/i.test(numberText);
      D.issues[id] = {
        id,
        seriesId,
        number: numberText,
        displayTitle: meta.displayTitle || `${s.title}${s.displayYear ? ` (${s.startYear})` : ''}${isAnnual ? ` ${numberText.replace(/^annual\s*/i, 'Annual #')}` : ` #${numberText}`}`,
        universe: s.universe,
        publicationDate: meta.publicationDate || '',
        status: meta.status || 'published',
        storyTitle: meta.storyTitle || '',
        note: meta.note || ''
      };
    }
    return id;
  }

  const range = (seriesId, start, end, meta = {}) => {
    const result = [];
    for (let n = start; n <= end; n += 1) result.push(ensureIssue(seriesId, n, meta));
    return result;
  };
  const list = (seriesId, numbers, meta = {}) => numbers.map(number => ensureIssue(seriesId, number, meta));
  const oneShot = (title, year, universe = 'Earth-616', opts = {}) => {
    const sid = ensureSeries(title, year, universe, { displayYear: opts.displayYear !== false, status: opts.status || 'ended' });
    return ensureIssue(sid, opts.number || 1, { displayTitle: opts.displayTitle || `${title} (${year})`, status: opts.status || 'published' });
  };
  const section = (label, recommendation, role, issueIds, note = '') => ({ label, recommendation, role, issueIds: [...new Set(issueIds)], note });

  function addItem(def) {
    if (D.items.some(item => item.id === def.id)) return def.id;
    const item = {
      id: def.id,
      kind: def.kind || 'run',
      title: def.title,
      subtitle: def.subtitle || '',
      phaseId: def.phaseId || null,
      priority: def.priority || 'Recommended',
      role: def.role || 'Main Run',
      writer: def.writer || 'Various',
      artists: def.artists || [],
      years: def.years || '',
      summary: def.summary || '',
      note: def.note || '',
      categories: def.categories || [],
      roadmapIds: def.roadmapIds || [],
      sections: def.sections || [],
      prerequisites: def.prerequisites || [],
      next: def.next || [],
      page: def.page || 'main',
      auditStatus: def.auditStatus || 'Verified',
      order: Number.isFinite(def.order) ? def.order : 999,
      tags: def.tags || [],
      hiddenByDefault: Boolean(def.hiddenByDefault),
      current: Boolean(def.current),
      routeEligible: def.routeEligible !== false,
      routeIssueIds: def.routeIssueIds || null
    };
    D.items.push(item);
    if (item.kind === 'event' && !D.events.includes(item.id)) D.events.push(item.id);
    return item.id;
  }

  function addRoadmap(id, title, description, family = '') {
    if (!D.roadmaps.some(roadmap => roadmap.id === id)) D.roadmaps.push({ id, title, description, family });
  }

  function attach(itemId, update) {
    const item = D.items.find(entry => entry.id === itemId);
    if (!item) return;
    if (update.roadmapIds) item.roadmapIds = [...new Set([...(item.roadmapIds || []), ...update.roadmapIds])];
    if (update.categories) item.categories = [...new Set([...(item.categories || []), ...update.categories])];
    Object.entries(update).forEach(([key, value]) => {
      if (!['roadmapIds', 'categories'].includes(key)) item[key] = value;
    });
  }

  /* =========================
     ROADMAP REGISTRY EXPANSION
     ========================= */
  [
    ['she-hulk', 'She-Hulk', 'Byrne, Slott, Soule and Rowell, with the strongest Fantastic Four material.', 'Avengers Family'],
    ['black-widow', 'Black Widow', 'Compact espionage classics through Waid/Samnee and Kelly Thompson.', 'Avengers Family'],
    ['ant-man', 'Ant-Man', 'Hank Pym, Scott Lang and the strongest legacy stories.', 'Avengers Family'],
    ['wasp', 'Wasp', 'Janet van Dyne leadership stories plus Nadia’s worthwhile legacy route.', 'Avengers Family'],
    ['new-mutants', 'New Mutants', 'Claremont foundations, Cable transition and the best modern return.', 'Mutant Family'],
    ['x-force', 'X-Force', 'Cable’s original team, Kyle/Yost and Remender’s defining run.', 'Mutant Family'],
    ['excalibur', 'Excalibur', 'Claremont and Alan Davis at their best, with Rachel and Nightcrawler central.', 'Mutant Family'],
    ['storm', 'Storm', 'Leadership, LifeDeath, Arakko and the strongest solo material.', 'Mutant Family'],
    ['nightcrawler', 'Nightcrawler', 'Swashbuckling classics, Excalibur and Krakoa’s spiritual crisis.', 'Mutant Family'],
    ['emma-frost', 'Emma Frost and Generation X', 'From teacher and manipulator to central X-Men stateswoman.', 'Mutant Family'],
    ['rogue-gambit', 'Rogue and Gambit', 'The strongest solo, relationship and married-era stories.', 'Mutant Family'],
    ['alpha-flight', 'Alpha Flight', 'The definitive John Byrne material.', 'Mutant Family'],
    ['hellions', 'Hellions', 'Zeb Wells’ complete Krakoa-era black comedy and tragedy.', 'Mutant Family'],
    ['spider-family', 'Spider-Family', 'Peter’s curated essentials plus Miles, Gwen, Miguel, Jessica, Cindy and the Scarlet Spiders.', 'Spider Family'],
    ['miles-morales', 'Miles Morales', 'The complete worthwhile journey from Earth-1610 into Earth-616.', 'Spider Family'],
    ['spider-gwen', 'Spider-Gwen / Ghost-Spider', 'Earth-65 foundations, Gwenom and the best multiversal material.', 'Spider Family'],
    ['spider-2099', 'Spider-Man 2099', 'Peter David’s Miguel O’Hara saga and selected modern continuation.', 'Spider Family'],
    ['spider-woman', 'Spider-Woman', 'Jessica Drew’s strongest espionage and private-investigator runs.', 'Spider Family'],
    ['black-cat', 'Black Cat', 'Jed MacKay’s heist-driven Felicia Hardy saga.', 'Spider Family'],
    ['scarlet-spiders', 'Scarlet Spiders', 'Kaine’s redemption and the best Ben Reilly material.', 'Spider Family'],
    ['silk', 'Silk', 'Cindy Moon’s origin, family search and Spider-Women crossover.', 'Spider Family'],
    ['spider-girl', 'Spider-Girl', 'Mayday Parker’s definitive alternate-universe legacy saga.', 'Spider Family'],
    ['spider-elseworlds', 'Spider Elseworlds', 'Spider-Man Noir, Spider-Punk and other worthwhile alternate Spiders.', 'Spider Family']
  ].forEach(args => addRoadmap(...args));

  /* =========================
     SHE-HULK
     ========================= */
  const savageSheHulk = ensureSeries('The Savage She-Hulk', 1980);
  const ff1961 = ensureSeries('Fantastic Four', 1961);
  const sensationalSheHulk = ensureSeries('Sensational She-Hulk', 1989);
  const sheHulk2004 = ensureSeries('She-Hulk', 2004);
  const sheHulk2005 = ensureSeries('She-Hulk', 2005);
  const sheHulk2014 = ensureSeries('She-Hulk', 2014);
  const sheHulk2022 = ensureSeries('She-Hulk', 2022);
  const sensational2023 = ensureSeries('Sensational She-Hulk', 2023);

  addItem({
    id: 'she-hulk-origin', title: 'Savage She-Hulk: Origin', phaseId: 'phase-0', priority: 'Essential', writer: 'Stan Lee and David Anthony Kraft', years: '1980',
    categories: ['She-Hulk', 'Avengers Family'], roadmapIds: ['she-hulk'], order: 58,
    summary: 'Jennifer Walters receives Bruce Banner’s blood and begins the complicated process of separating her own identity from the Hulk legacy.',
    sections: [section('Origin', 'Essential', 'Origin', [ensureIssue(savageSheHulk, 1)])]
  });

  addItem({
    id: 'she-hulk-savage-optional', title: 'The Savage She-Hulk: Complete Original Run', phaseId: 'phase-0', priority: 'Optional', writer: 'David Anthony Kraft', years: '1980–1982',
    categories: ['She-Hulk'], roadmapIds: ['she-hulk'], order: 59, routeEligible: false,
    summary: 'Jennifer’s original solo series develops the split between her human and She-Hulk identities before later writers redefine her voice.',
    sections: [section('Remaining original series', 'Optional', 'Worthwhile Optional', range(savageSheHulk, 2, 25))]
  });

  addItem({
    id: 'she-hulk-fantastic-four', title: 'She-Hulk Joins the Fantastic Four', phaseId: 'phase-1', priority: 'Peak', writer: 'John Byrne', artists: ['John Byrne'], years: '1984–1986',
    categories: ['She-Hulk', 'Fantastic Four'], roadmapIds: ['she-hulk', 'fantastic-four'], order: 101, routeEligible: false,
    summary: 'Jennifer replaces Ben Grimm and grows from substitute member into a confident part of Marvel’s first family.',
    note: 'Reference view only in Master Flow because these canonical issues already appear inside the Byrne Fantastic Four route.',
    sections: [section('Fantastic Four membership', 'Peak', 'Shared Run', range(ff1961, 265, 295))]
  });
  addItem({
    id: 'she-hulk-byrne', title: 'Sensational She-Hulk by John Byrne', phaseId: 'phase-1', priority: 'Peak', writer: 'John Byrne', artists: ['John Byrne'], years: '1985–1994',
    categories: ['She-Hulk', 'Comedy', 'Great Stories'], roadmapIds: ['she-hulk', 'great-stories'], order: 194,
    summary: 'Jennifer embraces being She-Hulk as Byrne turns superhero conventions, legal problems and the fourth wall into part of the adventure.',
    sections: [
      section('Graphic novel and opening run', 'Peak', 'Main Run', [oneShot('Marvel Graphic Novel: The Sensational She-Hulk', 1985), ...range(sensationalSheHulk, 1, 8)]),
      section('Byrne return', 'Peak', 'Main Run', [...range(sensationalSheHulk, 31, 46), ...range(sensationalSheHulk, 48, 50)])
    ]
  });
  addItem({
    id: 'she-hulk-slott', title: 'She-Hulk by Dan Slott', phaseId: 'phase-4', priority: 'Peak', writer: 'Dan Slott', years: '2004–2007',
    categories: ['She-Hulk', 'Legal', 'Avengers Family'], roadmapIds: ['she-hulk'], order: 449,
    summary: 'Jennifer joins a law firm specialising in superhuman cases, where old Marvel comics can become admissible evidence and cosmic law is still law.',
    sections: [section('Superhuman law', 'Peak', 'Main Run', range(sheHulk2004, 1, 12)), section('Civil War era and conclusion', 'Recommended', 'Main Run', range(sheHulk2005, 1, 21))]
  });
  addItem({
    id: 'she-hulk-soule', title: 'She-Hulk by Charles Soule', phaseId: 'phase-6', priority: 'Recommended', writer: 'Charles Soule', artists: ['Javier Pulido'], years: '2014–2015',
    categories: ['She-Hulk', 'Legal', 'Daredevil'], roadmapIds: ['she-hulk', 'daredevil'], order: 703,
    summary: 'Jennifer opens her own practice, uncovers the Blue File conspiracy and eventually faces Matt Murdock across a courtroom.',
    sections: [section('Complete run', 'Recommended', 'Main Run', range(sheHulk2014, 1, 12))]
  });
  addItem({
    id: 'she-hulk-rowell', title: 'She-Hulk by Rainbow Rowell', phaseId: 'phase-8', priority: 'Recommended', writer: 'Rainbow Rowell', years: '2022–2024',
    categories: ['She-Hulk', 'Avengers Family'], roadmapIds: ['she-hulk'], order: 868,
    summary: 'Jennifer rebuilds her career, friendships and private life while a gamma-powered mystery develops around Jack of Hearts.',
    sections: [section('She-Hulk', 'Recommended', 'Main Run', range(sheHulk2022, 1, 15)), section('Sensational continuation', 'Recommended', 'Main Run', range(sensational2023, 1, 10))]
  });

  /* =========================
     BLACK WIDOW
     ========================= */
  const bizarreAdventures = ensureSeries('Bizarre Adventures', 1981);
  const marvelFanfare = ensureSeries('Marvel Fanfare', 1982);
  const bw1999 = ensureSeries('Black Widow', 1999);
  const bw2001 = ensureSeries('Black Widow', 2001);
  const bw2004 = ensureSeries('Black Widow', 2004);
  const bwThings = ensureSeries('Black Widow: The Things They Say About Her', 2005);
  const bw2014 = ensureSeries('Black Widow', 2014);
  const bw2020 = ensureSeries('Black Widow', 2020);

  addItem({
    id: 'black-widow-classic-espionage', title: 'Black Widow: Classic Espionage Foundation', phaseId: 'phase-1', priority: 'Peak', writer: 'Ralph Macchio and George Pérez', years: '1981–1990',
    categories: ['Black Widow', 'Espionage'], roadmapIds: ['black-widow'], order: 123,
    summary: 'Natasha operates as a solo intelligence agent, establishing the moral ambiguity and Cold War tension that define her best stories.',
    sections: [section('Web of Intrigue', 'Peak', 'Main Run', [ensureIssue(bizarreAdventures, 25), ...range(marvelFanfare, 10, 13)]), section('The Coldest War', 'Recommended', 'Graphic Novel', [oneShot('Black Widow: The Coldest War', 1990)])]
  });
  addItem({
    id: 'black-widow-yelena', title: 'Black Widow: The Itsy-Bitsy Spider', phaseId: 'phase-3', priority: 'Essential', writer: 'Devin Grayson and Greg Rucka', years: '1999–2001',
    categories: ['Black Widow', 'Yelena Belova'], roadmapIds: ['black-widow'], order: 337,
    summary: 'Yelena Belova challenges Natasha’s claim to the Black Widow identity, forcing both women to confront the Red Room’s ownership of their lives.',
    sections: [section('Natasha and Yelena', 'Essential', 'Main Run', [...range(bw1999, 1, 3), ...range(bw2001, 1, 3)])]
  });

  addItem({
    id: 'black-widow-pale-little-spider', title: 'Black Widow: Pale Little Spider', phaseId: 'phase-3', priority: 'Optional', writer: 'Greg Rucka', years: '2002',
    categories: ['Black Widow', 'Yelena Belova'], roadmapIds: ['black-widow'], order: 338, routeEligible: false,
    summary: 'A mature Yelena Belova prequel that deepens the Red Room’s methods and the cost of being manufactured into a Widow.',
    sections: [section('Complete miniseries', 'Optional', 'Worthwhile Optional', range(ensureSeries('Black Widow: Pale Little Spider', 2002), 1, 3))]
  });

  addItem({
    id: 'black-widow-morgan', title: 'Black Widow by Richard K. Morgan', phaseId: 'phase-4', priority: 'Recommended', writer: 'Richard K. Morgan', years: '2004–2006',
    categories: ['Black Widow', 'Espionage'], roadmapIds: ['black-widow'], order: 446,
    summary: 'A wave of killings pulls Natasha into a conspiracy involving the Red Room, governments and the weaponisation of memory.',
    sections: [section('Homecoming', 'Recommended', 'Main Run', range(bw2004, 1, 6)), section('The Things They Say About Her', 'Recommended', 'Main Run', range(bwThings, 1, 6))]
  });
  addItem({
    id: 'black-widow-edmondson-noto', title: 'Black Widow by Edmondson and Noto', phaseId: 'phase-6', priority: 'Recommended', writer: 'Nathan Edmondson', artists: ['Phil Noto'], years: '2014–2015',
    categories: ['Black Widow', 'Espionage'], roadmapIds: ['black-widow'], order: 704,
    summary: 'Natasha undertakes private missions to repay her moral debts while a hidden organisation closes in around her.',
    sections: [section('Complete run', 'Recommended', 'Main Run', range(bw2014, 1, 20))]
  });
  attach('black-widow-waid-samnee', { roadmapIds: ['black-widow'], categories: ['Espionage'] });
  addItem({
    id: 'black-widow-kelly-thompson', title: 'Black Widow by Kelly Thompson', phaseId: 'phase-8', priority: 'Peak', writer: 'Kelly Thompson', artists: ['Elena Casagrande'], years: '2020–2022',
    categories: ['Black Widow', 'Yelena Belova', 'Espionage'], roadmapIds: ['black-widow'], order: 844,
    summary: 'Natasha awakens inside a manufactured perfect life, then builds a new family and base after exposing the people who stole her reality.',
    sections: [section('Complete run', 'Peak', 'Main Run', range(bw2020, 1, 15))]
  });

  /* =========================
     ANT-MAN AND WASP
     ========================= */
  const avengers1963 = ensureSeries('Avengers', 1963);
  const marvelPremiere = ensureSeries('Marvel Premiere', 1972);
  const ironMan1968 = ensureSeries('Iron Man', 1968);
  const marvelTeamUp = ensureSeries('Marvel Team-Up', 1972);
  const marvelTwoInOne = ensureSeries('Marvel Two-in-One', 1974);
  const ff2012 = ensureSeries('FF', 2012);
  const antMan2015 = ensureSeries('Ant-Man', 2015);
  const astonishingAntMan = ensureSeries('The Astonishing Ant-Man', 2015);
  const antWasp2018 = ensureSeries('Ant-Man & the Wasp', 2018);
  const antMan2022 = ensureSeries('Ant-Man', 2022);
  const wasp2023 = ensureSeries('Wasp', 2023);
  const avengersInc = ensureSeries('Avengers Inc.', 2023);
  const unstoppable2017 = ensureSeries('The Unstoppable Wasp', 2017);
  const unstoppable2018 = ensureSeries('The Unstoppable Wasp', 2018);

  attach('avengers-yellowjacket-trial', { roadmapIds: ['ant-man', 'wasp'], categories: ['Ant-Man', 'Janet Van Dyne'] });
  attach('avengers-roger-stern', { roadmapIds: ['wasp'], categories: ['Janet Van Dyne'] });
  addItem({
    id: 'ant-man-scott-foundation', title: 'Scott Lang: The Second Ant-Man', phaseId: 'phase-0', priority: 'Essential', writer: 'David Michelinie and others', years: '1979–1982',
    categories: ['Ant-Man', 'Scott Lang'], roadmapIds: ['ant-man'], order: 57,
    summary: 'Scott steals Hank Pym’s technology to save Cassie and gradually earns the right to keep the Ant-Man identity.',
    sections: [section('Early Scott Lang', 'Essential', 'Origin', [...range(marvelPremiere, 47, 48), ...range(ironMan1968, 131, 133), ...range(avengers1963, 195, 196), ensureIssue(marvelTeamUp, 103), ensureIssue(marvelTwoInOne, 87), ensureIssue(ironMan1968, 151), ensureIssue(avengers1963, 223)])]
  });
  addItem({
    id: 'ant-man-ff-fraction', title: 'Scott Lang Leads the Future Foundation', phaseId: 'phase-6', priority: 'Peak', writer: 'Matt Fraction', artists: ['Mike Allred'], years: '2012–2014',
    categories: ['Ant-Man', 'She-Hulk', 'Future Foundation'], roadmapIds: ['ant-man', 'she-hulk', 'fantastic-four'], order: 676, routeEligible: false,
    summary: 'Scott leads a replacement Fantastic Four while his conflict with Doctor Doom becomes intensely personal.',
    note: 'Reference view only in Master Flow because the same issues are already part of the Fraction Fantastic Four/FF record.',
    sections: [section('FF', 'Peak', 'Shared Run', range(ff2012, 1, 16))]
  });

  addItem({
    id: 'ant-man-eric-ogrady', title: 'The Irredeemable Ant-Man', phaseId: 'phase-4', priority: 'Optional', writer: 'Robert Kirkman', years: '2006–2007',
    categories: ['Ant-Man', 'Eric O’Grady'], roadmapIds: ['ant-man'], order: 486, routeEligible: false,
    summary: 'Eric O’Grady steals the Ant-Man suit and proves that inheriting a heroic identity does not automatically create a hero.',
    sections: [section('Complete series', 'Optional', 'Worthwhile Optional', range(ensureSeries('The Irredeemable Ant-Man', 2006), 1, 12))]
  });

  addItem({
    id: 'ant-man-nick-spencer', title: 'Ant-Man by Nick Spencer', phaseId: 'phase-7', priority: 'Recommended', writer: 'Nick Spencer', years: '2015–2016',
    categories: ['Ant-Man', 'Scott Lang'], roadmapIds: ['ant-man'], order: 743,
    summary: 'Scott moves to Miami, starts a security company and repeatedly collides with the consequences of his own unreliable choices.',
    sections: [section('Second-Chance Man', 'Recommended', 'Main Run', [...range(antMan2015, 1, 5), ensureIssue(antMan2015, 'Annual 1'), oneShot('Ant-Man: Last Days', 2015)]), section('Astonishing Ant-Man', 'Recommended', 'Main Run', range(astonishingAntMan, 1, 13))]
  });
  addItem({
    id: 'ant-man-wasp-2018', title: 'Ant-Man and the Wasp: Lost and Found', phaseId: 'phase-7', priority: 'Recommended', writer: 'Mark Waid', years: '2018',
    categories: ['Ant-Man', 'Wasp', 'Nadia Van Dyne'], roadmapIds: ['ant-man', 'wasp'], order: 789,
    summary: 'Scott and Nadia are trapped in the Microverse and must combine improvisation with rigorous science to find their way home.',
    sections: [section('Complete series', 'Recommended', 'Shared Run', range(antWasp2018, 1, 5))]
  });
  addItem({
    id: 'ant-man-ewing', title: 'Ant-Man: Ant-Iversary', phaseId: 'phase-8', priority: 'Peak', writer: 'Al Ewing', years: '2022',
    categories: ['Ant-Man', 'Hank Pym', 'Scott Lang'], roadmapIds: ['ant-man'], order: 866,
    summary: 'Each issue explores a different Ant-Man before uniting the whole legacy against Ultron and a possible future successor.',
    sections: [section('Complete series', 'Peak', 'Legacy Story', range(antMan2022, 1, 4))]
  });
  addItem({
    id: 'wasp-leadership-selection', title: 'Janet Van Dyne: Avengers Chairwoman', phaseId: 'phase-1', priority: 'Peak', writer: 'Roger Stern', years: '1982–1987',
    categories: ['Wasp', 'Janet Van Dyne', 'Avengers'], roadmapIds: ['wasp', 'avengers'], order: 144, routeEligible: false,
    summary: 'Janet emerges from Hank’s collapse as one of the Avengers’ strongest and most tested leaders.',
    note: 'Reference view only in Master Flow because these issues are already tracked under the Avengers and Yellowjacket records.',
    sections: [section('Trial era', 'Essential', 'Shared Run', range(avengers1963, 217, 230)), section('Leadership peak', 'Peak', 'Shared Run', [...range(avengers1963, 255, 263), ensureIssue(avengers1963, 'Annual 14'), ensureIssue(ff1961, 286)]), section('Under Siege', 'Peak', 'Shared Event', range(avengers1963, 270, 277))]
  });
  addItem({
    id: 'wasp-ewing', title: 'Wasp and Avengers Inc.', phaseId: 'phase-8', priority: 'Recommended', writer: 'Al Ewing', years: '2023–2024',
    categories: ['Wasp', 'Janet Van Dyne', 'Avengers'], roadmapIds: ['wasp'], order: 887,
    summary: 'Janet investigates the Pym family’s past and then becomes a superhero detective solving impossible murders with Victor Shade.',
    sections: [section('Wasp', 'Recommended', 'Main Run', range(wasp2023, 1, 4)), section('Avengers Inc.', 'Recommended', 'Main Run', range(avengersInc, 1, 5))]
  });
  addItem({
    id: 'nadia-unstoppable-wasp', title: 'The Unstoppable Wasp', phaseId: 'phase-7', priority: 'Recommended', writer: 'Jeremy Whitley', years: '2017–2019',
    categories: ['Wasp', 'Nadia Van Dyne', 'Legacy Heroes'], roadmapIds: ['wasp', 'legacy-heroes'], order: 781,
    summary: 'Nadia escapes the Red Room, creates G.I.R.L. and learns that optimism does not make her immune to trauma or mental illness.',
    sections: [section('First series', 'Recommended', 'Legacy Run', range(unstoppable2017, 1, 8)), section('Second series', 'Recommended', 'Legacy Run', range(unstoppable2018, 1, 10))]
  });

  /* =========================
     MUTANT FAMILY
     ========================= */
  const newMutants1983 = ensureSeries('New Mutants', 1983);
  const newMutants2009 = ensureSeries('New Mutants', 2009);
  const newMutants2019 = ensureSeries('New Mutants', 2019);
  const xforce1991 = ensureSeries('X-Force', 1991);
  const xforce2008 = ensureSeries('X-Force', 2008);
  const excalibur1988 = ensureSeries('Excalibur', 1988);
  const storm2014 = ensureSeries('Storm', 2014);
  const sword2020 = ensureSeries('S.W.O.R.D.', 2020);
  const xmenRed2022 = ensureSeries('X-Men Red', 2022);
  const resurrectionMagneto = ensureSeries('Resurrection of Magneto', 2024);
  const nightcrawler1985 = ensureSeries('Nightcrawler', 1985);
  const wayOfX = ensureSeries('Way of X', 2021);
  const legionOfX = ensureSeries('Legion of X', 2022);
  const generationX1994 = ensureSeries('Generation X', 1994);
  const marauders2019 = ensureSeries('Marauders', 2019);
  const gambit1993 = ensureSeries('Gambit', 1993);
  const rogue1995 = ensureSeries('Rogue', 1995);
  const rogueGambit2018 = ensureSeries('Rogue & Gambit', 2018);
  const xmenGold2017 = ensureSeries('X-Men Gold', 2017);
  const mrMrsX = ensureSeries('Mr. and Mrs. X', 2018);
  const alphaFlight1983 = ensureSeries('Alpha Flight', 1983);
  const hellions2020 = ensureSeries('Hellions', 2020);

  addItem({
    id: 'new-mutants-foundation', title: 'New Mutants: Foundation', phaseId: 'phase-1', priority: 'Essential', writer: 'Chris Claremont', years: '1982–1984',
    categories: ['New Mutants', 'Mutant Family'], roadmapIds: ['new-mutants', 'x-men'], order: 107,
    summary: 'Xavier’s first junior class forms and develops into a family with its own fears, cultures and loyalties.',
    sections: [section('Graphic novel and opening run', 'Essential', 'Main Run', [oneShot('Marvel Graphic Novel: The New Mutants', 1982), ...range(newMutants1983, 1, 17)])]
  });
  addItem({
    id: 'new-mutants-sienkiewicz', title: 'New Mutants: Sienkiewicz Era', phaseId: 'phase-1', priority: 'Peak', writer: 'Chris Claremont', artists: ['Bill Sienkiewicz'], years: '1984–1985',
    categories: ['New Mutants', 'Magik', 'Legion'], roadmapIds: ['new-mutants', 'magik'], order: 116,
    summary: 'The book becomes surreal psychological horror through the Demon Bear, Warlock and Legion.',
    sections: [section('Demon Bear through Legion', 'Peak', 'Main Run', [...range(newMutants1983, 18, 31), ensureIssue(newMutants1983, 'Annual 1')])]
  });
  attach('new-mutants-demon-bear', { routeEligible: false, roadmapIds: ['new-mutants'] });
  attach('new-mutants-legion', { routeEligible: false, roadmapIds: ['new-mutants'] });
  addItem({
    id: 'new-mutants-magneto-era', title: 'New Mutants under Magneto', phaseId: 'phase-1', priority: 'Recommended', writer: 'Chris Claremont and Louise Simonson', years: '1985–1987',
    categories: ['New Mutants', 'Magneto'], roadmapIds: ['new-mutants'], order: 128,
    summary: 'Magneto becomes headmaster while the students struggle to trust a former enemy and survive growing anti-mutant hostility.',
    sections: [section('Asgard and Magneto school era', 'Recommended', 'Main Run', [oneShot('New Mutants Special Edition', 1985), ensureIssue(ensureSeries('Uncanny X-Men Annual', 1970), 9), ...range(newMutants1983, 35, 61)])]
  });
  addItem({
    id: 'new-mutants-cable-transition', title: 'New Mutants: Cable Transition', phaseId: 'phase-2', priority: 'Essential', writer: 'Louise Simonson and Fabian Nicieza', years: '1989–1991',
    categories: ['New Mutants', 'Cable', 'X-Force'], roadmapIds: ['new-mutants', 'cable', 'x-force'], order: 224,
    summary: 'Cable arrives and slowly transforms Xavier’s students into a proactive paramilitary team.',
    sections: [section('Cable arrives', 'Essential', 'Main Run', range(newMutants1983, 86, 100))]
  });
  addItem({
    id: 'new-mutants-zeb-wells', title: 'New Mutants by Zeb Wells', phaseId: 'phase-5', priority: 'Recommended', writer: 'Zeb Wells', years: '2009–2011',
    categories: ['New Mutants', 'Magik'], roadmapIds: ['new-mutants', 'magik'], order: 596,
    summary: 'The classic team reunites and discovers that old traumas, Inferno and Legion are still shaping their lives.',
    sections: [section('Complete Wells run', 'Recommended', 'Main Run', range(newMutants2009, 1, 21))]
  });
  addItem({
    id: 'new-mutants-ayala', title: 'New Mutants by Vita Ayala', phaseId: 'phase-8', priority: 'Peak', writer: 'Vita Ayala', years: '2020–2022',
    categories: ['New Mutants', 'Magik', 'Krakoa'], roadmapIds: ['new-mutants', 'magik'], order: 831,
    summary: 'Older mutants become teachers and guardians while the Shadow King exploits the emotional wounds of Krakoa’s children.',
    sections: [section('Ayala era', 'Peak', 'Main Run', range(newMutants2019, 14, 24))]
  });

  addItem({
    id: 'xforce-original', title: 'X-Force: Cable’s Original Team', phaseId: 'phase-2', priority: 'Recommended', writer: 'Fabian Nicieza', years: '1991–1992',
    categories: ['X-Force', 'Cable', 'Mutant Family'], roadmapIds: ['x-force', 'cable'], order: 252,
    summary: 'Cable remakes the New Mutants into a team willing to strike before threats reach mutantkind.',
    sections: [section('Opening formation', 'Recommended', 'Main Run', range(xforce1991, 1, 15))]
  });
  addItem({
    id: 'xforce-kyle-yost', title: 'X-Force by Kyle and Yost', phaseId: 'phase-5', priority: 'Peak', writer: 'Craig Kyle and Chris Yost', years: '2008–2010',
    categories: ['X-Force', 'Wolverine', 'Laura Kinney'], roadmapIds: ['x-force', 'wolverine', 'legacy-heroes'], order: 561,
    summary: 'Cyclops secretly authorises a kill team to eliminate threats before they can destroy the remaining mutant population.',
    sections: [section('Covert team', 'Peak', 'Main Run', range(xforce2008, 1, 13)), section('Messiah War and aftermath', 'Peak', 'Main Run', range(xforce2008, 14, 25)), section('Second Coming chapters', 'Essential', 'Event Tie-in', range(xforce2008, 26, 28))]
  });
  attach('uncanny-xforce-remender', { roadmapIds: ['x-force'], categories: ['Mutant Family'] });
  attach('cable-and-xforce', { roadmapIds: ['x-force'] });

  attach('rachel-excalibur', { roadmapIds: ['excalibur', 'nightcrawler'], categories: ['Mutant Family'] });
  addItem({
    id: 'excalibur-foundation', title: 'Excalibur by Claremont and Davis', phaseId: 'phase-1', priority: 'Peak', writer: 'Chris Claremont and Alan Davis', years: '1988–1991',
    categories: ['Excalibur', 'Rachel Summers', 'Nightcrawler', 'Kitty Pryde'], roadmapIds: ['excalibur', 'rachel', 'nightcrawler'], order: 187, routeEligible: false,
    summary: 'Kitty, Nightcrawler, Rachel, Captain Britain and Meggan form a strange British mutant family tangled in alternate realities.',
    note: 'Reference view only in Master Flow because the same issues are already represented by the Rachel Summers and Excalibur route.',
    sections: [section('Sword Is Drawn and Cross-Time Caper', 'Peak', 'Main Run', [oneShot('Excalibur Special Edition', 1988), ...range(excalibur1988, 1, 34)]), section('Alan Davis conclusion', 'Peak', 'Main Run', range(excalibur1988, 42, 67))]
  });

  addItem({
    id: 'storm-solo-2014', title: 'Storm (2014)', phaseId: 'phase-6', priority: 'Recommended', writer: 'Greg Pak', years: '2014–2015',
    categories: ['Storm', 'Mutant Family'], roadmapIds: ['storm'], order: 709,
    summary: 'Ororo acts as diplomat, protector and force of nature across a globe that rarely agrees on what mutants need from her.',
    sections: [section('Complete run', 'Recommended', 'Solo Run', range(storm2014, 1, 11))]
  });
  addItem({
    id: 'storm-arakko', title: 'Storm of Arakko', phaseId: 'phase-8', priority: 'Peak', writer: 'Al Ewing', years: '2020–2024',
    categories: ['Storm', 'Krakoa', 'Arakko'], roadmapIds: ['storm', 'x-men'], order: 856,
    summary: 'Storm rejects inherited authority and earns a place among Arakko’s people through leadership, sacrifice and war.',
    sections: [section('S.W.O.R.D. prelude', 'Recommended', 'Prelude', range(sword2020, 1, 11)), section('X-Men Red', 'Peak', 'Main Run', range(xmenRed2022, 1, 18)), section('Resurrection of Magneto', 'Peak', 'Epilogue', range(resurrectionMagneto, 1, 4))]
  });
  attach('xmen-rogue-storm-rachel', { roadmapIds: ['storm'], categories: ['Mutant Family'] });
  attach('xmen-trial-magneto', { roadmapIds: ['storm'] });

  addItem({
    id: 'nightcrawler-classic', title: 'Nightcrawler (1985)', phaseId: 'phase-1', priority: 'Recommended', writer: 'Dave Cockrum', years: '1985–1986',
    categories: ['Nightcrawler', 'Mutant Family'], roadmapIds: ['nightcrawler'], order: 122,
    summary: 'A playful swashbuckling adventure that captures Kurt’s humour, faith in wonder and love of impossible worlds.',
    sections: [section('Complete miniseries', 'Recommended', 'Solo Run', range(nightcrawler1985, 1, 4))]
  });
  addItem({
    id: 'nightcrawler-way-of-x', title: 'Way of X and Legion of X', phaseId: 'phase-8', priority: 'Peak', writer: 'Si Spurrier', years: '2021–2023',
    categories: ['Nightcrawler', 'Krakoa', 'Legion'], roadmapIds: ['nightcrawler', 'x-men'], order: 847,
    summary: 'Kurt questions Krakoa’s laws, resurrection culture and spiritual emptiness before trying to build a mutant form of justice.',
    sections: [section('Way of X', 'Peak', 'Main Run', range(wayOfX, 1, 5)), section('Onslaught Revelation', 'Essential', 'Event Epilogue', [oneShot('X-Men: The Onslaught Revelation', 2021)]), section('Legion of X', 'Recommended', 'Main Run', range(legionOfX, 1, 10))]
  });

  addItem({
    id: 'generation-x-core', title: 'Generation X: Core Run', phaseId: 'phase-2', priority: 'Recommended', writer: 'Scott Lobdell', artists: ['Chris Bachalo'], years: '1994–1996',
    categories: ['Emma Frost', 'Generation X', 'Mutant Family'], roadmapIds: ['emma-frost'], order: 292,
    summary: 'Emma Frost and Banshee lead a new class whose powers, trauma and personalities make Xavier’s old teaching model look increasingly inadequate.',
    sections: [section('Opening era', 'Recommended', 'Team Run', range(generationX1994, 1, 25))]
  });
  addItem({
    id: 'emma-marauders', title: 'Emma Frost in Marauders', phaseId: 'phase-8', priority: 'Recommended', writer: 'Gerry Duggan', years: '2019–2020',
    categories: ['Emma Frost', 'Krakoa'], roadmapIds: ['emma-frost'], order: 813,
    summary: 'Emma helps turn Krakoa’s medicine and rescue network into a global political weapon while challenging Sebastian Shaw.',
    sections: [section('Opening Marauders era', 'Recommended', 'Main Run', range(marauders2019, 1, 12))]
  });
  attach('xmen-morrison', { roadmapIds: ['emma-frost'] });
  attach('xmen-astonishing', { roadmapIds: ['emma-frost'] });
  attach('xmen-destiny-of-x', { roadmapIds: ['emma-frost'] });

  addItem({
    id: 'rogue-gambit-classic-solos', title: 'Rogue and Gambit: Classic Solo Foundations', phaseId: 'phase-2', priority: 'Recommended', writer: 'Howard Mackie and others', years: '1993–1995',
    categories: ['Rogue', 'Gambit', 'Mutant Family'], roadmapIds: ['rogue-gambit'], order: 282,
    summary: 'Remy confronts the Guilds while Rogue returns home and faces the emotional wreckage of her past.',
    sections: [section('Gambit', 'Recommended', 'Solo Run', range(gambit1993, 1, 4)), section('Rogue', 'Recommended', 'Solo Run', range(rogue1995, 1, 4))]
  });
  addItem({
    id: 'rogue-gambit-marriage', title: 'Rogue and Gambit: Love and Marriage', phaseId: 'phase-7', priority: 'Peak', writer: 'Kelly Thompson', years: '2018–2019',
    categories: ['Rogue', 'Gambit', 'Mutant Family'], roadmapIds: ['rogue-gambit'], order: 787,
    summary: 'Rogue and Gambit confront their recurring failures, marry and discover that commitment does not make their lives any less chaotic.',
    sections: [section('Rogue & Gambit', 'Peak', 'Main Run', range(rogueGambit2018, 1, 5)), section('Wedding bridge', 'Essential', 'Bridge', range(xmenGold2017, 26, 30)), section('Mr. and Mrs. X', 'Peak', 'Main Run', range(mrMrsX, 1, 12))]
  });

  addItem({
    id: 'alpha-flight-byrne', title: 'Alpha Flight by John Byrne', phaseId: 'phase-1', priority: 'Peak', writer: 'John Byrne', artists: ['John Byrne'], years: '1983–1985',
    categories: ['Alpha Flight', 'Mutant Family'], roadmapIds: ['alpha-flight', 'wolverine'], order: 113,
    summary: 'Canada’s super-team is built around damaged relationships, national mythology and one of the era’s boldest early losses.',
    sections: [section('Complete Byrne era', 'Peak', 'Team Run', range(alphaFlight1983, 1, 28))]
  });
  addItem({
    id: 'hellions-zeb-wells', title: 'Hellions by Zeb Wells', phaseId: 'phase-8', priority: 'Peak', writer: 'Zeb Wells', years: '2020–2022',
    categories: ['Hellions', 'Krakoa', 'Mister Sinister'], roadmapIds: ['hellions', 'x-men'], order: 837,
    summary: 'Krakoa channels several dangerous mutants into a team whose missions expose the limits of rehabilitation and Sinister’s capacity for betrayal.',
    sections: [section('Complete run', 'Peak', 'Team Run', range(hellions2020, 1, 18))]
  });

  /* =========================
     SPIDER FAMILY
     ========================= */
  const asm1963 = ensureSeries('Amazing Spider-Man', 1963);
  const ppssm1976 = ensureSeries('Peter Parker, The Spectacular Spider-Man', 1976);
  const web1985 = ensureSeries('Web of Spider-Man', 1985);
  const asm1999 = ensureSeries('Amazing Spider-Man', 1999);
  const asm2014 = ensureSeries('Amazing Spider-Man', 2014);
  const superior2013 = ensureSeries('Superior Spider-Man', 2013);
  const spectacular2017 = ensureSeries('Peter Parker: The Spectacular Spider-Man', 2017);
  const friendly2019 = ensureSeries('Friendly Neighborhood Spider-Man', 2019);
  const edgeSpiderVerse2014 = ensureSeries('Edge of Spider-Verse', 2014);
  const spiderGwen2015 = ensureSeries('Spider-Gwen', 2015);
  const spiderGwen2015b = ensureSeries('Spider-Gwen', 2015, 'Earth-65', { id: 'earth-65-spider-gwen-2015b' });
  const ghostSpider2018 = ensureSeries('Spider-Gwen: Ghost-Spider', 2018, 'Earth-65');
  const ghostSpider2019 = ensureSeries('Ghost-Spider', 2019, 'Earth-65');
  const spider2099_1992 = ensureSeries('Spider-Man 2099', 1992, 'Earth-928');
  const spider2099_2014 = ensureSeries('Spider-Man 2099', 2014);
  const spider2099_2015 = ensureSeries('Spider-Man 2099', 2015);
  const spiderWoman2009 = ensureSeries('Spider-Woman', 2009);
  const spiderWoman2014 = ensureSeries('Spider-Woman', 2014);
  const spiderWoman2015 = ensureSeries('Spider-Woman', 2015);
  const blackCat2019 = ensureSeries('Black Cat', 2019);
  const blackCat2020 = ensureSeries('Black Cat', 2020);
  const ironCat = ensureSeries('Iron Cat', 2022);
  const scarletSpider2012 = ensureSeries('Scarlet Spider', 2012);
  const benReillySpiderMan = ensureSeries('Ben Reilly: Spider-Man', 2022);
  const silk2015 = ensureSeries('Silk', 2015);
  const silk2015b = ensureSeries('Silk', 2015, 'Earth-616', { id: 'earth-616-silk-2015b' });
  const spiderGirl1998 = ensureSeries('Spider-Girl', 1998, 'Earth-982');
  const spiderNoir2009 = ensureSeries('Spider-Man Noir', 2009, 'Earth-90214');
  const spiderNoir2010 = ensureSeries('Spider-Man Noir: Eyes Without a Face', 2010, 'Earth-90214');
  const spiderNoir2020 = ensureSeries('Spider-Man Noir', 2020, 'Earth-90214');
  const spiderPunk2022 = ensureSeries('Spider-Punk', 2022, 'Earth-138');
  const spiderPunk2024 = ensureSeries('Spider-Punk: Arms Race', 2024, 'Earth-138');
  const spiderGeddon = ensureSeries('Spider-Geddon', 2018);
  const edgeGeddon = ensureSeries('Edge of Spider-Geddon', 2018);

  // Curate existing Peter Parker records for Master Flow without deleting their full roadmap issue lists.
  attach('spider-man-lee-ditko', { roadmapIds: ['spider-family'], routeIssueIds: [...range(asm1963, 31, 33), ...range(asm1963, 39, 40), ...range(asm1963, 50, 52)] });
  attach('spider-man-romita-essentials', { roadmapIds: ['spider-family'], routeIssueIds: [...range(asm1963, 88, 90), ...range(asm1963, 96, 98), ...range(asm1963, 121, 122), ensureIssue(asm1963, 129), ...range(asm1963, 136, 137), ...range(asm1963, 143, 149)] });
  attach('spider-man-roger-stern', { roadmapIds: ['spider-family'] });
  attach('spider-man-black-suit', { roadmapIds: ['spider-family'] });
  attach('kravens-last-hunt', { roadmapIds: ['spider-family'] });
  attach('spider-man-venom-carnage', { roadmapIds: ['spider-family'] });
  attach('spider-man-jms', { roadmapIds: ['spider-family'] });
  attach('spider-man-nick-spencer', { roadmapIds: ['spider-family'] });
  attach('spider-man-brand-new-day', { roadmapIds: ['spider-family'], routeIssueIds: [...range(asm1999, 546, 548), ...range(asm1999, 568, 573), ensureIssue(asm1999, 600), ...range(asm1999, 612, 633)] });
  attach('spider-man-big-time-superior', { roadmapIds: ['spider-family'], routeIssueIds: [...range(asm1999, 648, 651), ...range(asm1999, 666, 673), ...range(asm1999, 682, 687), ...range(asm1999, 698, 700), ...range(superior2013, 1, 31)] });
  attach('spider-verse', { roadmapIds: ['spider-family', 'spider-gwen', 'spider-2099', 'spider-woman', 'silk'] });
  attach('miles-616-bendis', { roadmapIds: ['miles-morales', 'spider-family'] });
  attach('miles-ahmed', { roadmapIds: ['miles-morales', 'spider-family'] });
  attach('miles-ziglar', { roadmapIds: ['miles-morales', 'spider-family'] });
  attach('ultimate-miles', { roadmapIds: ['miles-morales', 'spider-family'] });

  addItem({
    id: 'spider-man-zdarsky-spectacular', title: 'Peter Parker by Chip Zdarsky', phaseId: 'phase-7', priority: 'Peak', writer: 'Chip Zdarsky', years: '2017–2018',
    categories: ['Spider-Man', 'Spider Family'], roadmapIds: ['spider-man', 'spider-family'], order: 783,
    summary: 'Peter’s relationships, history and sense of responsibility are tested through time travel, family revelations and grounded neighbourhood heroism.',
    sections: [section('Spectacular Spider-Man', 'Peak', 'Main Run', [...range(spectacular2017, 1, 6), ...range(spectacular2017, 297, 310), ensureIssue(spectacular2017, 'Annual 1')])]
  });
  addItem({
    id: 'spider-man-friendly-neighborhood', title: 'Friendly Neighborhood Spider-Man by Tom Taylor', phaseId: 'phase-7', priority: 'Recommended', writer: 'Tom Taylor', years: '2019',
    categories: ['Spider-Man', 'Street Level'], roadmapIds: ['spider-man', 'spider-family'], order: 799,
    summary: 'A warm street-level run focused on the ordinary people living within Peter’s responsibility.',
    sections: [section('Complete run', 'Recommended', 'Main Run', range(friendly2019, 1, 14))]
  });

  addItem({
    id: 'spider-gwen-origin', title: 'Spider-Gwen: Earth-65 Foundation', phaseId: 'phase-6', priority: 'Peak', writer: 'Jason Latour', artists: ['Robbi Rodriguez'], years: '2014–2016',
    categories: ['Spider-Gwen', 'Spider Family', 'Alternate Universe'], roadmapIds: ['spider-gwen', 'spider-family'], order: 707,
    summary: 'Gwen Stacy becomes the fugitive Spider-Woman of a world where Peter Parker died and Matt Murdock became a criminal kingpin.',
    sections: [section('Origin', 'Essential', 'Origin', [ensureIssue(edgeSpiderVerse2014, 2)]), section('First series', 'Peak', 'Main Run', range(spiderGwen2015, 1, 5)), section('Second volume opening', 'Peak', 'Main Run', range(spiderGwen2015b, 1, 6))]
  });
  addItem({
    id: 'spider-gwen-gwenom', title: 'Spider-Gwen: Gwenom and Earth-65 Finale', phaseId: 'phase-7', priority: 'Peak', writer: 'Jason Latour', years: '2016–2018',
    categories: ['Spider-Gwen', 'Spider Family', 'Symbiotes'], roadmapIds: ['spider-gwen', 'spider-family', 'venom'], order: 785,
    summary: 'Gwen’s conflict with Earth-65’s Matt Murdock pushes her toward the symbiote and the strongest conclusion of her original run.',
    sections: [section('Original run continuation', 'Recommended', 'Main Run', range(spiderGwen2015b, 9, 23)), section('Gwenom finale', 'Peak', 'Main Run', range(spiderGwen2015b, 24, 34))]
  });
  addItem({
    id: 'ghost-spider-modern', title: 'Ghost-Spider', phaseId: 'phase-8', priority: 'Recommended', writer: 'Seanan McGuire', years: '2018–2020',
    categories: ['Spider-Gwen', 'Spider Family'], roadmapIds: ['spider-gwen', 'spider-family'], order: 817,
    summary: 'Gwen moves between Earth-65 and Earth-616 while trying to build a future that is not defined entirely by Spider-Verse catastrophes.',
    sections: [section('Spider-Gwen: Ghost-Spider', 'Recommended', 'Main Run', range(ghostSpider2018, 1, 10)), section('Ghost-Spider', 'Recommended', 'Main Run', [...range(ghostSpider2019, 1, 10), ensureIssue(ghostSpider2019, 'Annual 1')])]
  });

  addItem({
    id: 'spider-2099-peter-david', title: 'Spider-Man 2099 by Peter David', phaseId: 'phase-2', priority: 'Peak', writer: 'Peter David', years: '1992–1996',
    categories: ['Spider-Man 2099', 'Spider Family', 'Alternate Universe'], roadmapIds: ['spider-2099', 'spider-family'], order: 268,
    summary: 'Miguel O’Hara becomes Spider-Man inside a corporate dystopia where Alchemax owns almost every path to survival.',
    sections: [section('Original saga', 'Peak', 'Main Run', [...range(spider2099_1992, 1, 46), ensureIssue(spider2099_1992, 'Annual 1'), ensureIssue(spider2099_1992, 'Special 1')])]
  });
  addItem({
    id: 'spider-2099-modern', title: 'Spider-Man 2099: Modern Return', phaseId: 'phase-6', priority: 'Recommended', writer: 'Peter David', years: '2014–2017',
    categories: ['Spider-Man 2099', 'Spider Family'], roadmapIds: ['spider-2099', 'spider-family'], order: 713,
    summary: 'Miguel is trapped in Peter Parker’s present and becomes entangled in Spider-Verse before trying to repair the future.',
    sections: [section('2014 series', 'Recommended', 'Main Run', range(spider2099_2014, 1, 12)), section('2015 continuation', 'Recommended', 'Main Run', range(spider2099_2015, 1, 25))]
  });

  addItem({
    id: 'spider-woman-bendis-maleev', title: 'Spider-Woman by Bendis and Maleev', phaseId: 'phase-5', priority: 'Peak', writer: 'Brian Michael Bendis', artists: ['Alex Maleev'], years: '2009–2010',
    categories: ['Spider-Woman', 'Jessica Drew', 'Espionage'], roadmapIds: ['spider-woman', 'spider-family'], order: 598,
    summary: 'Jessica Drew tries to reclaim her identity after Secret Invasion through a paranoid espionage mission.',
    sections: [section('Complete run', 'Peak', 'Main Run', range(spiderWoman2009, 1, 7))]
  });
  addItem({
    id: 'spider-woman-hopeless', title: 'Spider-Woman by Dennis Hopeless', phaseId: 'phase-7', priority: 'Peak', writer: 'Dennis Hopeless', years: '2014–2017',
    categories: ['Spider-Woman', 'Jessica Drew', 'Spider Family'], roadmapIds: ['spider-woman', 'spider-family'], order: 742,
    summary: 'Jessica leaves the Avengers, becomes a private investigator and later balances motherhood with a life that refuses to become ordinary.',
    sections: [section('Private investigator era', 'Peak', 'Main Run', range(spiderWoman2014, 5, 10)), section('Motherhood era', 'Peak', 'Main Run', [...range(spiderWoman2015, 1, 5), ...range(spiderWoman2015, 8, 17)])]
  });

  addItem({
    id: 'black-cat-mackay', title: 'Black Cat by Jed MacKay', phaseId: 'phase-8', priority: 'Peak', writer: 'Jed MacKay', years: '2019–2022',
    categories: ['Black Cat', 'Spider Family', 'Heist'], roadmapIds: ['black-cat', 'spider-family'], order: 822,
    summary: 'Felicia Hardy plans increasingly impossible robberies across the Marvel Universe while confronting her history with Peter and the Thieves Guild.',
    sections: [section('First series', 'Peak', 'Main Run', [...range(blackCat2019, 1, 12), ensureIssue(blackCat2019, 'Annual 1')]), section('Second series', 'Peak', 'Main Run', [...range(blackCat2020, 1, 10), ensureIssue(blackCat2020, 'Annual 1'), oneShot('Giant-Size Black Cat: Infinity Score', 2021)]), section('Iron Cat', 'Recommended', 'Epilogue', range(ironCat, 1, 5))]
  });

  addItem({
    id: 'scarlet-spider-kaine', title: 'Scarlet Spider: Kaine', phaseId: 'phase-6', priority: 'Peak', writer: 'Christopher Yost', years: '2012–2014',
    categories: ['Scarlet Spider', 'Kaine', 'Spider Family'], roadmapIds: ['scarlet-spiders', 'spider-family'], order: 681,
    summary: 'Kaine attempts to become Houston’s hero despite believing he lacks Peter Parker’s morality and capacity for hope.',
    sections: [section('Complete run', 'Peak', 'Main Run', range(scarletSpider2012, 1, 25))]
  });
  addItem({
    id: 'ben-reilly-best', title: 'Ben Reilly: Best Stories', phaseId: 'phase-2', priority: 'Recommended', writer: 'J. M. DeMatteis and others', years: '1995–2022',
    categories: ['Ben Reilly', 'Scarlet Spider', 'Spider Family'], roadmapIds: ['scarlet-spiders', 'spider-family'], order: 316,
    summary: 'A trimmed route through Ben’s exile, redemption and original period as Spider-Man without requiring the complete Clone Saga.',
    sections: [section('The Lost Years', 'Recommended', 'Main Run', range(ensureSeries('Spider-Man: The Lost Years', 1995), 1, 3)), section('Redemption', 'Peak', 'Main Run', range(ensureSeries('Spider-Man: Redemption', 1996), 1, 4)), section('Modern period story', 'Recommended', 'Main Run', range(benReillySpiderMan, 1, 5))]
  });

  addItem({
    id: 'silk-core', title: 'Silk: Core Route', phaseId: 'phase-7', priority: 'Recommended', writer: 'Robbie Thompson', years: '2015–2017',
    categories: ['Silk', 'Cindy Moon', 'Spider Family'], roadmapIds: ['silk', 'spider-family'], order: 753,
    summary: 'Cindy Moon searches for the family she lost during years of isolation while discovering where she fits in the Spider community.',
    sections: [section('First series', 'Recommended', 'Main Run', range(silk2015, 1, 7)), section('Second series', 'Recommended', 'Main Run', range(silk2015b, 1, 19))]
  });

  addItem({
    id: 'spider-girl-mayday', title: 'Spider-Girl: Mayday Parker', phaseId: null, priority: 'Peak', writer: 'Tom DeFalco', artists: ['Pat Olliffe'], years: '1998–2006',
    categories: ['Spider-Girl', 'Mayday Parker', 'Alternate Universe', 'Elseworlds'], roadmapIds: ['spider-girl', 'spider-family'], page: 'elseworlds', order: 41,
    summary: 'May Parker inherits her father’s powers and builds her own heroic identity in a future shaped by Peter and Mary Jane’s legacy.',
    sections: [section('Origin and complete original series', 'Peak', 'Alternate Universe', [ensureIssue(ensureSeries('What If?', 1989), 105), ...range(spiderGirl1998, 1, 100), ensureIssue(spiderGirl1998, 'Annual 1999')])]
  });
  addItem({
    id: 'spider-noir', title: 'Spider-Man Noir', phaseId: null, priority: 'Recommended', writer: 'David Hine and others', years: '2009–2020',
    categories: ['Spider-Man Noir', 'Alternate Universe', 'Elseworlds'], roadmapIds: ['spider-elseworlds', 'spider-family'], page: 'elseworlds', order: 42,
    summary: 'Peter Parker becomes a masked vigilante in a Depression-era world of gangsters, fascism and pulp horror.',
    sections: [section('Original series', 'Recommended', 'Alternate Universe', range(spiderNoir2009, 1, 4)), section('Eyes Without a Face', 'Recommended', 'Alternate Universe', range(spiderNoir2010, 1, 4)), section('Modern miniseries', 'Recommended', 'Alternate Universe', range(spiderNoir2020, 1, 5))]
  });
  addItem({
    id: 'spider-punk', title: 'Spider-Punk', phaseId: null, priority: 'Recommended', writer: 'Cody Ziglar', years: '2022–2024',
    categories: ['Spider-Punk', 'Alternate Universe', 'Elseworlds'], roadmapIds: ['spider-elseworlds', 'spider-family'], page: 'elseworlds', order: 43,
    summary: 'Hobie Brown fights fascism through community, noise and an absolute refusal to let heroism become an institution.',
    sections: [section('First miniseries', 'Recommended', 'Alternate Universe', range(spiderPunk2022, 1, 5)), section('Arms Race', 'Recommended', 'Alternate Universe', range(spiderPunk2024, 1, 4))]
  });
  addItem({
    id: 'event-spider-geddon', kind: 'event', title: 'Spider-Geddon', phaseId: 'phase-7', priority: 'Recommended', writer: 'Christos Gage and others', years: '2018',
    categories: ['Spider Family', 'Multiverse', 'Event'], roadmapIds: ['spider-family', 'spider-gwen', 'spider-2099'], order: 796,
    summary: 'The Inheritors return, forcing multiple Spider-worlds to organise without relying on one central Peter Parker.',
    sections: [section('Prelude', 'Recommended', 'Prelude', range(edgeGeddon, 1, 4)), section('Core event', 'Recommended', 'Core Chapter', range(spiderGeddon, 0, 5))]
  });

  /* =========================
     ROUTE CONFIGURATION
     ========================= */
  D.routeConfig = {
    blockMin: 6,
    blockMax: 12,
    defaultRouteMode: 'recommended',
    defaultLanes: ['x-men','spider-man','daredevil','fantastic-four','avengers','thor','hulk','iron-man','captain-america','thunderbolts'],
    laneChoices: ['x-men','spider-man','daredevil','fantastic-four','avengers','thor','hulk','iron-man','captain-america','thunderbolts','black-panther','doctor-strange','venom','guardians','nova','she-hulk','black-widow','ant-man','wasp','new-mutants','x-factor','x-force','excalibur','storm','miles-morales','spider-gwen','spider-woman','black-cat','moon-knight','punisher','champions'],
    excludePrioritiesFromMain: ['Optional', 'Skim', 'Skip'],
    phaseOverrides: {
      'hulk-peter-david': [
        { phaseId: 'phase-1', throughSegment: 4 },
        { phaseId: 'phase-2', throughSegment: 12 },
        { phaseId: 'phase-3', throughSegment: 99 }
      ],
      'thor-defalco-frenz': [
        { phaseId: 'phase-1', throughSegment: 3 },
        { phaseId: 'phase-2', throughSegment: 99 }
      ],
      'xfactor-original-five': [
        { phaseId: 'phase-1', throughSegment: 5 },
        { phaseId: 'phase-2', throughSegment: 99 }
      ],
      'rachel-excalibur': [
        { phaseId: 'phase-1', throughSegment: 2 },
        { phaseId: 'phase-2', throughSegment: 99 }
      ],
      'thunderbolts-busiek-nicieza': [
        { phaseId: 'phase-2', throughSegment: 1 },
        { phaseId: 'phase-3', throughSegment: 99 }
      ],
      'spider-man-jms': [
        { phaseId: 'phase-3', throughSegment: 3 },
        { phaseId: 'phase-4', throughSegment: 7 },
        { phaseId: 'phase-5', throughSegment: 99 }
      ],
      'daredevil-bendis': [
        { phaseId: 'phase-3', throughSegment: 2 },
        { phaseId: 'phase-4', throughSegment: 99 }
      ],
      'new-avengers-bendis': [
        { phaseId: 'phase-4', throughSegment: 3 },
        { phaseId: 'phase-5', throughSegment: 99 }
      ],
      'captain-america-brubaker': [
        { phaseId: 'phase-4', throughSegment: 4 },
        { phaseId: 'phase-5', throughSegment: 8 },
        { phaseId: 'phase-6', throughSegment: 99 }
      ],
      'xfactor-investigations': [
        { phaseId: 'phase-4', throughSegment: 2 },
        { phaseId: 'phase-5', throughSegment: 6 },
        { phaseId: 'phase-6', throughSegment: 99 }
      ],
      'thor-jason-aaron': [
        { phaseId: 'phase-6', throughSegment: 6 },
        { phaseId: 'phase-7', throughSegment: 99 }
      ],
      'ms-marvel-wilson': [
        { phaseId: 'phase-6', throughSegment: 1 },
        { phaseId: 'phase-7', throughSegment: 99 }
      ],
      'immortal-hulk': [
        { phaseId: 'phase-7', throughSegment: 2 },
        { phaseId: 'phase-8', throughSegment: 99 }
      ],
      'venom-cates': [
        { phaseId: 'phase-7', throughSegment: 2 },
        { phaseId: 'phase-8', throughSegment: 99 }
      ],
      'daredevil-zdarsky': [
        { phaseId: 'phase-7', throughSegment: 1 },
        { phaseId: 'phase-8', throughSegment: 99 }
      ],
      'miles-ahmed': [
        { phaseId: 'phase-7', throughSegment: 2 },
        { phaseId: 'phase-8', throughSegment: 99 }
      ],
      'ff-slott': [
        { phaseId: 'phase-7', throughSegment: 2 },
        { phaseId: 'phase-8', throughSegment: 99 }
      ]
    },
    chapterWindows: {
      'phase-0': [
        { id: 'p0-c1', title: 'Heroes, Spies and Early Foundations', subtitle: 'Selected origin-era material rather than every Silver Age issue.', min: 0, max: 19 },
        { id: 'p0-c2', title: 'Cosmic Seeds and Avengers Fault Lines', subtitle: 'Korvac, Thanos, Iron Man and the Pym family.', min: 19, max: 39 },
        { id: 'p0-c3', title: 'Mutants, Moonlight and Street Teams', subtitle: 'The route moves toward the character-defining 1980s.', min: 39, max: 999 }
      ],
      'phase-1': [
        { id: 'p1-c1', title: 'The Great 1980s Reinventions', subtitle: 'Daredevil, Fantastic Four, Thor, X-Men and new mutant families begin alternating.', min: 0, max: 119 },
        { id: 'p1-c2', title: 'Leadership, Masks and Mutant Crisis', subtitle: 'Avengers leadership, black costumes and the first major mutant gates.', min: 119, max: 154 },
        { id: 'p1-c3', title: 'Inferno, Armour and Broken Families', subtitle: 'Late-80s character consequences close the phase.', min: 154, max: 999 }
      ],
      'phase-2': [
        { id: 'p2-c1', title: 'The 1990s Begin', subtitle: 'X-Men branches, Wolverine, Infinity and new antiheroes.', min: 0, max: 249 },
        { id: 'p2-c2', title: 'Cosmic War and Mutant Fracture', subtitle: 'Operation Galactic Storm, Cable, Fatal Attractions and expanding Spider mythology.', min: 249, max: 299 },
        { id: 'p2-c3', title: 'Age of Apocalypse and Heroes Return', subtitle: 'The mutant decade peaks before Marvel rebuilds its central teams.', min: 299, max: 999 }
      ],
      'phase-3': [
        { id: 'p3-c1', title: 'Heroes Return', subtitle: 'Thunderbolts, Avengers, Iron Man and Fantastic Four rebuild the universe.', min: 0, max: 359 },
        { id: 'p3-c2', title: 'Marvel Knights and Street-Level Pressure', subtitle: 'Daredevil, Punisher, Alias and Black Widow pull the route toward the shadows.', min: 359, max: 389 },
        { id: 'p3-c3', title: 'The New Century Mutant and Family Shift', subtitle: 'Morrison X-Men, Waid Fantastic Four and long-form modern runs take over.', min: 389, max: 999 }
      ],
      'phase-4': [
        { id: 'p4-c1', title: 'Before the Avengers Break', subtitle: 'Character runs build toward Disassembled and the return of major legacy conflicts.', min: 0, max: 429 },
        { id: 'p4-c2', title: 'House of M and the Road to Civil War', subtitle: 'Avengers, mutants, Captain America and Spider-Man begin colliding.', min: 429, max: 474 },
        { id: 'p4-c3', title: 'Civil War, Planet Hulk and Annihilation', subtitle: 'Earth fractures while Marvel’s cosmic lane catches fire.', min: 474, max: 999 }
      ],
      'phase-5': [
        { id: 'p5-c1', title: 'World War and Messiah', subtitle: 'Hulk, mutants, cosmic heroes and street-level books alternate through crisis.', min: 0, max: 549 },
        { id: 'p5-c2', title: 'Secret Invasion and Dark Reign', subtitle: 'Norman Osborn rises while Thor, Iron Man and the Thunderbolts shift around him.', min: 549, max: 589 },
        { id: 'p5-c3', title: 'Siege and Second Coming', subtitle: 'Asgard and mutantkind reach separate breaking points.', min: 589, max: 999 }
      ],
      'phase-6': [
        { id: 'p6-c1', title: 'Heroic Age and Divided Mutants', subtitle: 'Kid Loki, Daredevil, X-Force and Spider-Man lead the first half of the decade.', min: 0, max: 649 },
        { id: 'p6-c2', title: 'Avengers vs. X-Men and Marvel NOW!', subtitle: 'Major teams fracture while new definitive solo runs begin.', min: 649, max: 689 },
        { id: 'p6-c3', title: 'Infinity to Secret Wars', subtitle: 'Hickman’s universe spine closes the phase.', min: 689, max: 999 }
      ],
      'phase-7': [
        { id: 'p7-c1', title: 'All-New, All-Different', subtitle: 'Legacy heroes, Vision, Black Widow, Thor and Champions reshape the centre.', min: 0, max: 769 },
        { id: 'p7-c2', title: 'Legacy and War of the Realms', subtitle: 'Character-focused runs build toward Aaron’s Asgardian finale.', min: 769, max: 799 },
        { id: 'p7-c3', title: 'Fresh Start and Krakoa’s Doorway', subtitle: 'Immortal Hulk, Venom, Daredevil and the mutant relaunch begin.', min: 799, max: 999 }
      ],
      'phase-8': [
        { id: 'p8-c1', title: 'Krakoa and the King in Black', subtitle: 'Mutant nation-building alternates with symbiote and supernatural escalation.', min: 0, max: 849 },
        { id: 'p8-c2', title: 'Judgment, Moonlight and Arakko', subtitle: 'Cosmic judgment collides with character-defining modern runs.', min: 849, max: 879 },
        { id: 'p8-c3', title: 'Fall of X and Blood Hunt', subtitle: 'Krakoa collapses while the wider universe moves toward Doom.', min: 879, max: 999 }
      ],
      'phase-9': [
        { id: 'p9-c1', title: 'One World Under Doom', subtitle: 'The current era begins with Doom’s global takeover and the post-Krakoa landscape.', min: 0, max: 929 },
        { id: 'p9-c2', title: 'Current Hero Lanes', subtitle: 'Fantastic Four, Thor, Hulk, Captain America and Spider-Man continue in shorter live blocks.', min: 929, max: 949 },
        { id: 'p9-c3', title: 'Armageddon, Shadows and Symbiote War', subtitle: 'Current event gates and ongoing series remain provisional until published.', min: 949, max: 999 }
      ]
    }
  };

  // Ensure family metadata is available for roadmap navigation.
  D.roadmapFamilies = [
    { id: 'pillars', title: 'Marvel Pillars', roadmapIds: ['avengers','x-men','fantastic-four','spider-man','thor','hulk','captain-america','iron-man','daredevil','black-panther','doctor-strange'] },
    { id: 'mutants', title: 'Mutant Family', roadmapIds: ['x-men','new-mutants','x-factor','x-force','excalibur','wolverine','storm','cyclops','jean-grey','rachel','cable','magik','nightcrawler','emma-frost','rogue-gambit','alpha-flight','hellions'] },
    { id: 'spiders', title: 'Spider-Family', roadmapIds: ['spider-man','spider-family','miles-morales','spider-gwen','spider-2099','spider-woman','black-cat','scarlet-spiders','silk','spider-girl','spider-elseworlds','venom'] },
    { id: 'avengers-family', title: 'Avengers Family', roadmapIds: ['avengers','she-hulk','black-widow','ant-man','wasp','thunderbolts','wanda-vision','sentry','illuminati'] },
    { id: 'cosmic', title: 'Cosmic and Supernatural', roadmapIds: ['cosmic','thanos','guardians','nova','silver-surfer','doctor-strange','blade','defenders','venom'] },
    { id: 'street', title: 'Street and Legacy', roadmapIds: ['daredevil','elektra','jessica-jones','luke-cage','iron-fist','moon-knight','punisher','champions','legacy-heroes'] }
  ];

  D.schemaVersion = 4;
  D.dataVersion = '2026.06.28-v4-interleaved';

  // Recalculate lightweight audit counts after expansion.
  const errors = [];
  const seenItems = new Set();
  D.items.forEach(item => {
    if (seenItems.has(item.id)) errors.push(`Duplicate item id: ${item.id}`);
    seenItems.add(item.id);
    item.sections.forEach(sec => sec.issueIds.forEach(id => { if (!D.issues[id]) errors.push(`Missing issue ${id} in ${item.id}`); }));
  });
  D.validation = {
    errors,
    warnings: [],
    counts: {
      phases: D.phases.length,
      series: Object.keys(D.series).length,
      issues: Object.keys(D.issues).length,
      items: D.items.length,
      events: D.events.length,
      roadmaps: D.roadmaps.length
    }
  };
})();

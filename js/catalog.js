/* Marvel Reading Vault v3
   Canonical issue registry + curated run/event definitions.
   Every issue is created once and referenced everywhere else by issueId.
*/
(function () {
  const PHASES = [
    { id: 'phase-0', short: 'P0', title: 'Selected Foundations', years: '1977–1982', description: 'Only the older material needed to launch the chosen modern roadmaps.' },
    { id: 'phase-1', short: 'P1', title: 'Character-Defining 1980s', years: '1983–1989', description: 'Simonson Thor, Byrne Fantastic Four, Miller/Nocenti Daredevil, Claremont X-Men, Stern Avengers, Peter David Hulk and other defining runs.' },
    { id: 'phase-2', short: 'P2', title: 'Expansion and Fracture', years: '1990–1997', description: 'The Infinity trilogy, mutant mega-events, 90s expansion, Thunderbolts, Venom/Carnage and selected continuity bridges.' },
    { id: 'phase-3', short: 'P3', title: 'Heroes Return and Marvel Knights', years: '1998–2004', description: 'Marvel Knights, Heroes Return, Morrison X-Men, JMS Spider-Man, Alias, Priest Black Panther and the original Ultimate Universe.' },
    { id: 'phase-4', short: 'P4', title: 'Disassembled, Civil War and Annihilation', years: '2004–2007', description: 'Avengers Disassembled, House of M, Civil War, Annihilation, Brubaker Captain America, Extremis and Planet Hulk.' },
    { id: 'phase-5', short: 'P5', title: 'World War, Messiah and Dark Reign', years: '2007–2010', description: 'World War Hulk, Annihilation: Conquest, Guardians/Nova, Messiah era, Secret Invasion, Dark Reign and Siege.' },
    { id: 'phase-6', short: 'P6', title: 'Heroic Age to Secret Wars', years: '2010–2015', description: 'Uncanny X-Force, Schism, AvX, Hickman FF/Avengers, Superior Spider-Man, Aaron Thor, Infinity and Secret Wars.' },
    { id: 'phase-7', short: 'P7', title: 'All-New, All-Different and Fresh Start', years: '2015–2019', description: 'Vision, Scarlet Witch, Champions, Jane Foster Thor, Coates Black Panther, Cates Venom, Immortal Hulk and Krakoa’s launch.' },
    { id: 'phase-8', short: 'P8', title: 'Krakoa, Cosmic Horror and Judgment', years: '2019–2024', description: 'Krakoa, Absolute Carnage, King in Black, Judgment Day, Fall of X, MacKay Moon Knight/Doctor Strange and Ryan North Fantastic Four.' },
    { id: 'phase-9', short: 'P9', title: 'Doom, Shadows and Armageddon', years: '2024–2026', description: 'From the Ashes, Shadows of Tomorrow, current Ultimate finale, One World Under Doom, Armageddon and current ongoing series.' }
  ];

  const SERIES = {};
  const ISSUES = {};
  const ITEMS = [];
  const EVENTS = [];
  const ROADMAPS = [];
  const ELSEWORLDS_GROUPS = [];

  const slug = value => String(value)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  function series(title, year, universe = 'Earth-616', opts = {}) {
    const id = opts.id || `${slug(universe)}-${slug(title)}-${year}`;
    if (!SERIES[id]) {
      SERIES[id] = {
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

  function issue(seriesId, number, meta = {}) {
    const numberText = String(number);
    const id = `${seriesId}--${slug(numberText) || 'one-shot'}`;
    const s = SERIES[seriesId];
    if (!s) throw new Error(`Unknown series: ${seriesId}`);
    if (!ISSUES[id]) {
      const isAnnual = /^annual\s/i.test(numberText);
      const formatted = meta.displayTitle || `${s.title}${s.displayYear ? ` (${s.startYear})` : ''}${isAnnual ? ` ${numberText.replace(/^annual\s*/i, 'Annual #')}` : ` #${numberText}`}`;
      ISSUES[id] = {
        id,
        seriesId,
        number: numberText,
        displayTitle: formatted,
        universe: s.universe,
        publicationDate: meta.publicationDate || '',
        status: meta.status || 'published',
        storyTitle: meta.storyTitle || '',
        note: meta.note || ''
      };
    } else if (meta.status && ISSUES[id].status !== 'published') {
      ISSUES[id].status = meta.status;
    }
    return id;
  }

  function range(seriesId, start, end, meta = {}) {
    const out = [];
    for (let n = start; n <= end; n += 1) out.push(issue(seriesId, n, meta));
    return out;
  }

  function list(seriesId, numbers, meta = {}) {
    return numbers.map(number => issue(seriesId, number, meta));
  }

  function oneShot(title, year, universe = 'Earth-616', opts = {}) {
    const sid = series(title, year, universe, { ...opts, displayYear: opts.displayYear !== false });
    return issue(sid, opts.number || 1, { displayTitle: opts.displayTitle || `${title}${opts.showYear === false ? '' : ` (${year})`}` , status: opts.status || 'published' });
  }

  function section(label, recommendation, role, issueIds, note = '') {
    return { label, recommendation, role, issueIds: [...new Set(issueIds)], note };
  }

  function addItem(def) {
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
      current: Boolean(def.current)
    };
    ITEMS.push(item);
    return item.id;
  }

  function addEvent(def) {
    const id = addItem({ ...def, kind: 'event', role: def.role || 'Event', page: def.page || 'main' });
    EVENTS.push(id);
    return id;
  }

  function addRoadmap(def) {
    ROADMAPS.push({
      id: def.id,
      title: def.title,
      description: def.description || '',
      category: def.category || def.title,
      accent: def.accent || '',
      itemIds: def.itemIds || []
    });
  }

  const concat = (...arrays) => arrays.flat().filter(Boolean);

  // Common series shortcuts
  const avengers1963 = series('Avengers', 1963);
  const thor1966 = series('Thor', 1966);
  const thorAnnual = series('Thor Annual', 1966);
  const uncanny1963 = series('Uncanny X-Men', 1963);
  const xfactor1986 = series('X-Factor', 1986);
  const newMutants1983 = series('New Mutants', 1983);
  const fantasticFour1961 = series('Fantastic Four', 1961);
  const daredevil1964 = series('Daredevil', 1964);
  const amazing1963 = series('Amazing Spider-Man', 1963);
  const ironMan1968 = series('Iron Man', 1968);
  const incredibleHulk1968 = series('Incredible Hulk', 1968);

  /* =========================
     EVENTS AND LOCKS
     ========================= */

  addEvent({
    id: 'event-korvac-saga', title: 'The Korvac Saga', phaseId: 'phase-0', priority: 'Essential', writer: 'Jim Shooter and Roger Stern', years: '1977–1978',
    categories: ['Avengers', 'Guardians of the Galaxy', 'Thor', 'Cosmic'], roadmapIds: ['avengers', 'guardians', 'thor'], order: 10,
    summary: 'The Guardians pursue Korvac into the present, drawing Thor and the Avengers into a cosmic conflict over power, utopia and control.',
    note: 'The Avengers-only collected core often omits the Guardians/Thor beginning. The required prelude is shown separately.',
    sections: [
      section('Optional Guardians background', 'Optional', 'Background', range(series('Marvel Presents', 1975), 3, 12), 'Read for the original Guardians journey before Korvac reaches the present.'),
      section('Required prelude', 'Essential', 'Prelude', list(thorAnnual, [6])),
      section('Required Avengers core', 'Essential', 'Core Chapter', concat(range(avengers1963, 167, 168), range(avengers1963, 170, 177))),
      section('Publication-flow interruption', 'Skim', 'Flow Issue', list(avengers1963, [169]), 'Sits between chapters but is not a central Korvac installment.')
    ]
  });

  addEvent({
    id: 'event-mutant-massacre', title: 'Mutant Massacre', phaseId: 'phase-1', priority: 'Essential', writer: 'Chris Claremont, Louise Simonson and others', years: '1986–1987',
    categories: ['X-Men', 'X-Factor', 'New Mutants', 'Thor', 'Daredevil'], roadmapIds: ['x-men', 'x-factor', 'thor', 'daredevil'], order: 130,
    summary: 'The Marauders attack the Morlocks, forcing the X-books into their first tightly connected tragedy and permanently changing several heroes.',
    sections: [
      section('Required mutant core', 'Essential', 'Core Chapter', concat(list(uncanny1963, [210, 211, 212, 213, 214]), list(xfactor1986, [9, 10, 11]))),
      section('Important New Mutants chapter', 'Recommended', 'Tie-in', list(newMutants1983, [46])),
      section('Strong expansion', 'Recommended', 'Tie-in', concat(range(thor1966, 373, 374), range(series('Power Pack', 1984), 27, 28))),
      section('Peripheral aftermath', 'Optional', 'Tie-in', list(daredevil1964, [238]))
    ]
  });

  addEvent({
    id: 'event-fall-of-mutants', title: 'Fall of the Mutants', phaseId: 'phase-1', priority: 'Essential', writer: 'Chris Claremont, Louise Simonson and others', years: '1988',
    categories: ['X-Men', 'X-Factor', 'New Mutants'], roadmapIds: ['x-men', 'x-factor'], order: 150,
    summary: 'Three parallel mutant crises reshape the X-Men, X-Factor and New Mutants without requiring issue-by-issue interleaving.',
    sections: [
      section('Uncanny X-Men block', 'Essential', 'Core Chapter', range(uncanny1963, 225, 227)),
      section('X-Factor block', 'Essential', 'Core Chapter', range(xfactor1986, 24, 26)),
      section('New Mutants block', 'Recommended', 'Core Chapter', range(newMutants1983, 59, 61))
    ]
  });

  const xTerminators1988 = series('X-Terminators', 1988);
  addEvent({
    id: 'event-inferno', title: 'Inferno', phaseId: 'phase-1', priority: 'Peak', writer: 'Chris Claremont, Louise Simonson and others', years: '1988–1989',
    categories: ['X-Men', 'X-Factor', 'New Mutants', 'Magik'], roadmapIds: ['x-men', 'x-factor', 'magik'], order: 170,
    summary: 'Madelyne Pryor, Sinister, Limbo and the Summers family collide while New York descends into demonic chaos.',
    sections: [
      section('Required X-Men/X-Factor core', 'Essential', 'Core Chapter', concat(list(uncanny1963, [239, 240, 241, 242, 243]), range(xfactor1986, 33, 39))),
      section('Required Limbo side', 'Essential', 'Core Chapter', concat(range(xTerminators1988, 1, 4), range(newMutants1983, 71, 73))),
      section('Expanded New York tie-ins', 'Optional', 'Tie-in', concat(range(series('Amazing Spider-Man', 1963), 311, 313), range(series('Spectacular Spider-Man', 1976), 146, 148), range(series('Web of Spider-Man', 1985), 47, 48), range(series('Daredevil', 1964), 262, 263))),
      section('Peripheral crossover material', 'Skip', 'Tie-in', concat(range(series('Avengers', 1963), 298, 300), range(series('Fantastic Four', 1961), 322, 324)))
    ]
  });

  addEvent({
    id: 'event-x-tinction-agenda', title: 'X-Tinction Agenda', phaseId: 'phase-2', priority: 'Essential', writer: 'Chris Claremont, Louise Simonson and others', years: '1990–1991',
    categories: ['X-Men', 'X-Factor', 'New Mutants'], roadmapIds: ['x-men', 'x-factor'], order: 220,
    summary: 'The X-Men, X-Factor and New Mutants converge on Genosha in a tightly ordered crossover about mutant slavery and state power.',
    sections: [section('Complete event', 'Essential', 'Core Chapter', [
      issue(uncanny1963, 270), issue(newMutants1983, 95), issue(xfactor1986, 60), issue(uncanny1963, 271), issue(newMutants1983, 96), issue(xfactor1986, 61), issue(uncanny1963, 272), issue(newMutants1983, 97), issue(xfactor1986, 62)
    ])]
  });

  const xforce1991 = series('X-Force', 1991);
  addEvent({
    id: 'event-x-cutioners-song', title: "X-Cutioner's Song", phaseId: 'phase-2', priority: 'Essential', writer: 'Scott Lobdell, Fabian Nicieza and others', years: '1992–1993',
    categories: ['X-Men', 'X-Factor', 'X-Force', 'Cable'], roadmapIds: ['x-men', 'x-factor', 'cable'], order: 260,
    summary: 'Cable, Stryfe, Apocalypse and the Summers family collide in the central early-90s mutant crossover.',
    sections: [
      section('Complete twelve-part crossover', 'Essential', 'Core Chapter', [
        issue(uncanny1963, 294), issue(xfactor1986, 84), issue(series('X-Men', 1991), 14), issue(xforce1991, 16),
        issue(uncanny1963, 295), issue(xfactor1986, 85), issue(series('X-Men', 1991), 15), issue(xforce1991, 17),
        issue(uncanny1963, 296), issue(xfactor1986, 86), issue(series('X-Men', 1991), 16), issue(xforce1991, 18)
      ]),
      section('Aftermath', 'Recommended', 'Epilogue', concat(list(uncanny1963, [297]), list(xforce1991, [19]))),
      section('Reference handbook', 'Optional', 'Companion', [oneShot("Stryfe's Strike File", 1993)])
    ]
  });

  addEvent({
    id: 'event-fatal-attractions', title: 'Fatal Attractions', phaseId: 'phase-2', priority: 'Essential', writer: 'Various', years: '1993',
    categories: ['X-Men', 'X-Factor', 'X-Force', 'Wolverine', 'Excalibur'], roadmapIds: ['x-men', 'x-factor', 'wolverine', 'rachel'], order: 275,
    summary: 'Magneto returns, Wolverine suffers a defining injury and Xavier crosses a lasting moral line.',
    sections: [section('Complete event', 'Essential', 'Core Chapter', [
      issue(xfactor1986, 92), issue(xforce1991, 25), issue(uncanny1963, 304), issue(series('X-Men', 1991), 25), issue(series('Wolverine', 1988), 75), issue(series('Excalibur', 1988), 71)
    ])]
  });

  const cable1993 = series('Cable', 1993);
  addEvent({
    id: 'event-legion-quest', title: 'Legion Quest', phaseId: 'phase-2', priority: 'Essential', writer: 'Scott Lobdell, Fabian Nicieza and others', years: '1994–1995',
    categories: ['X-Men', 'X-Factor', 'Cable', 'Legion'], roadmapIds: ['x-men', 'cable'], order: 300,
    summary: 'Legion attempts to rewrite mutant history and accidentally opens the door to the Age of Apocalypse.',
    sections: [section('Complete prelude', 'Essential', 'Prelude', [
      issue(uncanny1963, 319), issue(xfactor1986, 109), issue(uncanny1963, 320), issue(series('X-Men', 1991), 40), issue(uncanny1963, 321), issue(cable1993, 20), issue(series('X-Men', 1991), 41)
    ])]
  });

  const aoaSeries = {
    astonishing: series('Astonishing X-Men', 1995, 'Earth-295'), amazing: series('Amazing X-Men', 1995, 'Earth-295'), factorx: series('Factor X', 1995, 'Earth-295'),
    gambit: series('Gambit and the X-Ternals', 1995, 'Earth-295'), generation: series('Generation Next', 1995, 'Earth-295'), weaponx: series('Weapon X', 1995, 'Earth-295'),
    xcalibre: series('X-Calibre', 1995, 'Earth-295'), xman: series('X-Man', 1995, 'Earth-295'), xuniverse: series('X-Universe', 1995, 'Earth-295')
  };
  addEvent({
    id: 'event-age-of-apocalypse', title: 'Age of Apocalypse', phaseId: 'phase-2', priority: 'Peak', writer: 'Various', years: '1995',
    categories: ['X-Men', 'Alternate Universe'], roadmapIds: ['x-men'], order: 310,
    summary: 'A world without Xavier reimagines the entire mutant line under Apocalypse’s rule.',
    sections: [
      section('Opening and finale', 'Essential', 'Core Chapter', [oneShot('X-Men Alpha', 1995, 'Earth-295'), oneShot('X-Men Omega', 1995, 'Earth-295')]),
      section('Core four-issue minis', 'Essential', 'Core Chapter', concat(
        range(aoaSeries.astonishing, 1, 4), range(aoaSeries.amazing, 1, 4), range(aoaSeries.factorx, 1, 4), range(aoaSeries.gambit, 1, 4),
        range(aoaSeries.generation, 1, 4), range(aoaSeries.weaponx, 1, 4), range(aoaSeries.xcalibre, 1, 4), range(aoaSeries.xman, 1, 4), range(aoaSeries.xuniverse, 1, 2)
      )),
      section('Historical expansion', 'Optional', 'Companion', concat(range(series('X-Men Chronicles', 1995, 'Earth-295'), 1, 2), range(series('Tales from the Age of Apocalypse', 1996, 'Earth-295'), 1, 2), range(series('Blink', 2001, 'Earth-295'), 1, 4)))
    ], prerequisites: ['event-legion-quest']
  });

  addEvent({
    id: 'event-operation-galactic-storm', title: 'Operation: Galactic Storm', phaseId: 'phase-2', priority: 'Recommended', writer: 'Various', years: '1992',
    categories: ['Avengers', 'Iron Man', 'Thor', 'Captain America', 'Cosmic'], roadmapIds: ['avengers', 'iron-man', 'thor', 'captain-america'], order: 250,
    summary: 'The Avengers are drawn into a Kree/Shi’ar war that divides the team over justice, intervention and execution.',
    sections: [section('Complete nineteen-part crossover', 'Recommended', 'Core Chapter', [
      issue(series('Captain America', 1968), 398), issue(series('Avengers West Coast', 1989), 80), issue(series('Quasar', 1989), 32), issue(series('Wonder Man', 1991), 7), issue(avengers1963, 345), issue(ironMan1968, 278), issue(thor1966, 445),
      issue(series('Captain America', 1968), 399), issue(series('Avengers West Coast', 1989), 81), issue(series('Quasar', 1989), 33), issue(series('Wonder Man', 1991), 8), issue(avengers1963, 346), issue(ironMan1968, 279), issue(thor1966, 446),
      issue(series('Captain America', 1968), 400), issue(series('Avengers West Coast', 1989), 82), issue(series('Quasar', 1989), 34), issue(series('Wonder Man', 1991), 9), issue(avengers1963, 347)
    ])]
  });

  addEvent({
    id: 'event-infinity-gauntlet', title: 'Infinity Gauntlet', phaseId: 'phase-2', priority: 'Peak', writer: 'Jim Starlin', years: '1990–1991',
    categories: ['Thanos', 'Silver Surfer', 'Cosmic', 'Infinity'], roadmapIds: ['thanos', 'silver-surfer', 'cosmic'], order: 240,
    summary: 'Thanos assembles the Infinity Gems and challenges the entire Marvel cosmos.',
    sections: [
      section('Required prelude', 'Essential', 'Prelude', concat(range(series('Silver Surfer', 1987), 34, 38), range(series('Thanos Quest', 1990), 1, 2))),
      section('Main event', 'Peak', 'Core Chapter', range(series('Infinity Gauntlet', 1991), 1, 6)),
      section('Immediate aftermath', 'Recommended', 'Epilogue', range(series('Warlock and the Infinity Watch', 1992), 1, 7)),
      section('Expanded tie-ins', 'Optional', 'Tie-in', concat(range(series('Doctor Strange, Sorcerer Supreme', 1988), 31, 36), range(series('Silver Surfer', 1987), 51, 59)))
    ]
  });

  addEvent({
    id: 'event-infinity-war', title: 'Infinity War', phaseId: 'phase-2', priority: 'Recommended', writer: 'Jim Starlin', years: '1992',
    categories: ['Thanos', 'Adam Warlock', 'Cosmic', 'Infinity'], roadmapIds: ['thanos', 'cosmic'], order: 245,
    summary: 'Adam Warlock’s expelled dark half unleashes a universe-wide identity crisis and a flood of doubles.',
    sections: [
      section('Main event', 'Recommended', 'Core Chapter', range(series('Infinity War', 1992), 1, 6)),
      section('Infinity Watch chapters', 'Recommended', 'Tie-in', range(series('Warlock and the Infinity Watch', 1992), 8, 10)),
      section('Expanded line tie-ins', 'Optional', 'Tie-in', concat(range(fantasticFour1961, 366, 370), range(series('Silver Surfer', 1987), 67, 69)))
    ], prerequisites: ['event-infinity-gauntlet']
  });

  addEvent({
    id: 'event-infinity-crusade', title: 'Infinity Crusade', phaseId: 'phase-2', priority: 'Optional', writer: 'Jim Starlin', years: '1993',
    categories: ['Thanos', 'Adam Warlock', 'Cosmic', 'Infinity'], roadmapIds: ['thanos', 'cosmic'], order: 246,
    summary: 'Warlock’s idealised spiritual half attempts to purify the universe through control.',
    sections: [
      section('Main event', 'Optional', 'Core Chapter', range(series('Infinity Crusade', 1993), 1, 6)),
      section('Infinity Watch chapters', 'Optional', 'Tie-in', range(series('Warlock and the Infinity Watch', 1992), 18, 22))
    ], prerequisites: ['event-infinity-war']
  });

  addEvent({
    id: 'event-avengers-disassembled', title: 'Avengers Disassembled', phaseId: 'phase-4', priority: 'Essential', writer: 'Brian Michael Bendis', years: '2004',
    categories: ['Avengers', 'Scarlet Witch', 'Vision'], roadmapIds: ['avengers', 'wanda-vision'], order: 410,
    summary: 'The classic Avengers structure collapses as Wanda’s breakdown turns the team’s history against them.',
    sections: [
      section('Main Avengers story', 'Essential', 'Core Chapter', concat(range(series('Avengers', 1998), 500, 503), [oneShot('Avengers Finale', 2005)])),
      section('Character tie-ins', 'Optional', 'Tie-in', concat(range(series('Iron Man', 1998), 84, 89), range(series('Captain America', 2002), 29, 32), range(series('Thor', 1998), 80, 85), range(series('Spectacular Spider-Man', 2003), 15, 20)))
    ]
  });

  addEvent({
    id: 'event-house-of-m', title: 'House of M', phaseId: 'phase-4', priority: 'Essential', writer: 'Brian Michael Bendis', years: '2005',
    categories: ['Avengers', 'X-Men', 'Scarlet Witch'], roadmapIds: ['avengers', 'x-men', 'wanda-vision'], order: 430,
    summary: 'The Avengers and X-Men confront Wanda as reality is rewritten into a world where mutant power has won.',
    sections: [
      section('Bridge', 'Recommended', 'Prelude', range(series('Excalibur', 2004), 10, 14)),
      section('Main event', 'Essential', 'Core Chapter', range(series('House of M', 2005), 1, 8)),
      section('Useful mutant aftermath', 'Recommended', 'Epilogue', [oneShot('Decimation: House of M - The Day After', 2006)]),
      section('Expanded tie-ins', 'Optional', 'Tie-in', concat(range(series('Spider-Man: House of M', 2005), 1, 5), range(series('Fantastic Four: House of M', 2005), 1, 3), range(series('Iron Man: House of M', 2005), 1, 3)))
    ], prerequisites: ['event-avengers-disassembled']
  });

  addEvent({
    id: 'event-civil-war', title: 'Civil War', phaseId: 'phase-4', priority: 'Essential', writer: 'Mark Millar', years: '2006–2007',
    categories: ['Avengers', 'Spider-Man', 'Iron Man', 'Captain America', 'Fantastic Four'], roadmapIds: ['avengers', 'spider-man', 'iron-man', 'captain-america', 'fantastic-four'], order: 470,
    summary: 'A superhero registration law splits Marvel’s heroes into opposing camps led by Iron Man and Captain America.',
    sections: [
      section('Main event', 'Essential', 'Core Chapter', range(series('Civil War', 2006), 1, 7)),
      section('Spider-Man core', 'Essential', 'Character Tie-in', range(series('Amazing Spider-Man', 1999), 529, 538)),
      section('Captain America core', 'Essential', 'Character Tie-in', range(series('Captain America', 2004), 22, 25)),
      section('Iron Man core', 'Recommended', 'Character Tie-in', range(series('Iron Man', 2004), 13, 14)),
      section('Fantastic Four core', 'Recommended', 'Character Tie-in', range(series('Fantastic Four', 1961), 536, 543)),
      section('New Avengers chapters', 'Recommended', 'Tie-in', range(series('New Avengers', 2004), 21, 25)),
      section('Front Line', 'Optional', 'Companion', range(series('Civil War: Front Line', 2006), 1, 11)),
      section('Peripheral tie-ins', 'Skip', 'Tie-in', concat(range(series('Civil War: Young Avengers and Runaways', 2006), 1, 4), range(series('Civil War: X-Men', 2006), 1, 4)))
    ]
  });

  addEvent({
    id: 'event-annihilation', title: 'Annihilation', phaseId: 'phase-4', priority: 'Peak', writer: 'Keith Giffen, Dan Abnett, Andy Lanning and others', years: '2006–2007',
    categories: ['Cosmic', 'Nova', 'Guardians of the Galaxy', 'Thanos'], roadmapIds: ['nova', 'guardians', 'thanos', 'cosmic'], order: 480,
    summary: 'Annihilus invades from the Negative Zone, rebuilding Marvel’s cosmic line around Nova, Drax, Star-Lord, Thanos and new alliances.',
    sections: [
      section('Opening', 'Essential', 'Prelude', [oneShot('Annihilation Prologue', 2006)]),
      section('Core character minis', 'Essential', 'Prelude', concat(range(series('Annihilation: Nova', 2006), 1, 4), range(series('Annihilation: Drax', 2006), 1, 4), range(series('Annihilation: Silver Surfer', 2006), 1, 4), range(series('Annihilation: Super-Skrull', 2006), 1, 4))),
      section('Main event', 'Peak', 'Core Chapter', range(series('Annihilation', 2006), 1, 6)),
      section('Epilogue', 'Recommended', 'Epilogue', range(series('Annihilation: Heralds of Galactus', 2007), 1, 2))
    ]
  });

  addEvent({
    id: 'event-world-war-hulk', title: 'World War Hulk', phaseId: 'phase-5', priority: 'Essential', writer: 'Greg Pak', years: '2007',
    categories: ['Hulk', 'Avengers', 'Illuminati'], roadmapIds: ['hulk', 'avengers', 'illuminati'], order: 520,
    summary: 'Hulk returns from Sakaar to confront the heroes responsible for his exile.',
    sections: [
      section('Prelude', 'Recommended', 'Prelude', [oneShot('World War Hulk Prologue: World Breaker', 2007)]),
      section('Main event', 'Essential', 'Core Chapter', range(series('World War Hulk', 2007), 1, 5)),
      section('Hulk-side chapters', 'Essential', 'Character Tie-in', range(series('Incredible Hulk', 1999), 106, 111)),
      section('Strong tie-ins', 'Recommended', 'Tie-in', concat(range(series('World War Hulk: X-Men', 2007), 1, 3), range(series('World War Hulk: Front Line', 2007), 1, 6))),
      section('Peripheral battles', 'Optional', 'Tie-in', concat(range(series('World War Hulk: Gamma Corps', 2007), 1, 4), range(series('World War Hulk: Aftersmash', 2008), 1, 1)))
    ]
  });

  addEvent({
    id: 'event-annihilation-conquest', title: 'Annihilation: Conquest', phaseId: 'phase-5', priority: 'Peak', writer: 'Dan Abnett, Andy Lanning and others', years: '2007–2008',
    categories: ['Cosmic', 'Guardians of the Galaxy', 'Nova', 'Ultron'], roadmapIds: ['guardians', 'nova', 'ultron', 'cosmic'], order: 530,
    summary: 'The Phalanx and Ultron seize the Kree empire while Star-Lord assembles the team that becomes the modern Guardians.',
    sections: [
      section('Opening', 'Essential', 'Prelude', [oneShot('Annihilation: Conquest Prologue', 2007)]),
      section('Star-Lord formation story', 'Essential', 'Prelude', range(series('Annihilation: Conquest - Star-Lord', 2007), 1, 4)),
      section('Nova chapters', 'Recommended', 'Character Tie-in', range(series('Nova', 2007), 4, 7)),
      section('Other character minis', 'Optional', 'Tie-in', concat(range(series('Annihilation: Conquest - Quasar', 2007), 1, 4), range(series('Annihilation: Conquest - Wraith', 2007), 1, 4))),
      section('Main event', 'Peak', 'Core Chapter', range(series('Annihilation: Conquest', 2008), 1, 6))
    ], prerequisites: ['event-annihilation']
  });

  addEvent({
    id: 'event-messiah-complex', title: 'Messiah Complex', phaseId: 'phase-5', priority: 'Peak', writer: 'Various', years: '2007–2008',
    categories: ['X-Men', 'X-Factor', 'Cable', 'New Mutants'], roadmapIds: ['x-men', 'x-factor', 'cable'], order: 540,
    summary: 'The first mutant birth since M-Day sends every faction racing to control the future.',
    sections: [section('Complete thirteen-part crossover', 'Essential', 'Core Chapter', [
      oneShot('X-Men: Messiah Complex', 2007), issue(series('Uncanny X-Men', 1963), 492), issue(series('X-Factor', 2005), 25), issue(series('New X-Men', 2004), 44), issue(series('X-Men', 1991), 205),
      issue(series('Uncanny X-Men', 1963), 493), issue(series('X-Factor', 2005), 26), issue(series('New X-Men', 2004), 45), issue(series('X-Men', 1991), 206),
      issue(series('Uncanny X-Men', 1963), 494), issue(series('X-Factor', 2005), 27), issue(series('New X-Men', 2004), 46), issue(series('X-Men', 1991), 207)
    ])], prerequisites: ['event-house-of-m']
  });

  addEvent({
    id: 'event-secret-invasion', title: 'Secret Invasion', phaseId: 'phase-5', priority: 'Essential', writer: 'Brian Michael Bendis', years: '2008',
    categories: ['Avengers', 'Fantastic Four', 'Iron Man', 'Skrulls'], roadmapIds: ['avengers', 'iron-man', 'fantastic-four'], order: 560,
    summary: 'Years of Skrull infiltration erupt into open war and reshape the Avengers era.',
    sections: [
      section('Illuminati setup', 'Essential', 'Prelude', range(series('New Avengers: Illuminati', 2007), 1, 5)),
      section('Main event', 'Essential', 'Core Chapter', range(series('Secret Invasion', 2008), 1, 8)),
      section('New Avengers chapters', 'Recommended', 'Tie-in', concat(range(series('New Avengers', 2004), 38, 47))),
      section('Mighty Avengers chapters', 'Recommended', 'Tie-in', range(series('Mighty Avengers', 2007), 12, 20)),
      section('Fantastic Four tie-in', 'Optional', 'Tie-in', range(series('Secret Invasion: Fantastic Four', 2008), 1, 3))
    ]
  });

  addEvent({
    id: 'event-siege', title: 'Siege', phaseId: 'phase-5', priority: 'Essential', writer: 'Brian Michael Bendis', years: '2010',
    categories: ['Avengers', 'Thor', 'Sentry'], roadmapIds: ['avengers', 'thor', 'sentry'], order: 590,
    summary: 'Norman Osborn’s Dark Reign ends in an assault on Asgard with the Avengers, Thor and Sentry at the centre.',
    sections: [
      section('Main event', 'Essential', 'Core Chapter', range(series('Siege', 2010), 1, 4)),
      section('Avengers conclusions', 'Essential', 'Epilogue', concat(range(series('New Avengers', 2004), 61, 64), range(series('Dark Avengers', 2009), 13, 16), [oneShot('New Avengers Finale', 2010)])),
      section('Thor chapters', 'Recommended', 'Tie-in', range(series('Thor', 1966), 607, 610)),
      section('Embedded aftermath', 'Recommended', 'Epilogue', [oneShot('Siege: Embedded', 2010), oneShot('Siege: Loki', 2010)])
    ], prerequisites: ['event-secret-invasion']
  });

  addEvent({
    id: 'event-second-coming', title: 'Second Coming', phaseId: 'phase-5', priority: 'Peak', writer: 'Various', years: '2010',
    categories: ['X-Men', 'X-Force', 'Cable', 'New Mutants'], roadmapIds: ['x-men', 'cable'], order: 600,
    summary: 'Hope returns to the present as mutantkind faces a coordinated final assault.',
    sections: [section('Complete core', 'Essential', 'Core Chapter', [
      oneShot('X-Men: Second Coming', 2010), issue(series('Uncanny X-Men', 1963), 523), issue(series('New Mutants', 2009), 12), issue(series('X-Men Legacy', 2008), 235), issue(series('X-Force', 2008), 26),
      issue(series('Uncanny X-Men', 1963), 524), issue(series('New Mutants', 2009), 13), issue(series('X-Men Legacy', 2008), 236), issue(series('X-Force', 2008), 27),
      issue(series('Uncanny X-Men', 1963), 525), issue(series('New Mutants', 2009), 14), issue(series('X-Men Legacy', 2008), 237), issue(series('X-Force', 2008), 28), oneShot('X-Men: Second Coming Finale', 2010)
    ])], prerequisites: ['event-messiah-complex']
  });

  addEvent({
    id: 'event-avengers-vs-xmen', title: 'Avengers vs. X-Men', phaseId: 'phase-6', priority: 'Essential', writer: 'Various', years: '2012',
    categories: ['Avengers', 'X-Men', 'Scarlet Witch', 'Cyclops', 'Iron Man'], roadmapIds: ['avengers', 'x-men', 'cyclops', 'wanda-vision', 'iron-man'], order: 650,
    summary: 'The Phoenix Force returns, pitting the Avengers against Cyclops and the mutant nation over Hope’s destiny.',
    sections: [
      section('Main event', 'Essential', 'Core Chapter', concat([oneShot('Avengers vs. X-Men #0', 2012, 'Earth-616', { displayTitle: 'Avengers vs. X-Men (2012) #0' })], range(series('Avengers vs. X-Men', 2012), 1, 12))),
      section('Uncanny X-Men tie-ins', 'Essential', 'Character Tie-in', range(series('Uncanny X-Men', 2011), 11, 20)),
      section('Consequences', 'Recommended', 'Epilogue', range(series('AvX: Consequences', 2012), 1, 5)),
      section('Expanded tie-ins', 'Optional', 'Tie-in', range(series('AVX: VS', 2012), 1, 6))
    ]
  });

  addEvent({
    id: 'event-infinity-2013', title: 'Infinity', phaseId: 'phase-6', priority: 'Essential', writer: 'Jonathan Hickman', years: '2013',
    categories: ['Avengers', 'Illuminati', 'Thanos', 'Cosmic'], roadmapIds: ['avengers', 'illuminati', 'thanos', 'cosmic'], order: 690,
    summary: 'The Avengers confront the Builders in space while Thanos attacks an unguarded Earth.',
    sections: [
      section('Main event', 'Essential', 'Core Chapter', range(series('Infinity', 2013), 1, 6)),
      section('Avengers chapters', 'Essential', 'Tie-in', range(series('Avengers', 2012), 18, 23)),
      section('New Avengers chapters', 'Essential', 'Tie-in', range(series('New Avengers', 2013), 9, 12))
    ]
  });

  addEvent({
    id: 'event-secret-wars-2015', title: 'Secret Wars', phaseId: 'phase-6', priority: 'Peak', writer: 'Jonathan Hickman', years: '2015–2016',
    categories: ['Fantastic Four', 'Avengers', 'Illuminati', 'Doctor Doom', 'Ultimate Universe'], roadmapIds: ['fantastic-four', 'avengers', 'illuminati', 'doom', 'ultimate'], order: 720,
    summary: 'The final incursion destroys the Multiverse, leaving Reed Richards and Doctor Doom to settle years of ideological conflict on Battleworld.',
    sections: [
      section('Main event', 'Peak', 'Core Chapter', range(series('Secret Wars', 2015), 1, 9)),
      section('Hickman lead-in', 'Essential', 'Prerequisite', concat(range(series('Avengers', 2012), 35, 44), range(series('New Avengers', 2013), 24, 33))),
      section('Selected Battleworld stories', 'Recommended', 'Tie-in', concat(range(series('Thors', 2015), 1, 4), range(series('Siege', 2015), 1, 4), range(series('Old Man Logan', 2015), 1, 5)))
    ], prerequisites: ['event-infinity-2013']
  });

  addEvent({
    id: 'event-war-of-realms', title: 'War of the Realms', phaseId: 'phase-7', priority: 'Essential', writer: 'Jason Aaron', years: '2019',
    categories: ['Thor', 'Avengers', 'Magic'], roadmapIds: ['thor', 'avengers'], order: 770,
    summary: 'Malekith’s campaign reaches Midgard, paying off years of Jason Aaron’s Thor mythology.',
    sections: [
      section('Main event', 'Essential', 'Core Chapter', range(series('War of the Realms', 2019), 1, 6)),
      section('Thor chapters', 'Essential', 'Character Tie-in', range(series('Thor', 2018), 12, 16)),
      section('Omega', 'Recommended', 'Epilogue', [oneShot('War of the Realms Omega', 2019)]),
      section('Selected strong tie-ins', 'Recommended', 'Tie-in', concat(range(series('War of the Realms: Journey into Mystery', 2019), 1, 5), range(series('War of the Realms: New Agents of Atlas', 2019), 1, 4)))
    ]
  });

  addEvent({
    id: 'event-absolute-carnage', title: 'Absolute Carnage', phaseId: 'phase-8', priority: 'Essential', writer: 'Donny Cates', years: '2019',
    categories: ['Venom', 'Spider-Man', 'Symbiotes'], roadmapIds: ['venom', 'spider-man'], order: 805,
    summary: 'Carnage hunts everyone who has ever bonded with a symbiote, accelerating Knull’s return.',
    sections: [
      section('Main event', 'Essential', 'Core Chapter', range(series('Absolute Carnage', 2019), 1, 5)),
      section('Venom chapters', 'Essential', 'Character Tie-in', range(series('Venom', 2018), 16, 20)),
      section('Spider-Man tie-ins', 'Recommended', 'Character Tie-in', range(series('Amazing Spider-Man', 2018), 30, 31)),
      section('Selected expansion', 'Optional', 'Tie-in', concat(range(series('Absolute Carnage: Miles Morales', 2019), 1, 3), range(series('Absolute Carnage: Lethal Protectors', 2019), 1, 3)))
    ]
  });

  addEvent({
    id: 'event-king-in-black', title: 'King in Black', phaseId: 'phase-8', priority: 'Essential', writer: 'Donny Cates', years: '2020–2021',
    categories: ['Venom', 'Symbiotes', 'Cosmic'], roadmapIds: ['venom', 'cosmic'], order: 825,
    summary: 'Knull invades Earth at the climax of Donny Cates’ Venom mythology.',
    sections: [
      section('Main event', 'Essential', 'Core Chapter', range(series('King in Black', 2020), 1, 5)),
      section('Venom chapters', 'Essential', 'Character Tie-in', range(series('Venom', 2018), 31, 35)),
      section('Selected strong tie-ins', 'Recommended', 'Tie-in', concat(range(series('King in Black: Thunderbolts', 2021), 1, 3), range(series('King in Black: Black Knight', 2021), 1, 1)))
    ], prerequisites: ['event-absolute-carnage']
  });

  addEvent({
    id: 'event-judgment-day', title: 'A.X.E.: Judgment Day', phaseId: 'phase-8', priority: 'Peak', writer: 'Kieron Gillen', years: '2022',
    categories: ['X-Men', 'Avengers', 'Eternals', 'Cosmic'], roadmapIds: ['x-men', 'avengers', 'cosmic'], order: 860,
    summary: 'Eternals, mutants and Avengers face a newly awakened Celestial that judges every person on Earth.',
    sections: [
      section('Main event', 'Essential', 'Core Chapter', range(series('A.X.E.: Judgment Day', 2022), 1, 6)),
      section('Opening and omega', 'Essential', 'Prelude/Epilogue', [oneShot('A.X.E.: Eve of Judgment', 2022), oneShot('A.X.E.: Judgment Day Omega', 2022)]),
      section('Immortal X-Men chapters', 'Recommended', 'Character Tie-in', list(series('Immortal X-Men', 2022), [5, 6, 7])),
      section('X-Men Red chapters', 'Recommended', 'Character Tie-in', list(series('X-Men Red', 2022), [5, 6, 7])),
      section('Eternals foundation', 'Recommended', 'Prerequisite', range(series('Eternals', 2021), 1, 12))
    ]
  });

  addEvent({
    id: 'event-blood-hunt', title: 'Blood Hunt', phaseId: 'phase-8', priority: 'Recommended', writer: 'Jed MacKay', years: '2024',
    categories: ['Avengers', 'Doctor Strange', 'Blade', 'Magic'], roadmapIds: ['avengers', 'doctor-strange', 'blade'], order: 895,
    summary: 'A global vampire assault turns Blade, Doctor Strange and the Avengers into the centre of a supernatural crisis.',
    sections: [
      section('Main event', 'Recommended', 'Core Chapter', range(series('Blood Hunt', 2024), 1, 5)),
      section('Avengers chapters', 'Recommended', 'Character Tie-in', range(series('Avengers', 2023), 14, 17)),
      section('Doctor Strange chapters', 'Recommended', 'Character Tie-in', range(series('Doctor Strange', 2023), 15, 18)),
      section('Moon Knight tie-in', 'Optional', 'Tie-in', range(series('Vengeance of the Moon Knight', 2024), 5, 8))
    ]
  });

  addEvent({
    id: 'event-one-world-under-doom', title: 'One World Under Doom', phaseId: 'phase-9', priority: 'Essential', writer: 'Ryan North', years: '2025',
    categories: ['Doctor Doom', 'Fantastic Four', 'Avengers', 'Doctor Strange'], roadmapIds: ['doom', 'fantastic-four', 'avengers', 'doctor-strange'], order: 920,
    summary: 'Doctor Doom uses his new magical and political power to impose his rule on the world.',
    sections: [
      section('Main event', 'Essential', 'Core Chapter', range(series('One World Under Doom', 2025), 1, 9)),
      section('Fantastic Four chapters', 'Recommended', 'Character Tie-in', range(series('Fantastic Four', 2022), 28, 33)),
      section('Avengers chapters', 'Recommended', 'Character Tie-in', range(series('Avengers', 2023), 25, 30)),
      section('Doctor Strange connection', 'Recommended', 'Character Tie-in', range(series('Doctor Strange of Death', 2025), 1, 5), 'Provisional current-era companion until the completed publication map is locked.' )
    ], auditStatus: 'Provisional'
  });

  addEvent({
    id: 'event-armageddon', title: 'Avengers: Armageddon', phaseId: 'phase-9', priority: 'Current', writer: 'Chip Zdarsky', years: '2026',
    categories: ['Avengers', 'Captain America', 'Wolverine', 'Doctor Doom'], roadmapIds: ['avengers', 'captain-america', 'wolverine', 'doom'], order: 950,
    summary: 'A current five-part event growing out of the Doom era and Captain America’s latest conflict.',
    sections: [
      section('Main event', 'Essential', 'Core Chapter', [
        issue(series('Avengers: Armageddon', 2026, 'Earth-616', { status: 'ongoing' }), 1),
        issue(series('Avengers: Armageddon', 2026), 2, { status: 'solicited' }), issue(series('Avengers: Armageddon', 2026), 3, { status: 'solicited' }), issue(series('Avengers: Armageddon', 2026), 4, { status: 'solicited' }), issue(series('Avengers: Armageddon', 2026), 5, { status: 'solicited' })
      ])
    ], current: true, auditStatus: 'Current'
  });

  addEvent({
    id: 'event-queen-in-black', title: 'Queen in Black', phaseId: 'phase-9', priority: 'Current', writer: 'Al Ewing', years: '2026',
    categories: ['Venom', 'Symbiotes', 'Cosmic'], roadmapIds: ['venom', 'cosmic'], order: 960,
    summary: 'The next symbiote event following Knull’s return and the modern Venom cosmology.',
    sections: [section('Five-part event', 'Essential', 'Core Chapter', range(series('Queen in Black', 2026, 'Earth-616', { status: 'upcoming' }), 1, 5, { status: 'solicited' }))],
    current: true, auditStatus: 'Current'
  });

  /* =========================
     THOR
     ========================= */
  addItem({
    id: 'thor-simonson', title: 'Thor by Walt Simonson', phaseId: 'phase-1', priority: 'Peak', writer: 'Walt Simonson', artists: ['Walt Simonson', 'Sal Buscema'], years: '1983–1987',
    categories: ['Thor', 'Asgard', 'Magic'], roadmapIds: ['thor'], order: 110,
    summary: 'Beta Ray Bill, Surtur, Skurge, Balder and Asgardian mythology are rebuilt into one of Marvel’s definitive creator runs.',
    note: 'Thor #356 and #370 are publication-flow fill-ins, not Simonson chapters.',
    sections: [
      section('Simonson main run', 'Peak', 'Main Run', concat(range(thor1966, 337, 355), range(thor1966, 357, 369), range(thor1966, 371, 382))),
      section('Balder companion mini', 'Recommended', 'Companion', range(series('Balder the Brave', 1985), 1, 4)),
      section('Publication-flow fill-ins', 'Optional', 'Flow Issue', list(thor1966, [356, 370]))
    ], next: ['thor-defalco-frenz']
  });

  addItem({
    id: 'thor-defalco-frenz', title: 'Thor by Tom DeFalco and Ron Frenz', phaseId: 'phase-1', priority: 'Recommended', writer: 'Tom DeFalco', artists: ['Ron Frenz'], years: '1987–1993',
    categories: ['Thor'], roadmapIds: ['thor'], order: 125,
    summary: 'A long, classic-minded continuation that introduces Eric Masterson and carries Thor into the early 1990s.',
    sections: [
      section('Opening continuation', 'Recommended', 'Main Run', range(thor1966, 383, 400)),
      section('Eric Masterson core', 'Essential', 'Main Run', range(thor1966, 408, 432)),
      section('Later continuation', 'Optional', 'Main Run', range(thor1966, 433, 459))
    ]
  });

  addItem({
    id: 'thor-blood-and-thunder', title: 'Blood and Thunder', phaseId: 'phase-2', priority: 'Recommended', writer: 'Ron Marz and Jim Starlin', years: '1993–1994',
    categories: ['Thor', 'Thanos', 'Cosmic'], roadmapIds: ['thor', 'thanos'], order: 285,
    summary: 'Thor’s breakdown becomes a cosmic crisis involving Silver Surfer, Warlock, Thanos and the Infinity Watch.',
    sections: [
      section('Thor chapters', 'Essential', 'Core Chapter', range(thor1966, 468, 471)),
      section('Silver Surfer chapters', 'Essential', 'Core Chapter', range(series('Silver Surfer', 1987), 86, 88)),
      section('Warlock chapters', 'Essential', 'Core Chapter', range(series('Warlock Chronicles', 1993), 6, 8)),
      section('Infinity Watch chapters', 'Essential', 'Core Chapter', range(series('Warlock and the Infinity Watch', 1992), 23, 25))
    ]
  });

  addItem({
    id: 'thor-jurgens', title: 'Thor by Dan Jurgens', phaseId: 'phase-3', priority: 'Recommended', writer: 'Dan Jurgens', artists: ['John Romita Jr.', 'Andy Kubert', 'Stuart Immonen'], years: '1998–2004',
    categories: ['Thor'], roadmapIds: ['thor'], order: 350,
    summary: 'Thor returns after Heroes Reborn, then faces the consequences of ruling Earth as Lord of Asgard.',
    sections: [section('Complete run', 'Recommended', 'Main Run', range(series('Thor', 1998), 1, 79))]
  });

  addItem({
    id: 'thor-ragnarok-2004', title: 'Ragnarok', phaseId: 'phase-4', priority: 'Peak', writer: 'Michael Avon Oeming and Daniel Berman', years: '2004',
    categories: ['Thor'], roadmapIds: ['thor'], order: 420,
    summary: 'Thor confronts the cycle of Ragnarok and the forces that profit from Asgard’s endless destruction.',
    sections: [section('Complete arc', 'Peak', 'Core Chapter', range(series('Thor', 1998), 80, 85))]
  });

  addItem({
    id: 'thor-jms-gillen', title: 'Thor by JMS and Kieron Gillen', phaseId: 'phase-5', priority: 'Essential', writer: 'J. Michael Straczynski and Kieron Gillen', artists: ['Olivier Coipel', 'Billy Tan'], years: '2007–2010',
    categories: ['Thor', 'Loki'], roadmapIds: ['thor'], order: 550,
    summary: 'Thor restores Asgard in Oklahoma before Loki’s schemes lead directly into Siege.',
    sections: [
      section('JMS restoration era', 'Essential', 'Main Run', concat(range(series('Thor', 2007), 1, 12), range(thor1966, 600, 603))),
      section('Gillen continuation', 'Essential', 'Main Run', range(thor1966, 604, 614))
    ], prerequisites: ['event-siege']
  });

  addItem({
    id: 'kid-loki-journey', title: 'Journey into Mystery: Kid Loki', phaseId: 'phase-6', priority: 'Peak', writer: 'Kieron Gillen', artists: ['Doug Braithwaite', 'Richard Elson'], years: '2011–2012',
    categories: ['Thor', 'Loki', 'Magic'], roadmapIds: ['thor', 'loki'], order: 625,
    summary: 'A reborn young Loki tries to escape the destiny and reputation of his former self.',
    sections: [
      section('Main run', 'Peak', 'Main Run', range(series('Journey into Mystery', 1952), 622, 645)),
      section('Exiled crossover', 'Recommended', 'Crossover', concat([oneShot('Exiled', 2012)], range(series('New Mutants', 2009), 42, 43), range(series('Mighty Thor', 2011), 18, 21)))
    ]
  });

  addItem({
    id: 'thor-jason-aaron', title: 'Thor by Jason Aaron', phaseId: 'phase-6', priority: 'Peak', writer: 'Jason Aaron', artists: ['Esad Ribić', 'Russell Dauterman', 'Mike Del Mundo'], years: '2012–2019',
    categories: ['Thor', 'Jane Foster', 'Magic'], roadmapIds: ['thor', 'legacy-heroes'], order: 680,
    summary: 'The God Butcher, Jane Foster’s Thor, the Unworthy Thor and War of the Realms form a single long mythology about worthiness and sacrifice.',
    sections: [
      section('God of Thunder', 'Peak', 'Main Run', range(series('Thor: God of Thunder', 2012), 1, 25)),
      section('Jane Foster begins', 'Essential', 'Main Run', range(series('Thor', 2014), 1, 8)),
      section('Mighty Thor', 'Peak', 'Main Run', range(series('Mighty Thor', 2015), 1, 23)),
      section('The Unworthy Thor', 'Essential', 'Mini-series', range(series('The Unworthy Thor', 2016), 1, 5)),
      section('Legacy finale', 'Essential', 'Main Run', range(thor1966, 700, 706)),
      section('Final Thor run', 'Essential', 'Main Run', range(series('Thor', 2018), 1, 16)),
      section('King Thor epilogue', 'Peak', 'Epilogue', range(series('King Thor', 2019), 1, 4))
    ], prerequisites: ['event-war-of-realms']
  });

  addItem({
    id: 'thor-donny-cates', title: 'Thor by Donny Cates', phaseId: 'phase-8', priority: 'Optional', writer: 'Donny Cates and Torunn Grønbekk', artists: ['Nic Klein'], years: '2020–2023',
    categories: ['Thor', 'Cosmic'], roadmapIds: ['thor'], order: 835,
    summary: 'A high-volume cosmic/action run built around Galactus, the Black Winter, Mjolnir and Banner of War.',
    sections: [section('Complete run', 'Optional', 'Main Run', range(series('Thor', 2020), 1, 35))]
  });

  addItem({
    id: 'immortal-thor', title: 'Immortal Thor', phaseId: 'phase-8', priority: 'Peak', writer: 'Al Ewing', artists: ['Martín Cóccolo'], years: '2023–2025',
    categories: ['Thor', 'Magic', 'Cosmic'], roadmapIds: ['thor'], order: 890,
    summary: 'Thor confronts ancient narrative forces, elder gods and the nature of myth itself.',
    sections: [section('Complete run', 'Peak', 'Main Run', range(series('Immortal Thor', 2023), 1, 25))]
  });

  addItem({
    id: 'mortal-thor', title: 'Mortal Thor', phaseId: 'phase-9', priority: 'Current', writer: 'Al Ewing', years: '2025–2026',
    categories: ['Thor'], roadmapIds: ['thor'], order: 935, current: true, auditStatus: 'Current',
    summary: 'Al Ewing’s continuation after Immortal Thor, following a changed relationship between godhood and mortality.',
    sections: [section('Published issues', 'Essential', 'Main Run', range(series('Mortal Thor', 2025, 'Earth-616', { status: 'ongoing' }), 1, 10))]
  });

  /* =========================
     HULK
     ========================= */
  addItem({
    id: 'hulk-peter-david', title: 'Incredible Hulk by Peter David', phaseId: 'phase-1', priority: 'Peak', writer: 'Peter David', artists: ['Todd McFarlane', 'Jeff Purves', 'Dale Keown', 'Gary Frank'], years: '1987–1998',
    categories: ['Hulk'], roadmapIds: ['hulk'], order: 115,
    summary: 'The defining psychological Hulk epic: Gray Hulk, Joe Fixit, merged Hulk, the Pantheon, trauma and the fractured Banner psyche.',
    sections: [
      section('Main numbered run', 'Peak', 'Main Run', range(incredibleHulk1968, 331, 467)),
      section('Future Imperfect', 'Peak', 'Mini-series', range(series('Hulk: Future Imperfect', 1992), 1, 2)),
      section('The End', 'Recommended', 'Epilogue', [oneShot('Hulk: The End', 2002)])
    ]
  });

  addItem({
    id: 'hulk-paul-jenkins', title: 'Hulk by Paul Jenkins', phaseId: 'phase-3', priority: 'Recommended', writer: 'Paul Jenkins', artists: ['Ron Garney', 'John Romita Jr.'], years: '2000–2002',
    categories: ['Hulk'], roadmapIds: ['hulk'], order: 365,
    summary: 'A strong psychological continuation exploring Banner’s personalities and abuse history after the 1999 relaunch.',
    sections: [section('Complete run', 'Recommended', 'Main Run', range(series('Incredible Hulk', 1999), 12, 33))]
  });

  addItem({
    id: 'hulk-bruce-jones', title: 'Hulk by Bruce Jones', phaseId: 'phase-3', priority: 'Optional', writer: 'Bruce Jones', artists: ['John Romita Jr.', 'Mike Deodato Jr.'], years: '2002–2004',
    categories: ['Hulk'], roadmapIds: ['hulk'], order: 370,
    summary: 'A fugitive conspiracy thriller that begins strongly but becomes increasingly detached from the main Hulk mythos.',
    sections: [section('Complete run', 'Optional', 'Main Run', range(series('Incredible Hulk', 1999), 34, 76))]
  });

  addItem({
    id: 'planet-hulk', title: 'Planet Hulk', phaseId: 'phase-4', priority: 'Peak', writer: 'Greg Pak', artists: ['Carlo Pagulayan', 'Aaron Lopresti'], years: '2006–2007',
    categories: ['Hulk', 'Cosmic'], roadmapIds: ['hulk'], order: 475,
    summary: 'Exiled to Sakaar, Hulk becomes gladiator, revolutionary and king in a complete science-fantasy epic.',
    sections: [
      section('Bridge to Sakaar', 'Recommended', 'Prelude', range(series('Incredible Hulk', 1999), 88, 91)),
      section('Planet Hulk core', 'Peak', 'Main Run', range(series('Incredible Hulk', 1999), 92, 105)),
      section('Giant-Size companion', 'Recommended', 'Companion', [oneShot('Giant-Size Hulk', 2006)])
    ], next: ['event-world-war-hulk']
  });

  addItem({
    id: 'hulk-greg-pak-aftermath', title: 'Incredible Hulks by Greg Pak', phaseId: 'phase-5', priority: 'Recommended', writer: 'Greg Pak', years: '2009–2011',
    categories: ['Hulk', 'Legacy Heroes'], roadmapIds: ['hulk', 'legacy-heroes'], order: 610,
    summary: 'Banner, Skaar, She-Hulk and the wider gamma family deal with the long consequences of Planet Hulk and World War Hulk.',
    sections: [
      section('Incredible Hulk return', 'Recommended', 'Main Run', range(incredibleHulk1968, 600, 611)),
      section('Incredible Hulks', 'Recommended', 'Main Run', range(series('Incredible Hulks', 2010), 612, 635))
    ], prerequisites: ['event-world-war-hulk']
  });

  addItem({
    id: 'totally-awesome-hulk', title: 'The Totally Awesome Hulk', phaseId: 'phase-7', priority: 'Recommended', writer: 'Greg Pak', artists: ['Frank Cho', 'Mike Choi'], years: '2015–2017',
    categories: ['Hulk', 'Amadeus Cho', 'Legacy Heroes'], roadmapIds: ['hulk', 'legacy-heroes'], order: 755,
    summary: 'Amadeus Cho takes the Hulk identity and confronts the difference between controlling power and being consumed by it.',
    sections: [
      section('Totally Awesome Hulk', 'Recommended', 'Main Run', range(series('Totally Awesome Hulk', 2015), 1, 23)),
      section('Legacy continuation', 'Recommended', 'Main Run', range(incredibleHulk1968, 709, 717))
    ]
  });

  addItem({
    id: 'immortal-hulk', title: 'Immortal Hulk', phaseId: 'phase-7', priority: 'Peak', writer: 'Al Ewing', artists: ['Joe Bennett', 'Ruy José'], years: '2018–2021',
    categories: ['Hulk', 'Horror', 'Cosmic'], roadmapIds: ['hulk'], order: 790,
    summary: 'Hulk becomes a body-horror, theological and psychological saga about gamma, abuse, death and the Green Door.',
    sections: [
      section('Main run', 'Peak', 'Main Run', range(series('Immortal Hulk', 2018), 1, 50)),
      section('Essential one-shots', 'Recommended', 'Companion', [oneShot('Immortal Hulk: The Best Defense', 2018), oneShot('Immortal Hulk: The Threshing Place', 2020), oneShot('Immortal Hulk: The Flatline', 2021), oneShot('Immortal Hulk: Time of Monsters', 2021)])
    ]
  });

  addItem({
    id: 'hulk-cates-ottley', title: 'Hulk by Donny Cates and Ryan Ottley', phaseId: 'phase-8', priority: 'Optional', writer: 'Donny Cates and Ryan Ottley', artists: ['Ryan Ottley'], years: '2021–2023',
    categories: ['Hulk'], roadmapIds: ['hulk'], order: 850,
    summary: 'A loud science-fiction detour built around Starship Hulk and Titan.',
    sections: [section('Complete run', 'Optional', 'Main Run', range(series('Hulk', 2021), 1, 14))]
  });

  addItem({
    id: 'incredible-hulk-pkj', title: 'Incredible Hulk by Phillip Kennedy Johnson', phaseId: 'phase-8', priority: 'Recommended', writer: 'Phillip Kennedy Johnson', artists: ['Nic Klein'], years: '2023–2025',
    categories: ['Hulk', 'Horror'], roadmapIds: ['hulk'], order: 885,
    summary: 'Banner and Hulk are hunted through an American-gothic Age of Monsters.',
    sections: [section('Complete first series', 'Recommended', 'Main Run', range(series('Incredible Hulk', 2023), 1, 30))]
  });

  addItem({
    id: 'infernal-hulk', title: 'Infernal Hulk', phaseId: 'phase-9', priority: 'Current', writer: 'Phillip Kennedy Johnson', years: '2025–2026',
    categories: ['Hulk', 'Horror'], roadmapIds: ['hulk'], order: 940, current: true, auditStatus: 'Current',
    summary: 'The horror direction continues as Hulk’s monstrous mythology escalates.',
    sections: [section('Published issues', 'Essential', 'Main Run', range(series('Infernal Hulk', 2025, 'Earth-616', { status: 'ongoing' }), 1, 8))]
  });

  /* =========================
     IRON MAN
     ========================= */
  addItem({
    id: 'iron-man-demon-bottle', title: 'Demon in a Bottle', phaseId: 'phase-0', priority: 'Peak', writer: 'David Michelinie and Bob Layton', artists: ['John Romita Jr.'], years: '1979',
    categories: ['Iron Man'], roadmapIds: ['iron-man'], order: 20,
    summary: 'Tony’s alcoholism, corporate pressure and damaged relationships become the centre of a defining Iron Man arc.',
    sections: [section('Complete arc', 'Peak', 'Core Chapter', range(ironMan1968, 120, 128))]
  });

  addItem({
    id: 'iron-man-doomquest', title: 'Doomquest', phaseId: 'phase-0', priority: 'Recommended', writer: 'David Michelinie and Bob Layton', artists: ['John Romita Jr.'], years: '1981',
    categories: ['Iron Man', 'Doctor Doom'], roadmapIds: ['iron-man', 'doom'], order: 30,
    summary: 'Iron Man and Doctor Doom are stranded in Arthurian Britain and forced into an uneasy rivalry.',
    sections: [section('Complete story', 'Recommended', 'Core Chapter', range(ironMan1968, 149, 150))]
  });

  addItem({
    id: 'iron-man-oneil-stane', title: 'The Obadiah Stane and Rhodey Era', phaseId: 'phase-1', priority: 'Essential', writer: 'Dennis O’Neil', artists: ['Luke McDonnell', 'Mark Bright'], years: '1982–1985',
    categories: ['Iron Man', 'War Machine'], roadmapIds: ['iron-man'], order: 120,
    summary: 'Obadiah Stane destroys Tony’s life while James Rhodes becomes Iron Man, leading to Iron Monger.',
    sections: [section('Complete era', 'Essential', 'Main Run', range(ironMan1968, 160, 200))]
  });

  addItem({
    id: 'iron-man-armor-wars', title: 'Armor Wars', phaseId: 'phase-1', priority: 'Peak', writer: 'David Michelinie and Bob Layton', artists: ['Mark Bright'], years: '1987–1988',
    categories: ['Iron Man'], roadmapIds: ['iron-man'], order: 165,
    summary: 'Tony discovers that his technology powers multiple armoured criminals and launches a morally compromising campaign to reclaim it.',
    sections: [
      section('Setup', 'Recommended', 'Prelude', range(ironMan1968, 215, 216)),
      section('Armor Wars core', 'Peak', 'Main Run', range(ironMan1968, 225, 232)),
      section('Armor Wars II', 'Optional', 'Follow-up', range(ironMan1968, 258, 266))
    ]
  });

  addItem({
    id: 'iron-man-busiek-chen', title: 'Iron Man by Kurt Busiek and Sean Chen', phaseId: 'phase-3', priority: 'Recommended', writer: 'Kurt Busiek', artists: ['Sean Chen'], years: '1998–2000',
    categories: ['Iron Man'], roadmapIds: ['iron-man'], order: 335,
    summary: 'A clean Heroes Return reconstruction of Tony Stark, his company and his supporting cast.',
    sections: [section('Complete run', 'Recommended', 'Main Run', range(series('Iron Man', 1998), 1, 25))]
  });

  addItem({
    id: 'iron-man-mike-grell', title: 'Iron Man by Mike Grell', phaseId: 'phase-3', priority: 'Recommended', writer: 'Mike Grell', artists: ['Michael Ryan'], years: '2002–2003',
    categories: ['Iron Man'], roadmapIds: ['iron-man'], order: 375,
    summary: 'A grounded espionage-leaning period that treats Tony as a complicated industrialist and adventurer.',
    sections: [section('Complete run', 'Recommended', 'Main Run', range(series('Iron Man', 1998), 50, 69))]
  });

  addItem({
    id: 'iron-man-extremis', title: 'Extremis', phaseId: 'phase-4', priority: 'Peak', writer: 'Warren Ellis', artists: ['Adi Granov'], years: '2005–2006',
    categories: ['Iron Man'], roadmapIds: ['iron-man'], order: 440,
    summary: 'A technological and visual reinvention that becomes the clearest modern Iron Man starting point.',
    sections: [section('Complete story', 'Peak', 'Main Run', range(series('Iron Man', 2004), 1, 6))]
  });

  addItem({
    id: 'iron-man-director-shield', title: 'Iron Man: Director of S.H.I.E.L.D.', phaseId: 'phase-4', priority: 'Recommended', writer: 'Daniel and Charles Knauf', years: '2006–2008',
    categories: ['Iron Man', 'S.H.I.E.L.D.'], roadmapIds: ['iron-man'], order: 485,
    summary: 'Tony’s post-Civil War role as America’s top superhero administrator turns Iron Man into a political and espionage book.',
    sections: [section('Core run', 'Recommended', 'Main Run', range(series('Iron Man', 2004), 7, 28))], prerequisites: ['event-civil-war']
  });

  addItem({
    id: 'iron-man-fraction', title: 'Invincible Iron Man by Matt Fraction', phaseId: 'phase-5', priority: 'Peak', writer: 'Matt Fraction', artists: ['Salvador Larroca'], years: '2008–2012',
    categories: ['Iron Man'], roadmapIds: ['iron-man'], order: 575,
    summary: 'Tony faces Ezekiel Stane, Dark Reign, the destruction of his own mind and the long rebuilding of Iron Man.',
    sections: [
      section('Numbered volume', 'Peak', 'Main Run', range(series('Invincible Iron Man', 2008), 1, 33)),
      section('Legacy continuation', 'Peak', 'Main Run', range(series('Invincible Iron Man', 2008), 500, 527))
    ]
  });

  addItem({
    id: 'superior-iron-man', title: 'Superior Iron Man', phaseId: 'phase-6', priority: 'Recommended', writer: 'Tom Taylor', artists: ['Yıldıray Çınar'], years: '2014–2015',
    categories: ['Iron Man', 'Daredevil'], roadmapIds: ['iron-man', 'daredevil'], order: 710,
    summary: 'A morally inverted Tony weaponises addiction and image, with Daredevil as one of the few heroes willing to challenge him.',
    sections: [section('Complete series', 'Recommended', 'Main Run', range(series('Superior Iron Man', 2014), 1, 9))]
  });

  addItem({
    id: 'infamous-iron-man', title: 'Infamous Iron Man', phaseId: 'phase-7', priority: 'Recommended', writer: 'Brian Michael Bendis', artists: ['Alex Maleev'], years: '2016–2017',
    categories: ['Iron Man', 'Doctor Doom'], roadmapIds: ['iron-man', 'doom'], order: 760,
    summary: 'Victor von Doom attempts to become Iron Man while the world refuses to believe he can change.',
    sections: [section('Complete series', 'Recommended', 'Main Run', range(series('Infamous Iron Man', 2016), 1, 12))]
  });

  addItem({
    id: 'iron-man-cantwell', title: 'Iron Man by Christopher Cantwell', phaseId: 'phase-8', priority: 'Recommended', writer: 'Christopher Cantwell', artists: ['Cafu'], years: '2020–2022',
    categories: ['Iron Man'], roadmapIds: ['iron-man'], order: 840,
    summary: 'Tony wrestles with ego, addiction, divine power and whether Iron Man does more harm than good.',
    sections: [section('Complete run', 'Recommended', 'Main Run', range(series('Iron Man', 2020), 1, 25))]
  });

  addItem({
    id: 'iron-man-duggan', title: 'Invincible Iron Man by Gerry Duggan', phaseId: 'phase-8', priority: 'Recommended', writer: 'Gerry Duggan', artists: ['Juan Frigeri'], years: '2022–2024',
    categories: ['Iron Man', 'X-Men', 'Emma Frost'], roadmapIds: ['iron-man', 'x-men'], order: 875,
    summary: 'Tony loses Stark Unlimited and becomes entangled with Orchis, Feilong and Emma Frost during Fall of X.',
    sections: [section('Complete run', 'Recommended', 'Main Run', range(series('Invincible Iron Man', 2022), 1, 20))]
  });

  addItem({
    id: 'iron-man-ackerman', title: 'Iron Man by Spencer Ackerman', phaseId: 'phase-9', priority: 'Recommended', writer: 'Spencer Ackerman', years: '2024–2025',
    categories: ['Iron Man'], roadmapIds: ['iron-man'], order: 925,
    summary: 'Tony fights corporate capture by Roxxon and A.I.M. while rebuilding armour under severe constraints.',
    sections: [section('Complete run', 'Recommended', 'Main Run', range(series('Iron Man', 2024), 1, 10))]
  });

  addItem({
    id: 'iron-man-2026', title: 'Iron Man (2026)', phaseId: 'phase-9', priority: 'Current', writer: 'Joshua Williamson', years: '2026',
    categories: ['Iron Man'], roadmapIds: ['iron-man'], order: 955, current: true, auditStatus: 'Current',
    summary: 'The current Iron Man relaunch following the Doom-era disruption.',
    sections: [section('Published and announced opening', 'Essential', 'Main Run', [issue(series('Iron Man', 2026, 'Earth-616', { status: 'ongoing' }), 1), issue(series('Iron Man', 2026), 2, { status: 'solicited' }), issue(series('Iron Man', 2026), 3, { status: 'solicited' })])]
  });

  /* =========================
     FANTASTIC FOUR
     ========================= */
  addItem({
    id: 'ff-byrne', title: 'Fantastic Four by John Byrne', phaseId: 'phase-1', priority: 'Peak', writer: 'John Byrne', artists: ['John Byrne'], years: '1981–1986',
    categories: ['Fantastic Four', 'Doctor Doom'], roadmapIds: ['fantastic-four', 'doom'], order: 100,
    summary: 'Byrne rebuilds the Fantastic Four as explorers and family while deepening Sue, Doom, Galactus, Franklin and the cosmic side of Marvel.',
    note: 'Your personal continuation point is Fantastic Four #263, but the archive preserves the full creator run.',
    sections: [section('Complete Byrne run', 'Peak', 'Main Run', range(fantasticFour1961, 232, 293))]
  });

  addItem({
    id: 'ff-simonson', title: 'Fantastic Four by Walt Simonson', phaseId: 'phase-1', priority: 'Peak', writer: 'Walt Simonson', artists: ['Walt Simonson'], years: '1989–1991',
    categories: ['Fantastic Four', 'Doctor Doom', 'Time Travel'], roadmapIds: ['fantastic-four', 'doom'], order: 195,
    summary: 'A compact, inventive time-travel and Doom-heavy run with Simonson’s characteristic momentum.',
    sections: [section('Complete run', 'Peak', 'Main Run', range(fantasticFour1961, 334, 354))]
  });

  addItem({
    id: 'ff-claremont', title: 'Fantastic Four by Chris Claremont', phaseId: 'phase-3', priority: 'Optional', writer: 'Chris Claremont', artists: ['Salvador Larroca'], years: '1998–2000',
    categories: ['Fantastic Four'], roadmapIds: ['fantastic-four'], order: 330,
    summary: 'A dense, adventurous Heroes Return run with strong X-Men-style plotting and a broad supporting cast.',
    sections: [section('Complete run', 'Optional', 'Main Run', range(series('Fantastic Four', 1998), 1, 32))]
  });

  addItem({
    id: 'ff-pacheco-marin', title: 'Fantastic Four by Pacheco and Marín', phaseId: 'phase-3', priority: 'Recommended', writer: 'Carlos Pacheco and Rafael Marín', artists: ['Carlos Pacheco'], years: '2000–2002',
    categories: ['Fantastic Four'], roadmapIds: ['fantastic-four'], order: 360,
    summary: 'A strong bridge into the modern FF era with cosmic ambition and excellent visual storytelling.',
    sections: [section('Core run', 'Recommended', 'Main Run', range(series('Fantastic Four', 1998), 35, 54))]
  });

  addItem({
    id: 'ff-waid-wieringo', title: 'Fantastic Four by Waid and Wieringo', phaseId: 'phase-3', priority: 'Peak', writer: 'Mark Waid', artists: ['Mike Wieringo'], years: '2002–2005',
    categories: ['Fantastic Four', 'Doctor Doom'], roadmapIds: ['fantastic-four', 'doom'], order: 385,
    summary: 'A definitive modern family run balancing wonder, humour, Doom and Reed’s responsibility.',
    sections: [section('Complete run', 'Peak', 'Main Run', concat(range(series('Fantastic Four', 1998), 60, 70), range(fantasticFour1961, 500, 524)))]
  });

  addItem({
    id: 'ff-mcduffie', title: 'Fantastic Four by Dwayne McDuffie', phaseId: 'phase-5', priority: 'Recommended', writer: 'Dwayne McDuffie', artists: ['Paul Pelletier'], years: '2007–2008',
    categories: ['Fantastic Four', 'Black Panther', 'Storm'], roadmapIds: ['fantastic-four', 'black-panther'], order: 535,
    summary: 'A brisk post-Civil War run featuring Black Panther and Storm on the team, with strong cosmic and character work.',
    sections: [section('Complete run', 'Recommended', 'Main Run', range(fantasticFour1961, 542, 553))]
  });

  addItem({
    id: 'ff-millar-hitch', title: 'Fantastic Four by Millar and Hitch', phaseId: 'phase-5', priority: 'Optional', writer: 'Mark Millar', artists: ['Bryan Hitch'], years: '2008–2009',
    categories: ['Fantastic Four'], roadmapIds: ['fantastic-four'], order: 565,
    summary: 'A widescreen, high-concept run that is fun but less foundational than Waid, Hickman or North.',
    sections: [section('Complete run', 'Optional', 'Main Run', range(fantasticFour1961, 554, 569))]
  });

  addItem({
    id: 'ff-hickman', title: 'Fantastic Four and FF by Jonathan Hickman', phaseId: 'phase-6', priority: 'Peak', writer: 'Jonathan Hickman', artists: ['Dale Eaglesham', 'Steve Epting', 'Nick Dragotta'], years: '2009–2012',
    categories: ['Fantastic Four', 'Doctor Doom', 'Future Foundation', 'Cosmic'], roadmapIds: ['fantastic-four', 'doom'], order: 620,
    summary: 'The Council of Reeds, Future Foundation, Franklin, Valeria and Doom build toward one of Marvel’s great long-form family epics.',
    sections: [
      section('Dark Reign prelude', 'Essential', 'Prelude', range(series('Dark Reign: Fantastic Four', 2009), 1, 5)),
      section('Fantastic Four opening', 'Peak', 'Main Run', range(fantasticFour1961, 570, 588)),
      section('FF first movement', 'Peak', 'Main Run', range(series('FF', 2011), 1, 11)),
      section('Alternating conclusion', 'Peak', 'Main Run', concat(range(fantasticFour1961, 600, 611), range(series('FF', 2011), 12, 23)))
    ], next: ['avengers-hickman', 'event-secret-wars-2015']
  });

  addItem({
    id: 'ff-fraction', title: 'Fantastic Four and FF by Matt Fraction', phaseId: 'phase-6', priority: 'Recommended', writer: 'Matt Fraction', artists: ['Mark Bagley', 'Mike Allred'], years: '2012–2014',
    categories: ['Fantastic Four', 'Future Foundation'], roadmapIds: ['fantastic-four'], order: 675,
    summary: 'The main family takes a cosmic holiday while a replacement team guards the Future Foundation on Earth.',
    sections: [
      section('Fantastic Four', 'Recommended', 'Main Run', range(series('Fantastic Four', 2012), 1, 16)),
      section('FF', 'Recommended', 'Companion Run', range(series('FF', 2012), 1, 16))
    ]
  });

  addItem({
    id: 'ff-robinson', title: 'Fantastic Four by James Robinson', phaseId: 'phase-6', priority: 'Optional', writer: 'James Robinson', artists: ['Leonard Kirk'], years: '2014–2015',
    categories: ['Fantastic Four'], roadmapIds: ['fantastic-four'], order: 715,
    summary: 'The family is systematically dismantled before Secret Wars and the title’s temporary disappearance.',
    sections: [section('Complete run', 'Optional', 'Main Run', concat(range(series('Fantastic Four', 2014), 1, 14), range(fantasticFour1961, 642, 645)))]
  });

  addItem({
    id: 'ff-slott', title: 'Fantastic Four by Dan Slott', phaseId: 'phase-7', priority: 'Recommended', writer: 'Dan Slott', artists: ['Sara Pichelli', 'R.B. Silva'], years: '2018–2022',
    categories: ['Fantastic Four'], roadmapIds: ['fantastic-four'], order: 785,
    summary: 'The Fantastic Four return after Secret Wars, restoring the family and moving through marriage, cosmic conflict and Reckoning War.',
    sections: [section('Complete run', 'Recommended', 'Main Run', range(series('Fantastic Four', 2018), 1, 46))]
  });

  addItem({
    id: 'ff-ryan-north-2022', title: 'Fantastic Four by Ryan North', phaseId: 'phase-8', priority: 'Peak', writer: 'Ryan North', artists: ['Iban Coello', 'Carlos Gómez'], years: '2022–2025',
    categories: ['Fantastic Four'], roadmapIds: ['fantastic-four'], order: 865,
    summary: 'High-concept science-fiction problems are anchored by warm, precise family storytelling.',
    sections: [section('Complete first volume', 'Peak', 'Main Run', range(series('Fantastic Four', 2022), 1, 33))]
  });

  addItem({
    id: 'ff-ryan-north-2025', title: 'Fantastic Four (2025)', phaseId: 'phase-9', priority: 'Current', writer: 'Ryan North', artists: ['Humberto Ramos'], years: '2025–2026',
    categories: ['Fantastic Four'], roadmapIds: ['fantastic-four'], order: 930, current: true, auditStatus: 'Current',
    summary: 'Ryan North continues the family’s science-adventure era in a new volume.',
    sections: [section('Published issues', 'Essential', 'Main Run', range(series('Fantastic Four', 2025, 'Earth-616', { status: 'ongoing' }), 1, 15))]
  });

  /* =========================
     SPIDER-MAN
     ========================= */
  addItem({
    id: 'spider-man-lee-ditko', title: 'Amazing Spider-Man by Lee and Ditko', phaseId: 'phase-0', priority: 'Essential', writer: 'Stan Lee', artists: ['Steve Ditko'], years: '1963–1966',
    categories: ['Spider-Man'], roadmapIds: ['spider-man'], order: 5,
    summary: 'The foundational villain gallery, supporting cast and Peter Parker formula after the origin.',
    note: 'Amazing Fantasy #15 and Amazing Spider-Man #1 remain optional because you asked to begin after the origin material.',
    sections: [
      section('Core run after the origin', 'Essential', 'Main Run', range(amazing1963, 2, 38)),
      section('Origin recap', 'Optional', 'Background', [oneShot('Amazing Fantasy #15', 1962, 'Earth-616', { displayTitle: 'Amazing Fantasy (1962) #15' }), issue(amazing1963, 1)])
    ]
  });

  addItem({
    id: 'spider-man-romita-essentials', title: 'Romita-Era Spider-Man Essentials', phaseId: 'phase-0', priority: 'Essential', writer: 'Stan Lee and Gerry Conway', artists: ['John Romita Sr.', 'Gil Kane'], years: '1966–1974',
    categories: ['Spider-Man'], roadmapIds: ['spider-man'], order: 8,
    summary: 'College-era Peter, Mary Jane, Gwen, Kingpin and the stories that permanently darken Spider-Man’s world.',
    sections: [
      section('College and Kingpin core', 'Essential', 'Main Run', range(amazing1963, 39, 52)),
      section('Key later stories', 'Essential', 'Selected Issues', concat(range(amazing1963, 88, 90), range(amazing1963, 96, 98), range(amazing1963, 100, 102), range(amazing1963, 121, 122), list(amazing1963, [129]), range(amazing1963, 136, 137), range(amazing1963, 143, 149)))
    ]
  });

  addItem({
    id: 'spider-man-roger-stern', title: 'Spider-Man by Roger Stern', phaseId: 'phase-1', priority: 'Peak', writer: 'Roger Stern', artists: ['John Romita Jr.', 'Marie Severin'], years: '1980–1984',
    categories: ['Spider-Man'], roadmapIds: ['spider-man'], order: 105,
    summary: 'A definitive classic run featuring the Hobgoblin, Juggernaut and Peter’s best balance of superhero life and personal responsibility.',
    sections: [
      section('Spectacular Spider-Man opening', 'Peak', 'Main Run', range(series('Spectacular Spider-Man', 1976), 43, 61)),
      section('Amazing Spider-Man run', 'Peak', 'Main Run', range(amazing1963, 224, 252)),
      section('Annuals', 'Recommended', 'Companion', list(amazing1963, ['Annual 16', 'Annual 17']))
    ]
  });

  addItem({
    id: 'spider-man-black-suit', title: 'The Black Costume Era', phaseId: 'phase-1', priority: 'Essential', writer: 'Tom DeFalco and others', years: '1984–1985',
    categories: ['Spider-Man', 'Venom'], roadmapIds: ['spider-man', 'venom'], order: 140,
    summary: 'Peter brings home the black costume and gradually discovers that it is alive.',
    sections: [
      section('Amazing Spider-Man chapters', 'Essential', 'Main Run', range(amazing1963, 252, 259)),
      section('Separation', 'Essential', 'Core Chapter', [issue(series('Web of Spider-Man', 1985), 1)])
    ]
  });

  addItem({
    id: 'kravens-last-hunt', title: "Kraven's Last Hunt", phaseId: 'phase-1', priority: 'Peak', writer: 'J.M. DeMatteis', artists: ['Mike Zeck'], years: '1987',
    categories: ['Spider-Man'], roadmapIds: ['spider-man'], order: 175,
    summary: 'Kraven attempts to prove that he can become a better Spider-Man than Peter by destroying and replacing him.',
    sections: [section('Six-part crossover', 'Peak', 'Core Chapter', [
      issue(series('Web of Spider-Man', 1985), 31), issue(amazing1963, 293), issue(series('Spectacular Spider-Man', 1976), 131), issue(series('Web of Spider-Man', 1985), 32), issue(amazing1963, 294), issue(series('Spectacular Spider-Man', 1976), 132)
    ])]
  });

  addItem({
    id: 'spider-man-venom-carnage', title: 'Venom and Carnage Foundations', phaseId: 'phase-2', priority: 'Essential', writer: 'David Michelinie', artists: ['Todd McFarlane', 'Erik Larsen', 'Mark Bagley'], years: '1988–1993',
    categories: ['Spider-Man', 'Venom', 'Symbiotes'], roadmapIds: ['spider-man', 'venom'], order: 230,
    summary: 'The essential Eddie Brock/Venom and Cletus Kasady/Carnage stories that establish modern symbiote mythology.',
    sections: [section('Core issues', 'Essential', 'Selected Issues', concat(range(amazing1963, 298, 300), range(amazing1963, 315, 317), range(amazing1963, 332, 333), range(amazing1963, 346, 347), range(amazing1963, 361, 363), list(amazing1963, [375])))]
  });

  addItem({
    id: 'spider-man-clone-saga-selected', title: 'Clone Saga: Selected Route', phaseId: 'phase-2', priority: 'Skim', writer: 'Various', years: '1994–1996',
    categories: ['Spider-Man', 'Ben Reilly'], roadmapIds: ['spider-man', 'legacy-heroes'], order: 315,
    summary: 'A compressed route through the emotional and continuity-important portions of the sprawling Clone Saga.',
    sections: [
      section('Opening core', 'Recommended', 'Core Chapter', range(amazing1963, 394, 400)),
      section('Ben Reilly history', 'Optional', 'Mini-series', range(series('Spider-Man: The Lost Years', 1995), 1, 3)),
      section('Revelations ending', 'Essential', 'Core Chapter', [issue(amazing1963, 418), issue(series('Spider-Man', 1990), 75), issue(series('Spectacular Spider-Man', 1976), 240), issue(series('Sensational Spider-Man', 1996), 11)]),
      section('Full completionist Clone Saga', 'Skip', 'Completionist', concat(range(series('Web of Spider-Man', 1985), 117, 129), range(series('Spider-Man', 1990), 51, 75), range(series('Spectacular Spider-Man', 1976), 217, 240)))
    ]
  });

  addItem({
    id: 'spider-man-jms', title: 'Amazing Spider-Man by J. Michael Straczynski', phaseId: 'phase-3', priority: 'Essential', writer: 'J. Michael Straczynski', artists: ['John Romita Jr.', 'Mike Deodato Jr.', 'Ron Garney'], years: '2001–2007',
    categories: ['Spider-Man'], roadmapIds: ['spider-man'], order: 380,
    summary: 'The complete JMS run: Peter as a teacher, reconciliation with MJ, mystical Spider-Man ideas, Civil War and the controversial ending.',
    note: 'The archive includes the full run rather than silently removing divisive arcs such as Sins Past or One More Day.',
    sections: [
      section('First volume', 'Essential', 'Main Run', range(series('Amazing Spider-Man', 1999), 30, 58)),
      section('Legacy-numbered continuation', 'Essential', 'Main Run', range(series('Amazing Spider-Man', 1999), 500, 545))
    ], prerequisites: ['event-civil-war']
  });

  addItem({
    id: 'spider-man-brand-new-day', title: 'Brand New Day: Selected Route', phaseId: 'phase-5', priority: 'Recommended', writer: 'The Spider-Man Brain Trust', years: '2008–2010',
    categories: ['Spider-Man'], roadmapIds: ['spider-man'], order: 580,
    summary: 'Peter’s post-One More Day status quo is rebuilt through a rotating writing team and a new supporting cast.',
    sections: [
      section('Opening reset', 'Essential', 'Main Run', range(amazing1963, 546, 564)),
      section('New Ways to Die', 'Recommended', 'Arc', range(amazing1963, 568, 573)),
      section('Milestone', 'Recommended', 'Selected Issue', [issue(amazing1963, 600)]),
      section('Remaining Brand New Day', 'Optional', 'Main Run', concat(range(amazing1963, 565, 567), range(amazing1963, 574, 599), range(amazing1963, 601, 647)))
    ]
  });

  addItem({
    id: 'spider-man-big-time-superior', title: 'Big Time to Superior Spider-Man', phaseId: 'phase-6', priority: 'Essential', writer: 'Dan Slott', artists: ['Humberto Ramos', 'Stefano Caselli', 'Ryan Stegman'], years: '2010–2014',
    categories: ['Spider-Man', 'Doctor Octopus'], roadmapIds: ['spider-man'], order: 640,
    summary: 'Peter enters the Big Time before Doctor Octopus takes control of his life and attempts to become a superior hero.',
    sections: [
      section('Big Time and Dying Wish', 'Essential', 'Main Run', range(amazing1963, 648, 700)),
      section('Superior Spider-Man', 'Essential', 'Main Run', range(series('Superior Spider-Man', 2013), 1, 33))
    ]
  });

  addItem({
    id: 'spider-verse', title: 'Spider-Verse', phaseId: 'phase-6', priority: 'Recommended', writer: 'Dan Slott', years: '2014–2015',
    categories: ['Spider-Man', 'Multiverse', 'Legacy Heroes'], roadmapIds: ['spider-man', 'legacy-heroes'], order: 705,
    summary: 'Spider-heroes from across the Multiverse unite against the Inheritors.',
    sections: [
      section('Main Amazing Spider-Man chapters', 'Essential', 'Core Chapter', range(series('Amazing Spider-Man', 2014), 9, 15)),
      section('Opening and ending one-shots', 'Recommended', 'Companion', [oneShot('Spider-Verse #1', 2014, 'Earth-616', { displayTitle: 'Spider-Verse (2014) #1' }), oneShot('Spider-Verse #2', 2015, 'Earth-616', { displayTitle: 'Spider-Verse (2015) #2' })]),
      section('Selected tie-ins', 'Optional', 'Tie-in', concat(range(series('Spider-Woman', 2014), 1, 4), range(series('Scarlet Spiders', 2014), 1, 3), range(series('Spider-Verse Team-Up', 2014), 1, 3)))
    ]
  });

  addItem({
    id: 'spider-man-nick-spencer', title: 'Amazing Spider-Man by Nick Spencer', phaseId: 'phase-7', priority: 'Optional', writer: 'Nick Spencer', years: '2018–2021',
    categories: ['Spider-Man'], roadmapIds: ['spider-man'], order: 795,
    summary: 'A long attempt to restore Peter’s classic relationships and confront the lingering damage of past continuity changes.',
    sections: [section('Complete run', 'Optional', 'Main Run', range(series('Amazing Spider-Man', 2018), 1, 74))]
  });

  addItem({
    id: 'spider-man-wells', title: 'Amazing Spider-Man by Zeb Wells', phaseId: 'phase-8', priority: 'Skip', writer: 'Zeb Wells', years: '2022–2024',
    categories: ['Spider-Man'], roadmapIds: ['spider-man'], order: 870, hiddenByDefault: true,
    summary: 'A divisive continuity bridge included for reference rather than recommendation.',
    sections: [section('Complete run', 'Skip', 'Main Run', range(series('Amazing Spider-Man', 2022), 1, 60))]
  });

  addItem({
    id: 'spider-man-2025', title: 'Amazing Spider-Man (2025)', phaseId: 'phase-9', priority: 'Current', writer: 'Joe Kelly', years: '2025–2026',
    categories: ['Spider-Man'], roadmapIds: ['spider-man'], order: 945, current: true, auditStatus: 'Current',
    summary: 'The current Amazing Spider-Man era, tracked issue by issue while its quality and final shape remain in progress.',
    sections: [section('Published issues', 'Essential', 'Main Run', range(series('Amazing Spider-Man', 2025, 'Earth-616', { status: 'ongoing' }), 1, 18))]
  });

  /* =========================
     X-MEN MAIN SPINE
     ========================= */
  addItem({
    id: 'xmen-post-days', title: 'Post-Days of Future Past', phaseId: 'phase-0', priority: 'Essential', writer: 'Chris Claremont', artists: ['John Byrne', 'Dave Cockrum'], years: '1981',
    categories: ['X-Men'], roadmapIds: ['x-men'], order: 40,
    summary: 'Kitty grows into the team and Magneto begins becoming a more complicated ideological figure.',
    note: 'Your personal starting point is Uncanny X-Men #143 after Days of Future Past.',
    sections: [section('Main issues', 'Essential', 'Main Run', range(uncanny1963, 143, 150))]
  });

  addItem({
    id: 'xmen-brood-era', title: 'Brood Saga and Cosmic Survival Era', phaseId: 'phase-0', priority: 'Essential', writer: 'Chris Claremont', artists: ['Dave Cockrum', 'Paul Smith'], years: '1981–1983',
    categories: ['X-Men', 'Cosmic'], roadmapIds: ['x-men'], order: 50,
    summary: 'Space horror, the Starjammers and Xavier’s past expand the X-Men beyond the mansion.',
    sections: [section('Main issues', 'Essential', 'Main Run', range(uncanny1963, 151, 167))]
  });

  addItem({
    id: 'xmen-god-loves-man-kills', title: 'God Loves, Man Kills', phaseId: 'phase-1', priority: 'Peak', writer: 'Chris Claremont', artists: ['Brent Anderson'], years: '1982',
    categories: ['X-Men', 'Great Stories'], roadmapIds: ['x-men'], order: 90,
    summary: 'A focused statement on hatred, faith, politics and the ideological divide between Xavier and Magneto.',
    sections: [section('Graphic novel', 'Peak', 'Standalone', [oneShot('Marvel Graphic Novel: God Loves, Man Kills', 1982, 'Earth-616', { displayTitle: 'Marvel Graphic Novel #5: God Loves, Man Kills' })])]
  });

  addItem({
    id: 'xmen-rogue-storm-rachel', title: 'Rogue, Storm and Rachel Era', phaseId: 'phase-1', priority: 'Peak', writer: 'Chris Claremont', artists: ['Paul Smith', 'John Romita Jr.'], years: '1983–1985',
    categories: ['X-Men', 'Rogue', 'Storm', 'Rachel Summers'], roadmapIds: ['x-men', 'rachel'], order: 105,
    summary: 'Rogue joins, Storm transforms, Rachel arrives and the team enters a darker emotional period.',
    sections: [section('Main issues', 'Peak', 'Main Run', range(uncanny1963, 168, 191))]
  });

  addItem({
    id: 'xmen-trial-magneto', title: 'Trial of Magneto and Leadership Shift', phaseId: 'phase-1', priority: 'Essential', writer: 'Chris Claremont', artists: ['John Romita Jr.'], years: '1985–1986',
    categories: ['X-Men', 'Magneto', 'Cyclops', 'Storm'], roadmapIds: ['x-men', 'cyclops'], order: 115,
    summary: 'Magneto’s trial and Storm’s leadership challenge redefine the team before the crossover era.',
    sections: [section('Main issues', 'Essential', 'Main Run', range(uncanny1963, 192, 209))]
  });

  addItem({
    id: 'xmen-outback', title: 'Outback X-Men', phaseId: 'phase-1', priority: 'Peak', writer: 'Chris Claremont', artists: ['Marc Silvestri'], years: '1988–1989',
    categories: ['X-Men'], roadmapIds: ['x-men'], order: 160,
    summary: 'The X-Men operate as an invisible strike team from Australia while the world believes them dead.',
    sections: [
      section('Outback foundation', 'Peak', 'Main Run', range(uncanny1963, 228, 238)),
      section('Post-Inferno continuation', 'Recommended', 'Main Run', range(uncanny1963, 244, 269))
    ], prerequisites: ['event-fall-of-mutants', 'event-inferno']
  });

  addItem({
    id: 'xmen-muir-island', title: 'Muir Island Saga and Mutant Genesis', phaseId: 'phase-2', priority: 'Essential', writer: 'Chris Claremont and Fabian Nicieza', years: '1991',
    categories: ['X-Men', 'X-Factor'], roadmapIds: ['x-men', 'x-factor'], order: 225,
    summary: 'The scattered teams reunite before the famous Blue and Gold team relaunch.',
    sections: [
      section('Muir Island lead-in', 'Essential', 'Main Run', range(uncanny1963, 273, 280)),
      section('X-Factor conclusion', 'Essential', 'Crossover', range(xfactor1986, 63, 70)),
      section('Mutant Genesis', 'Essential', 'Main Run', range(series('X-Men', 1991), 1, 3))
    ]
  });

  addItem({
    id: 'xmen-phalanx-covenant', title: 'Phalanx Covenant', phaseId: 'phase-2', priority: 'Recommended', writer: 'Various', years: '1994',
    categories: ['X-Men', 'Generation X', 'X-Factor', 'X-Force'], roadmapIds: ['x-men', 'x-factor'], order: 290,
    summary: 'The Phalanx crisis creates Generation X and expands the techno-organic side of mutant continuity.',
    sections: [section('Complete crossover', 'Recommended', 'Core Chapter', [
      issue(uncanny1963, 316), issue(uncanny1963, 317), issue(series('X-Men', 1991), 36), issue(series('X-Men', 1991), 37), issue(xfactor1986, 106), issue(xforce1991, 38), issue(series('Excalibur', 1988), 82), issue(series('Wolverine', 1988), 85), issue(cable1993, 16)
    ])]
  });

  addItem({
    id: 'xmen-onslaught', title: 'Onslaught', phaseId: 'phase-2', priority: 'Skim', writer: 'Various', years: '1996',
    categories: ['X-Men', 'Avengers', 'Fantastic Four'], roadmapIds: ['x-men', 'avengers', 'fantastic-four'], order: 325,
    summary: 'Xavier and Magneto’s psychic history erupts into a universe-wide catastrophe that leads to Heroes Reborn.',
    sections: [
      section('X-Men core', 'Essential', 'Core Chapter', concat(range(uncanny1963, 333, 337), range(series('X-Men', 1991), 53, 57))),
      section('Main finale', 'Essential', 'Core Chapter', [oneShot('Onslaught: Marvel Universe', 1996)]),
      section('Supporting titles', 'Skim', 'Tie-in', concat(range(cable1993, 34, 35), range(xforce1991, 57, 58), range(xfactor1986, 125, 126), range(series('Wolverine', 1988), 104, 105), range(series('X-Man', 1995), 15, 19)))
    ]
  });

  addItem({
    id: 'xmen-zero-tolerance', title: 'Operation: Zero Tolerance', phaseId: 'phase-2', priority: 'Recommended', writer: 'Various', years: '1997',
    categories: ['X-Men', 'Wolverine', 'Cable'], roadmapIds: ['x-men', 'wolverine', 'cable'], order: 328,
    summary: 'Bastion launches a Sentinel crackdown that fractures the team and marks the end of a 90s status quo.',
    sections: [section('Core crossover', 'Recommended', 'Core Chapter', concat(range(series('X-Men', 1991), 65, 70), list(uncanny1963, [346]), range(series('Wolverine', 1988), 115, 118), range(cable1993, 45, 47), range(xforce1991, 67, 70), range(series('Generation X', 1994), 27, 31)))]
  });

  addItem({
    id: 'xmen-morrison', title: 'New X-Men by Grant Morrison', phaseId: 'phase-3', priority: 'Peak', writer: 'Grant Morrison', artists: ['Frank Quitely', 'Phil Jimenez'], years: '2001–2004',
    categories: ['X-Men', 'Cyclops', 'Jean Grey', 'Emma Frost'], roadmapIds: ['x-men', 'cyclops', 'jean-grey'], order: 390,
    summary: 'Mutant culture, Cassandra Nova, Genosha, Emma, Scott and Jean are reconfigured for the modern era.',
    sections: [
      section('Main run', 'Peak', 'Main Run', range(series('New X-Men', 2001), 114, 154)),
      section('Annual', 'Recommended', 'Companion', [issue(series('New X-Men', 2001), 'Annual 2001')])
    ]
  });

  addItem({
    id: 'xmen-astonishing', title: 'Astonishing X-Men by Whedon and Cassaday', phaseId: 'phase-4', priority: 'Peak', writer: 'Joss Whedon', artists: ['John Cassaday'], years: '2004–2008',
    categories: ['X-Men', 'Cyclops', 'Emma Frost'], roadmapIds: ['x-men', 'cyclops'], order: 425,
    summary: 'A cinematic continuation of Morrison’s team dynamics built around Kitty, Cyclops, Emma and the cure controversy.',
    sections: [
      section('Main run', 'Peak', 'Main Run', range(series('Astonishing X-Men', 2004), 1, 24)),
      section('Finale', 'Essential', 'Epilogue', [oneShot('Giant-Size Astonishing X-Men', 2008)])
    ]
  });

  addItem({
    id: 'xmen-deadly-genesis', title: 'X-Men: Deadly Genesis', phaseId: 'phase-4', priority: 'Recommended', writer: 'Ed Brubaker', artists: ['Trevor Hairsine'], years: '2005–2006',
    categories: ['X-Men', 'Cyclops', 'Vulcan'], roadmapIds: ['x-men', 'cyclops'], order: 455,
    summary: 'A buried rescue team and Xavier’s secret reshape Cyclops’ family history and launch Vulcan.',
    sections: [section('Complete mini-series', 'Recommended', 'Mini-series', range(series('X-Men: Deadly Genesis', 2005), 1, 6))]
  });

  addItem({
    id: 'xmen-utopia', title: 'Utopia and the Mutant Nation Era', phaseId: 'phase-5', priority: 'Essential', writer: 'Matt Fraction and others', years: '2009–2010',
    categories: ['X-Men', 'Cyclops', 'Emma Frost', 'Avengers'], roadmapIds: ['x-men', 'cyclops'], order: 585,
    summary: 'Cyclops moves mutantkind to Utopia and consolidates leadership under increasing pressure.',
    sections: [
      section('Utopia crossover', 'Essential', 'Core Chapter', [oneShot('Dark Avengers/Uncanny X-Men: Utopia', 2009), issue(uncanny1963, 513), issue(uncanny1963, 514), issue(series('Dark Avengers', 2009), 7), issue(series('Dark Avengers', 2009), 8), oneShot('Dark Avengers/Uncanny X-Men: Exodus', 2009)]),
      section('Utopia continuation', 'Recommended', 'Main Run', range(uncanny1963, 515, 522))
    ]
  });

  addItem({
    id: 'xmen-schism', title: 'X-Men: Schism', phaseId: 'phase-6', priority: 'Essential', writer: 'Jason Aaron', artists: ['Carlos Pacheco', 'Frank Cho', 'Alan Davis', 'Adam Kubert'], years: '2011',
    categories: ['X-Men', 'Cyclops', 'Wolverine'], roadmapIds: ['x-men', 'cyclops', 'wolverine'], order: 630,
    summary: 'Cyclops and Wolverine split over the role of children in mutant survival.',
    sections: [
      section('Main mini-series', 'Essential', 'Core Chapter', range(series('X-Men: Schism', 2011), 1, 5)),
      section('Aftermath', 'Essential', 'Epilogue', [oneShot('X-Men: Regenesis', 2011)]),
      section('Prelude', 'Optional', 'Prelude', range(series('X-Men: Prelude to Schism', 2011), 1, 4))
    ]
  });

  addItem({
    id: 'xmen-gillen', title: 'Uncanny X-Men by Kieron Gillen', phaseId: 'phase-6', priority: 'Recommended', writer: 'Kieron Gillen', artists: ['Carlos Pacheco', 'Greg Land'], years: '2011–2012',
    categories: ['X-Men', 'Cyclops'], roadmapIds: ['x-men', 'cyclops'], order: 645,
    summary: 'Cyclops leads the Extinction Team through Sinister, Celestials and Avengers vs. X-Men.',
    sections: [section('Complete run', 'Recommended', 'Main Run', range(series('Uncanny X-Men', 2011), 1, 20))], prerequisites: ['event-avengers-vs-xmen']
  });

  addItem({
    id: 'xmen-bendis', title: 'Bendis X-Men Era', phaseId: 'phase-6', priority: 'Recommended', writer: 'Brian Michael Bendis', artists: ['Chris Bachalo', 'Stuart Immonen'], years: '2012–2015',
    categories: ['X-Men', 'Cyclops', 'Jean Grey'], roadmapIds: ['x-men', 'cyclops', 'jean-grey'], order: 700,
    summary: 'The original five are brought into the present while revolutionary Cyclops builds a rival school.',
    sections: [
      section('All-New X-Men', 'Recommended', 'Main Run', range(series('All-New X-Men', 2012), 1, 41)),
      section('Uncanny X-Men', 'Recommended', 'Main Run', concat(range(series('Uncanny X-Men', 2013), 1, 35), [issue(uncanny1963, 600)])),
      section('Battle of the Atom core', 'Optional', 'Crossover', [oneShot('X-Men: Battle of the Atom', 2013), issue(series('All-New X-Men', 2012), 16), issue(series('X-Men', 2013), 5), issue(series('Uncanny X-Men', 2013), 12), issue(series('Wolverine and the X-Men', 2011), 36), issue(series('All-New X-Men', 2012), 17), issue(series('X-Men', 2013), 6), issue(series('Uncanny X-Men', 2013), 13), issue(series('Wolverine and the X-Men', 2011), 37), oneShot('X-Men: Battle of the Atom Finale', 2013)])
    ]
  });

  addItem({
    id: 'xmen-red-taylor', title: 'X-Men Red by Tom Taylor', phaseId: 'phase-7', priority: 'Recommended', writer: 'Tom Taylor', artists: ['Mahmud Asrar'], years: '2018–2019',
    categories: ['X-Men', 'Jean Grey'], roadmapIds: ['x-men', 'jean-grey'], order: 780,
    summary: 'Jean Grey leads a globally minded team against Cassandra Nova’s weaponised hatred.',
    sections: [section('Complete run', 'Recommended', 'Main Run', range(series('X-Men Red', 2018), 1, 11))]
  });

  addItem({
    id: 'hox-pox', title: 'House of X / Powers of X', phaseId: 'phase-7', priority: 'Peak', writer: 'Jonathan Hickman', artists: ['Pepe Larraz', 'R.B. Silva'], years: '2019',
    categories: ['X-Men', 'Krakoa', 'Moira X'], roadmapIds: ['x-men'], order: 800,
    summary: 'Mutantkind establishes Krakoa and reveals a radical new interpretation of Moira, resurrection and mutant history.',
    sections: [section('Interleaved complete series', 'Peak', 'Core Chapter', [
      issue(series('House of X', 2019), 1), issue(series('Powers of X', 2019), 1), issue(series('House of X', 2019), 2), issue(series('Powers of X', 2019), 2), issue(series('Powers of X', 2019), 3), issue(series('House of X', 2019), 3), issue(series('House of X', 2019), 4), issue(series('Powers of X', 2019), 4), issue(series('House of X', 2019), 5), issue(series('Powers of X', 2019), 5), issue(series('House of X', 2019), 6), issue(series('Powers of X', 2019), 6)
    ])]
  });

  addItem({
    id: 'xmen-dawn-core', title: 'Dawn of X Core', phaseId: 'phase-8', priority: 'Essential', writer: 'Jonathan Hickman and the X-Office', years: '2019–2020',
    categories: ['X-Men', 'Krakoa'], roadmapIds: ['x-men'], order: 810,
    summary: 'The new mutant nation expands through diplomacy, intelligence, trade, resurrection and internal conflict.',
    sections: [
      section('Hickman X-Men', 'Essential', 'Main Run', range(series('X-Men', 2019), 1, 11)),
      section('Marauders opening', 'Recommended', 'Companion Run', range(series('Marauders', 2019), 1, 12)),
      section('X-Force opening', 'Recommended', 'Companion Run', range(series('X-Force', 2019), 1, 12)),
      section('Excalibur opening', 'Recommended', 'Companion Run', range(series('Excalibur', 2019), 1, 12)),
      section('Hellions opening', 'Peak', 'Companion Run', range(series('Hellions', 2020), 1, 4))
    ], prerequisites: ['hox-pox']
  });

  addItem({
    id: 'x-of-swords', title: 'X of Swords', phaseId: 'phase-8', priority: 'Essential', writer: 'The X-Office', years: '2020',
    categories: ['X-Men', 'Krakoa', 'Magic'], roadmapIds: ['x-men', 'magik'], order: 820,
    summary: 'Krakoa and Arakko face a ceremonial tournament that expands Apocalypse’s history and mutant mythology.',
    sections: [section('Complete crossover', 'Essential', 'Core Chapter', [
      oneShot('X of Swords: Creation', 2020), issue(series('X-Factor', 2020), 4), issue(series('Wolverine', 2020), 6), issue(series('X-Force', 2019), 13), issue(series('Marauders', 2019), 13), issue(series('Hellions', 2020), 5), issue(series('New Mutants', 2019), 13), issue(series('Cable', 2020), 5), issue(series('Excalibur', 2019), 13), issue(series('X-Men', 2019), 13), oneShot('X of Swords: Stasis', 2020), issue(series('X-Men', 2019), 14), issue(series('Marauders', 2019), 14), issue(series('Marauders', 2019), 15), issue(series('Excalibur', 2019), 14), issue(series('Excalibur', 2019), 15), issue(series('Wolverine', 2020), 7), issue(series('X-Force', 2019), 14), issue(series('Hellions', 2020), 6), issue(series('Cable', 2020), 6), issue(series('X-Men', 2019), 15), oneShot('X of Swords: Destruction', 2020)
    ])], prerequisites: ['xmen-dawn-core']
  });

  addItem({
    id: 'xmen-inferno-2021', title: 'Inferno by Jonathan Hickman', phaseId: 'phase-8', priority: 'Peak', writer: 'Jonathan Hickman', artists: ['Valerio Schiti', 'Stefano Caselli'], years: '2021–2022',
    categories: ['X-Men', 'Krakoa', 'Mystique', 'Destiny'], roadmapIds: ['x-men'], order: 845,
    summary: 'Mystique and Destiny force Krakoa’s hidden compromises into the open as Hickman exits the line.',
    sections: [section('Complete mini-series', 'Peak', 'Core Chapter', range(series('Inferno', 2021), 1, 4))]
  });

  addItem({
    id: 'xmen-destiny-of-x', title: 'Immortal X-Men and X-Men Red', phaseId: 'phase-8', priority: 'Peak', writer: 'Kieron Gillen and Al Ewing', artists: ['Lucas Werneck', 'Stefano Caselli'], years: '2022–2023',
    categories: ['X-Men', 'Krakoa', 'Storm', 'Magneto'], roadmapIds: ['x-men'], order: 855,
    summary: 'The Quiet Council’s political decay and Arakko’s culture become the two strongest late-Krakoa pillars.',
    sections: [
      section('Immortal X-Men', 'Peak', 'Main Run', range(series('Immortal X-Men', 2022), 1, 18)),
      section('X-Men Red', 'Peak', 'Main Run', range(series('X-Men Red', 2022), 1, 18))
    ], prerequisites: ['event-judgment-day']
  });

  addItem({
    id: 'sins-of-sinister', title: 'Sins of Sinister', phaseId: 'phase-8', priority: 'Recommended', writer: 'Kieron Gillen, Al Ewing and Si Spurrier', years: '2023',
    categories: ['X-Men', 'Krakoa', 'Mister Sinister'], roadmapIds: ['x-men'], order: 872,
    summary: 'Sinister’s corrupted resurrection system produces a grotesque thousand-year alternate future.',
    sections: [
      section('Opening and finale', 'Essential', 'Core Chapter', [oneShot('Sins of Sinister', 2023), oneShot('Sins of Sinister: Dominion', 2023)]),
      section('Three timelines', 'Recommended', 'Core Chapter', concat(range(series('Immoral X-Men', 2023), 1, 3), range(series('Storm and the Brotherhood of Mutants', 2023), 1, 3), range(series('Nightcrawlers', 2023), 1, 3)))
    ]
  });

  addItem({
    id: 'fall-of-x-core', title: 'Fall of X: Core Ending', phaseId: 'phase-8', priority: 'Essential', writer: 'The X-Office', years: '2023–2024',
    categories: ['X-Men', 'Krakoa'], roadmapIds: ['x-men'], order: 900,
    summary: 'Orchis attacks Krakoa and the mutant era closes through interconnected final battles and resurrections.',
    sections: [
      section('Opening gala', 'Essential', 'Prelude', [oneShot('X-Men: Hellfire Gala 2023', 2023)]),
      section('Main X-Men line', 'Essential', 'Main Run', range(series('X-Men', 2021), 25, 35)),
      section('Immortal conclusion', 'Essential', 'Main Run', range(series('Immortal X-Men', 2022), 11, 18)),
      section('Arakko conclusion', 'Essential', 'Main Run', range(series('X-Men Red', 2022), 11, 18)),
      section('Final event minis', 'Essential', 'Core Chapter', concat(range(series('Fall of the House of X', 2024), 1, 5), range(series('Rise of the Powers of X', 2024), 1, 5), range(series('X-Men Forever', 2024), 1, 4), range(series('Resurrection of Magneto', 2024), 1, 4))),
      section('Finale', 'Essential', 'Epilogue', [issue(uncanny1963, 700)])
    ]
  });

  addItem({
    id: 'xmen-from-ashes', title: 'From the Ashes', phaseId: 'phase-9', priority: 'Current', writer: 'Jed MacKay, Gail Simone, Eve L. Ewing and others', years: '2024–2026',
    categories: ['X-Men'], roadmapIds: ['x-men'], order: 915, current: true, auditStatus: 'Current',
    summary: 'Mutants scatter into new teams and communities after Krakoa’s end.',
    sections: [
      section('X-Men', 'Essential', 'Main Run', range(series('X-Men', 2024, 'Earth-616', { status: 'ongoing' }), 1, 22)),
      section('Uncanny X-Men', 'Essential', 'Main Run', range(series('Uncanny X-Men', 2024, 'Earth-616', { status: 'ongoing' }), 1, 20)),
      section('Exceptional X-Men', 'Recommended', 'Main Run', range(series('Exceptional X-Men', 2024), 1, 13)),
      section('Character branches', 'Optional', 'Companion Run', concat(range(series('Phoenix', 2024), 1, 12), range(series('Storm', 2024), 1, 12), range(series('NYX', 2024), 1, 10)))
    ]
  });

  addItem({
    id: 'xmen-shadows-tomorrow', title: 'Shadows of Tomorrow', phaseId: 'phase-9', priority: 'Current', writer: 'The X-Office', years: '2026',
    categories: ['X-Men', 'Cyclops', 'Wolverine'], roadmapIds: ['x-men', 'cyclops', 'wolverine'], order: 952, current: true, auditStatus: 'Current',
    summary: 'The current 2026 X-Men direction following Age of Revelation, with new and continuing titles.',
    sections: [
      section('X-Men United opening', 'Essential', 'Main Run', [issue(series('X-Men United', 2026, 'Earth-616', { status: 'ongoing' }), 1), issue(series('X-Men United', 2026), 2, { status: 'solicited' }), issue(series('X-Men United', 2026), 3, { status: 'solicited' })]),
      section('Cyclops solo opening', 'Recommended', 'Character Run', [issue(series('Cyclops', 2026, 'Earth-616', { status: 'ongoing' }), 1), issue(series('Cyclops', 2026), 2, { status: 'solicited' }), issue(series('Cyclops', 2026), 3, { status: 'solicited' })])
    ]
  });

  /* =========================
     X-FACTOR, WOLVERINE, CYCLOPS, JEAN, RACHEL, CABLE, MAGIK
     ========================= */
  addItem({
    id: 'xfactor-original-five', title: 'X-Factor: Original Five', phaseId: 'phase-1', priority: 'Essential', writer: 'Bob Layton and Louise Simonson', years: '1986–1991',
    categories: ['X-Factor', 'Cyclops', 'Jean Grey'], roadmapIds: ['x-factor', 'cyclops', 'jean-grey'], order: 125,
    summary: 'The original five X-Men reunite, introducing Apocalypse and laying the foundation for the Summers family’s modern mythology.',
    sections: [
      section('Opening setup', 'Essential', 'Main Run', range(xfactor1986, 1, 8)),
      section('Event-era continuation', 'Essential', 'Main Run', range(xfactor1986, 9, 39)),
      section('Later original-team run', 'Recommended', 'Main Run', range(xfactor1986, 40, 70))
    ], prerequisites: ['event-mutant-massacre', 'event-fall-of-mutants', 'event-inferno', 'event-x-tinction-agenda']
  });

  addItem({
    id: 'xfactor-peter-david-1991', title: 'X-Factor by Peter David', phaseId: 'phase-2', priority: 'Peak', writer: 'Peter David', artists: ['Larry Stroman'], years: '1991–1993',
    categories: ['X-Factor', 'Havok', 'Polaris'], roadmapIds: ['x-factor'], order: 235,
    summary: 'A witty government-team reinvention with Havok, Polaris, Multiple Man, Wolfsbane, Strong Guy and Quicksilver.',
    sections: [section('Complete first run', 'Peak', 'Main Run', range(xfactor1986, 71, 89))]
  });

  addItem({
    id: 'xfactor-investigations', title: 'X-Factor Investigations', phaseId: 'phase-4', priority: 'Peak', writer: 'Peter David', artists: ['Ryan Sook', 'Pablo Raimondi'], years: '2005–2013',
    categories: ['X-Factor', 'Multiple Man', 'Layla Miller'], roadmapIds: ['x-factor'], order: 450,
    summary: 'Multiple Man leads a noir mutant detective agency through mysteries, time travel and deeply personal consequences.',
    sections: [
      section('Madrox prelude', 'Essential', 'Prelude', range(series('Madrox', 2004), 1, 5)),
      section('X-Factor volume', 'Peak', 'Main Run', range(series('X-Factor', 2005), 1, 50)),
      section('Legacy continuation', 'Peak', 'Main Run', range(series('X-Factor', 2005), 200, 262))
    ], prerequisites: ['event-messiah-complex']
  });

  addItem({
    id: 'xfactor-krakoa', title: 'X-Factor by Leah Williams', phaseId: 'phase-8', priority: 'Recommended', writer: 'Leah Williams', artists: ['David Baldeón'], years: '2020–2021',
    categories: ['X-Factor', 'Krakoa'], roadmapIds: ['x-factor'], order: 830,
    summary: 'A mutant investigation team verifies deaths and resurrection claims on Krakoa.',
    sections: [section('Complete series', 'Recommended', 'Main Run', range(series('X-Factor', 2020), 1, 10))]
  });

  addItem({
    id: 'wolverine-claremont-miller', title: 'Wolverine by Claremont and Miller', phaseId: 'phase-1', priority: 'Peak', writer: 'Chris Claremont', artists: ['Frank Miller'], years: '1982',
    categories: ['Wolverine', 'X-Men'], roadmapIds: ['wolverine', 'x-men'], order: 95,
    summary: 'Logan’s honour, romance and violence are defined through his struggle for Mariko in Japan.',
    sections: [section('Complete mini-series', 'Peak', 'Mini-series', range(series('Wolverine', 1982), 1, 4))]
  });

  addItem({
    id: 'wolverine-weapon-x', title: 'Weapon X', phaseId: 'phase-2', priority: 'Peak', writer: 'Barry Windsor-Smith', artists: ['Barry Windsor-Smith'], years: '1991',
    categories: ['Wolverine', 'X-Men'], roadmapIds: ['wolverine'], order: 230,
    summary: 'The definitive account of Logan’s capture, conditioning and adamantium experiment.',
    sections: [section('Complete serial', 'Peak', 'Main Run', range(series('Marvel Comics Presents', 1988), 72, 84))]
  });

  addItem({
    id: 'wolverine-larry-hama', title: 'Wolverine by Larry Hama', phaseId: 'phase-2', priority: 'Peak', writer: 'Larry Hama', artists: ['Marc Silvestri', 'Adam Kubert'], years: '1990–1997',
    categories: ['Wolverine'], roadmapIds: ['wolverine'], order: 240,
    summary: 'A long, character-defining run built around memory, honour, Team X, Sabretooth and Logan’s lost adamantium.',
    sections: [section('Complete run', 'Peak', 'Main Run', range(series('Wolverine', 1988), 31, 118))]
  });

  addItem({
    id: 'wolverine-rucka', title: 'Wolverine by Greg Rucka', phaseId: 'phase-3', priority: 'Recommended', writer: 'Greg Rucka', artists: ['Darick Robertson'], years: '2003–2004',
    categories: ['Wolverine'], roadmapIds: ['wolverine'], order: 395,
    summary: 'A grounded, morally serious Wolverine run focused on victims, violence and accountability.',
    sections: [section('Complete run', 'Recommended', 'Main Run', range(series('Wolverine', 2003), 1, 19))]
  });

  addItem({
    id: 'wolverine-enemy-state', title: 'Enemy of the State', phaseId: 'phase-4', priority: 'Recommended', writer: 'Mark Millar', artists: ['John Romita Jr.'], years: '2004–2005',
    categories: ['Wolverine', 'X-Men', 'S.H.I.E.L.D.'], roadmapIds: ['wolverine'], order: 435,
    summary: 'Hydra and the Hand turn Wolverine into a weapon against the Marvel Universe.',
    sections: [section('Complete story', 'Recommended', 'Main Run', range(series('Wolverine', 2003), 20, 32))]
  });

  addItem({
    id: 'wolverine-old-man-logan', title: 'Old Man Logan', phaseId: 'phase-5', priority: 'Peak', writer: 'Mark Millar', artists: ['Steve McNiven'], years: '2008–2009',
    categories: ['Wolverine', 'Alternate Universe'], roadmapIds: ['wolverine'], order: 570,
    summary: 'An aged Logan crosses a villain-ruled wasteland after abandoning violence for decades.',
    sections: [section('Original story', 'Peak', 'Alternate Universe', concat(range(series('Wolverine', 2003), 66, 72), [oneShot('Giant-Size Old Man Logan', 2009, 'Earth-807128')]))], page: 'elseworlds'
  });

  addItem({
    id: 'wolverine-death', title: 'Death of Wolverine', phaseId: 'phase-6', priority: 'Recommended', writer: 'Charles Soule', artists: ['Steve McNiven'], years: '2014',
    categories: ['Wolverine'], roadmapIds: ['wolverine'], order: 712,
    summary: 'A depowered Logan faces the enemies and choices that shaped his life.',
    sections: [section('Complete mini-series', 'Recommended', 'Mini-series', range(series('Death of Wolverine', 2014), 1, 4))]
  });

  addItem({
    id: 'wolverine-krakoa-selected', title: 'Krakoa Wolverine: Selected Route', phaseId: 'phase-8', priority: 'Optional', writer: 'Benjamin Percy', years: '2020–2024',
    categories: ['Wolverine', 'Krakoa'], roadmapIds: ['wolverine'], order: 848,
    summary: 'A selective route through Logan’s Krakoa missions, vampire conflict and Beast’s moral collapse.',
    sections: [
      section('Opening', 'Recommended', 'Main Run', range(series('Wolverine', 2020), 1, 12)),
      section('Key later Beast conflict', 'Recommended', 'Selected Issues', range(series('Wolverine', 2020), 26, 35)),
      section('Full remaining run', 'Optional', 'Main Run', concat(range(series('Wolverine', 2020), 13, 25), range(series('Wolverine', 2020), 36, 50)))
    ]
  });

  addItem({
    id: 'cyclops-revolutionary', title: 'Revolutionary Cyclops', phaseId: 'phase-6', priority: 'Essential', writer: 'Brian Michael Bendis', artists: ['Chris Bachalo'], years: '2013–2015',
    categories: ['Cyclops', 'X-Men'], roadmapIds: ['cyclops', 'x-men'], order: 700,
    summary: 'Cyclops becomes a revolutionary leader after Avengers vs. X-Men and builds a rival mutant school.',
    sections: [section('Complete revolutionary run', 'Essential', 'Main Run', concat(range(series('Uncanny X-Men', 2013), 1, 35), [issue(uncanny1963, 600)]))], prerequisites: ['event-avengers-vs-xmen']
  });

  addItem({
    id: 'cyclops-space', title: 'Cyclops: Space Adventure', phaseId: 'phase-6', priority: 'Optional', writer: 'Greg Rucka and John Layman', years: '2014–2015',
    categories: ['Cyclops', 'Cosmic'], roadmapIds: ['cyclops'], order: 708,
    summary: 'Young Scott spends time with Corsair and the Starjammers, exploring the father-son relationship he never had.',
    sections: [section('Complete series', 'Optional', 'Main Run', range(series('Cyclops', 2014), 1, 12))]
  });

  addItem({
    id: 'jean-phoenix-endsong', title: 'Phoenix: Endsong', phaseId: 'phase-4', priority: 'Recommended', writer: 'Greg Pak', artists: ['Greg Land'], years: '2005',
    categories: ['Jean Grey', 'Phoenix', 'X-Men'], roadmapIds: ['jean-grey'], order: 448,
    summary: 'The Phoenix Force returns to Jean’s body and tests the bonds between Jean, Scott and Emma.',
    sections: [section('Complete mini-series', 'Recommended', 'Mini-series', range(series('X-Men: Phoenix - Endsong', 2005), 1, 5))]
  });

  addItem({
    id: 'jean-phoenix-resurrection', title: 'Phoenix Resurrection', phaseId: 'phase-7', priority: 'Essential', writer: 'Matthew Rosenberg', artists: ['Leinil Francis Yu'], years: '2017–2018',
    categories: ['Jean Grey', 'Phoenix', 'X-Men'], roadmapIds: ['jean-grey'], order: 775,
    summary: 'Adult Jean Grey returns after years away from the main Marvel Universe.',
    sections: [section('Complete mini-series', 'Essential', 'Mini-series', range(series('Phoenix Resurrection', 2017), 1, 5))]
  });

  addItem({
    id: 'jean-grey-2023', title: 'Jean Grey (2023)', phaseId: 'phase-8', priority: 'Recommended', writer: 'Louise Simonson', years: '2023',
    categories: ['Jean Grey', 'X-Men'], roadmapIds: ['jean-grey'], order: 882,
    summary: 'Jean revisits pivotal choices while trapped during Fall of X.',
    sections: [section('Complete mini-series', 'Recommended', 'Mini-series', range(series('Jean Grey', 2023), 1, 4))]
  });

  addItem({
    id: 'phoenix-2024', title: 'Phoenix (2024)', phaseId: 'phase-9', priority: 'Current', writer: 'Stephanie Phillips', years: '2024–2026',
    categories: ['Jean Grey', 'Phoenix', 'Cosmic'], roadmapIds: ['jean-grey', 'cosmic'], order: 918, current: true, auditStatus: 'Current',
    summary: 'Jean operates on a cosmic scale as Phoenix after Krakoa.',
    sections: [section('Published issues', 'Recommended', 'Main Run', range(series('Phoenix', 2024, 'Earth-616', { status: 'ongoing' }), 1, 18))]
  });

  addItem({
    id: 'rachel-excalibur', title: 'Rachel Summers and Excalibur', phaseId: 'phase-1', priority: 'Peak', writer: 'Chris Claremont and Alan Davis', artists: ['Alan Davis'], years: '1988–1991',
    categories: ['Rachel Summers', 'Excalibur', 'X-Men'], roadmapIds: ['rachel'], order: 185,
    summary: 'Rachel, Kitty and Nightcrawler form a British team that mixes mutant trauma with imaginative multiversal adventure.',
    sections: [
      section('Opening graphic novel', 'Essential', 'Prelude', [oneShot('Excalibur: The Sword Is Drawn', 1988)]),
      section('Claremont/Davis core', 'Peak', 'Main Run', range(series('Excalibur', 1988), 1, 50))
    ]
  });

  addItem({
    id: 'cable-foundation', title: 'Cable and the Askani Foundation', phaseId: 'phase-2', priority: 'Essential', writer: 'Louise Simonson, Fabian Nicieza and Scott Lobdell', years: '1990–1997',
    categories: ['Cable', 'Cyclops', 'Jean Grey'], roadmapIds: ['cable', 'cyclops', 'jean-grey'], order: 255,
    summary: 'Nathan Summers becomes Cable and his future upbringing is revealed through the Askani mythology.',
    sections: [
      section('New Mutants transformation', 'Essential', 'Main Run', range(newMutants1983, 86, 100)),
      section('Early X-Force', 'Recommended', 'Main Run', range(xforce1991, 1, 15)),
      section('Blood and Metal', 'Recommended', 'Mini-series', range(series('Cable: Blood and Metal', 1992), 1, 2)),
      section('Cyclops and Phoenix', 'Peak', 'Mini-series', range(series('The Adventures of Cyclops and Phoenix', 1994), 1, 4)),
      section('Further Adventures', 'Recommended', 'Mini-series', range(series('The Further Adventures of Cyclops and Phoenix', 1996), 1, 4)),
      section("Askani'son", 'Recommended', 'Mini-series', range(series("Askani'son", 1996), 1, 4))
    ]
  });

  addItem({
    id: 'cable-messiah', title: 'Cable: Messiah Era', phaseId: 'phase-5', priority: 'Essential', writer: 'Duane Swierczynski', years: '2008–2010',
    categories: ['Cable', 'Hope Summers', 'X-Men'], roadmapIds: ['cable'], order: 555,
    summary: 'Cable raises Hope through a hunted future while mutant factions fight over her destiny.',
    sections: [section('Complete run', 'Essential', 'Main Run', range(series('Cable', 2008), 1, 25))], prerequisites: ['event-messiah-complex', 'event-second-coming']
  });

  addItem({
    id: 'cable-and-xforce', title: 'Cable and X-Force', phaseId: 'phase-6', priority: 'Recommended', writer: 'Dennis Hopeless', years: '2012–2014',
    categories: ['Cable', 'X-Force'], roadmapIds: ['cable'], order: 695,
    summary: 'Cable assembles a fugitive team to prevent disasters that only he can foresee.',
    sections: [section('Complete series', 'Recommended', 'Main Run', range(series('Cable and X-Force', 2012), 1, 19))]
  });

  addItem({
    id: 'cable-krakoa', title: 'Cable (2020)', phaseId: 'phase-8', priority: 'Recommended', writer: 'Gerry Duggan', artists: ['Phil Noto'], years: '2020–2021',
    categories: ['Cable', 'Krakoa'], roadmapIds: ['cable'], order: 833,
    summary: 'A younger Cable balances Krakoan life, family and cosmic threats.',
    sections: [section('Complete series', 'Recommended', 'Main Run', range(series('Cable', 2020), 1, 12))]
  });

  addItem({
    id: 'magik-origin', title: 'Magik: Illyana and Storm', phaseId: 'phase-1', priority: 'Essential', writer: 'Chris Claremont', artists: ['John Buscema', 'Ron Frenz'], years: '1983–1984',
    categories: ['Magik', 'New Mutants', 'X-Men', 'Magic'], roadmapIds: ['magik', 'x-men'], order: 100,
    summary: 'Illyana’s years in Limbo establish the Soulsword, Belasco and the trauma behind Magik.',
    sections: [section('Complete mini-series', 'Essential', 'Mini-series', range(series('Magik', 1983), 1, 4))]
  });

  addItem({
    id: 'new-mutants-demon-bear', title: 'Demon Bear Saga', phaseId: 'phase-1', priority: 'Peak', writer: 'Chris Claremont', artists: ['Bill Sienkiewicz'], years: '1984',
    categories: ['New Mutants', 'Magik', 'X-Men'], roadmapIds: ['magik', 'x-men'], order: 112,
    summary: 'A visually radical horror story centred on Dani Moonstar and the young mutant team.',
    sections: [section('Complete arc', 'Peak', 'Main Run', range(newMutants1983, 18, 20))]
  });

  addItem({
    id: 'new-mutants-legion', title: 'Legion Introduction', phaseId: 'phase-1', priority: 'Essential', writer: 'Chris Claremont', artists: ['Bill Sienkiewicz'], years: '1985',
    categories: ['New Mutants', 'Legion', 'X-Men'], roadmapIds: ['magik', 'x-men'], order: 118,
    summary: 'David Haller enters mutant continuity in a psychologically intense story that later leads to Age of Apocalypse.',
    sections: [section('Complete arc', 'Essential', 'Main Run', range(newMutants1983, 26, 28))]
  });

  addItem({
    id: 'magik-modern', title: 'Modern Magik Essentials', phaseId: 'phase-8', priority: 'Recommended', writer: 'Various', years: '2018–2026',
    categories: ['Magik', 'X-Men', 'Magic'], roadmapIds: ['magik'], order: 905,
    summary: 'Selected modern material following Illyana as a leader, sorcerer and one of Krakoa’s strongest field commanders.',
    sections: [
      section('New Mutants: Dead Souls', 'Recommended', 'Mini-series', range(series('New Mutants: Dead Souls', 2018), 1, 6)),
      section('Magik solo', 'Current', 'Main Run', range(series('Magik', 2025, 'Earth-616', { status: 'ongoing' }), 1, 12)),
      section('Magik and Colossus opening', 'Current', 'Mini-series', [issue(series('Magik and Colossus', 2026, 'Earth-616', { status: 'ongoing' }), 1), issue(series('Magik and Colossus', 2026), 2, { status: 'solicited' })])
    ], current: true, auditStatus: 'Current'
  });

  /* =========================
     AVENGERS, THUNDERBOLTS, WANDA/VISION, SENTRY
     ========================= */
  addItem({
    id: 'avengers-wundagore', title: 'Nights of Wundagore', phaseId: 'phase-0', priority: 'Essential', writer: 'David Michelinie, Mark Gruenwald and Steven Grant', years: '1979',
    categories: ['Avengers', 'Scarlet Witch', 'Quicksilver'], roadmapIds: ['avengers', 'wanda-vision'], order: 25,
    summary: 'Wanda and Pietro’s connection to Wundagore, Chthon and the High Evolutionary becomes central Avengers mythology.',
    sections: [section('Complete arc', 'Essential', 'Main Run', range(avengers1963, 181, 187))]
  });

  addItem({
    id: 'avengers-yellowjacket-trial', title: 'The Trial of Yellowjacket', phaseId: 'phase-0', priority: 'Essential', writer: 'Jim Shooter, David Michelinie and others', years: '1981–1983',
    categories: ['Avengers', 'Hank Pym', 'Wasp'], roadmapIds: ['avengers'], order: 55,
    summary: 'Hank Pym’s collapse and court-martial become one of the Avengers’ defining personal tragedies.',
    sections: [section('Complete arc', 'Essential', 'Main Run', range(avengers1963, 212, 230))]
  });

  addItem({
    id: 'avengers-roger-stern', title: 'Avengers by Roger Stern', phaseId: 'phase-1', priority: 'Peak', writer: 'Roger Stern', artists: ['John Buscema', 'Tom Palmer'], years: '1983–1988',
    categories: ['Avengers', 'Monica Rambeau', 'Wasp'], roadmapIds: ['avengers'], order: 120,
    summary: 'Monica Rambeau and Wasp lead a deep, character-rich Avengers era culminating in Under Siege.',
    sections: [
      section('Main run', 'Peak', 'Main Run', range(avengers1963, 227, 287)),
      section('Annuals', 'Recommended', 'Companion', list(avengers1963, ['Annual 11', 'Annual 12', 'Annual 13', 'Annual 14', 'Annual 15', 'Annual 16']))
    ]
  });

  addItem({
    id: 'avengers-under-siege', title: 'Under Siege', phaseId: 'phase-1', priority: 'Peak', writer: 'Roger Stern', artists: ['John Buscema'], years: '1986–1987',
    categories: ['Avengers', 'Baron Zemo'], roadmapIds: ['avengers'], order: 145,
    summary: 'Zemo’s Masters of Evil invade Avengers Mansion and attack the team at its most vulnerable.',
    sections: [section('Complete arc', 'Peak', 'Main Run', range(avengers1963, 270, 277))]
  });

  addItem({
    id: 'vision-scarlet-witch-1982', title: 'Vision and Scarlet Witch (1982)', phaseId: 'phase-1', priority: 'Recommended', writer: 'Bill Mantlo', years: '1982–1983',
    categories: ['Vision', 'Scarlet Witch', 'Avengers'], roadmapIds: ['wanda-vision'], order: 85,
    summary: 'Vision and Wanda attempt a domestic life while confronting family, prejudice and their unusual origins.',
    sections: [section('Complete mini-series', 'Recommended', 'Mini-series', range(series('Vision and the Scarlet Witch', 1982), 1, 4))]
  });

  addItem({
    id: 'vision-scarlet-witch-1985', title: 'Vision and Scarlet Witch (1985)', phaseId: 'phase-1', priority: 'Essential', writer: 'Steve Englehart', artists: ['Richard Howell'], years: '1985–1986',
    categories: ['Vision', 'Scarlet Witch', 'Avengers'], roadmapIds: ['wanda-vision'], order: 130,
    summary: 'Wanda and Vision build a family, establishing the children and magical continuity that later drives Disassembled and House of M.',
    sections: [section('Complete series', 'Essential', 'Main Run', range(series('Vision and the Scarlet Witch', 1985), 1, 12))]
  });

  addItem({
    id: 'vision-quest', title: 'Vision Quest', phaseId: 'phase-1', priority: 'Essential', writer: 'John Byrne', artists: ['John Byrne'], years: '1989',
    categories: ['Vision', 'Scarlet Witch', 'West Coast Avengers'], roadmapIds: ['wanda-vision', 'avengers'], order: 190,
    summary: 'Vision is dismantled and rebuilt without his emotional identity, shattering his family with Wanda.',
    sections: [section('Complete arc', 'Essential', 'Main Run', range(series('West Coast Avengers', 1985), 42, 53))]
  });

  addItem({
    id: 'darker-than-scarlet', title: 'Darker than Scarlet', phaseId: 'phase-2', priority: 'Essential', writer: 'John Byrne and Roy Thomas', years: '1989–1990',
    categories: ['Scarlet Witch', 'Vision', 'West Coast Avengers'], roadmapIds: ['wanda-vision', 'avengers'], order: 205,
    summary: 'The truth about Wanda’s children and Immortus pushes her toward a devastating collapse.',
    sections: [section('Core issues', 'Essential', 'Main Run', concat(range(series('Avengers West Coast', 1989), 51, 57), range(series('Avengers West Coast', 1989), 60, 62)))]
  });

  addItem({
    id: 'avengers-busiek-perez', title: 'Avengers by Busiek and Pérez', phaseId: 'phase-3', priority: 'Peak', writer: 'Kurt Busiek', artists: ['George Pérez', 'Alan Davis'], years: '1998–2002',
    categories: ['Avengers', 'Ultron', 'Kang'], roadmapIds: ['avengers', 'kang', 'ultron'], order: 330,
    summary: 'A grand modern restoration of classic Avengers history, including Ultron Unlimited and Kang Dynasty.',
    sections: [
      section('Complete main run', 'Peak', 'Main Run', range(series('Avengers', 1998), 1, 56)),
      section('Avengers Forever', 'Peak', 'Companion', range(series('Avengers Forever', 1998), 1, 12))
    ]
  });

  addItem({
    id: 'ultron-unlimited', title: 'Ultron Unlimited', phaseId: 'phase-3', priority: 'Peak', writer: 'Kurt Busiek', artists: ['George Pérez'], years: '1999',
    categories: ['Avengers', 'Ultron'], roadmapIds: ['avengers', 'ultron'], order: 350,
    summary: 'Ultron commits mass murder in Slorenia and forces the Avengers into one of their most personal confrontations.',
    sections: [section('Complete arc', 'Peak', 'Main Run', range(series('Avengers', 1998), 19, 22))]
  });

  addItem({
    id: 'kang-dynasty', title: 'Kang Dynasty', phaseId: 'phase-3', priority: 'Peak', writer: 'Kurt Busiek', artists: ['Alan Davis', 'Kieron Dwyer', 'Manuel Garcia'], years: '2001–2002',
    categories: ['Avengers', 'Kang'], roadmapIds: ['avengers', 'kang'], order: 385,
    summary: 'Kang successfully conquers Earth and forces the Avengers into a global war of liberation.',
    sections: [section('Complete story', 'Peak', 'Main Run', concat(range(series('Avengers', 1998), 41, 55), [issue(series('Avengers', 1998), 'Annual 2001')]))]
  });

  addItem({
    id: 'new-avengers-bendis', title: 'New Avengers by Brian Michael Bendis', phaseId: 'phase-4', priority: 'Essential', writer: 'Brian Michael Bendis', artists: ['David Finch', 'Leinil Francis Yu', 'Stuart Immonen'], years: '2004–2010',
    categories: ['Avengers', 'Spider-Man', 'Luke Cage', 'Jessica Jones'], roadmapIds: ['avengers', 'luke-cage', 'jessica-jones'], order: 420,
    summary: 'A prison break creates a street-level, conspiracy-driven Avengers team that becomes the centre of modern Marvel events.',
    sections: [section('Complete first New Avengers volume', 'Essential', 'Main Run', range(series('New Avengers', 2004), 1, 64))], prerequisites: ['event-avengers-disassembled', 'event-house-of-m', 'event-civil-war', 'event-secret-invasion', 'event-siege']
  });

  addItem({
    id: 'dark-avengers', title: 'Dark Avengers', phaseId: 'phase-5', priority: 'Peak', writer: 'Brian Michael Bendis', artists: ['Mike Deodato Jr.'], years: '2009–2010',
    categories: ['Avengers', 'Thunderbolts', 'Sentry'], roadmapIds: ['avengers', 'thunderbolts', 'sentry'], order: 580,
    summary: 'Norman Osborn replaces the Avengers with villains wearing stolen heroic identities.',
    sections: [section('Complete original run', 'Peak', 'Main Run', range(series('Dark Avengers', 2009), 1, 16))], prerequisites: ['event-secret-invasion', 'event-siege']
  });

  addItem({
    id: 'avengers-heroic-age-bendis', title: 'Bendis Heroic Age Avengers', phaseId: 'phase-6', priority: 'Optional', writer: 'Brian Michael Bendis', years: '2010–2012',
    categories: ['Avengers'], roadmapIds: ['avengers'], order: 625,
    summary: 'The Avengers reunite after Siege across two parallel titles, closing Bendis’ long tenure.',
    sections: [
      section('Avengers', 'Optional', 'Main Run', range(series('Avengers', 2010), 1, 34)),
      section('New Avengers', 'Optional', 'Companion Run', range(series('New Avengers', 2010), 1, 34)),
      section('Avengers Prime', 'Recommended', 'Mini-series', range(series('Avengers Prime', 2010), 1, 5))
    ]
  });

  addItem({
    id: 'avengers-hickman', title: 'Avengers and New Avengers by Jonathan Hickman', phaseId: 'phase-6', priority: 'Peak', writer: 'Jonathan Hickman', artists: ['Jerome Opeña', 'Steve Epting', 'Leinil Francis Yu'], years: '2012–2015',
    categories: ['Avengers', 'Illuminati', 'Thanos', 'Doctor Doom'], roadmapIds: ['avengers', 'illuminati', 'thanos', 'doom'], order: 675,
    summary: 'The Avengers expand to face universal threats while the Illuminati secretly confront the collapsing Multiverse.',
    sections: [
      section('Avengers', 'Peak', 'Main Run', range(series('Avengers', 2012), 1, 44)),
      section('New Avengers', 'Peak', 'Companion Run', range(series('New Avengers', 2013), 1, 33))
    ], prerequisites: ['event-infinity-2013', 'event-secret-wars-2015']
  });

  addItem({
    id: 'avengers-no-surrender', title: 'Avengers: No Surrender', phaseId: 'phase-7', priority: 'Recommended', writer: 'Mark Waid, Al Ewing and Jim Zub', years: '2018',
    categories: ['Avengers', 'Quicksilver'], roadmapIds: ['avengers'], order: 782,
    summary: 'Multiple Avengers teams unite in a weekly cosmic contest involving the Grandmaster and Challenger.',
    sections: [section('Complete weekly event', 'Recommended', 'Main Run', range(avengers1963, 675, 690))]
  });

  addItem({
    id: 'avengers-no-road-home', title: 'Avengers: No Road Home', phaseId: 'phase-7', priority: 'Recommended', writer: 'Mark Waid, Al Ewing and Jim Zub', years: '2019',
    categories: ['Avengers', 'Scarlet Witch', 'Hercules'], roadmapIds: ['avengers', 'wanda-vision'], order: 798,
    summary: 'A focused Avengers team confronts Nyx and the destruction of the Olympian gods.',
    sections: [section('Complete mini-series', 'Recommended', 'Mini-series', range(series('Avengers: No Road Home', 2019), 1, 10))]
  });

  addItem({
    id: 'avengers-jed-mackay', title: 'Avengers by Jed MacKay', phaseId: 'phase-8', priority: 'Recommended', writer: 'Jed MacKay', artists: ['C.F. Villa'], years: '2023–2026',
    categories: ['Avengers', 'Kang'], roadmapIds: ['avengers', 'kang'], order: 888, current: true, auditStatus: 'Current',
    summary: 'A mission-focused Avengers team confronts the Tribulation Events, Kang’s warnings, Blood Hunt and Doom’s world order.',
    sections: [section('Published run', 'Recommended', 'Main Run', range(series('Avengers', 2023, 'Earth-616', { status: 'ongoing' }), 1, 30))], prerequisites: ['event-blood-hunt', 'event-one-world-under-doom', 'event-armageddon']
  });

  addItem({
    id: 'thunderbolts-busiek-nicieza', title: 'Thunderbolts by Busiek and Nicieza', phaseId: 'phase-3', priority: 'Peak', writer: 'Kurt Busiek and Fabian Nicieza', artists: ['Mark Bagley', 'Patrick Zircher'], years: '1997–2003',
    categories: ['Thunderbolts', 'Avengers', 'Baron Zemo'], roadmapIds: ['thunderbolts'], order: 320,
    summary: 'Villains posing as heroes discover that some of them genuinely want redemption.',
    sections: [
      section('Busiek foundation', 'Peak', 'Main Run', range(series('Thunderbolts', 1997), 1, 33)),
      section('Nicieza continuation', 'Recommended', 'Main Run', range(series('Thunderbolts', 1997), 34, 75)),
      section('Avengers/Thunderbolts finale', 'Recommended', 'Crossover', range(series('Avengers/Thunderbolts', 2004), 1, 6))
    ]
  });

  addItem({
    id: 'thunderbolts-ellis', title: 'Thunderbolts by Warren Ellis', phaseId: 'phase-5', priority: 'Peak', writer: 'Warren Ellis', artists: ['Mike Deodato Jr.'], years: '2007–2008',
    categories: ['Thunderbolts', 'Norman Osborn'], roadmapIds: ['thunderbolts'], order: 545,
    summary: 'Norman Osborn commands a government-controlled team of unstable killers during the Initiative era.',
    sections: [section('Complete run', 'Peak', 'Main Run', range(series('Thunderbolts', 1997), 110, 121))]
  });

  addItem({
    id: 'thunderbolts-jeff-parker', title: 'Thunderbolts by Jeff Parker', phaseId: 'phase-6', priority: 'Peak', writer: 'Jeff Parker', artists: ['Kev Walker', 'Declan Shalvey'], years: '2010–2013',
    categories: ['Thunderbolts', 'Dark Avengers'], roadmapIds: ['thunderbolts'], order: 635,
    summary: 'Luke Cage oversees a prison-based team that evolves into a time-travel adventure and Dark Avengers continuation.',
    sections: [
      section('Thunderbolts run', 'Peak', 'Main Run', range(series('Thunderbolts', 1997), 138, 174)),
      section('Dark Avengers continuation', 'Recommended', 'Main Run', range(series('Dark Avengers', 2012), 175, 190))
    ]
  });

  addItem({
    id: 'scarlet-witch-childrens-crusade', title: "Avengers: The Children's Crusade", phaseId: 'phase-6', priority: 'Essential', writer: 'Allan Heinberg', artists: ['Jim Cheung'], years: '2010–2012',
    categories: ['Scarlet Witch', 'Young Avengers', 'Avengers', 'X-Men'], roadmapIds: ['wanda-vision', 'legacy-heroes'], order: 640,
    summary: 'Wiccan searches for Wanda and forces Avengers, X-Men and Young Avengers to confront the truth behind Disassembled and M-Day.',
    sections: [section('Complete mini-series', 'Essential', 'Mini-series', range(series("Avengers: The Children's Crusade", 2010), 1, 9))], prerequisites: ['event-avengers-disassembled', 'event-house-of-m']
  });

  addItem({
    id: 'scarlet-witch-robinson', title: 'Scarlet Witch by James Robinson', phaseId: 'phase-7', priority: 'Peak', writer: 'James Robinson', artists: ['Various'], years: '2015–2017',
    categories: ['Scarlet Witch', 'Magic'], roadmapIds: ['wanda-vision'], order: 745,
    summary: 'Wanda travels through different magical traditions to repair witchcraft and rebuild her identity.',
    sections: [section('Complete run', 'Peak', 'Main Run', range(series('Scarlet Witch', 2015), 1, 15))]
  });

  addItem({
    id: 'vision-tom-king', title: 'Vision by Tom King', phaseId: 'phase-7', priority: 'Peak', writer: 'Tom King', artists: ['Gabriel Hernández Walta'], years: '2015–2016',
    categories: ['Vision', 'Avengers', 'Great Stories'], roadmapIds: ['wanda-vision'], order: 748,
    summary: 'Vision builds a suburban synthezoid family and creates a precise domestic tragedy.',
    sections: [section('Complete series', 'Peak', 'Main Run', range(series('Vision', 2015), 1, 12))]
  });

  addItem({
    id: 'scarlet-witch-orlando', title: 'Scarlet Witch by Steve Orlando', phaseId: 'phase-8', priority: 'Recommended', writer: 'Steve Orlando', artists: ['Sara Pichelli'], years: '2023–2024',
    categories: ['Scarlet Witch', 'Quicksilver', 'Magic'], roadmapIds: ['wanda-vision'], order: 880,
    summary: 'Wanda opens a magical last-resort shop and becomes a confident protector rather than a continuity disaster device.',
    sections: [
      section('Scarlet Witch', 'Recommended', 'Main Run', range(series('Scarlet Witch', 2023), 1, 10)),
      section('Annual', 'Recommended', 'Companion', [issue(series('Scarlet Witch', 2023), 'Annual 1')]),
      section('Scarlet Witch and Quicksilver', 'Recommended', 'Mini-series', range(series('Scarlet Witch and Quicksilver', 2024), 1, 4)),
      section('Second volume', 'Recommended', 'Main Run', range(series('Scarlet Witch', 2024), 1, 5))
    ]
  });

  addItem({
    id: 'sentry-jenkins-origin', title: 'The Sentry', phaseId: 'phase-3', priority: 'Peak', writer: 'Paul Jenkins', artists: ['Jae Lee'], years: '2000–2001',
    categories: ['Sentry', 'Great Stories'], roadmapIds: ['sentry'], order: 355,
    summary: 'A forgotten Silver Age hero discovers that the Marvel Universe erased him for a terrifying reason.',
    sections: [
      section('Main mini-series', 'Peak', 'Main Run', range(series('The Sentry', 2000), 1, 5)),
      section('Character one-shots', 'Essential', 'Companion', [oneShot('Sentry/Spider-Man', 2001), oneShot('Sentry/Hulk', 2001), oneShot('Sentry/X-Men', 2001), oneShot('Sentry/Fantastic Four', 2001), oneShot('Sentry vs. The Void', 2001)])
    ]
  });

  addItem({
    id: 'sentry-2005', title: 'The Sentry (2005)', phaseId: 'phase-4', priority: 'Recommended', writer: 'Paul Jenkins', artists: ['John Romita Jr.'], years: '2005–2006',
    categories: ['Sentry', 'New Avengers'], roadmapIds: ['sentry'], order: 445,
    summary: 'Bob Reynolds attempts to live as a public hero while the Void and his damaged identity return.',
    sections: [section('Complete series', 'Recommended', 'Main Run', range(series('The Sentry', 2005), 1, 8))]
  });

  addItem({
    id: 'sentry-lemire', title: 'Sentry by Jeff Lemire', phaseId: 'phase-7', priority: 'Recommended', writer: 'Jeff Lemire', artists: ['Kim Jacinto'], years: '2018',
    categories: ['Sentry'], roadmapIds: ['sentry'], order: 792,
    summary: 'Bob maintains an internal fantasy world to contain the Sentry and Void identities.',
    sections: [section('Complete series', 'Recommended', 'Main Run', range(series('Sentry', 2018), 1, 5))]
  });

  /* =========================
     DAREDEVIL AND ELEKTRA
     ========================= */
  addItem({
    id: 'daredevil-man-without-fear', title: 'Daredevil: The Man Without Fear', phaseId: 'phase-2', priority: 'Essential', writer: 'Frank Miller', artists: ['John Romita Jr.'], years: '1993–1994',
    categories: ['Daredevil', 'Elektra'], roadmapIds: ['daredevil', 'elektra'], order: 280,
    summary: 'A modern origin retelling that establishes Matt, Stick, Elektra and the emotional language of modern Daredevil.',
    sections: [section('Complete mini-series', 'Essential', 'Mini-series', range(series('Daredevil: The Man Without Fear', 1993), 1, 5))]
  });

  addItem({
    id: 'daredevil-frank-miller', title: 'Daredevil by Frank Miller', phaseId: 'phase-1', priority: 'Peak', writer: 'Frank Miller', artists: ['Frank Miller', 'Klaus Janson'], years: '1979–1983',
    categories: ['Daredevil', 'Elektra', 'Kingpin'], roadmapIds: ['daredevil', 'elektra'], order: 80,
    summary: 'Elektra, Bullseye, Kingpin, Stick and the Hand transform Daredevil into a noir crime and martial-arts tragedy.',
    sections: [
      section('Artist-era opening', 'Essential', 'Main Run', concat(range(daredevil1964, 158, 161), range(daredevil1964, 163, 167))),
      section('Writer-era core', 'Peak', 'Main Run', range(daredevil1964, 168, 191)),
      section('Fill-in issue', 'Optional', 'Flow Issue', [issue(daredevil1964, 162)])
    ]
  });

  addItem({
    id: 'daredevil-born-again', title: 'Born Again', phaseId: 'phase-1', priority: 'Peak', writer: 'Frank Miller', artists: ['David Mazzucchelli'], years: '1986',
    categories: ['Daredevil', 'Kingpin'], roadmapIds: ['daredevil'], order: 135,
    summary: 'Kingpin discovers Matt’s identity and begins dismantling his life.',
    sections: [section('Complete story', 'Peak', 'Main Run', range(daredevil1964, 227, 233))]
  });

  addItem({
    id: 'daredevil-nocenti', title: 'Daredevil by Ann Nocenti', phaseId: 'phase-1', priority: 'Peak', writer: 'Ann Nocenti', artists: ['John Romita Jr.', 'Lee Weeks'], years: '1986–1991',
    categories: ['Daredevil', 'Typhoid Mary'], roadmapIds: ['daredevil'], order: 155,
    summary: 'A political, surreal and morally angry Daredevil run that introduces Typhoid Mary and pushes Matt through urban and spiritual collapse.',
    sections: [
      section('Main Nocenti issues', 'Peak', 'Main Run', concat(list(daredevil1964, [236]), range(daredevil1964, 238, 245), range(daredevil1964, 247, 257), range(daredevil1964, 259, 291))),
      section('Fill-ins', 'Optional', 'Flow Issue', list(daredevil1964, [237, 246, 258]))
    ], prerequisites: ['event-inferno']
  });

  addItem({
    id: 'daredevil-yellow', title: 'Daredevil: Yellow', phaseId: 'phase-3', priority: 'Recommended', writer: 'Jeph Loeb', artists: ['Tim Sale'], years: '2001–2002',
    categories: ['Daredevil', 'Great Stories'], roadmapIds: ['daredevil'], order: 365,
    summary: 'Matt looks back at his earliest days, Karen Page and a more hopeful version of himself.',
    sections: [section('Complete mini-series', 'Recommended', 'Standalone', range(series('Daredevil: Yellow', 2001), 1, 6))]
  });

  addItem({
    id: 'daredevil-guardian-devil', title: 'Guardian Devil', phaseId: 'phase-3', priority: 'Essential', writer: 'Kevin Smith', artists: ['Joe Quesada'], years: '1998–1999',
    categories: ['Daredevil'], roadmapIds: ['daredevil'], order: 325,
    summary: 'The Marvel Knights relaunch attacks Matt through faith, grief and a seemingly miraculous infant.',
    sections: [section('Complete arc', 'Essential', 'Main Run', range(series('Daredevil', 1998), 1, 8))]
  });

  addItem({
    id: 'daredevil-parts-hole', title: 'Parts of a Hole', phaseId: 'phase-3', priority: 'Recommended', writer: 'David Mack', artists: ['Joe Quesada'], years: '1999–2000',
    categories: ['Daredevil', 'Echo'], roadmapIds: ['daredevil'], order: 340,
    summary: 'Maya Lopez enters Matt and Kingpin’s world in a story about identity, art and manipulated vengeance.',
    sections: [section('Complete arc', 'Recommended', 'Main Run', range(series('Daredevil', 1998), 9, 15))]
  });

  addItem({
    id: 'daredevil-bendis', title: 'Daredevil by Bendis and Maleev', phaseId: 'phase-3', priority: 'Peak', writer: 'Brian Michael Bendis', artists: ['Alex Maleev'], years: '2001–2006',
    categories: ['Daredevil', 'Kingpin'], roadmapIds: ['daredevil'], order: 380,
    summary: 'Matt’s identity leaks into the press, turning his life into a sustained crime, legal and political pressure cooker.',
    sections: [section('Complete Bendis run', 'Peak', 'Main Run', concat(range(series('Daredevil', 1998), 16, 19), range(series('Daredevil', 1998), 26, 50), range(series('Daredevil', 1998), 56, 81)))]
  });

  addItem({
    id: 'daredevil-brubaker', title: 'Daredevil by Ed Brubaker', phaseId: 'phase-5', priority: 'Peak', writer: 'Ed Brubaker', artists: ['Michael Lark'], years: '2006–2009',
    categories: ['Daredevil'], roadmapIds: ['daredevil'], order: 540,
    summary: 'Brubaker continues directly from Bendis, beginning in prison and escalating Matt’s war with organised crime and the Hand.',
    sections: [section('Complete run', 'Peak', 'Main Run', concat(range(series('Daredevil', 1998), 82, 119), [issue(daredevil1964, 500)]))]
  });

  addItem({
    id: 'daredevil-shadowland', title: 'Shadowland and Reborn', phaseId: 'phase-6', priority: 'Skim', writer: 'Andy Diggle', years: '2009–2011',
    categories: ['Daredevil', 'Elektra', 'Street Level'], roadmapIds: ['daredevil', 'elektra'], order: 610,
    summary: 'Matt’s leadership of the Hand collapses into a divisive supernatural event before he leaves New York to rebuild himself.',
    sections: [
      section('Daredevil chapters', 'Skim', 'Main Run', range(daredevil1964, 501, 512)),
      section('Main event', 'Skim', 'Core Chapter', range(series('Shadowland', 2010), 1, 5)),
      section('Reborn', 'Recommended', 'Epilogue', range(series('Daredevil: Reborn', 2011), 1, 4))
    ]
  });

  addItem({
    id: 'daredevil-waid', title: 'Daredevil by Mark Waid', phaseId: 'phase-6', priority: 'Peak', writer: 'Mark Waid', artists: ['Paolo Rivera', 'Marcos Martín', 'Chris Samnee'], years: '2011–2015',
    categories: ['Daredevil'], roadmapIds: ['daredevil'], order: 635,
    summary: 'Matt consciously embraces a brighter life while the darkness underneath remains unresolved.',
    sections: [
      section('New York volume', 'Peak', 'Main Run', range(series('Daredevil', 2011), 1, 36)),
      section('San Francisco volume', 'Peak', 'Main Run', concat([issue(series('Daredevil', 2014), '0.1')], range(series('Daredevil', 2014), 1, 18)))
    ]
  });

  addItem({
    id: 'daredevil-soule', title: 'Daredevil by Charles Soule', phaseId: 'phase-7', priority: 'Recommended', writer: 'Charles Soule', artists: ['Ron Garney'], years: '2015–2018',
    categories: ['Daredevil', 'Kingpin'], roadmapIds: ['daredevil'], order: 750,
    summary: 'A lawyer-written era featuring Blindspot, Muse, the restoration of Matt’s secret identity and Mayor Fisk.',
    sections: [section('Complete run', 'Recommended', 'Main Run', concat(range(series('Daredevil', 2015), 1, 28), range(daredevil1964, 595, 612), [issue(series('Daredevil', 2015), 'Annual 1')]))]
  });

  addItem({
    id: 'daredevil-zdarsky', title: 'Daredevil by Chip Zdarsky', phaseId: 'phase-7', priority: 'Peak', writer: 'Chip Zdarsky', artists: ['Marco Checchetto'], years: '2019–2023',
    categories: ['Daredevil', 'Elektra', 'Kingpin'], roadmapIds: ['daredevil', 'elektra'], order: 800,
    summary: 'Matt accidentally kills a man, Elektra becomes Daredevil and Kingpin’s rule of New York culminates in Devil’s Reign.',
    sections: [
      section('First volume', 'Peak', 'Main Run', range(series('Daredevil', 2019), 1, 36)),
      section('Annual', 'Recommended', 'Companion', [issue(series('Daredevil', 2019), 'Annual 1')]),
      section('Devil’s Reign', 'Essential', 'Crossover', range(series("Devil's Reign", 2021), 1, 6)),
      section('Woman Without Fear', 'Essential', 'Elektra Run', range(series('Daredevil: Woman Without Fear', 2022), 1, 3)),
      section('Omega', 'Recommended', 'Epilogue', [oneShot("Devil's Reign: Omega", 2022)]),
      section('Final volume', 'Peak', 'Main Run', range(series('Daredevil', 2022), 1, 14))
    ]
  });

  addItem({
    id: 'daredevil-ahmed', title: 'Daredevil by Saladin Ahmed', phaseId: 'phase-8', priority: 'Optional', writer: 'Saladin Ahmed', years: '2023–2025',
    categories: ['Daredevil'], roadmapIds: ['daredevil'], order: 900,
    summary: 'Matt returns under a supernatural status quo and confronts sins made manifest.',
    sections: [section('Complete run', 'Optional', 'Main Run', range(series('Daredevil', 2023), 1, 25))]
  });

  addItem({
    id: 'daredevil-2026', title: 'Daredevil (2026)', phaseId: 'phase-9', priority: 'Current', writer: 'Stephanie Phillips', years: '2026',
    categories: ['Daredevil'], roadmapIds: ['daredevil'], order: 958, current: true, auditStatus: 'Current',
    summary: 'The current Daredevil relaunch, tracked as issues publish.',
    sections: [section('Opening issues', 'Essential', 'Main Run', [issue(series('Daredevil', 2026, 'Earth-616', { status: 'ongoing' }), 1), issue(series('Daredevil', 2026), 2, { status: 'solicited' }), issue(series('Daredevil', 2026), 3, { status: 'solicited' })])]
  });

  addItem({
    id: 'elektra-assassin', title: 'Elektra: Assassin', phaseId: 'phase-1', priority: 'Peak', writer: 'Frank Miller', artists: ['Bill Sienkiewicz'], years: '1986–1987',
    categories: ['Elektra', 'Daredevil', 'Great Stories'], roadmapIds: ['elektra'], order: 145,
    summary: 'A surreal political and psychological spy story that pushes Elektra far beyond conventional superhero storytelling.',
    sections: [section('Complete series', 'Peak', 'Standalone', range(series('Elektra: Assassin', 1986), 1, 8))]
  });

  addItem({
    id: 'elektra-lives-again', title: 'Elektra Lives Again', phaseId: 'phase-2', priority: 'Peak', writer: 'Frank Miller', artists: ['Frank Miller'], years: '1990',
    categories: ['Elektra', 'Daredevil', 'Great Stories'], roadmapIds: ['elektra'], order: 210,
    summary: 'Matt’s grief and uncertainty over Elektra’s death unfold in a haunting painted graphic novel.',
    sections: [section('Graphic novel', 'Peak', 'Standalone', [oneShot('Elektra Lives Again', 1990)])]
  });

  addItem({
    id: 'elektra-2014', title: 'Elektra (2014)', phaseId: 'phase-6', priority: 'Recommended', writer: 'Haden Blackman', artists: ['Michael Del Mundo'], years: '2014–2015',
    categories: ['Elektra'], roadmapIds: ['elektra'], order: 710,
    summary: 'A visually inventive solo run that treats Elektra as an assassin navigating supernatural contracts and rival killers.',
    sections: [section('Complete series', 'Recommended', 'Main Run', range(series('Elektra', 2014), 1, 11))]
  });

  addItem({
    id: 'elektra-black-white-blood', title: 'Elektra: Black, White & Blood', phaseId: 'phase-8', priority: 'Recommended', writer: 'Various', years: '2022',
    categories: ['Elektra'], roadmapIds: ['elektra'], order: 858,
    summary: 'A stylish anthology of self-contained Elektra stories.',
    sections: [section('Complete anthology', 'Recommended', 'Anthology', range(series('Elektra: Black, White & Blood', 2022), 1, 4))]
  });

  /* =========================
     CAPTAIN AMERICA
     ========================= */
  addItem({
    id: 'captain-america-waid', title: 'Captain America by Mark Waid', phaseId: 'phase-2', priority: 'Peak', writer: 'Mark Waid', artists: ['Ron Garney', 'Andy Kubert'], years: '1995–2000',
    categories: ['Captain America'], roadmapIds: ['captain-america'], order: 318,
    summary: 'A classic heroic Steve Rogers run restoring Sharon Carter and focusing on Cap as a living ideal rather than a relic.',
    sections: [
      section('Operation Rebirth era', 'Peak', 'Main Run', concat(range(series('Captain America', 1968), 444, 448), range(series('Captain America', 1968), 450, 454))),
      section('Heroes Return run', 'Peak', 'Main Run', range(series('Captain America', 1998), 1, 23))
    ]
  });

  addItem({
    id: 'captain-america-white', title: 'Captain America: White', phaseId: 'phase-7', priority: 'Recommended', writer: 'Jeph Loeb', artists: ['Tim Sale'], years: '2008–2015',
    categories: ['Captain America', 'Bucky', 'Great Stories'], roadmapIds: ['captain-america'], order: 740,
    summary: 'Steve remembers Bucky and their wartime partnership through an emotional, stylised lens.',
    sections: [section('Complete series', 'Recommended', 'Standalone', concat([issue(series('Captain America: White', 2008), 0)], range(series('Captain America: White', 2008), 1, 5)))]
  });

  addItem({
    id: 'captain-america-brubaker', title: 'Captain America by Ed Brubaker', phaseId: 'phase-4', priority: 'Peak', writer: 'Ed Brubaker', artists: ['Steve Epting', 'Butch Guice'], years: '2004–2012',
    categories: ['Captain America', 'Winter Soldier', 'Avengers'], roadmapIds: ['captain-america', 'legacy-heroes'], order: 430,
    summary: 'The definitive modern Cap epic: Winter Soldier, Red Skull conspiracy, Steve’s death, Bucky carrying the shield and Steve’s return.',
    sections: [
      section('Main volume', 'Peak', 'Main Run', range(series('Captain America', 2004), 1, 50)),
      section('Legacy continuation', 'Peak', 'Main Run', range(series('Captain America', 2004), 600, 619)),
      section('Point issue', 'Recommended', 'Companion', [issue(series('Captain America', 2004), '615.1')]),
      section('Reborn', 'Essential', 'Mini-series', range(series('Captain America: Reborn', 2009), 1, 6)),
      section('Who Will Wield the Shield?', 'Essential', 'Epilogue', [oneShot('Captain America: Who Will Wield the Shield?', 2010)]),
      section('Steve Rogers: Super-Soldier', 'Recommended', 'Mini-series', range(series('Steve Rogers: Super-Soldier', 2010), 1, 4)),
      section('2011 continuation', 'Recommended', 'Main Run', range(series('Captain America', 2011), 1, 19)),
      section('Winter Soldier', 'Peak', 'Legacy Run', range(series('Winter Soldier', 2012), 1, 14)),
      section('Winter Kills', 'Recommended', 'Companion', [oneShot('Winter Soldier: Winter Kills', 2007)])
    ], prerequisites: ['event-civil-war', 'event-secret-invasion', 'event-siege']
  });

  addItem({
    id: 'secret-avengers-brubaker', title: 'Secret Avengers by Ed Brubaker', phaseId: 'phase-6', priority: 'Recommended', writer: 'Ed Brubaker', artists: ['Mike Deodato Jr.'], years: '2010–2011',
    categories: ['Captain America', 'Avengers', 'Moon Knight', 'Nova'], roadmapIds: ['captain-america', 'avengers'], order: 615,
    summary: 'Steve Rogers leads a covert Avengers team against hidden threats after Siege.',
    sections: [section('Complete Brubaker run', 'Recommended', 'Main Run', range(series('Secret Avengers', 2010), 1, 12))]
  });

  addItem({
    id: 'captain-america-remender', title: 'Captain America by Rick Remender', phaseId: 'phase-6', priority: 'Recommended', writer: 'Rick Remender', artists: ['John Romita Jr.'], years: '2012–2014',
    categories: ['Captain America', 'Sam Wilson'], roadmapIds: ['captain-america', 'legacy-heroes'], order: 690,
    summary: 'Dimension Z tests Steve’s resilience before Sam Wilson inherits the shield.',
    sections: [
      section('Steve Rogers run', 'Recommended', 'Main Run', range(series('Captain America', 2012), 1, 25)),
      section('Sam Wilson transition', 'Recommended', 'Legacy Run', range(series('All-New Captain America', 2014), 1, 6))
    ]
  });

  addItem({
    id: 'captain-america-sam-wilson', title: 'Captain America: Sam Wilson', phaseId: 'phase-7', priority: 'Recommended', writer: 'Nick Spencer', artists: ['Daniel Acuña'], years: '2015–2017',
    categories: ['Captain America', 'Sam Wilson', 'Legacy Heroes'], roadmapIds: ['captain-america', 'legacy-heroes'], order: 752,
    summary: 'Sam carries the shield through political backlash, community conflict and the road to Secret Empire.',
    sections: [section('Complete run', 'Recommended', 'Main Run', range(series('Captain America: Sam Wilson', 2015), 1, 25))]
  });

  addItem({
    id: 'captain-america-coates', title: 'Captain America by Ta-Nehisi Coates', phaseId: 'phase-7', priority: 'Optional', writer: 'Ta-Nehisi Coates', artists: ['Leinil Francis Yu'], years: '2018–2021',
    categories: ['Captain America'], roadmapIds: ['captain-america'], order: 788,
    summary: 'Steve attempts to repair the meaning of Captain America after the Hydra impostor era.',
    sections: [section('Complete run', 'Optional', 'Main Run', range(series('Captain America', 2018), 1, 30))]
  });

  addItem({
    id: 'captain-america-two-caps', title: 'Two Captains Era', phaseId: 'phase-8', priority: 'Recommended', writer: 'Jackson Lanzing, Collin Kelly and Tochi Onyebuchi', years: '2022–2023',
    categories: ['Captain America', 'Sam Wilson'], roadmapIds: ['captain-america', 'legacy-heroes'], order: 870,
    summary: 'Steve and Sam lead parallel Captain America books before converging in Cold War.',
    sections: [
      section('Sentinel of Liberty', 'Recommended', 'Main Run', range(series('Captain America: Sentinel of Liberty', 2022), 1, 13)),
      section('Symbol of Truth', 'Recommended', 'Main Run', range(series('Captain America: Symbol of Truth', 2022), 1, 14)),
      section('Cold War bookends', 'Recommended', 'Crossover', [oneShot('Captain America: Cold War Alpha', 2023), oneShot('Captain America: Cold War Omega', 2023)])
    ]
  });

  addItem({
    id: 'captain-america-jms', title: 'Captain America by J. Michael Straczynski', phaseId: 'phase-8', priority: 'Recommended', writer: 'J. Michael Straczynski', years: '2023–2025',
    categories: ['Captain America'], roadmapIds: ['captain-america'], order: 892,
    summary: 'Present-day threats are paired with Steve’s pre-serum life and early resistance to fascism.',
    sections: [section('Complete run', 'Recommended', 'Main Run', range(series('Captain America', 2023), 1, 16))]
  });

  addItem({
    id: 'captain-america-2025', title: 'Captain America by Chip Zdarsky', phaseId: 'phase-9', priority: 'Current', writer: 'Chip Zdarsky', artists: ['Valerio Schiti'], years: '2025–2026',
    categories: ['Captain America', 'Doctor Doom'], roadmapIds: ['captain-america', 'doom'], order: 932, current: true, auditStatus: 'Current',
    summary: 'Steve’s early relationship with Latveria and Doom becomes the foundation for the Armageddon era.',
    sections: [section('Published issues', 'Essential', 'Main Run', range(series('Captain America', 2025, 'Earth-616', { status: 'ongoing' }), 1, 12))], prerequisites: ['event-armageddon']
  });

  /* =========================
     VENOM AND SYMBIOTES
     ========================= */
  addItem({
    id: 'venom-lethal-protector', title: 'Venom: Lethal Protector', phaseId: 'phase-2', priority: 'Recommended', writer: 'David Michelinie', artists: ['Mark Bagley', 'Ron Lim'], years: '1993',
    categories: ['Venom', 'Symbiotes', 'Spider-Man'], roadmapIds: ['venom'], order: 270,
    summary: 'Eddie Brock begins shifting from Spider-Man villain toward violent antihero in San Francisco.',
    sections: [section('Complete mini-series', 'Recommended', 'Mini-series', range(series('Venom: Lethal Protector', 1993), 1, 6))]
  });

  addItem({
    id: 'venom-agent-venom', title: 'Venom: Agent Venom', phaseId: 'phase-6', priority: 'Peak', writer: 'Rick Remender and Cullen Bunn', artists: ['Tony Moore', 'Declan Shalvey'], years: '2011–2013',
    categories: ['Venom', 'Flash Thompson', 'Symbiotes', 'Legacy Heroes'], roadmapIds: ['venom', 'legacy-heroes'], order: 650,
    summary: 'Flash Thompson bonds with the symbiote as a government operative and struggles with addiction, violence and heroism.',
    sections: [
      section('Opening point issue', 'Essential', 'Prelude', [issue(amazing1963, '654.1')]),
      section('Remender run', 'Peak', 'Main Run', range(series('Venom', 2011), 1, 22)),
      section('Bunn continuation', 'Recommended', 'Main Run', range(series('Venom', 2011), 23, 42))
    ]
  });

  addItem({
    id: 'venom-cates', title: 'Venom by Donny Cates', phaseId: 'phase-7', priority: 'Peak', writer: 'Donny Cates', artists: ['Ryan Stegman'], years: '2018–2021',
    categories: ['Venom', 'Symbiotes', 'Knull', 'Cosmic'], roadmapIds: ['venom', 'cosmic'], order: 790,
    summary: 'The symbiote mythology expands into a cosmic history centred on Knull, Dylan Brock and the god of the abyss.',
    sections: [
      section('Main run', 'Peak', 'Main Run', range(series('Venom', 2018), 1, 35)),
      section('Essential Web of Venom one-shots', 'Recommended', 'Companion', [oneShot("Web of Venom: Ve'Nam", 2018), oneShot('Web of Venom: Carnage Born', 2018), oneShot('Web of Venom: Wraith', 2020)]),
      section('Absolute Carnage', 'Essential', 'Shared Event', range(series('Absolute Carnage', 2019), 1, 5)),
      section('King in Black', 'Essential', 'Shared Event', range(series('King in Black', 2020), 1, 5))
    ], prerequisites: ['event-absolute-carnage', 'event-king-in-black']
  });

  addItem({
    id: 'venom-ewing-ramv', title: 'Venom by Al Ewing and Ram V', phaseId: 'phase-8', priority: 'Recommended', writer: 'Al Ewing and Ram V', artists: ['Bryan Hitch'], years: '2021–2024',
    categories: ['Venom', 'Symbiotes', 'Cosmic'], roadmapIds: ['venom', 'cosmic'], order: 850,
    summary: 'Eddie explores the cosmic King in Black role while Dylan fights for his identity on Earth.',
    sections: [section('Complete run', 'Recommended', 'Main Run', range(series('Venom', 2021), 1, 39))]
  });

  addItem({
    id: 'venom-war', title: 'Venom War', phaseId: 'phase-9', priority: 'Recommended', writer: 'Al Ewing', years: '2024',
    categories: ['Venom', 'Symbiotes'], roadmapIds: ['venom'], order: 910,
    summary: 'Eddie and Dylan collide over the future of Venom while the symbiote timeline fractures.',
    sections: [
      section('Main event', 'Recommended', 'Core Chapter', range(series('Venom War', 2024), 1, 5)),
      section('Venom chapters', 'Recommended', 'Character Tie-in', range(series('Venom', 2021), 36, 39)),
      section('Selected tie-ins', 'Optional', 'Tie-in', concat(range(series('Venom War: Spider-Man', 2024), 1, 4), range(series('Venom War: Lethal Protectors', 2024), 1, 3)))
    ]
  });

  addItem({
    id: 'knull-2026', title: 'Knull (2026)', phaseId: 'phase-9', priority: 'Current', writer: 'Al Ewing', years: '2026',
    categories: ['Venom', 'Knull', 'Symbiotes', 'Cosmic'], roadmapIds: ['venom', 'cosmic'], order: 948, current: true, auditStatus: 'Current',
    summary: 'Knull returns in a five-part mini leading into Queen in Black.',
    sections: [section('Five-part mini', 'Essential', 'Main Run', [issue(series('Knull', 2026, 'Earth-616', { status: 'ongoing' }), 1), issue(series('Knull', 2026), 2), issue(series('Knull', 2026), 3, { status: 'solicited' }), issue(series('Knull', 2026), 4, { status: 'solicited' }), issue(series('Knull', 2026), 5, { status: 'solicited' })])]
  });

  /* =========================
     DOOM, THANOS, COSMIC, KANG, ULTRON
     ========================= */
  addItem({
    id: 'doom-books-of-doom', title: 'Books of Doom', phaseId: 'phase-4', priority: 'Peak', writer: 'Ed Brubaker', artists: ['Pablo Raimondi'], years: '2005–2006',
    categories: ['Doctor Doom', 'Great Stories'], roadmapIds: ['doom'], order: 452,
    summary: 'Victor recounts his life from Latveria to college, mysticism and the birth of Doctor Doom.',
    sections: [section('Complete mini-series', 'Peak', 'Main Run', range(series('Books of Doom', 2005), 1, 6))]
  });

  addItem({
    id: 'doom-emperor-doom', title: 'Emperor Doom', phaseId: 'phase-1', priority: 'Peak', writer: 'David Michelinie', artists: ['Bob Hall'], years: '1987',
    categories: ['Doctor Doom', 'Avengers', 'Great Stories'], roadmapIds: ['doom', 'avengers'], order: 170,
    summary: 'Doom takes control of the world and discovers that winning creates problems domination cannot solve.',
    sections: [section('Graphic novel', 'Peak', 'Standalone', [oneShot('Marvel Graphic Novel: Emperor Doom', 1987, 'Earth-616', { displayTitle: 'Emperor Doom (1987)' })])]
  });

  addItem({
    id: 'doom-doctor-doom-2019', title: 'Doctor Doom (2019)', phaseId: 'phase-8', priority: 'Recommended', writer: 'Christopher Cantwell', artists: ['Salvador Larroca'], years: '2019–2020',
    categories: ['Doctor Doom'], roadmapIds: ['doom'], order: 812,
    summary: 'Doom is framed, hunted and confronted by the possibility that another version of Victor could have built a better life.',
    sections: [section('Complete run', 'Recommended', 'Main Run', range(series('Doctor Doom', 2019), 1, 10))]
  });

  addItem({
    id: 'doom-triumph-torment', title: 'Triumph and Torment', phaseId: 'phase-1', priority: 'Peak', writer: 'Roger Stern', artists: ['Mike Mignola'], years: '1989',
    categories: ['Doctor Doom', 'Doctor Strange', 'Mephisto', 'Great Stories'], roadmapIds: ['doom', 'doctor-strange'], order: 198,
    summary: 'Doctor Strange helps Doom descend into Hell to rescue the soul of Victor’s mother from Mephisto.',
    sections: [section('Graphic novel', 'Peak', 'Standalone', [oneShot('Doctor Strange and Doctor Doom: Triumph and Torment', 1989)])]
  });

  addItem({
    id: 'thanos-origin-project', title: 'Thanos War / Infinity Origin', phaseId: 'phase-0', priority: 'Essential', writer: 'Jim Starlin', years: '1973–1982',
    categories: ['Thanos', 'Adam Warlock', 'Cosmic'], roadmapIds: ['thanos', 'cosmic'], order: 15,
    summary: 'The classic Thanos, Captain Marvel and Adam Warlock foundation you have already completed.',
    note: 'Marked as already read in your personal history, but preserved in the archive for reference.',
    sections: [section('Classic foundation', 'Essential', 'Main Run', [
      issue(ironMan1968, 55), issue(series('Captain Marvel', 1968), 25), issue(series('Captain Marvel', 1968), 26), issue(series('Captain Marvel', 1968), 27), issue(series('Captain Marvel', 1968), 28), issue(series('Captain Marvel', 1968), 29), issue(series('Captain Marvel', 1968), 30), issue(series('Captain Marvel', 1968), 31), issue(series('Captain Marvel', 1968), 32), issue(series('Captain Marvel', 1968), 33), issue(series('Captain Marvel', 1968), 34), issue(series('Marvel Feature', 1971), 12), issue(avengers1963, 125),
      issue(series('Strange Tales', 1973), 178), issue(series('Strange Tales', 1973), 179), issue(series('Strange Tales', 1973), 180), issue(series('Strange Tales', 1973), 181),
      issue(series('Warlock', 1972), 9), issue(series('Warlock', 1972), 10), issue(series('Warlock', 1972), 11), issue(series('Warlock', 1972), 12), issue(series('Warlock', 1972), 13), issue(series('Warlock', 1972), 14), issue(series('Warlock', 1972), 15),
      issue(series('Marvel Team-Up', 1972), 55), issue(avengers1963, 'Annual 7'), issue(series('Marvel Two-in-One', 1974), 'Annual 2'), oneShot('The Death of Captain Marvel', 1982)
    ])]
  });

  addItem({
    id: 'thanos-infinity-abyss', title: 'Infinity Abyss', phaseId: 'phase-3', priority: 'Recommended', writer: 'Jim Starlin', artists: ['Jim Starlin'], years: '2002',
    categories: ['Thanos', 'Adam Warlock', 'Cosmic'], roadmapIds: ['thanos', 'cosmic'], order: 370,
    summary: 'Failed Thanos duplicates threaten reality in a later Starlin cosmic sequel.',
    sections: [section('Complete mini-series', 'Recommended', 'Main Run', range(series('Infinity Abyss', 2002), 1, 6))]
  });

  addItem({
    id: 'thanos-2003', title: 'Thanos (2003)', phaseId: 'phase-3', priority: 'Recommended', writer: 'Jim Starlin and Keith Giffen', years: '2003–2004',
    categories: ['Thanos', 'Cosmic'], roadmapIds: ['thanos'], order: 398,
    summary: 'Thanos attempts a more reflective path while confronting Galactus and cosmic manipulation.',
    sections: [section('Complete series', 'Recommended', 'Main Run', range(series('Thanos', 2003), 1, 12))]
  });

  addItem({
    id: 'thanos-wins', title: 'Thanos Wins', phaseId: 'phase-7', priority: 'Peak', writer: 'Donny Cates', artists: ['Geoff Shaw'], years: '2017–2018',
    categories: ['Thanos', 'Cosmic', 'Great Stories'], roadmapIds: ['thanos'], order: 778,
    summary: 'Thanos is dragged to a future where his older self has conquered nearly everything.',
    sections: [section('Complete arc', 'Peak', 'Main Run', range(series('Thanos', 2016), 13, 18))]
  });

  addItem({
    id: 'kang-avengers-forever', title: 'Avengers Forever', phaseId: 'phase-3', priority: 'Peak', writer: 'Kurt Busiek and Roger Stern', artists: ['Carlos Pacheco'], years: '1998–1999',
    categories: ['Kang', 'Avengers', 'Time Travel'], roadmapIds: ['kang', 'avengers'], order: 345,
    summary: 'Avengers from across history are recruited into a time war involving Kang, Immortus and the team’s future.',
    sections: [section('Complete series', 'Peak', 'Main Run', range(series('Avengers Forever', 1998), 1, 12))]
  });

  addItem({
    id: 'kang-young-avengers', title: 'Young Avengers and Iron Lad', phaseId: 'phase-4', priority: 'Peak', writer: 'Allan Heinberg', artists: ['Jim Cheung'], years: '2005–2006',
    categories: ['Kang', 'Young Avengers', 'Legacy Heroes'], roadmapIds: ['kang', 'legacy-heroes'], order: 460,
    summary: 'A young version of Kang forms the Young Avengers to escape becoming his future self.',
    sections: [
      section('Main series', 'Peak', 'Main Run', range(series('Young Avengers', 2005), 1, 12)),
      section('Special', 'Recommended', 'Companion', [oneShot('Young Avengers Special', 2006)])
    ]
  });

  addItem({
    id: 'ultron-rage', title: 'Avengers: Rage of Ultron', phaseId: 'phase-7', priority: 'Recommended', writer: 'Rick Remender', artists: ['Jerome Opeña', 'Pepe Larraz'], years: '2015',
    categories: ['Ultron', 'Avengers', 'Hank Pym'], roadmapIds: ['ultron', 'avengers'], order: 735,
    summary: 'Ultron and Hank Pym’s relationship reaches a disturbing new fusion.',
    sections: [section('Original graphic novel', 'Recommended', 'Standalone', [oneShot('Avengers: Rage of Ultron', 2015)])]
  });

  addItem({
    id: 'age-of-ultron', title: 'Age of Ultron', phaseId: 'phase-6', priority: 'Skim', writer: 'Brian Michael Bendis', years: '2013',
    categories: ['Ultron', 'Avengers', 'Wolverine'], roadmapIds: ['ultron', 'avengers', 'wolverine'], order: 688,
    summary: 'A time-travel event in which Ultron has conquered Earth; historically notable, but not among the best Ultron stories.',
    sections: [section('Main event', 'Skim', 'Core Chapter', range(series('Age of Ultron', 2013), 1, 10))]
  });

  addItem({
    id: 'guardians-2008', title: 'Guardians of the Galaxy by Abnett and Lanning', phaseId: 'phase-5', priority: 'Peak', writer: 'Dan Abnett and Andy Lanning', artists: ['Paul Pelletier', 'Brad Walker'], years: '2008–2010',
    categories: ['Guardians of the Galaxy', 'Cosmic'], roadmapIds: ['guardians', 'cosmic'], order: 550,
    summary: 'The modern Star-Lord, Rocket, Groot, Gamora, Drax and cosmic team are forged out of Annihilation: Conquest.',
    sections: [section('Complete run', 'Peak', 'Main Run', range(series('Guardians of the Galaxy', 2008), 1, 25))], prerequisites: ['event-annihilation-conquest']
  });

  addItem({
    id: 'thanos-imperative', title: 'The Thanos Imperative', phaseId: 'phase-6', priority: 'Peak', writer: 'Dan Abnett and Andy Lanning', artists: ['Miguel Sepulveda'], years: '2010–2011',
    categories: ['Guardians of the Galaxy', 'Nova', 'Thanos', 'Cosmic'], roadmapIds: ['guardians', 'nova', 'thanos', 'cosmic'], order: 615,
    summary: 'The cosmic heroes confront the Cancerverse in the climax of the Abnett/Lanning saga.',
    sections: [
      section('Ignition', 'Essential', 'Prelude', [oneShot('The Thanos Imperative: Ignition', 2010)]),
      section('Main event', 'Peak', 'Core Chapter', range(series('The Thanos Imperative', 2010), 1, 6)),
      section('Devastation', 'Essential', 'Epilogue', [oneShot('The Thanos Imperative: Devastation', 2011)])
    ]
  });

  addItem({
    id: 'guardians-ewing', title: 'Guardians of the Galaxy by Al Ewing', phaseId: 'phase-8', priority: 'Peak', writer: 'Al Ewing', artists: ['Juann Cabal'], years: '2020–2021',
    categories: ['Guardians of the Galaxy', 'Cosmic'], roadmapIds: ['guardians', 'cosmic'], order: 838,
    summary: 'A smart, hopeful cosmic team book that builds a functional Guardians institution after years of instability.',
    sections: [section('Complete run', 'Peak', 'Main Run', range(series('Guardians of the Galaxy', 2020), 1, 18))]
  });

  addItem({
    id: 'nova-abnett-lanning', title: 'Nova by Abnett and Lanning', phaseId: 'phase-5', priority: 'Peak', writer: 'Dan Abnett and Andy Lanning', artists: ['Sean Chen', 'Wellington Alves'], years: '2007–2010',
    categories: ['Nova', 'Cosmic'], roadmapIds: ['nova', 'cosmic'], order: 545,
    summary: 'Richard Rider becomes the last Nova and carries the weight of the Worldmind after Annihilation.',
    sections: [
      section('Annihilation mini', 'Essential', 'Prelude', range(series('Annihilation: Nova', 2006), 1, 4)),
      section('Complete ongoing', 'Peak', 'Main Run', range(series('Nova', 2007), 1, 36))
    ], prerequisites: ['event-annihilation', 'event-annihilation-conquest', 'thanos-imperative']
  });

  addItem({
    id: 'nova-centurion', title: 'Nova: Centurion', phaseId: 'phase-9', priority: 'Current', writer: 'Jed MacKay', years: '2025–2026',
    categories: ['Nova', 'Cosmic'], roadmapIds: ['nova', 'cosmic'], order: 942, current: true, auditStatus: 'Current',
    summary: 'A current Richard Rider cosmic series tracked as it publishes.',
    sections: [section('Published issues', 'Recommended', 'Main Run', range(series('Nova: Centurion', 2025, 'Earth-616', { status: 'ongoing' }), 1, 8))]
  });

  addItem({
    id: 'silver-surfer-requiem', title: 'Silver Surfer: Requiem', phaseId: 'phase-5', priority: 'Peak', writer: 'J. Michael Straczynski', artists: ['Esad Ribić'], years: '2007',
    categories: ['Silver Surfer', 'Cosmic', 'Great Stories'], roadmapIds: ['silver-surfer', 'cosmic'], order: 548,
    summary: 'The Surfer faces the end of his life and returns to the worlds and people he changed.',
    sections: [section('Complete mini-series', 'Peak', 'Standalone', range(series('Silver Surfer: Requiem', 2007), 1, 4))]
  });

  addItem({
    id: 'silver-surfer-slott-allred', title: 'Silver Surfer by Slott and Allred', phaseId: 'phase-6', priority: 'Peak', writer: 'Dan Slott', artists: ['Mike Allred'], years: '2014–2017',
    categories: ['Silver Surfer', 'Cosmic'], roadmapIds: ['silver-surfer', 'cosmic'], order: 706,
    summary: 'A colourful, romantic cosmic journey that gives the Surfer a human companion and a universe of strange wonders.',
    sections: [
      section('First volume', 'Peak', 'Main Run', range(series('Silver Surfer', 2014), 1, 15)),
      section('Second volume', 'Peak', 'Main Run', range(series('Silver Surfer', 2016), 1, 14))
    ]
  });

  addItem({
    id: 'silver-surfer-black', title: 'Silver Surfer: Black', phaseId: 'phase-7', priority: 'Peak', writer: 'Donny Cates', artists: ['Tradd Moore'], years: '2019',
    categories: ['Silver Surfer', 'Knull', 'Cosmic', 'Great Stories'], roadmapIds: ['silver-surfer', 'venom', 'cosmic'], order: 802,
    summary: 'The Surfer is thrown into the ancient past and confronts Knull in a psychedelic cosmic survival story.',
    sections: [section('Complete mini-series', 'Peak', 'Standalone', range(series('Silver Surfer: Black', 2019), 1, 5))]
  });

  addItem({
    id: 'blue-marvel-legend', title: 'Adam: Legend of the Blue Marvel', phaseId: 'phase-5', priority: 'Peak', writer: 'Kevin Grevioux', artists: ['Mat Broome'], years: '2008–2009',
    categories: ['Blue Marvel', 'Cosmic', 'Legacy Heroes'], roadmapIds: ['cosmic', 'legacy-heroes'], order: 572,
    summary: 'A forgotten Black superhero’s history exposes the racism that forced Marvel’s Superman-level hero into retirement.',
    sections: [section('Complete mini-series', 'Peak', 'Main Run', range(series('Adam: Legend of the Blue Marvel', 2008), 1, 5))]
  });

  addItem({
    id: 'ultimates-ewing', title: 'Ultimates by Al Ewing', phaseId: 'phase-7', priority: 'Peak', writer: 'Al Ewing', artists: ['Kenneth Rocafort', 'Travel Foreman'], years: '2015–2017',
    categories: ['Blue Marvel', 'Captain Marvel', 'Black Panther', 'Cosmic'], roadmapIds: ['cosmic', 'black-panther'], order: 750,
    summary: 'A team of science heroes attempts to solve Galactus, cosmic structures and reality-level problems rather than merely fight them.',
    sections: [
      section('Ultimates', 'Peak', 'Main Run', range(series('Ultimates', 2015), 1, 12)),
      section('Ultimates 2', 'Peak', 'Main Run', concat(range(series('Ultimates 2', 2016), 1, 9), [issue(series('Ultimates 2', 2016), 100)]))
    ]
  });

  addItem({
    id: 'eternals-gillen', title: 'Eternals by Kieron Gillen', phaseId: 'phase-8', priority: 'Peak', writer: 'Kieron Gillen', artists: ['Esad Ribić'], years: '2021–2022',
    categories: ['Eternals', 'Cosmic'], roadmapIds: ['cosmic'], order: 852,
    summary: 'The Eternals investigate a murder and discover the cost of their immortality before Judgment Day.',
    sections: [
      section('Main series', 'Peak', 'Main Run', range(series('Eternals', 2021), 1, 12)),
      section('Specials', 'Recommended', 'Companion', [oneShot('Eternals: Celestia', 2021), oneShot('Eternals: The Heretic', 2022)])
    ], prerequisites: ['event-judgment-day']
  });

  /* =========================
     DOCTOR STRANGE, MEPHISTO, BLADE, DEFENDERS
     ========================= */
  addItem({
    id: 'doctor-strange-stern', title: 'Doctor Strange by Roger Stern', phaseId: 'phase-1', priority: 'Peak', writer: 'Roger Stern', artists: ['Paul Smith', 'Marshall Rogers'], years: '1981–1986',
    categories: ['Doctor Strange', 'Magic'], roadmapIds: ['doctor-strange'], order: 92,
    summary: 'A definitive classic Strange run balancing mystical adventure, moral intelligence and the consequences of magical authority.',
    sections: [section('Core Stern issues', 'Peak', 'Main Run', concat(range(series('Doctor Strange', 1974), 48, 62), range(series('Doctor Strange', 1974), 65, 73), list(series('Doctor Strange', 1974), [75])))]
  });

  addItem({
    id: 'doctor-strange-shamballa', title: 'Doctor Strange: Into Shamballa', phaseId: 'phase-1', priority: 'Peak', writer: 'J.M. DeMatteis', artists: ['Dan Green'], years: '1986',
    categories: ['Doctor Strange', 'Magic', 'Great Stories'], roadmapIds: ['doctor-strange'], order: 150,
    summary: 'A spiritual journey asks whether Strange would sacrifice human freedom to end suffering.',
    sections: [section('Graphic novel', 'Peak', 'Standalone', [oneShot('Doctor Strange: Into Shamballa', 1986)])]
  });

  addItem({
    id: 'doctor-strange-oath', title: 'Doctor Strange: The Oath', phaseId: 'phase-4', priority: 'Peak', writer: 'Brian K. Vaughan', artists: ['Marcos Martín'], years: '2006–2007',
    categories: ['Doctor Strange', 'Magic', 'Great Stories'], roadmapIds: ['doctor-strange'], order: 478,
    summary: 'Strange investigates an attempted murder and a magical cure while confronting the limits of medicine and power.',
    note: 'You have already read this story.',
    sections: [section('Complete mini-series', 'Peak', 'Standalone', range(series('Doctor Strange: The Oath', 2006), 1, 5))]
  });

  addItem({
    id: 'doctor-strange-aaron', title: 'Doctor Strange by Jason Aaron', phaseId: 'phase-7', priority: 'Essential', writer: 'Jason Aaron', artists: ['Chris Bachalo'], years: '2015–2017',
    categories: ['Doctor Strange', 'Magic'], roadmapIds: ['doctor-strange'], order: 744,
    summary: 'Magic develops a physical cost as an anti-magic empire attacks Earth’s sorcerers.',
    sections: [
      section('Main run', 'Essential', 'Main Run', range(series('Doctor Strange', 2015), 1, 20)),
      section('Last Days of Magic', 'Recommended', 'Companion', [oneShot('Doctor Strange: Last Days of Magic', 2016)])
    ]
  });

  addItem({
    id: 'doctor-strange-cates-damnation', title: 'Doctor Strange by Donny Cates and Damnation', phaseId: 'phase-7', priority: 'Recommended', writer: 'Donny Cates', artists: ['Gabriel Hernández Walta'], years: '2017–2018',
    categories: ['Doctor Strange', 'Mephisto', 'Magic'], roadmapIds: ['doctor-strange'], order: 780,
    summary: 'Strange rebuilds Las Vegas and accidentally creates a Mephisto-controlled supernatural crisis.',
    sections: [
      section('Doctor Strange run', 'Recommended', 'Main Run', range(series('Doctor Strange', 2015), 381, 390)),
      section('Damnation event', 'Recommended', 'Crossover', range(series('Doctor Strange: Damnation', 2018), 1, 4))
    ]
  });

  addItem({
    id: 'doctor-strange-waid', title: 'Doctor Strange by Mark Waid', phaseId: 'phase-7', priority: 'Recommended', writer: 'Mark Waid', artists: ['Jesús Saiz'], years: '2018–2019',
    categories: ['Doctor Strange', 'Cosmic', 'Magic'], roadmapIds: ['doctor-strange'], order: 794,
    summary: 'Strange loses access to Earth’s magic and searches the cosmos for new forms of sorcery.',
    sections: [section('Complete run', 'Recommended', 'Main Run', range(series('Doctor Strange', 2018), 1, 20))]
  });

  addItem({
    id: 'doctor-strange-mackay', title: 'Doctor Strange by Jed MacKay', phaseId: 'phase-8', priority: 'Peak', writer: 'Jed MacKay', artists: ['Lee Garbett', 'Pasqual Ferry'], years: '2021–2024',
    categories: ['Doctor Strange', 'Clea', 'Magic'], roadmapIds: ['doctor-strange'], order: 848,
    summary: 'Stephen’s death places Clea at the centre of magic before the pair become partners in a confident modern Strange run.',
    sections: [
      section('Death of Doctor Strange', 'Essential', 'Prelude', range(series('Death of Doctor Strange', 2021), 1, 5)),
      section('Strange starring Clea', 'Peak', 'Main Run', range(series('Strange', 2022), 1, 10)),
      section('Doctor Strange', 'Peak', 'Main Run', range(series('Doctor Strange', 2023), 1, 18))
    ], prerequisites: ['event-blood-hunt']
  });

  addItem({
    id: 'mephisto-vs', title: 'Mephisto Vs.', phaseId: 'phase-1', priority: 'Recommended', writer: 'Al Milgrom', artists: ['John Buscema'], years: '1987',
    categories: ['Mephisto', 'Magic', 'Thor', 'Fantastic Four', 'X-Men', 'Avengers'], roadmapIds: ['doctor-strange', 'thor', 'fantastic-four', 'x-men', 'avengers'], order: 172,
    summary: 'Mephisto targets several Marvel teams in a compact tour of his deal-making villainy.',
    sections: [section('Complete mini-series', 'Recommended', 'Mini-series', range(series('Mephisto Vs.', 1987), 1, 4))]
  });

  addItem({
    id: 'blade-2006', title: 'Blade (2006)', phaseId: 'phase-4', priority: 'Recommended', writer: 'Marc Guggenheim', artists: ['Howard Chaykin'], years: '2006–2007',
    categories: ['Blade', 'Horror', 'Magic'], roadmapIds: ['blade'], order: 468,
    summary: 'A modern solo that sends Blade through time and deeper into Marvel’s vampire mythology.',
    sections: [section('Complete series', 'Recommended', 'Main Run', range(series('Blade', 2006), 1, 12))]
  });

  addItem({
    id: 'blade-2023', title: 'Blade by Bryan Hill', phaseId: 'phase-8', priority: 'Peak', writer: 'Bryan Hill', artists: ['Elena Casagrande'], years: '2023–2024',
    categories: ['Blade', 'Horror', 'Magic'], roadmapIds: ['blade'], order: 884,
    summary: 'Blade unleashes an ancient evil and is forced to confront his failures as the supernatural world closes in.',
    sections: [section('Complete run', 'Peak', 'Main Run', range(series('Blade', 2023), 1, 10))]
  });

  addItem({
    id: 'blade-red-band', title: 'Blade: Red Band', phaseId: 'phase-9', priority: 'Recommended', writer: 'Bryan Hill', years: '2024–2025',
    categories: ['Blade', 'Horror'], roadmapIds: ['blade'], order: 912,
    summary: 'A mature-rated continuation of Blade’s modern supernatural direction.',
    sections: [section('Complete mini-series', 'Recommended', 'Main Run', range(series('Blade: Red Band', 2024), 1, 5))]
  });

  addItem({
    id: 'defenders-new-defenders', title: 'The New Defenders', phaseId: 'phase-1', priority: 'Recommended', writer: 'J.M. DeMatteis and Peter B. Gillis', years: '1983–1986',
    categories: ['Defenders', 'X-Men'], roadmapIds: ['defenders'], order: 108,
    summary: 'A later classic-era Defenders team featuring Beast, Angel, Iceman, Valkyrie, Gargoyle and Moondragon.',
    sections: [section('Complete era', 'Recommended', 'Main Run', range(series('Defenders', 1972), 125, 152))]
  });

  addItem({
    id: 'defenders-busiek-larsen', title: 'Defenders by Busiek and Larsen', phaseId: 'phase-3', priority: 'Peak', writer: 'Kurt Busiek and Erik Larsen', years: '2001–2002',
    categories: ['Defenders', 'Doctor Strange', 'Hulk', 'Namor', 'Silver Surfer'], roadmapIds: ['defenders'], order: 372,
    summary: 'The classic non-team is magically forced together, restoring the Strange/Hulk/Namor/Surfer chemistry.',
    sections: [
      section('Defenders', 'Peak', 'Main Run', range(series('Defenders', 2001), 1, 12)),
      section('The Order', 'Recommended', 'Continuation', range(series('The Order', 2002), 1, 6))
    ]
  });

  addItem({
    id: 'defenders-ewing', title: 'Defenders by Al Ewing', phaseId: 'phase-8', priority: 'Peak', writer: 'Al Ewing', artists: ['Javier Rodríguez'], years: '2021–2022',
    categories: ['Defenders', 'Doctor Strange', 'Cosmic', 'Magic'], roadmapIds: ['defenders', 'cosmic'], order: 846,
    summary: 'A reality-bending journey through Marvel’s deepest cosmology and previous universes.',
    sections: [
      section('Defenders', 'Peak', 'Main Run', range(series('Defenders', 2021), 1, 5)),
      section('Defenders Beyond', 'Peak', 'Continuation', range(series('Defenders Beyond', 2022), 1, 5))
    ]
  });

  /* =========================
     BLACK PANTHER, JESSICA JONES, LUKE CAGE, IRON FIST, MOON KNIGHT, PUNISHER
     ========================= */
  addItem({
    id: 'black-panther-1988', title: 'Black Panther (1988)', phaseId: 'phase-1', priority: 'Recommended', writer: 'Peter B. Gillis', artists: ['Denys Cowan'], years: '1988',
    categories: ['Black Panther', 'Wakanda'], roadmapIds: ['black-panther'], order: 180,
    summary: 'A compact late-80s political Black Panther story and a useful bridge into the more ambitious McGregor material.',
    sections: [section('Complete mini-series', 'Recommended', 'Mini-series', range(series('Black Panther', 1988), 1, 4))]
  });

  addItem({
    id: 'black-panther-panthers-quest', title: "Panther's Quest", phaseId: 'phase-1', priority: 'Peak', writer: 'Don McGregor', artists: ['Gene Colan'], years: '1989',
    categories: ['Black Panther', 'Wakanda', 'Great Stories'], roadmapIds: ['black-panther'], order: 192,
    summary: 'T’Challa enters apartheid South Africa in search of his mother, combining espionage, politics and personal stakes.',
    sections: [section('Complete serial', 'Peak', 'Main Run', range(series('Marvel Comics Presents', 1988), 13, 37))]
  });

  addItem({
    id: 'black-panther-panthers-prey', title: "Panther's Prey", phaseId: 'phase-2', priority: 'Recommended', writer: 'Don McGregor', artists: ['Dwayne Turner'], years: '1990–1991',
    categories: ['Black Panther', 'Wakanda'], roadmapIds: ['black-panther'], order: 218,
    summary: 'T’Challa returns to Wakanda and faces political unrest, addiction and hidden enemies.',
    sections: [section('Complete mini-series', 'Recommended', 'Mini-series', range(series("Black Panther: Panther's Prey", 1990), 1, 4))]
  });

  addItem({
    id: 'black-panther-priest', title: 'Black Panther by Christopher Priest', phaseId: 'phase-3', priority: 'Peak', writer: 'Christopher Priest', artists: ['Mark Texeira', 'Sal Velluto'], years: '1998–2003',
    categories: ['Black Panther', 'Wakanda', 'Avengers'], roadmapIds: ['black-panther'], order: 335,
    summary: 'The definitive modern T’Challa run: politics, strategy, Everett Ross, Dora Milaje and a terrifyingly competent king.',
    sections: [section('Complete run', 'Peak', 'Main Run', range(series('Black Panther', 1998), 1, 62))]
  });

  addItem({
    id: 'black-panther-hudlin', title: 'Black Panther by Reginald Hudlin', phaseId: 'phase-4', priority: 'Recommended', writer: 'Reginald Hudlin', artists: ['John Romita Jr.', 'Scot Eaton'], years: '2005–2008',
    categories: ['Black Panther', 'Storm', 'Wakanda'], roadmapIds: ['black-panther'], order: 458,
    summary: 'A more mythic, action-forward T’Challa era introducing the modern Shuri and the Storm marriage.',
    sections: [
      section('Opening and origin retelling', 'Recommended', 'Main Run', range(series('Black Panther', 2005), 1, 18)),
      section('Wedding and Civil War era', 'Recommended', 'Main Run', range(series('Black Panther', 2005), 19, 34)),
      section('Later continuation', 'Optional', 'Main Run', range(series('Black Panther', 2005), 35, 41)),
      section('Wedding X-Men chapters', 'Recommended', 'Crossover', range(series('X-Men', 1991), 175, 176))
    ]
  });

  addItem({
    id: 'black-panther-doomwar', title: 'Doomwar', phaseId: 'phase-6', priority: 'Recommended', writer: 'Jonathan Maberry', artists: ['Scot Eaton'], years: '2010',
    categories: ['Black Panther', 'Doctor Doom', 'Wakanda'], roadmapIds: ['black-panther', 'doom'], order: 618,
    summary: 'Doom steals Wakanda’s vibranium and forces T’Challa into a devastating strategic response.',
    sections: [section('Complete event', 'Recommended', 'Core Chapter', range(series('Doomwar', 2010), 1, 6))]
  });

  addItem({
    id: 'black-panther-man-without-fear', title: 'Black Panther: Man Without Fear', phaseId: 'phase-6', priority: 'Recommended', writer: 'David Liss', artists: ['Francesco Francavilla'], years: '2010–2012',
    categories: ['Black Panther', 'Street Level'], roadmapIds: ['black-panther'], order: 622,
    summary: 'T’Challa operates without Wakandan resources in Hell’s Kitchen and rebuilds himself through street-level challenges.',
    sections: [
      section('Man Without Fear', 'Recommended', 'Main Run', range(daredevil1964, 513, 523)),
      section('Most Dangerous Man Alive', 'Recommended', 'Main Run', concat([issue(daredevil1964, '523.1')], range(daredevil1964, 524, 529)))
    ]
  });

  addItem({
    id: 'black-panther-coates', title: 'Black Panther by Ta-Nehisi Coates', phaseId: 'phase-7', priority: 'Essential', writer: 'Ta-Nehisi Coates', artists: ['Brian Stelfreeze', 'Daniel Acuña'], years: '2016–2021',
    categories: ['Black Panther', 'Wakanda'], roadmapIds: ['black-panther'], order: 758,
    summary: 'A political and philosophical examination of monarchy, democracy, trauma and Wakanda’s future.',
    sections: [
      section('First volume', 'Essential', 'Main Run', concat(range(series('Black Panther', 2016), 1, 18), range(series('Black Panther', 2016), 166, 172))),
      section('Intergalactic Empire', 'Recommended', 'Main Run', range(series('Black Panther', 2018), 1, 25))
    ]
  });

  addItem({
    id: 'black-panther-ewing', title: 'Black Panther by Eve L. Ewing', phaseId: 'phase-8', priority: 'Recommended', writer: 'Eve L. Ewing', artists: ['Chris Allen'], years: '2023–2024',
    categories: ['Black Panther', 'Street Level', 'Wakanda'], roadmapIds: ['black-panther'], order: 886,
    summary: 'T’Challa works from the streets of Birnin T’Chaka after losing his throne and public authority.',
    sections: [section('Complete run', 'Recommended', 'Main Run', range(series('Black Panther', 2023), 1, 10))]
  });

  addItem({
    id: 'alias', title: 'Alias', phaseId: 'phase-3', priority: 'Peak', writer: 'Brian Michael Bendis', artists: ['Michael Gaydos'], years: '2001–2004',
    categories: ['Jessica Jones', 'Luke Cage', 'Great Stories', 'Street Level'], roadmapIds: ['jessica-jones', 'luke-cage'], order: 375,
    summary: 'Jessica Jones works as a private investigator while confronting trauma, failed heroism and the Purple Man.',
    sections: [section('Complete series', 'Peak', 'Main Run', range(series('Alias', 2001), 1, 28))]
  });

  addItem({
    id: 'the-pulse', title: 'The Pulse', phaseId: 'phase-4', priority: 'Recommended', writer: 'Brian Michael Bendis', artists: ['Mark Bagley', 'Michael Lark'], years: '2004–2006',
    categories: ['Jessica Jones', 'Luke Cage', 'Spider-Man'], roadmapIds: ['jessica-jones', 'luke-cage'], order: 435,
    summary: 'Jessica and Ben Urich investigate superhero news while Jessica and Luke move toward family life.',
    sections: [section('Core run', 'Recommended', 'Main Run', concat(range(series('The Pulse', 2004), 1, 9), range(series('The Pulse', 2004), 11, 14)))]
  });

  addItem({
    id: 'jessica-jones-2016', title: 'Jessica Jones (2016)', phaseId: 'phase-7', priority: 'Recommended', writer: 'Brian Michael Bendis', artists: ['Michael Gaydos'], years: '2016–2018',
    categories: ['Jessica Jones', 'Luke Cage', 'Street Level'], roadmapIds: ['jessica-jones'], order: 768,
    summary: 'Jessica returns to private investigation while her marriage and hidden choices place her under suspicion.',
    sections: [section('Complete run', 'Recommended', 'Main Run', range(series('Jessica Jones', 2016), 1, 18))]
  });

  addItem({
    id: 'luke-cage-power-man-iron-fist', title: 'Power Man and Iron Fist Classics', phaseId: 'phase-0', priority: 'Recommended', writer: 'Various', years: '1978–1986',
    categories: ['Luke Cage', 'Iron Fist', 'Defenders'], roadmapIds: ['luke-cage', 'iron-fist'], order: 35,
    summary: 'The classic Heroes for Hire partnership that defines Luke and Danny’s friendship.',
    sections: [section('Complete partnership era', 'Recommended', 'Main Run', range(series('Power Man and Iron Fist', 1978), 50, 125))]
  });

  addItem({
    id: 'power-man-iron-fist-2016', title: 'Power Man and Iron Fist (2016)', phaseId: 'phase-7', priority: 'Recommended', writer: 'David F. Walker', artists: ['Sanford Greene'], years: '2016–2017',
    categories: ['Luke Cage', 'Iron Fist'], roadmapIds: ['luke-cage', 'iron-fist'], order: 762,
    summary: 'Luke and Danny reunite in a funny, warm and visually distinctive modern Heroes for Hire run.',
    sections: [section('Complete run', 'Recommended', 'Main Run', range(series('Power Man and Iron Fist', 2016), 1, 15))]
  });

  addItem({
    id: 'luke-cage-2017', title: 'Luke Cage (2017)', phaseId: 'phase-7', priority: 'Recommended', writer: 'David F. Walker', years: '2017–2018',
    categories: ['Luke Cage', 'Street Level'], roadmapIds: ['luke-cage'], order: 776,
    summary: 'Luke investigates a scientist’s death and confronts exploitation tied to his powers.',
    sections: [section('Complete run', 'Recommended', 'Main Run', range(series('Luke Cage', 2017), 1, 10))]
  });

  addItem({
    id: 'immortal-iron-fist', title: 'The Immortal Iron Fist', phaseId: 'phase-5', priority: 'Peak', writer: 'Ed Brubaker, Matt Fraction and Duane Swierczynski', artists: ['David Aja'], years: '2006–2009',
    categories: ['Iron Fist', 'Legacy Heroes', 'Magic'], roadmapIds: ['iron-fist', 'legacy-heroes'], order: 500,
    summary: 'The history of previous Iron Fists, heavenly cities and martial-arts legacy transforms Danny Rand’s mythology.',
    sections: [
      section('Complete ongoing', 'Peak', 'Main Run', range(series('Immortal Iron Fist', 2006), 1, 27)),
      section('Annual', 'Recommended', 'Companion', [issue(series('Immortal Iron Fist', 2006), 'Annual 1')]),
      section('Orson Randall specials', 'Recommended', 'Companion', [oneShot('Immortal Iron Fist: Orson Randall and the Green Mist of Death', 2008), oneShot('Immortal Iron Fist: Orson Randall and the Death Queen of California', 2009)]),
      section('Immortal Weapons', 'Recommended', 'Companion', range(series('Immortal Weapons', 2009), 1, 5))
    ]
  });

  addItem({
    id: 'moon-knight-moench-sienkiewicz', title: 'Moon Knight by Moench and Sienkiewicz', phaseId: 'phase-0', priority: 'Peak', writer: 'Doug Moench', artists: ['Bill Sienkiewicz'], years: '1980–1984',
    categories: ['Moon Knight', 'Street Level', 'Horror'], roadmapIds: ['moon-knight'], order: 45,
    summary: 'The defining classic Moon Knight run establishes Marc’s supporting cast, identities and eerie urban tone.',
    sections: [section('Complete run', 'Peak', 'Main Run', range(series('Moon Knight', 1980), 1, 38))]
  });

  addItem({
    id: 'moon-knight-ellis', title: 'Moon Knight by Ellis and Shalvey', phaseId: 'phase-6', priority: 'Peak', writer: 'Warren Ellis', artists: ['Declan Shalvey'], years: '2014',
    categories: ['Moon Knight', 'Street Level'], roadmapIds: ['moon-knight'], order: 702,
    summary: 'Six precise one-issue missions reinvent Moon Knight as Mr. Knight, detective and terrifying urban vigilante.',
    sections: [section('Complete creator run', 'Peak', 'Main Run', range(series('Moon Knight', 2014), 1, 6))]
  });

  addItem({
    id: 'moon-knight-lemire', title: 'Moon Knight by Jeff Lemire', phaseId: 'phase-7', priority: 'Peak', writer: 'Jeff Lemire', artists: ['Greg Smallwood'], years: '2016–2017',
    categories: ['Moon Knight', 'Horror'], roadmapIds: ['moon-knight'], order: 765,
    summary: 'Marc confronts his identities, childhood and Khonshu inside a fractured mental landscape.',
    sections: [section('Complete run', 'Peak', 'Main Run', range(series('Moon Knight', 2016), 1, 14))]
  });

  addItem({
    id: 'moon-knight-mackay', title: 'Moon Knight by Jed MacKay', phaseId: 'phase-8', priority: 'Peak', writer: 'Jed MacKay', artists: ['Alessandro Cappuccio'], years: '2021–2024',
    categories: ['Moon Knight', 'Magic', 'Street Level'], roadmapIds: ['moon-knight'], order: 854,
    summary: 'Marc builds the Midnight Mission, a congregation and a durable supporting cast while confronting his own destructive patterns.',
    sections: [
      section('Moon Knight', 'Peak', 'Main Run', range(series('Moon Knight', 2021), 1, 30)),
      section('Devil’s Reign special', 'Recommended', 'Crossover', [oneShot("Devil's Reign: Moon Knight", 2022)]),
      section('Vengeance of the Moon Knight', 'Recommended', 'Continuation', range(series('Vengeance of the Moon Knight', 2024), 1, 10)),
      section('Fist of Khonshu', 'Current', 'Continuation', range(series('Moon Knight: Fist of Khonshu', 2024, 'Earth-616', { status: 'ongoing' }), 1, 12))
    ]
  });

  addItem({
    id: 'punisher-circle-blood', title: 'Punisher: Circle of Blood', phaseId: 'phase-1', priority: 'Essential', writer: 'Steven Grant', artists: ['Mike Zeck'], years: '1986',
    categories: ['Punisher', 'Street Level'], roadmapIds: ['punisher'], order: 152,
    summary: 'The first Punisher solo mini defines Frank’s methods, enemies and war on crime.',
    sections: [section('Complete mini-series', 'Essential', 'Mini-series', range(series('Punisher', 1986), 1, 5))]
  });

  addItem({
    id: 'punisher-welcome-back-frank', title: 'Welcome Back, Frank', phaseId: 'phase-3', priority: 'Peak', writer: 'Garth Ennis', artists: ['Steve Dillon'], years: '2000–2001',
    categories: ['Punisher', 'Street Level'], roadmapIds: ['punisher'], order: 360,
    summary: 'Ennis and Dillon restore Frank as a darkly comic urban force of nature.',
    sections: [section('Complete story', 'Peak', 'Main Run', range(series('Punisher', 2000), 1, 12))]
  });

  addItem({
    id: 'punisher-marvel-knights', title: 'Punisher by Garth Ennis: Marvel Knights', phaseId: 'phase-3', priority: 'Recommended', writer: 'Garth Ennis', artists: ['Steve Dillon'], years: '2001–2004',
    categories: ['Punisher', 'Street Level'], roadmapIds: ['punisher'], order: 382,
    summary: 'A black-comedy superhero-universe Punisher run before Ennis moves to the harsher MAX line.',
    sections: [section('Complete run', 'Recommended', 'Main Run', range(series('Punisher', 2001), 1, 37))]
  });

  addItem({
    id: 'punisher-max-ennis', title: 'Punisher MAX by Garth Ennis', phaseId: 'phase-4', priority: 'Peak', writer: 'Garth Ennis', artists: ['Leandro Fernández', 'Goran Parlov'], years: '2004–2009',
    categories: ['Punisher', 'MAX', 'Street Level'], roadmapIds: ['punisher'], order: 440,
    summary: 'A mature crime-war masterpiece that removes superheroes and treats Frank as an ageing product of permanent war.',
    sections: [
      section('Born', 'Peak', 'Prelude', range(series('Born', 2003, 'MAX'), 1, 4)),
      section('Punisher MAX', 'Peak', 'Main Run', range(series('Punisher MAX', 2004, 'MAX'), 1, 60)),
      section('The Platoon', 'Peak', 'Companion', range(series('Punisher: The Platoon', 2017, 'MAX'), 1, 6))
    ], page: 'elseworlds'
  });

  addItem({
    id: 'punishermax-aaron', title: 'PunisherMAX by Jason Aaron', phaseId: 'phase-6', priority: 'Peak', writer: 'Jason Aaron', artists: ['Steve Dillon'], years: '2010–2012',
    categories: ['Punisher', 'MAX'], roadmapIds: ['punisher'], order: 628,
    summary: 'Jason Aaron closes the MAX version of Frank Castle through Kingpin, Bullseye and a final reckoning.',
    sections: [section('Complete run', 'Peak', 'Main Run', range(series('PunisherMAX', 2010, 'MAX'), 1, 22))], page: 'elseworlds'
  });

  /* =========================
     HOWLING COMMANDOS, CHAMPIONS, LEGACY HEROES, GREAT STORIES
     ========================= */
  addItem({
    id: 'howling-commandos-wwii', title: 'Sgt. Fury and His Howling Commandos: Peak Selection', phaseId: 'phase-0', priority: 'Recommended', writer: 'Stan Lee and Gary Friedrich', artists: ['Jack Kirby', 'Dick Ayers', 'John Severin'], years: '1963–1967',
    categories: ['Howling Commandos', 'Nick Fury', 'War'], roadmapIds: ['howling-commandos'], order: 2,
    summary: 'A curated WWII route through the original Howling Commandos rather than the entire long-running title.',
    sections: [
      section('Opening team formation', 'Essential', 'Selected Issues', range(series('Sgt. Fury and His Howling Commandos', 1963), 1, 7)),
      section('Peak standalone issues', 'Recommended', 'Selected Issues', list(series('Sgt. Fury and His Howling Commandos', 1963), [13, 18, 25, 34])),
      section('Annuals', 'Recommended', 'Companion', list(series('Sgt. Fury and His Howling Commandos', 1963), ['Annual 1', 'Annual 2', 'Annual 3']))
    ]
  });

  addItem({
    id: 'nick-fury-steranko', title: 'Nick Fury, Agent of S.H.I.E.L.D. by Steranko', phaseId: 'phase-0', priority: 'Peak', writer: 'Jim Steranko and Stan Lee', artists: ['Jim Steranko'], years: '1966–1969',
    categories: ['Nick Fury', 'S.H.I.E.L.D.', 'Great Stories'], roadmapIds: ['howling-commandos'], order: 6,
    summary: 'Pop-art espionage innovation that turns Nick Fury into Marvel’s definitive super-spy.',
    sections: [
      section('Strange Tales feature', 'Peak', 'Main Run', range(series('Strange Tales', 1951), 135, 168)),
      section('Solo title opening', 'Peak', 'Main Run', range(series('Nick Fury, Agent of S.H.I.E.L.D.', 1968), 1, 5))
    ]
  });

  addItem({
    id: 'fury-max', title: 'Fury MAX / My War Gone By', phaseId: 'phase-6', priority: 'Peak', writer: 'Garth Ennis', artists: ['Goran Parlov'], years: '2012–2013',
    categories: ['Nick Fury', 'MAX', 'War'], roadmapIds: ['howling-commandos'], order: 670,
    summary: 'A mature war-history interpretation of Nick Fury across decades of American intervention.',
    sections: [
      section('Peacemaker', 'Recommended', 'Prelude', range(series('Fury: Peacemaker', 2006, 'MAX'), 1, 6)),
      section('My War Gone By', 'Peak', 'Main Run', range(series('Fury MAX', 2012, 'MAX'), 1, 13))
    ], page: 'elseworlds'
  });

  addItem({
    id: 'champions-2016', title: 'Champions (2016)', phaseId: 'phase-7', priority: 'Recommended', writer: 'Mark Waid and Jim Zub', artists: ['Humberto Ramos', 'Sean Izaakse'], years: '2016–2019',
    categories: ['Champions', 'Legacy Heroes', 'Ms. Marvel', 'Miles Morales'], roadmapIds: ['champions', 'legacy-heroes'], order: 760,
    summary: 'Young heroes leave the Avengers to build a team centred on accountability, public trust and helping people rather than winning fights.',
    sections: [
      section('Main volume', 'Recommended', 'Main Run', range(series('Champions', 2016), 1, 27)),
      section('Monsters Unleashed special', 'Optional', 'Tie-in', [issue(series('Champions', 2016), '1.MU')])
    ]
  });

  addItem({
    id: 'champions-zub', title: 'Champions by Jim Zub', phaseId: 'phase-7', priority: 'Peak', writer: 'Jim Zub', artists: ['Steven Cummings'], years: '2019',
    categories: ['Champions', 'Legacy Heroes'], roadmapIds: ['champions', 'legacy-heroes'], order: 797,
    summary: 'A stronger, emotionally sharper Champions continuation that tests the cost of leadership and hidden deals.',
    sections: [section('Complete volume', 'Peak', 'Main Run', range(series('Champions', 2019), 1, 10))]
  });

  addItem({
    id: 'ms-marvel-wilson', title: 'Ms. Marvel by G. Willow Wilson', phaseId: 'phase-6', priority: 'Peak', writer: 'G. Willow Wilson', artists: ['Adrian Alphona', 'Takeshi Miyazawa'], years: '2014–2019',
    categories: ['Ms. Marvel', 'Legacy Heroes', 'Champions'], roadmapIds: ['legacy-heroes', 'champions'], order: 704,
    summary: 'Kamala Khan becomes one of Marvel’s defining modern legacy heroes through family, faith, community and superhero responsibility.',
    sections: [
      section('First volume', 'Peak', 'Main Run', range(series('Ms. Marvel', 2014), 1, 19)),
      section('Second volume', 'Peak', 'Main Run', range(series('Ms. Marvel', 2015), 1, 38))
    ]
  });

  addItem({
    id: 'hawkeye-fraction', title: 'Hawkeye by Fraction and Aja', phaseId: 'phase-6', priority: 'Peak', writer: 'Matt Fraction', artists: ['David Aja'], years: '2012–2015',
    categories: ['Hawkeye', 'Kate Bishop', 'Great Stories', 'Street Level'], roadmapIds: ['legacy-heroes'], order: 692,
    summary: 'Clint and Kate deal with ordinary people, organised crime and the damage created between Avengers missions.',
    sections: [section('Complete run', 'Peak', 'Main Run', range(series('Hawkeye', 2012), 1, 22))]
  });

  addItem({
    id: 'runaways-bkv', title: 'Runaways by Brian K. Vaughan', phaseId: 'phase-3', priority: 'Peak', writer: 'Brian K. Vaughan', artists: ['Adrian Alphona'], years: '2003–2007',
    categories: ['Runaways', 'Legacy Heroes'], roadmapIds: ['legacy-heroes'], order: 400,
    summary: 'Teenagers discover that their parents are supervillains and attempt to build a family of their own.',
    sections: [
      section('First series', 'Peak', 'Main Run', range(series('Runaways', 2003), 1, 18)),
      section('Second series Vaughan run', 'Peak', 'Main Run', range(series('Runaways', 2005), 1, 24))
    ]
  });

  addItem({
    id: 'young-avengers-gillen', title: 'Young Avengers by Kieron Gillen', phaseId: 'phase-6', priority: 'Peak', writer: 'Kieron Gillen', artists: ['Jamie McKelvie'], years: '2013–2014',
    categories: ['Young Avengers', 'Wiccan', 'Hulkling', 'Kate Bishop', 'Legacy Heroes'], roadmapIds: ['legacy-heroes'], order: 696,
    summary: 'A stylish young-adult superhero story about identity, chosen family and escaping parental expectations.',
    sections: [section('Complete run', 'Peak', 'Main Run', range(series('Young Avengers', 2013), 1, 15))]
  });

  addItem({
    id: 'all-new-wolverine', title: 'All-New Wolverine', phaseId: 'phase-7', priority: 'Peak', writer: 'Tom Taylor', artists: ['David López'], years: '2015–2018',
    categories: ['Laura Kinney', 'Wolverine', 'Legacy Heroes', 'X-Men'], roadmapIds: ['legacy-heroes', 'wolverine'], order: 746,
    summary: 'Laura Kinney takes the Wolverine name and proves that compassion can define the legacy as powerfully as violence.',
    sections: [section('Complete run', 'Peak', 'Main Run', range(series('All-New Wolverine', 2015), 1, 35))]
  });

  addItem({
    id: 'marvels', title: 'Marvels', phaseId: 'phase-2', priority: 'Peak', writer: 'Kurt Busiek', artists: ['Alex Ross'], years: '1994',
    categories: ['Great Stories', 'Marvel Universe'], roadmapIds: ['great-stories'], order: 288,
    summary: 'Marvel history is experienced through an ordinary photographer living beneath gods, monsters and heroes.',
    sections: [section('Complete series', 'Peak', 'Standalone', concat([issue(series('Marvels', 1994), 0)], range(series('Marvels', 1994), 1, 4)))]
  });

  addItem({
    id: 'uncanny-xforce-remender', title: 'Uncanny X-Force by Rick Remender', phaseId: 'phase-6', priority: 'Peak', writer: 'Rick Remender', artists: ['Jerome Opeña', 'Phil Noto'], years: '2010–2012',
    categories: ['X-Force', 'Wolverine', 'Psylocke', 'Deadpool', 'X-Men'], roadmapIds: ['x-men', 'wolverine'], order: 632,
    summary: 'A secret mutant kill-team confronts Apocalypse, Archangel and the moral poison of necessary violence.',
    sections: [section('Complete run', 'Peak', 'Main Run', range(series('Uncanny X-Force', 2010), 1, 35))]
  });

  addItem({
    id: 'secret-warriors-hickman', title: 'Secret Warriors by Jonathan Hickman', phaseId: 'phase-5', priority: 'Peak', writer: 'Jonathan Hickman', artists: ['Stefano Caselli'], years: '2009–2011',
    categories: ['Nick Fury', 'S.H.I.E.L.D.', 'Hydra', 'Great Stories'], roadmapIds: ['great-stories', 'howling-commandos'], order: 588,
    summary: 'Nick Fury builds a covert team and uncovers a global Hydra/Leviathan conspiracy.',
    sections: [section('Complete run', 'Peak', 'Main Run', range(series('Secret Warriors', 2009), 1, 28))]
  });

  addItem({
    id: 'black-widow-waid-samnee', title: 'Black Widow by Waid and Samnee', phaseId: 'phase-7', priority: 'Peak', writer: 'Mark Waid and Chris Samnee', artists: ['Chris Samnee'], years: '2016–2017',
    categories: ['Black Widow', 'S.H.I.E.L.D.', 'Great Stories'], roadmapIds: ['great-stories'], order: 764,
    summary: 'A sleek spy thriller that forces Natasha to confront the Red Room and the consequences of her history.',
    sections: [section('Complete run', 'Peak', 'Main Run', range(series('Black Widow', 2016), 1, 12))]
  });

  addItem({
    id: 'nextwave', title: 'Nextwave: Agents of H.A.T.E.', phaseId: 'phase-4', priority: 'Peak', writer: 'Warren Ellis', artists: ['Stuart Immonen'], years: '2006–2007',
    categories: ['Great Stories', 'Team'], roadmapIds: ['great-stories'], order: 482,
    summary: 'A deliberately absurd, hyperactive satire of Marvel superhero teams and corporate villainy.',
    sections: [section('Complete series', 'Peak', 'Standalone', range(series('Nextwave: Agents of H.A.T.E.', 2006), 1, 12))]
  });

  /* =========================
     ULTIMATE UNIVERSE PAGE
     ========================= */
  addItem({
    id: 'ultimate-spider-man-peter', title: 'Ultimate Spider-Man: Peter Parker', priority: 'Peak', writer: 'Brian Michael Bendis', artists: ['Mark Bagley', 'Stuart Immonen'], years: '2000–2011',
    categories: ['Ultimate Universe', 'Spider-Man'], roadmapIds: ['ultimate'], page: 'ultimate', order: 10,
    summary: 'A complete modernised Peter Parker saga with a clear beginning, middle and ending.',
    sections: [
      section('Original series', 'Peak', 'Main Run', range(series('Ultimate Spider-Man', 2000, 'Earth-1610'), 1, 133)),
      section('Requiem', 'Essential', 'Epilogue', range(series('Ultimatum: Spider-Man Requiem', 2009, 'Earth-1610'), 1, 2)),
      section('Ultimate Comics era', 'Peak', 'Main Run', range(series('Ultimate Comics Spider-Man', 2009, 'Earth-1610'), 1, 15)),
      section('Legacy-numbered continuation', 'Peak', 'Main Run', range(series('Ultimate Spider-Man', 2000, 'Earth-1610'), 150, 160)),
      section('Ultimate Fallout', 'Essential', 'Epilogue', range(series('Ultimate Fallout', 2011, 'Earth-1610'), 1, 6))
    ]
  });

  addItem({
    id: 'ultimate-miles', title: 'Miles Morales in Earth-1610', priority: 'Peak', writer: 'Brian Michael Bendis', artists: ['Sara Pichelli', 'David Marquez'], years: '2011–2015',
    categories: ['Ultimate Universe', 'Miles Morales', 'Legacy Heroes'], roadmapIds: ['ultimate', 'legacy-heroes'], page: 'ultimate', order: 20,
    summary: 'Miles inherits the Spider-Man legacy after Peter’s death and grows into a distinct hero.',
    sections: [
      section('First appearance', 'Essential', 'Prelude', [issue(series('Ultimate Fallout', 2011, 'Earth-1610'), 4)]),
      section('Ultimate Comics Spider-Man', 'Peak', 'Main Run', range(series('Ultimate Comics Spider-Man', 2011, 'Earth-1610'), 1, 28)),
      section('Cataclysm tie-in', 'Recommended', 'Crossover', range(series('Cataclysm: Ultimate Spider-Man', 2013, 'Earth-1610'), 1, 3)),
      section('Miles Morales: Ultimate Spider-Man', 'Peak', 'Main Run', range(series('Miles Morales: Ultimate Spider-Man', 2014, 'Earth-1610'), 1, 12))
    ]
  });

  addItem({
    id: 'ultimate-xmen', title: 'Ultimate X-Men: Curated Route', priority: 'Recommended', writer: 'Mark Millar, Brian K. Vaughan and others', years: '2001–2009',
    categories: ['Ultimate Universe', 'X-Men'], roadmapIds: ['ultimate'], page: 'ultimate', order: 30,
    summary: 'A selective route through the strongest and most continuity-important parts of Earth-1610 mutant history.',
    sections: [
      section('Mark Millar foundation', 'Recommended', 'Main Run', range(series('Ultimate X-Men', 2001, 'Earth-1610'), 1, 33)),
      section('Brian K. Vaughan era', 'Recommended', 'Main Run', range(series('Ultimate X-Men', 2001, 'Earth-1610'), 46, 65)),
      section('Later Kirkman era', 'Optional', 'Main Run', range(series('Ultimate X-Men', 2001, 'Earth-1610'), 66, 93)),
      section('Remaining issues', 'Skim', 'Completionist', concat(range(series('Ultimate X-Men', 2001, 'Earth-1610'), 34, 45), range(series('Ultimate X-Men', 2001, 'Earth-1610'), 94, 100)))
    ]
  });

  addItem({
    id: 'ultimates-millar-hitch', title: 'The Ultimates by Millar and Hitch', priority: 'Peak', writer: 'Mark Millar', artists: ['Bryan Hitch'], years: '2002–2007',
    categories: ['Ultimate Universe', 'Avengers'], roadmapIds: ['ultimate'], page: 'ultimate', order: 40,
    summary: 'A cynical, cinematic reinvention of the Avengers that defines the early Ultimate Universe.',
    sections: [
      section('The Ultimates', 'Peak', 'Main Run', range(series('The Ultimates', 2002, 'Earth-1610'), 1, 13)),
      section('The Ultimates 2', 'Peak', 'Main Run', range(series('The Ultimates 2', 2005, 'Earth-1610'), 1, 13)),
      section('The Ultimates 3', 'Skip', 'Continuation', range(series('The Ultimates 3', 2008, 'Earth-1610'), 1, 5))
    ]
  });

  addItem({
    id: 'ultimate-fantastic-four', title: 'Ultimate Fantastic Four: Curated Route', priority: 'Recommended', writer: 'Brian Michael Bendis, Mark Millar, Warren Ellis and Mike Carey', years: '2004–2009',
    categories: ['Ultimate Universe', 'Fantastic Four', 'Maker'], roadmapIds: ['ultimate'], page: 'ultimate', order: 50,
    summary: 'A younger Fantastic Four creates the Maker and contributes heavily to the Ultimate cosmic storyline.',
    sections: [
      section('Foundation', 'Recommended', 'Main Run', range(series('Ultimate Fantastic Four', 2004, 'Earth-1610'), 1, 32)),
      section('Mike Carey continuation', 'Optional', 'Main Run', range(series('Ultimate Fantastic Four', 2004, 'Earth-1610'), 33, 57)),
      section('Ending', 'Skim', 'Main Run', range(series('Ultimate Fantastic Four', 2004, 'Earth-1610'), 58, 60))
    ]
  });

  addItem({
    id: 'ultimate-galactus-trilogy', title: 'Ultimate Galactus Trilogy', priority: 'Recommended', writer: 'Warren Ellis', years: '2004–2006',
    categories: ['Ultimate Universe', 'Cosmic'], roadmapIds: ['ultimate'], page: 'ultimate', order: 60,
    summary: 'Earth-1610’s heroes confront Gah Lak Tus through three connected minis.',
    sections: [
      section('Ultimate Nightmare', 'Recommended', 'Mini-series', range(series('Ultimate Nightmare', 2004, 'Earth-1610'), 1, 5)),
      section('Ultimate Secret', 'Recommended', 'Mini-series', range(series('Ultimate Secret', 2005, 'Earth-1610'), 1, 4)),
      section('Ultimate Extinction', 'Recommended', 'Mini-series', range(series('Ultimate Extinction', 2006, 'Earth-1610'), 1, 5))
    ]
  });

  addItem({
    id: 'ultimate-ultimatum', title: 'Ultimatum', priority: 'Skip', writer: 'Jeph Loeb', years: '2008–2009',
    categories: ['Ultimate Universe', 'Event'], roadmapIds: ['ultimate'], page: 'ultimate', order: 70, hiddenByDefault: true,
    summary: 'Historically important because it destroys much of the original line, but widely regarded as poor and needlessly cruel.',
    sections: [section('Main event', 'Skip', 'Core Chapter', range(series('Ultimatum', 2008, 'Earth-1610'), 1, 5))]
  });

  addItem({
    id: 'ultimate-hickman-ultimates', title: 'Ultimate Comics Ultimates by Jonathan Hickman', priority: 'Peak', writer: 'Jonathan Hickman', artists: ['Esad Ribić'], years: '2011–2012',
    categories: ['Ultimate Universe', 'Avengers', 'Maker'], roadmapIds: ['ultimate'], page: 'ultimate', order: 80,
    summary: 'Hickman rebuilds the Ultimate geopolitical world and turns Reed Richards into the Maker.',
    sections: [section('Complete Hickman run', 'Peak', 'Main Run', range(series('Ultimate Comics Ultimates', 2011, 'Earth-1610'), 1, 12))]
  });

  addItem({
    id: 'ultimate-cataclysm-end', title: 'Cataclysm and Ultimate End', priority: 'Recommended', writer: 'Brian Michael Bendis and others', years: '2013–2015',
    categories: ['Ultimate Universe', 'Event'], roadmapIds: ['ultimate'], page: 'ultimate', order: 90,
    summary: 'Galactus invades Earth-1610 before the universe reaches its Secret Wars conclusion.',
    sections: [
      section('Cataclysm main event', 'Recommended', 'Core Chapter', range(series('Cataclysm: The Ultimates Last Stand', 2013, 'Earth-1610'), 1, 5)),
      section('Ultimate End', 'Recommended', 'Core Chapter', range(series('Ultimate End', 2015, 'Earth-1610'), 1, 5))
    ]
  });

  addItem({
    id: 'ultimate-6160-foundation', title: 'Ultimate Universe (Earth-6160) Foundation', priority: 'Essential', writer: 'Jonathan Hickman', years: '2023',
    categories: ['Ultimate Universe', 'Maker'], roadmapIds: ['ultimate'], page: 'ultimate', order: 110,
    summary: 'The Maker reshapes a new universe before its heroes begin reclaiming their stolen destinies.',
    sections: [
      section('Ultimate Invasion', 'Essential', 'Prelude', range(series('Ultimate Invasion', 2023, 'Earth-6160'), 1, 4)),
      section('Ultimate Universe one-shot', 'Essential', 'Prelude', [oneShot('Ultimate Universe', 2023, 'Earth-6160')])
    ]
  });

  addItem({
    id: 'ultimate-spider-man-6160', title: 'Ultimate Spider-Man (Earth-6160)', priority: 'Peak', writer: 'Jonathan Hickman', artists: ['Marco Checchetto'], years: '2024–2025',
    categories: ['Ultimate Universe', 'Spider-Man'], roadmapIds: ['ultimate'], page: 'ultimate', order: 120,
    summary: 'An adult Peter Parker with a family becomes Spider-Man in a world where his destiny was stolen.',
    sections: [section('Complete series', 'Peak', 'Main Run', range(series('Ultimate Spider-Man', 2024, 'Earth-6160'), 1, 24))]
  });

  addItem({
    id: 'ultimate-black-panther-6160', title: 'Ultimate Black Panther', priority: 'Recommended', writer: 'Bryan Hill', artists: ['Stefano Caselli'], years: '2024–2025',
    categories: ['Ultimate Universe', 'Black Panther'], roadmapIds: ['ultimate'], page: 'ultimate', order: 130,
    summary: 'Wakanda resists Moon Knight’s expanding empire in the new Ultimate world.',
    sections: [section('Complete series', 'Recommended', 'Main Run', range(series('Ultimate Black Panther', 2024, 'Earth-6160'), 1, 24))]
  });

  addItem({
    id: 'ultimate-xmen-6160', title: 'Ultimate X-Men (Earth-6160)', priority: 'Peak', writer: 'Peach Momoko', artists: ['Peach Momoko'], years: '2024–2025',
    categories: ['Ultimate Universe', 'X-Men'], roadmapIds: ['ultimate'], page: 'ultimate', order: 140,
    summary: 'A Japanese horror-inflected mutant story that builds its own cast and mythology away from the traditional mansion.',
    sections: [section('Complete series', 'Peak', 'Main Run', range(series('Ultimate X-Men', 2024, 'Earth-6160'), 1, 24))]
  });

  addItem({
    id: 'ultimates-6160', title: 'The Ultimates (Earth-6160)', priority: 'Peak', writer: 'Deniz Camp', artists: ['Juan Frigeri'], years: '2024–2025',
    categories: ['Ultimate Universe', 'Avengers'], roadmapIds: ['ultimate'], page: 'ultimate', order: 150,
    summary: 'Tony Stark and Doom awaken stolen heroes and build a resistance against the Maker’s Council.',
    sections: [section('Complete series', 'Peak', 'Main Run', range(series('Ultimates', 2024, 'Earth-6160'), 1, 24))]
  });

  addItem({
    id: 'ultimate-wolverine-6160', title: 'Ultimate Wolverine', priority: 'Recommended', writer: 'Chris Condon', years: '2025–2026',
    categories: ['Ultimate Universe', 'Wolverine'], roadmapIds: ['ultimate'], page: 'ultimate', order: 160,
    summary: 'The Eurasian Republic deploys its own weaponised Wolverine in the final Ultimate year.',
    sections: [section('Complete announced run', 'Recommended', 'Main Run', range(series('Ultimate Wolverine', 2025, 'Earth-6160'), 1, 12))]
  });

  addItem({
    id: 'ultimate-endgame', title: 'Ultimate Endgame', priority: 'Current', writer: 'Deniz Camp and the Ultimate creators', years: '2025–2026',
    categories: ['Ultimate Universe', 'Event'], roadmapIds: ['ultimate'], page: 'ultimate', order: 170, current: true, auditStatus: 'Current',
    summary: 'The current Earth-6160 line converges for its planned finale.',
    sections: [
      section('Main event', 'Essential', 'Core Chapter', range(series('Ultimate Endgame', 2025, 'Earth-6160'), 1, 5)),
      section('Finale one-shot', 'Essential', 'Epilogue', [oneShot('Ultimate Universe: Finale', 2026, 'Earth-6160', { status: 'solicited' })])
    ]
  });

  /* =========================
     ELSEWORLDS AND CROSSOVERS PAGE
     ========================= */
  addItem({ id: 'elseworld-marvel-1602', title: 'Marvel 1602', priority: 'Peak', writer: 'Neil Gaiman', artists: ['Andy Kubert'], years: '2003–2004', categories: ['Elseworlds', 'Alternate Universe'], page: 'elseworlds', order: 10, summary: 'Marvel heroes emerge in the Elizabethan era as reality destabilises.', sections: [section('Complete series', 'Peak', 'Alternate Universe', range(series('Marvel 1602', 2003, 'Earth-311'), 1, 8))] });
  addItem({ id: 'elseworld-earth-x', title: 'Earth X', priority: 'Peak', writer: 'Jim Krueger and Alex Ross', artists: ['John Paul Leon'], years: '1999–2000', categories: ['Elseworlds', 'Alternate Universe', 'Cosmic'], page: 'elseworlds', order: 20, summary: 'A dense future mythology attempts to unify nearly every major Marvel concept.', sections: [section('Complete core', 'Peak', 'Alternate Universe', concat([issue(series('Earth X', 1999, 'Earth-9997'), 0)], range(series('Earth X', 1999, 'Earth-9997'), 1, 12), [issue(series('Earth X', 1999, 'Earth-9997'), 'X')]))] });
  addItem({ id: 'elseworld-spider-life-story', title: 'Spider-Man: Life Story', priority: 'Peak', writer: 'Chip Zdarsky', artists: ['Mark Bagley'], years: '2019–2021', categories: ['Elseworlds', 'Spider-Man'], page: 'elseworlds', order: 30, summary: 'Peter ages in real time from the 1960s through each major decade of Spider-Man history.', sections: [section('Complete series', 'Peak', 'Alternate Universe', concat(range(series('Spider-Man: Life Story', 2019, 'Earth-2447'), 1, 6), [issue(series('Spider-Man: Life Story', 2019, 'Earth-2447'), 'Annual 1')]))] });
  addItem({ id: 'elseworld-ff-life-story', title: 'Fantastic Four: Life Story', priority: 'Recommended', writer: 'Mark Russell', artists: ['Sean Izaakse'], years: '2021–2022', categories: ['Elseworlds', 'Fantastic Four'], page: 'elseworlds', order: 40, summary: 'The Fantastic Four age across decades while Galactus hangs over their lives.', sections: [section('Complete series', 'Recommended', 'Alternate Universe', range(series('Fantastic Four: Life Story', 2021, 'Alternate Earth'), 1, 6))] });
  addItem({ id: 'elseworld-last-avengers-story', title: 'The Last Avengers Story', priority: 'Peak', writer: 'Peter David', artists: ['Ariel Olivetti'], years: '1995–1996', categories: ['Elseworlds', 'Avengers'], page: 'elseworlds', order: 50, summary: 'An ageing Hank Pym gathers the last Avengers in a bleak future.', sections: [section('Complete mini-series', 'Peak', 'Alternate Universe', range(series('The Last Avengers Story', 1995, 'Alternate Earth'), 1, 2))] });
  addItem({ id: 'elseworld-ruins', title: 'Ruins', priority: 'Recommended', writer: 'Warren Ellis', artists: ['Cliff Nielsen'], years: '1995', categories: ['Elseworlds', 'Horror'], page: 'elseworlds', order: 60, summary: 'A nightmare universe where every Marvel miracle becomes a grotesque disaster.', sections: [section('Complete mini-series', 'Recommended', 'Alternate Universe', range(series('Ruins', 1995, 'Earth-9591'), 1, 2))] });
  addItem({ id: 'elseworld-xmen-grand-design', title: 'X-Men: Grand Design', priority: 'Recommended', writer: 'Ed Piskor', artists: ['Ed Piskor'], years: '2017–2019', categories: ['Elseworlds', 'X-Men', 'Retelling'], page: 'elseworlds', order: 70, summary: 'A compressed retelling of decades of X-Men history as one unified narrative.', sections: [section('Complete trilogy', 'Recommended', 'Retelling', concat(range(series('X-Men: Grand Design', 2017), 1, 2), range(series('X-Men: Grand Design - Second Genesis', 2018), 1, 2), range(series('X-Men: Grand Design - X-Tinction', 2019), 1, 2)))] });
  addItem({ id: 'elseworld-ff-grand-design', title: 'Fantastic Four: Grand Design', priority: 'Recommended', writer: 'Tom Scioli', artists: ['Tom Scioli'], years: '2019', categories: ['Elseworlds', 'Fantastic Four', 'Retelling'], page: 'elseworlds', order: 80, summary: 'A dense, stylised compression of the classic Fantastic Four mythos.', sections: [section('Complete series', 'Recommended', 'Retelling', range(series('Fantastic Four: Grand Design', 2019), 1, 2))] });

  addItem({ id: 'crossover-superman-spider-man', title: 'Superman vs. The Amazing Spider-Man', priority: 'Peak', writer: 'Gerry Conway', artists: ['Ross Andru'], years: '1976', categories: ['Crossover', 'Marvel/DC', 'Spider-Man'], page: 'elseworlds', order: 110, summary: 'The landmark first major Marvel/DC superhero crossover.', sections: [section('Treasury special', 'Peak', 'Intercompany Crossover', [oneShot('Superman vs. The Amazing Spider-Man', 1976, 'Marvel/DC')])] });
  addItem({ id: 'crossover-xmen-titans', title: 'The Uncanny X-Men and The New Teen Titans', priority: 'Peak', writer: 'Chris Claremont', artists: ['Walt Simonson'], years: '1982', categories: ['Crossover', 'Marvel/DC', 'X-Men', 'Titans'], page: 'elseworlds', order: 120, summary: 'Darkseid and Dark Phoenix bring Marvel and DC’s greatest young teams together.', sections: [section('One-shot', 'Peak', 'Intercompany Crossover', [oneShot('The Uncanny X-Men and The New Teen Titans', 1982, 'Marvel/DC')])] });
  addItem({ id: 'crossover-batman-hulk', title: 'Batman vs. The Incredible Hulk', priority: 'Recommended', writer: 'Len Wein', artists: ['José Luis García-López'], years: '1981', categories: ['Crossover', 'Marvel/DC', 'Batman', 'Hulk'], page: 'elseworlds', order: 130, summary: 'Batman and Hulk clash before joining forces against Joker and the Shaper of Worlds.', sections: [section('One-shot', 'Recommended', 'Intercompany Crossover', [oneShot('Batman vs. The Incredible Hulk', 1981, 'Marvel/DC')])] });
  addItem({ id: 'crossover-dc-vs-marvel', title: 'DC vs. Marvel and Amalgam', priority: 'Recommended', writer: 'Ron Marz and Peter David', years: '1996–1997', categories: ['Crossover', 'Marvel/DC', 'Amalgam'], page: 'elseworlds', order: 140, summary: 'The two universes collide, fight and temporarily merge into the Amalgam Universe.', sections: [
    section('DC vs. Marvel', 'Recommended', 'Intercompany Crossover', range(series('DC vs. Marvel', 1996, 'Marvel/DC'), 1, 4)),
    section('All Access', 'Recommended', 'Continuation', range(series('All Access', 1996, 'Marvel/DC'), 1, 4)),
    section('Unlimited Access', 'Recommended', 'Continuation', range(series('Unlimited Access', 1997, 'Marvel/DC'), 1, 4)),
    section('Amalgam wave one', 'Optional', 'Amalgam', [oneShot('Dark Claw', 1996, 'Amalgam'), oneShot('Spider-Boy', 1996, 'Amalgam'), oneShot('Super-Soldier', 1996, 'Amalgam'), oneShot('Bruce Wayne: Agent of S.H.I.E.L.D.', 1996, 'Amalgam'), oneShot('Amazon', 1996, 'Amalgam'), oneShot('Assassins', 1996, 'Amalgam'), oneShot('Doctor Strangefate', 1996, 'Amalgam'), oneShot('JLX', 1996, 'Amalgam'), oneShot('Legends of the Dark Claw', 1996, 'Amalgam'), oneShot('Magneto and the Magnetic Men', 1996, 'Amalgam'), oneShot('Speed Demon', 1996, 'Amalgam'), oneShot('X-Patrol', 1996, 'Amalgam')]),
    section('Amalgam wave two', 'Optional', 'Amalgam', [oneShot('Bat-Thing', 1997, 'Amalgam'), oneShot('Challengers of the Fantastic', 1997, 'Amalgam'), oneShot('Generation Hex', 1997, 'Amalgam'), oneShot('Iron Lantern', 1997, 'Amalgam'), oneShot('Lobo the Duck', 1997, 'Amalgam'), oneShot('The Magnetic Men Featuring Magneto', 1997, 'Amalgam'), oneShot('Spider-Boy Team-Up', 1997, 'Amalgam'), oneShot('Super-Soldier: Man of War', 1997, 'Amalgam'), oneShot('Thorion of the New Asgods', 1997, 'Amalgam'), oneShot('Exciting X-Patrol', 1997, 'Amalgam'), oneShot('Dark Claw Adventures', 1997, 'Amalgam'), oneShot('Junior Amazon', 1997, 'Amalgam')])
  ] });
  addItem({ id: 'crossover-jla-avengers', title: 'JLA/Avengers', priority: 'Peak', writer: 'Kurt Busiek', artists: ['George Pérez'], years: '2003–2004', categories: ['Crossover', 'Marvel/DC', 'Avengers', 'Justice League'], page: 'elseworlds', order: 150, summary: 'The definitive Marvel/DC team crossover, built around both universes’ histories and values.', sections: [section('Complete series', 'Peak', 'Intercompany Crossover', range(series('JLA/Avengers', 2003, 'Marvel/DC'), 1, 4))] });
  addItem({ id: 'crossover-green-lantern-silver-surfer', title: 'Green Lantern/Silver Surfer', priority: 'Recommended', writer: 'Ron Marz', artists: ['Darrell Banks'], years: '1995', categories: ['Crossover', 'Marvel/DC', 'Silver Surfer', 'Green Lantern'], page: 'elseworlds', order: 160, summary: 'Kyle Rayner and Silver Surfer face Parallax and Thanos in a cosmic crossover.', sections: [section('One-shot', 'Recommended', 'Intercompany Crossover', [oneShot('Green Lantern/Silver Surfer', 1995, 'Marvel/DC')])] });
  addItem({ id: 'crossover-superman-ff', title: 'Superman/Fantastic Four', priority: 'Recommended', writer: 'Dan Jurgens', artists: ['Dan Jurgens'], years: '1999', categories: ['Crossover', 'Marvel/DC', 'Fantastic Four', 'Superman'], page: 'elseworlds', order: 170, summary: 'Superman seeks the Fantastic Four’s help with Galactus and his Kryptonian legacy.', sections: [section('One-shot', 'Recommended', 'Intercompany Crossover', [oneShot('Superman/Fantastic Four', 1999, 'Marvel/DC')])] });
  addItem({ id: 'crossover-batman-captain-america', title: 'Batman/Captain America', priority: 'Peak', writer: 'John Byrne', artists: ['John Byrne'], years: '1996', categories: ['Crossover', 'Marvel/DC', 'Batman', 'Captain America'], page: 'elseworlds', order: 180, summary: 'A Golden Age-style meeting between Batman, Robin, Captain America and Bucky.', sections: [section('One-shot', 'Peak', 'Intercompany Crossover', [oneShot('Batman/Captain America', 1996, 'Marvel/DC')])] });
  addItem({ id: 'crossover-spawn-batman', title: 'Spawn/Batman Crossovers', priority: 'Recommended', writer: 'Frank Miller, Doug Moench and others', years: '1994–2022', categories: ['Crossover', 'Image/DC', 'Spawn', 'Batman'], page: 'elseworlds', order: 190, summary: 'The major Batman/Spawn meetings, kept here because Spawn is not a Marvel character.', sections: [section('Crossovers', 'Recommended', 'Intercompany Crossover', [oneShot('Spawn/Batman', 1994, 'Image/DC'), oneShot('Batman/Spawn: War Devil', 1994, 'Image/DC'), oneShot('Batman/Spawn', 2022, 'Image/DC')])] });

  ELSEWORLDS_GROUPS.push(
    { id: 'alternate-marvel', title: 'Alternate Marvel Worlds', filterTags: ['Alternate Universe', 'Retelling', 'MAX'] },
    { id: 'marvel-dc', title: 'Marvel/DC Crossovers', filterTags: ['Marvel/DC'] },
    { id: 'other-crossovers', title: 'Other Publisher Crossovers', filterTags: ['Image/DC', 'Crossover'] }
  );


  /* =========================
     ADDITIONAL EVENTS AND RECOMMENDED CHARACTERS
     ========================= */
  addEvent({
    id: 'event-messiah-war', title: 'Messiah War', phaseId: 'phase-5', priority: 'Recommended', writer: 'Duane Swierczynski and Craig Kyle/Chris Yost', years: '2009',
    categories: ['X-Men', 'Cable', 'X-Force'], roadmapIds: ['x-men', 'cable'], order: 565,
    summary: 'Cable and X-Force collide in the future over Hope, Stryfe and Apocalypse.',
    sections: [
      section('Opening', 'Essential', 'Prelude', [oneShot('X-Force/Cable: Messiah War Prologue', 2009)]),
      section('Cable chapters', 'Recommended', 'Core Chapter', range(series('Cable', 2008), 13, 15)),
      section('X-Force chapters', 'Recommended', 'Core Chapter', range(series('X-Force', 2008), 14, 16))
    ], prerequisites: ['event-messiah-complex']
  });

  addEvent({
    id: 'event-war-of-kings', title: 'War of Kings', phaseId: 'phase-5', priority: 'Recommended', writer: 'Dan Abnett and Andy Lanning', years: '2009',
    categories: ['Cosmic', 'Guardians of the Galaxy', 'Nova', 'X-Men'], roadmapIds: ['guardians', 'nova', 'cosmic'], order: 570,
    summary: 'The Shi’ar and Kree empires go to war while Vulcan, Black Bolt, Nova and the Guardians reshape the cosmic map.',
    sections: [
      section('Road to War of Kings', 'Recommended', 'Prelude', [oneShot('Secret Invasion: War of Kings', 2009), oneShot('War of Kings: Warriors', 2009)]),
      section('Main event', 'Recommended', 'Core Chapter', range(series('War of Kings', 2009), 1, 6)),
      section('Guardians chapters', 'Recommended', 'Tie-in', range(series('Guardians of the Galaxy', 2008), 13, 19)),
      section('Nova chapters', 'Recommended', 'Tie-in', range(series('Nova', 2007), 23, 28)),
      section('Ascension', 'Optional', 'Tie-in', range(series('War of Kings: Ascension', 2009), 1, 4)),
      section('Aftermath', 'Recommended', 'Epilogue', [oneShot('War of Kings: Who Will Rule?', 2009)])
    ]
  });

  addEvent({
    id: 'event-realm-of-kings', title: 'Realm of Kings', phaseId: 'phase-5', priority: 'Recommended', writer: 'Dan Abnett and Andy Lanning', years: '2009–2010',
    categories: ['Cosmic', 'Guardians of the Galaxy', 'Nova'], roadmapIds: ['guardians', 'nova', 'cosmic'], order: 592,
    summary: 'The Fault opens into the Cancerverse and pushes the cosmic line toward The Thanos Imperative.',
    sections: [
      section('Opening', 'Essential', 'Prelude', [oneShot('Realm of Kings', 2009)]),
      section('Guardians chapters', 'Recommended', 'Tie-in', range(series('Guardians of the Galaxy', 2008), 20, 25)),
      section('Nova chapters', 'Recommended', 'Tie-in', range(series('Nova', 2007), 29, 36)),
      section('Imperial Guard', 'Optional', 'Tie-in', range(series('Realm of Kings: Imperial Guard', 2009), 1, 5)),
      section('Inhumans', 'Optional', 'Tie-in', range(series('Realm of Kings: Inhumans', 2009), 1, 5)),
      section('Son of Hulk', 'Skip', 'Tie-in', range(series('Realm of Kings: Son of Hulk', 2010), 1, 4))
    ], prerequisites: ['event-war-of-kings']
  });

  addEvent({
    id: 'event-original-sin', title: 'Original Sin', phaseId: 'phase-6', priority: 'Optional', writer: 'Jason Aaron', years: '2014',
    categories: ['Avengers', 'Thor', 'Nick Fury'], roadmapIds: ['avengers', 'thor', 'howling-commandos'], order: 706,
    summary: 'The murder of the Watcher exposes hidden secrets across the Marvel Universe and leaves Thor unworthy.',
    sections: [
      section('Main event', 'Optional', 'Core Chapter', range(series('Original Sin', 2014), 0, 8)),
      section('Thor/Loki companion', 'Recommended', 'Tie-in', range(series('Original Sin: Thor and Loki', 2014), 1, 5)),
      section('Avengers chapters', 'Optional', 'Tie-in', range(series('Avengers', 2012), 29, 34))
    ]
  });

  addEvent({
    id: 'event-secret-empire', title: 'Secret Empire', phaseId: 'phase-7', priority: 'Skim', writer: 'Nick Spencer', years: '2017',
    categories: ['Captain America', 'Avengers', 'Champions'], roadmapIds: ['captain-america', 'avengers', 'champions'], order: 772,
    summary: 'A Hydra-altered Steve Rogers seizes control of the United States in a controversial event.',
    sections: [
      section('Main event', 'Skim', 'Core Chapter', concat([issue(series('Secret Empire', 2017), 0)], range(series('Secret Empire', 2017), 1, 10))),
      section('Captain America: Steve Rogers', 'Essential', 'Prerequisite', range(series('Captain America: Steve Rogers', 2016), 1, 19)),
      section('Sam Wilson chapters', 'Recommended', 'Character Tie-in', range(series('Captain America: Sam Wilson', 2015), 22, 25)),
      section('Omega', 'Recommended', 'Epilogue', [oneShot('Secret Empire Omega', 2017)])
    ]
  });

  addEvent({
    id: 'event-devils-reign', title: "Devil's Reign", phaseId: 'phase-8', priority: 'Essential', writer: 'Chip Zdarsky', years: '2021–2022',
    categories: ['Daredevil', 'Elektra', 'Spider-Man', 'Street Level'], roadmapIds: ['daredevil', 'elektra', 'spider-man'], order: 850,
    summary: 'Mayor Fisk outlaws superheroes in New York and turns the city’s institutions against them.',
    sections: [
      section('Main event', 'Essential', 'Core Chapter', range(series("Devil's Reign", 2021), 1, 6)),
      section('Daredevil lead-in', 'Essential', 'Prerequisite', range(series('Daredevil', 2019), 29, 36)),
      section('Woman Without Fear', 'Essential', 'Character Tie-in', range(series('Daredevil: Woman Without Fear', 2022), 1, 3)),
      section('Moon Knight special', 'Recommended', 'Tie-in', [oneShot("Devil's Reign: Moon Knight", 2022)]),
      section('Omega', 'Recommended', 'Epilogue', [oneShot("Devil's Reign: Omega", 2022)])
    ]
  });

  addEvent({
    id: 'event-maximum-carnage', title: 'Maximum Carnage', phaseId: 'phase-2', priority: 'Recommended', writer: 'Various', years: '1993',
    categories: ['Spider-Man', 'Venom', 'Carnage', 'Symbiotes'], roadmapIds: ['spider-man', 'venom'], order: 278,
    summary: 'Spider-Man and Venom lead a large street-level alliance against Carnage’s murderous family.',
    sections: [section('Complete fourteen-part crossover', 'Recommended', 'Core Chapter', [
      issue(series('Spider-Man Unlimited', 1993), 1), issue(series('Web of Spider-Man', 1985), 101), issue(amazing1963, 378), issue(series('Spider-Man', 1990), 35), issue(series('Spectacular Spider-Man', 1976), 201), issue(series('Web of Spider-Man', 1985), 102), issue(amazing1963, 379), issue(series('Spider-Man', 1990), 36), issue(series('Spectacular Spider-Man', 1976), 202), issue(series('Web of Spider-Man', 1985), 103), issue(amazing1963, 380), issue(series('Spider-Man', 1990), 37), issue(series('Spectacular Spider-Man', 1976), 203), issue(series('Spider-Man Unlimited', 1993), 2)
    ])]
  });

  addItem({
    id: 'illuminati-bendis', title: 'New Avengers: Illuminati', phaseId: 'phase-4', priority: 'Essential', writer: 'Brian Michael Bendis and Brian Reed', artists: ['Jim Cheung'], years: '2006–2008',
    categories: ['Illuminati', 'Avengers', 'Iron Man', 'Doctor Strange', 'Black Panther'], roadmapIds: ['illuminati', 'avengers', 'iron-man', 'doctor-strange', 'black-panther'], order: 465,
    summary: 'Marvel’s most powerful leaders reveal the secret decisions behind major modern events.',
    sections: [
      section('Original one-shot', 'Essential', 'Prelude', [oneShot('New Avengers: Illuminati', 2006)]),
      section('Five-issue mini-series', 'Essential', 'Main Run', range(series('New Avengers: Illuminati', 2007), 1, 5))
    ], prerequisites: ['event-world-war-hulk', 'event-secret-invasion']
  });

  addItem({
    id: 'miles-616-bendis', title: 'Miles Morales in Earth-616', phaseId: 'phase-7', priority: 'Essential', writer: 'Brian Michael Bendis', artists: ['Sara Pichelli'], years: '2016–2018',
    categories: ['Miles Morales', 'Spider-Man', 'Legacy Heroes'], roadmapIds: ['legacy-heroes', 'spider-man'], order: 756,
    summary: 'Miles establishes a life in the main Marvel Universe after Secret Wars.',
    sections: [section('Complete Bendis run', 'Essential', 'Main Run', concat(range(series('Spider-Man', 2016), 1, 21), range(series('Spider-Man', 2016), 234, 240)))]
  });

  addItem({
    id: 'miles-ahmed', title: 'Miles Morales: Spider-Man by Saladin Ahmed', phaseId: 'phase-7', priority: 'Recommended', writer: 'Saladin Ahmed', artists: ['Javier Garrón'], years: '2018–2022',
    categories: ['Miles Morales', 'Spider-Man', 'Legacy Heroes'], roadmapIds: ['legacy-heroes', 'spider-man'], order: 793,
    summary: 'Miles develops his own supporting cast, villains and family conflicts in Earth-616.',
    sections: [section('Complete run', 'Recommended', 'Main Run', range(series('Miles Morales: Spider-Man', 2018), 1, 42))]
  });

  addItem({
    id: 'miles-ziglar', title: 'Miles Morales: Spider-Man by Cody Ziglar', phaseId: 'phase-8', priority: 'Current', writer: 'Cody Ziglar', years: '2022–2026',
    categories: ['Miles Morales', 'Spider-Man', 'Legacy Heroes'], roadmapIds: ['legacy-heroes', 'spider-man'], order: 878, current: true, auditStatus: 'Current',
    summary: 'Miles’ current era expands his powers, sword training and conflict with new villains.',
    sections: [section('Published run', 'Recommended', 'Main Run', range(series('Miles Morales: Spider-Man', 2022, 'Earth-616', { status: 'ongoing' }), 1, 42))]
  });

  addItem({
    id: 'sentry-2023', title: 'Sentry (2023)', phaseId: 'phase-8', priority: 'Optional', writer: 'Jason Loo', years: '2023–2024',
    categories: ['Sentry', 'Legacy Heroes'], roadmapIds: ['sentry', 'legacy-heroes'], order: 889,
    summary: 'The Sentry’s power is distributed among new people after Bob Reynolds’ death.',
    sections: [section('Complete mini-series', 'Optional', 'Legacy Story', range(series('Sentry', 2023), 1, 4))]
  });

  addItem({
    id: 'captain-marvel-deconnick', title: 'Captain Marvel by Kelly Sue DeConnick', phaseId: 'phase-6', priority: 'Peak', writer: 'Kelly Sue DeConnick', artists: ['Dexter Soy', 'David López'], years: '2012–2015',
    categories: ['Captain Marvel', 'Legacy Heroes', 'Cosmic'], roadmapIds: ['legacy-heroes', 'cosmic'], order: 686,
    summary: 'Carol Danvers takes the Captain Marvel name and receives her defining modern identity.',
    sections: [
      section('First volume', 'Peak', 'Main Run', range(series('Captain Marvel', 2012), 1, 17)),
      section('Second volume', 'Recommended', 'Main Run', range(series('Captain Marvel', 2014), 1, 15))
    ]
  });

  addItem({
    id: 'ghost-rider-jason-aaron', title: 'Ghost Rider by Jason Aaron', phaseId: 'phase-5', priority: 'Peak', writer: 'Jason Aaron', artists: ['Roland Boschi', 'Tony Moore'], years: '2008–2009',
    categories: ['Ghost Rider', 'Magic', 'Horror'], roadmapIds: ['great-stories'], order: 576,
    summary: 'Johnny Blaze, Danny Ketch and the Spirits of Vengeance face angelic corruption and a war in Heaven.',
    sections: [section('Complete Aaron run', 'Peak', 'Main Run', range(series('Ghost Rider', 2006), 20, 35))]
  });

  addItem({
    id: 'deadpool-joe-kelly', title: 'Deadpool by Joe Kelly', phaseId: 'phase-2', priority: 'Peak', writer: 'Joe Kelly', artists: ['Ed McGuinness', 'Pete Woods'], years: '1997–1999',
    categories: ['Deadpool', 'Great Stories'], roadmapIds: ['great-stories'], order: 326,
    summary: 'The run that defines Deadpool’s humour, self-loathing, supporting cast and failed attempt at heroism.',
    sections: [section('Complete run', 'Peak', 'Main Run', range(series('Deadpool', 1997), 1, 33))]
  });

  addItem({
    id: 'cable-deadpool', title: 'Cable & Deadpool', phaseId: 'phase-4', priority: 'Recommended', writer: 'Fabian Nicieza', years: '2004–2008',
    categories: ['Cable', 'Deadpool', 'X-Men'], roadmapIds: ['cable', 'great-stories'], order: 438,
    summary: 'Cable’s idealism and Deadpool’s chaos produce an unexpectedly strong superhero friendship.',
    sections: [section('Complete series', 'Recommended', 'Main Run', range(series('Cable & Deadpool', 2004), 1, 50))]
  });

  addItem({
    id: 'inhumans-jenkins-lee', title: 'Inhumans by Jenkins and Lee', phaseId: 'phase-3', priority: 'Peak', writer: 'Paul Jenkins', artists: ['Jae Lee'], years: '1998–1999',
    categories: ['Inhumans', 'Great Stories'], roadmapIds: ['great-stories', 'cosmic'], order: 338,
    summary: 'A moody political tragedy about Attilan, Black Bolt, Maximus and the burden of isolation.',
    sections: [section('Complete series', 'Peak', 'Main Run', range(series('Inhumans', 1998), 1, 12))]
  });

  // Promote major crossover records that were originally entered as curated items.
  ['xmen-phalanx-covenant','xmen-onslaught','xmen-zero-tolerance','xmen-schism','spider-verse','black-panther-doomwar','daredevil-shadowland','venom-war','thanos-imperative','x-of-swords','sins-of-sinister','fall-of-x-core','age-of-ultron','ultimate-endgame'].forEach(id => {
    const item = ITEMS.find(entry => entry.id === id);
    if (item) {
      item.kind = 'event';
      item.role = 'Event';
      if (!EVENTS.includes(id)) EVENTS.push(id);
    }
  });

  /* =========================
     ROADMAP DEFINITIONS
     ========================= */
  [
    ['thor', 'Thor', 'From Simonson through the current Al Ewing era, with mythic peaks and selective bridges.'],
    ['hulk', 'Hulk', 'Peter David, Greg Pak, Immortal Hulk and the modern horror line.'],
    ['iron-man', 'Iron Man', 'The defining 80s material through Extremis, Fraction and current runs.'],
    ['fantastic-four', 'Fantastic Four', 'Byrne, Simonson, Waid, Hickman, Ryan North and the best connective material.'],
    ['spider-man', 'Spider-Man', 'Classic essentials, full JMS, selected Dan Slott, modern Spider-Man and symbiote links.'],
    ['x-men', 'X-Men', 'The full curated mutant spine from post-Days of Future Past through 2026.'],
    ['x-factor', 'X-Factor', 'Original five, Peter David government team, Investigations and Krakoa.'],
    ['wolverine', 'Wolverine', 'Claremont/Miller, Weapon X, Larry Hama, modern essentials and alternate futures.'],
    ['cyclops', 'Cyclops', 'Leadership, X-Factor, Morrison, Utopia, revolutionary Cyclops and current solo material.'],
    ['jean-grey', 'Jean Grey / Phoenix', 'Phoenix, X-Factor, Morrison, resurrection and modern cosmic Jean.'],
    ['rachel', 'Rachel Summers', 'Days of Future Past legacy, Claremont X-Men and Excalibur.'],
    ['cable', 'Cable / Nathan Summers', 'Askani mythology, X-Force, Messiah era and Krakoa.'],
    ['magik', 'Magik', 'Limbo origin, New Mutants, Inferno and modern sorcerer material.'],
    ['avengers', 'Avengers', 'Korvac, Stern, Busiek, Bendis, Hickman and the current MacKay/Armageddon road.'],
    ['illuminati', 'Illuminati', 'The secret council from Bendis through Hickman and Secret Wars.'],
    ['thunderbolts', 'Thunderbolts', 'Busiek/Nicieza, Warren Ellis and Jeff Parker: the strongest eras only.'],
    ['wanda-vision', 'Scarlet Witch and Vision', 'Marriage, children, collapse, redemption and the strongest solo runs.'],
    ['sentry', 'Sentry', 'The Paul Jenkins foundation, Avengers/Dark Reign role and later solo material.'],
    ['daredevil', 'Daredevil', 'Man Without Fear, Miller, Nocenti, Bendis, Brubaker, Waid, Soule and Zdarsky.'],
    ['elektra', 'Elektra', 'Miller classics, Assassin, modern solo work and Woman Without Fear.'],
    ['captain-america', 'Captain America', 'Waid, complete Brubaker-era material, Sam Wilson and current Armageddon setup.'],
    ['venom', 'Venom and Symbiotes', 'Eddie, Flash Thompson, Knull, Absolute Carnage, King in Black and 2026 events.'],
    ['doom', 'Doctor Doom', 'Doom-focused stories outside the main Fantastic Four route.'],
    ['thanos', 'Thanos and Infinity', 'Classic Starlin foundation, Infinity trilogy, modern Thanos and cosmic events.'],
    ['kang', 'Kang', 'Avengers Forever, Kang Dynasty, Iron Lad and selected modern Kang material.'],
    ['ultron', 'Ultron', 'Ultron Unlimited, Annihilation: Conquest, Rage of Ultron and historical events.'],
    ['guardians', 'Guardians of the Galaxy', 'Only the peak modern cosmic route: Conquest, DnA and Al Ewing.'],
    ['nova', 'Nova', 'Richard Rider’s definitive Annihilation-era journey and current continuation.'],
    ['silver-surfer', 'Silver Surfer', 'Requiem, Slott/Allred, Silver Surfer: Black and Infinity connections.'],
    ['cosmic', 'Cosmic and Reality-Level Marvel', 'Thanos, Nova, Guardians, Surfer, Blue Marvel, Eternals and reality-level events.'],
    ['doctor-strange', 'Doctor Strange', 'Roger Stern, Shamballa, The Oath, Aaron, Waid and Jed MacKay.'],
    ['blade', 'Blade', 'Modern solo starting points and supernatural events.'],
    ['defenders', 'Defenders', 'New Defenders, the classic-concept 2001 return and Al Ewing’s cosmic runs.'],
    ['black-panther', 'Black Panther', 'Late-80s foundations, Priest, Hudlin, Hickman and Coates.'],
    ['jessica-jones', 'Jessica Jones', 'Alias, The Pulse and the modern continuation.'],
    ['luke-cage', 'Luke Cage', 'Heroes for Hire, Jessica Jones connections and modern solo material.'],
    ['iron-fist', 'Iron Fist', 'Classic partnership and the definitive Immortal Iron Fist mythology.'],
    ['moon-knight', 'Moon Knight', 'Moench/Sienkiewicz, Ellis, Lemire and Jed MacKay.'],
    ['punisher', 'Punisher', 'Circle of Blood, Marvel Knights, MAX and selected modern material.'],
    ['howling-commandos', 'Howling Commandos and Nick Fury', 'Peak WWII stories, Steranko S.H.I.E.L.D. and mature Fury material.'],
    ['champions', 'Champions', 'The strongest modern young-hero team material.'],
    ['legacy-heroes', 'Legacy Heroes', 'Miles, Kamala, Laura, Sam Wilson, Jane Foster, Kate Bishop and others.'],
    ['great-stories', 'Great Marvel Stories', 'Standalone masterpieces and strong runs outside the main character lanes.'],
    ['ultimate', 'Ultimate Universe', 'Earth-1610 and Earth-6160 in separate, clean reading routes.']
  ].forEach(([id, title, description]) => addRoadmap({ id, title, description }));

  function validateCatalog() {
    const errors = [];
    const warnings = [];
    const itemIds = new Set();
    ITEMS.forEach(item => {
      if (itemIds.has(item.id)) errors.push(`Duplicate item id: ${item.id}`);
      itemIds.add(item.id);
      if (!item.sections.length) warnings.push(`No sections: ${item.id}`);
      item.sections.forEach(sec => {
        if (!sec.issueIds.length) warnings.push(`Empty section ${sec.label} in ${item.id}`);
        sec.issueIds.forEach(issueId => {
          if (!ISSUES[issueId]) errors.push(`Missing issue ${issueId} referenced by ${item.id}`);
        });
      });
      item.prerequisites.forEach(pre => {
        if (!ITEMS.some(candidate => candidate.id === pre)) warnings.push(`Unresolved prerequisite ${pre} in ${item.id}`);
      });
    });
    const duplicatedDisplays = {};
    Object.values(ISSUES).forEach(i => {
      duplicatedDisplays[i.displayTitle] = (duplicatedDisplays[i.displayTitle] || 0) + 1;
    });
    Object.entries(duplicatedDisplays).filter(([, count]) => count > 1).forEach(([label, count]) => warnings.push(`Display label appears ${count} times: ${label}`));
    return {
      errors,
      warnings,
      counts: {
        phases: PHASES.length,
        series: Object.keys(SERIES).length,
        issues: Object.keys(ISSUES).length,
        items: ITEMS.length,
        events: EVENTS.length,
        roadmaps: ROADMAPS.length
      }
    };
  }

  window.MARVEL_VAULT = {
    schemaVersion: 3,
    dataVersion: '2026.06.28-v3',
    phases: PHASES,
    series: SERIES,
    issues: ISSUES,
    items: ITEMS,
    events: EVENTS,
    roadmaps: ROADMAPS,
    elseworldsGroups: ELSEWORLDS_GROUPS,
    validation: validateCatalog()
  };
})();

const STORAGE_KEY = 'miclaseMarvelUniverseProgress.v1';
const THEME_KEY = 'miclaseMarvelUniverseTheme.v1';

const I = (series, ids) => ids.map(id => ({ key: `${series} ${id}`, label: `${series} ${id}` }));
const R = (series, start, end) => {
  const items = [];
  for (let n = start; n <= end; n += 1) items.push({ key: `${series} #${n}`, label: `${series} #${n}` });
  return items;
};
const M = (...groups) => groups.flat();

const phases = [
  {
    id: 'phase-1',
    name: 'Phase 1',
    title: 'Marvel foundation era',
    desc: 'Origins, early icons, and the first big pieces of the Marvel universe clicking into place.',
    blocks: [
      { title: 'Captain America historical debut', family: 'Captain America', note: 'Optional but useful. WWII symbol Cap begins here.', issues: I('Captain America Comics', ['#1']) },
      { title: 'Fantastic Four begins', family: 'Fantastic Four', note: 'The Marvel Age family engine starts.', issues: I('Fantastic Four', ['#1']) },
      { title: 'Hulk origin', family: 'Hulk', note: 'Gamma bomb, Bruce Banner, and the monster tragedy.', issues: I('Incredible Hulk', ['#1']) },
      { title: 'Thor origin and Loki foundation', family: 'Thor', note: 'Thor and Loki enter the Marvel board.', issues: I('Journey into Mystery', ['#83', '#85']) },
      { title: 'Spider-Man origin', family: 'Spider-Man', note: 'Peter Parker’s moral engine is born.', issues: I('Amazing Fantasy', ['#15']) },
      { title: 'Doctor Strange origin pack', family: 'Doctor Strange', note: 'Strange debuts, then gets his origin.', issues: I('Strange Tales', ['#110', '#115']) },
      { title: 'Avengers form and Cap returns', family: 'Avengers', note: 'The Avengers form, then Steve joins the modern era.', issues: I('Avengers', ['#1', '#4']) },
      { title: 'Spider-Man early rogues 1', family: 'Spider-Man', note: 'J. Jonah Jameson, Doc Ock, Sandman, Lizard, and early Peter stress.', issues: R('Amazing Spider-Man', 1, 6) },
      { title: 'Fantastic Four early villains', family: 'Fantastic Four', note: 'Namor returns, Doom debuts, then Doom and Namor team up.', issues: R('Fantastic Four', 4, 6) },
      { title: 'X-Men historical start', family: 'X-Men', note: 'First X-Men, Magneto, and the Brotherhood foundation.', issues: I('X-Men', ['#1', '#4']) },
      { title: 'Avengers roster identity', family: 'Avengers', note: 'Cap leads Hawkeye, Scarlet Witch, and Quicksilver. Avengers becomes a rotating institution.', issues: I('Avengers', ['#16']) },
      { title: 'Spider-Man early rogues 2', family: 'Spider-Man', note: 'Electro, Mysterio, Kraven, Green Goblin, and the Sinister Six.', issues: M(I('Amazing Spider-Man', ['#9', '#13', '#14', '#15']), I('Amazing Spider-Man Annual', ['#1'])) },
      { title: 'Doctor Strange: Dormammu, Clea, and Ditko magic 1', family: 'Doctor Strange', note: 'Dormammu, Clea, and the visual language of Marvel magic.', issues: R('Strange Tales', 126, 136) },
      { title: 'X-Men early myth sampler', family: 'X-Men', note: 'Juggernaut, Sentinels, and Xavier family baggage.', issues: R('X-Men', 12, 16) },
      { title: 'Thor early Asgard expansion', family: 'Thor', note: 'Enchantress, Executioner, Hercules, and Asgard drama.', issues: M(I('Journey into Mystery', ['#103', '#104', '#124', '#125']), R('Thor', 126, 130)) },
      { title: 'Fantastic Four world-building 1', family: 'Fantastic Four', note: 'Frightful Four, Medusa, and Inhumans build-up.', issues: R('Fantastic Four', 36, 43) },
      { title: 'Spider-Man: If This Be My Destiny…!', family: 'Spider-Man', note: 'One of the first truly great Peter Parker endurance stories.', issues: R('Amazing Spider-Man', 31, 33) },
      { title: 'Doctor Strange: Ditko magic 2', family: 'Doctor Strange', note: 'Eternity-era Strange. Reality folds paper cranes out of itself.', issues: R('Strange Tales', 137, 146) },
      { title: 'Fantastic Four world-building 2', family: 'Fantastic Four', note: 'Inhumans, Galactus Trilogy, This Man… This Monster!, and Black Panther.', issues: R('Fantastic Four', 44, 53) },
      { title: 'Spider-Man: Green Goblin Unmasked', family: 'Spider-Man', note: 'Norman becomes personal. Goblin stops being just another costume goblin.', issues: R('Amazing Spider-Man', 39, 40) },
      { title: 'Fantastic Four: Doom steals cosmic power', family: 'Fantastic Four', note: 'Classic Doom and Silver Surfer story.', issues: R('Fantastic Four', 57, 60) },
      { title: 'Avengers: Vision arrives', family: 'Avengers', note: 'Vision’s birth and Ultron’s emotional shadow.', issues: R('Avengers', 57, 58) },
      { title: 'Captain America compact origin retelling', family: 'Captain America', note: 'Clean classic Cap origin recap.', issues: I('Captain America', ['#109']) },
      { title: 'Thor: Mangog Saga', family: 'Thor', note: 'Asgard-scale mythic danger.', issues: R('Thor', 154, 157) },
      { title: 'Fantastic Four family milestone', family: 'Fantastic Four', note: 'Franklin Richards is born. Huge long-term importance.', issues: I('Fantastic Four Annual', ['#6']) },
      { title: 'Fantastic Four: Doom in Latveria', family: 'Fantastic Four', note: 'Doom as ruler, tyrant, myth, and theatre kid with nukes.', issues: R('Fantastic Four', 84, 87) },
      { title: 'Spider-Man: Spider-Man No More!', family: 'Spider-Man', note: 'Peter quits. Kingpin rises. Iconic Spider-Man identity crisis.', issues: R('Amazing Spider-Man', 50, 52) }
    ]
  },
  {
    id: 'phase-2',
    name: 'Phase 2',
    title: '1970s turning point era',
    desc: 'Marvel becomes more tragic, political, cosmic, and interconnected.',
    blocks: [
      { title: 'Avengers: Kree-Skrull War', family: 'Avengers', note: 'Event lock. First major cosmic Avengers saga.', issues: R('Avengers', 89, 97) },
      { title: 'Thanos: First Blood and Cosmic Cube', family: 'Thanos / Captain Marvel / Avengers', writer: 'Jim Starlin, Mike Friedrich, Steve Englehart', years: '1973-1974', tags: ['Essential', 'Cosmic'], note: 'Thanos enters Marvel through Iron Man, Captain Marvel, the Cosmic Cube, Avengers, and Daredevil side material. Read this to understand classic Thanos before the Gems become the whole game.', issues: M(I('Iron Man', ['#55']), R('Captain Marvel', 25, 33), I('Marvel Feature', ['#12']), I('Avengers', ['#125']), R('Daredevil', 105, 107)) },
      { title: 'Spider-Man: Death of Captain Stacy', family: 'Spider-Man', note: 'Peter and Gwen’s tragedy deepens.', issues: R('Amazing Spider-Man', 88, 90) },
      { title: 'Spider-Man: Green Goblin Reborn / drug issues', family: 'Spider-Man', note: 'Harry, Norman, drugs, and Comics Code history.', issues: R('Amazing Spider-Man', 96, 98) },
      { title: 'Defenders prelude', family: 'Defenders', note: 'Optional but useful Strange, Hulk, and Namor setup.', issues: R('Sub-Mariner', 34, 35) },
      { title: 'Doctor Strange Bronze Age revival 1', family: 'Doctor Strange', note: 'Strange becomes serious again as Sorcerer Supreme material.', issues: R('Marvel Premiere', 3, 8) },
      { title: 'Defenders begin', family: 'Defenders', note: 'The “non-team” starts. Strange, Hulk, Namor, and Surfer energy.', issues: R('Marvel Feature', 1, 3) },
      { title: 'Defenders early identity', family: 'Defenders', note: 'Weird cosmic and mystic outsider team.', issues: R('Defenders', 1, 6) },
      { title: 'Doctor Strange Bronze Age revival 2', family: 'Doctor Strange', note: 'Stronger mystic mythology.', issues: R('Marvel Premiere', 9, 14) },
      { title: 'Spider-Man: The Night Gwen Stacy Died', family: 'Spider-Man', note: 'Event lock. One of the defining Spider-Man tragedies.', issues: R('Amazing Spider-Man', 121, 122) },
      { title: 'Spider-Man: Punisher and Jackal debut', family: 'Spider-Man', note: 'Punisher arrives and Clone Saga seeds begin.', issues: I('Amazing Spider-Man', ['#129']) },
      { title: 'Avengers / Defenders War', family: 'Avengers / Defenders', note: 'Event lock. Official team vs weird non-team clash.', issues: M(R('Avengers', 115, 118), R('Defenders', 8, 11)) },
      { title: 'Captain America: Secret Empire', family: 'Captain America', note: 'Essential political Cap.', issues: R('Captain America and the Falcon', 169, 176) },
      { title: 'Captain America: Nomad aftermath', family: 'Captain America', note: 'Steve questions the symbol.', issues: R('Captain America and the Falcon', 177, 186) },
      { title: 'Spider-Man: Original Clone Saga', family: 'Spider-Man', note: 'Compact version before the 90s Clone Saga jungle grows teeth.', issues: R('Amazing Spider-Man', 143, 149) },
      { title: 'Fantastic Four: Thing vs Hulk', family: 'Fantastic Four / Hulk', note: 'Optional but excellent Ben Grimm and Hulk material.', issues: I('Fantastic Four', ['#112']) },
      { title: 'Captain America: Madbomb', family: 'Captain America', note: 'Kirby-era Cap weirdness and anti-authoritarian action.', issues: R('Captain America', 193, 200) },
      { title: 'X-Men: Second Genesis begins', family: 'X-Men', note: 'Definitive X-Men start. New team arrives.', issues: M(I('Giant-Size X-Men', ['#1']), R('Uncanny X-Men', 94, 100)) },
      { title: 'Avengers: Celestial Madonna Saga', family: 'Avengers / Vision & Scarlet Witch', writer: 'Steve Englehart', years: '1974-1975', tags: ['Essential', 'Vision/Wanda'], note: 'Kang, Mantis, Vision, Scarlet Witch, and the Vision/Wanda wedding foundation. Giant-Size Avengers #4 is the key issue for the couple.', issues: M(R('Avengers', 129, 135), R('Giant-Size Avengers', 2, 4)) },
      { title: 'Vision and Scarlet Witch: First House', family: 'Vision & Scarlet Witch / Avengers', writer: 'Bill Mantlo', years: '1982-1983', tags: ['Essential', 'Vision/Wanda'], note: 'The first dedicated Vision/Wanda mini. This gives their marriage a domestic/mystic identity outside the Avengers mansion.', issues: R('Vision and the Scarlet Witch vol. 1', 1, 4) },
      { title: 'X-Men: All-New team deepens', family: 'X-Men', note: 'Phoenix, space, Shi’ar, and team identity.', issues: R('Uncanny X-Men', 101, 108) },
      { title: 'Defenders: Steve Gerber part 1', family: 'Defenders', note: 'The Defenders become properly strange.', issues: M(I('Giant-Size Defenders', ['#3']), R('Defenders', 20, 25)) },
      { title: 'Spider-Man: Black Cat / Burglar return era', family: 'Spider-Man', note: 'Black Cat arrives and Peter confronts origin trauma.', issues: R('Amazing Spider-Man', 194, 200) },
      { title: 'Avengers: Korvac Saga', family: 'Avengers', note: 'Event lock. Cosmic Avengers classic.', issues: M(I('Thor Annual', ['#6']), R('Avengers', 167, 168), R('Avengers', 170, 177)) },
      { title: 'Thanos: Warlock and the Soul Gem finale', family: 'Thanos / Cosmic Marvel', writer: 'Jim Starlin', years: '1975-1977', tags: ['Essential', 'Cosmic'], note: 'Adam Warlock, Thanos, the Soul Gem, and the first major Thanos endgame. This is the older cosmic road that later feeds Infinity Gauntlet.', issues: M(R('Warlock', 9, 11), I('Warlock', ['#15']), I('Avengers Annual', ['#7']), I('Marvel Two-In-One Annual', ['#2'])) },
      { title: 'The Death of Captain Marvel', family: 'Captain Marvel / Thanos', writer: 'Jim Starlin', years: '1982', tags: ['Essential', 'Cosmic'], note: 'A quiet, important death story with Thanos in a symbolic role. Read after the first Thanos cycle.', issues: I('Marvel Graphic Novel', ['#1: The Death of Captain Marvel']) },
      { title: 'Defenders: Steve Gerber part 2', family: 'Defenders', note: 'Outsider-team chaos, satire, and mysticism.', issues: R('Defenders', 26, 33) },
      { title: 'Defenders: Steve Gerber part 3', family: 'Defenders', note: 'Finish the classic Gerber Defenders stretch.', issues: M(R('Defenders', 34, 41), I('Defenders Annual', ['#1']), R('Giant-Size Defenders', 4, 5)) }
    ]
  },
  {
    id: 'phase-3',
    name: 'Phase 3',
    title: 'Early 1980s: X-Men explodes and Daredevil becomes Daredevil',
    desc: 'The mutant cathedral rises while Matt Murdock walks into noir thunder.',
    blocks: [
      { title: 'X-Men: Proteus Saga', family: 'X-Men', note: 'Reality horror and team pressure.', issues: R('Uncanny X-Men', 125, 128) },
      { title: 'Daredevil: The Man Without Fear', family: 'Daredevil', note: 'Published later, but read here as Matt’s origin before Miller.', issues: R('Daredevil: The Man Without Fear', 1, 5) },
      { title: 'X-Men: Dark Phoenix Saga', family: 'X-Men', note: 'Event lock. Jean, Cyclops, Hellfire Club, and cosmic tragedy.', issues: R('Uncanny X-Men', 129, 138) },
      { title: 'Daredevil: Miller/Janson part 1', family: 'Daredevil', note: 'Kingpin gravity begins and Miller tone takes over.', issues: M(R('Daredevil', 158, 161), R('Daredevil', 163, 167)) },
      { title: 'X-Men: Days of Future Past', family: 'X-Men', note: 'Includes the classic future/Sentinel nightmare.', issues: R('Uncanny X-Men', 139, 142) },
      { title: 'Spider-Man: Nothing Can Stop the Juggernaut!', family: 'Spider-Man', note: 'Pure Peter Parker grit.', issues: R('Amazing Spider-Man', 229, 230) },
      { title: 'Fantastic Four: Byrne part 1', family: 'Fantastic Four', note: 'Byrne restores classic FF adventure.', issues: R('Fantastic Four', 232, 236) },
      { title: 'Daredevil: Elektra Saga part 1', family: 'Daredevil', note: 'Elektra, Matt, Kingpin, and Bullseye energy starts cooking.', issues: R('Daredevil', 168, 176) },
      { title: 'X-Men: God Loves, Man Kills', family: 'X-Men', note: 'One of the clearest “what X-Men means” stories.', issues: I('Marvel Graphic Novel', ['#5: X-Men: God Loves, Man Kills']) },
      { title: 'Fantastic Four: Byrne cosmic part', family: 'Fantastic Four', note: 'Galactus, Terrax, and Reed’s moral burden.', issues: R('Fantastic Four', 242, 244) },
      { title: 'Spider-Man: The Kid Who Collects Spider-Man', family: 'Spider-Man', note: 'Short emotional masterpiece.', issues: I('Amazing Spider-Man', ['#248']) },
      { title: 'Fantastic Four: Byrne full run bridge 1', family: 'Fantastic Four', writer: 'John Byrne', years: '1983-1984', tags: ['Full run'], note: 'Extra Byrne material so your FF reading is not only the essential arcs. Read this between the highlighted Byrne set-pieces.', issues: R('Fantastic Four', 245, 256) },
      { title: 'Daredevil: Elektra Saga part 2', family: 'Daredevil', note: 'Finish the Bullseye/Elektra core tragedy.', issues: R('Daredevil', 177, 182) },
      { title: 'X-Men: Brood Saga', family: 'X-Men', note: 'Slightly over 12, but read together as space horror.', issues: R('Uncanny X-Men', 154, 167) },
      { title: 'Spider-Man: Alien Costume Saga', family: 'Spider-Man', note: 'Black suit core version. Leads toward Venom.', issues: M(R('Amazing Spider-Man', 252, 259), I('Web of Spider-Man', ['#1'])) },
      { title: 'Daredevil: Miller finale', family: 'Daredevil', note: 'Includes “Roulette,” one of the great Bullseye and Matt stories.', issues: R('Daredevil', 183, 191) },
      { title: 'Fantastic Four: Trial of Reed Richards', family: 'Fantastic Four', writer: 'John Byrne', years: '1984', tags: ['Essential', 'Full run'], note: 'Reed is judged for saving Galactus. Essential Byrne/FF morality material.', issues: R('Fantastic Four', 257, 262) },
      { title: 'Fantastic Four: Byrne full run bridge 2', family: 'Fantastic Four', writer: 'John Byrne', years: '1984-1985', tags: ['Full run'], note: 'More of Byrne’s family/cosmic/social texture before the Sue-centered Malice arc.', issues: R('Fantastic Four', 263, 279) },
      { title: 'X-Men: From the Ashes', family: 'X-Men', note: 'Rogue joins, Kitty grows, Morlocks, and Madelyne.', issues: R('Uncanny X-Men', 168, 176) },
      { title: 'Doctor Strange: Montesi Formula', family: 'Doctor Strange', note: 'Strange vs vampire mythology.', issues: R('Doctor Strange vol. 2', 59, 62) },
      { title: 'Daredevil / Kingpin: Love and War', family: 'Daredevil', note: 'Optional, but excellent Kingpin psychology.', issues: I('Marvel Graphic Novel', ['#24: Daredevil: Love and War']) },
      { title: 'New Mutants: Demon Bear Saga', family: 'X-Men', note: 'Essential mutant-school horror.', issues: R('New Mutants', 18, 20) },
      { title: 'Spider-Man: Death of Jean DeWolff', family: 'Spider-Man / Daredevil', note: 'Daredevil guest, Peter’s rage, and moral line.', issues: R('Peter Parker, The Spectacular Spider-Man', 107, 110) },
      { title: 'Fantastic Four: Malice / Sue Storm', family: 'Fantastic Four', note: 'Major Sue development.', issues: R('Fantastic Four', 280, 284) },
      { title: 'Daredevil: Born Again', family: 'Daredevil', note: 'Event lock. Definitive Daredevil story.', issues: R('Daredevil', 227, 233) },
      { title: 'X-Men: LifeDeath / Storm', family: 'X-Men', note: 'Essential Storm character work.', issues: I('Uncanny X-Men', ['#186', '#198']) },
      { title: 'Fantastic Four / Jean Grey return', family: 'Fantastic Four / X-Men', note: 'Related X-Men/FF bridge. Optional unless you care about Jean and X-Factor.', issues: M(R('Fantastic Four', 285, 286), I('Avengers', ['#263']), I('X-Factor', ['#1'])) },
      { title: 'Fantastic Four: Byrne finale and annuals', family: 'Fantastic Four', writer: 'John Byrne', years: '1983-1986', tags: ['Full run'], note: 'The remaining late Byrne FF stretch plus annuals. This completes your intended John Byrne Fantastic Four run.', issues: M(R('Fantastic Four', 287, 295), R('Fantastic Four Annual', 17, 19)) },
      { title: 'Thor: Beta Ray Bill', family: 'Thor', note: 'Someone else is worthy. Perfect Thor entry point.', issues: R('Thor', 337, 340) },
      { title: 'Hulk: Peter David begins', family: 'Hulk', note: 'Gray Hulk and Joe Fixit era begins.', issues: R('Incredible Hulk', 331, 339) },
      { title: 'Thor: Surtur Saga', family: 'Thor', note: 'Event lock. Classic Simonson Thor epic.', issues: R('Thor', 341, 353) },
      { title: 'Hulk: Ground Zero / psychology', family: 'Hulk', note: 'Hulk vs Wolverine plus Banner/Hulk identity work.', issues: R('Incredible Hulk', 340, 346) },
      { title: 'Spider-Man: Kraven’s Last Hunt', family: 'Spider-Man', note: 'Event lock. Kraven’s masterpiece.', issues: M(I('Web of Spider-Man', ['#31']), I('Amazing Spider-Man', ['#293']), I('Peter Parker, The Spectacular Spider-Man', ['#131']), I('Web of Spider-Man', ['#32']), I('Amazing Spider-Man', ['#294']), I('Peter Parker, The Spectacular Spider-Man', ['#132'])) },
      { title: 'Doctor Strange + Doom: Triumph and Torment', family: 'Doctor Strange / Fantastic Four', note: 'Essential Strange and Doom.', issues: I('Doctor Strange and Doctor Doom: Triumph and Torment', ['GN']) },
      { title: 'Thor: Frog Thor', family: 'Thor', note: 'Weird, funny, mythic, somehow perfect.', issues: R('Thor', 364, 366) },
      { title: 'Avengers: Trial/Fall of Hank Pym', family: 'Avengers', note: 'Important Hank and Wasp material.', issues: M(I('Avengers', ['#212', '#213']), R('Avengers', 227, 230)) },
      { title: 'Vision and Scarlet Witch: A Year in the Life', family: 'Vision & Scarlet Witch / Avengers', writer: 'Steve Englehart', years: '1985-1986', tags: ['Essential', 'Vision/Wanda'], note: 'The major Vision/Wanda domestic era, including the birth of Billy and Tommy. This is one of the main roads into later Wanda/Vision tragedy.', issues: M(R('Vision and the Scarlet Witch vol. 2', 1, 12), I('West Coast Avengers', ['#2'])) },
      { title: 'Vision: Absolute Vision lead-up', family: 'Vision & Scarlet Witch / Avengers', writer: 'Roger Stern', years: '1985', tags: ['Vision/Wanda'], note: 'Vision tries to reshape the world through Avengers computer systems. This matters for how governments later treat him.', issues: R('Avengers', 253, 254) },
      { title: 'Spider-Man: Venom’s birth', family: 'Spider-Man', note: 'Eddie Brock/Venom becomes the big late-80s threat.', issues: M(R('Amazing Spider-Man', 298, 300), R('Amazing Spider-Man', 315, 317)) },
      { title: 'Avengers: Under Siege', family: 'Avengers', note: 'One of the best classic Avengers stories.', issues: R('Avengers', 270, 277) },
      { title: 'Defenders: Six-Fingered Hand', family: 'Defenders', note: 'Occult Defenders with Strange, Hulk, Hellcat, and Nighthawk.', issues: R('Defenders', 92, 100) }
    ]
  },
  {
    id: 'phase-4',
    name: 'Phase 4',
    title: 'Late 80s to 90s: mutant storms, cosmic teams, and 90s chaos',
    desc: 'X-Men becomes a publishing empire while Spider-Man, Avengers, FF, Hulk, Cap, and Daredevil move into their 90s shapes.',
    blocks: [
      { title: 'X-Men: Mutant Massacre', family: 'X-Men', note: 'Event lock. Morlocks, Marauders, and a darker mutant era.', issues: M(R('Uncanny X-Men', 210, 213), R('X-Factor', 9, 11), I('New Mutants', ['#46'])) },
      { title: 'Daredevil: Typhoid Mary', family: 'Daredevil', note: 'Matt’s weaknesses sharpen into knives.', issues: M(R('Daredevil', 254, 257), R('Daredevil', 259, 263)) },
      { title: 'X-Men: Fall of the Mutants', family: 'X-Men', note: 'Event lock. Three mutant teams, three ordeals.', issues: M(R('Uncanny X-Men', 225, 227), R('X-Factor', 24, 26), R('New Mutants', 59, 61)) },
      { title: 'X-Men: Inferno', family: 'X-Men', note: 'Event lock. Madelyne, Sinister, demons, and consequences.', issues: M(R('X-Terminators', 1, 4), R('Uncanny X-Men', 239, 243), R('X-Factor', 35, 39), R('New Mutants', 71, 73)) },
      { title: 'Fantastic Four: Simonson part 1', family: 'Fantastic Four', note: 'Time travel and big sci-fi FF.', issues: R('Fantastic Four', 334, 344) },
      { title: 'Spider-Man: Return of the Sinister Six', family: 'Spider-Man', note: 'Fun Doc Ock-led villain arc.', issues: R('Amazing Spider-Man', 334, 339) },
      { title: 'Fantastic Four: Simonson part 2', family: 'Fantastic Four', note: 'Finish Simonson FF.', issues: R('Fantastic Four', 345, 354) },
      { title: 'Captain America: Operation Rebirth', family: 'Captain America', note: 'Strong 90s Steve Rogers refresh.', issues: R('Captain America', 444, 448) },
      { title: 'X-Men: X-Tinction Agenda', family: 'X-Men', note: 'Event lock. Genosha becomes central.', issues: M(R('Uncanny X-Men', 270, 272), R('New Mutants', 95, 97), R('X-Factor', 60, 62)) },
      { title: 'Daredevil: Last Rites', family: 'Daredevil', note: 'Born Again echo. Matt vs Kingpin reversal.', issues: R('Daredevil', 297, 300) },
      { title: 'Hulk: Future Imperfect', family: 'Hulk', note: 'Maestro. Tiny, essential Hulk story.', issues: R('Hulk: Future Imperfect', 1, 2) },
      { title: 'X-Men: Muir Island Saga', family: 'X-Men', note: 'Claremont exit bridge into 90s X-Men.', issues: M(R('Uncanny X-Men', 278, 280), R('X-Factor', 69, 70)) },
      { title: 'Thanos: Rebirth and Thanos Quest', family: 'Thanos / Silver Surfer', writer: 'Jim Starlin', years: '1990', tags: ['Essential', 'Cosmic'], note: 'Thanos returns and gathers the Infinity Gems. This is the clean bridge into Infinity Gauntlet.', issues: M(R('Silver Surfer', 34, 38), R('Thanos Quest', 1, 2)) },
      { title: 'Infinity Gauntlet', family: 'Thanos / Avengers / Cosmic Marvel', writer: 'Jim Starlin', years: '1991', tags: ['Essential', 'Event', 'Cosmic'], note: 'Event lock. The definitive Thanos story and the core Infinity event.', issues: R('Infinity Gauntlet', 1, 6) },
      { title: 'X-Men: Mutant Genesis', family: 'X-Men', note: 'Jim Lee/Claremont, Magneto, Blue and Gold era.', issues: R('X-Men', 1, 3) },
      { title: 'Spider-Man: Maximum Carnage', family: 'Spider-Man', note: 'Event lock. Carnage/Venom chaos. Very 90s.', issues: M(I('Spider-Man Unlimited', ['#1']), I('Web of Spider-Man', ['#101']), I('Amazing Spider-Man', ['#378']), I('Spider-Man', ['#35']), I('Peter Parker, The Spectacular Spider-Man', ['#201']), I('Web of Spider-Man', ['#102']), I('Amazing Spider-Man', ['#379']), I('Spider-Man', ['#36']), I('Peter Parker, The Spectacular Spider-Man', ['#202']), I('Web of Spider-Man', ['#103']), I('Amazing Spider-Man', ['#380']), I('Spider-Man', ['#37']), I('Peter Parker, The Spectacular Spider-Man', ['#203']), I('Spider-Man Unlimited', ['#2'])) },
      { title: 'X-Men: X-Cutioner’s Song', family: 'X-Men', note: 'Event lock. Cable, Stryfe, Apocalypse, and Summers mythology.', issues: M(R('Uncanny X-Men', 294, 297), R('X-Factor', 84, 86), R('X-Men', 14, 16), R('X-Force', 16, 19)) },
      { title: 'Daredevil: Guardian Devil', family: 'Daredevil', note: 'Marvel Knights reset. Big status-quo damage.', issues: M(R('Daredevil vol. 2', 1, 8), I('Daredevil vol. 2', ['#1/2'])) },
      { title: 'X-Men: Fatal Attractions', family: 'X-Men', note: 'Event lock. Magneto, Xavier, and Wolverine.', issues: M(I('X-Factor', ['#92']), I('X-Force', ['#25']), I('Uncanny X-Men', ['#304']), I('X-Men', ['#25']), I('Wolverine', ['#75']), I('Excalibur', ['#71'])) },
      { title: 'Infinity War and Infinity Crusade core', family: 'Thanos / Cosmic Marvel', writer: 'Jim Starlin', years: '1992-1993', tags: ['Cosmic', 'Optional'], note: 'Optional after Infinity Gauntlet. These are big cosmic sequels, useful if you want the full Starlin Infinity trilogy.', issues: M(R('Infinity War', 1, 6), R('Infinity Crusade', 1, 6)) },
      { title: 'Daredevil: Parts of a Hole', family: 'Daredevil', note: 'Echo/Maya Lopez enters.', issues: R('Daredevil vol. 2', 9, 15) },
      { title: 'Spider-Man: selective Clone Saga', family: 'Spider-Man', note: 'Keep it selective. Do not let the Clone Saga build a nest in your brain.', issues: M(R('Web of Spider-Man', 117, 119), R('Amazing Spider-Man', 394, 396), R('Spider-Man', 51, 53), R('Peter Parker, The Spectacular Spider-Man', 217, 219), I('Spider-Man Unlimited', ['#7'])) },
      { title: 'X-Men: Age of Apocalypse', family: 'X-Men', note: 'Event lock. Great alternate timeline. This uses the main collected core.', issues: M(I('X-Men: Alpha', ['#1']), R('Astonishing X-Men', 1, 4), R('Amazing X-Men', 1, 4), R('Gambit and the X-Ternals', 1, 4), R('Generation Next', 1, 4), R('Weapon X', 1, 4), R('Factor X', 1, 4), R('X-Calibre', 1, 4), R('X-Man', 1, 4), R('X-Universe', 1, 2), I('X-Men: Omega', ['#1'])) },
      { title: 'Daredevil: Yellow', family: 'Daredevil', note: 'Emotional early-years Matt story.', issues: R('Daredevil: Yellow', 1, 6) },
      { title: 'Avengers Forever', family: 'Avengers', note: 'Kang, Immortus, and time-travel Avengers history.', issues: R('Avengers Forever', 1, 12) },
      { title: 'X-Men: Onslaught lean core', family: 'X-Men / Avengers / Fantastic Four', note: 'Optional. This is a lean exact core, not the full massive checklist.', issues: M(R('X-Men', 53, 57), R('Uncanny X-Men', 334, 337), I('Onslaught: X-Men', ['#1']), R('Cable', 34, 36), I('X-Force', ['#57']), I('Onslaught: Marvel Universe', ['#1'])) },
      { title: 'Avengers: Busiek/Pérez relaunch', family: 'Avengers', note: 'Clean modern classic Avengers energy.', issues: R('Avengers vol. 3', 1, 11) },
      { title: 'X-Men: Operation Zero Tolerance', family: 'X-Men', note: 'Optional, but good anti-mutant militarization arc.', issues: M(R('X-Men', 65, 70), I('Uncanny X-Men', ['#346']), I('Wolverine', ['#115']), R('Cable', 45, 47), R('X-Force', 68, 70), R('Generation X', 27, 31)) },
      { title: 'Avengers: Ultron Unlimited', family: 'Avengers', note: 'One of the best Ultron stories.', issues: M(I('Avengers vol. 3', ['#0']), R('Avengers vol. 3', 19, 22)) },
      { title: 'X-Men: Eve of Destruction', family: 'X-Men', note: 'Final bridge before Morrison.', issues: M(R('X-Men', 111, 113), R('Uncanny X-Men', 392, 393)) },
      { title: 'Avengers: Kang Dynasty', family: 'Avengers', note: 'Event lock. Kang’s biggest Avengers war.', issues: M(R('Avengers vol. 3', 41, 55), I('Avengers Annual 2001', ['#1'])) }
    ]
  },
  {
    id: 'phase-5',
    name: 'Phase 5',
    title: 'Early 2000s modern Marvel begins',
    desc: 'The books start feeling closer to modern Marvel: Morrison X-Men, Waid FF, Bendis Daredevil, Brubaker Cap, and New Avengers.',
    blocks: [
      { title: 'Ultimate Spider-Man origin', family: 'Spider-Man', note: 'Alternate universe, but one of the best modern Peter starts.', issues: R('Ultimate Spider-Man', 1, 7) },
      { title: 'New X-Men part 1', family: 'X-Men', note: 'Morrison begins. Cassandra Nova, Genosha, mutant culture.', issues: R('New X-Men', 114, 121) },
      { title: 'Spider-Man: Blue', family: 'Spider-Man', note: 'Emotional Gwen, MJ, and Peter reflection.', issues: R('Spider-Man: Blue', 1, 6) },
      { title: 'New X-Men part 2', family: 'X-Men', note: 'Emma, school expansion, and mutant future-fever.', issues: M(I('New X-Men Annual 2001', ['#1']), R('New X-Men', 122, 133)) },
      { title: 'Doctor Strange: Into Shamballa', family: 'Doctor Strange', note: 'Optional but spiritually strong Strange story.', issues: I('Doctor Strange: Into Shamballa', ['GN']) },
      { title: 'Daredevil: Wake Up', family: 'Daredevil', note: 'Ben Urich-focused Bendis/Maleev tone-setter.', issues: R('Daredevil vol. 2', 16, 19) },
      { title: 'New X-Men part 3', family: 'X-Men', note: 'Riot at Xavier’s, Fantomex, Weapon Plus.', issues: R('New X-Men', 134, 145) },
      { title: 'Fantastic Four: 1234', family: 'Fantastic Four', note: 'Optional dark Morrison/Jae Lee FF take.', issues: R('Fantastic Four: 1234', 1, 4) },
      { title: 'Daredevil: Bendis/Maleev part 1: Underboss', family: 'Daredevil', note: 'Crime-noir Daredevil begins properly.', issues: R('Daredevil vol. 2', 26, 31) },
      { title: 'New X-Men part 4', family: 'X-Men', note: 'Finish Morrison. Big modern X-Men reset.', issues: R('New X-Men', 146, 154) },
      { title: 'Daredevil: Bendis/Maleev part 2: Out', family: 'Daredevil', note: 'Matt’s identity pressure explodes.', issues: R('Daredevil vol. 2', 32, 40) },
      { title: 'Fantastic Four: Waid/Wieringo part 1', family: 'Fantastic Four', note: 'Modern FF begins. Fun, bright, then Doom sharpens the room.', issues: R('Fantastic Four vol. 3', 60, 70) },
      { title: 'Daredevil: Bendis/Maleev part 3: Lowlife / Hardcore', family: 'Daredevil', note: 'Kingpin, Matt, power, law, and crime.', issues: R('Daredevil vol. 2', 41, 50) },
      { title: 'Fantastic Four: Waid part 2: Unthinkable fallout', family: 'Fantastic Four', note: 'Essential modern Doom and its aftermath.', issues: R('Fantastic Four', 500, 508) },
      { title: 'Captain America: Truth', family: 'Captain America', note: 'Isaiah Bradley and Super-Soldier legacy.', issues: R('Truth: Red, White & Black', 1, 7) },
      { title: 'Fantastic Four: Waid part 3', family: 'Fantastic Four', note: 'Hereafter and family/sci-fi heart.', issues: R('Fantastic Four', 509, 516) },
      { title: 'Daredevil: Bendis/Maleev part 4', family: 'Daredevil', note: 'King of Hell’s Kitchen era begins.', issues: R('Daredevil vol. 2', 56, 65) },
      { title: 'Fantastic Four: Waid part 4', family: 'Fantastic Four', note: 'Finish Waid/Wieringo.', issues: R('Fantastic Four', 517, 524) },
      { title: 'Astonishing X-Men part 1', family: 'X-Men', note: 'Clean team book after Morrison.', issues: R('Astonishing X-Men', 1, 12) },
      { title: 'Daredevil: Bendis/Maleev part 5', family: 'Daredevil', note: 'Matt’s life keeps tightening.', issues: R('Daredevil vol. 2', 66, 75) },
      { title: 'Doctor Strange: The Oath', family: 'Doctor Strange', note: 'Best short modern Strange.', issues: R('Doctor Strange: The Oath', 1, 5) },
      { title: 'Thanos 2003 solo run', family: 'Thanos / Cosmic Marvel', writer: 'Jim Starlin and Keith Giffen', years: '2003-2004', tags: ['Essential', 'Cosmic'], note: 'A modern Thanos solo stretch that bridges classic Starlin Thanos and later cosmic Marvel.', issues: R('Thanos 2003', 1, 12) },
      { title: 'Astonishing X-Men part 2', family: 'X-Men', note: 'Finish Whedon/Cassaday.', issues: M(R('Astonishing X-Men', 13, 24), I('Giant-Size Astonishing X-Men', ['#1'])) },
      { title: 'Daredevil: The Murdock Papers', family: 'Daredevil', note: 'Bendis finale.', issues: R('Daredevil vol. 2', 76, 81) },
      { title: 'House of M', family: 'X-Men / Avengers', note: 'Event lock. Mutant status quo bomb.', issues: R('House of M', 1, 8) },
      { title: 'Captain America: Winter Soldier part 1', family: 'Captain America', note: 'Brubaker Cap begins. Bucky shadow returns.', issues: R('Captain America 2004', 1, 7) },
      { title: 'Decimation aftermath', family: 'X-Men', note: 'Mutant survival era begins.', issues: M(I('House of M: The Day After', ['#1']), R('X-Men', 177, 181), R('The 198', 1, 5)) },
      { title: 'Captain America: Winter Soldier part 2', family: 'Captain America', note: 'Finish Winter Soldier core.', issues: M(R('Captain America 2004', 8, 9), R('Captain America 2004', 11, 14)) },
      { title: 'Avengers Disassembled', family: 'Avengers', note: 'Event lock. Old Avengers order collapses.', issues: M(R('Avengers', 500, 503), I('Avengers Finale', ['#1'])) },
      { title: 'New Avengers: Breakout', family: 'Avengers', note: 'Modern Avengers street/cosmic hybrid begins.', issues: R('New Avengers', 1, 6) },
      { title: 'Daredevil: Brubaker/Lark part 1', family: 'Daredevil', note: 'Direct Bendis fallout. Prison/noir Matt.', issues: R('Daredevil vol. 2', 82, 93) },
      { title: 'Hulk: Gray', family: 'Hulk', note: 'Emotional Hulk/Betty retelling.', issues: R('Hulk: Gray', 1, 6) },
      { title: 'New Avengers: Illuminati', family: 'Avengers', note: 'Essential for World War Hulk and Hickman later.', issues: M(I('New Avengers: Illuminati', ['One-Shot']), R('New Avengers: Illuminati', 1, 5)) },
      { title: 'Daredevil: Brubaker/Lark part 2', family: 'Daredevil', note: 'Mr. Fear, fallout, identity wreckage.', issues: R('Daredevil vol. 2', 94, 105) }
    ]
  },
  {
    id: 'phase-6',
    name: 'Phase 6',
    title: 'Civil War to Siege',
    desc: 'Events start knocking dominoes into each other: Civil War, Planet Hulk, World War Hulk, Secret Invasion, Dark Reign, and Siege.',
    blocks: [
      { title: 'Spider-Man: Civil War road', family: 'Spider-Man', note: 'Peter’s public identity era.', issues: R('Amazing Spider-Man', 529, 538) },
      { title: 'Civil War main event', family: 'Avengers', note: 'Event lock. Cap vs Iron Man ideological split.', issues: R('Civil War', 1, 7) },
      { title: 'Civil War related fallout', family: 'Avengers / Captain America / Fantastic Four', note: 'Read after Civil War. Shows team fractures.', issues: M(R('New Avengers', 21, 25), R('Captain America 2004', 22, 24), R('Fantastic Four', 538, 543)) },
      { title: 'Spider-Man: Back in Black', family: 'Spider-Man', note: 'Dark Peter, Kingpin, and rage.', issues: R('Amazing Spider-Man', 539, 543) },
      { title: 'Daredevil: Brubaker/Lark part 3', family: 'Daredevil', note: 'Finish Brubaker.', issues: M(R('Daredevil vol. 2', 106, 119), I('Daredevil', ['#500'])) },
      { title: 'Captain America: Death of Captain America part 1', family: 'Captain America', note: 'After Civil War. Cap legacy era begins.', issues: R('Captain America 2004', 25, 30) },
      { title: 'Planet Hulk', family: 'Hulk', note: 'Event lock. Hulk becomes gladiator and king.', issues: M(R('Incredible Hulk', 92, 105), I('Giant-Size Hulk', ['#1'])) },
      { title: 'Captain America: Death of Captain America part 2', family: 'Captain America', note: 'Bucky, Falcon, Sharon, and Red Skull fallout.', issues: R('Captain America 2004', 31, 36) },
      { title: 'World War Hulk', family: 'Hulk / Avengers', note: 'Event lock. Read after Planet Hulk.', issues: M(I('World War Hulk Prologue: World Breaker', ['#1']), R('Incredible Hulk', 106, 111), R('World War Hulk', 1, 5)) },
      { title: 'Captain America: Death of Captain America part 3', family: 'Captain America', note: 'Finish the core Brubaker death era.', issues: R('Captain America 2004', 37, 42) },
      { title: 'Spider-Man: One More Day', family: 'Spider-Man', note: 'Historically essential, emotionally radioactive.', issues: M(R('Amazing Spider-Man', 544, 545), I('Friendly Neighborhood Spider-Man', ['#24']), I('Sensational Spider-Man vol. 2', ['#41'])) },
      { title: 'Spider-Man: Brand New Day opening', family: 'Spider-Man', note: 'New status quo. Split mentally into smaller batches if needed.', issues: R('Amazing Spider-Man', 546, 564) },
      { title: 'Fantastic Four: McDuffie / New FF', family: 'Fantastic Four', note: 'Storm and Black Panther join the family road trip.', issues: R('Fantastic Four', 544, 550) },
      { title: 'Thor: JMS rebirth part 1', family: 'Thor', note: 'Thor and Asgard return in the modern world.', issues: R('Thor 2007', 1, 12) },
      { title: 'Spider-Man: New Ways to Die', family: 'Spider-Man', note: 'Norman, Thunderbolts, Anti-Venom, and Mister Negative.', issues: R('Amazing Spider-Man', 568, 573) },
      { title: 'Fantastic Four: Millar/Hitch part 1', family: 'Fantastic Four', note: 'Blockbuster pre-Hickman FF.', issues: R('Fantastic Four', 554, 561) },
      { title: 'Secret Invasion', family: 'Avengers', note: 'Event lock. Skrulls, paranoia, and Osborn rises.', issues: R('Secret Invasion', 1, 8) },
      { title: 'Fantastic Four: Millar/Hitch part 2', family: 'Fantastic Four', note: 'Finish Millar/Hitch.', issues: R('Fantastic Four', 562, 569) },
      { title: 'Dark Avengers', family: 'Avengers', note: 'Norman Osborn’s fake Avengers era.', issues: R('Dark Avengers', 1, 6) },
      { title: 'Spider-Man: American Son', family: 'Spider-Man', note: 'Norman, Harry, and Peter Dark Reign material.', issues: R('Amazing Spider-Man', 595, 599) },
      { title: 'Thor: JMS finale', family: 'Thor', note: 'Finish JMS Thor.', issues: M(R('Thor', 600, 603), I('Thor Giant-Size Finale', ['#1'])) },
      { title: 'Captain America: Reborn', family: 'Captain America', note: 'Resolves Steve’s post-death status.', issues: R('Captain America: Reborn', 1, 6) },
      { title: 'Daredevil: Shadowland/Reborn bridge', family: 'Daredevil', note: 'Not top-tier, but it bridges into Waid.', issues: M(R('Shadowland', 1, 5), R('Daredevil', 508, 512), R('Daredevil: Reborn', 1, 4)) },
      { title: 'Siege', family: 'Avengers / Thor', note: 'Event lock. Norman attacks Asgard.', issues: M(R('Siege', 1, 4), R('Thor', 607, 610)) },
      { title: 'Thanos Imperative', family: 'Thanos / Cosmic Marvel', writer: 'Dan Abnett and Andy Lanning', years: '2010', tags: ['Essential', 'Cosmic', 'Event'], note: 'Event lock. The Annihilation-era cosmic line crashes into Thanos and the Cancerverse.', issues: M(I('The Thanos Imperative: Ignition', ['#1']), R('The Thanos Imperative', 1, 6), I('The Thanos Imperative: Devastation', ['#1'])) }
    ]
  },
  {
    id: 'phase-7',
    name: 'Phase 7',
    title: 'Hickman, modern X-Men, Waid Daredevil, and Secret Wars build',
    desc: 'Cyclops leads survival-era mutants, Hickman turns FF into future machinery, Waid brightens Daredevil, and Avengers vs X-Men changes the board.',
    blocks: [
      { title: 'Hickman FF prologue', family: 'Fantastic Four', note: 'Reed starts thinking on a bigger scale.', issues: R('Dark Reign: Fantastic Four', 1, 5) },
      { title: 'X-Men: Messiah Complex', family: 'X-Men', note: 'Event lock. Hope Summers arrives.', issues: M(I('X-Men: Messiah Complex', ['#1']), R('Uncanny X-Men', 492, 494), R('X-Factor', 25, 27), R('New X-Men', 44, 46), R('X-Men', 205, 207)) },
      { title: 'Hickman FF: Solve Everything', family: 'Fantastic Four', note: 'Council of Reeds, big science, big doom-clouds.', issues: R('Fantastic Four', 570, 578) },
      { title: 'X-Force by Kyle/Yost part 1', family: 'X-Men', note: 'Mutant black-ops survival.', issues: R('X-Force', 1, 14) },
      { title: 'Daredevil by Waid part 1', family: 'Daredevil', note: 'Bright surface, deep damage. Great tonal reset.', issues: R('Daredevil vol. 3', 1, 12) },
      { title: 'Hickman FF: Three', family: 'Fantastic Four', note: 'Emotional breaking point.', issues: R('Fantastic Four', 579, 588) },
      { title: 'X-Force by Kyle/Yost part 2', family: 'X-Men', note: 'Builds toward Second Coming without duplicating the Second Coming chapters.', issues: R('X-Force', 15, 25) },
      { title: 'Future Foundation begins', family: 'Fantastic Four', note: 'Spider-Man joins and the Future Foundation concept takes over.', issues: R('FF 2011', 1, 11) },
      { title: 'X-Men: Utopia', family: 'X-Men', note: 'Cyclops becomes mutant wartime leader.', issues: M(I('Dark Avengers/Uncanny X-Men: Utopia', ['#1']), R('Uncanny X-Men', 513, 514), R('Dark Avengers', 7, 8), I('Dark Avengers/Uncanny X-Men: Exodus', ['#1'])) },
      { title: 'Daredevil by Waid part 2', family: 'Daredevil', note: 'Matt’s “I’m fine” mask starts cracking.', issues: R('Daredevil vol. 3', 13, 24) },
      { title: 'X-Men: Second Coming', family: 'X-Men', note: 'Event lock. Hope trilogy climax.', issues: M(R('X-Men: Second Coming', 1, 2), R('Uncanny X-Men', 523, 525), R('New Mutants', 12, 14), R('X-Men Legacy', 235, 237), R('X-Force', 26, 28)) },
      { title: 'Hickman FF second half 1', family: 'Fantastic Four', note: 'Read alternating Fantastic Four and FF.', issues: M(I('Fantastic Four', ['#600']), I('FF 2011', ['#12']), I('Fantastic Four', ['#601']), I('FF 2011', ['#13']), I('Fantastic Four', ['#602']), I('FF 2011', ['#14']), I('Fantastic Four', ['#603']), I('FF 2011', ['#15'])) },
      { title: 'Uncanny X-Force part 1', family: 'X-Men', note: 'Remender’s dark mutant masterpiece begins.', issues: R('Uncanny X-Force', 1, 9) },
      { title: 'Hickman FF second half 2', family: 'Fantastic Four', note: 'Continue alternating where needed.', issues: M(I('Fantastic Four', ['#604']), I('FF 2011', ['#16']), I('Fantastic Four', ['#605', '#605.1', '#606']), R('FF 2011', 17, 18), R('Fantastic Four', 607, 608)) },
      { title: 'Uncanny X-Force: Dark Angel Saga', family: 'X-Men', note: 'Event-ish arc. Read together.', issues: R('Uncanny X-Force', 10, 18) },
      { title: 'Thor: The God Butcher / Godbomb', family: 'Thor', note: 'Modern Thor essential. Gorr, young Thor, present Thor, old King Thor.', issues: R('Thor: God of Thunder', 1, 11) },
      { title: 'Hickman FF finale', family: 'Fantastic Four', note: 'Finish Hickman FF.', issues: M(R('FF 2011', 19, 21), R('Fantastic Four', 609, 610), I('FF 2011', ['#22']), I('Fantastic Four', ['#611']), I('FF 2011', ['#23'])) },
      { title: 'Uncanny X-Force part 3', family: 'X-Men', note: 'Final Remender stretch.', issues: R('Uncanny X-Force', 19, 35) },
      { title: 'Daredevil by Waid part 3', family: 'Daredevil', note: 'Finish Waid volume 3.', issues: R('Daredevil vol. 3', 25, 36) },
      { title: 'X-Men: Schism', family: 'X-Men', note: 'Event lock. Cyclops/Wolverine ideological split.', issues: M(R('X-Men: Prelude to Schism', 1, 4), R('X-Men: Schism', 1, 5), I('X-Men: Regenesis', ['#1'])) },
      { title: 'Post-Schism X-Men split', family: 'X-Men', note: 'Read both sides of the split.', issues: M(R('Wolverine and the X-Men', 1, 8), R('Uncanny X-Men vol. 2', 1, 10)) },
      { title: 'Avengers vs X-Men', family: 'X-Men / Avengers', note: 'Event lock. Phoenix, Hope, Cyclops.', issues: M(I('Avengers vs. X-Men', ['#0']), R('Avengers vs. X-Men', 1, 12), R('AVX: Consequences', 1, 5)) },
      { title: 'Daredevil by Waid vol. 4 part 1', family: 'Daredevil', note: 'San Francisco era begins.', issues: R('Daredevil vol. 4', 1, 9) },
      { title: 'All-New X-Men / Bendis setup', family: 'X-Men', note: 'Young original X-Men arrive in the present.', issues: M(R('All-New X-Men', 1, 15), R('Uncanny X-Men vol. 3', 1, 11)) },
      { title: 'Daredevil by Waid vol. 4 part 2', family: 'Daredevil', note: 'Finish Waid’s main Daredevil era.', issues: R('Daredevil vol. 4', 10, 18) },
      { title: 'X-Men: Battle of the Atom', family: 'X-Men', note: 'Event lock. Future X-Men chaos.', issues: M(I('X-Men: Battle of the Atom', ['#1']), R('All-New X-Men', 16, 17), R('X-Men', 5, 6), R('Uncanny X-Men vol. 3', 12, 13), R('Wolverine and the X-Men', 36, 37), I('X-Men: Battle of the Atom', ['#2'])) },
      { title: 'Defenders: The Order', family: 'Defenders', note: 'Original Defenders twisted into an authoritarian version.', issues: R('The Order', 1, 6) },
      { title: 'Defenders: Indefensible', family: 'Defenders', note: 'Comedy-heavy classic Defenders reunion.', issues: R('Defenders 2005', 1, 5) },
      { title: 'Defenders by Fraction', family: 'Defenders', note: 'Optional stylish modern Defenders.', issues: R('Defenders 2011', 1, 12) },
      { title: 'X-Men: Last Will of Xavier', family: 'X-Men', note: 'Xavier legacy fallout.', issues: R('Uncanny X-Men vol. 3', 23, 31) },
      { title: 'Fantastic Four: Robinson part 1', family: 'Fantastic Four', note: 'Fall of the Fantastic Four begins.', issues: R('Fantastic Four 2014', 1, 14) },
      { title: 'Fantastic Four: Robinson finale', family: 'Fantastic Four', note: 'Final pre-Secret Wars FF solo stretch.', issues: R('Fantastic Four', 642, 645) }
    ]
  },
  {
    id: 'phase-8',
    name: 'Phase 8',
    title: 'Hickman Avengers into Secret Wars',
    desc: 'Endgame shelf: Avengers, New Avengers, Infinity, Time Runs Out, and Secret Wars 2015.',
    blocks: [
      { title: 'Hickman Avengers opening', family: 'Avengers', note: 'Avengers World. Bigger team, bigger threats.', issues: R('Avengers 2012', 1, 6) },
      { title: 'Hickman New Avengers opening', family: 'Avengers', note: 'Illuminati, incursions, and impossible choices.', issues: R('New Avengers 2013', 1, 6) },
      { title: 'Hickman Avengers build', family: 'Avengers', note: 'Builders, White Events, and Ex Nihilo machinery.', issues: R('Avengers 2012', 7, 17) },
      { title: 'Infinity event', family: 'Avengers', note: 'Event lock. Read with a proper Infinity order if your app or collection provides it.', issues: M(R('Infinity', 1, 6), R('Avengers 2012', 18, 23), R('New Avengers 2013', 9, 12)) },
      { title: 'Hickman post-Infinity part 1', family: 'Avengers', note: 'Multiverse collapse gets uglier.', issues: M(R('Avengers 2012', 24, 28), R('New Avengers 2013', 13, 17)) },
      { title: 'Hickman post-Infinity part 2', family: 'Avengers', note: 'Time Runs Out setup starts forming.', issues: M(R('Avengers 2012', 29, 34), R('New Avengers 2013', 18, 23)) },
      { title: 'Time Runs Out part 1', family: 'Avengers', note: 'The countdown begins.', issues: M(R('Avengers 2012', 35, 37), R('New Avengers 2013', 24, 25)) },
      { title: 'Time Runs Out part 2', family: 'Avengers', note: 'Everyone is making bad choices in expensive costumes.', issues: M(R('Avengers 2012', 38, 39), R('New Avengers 2013', 26, 28)) },
      { title: 'Time Runs Out part 3', family: 'Avengers', note: 'Final pressure.', issues: M(R('Avengers 2012', 40, 42), R('New Avengers 2013', 29, 30)) },
      { title: 'Time Runs Out finale', family: 'Avengers', note: 'Direct bridge into Secret Wars.', issues: M(R('Avengers 2012', 43, 44), R('New Avengers 2013', 31, 33)) },
      { title: 'Secret Wars 2015', family: 'Avengers / Fantastic Four', note: 'Event lock. Endpoint of this whole roadmap. Reed, Doom, multiverse, Marvel reset.', issues: M(I('Secret Wars 2015', ['#0']), R('Secret Wars 2015', 1, 9)) }
    ]
  },
  {
    id: 'phase-9',
    name: 'Phase 9',
    title: 'Post-Secret Wars rebuild: 2015-2018',
    desc: 'Marvel rebuilds after Secret Wars: street heroes, new Avengers structures, restored Fantastic Four momentum, and major Thanos material.',
    blocks: [
      { title: 'Doctor Strange by Jason Aaron part 1', family: 'Doctor Strange', writer: 'Jason Aaron', years: '2015-2016', tags: ['Full run', 'Essential'], note: 'The modern Doctor Strange relaunch. Magic gets a cost, which makes Strange feel vulnerable again.', issues: R('Doctor Strange 2015', 1, 10) },
      { title: 'Doctor Strange by Jason Aaron part 2', family: 'Doctor Strange', writer: 'Jason Aaron', years: '2016-2017', tags: ['Full run'], note: 'Finish Aaron’s main Strange stretch before the book shifts writers.', issues: R('Doctor Strange 2015', 11, 20) },
      { title: 'Doctor Strange: Hopeless and Cates bridge', family: 'Doctor Strange', writer: 'Dennis Hopeless, Donny Cates', years: '2017-2018', tags: ['Full run'], note: 'Bridge material into Cates’ Loki/Sorcerer Supreme era.', issues: M(R('Doctor Strange 2015', 21, 26), R('Doctor Strange', 381, 390)) },
      { title: 'Daredevil by Soule part 1', family: 'Daredevil', writer: 'Charles Soule', years: '2015-2017', tags: ['Full run'], note: 'Legal Daredevil, Blindspot, Muse, and a more lawyer-centered Matt.', issues: R('Daredevil vol. 5', 1, 14) },
      { title: 'Daredevil by Soule part 2', family: 'Daredevil', writer: 'Charles Soule', years: '2017-2018', tags: ['Full run'], note: 'Mayor Fisk pressure and the road into the legacy-numbered finale.', issues: M(R('Daredevil vol. 5', 15, 28), R('Daredevil', 595, 612)) },
      { title: 'The Vision by Tom King', family: 'Vision & Scarlet Witch / Avengers', writer: 'Tom King', years: '2015-2016', tags: ['Essential', 'Vision/Wanda'], note: 'Vision tries to build a normal family. Quiet horror in suburban clothing.', issues: R('Vision 2015', 1, 12) },
      { title: 'Scarlet Witch by James Robinson', family: 'Vision & Scarlet Witch / Avengers', writer: 'James Robinson', years: '2015-2017', tags: ['Vision/Wanda'], note: 'Wanda explores witchcraft, heritage, and repair after years of being treated like a walking plot bomb.', issues: R('Scarlet Witch 2015', 1, 15) },
      { title: 'All-New All-Different Avengers', family: 'Avengers', writer: 'Mark Waid', years: '2015-2016', tags: ['Full run'], note: 'Post-Secret Wars Avengers with a younger, mixed-generation roster.', issues: M(I('FCBD All-New All-Different Avengers', ['#1']), R('All-New All-Different Avengers', 1, 15), I('All-New All-Different Avengers Annual', ['#1'])) },
      { title: 'Avengers by Mark Waid', family: 'Avengers', writer: 'Mark Waid', years: '2016-2018', tags: ['Full run'], note: 'The follow-up Avengers volume before No Surrender.', issues: R('Avengers 2016', 1, 11) },
      { title: 'Avengers: No Surrender', family: 'Avengers', writer: 'Mark Waid, Al Ewing, Jim Zub', years: '2018', tags: ['Essential', 'Event'], note: 'Event lock. Weekly Avengers epic that restores the team’s big-board energy.', issues: R('Avengers', 675, 690) },
      { title: 'Thanos by Lemire and Cates part 1', family: 'Thanos / Cosmic Marvel', writer: 'Jeff Lemire', years: '2016-2017', tags: ['Full run', 'Cosmic'], note: 'Thanos returns to center stage in a modern solo run.', issues: R('Thanos 2016', 1, 12) },
      { title: 'Thanos Wins', family: 'Thanos / Cosmic Marvel', writer: 'Donny Cates', years: '2017-2018', tags: ['Essential', 'Cosmic'], note: 'Future Thanos, Cosmic Ghost Rider, and one of the most memorable modern Thanos arcs.', issues: R('Thanos 2016', 13, 18) },
      { title: 'Marvel Two-In-One: Fate of the Four', family: 'Fantastic Four', writer: 'Chip Zdarsky', years: '2017-2018', tags: ['Essential'], note: 'Ben and Johnny search for Reed, Sue, and the missing family after Secret Wars.', issues: R('Marvel Two-In-One 2017', 1, 12) },
      { title: 'Fantastic Four by Dan Slott part 1', family: 'Fantastic Four', writer: 'Dan Slott', years: '2018-2019', tags: ['Full run'], note: 'The FF return to their own title after years away.', issues: R('Fantastic Four 2018', 1, 12) },
      { title: 'Defenders street-level', family: 'Defenders / Daredevil', writer: 'Brian Michael Bendis', years: '2017-2018', tags: ['Optional'], note: 'The Netflix-style Defenders team: Daredevil, Jessica Jones, Luke Cage, and Iron Fist.', issues: R('Defenders 2017', 1, 10) }
    ]
  },
  {
    id: 'phase-10',
    name: 'Phase 10',
    title: 'Fresh Start, Krakoa, Empyre, and modern classics: 2018-2022',
    desc: 'The big modern shelf: Immortal Hulk, Krakoa, Aaron Avengers, Slott FF, Zdarsky Daredevil, and Thor’s next era.',
    blocks: [
      { title: 'Immortal Hulk part 1', family: 'Hulk', writer: 'Al Ewing', years: '2018-2019', tags: ['Essential', 'Full run'], note: 'Horror Hulk masterpiece begins. Body horror, guilt, religion, and gamma mythology.', issues: R('Immortal Hulk', 1, 15) },
      { title: 'Immortal Hulk part 2', family: 'Hulk', writer: 'Al Ewing', years: '2019-2020', tags: ['Essential', 'Full run'], note: 'The run deepens from monster horror into cosmic theology.', issues: R('Immortal Hulk', 16, 30) },
      { title: 'Immortal Hulk part 3', family: 'Hulk', writer: 'Al Ewing', years: '2020-2021', tags: ['Essential', 'Full run'], note: 'The final descent. Read slowly; this one has teeth.', issues: M(R('Immortal Hulk', 31, 50), I('Immortal Hulk: The Threshing Place', ['#1'])) },
      { title: 'Avengers by Jason Aaron part 1', family: 'Avengers', writer: 'Jason Aaron', years: '2018-2019', tags: ['Full run'], note: 'Big, loud Avengers with prehistoric Avengers mythology and a broad rotating cast.', issues: R('Avengers 2018', 1, 17) },
      { title: 'Avengers by Jason Aaron part 2', family: 'Avengers', writer: 'Jason Aaron', years: '2019-2021', tags: ['Full run'], note: 'Moon Knight, vampires, Starbrand, and more giant-team machinery.', issues: R('Avengers 2018', 18, 44) },
      { title: 'Avengers by Jason Aaron finale', family: 'Avengers', writer: 'Jason Aaron', years: '2021-2023', tags: ['Full run'], note: 'Finish Aaron’s Avengers era, including the multiversal Avengers Forever companion.', issues: M(R('Avengers 2018', 45, 66), R('Avengers Forever 2021', 1, 15), I('Avengers Assemble Alpha', ['#1']), I('Avengers Assemble Omega', ['#1'])) },
      { title: 'Fantastic Four by Dan Slott part 2', family: 'Fantastic Four', writer: 'Dan Slott', years: '2019-2020', tags: ['Full run'], note: 'Slott FF continues into bigger family and cosmic stakes.', issues: R('Fantastic Four 2018', 13, 25) },
      { title: 'Empyre core', family: 'Avengers / Fantastic Four', writer: 'Al Ewing and Dan Slott', years: '2020', tags: ['Event'], note: 'Event lock. Kree/Skrull/Cotati event with Avengers and Fantastic Four at the center.', issues: M(I('Empyre: Avengers', ['#0']), I('Empyre: Fantastic Four', ['#0']), R('Empyre', 1, 6), I('Empyre: Aftermath Avengers', ['#1']), I('Empyre: Fallout Fantastic Four', ['#1'])) },
      { title: 'Fantastic Four by Dan Slott finale', family: 'Fantastic Four', writer: 'Dan Slott', years: '2020-2022', tags: ['Full run'], note: 'Finish Slott’s FF run before Ryan North takes over.', issues: R('Fantastic Four 2018', 26, 46) },
      { title: 'House of X / Powers of X', family: 'X-Men', writer: 'Jonathan Hickman', years: '2019', tags: ['Essential', 'Event'], note: 'Event lock. Krakoa begins. This is the modern X-Men reset point.', issues: M(R('House of X', 1, 6), R('Powers of X', 1, 6)) },
      { title: 'X-Men by Hickman part 1', family: 'X-Men', writer: 'Jonathan Hickman', years: '2019-2020', tags: ['Full run', 'Essential'], note: 'Krakoa’s main X-Men title starts as a constellation of big mutant ideas.', issues: R('X-Men 2019', 1, 11) },
      { title: 'X of Swords', family: 'X-Men', writer: 'Tini Howard, Jonathan Hickman, Vita Ayala, Gerry Duggan, Benjamin Percy, Zeb Wells, Leah Williams', years: '2020', tags: ['Event'], note: 'Event lock. Krakoa, Arakko, Apocalypse, swords, and mutant mythology expanding like a living map.', issues: M(I('X of Swords: Creation', ['#1']), R('X-Factor 2020', 4, 4), R('Wolverine 2020', 6, 7), R('X-Force 2019', 13, 14), R('Marauders 2019', 13, 15), R('Hellions', 5, 6), R('New Mutants 2019', 13, 13), R('Cable 2020', 5, 6), R('Excalibur 2019', 13, 15), R('X-Men 2019', 13, 15), I('X of Swords: Stasis', ['#1']), I('X of Swords: Destruction', ['#1'])) },
      { title: 'X-Men by Hickman part 2 and Inferno', family: 'X-Men', writer: 'Jonathan Hickman', years: '2021', tags: ['Full run', 'Essential'], note: 'Finish Hickman’s main X-Men and his Krakoa exit mini.', issues: M(R('X-Men 2019', 16, 21), R('Inferno 2021', 1, 4)) },
      { title: 'Daredevil by Zdarsky part 1', family: 'Daredevil', writer: 'Chip Zdarsky', years: '2019-2021', tags: ['Essential', 'Full run'], note: 'One of the best modern Daredevil eras: guilt, prison, law, Elektra, Fisk.', issues: M(R('Daredevil 2019', 1, 18), I('Daredevil Annual 2020', ['#1'])) },
      { title: 'Daredevil by Zdarsky part 2', family: 'Daredevil', writer: 'Chip Zdarsky', years: '2020-2021', tags: ['Essential', 'Full run'], note: 'Matt’s consequences and Elektra’s role intensify.', issues: R('Daredevil 2019', 19, 36) },
      { title: 'Devil’s Reign and Woman Without Fear', family: 'Daredevil / Avengers', writer: 'Chip Zdarsky', years: '2021-2022', tags: ['Essential', 'Event'], note: 'Event lock. Kingpin weaponizes the law against heroes; Elektra’s Daredevil era matters here.', issues: M(R('Devil’s Reign', 1, 6), I('Devil’s Reign: Omega', ['#1']), R('Daredevil: Woman Without Fear', 1, 3)) },
      { title: 'Thor by Donny Cates', family: 'Thor', writer: 'Donny Cates and Torunn Grønbekk', years: '2020-2023', tags: ['Full run'], note: 'Black Winter, cosmic Thor, and the bridge toward Al Ewing’s Thor.', issues: R('Thor 2020', 1, 35) },
      { title: 'Hulk by Donny Cates', family: 'Hulk', writer: 'Donny Cates and Ryan Ottley', years: '2021-2023', tags: ['Full run'], note: 'A louder sci-fi Hulk run after Immortal Hulk. Not as essential, but useful before the 2023 horror turn.', issues: R('Hulk 2021', 1, 14) },
      { title: 'Captain America by Ta-Nehisi Coates', family: 'Captain America', writer: 'Ta-Nehisi Coates', years: '2018-2021', tags: ['Full run'], note: 'A political Steve Rogers run dealing with damaged trust after Secret Empire-era fallout.', issues: R('Captain America 2018', 1, 30) },
      { title: 'Doctor Strange: Death, Clea, and return', family: 'Doctor Strange', writer: 'Jed MacKay', years: '2021-2024', tags: ['Essential', 'Full run'], note: 'MacKay’s Strange line: Stephen dies, Clea becomes Sorcerer Supreme, and the story loops back into Stephen’s return.', issues: M(R('Death of Doctor Strange', 1, 5), R('Strange 2022', 1, 10), R('Doctor Strange 2023', 1, 18)) },
      { title: 'Defenders by Al Ewing', family: 'Defenders / Doctor Strange', writer: 'Al Ewing', years: '2021-2022', tags: ['Essential'], note: 'Reality-architecture weirdness. The Defenders concept at its most cosmic and clever.', issues: M(R('Defenders 2021', 1, 5), R('Defenders: Beyond', 1, 5)) }
    ]
  },
  {
    id: 'phase-11',
    name: 'Phase 11',
    title: 'Current-era shelf: 2022-2026',
    desc: 'Current and near-current runs as of June 2026. These are built as updateable shelves, so you can extend the issue ranges later.',
    blocks: [
      { title: 'Ryan North Fantastic Four part 1', family: 'Fantastic Four', writer: 'Ryan North', years: '2022-2024', tags: ['Essential', 'Full run'], note: 'Excellent modern FF: smart, funny, science-driven, and very family-focused.', issues: R('Fantastic Four 2022', 1, 16) },
      { title: 'Ryan North Fantastic Four part 2', family: 'Fantastic Four', writer: 'Ryan North', years: '2024-2025', tags: ['Essential', 'Full run'], note: 'The run keeps its puzzle-box science heart while building toward the 2025 relaunch.', issues: R('Fantastic Four 2022', 17, 33) },
      { title: 'Ryan North / Humberto Ramos Fantastic Four', family: 'Fantastic Four', writer: 'Ryan North', years: '2025-2026', tags: ['Current', 'Full run'], note: 'Current FF volume as of June 2026. Add new issues later as they release.', issues: R('Fantastic Four 2025', 1, 10) },
      { title: 'Avengers by Jed MacKay part 1', family: 'Avengers', writer: 'Jed MacKay', years: '2023-2024', tags: ['Full run', 'Current'], note: 'Current Avengers era with a tighter, mission-driven team.', issues: R('Avengers 2023', 1, 12) },
      { title: 'Blood Hunt core', family: 'Avengers / Doctor Strange', writer: 'Jed MacKay', years: '2024', tags: ['Event'], note: 'Event lock. Major vampire event that heavily touches Doctor Strange and Avengers-era Marvel.', issues: R('Blood Hunt', 1, 5) },
      { title: 'Avengers by Jed MacKay part 2', family: 'Avengers', writer: 'Jed MacKay', years: '2024-2025', tags: ['Full run', 'Current'], note: 'Continue MacKay’s Avengers through Kang/Twilight Court-era machinery.', issues: R('Avengers 2023', 13, 24) },
      { title: 'Avengers by Jed MacKay part 3', family: 'Avengers', writer: 'Jed MacKay', years: '2025-2026', tags: ['Full run', 'Current'], note: 'Current shelf through issue #35, the latest verified issue I added to the tracker.', issues: R('Avengers 2023', 25, 35) },
      { title: 'From the Ashes: X-Men by Jed MacKay part 1', family: 'X-Men', writer: 'Jed MacKay', years: '2024-2025', tags: ['Full run', 'Current'], note: 'Post-Krakoa X-Men starting point. Cyclops-led core team.', issues: R('X-Men 2024', 1, 12) },
      { title: 'From the Ashes: X-Men by Jed MacKay part 2', family: 'X-Men', writer: 'Jed MacKay', years: '2025-2026', tags: ['Full run', 'Current'], note: 'Includes the Age of Revelation epilogue area through #23.', issues: R('X-Men 2024', 13, 23) },
      { title: 'From the Ashes: Uncanny X-Men by Gail Simone part 1', family: 'X-Men', writer: 'Gail Simone', years: '2024-2025', tags: ['Full run', 'Current'], note: 'Rogue-led Uncanny side of the current X-line.', issues: R('Uncanny X-Men 2024', 1, 16) },
      { title: 'From the Ashes: Uncanny X-Men by Gail Simone part 2', family: 'X-Men', writer: 'Gail Simone', years: '2025-2026', tags: ['Full run', 'Current'], note: 'Current Uncanny shelf through #32 as listed by Marvel.', issues: R('Uncanny X-Men 2024', 17, 32) },
      { title: 'Daredevil by Saladin Ahmed', family: 'Daredevil', writer: 'Saladin Ahmed', years: '2023-2025', tags: ['Full run'], note: 'Post-Zdarsky Daredevil era before the 2026 relaunch.', issues: R('Daredevil 2023', 1, 25) },
      { title: 'Daredevil by Stephanie Phillips', family: 'Daredevil', writer: 'Stephanie Phillips', years: '2026', tags: ['Current'], note: 'Current Daredevil relaunch shelf. I added the verified launch issue; extend as new issues arrive.', issues: I('Daredevil 2026', ['#1']) },
      { title: 'Incredible Hulk by Phillip Kennedy Johnson', family: 'Hulk', writer: 'Phillip Kennedy Johnson', years: '2023-2026', tags: ['Current', 'Full run'], note: 'Modern horror-monster Hulk after the Cates/Ottley sci-fi run.', issues: R('Incredible Hulk 2023', 1, 30) },
      { title: 'Immortal Thor', family: 'Thor', writer: 'Al Ewing', years: '2023-2025', tags: ['Essential', 'Full run'], note: 'Al Ewing’s mythic Thor era. Highly worth reading after Aaron/Cates Thor.', issues: R('Immortal Thor', 1, 25) },
      { title: 'Mortal Thor', family: 'Thor', writer: 'Al Ewing', years: '2025-2026', tags: ['Current', 'Full run'], note: 'Current continuation of Ewing’s Thor as of June 2026.', issues: R('Mortal Thor', 1, 13) },
      { title: 'Doctor Strange of Asgard', family: 'Doctor Strange / Thor', writer: 'Derek Landy', years: '2025', tags: ['Full run'], note: 'Stephen becomes tangled in Asgardian magic and politics.', issues: R('Doctor Strange of Asgard', 1, 5) },
      { title: 'Doctor Strange 2025', family: 'Doctor Strange / Thor', writer: 'Derek Landy', years: '2025-2026', tags: ['Current', 'Full run'], note: 'Current Doctor Strange ongoing shelf through #7, published June 2026.', issues: R('Doctor Strange 2025', 1, 7) },
      { title: 'Captain America by JMS', family: 'Captain America', writer: 'J. Michael Straczynski', years: '2023-2025', tags: ['Full run'], note: 'Recent Cap run before the Zdarsky relaunch.', issues: R('Captain America 2023', 1, 16) },
      { title: 'Captain America by Chip Zdarsky', family: 'Captain America', writer: 'Chip Zdarsky', years: '2025-2026', tags: ['Current', 'Full run'], note: 'Current Cap shelf through Marvel’s listed #13.', issues: R('Captain America 2025', 1, 13) },
      { title: 'Amazing Spider-Man by Joe Kelly', family: 'Spider-Man', writer: 'Joe Kelly', years: '2025-2026', tags: ['Current', 'Full run'], note: 'Current Amazing Spider-Man shelf through #27 as listed by Marvel.', issues: R('Amazing Spider-Man 2025', 1, 27) },
      { title: 'Vision and Scarlet Witch 2025', family: 'Vision & Scarlet Witch / Avengers', writer: 'Steve Orlando', years: '2025', tags: ['Vision/Wanda', 'Current'], note: 'Modern reunion mini for Marvel’s classic star-crossed Avengers couple.', issues: R('Vision and the Scarlet Witch 2025', 1, 5) }
    ]
  }

];


const blockMeta = {
  'Captain America historical debut': { writer: 'Joe Simon and Jack Kirby', years: '1941', tags: ['Essential'] },
  'Fantastic Four begins': { writer: 'Stan Lee and Jack Kirby', years: '1961', tags: ['Essential'] },
  'Hulk origin': { writer: 'Stan Lee and Jack Kirby', years: '1962', tags: ['Essential'] },
  'Thor origin and Loki foundation': { writer: 'Stan Lee, Larry Lieber, Jack Kirby', years: '1962', tags: ['Essential'] },
  'Spider-Man origin': { writer: 'Stan Lee and Steve Ditko', years: '1962', tags: ['Essential'] },
  'Doctor Strange origin pack': { writer: 'Stan Lee and Steve Ditko', years: '1963', tags: ['Essential'] },
  'Avengers form and Cap returns': { writer: 'Stan Lee and Jack Kirby', years: '1963-1964', tags: ['Essential'] },
  'Spider-Man early rogues 1': { writer: 'Stan Lee and Steve Ditko', years: '1963', tags: ['Essential'] },
  'Fantastic Four early villains': { writer: 'Stan Lee and Jack Kirby', years: '1962', tags: ['Essential'] },
  'X-Men historical start': { writer: 'Stan Lee and Jack Kirby', years: '1963', tags: ['Essential'] },
  'Avengers roster identity': { writer: 'Stan Lee and Jack Kirby', years: '1965', tags: ['Essential'] },
  'Spider-Man early rogues 2': { writer: 'Stan Lee and Steve Ditko', years: '1964', tags: ['Essential'] },
  'Doctor Strange: Dormammu, Clea, and Ditko magic 1': { writer: 'Stan Lee and Steve Ditko', years: '1964-1965', tags: ['Essential'] },
  'Doctor Strange: Ditko magic 2': { writer: 'Stan Lee and Steve Ditko', years: '1965-1966', tags: ['Essential'] },
  'Fantastic Four world-building 2': { writer: 'Stan Lee and Jack Kirby', years: '1965-1966', tags: ['Essential'] },
  'Spider-Man: If This Be My Destiny…!': { writer: 'Stan Lee and Steve Ditko', years: '1965-1966', tags: ['Essential'] },
  'Spider-Man: Green Goblin Unmasked': { writer: 'Stan Lee and John Romita Sr.', years: '1966', tags: ['Essential'] },
  'Fantastic Four: Doom steals cosmic power': { writer: 'Stan Lee and Jack Kirby', years: '1966', tags: ['Essential'] },
  'Avengers: Vision arrives': { writer: 'Roy Thomas and John Buscema', years: '1968', tags: ['Essential', 'Vision/Wanda'] },
  'Spider-Man: Spider-Man No More!': { writer: 'Stan Lee and John Romita Sr.', years: '1967', tags: ['Essential'] },
  'Avengers: Kree-Skrull War': { writer: 'Roy Thomas', years: '1971-1972', tags: ['Essential', 'Event'] },
  'Spider-Man: The Night Gwen Stacy Died': { writer: 'Gerry Conway', years: '1973', tags: ['Essential'] },
  'Avengers / Defenders War': { writer: 'Steve Englehart', years: '1973', tags: ['Essential', 'Event'] },
  'Captain America: Secret Empire': { writer: 'Steve Englehart', years: '1974', tags: ['Essential'] },
  'Captain America: Nomad aftermath': { writer: 'Steve Englehart', years: '1974-1975', tags: ['Essential'] },
  'X-Men: Second Genesis begins': { writer: 'Len Wein, Chris Claremont, Dave Cockrum', years: '1975', tags: ['Essential'] },
  'X-Men: All-New team deepens': { writer: 'Chris Claremont', years: '1976-1977', tags: ['Essential'] },
  'Avengers: Korvac Saga': { writer: 'Jim Shooter', years: '1977-1978', tags: ['Essential', 'Event'] },
  'X-Men: Proteus Saga': { writer: 'Chris Claremont', years: '1979', tags: ['Essential'] },
  'Daredevil: The Man Without Fear': { writer: 'Frank Miller', years: '1993-1994', tags: ['Essential'] },
  'X-Men: Dark Phoenix Saga': { writer: 'Chris Claremont', years: '1980', tags: ['Essential', 'Event'] },
  'Daredevil: Miller/Janson part 1': { writer: 'Frank Miller and Roger McKenzie', years: '1979-1980', tags: ['Essential'] },
  'X-Men: Days of Future Past': { writer: 'Chris Claremont', years: '1981', tags: ['Essential'] },
  'Spider-Man: Nothing Can Stop the Juggernaut!': { writer: 'Roger Stern', years: '1982', tags: ['Essential'] },
  'Fantastic Four: Byrne part 1': { writer: 'John Byrne', years: '1981-1982', tags: ['Full run', 'Essential'] },
  'Daredevil: Elektra Saga part 1': { writer: 'Frank Miller', years: '1981-1982', tags: ['Essential'] },
  'X-Men: God Loves, Man Kills': { writer: 'Chris Claremont', years: '1982', tags: ['Essential'] },
  'Fantastic Four: Byrne cosmic part': { writer: 'John Byrne', years: '1982', tags: ['Full run', 'Essential'] },
  'Spider-Man: The Kid Who Collects Spider-Man': { writer: 'Roger Stern', years: '1984', tags: ['Essential'] },
  'Daredevil: Elektra Saga part 2': { writer: 'Frank Miller', years: '1982', tags: ['Essential'] },
  'X-Men: Brood Saga': { writer: 'Chris Claremont', years: '1982-1983', tags: ['Essential'] },
  'Spider-Man: Alien Costume Saga': { writer: 'Roger Stern and Tom DeFalco', years: '1984-1985', tags: ['Essential'] },
  'Daredevil: Miller finale': { writer: 'Frank Miller', years: '1982-1983', tags: ['Essential'] },
  'X-Men: From the Ashes': { writer: 'Chris Claremont', years: '1983', tags: ['Essential'] },
  'New Mutants: Demon Bear Saga': { writer: 'Chris Claremont', years: '1984', tags: ['Essential'] },
  'Spider-Man: Death of Jean DeWolff': { writer: 'Peter David', years: '1985-1986', tags: ['Essential'] },
  'Fantastic Four: Malice / Sue Storm': { writer: 'John Byrne', years: '1985', tags: ['Full run', 'Essential'] },
  'Daredevil: Born Again': { writer: 'Frank Miller', years: '1986', tags: ['Essential'] },
  'Thor: Beta Ray Bill': { writer: 'Walt Simonson', years: '1983', tags: ['Essential'] },
  'Hulk: Peter David begins': { writer: 'Peter David', years: '1987-1988', tags: ['Essential'] },
  'Thor: Surtur Saga': { writer: 'Walt Simonson', years: '1984-1985', tags: ['Essential', 'Event'] },
  'Hulk: Ground Zero / psychology': { writer: 'Peter David', years: '1988', tags: ['Essential'] },
  'Spider-Man: Kraven’s Last Hunt': { writer: 'J.M. DeMatteis', years: '1987', tags: ['Essential', 'Event'] },
  'Doctor Strange + Doom: Triumph and Torment': { writer: 'Roger Stern', years: '1989', tags: ['Essential'] },
  'Spider-Man: Venom’s birth': { writer: 'David Michelinie', years: '1988-1989', tags: ['Essential'] },
  'Avengers: Under Siege': { writer: 'Roger Stern', years: '1986-1987', tags: ['Essential'] },
  'X-Men: Mutant Massacre': { writer: 'Chris Claremont and others', years: '1986', tags: ['Essential', 'Event'] },
  'Daredevil: Typhoid Mary': { writer: 'Ann Nocenti', years: '1988-1989', tags: ['Essential'] },
  'X-Men: Fall of the Mutants': { writer: 'Chris Claremont, Louise Simonson', years: '1988', tags: ['Essential', 'Event'] },
  'X-Men: Inferno': { writer: 'Chris Claremont, Louise Simonson', years: '1988-1989', tags: ['Essential', 'Event'] },
  'Fantastic Four: Simonson part 1': { writer: 'Walt Simonson', years: '1989-1990', tags: ['Full run', 'Essential'] },
  'Fantastic Four: Simonson part 2': { writer: 'Walt Simonson', years: '1990-1991', tags: ['Full run', 'Essential'] },
  'Captain America: Operation Rebirth': { writer: 'Mark Waid', years: '1995', tags: ['Essential'] },
  'X-Men: X-Tinction Agenda': { writer: 'Chris Claremont and Louise Simonson', years: '1990', tags: ['Event'] },
  'Daredevil: Last Rites': { writer: 'D.G. Chichester', years: '1992', tags: ['Essential'] },
  'Hulk: Future Imperfect': { writer: 'Peter David', years: '1992-1993', tags: ['Essential'] },
  'X-Men: Mutant Genesis': { writer: 'Chris Claremont', years: '1991', tags: ['Essential'] },
  'Spider-Man: Maximum Carnage': { writer: 'Tom DeFalco, J.M. DeMatteis, Terry Kavanagh, David Michelinie', years: '1993', tags: ['Event'] },
  'X-Men: X-Cutioner’s Song': { writer: 'Scott Lobdell, Fabian Nicieza, Peter David', years: '1992-1993', tags: ['Event'] },
  'Daredevil: Guardian Devil': { writer: 'Kevin Smith', years: '1998-1999', tags: ['Essential'] },
  'X-Men: Fatal Attractions': { writer: 'Scott Lobdell, Fabian Nicieza, Peter David, Larry Hama', years: '1993', tags: ['Event'] },
  'X-Men: Age of Apocalypse': { writer: 'Multiple X-writers', years: '1995', tags: ['Essential', 'Event'] },
  'Avengers Forever': { writer: 'Kurt Busiek and Roger Stern', years: '1998-2000', tags: ['Essential'] },
  'Avengers: Busiek/Pérez relaunch': { writer: 'Kurt Busiek', years: '1998', tags: ['Essential'] },
  'Avengers: Ultron Unlimited': { writer: 'Kurt Busiek', years: '1999', tags: ['Essential'] },
  'Avengers: Kang Dynasty': { writer: 'Kurt Busiek', years: '2001-2002', tags: ['Essential', 'Event'] },
  'Ultimate Spider-Man origin': { writer: 'Brian Michael Bendis', years: '2000-2001', tags: ['Essential'] },
  'New X-Men part 1': { writer: 'Grant Morrison', years: '2001', tags: ['Essential', 'Full run'] },
  'New X-Men part 2': { writer: 'Grant Morrison', years: '2001-2002', tags: ['Essential', 'Full run'] },
  'New X-Men part 3': { writer: 'Grant Morrison', years: '2002-2003', tags: ['Essential', 'Full run'] },
  'New X-Men part 4': { writer: 'Grant Morrison', years: '2003-2004', tags: ['Essential', 'Full run'] },
  'Spider-Man: Blue': { writer: 'Jeph Loeb', years: '2002-2003', tags: ['Essential'] },
  'Daredevil: Bendis/Maleev part 1': { writer: 'Brian Michael Bendis', years: '2001-2002', tags: ['Essential', 'Full run'] },
  'Daredevil: Bendis/Maleev part 2': { writer: 'Brian Michael Bendis', years: '2002-2003', tags: ['Essential', 'Full run'] },
  'Daredevil: Bendis/Maleev part 3': { writer: 'Brian Michael Bendis', years: '2003', tags: ['Essential', 'Full run'] },
  'Daredevil: Bendis/Maleev part 4': { writer: 'Brian Michael Bendis', years: '2004', tags: ['Essential', 'Full run'] },
  'Daredevil: Bendis/Maleev part 5': { writer: 'Brian Michael Bendis', years: '2004-2005', tags: ['Essential', 'Full run'] },
  'Daredevil: The Murdock Papers': { writer: 'Brian Michael Bendis', years: '2005-2006', tags: ['Essential', 'Full run'] },
  'Fantastic Four: Waid/Wieringo part 1': { writer: 'Mark Waid', years: '2002-2003', tags: ['Essential', 'Full run'] },
  'Fantastic Four: Waid part 2': { writer: 'Mark Waid', years: '2003', tags: ['Essential', 'Full run'] },
  'Fantastic Four: Waid part 3': { writer: 'Mark Waid', years: '2004', tags: ['Essential', 'Full run'] },
  'Fantastic Four: Waid part 4': { writer: 'Mark Waid', years: '2004-2005', tags: ['Essential', 'Full run'] },
  'Astonishing X-Men part 1': { writer: 'Joss Whedon', years: '2004-2005', tags: ['Essential', 'Full run'] },
  'Astonishing X-Men part 2': { writer: 'Joss Whedon', years: '2005-2008', tags: ['Essential', 'Full run'] },
  'House of M': { writer: 'Brian Michael Bendis', years: '2005', tags: ['Essential', 'Event', 'Vision/Wanda'] },
  'Captain America: Winter Soldier part 1': { writer: 'Ed Brubaker', years: '2005', tags: ['Essential'] },
  'Captain America: Winter Soldier part 2': { writer: 'Ed Brubaker', years: '2005-2006', tags: ['Essential'] },
  'Avengers Disassembled': { writer: 'Brian Michael Bendis', years: '2004', tags: ['Essential', 'Event', 'Vision/Wanda'] },
  'New Avengers: Breakout': { writer: 'Brian Michael Bendis', years: '2005', tags: ['Essential'] },
  'New Avengers: Illuminati': { writer: 'Brian Michael Bendis and Brian Reed', years: '2006-2008', tags: ['Essential'] },
  'Civil War main event': { writer: 'Mark Millar', years: '2006-2007', tags: ['Essential', 'Event'] },
  'Planet Hulk': { writer: 'Greg Pak', years: '2006-2007', tags: ['Essential', 'Event'] },
  'World War Hulk': { writer: 'Greg Pak', years: '2007', tags: ['Essential', 'Event'] },
  'Spider-Man: Back in Black': { writer: 'J. Michael Straczynski', years: '2007', tags: ['Essential'] },
  'Thor: JMS rebirth part 1': { writer: 'J. Michael Straczynski', years: '2007-2008', tags: ['Essential', 'Full run'] },
  'Secret Invasion': { writer: 'Brian Michael Bendis', years: '2008', tags: ['Event'] },
  'Thor: JMS finale': { writer: 'J. Michael Straczynski', years: '2009', tags: ['Essential', 'Full run'] },
  'Siege': { writer: 'Brian Michael Bendis', years: '2010', tags: ['Essential', 'Event'] },
  'Hickman FF prologue': { writer: 'Jonathan Hickman', years: '2009', tags: ['Essential', 'Full run'] },
  'Hickman FF: Solve Everything': { writer: 'Jonathan Hickman', years: '2009-2010', tags: ['Essential', 'Full run'] },
  'Hickman FF: Three': { writer: 'Jonathan Hickman', years: '2010-2011', tags: ['Essential', 'Full run'] },
  'Future Foundation begins': { writer: 'Jonathan Hickman', years: '2011', tags: ['Essential', 'Full run'] },
  'Hickman FF second half 1': { writer: 'Jonathan Hickman', years: '2011-2012', tags: ['Essential', 'Full run'] },
  'Hickman FF second half 2': { writer: 'Jonathan Hickman', years: '2012', tags: ['Essential', 'Full run'] },
  'Hickman FF finale': { writer: 'Jonathan Hickman', years: '2012', tags: ['Essential', 'Full run'] },
  'X-Men: Messiah Complex': { writer: 'Multiple X-writers', years: '2007-2008', tags: ['Essential', 'Event'] },
  'X-Men: Second Coming': { writer: 'Multiple X-writers', years: '2010', tags: ['Essential', 'Event'] },
  'Uncanny X-Force part 1': { writer: 'Rick Remender', years: '2010-2011', tags: ['Essential', 'Full run'] },
  'Uncanny X-Force: Dark Angel Saga': { writer: 'Rick Remender', years: '2011', tags: ['Essential', 'Full run'] },
  'Uncanny X-Force part 3': { writer: 'Rick Remender', years: '2011-2012', tags: ['Essential', 'Full run'] },
  'Thor: The God Butcher / Godbomb': { writer: 'Jason Aaron', years: '2012-2013', tags: ['Essential'] },
  'Daredevil by Waid part 1': { writer: 'Mark Waid', years: '2011-2012', tags: ['Essential', 'Full run'] },
  'Daredevil by Waid part 2': { writer: 'Mark Waid', years: '2012-2013', tags: ['Essential', 'Full run'] },
  'Daredevil by Waid part 3': { writer: 'Mark Waid', years: '2013-2014', tags: ['Essential', 'Full run'] },
  'Daredevil by Waid vol. 4 part 1': { writer: 'Mark Waid', years: '2014', tags: ['Essential', 'Full run'] },
  'Daredevil by Waid vol. 4 part 2': { writer: 'Mark Waid', years: '2014-2015', tags: ['Essential', 'Full run'] },
  'X-Men: Schism': { writer: 'Jason Aaron', years: '2011', tags: ['Event'] },
  'Avengers vs X-Men': { writer: 'Brian Michael Bendis, Jason Aaron, Ed Brubaker, Jonathan Hickman, Matt Fraction', years: '2012', tags: ['Essential', 'Event'] },
  'Hickman Avengers opening': { writer: 'Jonathan Hickman', years: '2012-2013', tags: ['Essential', 'Full run'] },
  'Hickman New Avengers opening': { writer: 'Jonathan Hickman', years: '2013', tags: ['Essential', 'Full run'] },
  'Hickman Avengers build': { writer: 'Jonathan Hickman', years: '2013', tags: ['Essential', 'Full run'] },
  'Infinity event': { writer: 'Jonathan Hickman', years: '2013', tags: ['Essential', 'Event'] },
  'Hickman post-Infinity part 1': { writer: 'Jonathan Hickman', years: '2013-2014', tags: ['Essential', 'Full run'] },
  'Hickman post-Infinity part 2': { writer: 'Jonathan Hickman', years: '2014', tags: ['Essential', 'Full run'] },
  'Time Runs Out part 1': { writer: 'Jonathan Hickman', years: '2014', tags: ['Essential', 'Full run'] },
  'Time Runs Out part 2': { writer: 'Jonathan Hickman', years: '2014-2015', tags: ['Essential', 'Full run'] },
  'Time Runs Out part 3': { writer: 'Jonathan Hickman', years: '2015', tags: ['Essential', 'Full run'] },
  'Time Runs Out finale': { writer: 'Jonathan Hickman', years: '2015', tags: ['Essential', 'Full run'] },
  'Secret Wars 2015': { writer: 'Jonathan Hickman', years: '2015-2016', tags: ['Essential', 'Event'] }
};

phases.forEach(phase => {
  phase.blocks.forEach(block => {
    if (blockMeta[block.title]) Object.assign(block, blockMeta[block.title]);
  });
});

phases.forEach((phase, phaseIndex) => {
  phase.blocks.forEach((block, blockIndex) => {
    block.id = `${phase.id}-block-${blockIndex + 1}`;
    block.order = blockIndex + 1;
    block.phaseId = phase.id;
    block.issues = dedupeIssues(block.issues);
  });
});

let activePhaseId = phases[0].id;
let searchTerm = '';
let familyFilter = 'all';
let essentialsOnly = false;
let progress = loadProgress();
let openBlocks = new Set();

const phaseTabs = document.getElementById('phaseTabs');
const blocksContainer = document.getElementById('blocksContainer');
const searchInput = document.getElementById('searchInput');
const familySelect = document.getElementById('familyFilter');
const essentialToggle = document.getElementById('essentialToggle');
const currentPhaseLabel = document.getElementById('currentPhaseLabel');
const phaseKicker = document.getElementById('phaseKicker');
const phaseTitle = document.getElementById('phaseTitle');
const phaseDesc = document.getElementById('phaseDesc');
const visibleCount = document.getElementById('visibleCount');

function dedupeIssues(issues) {
  const seen = new Set();
  return issues.filter(issue => {
    if (seen.has(issue.key)) return false;
    seen.add(issue.key);
    return true;
  });
}

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function issueIsDone(issue) {
  return Boolean(progress[issue.key]);
}

function setIssues(issues, value) {
  issues.forEach(issue => {
    if (value) progress[issue.key] = true;
    else delete progress[issue.key];
  });
  saveProgress();
  render();
}

function getAllIssues() {
  return dedupeIssues(phases.flatMap(phase => phase.blocks.flatMap(block => block.issues)));
}

function getPhaseIssues(phase) {
  return dedupeIssues(phase.blocks.flatMap(block => block.issues));
}

function getBlockDoneCount(block) {
  return block.issues.filter(issueIsDone).length;
}

function getBlockComplete(block) {
  return block.issues.length > 0 && getBlockDoneCount(block) === block.issues.length;
}

function percentage(done, total) {
  if (!total) return 0;
  return Math.round((done / total) * 100);
}

function matchesFilters(block) {
  const haystack = [block.title, block.family, block.note, block.writer, block.years, ...(block.tags || []), ...block.issues.map(issue => issue.label)].join(' ').toLowerCase();
  const matchesSearch = !searchTerm || haystack.includes(searchTerm.toLowerCase());
  const matchesFamily = familyFilter === 'all' || block.family.includes(familyFilter);
  const matchesEssential = !essentialsOnly || (block.tags || []).includes('Essential');
  return matchesSearch && matchesFamily && matchesEssential;
}

function renderPhaseTabs() {
  phaseTabs.innerHTML = phases.map(phase => {
    const phaseIssues = getPhaseIssues(phase);
    const done = phaseIssues.filter(issueIsDone).length;
    return `
      <button class="phase-tab ${phase.id === activePhaseId ? 'active' : ''}" type="button" data-phase="${phase.id}">
        <span>${phase.name}</span>
        <small>${done}/${phaseIssues.length}</small>
      </button>
    `;
  }).join('');
}

function renderFamilyFilter() {
  const families = [...new Set(phases.flatMap(phase => phase.blocks.map(block => block.family)))].sort((a, b) => a.localeCompare(b));
  familySelect.innerHTML = '<option value="all">All families</option>' + families.map(family => `<option value="${escapeHtml(family)}">${escapeHtml(family)}</option>`).join('');
  familySelect.value = familyFilter;
}

function renderStats() {
  const allIssues = getAllIssues();
  const allDone = allIssues.filter(issueIsDone).length;
  document.getElementById('globalProgressText').textContent = `${allDone} / ${allIssues.length}`;
  document.getElementById('globalProgressBar').style.width = `${percentage(allDone, allIssues.length)}%`;

  const phase = phases.find(item => item.id === activePhaseId);
  const phaseIssues = getPhaseIssues(phase);
  const phaseDone = phaseIssues.filter(issueIsDone).length;
  document.getElementById('phaseProgressText').textContent = `${phaseDone} / ${phaseIssues.length}`;
  document.getElementById('phaseProgressBar').style.width = `${percentage(phaseDone, phaseIssues.length)}%`;

  const blocks = phases.flatMap(item => item.blocks);
  const completeBlocks = blocks.filter(getBlockComplete).length;
  document.getElementById('blockProgressText').textContent = `${completeBlocks} / ${blocks.length}`;
  currentPhaseLabel.textContent = phase.name;
}

function renderBlocks() {
  const phase = phases.find(item => item.id === activePhaseId);
  phaseKicker.textContent = phase.name;
  phaseTitle.textContent = phase.title;
  phaseDesc.textContent = phase.desc;

  const blocks = phase.blocks.filter(matchesFilters);
  visibleCount.textContent = `${blocks.length} block${blocks.length === 1 ? '' : 's'} visible`;

  if (!blocks.length) {
    blocksContainer.innerHTML = '<div class="empty-state">No blocks match your search or filter. Even the Watcher found nothing here.</div>';
    return;
  }

  blocksContainer.innerHTML = blocks.map(block => {
    const done = getBlockDoneCount(block);
    const total = block.issues.length;
    const complete = done === total && total > 0;
    const open = openBlocks.has(block.id);
    return `
      <article class="block-card ${open ? 'open' : ''} ${complete ? 'complete' : ''}" data-block="${block.id}">
        <button class="block-head" type="button" data-toggle="${block.id}" aria-expanded="${open}">
          <span class="block-number">${block.order}</span>
          <span class="block-title">
            <h3>${escapeHtml(block.title)}</h3>
            <span class="block-meta">
              <span class="badge">${escapeHtml(block.family)}</span>
              ${block.writer ? `<span class="badge writer">${escapeHtml(block.writer)}</span>` : ''}
              ${block.years ? `<span class="badge year">${escapeHtml(block.years)}</span>` : ''}
              ${(block.tags || []).map(tag => `<span class="badge ${tag === 'Essential' ? 'essential' : ''}">${escapeHtml(tag)}</span>`).join('')}
              <span class="badge">${done}/${total} issues</span>
              <span class="badge">${percentage(done, total)}%</span>
            </span>
          </span>
          <span class="chevron">${open ? '▴' : '▾'}</span>
        </button>
        <div class="block-body">
          <p class="block-note">${escapeHtml(block.note)}</p>
          ${(block.writer || block.years) ? `<p class="block-credit"><strong>Writer:</strong> ${escapeHtml(block.writer || 'Unknown')} ${block.years ? `• <strong>Years:</strong> ${escapeHtml(block.years)}` : ''}</p>` : ''}
          ${(block.tags || []).length ? `<div class="block-tags">${block.tags.map(tag => `<span class="tag-pill ${tag === 'Essential' ? 'essential' : ''}">${escapeHtml(tag)}</span>`).join('')}</div>` : ''}
          <div class="progress-shell"><div class="progress-fill" style="width:${percentage(done, total)}%"></div></div>
          <div class="block-actions">
            <button class="tool-btn" type="button" data-mark-block="${block.id}">Mark block read</button>
            <button class="tool-btn danger" type="button" data-clear-block="${block.id}">Clear block</button>
          </div>
          <div class="issue-list">
            ${block.issues.map(issue => `
              <label class="issue-item ${issueIsDone(issue) ? 'done' : ''}">
                <input type="checkbox" data-issue="${escapeAttr(issue.key)}" ${issueIsDone(issue) ? 'checked' : ''} />
                <span>${escapeHtml(issue.label)}</span>
              </label>
            `).join('')}
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function render() {
  renderPhaseTabs();
  renderStats();
  renderBlocks();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll('`', '&#096;');
}

phaseTabs.addEventListener('click', event => {
  const tab = event.target.closest('[data-phase]');
  if (!tab) return;
  activePhaseId = tab.dataset.phase;
  openBlocks.clear();
  render();
});

blocksContainer.addEventListener('click', event => {
  const toggle = event.target.closest('[data-toggle]');
  if (toggle) {
    const id = toggle.dataset.toggle;
    if (openBlocks.has(id)) openBlocks.delete(id);
    else openBlocks.add(id);
    render();
    return;
  }

  const markBlock = event.target.closest('[data-mark-block]');
  if (markBlock) {
    const block = findBlock(markBlock.dataset.markBlock);
    setIssues(block.issues, true);
    openBlocks.add(block.id);
    return;
  }

  const clearBlock = event.target.closest('[data-clear-block]');
  if (clearBlock) {
    const block = findBlock(clearBlock.dataset.clearBlock);
    setIssues(block.issues, false);
    openBlocks.add(block.id);
  }
});

blocksContainer.addEventListener('change', event => {
  const checkbox = event.target.closest('[data-issue]');
  if (!checkbox) return;
  if (checkbox.checked) progress[checkbox.dataset.issue] = true;
  else delete progress[checkbox.dataset.issue];
  saveProgress();
  render();
});

searchInput.addEventListener('input', event => {
  searchTerm = event.target.value.trim();
  renderBlocks();
});

familySelect.addEventListener('change', event => {
  familyFilter = event.target.value;
  renderBlocks();
});

essentialToggle.addEventListener('change', event => {
  essentialsOnly = event.target.checked;
  renderBlocks();
});

document.getElementById('markPhaseBtn').addEventListener('click', () => {
  const phase = phases.find(item => item.id === activePhaseId);
  setIssues(getPhaseIssues(phase), true);
});

document.getElementById('clearPhaseBtn').addEventListener('click', () => {
  const phase = phases.find(item => item.id === activePhaseId);
  setIssues(getPhaseIssues(phase), false);
});

document.getElementById('expandAllBtn').addEventListener('click', () => {
  const phase = phases.find(item => item.id === activePhaseId);
  phase.blocks.filter(matchesFilters).forEach(block => openBlocks.add(block.id));
  renderBlocks();
});

document.getElementById('collapseAllBtn').addEventListener('click', () => {
  openBlocks.clear();
  renderBlocks();
});

document.getElementById('exportBtn').addEventListener('click', () => {
  const payload = {
    exportedAt: new Date().toISOString(),
    app: 'Miclase Marvel Universe',
    progress
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'miclase-marvel-progress.json';
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById('importInput').addEventListener('change', event => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (!imported.progress || typeof imported.progress !== 'object') throw new Error('Invalid progress file');
      progress = imported.progress;
      saveProgress();
      render();
    } catch (error) {
      alert('That progress file could not be imported.');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
});

document.getElementById('resetBtn').addEventListener('click', () => {
  const confirmed = confirm('Reset all progress? This cannot be undone unless you exported a backup.');
  if (!confirmed) return;
  progress = {};
  saveProgress();
  render();
});

document.getElementById('themeToggle').addEventListener('click', () => {
  document.body.classList.toggle('light');
  const theme = document.body.classList.contains('light') ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, theme);
});

function findBlock(id) {
  return phases.flatMap(phase => phase.blocks).find(block => block.id === id);
}

function initTheme() {
  const theme = localStorage.getItem(THEME_KEY);
  if (theme === 'light') document.body.classList.add('light');
}

initTheme();
renderFamilyFilter();
render();

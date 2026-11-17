/* Alle spelgegevens: D&D 2024-regels, level 4. */
window.SF = (function () {
  'use strict';

  const ABIL = {
    STR: 'Kracht', DEX: 'Behendigheid', CON: 'Uithouding',
    INT: 'Intelligentie', WIS: 'Wijsheid', CHA: 'Charisma'
  };

  const SKILLS = [
    ['Acrobatics', 'DEX', 'Acrobatiek'],
    ['Animal Handling', 'WIS', 'Met dieren omgaan'],
    ['Arcana', 'INT', 'Magie-kennis'],
    ['Athletics', 'STR', 'Atletiek'],
    ['Deception', 'CHA', 'Liegen'],
    ['History', 'INT', 'Geschiedenis'],
    ['Insight', 'WIS', 'Mensenkennis'],
    ['Intimidation', 'CHA', 'Intimideren'],
    ['Investigation', 'INT', 'Onderzoeken'],
    ['Medicine', 'WIS', 'Medisch'],
    ['Nature', 'INT', 'Natuur'],
    ['Perception', 'WIS', 'Opmerken'],
    ['Performance', 'CHA', 'Optreden'],
    ['Persuasion', 'CHA', 'Overtuigen'],
    ['Religion', 'INT', 'Religie'],
    ['Sleight of Hand', 'DEX', 'Zakkenrollen'],
    ['Stealth', 'DEX', 'Sluipen'],
    ['Survival', 'WIS', 'Overleven']
  ];

  const PIM_SVG = '<svg viewBox="0 0 100 100" aria-hidden="true">' +
    '<path d="M50 7C79 7 93 31 93 57C93 83 74 95 50 95C26 95 7 83 7 57C7 31 21 7 50 7Z" fill="#ff8cc6" stroke="#151515" stroke-width="4"/>' +
    '<ellipse cx="24" cy="64" rx="7" ry="4" fill="#ffb8dc"/><ellipse cx="76" cy="64" rx="7" ry="4" fill="#ffb8dc"/>' +
    '<ellipse cx="36" cy="44" rx="9" ry="12" fill="#fff" stroke="#151515" stroke-width="3"/><circle cx="38" cy="46" r="4.5" fill="#151515"/>' +
    '<ellipse cx="64" cy="44" rx="9" ry="12" fill="#fff" stroke="#151515" stroke-width="3"/><circle cx="62" cy="46" r="4.5" fill="#151515"/>' +
    '<path d="M28 62Q50 88 72 62Z" fill="#7a1840" stroke="#151515" stroke-width="3" stroke-linejoin="round"/>' +
    '<path d="M41 73Q50 66 59 73Q55 79 50 79Q45 79 41 73Z" fill="#ff5d8f"/></svg>';

  const CHARLIE_SVG = '<svg viewBox="0 0 100 100" aria-hidden="true">' +
    '<ellipse cx="50" cy="57" rx="38" ry="37" fill="#ffd93d" stroke="#151515" stroke-width="4"/>' +
    '<path d="M12 54C9 24 29 7 52 7C77 7 93 25 88 54L81 41L73 51L65 37L55 49L46 35L37 49L28 37L20 51Z" fill="#3a2a1a" stroke="#151515" stroke-width="4" stroke-linejoin="round"/>' +
    '<ellipse cx="37" cy="62" rx="8" ry="9" fill="#fff" stroke="#151515" stroke-width="3"/><circle cx="37" cy="65" r="3.5" fill="#151515"/>' +
    '<path d="M28.6 61A8.4 9 0 0 1 45.4 61Z" fill="#ffd93d" stroke="#151515" stroke-width="3" stroke-linejoin="round"/>' +
    '<ellipse cx="63" cy="62" rx="8" ry="9" fill="#fff" stroke="#151515" stroke-width="3"/><circle cx="63" cy="65" r="3.5" fill="#151515"/>' +
    '<path d="M54.6 61A8.4 9 0 0 1 71.4 61Z" fill="#ffd93d" stroke="#151515" stroke-width="3" stroke-linejoin="round"/>' +
    '<path d="M49 70Q46 75 51 75" fill="none" stroke="#151515" stroke-width="2.5" stroke-linecap="round"/>' +
    '<path d="M40 83Q50 80 60 83" fill="none" stroke="#151515" stroke-width="3.5" stroke-linecap="round"/></svg>';

  const chars = {
    pim: {
      id: 'pim', name: 'Pim Pimling', short: 'Pim', svg: PIM_SVG,
      player: 'Nieuwe speler',
      line: 'Twilight Cleric 4 · Human · Farmer',
      flavor: 'Optimistisch, lief, een beetje nerveus — en hij stopt pas als de klant lacht.',
      level: 4, maxHp: 43, ac: 18, speed: 30, prof: 2, hitDie: 8,
      abilities: { STR: 13, DEX: 8, CON: 16, INT: 8, WIS: 18, CHA: 12 },
      saveProf: ['WIS', 'CHA'],
      skillProf: ['Animal Handling', 'Insight', 'Medicine', 'Nature', 'Persuasion'],
      skillBonus: { Arcana: 4, Religion: 4 },
      skillNote: { Stealth: 'nadeel door chain mail', Arcana: '+4 Thaumaturge', Religion: '+4 Thaumaturge' },
      spellDC: 14, spellAtk: 6,
      stats: [
        ['AC', '18', 'Chain mail + schild'],
        ['Spell DC', '14', 'Zo moeilijk zijn jouw spells'],
        ['Spell-aanval', '+6', 'Bij Smiley-raket en Reuzensmiley'],
        ['Speed', '30 ft', '= 6 vakjes'],
        ['Initiatief', '−1', 'Wie mag eerst?'],
        ['Proficiency', '+2', 'Bonus als je ergens goed in bent'],
        ['Passief opmerken', '14', 'Wat je ziet zonder te gooien']
      ],
      features: [
        ['Spellcasting (WIS)', 'Spell DC 14, spell-aanval +6. Cantrips zijn gratis en onbeperkt. Andere spells kosten een spell slot: 4× level 1 en 3× level 2, die komen terug na een long rest.'],
        ['Smile Zone (Twilight Sanctuary)', 'Channel Divinity. Een roze gloed van 6 vakjes rond jou. Elke vriend die zijn beurt eindigt in de zone krijgt 1d6+4 tijdelijke HP, óf je haalt angst/betovering weg.'],
        ['Channel Divinity', '2× per long rest, 1 komt terug na een short rest. Te gebruiken voor: Smile Zone, Vonkje (Divine Spark) of Wegwezen, zombies! (Turn Undead).'],
        ['Divine Order: Thaumaturge', 'Een extra cantrip en +4 op Arcana- en Religion-checks.'],
        ['Twilight Domain', 'Je mag zware armor en alle wapens gebruiken. Faerie Fire, Sleep, Moonbeam en See Invisibility heb je altijd klaarstaan.'],
        ['Nachtzicht (Eyes of Night)', 'Je ziet in het donker tot 300 ft. Met een actie deel je dat 1 uur met max. 4 vrienden binnen 10 ft (1× per long rest, of kost een spell slot).'],
        ['Wakker worden! (Vigilant Blessing)', 'Actie: iemand die je aanraakt krijgt voordeel op zijn volgende initiatief-worp.'],
        ['Human', 'Elke long rest krijg je Heroic Inspiration (1× een worp opnieuw doen). Extra skill: Persuasion. Extra feat: Lucky.'],
        ['Lucky', '2 geluk-punten per long rest. Gebruik er één voor voordeel op je eigen d20, of voor nadeel op een aanval tegen jou.'],
        ['Tough', '+8 max HP (zit al in je 43 HP).'],
        ['War Caster', 'Voordeel op concentratie-saves. Spells casten met je handen vol. Als een vijand bij je wegloopt, mag je als reactie een Sad trombone op hem doen.'],
        ['Farmer', 'Animal Handling, Nature en Carpenter\'s Tools. Feat: Tough.']
      ],
      gear: ['Chain mail (AC 16, nadeel op sluipen)', 'Schild met heilig symbool (+2 AC, je casting focus)', 'Mace (reservewapen)', 'Priester-rugzak, deken, kaarsen, eten', 'Carpenter\'s Tools'],
      profs: 'Armor: alles + schilden · Wapens: alles · Tools: Carpenter\'s Tools · Talen: Common + 2 naar keuze',
      restNote: 'Short rest: 1 Channel Divinity terug. Long rest: alles terug.'
    },
    charlie: {
      id: 'charlie', name: 'Charlie Dompler', short: 'Charlie', svg: CHARLIE_SVG,
      player: 'Ervaren speler',
      line: 'Berserker Barbarian 4 · Human · Soldier',
      flavor: 'Droog, cynisch en lui — tot hij er KLAAR mee is.',
      level: 4, maxHp: 53, ac: 15, speed: 30, prof: 2, hitDie: 12,
      abilities: { STR: 18, DEX: 14, CON: 16, INT: 8, WIS: 10, CHA: 8 },
      saveProf: ['STR', 'CON'],
      skillProf: ['Animal Handling', 'Athletics', 'Intimidation', 'Perception', 'Persuasion', 'Survival'],
      skillBonus: {},
      skillNote: {},
      rageStrSkills: ['Acrobatics', 'Intimidation', 'Perception', 'Stealth', 'Survival'],
      stats: [
        ['AC', '15', 'Unarmored Defense (10 + DEX + CON)'],
        ['Aanval', '+6', 'STR + proficiency'],
        ['Speed', '30 ft', '= 6 vakjes'],
        ['Initiatief', '+2', 'DEX'],
        ['Proficiency', '+2', ''],
        ['Rage-schade', '+2', 'Op STR-aanvallen in Rage'],
        ['Passief opmerken', '12', '']
      ],
      features: [
        ['Rage — "Ik ben er KLAAR mee"', 'Bonusactie, 3× per long rest (1 terug na short rest). Halve schade van bludgeoning/piercing/slashing, +2 schade op STR-aanvallen, voordeel op STR-checks en STR-saves. Geen spells of concentratie. Blijft aan tot het eind van je volgende beurt; verleng door aan te vallen of een bonusactie te gebruiken (max 10 min).'],
        ['Reckless Attack', 'Bij je eerste aanval van de beurt: voordeel op al je STR-aanvallen, maar vijanden krijgen tot je volgende beurt ook voordeel tegen jou.'],
        ['Frenzy (Berserker)', 'Ben je in Rage en val je Reckless aan? Dan doet je eerste raak van de beurt +2d6 extra schade.'],
        ['Great Weapon Master', '+2 schade (= proficiency) met zware wapens bij je Attack-actie. Hew: kritiek of vijand naar 0 HP? Dan mag je meteen een extra aanval doen als bonusactie.'],
        ['Savage Attacker', '1× per beurt bij een raak: gooi je wapendobbelstenen twee keer en kies de beste. De app doet dit automatisch.'],
        ['Weapon Mastery', 'Greataxe: Cleave (2e vijand naast hem ook raken). Greatsword: Graze (mis = toch 4 schade). Handaxe: Vex (raak = voordeel op je volgende aanval op hem).'],
        ['Unarmored Defense', 'Zonder armor is je AC 10 + DEX + CON = 15.'],
        ['Danger Sense', 'Voordeel op DEX-saves (vallen, explosies), tenzij je Incapacitated bent.'],
        ['Primal Knowledge', 'In Rage mag je STR gebruiken voor Acrobatics, Intimidation, Perception, Stealth en Survival. Intimideren in Rage: +6!'],
        ['Tough', '+8 max HP (zit al in je 53 HP).'],
        ['Human', 'Elke long rest krijg je Heroic Inspiration (1× een worp opnieuw doen). Extra skill: Persuasion. Extra feat: Tough.'],
        ['Soldier', 'Athletics, Intimidation en een gaming set (dobbelstenen). Feat: Savage Attacker.']
      ],
      gear: ['Greataxe (hoofdwapen)', 'Greatsword (voor bazen met hoge AC)', '4 handaxes (gooien)', 'Ontdekkingsreiziger-rugzak', 'Dobbelstenen (gaming set)'],
      profs: 'Armor: licht, medium, schilden · Wapens: alles · Tools: dobbelstenen · Talen: Common + 2 naar keuze',
      restNote: 'Short rest: 1 Rage terug. Long rest: alles terug.'
    }
  };

  const weapons = {
    greataxe: { name: 'Greataxe', sf: 'Greataxe', emoji: '🪓', n: 1, s: 12, heavy: true, melee: true, type: 'slashing', mastery: 'Cleave' },
    greatsword: { name: 'Greatsword', sf: 'Greatsword', emoji: '🗡️', n: 2, s: 6, heavy: true, melee: true, type: 'slashing', mastery: 'Graze' },
    handaxe: { name: 'Handaxe (gooien)', sf: 'Handaxe gooien', emoji: '🪃', n: 1, s: 6, heavy: false, melee: false, type: 'slashing', mastery: 'Vex' },
    unarmed: { name: 'Vuistslag', sf: 'Klap', emoji: '👊', n: 0, s: 0, flat: 1, heavy: false, melee: true, type: 'bludgeoning', mastery: '' }
  };

  /* time: action | bonus | reaction | free | none */
  const spells = {
    toll: { name: 'Toll the Dead', sf: 'Sad trombone', emoji: '🎺', level: 0, time: 'action', range: '60 ft', dur: 'Meteen',
      wat: 'Een treurig "wah-wah-waaah" klinkt bij een vijand. Hij gooit een WIS-save tegen DC 14. Faalt hij: 1d8 necrotic schade, of 1d12 als hij al gewond is. Haalt hij hem: niks.',
      wanneer: 'Je standaard-aanval. Elke beurt als je niks beters hebt. Kost niks!' },
    sacred: { name: 'Sacred Flame', sf: 'Glitterstraal', emoji: '✨', level: 0, time: 'action', range: '60 ft', dur: 'Meteen',
      wat: 'Een straal glitterlicht valt op een vijand. DEX-save tegen DC 14; faalt hij: 1d8 radiant. Dekking (muurtje, boom) helpt hem niet.',
      wanneer: 'Als de vijand achter iets staat, of als het een slimme/wijze vijand is (priester, magiër).' },
    guidance: { name: 'Guidance', sf: 'Je kan het!', emoji: '👍', level: 0, time: 'action', range: 'Aanraken', dur: '1 minuut', conc: true,
      wat: 'Je moedigt iemand aan. Kies een skill (bv. Persuasion): die persoon telt 1d4 op bij checks met die skill.',
      wanneer: 'Vlak vóór een gesprek, slot openen of klimpartij. Niet in gevechten (kost je concentratie).' },
    thaumaturgy: { name: 'Thaumaturgy', sf: 'Dramatisch momentje', emoji: '🎭', level: 0, time: 'action', range: '30 ft', dur: '1 minuut',
      wat: 'Kleine magische show: je stem klinkt 3× zo hard, vlammen flikkeren, deuren slaan dicht of je ogen veranderen van kleur.',
      wanneer: 'Rollenspel! Indruk maken, mensen laten schrikken of gewoon voor de lol.' },
    spare: { name: 'Spare the Dying', sf: 'Pleister', emoji: '🩹', level: 0, time: 'action', range: '15 ft', dur: 'Meteen',
      wat: 'Iemand op 0 HP wordt stabiel: hij hoeft geen death saves meer te gooien (maar blijft wel bewusteloos).',
      wanneer: 'Noodgeval zonder spell slots. Heb je nog slots? Gebruik liever Peptalk: dan staat hij meteen weer op.' },
    bless: { name: 'Bless', sf: 'Gouden sterretje', emoji: '⭐', level: 1, time: 'action', range: '30 ft', dur: '1 minuut', conc: true,
      wat: 'Tot 3 wezens (jij + Charlie) tellen 1d4 op bij elke aanval en elke saving throw.',
      wanneer: 'Bij een zware baas-fight. Charlie raakt dan veel vaker.', upcast: 'Met slot 2: 1 wezen extra.' },
    healingWord: { name: 'Healing Word', sf: 'Peptalk', emoji: '💬', level: 1, time: 'bonus', range: '60 ft', dur: 'Meteen',
      wat: 'Een paar lieve woorden en iemand krijgt 2d4+4 HP terug. Ligt hij op 0 HP? Dan staat hij meteen weer op!',
      wanneer: 'Iemand ligt neer of is bijna neer. Het is een bonusactie, dus je kan daarna nog een cantrip doen.', upcast: 'Met slot 2: 4d4+4.' },
    guidingBolt: { name: 'Guiding Bolt', sf: 'Smiley-raket', emoji: '🚀', level: 1, time: 'action', range: '120 ft', dur: '1 ronde',
      wat: 'Een lichtflits schiet naar een vijand (aanval +6). Raak: 4d6 radiant, en de volgende aanval op dat doelwit krijgt voordeel.',
      wanneer: 'Als je één keer flink schade wilt doen op afstand.', upcast: 'Met slot 2: 5d6.' },
    command: { name: 'Command', sf: 'Smile!', emoji: '📢', level: 1, time: 'action', range: '60 ft', dur: '1 ronde',
      wat: 'Je roept één woord. Het doelwit gooit een WIS-save (DC 14); faalt hij, dan doet hij dat in zijn volgende beurt: Approach (kom hier), Drop (laat vallen), Flee (ren weg), Grovel (ga liggen) of Halt (sta stil).',
      wanneer: 'Wapen laten vallen, vijand laten wegrennen, of laten liggen (Grovel = makkelijk te raken voor Charlie).', upcast: 'Met slot 2: 2 doelwitten.' },
    faerieFire: { name: 'Faerie Fire', sf: 'Discolicht', emoji: '🪩', level: 1, time: 'action', range: '60 ft', dur: '1 minuut', conc: true, domain: true,
      wat: 'Een kubus van 20 ft (4×4 vakjes) roze discolicht. Wie de DEX-save (DC 14) faalt, licht op: alle aanvallen tegen hem krijgen voordeel en hij kan niet onzichtbaar zijn.',
      wanneer: 'Tegen onzichtbare of verstopte vijanden.' },
    sleep: { name: 'Sleep', sf: 'Slaapliedje', emoji: '😴', level: 1, time: 'action', range: '60 ft', dur: '1 minuut', conc: true, domain: true,
      wat: 'Bol van 5 ft rond een punt (ongeveer 2×2 vakjes). Elke vijand daarin gooit een WIS-save (DC 14). Faalt hij: hij kan niks doen tot het eind van zijn volgende beurt. Faalt hij dan nóg een keer: hij slaapt. Schade of wakker schudden maakt hem wakker.',
      wanneer: 'Een paar vijanden dicht bij elkaar. Werkt niet op elfen en wezens die niet slapen (zoals ondoden).' },
    spiritualWeapon: { name: 'Spiritual Weapon', sf: 'Reuzensmiley', emoji: '😁', level: 2, time: 'bonus', range: '60 ft', dur: '1 minuut', conc: true,
      wat: 'Er verschijnt een zwevende reuzensmiley die meteen aanvalt (+6): 1d8+4 force. In je volgende beurten: bonusactie = smiley 20 ft bewegen en opnieuw aanvallen. Dat kost geen slot meer!',
      wanneer: 'Ronde 1 van elk serieus gevecht. Daarna elke beurt gratis extra schade.' },
    aid: { name: 'Aid', sf: 'Ochtendpeptalk', emoji: '☀️', level: 2, time: 'action', range: '30 ft', dur: '8 uur',
      wat: 'Tot 3 wezens krijgen 8 uur lang +5 max HP (en +5 HP erbij).',
      wanneer: 'Elke ochtend, meteen na de long rest. Gratis extra leven voor de hele dag.' },
    holdPerson: { name: 'Hold Person', sf: 'Freeze-frame', emoji: '🧊', level: 2, time: 'action', range: '60 ft', dur: '1 minuut', conc: true,
      wat: 'Een humanoid (mens, elf, dwerg, goblin, orc…) gooit een WIS-save (DC 14). Faalt hij: hij is verlamd (Paralyzed). Aan het eind van elk van zijn beurten mag hij opnieuw proberen.',
      wanneer: 'Tegen een gevaarlijke humanoid-baas. Staat Charlie naast hem? Dan is elke raak automatisch KRITIEK.' },
    moonbeam: { name: 'Moonbeam', sf: 'Discobal-straal', emoji: '🌙', level: 2, time: 'action', range: '120 ft', dur: '1 minuut', conc: true, domain: true,
      wat: 'Een lichtzuil (5 ft straal). Wie erin staat of erin komt: CON-save (DC 14), 2d10 radiant (half bij een geslaagde save). Latere beurten: actie om hem 60 ft te verplaatsen.',
      wanneer: 'Een sterke vijand die niet snel wegloopt, of vijanden in een smalle gang.' },
    seeInvis: { name: 'See Invisibility', sf: 'Röntgenbril', emoji: '👓', level: 2, time: 'action', range: 'Jezelf', dur: '1 uur', domain: true,
      wat: 'Je ziet onzichtbare wezens en dingen.',
      wanneer: 'Als de DM zegt dat er iets onzichtbaars rondloopt.' },
    smileZone: { name: 'Twilight Sanctuary', sf: 'Smile Zone', emoji: '🌈', level: 'cd', time: 'action', range: '30 ft rond jou', dur: '1 minuut (10 rondes)',
      wat: 'Een roze gloed van 30 ft (6 vakjes) rond jou, die met je meeloopt. Elke vriend die zijn beurt eindigt in de zone krijgt 1d6+4 tijdelijke HP, óf je haalt angst (Frightened) of betovering (Charmed) bij hem weg.',
      wanneer: 'Beurt 1 van elk gevecht. Altijd. Dit is je superkracht.' },
    divineSpark: { name: 'Divine Spark', sf: 'Vonkje', emoji: '⚡', level: 'cd', time: 'action', range: '30 ft', dur: 'Meteen',
      wat: 'Kies: iemand krijgt 1d8+4 HP, óf een vijand gooit een CON-save (DC 14) en krijgt 1d8+4 radiant (half bij een geslaagde save).',
      wanneer: 'Als de Smile Zone al aanstaat en je nog een Channel Divinity over hebt.' },
    turnUndead: { name: 'Turn Undead', sf: 'Wegwezen, zombies!', emoji: '🧟', level: 'cd', time: 'action', range: '30 ft', dur: '1 minuut',
      wat: 'Elke ondode (skelet, zombie, geest…) naar keuze binnen 30 ft gooit een WIS-save (DC 14). Faalt hij: 1 minuut bang en uitgeschakeld, hij rent bij je weg. Stopt als hij schade krijgt.',
      wanneer: 'Veel ondoden tegelijk.' },
    vigilant: { name: 'Vigilant Blessing', sf: 'Wakker worden!', emoji: '⏰', level: 'free', time: 'action', range: 'Aanraken', dur: 'Tot het volgende gevecht',
      wat: 'Iemand (jij of Charlie) krijgt voordeel op zijn volgende initiatief-worp.',
      wanneer: 'Vlak vóór een gevecht, als je weet dat het eraan komt.' },
    eyes: { name: 'Eyes of Night', sf: 'Nachtzicht delen', emoji: '🌌', level: 'free', time: 'action', range: '10 ft', dur: '1 uur',
      wat: 'Je deelt je nachtzicht (300 ft) met max. 4 vrienden. 1× per long rest gratis, daarna kost het een spell slot.',
      wanneer: 'Grotten, nacht, kerkers. Charlie ziet dan ook in het donker.' },
    mace: { name: 'Mace', sf: 'Knuppel', emoji: '🔨', level: 'free', time: 'action', range: 'Naast je', dur: 'Meteen',
      wat: 'Wapenaanval +3, 1d6+1 bludgeoning.',
      wanneer: 'Bijna nooit: Sad trombone doet meer.' }
  };

  const spellGroups = [
    ['Superkrachten (Channel Divinity)', ['smileZone', 'divineSpark', 'turnUndead']],
    ['Cantrips — gratis, onbeperkt', ['toll', 'sacred', 'guidance', 'thaumaturgy', 'spare']],
    ['Level 1 spells', ['bless', 'healingWord', 'guidingBolt', 'command', 'faerieFire', 'sleep']],
    ['Level 2 spells', ['spiritualWeapon', 'aid', 'holdPerson', 'moonbeam', 'seeInvis']],
    ['Overige', ['vigilant', 'eyes', 'mace']]
  ];

  const charlieActions = [
    { id: 'rage', emoji: '😤', sf: 'Rage', sub: '"Ik ben er KLAAR mee."', time: 'bonus',
      wat: 'Halve schade van wapens, +2 schade, voordeel op STR-checks en -saves. Geen spells.', wanneer: 'Begin van elk gevecht.' },
    { id: 'atk-greataxe', emoji: '🪓', sf: 'Greataxe', sub: '+6 · 1d12+4 slashing', time: 'action',
      wat: '+2 Rage, +2 GWM, Frenzy +2d6 op je eerste raak (Rage + Reckless). Cleave: raak je, sla dan ook een 2e vijand naast hem (1d12 + Rage).', wanneer: 'Je standaard-aanval.' },
    { id: 'atk-greatsword', emoji: '🗡️', sf: 'Greatsword', sub: '+6 · 2d6+4 slashing', time: 'action',
      wat: 'Zelfde bonussen als de greataxe. Graze: mis je, dan doe je toch 4 schade.', wanneer: 'Eén grote baas met hoge AC.' },
    { id: 'atk-handaxe', emoji: '🪃', sf: 'Handaxe gooien', sub: '+6 · 1d6+4 · 20/60 ft', time: 'action',
      wat: '+2 Rage. Vex: raak = voordeel op je volgende aanval tegen hem.', wanneer: 'Vijand te ver weg om naartoe te lopen.' },
    { id: 'shove', emoji: '🤼', sf: 'Duwen / vastpakken', sub: 'Save DC 14', time: 'action',
      wat: 'In plaats van een aanval: de vijand gooit een STR- of DEX-save tegen DC 14. Faalt hij: 5 ft wegduwen, omver (Prone), of vastgepakt (Grappled).', wanneer: 'Iemand van een rand duwen of vasthouden.' },
    { id: 'help', emoji: '🤝', sf: 'Helpen praten', sub: 'Help-actie', time: 'action',
      wat: 'Jij hebt ook Persuasion, dus je mag Pim helpen: hij gooit met voordeel.', wanneer: 'Als Pim iemand probeert te overtuigen.' },
    { id: 'intimidate', emoji: '😠', sf: 'Bad cop', sub: 'Intimidation +1 (in Rage +6)', time: 'none',
      wat: 'In Rage gebruik je STR voor Intimidation.', wanneer: 'Als Pims vriendelijke aanpak niet werkt.' }
  ];

  const rules = [
    ['🕐', 'Jouw beurt', [
      '<b>Beweging</b>: 30 ft = 6 vakjes. Je mag het opsplitsen (lopen, iets doen, weer lopen).',
      '<b>1 Actie</b>: aanvallen, een spell, Dash (dubbel lopen), Dodge (ontwijken), Help…',
      '<b>1 Bonusactie</b>: alleen als iets zegt dat het een bonusactie is (Peptalk, Reuzensmiley, Rage).',
      '<b>1 Reactie</b> per ronde, ook in andermans beurt (bv. als een vijand bij je wegloopt).',
      'Kleine dingen zijn gratis: deur open, iets oppakken, een paar woorden zeggen.'
    ]],
    ['🎲', 'Gooien', [
      '<b>d20 + bonus</b> en zo hoog mogelijk. Er zijn drie soorten: <b>aanval</b> (tegen AC), <b>saving throw</b> (jezelf redden, tegen een DC) en <b>check</b> (iets proberen, tegen een DC).',
      '<b>Voordeel</b>: 2× d20, hoogste telt. <b>Nadeel</b>: 2× d20, laagste telt. Heb je allebei? Dan heffen ze elkaar op.',
      '<b>20 op de dobbelsteen</b> bij een aanval = kritiek: alle schadedobbelstenen dubbel. <b>1</b> = altijd mis.',
      'Weet je niet wat je moet gooien? Vraag het aan de DM. Hij zegt bv. "Wisdom (Perception) check".'
    ]],
    ['✨', 'Spells', [
      '<b>Cantrips</b> zijn gratis en onbeperkt.',
      'Andere spells kosten een <b>spell slot</b>. Die komen terug na een long rest.',
      '2024-regel: <b>max 1 spell slot per beurt</b>. Peptalk (bonusactie) + Sad trombone (actie) mag dus wel, twee slot-spells niet.',
      '<b>DC 14</b>: zo hoog moet een vijand gooien om jouw spell te ontwijken.'
    ]],
    ['🧠', 'Concentratie', [
      'Sommige spells (Gouden sterretje, Reuzensmiley, Freeze-frame…) vragen concentratie. Je kan er maar <b>1 tegelijk</b> hebben.',
      'Begin je een nieuwe, dan stopt de oude.',
      'Word je geraakt? Dan gooi je een CON-save: DC 10, of de helft van de schade als dat meer is. Met War Caster gooi je met voordeel. De app doet dit voor je.',
      'Ga je naar 0 HP, dan stopt je concentratie.'
    ]],
    ['❤️', 'HP en neergaan', [
      '<b>Tijdelijke HP</b> gaan er eerst af. Ze stapelen niet: krijg je nieuwe, dan kies je het hoogste getal.',
      'Op <b>0 HP</b> ben je bewusteloos. Elke beurt gooi je een <b>death save</b>: 10 of hoger = goed, lager = fout.',
      '3× goed = stabiel. 3× fout = dood. Een 1 telt als 2× fout, een 20 = je staat op met 1 HP.',
      'Krijg je heling (Peptalk!)? Dan sta je meteen weer op.'
    ]],
    ['🛌', 'Rusten', [
      '<b>Short rest</b> (1 uur): gebruik Hit Dice om te helen. Pim krijgt 1 Channel Divinity terug, Charlie 1 Rage.',
      '<b>Long rest</b> (8 uur): alles terug: HP, spell slots, Hit Dice, Lucky, Heroic Inspiration.',
      'Vraag gerust om een short rest na een zwaar gevecht. Dan krijg je je Smile Zone terug!'
    ]],
    ['🏃', 'Handige acties', [
      '<b>Dash</b>: nog eens 6 vakjes lopen. <b>Disengage</b>: weglopen zonder dat vijanden je mogen slaan.',
      '<b>Dodge</b>: aanvallen tegen jou krijgen nadeel. <b>Help</b>: een vriend krijgt voordeel (bij een check moet je die skill zelf hebben).',
      '<b>Opportunity attack</b>: loop je weg uit het bereik van een vijand, dan mag hij je 1× slaan (met zijn reactie).'
    ]],
    ['📚', 'Woordenlijst', [
      '<b>AC</b> (Armor Class): hoe moeilijk je te raken bent. <b>DC</b>: hoe hoog je moet gooien.',
      '<b>HP</b>: levenspunten. <b>Proficiency</b>: je bent ergens goed in, je krijgt +2.',
      '<b>Save</b>: gooien om iets te ontwijken. <b>Check</b>: gooien om iets te proberen.',
      '<b>Ronde</b>: iedereen 1 beurt, ongeveer 6 seconden. <b>5 ft</b> = 1 vakje.',
      '<b>Humanoid</b>: mensachtig (mens, elf, dwerg, goblin, orc). <b>Undead</b>: ondood (skelet, zombie).',
      '<b>Frightened</b>: bang. <b>Charmed</b>: betoverd. <b>Paralyzed</b>: verlamd. <b>Prone</b>: ligt op de grond. <b>Incapacitated</b>: kan niks doen.'
    ]]
  ];

  const team = {
    combos: [
      ['🌈 + 😤', 'Smile Zone + Rage', 'Charlie krijgt elke beurt ~7 tijdelijke HP én halve schade. Hij kan voluit roekeloos aanvallen.'],
      ['🧊 + 🪓', 'Freeze-frame + Greataxe', 'Pim verlamt een humanoid-baas. Charlie staat ernaast: elke raak is kritiek (dubbele dobbelstenen), daarna meteen Hew voor een extra klap.'],
      ['☀️', 'Ochtendpeptalk (Aid)', 'Elke ochtend +5 max HP voor jullie allebei.'],
      ['⏰', 'Wakker worden!', 'Vlak voor een gevecht: Charlie krijgt voordeel op initiatief en mept als eerste.'],
      ['💬 + 🤝 + 👍', 'Praten', 'Pim praat (Persuasion +3), Charlie helpt (voordeel), Pim casted vooraf "Je kan het!" (+1d4).'],
      ['😇 + 😠', 'Good cop / bad cop', 'Pim is lief. Werkt dat niet? Dan gaat Charlie in Rage en intimideert met +6.']
    ],
    pim: [
      'Je gelooft echt in het goede van iedereen, zelfs als ze duidelijk liegen.',
      'Je eed bestaat uit de twee gouden regels van Smiling Friends: weiger nooit een opdracht, en stop pas als de klant lacht.',
      'Je bent snel nerveus, maar je bent altijd als eerste bereid om te helpen.',
      'Je spells zijn vrolijk: roze glitter, smileys, discolicht.'
    ],
    charlie: [
      'Je zegt hardop wat iedereen denkt, en het liefst op de droogste toon.',
      'Je hebt meestal geen zin, maar je laat Pim nooit vallen.',
      'Vecht je? Dan ben je er KLAAR mee: alle ingehouden frustratie komt eruit.',
      'Je vindt de meeste opdrachten belachelijk, en meestal heb je gelijk.'
    ],
    names: [
      ['Twilight Sanctuary', 'Smile Zone'], ['Spiritual Weapon', 'Reuzensmiley'], ['Toll the Dead', 'Sad trombone'],
      ['Healing Word', 'Peptalk'], ['Aid', 'Ochtendpeptalk'], ['Hold Person', 'Freeze-frame'], ['Bless', 'Gouden sterretje'],
      ['Guiding Bolt', 'Smiley-raket'], ['Command', 'Smile!'], ['Rage', '"Ik ben er KLAAR mee"'],
      ['Reckless Attack', 'Het kan me niks schelen'], ['Frenzy', 'Charlie flipt']
    ]
  };

  return { ABIL, SKILLS, chars, weapons, spells, spellGroups, charlieActions, rules, team };
})();

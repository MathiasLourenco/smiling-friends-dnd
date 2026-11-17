/* Alle spelgegevens: D&D 2024-regels, level 4. Officiële namen, korte uitleg. */
window.SF = (function () {
  'use strict';

  const ABIL = {
    STR: 'Kracht', DEX: 'Behendigheid', CON: 'Uithouding',
    INT: 'Intelligentie', WIS: 'Wijsheid', CHA: 'Charisma'
  };

  const SKILLS = [
    ['Acrobatics', 'DEX', 'Acrobatiek'],
    ['Animal Handling', 'WIS', 'Dieren'],
    ['Arcana', 'INT', 'Magie'],
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
      id: 'pim', name: 'Pim Pimling', short: 'Pim', svg: PIM_SVG, player: 'Nieuwe speler',
      line: 'Twilight Cleric 4 · Human · Farmer',
      level: 4, maxHp: 43, ac: 18, speed: 30, prof: 2, hitDie: 8,
      abilities: { STR: 13, DEX: 8, CON: 16, INT: 8, WIS: 18, CHA: 12 },
      saveProf: ['WIS', 'CHA'],
      skillProf: ['Animal Handling', 'Insight', 'Medicine', 'Nature', 'Persuasion'],
      skillBonus: { Arcana: 4, Religion: 4 },
      stats: [['AC', '18'], ['Spell DC', '14'], ['Spell-aanval', '+6'], ['Speed', '30 ft'], ['Initiatief', '−1'], ['Proficiency', '+2'], ['Passive Perception', '14']],
      features: [
        ['Twilight Sanctuary', 'Channel Divinity. 30 ft rond jou, 1 minuut: wie zijn beurt erin eindigt krijgt 1d6+4 tijdelijke HP.'],
        ['Channel Divinity', '2× per long rest, 1 terug na een short rest.'],
        ['Spellcasting', 'Spell DC 14, spell-aanval +6. Slots: 4× level 1, 3× level 2.'],
        ['Thaumaturge', 'Extra cantrip, +4 op Arcana en Religion.'],
        ['Twilight Domain', 'Zware armor en alle wapens. Darkvision 300 ft (Eyes of Night). Vigilant Blessing.'],
        ['Lucky', '2 punten: voordeel op je eigen d20, of nadeel op een aanval tegen jou.'],
        ['War Caster', 'Voordeel op concentratie-saves. Spell als opportunity attack.'],
        ['Tough', '+8 max HP.'],
        ['Human', 'Heroic Inspiration na elke long rest.']
      ],
      gear: ['Chain mail', 'Shield met holy symbol', 'Mace', 'Priest\'s Pack', 'Carpenter\'s Tools'],
      profs: 'Armor: alles + shields · Wapens: alles · Talen: Common + 2'
    },
    charlie: {
      id: 'charlie', name: 'Charlie Dompler', short: 'Charlie', svg: CHARLIE_SVG, player: 'Ervaren speler',
      line: 'Berserker Barbarian 4 · Human · Soldier',
      level: 4, maxHp: 53, ac: 15, speed: 30, prof: 2, hitDie: 12,
      abilities: { STR: 18, DEX: 14, CON: 16, INT: 8, WIS: 10, CHA: 8 },
      saveProf: ['STR', 'CON'],
      skillProf: ['Animal Handling', 'Athletics', 'Intimidation', 'Perception', 'Persuasion', 'Survival'],
      skillBonus: {},
      rageStrSkills: ['Acrobatics', 'Intimidation', 'Perception', 'Stealth', 'Survival'],
      stats: [['AC', '15'], ['Aanval', '+6'], ['Speed', '30 ft'], ['Initiatief', '+2'], ['Proficiency', '+2'], ['Rage-schade', '+2'], ['Passive Perception', '12']],
      features: [
        ['Rage', '3× per long rest (1 terug na short rest). Halve wapenschade, +2 schade, voordeel op STR.'],
        ['Reckless Attack', 'Voordeel op je aanvallen, maar vijanden ook tegen jou.'],
        ['Frenzy', 'Rage + Reckless: +2d6 op je eerste raak per beurt.'],
        ['Great Weapon Master', '+2 schade met zware wapens. Hew: extra aanval na kritiek of kill.'],
        ['Savage Attacker', '1× per beurt schade 2× gooien, beste telt.'],
        ['Weapon Mastery', 'Cleave (greataxe), Graze (greatsword), Vex (handaxe).'],
        ['Danger Sense', 'Voordeel op DEX-saves.'],
        ['Primal Knowledge', 'In Rage: STR voor Intimidation, Perception, Stealth, Survival en Acrobatics.'],
        ['Tough', '+8 max HP.'],
        ['Human', 'Heroic Inspiration na elke long rest.']
      ],
      gear: ['Greataxe', 'Greatsword', '4 handaxes', 'Explorer\'s Pack', 'Dice set'],
      profs: 'Armor: licht, medium, shields · Wapens: alles · Talen: Common + 2'
    }
  };

  const weapons = {
    greataxe: { name: 'Greataxe', emoji: '🪓', n: 1, s: 12, heavy: true, melee: true, type: 'slashing' },
    greatsword: { name: 'Greatsword', emoji: '🗡️', n: 2, s: 6, heavy: true, melee: true, type: 'slashing' },
    handaxe: { name: 'Handaxe', emoji: '🪃', n: 1, s: 6, heavy: false, melee: false, type: 'slashing' }
  };

  /* time: action | bonus | reaction | none */
  const spells = {
    toll: { name: 'Toll the Dead', emoji: '🔔', level: 0, time: 'action', range: '60 ft',
      wat: 'WIS-save (DC 14). Faalt: 1d8 necrotic, of 1d12 als hij al gewond is.' },
    sacred: { name: 'Sacred Flame', emoji: '🔥', level: 0, time: 'action', range: '60 ft',
      wat: 'DEX-save (DC 14). Faalt: 1d8 radiant. Dekking helpt niet.' },
    guidance: { name: 'Guidance', emoji: '👍', level: 0, time: 'action', range: 'Aanraken', conc: true,
      wat: 'Iemand krijgt +1d4 op checks met één skill (1 minuut).' },
    thaumaturgy: { name: 'Thaumaturgy', emoji: '🎭', level: 0, time: 'action', range: '30 ft',
      wat: 'Klein magisch effect: luide stem, flikkerende vlammen, dichtslaande deuren.' },
    spare: { name: 'Spare the Dying', emoji: '🩹', level: 0, time: 'action', range: '15 ft',
      wat: 'Iemand op 0 HP wordt stabiel.' },
    bless: { name: 'Bless', emoji: '⭐', level: 1, time: 'action', range: '30 ft', conc: true, up: true,
      wat: 'Tot 3 wezens: +1d4 op aanvallen en saves (1 minuut).' },
    healingWord: { name: 'Healing Word', emoji: '💬', level: 1, time: 'bonus', range: '60 ft', up: true,
      wat: '2d4+4 HP. Ligt iemand op 0 HP, dan staat hij weer op.' },
    guidingBolt: { name: 'Guiding Bolt', emoji: '☄️', level: 1, time: 'action', range: '120 ft', up: true,
      wat: 'Aanval +6: 4d6 radiant. Volgende aanval op het doelwit krijgt voordeel.' },
    command: { name: 'Command', emoji: '📢', level: 1, time: 'action', range: '60 ft', up: true,
      wat: 'WIS-save (DC 14). Faalt: hij doet Approach, Drop, Flee, Grovel of Halt.' },
    faerieFire: { name: 'Faerie Fire', emoji: '🟣', level: 1, time: 'action', range: '60 ft', conc: true,
      wat: '20 ft kubus, DEX-save (DC 14). Faalt: aanvallen tegen hem krijgen voordeel.' },
    sleep: { name: 'Sleep', emoji: '😴', level: 1, time: 'action', range: '60 ft', conc: true,
      wat: '5 ft bol, WIS-save (DC 14). Faalt: Incapacitated, bij een 2e fail slaapt hij.' },
    spiritualWeapon: { name: 'Spiritual Weapon', emoji: '🔨', level: 2, time: 'bonus', range: '60 ft', conc: true,
      wat: 'Zwevend wapen, aanval +6: 1d8+4 force. Volgende beurten: bonusactie om opnieuw aan te vallen.' },
    aid: { name: 'Aid', emoji: '☀️', level: 2, time: 'action', range: '30 ft',
      wat: 'Tot 3 wezens: +5 max HP, 8 uur lang.' },
    holdPerson: { name: 'Hold Person', emoji: '🧊', level: 2, time: 'action', range: '60 ft', conc: true,
      wat: 'Humanoid, WIS-save (DC 14). Faalt: Paralyzed. Raak van dichtbij = kritiek.' },
    moonbeam: { name: 'Moonbeam', emoji: '🌙', level: 2, time: 'action', range: '120 ft', conc: true,
      wat: 'Lichtzuil, CON-save (DC 14): 2d10 radiant, half bij een gehaalde save.' },
    seeInvis: { name: 'See Invisibility', emoji: '👓', level: 2, time: 'action', range: 'Jezelf',
      wat: 'Je ziet onzichtbare wezens (1 uur).' },
    sanctuary: { name: 'Twilight Sanctuary', emoji: '🌅', level: 'cd', time: 'action', range: '30 ft',
      wat: '1 minuut. Wie zijn beurt erin eindigt: 1d6+4 tijdelijke HP, of Charmed/Frightened weg.' },
    divineSpark: { name: 'Divine Spark', emoji: '⚡', level: 'cd', time: 'action', range: '30 ft',
      wat: '1d8+4 HP helen, of schade (CON-save DC 14, half bij gehaald).' },
    turnUndead: { name: 'Turn Undead', emoji: '💀', level: 'cd', time: 'action', range: '30 ft',
      wat: 'Ondoden: WIS-save (DC 14). Faalt: Frightened en Incapacitated.' },
    vigilant: { name: 'Vigilant Blessing', emoji: '⏰', level: 'free', time: 'action', range: 'Aanraken',
      wat: 'Iemand krijgt voordeel op zijn volgende initiatief.' },
    eyes: { name: 'Eyes of Night', emoji: '🌌', level: 'free', time: 'action', range: '10 ft',
      wat: 'Deel je darkvision (300 ft) 1 uur met max. 4 vrienden.' }
  };

  const spellGroups = [
    ['Channel Divinity', ['sanctuary', 'divineSpark', 'turnUndead']],
    ['Cantrips (gratis)', ['toll', 'sacred', 'guidance', 'thaumaturgy', 'spare']],
    ['Level 1', ['bless', 'healingWord', 'guidingBolt', 'command', 'faerieFire', 'sleep']],
    ['Level 2', ['spiritualWeapon', 'aid', 'holdPerson', 'moonbeam', 'seeInvis']],
    ['Overig', ['vigilant', 'eyes']]
  ];

  const charlieActions = [
    { id: 'rage', emoji: '😤', name: 'Rage', time: 'bonus', act: ['rage'],
      wat: 'Halve wapenschade, +2 schade, voordeel op STR-checks en -saves.' },
    { id: 'greataxe', emoji: '🪓', name: 'Greataxe', time: 'action', act: ['atk', 'greataxe'],
      wat: '+6, 1d12+4 slashing. Cleave: raak je, dan mag je een vijand ernaast ook aanvallen.' },
    { id: 'greatsword', emoji: '🗡️', name: 'Greatsword', time: 'action', act: ['atk', 'greatsword'],
      wat: '+6, 2d6+4 slashing. Graze: mis je, dan toch 4 schade.' },
    { id: 'handaxe', emoji: '🪃', name: 'Handaxe (gooien)', time: 'action', act: ['atk', 'handaxe'],
      wat: '+6, 20/60 ft, 1d6+4. Vex: raak = voordeel op je volgende aanval.' },
    { id: 'shove', emoji: '🤼', name: 'Shove / Grapple', time: 'action', act: ['shove'],
      wat: 'STR- of DEX-save (DC 14). Faalt: wegduwen, Prone of Grappled.' },
    { id: 'help', emoji: '🤝', name: 'Help', time: 'action', act: ['helpTalk'],
      wat: 'Pim krijgt voordeel op zijn check (jij hebt ook Persuasion).' },
    { id: 'intimidate', emoji: '😠', name: 'Intimidation', time: 'none', act: ['skill', 'Intimidation'],
      wat: 'In Rage gebruik je STR: +6 met voordeel.' }
  ];

  const rules = [
    ['🤝', 'Samen sterk', [
      'Twilight Sanctuary + Rage: Charlie krijgt tijdelijke HP én halve schade.',
      'Hold Person + Charlie ernaast: elke raak is kritiek.',
      'Praten: Pim doet Persuasion, Charlie gebruikt Help (voordeel).'
    ]],
    ['🕐', 'Jouw beurt', [
      'Beweging: 30 ft (6 vakjes).',
      '1 actie: aanval, spell, Dash, Dodge, Help…',
      '1 bonusactie, alleen als iets dat zegt.',
      '1 reactie per ronde, ook in andermans beurt.'
    ]],
    ['🎲', 'Gooien', [
      'd20 + bonus. Aanval tegen AC, save of check tegen DC.',
      'Voordeel: 2× d20, hoogste telt. Nadeel: laagste telt.',
      '20 bij een aanval = kritiek (dubbele schadedobbelstenen). 1 = mis.'
    ]],
    ['✨', 'Spells', [
      'Cantrips zijn gratis. Andere spells kosten een spell slot.',
      'Max 1 spell slot per beurt.',
      'Concentratie: maar 1 spell tegelijk. Geraakt? CON-save (de app gooit hem).'
    ]],
    ['❤️', 'HP', [
      'Tijdelijke HP gaan er eerst af en stapelen niet.',
      '0 HP: elke beurt een death save. 10+ = goed. 3× goed = stabiel, 3× fout = dood.',
      'Healing Word zet je meteen weer op.'
    ]],
    ['🛌', 'Rusten', [
      'Short rest (1 uur): Hit Dice voor HP. Pim krijgt 1 Channel Divinity terug, Charlie 1 Rage.',
      'Long rest (8 uur): alles terug.'
    ]]
  ];

  return { ABIL, SKILLS, chars, weapons, spells, spellGroups, charlieActions, rules };
})();

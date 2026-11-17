/* Game data: D&D 2024 rules, level 4. */
window.SF = (function () {
  'use strict';

  const ABIL = {
    STR: 'Strength', DEX: 'Dexterity', CON: 'Constitution',
    INT: 'Intelligence', WIS: 'Wisdom', CHA: 'Charisma'
  };

  const SKILLS = [
    ['Acrobatics', 'DEX'], ['Animal Handling', 'WIS'], ['Arcana', 'INT'], ['Athletics', 'STR'],
    ['Deception', 'CHA'], ['History', 'INT'], ['Insight', 'WIS'], ['Intimidation', 'CHA'],
    ['Investigation', 'INT'], ['Medicine', 'WIS'], ['Nature', 'INT'], ['Perception', 'WIS'],
    ['Performance', 'CHA'], ['Persuasion', 'CHA'], ['Religion', 'INT'], ['Sleight of Hand', 'DEX'],
    ['Stealth', 'DEX'], ['Survival', 'WIS']
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
      line: 'Twilight Cleric 4 · Human · Farmer',
      level: 4, maxHp: 43, ac: 18, speed: 30, prof: 2, hitDie: 8,
      abilities: { STR: 13, DEX: 8, CON: 16, INT: 8, WIS: 18, CHA: 12 },
      saveProf: ['WIS', 'CHA'],
      skillProf: ['Animal Handling', 'Insight', 'Medicine', 'Nature', 'Persuasion'],
      skillBonus: { Arcana: 4, Religion: 4 },
      stats: [['AC', '18'], ['Spell DC', '14'], ['Spell attack', '+6'], ['Speed', '30 ft'], ['Initiative', '−1'], ['Proficiency', '+2'], ['Passive Perception', '14']],
      features: [
        ['Twilight Sanctuary', 'Channel Divinity. 30 ft around you, 1 minute: anyone ending their turn inside gets 1d6+4 temp HP.'],
        ['Channel Divinity', '2 per long rest, regain 1 on a short rest.'],
        ['Spellcasting', 'Spell DC 14, spell attack +6. Slots: 4× level 1, 3× level 2.'],
        ['Thaumaturge', 'Extra cantrip, +4 to Arcana and Religion.'],
        ['Twilight Domain', 'Heavy armor and martial weapons. 300 ft darkvision (Eyes of Night). Vigilant Blessing.'],
        ['Lucky', '2 points: advantage on your own d20, or disadvantage on an attack against you.'],
        ['War Caster', 'Advantage on concentration saves. Cast a spell as an opportunity attack.'],
        ['Tough', '+8 max HP.'],
        ['Human', 'Heroic Inspiration after every long rest.']
      ],
      gear: ['Chain mail', 'Shield with holy symbol', 'Mace', 'Priest\'s Pack', 'Carpenter\'s Tools'],
      profs: 'Armor: all + shields · Weapons: all · Languages: Common + 2'
    },
    charlie: {
      id: 'charlie', name: 'Charlie Dompler', short: 'Charlie', svg: CHARLIE_SVG,
      line: 'Berserker Barbarian 4 · Human · Soldier',
      level: 4, maxHp: 53, ac: 15, speed: 30, prof: 2, hitDie: 12,
      abilities: { STR: 18, DEX: 14, CON: 16, INT: 8, WIS: 10, CHA: 8 },
      saveProf: ['STR', 'CON'],
      skillProf: ['Animal Handling', 'Athletics', 'Intimidation', 'Perception', 'Persuasion', 'Survival'],
      skillBonus: {},
      rageStrSkills: ['Acrobatics', 'Intimidation', 'Perception', 'Stealth', 'Survival'],
      stats: [['AC', '15'], ['Attack', '+6'], ['Speed', '30 ft'], ['Initiative', '+2'], ['Proficiency', '+2'], ['Rage damage', '+2'], ['Passive Perception', '12']],
      features: [
        ['Rage', '3 per long rest (regain 1 on a short rest). Resist weapon damage, +2 damage, advantage on STR.'],
        ['Reckless Attack', 'Advantage on your attacks, but enemies get advantage against you too.'],
        ['Frenzy', 'Rage + Reckless: +2d6 on your first hit each turn.'],
        ['Great Weapon Master', '+2 damage with heavy weapons. Hew: extra attack after a crit or kill.'],
        ['Savage Attacker', 'Once per turn, roll weapon damage twice and use the higher.'],
        ['Weapon Mastery', 'Cleave (greataxe), Graze (greatsword), Vex (handaxe).'],
        ['Danger Sense', 'Advantage on DEX saves.'],
        ['Primal Knowledge', 'While raging: use STR for Intimidation, Perception, Stealth, Survival and Acrobatics.'],
        ['Tough', '+8 max HP.'],
        ['Human', 'Heroic Inspiration after every long rest.']
      ],
      gear: ['Greataxe', 'Greatsword', '4 handaxes', 'Explorer\'s Pack', 'Dice set'],
      profs: 'Armor: light, medium, shields · Weapons: all · Languages: Common + 2'
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
      wat: 'WIS save (DC 14). Fail: 1d8 necrotic, or 1d12 if it is already hurt.' },
    sacred: { name: 'Sacred Flame', emoji: '🔥', level: 0, time: 'action', range: '60 ft',
      wat: 'DEX save (DC 14). Fail: 1d8 radiant. Ignores cover.' },
    guidance: { name: 'Guidance', emoji: '👍', level: 0, time: 'action', range: 'Touch', conc: true,
      wat: '+1d4 to checks with one skill (1 minute).' },
    thaumaturgy: { name: 'Thaumaturgy', emoji: '🎭', level: 0, time: 'action', range: '30 ft',
      wat: 'Minor wonder: booming voice, flickering flames, slamming doors.' },
    spare: { name: 'Spare the Dying', emoji: '🩹', level: 0, time: 'action', range: '15 ft',
      wat: 'A creature at 0 HP becomes stable.' },
    bless: { name: 'Bless', emoji: '⭐', level: 1, time: 'action', range: '30 ft', conc: true, up: true,
      wat: 'Up to 3 creatures: +1d4 to attacks and saves (1 minute).' },
    healingWord: { name: 'Healing Word', emoji: '💬', level: 1, time: 'bonus', range: '60 ft', up: true,
      wat: 'Heal 2d4+4. Someone at 0 HP gets back up.' },
    guidingBolt: { name: 'Guiding Bolt', emoji: '☄️', level: 1, time: 'action', range: '120 ft', up: true,
      wat: 'Attack +6: 4d6 radiant. Next attack against the target has advantage.' },
    command: { name: 'Command', emoji: '📢', level: 1, time: 'action', range: '60 ft', up: true,
      wat: 'WIS save (DC 14). Fail: it obeys Approach, Drop, Flee, Grovel or Halt.' },
    faerieFire: { name: 'Faerie Fire', emoji: '🟣', level: 1, time: 'action', range: '60 ft', conc: true,
      wat: '20 ft cube, DEX save (DC 14). Fail: attacks against it have advantage.' },
    sleep: { name: 'Sleep', emoji: '😴', level: 1, time: 'action', range: '60 ft', conc: true,
      wat: '5 ft sphere, WIS save (DC 14). Fail: Incapacitated, a second fail puts it to sleep.' },
    spiritualWeapon: { name: 'Spiritual Weapon', emoji: '🔨', level: 2, time: 'bonus', range: '60 ft', conc: true,
      wat: 'Floating weapon, attack +6: 1d8+4 force. Later turns: bonus action to attack again.' },
    aid: { name: 'Aid', emoji: '☀️', level: 2, time: 'action', range: '30 ft',
      wat: 'Up to 3 creatures: +5 max HP for 8 hours.' },
    holdPerson: { name: 'Hold Person', emoji: '🧊', level: 2, time: 'action', range: '60 ft', conc: true,
      wat: 'Humanoid, WIS save (DC 14). Fail: Paralyzed. Hits from within 5 ft are crits.' },
    moonbeam: { name: 'Moonbeam', emoji: '🌙', level: 2, time: 'action', range: '120 ft', conc: true,
      wat: 'Beam of light, CON save (DC 14): 2d10 radiant, half on a success.' },
    seeInvis: { name: 'See Invisibility', emoji: '👓', level: 2, time: 'action', range: 'Self',
      wat: 'See invisible creatures (1 hour).' },
    sanctuary: { name: 'Twilight Sanctuary', emoji: '🌅', level: 'cd', time: 'action', range: '30 ft',
      wat: '1 minute. Anyone ending their turn inside: 1d6+4 temp HP, or end Charmed/Frightened.' },
    divineSpark: { name: 'Divine Spark', emoji: '⚡', level: 'cd', time: 'action', range: '30 ft',
      wat: 'Heal 1d8+4, or damage (CON save DC 14, half on a success).' },
    turnUndead: { name: 'Turn Undead', emoji: '💀', level: 'cd', time: 'action', range: '30 ft',
      wat: 'Undead: WIS save (DC 14). Fail: Frightened and Incapacitated.' },
    vigilant: { name: 'Vigilant Blessing', emoji: '⏰', level: 'free', time: 'action', range: 'Touch',
      wat: 'Advantage on the next initiative roll.' },
    eyes: { name: 'Eyes of Night', emoji: '🌌', level: 'free', time: 'action', range: '10 ft',
      wat: 'Share your 300 ft darkvision with up to 4 friends for 1 hour.' }
  };

  const spellGroups = [
    ['Channel Divinity', ['sanctuary', 'divineSpark', 'turnUndead']],
    ['Features', ['vigilant', 'eyes']],
    ['Cantrips (free)', ['toll', 'sacred', 'guidance', 'thaumaturgy', 'spare']],
    ['Level 1', ['bless', 'healingWord', 'guidingBolt', 'command', 'faerieFire', 'sleep']],
    ['Level 2', ['spiritualWeapon', 'aid', 'holdPerson', 'moonbeam', 'seeInvis']]
  ];

  const charlieActions = [
    { id: 'rage', emoji: '😤', name: 'Rage', time: 'bonus', act: ['rage'],
      wat: 'Resist weapon damage, +2 damage, advantage on STR checks and saves.' },
    { id: 'greataxe', emoji: '🪓', name: 'Greataxe', time: 'action', act: ['atk', 'greataxe'],
      wat: '+6, 1d12+4 slashing. Cleave: on a hit, also attack an enemy next to it.' },
    { id: 'greatsword', emoji: '🗡️', name: 'Greatsword', time: 'action', act: ['atk', 'greatsword'],
      wat: '+6, 2d6+4 slashing. Graze: on a miss, still deal 4 damage.' },
    { id: 'handaxe', emoji: '🪃', name: 'Handaxe (thrown)', time: 'action', act: ['atk', 'handaxe'],
      wat: '+6, 20/60 ft, 1d6+4. Vex: on a hit, advantage on your next attack.' },
    { id: 'shove', emoji: '🤼', name: 'Shove / Grapple', time: 'action', act: ['shove'],
      wat: 'STR or DEX save (DC 14). Fail: pushed, Prone or Grappled.' },
    { id: 'help', emoji: '🤝', name: 'Help', time: 'action', act: ['helpTalk'],
      wat: 'Pim gets advantage on his check (you have Persuasion too).' },
    { id: 'intimidate', emoji: '😠', name: 'Intimidation', time: 'none', act: ['skill', 'Intimidation'],
      wat: 'While raging you use STR: +6 with advantage.' }
  ];

  const rules = [
    ['🤝', 'Teamwork', [
      'Twilight Sanctuary + Rage: Charlie gets temp HP and halves weapon damage.',
      'Hold Person + Charlie next to the target: every hit is a crit.',
      'Talking: Pim rolls Persuasion, Charlie uses Help (advantage).'
    ]],
    ['🕐', 'Your turn', [
      'Move: 30 ft (6 squares).',
      '1 action: attack, spell, Dash, Dodge, Help…',
      '1 bonus action, only if something says so.',
      '1 reaction per round, also on other turns.'
    ]],
    ['🎲', 'Rolling', [
      'd20 + modifier. Attacks vs AC, saves and checks vs DC.',
      'Advantage: roll 2d20, take the higher. Disadvantage: take the lower.',
      'Natural 20 on an attack = crit (double damage dice). Natural 1 = miss.'
    ]],
    ['✨', 'Spells', [
      'Cantrips are free. Other spells use a spell slot.',
      'Max 1 spell slot per turn.',
      'Concentration: only 1 spell at a time. Hit? CON save (the app rolls it).'
    ]],
    ['❤️', 'HP', [
      'Temp HP go first and don\'t stack.',
      '0 HP: roll a death save each turn. 10+ = success. 3 successes = stable, 3 failures = dead.',
      'Healing Word gets you back up instantly.'
    ]],
    ['🛌', 'Resting', [
      'Short rest (1 hour): spend Hit Dice for HP. Pim regains 1 Channel Divinity, Charlie 1 Rage.',
      'Long rest (8 hours): everything back.'
    ]]
  ];

  return { ABIL, SKILLS, chars, weapons, spells, spellGroups, charlieActions, rules };
})();

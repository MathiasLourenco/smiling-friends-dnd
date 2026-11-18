/* Game data: Pim Pimling, D&D 2024 rules, level 5. */
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

  const pim = {
    name: 'Pim Pimling', short: 'Pim', svg: PIM_SVG,
    line: 'Bard 5 (College of Eloquence) · Plasmoid · Entertainer',
    level: 5, maxHp: 38, ac: 14, speed: 30, prof: 3, hitDie: 8,
    spellDC: 15, spellAtk: 7, biDie: 8, biMax: 4,
    slotsMax: { 1: 4, 2: 3, 3: 2 },
    abilities: { STR: 8, DEX: 16, CON: 14, INT: 8, WIS: 12, CHA: 18 },
    saveProf: ['DEX', 'CHA'],
    skillProf: ['Acrobatics', 'Deception', 'Insight', 'Performance', 'Persuasion'],
    expertise: ['Deception', 'Persuasion'],
    silverTongue: ['Deception', 'Persuasion'],
    stats: [['AC', '14'], ['Spell save DC', '15'], ['Spell attack', '+7'], ['Speed', '30 ft'], ['Initiative', '+3'], ['Passive Perception', '12'], ['Bardic die', 'd8']],
    features: [
      ['Bardic Inspiration', 'Bonus action, 4 per rest. An ally within 60 ft can add 1d8 to a d20 roll they fail in the next hour.'],
      ['Silver Tongue', 'Persuasion and Deception: a d20 roll of 9 or lower counts as a 10.'],
      ['Unsettling Words', 'Bonus action, spend a Bardic Inspiration: a creature within 60 ft subtracts 1d8 from its next save.'],
      ['Font of Inspiration', 'Bardic Inspiration comes back on a short rest. Spend a spell slot to get 1 back.'],
      ['Expertise', 'Double proficiency in Persuasion and Deception (+10).'],
      ['Jack of All Trades', '+1 to skill checks you aren\'t proficient in.'],
      ['Spellcasting', 'Spell save DC 15, spell attack +7. Slots: 4× level 1, 3× level 2, 2× level 3.'],
      ['Musician', 'After a short or long rest, play a song: up to 3 allies gain Heroic Inspiration.'],
      ['Plasmoid', 'Ooze. Darkvision 60 ft. Squeeze through 1-inch gaps without gear. Advantage to grapple or escape grapples. Hold breath 1 hour. Resistant to acid and poison.'],
      ['Shape Self', 'Action: grow arms and legs, or become a blob. Bonus action: a 10 ft pseudopod to open doors or grab tiny things.']
    ],
    gear: ['Leather armor', 'Lute', '2 daggers (+6, 1d4+3)', 'Entertainer\'s Pack', '2 costumes', 'Mirror'],
    profs: 'Armor: light · Weapons: simple · Instruments: lute + 6 more · Languages: Common + 2'
  };

  /* time: action | bonus | none. save: which save the target makes. ex: example uses. */
  const spells = {
    mockery: { name: 'Vicious Mockery', emoji: '🤪', level: 0, time: 'action', range: '60 ft', save: 'WIS',
      wat: 'Insult an enemy so badly it hurts (2d6 damage). Its next attack is also worse.' },
    inspiration: { name: 'Bardic Inspiration', emoji: '🎵', level: 'bi', time: 'bonus', range: '60 ft',
      wat: 'Cheer Charlie on. If he fails a roll in the next hour, he adds 1d8 to it.' },
    unsettling: { name: 'Unsettling Words', emoji: '😰', level: 'bi', time: 'bonus', range: '60 ft',
      wat: 'Say something that rattles an enemy, so your next spell works better on it.' },
    healingWord: { name: 'Healing Word', emoji: '💬', level: 1, time: 'bonus', range: '60 ft',
      wat: 'A few kind words heal someone from a distance (2d4+4). Gets someone at 0 HP back up.' },
    aid: { name: 'Aid', emoji: '☀️', level: 2, time: 'action', range: '30 ft',
      wat: 'A morning pep talk: you and Charlie get +5 HP for the whole day (8 hours).' },
    invisibility: { name: 'Invisibility', emoji: '👻', level: 2, time: 'action', range: 'Touch', conc: true,
      wat: 'Touch someone and they turn invisible for 1 hour. Ends if they attack or cast a spell.' },
    laughter: { name: 'Tasha\'s Hideous Laughter', emoji: '😂', level: 1, time: 'action', range: '30 ft', conc: true, save: 'WIS',
      wat: 'One enemy finds everything so funny that it falls over laughing and can\'t do anything.' },
    pattern: { name: 'Hypnotic Pattern', emoji: '🌀', level: 3, time: 'action', range: '120 ft', conc: true, save: 'WIS',
      wat: 'Swirling colors in a big square. Enemies inside stare at it and can\'t move or act. Hitting them wakes them up.' },
    charm: { name: 'Charm Person', emoji: '🥰', level: 1, time: 'action', range: '30 ft', save: 'WIS',
      wat: 'Someone sees you as a good friend for 1 hour. Afterwards they know it was magic.' },
    suggestion: { name: 'Suggestion', emoji: '💡', level: 2, time: 'action', range: '30 ft', conc: true, save: 'WIS',
      wat: 'Give someone a reasonable idea (max 25 words) and they go do it, for up to 8 hours.' },
    calm: { name: 'Calm Emotions', emoji: '😌', level: 2, time: 'action', range: '60 ft', conc: true, save: 'CHA',
      wat: 'Angry people nearby calm down and stop wanting to fight.' },
    tongues: { name: 'Tongues', emoji: '🗣️', level: 3, time: 'action', range: 'Touch',
      wat: 'For 1 hour you understand every language and everyone understands you.' },
    illusion: { name: 'Minor Illusion', emoji: '🪄', level: 0, time: 'action', range: '30 ft',
      wat: 'Make a fake sound or a fake small object (up to a crate) for 1 minute.',
      when: 'To distract, scare or hide. It does no damage.',
      ex: ['Guards shouting in the next room', 'A fake crate to hide behind', 'Your voice calling from somewhere else', 'Footprints going the wrong way'] },
    prestidigitation: { name: 'Prestidigitation', emoji: '✨', level: 0, time: 'action', range: '10 ft',
      wat: 'Small, harmless magic tricks.',
      when: 'For fun, to impress people or to fix small things. Not in a fight.',
      ex: ['Light or blow out a candle', 'Clean muddy clothes', 'Make food taste like cake', 'Draw a smiley on a wall (1 hour)', 'A puff of sparks or confetti', 'Warm up cold soup'] }
  };

  const spellGroups = [
    ['Every turn (free)', ['mockery']],
    ['Bardic Inspiration', ['inspiration', 'unsettling']],
    ['Heal & protect', ['healingWord', 'aid', 'invisibility']],
    ['Stop enemies', ['laughter', 'pattern']],
    ['Talk', ['charm', 'suggestion', 'calm', 'tongues']],
    ['Tricks (free)', ['illusion', 'prestidigitation']]
  ];

  const talkSkills = [
    ['Persuasion', '🤝', 'Convince someone honestly'],
    ['Deception', '🎭', 'Tell a (white) lie'],
    ['Insight', '🔍', 'Is someone lying?'],
    ['Performance', '🎶', 'Sing, play or put on a show']
  ];

  const rules = [
    ['🕐', 'Your turn', [
      'Move: 30 ft (6 squares).',
      '1 action: a spell, Vicious Mockery, Dash, Dodge, Help…',
      '1 bonus action: only things that say "bonus action".',
      'Max 1 spell slot per turn.'
    ]],
    ['💬', 'Talking', [
      'Just say what Pim says. The DM tells you when to roll.',
      'Honest? Persuasion. A (white) lie? Deception.',
      'Not sure if someone is honest? Insight.'
    ]],
    ['🎲', 'Rolling', [
      'd20 + bonus. The DM says if it worked.',
      'Advantage: roll 2, take the higher. Disadvantage: take the lower.',
      'Natural 20 on an attack is a crit, natural 1 is a miss.'
    ]],
    ['✨', 'Spells', [
      'Free spells (cantrips) never run out.',
      'Other spells use a spell slot.',
      'Concentration: only 1 at a time. Get hit? The app rolls a CON save.'
    ]],
    ['❤️', 'HP', [
      'Temp HP go first and don\'t stack.',
      '0 HP: roll a death save each turn. 10+ is good. 3 good = stable, 3 bad = dead.',
      'Healing gets you back up right away.'
    ]],
    ['🛌', 'Resting', [
      'Short rest (1 hour): Hit Dice heal you, Bardic Inspiration comes back.',
      'Long rest (8 hours): everything comes back.',
      'After every rest: play a song, Charlie gets Heroic Inspiration.'
    ]]
  ];

  return { ABIL, SKILLS, pim, spells, spellGroups, talkSkills, rules };
})();

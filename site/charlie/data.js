/* Charlie Dompler — Wild Magic Sorcerer 5, D&D 2024 rules. */
window.CHD = (function () {
  'use strict';

  const SVG = '<svg viewBox="0 0 100 100" aria-hidden="true">' +
    '<ellipse cx="50" cy="57" rx="38" ry="37" fill="#ffd93d" stroke="#151515" stroke-width="4"/>' +
    '<path d="M12 54C9 24 29 7 52 7C77 7 93 25 88 54L81 41L73 51L65 37L55 49L46 35L37 49L28 37L20 51Z" fill="#3a2a1a" stroke="#151515" stroke-width="4" stroke-linejoin="round"/>' +
    '<ellipse cx="37" cy="62" rx="8" ry="9" fill="#fff" stroke="#151515" stroke-width="3"/><circle cx="37" cy="65" r="3.5" fill="#151515"/>' +
    '<path d="M28.6 61A8.4 9 0 0 1 45.4 61Z" fill="#ffd93d" stroke="#151515" stroke-width="3" stroke-linejoin="round"/>' +
    '<ellipse cx="63" cy="62" rx="8" ry="9" fill="#fff" stroke="#151515" stroke-width="3"/><circle cx="63" cy="65" r="3.5" fill="#151515"/>' +
    '<path d="M54.6 61A8.4 9 0 0 1 71.4 61Z" fill="#ffd93d" stroke="#151515" stroke-width="3" stroke-linejoin="round"/>' +
    '<path d="M49 70Q46 75 51 75" fill="none" stroke="#151515" stroke-width="2.5" stroke-linecap="round"/>' +
    '<path d="M40 83Q50 80 60 83" fill="none" stroke="#151515" stroke-width="3.5" stroke-linecap="round"/></svg>';

  const ch = {
    name: 'Charlie Dompler', short: 'Charlie', svg: SVG,
    line: 'Sorcerer 5 (Wild Magic Sorcery) · Human · Merchant',
    level: 5, prof: 3, maxHp: 47, hitDie: 6, speed: 30, spMax: 5, luckMax: 3, innateMax: 2,
    abilities: { STR: 8, DEX: 14, CON: 16, INT: 8, WIS: 10, CHA: 18 },
    saveProf: ['CON', 'CHA'],
    skillProf: ['Animal Handling', 'Insight', 'Intimidation', 'Perception', 'Persuasion'],
    slotsMax: { 1: 4, 2: 3, 3: 2 },
    dc: 15, atk: 7,
    features: [
      ['Wild Magic Surge', 'Once per turn, right after you cast a Sorcerer spell with a spell slot, you can roll a d20. On a 20, roll on the Surge table. If the surge is a spell, Metamagic can\'t change it.'],
      ['Tides of Chaos', 'Advantage on one D20 Test (declare before rolling). Then it\'s spent until you finish a Long Rest — or until you cast a Sorcerer spell with a slot, which automatically triggers a surge and recharges Tides.'],
      ['Innate Sorcery', 'Bonus action, 1 minute: +1 to your Sorcerer spell save DC and advantage on Sorcerer spell attack rolls. 2 uses per Long Rest.'],
      ['Font of Magic', '5 Sorcery Points (max 5). Bonus action: create a slot — L1 2 SP, L2 3 SP, L3 5 SP (vanishes on a Long Rest). No action: expend a slot to gain SP equal to its level.'],
      ['Metamagic', 'One option per spell. Careful Spell (1 SP): up to 4 creatures (CHA mod) auto-succeed on the save and take no damage on a success. Subtle Spell (1 SP): no Verbal, Somatic or non-costly Material components.'],
      ['Sorcerous Restoration', 'When you finish a Short Rest, regain up to 2 expended Sorcery Points. Once per Long Rest.'],
      ['Lucky', '3 Luck Points per Long Rest. Spend 1 for advantage on your D20 Test, or to give disadvantage to an attack roll against you.'],
      ['War Caster', 'Advantage on CON saves to keep concentration. Somatic components with your hands full. When a creature leaves your reach, you can cast a 1-action spell targeting only it as your opportunity attack.'],
      ['Tough', '+2 HP per level (+10, included).'],
      ['Human', 'Resourceful: Heroic Inspiration after every Long Rest. Skillful: Perception. Versatile: Tough.'],
      ['Merchant', 'Animal Handling, Persuasion, Navigator\'s Tools. Feat: Lucky.'],
      ['Level 6 — Bend Luck', 'Reaction + 1 SP right after a creature you see rolls a d20 for a D20 Test: add or subtract 1d4.']
    ],
    gear: ['Arcane focus (crystal)', '2 daggers', 'Spear', 'Dungeoneer\'s Pack', 'Navigator\'s Tools', '2 pouches', 'Traveler\'s clothes', 'Diamond (50 gp) for Chromatic Orb'],
    profs: 'Armor: none · Weapons: simple · Tools: Navigator\'s Tools · Languages: Common + 2'
  };

  /* kind: atk (spell attack), save, util. dmg: [dice, sides] at base level; up: dice per slot level above base. */
  const spells = {
    burst: { name: 'Sorcerous Burst', lvl: 0, time: 'Action', range: '120 ft', comp: 'V, S', dur: 'Instant', kind: 'atk', dmg: [2, 8], type: 'chosen type',
      text: 'Ranged spell attack. 2d8 acid, cold, fire, lightning, poison, psychic or thunder. Each 8 rolled adds another d8 (max 4 extra).' },
    sliver: { name: 'Mind Sliver', lvl: 0, time: 'Action', range: '60 ft', comp: 'V', dur: '1 round', kind: 'save', save: 'INT', dmg: [2, 6], type: 'psychic',
      text: 'INT save or 2d6 psychic, and the target subtracts 1d4 from the next save it makes before the end of your next turn.' },
    grasp: { name: 'Shocking Grasp', lvl: 0, time: 'Action', range: 'Touch', comp: 'V, S', dur: 'Instant', kind: 'atk', melee: true, dmg: [2, 8], type: 'lightning',
      text: 'Melee spell attack. 2d8 lightning, and the target can\'t make opportunity attacks until the start of its next turn.' },
    hand: { name: 'Mage Hand', lvl: 0, time: 'Action', range: '30 ft', comp: 'V, S', dur: '1 minute', kind: 'util',
      text: 'Spectral hand; Magic action to manipulate objects, open doors or carry up to 10 lb.' },
    message: { name: 'Message', lvl: 0, time: 'Action', range: '120 ft', comp: 'S, M', dur: '1 round', kind: 'util',
      text: 'Whisper a message to one creature; only it hears, and it can whisper a reply.' },
    shield: { name: 'Shield', lvl: 1, time: 'Reaction', range: 'Self', comp: 'V, S', dur: '1 round', kind: 'util', reaction: true,
      text: 'When hit by an attack roll or targeted by Magic Missile: +5 AC until the start of your next turn, including against the trigger. No damage from Magic Missile.' },
    armor: { name: 'Mage Armor', lvl: 1, time: 'Action', range: 'Touch', comp: 'V, S, M', dur: '8 hours', kind: 'util',
      text: 'Willing creature without armor: base AC 13 + DEX (15 for you).' },
    orb: { name: 'Chromatic Orb', lvl: 1, time: 'Action', range: '90 ft', comp: 'V, S, M (50 gp diamond)', dur: 'Instant', kind: 'atk', dmg: [3, 8], up: 1, type: 'chosen type',
      text: 'Ranged spell attack. 3d8 acid, cold, fire, lightning, poison or thunder. If two or more d8s match, it leaps to another target within 30 ft (new attack roll), up to a number of leaps equal to the slot level. +1d8 per slot level above 1.' },
    disguise: { name: 'Disguise Self', lvl: 1, time: 'Action', range: 'Self', comp: 'V, S', dur: '1 hour', kind: 'util',
      text: 'Change your look, clothes and gear. A Study action with Investigation vs your DC sees through it.' },
    misty: { name: 'Misty Step', lvl: 2, time: 'Bonus', range: 'Self', comp: 'V', dur: 'Instant', kind: 'util',
      text: 'Teleport up to 30 ft to an unoccupied space you can see.' },
    thoughts: { name: 'Detect Thoughts', lvl: 2, time: 'Action', range: 'Self (30 ft)', comp: 'V, S, M', dur: 'Conc. 1 minute', kind: 'util', conc: true, save: 'WIS',
      text: 'Sense minds within 30 ft and read what is most on a creature\'s mind. Probe deeper: WIS save, on a fail you learn its reasoning and emotions.' },
    ray: { name: 'Scorching Ray', lvl: 2, time: 'Action', range: '120 ft', comp: 'V, S', dur: 'Instant', kind: 'rays', rays: 3, dmg: [2, 6], type: 'fire',
      text: '3 rays, each a ranged spell attack for 2d6 fire. One extra ray per slot level above 2.' },
    fireball: { name: 'Fireball', lvl: 3, time: 'Action', range: '150 ft', comp: 'V, S, M', dur: 'Instant', kind: 'save', save: 'DEX', half: true, dmg: [8, 6], up: 1, type: 'fire',
      text: '20 ft radius sphere. DEX save: 8d6 fire, half on a success. Ignites unattended flammable objects. +1d6 per slot level above 3.' },
    counter: { name: 'Counterspell', lvl: 3, time: 'Reaction', range: '60 ft', comp: 'S', dur: 'Instant', kind: 'save', save: 'CON', reaction: true,
      text: 'When you see a creature within 60 ft cast a spell with V, S or M: it makes a CON save. On a fail the spell does nothing and the action is wasted; its slot isn\'t expended.' }
  };

  const groups = [
    ['Cantrips', ['burst', 'sliver', 'grasp', 'hand', 'message']],
    ['Level 1', ['shield', 'armor', 'orb', 'disguise']],
    ['Level 2', ['misty', 'thoughts', 'ray']],
    ['Level 3', ['fireball', 'counter']]
  ];

  const quick = ['burst', 'orb', 'ray', 'fireball', 'shield', 'counter', 'misty'];

  const rules = [
    '<b>Tides of Chaos</b> = advantage on one d20 roll of yours (attack, save, check or initiative). Declare it before rolling. Then it\'s spent.',
    '<b>Recharge:</b> cast a Sorcerer spell with a <b>spell slot</b> while Tides is spent → you <b>automatically surge</b> (roll d100) and Tides is ready again. A Long Rest also recharges it, without a surge.',
    'Using Tides on a check (Stealth, Persuasion…) does nothing else. The surge waits for your next slot spell, however long that takes.',
    '<b>Cantrips</b> never surge and never recharge Tides.',
    '<b>Without Tides:</b> once per turn after a slot spell, you may roll a d20. On a 20 you surge (5%).',
    '<b>1 spell slot per turn</b> — on any turn. Shield on an enemy\'s turn is a separate turn, so it can recharge Tides too.',
    '<b>Surge spells</b> can\'t be changed by Metamagic and don\'t need Concentration: they last their full duration. Saves use your spell save DC.',
    'Max at level 5 ≈ <b>13 Tides per day</b>: 1 + 9 slots + ~3 slots made from Sorcery Points.',
    'This table replaces the Player\'s Handbook surge table — that\'s a house rule, so check with your DM.'
  ];

  return { ch, spells, groups, quick, rules };
})();

/* Charlie Dompler on the fillable D&D Beyond character sheet (4 pages), plus 2 matching
   pages with the Wild Magic Surge table from site/charlie/surge.js. The result stays fillable.

   Needs pdf-lib: run `npm install pdf-lib` in any folder and point NODE_PATH at its node_modules.
   Usage: node charlie-dndbeyond.cjs <D&D Beyond sheet.pdf> [output.pdf]
   Any copy of the sheet works as input (filled or blank): every field value is replaced.
   Only plain ASCII text in field values: the form font (Helvetica) can't show symbols like − or →. */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { PDFDocument, PDFName, StandardFonts, TextAlignment, rgb } = require('pdf-lib');

const [template, outArg] = process.argv.slice(2);
if (!template) {
  console.error('Usage: node charlie-dndbeyond.cjs <D&D Beyond sheet.pdf> [output.pdf]');
  process.exit(1);
}
const output = outArg || path.join(__dirname, '..', 'Charlie-sheet-DnDBeyond.pdf');

const box = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', '..', 'site', 'charlie', 'surge.js'), 'utf8'), box);
const SURGE = box.window.SURGE;

const NAME = 'Charlie Dompler';
const CLASS = 'Sorcerer 5 - Wild Magic Sorcery';

/* ---------- page 1 ---------- */
const page1 = {
  CharacterName: [NAME, 13], 'CLASS  LEVEL': CLASS, 'PLAYER NAME': '', RACE: 'Human', BACKGROUND: 'Merchant', 'EXPERIENCE POINTS': '',
  STR: '8', STRmod: '-1', DEX: '14', DEXmod: '+2', CON: '16', CONmod: '+3',
  INT: '8', INTmod: '-1', WIS: '10', WISmod: '+0', CHA: '18', CHamod: '+4',
  StrProf: '', 'ST Strength': '-1', DexProf: '', 'ST Dexterity': '+2', ConProf: 'P', 'ST Constitution': '+6',
  IntProf: '', 'ST Intelligence': '-1', WisProf: '', 'ST Wisdom': '+0', ChaProf: 'P', 'ST Charisma': '+7',
  SaveModifiers: ['War Caster: advantage on CON saves to keep Concentration.', 9],
  Defenses: ['AC 15 with Mage Armor (12 without). Shield: +5 AC as a reaction.', 9],
  Passive1: '13', Passive2: '13', Passive3: '9',
  AdditionalSenses: ['No darkvision. Passive Perception 13.', 13],
  Init: '+2', AC: '15', ProfBonus: '+3', AbilitySaveDC: '15', Speed: ['30 ft walk', 14],
  MaxHP: '47', CurrentHP: '47', TempHP: '--', Total: '5d6 Sorcerer', HD: '5d6',
  ProficienciesLang: [[
    'Armor: none (cast Mage Armor)',
    'Weapons: Simple weapons',
    'Tool: Navigator\'s Tools',
    'Languages: Common + 2 languages',
    'Saving throws: Constitution, Charisma',
    'Skills: Animal Handling, Insight, Intimidation, Perception, Persuasion'
  ].join('\n'), 8],
  Actions1: [[
    'ACTION: Sorcerous Burst, Mind Sliver, Chromatic Orb, Scorching Ray, Fireball. Max 1 spell slot per turn.',
    'BONUS ACTION: Innate Sorcery (2/Long Rest, 1 min: DC 16 and advantage on spell attacks). Misty Step. Font of Magic (SP -> slot).',
    'REACTION: Shield (+5 AC). Counterspell. War Caster: a 1-action spell as opportunity attack.',
    'TIDES OF CHAOS: advantage on one d20 roll. Next slot spell -> surge + Tides back.',
    'LUCKY: 3 Luck Points per Long Rest.'
  ].join('\n'), 7],
  Actions2: [[
    'TURN PLAN',
    '1. Morning: Mage Armor (AC 15).',
    '2. Initiative: use Tides on it.',
    '3. Round 1: Innate Sorcery (bonus action) + Fireball (Careful if Pim is close) -> surge, Tides back.',
    '4. Next rounds: Chromatic Orb or Scorching Ray with Tides on the attack, or Sorcerous Burst to save slots.',
    '5. Enemy hits you: Shield -> surge, Tides back.',
    '6. Enemy caster: Counterspell.',
    '7. Talking: Subtle Detect Thoughts, then let Pim talk.'
  ].join('\n'), 7]
};

/* [prof field, bonus field, ability field, proficient, bonus, ability] */
const skills = [
  ['AcrobaticsProf', 'Acrobatics', 'AcrobaticsMod', 0, '+2', 'DEX'],
  ['AnimalHandlingProf', 'Animal', 'AnimalMod', 1, '+3', 'WIS'],
  ['ArcanaProf', 'Arcana', 'ArcanaMod', 0, '-1', 'INT'],
  ['AthleticsProf', 'Athletics', 'AthleticsMod', 0, '-1', 'STR'],
  ['DeceptionProf', 'Deception', 'DeceptionMod', 0, '+4', 'CHA'],
  ['HistoryProf', 'History', 'HistoryMod', 0, '-1', 'INT'],
  ['InsightProf', 'Insight', 'InsightMod', 1, '+3', 'WIS'],
  ['IntimidationProf', 'Intimidation', 'IntimidationMod', 1, '+7', 'CHA'],
  ['InvestigationProf', 'Investigation', 'InvestigationMod', 0, '-1', 'INT'],
  ['MedicineProf', 'Medicine', 'MedicineMod', 0, '+0', 'WIS'],
  ['NatureProf', 'Nature', 'NatureMod', 0, '-1', 'INT'],
  ['PerceptionProf', 'Perception', 'PerceptionMod', 1, '+3', 'WIS'],
  ['PerformanceProf', 'Performance', 'PerformanceMod', 0, '+4', 'CHA'],
  ['PersuasionProf', 'Persuasion', 'PersuasionMod', 1, '+7', 'CHA'],
  ['ReligionProf', 'Religion', 'ReligionMod', 0, '-1', 'INT'],
  ['SleightOfHandProf', 'SleightofHand', 'SleightofHandMod', 0, '+2', 'DEX'],
  ['StealthProf', 'Stealth', 'StealthMod', 0, '+2', 'DEX'],
  ['SurvivalProf', 'Survival', 'SurvivalMod', 0, '+0', 'WIS']
];

/* [name, hit, damage, notes] */
const attacks = [
  ['Sorcerous Burst', '+7', '2d8 any', '120 ft. Each 8 rolled: +1d8 (max 4 extra).'],
  ['Mind Sliver', 'DC15', '2d6 Psy', '60 ft. INT save. Target: -1d4 on its next save.'],
  ['Shocking Grasp', '+7', '2d8 Lgt', 'Touch. No opportunity attacks: walk away.'],
  ['Chromatic Orb (L1)', '+7', '3d8 any', '90 ft. Two d8s match: leaps to a 2nd target.'],
  ['Scorching Ray (L2)', '+7', '3x 2d6 F', '120 ft. 3 rays, roll each attack.'],
  ['Dagger', '+5', '1d4+2 P', 'Finesse, light, thrown 20/60. You have 2.']
];
const attackFields = [
  ['Wpn Name', 'Wpn1 AtkBonus', 'Wpn1 Damage', 'Wpn Notes 1'],
  ['Wpn Name 2', 'Wpn2 AtkBonus', 'Wpn2 Damage', 'Wpn Notes 2'],
  ['Wpn Name 3', 'Wpn3 AtkBonus', 'Wpn3 Damage', 'Wpn Notes 3'],
  ['Wpn Name 4', 'Wpn4 AtkBonus', 'Wpn4 Damage', 'Wpn Notes 4'],
  ['Wpn Name 5', 'Wpn5 AtkBonus', 'Wpn5 Damage', 'Wpn Notes 5'],
  ['Wpn Name 6', 'Wpn6 AtkBonus', 'Wpn6 Damage', 'Wpn Notes 6']
];

/* ---------- page 2 ---------- */
const page2 = {
  CharacterName2: [NAME, 13], 'CLASS  LEVEL2': CLASS, 'PLAYER NAME2': '', RACE2: 'Human', BACKGROUND2: 'Merchant', 'EXPERIENCE POINTS2': '',
  FeaturesTraits1: [[
    'SORCERER 5',
    'Spellcasting: CHA. 5 cantrips, 9 prepared spells. Slots: 4x level 1, 3x level 2, 2x level 3. Spell save DC 15, spell attack +7.',
    '',
    'Innate Sorcery: Bonus Action, 1 minute: +1 spell save DC (16) and advantage on Sorcerer spell attack rolls. 2/Long Rest.',
    '',
    'Font of Magic: 5 Sorcery Points per Long Rest.',
    '- Bonus Action: SP -> slot. Level 1 = 2 SP, level 2 = 3 SP, level 3 = 5 SP. The slot is gone at a Long Rest.',
    '- No action: slot -> SP equal to its level.',
    '',
    'METAMAGIC (1 option per spell)',
    '- Careful Spell (1 SP): up to 4 creatures auto-succeed on the save and take no damage on a success.',
    '- Subtle Spell (1 SP): cast without Verbal, Somatic or non-costly Material components.',
    '',
    'Sorcerous Restoration: after a Short Rest, regain up to 2 Sorcery Points. Once per Long Rest.'
  ].join('\n'), 8],
  FeaturesTraits2: [[
    'WILD MAGIC SORCERY',
    'Wild Magic Surge: once per turn, right after you cast a Sorcerer spell with a slot, you may roll a d20. On a 20: roll d100 on the Surge table (pages 5-6).',
    '',
    'Tides of Chaos: advantage on one D20 Test (declare before rolling). Then it is spent until:',
    '- you cast a Sorcerer spell with a slot -> automatic surge, Tides back; or',
    '- you finish a Long Rest.',
    '',
    'Cantrips never surge and never recharge Tides.',
    '',
    'Surge spells: no Metamagic, no Concentration (they last their full duration). DC = your spell save DC.',
    '',
    'Max about 13 Tides per day: 1 + 9 slots + ~3 slots made from Sorcery Points. Max 1 slot per turn, but Shield works on enemy turns too.'
  ].join('\n'), 8],
  FeaturesTraits3: [[
    'HUMAN',
    'Medium humanoid. Speed 30 ft.',
    'Resourceful: Heroic Inspiration after every Long Rest.',
    'Skillful: Perception.',
    'Versatile: origin feat Tough.',
    '',
    'MERCHANT',
    'Skills: Animal Handling, Persuasion.',
    'Tool: Navigator\'s Tools.',
    'Origin feat: Lucky.',
    '',
    'FEATS',
    'Lucky: 3 Luck Points per Long Rest. Spend 1: advantage on your D20 Test, or disadvantage on an attack roll against you.',
    '',
    'Tough: +2 HP per level (+10, already in your max HP).',
    '',
    'War Caster (level 4): advantage on CON saves to keep Concentration. Somatic components with your hands full. When a creature leaves your reach, cast a 1-action spell at it as your opportunity attack.'
  ].join('\n'), 8],
  CP: '0', SP: '0', EP: '0', GP: '0', PP: '0',
  'Weight Carried': '69 lb.', Encumbered: '120 lb.', PushDragLift: '240 lb.'
};

/* [name, qty, weight]; rows 0-14 left column, 15-25 right column */
const gear = [
  ['Arcane Focus - crystal', '1', '1 lb.'],
  ['Dagger', '2', '2 lb.'],
  ['Spear', '1', '3 lb.'],
  ['Dungeoneer\'s Pack', '1', '55 lb.'],
  ['Navigator\'s Tools', '1', '2 lb.'],
  ['Pouch', '2', '2 lb.'],
  ['Traveler\'s Clothes', '1', '4 lb.'],
  ['Diamond (50 gp) - Chromatic Orb', '1', '--']
];
const pack = [
  ['IN THE DUNGEONEER\'S PACK:', '', ''],
  ['Backpack', '1', ''], ['Caltrops (bag)', '1', ''], ['Crowbar', '1', ''], ['Oil (flask)', '2', ''],
  ['Rations (days)', '10', ''], ['Rope (50 ft)', '1', ''], ['Tinderbox', '1', ''], ['Torch', '10', ''], ['Waterskin', '1', '']
];

/* ---------- page 3 ---------- */
const page3 = {
  CharacterName4: [NAME, 13], GENDER: 'Male', AGE: '', SIZE: ['Medium', 10], HEIGHT: '', WEIGHT: '',
  ALIGNMENT: '', FAITH: '', SKIN: 'Yellow', EYES: 'Sleepy', HAIR: 'Dark, spiky',
  Appearance: ['Yellow skin, dark spiky hair and heavy, sleepy eyelids. Usually looks a bit unimpressed.', 8],
  AlliesOrganizations: [[
    'SMILING FRIENDS INC.',
    'A small company with one job: make sad people smile.',
    '',
    'Pim Pimling - coworker and party member (Bard 5). Keep him out of your Fireballs (Careful Spell).',
    '',
    'The Boss - runs Smiling Friends.',
    'Alan and Glep - colleagues.'
  ].join('\n'), 8],
  PersonalityTraits: ['Laid-back and blunt. I say out loud what everyone else is thinking.', 8],
  Ideals: ['Make people smile - it\'s literally the job. Then go home.', 8],
  Bonds: ['Pim. He\'s way too cheerful, but he\'s my partner.', 8],
  Flaws: ['Low patience. When things get weird, I want to quit and go home.', 8],
  Backstory: [[
    'Charlie works at Smiling Friends Inc. together with Pim. Their job: go wherever someone is sad and make them smile - no matter how strange the job gets.',
    '',
    'Before Smiling Friends he was a travelling merchant. That\'s where his Navigator\'s Tools and his luck come from.',
    '',
    'Somewhere along the way, wild magic started sparking out of him - usually at the worst possible moment.'
  ].join('\n'), 8],
  AdditionalNotes1: [[
    'CURRENT BUILD - LEVEL 5',
    'Sorcerer 5 (Wild Magic Sorcery), Human, Merchant. D&D 2024 rules.',
    'Feats: Lucky (Merchant), Tough (Human), War Caster (level 4).',
    'Max HP 47 (Tough included). AC 15 with Mage Armor, 12 without.',
    'Spell save DC 15 (16 with Innate Sorcery). Spell attack +7.',
    '',
    'HOW TIDES & SURGES WORK',
    '1. Tides = advantage on one d20 roll of yours: attack, save, check or initiative. Then it\'s empty.',
    '2. The next spell you cast with a slot -> roll d100 on the Surge table right away, and Tides is full again.',
    '3. Cantrips do nothing. If no slot spell comes before your Long Rest, Tides simply comes back.',
    '4. Without Tides: after a slot spell you may roll a d20; on a 20 you surge (5%).',
    '',
    'SURGE TABLE (pages 5-6)',
    'House rule: it replaces the Player\'s Handbook table, so check with your DM.'
  ].join('\n'), 8],
  AdditionalNotes2: [[
    'TRACKERS (a Long Rest resets all)',
    'Spell slots level 1:  O O O O',
    'Spell slots level 2:  O O O',
    'Spell slots level 3:  O O',
    'Sorcery Points:  O O O O O',
    'Tides of Chaos used:  O',
    'Innate Sorcery:  O O',
    'Luck Points:  O O O',
    'Heroic Inspiration:  O',
    'Sorcerous Restoration:  O',
    'Hit Dice (d6):  O O O O O',
    '',
    'GEAR NOTES',
    'Diamond (50 gp): needed for Chromatic Orb, not used up.',
    'Arcane focus (crystal): replaces the other material components.',
    'Spear: STR weapon, +2 to hit, 1d6-1. Better to use a dagger.'
  ].join('\n'), 8]
};

/* ---------- page 4: spells ---------- */
const page4 = {
  spellCastingClass0: [CLASS, 13], spellCastingAbility0: 'CHA', spellSaveDC0: '15', spellAtkBonus0: '+7'
};
/* header rows: [key, title, slots, notes] */
const spellHeaders = [
  ['0', '=== CANTRIPS ===', 'At Will', 'Cantrips never surge and never recharge Tides.'],
  ['1', '=== LEVEL 1 ===', '4 x Level 1 Slots OOOO', 'Every slot spell: Tides back (surge if Tides was spent).'],
  ['2', '=== METAMAGIC ===', '5 Sorcery Points OOOOO', '1 Metamagic option per spell.']
];
/* spell rows: [row, prepared, name, source, save/atk, time, range, components, duration, notes] */
const spellRows = [
  [0, 'X', 'Sorcerous Burst', 'Sorcerer', '+7', '1A', '120 ft', 'V,S', 'Instant', '2d8, pick type. Each 8 rolled: +1d8 (max 4).'],
  [1, 'X', 'Mind Sliver', 'Sorcerer', 'DC15', '1A', '60 ft', 'V', '1 round', 'INT save: 2d6 psychic, -1d4 on its next save.'],
  [2, 'X', 'Shocking Grasp', 'Sorcerer', '+7', '1A', 'Touch', 'V,S', 'Instant', '2d8 lightning; no opportunity attacks. Walk away.'],
  [3, 'X', 'Mage Hand', 'Sorcerer', '--', '1A', '30 ft', 'V,S', '1 min', 'Hand: doors, objects up to 10 lb (Magic action).'],
  ['BlankHeader1', 'X', 'Message', 'Sorcerer', '--', '1A', '120 ft', 'S,M', '1 round', 'Whisper to 1 creature; it can whisper back.'],
  [4, 'X', 'Shield', 'Sorcerer', '--', '1R', 'Self', 'V,S', '1 round', 'When hit: +5 AC (AC 20). Recharges Tides!'],
  [5, 'X', 'Mage Armor', 'Sorcerer', '--', '1A', 'Touch', 'V,S,M', '8 hours', 'AC 13 + DEX = 15. Cast it every morning.'],
  [6, 'X', 'Chromatic Orb', 'Sorcerer', '+7', '1A', '90 ft', 'V,S,M', 'Instant', '3d8, pick type. Two d8s match: leaps 30 ft. 50 gp diamond.'],
  [7, 'X', 'Disguise Self', 'Sorcerer', '--', '1A', 'Self', 'V,S', '1 hour', 'Look like someone else. Investigation vs DC 15.'],
  [8, '', '=== LEVEL 2 ===', '3 x Level 2 Slots OOO', '', '', '', '', '', ''],
  [9, 'X', 'Misty Step', 'Sorcerer', '--', '1BA', 'Self', 'V', 'Instant', 'Teleport up to 30 ft to a space you can see.'],
  [10, 'X', 'Detect Thoughts', 'Sorcerer', 'DC15', '1A', 'Self', 'V,S,M', 'Conc 1 min', 'Minds within 30 ft. WIS save to dig deeper. Subtle = unseen.'],
  [11, 'X', 'Scorching Ray', 'Sorcerer', '+7', '1A', '120 ft', 'V,S', 'Instant', '3 rays, 2d6 fire each. Spread or stack them.'],
  [12, '', '=== LEVEL 3 ===', '2 x Level 3 Slots OO', '', '', '', '', '', ''],
  [13, 'X', 'Fireball', 'Sorcerer', 'DC15', '1A', '150 ft', 'V,S,M', 'Instant', 'DEX save: 8d6 fire in 20 ft, half on a save. Careful = Pim safe.'],
  [14, 'X', 'Counterspell', 'Sorcerer', 'DC15', '1R', '60 ft', 'S', 'Instant', 'CON save. Fail: their spell does nothing (slot not used).'],
  [16, '', 'Careful Spell', '', '1 SP', '--', '--', '--', '--', 'Up to 4 creatures auto-succeed; no damage on a success.'],
  [22, '', 'Subtle Spell', '', '1 SP', '--', '--', '--', '--', 'No Verbal, Somatic or non-costly Material components.'],
  [24, '', '=== FONT OF MAGIC ===', '', '', '', '', '', '', ''],
  [25, '', 'Make a slot', '', '2-5 SP', '1BA', '--', '--', 'Long Rest', 'Level 1 = 2 SP, level 2 = 3 SP, level 3 = 5 SP.'],
  [26, '', 'Slot -> SP', '', '--', '--', '--', '--', '--', 'No action: gain SP equal to the slot\'s level.']
];

/* ---------- surge pages ---------- */
const SURGE_FILL = { g: rgb(0.79, 0.965, 0.855), m: rgb(1, 0.945, 0.78), b: rgb(1, 0.84, 0.84) };
const SURGE_LEGEND = [['g', 'mostly good'], ['m', 'weird / mixed'], ['b', 'mostly bad']];

function portrait(page) {
  const ink = rgb(0.08, 0.08, 0.08), yellow = rgb(1, 0.85, 0.24), white = rgb(1, 1, 1), hair = rgb(0.23, 0.16, 0.1);
  const ellipse = (cx, cy, rx, ry) => `M${cx - rx} ${cy}A${rx} ${ry} 0 1 0 ${cx + rx} ${cy}A${rx} ${ry} 0 1 0 ${cx - rx} ${cy}Z`;
  /* Charlie's face from site/charlie/icon.svg (viewBox 0 0 100 100), centred in the CHARACTER APPEARANCE picture box */
  const at = { x: 53, y: 658, scale: 1.3 };
  const shapes = [
    [ellipse(50, 57, 38, 37), yellow, 4],
    ['M12 54C9 24 29 7 52 7C77 7 93 25 88 54L81 41L73 51L65 37L55 49L46 35L37 49L28 37L20 51Z', hair, 4],
    [ellipse(37, 62, 8, 9), white, 3], [ellipse(37, 65, 3.5, 3.5), ink, 0], ['M28.6 61A8.4 9 0 0 1 45.4 61Z', yellow, 3],
    [ellipse(63, 62, 8, 9), white, 3], [ellipse(63, 65, 3.5, 3.5), ink, 0], ['M54.6 61A8.4 9 0 0 1 71.4 61Z', yellow, 3],
    ['M49 70Q46 75 51 75', null, 2.5], ['M40 83Q50 80 60 83', null, 3.5]
  ];
  for (const [d, fill, stroke] of shapes) {
    page.drawSvgPath(d, {
      ...at, color: fill || undefined,
      borderColor: stroke ? ink : undefined, borderWidth: stroke || undefined, borderLineCap: 1
    });
  }
}

function wrap(font, text, size, width) {
  const lines = [];
  let line = '';
  for (const word of text.split(' ')) {
    const next = line ? line + ' ' + word : word;
    if (line && font.widthOfTextAtSize(next, size) > width) { lines.push(line); line = word; } else line = next;
  }
  lines.push(line);
  return lines;
}

async function addSurgePages(doc, templateBytes) {
  const clean = await PDFDocument.load(templateBytes);
  const pages = await doc.copyPages(clean, [3, 3]);
  const reg = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const ink = rgb(0.08, 0.08, 0.08), grey = rgb(0.4, 0.4, 0.4), line = rgb(0.82, 0.82, 0.82), white = rgb(1, 1, 1);
  const center = (page, text, font, size, x, y, w, h) =>
    page.drawText(text, { x: x + (w - font.widthOfTextAtSize(text, size)) / 2, y: y + (h - size * 0.72) / 2, size, font, color: ink });

  const halves = [[0, 50], [50, 100]];
  pages.forEach((page, i) => {
    /* the copy is the clean spell page: drop its form widgets, then reuse the header and the big box */
    page.node.delete(PDFName.of('Annots'));
    doc.addPage(page);
    page.drawText(CLASS, { x: 52, y: 711, size: 13, font: reg, color: ink });
    center(page, 'CHA', reg, 18, 284, 711, 65, 24);
    center(page, '15', reg, 18, 384, 711, 65, 24);
    center(page, '+7', reg, 18, 488, 711, 65, 24);
    page.drawRectangle({ x: 24, y: 637, width: 450, height: 14, color: white });
    page.drawRectangle({ x: 280, y: 33, width: 52, height: 10, color: white });
    center(page, 'WILD MAGIC SURGE', bold, 6.5, 206, 33, 200, 10);

    const [from, to] = halves[i];
    let y = 640;
    page.drawText(`WILD MAGIC SURGE - d100 - ${from + 1}-${to}`, { x: 30, y: y - 4, size: 11, font: bold, color: ink });
    y -= 16;
    if (i === 0) {
      let x = 30;
      for (const [k, label] of SURGE_LEGEND) {
        const w = bold.widthOfTextAtSize(label, 7) + 8;
        page.drawRectangle({ x, y: y - 3, width: w, height: 10, color: SURGE_FILL[k] });
        page.drawText(label, { x: x + 4, y, size: 7, font: bold, color: ink });
        x += w + 5;
      }
      for (const l of wrap(reg, 'House rule: replaces the Player\'s Handbook table. Surge spells: no Metamagic, no Concentration (full duration). DC = your spell save DC (15).', 7, 582 - x)) {
        page.drawText(l, { x, y, size: 7, font: reg, color: grey });
        y -= 8.5;
      }
      y -= 4;
    } else y -= 2;

    const bottom = i === 1 ? 62 : 50;
    const textX = 54, textW = 584 - textX;
    const rows = SURGE.rows.slice(from, to);
    let size = 7.8;
    const layout = s => rows.map(([, t]) => wrap(reg, t, s, textW));
    let lines = layout(size);
    const height = (ls, s) => ls.reduce((h, l) => h + l.length * s * 1.17 + 2.4, 0);
    while (height(lines, size) > y - bottom && size > 6) { size -= 0.1; lines = layout(size); }

    rows.forEach(([kind], r) => {
      const h = lines[r].length * size * 1.17 + 2.4;
      page.drawRectangle({ x: 30, y: y - h + 0.6, width: 19, height: h - 1.2, color: SURGE_FILL[kind] });
      center(page, String(from + r + 1), bold, size, 30, y - size * 1.17 - 1.2 + 0.4, 19, size * 1.17);
      lines[r].forEach((l, j) => page.drawText(l, { x: textX, y: y - 1.2 - (j + 1) * size * 1.17 + size * 0.25, size, font: reg, color: ink }));
      y -= h;
      page.drawLine({ start: { x: 30, y }, end: { x: 584, y }, thickness: 0.4, color: line });
    });

    if (i === 1) {
      const credit = `Table summarised from "${SURGE.credit}" - ${SURGE.source}`;
      page.drawText(credit, { x: 30, y: 50, size: 6, font: reg, color: grey });
    }
  });
}

(async () => {
  const templateBytes = fs.readFileSync(template);
  const doc = await PDFDocument.load(templateBytes);
  const helv = await doc.embedFont(StandardFonts.Helvetica);
  const form = doc.getForm();
  const fields = new Map(form.getFields().map(f => [f.getName().trim(), f]));
  for (const f of fields.values()) {
    if (f.setText) f.setText('');
    /* old D&D Beyond exports leave reset values (DV) and rich text (RV, shown instead of V by some viewers) */
    for (const key of ['DV', 'RV', 'DS']) f.acroField.dict.delete(PDFName.of(key));
    /* some cells have an invisible 1pt border (no colour) that only shifts their text: make it 0 */
    for (const w of f.acroField.getWidgets()) {
      const mk = w.dict.lookup(PDFName.of('MK')), bs = w.dict.lookup(PDFName.of('BS'));
      if (bs && !(mk && mk.get(PDFName.of('BC')))) bs.set(PDFName.of('W'), doc.context.obj(0));
    }
  }
  /* the picture box has a white background that would hide the portrait drawn under it */
  for (const w of fields.get('CHARACTER IMAGE').acroField.getWidgets()) {
    const mk = w.dict.lookup(PDFName.of('MK'));
    if (mk) mk.delete(PDFName.of('BG'));
  }

  const rect = f => f.acroField.getWidgets()[0].getRectangle();
  const daSize = f => +((f.acroField.getDefaultAppearance() || '').match(/([\d.]+)\s+Tf/) || [0, 10])[1];

  /* sets a field; single-line text shrinks until it fits, multiline text until it fits the box */
  function put(name, value, size) {
    const f = fields.get(name);
    if (!f) throw new Error('Unknown field: ' + name);
    const text = String(value);
    if (text) {
      const r = rect(f);
      const w = Math.abs(r.width) - 3, h = Math.abs(r.height) - 3;
      let s = size || daSize(f) || 10;
      if (f.isMultiline()) {
        const lineCount = t => t.split('\n').reduce((n, p) => n + wrap(helv, p, s, w - 2).length, 0);
        while (lineCount(text) * s * 1.15 > h && s > 4) s -= 0.25;
      } else {
        while (helv.widthOfTextAtSize(text, s) > w && s > 4) s -= 0.25;
      }
      if (s !== daSize(f)) f.setFontSize(s);
    }
    f.setText(text);
  }
  const putAll = obj => Object.entries(obj).forEach(([k, v]) => (Array.isArray(v) ? put(k, v[0], v[1]) : put(k, v)));

  putAll(page1);
  for (const [prof, bonus, mod, p, b, m] of skills) { put(prof, p ? 'P' : ''); put(bonus, b); fields.get(mod).setText(m); }
  attacks.forEach((a, i) => attackFields[i].forEach((name, j) => put(name, a[j], [10, 10, 10, 5.5][j])));

  putAll(page2);
  [...gear, ...Array(15 - gear.length).fill(null), ...pack].forEach((g, i) => {
    if (g) { put('Eq Name' + i, g[0], 8.5); put('Eq Qty' + i, g[1], 10); put('Eq Weight' + i, g[2], 10); }
  });

  putAll(page3);
  portrait(doc.getPage(2));

  putAll(page4);
  for (const [key, title, slots, notes] of spellHeaders) {
    put('spellHeader' + key, title, 8);
    put('spellSlotHeader' + key, slots, 8);
    put('spellNotesHeader' + key, notes, 5.8);
  }
  for (const [row, prep, name, source, saveHit, time, range, comp, dur, notes] of spellRows) {
    const late = typeof row === 'number' && row >= 22;
    const col = c => (late ? c : 'spell' + c);
    const header = name.startsWith('===');
    /* the template mixes centred and left-aligned cells; left-align them all so the columns line up */
    const cell = (field, value, size) => { put(field, value, size); fields.get(field).setAlignment(TextAlignment.Left); };
    put(col('Prepared') + row, prep);
    cell((late ? 'SpellName' : 'spellName') + row, name, header ? 8 : 11);
    if (!late) cell('spellSource' + row, source, header ? 8 : 11);
    cell(col('SaveHit') + row, saveHit, 7);
    cell(col('CastingTime') + row, time, 7);
    cell(col('Range') + row, range, 7);
    cell(col('Components') + row, comp, 7);
    cell(col('Duration') + row, dur, 7);
    cell(col('Notes') + row, notes, 5.8);
  }

  await addSurgePages(doc, templateBytes);
  doc.setTitle(`${NAME} - ${CLASS}`);
  fs.writeFileSync(output, await doc.save());
  console.log('Saved', output, '-', doc.getPageCount(), 'pages');
})().catch(err => { console.error(err); process.exit(1); });

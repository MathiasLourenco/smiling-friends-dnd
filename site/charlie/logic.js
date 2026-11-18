/* Charlie app — state, dice and rules engine (D&D 2024). */
(function () {
  'use strict';
  const D = window.CHD, C = D.ch, SPL = D.spells, T = window.SURGE.rows;
  const A = window.CA = {};
  const KEY = 'sf-dnd-charlie-v1';

  const rand = (sides) => {
    const buf = new Uint32Array(1);
    const limit = Math.floor(0x100000000 / sides) * sides;
    let x;
    do { crypto.getRandomValues(buf); x = buf[0]; } while (x >= limit);
    return 1 + (x % sides);
  };
  const roll = (n, s) => Array.from({ length: n }, () => rand(s));
  const sum = (a) => a.reduce((x, y) => x + y, 0);
  const sign = (n) => (n >= 0 ? '+' + n : '−' + Math.abs(n));
  const mod = (score) => Math.floor((score - 10) / 2);
  const pick = (arr) => arr[rand(arr.length) - 1];
  const dice = (n, s) => { const r = roll(n, s); return `<b>${sum(r)}</b> [${r.join(', ')}]`; };
  Object.assign(A, { rand, roll, sum, sign, mod });

  A.ABS = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
  A.SKILLS = [['Acrobatics', 'DEX'], ['Animal Handling', 'WIS'], ['Arcana', 'INT'], ['Athletics', 'STR'], ['Deception', 'CHA'],
    ['History', 'INT'], ['Insight', 'WIS'], ['Intimidation', 'CHA'], ['Investigation', 'INT'], ['Medicine', 'WIS'], ['Nature', 'INT'],
    ['Perception', 'WIS'], ['Performance', 'CHA'], ['Persuasion', 'CHA'], ['Religion', 'INT'], ['Sleight of Hand', 'DEX'],
    ['Stealth', 'DEX'], ['Survival', 'WIS']];
  A.SLOT_COST = { 1: 2, 2: 3, 3: 5 };

  /* ---------- State ---------- */
  const freshTurn = () => ({ slot: false, check: false });
  function fresh() {
    return { tab: 'combat', hp: C.maxHp, temp: 0, death: { s: 0, f: 0 }, hd: C.level,
      slots: { 1: 4, 2: 3, 3: 2 }, sp: C.spMax, luck: C.luckMax, heroic: true, innate: C.innateMax, innateLeft: 0, resto: true,
      tides: true, armed: false, mode: 0, meta: '', autoCheck: true, mageArmor: false, shield: false, conc: null,
      inCombat: false, round: 0, turn: freshTurn(), chain: 0, surges: [], surgeCount: 0, hit: 0, filter: 'all', q: '',
      amt: '', last: null, lastTest: null, resultOpen: true, scrollTo: 0 };
  }
  function merge(base, saved) {
    Object.keys(saved).forEach((k) => {
      const b = base[k], v = saved[k];
      if (v && typeof v === 'object' && !Array.isArray(v) && b && typeof b === 'object' && !Array.isArray(b)) merge(b, v);
      else base[k] = v;
    });
    return base;
  }
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return merge(fresh(), JSON.parse(raw));
    } catch (e) { /* broken storage: start fresh */ }
    return fresh();
  }
  A.st = load();
  A.save = () => { try { localStorage.setItem(KEY, JSON.stringify(A.st)); } catch (e) { /* full or private mode */ } };
  A.reset = () => { A.st = fresh(); };
  const S = () => A.st;

  /* ---------- Derived numbers ---------- */
  A.abMod = (ab) => mod(C.abilities[ab]);
  A.saveMod = (ab) => A.abMod(ab) + (C.saveProf.includes(ab) ? C.prof : 0);
  A.skillAb = (name) => A.SKILLS.find((k) => k[0] === name)[1];
  A.skillMod = (name) => A.abMod(A.skillAb(name)) + (C.skillProf.includes(name) ? C.prof : 0);
  A.innateOn = () => S().innateLeft > 0;
  A.dc = () => C.dc + (A.innateOn() ? 1 : 0);
  A.ac = () => (S().mageArmor ? 13 : 10) + A.abMod('DEX') + (S().shield ? 5 : 0);
  A.slotMax = (l) => Math.max(C.slotsMax[l], S().slots[l]);
  A.dmgDice = (sp, lvl) => (sp.dmg ? [sp.dmg[0] + (sp.up ? (lvl - sp.lvl) * sp.up : 0), sp.dmg[1]] : null);

  /* ---------- Result panel ---------- */
  A.show = (res) => {
    res.lines = (res.lines || []).filter(Boolean);
    res.buttons = res.buttons || [];
    S().last = res;
    S().resultOpen = true;
  };
  A.note = (title, lines, extra) => A.show(Object.assign({ title, lines: lines || [] }, extra || {}));

  /* ---------- d20 tests ---------- */
  const TIDES_USED = '🌊 Tides of Chaos used. Your next spell with a spell slot surges and recharges it.';

  function takeMode(adv, dis) {
    const s = S();
    adv = (adv || []).slice(); dis = (dis || []).slice();
    if (s.mode === 1) adv.push('situational');
    if (s.mode === -1) dis.push('situational');
    s.mode = 0;
    return { adv, dis };
  }
  function settle(t) {
    t.nat = t.mode > 0 ? Math.max.apply(null, t.rolls) : t.mode < 0 ? Math.min.apply(null, t.rolls) : t.rolls[0];
    t.total = t.nat + t.mod;
  }
  function d20(t, m) {
    const s = S();
    t.adv = m.adv.slice(); t.dis = m.dis.slice();
    if (s.armed && s.tides) { t.adv.push('Tides'); s.tides = false; s.armed = false; t.tides = true; }
    t.mode = t.adv.length && t.dis.length ? 0 : t.adv.length ? 1 : t.dis.length ? -1 : 0;
    t.rolls = roll(t.mode ? 2 : 1, 20);
    settle(t);
    return t;
  }
  function diceLine(t) {
    const base = (t.rolls.length > 1 ? `d20 ${t.rolls.join(' / ')} → ${t.nat}` : `d20 ${t.nat}`) + ` ${sign(t.mod)}`;
    const why = t.mode > 0 ? 'adv: ' + t.adv.join(', ') : t.mode < 0 ? 'dis: ' + t.dis.join(', ') : t.adv.length && t.dis.length ? 'adv & dis cancel' : '';
    return why ? `${base} · ${why}` : base;
  }
  A.diceLine = diceLine;
  function post(t) {
    const s = S(), b = [];
    const luckHelps = t.mode < 0 || (t.mode === 0 && !t.dis.length);
    if (s.luck > 0 && !t.luck && luckHelps) b.push({ label: `🍀 Lucky (${s.luck})`, act: 'lucky', cls: 'sm ghost' });
    if (s.heroic && !t.hero) b.push({ label: '⭐ Heroic reroll', act: 'heroic', cls: 'sm ghost' });
    return b;
  }
  function extras(t, lines) {
    if (t.heroNote) lines.push(t.heroNote);
    if (t.luck) lines.push('🍀 Luck Point spent for advantage.');
    if (t.tides) lines.push(TIDES_USED);
    return lines;
  }

  const BUILD = {
    check(t) {
      const lines = [];
      if (t.dc !== undefined) lines.push(t.total >= t.dc ? `✔ Success vs DC ${t.dc}.` : `✘ Fail vs DC ${t.dc}.`);
      A.show({ title: t.label, big: t.total, sub: diceLine(t), lines: extras(t, lines), buttons: post(t), nat: t.nat });
    },
    init(t) {
      A.show({ title: '⚔️ Initiative', big: t.total, sub: diceLine(t), lines: extras(t, ['Round 1 — turn tracker running.']), buttons: post(t), nat: t.nat });
    },
    death(t) {
      const s = S(), lines = [];
      s.death = { s: t.before.s, f: t.before.f };
      s.hp = 0;
      if (t.nat === 20) { s.hp = 1; s.death = { s: 0, f: 0 }; lines.push('🎉 Natural 20: you regain 1 HP and wake up.'); }
      else if (t.nat === 1) { s.death.f += 2; lines.push('✘✘ Natural 1: two failures.'); }
      else if (t.total >= 10) { s.death.s += 1; lines.push('✔ Success.'); }
      else { s.death.f += 1; lines.push('✘ Failure.'); }
      if (s.death.s >= 3) lines.push('Stable at 0 HP.');
      if (s.death.f >= 3) lines.push('💀 Three failures.');
      A.show({ title: '💀 Death save', big: t.total, sub: diceLine(t), lines: extras(t, lines), buttons: post(t), nat: t.nat });
    },
    conc(t) {
      const s = S(), pass = t.total >= t.dc, name = SPL[t.spell].name;
      s.conc = pass ? t.spell : null;
      const lines = t.pre.concat([pass ? `✔ ${name} holds.` : `✘ ${name} ends.`]);
      A.show({ title: `🧠 Concentration · DC ${t.dc}`, big: t.total, sub: diceLine(t), lines: extras(t, lines), buttons: post(t), nat: t.nat });
    },
    atk(t) {
      const sp = SPL[t.spell], crit = t.nat === 20;
      if (!t.dmg || t.dmg.crit !== crit) t.dmg = rollDmg(t.spell, t.lvl, crit);
      const lines = t.pre.slice();
      if (t.nat === 1) lines.push('✘ Natural 1: automatic miss.');
      else {
        lines.push(`${crit ? '💥 <b>Critical hit</b> (dice doubled). ' : 'Hits if ≥ AC. '}Damage: <b>${t.dmg.total}</b>${sp.type === 'chosen type' ? '' : ' ' + sp.type} — ${t.dmg.desc}`);
        if (sp.type === 'chosen type') lines.push(t.spell === 'orb' ? 'Type: acid, cold, fire, lightning, poison or thunder.' : 'Type: acid, cold, fire, lightning, poison, psychic or thunder.');
        if (t.spell === 'grasp') lines.push('On a hit: no opportunity attacks for the target until its next turn.');
      }
      extras(t, lines);
      const btns = post(t);
      if (t.spell === 'orb' && t.nat !== 1 && t.dmg.leap && t.leaps > 0) {
        lines.push(`🔁 Matching d8s: if it hits, the orb leaps to another creature within 30 ft (${t.leaps} leap${t.leaps > 1 ? 's' : ''} left).`);
        btns.push({ label: '↪ Leap', act: 'leap', cls: 'sm' });
      }
      A.show({ title: `${t.leap ? '↪' : '✨'} ${sp.name}${t.lvl ? ' · L' + t.lvl : ''}${t.leap ? ' (leap)' : ''}`, big: t.total,
        sub: `to hit · ${diceLine(t)}`, lines: lines.concat(t.surge || []), buttons: btns.concat(t.sbtns || []), nat: t.nat });
    }
  };

  A.test = (o) => {
    const t = d20({ kind: o.kind || 'check', label: o.label, mod: o.mod, dc: o.dc }, takeMode(o.adv, o.dis));
    S().lastTest = t;
    BUILD[t.kind](t);
  };
  A.rollSkill = (name) => A.test({ label: `${name} (${A.skillAb(name)})`, mod: A.skillMod(name) });
  A.rollAbility = (ab) => A.test({ label: `${ab} check`, mod: A.abMod(ab) });
  A.rollSave = (arg) => {
    const p = String(arg).split(':');
    A.test({ label: `${p[0]} save`, mod: A.saveMod(p[0]), dc: p[1] ? Number(p[1]) : undefined });
  };
  A.deathSave = () => {
    const s = S();
    const t = d20({ kind: 'death', mod: 0, before: { s: s.death.s, f: s.death.f } }, takeMode());
    s.lastTest = t;
    BUILD.death(t);
  };
  function concSave(dc, pre) {
    const s = S();
    const t = d20({ kind: 'conc', mod: A.saveMod('CON'), dc, spell: s.conc, pre }, takeMode(['War Caster']));
    s.lastTest = t;
    BUILD.conc(t);
  }
  A.lucky = () => {
    const s = S(), t = s.lastTest;
    if (!t || t.luck || s.luck < 1) return;
    s.luck--; t.luck = true; t.adv.push('Lucky');
    if (t.dis.length) { t.mode = 0; t.rolls = [t.rolls[0]]; } else { t.mode = 1; t.rolls.push(rand(20)); }
    settle(t);
    BUILD[t.kind](t);
  };
  A.heroic = () => {
    const s = S(), t = s.lastTest;
    if (!t || t.hero || !s.heroic) return;
    s.heroic = false; t.hero = true;
    const i = t.rolls.indexOf(Math.min.apply(null, t.rolls)), old = t.rolls[i];
    t.rolls[i] = rand(20);
    t.heroNote = `⭐ Heroic Inspiration: rerolled ${old} → ${t.rolls[i]}.`;
    settle(t);
    BUILD[t.kind](t);
  };

  /* ---------- HP ---------- */
  A.heal = (n) => {
    const s = S(), was0 = s.hp === 0;
    s.hp = Math.min(C.maxHp, s.hp + n);
    if (was0 && s.hp > 0) s.death = { s: 0, f: 0 };
  };
  A.takeDamage = (amount) => {
    const s = S();
    let a = Math.floor(amount);
    if (!(a > 0)) return;
    const taken = a, lines = [];
    if (s.hp === 0) {
      s.death.f += 1;
      return A.show({ title: '💥 Hit at 0 HP', big: '−' + taken, lines: ['+1 failed death save (2 if it was a critical hit).', s.death.f >= 3 ? '💀 Three failures.' : ''] });
    }
    const ft = Math.min(s.temp, a);
    s.temp -= ft; a -= ft;
    if (ft) lines.push(`${ft} absorbed by temp HP.`);
    s.hp -= a;
    if (s.hp <= 0) {
      const over = -s.hp;
      s.hp = 0; s.death = { s: 0, f: 0 };
      lines.push(over >= C.maxHp ? '☠️ Remaining damage ≥ max HP: instant death.' : '😵 0 HP: unconscious. Death save at the start of each turn.');
      if (s.conc) { lines.push(`${SPL[s.conc].name} ends.`); s.conc = null; }
      return A.show({ title: '💥 Damage', big: '−' + taken, sub: `0/${C.maxHp} HP`, lines });
    }
    if (s.conc) {
      lines.unshift(`−${taken} → ${s.hp}/${C.maxHp} HP.`);
      return concSave(Math.min(30, Math.max(10, Math.floor(taken / 2))), lines);
    }
    A.show({ title: '💥 Damage', big: '−' + taken, sub: `${s.hp}/${C.maxHp} HP`, lines });
  };

  /* ---------- Wild Magic Surge ---------- */
  const SELF_SAVE = { 8: 'DEX', 9: 'DEX', 14: 'WIS', 15: 'WIS', 20: 'DEX', 63: 'STR', 78: 'WIS' };
  const LEVEL1 = ['Alarm', 'Animal Friendship', 'Armor of Agathys', 'Arms of Hadar', 'Bane', 'Bless', 'Burning Hands', 'Charm Person',
    'Chromatic Orb', 'Color Spray', 'Command', 'Compelled Duel', 'Comprehend Languages', 'Create or Destroy Water', 'Cure Wounds',
    'Detect Evil and Good', 'Detect Magic', 'Detect Poison and Disease', 'Disguise Self', 'Dissonant Whispers', 'Divine Favor',
    'Ensnaring Strike', 'Entangle', 'Expeditious Retreat', 'Faerie Fire', 'False Life', 'Feather Fall', 'Find Familiar', 'Fog Cloud',
    'Goodberry', 'Grease', 'Guiding Bolt', 'Hail of Thorns', 'Healing Word', 'Hellish Rebuke', 'Heroism', 'Hex', 'Hunter\'s Mark',
    'Ice Knife', 'Identify', 'Illusory Script', 'Inflict Wounds', 'Jump', 'Longstrider', 'Mage Armor', 'Magic Missile',
    'Protection from Evil and Good', 'Purify Food and Drink', 'Ray of Sickness', 'Sanctuary', 'Searing Smite', 'Shield',
    'Shield of Faith', 'Silent Image', 'Sleep', 'Speak with Animals', 'Tasha\'s Hideous Laughter', 'Tenser\'s Floating Disk',
    'Thunderous Smite', 'Thunderwave', 'Unseen Servant', 'Wrathful Smite'];
  const dcTxt = () => `DC ${A.dc()}`;
  const FX = {
    2: (b) => {
      const n = S().sp;
      if (!n) return 'You have 0 Sorcery Points: no effect.';
      const r = roll(n, 6), t = sum(r);
      b.push({ label: `Apply: −${t} HP, +${t} temp, SP → 0`, act: 'surge2', arg: t, cls: 'sm' });
      return `${n} SP → ${n}d6 [${r.join(', ')}] = <b>${t}</b> force damage, then ${t} temp HP.`;
    },
    7: () => `Type: <b>${pick(['acid', 'cold', 'fire', 'lightning', 'poison'])}</b>. Magic action for 1 minute: 15 ft cone, DEX save ${dcTxt()}, 3d6 (half on a success).`,
    8: () => `8d6 = ${dice(8, 6)} fire. DEX save ${dcTxt()} for half — you're in it too.`,
    9: () => `2d10 = ${dice(2, 10)} bludgeoning + 4d6 = ${dice(4, 6)} cold. DEX save ${dcTxt()} for half — you're in it too.`,
    10: () => { const r = roll(7, 4).map((x) => x + 1); return `7 darts (1d4+1 force each): ${r.join(', ')} = <b>${sum(r)}</b>.`; },
    12: () => { const d = rand(10); return `d10 = ${d}: you ${d % 2 ? 'shrink' : 'grow'} ${d} inches.`; },
    14: () => `WIS save ${dcTxt()} for everyone in the 10 ft sphere, you included.`,
    15: () => `WIS save ${dcTxt()} to resist.`,
    20: () => `DEX save ${dcTxt()} or fall prone (you're in the area).`,
    36: () => { const d = rand(10); return `d10 = ${d}: you get ${d} years ${d % 2 ? 'younger' : 'older'}.`; },
    38: () => `<b>${rand(6)}</b> Flumph(s).`,
    40: () => { const r = roll(2, 10), t = sum(r); A.heal(t); return `2d10 [${r.join(', ')}] = <b>${t}</b> HP regained (now ${S().hp}/${C.maxHp}).`; },
    54: () => `5d6 = ${dice(5, 6)} days.`,
    60: () => {
      const s = S();
      for (let l = 1; l <= 3; l++) if (s.slots[l] < C.slotsMax[l]) { s.slots[l]++; return `Level ${l} slot regained.`; }
      return 'No expended slots: nothing to regain.';
    },
    63: () => `STR save ${dcTxt()} or restrained (you're in the area).`,
    65: () => `6d6 = ${dice(6, 6)} psychic.`,
    66: () => `4d10 = ${dice(4, 10)} lightning.`,
    67: () => `Explosion: 3d10 = ${dice(3, 10)} force.`,
    74: () => `Duration: <b>${rand(4)}</b> hours. Vomiting: 3d10 = ${dice(3, 10)} poison.`,
    78: () => `WIS save ${dcTxt()} (you can choose to fail).`,
    84: () => `1d10 per creature: ${roll(6, 10).join(', ')} … (one per creature, in order). You heal the total.`,
    85: () => `3d10 = ${dice(3, 10)} HP each.`,
    88: () => `3d10 = ${dice(3, 10)} acid. Disadvantage for <b>${rand(6)}</b> days.`,
    91: () => `Random pick: <b>${pick(LEVEL1)}</b> (or the DM chooses).`,
    99: () => { S().sp = C.spMax; return `Sorcery Points: ${C.spMax}/${C.spMax}.`; },
    100: () => { const s = S(); s.hp = C.maxHp; s.death = { s: 0, f: 0 }; return `HP: ${C.maxHp}/${C.maxHp}.`; }
  };
  const rollTable = (ignore) => { let n; do { n = rand(100); } while (ignore && ignore.indexOf(n) >= 0); return n; };
  function record(n) {
    const s = S();
    s.surges.unshift({ n, r: s.inCombat ? s.round : 0 });
    if (s.surges.length > 12) s.surges.length = 12;
    s.hit = n;
    s.surgeCount++;
  }
  function shiftBtns(m, btns) {
    if (S().sp < 1) return;
    if (m > 1) btns.push({ label: `◀ ${m - 1} (1 SP)`, act: 'shift', arg: `${m}:-1`, cls: 'sm ghost' });
    if (m < 100) btns.push({ label: `${m + 1} ▶ (1 SP)`, act: 'shift', arg: `${m}:1`, cls: 'sm ghost' });
  }
  function applySurge(n, lines, btns) {
    record(n);
    lines.push(`🌀 <b>Surge ${n}</b> — ${T[n - 1][1]}`);
    if (FX[n]) { const out = FX[n](btns); if (out) lines.push(`↳ ${out}`); }
    if (SELF_SAVE[n]) btns.push({ label: `Your ${SELF_SAVE[n]} save (${dcTxt()})`, act: 'save', arg: `${SELF_SAVE[n]}:${A.dc()}`, cls: 'sm ghost' });
    if (n === 1) { S().chain = 10; lines.push('↳ Chain reaction: a surge is rolled each time you press New turn (10 turns).'); }
    if (n === 3) { lines.push('↳ Two extra rolls:'); applySurge(rollTable([3]), lines, btns); applySurge(rollTable([3]), lines, btns); }
    if (n === 97) { const m = rollTable([97]); lines.push('↳ Reroll:'); applySurge(m, lines, btns); shiftBtns(m, btns); }
  }
  function doSurge(lines, btns, ignore) { const n = rollTable(ignore); applySurge(n, lines, btns); return n; }

  A.rollSurge = () => {
    const lines = [], btns = [];
    const n = doSurge(lines, btns);
    A.show({ title: '🌀 Wild Magic Surge', big: n, lines, buttons: btns.concat([{ label: 'Show in table', act: 'goto', arg: n, cls: 'sm ghost' }]) });
  };
  A.surgeCheck = () => {
    const d = rand(20);
    if (d !== 20) return A.note('🎲 Surge check', ['No surge (needs a 20).'], { big: d });
    const lines = ['20 → surge!'], btns = [];
    doSurge(lines, btns);
    A.show({ title: '🎲 Surge check', big: 20, nat: 20, lines, buttons: btns });
  };
  A.shift = (arg) => {
    const s = S(), p = String(arg).split(':').map(Number), n = p[0] + p[1];
    if (s.sp < 1) return A.note('No Sorcery Points left', ['Shifting costs 1 SP per step.']);
    if (n < 1 || n > 100) return;
    s.sp--;
    const lines = [`Shifted ${p[0]} → ${n} (1 SP, ${s.sp} left).`], btns = [];
    applySurge(n, lines, btns);
    if (n !== 97) shiftBtns(n, btns);
    A.show({ title: `🌀 Surge ${n}`, big: n, lines, buttons: btns });
  };
  A.surge2 = (t) => {
    const s = S();
    t = Number(t);
    s.sp = 0;
    A.takeDamage(t);
    s.temp = Math.max(s.temp, t);
    if (s.last) s.last.lines.push(`+${t} temp HP (1 hour). Sorcery Points: 0.`);
  };

  function surgeAfterCast(own, lines, btns) {
    const s = S();
    if (!s.tides) {
      s.tides = true;
      lines.push('🌊 Tides was spent → automatic surge. <b>Tides of Chaos is ready again.</b>');
      doSurge(lines, btns);
      return;
    }
    if (!s.autoCheck) return;
    if (own && s.turn.check) { lines.push('Surge check already rolled this turn.'); return; }
    if (own) s.turn.check = true;
    const d = rand(20);
    if (d === 20) { lines.push('🎲 Surge check: <b>20</b> → surge!'); doSurge(lines, btns); }
    else lines.push(`🎲 Surge check: ${d} — no surge.`);
  }

  /* ---------- Casting ---------- */
  function rollDmg(id, lvl, crit) {
    const dd = A.dmgDice(SPL[id], lvl), n = dd[0] * (crit ? 2 : 1), r = roll(n, dd[1]), extra = [];
    if (id === 'burst') {
      let pending = r.filter((x) => x === 8).length;
      while (pending > 0 && extra.length < A.abMod('CHA')) { const x = rand(8); extra.push(x); pending--; if (x === 8) pending++; }
    }
    let desc = `${n}d${dd[1]} [${r.join(', ')}]`;
    if (extra.length) desc += ` + ${extra.length}d8 from 8s [${extra.join(', ')}]`;
    return { crit, total: sum(r) + sum(extra), desc, leap: id === 'orb' && new Set(r).size < r.length };
  }
  const innateAdv = () => (A.innateOn() ? ['Innate Sorcery'] : []);

  A.cast = (arg, force) => {
    const s = S(), p = String(arg).split(':'), id = p[0], sp = SPL[id];
    if (!sp) return;
    const lvl = sp.lvl ? Number(p[1] || sp.lvl) : 0;
    if (lvl && s.slots[lvl] < 1) {
      const cost = A.SLOT_COST[lvl];
      return A.note(`No level ${lvl} slots left`, [`Font of Magic: create one for ${cost} SP (bonus action). You have ${s.sp} SP.`],
        { buttons: s.sp >= cost ? [{ label: `Create L${lvl} slot (${cost} SP)`, act: 'create', arg: lvl, cls: 'sm' }] : [] });
    }
    const own = s.inCombat && !sp.reaction;
    if (lvl && own && s.turn.slot && !force) {
      return A.note('One spell slot per turn', ['You already expended a spell slot this turn. Reactions on another creature\'s turn are fine.'],
        { buttons: [{ label: 'Cast anyway', act: 'castForce', arg: `${id}:${lvl}`, cls: 'sm ghost' }] });
    }
    const meta = s.meta;
    if (meta === 'careful' && !sp.save) return A.note('Careful Spell needs a saving throw', [`${sp.name} has no save. Turn Careful off or pick another spell. Nothing spent.`]);
    if (meta && s.sp < 1) return A.note('No Sorcery Points for Metamagic', ['Metamagic costs 1 SP. Nothing spent.']);

    const pre = [];
    if (meta) {
      s.sp -= 1; s.meta = '';
      pre.push(meta === 'careful'
        ? `🛡️ Careful Spell (1 SP): up to ${A.abMod('CHA')} creatures auto-succeed on the save${sp.half ? ' and take no damage' : ''}.`
        : `🤫 Subtle Spell (1 SP): no Verbal, Somatic or Material components${/gp/.test(sp.comp) ? ' (the 50 gp diamond is still needed)' : ''}.`);
    }
    const sub = lvl ? `Level ${lvl} slot · ${s.slots[lvl] - 1} left` : 'Cantrip';
    if (lvl) { s.slots[lvl]--; if (own) s.turn.slot = true; }
    if (sp.conc) {
      if (s.conc && s.conc !== id) pre.push(`${SPL[s.conc].name} ends (new concentration).`);
      s.conc = id;
    }
    if (id === 'armor') s.mageArmor = true;
    if (id === 'shield') s.shield = true;
    const surge = [], sbtns = [];
    if (lvl) surgeAfterCast(own, surge, sbtns);
    const title = `✨ ${sp.name}${lvl ? ' · L' + lvl : ''}`;

    if (sp.kind === 'atk') {
      const t = d20({ kind: 'atk', spell: id, lvl, mod: C.atk, pre, surge, sbtns, leaps: id === 'orb' ? lvl : 0 }, takeMode(innateAdv()));
      s.lastTest = t;
      return BUILD.atk(t);
    }
    s.lastTest = null;
    if (sp.kind === 'rays') {
      const n = sp.rays + (lvl - sp.lvl), m = takeMode(innateAdv()), lines = pre.slice();
      let total = 0;
      for (let i = 0; i < n; i++) {
        const t = d20({ mod: C.atk }, m);
        const r = roll(t.nat === 20 ? 4 : 2, 6), dmg = sum(r);
        if (t.nat !== 1) total += dmg;
        lines.push(`Ray ${i + 1}: <b>${t.total}</b> to hit (${diceLine(t)}) → ${t.nat === 1 ? 'miss (nat 1)' : `<b>${dmg}</b> fire${t.nat === 20 ? ' 💥 crit' : ''} [${r.join(', ')}]`}`);
        if (t.tides) lines.push(TIDES_USED);
      }
      return A.show({ title, big: `${n}×`, sub: `${sub} · ${total} fire if every ray hits`, lines: lines.concat(surge), buttons: sbtns });
    }
    if (sp.kind === 'save') {
      const dc = A.dc(), lines = pre.slice();
      let big = dc;
      if (sp.dmg) {
        const dd = A.dmgDice(sp, lvl), r = roll(dd[0], dd[1]), tot = sum(r);
        big = tot;
        lines.push(`${sp.save} save DC <b>${dc}</b>. Fail: <b>${tot}</b> ${sp.type}. Success: ${sp.half ? `<b>${Math.floor(tot / 2)}</b>` : 'nothing'}.`);
        lines.push(`${dd[0]}d${dd[1]} [${r.join(', ')}]`);
        if (id === 'sliver') lines.push('On a fail it also subtracts 1d4 from its next save before the end of your next turn.');
        if (id === 'fireball') lines.push('20 ft radius sphere within 150 ft. Unattended flammable objects ignite.');
      } else if (id === 'counter') {
        lines.push(`The caster makes a CON save vs DC <b>${dc}</b>. Fail: the spell has no effect and its action is wasted (a slot isn't expended).`);
      }
      return A.show({ title, big, sub: `${sub} · ${sp.save} save DC ${dc}`, lines: lines.concat(surge), buttons: sbtns });
    }
    const lines = pre.concat([sp.text]);
    let big;
    if (id === 'armor') { big = A.ac(); lines.push(`AC ${A.ac()} for 8 hours (no armor worn).`); }
    if (id === 'shield') { big = A.ac(); lines.push(`AC ${A.ac()} until the start of your next turn.`); }
    if (id === 'thoughts') lines.push(`Probe deeper: WIS save DC ${A.dc()}.`);
    A.show({ title, big, sub, lines: lines.concat(surge), buttons: sbtns });
  };
  A.leap = () => {
    const s = S(), prev = s.lastTest;
    if (!prev || prev.spell !== 'orb' || prev.leaps < 1) return;
    const t = d20({ kind: 'atk', spell: 'orb', lvl: prev.lvl, mod: C.atk, pre: [], surge: [], sbtns: [], leaps: prev.leaps - 1, leap: true }, takeMode(innateAdv()));
    s.lastTest = t;
    BUILD.atk(t);
  };

  /* ---------- Features & resources ---------- */
  A.arm = () => {
    const s = S();
    if (!s.tides) return A.note('🌊 Tides of Chaos is spent', ['Your next Sorcerer spell with a spell slot surges automatically and recharges it.', 'A Long Rest also recharges it, without a surge.']);
    s.armed = !s.armed;
  };
  A.innate = () => {
    const s = S();
    if (A.innateOn()) { s.innateLeft = 0; return A.note('🔮 Innate Sorcery ended', []); }
    if (s.innate < 1) return A.note('No Innate Sorcery left', ['2 uses per Long Rest.']);
    s.innate--; s.innateLeft = 10;
    A.note('🔮 Innate Sorcery', ['Bonus action · 1 minute (10 rounds).', `Spell save DC <b>${A.dc()}</b> and advantage on spell attack rolls.`, `${s.innate} use${s.innate === 1 ? '' : 's'} left.`]);
  };
  A.create = (l) => {
    const s = S(), cost = A.SLOT_COST[l = Number(l)];
    if (s.sp < cost) return A.note(`Not enough Sorcery Points`, [`A level ${l} slot costs ${cost} SP. You have ${s.sp}.`]);
    s.sp -= cost; s.slots[l]++;
    A.note(`➕ Level ${l} slot created`, [`Bonus action · ${cost} SP spent, ${s.sp} left.`, 'Created slots vanish when you finish a Long Rest.']);
  };
  A.convert = (l) => {
    const s = S();
    l = Number(l);
    if (s.slots[l] < 1) return A.note(`No level ${l} slots left`, []);
    if (s.sp + l > C.spMax) return A.note('Sorcery Points would overflow', [`Max ${C.spMax} SP. You have ${s.sp}.`]);
    s.slots[l]--; s.sp += l;
    A.note(`🔄 Level ${l} slot → ${l} SP`, [`No action needed. Sorcery Points: ${s.sp}/${C.spMax}.`]);
  };
  A.luckDef = () => {
    const s = S();
    if (s.luck < 1) return A.note('No Luck Points left', ['3 per Long Rest.']);
    s.luck--;
    A.note('🍀 Lucky', ['The attack roll against you has disadvantage: the attacker rolls a second d20 and uses the lower one.', `${s.luck} Luck Point${s.luck === 1 ? '' : 's'} left.`]);
  };

  /* ---------- Turns & rests ---------- */
  A.startCombat = () => {
    const s = S();
    s.inCombat = true; s.round = 1; s.turn = freshTurn();
    A.test({ kind: 'init', label: 'Initiative', mod: A.abMod('DEX') });
  };
  A.newTurn = () => {
    const s = S();
    if (!s.inCombat) return;
    s.round++; s.turn = freshTurn();
    const lines = [], btns = [];
    if (s.shield) { s.shield = false; lines.push('Shield ends.'); }
    if (s.innateLeft > 0) { s.innateLeft--; lines.push(s.innateLeft ? `🔮 Innate Sorcery: ${s.innateLeft} rounds left.` : '🔮 Innate Sorcery ends.'); }
    if (s.chain > 0) { s.chain--; lines.push(`Chain reaction (${s.chain} left):`); doSurge(lines, btns, [1]); }
    if (s.hp === 0 && s.death.s < 3 && s.death.f < 3) { lines.push('💀 0 HP: roll a death save.'); btns.push({ label: 'Death save', act: 'deathSave', cls: 'sm' }); }
    if (lines.length) A.show({ title: `Round ${s.round} — your turn`, lines, buttons: btns });
  };
  A.endCombat = () => {
    Object.assign(S(), { inCombat: false, round: 0, turn: freshTurn(), shield: false, innateLeft: 0, chain: 0 });
    A.note('Combat over', ['Shield, Innate Sorcery and chain reaction cleared.']);
  };
  A.shortRest = () => {
    const s = S(), lines = [], btns = [];
    if (s.resto && s.sp < C.spMax) {
      const g = Math.min(2, C.spMax - s.sp);
      s.sp += g; s.resto = false;
      lines.push(`Sorcerous Restoration: +${g} SP (${s.sp}/${C.spMax}). Used until your next Long Rest.`);
    } else lines.push(s.resto ? 'Sorcerous Restoration saved (SP already full).' : 'Sorcerous Restoration already used.');
    lines.push(`Hit dice: ${s.hd}/${C.level} (d6 ${sign(A.abMod('CON'))} each).`);
    if (s.hd > 0 && s.hp < C.maxHp) btns.push({ label: 'Spend hit die', act: 'hitDie', cls: 'sm' });
    if (!s.heroic) btns.push({ label: '🎵 Pim\'s song: Heroic Inspiration', act: 'heroicOn', cls: 'sm ghost' });
    A.note('☕ Short rest', lines, { buttons: btns });
  };
  A.hitDie = () => {
    const s = S();
    if (s.hd < 1) return A.note('No hit dice left', []);
    s.hd--;
    const r = rand(6), g = Math.max(1, r + A.abMod('CON'));
    A.heal(g);
    A.note('🎲 Hit die', [`d6 ${r} ${sign(A.abMod('CON'))} = ${g} HP.`, `${s.hd} hit dice left.`],
      { big: '+' + g, sub: `${s.hp}/${C.maxHp} HP`, buttons: s.hd && s.hp < C.maxHp ? [{ label: 'Another hit die', act: 'hitDie', cls: 'sm' }] : [] });
  };
  A.longRest = () => A.note('🌙 Long rest?', ['Restores HP, hit dice, spell slots (created slots vanish), Sorcery Points, Luck, Innate Sorcery, Sorcerous Restoration, Tides of Chaos and Heroic Inspiration.'],
    { buttons: [{ label: 'Yes, long rest', act: 'longRestYes', cls: 'ok sm' }] });
  A.longRestYes = () => {
    Object.assign(S(), { hp: C.maxHp, temp: 0, death: { s: 0, f: 0 }, hd: C.level, slots: { 1: 4, 2: 3, 3: 2 }, sp: C.spMax, luck: C.luckMax,
      heroic: true, innate: C.innateMax, innateLeft: 0, resto: true, tides: true, armed: false, mageArmor: false, shield: false,
      conc: null, chain: 0, inCombat: false, round: 0, turn: freshTurn(), surgeCount: 0, meta: '', mode: 0 });
    A.note('🌙 Long rest done', ['Everything restored. Tides of Chaos is ready.']);
  };

  A.pip = (arg) => {
    const s = S(), p = String(arg).split(':'), v = Number(p[1]) + 1;
    const map = { s1: [s.slots, 1], s2: [s.slots, 2], s3: [s.slots, 3], sp: [s, 'sp'], luck: [s, 'luck'], innate: [s, 'innate'], hd: [s, 'hd'] };
    const ref = map[p[0]];
    if (!ref) return;
    ref[0][ref[1]] = ref[0][ref[1]] === v ? v - 1 : v;
  };
})();

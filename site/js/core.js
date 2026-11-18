/* Core: dice, saved state, d20 tests, damage and concentration. */
(function () {
  'use strict';
  const D = window.SF, P = D.pim;
  const APP = window.APP = {};
  const KEY = 'sf-dnd-pim-bard-v1';

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
  const ask = (msg) => window.confirm(msg);
  Object.assign(APP, { rand, roll, sum, sign, mod, ask });

  const freshTurn = () => ({ action: false, bonus: false, slot: false });
  function freshPim() {
    return { hp: P.maxHp, temp: 0, aid: false, hitDice: P.level, death: { s: 0, f: 0 },
      slots: { 1: 4, 2: 3, 3: 2 }, bi: P.biMax, charlieBI: false, conc: null,
      inCombat: false, round: 0, turn: freshTurn(), situ: {}, mode: 0, acid: false };
  }
  function freshState() {
    return { tab: 'fight', pim: freshPim(), last: null, lastTest: null, resultOpen: true, amt: '', more: false, feat: false };
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
      if (raw) return merge(freshState(), JSON.parse(raw));
    } catch (e) { /* broken storage: start fresh */ }
    return freshState();
  }
  APP.st = load();
  APP.save = () => { try { localStorage.setItem(KEY, JSON.stringify(APP.st)); } catch (e) { /* full or private mode */ } };
  APP.reset = () => { APP.st = freshState(); };
  APP.freshTurn = freshTurn;

  const S = APP.S = () => APP.st.pim;
  APP.maxHp = () => P.maxHp + (S().aid ? 5 : 0);
  APP.abMod = (ab) => mod(P.abilities[ab]);
  APP.saveMod = (ab) => APP.abMod(ab) + (P.saveProf.includes(ab) ? P.prof : 0);
  APP.skillMod = (name) => {
    const ab = D.SKILLS.find((s) => s[0] === name)[1];
    const bonus = P.expertise.includes(name) ? 2 * P.prof : P.skillProf.includes(name) ? P.prof : Math.floor(P.prof / 2);
    return mod(P.abilities[ab]) + bonus;
  };
  APP.combine = (manual, adv, dis) => {
    const a = manual === 1 || adv, b = manual === -1 || dis;
    return a && b ? 0 : a ? 1 : b ? -1 : 0;
  };
  APP.lowestSlot = (min) => {
    for (let l = Math.max(1, min); l <= 3; l++) if (S().slots[l] > 0) return l;
    return null;
  };

  /* Result panel */
  APP.show = (res) => {
    res.lines = res.lines || [];
    res.buttons = res.buttons || [];
    APP.st.last = res;
    APP.st.resultOpen = true;
  };
  APP.note = (title, lines, extra) => APP.show(Object.assign({ title, lines: lines || [] }, extra || {}));

  /* d20 tests: checks, saves, initiative, death saves, concentration */
  APP.runTest = (t) => {
    t.rolls = t.mode ? roll(2, 20) : roll(1, 20);
    APP.finishTest(t);
  };
  APP.finishTest = (t) => {
    t.nat = t.mode > 0 ? Math.max.apply(null, t.rolls) : t.mode < 0 ? Math.min.apply(null, t.rolls) : t.rolls[0];
    t.die = t.floor10 ? Math.max(10, t.nat) : t.nat;
    t.total = t.die + t.mod;
    APP.st.lastTest = t;
    APP.TESTS[t.kind](t);
  };
  APP.testShow = (t, title, lines, buttons) => {
    let dice = t.rolls.length > 1
      ? `d20: ${t.rolls.join(' & ')} → ${t.nat} (${t.mode > 0 ? 'advantage' : 'disadvantage'})`
      : `d20: ${t.nat}`;
    if (t.die !== t.nat) dice += ' → 10 (Silver Tongue)';
    APP.show({ title, big: t.total, sub: `${dice} ${sign(t.mod)}`, lines, buttons: buttons || [], nat: t.nat });
  };

  APP.TESTS = {
    check(t) {
      const lines = [];
      if (t.note) lines.push(t.note);
      if (t.nat === 20) lines.push('🎉 Natural 20!');
      if (t.nat === 1 && !t.floor10) lines.push('😬 Natural 1.');
      APP.testShow(t, t.label, lines);
    },
    init(t) { APP.testShow(t, '⚔️ Initiative', ['Tell the DM this number.']); },
    conc(t) {
      const c = S(), pass = t.total >= t.dc, name = D.spells[t.spell].name;
      if (!pass && c.conc === t.spell) { c.conc = null; t.ended = true; }
      if (pass && t.ended) { c.conc = t.spell; t.ended = false; }
      APP.testShow(t, `Concentration save (DC ${t.dc})`, (t.prefix || []).concat([pass ? `✔ ${name} keeps going.` : `✘ ${name} ends.`]));
    },
    death(t) {
      const c = S();
      c.death = { s: t.before.s, f: t.before.f };
      c.hp = 0;
      const lines = [];
      if (t.nat === 20) { c.hp = 1; c.death = { s: 0, f: 0 }; lines.push('🎉 You get up with 1 HP.'); }
      else if (t.nat === 1) { c.death.f += 2; lines.push('✘✘ Counts as two failures.'); }
      else if (t.total >= 10) { c.death.s += 1; lines.push('✔ Success.'); }
      else { c.death.f += 1; lines.push('✘ Failure.'); }
      if (c.death.s >= 3) lines.push('You are stable.');
      if (c.death.f >= 3) lines.push('💀 Ask the DM.');
      APP.testShow(t, '💀 Death save', lines);
    }
  };

  /* Damage and healing */
  APP.heal = (amt) => {
    const c = S(), was0 = c.hp === 0;
    c.hp = Math.min(APP.maxHp(), c.hp + amt);
    if (was0 && c.hp > 0) c.death = { s: 0, f: 0 };
  };
  APP.takeDamage = (amount) => {
    const c = S();
    let a = Math.max(0, Math.floor(amount));
    if (!a) return;
    const lines = [];
    if (c.acid) { a = Math.floor(a / 2); lines.push(`Acid/poison: halved to ${a} (Plasmoid).`); c.acid = false; }
    const taken = a;
    if (c.hp === 0) {
      c.death.f += 1;
      lines.push('At 0 HP: 1 failed death save (2 on a crit).');
      return APP.show({ title: '💥 Hit at 0 HP', big: '−' + taken, lines });
    }
    const fromTemp = Math.min(c.temp, a);
    c.temp -= fromTemp; a -= fromTemp;
    if (fromTemp) lines.push(`${fromTemp} came off your temp HP.`);
    c.hp -= a;
    if (c.hp <= 0) {
      const over = -c.hp;
      c.hp = 0; c.death = { s: 0, f: 0 };
      lines.push(over >= APP.maxHp() ? '⚠️ This much damage can kill you outright. Ask the DM.' : '😵 You drop to 0 HP. Roll a death save each turn.');
      if (c.conc) { lines.push(`${D.spells[c.conc].name} ends.`); c.conc = null; }
      return APP.show({ title: '💥 Damage', big: '−' + taken, sub: `0/${APP.maxHp()} HP`, lines });
    }
    if (c.conc && taken > 0) {
      const dc = Math.min(30, Math.max(10, Math.floor(taken / 2)));
      lines.unshift(`−${taken} HP, ${c.hp}/${APP.maxHp()} left.`);
      return APP.runTest({ kind: 'conc', mod: APP.saveMod('CON'), mode: 0, dc, spell: c.conc, prefix: lines });
    }
    APP.show({ title: '💥 Damage', big: '−' + taken, sub: `${c.hp}/${APP.maxHp()} HP left`, lines });
  };
})();

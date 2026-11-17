/* Kern: dobbelstenen, opslag, d20-worpen, schade en concentratie. */
(function () {
  'use strict';
  const D = window.SF;
  const APP = window.APP = {};
  const KEY = 'sf-dnd-v1';

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

  function freshTurn() {
    return { move: false, action: false, bonus: false, reaction: false, slot: false,
      reckless: true, recklessUsed: false, frenzy: false, savage: false, cleave: false, kept: false };
  }
  function freshChar(id) {
    const s = { hp: D.chars[id].maxHp, temp: 0, aid: false, heroic: true, hitDice: D.chars[id].level,
      blessed: false, vb: false, death: { s: 0, f: 0 }, inCombat: false, round: 0,
      turn: freshTurn(), situ: {}, mode: 0, guidance: false, phys: true, pending: null };
    if (id === 'pim') Object.assign(s, { slots: { 1: 4, 2: 3 }, cd: 2, lucky: 2, eyes: 1, conc: null, zone: 0 });
    else Object.assign(s, { rage: 3, raging: false });
    return s;
  }
  function freshState() {
    return { who: 'pim', tab: { pim: 'gevecht', charlie: 'gevecht' },
      chars: { pim: freshChar('pim'), charlie: freshChar('charlie') },
      log: [], last: null, lastTest: null, resultOpen: true, amt: '',
      tray: { n: 1, s: 20, mod: 0, mode: 0 } };
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
    } catch (e) { /* kapotte opslag: begin opnieuw */ }
    return freshState();
  }
  APP.st = load();
  APP.save = () => { try { localStorage.setItem(KEY, JSON.stringify(APP.st)); } catch (e) { /* vol of privémodus */ } };
  APP.reset = () => { APP.st = freshState(); };
  APP.freshTurn = freshTurn;

  const C = APP.C = (id) => APP.st.chars[id];
  const DC = APP.DC = (id) => D.chars[id];
  APP.maxHp = (id) => DC(id).maxHp + (C(id).aid ? 5 : 0);
  APP.abMod = (id, ab) => mod(DC(id).abilities[ab]);
  APP.saveMod = (id, ab) => APP.abMod(id, ab) + (DC(id).saveProf.includes(ab) ? DC(id).prof : 0);
  APP.initMod = (id) => APP.abMod(id, 'DEX');
  APP.skillMod = (id, name) => {
    const d = DC(id), sk = D.SKILLS.find((s) => s[0] === name);
    return mod(d.abilities[sk[1]]) + (d.skillProf.includes(name) ? d.prof : 0) + (d.skillBonus[name] || 0);
  };
  APP.combine = (manual, adv, dis) => {
    const a = manual === 1 || adv, b = manual === -1 || dis;
    return a && b ? 0 : a ? 1 : b ? -1 : 0;
  };

  /* Resultaat-paneel + logboek */
  APP.show = (res) => {
    const st = APP.st;
    res.who = res.who || st.who;
    res.lines = res.lines || [];
    res.buttons = res.buttons || [];
    st.last = res;
    st.resultOpen = true;
    st.log.unshift({ who: res.who, title: res.title, big: res.big === undefined ? '' : res.big, sub: res.sub || '', time: Date.now() });
    st.log = st.log.slice(0, 40);
  };
  APP.note = (title, lines, extra) => APP.show(Object.assign({ title, lines }, extra || {}));

  /* d20-worpen (aanval, save, check, initiatief, death save, concentratie) */
  APP.runTest = (t) => {
    t.rolls = t.mode ? roll(2, 20) : roll(1, 20);
    t.extras = [];
    if (t.bless) t.extras.push({ label: 'Bless', val: rand(4) });
    if (t.guidance) t.extras.push({ label: 'Je kan het!', val: rand(4) });
    APP.finishTest(t);
  };
  APP.finishTest = (t) => {
    t.nat = t.mode > 0 ? Math.max.apply(null, t.rolls) : t.mode < 0 ? Math.min.apply(null, t.rolls) : t.rolls[0];
    t.total = t.nat + t.mod + sum(t.extras.map((e) => e.val));
    APP.st.lastTest = t;
    (APP.TESTS[t.kind] || APP.TESTS.check)(t);
  };
  APP.testShow = (t, title, lines, buttons) => {
    const c = C(t.who);
    const dice = t.rolls.length > 1
      ? `d20: ${t.rolls.join(' & ')} → ${t.nat} (${t.mode > 0 ? 'voordeel' : 'nadeel'})`
      : `d20: ${t.nat}`;
    const extras = t.extras.map((e) => ` + ${e.label} ${e.val}`).join('');
    const btns = (buttons || []).slice();
    if (c.heroic && !t.usedHeroic) btns.push({ label: '🌟 Heroic Inspiration: opnieuw', act: 'heroic', cls: 'ghost' });
    if (t.who === 'pim' && c.lucky > 0 && t.mode < 1 && !t.usedLucky) btns.push({ label: '🍀 Lucky: extra d20', act: 'lucky', cls: 'ghost' });
    APP.show({ who: t.who, title, big: t.total, sub: `${dice} ${sign(t.mod)}${extras}`, lines, buttons: btns, nat: t.nat });
  };
  APP.heroic = () => {
    const t = APP.st.lastTest; if (!t) return;
    const c = C(t.who); if (!c.heroic) return;
    c.heroic = false; t.usedHeroic = true;
    t.rolls[t.rolls.indexOf(t.nat)] = rand(20);
    APP.finishTest(t);
  };
  APP.lucky = () => {
    const t = APP.st.lastTest; if (!t || t.who !== 'pim') return;
    const c = C('pim'); if (c.lucky <= 0) return;
    c.lucky--; t.usedLucky = true;
    if (t.mode === -1) { t.mode = 0; t.rolls = [t.rolls[0]]; } else { t.mode = 1; t.rolls.push(rand(20)); }
    APP.finishTest(t);
  };

  APP.TESTS = {
    check(t) {
      const lines = [];
      if (t.note) lines.push(t.note);
      if (t.nat === 20) lines.push('🎉 Een natuurlijke 20!');
      if (t.nat === 1) lines.push('😬 Een 1…');
      lines.push('Zeg dit getal tegen de DM.');
      APP.testShow(t, t.label, lines);
    },
    init(t) {
      APP.testShow(t, '⚔️ Initiatief', ['Zeg dit getal tegen de DM. Die bepaalt wie wanneer aan de beurt is.',
        'Is het jouw beurt? Volg dan de stappen bij "Wat doe ik nu?".']);
    },
    conc(t) {
      const c = C('pim');
      const pass = t.total >= t.dc;
      if (!pass && c.conc === t.concSpell) { APP.endConc(true); t.ended = true; }
      if (pass && t.ended && !c.conc) { APP.restoreConc(t.concSpell); t.ended = false; }
      const name = D.spells[t.concSpell].sf;
      const lines = (t.prefix || []).concat([
        `Concentratie-save: DC ${t.dc} (met voordeel door War Caster).`,
        pass ? `✔ Gelukt! ${name} blijft actief.` : `✘ Mislukt. ${name} is gestopt.`
      ]);
      APP.testShow(t, pass ? '🧠 Concentratie gehouden' : '🧠 Concentratie kwijt', lines);
    },
    death(t) {
      const c = C(t.who);
      c.death = { s: t.before.s, f: t.before.f };
      c.hp = t.beforeHp;
      const lines = [];
      if (t.nat === 20) { c.hp = 1; c.death = { s: 0, f: 0 }; lines.push('🎉 20! Je staat op met 1 HP.'); }
      else if (t.nat === 1) { c.death.f += 2; lines.push('Een 1 telt als 2 mislukte death saves.'); }
      else if (t.total >= 10) { c.death.s += 1; lines.push('✔ Gelukt (10 of hoger).'); }
      else { c.death.f += 1; lines.push('✘ Mislukt (lager dan 10).'); }
      if (c.death.s >= 3) lines.push('😮‍💨 3× gelukt: je bent stabiel. Je blijft bewusteloos, maar gaat niet dood.');
      if (c.death.f >= 3) lines.push('💀 3× mislukt… Vraag de DM wat er gebeurt.');
      if (c.hp === 0 && c.death.s < 3 && c.death.f < 3) lines.push(`Stand: ${c.death.s}× gelukt, ${c.death.f}× mislukt.`);
      APP.testShow(t, '💀 Death save', lines);
    },
    patk(t) {
      const crit = t.nat === 20;
      const n = t.dmg.n * (crit ? 2 : 1);
      const r = roll(n, t.dmg.s);
      const total = sum(r) + t.dmg.bonus;
      const lines = [];
      if (t.nat === 1) lines.push('Een 1: altijd mis.');
      else if (crit) lines.push('💥 KRITIEK! Automatisch raak, dubbele dobbelstenen.');
      else lines.push(`Raak als de AC van de vijand <b>${t.total} of lager</b> is. Vraag het de DM.`);
      if (t.nat !== 1) lines.push(`Raak → <b>${total} ${t.dmg.type}</b> schade (${n}d${t.dmg.s}${t.dmg.bonus ? ' + ' + t.dmg.bonus : ''}: ${r.join(', ')}).`);
      if (t.dmg.after) lines.push(t.dmg.after);
      APP.testShow(t, t.label, lines);
    }
  };

  /* Schade, heling, tijdelijke HP */
  APP.heal = (id, amt) => {
    const c = C(id), was0 = c.hp === 0;
    c.hp = Math.min(APP.maxHp(id), c.hp + amt);
    if (was0 && c.hp > 0) c.death = { s: 0, f: 0 };
    return was0 && c.hp > 0;
  };
  APP.takeDamage = (id, amount) => {
    const c = C(id);
    let a = Math.max(0, Math.floor(amount));
    if (!a) return;
    const lines = [];
    if (id === 'charlie' && c.raging && c.phys) { a = Math.floor(a / 2); lines.push(`Rage: halve schade → ${a}.`); }
    const taken = a;
    if (c.hp === 0) {
      if (!taken) return APP.show({ who: id, title: 'Rage vangt alles op', big: '0', lines });
      c.death.f += 1;
      lines.push('Je lag al op 0 HP: dat telt als 1 mislukte death save (2 bij een kritieke treffer).');
      if (taken >= APP.maxHp(id)) lines.push('⚠️ Zoveel schade in één keer kan direct dood betekenen. Check met de DM.');
      if (c.death.f >= 3) lines.push('💀 3× mislukt…');
      return APP.show({ who: id, title: '💥 Geraakt op 0 HP', big: '−' + taken, lines });
    }
    const fromTemp = Math.min(c.temp, a);
    c.temp -= fromTemp; a -= fromTemp;
    if (fromTemp) lines.push(`${fromTemp} schade ging van je tijdelijke HP af.`);
    c.hp -= a;
    let down = false;
    if (c.hp <= 0) {
      const over = -c.hp;
      c.hp = 0; down = true; c.death = { s: 0, f: 0 };
      if (over >= APP.maxHp(id)) lines.push('⚠️ De schade die over is, is minstens je max HP. Volgens de regels ben je dan meteen dood. Check met de DM.');
      else lines.push('😵 Je ligt op 0 HP en bent bewusteloos. Gooi elke beurt een death save.');
      if (id === 'pim') {
        if (c.conc) { lines.push(`Je concentratie op ${D.spells[c.conc].sf} stopt.`); APP.endConc(true); }
        if (c.zone) { c.zone = 0; lines.push('De Smile Zone verdwijnt.'); }
      }
      if (id === 'charlie' && c.raging) { c.raging = false; lines.push('Je Rage stopt.'); }
    }
    if (!down && id === 'pim' && c.conc && taken > 0) {
      const dc = Math.min(30, Math.max(10, Math.floor(taken / 2)));
      lines.unshift(`💥 −${taken} HP → nog ${c.hp}/${APP.maxHp(id)}.`);
      return APP.runTest({ who: 'pim', kind: 'conc', mod: APP.saveMod('pim', 'CON'), mode: 1, bless: c.blessed, dc, concSpell: c.conc, prefix: lines });
    }
    APP.show({ who: id, title: `💥 ${DC(id).short} wordt geraakt`, big: '−' + taken, sub: `nog ${c.hp}/${APP.maxHp(id)} HP`, lines });
  };

  /* Concentratie (alleen Pim) */
  APP.endConc = (silent) => {
    const c = C('pim'), id = c.conc;
    if (!id) return;
    c.conc = null;
    if (id === 'bless') { C('pim').blessed = false; C('charlie').blessed = false; }
    if (id === 'holdPerson') C('charlie').situ.paralyzed = false;
    if (id === 'guidance') c.guidance = false;
    if (!silent) APP.note('🧠 Concentratie gestopt', [`${D.spells[id].emoji} ${D.spells[id].sf} is voorbij.`], { who: 'pim' });
  };
  APP.restoreConc = (id) => {
    const c = C('pim');
    c.conc = id;
    if (id === 'bless') { C('pim').blessed = true; C('charlie').blessed = true; }
    if (id === 'guidance') c.guidance = true;
  };
})();

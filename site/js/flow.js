/* Gevechtsverloop, rusten, checks/saves, middelen en losse dobbelstenen. */
(function () {
  'use strict';
  const D = window.SF, APP = window.APP;
  const { roll, sum, ask, C, DC } = APP;

  APP.startCombat = (id) => {
    const c = C(id);
    c.inCombat = true; c.round = 1; c.turn = APP.freshTurn(); c.situ = { paralyzed: c.situ.paralyzed };
    const mode = APP.combine(0, c.vb, false);
    c.vb = false;
    APP.runTest({ who: id, kind: 'init', mod: APP.initMod(id), mode, bless: false });
  };
  APP.newTurn = (id) => {
    const c = C(id), lines = [];
    if (id === 'charlie' && c.raging && !c.turn.kept) { c.raging = false; lines.push('Rage ended: no attack last turn.'); }
    if (id === 'charlie' && c.pending) c.pending = null;
    c.turn = APP.freshTurn();
    c.round++;
    if (id === 'pim' && c.zone > 0) { c.zone--; if (c.zone === 0) lines.push('Twilight Sanctuary has ended.'); }
    if (lines.length) APP.note(`Round ${c.round}`, lines, { who: id });
    else APP.st.resultOpen = false;
  };
  APP.endCombat = (id) => {
    const c = C(id);
    c.inCombat = false; c.round = 0; c.turn = APP.freshTurn(); c.situ = {}; c.pending = null;
    if (id === 'pim') {
      c.zone = 0;
      if (c.conc) APP.endConc(true);
    } else c.raging = false;
    APP.st.resultOpen = false;
  };

  APP.shortRest = (id) => {
    const c = C(id);
    if (id === 'pim') c.cd = Math.min(2, c.cd + 1);
    else c.rage = Math.min(3, c.rage + 1);
    APP.note('☕ Short rest', [id === 'pim' ? '+1 Channel Divinity.' : '+1 Rage.'], { who: id, buttons: c.hitDice > 0 ? [{ label: `Spend Hit Die (${c.hitDice} left)`, act: 'hitDie' }] : [] });
  };
  APP.hitDie = (id) => {
    const c = C(id), d = DC(id);
    if (c.hitDice <= 0) return APP.note('No Hit Dice left', [], { who: id });
    if (c.hp >= APP.maxHp(id)) return APP.note('HP already full', [], { who: id });
    c.hitDice--;
    const r = roll(1, d.hitDie)[0], amt = r + APP.abMod(id, 'CON');
    APP.heal(id, amt);
    APP.show({ who: id, title: '🎲 Hit Die', big: '+' + amt, sub: `d${d.hitDie} + 3 · now ${c.hp}/${APP.maxHp(id)} HP`,
      buttons: c.hitDice > 0 && c.hp < APP.maxHp(id) ? [{ label: `Another (${c.hitDice} left)`, act: 'hitDie' }] : [] });
  };
  APP.longRest = (id) => {
    if (!ask('Long rest: restore everything?')) return;
    const c = C(id);
    if (id === 'pim' && c.conc) APP.endConc(true);
    Object.assign(c, { aid: false, temp: 0, heroic: true, hitDice: DC(id).level, death: { s: 0, f: 0 }, inCombat: false,
      round: 0, turn: APP.freshTurn(), situ: {}, blessed: false, guidance: false, pending: null });
    c.hp = APP.maxHp(id);
    if (id === 'pim') Object.assign(c, { slots: { 1: 4, 2: 3 }, cd: 2, lucky: 2, eyes: 1, zone: 0 });
    else Object.assign(c, { rage: 3, raging: false });
    APP.note('🛌 Long rest', ['Everything restored.'], { who: id, buttons: id === 'pim' ? [{ label: 'Cast Aid', act: 'cast', arg: 'aid' }] : [] });
  };

  APP.rollSkill = (id, name) => {
    const c = C(id), d = DC(id), sk = D.SKILLS.find((s) => s[0] === name);
    let m = APP.skillMod(id, name), ab = sk[1], note = '';
    if (id === 'charlie' && c.raging && d.rageStrSkills.includes(name)) {
      const strM = APP.abMod(id, 'STR') + (d.skillProf.includes(name) ? d.prof : 0);
      if (strM >= m) { m = strM; ab = 'STR'; note = 'Rage: using STR, with advantage.'; }
    }
    const adv = id === 'charlie' && c.raging && ab === 'STR';
    const dis = id === 'pim' && name === 'Stealth';
    if (dis) note = 'Chain mail: disadvantage.';
    const mode = APP.combine(c.mode, adv, dis);
    APP.runTest({ who: id, kind: 'check', label: name, mod: m, mode, guidance: id === 'pim' && c.guidance, note });
  };
  APP.rollSave = (id, ab) => {
    const c = C(id);
    let adv = false, note = '';
    if (id === 'charlie' && c.raging && ab === 'STR') { adv = true; note = 'Rage: advantage.'; }
    if (id === 'charlie' && ab === 'DEX') { adv = true; note = 'Danger Sense: advantage.'; }
    const mode = APP.combine(c.mode, adv, false);
    APP.runTest({ who: id, kind: 'check', label: `${ab} save`, mod: APP.saveMod(id, ab), mode, bless: c.blessed, note });
  };
  APP.deathSave = (id) => {
    const c = C(id);
    if (c.hp > 0) return APP.note('You are still standing', [], { who: id });
    if (c.death.s >= 3 || c.death.f >= 3) return APP.note(c.death.s >= 3 ? 'You are stable' : 'Ask the DM', [], { who: id });
    APP.runTest({ who: id, kind: 'death', mod: 0, mode: 0, bless: c.blessed, before: { s: c.death.s, f: c.death.f }, beforeHp: c.hp });
  };

  APP.zoneTemp = (target) => {
    const c = C(target), r = roll(1, 6)[0] + 4;
    const kept = r <= c.temp;
    if (!kept) c.temp = r;
    APP.show({ who: 'pim', title: `🌅 Temp HP for ${DC(target).short}`, big: r, sub: '1d6 + 4',
      lines: kept ? [`Already had ${c.temp}, keeping that (doesn't stack).`] : [] });
  };

  const RES = {
    s1: ['slots', 1], s2: ['slots', 2], cd: ['cd'], lucky: ['lucky'], hd: ['hitDice'], eyes: ['eyes'], rage: ['rage']
  };
  APP.pip = (who, arg) => {
    const parts = arg.split(':'), path = RES[parts[0]], i = +parts[1], c = C(who);
    const get = () => (path.length === 2 ? c[path[0]][path[1]] : c[path[0]]);
    const set = (v) => { if (path.length === 2) c[path[0]][path[1]] = v; else c[path[0]] = v; };
    set(i < get() ? i : i + 1);
  };

  APP.rollTray = () => {
    const t = APP.st.tray;
    if (t.s === 20 && t.n === 1) {
      return APP.runTest({ who: APP.st.who, kind: 'check', label: '🎲 d20', mod: t.mod, mode: t.mode });
    }
    const r = roll(t.n, t.s), total = sum(r) + t.mod;
    APP.show({ title: `🎲 ${t.n}d${t.s}${t.mod ? APP.sign(t.mod) : ''}`, big: total, sub: `${r.join(', ')}${t.mod ? ' ' + APP.sign(t.mod) : ''}` });
  };
})();

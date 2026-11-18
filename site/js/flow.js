/* Combat flow, rests and rolls from the sheet. */
(function () {
  'use strict';
  const D = window.SF, P = D.pim, APP = window.APP;
  const { roll, ask, S } = APP;

  APP.startCombat = () => {
    const c = S();
    c.inCombat = true; c.round = 1; c.turn = APP.freshTurn(); c.situ = {};
    APP.runTest({ kind: 'init', mod: APP.abMod('DEX'), mode: 0 });
  };
  APP.newTurn = () => {
    const c = S();
    c.turn = APP.freshTurn();
    c.round++;
    APP.st.resultOpen = false;
  };
  APP.endCombat = () => {
    const c = S();
    c.inCombat = false; c.round = 0; c.turn = APP.freshTurn(); c.situ = {};
    if (['pattern', 'laughter', 'calm'].includes(c.conc)) c.conc = null;
    APP.st.resultOpen = false;
  };

  const song = 'Play a song: Charlie gets Heroic Inspiration (Musician).';
  APP.shortRest = () => {
    const c = S();
    c.bi = P.biMax;
    APP.note('☕ Short rest', ['Bardic Inspiration is full again.', song],
      { buttons: c.hitDice > 0 && c.hp < APP.maxHp() ? [{ label: `Heal with a Hit Die (${c.hitDice} left)`, act: 'hitDie' }] : [] });
  };
  APP.hitDie = () => {
    const c = S();
    if (c.hitDice <= 0) return APP.note('No Hit Dice left', ['They come back after a long rest.']);
    if (c.hp >= APP.maxHp()) return APP.note('HP is already full', []);
    c.hitDice--;
    const amt = roll(1, P.hitDie)[0] + APP.abMod('CON');
    APP.heal(amt);
    APP.show({ title: '🎲 Hit Die', big: '+' + amt, sub: `now ${c.hp}/${APP.maxHp()} HP`,
      buttons: c.hitDice > 0 && c.hp < APP.maxHp() ? [{ label: `Another one (${c.hitDice} left)`, act: 'hitDie' }] : [] });
  };
  APP.longRest = () => {
    if (!ask('Long rest: get everything back?')) return;
    const c = S();
    Object.assign(c, { aid: false, temp: 0, hitDice: P.level, death: { s: 0, f: 0 }, slots: { 1: 4, 2: 3, 3: 2 },
      bi: P.biMax, charlieBI: false, conc: null, inCombat: false, round: 0, turn: APP.freshTurn(), situ: {} });
    c.hp = APP.maxHp();
    APP.note('🛌 Long rest', ['Everything is back.', song], { buttons: [{ label: '☀️ Cast Aid', act: 'cast', arg: 'aid' }] });
  };

  APP.rollSkill = (name) => {
    const c = S(), floor10 = P.silverTongue.includes(name);
    APP.runTest({ kind: 'check', label: name, mod: APP.skillMod(name), mode: c.mode, floor10,
      note: floor10 ? 'Silver Tongue: a d20 of 9 or lower counts as 10.' : '' });
  };
  APP.rollSave = (ab) => {
    APP.runTest({ kind: 'check', label: `${ab} save`, mod: APP.saveMod(ab), mode: S().mode });
  };
  APP.deathSave = () => {
    const c = S();
    if (c.hp > 0) return APP.note('You are still standing', []);
    if (c.death.s >= 3 || c.death.f >= 3) return APP.note(c.death.s >= 3 ? 'You are stable' : 'Ask the DM', []);
    APP.runTest({ kind: 'death', mod: 0, mode: 0, before: { s: c.death.s, f: c.death.f } });
  };

  const RES = { s1: ['slots', 1], s2: ['slots', 2], s3: ['slots', 3], bi: ['bi'], hd: ['hitDice'] };
  APP.pip = (arg) => {
    const parts = arg.split(':'), path = RES[parts[0]], i = +parts[1], c = S();
    const get = () => (path.length === 2 ? c[path[0]][path[1]] : c[path[0]]);
    const set = (v) => { if (path.length === 2) c[path[0]][path[1]] = v; else c[path[0]] = v; };
    set(i < get() ? i : i + 1);
  };
})();

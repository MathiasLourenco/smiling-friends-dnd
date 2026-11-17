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
    if (id === 'charlie' && c.raging && !c.turn.kept) { c.raging = false; lines.push('😮‍💨 Je Rage is gestopt: je viel vorige beurt niet aan.'); }
    if (id === 'charlie' && c.pending) c.pending = null;
    c.turn = APP.freshTurn();
    c.round++;
    if (id === 'pim' && c.zone > 0) { c.zone--; if (c.zone === 0) lines.push('🌈 De Smile Zone is voorbij (1 minuut om).'); }
    if (c.hp === 0) lines.push('Je ligt op 0 HP: gooi eerst een death save.');
    lines.push('Volg de stappen bij "Wat doe ik nu?".');
    APP.note(`▶ Ronde ${c.round}: jouw beurt`, lines, { who: id });
  };
  APP.endCombat = (id) => {
    const c = C(id);
    c.inCombat = false; c.round = 0; c.turn = APP.freshTurn(); c.situ = {}; c.pending = null;
    const lines = ['Goed gedaan! Na een zwaar gevecht kan je om een short rest vragen.'];
    if (id === 'pim') {
      if (c.zone) { c.zone = 0; lines.push('Smile Zone uit.'); }
      if (c.conc) { lines.push(`${D.spells[c.conc].sf} is ook voorbij.`); APP.endConc(true); }
    } else {
      if (c.raging) { c.raging = false; lines.push('Rage uit.'); }
      c.situ = {};
    }
    APP.note('🏁 Gevecht klaar', lines, { who: id });
  };

  APP.shortRest = (id) => {
    const c = C(id), lines = [];
    if (id === 'pim') { c.cd = Math.min(2, c.cd + 1); lines.push('🌈 1 Channel Divinity terug (Smile Zone!).'); }
    else { c.rage = Math.min(3, c.rage + 1); lines.push('😤 1 Rage terug.'); }
    lines.push(`Je hebt nog ${c.hitDice} Hit Dice. Druk op "Hit Die gebruiken" om HP terug te krijgen.`);
    APP.note('☕ Short rest (1 uur)', lines, { who: id, buttons: c.hitDice > 0 ? [{ label: '🎲 Hit Die gebruiken', act: 'hitDie' }] : [] });
  };
  APP.hitDie = (id) => {
    const c = C(id), d = DC(id);
    if (c.hitDice <= 0) return APP.note('Geen Hit Dice meer', ['Na een long rest krijg je ze terug.'], { who: id });
    if (c.hp >= APP.maxHp(id)) return APP.note('Je zit al vol', ['Je HP is al maximaal.'], { who: id });
    c.hitDice--;
    const r = roll(1, d.hitDie)[0], amt = r + APP.abMod(id, 'CON');
    APP.heal(id, amt);
    APP.show({ who: id, title: '🎲 Hit Die', big: '+' + amt, sub: `d${d.hitDie} (${r}) + 3`, lines: [`Nu ${c.hp}/${APP.maxHp(id)} HP. Nog ${c.hitDice} Hit Dice.`],
      buttons: c.hitDice > 0 && c.hp < APP.maxHp(id) ? [{ label: '🎲 Nog een Hit Die', act: 'hitDie' }] : [] });
  };
  APP.longRest = (id) => {
    if (!ask('Long rest (8 uur): alles terug op vol. Doorgaan?')) return;
    const c = C(id);
    if (id === 'pim' && c.conc) APP.endConc(true);
    Object.assign(c, { aid: false, temp: 0, heroic: true, hitDice: DC(id).level, death: { s: 0, f: 0 }, inCombat: false,
      round: 0, turn: APP.freshTurn(), situ: {}, blessed: false, guidance: false, pending: null });
    c.hp = APP.maxHp(id);
    const lines = ['HP, Hit Dice en Heroic Inspiration zijn terug.'];
    if (id === 'pim') {
      Object.assign(c, { slots: { 1: 4, 2: 3 }, cd: 2, lucky: 2, eyes: 1, zone: 0 });
      lines.push('Alle spell slots, Channel Divinity en Lucky zijn terug.', '☀️ Vergeet je Ochtendpeptalk (Aid) niet!');
    } else {
      Object.assign(c, { rage: 3, raging: false });
      lines.push('Alle Rages zijn terug.');
    }
    APP.note('🛌 Long rest', lines, { who: id, buttons: id === 'pim' ? [{ label: '☀️ Ochtendpeptalk (Aid)', act: 'cast', arg: 'aid' }] : [] });
  };

  APP.rollSkill = (id, name) => {
    const c = C(id), d = DC(id), sk = D.SKILLS.find((s) => s[0] === name);
    let m = APP.skillMod(id, name), ab = sk[1], note = '';
    if (id === 'charlie' && c.raging && d.rageStrSkills.includes(name)) {
      const strM = APP.abMod(id, 'STR') + (d.skillProf.includes(name) ? d.prof : 0);
      if (strM >= m) { m = strM; ab = 'STR'; note = '😤 Rage: je gebruikt STR (met voordeel).'; }
    }
    const adv = id === 'charlie' && c.raging && ab === 'STR';
    const dis = id === 'pim' && name === 'Stealth';
    if (dis) note = 'Chain mail: nadeel op sluipen.';
    const mode = APP.combine(c.mode, adv, dis);
    APP.runTest({ who: id, kind: 'check', label: `🎯 ${name} (${sk[2]})`, mod: m, mode, guidance: id === 'pim' && c.guidance, note });
  };
  APP.rollSave = (id, ab) => {
    const c = C(id);
    let adv = false, note = '';
    if (id === 'charlie' && c.raging && ab === 'STR') { adv = true; note = '😤 Rage: voordeel op STR-saves.'; }
    if (id === 'charlie' && ab === 'DEX') { adv = true; note = 'Danger Sense: voordeel op DEX-saves.'; }
    const mode = APP.combine(c.mode, adv, false);
    APP.runTest({ who: id, kind: 'check', label: `🛡️ ${ab}-save (${D.ABIL[ab]})`, mod: APP.saveMod(id, ab), mode, bless: c.blessed, note });
  };
  APP.deathSave = (id) => {
    const c = C(id);
    if (c.hp > 0) return APP.note('Je staat nog', ['Death saves gooi je alleen op 0 HP.'], { who: id });
    if (c.death.s >= 3 || c.death.f >= 3) return APP.note('Klaar met death saves', [c.death.s >= 3 ? 'Je bent stabiel.' : 'Vraag de DM wat er gebeurt.'], { who: id });
    APP.runTest({ who: id, kind: 'death', mod: 0, mode: 0, bless: c.blessed, before: { s: c.death.s, f: c.death.f }, beforeHp: c.hp });
  };

  APP.zoneTemp = (target) => {
    const c = C(target), r = roll(1, 6)[0] + 4;
    const lines = [];
    if (r > c.temp) { lines.push(`${DC(target).short} heeft nu ${r} tijdelijke HP.`); c.temp = r; }
    else lines.push(`${DC(target).short} had al ${c.temp} tijdelijke HP. Dat is meer, dus dat blijft (ze stapelen niet).`);
    APP.show({ who: 'pim', title: `🌈 Smile Zone → ${DC(target).short}`, big: r, sub: '1d6 + 4 tijdelijke HP', lines });
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

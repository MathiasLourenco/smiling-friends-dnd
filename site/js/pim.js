/* Pim: spells casten, effecten en de beurt-hulp. */
(function () {
  'use strict';
  const D = window.SF, APP = window.APP;
  const { roll, sum, ask, C } = APP;

  const TIME_KEY = { action: 'action', bonus: 'bonus', reaction: 'reaction' };
  APP.TIME_LABEL = { action: 'Actie', bonus: 'Bonusactie', reaction: 'Reactie', none: 'Gratis' };

  const lowestSlot = (c, min) => {
    for (let l = Math.max(1, min); l <= 2; l++) if (c.slots[l] > 0) return l;
    return null;
  };
  const giveButtons = (amount) => [
    { label: `Aan Pim`, act: 'giveHeal', arg: 'pim:' + amount },
    { label: `Aan Charlie`, act: 'giveHeal', arg: 'charlie:' + amount }
  ];
  const saveRes = (title, ab, line, extra) => Object.assign({ who: 'pim', title, lines: [`Doelwit doet een <b>${ab}-save, DC 14</b>.`, line] }, extra || {});
  const note = (title, line) => APP.note(title, line ? [line] : [], { who: 'pim' });

  const EFFECTS = {
    toll(o) {
      const die = o.injured ? 12 : 8, r = roll(1, die)[0];
      APP.show(saveRes('🔔 Toll the Dead', 'WIS', `Faalt: <b>${r} necrotic</b>.`, { big: r, sub: `1d${die}` }));
    },
    sacred() {
      const r = roll(1, 8)[0];
      APP.show(saveRes('🔥 Sacred Flame', 'DEX', `Faalt: <b>${r} radiant</b>.`, { big: r, sub: '1d8' }));
    },
    guidance() { C('pim').guidance = true; note('👍 Guidance', 'Kies een skill: +1d4 op die checks (1 minuut).'); },
    thaumaturgy() { note('🎭 Thaumaturgy', 'Beschrijf het effect aan de DM.'); },
    spare() { note('🩹 Spare the Dying', 'Het doelwit is stabiel.'); },
    bless() { C('pim').blessed = true; C('charlie').blessed = true; note('⭐ Bless', 'Pim en Charlie: +1d4 op aanvallen en saves.'); },
    healingWord(o) {
      const n = 2 * o.lvl, r = roll(n, 4), total = sum(r) + 4;
      APP.show({ who: 'pim', title: '💬 Healing Word', big: total, sub: `${n}d4 + 4`, lines: ['Wie krijgt het?'], buttons: giveButtons(total) });
    },
    guidingBolt(o) {
      APP.runTest({ who: 'pim', kind: 'patk', label: '☄️ Guiding Bolt', mod: 6, mode: C('pim').mode, bless: C('pim').blessed,
        dmg: { n: 4 + (o.lvl - 1), s: 6, bonus: 0, type: 'radiant' } });
    },
    command() { note('📢 Command', 'Doelwit doet een <b>WIS-save, DC 14</b>. Kies: Approach, Drop, Flee, Grovel of Halt.'); },
    faerieFire() { note('🟣 Faerie Fire', 'Iedereen in de kubus doet een <b>DEX-save, DC 14</b>.'); },
    sleep() { note('😴 Sleep', 'Iedereen in de bol doet een <b>WIS-save, DC 14</b>.'); },
    spiritualWeapon() { APP.swAttack(true); },
    aid() {
      ['pim', 'charlie'].forEach((id) => { const c = C(id); if (!c.aid) { c.aid = true; c.hp += 5; } });
      note('☀️ Aid', 'Pim en Charlie: +5 max HP voor 8 uur.');
    },
    holdPerson() {
      APP.show(saveRes('🧊 Hold Person', 'WIS', 'Faalt: Paralyzed.', {
        buttons: [{ label: 'Faalt', act: 'holdFail' }, { label: 'Gehaald', act: 'holdPass', cls: 'ghost' }] }));
    },
    moonbeam() { APP.moonbeamHit(); },
    seeInvis() { note('👓 See Invisibility', 'Je ziet onzichtbare wezens (1 uur).'); },
    sanctuary() { C('pim').zone = 10; note('🌅 Twilight Sanctuary', 'Eindigt iemand zijn beurt erin? Druk op 🌅 voor tijdelijke HP.'); },
    divineSpark() {
      const r = roll(1, 8)[0] + 4;
      APP.show({ who: 'pim', title: '⚡ Divine Spark', big: r, sub: '1d8 + 4',
        lines: [`Of als schade: CON-save DC 14, faalt ${r}, gehaald ${Math.floor(r / 2)}.`], buttons: giveButtons(r) });
    },
    turnUndead() { note('💀 Turn Undead', 'Ondoden binnen 30 ft doen een <b>WIS-save, DC 14</b>.'); },
    vigilant() {
      APP.show({ who: 'pim', title: '⏰ Vigilant Blessing', lines: ['Wie raak je aan?'],
        buttons: [{ label: 'Mezelf', act: 'vbGive', arg: 'pim' }, { label: 'Charlie', act: 'vbGive', arg: 'charlie' }] });
    },
    eyes() { note('🌌 Eyes of Night', 'Max. 4 vrienden zien 1 uur in het donker.'); }
  };

  APP.swAttack = (fresh) => {
    const c = C('pim');
    if (!fresh) {
      if (c.conc !== 'spiritualWeapon') return note('Geen Spiritual Weapon', 'Cast hem eerst.');
      if (c.inCombat && c.turn.bonus && !ask('Je bonusactie is al gebruikt. Toch doen?')) return;
      if (c.inCombat) c.turn.bonus = true;
    }
    APP.runTest({ who: 'pim', kind: 'patk', label: '🔨 Spiritual Weapon', mod: 6, mode: c.mode, bless: c.blessed,
      dmg: { n: 1, s: 8, bonus: 4, type: 'force' } });
  };
  APP.moonbeamHit = () => {
    const r = sum(roll(2, 10));
    APP.show(saveRes('🌙 Moonbeam', 'CON', `Faalt: <b>${r} radiant</b>, gehaald: <b>${Math.floor(r / 2)}</b>.`, { big: r, sub: '2d10' }));
  };
  APP.moonbeamMove = () => {
    const c = C('pim');
    if (c.conc !== 'moonbeam') return note('Geen Moonbeam', 'Cast hem eerst.');
    if (c.inCombat && c.turn.action && !ask('Je actie is al gebruikt. Toch doen?')) return;
    if (c.inCombat) c.turn.action = true;
    APP.moonbeamHit();
  };

  APP.cast = (id, opts) => {
    opts = opts || {};
    const sp = D.spells[id], c = C('pim');
    if (c.hp === 0) return note('Je ligt op 0 HP', 'Gooi een death save.');
    let lvl = null;
    if (typeof sp.level === 'number' && sp.level > 0) {
      lvl = opts.lvl || lowestSlot(c, sp.level);
      if (!lvl || c.slots[lvl] <= 0) return note('Geen spell slots meer', 'Na een long rest krijg je ze terug.');
      if (c.inCombat && c.turn.slot && !ask('Je hebt deze beurt al een spell slot gebruikt (max 1 per beurt). Toch doen?')) return;
    }
    if (sp.level === 'cd' && c.cd <= 0) return note('Geen Channel Divinity meer', 'Na een short rest krijg je er 1 terug.');
    if (id === 'eyes' && c.eyes <= 0) {
      lvl = lowestSlot(c, 1);
      if (!lvl) return note('Eyes of Night is op', 'Je hebt ook geen spell slots meer.');
      if (!ask(`Gratis delen is op. Een level ${lvl} spell slot gebruiken?`)) return;
    }
    const key = opts.reaction ? 'reaction' : TIME_KEY[sp.time];
    const label = opts.reaction ? 'reactie' : APP.TIME_LABEL[sp.time].toLowerCase();
    if (c.inCombat && key && c.turn[key] && !ask(`Je ${label} is deze beurt al gebruikt. Toch doen?`)) return;
    if (sp.conc && c.conc && !ask(`${D.spells[c.conc].name} stopt dan (concentratie). Doorgaan?`)) return;

    if (sp.conc && c.conc) APP.endConc(true);
    if (lvl) { c.slots[lvl]--; if (c.inCombat) c.turn.slot = true; }
    if (sp.level === 'cd') c.cd--;
    if (id === 'eyes' && !lvl) c.eyes--;
    if (c.inCombat && key) c.turn[key] = true;
    if (sp.conc) c.conc = id;
    EFFECTS[id](Object.assign({ lvl: lvl || 1 }, opts));
  };

  /* Beurt-hulp: alleen actie en bonusactie. */
  APP.pimAdvice = () => {
    const c = C('pim'), t = c.turn, s = c.situ, steps = [];
    if (c.hp === 0) return { tip: '', steps: [{ k: 'Nu', title: '💀 Death save', act: 'deathSave', label: 'Gooi', done: false }] };
    const canSlot = !t.slot;
    const has1 = c.slots[1] > 0 || c.slots[2] > 0, has2 = c.slots[2] > 0;
    const wantHeal = s.low && has1 && canSlot;
    let act, actionSlot = false;
    if (s.low && !wantHeal && c.cd > 0) act = { title: '⚡ Divine Spark', why: 'Geen slot om te helen: dit heelt 1d8+4.', act: 'cast', arg: 'divineSpark' };
    else if (c.zone === 0 && c.cd > 0) act = { title: '🌅 Twilight Sanctuary', why: 'Elke beurt tijdelijke HP voor jullie allebei.', act: 'cast', arg: 'sanctuary' };
    else if (s.undead && c.cd > 0) act = { title: '💀 Turn Undead', why: 'Ondoden rennen weg.', act: 'cast', arg: 'turnUndead' };
    else if (!wantHeal && s.humanoid && has2 && canSlot && c.conc !== 'holdPerson') {
      act = { title: '🧊 Hold Person', why: c.conc ? `${D.spells[c.conc].name} stopt dan.` : 'Charlie ernaast = elke raak kritiek.', act: 'cast', arg: 'holdPerson' };
      actionSlot = true;
    } else act = { title: '🔔 Toll the Dead', why: 'Gratis.', btns: [{ label: 'Gewond doelwit', act: 'cast', arg: 'toll|injured' }, { label: 'Niet gewond', act: 'cast', arg: 'toll' }] };
    steps.push(Object.assign({ k: 'Actie', done: t.action }, act));

    if (wantHeal) steps.push({ k: 'Bonusactie', title: '💬 Healing Word', why: 'Iemand is (bijna) neer.', act: 'cast', arg: 'healingWord', done: t.bonus });
    else if (c.conc === 'spiritualWeapon') steps.push({ k: 'Bonusactie', title: '🔨 Spiritual Weapon aanval', why: 'Gratis.', act: 'swAttack', done: t.bonus });
    else if (!c.conc && has2 && canSlot && !actionSlot) steps.push({ k: 'Bonusactie', title: '🔨 Spiritual Weapon', why: 'Level 2 slot. Daarna elke beurt gratis aanvallen.', act: 'cast', arg: 'spiritualWeapon', done: t.bonus });

    return { tip: 'Blijf binnen 6 vakjes van Charlie.', steps };
  };
})();

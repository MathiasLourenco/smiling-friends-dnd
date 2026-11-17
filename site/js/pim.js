/* Pim: casting spells, effects and turn advice. */
(function () {
  'use strict';
  const D = window.SF, APP = window.APP;
  const { roll, sum, ask, C } = APP;

  const TIME_KEY = { action: 'action', bonus: 'bonus', reaction: 'reaction' };
  APP.TIME_LABEL = { action: 'Action', bonus: 'Bonus action', reaction: 'Reaction', none: 'Free' };

  const lowestSlot = (c, min) => {
    for (let l = Math.max(1, min); l <= 2; l++) if (c.slots[l] > 0) return l;
    return null;
  };
  const giveButtons = (amount) => [
    { label: 'To Pim', act: 'giveHeal', arg: 'pim:' + amount },
    { label: 'To Charlie', act: 'giveHeal', arg: 'charlie:' + amount }
  ];
  const saveRes = (title, ab, line, extra) => Object.assign({ who: 'pim', title, lines: [`Target makes a <b>${ab} save, DC 14</b>.`, line] }, extra || {});
  const note = (title, line) => APP.note(title, line ? [line] : [], { who: 'pim' });

  const EFFECTS = {
    toll(o) {
      const die = o.injured ? 12 : 8, r = roll(1, die)[0];
      APP.show(saveRes('🔔 Toll the Dead', 'WIS', `Fail: <b>${r} necrotic</b>.`, { big: r, sub: `1d${die}` }));
    },
    sacred() {
      const r = roll(1, 8)[0];
      APP.show(saveRes('🔥 Sacred Flame', 'DEX', `Fail: <b>${r} radiant</b>.`, { big: r, sub: '1d8' }));
    },
    guidance() { C('pim').guidance = true; note('👍 Guidance', 'Pick a skill: +1d4 to those checks (1 minute).'); },
    thaumaturgy() { note('🎭 Thaumaturgy', 'Describe the effect to the DM.'); },
    spare() { note('🩹 Spare the Dying', 'The target is stable.'); },
    bless() { C('pim').blessed = true; C('charlie').blessed = true; note('⭐ Bless', 'Pim and Charlie: +1d4 to attacks and saves.'); },
    healingWord(o) {
      const n = 2 * o.lvl, r = roll(n, 4), total = sum(r) + 4;
      APP.show({ who: 'pim', title: '💬 Healing Word', big: total, sub: `${n}d4 + 4`, lines: ['Who gets it?'], buttons: giveButtons(total) });
    },
    guidingBolt(o) {
      APP.runTest({ who: 'pim', kind: 'patk', label: '☄️ Guiding Bolt', mod: 6, mode: C('pim').mode, bless: C('pim').blessed,
        dmg: { n: 4 + (o.lvl - 1), s: 6, bonus: 0, type: 'radiant' } });
    },
    command() { note('📢 Command', 'Target makes a <b>WIS save, DC 14</b>. Pick: Approach, Drop, Flee, Grovel or Halt.'); },
    faerieFire() { note('🟣 Faerie Fire', 'Everyone in the cube makes a <b>DEX save, DC 14</b>.'); },
    sleep() { note('😴 Sleep', 'Everyone in the sphere makes a <b>WIS save, DC 14</b>.'); },
    spiritualWeapon() { APP.swAttack(true); },
    aid() {
      ['pim', 'charlie'].forEach((id) => { const c = C(id); if (!c.aid) { c.aid = true; c.hp += 5; } });
      note('☀️ Aid', 'Pim and Charlie: +5 max HP for 8 hours.');
    },
    holdPerson() {
      APP.show(saveRes('🧊 Hold Person', 'WIS', 'Fail: Paralyzed.', {
        buttons: [{ label: 'Failed', act: 'holdFail' }, { label: 'Saved', act: 'holdPass', cls: 'ghost' }] }));
    },
    moonbeam() { APP.moonbeamHit(); },
    seeInvis() { note('👓 See Invisibility', 'You see invisible creatures (1 hour).'); },
    sanctuary() { C('pim').zone = 10; note('🌅 Twilight Sanctuary', 'Someone ends their turn inside? Tap 🌅 for temp HP.'); },
    divineSpark() {
      const r = roll(1, 8)[0] + 4;
      APP.show({ who: 'pim', title: '⚡ Divine Spark', big: r, sub: '1d8 + 4',
        lines: [`Or as damage: CON save DC 14, fail ${r}, success ${Math.floor(r / 2)}.`], buttons: giveButtons(r) });
    },
    turnUndead() { note('💀 Turn Undead', 'Undead within 30 ft make a <b>WIS save, DC 14</b>.'); },
    vigilant() {
      APP.show({ who: 'pim', title: '⏰ Vigilant Blessing', lines: ['Who do you touch?'],
        buttons: [{ label: 'Myself', act: 'vbGive', arg: 'pim' }, { label: 'Charlie', act: 'vbGive', arg: 'charlie' }] });
    },
    eyes() { note('🌌 Eyes of Night', 'Up to 4 friends see in the dark for 1 hour.'); }
  };

  APP.swAttack = (fresh) => {
    const c = C('pim');
    if (!fresh) {
      if (c.conc !== 'spiritualWeapon') return note('No Spiritual Weapon', 'Cast it first.');
      if (c.inCombat && c.turn.bonus && !ask('Bonus action already used. Do it anyway?')) return;
      if (c.inCombat) c.turn.bonus = true;
    }
    APP.runTest({ who: 'pim', kind: 'patk', label: '🔨 Spiritual Weapon', mod: 6, mode: c.mode, bless: c.blessed,
      dmg: { n: 1, s: 8, bonus: 4, type: 'force' } });
  };
  APP.moonbeamHit = () => {
    const r = sum(roll(2, 10));
    APP.show(saveRes('🌙 Moonbeam', 'CON', `Fail: <b>${r} radiant</b>, success: <b>${Math.floor(r / 2)}</b>.`, { big: r, sub: '2d10' }));
  };
  APP.moonbeamMove = () => {
    const c = C('pim');
    if (c.conc !== 'moonbeam') return note('No Moonbeam', 'Cast it first.');
    if (c.inCombat && c.turn.action && !ask('Action already used. Do it anyway?')) return;
    if (c.inCombat) c.turn.action = true;
    APP.moonbeamHit();
  };

  APP.cast = (id, opts) => {
    opts = opts || {};
    const sp = D.spells[id], c = C('pim');
    if (c.hp === 0) return note('You are at 0 HP', 'Roll a death save.');
    let lvl = null;
    if (typeof sp.level === 'number' && sp.level > 0) {
      lvl = opts.lvl || lowestSlot(c, sp.level);
      if (!lvl || c.slots[lvl] <= 0) return note('No spell slots left', 'They come back after a long rest.');
      if (c.inCombat && c.turn.slot && !ask('You already used a spell slot this turn (max 1). Do it anyway?')) return;
    }
    if (sp.level === 'cd' && c.cd <= 0) return note('No Channel Divinity left', 'You regain 1 on a short rest.');
    if (id === 'eyes' && c.eyes <= 0) {
      lvl = lowestSlot(c, 1);
      if (!lvl) return note('Eyes of Night used up', 'No spell slots left either.');
      if (!ask(`Free use is gone. Spend a level ${lvl} spell slot?`)) return;
    }
    const key = opts.reaction ? 'reaction' : TIME_KEY[sp.time];
    const label = opts.reaction ? 'reaction' : APP.TIME_LABEL[sp.time].toLowerCase();
    if (c.inCombat && key && c.turn[key] && !ask(`Your ${label} is already used this turn. Do it anyway?`)) return;
    if (sp.conc && c.conc && !ask(`This ends ${D.spells[c.conc].name} (concentration). Continue?`)) return;

    if (sp.conc && c.conc) APP.endConc(true);
    if (lvl) { c.slots[lvl]--; if (c.inCombat) c.turn.slot = true; }
    if (sp.level === 'cd') c.cd--;
    if (id === 'eyes' && !lvl) c.eyes--;
    if (c.inCombat && key) c.turn[key] = true;
    if (sp.conc) c.conc = id;
    EFFECTS[id](Object.assign({ lvl: lvl || 1 }, opts));
  };

  /* Turn advice: action and bonus action only. */
  APP.pimAdvice = () => {
    const c = C('pim'), t = c.turn, s = c.situ, steps = [];
    if (c.hp === 0) return { tip: '', steps: [{ k: 'Now', title: '💀 Death save', act: 'deathSave', label: 'Roll' }] };
    const canSlot = !t.slot;
    const has1 = c.slots[1] > 0 || c.slots[2] > 0, has2 = c.slots[2] > 0;
    const wantHeal = s.low && has1 && canSlot;
    let act, actionSlot = false;
    if (s.low && !wantHeal && c.cd > 0) act = { title: '⚡ Divine Spark', why: 'No slot to heal with: this heals 1d8+4.', act: 'cast', arg: 'divineSpark' };
    else if (c.zone === 0 && c.cd > 0) act = { title: '🌅 Twilight Sanctuary', why: 'Temp HP for both of you every turn.', act: 'cast', arg: 'sanctuary' };
    else if (s.undead && c.cd > 0) act = { title: '💀 Turn Undead', why: 'Undead run away.', act: 'cast', arg: 'turnUndead' };
    else if (!wantHeal && s.humanoid && has2 && canSlot && c.conc !== 'holdPerson') {
      act = { title: '🧊 Hold Person', why: c.conc ? `Ends ${D.spells[c.conc].name}.` : 'Charlie next to it = every hit is a crit.', act: 'cast', arg: 'holdPerson' };
      actionSlot = true;
    } else act = { title: '🔔 Toll the Dead', why: 'Free.', btns: [{ label: 'Target hurt', act: 'cast', arg: 'toll|injured' }, { label: 'Target unhurt', act: 'cast', arg: 'toll' }] };
    steps.push(Object.assign({ k: 'Action', done: t.action }, act));

    if (wantHeal) steps.push({ k: 'Bonus action', title: '💬 Healing Word', why: 'Someone is (nearly) down.', act: 'cast', arg: 'healingWord', done: t.bonus });
    else if (c.conc === 'spiritualWeapon') steps.push({ k: 'Bonus action', title: '🔨 Spiritual Weapon attack', why: 'Free.', act: 'swAttack', done: t.bonus });
    else if (!c.conc && has2 && canSlot && !actionSlot) steps.push({ k: 'Bonus action', title: '🔨 Spiritual Weapon', why: 'Level 2 slot. Free attacks every turn after.', act: 'cast', arg: 'spiritualWeapon', done: t.bonus });

    return { tip: 'Stay within 6 squares of Charlie.', steps };
  };
})();

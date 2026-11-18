/* Pim: spells, Bardic Inspiration and turn advice. */
(function () {
  'use strict';
  const D = window.SF, P = D.pim, APP = window.APP;
  const { roll, rand, sum, ask, S } = APP;

  APP.TIME_LABEL = { action: 'Action', bonus: 'Bonus action', none: 'Free' };
  const note = (title, lines, extra) => APP.note(title, lines, extra);
  const save = (ab) => `Target makes a <b>${ab} save, DC ${P.spellDC}</b>.`;
  const savedButtons = (id, failLabel, savedLabel) => [
    { label: failLabel, act: 'closeResult', cls: 'ok' },
    { label: savedLabel, act: 'saved', arg: id, cls: 'ghost' }
  ];

  const EFFECTS = {
    mockery() {
      const r = sum(roll(2, 6));
      APP.show({ title: '🤪 Vicious Mockery', big: r, sub: '2d6 psychic',
        lines: [save('WIS'), `Fail: <b>${r} psychic</b> and disadvantage on its next attack.`] });
    },
    healingWord(o) {
      const n = 2 * o.lvl, total = sum(roll(n, 4)) + 4;
      APP.show({ title: '💬 Healing Word', big: total, sub: `${n}d4 + 4`, lines: ['Who gets it?'],
        buttons: [{ label: 'Pim', act: 'healSelf', arg: total }, { label: 'Charlie', act: 'healCharlie', arg: total }] });
    },
    aid() {
      const c = S();
      if (!c.aid) { c.aid = true; c.hp += 5; }
      note('☀️ Aid', ['Pim and Charlie: +5 max HP and +5 HP for 8 hours.', 'Tell Charlie to add 5 HP.']);
    },
    invisibility() { note('👻 Invisibility', ['Touch someone: invisible for 1 hour.', 'It ends when they attack, do damage or cast a spell.']); },
    laughter() {
      APP.show({ title: '😂 Tasha\'s Hideous Laughter', lines: [save('WIS'), 'Fail: it falls over laughing and can\'t act. It tries again each turn and when it gets hurt.'],
        buttons: savedButtons('laughter', 'It failed 😂', 'It saved') });
    },
    pattern() {
      APP.show({ title: '🌀 Hypnotic Pattern', lines: ['Everyone in a 30 ft cube makes a <b>WIS save, DC 15</b>.', 'Fail: dazed, can\'t move or act.', '⚠️ Don\'t hurt the dazed ones: damage wakes them up.'],
        buttons: savedButtons('pattern', 'Some failed 🌀', 'Everyone saved') });
    },
    charm() { note('🥰 Charm Person', [save('WIS'), 'Fail: it sees you as a friend for 1 hour. Afterwards it knows it was charmed.', 'It gets advantage on the save if you are fighting it.']); },
    suggestion() {
      APP.show({ title: '💡 Suggestion', lines: ['It must hear and understand you.', save('WIS'), 'Fail: it does what you suggest (25 words or fewer) for up to 8 hours.'],
        buttons: savedButtons('suggestion', 'It failed 💡', 'It saved') });
    },
    calm() {
      APP.show({ title: '😌 Calm Emotions', lines: ['People in a 20 ft radius make a <b>CHA save, DC 15</b>.', 'Fail: they stop being hostile (1 minute).'],
        buttons: savedButtons('calm', 'Some failed 😌', 'Everyone saved') });
    },
    tongues() { note('🗣️ Tongues', ['For 1 hour you understand every language, and everyone understands you.']); },
    illusion() { note('🪄 Minor Illusion', ['Tell the DM: a <b>sound</b> or an <b>image</b>, and what exactly (1 minute).']); },
    prestidigitation() { note('✨ Prestidigitation', ['Tell the DM which trick you do: ' + D.spells.prestidigitation.opts.map((o) => o[0].toLowerCase()).join(', ') + '.']); }
  };

  APP.cast = (id) => {
    const sp = D.spells[id], c = S();
    if (c.hp === 0) return note('You are at 0 HP', ['Roll a death save.']);
    if (sp.level === 'bi') return id === 'inspiration' ? APP.inspire() : APP.unsettle();
    let lvl = null;
    if (sp.level > 0) {
      lvl = APP.lowestSlot(sp.level);
      if (!lvl) return note('No spell slots left', [`You have no level ${sp.level}+ slots. They come back after a long rest.`]);
      if (c.inCombat && c.turn.slot && !ask('You already used a spell slot this turn (max 1). Do it anyway?')) return;
    }
    const key = sp.time === 'action' || sp.time === 'bonus' ? sp.time : null;
    if (c.inCombat && key && c.turn[key] && !ask(`Your ${APP.TIME_LABEL[key].toLowerCase()} is already used this turn. Do it anyway?`)) return;
    if (sp.conc && c.conc && c.conc !== id && !ask(`${D.spells[c.conc].name} stops (you can only concentrate on 1 spell). Continue?`)) return;

    if (lvl) { c.slots[lvl]--; if (c.inCombat) c.turn.slot = true; }
    if (c.inCombat && key) c.turn[key] = true;
    if (sp.conc) c.conc = id;
    EFFECTS[id]({ lvl: lvl || 1 });
    if (lvl && lvl > sp.level) APP.st.last.lines.push(`Used a level ${lvl} slot (no level ${sp.level} left).`);
  };

  const useBonus = () => {
    const c = S();
    if (c.inCombat && c.turn.bonus && !ask('Your bonus action is already used this turn. Do it anyway?')) return false;
    if (c.inCombat) c.turn.bonus = true;
    return true;
  };
  const noBI = () => note('No Bardic Inspiration left', ['It comes back after a short rest.', 'Or spend a spell slot: "+1" next to Bardic Inspiration.']);

  APP.inspire = () => {
    const c = S();
    if (c.bi <= 0) return noBI();
    if (!useBonus()) return;
    c.bi--; c.charlieBI = true;
    note('🎵 Bardic Inspiration', ['Tell Charlie: if he fails a d20 roll in the next hour, he can add <b>1d8</b>.']);
  };
  APP.unsettle = () => {
    const c = S();
    if (c.bi <= 0) return noBI();
    if (!useBonus()) return;
    c.bi--;
    const r = rand(P.biDie);
    APP.show({ title: '😰 Unsettling Words', big: '−' + r, sub: '1d8',
      lines: [`Tell the DM: the target subtracts <b>${r}</b> from its next save.`, 'Now cast your spell on it.'] });
  };
  APP.font = () => {
    const c = S();
    if (c.bi >= P.biMax) return note('Bardic Inspiration is full', []);
    const lvl = APP.lowestSlot(1);
    if (!lvl) return note('No spell slots left', []);
    if (!ask(`Spend a level ${lvl} spell slot to get 1 Bardic Inspiration back?`)) return;
    c.slots[lvl]--; c.bi++;
    note('🎵 +1 Bardic Inspiration', [`Used a level ${lvl} spell slot.`]);
  };
  APP.saved = (id) => {
    const c = S();
    if (c.conc === id) c.conc = null;
    note('Saved', [`${D.spells[id].name} didn't work. Your concentration is free again.`]);
  };

  /* Turn advice: numbered steps, max 2. */
  APP.advice = () => {
    const c = S(), t = c.turn, s = c.situ;
    if (c.hp === 0) return { steps: [{ kind: 'Start of turn', title: '💀 Death save', why: 'You are at 0 HP.', act: 'deathSave', label: 'Roll' }] };
    const anySlot = APP.lowestSlot(1) !== null;
    const holding = c.conc === 'pattern' || c.conc === 'laughter';
    const wantHeal = s.down && anySlot && !t.slot;
    let action, bonus = null;

    if (wantHeal) {
      bonus = { title: '💬 Healing Word', why: 'Charlie gets back up.', act: 'cast', arg: 'healingWord', done: t.bonus };
      action = { title: '🤪 Vicious Mockery', why: 'Free.', act: 'cast', arg: 'mockery', done: t.action };
    } else if (holding) {
      action = { title: '🤪 Vicious Mockery', why: `Pick an enemy that is NOT stuck in ${D.spells[c.conc].name}.`, act: 'cast', arg: 'mockery', done: t.action };
    } else if (s.many && c.slots[3] > 0 && !t.slot) {
      action = { title: '🌀 Hypnotic Pattern', why: 'Stops a whole group at once.', act: 'cast', arg: 'pattern', done: t.action, save: true };
    } else if (s.boss && anySlot && !t.slot) {
      action = { title: '😂 Tasha\'s Hideous Laughter', why: 'The tough enemy falls over laughing.', act: 'cast', arg: 'laughter', done: t.action, save: true };
    } else {
      action = { title: '🤪 Vicious Mockery', why: 'Free. Make fun of an enemy.', act: 'cast', arg: 'mockery', done: t.action };
    }

    if (!bonus && action.save && c.bi > 0) bonus = { title: '😰 Unsettling Words', why: 'Do this FIRST on the main target: its save gets worse.', act: 'cast', arg: 'unsettling', done: t.bonus, first: true };
    else if (!bonus && c.bi > 0 && !c.charlieBI) bonus = { title: '🎵 Bardic Inspiration', why: 'Give it to Charlie.', act: 'cast', arg: 'inspiration', done: t.bonus, uses: [c.bi, P.biMax] };

    const steps = [];
    if (bonus && (bonus.first || wantHeal)) steps.push(Object.assign({ kind: 'Bonus action' }, bonus));
    steps.push(Object.assign({ kind: 'Action' }, action));
    if (bonus && !(bonus.first || wantHeal)) steps.push(Object.assign({ kind: 'Bonus action' }, bonus));
    return { steps, tip: 'Stay behind Charlie, not next to enemies.' };
  };
})();

/* Charlie: Rage, aanvallen met alle bonussen en de "Wat doe ik nu?"-hulp. */
(function () {
  'use strict';
  const D = window.SF, APP = window.APP;
  const { roll, sum, ask, C } = APP;

  APP.rage = () => {
    const c = C('charlie');
    if (c.hp === 0) return APP.note('You are at 0 HP', ['Roll a death save.'], { who: 'charlie' });
    if (c.raging) return APP.note('Already raging', ['Attack every turn to keep it going.'], { who: 'charlie' });
    if (c.rage <= 0) return APP.note('No Rage left', ['You regain 1 on a short rest.'], { who: 'charlie' });
    if (c.inCombat && c.turn.bonus && !ask('Bonus action already used. Do it anyway?')) return;
    c.rage--; c.raging = true; c.turn.kept = true;
    if (c.inCombat) c.turn.bonus = true;
    APP.note('😤 Rage', ['Resist weapon damage, +2 damage, advantage on STR.'], { who: 'charlie' });
  };
  APP.stopRage = () => { C('charlie').raging = false; APP.note('Rage ended', [], { who: 'charlie' }); };
  APP.extendRage = () => {
    const c = C('charlie');
    if (!c.raging) return;
    if (c.turn.bonus && !ask('Bonus action already used. Do it anyway?')) return;
    c.turn.bonus = true; c.turn.kept = true;
    APP.note('😤 Rage extended', [], { who: 'charlie' });
  };

  function damage(wid, crit, o) {
    const c = C('charlie'), w = D.weapons[wid], parts = [];
    let savage = false, frenzy = false;
    const n = w.n * (crit ? 2 : 1);
    let r = roll(n, w.s);
    if (!c.turn.savage) {
      const r2 = roll(n, w.s);
      savage = true;
      if (sum(r2) > sum(r)) r = r2;
      parts.push([`${n}d${w.s} (Savage: best of 2)`, sum(r)]);
    } else parts.push([`${n}d${w.s}`, sum(r)]);
    if (!o.cleave) parts.push(['STR', 4]);
    if (c.raging) parts.push(['Rage', 2]);
    if (w.heavy && !o.cleave && !o.hew) parts.push(['GWM', 2]);
    if (!o.cleave && !o.hew && c.raging && c.turn.recklessUsed && !c.turn.frenzy) {
      const f = roll(crit ? 4 : 2, 6);
      frenzy = true;
      parts.push([`Frenzy ${crit ? 4 : 2}d6`, sum(f)]);
    }
    return { total: sum(parts.map((p) => p[1])), parts, savage, frenzy };
  }

  APP.attack = (wid, o) => {
    o = o || {};
    const c = C('charlie');
    if (c.hp === 0) return APP.note('You are at 0 HP', ['Roll a death save.'], { who: 'charlie' });
    if (c.inCombat) {
      if (o.hew) {
        if (c.turn.bonus && !ask('Bonus action already used. Do it anyway?')) return;
        c.turn.bonus = true;
      } else if (o.cleave) {
        c.turn.cleave = true;
      } else {
        if (c.turn.action && !ask('You already attacked this turn (1 attack per turn at level 4). Do it anyway?')) return;
        c.turn.action = true;
      }
    }
    let mode = c.mode;
    if (c.turn.reckless || c.turn.recklessUsed) { c.turn.recklessUsed = true; mode = 1; }
    if (c.raging) c.turn.kept = true;
    const w = D.weapons[wid];
    const label = `${w.emoji} ${o.cleave ? 'Cleave' : o.hew ? 'Hew' : w.name}${mode === 1 ? ' (advantage)' : ''}`;
    APP.runTest({ who: 'charlie', kind: 'catk', label, mod: 6, mode, bless: c.blessed, wid, o });
  };

  APP.TESTS.catk = (t) => {
    const c = C('charlie'), w = D.weapons[t.wid];
    const auto = c.situ.paralyzed && w.melee;
    const crit = t.nat === 20 || (auto && t.nat !== 1);
    const dmg = damage(t.wid, crit, t.o);
    c.pending = { wid: t.wid, o: t.o, dmg, crit };
    const lines = [];
    if (t.nat === 1) lines.push('Natural 1: miss.');
    else lines.push(`${crit ? '💥 Crit! ' : ''}Hit: <b>${dmg.total} ${w.type}</b> <small>(${dmg.parts.map((p) => p[0] + ' ' + p[1]).join(' + ')})</small>`);
    const buttons = t.nat === 1
      ? [{ label: 'Miss', act: 'miss' }]
      : [{ label: '✔ Hit', act: 'hit', cls: 'ok' }, { label: '✘ Miss', act: 'miss', cls: 'bad' }];
    APP.testShow(t, t.label, lines, buttons);
  };

  APP.hit = () => {
    const c = C('charlie'), p = c.pending;
    if (!p) return;
    c.pending = null;
    if (p.dmg.savage) c.turn.savage = true;
    if (p.dmg.frenzy) c.turn.frenzy = true;
    const w = D.weapons[p.wid], buttons = [];
    if (p.wid === 'greataxe' && !p.o.cleave && !p.o.hew && !c.turn.cleave) buttons.push({ label: 'Cleave', act: 'cleave' });
    if (!p.o.hew) buttons.push({ label: p.crit ? 'Hew (crit)' : 'Hew (enemy down)', act: 'hew', arg: p.wid });
    APP.show({ who: 'charlie', title: '✔ Hit', big: p.dmg.total, sub: w.type, buttons });
  };
  APP.miss = () => {
    const c = C('charlie'), p = c.pending;
    c.pending = null;
    const buttons = p && p.wid === 'greatsword' ? [{ label: 'Graze: 4 damage', act: 'graze' }] : [];
    APP.show({ who: 'charlie', title: '✘ Miss', big: '—', buttons });
  };
  APP.graze = () => APP.show({ who: 'charlie', title: 'Graze', big: 4, sub: 'slashing' });

  APP.shove = () => {
    const c = C('charlie');
    if (c.inCombat) {
      if (c.turn.action && !ask('Action already used. Do it anyway?')) return;
      c.turn.action = true;
    }
    if (c.raging) c.turn.kept = true;
    APP.note('🤼 Shove / Grapple', ['Target makes a <b>STR or DEX save, DC 14</b>.'], { who: 'charlie' });
  };
  APP.helpTalk = () => {
    const c = C('charlie');
    if (c.inCombat) c.turn.action = true;
    APP.note('🤝 Help', ['Pim rolls with <b>advantage</b>.'], { who: 'charlie' });
  };

  /* Beurt-hulp: alleen bonusactie en actie. */
  APP.charlieAdvice = () => {
    const c = C('charlie'), t = c.turn, s = c.situ, steps = [];
    if (c.hp === 0) return { tip: '', steps: [{ k: 'Now', title: '💀 Death save', act: 'deathSave', label: 'Roll' }] };
    if (!c.raging && c.rage > 0) steps.push({ k: 'Bonus action', title: '😤 Rage', act: 'rage', done: t.bonus });
    const w = s.boss ? 'greatsword' : 'greataxe', wp = D.weapons[w];
    const reck = t.reckless || t.recklessUsed;
    steps.push({ k: 'Action', title: `${wp.emoji} ${wp.name}`, why: s.paralyzed ? 'Hit = crit.' : '',
      act: 'atk', arg: w, label: 'Attack', done: t.action,
      extra: `<button type="button" class="tog ${reck ? 'on' : ''}" data-act="turnToggle" data-arg="reckless">Reckless</button>` });
    const tip = c.raging && !t.kept ? 'Attack, or your Rage ends.' : 'Stay within 6 squares of Pim.';
    return { tip, steps };
  };
})();

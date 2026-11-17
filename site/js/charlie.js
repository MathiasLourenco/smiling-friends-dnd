/* Charlie: Rage, aanvallen met alle bonussen en de "Wat doe ik nu?"-hulp. */
(function () {
  'use strict';
  const D = window.SF, APP = window.APP;
  const { roll, sum, ask, C } = APP;

  APP.rage = () => {
    const c = C('charlie');
    if (c.hp === 0) return APP.note('Je ligt op 0 HP', ['Je kan niks doen. Gooi een death save.'], { who: 'charlie' });
    if (c.raging) return APP.note('Je bent al in Rage', ['Val elke beurt aan, dan blijft hij aan.'], { who: 'charlie' });
    if (c.rage <= 0) return APP.note('Geen Rage meer', ['Na een short rest krijg je er 1 terug.'], { who: 'charlie' });
    if (c.inCombat && c.turn.bonus && !ask('Je bonusactie is deze beurt al gebruikt. Toch doen?')) return;
    c.rage--; c.raging = true; c.turn.kept = true;
    if (c.inCombat) c.turn.bonus = true;
    APP.note('😤 RAGE!', ['"Ik ben er KLAAR mee."', 'Halve schade van wapens, +2 schade op STR-aanvallen, voordeel op STR-checks en -saves.',
      'Val elke beurt aan (of gebruik je bonusactie), anders stopt je Rage.'], { who: 'charlie' });
  };
  APP.stopRage = () => { C('charlie').raging = false; APP.note('Rage gestopt', ['Charlie is weer… Charlie.'], { who: 'charlie' }); };
  APP.extendRage = () => {
    const c = C('charlie');
    if (!c.raging) return;
    if (c.turn.bonus && !ask('Je bonusactie is deze beurt al gebruikt. Toch doen?')) return;
    c.turn.bonus = true; c.turn.kept = true;
    APP.note('😤 Rage verlengd', ['Je Rage blijft aan tot het eind van je volgende beurt.'], { who: 'charlie' });
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
      parts.push([`${n}d${w.s} (Savage: beste van 2)`, sum(r)]);
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
    if (c.hp === 0) return APP.note('Je ligt op 0 HP', ['Je kan niks doen. Gooi een death save.'], { who: 'charlie' });
    if (c.inCombat) {
      if (o.hew) {
        if (c.turn.bonus && !ask('Je bonusactie is deze beurt al gebruikt. Toch doen?')) return;
        c.turn.bonus = true;
      } else if (o.cleave) {
        c.turn.cleave = true;
      } else {
        if (c.turn.action && !ask('Je hebt deze beurt al aangevallen (op level 4 is dat 1 aanval per beurt). Toch doen?')) return;
        c.turn.action = true;
      }
    }
    let mode = c.mode;
    if (c.turn.reckless || c.turn.recklessUsed) { c.turn.recklessUsed = true; mode = 1; }
    if (c.raging) c.turn.kept = true;
    const w = D.weapons[wid];
    const label = `${w.emoji} ${o.cleave ? 'Cleave' : o.hew ? 'Hew' : w.name}${mode === 1 ? ' (voordeel)' : ''}`;
    APP.runTest({ who: 'charlie', kind: 'catk', label, mod: 6, mode, bless: c.blessed, wid, o });
  };

  APP.TESTS.catk = (t) => {
    const c = C('charlie'), w = D.weapons[t.wid];
    const auto = c.situ.paralyzed && w.melee;
    const crit = t.nat === 20 || (auto && t.nat !== 1);
    const dmg = damage(t.wid, crit, t.o);
    c.pending = { wid: t.wid, o: t.o, dmg, crit };
    const lines = [];
    if (t.nat === 1) lines.push('Een 1: altijd mis.');
    else if (t.nat === 20) lines.push('💥 KRITIEK! Automatisch raak, dubbele dobbelstenen.');
    else lines.push(`Raak als de AC van de vijand <b>${t.total} of lager</b> is.${auto ? ' Raak = automatisch KRITIEK (verlamd doelwit).' : ''}`);
    if (t.nat !== 1) lines.push(`Raak → <b>${dmg.total} ${w.type}</b> (${dmg.parts.map((p) => p[0] + ' ' + p[1]).join(' + ')})`);
    const buttons = t.nat === 1
      ? [{ label: '✘ Mis', act: 'miss' }]
      : [{ label: '✔ Raak!', act: 'hit', cls: 'ok' }, { label: '✘ Mis', act: 'miss', cls: 'bad' }];
    APP.testShow(t, t.label, lines, buttons);
  };

  APP.hit = () => {
    const c = C('charlie'), p = c.pending;
    if (!p) return;
    c.pending = null;
    if (p.dmg.savage) c.turn.savage = true;
    if (p.dmg.frenzy) c.turn.frenzy = true;
    const w = D.weapons[p.wid], buttons = [], lines = [`Zeg tegen de DM: <b>${p.dmg.total} ${w.type}</b> schade.`];
    if (p.wid === 'greataxe' && !p.o.cleave && !p.o.hew && !c.turn.cleave) buttons.push({ label: '🪓 Cleave: vijand ernaast', act: 'cleave' });
    if (!p.o.hew) buttons.push({ label: p.crit ? '⚡ Hew: extra aanval' : '☠️ Vijand neer? Hew', act: 'hew', arg: p.wid });
    if (p.wid === 'handaxe') lines.push('Vex: je volgende aanval op hem krijgt voordeel.');
    if (p.crit && !p.o.hew) lines.push('Kritiek = je mag Hew doen (extra aanval als bonusactie).');
    APP.show({ who: 'charlie', title: '✔ Raak!', big: p.dmg.total, sub: 'schade', lines, buttons });
  };
  APP.miss = () => {
    const c = C('charlie'), p = c.pending;
    c.pending = null;
    const lines = ['Volgende keer beter.'], buttons = [];
    if (p && p.wid === 'greatsword') buttons.push({ label: '🗡️ Graze: toch 4 schade', act: 'graze' });
    if (p && (p.dmg.frenzy || p.dmg.savage)) lines.push('Frenzy en Savage Attacker bewaar je voor je volgende raak.');
    APP.show({ who: 'charlie', title: '✘ Mis', big: '—', lines, buttons });
  };
  APP.graze = () => APP.show({ who: 'charlie', title: '🗡️ Graze', big: 4, sub: 'slashing', lines: ['Mis, maar toch 4 schade (je STR).'] });

  APP.shove = () => {
    const c = C('charlie');
    if (c.inCombat) {
      if (c.turn.action && !ask('Je actie is deze beurt al gebruikt. Toch doen?')) return;
      c.turn.action = true;
    }
    if (c.raging) c.turn.kept = true;
    APP.note('🤼 Duwen / vastpakken', ['De vijand gooit een <b>STR- of DEX-save tegen DC 14</b> (hij kiest).',
      'Faalt hij: 5 ft wegduwen, omver (Prone) of vastgepakt (Grappled).'], { who: 'charlie' });
  };
  APP.helpTalk = () => {
    const c = C('charlie');
    if (c.inCombat) c.turn.action = true;
    APP.note('🤝 Helpen praten', ['Jij hebt ook Persuasion, dus Pim gooit met <b>voordeel</b>.', 'Tip: laat Pim vooraf ook "Je kan het!" (+1d4) doen.'], { who: 'charlie' });
  };

  /* "Wat doe ik nu?" voor Charlie */
  APP.charlieAdvice = () => {
    const c = C('charlie'), t = c.turn, s = c.situ, steps = [];
    if (c.hp === 0) {
      steps.push({ k: '💀 Nu', title: 'Je ligt op 0 HP', why: 'Gooi aan het begin van je beurt een death save. Hopelijk Peptalkt Pim je overeind.', act: 'deathSave', label: '🎲 Death save' });
      return steps;
    }
    if (!c.raging && c.rage > 0) steps.push({ k: '✨ Bonusactie', title: '😤 Rage!', why: '"Ik ben er KLAAR mee." Halve schade, +2 schade, Frenzy aan.', act: 'rage', label: 'RAGE', done: t.bonus });
    steps.push({ k: '🏃 Beweging', title: s.paralyzed ? 'Ga naast het verlamde doelwit' : 'Naar de gevaarlijkste vijand', why: 'Blijf binnen 6 vakjes van Pim, dan blijf je in de Smile Zone.', toggle: 'move', done: t.move });
    const w = s.boss ? 'greatsword' : 'greataxe', wp = D.weapons[w];
    steps.push({ k: '⚡ Actie', title: `${wp.emoji} Aanval met ${wp.name}${t.reckless ? ' (Reckless)' : ''}`,
      why: s.paralyzed ? 'Verlamd doelwit: raak = automatisch KRITIEK!' : c.raging ? 'Reckless + Rage = Frenzy +2d6 op je eerste raak.' : 'Tip: eerst Rage, dan doe je veel meer schade.',
      act: 'atk', arg: w, label: 'Aanvallen', done: t.action });
    steps.push({ k: '🎯 Na een raak', title: 'Cleave en Hew', why: 'Greataxe raak en een vijand ernaast: Cleave. Kritiek of vijand neer: Hew (bonusactie). De knoppen verschijnen vanzelf.' });
    if (c.raging) steps.push({ k: '⚠️ Rage', title: t.kept ? 'Rage blijft aan ✔' : 'Val aan, anders stopt je Rage',
      why: t.kept ? 'Je hebt deze beurt aangevallen of Rage verlengd.' : 'Geen vijand in de buurt? Verleng je Rage met je bonusactie.',
      act: t.kept ? null : 'extendRage', label: 'Verlengen' });
    if (t.recklessUsed) steps.push({ k: '🎯 Let op', title: 'Je viel Reckless aan', why: 'Vijanden hebben voordeel tegen jou tot je volgende beurt. Rage halveert de schade gelukkig.' });
    return steps;
  };
})();

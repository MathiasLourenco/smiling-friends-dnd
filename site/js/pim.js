/* Pim: spells casten, effecten en de "Wat doe ik nu?"-hulp. */
(function () {
  'use strict';
  const D = window.SF, APP = window.APP;
  const { roll, sum, ask, C } = APP;

  const TIME_KEY = { action: 'action', bonus: 'bonus', reaction: 'reaction' };
  const TIME_LABEL = APP.TIME_LABEL = { action: 'Actie', bonus: 'Bonusactie', reaction: 'Reactie', none: 'Gratis' };

  const lowestSlot = (c, min) => {
    for (let l = Math.max(1, min); l <= 2; l++) if (c.slots[l] > 0) return l;
    return null;
  };

  function giveButtons(amount) {
    return [
      { label: `💚 Geef ${amount} HP aan Pim`, act: 'giveHeal', arg: 'pim:' + amount },
      { label: `💚 Geef ${amount} HP aan Charlie`, act: 'giveHeal', arg: 'charlie:' + amount }
    ];
  }
  function saveSpell(title, ab, lines) {
    return { who: 'pim', title, lines: [`Het doelwit gooit een <b>${ab}-save tegen DC 14</b>.`].concat(lines) };
  }

  const EFFECTS = {
    toll(o) {
      const die = o.injured ? 12 : 8, r = roll(1, die)[0];
      APP.show(Object.assign(saveSpell('🎺 Sad trombone', 'WIS', [`Faalt hij: <b>${r} necrotic</b> schade. Haalt hij hem: niks.`]),
        { big: r, sub: `1d${die} (${o.injured ? 'gewond doelwit' : 'ongedeerd doelwit'})` }));
    },
    sacred() {
      const r = roll(1, 8)[0];
      APP.show(Object.assign(saveSpell('✨ Glitterstraal', 'DEX', [`Faalt hij: <b>${r} radiant</b> schade. Dekking helpt hem niet.`]), { big: r, sub: '1d8' }));
    },
    guidance() {
      C('pim').guidance = true;
      APP.note('👍 Je kan het!', ['Kies samen met de DM een skill. Wie je aanraakte telt 1 minuut lang 1d4 op bij checks met die skill.',
        'Op de Sheet staat "+ Je kan het!" nu aan: de app telt de 1d4 automatisch op.'], { who: 'pim' });
    },
    thaumaturgy() { APP.note('🎭 Dramatisch momentje', ['Beschrijf wat er gebeurt: donderstem, flikkerende vlammen, deuren die dichtslaan…'], { who: 'pim' }); },
    spare() { APP.note('🩹 Pleister', ['Het doelwit is stabiel: geen death saves meer, maar nog wel bewusteloos.'], { who: 'pim' }); },
    bless(o) {
      C('pim').blessed = true; C('charlie').blessed = true;
      APP.note('⭐ Gouden sterretje', [`Tot ${o.lvl === 2 ? 4 : 3} wezens tellen 1 minuut lang 1d4 op bij aanvallen en saves.`,
        'Bij Pim en Charlie staat "Bless" nu aan: de app telt het automatisch op.', 'Charlie op een eigen tablet? Zeg dat hij Bless aanzet.'], { who: 'pim' });
    },
    healingWord(o) {
      const n = 2 * o.lvl, r = roll(n, 4), total = sum(r) + 4;
      APP.show({ who: 'pim', title: '💬 Peptalk', big: total, sub: `${n}d4 (${r.join(', ')}) + 4`, lines: ['Wie krijgt het?'], buttons: giveButtons(total) });
    },
    guidingBolt(o) {
      APP.runTest({ who: 'pim', kind: 'patk', label: '🚀 Smiley-raket', mod: 6, mode: C('pim').mode, bless: C('pim').blessed,
        dmg: { n: 4 + (o.lvl - 1), s: 6, bonus: 0, type: 'radiant', after: 'Raak? Dan krijgt de volgende aanval op dit doelwit voordeel.' } });
    },
    command(o) {
      APP.note('📢 Smile!', [`Kies ${o.lvl === 2 ? '2 doelwitten' : '1 doelwit'} en roep één woord: Approach, Drop, Flee, Grovel of Halt.`,
        'Het doelwit gooit een <b>WIS-save tegen DC 14</b>. Faalt hij, dan doet hij het in zijn volgende beurt.'], { who: 'pim' });
    },
    faerieFire() {
      APP.note('🪩 Discolicht', ['Kies een kubus van 4×4 vakjes. Iedereen erin gooit een <b>DEX-save tegen DC 14</b>.',
        'Wie faalt: aanvallen tegen hem krijgen voordeel, en hij kan niet onzichtbaar zijn.'], { who: 'pim' });
    },
    sleep() {
      APP.note('😴 Slaapliedje', ['Kies een punt. Vijanden binnen 5 ft gooien een <b>WIS-save tegen DC 14</b>.',
        'Faalt hij: hij kan niks tot het eind van zijn volgende beurt. Faalt hij dan nóg een keer: hij slaapt.'], { who: 'pim' });
    },
    spiritualWeapon() { APP.swAttack(true); },
    aid() {
      ['pim', 'charlie'].forEach((id) => { const c = C(id); if (!c.aid) { c.aid = true; c.hp += 5; } });
      APP.note('☀️ Ochtendpeptalk', ['Pim en Charlie: +5 max HP en +5 HP, voor 8 uur.', 'Je derde doelwit mag je zelf kiezen (bv. een NPC).'], { who: 'pim' });
    },
    holdPerson() {
      APP.show(Object.assign(saveSpell('🧊 Freeze-frame', 'WIS', ['Faalt hij: hij is verlamd. Aan het eind van elk van zijn beurten mag hij opnieuw gooien.',
        'Charlie naast hem = elke raak is automatisch KRITIEK!']), {
        buttons: [{ label: '🧊 Hij faalt: verlamd!', act: 'holdFail' }, { label: '😑 Hij haalt de save', act: 'holdPass', cls: 'ghost' }] }));
    },
    moonbeam() { APP.moonbeamHit(); },
    seeInvis() { APP.note('👓 Röntgenbril', ['Je ziet 1 uur lang onzichtbare wezens en dingen.'], { who: 'pim' }); },
    smileZone() {
      C('pim').zone = 10;
      APP.note('🌈 Smile Zone!', ['Een roze gloed van 6 vakjes rond jou, 1 minuut lang. Hij loopt met je mee.',
        'Eindigt iemand zijn beurt in de zone? Druk op 🌈 bij Pim of Charlie voor 1d6+4 tijdelijke HP.'], { who: 'pim' });
    },
    divineSpark() {
      const r = roll(1, 8)[0] + 4;
      APP.show({ who: 'pim', title: '⚡ Vonkje', big: r, sub: '1d8 + 4',
        lines: ['Helen: kies hieronder wie het krijgt.', `Of schade: de vijand gooit een <b>CON-save tegen DC 14</b>. Faalt: ${r} radiant, gehaald: ${Math.floor(r / 2)}.`],
        buttons: giveButtons(r) });
    },
    turnUndead() {
      APP.note('🧟 Wegwezen, zombies!', ['Elke ondode naar keuze binnen 30 ft gooit een <b>WIS-save tegen DC 14</b>.',
        'Faalt hij: 1 minuut bang en uitgeschakeld, hij rent bij je weg. Stopt als hij schade krijgt.'], { who: 'pim' });
    },
    vigilant() {
      APP.show({ who: 'pim', title: '⏰ Wakker worden!', lines: ['Wie raak je aan?'],
        buttons: [{ label: 'Mezelf', act: 'vbGive', arg: 'pim' }, { label: 'Charlie', act: 'vbGive', arg: 'charlie' }] });
    },
    eyes() { APP.note('🌌 Nachtzicht gedeeld', ['Max. 4 vrienden binnen 10 ft zien 1 uur lang in het donker (300 ft).'], { who: 'pim' }); },
    mace() {
      APP.runTest({ who: 'pim', kind: 'patk', label: '🔨 Knuppel', mod: 3, mode: C('pim').mode, bless: C('pim').blessed,
        dmg: { n: 1, s: 6, bonus: 1, type: 'bludgeoning' } });
    }
  };

  APP.swAttack = (fresh) => {
    const c = C('pim');
    if (!fresh) {
      if (c.conc !== 'spiritualWeapon') return APP.note('Geen smiley', ['Cast eerst Reuzensmiley (Spiritual Weapon).'], { who: 'pim' });
      if (c.inCombat && c.turn.bonus && !ask('Je bonusactie is deze beurt al gebruikt. Toch doen?')) return;
      if (c.inCombat) c.turn.bonus = true;
    }
    APP.runTest({ who: 'pim', kind: 'patk', label: '😁 Reuzensmiley valt aan', mod: 6, mode: c.mode, bless: c.blessed,
      dmg: { n: 1, s: 8, bonus: 4, type: 'force', after: 'Volgende beurten: knop "Smiley valt aan" (bonusactie, kost niks).' } });
  };
  APP.moonbeamHit = () => {
    const r = sum(roll(2, 10));
    APP.show(Object.assign(saveSpell('🌙 Discobal-straal', 'CON', [`Faalt: <b>${r} radiant</b>. Gehaald: <b>${Math.floor(r / 2)}</b>.`,
      'Wie zijn beurt erin eindigt of erin loopt, gooit opnieuw. Verplaatsen kost later een actie.']), { big: r, sub: '2d10' }));
  };
  APP.moonbeamMove = () => {
    const c = C('pim');
    if (c.conc !== 'moonbeam') return APP.note('Geen Discobal-straal', ['Cast eerst Moonbeam.'], { who: 'pim' });
    if (c.inCombat && c.turn.action && !ask('Je actie is deze beurt al gebruikt. Toch doen?')) return;
    if (c.inCombat) c.turn.action = true;
    APP.moonbeamHit();
  };

  APP.cast = (id, opts) => {
    opts = opts || {};
    const sp = D.spells[id], c = C('pim');
    if (c.hp === 0) return APP.note('Je ligt op 0 HP', ['Je bent bewusteloos en kan niks doen. Gooi een death save.'], { who: 'pim' });
    let lvl = null;
    if (typeof sp.level === 'number' && sp.level > 0) {
      lvl = opts.lvl || lowestSlot(c, sp.level);
      if (!lvl || c.slots[lvl] <= 0) return APP.note('Geen spell slots meer', [`Je hebt geen level ${opts.lvl || sp.level}+ slots meer. Na een long rest krijg je ze terug.`], { who: 'pim' });
      if (!opts.lvl && lvl > sp.level) opts.upNote = `Level ${sp.level} slots zijn op, dus dit kost een level ${lvl} slot.`;
      if (c.inCombat && c.turn.slot && !ask('Je hebt deze beurt al een spell slot gebruikt. 2024-regel: max 1 per beurt. Toch doen?')) return;
    }
    if (sp.level === 'cd' && c.cd <= 0) return APP.note('Geen Channel Divinity meer', ['Na een short rest krijg je er 1 terug.'], { who: 'pim' });
    if (id === 'eyes' && c.eyes <= 0) {
      lvl = lowestSlot(c, 1);
      if (!lvl) return APP.note('Nachtzicht delen is op', ['Je hebt ook geen spell slots meer.'], { who: 'pim' });
      if (!ask(`Gratis delen is op. Een level ${lvl} spell slot gebruiken?`)) return;
    }
    const key = opts.reaction ? 'reaction' : TIME_KEY[sp.time];
    const label = opts.reaction ? 'Reactie' : TIME_LABEL[sp.time];
    if (c.inCombat && key && c.turn[key] && !ask(`Je ${label.toLowerCase()} is deze beurt al gebruikt. Toch doen?`)) return;
    if (sp.conc && c.conc && !ask(`Je concentreert al op ${D.spells[c.conc].sf}. Begin je ${sp.sf}, dan stopt ${D.spells[c.conc].sf}. Doorgaan?`)) return;

    if (sp.conc && c.conc) APP.endConc(true);
    if (lvl) { c.slots[lvl]--; if (c.inCombat) c.turn.slot = true; }
    if (sp.level === 'cd') c.cd--;
    if (id === 'eyes' && !lvl) c.eyes--;
    if (c.inCombat && key) c.turn[key] = true;
    if (sp.conc) c.conc = id;
    EFFECTS[id](Object.assign({ lvl: lvl || 1 }, opts));
    if (opts.upNote && APP.st.last) APP.st.last.lines.push(opts.upNote);
  };

  /* "Wat doe ik nu?" voor Pim */
  APP.pimAdvice = () => {
    const c = C('pim'), t = c.turn, s = c.situ, steps = [];
    if (c.hp === 0) {
      steps.push({ k: '💀 Nu', title: 'Je ligt op 0 HP', why: 'Gooi aan het begin van je beurt een death save. Hopelijk helpt iemand je!', act: 'deathSave', label: '🎲 Death save' });
      return steps;
    }
    const canSlot = !t.slot;
    const has1 = c.slots[1] > 0 || c.slots[2] > 0, has2 = c.slots[2] > 0;
    const wantHeal = s.low && has1 && canSlot;
    let act, actionSlot = false;
    if (s.low && !wantHeal && c.cd > 0) {
      act = { title: '⚡ Vonkje (Divine Spark)', why: 'Iemand is bijna neer en je hebt geen slot om te helen. Dit heelt 1d8+4.', act: 'cast', arg: 'divineSpark', label: 'Doe het' };
    } else if (c.zone === 0 && c.cd > 0) {
      act = { title: '🌈 Smile Zone', why: 'Jullie krijgen elke beurt ~7 tijdelijke HP. Altijd als eerste doen!', act: 'cast', arg: 'smileZone', label: 'Doe het' };
    } else if (s.undead && c.cd > 0) {
      act = { title: '🧟 Wegwezen, zombies!', why: 'Ondoden rennen bang weg.', act: 'cast', arg: 'turnUndead', label: 'Doe het' };
    } else if (!wantHeal && s.humanoid && has2 && canSlot && c.conc !== 'holdPerson') {
      act = { title: '🧊 Freeze-frame (Hold Person)', why: c.conc ? `Let op: je ${D.spells[c.conc].sf} stopt dan. Alleen doen bij een echte baas.` : 'Verlam de baas. Charlie ernaast = elke raak kritiek!', act: 'cast', arg: 'holdPerson', label: 'Doe het' };
      actionSlot = true;
    } else if (!wantHeal && s.group && has1 && canSlot && !c.conc) {
      act = { title: '😴 Slaapliedje (Sleep)', why: 'Een groepje vijanden valt in slaap.', act: 'cast', arg: 'sleep', label: 'Doe het' };
      actionSlot = true;
    } else {
      act = { title: '🎺 Sad trombone (Toll the Dead)', why: 'Gratis aanval. Is het doelwit al gewond? Dan doet hij meer schade (d12).',
        btns: [{ label: 'Gewond doelwit', act: 'cast', arg: 'toll|injured' }, { label: 'Ongedeerd doelwit', act: 'cast', arg: 'toll' }] };
    }
    let bon;
    if (wantHeal) bon = { title: '💬 Peptalk (Healing Word)', why: 'Eerst helen! Ligt iemand op 0 HP, dan staat hij meteen weer op.', act: 'cast', arg: 'healingWord', label: 'Doe het' };
    else if (c.conc === 'spiritualWeapon') bon = { title: '😁 Reuzensmiley valt aan', why: 'Kost geen slot meer.', act: 'swAttack', label: 'Aanvallen' };
    else if (!c.conc && has2 && canSlot && !actionSlot) bon = { title: '😁 Reuzensmiley (Spiritual Weapon)', why: 'Kost 1 level 2 slot. Daarna elke beurt gratis extra schade.', act: 'cast', arg: 'spiritualWeapon', label: 'Doe het' };
    else bon = { title: 'Geen bonusactie nodig', why: c.conc ? `Je concentreert op ${D.spells[c.conc].sf}.` : 'Niks slims te doen met je bonusactie.' };

    steps.push({ k: '🏃 Beweging', title: c.zone ? 'Blijf binnen 6 vakjes van Charlie' : 'Ga binnen 6 vakjes van Charlie staan', why: 'Liefst niet naast een vijand. De Smile Zone loopt met je mee.', toggle: 'move', done: t.move });
    steps.push(Object.assign({ k: '⚡ Actie', done: t.action }, act));
    steps.push(Object.assign({ k: '✨ Bonusactie', done: t.bonus }, bon));
    steps.push({ k: '↩️ Reactie', title: 'Loopt een vijand naast je weg?', why: 'Geef hem een Sad trombone na (War Caster).', act: 'cast', arg: 'toll|reaction', label: '🎺 Reactie', done: t.reaction });
    if (c.zone) steps.push({ k: '🌈 Einde beurt', title: 'Smile Zone: tijdelijke HP', why: 'Eindigt jij of Charlie een beurt in de zone? Druk dan hier.',
      btns: [{ label: '🌈 Pim', act: 'zoneTemp', arg: 'pim' }, { label: '🌈 Charlie', act: 'zoneTemp', arg: 'charlie' }] });
    return steps;
  };
})();

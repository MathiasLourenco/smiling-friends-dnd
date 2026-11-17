/* Schermen opbouwen. */
(function () {
  'use strict';
  const D = window.SF, APP = window.APP;
  const { C, DC, sign } = APP;

  const btn = (label, act, arg, cls, extra) =>
    `<button type="button" class="btn ${cls || ''}" data-act="${act}"${arg !== undefined && arg !== null ? ` data-arg="${arg}"` : ''}${extra || ''}>${label}</button>`;
  const tog = (label, on, act, arg) =>
    `<button type="button" class="tog ${on ? 'on' : ''}" data-act="${act}"${arg !== undefined ? ` data-arg="${arg}"` : ''} aria-pressed="${on}">${label}</button>`;
  const pips = (key, val, max, label) =>
    `<span class="pips" role="group" aria-label="${label}">${Array.from({ length: max }, (_, i) =>
      `<button type="button" class="pip ${i < val ? 'on' : ''}" data-act="pip" data-arg="${key}:${i}" aria-label="${label} ${i + 1}"></button>`).join('')}</span>`;
  const lvlLabel = (l) => (l === 0 ? 'Cantrip' : l === 'cd' ? 'Channel Divinity' : l === 'free' ? 'Gratis' : 'Level ' + l);
  const LVL_CLASS = { 0: 'l0', 1: 'l1', 2: 'l2', cd: 'lcd', free: 'lfree' };

  const TABS = {
    pim: [['gevecht', '⚔️', 'Gevecht'], ['sheet', '📋', 'Sheet'], ['spells', '✨', 'Spells'], ['dice', '🎲', 'Dobbel'], ['regels', '📖', 'Regels'], ['team', '🤝', 'Team']],
    charlie: [['gevecht', '⚔️', 'Gevecht'], ['sheet', '📋', 'Sheet'], ['acties', '🪓', 'Acties'], ['dice', '🎲', 'Dobbel'], ['regels', '📖', 'Regels'], ['team', '🤝', 'Team']]
  };

  function header() {
    const st = APP.st;
    return `<header class="top">
      <div class="brand"><span class="logo">Smiling Friends</span><span class="dnd">D&amp;D</span></div>
      <nav class="who" aria-label="Kies je personage">
        ${['pim', 'charlie'].map((id) => `<button type="button" class="whobtn ${id} ${st.who === id ? 'on' : ''}" data-act="who" data-arg="${id}">
          ${DC(id).svg}<span><b>${DC(id).short}</b><small>${DC(id).player}</small></span></button>`).join('')}
      </nav></header>
      <nav class="tabs" aria-label="Onderdelen">${TABS[st.who].map((t) =>
        `<button type="button" class="tab ${st.tab[st.who] === t[0] ? 'on' : ''}" data-act="tab" data-arg="${t[0]}"><span>${t[1]}</span>${t[2]}</button>`).join('')}</nav>`;
  }

  /* ---------- Gevecht ---------- */
  function stepHtml(s) {
    let actions = '';
    if (s.btns) actions = s.btns.map((b) => btn(b.label, b.act, b.arg, 'sm')).join('');
    else if (s.act) actions = btn(s.label || 'Doe het', s.act, s.arg, 'sm');
    if (s.toggle) actions += tog(s.done ? '✔ Gedaan' : 'Gedaan?', s.done, 'turnToggle', s.toggle);
    return `<div class="step ${s.done ? 'done' : ''}"><div class="step-k">${s.k}</div>
      <div class="step-b"><b>${s.title}</b>${s.why ? `<small>${s.why}</small>` : ''}</div>
      <div class="step-a">${actions}</div></div>`;
  }
  function turnCard(id) {
    const c = C(id);
    if (!c.inCombat) {
      const tips = id === 'pim' ? [
        `☀️ Begin van de dag: <b>Ochtendpeptalk</b> (Aid). ${c.aid ? '✔ Gedaan' : btn('Doe het', 'cast', 'aid', 'sm')}`,
        `⏰ Gevecht op komst? <b>Wakker worden!</b> op Charlie of jezelf. ${btn('Doe het', 'cast', 'vigilant', 'sm')}`,
        `💬 Gesprek? Cast <b>Je kan het!</b> (+1d4) en laat Charlie helpen: dan gooi je met voordeel. ${btn('Je kan het!', 'cast', 'guidance', 'sm')}`,
        `🌌 Donker? <b>Nachtzicht delen</b> met Charlie. ${btn('Delen', 'cast', 'eyes', 'sm')}`
      ] : [
        '🤝 Praat Pim met iemand? <b>Help</b> hem: hij gooit dan met voordeel.',
        `😠 Bad cop: <b>Rage</b> + Intimidation = +6 met voordeel. ${btn('Intimidation gooien', 'skill', 'Intimidation', 'sm')}`,
        '☕ Na een gevecht: short rest = 1 Rage terug.'
      ];
      return `<div class="card turn"><h2>🧭 Wat doe ik nu?</h2>
        <p class="muted">Er is nu geen gevecht.</p>
        <ul class="tips">${tips.map((t) => `<li>${t}</li>`).join('')}</ul>
        <div class="row">${tog('⏰ Voordeel op initiatief', c.vb, 'flag', 'vb')}${btn('⚔️ Gevecht start!', 'startCombat', null, 'big')}</div></div>`;
    }
    const steps = id === 'pim' ? APP.pimAdvice() : APP.charlieAdvice();
    const chip = (k, l) => `<button type="button" class="chip ${c.turn[k] ? 'used' : ''}" data-act="turnToggle" data-arg="${k}">${l}</button>`;
    const situ = id === 'pim'
      ? [['low', '🆘 Iemand (bijna) neer'], ['humanoid', '🧍 Gevaarlijke humanoid'], ['group', '👥 Groepje vijanden'], ['undead', '🧟 Ondoden']]
      : [['paralyzed', '🧊 Doelwit verlamd'], ['boss', '🛡️ Baas met hoge AC']];
    return `<div class="card turn">
      <div class="turnhead"><h2>🧭 Wat doe ik nu?</h2><span class="round">Ronde ${c.round}</span></div>
      <div class="chips"><span class="label">Deze beurt gebruikt:</span>${chip('move', '🏃 Beweging')}${chip('action', '⚡ Actie')}${chip('bonus', '✨ Bonusactie')}${chip('reaction', '↩️ Reactie')}${id === 'pim' ? chip('slot', '🔮 Spell slot') : tog('🎯 Reckless', c.turn.reckless || c.turn.recklessUsed, 'turnToggle', 'reckless')}</div>
      <div class="situ"><span class="label">Wat is er aan de hand?</span>${situ.map((s) => tog(s[1], !!c.situ[s[0]], 'situ', s[0])).join('')}</div>
      <div class="steps">${steps.map(stepHtml).join('')}</div>
      <div class="row">${btn('▶ Mijn volgende beurt begint', 'newTurn', null, 'big')}${btn('🏁 Gevecht klaar', 'endCombat', null, 'ghost')}</div></div>`;
  }
  function badges(id) {
    const c = C(id), b = [];
    if (id === 'pim') {
      if (c.conc) b.push(`<span class="badge conc">🧠 ${D.spells[c.conc].emoji} ${D.spells[c.conc].sf} ${btn('stop', 'stopConc', null, 'mini')}</span>`);
      if (c.zone) b.push(`<span class="badge zone">🌈 Smile Zone · nog ${c.zone} rondes ${btn('🌈 Pim', 'zoneTemp', 'pim', 'mini')}${btn('🌈 Charlie', 'zoneTemp', 'charlie', 'mini')}${btn('stop', 'zoneStop', null, 'mini')}</span>`);
      if (c.conc === 'spiritualWeapon') b.push(`<span class="badge">😁 ${btn('Smiley valt aan', 'swAttack', null, 'mini')}</span>`);
    } else {
      if (c.raging) b.push(`<span class="badge rage">😤 RAGE ${btn('stop', 'stopRage', null, 'mini')}</span>`);
      if (c.turn.recklessUsed) b.push('<span class="badge warn">🎯 Reckless: vijanden hebben voordeel</span>');
      if (c.situ.paralyzed) b.push('<span class="badge zone">🧊 Doelwit verlamd: raak = kritiek</span>');
    }
    if (c.blessed) b.push('<span class="badge">⭐ Bless +1d4</span>');
    if (c.aid) b.push('<span class="badge">☀️ Aid +5</span>');
    return b.length ? `<div class="badges">${b.join('')}</div>` : '';
  }
  function statusCard(id) {
    const c = C(id), d = DC(id), m = APP.maxHp(id);
    const pct = Math.max(0, Math.round((c.hp / m) * 100));
    const low = c.hp === 0 ? 'zero' : pct <= 33 ? 'low' : pct <= 66 ? 'mid' : '';
    const death = c.hp === 0 ? `<div class="deathbox"><b>💀 Death saves</b>
        <span>Gelukt: ${'●'.repeat(c.death.s)}${'○'.repeat(Math.max(0, 3 - c.death.s))}</span>
        <span>Mislukt: ${'●'.repeat(Math.min(3, c.death.f))}${'○'.repeat(Math.max(0, 3 - c.death.f))}</span>
        ${btn('🎲 Death save', 'deathSave', null, 'sm')}</div>` : '';
    return `<div class="card status">
      <div class="hprow"><div class="hpnum ${low}"><span class="big">${c.hp}</span><span class="of">/ ${m} HP</span>
        ${c.temp ? `<span class="temp">+${c.temp} tijdelijk</span>` : ''}</div>
        <div class="acbox"><small>AC</small><b>${d.ac}</b></div></div>
      <div class="hpbar ${low}"><i style="width:${pct}%"></i></div>
      <div class="amt">${btn('−5', 'amt', -5, 'sq')}${btn('−1', 'amt', -1, 'sq')}
        <input id="amt" type="number" inputmode="numeric" min="0" placeholder="0" value="${APP.st.amt}" aria-label="Aantal">
        ${btn('+1', 'amt', 1, 'sq')}${btn('+5', 'amt', 5, 'sq')}</div>
      <div class="row3">${btn('💥 Schade', 'dmg', null, 'bad')}${btn('💚 Heal', 'heal', null, 'ok')}${btn('🛡️ Tijdelijk', 'temp')}</div>
      ${id === 'charlie' ? `<div class="row">${tog('⚔️ Wapenschade (halveert in Rage)', c.phys, 'flag', 'phys')}</div>` : ''}
      ${id === 'pim' && c.conc ? '<p class="hint">🧠 Word je geraakt? Druk op 💥 Schade: de app gooit meteen je concentratie-save.</p>' : ''}
      ${death}${badges(id)}</div>`;
  }
  function resCard(id) {
    const c = C(id), rows = [];
    const row = (label, html) => rows.push(`<div class="resrow"><span>${label}</span><div>${html}</div></div>`);
    if (id === 'pim') {
      row('🔮 Spell slots level 1', pips('s1', c.slots[1], 4, 'Level 1 slot'));
      row('🔮 Spell slots level 2', pips('s2', c.slots[2], 3, 'Level 2 slot'));
      row('🌈 Channel Divinity', pips('cd', c.cd, 2, 'Channel Divinity'));
      row('🍀 Lucky', pips('lucky', c.lucky, 2, 'Lucky') + btn('nadeel op aanval tegen mij', 'luckyDis', null, 'mini'));
      row('🌌 Nachtzicht delen', pips('eyes', c.eyes, 1, 'Nachtzicht'));
    } else {
      row('😤 Rage', pips('rage', c.rage, 3, 'Rage') + tog(c.raging ? '😤 In Rage' : 'Niet in Rage', c.raging, 'rageToggle'));
    }
    row('🌟 Heroic Inspiration', tog(c.heroic ? 'Beschikbaar' : 'Gebruikt', c.heroic, 'flag', 'heroic'));
    row(`🎲 Hit Dice (d${DC(id).hitDie})`, pips('hd', c.hitDice, 4, 'Hit Die'));
    const flags = [tog('☀️ Aid', c.aid, 'aid'), tog('⭐ Bless', c.blessed, 'flag', 'blessed')];
    if (id === 'pim') flags.push(tog('👍 Je kan het!', c.guidance, 'flag', 'guidance'));
    return `<div class="card res"><h3>Middelen <small>tik op een bolletje om het te gebruiken</small></h3>${rows.join('')}
      <div class="row wrap">${flags.join('')}</div></div>`;
  }
  function restCard(id) {
    return `<div class="card rest"><h3>Rusten</h3><p class="muted">${DC(id).restNote}</p>
      <div class="row3">${btn('☕ Short rest', 'shortRest')}${btn('🎲 Hit Die', 'hitDie')}${btn('🛌 Long rest', 'longRest')}</div></div>`;
  }
  function viewGevecht(id) {
    return `<div class="grid"><section class="col">${turnCard(id)}</section>
      <section class="col">${statusCard(id)}${resCard(id)}${restCard(id)}</section></div>`;
  }

  /* ---------- Sheet ---------- */
  function viewSheet(id) {
    const d = DC(id), c = C(id);
    const abil = Object.keys(D.ABIL).map((ab) => {
      const m = APP.abMod(id, ab), sv = APP.saveMod(id, ab), p = d.saveProf.includes(ab);
      return `<button type="button" class="abox" data-act="save" data-arg="${ab}"><span class="ab">${ab}</span><b>${sign(m)}</b>
        <small>${d.abilities[ab]} · ${D.ABIL[ab]}</small><em>${p ? '● ' : ''}save ${sign(sv)}</em></button>`;
    }).join('');
    const skills = D.SKILLS.map((s) => {
      const p = d.skillProf.includes(s[0]), m = APP.skillMod(id, s[0]);
      let extra = d.skillNote[s[0]] || '';
      if (id === 'charlie' && d.rageStrSkills.includes(s[0])) extra = `Rage: ${sign(4 + (p ? 2 : 0))}`;
      return `<button type="button" class="skill ${p ? 'prof' : ''}" data-act="skill" data-arg="${s[0]}">
        <span class="dot">${p ? '●' : '○'}</span><span class="nm"><b>${s[0]}</b><small>${s[2]} · ${s[1]}${extra ? ' · ' + extra : ''}</small></span><span class="md">${sign(m)}</span></button>`;
    }).join('');
    const mode = [[0, 'Normaal'], [1, 'Voordeel'], [-1, 'Nadeel']].map((m) => tog(m[1], c.mode === m[0], 'mode', m[0])).join('');
    const spellList = id === 'pim' ? `<h3>Spells</h3><div class="spellmini">${D.spellGroups.map((g) =>
      `<div><b>${g[0]}</b><ul>${g[1].map((sid) => `<li>${D.spells[sid].emoji} ${D.spells[sid].sf} <small>(${D.spells[sid].name})</small></li>`).join('')}</ul></div>`).join('')}</div>` : '';
    return `<div class="card sheet">
      <div class="sheethead">${d.svg}<div class="sh-t"><h2>${d.name}</h2><div class="line">${d.line} · Level ${d.level}</div>
        <div class="muted">${d.player} · ${d.flavor}</div></div>${btn('🖨️ Print', 'print', null, 'noprint')}</div>
      <div class="statgrid"><div class="stat"><small>Max HP</small><b>${d.maxHp}</b><em>Hit Dice ${d.level}d${d.hitDie}</em></div>
        ${d.stats.map((s) => `<div class="stat"><small>${s[0]}</small><b>${s[1]}</b><em>${s[2]}</em></div>`).join('')}</div>
      <div class="rollmode noprint"><span class="label">Gooien met:</span>${mode}${id === 'pim' ? tog('👍 + Je kan het! (1d4)', c.guidance, 'flag', 'guidance') : ''}</div>
      <h3>Eigenschappen <small class="noprint">tik om een save te gooien · ● = proficient</small></h3><div class="abil">${abil}</div>
      <h3>Skills <small class="noprint">tik om te gooien</small></h3><div class="skills">${skills}</div>
      <h3>Wat kan ik?</h3><div class="feats">${d.features.map((f) => `<div class="feat"><b>${f[0]}</b><p>${f[1]}</p></div>`).join('')}</div>
      ${spellList}
      <div class="two"><div><h3>Spullen</h3><ul>${d.gear.map((g) => `<li>${g}</li>`).join('')}</ul></div>
        <div><h3>Proficiencies</h3><p>${d.profs}</p></div></div></div>`;
  }

  /* ---------- Spells / Acties ---------- */
  function spellButtons(id) {
    const c = C('pim'), sp = D.spells[id];
    if (id === 'toll') return btn('🎺 Gewond doelwit (d12)', 'cast', 'toll|injured') + btn('Ongedeerd (d8)', 'cast', 'toll', 'ghost');
    if (id === 'spiritualWeapon' && c.conc === id) return btn('😁 Smiley valt aan (bonusactie)', 'swAttack');
    if (id === 'moonbeam' && c.conc === id) return btn('🌙 Verplaats + raak (actie)', 'moonbeamMove');
    let out = btn(sp.level === 'free' && id === 'mace' ? 'Aanvallen' : 'Gebruik', 'cast', id);
    if (sp.level === 1 && sp.upcast) out += btn('⬆️ Met slot 2', 'cast', id + '|lvl2', 'ghost');
    return out;
  }
  function spellCard(id) {
    const sp = D.spells[id], c = C('pim');
    const active = c.conc === id || (id === 'smileZone' && c.zone > 0);
    return `<article class="card spell ${LVL_CLASS[sp.level]} ${active ? 'active' : ''}">
      <div class="sp-top"><span class="emoji">${sp.emoji}</span><div class="sp-n"><b>${sp.sf}</b><small>${sp.name}</small></div><span class="lvl">${lvlLabel(sp.level)}</span></div>
      <div class="badges"><span class="badge t-${sp.time}">${APP.TIME_LABEL[sp.time]}</span><span class="badge">📏 ${sp.range}</span><span class="badge">⏳ ${sp.dur}</span>
        ${sp.conc ? '<span class="badge conc">🧠 Concentratie</span>' : ''}${sp.domain ? '<span class="badge">Altijd klaar</span>' : ''}${active ? '<span class="badge zone">Actief!</span>' : ''}</div>
      <p>${sp.wat}</p><p class="when">👉 ${sp.wanneer}</p>${sp.upcast ? `<p class="up">⬆️ ${sp.upcast}</p>` : ''}
      <div class="row wrap">${spellButtons(id)}</div></article>`;
  }
  function viewSpells() {
    const c = C('pim');
    return `<div class="card slim"><div class="resline">
        <span>🔮 Level 1: <b>${c.slots[1]}</b>/4</span><span>🔮 Level 2: <b>${c.slots[2]}</b>/3</span><span>🌈 Channel Divinity: <b>${c.cd}</b>/2</span>
        <span>🧠 ${c.conc ? D.spells[c.conc].sf : 'Geen concentratie'}</span><span>DC <b>14</b> · aanval <b>+6</b></span></div></div>
      ${D.spellGroups.map((g) => `<h2 class="grouph">${g[0]}</h2><div class="cards">${g[1].map(spellCard).join('')}</div>`).join('')}`;
  }
  const ACT_MAP = {
    rage: ['rage'], 'atk-greataxe': ['atk', 'greataxe'], 'atk-greatsword': ['atk', 'greatsword'], 'atk-handaxe': ['atk', 'handaxe'],
    shove: ['shove'], help: ['helpTalk'], intimidate: ['skill', 'Intimidation']
  };
  function viewActies() {
    const c = C('charlie');
    return `<div class="card slim"><div class="resline"><span>😤 Rage: <b>${c.rage}</b>/3</span><span>${c.raging ? '😤 IN RAGE' : 'Niet in Rage'}</span>
        <span>Aanval <b>+6</b></span><span>Save DC <b>14</b></span>${tog('🎯 Reckless', c.turn.reckless || c.turn.recklessUsed, 'turnToggle', 'reckless')}</div></div>
      <div class="cards">${D.charlieActions.map((a) => {
        const m = ACT_MAP[a.id];
        return `<article class="card spell lcd"><div class="sp-top"><span class="emoji">${a.emoji}</span><div class="sp-n"><b>${a.sf}</b><small>${a.sub}</small></div></div>
          <div class="badges"><span class="badge t-${a.time}">${APP.TIME_LABEL[a.time]}</span></div>
          <p>${a.wat}</p><p class="when">👉 ${a.wanneer}</p><div class="row">${btn('Doe het', m[0], m[1])}</div></article>`;
      }).join('')}</div>`;
  }

  /* ---------- Dobbelstenen, regels, team ---------- */
  function viewDice() {
    const t = APP.st.tray;
    const modes = [[0, 'Normaal'], [1, 'Voordeel'], [-1, 'Nadeel']].map((m) => tog(m[1], t.mode === m[0], 'trayMode', m[0])).join('');
    return `<div class="grid"><section class="col"><div class="card dice"><h2>🎲 Dobbelstenen</h2>
        <div class="dierow">${[4, 6, 8, 10, 12, 20, 100].map((s) => `<button type="button" class="die ${t.s === s ? 'on' : ''}" data-act="die" data-arg="${s}">d${s}</button>`).join('')}</div>
        <div class="steppers"><div><span class="label">Aantal</span>${btn('−', 'trayN', -1, 'sq')}<b>${t.n}</b>${btn('+', 'trayN', 1, 'sq')}</div>
          <div><span class="label">Bonus</span>${btn('−', 'trayMod', -1, 'sq')}<b>${sign(t.mod)}</b>${btn('+', 'trayMod', 1, 'sq')}</div></div>
        ${t.s === 20 && t.n === 1 ? `<div class="row wrap">${modes}</div>` : ''}
        ${btn(`Gooi ${t.n}d${t.s}${t.mod ? ' ' + sign(t.mod) : ''}`, 'rollTray', null, 'big')}</div></section>
      <section class="col"><div class="card log"><h3>Laatste worpen</h3>${APP.st.log.length ? `<ol>${APP.st.log.map((l) =>
        `<li class="who-${l.who}"><b>${l.big}</b><span>${l.title}<small>${l.sub}</small></span></li>`).join('')}</ol>` : '<p class="muted">Nog niks gegooid.</p>'}
        ${btn('🧹 Wissen', 'clearLog', null, 'ghost sm')}</div></section></div>`;
  }
  function viewRegels() {
    return `<div class="cards rules">${D.rules.map((r) => `<article class="card"><h3>${r[0]} ${r[1]}</h3><ul>${r[2].map((i) => `<li>${i}</li>`).join('')}</ul></article>`).join('')}</div>`;
  }
  function viewTeam() {
    const T = D.team;
    return `<h2 class="grouph">Combo's</h2><div class="cards">${T.combos.map((x) => `<article class="card combo"><div class="emoji">${x[0]}</div><b>${x[1]}</b><p>${x[2]}</p></article>`).join('')}</div>
      <div class="grid"><section class="col"><div class="card rp pimc">${DC('pim').svg}<h3>Pim spelen</h3><ul>${T.pim.map((x) => `<li>${x}</li>`).join('')}</ul></div></section>
        <section class="col"><div class="card rp charliec">${DC('charlie').svg}<h3>Charlie spelen</h3><ul>${T.charlie.map((x) => `<li>${x}</li>`).join('')}</ul></div></section></div>
      <div class="card"><h3>Smiling Friends-namen</h3><table class="names"><thead><tr><th>In de boeken</th><th>Bij jullie</th></tr></thead>
        <tbody>${T.names.map((n) => `<tr><td>${n[0]}</td><td><b>${n[1]}</b></td></tr>`).join('')}</tbody></table></div>
      <div class="row">${btn('♻️ Alles resetten', 'resetAll', null, 'ghost sm')}</div>`;
  }

  function resultPanel() {
    const st = APP.st, r = st.last;
    if (!r) return '';
    const nat = r.nat === 20 ? 'nat20' : r.nat === 1 ? 'nat1' : '';
    if (!st.resultOpen) {
      return `<button type="button" class="resmini who-${r.who}" data-act="openResult"><b>${r.big === undefined ? '' : r.big}</b> ${r.title} ▴</button>`;
    }
    return `<div class="result who-${r.who}" role="status" aria-live="polite">
      <button type="button" class="close" data-act="closeResult" aria-label="Sluiten">✕</button>
      <div class="r-main">${r.big !== undefined ? `<div class="r-big ${nat}">${r.big}</div>` : ''}
        <div class="r-txt"><b>${r.title}</b>${r.sub ? `<small>${r.sub}</small>` : ''}</div></div>
      ${r.lines.length ? `<ul>${r.lines.map((l) => `<li>${l}</li>`).join('')}</ul>` : ''}
      ${r.buttons.length ? `<div class="row wrap">${r.buttons.map((b) => btn(b.label, b.act, b.arg, b.cls, ` data-who="${r.who}"`)).join('')}</div>` : ''}</div>`;
  }

  APP.render = () => {
    const st = APP.st, id = st.who, tab = st.tab[id];
    document.body.className = 'theme-' + id;
    const views = { gevecht: viewGevecht, sheet: viewSheet, spells: viewSpells, acties: viewActies, dice: viewDice, regels: viewRegels, team: viewTeam };
    document.getElementById('app').innerHTML = header() + `<main>${(views[tab] || viewGevecht)(id)}</main>`;
    document.getElementById('result').innerHTML = resultPanel();
    APP.save();
  };
})();

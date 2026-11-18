/* Screens. */
(function () {
  'use strict';
  const D = window.SF, P = D.pim, APP = window.APP;
  const { S, sign } = APP;

  const btn = (label, act, arg, cls, extra) =>
    `<button type="button" class="btn ${cls || ''}" data-act="${act}"${arg !== undefined && arg !== null ? ` data-arg="${arg}"` : ''}${extra || ''}>${label}</button>`;
  const tog = (label, on, act, arg) =>
    `<button type="button" class="tog ${on ? 'on' : ''}" data-act="${act}"${arg !== undefined ? ` data-arg="${arg}"` : ''} aria-pressed="${on}">${label}</button>`;
  const pips = (key, val, max, label) =>
    `<span class="pips" role="group" aria-label="${label}">${Array.from({ length: max }, (_, i) =>
      `<button type="button" class="pip ${i < val ? 'on' : ''}" data-act="pip" data-arg="${key}:${i}" aria-label="${label} ${i + 1}"></button>`).join('')}</span>`;
  const modeToggles = () => [[0, 'Normal'], [1, 'Advantage'], [-1, 'Disadvantage']].map((m) => tog(m[1], S().mode === m[0], 'mode', m[0])).join('');

  const TABS = [['fight', '⚔️', 'Fight'], ['talk', '💬', 'Talk'], ['spells', '✨', 'Spells'], ['sheet', '📋', 'Sheet'], ['rules', '📖', 'Rules']];

  function header() {
    return `<header class="top">
      <div class="brand"><span class="logo">Smiling Friends</span><span class="dnd">D&amp;D</span></div>
      <div class="whobtn pim on">${P.svg}<span><b>${P.short}</b><small>Bard 5</small></span></div></header>
      <nav class="tabs" aria-label="Sections">${TABS.map((t) =>
        `<button type="button" class="tab ${APP.st.tab === t[0] ? 'on' : ''}" data-act="tab" data-arg="${t[0]}"><span>${t[1]}</span>${t[2]}</button>`).join('')}</nav>`;
  }

  /* ---------- Fight ---------- */
  function stepHtml(s, i) {
    const actions = s.act ? btn(s.label || 'Do it', s.act, s.arg) : '';
    return `<div class="step ${s.done ? 'done' : ''}"><div class="num">${s.done ? '✔' : i + 1}</div>
      <div class="step-b"><span class="kind">${s.kind}</span><b>${s.title}</b>${s.why ? `<small>${s.why}</small>` : ''}</div>
      <div class="step-a">${actions}</div></div>`;
  }
  function turnCard() {
    const c = S();
    if (!c.inCombat) {
      const prep = [];
      if (!c.aid && APP.lowestSlot(2)) prep.push({ kind: 'Start of the day', title: '☀️ Aid', why: '+5 HP for you and Charlie, for 8 hours.', act: 'cast', arg: 'aid' });
      if (!c.charlieBI && c.bi > 0) prep.push({ kind: 'Before a fight', title: '🎵 Bardic Inspiration', why: 'Give Charlie a 1d8 to save a bad roll.', act: 'cast', arg: 'inspiration' });
      return `<div class="card turn"><h2>No fight right now</h2>
        ${prep.length ? `<div class="steps">${prep.map(stepHtml).join('')}</div>` : '<p class="muted">All set.</p>'}
        <div class="row">${btn('⚔️ The fight starts', 'startCombat', null, 'big')}</div></div>`;
    }
    const adv = APP.advice();
    const situ = [['down', '🆘 Charlie is down'], ['many', '👥 Lots of enemies'], ['boss', '💪 One tough enemy']];
    return `<div class="card turn">
      <div class="turnhead"><h2>Your turn</h2><span class="round">Round ${c.round}</span></div>
      <div class="situ"><span class="label">What's happening?</span>${situ.map((s) => tog(s[1], !!c.situ[s[0]], 'situ', s[0])).join('')}</div>
      <div class="steps">${adv.steps.map(stepHtml).join('')}</div>
      ${adv.tip ? `<p class="tipline">💡 ${adv.tip}</p>` : ''}
      <div class="row">${btn('▶ My next turn', 'newTurn', null, 'big')}${btn('Fight over', 'endCombat', null, 'ghost')}</div></div>`;
  }
  function hpCard() {
    const c = S(), m = APP.maxHp();
    const pct = Math.max(0, Math.round((c.hp / m) * 100));
    const low = c.hp === 0 ? 'zero' : pct <= 33 ? 'low' : pct <= 66 ? 'mid' : '';
    const death = c.hp === 0 ? `<div class="deathbox"><b>Death saves</b>
        <span>✔ ${c.death.s}/3</span><span>✘ ${Math.min(3, c.death.f)}/3</span>${btn('Roll', 'deathSave', null, 'sm')}</div>` : '';
    return `<div class="card status">
      <div class="hprow"><div class="hpnum ${low}"><span class="big">${c.hp}</span><span class="of">/ ${m} HP</span>
        ${c.temp ? `<span class="temp">+${c.temp} temp</span>` : ''}</div>
        <div class="acbox"><small>AC</small><b>${P.ac}</b></div></div>
      <div class="hpbar ${low}"><i style="width:${pct}%"></i></div>
      <div class="amt">${btn('−5', 'amt', -5, 'sq')}${btn('−1', 'amt', -1, 'sq')}
        <input id="amt" type="number" inputmode="numeric" min="0" placeholder="0" value="${APP.st.amt}" aria-label="Amount">
        ${btn('+1', 'amt', 1, 'sq')}${btn('+5', 'amt', 5, 'sq')}</div>
      <div class="row3">${btn('Damage', 'dmg', null, 'bad')}${btn('Heal', 'heal', null, 'ok')}${btn('Temp HP', 'temp')}</div>
      <div class="row">${tog('☣️ Acid or poison? (you take half)', c.acid, 'flag', 'acid')}</div>
      ${death}</div>`;
  }
  function stuffCard() {
    const c = S(), more = APP.st.more;
    const row = (label, html) => `<div class="resrow"><span>${label}</span><div>${html}</div></div>`;
    let html = row('Spell slots level 1', pips('s1', c.slots[1], 4, 'Level 1 slot')) +
      row('Spell slots level 2', pips('s2', c.slots[2], 3, 'Level 2 slot')) +
      row('Spell slots level 3', pips('s3', c.slots[3], 2, 'Level 3 slot')) +
      row('Bardic Inspiration', pips('bi', c.bi, P.biMax, 'Bardic Inspiration') + (c.bi < P.biMax ? btn('+1', 'font', null, 'mini', ' title="Spend a spell slot"') : ''));
    if (c.charlieBI) html += `<div class="badges"><span class="badge zone">🎵 Charlie has your inspiration ${btn('he used it', 'flag', 'charlieBI', 'mini')}</span></div>`;
    if (c.conc) html += `<div class="badges"><span class="badge conc">🧠 Concentrating: ${D.spells[c.conc].name} ${btn('stop', 'stopConc', null, 'mini')}</span></div>`;
    if (more) html += row(`Hit Dice (d${P.hitDie})`, pips('hd', c.hitDice, P.level, 'Hit Die')) + `<div class="row">${tog('☀️ Aid (+5 HP)', c.aid, 'aid')}</div>`;
    return `<div class="card res">${html}
      <div class="row3">${btn(more ? 'Less ▴' : 'More ▾', 'more', null, 'ghost sm')}${btn('☕ Short rest', 'shortRest', null, 'sm')}${btn('🛌 Long rest', 'longRest', null, 'sm')}</div></div>`;
  }
  const viewFight = () => `<div class="grid"><section class="col">${turnCard()}</section><section class="col">${hpCard()}${stuffCard()}</section></div>`;

  /* ---------- Spell rows ---------- */
  const TIME_SHORT = { action: 'Action', bonus: 'Bonus', none: 'Free' };
  function spRow(id) {
    const sp = D.spells[id], c = S();
    const lvl = sp.level === 0 ? 'Free' : sp.level === 'bi' ? 'Inspiration' : 'Level ' + sp.level;
    const empty = sp.level === 'bi' ? c.bi === 0 : sp.level > 0 && !APP.lowestSlot(sp.level);
    return `<div class="sprow ${c.conc === id ? 'active' : ''} ${empty ? 'empty' : ''}"><span class="emoji">${sp.emoji}</span>
      <div class="sp-main"><div class="sp-name"><b>${sp.name}</b><span class="pill t-${sp.time}">${TIME_SHORT[sp.time]}</span>
        <span class="pill lv">${lvl}</span>${sp.conc ? '<span class="pill conc">Conc.</span>' : ''}<span class="rng">${sp.range}</span></div>
        <small>${sp.wat}</small></div>
      <div class="sp-btns">${btn(sp.level === 'bi' ? 'Use' : 'Cast', 'cast', id, 'xs')}</div></div>`;
  }
  const group = (g) => `<section class="card spgroup"><h3>${g[0]}</h3>${g[1].map(spRow).join('')}</section>`;
  function summary() {
    const c = S();
    return `<div class="card slim"><div class="resline"><span>Slots: L1 <b>${c.slots[1]}</b>/4 · L2 <b>${c.slots[2]}</b>/3 · L3 <b>${c.slots[3]}</b>/2</span>
      <span>🎵 <b>${c.bi}</b>/4</span><span>Spell DC <b>15</b> · attack <b>+7</b></span></div></div>`;
  }
  const viewSpells = () => `${summary()}<div class="grid"><div class="col">${D.spellGroups.slice(0, 3).map(group).join('')}</div>
    <div class="col">${D.spellGroups.slice(3).map(group).join('')}</div></div>`;

  /* ---------- Talk ---------- */
  function viewTalk() {
    const tiles = D.talkSkills.map((t) => {
      const st = P.silverTongue.includes(t[0]);
      return `<button type="button" class="talk" data-act="skill" data-arg="${t[0]}"><span class="emoji">${t[1]}</span>
        <b>${t[0]}</b><small>${t[2]}</small><span class="md">${sign(APP.skillMod(t[0]))}</span>${st ? '<span class="pill conc">Never below 20</span>' : ''}</button>`;
    }).join('');
    return `<div class="card"><div class="turnhead"><h2>Talk</h2><div class="row wrap tight">${modeToggles()}</div></div>
        <p class="muted">Say what Pim says. When the DM asks for a roll, tap it here.</p>
        <div class="talkgrid">${tiles}</div></div>
      <section class="card spgroup"><h3>Talk magic</h3><p class="tipline">💡 Use Unsettling Words right before a spell.</p>
        ${['unsettling', 'charm', 'suggestion', 'calm', 'tongues'].map(spRow).join('')}</section>`;
  }

  /* ---------- Sheet ---------- */
  function viewSheet() {
    const open = APP.st.feat;
    const abil = Object.keys(D.ABIL).map((ab) => `<button type="button" class="abox" data-act="save" data-arg="${ab}"><span class="ab">${ab}</span>
      <b>${sign(APP.abMod(ab))}</b><small>${P.abilities[ab]}</small><em>${P.saveProf.includes(ab) ? '● ' : ''}save ${sign(APP.saveMod(ab))}</em></button>`).join('');
    const skills = D.SKILLS.map((s) => {
      const p = P.skillProf.includes(s[0]), e = P.expertise.includes(s[0]);
      return `<button type="button" class="skill ${p ? 'prof' : ''}" data-act="skill" data-arg="${s[0]}">
        <span class="nm"><b>${s[0]}</b><small>${s[1]}${e ? ' · Expertise' : ''}</small></span><span class="md">${sign(APP.skillMod(s[0]))}</span></button>`;
    }).join('');
    return `<div class="card sheet">
      <div class="sheethead">${P.svg}<div class="sh-t"><h2>${P.name}</h2><div class="line">${P.line}</div></div>${btn('🖨️ Print', 'print', null, 'noprint sm')}</div>
      <div class="statgrid"><div class="stat"><small>Max HP</small><b>${P.maxHp}</b></div>
        ${P.stats.map((s) => `<div class="stat"><small>${s[0]}</small><b>${s[1]}</b></div>`).join('')}</div>
      <div class="rollmode noprint"><span class="label">Tap to roll:</span>${modeToggles()}</div>
      <div class="abil">${abil}</div>
      <div class="skills">${skills}</div>
      <div class="noprint">${btn(open ? 'Hide features ▴' : 'Features & gear ▾', 'feat', null, 'ghost sm')}</div>
      <div class="fold ${open ? 'open' : ''}">
        <div class="feats">${P.features.map((f) => `<div class="feat"><b>${f[0]}</b><p>${f[1]}</p></div>`).join('')}</div>
        <p><b>Gear:</b> ${P.gear.join(', ')}</p><p class="muted">${P.profs}</p>
        <div class="printonly"><h3>Spells</h3><p>${D.spellGroups.map((g) => `<b>${g[0]}:</b> ${g[1].map((id) => D.spells[id].name).join(', ')}`).join('<br>')}</p></div></div></div>`;
  }

  /* ---------- Rules ---------- */
  const viewRules = () => `<div class="cards rules">${D.rules.map((r) => `<article class="card"><h3>${r[0]} ${r[1]}</h3><ul>${r[2].map((i) => `<li>${i}</li>`).join('')}</ul></article>`).join('')}</div>
    <div class="row">${btn('Reset everything', 'resetAll', null, 'ghost sm')}</div>`;

  function resultPanel() {
    const st = APP.st, r = st.last;
    if (!r) return '';
    const nat = r.nat === 20 ? 'nat20' : r.nat === 1 ? 'nat1' : '';
    if (!st.resultOpen) return `<button type="button" class="resmini who-pim" data-act="openResult"><b>${r.big === undefined ? '' : r.big}</b> ${r.title} ▴</button>`;
    return `<div class="result who-pim" role="status" aria-live="polite">
      <button type="button" class="close" data-act="closeResult" aria-label="Close">✕</button>
      <div class="r-main">${r.big !== undefined ? `<div class="r-big ${nat}">${r.big}</div>` : ''}
        <div class="r-txt"><b>${r.title}</b>${r.sub ? `<small>${r.sub}</small>` : ''}</div></div>
      ${r.lines.length ? `<ul>${r.lines.map((l) => `<li>${l}</li>`).join('')}</ul>` : ''}
      ${r.buttons.length ? `<div class="row wrap">${r.buttons.map((b) => btn(b.label, b.act, b.arg, b.cls)).join('')}</div>` : ''}</div>`;
  }

  APP.render = () => {
    const views = { fight: viewFight, talk: viewTalk, spells: viewSpells, sheet: viewSheet, rules: viewRules };
    if (!views[APP.st.tab]) APP.st.tab = 'fight';
    document.body.className = 'theme-pim';
    document.getElementById('app').innerHTML = header() + `<main>${views[APP.st.tab]()}</main>`;
    document.getElementById('result').innerHTML = resultPanel();
    APP.save();
  };
})();

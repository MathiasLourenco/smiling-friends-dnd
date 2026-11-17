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
  const lvlLabel = (l) => (l === 0 ? 'Cantrip' : l === 'cd' ? 'Channel Divinity' : l === 'free' ? 'Feature' : 'Level ' + l);
  const LVL_CLASS = { 0: 'l0', 1: 'l1', 2: 'l2', cd: 'lcd', free: 'lfree' };

  const TABS = {
    pim: [['gevecht', '⚔️', 'Combat'], ['spells', '✨', 'Spells'], ['sheet', '📋', 'Sheet'], ['dice', '🎲', 'Dice'], ['regels', '📖', 'Rules']],
    charlie: [['gevecht', '⚔️', 'Combat'], ['acties', '🪓', 'Actions'], ['sheet', '📋', 'Sheet'], ['dice', '🎲', 'Dice'], ['regels', '📖', 'Rules']]
  };

  function header() {
    const st = APP.st;
    return `<header class="top">
      <div class="brand"><span class="logo">Smiling Friends</span><span class="dnd">D&amp;D</span></div>
      <nav class="who" aria-label="Choose character">
        ${['pim', 'charlie'].map((id) => `<button type="button" class="whobtn ${id} ${st.who === id ? 'on' : ''}" data-act="who" data-arg="${id}">
          ${DC(id).svg}<span><b>${DC(id).short}</b></span></button>`).join('')}
      </nav></header>
      <nav class="tabs" aria-label="Sections">${TABS[st.who].map((t) =>
        `<button type="button" class="tab ${st.tab[st.who] === t[0] ? 'on' : ''}" data-act="tab" data-arg="${t[0]}"><span>${t[1]}</span>${t[2]}</button>`).join('')}</nav>`;
  }

  /* ---------- Gevecht ---------- */
  function stepHtml(s) {
    let actions = '';
    if (s.btns) actions = s.btns.map((b) => btn(b.label, b.act, b.arg, 'sm')).join('');
    else if (s.act) actions = btn(s.label || 'Do it', s.act, s.arg, 'sm');
    if (s.extra) actions += s.extra;
    return `<div class="step ${s.done ? 'done' : ''}"><div class="step-k">${s.k}</div>
      <div class="step-b"><b>${s.title}</b>${s.why ? `<small>${s.why}</small>` : ''}</div>
      <div class="step-a">${actions}</div></div>`;
  }
  function turnCard(id) {
    const c = C(id);
    if (!c.inCombat) {
      const aid = id === 'pim' && !c.aid ? `<p class="tipline">☀️ Start of the day: Aid ${btn('Cast Aid', 'cast', 'aid', 'sm')}</p>` : '';
      return `<div class="card turn"><h2>No combat</h2>${aid}
        <div class="row">${tog('⏰ Advantage on initiative', c.vb, 'flag', 'vb')}${btn('⚔️ Start combat', 'startCombat', null, 'big')}</div></div>`;
    }
    const adv = id === 'pim' ? APP.pimAdvice() : APP.charlieAdvice();
    const situ = id === 'pim'
      ? [['low', 'Ally (nearly) down'], ['humanoid', 'Humanoid boss'], ['undead', 'Undead']]
      : [['paralyzed', 'Target paralyzed'], ['boss', 'High AC']];
    return `<div class="card turn">
      <div class="turnhead"><h2>Your turn</h2><span class="round">Round ${c.round}</span></div>
      <div class="situ">${situ.map((s) => tog(s[1], !!c.situ[s[0]], 'situ', s[0])).join('')}</div>
      <div class="steps">${adv.steps.map(stepHtml).join('')}</div>
      ${adv.tip ? `<p class="tipline">${adv.tip}</p>` : ''}
      <div class="row">${btn('▶ Next turn', 'newTurn', null, 'big')}${btn('End combat', 'endCombat', null, 'ghost')}</div></div>`;
  }
  function badges(id) {
    const c = C(id), b = [];
    if (id === 'pim') {
      if (c.conc) b.push(`<span class="badge conc">Concentrating: ${D.spells[c.conc].name} ${btn('stop', 'stopConc', null, 'mini')}</span>`);
      if (c.zone) b.push(`<span class="badge zone">🌅 Twilight Sanctuary (${c.zone}) ${btn('Pim', 'zoneTemp', 'pim', 'mini')}${btn('Charlie', 'zoneTemp', 'charlie', 'mini')}</span>`);
    } else {
      if (c.raging) b.push(`<span class="badge rage">😤 Raging ${btn('stop', 'stopRage', null, 'mini')}</span>`);
      if (c.situ.paralyzed) b.push('<span class="badge zone">Target paralyzed</span>');
    }
    if (c.blessed) b.push('<span class="badge">Bless</span>');
    if (c.aid) b.push('<span class="badge">Aid +5</span>');
    return b.length ? `<div class="badges">${b.join('')}</div>` : '';
  }
  function statusCard(id) {
    const c = C(id), d = DC(id), m = APP.maxHp(id);
    const pct = Math.max(0, Math.round((c.hp / m) * 100));
    const low = c.hp === 0 ? 'zero' : pct <= 33 ? 'low' : pct <= 66 ? 'mid' : '';
    const death = c.hp === 0 ? `<div class="deathbox"><b>Death saves</b>
        <span>✔ ${c.death.s}/3</span><span>✘ ${Math.min(3, c.death.f)}/3</span>${btn('Roll', 'deathSave', null, 'sm')}</div>` : '';
    return `<div class="card status">
      <div class="hprow"><div class="hpnum ${low}"><span class="big">${c.hp}</span><span class="of">/ ${m} HP</span>
        ${c.temp ? `<span class="temp">+${c.temp} temp</span>` : ''}</div>
        <div class="acbox"><small>AC</small><b>${d.ac}</b></div></div>
      <div class="hpbar ${low}"><i style="width:${pct}%"></i></div>
      <div class="amt">${btn('−5', 'amt', -5, 'sq')}${btn('−1', 'amt', -1, 'sq')}
        <input id="amt" type="number" inputmode="numeric" min="0" placeholder="0" value="${APP.st.amt}" aria-label="Amount">
        ${btn('+1', 'amt', 1, 'sq')}${btn('+5', 'amt', 5, 'sq')}</div>
      <div class="row3">${btn('Damage', 'dmg', null, 'bad')}${btn('Heal', 'heal', null, 'ok')}${btn('Temp HP', 'temp')}</div>
      ${death}${badges(id)}</div>`;
  }
  function resCard(id) {
    const c = C(id), more = APP.st.more[id];
    const row = (label, html) => `<div class="resrow"><span>${label}</span><div>${html}</div></div>`;
    const main = id === 'pim'
      ? row('Level 1 slots', pips('s1', c.slots[1], 4, 'Level 1 slot')) + row('Level 2 slots', pips('s2', c.slots[2], 3, 'Level 2 slot')) +
        row('Channel Divinity', pips('cd', c.cd, 2, 'Channel Divinity'))
      : row('Rage', pips('rage', c.rage, 3, 'Rage') + tog(c.raging ? 'Raging' : 'Not raging', c.raging, 'rageToggle'));
    let extra = '';
    if (more) {
      extra = (id === 'pim' ? row('Lucky', pips('lucky', c.lucky, 2, 'Lucky') + btn('impose disadvantage', 'luckyDis', null, 'mini')) + row('Eyes of Night', pips('eyes', c.eyes, 1, 'Eyes of Night')) : '') +
        row('Heroic Inspiration', tog(c.heroic ? 'Ready' : 'Used', c.heroic, 'flag', 'heroic')) +
        row(`Hit Dice (d${DC(id).hitDie})`, pips('hd', c.hitDice, 4, 'Hit Die')) +
        `<div class="row wrap">${tog('Aid', c.aid, 'aid')}${tog('Bless', c.blessed, 'flag', 'blessed')}${id === 'pim' ? tog('Guidance', c.guidance, 'flag', 'guidance') : tog('Halve weapon damage while raging', c.phys, 'flag', 'phys')}</div>`;
    }
    return `<div class="card res">${main}${extra}
      <div class="row3">${btn(more ? 'Less ▴' : 'More ▾', 'more', null, 'ghost sm')}${btn('Short rest', 'shortRest', null, 'sm')}${btn('Long rest', 'longRest', null, 'sm')}</div></div>`;
  }
  function viewGevecht(id) {
    return `<div class="grid"><section class="col">${turnCard(id)}</section><section class="col">${statusCard(id)}${resCard(id)}</section></div>`;
  }

  /* ---------- Sheet ---------- */
  function viewSheet(id) {
    const d = DC(id), c = C(id), open = APP.st.feat;
    const abil = Object.keys(D.ABIL).map((ab) => {
      const p = d.saveProf.includes(ab);
      return `<button type="button" class="abox" data-act="save" data-arg="${ab}"><span class="ab">${ab}</span><b>${sign(APP.abMod(id, ab))}</b>
        <small>${d.abilities[ab]}</small><em>${p ? '● ' : ''}save ${sign(APP.saveMod(id, ab))}</em></button>`;
    }).join('');
    const skills = D.SKILLS.map((s) => {
      const p = d.skillProf.includes(s[0]);
      return `<button type="button" class="skill ${p ? 'prof' : ''}" data-act="skill" data-arg="${s[0]}">
        <span class="nm"><b>${s[0]}</b><small>${s[1]}</small></span><span class="md">${sign(APP.skillMod(id, s[0]))}</span></button>`;
    }).join('');
    const mode = [[0, 'Normal'], [1, 'Advantage'], [-1, 'Disadvantage']].map((m) => tog(m[1], c.mode === m[0], 'mode', m[0])).join('');
    return `<div class="card sheet">
      <div class="sheethead">${d.svg}<div class="sh-t"><h2>${d.name}</h2><div class="line">${d.line}</div></div>${btn('🖨️ Print', 'print', null, 'noprint sm')}</div>
      <div class="statgrid"><div class="stat"><small>Max HP</small><b>${d.maxHp}</b></div>
        ${d.stats.map((s) => `<div class="stat"><small>${s[0]}</small><b>${s[1]}</b></div>`).join('')}</div>
      <div class="rollmode noprint"><span class="label">Tap to roll:</span>${mode}</div>
      <div class="abil">${abil}</div>
      <div class="skills">${skills}</div>
      <div class="noprint">${btn(open ? 'Hide features ▴' : 'Features & gear ▾', 'feat', null, 'ghost sm')}</div>
      <div class="fold ${open ? 'open' : ''}">
        <div class="feats">${d.features.map((f) => `<div class="feat"><b>${f[0]}</b><p>${f[1]}</p></div>`).join('')}</div>
        <p><b>Gear:</b> ${d.gear.join(', ')}</p><p class="muted">${d.profs}</p></div></div>`;
  }

  /* ---------- Spells / Acties ---------- */
  function spellButtons(id) {
    const c = C('pim'), sp = D.spells[id];
    if (id === 'toll') return btn('Target hurt', 'cast', 'toll|injured') + btn('Target unhurt', 'cast', 'toll', 'ghost');
    if (id === 'spiritualWeapon' && c.conc === id) return btn('Attack (bonus action)', 'swAttack');
    if (id === 'moonbeam' && c.conc === id) return btn('Move (action)', 'moonbeamMove');
    return btn('Cast', 'cast', id) + (sp.up ? btn('Upcast (level 2)', 'cast', id + '|lvl2', 'ghost') : '');
  }
  function card(o) {
    return `<article class="card spell ${o.cls} ${o.active ? 'active' : ''}">
      <div class="sp-top"><span class="emoji">${o.emoji}</span><div class="sp-n"><b>${o.name}</b></div>${o.lvl ? `<span class="lvl">${o.lvl}</span>` : ''}</div>
      <div class="badges"><span class="badge t-${o.time}">${APP.TIME_LABEL[o.time]}</span>${o.range ? `<span class="badge">${o.range}</span>` : ''}${o.conc ? '<span class="badge conc">Concentration</span>' : ''}</div>
      <p>${o.wat}</p><div class="row wrap">${o.buttons}</div></article>`;
  }
  function viewSpells() {
    const c = C('pim');
    return `<div class="card slim"><div class="resline"><span>Level 1: <b>${c.slots[1]}</b>/4</span><span>Level 2: <b>${c.slots[2]}</b>/3</span>
        <span>Channel Divinity: <b>${c.cd}</b>/2</span><span>Spell DC <b>14</b> · attack <b>+6</b></span></div></div>
      ${D.spellGroups.map((g) => `<h2 class="grouph">${g[0]}</h2><div class="cards">${g[1].map((sid) => {
        const sp = D.spells[sid];
        return card({ cls: LVL_CLASS[sp.level], active: c.conc === sid || (sid === 'sanctuary' && c.zone > 0), emoji: sp.emoji, name: sp.name,
          lvl: lvlLabel(sp.level), time: sp.time, range: sp.range, conc: sp.conc, wat: sp.wat, buttons: spellButtons(sid) });
      }).join('')}</div>`).join('')}`;
  }
  function viewActies() {
    const c = C('charlie');
    return `<div class="card slim"><div class="resline"><span>Rage: <b>${c.rage}</b>/3</span><span>Attack <b>+6</b></span><span>Save DC <b>14</b></span>
        ${tog('Reckless', c.turn.reckless || c.turn.recklessUsed, 'turnToggle', 'reckless')}</div></div>
      <div class="cards">${D.charlieActions.map((a) => card({ cls: 'lcd', active: a.id === 'rage' && c.raging, emoji: a.emoji, name: a.name,
        time: a.time, wat: a.wat, buttons: btn(a.id === 'intimidate' ? 'Roll' : 'Do it', a.act[0], a.act[1]) })).join('')}</div>`;
  }

  /* ---------- Dobbelstenen en regels ---------- */
  function viewDice() {
    const t = APP.st.tray;
    const modes = [[0, 'Normal'], [1, 'Advantage'], [-1, 'Disadvantage']].map((m) => tog(m[1], t.mode === m[0], 'trayMode', m[0])).join('');
    return `<div class="grid"><section class="col"><div class="card dice">
        <div class="dierow">${[4, 6, 8, 10, 12, 20, 100].map((s) => `<button type="button" class="die ${t.s === s ? 'on' : ''}" data-act="die" data-arg="${s}">d${s}</button>`).join('')}</div>
        <div class="steppers"><div><span class="label">Dice</span>${btn('−', 'trayN', -1, 'sq')}<b>${t.n}</b>${btn('+', 'trayN', 1, 'sq')}</div>
          <div><span class="label">Modifier</span>${btn('−', 'trayMod', -1, 'sq')}<b>${sign(t.mod)}</b>${btn('+', 'trayMod', 1, 'sq')}</div></div>
        ${t.s === 20 && t.n === 1 ? `<div class="row wrap">${modes}</div>` : ''}
        ${btn(`Roll ${t.n}d${t.s}${t.mod ? ' ' + sign(t.mod) : ''}`, 'rollTray', null, 'big')}</div></section>
      <section class="col"><div class="card log"><h3>Recent rolls</h3>${APP.st.log.length ? `<ol>${APP.st.log.map((l) =>
        `<li class="who-${l.who}"><b>${l.big}</b><span>${l.title}<small>${l.sub}</small></span></li>`).join('')}</ol>` : '<p class="muted">No rolls yet.</p>'}
        ${btn('Clear', 'clearLog', null, 'ghost sm')}</div></section></div>`;
  }
  function viewRegels() {
    return `<div class="cards rules">${D.rules.map((r) => `<article class="card"><h3>${r[0]} ${r[1]}</h3><ul>${r[2].map((i) => `<li>${i}</li>`).join('')}</ul></article>`).join('')}</div>
      <div class="row">${btn('Reset everything', 'resetAll', null, 'ghost sm')}</div>`;
  }

  function resultPanel() {
    const st = APP.st, r = st.last;
    if (!r) return '';
    const nat = r.nat === 20 ? 'nat20' : r.nat === 1 ? 'nat1' : '';
    if (!st.resultOpen) {
      return `<button type="button" class="resmini who-${r.who}" data-act="openResult"><b>${r.big === undefined ? '' : r.big}</b> ${r.title} ▴</button>`;
    }
    return `<div class="result who-${r.who}" role="status" aria-live="polite">
      <button type="button" class="close" data-act="closeResult" aria-label="Close">✕</button>
      <div class="r-main">${r.big !== undefined ? `<div class="r-big ${nat}">${r.big}</div>` : ''}
        <div class="r-txt"><b>${r.title}</b>${r.sub ? `<small>${r.sub}</small>` : ''}</div></div>
      ${r.lines.length ? `<ul>${r.lines.map((l) => `<li>${l}</li>`).join('')}</ul>` : ''}
      ${r.buttons.length ? `<div class="row wrap">${r.buttons.map((b) => btn(b.label, b.act, b.arg, b.cls, ` data-who="${r.who}"`)).join('')}</div>` : ''}</div>`;
  }

  APP.render = () => {
    const st = APP.st, id = st.who;
    if (!TABS[id].some((t) => t[0] === st.tab[id])) st.tab[id] = 'gevecht';
    document.body.className = 'theme-' + id;
    const views = { gevecht: viewGevecht, sheet: viewSheet, spells: viewSpells, acties: viewActies, dice: viewDice, regels: viewRegels };
    document.getElementById('app').innerHTML = header() + `<main>${views[st.tab[id]](id)}</main>`;
    document.getElementById('result').innerHTML = resultPanel();
    APP.save();
  };
})();

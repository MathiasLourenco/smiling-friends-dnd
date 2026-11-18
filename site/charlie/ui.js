/* Charlie app — screens and input. */
(function () {
  'use strict';
  const D = window.CHD, C = D.ch, SPL = D.spells, SG = window.SURGE, A = window.CA;
  const sign = A.sign;
  const S = () => A.st;

  const attr = (act, arg) => ` data-act="${act}"${arg !== undefined && arg !== null ? ` data-arg="${arg}"` : ''}`;
  const btn = (label, act, arg, cls) => `<button type="button" class="btn ${cls || ''}"${attr(act, arg)}>${label}</button>`;
  const tog = (label, on, act, arg) => `<button type="button" class="tog ${on ? 'on' : ''}"${attr(act, arg)} aria-pressed="${on}">${label}</button>`;
  const pips = (key, val, max, label, base) => `<span class="pips" role="group" aria-label="${label}">${Array.from({ length: max }, (_, i) =>
    `<button type="button" class="pip ${i < val ? 'on' : ''} ${base !== undefined && i >= base ? 'extra' : ''}" data-act="pip" data-arg="${key}:${i}" aria-label="${label} ${i + 1}"></button>`).join('')}</span>`;
  const row = (label, inner) => `<div class="resrow"><span>${label}</span><div>${inner}</div></div>`;

  const TABS = [['combat', '⚔️', 'Combat'], ['spells', '✨', 'Spells'], ['surge', '🌀', 'Surge'], ['sheet', '📋', 'Sheet']];

  function header() {
    return `<header class="top"><div class="brand"><span class="logo">Smiling Friends</span><span class="dnd">D&amp;D</span></div>
      <div class="whobtn charlie on">${C.svg}<span><b>${C.short}</b><small>Wild Magic Sorcerer 5</small></span></div></header>
      <nav class="tabs" aria-label="Sections">${TABS.map((t) =>
        `<button type="button" class="tab ${S().tab === t[0] ? 'on' : ''}" data-act="tab" data-arg="${t[0]}"><span>${t[1]}</span>${t[2]}</button>`).join('')}</nav>`;
  }

  /* ---------- Status bar (Combat, Spells, Sheet) ---------- */
  function modbar() {
    const s = S(), inn = A.innateOn();
    const mm = [['careful', 'Careful'], ['subtle', 'Subtle']].map((m) => tog(`${m[1]} <i>1 SP</i>`, s.meta === m[0], 'meta', m[0])).join('');
    return `<section class="card modbar">
      <div class="mstats">
        <span class="mstat ${inn ? 'boost' : ''}"><small>Spell DC</small><b>${A.dc()}</b></span>
        <span class="mstat ${inn ? 'boost' : ''}"><small>Spell atk</small><b>${sign(C.atk)}${inn ? '<i>adv</i>' : ''}</b></span>
        <span class="mstat"><small>SP</small><b>${s.sp}/${C.spMax}</b></span></div>
      <div class="mgroup"><small>Metamagic</small>${mm}</div>
      ${s.conc ? `<span class="badge conc">🧠 ${SPL[s.conc].name}${btn('Drop', 'drop', null, 'mini')}</span>` : ''}
      ${inn ? `<span class="badge innate">🔮 Innate · ${s.innateLeft} rnd</span>` : ''}</section>`;
  }

  /* ---------- Combat ---------- */
  function hpCard() {
    const s = S(), pct = s.hp / C.maxHp;
    const cls = s.hp === 0 ? 'zero' : pct <= 0.25 ? 'low' : pct <= 0.5 ? 'mid' : '';
    const dots = (n) => '●'.repeat(n) + '○'.repeat(Math.max(0, 3 - n));
    return `<section class="card"><div class="hprow"><div class="hpnum ${cls}"><span class="big">${s.hp}</span><span class="of">/ ${C.maxHp} HP</span>${s.temp ? `<span class="temp">+${s.temp} temp</span>` : ''}</div>
      <div class="acbox"><small>AC</small><b>${A.ac()}</b><small>${s.mageArmor ? 'Mage Armor' : 'unarmored'}${s.shield ? ' + Shield' : ''}</small></div></div>
      <div class="hpbar ${cls}"><i style="width:${Math.round(pct * 100)}%"></i></div>
      <div class="amt">${btn('−', 'amt', -1, 'sq')}<input id="amt" type="number" inputmode="numeric" min="0" placeholder="0" value="${s.amt}" aria-label="Amount">${btn('+', 'amt', 1, 'sq')}</div>
      <div class="row3">${btn('💥 Damage', 'dmg', null, 'bad')}${btn('💚 Heal', 'heal', null, 'ok')}${btn('🛡️ Temp', 'temp', null, 'ghost')}</div>
      ${s.hp === 0 ? `<div class="deathbox"><b>Death saves</b><span>✔ ${dots(s.death.s)}</span><span>✘ ${dots(s.death.f)}</span>${btn('Roll death save', 'deathSave', null, 'sm')}</div>` : ''}</section>`;
  }
  function turnCard() {
    const s = S();
    if (!s.inCombat) {
      return `<section class="card turn"><div class="turnhead"><h3>Out of combat</h3>${btn('⚔️ Roll initiative', 'startCombat', null, 'sm')}</div>
        <p class="muted">Initiative ${sign(A.abMod('DEX'))}. Tides works on initiative too.</p></section>`;
    }
    const chip = (used, a, b) => `<span class="badge ${used ? 'warn' : 'zone'}">${used ? a : b}</span>`;
    return `<section class="card turn"><div class="turnhead"><span class="round">Round ${s.round}</span>
      <div class="row tight">${btn('New turn ▸', 'newTurn', null, 'sm')}${btn('End combat', 'endCombat', null, 'sm ghost')}</div></div>
      <div class="badges">${chip(s.turn.slot, 'Slot used this turn', 'Slot free this turn')}
      ${s.autoCheck ? chip(s.turn.check, 'Surge check rolled', 'Surge check free') : ''}
      ${s.shield ? '<span class="badge t-reaction">Shield +5 until your turn</span>' : ''}
      ${s.innateLeft ? `<span class="badge conc">🔮 Innate Sorcery · ${s.innateLeft} rounds</span>` : ''}
      ${s.chain ? `<span class="badge rage">🌀 Chain reaction · ${s.chain}</span>` : ''}</div></section>`;
  }
  const dmgLabel = (sp) => `${sp.kind === 'rays' ? sp.rays + '×' : ''}${sp.dmg[0]}d${sp.dmg[1]}${sp.up || sp.kind === 'rays' ? '+' : ''}${sp.type === 'chosen type' ? '' : ' ' + sp.type}`;
  function castRow(id, full) {
    const s = S(), sp = SPL[id];
    const tc = sp.time === 'Bonus' ? 't-bonus' : sp.time === 'Reaction' ? 't-reaction' : 't-action';
    const tags = [`<span class="pill ${tc}">${sp.time}</span>`, `<span class="rng">${sp.range}</span>`];
    if (full) tags.push(`<span class="rng">${sp.comp}</span>`, `<span class="rng">${sp.dur}</span>`);
    if (sp.conc) tags.push('<span class="pill conc">Conc</span>');
    if (sp.save) tags.push(`<span class="pill sv">${sp.save} save</span>`);
    if (sp.kind === 'atk' || sp.kind === 'rays') tags.push('<span class="pill sv">Attack</span>');
    if (sp.dmg) tags.push(`<span class="pill dmg">${dmgLabel(sp)}</span>`);
    const btns = !sp.lvl ? btn('Cast', 'cast', id, 'xs')
      : [1, 2, 3].filter((l) => l >= sp.lvl).map((l) => btn(`L${l}`, 'cast', `${id}:${l}`, 'xs' + (s.slots[l] ? '' : ' off'))).join('');
    return `<div class="sprow ${s.conc === id ? 'active' : ''}"><div class="lvtag">${sp.lvl || 'C'}</div>
      <div class="sp-main"><div class="sp-name"><b>${sp.name}</b>${tags.join('')}</div>${full ? `<small>${sp.text}</small>` : ''}</div>
      <div class="sp-btns">${btns}</div></div>`;
  }
  function resCard() {
    const s = S();
    const slotRows = [1, 2, 3].map((l) => row(`Level ${l} slots`, pips('s' + l, s.slots[l], A.slotMax(l), `Level ${l} slot`, C.slotsMax[l]))).join('');
    return `<section class="card"><h3>Resources <small>· ${s.surgeCount} surge${s.surgeCount === 1 ? '' : 's'} today</small></h3>${slotRows}
      ${row('Sorcery Points', pips('sp', s.sp, C.spMax, 'Sorcery Point'))}
      <div class="fom"><small>Font of Magic</small><div class="fomb">${[1, 2, 3].map((l) => btn(`+L${l} <i>${A.SLOT_COST[l]} SP</i>`, 'create', l, 'xs ghost')).join('')}
        <span class="sep"></span>${[1, 2, 3].map((l) => btn(`L${l} → ${l} SP`, 'convert', l, 'xs ghost')).join('')}</div></div>
      ${row('Innate Sorcery', pips('innate', s.innate, C.innateMax, 'Innate Sorcery use') + btn(A.innateOn() ? 'End' : 'Activate', 'innate', null, 'mini'))}
      ${row('Luck Points', pips('luck', s.luck, C.luckMax, 'Luck Point') + btn('vs attacker', 'luckDef', null, 'mini'))}
      ${row('Heroic Inspiration', tog(s.heroic ? 'Ready' : 'Used', s.heroic, 'flag', 'heroic'))}
      ${row('Sorcerous Restoration', tog(s.resto ? 'Ready' : 'Used', s.resto, 'flag', 'resto'))}
      ${row('Hit dice (d6)', pips('hd', s.hd, C.level, 'Hit die'))}
      ${row('Mage Armor', tog(s.mageArmor ? 'On · AC 15' : 'Off', s.mageArmor, 'flag', 'mageArmor'))}
      <div class="row">${btn('☕ Short rest', 'shortRest', null, 'sm ghost')}${btn('🌙 Long rest', 'longRest', null, 'sm ghost')}</div></section>`;
  }
  const viewCombat = () => modbar() + `<div class="grid"><div class="col">${hpCard()}${turnCard()}
      <section class="card spgroup"><h3>Quick cast</h3>${D.quick.map((id) => castRow(id, false)).join('')}</section></div>
      <div class="col">${resCard()}</div></div>`;

  /* ---------- Spells ---------- */
  function viewSpells() {
    const s = S();
    return modbar() + `<div class="spcols">${D.groups.map((g) => {
      const l = SPL[g[1][0]].lvl;
      return `<section class="card spgroup"><h3>${g[0]}${l ? ` <small>· ${s.slots[l]}/${C.slotsMax[l]} slots</small>` : ''}</h3>${g[1].map((id) => castRow(id, true)).join('')}</section>`;
    }).join('')}</div>`;
  }

  /* ---------- Surge ---------- */
  function viewSurge() {
    const s = S();
    const state = !s.tides ? 'spent' : s.armed ? 'armed' : 'ready';
    const say = {
      ready: 'Use it for advantage on one d20 roll (attack, save, check, initiative).',
      armed: 'Your next d20 roll gets advantage, then Tides is spent.',
      spent: 'Your next Sorcerer spell with a spell slot surges automatically and brings Tides back.'
    }[state];
    const recent = s.surges.length
      ? `<ol class="recent">${s.surges.map((x) => `<li><button type="button" data-act="goto" data-arg="${x.n}"><b>${x.n}</b> ${SG.rows[x.n - 1][1]}</button>${x.r ? `<span>R${x.r}</span>` : ''}</li>`).join('')}</ol>`
      : '<p class="muted">No surges yet.</p>';
    const filters = [['all', 'All'], ['g', 'Good'], ['m', 'Weird'], ['b', 'Bad']].map((f) => tog(f[1], s.filter === f[0], 'filter', f[0])).join('');
    const rows = SG.rows.map((r, i) => `<li class="srow ${r[0]} ${s.hit === i + 1 ? 'hit' : ''}" id="s${i + 1}" data-k="${r[0]}"><b>${i + 1}</b><span>${r[1]}</span></li>`).join('');
    return `<div class="grid">
      <section class="card tidescard ${state}"><h2>🌊 Tides of Chaos: ${state}</h2><p>${say}</p>
        <div class="row wrap">${s.tides ? btn(s.armed ? 'Disarm' : 'Arm for next roll', 'arm', null, 'sm') : ''}
          ${btn(s.tides ? 'Mark as spent' : 'Mark as ready', 'flag', 'tides', 'sm ghost')}</div>
        <div class="row wrap">${btn('🌀 Roll d100 surge', 'rollSurge', null, 'big')}${btn('🎲 d20 surge check', 'surgeCheck', null, 'sm ghost')}</div>
        <div class="row">${tog(s.autoCheck ? 'Auto check: on' : 'Auto check: off', s.autoCheck, 'flag', 'autoCheck')}
          <span class="muted">Roll the optional d20 after each slot spell (once per turn).</span></div></section>
      <section class="card rules"><h3>How it works</h3><ul>${D.rules.map((r) => `<li>${r}</li>`).join('')}</ul></section></div>
      <section class="card"><h3>Recent surges <small>· ${s.surgeCount} today</small></h3>${recent}</section>
      <section class="card"><div class="turnhead"><h3>Surge table <small>· d100</small></h3>
        <div class="row tight wrap">${filters}<input id="sq" type="search" placeholder="Search…" value="${s.q.replace(/"/g, '&quot;')}" aria-label="Search the table"></div></div>
        <ol class="stable">${rows}</ol>
        <p class="credit">Table: <a href="${SG.source}" target="_blank" rel="noopener">${SG.credit}</a>. Effects summarised; house rule — replaces the Player's Handbook table.</p></section>`;
  }
  function filterTable() {
    const s = S(), q = s.q.trim().toLowerCase();
    document.querySelectorAll('.stable .srow').forEach((li) => {
      const okK = s.filter === 'all' || li.dataset.k === s.filter;
      const okQ = !q || li.textContent.toLowerCase().indexOf(q) >= 0;
      li.hidden = !(okK && okQ);
    });
  }

  /* ---------- Sheet ---------- */
  function viewSheet() {
    const st = [['HP', C.maxHp, 'd6 × 5'], ['AC', A.ac(), 'Mage Armor 15'], ['Initiative', sign(A.abMod('DEX')), 'DEX'], ['Speed', C.speed + ' ft', 'walk'],
      ['Proficiency', sign(C.prof), 'level 5'], ['Spell DC', A.dc(), 'CHA'], ['Spell attack', sign(C.atk), 'CHA'],
      ['Passive Perception', 10 + A.skillMod('Perception'), 'WIS']];
    return modbar() + `<section class="card"><div class="sheethead">${C.svg}<div class="sh-t"><h2>${C.name}</h2><p class="line">${C.line}</p></div></div>
      <div class="statgrid">${st.map((x) => `<div class="stat"><small>${x[0]}</small><b>${x[1]}</b><em>${x[2]}</em></div>`).join('')}</div>
      <h3>Abilities <small>· tap to roll a check</small></h3>
      <div class="abil">${A.ABS.map((ab) => `<button type="button" class="abox" data-act="ability" data-arg="${ab}"><span class="ab">${ab}</span><b>${sign(A.abMod(ab))}</b><small>${C.abilities[ab]}</small></button>`).join('')}</div>
      <h3>Saving throws</h3>
      <div class="skills">${A.ABS.map((ab) => `<button type="button" class="skill ${C.saveProf.includes(ab) ? 'prof' : ''}" data-act="save" data-arg="${ab}"><span class="nm"><b>${ab} save</b><small>${C.saveProf.includes(ab) ? 'proficient' : ''}</small></span><span class="md">${sign(A.saveMod(ab))}</span></button>`).join('')}</div>
      <h3>Skills</h3>
      <div class="skills">${A.SKILLS.map((k) => `<button type="button" class="skill ${C.skillProf.includes(k[0]) ? 'prof' : ''}" data-act="skill" data-arg="${k[0]}"><span class="nm"><b>${k[0]}</b><small>${k[1]}</small></span><span class="md">${sign(A.skillMod(k[0]))}</span></button>`).join('')}</div>
      <h3>Features</h3>
      <div class="feats">${C.features.map((f) => `<div class="feat"><b>${f[0]}</b><p>${f[1]}</p></div>`).join('')}</div>
      <p><b>Gear:</b> ${C.gear.join(', ')}</p><p class="muted">${C.profs}</p>
      <div class="row">${btn('Reset everything', 'resetAll', null, 'ghost sm')}</div></section>`;
  }

  /* ---------- Result ---------- */
  function resultPanel() {
    const st = S(), r = st.last;
    if (!r) return '';
    const nat = r.nat === 20 ? 'nat20' : r.nat === 1 ? 'nat1' : '';
    if (!st.resultOpen) return `<button type="button" class="resmini who-charlie" data-act="openResult"><b>${r.big === undefined ? '' : r.big}</b> ${r.title} ▴</button>`;
    return `<div class="result who-charlie" role="status" aria-live="polite">
      <button type="button" class="close" data-act="closeResult" aria-label="Close">✕</button>
      <div class="r-main">${r.big !== undefined ? `<div class="r-big ${nat}">${r.big}</div>` : ''}
        <div class="r-txt"><b>${r.title}</b>${r.sub ? `<small>${r.sub}</small>` : ''}</div></div>
      ${r.lines.length ? `<ul>${r.lines.map((l) => `<li>${l}</li>`).join('')}</ul>` : ''}
      ${r.buttons.length ? `<div class="row wrap">${r.buttons.map((b) => btn(b.label, b.act, b.arg, b.cls)).join('')}</div>` : ''}</div>`;
  }

  A.render = () => {
    const views = { combat: viewCombat, spells: viewSpells, surge: viewSurge, sheet: viewSheet };
    if (!views[S().tab]) S().tab = 'combat';
    document.getElementById('app').innerHTML = header() + `<main>${views[S().tab]()}</main>`;
    document.getElementById('result').innerHTML = resultPanel();
    if (S().tab === 'surge') {
      filterTable();
      if (S().scrollTo) {
        const el = document.getElementById('s' + S().scrollTo);
        if (el) el.scrollIntoView({ block: 'center' });
        S().scrollTo = 0;
      }
    }
    A.save();
  };

  /* ---------- Input ---------- */
  const amt = () => Math.max(0, parseInt(S().amt, 10) || 0);
  const needNumber = () => A.note('Enter a number first', []);
  const ACT = {
    tab: (a) => { S().tab = a; window.scrollTo(0, 0); },
    amt: (a) => { S().amt = String(Math.max(0, amt() + Number(a))); },
    dmg: () => { if (!amt()) return needNumber(); A.takeDamage(amt()); S().amt = ''; },
    heal: () => {
      const v = amt();
      if (!v) return needNumber();
      A.heal(v); S().amt = '';
      A.note('💚 Healed', [], { big: '+' + v, sub: `${S().hp}/${C.maxHp} HP` });
    },
    temp: () => {
      const v = amt(), s = S();
      if (!v) return needNumber();
      s.temp = Math.max(s.temp, v); s.amt = '';
      A.note('🛡️ Temp HP', [v < s.temp ? `You keep ${s.temp} (temp HP don't stack).` : ''], { big: s.temp });
    },
    meta: (a) => { const s = S(); s.meta = s.meta === a ? '' : a; },
    flag: (a) => { const s = S(); s[a] = !s[a]; if (a === 'tides' && !s.tides) s.armed = false; },
    heroicOn: () => { S().heroic = true; A.note('🎵 Heroic Inspiration', ['From Pim\'s Musician song after the rest.']); },
    arm: () => A.arm(),
    drop: () => { S().conc = null; },
    filter: (a) => { S().filter = a; },
    goto: (a) => { const s = S(); s.tab = 'surge'; s.hit = Number(a); s.scrollTo = Number(a); s.filter = 'all'; s.q = ''; s.resultOpen = false; },
    pip: (a) => A.pip(a),
    cast: (a) => A.cast(a),
    castForce: (a) => A.cast(a, true),
    leap: () => A.leap(),
    create: (a) => A.create(a),
    convert: (a) => A.convert(a),
    innate: () => A.innate(),
    luckDef: () => A.luckDef(),
    lucky: () => A.lucky(),
    heroic: () => A.heroic(),
    rollSurge: () => A.rollSurge(),
    surgeCheck: () => A.surgeCheck(),
    shift: (a) => A.shift(a),
    surge2: (a) => A.surge2(a),
    skill: (a) => A.rollSkill(a),
    save: (a) => A.rollSave(a),
    ability: (a) => A.rollAbility(a),
    deathSave: () => A.deathSave(),
    startCombat: () => A.startCombat(),
    newTurn: () => A.newTurn(),
    endCombat: () => A.endCombat(),
    shortRest: () => A.shortRest(),
    hitDie: () => A.hitDie(),
    longRest: () => A.longRest(),
    longRestYes: () => A.longRestYes(),
    closeResult: () => { S().resultOpen = false; },
    openResult: () => { S().resultOpen = true; },
    resetAll: () => A.note('Reset everything?', ['HP, resources, surges and settings go back to the start.'], { buttons: [{ label: 'Yes, reset', act: 'resetYes', cls: 'bad sm' }] }),
    resetYes: () => { A.reset(); }
  };

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const fn = ACT[el.dataset.act];
    if (!fn) return;
    e.preventDefault();
    fn(el.dataset.arg);
    A.render();
  });
  document.addEventListener('input', (e) => {
    if (e.target.id === 'amt') S().amt = e.target.value;
    if (e.target.id === 'sq') { S().q = e.target.value; filterTable(); A.save(); }
  });

  A.render();

  if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
    window.addEventListener('load', () => navigator.serviceWorker.register('../sw.js').catch(() => {}));
  }
})();

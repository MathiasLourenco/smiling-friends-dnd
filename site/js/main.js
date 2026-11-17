/* Knoppen koppelen aan acties en de app starten. */
(function () {
  'use strict';
  const APP = window.APP;
  const { C } = APP;

  const amt = () => Math.max(0, parseInt(APP.st.amt, 10) || 0);
  const parseCast = (arg) => {
    const p = String(arg).split('|'), opts = {};
    p.slice(1).forEach((o) => {
      if (o === 'injured') opts.injured = true;
      if (o === 'reaction') opts.reaction = true;
      if (o === 'lvl2') opts.lvl = 2;
    });
    return [p[0], opts];
  };

  const ACT = {
    who: (a) => { APP.st.who = a; },
    tab: (a, who) => { APP.st.tab[who] = a; window.scrollTo(0, 0); },
    amt: (a) => { APP.st.amt = String(Math.max(0, amt() + Number(a))); },
    dmg: (a, who) => { if (!amt()) return APP.note('Hoeveel?', ['Vul eerst in hoeveel schade je krijgt.'], { who }); APP.takeDamage(who, amt()); APP.st.amt = ''; },
    heal: (a, who) => {
      const v = amt();
      if (!v) return APP.note('Hoeveel?', ['Vul eerst in hoeveel HP je terugkrijgt.'], { who });
      const woke = APP.heal(who, v);
      APP.st.amt = '';
      APP.note('💚 Geheeld', [`+${v} HP → ${C(who).hp}/${APP.maxHp(who)}.`].concat(woke ? ['Je staat weer op!'] : []), { who, big: '+' + v });
    },
    temp: (a, who) => {
      const v = amt();
      C(who).temp = v; APP.st.amt = '';
      APP.note('🛡️ Tijdelijke HP', [v ? `Je hebt nu ${v} tijdelijke HP. Die gaan er eerst af.` : 'Tijdelijke HP op 0 gezet.'], { who, big: v });
    },
    flag: (a, who) => { const c = C(who); c[a] = !c[a]; },
    aid: (a, who) => {
      const c = C(who);
      c.aid = !c.aid;
      if (c.aid) c.hp += 5; else c.hp = Math.min(c.hp, APP.maxHp(who));
    },
    mode: (a, who) => { C(who).mode = Number(a); },
    situ: (a, who) => { const s = C(who).situ; s[a] = !s[a]; },
    turnToggle: (a, who) => {
      const t = C(who).turn;
      if (a === 'reckless') { if (t.recklessUsed) { t.recklessUsed = false; t.reckless = false; } else t.reckless = !t.reckless; }
      else t[a] = !t[a];
    },
    pip: (a, who) => APP.pip(who, a),
    luckyDis: () => {
      const c = C('pim');
      if (c.lucky <= 0) return APP.note('Geen Lucky meer', ['Na een long rest krijg je ze terug.'], { who: 'pim' });
      c.lucky--;
      APP.note('🍀 Lucky', ['De vijand die jou aanvalt gooit met <b>nadeel</b>. Zeg het tegen de DM.'], { who: 'pim' });
    },
    stopConc: () => APP.endConc(false),
    zoneTemp: (a) => APP.zoneTemp(a),
    zoneStop: () => { C('pim').zone = 0; },
    startCombat: (a, who) => APP.startCombat(who),
    newTurn: (a, who) => APP.newTurn(who),
    endCombat: (a, who) => APP.endCombat(who),
    cast: (a) => { const p = parseCast(a); APP.cast(p[0], p[1]); },
    swAttack: () => APP.swAttack(false),
    moonbeamMove: () => APP.moonbeamMove(),
    giveHeal: (a) => {
      const p = a.split(':'), id = p[0], v = Number(p[1]);
      const woke = APP.heal(id, v);
      APP.note(`💚 ${APP.DC(id).short} +${v} HP`, [`Nu ${C(id).hp}/${APP.maxHp(id)} HP.`].concat(woke ? ['Hij staat weer op!'] : []), { who: 'pim', big: '+' + v });
    },
    vbGive: (a) => { C(a).vb = true; APP.note('⏰ Wakker worden!', [`${APP.DC(a).short} gooit zijn volgende initiatief met voordeel.`], { who: 'pim' }); },
    holdFail: () => { C('charlie').situ.paralyzed = true; APP.note('🧊 Verlamd!', ['Charlie: ga ernaast staan. Elke raak = automatisch kritiek.', 'Het doelwit mag aan het eind van elke beurt opnieuw een WIS-save doen.'], { who: 'pim' }); },
    holdPass: () => { APP.endConc(true); APP.note('😑 Gehaald', ['Freeze-frame werkte niet. Je slot is wel op, en je concentratie is weer vrij.'], { who: 'pim' }); },
    rage: () => APP.rage(),
    rageToggle: () => { if (C('charlie').raging) APP.stopRage(); else APP.rage(); },
    stopRage: () => APP.stopRage(),
    extendRage: () => APP.extendRage(),
    atk: (a) => APP.attack(a),
    hit: () => APP.hit(),
    miss: () => APP.miss(),
    cleave: () => APP.attack('greataxe', { cleave: true }),
    hew: (a) => APP.attack(a || 'greataxe', { hew: true }),
    graze: () => APP.graze(),
    shove: () => APP.shove(),
    helpTalk: () => APP.helpTalk(),
    skill: (a, who) => APP.rollSkill(who, a),
    save: (a, who) => APP.rollSave(who, a),
    deathSave: (a, who) => APP.deathSave(who),
    heroic: () => APP.heroic(),
    lucky: () => APP.lucky(),
    shortRest: (a, who) => APP.shortRest(who),
    hitDie: (a, who) => APP.hitDie(who),
    longRest: (a, who) => APP.longRest(who),
    die: (a) => { APP.st.tray.s = Number(a); },
    trayN: (a) => { const t = APP.st.tray; t.n = Math.min(20, Math.max(1, t.n + Number(a))); },
    trayMod: (a) => { const t = APP.st.tray; t.mod = Math.min(20, Math.max(-10, t.mod + Number(a))); },
    trayMode: (a) => { APP.st.tray.mode = Number(a); },
    rollTray: () => APP.rollTray(),
    clearLog: () => { APP.st.log = []; },
    closeResult: () => { APP.st.resultOpen = false; },
    openResult: () => { APP.st.resultOpen = true; },
    print: (a, who) => { APP.st.tab[who] = 'sheet'; setTimeout(() => window.print(), 50); },
    resetAll: () => { if (APP.ask('Alles terugzetten naar het begin? Je HP, slots en logboek worden gewist.')) APP.reset(); }
  };

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const fn = ACT[el.dataset.act];
    if (!fn) return;
    e.preventDefault();
    fn(el.dataset.arg, el.dataset.who || APP.st.who);
    APP.render();
  });
  document.addEventListener('input', (e) => { if (e.target.id === 'amt') APP.st.amt = e.target.value; });

  APP.render();

  if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
})();

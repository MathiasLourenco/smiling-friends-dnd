/* Wire buttons to actions and start the app. */
(function () {
  'use strict';
  const APP = window.APP;
  const { S } = APP;

  const amt = () => Math.max(0, parseInt(APP.st.amt, 10) || 0);
  const needNumber = () => APP.note('Enter a number first', ['Use the box between −1 and +1.']);

  const ACT = {
    tab: (a) => { APP.st.tab = a; window.scrollTo(0, 0); },
    amt: (a) => { APP.st.amt = String(Math.max(0, amt() + Number(a))); },
    dmg: () => { if (!amt()) return needNumber(); APP.takeDamage(amt()); APP.st.amt = ''; },
    heal: () => {
      const v = amt();
      if (!v) return needNumber();
      APP.heal(v); APP.st.amt = '';
      APP.note('💚 Healed', [], { big: '+' + v, sub: `now ${S().hp}/${APP.maxHp()} HP` });
    },
    temp: () => {
      const v = amt(), c = S();
      if (!v) return needNumber();
      c.temp = Math.max(c.temp, v); APP.st.amt = '';
      APP.note('🛡️ Temp HP', [v < c.temp ? `You already had more (${c.temp}). Temp HP don't stack.` : 'They come off first when you get hit.'], { big: c.temp });
    },
    healSelf: (a) => { APP.heal(Number(a)); APP.note('💚 Pim', [], { big: '+' + a, sub: `now ${S().hp}/${APP.maxHp()} HP` }); },
    healCharlie: (a) => APP.note('💚 Charlie', [`Tell Charlie: he gets <b>${a} HP</b> back.`], { big: '+' + a }),
    more: () => { APP.st.more = !APP.st.more; },
    feat: () => { APP.st.feat = !APP.st.feat; },
    flag: (a) => { const c = S(); c[a] = !c[a]; },
    aid: () => {
      const c = S();
      c.aid = !c.aid;
      if (c.aid) c.hp += 5; else c.hp = Math.min(c.hp, APP.maxHp());
    },
    mode: (a) => { S().mode = Number(a); },
    situ: (a) => { const s = S().situ; s[a] = !s[a]; },
    pip: (a) => APP.pip(a),
    font: () => APP.font(),
    stopConc: () => { S().conc = null; },
    saved: (a) => APP.saved(a),
    startCombat: () => APP.startCombat(),
    newTurn: () => APP.newTurn(),
    endCombat: () => APP.endCombat(),
    cast: (a) => APP.cast(a),
    skill: (a) => APP.rollSkill(a),
    save: (a) => APP.rollSave(a),
    deathSave: () => APP.deathSave(),
    shortRest: () => APP.shortRest(),
    hitDie: () => APP.hitDie(),
    longRest: () => APP.longRest(),
    closeResult: () => { APP.st.resultOpen = false; },
    openResult: () => { APP.st.resultOpen = true; },
    print: () => { APP.st.tab = 'sheet'; setTimeout(() => window.print(), 50); },
    resetAll: () => { if (APP.ask('Reset everything? HP, slots and inspiration go back to the start.')) APP.reset(); }
  };

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const fn = ACT[el.dataset.act];
    if (!fn) return;
    e.preventDefault();
    fn(el.dataset.arg);
    APP.render();
  });
  document.addEventListener('input', (e) => { if (e.target.id === 'amt') APP.st.amt = e.target.value; });

  APP.render();

  if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
})();

/* ================= each map's own four bosses: same roles, new bodies, a signature move each ================= */
function boomAt(x, y, r, delay, dmg, col = COL.ink, dur = 1) {
  TG.push({ x, y, r, t: -delay, dur, kind: 'emeteor', dead: false, cb: () => {
    ringFx(x, y, r + 8, col, .3, 6); burst(x, y, 10, col === COL.ink ? COL.deep : col, 200); splat(x, y, r * 1.3, false);
    if (STATE === 'play' && d2(P.x, P.y, x, y) < (r + P.r) ** 2) hurtPlayer(dmg);
    if (gate('bmA', 70)) SFX.boom(false); shake(3);
  } });
}
function lineOfBooms(x, y, a, n, step, r, dmg, col, gap = .08) { for (let k = 1; k <= n; k++) boomAt(x + Math.cos(a) * k * step, y + Math.sin(a) * k * step, r, k * gap, dmg, col); }
const toP = e => Math.atan2(P.y - e.y, P.x - e.x);

const SIG = {
  roots(e) { lineOfBooms(e.x, e.y, toP(e), 8, 52, 32, 16, COL.teal); SFX.rumble(); },
  feathers(e) { fan(e, toP(e) + Math.PI, 9, 1.7, 150, 8); fan(e, toP(e), 5, .6, 190, 9); },
  spores(e) { for (let k = 0; k < 6; k++) { const a = rnd(TAU), r = rnd(30, 140); boomAt(P.x + Math.cos(a) * r + P.vx * .4, P.y + Math.sin(a) * r + P.vy * .4, 44, k * .12, 14, COL.teal, 1.2); } },
  grove(e) { const a = toP(e); for (const o of [-.55, 0, .55]) lineOfBooms(e.x, e.y, a + o, 9, 54, 34, 18, COL.teal); SFX.rumble(); },
  crystals(e) { const o = rnd(TAU); for (let k = 0; k < 8; k++) lineOfBooms(e.x, e.y, o + k / 8 * TAU, 4, 50, 28, 16, COL.yellow, .07); },
  bones(e) { const a = toP(e); for (let k = -2; k <= 2; k++) fireEB(e.x, e.y, a + k * .28, 150, 12, true); SFX.spit(); },
  mirage(e) {
    burst(e.x, e.y, 20, COL.yellow, 260);
    const a = rnd(TAU); e.x = P.x + Math.cos(a) * 230; e.y = P.y + Math.sin(a) * 230;
    burst(e.x, e.y, 20, COL.yellow, 260); radial(e, 12, 120, rnd(TAU), 9, false); SFX.vortex(); e.flash = .2;
  },
  sink(e) { e.pullT = 2.8; banner('모래 구멍', '빨려 들어간다. 바깥으로 달려라', 'warn'); SFX.rumble(); },
  floes(e) { radial(e, 9, 85, rnd(TAU), 13, true); SFX.spit(); },
  dive(e) { e.subT = 1.6; e.under = 1; SFX.wave(); },
  sweep(e) { e.sweepT = 2.6; e.swA = toP(e) - 1.2; },
  icicles(e) { for (let k = 0; k < 12; k++) { const a = rnd(TAU), r = rnd(0, 260); boomAt(P.x + Math.cos(a) * r, P.y + Math.sin(a) * r, 30, k * .07, 15, '#7CC6D8', .9); } },
  cuts(e) { for (let j = 0; j < 2; j++) { const a = rnd(TAU), sx = P.x - Math.cos(a) * 230, sy = P.y - Math.sin(a) * 230; for (let k = 0; k < 9; k++) boomAt(sx + Math.cos(a) * k * 55, sy + Math.sin(a) * k * 55, 26, j * .5 + k * .05, 15, COL.pink, .8); } },
  stamps(e) { for (let k = 0; k < 3; k++) G.later.push({ t: k * .55, fn: () => { if (STATE !== 'play') return; boomAt(P.x + P.vx * .3, P.y + P.vy * .3, 78, 0, 22, COL.pink, .75); } }); },
  erase(e) {
    const gap = Math.floor(rnd(0, 5)), dir = Math.random() < .5 ? 1 : -1;
    for (let c = 0; c < 9; c++) for (let r = 0; r < 5; r++) { if (r === gap) continue; boomAt(P.x + dir * (-330 + c * 82), P.y + (r - 2) * 74, 36, c * .13, 18, COL.pink, .85); }
    banner('지우는 손', '빈 줄로 피해라', 'warn');
  },
};
/* ongoing states some signatures leave behind; return a move to take over the frame */
function bossHook(e, dt, ux, uy, dist) {
  if (e.pullT > 0) {
    e.pullT -= dt;
    const d = Math.max(1, dist), k = 105 * dt;
    if (STATE === 'play') { P.x += (e.x - P.x) / d * k; P.y += (e.y - P.y) / d * k; }
    if (Math.random() < dt * 40) { const a = rnd(TAU), r = rnd(80, 260); PT.push({ x: e.x + Math.cos(a) * r, y: e.y + Math.sin(a) * r, vx: -Math.cos(a) * r * 1.6, vy: -Math.sin(a) * r * 1.6, life: .55, max: .55, s: rnd(2, 4), c: COL.yellow, dead: false }); }
    return Z0;
  }
  if (e.subT > 0) {
    e.subT -= dt;
    if (e.subT <= 0) { e.under = 0; radial(e, 14, 130, rnd(TAU), 10, false); ringFx(e.x, e.y, 120, '#7CC6D8', .4, 8); shake(10); SFX.boom(true); return Z0; }
    return [ux * e.spd * 2.6, uy * e.spd * 2.6];
  }
  if (e.sweepT > 0) {
    e.sweepT -= dt; e.swA += dt * 1.15; e.swF = (e.swF || 0) - dt;
    if (e.swF <= 0) { e.swF = .05; fireEB(e.x, e.y, e.swA, 175, 9, false); fireEB(e.x, e.y, e.swA + Math.PI, 175, 9, false); if (gate('swp', 90)) SFX.spit(); }
    return Z0;
  }
  return null;
}

Object.assign(BOSS, {
  oak: { name: '늙은 참나무', arch: 'colossus', r: 44, hp: 2300, spd: 38, dmg: 18, sub: '뿌리가 땅 밑으로 먼저 온다', sig: 'roots', sigCd: 6 },
  owl: { name: '밤부엉이', arch: 'rake', r: 34, hp: 5000, spd: 120, dmg: 20, sub: '날개를 접을 때 깃털이 쏟아진다', sig: 'feathers', sigCd: 5.5 },
  bloom: { name: '시체꽃', arch: 'eye', r: 40, hp: 9000, spd: 30, dmg: 20, sub: '포자가 떨어진 자리를 피해라', sig: 'spores', sigCd: 5 },
  grove: { name: '숲의 심장', arch: 'cata', r: 55, hp: 22000, spd: 44, dmg: 26, sub: '잠긴 숲 전체가 한 번에 뛴다', sig: 'grove', sigCd: 6.5 },

  golem: { name: '소금 거인', arch: 'colossus', r: 44, hp: 2400, spd: 36, dmg: 20, sub: '발을 구르면 결정이 솟는다', sig: 'crystals', sigCd: 6.5 },
  vulture: { name: '뼈독수리', arch: 'rake', r: 34, hp: 5000, spd: 128, dmg: 20, sub: '먹다 남은 뼈를 던진다', sig: 'bones', sigCd: 4.2 },
  mirage: { name: '신기루', arch: 'eye', r: 40, hp: 8600, spd: 30, dmg: 20, sub: '보이는 곳에 없다', sig: 'mirage', sigCd: 6 },
  sandking: { name: '모래 왕', arch: 'cata', r: 55, hp: 22000, spd: 46, dmg: 26, sub: '사막 한가운데가 입이다', sig: 'sink', sigCd: 9 },

  iceberg: { name: '떠도는 빙산', arch: 'colossus', r: 44, hp: 2600, spd: 32, dmg: 20, sub: '부서진 조각이 천천히 밀려온다', sig: 'floes', sigCd: 5 },
  orca: { name: '범고래', arch: 'rake', r: 34, hp: 5000, spd: 118, dmg: 20, sub: '얼음 밑으로 사라졌다 솟는다', sig: 'dive', sigCd: 7 },
  lighthouse: { name: '등대지기', arch: 'eye', r: 40, hp: 9000, spd: 26, dmg: 20, sub: '불빛이 한 바퀴 돈다', sig: 'sweep', sigCd: 8 },
  leviathan: { name: '얼음 바다뱀', arch: 'cata', r: 55, hp: 22000, spd: 46, dmg: 26, sub: '항구를 통째로 감고 있던 것', sig: 'icicles', sigCd: 5.5 },

  pagegiant: { name: '찢긴 페이지', arch: 'colossus', r: 44, hp: 2400, spd: 38, dmg: 20, sub: '찢긴 자리가 칼날이다', sig: 'cuts', sigCd: 5.5 },
  quill: { name: '깃펜', arch: 'rake', r: 34, hp: 5200, spd: 132, dmg: 20, sub: '지나간 자리에 잉크가 남는다', sig: 'feathers', sigCd: 6, trail: true },
  stamp: { name: '도장', arch: 'eye', r: 40, hp: 9000, spd: 30, dmg: 22, sub: '세 번 찍는다. 세 번 다 피해라', sig: 'stamps', sigCd: 5.5 },
  author: { name: '지우는 손', arch: 'cata', r: 55, hp: 23000, spd: 46, dmg: 26, sub: '이 밤을 그린 손', sig: 'erase', sigCd: 7.5 },
});
MAPS[2].boss = { colossus: 'oak', rake: 'owl', eye: 'bloom', cata: 'grove' };
MAPS[3].boss = { colossus: 'golem', rake: 'vulture', eye: 'mirage', cata: 'sandking' };
MAPS[4].boss = { colossus: 'iceberg', rake: 'orca', eye: 'lighthouse', cata: 'leviathan' };
MAPS[5].boss = { colossus: 'pagegiant', rake: 'quill', eye: 'stamp', cata: 'author' };
const mapBoss = id => (G && G.mode === 'normal' && curMap().boss && curMap().boss[id]) || id;

function buildMapBossArt() {
  const F = { plates: MAP_PLATES.forest }, S = { plates: MAP_PLATES.salt }, Hb = { plates: MAP_PLATES.harbor }, T = { plates: MAP_PLATES.tear };
  const two = (c, cy, r, sp, h) => [[c - r * sp, cy + r * h], [c + r * sp, cy + r * h]];
  // forest
  regCreature('oak', 46, (x, c, cy, r) => {
    x.beginPath(); x.roundRect(c - r * .42, cy - r * .1, r * .84, r * 1.05, r * .15); x.fill();
    x.beginPath(); x.arc(c - r * .45, cy - r * .35, r * .45, 0, TAU); x.arc(c + r * .45, cy - r * .35, r * .45, 0, TAU); x.arc(c, cy - r * .62, r * .5, 0, TAU); x.fill();
    for (const sd of [-1, 1]) { x.beginPath(); x.moveTo(c + sd * r * .3, cy + r * .8); x.lineTo(c + sd * r * .8, cy + r * .98); x.lineTo(c + sd * r * .38, cy + r * .6); x.fill(); }
  }, (x, c, cy, r) => {
    eyes(x, two(c, cy, r, .18, .15), r * .12, r * .06, .2);
    x.strokeStyle = COL.deep; x.lineWidth = 2.5; x.beginPath(); x.moveTo(c - r * .2, cy + r * .5); x.lineTo(c - r * .05, cy + r * .42); x.lineTo(c + r * .08, cy + r * .55); x.lineTo(c + r * .2, cy + r * .45); x.stroke();
    x.fillStyle = COL.white; x.globalAlpha = .4; for (let k = 0; k < 6; k++) { x.beginPath(); x.arc(c + Math.cos(k * 2.1) * r * .6, cy - r * .5 + Math.sin(k * 2.1) * r * .3, r * .06, 0, TAU); x.fill(); }
  }, F);
  regCreature('owl', 36, (x, c, cy, r) => {
    x.beginPath(); x.ellipse(c, cy + r * .1, r * .62, r * .82, 0, 0, TAU); x.fill();
    for (const sd of [-1, 1]) { x.beginPath(); x.moveTo(c + sd * r * .25, cy - r * .55); x.lineTo(c + sd * r * .55, cy - r * 1.02); x.lineTo(c + sd * r * .58, cy - r * .42); x.fill(); x.beginPath(); x.ellipse(c + sd * r * .72, cy + r * .2, r * .3, r * .62, sd * .35, 0, TAU); x.fill(); }
  }, (x, c, cy, r) => {
    x.fillStyle = COL.yellow; x.beginPath(); x.arc(c - r * .25, cy - r * .2, r * .24, 0, TAU); x.arc(c + r * .25, cy - r * .2, r * .24, 0, TAU); x.fill();
    x.fillStyle = COL.deep; x.beginPath(); x.arc(c - r * .25, cy - r * .2, r * .11, 0, TAU); x.arc(c + r * .25, cy - r * .2, r * .11, 0, TAU); x.fill();
    x.fillStyle = COL.pink; x.beginPath(); x.moveTo(c - r * .08, cy + r * .02); x.lineTo(c, cy + r * .2); x.lineTo(c + r * .08, cy + r * .02); x.fill();
    x.strokeStyle = COL.white; x.globalAlpha = .45; x.lineWidth = 1.5; for (let k = 0; k < 3; k++) { x.beginPath(); x.arc(c, cy + r * (.38 + k * .16), r * .18, .4, Math.PI - .4); x.stroke(); }
  }, F);
  regCreature('bloom', 42, (x, c, cy, r) => {
    for (let k = 0; k < 7; k++) { const a = k / 7 * TAU; x.beginPath(); x.ellipse(c + Math.cos(a) * r * .55, cy + Math.sin(a) * r * .55, r * .42, r * .26, a, 0, TAU); x.fill(); }
    x.beginPath(); x.arc(c, cy, r * .45, 0, TAU); x.fill();
  }, (x, c, cy, r) => {
    x.fillStyle = COL.white; x.beginPath(); x.arc(c, cy, r * .3, 0, TAU); x.fill();
    x.fillStyle = COL.pink; x.beginPath(); x.arc(c, cy + r * .05, r * .18, 0, TAU); x.fill();
    x.fillStyle = COL.deep; x.beginPath(); x.arc(c, cy + r * .06, r * .08, 0, TAU); x.fill();
    x.fillStyle = COL.white; x.globalAlpha = .55; for (let k = 0; k < 7; k++) { const a = k / 7 * TAU + .3; x.beginPath(); x.arc(c + Math.cos(a) * r * .72, cy + Math.sin(a) * r * .72, r * .05, 0, TAU); x.fill(); }
  }, F);
  regCreature('grove', 58, (x, c, cy, r) => {
    heartPath(x, c, cy + r * .1, r * .72); x.fill();
    x.lineWidth = r * .1; x.lineCap = 'round';
    for (const sd of [-1, 1]) { x.beginPath(); x.moveTo(c + sd * r * .3, cy - r * .35); x.lineTo(c + sd * r * .55, cy - r * .9); x.moveTo(c + sd * r * .45, cy - r * .65); x.lineTo(c + sd * r * .85, cy - r * .78); x.moveTo(c + sd * r * .2, cy + r * .6); x.quadraticCurveTo(c + sd * r * .6, cy + r * .8, c + sd * r * .9, cy + r * .7); x.stroke(); }
  }, (x, c, cy, r) => {
    eyes(x, [[c - r * .25, cy - r * .02], [c + r * .25, cy - r * .02], [c, cy + r * .28]], r * .1, r * .05, .2);
    x.strokeStyle = COL.white; x.globalAlpha = .5; x.lineWidth = 2; x.beginPath(); x.moveTo(c, cy - r * .3); x.lineTo(c - r * .1, cy - r * .12); x.lineTo(c + r * .05, cy); x.stroke();
  }, F);
  // salt
  regCreature('golem', 46, (x, c, cy, r) => {
    x.beginPath(); x.moveTo(c, cy - r * .9); x.lineTo(c + r * .5, cy - r * .5); x.lineTo(c + r * .55, cy + r * .7); x.lineTo(c, cy + r * .95); x.lineTo(c - r * .55, cy + r * .7); x.lineTo(c - r * .5, cy - r * .5); x.closePath(); x.fill();
    for (const sd of [-1, 1]) { x.beginPath(); x.moveTo(c + sd * r * .45, cy - r * .2); x.lineTo(c + sd * r * .98, cy - r * .55); x.lineTo(c + sd * r * .82, cy + r * .2); x.closePath(); x.fill(); }
  }, (x, c, cy, r) => {
    x.fillStyle = COL.white; x.beginPath(); x.rect(c - r * .32, cy - r * .2, r * .22, r * .07); x.rect(c + r * .1, cy - r * .2, r * .22, r * .07); x.fill();
    x.strokeStyle = COL.white; x.globalAlpha = .5; x.lineWidth = 1.5; x.beginPath(); x.moveTo(c, cy - r * .9); x.lineTo(c, cy + r * .95); x.moveTo(c - r * .5, cy - r * .5); x.lineTo(c, cy - r * .1); x.lineTo(c + r * .5, cy - r * .5); x.stroke();
  }, S);
  regCreature('vulture', 36, (x, c, cy, r) => {
    for (const sd of [-1, 1]) { x.beginPath(); x.moveTo(c + sd * r * .2, cy - r * .1); x.lineTo(c + sd * r * 1.05, cy - r * .55); x.lineTo(c + sd * r * .95, cy - r * .2); x.lineTo(c + sd * r * .8, cy); x.lineTo(c + sd * r * .62, cy + r * .1); x.lineTo(c + sd * r * .25, cy + r * .4); x.closePath(); x.fill(); }
    x.beginPath(); x.ellipse(c, cy + r * .2, r * .32, r * .55, 0, 0, TAU); x.fill(); x.beginPath(); x.arc(c, cy - r * .48, r * .25, 0, TAU); x.fill();
  }, (x, c, cy, r) => {
    x.fillStyle = COL.white; x.beginPath(); x.arc(c, cy - r * .5, r * .2, 0, TAU); x.fill();
    x.fillStyle = COL.deep; x.beginPath(); x.arc(c - r * .08, cy - r * .53, r * .06, 0, TAU); x.arc(c + r * .08, cy - r * .53, r * .06, 0, TAU); x.fill();
    x.fillStyle = COL.yellow; x.beginPath(); x.moveTo(c - r * .06, cy - r * .38); x.lineTo(c, cy - r * .22); x.lineTo(c + r * .06, cy - r * .38); x.fill();
  }, S);
  regCreature('mirage', 42, (x, c, cy, r, i) => {
    for (let k = 0; k < 3; k++) { x.globalAlpha = .55 + k * .2; x.beginPath(); x.ellipse(c + (k - 1) * r * .18, cy + (k - 1) * r * .05, r * (.8 - k * .12), r * (.66 - k * .1), 0, 0, TAU); x.fill(); }
    x.globalAlpha = 1;
  }, (x, c, cy, r) => {
    eyes(x, [[c, cy]], r * .26, r * .14, 0);
    x.strokeStyle = COL.white; x.globalAlpha = .55; x.lineWidth = 1.6; for (let k = 0; k < 4; k++) { x.beginPath(); for (let i = 0; i <= 8; i++) { const px = c - r * .7 + i * r * .175, py = cy + r * (.38 + k * .12) + Math.sin(i * 1.4 + k) * 2.5; i ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke(); }
  }, S);
  regCreature('sandking', 58, (x, c, cy, r) => {
    x.beginPath(); x.arc(c, cy + r * .12, r * .78, 0, TAU); x.fill();
    x.beginPath(); for (let k = 0; k < 5; k++) { const px = c - r * .6 + k * r * .3; x.moveTo(px - r * .13, cy - r * .5); x.lineTo(px, cy - r * (k % 2 ? .85 : 1.02)); x.lineTo(px + r * .13, cy - r * .5); } x.fill();
    for (const sd of [-1, 1]) { x.beginPath(); x.moveTo(c + sd * r * .3, cy + r * .75); x.quadraticCurveTo(c + sd * r * .55, cy + r * 1.05, c + sd * r * .1, cy + r * .98); x.fill(); }
  }, (x, c, cy, r) => {
    eyes(x, two(c, cy, r, .3, 0), r * .14, r * .07, .2);
    x.fillStyle = COL.deep; x.beginPath(); x.ellipse(c, cy + r * .4, r * .38, r * .16, 0, 0, TAU); x.fill();
    x.fillStyle = COL.white; x.beginPath(); for (let k = 0; k < 5; k++) { const px = c - r * .3 + k * r * .15; x.moveTo(px, cy + r * .28); x.lineTo(px + r * .06, cy + r * .4); x.lineTo(px + r * .12, cy + r * .28); } x.fill();
    x.fillStyle = COL.pink; x.beginPath(); x.arc(c, cy - r * .62, r * .07, 0, TAU); x.fill();
  }, S);
  // harbor
  regCreature('iceberg', 46, (x, c, cy, r) => {
    const pts = [[0, -1], [.45, -.6], [.6, -.75], [.95, .05], [.75, .7], [.2, .95], [-.4, .85], [-.9, .4], [-.8, -.3], [-.35, -.55]];
    x.beginPath(); pts.forEach(([px, py], i) => i ? x.lineTo(c + px * r, cy + py * r) : x.moveTo(c + px * r, cy + py * r)); x.closePath(); x.fill();
  }, (x, c, cy, r) => {
    x.strokeStyle = COL.white; x.globalAlpha = .65; x.lineWidth = 2; x.beginPath(); x.moveTo(c - r * .2, cy - r * .9); x.lineTo(c - r * .05, cy - r * .4); x.lineTo(c - r * .35, cy); x.moveTo(c + r * .45, cy - r * .55); x.lineTo(c + r * .3, cy - r * .2); x.stroke(); x.globalAlpha = 1;
    eyes(x, two(c, cy + r * .25, r, .28, 0), r * .14, r * .07, .2);
  }, Hb);
  regCreature('orca', 36, (x, c, cy, r) => {
    x.beginPath(); x.ellipse(c, cy + r * .1, r * .9, r * .55, 0, 0, TAU); x.fill();
    x.beginPath(); x.moveTo(c - r * .1, cy - r * .35); x.lineTo(c + r * .1, cy - r * 1.02); x.lineTo(c + r * .35, cy - r * .35); x.fill();
    x.beginPath(); x.moveTo(c - r * .8, cy + r * .1); x.lineTo(c - r * 1.08, cy - r * .3); x.lineTo(c - r * 1.08, cy + r * .5); x.fill();
  }, (x, c, cy, r) => {
    x.fillStyle = COL.white; x.beginPath(); x.ellipse(c + r * .45, cy - r * .02, r * .2, r * .1, -.3, 0, TAU); x.fill(); x.beginPath(); x.ellipse(c + r * .1, cy + r * .42, r * .5, r * .14, 0, 0, TAU); x.fill();
    x.fillStyle = COL.deep; x.beginPath(); x.arc(c + r * .5, cy - r * .02, r * .06, 0, TAU); x.fill();
  }, Hb);
  regCreature('lighthouse', 42, (x, c, cy, r) => {
    x.beginPath(); x.moveTo(c - r * .45, cy + r * .95); x.lineTo(c - r * .28, cy - r * .45); x.lineTo(c + r * .28, cy - r * .45); x.lineTo(c + r * .45, cy + r * .95); x.closePath(); x.fill();
    x.beginPath(); x.roundRect(c - r * .38, cy - r * .85, r * .76, r * .45, r * .08); x.fill();
    x.beginPath(); x.moveTo(c - r * .42, cy - r * .85); x.lineTo(c, cy - r * 1.08); x.lineTo(c + r * .42, cy - r * .85); x.fill();
  }, (x, c, cy, r) => {
    x.fillStyle = COL.yellow; x.beginPath(); x.ellipse(c, cy - r * .63, r * .26, r * .17, 0, 0, TAU); x.fill();
    x.fillStyle = COL.deep; x.beginPath(); x.arc(c, cy - r * .63, r * .08, 0, TAU); x.fill();
    x.fillStyle = COL.white; x.globalAlpha = .7; x.fillRect(c - r * .33, cy, r * .66, r * .14); x.fillRect(c - r * .38, cy + r * .45, r * .76, r * .14);
  }, Hb);
  regCreature('leviathan', 58, (x, c, cy, r) => {
    x.lineWidth = r * .36; x.lineCap = 'round'; x.beginPath(); x.arc(c, cy + r * .1, r * .6, .5, TAU - .2); x.stroke();
    x.beginPath(); x.ellipse(c + r * .55, cy - r * .2, r * .38, r * .3, -.4, 0, TAU); x.fill();
    for (let k = 0; k < 5; k++) { const a = 1 + k * .9; x.beginPath(); x.moveTo(c + Math.cos(a) * r * .75, cy + r * .1 + Math.sin(a) * r * .75); x.lineTo(c + Math.cos(a) * r * 1.02, cy + r * .1 + Math.sin(a) * r * 1.02); x.lineTo(c + Math.cos(a + .2) * r * .78, cy + r * .1 + Math.sin(a + .2) * r * .78); x.fill(); }
  }, (x, c, cy, r) => {
    eyes(x, two(c + r * .58, cy - r * .3, r, .14, 0), r * .09, r * .05, .2);
    x.fillStyle = COL.white; x.beginPath(); for (let k = 0; k < 4; k++) { const px = c + r * .4 + k * r * .09; x.moveTo(px, cy - r * .05); x.lineTo(px + r * .04, cy + r * .08); x.lineTo(px + r * .08, cy - r * .05); } x.fill();
  }, Hb);
  // the tear in the sky
  regCreature('pagegiant', 46, (x, c, cy, r) => {
    x.save(); x.translate(c, cy); x.rotate(-.12); x.beginPath(); x.moveTo(-r * .7, -r * .9); x.lineTo(r * .7, -r * .9); x.lineTo(r * .7, r * .3);
    for (let k = 0; k < 7; k++) x.lineTo(r * .7 - k * r * .2 - r * .1, r * (k % 2 ? .55 : .85)); x.lineTo(-r * .7, r * .6); x.closePath(); x.fill(); x.restore();
  }, (x, c, cy, r) => {
    x.save(); x.translate(c, cy); x.rotate(-.12); x.fillStyle = COL.white; x.globalAlpha = .55; for (let k = 0; k < 4; k++) x.fillRect(-r * .5, -r * .7 + k * r * .14, r * (k % 2 ? .7 : 1), r * .05); x.restore();
    eyes(x, two(c, cy + r * .15, r, .25, 0), r * .14, r * .07, .2);
  }, T);
  regCreature('quill', 36, (x, c, cy, r) => {
    x.save(); x.translate(c, cy); x.rotate(-.7); x.beginPath(); x.ellipse(0, -r * .15, r * .36, r * .85, 0, 0, TAU); x.fill(); x.beginPath(); x.moveTo(-r * .1, r * .6); x.lineTo(0, r * 1.05); x.lineTo(r * .1, r * .6); x.fill(); x.restore();
  }, (x, c, cy, r) => {
    x.save(); x.translate(c, cy); x.rotate(-.7); x.strokeStyle = COL.white; x.globalAlpha = .55; x.lineWidth = 1.5; x.beginPath(); x.moveTo(0, -r * .95); x.lineTo(0, r * .6); for (let k = 0; k < 5; k++) { x.moveTo(0, -r * .7 + k * r * .25); x.lineTo(-r * .3, -r * .85 + k * r * .25); x.moveTo(0, -r * .7 + k * r * .25); x.lineTo(r * .3, -r * .85 + k * r * .25); } x.stroke(); x.restore();
    eyes(x, [[c - r * .05, cy - r * .05]], r * .16, r * .08);
  }, T);
  regCreature('stamp', 42, (x, c, cy, r) => {
    x.beginPath(); x.arc(c, cy - r * .62, r * .32, 0, TAU); x.fill();
    x.beginPath(); x.roundRect(c - r * .14, cy - r * .4, r * .28, r * .4, r * .05); x.fill();
    x.beginPath(); x.roundRect(c - r * .78, cy - r * .05, r * 1.56, r * .9, r * .12); x.fill();
  }, (x, c, cy, r) => {
    eyes(x, two(c, cy + r * .32, r, .3, 0), r * .15, r * .08, .1);
    x.fillStyle = COL.pink; x.fillRect(c - r * .78, cy + r * .72, r * 1.56, r * .13);
  }, T);
  regCreature('author', 58, (x, c, cy, r) => {
    x.beginPath(); x.roundRect(c - r * .55, cy - r * .2, r * 1.1, r * 1.02, r * .3); x.fill();
    for (let k = 0; k < 4; k++) { const fx = c - r * .48 + k * r * .32, h = [.62, .82, .78, .6][k]; x.beginPath(); x.roundRect(fx, cy - r * .2 - r * h, r * .26, r * h + r * .1, r * .13); x.fill(); }
    x.save(); x.translate(c - r * .55, cy + r * .2); x.rotate(-.7); x.beginPath(); x.roundRect(-r * .55, -r * .13, r * .6, r * .26, r * .13); x.fill(); x.restore();
  }, (x, c, cy, r) => {
    x.fillStyle = COL.white; x.beginPath(); x.ellipse(c, cy + r * .3, r * .3, r * .2, 0, 0, TAU); x.fill();
    x.fillStyle = COL.pink; x.beginPath(); x.arc(c, cy + r * .3, r * .13, 0, TAU); x.fill();
    x.fillStyle = COL.deep; x.beginPath(); x.ellipse(c, cy + r * .3, r * .04, r * .12, 0, 0, TAU); x.fill();
    x.fillStyle = COL.white; x.globalAlpha = .55; for (let k = 0; k < 4; k++) { const fx = c - r * .48 + k * r * .32; x.fillRect(fx + r * .05, cy - r * .2 - r * [.62, .82, .78, .6][k] + r * .08, r * .16, r * .08); }
  }, T);
}

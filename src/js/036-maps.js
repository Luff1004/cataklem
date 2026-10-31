/* ================= maps: five places to spend the night, each with its own things ================= */
/* a map swaps each role in the waves (blob, moth, spitter, splitter, mini, bomber, brute) for its own creature */
const MAPS = [null,
  { id: 'town', name: '무너진 마을', sub: '두 번째 달이 떨어진 자리',
    desc: '처음 나가는 밤. 적이 아직 덜 사납다.', sub2: {},
    txt: { swarm: ['나방 떼', '무리가 지나간다'], bomb: ['불붙은 것들', '가까이 오면 터진다'], brute: ['무거운 발소리', '뿔 달린 것들이 둘러싼다'], split: ['포위', '갈라지는 것들'] } },
  { id: 'forest', name: '잠긴 숲', sub: '물에 잠긴 채 자라는 나무들',
    desc: '가시덤불이 세 갈래로 쏘고, 뿔 사슴은 숨을 고른 뒤 들이받는다.',
    sub2: { blob: 'spore', moth: 'wisp', spitter: 'thorn', splitter: 'stump', mini: 'sprig', bomber: 'puff', brute: 'stag' },
    txt: { swarm: ['도깨비불', '숲이 깜빡인다'], bomb: ['부푼 버섯', '건드리면 터진다'], brute: ['뿔 사슴', '숨을 고르고 달려든다'], split: ['포위', '쪼개지는 그루터기'] } },
  { id: 'salt', name: '소금 사막', sub: '바다가 마르고 남은 흰 땅',
    desc: '땅 밑을 기는 것이 발밑에서 터지고, 전갈은 무거운 침을 던진다.',
    sub2: { blob: 'grub', moth: 'gnat', spitter: 'scorp', splitter: 'beetle', mini: 'beetlet', bomber: 'burrow', brute: 'ram' },
    txt: { swarm: ['날벌레 떼', '모래바람처럼 몰려온다'], bomb: ['땅 밑의 것', '발밑이 꿈틀거린다'], brute: ['숫양 떼', '물러서지 않고 들이받는다'], split: ['포위', '딱정벌레가 갈라진다'] } },
  { id: 'harbor', name: '얼어붙은 항구', sub: '배가 얼음에 박힌 채 멈춘 곳',
    desc: '갈매기가 빙빙 돌다 내리꽂고, 잠수부는 사방으로 얼음을 뿌린다.',
    sub2: { blob: 'slush', moth: 'gull', spitter: 'diver', splitter: 'floe', mini: 'chip', bomber: 'mine', brute: 'walrus' },
    txt: { swarm: ['갈매기 떼', '빙빙 돌다 내리꽂는다'], bomb: ['떠내려온 기뢰', '가까이 가지 마라'], brute: ['바다코끼리', '얼음 위를 미끄러져 온다'], split: ['포위', '부서지는 유빙'] } },
  { id: 'tear', name: '하늘 틈', sub: '종이가 찢어진 하늘 바로 아래',
    desc: '얼룩이 눈앞에 나타나 터지고, 글자는 쉬지 않고 탄을 돌린다.',
    sub2: { blob: 'smudge', moth: 'scrap', spitter: 'glyph', splitter: 'inkpot', mini: 'drip', bomber: 'blink', brute: 'eraser' },
    txt: { swarm: ['종잇조각', '바람에 실려 베어 온다'], bomb: ['번지는 얼룩', '눈앞에 나타나 터진다'], brute: ['지우개', '지나간 자리가 지워진다'], split: ['포위', '잉크가 흘러넘친다'] } },
];
const curMap = () => MAPS[(G && G.rift) || SAVE.rift] || MAPS[1];
const MT = k => curMap().txt[k];

ENEMY.moth.flap = true; ENEMY.splitter.split = 'mini'; ENEMY.bomber.blast = true;
const ROLE = { blob: ENEMY.blob, moth: ENEMY.moth, spitter: ENEMY.spitter, splitter: ENEMY.splitter, mini: ENEMY.mini, bomber: ENEMY.bomber, brute: ENEMY.brute };
const mob = (role, o) => Object.assign({}, ROLE[role], { flap: false, split: undefined, blast: undefined }, o);
Object.assign(ENEMY, {
  spore: mob('blob', { hp: 11, spd: 48 }),
  wisp: mob('moth', { spd: 110, hp: 4 }),
  thorn: mob('spitter', { ai: 'fan', hp: 18 }),
  stump: mob('splitter', { hp: 32, spd: 36, split: 'sprig' }),
  sprig: mob('mini', {}),
  puff: mob('bomber', { blast: true, blastR: 84, spd: 70 }),
  stag: mob('brute', { ai: 'charge', hp: 54, spd: 40 }),

  grub: mob('blob', { spd: 58, hp: 8 }),
  gnat: mob('moth', { r: 8, hp: 3, spd: 132, dmg: 3, flap: true }),
  scorp: mob('spitter', { ai: 'lob', hp: 20 }),
  beetle: mob('splitter', { hp: 34, split: 'beetlet' }),
  beetlet: mob('mini', { spd: 90 }),
  burrow: mob('bomber', { ai: 'burrow', blast: true, blastR: 70, spd: 92 }),
  ram: mob('brute', { ai: 'charge', hp: 50, spd: 44, chargeMul: 8 }),

  slush: mob('blob', { hp: 12, spd: 46 }),
  gull: mob('moth', { ai: 'dive', spd: 96, flap: true }),
  diver: mob('spitter', { ai: 'ring', hp: 20 }),
  floe: mob('splitter', { hp: 36, spd: 34, split: 'chip' }),
  chip: mob('mini', {}),
  mine: mob('bomber', { ai: 'mine', r: 14, hp: 18, spd: 38, blast: true, blastR: 100 }),
  walrus: mob('brute', { ai: 'charge', r: 24, hp: 72, spd: 32, chargeMul: 6 }),

  smudge: mob('blob', { hp: 11, spd: 56 }),
  scrap: mob('moth', { ai: 'dive', spd: 104 }),
  glyph: mob('spitter', { ai: 'spiral', hp: 22 }),
  inkpot: mob('splitter', { hp: 36, split: 'drip' }),
  drip: mob('mini', { spd: 92 }),
  blink: mob('bomber', { ai: 'blink', blast: true, blastR: 74, spd: 50 }),
  eraser: mob('brute', { ai: 'charge', hp: 64, spd: 40, chargeMul: 7.5 }),
});

/* ---------- how the new things move ---------- */
function strafe(e, ux, uy, dist, far, near) {
  const s = dist > far ? 1 : dist < near ? -.7 : 0;
  return [(ux * s - uy * .45 * e.side) * e.spd, (uy * s + ux * .45 * e.side) * e.spd];
}
const MAP_AI = {
  fan(e, dt, ux, uy, dist) {
    e.cd -= dt;
    if (e.cd <= 0 && dist < 440 && STATE === 'play') { e.cd = rnd(2.8, 3.5); const a = Math.atan2(uy, ux); for (let k = -1; k <= 1; k++) fireEB(e.x, e.y, a + k * .24, 122, 8, false); SFX.spit(); e.flash = .07; }
    return strafe(e, ux, uy, dist, 230, 160);
  },
  lob(e, dt, ux, uy, dist) {
    e.cd -= dt;
    if (e.cd <= 0 && dist < 460 && STATE === 'play') { e.cd = rnd(3, 3.8); fireEB(e.x, e.y, Math.atan2(uy, ux), 92, 14, true); SFX.spit(); e.flash = .1; }
    return strafe(e, ux, uy, dist, 250, 180);
  },
  ring(e, dt, ux, uy, dist) {
    e.cd -= dt;
    if (e.cd <= 0 && dist < 380 && STATE === 'play') { e.cd = rnd(3.2, 4); const o = rnd(TAU); for (let k = 0; k < 6; k++) fireEB(e.x, e.y, o + k / 6 * TAU, 108, 7, false); SFX.spit(); e.flash = .1; }
    return strafe(e, ux, uy, dist, 200, 140);
  },
  spiral(e, dt, ux, uy, dist) {
    e.cd -= dt;
    if (e.cd <= 0 && dist < 400 && STATE === 'play') {
      e.burst = (e.burst || 0) + 1;
      if (e.burst % 6 === 0) e.cd = rnd(3.2, 4.2);
      else { e.cd = .3; const a = e.t * 2.4; fireEB(e.x, e.y, a, 98, 6, false); fireEB(e.x, e.y, a + Math.PI, 98, 6, false); if (gate('spir', 120)) SFX.spit(); }
    }
    return strafe(e, ux, uy, dist, 220, 160);
  },
  charge(e, dt, ux, uy, dist) {
    if (e.chg > 0) {
      e.chg -= dt; e.flash = e.chg % .16 < .08 ? .05 : 0;
      if (e.chg <= 0) { e.dashT = .5; SFX.dash(); }
      return [-Math.cos(e.dA) * 12, -Math.sin(e.dA) * 12];
    }
    if (e.dashT > 0) {
      e.dashT -= dt; const sp = e.spd * (ENEMY[e.type].chargeMul || 7);
      if (Math.random() < dt * 30) PT.push({ x: e.x, y: e.y + e.r * .6, vx: rnd(-30, 30), vy: rnd(-30, 0), life: .35, max: .35, s: rnd(2, 4), c: COL.ink, dead: false });
      return [Math.cos(e.dA) * sp, Math.sin(e.dA) * sp];
    }
    e.cd -= dt;
    if (e.cd <= 0 && dist < 320 && STATE === 'play') { e.cd = rnd(3.2, 4.6); e.chg = .7; e.dA = Math.atan2(uy, ux); }
    return [ux * e.spd, uy * e.spd];
  },
  dive(e, dt, ux, uy, dist) {
    if (e.dashT > 0) { e.dashT -= dt; return [Math.cos(e.dA) * e.spd * 3.3, Math.sin(e.dA) * e.spd * 3.3]; }
    e.cd -= dt;
    if (e.cd <= 0 && dist < 250 && STATE === 'play') { e.cd = rnd(2.2, 3.2); e.dashT = .55; e.dA = Math.atan2(uy, ux); e.flash = .08; }
    const want = dist > 170 ? 1 : -.35;
    return [(ux * want - uy * e.side * 1.1) * e.spd, (uy * want + ux * e.side * 1.1) * e.spd];
  },
  burrow(e, dt, ux, uy, dist) {
    if (e.fuse > 0) { e.fuse -= dt; if (e.fuse <= 0) { bomberBlast(e, false); return null; } return [0, 0]; }
    e.under = 1;
    if (dist < 34 && STATE === 'play') { e.under = 0; e.fuse = .75; e.flash = .1; burst(e.x, e.y, 10, COL.ink, 180); SFX.thud(); }
    return [ux * e.spd * 1.25, uy * e.spd * 1.25];
  },
  mine(e, dt, ux, uy, dist) {
    if (e.fuse > 0) { e.fuse -= dt; if (e.fuse <= 0) { bomberBlast(e, false); return null; } return [0, 0]; }
    if (dist < e.r + P.r + 40 && STATE === 'play') { e.fuse = .9; SFX.tick(); }
    const bob = Math.sin(e.t * 1.6 + e.ph) * .6;
    return [(ux - uy * bob) * e.spd, (uy + ux * bob) * e.spd];
  },
  blink(e, dt, ux, uy, dist) {
    if (e.fuse > 0) { e.fuse -= dt; if (e.fuse <= 0) { bomberBlast(e, false); return null; } return [0, 0]; }
    e.cd -= dt;
    if (e.cd <= 0 && dist < 420 && STATE === 'play') {
      e.cd = 99; burst(e.x, e.y, 10, COL.deep, 200);
      const a = rnd(TAU), r = rnd(60, 95); e.x = P.x + Math.cos(a) * r; e.y = P.y + Math.sin(a) * r;
      burst(e.x, e.y, 14, COL.pink, 220); e.fuse = .85; e.flash = .15; SFX.vortex();
      return [0, 0];
    }
    return [ux * e.spd, uy * e.spd];
  },
};

/* ---------- the new things, printed ---------- */
const MAP_PLATES = {
  forest: [{ col: COL.teal, dx: 1.5, dy: 1.1 }, { col: COL.ink, dx: 0, dy: 0 }],
  salt: [{ col: COL.yellow, dx: 1.6, dy: 1.2 }, { col: COL.ink, dx: 0, dy: 0 }],
  harbor: [{ col: '#7CC6D8', dx: 1.5, dy: 1.1 }, { col: COL.ink, dx: 0, dy: 0 }],
  tear: [{ col: COL.yellow, dx: -1.2, dy: .7 }, { col: COL.pink, dx: 1.4, dy: 1 }, { col: COL.deep, dx: 0, dy: 0 }],
};
function buildMapArt() {
  const F = { plates: MAP_PLATES.forest }, S = { plates: MAP_PLATES.salt }, Hb = { plates: MAP_PLATES.harbor }, T = { plates: MAP_PLATES.tear };
  const two = (c, cy, r, sp = .34, h = -.12) => [[c - r * sp, cy + r * h], [c + r * sp, cy + r * h]];
  // forest
  regCreature('spore', 13, (x, c, cy, r) => { x.beginPath(); x.ellipse(c, cy - r * .25, r, r * .62, 0, Math.PI, TAU); x.closePath(); x.fill(); x.beginPath(); x.roundRect(c - r * .42, cy - r * .3, r * .84, r * 1.1, r * .3); x.fill(); },
    (x, c, cy, r) => { eyes(x, two(c, cy + r * .3, r, .2, 0), r * .16, r * .08); x.fillStyle = COL.white; x.globalAlpha = .7; x.beginPath(); x.arc(c - r * .45, cy - r * .5, r * .13, 0, TAU); x.arc(c + r * .3, cy - r * .62, r * .1, 0, TAU); x.fill(); }, F);
  regCreature('wisp', 11, (x, c, cy, r) => { flamePath(x, c, cy + r * .2, r * .8); x.fill(); }, (x, c, cy, r) => eyes(x, [[c, cy + r * .2]], r * .26, r * .13), F);
  regCreature('thorn', 14, (x, c, cy, r) => { star(x, c, cy, 8, r, r * .58); x.fill(); }, (x, c, cy, r) => eyes(x, [[c, cy]], r * .3, r * .15, .1), F);
  regCreature('stump', 18, (x, c, cy, r) => { x.beginPath(); x.roundRect(c - r * .85, cy - r * .5, r * 1.7, r * 1.35, r * .25); x.fill(); x.beginPath(); x.ellipse(c, cy - r * .5, r * .85, r * .35, 0, 0, TAU); x.fill(); x.beginPath(); x.moveTo(c - r * .85, cy + r * .7); x.lineTo(c - r * 1.05, cy + r * .9); x.lineTo(c - r * .55, cy + r * .85); x.fill(); },
    (x, c, cy, r) => { x.strokeStyle = COL.white; x.globalAlpha = .55; x.lineWidth = 1.2; x.beginPath(); x.ellipse(c, cy - r * .5, r * .55, r * .2, 0, 0, TAU); x.moveTo(c + r * .25, cy - r * .5); x.ellipse(c, cy - r * .5, r * .25, r * .09, 0, 0, TAU); x.stroke(); x.globalAlpha = 1; eyes(x, two(c, cy + r * .2, r, .32, 0), r * .14, r * .07); }, F);
  regCreature('sprig', 9, (x, c, cy, r) => { x.beginPath(); x.ellipse(c, cy, r * .65, r, .5, 0, TAU); x.fill(); }, (x, c, cy, r) => eyes(x, [[c, cy]], r * .3, r * .14), F);
  regCreature('puff', 12, (x, c, cy, r) => { x.beginPath(); for (let k = 0; k < 7; k++) { const a = k / 7 * TAU; x.moveTo(c + Math.cos(a) * r * .55 + r * .38, cy + Math.sin(a) * r * .55); x.arc(c + Math.cos(a) * r * .55, cy + Math.sin(a) * r * .55, r * .38, 0, TAU); } x.fill(); x.beginPath(); x.arc(c, cy, r * .62, 0, TAU); x.fill(); },
    (x, c, cy, r) => { eyes(x, two(c, cy, r, .3, 0), r * .19, r * .1, .2); x.fillStyle = COL.white; x.globalAlpha = .6; for (let k = 0; k < 4; k++) { x.beginPath(); x.arc(c + Math.cos(k * 1.7) * r * .7, cy + Math.sin(k * 1.7) * r * .7, 1.3, 0, TAU); x.fill(); } }, F);
  regCreature('stag', 22, (x, c, cy, r) => {
    x.beginPath(); x.ellipse(c, cy + r * .2, r * .9, r * .65, 0, 0, TAU); x.fill();
    x.lineWidth = r * .14; x.lineCap = 'round';
    for (const sd of [-1, 1]) { x.beginPath(); x.moveTo(c + sd * r * .35, cy - r * .3); x.lineTo(c + sd * r * .6, cy - r * .95); x.moveTo(c + sd * r * .5, cy - r * .7); x.lineTo(c + sd * r * .95, cy - r * .85); x.moveTo(c + sd * r * .58, cy - r * .92); x.lineTo(c + sd * r * .4, cy - r * 1.1); x.stroke(); }
  }, (x, c, cy, r) => eyes(x, two(c, cy, r, .32, 0), r * .14, r * .08, .2), F);
  // salt
  regCreature('grub', 13, (x, c, cy, r) => { x.beginPath(); x.arc(c - r * .55, cy + r * .2, r * .48, 0, TAU); x.arc(c, cy + r * .1, r * .58, 0, TAU); x.arc(c + r * .5, cy - r * .05, r * .62, 0, TAU); x.fill(); },
    (x, c, cy, r) => eyes(x, two(c + r * .5, cy - r * .1, r, .2, 0), r * .15, r * .08), S);
  regCreature('gnat', 8, (x, c, cy, r) => { x.beginPath(); x.ellipse(c - r * .6, cy - r * .3, r * .6, r * .4, -.4, 0, TAU); x.ellipse(c + r * .6, cy - r * .3, r * .6, r * .4, .4, 0, TAU); x.fill(); x.beginPath(); x.arc(c, cy + r * .1, r * .45, 0, TAU); x.fill(); },
    (x, c, cy, r) => eyes(x, [[c, cy + r * .1]], r * .26, r * .13), S);
  regCreature('scorp', 14, (x, c, cy, r) => {
    x.beginPath(); x.ellipse(c, cy + r * .25, r * .8, r * .55, 0, 0, TAU); x.fill();
    x.lineWidth = r * .26; x.lineCap = 'round'; x.beginPath(); x.moveTo(c + r * .4, cy + r * .1); x.quadraticCurveTo(c + r * 1.05, cy - r * .3, c + r * .5, cy - r * .85); x.stroke();
    x.beginPath(); x.moveTo(c + r * .5, cy - r * .85); x.lineTo(c + r * .15, cy - r * .7); x.lineTo(c + r * .35, cy - r * 1.05); x.fill();
    for (const sd of [-1, 1]) { x.beginPath(); x.arc(c - r * .55, cy + r * .25 + sd * r * .45, r * .22, 0, TAU); x.fill(); }
  }, (x, c, cy, r) => eyes(x, two(c - r * .1, cy + r * .2, r, .22, 0), r * .14, r * .08), S);
  regCreature('beetle', 18, (x, c, cy, r) => { x.beginPath(); x.ellipse(c, cy + r * .12, r * .82, r * .9, 0, 0, TAU); x.fill(); x.beginPath(); x.arc(c, cy - r * .72, r * .38, 0, TAU); x.fill(); },
    (x, c, cy, r) => { x.globalCompositeOperation = 'destination-out'; x.lineWidth = 2; x.beginPath(); x.moveTo(c, cy - r * .45); x.lineTo(c, cy + r); x.stroke(); x.globalCompositeOperation = 'source-over'; eyes(x, two(c, cy - r * .72, r, .17, 0), r * .12, r * .06); }, S);
  regCreature('beetlet', 9, (x, c, cy, r) => { x.beginPath(); x.ellipse(c, cy + r * .1, r * .8, r * .9, 0, 0, TAU); x.fill(); }, (x, c, cy, r) => eyes(x, two(c, cy - r * .25, r, .3, 0), r * .2, r * .1), S);
  regCreature('burrow', 13, (x, c, cy, r) => { x.beginPath(); x.arc(c, cy + r * .3, r, Math.PI, TAU); x.closePath(); x.fill(); for (const sd of [-1, 0, 1]) { x.beginPath(); x.moveTo(c + sd * r * .5 - r * .14, cy + r * .3); x.lineTo(c + sd * r * .62, cy + r * .85); x.lineTo(c + sd * r * .5 + r * .14, cy + r * .3); x.fill(); } },
    (x, c, cy, r) => eyes(x, two(c, cy - r * .05, r, .32, 0), r * .2, r * .1, .2), S);
  regCreature('ram', 22, (x, c, cy, r) => {
    x.beginPath(); x.roundRect(c - r * .85, cy - r * .55, r * 1.7, r * 1.4, r * .55); x.fill();
    x.lineWidth = r * .2; x.lineCap = 'round';
    for (const sd of [-1, 1]) { x.beginPath(); x.arc(c + sd * r * .72, cy - r * .35, r * .32, sd > 0 ? -Math.PI * .9 : -Math.PI * .1, sd > 0 ? Math.PI * .6 : Math.PI * 1.4, sd < 0); x.stroke(); }
  }, (x, c, cy, r) => eyes(x, two(c, cy + r * .05, r, .3, 0), r * .14, r * .08, .2), S);
  // harbor
  regCreature('slush', 13, (x, c, cy, r) => { blobPath(x, c, cy + 1, r, 57, 11, .16); x.fill(); },
    (x, c, cy, r) => { eyes(x, two(c, cy - r * .1, r, .3, 0), r * .2, r * .1); x.fillStyle = COL.white; x.globalAlpha = .7; x.fillRect(c - r * .6, cy - r * .7, 2, 2); x.fillRect(c + r * .4, cy - r * .55, 2, 2); x.fillRect(c - r * .1, cy + r * .55, 2, 2); }, Hb);
  regCreature('gull', 12, (x, c, cy, r) => { x.beginPath(); x.moveTo(c - r * 1.1, cy - r * .1); x.quadraticCurveTo(c - r * .5, cy - r * .75, c, cy); x.quadraticCurveTo(c + r * .5, cy - r * .75, c + r * 1.1, cy - r * .1); x.quadraticCurveTo(c + r * .5, cy - r * .2, c, cy + r * .45); x.quadraticCurveTo(c - r * .5, cy - r * .2, c - r * 1.1, cy - r * .1); x.fill(); },
    (x, c, cy, r) => { eyes(x, [[c, cy + r * .1]], r * .2, r * .1); x.fillStyle = COL.yellow; x.beginPath(); x.moveTo(c - r * .1, cy + r * .35); x.lineTo(c, cy + r * .6); x.lineTo(c + r * .1, cy + r * .35); x.fill(); }, Hb);
  regCreature('diver', 14, (x, c, cy, r) => { x.beginPath(); x.arc(c, cy + r * .1, r * .85, 0, TAU); x.fill(); x.beginPath(); x.roundRect(c + r * .55, cy - r * 1, r * .26, r * .9, r * .1); x.fill(); },
    (x, c, cy, r) => { x.fillStyle = COL.deep; x.beginPath(); x.ellipse(c, cy, r * .62, r * .4, 0, 0, TAU); x.fill(); eyes(x, two(c, cy, r, .27, 0), r * .2, r * .1, 0); }, Hb);
  regCreature('floe', 18, (x, c, cy, r) => { x.beginPath(); for (let k = 0; k < 6; k++) { const a = k / 6 * TAU + .3, rr = r * (k % 2 ? .95 : .82); k ? x.lineTo(c + Math.cos(a) * rr, cy + Math.sin(a) * rr) : x.moveTo(c + Math.cos(a) * rr, cy + Math.sin(a) * rr); } x.closePath(); x.fill(); },
    (x, c, cy, r) => { x.strokeStyle = COL.white; x.globalAlpha = .7; x.lineWidth = 1.4; x.beginPath(); x.moveTo(c - r * .7, cy - r * .5); x.lineTo(c - r * .2, cy - r * .1); x.lineTo(c + r * .1, cy - r * .55); x.stroke(); x.globalAlpha = 1; eyes(x, two(c, cy + r * .15, r, .32, 0), r * .14, r * .07); }, Hb);
  regCreature('chip', 9, (x, c, cy, r) => { x.beginPath(); x.moveTo(c, cy - r); x.lineTo(c + r, cy + r * .7); x.lineTo(c - r * .9, cy + r * .6); x.closePath(); x.fill(); }, (x, c, cy, r) => eyes(x, [[c, cy + r * .2]], r * .28, r * .13), Hb);
  regCreature('mine', 14, (x, c, cy, r) => { star(x, c, cy, 8, r, r * .66); x.fill(); x.beginPath(); x.arc(c, cy, r * .7, 0, TAU); x.fill(); },
    (x, c, cy, r) => { eyes(x, two(c, cy, r, .28, 0), r * .17, r * .09, .1); x.fillStyle = COL.pink; x.beginPath(); x.arc(c, cy - r * .48, r * .12, 0, TAU); x.fill(); }, Hb);
  regCreature('walrus', 24, (x, c, cy, r) => { x.beginPath(); x.ellipse(c, cy + r * .15, r * .95, r * .8, 0, 0, TAU); x.fill(); x.beginPath(); x.ellipse(c, cy - r * .35, r * .6, r * .5, 0, 0, TAU); x.fill(); },
    (x, c, cy, r) => { eyes(x, two(c, cy - r * .5, r, .24, 0), r * .11, r * .06); x.fillStyle = COL.white; for (const sd of [-1, 1]) { x.beginPath(); x.moveTo(c + sd * r * .28, cy - r * .12); x.lineTo(c + sd * r * .2, cy + r * .5); x.lineTo(c + sd * r * .1, cy - r * .1); x.fill(); } x.fillStyle = COL.deep; x.beginPath(); x.ellipse(c, cy - r * .2, r * .3, r * .14, 0, 0, TAU); x.fill(); }, Hb);
  // the tear in the sky
  regCreature('smudge', 13, (x, c, cy, r) => { blobPath(x, c, cy + 1, r, 91, 13, .22); x.fill(); },
    (x, c, cy, r) => eyes(x, [[c - r * .3, cy - r * .1], [c + r * .32, cy - r * .2]], r * .18, r * .09), T);
  regCreature('scrap', 11, (x, c, cy, r) => { x.save(); x.translate(c, cy); x.rotate(-.35); x.beginPath(); x.moveTo(-r * .8, -r); x.lineTo(r * .4, -r); x.lineTo(r * .8, -r * .55); x.lineTo(r * .8, r); x.lineTo(-r * .8, r); x.closePath(); x.fill(); x.restore(); },
    (x, c, cy, r) => { eyes(x, [[c, cy]], r * .28, r * .14); x.strokeStyle = COL.white; x.globalAlpha = .5; x.lineWidth = 1; x.beginPath(); x.moveTo(c - r * .5, cy + r * .45); x.lineTo(c + r * .5, cy + r * .25); x.stroke(); }, T);
  regCreature('glyph', 14, (x, c, cy, r) => { x.lineWidth = r * .42; x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath(); x.moveTo(c - r * .75, cy + r * .8); x.lineTo(c, cy - r * .85); x.lineTo(c + r * .75, cy + r * .8); x.moveTo(c - r * .4, cy + r * .2); x.lineTo(c + r * .4, cy + r * .2); x.stroke(); },
    (x, c, cy, r) => eyes(x, [[c, cy - r * .2]], r * .22, r * .11), T);
  regCreature('inkpot', 18, (x, c, cy, r) => { x.beginPath(); x.roundRect(c - r * .8, cy - r * .3, r * 1.6, r * 1.15, r * .3); x.fill(); x.beginPath(); x.roundRect(c - r * .35, cy - r * .85, r * .7, r * .6, r * .1); x.fill(); },
    (x, c, cy, r) => { eyes(x, two(c, cy + r * .2, r, .32, 0), r * .15, r * .08); x.fillStyle = COL.white; x.globalAlpha = .5; x.fillRect(c - r * .65, cy - r * .2, r * .14, r * .6); }, T);
  regCreature('drip', 9, (x, c, cy, r) => { flamePath(x, c, cy + r * .25, r * .75); x.fill(); }, (x, c, cy, r) => eyes(x, [[c, cy + r * .3]], r * .28, r * .13), T);
  regCreature('blink', 12, (x, c, cy, r) => { x.beginPath(); x.moveTo(c - r, cy); x.quadraticCurveTo(c, cy - r * 1.2, c + r, cy); x.quadraticCurveTo(c, cy + r * 1.2, c - r, cy); x.fill(); },
    (x, c, cy, r) => { x.fillStyle = COL.white; x.beginPath(); x.ellipse(c, cy, r * .55, r * .42, 0, 0, TAU); x.fill(); x.fillStyle = COL.pink; x.beginPath(); x.arc(c, cy, r * .32, 0, TAU); x.fill(); x.fillStyle = COL.deep; x.beginPath(); x.ellipse(c, cy, r * .09, r * .28, 0, 0, TAU); x.fill(); }, T);
  regCreature('eraser', 22, (x, c, cy, r) => { x.save(); x.translate(c, cy); x.rotate(-.2); x.beginPath(); x.roundRect(-r, -r * .6, r * 2, r * 1.2, r * .2); x.fill(); x.restore(); },
    (x, c, cy, r) => { x.save(); x.translate(c, cy); x.rotate(-.2); x.fillStyle = COL.white; x.globalAlpha = .75; x.fillRect(r * .25, -r * .6, r * .55, r * 1.2); x.restore(); eyes(x, two(c - r * .3, cy, r, .22, 0), r * .14, r * .07, .2); }, T);
}

/* ---------- the ground of each map ---------- */
const MAP_TILE = {};
function mapTile(id) {
  if (id === 'town') return TILE;
  if (MAP_TILE[id]) return MAP_TILE[id];
  const T = 512, [c, x] = mkc(T, T, 1.25), R = mulberry({ forest: 11, salt: 23, harbor: 37, tear: 51 }[id]);
  const base = { forest: '#D9E2D4', salt: '#ECE6D3', harbor: '#DCE4E7', tear: '#E4DDE4' }[id];
  const ink = 'rgba(37,53,111,', acc = { forest: 'rgba(10,138,134,', salt: 'rgba(214,160,20,', harbor: 'rgba(60,150,180,', tear: 'rgba(255,79,158,' }[id];
  x.fillStyle = base; x.fillRect(0, 0, T, T);
  for (let i = 0; i < 3200; i++) { x.fillStyle = R() < .55 ? ink + '.05)' : 'rgba(255,255,255,.4)'; x.fillRect(R() * T, R() * T, R() * 1.8 + .4, R() * 1.4 + .4); }
  const wrap = (px, py, fn) => { for (const ox of [-T, 0, T]) for (const oy of [-T, 0, T]) { x.save(); x.translate(px + ox, py + oy); fn(); x.restore(); } };
  x.fillStyle = ink + '.06)';
  for (let gy = 0; gy < T; gy += 16) for (let gx = 0; gx < T; gx += 16) { x.beginPath(); x.arc(gx + 8, gy + 8, 1.1, 0, TAU); x.fill(); }
  if (id === 'forest') {
    for (let k = 0; k < 4; k++) { const cx = R() * T, cy = R() * T, rx = 40 + R() * 40; wrap(cx, cy, () => { x.fillStyle = acc + '.14)'; x.beginPath(); x.ellipse(0, 0, rx, rx * .55, R(), 0, TAU); x.fill(); x.strokeStyle = acc + '.3)'; x.lineWidth = 1.4; x.beginPath(); x.ellipse(rx * .2, 0, rx * .5, rx * .22, 0, 0, TAU); x.stroke(); }); }
    for (let k = 0; k < 5; k++) { const sx = R() * T, sy = R() * T; wrap(sx, sy, () => { x.strokeStyle = ink + '.22)'; x.lineWidth = 2.2; x.lineCap = 'round'; let px = 0, py = 0, a = R() * TAU; x.beginPath(); x.moveTo(0, 0); for (let s = 0; s < 7; s++) { a += (R() - .5) * .9; px += Math.cos(a) * 16; py += Math.sin(a) * 16; x.lineTo(px, py); } x.stroke(); }); }
    for (let k = 0; k < 3; k++) { const px = R() * T, py = R() * T, rr = 14 + R() * 8; wrap(px, py, () => { x.fillStyle = ink + '.12)'; x.strokeStyle = ink + '.3)'; x.lineWidth = 1.5; x.beginPath(); x.ellipse(0, 0, rr, rr * .6, 0, 0, TAU); x.fill(); x.stroke(); x.beginPath(); x.ellipse(0, 0, rr * .55, rr * .32, 0, 0, TAU); x.stroke(); }); }
    for (let k = 0; k < 40; k++) { const px = R() * T, py = R() * T; wrap(px, py, () => { x.strokeStyle = (R() < .5 ? acc + '.4)' : ink + '.26)'); x.lineWidth = 1.4; x.beginPath(); for (let f = -2; f <= 2; f++) { x.moveTo(0, 4); x.quadraticCurveTo(f * 3, -2, f * 4, -8 + Math.abs(f) * 2); } x.stroke(); }); }
  } else if (id === 'salt') {
    for (let k = 0; k < 9; k++) { const sx = R() * T, sy = R() * T, w = 60 + R() * 80; wrap(sx, sy, () => { x.strokeStyle = acc + '.3)'; x.lineWidth = 1.6; for (let j = 0; j < 3; j++) { x.beginPath(); for (let i = 0; i <= 10; i++) { const px = i / 10 * w - w / 2, py = j * 7 + Math.sin(i * .9) * 3; i ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke(); } }); }
    for (let k = 0; k < 6; k++) { const sx = R() * T, sy = R() * T; wrap(sx, sy, () => { x.strokeStyle = ink + '.16)'; x.lineWidth = 1.2; x.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; x.lineTo(Math.cos(a) * 22, Math.sin(a) * 22); } x.closePath(); x.stroke(); }); }
    for (let k = 0; k < 4; k++) { const px = R() * T, py = R() * T, rot = R() * TAU; wrap(px, py, () => { x.rotate(rot); x.strokeStyle = ink + '.32)'; x.lineWidth = 3; x.lineCap = 'round'; x.beginPath(); x.moveTo(-12, 0); x.lineTo(12, 0); x.stroke(); x.lineWidth = 2; for (const sd of [-1, 1]) { x.beginPath(); x.arc(sd * 13, -3, 3, 0, TAU); x.arc(sd * 13, 3, 3, 0, TAU); x.stroke(); } }); }
    for (let k = 0; k < 3; k++) { const px = R() * T, py = R() * T; wrap(px, py, () => { x.fillStyle = ink + '.12)'; x.strokeStyle = ink + '.3)'; x.lineWidth = 1.5; x.beginPath(); x.roundRect(-5, -22, 10, 26, 5); x.roundRect(-16, -14, 8, 12, 4); x.roundRect(8, -18, 8, 12, 4); x.fill(); x.stroke(); }); }
  } else if (id === 'harbor') {
    for (let k = 0; k < 7; k++) { const sx = R() * T, sy = R() * T; wrap(sx, sy, () => { x.strokeStyle = acc + '.35)'; x.lineWidth = 1.5; let px = 0, py = 0, a = R() * TAU; x.beginPath(); x.moveTo(0, 0); for (let s = 0; s < 5; s++) { a += (R() - .5) * 1.6; px += Math.cos(a) * 22; py += Math.sin(a) * 22; x.lineTo(px, py); if (R() < .4) { x.moveTo(px, py); x.lineTo(px + Math.cos(a + 1.2) * 14, py + Math.sin(a + 1.2) * 14); x.moveTo(px, py); } } x.stroke(); }); }
    for (let k = 0; k < 3; k++) { const px = R() * T, py = R() * T, rot = (R() - .5) * .5; wrap(px, py, () => { x.rotate(rot); x.fillStyle = ink + '.08)'; x.strokeStyle = ink + '.26)'; x.lineWidth = 1.3; for (let i = 0; i < 4; i++) { x.beginPath(); x.rect(-40, -20 + i * 11, 80, 9); x.fill(); x.stroke(); } }); }
    for (let k = 0; k < 4; k++) { const px = R() * T, py = R() * T; wrap(px, py, () => { x.strokeStyle = ink + '.3)'; x.lineWidth = 2; for (let i = 0; i < 3; i++) { x.beginPath(); x.ellipse(0, 0, 6 + i * 4, 4 + i * 3, 0, 0, TAU); x.stroke(); } }); }
    for (let k = 0; k < 60; k++) { const px = R() * T, py = R() * T; wrap(px, py, () => { x.strokeStyle = 'rgba(255,255,255,.75)'; x.lineWidth = 1; x.beginPath(); x.moveTo(-3, 0); x.lineTo(3, 0); x.moveTo(0, -3); x.lineTo(0, 3); x.stroke(); }); }
  } else {
    for (let k = 0; k < 6; k++) { const sx = R() * T, sy = R() * T; wrap(sx, sy, () => { x.strokeStyle = (k % 2 ? acc + '.3)' : ink + '.22)'); x.lineWidth = 1.6; let px = 0, py = 0, a = R() * TAU; x.beginPath(); x.moveTo(0, 0); for (let s = 0; s < 14; s++) { a += (R() - .5) * 2.2; px += Math.cos(a) * 9; py += Math.sin(a) * 9; x.lineTo(px, py); } x.stroke(); }); }
    for (let k = 0; k < 5; k++) { const px = R() * T, py = R() * T, rot = R() * TAU, w = 18 + R() * 16; wrap(px, py, () => { x.rotate(rot); x.fillStyle = 'rgba(255,255,255,.6)'; x.strokeStyle = ink + '.28)'; x.lineWidth = 1.3; x.beginPath(); x.moveTo(-w / 2, -w * .35); x.lineTo(w / 2 - 5, -w * .35); x.lineTo(w / 2, -w * .35 + 5); x.lineTo(w / 2, w * .35); x.lineTo(-w / 2, w * .35); x.closePath(); x.fill(); x.stroke(); }); }
    for (let k = 0; k < 4; k++) { const sx = R() * T, sy = R() * T; wrap(sx, sy, () => { x.strokeStyle = ink + '.3)'; x.lineWidth = 2; x.beginPath(); let px = -30, py = 0; x.moveTo(px, py); for (let s = 0; s < 6; s++) { px += 10; py = (s % 2 ? -1 : 1) * (4 + R() * 6); x.lineTo(px, py); } x.stroke(); }); }
    for (let k = 0; k < 30; k++) { const px = R() * T, py = R() * T; wrap(px, py, () => { x.fillStyle = R() < .5 ? acc + '.35)' : 'rgba(255,210,63,.45)'; x.beginPath(); x.arc(0, 0, 1.6, 0, TAU); x.fill(); }); }
  }
  MAP_TILE[id] = c;
  return c;
}
/* a small picture of each map for the prep screen */
const MAP_THUMB = {};
function mapThumb(i) {
  if (MAP_THUMB[i]) return MAP_THUMB[i];
  const m = MAPS[i], tile = mapTile(m.id), c = document.createElement('canvas'); c.width = c.height = 168;
  const x = c.getContext('2d'); x.drawImage(tile, 0, 0, tile.width * .5, tile.height * .5, 0, 0, 168, 168);
  const ids = ['blob', 'brute', 'moth'].map(k => m.sub2[k] || k);
  const pos = [[48, 112, 54], [116, 96, 78], [86, 46, 44]];
  ids.forEach((k, j) => { const S = SPR[k]; if (S) x.drawImage(S.img, pos[j][0] - pos[j][2] / 2, pos[j][1] - pos[j][2] / 2, pos[j][2], pos[j][2]); });
  return MAP_THUMB[i] = c.toDataURL();
}
const MOB_ICON = {};
function mobIcon(k) { if (!MOB_ICON[k]) { const S = SPR[k]; MOB_ICON[k] = S ? S.img.toDataURL() : ''; } return MOB_ICON[k]; }

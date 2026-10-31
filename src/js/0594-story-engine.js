/* ================= story mode: the world, its people, its puzzles ================= */
const TL = 48;                 // one tile, in world px
let WD = null;                 // the area we are standing in
let STORY_GATE = null;         // set while a story portal fight is running
const AREA_CV = {};            // pre-printed obstacle layers

/* ---------- save state ---------- */
function freshStory() {
  return { v: 1, flags: {}, coin: 0, xp: 0, lv: 1, items: { potion: 2 }, swords: [], sword: null, plus: {}, charms: 0,
    cp: { area: 'village', x: 17.5 * TL, y: 10.6 * TL }, ak: {}, opened: {}, lit: {}, solved: {}, pagesPaid: 0, bounty: null, playT: 0, seen: {}, kills: 0 };
}

const sf = f => !!(SAVE.story && SAVE.story.flags[f]);
const allf = s => s.split(' ').every(sf);
function setf(f) { SAVE.story.flags[f] = 1; persist(); if (WD) refreshBlk(); }
function addCoin(n) { SAVE.story.coin = Math.max(0, Math.round(SAVE.story.coin + n)); if (n > 0) { SFX.gem(6); TX.push({ x: P.x, y: P.y - 30, vy: -40, life: .9, max: .9, v: '+' + Math.round(n) + ' 동전', crit: false, healTxt: true, dead: false }); } }
function addItem(k, n = 1) { const it = SAVE.story.items; it[k] = Math.max(0, (it[k] || 0) + n); if (n > 0) { const nm = ITEM_NAME[k] || k; banner(nm + (n > 1 ? ' ×' + n : ''), '얻었다', 'good'); SFX.pick(); } persist(); }
const ITEM_NAME = { potion: '물약', bigpotion: '큰 물약', stone: '단단한 돌', page: '낙서 조각', salt_heart: '소금 심장', charm: '불씨 부적', mushroom: '버섯', jar: '물 항아리', sentence: '찢긴 문장' };
function giveCharm() { SAVE.story.charms++; applyStats(); P.hp = P.maxHp; persist(); banner('불씨 부적', '최대 체력 +15', 'good'); SFX.heal(); }
function giveSword(id) {
  const S = SAVE.story;
  if (!S.swords.includes(id)) S.swords.push(id);
  S.sword = id; applyStats(); persist();
  G.flash = .5; SFX.evo(); buzz([30, 30, 90]);
  ringFx(P.x, P.y, 120, COL.yellow, .5, 8);
  banner(SWORDS[id].name, '손에 쥐었다', 'good');
}
function storyReload() { if (WD) refreshBlk(); }
function payPages() {
  const S = SAVE.story, have = S.items.page || 0;
  while (S.pagesPaid < have) { S.pagesPaid++; addCoin(40 * S.pagesPaid); if (S.pagesPaid % 4 === 0) { S.charms++; banner('불씨 부적', '최대 체력 +15', 'good'); } }
  applyStats(); persist();
}
function applyStats() {
  const S = SAVE.story; recalc();
  const sw = S.sword ? SWORDS[S.sword] : null;
  P.maxHp = 100 + (S.lv - 1) * 14 + S.charms * 15;
  P.might = (1 + (S.lv - 1) * .035) * (sf('scribble') ? 1.05 : 1);
  P.crit = .05 + (sw && sw.crit || 0); P.critMul = 2; P.armorMul = 1; P.cdMul = 1; P.area = 1; P.regen = 0; P.leech = 0; P.speed = 165;
  P.hp = Math.min(P.hp || P.maxHp, P.maxHp);
}
const xpNeedS = L => Math.round(14 + L * 11 + L * L * .7);
function gainStoryXp(v) {
  const S = SAVE.story; S.xp += v;
  while (S.xp >= xpNeedS(S.lv)) {
    S.xp -= xpNeedS(S.lv); S.lv++;
    applyStats(); P.hp = P.maxHp;
    ringFx(P.x, P.y, 150, COL.yellow, .45, 8); SFX.level(); buzz(20);
    banner('LV ' + S.lv, '체력과 힘이 올랐다', 'good');
  }
}

/* ---------- building an area ---------- */
const SOLID = new Set(['#', 't', 'o', '~', 'h', 'f', 'c', 'b', 'x']);
const BULLET_WALL = new Set(['#', 't', 'o', 'h', 'f', 'c', 'b']);
const EXIT_CH = { '<': 'W', '>': 'E', '^': 'N', 'v': 'S' };
const SIDE_CH = { W: '<', E: '>', N: '^', S: 'v' };
function normRows(rows, w) {
  return rows.map(r => { if (r.length < w) return r.slice(0, -1) + '.'.repeat(w - r.length) + r.slice(-1); if (r.length > w) return r.slice(0, w - 1) + r.slice(-1); return r; });
}
function genArea(A) {
  const w = A.w || 26, h = A.h || 18, R = mulberry(A.seed || 1), reg = A.reg, dens = A.arena ? .03 : (A.dens ?? .1);
  const obs = { 1: ['t', 't', 'o'], 2: ['t', 't', 't', 'o'], 3: ['o', 'c', 'o'], 4: ['#', 'b', 'o'], 5: ['#', 'x', '#'] }[reg];
  const border = { 1: 't', 2: 't', 3: 'o', 4: '#', 5: '#' }[reg];
  const g = [];
  for (let y = 0; y < h; y++) { g.push([]); for (let x = 0; x < w; x++) g[y].push(x === 0 || y === 0 || x === w - 1 || y === h - 1 ? border : R() < dens ? obs[Math.floor(R() * obs.length)] : '.'); }
  // let obstacles clump a little
  for (let p = 0; p < 2; p++) for (let y = 2; y < h - 2; y++) for (let x = 2; x < w - 2; x++) {
    let n = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && g[y + dy][x + dx] !== '.') n++;
    if (g[y][x] === '.' && n >= 4 && R() < .5) g[y][x] = obs[Math.floor(R() * obs.length)];
    else if (g[y][x] !== '.' && n <= 1 && R() < .5) g[y][x] = '.';
  }
  for (let k = 0; k < (A.water || 0); k++) { const cx = 3 + R() * (w - 6), cy = 3 + R() * (h - 6), rx = 1.5 + R() * 2.5, ry = 1.2 + R() * 1.8; for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 1) g[y][x] = '~'; }
  const cx = Math.floor(w / 2), cy = Math.floor(h / 2);
  const clear = (x, y) => { if (x > 0 && y > 0 && x < w - 1 && y < h - 1 && g[y][x] !== '~') g[y][x] = '.'; };
  const clearW = (x, y) => { if (x > 0 && y > 0 && x < w - 1 && y < h - 1) g[y][x] = g[y][x] === '~' ? '=' : '.'; };
  if (A.arena) {
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) if (((x - cx) / (w * .4)) ** 2 + ((y - cy) / (h * .38)) ** 2 < 1 && g[y][x] !== '~') g[y][x] = '.';
    for (const [px, py] of [[-.22, -.2], [.22, -.2], [-.22, .22], [.22, .22]]) { const ox = Math.round(cx + px * w), oy = Math.round(cy + py * h); g[oy][ox] = 'o'; }
  }
  // exits: three-wide gaps in the middle of each side, and a road from each to the centre
  for (const side in (A.exits || {})) {
    for (let k = -1; k <= 1; k++) {
      if (side === 'W') g[cy + k][0] = '<'; if (side === 'E') g[cy + k][w - 1] = '>';
      if (side === 'N') g[0][cx + k] = '^'; if (side === 'S') g[h - 1][cx + k] = 'v';
    }
    const [sx, sy] = side === 'W' ? [1, cy] : side === 'E' ? [w - 2, cy] : side === 'N' ? [cx, 1] : [cx, h - 2];
    let x = sx, y = sy;
    while (x !== cx || y !== cy) { for (let k = -1; k <= 1; k++) side === 'W' || side === 'E' ? clearW(x, y + k) : clearW(x + k, y); if (x !== cx) x += Math.sign(cx - x); else y += Math.sign(cy - y); }
  }
  for (let y = cy - 1; y <= cy + 1; y++) for (let x = cx - 1; x <= cx + 1; x++) clearW(x, y);
  for (const e of (A.ents || [])) {
    const [, ex, ey] = e;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) clear(ex + dx, ey + dy);
    let x = ex, y = ey + 1;
    while (x !== cx || y !== cy) { clearW(x, y); if (y !== cy) y += Math.sign(cy - y); else x += Math.sign(cx - x); }
  }
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) if (g[y][x] === '.' && R() < .07) g[y][x] = ',';
  return g.map(r => r.join(''));
}
function buildArea(id) {
  const A = AREAS[id];
  let rows = A.map ? normRows(A.map, A.map[0].length) : genArea(A);
  const w = rows[0].length, h = rows.length, ents = [];
  const grid = rows.map(r => r.split(''));
  // letters in a hand map are entities from the legend
  if (A.legend) for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const L = A.legend[grid[y][x]];
    if (L) { ents.push(mkEnt(L[0], x, y, L[1] || {})); grid[y][x] = '.'; }
  }
  for (const [k, x, y, o] of (A.ents || [])) { ents.push(mkEnt(k, x, y, o || {})); if (SOLID.has(grid[y][x])) grid[y][x] = '.'; }
  for (const e of ents) if (e.k === 'lamp') e.on = !!e.o.on;
  return { id, A, reg: A.reg, w, h, grid, ents, blk: new Uint8Array(w * h), seq: {}, playing: null, boss: null, bossLock: false, locked: false };
}
function mkEnt(k, tx, ty, o) { return { k, tx, ty, x: (tx + .5) * TL, y: (ty + .5) * TL, o, t: Math.random() * 10 }; }
const entOn = e => (!e.o.if || allf(e.o.if)) && (!e.o.unless || !sf(e.o.unless)) && !e.gone;
const SOLID_ENT = new Set(['npc', 'torch', 'sign', 'chest', 'box', 'brazier', 'lamp', 'pot', 'board', 'bell', 'portal']);
function gSolved(g) { return !!SAVE.story.solved[WD.id + ':' + g]; }
function exitInfo(side) {
  const v = WD.A.exits && WD.A.exits[side]; if (!v) return null;
  if (typeof v === 'string') return { to: v, open: true };
  return { to: v[0], open: allf(v[1]), msg: v[2] };
}
function refreshBlk() {
  const W2 = WD.w, blk = WD.blk;
  blk.fill(0);
  for (let y = 0; y < WD.h; y++) for (let x = 0; x < W2; x++) {
    const c = WD.grid[y][x];
    if (SOLID.has(c)) blk[y * W2 + x] = 1;
    const side = EXIT_CH[c];
    if (side) { const ex = exitInfo(side); if (!ex || !ex.open || WD.bossLock || WD.locked) blk[y * W2 + x] = 1; }
  }
  for (const e of WD.ents) {
    if (!entOn(e)) continue;
    if (e.k === 'gate' && !gSolved(e.o.g)) blk[e.ty * W2 + e.tx] = 1;
    if (e.k === 'door' && (WD.bossLock || WD.locked)) blk[e.ty * W2 + e.tx] = 1;
    if (SOLID_ENT.has(e.k) && !(e.k === 'pot' && e.broken)) blk[e.ty * W2 + e.tx] = 1;
  }
}
const tileAt = (x, y) => { const tx = Math.floor(x / TL), ty = Math.floor(y / TL); return tx < 0 || ty < 0 || tx >= WD.w || ty >= WD.h ? '#' : WD.grid[ty][tx]; };
function solidT(tx, ty) { return tx < 0 || ty < 0 || tx >= WD.w || ty >= WD.h || WD.blk[ty * WD.w + tx] === 1; }
function solidE(tx, ty) { return solidT(tx, ty) || !!EXIT_CH[WD.grid[ty] && WD.grid[ty][tx]]; }
function collideBox(o, r, solid) {
  for (let it = 0; it < 2; it++) {
    const tx0 = Math.floor((o.x - r) / TL), tx1 = Math.floor((o.x + r) / TL), ty0 = Math.floor((o.y - r) / TL), ty1 = Math.floor((o.y + r) / TL);
    for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) {
      if (!solid(tx, ty)) continue;
      const nx = clamp(o.x, tx * TL, tx * TL + TL), ny = clamp(o.y, ty * TL, ty * TL + TL), dx = o.x - nx, dy = o.y - ny, d = Math.hypot(dx, dy);
      if (d < r) {
        if (d > .001) { o.x = nx + dx / d * r; o.y = ny + dy / d * r; }
        else { const cxm = tx * TL + TL / 2, cym = ty * TL + TL / 2, ax = o.x - cxm, ay = o.y - cym; if (Math.abs(ax) > Math.abs(ay)) o.x = cxm + Math.sign(ax || 1) * (TL / 2 + r); else o.y = cym + Math.sign(ay || 1) * (TL / 2 + r); }
      }
    }
  }
}
const storyCollideP = () => collideBox(P, P.r, solidT);
const storyCollideE = e => collideBox(e, Math.min(e.r, TL * .45), solidE);

/* ---------- entering and leaving ---------- */
function enterArea(id, how) {
  const S = SAVE.story;
  WD = buildArea(id);
  S.area = id; S.seen[id] = 1;
  E.length = 0; EB.length = 0; PR.length = 0; TG.length = 0; G.spk = []; G.boss = null; $('bossBar').hidden = true;
  G.slashes = []; G.swing = null;
  const R = REG[WD.reg];
  G.rf = { hp: R.hp * 2.2, dmg: R.dmg, spawn: 1, shard: 1 };
  G.tile = mapTile(R.tile);
  refreshBlk();
  // where do we arrive?
  let ax = 13 * TL, ay = 9 * TL;
  if (how && how.x !== undefined) { ax = how.x; ay = how.y; }
  else if (how && how.side) {
    const want = SIDE_CH[how.side], pts = [];
    for (let y = 0; y < WD.h; y++) for (let x = 0; x < WD.w; x++) if (WD.grid[y][x] === want) pts.push([x, y]);
    if (pts.length) {
      const mx = pts.reduce((a, p) => a + p[0], 0) / pts.length, my = pts.reduce((a, p) => a + p[1], 0) / pts.length;
      const off = { W: [1.6, 0], E: [-1.6, 0], N: [0, 1.6], S: [0, -1.6] }[how.side];
      ax = (mx + .5 + off[0]) * TL; ay = (my + .5 + off[1]) * TL;
    }
  } else if (how && how.from) {
    const d = WD.ents.find(e => e.k === 'door' && e.o.to === how.from);
    if (d) { ax = d.x; ay = d.y + TL; }
  }
  P.x = ax; P.y = ay; P.vx = P.vy = 0; P.slide = null;
  { const tx = Math.floor(P.x / TL), ty = Math.floor(P.y / TL);
    if (solidT(tx, ty)) { outer: for (let r = 1; r < 12; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue; const nx = tx + dx, ny = ty + dy; if (!solidT(nx, ny) && !EXIT_CH[WD.grid[ny][nx]]) { P.x = (nx + .5) * TL; P.y = (ny + .5) * TL; break outer; } } } }
  storyCollideP();
  G.camX = P.x; G.camY = P.y;
  // the things living here
  const far = (x, y) => Math.hypot(x - P.x, y - P.y) > TL * 6;
  for (const [type, n, el] of (WD.A.mobs || [])) for (let i = 0; i < n; i++) {
    const p = freeSpot(far); if (p) storySpawnMob(type, p[0], p[1], el === 'e');
  }
  if (WD.A.lock && !gSolved('lock') && E.length) { WD.locked = true; refreshBlk(); }
  const bossE = WD.ents.find(e => e.k === 'boss');
  if (bossE && !sf('beat_' + bossE.o.id)) WD.boss = bossE;
  const dark = WD.A.dark;
  AU.intensity = WD.boss ? 2 : 1;
  banner(WD.A.name, REG[WD.reg].name + (WD.A.note ? ' · ' + WD.A.note : ''), dark ? 'warn' : '');
  if (WD.A.lock && WD.locked) setTimeout(() => { if (WD && WD.locked) banner('갇혔다', '모두 쓰러뜨려야 길이 열린다', 'warn'); }, 1400);
  G.trans = null; G.fade = Math.max(G.fade || 0, .9);
  storyHUD(true);
}
function freeSpot(ok) {
  for (let k = 0; k < 80; k++) {
    const tx = 1 + Math.floor(Math.random() * (WD.w - 2)), ty = 1 + Math.floor(Math.random() * (WD.h - 2));
    if (solidT(tx, ty) || '.,+'.indexOf(WD.grid[ty][tx]) < 0) continue;
    const x = (tx + .5) * TL, y = (ty + .5) * TL;
    if (!ok || ok(x, y)) return [x, y];
  }
  return null;
}
function storySpawnMob(type, x, y, elite) {
  const e = spawnEnemy(type, x, y, elite);
  if (elite) { e.hp = e.maxHp = e.maxHp * .4; }
  e.idle = true; e.hx = x; e.hy = y; e.story = 1; e.wa = rnd(TAU); e.wt = rnd(1, 3);
  return e;
}
function storySpawnBoss(be) {
  const id = be.o.id, b = BOSS[id], hp = be.o.hp;
  const e = { type: id, bk: id, boss: true, x: be.x, y: be.y, r: b.r, scl: 1, hp, maxHp: hp, spd: b.spd, dmg: b.dmg, xp: 0, ai: 'boss', kbRes: .96,
    kx: 0, ky: 0, t: 0, ph: 0, flash: 0, elite: false, hit: {}, cd: 2.5, cd2: 5, cd3: 5, cd4: 8, face: 1, side: 1, st: '', stT: 0, ang: 0,
    dash: (b.arch || id) === 'cata' ? 600 : 680, combo: 0, dead: false, story: 1, introScale: 0 };
  E.push(e); G.boss = e; WD.bossE = be; WD.boss = null; WD.bossLock = true; refreshBlk();
  $('bossName').textContent = b.name; $('bossBar').hidden = false;
  banner(b.name, b.sub, 'warn'); SFX.warn(); SFX.roar(); shake(12); buzz([40, 80, 40]);
  AU.intensity = 3;
}
function storyBossDown(e) {
  G.boss = null; $('bossBar').hidden = true;
  const be = WD.bossE, b = BOSS[e.bk], R = REG[WD.reg];
  shake(18); G.hitstop = .2; G.slowT = .9; G.flash = .7; SFX.boom(true); buzz([50, 40, 160]);
  for (let i = 0; i < 6; i++) G.later.push({ t: i * .13, fn: () => { ringFx(e.x + rnd(-40, 40), e.y + rnd(-40, 40), rnd(70, 130), i % 2 ? COL.pink : COL.ink, .4, 7); burst(e.x, e.y, 18, i % 2 ? COL.pink : COL.deep, 300); splat(e.x + rnd(-50, 50), e.y + rnd(-50, 50), 120, i % 2 === 1); SFX.boom(i === 5); } });
  for (const b2 of EB) b2.dead = true;
  for (const o of E) if (!o.dead && o !== e) { o.dead = true; burst(o.x, o.y, 6, COL.ink, 150); }
  WD.bossLock = false; refreshBlk();
  setf('beat_' + e.bk);
  for (let i = 0; i < 14; i++) G.spk.push({ k: 'coin', x: e.x, y: e.y, v: Math.ceil(R.coin * 8), vx: rnd(-260, 260), vy: rnd(-260, 260), t: 0 });
  gainStoryXp(60 * WD.reg * WD.reg + 40);
  if (be && be.o.drop) G.later.push({ t: 1, fn: () => addItem(be.o.drop) });
  G.later.push({ t: .9, fn: () => { banner(b.name, '쓰러짐', 'good'); SFX.win(); } });
  AU.intensity = 1; persist();
}
function storyKill(e) {
  const R = REG[WD.reg], S = SAVE.story;
  splat(e.x, e.y, e.r * 2.6, e.elite);
  burst(e.x, e.y, e.elite ? 16 : 6, COL.ink, e.elite ? 230 : 140);
  if (Math.random() < .45) burst(e.x, e.y, 2, COL.pink, 110);
  SFX.kill();
  const ED = ENEMY[e.type] || {};
  if (ED.split) for (let k = 0; k < 2; k++) { const m = spawnEnemy(ED.split, e.x + rnd(-8, 8), e.y + rnd(-8, 8)); m.kx = rnd(-140, 140); m.ky = rnd(-140, 140); }
  if (ED.blast) bomberBlast(e, true);
  const n = Math.max(1, Math.round(rnd(.6, 1.6) * (e.elite ? 5 : 1)));
  for (let i = 0; i < n; i++) G.spk.push({ k: 'coin', x: e.x, y: e.y, v: R.coin, vx: rnd(-120, 120), vy: rnd(-120, 120), t: 0 });
  if (Math.random() < .03) G.spk.push({ k: 'heart', x: e.x, y: e.y, v: 0, vx: rnd(-80, 80), vy: rnd(-80, 80), t: 0 });
  const dr = WD.A.drop; if (dr && Math.random() < dr[1]) G.spk.push({ k: 'item', it: dr[0], x: e.x, y: e.y, v: 1, vx: rnd(-80, 80), vy: rnd(-80, 80), t: 0 });
  gainStoryXp((ED.xp || 1) * 2 * WD.reg * (e.elite ? 6 : 1));
  S.ak[WD.id] = (S.ak[WD.id] || 0) + 1; S.kills++;
  const B = S.bounty;
  if (B && !B.done && B.type === e.type) { B.got++; if (B.got >= B.need) { B.done = true; banner('의뢰 완료', '의뢰판으로 돌아가 보상을 받는다', 'good'); } }
  if (WD.id === 'field' && S.ak.field === 8 && !sf('field_done')) banner('들판 정리', '바렌에게 돌아간다', 'good');
}

/* ---------- running the story world every frame ---------- */
function storyTick(dt) {
  const S = SAVE.story;
  G.time = 0; S.playT += dt;
  if (G.fade > 0) G.fade = Math.max(0, G.fade - dt * 2.4);
  if (G.trans) {
    G.trans.t += dt;
    if (G.trans.t >= .22 && !G.trans.done) { G.trans.done = true; const tr = G.trans; enterArea(tr.to, tr.how); }
    return;
  }
  // wake the sleeping, keep them home
  for (const e of E) if (e.story && e.idle && (Math.hypot(P.x - e.x, P.y - e.y) < 250 || e.hp < e.maxHp)) e.idle = false;
  // bullets stop at walls
  for (const b of EB) if (!b.dead && BULLET_WALL.has(tileAt(b.x, b.y))) { b.dead = true; burst(b.x, b.y, 3, COL.ink, 80); }
  for (const p of PR) if (!p.dead && p.kind === 'swave' && BULLET_WALL.has(tileAt(p.x, p.y))) p.dead = true;
  storySword(dt);
  // pickups
  for (const s of G.spk) {
    s.t += dt; s.x += s.vx * dt; s.y += s.vy * dt; s.vx *= Math.exp(-dt * 5); s.vy *= Math.exp(-dt * 5);
    const d = Math.hypot(P.x - s.x, P.y - s.y);
    if (s.t > .35 && d < 90) { s.x += (P.x - s.x) / d * 420 * dt; s.y += (P.y - s.y) / d * 420 * dt; }
    if (s.t > .35 && d < 20) {
      s.dead = true;
      if (s.k === 'coin') { S.coin += s.v; if (gate('coin', 40)) SFX.gem(2); }
      else if (s.k === 'heart') heal(P.maxHp * .2);
      else if (s.k === 'item') addItem(s.it);
    }
  }
  G.spk = G.spk.filter(s => !s.dead);
  // boss waiting for us
  if (WD.boss && Math.hypot(P.x - WD.boss.x, P.y - WD.boss.y) < TL * 6.5) storySpawnBoss(WD.boss);
  if (G.boss && G.boss.introScale !== undefined && G.boss.introScale < 1) G.boss.introScale = Math.min(1, G.boss.introScale + dt * 1.6);
  // the room lets us go once it is empty
  if (WD.locked && !E.some(e => !e.dead && e.story)) { WD.locked = false; SAVE.story.solved[WD.id + ':lock'] = 1; refreshBlk(); banner('조용해졌다', '길이 열렸다', 'good'); SFX.portal(); persist(); }
  pushBoxes(dt);
  stepTiles();
  runeBell(dt);
  // leaving
  const c = tileAt(P.x, P.y), side = EXIT_CH[c];
  if (side) { const ex = exitInfo(side); if (ex && ex.open && !WD.bossLock && !WD.locked) goTo(ex.to, { side: { W: 'E', E: 'W', N: 'S', S: 'N' }[side] }); }
  for (const e of WD.ents) if (e.k === 'door' && entOn(e) && !WD.bossLock && Math.hypot(P.x - e.x, P.y - e.y) < 18) {
    if (e.o.need && !sf(e.o.need)) { if (!e.warned) { e.warned = 1; banner(e.o.label || '문', e.o.no || '열리지 않는다', 'warn'); } P.y += 14; }
    else goTo(e.o.to, { from: WD.id });
  }
  storyHUD();
}
function goTo(id, how) { if (G.trans) return; G.trans = { t: 0, to: id, how, done: false }; INPUT.joy = null; updMove(); SFX.swish(); }

/* sliding on ice: once moving, keep going until something stops you */
function storyMove(dt) {
  const t = tileAt(P.x, P.y);
  if (t === 'i') {
    if (!P.slide) {
      const mx = INPUT.mx, my = INPUT.my;
      if (Math.abs(mx) + Math.abs(my) > .4) P.slide = Math.abs(mx) > Math.abs(my) ? [Math.sign(mx), 0] : [0, Math.sign(my)];
    }
    if (P.slide) {
      P.vx = P.slide[0] * 330; P.vy = P.slide[1] * 330;
      const nx = P.x + P.slide[0] * (P.r + 3), ny = P.y + P.slide[1] * (P.r + 3);
      if (solidT(Math.floor(nx / TL), Math.floor(ny / TL))) { P.slide = null; P.vx = P.vy = 0; P.x = (Math.floor(P.x / TL) + .5) * TL; P.y = (Math.floor(P.y / TL) + .5) * TL; SFX.thud(); }
      else if (Math.random() < .5) PT.push({ x: P.x, y: P.y + 8, vx: rnd(-20, 20), vy: rnd(-20, 20), life: .4, max: .4, s: rnd(2, 3), c: '#FFFFFF', dead: false });
      return true;
    }
  } else P.slide = null;
  return false;
}

/* ---------- the sword swings itself at whatever is close ---------- */
function storySword(dt) {
  const S = SAVE.story; if (!S.sword || STATE !== 'play') return;
  const sw = SWORDS[S.sword], plus = S.plus[S.sword] || 0;
  G.swT = (G.swT || 0) - dt; if (G.swT > 0) return;
  const R = sw.R;
  let best = null, bd = 1e9;
  for (const e of E) { if (e.dead || e.hidden || e.under) continue; const d = Math.hypot(e.x - P.x, e.y - P.y) - e.r; if (d < R && d < bd) { bd = d; best = e; } }
  let pot = null;
  if (!best) for (const e of WD.ents) if (e.k === 'pot' && !e.broken && Math.hypot(e.x - P.x, e.y - P.y) < R) { pot = e; break; }
  if (!best && !pot) return;
  const tgt = best || pot, a = Math.atan2(tgt.y - P.y, tgt.x - P.x), side = (G.swN = (G.swN || 0) + 1) % 2 ? 1 : -1;
  const dmg = sw.dmg * (1 + plus * .12);
  for (const e of E) {
    if (e.dead || e.hidden || e.under) continue;
    const dx = e.x - P.x, dy = e.y - P.y, d = Math.hypot(dx, dy) || 1;
    if (d - e.r > R || angDiff(Math.atan2(dy, dx), a) > sw.arc / 2 + Math.asin(Math.min(1, e.r / d))) continue;
    hurtEnemy(e, dmg, dx / d * 300 * (sw.kb || 1), dy / d * 300 * (sw.kb || 1));
    e.idle = false;
    if (sw.slow) e.slowT = 1.3;
  }
  for (const e of WD.ents) if (e.k === 'pot' && !e.broken && Math.hypot(e.x - P.x, e.y - P.y) < R + 10 && angDiff(Math.atan2(e.y - P.y, e.x - P.x), a) < sw.arc / 2 + .4) breakPot(e);
  if (sw.wave) PR.push({ kind: 'swave', x: P.x + Math.cos(a) * 30, y: P.y + Math.sin(a) * 30, vx: Math.cos(a) * 520, vy: Math.sin(a) * 520, a, r: 26, dmg: dmg * .5, pierce: 99, life: .6, hitset: new Set(), boom: 0, bdmg: 0, size: 1, t: 0, dead: false });
  (G.slashes = G.slashes || []).push({ a, R, arc: sw.arc, t0: performance.now(), h: false, side, col: sw.col, scrib: sw.scrib });
  G.swing = { a0: a - sw.arc / 2 * side, a1: a + sw.arc / 2 * side, t0: performance.now(), dur: 130 };
  G.swA = a;
  G.swT = sw.cd;
  SFX.slash(false);
}
function breakPot(e) {
  e.broken = true; refreshBlk();
  burst(e.x, e.y, 10, COL.ink, 160); SFX.clank();
  const R = REG[WD.reg];
  for (let i = 0; i < 3; i++) G.spk.push({ k: 'coin', x: e.x, y: e.y, v: R.coin, vx: rnd(-100, 100), vy: rnd(-100, 100), t: 0 });
  if (Math.random() < .2) G.spk.push({ k: 'heart', x: e.x, y: e.y, v: 0, vx: 0, vy: -40, t: 0 });
}

/* ---------- puzzles ---------- */
function solve(g) {
  const key = WD.id + ':' + g;
  if (SAVE.story.solved[key]) return;
  SAVE.story.solved[key] = 1;
  const f = WD.A.flagOnSolve && WD.A.flagOnSolve[g];
  if (f) SAVE.story.flags[f] = 1;
  refreshBlk(); persist();
  SFX.portal(); G.flash = .3; buzz([20, 30, 60]);
  banner('풀렸다', '어딘가 문이 열렸다', 'good');
  for (const e of WD.ents) if (e.k === 'gate' && e.o.g === g) ringFx(e.x, e.y, 70, COL.yellow, .4, 6);
}
function pushBoxes(dt) {
  const mx = INPUT.mx, my = INPUT.my;
  if (Math.abs(mx) + Math.abs(my) < .5) { G.pushT = 0; return; }
  const dir = Math.abs(mx) > Math.abs(my) ? [Math.sign(mx), 0] : [0, Math.sign(my)];
  const ptx = Math.floor(P.x / TL), pty = Math.floor(P.y / TL);
  const box = WD.ents.find(e => e.k === 'box' && e.tx === ptx + dir[0] && e.ty === pty + dir[1]);
  if (!box) { G.pushT = 0; return; }
  const edge = dir[0] ? Math.abs((box.x - dir[0] * TL / 2) - P.x) : Math.abs((box.y - dir[1] * TL / 2) - P.y);
  if (edge > P.r + 4) { G.pushT = 0; return; }
  G.pushT = (G.pushT || 0) + dt;
  if (G.pushT < .22) return;
  G.pushT = 0;
  if (WD.ents.some(e => e.k === 'plate' && e.tx === box.tx && e.ty === box.ty)) return;
  const nx = box.tx + dir[0], ny = box.ty + dir[1];
  if (solidT(nx, ny) || EXIT_CH[WD.grid[ny][nx]] || WD.ents.some(e => e !== box && e.tx === nx && e.ty === ny && (e.k === 'box' || e.k === 'door'))) { SFX.deny(); return; }
  box.tx = nx; box.ty = ny; box.ax = box.x; box.ay = box.y; box.x = (nx + .5) * TL; box.y = (ny + .5) * TL; box.mt = 0;
  refreshBlk(); SFX.thud(); shake(2);
  checkPlates();
}
function checkPlates() {
  const groups = {};
  for (const e of WD.ents) if (e.k === 'plate') { const on = WD.ents.some(b => b.k === 'box' && b.tx === e.tx && b.ty === e.ty); e.on = on; (groups[e.o.g] = groups[e.o.g] || []).push(on); }
  for (const g in groups) if (groups[g].every(Boolean)) solve(g);
}
function stepTiles() {
  const tx = Math.floor(P.x / TL), ty = Math.floor(P.y / TL);
  if (WD.lastT === tx + ',' + ty) return;
  WD.lastT = tx + ',' + ty;
  const r = WD.ents.find(e => e.k === 'rune' && e.tx === tx && e.ty === ty);
  if (!r || gSolved(r.o.g)) return;
  const st = WD.seq[r.o.g];
  if (!st || !st.ready) { r.flash = .3; SFX.tap(); return; }
  if (st.want[st.i] === r.o.n) {
    r.lit = true; st.i++; SFX.bellSmall(); tone(semi(392, [0, 2, 4, 7, 9, 12, 14, 16][r.o.n - 1] || 0), .4, { type: 'sine', vol: .08 });
    if (st.i >= st.want.length) solve(r.o.g);
  } else {
    for (const e of WD.ents) if (e.k === 'rune' && e.o.g === r.o.g) e.lit = false;
    st.i = 0; SFX.deny(); shake(4); banner('틀렸다', '결정을 다시 두드려 들어 본다', 'warn');
  }
}
function runeBell(dt) {
  const pl = WD.playing; if (!pl) return;
  pl.t -= dt;
  if (pl.t <= 0) {
    if (pl.i >= pl.seq.length) { WD.playing = null; WD.seq[pl.g] = { want: pl.seq, i: 0, ready: true }; return; }
    const n = pl.seq[pl.i++], r = WD.ents.find(e => e.k === 'rune' && e.o.g === pl.g && e.o.n === n);
    if (r) { r.flash = .55; tone(semi(392, [0, 2, 4, 7, 9, 12, 14, 16][n - 1] || 0), .5, { type: 'sine', vol: .1 }); }
    pl.t = .75;
  }
}

/* ---------- what is near enough to touch ---------- */
function nearAct() {
  let best = null, bd = TL * 1.45;
  for (const e of WD.ents) {
    if (!entOn(e)) continue;
    if (!['npc', 'sign', 'chest', 'torch', 'brazier', 'lamp', 'portal', 'board', 'bell'].includes(e.k)) continue;
    if (e.k === 'chest' && SAVE.story.opened[e.o.id]) continue;
    const d = Math.hypot(e.x - P.x, e.y - P.y);
    if (d < bd) { bd = d; best = e; }
  }
  if (!best) {
    // a closed road says why
    const c = tileAt(P.x + P.vx * .2, P.y + P.vy * .2);
    for (const side of ['W', 'E', 'N', 'S']) {
      const ex = exitInfo(side); if (!ex || ex.open) continue;
      const tx = Math.floor(P.x / TL), ty = Math.floor(P.y / TL);
      const near = (side === 'W' && tx <= 1) || (side === 'E' && tx >= WD.w - 2) || (side === 'N' && ty <= 1) || (side === 'S' && ty >= WD.h - 2);
      if (near && Math.abs((side === 'W' || side === 'E' ? ty - WD.h / 2 : tx - WD.w / 2)) < 3) return { k: 'exitlock', msg: ex.msg || '길이 막혀 있다.' };
    }
  }
  return best;
}
const ACT_LABEL = { npc: '말 걸기', sign: '읽기', chest: '열기', torch: '불 붙이기', brazier: '불 붙이기', lamp: '켜고 끄기', portal: '들어가기', board: '의뢰판', bell: '두드리기', exitlock: '살펴보기' };
function doAct() {
  if (STATE !== 'play' || G.mode !== 'story' || G.trans) return;
  const e = nearAct(); if (!e) return;
  const S = SAVE.story;
  if (e.k === 'npc') return talkTo(e.o.id);
  if (e.k === 'sign') return dialog([['', e.o.text]]);
  if (e.k === 'exitlock') return dialog([['', e.msg]]);
  if (e.k === 'chest') {
    if (e.o.g && !gSolved(e.o.g)) return dialog([['', '잠겨 있다. 근처에서 무언가를 풀어야 열린다.']]);
    S.opened[e.o.id] = 1; SFX.chest(); shake(3); burst(e.x, e.y, 14, COL.yellow, 200);
    if (e.o.coin) addCoin(e.o.coin * REG[WD.reg].coin);
    if (e.o.item === 'charm') { S.charms++; applyStats(); P.hp = P.maxHp; banner('불씨 부적', '최대 체력 +15', 'good'); }
    else if (e.o.item) addItem(e.o.item);
    persist(); return;
  }
  if (e.k === 'torch') {
    S.cp = { area: WD.id, x: e.x, y: e.y + TL * .9 }; S.lit[WD.id + ':' + e.tx + ',' + e.ty] = 1;
    P.hp = P.maxHp; persist();
    SFX.heal(); ringFx(e.x, e.y, 90, COL.yellow, .45, 6); burst(e.x, e.y - 20, 16, COL.yellow, 160);
    banner('불을 밝혔다', '기록했다. 쓰러지면 여기서 일어난다', 'good'); return;
  }
  if (e.k === 'brazier') {
    const g = e.o.g; if (gSolved(g) || e.lit) return;
    const st = WD.seq[g] = WD.seq[g] || { next: 1 };
    const total = WD.ents.filter(x => x.k === 'brazier' && x.o.g === g).length;
    if (e.o.n === st.next) { e.lit = true; st.next++; SFX.bellSmall(); burst(e.x, e.y - 14, 12, COL.yellow, 140); if (st.next > total) solve(g); }
    else { for (const x of WD.ents) if (x.k === 'brazier' && x.o.g === g) x.lit = false; st.next = 1; SFX.deny(); shake(5); banner('불이 꺼졌다', '순서가 틀렸다', 'warn'); }
    return;
  }
  if (e.k === 'lamp') {
    const g = e.o.g; if (gSolved(g)) return;
    for (const x of WD.ents) if (x.k === 'lamp' && x.o.g === g && Math.abs(x.o.i - e.o.i) + Math.abs(x.o.j - e.o.j) <= 1) x.on = !x.on;
    SFX.tick();
    if (WD.ents.filter(x => x.k === 'lamp' && x.o.g === g).every(x => x.on)) solve(g);
    return;
  }
  if (e.k === 'bell') { if (gSolved(e.o.g) || WD.playing) return; for (const x of WD.ents) if (x.k === 'rune' && x.o.g === e.o.g) x.lit = false; WD.playing = { g: e.o.g, seq: e.o.seq, i: 0, t: .4 }; SFX.bell(); return; }
  if (e.k === 'board') return bountyTalk(e.o.reg);
  if (e.k === 'portal') {
    const gt = GATES.find(g => g.id === e.o.gate);
    if (e.o.need && !sf(e.o.need)) return dialog([['', '문이 닫혀 있다. 지금 가진 것으로는 열리지 않는다.']]);
    const again = sf('gate_' + gt.id);
    return dialog([['', again ? gt.name + '. 이미 한 번 닫은 문이다. 다시 싸울 수 있다.' : '문 너머에서 ' + gt.name + '의 기척이 느껴진다. 들어가면 안에서 무장을 고른다.']],
      [[again ? '다시 들어간다' : '들어간다', () => storyGate(gt.id)], ['아직', null]]);
  }
}

/* ---------- talking ---------- */
let DLG = null;
function talkTo(id) {
  const S = SAVE.story, N = NPCS[id], list = TALK[id];
  const ent = list.find(r => r[0](S));
  const lines = typeof ent[1] === 'function' ? ent[1](S) : ent[1];
  dialog(lines.map(l => [N.name, l, N.role]), null, ent[2]);
}
function dialog(lines, choices, then) {
  STATE = 'talk'; INPUT.joy = null; updMove();
  DLG = { lines, i: 0, choices, then, shown: 0, full: '' };
  $('sDlg').hidden = false;
  showLine();
}
function showLine() {
  const [name, text, role] = DLG.lines[DLG.i];
  $('dName').textContent = name || '';
  $('dRole').textContent = role || '';
  $('dName').parentElement.hidden = !name;
  DLG.full = text; DLG.shown = 0;
  $('dText').textContent = '';
  $('dChoices').innerHTML = '';
  clearInterval(DLG.iv);
  DLG.iv = setInterval(() => {
    if (!DLG) return;
    DLG.shown = Math.min(DLG.full.length, DLG.shown + 2);
    $('dText').textContent = DLG.full.slice(0, DLG.shown);
    if (DLG.shown % 6 === 0 && gate('dlg', 60)) tone(rnd(520, 640), .03, { type: 'square', vol: .015 });
    if (DLG.shown >= DLG.full.length) { clearInterval(DLG.iv); lineDone(); }
  }, 28);
}
function lineDone() {
  const last = DLG.i === DLG.lines.length - 1;
  $('dMore').hidden = last && !!DLG.choices;
  if (last && DLG.choices) {
    const host = $('dChoices'); host.innerHTML = '';
    DLG.choices.forEach(([label, fn]) => {
      const b = document.createElement('button'); b.className = 'btn ghost'; b.textContent = label;
      b.addEventListener('click', ev => { ev.stopPropagation(); SFX.tap(); closeDlg(); if (fn) fn(); });
      host.appendChild(b);
    });
  }
}
function advanceDlg() {
  if (!DLG) return;
  if (DLG.shown < DLG.full.length) { DLG.shown = DLG.full.length; $('dText').textContent = DLG.full; clearInterval(DLG.iv); lineDone(); return; }
  if (DLG.i === DLG.lines.length - 1 && DLG.choices) return;
  SFX.tap();
  if (DLG.i < DLG.lines.length - 1) { DLG.i++; showLine(); return; }
  const then = DLG.then; closeDlg(); if (then) then();
}
function closeDlg() {
  if (DLG) clearInterval(DLG.iv);
  DLG = null; $('sDlg').hidden = true;
  if (STATE === 'talk') STATE = 'play';
  storyHUD(true);
}

/* ---------- bounties ---------- */
function bountyTalk(reg) {
  const S = SAVE.story, B = S.bounty;
  if (B && B.done) {
    return dialog([['의뢰판', B.name + ' ' + B.need + '마리. 끝냈다. 보상 ' + B.reward + ' 동전.']], null, () => { addCoin(B.reward); gainStoryXp(B.reward); S.bounty = null; S.bountyN = (S.bountyN || 0) + 1; persist(); });
  }
  if (B) return dialog([['의뢰판', B.name + ' ' + B.got + ' / ' + B.need + '. 아직이다.']], [['계속한다', null], ['포기한다', () => { S.bounty = null; persist(); }]]);
  const type = pick(REG_MOBS[reg]), need = 10 + reg * 3 + Math.floor(Math.random() * 6), reward = Math.round(need * REG[reg].coin * 4.5);
  dialog([['의뢰판', MOB_NAME[type] + ' ' + need + '마리를 잡아 달라. 보상 ' + reward + ' 동전. ' + REG[reg].name + ' 어디에나 있다.']],
    [['받는다', () => { S.bounty = { type, name: MOB_NAME[type], need, got: 0, reward, done: false }; persist(); banner('의뢰', MOB_NAME[type] + ' ' + need + '마리', 'good'); }], ['그만둔다', null]]);
}

/* ---------- shops ---------- */
function shopItems(kind) {
  const S = SAVE.story, r = WD ? WD.reg : 1, list = [];
  if (kind === 'smith') {
    for (const id of S.swords) { const p = S.plus[id] || 0; if (p < 5) list.push({ k: 'plus', id, name: SWORDS[id].name + ' +' + (p + 1), desc: '피해 +12%', price: Math.round(60 * (SWORD_ORDER.indexOf(id) + 1) ** 1.6 * (p + 1)) }); }
    return list;
  }
  list.push({ k: 'potion', name: '물약', desc: '체력 40% 회복', price: 20 * r });
  if (kind !== 'baren') list.push({ k: 'bigpotion', name: '큰 물약', desc: '체력 전부 회복', price: 55 * r });
  if (kind !== 'baren') list.push({ k: 'charm', name: '불씨 부적', desc: '최대 체력 +15. 계속 쌓인다', price: 160 * r * (1 + S.charms * .4) | 0 });
  if (kind === 'pio' && r >= 2 && !S.swords.includes('copper')) list.push({ k: 'sword', id: 'copper', name: '구리검', desc: SWORDS.copper.desc, price: SWORDS.copper.price });
  return list;
}
let SHOP_KIND = null;
function openStoryShop(kind) {
  SHOP_KIND = kind; STATE = 'smenu'; INPUT.joy = null; updMove();
  show('scrSShop'); renderStoryShop();
}
function renderStoryShop() {
  const S = SAVE.story;
  $('ssTitle').textContent = SHOP_KIND === 'smith' ? '대장간' : '가게';
  $('ssCoin').textContent = fmtNum(S.coin);
  const host = $('ssList'); host.innerHTML = '';
  const items = shopItems(SHOP_KIND);
  if (!items.length) host.innerHTML = '<p class="note">지금은 할 수 있는 게 없다.</p>';
  for (const it of items) {
    const row = document.createElement('div'); row.className = 'row';
    const have = it.k === 'potion' || it.k === 'bigpotion' ? ' · 가진 것 ' + (S.items[it.k] || 0) : '';
    row.innerHTML = '<div><b>' + esc(it.name) + '</b><p>' + esc(it.desc + have) + '</p></div><button class="buy"' + (S.coin < it.price ? ' disabled' : '') + '><i class="coin"></i>' + fmtNum(it.price) + '</button>';
    row.querySelector('button').addEventListener('click', () => {
      if (S.coin < it.price) { SFX.deny(); return; }
      S.coin -= it.price; SFX.chest(); buzz(20);
      if (it.k === 'plus') { S.plus[it.id] = (S.plus[it.id] || 0) + 1; SFX.clank(); }
      else if (it.k === 'charm') { S.charms++; applyStats(); }
      else if (it.k === 'sword') { S.swords.push(it.id); S.sword = it.id; applyStats(); }
      else S.items[it.k] = (S.items[it.k] || 0) + 1;
      persist(); renderStoryShop();
    });
    host.appendChild(row);
  }
}
function closeStoryScreen() { hideAll(); STATE = 'play'; storyHUD(true); }

/* ---------- the menu ---------- */
function openSMenu() {
  if (G.mode !== 'story' || STATE !== 'play') return;
  STATE = 'smenu'; INPUT.joy = null; updMove();
  show('scrSMenu'); renderSMenu();
}
function renderSMenu() {
  const S = SAVE.story;
  const step = STORY_STEPS.find(s => !sf(s.f));
  const done = STORY_STEPS.filter(s => sf(s.f)).length;
  $('smBody').innerHTML =
    '<div class="tiles">' + tile('LV ' + S.lv, '레벨') + tile(Math.round(P.hp) + '/' + Math.round(P.maxHp), '체력') + tile(fmtNum(S.coin), '동전') + tile(fmtTime(S.playT), '이야기 시간') + '</div>' +
    '<div><div class="label"><span class="eyebrow">할 일</span><span>' + done + ' / ' + STORY_STEPS.length + '</span></div><p class="lead">' + esc(step ? step.t : '모든 이야기를 마쳤다.') + '</p>' +
    (S.bounty ? '<p class="note">의뢰: ' + esc(S.bounty.name) + ' ' + S.bounty.got + ' / ' + S.bounty.need + (S.bounty.done ? ' · 끝' : '') + '</p>' : '') + '</div>' +
    (() => { const sq = SIDE_QUESTS.filter(q => S.seen[q.at] && !sf(q.f)); return sq.length ? '<div><div class="label"><span class="eyebrow">곁일</span><span>' + SIDE_QUESTS.filter(q => sf(q.f)).length + ' / ' + SIDE_QUESTS.length + ' 끝냄</span></div>' + sq.map(q => '<p class="note">' + esc(q.t) + ' · ' + esc(q.who) + '</p>').join('') + '</div>' : ''; })() +
    '<div><div class="label"><span class="eyebrow">칼</span><span>눌러서 바꿔 든다</span></div><div class="shop" id="smSwords"></div></div>' +
    '<div><div class="label"><span class="eyebrow">가진 것</span></div><p class="note">' +
      ['potion', 'bigpotion', 'stone', 'page', 'salt_heart', 'mushroom', 'jar', 'sentence'].filter(k => S.items[k]).map(k => esc(ITEM_NAME[k]) + ' ' + S.items[k]).join(' · ') + (S.charms ? ' · 불씨 부적 ' + S.charms : '') + '</p></div>' +
    '<p class="note">기록은 횃불에 불을 붙일 때 남는다. 나가면 마지막 횃불에서 이어진다.</p>';
  const host = $('smSwords');
  for (const id of SWORD_ORDER) {
    if (!S.swords.includes(id)) continue;
    const sw = SWORDS[id], row = document.createElement('div'); row.className = 'row';
    row.innerHTML = '<div><b>' + esc(sw.name) + (S.plus[id] ? ' +' + S.plus[id] : '') + '</b><p>' + esc(sw.desc) + ' 피해 ' + Math.round(sw.dmg * (1 + (S.plus[id] || 0) * .12)) + '</p></div><button class="buy' + (S.sword === id ? ' max' : '') + '">' + (S.sword === id ? '들고 있다' : '든다') + '</button>';
    row.querySelector('button').addEventListener('click', () => { S.sword = id; applyStats(); persist(); SFX.tap(); renderSMenu(); });
    host.appendChild(row);
  }
}

/* ---------- HUD ---------- */
let SH = {};
function storyHUD(force) {
  if (!G || G.mode !== 'story') return;
  const S = SAVE.story;
  const hp = clamp(P.hp / P.maxHp, 0, 1);
  if (force || Math.abs((SH.hp ?? -1) - hp) > .004) { $('sHpFill').style.width = (hp * 100).toFixed(1) + '%'; $('sHpTxt').textContent = Math.ceil(P.hp) + ' / ' + Math.round(P.maxHp); SH.hp = hp; }
  const xp = clamp(S.xp / xpNeedS(S.lv), 0, 1);
  if (force || Math.abs((SH.xp ?? -1) - xp) > .004) { $('sXpFill').style.width = (xp * 100).toFixed(1) + '%'; SH.xp = xp; }
  if (force || SH.lv !== S.lv) { $('sLv').textContent = 'LV ' + S.lv; SH.lv = S.lv; }
  if (force || SH.coin !== S.coin) { $('sCoin').textContent = fmtNum(S.coin); SH.coin = S.coin; }
  const pot = (S.items.potion || 0) + (S.items.bigpotion || 0);
  if (force || SH.pot !== pot) { $('sPot').hidden = !pot; $('sPotN').textContent = pot; SH.pot = pot; }
  const step = STORY_STEPS.find(s => !sf(s.f)), obj = step ? step.t : '';
  if (force || SH.obj !== obj) { $('sObj').textContent = obj; SH.obj = obj; }
  const a = STATE === 'play' && WD && !G.trans ? nearAct() : null, lab = a ? ACT_LABEL[a.k] : '';
  if (force || SH.act !== lab) { $('sAct').hidden = !a; $('sActL').textContent = lab; SH.act = lab; }
  if (G.boss) $('bossFill').style.width = (clamp(G.boss.hp / G.boss.maxHp, 0, 1) * 100).toFixed(1) + '%';
}
function usePotion() {
  if (STATE !== 'play' || G.mode !== 'story') return;
  const S = SAVE.story, k = P.hp < P.maxHp * .45 && S.items.bigpotion ? 'bigpotion' : S.items.potion ? 'potion' : S.items.bigpotion ? 'bigpotion' : null;
  if (!k) return;
  S.items[k]--; heal(P.maxHp * (k === 'bigpotion' ? 1 : .4)); SFX.heal(); buzz(15); persist(); storyHUD(true);
}

/* ---------- start, death, portals ---------- */
function startStory(at) {
  audioInit();
  if (!SAVE.story) SAVE.story = freshStory();
  const S = SAVE.story;
  newRun();
  E.length = 0; G.weapons = []; G.buildDirty = true;
  G.mode = 'story'; G.char = 'lamp'; G.revives = 0; G.spk = []; G.slashes = []; G.camZoom = .84;
  applyStats(); P.hp = P.maxHp;
  STATE = 'play'; hideAll();
  document.body.classList.add('story');
  $('hud').hidden = false; $('hud').classList.remove('arena'); $('sHud').hidden = false;
  $('bossBar').hidden = true; $('bannerHost').innerHTML = ''; $('hint').hidden = true;
  hudCache = {}; SH = {};
  INPUT.joy = null; updMove();
  AU.track = ''; AU.intensity = 1;
  const where = at || S.cp;
  enterArea(where.area, { x: where.x, y: where.y });
  if (!sf('got_wood') && where.area === 'village') G.later.push({ t: 1.6, fn: () => banner('등불 마을', '고물상 바렌을 찾아 말을 건다', 'good') });
}
function storyDeath() {
  const S = SAVE.story, lost = Math.floor(S.coin * .1);
  S.coin -= lost; persist();
  STATE = 'wipe';
  wipe(() => {
    startStory(S.cp);
    banner('다시 일어났다', lost ? '동전 ' + lost + '개를 흘렸다' : '불이 기억하고 있었다', 'warn');
  });
}
function storyGate(id) {
  const S = SAVE.story;
  STORY_GATE = { id, area: WD.id, x: P.x, y: P.y + TL * .8 };
  persist();
  $('sHud').hidden = true; $('sDlg').hidden = true;
  audioInit(); STATE = 'wipe';
  wipe(() => { setupBossRun(id); G.startAct = 1; $('hud').hidden = true; hudCache = {}; openDraft(); });
}
function storyGateEnd(win) {
  const g = STORY_GATE; STORY_GATE = null;
  const S = SAVE.story, first = win && !sf('gate_' + g.id);
  if (win) { S.flags['gate_' + g.id] = 1; S.coin += first ? 300 * (GATES.findIndex(x => x.id === g.id) + 1) : 80; if (first) SAVE.bossKills[g.id] = (SAVE.bossKills[g.id] || 0) + 1; }
  persist();
  $('cutscene').hidden = true; $('credits').hidden = true;
  STATE = 'wipe';
  wipe(() => {
    startStory(win ? { area: g.area, x: g.x, y: g.y } : S.cp);
    if (win) banner(GATES.find(x => x.id === g.id).name, first ? '문을 닫았다' : '다시 닫았다', 'good');
    if (first && gearFrom(g.id).length) setTimeout(() => banner('새 보스 장비', gearFrom(g.id).join(', '), 'good'), 2600);
    else banner('쓰러졌다', '횃불에서 다시 일어났다', 'warn');
  });
}
function leaveStory() {
  document.body.classList.remove('story');
  $('sHud').hidden = true; $('sDlg').hidden = true;
  WD = null; persist(); openTitle();
}

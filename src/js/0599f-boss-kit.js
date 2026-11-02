/* ================= story bosses: each one gets its own moves =================
   A boss keeps a way of moving and a list of attacks drawn from the library below.
   Bullets have shapes (feathers, bones, flakes, sand, ink drops...) and can speed up,
   curve, home in, wait and then fire, or split. Below half health everything comes
   faster and denser, and one more attack joins the list. */
const SB = { beams: [], waves: [] };
const BKIT = {
  colossus:   { move: 'chase',  shot: 'rock',    col: '#9EA4B4', moves: ['slam', 'rings', 'rain', 'fanA', 'summon'], extra: 'accel' },
  owl:        { move: 'orbit',  shot: 'feather', col: '#E8E2F0', moves: ['dash', 'curveArcs', 'fanA', 'homing', 'sig'], extra: 'spiral' },
  oak:        { move: 'anchor', shot: 'leaf',    col: '#7FB06A', moves: ['waveWall', 'slam', 'rain', 'accel', 'sig'], extra: 'flower' },
  grove:      { move: 'anchor', shot: 'spore',   col: '#A8F0C8', moves: ['spiral2', 'flower', 'homing', 'cross', 'summon', 'sig'], extra: 'rings' },
  golem:      { move: 'chase',  shot: 'shard',   col: '#F4F1EA', moves: ['slam', 'splitBall', 'rain', 'rings', 'sig'], extra: 'waveWall' },
  vulture:    { move: 'orbit',  shot: 'bone',    col: '#F2EEDF', moves: ['dash', 'shotgun', 'curveArcs', 'fanA', 'sig'], extra: 'rain' },
  mirage:     { move: 'blink',  shot: 'star',    col: '#FFD23F', moves: ['flower', 'spiral', 'fanA', 'homing', 'sig'], extra: 'cross' },
  sandking:   { move: 'anchor', shot: 'sand',    col: '#E6C88A', moves: ['spiral4', 'waveWall', 'rain', 'accel', 'slam', 'sig'], extra: 'flower' },
  orca:       { move: 'orbit',  shot: 'drop',    col: '#7CC6D8', moves: ['dash', 'rings', 'curveArcs', 'waveWall', 'sig'], extra: 'shotgun' },
  lighthouse: { move: 'anchor', shot: 'orb',     col: '#FFD23F', moves: ['sweep', 'homing', 'rings', 'fanA', 'sig'], extra: 'cross' },
  iceberg:    { move: 'chase',  shot: 'flake',   col: '#E9F7FB', moves: ['rings', 'splitBall', 'slam', 'rain', 'sig'], extra: 'accel' },
  leviathan:  { move: 'orbit',  shot: 'flake',   col: '#9ED6E6', moves: ['cross', 'spiral2', 'waveWall', 'homing', 'rain', 'sig'], extra: 'sweep' },
  pagegiant:  { move: 'chase',  shot: 'paper',   col: '#F4F1EA', moves: ['waveWall', 'shotgun', 'slam', 'fanA', 'sig'], extra: 'splitBall' },
  quill:      { move: 'orbit',  shot: 'drop',    col: '#2B3170', moves: ['dash', 'fanA', 'curveArcs', 'spiral', 'sig'], extra: 'flower' },
  stamp:      { move: 'blink',  shot: 'ring',    col: '#FF4F9E', moves: ['rain', 'rings', 'flower', 'accel', 'sig'], extra: 'cross' },
  author:     { move: 'anchor', shot: 'drop',    col: '#141B40', moves: ['sweep', 'cross', 'homing', 'spiral2', 'rain', 'sig'], extra: 'flower' },
  cata:       { move: 'anchor', shot: 'star',    col: '#FF4F9E', moves: ['spiral4', 'cross', 'flower', 'rain', 'rings', 'homing'], extra: 'sweep' },
};
function sbShot(e, a, spd, o) {
  const K2 = BKIT[e.bk];
  return fireEB(e.x, e.y, a, spd, o && o.dmg || 10, false, Object.assign({ shape: K2.shot, col: K2.col, r: 6, story: 1 }, o || {}));
}
const sbAim = e => Math.atan2(P.y - e.y, P.x - e.x);
// every attack: a short warning, then the shots; returns how long it keeps the boss busy
const BMOVE = {
  rings(e, h) { const n = Math.round(14 * h.dens), w = h.hard ? 4 : 3; for (let k = 0; k < w; k++) G.later.push({ t: k * .38, fn: () => { if (e.dead) return; const off = k * Math.PI / n; for (let i = 0; i < n; i++) sbShot(e, off + i / n * TAU, (110 + k * 18) * h.spd); SFX.spit(); ringFx(e.x, e.y, 40, BKIT[e.bk].col, .25, 4); } }); return 1.4; },
  spiral(e, h) { const arms = h.hard ? 3 : 2, dur = 2.4, step = .07; let a = rnd(TAU); for (let t = 0; t < dur; t += step) G.later.push({ t, fn: () => { if (e.dead) return; for (let k = 0; k < arms; k++) sbShot(e, a + k / arms * TAU, 125 * h.spd); a += .27; } }); return dur; },
  spiral2(e, h) { const dur = 2.6; let a = 0; for (let t = 0; t < dur; t += .09) G.later.push({ t, fn: () => { if (e.dead) return; for (let k = 0; k < 2; k++) { sbShot(e, a + k * Math.PI, 115 * h.spd); sbShot(e, -a + k * Math.PI + .3, 95 * h.spd, { shape: 'orb', r: 5 }); } a += .21; } }); return dur; },
  spiral4(e, h) { const dur = 3, arms = h.hard ? 5 : 4; let a = rnd(TAU); for (let t = 0; t < dur; t += .1) G.later.push({ t, fn: () => { if (e.dead) return; for (let k = 0; k < arms; k++) sbShot(e, a + k / arms * TAU, 105 * h.spd, { curve: .35 }); a += .16; } }); return dur; },
  fanA(e, h) { const v = h.hard ? 4 : 3; for (let k = 0; k < v; k++) G.later.push({ t: k * .32, fn: () => { if (e.dead) return; const a = sbAim(e), n = 5 + (k % 2), sp = .9; for (let i = 0; i < n; i++) sbShot(e, a + (i - (n - 1) / 2) * sp / (n - 1), 190 * h.spd); SFX.spit(); } }); return 1.3; },
  shotgun(e, h) { for (let k = 0; k < (h.hard ? 3 : 2); k++) G.later.push({ t: k * .5, fn: () => { if (e.dead) return; const a = sbAim(e); for (let i = 0; i < 12; i++) sbShot(e, a + rnd(-.45, .45), rnd(150, 290) * h.spd, { spin: rnd(-8, 8) }); SFX.spit(); shake(3); } }); return 1.3; },
  curveArcs(e, h) { for (let k = 0; k < 3; k++) G.later.push({ t: k * .4, fn: () => { if (e.dead) return; const a = sbAim(e); for (let i = 0; i < 6; i++) { sbShot(e, a - 1 - i * .08, 160 * h.spd, { curve: 1.1 }); sbShot(e, a + 1 + i * .08, 160 * h.spd, { curve: -1.1 }); } SFX.spit(); } }); return 1.5; },
  accel(e, h) { const n = Math.round(18 * h.dens); for (let k = 0; k < 2; k++) G.later.push({ t: k * .6, fn: () => { if (e.dead) return; const off = rnd(TAU); for (let i = 0; i < n; i++) sbShot(e, off + i / n * TAU, 30, { acc: 1.9, max: 320 * h.spd }); SFX.charge && SFX.charge(); } }); return 1.6; },
  homing(e, h) { const n = h.hard ? 6 : 4; for (let i = 0; i < n; i++) G.later.push({ t: i * .18, fn: () => { if (e.dead) return; sbShot(e, rnd(TAU), 90, { home: 2.2, homeT: 2.4, r: 9, shape: 'orb', big: true }); } }); SFX.whisper && SFX.whisper(); return 1.4; },
  flower(e, h) {
    // bullets bloom out and hang there, then all turn on you at once
    const n = Math.round(16 * h.dens);
    for (let i = 0; i < n; i++) { const a = i / n * TAU; sbShot(e, a, 160, { decel: 4.2, wait: 1.1, aim: 1, go: 210 * h.spd }); }
    SFX.spit(); return 1.8;
  },
  waveWall(e, h) {
    // a row of bullets marching across, swaying
    const a = sbAim(e), px = -Math.sin(a), py = Math.cos(a), n = 13;
    for (let w = 0; w < (h.hard ? 3 : 2); w++) G.later.push({ t: w * .7, fn: () => { if (e.dead) return; const gap = Math.floor(rnd(2, n - 2)); for (let i = 0; i < n; i++) { if (Math.abs(i - gap) < 1.5) continue; const o = (i - (n - 1) / 2) * 26; fireEB(e.x + px * o, e.y + py * o, a, 120 * h.spd, 10, false, { shape: BKIT[e.bk].shot, col: BKIT[e.bk].col, r: 6, story: 1, wig: 1.6 }); } SFX.spit(); } });
    return 1.8;
  },
  splitBall(e, h) { for (let k = 0; k < (h.hard ? 3 : 2); k++) G.later.push({ t: k * .55, fn: () => { if (e.dead) return; sbShot(e, sbAim(e) + rnd(-.3, .3), 140 * h.spd, { r: 13, big: true, shape: 'orb', split: { t: .9, n: 10, spd: 150 * h.spd, dmg: 9 } }); SFX.spit(); } }); return 1.5; },
  rain(e, h) {
    const n = h.hard ? 7 : 5;
    for (let i = 0; i < n; i++) {
      const x = P.x + rnd(-150, 150) + P.vx * .4, y = P.y + rnd(-110, 110) + P.vy * .4;
      TG.push({ x, y, r: 54, t: -i * .16, dur: .95, kind: 'emeteor', dead: false, cb: () => {
        ringFx(x, y, 60, BKIT[e.bk].col, .3, 6); burst(x, y, 10, BKIT[e.bk].col, 200);
        if (STATE === 'play' && d2(P.x, P.y, x, y) < (54 + P.r) ** 2) hurtPlayer(16);
        for (let k = 0; k < 6; k++) fireEB(x, y, k / 6 * TAU + rnd(.5), 120, 8, false, { shape: BKIT[e.bk].shot, col: BKIT[e.bk].col, r: 5, story: 1, life: 1.4 });
        SFX.boom(false); shake(3);
      } });
    }
    return 1.6;
  },
  slam(e, h) {
    // a ring of force rolls outward; dash through it or be clear of it
    TG.push({ x: e.x, y: e.y, r: 90, t: 0, dur: .8, kind: 'eslam', follow: e, dead: false });
    G.later.push({ t: .8, fn: () => { if (e.dead) return; for (let k = 0; k < (h.hard ? 3 : 2); k++) SB.waves.push({ x: e.x, y: e.y, r: 20 - k * 70, spd: 300 * h.spd, w: 14, life: 2.2, col: BKIT[e.bk].col, hit: false }); shake(12); SFX.boom(true); splat(e.x, e.y, 120, false); } });
    return 1.7;
  },
  sweep(e, h) {
    // a beam that warns, then turns slowly through the arena
    const a0 = sbAim(e) - 1.2;
    SB.beams.push({ e, a: a0, va: (h.hard ? 1.1 : .8) * (Math.random() < .5 ? 1 : -1), t: 0, warn: 1, dur: 3.2, w: 18, len: 900, col: BKIT[e.bk].col });
    SFX.charge && SFX.charge(); return 3.6;
  },
  cross(e, h) {
    const n = h.hard ? 6 : 4, a0 = rnd(TAU), va = (Math.random() < .5 ? 1 : -1) * .5;
    for (let i = 0; i < n; i++) SB.beams.push({ e, a: a0 + i / n * TAU, va, t: 0, warn: 1.1, dur: 2.8, w: 14, len: 700, col: BKIT[e.bk].col });
    SFX.charge && SFX.charge(); return 3.4;
  },
  dash(e, h) {
    e.st2 = 'aim'; e.st2T = .6 / h.spd; const a = sbAim(e); e.dx = Math.cos(a); e.dy = Math.sin(a);
    TG.push({ x: e.x, y: e.y, a, len: 380, t: 0, dur: e.st2T, kind: 'eline', w: e.r * 1.5, dead: false });
    return e.st2T + .55;
  },
  summon(e, h) { const t = e.type; for (let i = 0; i < (h.hard ? 6 : 4); i++) { const a = i / 6 * TAU; storySpawnMob(pick(REG_MOBS[WD.reg]), e.x + Math.cos(a) * 80, e.y + Math.sin(a) * 80).idle = false; } SFX.roar(); return .8; },
  sig(e, h) { const BD = BOSS[e.bk]; if (BD.sig && SIG[BD.sig]) SIG[BD.sig](e); return 1.2; },
};
function storyBossAI(e, dt, ux, uy, dist) {
  const K2 = BKIT[e.bk], hard = e.hp < e.maxHp * .5;
  const h = { hard, spd: hard ? 1.22 : 1, dens: hard ? 1.35 : 1 };
  if (hard && !e.hardSaid) { e.hardSaid = 1; banner(BOSS[e.bk].name, L('화가 났다'), 'warn'); SFX.roar(); shake(14); ringFx(e.x, e.y, 160, COL.pink, .5, 8); }
  // a dash in progress
  if (e.st2 === 'aim') { e.st2T -= dt; if (e.st2T <= 0) { e.st2 = 'go'; e.st2T = .45; SFX.swish(); } return Z0; }
  if (e.st2 === 'go') {
    e.st2T -= dt;
    if (Math.random() < dt * 22) sbShot(e, rnd(TAU), 20, { life: 2.2, r: 5 });
    PT.push({ x: e.x + rnd(-e.r, e.r) * .6, y: e.y + rnd(-e.r, e.r) * .6, vx: 0, vy: 0, life: .4, max: .4, s: rnd(4, 8), c: K2.col, dead: false });
    if (e.st2T <= 0) { e.st2 = ''; if (hard) BMOVE.fanA(e, h); }
    return [e.dx * 720 * h.spd, e.dy * 720 * h.spd];
  }
  // the next attack
  e.busy = (e.busy === undefined ? 1.2 : e.busy) - dt;
  if (e.busy <= 0 && STATE === 'play') {
    const list = hard ? [...K2.moves, K2.extra] : K2.moves;
    let m; do { m = pick(list); } while (list.length > 1 && m === e.lastMove);
    e.lastMove = m;
    e.busy = BMOVE[m](e, h) + (hard ? .35 : .8);
  }
  // how it moves between attacks
  const sp = e.spd * (hard ? 1.15 : 1);
  if (K2.move === 'chase') return dist > e.r + 40 ? [ux * sp, uy * sp] : Z0;
  if (K2.move === 'orbit') {
    e.side = e.side || 1; if (Math.random() < dt * .3) e.side *= -1;
    const want = 220, rad = (dist - want) / want, tx = ux * rad * 1.6 - uy * e.side, ty = uy * rad * 1.6 + ux * e.side, tl = Math.hypot(tx, ty) || 1;
    return [tx / tl * sp * 1.2, ty / tl * sp * 1.2];
  }
  if (K2.move === 'blink') {
    e.blinkT = (e.blinkT === undefined ? 3 : e.blinkT) - dt;
    if (e.blinkT <= 0) {
      e.blinkT = hard ? 2.4 : 3.6;
      burst(e.x, e.y, 16, K2.col, 260); ringFx(e.x, e.y, 70, K2.col, .3, 5);
      for (let k = 0; k < 20; k++) { const a = rnd(TAU), r = rnd(160, 260), nx = P.x + Math.cos(a) * r, ny = P.y + Math.sin(a) * r; if (!solidT(Math.floor(nx / TL), Math.floor(ny / TL))) { e.x = nx; e.y = ny; break; } }
      burst(e.x, e.y, 16, K2.col, 260); ringFx(e.x, e.y, 70, K2.col, .3, 5); SFX.zap && SFX.zap();
    }
    return dist > 240 ? [ux * sp * .6, uy * sp * .6] : Z0;
  }
  // anchor: drift back toward where it started, sway a little
  const be = WD.bossE, hx = be ? be.x : e.x, hy = be ? be.y : e.y, dx = hx - e.x, dy = hy - e.y, dl = Math.hypot(dx, dy);
  const sw = Math.sin(e.t * .8) * 40;
  return dl > 30 ? [dx / dl * sp + Math.cos(e.t) * sw * .3, dy / dl * sp] : [Math.cos(e.t * .7) * sp * .5, Math.sin(e.t * .9) * sp * .3];
}

/* ---------- moving the shaped bullets, beams and rings of force ---------- */
function storyBulletTick(dt) {
  for (const b of EB) {
    if (b.dead || !b.story) continue;
    if (b.spin) b.rot = (b.rot || 0) + b.spin * dt;
    if (b.acc) { const s = Math.hypot(b.vx, b.vy), ns = Math.min(b.max || 400, s * (1 + b.acc * dt) + 40 * dt), k = ns / (s || 1); b.vx *= k; b.vy *= k; }
    if (b.curve) { const c = Math.cos(b.curve * dt), s2 = Math.sin(b.curve * dt), vx = b.vx * c - b.vy * s2; b.vy = b.vx * s2 + b.vy * c; b.vx = vx; }
    if (b.decel && !b.launched) { const k = Math.exp(-b.decel * dt); b.vx *= k; b.vy *= k; }
    if (b.wait && !b.launched && b.t >= b.wait) { b.launched = 1; const a = b.aim ? Math.atan2(P.y - b.y, P.x - b.x) : Math.atan2(b.vy, b.vx); b.vx = Math.cos(a) * b.go; b.vy = Math.sin(a) * b.go; }
    if (b.home && b.t < (b.homeT || 2)) { const a = Math.atan2(P.y - b.y, P.x - b.x), cur = Math.atan2(b.vy, b.vx); let d = a - cur; while (d > Math.PI) d -= TAU; while (d < -Math.PI) d += TAU; const na = cur + clamp(d, -b.home * dt, b.home * dt), s = Math.hypot(b.vx, b.vy); b.vx = Math.cos(na) * s; b.vy = Math.sin(na) * s; }
  }
  if (!G.boss || G.boss.dead) { SB.beams.length = 0; SB.waves.length = 0; return; }
  for (const bm of SB.beams) {
    bm.t += dt; if (bm.t > bm.warn) bm.a += bm.va * dt;
    if (bm.t > bm.warn && bm.t < bm.warn + bm.dur && STATE === 'play') {
      const x0 = bm.e.x, y0 = bm.e.y, dx = Math.cos(bm.a), dy = Math.sin(bm.a), px = P.x - x0, py = P.y - y0, along = px * dx + py * dy, off = Math.abs(px * dy - py * dx);
      if (along > 0 && along < bm.len && off < bm.w / 2 + P.r * .6) hurtPlayer(14);
    }
  }
  SB.beams = SB.beams.filter(b => b.t < b.warn + b.dur && !b.e.dead);
  for (const w of SB.waves) {
    w.r += w.spd * dt; w.life -= dt;
    if (w.r > 0 && STATE === 'play' && !w.hit && !(P.dashT > 0)) { const d = Math.hypot(P.x - w.x, P.y - w.y); if (Math.abs(d - w.r) < w.w + P.r * .5) { w.hit = true; hurtPlayer(16); } }
  }
  SB.waves = SB.waves.filter(w => w.life > 0);
}
function drawBossKit(now) {
  wt(); ctx.save(); ctx.lineCap = 'round';
  for (const bm of SB.beams) {
    const x0 = bm.e.x, y0 = bm.e.y, x1 = x0 + Math.cos(bm.a) * bm.len, y1 = y0 + Math.sin(bm.a) * bm.len;
    if (bm.t < bm.warn) {
      ctx.globalAlpha = .25 + (bm.t / bm.warn) * .4; ctx.strokeStyle = COL.pink; ctx.lineWidth = 2; ctx.setLineDash([10, 8]); ctx.lineDashOffset = -now * 40;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.setLineDash([]);
    } else {
      const fl = 1 + Math.sin(now * 40) * .1;
      ctx.globalAlpha = .35; ctx.strokeStyle = bm.col; ctx.lineWidth = bm.w * 2.2 * fl; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      ctx.globalAlpha = .9; ctx.strokeStyle = COL.ink; ctx.lineWidth = bm.w + 4; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      ctx.strokeStyle = bm.col; ctx.lineWidth = bm.w; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      ctx.strokeStyle = COL.white; ctx.lineWidth = bm.w * .3; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    }
  }
  for (const w of SB.waves) {
    if (w.r <= 0) continue;
    ctx.globalAlpha = Math.min(1, w.life) * .9; ctx.strokeStyle = COL.ink; ctx.lineWidth = w.w * 1.4; ctx.beginPath(); ctx.arc(w.x, w.y, w.r, 0, TAU); ctx.stroke();
    ctx.strokeStyle = w.col; ctx.lineWidth = w.w * .8; ctx.beginPath(); ctx.arc(w.x, w.y, w.r, 0, TAU); ctx.stroke();
  }
  ctx.restore(); ctx.globalAlpha = 1;
}
// bullets with a shape: drawn upright, turned to where they are going
function drawShapedBullet(b) {
  const a = b.rot !== undefined && b.spin ? b.rot : Math.atan2(b.vy, b.vx), r = b.r || 6, c = b.col || COL.pink;
  ctx.setTransform(K, 0, 0, K, b.x * K + OX, b.y * K * TY + OY); ctx.rotate(a);
  ctx.lineJoin = 'round'; ctx.lineWidth = 1.6; ctx.strokeStyle = COL.ink; ctx.fillStyle = c;
  const glow = () => { ctx.globalAlpha = .3; ctx.fillStyle = COL.pink; ctx.beginPath(); ctx.arc(0, 0, r * 1.7, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; ctx.fillStyle = c; };
  switch (b.shape) {
    case 'feather': glow(); ctx.beginPath(); ctx.moveTo(r * 1.8, 0); ctx.quadraticCurveTo(0, -r * .9, -r * 1.6, 0); ctx.quadraticCurveTo(0, r * .9, r * 1.8, 0); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(r * 1.8, 0); ctx.lineTo(-r * 2, 0); ctx.stroke(); break;
    case 'leaf': glow(); ctx.beginPath(); ctx.moveTo(r * 1.6, 0); ctx.quadraticCurveTo(0, -r * 1.2, -r * 1.4, 0); ctx.quadraticCurveTo(0, r * 1.2, r * 1.6, 0); ctx.fill(); ctx.stroke(); ctx.strokeStyle = '#2E5E50'; ctx.beginPath(); ctx.moveTo(r * 1.4, 0); ctx.lineTo(-r * 1.2, 0); ctx.stroke(); break;
    case 'shard': glow(); ctx.beginPath(); ctx.moveTo(r * 2, 0); ctx.lineTo(0, -r * .7); ctx.lineTo(-r * 1.4, 0); ctx.lineTo(0, r * .7); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.beginPath(); ctx.moveTo(r * 1.6, 0); ctx.lineTo(0, -r * .4); ctx.lineTo(0, 0); ctx.fill(); break;
    case 'bone': glow(); ctx.fillRect(-r * 1.2, -r * .3, r * 2.4, r * .6); ctx.strokeRect(-r * 1.2, -r * .3, r * 2.4, r * .6); for (const sx of [-1.3, 1.3]) for (const sy of [-.4, .4]) { ctx.beginPath(); ctx.arc(sx * r, sy * r, r * .42, 0, TAU); ctx.fill(); ctx.stroke(); } break;
    case 'flake': glow(); ctx.strokeStyle = c; ctx.lineWidth = 2.4; for (let k = 0; k < 3; k++) { ctx.rotate(Math.PI / 3); ctx.beginPath(); ctx.moveTo(-r * 1.3, 0); ctx.lineTo(r * 1.3, 0); ctx.moveTo(r * .8, 0); ctx.lineTo(r * 1.1, -r * .35); ctx.moveTo(r * .8, 0); ctx.lineTo(r * 1.1, r * .35); ctx.stroke(); } ctx.fillStyle = COL.white; ctx.beginPath(); ctx.arc(0, 0, r * .3, 0, TAU); ctx.fill(); break;
    case 'sand': ctx.fillStyle = c; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(Math.cos(k * 1.7) * r * .6, Math.sin(k * 2.3) * r * .6, r * .5, 0, TAU); ctx.fill(); } ctx.strokeStyle = 'rgba(138,110,69,.8)'; ctx.beginPath(); ctx.arc(0, 0, r * .9, 0, TAU); ctx.stroke(); ctx.globalAlpha = .4; ctx.beginPath(); ctx.moveTo(-r * 3, 0); ctx.lineTo(-r, 0); ctx.stroke(); ctx.globalAlpha = 1; break;
    case 'drop': glow(); ctx.beginPath(); ctx.moveTo(r * 1.6, 0); ctx.bezierCurveTo(r * .4, -r * 1.1, -r * 1.3, -r * .9, -r * 1.1, 0); ctx.bezierCurveTo(-r * 1.3, r * .9, r * .4, r * 1.1, r * 1.6, 0); ctx.fill(); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.arc(-r * .3, -r * .35, r * .3, 0, TAU); ctx.fill(); break;
    case 'star': glow(); ctx.rotate(performance.now() / 150); ctx.beginPath(); for (let k = 0; k < 8; k++) { const rr = k % 2 ? r * .55 : r * 1.5, aa = k / 8 * TAU; k ? ctx.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr) : ctx.moveTo(Math.cos(aa) * rr, Math.sin(aa) * rr); } ctx.closePath(); ctx.fill(); ctx.stroke(); break;
    case 'ring': ctx.strokeStyle = COL.ink; ctx.lineWidth = 4.5; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.stroke(); ctx.strokeStyle = c; ctx.lineWidth = 2.6; ctx.stroke(); break;
    case 'paper': ctx.rotate(performance.now() / 120); ctx.fillStyle = COL.paper; ctx.fillRect(-r, -r * .7, r * 2, r * 1.4); ctx.strokeRect(-r, -r * .7, r * 2, r * 1.4); ctx.strokeStyle = 'rgba(37,53,111,.6)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-r * .6, -r * .2); ctx.lineTo(r * .6, -r * .2); ctx.moveTo(-r * .6, r * .2); ctx.lineTo(r * .3, r * .2); ctx.stroke(); break;
    case 'rock': ctx.fillStyle = c; ctx.beginPath(); for (let k = 0; k < 7; k++) { const aa = k / 7 * TAU, rr = r * (.8 + (k % 3) * .15); k ? ctx.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr) : ctx.moveTo(Math.cos(aa) * rr, Math.sin(aa) * rr); } ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.arc(-r * .3, -r * .3, r * .25, 0, TAU); ctx.fill(); break;
    case 'spore': { const p = 1 + Math.sin(performance.now() / 90 + b.x) * .15; ctx.globalAlpha = .35; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(0, 0, r * 1.8 * p, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(0, 0, r * p, 0, TAU); ctx.fill(); ctx.stroke(); ctx.fillStyle = COL.white; for (let k = 0; k < 3; k++) ctx.fillRect(Math.cos(k * 2.1) * r * .5 - 1, Math.sin(k * 2.1) * r * .5 - 1, 2, 2); break; }
    default: glow(); ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); ctx.stroke(); ctx.fillStyle = COL.white; ctx.globalAlpha = .7; ctx.beginPath(); ctx.arc(-r * .3, -r * .3, r * .35, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
  }
}

/* ================= the heavenly blade, drawn sharp; and the last stage's new tricks ================= */
/* a crescent that tapers to two needle points */
function bladeArc(cx, cy, r, a, span, thick, bulge = 1) {
  const n = 22;
  ctx.beginPath();
  for (let i = 0; i <= n; i++) { const f = i / n, aa = a - span / 2 + span * f, w = Math.pow(Math.sin(f * Math.PI), 1.6) * thick; ctx[i ? 'lineTo' : 'moveTo'](cx + Math.cos(aa) * (r + w * .5 * bulge), cy + Math.sin(aa) * (r + w * .5 * bulge)); }
  for (let i = n; i >= 0; i--) { const f = i / n, aa = a - span / 2 + span * f, w = Math.pow(Math.sin(f * Math.PI), 1.6) * thick; ctx.lineTo(cx + Math.cos(aa) * (r - w * .5), cy + Math.sin(aa) * (r - w * .5)); }
  ctx.closePath();
}
function flare(x, y, s, al = 1) {
  ctx.save(); ctx.globalAlpha = al; ctx.fillStyle = COL.white; ctx.shadowColor = '#FFE58A'; ctx.shadowBlur = 12 * K;
  ctx.beginPath(); ctx.moveTo(x, y - s); ctx.lineTo(x + s * .12, y - s * .12); ctx.lineTo(x + s * 1.6, y); ctx.lineTo(x + s * .12, y + s * .12); ctx.lineTo(x, y + s); ctx.lineTo(x - s * .12, y + s * .12); ctx.lineTo(x - s * 1.6, y); ctx.lineTo(x - s * .12, y - s * .12); ctx.closePath(); ctx.fill();
  ctx.restore();
}
/* one holy crescent: dark under-print for contrast, bloom, gold body, white core, hairline ink edge, flared tips */
function holyCrescent(cx, cy, r, a, span, thick, al) {
  wt();
  ctx.globalAlpha = al * .32; ctx.fillStyle = COL.deep; bladeArc(cx + 2.5, cy + 3, r, a, span, thick * 1.35); ctx.fill();
  ctx.save(); ctx.globalAlpha = al; ctx.shadowColor = '#FFC93A'; ctx.shadowBlur = 26 * K;
  ctx.fillStyle = '#FFF1C9'; bladeArc(cx, cy, r, a, span, thick); ctx.fill(); ctx.restore();
  ctx.globalAlpha = al; ctx.fillStyle = COL.white; bladeArc(cx, cy, r + thick * .14, a + span * .02, span * .86, thick * .55); ctx.fill();
  ctx.strokeStyle = GOLD; ctx.lineWidth = 1.6; bladeArc(cx, cy, r, a, span, thick); ctx.stroke();
  ctx.strokeStyle = COL.deep; ctx.lineWidth = .9; ctx.globalAlpha = al * .7; bladeArc(cx + .8, cy + .8, r, a, span, thick); ctx.stroke();
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = al * .35; ctx.strokeStyle = GOLD; ctx.lineWidth = thick * .5; ctx.beginPath(); ctx.arc(cx, cy, r - thick * .9, a - span * .3, a + span * .3); ctx.stroke(); ctx.restore();
  ctx.globalAlpha = 1;
  for (const sd of [-1, 1]) { const ta = a + sd * span / 2; flare(cx + Math.cos(ta) * r, cy + Math.sin(ta) * r, 7 * al + 2, al); }
}
/* the sword in hand: a needle of light */
function holySword(bx, by, a, L) {
  const ca = Math.cos(a), sa = Math.sin(a), nx = -sa, ny = ca, tipx = bx + ca * L, tipy = by + sa * L, wB = 5.5;
  wt();
  ctx.save(); ctx.shadowColor = '#FFD95A'; ctx.shadowBlur = 18 * K;
  ctx.fillStyle = GOLD; ctx.beginPath(); ctx.moveTo(bx + nx * wB, by + ny * wB); ctx.lineTo(tipx, tipy); ctx.lineTo(bx - nx * wB, by - ny * wB); ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.fillStyle = COL.white; ctx.beginPath(); ctx.moveTo(bx + nx * wB * .45, by + ny * wB * .45); ctx.lineTo(tipx - ca * 4, tipy - sa * 4); ctx.lineTo(bx - nx * wB * .2, by - ny * wB * .2); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = COL.deep; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(bx + nx * wB, by + ny * wB); ctx.lineTo(tipx, tipy); ctx.lineTo(bx - nx * wB, by - ny * wB); ctx.stroke();
  ctx.strokeStyle = COL.deep; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(bx + nx * 11, by + ny * 11); ctx.lineTo(bx - nx * 11, by - ny * 11); ctx.stroke();
  ctx.strokeStyle = GOLD; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(bx + nx * 10, by + ny * 10); ctx.lineTo(bx - nx * 10, by - ny * 10); ctx.stroke();
  ctx.fillStyle = COL.pink; ctx.beginPath(); ctx.arc(bx, by, 2.6, 0, TAU); ctx.fill();
  flare(tipx, tipy, 5 + Math.sin(performance.now() / 90) * 2, .95);
}

/* ---------- new tricks for the last stage ---------- */
function shardRain(e, n) {
  for (let i = 0; i < n; i++) later(e, i * .35, () => {
    const x = clamp(P.x + rnd(-RW * .7, RW * .7), -RW + 40, RW - 40);
    E.push({ type: 'skyshard', ai: 'shard', fixed: true, x, y: -RH - 40, vy: rnd(70, 95), r: 20, hp: 1e9, maxHp: 1e9, dmg: 0, xp: 0, kbRes: 1, kx: 0, ky: 0, t: 0, ph: rnd(TAU), flash: 0, hit: {}, face: 1, scl: 1, owner: e, dead: false });
    SFX.thread();
  });
}
function shardStruck(s) {
  if (s.reflect) return;
  s.reflect = true; s.vy = -760; s.vx = (G.eye ? G.eye.x - s.x : 0) * 1.4;
  addGlint(s.x, s.y, 1.5); SFX.zap(); shake(3);
}
function updateShard(s, dt) {
  s.t += dt;
  if (s.reflect) {
    s.x += s.vx * dt; s.y += s.vy * dt;
    if (Math.random() < .8) PT.push({ x: s.x, y: s.y, vx: rnd(-30, 30), vy: rnd(20, 80), life: .35, max: .35, s: rnd(2, 4), c: Math.random() < .5 ? GOLD : COL.white, dead: false });
    if (s.y < -RH - 140) {
      s.dead = true;
      const b = s.owner;
      if (b && !b.dead) { let d = b.maxHp * .011; if (b.hp - d < b.hpFloor) d = Math.max(0, b.hp - b.hpFloor); b.hp -= d; G.dmgDealt += d; TX.push({ x: s.x, y: -RH - 170, vy: -40, life: 1, max: 1, v: Math.round(d), crit: true, dead: false }); }
      ringFx(s.x, -RH - 150, 90, GOLD, .4, 8); burst(s.x, -RH - 150, 20, COL.white, 300); if (G.eye) G.eye.hurt = .5;
      SFX.boom(true); shake(10); pulseScreen(1);
    }
    return;
  }
  s.y += s.vy * dt;
  if (s.y > RH - 16) {
    s.dead = true;
    ringFx(s.x, s.y, 70, COL.ink, .3, 6); burst(s.x, s.y, 14, COL.white, 220); splat(s.x, s.y, 60, false);
    if (STATE === 'play' && d2(P.x, P.y, s.x, s.y) < (70 + P.r * .5) ** 2) hurtPlayer(20);
    if (gate('shd', 80)) SFX.boom(false);
  }
}
function drawShard(s) {
  const a = s.t * (s.reflect ? 14 : 1.2) + s.ph, r = s.r;
  wt();
  if (!s.reflect) { ctx.globalAlpha = .5; ctx.setLineDash([4, 6]); ctx.strokeStyle = COL.pink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(s.x, s.y + r); ctx.lineTo(s.x, RH); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1; }
  ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(a);
  ctx.shadowColor = s.reflect ? '#FFD95A' : 'rgba(255,255,255,.8)'; ctx.shadowBlur = (s.reflect ? 18 : 8) * K;
  ctx.fillStyle = s.reflect ? GOLD : '#EEF3FF'; ctx.beginPath(); ctx.moveTo(0, -r * 1.3); ctx.lineTo(r * .7, r * .4); ctx.lineTo(-r * .2, r); ctx.lineTo(-r * .8, 0); ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0; ctx.strokeStyle = COL.deep; ctx.lineWidth = 2; ctx.stroke();
  ctx.strokeStyle = COL.white; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-r * .3, -r * .5); ctx.lineTo(r * .2, r * .3); ctx.stroke();
  ctx.restore();
  if (!s.reflect) { ctx.globalAlpha = .9; ctx.strokeStyle = GOLD; ctx.lineWidth = 2; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.arc(s.x, s.y, r + 9, s.t * 3, s.t * 3 + TAU); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1; }
}
function judgment(e, lvl) {
  const safes = [], n = lvl >= 2 ? 2 : 3;
  for (let i = 0; i < n; i++) safes.push({ x: clamp(rnd(-RW + 90, RW - 90), -RW + 90, RW - 90), y: rnd(-RH + 70, RH - 70), r: 62 });
  safes[0].x = clamp(P.x + rnd(-260, 260), -RW + 90, RW - 90);
  HZ.push({ k: 'bloom', safes, warn: 2.6, t: 0, dmg: 42, dead: false, gold: 1 });
  banner('심판', '금빛 성역 안으로', 'warn'); SFX.charge(2.4); SFX.whisper();
  if (G.eye) G.eye.judge = 2.6;
}
function drawScribBall(e) {
  wt(); ctx.lineCap = 'round';
  const r = e.r * (1 + Math.sin(e.t * 8) * .08);
  spr(SP.shadow, e.x, e.y + r * .8, r * 2.2, r * .7);
  wt();
  for (let k = 0; k < 9; k++) {
    let a = rnd(TAU), x = e.x + Math.cos(a) * rnd(0, r * .5), y = e.y + Math.sin(a) * rnd(0, r * .5), h = rnd(TAU);
    ctx.strokeStyle = k < 2 ? COL.pink : e.flash > 0 ? COL.white : COL.deep; ctx.lineWidth = rnd(2, 4);
    ctx.beginPath(); ctx.moveTo(x, y);
    for (let s = 0; s < 6; s++) { h += rnd(-1.4, 1.4); x += Math.cos(h) * r * .35; y += Math.sin(h) * r * .35; if (Math.hypot(x - e.x, y - e.y) > r) { x = lerp(x, e.x, .4); y = lerp(y, e.y, .4); } ctx.lineTo(x, y); }
    ctx.stroke();
  }
}

function holyStreak(x, y, ang, len, w, al) {
  const ca = Math.cos(ang), sa = Math.sin(ang), nx = -sa, ny = ca, h = len / 2;
  wt();
  ctx.save(); ctx.globalAlpha = al; ctx.shadowColor = '#FFC93A'; ctx.shadowBlur = 20 * K;
  ctx.fillStyle = '#FFF4D2';
  ctx.beginPath(); ctx.moveTo(x - ca * h, y - sa * h); ctx.lineTo(x + nx * w / 2, y + ny * w / 2); ctx.lineTo(x + ca * h, y + sa * h); ctx.lineTo(x - nx * w / 2, y - ny * w / 2); ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.globalAlpha = al; ctx.fillStyle = COL.white;
  ctx.beginPath(); ctx.moveTo(x - ca * h * .9, y - sa * h * .9); ctx.lineTo(x + nx * w * .22, y + ny * w * .22); ctx.lineTo(x + ca * h * .9, y + sa * h * .9); ctx.lineTo(x - nx * w * .22, y - ny * w * .22); ctx.closePath(); ctx.fill();
  ctx.globalAlpha = 1;
}
function addCut(x, y) { (G.cuts = G.cuts || []).push({ x, y, a: rnd(TAU), t0: performance.now() }); if (G.cuts.length > 30) G.cuts.shift(); }
function drawCuts() {
  if (!G.cuts || !G.cuts.length) return;
  const now = performance.now();
  G.cuts = G.cuts.filter(c => now - c.t0 < 240);
  for (const c of G.cuts) {
    const q = (now - c.t0) / 240, len = 70 + q * 70, al = 1 - q;
    holyStreak(c.x, c.y, c.a, len, 6 * (1 - q * .6), al);
    holyStreak(c.x, c.y, c.a + 1.15, len * .75, 4.5 * (1 - q * .6), al * .85);
    holyStreak(c.x, c.y, c.a - .9, len * .5, 3.5 * (1 - q * .6), al * .7);
    starburst(c.x, c.y, 18 * (1 - q) + 6, al, c.a);
  }
}
/* the swing itself: a hairline of light tracing the arc */
function holySwingLine(cx, cy, R, a0, a1, q, fin) {
  wt();
  const al = 1 - q;
  ctx.save(); ctx.lineCap = 'round'; ctx.shadowColor = '#FFC93A'; ctx.shadowBlur = 22 * K;
  ctx.globalAlpha = al; ctx.strokeStyle = COL.white; ctx.lineWidth = 3.2 * al + .8;
  ctx.beginPath(); ctx.arc(cx, cy, R, a0, a1); ctx.stroke();
  ctx.globalAlpha = al * .8; ctx.strokeStyle = GOLD; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.arc(cx, cy, R + 7, a0 + (a1 - a0) * .15, a1); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, R - 9, a0 + (a1 - a0) * .35, a1); ctx.stroke();
  ctx.restore();
  if (fin) for (let k = 0; k < 8; k++) { const a = a0 + k / 8 * TAU; holyStreak(cx + Math.cos(a) * R * .95, cy + Math.sin(a) * R * .95, a, 60 * al + 20, 5 * al + 1, al); }
  else flare(cx + Math.cos(a1) * R, cy + Math.sin(a1) * R, 6 * al + 3, al);
}

/* ---------- the flashy layer: afterimage blades, ray bursts, starbursts ---------- */
function hash1(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
/* a straight radial blade of light, from r0 out to a needle tip at r1 */
function ghostBlade(cx, cy, a, r0, r1, w, al) {
  const ca = Math.cos(a), sa = Math.sin(a), nx = -sa, ny = ca, rm = r0 + (r1 - r0) * .22;
  const bx = cx + ca * r0, by = cy + sa * r0, mx = cx + ca * rm, my = cy + sa * rm, tx = cx + ca * r1, ty = cy + sa * r1;
  ctx.globalAlpha = al * .35; ctx.fillStyle = COL.deep;
  ctx.beginPath(); ctx.moveTo(bx + 2, by + 2.5); ctx.lineTo(mx + nx * w + 2, my + ny * w + 2.5); ctx.lineTo(tx + 2, ty + 2.5); ctx.lineTo(mx - nx * w + 2, my - ny * w + 2.5); ctx.closePath(); ctx.fill();
  ctx.save(); ctx.globalAlpha = al; ctx.shadowColor = '#FFC93A'; ctx.shadowBlur = 16 * K; ctx.fillStyle = GOLD;
  ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(mx + nx * w, my + ny * w); ctx.lineTo(tx, ty); ctx.lineTo(mx - nx * w, my - ny * w); ctx.closePath(); ctx.fill(); ctx.restore();
  ctx.globalAlpha = al; ctx.fillStyle = COL.white;
  ctx.beginPath(); ctx.moveTo(bx + ca * 4, by + sa * 4); ctx.lineTo(mx + nx * w * .4, my + ny * w * .4); ctx.lineTo(tx - ca * 3, ty - sa * 3); ctx.lineTo(mx - nx * w * .15, my - ny * w * .15); ctx.closePath(); ctx.fill();
  ctx.globalAlpha = 1;
}
/* big eight-point star with long horizontal/vertical spikes */
function starburst(x, y, s, al, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  for (const [k, len, w] of [[0, 1, .1], [1, .55, .08]]) {
    ctx.rotate(k * Math.PI / 4);
    ctx.globalAlpha = al; ctx.fillStyle = k ? COL.white : '#FFF4D2'; ctx.shadowColor = '#FFC93A'; ctx.shadowBlur = 24 * K;
    ctx.beginPath();
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2, b = a + Math.PI / 4; ctx.lineTo(Math.cos(a) * s * len, Math.sin(a) * s * len); ctx.lineTo(Math.cos(b) * s * w, Math.sin(b) * s * w); }
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  ctx.save(); ctx.globalAlpha = al; ctx.fillStyle = COL.white; ctx.beginPath(); ctx.arc(x, y, s * .12, 0, TAU); ctx.fill(); ctx.restore();
}
/* the swing itself: a fan of afterimage blades sweeping the arc, ray burst off the edge, hairline arcs, star at the tip */
function holySwingFx(cx, cy, R, a0, a1, q, fin, seed) {
  wt();
  const al = 1 - q, span = a1 - a0, n = fin ? 18 : 8;
  ctx.save(); ctx.lineCap = 'round';
  ctx.globalAlpha = al * .22; ctx.strokeStyle = COL.deep; ctx.lineWidth = 16; ctx.beginPath(); ctx.arc(cx + 2, cy + 3, R * .95, a0, a1); ctx.stroke();
  ctx.restore();
  for (let i = 0; i < n; i++) {
    const f = n === 1 ? 1 : i / (n - 1), ang = a0 + span * f, lead = fin ? 1 : .2 + .8 * f;
    const len = R * (1.02 + (fin ? .12 * Math.sin(i * 1.7) : .14 * f));
    ghostBlade(cx, cy, ang, R * .3, len, (fin ? 6 : 4 + 4 * f) * (1 - q * .4), al * lead * (fin ? .8 : .85));
  }
  ctx.save(); ctx.lineCap = 'round'; ctx.shadowColor = '#FFC93A'; ctx.shadowBlur = 22 * K;
  ctx.globalAlpha = al; ctx.strokeStyle = COL.white; ctx.lineWidth = 4 * al + 1; ctx.beginPath(); ctx.arc(cx, cy, R, a0, a1); ctx.stroke();
  ctx.globalAlpha = al * .9; ctx.strokeStyle = GOLD; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.arc(cx, cy, R + 9, a0 + span * .1, a1); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, R * .62, a0 + span * .3, a1); ctx.stroke();
  ctx.restore();
  const rays = fin ? 14 : 6;
  for (let k = 0; k < rays; k++) {
    const f = hash1(seed + k), ang = a0 + span * (fin ? k / rays : .25 + .75 * f), r0 = R * (1.05 + hash1(seed + k + 9) * .1), L = (30 + hash1(seed + k + 3) * 50) * (fin ? 1.6 : 1) * (.4 + q);
    holyStreak(cx + Math.cos(ang) * (r0 + L / 2), cy + Math.sin(ang) * (r0 + L / 2), ang, L, 3.2 * al + .6, al * .9);
  }
  if (!fin) starburst(cx + Math.cos(a1) * R, cy + Math.sin(a1) * R, 22 * al + 8, al, seed);
  else starburst(cx, cy, 70 * al + 20, al, seed + q);
  wt();
}
/* long rays thrown out by the spinning finisher */
function addRays(x, y, R, n) { const t0 = performance.now(), off = rnd(TAU); for (let k = 0; k < n; k++) (G.hrays = G.hrays || []).push({ x, y, a: off + k / n * TAU + rnd(-.08, .08), R, L: R * rnd(1.6, 2.6), t0, w: rnd(5, 9) }); }
function drawRays() {
  if (!G.hrays || !G.hrays.length) return;
  const now = performance.now();
  G.hrays = G.hrays.filter(r => now - r.t0 < 380);
  for (const r of G.hrays) {
    const q = (now - r.t0) / 380, d = r.R * .6 + r.L * Math.min(1, q * 2.4) * .5, L = r.L * (1 - q * .5);
    holyStreak(r.x + Math.cos(r.a) * (d + L / 2), r.y + Math.sin(r.a) * (d + L / 2), r.a, L, r.w * (1 - q), 1 - q);
  }
}
/* sparks peeling off a swing */
function swingSparks(a0, a1, R, n) {
  for (let i = 0; i < n; i++) {
    const ang = a0 + (a1 - a0) * Math.random(), r = R * rnd(.7, 1.05), sp = rnd(160, 420), tang = ang + (a1 > a0 ? 1 : -1) * Math.PI / 2;
    PT.push({ x: P.x + Math.cos(ang) * r, y: P.y + Math.sin(ang) * r, vx: Math.cos(tang) * sp * .6 + Math.cos(ang) * sp, vy: Math.sin(tang) * sp * .6 + Math.sin(ang) * sp, life: rnd(.3, .6), max: .6, s: rnd(2, 4.5), c: i % 3 ? GOLD : COL.white, dead: false });
  }
}

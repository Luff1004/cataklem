/* ================= story: the boss walks on =================
   Getting close to a sleeping boss starts a short scene: black bars, the camera
   swings over, the arena changes (the sea pours in, the ground splits, roots break
   through...), the boss rises, its name slams in, and the fight starts in the
   changed arena. Tap or press a key to skip. */
const BOSS_STAGE = {
  colossus: 'quake', rake: 'quake', bloom: 'roots', eye: 'night', owl: 'night', oak: 'roots', grove: 'roots',
  golem: 'salt', vulture: 'storm', mirage: 'haze', sandking: 'sandpit', orca: 'flood', lighthouse: 'beam',
  iceberg: 'ice', leviathan: 'flood', pagegiant: 'ink', quill: 'ink', stamp: 'ink', author: 'ink', cata: 'ink'
};
const SCUT_END = 5.4;
let SC = null;
function storyBossIntro(be) {
  if (STATE !== 'play' || SC) return;
  const id = be.o.id, kind = BOSS_STAGE[id] || 'quake', R = mulberry((WD.A.seed || 3) * 17 + 5);
  const rad = Math.min(WD.w, WD.h) * TL * .46;
  WD.boss = null;
  WD.afx = { kind, id, p: 0, cx: be.x, cy: be.y, R: rad, data: stageData(kind, R, rad), out: 0 };
  SC = { be, t: 0, kind, spawned: false, from: [G.camX, G.camY], said: {} };
  STATE = 'scut'; INPUT.joy = null; updMove();
  document.body.classList.add('scut');
  SFX.warn(); AU.intensity = 3;
}
function stageData(kind, R, rad) {
  const d = { cracks: [], roots: [], spikes: [], scraps: [], rubble: [] };
  for (let i = 0; i < 9; i++) {
    const a = i / 9 * TAU + R() * .5, pts = [[0, 0]]; let x = 0, y = 0, aa = a;
    const n = 6 + Math.floor(R() * 4);
    for (let k = 0; k < n; k++) { aa += (R() - .5) * .7; const st = rad * (.08 + R() * .07); x += Math.cos(aa) * st; y += Math.sin(aa) * st; pts.push([x, y]); }
    d.cracks.push(pts);
  }
  for (let i = 0; i < 9; i++) { const a = i / 9 * TAU + R() * .4; d.roots.push({ a, wob: R() * 6, w: 10 + R() * 8, bend: (R() - .5) * 1.4 }); }
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + R() * .3; d.spikes.push({ a, h: 30 + R() * 34, w: 10 + R() * 8, r: .78 + R() * .14 }); }
  for (let i = 0; i < 18; i++) d.scraps.push({ a: R() * TAU, r: R(), rot: R() * TAU, s: 8 + R() * 10 });
  for (let i = 0; i < 16; i++) d.rubble.push({ a: R() * TAU, r: .2 + R() * .75, s: 5 + R() * 8, rot: R() * TAU });
  return d;
}
function storyCutTick(dt) {
  const s = SC, be = s.be; s.t += dt;
  if (G.fade > 0) G.fade = Math.max(0, G.fade - dt * 2.4);
  const once = (k, at, fn) => { if (!s.said[k] && s.t >= at) { s.said[k] = 1; fn(); } };
  // camera: over to the boss, a little closer, then back to you
  const toB = ease(clamp(s.t / .9, 0, 1)), back = ease(clamp((s.t - 4.5) / .8, 0, 1));
  const bx = lerp(s.from[0], be.x, toB), by = lerp(s.from[1], be.y, toB);
  G.camX = lerp(bx, P.x, back); G.camY = lerp(by, P.y, back);
  G.camZoom = 1 + .16 * toB * (1 - back);
  // the arena changes
  if (WD.afx) WD.afx.p = clamp((s.t - .8) / 1.8, 0, 1);
  once('rum', .8, () => { SFX.rumble(); shake(6); buzz(30); });
  if (s.t > .8 && s.t < 2.6) shake(3 + (s.t - .8) * 2);
  once('mid', 1.7, () => { if (s.kind === 'flood') SFX.wave(); else if (s.kind === 'roots') SFX.scratch(); else SFX.thud(); });
  // the boss rises
  once('spawn', 2.4, () => {
    storySpawnBoss(be, true); s.spawned = true;
    const col = s.kind === 'flood' || s.kind === 'ice' ? COL.white : s.kind === 'ink' ? COL.pink : COL.ink;
    for (let i = 0; i < 4; i++) G.later.push({ t: i * .1, fn: () => ringFx(be.x, be.y, 90 + i * 50, i % 2 ? col : COL.ink, .5, 8) });
    for (let i = 0; i < 40; i++) { const a = rnd(TAU), v = rnd(120, 420); PT.push({ x: be.x, y: be.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120, life: rnd(.5, 1), max: 1, s: rnd(3, 7), c: s.kind === 'flood' ? (i % 2 ? COL.white : '#7CC6D8') : i % 2 ? COL.ink : COL.pink, dead: false }); }
    SFX.roar(); SFX.boom(true); shake(16); buzz([40, 60, 80]);
  });
  if (s.spawned && G.boss && G.boss.introScale < 1) G.boss.introScale = Math.min(1, G.boss.introScale + dt * 1.4);
  once('title', 3.0, () => { SFX.clank(); SFX.thud(); shake(8); });
  // small things keep moving while the game waits
  G.later = G.later.filter(l => { l.t -= dt; if (l.t <= 0) { l.fn(); return false; } return true; });
  updateRings(dt);
  for (const p of PT) { p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= .96; p.vy *= .96; p.life -= dt; if (p.life <= 0) p.dead = true; }
  for (let i = PT.length - 1; i >= 0; i--) if (PT[i].dead) PT.splice(i, 1);
  G.shake *= Math.exp(-dt * 9); if (G.shake < .2) G.shake = 0;
  if (s.t >= SCUT_END) endBossIntro();
}
function endBossIntro() {
  const s = SC; if (!s) return;
  if (!s.spawned) storySpawnBoss(s.be, true);
  if (G.boss) G.boss.introScale = 1;
  if (WD.afx) WD.afx.p = 1;
  G.camZoom = 1; G.camX = P.x; G.camY = P.y;
  SC = null; STATE = 'play'; document.body.classList.remove('scut');
  storyHUD(true);
}
function skipBossIntro() { if (SC && SC.t > .7) { SFX.tap(); endBossIntro(); } }
addEventListener('keydown', e => { if (STATE === 'scut' && ['e', 'Enter', ' ', 'Escape'].includes(e.key)) { e.preventDefault(); skipBossIntro(); } }, true);
addEventListener('pointerdown', () => { if (STATE === 'scut') skipBossIntro(); }, true);

/* ---------- the changed arena, on the ground ---------- */
function afxP() {
  const f = WD && WD.afx; if (!f) return 0;
  if (f.out) { const q = 1 - (performance.now() - f.out) / 2000; if (q <= 0) { WD.afx = null; return 0; } return f.p * q; }
  return f.p;
}
function drawArenaFx(now) {
  const f = WD && WD.afx, p = afxP(); if (!f || p <= 0) return;
  const { cx, cy, R, data: d } = f; wt();
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (f.kind === 'quake') {
    for (const pts of d.cracks) {
      const n = Math.max(2, Math.floor(pts.length * p));
      for (const [col, lw] of [[COL.ink, 7], [COL.pink, 2.2]]) {
        ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath();
        for (let i = 0; i < n; i++) i ? ctx.lineTo(cx + pts[i][0], cy + pts[i][1]) : ctx.moveTo(cx + pts[i][0], cy + pts[i][1]);
        ctx.stroke();
      }
    }
    ctx.fillStyle = COL.ink;
    for (const r of d.rubble) { const x = cx + Math.cos(r.a) * R * r.r, y = cy + Math.sin(r.a) * R * r.r, s = r.s * p; ctx.save(); ctx.translate(x, y); ctx.rotate(r.rot); ctx.fillRect(-s / 2, -s / 2, s, s * .7); ctx.restore(); }
  } else if (f.kind === 'roots') {
    for (const r of d.roots) {
      const sx = cx + Math.cos(r.a) * R * 1.05, sy = cy + Math.sin(r.a) * R * 1.05, ex = cx + Math.cos(r.a) * R * (1.05 - .8 * p), ey = cy + Math.sin(r.a) * R * (1.05 - .8 * p);
      const mx = (sx + ex) / 2 + Math.cos(r.a + Math.PI / 2) * R * .2 * r.bend, my = (sy + ey) / 2 + Math.sin(r.a + Math.PI / 2) * R * .2 * r.bend;
      for (const [col, lw] of [[COL.ink, r.w + 4], [WD.reg === 2 ? '#4A3A2E' : '#6B4A33', r.w], ['rgba(255,255,255,.18)', r.w * .3]]) {
        ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(mx, my, ex, ey); ctx.stroke();
      }
    }
    if (f.id === 'grove' || f.id === 'bloom') { ctx.globalAlpha = .35 * p; ctx.fillStyle = '#4F8A7E'; ctx.beginPath(); ctx.ellipse(cx, cy, R * .5, R * .5, 0, 0, TAU); ctx.fill(); }
  } else if (f.kind === 'salt') {
    ctx.globalAlpha = .4 * p; ctx.fillStyle = COL.white; ctx.beginPath(); ctx.ellipse(cx, cy, R, R, 0, 0, TAU); ctx.fill();
    ctx.globalAlpha = .5 * p; ctx.strokeStyle = '#9EB8C4'; ctx.lineWidth = 1.5;
    for (const pts of d.cracks) { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(cx + x, cy + y) : ctx.moveTo(cx + x, cy + y)); ctx.stroke(); }
  } else if (f.kind === 'sandpit') {
    const rr = R * .95 * p;
    ctx.globalAlpha = .55; ctx.fillStyle = '#C4A775'; ctx.beginPath(); ctx.ellipse(cx, cy, rr, rr, 0, 0, TAU); ctx.fill();
    ctx.globalAlpha = .75; ctx.strokeStyle = '#8A6E45'; ctx.lineWidth = 3;
    for (let arm = 0; arm < 4; arm++) {
      ctx.beginPath();
      for (let k = 0; k <= 40; k++) { const q = k / 40, a = arm / 4 * TAU + q * 5 + now * 1.6, r = rr * (1 - q); k ? ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r) : ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
      ctx.stroke();
    }
    ctx.globalAlpha = .8; ctx.fillStyle = '#3A2A1A'; ctx.beginPath(); ctx.ellipse(cx, cy, rr * .16, rr * .16, 0, 0, TAU); ctx.fill();
  } else if (f.kind === 'flood') {
    const rr = R * 1.25 * p;
    ctx.globalAlpha = .82; ctx.fillStyle = f.id === 'leviathan' ? '#3F7C9C' : '#3C8FB4'; ctx.beginPath(); ctx.ellipse(cx, cy, rr, rr, 0, 0, TAU); ctx.fill();
    ctx.globalAlpha = .35; ctx.fillStyle = '#1F4E6E'; ctx.beginPath(); ctx.ellipse(cx, cy, rr * .6, rr * .6, 0, 0, TAU); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.ellipse(cx, cy, rr, rr, 0, 0, TAU); ctx.clip();
    ctx.globalAlpha = .45; ctx.strokeStyle = COL.white; ctx.lineWidth = 2;
    for (let k = 0; k < 14; k++) { const yy = cy - rr + k * rr / 7, off = (now * 40 + k * 37) % 120; for (let xx = cx - rr - 120 + off; xx < cx + rr; xx += 120) { ctx.beginPath(); ctx.moveTo(xx, yy); ctx.quadraticCurveTo(xx + 15, yy - 5, xx + 30, yy); ctx.stroke(); } }
    ctx.restore();
    ctx.globalAlpha = .8; ctx.strokeStyle = COL.white; ctx.lineWidth = 4; ctx.setLineDash([12, 9]); ctx.lineDashOffset = -now * 20;
    ctx.beginPath(); ctx.ellipse(cx, cy, rr, rr, 0, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    // a fin circles before it comes up
    if (SC && !SC.spawned && SC.t > 1.4) {
      const a = SC.t * 3.2, fx = cx + Math.cos(a) * 70, fy = cy + Math.sin(a) * 50;
      ctx.globalAlpha = 1; ctx.fillStyle = COL.ink; ctx.beginPath(); ctx.moveTo(fx - 12, fy); ctx.quadraticCurveTo(fx - 2, fy - 30, fx + 10, fy - 34); ctx.quadraticCurveTo(fx + 4, fy - 14, fx + 12, fy); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = COL.white; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(fx, fy, 16, 0, Math.PI); ctx.stroke();
    }
    // ripples where you wade
    if (Math.hypot(P.x - cx, P.y - cy) < rr) { ctx.globalAlpha = .6; ctx.strokeStyle = COL.white; ctx.lineWidth = 1.8; for (let k = 0; k < 2; k++) { const q = (now * 1.4 + k * .5) % 1; ctx.globalAlpha = .6 * (1 - q); ctx.beginPath(); ctx.ellipse(P.x, P.y + 12, 10 + q * 22, 5 + q * 10, 0, 0, TAU); ctx.stroke(); } }
  } else if (f.kind === 'ice') {
    ctx.globalAlpha = .5 * p; ctx.fillStyle = '#CFE3EA'; ctx.beginPath(); ctx.ellipse(cx, cy, R * 1.1 * p, R * 1.1 * p, 0, 0, TAU); ctx.fill();
    ctx.globalAlpha = .7 * p; ctx.strokeStyle = COL.white; ctx.lineWidth = 2;
    for (const pts of d.cracks) { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(cx + x, cy + y) : ctx.moveTo(cx + x, cy + y)); ctx.stroke(); }
  } else if (f.kind === 'ink') {
    const rr = R * 1.1 * p;
    ctx.globalAlpha = .72; ctx.fillStyle = COL.deep; ctx.beginPath();
    for (let k = 0; k <= 48; k++) { const a = k / 48 * TAU, r = rr * (.92 + Math.sin(a * 7 + now) * .04 + Math.sin(a * 3) * .05); k ? ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r) : ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
    ctx.fill();
    ctx.globalAlpha = .85;
    for (const sc of d.scraps) { const x = cx + Math.cos(sc.a) * rr * sc.r, y = cy + Math.sin(sc.a) * rr * sc.r; ctx.save(); ctx.translate(x, y); ctx.rotate(sc.rot + now * .2); ctx.fillStyle = COL.paper; ctx.fillRect(-sc.s / 2, -sc.s * .35, sc.s, sc.s * .7); ctx.strokeStyle = COL.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-sc.s * .35, 0); ctx.lineTo(sc.s * .35, 0); ctx.stroke(); ctx.restore(); }
    if (f.id === 'cata') { ctx.globalAlpha = .6 * p; ctx.strokeStyle = COL.pink; ctx.lineWidth = 2; for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.arc(cx, cy, rr * (.3 + k * .1), now * (k % 2 ? 1 : -1) * .5 + k, now * (k % 2 ? 1 : -1) * .5 + k + 2); ctx.stroke(); } }
  }
  ctx.restore(); ctx.globalAlpha = 1;
}
// salt crystals stand up, so they are drawn upright
function drawArenaFxUp() {
  const f = WD && WD.afx, p = afxP(); if (!f || p <= 0 || f.kind !== 'salt') return;
  wu();
  for (const s of f.data.spikes) {
    const x = f.cx + Math.cos(s.a) * f.R * s.r, y = (f.cy + Math.sin(s.a) * f.R * s.r) * TY, h = s.h * p;
    ctx.fillStyle = '#E8F2F4'; ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(x - s.w / 2, y); ctx.lineTo(x - s.w * .1, y - h); ctx.lineTo(x + s.w / 2, y); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(124,198,216,.5)'; ctx.beginPath(); ctx.moveTo(x - s.w * .1, y - h); ctx.lineTo(x + s.w / 2, y); ctx.lineTo(x + s.w * .1, y); ctx.closePath(); ctx.fill();
  }
}

/* ---------- the changed arena, over everything: night, storms, snow, a lighthouse beam ---------- */
function drawArenaFxTop(now) {
  const f = WD && WD.afx, p = afxP(); if (!f || p <= 0) return;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  const sx = (P.x * K + OX) / DPR, sy = (P.y * K * TY + OY) / DPR;
  if (f.kind === 'night' || f.kind === 'beam') {
    ctx.save(); ctx.globalAlpha = .55 * p; ctx.fillStyle = '#0B1030';
    ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.arc(sx, sy, 130, 0, TAU, true);
    if (f.kind === 'beam') {
      const bx = (f.cx * K + OX) / DPR, by = ((f.cy - 40) * K * TY + OY) / DPR, a = now * .8, sp = .28, L2 = Math.max(W, H) * 1.2;
      ctx.moveTo(bx, by); ctx.lineTo(bx + Math.cos(a + sp) * L2, by + Math.sin(a + sp) * L2); ctx.lineTo(bx + Math.cos(a - sp) * L2, by + Math.sin(a - sp) * L2); ctx.closePath();
    }
    ctx.fill('evenodd'); ctx.restore();
    if (f.kind === 'night') {
      ctx.globalAlpha = .9 * p; ctx.fillStyle = '#FFF1C2'; ctx.beginPath(); ctx.arc(W - 90, 90, 30, 0, TAU); ctx.fill();
      ctx.fillStyle = '#0B1030'; ctx.beginPath(); ctx.arc(W - 78, 82, 26, 0, TAU); ctx.fill();
      ctx.fillStyle = COL.paper; for (let i = 0; i < 14; i++) { const q = (now * .12 + i * .071) % 1, x = (i * 173.7) % W + Math.sin(now + i) * 30, y = q * H; ctx.globalAlpha = .7 * p; ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(now * 2 + i)); ctx.beginPath(); ctx.ellipse(0, 0, 7, 2.5, 0, 0, TAU); ctx.fill(); ctx.restore(); }
    }
  }
  if (f.kind === 'storm' || f.kind === 'haze') {
    ctx.globalAlpha = (f.kind === 'storm' ? .22 : .14) * p; ctx.fillStyle = '#E9C88A'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = f.kind === 'storm' ? 'rgba(160,120,70,.55)' : 'rgba(255,255,255,.35)'; ctx.lineWidth = f.kind === 'storm' ? 2 : 6;
    for (let i = 0; i < (f.kind === 'storm' ? 40 : 8); i++) {
      const y = (i * 97.3) % H, x = ((now * (f.kind === 'storm' ? 700 : 60) + i * 211) % (W + 200)) - 100;
      ctx.globalAlpha = p * (f.kind === 'storm' ? .7 : .5); ctx.beginPath();
      if (f.kind === 'storm') { ctx.moveTo(x, y); ctx.lineTo(x + 60, y + 6); }
      else { ctx.moveTo(0, y); for (let xx = 0; xx <= W; xx += 40) ctx.lineTo(xx, y + Math.sin(xx / 60 + now * 2 + i) * 8); }
      ctx.stroke();
    }
  }
  if (f.kind === 'ice' || f.id === 'leviathan') {
    ctx.fillStyle = COL.white;
    for (let i = 0; i < 50; i++) { const q = (now * .08 + i * .0371) % 1, x = (i * 137.1 + Math.sin(now * .7 + i) * 24) % W, y = q * H; ctx.globalAlpha = .8 * p; ctx.beginPath(); ctx.arc(x, y, 1.5 + (i % 3), 0, TAU); ctx.fill(); }
  }
  if (f.id === 'grove' || f.id === 'bloom') {
    for (let i = 0; i < 24; i++) { const q = (now * .06 + i * .043) % 1, x = (i * 151.3 + Math.sin(now + i) * 40) % W, y = H * (1 - q); ctx.globalAlpha = .7 * p * Math.sin(q * Math.PI); ctx.fillStyle = '#A8F0C8'; ctx.beginPath(); ctx.arc(x, y, 2.2, 0, TAU); ctx.fill(); }
  }
  ctx.globalAlpha = 1;
}

/* ---------- bars and the name card ---------- */
function drawCutOverlay() {
  if (!SC) return;
  const t = SC.t, b = SC.be, B = BOSS[b.o.id];
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  const barIn = ease(clamp(t / .5, 0, 1)) * (1 - ease(clamp((t - 4.9) / .5, 0, 1))), bh = H * .11 * barIn;
  ctx.fillStyle = '#0B0E22'; ctx.fillRect(0, 0, W, bh); ctx.fillRect(0, H - bh, W, bh);
  if (t > .9) { ctx.globalAlpha = .6 * barIn; ctx.fillStyle = COL.paper; ctx.font = '700 11px "IBM Plex Mono", monospace'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText(L('건너뛰기') + ' ▸', W - 18, H - bh / 2); ctx.globalAlpha = 1; }
  // the name
  const q = clamp((t - 3.0) / .35, 0, 1), out = clamp((t - 4.4) / .4, 0, 1);
  if (q <= 0 || out >= 1 || !B) return;
  const cyc = H * .64, band = ease(q) * (1 - ease(out));
  ctx.save();
  ctx.globalAlpha = .92 * (1 - out); ctx.fillStyle = COL.deep;
  ctx.beginPath(); ctx.moveTo(0, cyc - 48); ctx.lineTo(W * band, cyc - 54); ctx.lineTo(W * band - 30, cyc + 56); ctx.lineTo(0, cyc + 50); ctx.closePath(); ctx.fill();
  ctx.fillStyle = COL.pink; ctx.fillRect(0, cyc + 50, W * band, 4);
  const tx = W * .5 + (1 - ease(q)) * -80;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha = 1 - out;
  ctx.fillStyle = COL.yellow; ctx.font = '700 12px "IBM Plex Mono", monospace'; ctx.fillText(WD.A.name, tx, cyc - 30);
  const size = Math.min(58, W / Math.max(6, B.name.length) * 1.1);
  ctx.font = '400 ' + size.toFixed(0) + 'px "Gasoek One", "Dela Gothic One", sans-serif';
  ctx.fillStyle = COL.pink; ctx.fillText(B.name, tx + 3, cyc + 5);
  ctx.fillStyle = COL.paper; ctx.fillText(B.name, tx, cyc + 2);
  ctx.font = '700 14px "Gothic A1", "Noto Sans JP", "Noto Sans SC", sans-serif'; ctx.fillStyle = 'rgba(244,241,234,.85)'; ctx.fillText(B.sub || '', tx, cyc + 40);
  ctx.restore();
}

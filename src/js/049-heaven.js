/* ================= the heavenly sword, and the last stage's dressing ================= */
const GOLD = '#F5C542';
function addGlint(x, y, s = 1) { (G.glints = G.glints || []).push({ x, y, t0: performance.now(), s }); if (G.glints.length > 60) G.glints.shift(); }

/* heavenly swing: called by the sword's fire() */
function swordSwing(w, S, a) {
  const now = performance.now();
  w.combo = (w.combo || 0) + 1;
  const finisher = w.combo % 3 === 0, side = w.combo % 2 ? 1 : -1;
  const R = S.r * Math.sqrt(P.area) * (finisher ? 1.25 : 1), arc = finisher ? TAU : S.arc, dmg = S.dmg * (finisher ? 1.6 : 1);
  for (const e of E) {
    if (e.dead || e.hidden || e.under) continue;
    const dx = e.x - P.x, dy = e.y - P.y, d = Math.hypot(dx, dy) || 1;
    if (d - e.r > R) continue;
    if (!finisher && angDiff(Math.atan2(dy, dx), a) > arc / 2 + Math.asin(Math.min(1, e.r / d))) continue;
    hurtEnemy(e, dmg, dx / d * 320, dy / d * 320);
    if (w.evo) { addGlint(e.x + rnd(-e.r, e.r) * .5, e.y + rnd(-e.r, e.r) * .5, finisher ? 1.6 : 1); for (let k = 0; k < 4; k++) PT.push({ x: e.x, y: e.y, vx: rnd(-160, 160), vy: rnd(-260, -60), life: .7, max: .7, s: rnd(2, 4), c: k % 2 ? GOLD : COL.white, dead: false }); }
  }
  if (S.wave) {
    const n = finisher ? 8 : 1;
    for (let i = 0; i < n; i++) { const aa = finisher ? a + i / n * TAU : a; PR.push({ kind: 'crescent', x: P.x + Math.cos(aa) * 40, y: P.y + Math.sin(aa) * 40, vx: Math.cos(aa) * 660, vy: Math.sin(aa) * 660, a: aa, r: finisher ? 30 : 38, dmg: S.dmg * (finisher ? .45 : .6), pierce: 99, life: finisher ? .7 : .95, hitset: new Set(), boom: 0, bdmg: 0, size: 1, t: 0, dead: false }); }
  }
  (G.slashes = G.slashes || []).push({ a, R, arc, t0: now, h: !!w.evo, side, fin: finisher });
  w.swing = { a0: finisher ? a : a - arc / 2 * side, a1: finisher ? a + TAU : a + arc / 2 * side, t0: now, dur: finisher ? 220 : 120 };
  w.lastA = a;
  if (finisher) {
    if (w.evo) { ringFx(P.x, P.y, R * 1.15, GOLD, .35, 10); ringFx(P.x, P.y, R * .7, COL.white, .3, 5); G.flash = Math.max(G.flash, .18); pulseScreen(.6); }
    else ringFx(P.x, P.y, R, COL.deep, .3, 8);
    shake(w.evo ? 7 : 5); SFX.boom(false);
  }
  SFX.slash(w.evo); shake(w.evo ? 3 : 2);
}

/* light pillars when the flash is used while the sword is heavenly */
function heavenlyUlt() {
  for (let i = 0; i < 12; i++) later2(i * .07, () => {
    const tg = E.filter(e => !e.dead && (e.type === 'limb' || !e.boss));
    const t = tg.length && Math.random() < .7 ? pick(tg) : null;
    const x = t ? t.x + rnd(-30, 30) : P.x + rnd(-300, 300), y = t ? t.y + rnd(-30, 30) : P.y + rnd(-180, 180);
    (G.pillars = G.pillars || []).push({ x, y, t0: performance.now() });
    aoe(x, y, 95, 170, 220);
    burst(x, y, 16, GOLD, 300); burst(x, y, 8, COL.white, 200); addGlint(x, y, 2);
    if (gate('pil', 50)) SFX.boom(false); shake(6);
  });
  SFX.heaven();
}

/* ---------- drawing the sword's glory ---------- */
function drawHeaven() {
  const now = performance.now(), ts = now / 1000;
  const w = G.weapons && G.weapons.find(x => x.id === 'scrib_sword');
  wt();
  if (P.heavenly && G.mode === 'boss') {
    // wings
    const flap = Math.sin(ts * 3.2) * .25;
    ctx.save(); ctx.lineCap = 'round';
    for (const sd of [-1, 1]) for (let k = 0; k < 5; k++) {
      const len = 30 + k * 8, ang = -Math.PI / 2 + sd * (.75 + k * .24 + flap), sx = P.x + sd * 5, sy = P.y - 8;
      const ex = sx + Math.cos(ang) * len, ey = sy + Math.sin(ang) * len;
      ctx.globalAlpha = .55 - k * .08; ctx.strokeStyle = k % 2 ? COL.white : GOLD; ctx.lineWidth = 5.5 - k * .8;
      const st = ctx.strokeStyle, lw = ctx.lineWidth;
      ctx.strokeStyle = COL.deep; ctx.lineWidth = lw + 2.5; ctx.beginPath(); ctx.moveTo(sx + 1.5, sy + 1.5); ctx.quadraticCurveTo(sx + sd * len * .55 + 1.5, sy - len * .55 + 1.5, ex + 1.5, ey + 1.5); ctx.stroke();
      ctx.strokeStyle = st; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(sx + sd * len * .55, sy - len * .55, ex, ey); ctx.stroke();
    }
    // halo
    ctx.globalAlpha = .8; ctx.strokeStyle = COL.deep; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(P.x + 1.5, P.y - 28.5, 15, 5, 0, 0, TAU); ctx.stroke();
    ctx.globalAlpha = .9; ctx.strokeStyle = GOLD; ctx.lineWidth = 3; ctx.setLineDash([6, 4]);
    ctx.beginPath(); ctx.ellipse(P.x, P.y - 30, 15, 5, 0, ts * 2, ts * 2 + TAU); ctx.stroke(); ctx.setLineDash([]);
    ctx.globalAlpha = .5; ctx.lineWidth = 7; ctx.beginPath(); ctx.ellipse(P.x, P.y - 30, 15, 5, 0, 0, TAU); ctx.stroke();
    // motes
    for (let k = 0; k < 10; k++) { const a = ts * 1.4 + k / 10 * TAU, r = 30 + Math.sin(ts * 2 + k) * 6; ctx.globalAlpha = .7; ctx.fillStyle = k % 3 ? GOLD : COL.white; ctx.fillRect(P.x + Math.cos(a) * r - 1.5, P.y - 4 + Math.sin(a) * r * .6 - 1.5, 3, 3); }
    // ground glow
    const g = ctx.createRadialGradient(P.x, P.y + 8, 4, P.x, P.y + 8, 70);
    g.addColorStop(0, 'rgba(245,197,66,.45)'); g.addColorStop(1, 'rgba(245,197,66,0)');
    ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(P.x - 70, P.y - 62, 140, 140);
    ctx.restore();
  }
  // sword trail
  if (w && w.swing) {
    const sw = w.swing, q = (now - sw.t0) / sw.dur;
    if (q < 1.6) {
      const L = w.evo ? 74 : 54, steps = 14, upto = Math.min(1, q);
      ctx.save();
      for (let i = 0; i < steps; i++) {
        const f0 = i / steps * upto, f1 = (i + 1) / steps * upto, aA = lerp(sw.a0, sw.a1, f0), aB = lerp(sw.a0, sw.a1, f1);
        const fade = (1 - Math.max(0, q - 1) / .6) * (.25 + .75 * (i / steps));
        ctx.globalAlpha = fade * (w.evo ? .8 : .5);
        ctx.fillStyle = w.evo ? (i % 2 ? GOLD : '#FFE7A0') : COL.deep;
        ctx.beginPath(); ctx.moveTo(P.x + Math.cos(aA) * 14, P.y + Math.sin(aA) * 14); ctx.lineTo(P.x + Math.cos(aA) * L, P.y + Math.sin(aA) * L); ctx.lineTo(P.x + Math.cos(aB) * L, P.y + Math.sin(aB) * L); ctx.lineTo(P.x + Math.cos(aB) * 14, P.y + Math.sin(aB) * 14); ctx.fill();
      }
      ctx.restore();
    }
  }
  // glints: four-point flares where the light struck
  if (G.glints && G.glints.length) {
    ctx.save(); ctx.lineJoin = 'round';
    G.glints = G.glints.filter(g => now - g.t0 < 420);
    for (const g of G.glints) {
      const q = (now - g.t0) / 420, s = (8 + q * 26) * g.s, a = 1 - q;
      ctx.globalAlpha = a; ctx.fillStyle = GOLD; ctx.strokeStyle = COL.deep; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(g.x, g.y - s); ctx.lineTo(g.x + s * .14, g.y - s * .14); ctx.lineTo(g.x + s, g.y); ctx.lineTo(g.x + s * .14, g.y + s * .14); ctx.lineTo(g.x, g.y + s); ctx.lineTo(g.x - s * .14, g.y + s * .14); ctx.lineTo(g.x - s, g.y); ctx.lineTo(g.x - s * .14, g.y - s * .14); ctx.closePath(); ctx.stroke(); ctx.fill();
      ctx.fillStyle = COL.white; ctx.beginPath(); ctx.arc(g.x, g.y, s * .16, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }
  // pillars of light
  if (G.pillars && G.pillars.length) {
    G.pillars = G.pillars.filter(p => now - p.t0 < 650);
    for (const p of G.pillars) {
      const q = (now - p.t0) / 650, top = CY - VHH - 50;
      wt(); ctx.globalAlpha = 1 - q; strokeRiso(34 * (1 - q * .6), () => { ctx.beginPath(); ctx.moveTo(p.x, top); ctx.lineTo(p.x, p.y); }, GOLD, COL.deep); ctx.globalAlpha = 1;
      glowLine(p.x, top, p.x, p.y, 70 * (1 - q * .6), GOLD, .55 * (1 - q));
      glowLine(p.x, top, p.x, p.y, 22 * (1 - q * .5), COL.white, .9 * (1 - q));
      wt(); ctx.globalAlpha = 1 - q; ctx.strokeStyle = GOLD; ctx.lineWidth = 6 * (1 - q); ctx.beginPath(); ctx.ellipse(p.x, p.y, 40 + q * 70, 14 + q * 24, 0, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1;
    }
  }
}

/* ---------- the last stage: the sky's edge ---------- */
function drawFinalAmbience() {
  const now = performance.now() / 1000, e = G.boss, lvl = (e && e.esc) || 0;
  wt();
  // constellation floor
  ctx.save(); ctx.beginPath(); ctx.rect(-RW, -RH, RW * 2, RH * 2); ctx.clip();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = .08 + (P.heavenly ? .05 : 0); ctx.strokeStyle = GOLD; ctx.lineWidth = 1.5;
  ctx.beginPath(); for (let x = -RW; x <= RW; x += 80) { ctx.moveTo(x, -RH); ctx.lineTo(x, RH); } for (const y of [-RH * .33, RH * .33]) { ctx.moveTo(-RW, y); ctx.lineTo(RW, y); } ctx.stroke();
  const R = mulberry(12);
  ctx.globalAlpha = .35; ctx.lineWidth = 1;
  ctx.beginPath(); let px = -RW + 60, py = 0; ctx.moveTo(px, py); for (let k = 0; k < 18; k++) { px += 60 + R() * 20; py = (R() - .5) * RH * 1.4; ctx.lineTo(px, py); } ctx.stroke();
  for (let k = 0; k < 40; k++) { const x = -RW + ((k * 131.7) % (RW * 2)), p = (now * .12 + k * .043) % 1, y = RH - p * RH * 2; ctx.globalAlpha = Math.sin(p * Math.PI) * .9; ctx.fillStyle = k % 4 ? GOLD : COL.white; ctx.fillRect(x + Math.sin(now + k) * 8, y, 2.5, 2.5); }
  ctx.globalCompositeOperation = 'source-over';
  if (lvl >= 1) { ctx.globalAlpha = (.05 + lvl * .04) * (.7 + .3 * Math.sin(now * 3)); ctx.fillStyle = COL.pink; ctx.fillRect(-RW, -RH, RW * 2, RH * 2); }
  // ink seeping down from the top edge
  ctx.globalAlpha = .9; ctx.fillStyle = COL.deep;
  for (let k = 0; k < 26; k++) { const x = -RW + k * (RW * 2 / 25), len = 10 + Math.abs(Math.sin(now * .8 + k * 1.7)) * (18 + lvl * 12); ctx.beginPath(); ctx.moveTo(x - 7, -RH); ctx.quadraticCurveTo(x, -RH + len * 1.4, x + 7, -RH); ctx.fill(); ctx.beginPath(); ctx.arc(x, -RH + len * 1.2, 2.5, 0, TAU); ctx.fill(); }
  ctx.restore();
  // the cracked sky above the stage
  wt(); const Rc = mulberry(31 + Math.floor(now * 6) % 3);
  const crack = []; for (let x = -RW - 40; x <= RW + 40; x += 34) crack.push(x, -RH - 26 + (Rc() - .5) * 22);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineJoin = 'round';
  for (const [col, lw, al] of [[GOLD, 14, .25 + lvl * .1], [COL.pink, 6, .5], [COL.white, 2, .9]]) { ctx.globalAlpha = al * (.75 + .25 * Math.sin(now * 5)); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); for (let i = 0; i < crack.length; i += 2) i ? ctx.lineTo(crack[i], crack[i + 1]) : ctx.moveTo(crack[i], crack[i + 1]); ctx.stroke(); }
  ctx.restore();
  // dangling tentacles in the dark above
  if (e && !e.dead) {
    for (let k = 0; k < 5; k++) {
      const bx = -RW * .8 + k * RW * .4 + Math.sin(now * .5 + k) * 40, pts = [];
      for (let i = 0; i <= 10; i++) { const f = i / 10; pts.push(bx + Math.sin(now * 1.6 + k * 2 + f * 4) * 30 * f, -RH - 520 + f * (430 + Math.sin(now + k) * 30)); }
      drawTentacle(pts, 26);
    }
    drawEye(e);
  }
  for (const h of HZ) if (h.gaze && !h.dead) drawGaze(h);
}
function drawEye(e) {
  const eye = G.eye || { open: .3, x: 0, glow: 0 }, now = performance.now() / 1000;
  const cx = eye.x, cy = -RH - 150, wR = 150, hR = 70 * eye.open;
  if (hR < 2) return;
  wt();
  ctx.save();
  ctx.beginPath(); ctx.ellipse(cx, cy, wR, hR, 0, 0, TAU); ctx.fillStyle = COL.white; ctx.fill();
  ctx.clip();
  const ix = cx + clamp((P.x - cx) * .12, -60, 60), iy = cy + clamp((P.y - cy) * .03, -10, 14);
  ctx.fillStyle = COL.pink; ctx.beginPath(); ctx.arc(ix, iy, 44, 0, TAU); ctx.fill();
  ctx.fillStyle = COL.deep; ctx.beginPath(); ctx.ellipse(ix, iy, 12, 30, 0, 0, TAU); ctx.fill();
  if (eye.glow > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = eye.glow; ctx.fillStyle = GOLD; ctx.beginPath(); ctx.arc(ix, iy, 50, 0, TAU); ctx.fill(); }
  ctx.restore();
  // scribbled lids
  wt(); ctx.lineCap = 'round';
  for (let k = 0; k < 3; k++) {
    ctx.strokeStyle = k === 2 ? COL.pink : COL.deep; ctx.lineWidth = k === 0 ? 9 : 4; ctx.globalAlpha = .95;
    ctx.beginPath(); for (let i = 0; i <= 16; i++) { const a = Math.PI + i / 16 * Math.PI, x = cx + Math.cos(a) * wR + rnd(-3, 3), y = cy + Math.sin(a) * hR + rnd(-3, 3); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
    ctx.beginPath(); for (let i = 0; i <= 16; i++) { const a = i / 16 * Math.PI, x = cx + Math.cos(a) * wR + rnd(-3, 3), y = cy + Math.sin(a) * hR + rnd(-3, 3); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
  }
  for (let k = 0; k < 9; k++) { const a = Math.PI + (k + .5) / 9 * Math.PI, x = cx + Math.cos(a) * wR, y = cy + Math.sin(a) * hR; scribLine(x, y, x + Math.cos(a) * 26, y + Math.sin(a) * 30, 3, 3); }
  ctx.globalAlpha = 1;
}
function drawGaze(h) {
  const live = h.t >= h.warn, x = h.x, y0 = h.y, y1 = h.y + h.len;
  wt();
  if (!live) {
    const p = h.t / h.warn;
    ctx.globalAlpha = .4 + p * .5; ctx.strokeStyle = COL.pink; ctx.lineWidth = 2 + p * 3; ctx.setLineDash([10, 8]);
    ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke(); ctx.setLineDash([]);
    ctx.globalAlpha = .12 * p; ctx.fillStyle = COL.pink; ctx.fillRect(x - h.w / 2, y0, h.w, h.len); ctx.globalAlpha = 1;
    return;
  }
  const f = Math.min(1, (h.warn + h.dur - h.t) / .3);
  glowLine(x, y0, x, y1, h.w * 1.6 * f, COL.pink, .45);
  glowLine(x, y0, x, y1, h.w * .7 * f, COL.white, .8);
  wt();
  for (const sx of [-1, 1]) scribLine(x + sx * h.w * .5 * f, y0, x + sx * h.w * .5 * f, y1, 4, 6);
  for (let k = 0; k < 3; k++) PT.push({ x: x + rnd(-h.w / 2, h.w / 2), y: clamp(P.y + rnd(-60, 60), -RH, RH), vx: rnd(-90, 90), vy: rnd(-90, 30), life: .4, max: .4, s: rnd(2, 5), c: k % 2 ? COL.pink : COL.white, dead: false });
}

/* ---------- final stage brain additions ---------- */
const FINAL_LINES = [[.75, 'YOU ARE ONLY A SPARK.'], [.5, 'EVERY LIGHT CASTS ME.'], [.25, 'STOP. STOP DRAWING.'], [.1, 'I WAS YOUR FIRST FEAR.']];
function finalExtras(e, dt) {
  const eye = G.eye = G.eye || { open: .3, x: 0, glow: 0 };
  const gz = HZ.find(h => h.gaze && !h.dead);
  eye.open = lerp(eye.open, gz ? 1 : .32 + Math.sin(performance.now() / 900) * .05, 1 - Math.exp(-dt * 4));
  eye.glow = gz ? Math.min(1, gz.t / gz.warn) * .7 : Math.max(0, eye.glow - dt * 2);
  if (gz) eye.x = gz.x; else eye.x = lerp(eye.x, P.x * .7, 1 - Math.exp(-dt * 1.2));
  G.camZoom = lerp(G.camZoom || 1, .9, 1 - Math.exp(-dt * 1.5));
  e.said = e.said || {};
  const frac = e.hp / e.maxHp;
  for (const [th, line] of FINAL_LINES) if (frac < th && !e.said[th]) { e.said[th] = 1; G.liveSub = { text: line, t0: performance.now() }; SFX.whisper(); pulseScreen(.8); shake(6); }
}
function updateGaze(h, dt) {
  if (h.t < h.warn) h.x += clamp(P.x - h.x, -280 * dt, 280 * dt);
  else h.x += clamp(P.x - h.x, -105 * dt, 105 * dt);
  if (h.t >= h.warn && !h.lit) { h.lit = true; SFX.roar(); SFX.charge(.4); shake(10); pulseScreen(1.2); }
}
function drawLiveSub() {
  const s = G.liveSub; if (!s || STATE !== 'play') return;
  const t = (performance.now() - s.t0) / 1000; if (t > 2.8) { G.liveSub = null; return; }
  const a = Math.min(1, t / .25, (2.8 - t) / .3);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.globalAlpha = .5 * a; ctx.fillStyle = '#06060c'; ctx.fillRect(0, H * .17, W, H * .09);
  ctx.globalAlpha = a; drawScribText(s.text, H * .215, Math.min(26, (W - 32) / (s.text.length * .62)));
  ctx.globalAlpha = 1;
}
function drawHeavenOverlay() {
  if (!P.heavenly || G.mode !== 'boss' || STATE === 'result') return;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const g = ctx.createRadialGradient(cv.width / 2, cv.height / 2, Math.min(cv.width, cv.height) * .35, cv.width / 2, cv.height / 2, Math.max(cv.width, cv.height) * .7);
  g.addColorStop(0, 'rgba(245,197,66,0)'); g.addColorStop(1, 'rgba(245,197,66,' + (.16 + Math.sin(performance.now() / 500) * .05).toFixed(3) + ')');
  ctx.fillStyle = g; ctx.fillRect(0, 0, cv.width, cv.height);
}

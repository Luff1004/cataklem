/* ================= drawing UNKNOWN: it is redrawn from scratch every frame ================= */
function scribPath(pts, j) {
  ctx.beginPath();
  for (let i = 0; i < pts.length; i += 2) { const x = pts[i] + rnd(-j, j), y = pts[i + 1] + rnd(-j, j); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
}
function scribLine(x1, y1, x2, y2, w, amp, col = COL.deep) {
  const dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l, n = Math.max(4, Math.floor(l / 26));
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (let k = 0; k < 3; k++) {
    const pts = [];
    for (let i = 0; i <= n; i++) { const f = i / n, o = (i && i < n ? rnd(-amp, amp) : 0); pts.push(x1 + dx * f + nx * o, y1 + dy * f + ny * o); }
    ctx.strokeStyle = k === 2 ? COL.pink : col; ctx.globalAlpha = k === 2 ? .55 : .95; ctx.lineWidth = k === 0 ? w : k === 1 ? w * .45 : w * .25;
    if (k === 2) { ctx.save(); ctx.translate(2.5, 2); scribPath(pts, 1.5); ctx.stroke(); ctx.restore(); }
    else { scribPath(pts, 2); ctx.stroke(); }
  }
  ctx.globalAlpha = 1;
}
function tentaclePts(e, a, L, phase, wav) {
  const pts = [], now = performance.now() / 1000;
  for (let i = 0; i <= 12; i++) {
    const f = i / 12, r = e.r * .55 + L * f, ang = a + Math.sin(now * 2.4 + phase + f * 5) * wav * f;
    pts.push(e.x + Math.cos(ang) * r, e.y + Math.sin(ang) * r);
  }
  return pts;
}
function drawTentacle(pts, w) {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (let k = 0; k < 3; k++) {
    for (let s = 0; s < pts.length - 2; s += 2) {
      const f = s / (pts.length - 2);
      ctx.strokeStyle = k === 2 ? COL.pink : COL.deep; ctx.globalAlpha = k === 2 ? .5 : .95;
      ctx.lineWidth = (k === 0 ? w : k === 1 ? w * .5 : w * .3) * (1 - f * .75);
      ctx.beginPath(); const o = k === 2 ? 2.5 : 0;
      ctx.moveTo(pts[s] + rnd(-2, 2) + o, pts[s + 1] + rnd(-2, 2) + o); ctx.lineTo(pts[s + 2] + rnd(-3, 3) + o, pts[s + 3] + rnd(-3, 3) + o); ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
}
function drawUnknown(e) {
  const sc = (e.introScale === undefined ? 1 : e.introScale) * (e.drawScale || 1);
  if (sc <= .01) return;
  wt();
  const R = e.r * sc * (1 + Math.sin(e.t * 3.1) * .05);
  // a pink haze so it reads against the dark
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(e.x, e.y, R * .3, e.x, e.y, R * 2.4);
  g.addColorStop(0, 'rgba(255,79,158,.28)'); g.addColorStop(1, 'rgba(255,79,158,0)');
  ctx.fillStyle = g; ctx.fillRect(e.x - R * 2.4, e.y - R * 2.4, R * 4.8, R * 4.8); ctx.restore();
  wt();
  ctx.globalAlpha = .45; ctx.fillStyle = COL.deep; ctx.beginPath(); ctx.ellipse(e.x, e.y + R * .9, R * 1.2, R * .35, 0, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
  for (const t of e.tents) drawTentacle(tentaclePts(e, t.a, t.len * sc, t.ph, .5), 16);
  for (const l of e.lashes) {
    const p = l.t < l.warn ? .25 : l.t < l.warn + .3 ? 1 : Math.max(0, 1 - (l.t - l.warn - .3) / .4);
    drawTentacle(tentaclePts(e, l.a, l.len * p, 0, .12), 26);
  }
  // the body: boiling strokes, no face
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const fl = e.flash > 0;
  for (let k = 0; k < 30; k++) {
    let a = rnd(TAU), d = rnd(0, R * .6), x = e.x + Math.cos(a) * d, y = e.y + Math.sin(a) * d, h = rnd(TAU);
    ctx.strokeStyle = k < 4 ? COL.pink : fl && k % 3 === 0 ? COL.white : COL.deep;
    ctx.globalAlpha = k < 4 ? .6 : .92; ctx.lineWidth = rnd(2.5, 7) * sc;
    ctx.beginPath(); ctx.moveTo(x + (k < 4 ? 3 : 0), y + (k < 4 ? 2 : 0));
    for (let s = 0; s < 8; s++) {
      h += rnd(-1.3, 1.3); x += Math.cos(h) * R * .3; y += Math.sin(h) * R * .3;
      if (Math.hypot(x - e.x, y - e.y) > R) { h = Math.atan2(e.y - y, e.x - x) + rnd(-.5, .5); x = lerp(x, e.x, .3); y = lerp(y, e.y, .3); }
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  if (e.shieldT > 0 || (e.inv > 0 && STATE === 'play')) {
    ctx.globalAlpha = .7; ctx.strokeStyle = COL.white; ctx.lineWidth = 3; ctx.setLineDash([4, 7]);
    ctx.beginPath(); ctx.arc(e.x, e.y, R * 1.25, e.t * 2, e.t * 2 + TAU); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
  }
}

/* ---------- the floor of the nameless gate ---------- */
let UFLOOR = null;
function drawUnknownFloor() {
  const u = G.u, R = ARENA_R;
  if (!UFLOOR) {
    const S = R * 2 + 8, [c, x] = mkc(S, S, 1.2), Rn = mulberry(404);
    x.translate(S / 2, S / 2); x.save(); x.beginPath(); x.arc(0, 0, R, 0, TAU); x.clip();
    x.fillStyle = 'rgba(20,27,64,.05)'; x.fillRect(-R, -R, R * 2, R * 2);
    x.lineCap = 'round';
    for (let k = 0; k < 70; k++) {
      let px = (Rn() - .5) * R * 2, py = (Rn() - .5) * R * 2, h = Rn() * TAU;
      x.globalAlpha = .06 + Rn() * .1; x.strokeStyle = COL.deep; x.lineWidth = 1 + Rn() * 3; x.beginPath(); x.moveTo(px, py);
      for (let s = 0; s < 7; s++) { h += (Rn() - .5) * 2.4; px += Math.cos(h) * 18; py += Math.sin(h) * 18; x.lineTo(px, py); }
      x.stroke();
    }
    x.restore(); UFLOOR = c;
  }
  wt();
  ctx.drawImage(UFLOOR, -R - 4, -R - 4, R * 2 + 8, R * 2 + 8);
  if (u.stage === 'arena' || u.stage === 'flee') {
    const gap = .34, g0 = Math.PI / 2;
    for (const [col, w, o] of [[COL.pink, 8, 2], [COL.deep, 6, 0]]) {
      ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath();
      if (u.broken) ctx.arc(o, o, R + 3, g0 + gap, g0 - gap + TAU); else ctx.arc(o, o, R + 3, 0, TAU);
      ctx.stroke();
    }
    if (u.scarred) for (let k = 0; k < 5; k++) { const a = g0 + (k - 2) * .1; scribLine(Math.cos(a) * (R - 30), Math.sin(a) * (R - 30), Math.cos(a) * (R + 8), Math.sin(a) * (R + 8), 4, 5); }
  }
  drawVoid();
}
let DK2 = null;
function drawVoid() {
  const u = G.u;
  if (!DK2 || DK2.width !== cv.width || DK2.height !== cv.height) { DK2 = document.createElement('canvas'); DK2.width = cv.width; DK2.height = cv.height; }
  const x = DK2.getContext('2d');
  x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over';
  x.clearRect(0, 0, DK2.width, DK2.height);
  x.fillStyle = 'rgba(9,10,26,.97)'; x.fillRect(0, 0, DK2.width, DK2.height);
  x.globalCompositeOperation = 'destination-out';
  x.setTransform(K, 0, 0, K, OX, OY);
  x.fillStyle = '#000'; x.strokeStyle = '#000'; x.lineCap = 'round';
  if (u.circle) { x.beginPath(); x.arc(0, 0, u.circleR, 0, TAU); x.fill(); }
  if (u.corr) x.fillRect(-CW / 2, 0, CW, ARENA_R + CL + 40);
  if (u.rect) x.fillRect(-RW, -RH, RW * 2, RH * 2);
  for (const s of u.segs) { const w = segW(s); if (w < 2) continue; x.lineWidth = w; x.beginPath(); x.moveTo(s.x1, s.y1); x.lineTo(s.x2, s.y2); x.stroke(); }
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1 - (u.voidFade || 0); ctx.drawImage(DK2, 0, 0); ctx.globalAlpha = 1;
  // the dark is not still: it is more scribble
  wt();
  ctx.lineCap = 'round';
  for (let k = 0; k < 26; k++) {
    let px = CX + rnd(-VHW, VHW), py = CY + rnd(-VHH, VHH);
    if (walkable(px, py)) continue;
    let h = rnd(TAU);
    ctx.strokeStyle = k % 7 === 0 ? 'rgba(255,79,158,.35)' : 'rgba(60,70,130,.55)'; ctx.lineWidth = rnd(1.5, 4);
    ctx.beginPath(); ctx.moveTo(px, py);
    for (let s = 0; s < 6; s++) { h += rnd(-1.4, 1.4); px += Math.cos(h) * 16; py += Math.sin(h) * 16; ctx.lineTo(px, py); }
    ctx.stroke();
  }
  if (u.rect) {
    wt(); const gl = P.heavenly ? .6 : .2;
    glowLine(-RW, -RH, RW, -RH, 16, COL.yellow, gl); glowLine(-RW, RH, RW, RH, 16, COL.yellow, gl);
    ctx.strokeStyle = COL.pink; ctx.lineWidth = 7; ctx.strokeRect(-RW + 2, -RH + 2, RW * 2, RH * 2);
    ctx.strokeStyle = COL.deep; ctx.lineWidth = 5; ctx.strokeRect(-RW, -RH, RW * 2, RH * 2);
  }
  // corridor walls
  if (u.corr) {
    const y0 = Math.max(ARENA_R - 30, CY - VHH - 40), y1 = Math.min(ARENA_R + CL + 40, CY + VHH + 40);
    if (y1 > y0) for (const sx of [-1, 1]) {
      const xw = sx * CW / 2;
      ctx.strokeStyle = COL.pink; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(xw + 2, y0); ctx.lineTo(xw + 2, y1); ctx.stroke();
      ctx.strokeStyle = COL.deep; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(xw, y0); ctx.lineTo(xw, y1); ctx.stroke();
      ctx.lineWidth = 2; ctx.beginPath(); for (let y = Math.floor(y0 / 60) * 60; y < y1; y += 60) { ctx.moveTo(xw, y); ctx.lineTo(xw - sx * 12, y + 8); } ctx.stroke();
    }
  }
  // edges of the carved paths fray
  if (u.segs.length) {
    ctx.globalAlpha = .7; ctx.strokeStyle = COL.pink; ctx.lineWidth = 2;
    for (const s of u.segs) { const w = segW(s); if (w < 10 || !onScreen(s.x1, s.y1, w)) continue; const dx = s.x2 - s.x1, dy = s.y2 - s.y1, l = Math.hypot(dx, dy) || 1, nx = -dy / l * w / 2, ny = dx / l * w / 2; ctx.beginPath(); ctx.moveTo(s.x1 + nx, s.y1 + ny); ctx.lineTo(s.x2 + nx, s.y2 + ny); ctx.moveTo(s.x1 - nx, s.y1 - ny); ctx.lineTo(s.x2 - nx, s.y2 - ny); ctx.stroke(); }
    ctx.globalAlpha = 1;
    const e = G.boss;
    if (e && !e.dead && u.stage === 'maze') for (const c of u.carvers) drawTentacle([e.x, e.y, lerp(e.x, c.x, .33) + Math.sin(e.t * 3) * 30, lerp(e.y, c.y, .33), lerp(e.x, c.x, .66), lerp(e.y, c.y, .66) + Math.cos(e.t * 2.6) * 30, c.x, c.y], 14);
  }
}

/* ---------- hazards unique to this gate ---------- */
function drawUnknownHazards() {
  wt();
  const now = performance.now() / 1000;
  for (const h of HZ) {
    if (h.dead) continue;
    const live = h.t >= (h.warn || 0), p = h.warn ? clamp(h.t / h.warn, 0, 1) : 1;
    if ((h.k === 'line' && (h.tent || h.scrib)) || (h.k === 'ray' && h.tent)) {
      let x1 = h.x1, y1 = h.y1, x2 = h.x2, y2 = h.y2;
      if (h.k === 'ray') { x1 = h.x; y1 = h.y; x2 = h.x + Math.cos(h.a) * h.len; y2 = h.y + Math.sin(h.a) * h.len; }
      if (!live) {
        ctx.globalAlpha = .4 + p * .5; ctx.strokeStyle = COL.pink; ctx.lineWidth = 2 + p * 3; ctx.setLineDash([9, 7]);
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.setLineDash([]);
        ctx.globalAlpha = .1 * p; ctx.lineWidth = h.w; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.globalAlpha = 1;
      } else if (h.k === 'ray') {
        const e = h.follow; if (e) drawTentacle(tentaclePts(e, h.a, h.len, 0, .15), h.w);
      } else if (h.scrib) scribLine(x1, y1, x2, y2, h.w, 9);
    } else if (h.k === 'pool' && h.scrib && live) {
      ctx.lineCap = 'round';
      for (let k = 0; k < 7; k++) { let a = rnd(TAU), d = rnd(0, h.r * .7), x = h.x + Math.cos(a) * d, y = h.y + Math.sin(a) * d, hh = rnd(TAU); ctx.strokeStyle = COL.deep; ctx.globalAlpha = .8; ctx.lineWidth = rnd(2, 5); ctx.beginPath(); ctx.moveTo(x, y); for (let s = 0; s < 6; s++) { hh += rnd(-1.4, 1.4); x += Math.cos(hh) * 14; y += Math.sin(hh) * 14; if (Math.hypot(x - h.x, y - h.y) > h.r) { x = lerp(x, h.x, .4); y = lerp(y, h.y, .4); } ctx.lineTo(x, y); } ctx.stroke(); }
      ctx.globalAlpha = 1;
    } else if (h.k === 'erase') {
      const R = ARENA_R + 20, tx = -h.ny, ty = h.nx;
      ctx.beginPath(); ctx.moveTo(tx * -R, ty * -R); ctx.lineTo(tx * R, ty * R); ctx.lineTo(tx * R + h.nx * R, ty * R + h.ny * R); ctx.lineTo(tx * -R + h.nx * R, ty * -R + h.ny * R); ctx.closePath();
      if (!live) { ctx.globalAlpha = .12 + p * .25 + Math.sin(now * 16) * .05; ctx.fillStyle = COL.pink; ctx.fill(); ctx.globalAlpha = .9; ctx.strokeStyle = COL.pink; ctx.lineWidth = 3; ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.moveTo(tx * -R, ty * -R); ctx.lineTo(tx * R, ty * R); ctx.stroke(); ctx.setLineDash([]); }
      else {
        const f = Math.min(1, (h.warn + h.dur - h.t) / .4);
        ctx.globalAlpha = .9 * f; ctx.fillStyle = 'rgb(9,10,26)'; ctx.fill();
        ctx.save(); ctx.clip();
        for (let k = 0; k < 30; k++) { let x = rnd(-R, R), y = rnd(-R, R), hh = rnd(TAU); ctx.strokeStyle = k % 6 ? 'rgba(70,80,140,.7)' : 'rgba(255,79,158,.5)'; ctx.lineWidth = rnd(2, 5); ctx.beginPath(); ctx.moveTo(x, y); for (let s = 0; s < 6; s++) { hh += rnd(-1.4, 1.4); x += Math.cos(hh) * 22; y += Math.sin(hh) * 22; ctx.lineTo(x, y); } ctx.stroke(); }
        ctx.restore();
      }
    }
  }
  ctx.globalAlpha = 1;
}

/* ---------- screen effects: running, act changes, the unravelling ---------- */
function drawUnknownOverlay() {
  const u = G.u;
  if (!u) return;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  const now = performance.now() / 1000;
  if (STATE === 'play' && (u.stage === 'chase' || u.stage === 'maze')) {
    const k = u.stage === 'chase' ? 1 : .55;
    ctx.strokeStyle = COL.white; ctx.lineCap = 'round';
    for (let i = 0; i < 26 * k; i++) {
      const x = ((i * 97.3) % W), y = H - ((now * 1400 * k + i * 211) % (H + 200)), L = 50 + (i % 5) * 30;
      ctx.globalAlpha = .18 + (i % 3) * .08; ctx.lineWidth = 1.5 + (i % 3); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + L); ctx.stroke();
    }
    const e = G.boss, dd = e ? Math.hypot(P.x - e.x, P.y - e.y) : 999, near = clamp(1 - (dd - 120) / 420, 0, 1);
    ctx.globalAlpha = (.25 + near * .5) * (.6 + .4 * Math.sin(now * 9)); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(VIGP, 0, 0, cv.width, cv.height);
    ctx.globalAlpha = 1;
  }
  if (G.cutBlack > 0) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = Math.min(1, G.cutBlack); ctx.fillStyle = '#05060f'; ctx.fillRect(0, 0, cv.width, cv.height); ctx.globalAlpha = 1; }
  const un = G.unravel;
  if (un) {
    const t = (performance.now() - un.t0) / 1000;
    wt(); ctx.lineCap = 'round';
    if (t < 3.2) for (let k = 0; k < 40; k++) {
      const a = k / 40 * TAU + k, d = 40 + t * (300 + (k % 7) * 90), x = un.x + Math.cos(a) * d, y = un.y + Math.sin(a) * d;
      ctx.globalAlpha = Math.max(0, 1 - t / 3.2); ctx.strokeStyle = k % 5 ? COL.deep : COL.pink; ctx.lineWidth = 3 + (k % 4);
      let h = a, px = x, py = y; ctx.beginPath(); ctx.moveTo(px, py); for (let s = 0; s < 6; s++) { h += rnd(-1, 1); px += Math.cos(h) * 20; py += Math.sin(h) * 20; ctx.lineTo(px, py); } ctx.stroke();
    }
    const wash = t < 2.2 ? t / 2.2 * .9 : Math.max(0, .9 - (t - 2.2) * .4);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = wash; ctx.fillStyle = COL.paper; ctx.fillRect(0, 0, cv.width, cv.height); ctx.globalAlpha = 1;
  }
}

/* ================= arena and new-weapon drawing ================= */
function drawArenaFloor() {
  const id = G.gate ? G.gate.id : 'bell', R = ARENA_R, now = performance.now() / 1000;
  if (id === 'unknown' && G.u) { drawUnknownFloor(); return; }
  wt();
  ctx.fillStyle = 'rgba(20,27,64,.86)';
  ctx.beginPath(); ctx.rect(CX - VHW - 20, CY - VHH - 20, VHW * 2 + 40, VHH * 2 + 40); ctx.arc(0, 0, R, 0, TAU); ctx.fill('evenodd');
  const F = arenaFloor(id);
  ctx.drawImage(F, -R - 4, -R - 4, R * 2 + 8, R * 2 + 8);
  // living details per arena
  if (id === 'bell') {
    ctx.fillStyle = COL.ink; ctx.globalAlpha = .35;
    for (let k = 0; k < 24; k++) { const x = Math.sin(k * 12.9) * R * .8, y = ((k * 53 + now * 30) % (R * 2)) - R; if (x * x + y * y < R * R) ctx.fillRect(x + Math.sin(now + k) * 6, y, 2, 2); }
  } else if (id === 'loom') {
    ctx.globalAlpha = .35; ctx.strokeStyle = COL.white; ctx.lineWidth = 1.2;
    for (let k = 0; k < 16; k++) { const a = k / 16 * TAU, r = ((now * 40 + k * 37) % R); ctx.beginPath(); ctx.arc(Math.cos(a) * r, Math.sin(a) * r, 2.5, 0, TAU); ctx.stroke(); }
  } else if (id === 'twins') {
    const sy = ((now * .35) % 1) * R * 2 - R; glowLine(0, sy - 80, 0, sy + 80, 18, COL.white, .35);
  } else if (id === 'tide') {
    ctx.globalAlpha = .7; ctx.fillStyle = COL.deep; ctx.beginPath(); ctx.arc(0, 0, R + 4, 0, TAU);
    for (let k = 0; k <= 90; k++) { const a = -k / 90 * TAU, r = R * .87 + Math.sin(a * 9 + now * 2.4) * 6 + Math.sin(a * 4 - now * 1.3) * 5; k ? ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
    ctx.closePath(); ctx.fill('evenodd');
    ctx.globalAlpha = .9; ctx.strokeStyle = COL.white; ctx.lineWidth = 2.2; ctx.beginPath();
    for (let k = 0; k <= 90; k++) { const a = k / 90 * TAU, r = R * .87 + Math.sin(a * 9 + now * 2.4) * 6 + Math.sin(a * 4 - now * 1.3) * 5; k ? ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
    ctx.stroke();
    ctx.fillStyle = COL.white; for (let k = 0; k < 14; k++) { const a = k * 2.39, r = R * (.9 + (k % 3) * .03), p = (now * .7 + k * .13) % 1; ctx.globalAlpha = (1 - p) * .8; ctx.beginPath(); ctx.arc(Math.cos(a) * r, Math.sin(a) * r - p * 14, 2 + p * 2, 0, TAU); ctx.fill(); }
  } else if (id === 'judge') {
    const ha = now * .1;
    ctx.globalAlpha = .18; ctx.strokeStyle = COL.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(ha) * R * .5, Math.sin(ha) * R * .5); ctx.stroke();
    ctx.fillStyle = COL.ink; ctx.globalAlpha = .4; ctx.beginPath(); ctx.arc(Math.cos(now * 6.283 / 60 * 12) * R * .78, Math.sin(now * 6.283 / 60 * 12) * R * .78, 4, 0, TAU); ctx.fill();
  } else if (id === 'root') {
    for (let k = 0; k < 18; k++) { const x = Math.sin(k * 5.1) * R * .8, p = (now * .15 + k * .055) % 1, y = -R * .8 + p * R * 1.6; if (x * x + y * y > R * R) continue; ctx.globalAlpha = Math.sin(p * Math.PI) * .7; ctx.fillStyle = COL.pink; ctx.beginPath(); ctx.ellipse(x + Math.sin(now * 1.5 + k) * 20, y, 3.5, 2, now + k, 0, TAU); ctx.fill(); }
  } else if (id === 'sky') {
    for (let k = 0; k < 40; k++) { const a = k * 2.4, r = (k * 37) % R; ctx.globalAlpha = .3 + .7 * Math.abs(Math.sin(now * 2 + k)); ctx.fillStyle = COL.white; ctx.fillRect(Math.cos(a) * r, Math.sin(a) * r, 2, 2); }
  } else if (id === 'sun') {
    for (let k = 0; k < 30; k++) { const x = Math.sin(k * 7.3) * R * .85, p = (now * .25 + k * .071) % 1, y = R * .85 - p * R * 1.7; if (x * x + y * y > R * R) continue; ctx.globalAlpha = Math.sin(p * Math.PI) * .9; ctx.fillStyle = k % 3 ? COL.yellow : COL.pink; ctx.fillRect(x + Math.sin(now * 2 + k) * 10, y, 3, 3); }
    ctx.globalAlpha = .12 + Math.sin(now * 2) * .05; ctx.fillStyle = COL.yellow; ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;
  // the seal wall, dressed per arena
  const W = { bell: [COL.ink, COL.pink], loom: [COL.pink, COL.white], twins: [COL.ink, COL.pink], tide: [COL.teal, COL.white], sun: [COL.yellow, COL.pink], judge: [COL.deep, COL.yellow], root: [COL.teal, COL.pink], sky: [COL.pink, COL.yellow] }[id] || [COL.ink, COL.pink];
  ctx.lineWidth = 8; ctx.strokeStyle = W[1]; ctx.beginPath(); ctx.arc(2, 2, R + 3, 0, TAU); ctx.stroke();
  if (id === 'twins') {
    ctx.lineWidth = 6; ctx.strokeStyle = COL.ink; ctx.beginPath(); ctx.arc(0, 0, R + 3, Math.PI / 2, Math.PI * 1.5); ctx.stroke();
    ctx.strokeStyle = COL.pink; ctx.beginPath(); ctx.arc(0, 0, R + 3, -Math.PI / 2, Math.PI / 2); ctx.stroke();
  } else { ctx.lineWidth = 6; ctx.strokeStyle = W[0]; ctx.beginPath(); ctx.arc(0, 0, R + 3, 0, TAU); ctx.stroke(); }
  ctx.lineWidth = 2; ctx.strokeStyle = id === 'sun' ? COL.pink : COL.ink; ctx.beginPath();
  const n = id === 'bell' ? 36 : id === 'loom' ? 96 : 72;
  for (let k = 0; k < n; k++) { const a = k / n * TAU + now * .02, r1 = R - (k % 6 ? 6 : 15); ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1); ctx.lineTo(Math.cos(a) * R, Math.sin(a) * R); }
  ctx.stroke();
}

const FLOOR = {};
function arenaFloor(id) {
  if (FLOOR[id]) return FLOOR[id];
  const R = ARENA_R, S = R * 2 + 8, [c, x] = mkc(S, S, 1.2), Rn = mulberry(id.length * 97 + 3);
  x.translate(S / 2, S / 2);
  x.save(); x.beginPath(); x.arc(0, 0, R, 0, TAU); x.clip();
  const line = (a, col, lw) => { x.globalAlpha = a; x.strokeStyle = col; x.lineWidth = lw; };
  if (id === 'bell') {
    x.fillStyle = 'rgba(37,53,111,.06)'; x.fillRect(-R, -R, R * 2, R * 2);
    line(.16, COL.ink, 1.4);
    for (let y = -R; y < R; y += 46) { const off = (Math.round(y / 46) % 2) * 23; for (let xx = -R - 46; xx < R; xx += 46) { x.strokeRect(xx + off + Rn() * 2, y + Rn() * 2, 46, 46); if (Rn() < .12) { x.globalAlpha = .07; x.fillStyle = COL.ink; x.fillRect(xx + off, y, 46, 46); x.globalAlpha = .16; } } }
    x.globalAlpha = .07; x.fillStyle = COL.ink; x.fillRect(-38, -R, 76, R * 2);
    line(.26, COL.ink, 2);
    for (let k = 0; k < 12; k++) { x.save(); x.rotate(k / 12 * TAU); x.beginPath(); x.ellipse(0, -95, 26, 70, 0, 0, TAU); x.stroke(); x.restore(); }
    x.beginPath(); x.arc(0, 0, 170, 0, TAU); x.stroke(); x.beginPath(); x.arc(0, 0, 30, 0, TAU); x.stroke();
    line(.2, COL.pink, 2); x.beginPath(); x.arc(2, 2, 172, 0, TAU); x.stroke();
  } else if (id === 'loom') {
    x.fillStyle = 'rgba(255,79,158,.05)'; x.fillRect(-R, -R, R * 2, R * 2);
    line(.2, COL.ink, 1.3);
    for (let k = 0; k < 18; k++) { const a = k / 18 * TAU; x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.cos(a) * R, Math.sin(a) * R); x.stroke(); }
    for (let r = 30; r < R; r += 26) { x.beginPath(); for (let k = 0; k <= 18; k++) { const a = k / 18 * TAU, a2 = (k + .5) / 18 * TAU, rr = r - 6; if (!k) x.moveTo(Math.cos(a) * r, Math.sin(a) * r); else x.quadraticCurveTo(Math.cos(a2 - TAU / 36) * rr, Math.sin(a2 - TAU / 36) * rr, Math.cos(a) * r, Math.sin(a) * r); } x.stroke(); }
    for (let k = 0; k < 9; k++) { const a = Rn() * TAU, r = R * (.55 + Rn() * .35); x.save(); x.translate(Math.cos(a) * r, Math.sin(a) * r); x.rotate(a); x.globalAlpha = .3; x.fillStyle = COL.white; x.beginPath(); x.ellipse(0, 0, 9, 16, 0, 0, TAU); x.fill(); line(.4, COL.ink, 1); for (let s = -10; s < 12; s += 4) { x.beginPath(); x.moveTo(-9, s); x.lineTo(9, s + 2); x.stroke(); } x.restore(); }
  } else if (id === 'twins') {
    x.fillStyle = 'rgba(255,79,158,.07)'; x.fillRect(0, -R, R, R * 2);
    x.fillStyle = 'rgba(37,53,111,.07)'; x.fillRect(-R, -R, R, R * 2);
    x.save(); x.rotate(Math.PI / 4); const T = 44;
    for (let i = -14; i < 14; i++) for (let j = -14; j < 14; j++) if ((i + j) % 2 === 0) { x.globalAlpha = .07; x.fillStyle = COL.ink; x.fillRect(i * T, j * T, T, T); }
    line(.12, COL.ink, 1); for (let i = -14; i < 14; i++) { x.beginPath(); x.moveTo(i * T, -R * 1.5); x.lineTo(i * T, R * 1.5); x.moveTo(-R * 1.5, i * T); x.lineTo(R * 1.5, i * T); x.stroke(); }
    x.restore();
    line(.9, COL.white, 4); x.beginPath(); x.moveTo(0, -R); x.lineTo(0, R); x.stroke();
    line(.6, COL.ink, 1.5); x.beginPath(); x.moveTo(3, -R); x.lineTo(3, R); x.stroke();
  } else if (id === 'tide') {
    x.fillStyle = 'rgba(10,138,134,.08)'; x.fillRect(-R, -R, R * 2, R * 2);
    for (let k = 0; k < 40; k++) { const px = (Rn() - .5) * R * 1.8, py = (Rn() - .5) * R * 1.8, r0 = 8 + Rn() * 22; line(.14, COL.ink, 1.2); for (let q = 0; q < 3; q++) { x.beginPath(); x.arc(px, py, r0 + q * 8, 0, TAU); x.stroke(); } }
    line(.25, COL.teal, 2); x.setLineDash([12, 10]); for (const f of [.62, .74]) { x.beginPath(); x.arc(0, 0, R * f, 0, TAU); x.stroke(); } x.setLineDash([]);
  } else if (id === 'judge') {
    x.fillStyle = 'rgba(20,27,64,.08)'; x.fillRect(-R, -R, R * 2, R * 2);
    for (let k = 0; k < 12; k++) { const a = -Math.PI / 2 + k / 12 * TAU; x.globalAlpha = k % 2 ? .05 : .09; x.fillStyle = COL.ink; x.beginPath(); x.moveTo(0, 0); x.arc(0, 0, R, a, a + TAU / 12); x.closePath(); x.fill(); }
    line(.35, COL.deep, 9); for (let k = 0; k < 12; k++) { const a = -Math.PI / 2 + k / 12 * TAU, r1 = R - (k % 3 ? 40 : 70); x.beginPath(); x.moveTo(Math.cos(a) * r1, Math.sin(a) * r1); x.lineTo(Math.cos(a) * (R - 16), Math.sin(a) * (R - 16)); x.stroke(); }
    line(.2, COL.ink, 1.5); for (let k = 0; k < 60; k++) { const a = k / 60 * TAU; x.beginPath(); x.moveTo(Math.cos(a) * (R - 12), Math.sin(a) * (R - 12)); x.lineTo(Math.cos(a) * (R - 4), Math.sin(a) * (R - 4)); x.stroke(); }
    for (const [gx, gy, gr] of [[-R * .55, R * .5, 60], [R * .6, -R * .45, 44], [R * .45, R * .55, 34]]) { line(.2, COL.ink, 3); x.beginPath(); x.arc(gx, gy, gr, 0, TAU); x.stroke(); for (let k = 0; k < 14; k++) { const a = k / 14 * TAU; x.beginPath(); x.moveTo(gx + Math.cos(a) * gr, gy + Math.sin(a) * gr); x.lineTo(gx + Math.cos(a) * (gr + 9), gy + Math.sin(a) * (gr + 9)); x.stroke(); } x.beginPath(); x.arc(gx, gy, gr * .25, 0, TAU); x.stroke(); }
    line(.25, COL.ink, 2); for (const f of [.3, .62]) { x.beginPath(); x.arc(0, 0, R * f, 0, TAU); x.stroke(); }
  } else if (id === 'root') {
    x.fillStyle = 'rgba(10,138,134,.1)'; x.fillRect(-R, -R, R * 2, R * 2);
    for (let k = 0; k < 16; k++) {
      let a = Rn() * TAU, px = Math.cos(a) * R, py = Math.sin(a) * R, ang = a + Math.PI + (Rn() - .5);
      line(.28, COL.deep, 6);
      x.beginPath(); x.moveTo(px, py); for (let s = 0; s < 10; s++) { ang += (Rn() - .5) * .6; px += Math.cos(ang) * 26; py += Math.sin(ang) * 26; x.lineTo(px, py); x.lineWidth = Math.max(1.5, x.lineWidth * .88); } x.stroke();
    }
    for (let k = 0; k < 160; k++) { x.globalAlpha = .15 + Rn() * .2; x.fillStyle = Rn() < .8 ? COL.teal : COL.pink; x.beginPath(); x.arc((Rn() - .5) * R * 2, (Rn() - .5) * R * 2, 1 + Rn() * 2.5, 0, TAU); x.fill(); }
  } else if (id === 'sky') {
    x.fillStyle = 'rgba(20,27,64,.62)'; x.fillRect(-R, -R, R * 2, R * 2);
    for (let k = 0; k < 4; k++) { const g = x.createRadialGradient((Rn() - .5) * R, (Rn() - .5) * R, 0, 0, 0, R); x.globalAlpha = .12; g.addColorStop(0, COL.pink); g.addColorStop(1, 'rgba(255,79,158,0)'); x.fillStyle = g; x.fillRect(-R, -R, R * 2, R * 2); }
    for (let k = 0; k < 260; k++) { x.globalAlpha = .3 + Rn() * .7; x.fillStyle = COL.white; const s = Rn() < .1 ? 2.6 : 1.2; x.fillRect((Rn() - .5) * R * 2, (Rn() - .5) * R * 2, s, s); }
    line(.35, COL.yellow, 1.2); for (let c = 0; c < 5; c++) { let px = (Rn() - .5) * R * 1.4, py = (Rn() - .5) * R * 1.4; x.beginPath(); x.moveTo(px, py); for (let s = 0; s < 4; s++) { px += (Rn() - .5) * 120; py += (Rn() - .5) * 120; x.lineTo(px, py); } x.stroke(); }
  } else if (id === 'sun') {
    x.fillStyle = 'rgba(255,210,63,.13)'; x.fillRect(-R, -R, R * 2, R * 2);
    for (let k = 0; k < 36; k++) { if (k % 2) continue; const a = k / 36 * TAU; x.globalAlpha = .06; x.fillStyle = COL.pink; x.beginPath(); x.moveTo(0, 0); x.arc(0, 0, R, a, a + TAU / 36); x.closePath(); x.fill(); }
    for (let k = 0; k < 14; k++) {
      let a = Rn() * TAU, px = Math.cos(a) * 60, py = Math.sin(a) * 60;
      const pts = [[px, py]]; for (let s = 0; s < 9; s++) { a += (Rn() - .5) * .8; px += Math.cos(a) * 30; py += Math.sin(a) * 30; pts.push([px, py]); }
      for (const [col, lw, al] of [[COL.pink, 5, .45], [COL.yellow, 2, .9]]) { line(al, col, lw); x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.stroke(); }
    }
    for (let k = 0; k < 6; k++) { const a = Rn() * TAU, r = Rn() * R * .8; x.globalAlpha = .1; x.fillStyle = COL.deep; x.beginPath(); x.arc(Math.cos(a) * r, Math.sin(a) * r, 20 + Rn() * 30, 0, TAU); x.fill(); }
  }
  x.restore();
  FLOOR[id] = c; return c;
}

function drawRipple(e) {
  wt(); const t = e.t;
  for (let k = 0; k < 3; k++) {
    const p = ((t * 1.6 + k / 3) % 1);
    ctx.globalAlpha = (1 - p) * .7; ctx.strokeStyle = k % 2 ? COL.pink : COL.ink; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(e.x, e.y, e.r * (.4 + p), e.r * (.25 + p * .6), 0, 0, TAU); ctx.stroke();
  }
  ctx.globalAlpha = .55; ctx.fillStyle = COL.deep; ctx.beginPath(); ctx.ellipse(e.x, e.y, e.r * .5, e.r * .3, 0, 0, TAU); ctx.fill();
  ctx.globalAlpha = 1;
}

function strokeRiso(w, path, main = COL.pink, back = COL.ink) {
  ctx.strokeStyle = back; ctx.lineWidth = w; ctx.save(); ctx.translate(1.8, 1.4); path(); ctx.stroke(); ctx.restore();
  ctx.strokeStyle = main; ctx.lineWidth = w * .72; path(); ctx.stroke();
}

function drawHazards() {
  wt(); ctx.lineCap = 'round';
  const now = performance.now() / 1000;
  for (const h of HZ) {
    if (h.dead) continue;
    const live = h.t >= (h.warn || 0), wp = h.warn ? clamp(h.t / h.warn, 0, 1) : 1;
    if (h.k === 'pool' && !(h.scrib && h.t >= h.warn)) {
      if (!live) {
        ctx.globalAlpha = .5 + Math.sin(now * 20) * .2; ctx.strokeStyle = h.slow ? COL.white : COL.ink; ctx.lineWidth = 2.5; ctx.setLineDash([7, 6]);
        ctx.beginPath(); ctx.arc(h.x, h.y, h.r, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
        ctx.globalAlpha = .18; ctx.fillStyle = COL.ink; ctx.beginPath(); ctx.arc(h.x, h.y, h.r * wp, 0, TAU); ctx.fill();
      } else {
        const fade = Math.min(1, (h.warn + h.dur - h.t) / .6);
        if (h.slow) {
          ctx.globalAlpha = .55 * fade; ctx.strokeStyle = COL.white; ctx.lineWidth = 1.6; ctx.beginPath();
          for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; ctx.moveTo(h.x, h.y); ctx.lineTo(h.x + Math.cos(a) * h.r, h.y + Math.sin(a) * h.r); }
          for (let r = h.r * .3; r <= h.r; r += h.r * .23) { for (let k = 0; k <= 8; k++) { const a = k / 8 * TAU, px = h.x + Math.cos(a) * r, py = h.y + Math.sin(a) * r; k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } }
          ctx.stroke();
          ctx.globalAlpha = .12 * fade; ctx.fillStyle = COL.white; ctx.beginPath(); ctx.arc(h.x, h.y, h.r, 0, TAU); ctx.fill();
        } else {
          ctx.globalAlpha = .62 * fade; ctx.fillStyle = COL.deep; ctx.beginPath(); ctx.arc(h.x, h.y, h.r + Math.sin(now * 3 + h.x) * 2, 0, TAU); ctx.fill();
          ctx.globalAlpha = .5 * fade; ctx.strokeStyle = COL.pink; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(h.x + 2, h.y + 1.5, h.r, 0, TAU); ctx.stroke();
          const p = (now * .8 + h.x * .01) % 1; ctx.globalAlpha = (1 - p) * .5 * fade; ctx.strokeStyle = COL.white; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(h.x, h.y, h.r * p, 0, TAU); ctx.stroke();
        }
      }
    } else if (h.k === 'wave') {
      const g = h.gaps[0], half = h.gw / 2;
      ctx.globalAlpha = .95;
      strokeRiso(h.w, () => { ctx.beginPath(); ctx.arc(h.x, h.y, h.r, g + half, g - half + TAU); }, COL.ink, COL.pink);
      ctx.globalAlpha = .8; ctx.fillStyle = COL.yellow;
      for (const s of [-1, 1]) { const a = g + s * half; ctx.beginPath(); ctx.arc(h.x + Math.cos(a) * h.r, h.y + Math.sin(a) * h.r, h.w * .35, 0, TAU); ctx.fill(); }
    } else if (h.k === 'band') {
      const R = ARENA_R + 10, tx = -h.ny, ty = h.nx;
      if (!live) {
        const d0 = -ARENA_R + 26;
        ctx.globalAlpha = .55 + Math.sin(now * 22) * .3; ctx.strokeStyle = COL.pink; ctx.lineWidth = 3; ctx.setLineDash([10, 8]);
        ctx.beginPath(); ctx.moveTo(h.nx * d0 + tx * -R, h.ny * d0 + ty * -R); ctx.lineTo(h.nx * d0 + tx * (h.gap - h.gw / 2), h.ny * d0 + ty * (h.gap - h.gw / 2));
        ctx.moveTo(h.nx * d0 + tx * (h.gap + h.gw / 2), h.ny * d0 + ty * (h.gap + h.gw / 2)); ctx.lineTo(h.nx * d0 + tx * R, h.ny * d0 + ty * R); ctx.stroke(); ctx.setLineDash([]);
      } else {
        const bx = h.nx * h.d, by = h.ny * h.d;
        ctx.globalAlpha = .95;
        strokeRiso(h.w, () => {
          ctx.beginPath(); ctx.moveTo(bx + tx * -R, by + ty * -R); ctx.lineTo(bx + tx * (h.gap - h.gw / 2), by + ty * (h.gap - h.gw / 2));
          ctx.moveTo(bx + tx * (h.gap + h.gw / 2), by + ty * (h.gap + h.gw / 2)); ctx.lineTo(bx + tx * R, by + ty * R);
        }, COL.deep, COL.pink);
        ctx.globalAlpha = .6; ctx.strokeStyle = COL.white; ctx.lineWidth = 2; ctx.beginPath();
        for (let k = -R; k < R; k += 24) { if (Math.abs(k - h.gap) < h.gw / 2) continue; const px = bx + tx * k - h.nx * h.w * .3, py = by + ty * k - h.ny * h.w * .3; ctx.moveTo(px, py); ctx.lineTo(px + tx * 10 - h.nx * 6, py + ty * 10 - h.ny * 6); }
        ctx.stroke();
      }
    } else if ((h.k === 'line' && !h.tent && !h.scrib) || h.k === 'tether') {
      if (!live) {
        ctx.globalAlpha = .45 + wp * .45; ctx.strokeStyle = COL.pink; ctx.lineWidth = 1.5 + wp * 2; ctx.setLineDash([8, 7]);
        ctx.beginPath(); ctx.moveTo(h.x1, h.y1); ctx.lineTo(h.x2, h.y2); ctx.stroke(); ctx.setLineDash([]);
      } else {
        const jit = () => { ctx.beginPath(); const n = 10; for (let k = 0; k <= n; k++) { const f = k / n, px = lerp(h.x1, h.x2, f), py = lerp(h.y1, h.y2, f), o = k && k < n ? Math.sin(now * 40 + k * 2) * 2.5 : 0; k ? ctx.lineTo(px + o, py - o) : ctx.moveTo(px, py); } };
        ctx.globalAlpha = 1; strokeRiso(h.w, jit, h.k === 'tether' ? COL.pink : COL.yellow, COL.ink);
        ctx.strokeStyle = COL.white; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(h.x1, h.y1); ctx.lineTo(h.x2, h.y2); ctx.stroke();
      }
    } else if (h.k === 'ray' && !h.tent) {
      const x2 = h.x + Math.cos(h.a) * h.len, y2 = h.y + Math.sin(h.a) * h.len;
      if (!live) {
        ctx.globalAlpha = .35 + wp * .5; ctx.strokeStyle = COL.pink; ctx.lineWidth = 2 + wp * 3; ctx.setLineDash([10, 8]);
        ctx.beginPath(); ctx.moveTo(h.x, h.y); ctx.lineTo(x2, y2); ctx.stroke(); ctx.setLineDash([]);
        ctx.globalAlpha = .12 * wp; ctx.strokeStyle = COL.pink; ctx.lineWidth = h.w; ctx.beginPath(); ctx.moveTo(h.x, h.y); ctx.lineTo(x2, y2); ctx.stroke();
      } else {
        ctx.globalAlpha = .9; ctx.strokeStyle = COL.yellow; ctx.lineWidth = h.w * 1.3; ctx.beginPath(); ctx.moveTo(h.x, h.y); ctx.lineTo(x2, y2); ctx.stroke();
        ctx.strokeStyle = COL.pink; ctx.lineWidth = h.w * .75; ctx.beginPath(); ctx.moveTo(h.x + 2, h.y + 2); ctx.lineTo(x2 + 2, y2 + 2); ctx.stroke();
        ctx.strokeStyle = COL.white; ctx.lineWidth = h.w * .25; ctx.beginPath(); ctx.moveTo(h.x, h.y); ctx.lineTo(x2, y2); ctx.stroke();
      }
    }
  }
  ctx.globalAlpha = 1; ctx.setLineDash([]);
}

function drawVortex() {
  if (!VX.length) return;
  wt();
  for (const v of VX) {
    if (!onScreen(v.x, v.y, v.r)) continue;
    const grow = Math.min(1, v.t / .25) * Math.min(1, (v.dur - v.t) / .3), r = v.r * grow;
    ctx.globalAlpha = .28; ctx.fillStyle = COL.deep; ctx.beginPath(); ctx.arc(v.x, v.y, r, 0, TAU); ctx.fill();
    ctx.globalAlpha = .9; ctx.lineWidth = v.big ? 4 : 3;
    for (let k = 0; k < 4; k++) {
      ctx.strokeStyle = k % 2 ? COL.pink : COL.ink; ctx.beginPath();
      for (let s = 0; s <= 16; s++) { const f = s / 16, a = -v.t * 6 + k / 4 * TAU + f * 3.2, rr = r * (1 - f * .85); const px = v.x + Math.cos(a) * rr, py = v.y + Math.sin(a) * rr; s ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
      ctx.stroke();
    }
    ctx.fillStyle = COL.deep; ctx.beginPath(); ctx.arc(v.x, v.y, r * .16, 0, TAU); ctx.fill();
    ctx.fillStyle = COL.yellow; ctx.beginPath(); ctx.arc(v.x, v.y, r * .06, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawPillars() {
  const sun = G.boss && G.boss.nova > 0 ? G.boss : null;
  if (sun) {
    // the safe shadows behind each pillar
    wt();
    for (const o of OB) {
      if (o.dead) continue;
      const a = Math.atan2(o.y - sun.y, o.x - sun.x), d = Math.hypot(o.x - sun.x, o.y - sun.y), half = Math.asin(Math.min(1, (o.r - 3) / d));
      const L = 900;
      ctx.globalAlpha = .5 + Math.sin(performance.now() / 90) * .12; ctx.fillStyle = COL.white;
      ctx.beginPath(); ctx.moveTo(o.x + Math.cos(a + Math.PI / 2) * o.r, o.y + Math.sin(a + Math.PI / 2) * o.r);
      ctx.lineTo(sun.x + Math.cos(a + half) * (d + L), sun.y + Math.sin(a + half) * (d + L));
      ctx.lineTo(sun.x + Math.cos(a - half) * (d + L), sun.y + Math.sin(a - half) * (d + L));
      ctx.lineTo(o.x + Math.cos(a - Math.PI / 2) * o.r, o.y + Math.sin(a - Math.PI / 2) * o.r); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = .9; ctx.strokeStyle = COL.teal; ctx.lineWidth = 2.5; ctx.setLineDash([8, 6]); ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.globalAlpha = 1;
  }
  for (const o of OB) { if (o.dead) continue; spr(SP.shadow, o.x, o.y + o.r * .7, o.r * 2.4, o.r * .8); spr(SP.pillar, o.x, o.y, o.r * 2.3, o.r * 2.3); }
}

function drawGhosts() {
  if (!GH.length) return;
  const S = SPR['p_' + (G.char || 'lamp')];
  for (const g of GH) { ctx.globalAlpha = g.life / g.max * .45; spr(S.flash, g.x, g.y - 2, 38, 38); }
  ctx.globalAlpha = 1;
}
function drawWard() {
  if (!G.rel || !G.rel.ward) return;
  wt();
  for (let i = 0; i < G.rel.ward; i++) {
    const a = P.t * 3 + i / G.rel.ward * TAU, x = P.x + Math.cos(a) * 36, y = P.y + Math.sin(a) * 36;
    ctx.fillStyle = COL.ink; ctx.beginPath(); ctx.arc(x + 1.4, y + 1.2, 7, 0, TAU); ctx.fill();
    ctx.fillStyle = COL.yellow; ctx.beginPath(); ctx.arc(x, y, 7, 0, TAU); ctx.fill();
  }
}
function drawBeams(w) {
  wt(); ctx.lineCap = 'round';
  for (const a of w.pos) {
    const x2 = P.x + Math.cos(a) * w.len, y2 = P.y + Math.sin(a) * w.len;
    ctx.globalAlpha = .45; ctx.strokeStyle = COL.yellow; ctx.lineWidth = w.hw * 2.6; ctx.beginPath(); ctx.moveTo(P.x, P.y); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.globalAlpha = .9; ctx.strokeStyle = w.evo ? COL.ink : COL.pink; ctx.lineWidth = w.hw * 1.2; ctx.beginPath(); ctx.moveTo(P.x + 1.5, P.y + 1.2); ctx.lineTo(x2 + 1.5, y2 + 1.2); ctx.stroke();
    ctx.strokeStyle = COL.white; ctx.lineWidth = w.hw * .45; ctx.beginPath(); ctx.moveTo(P.x, P.y); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.globalAlpha = 1; ctx.fillStyle = COL.yellow; ctx.beginPath(); ctx.arc(x2, y2, w.hw * 1.1, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

let DK = null;
function drawDark() {
  if (!DK || DK.width !== cv.width || DK.height !== cv.height) { DK = document.createElement('canvas'); DK.width = cv.width; DK.height = cv.height; }
  const x = DK.getContext('2d');
  x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, DK.width, DK.height);
  x.fillStyle = 'rgba(14,18,44,' + (.94 * G.dark).toFixed(3) + ')'; x.fillRect(0, 0, DK.width, DK.height);
  x.globalCompositeOperation = 'destination-out';
  const hole = (wx, wy, r) => {
    const sx = wx * K + OX, sy = wy * K + OY, rr = r * K;
    const g = x.createRadialGradient(sx, sy, rr * .35, sx, sy, rr);
    g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(sx - rr, sy - rr, rr * 2, rr * 2);
  };
  hole(P.x, P.y, 150);
  if (G.boss && !G.boss.dead) hole(G.boss.x, G.boss.y, G.bossHole === undefined ? 120 : G.bossHole);
  for (const k of PK) hole(k.x, k.y, 40);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(DK, 0, 0);
  // enemy shots stay faintly visible in the dark
  ctx.globalAlpha = .55 * G.dark;
  for (const b of EB) if (!b.dead && onScreen(b.x, b.y, 10)) spr(b.big ? SP.ebig : SP.ebul, b.x, b.y, b.big ? 20 : 13, b.big ? 20 : 13);
  ctx.globalAlpha = 1;
}
function drawNovaClock() {
  const b = G.boss;
  if (!b || !(b.nova > 0)) return;
  const n = Math.ceil(b.nova), f = b.nova % 1;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.globalAlpha = (1 - b.nova / 4.6) * .35; ctx.fillStyle = COL.pink; ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const sz = 96 + (1 - f) * 40;
  ctx.font = '400 ' + sz.toFixed(0) + 'px "Gasoek One", "Arial Black", sans-serif';
  ctx.fillStyle = COL.ink; ctx.fillText(String(n), W / 2 + 5, H * .64 + 4);
  ctx.fillStyle = COL.yellow; ctx.fillText(String(n), W / 2, H * .64);
}

/* the crafted portal, drawn beside the last light on the title screen */
function drawTitlePortal(x, y, t) {
  wt();
  ctx.globalAlpha = .9;
  for (let k = 0; k < 5; k++) {
    ctx.strokeStyle = k % 2 ? COL.pink : COL.ink; ctx.lineWidth = 3.5 - k * .4;
    ctx.beginPath(); ctx.ellipse(x, y, 30 - k * 5, 44 - k * 7, 0, t * (k % 2 ? -2 : 2.4) + k, t * (k % 2 ? -2 : 2.4) + k + 4.4); ctx.stroke();
  }
  ctx.globalAlpha = .55; ctx.fillStyle = COL.deep; ctx.beginPath(); ctx.ellipse(x, y, 14, 22, 0, 0, TAU); ctx.fill();
  ctx.globalAlpha = 1; ctx.fillStyle = COL.yellow;
  for (let k = 0; k < 6; k++) { const a = t * 1.5 + k, r = 36 + Math.sin(t * 3 + k) * 8; ctx.fillRect(x + Math.cos(a) * r * .7, y + Math.sin(a) * r, 2.5, 2.5); }
}

/* supernova light: rays from the sun, cut off by the pillars */
function rayLen(sx, sy, a, max) {
  const dx = Math.cos(a), dy = Math.sin(a); let L = max;
  for (const o of OB) {
    if (o.dead) continue;
    const ox = o.x - sx, oy = o.y - sy, t = ox * dx + oy * dy;
    if (t <= 0) continue;
    const p2 = ox * ox + oy * oy - t * t;
    if (p2 < o.r * o.r) { const hit = t - Math.sqrt(o.r * o.r - p2); if (hit < L) L = hit; }
  }
  return L;
}
function drawNovaFx() {
  const b = G.boss, now = performance.now() / 1000;
  if (b && b.nova > 0) {
    const p = clamp(1 - b.nova / 4.6, 0, 1);
    wt(); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'butt';
    const n = 48;
    for (let i = 0; i < n; i++) {
      const a = now * .25 + i / n * TAU, L = rayLen(b.x, b.y, a, 250 + 900 * p);
      ctx.globalAlpha = (.04 + p * .2) * (.6 + .4 * Math.sin(now * 22 + i * 2.7));
      ctx.strokeStyle = i % 3 ? COL.yellow : COL.pink; ctx.lineWidth = 3 + p * 16;
      ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x + Math.cos(a) * L, b.y + Math.sin(a) * L); ctx.stroke();
    }
    const gr = 70 + p * 120, g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, gr);
    g.addColorStop(0, 'rgba(255,255,240,' + (.5 + p * .5) + ')'); g.addColorStop(1, 'rgba(255,210,63,0)');
    ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(b.x - gr, b.y - gr, gr * 2, gr * 2);
    ctx.restore();
  }
  const f = G.novaFx; if (!f) return;
  const t = (performance.now() - f.t0) / 1000;
  if (t > 2.6) { G.novaFx = null; return; }
  const fade = t < .2 ? 1 : Math.max(0, 1 - (t - .2) / 2.4);
  wt(); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'butt';
  const n = 90, grow = Math.min(1, t / .18);
  for (let i = 0; i < n; i++) {
    const a = f.rot + i / n * TAU, L = rayLen(f.x, f.y, a, 2000 * grow), ex = f.x + Math.cos(a) * L, ey = f.y + Math.sin(a) * L;
    ctx.globalAlpha = .5 * fade; ctx.strokeStyle = COL.yellow; ctx.lineWidth = 34 * fade + 8;
    ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.globalAlpha = .7 * fade; ctx.strokeStyle = i % 4 ? COL.white : COL.pink; ctx.lineWidth = 9 * fade + 2;
    ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(ex, ey); ctx.stroke();
  }
  for (let k = 0; k < 5; k++) {
    const r = (t - k * .11) * 1500; if (r <= 0) continue;
    ctx.globalAlpha = Math.max(0, 1 - r / 1900) * .9;
    ctx.strokeStyle = [COL.white, COL.yellow, COL.pink, COL.white, COL.yellow][k]; ctx.lineWidth = 60 - k * 9;
    ctx.beginPath(); ctx.arc(f.x, f.y, r, 0, TAU); ctx.stroke();
  }
  const cg = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, 320);
  cg.addColorStop(0, 'rgba(255,255,255,' + fade + ')'); cg.addColorStop(1, 'rgba(255,210,63,0)');
  ctx.globalAlpha = 1; ctx.fillStyle = cg; ctx.fillRect(f.x - 320, f.y - 320, 640, 640);
  ctx.restore();
  // what the light could not reach stays in ink
  wt();
  for (const o of OB) {
    if (o.dead) continue;
    const ang = Math.atan2(o.y - f.y, o.x - f.x), d = Math.hypot(o.x - f.x, o.y - f.y), half = Math.asin(Math.min(1, o.r / d)), L = 1400;
    ctx.globalAlpha = .55 * Math.min(1, fade * 1.4); ctx.fillStyle = COL.deep;
    ctx.beginPath(); ctx.moveTo(o.x + Math.cos(ang + Math.PI / 2) * o.r, o.y + Math.sin(ang + Math.PI / 2) * o.r);
    ctx.lineTo(f.x + Math.cos(ang + half) * (d + L), f.y + Math.sin(ang + half) * (d + L));
    ctx.lineTo(f.x + Math.cos(ang - half) * (d + L), f.y + Math.sin(ang - half) * (d + L));
    ctx.lineTo(o.x + Math.cos(ang - Math.PI / 2) * o.r, o.y + Math.sin(ang - Math.PI / 2) * o.r); ctx.closePath(); ctx.fill();
  }
  ctx.globalAlpha = 1;
  // a short whiteout, then a warm burn on the screen
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const wo = Math.max(0, 1 - t / .35);
  if (wo > 0) { ctx.globalAlpha = wo * .85; ctx.fillStyle = COL.white; ctx.fillRect(0, 0, cv.width, cv.height); }
  ctx.globalAlpha = .18 * fade; ctx.fillStyle = COL.yellow; ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.globalAlpha = 1;
}

/* misregistered double print: the whole frame shudders like a slipped plate */
function pulseScreen(s = 1) { G.pulse = { t0: performance.now(), s }; }
function drawPulse() {
  const p = G.pulse; if (!p) return;
  const t = (performance.now() - p.t0) / 280;
  if (t >= 1) { G.pulse = null; return; }
  const k = (1 - t) * p.s;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = .4 * k;
  ctx.drawImage(cv, 9 * k * DPR, 4 * k * DPR);
  ctx.globalAlpha = .25 * k; ctx.drawImage(cv, -6 * k * DPR, -3 * k * DPR);
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
}
function glowLine(x1, y1, x2, y2, w, col, a) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore();
}
/* extra layers drawn over the base hazards */
function drawHazardFx() {
  drawDeepHazards();
  if (G.u) drawUnknownHazards();
  wt();
  const now = performance.now() / 1000;
  for (const h of HZ) {
    if (h.dead) continue;
    const live = h.t >= (h.warn || 0);
    if (h.k === 'wave') {
      const g = h.gaps[0], half = h.gw / 2;
      for (let k = 1; k <= 3; k++) {
        const r = h.r - k * 16; if (r <= 4) continue;
        ctx.globalAlpha = .35 / k; ctx.strokeStyle = k % 2 ? COL.pink : COL.ink; ctx.lineWidth = h.w * (1 - k * .22);
        ctx.beginPath(); ctx.arc(h.x, h.y, r, g + half, g - half + TAU); ctx.stroke();
      }
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .3; ctx.strokeStyle = COL.yellow; ctx.lineWidth = h.w * 2.2;
      ctx.beginPath(); ctx.arc(h.x, h.y, h.r, g + half, g - half + TAU); ctx.stroke(); ctx.restore();
      ctx.globalAlpha = 1; ctx.fillStyle = COL.white;
      for (let k = 0; k < 10; k++) { const a = g + half + (k + (now * 3) % 1) / 10 * (TAU - h.gw); ctx.fillRect(h.x + Math.cos(a) * h.r - 1.5, h.y + Math.sin(a) * h.r - 1.5, 3, 3); }
    } else if (h.k === 'line' && live && !h.tent && !h.scrib) {
      const fade = Math.min(1, (h.warn + h.dur - h.t) / .4);
      glowLine(h.x1, h.y1, h.x2, h.y2, h.w * 3, COL.yellow, .28 * fade);
      for (let k = 0; k < 6; k++) {
        const f = (now * .9 + k / 6) % 1, px = lerp(h.x1, h.x2, f), py = lerp(h.y1, h.y2, f);
        ctx.globalAlpha = fade; ctx.fillStyle = COL.white; ctx.beginPath(); ctx.arc(px, py, 4, 0, TAU); ctx.fill();
        ctx.fillStyle = COL.pink; ctx.beginPath(); ctx.arc(px + 1.5, py + 1, 2, 0, TAU); ctx.fill();
      }
    } else if (h.k === 'ray' && live && !h.tent) {
      const x2 = h.x + Math.cos(h.a) * h.len, y2 = h.y + Math.sin(h.a) * h.len;
      glowLine(h.x, h.y, x2, y2, h.w * 3.4, COL.yellow, .3);
      glowLine(h.x, h.y, x2, y2, h.w * 1.6, COL.pink, .25);
    } else if (h.k === 'tether' && live) {
      glowLine(h.x1, h.y1, h.x2, h.y2, 46, COL.pink, .3);
      glowLine(h.x1, h.y1, h.x2, h.y2, 20, COL.yellow, .35);
      for (let k = 0; k < 2; k++) {
        const pts = jag(h.x1, h.y1, h.x2, h.y2, 12);
        ctx.globalAlpha = .95; ctx.strokeStyle = k ? COL.white : COL.yellow; ctx.lineWidth = k ? 1.6 : 3.2; ctx.beginPath();
        for (let i = 0; i < pts.length; i += 2) { const o = i && i < pts.length - 2 ? rnd(-9, 9) : 0; i ? ctx.lineTo(pts[i] + o, pts[i + 1] - o) : ctx.moveTo(pts[i], pts[i + 1]); }
        ctx.stroke();
      }
    } else if (h.k === 'band' && live) {
      const R = ARENA_R + 10, tx = -h.ny, ty = h.nx, bx = h.nx * h.d, by = h.ny * h.d;
      const seg = (off, w, col, a) => {
        ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath();
        const cx = bx + h.nx * off, cy = by + h.ny * off;
        ctx.moveTo(cx + tx * -R, cy + ty * -R); ctx.lineTo(cx + tx * (h.gap - h.gw / 2), cy + ty * (h.gap - h.gw / 2));
        ctx.moveTo(cx + tx * (h.gap + h.gw / 2), cy + ty * (h.gap + h.gw / 2)); ctx.lineTo(cx + tx * R, cy + ty * R); ctx.stroke();
      };
      seg(-h.w * 1.1, h.w * 1.4, COL.ink, .22);
      seg(-h.w * 2.1, h.w * .8, COL.ink, .1);
      ctx.globalAlpha = .95; ctx.strokeStyle = COL.white; ctx.lineWidth = 3;
      const na = Math.atan2(h.ny, h.nx);
      for (let k = -R; k < R; k += 20) {
        if (Math.abs(k - h.gap) < h.gw / 2 + 6) continue;
        const kk = k + ((now * 60) % 20), cx = bx + tx * kk + h.nx * h.w * .45, cy = by + ty * kk + h.ny * h.w * .45;
        ctx.beginPath(); ctx.arc(cx, cy, 7, na - 1.4, na + 1.4); ctx.stroke();
      }
      const gx = bx + tx * h.gap, gy = by + ty * h.gap;
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .35 + Math.sin(now * 12) * .15; ctx.fillStyle = COL.yellow;
      ctx.beginPath(); ctx.arc(gx, gy, h.gw * .45, 0, TAU); ctx.fill(); ctx.restore();
    }
  }
  ctx.globalAlpha = 1;
}

function drawDeepHazards() {
  wt();
  const now = performance.now() / 1000;
  for (const h of HZ) {
    if (h.dead) continue;
    const live = h.t >= h.warn, p = clamp(h.t / h.warn, 0, 1);
    if (h.k === 'sector') {
      for (const sct of h.secs) {
        const a = -Math.PI / 2 + sct * SECT;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, ARENA_R, a, a + SECT); ctx.closePath();
        if (!live) { ctx.globalAlpha = .12 + p * .2 + Math.sin(now * 18) * .05; ctx.fillStyle = COL.pink; ctx.fill(); ctx.globalAlpha = .8; ctx.strokeStyle = COL.pink; ctx.lineWidth = 2; ctx.setLineDash([8, 6]); ctx.stroke(); ctx.setLineDash([]); }
        else { const f = 1 - (h.t - h.warn) / .45; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .7 * f; ctx.fillStyle = COL.yellow; ctx.fill(); ctx.restore(); ctx.globalAlpha = .6 * f; ctx.fillStyle = COL.deep; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, ARENA_R * (1 - f * .5), a, a + SECT); ctx.closePath(); ctx.fill(); }
      }
    } else if (h.k === 'bloom') {
      ctx.beginPath(); ctx.arc(0, 0, ARENA_R, 0, TAU);
      for (const sf of h.safes) { ctx.moveTo(sf.x + sf.r, sf.y); ctx.arc(sf.x, sf.y, sf.r, 0, TAU, true); }
      if (!live) { ctx.globalAlpha = .1 + p * .3 + Math.sin(now * 14) * .06; ctx.fillStyle = COL.pink; ctx.fill('evenodd'); }
      else { const f = 1 - (h.t - h.warn) / .5; ctx.globalAlpha = .75 * f; ctx.fillStyle = COL.pink; ctx.fill('evenodd'); }
      for (const sf of h.safes) {
        ctx.globalAlpha = .35; ctx.fillStyle = COL.white; ctx.beginPath(); ctx.arc(sf.x, sf.y, sf.r, 0, TAU); ctx.fill();
        ctx.globalAlpha = .95; ctx.strokeStyle = COL.teal; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(sf.x, sf.y, sf.r, now * 2, now * 2 + TAU * .85); ctx.stroke();
        for (let k = 0; k < 6; k++) { const a = k / 6 * TAU + now; ctx.fillStyle = COL.pink; ctx.beginPath(); ctx.ellipse(sf.x + Math.cos(a) * sf.r * .45, sf.y + Math.sin(a) * sf.r * .45, 7, 4, a, 0, TAU); ctx.fill(); }
      }
    } else if (h.k === 'line' && h.thorn && live) {
      ctx.globalAlpha = .95; ctx.fillStyle = COL.deep; const n = 22;
      for (let k = 0; k <= n; k++) { const f = k / n, px = lerp(h.x1, h.x2, f), py = lerp(h.y1, h.y2, f), a = Math.atan2(h.y2 - h.y1, h.x2 - h.x1) + (k % 2 ? 1.57 : -1.57); ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + Math.cos(a) * 14 + Math.cos(a - 1.57) * 4, py + Math.sin(a) * 14 + Math.sin(a - 1.57) * 4); ctx.lineTo(px + Math.cos(a - 1.57) * 8, py + Math.sin(a - 1.57) * 8); ctx.fill(); }
    }
  }
  if (G.freeze > 0) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = .18; ctx.fillStyle = '#8890A8'; ctx.fillRect(0, 0, cv.width, cv.height); }
  ctx.globalAlpha = 1;
}

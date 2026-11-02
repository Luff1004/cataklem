/* ================= story mode: drawing ================= */
/* people, printed like everything else: a cloak, a head, a hat, something in hand */
const NPC_RES = 3;
function buildStoryArt() { for (const id in NPCS) regNpc(id, 'npc_' + id, NPC_RES); }
function regNpc(id, key, mult) {
  {
    const L = NPCS[id].look, sc = L.big ? 1.15 : L.small ? .8 : 1, r = 16 * sc * mult;
    regCreature(key, r, (x, c, cy, rr) => {
      const s = rr / 16;
      x.beginPath(); x.moveTo(c - 11 * s, cy + 15 * s); x.quadraticCurveTo(c - 10 * s, cy - 2 * s, c - 6 * s, cy - 4 * s); x.lineTo(c + 6 * s, cy - 4 * s); x.quadraticCurveTo(c + 10 * s, cy - 2 * s, c + 11 * s, cy + 15 * s); x.closePath(); x.fill();
      x.beginPath(); x.arc(c, cy - 9 * s, 7 * s, 0, TAU); x.fill();
      x.lineCap = 'round'; x.lineWidth = 2.6 * s;
      if (L.hat === 'wide') { x.beginPath(); x.ellipse(c, cy - 13 * s, 12 * s, 3 * s, 0, 0, TAU); x.fill(); x.beginPath(); x.roundRect(c - 6 * s, cy - 21 * s, 12 * s, 8 * s, 2 * s); x.fill(); }
      if (L.hat === 'hood') { x.beginPath(); x.moveTo(c - 9 * s, cy - 4 * s); x.quadraticCurveTo(c - 10 * s, cy - 20 * s, c + 2 * s, cy - 19 * s); x.quadraticCurveTo(c + 10 * s, cy - 16 * s, c + 9 * s, cy - 4 * s); x.fill(); }
      if (L.hat === 'point') { x.beginPath(); x.moveTo(c - 9 * s, cy - 12 * s); x.lineTo(c + 3 * s, cy - 30 * s); x.lineTo(c + 9 * s, cy - 12 * s); x.fill(); }
      if (L.hat === 'cap') { x.beginPath(); x.arc(c, cy - 12 * s, 7 * s, Math.PI, TAU); x.fill(); x.fillRect(c, cy - 13 * s, 10 * s, 2.5 * s); }
      if (L.hat === 'band') { x.fillRect(c - 7 * s, cy - 14 * s, 14 * s, 3 * s); x.beginPath(); x.moveTo(c + 6 * s, cy - 13 * s); x.lineTo(c + 12 * s, cy - 9 * s); x.stroke(); }
      if (L.hat === 'crown') { x.beginPath(); x.moveTo(c - 8 * s, cy - 13 * s); x.lineTo(c - 8 * s, cy - 21 * s); x.lineTo(c - 3 * s, cy - 16 * s); x.lineTo(c, cy - 22 * s); x.lineTo(c + 3 * s, cy - 16 * s); x.lineTo(c + 8 * s, cy - 21 * s); x.lineTo(c + 8 * s, cy - 13 * s); x.fill(); }
      if (L.item === 'staff') { x.beginPath(); x.moveTo(c + 13 * s, cy + 15 * s); x.lineTo(c + 13 * s, cy - 16 * s); x.stroke(); x.beginPath(); x.arc(c + 13 * s, cy - 17 * s, 3 * s, 0, TAU); x.fill(); }
      if (L.item === 'bag') { x.beginPath(); x.roundRect(c - 17 * s, cy + 1 * s, 9 * s, 10 * s, 3 * s); x.fill(); }
      if (L.item === 'hammer') { x.beginPath(); x.moveTo(c + 12 * s, cy + 12 * s); x.lineTo(c + 12 * s, cy - 6 * s); x.stroke(); x.fillRect(c + 7 * s, cy - 10 * s, 11 * s, 6 * s); }
      if (L.item === 'book') { x.fillRect(c - 16 * s, cy, 9 * s, 11 * s); }
      if (L.item === 'torch') { x.beginPath(); x.moveTo(c + 12 * s, cy + 12 * s); x.lineTo(c + 12 * s, cy - 8 * s); x.stroke(); }
      if (L.item === 'bow') { x.beginPath(); x.arc(c + 6 * s, cy + 2 * s, 12 * s, -1.2, 1.2); x.stroke(); }
      if (L.item === 'crayon') { x.save(); x.translate(c + 12 * s, cy + 2 * s); x.rotate(-.6); x.fillRect(-2 * s, -7 * s, 4 * s, 12 * s); x.restore(); }
    }, (x, c, cy, rr) => {
      const s = rr / 16;
      eyes(x, [[c - 3 * s, cy - 9 * s], [c + 3 * s, cy - 9 * s]], 1.9 * s, 1 * s, .2);
      if (L.beard) { x.fillStyle = COL.white; x.globalAlpha = .85; x.beginPath(); x.moveTo(c - 5 * s, cy - 5 * s); x.quadraticCurveTo(c, cy + 4 * s, c + 5 * s, cy - 5 * s); x.fill(); x.globalAlpha = 1; }
      if (L.item === 'torch') { x.fillStyle = COL.yellow; flamePath(x, c + 12 * s, cy - 11 * s, 3.4 * s); x.fill(); }
      if (L.item === 'crayon') { x.fillStyle = COL.yellow; x.save(); x.translate(c + 12 * s, cy + 2 * s); x.rotate(-.6); x.fillRect(-2 * s, -9 * s, 4 * s, 3 * s); x.restore(); }
      x.fillStyle = COL.white; x.globalAlpha = .35; x.fillRect(c - 1 * s, cy, 2 * s, 13 * s); x.globalAlpha = 1;
    }, { plates: [{ col: L.c, dx: 1.6, dy: 1.2 }, { col: COL.ink, dx: 0, dy: 0 }] });
  }
}

/* ---------- the area's walls and trees, printed once ---------- */
const REG_INK = { 1: [COL.pink, COL.ink], 2: [COL.teal, COL.ink], 3: [COL.yellow, COL.ink], 4: ['#7CC6D8', COL.ink], 5: [COL.pink, COL.deep] };
function areaLayer() {
  if (AREA_CV[WD.id]) return AREA_CV[WD.id];
  const keys = Object.keys(AREA_CV); if (keys.length > 4) delete AREA_CV[keys[0]];
  const SC = 1.5, c = document.createElement('canvas'); c.width = WD.w * TL * SC; c.height = WD.h * TL * SC;
  const x = c.getContext('2d'); x.scale(SC, SC);
  const R = mulberry(WD.A.seed || 99), [A, B] = REG_INK[WD.reg];
  const at = (tx, ty) => tx < 0 || ty < 0 || tx >= WD.w || ty >= WD.h ? '#' : WD.grid[ty][tx];
  // the ground has a colour of its own, in soft patches
  const GROUND = { 1: [120, 165, 95], 2: [70, 120, 105], 3: [215, 180, 120], 4: [200, 225, 235], 5: [37, 53, 111] }[WD.reg];
  for (let ty = 0; ty < WD.h; ty++) for (let tx = 0; tx < WD.w; tx++) {
    const v = vnoise(tx, ty, 3, (WD.A.seed || 1) + 40), al = (WD.reg === 5 ? .03 : .1) + v * (WD.reg === 5 ? .04 : .12);
    x.fillStyle = 'rgba(' + GROUND.join(',') + ',' + al.toFixed(3) + ')'; x.fillRect(tx * TL - .5, ty * TL - .5, TL + 1, TL + 1);
  }
  if (WD.A.arena) arenaPlatform(x, R);
  // ground marks first
  for (let ty = 0; ty < WD.h; ty++) for (let tx = 0; tx < WD.w; tx++) {
    const ch = WD.grid[ty][tx], X = tx * TL, Y = ty * TL;
    if (WD.A.arena) { const g2 = arenaGeom(); if (((X + TL / 2 - g2.cx) / g2.rx) ** 2 + ((Y + TL / 2 - g2.cy) / g2.ry) ** 2 < 1) continue; }
    if ((ch === '.' || ch === ',') && WD.reg <= 2 && R() < (ch === ',' ? 1 : .3)) {
      // grass: a soft patch and blades of two shades, now and then a flower
      const n = ch === ',' ? 7 : 2, dark = WD.reg === 2 ? '#2E5E60' : '#4F7F4A', lite = WD.reg === 2 ? '#5E9A8A' : '#7FB06A';
      if (ch === ',') { x.fillStyle = WD.reg === 2 ? 'rgba(70,130,110,.16)' : 'rgba(110,170,90,.18)'; x.beginPath(); x.ellipse(X + TL / 2, Y + TL / 2, TL * .7, TL * .5, R(), 0, TAU); x.fill(); }
      x.lineWidth = 1.5; x.lineCap = 'round';
      for (let k = 0; k < n; k++) {
        const gx = X + 4 + R() * 40, gy = Y + 10 + R() * 34, hh = 6 + R() * 7;
        x.strokeStyle = R() < .5 ? dark : lite; x.beginPath();
        x.moveTo(gx - 3, gy); x.quadraticCurveTo(gx - 3, gy - hh * .5, gx - 5, gy - hh * .9);
        x.moveTo(gx, gy); x.lineTo(gx + (R() - .5) * 2, gy - hh);
        x.moveTo(gx + 3, gy); x.quadraticCurveTo(gx + 3, gy - hh * .5, gx + 5, gy - hh * .8); x.stroke();
      }
      if (ch === ',' && R() < .25) { const fx = X + 8 + R() * 32, fy = Y + 8 + R() * 30; x.fillStyle = [COL.pink, COL.yellow, COL.white][Math.floor(R() * 3)]; for (let k = 0; k < 5; k++) { x.beginPath(); x.arc(fx + Math.cos(k * 1.26) * 2.6, fy + Math.sin(k * 1.26) * 2.6, 1.8, 0, TAU); x.fill(); } x.fillStyle = COL.yellow; x.beginPath(); x.arc(fx, fy, 1.4, 0, TAU); x.fill(); }
      continue;
    }
    if (ch === '+') { x.fillStyle = 'rgba(37,53,111,.08)'; x.fillRect(X - 2, Y - 2, TL + 4, TL + 4); x.fillStyle = 'rgba(37,53,111,.12)'; for (let k = 0; k < 5; k++) { x.beginPath(); x.arc(X + R() * TL, Y + R() * TL, 1.5 + R() * 2, 0, TAU); x.fill(); } }
    if (ch === ',') { x.strokeStyle = 'rgba(37,53,111,.3)'; x.lineWidth = 1.4; for (let k = 0; k < 2; k++) { const gx = X + 10 + R() * 28, gy = Y + 14 + R() * 24; x.beginPath(); x.moveTo(gx - 4, gy); x.quadraticCurveTo(gx - 4, gy - 5, gx - 6, gy - 9); x.moveTo(gx, gy); x.lineTo(gx, gy - 10); x.moveTo(gx + 4, gy); x.quadraticCurveTo(gx + 4, gy - 5, gx + 6, gy - 8); x.stroke(); } }
    if (ch === 'i') { x.fillStyle = 'rgba(160,215,232,.55)'; x.fillRect(X, Y, TL, TL); x.strokeStyle = 'rgba(255,255,255,.8)'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(X + 8 + R() * 10, Y + 30); x.lineTo(X + 22 + R() * 10, Y + 16); x.stroke(); }
    if (ch === '=') { x.fillStyle = '#B9894F'; x.fillRect(X, Y + 4, TL, TL - 8); x.strokeStyle = COL.ink; x.lineWidth = 1.5; for (let k = 0; k < 4; k++) { x.beginPath(); x.moveTo(X + k * 12, Y + 4); x.lineTo(X + k * 12, Y + TL - 4); x.stroke(); } }
    if (EXIT_CH[ch]) { x.fillStyle = 'rgba(37,53,111,.06)'; x.fillRect(X, Y, TL, TL); }
  }
  // water: one rounded body per lake, a sandy bank, deeper in the middle
  const wt2 = [];
  for (let ty = 0; ty < WD.h; ty++) for (let tx = 0; tx < WD.w; tx++) if (WD.grid[ty][tx] === '~') wt2.push([tx, ty]);
  if (wt2.length) {
    const blob = (r, grow) => {
      x.beginPath();
      for (const [tx, ty] of wt2) {
        const cx = tx * TL + TL / 2, cy = ty * TL + TL / 2;
        x.moveTo(cx + r, cy); x.arc(cx, cy, r, 0, TAU);
        if (at(tx + 1, ty) === '~') x.rect(cx, cy - r, TL, r * 2);
        if (at(tx, ty + 1) === '~') x.rect(cx - r, cy, r * 2, TL);
        if (grow && at(tx + 1, ty) === '~' && at(tx, ty + 1) === '~' && at(tx + 1, ty + 1) === '~') x.rect(cx, cy, TL, TL);
      }
    };
    const deep = WD.reg === 5 ? '#141B40' : WD.reg === 3 ? '#1F8A86' : WD.reg === 4 ? '#4E9CBC' : '#3C8FB4';
    const mid = WD.reg === 5 ? '#25356F' : WD.reg === 3 ? '#3FB0A8' : WD.reg === 4 ? '#7CC0DA' : '#5FB0D0';
    x.fillStyle = WD.reg === 5 ? 'rgba(20,27,64,.35)' : 'rgba(170,140,95,.55)'; blob(TL * .7 + 6, true); x.fill();
    x.fillStyle = mid; blob(TL * .7, true); x.fill();
    x.save(); blob(TL * .7, true); x.clip();
    x.fillStyle = deep; x.globalAlpha = .55; blob(TL * .7 - 12, true); x.fill(); x.globalAlpha = .4; blob(TL * .7 - 22, true); x.fill(); x.globalAlpha = 1;
    x.strokeStyle = 'rgba(255,255,255,.18)'; x.lineWidth = 1.2;
    for (const [tx, ty] of wt2) { const X = tx * TL, Y = ty * TL; for (let k = 0; k < 2; k++) { const wy = Y + 12 + k * 18 + R() * 4; x.beginPath(); x.moveTo(X + 6, wy); x.quadraticCurveTo(X + 16, wy - 4, X + 26, wy); x.quadraticCurveTo(X + 36, wy + 4, X + 44, wy); x.stroke(); } }
    x.restore();
  }
  // solid things, back to front
  for (let ty = 0; ty < WD.h; ty++) for (let tx = 0; tx < WD.w; tx++) {
    const ch = WD.grid[ty][tx], X = tx * TL, Y = ty * TL, cx = X + TL / 2, cy = Y + TL / 2;
    if (TALL_CH.has(ch)) { if (ch !== '#' && ch !== 'h') { x.fillStyle = 'rgba(20,27,64,.2)'; x.beginPath(); x.ellipse(cx + 3, cy + 12, 20, 9, 0, 0, TAU); x.fill(); } continue; }
    if (ch === '#') {
      x.fillStyle = A; x.fillRect(X + 3, Y + 3, TL, TL);
      x.fillStyle = WD.reg === 5 ? '#F4F1EA' : WD.reg === 4 ? '#CFE3EA' : '#9EA4B4'; x.fillRect(X, Y, TL, TL);
      x.strokeStyle = B; x.lineWidth = 2; x.strokeRect(X + 1, Y + 1, TL - 2, TL - 2);
      x.lineWidth = 1.2; x.beginPath(); x.moveTo(X, Y + TL / 2); x.lineTo(X + TL, Y + TL / 2); x.moveTo(X + (ty % 2 ? 16 : 30), Y); x.lineTo(X + (ty % 2 ? 16 : 30), Y + TL / 2); x.moveTo(X + (ty % 2 ? 34 : 12), Y + TL / 2); x.lineTo(X + (ty % 2 ? 34 : 12), Y + TL); x.stroke();
      if (WD.reg === 5) { x.strokeStyle = 'rgba(37,53,111,.35)'; x.lineWidth = 1; for (let k = 0; k < 3; k++) { x.beginPath(); x.moveTo(X + 6, Y + 8 + k * 6); x.lineTo(X + 18 + R() * 20, Y + 8 + k * 6); x.stroke(); } }
    } else if (ch === 't') {
      const rr = 22 + R() * 9, ox = (R() - .5) * 8, oy = (R() - .5) * 6;
      x.fillStyle = 'rgba(20,27,64,.22)'; x.beginPath(); x.ellipse(cx + 4, cy + 14, rr * .9, rr * .4, 0, 0, TAU); x.fill();
      x.fillStyle = B; x.fillRect(cx - 4, cy, 8, 18);
      x.fillStyle = A; x.beginPath(); x.arc(cx + ox + 3, cy + oy - 6 + 2, rr, 0, TAU); x.fill();
      x.globalCompositeOperation = 'multiply'; x.fillStyle = WD.reg === 2 ? '#2E4E5A' : B; x.beginPath(); x.arc(cx + ox, cy + oy - 6, rr, 0, TAU); x.arc(cx + ox - rr * .5, cy + oy + rr * .1 - 6, rr * .65, 0, TAU); x.fill(); x.globalCompositeOperation = 'source-over';
      x.fillStyle = 'rgba(255,255,255,.28)'; for (let k = 0; k < 4; k++) { x.beginPath(); x.arc(cx + ox + (R() - .5) * rr, cy + oy - 6 + (R() - .7) * rr, 2 + R() * 2.5, 0, TAU); x.fill(); }
    } else if (ch === 'o') {
      const pts = []; const n = 7, rr = 18 + R() * 6;
      for (let k = 0; k < n; k++) { const a = k / n * TAU, q = rr * (.75 + R() * .3); pts.push([cx + Math.cos(a) * q, cy + 4 + Math.sin(a) * q * .8]); }
      x.fillStyle = A; x.beginPath(); pts.forEach(([px, py], i) => i ? x.lineTo(px + 3, py + 3) : x.moveTo(px + 3, py + 3)); x.fill();
      x.fillStyle = WD.reg === 3 ? '#F2EEDF' : '#8C93A3'; x.beginPath(); pts.forEach(([px, py], i) => i ? x.lineTo(px, py) : x.moveTo(px, py)); x.closePath(); x.fill();
      x.strokeStyle = B; x.lineWidth = 2; x.stroke();
      x.strokeStyle = 'rgba(255,255,255,.6)'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(cx - rr * .4, cy - rr * .2); x.lineTo(cx - rr * .1, cy - rr * .5); x.stroke();
    } else if (ch === 'h') {
      x.fillStyle = A; x.fillRect(X + 3, Y + 3, TL, TL);
      const top = at(tx, ty - 1) !== 'h';
      x.fillStyle = top ? '#C25A5A' : '#D9C7A6'; x.fillRect(X, Y, TL, TL);
      x.strokeStyle = B; x.lineWidth = 1.4;
      if (top) { for (let k = 0; k < 4; k++) { x.beginPath(); x.moveTo(X, Y + 6 + k * 11); x.lineTo(X + TL, Y + 6 + k * 11); x.stroke(); } }
      else { x.strokeRect(X + 14, Y + 12, 18, 14); x.beginPath(); x.moveTo(X + 23, Y + 12); x.lineTo(X + 23, Y + 26); x.stroke(); }
      if (at(tx - 1, ty) !== 'h') { x.fillStyle = B; x.fillRect(X, Y, 2.5, TL); }
      if (at(tx + 1, ty) !== 'h') { x.fillStyle = B; x.fillRect(X + TL - 2.5, Y, 2.5, TL); }
      if (top) { x.fillStyle = B; x.fillRect(X, Y, TL, 2.5); }
      if (at(tx, ty + 1) !== 'h') { x.fillStyle = B; x.fillRect(X, Y + TL - 2.5, TL, 2.5); }
    } else if (ch === 'f') {
      x.strokeStyle = B; x.lineWidth = 3; x.beginPath(); x.moveTo(X + 8, Y + 10); x.lineTo(X + 8, Y + 40); x.moveTo(X + 40, Y + 10); x.lineTo(X + 40, Y + 40); x.moveTo(X, Y + 18); x.lineTo(X + TL, Y + 18); x.moveTo(X, Y + 32); x.lineTo(X + TL, Y + 32); x.stroke();
    } else if (ch === 'c') {
      x.fillStyle = A; x.beginPath(); x.roundRect(cx - 7 + 3, cy - 18 + 3, 14, 36, 7); x.fill();
      x.fillStyle = '#4E8A5E'; x.beginPath(); x.roundRect(cx - 7, cy - 18, 14, 36, 7); x.roundRect(cx - 18, cy - 8, 10, 14, 5); x.roundRect(cx + 8, cy - 12, 10, 14, 5); x.fill();
      x.strokeStyle = B; x.lineWidth = 1.8; x.stroke();
    } else if (ch === 'b') {
      x.fillStyle = A; x.fillRect(X + 7, Y + 7, TL - 8, TL - 8);
      x.fillStyle = '#B9894F'; x.fillRect(X + 4, Y + 4, TL - 8, TL - 8);
      x.strokeStyle = B; x.lineWidth = 2; x.strokeRect(X + 4, Y + 4, TL - 8, TL - 8); x.beginPath(); x.moveTo(X + 4, Y + 4); x.lineTo(X + TL - 4, Y + TL - 4); x.moveTo(X + TL - 4, Y + 4); x.lineTo(X + 4, Y + TL - 4); x.stroke();
    } else if (ch === 'x') {
      x.fillStyle = COL.deep; x.fillRect(X - .5, Y - .5, TL + 1, TL + 1);
      x.strokeStyle = 'rgba(255,79,158,.45)'; x.lineWidth = 1.5; x.beginPath(); let px = X + R() * TL, py = Y + R() * TL; x.moveTo(px, py); for (let k = 0; k < 6; k++) { px = X + R() * TL; py = Y + R() * TL; x.lineTo(px, py); } x.stroke();
    }
  }
  AREA_CV[WD.id] = c;
  return c;
}

/* ---------- drawn under the actors ---------- */
function drawStoryWorld() {
  if (!WD) return;
  wt();
  const mw = WD.w * TL, mh = WD.h * TL, pad = 2000;
  // outside the map is dark ink
  ctx.fillStyle = WD.reg === 5 ? '#141B40' : '#1D2547';
  ctx.fillRect(-pad, -pad, mw + pad * 2, pad); ctx.fillRect(-pad, mh, mw + pad * 2, pad); ctx.fillRect(-pad, 0, pad, mh); ctx.fillRect(mw, 0, pad, mh);
  ctx.drawImage(areaLayer(), 0, 0, mw, mh);
  const now = performance.now() / 1000;
  drawWaterFx(now);
  drawArenaFx(now);
  // exits: chevrons, and the name of where they go
  for (const side of ['W', 'E', 'N', 'S']) {
    const ex = exitInfo(side); if (!ex) continue;
    const ch = SIDE_CH[side], pts = [];
    for (let y = 0; y < WD.h; y++) for (let x = 0; x < WD.w; x++) if (WD.grid[y][x] === ch) pts.push([x, y]);
    if (!pts.length) continue;
    const mx = (pts.reduce((a, p) => a + p[0], 0) / pts.length + .5) * TL, my = (pts.reduce((a, p) => a + p[1], 0) / pts.length + .5) * TL;
    const open = ex.open && !WD.bossLock && !WD.locked, ang = { W: Math.PI, E: 0, N: -Math.PI / 2, S: Math.PI / 2 }[side];
    wt();
    if (open) {
      for (let k = 0; k < 3; k++) { const o = ((now * 1.2 + k / 3) % 1) * 18; ctx.globalAlpha = .55 * (1 - o / 18); ctx.strokeStyle = COL.ink; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); const bx = mx - Math.cos(ang) * (20 - o), by = my - Math.sin(ang) * (20 - o); ctx.moveTo(bx + Math.cos(ang + 2.4) * 10, by + Math.sin(ang + 2.4) * 10); ctx.lineTo(bx, by); ctx.lineTo(bx + Math.cos(ang - 2.4) * 10, by + Math.sin(ang - 2.4) * 10); ctx.stroke(); }
      ctx.globalAlpha = 1;
    } else {
      ctx.strokeStyle = COL.pink; ctx.lineWidth = 4; ctx.setLineDash([8, 6]);
      ctx.beginPath(); if (side === 'W' || side === 'E') { ctx.moveTo(mx, my - TL * 1.5); ctx.lineTo(mx, my + TL * 1.5); } else { ctx.moveTo(mx - TL * 1.5, my); ctx.lineTo(mx + TL * 1.5, my); } ctx.stroke(); ctx.setLineDash([]);
    }
    const nm = AREAS[ex.to] ? AREAS[ex.to].name : '';
    if (nm && Math.hypot(P.x - mx, P.y - my) < TL * 5) {
      const tx2 = mx - Math.cos(ang) * 46, ty2 = my - Math.sin(ang) * 46 - 4;
      label(tx2, ty2, (open ? '' : '× ') + nm, open ? COL.ink : COL.pink);
    }
  }
  drawTallAndEnts(now);
  drawArenaFxUp();
  drawArenaLife(now);
  if (WD.boss) { wt(); ctx.globalAlpha = .25 + Math.sin(now * 2) * .08; ctx.fillStyle = COL.deep; ctx.beginPath(); ctx.ellipse(WD.boss.x, WD.boss.y + 10, 70, 24, 0, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; }
}
function label(x, y, text, col = COL.ink) {
  wu(); y *= TY; ctx.font = '800 12px "Gothic A1", "Noto Sans JP", "Noto Sans SC", system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(text).width + 12;
  ctx.fillStyle = COL.paper; ctx.globalAlpha = .9; ctx.fillRect(x - w / 2, y - 9, w, 18); ctx.globalAlpha = 1;
  ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.strokeRect(x - w / 2, y - 9, w, 18);
  ctx.fillStyle = col; ctx.fillText(text, x, y + .5);
}
function drawEnt(e, now) {
  const x = e.x, y = e.y, S = SAVE.story;
  wt();
  if (drawProp(e, now)) { wt(); return; }
  if (drawEnt2(e, now)) return;
  switch (e.k) {
    case 'npc': {
      const SP2 = SPR['npc_' + e.o.id]; if (!SP2) break;
      spr(SP.shadow, x, y + 14, 26, 8);
      const b = Math.sin(now * 2.2 + e.t) * .03, face = P.x < x ? -1 : 1;
      spr(SP2.img, x, y - 4, SP2.size * 1.25 / NPC_RES, SP2.size * 1.25 / NPC_RES, 0, face * (1 + b), 1 - b);
      const list = TALK[e.o.id], idx = list.findIndex(r => r[0](S));
      if (idx < list.length - 1 && list[idx][2] && !/openStoryShop/.test(String(list[idx][2]))) { wt(); ctx.font = '400 22px "Gasoek One", sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = COL.pink; ctx.fillText('!', x + 2, y - 38 + Math.sin(now * 5) * 3 + 2); ctx.fillStyle = COL.yellow; ctx.fillText('!', x, y - 38 + Math.sin(now * 5) * 3); }
      if (Math.hypot(P.x - x, P.y - y) < TL * 2.6) label(x, y + 30, NPCS[e.o.id].name);
      break;
    }
    case 'torch': {
      const lit = S.lit[WD.id + ':' + e.tx + ',' + e.ty];
      ctx.fillStyle = 'rgba(20,27,64,.25)'; ctx.beginPath(); ctx.ellipse(x, y + 16, 12, 4, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = COL.ink; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y + 16); ctx.lineTo(x, y - 8); ctx.stroke();
      ctx.fillStyle = COL.ink; ctx.beginPath(); ctx.moveTo(x - 9, y - 8); ctx.lineTo(x + 9, y - 8); ctx.lineTo(x + 6, y - 2); ctx.lineTo(x - 6, y - 2); ctx.fill();
      if (lit) {
        const f = 1 + Math.sin(now * 13 + e.t) * .1;
        ctx.globalAlpha = .35; spr(SP.glow, x, y - 14, 110, 110); wt(); ctx.globalAlpha = 1;
        ctx.fillStyle = COL.pink; ctx.beginPath(); ctx.ellipse(x + 1.5, y - 17, 7 * f, 11 * f, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = COL.yellow; ctx.beginPath(); ctx.ellipse(x, y - 18, 5.5 * f, 9 * f, 0, 0, TAU); ctx.fill();
      } else { ctx.fillStyle = 'rgba(37,53,111,.4)'; ctx.beginPath(); ctx.arc(x, y - 12, 4, 0, TAU); ctx.fill(); }
      break;
    }
    case 'sign':
      ctx.strokeStyle = COL.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, y + 16); ctx.lineTo(x, y - 2); ctx.stroke();
      ctx.fillStyle = COL.pink; ctx.fillRect(x - 15, y - 15, 32, 18); ctx.fillStyle = '#D9C7A6'; ctx.fillRect(x - 17, y - 17, 32, 18); ctx.strokeStyle = COL.ink; ctx.lineWidth = 2; ctx.strokeRect(x - 17, y - 17, 32, 18);
      ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x - 12, y - 11); ctx.lineTo(x + 10, y - 11); ctx.moveTo(x - 12, y - 6); ctx.lineTo(x + 4, y - 6); ctx.stroke();
      break;
    case 'board':
      ctx.strokeStyle = COL.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x - 14, y + 16); ctx.lineTo(x - 14, y - 6); ctx.moveTo(x + 14, y + 16); ctx.lineTo(x + 14, y - 6); ctx.stroke();
      ctx.fillStyle = '#B9894F'; ctx.fillRect(x - 20, y - 24, 40, 24); ctx.strokeStyle = COL.ink; ctx.lineWidth = 2; ctx.strokeRect(x - 20, y - 24, 40, 24);
      ctx.fillStyle = COL.paper; ctx.fillRect(x - 15, y - 20, 12, 14); ctx.fillRect(x + 2, y - 19, 13, 12);
      if (S.bounty && S.bounty.done) { ctx.fillStyle = COL.yellow; ctx.beginPath(); ctx.arc(x + 16, y - 24, 6, 0, TAU); ctx.fill(); }
      break;
    case 'chest': {
      const open = S.opened[e.o.id], locked = e.o.g && !gSolved(e.o.g);
      ctx.fillStyle = COL.pink; ctx.fillRect(x - 15, y - 7, 32, 22);
      ctx.fillStyle = open ? '#7A5A3A' : '#B9894F'; ctx.fillRect(x - 17, y - 9, 32, 22); ctx.strokeStyle = COL.ink; ctx.lineWidth = 2.2; ctx.strokeRect(x - 17, y - 9, 32, 22);
      if (!open) { ctx.fillStyle = '#D2793A'; ctx.fillRect(x - 17, y - 15, 32, 8); ctx.strokeRect(x - 17, y - 15, 32, 8); ctx.fillStyle = COL.yellow; ctx.fillRect(x - 3, y - 7, 6, 7); }
      if (!open && !locked) { ctx.globalAlpha = .4 + Math.sin(now * 4) * .3; ctx.fillStyle = COL.white; ctx.fillRect(x + 8, y - 22, 3, 3); ctx.fillRect(x - 12, y - 19, 2, 2); ctx.globalAlpha = 1; }
      if (locked) { ctx.strokeStyle = COL.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 18, y - 12); ctx.lineTo(x + 16, y + 12); ctx.moveTo(x + 16, y - 12); ctx.lineTo(x - 18, y + 12); ctx.stroke(); }
      break;
    }
    case 'pot':
      if (e.broken) { ctx.fillStyle = 'rgba(37,53,111,.35)'; for (let k = 0; k < 4; k++) ctx.fillRect(x - 10 + k * 6, y + 6 + (k % 2) * 4, 5, 3); break; }
      ctx.fillStyle = COL.pink; ctx.beginPath(); ctx.arc(x + 2, y + 4, 13, 0, TAU); ctx.fill();
      ctx.fillStyle = '#C97B4A'; ctx.beginPath(); ctx.arc(x, y + 2, 13, 0, TAU); ctx.fill(); ctx.strokeStyle = COL.ink; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#C97B4A'; ctx.fillRect(x - 6, y - 14, 12, 6); ctx.strokeRect(x - 6, y - 14, 12, 6);
      break;
    case 'box': {
      if (e.mt !== undefined && e.mt < 1) { e.mt = Math.min(1, e.mt + .2); }
      const k = e.mt === undefined ? 1 : ease(e.mt), bx = e.ax !== undefined ? lerp(e.ax, e.x, k) : x, by = e.ay !== undefined ? lerp(e.ay, e.y, k) : y;
      ctx.fillStyle = COL.pink; ctx.fillRect(bx - 19, by - 17, 40, 40);
      ctx.fillStyle = '#9EA4B4'; ctx.fillRect(bx - 21, by - 19, 40, 40); ctx.strokeStyle = COL.ink; ctx.lineWidth = 2.5; ctx.strokeRect(bx - 21, by - 19, 40, 40);
      ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(bx - 21, by); ctx.lineTo(bx + 19, by); ctx.moveTo(bx - 4, by - 19); ctx.lineTo(bx - 4, by); ctx.moveTo(bx + 8, by); ctx.lineTo(bx + 8, by + 21); ctx.stroke();
      break;
    }
    case 'plate': {
      const on = e.on || gSolved(e.o.g);
      ctx.fillStyle = on ? COL.yellow : 'rgba(37,53,111,.18)'; ctx.fillRect(x - 18, y - 18, 36, 36);
      ctx.strokeStyle = COL.ink; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.strokeRect(x - 18, y - 18, 36, 36); ctx.setLineDash([]);
      break;
    }
    case 'gate': {
      const open = gSolved(e.o.g);
      if (open) { ctx.fillStyle = 'rgba(37,53,111,.18)'; ctx.fillRect(x - 24, y - 24, 48, 6); break; }
      ctx.fillStyle = COL.pink; ctx.fillRect(x - 21, y - 21, 46, 46);
      ctx.fillStyle = '#6B7185'; ctx.fillRect(x - 24, y - 24, 48, 48);
      ctx.strokeStyle = COL.ink; ctx.lineWidth = 3; for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.moveTo(x - 20 + k * 10, y - 24); ctx.lineTo(x - 20 + k * 10, y + 24); ctx.stroke(); }
      ctx.strokeRect(x - 24, y - 24, 48, 48);
      break;
    }
    case 'brazier': {
      ctx.fillStyle = COL.ink; ctx.beginPath(); ctx.moveTo(x - 16, y - 6); ctx.lineTo(x + 16, y - 6); ctx.lineTo(x + 10, y + 6); ctx.lineTo(x - 10, y + 6); ctx.fill(); ctx.fillRect(x - 3, y + 6, 6, 10); ctx.fillRect(x - 10, y + 14, 20, 4);
      if (e.lit || gSolved(e.o.g)) { const f = 1 + Math.sin(now * 12 + e.t) * .1; ctx.globalAlpha = .4; spr(SP.glow, x, y - 14, 140, 140); wt(); ctx.globalAlpha = 1; ctx.fillStyle = COL.pink; flamePathC(x + 1.5, y - 14, 11 * f); ctx.fillStyle = COL.yellow; flamePathC(x, y - 15, 8 * f); }
      break;
    }
    case 'lamp': {
      const on = e.on || gSolved(e.o.g);
      if (on) { ctx.globalAlpha = .35; spr(SP.glow, x, y - 6, 90, 90); wt(); ctx.globalAlpha = 1; }
      ctx.strokeStyle = COL.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y + 16); ctx.lineTo(x, y + 4); ctx.stroke();
      ctx.fillStyle = on ? COL.yellow : '#6B7185'; ctx.beginPath(); ctx.roundRect(x - 10, y - 18, 20, 22, 4); ctx.fill(); ctx.lineWidth = 2.2; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - 10, y - 7); ctx.lineTo(x + 10, y - 7); ctx.stroke();
      break;
    }
    case 'rune': {
      const lit = e.lit || gSolved(e.o.g), fl = e.flash > 0; if (e.flash > 0) e.flash -= 1 / 60;
      ctx.fillStyle = fl ? COL.yellow : lit ? COL.teal : 'rgba(37,53,111,.15)';
      ctx.beginPath(); ctx.arc(x, y, 20, 0, TAU); ctx.fill();
      ctx.strokeStyle = COL.ink; ctx.lineWidth = 2; ctx.stroke();
      ctx.strokeStyle = fl || lit ? COL.white : COL.ink; ctx.lineWidth = 2.2; ctx.beginPath();
      const n = e.o.n; for (let k = 0; k <= n % 4 + 2; k++) { const a = k / (n % 4 + 3) * TAU + n; k ? ctx.lineTo(x + Math.cos(a) * 11, y + Math.sin(a) * 11) : ctx.moveTo(x + Math.cos(a) * 11, y + Math.sin(a) * 11); } ctx.stroke();
      if (fl) { ctx.globalAlpha = .5; spr(SP.glow, x, y, 110, 110); wt(); ctx.globalAlpha = 1; }
      break;
    }
    case 'bell': {
      const ring = WD.playing ? Math.sin(now * 30) * .08 : 0;
      ctx.save(); ctx.translate(x, y); ctx.rotate(ring);
      ctx.fillStyle = COL.yellow; ctx.beginPath(); ctx.moveTo(0, -26); ctx.lineTo(12, -4); ctx.lineTo(6, 16); ctx.lineTo(-6, 16); ctx.lineTo(-12, -4); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = COL.ink; ctx.lineWidth = 2; ctx.stroke(); ctx.strokeStyle = COL.white; ctx.beginPath(); ctx.moveTo(-3, -16); ctx.lineTo(-6, 4); ctx.stroke();
      ctx.restore();
      break;
    }
    case 'door': {
      const open = !e.o.need || sf(e.o.need);
      ctx.fillStyle = COL.deep; ctx.beginPath(); ctx.moveTo(x - 20, y + 20); ctx.lineTo(x - 20, y - 6); ctx.quadraticCurveTo(x, y - 30, x + 20, y - 6); ctx.lineTo(x + 20, y + 20); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = COL.ink; ctx.lineWidth = 3; ctx.stroke();
      if (open) { ctx.fillStyle = 'rgba(255,210,63,.6)'; for (let k = 0; k < 3; k++) ctx.fillRect(x - 12 + k * 3, y + 4 + k * 5, 24 - k * 6, 3); }
      else { ctx.strokeStyle = '#B9894F'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x - 18, y); ctx.lineTo(x + 18, y); ctx.moveTo(x - 18, y + 10); ctx.lineTo(x + 18, y + 10); ctx.stroke(); }
      if (e.o.label && Math.hypot(P.x - x, P.y - y) < TL * 3) label(x, y - 36, e.o.label);
      break;
    }
    case 'portal': {
      const gt = GATES.find(g => g.id === e.o.gate), done = sf('gate_' + e.o.gate), shut = e.o.need && !sf(e.o.need);
      const rr = 26 + Math.sin(now * 3) * 2;
      if (!shut) { ctx.globalAlpha = .4; spr(SP.glow, x, y, 150, 150); wt(); ctx.globalAlpha = 1; }
      for (let k = 0; k < 3; k++) { ctx.strokeStyle = k === 1 ? COL.yellow : k === 2 ? COL.ink : COL.pink; ctx.lineWidth = 5 - k; ctx.globalAlpha = shut ? .35 : done ? .6 : 1; ctx.beginPath(); ctx.ellipse(x, y, rr - k * 6, (rr - k * 6) * 1.25, now * (k % 2 ? -1.5 : 1.2), 0, TAU * .85); ctx.stroke(); }
      ctx.globalAlpha = 1; ctx.fillStyle = COL.deep; ctx.beginPath(); ctx.ellipse(x, y, 10, 13, 0, 0, TAU); ctx.fill();
      if (Math.hypot(P.x - x, P.y - y) < TL * 3.5) label(x, y - 46, gt.name + (done ? ' · 닫음' : ''), done ? COL.teal : COL.pink);
      break;
    }
  }
}
function flamePathC(x, y, s) { ctx.beginPath(); ctx.moveTo(x, y - s * 1.4); ctx.bezierCurveTo(x + s * .6, y - s * .6, x + s, y + s * .2, x, y + s * .9); ctx.bezierCurveTo(x - s, y + s * .2, x - s * .6, y - s * .6, x, y - s * 1.4); ctx.fill(); }

/* ---------- drawn with the actors: the sword in hand, waves, coins ---------- */
function drawStoryOver() {
  if (!WD) return;
  drawTallFront();
  drawChase(performance.now() / 1000);
  const S = SAVE.story, now = performance.now();
  wt();
  for (const s of G.spk) {
    const b = Math.abs(Math.sin(s.t * 6)) * 4;
    if (s.k === 'coin') { ctx.fillStyle = COL.ink; ctx.beginPath(); ctx.arc(s.x + 1, s.y - b + 1, 5.5, 0, TAU); ctx.fill(); ctx.fillStyle = COL.yellow; ctx.beginPath(); ctx.arc(s.x, s.y - b, 5, 0, TAU); ctx.fill(); ctx.fillStyle = COL.white; ctx.fillRect(s.x - 2, s.y - b - 3, 2, 2); }
    else if (s.k === 'heart') { ctx.fillStyle = COL.pink; ctx.beginPath(); ctx.moveTo(s.x, s.y - b + 6); ctx.bezierCurveTo(s.x - 9, s.y - b, s.x - 6, s.y - b - 8, s.x, s.y - b - 3); ctx.bezierCurveTo(s.x + 6, s.y - b - 8, s.x + 9, s.y - b, s.x, s.y - b + 6); ctx.fill(); }
    else { ctx.fillStyle = COL.paper; ctx.strokeStyle = COL.ink; ctx.lineWidth = 2; ctx.fillRect(s.x - 7, s.y - b - 7, 14, 14); ctx.strokeRect(s.x - 7, s.y - b - 7, 14, 14); }
  }
  for (const p of PR) if (p.kind === 'swave' && !p.dead) {
    const sw = SWORDS[S.sword] || SWORDS.ink, al = Math.min(1, p.life * 3);
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.globalAlpha = al;
    ctx.fillStyle = COL.pink; ctx.beginPath(); ctx.moveTo(4, -22); ctx.quadraticCurveTo(18, 0, 4, 22); ctx.quadraticCurveTo(10, 0, 4, -22); ctx.fill();
    ctx.fillStyle = sw.col; ctx.beginPath(); ctx.moveTo(0, -24); ctx.quadraticCurveTo(15, 0, 0, 24); ctx.quadraticCurveTo(6, 0, 0, -24); ctx.fill();
    ctx.restore(); wt();
  }
  if (!S.sword || STATE === 'dying') return;
  const sw = SWORDS[S.sword], g = G.swing, q = g ? (now - g.t0) / g.dur : 9;
  // the swing follows through, then the blade drifts back to rest instead of freezing
  const rest = mouseAim() ? (() => { const [mx, my] = mouseWorld(); return Math.atan2(my - P.y, mx - P.x) + (P.face > 0 ? -.9 : .9); })() : (P.face > 0 ? -.5 : Math.PI + .5);
  const fdt = Math.min(.05, (now - (G.swLast || now)) / 1000); G.swLast = now;
  let a;
  if (q < 1) {
    const e = 1 - Math.pow(1 - q, 3), over = Math.sin(q * Math.PI) * .12 * Math.sign(g.a1 - g.a0);
    a = lerp(g.a0, g.a1, e) + over; G.swVis = a;
  } else {
    let cur = G.swVis === undefined ? rest : G.swVis, d = rest - cur;
    while (d > Math.PI) d -= TAU; while (d < -Math.PI) d += TAU;
    const settle = q < 2.2 ? 5 : 11;
    cur += d * (1 - Math.exp(-fdt * settle)); G.swVis = cur; a = cur;
  }
  const breath = q >= 1 ? Math.sin(now / 420) * .04 : 0; a += breath;
  const L = sw.R * .52, reach = q < 1 ? 10 + Math.sin(q * Math.PI) * 6 : 9, bx = P.x + Math.cos(a) * reach, by = P.y + 2 + Math.sin(a) * reach;
  drawSwordSpr(S.sword, bx, by, a, L * 1.25, S.plus[S.sword] || 0);
}

/* ---------- drawn on top: caves are dark, doorways fade ---------- */

function drawStoryTop() {
  drawPcPrompt();
  if (!WD) return;
  drawArenaFxTop(performance.now() / 1000);
  drawChaseTop();
  if (WD.A.dark) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const sx = (P.x * K + OX), sy = (P.y * K * TY + OY), r0 = 120 * K, r1 = 360 * K;
    const g = ctx.createRadialGradient(sx, sy, r0, sx, sy, r1);
    g.addColorStop(0, 'rgba(8,10,28,0)'); g.addColorStop(1, 'rgba(8,10,28,.86)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, cv.width, cv.height);
  }
  const tr = G.trans, fa = tr ? (tr.t < .22 ? tr.t / .22 : 1) : (G.fade || 0);
  if (fa > 0) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = Math.min(1, fa); ctx.fillStyle = '#0B0E22'; ctx.fillRect(0, 0, cv.width, cv.height); ctx.globalAlpha = 1; }
  drawCutOverlay();
}
function storyCam(dt) {
  const k = 1 - Math.exp(-dt * 8), mw = WD.w * TL, mh = WD.h * TL;
  let tx = P.x + P.vx * .12, ty = P.y + P.vy * .12;
  if (G.boss && !G.boss.dead) { tx = lerp(tx, G.boss.x, .25); ty = lerp(ty, G.boss.y, .25); }
  if (WD.chase) tx += 150;
  tx = mw > VHW * 2 ? clamp(tx, VHW, mw - VHW) : mw / 2;
  ty = mh > VHH * 2 ? clamp(ty, VHH, mh - VHH) : mh / 2;
  G.camX = lerp(G.camX, tx, k); G.camY = lerp(G.camY, ty, k);
}

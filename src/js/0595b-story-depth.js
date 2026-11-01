/* ================= story: a tilted camera and tall things =================
   The floor is squashed by TY so the camera looks down at an angle. Walls, trees,
   houses and rocks stand up out of it and are drawn row by row with the people,
   so you can walk behind a tree and come out the other side. */
const TALL_CH = new Set(['#', 't', 'h', 'o', 'c', 'b', 'f']);
const WALL_H = 30;
const REG_LOOK = {
  1: { top: '#B7C59A', front: '#7E8C6A', line: '#4F5C45', leaf: ['#3F6B4A', '#5E8F5A', '#8CBB72'], trunk: '#6B4A33', rock: '#9AA0AE', roof: ['#C25A5A', '#9C4040'], wall: '#E6D7B8' },
  2: { top: '#6F9C93', front: '#3F6560', line: '#24403E', leaf: ['#1F3F45', '#2E5E60', '#4F8A7E'], trunk: '#3E2F2A', rock: '#7D8E92', roof: ['#5A6FA8', '#3F4F80'], wall: '#D6D2C2' },
  3: { top: '#E9D9AE', front: '#C4A775', line: '#8A6E45', leaf: ['#4E8A5E', '#6FAE6A', '#A9D47E'], trunk: '#8A6440', rock: '#E2D2A8', roof: ['#D08A4A', '#A8662E'], wall: '#F2E6C8' },
  4: { top: '#DDEBF0', front: '#9EB8C4', line: '#5D7884', leaf: ['#2E5A5E', '#3F7C78', '#E9F4F6'], trunk: '#5A4636', rock: '#B9C8D0', roof: ['#3F7C9C', '#2C5A74'], wall: '#E8EEF0' },
  5: { top: '#F4F1EA', front: '#C9C4B8', line: '#25356F', leaf: ['#141B40', '#25356F', '#F4F1EA'], trunk: '#141B40', rock: '#E6E1D6', roof: ['#141B40', '#25356F'], wall: '#F4F1EA' }
};
function wu() { ctx.setTransform(K, 0, 0, K, OX, OY); }

/* ---------- sprites, printed once ---------- */
const TALL_SPR = {};
function tallCanvas(w, h, res, fn) {
  const c = document.createElement('canvas'); c.width = Math.ceil(w * res); c.height = Math.ceil(h * res);
  const x = c.getContext('2d'); x.scale(res, res); fn(x); c.lw = w; c.lh = h; return c;
}
function treeSpr(reg, v) {
  const key = 'tree' + reg + '_' + v; if (TALL_SPR[key]) return TALL_SPR[key];
  const L = REG_LOOK[reg], R = mulberry(reg * 31 + v * 7 + 3), [ink] = [REG_INK[reg][1]];
  const c = tallCanvas(84, 118, 2, x => {
    const cx = 42, base = 112;
    x.lineJoin = 'round';
    if (reg === 3) {
      // a palm
      x.strokeStyle = L.trunk; x.lineWidth = 7; x.lineCap = 'round';
      x.beginPath(); x.moveTo(cx, base - 4); x.quadraticCurveTo(cx + 10, base - 40, cx + 4, base - 72); x.stroke();
      x.strokeStyle = 'rgba(0,0,0,.2)'; x.lineWidth = 2; for (let k = 0; k < 6; k++) { const yy = base - 10 - k * 10; x.beginPath(); x.moveTo(cx - 3 + k, yy); x.lineTo(cx + 5 + k, yy - 2); x.stroke(); }
      for (let k = 0; k < 7; k++) {
        const a = -Math.PI / 2 + (k - 3) * .52, len = 30 + R() * 8;
        x.fillStyle = k % 2 ? L.leaf[1] : L.leaf[0];
        x.beginPath(); x.moveTo(cx + 4, base - 72);
        x.quadraticCurveTo(cx + 4 + Math.cos(a - .3) * len * .7, base - 72 + Math.sin(a - .3) * len * .7 - 8, cx + 4 + Math.cos(a) * len, base - 72 + Math.sin(a) * len + 10);
        x.quadraticCurveTo(cx + 4 + Math.cos(a + .3) * len * .6, base - 72 + Math.sin(a + .3) * len * .6, cx + 4, base - 72); x.fill();
        x.strokeStyle = ink; x.lineWidth = 1.2; x.stroke();
      }
      x.fillStyle = L.trunk; x.beginPath(); x.arc(cx + 4, base - 72, 4, 0, TAU); x.fill();
      return;
    }
    if (reg === 4) {
      // a pine with snow
      x.fillStyle = L.trunk; x.fillRect(cx - 4, base - 20, 8, 20);
      for (let k = 0; k < 4; k++) {
        const w = 34 - k * 7, y0 = base - 18 - k * 22;
        x.fillStyle = L.leaf[k % 2]; x.beginPath(); x.moveTo(cx - w, y0); x.lineTo(cx, y0 - 34); x.lineTo(cx + w, y0); x.closePath(); x.fill();
        x.strokeStyle = ink; x.lineWidth = 1.5; x.stroke();
        x.fillStyle = L.leaf[2]; x.beginPath(); x.moveTo(cx - w * .55, y0 - 15); x.lineTo(cx, y0 - 34); x.lineTo(cx + w * .4, y0 - 18); x.quadraticCurveTo(cx, y0 - 20, cx - w * .55, y0 - 15); x.fill();
      }
      return;
    }
    // a round tree: trunk, three shades of leaves, a rim of ink
    x.fillStyle = L.trunk; x.beginPath(); x.moveTo(cx - 5, base); x.lineTo(cx - 3, base - 40); x.lineTo(cx + 3, base - 40); x.lineTo(cx + 6, base); x.closePath(); x.fill();
    x.strokeStyle = ink; x.lineWidth = 1.5; x.stroke();
    x.strokeStyle = L.trunk; x.lineWidth = 3; x.beginPath(); x.moveTo(cx, base - 34); x.lineTo(cx - 10, base - 48); x.moveTo(cx + 1, base - 38); x.lineTo(cx + 9, base - 52); x.stroke();
    const blobs = [];
    for (let k = 0; k < 9; k++) { const a = k / 9 * TAU + R() * .4, d = 12 + R() * 8; blobs.push([cx + Math.cos(a) * d * 1.15, base - 66 + Math.sin(a) * d * .85, 13 + R() * 6]); }
    blobs.push([cx, base - 68, 18]);
    x.fillStyle = ink; for (const [bx, by, r] of blobs) { x.beginPath(); x.arc(bx, by, r + 2, 0, TAU); x.fill(); }
    x.fillStyle = L.leaf[0]; for (const [bx, by, r] of blobs) { x.beginPath(); x.arc(bx, by, r, 0, TAU); x.fill(); }
    x.fillStyle = L.leaf[1]; for (const [bx, by, r] of blobs) { x.beginPath(); x.arc(bx - r * .22, by - r * .25, r * .78, 0, TAU); x.fill(); }
    x.fillStyle = L.leaf[2]; for (const [bx, by, r] of blobs) if (by < base - 64) { x.beginPath(); x.arc(bx - r * .4, by - r * .45, r * .42, 0, TAU); x.fill(); }
    if (reg === 5) { x.strokeStyle = COL.pink; x.lineWidth = 1.2; for (let k = 0; k < 5; k++) { x.beginPath(); x.arc(cx + (R() - .5) * 30, base - 66 + (R() - .5) * 26, 4 + R() * 5, 0, TAU * .7); x.stroke(); } }
    if (reg === 1 && v % 2 === 0) { x.fillStyle = COL.pink; for (let k = 0; k < 5; k++) { x.beginPath(); x.arc(cx + (R() - .5) * 40, base - 64 + (R() - .5) * 28, 2.2, 0, TAU); x.fill(); } }
  });
  return (TALL_SPR[key] = c);
}
function rockSpr(reg, v) {
  const key = 'rock' + reg + '_' + v; if (TALL_SPR[key]) return TALL_SPR[key];
  const L = REG_LOOK[reg], R = mulberry(reg * 17 + v * 5), ink = REG_INK[reg][1];
  return (TALL_SPR[key] = tallCanvas(56, 54, 2, x => {
    const cx = 28, base = 48, pts = [];
    for (let k = 0; k < 9; k++) { const a = Math.PI + k / 8 * Math.PI, r = 18 + R() * 6; pts.push([cx + Math.cos(a) * r, base - 8 + Math.sin(a) * r * 1.3]); }
    x.beginPath(); x.moveTo(cx - 22, base); pts.forEach(p => x.lineTo(p[0], p[1])); x.lineTo(cx + 22, base); x.closePath();
    x.fillStyle = L.rock; x.fill(); x.strokeStyle = ink; x.lineWidth = 2; x.stroke();
    x.save(); x.clip();
    x.fillStyle = 'rgba(20,27,64,.25)'; x.fillRect(cx + 2, 0, 40, 60);
    x.fillStyle = 'rgba(255,255,255,.35)'; x.beginPath(); x.ellipse(cx - 8, base - 26, 8, 5, -.4, 0, TAU); x.fill();
    x.restore();
    x.strokeStyle = ink; x.lineWidth = 1.2; x.beginPath(); x.moveTo(cx - 4, base - 30); x.lineTo(cx + 2, base - 18); x.lineTo(cx - 2, base - 8); x.stroke();
  }));
}
function cactusSpr(v) {
  const key = 'cac' + v; if (TALL_SPR[key]) return TALL_SPR[key];
  return (TALL_SPR[key] = tallCanvas(50, 70, 2, x => {
    const cx = 25, base = 66;
    x.fillStyle = '#4E8A5E'; x.strokeStyle = COL.ink; x.lineWidth = 2;
    x.beginPath(); x.roundRect(cx - 7, base - 54, 14, 54, 7); x.fill(); x.stroke();
    x.beginPath(); x.roundRect(cx - 19, base - 40, 9, 20, 4.5); x.roundRect(cx - 14, base - 26, 8, 6, 3); x.fill(); x.stroke();
    x.beginPath(); x.roundRect(cx + 10, base - 46, 9, 22, 4.5); x.fill(); x.stroke();
    x.strokeStyle = 'rgba(255,255,255,.45)'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(cx - 3, base - 48); x.lineTo(cx - 3, base - 6); x.stroke();
    if (v % 2) { x.fillStyle = COL.pink; x.beginPath(); x.arc(cx, base - 55, 3.5, 0, TAU); x.fill(); }
  }));
}
function houseSpr(reg, w, d) {
  const key = 'house' + reg + '_' + w + 'x' + d; if (TALL_SPR[key]) return TALL_SPR[key];
  const L = REG_LOOK[reg], ink = REG_INK[reg][1], HH = 50, fw = w * TL, fd = d * TL * TY;
  const sw = fw + 16, sh = fd + HH + 34;
  return (TALL_SPR[key] = tallCanvas(sw, sh, 2, x => {
    const X = 8, base = sh - 2, wallTop = base - HH;
    x.lineJoin = 'round';
    // shadow at the foot
    x.fillStyle = 'rgba(20,27,64,.22)'; x.fillRect(X + 4, base - 3, fw, 5);
    // front wall
    x.fillStyle = L.wall; x.fillRect(X, wallTop, fw, HH);
    x.strokeStyle = 'rgba(20,27,64,.12)'; x.lineWidth = 1;
    for (let yy = wallTop + 9; yy < base; yy += 9) { x.beginPath(); x.moveTo(X, yy); x.lineTo(X + fw, yy); x.stroke(); }
    x.fillStyle = 'rgba(20,27,64,.18)'; x.fillRect(X, wallTop, fw, 6);
    // door and windows
    const dx = X + fw / 2 - 10;
    x.fillStyle = '#6B4A33'; x.beginPath(); x.roundRect(dx, base - 32, 20, 32, [9, 9, 0, 0]); x.fill(); x.strokeStyle = ink; x.lineWidth = 2; x.stroke();
    x.fillStyle = COL.yellow; x.beginPath(); x.arc(dx + 15, base - 15, 1.8, 0, TAU); x.fill();
    x.fillStyle = 'rgba(20,27,64,.25)'; x.fillRect(dx - 4, base - 2, 28, 2);
    for (let k = 0; k < Math.max(1, w - 2); k++) for (const side of [-1, 1]) {
      const wx = X + fw / 2 + side * (24 + k * 34) - 8; if (wx < X + 4 || wx + 16 > X + fw - 4) continue;
      x.fillStyle = '#FFE08A'; x.fillRect(wx, wallTop + 14, 16, 14);
      x.fillStyle = 'rgba(255,255,255,.6)'; x.fillRect(wx + 2, wallTop + 16, 5, 4);
      x.strokeStyle = ink; x.lineWidth = 2; x.strokeRect(wx, wallTop + 14, 16, 14);
      x.lineWidth = 1.2; x.beginPath(); x.moveTo(wx + 8, wallTop + 14); x.lineTo(wx + 8, wallTop + 28); x.moveTo(wx, wallTop + 21); x.lineTo(wx + 16, wallTop + 21); x.stroke();
      x.fillStyle = '#6B4A33'; x.fillRect(wx - 2, wallTop + 29, 20, 3);
    }
    x.strokeStyle = ink; x.lineWidth = 2.2; x.strokeRect(X, wallTop, fw, HH);
    // roof: seen from above at an angle, ridge across the middle
    const rt = wallTop - fd + 2, ov = 7, ridge = rt + fd * .42;
    x.fillStyle = L.roof[1]; x.beginPath(); x.moveTo(X - ov, wallTop + 4); x.lineTo(X + fw + ov, wallTop + 4); x.lineTo(X + fw + ov - 4, ridge); x.lineTo(X - ov + 4, ridge); x.closePath(); x.fill();
    x.fillStyle = L.roof[0]; x.beginPath(); x.moveTo(X - ov + 4, ridge); x.lineTo(X + fw + ov - 4, ridge); x.lineTo(X + fw + ov - 8, rt); x.lineTo(X - ov + 8, rt); x.closePath(); x.fill();
    x.strokeStyle = 'rgba(20,27,64,.25)'; x.lineWidth = 1.2;
    for (let yy = ridge + 7; yy < wallTop + 2; yy += 7) { x.beginPath(); x.moveTo(X - ov + 2, yy); x.lineTo(X + fw + ov - 2, yy); x.stroke(); }
    for (let yy = rt + 6; yy < ridge - 1; yy += 6) { x.beginPath(); x.moveTo(X - ov + 7, yy); x.lineTo(X + fw + ov - 7, yy); x.stroke(); }
    x.strokeStyle = 'rgba(255,255,255,.35)'; x.lineWidth = 2; x.beginPath(); x.moveTo(X - ov + 6, ridge - 2); x.lineTo(X + fw + ov - 6, ridge - 2); x.stroke();
    x.strokeStyle = ink; x.lineWidth = 2.2;
    x.beginPath(); x.moveTo(X - ov, wallTop + 4); x.lineTo(X + fw + ov, wallTop + 4); x.lineTo(X + fw + ov - 8, rt); x.lineTo(X - ov + 8, rt); x.closePath(); x.stroke();
    x.beginPath(); x.moveTo(X - ov + 4, ridge); x.lineTo(X + fw + ov - 4, ridge); x.stroke();
    // chimney
    const chx = X + fw * .72;
    x.fillStyle = '#9C8C7A'; x.fillRect(chx, rt - 14, 12, 22); x.strokeRect(chx, rt - 14, 12, 22);
    x.fillStyle = ink; x.fillRect(chx - 2, rt - 17, 16, 4);
  }));
}

/* ---------- the list of tall things in an area ---------- */
function buildTall() {
  if (WD.tall) return WD.tall;
  const rows = Array.from({ length: WD.h }, () => []), R = mulberry((WD.A.seed || 7) * 3 + 1), reg = WD.reg;
  const at = (tx, ty) => tx < 0 || ty < 0 || tx >= WD.w || ty >= WD.h ? '' : WD.grid[ty][tx];
  const seen = new Set();
  const put = (ty, o) => rows[ty].push(o);
  for (let ty = 0; ty < WD.h; ty++) for (let tx = 0; tx < WD.w; tx++) {
    const ch = WD.grid[ty][tx], X = tx * TL, cx = X + TL / 2;
    if (!TALL_CH.has(ch)) continue;
    if (ch === '#') put(ty, { k: 'wall', tx, ty, by: (ty + 1) * TL, sx: X, sy: ty * TL * TY - WALL_H, w: TL, h: TL * TY + WALL_H, n: R() });
    else if (ch === 't') { const img = treeSpr(reg, Math.floor(R() * 4)), s = .9 + R() * .25, ox = (R() - .5) * 10; put(ty, { k: 'img', img, by: (ty + 1) * TL, sx: cx + ox - img.lw * s / 2, sy: (ty + .82) * TL * TY - img.lh * s + 6, w: img.lw * s, h: img.lh * s }); }
    else if (ch === 'o') { const img = rockSpr(reg, Math.floor(R() * 3)); put(ty, { k: 'img', img, by: (ty + 1) * TL, sx: cx - img.lw / 2, sy: (ty + .9) * TL * TY - img.lh + 4, w: img.lw, h: img.lh }); }
    else if (ch === 'c') { const img = cactusSpr(Math.floor(R() * 2)); put(ty, { k: 'img', img, by: (ty + 1) * TL, sx: cx - img.lw / 2, sy: (ty + .85) * TL * TY - img.lh + 4, w: img.lw, h: img.lh }); }
    else if (ch === 'b' || ch === 'f') put(ty, { k: ch === 'b' ? 'crate' : 'fence', tx, ty, by: (ty + 1) * TL, sx: X, sy: ty * TL * TY - 26, w: TL, h: TL * TY + 26 });
    else if (ch === 'h' && !seen.has(tx + ',' + ty)) {
      // one house per block of 'h'
      let w = 0; while (at(tx + w, ty) === 'h' && !seen.has((tx + w) + ',' + ty)) w++;
      let d = 0; while (d < 12 && [...Array(w).keys()].every(i => at(tx + i, ty + d) === 'h')) d++;
      for (let j = 0; j < d; j++) for (let i = 0; i < w; i++) seen.add((tx + i) + ',' + (ty + j));
      const img = houseSpr(reg, w, d), by = (ty + d) * TL;
      put(ty + d - 1, { k: 'img', img, by, sx: X - 8, sy: by * TY - img.lh + 2, w: img.lw, h: img.lh });
    }
  }
  return (WD.tall = rows);
}
function drawTallOne(o) {
  if (o.k === 'img') { ctx.drawImage(o.img, o.sx, o.sy, o.w, o.h); return; }
  const L = REG_LOOK[WD.reg], ink = REG_INK[WD.reg][1], X = o.sx, top = o.sy, depth = TL * TY, b = top + o.h;
  const at = (tx, ty) => tx < 0 || ty < 0 || tx >= WD.w || ty >= WD.h ? '#' : WD.grid[ty][tx];
  if (o.k === 'wall') {
    const below = at(o.tx, o.ty + 1) === '#', above = at(o.tx, o.ty - 1) === '#', lt = at(o.tx - 1, o.ty) === '#', rt = at(o.tx + 1, o.ty) === '#';
    ctx.fillStyle = L.top; ctx.fillRect(X - .3, top - .3, TL + .6, depth + .6);
    if (WD.reg <= 2) { ctx.fillStyle = 'rgba(20,27,64,.12)'; ctx.fillRect(X + 6 + o.n * 20, top + 8, 10, 4); ctx.fillRect(X + 26 - o.n * 14, top + 22, 8, 3); }
    else if (WD.reg === 5) { ctx.strokeStyle = 'rgba(37,53,111,.25)'; ctx.lineWidth = 1; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(X + 6, top + 8 + k * 9); ctx.lineTo(X + 16 + o.n * 22, top + 8 + k * 9); ctx.stroke(); } }
    if (!below) {
      ctx.fillStyle = L.front; ctx.fillRect(X - .3, b - WALL_H, TL + .6, WALL_H);
      ctx.strokeStyle = 'rgba(20,27,64,.22)'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(X, b - WALL_H / 2); ctx.lineTo(X + TL, b - WALL_H / 2);
      const off = (o.tx % 2) * 16; for (let k = 0; k < 3; k++) { const vx = X + 8 + off + k * 24; if (vx < X + TL) { ctx.moveTo(vx, b - WALL_H); ctx.lineTo(vx, b - WALL_H / 2); } const vx2 = X + 20 - off / 2 + k * 24; if (vx2 < X + TL) { ctx.moveTo(vx2, b - WALL_H / 2); ctx.lineTo(vx2, b); } }
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(X, b - WALL_H, TL, 2);
      ctx.fillStyle = ink; ctx.fillRect(X - .3, b - 2, TL + .6, 2);
    }
    ctx.fillStyle = ink;
    if (!above) ctx.fillRect(X - .3, top, TL + .6, 2);
    if (!lt) ctx.fillRect(X, top, 2, o.h - (below ? 0 : 0));
    if (!rt) ctx.fillRect(X + TL - 2, top, 2, o.h);
    return;
  }
  if (o.k === 'crate') {
    const y0 = b - depth * .75 - 22;
    ctx.fillStyle = '#D4A86A'; ctx.fillRect(X + 5, y0, TL - 10, depth * .7);
    ctx.fillStyle = '#B9894F'; ctx.fillRect(X + 5, y0 + depth * .7, TL - 10, 22);
    ctx.strokeStyle = ink; ctx.lineWidth = 2; ctx.strokeRect(X + 5, y0, TL - 10, depth * .7 + 22);
    ctx.beginPath(); ctx.moveTo(X + 5, y0 + depth * .7); ctx.lineTo(X + TL - 5, y0 + depth * .7); ctx.moveTo(X + 5, y0 + depth * .7); ctx.lineTo(X + TL - 5, y0 + depth * .7 + 22); ctx.stroke();
    return;
  }
  if (o.k === 'fence') {
    const yb = b - depth * .45, lt = at(o.tx - 1, o.ty) === 'f', rt = at(o.tx + 1, o.ty) === 'f';
    ctx.fillStyle = '#9C7A55'; ctx.strokeStyle = ink; ctx.lineWidth = 1.6;
    ctx.fillRect(lt ? X : X + 6, yb - 18, (rt ? TL : TL - 6) - (lt ? 0 : 6), 4); ctx.fillRect(lt ? X : X + 6, yb - 9, (rt ? TL : TL - 6) - (lt ? 0 : 6), 4);
    for (const px of [X + 6, X + TL - 10]) { ctx.fillStyle = '#B48E62'; ctx.fillRect(px, yb - 24, 6, 24); ctx.strokeRect(px, yb - 24, 6, 24); }
  }
}

/* ---------- per frame ---------- */
function drawTallAndEnts(now) {
  const rows = buildTall();
  const r0 = Math.max(0, Math.floor((CY - VHH) / TL) - 1), r1 = Math.min(WD.h - 1, Math.ceil((CY + VHH) / TL) + 4);
  const byRow = new Map();
  for (const e of WD.ents) { if (!entOn(e)) continue; const r = clamp(Math.floor(e.y / TL), 0, WD.h - 1); if (!byRow.has(r)) byRow.set(r, []); byRow.get(r).push(e); }
  for (const [r, list] of byRow) if (r < r0 || r > r1) for (const e of list) drawEnt(e, now);
  for (let r = r0; r <= r1; r++) {
    wu();
    for (const o of rows[r]) if (o.sx + o.w > CX - VHW - 20 && o.sx < CX + VHW + 20) drawTallOne(o);
    const list = byRow.get(r); if (list) for (const e of list.sort((a, b) => a.y - b.y)) drawEnt(e, now);
  }
}
// after the people are drawn: anything standing in front of them goes back on top.
// In front of you it turns see-through, so you never lose yourself behind a house.
function drawTallFront() {
  if (!WD || !WD.tall) return;
  const rows = WD.tall;
  const cover = (x0, x1, y0, y1, wy, alpha) => {
    const ra = clamp(Math.floor(wy / TL), 0, WD.h - 1), rb = Math.min(WD.h - 1, ra + 6);
    for (let r = ra; r <= rb; r++) for (const o of rows[r]) {
      if (o.by <= wy + 2 || o.sx > x1 || o.sx + o.w < x0 || o.sy > y1 || o.sy + o.h < y0) continue;
      ctx.globalAlpha = alpha; drawTallOne(o);
    }
  };
  wu();
  for (const e of E) { if (e.dead || !onScreen(e.x, e.y, 60)) continue; const r = e.r || 12; cover(e.x - r, e.x + r, e.y * TY - r * 2, e.y * TY + r * .4, e.y, 1); }
  cover(P.x - 16, P.x + 16, P.y * TY - 40, P.y * TY + 12, P.y, .42);
  ctx.globalAlpha = 1;
}
// water that moves, with foam where it meets the shore
function drawWaterFx(now) {
  const r0 = Math.max(0, Math.floor((CY - VHH) / TL)), r1 = Math.min(WD.h - 1, Math.ceil((CY + VHH) / TL));
  const c0 = Math.max(0, Math.floor((CX - VHW) / TL)), c1 = Math.min(WD.w - 1, Math.ceil((CX + VHW) / TL));
  const at = (tx, ty) => tx < 0 || ty < 0 || tx >= WD.w || ty >= WD.h ? '~' : WD.grid[ty][tx];
  wt(); ctx.lineCap = 'round';
  for (let ty = r0; ty <= r1; ty++) for (let tx = c0; tx <= c1; tx++) {
    if (WD.grid[ty][tx] !== '~') continue;
    const X = tx * TL, Y = ty * TL, ph = (tx * 1.7 + ty * 2.3);
    ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 1.6;
    for (let k = 0; k < 2; k++) {
      const s = (now * .35 + ph * .13 + k * .5) % 1, yy = Y + 10 + k * 20 + Math.sin(now * 1.3 + ph + k) * 3, xx = X + s * TL;
      ctx.globalAlpha = Math.sin(s * Math.PI) * .7;
      ctx.beginPath(); ctx.moveTo(xx - 8, yy); ctx.quadraticCurveTo(xx, yy - 3, xx + 8, yy); ctx.stroke();
    }
    const tw = (Math.sin(now * 3 + ph * 2.1) + 1) / 2;
    if (tw > .92) { ctx.globalAlpha = (tw - .92) * 10; ctx.fillStyle = COL.white; ctx.fillRect(X + 12 + (ph * 7 % 24), Y + 14 + (ph * 5 % 20), 3, 3); }
    // foam along each shore
    ctx.strokeStyle = COL.white; ctx.lineWidth = 3; ctx.setLineDash([7, 5]); ctx.lineDashOffset = -now * 12;
    ctx.globalAlpha = .55 + Math.sin(now * 2 + ph) * .2;
    ctx.beginPath();
    if (at(tx, ty - 1) !== '~') { ctx.moveTo(X, Y + 9); ctx.lineTo(X + TL, Y + 9); }
    if (at(tx, ty + 1) !== '~') { ctx.moveTo(X, Y + TL - 4); ctx.lineTo(X + TL, Y + TL - 4); }
    if (at(tx - 1, ty) !== '~') { ctx.moveTo(X + 4, Y); ctx.lineTo(X + 4, Y + TL); }
    if (at(tx + 1, ty) !== '~') { ctx.moveTo(X + TL - 4, Y); ctx.lineTo(X + TL - 4, Y + TL); }
    ctx.stroke(); ctx.setLineDash([]);
  }
  ctx.globalAlpha = 1;
}

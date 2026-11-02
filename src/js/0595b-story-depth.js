/* ================= story: a tilted camera and tall things =================
   The floor is squashed by TY so the camera looks down at an angle. Walls, trees,
   houses and rocks stand up out of it and are drawn row by row with the people,
   so you can walk behind a tree and come out the other side. */
const TALL_CH = new Set(['#', 't', 'h', 'o', 'c', 'b', 'f']);
const WALL_H = 24;
const REG_LOOK = {
  1: { top: '#B9BCC4', front: '#7C808C', line: '#3E4250', leaf: ['#3F6B4A', '#5E8F5A', '#8CBB72'], trunk: '#6B4A33', rock: '#9AA0AE', roof: ['#C25A5A', '#9C4040'], wall: '#E6D7B8' },
  2: { top: '#8C9A9C', front: '#56656A', line: '#2A3438', leaf: ['#1F3F45', '#2E5E60', '#4F8A7E'], trunk: '#3E2F2A', rock: '#7D8E92', roof: ['#5A6FA8', '#3F4F80'], wall: '#D6D2C2' },
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
  const c = tallCanvas(84, 118, 3, x => {
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
    // a round tree: a flared trunk with bark, then clumps of leaves in three depths, lit from the upper left
    const leafDark = L.leaf[0], leafMid = L.leaf[1], leafLite = L.leaf[2];
    x.fillStyle = L.trunk; x.beginPath();
    x.moveTo(cx - 11, base); x.quadraticCurveTo(cx - 5, base - 4, cx - 5, base - 14); x.lineTo(cx - 3.5, base - 46); x.lineTo(cx + 3.5, base - 46); x.lineTo(cx + 5, base - 14); x.quadraticCurveTo(cx + 5, base - 4, cx + 12, base); x.closePath(); x.fill();
    x.strokeStyle = ink; x.lineWidth = 1.6; x.stroke();
    x.save(); x.clip(); x.fillStyle = 'rgba(0,0,0,.28)'; x.fillRect(cx + 1, base - 50, 14, 52); x.restore();
    x.strokeStyle = 'rgba(0,0,0,.35)'; x.lineWidth = 1; x.beginPath();
    for (let k = 0; k < 5; k++) { const yy = base - 8 - k * 7 - R() * 3; x.moveTo(cx - 3 + R() * 2, yy); x.quadraticCurveTo(cx, yy - 3, cx + 2 + R() * 2, yy - 1); }
    x.stroke();
    x.strokeStyle = L.trunk; x.lineCap = 'round';
    for (const [dx, dy, lw] of [[-13, -58, 4], [12, -62, 3.5], [-3, -66, 3]]) { x.lineWidth = lw; x.beginPath(); x.moveTo(cx, base - 40); x.quadraticCurveTo(cx + dx * .4, base - 50, cx + dx, base + dy); x.stroke(); }
    // clumps
    const clumps = [];
    for (let k = 0; k < 7; k++) { const a = k / 7 * TAU + R() * .5, d = 15 + R() * 7; clumps.push([cx + Math.cos(a) * d * 1.2, base - 70 + Math.sin(a) * d * .8, 12 + R() * 5]); }
    clumps.push([cx - 4, base - 76, 16], [cx + 6, base - 66, 15]);
    const scallop = (bx, by, r, n, jit) => { x.beginPath(); for (let i = 0; i <= n; i++) { const a = i / n * TAU, q = r * (.86 + ((i * 37 + Math.floor(bx)) % 7) / 7 * jit); i ? x.lineTo(bx + Math.cos(a) * q, by + Math.sin(a) * q) : x.moveTo(bx + Math.cos(a) * q, by + Math.sin(a) * q); } x.closePath(); };
    x.fillStyle = ink; for (const [bx, by, r] of clumps) { scallop(bx, by, r + 2.2, 14, .3); x.fill(); }
    x.fillStyle = leafDark; for (const [bx, by, r] of clumps) { scallop(bx, by, r, 14, .3); x.fill(); }
    x.fillStyle = leafMid; for (const [bx, by, r] of clumps) { scallop(bx - r * .18, by - r * .22, r * .8, 12, .25); x.fill(); }
    x.fillStyle = leafLite; for (const [bx, by, r] of clumps) if (by < base - 66 || bx < cx) { scallop(bx - r * .38, by - r * .42, r * .42, 10, .2); x.fill(); }
    // leaf flecks and a few gaps of shadow
    for (let k = 0; k < 46; k++) {
      const a = R() * TAU, d = R() * 26, fx = cx + Math.cos(a) * d * 1.25, fy = base - 70 + Math.sin(a) * d * .85;
      x.fillStyle = fy < base - 74 && fx < cx + 6 ? 'rgba(255,255,255,.35)' : 'rgba(0,0,0,.18)';
      x.beginPath(); x.ellipse(fx, fy, 2.2, 1.2, a, 0, TAU); x.fill();
    }
    x.fillStyle = 'rgba(0,0,0,.22)'; x.beginPath(); x.ellipse(cx + 8, base - 56, 18, 6, 0, 0, TAU); x.fill();
    if (reg === 5) { x.strokeStyle = COL.pink; x.lineWidth = 1.2; for (let k = 0; k < 5; k++) { x.beginPath(); x.arc(cx + (R() - .5) * 30, base - 70 + (R() - .5) * 26, 4 + R() * 5, 0, TAU * .7); x.stroke(); } }
    if (reg === 1 && v % 2 === 0) { for (let k = 0; k < 7; k++) { const fx = cx + (R() - .5) * 44, fy = base - 70 + (R() - .5) * 30; x.fillStyle = COL.pink; x.beginPath(); x.arc(fx, fy, 2.4, 0, TAU); x.fill(); x.fillStyle = 'rgba(255,255,255,.7)'; x.fillRect(fx - 1, fy - 1.4, 1.2, 1.2); } }
  });
  return (TALL_SPR[key] = c);
}
function rockSpr(reg, v) {
  const key = 'rock' + reg + '_' + v; if (TALL_SPR[key]) return TALL_SPR[key];
  const L = REG_LOOK[reg], R = mulberry(reg * 17 + v * 5 + 2), ink = REG_INK[reg][1];
  const small = v >= 5, W2 = small ? 30 : 60, H2 = small ? 24 : [54, 40, 66, 48, 58][v];
  return (TALL_SPR[key] = tallCanvas(W2, H2, 3, x => {
    const cx = W2 / 2, base = H2 - 4, rw = small ? 11 : [22, 25, 18, 24, 20][v], rh = small ? 12 : [30, 20, 46, 24, 38][v];
    // the stone, built from one or two lumps
    const lumps = small ? [[0, 0, 1]] : v === 3 ? [[-8, 2, .7], [8, 0, .8]] : v === 4 ? [[-4, 0, 1], [10, 4, .55]] : [[0, 0, 1]];
    for (const [ox, oy, sc] of lumps) {
      const pts = [];
      for (let k = 0; k < 10; k++) { const a = Math.PI + k / 9 * Math.PI, r = (.8 + R() * .3); pts.push([cx + ox + Math.cos(a) * rw * sc * r, base + oy - 4 + Math.sin(a) * rh * sc * r]); }
      x.beginPath(); x.moveTo(cx + ox - rw * sc, base + oy); pts.forEach(p => x.lineTo(p[0], p[1])); x.lineTo(cx + ox + rw * sc, base + oy); x.closePath();
      x.fillStyle = L.rock; x.fill(); x.strokeStyle = ink; x.lineWidth = 1.8; x.stroke();
      x.save(); x.clip();
      x.fillStyle = 'rgba(20,27,64,.28)'; x.beginPath(); x.moveTo(cx + ox + rw * sc * .1, 0); x.lineTo(cx + ox + rw * sc * 1.2, 0); x.lineTo(cx + ox + rw * sc * 1.2, H2); x.lineTo(cx + ox - rw * sc * .1, H2); x.fill();
      x.fillStyle = 'rgba(255,255,255,.4)'; x.beginPath(); x.ellipse(cx + ox - rw * sc * .4, base + oy - rh * sc * .6, rw * sc * .3, rh * sc * .14, -.4, 0, TAU); x.fill();
      x.fillStyle = 'rgba(20,27,64,.18)'; x.fillRect(cx + ox - rw * sc, base + oy - 5, rw * sc * 2, 5);
      x.restore();
      if (!small) { x.strokeStyle = ink; x.lineWidth = 1; x.globalAlpha = .6; x.beginPath(); x.moveTo(cx + ox - 2, base + oy - rh * sc * .7); x.lineTo(cx + ox + 3, base + oy - rh * sc * .4); x.lineTo(cx + ox, base + oy - rh * sc * .15); x.stroke(); x.globalAlpha = 1; }
    }
    if (reg <= 2 && !small && R() < .7) { x.fillStyle = reg === 2 ? '#3F7C6A' : '#6F9F5A'; for (let k = 0; k < 6; k++) { x.beginPath(); x.arc(cx - rw * .4 + R() * rw * .6, base - rh * .8 + R() * 6, 1.6 + R() * 2, 0, TAU); x.fill(); } }
    if (reg === 4 && !small) { x.fillStyle = 'rgba(255,255,255,.9)'; x.beginPath(); x.ellipse(cx - 2, base - rh * .82, rw * .6, rh * .13, 0, 0, TAU); x.fill(); }
  }));
}
function cactusSpr(v) {
  const key = 'cac' + v; if (TALL_SPR[key]) return TALL_SPR[key];
  return (TALL_SPR[key] = tallCanvas(60, 84, 3, x => {
    const cx = 30, base = 80, ink = COL.ink;
    x.lineJoin = 'round'; x.lineCap = 'round';
    const ribbed = (px, py, w, h, r) => {
      // a ribbed, rounded body lit from the left with a darker right side
      const g = x.createLinearGradient(px, 0, px + w, 0); g.addColorStop(0, '#7FB06A'); g.addColorStop(.45, '#4E8A5E'); g.addColorStop(1, '#2F5E44');
      x.fillStyle = g; x.beginPath(); x.roundRect(px, py, w, h, r); x.fill(); x.strokeStyle = ink; x.lineWidth = 1.8; x.stroke();
      x.strokeStyle = 'rgba(20,40,30,.35)'; x.lineWidth = 1; for (let k = 1; k < 4; k++) { const rx = px + w * k / 4; x.beginPath(); x.moveTo(rx, py + r * .6); x.lineTo(rx, py + h - 2); x.stroke(); }
      x.fillStyle = '#F4F1EA'; for (let yy = py + 5; yy < py + h - 3; yy += 6) for (let k = 0; k <= 4; k++) { x.fillRect(px + w * k / 4 - .5, yy + (k % 2) * 3, 1, 2.4); }
    };
    // a little sand mound at the foot
    x.fillStyle = 'rgba(176,148,92,.6)'; x.beginPath(); x.ellipse(cx, base, 22, 5, 0, 0, TAU); x.fill();
    if (v === 0 || v === 1) {
      // the tall one with arms
      ribbed(cx - 8, base - 62, 16, 62, 8);
      x.fillStyle = '#4E8A5E';
      const arm = (sx, dir, y0, len) => { ribbed(sx, base - y0 - len, 11, len, 5.5); x.fillStyle = '#4E8A5E'; x.beginPath(); x.roundRect(dir < 0 ? sx : cx + 6, base - y0 - 6, dir < 0 ? cx - 6 - sx : sx + 11 - cx - 6, 10, 5); x.fill(); x.strokeStyle = ink; x.lineWidth = 1.8; x.stroke(); };
      arm(cx - 24, -1, 26, 22); if (v === 1) arm(cx + 13, 1, 34, 18);
      if (v === 0) { x.fillStyle = COL.pink; for (const [fx, fy] of [[cx - 3, base - 63], [cx + 3, base - 61]]) { x.beginPath(); x.arc(fx, fy, 3, 0, TAU); x.fill(); } x.fillStyle = COL.yellow; x.beginPath(); x.arc(cx, base - 64, 1.6, 0, TAU); x.fill(); }
    } else if (v === 2) {
      // a round barrel cactus with a crown of flowers
      const g = x.createRadialGradient(cx - 6, base - 22, 3, cx, base - 16, 22); g.addColorStop(0, '#8FC070'); g.addColorStop(1, '#2F5E44');
      x.fillStyle = g; x.beginPath(); x.ellipse(cx, base - 15, 18, 16, 0, 0, TAU); x.fill(); x.strokeStyle = ink; x.lineWidth = 1.8; x.stroke();
      x.strokeStyle = 'rgba(20,40,30,.4)'; x.lineWidth = 1; for (let k = -2; k <= 2; k++) { x.beginPath(); x.ellipse(cx, base - 15, Math.abs(k) * 4 + 2, 16, 0, 0, TAU); x.stroke(); }
      x.fillStyle = '#F4F1EA'; for (let k = 0; k < 16; k++) { const a = k / 16 * TAU; x.fillRect(cx + Math.cos(a) * 16, base - 15 + Math.sin(a) * 14, 1, 2.6); }
      for (let k = 0; k < 4; k++) { x.fillStyle = k % 2 ? COL.yellow : COL.pink; x.beginPath(); x.arc(cx - 6 + k * 4, base - 30 + (k % 2), 3, 0, TAU); x.fill(); }
    } else {
      // pads stacked on pads
      const pad = (px, py, rx, ry, a) => { x.save(); x.translate(px, py); x.rotate(a); const g = x.createLinearGradient(-rx, 0, rx, 0); g.addColorStop(0, '#8FC070'); g.addColorStop(1, '#3F7050'); x.fillStyle = g; x.beginPath(); x.ellipse(0, 0, rx, ry, 0, 0, TAU); x.fill(); x.strokeStyle = ink; x.lineWidth = 1.6; x.stroke(); x.fillStyle = '#F4F1EA'; for (let k = 0; k < 6; k++) x.fillRect(Math.cos(k * 1.1) * rx * .55, Math.sin(k * 1.1) * ry * .55, 1.2, 1.2); x.restore(); };
      pad(cx, base - 14, 11, 14, 0); pad(cx - 12, base - 32, 9, 12, -.4); pad(cx + 11, base - 34, 9, 12, .35); pad(cx - 2, base - 50, 8, 10, .1);
      x.fillStyle = '#C2416E'; for (const [fx, fy] of [[cx - 16, base - 44], [cx + 16, base - 46], [cx + 1, base - 60]]) { x.beginPath(); x.ellipse(fx, fy, 2.6, 3.4, 0, 0, TAU); x.fill(); }
    }
  }));
}
function houseSpr(reg, w, d) {
  const key = 'house' + reg + '_' + w + 'x' + d; if (TALL_SPR[key]) return TALL_SPR[key];
  const L = REG_LOOK[reg], ink = REG_INK[reg][1], HH = 54, fw = w * TL, fd = d * TL * TY;
  const sw = fw + 20, sh = fd + HH + 40, R = mulberry(w * 31 + d * 17 + reg * 7);
  return (TALL_SPR[key] = tallCanvas(sw, sh, 3, x => {
    const X = 10, base = sh - 2, wallTop = base - HH, beam = '#5A3E28';
    x.lineJoin = 'round'; x.lineCap = 'round';
    // stone footing
    x.fillStyle = '#8C8478'; x.fillRect(X - 2, base - 9, fw + 4, 9);
    x.strokeStyle = 'rgba(20,27,64,.35)'; x.lineWidth = 1;
    for (let sx = X; sx < X + fw; sx += 11 + R() * 6) { x.fillStyle = R() < .5 ? '#9C9488' : '#7C7468'; x.fillRect(sx, base - 8, 10, 7); x.strokeRect(sx, base - 8, 10, 7); }
    // plaster wall, a little uneven, with a timber frame
    const g = x.createLinearGradient(0, wallTop, 0, base - 9); g.addColorStop(0, '#D8C8A6'); g.addColorStop(1, L.wall); x.fillStyle = g; x.fillRect(X, wallTop, fw, HH - 9);
    for (let k = 0; k < 30; k++) { x.fillStyle = R() < .5 ? 'rgba(20,27,64,.05)' : 'rgba(255,255,255,.18)'; x.beginPath(); x.ellipse(X + R() * fw, wallTop + R() * (HH - 9), 3 + R() * 6, 1.5 + R() * 3, 0, 0, TAU); x.fill(); }
    x.fillStyle = beam;
    x.fillRect(X, wallTop + 2, fw, 4); x.fillRect(X, base - 13, fw, 4);
    const posts = Math.max(2, w + 1);
    for (let k = 0; k < posts; k++) { const px = X + k * (fw - 5) / (posts - 1); x.fillRect(px, wallTop + 2, 5, HH - 13); }
    for (let k = 0; k < posts - 1; k++) { const p0 = X + k * (fw - 5) / (posts - 1) + 5, p1 = X + (k + 1) * (fw - 5) / (posts - 1); x.strokeStyle = beam; x.lineWidth = 3; x.beginPath(); if (k % 2) { x.moveTo(p0, wallTop + 6); x.lineTo(p0 + 10, wallTop + 16); } else { x.moveTo(p1, wallTop + 6); x.lineTo(p1 - 10, wallTop + 16); } x.stroke(); }
    // windows with shutters and a box of flowers
    const dx = X + fw / 2 - 11;
    const winX = []; for (let k = 0; k < Math.max(1, w - 2); k++) for (const side of [-1, 1]) { const wx = X + fw / 2 + side * (26 + k * 36) - 8; if (wx > X + 8 && wx + 16 < X + fw - 8) winX.push(wx); }
    for (const wx of winX) {
      const wy = wallTop + 16;
      x.fillStyle = '#6B8FA8'; x.fillRect(wx - 7, wy - 1, 6, 16); x.fillRect(wx + 17, wy - 1, 6, 16); x.strokeStyle = ink; x.lineWidth = 1.2; x.strokeRect(wx - 7, wy - 1, 6, 16); x.strokeRect(wx + 17, wy - 1, 6, 16);
      x.strokeStyle = 'rgba(255,255,255,.4)'; x.beginPath(); x.moveTo(wx - 5, wy + 3); x.lineTo(wx - 3, wy + 3); x.moveTo(wx - 5, wy + 9); x.lineTo(wx - 3, wy + 9); x.moveTo(wx + 19, wy + 3); x.lineTo(wx + 21, wy + 3); x.moveTo(wx + 19, wy + 9); x.lineTo(wx + 21, wy + 9); x.stroke();
      const wg = x.createLinearGradient(0, wy, 0, wy + 14); wg.addColorStop(0, '#FFE9A8'); wg.addColorStop(1, '#F2B84E'); x.fillStyle = wg; x.fillRect(wx, wy, 16, 14);
      x.fillStyle = 'rgba(255,255,255,.65)'; x.fillRect(wx + 2, wy + 2, 4, 4);
      x.strokeStyle = ink; x.lineWidth = 2; x.strokeRect(wx, wy, 16, 14); x.lineWidth = 1.2; x.beginPath(); x.moveTo(wx + 8, wy); x.lineTo(wx + 8, wy + 14); x.moveTo(wx, wy + 7); x.lineTo(wx + 16, wy + 7); x.stroke();
      x.fillStyle = '#8A6440'; x.fillRect(wx - 3, wy + 15, 22, 4); x.strokeRect(wx - 3, wy + 15, 22, 4);
      for (let k = 0; k < 5; k++) { x.fillStyle = '#4F7F4A'; x.beginPath(); x.arc(wx - 1 + k * 4.5, wy + 14, 2.4, 0, TAU); x.fill(); x.fillStyle = [COL.pink, COL.yellow, '#FF8FB8', COL.white][k % 4]; x.beginPath(); x.arc(wx - 1 + k * 4.5 + 1, wy + 12.5, 1.5, 0, TAU); x.fill(); }
    }
    // door: arched planks, iron straps, a step and a lantern
    x.fillStyle = '#7C7468'; x.fillRect(dx - 6, base - 4, 34, 4); x.strokeStyle = ink; x.lineWidth = 1.2; x.strokeRect(dx - 6, base - 4, 34, 4);
    x.fillStyle = beam; x.beginPath(); x.roundRect(dx - 3, base - 39, 28, 36, [12, 12, 0, 0]); x.fill();
    const dg = x.createLinearGradient(dx, 0, dx + 22, 0); dg.addColorStop(0, '#9C6A3E'); dg.addColorStop(1, '#6B4A33'); x.fillStyle = dg; x.beginPath(); x.roundRect(dx, base - 36, 22, 32, [10, 10, 0, 0]); x.fill();
    x.strokeStyle = 'rgba(40,24,12,.5)'; x.lineWidth = 1; for (let k = 1; k < 4; k++) { x.beginPath(); x.moveTo(dx + k * 5.5, base - 34 + (k === 2 ? -1 : 1)); x.lineTo(dx + k * 5.5, base - 4); x.stroke(); }
    x.fillStyle = '#3E4250'; x.fillRect(dx, base - 27, 15, 2.4); x.fillRect(dx, base - 13, 15, 2.4);
    x.fillStyle = COL.yellow; x.beginPath(); x.arc(dx + 17, base - 19, 1.8, 0, TAU); x.fill();
    x.strokeStyle = ink; x.lineWidth = 2; x.beginPath(); x.roundRect(dx, base - 36, 22, 32, [10, 10, 0, 0]); x.stroke();
    const lx = dx + 30; x.strokeStyle = '#3E4250'; x.lineWidth = 1.6; x.beginPath(); x.moveTo(lx - 4, base - 34); x.lineTo(lx, base - 34); x.lineTo(lx, base - 31); x.stroke();
    x.fillStyle = '#FFD23F'; x.fillRect(lx - 3, base - 31, 6, 8); x.strokeStyle = ink; x.lineWidth = 1.2; x.strokeRect(lx - 3, base - 31, 6, 8); x.fillStyle = '#3E4250'; x.fillRect(lx - 4, base - 32, 8, 2);
    x.strokeStyle = ink; x.lineWidth = 2.2; x.strokeRect(X, wallTop, fw, HH);
    // the roof: overhanging eaves, rows of tiles laid in a staggered pattern
    const rt = wallTop - fd + 2, ov = 9, ridge = rt + fd * .42;
    const front = () => { x.beginPath(); x.moveTo(X - ov, wallTop + 6); x.lineTo(X + fw + ov, wallTop + 6); x.lineTo(X + fw + ov - 4, ridge); x.lineTo(X - ov + 4, ridge); x.closePath(); };
    const back = () => { x.beginPath(); x.moveTo(X - ov + 4, ridge); x.lineTo(X + fw + ov - 4, ridge); x.lineTo(X + fw + ov - 9, rt); x.lineTo(X - ov + 9, rt); x.closePath(); };
    x.fillStyle = 'rgba(20,27,64,.3)'; x.fillRect(X, wallTop, fw, 8);
    for (const [shape, col, y0, y1] of [[back, L.roof[0], rt, ridge], [front, L.roof[1], ridge, wallTop + 6]]) {
      shape(); x.fillStyle = col; x.fill();
      x.save(); shape(); x.clip();
      const rowH = 6.5;
      for (let ry = y0, row = 0; ry < y1 + rowH; ry += rowH, row++) {
        for (let tx = X - ov - (row % 2) * 5; tx < X + fw + ov; tx += 10) {
          const tone = (R() - .5) * .16; x.fillStyle = tone > 0 ? 'rgba(255,255,255,' + tone.toFixed(3) + ')' : 'rgba(20,27,64,' + (-tone).toFixed(3) + ')';
          x.beginPath(); x.roundRect(tx + .5, ry, 9, rowH - .5, [0, 0, 4, 4]); x.fill();
          x.strokeStyle = 'rgba(20,27,64,.25)'; x.lineWidth = .8; x.beginPath(); x.moveTo(tx + .5, ry + rowH - 1); x.quadraticCurveTo(tx + 5, ry + rowH + 1.5, tx + 9.5, ry + rowH - 1); x.stroke();
        }
      }
      if (R() < .8) for (let k = 0; k < 4; k++) { x.fillStyle = 'rgba(110,160,90,.45)'; x.beginPath(); x.ellipse(X + R() * fw, y0 + R() * (y1 - y0), 5 + R() * 6, 2 + R() * 2, 0, 0, TAU); x.fill(); }
      x.restore();
    }
    x.fillStyle = 'rgba(255,255,255,.3)'; x.fillRect(X - ov + 6, ridge - 2.5, fw + ov * 2 - 12, 2);
    x.strokeStyle = ink; x.lineWidth = 2.2;
    x.beginPath(); x.moveTo(X - ov, wallTop + 6); x.lineTo(X + fw + ov, wallTop + 6); x.lineTo(X + fw + ov - 9, rt); x.lineTo(X - ov + 9, rt); x.closePath(); x.stroke();
    x.lineWidth = 3; x.beginPath(); x.moveTo(X - ov + 4, ridge); x.lineTo(X + fw + ov - 4, ridge); x.stroke();
    // eave board under the roof edge
    x.fillStyle = beam; x.fillRect(X - ov, wallTop + 6, fw + ov * 2, 3); x.strokeStyle = ink; x.lineWidth = 1.2; x.strokeRect(X - ov, wallTop + 6, fw + ov * 2, 3);
    // a stone chimney
    const chx = X + fw * .72;
    for (let k = 0; k < 4; k++) { x.fillStyle = k % 2 ? '#8C8478' : '#9C9488'; x.fillRect(chx, rt - 16 + k * 6, 13, 6); }
    x.strokeStyle = ink; x.lineWidth = 1.8; x.strokeRect(chx, rt - 16, 13, 24);
    x.fillStyle = '#5A5248'; x.fillRect(chx - 2, rt - 19, 17, 4); x.strokeRect(chx - 2, rt - 19, 17, 4);
  }));
}

/* ---------- rock: printed tiles for the top of the high ground and the cliff face ---------- */
function cliffTop(reg, v) {
  const depth = TL * TY, key = 'ctop' + reg + '_' + v + '_' + Math.round(TY * 100); if (TALL_SPR[key]) return TALL_SPR[key];
  const L = REG_LOOK[reg], R = mulberry(reg * 101 + v * 13 + 1);
  return (TALL_SPR[key] = tallCanvas(TL, depth, 3, x => {
    x.fillStyle = L.top; x.fillRect(0, 0, TL, depth);
    // slabs of stone
    const cols = 2 + Math.floor(R() * 2), rows = 2;
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const x0 = i * TL / cols + (R() - .5) * 4, y0 = j * depth / rows + (R() - .5) * 3, w = TL / cols + (R() - .5) * 6, h = depth / rows + (R() - .5) * 4;
      const sh = (R() - .5) * .12;
      x.fillStyle = sh > 0 ? 'rgba(255,255,255,' + sh.toFixed(3) + ')' : 'rgba(20,27,64,' + (-sh).toFixed(3) + ')';
      x.beginPath(); x.moveTo(x0 + 2, y0 + R() * 2); x.lineTo(x0 + w - 1, y0 + R() * 2); x.lineTo(x0 + w - R() * 2, y0 + h - 1); x.lineTo(x0 + R() * 2, y0 + h - 1); x.closePath(); x.fill();
      x.strokeStyle = 'rgba(20,27,64,.09)'; x.lineWidth = .8; x.stroke();
      x.strokeStyle = 'rgba(255,255,255,.12)'; x.beginPath(); x.moveTo(x0 + 3, y0 + 1.5); x.lineTo(x0 + w * .6, y0 + 2.5); x.stroke();
    }
    // grain: specks and a hairline crack
    for (let k = 0; k < 26; k++) { x.fillStyle = R() < .5 ? 'rgba(20,27,64,.16)' : 'rgba(255,255,255,.22)'; x.fillRect(R() * TL, R() * depth, 1 + R(), 1 + R()); }
    x.strokeStyle = 'rgba(20,27,64,.3)'; x.lineWidth = .9; x.beginPath(); let px = R() * TL, py = R() * depth; x.moveTo(px, py); for (let k = 0; k < 3; k++) { px += (R() - .5) * 14; py += R() * 8; x.lineTo(px, py); } x.stroke();
    if (reg <= 2 && R() < .55) { // moss
      const mx = R() * TL, my = R() * depth;
      for (let k = 0; k < 9; k++) { x.fillStyle = k % 2 ? (reg === 2 ? '#3F7C6A' : '#6F9F5A') : (reg === 2 ? '#2E5E50' : '#4F7F4A'); x.globalAlpha = .7; x.beginPath(); x.arc(mx + (R() - .5) * 12, my + (R() - .5) * 7, 1.6 + R() * 2.2, 0, TAU); x.fill(); }
      x.globalAlpha = 1;
    }
    if (reg === 3) { x.strokeStyle = 'rgba(138,110,69,.35)'; x.lineWidth = 1; for (let k = 0; k < 2; k++) { const yy = 6 + R() * (depth - 10); x.beginPath(); x.moveTo(0, yy); x.quadraticCurveTo(TL / 2, yy - 4, TL, yy); x.stroke(); } }
    if (reg === 4 && R() < .7) { x.fillStyle = 'rgba(255,255,255,.85)'; x.beginPath(); x.ellipse(R() * TL, R() * depth, 8 + R() * 8, 3 + R() * 3, 0, 0, TAU); x.fill(); }
    if (reg === 5) { x.strokeStyle = 'rgba(37,53,111,.22)'; x.lineWidth = .8; for (let k = 0; k < 4; k++) { x.beginPath(); x.moveTo(4, 5 + k * 8); x.lineTo(10 + R() * 30, 5 + k * 8); x.stroke(); } }
  }));
}
function cliffFace(reg, v) {
  const key = 'cface' + reg + '_' + v; if (TALL_SPR[key]) return TALL_SPR[key];
  const L = REG_LOOK[reg], R = mulberry(reg * 211 + v * 17 + 3), H = WALL_H;
  return (TALL_SPR[key] = tallCanvas(TL, H, 3, x => {
    const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, L.front); g.addColorStop(1, L.line);
    x.fillStyle = g; x.fillRect(0, 0, TL, H);
    // stacked chunks of rock, each with a lit top facet and a shaded side
    let yy = 0;
    while (yy < H) {
      const rh = 7 + R() * 7; let xx = -R() * 10;
      while (xx < TL) {
        const rw = 10 + R() * 14, top = yy + R() * 1.5;
        x.fillStyle = 'rgba(255,255,255,' + (.06 + R() * .1).toFixed(3) + ')';
        x.beginPath(); x.moveTo(xx + 1, top + 2); x.lineTo(xx + rw * .3, top); x.lineTo(xx + rw - 1, top + 1); x.lineTo(xx + rw - 2, top + rh * .45); x.lineTo(xx + 2, top + rh * .4); x.closePath(); x.fill();
        x.fillStyle = 'rgba(20,27,64,' + (.1 + R() * .12).toFixed(3) + ')';
        x.beginPath(); x.moveTo(xx + rw * .6, top + rh * .45); x.lineTo(xx + rw - 1, top + 1); x.lineTo(xx + rw - 1, top + rh); x.lineTo(xx + rw * .55, top + rh); x.closePath(); x.fill();
        x.strokeStyle = 'rgba(20,27,64,.18)'; x.lineWidth = .9; x.beginPath(); x.moveTo(xx + rw, top + R() * 3); x.lineTo(xx + rw - 1 - R() * 3, top + rh); x.stroke();
        xx += rw;
      }
      yy += rh;
    }
    if (reg <= 2) { for (let k = 0; k < 3; k++) { const vx = R() * TL; x.strokeStyle = reg === 2 ? '#3F7C6A' : '#6F9F5A'; x.lineWidth = 1.4; x.beginPath(); x.moveTo(vx, 0); x.quadraticCurveTo(vx + 2, H * .3, vx - 1, H * (.3 + R() * .4)); x.stroke(); } }
    if (reg === 4) { x.fillStyle = 'rgba(255,255,255,.8)'; for (let k = 0; k < 4; k++) { const ix = R() * TL; x.beginPath(); x.moveTo(ix - 2, 0); x.lineTo(ix + 2, 0); x.lineTo(ix, 4 + R() * 6); x.fill(); } }
    const sh = x.createLinearGradient(0, H * .6, 0, H); sh.addColorStop(0, 'rgba(20,27,64,0)'); sh.addColorStop(1, 'rgba(20,27,64,.35)'); x.fillStyle = sh; x.fillRect(0, 0, TL, H);
  }));
}

/* ---------- the list of tall things in an area ---------- */
function buildTall() {
  if (WD.tall) return WD.tall;
  const rows = Array.from({ length: WD.h }, () => []), R = mulberry((WD.A.seed || 7) * 3 + 1), reg = WD.reg;
  const at = (tx, ty) => tx < 0 || ty < 0 || tx >= WD.w || ty >= WD.h ? '' : WD.grid[ty][tx];
  const seen = new Set();
  const put = (ty, o) => rows[ty].push(o);
  const late = Array.from({ length: WD.h }, () => []);
  // how high each bit of rock stands: 1 at the edge, up to 4 deep inside; some deep spots drop into a gorge
  const lv = new Int8Array(WD.w * WD.h), dist = new Int16Array(WD.w * WD.h).fill(-1), q = [];
  for (let y = 0; y < WD.h; y++) for (let x = 0; x < WD.w; x++) if (WD.grid[y][x] !== '#') { dist[y * WD.w + x] = 0; q.push(x, y); }
  for (let i = 0; i < q.length; i += 2) { const x = q[i], y = q[i + 1]; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= WD.w || ny >= WD.h || dist[ny * WD.w + nx] >= 0) continue; dist[ny * WD.w + nx] = dist[y * WD.w + x] + 1; q.push(nx, ny); } }
  const sd = (WD.A.seed || 7) * 5;
  for (let y = 0; y < WD.h; y++) for (let x = 0; x < WD.w; x++) {
    if (WD.grid[y][x] !== '#') continue;
    const d = dist[y * WD.w + x] < 0 ? 6 : dist[y * WD.w + x], n = vnoise(x, y, 4, sd + 77);
    let L = 1 + Math.floor(Math.min(d - 1, 4) * (.35 + n * .9)); L = clamp(L, 1, 4);
    if (d >= 3 && reg !== 5 && vnoise(x, y, 5, sd + 91) < .3) L = -1;
    lv[y * WD.w + x] = L;
  }
  WD.lv = lv;
  for (let ty = 0; ty < WD.h; ty++) for (let tx = 0; tx < WD.w; tx++) {
    const ch = WD.grid[ty][tx], X = tx * TL, cx = X + TL / 2;
    if (!TALL_CH.has(ch)) continue;
    if (ch === '#') {
      const L = lv[ty * WD.w + tx], up = Math.max(0, L);
      put(ty, { k: 'wall', tx, ty, L, by: (ty + 1) * TL, sx: X, sy: ty * TL * TY - WALL_H * up, w: TL, h: TL * TY + WALL_H * up, n: R() });
      // things growing up on the heights
      if (L >= 2 && R() < .13) {
        const kind = reg === 3 ? (R() < .5 ? 'rock' : 'cac') : reg === 5 ? 'rock' : 'tree';
        const img = kind === 'tree' ? treeSpr(reg, Math.floor(R() * 4)) : kind === 'cac' ? cactusSpr(Math.floor(R() * 4)) : rockSpr(reg, Math.floor(R() * 5));
        const sc = kind === 'tree' ? .7 + R() * .25 : .7 + R() * .5, baseY = ty * TL * TY - WALL_H * L + TL * TY * .8;
        late[ty].push({ k: 'img', img, by: (ty + 1) * TL, sx: cx - img.lw * sc / 2 + (R() - .5) * 10, sy: baseY - img.lh * sc + 4, w: img.lw * sc, h: img.lh * sc });
      }
    }
    else if (ch === 't') { const img = treeSpr(reg, Math.floor(R() * 4)), s = .9 + R() * .25, ox = (R() - .5) * 10; put(ty, { k: 'img', img, by: (ty + 1) * TL, sx: cx + ox - img.lw * s / 2, sy: (ty + .82) * TL * TY - img.lh * s + 6, w: img.lw * s, h: img.lh * s }); }
    else if (ch === 'o' && WD.A.arena) { const v = Math.floor(R() * 3), img = columnSpr(reg, v); put(ty, { k: 'img', img, col: v !== 2, by: (ty + 1) * TL, sx: cx - img.lw / 2, sy: (ty + .85) * TL * TY - img.lh + 4, w: img.lw, h: img.lh }); }
    else if (ch === 'o') { const img = rockSpr(reg, Math.floor(R() * 5)), sc = .7 + R() * .6, ox = (R() - .5) * 12; put(ty, { k: 'img', img, by: (ty + 1) * TL, sx: cx + ox - img.lw * sc / 2, sy: (ty + .92) * TL * TY - img.lh * sc + 4, w: img.lw * sc, h: img.lh * sc }); if (R() < .5) { const p2 = rockSpr(reg, 5 + Math.floor(R() * 2)), s2 = .5 + R() * .3; put(ty, { k: 'img', img: p2, by: (ty + 1) * TL, sx: cx + ox + (R() < .5 ? -1 : 1) * 18 - p2.lw * s2 / 2, sy: (ty + .95) * TL * TY - p2.lh * s2 + 4, w: p2.lw * s2, h: p2.lh * s2 }); } }
    else if (ch === 'c') { const img = cactusSpr(Math.floor(R() * 4)), sc = .75 + R() * .45, ox = (R() - .5) * 12; put(ty, { k: 'img', img, by: (ty + 1) * TL, sx: cx + ox - img.lw * sc / 2, sy: (ty + .88) * TL * TY - img.lh * sc + 4, w: img.lw * sc, h: img.lh * sc }); }
    else if (ch === 'b' || ch === 'f') put(ty, { k: ch === 'b' ? 'crate' : 'fence', tx, ty, by: (ty + 1) * TL, sx: X, sy: ty * TL * TY - 26, w: TL, h: TL * TY + 26 });
    else if (ch === 'h' && !seen.has(tx + ',' + ty)) {
      // one house per block of 'h'
      let w = 0; while (at(tx + w, ty) === 'h' && !seen.has((tx + w) + ',' + ty)) w++;
      let d = 0; while (d < 12 && [...Array(w).keys()].every(i => at(tx + i, ty + d) === 'h')) d++;
      for (let j = 0; j < d; j++) for (let i = 0; i < w; i++) seen.add((tx + i) + ',' + (ty + j));
      const img = houseSpr(reg, w, d), by = (ty + d) * TL;
      put(ty + d - 1, { k: 'img', img, by, sx: X - 10, sy: by * TY - img.lh + 2, w: img.lw, h: img.lh, smoke: [X + w * TL * .72 + 6.5, by * TY - img.lh + 2 + 21] });
    }
  }
  for (let y = 0; y < WD.h; y++) rows[y].push(...late[y]);
  return (WD.tall = rows);
}
function drawTallOne(o) {
  if (o.k === 'img') { ctx.drawImage(o.img, o.sx, o.sy, o.w, o.h); return; }
  const L = REG_LOOK[WD.reg], ink = REG_INK[WD.reg][1], X = o.sx, top = o.sy, depth = TL * TY, b = top + o.h;
  const at = (tx, ty) => tx < 0 || ty < 0 || tx >= WD.w || ty >= WD.h ? '#' : WD.grid[ty][tx];
  if (o.k === 'wall') {
    const lvA = (tx, ty) => tx < 0 || ty < 0 || tx >= WD.w || ty >= WD.h ? o.L : WD.grid[ty][tx] === '#' ? WD.lv[ty * WD.w + tx] : 0;
    const vv = ((o.tx * 7 + o.ty * 13) % 4 + 4) % 4;
    if (o.L < 0) {
      // a gorge: dark rock falling away, the far wall lit a little, mist at the bottom
      const upL = lvA(o.tx, o.ty - 1);
      const g = ctx.createLinearGradient(0, top, 0, top + depth); g.addColorStop(0, '#2A2228'); g.addColorStop(1, '#0C090E');
      ctx.fillStyle = g; ctx.fillRect(X - .3, top - .3, TL + .6, depth + .6);
      if (upL >= 0) { ctx.globalAlpha = .55; ctx.drawImage(cliffFace(WD.reg, vv), X - .3, top, TL + .6, depth * .7); ctx.globalAlpha = 1; const g2 = ctx.createLinearGradient(0, top, 0, top + depth * .75); g2.addColorStop(0, 'rgba(12,9,14,0)'); g2.addColorStop(1, 'rgba(12,9,14,.9)'); ctx.fillStyle = g2; ctx.fillRect(X - .3, top, TL + .6, depth * .75); }
      ctx.fillStyle = 'rgba(180,190,220,' + (.06 + Math.sin(performance.now() / 900 + o.tx) * .03).toFixed(3) + ')'; ctx.fillRect(X - .3, top + depth * .6, TL + .6, depth * .4);
      return;
    }
    const Lv = o.L, up = lvA(o.tx, o.ty - 1), dn = Math.max(0, lvA(o.tx, o.ty + 1)), lt = lvA(o.tx - 1, o.ty), rt = lvA(o.tx + 1, o.ty);
    const faceH = dn < Lv ? (Lv - dn) * WALL_H : 0;
    const rr = 14, tl = up < Lv && lt < Lv ? rr : 0, tr = up < Lv && rt < Lv ? rr : 0, bl = faceH && lt < Lv ? rr * .6 : 0, br = faceH && rt < Lv ? rr * .6 : 0;
    ctx.save(); ctx.beginPath(); ctx.roundRect(X - .3, top - .3, TL + .6, depth + .6 + faceH, [tl, tr, br, bl]); ctx.clip();
    ctx.drawImage(cliffTop(WD.reg, vv), X - .3, top - .3, TL + .6, depth + .6);
    // higher ground is lighter; snow on the tops up north
    if (Lv >= 2) { ctx.fillStyle = 'rgba(255,255,255,' + ((Lv - 1) * .07).toFixed(3) + ')'; ctx.fillRect(X - 1, top - 1, TL + 2, depth + 2); }
    if (WD.reg === 4 && Lv >= 3) { ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.fillRect(X - 1, top - 1, TL + 2, depth + 2); }
    const shade = vnoise(o.tx, o.ty, 4, 11) * .1; ctx.fillStyle = 'rgba(20,27,64,' + shade.toFixed(3) + ')'; ctx.fillRect(X - 1, top - 1, TL + 2, depth + 2);
    // a higher step behind throws a shadow onto this one
    if (up > Lv) { const g = ctx.createLinearGradient(0, top, 0, top + 12); g.addColorStop(0, 'rgba(20,27,64,.35)'); g.addColorStop(1, 'rgba(20,27,64,0)'); ctx.fillStyle = g; ctx.fillRect(X - 1, top, TL + 2, 12); }
    if (faceH) {
      const fy = top + depth, img = cliffFace(WD.reg, vv);
      for (let k = 0; k < faceH / WALL_H; k++) ctx.drawImage(img, X - .3, fy + k * WALL_H, TL + .6, WALL_H);
      if (faceH > WALL_H) { const g = ctx.createLinearGradient(0, fy, 0, fy + faceH); g.addColorStop(0, 'rgba(20,27,64,0)'); g.addColorStop(1, 'rgba(20,27,64,.3)'); ctx.fillStyle = g; ctx.fillRect(X - 1, fy, TL + 2, faceH); }
      ctx.fillStyle = 'rgba(255,255,255,.28)'; ctx.fillRect(X - .3, fy, TL + .6, 1.6);
      ctx.fillStyle = 'rgba(20,27,64,.35)'; ctx.fillRect(X - .3, fy + 1.6, TL + .6, 1.2);
    }
    ctx.restore();
    if (faceH && dn === 0) { const fb = top + depth + faceH; ctx.fillStyle = 'rgba(20,27,64,.22)'; ctx.beginPath(); ctx.roundRect(X + (lt >= Lv ? 0 : 6), fb, TL - (lt >= Lv ? 0 : 6) - (rt >= Lv ? 0 : 6), 5 + Lv * 2, 2); ctx.fill(); }
    ctx.strokeStyle = ink; ctx.globalAlpha = .5; ctx.lineWidth = 1.6; ctx.beginPath();
    const fb2 = top + depth + faceH;
    if (up < Lv) { ctx.moveTo(X + tl, top); ctx.lineTo(X + TL - tr, top); }
    if (tl) ctx.arc(X + tl, top + tl, tl, Math.PI, Math.PI * 1.5);
    if (tr) { ctx.moveTo(X + TL - tr, top); ctx.arc(X + TL - tr, top + tr, tr, -Math.PI / 2, 0); }
    if (lt < Lv) { ctx.moveTo(X, top + tl); ctx.lineTo(X, (lt > 0 ? top + depth + (Lv - lt) * WALL_H * 0 : fb2) - bl); }
    if (rt < Lv) { ctx.moveTo(X + TL, top + tr); ctx.lineTo(X + TL, (rt > 0 ? top + depth : fb2) - br); }
    ctx.stroke(); ctx.globalAlpha = 1;
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
    // smoke from the chimneys
    for (const o of rows[r]) if (o.smoke && o.sx + o.w > CX - VHW - 20 && o.sx < CX + VHW + 20) {
      const [sx, sy] = o.smoke;
      for (let k = 0; k < 5; k++) { const q = (now * .25 + k / 5 + sx * .01) % 1; ctx.globalAlpha = .4 * (1 - q) * Math.min(1, q * 5); ctx.fillStyle = '#E6E8EE'; ctx.beginPath(); ctx.arc(sx + Math.sin(q * 5 + k) * 6 + q * 14, sy - q * 46, 4 + q * 9, 0, TAU); ctx.fill(); }
      ctx.globalAlpha = 1;
    }
    const list = byRow.get(r); if (list) for (const e of list.sort((a, b) => a.y - b.y)) drawEnt(e, now);
  }
}
// after the people are drawn: anything standing in front of them goes back on top.
// In front of you it turns see-through, so you never lose yourself behind a house.
function drawTallFront() {
  if (!WD || !WD.tall) return;
  const rows = WD.tall;
  const cover = (x0, x1, y0, y1, wy) => {
    const ra = clamp(Math.floor(wy / TL), 0, WD.h - 1), rb = Math.min(WD.h - 1, ra + 6); let hit = false;
    for (let r = ra; r <= rb; r++) for (const o of rows[r]) {
      if (o.by <= wy + 2 || o.sx > x1 || o.sx + o.w < x0 || o.sy > y1 || o.sy + o.h < y0) continue;
      drawTallOne(o); hit = true;
    }
    return hit;
  };
  wu();
  for (const e of E) { if (e.dead || !onScreen(e.x, e.y, 60)) continue; const r = e.r || 12; cover(e.x - r, e.x + r, e.y * TY - r * 2, e.y * TY + r * .4, e.y); }
  if (cover(P.x - 16, P.x + 16, P.y * TY - 40, P.y * TY + 12, P.y)) {
    const S = SPR['p_' + (G.char || 'lamp')];
    if (S) { ctx.globalAlpha = .38; spr(S.img, P.x, P.y - 2, 40, 40, 0, P.face * 1, 1); ctx.globalAlpha = 1; wu(); }
  }
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
    // foam curling along the shore
    ctx.strokeStyle = COL.white; ctx.lineWidth = 2.6; ctx.setLineDash([6, 6]); ctx.lineDashOffset = -now * 10;
    ctx.globalAlpha = .5 + Math.sin(now * 2 + ph) * .2;
    const cxw = X + TL / 2, cyw = Y + TL / 2, rf = TL * .7 - 4;
    ctx.beginPath();
    if (at(tx, ty - 1) !== '~') ctx.arc(cxw, cyw, rf, Math.PI * 1.15, Math.PI * 1.85);
    if (at(tx, ty + 1) !== '~') { ctx.moveTo(cxw + Math.cos(Math.PI * .15) * rf, cyw + Math.sin(Math.PI * .15) * rf); ctx.arc(cxw, cyw, rf, Math.PI * .15, Math.PI * .85); }
    if (at(tx - 1, ty) !== '~') { ctx.moveTo(cxw + Math.cos(Math.PI * .65) * rf, cyw + Math.sin(Math.PI * .65) * rf); ctx.arc(cxw, cyw, rf, Math.PI * .65, Math.PI * 1.35); }
    if (at(tx + 1, ty) !== '~') { ctx.moveTo(cxw + Math.cos(-Math.PI * .35) * rf, cyw + Math.sin(-Math.PI * .35) * rf); ctx.arc(cxw, cyw, rf, -Math.PI * .35, Math.PI * .35); }
    ctx.stroke(); ctx.setLineDash([]);
  }
  ctx.globalAlpha = 1;
}

/* ---------- boss arenas: a round stone floor, a rune circle, columns, drifting embers ---------- */
const ARENA_LOOK = {
  1: { stone: '#C9C4B4', dark: '#8E8878', rune: '#FF4F9E' }, 2: { stone: '#8FA8A0', dark: '#4F6A64', rune: '#7CF0C8' },
  3: { stone: '#E6D3A4', dark: '#B0945C', rune: '#FFB03F' }, 4: { stone: '#C8DCE4', dark: '#7E9CAA', rune: '#7CC6D8' },
  5: { stone: '#EDE8DC', dark: '#25356F', rune: '#FF4F9E' }
};
function arenaGeom() { return { cx: WD.w * TL / 2, cy: WD.h * TL / 2, rx: WD.w * TL * .4, ry: WD.h * TL * .38 }; }
function arenaPlatform(x, R) {
  const A = ARENA_LOOK[WD.reg], { cx, cy, rx, ry } = arenaGeom();
  x.save();
  // rim shadow, then the slab
  x.fillStyle = 'rgba(20,27,64,.28)'; x.beginPath(); x.ellipse(cx + 4, cy + 8, rx + 10, ry + 10, 0, 0, TAU); x.fill();
  x.fillStyle = A.dark; x.beginPath(); x.ellipse(cx, cy, rx + 8, ry + 8, 0, 0, TAU); x.fill();
  x.fillStyle = A.stone; x.beginPath(); x.ellipse(cx, cy, rx, ry, 0, 0, TAU); x.fill();
  x.beginPath(); x.ellipse(cx, cy, rx, ry, 0, 0, TAU); x.clip();
  // rings of flagstones, each stone a touch lighter or darker
  const rings = 6;
  for (let i = 1; i <= rings; i++) {
    const f = i / rings, f0 = (i - 1) / rings, n = 6 + i * 5, off = R() * TAU;
    for (let k = 0; k < n; k++) {
      const a = off + k / n * TAU, a2 = a + TAU / n, sh = (R() - .5) * .16;
      x.fillStyle = sh > 0 ? 'rgba(255,255,255,' + sh.toFixed(3) + ')' : 'rgba(20,27,64,' + (-sh).toFixed(3) + ')';
      x.beginPath(); x.ellipse(cx, cy, rx * f, ry * f, 0, a, a2); x.ellipse(cx, cy, rx * f0 + .01, ry * f0 + .01, 0, a2, a, true); x.closePath(); x.fill();
    }
    x.strokeStyle = 'rgba(20,27,64,.22)'; x.lineWidth = 1.6; x.beginPath(); x.ellipse(cx, cy, rx * f, ry * f, 0, 0, TAU); x.stroke();
    x.beginPath();
    for (let k = 0; k < n; k++) { const a = off + k / n * TAU; x.moveTo(cx + Math.cos(a) * rx * f0, cy + Math.sin(a) * ry * f0); x.lineTo(cx + Math.cos(a) * rx * f, cy + Math.sin(a) * ry * f); }
    x.stroke();
  }
  // cracks, grit, moss
  x.strokeStyle = 'rgba(20,27,64,.35)'; x.lineWidth = 1.2;
  for (let k = 0; k < 12; k++) { let px = cx + (R() - .5) * rx * 1.8, py = cy + (R() - .5) * ry * 1.8; x.beginPath(); x.moveTo(px, py); for (let j = 0; j < 4; j++) { px += (R() - .5) * 30; py += (R() - .5) * 22; x.lineTo(px, py); } x.stroke(); }
  for (let k = 0; k < 220; k++) { x.fillStyle = R() < .5 ? 'rgba(20,27,64,.12)' : 'rgba(255,255,255,.25)'; x.fillRect(cx + (R() - .5) * rx * 2, cy + (R() - .5) * ry * 2, 1.5, 1.5); }
  if (WD.reg <= 2) for (let k = 0; k < 10; k++) { const a = R() * TAU, f = .75 + R() * .25; x.fillStyle = WD.reg === 2 ? 'rgba(63,124,106,.5)' : 'rgba(111,159,90,.5)'; x.beginPath(); x.ellipse(cx + Math.cos(a) * rx * f, cy + Math.sin(a) * ry * f, 10 + R() * 14, 5 + R() * 6, 0, 0, TAU); x.fill(); }
  // the carved circle in the middle
  x.strokeStyle = A.dark; x.lineWidth = 4; x.beginPath(); x.ellipse(cx, cy, rx * .34, ry * .34, 0, 0, TAU); x.stroke();
  x.lineWidth = 2; x.beginPath(); x.ellipse(cx, cy, rx * .3, ry * .3, 0, 0, TAU); x.stroke();
  x.beginPath(); for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; x.moveTo(cx + Math.cos(a) * rx * .3, cy + Math.sin(a) * ry * .3); x.lineTo(cx + Math.cos(a + TAU * 3 / 8) * rx * .3, cy + Math.sin(a + TAU * 3 / 8) * ry * .3); } x.stroke();
  x.restore();
  // a carved edge
  x.strokeStyle = COL.ink; x.lineWidth = 2.4; x.beginPath(); x.ellipse(cx, cy, rx + 8, ry + 8, 0, 0, TAU); x.stroke();
  x.strokeStyle = 'rgba(255,255,255,.4)'; x.lineWidth = 1.5; x.beginPath(); x.ellipse(cx, cy - 1.5, rx, ry, 0, Math.PI * 1.05, Math.PI * 1.95); x.stroke();
}
function columnSpr(reg, v) {
  const key = 'col' + reg + '_' + v; if (TALL_SPR[key]) return TALL_SPR[key];
  const A = ARENA_LOOK[reg], ink = REG_INK[reg][1], broken = v === 2;
  return (TALL_SPR[key] = tallCanvas(52, 120, 3, x => {
    const cx = 26, base = 114, top = broken ? 46 : 18;
    x.lineJoin = 'round';
    // plinth
    x.fillStyle = A.dark; x.fillRect(cx - 18, base - 12, 36, 12); x.fillStyle = A.stone; x.fillRect(cx - 18, base - 16, 36, 6);
    x.strokeStyle = ink; x.lineWidth = 1.8; x.strokeRect(cx - 18, base - 16, 36, 16);
    // shaft with flutes, lit from the left
    const g = x.createLinearGradient(cx - 12, 0, cx + 12, 0); g.addColorStop(0, '#FFFFFF'); g.addColorStop(.25, A.stone); g.addColorStop(1, A.dark);
    x.fillStyle = g;
    x.beginPath(); x.moveTo(cx - 12, base - 16); x.lineTo(cx - 11, top + 10);
    if (broken) { x.lineTo(cx - 6, top + 2); x.lineTo(cx - 1, top + 8); x.lineTo(cx + 4, top); x.lineTo(cx + 11, top + 6); } else x.lineTo(cx + 11, top + 10);
    x.lineTo(cx + 12, base - 16); x.closePath(); x.fill(); x.stroke();
    x.strokeStyle = 'rgba(20,27,64,.25)'; x.lineWidth = 1.2; for (const fx of [-6, -1, 4, 8]) { x.beginPath(); x.moveTo(cx + fx, base - 18); x.lineTo(cx + fx * .95, top + 12); x.stroke(); }
    if (!broken) {
      x.fillStyle = A.stone; x.strokeStyle = ink; x.lineWidth = 1.8;
      x.fillRect(cx - 16, top, 32, 10); x.strokeRect(cx - 16, top, 32, 10);
      x.fillStyle = A.dark; x.fillRect(cx - 14, top + 10, 28, 4); x.strokeRect(cx - 14, top + 10, 28, 4);
      x.fillStyle = '#5A4A3A'; x.beginPath(); x.ellipse(cx, top - 2, 9, 4, 0, 0, TAU); x.fill(); x.stroke();
    } else { x.fillStyle = A.dark; for (let k = 0; k < 3; k++) { x.beginPath(); x.arc(cx - 14 + k * 12, base - 2, 3 + k, 0, TAU); x.fill(); } }
    // a rune
    x.strokeStyle = A.rune; x.lineWidth = 1.6; x.beginPath(); x.moveTo(cx - 3, base - 46); x.lineTo(cx + 3, base - 40); x.lineTo(cx - 3, base - 34); x.moveTo(cx, base - 48); x.lineTo(cx, base - 32); x.stroke();
  }));
}
// light that moves in the arena: the circle breathes while the boss lives, flames on the columns, embers rising
function drawArenaLife(now) {
  if (!WD || !WD.A.arena) return;
  const A = ARENA_LOOK[WD.reg], { cx, cy, rx, ry } = arenaGeom(), live = !!(G.boss && !G.boss.dead), pulse = .5 + Math.sin(now * 2.2) * .5;
  wt();
  ctx.save();
  ctx.globalAlpha = live ? .35 + pulse * .3 : .12; ctx.strokeStyle = A.rune; ctx.lineWidth = 3; ctx.shadowColor = A.rune; ctx.shadowBlur = live ? 14 : 4;
  ctx.beginPath(); ctx.ellipse(cx, cy, rx * .32, ry * .32, 0, 0, TAU); ctx.stroke();
  ctx.lineWidth = 2; ctx.beginPath(); for (let k = 0; k < 8; k++) { const a = k / 8 * TAU + (live ? now * .15 : 0); ctx.moveTo(cx + Math.cos(a) * rx * .3, cy + Math.sin(a) * ry * .3); ctx.lineTo(cx + Math.cos(a + TAU * 3 / 8) * rx * .3, cy + Math.sin(a + TAU * 3 / 8) * ry * .3); } ctx.stroke();
  ctx.restore();
  // flames in the bowls on whole columns
  wu();
  if (WD.tall) for (const row of WD.tall) for (const o of row) if (o.col) {
    const fx = o.sx + o.w / 2, fy = o.sy + 16, fl = 1 + Math.sin(now * 12 + fx) * .15;
    ctx.globalAlpha = .3; ctx.fillStyle = A.rune; ctx.beginPath(); ctx.arc(fx, fy - 6, 18 * fl, 0, TAU); ctx.fill();
    ctx.globalAlpha = 1; ctx.fillStyle = COL.pink; flamePathC(fx, fy - 6, 7 * fl); ctx.fillStyle = COL.yellow; flamePathC(fx, fy - 5, 4.5 * fl);
  }
  // embers drifting up off the floor
  for (let i = 0; i < 26; i++) {
    const q = (now * .18 + i * .0389) % 1, a = i * 2.39, f = .2 + (i * .37) % .8;
    const x = cx + Math.cos(a) * rx * f + Math.sin(now + i) * 8, y = (cy + Math.sin(a) * ry * f) * TY - q * 90;
    ctx.globalAlpha = Math.sin(q * Math.PI) * (live ? .9 : .4); ctx.fillStyle = i % 3 ? A.rune : COL.yellow;
    ctx.fillRect(x, y, 2.4, 2.4);
  }
  ctx.globalAlpha = 1;
}

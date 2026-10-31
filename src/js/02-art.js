/* ================= art: everything is printed at load time in two or three inks ================= */
const COL = { paper: '#E4E5DF', paper2: '#D3D7CE', ink: '#25356F', deep: '#141B40', pink: '#FF4F9E', yellow: '#FFD23F', teal: '#0A8A86', white: '#FBFBF6' };
const SS = 2;
function mkc(w, h, ss = SS) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.ceil(w * ss)); c.height = Math.max(1, Math.ceil(h * ss));
  const x = c.getContext('2d'); x.scale(ss, ss); x.lineJoin = 'round'; x.lineCap = 'round';
  return [c, x];
}
function grain(x, w, h, n) {
  x.save(); x.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < n; i++) { x.globalAlpha = .2 + Math.random() * .6; const s = .4 + Math.random() * .7; x.fillRect(Math.random() * w, Math.random() * h, s, s); }
  x.restore();
}
/* plates: each plate draws the same shape in one ink; later plates multiply over earlier ones like overprinted riso */
const PLATES2 = [{ col: COL.pink, dx: 1.5, dy: 1.1 }, { col: COL.ink, dx: 0, dy: 0 }];
function print2(w, h, shape, o = {}) {
  const [c, x] = mkc(w, h);
  const plates = o.plates || PLATES2;
  plates.forEach((p, i) => {
    x.save();
    x.globalCompositeOperation = i ? 'multiply' : 'source-over';
    x.translate(p.dx || 0, p.dy || 0);
    x.fillStyle = p.col; x.strokeStyle = p.col;
    shape(x, i, p.col);
    x.restore();
  });
  if (o.after) { x.save(); o.after(x); x.restore(); }
  if (o.grain !== false) grain(x, w, h, w * h * (o.g || .05));
  return c;
}
function silhouette(src, color) {
  const c = document.createElement('canvas'); c.width = src.width; c.height = src.height;
  const x = c.getContext('2d'); x.drawImage(src, 0, 0);
  x.globalCompositeOperation = 'source-in'; x.fillStyle = color; x.fillRect(0, 0, c.width, c.height);
  return c;
}
function blobPath(x, cx, cy, r, seed, n = 9, j = .1, sy = 1) {
  const R = mulberry(seed), pts = [];
  for (let i = 0; i < n; i++) { const a = i / n * TAU, rr = r * (1 + (R() - .5) * 2 * j); pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * sy]); }
  x.beginPath();
  for (let i = 0; i < n; i++) {
    const p = pts[i], q = pts[(i + 1) % n], mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
    if (i === 0) x.moveTo(mx, my); else x.quadraticCurveTo(p[0], p[1], mx, my);
  }
  const p0 = pts[0], p1 = pts[1];
  x.quadraticCurveTo(p0[0], p0[1], (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2);
  x.closePath();
}
function eyes(x, pts, er, pr, look = .3) {
  x.fillStyle = COL.white; x.beginPath();
  for (const [ex, ey] of pts) { x.moveTo(ex + er, ey); x.ellipse(ex, ey, er, er * 1.12, 0, 0, TAU); }
  x.fill();
  x.fillStyle = COL.deep; x.beginPath();
  for (const [ex, ey] of pts) { x.moveTo(ex + pr, ey + er * look); x.arc(ex, ey + er * look, pr, 0, TAU); }
  x.fill();
}
function star(x, cx, cy, n, r1, r2, rot = 0) {
  x.beginPath();
  for (let i = 0; i < n * 2; i++) { const a = rot + i / (n * 2) * TAU - Math.PI / 2, r = i % 2 ? r2 : r1; const px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r; i ? x.lineTo(px, py) : x.moveTo(px, py); }
  x.closePath();
}
function flamePath(x, cx, cy, s) {
  x.beginPath();
  x.moveTo(cx, cy - s * 1.45);
  x.bezierCurveTo(cx + s * .5, cy - s * .8, cx + s * 1.02, cy - s * .2, cx + s * .98, cy + s * .32);
  x.bezierCurveTo(cx + s * .94, cy + s * 1.05, cx - s * .94, cy + s * 1.05, cx - s * .98, cy + s * .32);
  x.bezierCurveTo(cx - s * 1.02, cy - s * .2, cx - s * .5, cy - s * .8, cx, cy - s * 1.45);
  x.closePath();
}
function heartPath(x, cx, cy, s) {
  x.beginPath();
  x.moveTo(cx, cy + s * .9);
  x.bezierCurveTo(cx - s * 1.3, cy + s * .05, cx - s * .9, cy - s * 1.05, cx, cy - s * .38);
  x.bezierCurveTo(cx + s * .9, cy - s * 1.05, cx + s * 1.3, cy + s * .05, cx, cy + s * .9);
  x.closePath();
}

const SPR = {};   // creatures: {img, flash, size}
const SP = {};    // props and projectiles: canvas
const ICON = {};  // dataURLs for the DOM
let TILE = null, VIG = null, VIGP = null;

function regCreature(key, r, shape, face, o = {}) {
  const pad = o.pad || 6, S = r * 2 + pad * 2, c = S / 2;
  const img = print2(S, S, (x, i) => shape(x, c, c, r, i), { after: x => face && face(x, c, c, r), g: .045, plates: o.plates });
  SPR[key] = { img, flash: silhouette(img, COL.white), size: S };
}

function buildCreatures() {
  regCreature('blob', 13, (x, c, cy, r) => { blobPath(x, c, cy + 1, r, 11, 9, .09); x.fill(); },
    (x, c, cy, r) => eyes(x, [[c - r * .34, cy - r * .12], [c + r * .34, cy - r * .12]], r * .21, r * .1));
  regCreature('mini', 9, (x, c, cy, r) => { blobPath(x, c, cy + 1, r, 4, 8, .1); x.fill(); },
    (x, c, cy, r) => eyes(x, [[c, cy - r * .1]], r * .3, r * .14));
  regCreature('moth', 11, (x, c, cy, r) => {
    x.beginPath(); x.ellipse(c - r * .55, cy - r * .1, r * .58, r * .9, -.5, 0, TAU); x.fill();
    x.beginPath(); x.ellipse(c + r * .55, cy - r * .1, r * .58, r * .9, .5, 0, TAU); x.fill();
    x.beginPath(); x.ellipse(c, cy + r * .1, r * .36, r * .62, 0, 0, TAU); x.fill();
  }, (x, c, cy, r) => {
    eyes(x, [[c, cy - r * .05]], r * .26, r * .13);
    x.fillStyle = COL.paper; x.globalAlpha = .55;
    x.beginPath(); x.arc(c - r * .62, cy - r * .3, r * .16, 0, TAU); x.arc(c + r * .62, cy - r * .3, r * .16, 0, TAU); x.fill();
  });
  regCreature('brute', 22, (x, c, cy, r) => {
    x.beginPath(); x.roundRect(c - r * .95, cy - r * .7, r * 1.9, r * 1.62, r * .5); x.fill();
    x.beginPath(); x.moveTo(c - r * .75, cy - r * .55); x.lineTo(c - r * .95, cy - r * 1.02); x.lineTo(c - r * .35, cy - r * .66); x.fill();
    x.beginPath(); x.moveTo(c + r * .75, cy - r * .55); x.lineTo(c + r * .95, cy - r * 1.02); x.lineTo(c + r * .35, cy - r * .66); x.fill();
  }, (x, c, cy, r) => {
    x.fillStyle = COL.white;
    x.beginPath(); x.ellipse(c - r * .36, cy - r * .2, r * .2, r * .1, .25, 0, TAU); x.ellipse(c + r * .36, cy - r * .2, r * .2, r * .1, -.25, 0, TAU); x.fill();
    x.fillStyle = COL.deep; x.beginPath(); x.arc(c - r * .33, cy - r * .18, r * .06, 0, TAU); x.arc(c + r * .33, cy - r * .18, r * .06, 0, TAU); x.fill();
    x.fillStyle = COL.white; x.beginPath();
    for (let i = 0; i < 5; i++) { const tx = c - r * .5 + i * r * .25; x.moveTo(tx, cy + r * .28); x.lineTo(tx + r * .125, cy + r * .48); x.lineTo(tx + r * .25, cy + r * .28); }
    x.fill();
  });
  regCreature('spitter', 14, (x, c, cy, r) => {
    blobPath(x, c, cy - 1, r * .92, 23, 9, .08); x.fill();
    x.beginPath(); x.arc(c, cy + r * .62, r * .36, 0, TAU); x.fill();
  }, (x, c, cy, r) => {
    eyes(x, [[c, cy - r * .2]], r * .34, r * .15, .1);
    x.fillStyle = COL.deep; x.beginPath(); x.arc(c, cy + r * .66, r * .17, 0, TAU); x.fill();
  });
  regCreature('bomber', 12, (x, c, cy, r) => {
    x.beginPath(); x.arc(c, cy + 1.5, r * .9, 0, TAU); x.fill();
    x.lineWidth = 2.2; x.beginPath(); x.moveTo(c + r * .2, cy - r * .7); x.quadraticCurveTo(c + r * .35, cy - r * 1.1, c + r * .72, cy - r * 1.1); x.stroke();
  }, (x, c, cy, r) => {
    eyes(x, [[c - r * .33, cy + r * .02], [c + r * .33, cy + r * .02]], r * .2, r * .11, .2);
    x.strokeStyle = COL.deep; x.lineWidth = 1.6; x.beginPath();
    x.moveTo(c - r * .58, cy - r * .3); x.lineTo(c - r * .16, cy - r * .14); x.moveTo(c + r * .58, cy - r * .3); x.lineTo(c + r * .16, cy - r * .14); x.stroke();
  });
  regCreature('splitter', 18, (x, c, cy, r) => { blobPath(x, c, cy + 1, r, 41, 10, .11, .92); x.fill(); },
    (x, c, cy, r) => {
      x.globalCompositeOperation = 'destination-out'; x.lineWidth = 2.2; x.beginPath();
      x.moveTo(c, cy - r); for (let i = 1; i <= 6; i++) x.lineTo(c + (i % 2 ? 2.5 : -2.5), cy - r + i * r * 2 / 6); x.stroke();
      x.globalCompositeOperation = 'source-over';
      eyes(x, [[c - r * .5, cy - r * .15], [c - r * .22, cy - r * .2], [c + r * .22, cy - r * .2], [c + r * .5, cy - r * .15]], r * .12, r * .06);
    });
  // bosses
  regCreature('colossus', 46, (x, c, cy, r) => {
    blobPath(x, c, cy + 4, r * .92, 7, 12, .06, .95); x.fill();
    for (let i = -1; i <= 1; i++) { x.beginPath(); x.moveTo(c + i * r * .38 - r * .14, cy - r * .7); x.lineTo(c + i * r * .38, cy - r * (i ? .98 : 1.08)); x.lineTo(c + i * r * .38 + r * .14, cy - r * .7); x.fill(); }
  }, (x, c, cy, r) => {
    eyes(x, [[c - r * .3, cy - r * .12], [c + r * .3, cy - r * .12]], r * .15, r * .08, .25);
    x.strokeStyle = COL.white; x.lineWidth = 3.4; x.beginPath();
    x.moveTo(c - r * .32, cy + r * .06); x.quadraticCurveTo(c - r * .36, cy + r * .3, c - r * .3, cy + r * .5);
    x.moveTo(c + r * .32, cy + r * .06); x.quadraticCurveTo(c + r * .36, cy + r * .3, c + r * .3, cy + r * .5); x.stroke();
    x.fillStyle = COL.white; x.beginPath(); x.ellipse(c, cy + r * .42, r * .2, r * .09, 0, Math.PI, 0); x.fill();
  }, { pad: 8 });
  regCreature('rake', 36, (x, c, cy, r, i) => {
    x.beginPath(); x.ellipse(c, cy, r * .5, r * .62, 0, 0, TAU); x.fill();
    for (const s of [-1, 1]) {
      x.beginPath(); x.moveTo(c + s * r * .3, cy - r * .35);
      x.quadraticCurveTo(c + s * r * 1.15, cy - r * .9, c + s * r * 1.02, cy + r * .1);
      x.lineTo(c + s * r * .86, cy - r * .05); x.lineTo(c + s * r * .8, cy + r * .32); x.lineTo(c + s * r * .64, cy + r * .12); x.lineTo(c + s * r * .54, cy + r * .45);
      x.lineTo(c + s * r * .36, cy + r * .2); x.closePath(); x.fill();
    }
    if (i === 0) { x.beginPath(); x.moveTo(c - r * .17, cy + r * .1); x.lineTo(c, cy + r * .58); x.lineTo(c + r * .17, cy + r * .1); x.fill(); }
  }, (x, c, cy, r) => {
    x.fillStyle = COL.white; x.beginPath(); x.ellipse(c - r * .2, cy - r * .2, r * .13, r * .07, .4, 0, TAU); x.ellipse(c + r * .2, cy - r * .2, r * .13, r * .07, -.4, 0, TAU); x.fill();
    x.fillStyle = COL.pink; x.beginPath(); x.moveTo(c - r * .13, cy + r * .05); x.lineTo(c, cy + r * .5); x.lineTo(c + r * .13, cy + r * .05); x.fill();
  }, { pad: 8 });
  regCreature('eye', 42, (x, c, cy, r) => {
    blobPath(x, c, cy, r * .86, 91, 14, .05); x.fill();
    for (let i = 0; i < 7; i++) { const a = Math.PI * .15 + i / 6 * Math.PI * .7; x.beginPath(); x.ellipse(c + Math.cos(a) * r * .86, cy + Math.sin(a) * r * .86, r * .13, r * .2, a - Math.PI / 2, 0, TAU); x.fill(); }
  }, (x, c, cy, r) => {
    x.fillStyle = COL.white; x.beginPath(); x.ellipse(c, cy - r * .04, r * .52, r * .44, 0, 0, TAU); x.fill();
    x.fillStyle = COL.pink; x.beginPath(); x.arc(c, cy, r * .3, 0, TAU); x.fill();
    x.fillStyle = COL.deep; x.beginPath(); x.arc(c, cy, r * .15, 0, TAU); x.fill();
    x.fillStyle = COL.white; x.beginPath(); x.arc(c - r * .08, cy - r * .1, r * .05, 0, TAU); x.fill();
  }, { pad: 10 });
  regCreature('cata', 58, (x, c, cy, r, i) => {
    star(x, c, cy, 11, r * .98, r * .74, i * .05); x.fill();
  }, (x, c, cy, r) => {
    x.strokeStyle = COL.pink; x.lineWidth = 3; x.beginPath();
    const R = mulberry(5);
    for (let k = 0; k < 6; k++) { const a = R() * TAU; let px = c + Math.cos(a) * r * .3, py = cy + Math.sin(a) * r * .3; x.moveTo(px, py); for (let s = 0; s < 3; s++) { px += Math.cos(a + (R() - .5)) * r * .15; py += Math.sin(a + (R() - .5)) * r * .15; x.lineTo(px, py); } }
    x.stroke();
    eyes(x, [[c - r * .3, cy - r * .1], [c + r * .3, cy - r * .1], [c, cy - r * .36]], r * .12, r * .06, .2);
    x.fillStyle = COL.white; x.beginPath(); x.moveTo(c - r * .3, cy + r * .2);
    for (let k = 0; k <= 6; k++) x.lineTo(c - r * .3 + k * r * .1, cy + r * (k % 2 ? .36 : .22));
    x.lineTo(c + r * .3, cy + r * .4); x.lineTo(c - r * .3, cy + r * .4); x.fill();
  }, { pad: 8 });
}

function buildPlayers() {
  const acc = {
    lamp: () => {},
    warden: (x, c) => { x.fillStyle = COL.ink; x.beginPath(); x.ellipse(c, c - 6, 9.5, 6.5, 0, Math.PI, 0); x.fill(); x.fillRect(c - 11, c - 6.6, 22, 3); },
    seer: (x, c) => { x.fillStyle = COL.ink; x.beginPath(); x.moveTo(c, c - 22); x.lineTo(c + 12, c - 2); x.quadraticCurveTo(c, c - 9, c - 12, c - 2); x.closePath(); x.fill(); x.fillStyle = COL.yellow; x.beginPath(); x.arc(c, c - 9, 2.4, 0, TAU); x.fill(); },
    star: (x, c) => { x.fillStyle = COL.teal; star(x, c + 7, c - 14, 5, 7, 3); x.fill(); x.fillStyle = COL.yellow; star(x, c + 7, c - 14, 5, 3.4, 1.5); x.fill(); },
  };
  for (const id in acc) {
    const S = 44, c = 23;
    const img = print2(S, S, (x, i) => { flamePath(x, c, c + 3, i ? 10.6 : 12); x.fill(); },
      { plates: [{ col: COL.yellow, dx: -1.2, dy: .6 }, { col: COL.pink, dx: .6, dy: .2 }],
        after: x => {
          acc[id](x, c);
          x.fillStyle = COL.deep; x.beginPath(); x.ellipse(c - 3.6, c + 4, 1.7, 2.3, 0, 0, TAU); x.ellipse(c + 3.6, c + 4, 1.7, 2.3, 0, 0, TAU); x.fill();
          x.fillStyle = COL.white; x.beginPath(); x.arc(c - 3.1, c + 3.1, .7, 0, TAU); x.arc(c + 4.1, c + 3.1, .7, 0, TAU); x.fill();
        }, g: .03 });
    SPR['p_' + id] = { img, flash: silhouette(img, COL.white), size: S };
  }
}

function buildProps() {
  SP.ember = print2(14, 14, (x, i) => { x.beginPath(); x.arc(7, 7, i ? 3.6 : 5, 0, TAU); x.fill(); }, { plates: [{ col: COL.yellow }, { col: COL.pink, dx: .6, dy: .4 }], grain: false });
  SP.sun = print2(28, 28, (x, i) => { if (i === 0) { star(x, 14, 14, 8, 13, 7); x.fill(); } else { x.beginPath(); x.arc(14, 14, 7, 0, TAU); x.fill(); } }, { plates: [{ col: COL.yellow }, { col: COL.pink, dx: .8, dy: .5 }], g: .03 });
  const blade = (x, s) => { x.beginPath(); x.moveTo(12, 12 - 11 * s); x.quadraticCurveTo(12 + 7 * s, 12, 12, 12 + 11 * s); x.quadraticCurveTo(12 + 2 * s, 12, 12, 12 - 11 * s); x.fill(); };
  SP.blade = print2(24, 24, x => blade(x, 1), { g: .03 });
  SP.blade2 = print2(24, 24, (x, i) => blade(x, i === 0 ? 1.05 : .85), { plates: [{ col: COL.yellow, dx: 1.2, dy: .6 }, { col: COL.pink }, { col: COL.ink, dx: -.6, dy: 0 }], g: .03 });
  const wheel = (x, R) => { for (let k = 0; k < 4; k++) { x.save(); x.translate(13, 13); x.rotate(k * Math.PI / 2); x.beginPath(); x.moveTo(0, -2); x.quadraticCurveTo(R * .55, -R * .75, R, -R * .1); x.lineTo(2, 2); x.closePath(); x.fill(); x.restore(); } };
  SP.boomer = print2(26, 26, x => wheel(x, 12), { plates: [{ col: COL.pink, dx: 1.2, dy: .8 }, { col: COL.ink }], after: x => { x.fillStyle = COL.yellow; x.beginPath(); x.arc(13, 13, 3, 0, TAU); x.fill(); }, g: .03 });
  SP.gale = print2(26, 26, x => wheel(x, 12.5), { plates: [{ col: COL.yellow, dx: 1.2, dy: .8 }, { col: COL.pink }], after: x => { x.fillStyle = COL.ink; x.beginPath(); x.arc(13, 13, 3, 0, TAU); x.fill(); }, g: .03 });
  SP.ebul = print2(14, 14, x => { x.beginPath(); x.arc(7, 7, 6.2, 0, TAU); x.fill(); }, { plates: [{ col: COL.ink }], after: x => { x.fillStyle = COL.white; x.beginPath(); x.arc(7, 7, 3.2, 0, TAU); x.fill(); x.fillStyle = COL.pink; x.beginPath(); x.arc(7, 7, 1.6, 0, TAU); x.fill(); }, grain: false });
  SP.ebig = print2(22, 22, x => { x.beginPath(); x.arc(11, 11, 10, 0, TAU); x.fill(); }, { plates: [{ col: COL.deep }], after: x => { x.fillStyle = COL.white; x.beginPath(); x.arc(11, 11, 5.4, 0, TAU); x.fill(); x.fillStyle = COL.pink; x.beginPath(); x.arc(11, 11, 2.8, 0, TAU); x.fill(); }, grain: false });
  SP.rock = print2(30, 30, (x, i) => { blobPath(x, 15, 15, 11, 3, 7, .25); x.fill(); }, { plates: [{ col: COL.pink, dx: 1.6, dy: 1.2 }, { col: COL.deep }], after: x => { x.strokeStyle = COL.yellow; x.lineWidth = 1.6; x.beginPath(); x.moveTo(9, 12); x.lineTo(14, 16); x.lineTo(13, 21); x.moveTo(14, 16); x.lineTo(20, 14); x.stroke(); } });
  SP.rockInk = print2(30, 30, x => { blobPath(x, 15, 15, 11, 9, 7, .25); x.fill(); }, { plates: [{ col: COL.deep }], after: x => { x.strokeStyle = COL.paper; x.globalAlpha = .7; x.lineWidth = 1.4; x.beginPath(); x.moveTo(9, 12); x.lineTo(14, 16); x.lineTo(20, 13); x.stroke(); } });
  const gemPath = (x, w, h) => { x.beginPath(); x.moveTo(w / 2, 1); x.lineTo(w - 1, h * .42); x.lineTo(w / 2, h - 1); x.lineTo(1, h * .42); x.closePath(); };
  const gem = (w, h) => x => { gemPath(x, w, h); x.fill(); };
  const gemLine = (w, h, lw) => x => { x.strokeStyle = COL.deep; x.lineWidth = lw; gemPath(x, w, h); x.stroke(); x.fillStyle = COL.white; x.globalAlpha = .9; x.beginPath(); x.moveTo(w / 2, 3); x.lineTo(w * .7, h * .38); x.lineTo(w / 2, h * .42); x.closePath(); x.fill(); };
  SP.gem1 = print2(12, 16, gem(12, 16), { plates: [{ col: COL.yellow }], after: gemLine(12, 16, 1), grain: false });
  SP.gem2 = print2(13, 18, gem(13, 18), { plates: [{ col: COL.pink }], after: gemLine(13, 18, 1.1), grain: false });
  SP.gem3 = print2(18, 24, gem(18, 24), { plates: [{ col: COL.yellow }, { col: COL.pink, dx: 2.5, dy: 3.5 }], after: gemLine(18, 24, 1.3), grain: false });
  SP.shard = print2(14, 18, x => { x.beginPath(); x.moveTo(7, 1); x.lineTo(13, 6); x.lineTo(10.5, 17); x.lineTo(3.5, 17); x.lineTo(1, 6); x.closePath(); x.fill(); }, { plates: [{ col: COL.pink }, { col: COL.ink, dx: 2.5, dy: 1 }], grain: false });
  SP.heart = print2(24, 24, x => { heartPath(x, 12, 12.5, 10); x.fill(); }, { plates: [{ col: COL.pink, dx: 1.4, dy: 1 }, { col: COL.pink }], after: x => { x.fillStyle = COL.white; x.beginPath(); x.ellipse(8, 9, 2.2, 1.4, -.6, 0, TAU); x.fill(); } });
  SP.magnet = print2(24, 24, x => { x.lineWidth = 6; x.lineCap = 'butt'; x.beginPath(); x.arc(12, 11, 7, Math.PI, 0, true); x.stroke(); x.beginPath(); x.moveTo(5, 11); x.lineTo(5, 18); x.moveTo(19, 11); x.lineTo(19, 18); x.stroke(); }, { plates: [{ col: COL.ink }], after: x => { x.fillStyle = COL.pink; x.fillRect(2, 16, 6, 4); x.fillRect(16, 16, 6, 4); } });
  SP.bomb = print2(24, 24, x => { x.beginPath(); x.arc(11, 14, 8.5, 0, TAU); x.fill(); x.fillRect(13, 3.5, 5, 5); }, { plates: [{ col: COL.deep }], after: x => { x.fillStyle = COL.yellow; star(x, 19.5, 3.5, 5, 3.6, 1.6); x.fill(); x.fillStyle = COL.white; x.beginPath(); x.arc(8, 11, 2, 0, TAU); x.fill(); } });
  const chest = (x, i) => { x.beginPath(); x.roundRect(3, 9, 26, 17, 2); x.fill(); x.beginPath(); x.roundRect(2, 4, 28, 9, [6, 6, 2, 2]); x.fill(); };
  SP.chest = print2(32, 28, chest, { plates: [{ col: COL.yellow }, { col: COL.yellow, dx: 1, dy: .6 }], after: x => { x.fillStyle = COL.ink; x.fillRect(8, 4, 3.5, 22); x.fillRect(20.5, 4, 3.5, 22); x.fillRect(2, 12, 28, 2.5); x.fillStyle = COL.pink; x.fillRect(13.5, 10, 5, 7); x.fillStyle = COL.deep; x.fillRect(15.3, 12.5, 1.4, 2.6); } });
  SP.chestBoss = print2(32, 28, chest, { plates: [{ col: COL.pink }, { col: COL.yellow, dx: 1.4, dy: 1 }], after: x => { x.fillStyle = COL.ink; x.fillRect(8, 4, 3.5, 22); x.fillRect(20.5, 4, 3.5, 22); x.fillRect(2, 12, 28, 2.5); x.fillStyle = COL.white; x.fillRect(13.5, 10, 5, 7); } });
  // halftone shadow
  { const [c, x] = mkc(40, 14); x.fillStyle = COL.ink; for (let yy = 1; yy < 14; yy += 2.6) for (let xx = 1; xx < 40; xx += 2.6) { const nx = (xx - 20) / 20, ny = (yy - 7) / 7, d = nx * nx + ny * ny; if (d < 1) { x.globalAlpha = .55; x.beginPath(); x.arc(xx, yy, (1 - d) * 1.25 + .2, 0, TAU); x.fill(); } } SP.shadow = c; }
  // lantern glow under the player
  { const [c, x] = mkc(100, 100, 1); x.fillStyle = COL.yellow; for (let yy = 2; yy < 100; yy += 5) for (let xx = 2; xx < 100; xx += 5) { const dx = (xx - 50) / 50, dy = (yy - 50) / 50, d = Math.sqrt(dx * dx + dy * dy); if (d < 1) { x.beginPath(); x.arc(xx + (yy % 10 ? 2.5 : 0), yy, (1 - d) * 2.3, 0, TAU); x.fill(); } } SP.glow = c; }
  { const [c, x] = mkc(60, 60, 1); x.fillStyle = COL.yellow; for (let yy = 2; yy < 60; yy += 4) for (let xx = 2; xx < 60; xx += 4) { const dx = (xx - 30) / 30, dy = (yy - 30) / 30, d = Math.sqrt(dx * dx + dy * dy); if (d < 1) { x.beginPath(); x.arc(xx, yy, (1 - d) * 1.9, 0, TAU); x.fill(); } } SP.aura = c; }
  // ink splats
  SP.splat = []; SP.splatP = [];
  for (let k = 0; k < 7; k++) {
    const make = col => print2(64, 64, () => {}, { plates: [{ col }], grain: false, after: x => {
      const R = mulberry(100 + k); x.fillStyle = col;
      blobPath(x, 32, 32, 13 + R() * 5, 200 + k, 11, .3); x.fill();
      for (let i = 0; i < 9; i++) { const a = R() * TAU, dd = 16 + R() * 14, rr = 1 + R() * 3.2; x.beginPath(); x.arc(32 + Math.cos(a) * dd, 32 + Math.sin(a) * dd, rr, 0, TAU); x.fill(); }
      grain(x, 64, 64, 600);
    } });
    SP.splat.push(make(COL.ink));
    if (k < 3) SP.splatP.push(make(COL.pink));
  }
}

function buildTile() {
  const T = 512, [c, x] = mkc(T, T, 1.25), R = mulberry(77);
  x.fillStyle = COL.paper; x.fillRect(0, 0, T, T);
  for (let i = 0; i < 3200; i++) { x.fillStyle = R() < .55 ? 'rgba(20,27,64,.05)' : 'rgba(255,255,255,.4)'; x.fillRect(R() * T, R() * T, R() * 1.8 + .4, R() * 1.4 + .4); }
  const wrap = (px, py, fn) => { for (const ox of [-T, 0, T]) for (const oy of [-T, 0, T]) { x.save(); x.translate(px + ox, py + oy); fn(); x.restore(); } };
  // impact craters: patches of coarse halftone
  for (let k = 0; k < 3; k++) {
    const cx = R() * T, cy = R() * T, cr = 40 + R() * 50;
    wrap(cx, cy, () => {
      x.fillStyle = 'rgba(37,53,111,.12)';
      for (let yy = -cr; yy < cr; yy += 7) for (let xx = -cr; xx < cr; xx += 7) { const d = Math.sqrt(xx * xx + yy * yy) / cr; if (d < 1) { x.beginPath(); x.arc(xx + (yy % 14 ? 3.5 : 0), yy, (1 - d) * 2.6 + .2, 0, TAU); x.fill(); } }
      x.strokeStyle = 'rgba(37,53,111,.16)'; x.lineWidth = 1.6; x.beginPath(); x.ellipse(0, 0, cr * .98, cr * .9, R(), 0, TAU); x.stroke();
    });
  }
  // fine halftone field
  x.fillStyle = 'rgba(37,53,111,.06)';
  for (let gy = 0; gy < T; gy += 16) for (let gx = 0; gx < T; gx += 16) { x.beginPath(); x.arc(gx + 8, gy + 8, 1.1, 0, TAU); x.fill(); }
  // cracks
  for (let k = 0; k < 7; k++) {
    const sx = R() * T, sy = R() * T;
    wrap(sx, sy, () => {
      x.strokeStyle = 'rgba(37,53,111,.2)'; x.lineWidth = 1.3; x.beginPath(); x.moveTo(0, 0);
      let px = 0, py = 0, a = R() * TAU; const R2 = mulberry(k * 9 + 1);
      for (let s = 0; s < 6; s++) { a += (R2() - .5) * 1.2; px += Math.cos(a) * 14; py += Math.sin(a) * 14; x.lineTo(px, py); }
      x.stroke();
    });
  }
  // grass tufts and pebbles
  for (let k = 0; k < 34; k++) {
    const px = R() * T, py = R() * T, kind = R();
    wrap(px, py, () => {
      if (kind < .55) { x.strokeStyle = 'rgba(37,53,111,.24)'; x.lineWidth = 1.4; x.beginPath(); x.moveTo(-4, 3); x.quadraticCurveTo(-4, -2, -6, -6); x.moveTo(0, 3); x.lineTo(0, -7); x.moveTo(4, 3); x.quadraticCurveTo(4, -2, 6, -5); x.stroke(); }
      else if (kind < .8) { x.strokeStyle = 'rgba(37,53,111,.22)'; x.lineWidth = 1.3; x.beginPath(); x.ellipse(0, 0, 5, 3.5, .3, 0, TAU); x.stroke(); }
      else { x.fillStyle = 'rgba(255,79,158,.16)'; x.beginPath(); x.arc(0, 0, 2.2, 0, TAU); x.arc(5, 3, 1.4, 0, TAU); x.fill(); }
    });
  }
  // broken pillars, the old town
  for (let k = 0; k < 3; k++) {
    const px = R() * T, py = R() * T, rot = (R() - .5) * .6, ww = 14 + R() * 8, hh = 28 + R() * 20;
    wrap(px, py, () => {
      x.rotate(rot); x.fillStyle = 'rgba(37,53,111,.1)'; x.strokeStyle = 'rgba(37,53,111,.28)'; x.lineWidth = 1.5;
      x.beginPath(); x.moveTo(-ww / 2, hh / 2); x.lineTo(-ww / 2, -hh / 2); x.lineTo(-ww / 6, -hh / 2 + 5); x.lineTo(ww / 7, -hh / 2 - 2); x.lineTo(ww / 2, -hh / 2 + 4); x.lineTo(ww / 2, hh / 2); x.closePath(); x.fill(); x.stroke();
      x.beginPath(); x.moveTo(-ww / 2 - 3, hh / 2); x.lineTo(ww / 2 + 3, hh / 2); x.stroke();
    });
  }
  TILE = c;
}
function buildVignette() {
  const [c, x] = mkc(256, 256, 1);
  const g = x.createRadialGradient(128, 128, 60, 128, 128, 182);
  g.addColorStop(0, 'rgba(20,27,64,0)'); g.addColorStop(1, 'rgba(20,27,64,.42)');
  x.fillStyle = g; x.fillRect(0, 0, 256, 256); VIG = c;
  const [c2, x2] = mkc(256, 256, 1);
  const g2 = x2.createRadialGradient(128, 128, 70, 128, 128, 180);
  g2.addColorStop(0, 'rgba(255,79,158,0)'); g2.addColorStop(1, 'rgba(255,79,158,.75)');
  x2.fillStyle = g2; x2.fillRect(0, 0, 256, 256); VIGP = c2;
}

/* icons for weapons, passives and evolutions */
const ICON_SHAPES = {
  ember: x => { x.beginPath(); x.arc(38, 27, 10, 0, TAU); x.fill(); x.lineWidth = 4; x.beginPath(); x.moveTo(29, 36); x.lineTo(14, 51); x.moveTo(33, 40); x.lineTo(24, 54); x.moveTo(25, 32); x.lineTo(12, 40); x.stroke(); },
  orbit: x => { x.lineWidth = 3; x.beginPath(); x.arc(32, 32, 19, 0, TAU); x.stroke(); x.beginPath(); x.arc(32, 32, 6, 0, TAU); x.fill(); for (let k = 0; k < 3; k++) { const a = k / 3 * TAU - .5; x.save(); x.translate(32 + Math.cos(a) * 19, 32 + Math.sin(a) * 19); x.rotate(a); x.beginPath(); x.moveTo(0, -8); x.lineTo(5, 0); x.lineTo(0, 8); x.lineTo(-3, 0); x.closePath(); x.fill(); x.restore(); } },
  bolt: x => { x.beginPath(); x.moveTo(37, 6); x.lineTo(17, 35); x.lineTo(30, 35); x.lineTo(24, 58); x.lineTo(47, 26); x.lineTo(33, 26); x.closePath(); x.fill(); },
  pulse: x => { x.beginPath(); x.arc(32, 32, 6, 0, TAU); x.fill(); x.lineWidth = 4; x.beginPath(); x.arc(32, 32, 15, 0, TAU); x.stroke(); x.lineWidth = 3; x.setLineDash([5, 4]); x.beginPath(); x.arc(32, 32, 24, 0, TAU); x.stroke(); x.setLineDash([]); },
  boomer: x => { for (let k = 0; k < 4; k++) { x.save(); x.translate(32, 32); x.rotate(k * Math.PI / 2 + .3); x.beginPath(); x.moveTo(0, -3); x.quadraticCurveTo(12, -17, 24, -4); x.lineTo(3, 3); x.closePath(); x.fill(); x.restore(); } },
  meteor: x => { x.lineWidth = 5; x.beginPath(); x.moveTo(30, 30); x.lineTo(10, 10); x.moveTo(36, 26); x.lineTo(24, 8); x.moveTo(26, 36); x.lineTo(8, 24); x.stroke(); blobPath(x, 39, 39, 13, 3, 8, .2); x.fill(); },
  whet: x => { x.save(); x.translate(32, 36); x.rotate(-.5); x.beginPath(); x.roundRect(-20, -8, 40, 16, 3); x.fill(); x.restore(); x.lineWidth = 3; x.beginPath(); x.moveTo(44, 10); x.lineTo(48, 4); x.moveTo(50, 16); x.lineTo(57, 13); x.moveTo(38, 8); x.lineTo(37, 2); x.stroke(); },
  lens: x => { x.lineWidth = 5; x.beginPath(); x.arc(27, 27, 14, 0, TAU); x.stroke(); x.lineWidth = 7; x.beginPath(); x.moveTo(38, 38); x.lineTo(52, 52); x.stroke(); },
  glass: x => { x.beginPath(); x.moveTo(18, 10); x.lineTo(46, 10); x.lineTo(32, 32); x.closePath(); x.fill(); x.beginPath(); x.moveTo(32, 32); x.lineTo(46, 54); x.lineTo(18, 54); x.closePath(); x.fill(); x.lineWidth = 4; x.beginPath(); x.moveTo(14, 8); x.lineTo(50, 8); x.moveTo(14, 56); x.lineTo(50, 56); x.stroke(); },
  heart: x => { heartPath(x, 32, 33, 21); x.fill(); },
  wing: x => { x.beginPath(); x.moveTo(12, 46); x.quadraticCurveTo(14, 14, 52, 10); x.quadraticCurveTo(46, 22, 38, 24); x.quadraticCurveTo(46, 28, 40, 34); x.quadraticCurveTo(34, 38, 30, 38); x.quadraticCurveTo(34, 44, 24, 46); x.closePath(); x.fill(); },
  mirror: x => { x.lineWidth = 5; x.beginPath(); x.ellipse(32, 26, 14, 18, 0, 0, TAU); x.stroke(); x.lineWidth = 6; x.beginPath(); x.moveTo(32, 45); x.lineTo(32, 58); x.stroke(); x.lineWidth = 3; x.beginPath(); x.moveTo(26, 22); x.lineTo(34, 14); x.moveTo(27, 30); x.lineTo(38, 19); x.stroke(); },
  magnet: x => { x.lineWidth = 10; x.lineCap = 'butt'; x.beginPath(); x.arc(32, 30, 14, Math.PI, 0, true); x.stroke(); x.beginPath(); x.moveTo(18, 29); x.lineTo(18, 48); x.moveTo(46, 29); x.lineTo(46, 48); x.stroke(); },
  clover: x => { for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4; x.beginPath(); x.arc(32 + Math.cos(a) * 10, 28 + Math.sin(a) * 10, 9, 0, TAU); x.fill(); } x.lineWidth = 4; x.beginPath(); x.moveTo(32, 30); x.quadraticCurveTo(34, 46, 42, 56); x.stroke(); },
};
function buildIcons() {
  for (const id in ICON_SHAPES) {
    ICON[id] = print2(64, 64, ICON_SHAPES[id], { g: .04 }).toDataURL();
    ICON[id + '_evo'] = print2(64, 64, (x, i) => {
      if (i === 0) { star(x, 32, 32, 12, 31, 22); x.fill(); return; }
      ICON_SHAPES[id](x);
    }, { plates: [{ col: COL.yellow }, { col: COL.pink, dx: 1.6, dy: 1.2 }, { col: COL.ink }], g: .04 }).toDataURL();
  }
  ICON.heal = print2(64, 64, x => { heartPath(x, 32, 33, 18); x.fill(); x.fillRect(46, 10, 6, 18); x.fillRect(40, 16, 18, 6); }, { g: .04 }).toDataURL();
  ICON.bag = print2(64, 64, x => { x.beginPath(); x.moveTo(32, 8); x.lineTo(48, 22); x.lineTo(42, 56); x.lineTo(22, 56); x.lineTo(16, 22); x.closePath(); x.fill(); }, { plates: [{ col: COL.pink }, { col: COL.ink, dx: 5, dy: 2 }], g: .04 }).toDataURL();
  ICON.chest = SP.chest.toDataURL();
  ICON.chestBoss = SP.chestBoss.toDataURL();
  for (const id of ['lamp', 'warden', 'seer', 'star']) ICON['p_' + id] = SPR['p_' + id].img.toDataURL();
}
function buildArt() { buildCreatures(); buildPlayers(); buildProps(); buildTile(); buildVignette(); buildIcons(); buildGateBosses(); buildGateBosses2(); buildUnknownArt(); buildMorePlayers(); buildMorePlayers2(); buildMoreKit(); buildBossGearArt(); buildMapArt(); buildMapBossArt(); }

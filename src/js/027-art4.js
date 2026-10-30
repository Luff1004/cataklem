/* ================= art for the nameless gate (a still frame of the scribble, for menus) ================= */
function buildUnknownArt() {
  regCreature('unknown', 60, (x, c, cy, r, i) => {
    if (i) return;
    const R = mulberry(9);
    x.lineCap = 'round'; x.lineJoin = 'round';
    for (let k = 0; k < 46; k++) {
      let a = R() * TAU, d = R() * r * .6, px = c + Math.cos(a) * d, py = cy + Math.sin(a) * d, h = R() * TAU;
      x.lineWidth = 1.5 + R() * 4.5; x.beginPath(); x.moveTo(px, py);
      for (let s = 0; s < 8; s++) { h += (R() - .5) * 2.6; px += Math.cos(h) * r * .28; py += Math.sin(h) * r * .28; if (Math.hypot(px - c, py - cy) > r) { px = lerp(px, c, .35); py = lerp(py, cy, .35); } x.lineTo(px, py); }
      x.stroke();
    }
    x.lineWidth = 4;
    for (let k = 0; k < 4; k++) { const a = k * 1.7; x.beginPath(); x.moveTo(c, cy); x.quadraticCurveTo(c + Math.cos(a + .6) * r * .7, cy + Math.sin(a + .6) * r * .7, c + Math.cos(a) * r * .98, cy + Math.sin(a) * r * .98); x.stroke(); }
  }, null, { plates: [{ col: COL.deep, dx: 0, dy: 0 }, { col: COL.pink, dx: 2.5, dy: 2 }] });
  const S = 44, c = 23;
  const img = print2(S, S, (x, i) => { flamePath(x, c, c + 3, i ? 10.6 : 12); x.fill(); }, { plates: [{ col: COL.deep, dx: -1.2, dy: .6 }, { col: COL.pink, dx: 1.4, dy: .2 }], after: x => {
    const R = mulberry(3); x.strokeStyle = COL.paper; x.lineWidth = 1.1; x.globalAlpha = .7; x.beginPath();
    let px = c - 6, py = c - 4, h = 0; x.moveTo(px, py); for (let s = 0; s < 12; s++) { h += (R() - .5) * 2.8; px = clamp(px + Math.cos(h) * 4, c - 8, c + 8); py = clamp(py + Math.sin(h) * 4, c - 10, c + 8); x.lineTo(px, py); } x.stroke();
  }, g: .03 });
  SPR.p_nameless = { img, flash: silhouette(img, COL.white), size: S };
  ICON.p_nameless = img.toDataURL();
}

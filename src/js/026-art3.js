/* ================= art, third press: the deep gates ================= */
function buildGateBosses2() {
  // the clock judge
  regCreature('judge', 50, (x, c, cy, r) => {
    x.beginPath(); x.arc(c, cy + r * .08, r * .9, 0, TAU); x.fill();
    x.fillRect(c - r * .38, cy - r * 1.02, r * .76, r * .3); x.fillRect(c - r * .55, cy - r * .78, r * 1.1, r * .12);
    for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; x.beginPath(); x.arc(c + Math.cos(a) * r * .92, cy + r * .08 + Math.sin(a) * r * .92, r * .1, 0, TAU); x.fill(); }
  }, (x, c, cy, r) => {
    const fy = cy + r * .08;
    x.fillStyle = COL.white; x.beginPath(); x.arc(c, fy, r * .64, 0, TAU); x.fill();
    x.strokeStyle = COL.deep; x.lineWidth = 2.4; x.beginPath();
    for (let k = 0; k < 12; k++) { const a = k / 12 * TAU, r1 = r * (k % 3 ? .54 : .46); x.moveTo(c + Math.cos(a) * r1, fy + Math.sin(a) * r1); x.lineTo(c + Math.cos(a) * r * .6, fy + Math.sin(a) * r * .6); }
    x.stroke();
    x.strokeStyle = COL.pink; x.lineWidth = 4; x.beginPath(); x.moveTo(c, fy); x.lineTo(c + r * .1, fy - r * .42); x.moveTo(c, fy); x.lineTo(c + r * .32, fy + r * .12); x.stroke();
    x.fillStyle = COL.yellow; x.beginPath(); x.arc(c, fy, r * .13, 0, TAU); x.fill();
    x.fillStyle = COL.deep; x.beginPath(); x.ellipse(c, fy, r * .04, r * .1, 0, 0, TAU); x.fill();
  }, { pad: 10 });
  // the root king
  regCreature('root', 56, (x, c, cy, r) => {
    blobPath(x, c, cy + r * .12, r * .78, 17, 11, .1, .9); x.fill();
    x.lineWidth = 5;
    for (let k = -3; k <= 3; k++) { x.beginPath(); x.moveTo(c + k * r * .16, cy - r * .5); x.quadraticCurveTo(c + k * r * .3, cy - r * .85, c + k * r * .26 + (k % 2 ? 8 : -8), cy - r * 1.02); x.stroke(); }
    x.lineWidth = 4;
    for (let k = -2; k <= 2; k++) { x.beginPath(); x.moveTo(c + k * r * .25, cy + r * .75); x.quadraticCurveTo(c + k * r * .45, cy + r * .9, c + k * r * .5, cy + r * 1.02); x.stroke(); }
  }, (x, c, cy, r) => {
    x.fillStyle = COL.yellow; x.beginPath(); x.ellipse(c - r * .26, cy - r * .02, r * .11, r * .15, .2, 0, TAU); x.ellipse(c + r * .26, cy - r * .02, r * .11, r * .15, -.2, 0, TAU); x.fill();
    x.fillStyle = COL.deep; x.beginPath(); x.arc(c - r * .25, cy, r * .05, 0, TAU); x.arc(c + r * .25, cy, r * .05, 0, TAU); x.fill();
    x.fillStyle = COL.deep; x.beginPath(); x.ellipse(c, cy + r * .38, r * .2, r * .1, 0, 0, TAU); x.fill();
    x.fillStyle = COL.pink; for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + (k - 2) * .45; x.beginPath(); x.arc(c + Math.cos(a) * r * .95, cy - r * .02 + Math.sin(a) * r * .95, r * .09, 0, TAU); x.fill(); }
  }, { pad: 10, plates: [{ col: COL.pink, dx: 1.5, dy: 1.1 }, { col: COL.teal, dx: 0, dy: 0 }, { col: COL.ink, dx: -1, dy: -.6 }] });
  // the fallen sky
  regCreature('sky', 70, (x, c, cy, r, i) => {
    if (i === 0) { star(x, c, cy, 18, r * .99, r * .82); x.fill(); return; }
    x.beginPath(); x.arc(c, cy, r * .8, 0, TAU); x.fill();
  }, (x, c, cy, r) => {
    const R = mulberry(77);
    x.fillStyle = COL.white; for (let k = 0; k < 40; k++) { const a = R() * TAU, d = R() * r * .76; x.globalAlpha = .4 + R() * .6; x.fillRect(c + Math.cos(a) * d, cy + Math.sin(a) * d, 1.6, 1.6); }
    x.globalAlpha = 1;
    x.strokeStyle = COL.yellow; x.lineWidth = 2.4; x.beginPath();
    for (let k = 0; k < 5; k++) { let a = R() * TAU, px = c + Math.cos(a) * r * .3, py = cy + Math.sin(a) * r * .3; x.moveTo(px, py); for (let s = 0; s < 4; s++) { a += (R() - .5) * .9; px += Math.cos(a) * r * .13; py += Math.sin(a) * r * .13; x.lineTo(px, py); } }
    x.stroke();
    x.fillStyle = COL.white; x.beginPath(); x.ellipse(c, cy, r * .46, r * .24, 0, 0, TAU); x.fill();
    x.fillStyle = COL.pink; x.beginPath(); x.arc(c, cy, r * .2, 0, TAU); x.fill();
    x.fillStyle = COL.deep; x.beginPath(); x.arc(c, cy, r * .09, 0, TAU); x.fill();
    x.fillStyle = COL.white; x.beginPath(); x.arc(c - r * .06, cy - r * .07, r * .035, 0, TAU); x.fill();
  }, { pad: 8, plates: [{ col: COL.pink, dx: 2, dy: 1.5 }, { col: COL.deep, dx: 0, dy: 0 }] });
  // a flower turret
  regCreature('sprout', 18, (x, c, cy, r) => {
    for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; x.beginPath(); x.ellipse(c + Math.cos(a) * r * .5, cy + Math.sin(a) * r * .5, r * .42, r * .26, a, 0, TAU); x.fill(); }
  }, (x, c, cy, r) => eyes(x, [[c, cy]], r * .3, r * .15, .1), { plates: [{ col: COL.pink, dx: 0, dy: 0 }, { col: COL.teal, dx: 1.4, dy: 1.2 }] });
}
function buildMorePlayers2() {
  const flame = (A, B) => [{ col: A, dx: -1.2, dy: .6 }, { col: B, dx: .6, dy: .2 }];
  const V = {
    clockman: [flame(COL.yellow, COL.pink), (x, c) => { x.fillStyle = COL.ink; x.beginPath(); x.arc(c, c - 13, 7, 0, TAU); x.fill(); x.fillStyle = COL.white; x.beginPath(); x.arc(c, c - 13, 4.6, 0, TAU); x.fill(); x.strokeStyle = COL.pink; x.lineWidth = 1.4; x.beginPath(); x.moveTo(c, c - 13); x.lineTo(c, c - 16.5); x.moveTo(c, c - 13); x.lineTo(c + 3, c - 12); x.stroke(); }],
    gardener: [flame(COL.yellow, COL.teal), (x, c) => { x.fillStyle = COL.pink; x.beginPath(); x.ellipse(c + 5, c - 16, 7, 3.5, -.6, 0, TAU); x.fill(); x.fillStyle = COL.ink; x.fillRect(c - .8, c - 16, 1.6, 7); }],
    skykeeper: [flame(COL.pink, COL.yellow), (x, c) => { x.strokeStyle = COL.deep; x.lineWidth = 2.4; x.beginPath(); x.ellipse(c, c - 15, 11, 3.5, 0, 0, TAU); x.stroke(); x.fillStyle = COL.white; x.fillRect(c - 9, c - 16, 1.6, 1.6); x.fillRect(c + 6, c - 15, 1.6, 1.6); x.fillRect(c - 1, c - 19, 1.6, 1.6); }],
  };
  for (const id in V) {
    const S = 44, c = 23, [plates, acc] = V[id];
    const img = print2(S, S, (x, i) => { flamePath(x, c, c + 3, i ? 10.6 : 12); x.fill(); }, { plates, after: x => {
      acc(x, c);
      x.fillStyle = COL.deep; x.beginPath(); x.ellipse(c - 3.6, c + 4, 1.7, 2.3, 0, 0, TAU); x.ellipse(c + 3.6, c + 4, 1.7, 2.3, 0, 0, TAU); x.fill();
    }, g: .03 });
    SPR['p_' + id] = { img, flash: silhouette(img, COL.white), size: S };
    ICON['p_' + id] = img.toDataURL();
  }
}

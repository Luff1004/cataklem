/* ================= art, second press: gate bosses, new fire spirits, new kit ================= */
function buildGateBosses() {
  // the bellringer: a cracked bell with one eye where the clapper should be
  regCreature('bell', 52, (x, c, cy, r, i) => {
    x.beginPath();
    x.moveTo(c - r * .18, cy - r * .98); x.lineTo(c + r * .18, cy - r * .98); x.lineTo(c + r * .2, cy - r * .82);
    x.bezierCurveTo(c + r * .62, cy - r * .78, c + r * .7, cy - r * .2, c + r * .74, cy + r * .3);
    x.quadraticCurveTo(c + r * .8, cy + r * .62, c + r * .98, cy + r * .74);
    x.lineTo(c - r * .98, cy + r * .74);
    x.quadraticCurveTo(c - r * .8, cy + r * .62, c - r * .74, cy + r * .3);
    x.bezierCurveTo(c - r * .7, cy - r * .2, c - r * .62, cy - r * .78, c - r * .2, cy - r * .82);
    x.closePath(); x.fill();
    x.fillRect(c - r * 1.02, cy + r * .7, r * 2.04, r * .14);
  }, (x, c, cy, r) => {
    x.fillStyle = COL.white; x.beginPath(); x.ellipse(c, cy + r * .82, r * .82, r * .13, 0, 0, Math.PI); x.fill();
    x.fillStyle = COL.deep; x.beginPath(); x.arc(c, cy + r * .9, r * .16, 0, TAU); x.fill();
    eyes(x, [[c, cy - r * .12]], r * .24, r * .12, .25);
    x.strokeStyle = COL.white; x.lineWidth = 2.4; x.beginPath();
    x.moveTo(c + r * .32, cy - r * .7); x.lineTo(c + r * .22, cy - r * .45); x.lineTo(c + r * .4, cy - r * .3); x.lineTo(c + r * .3, cy - r * .05); x.stroke();
    x.strokeStyle = COL.pink; x.lineWidth = 2; x.beginPath(); for (let k = 0; k < 7; k++) { const px = c - r * .6 + k * r * .2; x.moveTo(px, cy + r * .5); x.lineTo(px + r * .06, cy + r * .62); } x.stroke();
  }, { pad: 10 });
  // the loom queen: a spider with a spindle for a body
  regCreature('loom', 46, (x, c, cy, r, i) => {
    x.lineWidth = 4.2;
    for (const s of [-1, 1]) for (let k = 0; k < 4; k++) {
      const a0 = -.9 + k * .55;
      x.beginPath(); x.moveTo(c + s * r * .2, cy + r * .02);
      x.quadraticCurveTo(c + s * r * (.75 + k * .05), cy - r * (.75 - k * .45), c + s * r * (.98 - k * .02), cy + r * (a0 + .3));
      x.stroke();
    }
    x.beginPath(); x.ellipse(c, cy + r * .28, r * .42, r * .5, 0, 0, TAU); x.fill();
    x.beginPath(); x.arc(c, cy - r * .3, r * .3, 0, TAU); x.fill();
  }, (x, c, cy, r) => {
    eyes(x, [[c - r * .13, cy - r * .36], [c + r * .13, cy - r * .36], [c - r * .07, cy - r * .2], [c + r * .07, cy - r * .2]], r * .07, r * .035, .1);
    x.strokeStyle = COL.pink; x.lineWidth = 2.2; x.beginPath();
    for (let k = 0; k < 5; k++) { x.moveTo(c - r * .36, cy + r * (.05 + k * .12)); x.quadraticCurveTo(c, cy + r * (.12 + k * .12), c + r * .36, cy + r * (.05 + k * .12)); }
    x.stroke();
    x.fillStyle = COL.yellow; x.beginPath(); star(x, c, cy + r * .3, 4, r * .14, r * .05); x.fill();
  }, { pad: 8 });
  // the mirror twins: two masks, one printed in ink and one in pink
  const mask = (x, c, cy, r) => {
    x.beginPath(); x.moveTo(c, cy - r); x.quadraticCurveTo(c + r * 1.05, cy - r * .9, c + r * .82, cy + r * .1); x.quadraticCurveTo(c + r * .6, cy + r * .95, c, cy + r); x.quadraticCurveTo(c - r * .6, cy + r * .95, c - r * .82, cy + r * .1); x.quadraticCurveTo(c - r * 1.05, cy - r * .9, c, cy - r); x.fill();
  };
  const maskFace = mirror => (x, c, cy, r) => {
    x.fillStyle = COL.white;
    x.beginPath(); x.ellipse(c - r * .35, cy - r * .1, r * .2, r * .11, mirror ? -.3 : .3, 0, TAU); x.ellipse(c + r * .35, cy - r * .1, r * .2, r * .11, mirror ? .3 : -.3, 0, TAU); x.fill();
    x.fillStyle = COL.deep; x.beginPath(); x.arc(c - r * .35, cy - r * .1, r * .07, 0, TAU); x.arc(c + r * .35, cy - r * .1, r * .07, 0, TAU); x.fill();
    x.strokeStyle = COL.white; x.lineWidth = 2.6; x.beginPath(); x.moveTo(c - r * .3, cy + r * .45); x.quadraticCurveTo(c, cy + r * (mirror ? .3 : .62), c + r * .3, cy + r * .45); x.stroke();
    x.fillStyle = mirror ? COL.ink : COL.pink; x.beginPath(); star(x, c, cy - r * .62, 4, r * .16, r * .06); x.fill();
  };
  regCreature('twinA', 34, (x, c, cy, r) => mask(x, c, cy, r), maskFace(false), { pad: 8 });
  regCreature('twinB', 34, (x, c, cy, r) => mask(x, c, cy, r), maskFace(true), { pad: 8, plates: [{ col: COL.ink, dx: -1.5, dy: 1.1 }, { col: COL.pink, dx: 0, dy: 0 }] });
  // the ink tide: a serpent head seen from above, facing up
  regCreature('tide', 50, (x, c, cy, r) => {
    x.beginPath(); x.moveTo(c, cy - r * .98);
    x.quadraticCurveTo(c + r * .62, cy - r * .7, c + r * .55, cy + r * .1); x.lineTo(c + r * .95, cy + r * .25); x.lineTo(c + r * .5, cy + r * .45);
    x.quadraticCurveTo(c + r * .35, cy + r * 1, c, cy + r * .98); x.quadraticCurveTo(c - r * .35, cy + r * 1, c - r * .5, cy + r * .45);
    x.lineTo(c - r * .95, cy + r * .25); x.lineTo(c - r * .55, cy + r * .1); x.quadraticCurveTo(c - r * .62, cy - r * .7, c, cy - r * .98); x.fill();
  }, (x, c, cy, r) => {
    x.fillStyle = COL.yellow; x.beginPath(); x.ellipse(c - r * .28, cy - r * .3, r * .12, r * .18, -.3, 0, TAU); x.ellipse(c + r * .28, cy - r * .3, r * .12, r * .18, .3, 0, TAU); x.fill();
    x.fillStyle = COL.deep; x.fillRect(c - r * .3, cy - r * .42, r * .04, r * .24); x.fillRect(c + r * .26, cy - r * .42, r * .04, r * .24);
    x.fillStyle = COL.white; x.beginPath(); for (let k = 0; k < 6; k++) { const px = c - r * .3 + k * r * .12; x.moveTo(px, cy - r * .72); x.lineTo(px + r * .06, cy - r * .58); x.lineTo(px + r * .12, cy - r * .72); } x.fill();
    x.strokeStyle = COL.pink; x.lineWidth = 2.4; x.beginPath(); for (let k = 0; k < 3; k++) { x.moveTo(c - r * .3, cy + r * (.15 + k * .22)); x.quadraticCurveTo(c, cy + r * (.3 + k * .22), c + r * .3, cy + r * (.15 + k * .22)); } x.stroke();
  }, { pad: 10 });
  // the fallen sun
  regCreature('sun', 64, (x, c, cy, r, i) => {
    if (i === 0) { star(x, c, cy, 14, r * .98, r * .72); x.fill(); return; }
    x.beginPath(); x.arc(c, cy, r * .66, 0, TAU); x.fill();
  }, (x, c, cy, r) => {
    x.fillStyle = COL.white; x.beginPath(); x.ellipse(c, cy, r * .36, r * .26, 0, 0, TAU); x.fill();
    x.fillStyle = COL.pink; x.beginPath(); x.arc(c, cy, r * .2, 0, TAU); x.fill();
    x.fillStyle = COL.deep; x.beginPath(); x.ellipse(c, cy, r * .06, r * .18, 0, 0, TAU); x.fill();
    x.strokeStyle = COL.yellow; x.lineWidth = 3; x.beginPath(); x.arc(c, cy, r * .52, 0, TAU); x.stroke();
  }, { pad: 8, plates: [{ col: COL.yellow, dx: 0, dy: 0 }, { col: COL.pink, dx: 1.5, dy: 1.2 }, { col: COL.ink, dx: 0, dy: 0 }] });
  // adds
  regCreature('echo', 20, (x, c, cy, r) => {
    x.beginPath(); x.moveTo(c - r * .2, cy - r * .9); x.lineTo(c + r * .2, cy - r * .9); x.quadraticCurveTo(c + r * .7, cy - r * .5, c + r * .9, cy + r * .7); x.lineTo(c - r * .9, cy + r * .7); x.quadraticCurveTo(c - r * .7, cy - r * .5, c - r * .2, cy - r * .9); x.fill();
  }, (x, c, cy, r) => { eyes(x, [[c, cy]], r * .26, r * .13); x.fillStyle = COL.pink; x.beginPath(); x.arc(c, cy + r * .82, r * .16, 0, TAU); x.fill(); });
  regCreature('sat', 16, (x, c, cy, r, i) => { star(x, c, cy, 6, r, r * .55, i * .1); x.fill(); },
    (x, c, cy, r) => { eyes(x, [[c, cy]], r * .3, r * .15, .1); }, { plates: [{ col: COL.yellow, dx: 1.2, dy: 1 }, { col: COL.ink, dx: 0, dy: 0 }] });
}

function buildMorePlayers() {
  const flame = (A, B) => [{ col: A, dx: -1.2, dy: .6 }, { col: B, dx: .6, dy: .2 }];
  const V = {
    hunter: [flame(COL.yellow, COL.pink), (x, c) => { x.fillStyle = COL.ink; x.beginPath(); x.moveTo(c - 9, c - 7); x.lineTo(c - 6, c - 18); x.lineTo(c - 2, c - 8); x.moveTo(c + 9, c - 7); x.lineTo(c + 6, c - 18); x.lineTo(c + 2, c - 8); x.fill(); }],
    arson: [flame(COL.yellow, COL.teal), (x, c) => { x.fillStyle = COL.pink; star(x, c + 9, c - 15, 5, 4.5, 2); x.fill(); }],
    keeper: [flame(COL.yellow, COL.pink), (x, c) => { x.fillStyle = COL.ink; x.fillRect(c - 7, c - 14, 14, 6); x.fillRect(c - 9, c - 9, 18, 2.5); x.fillStyle = COL.yellow; x.fillRect(c - 3, c - 13, 6, 4); }],
    sapper: [flame(COL.yellow, COL.pink), (x, c) => { x.fillStyle = COL.ink; x.beginPath(); x.ellipse(c, c - 5, 10, 6.5, 0, Math.PI, 0); x.fill(); x.fillStyle = COL.yellow; x.beginPath(); x.arc(c - 4, c - 6, 2.2, 0, TAU); x.arc(c + 4, c - 6, 2.2, 0, TAU); x.fill(); }],
    glow: [flame(COL.yellow, COL.yellow), (x, c) => { x.strokeStyle = COL.ink; x.lineWidth = 1.6; x.beginPath(); x.moveTo(c - 3, c - 14); x.quadraticCurveTo(c - 6, c - 22, c - 10, c - 21); x.moveTo(c + 3, c - 14); x.quadraticCurveTo(c + 6, c - 22, c + 10, c - 21); x.stroke(); x.fillStyle = COL.pink; x.beginPath(); x.arc(c - 10, c - 21, 2, 0, TAU); x.arc(c + 10, c - 21, 2, 0, TAU); x.fill(); }],
    abyss: [flame(COL.teal, COL.ink), () => {}],
    bellman: [flame(COL.yellow, COL.pink), (x, c) => { x.fillStyle = COL.ink; x.beginPath(); x.moveTo(c - 2, c - 22); x.lineTo(c + 2, c - 22); x.quadraticCurveTo(c + 7, c - 18, c + 8, c - 12); x.lineTo(c - 8, c - 12); x.quadraticCurveTo(c - 7, c - 18, c - 2, c - 22); x.fill(); }],
    weaver: [flame(COL.yellow, COL.pink), (x, c) => { x.strokeStyle = COL.ink; x.lineWidth = 1.2; x.beginPath(); for (let k = -2; k <= 2; k++) { x.moveTo(c - 12, c + k * 4); x.lineTo(c + 12, c - k * 3); } x.stroke(); }],
    twin: [[{ col: COL.pink, dx: -3.5, dy: .6 }, { col: COL.teal, dx: 3, dy: .2 }], () => {}],
    tidal: [flame(COL.teal, COL.yellow), (x, c) => { x.strokeStyle = COL.ink; x.lineWidth = 2; x.beginPath(); x.moveTo(c - 11, c - 10); x.quadraticCurveTo(c - 6, c - 16, c - 1, c - 10); x.quadraticCurveTo(c + 4, c - 16, c + 10, c - 10); x.stroke(); }],
    eclipse: [flame(COL.yellow, COL.pink), (x, c) => { x.fillStyle = COL.deep; x.beginPath(); x.arc(c + 3, c - 13, 7, 0, TAU); x.fill(); x.fillStyle = COL.yellow; x.beginPath(); x.arc(c + 6, c - 15, 4.5, 0, TAU); x.fill(); x.fillStyle = COL.deep; x.beginPath(); x.arc(c + 7.5, c - 15.5, 4, 0, TAU); x.fill(); }],
  };
  for (const id in V) {
    const S = 44, c = 23, [plates, acc] = V[id];
    const img = print2(S, S, (x, i) => { flamePath(x, c, c + 3, i ? 10.6 : 12); x.fill(); }, { plates, after: x => {
      acc(x, c);
      x.fillStyle = id === 'abyss' ? COL.white : COL.deep; x.beginPath(); x.ellipse(c - 3.6, c + 4, 1.7, 2.3, 0, 0, TAU); x.ellipse(c + 3.6, c + 4, 1.7, 2.3, 0, 0, TAU); x.fill();
    }, g: .03 });
    SPR['p_' + id] = { img, flash: silhouette(img, COL.white), size: S };
    ICON['p_' + id] = img.toDataURL();
  }
}

function buildMoreKit() {
  Object.assign(ICON_SHAPES, {
    needle: x => { x.lineWidth = 3.4; for (let k = -2; k <= 2; k++) { x.beginPath(); x.moveTo(14, 50); x.lineTo(14 + Math.cos(-.8 + k * .22) * 44, 50 + Math.sin(-.8 + k * .22) * 44); x.stroke(); } },
    trail: x => { for (let k = 0; k < 4; k++) { x.beginPath(); x.ellipse(14 + k * 12, 48 - k * 9, 6 + k, 4 + k * .6, -.6, 0, TAU); x.fill(); } flamePath(x, 50, 18, 8); x.fill(); },
    beam: x => { x.beginPath(); x.arc(32, 32, 7, 0, TAU); x.fill(); x.lineWidth = 6; x.beginPath(); x.moveTo(32, 32); x.lineTo(60, 14); x.stroke(); x.lineWidth = 3; x.beginPath(); x.moveTo(32, 32); x.lineTo(6, 48); x.stroke(); },
    mine: x => { x.beginPath(); x.arc(32, 36, 14, 0, TAU); x.fill(); x.lineWidth = 4; for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; x.beginPath(); x.moveTo(32 + Math.cos(a) * 14, 36 + Math.sin(a) * 14); x.lineTo(32 + Math.cos(a) * 21, 36 + Math.sin(a) * 21); x.stroke(); } },
    firefly: x => { for (const [px, py, r] of [[22, 22, 7], [44, 30, 9], [26, 46, 6]]) { x.beginPath(); x.arc(px, py, r, 0, TAU); x.fill(); } x.lineWidth = 2; x.setLineDash([3, 4]); x.beginPath(); x.moveTo(22, 22); x.quadraticCurveTo(50, 10, 44, 30); x.quadraticCurveTo(40, 50, 26, 46); x.stroke(); x.setLineDash([]); },
    vortex: x => { x.lineWidth = 4; for (let k = 0; k < 3; k++) { x.beginPath(); x.arc(32, 32, 8 + k * 7, k * 2, k * 2 + 4.2); x.stroke(); } x.beginPath(); x.arc(32, 32, 5, 0, TAU); x.fill(); },
    scale: x => { for (let r = 0; r < 3; r++) for (let k = 0; k < 3 - (r % 2); k++) { x.beginPath(); x.arc(18 + k * 14 + (r % 2) * 7, 20 + r * 12, 8, 0, Math.PI); x.fill(); } },
    spring: x => { x.lineWidth = 4; x.beginPath(); for (let k = 0; k <= 40; k++) { const a = k / 40 * 3 * TAU, r = 4 + k * .55; const px = 32 + Math.cos(a) * r, py = 32 + Math.sin(a) * r; k ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke(); x.fillRect(50, 28, 10, 8); },
  });
  for (const id of ['needle', 'trail', 'beam', 'mine', 'firefly', 'vortex', 'scale', 'spring']) {
    ICON[id] = print2(64, 64, ICON_SHAPES[id], { g: .04 }).toDataURL();
    ICON[id + '_evo'] = print2(64, 64, (x, i) => { if (i === 0) { star(x, 32, 32, 12, 31, 22); x.fill(); return; } ICON_SHAPES[id](x); },
      { plates: [{ col: COL.yellow }, { col: COL.pink, dx: 1.6, dy: 1.2 }, { col: COL.ink }], g: .04 }).toDataURL();
  }
  for (const id in RELICS) {
    const sh = ICON_SHAPES[RELICS[id].icon];
    ICON['r_' + id] = print2(64, 64, (x, i) => {
      if (i === 0) { x.beginPath(); x.arc(32, 32, 30, 0, TAU); x.fill(); return; }
      if (i === 1) { x.lineWidth = 2; x.setLineDash([3, 3]); x.beginPath(); x.arc(32, 32, 26, 0, TAU); x.stroke(); x.setLineDash([]); return; }
      x.translate(32, 32); x.scale(.62, .62); x.translate(-32, -32); sh(x);
    }, { plates: [{ col: COL.pink }, { col: COL.deep }, { col: COL.ink }], g: .04 }).toDataURL();
  }
  for (const g of GATES) ICON['g_' + g.id] = SPR[g.id === 'twins' ? 'twinA' : g.id].img.toDataURL();
  ICON.g_twinsB = SPR.twinB.img.toDataURL();
  ICON.core = print2(64, 64, (x, i) => { star(x, 32, 32, 6, i ? 20 : 26, i ? 10 : 14, i * .3); x.fill(); }, { plates: [{ col: COL.yellow }, { col: COL.pink, dx: 1.5, dy: 1 }], g: .04 }).toDataURL();
  ICON.dash = print2(64, 64, x => { for (let k = 0; k < 3; k++) { x.beginPath(); x.moveTo(14 + k * 14, 14); x.lineTo(30 + k * 14, 32); x.lineTo(14 + k * 14, 50); x.lineTo(22 + k * 14, 32); x.closePath(); x.fill(); } }, { g: .03 }).toDataURL();

  SP.crack = print2(160, 160, () => {}, { plates: [{ col: COL.deep }], grain: false, after: x => {
    const R = mulberry(31); x.strokeStyle = COL.deep; x.lineCap = 'round';
    for (let k = 0; k < 11; k++) {
      let a = k / 11 * TAU + R() * .4, px = 80, py = 80; x.lineWidth = 3.4; x.beginPath(); x.moveTo(px, py);
      for (let s = 0; s < 7; s++) { a += (R() - .5) * .7; px += Math.cos(a) * 11; py += Math.sin(a) * 11; x.lineTo(px, py); }
      x.stroke();
      if (R() < .6) { x.lineWidth = 1.4; x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a + 1) * 14, py + Math.sin(a + 1) * 14); x.stroke(); }
    }
    x.fillStyle = COL.deep; blobPath(x, 80, 80, 14, 9, 8, .3); x.fill();
  } });
  SP.mine = print2(22, 22, x => { x.beginPath(); x.arc(11, 11, 8, 0, TAU); x.fill(); x.lineWidth = 2; for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; x.beginPath(); x.moveTo(11 + Math.cos(a) * 8, 11 + Math.sin(a) * 8); x.lineTo(11 + Math.cos(a) * 10.5, 11 + Math.sin(a) * 10.5); x.stroke(); } }, { plates: [{ col: COL.pink, dx: 1, dy: .8 }, { col: COL.deep }], g: .02 });
  SP.fly = print2(16, 16, (x, i) => { x.beginPath(); x.arc(8, 8, i ? 3 : 6.5, 0, TAU); x.fill(); }, { plates: [{ col: COL.yellow }, { col: COL.pink, dx: .4, dy: .3 }], grain: false });
  SP.pillar = print2(64, 64, (x, i) => { if (i === 0) { x.beginPath(); x.ellipse(32, 36, 28, 24, 0, 0, TAU); x.fill(); return; } blobPath(x, 32, 32, 26, 61, 8, .12); x.fill(); },
    { plates: [{ col: COL.pink, dx: 2, dy: 3 }, { col: COL.deep }], after: x => { x.strokeStyle = COL.paper; x.globalAlpha = .55; x.lineWidth = 2; x.beginPath(); x.moveTo(18, 22); x.lineTo(30, 30); x.lineTo(28, 44); x.moveTo(30, 30); x.lineTo(44, 26); x.stroke(); } });
}

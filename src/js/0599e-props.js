/* ================= story: props drawn properly =================
   Chests, push blocks, the things that block a road, levers, pots, signs, the
   bounty board and torches. Each is printed once as an upright picture and stood
   on the tilted floor; pots and signs come in a few shapes and sizes. */
const PROP = {};
function propSpr(key, w, h, fn) { return PROP[key] || (PROP[key] = tallCanvas(w, h, 3, fn)); }
const pHash = e => (((e.tx || 0) * 73 + (e.ty || 0) * 37 + 11) % 97) / 97;
function standUp(img, x, y, sc, flip) {
  wu(); const w = img.lw * sc, h = img.lh * sc;
  if (flip) { ctx.save(); ctx.translate(x, 0); ctx.scale(-1, 1); ctx.drawImage(img, -w / 2, y * TY - h + 4, w, h); ctx.restore(); }
  else ctx.drawImage(img, x - w / 2, y * TY - h + 4, w, h);
}
function groundShadow(x, y, rx) { wt(); ctx.fillStyle = 'rgba(20,27,64,.22)'; ctx.beginPath(); ctx.ellipse(x, y + 2, rx, rx * .45, 0, 0, TAU); ctx.fill(); }
const wood = (x, X, Y, W, H, c0, c1) => { const g = x.createLinearGradient(0, Y, 0, Y + H); g.addColorStop(0, c0); g.addColorStop(1, c1); x.fillStyle = g; x.fillRect(X, Y, W, H); };

/* ---------- chest ---------- */
function chestSpr(open) {
  return propSpr('chest' + (open ? 1 : 0), 52, 50, x => {
    const ink = COL.ink, X = 6, W = 40, base = 46, bodyT = base - 20;
    x.lineJoin = 'round';
    if (open) {
      // the lid thrown back, a dark inside with a glint of gold
      x.fillStyle = '#5A3A22'; x.beginPath(); x.moveTo(X + 2, bodyT); x.lineTo(X + 6, bodyT - 18); x.lineTo(X + W - 6, bodyT - 18); x.lineTo(X + W - 2, bodyT); x.closePath(); x.fill(); x.strokeStyle = ink; x.lineWidth = 2; x.stroke();
      x.strokeStyle = '#3A2414'; x.lineWidth = 1; for (let k = 1; k < 4; k++) { x.beginPath(); x.moveTo(X + 4 + k * .5, bodyT - k * 4.5); x.lineTo(X + W - 4 - k * .5, bodyT - k * 4.5); x.stroke(); }
      x.fillStyle = '#2A1A10'; x.fillRect(X + 3, bodyT - 2, W - 6, 6);
      x.fillStyle = '#FFD23F'; for (let k = 0; k < 5; k++) { x.beginPath(); x.ellipse(X + 10 + k * 5, bodyT + 1 + (k % 2), 3, 1.6, 0, 0, TAU); x.fill(); }
    } else {
      // a rounded lid of planks with iron bands
      x.beginPath(); x.moveTo(X, bodyT); x.lineTo(X, bodyT - 8); x.quadraticCurveTo(X + W / 2, bodyT - 22, X + W, bodyT - 8); x.lineTo(X + W, bodyT); x.closePath();
      const g = x.createLinearGradient(0, bodyT - 18, 0, bodyT); g.addColorStop(0, '#E0A65E'); g.addColorStop(1, '#A8703A'); x.fillStyle = g; x.fill(); x.strokeStyle = ink; x.lineWidth = 2; x.stroke();
      x.strokeStyle = 'rgba(80,45,20,.5)'; x.lineWidth = 1; for (let k = 1; k < 3; k++) { x.beginPath(); x.moveTo(X + 1, bodyT - k * 5); x.quadraticCurveTo(X + W / 2, bodyT - k * 5 - 12 + k * 2, X + W - 1, bodyT - k * 5); x.stroke(); }
    }
    // the box
    wood(x, X, bodyT, W, base - bodyT, '#C98A48', '#8A5A2E');
    x.strokeStyle = 'rgba(80,45,20,.5)'; x.lineWidth = 1; for (let k = 1; k < 3; k++) { x.beginPath(); x.moveTo(X, bodyT + k * 6.5); x.lineTo(X + W, bodyT + k * 6.5); x.stroke(); }
    x.strokeStyle = ink; x.lineWidth = 2; x.strokeRect(X, bodyT, W, base - bodyT);
    // iron bands and corners
    x.fillStyle = '#5E6474';
    for (const bx of [X + 6, X + W - 10]) { x.fillRect(bx, open ? bodyT : bodyT - 15, 4, base - bodyT + (open ? 0 : 15)); }
    x.fillStyle = '#B4B8C2'; for (const [cx2, cy2] of [[X + 8, bodyT + 4], [X + W - 8, bodyT + 4], [X + 8, base - 4], [X + W - 8, base - 4]]) { x.beginPath(); x.arc(cx2, cy2, 1.3, 0, TAU); x.fill(); }
    if (!open) {
      // the lock
      x.fillStyle = '#FFD23F'; x.strokeStyle = ink; x.lineWidth = 1.6; x.beginPath(); x.roundRect(X + W / 2 - 5, bodyT - 4, 10, 11, 2); x.fill(); x.stroke();
      x.fillStyle = ink; x.beginPath(); x.arc(X + W / 2, bodyT + 1, 1.6, 0, TAU); x.fill(); x.fillRect(X + W / 2 - .6, bodyT + 1, 1.2, 3.5);
      x.fillStyle = 'rgba(255,255,255,.5)'; x.fillRect(X + 3, bodyT - 9, 10, 1.6);
    }
    x.fillStyle = 'rgba(20,27,64,.2)'; x.fillRect(X, base - 3, W, 3);
  });
}

/* ---------- the stone you push onto plates ---------- */
function blockSpr(reg) {
  return propSpr('block' + reg, 50, 58, x => {
    const ink = COL.ink, X = 5, W = 40, base = 54, depth = 28, H = 22, top = base - H - depth;
    const st = { 1: ['#C9CCD4', '#8C93A3'], 2: ['#A8BAB6', '#6A807C'], 3: ['#EDE0BE', '#C4A775'], 4: ['#DDEBF0', '#9EB8C4'], 5: ['#F4F1EA', '#B8B2A6'] }[reg] || ['#C9CCD4', '#8C93A3'];
    x.fillStyle = st[0]; x.fillRect(X, top, W, depth); x.fillStyle = st[1]; x.fillRect(X, top + depth, W, H);
    x.strokeStyle = ink; x.lineWidth = 2; x.strokeRect(X, top, W, depth + H); x.beginPath(); x.moveTo(X, top + depth); x.lineTo(X + W, top + depth); x.stroke();
    // a carved square on top and chipped edges
    x.strokeStyle = 'rgba(20,27,64,.3)'; x.lineWidth = 1.4; x.strokeRect(X + 8, top + 6, W - 16, depth - 12);
    x.beginPath(); x.moveTo(X + W / 2, top + 9); x.lineTo(X + W / 2, top + depth - 9); x.moveTo(X + 12, top + depth / 2); x.lineTo(X + W - 12, top + depth / 2); x.stroke();
    x.fillStyle = 'rgba(255,255,255,.4)'; x.fillRect(X + 2, top + 2, W - 4, 2);
    x.fillStyle = 'rgba(20,27,64,.2)'; x.beginPath(); x.moveTo(X + W, top + depth); x.lineTo(X + W - 6, top + depth + 4); x.lineTo(X + W, top + depth + 9); x.fill();
  });
}

/* ---------- what blocks a road, by region ---------- */
function blockerSpr(reg, v) {
  return propSpr('blk' + reg + '_' + v, 60, 72, x => {
    const ink = COL.ink, cx = 30, base = 68, R = mulberry(reg * 13 + v * 7 + 1);
    x.lineJoin = 'round'; x.lineCap = 'round';
    if (reg === 1) {
      // rubble: fallen blocks and a broken beam
      x.save(); x.translate(cx - 4, base - 34); x.rotate(-.5); wood(x, -4, -24, 8, 48, '#9C7A55', '#6B4A33'); x.strokeStyle = ink; x.lineWidth = 1.8; x.strokeRect(-4, -24, 8, 48); x.restore();
      for (const [ox, oy, w, h, a] of [[-14, -10, 22, 16, .1], [8, -8, 20, 18, -.15], [-4, -26, 20, 15, .25], [14, -28, 14, 12, -.3], [-18, -26, 12, 10, .4]]) {
        x.save(); x.translate(cx + ox, base + oy); x.rotate(a);
        x.fillStyle = '#B4B8C2'; x.fillRect(-w / 2, -h / 2, w, h); x.fillStyle = '#7C808C'; x.fillRect(-w / 2, h / 2 - 5, w, 5);
        x.strokeStyle = ink; x.lineWidth = 1.8; x.strokeRect(-w / 2, -h / 2, w, h); x.fillStyle = 'rgba(255,255,255,.45)'; x.fillRect(-w / 2 + 2, -h / 2 + 2, w * .5, 2); x.restore();
      }
    } else if (reg === 2) {
      // a fallen trunk with a cut end and a few leafy twigs
      x.fillStyle = 'rgba(20,27,64,.25)'; x.beginPath(); x.ellipse(cx, base - 2, 28, 6, 0, 0, TAU); x.fill();
      wood(x, 2, base - 34, 50, 28, '#7A5A40', '#3E2F2A'); x.strokeStyle = ink; x.lineWidth = 2; x.strokeRect(2, base - 34, 50, 28);
      x.strokeStyle = 'rgba(0,0,0,.35)'; x.lineWidth = 1; for (let k = 0; k < 5; k++) { const yy = base - 30 + k * 5; x.beginPath(); x.moveTo(4, yy); x.bezierCurveTo(18, yy + 2, 32, yy - 2, 50, yy + 1); x.stroke(); }
      x.fillStyle = '#D9B27A'; x.beginPath(); x.ellipse(52, base - 20, 6, 14, 0, 0, TAU); x.fill(); x.stroke();
      x.strokeStyle = '#8A6440'; for (const r of [3, 7, 10]) { x.beginPath(); x.ellipse(52, base - 20, r * .42, r, 0, 0, TAU); x.stroke(); }
      x.fillStyle = '#2E5E50'; for (let k = 0; k < 7; k++) { x.beginPath(); x.ellipse(8 + R() * 30, base - 36 - R() * 10, 5, 3, R() * 3, 0, TAU); x.fill(); }
      x.fillStyle = '#4F8A7E'; for (let k = 0; k < 5; k++) { x.beginPath(); x.ellipse(10 + R() * 28, base - 38 - R() * 8, 3.4, 2, R() * 3, 0, TAU); x.fill(); }
    } else if (reg === 3 || reg === 4) {
      // crystals of salt, or a wall of ice
      const ice = reg === 4, c0 = ice ? '#E9F7FB' : '#FFFFFF', c1 = ice ? '#7CC6D8' : '#E2D6B8';
      const shards = [[-14, 30, 10, -.25], [-2, 46, 12, .05], [12, 36, 11, .2], [20, 22, 8, .4], [-22, 20, 8, -.4]];
      for (const [ox, h, w, a] of shards) {
        x.save(); x.translate(cx + ox, base - 2); x.rotate(a);
        x.beginPath(); x.moveTo(-w / 2, 0); x.lineTo(-w / 2 + 1, -h * .8); x.lineTo(0, -h); x.lineTo(w / 2 - 1, -h * .8); x.lineTo(w / 2, 0); x.closePath();
        const g = x.createLinearGradient(-w / 2, 0, w / 2, 0); g.addColorStop(0, c0); g.addColorStop(.5, c1); g.addColorStop(1, ice ? '#4E9CBC' : '#C9B48A');
        x.fillStyle = g; x.globalAlpha = ice ? .9 : 1; x.fill(); x.globalAlpha = 1; x.strokeStyle = ink; x.lineWidth = 1.6; x.stroke();
        x.strokeStyle = 'rgba(255,255,255,.8)'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(-w * .2, -4); x.lineTo(-w * .1, -h * .75); x.stroke();
        x.restore();
      }
      if (ice) { x.fillStyle = 'rgba(255,255,255,.85)'; x.beginPath(); x.ellipse(cx, base - 2, 24, 4, 0, 0, TAU); x.fill(); }
    } else {
      // crumpled sheets of paper piled up, with ink on them
      for (const [ox, oy, r] of [[-12, -14, 15], [10, -12, 14], [0, -32, 14], [-16, -36, 10], [16, -34, 10]]) {
        const pts = []; for (let k = 0; k < 9; k++) { const a = k / 9 * TAU, q = r * (.8 + R() * .3); pts.push([cx + ox + Math.cos(a) * q, base + oy + Math.sin(a) * q * .85]); }
        x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.closePath();
        x.fillStyle = COL.paper; x.fill(); x.strokeStyle = ink; x.lineWidth = 1.6; x.stroke();
        x.strokeStyle = 'rgba(37,53,111,.45)'; x.lineWidth = 1; for (let k = 0; k < 3; k++) { x.beginPath(); x.moveTo(cx + ox - r * .5, base + oy - r * .3 + k * 5); x.lineTo(cx + ox + r * (.1 + R() * .4), base + oy - r * .3 + k * 5 + (R() - .5) * 3); x.stroke(); }
        x.strokeStyle = 'rgba(20,27,64,.25)'; x.beginPath(); x.moveTo(cx + ox, base + oy - r * .7); x.lineTo(cx + ox + 3, base + oy); x.lineTo(cx + ox - 2, base + oy + r * .5); x.stroke();
      }
      x.fillStyle = COL.pink; x.beginPath(); x.arc(cx + 6, base - 24, 2.4, 0, TAU); x.fill();
    }
  });
}

/* ---------- lever: a stone post, the handle moves ---------- */
function leverBase() {
  return propSpr('leverbase', 44, 40, x => {
    const ink = COL.ink, cx = 22, base = 36;
    x.fillStyle = '#9EA4B4'; x.beginPath(); x.moveTo(cx - 16, base); x.lineTo(cx - 12, base - 22); x.lineTo(cx + 12, base - 22); x.lineTo(cx + 16, base); x.closePath(); x.fill(); x.strokeStyle = ink; x.lineWidth = 2; x.stroke();
    x.fillStyle = '#C9CCD4'; x.beginPath(); x.ellipse(cx, base - 22, 12, 4.5, 0, 0, TAU); x.fill(); x.stroke();
    x.fillStyle = '#2A2E3A'; x.beginPath(); x.roundRect(cx - 2.5, base - 26, 5, 8, 2); x.fill();
    x.fillStyle = 'rgba(20,27,64,.25)'; x.beginPath(); x.moveTo(cx + 4, base - 20); x.lineTo(cx + 16, base); x.lineTo(cx + 6, base); x.fill();
    x.strokeStyle = '#7C808C'; x.lineWidth = 1.4; x.beginPath(); x.moveTo(cx - 5, base - 12); x.lineTo(cx, base - 7); x.lineTo(cx + 5, base - 12); x.stroke();
  });
}

/* ---------- pots: three shapes, three glazes ---------- */
function potSpr(v, glaze) {
  return propSpr('pot' + v + '_' + glaze, 36, 44, x => {
    const ink = COL.ink, cx = 18, base = 40;
    const [c0, c1, band] = [['#E0905A', '#A8582E', '#F4E2C0'], ['#7CA8D8', '#3F5E9C', '#F4F1EA'], ['#EDE0BE', '#B8A47A', '#C2416E']][glaze];
    const body = () => {
      x.beginPath();
      if (v === 0) { x.moveTo(cx - 5, base - 30); x.lineTo(cx - 5, base - 26); x.bezierCurveTo(cx - 17, base - 22, cx - 16, base - 2, cx - 8, base); x.lineTo(cx + 8, base); x.bezierCurveTo(cx + 16, base - 2, cx + 17, base - 22, cx + 5, base - 26); x.lineTo(cx + 5, base - 30); }
      else if (v === 1) { x.moveTo(cx - 4, base - 38); x.lineTo(cx - 4, base - 32); x.bezierCurveTo(cx - 14, base - 28, cx - 12, base - 8, cx - 3, base); x.lineTo(cx + 3, base); x.bezierCurveTo(cx + 12, base - 8, cx + 14, base - 28, cx + 4, base - 32); x.lineTo(cx + 4, base - 38); }
      else { x.moveTo(cx - 12, base - 18); x.bezierCurveTo(cx - 17, base - 10, cx - 14, base, cx - 8, base); x.lineTo(cx + 8, base); x.bezierCurveTo(cx + 14, base, cx + 17, base - 10, cx + 12, base - 18); }
      x.closePath();
    };
    body(); const g = x.createLinearGradient(cx - 14, 0, cx + 14, 0); g.addColorStop(0, c0); g.addColorStop(.35, c0); g.addColorStop(1, c1); x.fillStyle = g; x.fill();
    x.save(); body(); x.clip(); x.fillStyle = band; x.fillRect(0, base - (v === 2 ? 12 : 18), 40, 3); x.fillStyle = 'rgba(20,27,64,.18)'; for (let k = 0; k < 6; k++) x.fillRect(cx - 10 + k * 4, base - (v === 2 ? 11 : 17), 2, 1); x.fillStyle = 'rgba(255,255,255,.4)'; x.beginPath(); x.ellipse(cx - 6, base - (v === 1 ? 22 : 16), 2.6, 6, -.2, 0, TAU); x.fill(); x.restore();
    body(); x.strokeStyle = ink; x.lineWidth = 1.8; x.stroke();
    // rim or lid
    if (v === 2) { x.fillStyle = c1; x.beginPath(); x.ellipse(cx, base - 18, 12, 3.4, 0, 0, TAU); x.fill(); x.stroke(); x.fillStyle = c0; x.beginPath(); x.arc(cx, base - 21, 2.6, 0, TAU); x.fill(); x.stroke(); }
    else { const ry = v === 1 ? base - 38 : base - 30; x.fillStyle = c1; x.beginPath(); x.ellipse(cx, ry, 6.5, 2.2, 0, 0, TAU); x.fill(); x.stroke(); x.fillStyle = '#2A1A10'; x.beginPath(); x.ellipse(cx, ry, 4, 1.2, 0, 0, TAU); x.fill(); }
    if (v === 1) { x.strokeStyle = ink; x.lineWidth = 2; x.beginPath(); x.arc(cx - 7, base - 30, 3.4, Math.PI * .5, Math.PI * 1.5); x.moveTo(cx + 7, base - 33.4); x.arc(cx + 7, base - 30, 3.4, -Math.PI * .5, Math.PI * .5); x.stroke(); }
  });
}

/* ---------- signs ---------- */
function signSpr(v) {
  return propSpr('sign' + v, 52, 56, x => {
    const ink = COL.ink, cx = 26, base = 52;
    wood(x, cx - 3, base - 34, 6, 34, '#8A6440', '#5A3E28'); x.strokeStyle = ink; x.lineWidth = 1.6; x.strokeRect(cx - 3, base - 34, 6, 34);
    if (v === 0) {
      // a plank board with two nails
      wood(x, cx - 20, base - 46, 40, 20, '#E0B57A', '#B9894F'); x.strokeStyle = ink; x.lineWidth = 2; x.strokeRect(cx - 20, base - 46, 40, 20);
      x.strokeStyle = 'rgba(80,45,20,.4)'; x.lineWidth = 1; x.beginPath(); x.moveTo(cx - 20, base - 36); x.lineTo(cx + 20, base - 36); x.stroke();
      x.strokeStyle = 'rgba(20,27,64,.55)'; x.lineWidth = 1.4; x.beginPath(); x.moveTo(cx - 14, base - 41); x.lineTo(cx + 10, base - 41); x.moveTo(cx - 14, base - 31); x.lineTo(cx + 4, base - 31); x.stroke();
      x.fillStyle = '#5E6474'; for (const nx of [cx - 17, cx + 17]) { x.beginPath(); x.arc(nx, base - 43, 1.2, 0, TAU); x.fill(); }
    } else {
      // two arrow boards pointing different ways
      const arrow = (y0, dir, c) => { x.fillStyle = c; x.beginPath(); if (dir > 0) { x.moveTo(cx - 16, y0); x.lineTo(cx + 12, y0); x.lineTo(cx + 20, y0 + 6); x.lineTo(cx + 12, y0 + 12); x.lineTo(cx - 16, y0 + 12); } else { x.moveTo(cx + 16, y0); x.lineTo(cx - 12, y0); x.lineTo(cx - 20, y0 + 6); x.lineTo(cx - 12, y0 + 12); x.lineTo(cx + 16, y0 + 12); } x.closePath(); x.fill(); x.strokeStyle = ink; x.lineWidth = 1.8; x.stroke(); x.strokeStyle = 'rgba(20,27,64,.5)'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(cx - 9, y0 + 6); x.lineTo(cx + 9, y0 + 6); x.stroke(); };
      arrow(base - 50, 1, '#E0B57A'); arrow(base - 35, -1, '#D9A86A');
    }
    x.fillStyle = 'rgba(20,27,64,.2)'; x.beginPath(); x.ellipse(cx, base - 1, 10, 2.4, 0, 0, TAU); x.fill();
  });
}
function boardSpr() {
  return propSpr('board', 60, 64, x => {
    const ink = COL.ink, cx = 30, base = 60;
    for (const px of [cx - 22, cx + 18]) { wood(x, px, base - 52, 5, 52, '#8A6440', '#5A3E28'); x.strokeStyle = ink; x.lineWidth = 1.6; x.strokeRect(px, base - 52, 5, 52); }
    // a little roof
    x.fillStyle = '#9C4040'; x.beginPath(); x.moveTo(cx - 28, base - 48); x.lineTo(cx, base - 60); x.lineTo(cx + 28, base - 48); x.closePath(); x.fill(); x.strokeStyle = ink; x.lineWidth = 1.8; x.stroke();
    wood(x, cx - 22, base - 46, 44, 28, '#C98A48', '#9C6A38'); x.strokeRect(cx - 22, base - 46, 44, 28);
    // papers pinned up
    for (const [px, py, w, h, a] of [[cx - 18, base - 43, 12, 14, -.08], [cx - 3, base - 44, 13, 11, .06], [cx + 8, base - 40, 10, 15, -.04], [cx - 12, base - 29, 14, 9, .05]]) {
      x.save(); x.translate(px + w / 2, py + h / 2); x.rotate(a); x.fillStyle = COL.paper; x.fillRect(-w / 2, -h / 2, w, h); x.strokeStyle = 'rgba(20,27,64,.5)'; x.lineWidth = .8; x.strokeRect(-w / 2, -h / 2, w, h);
      for (let k = 0; k < 3; k++) { x.beginPath(); x.moveTo(-w / 2 + 2, -h / 2 + 3 + k * 3); x.lineTo(w / 2 - 3, -h / 2 + 3 + k * 3); x.stroke(); }
      x.fillStyle = COL.pink; x.beginPath(); x.arc(0, -h / 2 + 1, 1.2, 0, TAU); x.fill(); x.restore();
    }
  });
}
function torchSpr() {
  return propSpr('torch', 40, 70, x => {
    const ink = COL.ink, cx = 20, base = 66;
    // stone footing, a wrapped wooden pole, an iron basket on top
    x.fillStyle = '#8C93A3'; x.beginPath(); x.moveTo(cx - 10, base); x.lineTo(cx - 7, base - 8); x.lineTo(cx + 7, base - 8); x.lineTo(cx + 10, base); x.closePath(); x.fill(); x.strokeStyle = ink; x.lineWidth = 1.6; x.stroke();
    wood(x, cx - 3, base - 46, 6, 40, '#8A6440', '#5A3E28'); x.strokeRect(cx - 3, base - 46, 6, 40);
    x.strokeStyle = '#C9B48A'; x.lineWidth = 1.4; for (let k = 0; k < 4; k++) { x.beginPath(); x.moveTo(cx - 3, base - 30 - k * 3); x.lineTo(cx + 3, base - 28 - k * 3); x.stroke(); }
    x.strokeStyle = '#3E4250'; x.lineWidth = 2; x.beginPath(); x.moveTo(cx - 9, base - 56); x.lineTo(cx - 4, base - 46); x.lineTo(cx + 4, base - 46); x.lineTo(cx + 9, base - 56); x.moveTo(cx - 9, base - 56); x.lineTo(cx + 9, base - 56); x.moveTo(cx - 3, base - 56); x.lineTo(cx - 2, base - 46); x.moveTo(cx + 3, base - 56); x.lineTo(cx + 2, base - 46); x.stroke();
    x.fillStyle = '#2A2228'; x.beginPath(); x.ellipse(cx, base - 54, 8, 2.4, 0, 0, TAU); x.fill();
  });
}

/* ---------- drawing them ---------- */
function drawProp(e, now) {
  const x = e.x, y = e.y, S = SAVE.story, hv = pHash(e);
  switch (e.k) {
    case 'chest': {
      const open = S.opened[e.o.id], locked = e.o.g && !gSolved(e.o.g);
      groundShadow(x, y + 12, 20);
      standUp(chestSpr(!!open), x, y + 14, 1);
      wu();
      if (!open && !locked) { for (let k = 0; k < 3; k++) { const q = (now * .8 + k / 3) % 1; ctx.globalAlpha = Math.sin(q * Math.PI); ctx.fillStyle = k % 2 ? COL.yellow : COL.white; const sx = x - 14 + k * 14, sy = (y - 14) * TY - q * 18; ctx.beginPath(); ctx.moveTo(sx, sy - 4); ctx.lineTo(sx + 1.2, sy - 1.2); ctx.lineTo(sx + 4, sy); ctx.lineTo(sx + 1.2, sy + 1.2); ctx.lineTo(sx, sy + 4); ctx.lineTo(sx - 1.2, sy + 1.2); ctx.lineTo(sx - 4, sy); ctx.lineTo(sx - 1.2, sy - 1.2); ctx.fill(); } ctx.globalAlpha = 1; }
      if (locked) {
        // chains across the lid
        const yy = (y + 14) * TY; ctx.strokeStyle = '#5E6474'; ctx.lineWidth = 2;
        for (const d of [-1, 1]) for (let k = 0; k < 6; k++) { const t = k / 5, cx2 = x - 20 + t * 40, cy2 = yy - 30 + (d > 0 ? t : 1 - t) * 22; ctx.beginPath(); ctx.ellipse(cx2, cy2, 3.4, 2.2, d * .6, 0, TAU); ctx.stroke(); }
        ctx.fillStyle = '#9EA4B4'; ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.roundRect(x - 5, yy - 22, 10, 9, 2); ctx.fill(); ctx.stroke();
      }
      return true;
    }
    case 'box': {
      if (e.mt !== undefined && e.mt < 1) e.mt = Math.min(1, e.mt + .2);
      const k = e.mt === undefined ? 1 : ease(e.mt), bx = e.ax !== undefined ? lerp(e.ax, e.x, k) : x, by = e.ay !== undefined ? lerp(e.ay, e.y, k) : y;
      groundShadow(bx, by + 16, 24);
      standUp(blockSpr(WD.reg), bx, by + 20, 1);
      return true;
    }
    case 'barrier': {
      if (gSolved(e.o.g)) {
        wt(); ctx.fillStyle = 'rgba(37,53,111,.22)';
        for (let k = 0; k < 6; k++) { const a = k * 1.7 + hv * 6; ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * 14, y + 6 + Math.sin(a) * 8, 4 + (k % 3), 2.5, a, 0, TAU); ctx.fill(); }
        return true;
      }
      groundShadow(x, y + 14, 26);
      standUp(blockerSpr(WD.reg, Math.floor(hv * 3)), x, y + 18, .95 + hv * .15, hv > .5);
      return true;
    }
    case 'lever': {
      const open = gSolved(e.o.g), a = open ? .75 : -.75;
      groundShadow(x, y + 10, 16);
      standUp(leverBase(), x, y + 14, 1);
      wu(); const px = x, py = (y + 14) * TY - 26, hx = px + Math.sin(a) * 24, hy = py - Math.cos(a) * 24;
      ctx.lineCap = 'round'; ctx.strokeStyle = COL.ink; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(hx, hy); ctx.stroke();
      ctx.strokeStyle = '#8A6440'; ctx.lineWidth = 3.6; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(hx, hy); ctx.stroke();
      ctx.fillStyle = open ? COL.teal : COL.pink; ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.arc(hx, hy, 5.5, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.arc(hx - 1.6, hy - 1.6, 1.6, 0, TAU); ctx.fill();
      if (!open) { ctx.globalAlpha = .35 + Math.sin(now * 4) * .25; ctx.fillStyle = COL.yellow; ctx.beginPath(); ctx.arc(hx, hy, 10, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; }
      if (!open && !IS_PC && Math.hypot(P.x - x, P.y - y) < TL * 3) label(x, y - 46, L('지렛대'));
      return true;
    }
    case 'pot': {
      if (e.broken) {
        wt(); const c = ['#C97B4A', '#5E82BC', '#D9C7A6'][Math.floor(hv * 3)];
        for (let k = 0; k < 5; k++) { const a = k * 1.3 + hv * 5; ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * 10, y + 8 + Math.sin(a) * 5); ctx.lineTo(x + Math.cos(a) * 10 + 5, y + 9 + Math.sin(a) * 5); ctx.lineTo(x + Math.cos(a) * 10 + 2, y + 12 + Math.sin(a) * 5); ctx.fill(); }
        return true;
      }
      const v = Math.floor(hv * 3), gl = Math.floor((hv * 7) % 1 * 3), sc = .85 + ((hv * 13) % 1) * .35;
      groundShadow(x, y + 12, 12 * sc);
      standUp(potSpr(v, gl), x + (hv - .5) * 8, y + 14, sc, hv > .6);
      return true;
    }
    case 'sign': {
      const sc = .9 + hv * .2;
      groundShadow(x, y + 14, 12);
      standUp(signSpr(Math.floor(hv * 2)), x, y + 16, sc, hv > .7);
      return true;
    }
    case 'board': {
      groundShadow(x, y + 14, 24);
      standUp(boardSpr(), x, y + 16, 1);
      if (S.bounty && S.bounty.done) { wu(); ctx.fillStyle = COL.yellow; ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(x + 20, (y + 16) * TY - 60 + Math.sin(now * 4) * 2, 6, 0, TAU); ctx.fill(); ctx.stroke(); }
      return true;
    }
    case 'torch': {
      const lit = S.lit[WD.id + ':' + e.tx + ',' + e.ty];
      groundShadow(x, y + 14, 12);
      standUp(torchSpr(), x, y + 16, 1);
      wu(); const fx = x, fy = (y + 16) * TY - 56;
      if (lit) {
        const f = 1 + Math.sin(now * 13 + e.t) * .08 + Math.sin(now * 23 + e.t) * .05, sway = Math.sin(now * 3 + e.t) * 2;
        ctx.globalAlpha = .3; spr(SP.glow, x, y - 30, 150, 150); wu(); ctx.globalAlpha = 1;
        const flame = (s, c, dy) => { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(fx - 7 * s, fy + dy); ctx.bezierCurveTo(fx - 9 * s, fy - 8 * s + dy, fx - 2 * s + sway * .5, fy - 14 * s + dy, fx + sway, fy - 24 * s * f + dy); ctx.bezierCurveTo(fx + 3 * s + sway * .5, fy - 14 * s + dy, fx + 9 * s, fy - 8 * s + dy, fx + 7 * s, fy + dy); ctx.closePath(); ctx.fill(); };
        flame(1.15, COL.pink, 0); flame(.85, '#FF9A3F', 0); flame(.6, COL.yellow, -1); flame(.3, '#FFF8D8', -2);
        for (let k = 0; k < 4; k++) { const q = (now * 1.2 + k * .25 + e.t) % 1; ctx.globalAlpha = 1 - q; ctx.fillStyle = k % 2 ? COL.yellow : COL.pink; ctx.fillRect(fx + Math.sin(now * 4 + k * 2) * 6, fy - 20 - q * 34, 2.2, 2.2); }
        ctx.globalAlpha = 1;
      } else {
        // cold: a little smoke curling from the basket
        ctx.fillStyle = '#4A4038'; ctx.beginPath(); ctx.ellipse(fx, fy, 6, 2.4, 0, 0, TAU); ctx.fill();
        for (let k = 0; k < 3; k++) { const q = (now * .4 + k / 3) % 1; ctx.globalAlpha = .35 * (1 - q); ctx.fillStyle = '#9EA4B4'; ctx.beginPath(); ctx.arc(fx + Math.sin(q * 6 + k) * 4, fy - 4 - q * 26, 3 + q * 4, 0, TAU); ctx.fill(); }
        ctx.globalAlpha = 1;
      }
      return true;
    }
  }
  return false;
}

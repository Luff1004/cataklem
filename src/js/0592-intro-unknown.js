/* ================= UNKNOWN's entrance: scribble takes the page, then gathers into a shape ================= */
function newScribble() {
  const pts = []; let x = rnd(-20, W + 20), y = rnd(-20, H * .8), h = rnd(TAU);
  pts.push(x, y);
  for (let s = 0; s < 16; s++) { h += rnd(-1.3, 1.3); x += Math.cos(h) * rnd(12, 26); y += Math.sin(h) * rnd(12, 26); pts.push(x, y); }
  return { pts, w: rnd(1.5, 4.5), pink: Math.random() < .12, born: G.introT };
}
INTRO.unknown = {
  dur: 14, focus: 1.2, card: 8.9, back: 12.9, zoom: .82,
  setup(b) { b.introScale = 0; IFX.strokes = []; IFX.letters = 0; IFX.acc = 0; AU.track = 'silent'; },
  tick(t, b, dt) {
    if (t > 1.1 && t < 5) {
      IFX.acc += dt * (1.5 + (t - 1.1) * 9);
      while (IFX.acc >= 1) { IFX.acc--; IFX.strokes.push(newScribble()); if (gate('scr', 110)) SFX.scratch(); }
      G.shake = Math.max(G.shake, (t - 1.1) * 1.3);
    }
    if (at(1.1) || at(2.6) || at(3.9)) SFX.whisper();
    if (at(3.4)) pulseScreen(1);
    if (at(4.4)) pulseScreen(1.4);
    if (at(5)) { SFX.charge(1.3); SFX.rumble(); }
    if (at(6.3)) {
      introEmerge(b, 1.8); pulseScreen(2.4); shake(26); uGrowTents(b, 2);
      AU.track = 'unknown'; AU.uPhase = 1; G.flash = .5;
      for (let k = 0; k < 70; k++) { const a = rnd(TAU), sp = rnd(200, 700); PT.push({ x: b.x, y: b.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: rnd(.5, 1.2), max: 1.2, s: rnd(3, 9), c: k % 5 ? COL.deep : COL.pink, dead: false }); }
    }
    if (t > 6.9 && t < 8.9) {
      const n = Math.min(7, Math.floor((t - 6.9) / .26) + 1);
      if (n > IFX.letters) { IFX.letters = n; SFX.clank(); SFX.thud(); pulseScreen(.7); shake(6); }
    }
    for (const tn of b.tents || []) { tn.a += tn.rot * dt; tn.len = lerp(tn.len, tn.want, 1 - Math.exp(-dt * 3)); }
  },
  drawTop(t, b) {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const tx = (b.x * K + OX) / DPR, ty = (b.y * K + OY) / DPR, q = ease(clamp((t - 5) / 1.25, 0, 1));
    if (t < 6.5) for (const s of IFX.strokes) {
      const grow = clamp((t - s.born) / .5, 0, 1), n = Math.max(2, Math.floor(s.pts.length / 2 * grow));
      ctx.globalAlpha = (1 - q * .9); ctx.strokeStyle = s.pink ? COL.pink : COL.deep; ctx.lineWidth = s.w * (1 - q * .6);
      ctx.beginPath();
      for (let i = 0; i < n; i++) { const x = lerp(s.pts[i * 2], tx, q) + rnd(-1.6, 1.6), y = lerp(s.pts[i * 2 + 1], ty, q) + rnd(-1.6, 1.6); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    if (IFX.letters > 0 && t < 9.1) {
      const word = 'UNKNOWN'.slice(0, IFX.letters), sz = Math.min(W * .17, 76);
      ctx.font = '400 ' + sz.toFixed(0) + 'px "Gasoek One", "Dela Gothic One", "ZCOOL QingKe HuangYou", "Arial Black", sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      const full = ctx.measureText('UNKNOWN').width; let x = W / 2 - full / 2;
      const y = H * .3, fade = t > 8.6 ? 1 - (t - 8.6) / .5 : 1;
      ctx.globalAlpha = Math.max(0, fade);
      for (const ch of word) {
        const jx = rnd(-2.5, 2.5), jy = rnd(-2.5, 2.5), w = ctx.measureText(ch).width;
        ctx.fillStyle = COL.pink; ctx.fillText(ch, x + 4 + jx, y + 3 + jy);
        ctx.fillStyle = COL.deep; ctx.fillText(ch, x + jx * .3, y + jy * .3);
        x += w;
      }
      ctx.globalAlpha = 1;
    }
  },
  finish(b) { IFX.strokes = []; AU.track = 'unknown'; AU.uPhase = 1; uGrowTents(b, 2); },
};

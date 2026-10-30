/* ================= entrances for the deep gates ================= */
Object.assign(INTRO, {
  judge: {
    dur: 9.6, focus: 1, card: 4.9, back: 8.6, zoom: .72,
    setup(b) { b.introScale = 0; IFX.hands = 0; IFX.spin = 0; IFX.frozen = 0; },
    tick(t, b, dt) {
      if (t < 3.4) {
        IFX.spin += dt * (1 + t * t * 2.2); IFX.hands = IFX.spin;
        IFX.tickT = (IFX.tickT || 0) - dt;
        if (IFX.tickT <= 0) { IFX.tickT = Math.max(.06, .5 - t * .14); SFX.tick(); shake(1 + t); }
      }
      if (at(3.4)) { IFX.hands = Math.ceil(IFX.hands / TAU) * TAU; IFX.frozen = 1; SFX.bell(); SFX.thud(); pulseScreen(2); G.flash = .5; shake(16); buzz([80, 40, 80]); }
      if (at(4.6)) { IFX.frozen = 0; introEmerge(b, 1.3); slamFx(b, 140); SFX.bell(); }
    },
    draw(t, b) {
      const R = ARENA_R; wt();
      const glow = IFX.frozen ? 1 : Math.min(1, t / 3);
      for (let k = 0; k < 12; k++) { const a = -Math.PI / 2 + k / 12 * TAU; glowLine(Math.cos(a) * (R - 70), Math.sin(a) * (R - 70), Math.cos(a) * (R - 20), Math.sin(a) * (R - 20), 16, COL.yellow, .5 * glow); }
      if (t < 4.6) {
        const h = IFX.hands, m = h * 12;
        for (const [a, len, w, col] of [[h / 12 - Math.PI / 2, R * .55, 18, COL.ink], [m - Math.PI / 2, R * .9, 9, COL.pink]]) {
          const x2 = Math.cos(a) * len, y2 = Math.sin(a) * len;
          glowLine(0, 0, x2, y2, w * 2.4, COL.yellow, .35);
          strokeRiso(w, () => { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(x2, y2); }, col, COL.deep);
        }
      }
      if (IFX.frozen) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = .25; ctx.fillStyle = '#8890A8'; ctx.fillRect(0, 0, cv.width, cv.height); ctx.globalAlpha = 1; }
    },
  },
  root: {
    dur: 10.2, focus: 1, card: 4.8, back: 9.2, zoom: .7,
    setup(b) {
      b.introScale = 0; IFX.roots = [];
      for (let i = 0; i < 14; i++) {
        const a = i / 14 * TAU + rnd(-.1, .1), pts = []; let x = Math.cos(a) * ARENA_R, y = Math.sin(a) * ARENA_R, ang = a + Math.PI;
        pts.push([x, y]); for (let s = 0; s < 12; s++) { ang += rnd(-.35, .35); x += Math.cos(ang) * 28; y += Math.sin(ang) * 28; pts.push([x, y]); }
        IFX.roots.push({ pts, t0: .2 + rnd(0, 1.2) });
      }
      IFX.flowers = [];
    },
    tick(t, b) {
      if (t < 4.4) G.shake = Math.max(G.shake, 1 + t * 1.8);
      if (at(.4) || at(1.4) || at(2.4)) SFX.rumble();
      if (t > 3.2 && t < 3.9 && Math.random() < .5) { const a = rnd(TAU), r = rnd(150, 330); IFX.flowers.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, t0: t }); burst(Math.cos(a) * r, Math.sin(a) * r, 6, COL.pink, 160); if (gate('fl', 60)) SFX.bellSmall(); }
      if (at(4.4)) {
        introEmerge(b, 1.4); slamFx(b, 170); pulseScreen(2);
        for (let k = 0; k < 90; k++) { const a = rnd(TAU), sp = rnd(120, 520); PT.push({ x: b.x, y: b.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 100, life: rnd(.8, 1.6), max: 1.6, s: rnd(4, 9), c: k % 3 ? COL.pink : COL.teal, dead: false }); }
      }
      if (t > 4.4 && t < 6 && Math.random() < .8) { const a = rnd(TAU), r = rnd(40, 360); PT.push({ x: b.x + Math.cos(a) * r, y: b.y + Math.sin(a) * r, vx: -Math.sin(a) * 200, vy: Math.cos(a) * 200, life: .8, max: .8, s: rnd(3, 6), c: COL.pink, dead: false }); }
    },
    draw(t) {
      wt();
      for (const r of IFX.roots) {
        const q = clamp((t - r.t0) / 2, 0, 1), n = Math.max(1, Math.floor(r.pts.length * q));
        if (q <= 0) continue;
        for (const [col, lw, o] of [[COL.teal, 9, 2], [COL.deep, 6, 0]]) { ctx.globalAlpha = .9; ctx.strokeStyle = col; ctx.lineWidth = lw * (1.2 - q * .3); ctx.lineCap = 'round'; ctx.beginPath(); for (let i = 0; i < n; i++) { const p = r.pts[i]; i ? ctx.lineTo(p[0] + o, p[1] + o) : ctx.moveTo(p[0] + o, p[1] + o); } ctx.stroke(); }
      }
      for (const f of IFX.flowers) { const s = Math.min(1, (t - f.t0) / .3) * 22; ctx.globalAlpha = 1; spr(SPR.sprout.img, f.x, f.y, s * 2, s * 2, t); }
      ctx.globalAlpha = 1;
    },
  },
  sky: {
    dur: 12.6, focus: 1.3, card: 6.8, back: 11.5, zoom: .62,
    setup(b) { b.introScale = 0; G.dark = 0; G.bossHole = 0; IFX.ghosts = ['bell', 'loom', 'twinA', 'tide', 'sun', 'judge', 'root'].map((k, i) => ({ k, a: -Math.PI / 2 + i / 7 * TAU, t0: .6 + i * .42 })); },
    tick(t, b, dt) {
      G.dark = lerp(G.dark, t < 6.4 ? .92 : 0, 1 - Math.exp(-dt * (t < 6.4 ? 2 : 8)));
      G.bossHole = t < 5.2 ? 0 : 40 + (t - 5.2) * 160;
      for (const g of IFX.ghosts) if (at(g.t0)) { SFX.bellSmall(); SFX.thud(); pulseScreen(.6); shake(4); }
      if (at(3.8)) { SFX.rumble(); SFX.rumble(); }
      if (t > 3.8 && t < 6.4) G.shake = Math.max(G.shake, 3 + (t - 3.8) * 4);
      if (t > 5.2 && t < 6.4) for (let k = 0; k < 3; k++) PT.push({ x: b.x + rnd(-400, 400), y: b.y - rnd(300, 600), vx: rnd(-40, 40), vy: rnd(500, 900), life: 1, max: 1, s: rnd(4, 10), c: k % 2 ? COL.deep : COL.yellow, dead: false });
      if (at(5.4)) SFX.charge(1);
      if (at(6.4)) {
        G.novaFx = { x: b.x, y: b.y, t0: performance.now(), rot: rnd(TAU) };
        introEmerge(b, 2); G.dark = 0; pulseScreen(2.2); SFX.nova(); SFX.evo(); SFX.roar(); shake(36); buzz([120, 50, 300]);
      }
    },
    drawTop(t, b) {
      for (const g of IFX.ghosts) {
        const q = t - g.t0; if (q < 0 || q > 2.6) continue;
        const a = q < .3 ? q / .3 : Math.max(0, 1 - (q - .3) / 2.3), S = SPR[g.k], x = Math.cos(g.a) * 250, y = b.y + Math.sin(g.a) * 250;
        ctx.globalAlpha = a * .75; spr(S.flash, x, y, S.size * 1.1, S.size * 1.1);
        ctx.globalAlpha = a * .5; spr(S.img, x, y - q * 20, S.size, S.size);
      }
      ctx.globalAlpha = 1;
      if (t > 3.8 && t < 6.6) {
        const q = clamp((t - 3.8) / 2.2, 0, 1), cx = W / 2, cy = H * .35, R = mulberry(5);
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.lineCap = 'round';
        for (let k = 0; k < 12; k++) {
          let a = k / 12 * TAU + R() * .3, px = cx, py = cy; const L = (60 + R() * 300) * q;
          ctx.beginPath(); ctx.moveTo(px, py);
          for (let s = 0; s < 6; s++) { a += (R() - .5) * .7; px += Math.cos(a) * L / 6; py += Math.sin(a) * L / 6; ctx.lineTo(px, py); }
          ctx.globalAlpha = .9; ctx.strokeStyle = COL.yellow; ctx.lineWidth = 6 * q + 1; ctx.stroke();
          ctx.strokeStyle = COL.white; ctx.lineWidth = 2; ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
      if (t > 5.4 && t < 6.4) drawSunRays(b.x, b.y, (t - 5.4), 64);
    },
    finish() { G.dark = 0; G.bossHole = undefined; },
  },
});

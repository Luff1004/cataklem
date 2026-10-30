/* ================= boss entrances: one script per gate, grander the deeper you go ================= */
const ease = v => v * v * (3 - 2 * v);
let IFX = {};
function at(tm) { return G.introPrev < tm && G.introT >= tm; }
function introBodies() { return G.gate.id === 'twins' ? G.twins : [G.boss]; }

function slamFx(b, r) {
  DC.push({ x: b.x, y: b.y, s: r * 2.4, rot: rnd(TAU), img: SP.crack, life: 30, a: .75, dead: false });
  splat(b.x, b.y, r * 1.6, false);
  for (let s = 0; s < 40; s++) { const a = rnd(TAU), sp = rnd(150, 520); PT.push({ x: b.x, y: b.y + b.r * .5, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .6 - 140, life: rnd(.6, 1.1), max: 1.1, s: rnd(3, 8), c: s % 3 ? COL.deep : COL.paper2, dead: false }); }
  ringFx(b.x, b.y, r * 1.8, COL.ink, .55, 12); ringFx(b.x, b.y, r, COL.pink, .4, 7);
  shake(22); pulseScreen(1.5); SFX.boom(true); buzz([60, 30, 120]);
}
function introEmerge(b, power = 1) {
  ringFx(b.x, b.y, 230 * power, COL.pink, .6, 12); ringFx(b.x, b.y, 140 * power, COL.ink, .5, 8);
  burst(b.x, b.y, 30 * power, COL.deep, 420); burst(b.x, b.y, 20 * power, COL.yellow, 320);
  splat(b.x, b.y, 170 * power, false);
  G.flash = Math.max(G.flash, .45 * power); shake(14 * power); SFX.roar(); buzz([50, 30, 140]);
  b.popT = G.introT; b.introScale = 1;
}
function drawSunRays(x, y, p, n = 48) {
  const now = performance.now() / 1000;
  wt(); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'butt';
  for (let i = 0; i < n; i++) {
    const a = now * .25 + i / n * TAU, L = rayLen(x, y, a, 200 + 1000 * p);
    ctx.globalAlpha = (.05 + p * .25) * (.6 + .4 * Math.sin(now * 22 + i * 2.7));
    ctx.strokeStyle = i % 3 ? COL.yellow : COL.pink; ctx.lineWidth = 3 + p * 18;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); ctx.stroke();
  }
  const gr = 30 + p * 170, g = ctx.createRadialGradient(x, y, 0, x, y, gr);
  g.addColorStop(0, 'rgba(255,255,240,' + (.4 + p * .6) + ')'); g.addColorStop(1, 'rgba(255,210,63,0)');
  ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(x - gr, y - gr, gr * 2, gr * 2);
  ctx.restore();
}

const INTRO = {
  bell: {
    dur: 5.4, focus: 1, card: 2.3, back: 4.6,
    setup(b) { b.introScale = 0; },
    tick(t, b) {
      [.45, 1, 1.55].forEach((tm, i) => { if (at(tm)) { SFX.bell(); pulseScreen(.7 + i * .35); shake(5 + i * 4); ringFx(b.x, b.y, 260 + i * 90, i % 2 ? COL.pink : COL.ink, .8, 9); ringFx(b.x, b.y, 140, COL.white, .5, 5); } });
      if (t < 2) for (let k = 0; k < 2; k++) PT.push({ x: b.x + rnd(-260, 260), y: b.y - rnd(120, 380), vx: rnd(-10, 10), vy: rnd(60, 140), life: 1.2, max: 1.2, s: rnd(1.5, 3), c: COL.ink, dead: false });
      if (at(2)) { b.introScale = 1; b.popT = t; slamFx(b, 150); SFX.bell(); SFX.roar(); }
    },
    draw(t, b) {
      if (t >= 2) return;
      const k = clamp((t - .8) / 1.2, 0, 1);
      ctx.globalAlpha = .25 + k * .65; spr(SP.shadow, b.x, b.y + b.r * .5, b.r * (.8 + k * 2.2), b.r * (.3 + k * .8)); ctx.globalAlpha = 1;
      if (t > 1.6) { const q = (t - 1.6) / .4, s = SPR.bell.size * (1.7 - q * .7); spr(SPR.bell.img, b.x, b.y - 520 * (1 - q * q), s, s); }
    },
  },
  loom: {
    dur: 5.9, focus: .9, card: 2.6, back: 5.1, zoom: .85,
    setup(b) { b.introScale = 0; b.y0 = b.y; IFX.lines = []; },
    tick(t, b) {
      for (let i = 0; i < 8; i++) { const tm = .25 + i * .14; if (at(tm)) { const a = i / 8 * TAU + rnd(-.2, .2); IFX.lines.push({ x: Math.cos(a) * ARENA_R, y: Math.sin(a) * ARENA_R, t0: tm }); SFX.thread(); shake(2); } }
      if (t >= 1.5 && t < 2.3) { b.introScale = 1; b.y = lerp(b.y0 - ARENA_R - 280, b.y0, ease((t - 1.5) / .8)); }
      if (at(2.3)) { b.y = b.y0; introEmerge(b, .8); pulseScreen(1); SFX.thread(); }
    },
    draw(t, b) {
      const tx = 0, ty = b.y0;
      for (const l of IFX.lines) {
        const q = clamp((t - l.t0) / .3, 0, 1), ex = lerp(l.x, tx, q), ey = lerp(l.y, ty, q);
        glowLine(l.x, l.y, ex, ey, 10, COL.yellow, .3);
        strokeRiso(3, () => { ctx.beginPath(); ctx.moveTo(l.x, l.y); ctx.lineTo(ex, ey); }, COL.white, COL.pink);
      }
      if (t >= 1.4) {
        const top = b.y0 - ARENA_R - 500;
        wt(); glowLine(b.x, top, b.x, b.y - b.r * .3, 8, COL.yellow, .35);
        strokeRiso(2.4, () => { ctx.beginPath(); ctx.moveTo(b.x, top); ctx.lineTo(b.x, b.y - b.r * .3); }, COL.white, COL.pink);
      }
    },
  },
  twins: {
    dur: 6.3, focus: .8, card: 2.8, back: 5.5, zoom: .66,
    setup() { for (const w of G.twins) { w.introScale = 1; w.ix = w.x; w.sx = w.x < 0 ? -ARENA_R - 160 : ARENA_R + 160; w.x = w.sx; } },
    tick(t) {
      if (at(.3)) { SFX.zap(); pulseScreen(.6); }
      if (t >= .9 && t < 2.3) for (const w of G.twins) { w.x = lerp(w.sx, w.ix, ease((t - .9) / 1.4)); if (Math.random() < .5) GH.push({ x: w.x, y: w.y, life: .3, max: .3, dead: false }); }
      if (at(1.2)) SFX.swish(); if (at(1.8)) SFX.swish();
      if (at(2.3)) {
        for (const w of G.twins) { w.x = w.ix; ringFx(w.x, w.y, 190, w.twin ? COL.pink : COL.ink, .5, 10); for (let s = 0; s < 26; s++) { const a = rnd(TAU), sp = rnd(160, 480); PT.push({ x: w.x, y: w.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: rnd(.4, .9), max: .9, s: rnd(4, 9), c: s % 3 ? COL.white : COL.pink, dead: false }); } }
        G.flash = .6; shake(18); pulseScreen(1.4); SFX.zap(); SFX.boom(true); SFX.roar(); buzz([40, 30, 140]);
      }
    },
    draw(t) {
      wt();
      const R = ARENA_R, a = clamp(t / .4, 0, 1) * (t > 2.3 ? Math.max(.25, 1 - (t - 2.3) * .6) : 1);
      ctx.globalAlpha = .9 * a; ctx.strokeStyle = COL.ink; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(2, -R); ctx.lineTo(2, R); ctx.stroke();
      ctx.strokeStyle = COL.white; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -R); ctx.lineTo(0, R); ctx.stroke();
      const sy = lerp(-R, R, (t * .9) % 1); glowLine(0, sy - 60, 0, sy + 60, 26, COL.yellow, .5 * a);
      if (t > 2.3) { ctx.globalAlpha = Math.max(0, 1 - (t - 2.3) * .5); ctx.strokeStyle = COL.white; ctx.lineWidth = 2; ctx.beginPath(); for (let k = 0; k < 7; k++) { const yy = -40 + rnd(-6, 6); ctx.moveTo(0, yy); ctx.lineTo(Math.cos(k) * 120, yy + Math.sin(k * 1.7) * 120); } ctx.stroke(); }
      for (const w of G.twins) { const o = G.twins[1 - w.twin], S = SPR[o.type]; ctx.globalAlpha = .22 * a; spr(S.img, -o.x, o.y, S.size, S.size, 0, -1, 1); }
      ctx.globalAlpha = 1;
    },
    finish() { for (const w of G.twins) w.x = w.ix; },
  },
  tide: {
    dur: 6.9, focus: 1, card: 3, back: 5.9, zoom: .7,
    setup(b) { b.introScale = 0; IFX.flood = ARENA_R + 40; },
    tick(t, b) {
      IFX.flood = t < 2.5 ? lerp(ARENA_R + 40, ARENA_R * .42, ease(clamp((t - .2) / 2.2, 0, 1))) : lerp(ARENA_R * .42, ARENA_R + 60, ease(clamp((t - 2.6) / 1.3, 0, 1)));
      if (at(.3) || at(1.2)) SFX.wave(); if (at(1.9)) SFX.rumble();
      if (t < 2.5) {
        G.shake = Math.max(G.shake, 1 + t * 2.5);
        for (let k = 0; k < 3; k++) { const a = rnd(TAU), r = rnd(IFX.flood, ARENA_R); PT.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, vx: 0, vy: -rnd(10, 40), life: .6, max: .6, s: rnd(2, 5), c: COL.white, dead: false }); }
      }
      if (at(2.6)) {
        introEmerge(b, 1.2); pulseScreen(1.6); SFX.wave(); SFX.boom(true);
        for (let s = 0; s < 70; s++) PT.push({ x: b.x + rnd(-30, 30), y: b.y, vx: rnd(-140, 140), vy: -rnd(350, 900), life: rnd(.6, 1.2), max: 1.2, s: rnd(4, 10), c: s % 4 ? COL.deep : COL.white, dead: false });
        for (let s = 0; s < 18; s++) splat(b.x + rnd(-260, 260), b.y + rnd(-200, 260), rnd(30, 70), false);
      }
    },
    draw(t) {
      const fl = IFX.flood; if (fl >= ARENA_R + 30) return;
      const now = performance.now() / 1000; wt();
      ctx.beginPath(); ctx.arc(0, 0, ARENA_R + 80, 0, TAU);
      for (let k = 0; k <= 72; k++) { const a = -k / 72 * TAU, r = fl + Math.sin(a * 7 + now * 4) * 9 + Math.sin(a * 3 - now * 2) * 6; k ? ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
      ctx.closePath(); ctx.globalAlpha = .82; ctx.fillStyle = COL.deep; ctx.fill('evenodd');
      ctx.globalAlpha = .95; ctx.strokeStyle = COL.white; ctx.lineWidth = 3; ctx.beginPath();
      for (let k = 0; k <= 72; k++) { const a = k / 72 * TAU, r = fl + Math.sin(a * 7 + now * 4) * 9 + Math.sin(a * 3 - now * 2) * 6; k ? ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
      ctx.stroke(); ctx.globalAlpha = 1;
    },
    finish() { IFX.flood = ARENA_R + 60; },
  },
  sun: {
    dur: 8.9, focus: 1.2, card: 5.5, back: 7.9, zoom: .78,
    setup(b) { b.introScale = 0; G.dark = 0; G.bossHole = 6; },
    tick(t, b, dt) {
      G.dark = lerp(G.dark, t < 4.9 ? 1 : 0, 1 - Math.exp(-dt * (t < 4.9 ? 2.2 : 9)));
      G.bossHole = t < 1.5 ? 6 : t < 3.6 ? lerp(6, 60, (t - 1.5) / 2.1) : t < 4.9 ? 60 + (t - 3.6) * 110 : 120;
      [1.7, 2.4, 3].forEach(tm => { if (at(tm)) { SFX.thud(); SFX.thud(); shake(9); ringFx(b.x, b.y, 130, COL.yellow, .6, 5); buzz(35); } });
      if (at(3.6)) SFX.charge(1.3);
      if (at(4.9)) {
        G.novaFx = { x: b.x, y: b.y, t0: performance.now(), rot: rnd(TAU) };
        introEmerge(b, 1.6); G.dark = 0; G.darkT = 0; pulseScreen(2); SFX.nova(); SFX.evo(); shake(30);
      }
    },
    draw(t, b) { if (t > 3.6 && t < 4.9) drawSunRays(b.x, b.y, (t - 3.6) / 1.3, 56); },
    finish() { G.dark = 0; G.bossHole = undefined; },
  },
};

/* ---------- the entrance ---------- */
function startIntro() {
  hideAll();
  STATE = 'intro'; G.introT = 0; G.introPrev = 0; IFX = {}; G.camZoom = 1;
  $('hud').hidden = true;
  spawnArenaBoss();
  const g = G.gate, sc = INTRO[g.id], bi = $('bossIntro'), b = G.boss;
  G.ifocus = [g.id === 'twins' ? 0 : b.x, b.y];
  sc.setup(b);
  $('biEye').textContent = (g.id === 'sky' ? '마지막 문' : g.ord) + ' · ' + g.sub;
  const nm = esc(g.name);
  if (g.id === 'sky') $('biName').dataset.big = '1';
  $('biName').innerHTML = '<span class="pk" aria-hidden="true">' + nm + '</span><span class="ik">' + nm + '</span>' + (g.id === 'twins' ? '<span class="mr" aria-hidden="true">' + nm + '</span>' : '');
  $('biLine').textContent = g.line;
  bi.dataset.b = g.id;
  bi.hidden = false; bi.className = '';
  void bi.offsetWidth; bi.className = 'on';
  AU.intensity = 0; SFX.rumble();
}
function drawIntroFx() { if (STATE === 'intro' && G.gate && INTRO[G.gate.id].draw) INTRO[G.gate.id].draw(G.introT, G.boss); }
function drawIntroTop() { if (STATE === 'intro' && G.gate && INTRO[G.gate.id].drawTop) INTRO[G.gate.id].drawTop(G.introT, G.boss); }
function updateIntro(rdt) {
  G.introPrev = G.introT; G.introT += rdt;
  const t = G.introT, sc = INTRO[G.gate.id], b = G.boss;
  const toBoss = ease(clamp((t - .25) / sc.focus, 0, 1)), back = ease(clamp((t - sc.back) / .7, 0, 1));
  G.camX = lerp(lerp(P.x, G.ifocus[0], toBoss), P.x, back);
  G.camY = lerp(lerp(P.y - 40, G.ifocus[1], toBoss), P.y - 60, back);
  G.camZoom = lerp(lerp(1, sc.zoom || 1, toBoss), 1, back);
  sc.tick(t, b, rdt);
  for (const e of introBodies()) {
    e.t += rdt;
    if (e.popT !== undefined) { const q = t - e.popT; e.introScale = q < .1 ? 1.28 : q < .35 ? lerp(1.28, 1, (q - .1) / .25) : 1; }
  }
  const bi = $('bossIntro');
  if (t > sc.card && !bi.classList.contains('reveal')) { bi.classList.add('reveal'); SFX.clank(); SFX.thud(); }
  if (t > sc.back && !bi.classList.contains('out')) bi.classList.add('out');
  for (const g of GH) { g.life -= rdt; if (g.life <= 0) g.dead = true; }
  updateFx(rdt); updateRings(rdt); sweep(PT); sweep(RG); sweep(GH); sweep(DC);
  if (G.flash > 0) G.flash -= rdt * 1.4;
  G.shake *= Math.exp(-rdt * 6);
  if (t > sc.dur) finishIntro();
}
function finishIntro() {
  const sc = INTRO[G.gate.id];
  if (sc.finish) sc.finish(G.boss);
  for (const e of introBodies()) { e.introScale = 1; if (e.y0 !== undefined) e.y = e.y0; }
  G.bossHole = undefined; G.camZoom = 1;
  beginFight();
}
function skipIntro() {
  if (STATE !== 'intro' || G.introT < .6) return;
  const sc = INTRO[G.gate.id];
  if (G.introT < sc.back) {
    if (sc.finish) sc.finish(G.boss);
    for (const e of introBodies()) { if (!(e.introScale > 0)) introEmerge(e, .8); e.introScale = 1; if (e.y0 !== undefined) e.y = e.y0; }
    if (G.gate.id === 'sun') { G.dark = 0; G.bossHole = undefined; }
    G.introPrev = G.introT = sc.back;
    G.camZoom = 1;
  }
}

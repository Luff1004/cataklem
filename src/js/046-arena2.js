/* ================= the deep gates: judge, root king, fallen sky ================= */
const SECT = TAU / 12;
function spawnHands(e) {
  const ph = phaseOf(e), dir = ph === 3 && Math.random() < .5 ? -1 : 1;
  HZ.push({ k: 'ray', follow: e, x: e.x, y: e.y, a: -Math.PI / 2, va: .3 * dir, len: ARENA_R * 1.15, w: 26, warn: 1.4, dur: 1e9, dmg: 22, t: 0, dead: false, hand: 1 });
  HZ.push({ k: 'ray', follow: e, x: e.x, y: e.y, a: Math.PI / 2, va: (ph === 1 ? .8 : ph === 2 ? 1 : 1.3) * dir, len: ARENA_R * 1.95, w: 12, warn: 1.4, dur: 1e9, dmg: 18, t: 0, dead: false, hand: 2 });
}
function updateHazards2(dt) {
  const pr = P.r * .55;
  for (const h of HZ) {
    if (h.dead) continue;
    const live = h.t >= (h.warn || 0);
    if (h.gaze) updateGaze(h, dt);
    if (h.swing) h.a = h.swing.base + Math.sin(h.t * h.swing.f) * h.swing.amp;
    if (h.k === 'sector') {
      if (live && !h.lit) { h.lit = true; pulseScreen(1.2); shake(12); SFX.boom(true); SFX.bellSmall(); for (const s of h.secs) { const a = -Math.PI / 2 + (s + .5) * SECT; for (let k = 0; k < 6; k++) burst(Math.cos(a) * (80 + k * 50), Math.sin(a) * (80 + k * 50), 3, COL.yellow, 160); } }
      if (live && h.t < h.warn + .3) { const d = Math.hypot(P.x, P.y); if (d > 34) { const a = ((Math.atan2(P.y, P.x) + Math.PI / 2) % TAU + TAU) % TAU, s = Math.floor(a / SECT); if (h.secs.includes(s)) hurtPlayer(h.dmg); } }
      if (h.t > h.warn + .45) h.dead = true;
    } else if (h.k === 'erase') {
      if (live && !h.lit) { h.lit = true; SFX.boom(true); pulseScreen(1.5); shake(12); }
      if (live && P.x * h.nx + P.y * h.ny > 0) hurtPlayer(h.dmg);
      if (h.t > h.warn + h.dur) h.dead = true;
    } else if (h.k === 'bloom') {
      if (live && !h.lit) { h.lit = true; if (h.gold) { G.flash = .8; G.novaFx = { x: G.eye ? G.eye.x : 0, y: -RH - 150, t0: performance.now(), rot: rnd(TAU) }; SFX.nova(); } pulseScreen(1.6); shake(14); SFX.boom(true); for (let k = 0; k < 40; k++) { const a = rnd(TAU), r = rnd(0, ARENA_R); PT.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, vx: rnd(-80, 80), vy: rnd(-160, -40), life: rnd(.6, 1.2), max: 1.2, s: rnd(4, 8), c: k % 3 ? COL.pink : COL.white, dead: false }); } }
      if (live && h.t < h.warn + .3 && !h.safes.some(s => d2(P.x, P.y, s.x, s.y) < s.r * s.r)) hurtPlayer(h.dmg);
      if (h.t > h.warn + .5) h.dead = true;
    }
  }
}
function turretAI(e, dt) {
  if (STATE !== 'play') return Z0;
  e.cd -= dt;
  if (e.cd <= 0) { e.cd = 2.2; const a = aimAt(e); for (let k = -1; k <= 1; k++) fireEB(e.x, e.y, a + k * .18, 150, 11, false); e.flash = .08; SFX.spit(); }
  return Z0;
}
function rootLine(e, a, delay = 0) {
  const ca = Math.cos(a), sa = Math.sin(a);
  for (let i = 1; i < 18; i++) {
    const x = e.x + ca * i * 46, y = e.y + sa * i * 46;
    if (x * x + y * y > (ARENA_R - 10) ** 2) break;
    TG.push({ kind: 'root', x, y, r: 32, t: -delay - i * .065, dur: .55, dead: false, cb: () => {
      if (STATE === 'play' && d2(P.x, P.y, x, y) < (32 + P.r * .6) ** 2) hurtPlayer(20);
      for (let s = 0; s < 5; s++) PT.push({ x, y, vx: rnd(-60, 60), vy: -rnd(120, 260), life: .45, max: .45, s: rnd(3, 6), c: s % 2 ? COL.teal : COL.deep, dead: false });
      if (gate('root', 70)) { SFX.thud(); shake(3); }
      DC.push({ x, y, s: 60, rot: rnd(TAU), img: SP.crack, life: 6, a: .4, dead: false });
    } });
  }
}
function borrowNova(e, dt) {
  if (!(e.nova > 0)) return false;
  e.nova -= dt;
  const sec = Math.ceil(e.nova);
  if (sec !== e.novaSec && sec <= 3) { e.novaSec = sec; SFX.tick(); }
  if (Math.random() < .9) { const a = rnd(TAU), r = rnd(200, 420); PT.push({ x: e.x + Math.cos(a) * r, y: e.y + Math.sin(a) * r, vx: -Math.cos(a) * r * 1.6, vy: -Math.sin(a) * r * 1.6, life: .55, max: .55, s: rnd(3, 6), c: Math.random() < .5 ? COL.yellow : COL.pink, dead: false }); }
  if (e.nova <= 0) novaBlast(e);
  return true;
}

Object.assign(BRAIN, {
  judge(e, dt, ux, uy, dist) {
    const ph = phaseOf(e);
    if (!e.handsUp) { e.handsUp = true; spawnHands(e); }
    if (e.st) return dashStates(e, dt);
    if (e.spiral > 0) spiralTick(e, dt, 3, 120, .12, false);
    if (e.busy <= 0 && e.cd <= 0) {
      const k = pickAtk(e, { strike: 3, rewind: 2.4, pendulum: 2, stop: ph === 3 ? 2.4 : 0 });
      if (k === 'strike') {
        const n = 3 + ph, secs = shuffle([...Array(12).keys()]).slice(0, n);
        HZ.push({ k: 'sector', secs, warn: 1.5, t: 0, dmg: 26, dead: false });
        for (let i = 0; i < 3; i++) setTimeout(() => SFX.tick(), i * 450);
        e.busy = 1.9; e.cd = .6;
      } else if (k === 'rewind') {
        const n = 18 + ph * 4, o = rnd(TAU);
        for (let i = 0; i < n; i++) fireEB(e.x, e.y, o + i / n * TAU, 175, 11, i % 3 === 0, { rev: 1.15, life: 4 });
        SFX.charge(.5); e.busy = 1.6; e.cd = .7;
      } else if (k === 'pendulum') {
        const side = Math.random() < .5 ? 1 : -1;
        HZ.push({ k: 'ray', x: 0, y: -ARENA_R + 10, a: Math.PI / 2, va: 0, len: ARENA_R * 2, w: 30, warn: 1, dur: 5.2, dmg: 24, t: 0, dead: false, swing: { base: Math.PI / 2, amp: 1.05 * side, f: 1.4 + ph * .2 } });
        e.busy = 1.4; e.cd = .9; SFX.swish();
      } else if (k === 'stop') {
        const o = rnd(TAU);
        G.freeze = 1.6; pulseScreen(1.8); G.flash = .3; SFX.bell(); SFX.charge(1.4);
        banner('정지', '탄이 멈췄다. 곧 다시 움직인다', 'warn');
        for (let r = 0; r < 3; r++) for (let i = 0; i < 16; i++) fireEB(e.x, e.y, o + i / 16 * TAU + r * .2, 120 + r * 40, 11, false, { life: 6 });
        e.busy = 2.6; e.cd = .8;
      }
    }
    const dl = Math.hypot(e.x, e.y + 10);
    return dl > 10 ? [-e.x / dl * 50, -(e.y + 10) / dl * 50] : Z0;
  },

  root(e, dt, ux, uy, dist) {
    const ph = phaseOf(e);
    if (e.st) return dashStates(e, dt);
    if (e.busy <= 0 && e.cd <= 0) {
      const sprouts = E.filter(x => x.ai === 'turret' && !x.dead).length;
      const k = pickAtk(e, { roots: 3.2, thorns: 2, sprout: sprouts < 3 ? 1.6 : 0, bloom: ph >= 2 ? 2.2 : 0, seeds: 2 });
      if (k === 'roots') { const a = aimAt(e), n = ph + 2; for (let i = 0; i < n; i++) rootLine(e, a + (i - (n - 1) / 2) * .38, i * .12); e.busy = 1.6; e.cd = .6; }
      else if (k === 'thorns') {
        const a = aimAt(e) + Math.PI / 2;
        for (const off of ph >= 2 ? [-90, 90] : [0]) { const px = e.x + Math.cos(a + Math.PI / 2) * off, py = e.y + Math.sin(a + Math.PI / 2) * off; const [x1, y1, x2, y2] = chordThrough(px, py, a); HZ.push({ k: 'line', x1, y1, x2, y2, w: 16, warn: 1.1, dur: 5, dmg: 22, t: 0, dead: false, thorn: 1 }); }
        SFX.thread(); e.busy = 1.2; e.cd = .7;
      } else if (k === 'sprout') { for (let i = 0; i < 3; i++) { const a = rnd(TAU), r = rnd(120, 300); spawnArenaAdd('sprout', Math.cos(a) * r, Math.sin(a) * r, 800); splat(Math.cos(a) * r, Math.sin(a) * r, 60, true); } SFX.thud(); e.busy = .8; e.cd = .8; }
      else if (k === 'bloom') {
        const safes = [], n = ph === 3 ? 3 : 4;
        for (let i = 0; i < n; i++) { let x, y; if (i === 0) { const a = rnd(TAU); x = P.x + Math.cos(a) * 110; y = P.y + Math.sin(a) * 110; } else { const a = rnd(TAU), r = rnd(60, 290); x = Math.cos(a) * r; y = Math.sin(a) * r; } const dl = Math.hypot(x, y); if (dl > 300) { x *= 300 / dl; y *= 300 / dl; } safes.push({ x, y, r: 56 }); }
        HZ.push({ k: 'bloom', safes, warn: 2.4, t: 0, dmg: 34, dead: false });
        banner('개화', '하얀 꽃자리 안으로', 'warn'); SFX.charge(2.2);
        e.busy = 3; e.cd = .8;
      } else if (k === 'seeds') { const a = aimAt(e); for (let i = 0; i < 9; i++) fireEB(e.x, e.y, a + (i - 4) * .2, 130, 12, true, { split: { t: 1.1, n: 5, spd: 150, dmg: 9 } }); SFX.spit(); e.busy = .9; e.cd = .8; }
    }
    const m = dist > 200 ? 1 : dist < 120 ? -.6 : 0;
    return [ux * e.spd * m, uy * e.spd * m];
  },

  sky(e, dt, ux, uy, dist) {
    const ph = phaseOf(e);
    if (borrowNova(e, dt)) return Z0;
    if (ph === 3) { e.novaCd = (e.novaCd === undefined ? 4 : e.novaCd) - dt; if (e.novaCd <= 0 && e.busy <= 0) { supernova(e); e.novaCd = 26; return Z0; } }
    if (e.spiral > 0) spiralTick(e, dt, ph + 3, 120, .1, Math.random() < .2);
    if (e.busy <= 0 && e.cd <= 0) {
      const k = pickAtk(e, { fall: 3, pull: 2, toll: 1.6, threads: 1.6, tide: 1.6, spiral: 1.6 });
      if (k === 'fall') {
        const n = 5 + ph;
        for (let i = 0; i < n; i++) {
          const x = clamp(P.x + rnd(-150, 150) + P.vx * .5, -ARENA_R + 50, ARENA_R - 50), y = clamp(P.y + rnd(-150, 150) + P.vy * .5, -ARENA_R + 50, ARENA_R - 50), r = rnd(70, 95);
          TG.push({ x, y, r, t: -i * .14, dur: 1.25, kind: 'emeteor', dead: false, cb: () => { ringFx(x, y, r * 1.2, COL.ink, .35, 8); burst(x, y, 16, COL.deep, 260); splat(x, y, r * 1.5, false); DC.push({ x, y, s: r * 2, rot: rnd(TAU), img: SP.crack, life: 8, a: .5, dead: false }); if (STATE === 'play' && d2(P.x, P.y, x, y) < (r + P.r * .6) ** 2) hurtPlayer(28); if (gate('fall', 80)) SFX.boom(true); shake(7); pulseScreen(.6); } });
        }
        e.busy = 1.6; e.cd = .7;
      } else if (k === 'pull') { G.pullT = 3.4; G.pull = 85 + ph * 15; e.spiral = 3.2; e.sang = rnd(TAU); SFX.charge(3); banner('끌림', '하늘이 너를 부른다', 'warn'); e.busy = 3.6; e.cd = .8; }
      else if (k === 'toll') { let g = aimAt(e) + rnd(-1, 1); for (let i = 0; i < 3; i++) later(e, i * .7, () => { HZ.push({ k: 'wave', x: e.x, y: e.y, r: e.r * .8, vr: 190, gaps: [g], gw: .8, w: 18, dmg: 22, t: 0, dead: false }); SFX.bell(); pulseScreen(1); g += rnd(.8, 1.3) * (Math.random() < .5 ? -1 : 1); }); e.busy = 2.4; e.cd = .8; }
      else if (k === 'threads') { threads(5 + ph); e.busy = 1.4; e.cd = .8; }
      else if (k === 'tide') { const a = rnd(TAU); band(e, a); later(e, 1.1, () => band(e, a + Math.PI / 2)); e.busy = 2.3; e.cd = .8; }
      else if (k === 'spiral') { e.spiral = 3.4; e.sang = rnd(TAU); e.busy = 3.5; e.cd = .7; SFX.charge(.6); }
    }
    const dl = Math.hypot(e.x, e.y + 30);
    return dl > 8 ? [-e.x / dl * 30, -(e.y + 30) / dl * 30] : Z0;
  },
});

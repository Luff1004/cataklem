/* ================= the ending: light against ink, eight eyes, one last drop ================= */
/* where the light meets the ink, as a fraction of the way from the sword to UNKNOWN */
const END_C = [[2.4, 0], [3.0, .55], [3.6, .5], [4.4, .37], [5.0, .47], [5.6, .44], [6.4, .26], [7.0, .3], [7.7, .36], [8.3, .5], [8.9, .74], [9.5, 1]];
function endClash(t) {
  if (t < END_C[0][0]) return 0;
  const wob = t > 3 && t < 9.3 ? Math.sin(t * 11) * .02 + Math.sin(t * 27) * .009 : 0;
  for (let i = 1; i < END_C.length; i++) if (t <= END_C[i][0]) { const [t0, v0] = END_C[i - 1], [t1, v1] = END_C[i]; return lerp(v0, v1, ease((t - t0) / (t1 - t0))) + wob; }
  return 1;
}
SFX.drip = () => { tone(1900, .07, { type: 'sine', f2: 520, vol: .16, att: .002 }); tone(380, .26, { type: 'sine', f2: 150, vol: .2, delay: .01 }); noise(.12, { ft: 'highpass', f: 3000, vol: .05, delay: .02 }); };
SFX.splat = () => { noise(.35, { ft: 'bandpass', f: 1200, f2: 300, q: 1.4, vol: .14 }); tone(220, .3, { type: 'sine', f2: 90, vol: .12 }); };

function startFinisher(e) {
  STATE = 'cut';
  G.cut = { t: 0, kind: 'finish', dur: 24.4, subs: [
    [1.5, 2.6, '...WAIT.'], [3.3, 4.3, 'NO.'], [4.6, 5.9, 'I WILL NOT BE ERASED.'], [6.3, 7.6, 'GO BACK INTO THE DARK.'],
    [10.3, 11.4, 'NO NO NO NO NO'], [11.7, 13.0, 'I WAS EVERY LINE YOU'], [13.2, 14.3, '...DREW.']] };
  for (const b of EB) b.dead = true;
  for (const h of HZ) h.dead = true;
  for (const t of TG) t.dead = true;
  for (const o of E) if (o !== e && !o.boss) o.dead = true;
  INPUT.joy = null; updMove();
  G.finBlade = 0; G.finStrike = 0; G.cutWhite = 0; G.unravel = null;
  const w = G.weapons.find(x => x.id === 'scrib_sword'); const side = P.x > 0 ? -1 : 1; if (w) { w.swing = null; w.lastA = side > 0 ? 0 : Math.PI; }
  G.end = {
    side, px0: P.x, py0: P.y, c: 0, beam: 0, despair: 0, shrink: 0, wild: [], paper: null, sfxT: 0,
    eyes: Array.from({ length: 8 }, (_, i) => ({ a: i / 8 * TAU + rnd(-.3, .3), d: rnd(.2, .62), s: rnd(.75, 1.25), ph: rnd(TAU), sp: rnd(2.4, 6.5), born: 10.1 + i * .38, lx: 0, ly: 0 }))
  };
  const c = $('cutscene'); c.hidden = false; c.className = ''; void c.offsetWidth; c.className = 'on';
  $('cutEye').textContent = '필살'; $('cutLine').textContent = '';
  AU.track = 'silent'; G.flash = .5; pulseScreen(2); SFX.charge(2.2); buzz([40, 30, 80]);
}

function endPts(en, e) {
  const sd = en.side, ox = P.x + sd * 84, oy = P.y, R = e.r * (e.drawScale || 1);
  const ex = e.x - sd * R * .55, ey = e.y;
  return { ox, oy, ex, ey, kx: lerp(ox, ex, en.c), ky: lerp(oy, ey, en.c) };
}

function updateFinisher(rdt) {
  const c = G.cut, e = G.boss, en = G.end;
  c.t += rdt; const t = c.t, prevT = t - rdt, hit = tm => prevT < tm && t >= tm;
  if (G.eye) G.eye.open = lerp(G.eye.open, 0, 1 - Math.exp(-rdt * 4));
  let fx = P.x, fy = P.y - 60, z = 1.3;
  if (e && !e.dead) {
    e.t += rdt; e.cd = 99; e.busy = 99;
    const k = 1 - Math.exp(-rdt * 1.6);
    if (t < 14.6) { e.x = lerp(e.x, en.px0 + en.side * (t < 9.5 ? 560 : 620), k); e.y = lerp(e.y, en.py0 - 10, k); }
    const target = t < 9.5 ? 2 : t < 14.6 ? 2 + en.despair * .7 : lerp(2.7, .03, Math.pow(en.shrink, 1.6));
    e.drawScale = t < 14.6 ? lerp(e.drawScale || 1, target, k) : target;
  }
  // charging: light pours into the blade
  if (t < 2.2) for (let k = 0; k < 6; k++) { const a = rnd(TAU), r = rnd(120, 280); PT.push({ x: P.x + Math.cos(a) * r, y: P.y - 60 + Math.sin(a) * r, vx: -Math.cos(a) * r * 1.9, vy: -Math.sin(a) * r * 1.9, life: .5, max: .5, s: rnd(2, 5), c: k % 2 ? GOLD : COL.white, dead: false }); }
  G.finBlade = t < 1.2 ? 0 : clamp((t - 1.2) / 1.2, 0, 1);
  if (hit(1.2)) { SFX.heaven(); shake(10); pulseScreen(1); }
  if (t < 2.4) { z = lerp(1.3, .95, clamp((t - 1) / 1.4, 0, 1)); G.shake = Math.max(G.shake, t * 2); }
  en.c = endClash(t);
  en.beam = t < 2.4 ? 0 : t < 14.6 ? 1 : Math.max(0, 1 - (t - 14.6) / .9);
  if (hit(2.4)) { SFX.ult(); G.flash = .7; shake(24); pulseScreen(1.6); buzz([80, 40, 160]); $('cutEye').textContent = ''; }
  if (hit(2.55)) { SFX.roar(); SFX.scratch(); }
  if (e && !e.dead) {
    const p = endPts(en, e);
    // the struggle
    if (t > 2.4 && t < 9.5) {
      const push = (en.c - endClash(t - .1)) * 10;
      fx = lerp(p.kx, (p.ox + p.ex) / 2, .3); fy = p.ky - 90; z = .62 - Math.abs(push) * .05;
      P.x = lerp(P.x, en.px0 - en.side * (.5 - en.c) * 70, 1 - Math.exp(-rdt * 8));
      G.shake = Math.max(G.shake, 7 + Math.abs(push) * 9);
      for (let k = 0; k < 7; k++) {
        const sd = Math.random() < .5 ? -1 : 1, sp = rnd(200, 720), along = rnd(-260, 260) - en.side * (en.c - .4) * 200;
        PT.push({ x: p.kx + rnd(-14, 14), y: p.ky + rnd(-20, 20), vx: along, vy: sd * sp, life: rnd(.25, .6), max: .6, s: rnd(2, 6), c: k % 3 === 0 ? COL.deep : k % 3 === 1 ? GOLD : COL.white, dead: false });
      }
      en.sfxT -= rdt;
      if (en.sfxT <= 0) { en.sfxT = .11; SFX.scratch(); if (Math.random() < .4) SFX.zap(); }
    }
    if (hit(3.0)) { const p2 = endPts(en, e); ringFx(p2.kx, p2.ky, 260, GOLD, .5, 14); ringFx(p2.kx, p2.ky, 150, COL.deep, .4, 10); G.flash = .8; shake(34); SFX.boom(true); buzz([120]); }
    for (const tm of [4.4, 6.4]) if (hit(tm)) { SFX.roar(); shake(26); pulseScreen(1.2); ringFx(p.kx, p.ky, 200, COL.pink, .45, 10); burst(p.kx, p.ky, 40, COL.deep, 520); }
    for (const tm of [5.0, 7.7]) if (hit(tm)) { SFX.heaven(); G.flash = .5; shake(18); ringFx(p.kx, p.ky, 220, GOLD, .4, 8); }
    if (hit(8.3)) {
      SFX.ult(); SFX.boom(true); G.flash = 1; shake(40); pulseScreen(2.4); buzz([60, 30, 200]);
      ringFx(P.x, P.y - 40, 320, GOLD, .7, 16); ringFx(P.x, P.y - 40, 200, COL.white, .5, 8);
    }
    // the light lands
    if (hit(9.5)) {
      G.novaFx = { x: e.x, y: e.y, t0: performance.now(), rot: rnd(TAU) }; G.finStrike = performance.now();
      SFX.nova(); SFX.boom(true); SFX.roar(); G.flash = 1; shake(48); pulseScreen(3); buzz([140, 60, 320]);
      for (let k = 0; k < 70; k++) { const a = rnd(TAU), sp = rnd(200, 900); PT.push({ x: e.x, y: e.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: rnd(.5, 1.2), max: 1.2, s: rnd(3, 8), c: k % 3 ? COL.deep : GOLD, dead: false }); }
    }
    if (hit(10.3)) { $('cutscene').classList.remove('fin'); $('cutLine').textContent = ''; $('cutEye').textContent = 'UNKNOWN'; }
    // despair: it thrashes, sprouts, opens eyes
    if (t > 9.5 && t < 14.6) {
      en.despair = clamp((t - 9.5) / 3.2, 0, 1);
      fx = e.x; fy = e.y; z = lerp(.7, .56, en.despair);
      G.shake = Math.max(G.shake, 12 + en.despair * 14);
      while (en.wild.length < 10 + en.despair * 46) en.wild.push({ a: rnd(TAU), len: rnd(160, 460), ph: rnd(TAU), sp: rnd(3, 9), w: rnd(10, 22), t0: t });
      if (Math.random() < rdt * 6) e.flash = .06;
      e.x += rnd(-6, 6) * en.despair;
      en.sfxT -= rdt;
      if (en.sfxT <= 0) { en.sfxT = rnd(.5, 1.1); if (Math.random() < .5) SFX.roar(); else SFX.whisper(); SFX.scratch(); }
      if (Math.random() < rdt * 10) burst(e.x + rnd(-120, 120), e.y + rnd(-120, 120), 8, Math.random() < .3 ? COL.pink : COL.deep, 380);
    }
    for (const ey of en.eyes) if (hit(ey.born)) { SFX.scratch(); SFX.thud(); shake(10); }
    // collapse into one drop
    if (t >= 14.6) {
      en.shrink = clamp((t - 14.6) / 2.1, 0, 1);
      fx = e.x; fy = e.y; z = lerp(.6, 1.7, ease(en.shrink));
      G.shake = Math.max(G.shake, 10 * (1 - en.shrink));
      if (Math.random() < rdt * 30 * (1 - en.shrink)) { const a = rnd(TAU), r = 300 * (1 - en.shrink) + 40; PT.push({ x: e.x + Math.cos(a) * r, y: e.y + Math.sin(a) * r, vx: -Math.cos(a) * r * 2, vy: -Math.sin(a) * r * 2, life: .45, max: .45, s: rnd(3, 7), c: COL.deep, dead: false }); }
    }
    if (hit(14.6)) { SFX.whisper(); SFX.charge(2); $('cutEye').textContent = ''; }
    if (hit(16.7)) { e.dead = true; e.hp = 0; $('bossBar').hidden = true; en.dropAt = { x: e.x, y: e.y, t }; SFX.thud(); }
  }
  if (en.dropAt) { const dt2 = t - en.dropAt.t; fx = en.dropAt.x; fy = en.dropAt.y + 260 * dt2 * dt2; z = 1.7; G.cutBlack = clamp((dt2 - .25) / .5, 0, 1); }
  // the page
  if (hit(17.5)) {
    const cs = $('cutscene'); cs.className = ''; cs.hidden = true; $('hud').hidden = true;
    en.paper = { t0: t, spl: [], blot: null, th: 1.08, dh: 950, tau: 0, fib: Array.from({ length: 200 }, () => [rnd(-W * .65, W * .65), rnd(-H * .6, H * .75), rnd(TAU), rnd(6, 22)]) };
    G.flash = 0; G.shake = 0;
  }
  if (en.paper) updatePaper(en.paper, t - en.paper.t0, rdt);
  G.camX = lerp(G.camX, fx, 1 - Math.exp(-rdt * 3.4)); G.camY = lerp(G.camY, fy, 1 - Math.exp(-rdt * 3.4));
  G.camZoom = lerp(G.camZoom || 1, z, 1 - Math.exp(-rdt * 2.6));
  updateFx(rdt); updateRings(rdt); sweep(PT); sweep(RG);
  if (G.flash > 0) G.flash -= rdt * .9;
  G.shake *= Math.exp(-rdt * 3);
  if (t > c.dur) startCredits();
}

/* ---------- the page, in 3D: a tilted sheet, a falling drop, a crown splash, then the camera looks straight down ---------- */
const DROP_T = 1.15, PD = 1100;
function paperProj(pp, x, y, h) {
  const s = Math.sin(pp.th), c = Math.cos(pp.th), Z = PD - y * s - h * c, k = PD / Math.max(80, Z);
  return { x: W / 2 + x * k, y: H * .42 + (y * c - h * s) * k, k };
}
function crownR(tau) { return 18 + 66 * (1 - Math.exp(-tau * 5)); }
function updatePaper(pp, pt, dt) {
  pp.th = lerp(1.08, 0, ease(clamp((pt - DROP_T - 1.15) / 1.8, 0, 1)));
  if (pt < DROP_T) { const f = pt / DROP_T; pp.dh = lerp(950, 0, f * f); }
  if (!pp.blot && pt >= DROP_T) {
    SFX.drip(); setTimeout(() => SFX.splat(), 60); buzz([20]);
    pp.blot = { lobes: Array.from({ length: 28 }, () => rnd(.75, 1.3)), spikes: Array.from({ length: 16 }, () => [rnd(TAU), rnd(24, 80), rnd(3, 7)]) };
    pp.tau = 0; pp.dh = 0;
  }
  if (!pp.blot) return;
  const d = dt * (pt - DROP_T < 1.25 ? .42 : 1);
  pp.tau += d;
  const tau = pp.tau;
  if (!pp.crowned && tau > .16) {
    pp.crowned = true;
    const rc = crownR(tau);
    for (let k = 0; k < 34; k++) { const a = k / 34 * TAU + rnd(-.08, .08), sp = rnd(110, 420); pp.spl.push({ x: Math.cos(a) * rc, y: Math.sin(a) * rc, h: rnd(35, 70), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, vz: rnd(140, 460), r: rnd(2, 6.5), land: false, lobes: Array.from({ length: 9 }, () => rnd(.7, 1.3)) }); }
  }
  if (!pp.jetDrop && tau > .62) { pp.jetDrop = true; pp.spl.push({ x: 0, y: 0, h: 118, vx: rnd(-25, 25), vy: rnd(-25, 25), vz: 90, r: 7.5, land: false, lobes: Array.from({ length: 9 }, () => rnd(.8, 1.2)), main: true }); }
  for (const s of pp.spl) {
    if (s.land) continue;
    s.x += s.vx * d; s.y += s.vy * d; s.h += s.vz * d; s.vz -= 1500 * d;
    if (s.h <= 0) { s.h = 0; s.land = true; if (s.main) { SFX.drip(); s.r = 11; } }
  }
}
let TITLE_CV = null;
function titleCanvas() {
  const fs = Math.min(W * .29, 140), w = Math.ceil(W), h = Math.ceil(fs * 2.1), key = w + 'x' + h + '@' + DPR;
  if (TITLE_CV && TITLE_CV.key === key) return TITLE_CV;
  const ink = document.createElement('canvas'), pk = document.createElement('canvas');
  for (const [cv2, col] of [[ink, COL.ink], [pk, COL.pink]]) {
    cv2.width = w * DPR; cv2.height = h * DPR;
    const c2 = cv2.getContext('2d'); c2.scale(DPR, DPR);
    c2.font = '400 ' + fs.toFixed(0) + 'px "Gasoek One", "Arial Black", sans-serif'; c2.textAlign = 'center'; c2.textBaseline = 'middle'; c2.fillStyle = col;
    c2.fillText('CATA', w / 2, h * .27); c2.fillText('KLEM', w / 2, h * .73);
  }
  TITLE_CV = { ink, pk, w, h, key };
  return TITLE_CV;
}
let PCV = null;
function paperCanvas() {
  const SW = Math.ceil(W * 1.3), SH = Math.ceil(H * 1.35), oy = Math.round(H * .595), key = SW + 'x' + SH + '@' + DPR;
  if (!PCV || PCV.key !== key) { const c = document.createElement('canvas'); c.width = SW * DPR; c.height = SH * DPR; PCV = { c, g: c.getContext('2d'), SW, SH, oy, key }; }
  return PCV;
}
function blobOn(g, x, y, r, lobes, rot = 0) {
  const n = lobes.length;
  g.beginPath();
  for (let i = 0; i <= n; i++) { const a = rot + i / n * TAU, l = lobes[i % n]; i ? g.lineTo(x + Math.cos(a) * r * l, y + Math.sin(a) * r * l) : g.moveTo(x + Math.cos(a) * r * l, y + Math.sin(a) * r * l); }
  g.closePath();
}
function drawDrop(x, y, r, stretch, al = 1) {
  ctx.globalAlpha = al;
  ctx.fillStyle = COL.deep;
  ctx.beginPath(); ctx.moveTo(x, y - r * 2.4 * stretch);
  ctx.bezierCurveTo(x + r * .4, y - r * 1.2 * stretch, x + r, y - r * .3, x + r, y + r * .15);
  ctx.arc(x, y + r * .15, r, 0, Math.PI);
  ctx.bezierCurveTo(x - r, y - r * .3, x - r * .4, y - r * 1.2 * stretch, x, y - r * 2.4 * stretch);
  ctx.fill();
  ctx.fillStyle = COL.pink; ctx.globalAlpha = al * .5; ctx.beginPath(); ctx.arc(x + r * .35, y + r * .45, r * .55, 0, TAU); ctx.fill();
  ctx.fillStyle = COL.white; ctx.globalAlpha = al * .85; ctx.beginPath(); ctx.ellipse(x - r * .38, y - r * .2, r * .2, r * .34, -.4, 0, TAU); ctx.fill();
  ctx.globalAlpha = 1;
}
/* everything that lies flat on the sheet, drawn top-down into its own canvas */
function paintSheet(pp, pt) {
  const P2 = paperCanvas(), g = P2.g, now = performance.now() / 1000;
  g.setTransform(DPR, 0, 0, DPR, P2.SW / 2 * DPR, P2.oy * DPR);
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  g.fillStyle = COL.paper; g.fillRect(-P2.SW / 2, -P2.oy, P2.SW, P2.SH);
  g.strokeStyle = COL.ink; g.lineWidth = .8; g.globalAlpha = .06;
  for (const [x, y, a, l] of pp.fib) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
  const vg = g.createRadialGradient(0, 0, Math.min(W, H) * .3, 0, 0, Math.max(W, H) * .8);
  vg.addColorStop(0, 'rgba(20,27,64,0)'); vg.addColorStop(1, 'rgba(20,27,64,.15)');
  g.globalAlpha = 1; g.fillStyle = vg; g.fillRect(-P2.SW / 2, -P2.oy, P2.SW, P2.SH);
  // shadows of what is still in the air
  if (!pp.blot) { const f = 1 - pp.dh / 950; g.globalAlpha = .1 + .3 * f; g.fillStyle = COL.ink; g.beginPath(); g.ellipse(0, 0, 5 + (1 - f) * 26, 4 + (1 - f) * 20, 0, 0, TAU); g.fill(); }
  for (const s of pp.spl) if (!s.land) { g.globalAlpha = .16; g.fillStyle = COL.ink; g.beginPath(); g.arc(s.x, s.y, s.r * (1 + s.h / 200), 0, TAU); g.fill(); }
  const b = pp.blot;
  if (b) {
    const tau = pp.tau, grow = 1 - Math.pow(1 - clamp(tau / .3, 0, 1), 3);
    g.fillStyle = COL.deep; g.globalAlpha = .95;
    for (const [a, l, w] of b.spikes) {
      const L = l * clamp((tau - .2) / .5, 0, 1), x2 = Math.cos(a) * (22 + L), y2 = Math.sin(a) * (22 + L);
      if (L <= 0) continue;
      g.beginPath(); g.moveTo(Math.cos(a + .2) * 20, Math.sin(a + .2) * 20); g.lineTo(x2, y2); g.lineTo(Math.cos(a - .2) * 20, Math.sin(a - .2) * 20); g.fill();
      g.beginPath(); g.arc(x2, y2, w, 0, TAU); g.fill();
    }
    g.globalAlpha = .55; g.fillStyle = COL.pink; blobOn(g, 4, 3, 40 * grow, b.lobes, .3); g.fill();
    g.globalAlpha = 1; g.fillStyle = COL.deep; blobOn(g, 0, 0, 40 * grow, b.lobes); g.fill();
    for (const s of pp.spl) if (s.land) { blobOn(g, s.x, s.y, s.r * 1.15, s.lobes); g.fill(); }
    // the ink runs out into letters
    const bt = pt - DROP_T, T = titleCanvas(), maxR = Math.hypot(T.w / 2, T.h / 2) + 30;
    const rev = lag => { const q = clamp((bt - 1.05 - lag) / 1.9, 0, 1); return (1 - Math.pow(1 - q, 2.4)) * maxR; };
    const reveal = (img, r, ox, oy, op) => {
      if (r <= 0) return;
      g.save(); g.beginPath();
      for (let i = 0; i <= 48; i++) { const a = i / 48 * TAU, rr = r * (1 + .12 * Math.sin(a * 5 + now * 3) + .07 * Math.sin(a * 11 - now * 5)); i ? g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr * .8) : g.moveTo(Math.cos(a) * rr, Math.sin(a) * rr * .8); }
      g.clip(); g.globalCompositeOperation = op; g.drawImage(img, -T.w / 2 + ox, -T.h / 2 + oy, T.w, T.h); g.restore();
    };
    const off = lerp(16, 0, ease(clamp((bt - 2.3) / 1, 0, 1)));
    reveal(T.pk, rev(.25), off * .9 + 5, off * .6 + 3, 'source-over');
    reveal(T.ink, rev(0), 0, 0, 'multiply');
    const r0 = rev(0);
    if (r0 > 0 && r0 < maxR) {
      g.strokeStyle = COL.deep; g.lineCap = 'round'; g.globalAlpha = .7;
      for (let k = 0; k < 14; k++) {
        const a = k / 14 * TAU + Math.sin(k * 3.1) * .3, rr = r0 * (1 + .12 * Math.sin(k * 7)), L = 26 + (k % 4) * 10;
        g.lineWidth = 2 + (k % 3); g.beginPath(); g.moveTo(Math.cos(a) * rr * .85, Math.sin(a) * rr * .68); g.lineTo(Math.cos(a) * (rr + L), Math.sin(a) * (rr + L) * .8); g.stroke();
      }
    }
    if (bt > 3.3) {
      g.globalAlpha = clamp((bt - 3.3) / .8, 0, 1) * .75; g.fillStyle = COL.ink; g.font = '800 12px "Gothic A1", system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText('낙서는 종이 위로 돌아갔다', 0, T.h / 2 + 34);
    }
  }
  g.globalAlpha = 1;
  return P2;
}
function drawEndPaper() {
  const en = G.end, c = G.cut;
  if (!en || !en.paper || STATE !== 'cut') return;
  const pp = en.paper, pt = c.t - pp.t0, P2 = paintSheet(pp, pt);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.globalAlpha = 1;
  // the dark room the sheet lies in
  const bg = ctx.createRadialGradient(W / 2, H * .45, 40, W / 2, H * .45, H * .9);
  bg.addColorStop(0, '#2b3160'); bg.addColorStop(1, '#06070f');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  // the sheet, warped row by row
  if (pp.th < .002) ctx.drawImage(P2.c, W / 2 - P2.SW / 2, H * .42 - P2.oy, P2.SW, P2.SH);
  else {
    const top = paperProj(pp, -P2.SW / 2, -P2.oy, 0), bot = paperProj(pp, -P2.SW / 2, P2.SH - P2.oy, 0);
    ctx.globalAlpha = .45; ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.moveTo(top.x + 10, top.y + 8); ctx.lineTo(W - top.x + 10, top.y + 8); ctx.lineTo(W - bot.x + 14, bot.y + 14); ctx.lineTo(bot.x + 14, bot.y + 14); ctx.fill();
    ctx.globalAlpha = 1;
    const step = 4;
    for (let y = -P2.oy; y < P2.SH - P2.oy; y += step) {
      const a = paperProj(pp, 0, y, 0), b2 = paperProj(pp, 0, y + step, 0);
      if (b2.y <= a.y || a.y > H || b2.y < 0) continue;
      ctx.drawImage(P2.c, 0, (y + P2.oy) * DPR, P2.SW * DPR, step * DPR, W / 2 - P2.SW / 2 * a.k, a.y, P2.SW * a.k, b2.y - a.y + .7);
    }
    const lit = ctx.createLinearGradient(0, 0, 0, H);
    lit.addColorStop(0, 'rgba(6,7,15,' + (.5 * pp.th).toFixed(3) + ')'); lit.addColorStop(.6, 'rgba(6,7,15,0)');
    ctx.fillStyle = lit; ctx.fillRect(0, 0, W, H);
  }
  // things standing up off the sheet
  if (!pp.blot) {
    const p = paperProj(pp, 0, 0, pp.dh), sp = Math.min(1, pt / DROP_T);
    ctx.globalAlpha = .25; ctx.strokeStyle = COL.deep; ctx.lineWidth = 2 * p.k; ctx.beginPath(); ctx.moveTo(p.x, p.y - 30 * p.k * (1 + sp)); ctx.lineTo(p.x, p.y - 90 * p.k * (1 + sp)); ctx.stroke(); ctx.globalAlpha = 1;
    drawDrop(p.x, p.y, 11 * p.k, 1 + sp * .8);
  } else {
    const tau = pp.tau;
    // the crown
    if (tau < 1.05) {
      const rc = crownR(tau), hc = 82 * Math.sin(Math.PI * clamp(tau / .9, 0, 1)), n = 26;
      const segs = [];
      for (let i = 0; i < n; i++) segs.push(i);
      segs.sort((i, j) => Math.sin(i / n * TAU) - Math.sin(j / n * TAU));
      for (const i of segs) {
        const a0 = i / n * TAU, a1 = (i + 1) / n * TAU, front = Math.sin(a0 + Math.PI / n) > 0;
        const b0 = paperProj(pp, Math.cos(a0) * rc, Math.sin(a0) * rc, 0), b1 = paperProj(pp, Math.cos(a1) * rc, Math.sin(a1) * rc, 0);
        const t0 = paperProj(pp, Math.cos(a0) * rc * 1.04, Math.sin(a0) * rc * 1.04, hc * .55), t1 = paperProj(pp, Math.cos(a1) * rc * 1.04, Math.sin(a1) * rc * 1.04, hc * .55);
        ctx.fillStyle = front ? COL.deep : '#3a4278'; ctx.globalAlpha = 1;
        ctx.beginPath(); ctx.moveTo(b0.x, b0.y); ctx.lineTo(b1.x, b1.y); ctx.lineTo(t1.x, t1.y); ctx.lineTo(t0.x, t0.y); ctx.fill();
        const am = (a0 + a1) / 2, hh = hc * (.75 + .5 * hash1(i * 7.3)), tip = paperProj(pp, Math.cos(am) * rc * 1.14, Math.sin(am) * rc * 1.14, hh);
        if (tau < .2 || hash1(i) > .5) { ctx.beginPath(); ctx.moveTo(t0.x, t0.y); ctx.lineTo(tip.x, tip.y); ctx.lineTo(t1.x, t1.y); ctx.fill(); if (tau < .24) { ctx.beginPath(); ctx.arc(tip.x, tip.y, 3.2 * tip.k, 0, TAU); ctx.fill(); } }
        if (front) { ctx.strokeStyle = COL.pink; ctx.globalAlpha = .55; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(t0.x, t0.y); ctx.lineTo(t1.x, t1.y); ctx.stroke(); ctx.globalAlpha = 1; }
      }
    }
    // the rebound column
    if (tau > .28 && tau < .9) {
      const q = (tau - .28) / .62, jh = 120 * Math.sin(Math.PI * Math.min(1, q * 1.15)), base = paperProj(pp, 0, 0, 0), tip = paperProj(pp, 0, 0, jh);
      const w0 = 9 * base.k * (1 - q * .5), w1 = 3 * tip.k;
      ctx.fillStyle = COL.deep; ctx.beginPath(); ctx.moveTo(base.x - w0, base.y); ctx.lineTo(tip.x - w1, tip.y); ctx.lineTo(tip.x + w1, tip.y); ctx.lineTo(base.x + w0, base.y); ctx.fill();
      ctx.fillStyle = COL.white; ctx.globalAlpha = .6; ctx.fillRect(tip.x - w1 * .4 - 1, tip.y + 4, 1.5, Math.max(0, base.y - tip.y - 8)); ctx.globalAlpha = 1;
    }
    for (const s of pp.spl) if (!s.land) {
      const p = paperProj(pp, s.x, s.y, s.h), r = s.r * p.k;
      ctx.fillStyle = COL.deep; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, TAU); ctx.fill();
      ctx.fillStyle = COL.white; ctx.globalAlpha = .7; ctx.beginPath(); ctx.arc(p.x - r * .3, p.y - r * .3, r * .28, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
    }
  }
  if (pt < .45) { ctx.globalAlpha = 1 - pt / .45; ctx.fillStyle = '#05060f'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
}

/* ---------- world-space drawing: the beam, the ink, the eyes ---------- */
function drawEndWorld() {
  const en = G.end, c = G.cut, e = G.boss;
  if (!en || !c || c.kind !== 'finish' || STATE !== 'cut') return;
  const t = c.t, now = performance.now() / 1000;
  wt();
  // the blade lengthening into a beam
  if (G.finBlade > 0 && t < 2.5) {
    const L = 40 + G.finBlade * 160, sd = en.side, x = P.x + sd * 84, y0 = P.y;
    glowLine(x, y0, x + sd * L, y0, 50 * G.finBlade, GOLD, .45); glowLine(x, y0, x + sd * L, y0, 14, COL.white, .95); wt();
    starburst(x, y0, 30 + G.finBlade * 40 + Math.sin(now * 30) * 6, 1, now * 2);
  }
  if (!e || e.dead) { if (en.dropAt) drawDrop(en.dropAt.x, en.dropAt.y + 260 * Math.pow(t - en.dropAt.t, 2), 9, 1.4); return; }
  const p = endPts(en, e), R = e.r * (e.drawScale || 1), sh = en.shrink;
  // despair tentacles, thrashing
  if (en.wild.length) {
    const k = 1 - sh;
    for (const w of en.wild) {
      const grow = clamp((t - w.t0) / .4, 0, 1) * k;
      if (grow <= .01) continue;
      const pts = [];
      for (let i = 0; i <= 10; i++) { const f = i / 10, r = R * .7 + w.len * grow * f, ang = w.a + Math.sin(now * w.sp + w.ph + f * 6) * 1.1 * f; pts.push(e.x + Math.cos(ang) * r, e.y + Math.sin(ang) * r); }
      drawTentacle(pts, w.w * (.5 + grow * .5));
    }
    wt();
  }
  // the beam
  if (en.beam > 0) {
    const bw = en.beam * (1 + .1 * Math.sin(now * 46) + .06 * Math.sin(now * 17)), x1 = p.ox, y1 = p.oy, x2 = t >= 9.5 ? e.x : p.kx, y2 = t >= 9.5 ? e.y : p.ky;
    glowLine(x1, y1, x2, y2, 150 * bw, GOLD, .28);
    glowLine(x1, y1, x2, y2, 80 * bw, '#FFE08A', .55);
    glowLine(x1, y1, x2, y2, 34 * bw, COL.white, .97);
    wt();
    // streams of light racing along it
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len, nx = -uy, ny = ux;
    for (let k = 0; k < 16; k++) {
      const f = ((now * 2.6 + k * .137) % 1), o = Math.sin(k * 2.3) * 34 * bw, x = x1 + dx * f + nx * o, y = y1 + dy * f + ny * o;
      holyStreak(x, y, Math.atan2(dy, dx), 60 + (k % 3) * 30, 4 * bw, .85 * bw);
    }
    ctx.save(); ctx.strokeStyle = GOLD; ctx.lineWidth = 2; ctx.shadowColor = '#FFC93A'; ctx.shadowBlur = 12 * K;
    for (const sd of [-1, 1]) {
      ctx.globalAlpha = .85 * bw; ctx.beginPath();
      for (let i = 0; i <= 24; i++) { const f = i / 24, o = sd * (46 + Math.sin(f * 18 - now * 24) * 8) * bw; const x = x1 + dx * f + nx * o, y = y1 + dy * f + ny * o; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
    }
    ctx.restore();
    starburst(x1, y1, Math.max(1, 70 * bw + Math.sin(now * 40) * 8 * bw), bw, now * 3);
    wt();
  }
  // the ink torrent pushing back
  if (t > 2.5 && t < 9.6) {
    const al = t > 9.3 ? (9.6 - t) / .3 : clamp((t - 2.5) / .25, 0, 1), dx = p.kx - p.ex, dy = p.ky - p.ey, len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len;
    ctx.globalAlpha = al;
    for (let s = 0; s < 9; s++) {
      const pts = [];
      for (let i = 0; i <= 12; i++) { const f = i / 12, wob = Math.sin(f * 9 + now * (10 + s) + s * 1.7) * (10 + 40 * f) + (s - 4) * 9 * f; pts.push(p.ex + dx * f + nx * wob, p.ey + dy * f + ny * wob); }
      drawTentacle(pts, 26 - s * 1.5);
    }
    // the pile-up where it meets the light
    ctx.globalAlpha = al; ctx.fillStyle = COL.deep;
    for (let k = 0; k < 6; k++) { const a = rnd(TAU), r = rnd(20, 54); ctx.beginPath(); ctx.arc(p.kx + nx * Math.cos(a) * r * 1.5 - dx / len * (Math.sin(a) * r * .5 + 10), p.ky + ny * Math.cos(a) * r * 1.5 - dy / len * (Math.sin(a) * r * .5 + 10), rnd(14, 30), 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1;
  }
  // the clash itself
  if (t > 2.9 && t < 9.6) {
    const kx = p.kx, ky = p.ky, ba = Math.atan2(p.ey - p.oy, p.ex - p.ox), pa = ba + Math.PI / 2;
    for (let k = 0; k < 5; k++) { const sd = k % 2 ? 1 : -1, a = pa + (sd > 0 ? 0 : Math.PI) + rnd(-.6, .6), L = rnd(90, 260); holyStreak(kx + Math.cos(a) * L / 2, ky + Math.sin(a) * L / 2, a, L, rnd(4, 9), .9); }
    wt();
    for (let k = 0; k < 4; k++) { const sd = k % 2 ? 1 : -1, a = pa + (sd > 0 ? 0 : Math.PI) + rnd(-.8, .8), L = rnd(60, 170); scribLine(kx, ky, kx + Math.cos(a) * L, ky + Math.sin(a) * L, 6, 10); }
    starburst(kx, ky, 100 + rnd(-14, 24), 1, now * 5);
    ctx.save(); ctx.globalAlpha = .9; ctx.strokeStyle = COL.white; ctx.lineWidth = 3; ctx.beginPath();
    for (let i = 0; i <= 20; i++) { const a = i / 20 * TAU, r = 70 + rnd(-14, 14); const qx = Math.cos(pa) * Math.cos(a) * r * 1.4 + Math.cos(ba) * Math.sin(a) * r * .6, qy = Math.sin(pa) * Math.cos(a) * r * 1.4 + Math.sin(ba) * Math.sin(a) * r * .6; i ? ctx.lineTo(kx + qx, ky + qy) : ctx.moveTo(kx + qx, ky + qy); }
    ctx.stroke(); ctx.restore();
    wt();
  }
  // struck: gold cracks through the body
  if (t >= 9.5) {
    const q = clamp((t - 9.5) / 2, 0, 1) * (1 - sh);
    ctx.save(); ctx.lineCap = 'round'; ctx.shadowColor = '#FFC93A'; ctx.shadowBlur = 16 * K;
    for (let k = 0; k < 11; k++) {
      let a = k / 11 * TAU + k, x = e.x, y = e.y; ctx.globalAlpha = .9 * q; ctx.strokeStyle = k % 2 ? GOLD : COL.white; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x, y);
      for (let s = 0; s < 5; s++) { a += rnd(-.5, .5); x += Math.cos(a) * R * .24 * q; y += Math.sin(a) * R * .24 * q; ctx.lineTo(x, y); }
      ctx.stroke();
    }
    ctx.restore(); wt();
  }
  // eight eyes, opening and shutting
  for (const ey of en.eyes) {
    if (t < ey.born) continue;
    const app = clamp((t - ey.born) / .25, 0, 1) * (1 - clamp((sh - ey.d * .5) * 2.2, 0, 1));
    if (app <= 0) continue;
    const blink = clamp(Math.sin(t * ey.sp + ey.ph) * 1.8 + .5, 0, 1), open = app * blink;
    const x = e.x + Math.cos(ey.a + Math.sin(now * 1.3 + ey.ph) * .1) * R * ey.d, y = e.y + Math.sin(ey.a) * R * ey.d * .8;
    const ew = R * .27 * ey.s, eh = ew * .55 * open;
    if (eh > 1) {
      ctx.save();
      ctx.beginPath(); ctx.moveTo(x - ew, y); ctx.quadraticCurveTo(x, y - eh * 2, x + ew, y); ctx.quadraticCurveTo(x, y + eh * 2, x - ew, y); ctx.closePath();
      ctx.fillStyle = COL.white; ctx.fill(); ctx.clip();
      if (Math.random() < .08) { ey.lx = rnd(-.5, .5); ey.ly = rnd(-.3, .3); }
      const ix = x + ey.lx * ew, iy = y + ey.ly * eh;
      ctx.fillStyle = COL.pink; ctx.beginPath(); ctx.arc(ix, iy, ew * .5, 0, TAU); ctx.fill();
      ctx.fillStyle = COL.deep; ctx.beginPath(); ctx.ellipse(ix, iy, ew * .12, ew * .42, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(255,79,158,.7)'; ctx.lineWidth = 1.2;
      for (let k = 0; k < 4; k++) { const a = rnd(TAU); ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * ew, y + Math.sin(a) * eh); ctx.lineTo(x + Math.cos(a) * ew * .55, y + Math.sin(a) * eh * .55); ctx.stroke(); }
      ctx.restore();
    }
    ctx.strokeStyle = COL.deep; ctx.lineWidth = 4 * (e.drawScale || 1) * .5; ctx.lineCap = 'round'; ctx.globalAlpha = app;
    for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x - ew - 3, y + rnd(-2, 2)); ctx.quadraticCurveTo(x + rnd(-4, 4), y + sd * (eh * 2 + 3), x + ew + 3, y + rnd(-2, 2)); ctx.stroke(); }
    ctx.globalAlpha = 1;
  }
  // the last of it: a single drop
  if (sh > .55) drawDrop(e.x, e.y, 9 * clamp((sh - .55) / .3, 0, 1) + .1, 1.4);
}

/* ================= arena: hazards, new weapon helpers, boss gates ================= */
let HZ = [], OB = [], VX = [], GH = [];

function segDist(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1, l2 = dx * dx + dy * dy || 1;
  const t = clamp(((px - x1) * dx + (py - y1) * dy) / l2, 0, 1);
  return Math.hypot(px - x1 - dx * t, py - y1 - dy * t);
}
function angDiff(a, b) { let d = (a - b) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return Math.abs(d); }

/* ---------- weapons that need their own update ---------- */
function updateMine(p, dt) {
  p.life -= dt; if (p.life <= 0) { p.dead = true; return; }
  let go = false;
  if (p.trig > 0) { p.trig -= dt; if (p.trig <= 0) go = true; }
  else if (p.t > p.arm) gq(p.x, p.y, 60, e => { if (!go && !e.dead && !e.hidden && !e.under && d2(e.x, e.y, p.x, p.y) < (e.r + 22) ** 2) go = true; });
  if (!go) return;
  p.dead = true;
  aoe(p.x, p.y, p.br, p.dmg, 220);
  ringFx(p.x, p.y, p.br, COL.pink, .3, 6); ringFx(p.x, p.y, p.br * .55, COL.yellow, .22, 4);
  burst(p.x, p.y, 10, COL.deep, 220); burst(p.x, p.y, 6, COL.yellow, 160);
  splat(p.x, p.y, p.br * 1.1, false); shake(3);
  if (gate('mine', 60)) SFX.boom(false);
  if (p.chain) for (const o of PR) if (o.kind === 'mine' && !o.dead && o.trig <= 0 && d2(o.x, o.y, p.x, p.y) < (p.br * 1.2) ** 2) o.trig = .09;
}
function updateVortex(dt) {
  for (const v of VX) {
    if (v.dead) continue;
    v.t += dt; v.tick -= dt;
    gq(v.x, v.y, v.r + 30, e => {
      if (e.dead || e.boss || e.ai === 'echo' || e.ai === 'sat') return;
      const dx = v.x - e.x, dy = v.y - e.y, d = Math.hypot(dx, dy);
      if (d < v.r + e.r && d > 4) { const k = v.pull * (1 - e.kbRes) * dt * (1 - d / (v.r * 1.4)); e.x += dx / d * k; e.y += dy / d * k; }
    });
    if (v.tick <= 0) { v.tick = .25; aoe(v.x, v.y, v.r, v.dps * .25, 0, true); }
    if (v.t >= v.dur) {
      v.dead = true;
      if (v.end) { aoe(v.x, v.y, v.r * 1.1, v.end, 300); ringFx(v.x, v.y, v.r * 1.2, COL.pink, .4, 9); burst(v.x, v.y, 20, COL.deep, 300); shake(8); SFX.boom(true); }
      else ringFx(v.x, v.y, v.r * .5, COL.ink, .25, 4);
    }
  }
}

/* ---------- boss gate flow ---------- */
function setupBossRun(id) {
  const gate = GATES.find(g => g.id === id);
  newRun();
  E.length = 0;
  G.mode = 'boss'; G.gate = gate; G.rf = RIFT[1]; G.draftLeft = G.draftMax = id === 'unknown' ? 5 : 4; G.u = id === 'unknown' ? freshU() : null; G.sprint = 1; G.heartT = 20; G.rodT = 2.5; G.enraged = false;
  G.ultNeed = 150; G.rerolls = 2 + (SAVE.shop.reroll || 0);
  G.rel.hp = 60;
  G.weapons = []; G.buildDirty = true;
  if (id === 'unknown') { G.rel.hp = 160; G.rel.spdFlat = 100; G.draftLeft = G.draftMax = 1; }
  P.x = 0; P.y = 230; G.camX = 0; G.camY = 200;
  for (const w of G.weapons) w.lv = 3;
  recalc(); P.hp = P.maxHp;
}
function relicChoices() {
  const pool = Object.keys(RELICS).filter(k => !G.relics.includes(k));
  shuffle(pool);
  return pool.slice(0, 3).map(id => ({ k: 'relic', id }));
}
function spawnArenaBoss() {
  const g = G.gate, hp = g.hp;
  const mk = (type, x, y, extra) => {
    const e = { type, bk: g.id, arena: true, boss: true, x, y, r: g.r, scl: 1, hp, maxHp: hp, spd: g.spd, dmg: 22, xp: 0, ai: 'arena', kbRes: 1,
      kx: 0, ky: 0, t: 0, ph: 0, flash: 0, elite: false, hit: {}, cd: 1.6, busy: 0, face: 1, side: 1, st: '', stT: 0, phase: 1, introScale: 0, inv: 0, mvA: Math.PI / 2, dead: false };
    Object.assign(e, extra); E.push(e); return e;
  };
  if (g.id === 'twins') {
    const share = { hp, maxHp: hp, phase: 1 };
    const a = mk('twinA', -175, -40, { share, twin: 0 }), b = mk('twinB', 175, -40, { share, twin: 1 });
    a.other = b; b.other = a; G.boss = a; G.twins = [a, b]; G.twTheta = Math.PI; G.twDir = 1;
  } else G.boss = mk(g.id, 0, -150);
  if (g.id === 'unknown') { Object.assign(G.boss, { tents: [], lashes: [], hpFloor: hp * 5 / 6, dmg: 30 }); $('bossName').textContent = 'UNKNOWN · 1/7'; }
  $('bossName').textContent = g.name;
}
function spawnArenaAdd(type, x, y, hp) {
  const e = spawnEnemy(type, x, y);
  if (hp) { e.hp = e.maxHp = hp; }
  e.xp = 0;
  e.cd = rnd(1, 3); e.oa = rnd(TAU);
  return e;
}
function tryDash() {
  if (STATE !== 'play' || G.mode !== 'boss' || P.dashCd > 0) return;
  let dx = INPUT.mx, dy = INPUT.my, l = Math.hypot(dx, dy);
  if (l < .2) { dx = P.face; dy = 0; l = 1; }
  P.dashX = dx / l; P.dashY = dy / l; P.dashT = .17 * G.rel.dashDist; P.dashCd = 1.5 * G.rel.dashCd * (P.dashMul || 1); P.inv = Math.max(P.inv, .32 + (P.dashInv || 0));
  SFX.dash(); buzz(10);
}
const phaseOf = e => (e.share || e).phase;
function later(e, t, fn) { G.later.push({ t, fn: () => { if (!e.dead && STATE === 'play') fn(); } }); }
function aimAt(e) { return Math.atan2(P.y - e.y, P.x - e.x); }

function arenaStep(dt) {
  if (STATE !== 'play') return;
  G.fightT += dt;
  if (!G.enraged && G.fightT > 210 && !G.u) { G.enraged = true; banner('격노', '거물이 더는 봐주지 않는다', 'warn'); SFX.roar(); }
  G.heartT -= dt;
  if (G.heartT <= 0 && (!G.u || G.u.stage === 'arena')) { G.heartT = 24; const a = rnd(TAU), r = rnd(80, 260); addPick('heart', Math.cos(a) * r, Math.sin(a) * r); }
  if (G.rel.rod && G.boss && !G.boss.dead) { G.rodT -= dt; if (G.rodT <= 0) { G.rodT = 2.5 / G.rel.rod; strike(G.boss, 70, 0); } }
  if (G.relicDelay > 0) G.relicDelay -= dt;
  G.dark = lerp(G.dark, G.darkT, 1 - Math.exp(-dt * 2));
  if (G.freeze > 0) { G.freeze -= dt; if (G.freeze <= 0) { for (const b of EB) { b.vx *= 1.35; b.vy *= 1.35; } pulseScreen(1); SFX.swish(); } }
  if (G.pullT > 0) { G.pullT -= dt; if (G.pullT <= 0) G.pull = 0; }
  updateHazards(dt);
  updateHazards2(dt);
}

function updateHazards(dt) {
  const pr = P.r * .55;
  for (const h of HZ) {
    if (h.dead) continue;
    h.t += dt;
    const live = h.t >= (h.warn || 0);
    if (h.k === 'wave') {
      h.r += h.vr * dt * G.rel.bslow; if (h.r > ARENA_R * 2.2) h.dead = true;
      const d = Math.hypot(P.x - h.x, P.y - h.y);
      if (Math.abs(d - h.r) < h.w / 2 + pr) { const a = Math.atan2(P.y - h.y, P.x - h.x); if (!h.gaps.some(g => angDiff(a, g) < h.gw / 2)) hurtPlayer(h.dmg); }
    } else if (h.k === 'band') {
      if (!live) continue;
      h.d += h.vd * dt * G.rel.bslow; if (h.d > ARENA_R + 60) h.dead = true;
      if (Math.random() < .7) { const tk = rnd(-ARENA_R, ARENA_R); if (Math.abs(tk - h.gap) > h.gw / 2) PT.push({ x: h.nx * h.d - h.ny * tk, y: h.ny * h.d + h.nx * tk, vx: h.nx * rnd(80, 220) + rnd(-40, 40), vy: h.ny * rnd(80, 220) - rnd(40, 160), life: .6, max: .6, s: rnd(3, 6), c: Math.random() < .5 ? COL.white : COL.ink, dead: false }); }
      if (Math.abs(P.x * h.nx + P.y * h.ny - h.d) < 140) shake(3);
      const pn = P.x * h.nx + P.y * h.ny, pt = -P.x * h.ny + P.y * h.nx;
      if (Math.abs(pn - h.d) < h.w / 2 + pr && Math.abs(pt - h.gap) > h.gw / 2) hurtPlayer(h.dmg);
    } else if (h.k === 'line') {
      if (live && !h.lit) { h.lit = true; for (let k = 0; k < 10; k++) { const f = k / 9; burst(lerp(h.x1, h.x2, f), lerp(h.y1, h.y2, f), 3, k % 2 ? COL.yellow : COL.white, 160); } if (gate('snap', 90)) { SFX.zap(); shake(3); } }
      if (h.t > h.warn + h.dur) h.dead = true;
      else if (live && segDist(P.x, P.y, h.x1, h.y1, h.x2, h.y2) < h.w / 2 + pr) hurtPlayer(h.dmg);
    } else if (h.k === 'ray') {
      if (h.follow) { if (h.follow.dead) { h.dead = true; continue; } h.x = h.follow.x; h.y = h.follow.y; }
      if (live) h.a += h.va * dt * G.rel.bslow;
      if (h.t > h.warn + h.dur) { h.dead = true; continue; }
      if (live && segDist(P.x, P.y, h.x, h.y, h.x + Math.cos(h.a) * h.len, h.y + Math.sin(h.a) * h.len) < h.w / 2 + pr) hurtPlayer(h.dmg);
    } else if (h.k === 'pool') {
      if (h.t > h.warn + h.dur) h.dead = true;
    } else if (h.k === 'tether') {
      if (h.a.dead || h.b.dead) { h.dead = true; continue; }
      if (live && !h.lit) { h.lit = true; SFX.zap(); pulseScreen(.8); shake(6); }
      h.x1 = h.a.x; h.y1 = h.a.y; h.x2 = h.b.x; h.y2 = h.b.y;
      if (h.dur && h.t > h.warn + h.dur) { h.dead = true; continue; }
      if (live && segDist(P.x, P.y, h.x1, h.y1, h.x2, h.y2) < h.w / 2 + pr) hurtPlayer(h.dmg);
    }
  }
}

/* ---------- boss brains ---------- */
function arenaAI(e, dt, ux, uy, dist) {
  if (e.inv > 0) e.inv -= dt;
  if (e.ai === 'echo') return echoAI(e, dt);
  if (e.ai === 'sat') return satAI(e, dt);
  if (e.ai === 'turret') return turretAI(e, dt);
  if (STATE !== 'play') return Z0;
  if (e.bk !== 'unknown' && arenaPhase(e)) return Z0;
  if (e.busy > 0) e.busy -= dt; else e.cd -= dt;
  return BRAIN[e.bk](e, dt, ux, uy, dist);
}
function echoAI(e, dt) {
  if (STATE !== 'play') return Z0;
  e.cd -= dt;
  if (e.cd <= 0) { e.cd = 4.2; e.ring = .3; HZ.push({ k: 'wave', x: e.x, y: e.y, r: 12, vr: 125, gaps: [rnd(TAU)], gw: 1.2, w: 12, dmg: 14, t: 0, dead: false }); SFX.bellSmall(); }
  if (e.ring > 0) e.ring -= dt;
  return Z0;
}
function satAI(e, dt) {
  const b = G.boss;
  if (!b || b.dead) return Z0;
  e.oa += dt * .7;
  const tx = b.x + Math.cos(e.oa) * 150, ty = b.y + Math.sin(e.oa) * 150;
  e.x = tx; e.y = ty;
  if (STATE !== 'play') return Z0;
  e.cd -= dt;
  if (e.cd <= 0) { e.cd = 2.3; fireEB(e.x, e.y, aimAt(e), 150, 11, false); e.flash = .08; SFX.spit(); }
  return Z0;
}
function arenaPhase(e) {
  const S = e.share || e, hr = S.hp / e.maxHp, ph = hr > .66 ? 1 : hr > .33 ? 2 : 3;
  if (ph <= S.phase) return false;
  S.phase = ph; phaseShift(e); return true;
}
function phaseShift(e) {
  for (const b of EB) if (!b.dead) { b.dead = true; burst(b.x, b.y, 2, COL.pink, 70); }
  for (const h of HZ) h.dead = true;
  const bosses = e.share ? G.twins : [e];
  for (const b of bosses) { b.inv = 1.9; b.busy = 2; b.cd = 1.2; b.st = ''; b.leap = 0; b.hidden = false; b.under = 0; b.spiral = 0; b.weave = 0; b.nova = 0; b.mirT = 0; }
  G.hitstop = .35; G.flash = .7; shake(18); SFX.roar(); buzz([40, 40, 140]);
  for (let i = 0; i < 3; i++) G.later.push({ t: i * .18, fn: () => ringFx(e.x, e.y, 160 + i * 90, i % 2 ? COL.pink : COL.ink, .5, 10 - i * 2) });
  const ph = phaseOf(e);
  banner(ph === 2 ? '2막' : '3막', G.gate.phases[ph], 'warn');
  G.relicPend++; G.relicDelay = 1.6;
  if (e.bk === 'bell' && ph >= 2) for (let i = 0; i < 2; i++) { const a = rnd(TAU); spawnArenaAdd('echo', Math.cos(a) * 220, Math.sin(a) * 220, 700); }
  if (e.bk === 'sun') {
    for (const o of E) if (o.ai === 'sat' && !o.dead) o.dead = true;
    if (ph === 2) { G.darkT = 1; spawnSats(e, 3); }
    if (ph === 3) { G.darkT = 0; e.novaCd = 2.5; spawnSats(e, 2); }
  }
  if (e.bk === 'judge') { e.handsUp = false; G.freeze = 0; }
  if (e.bk === 'sky') { G.pull = 0; G.pullT = 0; G.darkT = ph === 2 ? .7 : 0; if (ph === 3) e.novaCd = 3; }
  if (e.bk === 'twins' && ph === 3) HZ.push({ k: 'tether', a: G.twins[0], b: G.twins[1], w: 12, warn: 1.4, dur: 0, dmg: 20, t: 0, dead: false, keep: true });
}
function spawnSats(e, n) { for (let i = 0; i < n; i++) { const s = spawnArenaAdd('sat', e.x, e.y, 900); s.oa = i / n * TAU; } }

function dashStates(e, dt) {
  if (e.st === 'aim') { e.stT -= dt; if (e.stT <= 0) { e.st = 'dash'; e.stT = e.dashDur; SFX.swish(); } return Z0; }
  if (e.st === 'dash') {
    e.stT -= dt;
    if (Math.random() < .8) PT.push({ x: e.x + rnd(-e.r, e.r) * .6, y: e.y + rnd(-e.r, e.r) * .6, vx: 0, vy: 0, life: .45, max: .45, s: rnd(4, 9), c: e.type === 'twinB' ? COL.pink : COL.ink, dead: false });
    if (e.stT <= 0) { e.st = ''; if (e.onDashEnd) { const f = e.onDashEnd; e.onDashEnd = null; f(); } }
    return [e.dx * e.dash, e.dy * e.dash];
  }
  e.st = ''; return Z0;
}
function arenaDash(e, a, spd, dur, warn) {
  e.st = 'aim'; e.stT = warn; e.dx = Math.cos(a); e.dy = Math.sin(a); e.dash = spd; e.dashDur = dur;
  TG.push({ x: e.x, y: e.y, a, len: spd * dur + 20, t: 0, dur: warn, kind: 'eline', w: e.r * 1.6, dead: false });
}
function pickAtk(e, opts) {
  let k = wpick(opts);
  if (k === e.lastAtk && Math.random() < .65) k = wpick(opts);
  e.lastAtk = k; return k;
}
function chordThrough(px, py, a) {
  const dx = Math.cos(a), dy = Math.sin(a), b = px * dx + py * dy, c = px * px + py * py - ARENA_R * ARENA_R, disc = Math.sqrt(Math.max(0, b * b - c));
  return [px + dx * (-b - disc), py + dy * (-b - disc), px + dx * (-b + disc), py + dy * (-b + disc)];
}
function threads(n) {
  for (let i = 0; i < n; i++) {
    let px, py;
    if (i === 0) { px = P.x + rnd(-30, 30); py = P.y + rnd(-30, 30); }
    else { const a = rnd(TAU), r = rnd(0, ARENA_R * .7); px = Math.cos(a) * r; py = Math.sin(a) * r; }
    const [x1, y1, x2, y2] = chordThrough(px, py, rnd(TAU));
    HZ.push({ k: 'line', x1, y1, x2, y2, w: 10, warn: 1.1, dur: 2, dmg: 18, t: 0, dead: false });
  }
  SFX.thread();
}
function band(e, a) {
  const nx = Math.cos(a), ny = Math.sin(a), pt = -P.x * ny + P.y * nx;
  HZ.push({ k: 'band', nx, ny, d: -ARENA_R - 30, vd: 205 + phaseOf(e) * 25, w: 46, gap: clamp(pt + rnd(-150, 150), -ARENA_R + 90, ARENA_R - 90), gw: 125, dmg: 24, warn: .7, t: 0, dead: false });
  SFX.wave();
}
function slam(e, r, dmg, n) {
  if (d2(P.x, P.y, e.x, e.y) < (r + P.r) ** 2) hurtPlayer(dmg);
  if (n) radial(e, n, 145, rnd(TAU), 12, false);
  ringFx(e.x, e.y, r * 1.1, COL.ink, .4, 9); ringFx(e.x, e.y, r * .6, COL.pink, .3, 5);
  burst(e.x, e.y, 22, COL.deep, 300); splat(e.x, e.y, r * 1.6, false);
  DC.push({ x: e.x, y: e.y, s: r * 2.6, rot: rnd(TAU), img: SP.crack, life: 12, a: .7, dead: false });
  for (let s = 0; s < 26; s++) { const a = rnd(TAU), sp = rnd(120, 420); PT.push({ x: e.x, y: e.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 120, life: rnd(.5, .9), max: .9, s: rnd(3, 7), c: s % 3 ? COL.deep : COL.paper2, dead: false }); }
  shake(18); pulseScreen(1.3); SFX.boom(true); buzz(25);
}
function spiralTick(e, dt, arms, spd, rate, big) {
  e.spiral -= dt; e.spT = (e.spT || 0) - dt;
  if (e.spT <= 0) { e.spT = rate; for (let k = 0; k < arms; k++) fireEB(e.x, e.y, e.sang + k / arms * TAU, spd, 11, big); e.sang += .19; SFX.spit(); }
}
function orbitMove(e, ux, uy, dist, want, spd) {
  const rad = (dist - want) / want;
  const tx = ux * rad * 1.6 - uy * e.side, ty = uy * rad * 1.6 + ux * e.side, tl = Math.hypot(tx, ty) || 1;
  if (Math.random() < .004) e.side *= -1;
  return [tx / tl * spd, ty / tl * spd];
}

const BRAIN = {
  bell(e, dt, ux, uy, dist) {
    const ph = phaseOf(e);
    if (e.st) return dashStates(e, dt);
    if (e.ring > 0) e.ring -= dt;
    if (e.leap > 0) {
      e.leap -= dt;
      if (e.leap > .4) { const k = 1 - Math.exp(-dt * 4.5); e.x = lerp(e.x, P.x, k); e.y = lerp(e.y, P.y, k); }
      if (e.leap <= 0) { e.hidden = false; slam(e, 120, 30, ph >= 2 ? 20 : 14); SFX.bell(); }
      return Z0;
    }
    if (e.spiral > 0) { spiralTick(e, dt, ph + 2, 125, .11, false); return Z0; }
    if (e.busy <= 0 && e.cd <= 0) {
      const echoes = E.filter(x => x.ai === 'echo' && !x.dead).length;
      const k = pickAtk(e, { toll: 3.2, drop: 2, chime: 2, echo: ph >= 2 && echoes < 3 ? 1.4 : 0 });
      if (k === 'toll') {
        const n = ph + 1; let g = aimAt(e) + rnd(-1, 1);
        for (let i = 0; i < n; i++) later(e, i * .8, () => {
          HZ.push({ k: 'wave', x: e.x, y: e.y, r: e.r * .8, vr: 150 + ph * 25, gaps: [g], gw: ph === 3 ? .78 : .95, w: 18, dmg: 20, t: 0, dead: false });
          if (ph === 3) for (const o of E) if (o.ai === 'echo' && !o.dead) HZ.push({ k: 'wave', x: o.x, y: o.y, r: 12, vr: 130, gaps: [rnd(TAU)], gw: 1.2, w: 12, dmg: 14, t: 0, dead: false });
          SFX.bell(); e.ring = .35; shake(7); pulseScreen(ph === 3 ? 1.4 : 1);
          for (let s = 0; s < 14; s++) { const a = rnd(TAU); PT.push({ x: e.x + Math.cos(a) * e.r, y: e.y + Math.sin(a) * e.r, vx: Math.cos(a) * 260, vy: Math.sin(a) * 260, life: .5, max: .5, s: rnd(3, 5), c: s % 2 ? COL.yellow : COL.ink, dead: false }); }
          g += rnd(.7, 1.3) * (Math.random() < .5 ? -1 : 1);
        });
        e.busy = n * .8 + .5; e.cd = 1.1;
      } else if (k === 'drop') {
        e.leap = 1.5; e.hidden = true; e.busy = 2; e.cd = .9;
        TG.push({ kind: 'eslam', follow: e, x: e.x, y: e.y, r: 120, t: 0, dur: 1.5, dead: false });
        SFX.swish(); burst(e.x, e.y, 14, COL.ink, 200);
      } else if (k === 'chime') { e.spiral = 3.2; e.sang = rnd(TAU); e.busy = 3.4; e.cd = 1; }
      else if (k === 'echo') { for (let i = 0; i < 2; i++) { const a = rnd(TAU), r = rnd(140, 300); spawnArenaAdd('echo', Math.cos(a) * r, Math.sin(a) * r, 700); } e.busy = .8; e.cd = .8; SFX.bell(); }
    }
    const m = dist > 200 ? 1 : dist < 130 ? -.6 : 0;
    return [ux * e.spd * m, uy * e.spd * m];
  },

  loom(e, dt, ux, uy, dist) {
    const ph = phaseOf(e);
    if (e.st) return dashStates(e, dt);
    if (e.weave > 0) {
      e.weave -= dt; e.thT = (e.thT || 1.5) - dt;
      if (e.thT <= 0) { e.thT = 2.4; threads(2); }
      const dl = Math.hypot(e.x, e.y);
      return dl > 8 ? [-e.x / dl * 200, -e.y / dl * 200] : Z0;
    }
    if (e.busy <= 0 && e.cd <= 0) {
      const adds = E.filter(x => !x.dead && !x.boss).length;
      const k = pickAtk(e, { threads: 3, web: 2, lunge: 2.2, brood: adds < 8 ? 1.1 : 0, loom: ph === 3 ? (e.loomed ? 1.6 : 9) : 0 });
      if (k === 'threads') { threads(2 + ph); e.busy = 1.4; e.cd = 1; }
      else if (k === 'web') { const a = aimAt(e); for (let i = 0; i < 5; i++) fireEB(e.x, e.y, a + (i - 2) * .3, 175, 8, false, { web: .9 }); e.busy = .7; e.cd = .7; SFX.spit(); }
      else if (k === 'lunge') { const n = ph + 1; for (let i = 0; i < n; i++) later(e, i * 1.25, () => arenaDash(e, aimAt(e), 780, .45, .62)); e.busy = n * 1.25 + .2; e.cd = .7; }
      else if (k === 'brood') { for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; spawnArenaAdd('moth', e.x + Math.cos(a) * 60, e.y + Math.sin(a) * 60, 160); } e.busy = .6; e.cd = .8; SFX.thread(); }
      else if (k === 'loom') {
        e.loomed = true; e.weave = 8; e.busy = 8.2; e.cd = 1;
        const dir = Math.random() < .5 ? 1 : -1, a0 = rnd(TAU);
        for (let i = 0; i < 3; i++) HZ.push({ k: 'ray', follow: e, x: e.x, y: e.y, a: a0 + i / 3 * TAU, va: .5 * dir, len: ARENA_R * 2.1, w: 14, warn: 1.6, dur: 6.4, dmg: 20, t: 0, dead: false });
        banner('베틀', '빛줄기 사이를 돌아라', 'warn');
      }
    }
    return orbitMove(e, ux, uy, dist, 230, e.spd);
  },

  twins(e, dt) {
    const S = e.share, ph = S.phase, A = G.twins[0], B = G.twins[1];
    if (e.st) return dashStates(e, dt);
    if (e.twin === 1) return twinMove(e);
    G.twTheta += (ph === 1 ? .45 : ph === 2 ? .65 : .9) * dt * G.twDir;
    if (e.mirT > 0) {
      e.mirT -= dt; e.mrT = (e.mrT || 0) - dt;
      if (e.mrT <= 0) { e.mrT = ph === 3 ? .09 : .12; fireEB(A.x, A.y, aimAt(A), 175, 10, false); fireEB(B.x, B.y, Math.atan2(-P.y - B.y, -P.x - B.x) + rnd(-.1, .1), 175, 10, false); SFX.spit(); }
    }
    if (e.busy <= 0 && e.cd <= 0) {
      const k = pickAtk(e, { tether: ph === 1 ? 3 : ph === 2 ? 3 : 0, cross: 2.4, bounce: 3, mirror: 2.2, swap: ph >= 2 ? 1.8 : 0 });
      if (k === 'tether') { HZ.push({ k: 'tether', a: A, b: B, w: 12, warn: .9, dur: 5 + ph, dmg: 22, t: 0, dead: false }); G.twTheta += 0; if (Math.random() < .5) G.twDir *= -1; e.busy = 1; e.cd = .9; SFX.thread(); }
      else if (k === 'cross') {
        for (const t of [A, B]) { const a = Math.atan2(-t.y, -t.x), d = Math.hypot(t.x, t.y) * 2; arenaDash(t, a, 820, d / 820, .8); }
        A.onDashEnd = () => { G.twTheta += Math.PI; ringFx(0, 0, 260, COL.pink, .45, 12); ringFx(0, 0, 160, COL.ink, .35, 8); burst(0, 0, 30, COL.white, 500); burst(0, 0, 20, COL.pink, 400); shake(16); pulseScreen(1.2); G.flash = .35; SFX.boom(true); if (STATE === 'play') radial({ x: 0, y: 0 }, 16, 150, rnd(TAU), 11, false); };
        e.busy = 1.9; e.cd = .7;
      } else if (k === 'bounce') { for (const t of [A, B]) { const a = aimAt(t); const n = 7 + ph * 2; for (let i = 0; i < n; i++) fireEB(t.x, t.y, a + (i - (n - 1) / 2) * .15, 165, 12, false, { bounce: ph }); } SFX.spit(); e.busy = .8; e.cd = .6; }
      else if (k === 'mirror') { e.mirT = 1.8; e.busy = 2; e.cd = .6; }
      else if (k === 'swap') {
        G.twTheta += Math.PI;
        for (const t of [A, B]) { ringFx(t.x, t.y, 80, COL.pink, .3, 6); const th = G.twTheta + (t.twin ? Math.PI : 0); t.x = Math.cos(th) * 175; t.y = Math.sin(th) * 175; ringFx(t.x, t.y, 80, COL.ink, .3, 6); radial(t, 12, 135, rnd(TAU), 11, false); }
        for (const t of [A, B]) for (let s = 0; s < 18; s++) { const a = rnd(TAU), sp = rnd(150, 420); PT.push({ x: t.x, y: t.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: rnd(.4, .8), max: .8, s: rnd(4, 8), c: s % 3 ? COL.white : COL.pink, dead: false }); }
        G.flash = .35; pulseScreen(1); shake(10); SFX.zap(); e.busy = 1; e.cd = .8;
      }
    }
    return twinMove(e);
  },

  tide(e, dt, ux, uy, dist) {
    const ph = phaseOf(e);
    if (e.st) return dashStates(e, dt);
    if (e.under > 0) {
      e.under -= dt;
      if (Math.random() < .5) PT.push({ x: e.x + rnd(-30, 30), y: e.y + rnd(-30, 30), vx: 0, vy: -20, life: .5, max: .5, s: rnd(3, 6), c: COL.ink, dead: false });
      if (e.under > .5) { const dx = P.x - e.x, dy = P.y - e.y, dl = Math.hypot(dx, dy) || 1; return [dx / dl * 290, dy / dl * 290]; }
      if (!e.warned) { e.warned = true; TG.push({ kind: 'eslam', x: e.x, y: e.y, r: 100, t: 0, dur: .5, dead: false }); }
      if (e.under <= 0) {
        e.under = 0; e.warned = false; slam(e, 100, 30, 14);
        for (let s = 0; s < 40; s++) PT.push({ x: e.x + rnd(-26, 26), y: e.y, vx: rnd(-90, 90), vy: -rnd(300, 760), life: rnd(.5, 1), max: 1, s: rnd(4, 9), c: s % 4 ? COL.deep : COL.white, dead: false });
        splat(e.x, e.y, 210, false); ringFx(e.x, e.y, 200, COL.white, .5, 6);
        if (e.dives > 0) { e.dives--; e.under = 1.9; }
      }
      return Z0;
    }
    if (e.busy <= 0 && e.cd <= 0) {
      const pools = HZ.filter(h => h.k === 'pool' && !h.dead).length;
      const k = pickAtk(e, { dive: 1.7, wave: 3, pools: pools < 7 ? 2 : 0, spit: 2.2 });
      if (k === 'dive') { e.under = 1.9; e.dives = ph >= 2 ? 1 : 0; e.busy = e.dives ? 4.3 : 2.3; e.cd = .8; splat(e.x, e.y, 120, false); SFX.wave(); }
      else if (k === 'wave') { const a = rnd(TAU); band(e, a); if (ph >= 2) later(e, 1.3, () => band(e, a + Math.PI / 2 * (Math.random() < .5 ? 1 : -1))); if (ph === 3) later(e, 2.6, () => band(e, a + Math.PI)); e.busy = ph === 3 ? 3.4 : ph === 2 ? 2.3 : 1.3; e.cd = .8; }
      else if (k === 'pools') {
        const n = 2 + ph;
        for (let i = 0; i < n; i++) { let x, y; if (i === 0) { x = P.x; y = P.y; } else { const a = rnd(TAU), r = rnd(40, 300); x = Math.cos(a) * r; y = Math.sin(a) * r; } HZ.push({ k: 'pool', x, y, r: 72, warn: 1.3, dur: ph === 3 ? 11 : 7, dmg: 12, t: 0, dead: false }); }
        e.busy = .9; e.cd = .9; SFX.wave();
      } else if (k === 'spit') { const a = aimAt(e); for (let i = 0; i < 5; i++) fireEB(e.x, e.y, a + (i - 2) * .26, 95, 14, true, { split: { t: 1.3, n: 8, spd: 145, dmg: 9 } }); SFX.spit(); e.busy = .8; e.cd = .9; }
    }
    return [ux * e.spd, uy * e.spd];
  },

  sun(e, dt, ux, uy, dist) {
    const ph = phaseOf(e);
    if (!e.satsUp) { e.satsUp = true; spawnSats(e, 3); }
    if (e.nova > 0) {
      e.nova -= dt;
      const sec = Math.ceil(e.nova);
      if (sec !== e.novaSec && sec <= 3) { e.novaSec = sec; SFX.tick(); }
      if (Math.random() < .9) { const a = rnd(TAU), r = rnd(200, 420); PT.push({ x: e.x + Math.cos(a) * r, y: e.y + Math.sin(a) * r, vx: -Math.cos(a) * r * 1.6, vy: -Math.sin(a) * r * 1.6, life: .55, max: .55, s: rnd(3, 6), c: Math.random() < .5 ? COL.yellow : COL.pink, dead: false }); }
      if (e.nova <= 0) novaBlast(e);
      return Z0;
    }
    if (ph === 3) { e.novaCd -= dt; if (e.novaCd <= 0 && e.busy <= 0) { supernova(e); return Z0; } }
    if (e.spiral > 0) { spiralTick(e, dt, ph === 3 ? 6 : 4, 115, .12, Math.random() < .15); }
    if (e.busy <= 0 && e.cd <= 0) {
      const k = pickAtk(e, { corona: 3, flare: 2.6, rain: 2.2 });
      if (k === 'corona') { e.spiral = 3.6; e.sang = rnd(TAU); e.busy = 3.7; e.cd = .7; SFX.charge(.6); }
      else if (k === 'flare') {
        const base = aimAt(e) - .9, n = ph >= 2 ? 2 : 1;
        for (let i = 0; i < n; i++) HZ.push({ k: 'ray', follow: e, x: e.x, y: e.y, a: base + i * Math.PI, va: .75, len: ARENA_R * 2.2, w: 30, warn: 1.1, dur: 2.2, dmg: 26, t: 0, dead: false });
        e.busy = 3.4; e.cd = .8; SFX.charge(1);
      } else if (k === 'rain') {
        for (let i = 0; i < 6; i++) {
          const x = clamp(P.x + rnd(-120, 120) + P.vx * .4, -ARENA_R + 40, ARENA_R - 40), y = clamp(P.y + rnd(-120, 120) + P.vy * .4, -ARENA_R + 40, ARENA_R - 40);
          TG.push({ x, y, r: 60, t: -i * .12, dur: 1, kind: 'emeteor', dead: false, cb: () => { ringFx(x, y, 66, COL.ink, .3, 6); burst(x, y, 12, COL.deep, 220); splat(x, y, 80, false); if (STATE === 'play' && d2(P.x, P.y, x, y) < (60 + P.r) ** 2) hurtPlayer(22); if (gate('rain', 80)) SFX.boom(false); shake(4); } });
        }
        e.busy = 1.1; e.cd = .8;
      }
    }
    const dl = Math.hypot(e.x, e.y + 20);
    return dl > 6 ? [-e.x / dl * 40, -(e.y + 20) / dl * 40] : Z0;
  },
};
function twinMove(e) {
  const th = G.twTheta + (e.twin ? Math.PI : 0), tx = Math.cos(th) * 175, ty = Math.sin(th) * 175;
  return [(tx - e.x) * 4, (ty - e.y) * 4];
}
function supernova(e) {
  e.nova = 4.6; e.busy = 6; e.novaCd = 30; e.novaSec = 9;
  for (const o of OB) o.dead = true;
  const r0 = rnd(TAU);
  for (let i = 0; i < 4; i++) { const a = r0 + i / 4 * TAU; OB.push({ x: Math.cos(a) * 205, y: Math.sin(a) * 205, r: 30, t: 0, dead: false }); }
  for (const o of OB) { ringFx(o.x, o.y, 50, COL.ink, .4, 6); burst(o.x, o.y, 14, COL.deep, 200); }
  SFX.charge(4.4); SFX.thud(); shake(10);
  banner('초신성', '기둥 뒤에 숨어라', 'warn');
}
function novaShadowed(e) {
  return OB.some(o => !o.dead && d2(P.x, P.y, e.x, e.y) > d2(o.x, o.y, e.x, e.y) && segDist(o.x, o.y, e.x, e.y, P.x, P.y) < o.r - 3);
}
function novaBlast(e) {
  const safe = novaShadowed(e);
  G.novaFx = { x: e.x, y: e.y, t0: performance.now(), rot: rnd(TAU) };
  G.flash = .3; G.hitstop = .22; G.slowT = .9; shake(32); SFX.nova(); SFX.roar(); buzz([120, 40, 260]);
  for (let i = 0; i < 6; i++) G.later.push({ t: i * .09, fn: () => { ringFx(e.x, e.y, 260 + i * 200, i % 2 ? COL.yellow : COL.pink, .6, 18 - i * 2); burst(e.x, e.y, 30, i % 2 ? COL.yellow : COL.white, 900); } });
  for (const b of EB) b.dead = true;
  if (!safe && STATE === 'play') hurtPlayer(P.maxHp * .72 / (G.rf.dmg * P.armorMul * (1 + G.rel.taken)), true);
  else TX.push({ x: P.x, y: P.y - 24, vy: -36, life: 1, max: 1, v: '숨었다', crit: false, healTxt: true, dead: false });
  G.later.push({ t: 2.3, fn: () => { for (const o of OB) { o.dead = true; burst(o.x, o.y, 16, COL.deep, 220); splat(o.x, o.y, 70, false); } } });
}
function arenaBossDown(e) {
  const g = G.gate;
  G.boss = null; $('bossBar').hidden = true;
  for (const h of HZ) h.dead = true;
  for (const o of OB) o.dead = true;
  for (const b of EB) b.dead = true;
  G.darkT = 0; G.freeze = 0; G.pull = 0;
  for (const o of E) if (!o.dead) { o.dead = true; burst(o.x, o.y, 8, COL.ink, 160); splat(o.x, o.y, o.r * 2.4, false); }
  STATE = 'winning'; G.winT = 4.4; G.slowT = 2.4; G.hitstop = .3; shake(22); G.flash = .9;
  SFX.roar(); buzz([60, 50, 220]);
  const bodies = e.share ? G.twins : [e];
  for (let i = 0; i < 9; i++) G.later.push({ t: i * .16, fn: () => {
    for (const b of bodies) { ringFx(b.x + rnd(-40, 40), b.y + rnd(-40, 40), rnd(90, 170), i % 2 ? COL.pink : COL.ink, .45, 9); burst(b.x, b.y, 24, i % 3 === 0 ? COL.yellow : i % 2 ? COL.pink : COL.deep, 340); splat(b.x + rnd(-60, 60), b.y + rnd(-60, 60), 150, i % 2 === 1); }
    SFX.boom(i === 8); shake(10);
  } });
  if (g.id === 'unknown') unknownDown(e);
  else G.later.push({ t: 1.5, fn: () => { G.flash = 1; banner('격파', g.name, 'good'); SFX.win(); } });
}

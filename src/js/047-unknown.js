/* ================= UNKNOWN: the scribble with no face ================= */
const CW = 180, CL = 3500;
const U_FLOORS = [null, 5 / 6, 4 / 6, 3 / 6, 2 / 6, 2 / 6, 1 / 6, 0];
const U_MIN = [0, 55, 55, 60, 60, 0, 65, 230];
const U_LINES = [null, null, '그것은 이름이 없다.', '보면 볼수록 늘어난다.', '벽 너머에도 있었다.', '도망쳐.', '길은 그것이 만든다. 그리고 지운다.', '끝까지 지워지지 않는다.'];

function freshU() { return { stage: 'arena', circle: true, circleR: ARENA_R, corr: false, broken: false, scarred: false, segs: [], carvers: [], chaseT: 0, mazeT: 0 }; }
function walkable(x, y) {
  const u = G.u; if (!u) return true;
  if (u.circle && x * x + y * y < u.circleR * u.circleR) return true;
  if (u.rect && Math.abs(x) < RW && Math.abs(y) < RH) return true;
  if (u.corr && Math.abs(x) < CW / 2 && y > 0 && y < ARENA_R + CL + 40) return true;
  for (const s of u.segs) if (segDist(x, y, s.x1, s.y1, s.x2, s.y2) < segW(s) / 2) return true;
  return false;
}
const segW = s => s.w * clamp(s.t / .3, 0, 1) * clamp((s.life - s.t) / 1.6, 0, 1);

/* nearest point the player may stand on (walls are solid everywhere) */
function nearestWalk(x, y, r) {
  const u = G.u; let bx = x, by = y, bd = Infinity;
  const take = (px, py) => { const d = (px - x) ** 2 + (py - y) ** 2; if (d < bd) { bd = d; bx = px; by = py; } };
  if (u.circle) { const dl = Math.hypot(x, y) || 1, lim = u.circleR - r; if (dl > lim) take(x / dl * lim, y / dl * lim); else take(x, y); }
  if (u.rect) take(clamp(x, -RW + r, RW - r), clamp(y, -RH + r, RH - r));
  if (u.corr) take(clamp(x, -CW / 2 + r, CW / 2 - r), clamp(y, (u.circle ? 0 : ARENA_R - 40) + r, ARENA_R + CL + 40 - r));
  for (const sg of u.segs) {
    const w = segW(sg) / 2 - r; if (w <= 3) continue;
    const dx = sg.x2 - sg.x1, dy = sg.y2 - sg.y1, l2 = dx * dx + dy * dy || 1, t = clamp(((x - sg.x1) * dx + (y - sg.y1) * dy) / l2, 0, 1);
    const cx = sg.x1 + dx * t, cy = sg.y1 + dy * t, d = Math.hypot(x - cx, y - cy);
    if (d <= w) take(x, y); else take(cx + (x - cx) / d * w, cy + (y - cy) / d * w);
    if (bd === 0) break;
  }
  return bd === Infinity ? null : [bx, by, Math.sqrt(bd)];
}
function pushOffRocks() {
  for (const o of OB) {
    if (o.dead) continue;
    const dx = P.x - o.x, dy = P.y - o.y, d = Math.hypot(dx, dy) || 1, mn = o.r + P.r;
    if (d >= mn) continue;
    P.x = o.x + dx / d * mn; P.y = o.y + dy / d * mn;
    // glance off instead of sticking: slide around the rock toward the open side
    const vin = -(P.vx * dx + P.vy * dy) / d;
    if (vin > 5) {
      let side = Math.sign(-dy * P.vx + dx * P.vy);
      if (o.lane !== undefined) {
        const dir = Math.sign(o.lane - P.x);
        if (dir) P.x += dir * Math.min(Math.max(vin, 120), 260) / 60;
        continue;
      }
      if (Math.abs(dx) < o.r * .5 || side === 0) side = dx >= 0 ? 1 : -1;
      const tx = -dy / d, ty = dx / d, k = Math.min(vin, 260) / 60 * Math.sign(side);
      P.x += tx * k * Math.sign(dx * 0 + 1); P.y += ty * k;
    }
  }
}
function uClampPlayer() {
  const u = G.u, r = P.r + 2;
  if (!u || u.stage === 'arena') {
    pushOffRocks();
    const lim = (u ? u.circleR : ARENA_R) - r, dl = Math.hypot(P.x, P.y);
    if (dl > lim) { P.x *= lim / dl; P.y *= lim / dl; }
    return;
  }
  // rocks and walls are solved together a few times so a rock can never shove you through a wall
  for (let it = 0; it < 3; it++) {
    pushOffRocks();
    const nw = nearestWalk(P.x, P.y, r);
    if (!nw || nw[2] < .01) break;
    // a path that closed right under you leaves you in the dark: no rescue, you must run out
    if (u.stage === 'maze' && nw[2] > 40) break;
    P.x = nw[0]; P.y = nw[1];
    if (nw[2] > 0) { const sp = Math.hypot(P.vx, P.vy); if (sp > 0) { P.vx *= .92; P.vy *= .92; } }
  }
}

function uGrowTents(e, n) {
  while (e.tents.length < Math.min(14, n)) {
    const a = rnd(TAU);
    e.tents.push({ a, len: 0, want: rnd(140, 220), ph: rnd(TAU), rot: rnd(-.25, .25) });
    burst(e.x + Math.cos(a) * e.r, e.y + Math.sin(a) * e.r, 14, COL.deep, 300);
    splat(e.x + Math.cos(a) * e.r * 1.3, e.y + Math.sin(a) * e.r * 1.3, 70, false);
  }
}
function uTick(e, dt) {
  for (const t of e.tents) { t.a += t.rot * dt; t.len = lerp(t.len, t.want + e.phase * 12, 1 - Math.exp(-dt * 3)); }
  for (const l of e.lashes) l.t += dt;
  e.lashes = e.lashes.filter(l => l.t < l.warn + .7);
  if (e.shieldT > 0) e.shieldT -= dt;
}

BRAIN.unknown = function (e, dt, ux, uy, dist) {
  const u = G.u;
  uTick(e, dt);
  G.uPhaseT = (G.uPhaseT || 0) + dt;
  if (e.tents.length < Math.min(14, e.phase * 2)) uGrowTents(e, e.phase * 2);
  if (u.stage === 'final') return uFinal(e, dt);
  if (u.stage !== 'arena') return uChase(e, dt, ux, uy, dist);
  if (e.phase < 7 && e.phase !== 5 && e.hp <= e.maxHp * U_FLOORS[e.phase] + 1 && G.uPhaseT >= U_MIN[e.phase]) { startUCut(e.phase + 1); return Z0; }
  if (e.phase === 7) { u.circleR = Math.max(ARENA_R * .6, u.circleR - dt * 1.2); e.hpFloor = G.uPhaseT < U_MIN[7] ? 1 : 0; }
  const ph = e.phase, sp = ph >= 6 ? .75 : 1;
  if (e.busy <= 0 && e.cd <= 0) {
    const k = pickAtk(e, { lash: 3, scrawl: 2, smear: 1.4, sweep: ph >= 2 ? 2 : 0, grasp: ph >= 3 ? 2 : 0, storm: ph >= 4 ? 1.7 : 0, erase: ph >= 6 ? 1.8 : 0 });
    if (k === 'lash') {
      const n = 1 + Math.floor(ph / 2);
      for (let i = 0; i < n; i++) later(e, i * .42 * sp, () => {
        const a = aimAt(e) + rnd(-.12, .12), len = 660, w = .62 * sp;
        HZ.push({ k: 'line', x1: e.x, y1: e.y, x2: e.x + Math.cos(a) * len, y2: e.y + Math.sin(a) * len, w: 36, warn: w, dur: .3, dmg: 28, t: 0, dead: false, tent: 1 });
        e.lashes.push({ a, t: 0, warn: w, len }); SFX.swish();
      });
      e.busy = n * .42 * sp + .9; e.cd = .5;
    } else if (k === 'sweep') {
      const dir = Math.random() < .5 ? 1 : -1;
      HZ.push({ k: 'ray', follow: e, x: e.x, y: e.y, a: aimAt(e) - dir * 1.25, va: 1.5 * dir / sp, len: 560, w: 42, warn: .9 * sp, dur: 1.7, dmg: 26, t: 0, dead: false, tent: 1 });
      SFX.charge(.8); e.busy = 2.7 * sp; e.cd = .6;
    } else if (k === 'grasp') {
      const n = 5 + ph, cx = P.x, cy = P.y;
      for (let i = 0; i < n; i++) { const a = i / n * TAU, x = cx + Math.cos(a) * 125, y = cy + Math.sin(a) * 125; TG.push({ kind: 'grasp', x, y, r: 44, t: -i * .05, dur: .9 * sp, dead: false, cb: () => uGrab(x, y, 44) }); }
      TG.push({ kind: 'grasp', x: cx, y: cy, r: 54, t: -.55, dur: .9 * sp, dead: false, cb: () => uGrab(cx, cy, 54) });
      e.busy = 1.7 * sp; e.cd = .6;
    } else if (k === 'scrawl') {
      const base = rnd(TAU), streams = ph >= 4 ? 4 : 3;
      for (let s = 0; s < streams; s++) for (let i = 0; i < 10; i++) later(e, i * .08, () => fireEB(e.x, e.y, base + s * TAU / streams + rnd(-.1, .1), 150, 11, false, { wig: 2.4, life: 5 }));
      SFX.scratch(); e.busy = 1.3; e.cd = .6;
    } else if (k === 'smear') {
      for (let i = 0; i < 3; i++) { let x = P.x, y = P.y; if (i) { const a = rnd(TAU), r = rnd(60, 180); x += Math.cos(a) * r; y += Math.sin(a) * r; } HZ.push({ k: 'pool', x, y, r: 74, warn: 1, dur: 6, dmg: 12, t: 0, dead: false, scrib: 1 }); }
      SFX.scratch(); e.busy = .9; e.cd = .6;
    } else if (k === 'storm') {
      const n = 4 + ph;
      for (let i = 0; i < n; i++) { const px = i ? rnd(-250, 250) : P.x, py = i ? rnd(-250, 250) : P.y, [x1, y1, x2, y2] = chordThrough(px, py, rnd(TAU)); HZ.push({ k: 'line', x1, y1, x2, y2, w: 14, warn: 1.1, dur: 1.4, dmg: 20, t: 0, dead: false, scrib: 1 }); }
      SFX.scratch(); SFX.thread(); e.busy = 1.7; e.cd = .7;
    } else if (k === 'erase') {
      const a = rnd(TAU);
      HZ.push({ k: 'erase', nx: Math.cos(a), ny: Math.sin(a), warn: 1.5, dur: 2.6, dmg: 16, t: 0, dead: false });
      banner('지움', '반쪽이 사라진다', 'warn'); SFX.whisper(); e.busy = 1.8; e.cd = .6;
    }
  }
  const want = 170, m = dist > want ? 1 : -.4, spd = 40 + ph * 7;
  return [ux * spd * m, uy * spd * m];
};
function uGrab(x, y, r) {
  for (let s = 0; s < 10; s++) PT.push({ x: x + rnd(-r, r) * .6, y: y + rnd(-r, r) * .6, vx: rnd(-60, 60), vy: -rnd(100, 300), life: .5, max: .5, s: rnd(3, 7), c: COL.deep, dead: false });
  splat(x, y, r * 1.6, false);
  if (STATE === 'play' && d2(P.x, P.y, x, y) < (r + P.r * .5) ** 2) hurtPlayer(24);
  if (gate('grab', 70)) { SFX.thud(); shake(4); }
}

/* ---------- act five: the wall, the corridor, the shifting paths ---------- */
function uChase(e, dt, ux, uy, dist) {
  const u = G.u;
  if (u.stage === 'flee') {
    u.circleR = Math.max(70, u.circleR - dt * 34);
    if (P.y > ARENA_R + 30 && Math.abs(P.x) < CW / 2) {
      u.stage = 'chase'; u.circle = false; u.chaseT = 0; u.nextRubble = P.y + 520;
      e.x = 0; e.y = P.y - 380; G.sprint = 1.6; AU.track = 'chase';
      SFX.roar(); pulseScreen(2); shake(20); G.flash = .4; buzz([60, 30, 120]);
      banner('달려', '뒤돌아보지 마라', 'warn');
    }
    return [ux * 95, uy * 95];
  }
  if (u.stage === 'chase') {
    u.chaseT += dt;
    G.camZoom = lerp(G.camZoom || 1, .72, 1 - Math.exp(-dt * 2));
    const v = dist > 520 ? Math.max(230, P.speed * G.sprint * .97) : 212 + u.chaseT * 3.5;
    e.x = lerp(e.x, P.x * .5, 1 - Math.exp(-dt * 2)); e.y = Math.min(e.y + v * dt, P.y - 34);
    if (dist < e.r + 40) { hurtPlayer(32); P.y += 4; }
    while (P.y + 700 > u.nextRubble && u.nextRubble < ARENA_R + CL - 380) {
      const gap = pick([-62, 0, 62]);
      for (const x of [-62, 0, 62]) if (x !== gap) OB.push({ x, y: u.nextRubble, r: 30, t: 0, dead: false, lane: gap ? gap * 60 / 62 : 0 });
      u.nextRubble += rnd(250, 330);
    }
    for (const o of OB) if (o.y < P.y - 700) o.dead = true;
    u.debT = (u.debT || 0) - dt;
    if (u.debT <= 0) {
      u.debT = .65;
      const x = rnd(-CW / 2 + 22, CW / 2 - 22), y = P.y + rnd(170, 380);
      TG.push({ x, y, r: 40, t: 0, dur: .9, kind: 'emeteor', dead: false, cb: () => { ringFx(x, y, 46, COL.ink, .3, 5); burst(x, y, 10, COL.deep, 200); splat(x, y, 60, false); if (STATE === 'play' && d2(P.x, P.y, x, y) < (40 + P.r * .5) ** 2) hurtPlayer(18); if (gate('deb', 90)) SFX.boom(false); shake(4); } });
    }
    u.beat = (u.beat || 0) - dt;
    if (u.beat <= 0) { u.beat = Math.max(.32, .55 - u.chaseT * .012); SFX.thud(); pulseScreen(.45); buzz(12); }
    if (P.y > ARENA_R + CL - 140) startMaze(e);
    return Z0;
  }
  if (u.stage === 'maze') {
    u.mazeT += dt;
    G.camZoom = lerp(G.camZoom || 1, .8, 1 - Math.exp(-dt * 2));
    // carving heads run a little ahead of the player, fanned away from the thing
    const ax = P.x - e.x, ay = P.y - e.y, al = Math.hypot(ax, ay) || 1, away = Math.atan2(ay / al, ax / al);
    const runSpd = P.speed * (G.sprint || 1);
    u.carvers.forEach((c, i) => {
      const fan = (i - 1) * .75 + Math.sin(u.mazeT * .7 + i * 2) * .35, lead = 230 + i % 2 * 60;
      const tx = P.x + Math.cos(away + fan) * lead, ty = P.y + Math.sin(away + fan) * lead;
      const dx = tx - c.x, dy = ty - c.y, dd = Math.hypot(dx, dy);
      if (d2(c.x, c.y, P.x, P.y) > 620 * 620) { u.segs.push({ x1: P.x, y1: P.y, x2: P.x + Math.cos(away + fan) * 140, y2: P.y + Math.sin(away + fan) * 140, w: 130, t: .3, life: 10 }); c.x = c.px = P.x + Math.cos(away + fan) * 140; c.y = c.py = P.y + Math.sin(away + fan) * 140; return; }
      const want = Math.atan2(dy, dx); let df = Math.atan2(Math.sin(want - c.a), Math.cos(want - c.a));
      c.a += clamp(df, -4 * dt, 4 * dt) + rnd(-1, 1) * dt * 1.6;
      const spd = dd > 60 ? Math.max(330, runSpd * 1.25) : runSpd * .9;
      c.x += Math.cos(c.a) * spd * dt; c.y += Math.sin(c.a) * spd * dt;
      c.acc += dt;
      if (c.acc > .08) { c.acc = 0; u.segs.push({ x1: c.px, y1: c.py, x2: c.x, y2: c.y, w: rnd(120, 150), t: 0, life: rnd(9, 12) }); c.px = c.x; c.py = c.y; }
    });
    for (const s of u.segs) s.t += dt;
    u.segs = u.segs.filter(s => s.t < s.life);
    if (STATE === 'play' && !walkable(P.x, P.y)) { hurtPlayer(14); if (Math.random() < .5) PT.push({ x: P.x + rnd(-14, 14), y: P.y + rnd(-14, 14), vx: rnd(-40, 40), vy: rnd(-40, 40), life: .4, max: .4, s: rnd(3, 6), c: COL.deep, dead: false }); }
    u.beat = (u.beat || 0) - dt;
    if (u.beat <= 0) { u.beat = .6; SFX.thud(); }
    if (u.mazeT > 45) { startUCut(6); return Z0; }
    if (dist < e.r + 14 && STATE === 'play') { P.x += ux * 5; P.y += uy * 5; }
    const v = Math.min(P.speed * (G.sprint || 1) * .8, 140 + u.mazeT * 1.5);
    return [ux * v, uy * v];
  }
  return Z0;
}
function startMaze(e) {
  const u = G.u, ey = ARENA_R + CL;
  u.stage = 'maze'; u.mazeT = 0; u.segs = []; u.carvers = [];
  u.segs.push({ x1: 0, y1: ey - 220, x2: 0, y2: ey + 160, w: 320, t: 1, life: 14 });
  for (const a of [Math.PI / 2 - .9, Math.PI / 2, Math.PI / 2 + .9]) u.carvers.push({ x: 0, y: ey + 220, px: 0, py: ey + 220, a, acc: 0 });
  for (const o of OB) o.dead = true;
  G.sprint = 1.35;
  banner('길을 따라', '그것이 길을 파고, 지운다. 어둠은 밟지 마라', 'warn');
  SFX.roar(); pulseScreen(1.6); shake(14);
}

/* ---------- act changes ---------- */
function startUCut(next) {
  const e = G.boss;
  STATE = 'cut'; G.cut = { t: 0, next, dur: next === 7 ? 15.5 : next === 5 ? 7 : next === 6 ? 4.8 : 4 };
  for (const b of EB) b.dead = true;
  for (const h of HZ) h.dead = true;
  for (const t of TG) t.dead = true;
  INPUT.joy = null; updMove();
  e.inv = 99; e.busy = 0; e.st = '';
  G.hitstop = .25; G.flash = .7; shake(22); pulseScreen(2); SFX.roar(); buzz([60, 40, 160]);
  const c = $('cutscene'); c.hidden = false; c.className = ''; void c.offsetWidth; c.className = 'on';
  $('cutEye').textContent = next + '막 / 7';
  $('cutLine').textContent = next === 7 ? '' : U_LINES[next];
  AU.track = 'silent';
}
function updateCut(rdt) {
  if (G.cut.kind === 'finish') return updateFinisher(rdt);
  if (G.cut.next === 7) return updateAct7(rdt);
  const c = G.cut, e = G.boss, u = G.u;
  c.t += rdt; const t = c.t;
  const prevT = t - rdt, hit = tm => prevT < tm && t >= tm;
  e.t += rdt; uTick(e, rdt);
  let fx = e.x, fy = e.y, z = .85;
  if (t > .7 && t < 2.2) uGrowTents(e, Math.min(14, Math.round(lerp((c.next - 1) * 2, c.next * 2, (t - .7) / 1.5))));
  if (hit(1) || hit(1.6)) { SFX.scratch(); pulseScreen(1); shake(10); }
  if (c.next === 5) {
    if (t > 1.6) { fx = 0; fy = lerp(e.y, ARENA_R - 40, ease(clamp((t - 1.6) / .8, 0, 1))); z = .75; }
    [2.2, 3, 3.8].forEach((tm, i) => {
      if (hit(tm)) {
        e.lashes.push({ a: Math.atan2(ARENA_R - e.y, -e.x), t: 0, warn: .05, len: Math.hypot(e.x, ARENA_R - e.y) + 30 });
        for (let s = 0; s < 22; s++) PT.push({ x: rnd(-70, 70), y: ARENA_R, vx: rnd(-200, 200), vy: rnd(-300, 200), life: rnd(.5, 1), max: 1, s: rnd(4, 10), c: s % 3 ? COL.deep : COL.pink, dead: false });
        DC.push({ x: rnd(-30, 30), y: ARENA_R - 10, s: 160 + i * 40, rot: rnd(TAU), img: SP.crack, life: 40, a: .7, dead: false });
        shake(14 + i * 5); pulseScreen(1.2 + i * .3); SFX.boom(i === 2); buzz(40);
      }
    });
    if (hit(3.8)) {
      u.broken = true; u.corr = true; G.flash = .7; SFX.boom(true); SFX.roar();
      for (let s = 0; s < 60; s++) PT.push({ x: rnd(-90, 90), y: ARENA_R + rnd(-10, 10), vx: rnd(-160, 160), vy: rnd(120, 600), life: rnd(.8, 1.4), max: 1.4, s: rnd(6, 14), c: s % 4 ? COL.deep : COL.ink, dead: false });
    }
    if (t > 4.1) { fy = lerp(ARENA_R - 40, ARENA_R + 420, ease(clamp((t - 4.1) / 1.6, 0, 1))); z = .7; }
    if (t > 5.9) { fx = P.x; fy = lerp(ARENA_R + 420, P.y, ease(clamp((t - 5.9) / .9, 0, 1))); }
  }
  if (c.next === 6) {
    G.cutBlack = t < 1 ? t : t < 1.5 ? 1 : Math.max(0, 1 - (t - 1.5) / .9);
    if (hit(1.2)) {
      G.u = freshU(); G.u.scarred = true;
      P.x = 0; P.y = 210; P.vx = P.vy = 0; e.x = 0; e.y = -150; e.kx = e.ky = 0;
      for (const o of OB) o.dead = true;
      G.sprint = 1; DC.length = 0;
    }
    if (t < 1.2) { fx = P.x; fy = P.y; }
  }
  G.camX = lerp(G.camX, fx, 1 - Math.exp(-rdt * 5)); G.camY = lerp(G.camY, fy, 1 - Math.exp(-rdt * 5));
  if (c.next === 6 && hit(1.2)) { G.camX = e.x; G.camY = e.y; }
  G.camZoom = lerp(G.camZoom || 1, z, 1 - Math.exp(-rdt * 3));
  updateFx(rdt); updateRings(rdt); sweep(PT); sweep(RG); sweep(DC); sweep(OB);
  if (G.flash > 0) G.flash -= rdt * 1.4;
  G.shake *= Math.exp(-rdt * 5);
  if (t > c.dur) endCut();
}
function endCut() {
  const c = G.cut, e = G.boss;
  e.phase = c.next; e.inv = 0; e.cd = 1.4; G.uPhaseT = 0;
  e.hpFloor = e.maxHp * U_FLOORS[e.phase];
  if (e.phase === 7) { e.hpFloor = 1; e.inv = 1e9; e.hp = e.maxHp; hudCache = {}; }
  P.hp = P.maxHp; heal(0);
  G.cutBlack = 0; G.camZoom = 1;
  const el = $('cutscene'); el.classList.add('out'); setTimeout(() => { if (STATE !== 'cut') el.hidden = true; }, 700);
  STATE = 'play';
  AU.track = e.phase === 5 ? 'chase' : 'unknown'; AU.uPhase = e.phase;
  $('bossName').textContent = 'UNKNOWN · ' + e.phase + '/7'; hudCache = {};
  if (e.phase === 5) { G.u.stage = 'flee'; banner('도망쳐', '무너진 벽 너머로 달려라', 'warn'); }
  if (e.phase === 3 || e.phase === 6 || e.phase === 7) { G.relicPend++; G.relicDelay = .8; }
}
function unknownDown(e) {
  G.unravel = { t0: performance.now(), x: e.x, y: e.y };
  G.winT = 7.5; G.slowT = 3; AU.track = 'silent'; G.u.circleR = ARENA_R;
  G.later.push({ t: 1, fn: () => { SFX.whisper(); } });
  G.later.push({ t: 2.6, fn: () => { banner('지워졌다', 'UNKNOWN', 'good'); AU.track = ''; SFX.win(); } });
}

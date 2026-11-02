/* ================= story: chases =================
   One chase in each land, each with its own trouble on the way, and the same ending:
   run ahead to the lever past the gate, wait, and drop the gate on the beast as it
   charges through. Too early and it smashes the gate and comes again; too late and it
   reaches you.
     meadow  the boar king: herds stampede down the side lanes, the king charges the road
     roots   the root serpent: a tide of roots from behind, thorns rising in time ahead
     sand    the sand crawler: dashes down the road or a side street, throws rocks to block it
     snow    the frost beast: avalanches sweep from the north; hide behind the rocks
     ink     the eraser hand: columns of the page are rubbed out; ink drips from above */
const CHASE_KIND = {
  meadow: { name: '멧돼지 왕', hint: '떼가 지나가는 길을 보고 건너라', col: '#7A5A40', fog: 'rgba(240,230,190,', branch: 1 },
  roots: { name: '뿌리 뱀', hint: '가시가 가라앉는 틈을 노려라', col: '#3E2F2A', fog: 'rgba(60,110,90,', branch: 0 },
  sand: { name: '모래 크롤러', hint: '갈림길로 피해라. 끝에 문이 있다', col: '#B0945C', fog: 'rgba(230,200,140,', branch: 1 },
  snow: { name: '서리 짐승', hint: '눈사태가 오면 바위 뒤에 숨어라', col: '#E9F4F6', fog: 'rgba(235,245,250,', branch: 0 },
  ink: { name: '지우개 손', hint: '지워지는 줄을 피해라', col: '#FF8FB8', fog: 'rgba(37,53,111,', branch: 0 },
};

/* ---------- the map: a long road, side streets, and a gate near the end ---------- */
function genChaseMap(A) {
  const K2 = CHASE_KIND[A.chase.kind], w = A.w, h = A.h, mid = Math.floor(h / 2), R = mulberry((A.seed || 5) * 9 + 3);
  const g = Array.from({ length: h }, () => Array(w).fill('#'));
  const open = (x, y, ch) => { if (x > 0 && y > 0 && x < w - 1 && y < h - 1) g[y][x] = ch || '.'; };
  const wide = A.chase.kind === 'snow' || A.chase.kind === 'ink' ? 2 : 1;
  for (let x = 0; x < w; x++) for (let y = mid - wide; y <= mid + wide; y++) if (y > 0 && y < h - 1) g[y][x] = '.';
  const finStart = w - 26, gateX = w - 16, leverX = w - 6;
  const branches = [];
  if (K2.branch) {
    for (let x = 7; x < finStart - 3; x += 7 + Math.floor(R() * 3)) branches.push(x);
    for (const bx of branches) for (let y = 2; y <= h - 3; y++) { open(bx, y); open(bx + 1, y); }
    // side streets along the top and bottom tie the branches together
    for (let i = 0; i < branches.length - 1; i++) for (let x = branches[i]; x <= branches[i + 1] + 1; x++) { open(x, 2); open(x, 3); open(x, h - 3); open(x, h - 4); }
  }
  const shelters = [];
  if (A.chase.kind === 'snow') for (let x = 6; x < finStart - 2; x += 5 + Math.floor(R() * 3)) { g[mid - wide][x] = 'o'; shelters.push(x); }
  if (A.chase.kind === 'roots') for (let x = 6; x < finStart - 4; x += 9) { open(x, mid - 2); open(x + 1, mid - 2); open(x, mid + 2); }
  // the last stretch is a tight corridor; the lever waits in a nook past the gate
  for (let x = finStart; x < w; x++) for (let y = 1; y < h - 1; y++) if (Math.abs(y - mid) > 1) g[y][x] = '#';
  open(leverX, mid - 2); open(leverX + 1, mid - 2);
  // grass and dirt for some colour
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) if (g[y][x] === '.') { const v = vnoise(x, y, 3, A.seed || 5); if (A.chase.kind === 'meadow' || A.chase.kind === 'roots') { if (v > .45) g[y][x] = ','; } else if (A.chase.kind === 'sand' && v > .62) g[y][x] = '+'; }
  for (let y = mid - 1; y <= mid + 1; y++) { g[y][0] = '<'; g[y][w - 1] = '>'; }
  A.cinfo = { mid, wide, branches, finStart, gateX, leverX, shelters };
  A.ents = [['trap', leverX, mid - 2, {}]];
  return g.map(r => r.join(''));
}

/* ---------- starting, hurting, finishing ---------- */
function chaseStart(how) {
  const C = WD.A.chase; WD.chase = null;
  if (!C || sf(C.flag)) return;
  if (how && how.side && how.side !== 'W') return;
  const I = WD.A.cinfo;
  WD.chase = { kind: C.kind, t: -1.6, phase: 'run', next: 1.2, haz: [], rocks: [], wall: P.x - 600, beast: null, gate: { down: 0, want: 0, broken: 0 }, bump: 0, trail: [] };
  WD.tmpBlk = new Map(); refreshBlk();
  setTimeout(() => { if (WD && WD.chase) { banner(L('도망쳐') + ' · ' + L(CHASE_KIND[C.kind].name), L(CHASE_KIND[C.kind].hint), 'warn'); SFX.roar(); shake(12); } }, 300);
}
function chaseHurt(pct, kx, ky) {
  if (STATE !== 'play' || P.inv > 0 || P.dashT > 0) return false;
  if (P.hp <= P.maxHp * pct + 1) { hurtPlayer(P.hp * 99 + 9999, true); return true; }
  P.hp -= P.maxHp * pct; P.inv = 1.1; P.vx += kx || 0; P.vy += ky || 0;
  G.flash = .4; shake(14); SFX.hurt && SFX.hurt(); buzz([40, 30, 40]);
  return true;
}
function chaseWin() {
  const c = WD.chase, C = WD.A.chase;
  c.phase = 'won'; c.wonT = 0;
  banner(L('끼었다'), josa(L(CHASE_KIND[C.kind].name), '이', '가') + ' ' + L('문에 깔렸다'), 'good');
  SFX.boom(true); SFX.roar(); shake(26); G.flash = .6; G.hitstop = .25; buzz([80, 40, 120]);
  const b = c.beast; for (let i = 0; i < 60; i++) { const a = rnd(TAU), v = rnd(100, 500); PT.push({ x: b.x, y: b.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 100, life: rnd(.5, 1.2), max: 1.2, s: rnd(3, 8), c: i % 3 ? CHASE_KIND[C.kind].col : COL.ink, dead: false }); }
  for (let i = 0; i < 4; i++) G.later.push({ t: i * .15, fn: () => ringFx(b.x, b.y, 90 + i * 60, i % 2 ? COL.pink : COL.ink, .5, 8) });
  G.later.push({ t: 1.8, fn: () => { if (!WD || !WD.chase) return; setf(C.flag); WD.chase = null; WD.tmpBlk = null; refreshBlk(); banner(L('빠져나왔다'), L('길이 열렸다'), 'good'); SFX.win(); gainStoryXp(140 * WD.reg); persist(); } });
}
function chaseLever(e) {
  const c = WD.chase; if (!c) return dialog([['', L('녹슨 지렛대다. 지금은 쓸 일이 없다.')]]);
  if (c.gate.want) return;
  c.gate.want = 1; SFX.clank(); buzz(25); shake(4);
}

/* ---------- every frame ---------- */
function chaseTick(dt) {
  const c = WD.chase; if (!c) return;
  const I = WD.A.cinfo, mid = I.mid, now = performance.now() / 1000;
  c.t += dt;
  // the gate falls fast once the lever is pulled, and rises slowly when it is reset
  c.gate.down = c.gate.want ? Math.min(1, c.gate.down + dt * 9) : Math.max(0, c.gate.down - dt * 1.2);
  const gateShut = c.gate.down > .85;
  // gate tiles block while it is down
  const want = new Map(); if (gateShut) for (let y = mid - 1; y <= mid + 1; y++) want.set(y * WD.w + I.gateX, 1);
  for (const r of c.rocks) for (const k of r.tiles) want.set(k, 1);
  const key = [...want.keys()].join(','); if (key !== c.blkKey) { c.blkKey = key; WD.tmpBlk = want; refreshBlk(); }
  c.rocks = c.rocks.filter(r => (r.life -= dt) > 0);
  // nothing else lives on this road
  for (const e of E) if (!e.dead && !e.boss) { e.dead = true; burst(e.x, e.y, 6, COL.ink, 150); }
  if (c.phase === 'run') {
    if (P.x > (I.gateX + 2) * TL) { chaseFinal(); return; }
    if (c.t > 0) chaseSchedule(c, dt, I);
    if (c.kind === 'roots') {
      // the tide behind
      c.wall += (P.speed || 165) * .78 * dt * (c.t > 0 ? 1 : 0); c.wall = Math.max(c.wall, P.x - 560);
      if (P.x - c.wall < 30) { if (chaseHurt(.2, 260, 0)) { P.x = c.wall + 140; } }
      shake(clamp(4 - (P.x - c.wall) / 90, 0, 4));
    }
  }
  // hazards
  for (const hz of c.haz) chaseHazard(c, hz, dt, I);
  c.haz = c.haz.filter(hz => !hz.done);
  if (c.phase === 'final' || c.phase === 'retreat') chaseFinalTick(c, dt, I);
  if (c.phase === 'won' && c.beast) { c.wonT += dt; c.beast.squash = Math.min(1, c.wonT * 3); }
  // dust in the air
  if (Math.random() < .5) PT.push({ x: P.x + rnd(-500, 500), y: P.y + rnd(-300, 300), vx: c.kind === 'snow' ? rnd(-20, 20) : rnd(-60, -20), vy: c.kind === 'snow' ? rnd(30, 60) : rnd(-10, 10), life: 1.6, max: 1.6, s: rnd(2, 4), c: c.kind === 'ink' ? COL.ink : c.kind === 'snow' ? COL.white : CHASE_KIND[c.kind].col, dead: false });
}
function chaseSchedule(c, dt, I) {
  c.next -= dt; if (c.next > 0) return;
  const mid = I.mid, roadY0 = (mid - I.wide) * TL, roadY1 = (mid + I.wide + 1) * TL;
  const near = I.branches.filter(bx => Math.abs((bx + 1) * TL - P.x) < 420 && bx < I.finStart);
  const r = Math.random();
  if (c.kind === 'sand') {
    c.next = rnd(1.5, 2.4);
    if (r < .42) c.haz.push({ type: 'lane', dir: 'h', a0: roadY0, a1: roadY1, sign: Math.random() < .5 ? 1 : -1, t: 0, warn: .95, spd: 1400, beast: 1 });
    else if (r < .72 && near.length) { const bx = pick(near); c.haz.push({ type: 'lane', dir: 'v', a0: bx * TL, a1: (bx + 2) * TL, sign: Math.random() < .5 ? 1 : -1, t: 0, warn: .85, spd: 1300, beast: 1 }); }
    else chaseThrowRock(c, I);
  } else if (c.kind === 'meadow') {
    c.next = rnd(1.2, 1.9);
    if (r < .62 && near.length) { const bx = pick(near); c.haz.push({ type: 'lane', dir: 'v', a0: bx * TL, a1: (bx + 2) * TL, sign: Math.random() < .5 ? 1 : -1, t: 0, warn: .8, spd: 900, herd: 7 }); }
    else c.haz.push({ type: 'lane', dir: 'h', a0: roadY0, a1: roadY1, sign: 1, t: 0, warn: 1.1, spd: 1150, beast: 1 });
  } else if (c.kind === 'roots') {
    c.next = rnd(1.1, 1.5);
    // a pair of thorn columns ahead, out of step with each other
    for (let k = 0; k < 2; k++) { const tx = Math.floor(P.x / TL) + 3 + k * 3 + Math.floor(Math.random() * 2); if (tx < I.finStart) c.haz.push({ type: 'thorn', tx, t: -k * .5, warn: .75, dur: 1.1 }); }
    if (Math.random() < .22) c.haz.push({ type: 'lane', dir: 'h', a0: roadY0, a1: roadY1, sign: 1, t: 0, warn: 1.1, spd: 1250, beast: 1 });
  } else if (c.kind === 'snow') {
    c.next = rnd(3.6, 4.6);
    c.haz.push({ type: 'aval', t: 0, warn: 1.8, spd: 900 });
    if (Math.random() < .5) G.later.push({ t: 2.4, fn: () => { if (WD && WD.chase && WD.chase.phase === 'run') WD.chase.haz.push({ type: 'lane', dir: 'h', a0: roadY0, a1: roadY1, sign: -1, t: 0, warn: 1, spd: 1250, beast: 1 }); } });
  } else if (c.kind === 'ink') {
    c.next = rnd(1.1, 1.6);
    const base = Math.floor(P.x / TL);
    for (let k = 0; k < 2; k++) { const tx = base + (k ? 2 + Math.floor(Math.random() * 4) : -1 + Math.floor(Math.random() * 3)); if (tx > 1 && tx < I.finStart) c.haz.push({ type: 'erase', tx, t: -k * .3, warn: .85, dur: .9 }); }
    if (Math.random() < .45) for (let i = 0; i < 3; i++) { const x = P.x + rnd(-160, 220), y = rnd((I.mid - I.wide) * TL, (I.mid + I.wide + 1) * TL); TG.push({ x, y, r: 46, t: -i * .2, dur: 1, kind: 'emeteor', dead: false, cb: () => { burst(x, y, 10, COL.ink, 180); splat(x, y, 80, false); if (d2(P.x, P.y, x, y) < (46 + P.r) ** 2) chaseHurt(.12, 0, 0); SFX.splat && SFX.splat(); } }); }
  }
}
function chaseThrowRock(c, I) {
  // a column of boulders lands across the road ahead, between two side streets
  const ahead = Math.floor(P.x / TL) + 4 + Math.floor(Math.random() * 4);
  const ok = I.branches.some((bx, i) => i + 1 < I.branches.length && ahead > bx + 2 && ahead < I.branches[i + 1] - 1);
  if (!ok || ahead >= I.finStart) { c.haz.push({ type: 'lane', dir: 'h', a0: (I.mid - 1) * TL, a1: (I.mid + 2) * TL, sign: -1, t: 0, warn: .95, spd: 1400, beast: 1 }); return; }
  c.haz.push({ type: 'rock', tx: ahead, t: 0, warn: 1.1 });
  SFX.roar();
}
function chaseHazard(c, hz, dt, I) {
  hz.t += dt;
  const mw = WD.w * TL, mh = WD.h * TL;
  if (hz.type === 'lane') {
    if (hz.t < hz.warn) return;
    if (!hz.go) { hz.go = 1; hz.pos = hz.dir === 'h' ? (hz.sign > 0 ? CX - VHW - 500 : CX + VHW + 500) : (hz.sign > 0 ? -500 : mh + 500); SFX.roar(); shake(10); }
    hz.pos += hz.sign * hz.spd * dt;
    const inBand = hz.dir === 'h' ? P.y > hz.a0 - 6 && P.y < hz.a1 + 6 : P.x > hz.a0 - 6 && P.x < hz.a1 + 6;
    const along = hz.dir === 'h' ? P.x : P.y, body = hz.herd ? 260 : 120;
    if (inBand && Math.abs(along - hz.pos) < body) chaseHurt(hz.herd ? .12 : .2, hz.dir === 'h' ? hz.sign * 420 : (P.x < (hz.a0 + hz.a1) / 2 ? -420 : 420), hz.dir === 'v' ? hz.sign * 420 : (P.y < (hz.a0 + hz.a1) / 2 ? -420 : 420));
    shake(clamp(8 - Math.abs(along - hz.pos) / 90, 0, 8));
    if (Math.random() < .9) { const x = hz.dir === 'h' ? hz.pos - hz.sign * 60 : rnd(hz.a0, hz.a1), y = hz.dir === 'h' ? rnd(hz.a0, hz.a1) : hz.pos - hz.sign * 60; for (let k = 0; k < 2; k++) PT.push({ x, y, vx: rnd(-160, 160), vy: rnd(-160, 160), life: rnd(.4, .9), max: .9, s: rnd(3, 7), c: CHASE_KIND[c.kind].col, dead: false }); }
    const end = hz.dir === 'h' ? (hz.sign > 0 ? CX + VHW + 700 : CX - VHW - 700) : (hz.sign > 0 ? mh + 700 : -700);
    if ((hz.sign > 0 && hz.pos > end) || (hz.sign < 0 && hz.pos < end)) hz.done = true;
  } else if (hz.type === 'rock') {
    if (hz.t >= hz.warn && !hz.landed) {
      hz.landed = 1; hz.done = true;
      const tiles = []; for (let y = I.mid - 1; y <= I.mid + 1; y++) tiles.push(y * WD.w + hz.tx);
      if (Math.abs(P.x - (hz.tx + .5) * TL) < TL) { chaseHurt(.15, -380, 0); P.x = (hz.tx - 1) * TL; }
      c.rocks.push({ tx: hz.tx, tiles, life: 8, v: Math.floor(Math.random() * 5) });
      shake(16); SFX.boom(true); burst((hz.tx + .5) * TL, (I.mid + .5) * TL, 30, CHASE_KIND[c.kind].col, 320); ringFx((hz.tx + .5) * TL, (I.mid + .5) * TL, 110, COL.ink, .35, 7);
    }
  } else if (hz.type === 'thorn') {
    if (hz.t > hz.warn && hz.t < hz.warn + hz.dur) {
      if (!hz.sfx) { hz.sfx = 1; SFX.scratch && SFX.scratch(); shake(4); }
      if (Math.floor(P.x / TL) === hz.tx && Math.abs(P.y - (I.mid + .5) * TL) < TL * 2) chaseHurt(.12, -300, 0);
    }
    if (hz.t > hz.warn + hz.dur + .3) hz.done = true;
  } else if (hz.type === 'aval') {
    if (hz.t < hz.warn) { if (Math.random() < .3) shake(3); return; }
    if (hz.y === undefined) { hz.y = -300; SFX.rumble && SFX.rumble(); SFX.boom(true); }
    hz.y += hz.spd * dt; shake(7);
    if (!hz.hit && Math.abs(P.y - hz.y) < 60) {
      // safe if a rock sits just north of you in this column
      const tx = Math.floor(P.x / TL), ty = Math.floor(P.y / TL);
      const safe = [1, 2].some(k => WD.grid[ty - k] && WD.grid[ty - k][tx] === 'o');
      if (!safe) { hz.hit = 1; chaseHurt(.22, 0, 380); }
    }
    if (hz.y > mh + 300) hz.done = true;
  } else if (hz.type === 'erase') {
    if (hz.t > hz.warn && hz.t < hz.warn + hz.dur) {
      if (!hz.sfx) { hz.sfx = 1; SFX.scratch && SFX.scratch(); shake(5); }
      if (Math.abs(P.x - (hz.tx + .5) * TL) < TL * .95) chaseHurt(.14, (P.x < (hz.tx + .5) * TL ? -1 : 1) * 380, 0);
    }
    if (hz.t > hz.warn + hz.dur + .25) hz.done = true;
  }
}

/* ---------- the ending at the gate ---------- */
function chaseFinal() {
  const c = WD.chase, I = WD.A.cinfo; c.phase = 'final'; c.haz.length = 0; c.rocks.length = 0;
  c.beast = { x: (I.gateX - 22) * TL, y: (I.mid + .5) * TL, st: 'wait', stT: 2.2, spd: 0 };
  banner(L('지렛대 앞에서 기다린다'), L('놈이 문 아래에 오면 당긴다'), 'warn');
  SFX.warn();
}
function chaseFinalTick(c, dt, I) {
  const b = c.beast, gx = I.gateX * TL, front = b.x + 70, gateShut = c.gate.down > .85;
  b.stT -= dt;
  if (b.st === 'wait') { if (b.stT <= 0) { b.st = 'charge'; b.spd = 560; SFX.roar(); shake(14); } return; }
  if (b.st === 'charge') {
    b.x += b.spd * dt; shake(5);
    if (Math.random() < .9) for (let k = 0; k < 2; k++) PT.push({ x: b.x - 60, y: b.y + rnd(-50, 50), vx: rnd(-200, -40), vy: rnd(-90, 90), life: .8, max: .8, s: rnd(3, 8), c: CHASE_KIND[c.kind].col, dead: false });
    // under the gate as it falls
    // any part of it under the gate as it falls: head past the line, tail not yet through
    if (c.gate.down > .3 && !c.gate.early && front > gx - 10 && b.x - 330 < gx + TL) { chaseWin(); return; }
    if (c.gate.want && !c.gate.early && front < gx - 10 && c.gate.down > .3) c.gate.early = 1;
    // the gate came down too soon: it slams into it
    if (gateShut && front > gx - 20 && front < gx + 20) { b.st = 'bash'; b.stT = 1.8; b.x = gx - 90; banner(L('너무 일렀다'), L('문이 버티지 못한다'), 'warn'); return; }
    // it got past the gate: it comes for you
    if (Math.abs(P.y - b.y) < 90 && Math.abs(P.x - front) < 40) { chaseHurt(.25, 520, 0); banner(L('늦었다'), L('다시 온다'), 'warn'); b.st = 'back'; b.stT = 1.2; }
    if (b.x > (WD.w - 2) * TL) { b.st = 'back'; b.stT = 1.2; }
    return;
  }
  if (b.st === 'bash') {
    if (Math.floor(b.stT * 3) !== Math.floor((b.stT + dt) * 3)) { shake(14); SFX.boom(false); burst(gx, b.y, 10, COL.ink, 200); }
    if (b.stT <= 0) { c.gate.want = 0; c.gate.early = 0; c.gate.broken = 1; b.st = 'back'; b.stT = 1.2; SFX.clank(); }
    return;
  }
  if (b.st === 'back') {
    b.x -= 700 * dt; c.gate.want = 0; c.gate.early = 0;
    if (b.x < (I.gateX - 22) * TL) { b.x = (I.gateX - 22) * TL; b.st = 'wait'; b.stT = 2; }
  }
}

/* ---------- drawing ---------- */
function drawChase(now) {
  const c = WD && WD.chase; if (!c) return;
  const I = WD.A.cinfo, K2 = CHASE_KIND[c.kind], mh = WD.h * TL;
  wt(); ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  // warnings painted on the ground
  for (const hz of c.haz) {
    const warnK = hz.t < (hz.warn || 0) ? hz.t / hz.warn : 1;
    if (hz.type === 'lane' && !hz.go) {
      ctx.globalAlpha = .18 + warnK * .25 + Math.sin(now * 20) * .05; ctx.fillStyle = COL.pink;
      if (hz.dir === 'h') ctx.fillRect(CX - VHW - 100, hz.a0, VHW * 2 + 200, hz.a1 - hz.a0); else ctx.fillRect(hz.a0, -100, hz.a1 - hz.a0, mh + 200);
      ctx.globalAlpha = .7; ctx.strokeStyle = COL.ink; ctx.lineWidth = 4;
      for (let k = 0; k < 8; k++) {
        const s = ((now * 2 + k / 8) % 1) * (hz.dir === 'h' ? VHW * 2 : mh), sg = hz.sign;
        if (hz.dir === 'h') { const x = (sg > 0 ? CX - VHW : CX + VHW) + sg * s, y = (hz.a0 + hz.a1) / 2; ctx.beginPath(); ctx.moveTo(x - sg * 14, y - 14); ctx.lineTo(x, y); ctx.lineTo(x - sg * 14, y + 14); ctx.stroke(); }
        else { const y = (sg > 0 ? 0 : mh) + sg * s, x = (hz.a0 + hz.a1) / 2; ctx.beginPath(); ctx.moveTo(x - 14, y - sg * 14); ctx.lineTo(x, y); ctx.lineTo(x + 14, y - sg * 14); ctx.stroke(); }
      }
    } else if (hz.type === 'rock') {
      const x = (hz.tx + .5) * TL; ctx.globalAlpha = .25 + warnK * .4; ctx.fillStyle = COL.ink;
      for (let y = I.mid - 1; y <= I.mid + 1; y++) { ctx.beginPath(); ctx.ellipse(x, (y + .5) * TL, 10 + warnK * 16, 8 + warnK * 12, 0, 0, TAU); ctx.fill(); }
    } else if (hz.type === 'thorn' || hz.type === 'erase') {
      const x0 = hz.tx * TL, act = hz.t > hz.warn && hz.t < hz.warn + hz.dur;
      ctx.globalAlpha = act ? .5 : .15 + warnK * .3; ctx.fillStyle = hz.type === 'thorn' ? (act ? '#2E5E50' : COL.pink) : (act ? '#F4F1EA' : COL.pink);
      ctx.fillRect(x0, 0, TL, mh);
    } else if (hz.type === 'aval' && hz.t < hz.warn) {
      ctx.globalAlpha = .15 + warnK * .25; ctx.fillStyle = COL.white; ctx.fillRect(CX - VHW - 100, CY - VHH - 100, VHW * 2 + 200, 80 + warnK * 120);
    }
  }
  ctx.globalAlpha = 1;
  // shelters glow faintly while an avalanche is coming
  if (c.kind === 'snow' && c.haz.some(h => h.type === 'aval')) for (const sx of I.shelters) { ctx.globalAlpha = .35 + Math.sin(now * 8) * .15; ctx.fillStyle = '#7CC6D8'; ctx.fillRect(sx * TL, (I.mid - I.wide + 1) * TL, TL, TL * 2); }
  ctx.globalAlpha = 1;
  ctx.restore();
  // upright things
  wu(); ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const r of c.rocks) for (let y = I.mid - 1; y <= I.mid + 1; y++) { const img = rockSpr(WD.reg, (r.v + y) % 5), sc = 1.15; ctx.globalAlpha = Math.min(1, r.life * 2); ctx.drawImage(img, (r.tx + .5) * TL - img.lw * sc / 2, (y + 1) * TL * TY - img.lh * sc + 4, img.lw * sc, img.lh * sc); }
  ctx.globalAlpha = 1;
  for (const hz of c.haz) {
    if (hz.type === 'rock' && hz.t < hz.warn) {
      // the boulders in the air
      const q = hz.t / hz.warn, x = (hz.tx + .5) * TL - (1 - q) * 300, y = (I.mid + .5) * TL * TY - Math.sin(q * Math.PI) * 260 - (1 - q) * 120, img = rockSpr(WD.reg, 2);
      ctx.save(); ctx.translate(x, y); ctx.rotate(q * 8); ctx.drawImage(img, -img.lw / 2, -img.lh / 2); ctx.restore();
    }
    if (hz.type === 'thorn' && hz.t > hz.warn - .1 && hz.t < hz.warn + hz.dur + .3) {
      const k = clamp(Math.min((hz.t - hz.warn + .1) * 8, (hz.warn + hz.dur + .3 - hz.t) * 5), 0, 1);
      for (let y = I.mid - 2; y <= I.mid + 2; y++) for (let s = 0; s < 3; s++) { const x = hz.tx * TL + 8 + s * 16, yy = (y + .9) * TL * TY; ctx.fillStyle = '#3E2F2A'; ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x - 6, yy); ctx.lineTo(x + (s - 1) * 3, yy - 34 * k); ctx.lineTo(x + 6, yy); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#4F8A7E'; ctx.beginPath(); ctx.ellipse(x + 4, yy - 18 * k, 4 * k, 2 * k, .5, 0, TAU); ctx.fill(); }
    }
    if (hz.type === 'erase' && hz.t > hz.warn - .2 && hz.t < hz.warn + hz.dur) {
      // the hand rubs the column out from top to bottom
      const q = clamp((hz.t - hz.warn + .2) / (hz.dur + .2), 0, 1), x = (hz.tx + .5) * TL, y = (CY - VHH) * TY + q * VHH * 2 * TY;
      drawEraserHand(x, y, now, 1);
    }
    if (hz.type === 'lane' && hz.go) {
      if (hz.herd) for (let k = 0; k < hz.herd; k++) { const along = hz.pos - hz.sign * k * 46, cross = hz.a0 + 14 + ((k * 37) % Math.max(1, hz.a1 - hz.a0 - 28)); if (hz.dir === 'v') drawBoar(cross, along * TY, hz.sign, now + k, .55); else drawBoar(along, cross * TY, hz.sign, now + k, .55); }
      else { const x = hz.dir === 'h' ? hz.pos : (hz.a0 + hz.a1) / 2, y = hz.dir === 'h' ? (hz.a0 + hz.a1) / 2 : hz.pos; drawBeast(c.kind, x, y * TY, hz.dir, hz.sign, now, 1); }
    }
    if (hz.type === 'aval' && hz.y !== undefined) {
      // a wall of snow rolling down the map
      const y = hz.y * TY;
      ctx.fillStyle = '#F4FAFC'; ctx.beginPath(); ctx.moveTo(CX - VHW - 200, (CY - VHH) * TY - 400); ctx.lineTo(CX + VHW + 200, (CY - VHH) * TY - 400);
      for (let x = CX + VHW + 200; x >= CX - VHW - 200; x -= 30) ctx.lineTo(x, y + Math.sin(x / 40 + now * 6) * 18 + Math.sin(x / 13) * 8);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(158,184,196,.55)'; for (let x = CX - VHW - 200; x < CX + VHW + 200; x += 46) { ctx.beginPath(); ctx.arc(x + Math.sin(now * 3 + x) * 10, y - 20, 26, 0, TAU); ctx.fill(); }
      ctx.fillStyle = COL.white; for (let x = CX - VHW - 200; x < CX + VHW + 200; x += 34) { ctx.beginPath(); ctx.arc(x, y + 6 + Math.sin(x + now * 9) * 6, 14 + (x % 3) * 4, 0, TAU); ctx.fill(); }
    }
  }
  // the tide of roots behind you
  if (c.kind === 'roots' && c.phase === 'run') {
    const fx = c.wall, top = (CY - VHH) * TY - 100, bot = (CY + VHH) * TY + 100;
    ctx.fillStyle = '#3E2F2A'; ctx.beginPath(); ctx.moveTo(fx - 3000, top); ctx.lineTo(fx, top);
    for (let y = top; y <= bot; y += 12) ctx.lineTo(fx + Math.sin(y / 30 + now * 4) * 14 + Math.sin(y / 11 + now * 7) * 6, y);
    ctx.lineTo(fx - 3000, bot); ctx.closePath(); ctx.fill();
    for (let i = 0; i < 14; i++) { const y = top + (i + .5) / 14 * (bot - top), reach = 40 + Math.sin(now * 3 + i * 1.7) * 30; for (const [col, lw] of [[COL.ink, 13], ['#6B4A33', 9]]) { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(fx - 10, y); ctx.quadraticCurveTo(fx + reach * .5, y + Math.sin(now * 5 + i) * 16, fx + reach, y + Math.sin(now * 4 + i * 2) * 10); ctx.stroke(); } }
    for (let i = 0; i < 6; i++) { const y = top + (i + .5) / 6 * (bot - top); ctx.fillStyle = '#7CF0C8'; ctx.globalAlpha = .6 + Math.sin(now * 6 + i) * .3; ctx.beginPath(); ctx.ellipse(fx - 30 - (i % 2) * 40, y, 6, 3, 0, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1;
  }
  // the gate and the beast at the end
  drawChaseGate(c, I, now);
  if (c.beast && (c.phase === 'final' || c.phase === 'won')) {
    const b = c.beast;
    if (c.phase === 'won') { ctx.save(); ctx.translate(b.x, b.y * TY); ctx.scale(1 + b.squash * .25, 1 - b.squash * .55); drawBeast(c.kind, 0, 0, 'h', 1, now, 1.15, true); ctx.restore(); }
    else drawBeast(c.kind, b.x, b.y * TY, 'h', b.st === 'back' ? -1 : 1, now, 1.15);
  }
  // the lever in its nook
  const lv = WD.ents.find(e => e.k === 'trap');
  if (lv) { const up = !c.gate.want, a = up ? -.75 : .75; standUp(leverBase(), lv.x, lv.y + 14, 1); wu(); const px = lv.x, py = (lv.y + 14) * TY - 26, hx = px + Math.sin(a) * 24, hy = py - Math.cos(a) * 24; ctx.strokeStyle = COL.ink; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(hx, hy); ctx.stroke(); ctx.strokeStyle = '#8A6440'; ctx.lineWidth = 3.6; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(hx, hy); ctx.stroke(); ctx.fillStyle = c.phase === 'final' && up ? COL.yellow : COL.pink; ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.arc(hx, hy, 6, 0, TAU); ctx.fill(); ctx.stroke(); if (c.phase === 'final' && up) { ctx.globalAlpha = .4 + Math.sin(now * 8) * .3; ctx.fillStyle = COL.yellow; ctx.beginPath(); ctx.arc(hx, hy, 13, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; } }
  ctx.restore();
}
function drawChaseGate(c, I, now) {
  const gx = I.gateX * TL, y0 = (I.mid - 1) * TL * TY, y1 = (I.mid + 2) * TL * TY, H = 130, d = c.gate.down;
  const theme = { meadow: ['#8A6440', '#5A3E28'], roots: ['#5A3E28', '#3E2F2A'], sand: ['#C4A775', '#8A6E45'], snow: ['#9ED6E6', '#5FA8C4'], ink: ['#25356F', '#141B40'] }[c.kind];
  // two posts and a lintel
  for (const px of [gx - 8, gx + TL - 8]) { ctx.fillStyle = theme[1]; ctx.fillRect(px, y0 - H - 10, 16, y1 - y0 + H + 10); ctx.strokeStyle = COL.ink; ctx.lineWidth = 2; ctx.strokeRect(px, y0 - H - 10, 16, y1 - y0 + H + 10); }
  ctx.fillStyle = theme[0]; ctx.fillRect(gx - 14, y0 - H - 22, TL + 28, 18); ctx.strokeRect(gx - 14, y0 - H - 22, TL + 28, 18);
  // the falling grate with teeth along the bottom
  const gy = y0 - H + d * H, gh = y1 - y0;
  ctx.fillStyle = theme[1]; for (let k = 0; k < 4; k++) { const bx = gx + 6 + k * (TL - 12) / 3; ctx.fillRect(bx - 3, gy - 20, 6, gh + 20); }
  for (let k = 0; k < 4; k++) ctx.fillRect(gx, gy - 10 + k * gh / 4, TL, 5);
  ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.6; ctx.strokeRect(gx, gy - 20, TL, gh + 20);
  ctx.fillStyle = COL.ink; for (let k = 0; k < 4; k++) { const bx = gx + 6 + k * (TL - 12) / 3; ctx.beginPath(); ctx.moveTo(bx - 5, gy + gh); ctx.lineTo(bx, gy + gh + 12); ctx.lineTo(bx + 5, gy + gh); ctx.fill(); }
  if (c.gate.broken && d < .1) { ctx.fillStyle = 'rgba(20,27,64,.4)'; for (let k = 0; k < 5; k++) ctx.fillRect(gx - 10 + k * 12, y1 - 6, 8, 4); }
}
function drawBeast(kind, x, y, dir, sign, now, sc, dead) {
  if (kind === 'meadow') return drawBoar(x, y, sign, now, 1.5 * sc, dead);
  if (kind === 'snow') return drawFrost(x, y, sign, now, sc, dead);
  if (kind === 'ink') return drawEraserHand(x, y, now, 1.6 * sc, dead);
  // crawler / root serpent: a long body of segments with legs, a head with jaws
  const sand = kind === 'sand', bodyC = sand ? ['#D9C08E', '#A88A5A', '#6E5634'] : ['#7A5A40', '#4A3424', '#2A1E16'];
  const vx = dir === 'h' ? sign : 0, vy = dir === 'v' ? sign : 0, segs = 9;
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  // dust cloud trailing behind
  for (let i = 0; i < 10; i++) { const k = i / 10; ctx.globalAlpha = (1 - k) * .45; ctx.fillStyle = sand ? '#E6D3A4' : '#6B5A48'; ctx.beginPath(); ctx.arc(-vx * (80 + k * 260) + Math.sin(now * 5 + i) * 20, -vy * (80 + k * 260) + Math.cos(now * 4 + i) * 20, 40 + k * 50, 0, TAU); ctx.fill(); }
  ctx.globalAlpha = 1;
  const ang = Math.atan2(vy, vx), glowC = sand ? '#FF4F9E' : '#7CF0C8';
  // shadows on the ground first
  ctx.fillStyle = 'rgba(20,27,64,.25)';
  for (let i = segs; i >= 0; i--) { const off = i * 34; ctx.beginPath(); ctx.ellipse(-vx * off, -vy * off + 30, 40 - i, 12, 0, 0, TAU); ctx.fill(); }
  for (let i = segs; i >= 0; i--) {
    const off = i * 34, wob = Math.sin(now * 14 - i * .8) * 9, px = -vx * off + vy * wob, py = -vy * off + vx * wob, r = i === 0 ? 50 : 40 - i * 2.2;
    // three pairs of legs per segment, scuttling
    if (i > 0) for (const s of [-1, 1]) for (let l = 0; l < 2; l++) {
      const ph = Math.sin(now * 32 + i * 1.3 + s + l * 2) * 12, bx = px + vy * s * r * .55 + vx * (l - .5) * 14, by = py + vx * s * r * .55 + vy * (l - .5) * 14;
      const kx = bx + vy * s * 22 + vx * ph, ky = by + vx * s * 22 + vy * ph - 10, fx = kx + vy * s * 10 + vx * ph * .5, fy = ky + vx * s * 10 + vy * ph * .5 + 18;
      ctx.strokeStyle = COL.ink; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(kx, ky); ctx.lineTo(fx, fy); ctx.stroke();
      ctx.strokeStyle = bodyC[1]; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(kx, ky); ctx.lineTo(fx, fy); ctx.stroke();
    }
    // glowing seam between plates
    if (i > 0) { ctx.globalAlpha = .55 + Math.sin(now * 6 + i) * .25; ctx.fillStyle = glowC; ctx.beginPath(); ctx.arc(px + vx * r * .55, py + vy * r * .55, r * .72, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; }
    const g = ctx.createRadialGradient(px - r * .35, py - r * .45, r * .15, px, py, r); g.addColorStop(0, bodyC[0]); g.addColorStop(.55, bodyC[1]); g.addColorStop(1, bodyC[2]);
    ctx.fillStyle = COL.ink; ctx.beginPath(); ctx.arc(px, py, r + 3.5, 0, TAU); ctx.fill();
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, r, 0, TAU); ctx.fill();
    // plate bands, a lit ridge, a dark belly
    ctx.save(); ctx.beginPath(); ctx.arc(px, py, r, 0, TAU); ctx.clip();
    ctx.fillStyle = 'rgba(20,27,64,.3)'; ctx.fillRect(px - r, py + r * .35, r * 2, r);
    ctx.strokeStyle = 'rgba(20,27,64,.35)'; ctx.lineWidth = 2;
    for (const f of [.35, .7]) { ctx.beginPath(); ctx.arc(px + vx * r * .2, py + vy * r * .2, r * f, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(px, py, r * .82, Math.PI * 1.2, Math.PI * 1.6); ctx.stroke();
    for (let k = 0; k < 4; k++) { ctx.fillStyle = 'rgba(20,27,64,.25)'; ctx.beginPath(); ctx.arc(px + Math.cos(k * 1.9 + i) * r * .5, py + Math.sin(k * 1.9 + i) * r * .4, 2.2, 0, TAU); ctx.fill(); }
    ctx.restore();
    // spikes down the back
    ctx.fillStyle = sand ? '#F2E6C8' : '#2E5E50'; ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.6;
    for (let s = -1; s <= 1; s++) { const a = -Math.PI / 2 + s * .45, h2 = s ? 14 : 22; ctx.beginPath(); ctx.moveTo(px + Math.cos(a - .14) * r, py + Math.sin(a - .14) * r); ctx.lineTo(px + Math.cos(a) * (r + h2), py + Math.sin(a) * (r + h2)); ctx.lineTo(px + Math.cos(a + .14) * r, py + Math.sin(a + .14) * r); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    if (!sand && i % 2) { ctx.fillStyle = '#4F8A7E'; ctx.beginPath(); ctx.ellipse(px + 8, py - r * .6, 10, 4, .4, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(px - 6, py - r * .7, 7, 3, -.4, 0, TAU); ctx.fill(); }
  }
  // the head: a crest of horns, serrated jaws, a ring of eyes
  const hx = vx * 34, hy = vy * 34, open = dead ? 0 : (Math.sin(now * 12) * .5 + .5) * .55;
  ctx.fillStyle = sand ? '#F2E6C8' : '#3E2F2A'; ctx.strokeStyle = COL.ink; ctx.lineWidth = 2;
  for (let k = -1; k <= 1; k++) { const a = ang + Math.PI + k * .5 - Math.PI / 2 * 0, bx = -vx * 8, by = -vy * 8 - 30; ctx.beginPath(); ctx.moveTo(bx + k * 16 - 7, by + 12); ctx.quadraticCurveTo(bx + k * 22, by - 18, bx + k * 30 - vx * 18, by - 34 - Math.abs(k) * -8); ctx.lineTo(bx + k * 16 + 7, by + 12); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  // the open mouth glows inside
  ctx.save(); ctx.translate(hx, hy); ctx.rotate(ang);
  ctx.fillStyle = '#2A0E14'; ctx.beginPath(); ctx.ellipse(18, 0, 18, 12 + open * 18, 0, 0, TAU); ctx.fill();
  if (!dead) { ctx.globalAlpha = .6; ctx.fillStyle = glowC; ctx.beginPath(); ctx.ellipse(14, 0, 8, 4 + open * 10, 0, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; }
  for (const s of [-1, 1]) {
    ctx.save(); ctx.rotate(s * (.3 + open));
    ctx.fillStyle = COL.ink; ctx.beginPath(); ctx.moveTo(0, s * 12); ctx.quadraticCurveTo(52, s * 38, 74, s * 2); ctx.lineTo(50, s * 16); ctx.closePath(); ctx.fill();
    ctx.fillStyle = bodyC[1]; ctx.beginPath(); ctx.moveTo(4, s * 12); ctx.quadraticCurveTo(48, s * 32, 66, s * 4); ctx.lineTo(48, s * 14); ctx.closePath(); ctx.fill();
    ctx.fillStyle = COL.paper; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(18 + k * 10, s * 14); ctx.lineTo(23 + k * 10, s * 4); ctx.lineTo(27 + k * 10, s * 15); ctx.fill(); }
    ctx.restore();
  }
  ctx.restore();
  for (let k = 0; k < 6; k++) {
    const a = ang + (k - 2.5) * .3, ex = Math.cos(a) * 30, ey = Math.sin(a) * 30 - 8, er = 5 - Math.abs(k - 2.5) * .6;
    if (!dead) { ctx.globalAlpha = .35; ctx.fillStyle = glowC; ctx.beginPath(); ctx.arc(ex, ey, er * 2.6, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; }
    ctx.fillStyle = COL.ink; ctx.beginPath(); ctx.arc(ex, ey, er + 1.6, 0, TAU); ctx.fill();
    ctx.fillStyle = dead ? '#555' : glowC; ctx.beginPath(); ctx.arc(ex, ey, er, 0, TAU); ctx.fill();
    ctx.fillStyle = COL.white; ctx.beginPath(); ctx.arc(ex - er * .3, ey - er * .3, er * .35, 0, TAU); ctx.fill();
  }
  // sand thrown up around it
  if (!dead) for (let k = 0; k < 22; k++) {
    const q = (now * 2.4 + k * .137) % 1, side = k % 2 ? 1 : -1, base = (k * 31) % (segs * 34);
    const sx = -vx * base + vy * side * (40 + q * 50), sy = -vy * base + vx * side * (40 + q * 50) - Math.sin(q * Math.PI) * 50;
    ctx.globalAlpha = 1 - q; ctx.fillStyle = k % 3 ? (sand ? '#E6D3A4' : '#6B5A48') : (sand ? '#C4A775' : '#3E2F2A');
    ctx.beginPath(); ctx.arc(sx, sy, 3 + (k % 4) * 1.5, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1; ctx.restore();
}
function drawBoar(x, y, sign, now, sc, dead) {
  ctx.save(); ctx.translate(x, y); ctx.scale(sign * sc, sc);
  const run = dead ? 0 : Math.sin(now * 22);
  ctx.fillStyle = 'rgba(20,27,64,.25)'; ctx.beginPath(); ctx.ellipse(0, 26, 40, 9, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = COL.ink; ctx.lineWidth = 6; for (const [lx, ph] of [[-22, 0], [-10, 1], [14, .5], [26, 1.5]]) { ctx.beginPath(); ctx.moveTo(lx, 8); ctx.lineTo(lx + Math.sin(now * 22 + ph * 3) * 8 * (dead ? 0 : 1), 26); ctx.stroke(); }
  const g = ctx.createLinearGradient(0, -26, 0, 18); g.addColorStop(0, '#9C7A55'); g.addColorStop(1, '#5A3E28');
  ctx.fillStyle = COL.ink; ctx.beginPath(); ctx.ellipse(0, 0 + run * 2, 42, 26, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, -1 + run * 2, 39, 23, 0, 0, TAU); ctx.fill();
  // bristly mane
  ctx.fillStyle = '#3E2A1A'; ctx.beginPath(); for (let k = 0; k < 9; k++) { const px = -28 + k * 7; ctx.moveTo(px, -18 + run * 2); ctx.lineTo(px + 3, -32 - (k % 2) * 6 + run * 2); ctx.lineTo(px + 6, -18 + run * 2); } ctx.fill();
  // head, tusks, a mean eye
  ctx.fillStyle = '#7A5A40'; ctx.beginPath(); ctx.ellipse(38, 2 + run * 2, 20, 16, .2, 0, TAU); ctx.fill(); ctx.strokeStyle = COL.ink; ctx.lineWidth = 2.4; ctx.stroke();
  ctx.fillStyle = '#C97B7B'; ctx.beginPath(); ctx.ellipse(56, 6 + run * 2, 7, 6, 0, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillStyle = COL.paper; ctx.beginPath(); ctx.moveTo(48, 12); ctx.quadraticCurveTo(62, 14, 64, -2); ctx.quadraticCurveTo(58, 10, 48, 8); ctx.fill(); ctx.stroke();
  ctx.fillStyle = dead ? '#555' : COL.pink; ctx.beginPath(); ctx.arc(40, -4 + run * 2, 3.4, 0, TAU); ctx.fill();
  ctx.fillStyle = '#5A3E28'; ctx.beginPath(); ctx.moveTo(30, -12); ctx.lineTo(26, -24); ctx.lineTo(36, -14); ctx.fill();
  ctx.restore();
}
function drawFrost(x, y, sign, now, sc, dead) {
  ctx.save(); ctx.translate(x, y); ctx.scale(sign * sc * 1.4, sc * 1.4);
  const run = dead ? 0 : Math.sin(now * 18);
  ctx.fillStyle = 'rgba(20,27,64,.2)'; ctx.beginPath(); ctx.ellipse(0, 34, 50, 10, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#9EB8C4'; ctx.lineWidth = 9; for (const [lx, ph] of [[-26, 0], [-12, 1], [16, .5], [30, 1.5]]) { ctx.beginPath(); ctx.moveTo(lx, 10); ctx.lineTo(lx + Math.sin(now * 18 + ph * 3) * 10 * (dead ? 0 : 1), 34); ctx.stroke(); }
  // a shaggy white body
  ctx.fillStyle = COL.ink; ctx.beginPath(); ctx.ellipse(0, run * 2, 50, 32, 0, 0, TAU); ctx.fill();
  for (let k = 0; k < 16; k++) { const a = k / 16 * TAU; ctx.fillStyle = k % 2 ? '#F4FAFC' : '#DDEBF0'; ctx.beginPath(); ctx.arc(Math.cos(a) * 34, Math.sin(a) * 20 + run * 2, 16, 0, TAU); ctx.fill(); }
  ctx.fillStyle = '#F4FAFC'; ctx.beginPath(); ctx.ellipse(0, run * 2, 40, 24, 0, 0, TAU); ctx.fill();
  // head with horns of ice and blue eyes
  ctx.fillStyle = '#DDEBF0'; ctx.beginPath(); ctx.ellipse(48, -6 + run * 2, 22, 18, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = COL.ink; ctx.lineWidth = 2.4; ctx.stroke();
  ctx.fillStyle = '#9ED6E6'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(40 + s * 6, -20); ctx.lineTo(30 + s * 10, -48); ctx.lineTo(48 + s * 4, -22); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  ctx.fillStyle = COL.ink; ctx.beginPath(); ctx.moveTo(60, 2); ctx.lineTo(72, 4); ctx.lineTo(60, 10); ctx.fill();
  ctx.fillStyle = COL.white; ctx.beginPath(); ctx.moveTo(62, 4); ctx.lineTo(64, 9); ctx.lineTo(66, 4); ctx.fill();
  ctx.fillStyle = dead ? '#555' : '#4FD8FF'; ctx.shadowColor = '#4FD8FF'; ctx.shadowBlur = dead ? 0 : 12; ctx.beginPath(); ctx.arc(52, -10 + run * 2, 3.6, 0, TAU); ctx.fill(); ctx.shadowBlur = 0;
  // frost breath
  if (!dead) for (let k = 0; k < 5; k++) { const q = (now * 2 + k / 5) % 1; ctx.globalAlpha = (1 - q) * .6; ctx.fillStyle = COL.white; ctx.beginPath(); ctx.arc(72 + q * 40, 4 - q * 6, 4 + q * 8, 0, TAU); ctx.fill(); }
  ctx.globalAlpha = 1; ctx.restore();
}
function drawEraserHand(x, y, now, sc, dead) {
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.lineJoin = 'round';
  // crumbs of rubber
  for (let k = 0; k < 8; k++) { const q = (now * 3 + k / 8) % 1; ctx.globalAlpha = 1 - q; ctx.fillStyle = '#E8A0B8'; ctx.fillRect(-20 + (k * 13) % 40, 10 + q * 40, 4, 3); }
  ctx.globalAlpha = 1;
  // the eraser
  ctx.fillStyle = '#FF8FB8'; ctx.strokeStyle = COL.ink; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.roundRect(-26, -6, 52, 22, 4); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#7CC6D8'; ctx.fillRect(-26, -6, 18, 22); ctx.strokeRect(-26, -6, 18, 22);
  ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(-6, -3, 28, 3);
  // the hand gripping it from above
  ctx.fillStyle = dead ? '#9EA4B4' : '#F4F1EA';
  for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.roundRect(-22 + k * 12, -30, 10, 30, 5); ctx.fill(); ctx.stroke(); }
  ctx.beginPath(); ctx.roundRect(-26, -64, 50, 40, 12); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.roundRect(22, -40, 12, 26, 6); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = 'rgba(37,53,111,.4)'; ctx.lineWidth = 1.4; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(-14 + k * 12, -34); ctx.lineTo(-14 + k * 12, -28); ctx.stroke(); }
  ctx.fillStyle = COL.ink; ctx.fillRect(-28, -100, 54, 40);
  ctx.restore();
}
// screen-wide weather for the chase
function drawChaseTop() {
  const c = WD && WD.chase; if (!c) return;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  const now = performance.now() / 1000, K2 = CHASE_KIND[c.kind];
  if (c.kind === 'sand') {
    for (let i = 0; i < 5; i++) { const x = ((now * (120 + i * 40) + i * 300) % (W + 600)) - 300; const g = ctx.createRadialGradient(W - x, H * (.2 + i * .15), 10, W - x, H * (.2 + i * .15), 260); g.addColorStop(0, K2.fog + '.28)'); g.addColorStop(1, K2.fog + '0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
    ctx.fillStyle = K2.fog + '.12)'; ctx.fillRect(0, 0, W, H);
  } else if (c.kind === 'snow') {
    ctx.fillStyle = COL.white; for (let i = 0; i < 70; i++) { const q = (now * .15 + i * .0143) % 1, x = (i * 137.1 + Math.sin(now + i) * 30) % W; ctx.globalAlpha = .8; ctx.beginPath(); ctx.arc(x, q * H, 1.5 + (i % 3), 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1; ctx.fillStyle = K2.fog + '.1)'; ctx.fillRect(0, 0, W, H);
  } else if (c.kind === 'meadow' || c.kind === 'roots') {
    for (let i = 0; i < 26; i++) { const q = (now * .1 + i * .039) % 1, x = (i * 151.3 + Math.sin(now + i) * 40) % W; ctx.globalAlpha = .7; ctx.fillStyle = c.kind === 'roots' ? '#4F8A7E' : '#D9C07A'; ctx.save(); ctx.translate(x, q * H); ctx.rotate(now * 2 + i); ctx.beginPath(); ctx.ellipse(0, 0, 5, 2.4, 0, 0, TAU); ctx.fill(); ctx.restore(); }
    ctx.globalAlpha = 1;
  } else if (c.kind === 'ink') {
    ctx.fillStyle = COL.paper; for (let i = 0; i < 14; i++) { const q = (now * .08 + i * .071) % 1, x = (i * 173.7) % W; ctx.globalAlpha = .7; ctx.save(); ctx.translate(x, q * H); ctx.rotate(now + i); ctx.fillRect(-6, -4, 12, 8); ctx.restore(); }
    ctx.globalAlpha = 1;
  }
  // a reddening edge when the tide is close
  if (c.kind === 'roots' && c.phase === 'run') { const k = clamp(1 - (P.x - c.wall) / 380, 0, 1); if (k > 0) { const g = ctx.createLinearGradient(0, 0, W * .35, 0); g.addColorStop(0, 'rgba(255,79,158,' + (.45 * k).toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,79,158,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W * .35, H); } }
}

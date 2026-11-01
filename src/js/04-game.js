/* ================= run state ================= */
let STATE = 'title';
let G = null;
const P = {};
let E = [], PR = [], EB = [], GM = [], PK = [], PT = [], RG = [], TX = [], DC = [], BL = [], TG = [], ZN = [];
const INPUT = { mx: 0, my: 0, joy: null, keys: {} };

const xpNeed = L => 5 + (L - 1) * 5 + Math.floor((L - 1) * (L - 1) * .32);

function newRun() {
  const ch = CHARS[SAVE.char] || CHARS.lamp;
  E = []; PR = []; EB = []; GM = []; PK = []; PT = []; RG = []; TX = []; DC = []; BL = []; TG = []; ZN = [];
  HZ = []; OB = []; VX = []; GH = [];
  grid.clear(); gridKeys.length = 0;
  G = {
    time: 0, kills: 0, level: 1, xp: 0, need: xpNeed(1), pend: 0,
    weapons: [], passives: [], camX: 0, camY: 0, shake: 0, hitstop: 0, slowT: 0, spawnAcc: 0,
    ev: {}, warned: {}, boss: null, bosses: 0, combo: 0, comboT: 0, maxCombo: 0,
    ult: 0, ultNeed: 150, rerolls: 1 + (SAVE.shop.reroll || 0), revives: SAVE.shop.revive ? 1 : 0,
    char: SAVE.char, rift: SAVE.rift, rf: RIFT[SAVE.rift] || RIFT[1], uid: 1,
    hurtFlash: 0, flash: 0, gemChain: 0, gemChainT: 0, later: [], shardsFound: 0,
    dieT: 0, winT: 0, moved: false, wantChest: [], ultTold: false, buildDirty: true, eliteN: 0, chests: 0, ults: 0, evoN: 0,
    mode: 'normal', tile: mapTile((MAPS[SAVE.rift] || MAPS[1]).id), rel: freshRel(), relics: [], relicPend: 0, relicDelay: 0, dark: 0, darkT: 0, fightT: 0, dmgDealt: 0, choice: 'level',
  };
  for (const k in P) delete P[k];
  Object.assign(P, { x: 0, y: 0, r: 11, vx: 0, vy: 0, face: 1, inv: 0, t: 0, hp: 0, maxHp: 0, dashT: 0, dashCd: 0, dashX: 0, dashY: 0 });
  recalc(); P.hp = P.maxHp;
  addWeapon(ch.start);
  if (ch.start2) addWeapon(ch.start2);
  // a few blobs already waiting in the dark
  for (let i = 0; i < 6; i++) { const a = rnd(TAU); spawnEnemy('blob', Math.cos(a) * 300, Math.sin(a) * 300); }
}

function recalc() {
  const m = (CHARS[G.char] || CHARS.lamp).mods, s = SAVE.shop;
  let maxHp = 100 + (m.hp || 0) + (s.hp || 0) * 10;
  let might = 1 + (m.might || 0) + (s.might || 0) * .05;
  let area = 1 + (m.area || 0);
  let cd = 1 - (m.cd || 0);
  let spd = 1 + (m.spd || 0) + (s.spd || 0) * .04;
  let pickup = 1 + (s.magnet || 0) * .15;
  let crit = .05 + (s.crit || 0) * .04;
  let xp = 1 + (s.xp || 0) * .05;
  let regen = (s.regen || 0) * .1 + (m.regen || 0);
  let amount = (m.amount || 0), luck4 = 0, dur = 1, armor = 1, leechP = 0, dashMul = 1, dashInv = 0;
  crit += m.crit || 0;
  const RL = G.rel || freshRel();
  maxHp += RL.hp; might += RL.might; crit += RL.crit; spd += RL.spd; amount += RL.amount;
  for (const p of G.passives) {
    const L = p.lv;
    if (p.id === 'whet') might += .1 * L;
    else if (p.id === 'lens') area += .1 * L;
    else if (p.id === 'glass') cd *= Math.pow(.93, L);
    else if (p.id === 'heart') { maxHp += 20 * L; regen += .2 * L; }
    else if (p.id === 'wing') spd += .08 * L;
    else if (p.id === 'mirror') amount += L;
    else if (p.id === 'magnet') pickup += .3 * L;
    else if (p.id === 'clover') { crit += .05 * L; xp += .08 * L; luck4 += .08 * L; }
    else if (p.id === 'scale') armor *= Math.pow(.93, L);
    else if (p.id === 'spring') dur += .12 * L;
    else if (p.id === 'ironheart') maxHp += 30 * L;
    else if (p.id === 'will') might += .12 * L;
    else if (p.id === 'windstep') { spd += .1 * L; dashMul *= Math.pow(.92, L); }
    else if (p.id === 'reflex') dashInv += .07 * L;
    else if (p.id === 'bloodmark') leechP += .004 * L;
    else if (p.id === 'focuseye') crit += .07 * L;
    else if (p.id === 'gearwork') cd *= Math.pow(.92, L);
    else if (p.id === 'crest') armor *= Math.pow(.92, L);
  }
  if (P.maxHp && maxHp > P.maxHp) P.hp += maxHp - P.maxHp;
  Object.assign(P, { maxHp, might, area, cdMul: cd, speed: 150 * spd + (RL.spdFlat || 0), pickup: 72 * pickup, crit, xpMul: xp, regen, amount, luck4, ultMul: (1 + (s.ult || 0) * .15) * RL.ult, dur, armorMul: armor, critMul: RL.critMul || 2, leech: RL.leech + leechP, dashMul, dashInv });
  P.hp = Math.min(P.hp, P.maxHp);
}

function addWeapon(id) { G.weapons.push({ id, lv: 1, t: .25, uid: G.uid++, evo: false, ang: 0, pos: [] }); G.buildDirty = true; }

/* ================= spatial grid ================= */
const GS = 64;
const grid = new Map(), gridKeys = [];
const gk = (cx, cy) => (cx + 32768) * 65536 + (cy + 32768);
function gridBuild() {
  for (let i = 0; i < gridKeys.length; i++) grid.get(gridKeys[i]).length = 0;
  gridKeys.length = 0;
  if (grid.size > 6000) grid.clear();
  for (let i = 0; i < E.length; i++) {
    const e = E[i]; if (e.dead) continue;
    const k = gk(Math.floor(e.x / GS), Math.floor(e.y / GS));
    let a = grid.get(k);
    if (!a) { a = []; grid.set(k, a); }
    if (a.length === 0) gridKeys.push(k);
    a.push(e);
  }
}
function gq(x, y, r, fn) {
  const x0 = Math.floor((x - r) / GS), x1 = Math.floor((x + r) / GS), y0 = Math.floor((y - r) / GS), y1 = Math.floor((y + r) / GS);
  for (let cx = x0; cx <= x1; cx++) for (let cy = y0; cy <= y1; cy++) {
    const a = grid.get(gk(cx, cy));
    if (a) for (let i = 0; i < a.length; i++) fn(a[i]);
  }
}
function canHit(e, key, cd) { const t = e.hit[key]; if (t !== undefined && t > G.time) return false; e.hit[key] = G.time + cd; return true; }
function nearest(n, maxD) {
  const out = [], md = maxD * maxD;
  for (let i = 0; i < E.length; i++) {
    const e = E[i]; if (e.dead) continue;
    const d = d2(e.x, e.y, P.x, P.y); if (d > md) continue;
    if (out.length < n) { out.push([d, e]); out.sort((a, b) => a[0] - b[0]); }
    else if (d < out[n - 1][0]) { out[n - 1] = [d, e]; out.sort((a, b) => a[0] - b[0]); }
  }
  return out.map(o => o[1]);
}

/* ================= spawning ================= */
function edgePoint(margin = 60) {
  const hw = W / 2 / ZOOM + margin, hh = H / 2 / ZOOM + margin;
  let x, y;
  if (Math.random() < hw / (hw + hh)) { x = rnd(-hw, hw); y = Math.random() < .5 ? -hh : hh; }
  else { y = rnd(-hh, hh); x = Math.random() < .5 ? -hw : hw; }
  // lean toward where the player is heading so the road ahead is never empty
  return [P.x + x + P.vx * .35, P.y + y + P.vy * .35];
}
function spawnEnemy(type, x, y, elite = false) {
  if (G.mode === 'normal') { const sw = curMap().sub2[type]; if (sw) type = sw; }
  else if (G.mode === 'story' && WD) { const sw = MAPS[WD.reg].sub2[type]; if (sw) type = sw; }
  const d = ENEMY[type];
  const m = G.time / 60, hpm = (1 + m * .28 + m * m * .05) * G.rf.hp * (elite ? 8 : 1);
  const scl = elite ? 1.5 : 1;
  const e = {
    type, x, y, r: d.r * scl, scl, hp: d.hp * hpm, maxHp: d.hp * hpm,
    spd: d.spd * (1 + G.time / RUN_END * .16) * (elite ? .85 : 1) * rnd(.9, 1.1),
    dmg: d.dmg * (elite ? 1.5 : 1), xp: d.xp, ai: d.ai, kbRes: elite ? .7 : (d.kb || 0),
    kx: 0, ky: 0, t: rnd(10), ph: rnd(TAU), flash: 0, elite, hit: {}, cd: rnd(1.2, 2.6), face: 1,
    side: Math.random() < .5 ? -1 : 1, fuse: 0, dead: false, boss: false, blastR: d.blastR,
  };
  E.push(e); return e;
}
function spawnAtEdge(type) { const [x, y] = edgePoint(70); return spawnEnemy(type, x, y); }
function swarm(type, n) {
  const a = rnd(TAU), hw = W / 2 / ZOOM + 80, hh = H / 2 / ZOOM + 80;
  const cx = P.x + Math.cos(a) * hw * 1.1, cy = P.y + Math.sin(a) * hh * 1.1;
  for (let i = 0; i < n; i++) spawnEnemy(type, cx + rnd(-70, 70), cy + rnd(-70, 70));
}
function ringOf(type, n, rad) {
  const mix = WAVES[Math.min(WAVES.length - 1, Math.floor(G.time / 60))].mix;
  for (let i = 0; i < n; i++) { const a = i / n * TAU; spawnEnemy(type === 'mix' ? wpick(mix) : type, P.x + Math.cos(a) * rad, P.y + Math.sin(a) * rad * 1.25); }
}
function spawnElite() {
  const mix = WAVES[Math.min(WAVES.length - 1, Math.floor(G.time / 60))].mix;
  let t = wpick(mix); if (t === 'bomber') t = 'brute';
  const [x, y] = edgePoint(60); spawnEnemy(t, x, y, true);
  G.eliteN++;
  if (G.eliteN === 1) banner('강한 놈', '쓰러뜨리면 상자를 떨군다', 'good');
}
function bossWarn(id) {
  id = mapBoss(id);
  if (G.boss) return false;
  G.warned[id] = G.time;
  banner(BOSS[id].name, '경보 · ' + BOSS[id].sub, 'warn');
  SFX.warn(); buzz([40, 80, 40]);
}
function spawnBoss(id) {
  id = mapBoss(id);
  if (G.boss || G.warned[id] === undefined || G.time - G.warned[id] < 2.8) return false;
  const b = BOSS[id], [x, y] = edgePoint(40);
  const hp = b.hp * G.rf.hp;
  const e = {
    type: id, bk: id, boss: true, x, y, r: b.r, scl: 1, hp, maxHp: hp, spd: b.spd, dmg: b.dmg, xp: 0, ai: 'boss', kbRes: .96,
    kx: 0, ky: 0, t: 0, ph: 0, flash: 0, elite: false, hit: {}, cd: 2.5, cd2: 5, cd3: 5, cd4: 8, face: 1, side: 1, st: '', stT: 0,
    ang: 0, dash: (b.arch || id) === 'cata' ? 600 : 680, combo: 0, dead: false,
  };
  E.push(e); G.boss = e;
  $('bossName').textContent = b.name; $('bossBar').hidden = false;
  shake(8); SFX.thud();
}
function director(dt) {
  const t = G.time;
  const wv = WAVES[Math.min(WAVES.length - 1, Math.floor(t / 60))];
  let rate = lerp(wv.rate[0], wv.rate[1], (t % 60) / 60) * G.rf.spawn;
  if (G.boss) rate *= .45;
  G.spawnAcc += rate * dt;
  const cap = QUALITY < 1 ? 190 : 270;
  while (G.spawnAcc >= 1) { G.spawnAcc -= 1; if (E.length < cap) spawnAtEdge(wpick(wv.mix)); }
  for (let i = 0; i < TIMELINE.length; i++) {
    const ev = TIMELINE[i];
    if (!G.ev[i] && t >= ev.t) { if (ev.fn() !== false) G.ev[i] = 1; }
  }
}

/* ================= combat ================= */
function shoot(kind, x, y, a, spd, dmg, o = {}) {
  PR.push({ kind, x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, a, r: o.r || 5, dmg, pierce: o.pierce || 1, life: o.life || 1.4, hitset: new Set(), boom: o.boom || 0, bdmg: o.bdmg || 0, size: o.size || 1, t: 0, dead: false });
}
function fireEB(x, y, a, spd, dmg, big, o) {
  if (G.rel) spd *= G.rel.bslow;
  const b = { x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, r: big ? 8 : 5.5, dmg, life: 7, big, t: 0, dead: false };
  if (o) Object.assign(b, o);
  EB.push(b); return b;
}
function radial(e, n, spd, off, dmg, big) { for (let i = 0; i < n; i++) fireEB(e.x, e.y, off + i / n * TAU, spd, dmg, big); SFX.spit(); }
function fan(e, a, n, spread, spd, dmg) { for (let i = 0; i < n; i++) fireEB(e.x, e.y, a + (i - (n - 1) / 2) * spread / (n - 1), spd, dmg, false); SFX.spit(); }

function hurtEnemy(e, dmg, kx = 0, ky = 0, quiet) {
  if (e.dead || e.inv > 0 || e.hidden || e.under) return 0;
  if (e.ai === 'shard') { shardStruck(e); return 0; }
  const crit = Math.random() < P.crit;
  let d = dmg * P.might * (crit ? P.critMul : 1) * rnd(.92, 1.08) * gearDmg();
  if (e.limbOf) {
    const b = e.limbOf;
    d *= .31;
    if (b.hp - d < b.hpFloor) d = Math.max(0, b.hp - b.hpFloor);
    b.hp -= d; G.dmgDealt += d; e.flash = .09;
    G.ult = Math.min(G.ultNeed, G.ult + d / b.maxHp * G.ultNeed * 7 * P.ultMul);
    if (P.leech && STATE === 'play') P.hp = Math.min(P.maxHp, P.hp + d * P.leech);
    if (!quiet && d >= 1) TX.push({ x: e.x + rnd(-16, 16), y: e.y - 34, vy: -50, life: crit ? .8 : .6, max: crit ? .8 : .6, v: Math.round(d), crit, dead: false });
    if (!quiet) SFX.hit();
    return d;
  }
  if (e.hpFloor !== undefined && e.hp - d < e.hpFloor) { d = Math.max(0, e.hp - e.hpFloor); e.shieldT = .25; }
  if (e.share) { e.share.hp -= d; e.hp = e.share.hp; e.other.hp = e.share.hp; e.other.flash = .06; } else e.hp -= d;
  e.flash = .09;
  if (G.mode === 'boss' && e.arena) {
    G.dmgDealt += d;
    G.ult = Math.min(G.ultNeed, G.ult + d / e.maxHp * G.ultNeed * 7 * P.ultMul);
    if (P.leech && STATE === 'play') P.hp = Math.min(P.maxHp, P.hp + d * P.leech);
  }
  if (kx || ky) { const k = 1 - e.kbRes; e.kx += kx * k; e.ky += ky * k; }
  if (!quiet && d >= 1 && (TX.length < 70 || crit)) TX.push({ x: e.x + rnd(-6, 6), y: e.y - e.r * .7, vy: -50, life: crit ? .8 : .6, max: crit ? .8 : .6, v: Math.max(1, Math.round(d)), crit, dead: false });
  if (!quiet) SFX.hit();
  if (e.hp <= 0) killEnemy(e);
  return d;
}
function aoe(x, y, r, dmg, kb, quiet) {
  gq(x, y, r + 40, e => {
    if (e.dead) return;
    const dd = Math.sqrt(d2(e.x, e.y, x, y));
    if (dd < r + e.r) { const ux = (e.x - x) / (dd || 1), uy = (e.y - y) / (dd || 1); hurtEnemy(e, dmg, ux * kb, uy * kb, quiet); }
  });
}
function killEnemy(e) {
  if (e.dead) return;
  if (e.arena) { e.dead = true; if (e.other) e.other.dead = true; arenaBossDown(e); return; }
  e.dead = true; G.kills++;
  if (G.mode === 'boss') G.ult = Math.min(G.ultNeed, G.ult + 10 * P.ultMul);
  G.combo++; G.comboT = 1.3; if (G.combo > G.maxCombo) G.maxCombo = G.combo;
  if (!e.boss) G.ult = Math.min(G.ultNeed, G.ult + (e.elite ? 14 : 1) * P.ultMul * (G.combo >= 40 ? 1.5 : 1));
  if (e.boss) { bossDown(e); return; }
  if (G.mode === 'story') { storyKill(e); return; }
  if (e.xp) dropGem(e.x, e.y, e.xp * (e.elite ? 14 : 1));
  if (e.elite) { PK.push({ kind: 'chest', x: e.x, y: e.y, t: 0, dead: false }); shake(6); G.hitstop = .06; burst(e.x, e.y, 14, COL.yellow, 200); }
  else {
    const r = Math.random();
    if (r < .0028) addPick('heart', e.x, e.y);
    else if (r < .0038) addPick('magnet', e.x, e.y);
    else if (r < .0048) addPick('bomb', e.x, e.y);
    else if (r < .0064) addPick('shard', e.x, e.y);
  }
  splat(e.x, e.y, e.r * 2.6, e.elite);
  burst(e.x, e.y, e.elite ? 16 : 6, COL.ink, e.elite ? 230 : 140);
  if (Math.random() < .45) burst(e.x, e.y, 2, COL.pink, 110);
  SFX.kill();
  if (e.type === 'scribbler') { HZ.push({ k: 'pool', x: e.x, y: e.y, r: 60, warn: .4, dur: 4, dmg: 10, t: 0, dead: false, scrib: 1 }); burst(e.x, e.y, 14, COL.deep, 240); }
  const ED = ENEMY[e.type] || {};
  if (ED.split) for (let k = 0; k < 2; k++) { const m = spawnEnemy(ED.split, e.x + rnd(-8, 8), e.y + rnd(-8, 8)); m.kx = rnd(-140, 140); m.ky = rnd(-140, 140); }
  if (ED.blast) bomberBlast(e, true);
}
function bomberBlast(e, byPlayer) {
  if (!byPlayer) { e.dead = true; splat(e.x, e.y, 50, true); }
  const BR = e.blastR || 62;
  ringFx(e.x, e.y, BR, COL.pink, .3, 5);
  burst(e.x, e.y, 12, COL.pink, 220); burst(e.x, e.y, 6, COL.yellow, 160);
  SFX.boom(false); shake(byPlayer ? 2 : 5);
  if (!byPlayer && d2(P.x, P.y, e.x, e.y) < (BR + P.r) ** 2) hurtPlayer(16);
  aoe(e.x, e.y, BR, 32, 160, true);
}
function strike(t, dmg, chain) {
  const sx = t.x + rnd(-40, 40), sy = t.y - H / ZOOM * .7;
  BL.push({ pts: jag(sx, sy, t.x, t.y, 7), life: .2, max: .2, dead: false });
  ringFx(t.x, t.y, 26, COL.yellow, .2, 4);
  hurtEnemy(t, dmg, 0, 0);
  const hit = new Set([t]); let cur = t;
  for (let c = 0; c < chain; c++) {
    let best = null, bd = 150 * 150;
    gq(cur.x, cur.y, 150, e => { if (e.dead || hit.has(e)) return; const d = d2(e.x, e.y, cur.x, cur.y); if (d < bd) { bd = d; best = e; } });
    if (!best) break;
    BL.push({ pts: jag(cur.x, cur.y, best.x, best.y, 4), life: .18, max: .18, dead: false });
    hit.add(best); hurtEnemy(best, dmg * .7, 0, 0); cur = best;
  }
}
function jag(x1, y1, x2, y2, n) {
  const pts = [x1, y1], dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
  for (let i = 1; i < n; i++) { const f = i / n, o = rnd(-1, 1) * Math.min(22, l * .12); pts.push(x1 + dx * f + nx * o, y1 + dy * f + ny * o); }
  pts.push(x2, y2); return pts;
}
function pulseRing(S) {
  RG.push({ x: P.x, y: P.y, follow: true, r: 0, max: S.rad * P.area, dur: .38, t: 0, dmg: S.dmg, kb: 300, hit: new Set(), col: COL.pink, w: 6, heal: !!S.heal, healed: 0, clear: true, dead: false, riso: true });
  SFX.pulse();
}
function meteorImpact(x, y, r, dmg, burn, big) {
  aoe(x, y, r, dmg, 220);
  ringFx(x, y, r * 1.1, COL.pink, .35, big ? 8 : 6);
  ringFx(x, y, r * .6, COL.yellow, .25, 4);
  burst(x, y, big ? 22 : 12, COL.deep, 260); burst(x, y, 8, COL.yellow, 200);
  splat(x, y, r * 1.25, false);
  shake(big ? 8 : 4.5); SFX.boom(big);
  if (burn) ZN.push({ x, y, r: r * .9, t: 0, dur: 2.4, dps: burn, tick: 0, dead: false });
}

function hurtPlayer(d, force) {
  if ((!force && P.inv > 0) || STATE !== 'play' || G.god) return;
  d *= G.rf.dmg * P.armorMul * (1 + G.rel.taken) * (G.enraged ? 1.5 : 1);
  P.hp -= d; P.inv = .6; gearHurt();
  if (P.hp <= 0 && G.rel.undying) { G.rel.undying = 0; P.hp = 1; P.inv = 1.6; G.flash = .5; banner('불사', '한 번 버텼다', 'good'); SFX.heal(); return; } G.hurtFlash = .3; shake(6); SFX.hurt(); buzz(30);
  TX.push({ x: P.x, y: P.y - 20, vy: -40, life: .7, max: .7, v: '-' + Math.round(d), crit: false, me: true, dead: false });
  if (P.hp <= 0) playerDown();
}
function heal(v) {
  const before = P.hp; P.hp = Math.min(P.maxHp, P.hp + v);
  const got = P.hp - before;
  if (got >= 1) TX.push({ x: P.x, y: P.y - 22, vy: -36, life: .8, max: .8, v: '+' + Math.round(got), crit: false, healTxt: true, dead: false });
}
function playerDown() {
  if (G.revives > 0) {
    G.revives--; P.hp = P.maxHp * .5; P.inv = 2.2;
    RG.push({ x: P.x, y: P.y, follow: true, r: 0, max: 520, dur: .55, t: 0, dmg: 200, kb: 500, hit: new Set(), col: COL.yellow, w: 10, clear: true, dead: false });
    G.flash = .6; G.slowT = .6; SFX.ult(); banner('두 번째 불씨', '다시 일어났다', 'good'); buzz([60, 40, 120]);
    return;
  }
  P.hp = 0; STATE = 'dying'; G.dieT = 1.5; G.slowT = 0; SFX.die(); buzz([80, 60, 200]);
  burst(P.x, P.y, 30, COL.pink, 260); burst(P.x, P.y, 20, COL.yellow, 200);
  INPUT.joy = null; updMove();
}
function useUlt() {
  if (STATE !== 'play' || G.ult < G.ultNeed) return;
  G.ult = 0; G.ults++;
  const ud = G.mode === 'boss' && G.boss ? G.boss.maxHp * .055 / P.might : 130 * (1 + G.time / 150);
  RG.push({ x: P.x, y: P.y, follow: true, r: 0, max: Math.max(W, H) / ZOOM * .75, dur: .6, t: 0, dmg: ud, kb: 520, hit: new Set(), col: COL.yellow, w: 14, clear: true, dead: false, riso: true });
  for (const b of EB) if (!b.dead) { b.dead = true; burst(b.x, b.y, 2, COL.pink, 60); }
  G.flash = .7; G.hitstop = .08; shake(14); SFX.ult(); buzz([30, 30, 90]);
  SAVE.ultSeen = 1;
  if (P.heavenly && G.mode === 'boss') heavenlyUlt();
}

/* ================= pickups, fx ================= */
function dropGem(x, y, v) {
  if (GM.length > 330) { const g = GM[(Math.random() * GM.length) | 0]; g.v += v; g.tier = gemTier(g.v); return; }
  const a = rnd(TAU), s = rnd(20, 70);
  GM.push({ x, y, v, tier: gemTier(v), vx: Math.cos(a) * s, vy: Math.sin(a) * s, mag: false, sp: 0, t: rnd(10), dead: false });
}
const gemTier = v => v >= 25 ? 3 : v >= 5 ? 2 : 1;
function addPick(kind, x, y) { PK.push({ kind, x, y, t: 0, dead: false }); }
function burst(x, y, n, c, sp) {
  if (PT.length > 520) n = Math.min(n, 2);
  for (let i = 0; i < n; i++) { const a = rnd(TAU), s = rnd(.3, 1) * sp; PT.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rnd(.25, .55), max: .55, s: rnd(2, 4.5), c, dead: false }); }
}
function ringFx(x, y, max, col, dur, w) { RG.push({ x, y, r: 0, max, dur, t: 0, dmg: 0, col, w, dead: false }); }
function splat(x, y, s, pink) {
  if (DC.length > 150) DC.shift();
  DC.push({ x, y, s: s * rnd(.85, 1.2), rot: rnd(TAU), img: pink ? pick(SP.splatP) : pick(SP.splat), life: 14, a: pink ? .3 : .3, dead: false });
}
function shake(v) { G.shake = Math.max(G.shake, v); }

function takePick(k) {
  if (k.kind === 'heart') { heal(30); SFX.heal(); burst(P.x, P.y, 10, COL.pink, 120); }
  else if (k.kind === 'magnet') { for (const g of GM) if (!g.mag) { g.mag = true; g.sp = -100; } SFX.pick(); ringFx(P.x, P.y, 160, COL.teal, .4, 4); }
  else if (k.kind === 'bomb') {
    for (const e of E) if (!e.dead && !e.boss && onScreen(e.x, e.y, 0)) hurtEnemy(e, 80 * (1 + G.time / 200), 0, 0, true);
    G.flash = .5; shake(10); SFX.boom(true); ringFx(P.x, P.y, 420, COL.pink, .5, 10);
  }
  else if (k.kind === 'shard') { G.shardsFound += 5; SFX.pick(); TX.push({ x: P.x, y: P.y - 24, vy: -36, life: .9, max: .9, v: '파편 +5', crit: false, healTxt: true, dead: false }); }
  else if (k.kind === 'chest') { G.wantChest.push(!!k.boss); SFX.pick(); }
}

/* ================= bosses ================= */
const Z0 = [0, 0];
function startAim(e) {
  e.st = 'aim'; e.stT = .72;
  const a = Math.atan2(P.y - e.y, P.x - e.x); e.dx = Math.cos(a); e.dy = Math.sin(a);
  TG.push({ x: e.x, y: e.y, a, len: e.dash * .5 + 30, t: 0, dur: .72, kind: 'eline', w: e.r * 1.5, dead: false });
}
function bossAI(e, dt, ux, uy, dist) {
  const BD = BOSS[e.bk], B = BD.arch || e.bk;
  e.cd -= dt; e.cd2 -= dt;
  const hk = bossHook(e, dt, ux, uy, dist); if (hk) return hk;
  if (e.st === 'aim') { e.stT -= dt; if (e.stT <= 0) { e.st = 'dash'; e.stT = .5; SFX.swish(); buzz(15); } return Z0; }
  if (e.st === 'dash') {
    e.stT -= dt;
    if (BD.trail && Math.random() < dt * 16) fireEB(e.x, e.y, rnd(TAU), 14, 9, false, { life: 2.6 });
    if (Math.random() < .7) PT.push({ x: e.x + rnd(-e.r, e.r) * .6, y: e.y + rnd(-e.r, e.r) * .6, vx: 0, vy: 0, life: .4, max: .4, s: rnd(4, 8), c: COL.ink, dead: false });
    if (e.stT <= 0) { e.st = 'rec'; e.stT = .5; if (B === 'rake') fan(e, Math.atan2(P.y - e.y, P.x - e.x), 7, 1.1, 165, 10); }
    return [e.dx * e.dash, e.dy * e.dash];
  }
  if (e.st === 'rec') { e.stT -= dt; if (e.stT <= 0) { if (e.combo > 0) { e.combo--; startAim(e); } else e.st = ''; } return Z0; }
  if (BD.sig && STATE === 'play') { e.sigCd = (e.sigCd === undefined ? BD.sigCd * .5 : e.sigCd) - dt; if (e.sigCd <= 0) { e.sigCd = BD.sigCd * (e.hp < e.maxHp * .5 ? .75 : 1); SIG[BD.sig](e); const hk2 = bossHook(e, 0, ux, uy, dist); if (hk2) return hk2; } }

  if (B === 'colossus') {
    if (e.slam > 0) {
      e.slam -= dt;
      if (e.slam <= 0) {
        ringFx(e.x, e.y, 145, COL.ink, .35, 8);
        if (d2(P.x, P.y, e.x, e.y) < (145 + P.r) ** 2) hurtPlayer(22);
        radial(e, 12, 135, rnd(TAU), 9, false); shake(10); SFX.boom(true); splat(e.x, e.y, 140, false);
      }
      return Z0;
    }
    if (e.cd <= 0) { e.cd = 4.3; e.slam = .95; TG.push({ x: e.x, y: e.y, r: 145, t: 0, dur: .95, kind: 'eslam', follow: e, dead: false }); }
    if (e.cd2 <= 0) { e.cd2 = 7.5; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; spawnEnemy('blob', e.x + Math.cos(a) * 75, e.y + Math.sin(a) * 75); } }
    return [ux * e.spd, uy * e.spd];
  }
  if (B === 'rake') {
    if (e.cd <= 0) { e.cd = 3.3; e.combo = e.hp < e.maxHp * .5 ? 1 : 0; startAim(e); return Z0; }
    const want = 230, rad = (dist - want) / want;
    const tx = ux * rad * 1.6 - uy * e.side, ty = uy * rad * 1.6 + ux * e.side, tl = Math.hypot(tx, ty) || 1;
    return [tx / tl * e.spd * 1.3, ty / tl * e.spd * 1.3];
  }
  if (B === 'eye') {
    e.ph -= dt;
    if (e.ph <= 0) { e.shooting = !e.shooting; e.ph = e.shooting ? 3.2 : 1.9; }
    if (e.shooting) {
      e.stT -= dt;
      if (e.stT <= 0) { e.stT = .12; const arms = e.hp < e.maxHp * .5 ? 3 : 2; for (let k = 0; k < arms; k++) fireEB(e.x, e.y, e.ang + k / arms * TAU, 105, 9, false); e.ang += .22; SFX.spit(); }
    }
    if (e.cd2 <= 0) { e.cd2 = 9; for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; spawnEnemy('moth', e.x + Math.cos(a) * 95, e.y + Math.sin(a) * 95); } }
    const m = dist > 175 ? 1 : 0;
    return [ux * e.spd * m, uy * e.spd * m];
  }
  if (B === 'cata') {
    const hr = e.hp / e.maxHp, ph = hr > .66 ? 1 : hr > .33 ? 2 : 3, sp = ph === 3 ? .7 : 1;
    if (e.cd <= 0) {
      e.cd = 2.6 * sp;
      const n = ph === 1 ? 3 : 4;
      for (let i = 0; i < n; i++) {
        const x = P.x + rnd(-110, 110) + P.vx * .5, y = P.y + rnd(-110, 110) + P.vy * .5;
        TG.push({ x, y, r: 62, t: -i * .15, dur: 1.05, kind: 'emeteor', dead: false, cb: () => {
          ringFx(x, y, 70, COL.ink, .3, 6); burst(x, y, 12, COL.deep, 220); splat(x, y, 90, false);
          if (STATE === 'play' && d2(P.x, P.y, x, y) < (62 + P.r) ** 2) hurtPlayer(18);
          SFX.boom(false); shake(4);
        } });
      }
    }
    if (e.cd2 <= 0) { e.cd2 = 4 * sp; radial(e, ph === 1 ? 16 : 20, 118, e.t, 9, ph === 3); }
    if (ph >= 2) { e.cd3 -= dt; if (e.cd3 <= 0) { e.cd3 = 5.5 * sp; e.combo = ph === 3 ? 1 : 0; startAim(e); return Z0; } }
    if (ph === 3) { e.cd4 -= dt; if (e.cd4 <= 0) { e.cd4 = 8; for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; spawnEnemy('mini', e.x + Math.cos(a) * 80, e.y + Math.sin(a) * 80); } } }
    return [ux * e.spd, uy * e.spd];
  }
  return Z0;
}
const B0 = e => BOSS[e.bk].arch || e.bk;
function bossDown(e) {
  if (G.mode === 'story') { storyBossDown(e); return; }
  G.boss = null; G.bosses++;
  $('bossBar').hidden = true;
  shake(18); G.hitstop = .2; G.slowT = .9; G.flash = .7; SFX.boom(true); buzz([50, 40, 160]);
  for (let i = 0; i < 6; i++) G.later.push({ t: i * .13, fn: () => { ringFx(e.x + rnd(-40, 40), e.y + rnd(-40, 40), rnd(70, 130), i % 2 ? COL.pink : COL.ink, .4, 7); burst(e.x, e.y, 18, i % 2 ? COL.pink : COL.deep, 300); splat(e.x + rnd(-50, 50), e.y + rnd(-50, 50), 120, i % 2 === 1); SFX.boom(i === 5); } });
  for (const b of EB) b.dead = true;
  if (B0(e) === 'cata') {
    STATE = 'winning'; G.winT = 3.2;
    for (const o of E) if (!o.dead) { o.dead = true; burst(o.x, o.y, 4, COL.ink, 150); splat(o.x, o.y, o.r * 2.4, false); }
    banner('밤을 넘겼다', BOSS[e.bk].name + ' 쓰러짐', 'good');
    setTimeout(() => SFX.win(), 700);
    return;
  }
  for (let i = 0; i < 18; i++) { const a = i / 18 * TAU; const g = { x: e.x, y: e.y, v: 6, tier: 2, vx: Math.cos(a) * 220, vy: Math.sin(a) * 220, mag: false, sp: 0, t: 0, dead: false }; GM.push(g); }
  PK.push({ kind: 'chest', boss: true, x: e.x, y: e.y, t: 0, dead: false });
  banner(BOSS[e.bk].name, '쓰러짐 · 상자를 열어라', 'good');
}

/* ================= level & chest logic ================= */
function gainXp(v) {
  G.xp += v * P.xpMul;
  while (G.xp >= G.need) {
    G.xp -= G.need; G.level++; G.need = xpNeed(G.level); G.pend++;
    ringFx(P.x, P.y, 150, COL.yellow, .45, 8);
    aoe(P.x, P.y, 150, 0, 300, true);
    SFX.level(); buzz(20);
    const lb = $('lvB'); lb.classList.remove('pop'); void lb.offsetWidth; lb.classList.add('pop');
  }
}
function rollChoices() {
  const opts = [];
  const bossGear = G.mode === 'boss', wFull = G.weapons.length >= (bossGear ? 3 : 4), pFull = G.passives.length >= 4;
  for (const w of G.weapons) if (!w.evo && w.lv < WEAPONS[w.id].max) opts.push({ k: 'w', id: w.id, w: 1.3 });
  if (!wFull) for (const id in WEAPONS) if (!G.weapons.some(w => w.id === id) && !!WEAPONS[id].boss === bossGear && !WEAPONS[id].special && gearOpen(id)) opts.push({ k: 'w', id, w: 1, isNew: 1 });
  for (const p of G.passives) if (p.lv < PASSIVES[p.id].max) opts.push({ k: 'p', id: p.id, w: 1 });
  if (!pFull) for (const id in PASSIVES) if (!G.passives.some(p => p.id === id) && !!PASSIVES[id].boss === bossGear && gearOpen(id)) {
    const evoBoost = (EVO_OF[id] || []).some(wid => G.weapons.some(w => w.id === wid && !w.evo)) ? 1.4 : .85;
    opts.push({ k: 'p', id, w: evoBoost, isNew: 1 });
  }
  const n = Math.random() < P.luck4 ? 4 : 3;
  const out = [];
  while (out.length < n && opts.length) {
    let tot = 0; for (const o of opts) tot += o.w;
    let r = Math.random() * tot, idx = 0;
    for (; idx < opts.length - 1; idx++) { r -= opts[idx].w; if (r <= 0) break; }
    out.push(opts.splice(idx, 1)[0]);
  }
  if (G.level <= 5 && !wFull && !out.some(o => o.k === 'w' && o.isNew)) {
    const nw = opts.filter(o => o.k === 'w' && o.isNew);
    if (nw.length && out.length) out[out.length - 1] = pick(nw);
  }
  if (!out.length) out.push({ k: 'heal' }, { k: 'shard' });
  return out;
}
function applyChoice(o) {
  if (o.k === 'w') { const w = G.weapons.find(x => x.id === o.id); if (w) w.lv = Math.min(WEAPONS[w.id].max, w.lv + 1); else addWeapon(o.id); }
  else if (o.k === 'p') { const p = G.passives.find(x => x.id === o.id); if (p) p.lv = Math.min(PASSIVES[p.id].max, p.lv + 1); else G.passives.push({ id: o.id, lv: 1 }); recalc(); }
  else if (o.k === 'relic') { G.relics.push(o.id); RELICS[o.id].fn(); recalc(); }
  else if (o.k === 'heal') heal(P.maxHp * .4);
  else if (o.k === 'shard') G.shardsFound += 15;
  G.buildDirty = true;
}
function chestRewards(boss) {
  const out = [], cnt = boss ? 3 : 1;
  for (let i = 0; i < cnt; i++) {
    const evo = G.weapons.find(w => !w.evo && w.lv >= WEAPONS[w.id].max && G.passives.some(p => p.id === WEAPONS[w.id].evoWith));
    if (evo) { evo.evo = true; evo.t = .2; G.evoN++; out.push({ type: 'evo', id: evo.id }); SAVE.stats.evos[evo.id] = 1; continue; }
    const ups = [];
    for (const w of G.weapons) if (!w.evo && w.lv < WEAPONS[w.id].max) ups.push({ k: 'w', o: w });
    for (const p of G.passives) if (p.lv < PASSIVES[p.id].max) ups.push({ k: 'p', o: p });
    if (ups.length) { const u = pick(ups); u.o.lv++; out.push({ type: 'up', k: u.k, id: u.o.id, lv: u.o.lv }); }
    else { heal(P.maxHp * .3); G.shardsFound += 10; out.push({ type: 'misc' }); }
  }
  recalc(); G.buildDirty = true;
  return out;
}

/* ================= simulation step ================= */
function step(dt) {
  G.time += dt;
  if (G.mode === 'boss') arenaStep(dt);
  else if (G.mode === 'story') { if (WD && STATE === 'play') storyTick(dt); }
  else if (STATE === 'play') director(dt);
  AU.intensity = G.boss ? 3 : G.time > 200 ? 2 : 1;

  for (let i = 0, n = G.later.length; i < n; i++) { const l = G.later[i]; l.t -= dt; if (l.t <= 0) { l.done = true; l.fn(); } }
  G.later = G.later.filter(l => !l.done);

  updatePlayer(dt);
  updateEnemies(dt);
  gridBuild();
  if (STATE === 'play') for (const w of G.weapons) {
    const D = WEAPONS[w.id], S = D.stat(w.lv, w.evo);
    if (D.tick) { D.tick(w, S, dt); continue; }
    w.t -= dt;
    if (w.t <= 0) w.t = D.fire(w, S) ? S.cd * P.cdMul : .1;
  }
  updateProj(dt);
  updateEB(dt);
  updateRings(dt);
  for (const t of TG) {
    if (t.dead) continue;
    t.t += dt;
    if (t.follow) { if (t.follow.dead) { t.dead = true; continue; } t.x = t.follow.x; t.y = t.follow.y; }
    if (t.t >= t.dur) { t.dead = true; if (t.cb) t.cb(); }
  }
  for (const z of ZN) {
    if (z.follow && !z.follow.dead) { z.x = z.follow.x; z.y = z.follow.y; }
    z.t += dt; z.tick -= dt;
    if (z.tick <= 0) { z.tick = .3; aoe(z.x, z.y, z.r, z.dps * .3, 0, true); if (z.slow) gq(z.x, z.y, z.r + 30, e => { if (d2(e.x, e.y, z.x, z.y) < (z.r + e.r) ** 2) e.slowT = .45; }); }
    if (z.t >= z.dur) z.dead = true;
  }
  updateVortex(dt);
  updateGems(dt);
  updatePicks(dt);
  updateFx(dt);

  if (G.comboT > 0) { G.comboT -= dt; if (G.comboT <= 0) G.combo = 0; }
  if (G.gemChainT > 0) { G.gemChainT -= dt; if (G.gemChainT <= 0) G.gemChain = 0; }
  if (G.hurtFlash > 0) G.hurtFlash -= dt;
  if (G.flash > 0) G.flash -= dt * 1.6;
  G.shake *= Math.exp(-dt * 9); if (G.shake < .2) G.shake = 0;

  const k = 1 - Math.exp(-dt * 8);
  let tx = P.x + P.vx * .1, ty = P.y + P.vy * .1;
  if (G.u && G.u.stage === 'chase') { ty = P.y + 30; tx = P.x * .4; }
  else if (G.u && G.u.stage === 'final') { tx = clamp(P.x, -RW + VHW * .8, RW - VHW * .8); ty = P.y * .3; }
  else if (G.mode === 'boss' && G.boss && !G.boss.dead && STATE !== 'intro' && !(G.u && G.u.stage === 'maze')) { tx = lerp(tx, G.boss.x, .22); ty = lerp(ty, G.boss.y, .22); }
  if (G.mode === 'story' && WD) storyCam(dt); else { G.camX = lerp(G.camX, tx, k); G.camY = lerp(G.camY, ty, k); }
  for (const g of GH) { g.life -= dt; if (g.life <= 0) g.dead = true; }

  sweep(HZ); sweep(OB); sweep(VX); sweep(GH);
  sweep(E); sweep(PR); sweep(EB); sweep(GM); sweep(PK); sweep(PT); sweep(RG); sweep(TX); sweep(DC); sweep(BL); sweep(TG); sweep(ZN);
}

function updatePlayer(dt) {
  if (G.afterT > 0) G.afterT -= dt;
  let mx = STATE === 'play' ? INPUT.mx : 0, my = STATE === 'play' ? INPUT.my : 0;
  const ml = Math.hypot(mx, my); if (ml > 1) { mx /= ml; my /= ml; }
  const f = 1 - Math.exp(-dt * 16);
  let spMul = G.sprint || 1;
  if (G.mode === 'boss') for (const h of HZ) if (h.k === 'pool' && !h.dead && h.t >= h.warn && d2(P.x, P.y, h.x, h.y) < h.r * h.r) {
    if (h.slow) spMul = .45;
    if (h.dmg && STATE === 'play') hurtPlayer(h.dmg);
  }
  if (P.dashCd > 0) P.dashCd -= dt;
  if (P.dashT > 0) {
    P.dashT -= dt; P.vx = P.dashX * 760; P.vy = P.dashY * 760;
    GH.push({ x: P.x, y: P.y, life: .28, max: .28, dead: false });
  } else { P.vx = lerp(P.vx, mx * P.speed * spMul, f); P.vy = lerp(P.vy, my * P.speed * spMul, f); }
  if (G.mode === 'story' && WD) storyMove(dt);
  if (G.mode === 'story' && WD) {
    // small steps so a dash can never skip over a one-tile rock or tree
    const n = Math.max(1, Math.ceil(Math.hypot(P.vx, P.vy) * dt / 8));
    for (let i = 0; i < n; i++) { P.x += P.vx * dt / n; P.y += P.vy * dt / n; storyCollideP(); }
  } else { P.x += P.vx * dt; P.y += P.vy * dt; }
  if (G.mode === 'boss') {
    if (G.pull > 0 && G.boss && !G.boss.dead && STATE === 'play') { const dx = G.boss.x - P.x, dy = G.boss.y - P.y, d = Math.hypot(dx, dy) || 1; P.x += dx / d * G.pull * dt; P.y += dy / d * G.pull * dt; if (Math.random() < .6) PT.push({ x: P.x + rnd(-200, 200), y: P.y + rnd(-200, 200), vx: dx / d * 260, vy: dy / d * 260, life: .5, max: .5, s: rnd(2, 4), c: COL.white, dead: false }); }
    uClampPlayer();
  }
  if (Math.abs(mx) > .12) P.face = mx > 0 ? 1 : -1;
  if (ml > .3 && !G.moved) { G.moved = true; G.hintT = 2.5; }
  P.t += dt;
  if (P.inv > 0) P.inv -= dt;
  if (STATE === 'play' && P.regen > 0 && P.hp < P.maxHp) P.hp = Math.min(P.maxHp, P.hp + P.regen * dt);
  if (ml > .3 && Math.random() < dt * 22) PT.push({ x: P.x + rnd(-4, 4), y: P.y + 9, vx: rnd(-12, 12) - P.vx * .2, vy: rnd(5, 25) - P.vy * .2, life: .4, max: .4, s: rnd(1.6, 3.2), c: Math.random() < .5 ? COL.pink : COL.yellow, dead: false });
}

function updateEnemies(dt) {
  const vhw = W / 2 / ZOOM, vhh = H / 2 / ZOOM, kd = Math.exp(-dt * 7);
  for (let i = 0; i < E.length; i++) {
    const e = E[i]; if (e.dead) continue;
    e.t += dt; if (e.flash > 0) e.flash -= dt;
    if (e.idle) {
      e.wt -= dt; if (e.wt <= 0) { e.wt = rnd(1.5, 3.5); e.wa = Math.random() < .35 ? -1 : Math.atan2(e.hy - e.y, e.hx - e.x) + rnd(-1.4, 1.4); }
      if (e.wa !== -1) { e.x += Math.cos(e.wa) * e.spd * .3 * dt; e.y += Math.sin(e.wa) * e.spd * .3 * dt; if (Math.abs(Math.cos(e.wa)) > .2) e.face = Math.cos(e.wa) > 0 ? 1 : -1; }
      if (WD) storyCollideE(e);
      continue;
    }
    if (e.ai === 'limb') { e.life -= dt; if (e.life <= 0) { e.dead = true; continue; } }
    if (e.ai === 'shard') { updateShard(e, dt); continue; }
    const dx = P.x - e.x, dy = P.y - e.y, dist = Math.hypot(dx, dy) || 1, ux = dx / dist, uy = dy / dist;
    let mvx = 0, mvy = 0;
    if (e.arena || e.ai === 'echo' || e.ai === 'sat') { const m = arenaAI(e, dt, ux, uy, dist); mvx = m[0]; mvy = m[1]; }
    else if (e.boss) { const m = bossAI(e, dt, ux, uy, dist); mvx = m[0]; mvy = m[1]; }
    else if (e.ai === 'chase') { mvx = ux * e.spd; mvy = uy * e.spd; }
    else if (e.ai === 'wobble') { const w = Math.sin(e.t * 4.5 + e.ph) * .85; mvx = (ux - uy * w) * e.spd; mvy = (uy + ux * w) * e.spd; }
    else if (e.ai === 'spit') {
      const s = dist > 215 ? 1 : dist < 150 ? -.7 : 0;
      mvx = (ux * s - uy * .45 * e.side) * e.spd; mvy = (uy * s + ux * .45 * e.side) * e.spd;
      e.cd -= dt;
      if (e.cd <= 0 && dist < 430 && STATE === 'play') { e.cd = rnd(2.4, 3.1); fireEB(e.x, e.y, Math.atan2(dy, dx), 128, 9, false); SFX.spit(); e.flash = .07; }
    }
    else if (MAP_AI[e.ai]) { const m = MAP_AI[e.ai](e, dt, ux, uy, dist); if (!m) continue; mvx = m[0]; mvy = m[1]; }
    else if (e.ai === 'bomb') {
      if (e.fuse > 0) { e.fuse -= dt; if (e.fuse <= 0) { bomberBlast(e, false); continue; } }
      else { mvx = ux * e.spd; mvy = uy * e.spd; if (dist < e.r + P.r + 22 && STATE === 'play') e.fuse = .5; }
    }
    if (e.slowT > 0) { e.slowT -= dt; mvx *= .5; mvy *= .5; }
    e.x += (mvx + e.kx) * dt; e.y += (mvy + e.ky) * dt;
    e.kx *= kd; e.ky *= kd;
    if (G.mode === 'story' && WD && !e.under) storyCollideE(e);
    if (Math.abs(mvx) + Math.abs(mvy) > 4) e.mvA = Math.atan2(mvy, mvx);
    if (G.mode === 'boss' && !e.under && !e.hidden && !(G.u && G.u.stage !== 'arena')) { const dl = Math.hypot(e.x, e.y), lim = (G.u ? G.u.circleR : ARENA_R) - e.r * .6; if (dl > lim) { e.x *= lim / dl; e.y *= lim / dl; } }
    if (Math.abs(mvx) > 2) e.face = mvx > 0 ? 1 : -1;
    if (!e.boss && !e.fixed) {
      const a = grid.get(gk(Math.floor(e.x / GS), Math.floor(e.y / GS)));
      if (a) {
        let c = 0;
        for (let j = 0; j < a.length && c < 6; j++) {
          const o = a[j]; if (o === e || o.dead) continue;
          const sx = e.x - o.x, sy = e.y - o.y, md = (e.r + o.r) * .85, dd = sx * sx + sy * sy;
          if (dd < md * md && dd > .0001) { const dl = Math.sqrt(dd), push = (md - dl) / dl * .35; e.x += sx * push; e.y += sy * push; c++; }
        }
      }
    }
    if (e.dmg > 0 && !e.hidden && !e.under && (e.introScale === undefined || e.introScale > .9) && dist < e.r * .85 + P.r) hurtPlayer(e.boss && e.st === 'dash' ? e.dmg * 1.4 : e.dmg);
    if (G.mode !== 'normal') continue;
    if (!e.boss && (Math.abs(dx) > vhw + 420 || Math.abs(dy) > vhh + 420)) { const p = edgePoint(70); e.x = p[0]; e.y = p[1]; e.kx = e.ky = 0; }
    if (e.boss && dist > Math.max(vhw, vhh) * 2.4) { const p = edgePoint(30); e.x = p[0]; e.y = p[1]; }
  }
}

function updateProj(dt) {
  for (let i = 0; i < PR.length; i++) {
    const p = PR[i]; if (p.dead) continue;
    p.t += dt;
    if (p.kind === 'boomer' || p.kind === 'gale') {
      if (p.t >= p.dur) { p.dead = true; continue; }
      const k = Math.sin(Math.PI * p.t / p.dur), ang = p.a + (p.spiral ? p.t * 2.4 : 0);
      p.x = P.x + Math.cos(ang) * p.range * k; p.y = P.y + Math.sin(ang) * p.range * k; p.spin += dt * 18;
      const ca = Math.cos(ang), sa = Math.sin(ang);
      gq(p.x, p.y, p.r + 34, e => {
        if (e.dead) return;
        const q = p.r + e.r;
        if (d2(p.x, p.y, e.x, e.y) < q * q && canHit(e, p.uid, .32)) hurtEnemy(e, p.dmg, ca * 90, sa * 90);
      });
      continue;
    }
    if (p.kind === 'mine') { updateMine(p, dt); continue; }
    if (p.kind === 'fly' || p.kind === 'comet') {
      if (!p.tgt || p.tgt.dead || p.tgt.hidden || p.tgt.under || (p.t % .4) < dt) {
        let best = null, bd = 1e12;
        for (const e of E) { if (e.dead || e.hidden || e.under || p.hitset.has(e)) continue; const d = d2(e.x, e.y, p.x, p.y); if (d < bd) { bd = d; best = e; } }
        p.tgt = best;
      }
      if (p.tgt) { const dx = p.tgt.x - p.x, dy = p.tgt.y - p.y, dl = Math.hypot(dx, dy) || 1, k = 1 - Math.exp(-dt * 5); p.vx = lerp(p.vx, dx / dl * p.spd, k); p.vy = lerp(p.vy, dy / dl * p.spd, k); }
    }
    p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
    if (p.life <= 0) { p.dead = true; continue; }
    if (p.kind !== 'needle' && Math.random() < dt * 30) PT.push({ x: p.x, y: p.y, vx: rnd(-10, 10), vy: rnd(-10, 10), life: .22, max: .25, s: rnd(1.5, 2.8) * p.size, c: Math.random() < .6 ? COL.yellow : COL.pink, dead: false });
    gq(p.x, p.y, p.r + 34, e => {
      if (p.dead || e.dead || p.hitset.has(e)) return;
      const q = p.r + e.r;
      if (d2(p.x, p.y, e.x, e.y) < q * q) {
        p.hitset.add(e);
        const sp = Math.hypot(p.vx, p.vy) || 1;
        hurtEnemy(e, p.dmg, p.vx / sp * 80, p.vy / sp * 80);
        if (p.boom) { const br = p.boom * P.area; aoe(p.x, p.y, br, p.bdmg, 80, true); ringFx(p.x, p.y, br, COL.yellow, .22, 4); burst(p.x, p.y, 5, COL.pink, 120); }
        if (--p.pierce <= 0) { p.dead = true; burst(p.x, p.y, 3, COL.pink, 90); }
      }
    });
  }
}
function updateEB(dt) {
  for (const b of EB) {
    if (b.dead) continue;
    const sp = G.freeze > 0 ? 0 : dt;
    b.x += b.vx * sp; b.y += b.vy * sp; b.life -= sp; b.t += sp;
    if (b.wig) { const r = Math.sin(b.t * 7 + b.x * .01) * b.wig * dt, c = Math.cos(r), s2 = Math.sin(r); const vx = b.vx * c - b.vy * s2; b.vy = b.vx * s2 + b.vy * c; b.vx = vx; }
    if (b.rev && b.t >= b.rev) { b.rev = 0; b.vx *= -1.15; b.vy *= -1.15; ringFx(b.x, b.y, 12, COL.yellow, .2, 2); }
    if (b.life <= 0) { b.dead = true; continue; }
    if (b.web && b.t >= b.web) { b.dead = true; HZ.push({ k: 'pool', x: b.x, y: b.y, r: 70, warn: .25, dur: 7, slow: true, t: 0, dead: false }); burst(b.x, b.y, 6, COL.white, 90); continue; }
    if (b.split && b.t >= b.split.t) { b.dead = true; const o = rnd(TAU); for (let i = 0; i < b.split.n; i++) fireEB(b.x, b.y, o + i / b.split.n * TAU, b.split.spd, b.split.dmg, false); SFX.spit(); continue; }
    if (G.mode === 'boss') {
      const dl = Math.hypot(b.x, b.y);
      if (dl > (G.u ? G.u.circleR : ARENA_R) && !(G.u && G.u.stage !== 'arena')) {
        if (b.bounce > 0) { b.bounce--; const nx = b.x / dl, ny = b.y / dl, dot = b.vx * nx + b.vy * ny; b.vx -= 2 * dot * nx; b.vy -= 2 * dot * ny; b.x = nx * (ARENA_R - 2); b.y = ny * (ARENA_R - 2); ringFx(b.x, b.y, 14, COL.pink, .2, 2); }
        else { b.dead = true; continue; }
      }
      let blocked = false;
      for (const o of OB) if (!o.dead && d2(b.x, b.y, o.x, o.y) < (o.r + b.r) ** 2) { blocked = true; break; }
      if (!blocked && G.rel.ward) for (let i = 0; i < G.rel.ward; i++) { const a = P.t * 3 + i / G.rel.ward * TAU, ox = P.x + Math.cos(a) * 36, oy = P.y + Math.sin(a) * 36; if (d2(b.x, b.y, ox, oy) < (9 + b.r) ** 2) { blocked = true; break; } }
      if (blocked) { b.dead = true; burst(b.x, b.y, 3, COL.yellow, 80); continue; }
    }
    const q = b.r + P.r * .65;
    if (d2(b.x, b.y, P.x, P.y) < q * q) { b.dead = true; hurtPlayer(b.dmg); burst(b.x, b.y, 4, COL.ink, 90); }
    if (Math.abs(b.x - P.x) > 1300 || Math.abs(b.y - P.y) > 1500) b.dead = true;
  }
}
function updateRings(dt) {
  for (const g of RG) {
    if (g.dead) continue;
    g.t += dt;
    if (g.follow) { g.x = P.x; g.y = P.y; }
    const p = Math.min(1, g.t / g.dur);
    g.r = g.max * (1 - Math.pow(1 - p, 2.2));
    if (g.dmg > 0 && p < 1) {
      gq(g.x, g.y, g.r + 40, e => {
        if (e.dead || g.hit.has(e)) return;
        const dd = Math.sqrt(d2(e.x, e.y, g.x, g.y));
        if (dd < g.r + e.r) {
          g.hit.add(e);
          hurtEnemy(e, g.dmg, (e.x - g.x) / (dd || 1) * g.kb, (e.y - g.y) / (dd || 1) * g.kb);
          if (g.heal && g.healed < 7) { g.healed += .5; P.hp = Math.min(P.maxHp, P.hp + .5); }
        }
      });
      if (g.clear) { const r2 = g.r * g.r; for (const b of EB) if (!b.dead && d2(b.x, b.y, g.x, g.y) < r2) { b.dead = true; burst(b.x, b.y, 2, COL.pink, 70); } }
    }
    if (g.t >= g.dur + .18) g.dead = true;
  }
}
function updateGems(dt) {
  const pr2 = P.pickup * P.pickup;
  for (const g of GM) {
    if (g.dead) continue;
    g.t += dt;
    if (!g.mag) {
      g.x += g.vx * dt; g.y += g.vy * dt; const f = Math.exp(-dt * 6); g.vx *= f; g.vy *= f;
      if (d2(g.x, g.y, P.x, P.y) < pr2) { g.mag = true; g.sp = -150; }
    } else {
      const dx = P.x - g.x, dy = P.y - g.y, dl = Math.hypot(dx, dy) || 1;
      g.sp = Math.min(g.sp + 1700 * dt, 1150);
      g.x += dx / dl * g.sp * dt; g.y += dy / dl * g.sp * dt;
      if (dl < P.r + 8 || (g.sp > 0 && dl < g.sp * dt)) {
        g.dead = true;
        G.gemChain = G.gemChainT > 0 ? G.gemChain + 1 : 0; G.gemChainT = .45;
        SFX.gem(G.gemChain);
        if (STATE === 'play') gainXp(g.v);
      }
    }
  }
}
function updatePicks(dt) {
  for (const k of PK) {
    if (k.dead) continue;
    k.t += dt;
    const dd = d2(k.x, k.y, P.x, P.y);
    if (k.kind !== 'chest' && dd < (P.pickup * .8) ** 2) { const dl = Math.sqrt(dd) || 1; k.x += (P.x - k.x) / dl * 320 * dt; k.y += (P.y - k.y) / dl * 320 * dt; }
    if (STATE === 'play' && dd < (P.r + 16) ** 2) { k.dead = true; takePick(k); }
  }
}
function updateFx(dt) {
  for (const p of PT) { p.x += p.vx * dt; p.y += p.vy * dt; const f = Math.exp(-dt * 5); p.vx *= f; p.vy *= f; p.life -= dt; if (p.life <= 0) p.dead = true; }
  for (const t of TX) { t.y += t.vy * dt; t.vy *= Math.exp(-dt * 4); t.life -= dt; if (t.life <= 0) t.dead = true; }
  for (const d of DC) { d.life -= dt; if (d.life <= 0) d.dead = true; }
  for (const b of BL) { b.life -= dt; if (b.life <= 0) b.dead = true; }
}

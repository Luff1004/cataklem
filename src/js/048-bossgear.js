/* ================= gear that only exists past the portals ================= */
let RW = 620; const RH = 215;
function later2(t, fn) { G.later.push({ t, fn }); }

Object.assign(WEAPONS, {
  hammer: {
    boss: true, name: '파쇄 망치', max: 5, info: '주위를 통째로 내리찍는다. 느리지만 무겁다.',
    ups: ['', '피해 +30%', '범위 +25%', '재사용 -20%', '피해 +40%, 땅이 갈라진다'],
    stat(L) { return { cd: L >= 4 ? 1.25 : 1.55, dmg: L >= 5 ? 135 : L >= 2 ? 95 : 72, r: L >= 3 ? 140 : 112 }; },
    fire(w, S) {
      const r = S.r * P.area; if (!nearest(1, r + 70).length) return false;
      aoe(P.x, P.y, r, S.dmg, 380);
      ringFx(P.x, P.y, r, COL.ink, .3, 10); ringFx(P.x, P.y, r * .6, COL.pink, .25, 6); burst(P.x, P.y, 16, COL.deep, 260);
      if (w.lv >= 5) DC.push({ x: P.x, y: P.y, s: r * 1.6, rot: rnd(TAU), img: SP.crack, life: 4, a: .5, dead: false });
      shake(6); SFX.thud(); SFX.boom(false); return true;
    },
  },
  scythe: {
    boss: true, name: '사슬 낫', max: 5, info: '사슬 끝의 큰 낫이 넓게 돈다.',
    ups: ['', '피해 +40%', '반경 +20%', '낫 +1', '회전 +40%'],
    stat(L) { return { n: L >= 4 ? 2 : 1, dmg: L >= 2 ? 44 : 32, rad: L >= 3 ? 150 : 125, spd: L >= 5 ? 3.6 : 2.6 }; },
    tick(w, S, dt) {
      w.ang += S.spd * dt; w.pos.length = 0;
      for (let i = 0; i < S.n; i++) {
        const a = w.ang + i / S.n * TAU, rad = S.rad * P.area, bx = P.x + Math.cos(a) * rad, by = P.y + Math.sin(a) * rad;
        w.pos.push(bx, by, a, 1);
        gq(bx, by, 110, e => { if (e.dead) return; if (d2(bx, by, e.x, e.y) < (28 + e.r) ** 2 && canHit(e, w.uid * 100 + i, .3)) { hurtEnemy(e, S.dmg, Math.cos(a) * 200, Math.sin(a) * 200); SFX.swish(); } });
      }
    },
  },
  lance: {
    boss: true, name: '관통 창', max: 5, info: '일직선으로 꿰뚫는 창을 던진다.',
    ups: ['', '창 +1', '피해 +50%', '창 +1', '재사용 -25%'],
    stat(L) { return { cd: L >= 5 ? .75 : 1, n: L >= 4 ? 3 : L >= 2 ? 2 : 1, dmg: L >= 3 ? 90 : 60 }; },
    fire(w, S) {
      const t = nearest(1, 900)[0]; if (!t) return false;
      const a = Math.atan2(t.y - P.y, t.x - P.x);
      for (let i = 0; i < S.n; i++) later2(i * .09, () => shoot('lance', P.x, P.y, a + (i - (S.n - 1) / 2) * .06, 760, S.dmg, { r: 9, pierce: 99, life: 1 }));
      SFX.swish(); return true;
    },
  },
  sigil: {
    boss: true, name: '심판 문양', max: 5, info: '적의 발밑에 문양을 새겨 거듭 터뜨린다.',
    ups: ['', '피해 +40%', '더 오래 남는다', '문양 +1', '범위 +30%'],
    stat(L) { return { cd: 2.6, n: L >= 4 ? 2 : 1, dps: L >= 2 ? 95 : 68, dur: L >= 3 ? 4 : 3, r: L >= 5 ? 95 : 72 }; },
    fire(w, S) {
      const ts = nearest(S.n, 700); if (!ts.length) return false;
      for (let i = 0; i < S.n; i++) { const t = ts[i % ts.length]; ZN.push({ x: t.x, y: t.y, r: S.r * P.area, t: 0, dur: S.dur, dps: S.dps, tick: 0, dead: false, kind: 'sigil', follow: t }); }
      SFX.bellSmall(); return true;
    },
  },
  mshield: {
    boss: true, name: '거울 방패', max: 5, info: '곁을 도는 방패. 닿는 적을 치고, 막은 탄은 그대로 되돌려 친다.',
    ups: ['', '되치는 피해 +50%', '방패 +1', '회전 +30%', '방패 +1'],
    stat(L) { return { n: L >= 5 ? 3 : L >= 3 ? 2 : 1, dmg: L >= 2 ? 36 : 24, spd: L >= 4 ? 3.4 : 2.6 }; },
    tick(w, S, dt) {
      w.ang += S.spd * dt; w.pos.length = 0;
      for (let i = 0; i < S.n; i++) {
        const a = w.ang + i / S.n * TAU, sx = P.x + Math.cos(a) * 46, sy = P.y + Math.sin(a) * 46;
        w.pos.push(sx, sy, a, 0);
        gq(sx, sy, 100, e => { if (e.dead || d2(sx, sy, e.x, e.y) > (20 + e.r) ** 2 || !canHit(e, w.uid * 100 + i, .4)) return; hurtEnemy(e, S.dmg * .9, Math.cos(a) * 160, Math.sin(a) * 160); });
        for (const b of EB) {
          if (b.dead || d2(b.x, b.y, sx, sy) > (18 + b.r) ** 2) continue;
          b.dead = true;
          const t = nearest(1, 700)[0];
          if (t) { BL.push({ pts: jag(sx, sy, t.x, t.y, 5), life: .15, max: .15, dead: false }); hurtEnemy(t, S.dmg, 0, 0, true); }
          burst(sx, sy, 4, COL.yellow, 120); if (gate('mir', 60)) SFX.zap();
        }
      }
    },
  },
  comet: {
    boss: true, name: '혜성 활', max: 5, info: '스스로 쫓아가 터지는 혜성을 쏜다.',
    ups: ['', '피해 +40%', '폭발 범위 +30%', '혜성 +1', '재사용 -25%'],
    stat(L) { return { cd: L >= 5 ? 1.5 : 2, n: L >= 4 ? 2 : 1, dmg: L >= 2 ? 120 : 85, boom: L >= 3 ? 100 : 76 }; },
    fire(w, S) {
      if (!E.some(e => !e.dead && !e.hidden && !e.under)) return false;
      for (let i = 0; i < S.n; i++) { const a = rnd(TAU); PR.push({ kind: 'comet', x: P.x, y: P.y, vx: Math.cos(a) * 200, vy: Math.sin(a) * 200, a, r: 12, dmg: S.dmg, pierce: 1, life: 3.5, spd: 420, hitset: new Set(), t: 0, tgt: null, size: 1.6, boom: S.boom, bdmg: S.dmg * .5, dead: false }); }
      SFX.charge(.3); return true;
    },
  },
  scrib_sword: {
    boss: true, special: true, name: '뒤틀린 낙서의 검', evoName: '천상의 검', max: 1,
    info: '넓게 휘두르는 근접 검. 한 번 벨 때마다 아프다.', ups: [''], evoInfo: '낙서가 풀리고 빛만 남았다.',
    stat(L, evo) { return evo ? { cd: .38, dmg: 175, r: 185, arc: 3, wave: true } : { cd: .5, dmg: 115, r: 145, arc: 2.5 }; },
    fire(w, S) {
      const t = nearest(1, S.wave ? 900 : S.r * Math.sqrt(P.area) + 120)[0];
      if (!t) return false;
      swordSwing(w, S, Math.atan2(t.y - P.y, t.x - P.x)); return true;
    },
  },
});

Object.assign(PASSIVES, {
  ironheart: { boss: true, name: '강철 심장', max: 5, info: '최대 체력 +30' },
  will: { boss: true, name: '날 선 의지', max: 5, info: '모든 피해 +12%' },
  windstep: { boss: true, name: '바람걸음', max: 5, info: '이동 속도 +10%, 구르기 재사용 -8%' },
  reflex: { boss: true, name: '반사 신경', max: 5, info: '구르기 무적 시간 +0.07초' },
  bloodmark: { boss: true, name: '흡혈 문양', max: 5, info: '준 피해의 0.4%만큼 체력 회복' },
  focuseye: { boss: true, name: '집중의 눈', max: 5, info: '치명타 +7%' },
  gearwork: { boss: true, name: '가속 장치', max: 5, info: '재사용 시간 -8%' },
  crest: { boss: true, name: '수호 문장', max: 5, info: '받는 피해 -8%' },
});

function bossDraftChoices() {
  if (G.gate.id === 'unknown') return [{ k: 'w', id: 'scrib_sword', isNew: 1 }];
  if (!G.weapons.length) return shuffle(Object.keys(WEAPONS).filter(id => WEAPONS[id].boss && !WEAPONS[id].special && gearOpen(id))).slice(0, 3).map(id => ({ k: 'w', id, isNew: 1 }));
  return rollChoices();
}

/* ---------- art ---------- */
function buildBossGearArt() {
  Object.assign(ICON_SHAPES, {
    hammer: x => { x.save(); x.translate(32, 32); x.rotate(-.6); x.fillRect(-4, -4, 8, 34); x.beginPath(); x.roundRect(-18, -22, 36, 18, 3); x.fill(); x.restore(); },
    scythe: x => { x.lineWidth = 3; x.setLineDash([3, 4]); x.beginPath(); x.moveTo(10, 54); x.lineTo(32, 32); x.stroke(); x.setLineDash([]); x.beginPath(); x.moveTo(30, 34); x.quadraticCurveTo(46, 6, 60, 22); x.quadraticCurveTo(46, 16, 36, 38); x.closePath(); x.fill(); },
    lance: x => { x.lineWidth = 5; x.beginPath(); x.moveTo(8, 56); x.lineTo(46, 18); x.stroke(); x.beginPath(); x.moveTo(58, 6); x.lineTo(40, 16); x.lineTo(48, 24); x.closePath(); x.fill(); },
    sigil: x => { x.lineWidth = 3; x.beginPath(); x.arc(32, 32, 24, 0, TAU); x.stroke(); star(x, 32, 32, 5, 18, 7); x.fill(); },
    mshield: x => { x.beginPath(); x.moveTo(32, 6); x.lineTo(54, 14); x.quadraticCurveTo(54, 44, 32, 58); x.quadraticCurveTo(10, 44, 10, 14); x.closePath(); x.fill(); },
    comet: x => { x.beginPath(); x.arc(42, 22, 11, 0, TAU); x.fill(); x.lineWidth = 6; x.beginPath(); x.moveTo(34, 30); x.lineTo(8, 56); x.stroke(); x.lineWidth = 3; x.beginPath(); x.moveTo(40, 34); x.lineTo(22, 58); x.moveTo(30, 26); x.lineTo(6, 42); x.stroke(); },
    scrib_sword: x => { x.lineWidth = 4; x.beginPath(); x.moveTo(14, 50); for (let k = 1; k <= 9; k++) x.lineTo(14 + k * 4.6 + (k % 2 ? 4 : -4), 50 - k * 4.6 + (k % 2 ? -4 : 4)); x.stroke(); x.lineWidth = 5; x.beginPath(); x.moveTo(8, 40); x.lineTo(24, 56); x.stroke(); x.fillRect(4, 54, 8, 6); },
    ironheart: x => { heartPath(x, 32, 34, 20); x.fill(); x.fillRect(14, 28, 36, 5); },
    will: x => { x.fillRect(29, 6, 6, 40); x.fillRect(18, 42, 28, 6); x.fillRect(28, 48, 8, 10); },
    windstep: x => { x.lineWidth = 5; for (let k = 0; k < 3; k++) { x.beginPath(); x.moveTo(8, 18 + k * 14); x.quadraticCurveTo(40, 10 + k * 14, 56, 22 + k * 14); x.stroke(); } },
    reflex: x => { x.lineWidth = 3; x.beginPath(); x.arc(32, 32, 24, 0, TAU); x.stroke(); x.beginPath(); x.moveTo(36, 12); x.lineTo(22, 34); x.lineTo(32, 34); x.lineTo(26, 52); x.lineTo(44, 28); x.lineTo(34, 28); x.closePath(); x.fill(); },
    bloodmark: x => { x.beginPath(); x.moveTo(32, 6); x.quadraticCurveTo(52, 34, 46, 46); x.quadraticCurveTo(32, 62, 18, 46); x.quadraticCurveTo(12, 34, 32, 6); x.fill(); },
    focuseye: x => { x.beginPath(); x.moveTo(4, 32); x.quadraticCurveTo(32, 6, 60, 32); x.quadraticCurveTo(32, 58, 4, 32); x.fill(); },
    gearwork: x => { x.beginPath(); x.arc(32, 32, 16, 0, TAU); x.fill(); for (let k = 0; k < 8; k++) { x.save(); x.translate(32, 32); x.rotate(k / 8 * TAU); x.fillRect(-4, -26, 8, 10); x.restore(); } },
    crest: x => { x.beginPath(); x.moveTo(32, 6); x.lineTo(54, 14); x.quadraticCurveTo(54, 44, 32, 58); x.quadraticCurveTo(10, 44, 10, 14); x.closePath(); x.fill(); },
  });
  for (const id of ['hammer', 'scythe', 'lance', 'sigil', 'mshield', 'comet', 'ironheart', 'will', 'windstep', 'reflex', 'bloodmark', 'focuseye', 'gearwork', 'crest'])
    ICON[id] = print2(64, 64, ICON_SHAPES[id], { plates: [{ col: COL.yellow, dx: 1.5, dy: 1.2 }, { col: COL.ink }], g: .04 }).toDataURL();
  ICON.scrib_sword = print2(64, 64, ICON_SHAPES.scrib_sword, { plates: [{ col: COL.pink, dx: 2, dy: 1.5 }, { col: COL.deep }], g: .04 }).toDataURL();
  ICON.scrib_sword_evo = print2(64, 64, (x, i) => { if (i === 0) { star(x, 32, 32, 14, 31, 20); x.fill(); return; } x.lineWidth = 6; x.beginPath(); x.moveTo(12, 52); x.lineTo(54, 10); x.stroke(); x.lineWidth = 5; x.beginPath(); x.moveTo(8, 40); x.lineTo(24, 56); x.stroke(); }, { plates: [{ col: COL.yellow }, { col: COL.white, dx: 0, dy: 0 }, { col: COL.pink, dx: 1.5, dy: 1 }], g: .02 }).toDataURL();
}

/* ---------- drawing ---------- */
function drawBossGear() {
  if (!G.weapons) return;
  const now = performance.now();
  wt(); ctx.lineCap = 'round';
  for (const w of G.weapons) {
    if (w.id === 'scythe') for (let i = 0; i < w.pos.length; i += 4) {
      const bx = w.pos[i], by = w.pos[i + 1], a = w.pos[i + 2];
      ctx.setLineDash([4, 6]); ctx.strokeStyle = COL.ink; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(P.x, P.y); ctx.lineTo(bx, by); ctx.stroke(); ctx.setLineDash([]);
      spr(SP.blade2, bx, by, 58, 58, a + Math.PI / 2); wt();
    }
    if (w.id === 'mshield') for (let i = 0; i < w.pos.length; i += 4) {
      const sx = w.pos[i], sy = w.pos[i + 1];
      ctx.fillStyle = COL.ink; ctx.beginPath(); ctx.arc(sx + 2, sy + 2, 15, 0, TAU); ctx.fill();
      ctx.fillStyle = COL.white; ctx.beginPath(); ctx.arc(sx, sy, 15, 0, TAU); ctx.fill();
      ctx.strokeStyle = COL.yellow; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(sx, sy, 11, -1, .6); ctx.stroke();
    }
    if (w.id === 'scrib_sword') {
      const sw = w.swing, sq = sw ? (performance.now() - sw.t0) / sw.dur : 9, a = sq < 1 ? lerp(sw.a0, sw.a1, sq) : (w.lastA ?? (P.face > 0 ? -.6 : Math.PI + .6)), b0x = P.x + Math.cos(a) * 12, b0y = P.y + Math.sin(a) * 12, L = w.evo ? 62 : 48;
      const b1x = b0x + Math.cos(a) * L, b1y = b0y + Math.sin(a) * L;
      if (w.evo) {
        const t = now / 1000, ca = Math.cos(a), sa = Math.sin(a), Lb = L + 10, pl = .6 + Math.sin(t * 5) * .25;
        glowLine(b0x, b0y, b0x + ca * Lb, b0y + sa * Lb, 26, GOLD, .22 * pl); wt();
        glowLine(b0x + ca * Lb, b0y + sa * Lb, b0x + ca * (Lb + 34 + pl * 16), b0y + sa * (Lb + 34 + pl * 16), 4, COL.white, .55 * pl); wt();
        holySword(b0x, b0y, a, Lb);
        for (let k = 0; k < 3; k++) { const f = (t * 1.3 + k / 3) % 1, al = Math.sin(f * Math.PI); flare(b0x + ca * Lb * (.25 + f * .7) + -sa * (k - 1) * 5, b0y + sa * Lb * (.25 + f * .7) + ca * (k - 1) * 5, 3 + al * 3, al); }
        if (Math.random() < .35) PT.push({ x: b0x + ca * Lb * rnd(.3, 1), y: b0y + sa * Lb * rnd(.3, 1), vx: rnd(-30, 30), vy: rnd(-90, -30), life: .5, max: .5, s: rnd(1.5, 3), c: Math.random() < .5 ? GOLD : COL.white, dead: false });
      }
      else scribLine(b0x, b0y, b1x, b1y, 6, 4);
      wt();
    }
  }
  // slashes
  if (G.slashes) {
    G.slashes = G.slashes.filter(s => now - s.t0 < 320);
    for (const s of G.slashes) {
      const q = (now - s.t0) / 320, a0 = s.a - s.arc / 2, a1 = s.a - s.arc / 2 + s.arc * Math.min(1, q * 3), lw = s.R * .38 * (1 - q);
      if (s.h) {
        holySwingFx(P.x, P.y, s.R * .82, a0, a1, q, s.fin, s.t0 % 997);
        wt();
      } else {
        for (let k = 0; k < 4; k++) {
          ctx.globalAlpha = (k === 3 ? .5 : .85) * (1 - q); ctx.strokeStyle = k === 3 ? COL.pink : s.col && k === 1 ? s.col : COL.deep; ctx.lineWidth = lw * (k === 0 ? 1 : .4);
          ctx.beginPath(); const r = s.R * (.6 + k * .1) + rnd(-4, 4);
          for (let j = 0; j <= 10; j++) { const aa = a0 + (a1 - a0) * j / 10, rr = r + rnd(-6, 6); j ? ctx.lineTo(P.x + Math.cos(aa) * rr + (k === 3 ? 3 : 0), P.y + Math.sin(aa) * rr) : ctx.moveTo(P.x + Math.cos(aa) * rr, P.y + Math.sin(aa) * rr); }
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
  }
  // projectiles of this gear
  for (const p of PR) {
    if (p.dead || !onScreen(p.x, p.y, 60)) continue;
    if (p.kind === 'lance') { const ca = Math.cos(p.a), sa = Math.sin(p.a); strokeRiso(4, () => { ctx.beginPath(); ctx.moveTo(p.x - ca * 46, p.y - sa * 46); ctx.lineTo(p.x, p.y); }, COL.ink, COL.pink); ctx.fillStyle = COL.yellow; ctx.beginPath(); ctx.moveTo(p.x + ca * 12, p.y + sa * 12); ctx.lineTo(p.x - sa * 6, p.y + ca * 6); ctx.lineTo(p.x + sa * 6, p.y - ca * 6); ctx.fill(); }
    else if (p.kind === 'comet') { glowLine(p.x - p.vx * .08, p.y - p.vy * .08, p.x, p.y, 16, COL.pink, .5); ctx.fillStyle = COL.yellow; ctx.beginPath(); ctx.arc(p.x, p.y, 10, 0, TAU); ctx.fill(); ctx.fillStyle = COL.white; ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, TAU); ctx.fill(); }
    else if (p.kind === 'crescent') {
      const al = Math.min(1, p.life * 2.5), ca = Math.cos(p.a), sa = Math.sin(p.a);
      for (let k = 1; k <= 3; k++) { wt(); ctx.globalAlpha = al * (.5 - k * .12); ctx.strokeStyle = k % 2 ? COL.white : GOLD; ctx.lineWidth = 2; ctx.beginPath(); const off = (k - 2) * 14; ctx.moveTo(p.x - sa * off - ca * 10, p.y + ca * off - sa * 10); ctx.lineTo(p.x - sa * off - ca * (40 + k * 18), p.y + ca * off - sa * (40 + k * 18)); ctx.stroke(); }
      ctx.globalAlpha = 1;
      glowLine(p.x - ca * 120, p.y - sa * 120, p.x, p.y, 14, GOLD, .3 * al); wt();
      for (let k = 1; k <= 4; k++) { const bx = p.x - ca * k * 26, by = p.y - sa * k * 26; flare(bx, by, (5 - k) * 1.6 + Math.sin(p.t * 40 + k) * 1.2, al * (1 - k * .2)); }
      holyStreak(p.x, p.y, p.a + Math.PI / 2, 104, 12, al);
      holyStreak(p.x + ca * 4, p.y + sa * 4, p.a, 40, 6, al * .9);
      starburst(p.x, p.y, 16 + Math.sin(p.t * 30) * 3, al, p.t * 3); wt();
    }
  }
  // sigils
  for (const z of ZN) if (z.kind === 'sigil') {
    const a = z.t * 2;
    ctx.globalAlpha = .9; ctx.strokeStyle = COL.yellow; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(z.x, z.y, z.r, 0, TAU); ctx.stroke();
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 2; ctx.beginPath();
    for (let k = 0; k <= 5; k++) { const aa = a + k * TAU * 2 / 5, px = z.x + Math.cos(aa) * z.r * .8, py = z.y + Math.sin(aa) * z.r * .8; k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
    ctx.stroke(); ctx.globalAlpha = 1;
  }
  if (G.heavenRays > 0) drawSunRays(P.x, P.y - 10, G.heavenRays, 40);
  wt();
  drawEndWorld();
}
function drawLimb(e) {
  const fade = Math.max(0, Math.min(1, e.life / .4, (e.maxLife - e.life) / .12)), top = -RH - 330, now = performance.now() / 1000;
  const pts = [];
  for (let i = 0; i <= 10; i++) { const f = i / 10; pts.push(e.x + Math.sin(now * 3 + f * 5 + e.ph) * 26 * f * (1 - f) * 2, lerp(top, e.y, f * fade + (1 - fade) * 0)); }
  wt(); ctx.globalAlpha = fade;
  drawTentacle(pts.slice(0), 58);
  ctx.globalAlpha = fade;
  ctx.fillStyle = e.flash > 0 ? COL.white : COL.deep; ctx.beginPath();
  for (let k = 0; k <= 14; k++) { const a = k / 14 * TAU, r = e.r * (1 + rnd(-.12, .12)); k ? ctx.lineTo(e.x + Math.cos(a) * r, e.y + Math.sin(a) * r) : ctx.moveTo(e.x + Math.cos(a) * r, e.y + Math.sin(a) * r); }
  ctx.fill();
  ctx.strokeStyle = COL.pink; ctx.lineWidth = 3; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.arc(e.x, e.y, e.r + 12, now * 3, now * 3 + TAU); ctx.stroke(); ctx.setLineDash([]);
  ctx.globalAlpha = 1;
}
function drawScribText(text, y, size, color = COL.paper) {
  ctx.font = '400 ' + size.toFixed(0) + 'px "Gasoek One", "Dela Gothic One", "ZCOOL QingKe HuangYou", "Arial Black", sans-serif'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  const full = ctx.measureText(text).width; let x = W / 2 - full / 2;
  for (const ch of text) {
    const w = ctx.measureText(ch).width, jx = rnd(-2.2, 2.2), jy = rnd(-2.2, 2.2);
    ctx.fillStyle = COL.pink; ctx.fillText(ch, x + 3 + jx, y + 2 + jy);
    ctx.fillStyle = color; ctx.fillText(ch, x + jx * .4, y + jy * .4);
    x += w;
  }
  ctx.lineCap = 'round';
  for (let k = 0; k < 4; k++) {
    let px = W / 2 - full / 2 + rnd(0, full), py = y + rnd(-size * .4, size * .4), h = rnd(TAU);
    ctx.strokeStyle = k % 2 ? 'rgba(255,79,158,.55)' : 'rgba(20,27,64,.7)'; ctx.lineWidth = rnd(1.5, 3); ctx.beginPath(); ctx.moveTo(px, py);
    for (let s = 0; s < 6; s++) { h += rnd(-1.5, 1.5); px += Math.cos(h) * 12; py += Math.sin(h) * 8; ctx.lineTo(px, py); }
    ctx.stroke();
  }
}
function drawSubs() {
  const c = G && G.cut;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  if (STATE === 'cut' && c && c.subs) {
    const cur = c.subs.find(s => c.t >= s[0] && c.t <= s[1]);
    if (cur) {
      const a = Math.max(0, Math.min(1, (c.t - cur[0]) / .25, (cur[1] - c.t) / .25));
      ctx.globalAlpha = .6 * a; ctx.fillStyle = '#06060c'; ctx.fillRect(0, H * .36, W, H * .14);
      ctx.globalAlpha = a;
      drawScribText(cur[2], H * .43, Math.min(34, (W - 32) / (cur[2].length * .62)));
      ctx.globalAlpha = 1;
    }
  }
  if (G && G.cutWhite > 0) { ctx.globalAlpha = G.cutWhite; ctx.fillStyle = COL.paper; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  drawEndPaper();
}

/* ---------- act seven: the sword and the last arena ---------- */
function updateAct7(rdt) {
  const c = G.cut, e = G.boss, u = G.u;
  c.t += rdt; const t = c.t, prevT = t - rdt, hit = tm => prevT < tm && t >= tm;
  e.t += rdt; uTick(e, rdt);
  const w = G.weapons.find(x => x.id === 'scrib_sword');
  if (!c.subs) c.subs = [[.6, 2.7, 'YOU KEEP DRAWING ME.'], [2.9, 5, 'EVERY LINE YOU FEARED, I KEPT.'], [5.2, 7.3, 'SO WHY WILL YOUR LIGHT NOT GO OUT?']];
  let fx = (P.x + e.x) / 2, fy = (P.y + e.y) / 2, z = .8;
  if (hit(.6) || hit(2.9) || hit(5.2)) { SFX.whisper(); SFX.scratch(); pulseScreen(.8); shake(5); }
  if (t > 7.3) { fx = P.x; fy = P.y; z = 1.35; }
  if (t > 7.4 && t < 8.6) {
    for (let k = 0; k < 5; k++) { const a = rnd(TAU); PT.push({ x: P.x + rnd(-14, 14), y: P.y - 16 + rnd(-14, 14), vx: Math.cos(a) * rnd(80, 280), vy: Math.sin(a) * rnd(80, 280), life: .7, max: .7, s: rnd(2, 5), c: k % 3 ? COL.deep : COL.pink, dead: false }); }
    if (hit(7.5)) { SFX.scratch(); SFX.charge(1.1); }
    G.shake = Math.max(G.shake, 3);
  }
  if (hit(8.6)) {
    P.heavenly = true; if (w) { w.evo = true; G.buildDirty = true; }
    G.flash = .9; pulseScreen(2.2); shake(22); SFX.heaven(); SFX.boom(true);
    $('cutEye').textContent = '천상의 검'; $('cutLine').textContent = '낙서가 풀리고, 빛만 남았다.';
    ringFx(P.x, P.y, 280, COL.yellow, .7, 14); ringFx(P.x, P.y, 170, COL.white, .5, 8);
    for (let k = 0; k < 50; k++) { const a = rnd(TAU), sp = rnd(150, 520); PT.push({ x: P.x, y: P.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: rnd(.5, 1.1), max: 1.1, s: rnd(3, 6), c: k % 3 ? COL.yellow : COL.white, dead: false }); }
  }
  G.heavenRays = t > 8.4 && t < 10.6 ? clamp((t - 8.4) / 1, 0, 1) * (t > 9.8 ? Math.max(0, 1 - (t - 9.8) / .8) : 1) : 0;
  if (hit(10.4)) {
    u.stage = 'final'; u.circle = false; u.corr = false; u.segs = []; u.rect = true; u.broken = false; u.scarred = false;
    P.x = clamp(P.x, -RW + 40, RW - 40); P.y = clamp(P.y, -RH + 40, RH - 40);
    uGrowTents(e, 14);
    SFX.rumble(); SFX.roar(); pulseScreen(1.6); shake(20);
    $('cutEye').textContent = '7막 / 7 · 마지막'; $('cutLine').textContent = '하늘 끝까지 베어라.';
  }
  if (t > 10.4) { e.y = lerp(e.y, -RH - 470, 1 - Math.exp(-rdt * 1.6)); e.x = lerp(e.x, P.x * .5, 1 - Math.exp(-rdt * 1.6)); e.drawScale = lerp(e.drawScale || 1, 2.3, 1 - Math.exp(-rdt * 1.6)); fx = P.x; fy = lerp(e.y, P.y, .6); z = .62; }
  G.camX = lerp(G.camX, fx, 1 - Math.exp(-rdt * 4)); G.camY = lerp(G.camY, fy, 1 - Math.exp(-rdt * 4));
  G.camZoom = lerp(G.camZoom || 1, z, 1 - Math.exp(-rdt * 3));
  updateFx(rdt); updateRings(rdt); sweep(PT); sweep(RG); sweep(DC);
  if (G.flash > 0) G.flash -= rdt * 1.2;
  G.shake *= Math.exp(-rdt * 5);
  if (t > c.dur) { c.subs = null; G.heavenRays = 0; endCut(); }
}
function spawnLimb(e, x) {
  const y = clamp(P.y + rnd(-40, 40), -RH + 50, RH - 50);
  E.push({ type: 'limb', ai: 'limb', limbOf: e, fixed: true, x, y, r: 46, hp: 1e9, maxHp: 1e9, dmg: 16, xp: 0, kbRes: 1, kx: 0, ky: 0, t: 0, ph: rnd(TAU), flash: 0, hit: {}, life: 4.4, maxLife: 4.4, face: 1, scl: 1, dead: false });
  burst(x, y, 20, COL.deep, 300); splat(x, y, 110, false); shake(10); pulseScreen(.8); SFX.boom(true);
}
function uFinal(e, dt) {
  finalExtras(e, dt);
  e.drawScale = lerp(e.drawScale || 1, 2.3, 1 - Math.exp(-dt * 2));
  e.x = lerp(e.x, P.x * .5, 1 - Math.exp(-dt * .8)); e.y = lerp(e.y, -RH - 470, 1 - Math.exp(-dt * 2));
  if (e.hp <= e.hpFloor + .5 && G.uPhaseT >= U_MIN[7]) { startFinisher(e); return Z0; }
  const lvl = G.uPhaseT > 160 ? 2 : G.uPhaseT > 80 ? 1 : 0;
  RW = lerp(RW, 620 - lvl * 95, 1 - Math.exp(-dt * .9));
  if (lvl > (e.esc || 0)) { e.esc = lvl; banner(lvl === 1 ? '하늘이 무너진다' : '마지막 빛', lvl === 1 ? '벽이 좁혀 온다' : '버텨라. 거의 다 왔다', 'warn'); SFX.roar(); pulseScreen(1.6); shake(14); AU.uPhase = 7 + lvl; }
  if (e.busy <= 0 && e.cd <= 0) {
    const judging = HZ.some(h => h.gold && !h.dead);
    const k = pickAtk(e, { meteor: 2.6, slam: 3.4, sweep: 1.8, scrawl: 1.1, gaze: 2.2, grab: lvl >= 1 ? 2 : 1, shards: 2.4, judgment: lvl >= 1 && !judging ? 1.7 : 0, clones: lvl >= 1 ? 1.4 : .6 });
    if (k === 'meteor') {
      for (let i = 0; i < 7 + lvl * 2; i++) {
        const near = i < 2, x = near ? clamp(P.x + rnd(-90, 90), -RW + 50, RW - 50) : clamp(P.x + rnd(-420, 420), -RW + 50, RW - 50), y = near ? clamp(P.y + rnd(-60, 60), -RH + 40, RH - 40) : rnd(-RH + 40, RH - 40);
        TG.push({ x, y, r: 72, t: -i * .13, dur: 1.15, kind: 'emeteor', dead: false, cb: () => { ringFx(x, y, 80, COL.ink, .35, 7); burst(x, y, 14, COL.deep, 260); splat(x, y, 100, false); if (STATE === 'play' && d2(P.x, P.y, x, y) < (72 + P.r * .5) ** 2) hurtPlayer(26); if (gate('fm', 80)) SFX.boom(true); shake(6); } });
      }
      e.busy = 1.6 - lvl * .2; e.cd = .5 - lvl * .12;
    } else if (k === 'slam') {
      const n = (Math.random() < .5 ? 2 : 1) + (lvl >= 2 ? 1 : 0);
      for (let i = 0; i < n; i++) {
        const x = clamp(P.x + (i ? rnd(160, 260) * (Math.random() < .5 ? -1 : 1) : rnd(-60, 60)), -RW + 70, RW - 70);
        later(e, i * .55, () => { HZ.push({ k: 'line', x1: x, y1: -RH - 300, x2: x, y2: RH + 30, w: 74, warn: .85, dur: .25, dmg: 30, t: 0, dead: false, scrib: 1 }); SFX.swish(); later(e, .87, () => spawnLimb(e, x)); });
      }
      e.busy = 1.2 + n * .45 - lvl * .15; e.cd = .5 - lvl * .12;
    } else if (k === 'sweep') {
      HZ.push({ k: 'band', nx: 0, ny: 1, d: -RH - 30, vd: 240, w: 50, gap: -clamp(P.x + rnd(-220, 220), -RW + 110, RW - 110), gw: 160, dmg: 24, warn: .8, t: 0, dead: false });
      if (lvl >= 1) later(e, 1.1, () => HZ.push({ k: 'band', nx: 0, ny: 1, d: -RH - 30, vd: 260, w: 50, gap: -clamp(P.x + rnd(-200, 200), -RW + 110, RW - 110), gw: 150, dmg: 24, warn: .7, t: 0, dead: false }));
      SFX.wave(); e.busy = 2.2 + lvl * .6; e.cd = .5 - lvl * .12;
    } else if (k === 'shards') { shardRain(e, 4 + lvl * 2); banner('하늘 조각', '베어서 눈으로 되돌려라', 'good'); e.busy = 1.8 + lvl * .7; e.cd = .5;
    } else if (k === 'judgment') { judgment(e, lvl); e.busy = 3.4; e.cd = .5;
    } else if (k === 'clones') {
      for (let i = 0; i < 3 + lvl; i++) { const sd = i % 2 ? 1 : -1; spawnArenaAdd('scribbler', sd * (RW - 30), rnd(-RH + 40, RH - 40), 520); }
      SFX.scratch(); e.busy = 1.2; e.cd = .5;
    } else if (k === 'gaze') {
      HZ.push({ k: 'ray', x: G.eye ? G.eye.x : P.x, y: -RH - 150, a: Math.PI / 2, va: 0, len: RH * 2 + 200, w: 54, warn: 1.1, dur: 2.4 + lvl * .4, dmg: 26, t: 0, dead: false, gaze: 1 });
      banner('응시', '눈을 피해 옆으로', 'warn'); e.busy = 3.6 + lvl * .4; e.cd = .4;
    } else if (k === 'grab') {
      const sd = Math.random() < .5 ? 1 : -1, gy = clamp(P.y + rnd(-80, 80), -RH + 70, RH - 70);
      HZ.push({ k: 'band', nx: sd, ny: 0, d: -RW - 30, vd: 300 + lvl * 30, w: 54, gap: sd === 1 ? gy : -gy, gw: 120, dmg: 24, warn: .8, t: 0, dead: false });
      SFX.wave(); e.busy = 2.6; e.cd = .5;
    } else {
      for (let s = 0; s < 3; s++) { const sx = clamp(P.x + (s - 1) * 260, -RW, RW); for (let i = 0; i < 9; i++) later(e, i * .09, () => fireEB(sx, -RH - 30, Math.PI / 2 + rnd(-.25, .25), 170, 11, false, { wig: 2.2, life: 4 })); }
      SFX.scratch(); e.busy = 1.4; e.cd = .5;
    }
  }
  return Z0;
}

/* ---------- credits ---------- */
function creditsHTML() {
  const bosses = [...Object.values(BOSS).map(b => b.name), ...GATES.map(g => g.name)];
  const chars = Object.values(CHARS).map(c => c.name);
  const sec = (eye, body) => '<div class="cr-sec"><span class="eyebrow">' + esc(eye) + '</span>' + body + '</div>';
  return '<p class="cr-line">하늘은 다시 맑아지지 않았다.<br>그래도 밤은 끝났다.</p>' +
    sec('기획', '<b>Luff1004</b>') +
    sec('만든 것', '<b>Claude</b>') +
    sec('잉크', '<p>남색, 분홍, 노랑, 그리고 종이 한 장</p>') +
    sec('소리', '<p>종, 사이렌, 낙서 긁는 소리</p>') +
    sec('쓰러뜨린 것들', bosses.map(n => '<p>' + esc(n) + '</p>').join('')) +
    sec('함께 버틴 불씨들', '<p>' + chars.map(esc).join(' · ') + '</p>') +
    '<p class="cr-line">그리고 이름 없는 것.<br>이제는 이름이 생겼다.</p>' +
    '<div class="cr-end">끝</div>' +
    '<p class="cr-line">끝까지 꺼지지 않아서 고맙다.</p>';
}
function startCredits() {
  let shot = null; try { shot = cv.toDataURL('image/jpeg', .9); } catch (err) {}
  STATE = 'credits'; G.cutWhite = 0; G.cutBlack = 0; G.boss = null; G.end = null;
  const cs = $('cutscene'); cs.hidden = true; cs.className = '';
  $('hud').hidden = true;
  const roll = $('creditRoll'); roll.innerHTML = creditsHTML();
  const old = $('credits').querySelector('.cr-ink'); if (old) old.remove();
  if (shot) { const im = document.createElement('img'); im.className = 'cr-ink'; im.alt = ''; im.src = shot; $('credits').prepend(im); }
  const cr = $('credits'); cr.hidden = false; cr.className = ''; void cr.offsetWidth; cr.className = 'on';
  AU.track = 'credits'; G.creditT0 = performance.now();
  roll.addEventListener('animationend', finishCredits, { once: true });
}
function finishCredits() {
  if (STATE !== 'credits') return;
  $('credits').hidden = true; $('credits').className = '';
  endRun(true);
}
$('credits').addEventListener('pointerdown', () => { if (STATE === 'credits' && performance.now() - G.creditT0 > 2500) finishCredits(); });

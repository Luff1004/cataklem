/* ================= more gear past the portals: each one is earned by closing a door ================= */
Object.assign(WEAPONS, {
  bellecho: {
    boss: true, unlock: 'bell', name: '종의 메아리', max: 5, info: '구르기가 끝나는 자리에서 종이 울려 주위를 친다. 가만히 있어도 가끔 운다.',
    ups: ['', '울림 피해 +40%', '범위 +25%', '저절로 우는 간격 -30%', '울림이 두 번 퍼진다'],
    stat(L) { return { dmg: L >= 2 ? 110 : 80, r: L >= 3 ? 170 : 135, cd: L >= 4 ? 1.8 : 2.6, twice: L >= 5 }; },
    tick(w, S, dt) {
      const dashing = P.dashT > 0;
      if (w.was && !dashing) bellRing(S, 1);
      w.was = dashing;
      w.t2 = (w.t2 ?? S.cd) - dt;
      if (w.t2 <= 0 && nearest(1, S.r + 40).length) { w.t2 = S.cd * P.cdMul; bellRing(S, .45); }
    },
  },
  thread: {
    boss: true, unlock: 'loom', name: '엮는 실', max: 5, info: '가장 가까운 적에게 실을 건다. 멀어질수록 실이 팽팽해져 더 아프다.',
    ups: ['', '피해 +40%', '실 +1', '팽팽할 때 피해 두 배', '실 +1'],
    stat(L) { return { n: L >= 5 ? 3 : L >= 3 ? 2 : 1, dps: L >= 2 ? 46 : 32, taut: L >= 4 ? 2 : 1 }; },
    tick(w, S, dt) {
      w.tg = (w.tg || []).filter(t => t && !t.dead && !t.hidden && !t.under && Math.hypot(t.x - P.x, t.y - P.y) < 560);
      if (w.tg.length < S.n) { for (const t of nearest(S.n, 420)) if (!w.tg.includes(t) && w.tg.length < S.n) w.tg.push(t); }
      w.tk = (w.tk || 0) - dt;
      if (w.tk <= 0) {
        w.tk = .2;
        for (const t of w.tg) { const d = Math.hypot(t.x - P.x, t.y - P.y), k = 1 + (d / 220) * S.taut; hurtEnemy(t, S.dps * .2 * k, 0, 0, true); if (k > 2 && Math.random() < .3) burst(t.x, t.y, 2, COL.pink, 90); }
      }
    },
  },
  twinblade: {
    boss: true, unlock: 'twins', name: '거울 쌍검', max: 5, info: '앞을 베면 거울 속 칼이 뒤를 벤다.',
    ups: ['', '피해 +35%', '거리 +20%', '재사용 -25%', '거울 칼이 두 번 벤다'],
    stat(L) { return { cd: L >= 4 ? .6 : .8, dmg: L >= 2 ? 62 : 46, R: L >= 3 ? 150 : 125, arc: 1.9, dbl: L >= 5 }; },
    fire(w, S) {
      const t = nearest(1, S.R * Math.sqrt(P.area) + 60)[0]; if (!t) return false;
      const a = Math.atan2(t.y - P.y, t.x - P.x), R = S.R * Math.sqrt(P.area);
      arcHit(a, R, S.arc, S.dmg, '#7CC6D8');
      later2(.12, () => arcHit(a + Math.PI, R, S.arc, S.dmg, COL.pink));
      if (S.dbl) later2(.24, () => arcHit(a + Math.PI, R, S.arc, S.dmg * .7, COL.pink));
      SFX.slash(false); return true;
    },
  },
  harpoon: {
    boss: true, unlock: 'tide', name: '물때 작살', max: 5, info: '작살을 던졌다가 끌어당긴다. 갈 때와 올 때 두 번 꿰뚫는다.',
    ups: ['', '피해 +40%', '작살 +1', '더 멀리 날아간다', '돌아올 때 적을 끌고 온다'],
    stat(L) { return { cd: 1.5, n: L >= 3 ? 2 : 1, dmg: L >= 2 ? 84 : 60, range: L >= 4 ? 520 : 400, drag: L >= 5 }; },
    tick(w, S, dt) {
      w.hs = w.hs || [];
      w.t -= dt;
      if (w.t <= 0 && !w.hs.length) {
        const ts = nearest(S.n, S.range); if (ts.length) {
          w.t = S.cd * P.cdMul;
          for (let i = 0; i < S.n; i++) { const t = ts[i % ts.length], a = Math.atan2(t.y - P.y, t.x - P.x) + (i ? .25 : 0); w.hs.push({ x: P.x, y: P.y, a, d: 0, out: true, hit: new Set() }); }
          SFX.swish();
        } else w.t = .2;
      }
      for (const h of w.hs) {
        h.d += (h.out ? 900 : -1100) * dt;
        if (h.out && h.d >= S.range) { h.out = false; h.hit = new Set(); if (gate('harp', 400)) tone(880, .05, { type: 'triangle', vol: .025 }); }
        h.x = P.x + Math.cos(h.a) * h.d; h.y = P.y + Math.sin(h.a) * h.d;
        gq(h.x, h.y, 90, e => {
          if (e.dead || e.hidden || e.under || h.hit.has(e) || d2(h.x, h.y, e.x, e.y) > (16 + e.r) ** 2) return;
          h.hit.add(e); hurtEnemy(e, S.dmg, Math.cos(h.a) * (h.out ? 200 : -260) * (S.drag && !h.out && !e.boss ? 2.5 : 1), Math.sin(h.a) * (h.out ? 200 : -260) * (S.drag && !h.out && !e.boss ? 2.5 : 1));
          burst(h.x, h.y, 4, '#7CC6D8', 120);
        });
        if (!h.out && h.d <= 0) h.done = true;
      }
      w.hs = w.hs.filter(h => !h.done);
    },
  },
  sundial: {
    boss: true, unlock: 'sun', name: '해시계', max: 5, info: '그림자가 한 바퀴 돌면 하늘에서 빛기둥이 떨어진다.',
    ups: ['', '빛기둥 피해 +40%', '한 바퀴가 빨라진다', '빛기둥 +1', '빛기둥이 더 넓다'],
    stat(L) { return { cd: L >= 3 ? 4.6 : 6, n: L >= 4 ? 2 : 1, dmg: L >= 2 ? 520 : 380, r: L >= 5 ? 120 : 92 }; },
    tick(w, S, dt) {
      w.c = (w.c || 0) + dt / (S.cd * P.cdMul);
      if (w.c >= 1) {
        const ts = nearest(S.n, 800);
        if (!ts.length) { w.c = 1; return; }
        w.c = 0;
        ts.forEach((t, i) => later2(i * .2, () => {
          const x = t.x, y = t.y;
          (G.pillars = G.pillars || []).push({ x, y, t0: performance.now() });
          aoe(x, y, S.r * P.area, S.dmg, 260); ringFx(x, y, S.r * P.area, COL.yellow, .4, 8); burst(x, y, 18, COL.yellow, 280);
          shake(7); if (gate('sund', 300)) SFX.boom(false);
        }));
      }
    },
  },
  gavel: {
    boss: true, unlock: 'judge', name: '판결봉', max: 5, info: '같은 적을 거듭 치면 네 번째에 판결이 떨어진다.',
    ups: ['', '피해 +35%', '판결 피해 +50%', '재사용 -20%', '판결이 세 번째에 떨어진다'],
    stat(L) { return { cd: L >= 4 ? .48 : .6, dmg: L >= 2 ? 50 : 37, verdict: L >= 3 ? 6 : 4, need: L >= 5 ? 3 : 4 }; },
    fire(w, S) {
      const t = nearest(1, 150)[0]; if (!t) return false;
      if (w.tgt !== t) { w.tgt = t; w.stk = 0; }
      w.stk++;
      const v = w.stk >= S.need;
      hurtEnemy(t, S.dmg * (v ? S.verdict : 1), (t.x - P.x) * 2, (t.y - P.y) * 2);
      if (v) {
        w.stk = 0; G.hitstop = Math.max(G.hitstop, .07); shake(9); if (gate('gav', 300)) { SFX.thud(); tone(330, .12, { type: 'triangle', vol: .05 }); }
        ringFx(t.x, t.y, 90, COL.yellow, .35, 9); burst(t.x, t.y, 20, COL.yellow, 260);
        TX.push({ x: t.x, y: t.y - t.r - 18, vy: -30, life: .9, max: .9, v: '판결', crit: true, dead: false });
      } else burst(t.x, t.y, 6, COL.ink, 150);
      G.gavelFx = { x: t.x, y: t.y, t0: performance.now(), big: v };
      return true;
    },
  },
});
Object.assign(PASSIVES, {
  afterimage: { boss: true, unlock: 'sky', name: '그림자 걸음', max: 5, info: '구르고 난 뒤 1.2초 동안 피해 +15%' },
  thornmail: { boss: true, unlock: 'root', name: '가시 갑옷', max: 5, info: '맞으면 주위를 찌른다. 피해 45' },
  lastlight: { boss: true, unlock: 'unknown', name: '마지막 불꽃', max: 5, info: '체력이 35% 아래면 피해 +12%' },
});
const gearOpen = id => { const D = WEAPONS[id] || PASSIVES[id], u = D && D.unlock; return !u || (typeof LOCAL !== 'undefined' && LOCAL) || (SAVE.bossKills[u] || 0) > 0; };
const gearLv = id => { const p = G.passives.find(q => q.id === id); return p ? p.lv : 0; };
function gearDmg() {
  if (!G || G.mode !== 'boss') return 1;
  let m = 1;
  const a = gearLv('afterimage'); if (a && G.afterT > 0) m *= 1 + .15 * a;
  const l = gearLv('lastlight'); if (l && P.hp < P.maxHp * .35) m *= 1 + .12 * l;
  return m;
}
function gearHurt() {
  const th = gearLv('thornmail'); if (!th || G.mode !== 'boss') return;
  aoe(P.x, P.y, 135, 45 * th, 320, true); ringFx(P.x, P.y, 135, COL.pink, .3, 6); burst(P.x, P.y, 10, COL.pink, 200);
}
function bellRing(S, k) {
  const r = S.r * P.area * (k < 1 ? .7 : 1);
  aoe(P.x, P.y, r, S.dmg * k, 300); ringFx(P.x, P.y, r, COL.yellow, .35, 9); ringFx(P.x, P.y, r * .6, COL.ink, .3, 5);
  if (k >= 1 && gate('bellr', 600)) SFX.bellSmall();
  if (S.twice && k >= 1) later2(.22, () => { aoe(P.x, P.y, r * 1.3, S.dmg * .6, 200); ringFx(P.x, P.y, r * 1.3, COL.pink, .35, 6); });
}
function arcHit(a, R, arc, dmg, col) {
  for (const e of E) {
    if (e.dead || e.hidden || e.under) continue;
    const dx = e.x - P.x, dy = e.y - P.y, d = Math.hypot(dx, dy) || 1;
    if (d - e.r > R || angDiff(Math.atan2(dy, dx), a) > arc / 2 + Math.asin(Math.min(1, e.r / d))) continue;
    hurtEnemy(e, dmg, dx / d * 240, dy / d * 240);
  }
  (G.slashes = G.slashes || []).push({ a, R, arc, t0: performance.now(), h: false, side: 1, col });
}
/* things the new gear leaves on screen */
function drawBossGear2() {
  if (!G.weapons || G.mode !== 'boss') return;
  const now = performance.now();
  wt();
  for (const w of G.weapons) {
    if (w.id === 'thread' && w.tg) for (const t of w.tg) {
      const d = Math.hypot(t.x - P.x, t.y - P.y), k = clamp(d / 440, 0, 1), sag = (1 - k) * 40;
      ctx.strokeStyle = k > .5 ? COL.pink : COL.ink; ctx.lineWidth = 1.6 + k * 2; ctx.globalAlpha = .85;
      ctx.beginPath(); ctx.moveTo(P.x, P.y); ctx.quadraticCurveTo((P.x + t.x) / 2, (P.y + t.y) / 2 + sag + Math.sin(now / 90) * 3 * (1 - k), t.x, t.y); ctx.stroke(); ctx.globalAlpha = 1;
    }
    if (w.id === 'harpoon' && w.hs) for (const h of w.hs) {
      ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.5; ctx.setLineDash([4, 5]); ctx.beginPath(); ctx.moveTo(P.x, P.y); ctx.lineTo(h.x, h.y); ctx.stroke(); ctx.setLineDash([]);
      const ca = Math.cos(h.a), sa = Math.sin(h.a);
      ctx.fillStyle = '#7CC6D8'; ctx.strokeStyle = COL.ink; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(h.x + ca * 16, h.y + sa * 16); ctx.lineTo(h.x - sa * 7 - ca * 4, h.y + ca * 7 - sa * 4); ctx.lineTo(h.x + sa * 7 - ca * 4, h.y - ca * 7 - sa * 4); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    if (w.id === 'sundial') {
      const c = clamp(w.c || 0, 0, 1);
      ctx.globalAlpha = .7; ctx.strokeStyle = COL.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(P.x, P.y, 30, 0, TAU); ctx.stroke();
      ctx.strokeStyle = COL.yellow; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.arc(P.x, P.y, 30, -Math.PI / 2, -Math.PI / 2 + c * TAU); ctx.stroke();
      const a = -Math.PI / 2 + c * TAU; ctx.strokeStyle = COL.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(P.x, P.y); ctx.lineTo(P.x + Math.cos(a) * 30, P.y + Math.sin(a) * 30); ctx.stroke(); ctx.globalAlpha = 1;
    }
  }
  const gf = G.gavelFx;
  if (gf) {
    const q = (now - gf.t0) / 260;
    if (q < 1) { const s = gf.big ? 46 : 26; ctx.globalAlpha = 1 - q; ctx.save(); ctx.translate(gf.x, gf.y - 30 * (1 - q)); ctx.rotate(-.6 + q * .6); ctx.fillStyle = gf.big ? COL.yellow : '#B9894F'; ctx.strokeStyle = COL.ink; ctx.lineWidth = 2.5; ctx.fillRect(-s * .5, -s * .25, s, s * .5); ctx.strokeRect(-s * .5, -s * .25, s, s * .5); ctx.fillRect(-3, 0, 6, s * .8); ctx.restore(); ctx.globalAlpha = 1; }
    else G.gavelFx = null;
  }
}
function buildBossGear2Art() {
  Object.assign(ICON_SHAPES, {
    bellecho: x => { x.beginPath(); x.moveTo(32, 8); x.quadraticCurveTo(48, 12, 48, 40); x.lineTo(52, 46); x.lineTo(12, 46); x.lineTo(16, 40); x.quadraticCurveTo(16, 12, 32, 8); x.fill(); x.beginPath(); x.arc(32, 52, 5, 0, TAU); x.fill(); x.lineWidth = 3; x.beginPath(); x.arc(32, 30, 28, -.5, .5); x.stroke(); x.beginPath(); x.arc(32, 30, 28, Math.PI - .5, Math.PI + .5); x.stroke(); },
    thread: x => { x.beginPath(); x.ellipse(20, 40, 12, 16, -.4, 0, TAU); x.fill(); x.lineWidth = 3; x.beginPath(); x.moveTo(26, 30); x.quadraticCurveTo(44, 36, 56, 10); x.stroke(); x.beginPath(); x.arc(56, 10, 4, 0, TAU); x.fill(); },
    twinblade: x => { for (const sd of [-1, 1]) { x.save(); x.translate(32, 32); x.rotate(sd * .6); x.beginPath(); x.moveTo(0, -28); x.lineTo(5, 8); x.lineTo(-5, 8); x.closePath(); x.fill(); x.fillRect(-9, 8, 18, 4); x.fillRect(-3, 12, 6, 12); x.restore(); } },
    harpoon: x => { x.lineWidth = 4; x.beginPath(); x.moveTo(8, 56); x.lineTo(46, 18); x.stroke(); x.beginPath(); x.moveTo(58, 6); x.lineTo(38, 14); x.lineTo(44, 20); x.lineTo(50, 26); x.closePath(); x.fill(); x.lineWidth = 3; x.beginPath(); x.moveTo(40, 24); x.lineTo(34, 22); x.stroke(); },
    sundial: x => { x.lineWidth = 3; x.beginPath(); x.arc(32, 34, 24, 0, TAU); x.stroke(); x.beginPath(); x.moveTo(32, 34); x.lineTo(32, 6); x.lineTo(46, 34); x.closePath(); x.fill(); for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; x.fillRect(32 + Math.cos(a) * 20 - 1.5, 34 + Math.sin(a) * 20 - 1.5, 3, 3); } },
    gavel: x => { x.save(); x.translate(32, 32); x.rotate(-.7); x.beginPath(); x.roundRect(-16, -18, 32, 16, 3); x.fill(); x.fillRect(-3, -2, 6, 30); x.restore(); x.fillRect(10, 52, 30, 6); },
    afterimage: x => { for (let k = 0; k < 3; k++) { x.globalAlpha = .4 + k * .3; x.beginPath(); x.arc(18 + k * 12, 32, 10, 0, TAU); x.fill(); } x.globalAlpha = 1; },
    thornmail: x => { x.beginPath(); x.moveTo(32, 10); x.lineTo(52, 18); x.quadraticCurveTo(52, 44, 32, 56); x.quadraticCurveTo(12, 44, 12, 18); x.closePath(); x.fill(); x.lineWidth = 3; for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; x.beginPath(); x.moveTo(32 + Math.cos(a) * 20, 33 + Math.sin(a) * 22); x.lineTo(32 + Math.cos(a) * 30, 33 + Math.sin(a) * 32); x.stroke(); } },
    lastlight: x => { flamePath(x, 32, 36, 18); x.fill(); },
  });
  for (const id of ['bellecho', 'thread', 'twinblade', 'harpoon', 'sundial', 'gavel', 'afterimage', 'thornmail', 'lastlight'])
    ICON[id] = print2(64, 64, ICON_SHAPES[id], { plates: [{ col: id === 'lastlight' ? COL.pink : COL.yellow, dx: 1.5, dy: 1.2 }, { col: COL.ink }], g: .04 }).toDataURL();
}
/* which gear a portal gave the first time it closed */
const gearFrom = gid => [...Object.keys(WEAPONS).filter(k => WEAPONS[k].unlock === gid).map(k => WEAPONS[k].name), ...Object.keys(PASSIVES).filter(k => PASSIVES[k].unlock === gid).map(k => PASSIVES[k].name)];

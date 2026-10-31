/* ================= content ================= */
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    const rr = Array.isArray(r) ? r[0] : (r || 0);
    this.moveTo(x + rr, y); this.arcTo(x + w, y, x + w, y + h, rr); this.arcTo(x + w, y + h, x, y + h, rr);
    this.arcTo(x, y + h, x, y, rr); this.arcTo(x, y, x + w, y, rr); this.closePath();
  };
}

const WEAPONS = {
  ember: {
    name: '불씨', evoName: '태양 파편', evoWith: 'mirror', max: 5,
    info: '가장 가까운 적에게 불씨를 쏜다.',
    ups: ['', '불씨 +1', '피해 +50%', '불씨 +1, 관통 +1', '재사용 -20%, 피해 +40%'],
    evoInfo: '맞으면 터지는 불씨를 쉬지 않고 퍼붓는다.',
    stat(L, evo) {
      if (evo) return { cd: .48, n: 4, dmg: 24, pierce: 3, boom: 44, bdmg: 13, spd: 480, size: 1.7 };
      return { cd: L >= 5 ? .74 : .92, n: L >= 4 ? 3 : L >= 2 ? 2 : 1, dmg: L >= 5 ? 22 : L >= 3 ? 16 : 11, pierce: L >= 4 ? 2 : 1, spd: 440, size: 1 };
    },
    fire(w, S) {
      const n = S.n + P.amount, ts = nearest(n, 560);
      if (!ts.length) return false;
      for (let i = 0; i < n; i++) {
        const t = ts[i % ts.length];
        let a = Math.atan2(t.y - P.y, t.x - P.x);
        if (i >= ts.length) a += rnd(-.3, .3);
        shoot(w.evo ? 'sun' : 'ember', P.x, P.y, a, S.spd, S.dmg, { r: 5 * S.size, pierce: S.pierce, life: 1.5, boom: S.boom || 0, bdmg: S.bdmg || 0, size: S.size });
      }
      SFX.shoot(); return true;
    },
  },
  orbit: {
    name: '궤도칼', evoName: '성환', evoWith: 'lens', max: 5,
    info: '몸 주위를 도는 칼날.',
    ups: ['', '칼날 +1', '피해 +50%, 반경 증가', '칼날 +1', '회전 +30%, 피해 증가'],
    evoInfo: '두 겹의 고리가 서로 반대로 돈다.',
    stat(L, evo) {
      if (evo) return { n: 5, dmg: 24, rad: 74, rad2: 128, spd: 3.6 };
      return { n: L >= 4 ? 4 : L >= 2 ? 3 : 2, dmg: L >= 5 ? 19 : L >= 3 ? 14 : 9, rad: L >= 3 ? 80 : 68, spd: L >= 5 ? 3.9 : 3 };
    },
    tick(w, S, dt) {
      w.ang += S.spd * dt;
      const n = S.n + P.amount;
      w.pos.length = 0;
      const ring = (rad, dir, big) => {
        for (let i = 0; i < n; i++) {
          const a = w.ang * dir + i / n * TAU;
          const bx = P.x + Math.cos(a) * rad * P.area, by = P.y + Math.sin(a) * rad * P.area;
          w.pos.push(bx, by, a + Math.PI / 2 * dir, big ? 1 : 0);
          const br = (big ? 13 : 10) * Math.sqrt(P.area);
          gq(bx, by, br + 34, e => {
            if (e.dead) return;
            const rr = br + e.r;
            if (d2(bx, by, e.x, e.y) < rr * rr && canHit(e, w.uid * 100 + i + (big ? 50 : 0), .42)) {
              const dx = e.x - P.x, dy = e.y - P.y, dl = Math.hypot(dx, dy) || 1;
              hurtEnemy(e, S.dmg, dx / dl * 170, dy / dl * 170); SFX.swish();
            }
          });
        }
      };
      ring(S.rad, 1, false);
      if (w.evo) ring(S.rad2, -1, true);
    },
  },
  bolt: {
    name: '낙뢰', evoName: '뇌우', evoWith: 'glass', max: 5,
    info: '화면 안의 적에게 번개가 떨어져 옆으로 튄다.',
    ups: ['', '낙뢰 +1', '피해 +50%', '연쇄 +1', '낙뢰 +1, 재사용 -15%'],
    evoInfo: '하늘이 쉬지 않고 운다.',
    stat(L, evo) {
      if (evo) return { cd: .55, n: 3, dmg: 34, chain: 3 };
      return { cd: L >= 5 ? 1.1 : 1.3, n: L >= 5 ? 3 : L >= 2 ? 2 : 1, dmg: L >= 3 ? 30 : 22, chain: L >= 4 ? 2 : 1 };
    },
    fire(w, S) {
      const vis = E.filter(e => !e.dead && onScreen(e.x, e.y, -12));
      if (!vis.length) return false;
      const n = S.n + P.amount;
      for (let i = 0; i < n && vis.length; i++) strike(vis.splice((Math.random() * vis.length) | 0, 1)[0], S.dmg, S.chain);
      SFX.zap(); return true;
    },
  },
  pulse: {
    name: '파문', evoName: '고동', evoWith: 'heart', max: 5,
    info: '주변의 적을 밀쳐내는 충격파. 탄도 지운다.',
    ups: ['', '피해 +50%', '반경 +25%', '재사용 -0.5초', '피해 증가, 두 번 퍼진다'],
    evoInfo: '맞은 적의 수만큼 체력을 되찾는다.',
    stat(L, evo) {
      if (evo) return { cd: 1.6, dmg: 30, rad: 172, dbl: false, heal: true };
      return { cd: L >= 4 ? 2.3 : 2.8, dmg: L >= 5 ? 28 : L >= 2 ? 19 : 13, rad: L >= 3 ? 130 : 105, dbl: L >= 5 };
    },
    fire(w, S) {
      pulseRing(S);
      if (S.dbl) G.later.push({ t: .28, fn: () => pulseRing(S) });
      return true;
    },
  },
  boomer: {
    name: '회귀검', evoName: '칼바람', evoWith: 'wing', max: 5,
    info: '던지면 다시 손으로 돌아오는 칼. 몇 번이고 벤다.',
    ups: ['', '칼 +1', '피해 +50%', '칼 +1', '사거리, 크기 증가'],
    evoInfo: '칼들이 소용돌이치며 사방을 벤다.',
    stat(L, evo) {
      if (evo) return { cd: 1.05, n: 5, dmg: 28, range: 245, size: 1.45, dur: 1.25, spiral: true };
      return { cd: 1.45, n: L >= 4 ? 3 : L >= 2 ? 2 : 1, dmg: L >= 3 ? 23 : 15, range: L >= 5 ? 250 : 205, size: L >= 5 ? 1.3 : 1, dur: 1.05 };
    },
    fire(w, S) {
      const n = S.n + P.amount;
      let base;
      if (S.spiral) base = G.time * 1.7;
      else { const t = nearest(1, 620)[0]; if (!t) return false; base = Math.atan2(t.y - P.y, t.x - P.x); }
      for (let i = 0; i < n; i++) {
        const a = S.spiral ? base + i / n * TAU : base + (i - (n - 1) / 2) * .42;
        PR.push({ kind: S.spiral ? 'gale' : 'boomer', x: P.x, y: P.y, a, range: S.range * P.area, dur: S.dur, t: 0, dmg: S.dmg, size: S.size * Math.sqrt(P.area), r: 11 * S.size * Math.sqrt(P.area), spin: 0, uid: G.uid++, spiral: !!S.spiral, dead: false });
      }
      SFX.swish(); return true;
    },
  },
  meteor: {
    name: '유성', evoName: '카타클렘', evoWith: 'whet', max: 5,
    info: '하늘에서 돌을 떨어뜨린다. 느리지만 아프다.',
    ups: ['', '유성 +1', '피해 +50%', '유성 +1, 범위 +25%', '재사용 -25%'],
    evoInfo: '이 세계를 무너뜨린 그 비. 이제는 네 편이다.',
    stat(L, evo) {
      if (evo) return { cd: 1.7, n: 5, dmg: 95, rad: 92, burn: 22 };
      return { cd: L >= 5 ? 1.8 : 2.4, n: L >= 4 ? 3 : L >= 2 ? 2 : 1, dmg: L >= 3 ? 58 : 40, rad: L >= 4 ? 72 : 60, burn: 0 };
    },
    fire(w, S) {
      const vis = E.filter(e => !e.dead && onScreen(e.x, e.y, -20));
      if (!vis.length) return false;
      const n = S.n + P.amount, r = S.rad * P.area;
      for (let i = 0; i < n; i++) {
        const t = pick(vis), x = t.x + rnd(-20, 20), y = t.y + rnd(-20, 20), evo = w.evo;
        TG.push({ x, y, r, t: -i * .12, dur: .6, kind: 'pmeteor', big: evo, cb: () => meteorImpact(x, y, r, S.dmg, S.burn, evo) });
      }
      return true;
    },
  },
  needle: {
    name: '바늘비', evoName: '천침', evoWith: 'clover', max: 5,
    info: '가는 쪽으로 바늘을 부채꼴로 뿌린다. 꿰뚫는다.',
    ups: ['', '바늘 +1', '피해 +50%', '바늘 +1, 관통 +1', '재사용 -25%'],
    evoInfo: '바늘이 원을 그리며 사방으로 쏟아진다.',
    stat(L, evo) {
      if (evo) return { cd: .42, n: 12, dmg: 17, pierce: 4, spd: 560, ring: true };
      return { cd: L >= 5 ? .54 : .72, n: L >= 4 ? 5 : L >= 2 ? 4 : 3, dmg: L >= 3 ? 12 : 8, pierce: L >= 4 ? 3 : 2, spd: 520 };
    },
    fire(w, S) {
      const n = S.n + P.amount;
      let base;
      if (S.ring) base = G.time * 2.3;
      else if (Math.hypot(INPUT.mx, INPUT.my) > .2) base = Math.atan2(INPUT.my, INPUT.mx);
      else { const t = nearest(1, 560)[0]; if (!t) return false; base = Math.atan2(t.y - P.y, t.x - P.x); }
      for (let i = 0; i < n; i++) {
        const a = S.ring ? base + i / n * TAU : base + (i - (n - 1) / 2) * .13;
        shoot('needle', P.x, P.y, a, S.spd * P.dur, S.dmg, { r: 4, pierce: S.pierce, life: .9 });
      }
      SFX.shoot(); return true;
    },
  },
  trail: {
    name: '잿불', evoName: '용암길', evoWith: 'scale', max: 5,
    info: '지나간 자리에 불붙은 잉크를 흘린다.',
    ups: ['', '피해 +50%', '불길이 넓어진다', '더 오래 탄다', '피해 +40%, 더 자주 흘린다'],
    evoInfo: '발자국마다 용암이 끓고, 밟은 적은 느려진다.',
    stat(L, evo) {
      if (evo) return { cd: .16, r: 40, dps: 36, dur: 3.4, slow: true };
      return { cd: L >= 5 ? .2 : .26, r: L >= 3 ? 32 : 25, dps: L >= 5 ? 24 : L >= 2 ? 17 : 11, dur: L >= 4 ? 2.8 : 2.1 };
    },
    fire(w, S) {
      ZN.push({ x: P.x + rnd(-4, 4), y: P.y + 6, r: S.r * P.area, t: 0, dur: S.dur * P.dur, dps: S.dps, tick: rnd(.1), dead: false, kind: w.evo ? 'lava' : 'ember', slow: !!S.slow });
      return true;
    },
  },
  beam: {
    name: '광선', evoName: '일식광', evoWith: 'spring', max: 5,
    info: '몸에서 뻗은 빛줄기가 빙글빙글 돈다.',
    ups: ['', '광선 +1', '피해 +50%, 길어진다', '광선 +1', '회전 +40%, 굵어진다'],
    evoInfo: '네 갈래의 빛이 화면을 쓸어 버린다.',
    stat(L, evo) {
      if (evo) return { n: 4, dmg: 21, len: 270, w: 18, spd: 1.9 };
      return { n: L >= 4 ? 3 : L >= 2 ? 2 : 1, dmg: L >= 3 ? 13 : 9, len: L >= 3 ? 190 : 160, w: L >= 5 ? 14 : 10, spd: L >= 5 ? 2.4 : 1.7 };
    },
    tick(w, S, dt) {
      w.ang += S.spd * dt;
      const n = S.n + P.amount, len = S.len * P.area, hw = S.w * .5 * Math.sqrt(P.area);
      w.pos.length = 0; w.len = len; w.hw = hw;
      for (let i = 0; i < n; i++) {
        const a = w.ang + i / n * TAU, ca = Math.cos(a), sa = Math.sin(a);
        w.pos.push(a);
        for (let j = 0; j < E.length; j++) {
          const e = E[j]; if (e.dead) continue;
          const dx = e.x - P.x, dy = e.y - P.y, along = dx * ca + dy * sa;
          if (along < -e.r || along > len + e.r) continue;
          if (Math.abs(-dx * sa + dy * ca) < hw + e.r && canHit(e, w.uid * 100 + i, .22)) hurtEnemy(e, S.dmg, ca * 40, sa * 40);
        }
      }
    },
  },
  mine: {
    name: '덫', evoName: '지뢰밭', evoWith: 'glass', max: 5,
    info: '발밑에 덫을 깐다. 적이 밟으면 터진다.',
    ups: ['', '덫 +1', '피해 +50%', '폭발 범위 +30%', '재사용 -30%'],
    evoInfo: '한 번에 세 개씩 깔고, 하나가 터지면 옆 덫도 같이 터진다.',
    stat(L, evo) {
      if (evo) return { cd: .9, n: 3, dmg: 80, r: 95, max: 14 };
      return { cd: L >= 5 ? 1.1 : 1.6, n: L >= 2 ? 2 : 1, dmg: L >= 3 ? 60 : 40, r: L >= 4 ? 85 : 65, max: 8 };
    },
    fire(w, S) {
      let cnt = 0; for (const p of PR) if (p.kind === 'mine' && !p.dead) cnt++;
      const n = S.n + P.amount, cap = S.max + P.amount * 2;
      for (let i = 0; i < n && cnt < cap; i++, cnt++) {
        const a = rnd(TAU), d = i ? rnd(30, 75) : rnd(0, 18);
        PR.push({ kind: 'mine', x: P.x + Math.cos(a) * d, y: P.y + Math.sin(a) * d, t: 0, arm: .45, life: 14 * P.dur, dmg: S.dmg, br: S.r * P.area, r: 10, chain: !!w.evo, trig: 0, size: 1, dead: false });
      }
      return true;
    },
  },
  firefly: {
    name: '반딧불', evoName: '별무리', evoWith: 'magnet', max: 5,
    info: '알아서 적을 찾아가는 작은 불빛.',
    ups: ['', '반딧불 +1', '피해 +50%', '반딧불 +2', '관통 +2, 빨라진다'],
    evoInfo: '불빛 떼가 끊이지 않고 몰려간다.',
    stat(L, evo) {
      if (evo) return { cd: .5, n: 3, dmg: 20, pierce: 3, spd: 340, life: 3.2 };
      return { cd: 1, n: L >= 4 ? 5 : L >= 2 ? 3 : 2, dmg: L >= 3 ? 18 : 13, pierce: L >= 5 ? 3 : 1, spd: L >= 5 ? 310 : 260, life: 2.8 };
    },
    fire(w, S) {
      if (!E.some(e => !e.dead && !e.hidden && !e.under)) return false;
      const n = S.n + P.amount;
      for (let i = 0; i < n; i++) {
        const a = rnd(TAU);
        PR.push({ kind: 'fly', x: P.x, y: P.y, vx: Math.cos(a) * 170, vy: Math.sin(a) * 170, a, r: 6, dmg: S.dmg, pierce: S.pierce, life: S.life * P.dur, spd: S.spd * P.dur, hitset: new Set(), t: rnd(.3), tgt: null, size: 1, dead: false });
      }
      return true;
    },
  },
  vortex: {
    name: '검은 구멍', evoName: '사건의 지평선', evoWith: 'lens', max: 5,
    info: '적 무리 한가운데 소용돌이를 연다. 빨아들이고 갈아 버린다.',
    ups: ['', '피해 +50%', '범위 +25%', '더 오래 버틴다', '구멍 +1'],
    evoInfo: '거대한 구멍이 모든 걸 삼키고, 닫힐 때 터진다.',
    stat(L, evo) {
      if (evo) return { cd: 3.4, n: 1, r: 150, dps: 44, dur: 4, pull: 260, end: 150 };
      return { cd: 3.1, n: L >= 5 ? 2 : 1, r: L >= 3 ? 110 : 92, dps: L >= 2 ? 30 : 22, dur: L >= 4 ? 3.2 : 2.6, pull: 190, end: 0 };
    },
    fire(w, S) {
      const vis = E.filter(e => !e.dead && !e.hidden && onScreen(e.x, e.y, -30));
      if (!vis.length) return false;
      const n = S.n + Math.floor(P.amount / 2);
      for (let i = 0; i < n; i++) { const t = pick(vis); VX.push({ x: t.x, y: t.y, r: S.r * P.area, t: 0, dur: S.dur * P.dur, dps: S.dps, pull: S.pull, end: S.end, tick: 0, big: w.evo, dead: false }); }
      SFX.vortex(); return true;
    },
  },
};

const PASSIVES = {
  whet: { name: '숫돌', max: 5, info: '모든 피해 +10%' },
  lens: { name: '렌즈', max: 5, info: '공격 범위 +10%' },
  glass: { name: '모래시계', max: 5, info: '재사용 시간 -7%' },
  heart: { name: '심장', max: 5, info: '최대 체력 +20, 초당 회복 +0.2' },
  wing: { name: '날개', max: 5, info: '이동 속도 +8%' },
  mirror: { name: '거울', max: 3, info: '모든 무기의 투사체 +1' },
  magnet: { name: '자석', max: 5, info: '획득 범위 +30%' },
  clover: { name: '네잎', max: 5, info: '치명타 +5%, 경험치 +8%' },
  scale: { name: '비늘', max: 5, info: '받는 피해 -7%' },
  spring: { name: '태엽', max: 5, info: '지속 시간, 투사체 속도 +12%' },
};
const EVO_OF = {}; for (const id in WEAPONS) (EVO_OF[WEAPONS[id].evoWith] = EVO_OF[WEAPONS[id].evoWith] || []).push(id);

const CHARS = {
  lamp: { name: '등불', start: 'ember', cost: 0, desc: '꺼지지 않는 작은 불. 무난하고 믿을 만하다.', tag: '기본', mods: {} },
  warden: { name: '파수꾼', start: 'orbit', cost: 250, desc: '칼날을 두르고 버틴다. 단단하지만 느리다.', tag: '체력 +40, 속도 -10%', mods: { hp: 40, spd: -.1 } },
  seer: { name: '점쟁이', start: 'bolt', cost: 450, desc: '번개가 어디 떨어질지 안다. 몸은 약하다.', tag: '재사용 -12%, 체력 -25', mods: { cd: .12, hp: -25 } },
  star: { name: '별지기', start: 'meteor', cost: 800, desc: '떨어지는 별의 길을 읽는다.', tag: '범위 +15%, 피해 +10%', mods: { area: .15, might: .1 } },
  hunter: { name: '사냥꾼', start: 'needle', cost: 1200, desc: '바람 부는 쪽으로 바늘을 날린다.', tag: '치명타 +10%', mods: { crit: .1 } },
  arson: { name: '방화범', start: 'trail', cost: 1600, desc: '걸어온 길이 전부 불탄다.', tag: '이동 속도 +10%', mods: { spd: .1 } },
  keeper: { name: '등대지기', start: 'beam', cost: 2200, desc: '꺼진 등대에서 마지막 빛을 들고 나왔다.', tag: '범위 +20%', mods: { area: .2 } },
  sapper: { name: '공병', start: 'mine', cost: 2800, desc: '도망치면서 이긴다.', tag: '체력 +30, 재사용 -8%', mods: { hp: 30, cd: .08 } },
  glow: { name: '반딧불이', start: 'firefly', cost: 3500, desc: '혼자가 아니다. 혼자였던 적이 없다.', tag: '투사체 +1', mods: { amount: 1 } },
  abyss: { name: '심연', start: 'vortex', cost: 4500, desc: '밤보다 어두운 불. 삼킨 만큼 강해진다.', tag: '피해 +20%, 체력 -20', mods: { might: .2, hp: -20 } },
  bellman: { name: '종치기', start: 'pulse', start2: 'bolt', excl: 'bell', desc: '종이 울릴 때마다 땅이 대답한다.', tag: '파문과 낙뢰, 범위 +25%', mods: { area: .25, hp: 20 } },
  weaver: { name: '직조공', start: 'needle', start2: 'beam', excl: 'loom', desc: '실과 빛을 같이 짠다.', tag: '바늘비와 광선, 투사체 +1', mods: { amount: 1, cd: .05 } },
  twin: { name: '쌍둥이', start: 'boomer', start2: 'orbit', excl: 'twins', desc: '둘이 하나처럼 움직인다.', tag: '회귀검과 궤도칼, 속도 +10%', mods: { spd: .1, might: .1 } },
  tidal: { name: '물결', start: 'vortex', start2: 'pulse', excl: 'tide', desc: '밀려왔다 밀려간다. 그 사이에 다 낫는다.', tag: '검은 구멍과 파문, 초당 회복 +1.5', mods: { regen: 1.5, hp: 30 } },
  clockman: { name: '시계공', start: 'bolt', start2: 'needle', excl: 'judge', desc: '1초가 남들보다 길다.', tag: '낙뢰와 바늘비, 재사용 -20%', mods: { cd: .2, crit: .05 } },
  gardener: { name: '정원사', start: 'trail', start2: 'vortex', excl: 'root', desc: '불탄 자리에 다시 심는다.', tag: '잿불과 검은 구멍, 체력 +60', mods: { hp: 60, regen: 1, area: .1 } },
  skykeeper: { name: '하늘지기', start: 'meteor', start2: 'ember', excl: 'sky', desc: '떨어진 하늘을 등에 지고 걷는다.', tag: '유성과 불씨, 피해 +40%, 투사체 +1', mods: { might: .4, amount: 1 } },
  nameless: { name: '이름 없는 불씨', start: 'vortex', start2: 'needle', excl: 'unknown', desc: '그것을 지운 자. 이제 이름이 없다.', tag: '검은 구멍과 바늘비, 피해 +50%', mods: { might: .5, amount: 1, area: .2, hp: 40 } },
  eclipse: { name: '일식', start: 'meteor', start2: 'beam', excl: 'sun', desc: '해를 삼킨 불씨.', tag: '유성과 광선, 피해 +30%', mods: { might: .3, area: .15, crit: .1 } },
};

const SHOP = [
  { id: 'hp', name: '두꺼운 심지', desc: '최대 체력 +10', max: 5, base: 40 },
  { id: 'might', name: '벼린 날', desc: '모든 피해 +5%', max: 5, base: 50 },
  { id: 'spd', name: '가벼운 발', desc: '이동 속도 +4%', max: 4, base: 40 },
  { id: 'magnet', name: '끌림', desc: '획득 범위 +15%', max: 4, base: 30 },
  { id: 'xp', name: '배움', desc: '경험치 +5%', max: 5, base: 50 },
  { id: 'regen', name: '숨 고르기', desc: '초당 체력 회복 +0.1', max: 3, base: 60 },
  { id: 'crit', name: '날카로운 눈', desc: '치명타 확률 +4%', max: 3, base: 70 },
  { id: 'reroll', name: '다시 뽑기', desc: '판마다 다시 뽑기 +1회', max: 3, base: 60 },
  { id: 'ult', name: '섬광 충전', desc: '섬광이 15% 빨리 찬다', max: 3, base: 50 },
  { id: 'revive', name: '두 번째 불씨', desc: '한 판에 한 번, 쓰러져도 다시 일어난다', max: 1, base: 320 },
];
const shopCost = (it, rank) => Math.round(it.base * (1 + rank * .85) / 5) * 5;

const RIFT = [null,
  { hp: 1, dmg: 1, spawn: 1, shard: 1 },
  { hp: 1.3, dmg: 1.15, spawn: 1.1, shard: 1.35 },
  { hp: 1.65, dmg: 1.3, spawn: 1.2, shard: 1.75 },
  { hp: 2.1, dmg: 1.45, spawn: 1.3, shard: 2.2 },
  { hp: 2.7, dmg: 1.6, spawn: 1.4, shard: 2.8 },
];

const ENEMY = {
  blob: { r: 13, hp: 9, spd: 52, dmg: 6, xp: 1, ai: 'chase' },
  moth: { r: 11, hp: 5, spd: 92, dmg: 4, xp: 1, ai: 'wobble' },
  mini: { r: 9, hp: 6, spd: 82, dmg: 5, xp: 1, ai: 'chase' },
  spitter: { r: 14, hp: 16, spd: 46, dmg: 6, xp: 2, ai: 'spit' },
  splitter: { r: 18, hp: 26, spd: 42, dmg: 9, xp: 2, ai: 'chase' },
  bomber: { r: 12, hp: 10, spd: 80, dmg: 0, xp: 2, ai: 'bomb' },
  brute: { r: 22, hp: 58, spd: 36, dmg: 14, xp: 6, ai: 'chase', kb: .75 },
  echo: { r: 20, hp: 700, spd: 0, dmg: 10, xp: 0, ai: 'echo', kb: 1 },
  sat: { r: 16, hp: 900, spd: 0, dmg: 12, xp: 0, ai: 'sat', kb: 1 },
  scribbler: { r: 15, hp: 500, spd: 125, dmg: 14, xp: 0, ai: 'chase', kb: .2 },
  sprout: { r: 18, hp: 800, spd: 0, dmg: 10, xp: 0, ai: 'turret', kb: 1 },
};
const BOSS = {
  colossus: { name: '울보 거인', r: 44, hp: 2200, spd: 42, dmg: 18, sub: '두 번째 달이 떨어진 자리에서' },
  rake: { name: '갈퀴새', r: 34, hp: 5000, spd: 120, dmg: 20, sub: '부러진 송전탑에 둥지를 튼' },
  eye: { name: '눈알 군주', r: 40, hp: 9000, spd: 30, dmg: 20, sub: '아무것도 깜빡이지 않는다' },
  cata: { name: '카타클렘', r: 55, hp: 22000, spd: 46, dmg: 26, sub: '하늘을 무너뜨린 것' },
};

const WAVES = [
  { rate: [1.8, 3], mix: { blob: 1 } },
  { rate: [3, 5], mix: { blob: .65, moth: .35 } },
  { rate: [5, 7], mix: { blob: .45, moth: .3, spitter: .25 } },
  { rate: [7, 9], mix: { blob: .35, moth: .25, splitter: .25, spitter: .15 } },
  { rate: [9, 12], mix: { blob: .25, moth: .25, brute: .2, bomber: .15, spitter: .15 } },
  { rate: [12, 15], mix: { blob: .2, moth: .2, splitter: .2, bomber: .2, brute: .1, spitter: .1 } },
  { rate: [15, 19], mix: { moth: .25, splitter: .2, bomber: .2, brute: .2, spitter: .15 } },
  { rate: [19, 24], mix: { blob: .15, moth: .2, splitter: .2, bomber: .2, brute: .15, spitter: .1 } },
  { rate: [14, 18], mix: { moth: .3, bomber: .3, brute: .2, spitter: .2 } },
];
const RUN_END = 480;

const TIMELINE = [
  { t: 40, fn: () => { swarm('moth', 14); banner('나방 떼', '무리가 지나간다'); } },
  { t: 75, fn: () => spawnElite() },
  { t: 95, fn: () => { ringOf('blob', 26, 340); banner('포위', '사방에서 조여 온다'); } },
  { t: 117, fn: () => bossWarn('colossus') },
  { t: 120, fn: () => spawnBoss('colossus') },
  { t: 150, fn: () => spawnElite() },
  { t: 170, fn: () => { swarm('bomber', 14); banner('불붙은 것들', '가까이 오면 터진다'); } },
  { t: 200, fn: () => spawnElite() },
  { t: 215, fn: () => { ringOf('splitter', 16, 350); banner('포위', '갈라지는 것들'); } },
  { t: 237, fn: () => bossWarn('rake') },
  { t: 240, fn: () => spawnBoss('rake') },
  { t: 270, fn: () => spawnElite() },
  { t: 300, fn: () => { ringOf('brute', 14, 370); banner('무거운 발소리', '뿔 달린 것들이 둘러싼다'); } },
  { t: 320, fn: () => spawnElite() },
  { t: 335, fn: () => { swarm('moth', 40); banner('나방 떼', '아까보다 많다'); } },
  { t: 357, fn: () => bossWarn('eye') },
  { t: 360, fn: () => spawnBoss('eye') },
  { t: 390, fn: () => spawnElite() },
  { t: 405, fn: () => { ringOf('mix', 34, 370); banner('포위', '전부 몰려온다'); } },
  { t: 430, fn: () => spawnElite() },
  { t: 445, fn: () => { swarm('bomber', 22); banner('불붙은 것들', '마지막 고비'); } },
  { t: 477, fn: () => bossWarn('cata') },
  { t: 480, fn: () => spawnBoss('cata') },
];

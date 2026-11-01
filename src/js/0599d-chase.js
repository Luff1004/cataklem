/* ================= story: chases =================
   A long road with something huge coming up behind. Run east; if it catches you,
   it hurts and you start the road again. Once you make it out, the road is quiet. */
const CHASE_KIND = {
  roots: { name: '뿌리 해일', col: '#3E2F2A', col2: '#6B4A33', glow: '#7CF0C8' },
  sand: { name: '모래 벌레', col: '#B0945C', col2: '#E6D3A4', glow: '#FFB03F' },
};
function chaseStart(how) {
  const C = WD.A.chase; WD.chase = null;
  if (!C || sf(C.flag)) return;
  if (how && how.side && how.side !== 'W') return;   // only when you come in from the start of the road
  WD.chase = { x: P.x - 520, t: -1.8, sx: P.x, sy: P.y, caught: 0 };
  refreshBlk();
  setTimeout(() => { if (WD && WD.chase) { banner(L('도망쳐'), L(CHASE_KIND[C.kind].name) + ' · ' + L('동쪽 끝까지 달린다'), 'warn'); SFX.roar(); shake(10); } }, 300);
}
function chaseTick(dt) {
  const c = WD.chase; if (!c) return;
  const C = WD.A.chase;
  c.t += dt;
  if (c.t > 0) {
    // a little slower than you walk, a little faster when you dawdle; it never falls far behind
    const sp = (P.speed || 165) * (C.spd || .9) * (1 + Math.min(.35, c.t * .01));
    c.x += sp * dt; c.x = Math.max(c.x, P.x - 520);
  }
  const gap = P.x - c.x;
  if (c.t > 0) { shake(clamp(5 - gap / 80, 0, 5)); if (Math.random() < .3) SFX.rumble && gate('chaseRum', 700) && SFX.rumble(); }
  // nothing else lives on this road while it runs
  for (const e of E) if (!e.dead && e.x < c.x + 30) { e.dead = true; burst(e.x, e.y, 8, COL.ink, 200); }
  if (gap < 34 && STATE === 'play') {
    c.caught++;
    // a fixed bite: a fifth of your health, whatever the region
    if (P.hp <= P.maxHp * .2 + 1) { hurtPlayer(P.hp * 99 + 9999, true); return; }
    P.hp -= P.maxHp * .2; P.inv = 1.2; SFX.hurt && SFX.hurt();
    G.flash = .5; shake(18); SFX.boom(true); buzz([60, 40, 60]);
    banner(L('붙잡혔다'), L('처음부터 다시 달린다'), 'warn');
    P.x = c.sx; P.y = c.sy; P.vx = P.vy = 0; P.slide = null; G.camX = P.x; G.camY = P.y;
    c.x = P.x - 560; c.t = -1.2;
  }
  // made it
  if (P.x > (WD.w - 4) * TL) {
    setf(C.flag); WD.chase = null; refreshBlk();
    banner(L('빠져나왔다'), josa(L(CHASE_KIND[C.kind].name), '이', '가') + ' ' + L('멀어진다'), 'good');
    SFX.win(); gainStoryXp(120 * WD.reg); persist();
  }
}
function drawChase(now) {
  const c = WD && WD.chase; if (!c) return;
  const K2 = CHASE_KIND[WD.A.chase.kind], mh = WD.h * TL, fx = c.x;
  wu(); ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const top = -40, bot = mh * TY + 40;
  // the body: a wall of it from the left edge of the world up to its front
  ctx.fillStyle = K2.col; ctx.beginPath(); ctx.moveTo(fx - 2000, top); ctx.lineTo(fx, top);
  for (let y = top; y <= bot; y += 12) ctx.lineTo(fx + Math.sin(y / 30 + now * 4) * 14 + Math.sin(y / 11 + now * 7) * 6, y);
  ctx.lineTo(fx - 2000, bot); ctx.closePath(); ctx.fill();
  if (WD.A.chase.kind === 'roots') {
    // roots lashing forward
    for (let i = 0; i < 14; i++) {
      const y = top + (i + .5) / 14 * (bot - top), reach = 40 + Math.sin(now * 3 + i * 1.7) * 30 + (i % 3) * 12;
      for (const [col, lw] of [[COL.ink, 13], [K2.col2, 9], ['rgba(255,255,255,.15)', 3]]) {
        ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(fx - 10, y);
        ctx.quadraticCurveTo(fx + reach * .5, y + Math.sin(now * 5 + i) * 16, fx + reach, y + Math.sin(now * 4 + i * 2) * 10); ctx.stroke();
      }
    }
    // glowing knots like eyes in the bark
    for (let i = 0; i < 6; i++) { const y = top + (i + .5) / 6 * (bot - top); ctx.fillStyle = K2.glow; ctx.globalAlpha = .6 + Math.sin(now * 6 + i) * .3; ctx.beginPath(); ctx.ellipse(fx - 30 - (i % 2) * 40, y, 6, 3, 0, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1;
  } else {
    // a wave of sand, and the worm's head breaching near you
    ctx.fillStyle = K2.col2; for (let i = 0; i < 18; i++) { const y = top + (i / 18) * (bot - top), r = 14 + Math.sin(now * 5 + i) * 6; ctx.beginPath(); ctx.arc(fx + 6 + Math.sin(now * 3 + i) * 8, y, r, 0, TAU); ctx.fill(); }
    const hy = clamp(P.y * TY, 60, bot - 60) + Math.sin(now * 2) * 20, hx = fx + 10, bob = Math.sin(now * 6) * 6;
    ctx.fillStyle = COL.ink; ctx.beginPath(); ctx.ellipse(hx, hy + bob, 62, 70, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#8A6E45'; ctx.beginPath(); ctx.ellipse(hx - 4, hy + bob, 58, 66, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(20,27,64,.35)'; ctx.lineWidth = 2; for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.ellipse(hx - 4, hy + bob, 58, 66 - Math.abs(k) * 8, 0, -Math.PI / 2, Math.PI / 2); ctx.stroke(); }
    // the mouth, opening and closing, ringed with teeth
    const open = .5 + Math.sin(now * 5) * .5;
    ctx.fillStyle = '#2A1A10'; ctx.beginPath(); ctx.ellipse(hx + 34, hy + bob, 18 + open * 10, 30 + open * 14, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = COL.paper; for (let k = 0; k < 10; k++) { const a = k / 10 * TAU, rx = 18 + open * 10, ry = 30 + open * 14; const tx = hx + 34 + Math.cos(a) * rx, ty = hy + bob + Math.sin(a) * ry; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx - Math.cos(a) * 8 - Math.sin(a) * 3, ty - Math.sin(a) * 8 + Math.cos(a) * 3); ctx.lineTo(tx - Math.cos(a) * 8 + Math.sin(a) * 3, ty - Math.sin(a) * 8 - Math.cos(a) * 3); ctx.fill(); }
    // spray
    ctx.fillStyle = K2.col2; for (let i = 0; i < 16; i++) { const q = (now * 2 + i * .13) % 1; ctx.globalAlpha = 1 - q; ctx.fillRect(fx + q * 60 + (i % 4) * 6, hy - 80 + i * 10 - q * 30, 3, 3); }
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}
// the edge of the screen goes red as it gets close
function drawChaseTop() {
  const c = WD && WD.chase; if (!c || c.t < 0) return;
  const gap = P.x - c.x, k = clamp(1 - gap / 380, 0, 1); if (k <= 0) return;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  const g = ctx.createLinearGradient(0, 0, W * .35, 0); g.addColorStop(0, 'rgba(255,79,158,' + (.45 * k).toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,79,158,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W * .35, H);
}

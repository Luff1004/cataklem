/* ================= canvas & camera ================= */
const cv = $('c');
const ctx = cv.getContext('2d', { alpha: false });
let W = 390, H = 844, DPR = 1, ZOOM = 1, QUALITY = 1;
let K = 1, OX = 0, OY = 0, CX = 0, CY = 0, VHW = 200, VHH = 400;
function resize() {
  W = Math.max(1, innerWidth); H = Math.max(1, innerHeight);
  DPR = Math.min(2, window.devicePixelRatio || 1) * QUALITY;
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  ZOOM = clamp(Math.min(W, H) / 410, .82, 1.5);
  ctx.imageSmoothingEnabled = true;
}
function setCam(cx, cy) { const z = ZOOM * ((G && G.camZoom) || 1); CX = cx; CY = cy; K = DPR * z; OX = W * DPR / 2 - cx * K; OY = H * DPR / 2 - cy * K; VHW = W / 2 / z; VHH = H / 2 / z; }
function onScreen(x, y, m = 0) { return Math.abs(x - CX) < VHW + m && Math.abs(y - CY) < VHH + m; }
function wt() { ctx.setTransform(K, 0, 0, K, OX, OY); }
function spr(img, x, y, w, h, rot = 0, sx = 1, sy = 1) {
  if (rot) { const c = Math.cos(rot) * K, s = Math.sin(rot) * K; ctx.setTransform(c * sx, s * sx, -s * sy, c * sy, x * K + OX, y * K + OY); }
  else ctx.setTransform(K * sx, 0, 0, K * sy, x * K + OX, y * K + OY);
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
}

function drawBG() {
  wt();
  const T = 512, x0 = Math.floor((CX - VHW) / T) * T, y0 = Math.floor((CY - VHH) / T) * T;
  for (let x = x0; x < CX + VHW; x += T) for (let y = y0; y < CY + VHH; y += T) ctx.drawImage((G && G.tile) || TILE, x, y, T + .6, T + .6);
}

/* ================= world render ================= */
function render(rdt) {
  const sx = (Math.random() - .5) * G.shake * 2, sy = (Math.random() - .5) * G.shake * 2;
  setCam(G.camX + sx, G.camY + sy);
  drawBG();
  if (G.mode === 'boss') drawArenaFloor();
  if (G.u && G.u.stage === 'final') drawFinalAmbience();

  // decals
  for (const d of DC) {
    if (!onScreen(d.x, d.y, d.s)) continue;
    ctx.globalAlpha = Math.min(1, d.life / 3) * d.a;
    spr(d.img, d.x, d.y, d.s, d.s, d.rot);
  }
  ctx.globalAlpha = 1;

  // burning ground
  wt();
  for (const z of ZN) {
    const a = Math.min(1, (z.dur - z.t) / .5);
    ctx.globalAlpha = (z.kind === 'ember' ? .16 : z.kind === 'lava' ? .26 : .13) * a; ctx.fillStyle = z.kind === 'ember' ? COL.yellow : COL.pink;
    ctx.beginPath(); ctx.arc(z.x, z.y, z.r * (1 + Math.sin(z.t * 12) * .03), 0, TAU); ctx.fill();
    ctx.globalAlpha = .5 * a; ctx.strokeStyle = COL.yellow; ctx.lineWidth = 2; ctx.setLineDash([4, 6]);
    ctx.beginPath(); ctx.arc(z.x, z.y, z.r * .8, z.t, z.t + TAU); ctx.stroke(); ctx.setLineDash([]);
  }
  ctx.globalAlpha = 1;

  drawVortex();
  if (G.mode === 'boss') { drawHazards(); drawHazardFx(); }
  drawTeles();

  // gems and pickups
  for (const g of GM) {
    if (!onScreen(g.x, g.y, 20)) continue;
    const img = g.tier === 3 ? SP.gem3 : g.tier === 2 ? SP.gem2 : SP.gem1;
    const s = g.tier === 3 ? 1.25 : 1;
    spr(img, g.x, g.y + Math.sin(g.t * 4) * 1.5, img.width / SS * s, img.height / SS * s);
  }
  for (const k of PK) {
    if (!onScreen(k.x, k.y, 30)) continue;
    const bob = Math.sin(k.t * 3) * 2.5;
    if (k.kind === 'chest') {
      ctx.globalAlpha = .5 + Math.sin(k.t * 4) * .2; spr(SP.aura, k.x, k.y, 76, 76, k.t * .6); ctx.globalAlpha = 1;
      spr(k.boss ? SP.chestBoss : SP.chest, k.x, k.y + bob, 34, 30);
    } else {
      spr(SP.shadow, k.x, k.y + 11, 20, 7);
      const img = SP[k.kind], s = k.kind === 'shard' ? 1.2 : 1;
      spr(img, k.x, k.y - 2 + bob, img.width / SS * s, img.height / SS * s);
    }
  }

  if (OB.length) drawPillars();
  drawEnemies();
  drawGhosts();
  drawPlayer();
  drawWard();
  drawProjectiles();
  drawIntroFx();
  drawBossGear();
  drawHeaven();

  // enemy bullets
  for (const b of EB) { if (!onScreen(b.x, b.y, 20)) continue; spr(b.big ? SP.ebig : SP.ebul, b.x, b.y, b.big ? 20 : 13, b.big ? 20 : 13); }

  // rings
  wt();
  for (const g of RG) {
    const p = Math.min(1, g.t / g.dur), fade = g.t > g.dur ? 1 - (g.t - g.dur) / .18 : 1;
    ctx.globalAlpha = Math.max(0, fade) * (g.dmg ? .95 : .8);
    ctx.lineWidth = g.w * (1 - p * .55);
    if (g.riso) { ctx.strokeStyle = COL.ink; ctx.beginPath(); ctx.arc(g.x + 2, g.y + 1.5, g.r, 0, TAU); ctx.stroke(); }
    ctx.strokeStyle = g.col; ctx.beginPath(); ctx.arc(g.x, g.y, g.r, 0, TAU); ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // lightning
  for (const b of BL) {
    const a = b.life / b.max; ctx.globalAlpha = a; ctx.lineJoin = 'round';
    for (const [col, lw, o] of [[COL.yellow, 7, 0], [COL.pink, 2.2, 1.5], [COL.white, 1.4, 0]]) {
      ctx.strokeStyle = col; ctx.lineWidth = lw * (o ? 1 : (.6 + a * .4)); ctx.beginPath();
      for (let i = 0; i < b.pts.length; i += 2) { const px = b.pts[i] + o, py = b.pts[i + 1]; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;

  // particles
  for (const p of PT) {
    if (!onScreen(p.x, p.y, 10)) continue;
    ctx.globalAlpha = Math.min(1, p.life / p.max * 1.6); ctx.fillStyle = p.c;
    const s = p.s * (.4 + .6 * p.life / p.max);
    ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
  }
  ctx.globalAlpha = 1;

  drawNovaFx();
  if (G.dark > .02) drawDark();
  drawIntroTop();
  drawTexts();
  drawIndicators();
  drawOverlay();
  drawNovaClock();
  drawUnknownOverlay();
  drawHeavenOverlay();
  drawLiveSub();
  drawSubs();
  drawPulse();
  drawJoy();
}

function drawTeles() {
  wt();
  for (const t of TG) {
    if (t.t < 0) continue;
    const p = clamp(t.t / t.dur, 0, 1);
    if (t.kind === 'pmeteor') {
      ctx.globalAlpha = .14 + p * .14; ctx.fillStyle = COL.pink; ctx.beginPath(); ctx.arc(t.x, t.y, t.r * p, 0, TAU); ctx.fill();
      ctx.globalAlpha = .85; ctx.strokeStyle = COL.pink; ctx.lineWidth = 2; ctx.setLineDash([6, 5]);
      ctx.beginPath(); ctx.arc(t.x, t.y, t.r, -p * 2, -p * 2 + TAU); ctx.stroke(); ctx.setLineDash([]);
      const q = 1 - p, mx = t.x - 230 * q, my = t.y - 380 * q, sz = t.big ? 40 : 28;
      ctx.globalAlpha = .55; ctx.strokeStyle = COL.yellow; ctx.lineWidth = sz * .45;
      ctx.beginPath(); ctx.moveTo(mx - 60 * (.4 + q * .6), my - 100 * (.4 + q * .6)); ctx.lineTo(mx, my); ctx.stroke();
      ctx.globalAlpha = 1; spr(SP.rock, mx, my, sz, sz, t.t * 8); wt();
    } else if (t.kind === 'emeteor') {
      ctx.globalAlpha = .1 + p * .16; ctx.fillStyle = COL.ink; ctx.beginPath(); ctx.arc(t.x, t.y, t.r * p, 0, TAU); ctx.fill();
      ctx.globalAlpha = .8; ctx.strokeStyle = COL.ink; ctx.lineWidth = 2.5; ctx.setLineDash([7, 5]);
      ctx.beginPath(); ctx.arc(t.x, t.y, t.r, p * 2, p * 2 + TAU); ctx.stroke(); ctx.setLineDash([]);
      const q = 1 - p, mx = t.x + 200 * q, my = t.y - 420 * q;
      ctx.globalAlpha = .4; ctx.strokeStyle = COL.ink; ctx.lineWidth = 12;
      ctx.beginPath(); ctx.moveTo(mx + 50, my - 105); ctx.lineTo(mx, my); ctx.stroke();
      ctx.globalAlpha = 1; spr(SP.rockInk, mx, my, 32, 32, -t.t * 7); wt();
    } else if (t.kind === 'root') {
      ctx.globalAlpha = .15 + p * .25; ctx.fillStyle = COL.teal; ctx.beginPath(); ctx.arc(t.x, t.y, t.r * p, 0, TAU); ctx.fill();
      ctx.globalAlpha = .9; ctx.strokeStyle = COL.deep; ctx.lineWidth = 2.5; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.arc(t.x, t.y, t.r, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = COL.teal; ctx.lineWidth = 2; ctx.beginPath(); for (let k = 0; k < 4; k++) { const a = k * 1.6 + t.x; ctx.moveTo(t.x, t.y); ctx.lineTo(t.x + Math.cos(a) * t.r * p, t.y + Math.sin(a) * t.r * p); } ctx.stroke();
    } else if (t.kind === 'grasp') {
      ctx.globalAlpha = .12 + p * .3; ctx.fillStyle = COL.deep; ctx.beginPath(); ctx.arc(t.x, t.y, t.r * p, 0, TAU); ctx.fill();
      ctx.globalAlpha = .85; ctx.strokeStyle = COL.pink; ctx.lineWidth = 2.5; ctx.beginPath();
      for (let k = 0; k <= 16; k++) { const a = k / 16 * TAU, r = t.r * (1.15 - p * .15) + rnd(-4, 4); k ? ctx.lineTo(t.x + Math.cos(a) * r, t.y + Math.sin(a) * r) : ctx.moveTo(t.x + Math.cos(a) * r, t.y + Math.sin(a) * r); }
      ctx.stroke();
    } else if (t.kind === 'eslam') {
      ctx.globalAlpha = .1 + p * .18; ctx.fillStyle = COL.ink; ctx.beginPath(); ctx.arc(t.x, t.y, t.r * p, 0, TAU); ctx.fill();
      ctx.globalAlpha = .85; ctx.strokeStyle = COL.ink; ctx.lineWidth = 3; ctx.setLineDash([9, 6]);
      ctx.beginPath(); ctx.arc(t.x, t.y, t.r, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    } else if (t.kind === 'eline') {
      const c = Math.cos(t.a), s = Math.sin(t.a);
      ctx.setTransform(c * K, s * K, -s * K, c * K, t.x * K + OX, t.y * K + OY);
      ctx.globalAlpha = .12; ctx.fillStyle = COL.ink; ctx.fillRect(0, -t.w / 2, t.len, t.w);
      ctx.globalAlpha = .22; ctx.fillRect(0, -t.w / 2, t.len * p, t.w);
      ctx.globalAlpha = .9; ctx.strokeStyle = COL.pink; ctx.lineWidth = 2; ctx.setLineDash([8, 6]); ctx.strokeRect(0, -t.w / 2, t.len, t.w); ctx.setLineDash([]);
      wt();
    }
  }
  ctx.globalAlpha = 1;
}

function drawEnemies() {
  E.sort((a, b) => a.y - b.y);
  for (const e of E) {
    if (e.dead) continue;
    if (e.type === 'unknown') { drawUnknown(e); continue; }
    if (e.type === 'limb') { drawLimb(e); continue; }
    if (e.type === 'skyshard') { drawShard(e); continue; }
    if (e.type === 'scribbler') { drawScribBall(e); continue; }
    const S = SPR[e.type];
    if (!S || !onScreen(e.x, e.y, S.size * e.scl)) continue;
    if (e.hidden) { const k = clamp(1 - (e.leap || 0) / 1.5, 0, 1); ctx.globalAlpha = .5 + k * .5; spr(SP.shadow, e.x, e.y + e.r * .3, e.r * (1.4 + k * 1.4), e.r * (.5 + k * .5)); ctx.globalAlpha = 1; continue; }
    if (e.under > 0) { drawRipple(e); continue; }
    const isc = e.introScale === undefined ? 1 : e.introScale;
    if (isc <= .01) continue;
    const size = S.size * e.scl * isc;
    spr(SP.shadow, e.x, e.y + e.r * .85, e.r * 2.3 * isc, e.r * .8 * isc);
    if (e.elite) { ctx.globalAlpha = .65 + Math.sin(e.t * 6) * .2; spr(SP.aura, e.x, e.y, e.r * 3.4, e.r * 3.4, e.t); ctx.globalAlpha = 1; }
    let bsx = 1, bsy = 1, rot = 0;
    const b = Math.sin(e.t * (e.boss ? 3 : 7) + e.ph);
    if (ENEMY[e.type] && ENEMY[e.type].flap) { bsx = .7 + Math.abs(Math.sin(e.t * 16 + e.ph)) * .38; bsy = 1; }
    else { bsx = 1 + b * .06; bsy = 1 - b * .06; }
    if (e.fuse > 0) { const s = 1 + (.5 - e.fuse) * .7; bsx *= s; bsy *= s; }
    if (e.boss && e.st === 'dash') rot = Math.sin(e.t * 30) * .08;
    if (e.chg > 0) { rot = Math.sin(e.t * 50) * .12; bsx *= 1.08; bsy *= .92; }
    if (e.dashT > 0 && !e.boss) rot = (e.face > 0 ? 1 : -1) * .25;
    if (e.boss && e.slam > 0) { const s = 1 + (1 - e.slam) * .12; bsx *= s; bsy *= 1 / s; }
    if (e.ring > 0) { bsx *= 1 + e.ring * .5; bsy *= 1 - e.ring * .35; }
    if (e.nova > 0) { const s = 1 + (4.6 - e.nova) * .05 + Math.sin(e.t * 40) * .02; bsx *= s; bsy *= s; }
    let face = e.face;
    if (e.arena || e.ai === 'echo' || e.ai === 'sat') face = 1;
    if (e.type === 'tide') rot = (e.mvA || 0) + Math.PI / 2;
    if (e.type === 'sat') rot = e.t * 2;
    if (e.type === 'sun') rot = e.t * .2;
    if (e.inv > 0 && e.arena) ctx.globalAlpha = .55 + Math.sin(e.t * 30) * .25;
    const fl = e.flash > 0 || (e.fuse > 0 && Math.floor(e.fuse * 16) % 2 === 0);
    if (e.boss && e.flash > 0) {
      spr(S.img, e.x, e.y, size, size, rot, bsx * face, bsy);
      ctx.globalAlpha = .4; spr(S.flash, e.x, e.y, size, size, rot, bsx * face, bsy);
    } else spr(fl ? S.flash : S.img, e.x, e.y, size, size, rot, bsx * face, bsy);
    ctx.globalAlpha = 1;
    if (e.ai === 'bomb') {
      const fx = e.x + e.r * .72 * e.face, fy = e.y - e.r * 1.1;
      wt(); ctx.fillStyle = Math.random() < .5 ? COL.yellow : COL.pink;
      const s = 2.2 + Math.random() * 2.2; ctx.fillRect(fx - s / 2, fy - s / 2, s, s);
    }
    if (e.elite && e.hp < e.maxHp) {
      wt(); const w = e.r * 2;
      ctx.fillStyle = COL.ink; ctx.fillRect(e.x - w / 2 - 1, e.y + e.r + 6, w + 2, 5);
      ctx.fillStyle = COL.yellow; ctx.fillRect(e.x - w / 2, e.y + e.r + 7, w * Math.max(0, e.hp / e.maxHp), 3);
    }
  }
}

function drawPlayer() {
  const S = SPR['p_' + (G.char || 'lamp')];
  if (STATE === 'dying' && G.dieT < 1.1) return;
  ctx.globalAlpha = .45 + Math.sin(P.t * 3) * .08;
  spr(SP.glow, P.x, P.y + 2, 120, 120);
  ctx.globalAlpha = 1;
  // orbit track under the blades
  for (const w of G.weapons) if (w.id === 'orbit') {
    wt(); ctx.globalAlpha = .12; ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.5; ctx.setLineDash([3, 7]);
    const S2 = WEAPONS.orbit.stat(w.lv, w.evo);
    ctx.beginPath(); ctx.arc(P.x, P.y, S2.rad * P.area, 0, TAU); ctx.stroke();
    if (w.evo) { ctx.beginPath(); ctx.arc(P.x, P.y, S2.rad2 * P.area, 0, TAU); ctx.stroke(); }
    ctx.setLineDash([]); ctx.globalAlpha = 1;
  }
  spr(SP.shadow, P.x, P.y + 12, 26, 8);
  const fl = 1 + Math.sin(P.t * 13) * .045, lean = clamp(P.vx / (P.speed || 150), -1, 1) * .16;
  const blink = P.inv > 0 && Math.floor(P.t * 22) % 2 === 0;
  spr(blink ? S.flash : S.img, P.x, P.y - 2, 40, 40, lean, P.face * (2 - fl), fl);
  // hp bar
  wt();
  const w = 30, r = clamp(P.hp / P.maxHp, 0, 1);
  ctx.fillStyle = COL.ink; ctx.fillRect(P.x - w / 2 - 1.5, P.y + 19, w + 3, 6);
  ctx.fillStyle = COL.paper; ctx.fillRect(P.x - w / 2, P.y + 20.5, w, 3);
  ctx.fillStyle = r < .3 ? COL.pink : COL.teal; ctx.fillRect(P.x - w / 2, P.y + 20.5, w * r, 3);
}

function drawProjectiles() {
  for (const w of G.weapons) if (w.id === 'orbit') {
    const a = w.pos, s = Math.sqrt(P.area);
    for (let i = 0; i < a.length; i += 4) spr(a[i + 3] ? SP.blade2 : SP.blade, a[i], a[i + 1], (a[i + 3] ? 30 : 24) * s, (a[i + 3] ? 30 : 24) * s, a[i + 2]);
  }
  for (const w of G.weapons) if (w.id === 'beam' && w.pos.length) drawBeams(w);
  for (const p of PR) {
    if (!onScreen(p.x, p.y, 30)) continue;
    if (p.kind === 'needle') {
      wt(); ctx.lineCap = 'round';
      ctx.strokeStyle = COL.pink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(p.x - p.vx * .03 + 1.2, p.y - p.vy * .03 + 1); ctx.lineTo(p.x + 1.2, p.y + 1); ctx.stroke();
      ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(p.x - p.vx * .03, p.y - p.vy * .03); ctx.lineTo(p.x, p.y); ctx.stroke();
      continue;
    }
    if (p.kind === 'mine') {
      const armed = p.t > p.arm, blink = armed && Math.floor(p.t * 4) % 2 === 0;
      spr(SP.mine, p.x, p.y, 20, 20);
      wt(); ctx.fillStyle = blink || p.trig > 0 ? COL.yellow : COL.pink; ctx.beginPath(); ctx.arc(p.x, p.y, 2.6, 0, TAU); ctx.fill();
      continue;
    }
    if (p.kind === 'fly') {
      ctx.globalAlpha = .45; spr(SP.aura, p.x, p.y, 26, 26); ctx.globalAlpha = 1;
      spr(SP.fly, p.x, p.y, 12, 12);
      continue;
    }
    if (p.kind === 'ember' || p.kind === 'sun') {
      wt(); ctx.globalAlpha = .45; ctx.strokeStyle = p.kind === 'sun' ? COL.yellow : COL.pink; ctx.lineWidth = 3.4 * p.size;
      ctx.beginPath(); ctx.moveTo(p.x - p.vx * .035, p.y - p.vy * .035); ctx.lineTo(p.x, p.y); ctx.stroke(); ctx.globalAlpha = 1;
      if (p.kind === 'sun') spr(SP.sun, p.x, p.y, 24, 24, p.t * 7);
      else spr(SP.ember, p.x, p.y, 13, 13);
    } else if (p.kind === 'boomer' || p.kind === 'gale') {
      const sz = 26 * p.size;
      spr(p.kind === 'gale' ? SP.gale : SP.boomer, p.x, p.y, sz, sz, p.spin);
    }
  }
}

function drawTexts() {
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  let lastFont = '';
  for (const t of TX) {
    if (!onScreen(t.x, t.y, 30)) continue;
    const a = Math.min(1, t.life / t.max * 2.2), pop = 1 + Math.max(0, (t.life / t.max - .75)) * 2.4;
    const size = (t.crit ? 17 : t.me || t.healTxt ? 14 : 11.5) * pop;
    const f = '700 ' + size.toFixed(1) + 'px "IBM Plex Mono", ui-monospace, monospace';
    wt();
    if (f !== lastFont) { ctx.font = f; lastFont = f; }
    ctx.globalAlpha = a;
    const s = String(t.v);
    ctx.lineWidth = 3.2; ctx.strokeStyle = COL.paper; ctx.strokeText(s, t.x, t.y);
    if (t.crit) { ctx.fillStyle = COL.ink; ctx.fillText(s, t.x + 1.4, t.y + 1.1); ctx.fillStyle = COL.pink; ctx.fillText(s, t.x, t.y); }
    else if (t.me) { ctx.fillStyle = COL.pink; ctx.fillText(s, t.x, t.y); }
    else if (t.healTxt) { ctx.fillStyle = COL.teal; ctx.fillText(s, t.x, t.y); }
    else { ctx.fillStyle = P.heavenly && G.mode === 'boss' ? '#B98500' : COL.ink; ctx.fillText(s, t.x, t.y); }
  }
  ctx.globalAlpha = 1;
}

function drawIndicators() {
  const list = [];
  if (G.boss && !onScreen(G.boss.x, G.boss.y, -10)) list.push([G.boss.x, G.boss.y, COL.ink, 1.3]);
  for (const k of PK) if (k.kind === 'chest' && !onScreen(k.x, k.y, -10)) list.push([k.x, k.y, COL.yellow, 1]);
  if (!list.length) return;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  for (const [x, y, col, s] of list) {
    const dx = (x - CX) * ZOOM, dy = (y - CY) * ZOOM, m = 30;
    const tx = W / 2 - m, ty = H / 2 - m - 40, k = Math.min(tx / Math.abs(dx || 1e-6), ty / Math.abs(dy || 1e-6));
    const px = W / 2 + dx * k, py = H / 2 + 20 + dy * k, a = Math.atan2(dy, dx);
    ctx.save(); ctx.translate(px, py); ctx.rotate(a); ctx.scale(s, s);
    ctx.fillStyle = COL.ink; ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-8, -10); ctx.lineTo(-3, 0); ctx.lineTo(-8, 10); ctx.closePath(); ctx.fill();
    ctx.translate(-2, -1.5); ctx.fillStyle = col === COL.ink ? COL.pink : col; ctx.beginPath(); ctx.moveTo(11, 0); ctx.lineTo(-6, -7); ctx.lineTo(-2, 0); ctx.lineTo(-6, 7); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
}

function drawOverlay() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(VIG, 0, 0, cv.width, cv.height);
  const hr = P.maxHp ? P.hp / P.maxHp : 1;
  if (hr < .3 && STATE === 'play') { ctx.globalAlpha = (1 - hr / .3) * (.45 + Math.sin(performance.now() / 160) * .25); ctx.drawImage(VIGP, 0, 0, cv.width, cv.height); }
  if (G.hurtFlash > 0) { ctx.globalAlpha = Math.min(1, G.hurtFlash / .3) * .7; ctx.drawImage(VIGP, 0, 0, cv.width, cv.height); }
  if (G.flash > 0) { ctx.globalAlpha = Math.min(.85, G.flash); ctx.fillStyle = COL.white; ctx.fillRect(0, 0, cv.width, cv.height); }
  if (STATE === 'dying') { ctx.globalAlpha = clamp(1 - G.dieT / 1.5, 0, 1) * .55; ctx.fillStyle = COL.deep; ctx.fillRect(0, 0, cv.width, cv.height); }
  ctx.globalAlpha = 1;
}

function drawJoy() {
  const j = INPUT.joy; if (!j || STATE !== 'play') return;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.globalAlpha = .4; ctx.strokeStyle = COL.ink; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(j.ox, j.oy, 52, 0, TAU); ctx.stroke();
  ctx.setLineDash([2, 6]); ctx.beginPath(); ctx.arc(j.ox, j.oy, 40, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
  let dx = j.x - j.ox, dy = j.y - j.oy; const d = Math.hypot(dx, dy); if (d > 52) { dx *= 52 / d; dy *= 52 / d; }
  ctx.globalAlpha = .45; ctx.fillStyle = COL.ink; ctx.beginPath(); ctx.arc(j.ox + dx + 2, j.oy + dy + 2, 21, 0, TAU); ctx.fill();
  ctx.globalAlpha = .75; ctx.fillStyle = COL.pink; ctx.beginPath(); ctx.arc(j.ox + dx, j.oy + dy, 21, 0, TAU); ctx.fill();
  ctx.globalAlpha = 1;
}

/* ================= title backdrop ================= */
const ATT = { t: 0, mobs: [], mets: [], rings: [], next: 1 };
function initAttract() {
  ATT.mobs = [];
  const kinds = ['blob', 'blob', 'moth', 'spitter', 'brute', 'splitter', 'bomber', 'moth', 'blob', 'mini', 'mini', 'moth'];
  kinds.forEach((k, i) => ATT.mobs.push({ k, a: i / kinds.length * TAU + rnd(.3), rad: rnd(130, 235), spd: rnd(.12, .22) * (i % 2 ? 1 : -1), ph: rnd(TAU) }));
}
function renderTitle(dt) {
  ATT.t += dt;
  const t = ATT.t;
  setCam(t * 12, t * 5);
  drawBG();
  const cx = CX, cy = CY + 70;
  // falling sky
  ATT.next -= dt;
  if (ATT.next <= 0) { ATT.next = rnd(.9, 2.2); ATT.mets.push({ x: cx + rnd(-VHW, VHW), y: cy + rnd(-VHH * .6, VHH * .7), t: 0, dur: rnd(.9, 1.3), big: Math.random() < .3 }); }
  for (const m of ATT.mets) {
    m.t += dt; const p = m.t / m.dur, q = 1 - p;
    if (p >= 1) { m.dead = true; ATT.rings.push({ x: m.x, y: m.y, t: 0 }); continue; }
    const mx = m.x - 240 * q, my = m.y - 400 * q, sz = m.big ? 34 : 24;
    wt(); ctx.globalAlpha = .5; ctx.strokeStyle = COL.yellow; ctx.lineWidth = sz * .4;
    ctx.beginPath(); ctx.moveTo(mx - 70, my - 116); ctx.lineTo(mx, my); ctx.stroke(); ctx.globalAlpha = 1;
    spr(SP.rock, mx, my, sz, sz, m.t * 6);
  }
  ATT.mets = ATT.mets.filter(m => !m.dead);
  wt();
  for (const r of ATT.rings) { r.t += dt; const p = r.t / .6; if (p >= 1) { r.dead = true; continue; } ctx.globalAlpha = 1 - p; ctx.strokeStyle = COL.pink; ctx.lineWidth = 5 * (1 - p); ctx.beginPath(); ctx.arc(r.x, r.y, 60 * Math.sqrt(p), 0, TAU); ctx.stroke(); }
  ctx.globalAlpha = 1;
  ATT.rings = ATT.rings.filter(r => !r.dead);
  // creatures circling the last light
  const list = ATT.mobs.map(m => { m.a += m.spd * dt; return { m, x: cx + Math.cos(m.a) * m.rad, y: cy + Math.sin(m.a) * m.rad * .62 }; }).sort((a, b) => a.y - b.y);
  ctx.globalAlpha = .55 + Math.sin(t * 3) * .08; spr(SP.glow, cx, cy, 170, 170); ctx.globalAlpha = 1;
  if (anyPortal()) drawTitlePortal(cx + 88, cy - 6, t);
  let playerDrawn = false;
  for (const o of list) {
    if (!playerDrawn && o.y > cy) { drawTitlePlayer(cx, cy, t); playerDrawn = true; }
    const S = SPR[o.m.k], b = Math.sin(t * 7 + o.m.ph);
    spr(SP.shadow, o.x, o.y + S.size * .32, S.size * .8, S.size * .28);
    const face = Math.cos(o.m.a) * Math.sign(o.m.spd) < 0 ? 1 : -1;
    const sx = o.m.k === 'moth' ? .7 + Math.abs(Math.sin(t * 16 + o.m.ph)) * .38 : 1 + b * .06;
    spr(S.img, o.x, o.y, S.size, S.size, 0, sx * face, 1 - b * .06);
  }
  if (!playerDrawn) drawTitlePlayer(cx, cy, t);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(VIG, 0, 0, cv.width, cv.height);
}
function drawTitlePlayer(x, y, t) {
  const S = SPR['p_' + SAVE.char] || SPR.p_lamp;
  spr(SP.shadow, x, y + 14, 30, 9);
  const fl = 1 + Math.sin(t * 13) * .05;
  spr(S.img, x, y - 2, 46, 46, Math.sin(t * 1.3) * .06, 2 - fl, fl);
}

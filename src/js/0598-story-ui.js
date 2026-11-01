/* ================= story mode: classes, the bag, shops you can look into, waystones, PC prompts ================= */
const IS_PC = !!window.CATAKLEM_PC || (matchMedia('(pointer:fine)').matches && !('ontouchstart' in window));
if (IS_PC) document.body.classList.add('pc');

/* ---------- classes, sold by Lea ---------- */
const STORY_CLASSES = {
  wanderer: { name: '떠돌이', look: 'lamp', price: 0, desc: '특별한 것 없음. 그래서 무엇이든 된다.' },
  guard: { name: '파수꾼', look: 'warden', price: 400, desc: '최대 체력 +30%. 이동 속도 -8%.', hp: .3, spd: -.08 },
  duelist: { name: '결투가', look: 'hunter', price: 700, desc: '치명타 +12%. 치명타 피해 ×2.5.', crit: .12, critMul: 2.5 },
  runner: { name: '바람잡이', look: 'glow', price: 900, desc: '이동 속도 +18%. 구르기가 빨리 돌아온다.', spd: .18, dash: .6 },
  brute: { name: '장사', look: 'sapper', price: 1300, desc: '칼 피해 +22%. 휘두르기가 조금 느려진다.', dmg: .22, cd: .1 },
  mystic: { name: '약초술사', look: 'gardener', price: 1800, desc: '물약 회복 1.6배. 초당 체력 1 회복.', pot: 1.6, regen: 1 },
  reaper: { name: '그림자 사냥꾼', look: 'abyss', price: 2600, desc: '쓰러뜨릴 때마다 체력 2% 회복. 피해 +8%.', leech: .02, dmg: .08 },
};
const curClass = () => STORY_CLASSES[(SAVE.story && SAVE.story.cls) || 'wanderer'] || STORY_CLASSES.wanderer;

/* ---------- icons for shop rows and the bag ---------- */
const SICON = {};
function storyIcon(kind, id) {
  const key = kind + ':' + (id || '');
  if (SICON[key]) return SICON[key];
  const c = document.createElement('canvas'); c.width = c.height = 96;
  const x = c.getContext('2d'); x.scale(1.5, 1.5); x.lineJoin = 'round'; x.lineCap = 'round';
  const ink = COL.ink;
  const bottle = (col, big) => {
    const s = big ? 1.15 : 1;
    x.save(); x.translate(32, 36); x.scale(s, s);
    x.fillStyle = COL.pink; x.beginPath(); x.ellipse(2, 8, 15, 15, 0, 0, TAU); x.fill();
    x.fillStyle = col; x.beginPath(); x.ellipse(0, 6, 15, 15, 0, 0, TAU); x.fill();
    x.fillStyle = '#E8E9E3'; x.fillRect(-6, -18, 12, 12); x.fillStyle = '#B9894F'; x.fillRect(-7, -22, 14, 6);
    x.strokeStyle = ink; x.lineWidth = 2.6; x.beginPath(); x.ellipse(0, 6, 15, 15, 0, 0, TAU); x.stroke(); x.strokeRect(-6, -18, 12, 12); x.strokeRect(-7, -22, 14, 6);
    x.fillStyle = 'rgba(255,255,255,.75)'; x.beginPath(); x.ellipse(-6, 1, 3, 6, -.4, 0, TAU); x.fill();
    x.restore();
  };
  if (kind === 'potion') bottle(COL.pink);
  else if (kind === 'bigpotion') bottle(COL.yellow, 1);
  else if (kind === 'charm') { x.fillStyle = COL.pink; flamePath(x, 34, 36, 15); x.fill(); x.fillStyle = COL.yellow; flamePath(x, 32, 34, 15); x.fill(); x.strokeStyle = ink; x.lineWidth = 2.4; flamePath(x, 32, 34, 15); x.stroke(); x.fillStyle = COL.white; x.beginPath(); x.arc(32, 40, 4, 0, TAU); x.fill(); }
  else if (kind === 'sword' || kind === 'plus') {
    const sw = SWORDS[id] || SWORDS.wood;
    x.save(); x.translate(32, 32); x.rotate(-Math.PI / 4);
    x.fillStyle = COL.pink; x.beginPath(); x.moveTo(-4 + 2, 14 + 2); x.lineTo(2, -26 + 2); x.lineTo(4 + 2, 14 + 2); x.fill();
    x.fillStyle = sw.col; x.beginPath(); x.moveTo(-5, 14); x.lineTo(0, -26); x.lineTo(5, 14); x.closePath(); x.fill();
    x.strokeStyle = ink; x.lineWidth = 2.2; x.stroke();
    x.lineWidth = 5; x.beginPath(); x.moveTo(-11, 15); x.lineTo(11, 15); x.stroke(); x.lineWidth = 4; x.beginPath(); x.moveTo(0, 16); x.lineTo(0, 26); x.stroke();
    x.restore();
    if (kind === 'plus') { x.fillStyle = COL.yellow; x.strokeStyle = ink; x.lineWidth = 2; x.beginPath(); x.arc(48, 46, 10, 0, TAU); x.fill(); x.stroke(); x.fillStyle = ink; x.font = '900 14px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('+', 48, 47); }
  } else if (kind === 'class') {
    const S = SPR['p_' + STORY_CLASSES[id].look]; if (S) x.drawImage(S.img, 4, 4, 56, 56);
  } else if (kind === 'item') {
    x.fillStyle = COL.paper; x.strokeStyle = ink; x.lineWidth = 2.4; x.beginPath(); x.roundRect(14, 14, 36, 36, 6); x.fill(); x.stroke();
    x.fillStyle = id === 'stone' ? '#8C93A3' : id === 'salt_heart' ? '#F2EEDF' : id === 'mushroom' ? COL.teal : id === 'jar' ? '#7CC6D8' : COL.pink;
    x.beginPath(); x.arc(32, 32, 11, 0, TAU); x.fill(); x.stroke();
  }
  return SICON[key] = c.toDataURL();
}

/* ---------- the shop, seen from across the counter ---------- */
let SHOP_NPC = 'pio', SHOP_RAF = 0, SHOP_SEL = 0;
const SHOP_SAY = {
  baren: '필요한 거 있으면 골라. 물약은 늘 있어.', pio: '길이 달라도 장사는 같지. 천천히 봐.', sai: '물 빼고는 다 있어.',
  smith: '칼 내려놔. 어디까지 갈아 줄까.', class: '사람은 옷을 바꾸면 걸음도 바뀌어. 골라 봐.',
};
function shopScene(t) {
  const cv2 = $('shopCv'); if (!cv2) return;
  const r = cv2.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
  if (cv2.width !== Math.round(r.width * dpr) || cv2.height !== Math.round(r.height * dpr)) { cv2.width = Math.round(r.width * dpr); cv2.height = Math.round(r.height * dpr); }
  const x = cv2.getContext('2d'), w = r.width, h = r.height, reg = WD ? WD.reg : 1, R = mulberry(7 + reg);
  x.setTransform(dpr, 0, 0, dpr, 0, 0);
  const wall = ['#E6D5BA', '#E6D5BA', '#CFE0D6', '#F0E5C8', '#DCE7EC', '#E6DEEA'][reg];
  x.fillStyle = wall; x.fillRect(0, 0, w, h);
  // planks
  x.strokeStyle = 'rgba(37,53,111,.18)'; x.lineWidth = 1.5;
  for (let y = 0; y < h; y += 26) { x.beginPath(); x.moveTo(0, y); x.lineTo(w, y); x.stroke(); }
  // lamp glow
  const lg = x.createRadialGradient(w * .5, h * .18, 10, w * .5, h * .18, h * .9);
  lg.addColorStop(0, 'rgba(255,210,63,.35)'); lg.addColorStop(1, 'rgba(255,210,63,0)'); x.fillStyle = lg; x.fillRect(0, 0, w, h);
  // shelves with jars and boxes
  for (const sy of [h * .2, h * .42]) {
    x.fillStyle = '#9C6E43'; x.fillRect(w * .04, sy, w * .92, 8); x.fillStyle = COL.ink; x.fillRect(w * .04, sy + 8, w * .92, 3);
    let px = w * .06;
    while (px < w * .94) {
      const kind = R(), ww = 14 + R() * 22, hh = 18 + R() * 26;
      if (Math.abs(px + ww / 2 - w / 2) < w * .17 && sy > h * .3) { px += ww + 6; continue; }
      const col = [COL.pink, COL.teal, COL.yellow, '#7CC6D8', '#B9894F'][Math.floor(R() * 5)];
      x.fillStyle = col; x.strokeStyle = COL.ink; x.lineWidth = 2;
      if (kind < .5) { x.beginPath(); x.roundRect(px, sy - hh, ww, hh, 5); x.fill(); x.stroke(); x.fillStyle = '#E8E9E3'; x.fillRect(px + ww * .3, sy - hh - 6, ww * .4, 6); x.strokeRect(px + ww * .3, sy - hh - 6, ww * .4, 6); }
      else { x.fillRect(px, sy - hh * .7, ww, hh * .7); x.strokeRect(px, sy - hh * .7, ww, hh * .7); x.beginPath(); x.moveTo(px, sy - hh * .35); x.lineTo(px + ww, sy - hh * .35); x.stroke(); }
      px += ww + 6;
    }
  }
  // the merchant
  if (NPCS[SHOP_NPC] && !SPR['npcbig_' + SHOP_NPC]) regNpc(SHOP_NPC, 'npcbig_' + SHOP_NPC, 7);
  const S = SPR['npcbig_' + SHOP_NPC] || SPR['p_lamp'];
  if (S) {
    const side = $('shopSide'), open = !$('scrSShop').querySelector('.shop2').classList.contains('closed'), sw2 = open && side ? side.getBoundingClientRect().width : 0, mx = (w - sw2) / 2;
    const sz = Math.min(h * .82, (w - sw2) * .95), bob = Math.sin(t / 600) * 3, breath = 1 + Math.sin(t / 900) * .015;
    x.save(); x.translate(mx, h * .76 + bob); x.scale(1, breath);
    x.fillStyle = 'rgba(20,27,64,.25)'; x.beginPath(); x.ellipse(0, 0, sz * .32, sz * .07, 0, 0, TAU); x.fill();
    x.drawImage(S.img, -sz / 2, -sz * .92, sz, sz);
    x.restore();
  }
  // counter
  const cy = h * .74;
  x.fillStyle = COL.pink; x.fillRect(4, cy + 4, w, h - cy);
  x.fillStyle = '#B9894F'; x.fillRect(0, cy, w, h - cy);
  x.fillStyle = '#D9A86A'; x.fillRect(0, cy, w, 14);
  x.strokeStyle = COL.ink; x.lineWidth = 3; x.strokeRect(-2, cy, w + 4, h - cy + 2); x.beginPath(); x.moveTo(0, cy + 14); x.lineTo(w, cy + 14); x.stroke();
  x.lineWidth = 1.5; for (let i = 1; i < 6; i++) { x.beginPath(); x.moveTo(i * w / 6, cy + 14); x.lineTo(i * w / 6, h); x.stroke(); }
  // things on the counter
  const items = shopItems(SHOP_KIND).slice(0, 4);
  items.forEach((it, i) => { const img = shopRowIcon(it); if (img) x.drawImage(img, w * (.12 + i * .2), cy - 30, 44, 44); });
  // grain
  x.fillStyle = 'rgba(37,53,111,.05)'; for (let i = 0; i < 160; i++) x.fillRect(R() * w, R() * h, 1.5, 1.5);
}
const SROW_IMG = {};
function shopRowIcon(it) {
  const src = it.k === 'sword' ? storyIcon('sword', it.id) : it.k === 'plus' ? storyIcon('plus', it.id) : it.k === 'class' ? storyIcon('class', it.id) : storyIcon(it.k);
  if (!SROW_IMG[src]) { const im = new Image(); im.src = src; SROW_IMG[src] = im; }
  return SROW_IMG[src].complete ? SROW_IMG[src] : null;
}
function shopLoop(t) { if ($('scrSShop').hidden) { SHOP_RAF = 0; return; } shopScene(t); SHOP_RAF = requestAnimationFrame(shopLoop); }

/* ---------- the bag ---------- */
function openInventory() {
  if (G.mode !== 'story' || (STATE !== 'play' && STATE !== 'smenu')) return;
  STATE = 'smenu'; INPUT.joy = null; updMove();
  show('scrSInv'); renderInventory();
}
function invRow(icon, title, desc, btn, on, fn) {
  const row = document.createElement('div'); row.className = 'row inv';
  row.innerHTML = '<img alt="" src="' + icon + '"><div><b>' + esc(title) + '</b><p>' + esc(desc) + '</p></div>' + (btn ? '<button class="buy' + (on ? ' max' : '') + '">' + esc(btn) + '</button>' : '');
  if (btn && fn) row.querySelector('button').addEventListener('click', fn);
  return row;
}
function renderInventory() {
  const S = SAVE.story, host = $('invBody'); host.innerHTML = '';
  const sec = (title, sub) => { const d = document.createElement('div'); d.innerHTML = '<div class="label"><span class="eyebrow">' + esc(title) + '</span><span>' + esc(sub || '') + '</span></div><div class="shop"></div>'; host.appendChild(d); return d.querySelector('.shop'); };
  const sw = sec(L('칼'), L('눌러서 바꿔 든다'));
  for (const id of SWORD_ORDER) {
    if (!S.swords.includes(id)) continue;
    const d = SWORDS[id], p = S.plus[id] || 0, on = S.sword === id;
    sw.appendChild(invRow(storyIcon('sword', id), d.name + (p ? ' +' + p : ''), d.desc + ' ' + L('피해') + ' ' + Math.round(d.dmg * (1 + p * .12)), on ? L('들고 있다') : L('든다'), on, () => { S.sword = id; applyStats(); persist(); SFX.tap(); renderInventory(); }));
  }
  if (!S.swords.length) sw.innerHTML = '<p class="note">' + esc(L('아직 칼이 없다.')) + '</p>';
  const cl = sec(L('직업'), L('직업 상인 레아에게서 산다'));
  for (const id in STORY_CLASSES) {
    if (id !== 'wanderer' && !(S.classes || []).includes(id)) continue;
    const d = STORY_CLASSES[id], on = (S.cls || 'wanderer') === id;
    cl.appendChild(invRow(storyIcon('class', id), d.name, d.desc, on ? L('입고 있다') : L('입는다'), on, () => { S.cls = id; applyStats(); persist(); SFX.tap(); renderInventory(); }));
  }
  const it = sec(L('가방'), '');
  for (const k of ['potion', 'bigpotion']) if (S.items[k]) it.appendChild(invRow(storyIcon(k), ITEM_NAME[k] + ' ×' + S.items[k], k === 'potion' ? L('체력 40% 회복') : L('체력 전부 회복'), L('마신다'), false, () => { S.items[k]--; heal(P.maxHp * (k === 'bigpotion' ? 1 : .4) * (curClass().pot || 1)); SFX.heal(); persist(); renderInventory(); }));
  for (const k of ['stone', 'page', 'salt_heart', 'mushroom', 'jar', 'sentence']) if (S.items[k]) it.appendChild(invRow(storyIcon('item', k), ITEM_NAME[k] + ' ×' + S.items[k], '', null));
  if (S.charms) it.appendChild(invRow(storyIcon('charm'), ITEM_NAME.charm + ' ×' + S.charms, L('최대 체력 +15') + ' ×' + S.charms, null));
  if (!it.children.length) it.innerHTML = '<p class="note">' + esc(L('가방이 비어 있다.')) + '</p>';
}

/* ---------- waystones ---------- */
const WAYSTONES = { village: '등불 마을', forest_gate: '숲 입구', oasis: '오아시스', harbor: '얼어붙은 항구', plaza: '찢긴 광장' };
function waystoneAct(e) {
  const S = SAVE.story; S.ways = S.ways || { village: 1 };
  if (!S.ways[WD.id]) { S.ways[WD.id] = 1; persist(); SFX.portal(); ringFx(e.x, e.y, 110, '#7CC6D8', .5, 8); burst(e.x, e.y - 20, 18, '#7CC6D8', 200); banner(L('길돌이 깨어났다'), L('이제 여기로 곧장 올 수 있다'), 'good'); return; }
  const opts = Object.keys(WAYSTONES).filter(k => S.ways[k] && k !== WD.id).map(k => [AREAS[k].name, () => travelWay(k)]);
  if (!opts.length) return dialog([['', L('다른 길돌을 깨우면 이곳에서 곧장 갈 수 있다.')]]);
  opts.push([L('그만둔다'), null]);
  dialog([['', L('길돌이 웅웅거린다. 어디로 갈까.')]], opts);
}
function travelWay(k) {
  const st = AREAS[k].ents.find(e => e[0] === 'waystone');
  SFX.portal(); G.flash = .6;
  goTo(k, { x: (st[1] + .5) * TL, y: (st[2] + 1.6) * TL });
}

/* ---------- levers that clear a blocked pass, seen only from the far side ---------- */
function leverAct(e) {
  const g = e.o.g; if (gSolved(g)) return;
  SAVE.story.solved[WD.id + ':' + g] = 1; persist(); refreshBlk();
  SFX.clank(); SFX.rumble(); shake(10); buzz([30, 40, 80]);
  for (const b of WD.ents) if (b.k === 'barrier' && b.o.g === g) { burst(b.x, b.y, 22, COL.ink, 260); burst(b.x, b.y, 10, COL.yellow, 200); splat(b.x, b.y, 60, false); }
  banner(L('길이 뚫렸다'), L('이제 이쪽으로 곧장 다닐 수 있다'), 'good');
}
const BARRIER_LOOK = { 1: ['#7A5A3A', '무너진 잔해'], 2: ['#5B4632', '쓰러진 고목'], 3: ['#F2EEDF', '소금 결정 벽'], 4: ['#CFE3EA', '얼음 벽'], 5: ['#F4F1EA', '구겨진 종이 벽'] };
function drawEnt2(e, now) {
  const x = e.x, y = e.y;
  if (e.k === 'waystone') {
    const on = SAVE.story.ways && SAVE.story.ways[WD.id];
    wt();
    ctx.fillStyle = 'rgba(20,27,64,.25)'; ctx.beginPath(); ctx.ellipse(x, y + 16, 20, 7, 0, 0, TAU); ctx.fill();
    if (on) { ctx.globalAlpha = .35 + Math.sin(now * 3) * .1; spr(SP.glow, x, y - 14, 130, 130); wt(); ctx.globalAlpha = 1; }
    ctx.fillStyle = COL.pink; ctx.beginPath(); ctx.moveTo(x - 11 + 3, y + 16 + 2); ctx.lineTo(x - 7 + 3, y - 34 + 2); ctx.lineTo(x + 3, y - 42 + 2); ctx.lineTo(x + 7 + 3, y - 34 + 2); ctx.lineTo(x + 11 + 3, y + 16 + 2); ctx.fill();
    ctx.fillStyle = '#8C93A3'; ctx.beginPath(); ctx.moveTo(x - 11, y + 16); ctx.lineTo(x - 7, y - 34); ctx.lineTo(x, y - 42); ctx.lineTo(x + 7, y - 34); ctx.lineTo(x + 11, y + 16); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.strokeStyle = on ? '#7CC6D8' : 'rgba(37,53,111,.5)'; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.arc(x, y - 14, 5, 0, TAU); ctx.moveTo(x, y - 26); ctx.lineTo(x, y - 20); ctx.moveTo(x, y - 8); ctx.lineTo(x, y + 2); ctx.stroke();
    if (on) for (let k = 0; k < 3; k++) { const a = now * 1.4 + k / 3 * TAU; ctx.fillStyle = k % 2 ? COL.white : '#7CC6D8'; ctx.fillRect(x + Math.cos(a) * 18 - 2, y - 14 + Math.sin(a) * 8 - 2, 4, 4); }
    if (Math.hypot(P.x - x, P.y - y) < TL * 3) label(x, y - 56, L('길돌'), on ? COL.teal : COL.ink);
    return true;
  }
  if (e.k === 'lever') {
    const open = gSolved(e.o.g);
    wt();
    ctx.fillStyle = '#6B7185'; ctx.fillRect(x - 12, y, 24, 14); ctx.strokeStyle = COL.ink; ctx.lineWidth = 2.2; ctx.strokeRect(x - 12, y, 24, 14);
    const a = open ? .7 : -.7;
    ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, y + 4); ctx.lineTo(x + Math.sin(a) * 22, y + 4 - Math.cos(a) * 22); ctx.stroke();
    ctx.fillStyle = open ? COL.teal : COL.pink; ctx.beginPath(); ctx.arc(x + Math.sin(a) * 22, y + 4 - Math.cos(a) * 22, 5, 0, TAU); ctx.fill(); ctx.stroke();
    if (!open && Math.hypot(P.x - x, P.y - y) < TL * 3) label(x, y - 30, L('지렛대'));
    return true;
  }
  if (e.k === 'barrier') {
    if (gSolved(e.o.g)) { wt(); ctx.fillStyle = 'rgba(37,53,111,.2)'; for (let k = 0; k < 5; k++) ctx.fillRect(x - 18 + k * 8, y + 8 + (k % 2) * 6, 6, 4); return true; }
    const [col] = BARRIER_LOOK[WD.reg] || BARRIER_LOOK[1];
    wt();
    ctx.fillStyle = COL.pink; ctx.beginPath(); ctx.roundRect(x - 22 + 3, y - 18 + 3, 44, 38, 6); ctx.fill();
    ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - 22, y - 18, 44, 38, 6); ctx.fill();
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x - 16, y - 6); ctx.lineTo(x + 4, y - 12); ctx.moveTo(x - 8, y + 6); ctx.lineTo(x + 16, y + 2); ctx.moveTo(x - 2, y - 16); ctx.lineTo(x + 8, y + 14); ctx.stroke();
    return true;
  }
  return false;
}
/* PC: the E key floats over whatever you can touch */
function drawPcPrompt() {
  if (!IS_PC || STATE !== 'play' || !WD || G.trans) return;
  const a = nearAct(); if (!a || a.x === undefined) return;
  const lab = L(ACT_LABEL[a.k] || '');
  wt(); ctx.font = '800 12px "Gothic A1", "Noto Sans JP", "Noto Sans SC", system-ui, sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  const tw = ctx.measureText(lab).width, bw = 22 + 8 + tw + 10, bx = a.x - bw / 2, by = a.y - 62 + Math.sin(performance.now() / 260) * 2;
  ctx.fillStyle = COL.ink; ctx.fillRect(bx + 2, by + 2, bw, 24);
  ctx.fillStyle = COL.paper; ctx.fillRect(bx, by, bw, 24); ctx.strokeStyle = COL.ink; ctx.lineWidth = 2; ctx.strokeRect(bx, by, bw, 24);
  ctx.fillStyle = COL.yellow; ctx.fillRect(bx + 4, by + 3, 18, 18); ctx.strokeRect(bx + 4, by + 3, 18, 18);
  ctx.fillStyle = COL.ink; ctx.textAlign = 'center'; ctx.font = '900 12px "IBM Plex Mono", monospace'; ctx.fillText('E', bx + 13, by + 12.5);
  ctx.textAlign = 'left'; ctx.font = '800 12px "Gothic A1", "Noto Sans JP", "Noto Sans SC", system-ui, sans-serif'; ctx.fillText(lab, bx + 30, by + 12.5);
}

$('shopSide').addEventListener('click', e => {
  const r = $('shopSide').getBoundingClientRect();
  if (e.clientX < r.left + 4) { $('scrSShop').querySelector('.shop2').classList.toggle('closed'); SFX.tap(); }
});
$('shopSide').setAttribute('data-tab', L('상점'));

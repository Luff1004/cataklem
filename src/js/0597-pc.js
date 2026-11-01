/* ================= PC: settings, gamepad, moving through menus without a mouse ================= */
/* ---------- settings ---------- */
let SET_PREV = null;
function openSettings() {
  SET_PREV = [...document.querySelectorAll('.screen')].find(s => !s.hidden);
  SET_PREV = SET_PREV ? SET_PREV.id : null;
  show('scrSettings'); renderSettings();
}
function closeSettings() { if (SET_PREV) show(SET_PREV); else hideAll(); SET_PREV = null; }
const pct = (k, d = 1) => Math.round((SAVE[k] ?? d) * 100);
function renderSettings() {
  for (const [id, k] of [['setSfx', 'sfxVol'], ['setMus', 'musVol'], ['setShake', 'shakeAmt']]) { $(id).value = pct(k); $(id + 'V').textContent = pct(k) + '%'; }
  $('setHaptic').textContent = '진동: ' + (SAVE.haptic ? '켜짐' : '꺼짐');
  $('setFull').textContent = document.fullscreenElement ? '창 모드로' : '전체 화면';
}
function toggleFull() {
  try { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen(); } catch (e) {}
  setTimeout(renderSettings, 300);
}
for (const [id, k] of [['setSfx', 'sfxVol'], ['setMus', 'musVol'], ['setShake', 'shakeAmt']]) {
  $(id).addEventListener('input', () => {
    SAVE[k] = +$(id).value / 100; $(id + 'V').textContent = $(id).value + '%';
    setVolumes(); persist();
    if (k === 'sfxVol' && gate('setv', 120)) SFX.tap();
    if (k === 'shakeAmt' && G) shake(8);
  });
}
$('setHaptic').addEventListener('click', () => { SAVE.haptic = SAVE.haptic ? 0 : 1; persist(); syncToggles(); renderSettings(); if (SAVE.haptic) buzz(25); SFX.tap(); });
$('setFull').addEventListener('click', () => { SFX.tap(); toggleFull(); });
$('setBack').addEventListener('click', () => { SFX.tap(); closeSettings(); });
for (const id of ['btnSettings', 'pzSettings', 'smSettings']) { const b = $(id); if (b) b.addEventListener('click', () => { audioInit(); SFX.tap(); openSettings(); }); }
addEventListener('keydown', e => { if (e.key === 'F11') { e.preventDefault(); toggleFull(); } });

/* ---------- gamepad ---------- */
const PAD = { prev: [], on: false, rep: 0 };
function padPoll(dt) {
  const gps = navigator.getGamepads ? navigator.getGamepads() : [];
  let gp = null; for (const g of gps) if (g && g.connected) { gp = g; break; }
  if (!gp) { if (PAD.on) { PAD.on = false; INPUT.padx = INPUT.pady = 0; updMove(); } return; }
  const b = i => !!(gp.buttons[i] && gp.buttons[i].pressed), hit = i => b(i) && !PAD.prev[i];
  let ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
  if (Math.hypot(ax, ay) < .22) { ax = 0; ay = 0; }
  if (b(14)) ax = -1; if (b(15)) ax = 1; if (b(12)) ay = -1; if (b(13)) ay = 1;
  if (ax || ay || gp.buttons.some(x => x.pressed)) { PAD.on = true; document.body.classList.add('pad'); }
  const playing = STATE === 'play';
  INPUT.padx = playing ? ax : 0; INPUT.pady = playing ? ay : 0;
  updMove();
  if (playing) {
    if (hit(0)) { audioInit(); if (G.mode === 'story') doAct(); else useUlt(); }
    if (hit(1) || hit(4) || hit(5) || hit(7)) tryDash();
    if (hit(2) && G.mode === 'story') usePotion();
    if (hit(3) && G.mode === 'story') openStoryMap();
    if (hit(8) && G.mode === 'story') openStoryMap();
    if (hit(9)) pauseGame();
  } else if (STATE === 'talk' && !document.querySelector('#dChoices button')) {
    if (hit(0) || hit(1)) advanceDlg();
  } else if (STATE === 'intro' || STATE === 'cut') {
    if (hit(0) || hit(9)) { const bi = $('bossIntro'); if (bi && !bi.hidden) bi.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); }
  } else {
    PAD.rep -= dt;
    const dir = Math.abs(ax) > .5 || Math.abs(ay) > .5 ? (Math.abs(ax) > Math.abs(ay) ? [Math.sign(ax), 0] : [0, Math.sign(ay)]) : null;
    if (!dir) PAD.rep = 0;
    else if (PAD.rep <= 0) { navMove(dir); PAD.rep = PAD.held ? .14 : .32; PAD.held = true; }
    if (!dir) PAD.held = false;
    if (hit(0)) navPress();
    if (hit(1)) navBack();
    if (hit(3) && STATE === 'level') { const r = $('btnReroll'); if (r && !r.disabled) r.click(); }
    if (hit(9)) { if (STATE === 'pause') resumeGame(); else if (STATE === 'smenu') closeStoryScreen(); }
  }
  PAD.prev = gp.buttons.map(x => x.pressed);
}

/* ---------- menus without a mouse ---------- */
function navLayer() {
  const dlg = $('sDlg'); if (dlg && !dlg.hidden) return dlg;
  const scr = [...document.querySelectorAll('.screen')].filter(s => !s.hidden);
  return scr.length ? scr[scr.length - 1] : null;
}
function navItems(layer) {
  return [...layer.querySelectorAll('button, input[type=range], .mn')].filter(el => {
    if (el.disabled || el.closest('[hidden]')) return false;
    const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0;
  });
}
function navFocus(el) {
  document.querySelectorAll('.padfocus').forEach(x => x.classList.remove('padfocus'));
  if (!el) return;
  el.classList.add('padfocus'); el.focus({ preventScroll: true });
  el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}
function navMove(dir) {
  const layer = navLayer(); if (!layer) return;
  const items = navItems(layer); if (!items.length) return;
  let cur = document.activeElement && items.includes(document.activeElement) ? document.activeElement : null;
  if (cur && cur.type === 'range' && dir[0]) { cur.value = +cur.value + dir[0] * 5; cur.dispatchEvent(new Event('input')); return; }
  if (!cur) { navFocus(items[0]); SFX.tap(); return; }
  const r0 = cur.getBoundingClientRect(), cx = r0.x + r0.width / 2, cy = r0.y + r0.height / 2;
  let best = null, bs = 1e9;
  for (const el of items) {
    if (el === cur) continue;
    const r = el.getBoundingClientRect(), dx = r.x + r.width / 2 - cx, dy = r.y + r.height / 2 - cy;
    const along = dx * dir[0] + dy * dir[1], across = Math.abs(dx * dir[1] - dy * dir[0]);
    if (along <= 4) continue;
    const s = along + across * 2.2;
    if (s < bs) { bs = s; best = el; }
  }
  if (best) { navFocus(best); SFX.tap(); }
}
function navPress() {
  const el = document.activeElement;
  if (el && el.classList.contains('padfocus') && el.type !== 'range') { el.click(); return; }
  const layer = navLayer(); if (!layer) return;
  const items = navItems(layer); if (items.length) navFocus(items[0]);
}
function navBack() {
  const layer = navLayer(); if (!layer) return;
  if (layer.id === 'sDlg') return;
  if (STATE === 'pause') { resumeGame(); return; }
  const back = layer.querySelector('.back');
  if (back) back.click();
}
addEventListener('keydown', e => {
  if (STATE === 'play' || STATE === 'talk') return;
  const map = { arrowup: [0, -1], arrowdown: [0, 1], arrowleft: [-1, 0], arrowright: [1, 0] };
  const d = map[e.key.toLowerCase()];
  if (d) { e.preventDefault(); navMove(d); }
});
addEventListener('mousemove', () => { if (PAD.on) { document.body.classList.remove('pad'); } });

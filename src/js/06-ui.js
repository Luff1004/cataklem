/* ================= screens ================= */
const SCREENS = ['scrTitle', 'scrPrep', 'scrShop', 'scrQuest', 'scrRec', 'scrLevel', 'scrChest', 'scrPause', 'scrResult'];
function show(id) { for (const s of SCREENS) $(s).hidden = s !== id; }
function hideAll() { for (const s of SCREENS) $(s).hidden = true; }
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function banner(title, sub, kind = '') {
  const host = $('bannerHost');
  host.innerHTML = '';
  const b = document.createElement('div');
  b.className = 'banner ' + kind;
  b.innerHTML = (sub ? '<small>' + esc(sub) + '</small>' : '') + esc(title);
  host.appendChild(b);
  clearTimeout(banner.tm);
  banner.tm = setTimeout(() => { if (b.parentNode) b.remove(); }, 2700);
}

function syncToggles() {
  for (const [a, b, key] of [['tgSound', 'pzSound', 'sound'], ['tgMusic', 'pzMusic', 'music'], ['tgHaptic', 'pzHaptic', 'haptic']]) {
    $(a).setAttribute('aria-pressed', SAVE[key] ? 'true' : 'false');
    $(b).setAttribute('aria-pressed', SAVE[key] ? 'true' : 'false');
  }
}
function bindToggle(id, key) {
  $(id).addEventListener('click', () => {
    audioInit();
    SAVE[key] = SAVE[key] ? 0 : 1; persist(); setVolumes(); syncToggles();
    if (key === 'haptic' && SAVE.haptic) buzz(25);
    SFX.tap();
  });
}

/* ---------- title ---------- */
function openTitle() {
  STATE = 'title';
  $('hud').hidden = true;
  show('scrTitle');
  $('tShards').textContent = fmtNum(SAVE.shards);
  $('playSub').textContent = CHARS[SAVE.char].name + ' · 균열 ' + SAVE.rift;
  const ql = questsLeft(); $('qBadge').hidden = !ql; $('qBadge').textContent = ql;
  $('pBadge').hidden = !anyPortal();
  $('btnAgain').textContent = '한 번 더';
  AU.intensity = 0; AU.track = '';
  syncToggles();
}

/* ---------- prep ---------- */
function openPrep() {
  STATE = 'prep'; show('scrPrep'); renderPrep();
}
function renderPrep() {
  $('pShards').textContent = fmtNum(SAVE.shards);
  const host = $('chars'); host.innerHTML = '';
  for (const id in CHARS) {
    const c = CHARS[id], owned = !!SAVE.chars[id], sel = SAVE.char === id;
    const b = document.createElement('button');
    b.className = 'char' + (sel ? ' sel' : '') + (owned ? '' : ' lock') + (!owned && SAVE.shards < c.cost ? ' poor' : '');
    b.innerHTML = '<div class="pic"><img alt="" src="' + ICON['p_' + id] + '"></div><div class="tx"><b>' + esc(c.name) + '</b><span class="tg">' + esc(c.tag) + ' · ' + esc(WEAPONS[c.start].name) + '</span><p>' + esc(c.desc) + '</p></div>' +
      (owned ? '' : c.excl ? '<span class="cost excl">보스 한정</span>' : '<span class="cost"><i class="shard"></i>' + c.cost + '</span>');
    if (!owned && c.excl) { b.classList.add('excl'); b.querySelector('p').textContent = josa(GATES.find(g => g.id === c.excl).name, '을', '를') + ' 처음 쓰러뜨리면 합류한다.'; }
    b.addEventListener('click', () => {
      audioInit();
      if (!owned && c.excl) { SFX.deny(); return; }
      if (!owned) {
        if (SAVE.shards < c.cost) { SFX.deny(); b.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 220 }); return; }
        SAVE.shards -= c.cost; SAVE.chars[id] = 1; SFX.chest(); buzz(30);
      } else SFX.tap();
      SAVE.char = id; persist(); renderPrep();
    });
    host.appendChild(b);
  }
  const rh = $('rift'); rh.innerHTML = '';
  for (let i = 1; i <= 5; i++) {
    const b = document.createElement('button');
    const lk = i > SAVE.maxRift;
    b.className = (SAVE.rift === i ? 'on' : '') + (lk ? ' lk' : '');
    b.textContent = i; b.setAttribute('aria-label', '균열 ' + i + (lk ? ' 잠김' : ''));
    b.addEventListener('click', () => { if (lk) { SFX.deny(); return; } SAVE.rift = i; persist(); SFX.tap(); renderPrep(); });
    rh.appendChild(b);
  }
  const r = RIFT[SAVE.rift];
  $('riftDesc').innerHTML = SAVE.rift === 1 ? '처음 나가는 밤. 적이 아직 덜 사납다. 8분을 버티면 끝이 온다.' :
    '적 체력 <b>×' + r.hp + '</b>, 적 피해 <b>×' + r.dmg + '</b>, 수 <b>×' + r.spawn + '</b>. 대신 파편을 <b>×' + r.shard + '</b> 받는다.';
  $('goSub').textContent = CHARS[SAVE.char].name + ' · 균열 ' + SAVE.rift;
}

/* ---------- shop ---------- */
let shopTab = 'up';
function openShop(tab) { STATE = 'shop'; show('scrShop'); if (tab) shopTab = tab; setShopTab(shopTab); }
function setShopTab(tab) { shopTab = tab; for (const b of document.querySelectorAll('[data-tab]')) b.classList.toggle('on', b.dataset.tab === tab); $('tabUp').hidden = tab !== 'up'; $('tabPortal').hidden = tab !== 'portal'; if (tab === 'up') renderShop(); else renderPortals(); }
function renderShop() {
  $('sShards').textContent = fmtNum(SAVE.shards);
  const host = $('shop'); host.innerHTML = '';
  for (const it of SHOP) {
    const rank = SAVE.shop[it.id] || 0, maxed = rank >= it.max, cost = shopCost(it, rank);
    const row = document.createElement('div'); row.className = 'row';
    let pips = ''; for (let i = 0; i < it.max; i++) pips += '<i class="' + (i < rank ? 'on' : i === rank ? 'nx' : '') + '"></i>';
    row.innerHTML = '<div><b>' + esc(it.name) + '</b><p>' + esc(it.desc) + '</p><div class="pips">' + pips + '</div></div>' +
      (maxed ? '<button class="buy max" disabled>다 했다</button>' : '<button class="buy"' + (SAVE.shards < cost ? ' disabled' : '') + '><i class="shard"></i>' + cost + '</button>');
    const btn = row.querySelector('button');
    if (!maxed) btn.addEventListener('click', () => {
      if (SAVE.shards < cost) return;
      SAVE.shards -= cost; SAVE.shop[it.id] = rank + 1; persist(); SFX.pick(); buzz(20); renderShop();
    });
    host.appendChild(row);
  }
}

/* ---------- records ---------- */
function openRec() {
  STATE = 'rec'; show('scrRec');
  const s = SAVE.stats, b = SAVE.best;
  let codex = '';
  for (const id in WEAPONS) {
    const w = WEAPONS[id], got = !!s.evos[id];
    if (w.boss) continue;
    codex += '<div class="cdx' + (got ? '' : ' unk') + '"><img alt="" src="' + ICON[id + '_evo'] + '"><b>' + (got ? esc(w.evoName) : '???') + '</b><span>' +
      esc(w.name) + ' LV5 + ' + esc(PASSIVES[w.evoWith].name) + '</span></div>';
  }
  $('recBody').innerHTML =
    '<div><div class="label"><span class="eyebrow">가장 멀리 간 밤</span></div><div class="tiles">' +
    tile(fmtTime(b.time), '버틴 시간') + tile(fmtNum(b.kills), '한 판 최다 처치') + tile('LV ' + b.level, '최고 레벨') + tile(fmtNum(b.combo || 0), '최고 연쇄') + '</div></div>' +
    '<div><div class="label"><span class="eyebrow">지금까지</span></div><div class="tiles">' +
    tile(fmtNum(s.runs), '나간 밤') + tile(fmtNum(s.wins), '넘긴 밤') + tile(fmtNum(s.kills), '쓰러뜨린 것') + tile(fmtNum(s.bosses), '쓰러뜨린 거물') + '</div></div>' +
    '<div><div class="label"><span class="eyebrow">닫은 문</span></div><div class="tiles">' + GATES.map(g => tile((SAVE.bossKills[g.id] || 0) + '회', g.name)).join('') + '</div></div>' +
    '<div><div class="label"><span class="eyebrow">진화 도감</span><span>' + Object.keys(s.evos).length + ' / ' + Object.keys(WEAPONS).length + '</span></div><div class="codex">' + codex + '</div>' +
    '<p class="note">무기를 LV5까지 올리고 짝이 되는 장신구를 갖춘 채 상자를 열면 진화한다. 상자는 강한 놈과 거물이 떨군다.</p></div>';
}
const tile = (v, k) => '<div class="tile"><span class="v">' + esc(v) + '</span><span class="k">' + esc(k) + '</span></div>';

/* ---------- run flow ---------- */
let WL = null;
function startRun() {
  audioInit();
  newRun();
  STATE = 'play';
  hideAll();
  $('hud').hidden = false; $('hud').classList.remove('arena');
  $('bossBar').hidden = true;
  $('bannerHost').innerHTML = '';
  $('hint').hidden = !!SAVE.tutorial;
  G.hintT = 0;
  hudCache = {};
  renderSlots();
  INPUT.joy = null; updMove();
  try { if (navigator.wakeLock && !WL) navigator.wakeLock.request('screen').then(l => { WL = l; l.addEventListener('release', () => { WL = null; }); }).catch(() => {}); } catch (e) {}
  banner('첫째 밤', CHARS[G.char].name + ' · 균열 ' + G.rift);
}
function pauseGame() {
  if (STATE !== 'play') return;
  STATE = 'pause'; INPUT.joy = null; updMove();
  show('scrPause');
  $('pzEye').textContent = fmtTime(G.time) + ' · LV ' + G.level;
  $('pzBuild').innerHTML = buildHTML();
  $('pzStats').innerHTML =
    '<div><b>' + Math.round(P.hp) + '/' + Math.round(P.maxHp) + '</b><span>체력</span></div>' +
    '<div><b>' + Math.round(P.might * 100) + '%</b><span>피해</span></div>' +
    '<div><b>' + Math.round((1 - P.cdMul) * 100) + '%</b><span>재사용 감소</span></div>' +
    '<div><b>' + Math.round(P.area * 100) + '%</b><span>범위</span></div>' +
    '<div><b>' + Math.round(P.crit * 100) + '%</b><span>치명타</span></div>' +
    '<div><b>+' + P.amount + '</b><span>투사체</span></div>';
  resetQuit();
  syncToggles();
}
function resumeGame() { if (STATE !== 'pause') return; hideAll(); STATE = 'play'; }
function resetQuit() { const b = $('btnQuit'); b.dataset.armed = ''; b.textContent = '이번 밤은 포기한다'; }

function buildHTML() {
  let h = '';
  for (const w of G.weapons) h += '<span class="bi' + (w.evo ? ' evo' : '') + '"><img alt="" src="' + ICON[w.id + (w.evo ? '_evo' : '')] + '">' + esc(w.evo ? WEAPONS[w.id].evoName : WEAPONS[w.id].name) + '<i>' + (w.evo ? '진화' : 'LV' + w.lv) + '</i></span>';
  for (const p of G.passives) h += '<span class="bi"><img alt="" src="' + ICON[p.id] + '">' + esc(PASSIVES[p.id].name) + '<i>LV' + p.lv + '</i></span>';
  return h;
}
function renderSlots() {
  let h = '';
  for (const w of G.weapons) h += '<div class="slot' + (w.evo ? ' evo' : '') + '"><img alt="" src="' + ICON[w.id + (w.evo ? '_evo' : '')] + '"><b>' + (w.evo ? '★' : w.lv) + '</b></div>';
  for (const p of G.passives) h += '<div class="slot"><img alt="" src="' + ICON[p.id] + '"><b>' + p.lv + '</b></div>';
  $('slots').innerHTML = h;
  G.buildDirty = false;
}

/* ---------- level up ---------- */
let CHOICES = [];
function openLevel() {
  STATE = 'level'; INPUT.joy = null; updMove();
  show('scrLevel');
  G.choice = 'level'; $('lvTitle').textContent = '하나를 고른다';
  $('lvEye').textContent = 'LV ' + (G.level - G.pend + 1) + (G.pend > 1 ? ' · 남은 선택 ' + G.pend : '');
  CHOICES = rollChoices();
  renderCards();
}
function renderCards() {
  const host = $('cards'); host.innerHTML = '';
  CHOICES.forEach((o, i) => {
    const b = document.createElement('button'); b.className = 'card';
    let icon, name, lvTxt, desc, hint = '', badge = '', pips = '';
    const stp = G.choice === 'draft' ? 2 : 1;
    if (o.k === 'relic') { const D = RELICS[o.id]; icon = ICON['r_' + o.id]; name = D.name; lvTxt = '유물'; desc = D.info; badge = '<span class="badge">유물</span>'; }
    else if (o.k === 'w') {
      const D = WEAPONS[o.id], w = G.weapons.find(x => x.id === o.id), nl = w ? Math.min(D.max, w.lv + stp) : stp;
      icon = ICON[o.id]; name = D.name; lvTxt = w ? 'LV ' + nl : '무기'; desc = w ? D.ups[nl - 1] : D.info;
      if (!w) badge = '<span class="badge">새 무기</span>';
      for (let k = 0; k < D.max; k++) pips += '<i class="' + (k < nl - 1 ? 'on' : k === nl - 1 ? 'nx' : '') + '"></i>';
      const has = G.passives.some(p => p.id === D.evoWith);
      if (!D.evoWith) hint = '';
      else if (nl === D.max) hint = has ? '<span class="chint ok">진화 준비 완료 · 상자를 열면 ' + esc(D.evoName) + '</span>' : '<span class="chint">진화하려면 ' + esc(PASSIVES[D.evoWith].name) + ' 필요</span>';
      else hint = '<span class="chint">짝: ' + esc(PASSIVES[D.evoWith].name) + (has ? ' (있음)' : '') + '</span>';
    } else if (o.k === 'p') {
      const D = PASSIVES[o.id], p = G.passives.find(x => x.id === o.id), nl = p ? Math.min(D.max, p.lv + stp) : Math.min(D.max, stp);
      icon = ICON[o.id]; name = D.name; lvTxt = p ? 'LV ' + nl : '장신구'; desc = D.info;
      if (!p) badge = '<span class="badge">새것</span>';
      for (let k = 0; k < D.max; k++) pips += '<i class="' + (k < nl - 1 ? 'on' : k === nl - 1 ? 'nx' : '') + '"></i>';
      const wids = EVO_OF[o.id] || [];
      if (wids.length) { const has = wids.filter(id => G.weapons.some(x => x.id === id)); hint = '<span class="chint' + (has.length ? ' ok' : '') + '">' + wids.map(id => esc(WEAPONS[id].name)).join(', ') + '의 진화 재료' + (has.length ? ' · 지금 들고 있다' : '') + '</span>'; }
    } else if (o.k === 'heal') { icon = ICON.heal; name = '숨 돌리기'; lvTxt = ''; desc = '체력을 40% 되찾는다.'; }
    else { icon = ICON.bag; name = '파편 주머니'; lvTxt = ''; desc = '파편 +15. 끝나고 작업대에서 쓴다.'; }
    b.innerHTML = badge + '<img alt="" src="' + icon + '"><div><div class="ct"><b>' + esc(name) + '</b><span>' + esc(lvTxt) + '</span></div><p>' + esc(desc) + '</p>' +
      (pips ? '<div class="pips" style="margin-bottom:6px">' + pips + '</div>' : '') + hint + '</div>';
    b.addEventListener('animationend', () => b.classList.add('in'), { once: true });
    setTimeout(() => b.classList.add('in'), 650);
    b.addEventListener('click', () => chooseCard(i, b));
    host.appendChild(b);
  });
  $('rerollN').textContent = G.rerolls;
  $('btnReroll').disabled = G.rerolls <= 0;
  if (G.choice !== 'level') return;
  $('lvNote').textContent = G.weapons.length >= 4 && G.passives.length >= 4 ? '칸이 다 찼다. 이제 키우기만 한다.' : '무기 ' + G.weapons.length + '/4 · 장신구 ' + G.passives.length + '/4';
}
let picking = false;
function chooseCard(i, el) {
  if (picking || STATE !== 'level') return;
  picking = true;
  el.classList.add('picked'); SFX.pick(); buzz(15);
  const o = CHOICES[i];
  applyChoice(o);
  if (G.choice === 'draft' && (o.k === 'w' || o.k === 'p')) applyChoice(o);
  renderSlots();
  setTimeout(() => {
    picking = false;
    if (G.choice === 'draft') { G.draftLeft--; if (G.draftLeft > 0) openDraft(); else startIntro(); return; }
    if (G.choice === 'relic') { G.relicPend--; if (G.relicPend > 0) openRelic(); else { hideAll(); STATE = 'play'; } return; }
    G.pend--;
    if (G.pend > 0) openLevel();
    else { hideAll(); STATE = 'play'; }
  }, 170);
}

/* ---------- chest ---------- */
function openChest(boss) {
  STATE = 'chest'; INPUT.joy = null; updMove();
  show('scrChest');
  const wrap = $('chestWrap'); wrap.classList.remove('open');
  $('chestImg').src = boss ? ICON.chestBoss : ICON.chest;
  $('loot').innerHTML = ''; $('btnChest').hidden = true;
  const rewards = chestRewards(boss);
  G.buildDirty = false; G.chests++;
  SFX.thud();
  setTimeout(() => {
    wrap.classList.add('open');
    const evo = rewards.some(r => r.type === 'evo');
    evo ? SFX.evo() : SFX.chest(); buzz(evo ? [40, 40, 120] : 40);
    rewards.forEach((r, i) => {
      const d = document.createElement('div'); d.className = 'lootitem' + (r.type === 'evo' ? ' evo' : '');
      d.style.animationDelay = (i * .16) + 's';
      if (r.type === 'evo') { const D = WEAPONS[r.id]; d.innerHTML = '<img alt="" src="' + ICON[r.id + '_evo'] + '"><div><span class="eyebrow">진화 · ' + esc(D.name) + '</span><b>' + esc(D.evoName) + '</b><p>' + esc(D.evoInfo) + '</p></div>'; }
      else if (r.type === 'up') { const D = r.k === 'w' ? WEAPONS[r.id] : PASSIVES[r.id]; d.innerHTML = '<img alt="" src="' + ICON[r.id] + '"><div><b>' + esc(D.name) + ' LV ' + r.lv + '</b><p>' + esc(r.k === 'w' ? D.ups[r.lv - 1] : D.info) + '</p></div>'; }
      else d.innerHTML = '<img alt="" src="' + ICON.heal + '"><div><b>남은 것들</b><p>체력 30% 회복, 파편 +10</p></div>';
      $('loot').appendChild(d);
    });
    setTimeout(() => { $('btnChest').hidden = false; }, 300 + rewards.length * 160);
  }, 760);
}
function closeChest() {
  if (STATE !== 'chest') return;
  hideAll(); STATE = 'play'; renderSlots();
}

/* ---------- result ---------- */
function endRun(win) {
  if (G.mode === 'boss') { endBossRun(win); return; }
  STATE = 'result';
  INPUT.joy = null; updMove();
  const mins = G.time / 60;
  const base = Math.floor(G.kills / 20) + Math.floor(mins * 6) + G.bosses * 20 + (win ? 80 : 0) + G.shardsFound;
  const earned = Math.round(base * G.rf.shard);
  SAVE.shards += earned;
  const st = SAVE.stats; st.runs++; st.kills += G.kills; st.bosses += G.bosses; if (win) st.wins++;
  const nb = { time: G.time > SAVE.best.time, kills: G.kills > SAVE.best.kills, level: G.level > SAVE.best.level };
  SAVE.best.time = Math.max(SAVE.best.time, G.time); SAVE.best.kills = Math.max(SAVE.best.kills, G.kills);
  SAVE.best.level = Math.max(SAVE.best.level, G.level); SAVE.best.combo = Math.max(SAVE.best.combo || 0, G.maxCombo);
  const qGot = judgeQuests({ kills: G.kills, time: G.time, bosses: G.bosses, combo: G.maxCombo, evos: G.evoN, chests: G.chests, ults: G.ults, level: G.level });
  let unlocked = 0;
  if (win && G.rift === SAVE.maxRift && SAVE.maxRift < 5) { SAVE.maxRift++; unlocked = SAVE.maxRift; }
  SAVE.tutorial = 1;
  persist();
  if (WL) { try { WL.release(); } catch (e) {} WL = null; }
  $('hud').hidden = true;
  show('scrResult');
  AU.intensity = 0;
  const title = win ? '밤을 넘겼다' : '불씨가 꺼졌다';
  const lead = win ? '카타클렘이 쓰러졌다. 하늘 한쪽이 희미하게 밝아 온다. 그래도 내일 밤은 또 온다.' :
    (G.time < 60 ? '첫 일 분이 제일 길다. 움직임을 멈추지 말 것.' : G.time < 240 ? '거물 하나를 넘기면 다음이 보인다. 작업대에서 심지를 두껍게.' : '거의 다 왔다. 무기를 진화시키면 밤이 짧아진다.');
  const best = k => nb[k] ? '<span class="stamp-new">신기록</span>' : '';
  const nextChar = Object.keys(CHARS).find(id => !SAVE.chars[id]);
  $('resBody').innerHTML =
    '<div><span class="eyebrow">' + (win ? '균열 ' + G.rift + ' 돌파' : fmtTime(G.time) + '에서 멈춤') + '</span>' +
    '<h2 class="big"><span class="pk" aria-hidden="true">' + title + '</span><span class="ik">' + title + '</span></h2></div>' +
    '<p class="lead">' + lead + '</p>' +
    '<div class="earn"><div><span class="eyebrow">받은 파편</span><small>처치, 시간, 거물' + (G.rf.shard > 1 ? ', 균열 ×' + G.rf.shard : '') + '</small></div><span class="v"><i class="shard"></i><b id="earnN">0</b></span></div>' +
    '<div class="tiles">' + tile(fmtTime(G.time), '버틴 시간') + tile(fmtNum(G.kills), '처치') + tile('LV ' + G.level, '레벨') + tile(G.bosses + ' / 4', '쓰러뜨린 거물') + '</div>' +
    '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:-6px">' + (nb.time ? '<span class="stamp-new">최장 생존</span>' : '') + (nb.kills ? '<span class="stamp-new">최다 처치</span>' : '') + (nb.level ? '<span class="stamp-new">최고 레벨</span>' : '') + '</div>' +
    (qGot.length ? '<div class="qdone">' + qGot.map(q => '<div>의뢰 완료 · ' + esc(QUESTS[q.id].txt(q.goal)) + '<span>+' + q.reward + '</span></div>').join('') + '</div>' : '') +
    (unlocked ? '<div class="unlock">균열 ' + unlocked + ' 단계가 열렸다. 더 사나운 밤, 더 많은 파편.</div>' : '') +
    '<div><div class="label"><span class="eyebrow">이번 밤의 장비</span></div><div class="build">' + buildHTML() + '</div></div>' +
    '<p class="note">가진 파편 ' + fmtNum(SAVE.shards) + (nextChar ? ' · 다음 불씨 ' + CHARS[nextChar].name + '까지 ' + Math.max(0, CHARS[nextChar].cost - SAVE.shards) : '') + '</p>';
  void best;
  const el = $('earnN'), t0 = performance.now(), dur = 900;
  const tick = now => { const p = Math.min(1, (now - t0) / dur), v = Math.round(earned * (1 - Math.pow(1 - p, 3))); el.textContent = fmtNum(v); if (p < 1) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  if (!win) setTimeout(() => SFX.chest(), 400);
}

/* ---------- HUD ---------- */
let hudCache = {};
function updateHUD() {
  const xp = clamp(G.xp / G.need, 0, 1);
  if (Math.abs((hudCache.xp ?? -1) - xp) > .003) { $('xpFill').style.width = (xp * 100).toFixed(1) + '%'; hudCache.xp = xp; }
  const sec = Math.floor(G.time);
  if (hudCache.sec !== sec) { $('clock').textContent = fmtTime(sec); hudCache.sec = sec; }
  if (hudCache.kills !== G.kills) { $('kills').textContent = fmtNum(G.kills); hudCache.kills = G.kills; }
  if (hudCache.lv !== G.level) { $('lvB').textContent = G.mode === 'boss' ? G.gate.ord : 'LV ' + G.level; hudCache.lv = G.level; }
  const up = Math.floor(G.ult / G.ultNeed * 100);
  if (hudCache.ult !== up) {
    const b = $('btnUlt'); b.style.setProperty('--p', up); b.classList.toggle('ready', up >= 100); hudCache.ult = up;
    if (up >= 100 && !G.ultTold && !SAVE.ultSeen) { G.ultTold = true; banner('섬광이 찼다', '오른쪽 아래 원을 눌러라', 'good'); }
  }
  if (G.mode === 'boss') { const cd = P.dashCd > 0 ? Math.round((1 - P.dashCd / (1.5 * G.rel.dashCd * (P.dashMul || 1))) * 100) : 100; if (hudCache.dash !== cd) { const b = $('btnDash'); b.style.setProperty('--p', cd); b.classList.toggle('ready', cd >= 100); hudCache.dash = cd; } }
  if (G.boss) { const r = Math.max(0, (G.boss.share || G.boss).hp / G.boss.maxHp); if (Math.abs((hudCache.boss ?? -1) - r) > .002) { $('bossFill').style.width = (r * 100).toFixed(1) + '%'; hudCache.boss = r; } }
  const comboOn = G.combo >= 10;
  if (hudCache.combo !== G.combo) { $('comboN').textContent = G.combo; $('combo').classList.toggle('on', comboOn); hudCache.combo = G.combo; }
  if (G.buildDirty) renderSlots();
  if (G.hintT > 0) { G.hintT -= 1 / 60; if (G.hintT <= 0) $('hint').hidden = true; }
}

/* ================= input ================= */
function updMove() {
  const j = INPUT.joy; let mx = 0, my = 0;
  if (j) { const dx = j.x - j.ox, dy = j.y - j.oy, d = Math.hypot(dx, dy); if (d > 5) { const m = Math.min(1, (d - 5) / 30); mx = dx / d * m; my = dy / d * m; } }
  const k = INPUT.keys;
  const kx = (k.d || k.arrowright ? 1 : 0) - (k.a || k.arrowleft ? 1 : 0), ky = (k.s || k.arrowdown ? 1 : 0) - (k.w || k.arrowup ? 1 : 0);
  if (kx || ky) { const l = Math.hypot(kx, ky); mx = kx / l; my = ky / l; }
  INPUT.mx = mx; INPUT.my = my;
}
cv.addEventListener('pointerdown', e => {
  audioInit();
  if (STATE !== 'play' || INPUT.joy) return;
  INPUT.joy = { id: e.pointerId, ox: e.clientX, oy: e.clientY, x: e.clientX, y: e.clientY };
  try { cv.setPointerCapture(e.pointerId); } catch (_) {}
  updMove(); e.preventDefault();
});
cv.addEventListener('pointermove', e => {
  const j = INPUT.joy; if (!j || j.id !== e.pointerId) return;
  j.x = e.clientX; j.y = e.clientY;
  const dx = j.x - j.ox, dy = j.y - j.oy, d = Math.hypot(dx, dy), R = 56;
  if (d > R) { j.ox = j.x - dx / d * R; j.oy = j.y - dy / d * R; }
  updMove();
});
const endJoy = e => { const j = INPUT.joy; if (j && j.id === e.pointerId) { INPUT.joy = null; updMove(); } };
cv.addEventListener('pointerup', endJoy);
cv.addEventListener('pointercancel', endJoy);
cv.addEventListener('lostpointercapture', endJoy);
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('touchmove', e => { if (!e.target.closest || !e.target.closest('.scroll')) e.preventDefault(); }, { passive: false });
document.addEventListener('gesturestart', e => e.preventDefault());
addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  INPUT.keys[k] = true; updMove();
  if (k === ' ' && STATE === 'play') { useUlt(); e.preventDefault(); }
  if (k === 'shift' || k === 'k') tryDash();
  if (k === 'escape') { if (STATE === 'play') pauseGame(); else if (STATE === 'pause') resumeGame(); }
  if (STATE === 'level' && ['1', '2', '3', '4'].includes(k)) { const i = +k - 1, el = $('cards').children[i]; if (el && CHOICES[i]) chooseCard(i, el); }
});
addEventListener('keyup', e => { INPUT.keys[e.key.toLowerCase()] = false; updMove(); });
addEventListener('blur', () => { INPUT.keys = {}; INPUT.joy = null; updMove(); });
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { if (STATE === 'play') pauseGame(); if (AU.ctx && AU.ctx.state === 'running') AU.ctx.suspend().catch(() => {}); }
  else if (AU.ctx) AU.ctx.resume().catch(() => {});
});
addEventListener('resize', resize);
document.addEventListener('pointerdown', () => audioInit(), { passive: true });
document.addEventListener('touchend', () => audioInit(), { passive: true });

/* buttons */
$('btnPlay').addEventListener('click', () => { audioInit(); SFX.tap(); openPrep(); });
$('btnShop').addEventListener('click', () => { audioInit(); SFX.tap(); openShop(); });
$('btnRec').addEventListener('click', () => { audioInit(); SFX.tap(); openRec(); });
$('btnQuest').addEventListener('click', () => { audioInit(); SFX.tap(); openQuest(); });
$('btnGo').addEventListener('click', () => { SFX.tap(); startRun(); });
document.querySelectorAll('[data-back]').forEach(b => b.addEventListener('click', () => { SFX.tap(); openTitle(); }));
$('btnPause').addEventListener('click', () => { SFX.tap(); pauseGame(); });
$('btnResume').addEventListener('click', () => { SFX.tap(); resumeGame(); });
$('btnQuit').addEventListener('click', () => {
  const b = $('btnQuit');
  if (!b.dataset.armed) { b.dataset.armed = '1'; b.textContent = '정말 포기한다 (한 번 더 누르기)'; SFX.deny(); return; }
  endRun(false);
});
$('btnUlt').addEventListener('click', () => useUlt());
$('btnDash').addEventListener('pointerdown', e => { e.stopPropagation(); e.preventDefault(); tryDash(); });
$('bossIntro').addEventListener('pointerdown', () => skipIntro());
document.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => { SFX.tap(); setShopTab(b.dataset.tab); }));
$('btnPortalChip').addEventListener('click', () => { audioInit(); SFX.tap(); openShop('portal'); });
$('btnUlt').addEventListener('pointerdown', e => e.stopPropagation());
$('btnReroll').addEventListener('click', () => { if (G.rerolls <= 0 || picking) return; G.rerolls--; SFX.swish(); CHOICES = G.choice === 'relic' ? relicChoices() : rollChoices(); renderCards(); });
$('btnChest').addEventListener('click', () => { SFX.tap(); closeChest(); });
$('btnHome').addEventListener('click', () => { SFX.tap(); $('hud').classList.remove('arena'); openTitle(); });
$('btnAgain').addEventListener('click', () => { SFX.tap(); if (G && G.mode === 'boss') openShop('portal'); else startRun(); });
bindToggle('tgSound', 'sound'); bindToggle('tgMusic', 'music'); bindToggle('tgHaptic', 'haptic');
bindToggle('pzSound', 'sound'); bindToggle('pzMusic', 'music'); bindToggle('pzHaptic', 'haptic');

/* ================= main loop ================= */
let last = performance.now(), perfAcc = 0, perfN = 0, perfChecked = 0;
function frame(now) {
  requestAnimationFrame(frame);
  const rdt = Math.min(.05, Math.max(0, (now - last) / 1000)); last = now;
  if (STATE === 'intro') { updateIntro(rdt); render(rdt); return; }
  if (STATE === 'cut') { updateCut(rdt); render(rdt); updateHUD(); return; }
  if (STATE === 'play' || STATE === 'dying' || STATE === 'winning') {
    if (G.hitstop > 0) G.hitstop -= rdt;
    else {
      let ts = 1;
      if (G.slowT > 0) { G.slowT -= rdt; ts = .3; }
      if (STATE === 'dying') ts = .3;
      step(rdt * ts);
    }
    if (STATE === 'dying') { G.dieT -= rdt; if (G.dieT <= 0) endRun(false); }
    else if (STATE === 'winning') { G.winT -= rdt; if (G.winT <= 0) endRun(true); }
    else if (STATE === 'play') {
      if (G.wantChest.length) openChest(G.wantChest.shift());
      else if (G.pend > 0) openLevel();
      else if (G.relicPend > 0 && G.relicDelay <= 0) openRelic();
    }
    if (STATE !== 'result') { render(rdt); updateHUD(); }
    // drop resolution once if the phone struggles
    if (!perfChecked && STATE === 'play') {
      perfAcc += rdt; perfN++;
      if (perfN >= 150) { if (perfAcc / perfN > .024 && QUALITY === 1) { QUALITY = .72; resize(); } perfAcc = 0; perfN = 0; if (G.time > 60) perfChecked = 1; }
    }
  } else if (G && (STATE === 'level' || STATE === 'chest' || STATE === 'pause' || (STATE === 'wipe' && G.mode === 'boss'))) {
    render(0);
  } else {
    renderTitle(rdt);
  }
}

function boot() {
  resize();
  buildArt();
  initAttract();
  openTitle();
  requestAnimationFrame(t => { last = t; frame(t); });
}
boot();

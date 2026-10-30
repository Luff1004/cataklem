/* ================= workshop portals, draft, relics, intro, boss results ================= */
const LOCAL = !!window.CATAKLEM_LOCAL;
function gateOpen(i) { return LOCAL || i === 0 || (SAVE.bossKills[GATES[i - 1].id] || 0) > 0; }
function anyPortal() { return LOCAL || GATES.some(g => SAVE.portals[g.id]); }

function renderPortals() {
  const host = $('portals'); host.innerHTML = '';
  $('sShards').textContent = fmtNum(SAVE.shards);
  GATES.forEach((g, i) => {
    const open = gateOpen(i), crafted = LOCAL || !!SAVE.portals[g.id], kills = SAVE.bossKills[g.id] || 0;
    const coreOk = !g.core || (SAVE.cores[g.core] || 0) >= 1, afford = SAVE.shards >= g.cost;
    const card = document.createElement('div');
    card.className = 'portal' + (open ? '' : ' locked') + (crafted ? ' ready' : '');
    const cls = CHARS[g.cls];
    const req = '<span class="req"><i class="shard"></i>' + g.cost + (g.core ? ' · <img alt="" src="' + ICON.core + '">' + esc(CORE_NAME[g.core]) + ' ' + (SAVE.cores[g.core] || 0) + '/1' : '') + '</span>';
    let btn;
    if (!open) btn = '<button class="buy" disabled>잠김</button>';
    else if (crafted) btn = '<button class="buy go" data-go>들어간다</button>';
    else btn = '<button class="buy" data-craft' + (afford && coreOk ? '' : ' disabled') + '>제작</button>';
    card.innerHTML =
      '<div class="pimg"><i></i><img alt="" src="' + ICON['g_' + g.id] + '">' + (g.id === 'twins' ? '<img class="b2" alt="" src="' + ICON.g_twinsB + '">' : '') + '</div>' +
      '<div class="ptx"><span class="eyebrow">' + esc(g.ord) + (kills ? ' · 격파 ' + kills + '회' : '') + '</span><b>' + (open ? esc(g.name) : '???') + '</b>' +
      '<p>' + (open ? esc(g.sub) + '. ' + esc(g.line) : esc(josa(GATES[i - 1].name, '을', '를')) + ' 쓰러뜨리면 문의 위치가 보인다.') + '</p>' +
      (open ? '<div class="prow">' + req + btn + '</div><span class="rew">' + (kills ? '다시 잡으면 파편 ' + Math.round(g.reward * .4) + ', ' + esc(CORE_NAME[g.id]) : '첫 격파: 파편 ' + g.reward + ', ' + esc(CORE_NAME[g.id]) + ', 직업 <b>' + esc(cls.name) + '</b>') + '</span>' : '') +
      '<div class="forge"><i></i></div></div>';
    const cb = card.querySelector('[data-craft]');
    if (cb) cb.addEventListener('click', () => craftPortal(g, card));
    const gb = card.querySelector('[data-go]');
    if (gb) gb.addEventListener('click', () => { SFX.portal(); startBossFlow(g.id); });
    host.appendChild(card);
  });
}
let forging = false;
function craftPortal(g, card) {
  if (forging || SAVE.shards < g.cost || (g.core && (SAVE.cores[g.core] || 0) < 1)) return;
  forging = true;
  SAVE.shards -= g.cost; if (g.core) SAVE.cores[g.core]--; persist();
  $('sShards').textContent = fmtNum(SAVE.shards);
  card.classList.add('forging');
  for (let i = 0; i < 6; i++) setTimeout(() => { SFX.clank(); buzz(12); card.classList.remove('hit'); void card.offsetWidth; card.classList.add('hit'); }, 120 + i * 260);
  setTimeout(() => {
    SAVE.portals[g.id] = 1; persist(); SFX.portal(); buzz([30, 30, 80]);
    forging = false; renderPortals();
    const c = $('portals').children[GATES.indexOf(g)]; if (c) c.classList.add('born');
  }, 1800);
}

/* ---------- into the gate ---------- */
let wipeBusy = false;
function wipe(mid) {
  const w = $('wipe'); wipeBusy = true;
  w.hidden = false; w.className = 'in';
  setTimeout(() => { mid(); w.className = 'out'; setTimeout(() => { w.hidden = true; w.className = ''; wipeBusy = false; }, 650); }, 600);
}
function startBossFlow(id) {
  audioInit();
  if (!LOCAL) { SAVE.portals[id] = 0; persist(); }
  STATE = 'wipe';
  wipe(() => {
    setupBossRun(id);
    $('hud').hidden = true; hudCache = {};
    openDraft();
  });
}
function openDraft() {
  STATE = 'level'; G.choice = 'draft'; INPUT.joy = null; updMove();
  show('scrLevel');
  $('lvEye').textContent = G.gate.ord + ' · 준비 ' + (G.draftMax - G.draftLeft + 1) + ' / ' + G.draftMax;
  $('lvTitle').textContent = '무장을 고른다';
  CHOICES = rollChoices(); renderCards();
  $('lvNote').textContent = '고른 것은 두 단계씩 오른다. ' + G.gate.tip;
}
function openRelic() {
  STATE = 'level'; G.choice = 'relic'; INPUT.joy = null; updMove();
  show('scrLevel');
  $('lvEye').textContent = G.gate.name + ' · ' + (G.boss ? G.boss.phase : 2) + '막';
  $('lvTitle').textContent = '유물을 고른다';
  CHOICES = relicChoices(); renderCards();
  $('lvNote').textContent = '거물이 흘린 것. 이 문 안에서만 힘을 쓴다.';
}

function beginFight() {
  const bi = $('bossIntro'); bi.hidden = true; bi.className = '';
  for (const e of E) e.introScale = 1;
  STATE = 'play';
  $('hud').hidden = false; $('hud').classList.add('arena');
  $('bossBar').hidden = false; $('hint').hidden = true;
  renderSlots(); hudCache = {};
  AU.intensity = 3;
  if (G.u) { AU.track = 'unknown'; AU.uPhase = 1; }
  banner(G.gate.name, '싸워라', 'warn');
  G.boss.cd = 1.2;
}

/* ---------- after the gate ---------- */
function endBossRun(win) {
  STATE = 'result'; AU.track = '';
  $('cutscene').hidden = true;
  INPUT.joy = null; updMove();
  const g = G.gate, first = win && !(SAVE.bossKills[g.id] > 0);
  const hpLeft = G.boss ? Math.max(0, (G.boss.share || G.boss).hp / G.boss.maxHp) : 0;
  const shards = win ? (first ? g.reward : Math.round(g.reward * .4)) : Math.round(g.reward * .25 * (1 - hpLeft));
  SAVE.shards += shards;
  if (win) { SAVE.bossKills[g.id] = (SAVE.bossKills[g.id] || 0) + 1; SAVE.cores[g.id] = (SAVE.cores[g.id] || 0) + 1; if (first) SAVE.chars[g.cls] = 1; SAVE.stats.bosses++; }
  persist();
  if (WL) { try { WL.release(); } catch (e) {} WL = null; }
  $('hud').hidden = true; $('hud').classList.remove('arena');
  show('scrResult');
  AU.intensity = 0;
  $('btnAgain').textContent = '작업대로';
  const title = win ? '격파' : '쓰러졌다';
  const cls = CHARS[g.cls];
  let rew = '<div class="earn"><div><span class="eyebrow">받은 파편</span><small>' + (win ? (first ? '첫 격파 보상' : '다시 잡은 보상') : '남긴 상처만큼') + '</small></div><span class="v"><i class="shard"></i><b id="earnN">0</b></span></div>';
  if (win) rew += '<div class="loot2"><img alt="" src="' + ICON.core + '"><div><span class="eyebrow">제작 재료</span><b>' + esc(CORE_NAME[g.id]) + ' +1</b><p>' + (GATES[GATES.indexOf(g) + 1] ? '다음 포탈, ' + esc(GATES[GATES.indexOf(g) + 1].ord) + '을 만드는 데 쓴다.' : '모든 문을 닫았다. 모아 두면 언젠가 쓸 데가 생긴다.') + '</p></div></div>';
  if (first) rew += '<div class="loot2 cls"><img alt="" src="' + ICON['p_' + g.cls] + '"><div><span class="eyebrow">보스 한정 직업 합류</span><b>' + esc(cls.name) + '</b><p>' + esc(cls.desc) + ' ' + esc(cls.tag) + '.</p></div></div>';
  $('resBody').innerHTML =
    '<div><span class="eyebrow">' + esc(g.ord) + ' · ' + esc(g.name) + '</span>' +
    '<h2 class="big"><span class="pk" aria-hidden="true">' + title + '</span><span class="ik">' + title + '</span></h2></div>' +
    '<p class="lead">' + (win ? esc(josa(g.name, '이', '가')) + ' 무너졌다. 문이 닫히고, 남은 것은 손에 쥔 것뿐이다.' : '거물의 체력이 ' + Math.round(hpLeft * 100) + '% 남았다. 포탈은 닫혔다. 다시 만들어 오면 된다.') + '</p>' +
    rew +
    '<div class="tiles">' + tile(fmtTime(G.fightT), '싸운 시간') + tile(Math.round((1 - hpLeft) * 100) + '%', '깎아 낸 체력') + tile(fmtNum(G.dmgDealt), '거물에게 준 피해') + tile(G.relics.length + '개', '얻은 유물') + '</div>' +
    (G.relics.length ? '<div><div class="label"><span class="eyebrow">유물</span></div><div class="build">' + G.relics.map(r => '<span class="bi"><img alt="" src="' + ICON['r_' + r] + '">' + esc(RELICS[r].name) + '</span>').join('') + '</div></div>' : '') +
    '<div><div class="label"><span class="eyebrow">들고 간 장비</span></div><div class="build">' + buildHTML() + '</div></div>';
  const el = $('earnN'), t0 = performance.now();
  const tick = now => { const p = Math.min(1, (now - t0) / 900); el.textContent = fmtNum(Math.round(shards * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
}

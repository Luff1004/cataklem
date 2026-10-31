/* ================= story mode: the map ================= */
/* where each step of the main road happens */
const STEP_AT = {
  got_wood: 'village', field_done: 'field', well_open: 'village', momo_found: 'well', scribble: 'village', beat_colossus: 'ruins', gate_bell: 'belltower',
  cave_lit: 'mushroom_cave', beat_owl: 'owl_nest', beat_oak: 'oak_hollow', gate_loom: 'loom_hut', beat_grove: 'grove_heart',
  beat_golem: 'mine_deep', got_salt: 'oasis', beat_vulture: 'bone_canyon', beat_mirage: 'salt_flats', gate_sun: 'sun_altar', beat_sandking: 'sink_pit',
  beat_lighthouse: 'lighthouse', got_ice: 'harbor', beat_orca: 'graveyard', gate_tide: 'tide_gate', beat_leviathan: 'leviathan_bay',
  beat_quill: 'ink_river', got_ink: 'plaza', beat_pagegiant: 'paper_maze', beat_stamp: 'stamp_office', gate_judge: 'court', gate_root: 'root_hollow', gate_sky: 'sky_stair',
  beat_author: 'author_desk', beat_cata: 'sky_edge', got_scrib: 'sky_edge', gate_unknown: 'sky_edge', story_done: 'village',
};
const MAP_CW = 118, MAP_CH = 66;
let MAP_L = null;
function areaEnts(id) {
  const A = AREAS[id], out = (A.ents || []).map(([k, tx, ty, o]) => ({ k, tx, ty, o: o || {} }));
  if (A.legend && A.map) A.map.forEach((row, y) => row.split('').forEach((ch, x) => { const L = A.legend[ch]; if (L) out.push({ k: L[0], tx: x, ty: y, o: L[1] || {} }); }));
  return out;
}
function areaLinks(id) {
  const A = AREAS[id], out = [];
  for (const s in (A.exits || {})) { const v = A.exits[s]; out.push({ to: Array.isArray(v) ? v[0] : v, dir: s }); }
  for (const e of areaEnts(id)) if (e.k === 'door') out.push({ to: e.o.to, dir: 'D' });
  return out;
}
function mapLayout() {
  if (MAP_L) return MAP_L;
  const D = { W: [-1, 0], E: [1, 0], N: [0, -1], S: [0, 1], D: [1, -1] };
  const pos = { village: [0, 0] }, used = { '0,0': 1 }, edges = [], q = ['village'], seenE = {};
  while (q.length) {
    const id = q.shift();
    for (const l of areaLinks(id)) {
      const key = [id, l.to].sort().join('|');
      if (!seenE[key]) { seenE[key] = 1; edges.push({ a: id, b: l.to, door: l.dir === 'D' }); }
      if (pos[l.to] || !AREAS[l.to]) continue;
      const d = D[l.dir], [bx, by] = [pos[id][0] + d[0], pos[id][1] + d[1]];
      let best = null;
      for (let r = 0; r < 6 && !best; r++) for (let dy = -r; dy <= r && !best; dy++) for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const x = bx + dx * (d[1] ? 1 : 0) + (d[0] ? dx : 0), y = by + dy;
        if (!used[x + ',' + y]) { best = [x, y]; break; }
      }
      pos[l.to] = best; used[best[0] + ',' + best[1]] = 1; q.push(l.to);
    }
  }
  let mx = 0, my = 0, Mx = 0, My = 0;
  for (const k in pos) { mx = Math.min(mx, pos[k][0]); my = Math.min(my, pos[k][1]); Mx = Math.max(Mx, pos[k][0]); My = Math.max(My, pos[k][1]); }
  for (const k in pos) pos[k] = [(pos[k][0] - mx) * MAP_CW + 70, (pos[k][1] - my) * MAP_CH + 40];
  MAP_L = { pos, edges, w: (Mx - mx) * MAP_CW + 140, h: (My - my) * MAP_CH + 80 };
  return MAP_L;
}
function goalArea() { const st = STORY_STEPS.find(s => !sf(s.f)); return st ? STEP_AT[st.f] : null; }
function areaInfo(id) {
  const S = SAVE.story, ents = areaEnts(id), A = AREAS[id];
  const torch = ents.find(e => e.k === 'torch'), lit = torch && S.lit[id + ':' + torch.tx + ',' + torch.ty];
  const boss = ents.find(e => e.k === 'boss'), portal = ents.find(e => e.k === 'portal');
  const chests = ents.filter(e => e.k === 'chest' && !S.opened[e.o.id]).length;
  const npcs = ents.filter(e => e.k === 'npc' && (!e.o.if || allf(e.o.if)) && (!e.o.unless || !sf(e.o.unless))).map(e => e.o.id);
  const side = (typeof SIDE_QUESTS !== 'undefined' ? SIDE_QUESTS : []).filter(q => q.at === id && !sf(q.f));
  return { torch, lit, boss, portal, chests, npcs, side, A };
}
let MAP_SEL = null;
function openStoryMap() {
  if (G.mode !== 'story' || (STATE !== 'play' && STATE !== 'smenu')) return;
  STATE = 'smenu'; INPUT.joy = null; updMove();
  show('scrSMap'); MAP_SEL = WD.id; renderStoryMap(true);
}
function renderStoryMap(center) {
  const S = SAVE.story, L = mapLayout(), goal = goalArea(), here = WD.id;
  const vis = id => S.seen[id] || id === goal;
  const fog = id => !vis(id) && L.edges.some(e => (e.a === id && S.seen[e.b]) || (e.b === id && S.seen[e.a]));
  let svg = '<svg width="' + L.w + '" height="' + L.h + '">';
  for (const e of L.edges) {
    const a = L.pos[e.a], b = L.pos[e.b]; if (!a || !b) continue;
    const va = vis(e.a) || fog(e.a), vb = vis(e.b) || fog(e.b);
    if (!(va && vb) || (!S.seen[e.a] && !S.seen[e.b])) continue;
    svg += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="#25356F" stroke-width="' + (e.door ? 2 : 3.5) + '"' + (e.door ? ' stroke-dasharray="5 5"' : '') + ' opacity="' + (S.seen[e.a] && S.seen[e.b] ? .85 : .3) + '"/>';
  }
  svg += '</svg>';
  let nodes = '';
  for (const id in L.pos) {
    const v = vis(id), fg = fog(id);
    if (!v && !fg) continue;
    const [x, y] = L.pos[id], A = AREAS[id];
    if (!v) { nodes += '<button class="mn fog" style="left:' + x + 'px;top:' + y + 'px" data-a="' + id + '">?</button>'; continue; }
    const I = areaInfo(id), mk = [];
    if (I.lit) mk.push('<i class="b-t" title="횃불"></i>');
    if (I.boss && !sf('beat_' + I.boss.o.id) && S.seen[id]) mk.push('<i class="b-b" title="보스"></i>');
    if (I.portal && !sf('gate_' + I.portal.o.gate) && S.seen[id]) mk.push('<i class="b-p" title="문"></i>');
    if (I.side.length && S.seen[id]) mk.push('<i class="b-q">!</i>');
    nodes += '<button class="mn r' + A.reg + (id === here ? ' here' : '') + (id === goal ? ' goal' : '') + (id === MAP_SEL ? ' sel' : '') + (S.seen[id] ? '' : ' unseen') + '" style="left:' + x + 'px;top:' + y + 'px" data-a="' + id + '">' + esc(A.name) + (mk.length ? '<span class="mk">' + mk.join('') + '</span>' : '') + '</button>';
  }
  const inner = $('mapIn');
  inner.style.width = L.w + 'px'; inner.style.height = L.h + 'px';
  inner.innerHTML = svg + nodes;
  inner.querySelectorAll('.mn').forEach(b => b.addEventListener('click', () => { SFX.tap(); MAP_SEL = b.dataset.a; renderStoryMap(false); }));
  renderMapInfo();
  if (center) { const wrap = $('mapWrap'), p = L.pos[here]; requestAnimationFrame(() => { wrap.scrollLeft = p[0] - wrap.clientWidth / 2; wrap.scrollTop = p[1] - wrap.clientHeight / 2; }); }
  $('mapSeen').textContent = Object.keys(S.seen).length + ' / ' + Object.keys(AREAS).length;
}
function renderMapInfo() {
  const id = MAP_SEL, S = SAVE.story, host = $('mapInfo');
  if (!id || !AREAS[id]) { host.innerHTML = ''; return; }
  const A = AREAS[id], goal = goalArea();
  if (!S.seen[id] && id !== goal) { host.innerHTML = '<b>아직 가 보지 않은 곳</b><p>' + esc(REG[A.reg].name) + ' 어딘가.</p>'; return; }
  const I = areaInfo(id), lines = [];
  if (id === goal) { const st = STORY_STEPS.find(s => !sf(s.f)); lines.push('<span class="goal">할 일: ' + esc(st.t) + '</span>'); }
  if (S.seen[id]) {
    if (I.boss) lines.push(esc(BOSS[I.boss.o.id].name) + (sf('beat_' + I.boss.o.id) ? ' · 쓰러뜨림' : ' · 아직 살아 있다'));
    if (I.portal) { const g = GATES.find(x => x.id === I.portal.o.gate); lines.push(esc(g.name) + '의 문' + (sf('gate_' + g.id) ? ' · 닫음' : ' · 열려 있다')); }
    if (I.npcs.length) lines.push(I.npcs.map(n => esc(NPCS[n].name)).join(', '));
    for (const q of I.side) lines.push('곁일: ' + esc(q.t));
    if (I.chests) lines.push('열지 않은 상자 ' + I.chests + '개');
    if (I.torch) lines.push(I.lit ? '횃불이 켜져 있다' : '꺼진 횃불이 있다');
  }
  const canGo = I.lit && id !== WD.id && !WD.bossLock && !WD.locked;
  host.innerHTML = '<div class="mi-h"><b>' + esc(A.name) + '</b><span>' + esc(REG[A.reg].name) + (id === WD.id ? ' · 지금 여기' : '') + '</span></div>' +
    (lines.length ? '<p>' + lines.join('<br>') + '</p>' : '<p>특별한 것은 없다.</p>') +
    (canGo ? '<button class="btn" id="mapGo">이 횃불로 간다</button>' : I.lit && id !== WD.id ? '<p class="note">싸우는 중에는 떠날 수 없다.</p>' : '');
  const go = $('mapGo');
  if (go) go.addEventListener('click', () => {
    SFX.portal(); const t = I.torch;
    closeStoryScreen();
    goTo(id, { x: (t.tx + .5) * TL, y: (t.ty + 1.4) * TL });
  });
}

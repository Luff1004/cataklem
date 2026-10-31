/* ================= story mode: side roads in every region ================= */
const lampGrid = (x0, y0, g, on) => { const out = []; for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) out.push(['lamp', x0 + i * 2, y0 + j * 2, { g, i, j, on: on.includes(j * 3 + i) ? 1 : 0 }]); return out; };
const ICE_LAKE = (() => {
  const rows = [];
  for (let y = 0; y < 18; y++) {
    let r = '';
    for (let x = 0; x < 26; x++) {
      let c = '.';
      if (y === 0 || x === 0 || x === 25) c = '#';
      else if (y === 17) c = x >= 12 && x <= 14 ? 'v' : '#';
      else if (y === 1 || x === 1 || x === 24) c = y >= 15 ? '.' : '~';
      else if (y <= 14) c = 'i';
      r += c;
    }
    rows.push(r.split(''));
  }
  for (const [x, y] of [[13, 3], [8, 2], [12, 8], [7, 9], [18, 5], [20, 11], [4, 12], [16, 13], [21, 3]]) rows[y][x] = 'o';
  rows[2][12] = 'K'; rows[15][10] = 'S';
  return rows.map(r => r.join(''));
})();

Object.assign(AREAS, {
  /* region 1 */
  orchard: { name: '과수원', reg: 1, w: 26, h: 18, dens: .14, seed: 101, exits: { E: 'village', N: 'mill' }, mobs: [['moth', 6], ['blob', 4]],
    ents: [['npc', 8, 8, { id: 'maru' }], ['pot', 4, 4], ['pot', 5, 4], ['chest', 3, 15, { id: 'or_page', item: 'page' }], ['sign', 10, 12, { text: '사과나무가 열매 대신 재를 맺는다.' }]] },
  mill: { name: '옛 물레방아', reg: 1, w: 24, h: 18, dens: .06, seed: 103, lock: 1, exits: { S: 'orchard' }, mobs: [['spitter', 3], ['splitter', 3], ['brute', 1, 'e']],
    ents: [['box', 6, 4], ['box', 17, 4], ['plate', 6, 12, { g: 'p' }], ['plate', 17, 12, { g: 'p' }], ['chest', 12, 3, { id: 'mi_charm', item: 'charm', g: 'p' }], ['sign', 9, 14, { text: '멈춘 물레. 돌 두 개가 제자리를 잃었다. 아래로 밀어라.' }]] },
  reeds: { name: '갈대밭', reg: 1, w: 28, h: 18, dens: .12, seed: 105, water: 2, exits: { N: 'field' }, mobs: [['blob', 5], ['moth', 4], ['bomber', 3]],
    ents: [['chest', 24, 14, { id: 're_page', item: 'page' }], ['pot', 4, 4], ['pot', 22, 3], ['npc', 10, 10, { id: 'ori' }]] },
  crypt: { name: '지하 묘지', reg: 1, w: 26, h: 18, dens: .04, seed: 107, dark: 1, music: 'cave', note: '종을 두드리면 돌이 순서를 알려 준다',
    ents: [['door', 12, 15, { to: 'crossroad', label: '갈림길로' }], ['bell', 12, 5, { g: 'r', seq: [2, 4, 1, 3] }], ['rune', 6, 8, { g: 'r', n: 1 }], ['rune', 10, 10, { g: 'r', n: 2 }], ['rune', 15, 10, { g: 'r', n: 3 }], ['rune', 19, 8, { g: 'r', n: 4 }], ['chest', 12, 2, { id: 'cr_charm', item: 'charm', g: 'r' }]],
    mobs: [['blob', 4], ['mini', 5]] },
  quarry_deep: { name: '채석장 아래', reg: 1, w: 26, h: 18, dens: .12, seed: 109, dark: 1, music: 'cave', drop: ['stone', .3],
    ents: [['door', 12, 15, { to: 'quarry', label: '위로' }], ['chest', 22, 3, { id: 'qd_coin', coin: 120 }], ['chest', 3, 3, { id: 'qd_charm', item: 'charm' }]],
    mobs: [['brute', 2, 'e'], ['splitter', 4], ['brute', 3]] },
  /* region 2 */
  fern_hollow: { name: '고사리 골짜기', reg: 2, w: 28, h: 18, dens: .16, seed: 121, exits: { N: 'forest_gate' }, mobs: [['spore', 7], ['puff', 3]], drop: ['mushroom', .35],
    ents: [['npc', 13, 6, { id: 'suah' }], ['chest', 24, 14, { id: 'fh_page', item: 'page' }], ['pot', 4, 13], ['pot', 5, 13]] },
  hunter_camp: { name: '사냥꾼 야영지', reg: 2, w: 24, h: 18, dens: .08, seed: 123, exits: { S: 'forest_gate', E: 'thicket' },
    ents: [['torch', 10, 11], ['npc', 8, 7, { id: 'bark' }], ['npc', 15, 7, { id: 'pio' }], ['sign', 13, 13, { text: '동쪽 덤불엔 뿔 사슴 떼가 산다. 혼자 가지 말 것.' }]] },
  thicket: { name: '덤불', reg: 2, w: 28, h: 20, dens: .18, seed: 125, exits: { W: 'hunter_camp' }, mobs: [['stag', 4], ['stag', 1, 'e'], ['thorn', 4], ['wisp', 4]],
    ents: [['chest', 24, 3, { id: 'th_coin', coin: 150 }], ['chest', 3, 16, { id: 'th_page', item: 'page' }]] },
  bog_shrine: { name: '늪 사당', reg: 2, w: 24, h: 18, dens: .05, seed: 127, exits: { W: 'swamp' }, mobs: [['spore', 3], ['wisp', 3]],
    ents: [['brazier', 6, 5, { g: 'b', n: 2 }], ['brazier', 17, 5, { g: 'b', n: 4 }], ['brazier', 6, 12, { g: 'b', n: 1 }], ['brazier', 17, 12, { g: 'b', n: 3 }],
      ['sign', 12, 14, { text: '사당 기둥에 새긴 말: 해 지는 쪽 아래, 그 위. 해 뜨는 쪽 아래, 그 위.' }], ['chest', 12, 3, { id: 'bs_charm', item: 'charm', g: 'b' }]] },
  fungus_grotto: { name: '버섯 굴', reg: 2, w: 26, h: 18, dens: .08, seed: 129, dark: 1, music: 'cave', exits: { N: 'stag_path' }, mobs: [['puff', 4], ['spore', 5], ['stump', 2]],
    ents: [...lampGrid(15, 5, 'l', [0, 4, 8]), ['chest', 17, 3, { id: 'fu_charm', item: 'charm', g: 'l' }], ['sign', 12, 13, { text: '버섯 등불 아홉. 하나를 건드리면 이웃도 바뀐다.' }]] },
  /* region 3 */
  caravan: { name: '대상 야영지', reg: 3, w: 26, h: 18, dens: .05, seed: 141, exits: { S: 'oasis' },
    ents: [['torch', 12, 10], ['npc', 7, 7, { id: 'yamil' }], ['npc', 17, 7, { id: 'noa' }], ['npc', 12, 13, { id: 'kaya' }]] },
  dunes_south: { name: '남쪽 모래톱', reg: 3, w: 30, h: 20, dens: .1, seed: 143, exits: { N: 'dunes' }, mobs: [['burrow', 4], ['scorp', 3], ['gnat', 5], ['ram', 1, 'e']],
    ents: [['chest', 4, 4, { id: 'ds_jar1', item: 'jar' }], ['chest', 25, 4, { id: 'ds_jar2', item: 'jar' }], ['chest', 15, 16, { id: 'ds_jar3', item: 'jar' }], ['pot', 8, 10], ['pot', 9, 10]] },
  fossil_cave: { name: '화석 동굴', reg: 3, w: 26, h: 18, dens: .05, seed: 145, dark: 1, music: 'cave', exits: { W: 'bone_canyon' }, note: '뼈를 두드리면 화석이 운다',
    ents: [['bell', 13, 4, { g: 'r', seq: [5, 2, 4, 1, 3, 5] }], ['rune', 5, 6, { g: 'r', n: 1 }], ['rune', 9, 13, { g: 'r', n: 2 }], ['rune', 17, 13, { g: 'r', n: 3 }], ['rune', 21, 6, { g: 'r', n: 4 }], ['rune', 13, 11, { g: 'r', n: 5 }],
      ['chest', 22, 3, { id: 'fc_charm', item: 'charm', g: 'r' }]], mobs: [['beetle', 3], ['grub', 4]] },
  mirror_hall: { name: '거울 회랑', reg: 3, w: 26, h: 18, dens: .04, seed: 147, exits: { W: 'sun_altar' }, mobs: [['gnat', 4]],
    ents: [['box', 6, 4], ['box', 12, 4], ['box', 19, 4], ['plate', 6, 13, { g: 'p' }], ['plate', 12, 13, { g: 'p' }], ['plate', 19, 13, { g: 'p' }], ['chest', 23, 9, { id: 'mh_charm', item: 'charm', g: 'p' }],
      ['sign', 3, 6, { text: '거울 앞에 돌 셋. 각자 제 그림자 위에 서야 한다.' }]] },
  sand_sea: { name: '모래 바다', reg: 3, w: 32, h: 22, dens: .07, seed: 149, exits: { N: 'sink_pit' }, mobs: [['burrow', 5], ['ram', 3], ['scorp', 3], ['ram', 1, 'e'], ['beetle', 2, 'e']],
    ents: [['chest', 28, 18, { id: 'ss_page', item: 'page' }], ['chest', 3, 3, { id: 'ss_coin', coin: 200 }]] },
  /* region 4 */
  fish_market: { name: '어시장', reg: 4, w: 26, h: 18, dens: .05, seed: 161, exits: { N: 'harbor' }, mobs: [['gull', 6], ['slush', 3]],
    ents: [['npc', 8, 6, { id: 'luna' }], ['npc', 18, 6, { id: 'pio' }], ['pot', 4, 13], ['pot', 5, 13], ['pot', 20, 13]] },
  wreck_hold: { name: '난파선 창고', reg: 4, w: 24, h: 18, dens: .12, seed: 163, dark: 1, music: 'cave', lock: 1, mobs: [['diver', 3], ['floe', 3], ['walrus', 1, 'e']],
    ents: [['door', 12, 15, { to: 'graveyard', label: '갑판으로' }], ['chest', 12, 3, { id: 'wh_charm', item: 'charm' }]] },
  cliff_path: { name: '절벽 길', reg: 4, w: 30, h: 18, dens: .1, seed: 165, water: 2, exits: { W: 'lighthouse' }, mobs: [['gull', 5], ['diver', 3], ['mine', 3]],
    ents: [['chest', 27, 3, { id: 'cp_page', item: 'page' }], ['npc', 15, 8, { id: 'gale' }]] },
  frozen_lake: { name: '얼음 호수', reg: 4, map: ICE_LAKE, exits: { S: 'iceberg_field' }, note: '바위에 부딪혀야 멈춘다',
    legend: { K: ['chest', { id: 'fl_charm', item: 'charm' }], S: ['sign', { text: '호수 한가운데 상자가 얼어붙어 있다. 곧장 가서는 닿지 않는다.' }] } },
  pearl_grotto: { name: '진주 동굴', reg: 4, w: 24, h: 18, dens: .05, seed: 169, dark: 1, music: 'cave', exits: { N: 'tide_gate' }, mobs: [['slush', 3], ['floe', 2]],
    ents: [...lampGrid(5, 5, 'l', [1, 3, 5, 7]), ['chest', 7, 3, { id: 'pg_charm', item: 'charm', g: 'l' }], ['sign', 16, 12, { text: '진주 아홉 알. 모두 빛나야 조개가 열린다.' }]] },
  /* region 5 */
  archive: { name: '기록 보관소', reg: 5, w: 28, h: 20, dens: .22, seed: 181, exits: { S: 'plaza' }, mobs: [['glyph', 5], ['scrap', 4], ['inkpot', 2]], drop: ['sentence', .3],
    ents: [['npc', 14, 15, { id: 'onik' }], ['chest', 3, 3, { id: 'ar_page', item: 'page' }]] },
  fold_valley: { name: '접힌 골짜기', reg: 5, w: 30, h: 20, dens: .12, seed: 183, exits: { N: 'paper_maze' }, mobs: [['eraser', 3], ['eraser', 1, 'e'], ['smudge', 5], ['blink', 3]],
    ents: [['chest', 26, 16, { id: 'fv_coin', coin: 220 }], ['chest', 3, 16, { id: 'fv_charm', item: 'charm' }]] },
  ink_well: { name: '잉크 샘', reg: 5, w: 24, h: 18, dens: .05, seed: 185, exits: { W: 'ink_river' }, mobs: [['inkpot', 3], ['smudge', 3]],
    ents: [['brazier', 18, 4, { g: 'b', n: 1 }], ['brazier', 18, 13, { g: 'b', n: 2 }], ['brazier', 5, 4, { g: 'b', n: 3 }], ['brazier', 12, 9, { g: 'b', n: 4 }], ['brazier', 5, 13, { g: 'b', n: 5 }],
      ['sign', 9, 15, { text: '샘가에 쓴 글: 오른쪽 위, 오른쪽 아래, 왼쪽 위, 가운데, 왼쪽 아래.' }], ['chest', 12, 2, { id: 'iw_charm', item: 'charm', g: 'b' }]] },
  margin: { name: '여백', reg: 5, w: 24, h: 18, dens: .03, seed: 187, exits: { N: 'court' },
    ents: [['torch', 12, 10], ['npc', 8, 7, { id: 'nina' }], ['npc', 16, 7, { id: 'pio' }], ['chest', 20, 14, { id: 'mg_page', item: 'page' }]] },
  cloud_loft: { name: '구름 다락', reg: 5, w: 26, h: 18, dens: .08, seed: 189, exits: { S: 'sky_stair' }, mobs: [['scrap', 5], ['blink', 3], ['eraser', 2]],
    ents: [...lampGrid(15, 5, 'l', [2, 3, 4, 8]), ['chest', 17, 3, { id: 'cl_charm', item: 'charm', g: 'l' }], ['chest', 3, 14, { id: 'cl_page', item: 'page' }]] },
});

/* hook the side roads onto the old ones */
(() => {
  const ex = (id, side, to) => { AREAS[id].exits = AREAS[id].exits || {}; AREAS[id].exits[side] = to; };
  ex('village', 'W', 'orchard');
  AREAS.village.map = AREAS.village.map.map((r, y) => y >= 8 && y <= 10 ? '<' + r.slice(1) : r);
  ex('field', 'S', 'reeds');
  AREAS.crossroad.ents.push(['door', 20, 13, { to: 'crypt', label: '지하 묘지' }]);
  AREAS.quarry.ents.push(['door', 20, 12, { to: 'quarry_deep', label: '아래로 내려가는 굴' }]);
  ex('forest_gate', 'S', 'fern_hollow'); ex('forest_gate', 'N', 'hunter_camp');
  ex('swamp', 'E', 'bog_shrine'); ex('stag_path', 'S', 'fungus_grotto');
  ex('oasis', 'N', 'caravan'); ex('dunes', 'S', 'dunes_south'); ex('bone_canyon', 'E', 'fossil_cave'); ex('sun_altar', 'E', 'mirror_hall'); ex('sink_pit', 'S', 'sand_sea');
  ex('harbor', 'S', 'fish_market'); AREAS.graveyard.ents.push(['door', 24, 18, { to: 'wreck_hold', label: '난파선 창고' }]);
  ex('lighthouse', 'E', 'cliff_path'); ex('iceberg_field', 'N', 'frozen_lake'); ex('tide_gate', 'S', 'pearl_grotto');
  ex('plaza', 'N', 'archive'); ex('paper_maze', 'S', 'fold_valley'); ex('ink_river', 'E', 'ink_well'); ex('court', 'S', 'margin'); ex('sky_stair', 'N', 'cloud_loft');
  AREAS.fold_valley.ents.push(['chest', 15, 3, { id: 'fv_page', item: 'page' }]);
})();

Object.assign(NPCS, {
  maru: { name: '마루', role: '과수원지기', look: { c: COL.pink, hat: 'wide', item: 'staff', beard: 1 } },
  ori: { name: '오리', role: '갈대 베는 사람', look: { c: COL.yellow, hat: 'band', item: 'staff' } },
  suah: { name: '수아', role: '약초꾼', look: { c: COL.teal, hat: 'point', item: 'bag' } },
  bark: { name: '바크', role: '사냥꾼', look: { c: '#B9894F', hat: 'hood', item: 'bow', big: 1 } },
  yamil: { name: '야밀', role: '대상 상인', look: { c: COL.yellow, hat: 'band', item: 'bag', big: 1 } },
  noa: { name: '노아', role: '이야기꾼', look: { c: COL.pink, hat: 'hood', item: 'staff', beard: 1 } },
  kaya: { name: '카야', role: '낙타꾼의 딸', look: { c: '#7CC6D8', hat: 'band', item: null, small: 1 } },
  luna: { name: '루나', role: '생선 장수', look: { c: '#7CC6D8', hat: 'cap', item: 'bag' } },
  gale: { name: '게일', role: '등대지기의 딸', look: { c: COL.yellow, hat: 'hood', item: 'torch' } },
  onik: { name: '오닉', role: '서기', look: { c: COL.teal, hat: 'point', item: 'book', beard: 1 } },
  nina: { name: '니나', role: '여백지기', look: { c: '#F2EEDF', hat: 'hood', item: 'torch' } },
});
const cnt = (S, k) => S.items[k] || 0, ak = (S, a) => S.ak[a] || 0;
Object.assign(TALK, {
  maru: [
    [S => !sf('q_orchard') && ak(S, 'orchard') >= 10, ['재나방이 줄었어. 나무가 숨을 쉬네.', '이거 받아. 할아버지가 남긴 부적이야.'], () => { giveCharm(); addCoin(60); setf('q_orchard'); }],
    [S => !sf('q_orchard'), S => ['과수원이 재나방 천지야. 열 마리만 쫓아 줘. 지금 ' + Math.min(10, ak(S, 'orchard')) + '마리.', '북쪽 물레방아는 들어가면 문이 닫혀. 조심해.'], null],
    [S => true, ['사과가 다시 열리면 하나 줄게. 아마 내년쯤.'], null],
  ],
  ori: [[S => true, ['갈대 사이에 뭐가 숨어 있어. 가까이 가면 터지는 놈들이야.', '갈대는 베어도 다시 자라. 그게 좋아.'], null]],
  suah: [
    [S => !sf('q_mush') && cnt(S, 'mushroom') >= 5, ['다섯 개 다 모았네. 잠깐만.', '...됐다. 큰 물약 셋. 그리고 이건 덤.'], () => { addItem('mushroom', -5); addItem('bigpotion', 3); giveCharm(); setf('q_mush'); }],
    [S => !sf('q_mush'), S => ['포자덩이를 베면 버섯이 떨어져. 다섯 개만 모아 줘. 약을 만들 거야.', '지금 ' + cnt(S, 'mushroom') + '개.'], null],
    [S => true, ['약은 언제든 팔아.'], () => openStoryShop('sai')],
  ],
  bark: [
    [S => !sf('q_hunt') && ak(S, 'thicket') >= 15, ['덤불이 조용해졌다. 제법이군.', '사냥꾼 몫이다. 받아.'], () => { addCoin(300); giveCharm(); setf('q_hunt'); }],
    [S => !sf('q_hunt'), S => ['덤불의 사슴 떼가 야영지를 넘본다. 열다섯 마리.', '지금 ' + Math.min(15, ak(S, 'thicket')) + '. 뿔 큰 놈은 조심해.'], null],
    [S => true, ['다음 사냥 때도 불러 주지.'], null],
  ],
  yamil: [[S => true, ['물 빼고는 다 판다. 물은 안 팔아.'], () => openStoryShop('pio')]],
  noa: [[S => true, ['사막이 바다였을 때 얘기 들어 볼래?', '그때는 소금이 물에 녹아 있었어. 지금은 물이 소금에 갇혀 있지.', '모래 왕은 원래 바다를 지키던 거래. 바다가 없어진 걸 아직 모르는 거지.'], null]],
  kaya: [
    [S => !sf('q_jar') && cnt(S, 'jar') >= 3, ['항아리 세 개! 다 찾았구나.', '아빠가 이거 주라고 했어. 사막에선 이게 돈보다 귀해.'], () => { addItem('jar', -3); addItem('bigpotion', 2); giveCharm(); addCoin(200); setf('q_jar'); }],
    [S => !sf('q_jar'), S => ['물 항아리 세 개를 남쪽 모래톱에 묻어 뒀는데 모래가 다 덮었어.', '찾아 줄래? 지금 ' + cnt(S, 'jar') + '개.'], null],
    [S => true, ['물 맛 좀 봐. 소금 맛이지?'], null],
  ],
  luna: [
    [S => !sf('q_fish') && ak(S, 'fish_market') >= 12, ['갈매기가 안 보여! 오늘은 장사 되겠다.', '이거 받아. 얼음 밑에서 건진 거야.'], () => { addCoin(400); giveCharm(); setf('q_fish'); }],
    [S => !sf('q_fish'), S => ['갈매기들이 생선을 다 물어 가. 열두 마리만 쫓아 줘.', '지금 ' + Math.min(12, ak(S, 'fish_market')) + '.'], null],
    [S => true, ['필요한 거 있어?'], () => openStoryShop('sai')],
  ],
  gale: [[S => true, ['아버지가 등대지기였어. 불이 미친 날 사라졌지.', '절벽 끝 상자는 아버지 거야. 가져가도 돼. 아버지도 그러라고 할 거야.'], null]],
  onik: [
    [S => !sf('q_sentence') && cnt(S, 'sentence') >= 4, ['네 조각. 맞다, 이 문장이었어.', '"불은 그림자를 만들지만, 그림자는 불을 끄지 못한다." 받아. 수고비야.'], () => { addItem('sentence', -4); addCoin(600); giveCharm(); setf('q_sentence'); }],
    [S => !sf('q_sentence'), S => ['글자 놈들이 문장을 찢어 들고 다녀. 네 조각만 찾아 줘.', '지금 ' + cnt(S, 'sentence') + '.'], null],
    [S => true, ['문장이 붙었어. 다시 찢기기 전에 외워 둬.'], null],
  ],
  nina: [[S => true, ['여기는 아무것도 안 쓰인 곳이야. 그래서 안전해.', '쉬었다 가. 불은 내가 지킬게.'], null]],
});
/* side errands, for the menu */
const SIDE_QUESTS = [
  { f: 'q_orchard', t: '과수원의 재나방 열 마리를 쫓는다', who: '마루', at: 'orchard' },
  { f: 'q_mush', t: '고사리 골짜기에서 버섯 다섯 개를 모은다', who: '수아', at: 'fern_hollow' },
  { f: 'q_hunt', t: '덤불의 짐승 열다섯 마리를 잡는다', who: '바크', at: 'hunter_camp' },
  { f: 'q_jar', t: '남쪽 모래톱의 물 항아리 세 개를 찾는다', who: '카야', at: 'caravan' },
  { f: 'q_fish', t: '어시장의 갈매기 열두 마리를 쫓는다', who: '루나', at: 'fish_market' },
  { f: 'q_sentence', t: '기록 보관소에서 찢긴 문장 네 조각을 모은다', who: '오닉', at: 'archive' },
];

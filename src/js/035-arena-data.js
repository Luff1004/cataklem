/* ================= boss gates: crafted portals that lead to a sealed arena ================= */
const ARENA_R = 380;
const GATES = [
  { id: 'bell', name: '종지기', ord: '첫째 문', sub: '아무도 오지 않는 예배당의', line: '종이 한 번 울릴 때마다 누군가 사라졌다.', cost: 300, core: null, hp: 17000, r: 52, spd: 46, reward: 300, cls: 'bellman',
    phases: ['', '', '종이 금 간다', '공명'], tip: '울림에는 틈이 있다. 틈으로 빠져나가거나, 굴러서 넘어라.' },
  { id: 'loom', name: '실잣는 여왕', ord: '둘째 문', sub: '하늘의 찢어진 곳을 꿰매는', line: '실이 팽팽해지면, 그건 경고가 아니다.', cost: 420, core: 'bell', hp: 20000, r: 46, spd: 95, reward: 450, cls: 'weaver',
    phases: ['', '', '실이 붉어진다', '베틀이 돈다'], tip: '점선으로 그어진 실은 곧 불붙는다. 거미줄은 발을 묶는다.' },
  { id: 'twins', name: '거울 쌍둥이', ord: '셋째 문', sub: '서로를 비추며 태어난', line: '둘 사이에 서지 마라.', cost: 560, core: 'loom', hp: 24000, r: 34, spd: 0, reward: 600, cls: 'twin',
    phases: ['', '', '거울이 흔들린다', '끊어지지 않는 끈'], tip: '둘을 잇는 빛줄기에 닿으면 아프다. 탄은 벽에 한 번 튄다.' },
  { id: 'tide', name: '잉크 해일', ord: '넷째 문', sub: '바다였던 것의 마지막 숨', line: '바닥이 검게 차오른다.', cost: 720, core: 'twins', hp: 21000, r: 50, spd: 70, reward: 800, cls: 'tidal',
    phases: ['', '', '물이 불어난다', '만조'], tip: '물결이 물러날 때 그 틈으로 지나가라. 검은 웅덩이는 피하라.' },
  { id: 'sun', name: '떨어진 태양', ord: '다섯째 문', sub: '모든 것의 시작이자 끝', line: '처음 떨어진 것. 하늘이 무너진 이유.', cost: 1000, core: 'tide', hp: 36000, r: 64, spd: 0, reward: 1200, cls: 'eclipse',
    phases: ['', '', '일식', '초신성'], tip: '어둠 속에서는 빛 가까이에 붙어라. 초신성이 오면 기둥 뒤에 숨어라.' },
  { id: 'judge', name: '시계 재판관', ord: '여섯째 문', sub: '멈춘 시간의 끝에서 심판하는', line: '정각이 되면, 판결은 이미 끝나 있다.', cost: 1300, core: 'sun', hp: 36000, r: 50, spd: 0, reward: 1500, cls: 'clockman',
    phases: ['', '', '시계가 빨라진다', '시간 정지'], tip: '두 바늘을 피해 돌아라. 정각에는 표시된 조각에서 벗어나라. 퍼진 탄은 되돌아온다.' },
  { id: 'root', name: '뿌리 왕', ord: '일곱째 문', sub: '무너진 하늘 아래 처음 자란', line: '땅 밑에서 이미 너를 감고 있었다.', cost: 1600, core: 'judge', hp: 50000, r: 56, spd: 40, reward: 1900, cls: 'gardener',
    phases: ['', '', '꽃이 핀다', '숲이 깨어난다'], tip: '땅이 갈라지는 줄을 옆으로 피하라. 개화가 오면 하얀 꽃자리 안에 서라.' },
  { id: 'sky', name: '무너진 하늘', ord: '여덟째 문', sub: '모든 밤의 처음이자 마지막', line: '하늘은 떨어진 게 아니었다. 내려온 것이다.', cost: 2200, core: 'root', hp: 80000, r: 70, spd: 0, reward: 3000, cls: 'skykeeper',
    phases: ['', '', '별이 진다', '마지막 빛'], tip: '끌려가지 말고 버텨라. 앞선 거물들의 기술이 섞여 나온다. 마지막엔 기둥 뒤에 숨어라.' },
  { id: 'unknown', name: 'UNKNOWN', ord: '이름 없는 문', sub: '이름 없는 것', line: '그것을 부르는 이름은 없다.', cost: 3000, core: 'sky', hp: 90000, r: 70, spd: 40, reward: 5000, cls: 'nameless',
    phases: ['', '', '', ''], tip: '일곱 막, 여덟 분. 다섯째 막에서 벽이 무너지면 뒤돌아보지 말고 달려라. 통로 밖의 어둠은 너를 갉아먹는다.' },
];
const CORE_NAME = { bell: '금 간 종추', loom: '여왕의 실타래', twins: '깨진 거울', tide: '검은 진주', sun: '태양의 심장', judge: '멈춘 태엽', root: '첫 씨앗', sky: '하늘 조각', unknown: '지워진 이름' };

const RELICS = {
  wick: { name: '질긴 심지', icon: 'heart', info: '최대 체력 +40. 체력을 전부 되찾는다.', fn() { G.rel.hp += 40; recalc(); P.hp = P.maxHp; } },
  overheat: { name: '과열', icon: 'ember', info: '주는 피해 +35%. 받는 피해 +15%.', fn() { G.rel.might += .35; G.rel.taken += .15; } },
  afterimage: { name: '잔상', icon: 'wing', info: '구르기 재사용 -40%. 더 멀리 미끄러진다.', fn() { G.rel.dashCd *= .6; G.rel.dashDist *= 1.3; } },
  rod: { name: '피뢰침', icon: 'bolt', info: '2.5초마다 거물에게 번개가 꽂힌다.', fn() { G.rel.rod++; } },
  ward: { name: '수호 구슬', icon: 'orbit', info: '탄을 막아 주는 구슬 두 개가 곁을 돈다.', fn() { G.rel.ward += 2; } },
  focus: { name: '집중', icon: 'lens', info: '치명타 +15%. 치명타 피해 ×2.6.', fn() { G.rel.crit += .15; G.rel.critMul = 2.6; } },
  leech: { name: '흡혈 잉크', icon: 'heart', info: '거물에게 준 피해의 1.5%만큼 체력을 되찾는다.', fn() { G.rel.leech += .015; } },
  haste: { name: '가속', icon: 'wing', info: '이동 속도 +20%.', fn() { G.rel.spd += .2; } },
  echoes: { name: '메아리', icon: 'mirror', info: '모든 무기의 투사체 +1.', fn() { G.rel.amount += 1; } },
  slowtime: { name: '시간 균열', icon: 'glass', info: '적의 탄과 울림이 25% 느려진다.', fn() { G.rel.bslow *= .75; } },
  undying: { name: '불사', icon: 'clover', info: '한 번, 치명상을 체력 1로 버틴다.', fn() { G.rel.undying = 1; } },
  kindle: { name: '진화의 불꽃', icon: 'meteor', info: '가장 높은 무기 하나를 조건 없이 진화시킨다.', fn() { const w = G.weapons.filter(x => !x.evo).sort((a, b) => b.lv - a.lv)[0]; if (w) { w.lv = WEAPONS[w.id].max; w.evo = true; G.evoN++; SAVE.stats.evos[w.id] = 1; } } },
  battery: { name: '축전', icon: 'pulse', info: '섬광이 두 배 빨리 찬다. 지금 가득 채운다.', fn() { G.rel.ult *= 2; G.ult = G.ultNeed; } },
};
const freshRel = () => ({ spdFlat: 0, hp: 0, might: 0, taken: 0, crit: 0, critMul: 0, leech: 0, spd: 0, amount: 0, bslow: 1, dashCd: 1, dashDist: 1, rod: 0, ward: 0, undying: 0, ult: 1 });

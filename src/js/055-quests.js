/* ================= daily requests: three goals per day, judged on a single run ================= */
const QUESTS = {
  kills: { goals: [400, 800, 1500], reward: [40, 70, 110], txt: n => '한 판에 ' + n + '마리 쓰러뜨리기', stat: r => r.kills },
  time: { goals: [150, 270, 390], reward: [40, 70, 110], txt: n => Math.floor(n / 60) + '분 ' + (n % 60 ? (n % 60) + '초 ' : '') + '버티기', stat: r => r.time },
  boss: { goals: [1, 2, 3], reward: [45, 80, 120], txt: n => '한 판에 거물 ' + n + '마리 쓰러뜨리기', stat: r => r.bosses },
  combo: { goals: [120, 300, 600], reward: [35, 65, 100], txt: n => '연쇄 ' + n + ' 이어가기', stat: r => r.combo },
  evo: { goals: [1, 1, 2], reward: [60, 60, 120], txt: n => n > 1 ? '한 판에 무기 ' + n + '개 진화' : '무기 하나 진화시키기', stat: r => r.evos },
  chest: { goals: [2, 3, 5], reward: [35, 55, 90], txt: n => '한 판에 상자 ' + n + '개 열기', stat: r => r.chests },
  ult: { goals: [2, 3, 5], reward: [30, 50, 80], txt: n => '한 판에 섬광 ' + n + '번 쓰기', stat: r => r.ults },
  level: { goals: [12, 20, 28], reward: [35, 60, 95], txt: n => '레벨 ' + n + ' 찍기', stat: r => r.level },
};
function dayKey() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function todayQuests() {
  const key = dayKey();
  if (SAVE.quests && SAVE.quests.day === key && Array.isArray(SAVE.quests.list)) return SAVE.quests.list;
  let h = 7; for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) | 0;
  const R = mulberry(h), ids = Object.keys(QUESTS);
  for (let i = ids.length - 1; i > 0; i--) { const j = (R() * (i + 1)) | 0; [ids[i], ids[j]] = [ids[j], ids[i]]; }
  const tierBase = Math.min(2, Math.floor((SAVE.stats.wins || 0) / 2));
  const list = ids.slice(0, 3).map((id, i) => {
    const tier = Math.min(2, Math.max(0, tierBase + (i === 2 ? 1 : 0) - (i === 0 ? 1 : 0)));
    return { id, goal: QUESTS[id].goals[tier], reward: QUESTS[id].reward[tier], best: 0, done: 0 };
  });
  SAVE.quests = { day: key, list };
  persist();
  return list;
}
function judgeQuests(run) {
  const list = todayQuests(), got = [];
  for (const q of list) {
    const v = QUESTS[q.id].stat(run);
    q.best = Math.max(q.best || 0, v);
    if (!q.done && v >= q.goal) { q.done = 1; SAVE.shards += q.reward; got.push(q); }
  }
  persist();
  return got;
}
function questsLeft() { return todayQuests().filter(q => !q.done).length; }
function openQuest() {
  STATE = 'quest'; show('scrQuest');
  const list = todayQuests();
  const now = new Date(), mid = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const left = Math.max(0, mid - now), hh = Math.floor(left / 3600000), mm = Math.floor(left % 3600000 / 60000);
  $('qLeft').textContent = '새 의뢰까지 ' + hh + '시간 ' + mm + '분';
  $('qList').innerHTML = list.map(q => {
    const Q = QUESTS[q.id], pct = Math.min(100, Math.round((q.best || 0) / q.goal * 100));
    return '<div class="quest' + (q.done ? ' done' : '') + '"><div class="qt"><b>' + esc(Q.txt(q.goal)) + '</b><span class="qr"><i class="shard"></i>' + q.reward + '</span></div>' +
      '<div class="qbar"><i style="width:' + pct + '%"></i></div><span class="qs">' + (q.done ? '끝냈다. 파편을 받았다.' : '오늘 최고 ' + (q.id === 'time' ? fmtTime(q.best || 0) + ' / ' + fmtTime(q.goal) : fmtNum(q.best || 0) + ' / ' + fmtNum(q.goal))) + '</span></div>';
  }).join('');
}

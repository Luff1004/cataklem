/* ================= languages: Korean is the source; English, Japanese and Chinese come from tables ================= */
const LANGS = { en: 'English', ko: '한국어', ja: '日本語', zh: '中文' };
const LANG = (() => {
  try { const v = JSON.parse(localStorage.getItem('cataklem.save.v1') || '{}').lang; return LANGS[v] ? v : 'ko'; }
  catch (e) { return 'ko'; }
})();
const TR = {};
const LI = { en: 1, ja: 2, zh: 3 }[LANG];
/* each row is [korean, english, japanese, chinese] */
function I18N(rows) { if (!LI) return; for (const r of rows) if (r[LI] !== undefined && r[LI] !== null) TR[r[0]] = r[LI]; }
function L(s) { if (!LI) return s; const t = TR[s]; return t === undefined ? s : t; }
document.documentElement.lang = LANG === 'zh' ? 'zh-Hans' : LANG;

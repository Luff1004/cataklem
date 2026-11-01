/* translate the static page once, before anything else reads it */
(() => {
  if (!LI) return;
  const H = /[가-힣]/;
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walk.nextNode()) { const n = walk.currentNode; if (H.test(n.nodeValue) && !n.parentElement.closest('script,style')) nodes.push(n); }
  for (const n of nodes) {
    const raw = n.nodeValue, key = raw.replace(/\s+/g, ' ').trim(), t = TR[key];
    if (t === undefined) continue;
    const lead = raw.match(/^\s*/)[0], trail = raw.match(/\s*$/)[0];
    n.nodeValue = lead + t + trail;
  }
  for (const el of document.querySelectorAll('[aria-label],[title],[alt]')) for (const a of ['aria-label', 'title', 'alt']) {
    const v = el.getAttribute(a); if (v && TR[v] !== undefined) el.setAttribute(a, TR[v]);
  }
  const st = document.createElement('style');
  st.textContent = '.char.sel::after{content:"' + L('선택') + '"}';
  document.head.appendChild(st);
})();

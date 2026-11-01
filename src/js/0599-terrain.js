/* ================= story terrain: winding roads that narrow and widen, clearings, lakes, blocked shortcuts ================= */
function vnoise(x, y, s, seed) {
  const xi = Math.floor(x / s), yi = Math.floor(y / s), xf = x / s - xi, yf = y / s - yi;
  const hs = (a, b) => { const t = Math.sin(a * 127.1 + b * 311.7 + seed * 74.7) * 43758.5453; return t - Math.floor(t); };
  const sm = f => f * f * (3 - 2 * f), u = sm(xf), v = sm(yf);
  const a = hs(xi, yi), b = hs(xi + 1, yi), c = hs(xi, yi + 1), d = hs(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function genTerrain(A, attempt) {
  // every place is its own size; the rock all around hides the rectangle
  const Rs = mulberry((A.seed || 1) * 7 + 5), grow = A.arena || A.chase ? 0 : 1;
  const w = (A.w || 26) + Math.round(Rs() * 10 * grow), h = (A.h || 18) + Math.round(Rs() * 7 * grow);
  const seed = (A.seed || 1) * 13 + attempt * 101, R = mulberry(seed), reg = A.reg;
  const obs = ['#'];
  const deco = { 1: ['t', 't', 'o'], 2: ['t', 't', 'o'], 3: ['o', 'c', 'o'], 4: ['o', 't', 'b'], 5: ['x', 'o', 'x'] }[reg];
  const g = [], core = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) { g.push([]); for (let x = 0; x < w; x++) g[y].push('#'); }
  const inside = (x, y) => x > 0 && y > 0 && x < w - 1 && y < h - 1;
  const disc = (cx, cy, r) => {
    for (let y = Math.floor(cy - r - 1); y <= cy + r + 1; y++) for (let x = Math.floor(cx - r - 1); x <= cx + r + 1; x++)
      if (inside(x, y) && (x + .5 - cx) ** 2 + (y + .5 - cy) ** 2 <= r * r + .3) g[y][x] = '.';
  };
  const wormPts = [];
  const worm = (ax, ay, bx, by, rmin, rmax, keep) => {
    let x = ax, y = ay, ang = Math.atan2(by - y, bx - x), wig = 0, t = R() * 10;
    const pts = [];
    for (let s = 0; s < 600; s++) {
      const d = Math.hypot(bx - x, by - y); if (d < .8) break;
      const want = Math.atan2(by - y, bx - x);
      wig += (R() - .5) * .5; wig *= .9;
      let da = want - ang; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU;
      ang += da * (d < 4 ? .5 : .16) + wig * .35;
      x = clamp(x + Math.cos(ang) * .6, 1.5, w - 2.5); y = clamp(y + Math.sin(ang) * .6, 1.5, h - 2.5);
      t += .07;
      const k = (Math.sin(t) * .5 + .5) * vnoise(x, y, 5, seed + 9), r = rmin + (rmax - rmin) * k;
      disc(x, y, r); core[Math.floor(y) * w + Math.floor(x)] = 1; pts.push([x, y]);
    }
    disc(bx, by, rmin + .3);
    if (keep) wormPts.push(...pts);
    return pts;
  };
  const cx = w / 2, cy = h / 2;
  const inner = { W: [1.8, cy], E: [w - 1.8, cy], N: [cx, 1.8], S: [cx, h - 1.8] };
  const sc0 = A.shortcut, pts = sc0 ? [] : [[cx, cy]];
  for (const side in (A.exits || {})) pts.push(inner[side]);
  for (const e of (A.ents || [])) pts.push([e[1] + .5, e[2] + .5]);
  const nClear = A.arena ? 0 : 2 + Math.floor(R() * 2);
  for (let k = 0; k < nClear; k++) pts.push([3 + R() * (w - 6), 3 + R() * (h - 6)]);
  // the shortcut: two exits, a direct road with a choke, and a long way round
  let neck = null;
  const sc = A.shortcut;
  if (sc) {
    const [pa, pb] = [inner[sc[0]], inner[sc[1]]];
    const direct = worm(pa[0], pa[1], pb[0], pb[1], .9, 1.6, false);
    const fi = Math.floor(direct.length * (.42 + R() * .16)), n = direct[fi], n2 = direct[fi + 2] || n;
    neck = { x: n[0], y: n[1], dx: n2[0] - n[0], dy: n2[1] - n[1] };
    const horiz = Math.abs(pa[0] - pb[0]) > Math.abs(pa[1] - pb[1]);
    const far = horiz ? [cx + (R() - .5) * w * .3, cy < h / 2 ? h - 3 : 3] : [cx < w / 2 ? w - 3 : 3, cy + (R() - .5) * h * .3];
    if (horiz) far[1] = R() < .5 ? 2.6 : h - 3.6; else far[0] = R() < .5 ? 2.6 : w - 3.6;
    worm(pa[0], pa[1], far[0], far[1], .9, 2.4, true);
    worm(far[0], far[1], pb[0], pb[1], .9, 2.4, true);
  }
  // connect everything with a minimal tree, plus one extra loop; with a shortcut, each side of the choke on its own
  const edges = [];
  const tree = idx => {
    if (idx.length < 2) return;
    const used = [idx[0]], left = idx.slice(1);
    while (left.length) {
      let best = null;
      for (const i of used) for (const j of left) { const d = Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]); if (!best || d < best[2]) best = [i, j, d]; }
      edges.push(best); used.push(best[1]); left.splice(left.indexOf(best[1]), 1);
    }
  };
  if (neck) {
    const [pa, pb] = [inner[sc0[0]], inner[sc0[1]]], ax = pb[0] - pa[0], ay = pb[1] - pa[1];
    const ia = pts.findIndex(p => p === pa), ib = pts.findIndex(p => p === pb);
    const sideA = [ia], sideB = [ib];
    pts.forEach((p, i) => { if (i === ia || i === ib) return; ((p[0] - neck.x) * ax + (p[1] - neck.y) * ay < 0 ? sideA : sideB).push(i); });
    tree(sideA); tree(sideB);
  } else {
    tree(pts.map((_, i) => i));
    if (pts.length > 3 && !A.arena) { const i = 1 + Math.floor(R() * (pts.length - 1)), j = 1 + Math.floor(R() * (pts.length - 1)); if (i !== j) edges.push([i, j, 0]); }
  }
  for (const [i, j] of edges) worm(pts[i][0], pts[i][1], pts[j][0], pts[j][1], A.chase ? 1.5 : .85, A.arena ? 2.6 : A.chase ? 2.6 : 2.3, true);
  // places to stand
  if (!sc0) disc(cx, cy, A.arena ? 0 : 2.4);
  for (const e of (A.ents || [])) disc(e[1] + .5, e[2] + .5, 1.6);
  const fixedN = (sc0 ? 0 : 1) + Object.keys(A.exits || {}).length + (A.ents || []).length;
  for (let k = fixedN; k < pts.length; k++) disc(pts[k][0], pts[k][1], 2.2 + R() * 1.8);
  if (A.arena) {
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      const v = ((x + .5 - cx) / (w * .42)) ** 2 + ((y + .5 - cy) / (h * .4)) ** 2 + (vnoise(x, y, 3, seed + 5) - .5) * .35;
      if (v < 1) g[y][x] = '.';
    }
    for (const [px, py] of [[-.22, -.2], [.22, -.2], [-.22, .22], [.22, .22]]) { const ox = Math.round(cx + px * w), oy = Math.round(cy + py * h); if (inside(ox, oy)) g[oy][ox] = 'o'; }
  }
  // soften the edges
  for (let p = 0; p < 2; p++) {
    const snap = g.map(r => r.slice());
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      if (snap[y][x] === '.') continue;
      let n = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && snap[y + dy][x + dx] === '.') n++;
      if (n >= 5) g[y][x] = '.';
    }
  }
  // the choke itself
  const extra = [];
  if (neck) {
    const l = Math.hypot(neck.dx, neck.dy) || 1, ux = neck.dx / l, uy = neck.dy / l, px = -uy, py = ux;
    // wall off the open strip across the road at the choke, edge to edge
    const strip = new Set([Math.floor(neck.x) + ',' + Math.floor(neck.y)]);
    for (const sg of [-1, 1]) for (let k = .25; k < 9; k += .25) {
      const tx = Math.floor(neck.x + px * k * sg), ty = Math.floor(neck.y + py * k * sg);
      if (!inside(tx, ty) || g[ty][tx] !== '.') break;
      strip.add(tx + ',' + ty);
    }
    for (const c of strip) { const [tx, ty] = c.split(',').map(Number); g[ty][tx] = '.'; extra.push(['barrier', tx, ty, { g: 'sc' }]); }
    const lx = Math.floor(neck.x + ux * 2.2), ly = Math.floor(neck.y + uy * 2.2);
    disc(lx + .5, ly + .5, .9); extra.push(['lever', lx, ly, { g: 'sc' }]);
  }
  // a few small groves and rock piles, never on the road, and a stone or tree here and there at the cliff foot
  const keepOff = new Set();
  for (const e of (A.ents || [])) for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) keepOff.add((e[1] + dx) + ',' + (e[2] + dy));
  for (const side in (A.exits || {})) { const p = inner[side]; for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) keepOff.add((Math.floor(p[0]) + dx) + ',' + (Math.floor(p[1]) + dy)); }
  for (const [, tx, ty] of extra) for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) keepOff.add((tx + dx) + ',' + (ty + dy));
  const free = (x, y) => inside(x, y) && g[y][x] === '.' && !core[y * w + x] && !keepOff.has(x + ',' + y);
  const nClus = A.arena || A.chase ? 0 : 2 + Math.floor(R() * 3);
  // a chase road gets rocks in the way, to weave around at a run
  if (A.chase) for (let x = 8; x < w - 8; x += 5 + Math.floor(R() * 3)) {
    const ys = []; for (let y = 2; y < h - 2; y++) if (g[y][x] === '.' && core[y * w + x]) ys.push(y);
    if (ys.length > 2) { const y = ys[Math.floor(R() * ys.length)]; g[y][x] = deco[Math.floor(R() * deco.length)]; }
  }
  for (let k = 0; k < nClus; k++) {
    let tx = 0, ty = 0, ok = false;
    for (let tries = 0; tries < 30 && !ok; tries++) { tx = 2 + Math.floor(R() * (w - 4)); ty = 2 + Math.floor(R() * (h - 4)); ok = free(tx, ty); }
    if (!ok) continue;
    const kind = deco[Math.floor(R() * deco.length)], n = 2 + Math.floor(R() * 3);
    for (let i = 0; i < n; i++) { const x = tx + Math.round((R() - .5) * 3), y = ty + Math.round((R() - .5) * 2.4); if (free(x, y)) g[y][x] = kind; }
  }
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    if (!free(x, y)) continue;
    let rock = 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (g[y + dy][x + dx] === '#') rock++;
    if (rock && R() < .06) g[y][x] = R() < .55 ? 'o' : deco[0];
  }
  // water, kept off the road
  for (let k = 0; k < (A.water || 0); k++) {
    let best = null;
    for (let tries = 0; tries < 40; tries++) {
      const x = 3 + R() * (w - 6), y = 3 + R() * (h - 6);
      let near = 99; for (let yy = -3; yy <= 3; yy++) for (let xx = -3; xx <= 3; xx++) { const tx = Math.floor(x) + xx, ty = Math.floor(y) + yy; if (inside(tx, ty) && core[ty * w + tx]) near = Math.min(near, Math.hypot(xx, yy)); }
      if (!best || near > best[2]) best = [x, y, near];
    }
    const [lx, ly] = best, rx = 1.6 + R() * 2.4, ry = 1.3 + R() * 1.8;
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      const v = ((x + .5 - lx) / rx) ** 2 + ((y + .5 - ly) / ry) ** 2 + (vnoise(x, y, 2, seed + k) - .5) * .5;
      if (v < 1 && !core[y * w + x]) g[y][x] = '~';
      else if (v < 1 && core[y * w + x]) g[y][x] = '=';
    }
  }
  // borders and exits
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (!inside(x, y)) g[y][x] = obs[0];
  const ex = { W: '<', E: '>', N: '^', S: 'v' };
  for (const side in (A.exits || {})) for (let k = -1; k <= 1; k++) {
    if (side === 'W') { g[Math.floor(cy) + k][0] = ex.W; g[Math.floor(cy) + k][1] = '.'; }
    if (side === 'E') { g[Math.floor(cy) + k][w - 1] = ex.E; g[Math.floor(cy) + k][w - 2] = '.'; }
    if (side === 'N') { g[0][Math.floor(cx) + k] = ex.N; g[1][Math.floor(cx) + k] = '.'; }
    if (side === 'S') { g[h - 1][Math.floor(cx) + k] = ex.S; g[h - 2][Math.floor(cx) + k] = '.'; }
  }
  // dirt along the busiest roads, grass in the quiet parts
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    if (g[y][x] !== '.') continue;
    if (core[y * w + x] && (reg === 1 || reg === 3) && vnoise(x, y, 3, seed + 2) > .35) g[y][x] = '+';
    else if (vnoise(x, y, 3, seed + 3) > .42) g[y][x] = ',';
  }
  for (const e of (A.ents || [])) if (inside(e[1], e[2])) g[e[2]][e[1]] = '.';
  return { rows: g.map(r => r.join('')), extra };
}
/* keep trying until every exit, person and chest can be reached, and a shortcut really saves a walk */
function genArea2(A) {
  for (let attempt = 0; attempt < 40; attempt++) {
    const res = genTerrain(A, attempt);
    if (terrainOk(A, res)) return res;
  }
  if (A.shortcut) return genArea2({ ...A, shortcut: null });
  return genTerrain(A, 0);
}
let TERR_WHY = '';
function terrainOk(A, res) {
  TERR_WHY = '';
  const rows = res.rows, w = rows[0].length, h = rows.length;
  const solidC = new Set(['#', 't', 'o', '~', 'h', 'f', 'c', 'b', 'x']);
  const block = new Set(), barrier = new Set();
  for (const [k, x, y] of (A.ents || [])) if (['npc', 'torch', 'sign', 'chest', 'box', 'brazier', 'lamp', 'pot', 'board', 'bell', 'portal', 'waystone'].includes(k)) block.add(x + ',' + y);
  for (const [k, x, y] of res.extra) if (k === 'barrier') barrier.add(x + ',' + y); else block.add(x + ',' + y);
  const bfs = (sx, sy, useBarrier) => {
    const dist = new Map([[sx + ',' + sy, 0]]), q = [[sx, sy]];
    while (q.length) {
      const [x, y] = q.shift(), d = dist.get(x + ',' + y);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy, key = nx + ',' + ny;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h || dist.has(key)) continue;
        const c = rows[ny][nx];
        if (solidC.has(c) || block.has(key) || (useBarrier && barrier.has(key))) continue;
        dist.set(key, d + 1); if (!'<>^v'.includes(c)) q.push([nx, ny]);
      }
    }
    return dist;
  };
  const start = (() => { for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if ('<>^v'.includes(rows[y][x])) return [x, y]; return [Math.floor(w / 2), Math.floor(h / 2)]; })();
  const closed = bfs(start[0], start[1], true);
  const near = (x, y, m) => [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => m.has((x + dx) + ',' + (y + dy)));
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if ('<>^v'.includes(rows[y][x]) && !closed.has(x + ',' + y)) { TERR_WHY = 'exit ' + x + ',' + y; return false; }
  for (const [k, x, y] of [...(A.ents || []), ...res.extra]) if (k !== 'barrier' && !near(x, y, closed)) { TERR_WHY = 'ent ' + k + ' ' + x + ',' + y; return false; }
  if (A.shortcut) {
    const side = s => { for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (rows[y][x] === { W: '<', E: '>', N: '^', S: 'v' }[s]) return [x, y]; };
    const [a, b] = [side(A.shortcut[0]), side(A.shortcut[1])];
    const dClosed = bfs(a[0], a[1], true).get(b[0] + ',' + b[1]), dOpen = bfs(a[0], a[1], false).get(b[0] + ',' + b[1]);
    if (!dClosed || !dOpen || dClosed < dOpen * 1.25) { TERR_WHY = 'sc ' + dClosed + ' ' + dOpen; return false; }
  }
  return true;
}

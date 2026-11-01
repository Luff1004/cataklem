/* ================= helpers ================= */
const TAU = Math.PI * 2;
const rnd = (a, b) => b === undefined ? Math.random() * (a === undefined ? 1 : a) : a + Math.random() * (b - a);
const rint = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[(Math.random() * a.length) | 0];
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const d2 = (ax, ay, bx, by) => { const dx = ax - bx, dy = ay - by; return dx * dx + dy * dy; };
const $ = id => document.getElementById(id);
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function wpick(o) { let s = 0; for (const k in o) s += o[k]; let r = Math.random() * s; for (const k in o) { r -= o[k]; if (r <= 0) return k; } for (const k in o) return k; }
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
const fmtTime = s => { s = Math.max(0, Math.floor(s)); return String((s / 60) | 0).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
const fmtNum = n => Math.floor(n).toLocaleString('ko-KR');
function josa(w, a, b) { const c = w.charCodeAt(w.length - 1); const has = c >= 0xAC00 && c <= 0xD7A3 ? (c - 0xAC00) % 28 !== 0 : /[nmlr]$/i.test(w); return w + (has ? a : b); }
function sweep(a) { let j = 0; for (let i = 0; i < a.length; i++) { const o = a[i]; if (!o.dead) a[j++] = o; } a.length = j; }

/* ================= save ================= */
const SAVE_KEY = 'cataklem.save.v1';
function freshSave() {
  return { shards: 0, shop: {}, chars: { lamp: 1 }, char: 'lamp', rift: 1, maxRift: 1,
    best: { time: 0, kills: 0, level: 0, combo: 0 }, stats: { runs: 0, kills: 0, wins: 0, bosses: 0, evos: {} },
    sound: 1, music: 1, haptic: 1, tutorial: 0, ultSeen: 0, portals: {}, cores: {}, bossKills: {} };
}
function loadSave() {
  const s = freshSave();
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const o = JSON.parse(raw);
      for (const k in o) {
        if (s[k] && typeof s[k] === 'object' && !Array.isArray(s[k]) && o[k] && typeof o[k] === 'object') Object.assign(s[k], o[k]);
        else s[k] = o[k];
      }
    }
  } catch (e) { /* storage blocked: play with a fresh save */ }
  if (!s.stats.evos) s.stats.evos = {};
  return s;
}
let SAVE = loadSave();
function persist() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); } catch (e) {} }
function buzz(p) { if (!SAVE.haptic) return; try { if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return; navigator.vibrate && navigator.vibrate(p); } catch (e) {} }

/* ================= audio ================= */
const AU = { ctx: null, out: null, sfx: null, mus: null, noise: null, last: {}, step: 0, nextT: 0, intensity: 0, timer: null };
function audioInit() {
  if (AU.ctx) { if (AU.ctx.state !== 'running') AU.ctx.resume().catch(() => {}); return; }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  try { AU.ctx = new AC(); } catch (e) { return; }
  const c = AU.ctx;
  const comp = c.createDynamicsCompressor();
  comp.threshold.value = -16; comp.knee.value = 14; comp.ratio.value = 4; comp.attack.value = .003; comp.release.value = .2;
  comp.connect(c.destination);
  AU.out = c.createGain(); AU.out.gain.value = .9; AU.out.connect(comp);
  AU.sfx = c.createGain(); AU.sfx.gain.value = SAVE.sound ? .75 * (SAVE.sfxVol ?? 1) : 0; AU.sfx.connect(AU.out);
  AU.mus = c.createGain(); AU.mus.gain.value = SAVE.music ? .3 * (SAVE.musVol ?? 1) : 0; AU.mus.connect(AU.out);
  const len = c.sampleRate | 0, b = c.createBuffer(1, len, c.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  AU.noise = b;
  musicStart();
}
function setVolumes() {
  if (!AU.ctx) return;
  AU.sfx.gain.value = SAVE.sound ? .75 * (SAVE.sfxVol ?? 1) : 0;
  AU.mus.gain.value = SAVE.music ? .3 * (SAVE.musVol ?? 1) : 0;
}
function gate(name, ms) { const n = performance.now(); if (AU.last[name] && n - AU.last[name] < ms) return false; AU.last[name] = n; return true; }
function tone(f, dur, o = {}) {
  const c = AU.ctx; if (!c || c.state !== 'running') return;
  const t = (o.at || c.currentTime) + (o.delay || 0);
  const osc = c.createOscillator(), g = c.createGain();
  osc.type = o.type || 'square';
  osc.frequency.setValueAtTime(f, t);
  if (o.f2) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.f2), t + dur);
  const v = o.vol == null ? .15 : o.vol, att = o.att || .004;
  g.gain.setValueAtTime(.0001, t);
  g.gain.exponentialRampToValueAtTime(v, t + att);
  g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  osc.connect(g);
  let node = g;
  if (o.lp) { const fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = o.lp; g.connect(fl); node = fl; }
  node.connect(o.dest || AU.sfx);
  osc.start(t); osc.stop(t + dur + .03);
}
function noise(dur, o = {}) {
  const c = AU.ctx; if (!c || c.state !== 'running') return;
  const t = (o.at || c.currentTime) + (o.delay || 0);
  const s = c.createBufferSource(); s.buffer = AU.noise; s.loop = true;
  const f = c.createBiquadFilter(); f.type = o.ft || 'lowpass';
  f.frequency.setValueAtTime(o.f || 2000, t);
  if (o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, t + dur);
  if (o.q) f.Q.value = o.q;
  const g = c.createGain(), v = o.vol == null ? .2 : o.vol;
  g.gain.setValueAtTime(.0001, t);
  g.gain.exponentialRampToValueAtTime(v, t + .004);
  g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(o.dest || AU.sfx);
  s.start(t, Math.random() * .5); s.stop(t + dur + .03);
}
const semi = (f, s) => f * Math.pow(2, s / 12);
const SFX = {
  shoot() { if (gate('shoot', 75)) tone(rnd(820, 900), .06, { type: 'triangle', f2: 420, vol: .03 }); },
  hit() { if (gate('hit', 45)) noise(.05, { ft: 'highpass', f: 2600, vol: .045 }); },
  kill() { if (gate('kill', 38)) tone(rnd(300, 360), .08, { type: 'square', f2: 90, vol: .035, lp: 1700 }); },
  gem(n) { if (!gate('gem', 26)) return; const f = semi(520, Math.min(n, 24)); tone(f, .07, { type: 'sine', vol: .065 }); tone(f * 2, .05, { type: 'sine', vol: .018 }); },
  level() { [0, 4, 7, 12, 16].forEach((s, i) => tone(semi(523, s), .24, { type: 'triangle', vol: .1, delay: i * .055 })); },
  hurt() { tone(220, .22, { type: 'sawtooth', f2: 55, vol: .11, lp: 1100 }); noise(.15, { f: 900, vol: .11 }); },
  boom(big) { noise(big ? .9 : .42, { f: big ? 1500 : 1100, f2: 60, vol: big ? .42 : .2 }); tone(big ? 90 : 125, big ? .6 : .28, { type: 'sine', f2: 30, vol: big ? .38 : .2 }); },
  zap() { if (!gate('zap', 60)) return; noise(.12, { ft: 'bandpass', f: 3200, q: 2, vol: .11 }); tone(1300, .08, { type: 'square', f2: 200, vol: .025 }); },
  pulse() { tone(170, .3, { type: 'sine', f2: 55, vol: .17 }); noise(.18, { ft: 'bandpass', f: 600, f2: 200, vol: .06 }); },
  swish() { if (gate('swish', 95)) noise(.11, { ft: 'bandpass', f: 1900, f2: 650, q: 1.6, vol: .05 }); },
  pick() { tone(660, .08, { type: 'square', vol: .045, lp: 3000 }); tone(990, .1, { type: 'square', vol: .045, delay: .06, lp: 3000 }); },
  heal() { [0, 7, 12].forEach((s, i) => tone(semi(440, s), .2, { type: 'sine', vol: .09, delay: i * .07 })); },
  warn() { for (let i = 0; i < 3; i++) { tone(440, .2, { type: 'square', vol: .06, lp: 1400, delay: i * .46 }); tone(311, .2, { type: 'square', vol: .06, lp: 1400, delay: i * .46 + .23 }); } },
  ult() { noise(1.1, { ft: 'bandpass', f: 400, f2: 6000, q: .7, vol: .28 }); tone(110, .9, { type: 'sawtooth', f2: 880, vol: .1, lp: 3000 }); setTimeout(() => SFX.boom(true), 160); },
  chest() { [0, 4, 7, 11, 14, 19].forEach((s, i) => tone(semi(392, s), .3, { type: 'triangle', vol: .08, delay: i * .07 })); },
  evo() { [0, 7, 12, 16, 19, 24, 28].forEach((s, i) => tone(semi(330, s), .45, { type: 'triangle', vol: .09, delay: i * .08 })); noise(.8, { ft: 'highpass', f: 5000, vol: .05, delay: .3 }); },
  tap() { tone(1000, .03, { type: 'square', vol: .035 }); },
  deny() { tone(180, .1, { type: 'square', vol: .05, lp: 900 }); },
  die() { tone(300, 1.3, { type: 'sawtooth', f2: 40, vol: .14, lp: 900 }); noise(1, { f: 600, f2: 80, vol: .18 }); },
  win() { [0, 4, 7, 12, 7, 12, 16, 19, 24].forEach((s, i) => tone(semi(392, s), .38, { type: 'triangle', vol: .09, delay: i * .11 })); },
  spit() { if (gate('spit', 85)) tone(520, .08, { type: 'sine', f2: 200, vol: .035 }); },
  thud() { tone(70, .25, { type: 'sine', f2: 35, vol: .3 }); },
  dash() { noise(.16, { ft: 'bandpass', f: 900, f2: 3200, q: 1.2, vol: .12 }); tone(300, .12, { type: 'triangle', f2: 900, vol: .04 }); },
  roar() { tone(160, 1.1, { type: 'sawtooth', f2: 45, vol: .16, lp: 700 }); tone(110, 1.2, { type: 'square', f2: 38, vol: .07, lp: 400 }); noise(1.1, { f: 900, f2: 120, vol: .22 }); },
  bell() { if (!gate('bell', 120)) return; [1, 2.4, 3, 4.2].forEach((m, i) => tone(196 * m, 2.2 - i * .4, { type: 'sine', vol: [.2, .07, .06, .04][i], att: .003 })); },
  bellSmall() { if (!gate('bells', 120)) return; [1, 2.4].forEach((m, i) => tone(392 * m, 1, { type: 'sine', vol: i ? .03 : .07 })); },
  thread() { if (gate('thread', 120)) tone(1400, .35, { type: 'triangle', f2: 2400, vol: .035 }); },
  wave() { noise(.9, { f: 400, f2: 1600, vol: .14 }); },
  charge(d = 1) { tone(110, d, { type: 'sawtooth', f2: 880, vol: .07, lp: 2400, att: d * .6 }); noise(d, { ft: 'bandpass', f: 300, f2: 4000, q: 1, vol: .05 }); },
  tick() { tone(1500, .06, { type: 'square', vol: .06 }); tone(750, .3, { type: 'sine', vol: .08, delay: .02 }); },
  vortex() { if (gate('vortex', 200)) noise(.7, { ft: 'bandpass', f: 1800, f2: 200, q: 3, vol: .1 }); },
  rumble() { noise(2.4, { f: 160, f2: 60, vol: .35 }); tone(48, 2.2, { type: 'sine', vol: .3, att: .6 }); },
  clank() { noise(.08, { ft: 'bandpass', f: 2600, q: 4, vol: .22 }); tone(rnd(780, 900), .25, { type: 'triangle', vol: .07 }); },
  nova() { noise(2.6, { ft: 'highpass', f: 600, f2: 7000, vol: .38 }); noise(2.2, { f: 1200, f2: 60, vol: .45 }); tone(55, 2.4, { type: 'sine', f2: 28, vol: .45 }); tone(2200, 1.8, { type: 'sine', f2: 300, vol: .07 }); },
  scratch() { noise(rnd(.08, .2), { ft: 'bandpass', f: rnd(1500, 4000), q: rnd(4, 10), vol: .06 }); },
  whisper() { noise(1.6, { ft: 'bandpass', f: 900, f2: 2400, q: 9, vol: .07 }); noise(1.2, { ft: 'bandpass', f: 1400, f2: 700, q: 11, vol: .05, delay: .3 }); },
  slash(h) { if (!gate('slash', 60)) return; noise(.16, { ft: 'bandpass', f: h ? 3000 : 1400, f2: h ? 6000 : 500, q: 1.2, vol: h ? .1 : .12 }); tone(h ? 880 : 220, .12, { type: h ? 'sine' : 'sawtooth', f2: h ? 1760 : 90, vol: .05, lp: 2400 }); },
  heaven() { [0, 4, 7, 12, 16, 19].forEach((s, i) => tone(semi(262, s), 2.6, { type: i % 2 ? 'sine' : 'triangle', vol: .07, att: .4, delay: i * .05 })); noise(2, { ft: 'highpass', f: 6000, vol: .04 }); },
  portal() { tone(220, 1.2, { type: 'sine', f2: 1760, vol: .1, att: .2 }); tone(330, 1.2, { type: 'triangle', f2: 990, vol: .05, att: .3 }); noise(1.2, { ft: 'bandpass', f: 500, f2: 5000, q: 2, vol: .08 }); },
};

/* music: small generative loop, Am F C G, layers follow AU.intensity (0 title, 1 early, 2 late, 3 boss) */
const BPM = 104, STEP = 60 / BPM / 4;
const PROG = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]];
const BASS = [45, 41, 48, 43];
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
function musicStart() {
  if (AU.timer || !AU.ctx) return;
  AU.nextT = AU.ctx.currentTime + .1; AU.step = 0;
  AU.timer = setInterval(musicTick, 25);
}
function musicTick() {
  const c = AU.ctx; if (!c || c.state !== 'running') return;
  if (AU.nextT < c.currentTime - .3) AU.nextT = c.currentTime + .05;
  while (AU.nextT < c.currentTime + .12) { playStep(AU.step, AU.nextT); AU.nextT += stepDur(); AU.step = (AU.step + 1) % 64; }
}
function kick(t, d) {
  const c = AU.ctx, o = c.createOscillator(), g = c.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(42, t + .13);
  g.gain.setValueAtTime(.55, t); g.gain.exponentialRampToValueAtTime(.0001, t + .2);
  o.connect(g); g.connect(d); o.start(t); o.stop(t + .22);
}
function stepDur() { return AU.track === 'chase' ? 60 / 164 / 4 : AU.track === 'unknown' ? 60 / 84 / 4 : AU.track === 'credits' ? 60 / 76 / 4 : AU.track === 'final' ? 60 / 132 / 4 : STEP; }
/* the last stage: a choir, a pounding ostinato, a heroic line once the sword is light */
function playFinal(s, t) {
  const bar = (s >> 4) & 3, st = s & 15, d = AU.mus, sd = stepDur(), lv = (AU.uPhase || 7) - 7;
  const ch = [[57, 60, 64], [53, 57, 60], [55, 59, 62], [52, 56, 59]][bar];
  if (st === 0) { ch.forEach(n => tone(mtof(n), sd * 16, { type: 'triangle', vol: .04, att: .5, at: t, dest: d, lp: 1800 })); ch.forEach(n => tone(mtof(n + 12), sd * 16, { type: 'sine', vol: .02, att: .8, at: t, dest: d })); }
  if ([0, 2, 3, 6, 8, 10, 11, 14].includes(st)) tone(mtof(ch[0] - 24 + (st === 14 ? 7 : 0)), sd * 1.2, { type: 'sawtooth', vol: .05, lp: 620, at: t, dest: d });
  if (st % 4 === 0 || (lv >= 1 && st === 14) || (lv >= 2 && st % 2 === 0 && bar === 3)) kick(t, d);
  if (st === 4 || st === 12) noise(.2, { ft: 'bandpass', f: 1600, q: .7, vol: .15, at: t, dest: d });
  noise(.02, { ft: 'highpass', f: 8000, vol: st % 2 ? .015 : .03, at: t, dest: d });
  const mel = [[76, 0, 72, 74], [72, 0, 69, 72], [74, 0, 71, 74], [76, 0, 80, 83]][bar];
  if (P.heavenly && st % 4 === 0 && mel[st >> 2]) tone(mtof(mel[st >> 2]), sd * 3.5, { type: 'square', vol: .03, lp: 2800, at: t, dest: d });
  if (st === 0 && bar === 0) tone(1046, 1.6, { type: 'sine', vol: .035, at: t, dest: d });
  if (lv >= 2 && st % 2 === 1) tone(mtof(ch[2] + 24), sd * .8, { type: 'square', vol: .015, lp: 3000, at: t, dest: d });
}
function playCredits(s, t) {
  const bar = (s >> 4) & 3, st = s & 15, d = AU.mus, sd = stepDur();
  const ch = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]][bar];
  if (st === 0) ch.forEach(n => tone(mtof(n), sd * 16, { type: 'triangle', vol: .035, att: .6, at: t, dest: d, lp: 1600 }));
  if (st === 0 || st === 8) tone(mtof(ch[0] - 24), sd * 8, { type: 'sine', vol: .12, at: t, dest: d });
  if (st % 2 === 0) { const pat = [0, 1, 2, 1, 2, 0, 1, 2]; tone(mtof(ch[pat[st >> 1]] + 12), sd * 3, { type: 'sine', vol: .045, at: t, dest: d }); }
  if (st === 6 && bar % 2 === 0) tone(mtof(ch[2] + 24), sd * 8, { type: 'sine', vol: .03, att: .02, at: t, dest: d });
}
/* UNKNOWN: a tritone drone, a limping 7-against-16 pulse, scraping metal; layers pile up with each act */
function playUnknown(s, t) {
  const bar = (s >> 4) & 3, st = s & 15, ph = AU.uPhase || 1, d = AU.mus, sd = stepDur();
  const root = [33, 33, 34, 32][bar];
  if (st === 0) {
    tone(mtof(root), sd * 16, { type: 'sawtooth', vol: .075, lp: 260 + ph * 40, att: .5, at: t, dest: d });
    tone(mtof(root + 6), sd * 16, { type: 'triangle', vol: .04, lp: 500, att: .8, at: t, dest: d });
    if (ph >= 4) tone(mtof(root + 13), sd * 16, { type: 'sine', vol: .025, att: 1.2, at: t, dest: d });
  }
  if ([0, 3, 7, 10, 13].includes(st)) tone(mtof(root + 12), sd * 1.6, { type: 'square', vol: .05, lp: 520, at: t, dest: d });
  if ((s * 7 + bar * 3) % 11 === 0) { const f = 1180 + bar * 41; tone(f, .7, { type: 'sine', vol: .028, at: t, dest: d }); tone(f * 1.414, .55, { type: 'sine', vol: .018, at: t, dest: d }); }
  if (st === 8 && bar % 2) noise(sd * 8, { ft: 'bandpass', f: 800, f2: 2600, q: 7, vol: .045, at: t, dest: d });
  if (ph >= 2 && st % 2 === 1) noise(.025, { ft: 'highpass', f: 9000, vol: .018, at: t, dest: d });
  if (ph >= 3 && [0, 6, 8, 14].includes(st)) kick(t, d);
  if (ph >= 4 && st === 12) noise(.18, { ft: 'bandpass', f: 1500, q: .7, vol: .14, at: t, dest: d });
  if (ph >= 5 && [2, 9].includes(st)) tone(mtof([81, 82, 87, 76][bar]), sd * 5, { type: 'sine', vol: .03, att: .05, at: t, dest: d });
  if (ph >= 6) { if (st % 2 === 0) noise(.03, { ft: 'highpass', f: 7000, vol: .03, at: t, dest: d }); if (st === 4 || st === 11) noise(.12, { ft: 'bandpass', f: 2200, q: 1, vol: .1, at: t, dest: d }); }
  if (ph >= 7 && st % 4 === 2) tone(mtof(root + 24 + (st % 8 ? 1 : 0)), sd * 1.2, { type: 'square', vol: .025, lp: 1800, at: t, dest: d });
}
/* the run: fast, a siren that will not stop */
function playChase(s, t) {
  const bar = (s >> 4) & 3, st = s & 15, d = AU.mus, sd = stepDur();
  const rt = [33, 34, 33, 31][bar];
  if (st % 2 === 0) tone(mtof(rt + (st % 4 ? 12 : 0)), sd * 1.5, { type: 'square', vol: .06, lp: 700, at: t, dest: d });
  if (st % 4 === 0) kick(t, d);
  if (st === 4 || st === 12) noise(.13, { ft: 'bandpass', f: 1900, q: .8, vol: .16, at: t, dest: d });
  noise(.02, { ft: 'highpass', f: 8000, vol: st % 2 ? .02 : .035, at: t, dest: d });
  if (st === 0) { tone(880, sd * 8, { type: 'square', f2: 620, vol: .028, lp: 2200, at: t, dest: d }); tone(620, sd * 8, { type: 'square', f2: 880, vol: .028, lp: 2200, at: t + sd * 8, dest: d }); }
  if (st === 14 || st === 15) tone(mtof(rt + 30), sd * .8, { type: 'sawtooth', vol: .025, lp: 3000, at: t, dest: d });
}
function playStep(s, t) {
  if (!SAVE.music || AU.track === 'silent') return;
  if (AU.track === 'unknown') return playUnknown(s, t);
  if (AU.track === 'chase') return playChase(s, t);
  if (AU.track === 'credits') return playCredits(s, t);
  if (AU.track === 'final') return playFinal(s, t);
  const bar = (s >> 4) & 3, st = s & 15, I = AU.intensity, d = AU.mus;
  const ch = PROG[bar];
  if (st === 0) ch.forEach(n => tone(mtof(n), STEP * 15, { type: 'triangle', vol: .024, att: .35, at: t, dest: d, lp: 1100 }));
  if ([0, 3, 6, 8, 10, 11, 14].includes(st)) {
    tone(mtof(BASS[bar] + (st === 14 ? 12 : 0)), STEP * 1.6, { type: 'triangle', vol: I ? .2 : .12, at: t, dest: d });
    if (I >= 1) tone(mtof(BASS[bar]), STEP * 1.1, { type: 'square', vol: .035, lp: 480, at: t, dest: d });
  }
  if (st % 2 === 0) noise(.03, { ft: 'highpass', f: 7000, vol: st % 4 === 2 ? .045 : .02, at: t, dest: d });
  if (I >= 1 && st % 4 === 0) kick(t, d);
  if (I >= 2 && (st === 4 || st === 12)) noise(.14, { ft: 'bandpass', f: 1800, q: .8, vol: .15, at: t, dest: d });
  if (I >= 1 && st % 2 === 0) {
    const pat = [0, 1, 2, 1, 0, 2, 1, 2];
    tone(mtof(ch[pat[st >> 1]] + 12), STEP * 1.8, { type: 'sine', vol: I >= 2 ? .05 : .035, at: t, dest: d });
  }
  if (I === 0 && (st === 6 || st === 13)) tone(mtof(ch[2] + 12), STEP * 5, { type: 'sine', vol: .03, att: .02, at: t, dest: d });
  if (I >= 3 && [0, 3, 6, 10, 12].includes(st)) tone(mtof(ch[st % 3] + 24), STEP * 2, { type: 'square', vol: .028, lp: 2400, at: t, dest: d });
}

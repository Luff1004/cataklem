/* ================= story: swords drawn properly, and the mouse swings them on PC ================= */
const SWORD_LOOK = {
  wood:   { blade: ['#D9A86A', '#B9894F', '#8A6440'], guard: '#6B4A33', grip: '#4A3424', pom: '#8A6440', len: 1 },
  stone:  { blade: ['#B4B8C2', '#8C93A3', '#5E6474'], guard: '#5E6474', grip: '#3E3A44', pom: '#8C93A3', len: 1.02 },
  copper: { blade: ['#F0A066', '#D2793A', '#9C5224'], guard: '#3F8E7A', grip: '#4A2E22', pom: '#D2793A', len: 1.04 },
  salt:   { blade: ['#FFFFFF', '#F2EEDF', '#C9C2A8'], guard: '#D9A84E', grip: '#5A4A3A', pom: '#F2EEDF', len: 1.06 },
  ice:    { blade: ['#E9F7FB', '#9ED6E6', '#5FA8C4'], guard: '#E9F7FB', grip: '#2C5A74', pom: '#7CC6D8', len: 1.08 },
  ink:    { blade: ['#4A52A0', '#2B3170', '#141B40'], guard: '#FF4F9E', grip: '#141B40', pom: '#FF4F9E', len: 1.1 },
  scrib:  { blade: ['#3A4290', '#1E2558', '#0B0E22'], guard: '#FFD23F', grip: '#141B40', pom: '#FF4F9E', len: 1.18 },
};
const SWSPR = {};
// drawn lying flat: pommel at the left, point to the right; the hand sits at x = 14
function swordSpr(id) {
  if (SWSPR[id]) return SWSPR[id];
  const Lk = SWORD_LOOK[id] || SWORD_LOOK.wood, len = Math.round(64 * Lk.len), H = 26, cy = H / 2, R = mulberry(id.length * 31 + 7);
  const c = document.createElement('canvas'), res = 4; c.width = len * res; c.height = H * res;
  const x = c.getContext('2d'); x.scale(res, res); x.lineJoin = 'round'; x.lineCap = 'round';
  const ink = COL.ink, b0 = 24, bw = id === 'stone' ? 6.5 : id === 'scrib' ? 7 : 5.2, tip = len - 1;
  // blade outline (shape differs a little per sword)
  const blade = () => {
    x.beginPath();
    if (id === 'wood') { x.moveTo(b0, cy - bw); x.lineTo(tip - 8, cy - bw * .9); x.quadraticCurveTo(tip, cy - bw * .4, tip, cy); x.quadraticCurveTo(tip, cy + bw * .4, tip - 8, cy + bw * .9); x.lineTo(b0, cy + bw); }
    else if (id === 'stone') { x.moveTo(b0, cy - bw); x.lineTo(b0 + 12, cy - bw - .5); x.lineTo(b0 + 15, cy - bw + 1.5); x.lineTo(tip - 10, cy - bw * .8); x.lineTo(tip, cy - 1); x.lineTo(tip - 2, cy + 2); x.lineTo(tip - 12, cy + bw * .9); x.lineTo(b0 + 20, cy + bw); x.lineTo(b0 + 17, cy + bw - 1.5); x.lineTo(b0, cy + bw); }
    else if (id === 'salt' || id === 'ice') { x.moveTo(b0, cy - bw * .7); x.lineTo(b0 + 10, cy - bw); x.lineTo(tip - 14, cy - bw * .8); x.lineTo(tip - 6, cy - bw * 1.1); x.lineTo(tip, cy); x.lineTo(tip - 6, cy + bw * 1.1); x.lineTo(tip - 14, cy + bw * .8); x.lineTo(b0 + 10, cy + bw); x.lineTo(b0, cy + bw * .7); }
    else if (id === 'scrib') { x.moveTo(b0, cy - bw); for (let k = 1; k < 8; k++) { const px = b0 + (tip - 10 - b0) * k / 7; x.lineTo(px, cy - bw + (k % 2 ? -1.4 : 1)); } x.lineTo(tip, cy); for (let k = 7; k >= 1; k--) { const px = b0 + (tip - 10 - b0) * k / 7; x.lineTo(px, cy + bw + (k % 2 ? 1.4 : -1)); } x.lineTo(b0, cy + bw); }
    else { x.moveTo(b0, cy - bw); x.lineTo(tip - 12, cy - bw * .85); x.lineTo(tip, cy); x.lineTo(tip - 12, cy + bw * .85); x.lineTo(b0, cy + bw); }
    x.closePath();
  };
  // ink rim and a pink offset, like the rest of the art
  x.save(); x.translate(1.2, 1.2); blade(); x.fillStyle = COL.pink; x.globalAlpha = .7; x.fill(); x.restore(); x.globalAlpha = 1;
  blade(); x.fillStyle = ink; x.lineWidth = 2.6; x.strokeStyle = ink; x.stroke();
  // two-tone steel: lit upper half, shaded lower half, a fuller down the middle
  blade(); x.save(); x.clip();
  const g = x.createLinearGradient(0, cy - bw, 0, cy + bw); g.addColorStop(0, Lk.blade[0]); g.addColorStop(.48, Lk.blade[1]); g.addColorStop(.52, Lk.blade[2]); g.addColorStop(1, Lk.blade[1]);
  x.fillStyle = g; x.fillRect(b0 - 2, 0, len, H);
  if (id !== 'wood' && id !== 'scrib') { x.strokeStyle = 'rgba(20,27,64,.35)'; x.lineWidth = 1.4; x.beginPath(); x.moveTo(b0 + 3, cy); x.lineTo(tip - 16, cy); x.stroke(); x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = .8; x.beginPath(); x.moveTo(b0 + 3, cy - 1.2); x.lineTo(tip - 16, cy - 1.2); x.stroke(); }
  x.strokeStyle = 'rgba(255,255,255,.75)'; x.lineWidth = 1; x.beginPath(); x.moveTo(b0 + 2, cy - bw + 1.2); x.lineTo(tip - 10, cy - bw * .7); x.stroke();
  if (id === 'wood') { x.strokeStyle = 'rgba(90,60,30,.45)'; x.lineWidth = .8; for (let k = 0; k < 5; k++) { const yy = cy - bw + 2 + k * bw * .4; x.beginPath(); x.moveTo(b0, yy); x.bezierCurveTo(b0 + 12, yy + 1.5, b0 + 22, yy - 1.5, tip - 6, yy + (R() - .5)); x.stroke(); } x.fillStyle = 'rgba(90,60,30,.5)'; x.beginPath(); x.ellipse(b0 + 18, cy + 1, 2.4, 1.3, 0, 0, TAU); x.fill(); }
  if (id === 'stone') { x.fillStyle = 'rgba(20,27,64,.25)'; for (let k = 0; k < 9; k++) x.fillRect(b0 + R() * (tip - b0 - 8), cy - bw + R() * bw * 2, 1.4, 1.4); }
  if (id === 'copper') { x.fillStyle = 'rgba(63,142,122,.55)'; for (let k = 0; k < 6; k++) { x.beginPath(); x.arc(b0 + 4 + R() * (tip - b0 - 16), cy - bw + R() * bw * 2, .8 + R() * 1.4, 0, TAU); x.fill(); } }
  if (id === 'salt' || id === 'ice') { x.strokeStyle = id === 'ice' ? 'rgba(255,255,255,.8)' : 'rgba(180,160,120,.5)'; x.lineWidth = .8; x.beginPath(); for (let k = 0; k < 5; k++) { const px = b0 + 6 + k * (tip - b0 - 12) / 5; x.moveTo(px, cy - bw); x.lineTo(px + 4, cy); x.lineTo(px, cy + bw); } x.stroke(); }
  if (id === 'ink' || id === 'scrib') { x.strokeStyle = COL.pink; x.lineWidth = 1.2; x.beginPath(); x.moveTo(b0 + 2, cy + bw - 1); x.lineTo(tip - 8, cy + bw * .5); x.stroke(); x.fillStyle = 'rgba(255,79,158,.6)'; for (let k = 0; k < 4; k++) { x.beginPath(); x.arc(b0 + 8 + k * 9, cy - 1 + (k % 2) * 2, 1.1, 0, TAU); x.fill(); } }
  x.restore();
  // crossguard
  const gw = id === 'scrib' ? 11 : id === 'stone' ? 10 : 9;
  x.fillStyle = Lk.guard; x.strokeStyle = ink; x.lineWidth = 1.8;
  x.beginPath(); x.roundRect(b0 - 4, cy - gw, 4.5, gw * 2, 2); x.fill(); x.stroke();
  x.fillStyle = 'rgba(255,255,255,.4)'; x.fillRect(b0 - 3.4, cy - gw + 1.5, 1.2, gw * 2 - 3);
  if (id === 'salt' || id === 'ink' || id === 'scrib') { x.fillStyle = COL.pink; x.beginPath(); x.arc(b0 - 1.8, cy, 1.8, 0, TAU); x.fill(); }
  // grip with a wrap, and the pommel
  x.fillStyle = Lk.grip; x.beginPath(); x.roundRect(6, cy - 2.6, b0 - 9, 5.2, 1.5); x.fill(); x.stroke();
  x.strokeStyle = 'rgba(255,255,255,.3)'; x.lineWidth = 1; for (let k = 0; k < 4; k++) { const px = 8 + k * 3.6; x.beginPath(); x.moveTo(px, cy - 2.4); x.lineTo(px + 2.2, cy + 2.4); x.stroke(); }
  x.fillStyle = Lk.pom; x.strokeStyle = ink; x.lineWidth = 1.8; x.beginPath(); x.arc(5, cy, 3.6, 0, TAU); x.fill(); x.stroke();
  x.fillStyle = 'rgba(255,255,255,.6)'; x.beginPath(); x.arc(4, cy - 1.2, 1.1, 0, TAU); x.fill();
  c.len = len; c.hgt = H;
  return (SWSPR[id] = c);
}
// the sword in hand: hand point (bx, by), angle a, world length L
function drawSwordSpr(id, bx, by, a, L, plus) {
  const img = swordSpr(id), s = L / (img.len - 14);
  ctx.save();
  ctx.setTransform(K, 0, 0, K, OX, OY); ctx.translate(bx, by * TY); ctx.scale(1, TY + (1 - TY) * Math.abs(Math.cos(a)));
  ctx.rotate(a); ctx.scale(s, s);
  if ((plus || 0) >= 3) { ctx.shadowColor = (plus || 0) >= 5 ? COL.yellow : COL.pink; ctx.shadowBlur = 10; }
  ctx.drawImage(img, -14, -img.hgt / 2, img.len, img.hgt);
  ctx.restore(); wt();
}
function swordIconInto(x, id) {
  const img = swordSpr(id);
  x.save(); x.translate(32, 32); x.rotate(-Math.PI / 4); const s = 60 / img.len; x.scale(s, s); x.drawImage(img, -img.len / 2, -img.hgt / 2, img.len, img.hgt); x.restore();
}

/* ---------- PC: click to swing toward the cursor ---------- */
const MOUSE = { x: 0, y: 0, down: false, seen: false };
addEventListener('mousemove', e => { MOUSE.x = e.clientX; MOUSE.y = e.clientY; MOUSE.seen = true; });
addEventListener('mousedown', e => { if (e.button === 0 && e.target === cv) { MOUSE.down = true; MOUSE.x = e.clientX; MOUSE.y = e.clientY; } });
addEventListener('mouseup', e => { if (e.button === 0) MOUSE.down = false; });
addEventListener('blur', () => { MOUSE.down = false; });
function mouseWorld() { return [(MOUSE.x * DPR - OX) / K, (MOUSE.y * DPR - OY) / (K * TY)]; }
function mouseAim() { return IS_PC && MOUSE.seen && !(typeof PAD !== 'undefined' && PAD.on); }

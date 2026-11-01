/* test hooks, only with ?debug in the address */
if (/debug/.test(location.search)) {
  window.CK = {
    get G() { return G; }, get HZ() { return HZ; }, get STATE() { return STATE; }, P, get E() { return E; }, SAVE,
    jump(t) { G.time = t; for (let i = 0; i < TIMELINE.length; i++) if (TIMELINE[i].t < t - 4) G.ev[i] = 1; },
    god() { P.inv = 1e9; },
    give(id, lv = 5) { if (WEAPONS[id]) { let w = G.weapons.find(x => x.id === id); if (!w) { addWeapon(id); w = G.weapons[G.weapons.length - 1]; } w.lv = lv; } else { let p = G.passives.find(x => x.id === id); if (!p) G.passives.push(p = { id, lv }); p.lv = lv; recalc(); } G.buildDirty = true; },
    evo(id) { const w = G.weapons.find(x => x.id === id); if (w) { w.evo = true; G.buildDirty = true; } },
    pick(i = 0) { const el = $('cards').children[i]; if (el && STATE === 'level') chooseCard(i, el); },
    chest(b) { G.wantChest.push(!!b); },
    ult() { G.ult = G.ultNeed; },
    fps: 0,
    sim(sec, smart = true) {
      const dt = 1 / 60, n = sec * 60; let tt = 0;
      for (let i = 0; i < n; i++) {
        if (STATE === 'level' && G.choice === 'relic') { const c = relicChoices(); applyChoice(c[0]); G.relicPend--; STATE = G.relicPend > 0 ? 'level' : 'play'; hideAll(); continue; }
        if (STATE === 'play' && G.mode === 'boss' && G.relicPend > 0) { G.choice = 'relic'; STATE = 'level'; continue; }
        if (STATE === 'level') { const c = rollChoices(); let o = c[0]; if (smart) { o = c.find(x => x.k === 'w' && !x.isNew) || c.find(x => x.k === 'p' && (EVO_OF[x.id] || []).some(id => G.weapons.some(w => w.id === id))) || c[0]; } applyChoice(o); G.pend--; STATE = G.pend > 0 ? 'level' : 'play'; hideAll(); continue; }
        if (STATE === 'chest') { hideAll(); STATE = 'play'; continue; }
        if (STATE === 'cut') { setCam(G.camX, G.camY); updateCut(dt); tt += dt; continue; }
        if (STATE !== 'play' && STATE !== 'dying' && STATE !== 'winning') return 'stopped ' + STATE;
        tt += dt;
        // auto-kite: circle with a slow drift, flee the nearest threat
        let mx = Math.cos(tt * .6), my = Math.sin(tt * .6);
        const nb = nearest(1, 90)[0]; if (nb) { const dx = P.x - nb.x, dy = P.y - nb.y, d = Math.hypot(dx, dy) || 1; mx = mx * .4 + dx / d; my = my * .4 + dy / d; }
        for (const b of EB) { const dx = P.x - b.x, dy = P.y - b.y, d = Math.hypot(dx, dy); if (d < 60) { mx += dx / d * .8; my += dy / d * .8; } }
        if (G.u && G.u.stage === 'flee') { const dx = -P.x, dy = ARENA_R + 120 - P.y, l = Math.hypot(dx, dy) || 1; mx = dx / l; my = dy / l; }
        if (G.u && G.u.stage === 'chase') { let gx = 0; const row = OB.filter(o => !o.dead && o.y > P.y - 10 && o.y < P.y + 120); if (row.length) { gx = row[0].lane; } mx = clamp((gx - P.x) / 30, -1, 1); my = Math.abs(gx - P.x) > 20 && row.length && row[0].y - P.y < 50 ? .1 : 1; }
        if (G.u && G.u.stage === 'maze') { let best = null, bs = -1e9; for (let k = 0; k < 16; k++) { const a = k / 16 * TAU, x = P.x + Math.cos(a) * 70, y = P.y + Math.sin(a) * 70; if (!walkable(x, y)) continue; const sc = Math.hypot(x - G.boss.x, y - G.boss.y); if (sc > bs) { bs = sc; best = a; } } if (best !== null) { mx = Math.cos(best); my = Math.sin(best); } }
        INPUT.mx = mx; INPUT.my = my;
        if (G.ult >= G.ultNeed && (E.length > 60 || G.mode === 'boss')) useUlt();
        if (G.mode === 'boss' && !(G.u && G.u.stage !== 'arena')) { const dl = Math.hypot(P.x, P.y); if (dl > 250) { INPUT.mx -= P.x / dl; INPUT.my -= P.y / dl; } if (P.inv <= 0 && Math.random() < .03) tryDash(); }
        setCam(G.camX, G.camY);
        step(dt);
        if (STATE === 'play') { if (G.wantChest.length) { chestRewards(G.wantChest.shift()); } else if (G.pend > 0) STATE = 'level'; }
        if (STATE === 'dying') { G.dieT -= dt; if (G.dieT <= 0) { STATE = 'title'; return 'died ' + G.time.toFixed(0) + 's lv' + G.level + ' kills' + G.kills + ' bosses' + G.bosses; } }
        if (STATE === 'winning') { G.winT -= dt; if (G.winT <= 0) { STATE = 'title'; return 'WON ' + G.time.toFixed(0) + 's lv' + G.level + ' kills' + G.kills + ' fight' + (G.fightT || 0).toFixed(0) + ' hp' + Math.round(P.hp); } }
      }
      return 'alive ' + G.time.toFixed(0) + 's lv' + G.level + ' hp' + Math.round(P.hp) + '/' + Math.round(P.maxHp) + ' kills' + G.kills + ' en' + E.length + ' boss' + (G.boss ? G.boss.bk + ':' + Math.round(G.boss.hp) + ' ph' + phaseOf(G.boss) : '-') + ' rel:' + (G.relics || []).join(',') + ' W:' + G.weapons.map(w => w.id + (w.evo ? '*' : w.lv)).join(',') + ' P:' + G.passives.map(p => p.id + p.lv).join(',');
    },
    boss(id, smartDodge = true) {
      setupBossRun(id);
      for (let i = 0; i < G.draftMax; i++) { const c = bossDraftChoices(); const o = c.find(x => x.k === 'w' && !x.isNew) || c[0]; applyChoice(o); applyChoice(o); }
      spawnArenaBoss(); for (const e of E) e.introScale = 1; STATE = 'play'; G.choice = 'level';
      $('hud').hidden = false; $('hud').classList.add('arena'); $('bossBar').hidden = false; hideAll();
    },
    intro(id) { setupBossRun(id); startIntro(); },
    phase(n) { const b = G.boss; (b.share || b).hp = b.maxHp * (n === 2 ? .6 : .3) + 1; b.hp = (b.share || b).hp; },
    uact(n) { const e = G.boss; e.phase = n - 1; startUCut(n); },
    get U() { return G.u; }, get INPUT() { return INPUT; }, get OB() { return OB; },
    tick(dt) { setCam(G.camX, G.camY); step(dt); if (STATE === 'cut') updateCut(dt); },
    walk(x, y) { return walkable(x, y); },
    st: { enter: (id, how) => enterArea(id, how || {}), wd: () => WD, act: () => doAct(), near: () => nearAct(), adv: () => advanceDlg(), S: () => SAVE.story, areas: () => Object.keys(AREAS), setf, give: giveSword, gate: id => storyGate(id), gateEnd: w => storyGateEnd(w), spec: id => AREAS[id], EXIT_CH, ents: () => WD.ents, dlg: () => !!DLG, close: () => closeStoryScreen(), exitInfo: s => exitInfo(s), steps: () => STORY_STEPS },
    pad: dt => padPoll(dt),
    finish() { const e = G.boss; e.hp = 1; G.uPhaseT = 999; },
    run() { document.getElementById('btnPlay').click(); document.getElementById('btnGo').click(); },
    bench() { const t = performance.now(); for (let i = 0; i < 20; i++) render(0); const r = (performance.now() - t) / 20; const t2 = performance.now(); for (let i = 0; i < 20; i++) step(1 / 60); return { render: r.toFixed(2), step: ((performance.now() - t2) / 20).toFixed(2) }; },
  };
  let n = 0, t0 = performance.now();
  (function f(t) { n++; if (t - t0 > 1000) { CK.fps = n; n = 0; t0 = t; } requestAnimationFrame(f); })(t0);
}

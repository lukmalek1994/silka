/* Siłka – workout.js: VIEWS.today (ekran główny, aktywny trening, podsumowanie) */
(function () {
  'use strict';

  const W_DAYS = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'];
  const W_MONTHS = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca',
    'sierpnia', 'września', 'października', 'listopada', 'grudnia'];

  // ---------- lokalne pomocnicze (nazwy z prefiksem w*, by nie kolidować z core) ----------
  const wNum = (el, k) => +el.dataset[k];
  const wWorkout = (wid) => ALLW.find(w => w.id === wid) || WORKOUTS[0];
  const wVar = (item) => EX[item.id].variants[item.v];
  const wCur = (item) => ({ v: item.v, w: item.w, t: item.t });
  const wIsGym = (def) => def.variants.length === 1 && !!def.variants[0].w;
  const wUnit = (def) => def.type === 'time' ? 's' : 'powt.';
  const wRound = (n) => Math.round(n * 100) / 100;
  const wDoneSets = (item) => item.sets.filter(s => s.done);
  function wClock(sec) {
    sec = Math.max(0, Math.floor(sec));
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    const pad = (x) => String(x).padStart(2, '0');
    return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
  }
  function wTodayStr() {
    const d = new Date();
    return `${W_DAYS[d.getDay()]}, ${d.getDate()} ${W_MONTHS[d.getMonth()]}`;
  }
  function wCommit() { save(); render(); }
  function wTop() { try { window.scrollTo(0, 0); } catch (e) { /* noop */ } }

  // Następna niewykonana seria (od bieżącego ćwiczenia, potem kolejne, potem wcześniejsze)
  function wNextThing(i) {
    const items = S.active.items, n = items.length;
    for (let k = 0; k < n; k++) {
      const idx = (i + k) % n, it = items[idx];
      if (it.skip) continue;
      const s = it.sets.findIndex(x => !x.done);
      if (s >= 0) return { i: idx, s, label: `${wVar(it).n} (seria ${s + 1}/${it.sets.length})` };
    }
    return null;
  }
  function wStartRest(i) {
    const nt = wNextThing(i);
    if (!nt) return false;
    startTimer({ mode: 'rest', secs: EX[S.active.items[i].id].rest, label: 'Przerwa – ' + nt.label, ni: nt.i });
    return true;
  }
  // Duże odliczanie przerwy na karcie ćwiczenia, które robisz jako następne
  function wRestBox(i) {
    const t = S.active.timer;
    if (!t || t.mode !== 'rest' || t.ni !== i) return '';
    const item = S.active.items[i], s = item.sets.findIndex(x => !x.done);
    const rem = Math.max(0, (t.end - Date.now()) / 1000);
    const pct = t.total > 0 ? Math.max(0, Math.min(100, (1 - rem / t.total) * 100)) : 100;
    return `<div class="rest-big">
      <div class="rest-lbl">Przerwa${s >= 0 ? ` · potem seria ${s + 1}/${item.sets.length}` : ''}</div>
      <div class="rest-time" data-tleft>${mmss(Math.ceil(rem))}</div>
      <div class="rest-track"><div class="rest-prog" data-tprog style="width:${pct.toFixed(1)}%"></div></div>
      <div class="rest-btns">
        <button class="tb-btn" data-act="tAdd" data-d="-15">−15 s</button>
        <button class="tb-btn" data-act="tAdd" data-d="15">+15 s</button>
        <button class="tb-btn tb-btn-main" data-act="tSkip">Pomiń</button>
      </div>
    </div>`;
  }

  // ---------- A) EKRAN GŁÓWNY ----------
  function wHome() {
    const pick = ui.pick ?? S.nextIdx;
    const wo = ALLW[pick] || WORKOUTS[0];
    const hist = S.history || [];
    let h = `<div class="page">
      <div class="large-title">Trening</div>
      <div class="subtitle">${esc(wTodayStr())}</div>`;

    if (!navigator.standalone && !S.installHintHidden) {
      h += `<div class="banner" style="margin-top:12px">
        <span>Zainstaluj na iPhonie: w Safari stuknij Udostępnij → Do ekranu początkowego</span>
        <button class="icon-btn" data-act="wHideHint" aria-label="Zamknij">×</button></div>`;
    }

    h += `<div class="chips" style="margin-top:12px">` + WORKOUTS.map((w, k) =>
      `<button class="chip${k === pick ? ' active' : ''}" style="--c:${w.color}" data-act="wPick" data-k="${k}">${esc(w.name)}${k === S.nextIdx ? ' • następny' : ''}</button>`
    ).join('') + `</div>`;

    h += `<div class="card" style="--c:${wo.color}">
      <div class="ex-group">${pick === S.nextIdx ? 'Następny trening' : 'Wybrany trening'}</div>
      <div class="large-title" style="font-size:28px;color:var(--c)">${esc(wo.name)}</div>
      <div class="subtitle">${esc(wo.sub)}</div>
      <div style="margin-top:8px">`;
    wo.ex.forEach(id => {
      const def = EX[id], st = getSt(id), vr = def.variants[st.v];
      h += `<div class="row tappable ex-row" data-act="wInfo" data-id="${id}" data-v="${st.v}">
        <span style="--c:${wo.color};display:contents">${exThumb(id, st.v)}</span>
        <div class="row-main">
          <div class="row-title">${esc(vr.n)}</div>
          ${vr.n !== def.name ? `<div class="row-sub">${esc(def.name)}</div>` : ''}
        </div><div class="row-right">${esc(targetStr(def, st))}</div></div>`;
    });
    h += `<div class="row"><div class="row-main"><div class="row-sub">${esc(WARMUP)}</div></div></div>
      ${wo.cardio ? `<div class="row"><div class="row-main"><div class="row-title">Kardio: ${esc(wo.cardio)}</div></div></div>` : ''}
      </div>
      <button class="btn btn-primary btn-block" style="margin-top:12px" data-act="wStart">Rozpocznij trening</button>
    </div>`;

    const thisWeek = mondayKey(new Date());
    const weekCnt = hist.filter(e => mondayKey(new Date(e.date)) === thisWeek).length;
    const last = hist[hist.length - 1];
    h += `<div class="stats">
      <div class="stat"><div class="stat-val">${weekCnt}</div><div class="stat-lbl">w tym tygodniu</div></div>
      <div class="stat"><div class="stat-val">${last ? esc(last.name) : '–'}</div><div class="stat-lbl">${last ? esc(relDay(last.date)) : 'ostatni trening'}</div></div>
      <div class="stat"><div class="stat-val">${hist.length}</div><div class="stat-lbl">${esc(plural(hist.length, 'trening', 'treningi', 'treningów'))} łącznie</div></div>
    </div>`;

    h += `<div class="section-title">Gotowe treningi</div><div class="lib">` + LIBRARY.map((w, j) => {
      const k = WORKOUTS.length + j;
      return `<button class="lib-card${k === pick ? ' active' : ''}" style="--c:${w.color}" data-act="wPick" data-k="${k}">
        <span class="lib-media">${exThumb(w.ex[0], getSt(w.ex[0]).v)}</span>
        <span class="lib-name">${esc(w.name)}</span>
        <span class="lib-sub">${esc(w.sub)} · ${w.ex.length} ćw.</span></button>`;
    }).join('') + `</div>`;

    if (typeof stretchHomeHTML === 'function') h += stretchHomeHTML();

    const old = !S.lastExport || (Date.now() - Date.parse(S.lastExport)) > 14 * 864e5;
    if (hist.length && old) {
      h += `<div class="card">
        <div class="row-sub">${S.lastExport ? 'Ostatnia kopia zapasowa: ' + esc(fmtDate(S.lastExport)) + '.' : 'Nie masz jeszcze kopii zapasowej.'}
        Dane są tylko na tym telefonie – wyeksportuj je w Ustawieniach.</div>
        <button class="btn btn-secondary btn-small" style="margin-top:8px" data-act="tab" data-tab="settings">Przejdź do Ustawień</button>
      </div>`;
    }
    return h + `</div>`;
  }

  // ---------- B) AKTYWNY TRENING ----------
  function wSetRow(item, i, s, def) {
    const set = item.sets[s], isTime = def.type === 'time', step = isTime ? 5 : 1;
    return `<div class="set-row${set.done ? ' done' : ''}">
      <span class="muted" style="min-width:20px">${s + 1}</span>
      <div class="stepper">
        <button data-act="wRep" data-i="${i}" data-s="${s}" data-d="${-step}">−</button>
        <input type="text" inputmode="numeric" value="${esc(set.r)}" data-chg="wRepIn" data-i="${i}" data-s="${s}" aria-label="Seria ${s + 1}">
        <button data-act="wRep" data-i="${i}" data-s="${s}" data-d="${step}">+</button>
      </div>
      <span class="muted">${wUnit(def)}</span>
      <span style="flex:1"></span>
      ${isTime && !set.done ? `<button class="icon-btn" data-act="wHold" data-i="${i}" data-s="${s}" aria-label="Start">▶</button>` : ''}
      <button class="check${set.done ? ' on' : ''}" data-act="wSet" data-i="${i}" data-s="${s}" aria-label="Seria wykonana">✓</button>
    </div>`;
  }

  function wExCard(item, i, color) {
    const def = EX[item.id], vr = wVar(item);
    if (item.skip) {
      return `<div class="ex-card skipped" style="--c:${color}">
        <div class="ex-group">${esc(def.name)}</div>
        <div class="ex-name">${esc(vr.n)} – pominięte</div>
        <button class="btn btn-secondary btn-small" style="margin-top:8px" data-act="wSkip" data-i="${i}">Przywróć</button>
      </div>`;
    }
    const n = def.variants.length;
    let h = `<div class="ex-card" style="--c:${color}">
      ${exMedia({ ex: item.id, v: item.v })}
      <div class="ex-group">${esc(def.name)}</div>
      <div class="ex-name">${esc(vr.n)}</div>`;
    if (n > 1) {
      h += `<div class="ex-variant-nav">
        <button data-act="wVar" data-i="${i}" data-d="-1"${item.v <= 0 ? ' disabled' : ''} aria-label="Łatwiejszy">‹</button>
        <span>poziom ${item.v + 1}/${n}</span>
        <button data-act="wVar" data-i="${i}" data-d="1"${item.v >= n - 1 ? ' disabled' : ''} aria-label="Trudniejszy">›</button>
      </div>`;
    }
    const unitTxt = def.type === 'time' ? ' s' : '';
    const notes = [def.note, vr.nt].filter(Boolean).map(esc).join(' · ');
    h += `<div class="ex-meta">Cel: ${esc(targetStr(def, wCur(item)))} · zakres ${vr.min}–${vr.max}${unitTxt} · przerwa ${mmss(def.rest)}${notes ? '<br>' + notes : ''}</div>`;
    h += wHowHtml(item.id, item.v, true);
    h += wRestBox(i);
    if (vr.w) {
      const inc = def.inc || 2.5;
      h += `<div class="set-row">
        <span class="muted">${wIsGym(def) ? 'Ciężar' : 'Obciążenie +'}</span>
        <div class="stepper">
          <button data-act="wW" data-i="${i}" data-d="${-inc}">−</button>
          <input type="text" inputmode="decimal" placeholder="kg" value="${item.w != null ? esc(fmt(item.w)) : ''}" data-chg="wWIn" data-i="${i}" aria-label="Ciężar w kg">
          <button data-act="wW" data-i="${i}" data-d="${inc}">+</button>
        </div>
        <span class="muted">kg</span>
      </div>`;
    }
    item.sets.forEach((_, s) => { h += wSetRow(item, i, s, def); });
    const last = item.sets[item.sets.length - 1];
    const canDel = item.sets.length > 1 && last && !last.done && item.sets.length > def.sets;
    h += `<div style="display:flex;gap:8px;margin-top:8px">
      <button class="btn btn-secondary btn-small" data-act="wAddSet" data-i="${i}">+ seria</button>
      ${canDel ? `<button class="btn btn-secondary btn-small" data-act="wDelSet" data-i="${i}">− seria</button>` : ''}
      <span style="flex:1"></span>
      <button class="btn btn-danger btn-small" data-act="wSkip" data-i="${i}">Pomiń</button>
    </div></div>`;
    return h;
  }

  // Instrukcja (opis wariantu + punkty techniki)
  function wHowHtml(id, v, toggle) {
    const how = figHow(id, v);
    if (!how) return '';
    const open = !toggle || S.settings.tips !== false;
    let h = `<div class="howto">`;
    if (how.how) h += `<div class="howto-v">${esc(how.how)}</div>`;
    if (toggle) h += `<button class="howto-btn" data-act="wTips">${open ? 'Ukryj technikę ▴' : 'Pokaż technikę ▾'}</button>`;
    if (open) h += `<ol>${how.tips.map(t => `<li>${esc(t)}</li>`).join('')}</ol>`;
    return h + `</div>`;
  }

  const wItemDone = (it) => it.skip || (it.sets.length > 0 && it.sets.every(s => s.done));

  function wDots() {
    const a = S.active, n = a.items.length, cur = ui.pg || 0;
    const dot = (k, label, done) =>
      `<button class="pg-dot${done ? ' done' : ''}${k === cur ? ' cur' : ''}" data-act="wGo" data-k="${k}" aria-label="Karta ${k + 1}">${done ? '✓' : label}</button>`;
    let h = dot(0, 'R', a.warm);
    a.items.forEach((it, i) => { h += dot(i + 1, String(i + 1), wItemDone(it)); });
    return h + dot(n + 1, wWorkout(a.wid).cardio ? 'K' : '🏁', a.cardio);
  }

  function wNav(k, last) {
    return `<div class="pg-nav">
      ${k > 0 ? `<button class="btn btn-secondary btn-small" data-act="wGo" data-k="${k - 1}">‹ Wstecz</button>` : '<span></span>'}
      ${last ? '' : `<button class="btn btn-secondary btn-small" data-act="wGo" data-k="${k + 1}">Dalej ›</button>`}
    </div>`;
  }

  function wActive() {
    const a = S.active, wo = wWorkout(a.wid), n = a.items.length;
    let h = `<div class="page">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <button class="btn btn-danger btn-small" data-act="wCancel">Anuluj</button>
        <span id="elapsed" class="subtitle" style="font-variant-numeric:tabular-nums;margin:0">${wClock((Date.now() - a.start) / 1000)}</span>
      </div>
      <div class="large-title" style="color:${wo.color}">${esc(wo.name)}</div>
      <div class="pg-dots" id="pgDots" style="--c:${wo.color}">${wDots()}</div>
      <div class="pager" id="pager">`;
    // 0: rozgrzewka
    h += `<section class="pg"><div class="ex-card" style="--c:${wo.color}">
        ${exMedia({ ex: '_warm', v: 0 })}
        <div class="ex-group">Rozgrzewka</div>
        <div style="display:flex;align-items:center;gap:12px">
          <div class="ex-meta" style="flex:1">${esc(WARMUP)}</div>
          <button class="check${a.warm ? ' on' : ''}" data-act="wWarm" aria-label="Rozgrzewka zrobiona">✓</button>
        </div>
      </div>${wNav(0)}</section>`;
    a.items.forEach((it, i) => { h += `<section class="pg">${wExCard(it, i, wo.color)}${wNav(i + 1)}</section>`; });
    // ostatnia: kardio + zakończ
    h += `<section class="pg">`;
    if (wo.cardio) {
      h += `<div class="ex-card" style="--c:${wo.color}">
        ${exMedia({ ex: '_run', v: 0 })}
        <div class="ex-group">Kardio</div>
        <div style="display:flex;align-items:center;gap:12px">
          <div class="ex-name" style="flex:1">${esc(wo.cardio)}</div>
          ${a.cardio ? '' : `<button class="icon-btn" data-act="wCardio" aria-label="Start kardio">▶</button>`}
          <button class="check${a.cardio ? ' on' : ''}" data-act="wCardioDone" aria-label="Kardio zrobione">✓</button>
        </div>
      </div>`;
    } else {
      h += `<div class="ex-card" style="--c:${wo.color}"><div class="ex-group">Koniec</div><div class="ex-name">Wszystkie ćwiczenia za Tobą 💪</div></div>`;
    }
    h += `<button class="btn btn-primary btn-block" style="margin-top:4px" data-act="wFinish">Zakończ trening</button>
      ${wNav(n + 1, true)}</section>`;
    return h + `</div></div>`;
  }

  // ---------- przewijanie kart ----------
  function wMarkDots(k) {
    const box = document.getElementById('pgDots');
    if (!box) return;
    Array.prototype.forEach.call(box.children, (b, j) => b.classList.toggle('cur', j === k));
    const c = box.children[k];
    if (c && c.scrollIntoView) {
      const l = c.offsetLeft - box.clientWidth / 2 + c.clientWidth / 2;
      box.scrollTo ? box.scrollTo({ left: l, behavior: 'smooth' }) : (box.scrollLeft = l);
    }
  }
  function wGoTo(k, smooth) {
    const p = document.getElementById('pager');
    if (!p) return;
    k = Math.max(0, Math.min(p.children.length - 1, k));
    ui.pg = k;
    const x = k * p.clientWidth;
    if (smooth && p.scrollTo) p.scrollTo({ left: x, behavior: 'smooth' }); else p.scrollLeft = x;
    wMarkDots(k);
    if (smooth) {
      const top = p.getBoundingClientRect().top;
      if (top < 0) try { window.scrollBy({ top: top - 120, behavior: 'smooth' }); } catch (e) { window.scrollBy(0, top - 120); }
    }
  }
  function wAdvanceLater(k) {
    setTimeout(() => { if (S.active && !S.active.summary && ui.tab === 'today') wGoTo(k, true); }, 650);
  }
  globalThis.onAfterRender = function () {
    if (document.getElementById('pager')) wGoTo(ui.pg || 0, false);
  };
  document.addEventListener('scroll', (e) => {
    const p = e.target;
    if (!p || p.id !== 'pager' || !p.clientWidth) return;
    const k = Math.round(p.scrollLeft / p.clientWidth);
    if (k !== ui.pg) { ui.pg = k; wMarkDots(k); }
  }, true);
  window.addEventListener('resize', () => { if (document.getElementById('pager')) wGoTo(ui.pg || 0, false); });

  // ---------- Podsumowanie: budowa ----------
  function wBeats(a, b) {
    if (a.v !== b.v) return a.v > b.v;
    const aw = a.w || 0, bw = b.w || 0;
    if (aw !== bw) return aw > bw;
    return a.r > b.r;
  }
  function wBuildSummary() {
    return S.active.items.map((item, i) => {
      const def = EX[item.id], st = getSt(item.id), cur = wCur(item), vr = wVar(item);
      const out = { i, status: 'none', cur, next: null, keep: null, back: null, choice: null, pr: false };
      if (item.skip) { out.status = 'skip'; return out; }
      const done = wDoneSets(item);
      if (!done.length) return out;
      // rekord
      let best = null;
      done.forEach(s => {
        const c = { v: item.v, w: vr.w ? item.w : null, r: s.r };
        if (!best || wBeats(c, best)) best = c;
      });
      const prev = bestSet(item.id);
      out.pr = !!(prev && best && wBeats(best, prev));
      if (vr.w && !(item.w > 0) && wIsGym(def)) { out.status = 'calib'; return out; }
      const ok = done.length >= def.sets && done.every(s => s.r >= item.t);
      if (ok) { out.status = 'up'; out.next = up(def, cur); return out; }
      out.status = 'fail';
      out.keep = cur;
      out.back = st.prev || down(def, cur);
      out.choice = ((st.fails || 0) + 1 >= 2) ? 'back' : 'keep';
      return out;
    });
  }

  // ---------- C) PODSUMOWANIE ----------
  function wSummary() {
    const a = S.active, wo = wWorkout(a.wid), sum = a.summary;
    const setsDone = a.items.reduce((n, it) => n + (it.skip ? 0 : wDoneSets(it).length), 0);
    const prs = sum.filter(x => x.pr).length;
    let h = `<div class="page">
      <div class="large-title">Podsumowanie</div>
      <div class="subtitle">${esc(wo.name)} · ${esc(wTodayStr())}</div>
      <div class="stats" style="margin-top:12px">
        <div class="stat"><div class="stat-val">${esc(fmtDur(Math.round((Date.now() - a.start) / 1000)))}</div><div class="stat-lbl">czas</div></div>
        <div class="stat"><div class="stat-val">${setsDone}</div><div class="stat-lbl">${esc(plural(setsDone, 'seria', 'serie', 'serii'))}</div></div>
        <div class="stat"><div class="stat-val">${prs}</div><div class="stat-lbl">${esc(plural(prs, 'rekord', 'rekordy', 'rekordów'))}</div></div>
      </div>`;
    sum.forEach(x => {
      const item = a.items[x.i], def = EX[item.id], vr = wVar(item);
      const unit = def.type === 'time' ? ' s' : '';
      const done = wDoneSets(item).map(s => s.r);
      h += `<div class="ex-card" style="--c:${wo.color}">
        <div class="ex-group">${esc(def.name)}${x.pr ? ' <span class="pr-badge">🏆 Rekord</span>' : ''}</div>
        <div class="ex-name">${esc(vr.n)}</div>`;
      if (x.status !== 'skip' && done.length) {
        h += `<div class="ex-meta">${done.join(' · ')}${unit} (cel ${item.t}${unit})${vr.w && item.w > 0 ? ' · ' + (wIsGym(def) ? '' : '+') + esc(fmt(item.w)) + ' kg' : ''}</div>`;
      }
      if (x.status === 'up') {
        const nv = x.next.v !== x.cur.v ? def.variants[x.next.v] : null;
        h += `<div class="status-up">${nv ? 'Nowy poziom: ' + esc(nv.n) + '! ' : ''}Następnym razem: ${esc(targetStr(def, x.next))}</div>`;
      } else if (x.status === 'fail') {
        const bv = x.back.v !== x.cur.v ? ' – ' + def.variants[x.back.v].n : '';
        h += `<div class="status-fail">Nie wszystkie serie wyszły</div>
          <div class="seg" style="margin-top:8px">
            <button class="seg-btn${x.choice === 'keep' ? ' active' : ''}" data-act="wChoice" data-i="${x.i}" data-k="keep">Utrzymaj (${esc(targetStr(def, x.keep))})</button>
            <button class="seg-btn${x.choice === 'back' ? ' active' : ''}" data-act="wChoice" data-i="${x.i}" data-k="back">Cofnij (${esc(targetStr(def, x.back) + bv)})</button>
          </div>`;
      } else if (x.status === 'none') {
        h += `<div class="ex-meta">Nie wykonano – bez zmian</div>`;
      } else if (x.status === 'calib') {
        h += `<div class="status-fail">Wpisz ciężar, żeby liczyć progres</div>`;
      } else if (x.status === 'skip') {
        h += `<div class="ex-meta">Pominięte</div>`;
      }
      h += `</div>`;
    });
    h += `<div class="ex-card" style="--c:${wo.color}">
        <div class="ex-group">Rozgrzewka i kardio</div>
        <div class="ex-meta">Rozgrzewka: ${a.warm ? 'tak' : 'nie'} · Kardio: ${a.cardio ? 'tak' : 'nie'}</div>
      </div>
      <button class="btn btn-primary btn-block" data-act="wSave">Zapisz trening</button>
      ${typeof stretchAfter === 'function' ? `<button class="btn btn-secondary btn-block" style="margin-top:8px" data-act="wSaveStretch">Zapisz i rozciągnij się · ${esc(stretchRoutineName(a.wid))}</button>` : ''}
      <button class="btn btn-secondary btn-block" style="margin-top:8px" data-act="wBack">Wróć do treningu</button>
    </div>`;
    return h;
  }

  VIEWS.today = () => {
    if (!S.active) return wHome();
    if (!S.active.summary) return wActive();
    return wSummary();
  };

  // ---------- ACTIONS ----------
  ACTIONS.wHideHint = () => { S.installHintHidden = true; wCommit(); };
  ACTIONS.wPick = (el) => { ui.pick = wNum(el, 'k'); render(); if (ui.pick >= WORKOUTS.length) wTop(); };

  ACTIONS.wStart = () => {
    const wo = ALLW[ui.pick ?? S.nextIdx] || WORKOUTS[0];
    S.active = {
      wid: wo.id, start: Date.now(), warm: false, cardio: false, timer: null, summary: null,
      items: wo.ex.map(id => {
        const def = EX[id], st = getSt(id);
        return {
          id, v: st.v, w: st.w, t: st.t, skip: false,
          sets: Array.from({ length: def.sets }, () => ({ r: st.t, done: false }))
        };
      })
    };
    ui.pg = 0;
    keepAwake(true);
    wCommit(); wTop();
  };

  ACTIONS.wCancel = () => {
    confirmSheet('Odrzucić ten trening? Wpisane serie nie zostaną zapisane.', 'Odrzuć', true, () => {
      stopTimer();
      S.active = null;
      keepAwake(false);
      wCommit(); wTop();
    });
  };

  ACTIONS.wWarm = () => {
    S.active.warm = !S.active.warm;
    wCommit();
    if (S.active.warm && (ui.pg || 0) === 0) wAdvanceLater(1);
  };
  ACTIONS.wGo = (el) => wGoTo(wNum(el, 'k'), true);
  ACTIONS.wTips = () => { S.settings.tips = S.settings.tips === false; wCommit(); };
  ACTIONS.wInfo = (el) => {
    const id = el.dataset.id, v = +el.dataset.v || 0, def = EX[id], vr = def.variants[v];
    const wo = ALLW.find(w => w.ex.includes(id)) || WORKOUTS[0];
    sheet(`<div class="ex-group">${esc(def.name)}</div>
      <div class="ex-name" style="font-size:20px;line-height:25px">${esc(vr.n)}</div>
      <div style="--c:${wo.color}">${exMedia({ ex: id, v }, 'ex-fig-lg')}</div>
      ${wHowHtml(id, v, false)}
      <button class="btn btn-secondary btn-block" style="margin-top:12px" data-act="closeSheet">Zamknij</button>`);
  };

  ACTIONS.wVar = (el) => {
    const item = S.active.items[wNum(el, 'i')], def = EX[item.id];
    const nv = item.v + wNum(el, 'd');
    if (nv < 0 || nv >= def.variants.length) return;
    const vr = def.variants[nv];
    item.v = nv;
    item.t = vr.min;
    item.w = vr.w ? (item.w > 0 ? item.w : (def.inc || 2.5)) : null;
    item.sets.forEach(s => { if (!s.done) s.r = item.t; });
    wCommit();
  };

  ACTIONS.wW = (el) => {
    const item = S.active.items[wNum(el, 'i')];
    item.w = Math.max(0, wRound((item.w || 0) + wNum(el, 'd')));
    wCommit();
  };
  ACTIONS.wWIn = (el) => {
    const item = S.active.items[wNum(el, 'i')], v = parseNum(el.value);
    item.w = v == null ? null : Math.max(0, wRound(v));
    wCommit();
  };

  ACTIONS.wRep = (el) => {
    const set = S.active.items[wNum(el, 'i')].sets[wNum(el, 's')];
    set.r = Math.max(0, (+set.r || 0) + wNum(el, 'd'));
    wCommit();
  };
  ACTIONS.wRepIn = (el) => {
    const set = S.active.items[wNum(el, 'i')].sets[wNum(el, 's')], v = parseNum(el.value);
    if (v != null) set.r = Math.max(0, Math.round(v));
    wCommit();
  };

  ACTIONS.wSet = (el) => {
    const i = wNum(el, 'i'), set = S.active.items[i].sets[wNum(el, 's')];
    set.done = !set.done;
    if (set.done) wStartRest(i);
    wCommit();
    if (set.done && wItemDone(S.active.items[i])) wAdvanceLater(i + 2);
  };

  ACTIONS.wHold = (el) => {
    const i = wNum(el, 'i'), s = wNum(el, 's'), item = S.active.items[i];
    const secs = Math.max(1, +item.sets[s].r || item.t);
    startTimer({
      mode: 'prep', secs: 3, label: 'Przygotuj się', i, s,
      next: { mode: 'hold', secs, label: 'Utrzymaj – ' + wVar(item).n }
    });
    wCommit();
  };

  ACTIONS.wAddSet = (el) => {
    const item = S.active.items[wNum(el, 'i')];
    const lastR = item.sets.length ? item.sets[item.sets.length - 1].r : item.t;
    item.sets.push({ r: lastR, done: false });
    wCommit();
  };
  ACTIONS.wDelSet = (el) => {
    const item = S.active.items[wNum(el, 'i')], last = item.sets[item.sets.length - 1];
    if (item.sets.length > 1 && last && !last.done) item.sets.pop();
    wCommit();
  };
  ACTIONS.wSkip = (el) => {
    const item = S.active.items[wNum(el, 'i')];
    item.skip = !item.skip;
    wCommit();
    if (item.skip) wAdvanceLater(wNum(el, 'i') + 2);
  };

  ACTIONS.wCardio = () => {
    const wo = wWorkout(S.active.wid);
    startTimer({ mode: 'cardio', secs: wo.cardioMin * 60, label: 'Kardio' });
    wCommit();
  };
  ACTIONS.wCardioDone = () => {
    S.active.cardio = !S.active.cardio;
    if (S.active.cardio && S.active.timer && S.active.timer.mode === 'cardio') stopTimer();
    wCommit();
  };

  ACTIONS.wFinish = () => {
    const go2 = () => { S.active.summary = wBuildSummary(); wCommit(); wTop(); };
    const n = S.active.items.reduce((k, it) => k + (it.skip ? 0 : wDoneSets(it).length), 0);
    if (!n) confirmSheet('Nie odhaczono żadnej serii. Zakończyć mimo to?', 'Zakończ', false, go2);
    else go2();
  };

  ACTIONS.wChoice = (el) => {
    const x = S.active.summary.find(y => y.i === wNum(el, 'i'));
    if (x) x.choice = el.dataset.k === 'back' ? 'back' : 'keep';
    wCommit();
  };

  ACTIONS.wSaveStretch = () => { const wid = S.active.wid; ACTIONS.wSave(); stretchAfter(wid); };
  ACTIONS.wBack = () => { S.active.summary = null; wCommit(); };

  ACTIONS.wSave = () => {
    const a = S.active, wo = wWorkout(a.wid), now = Date.now();
    a.summary.forEach(x => {
      const item = a.items[x.i], id = item.id, st = getSt(id);
      if (x.status === 'up') S.ex[id] = { ...x.next, fails: 0, prev: x.cur };
      else if (x.status === 'fail' && x.choice === 'back') S.ex[id] = { ...x.back, fails: 0, prev: null };
      else if (x.status === 'fail') S.ex[id] = { ...x.cur, fails: (st.fails || 0) + 1, prev: st.prev || null };
      else if (x.status === 'calib') S.ex[id] = { ...x.cur, fails: 0, prev: null };
    });
    S.history.push({
      id: 'w' + a.start,
      date: new Date(a.start).toISOString(),
      end: new Date(now).toISOString(),
      wid: a.wid, name: wo.name,
      dur: Math.round((now - a.start) / 1000),
      warm: !!a.warm, cardio: !!a.cardio, cardioText: wo.cardio,
      items: a.items.map(item => {
        const def = EX[item.id], vr = def.variants[item.v];
        return {
          id: item.id, vn: vr.n, v: item.v, w: vr.w ? (item.w ?? null) : null, t: item.t, type: def.type,
          sets: item.skip ? [] : wDoneSets(item).map(s => s.r), skip: !!item.skip
        };
      })
    });
    const idx = WORKOUTS.findIndex(w => w.id === a.wid);
    if (idx >= 0) S.nextIdx = (idx + 1) % WORKOUTS.length;
    stopTimer();
    S.active = null;
    keepAwake(false);
    ui.pick = null;
    save();
    toast('Trening zapisany 💪');
    render(); wTop();
  };

  // ---------- Hook timera (woła core) ----------
  globalThis.onTimerDone = function (t) {
    if (!S.active || !t) return;
    if (t.mode === 'prep' && t.next) {
      startTimer({ ...t.next, i: t.i, s: t.s });
    } else if (t.mode === 'hold') {
      const item = S.active.items[t.i], set = item && item.sets[t.s];
      if (set) {
        set.r = t.total;
        set.done = true;
        wStartRest(t.i);
        if (wItemDone(item)) wAdvanceLater(t.i + 2);
      }
    } else if (t.mode === 'cardio') {
      S.active.cardio = true;
      toast('Kardio zaliczone!');
    } else if (t.mode === 'rest') {
      toast('Czas na serię!');
    }
    save();
    render();
  };
})();


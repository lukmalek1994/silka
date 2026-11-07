/* Siłka – views.js: VIEWS.history, VIEWS.progress, VIEWS.settings (agent VIEWS) */
(function () {
  'use strict';

  /* ---------- drobne helpery lokalne ---------- */
  const MONTHS = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
  const DOW = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'];
  const DOW_VAL = [1, 2, 3, 4, 5, 6, 0];
  const BYDAY = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
  const METRICS = [
    { k: 'weight', l: 'Waga', u: 'kg', f: 'Waga (kg)' },
    { k: 'waist', l: 'Talia', u: 'cm', f: 'Talia (cm)' },
    { k: 'chest', l: 'Klatka', u: 'cm', f: 'Klatka (cm)' },
    { k: 'arm', l: 'Ramię', u: 'cm', f: 'Ramię (cm)' },
    { k: 'thigh', l: 'Udo', u: 'cm', f: 'Udo (cm)' },
  ];

  const pad2 = n => String(n).padStart(2, '0');
  const keyToDate = k => { const [y, m, d] = String(k).split('-').map(Number); return new Date(y, (m || 1) - 1, d || 1); };
  const fdk = k => fmtDate(keyToDate(k).toISOString());           // 'YYYY-MM-DD' → '7 lis 2026'
  const fdkShort = k => {                                          // bez roku, gdy bieżący rok
    const s = fdk(k);
    return keyToDate(k).getFullYear() === new Date().getFullYear() ? s.replace(/\s*\d{4}\s*$/, '') : s;
  };
  const hDate = h => new Date(h.date);
  const hKey = h => dateKey(hDate(h));
  const wColor = wid => { const w = ALLW.find(x => x.id === wid); return w ? w.color : 'var(--blue)'; };
  const doneSets = h => (h.items || []).reduce((a, it) => a + (it.skip ? 0 : (it.sets || []).length), 0);
  const signed = n => (n > 0 ? '+' : n < 0 ? '−' : '±') + fmt(Math.abs(n));
  const hm = d => pad2(d.getHours()) + ':' + pad2(d.getMinutes());
  const page = html => '<div class="page">' + html + '</div>';
  const sheetHead = (t, sub) => '<div style="font-size:20px;font-weight:700;margin:4px 0 ' + (sub ? '2px' : '14px') + '">' + esc(t) + '</div>' +
    (sub ? '<div class="subtitle" style="margin-bottom:14px">' + esc(sub) + '</div>' : '');
  const closeBtn = '<button class="btn btn-secondary btn-block" data-act="closeSheet" style="margin-top:8px">Zamknij</button>';
  const rerender = () => { save(); render(); };
  const val = id => { const el = document.getElementById(id); return el ? el.value : ''; };

  function curMonth() {
    if (!ui.calMonth) { const d = new Date(); ui.calMonth = d.getFullYear() + '-' + pad2(d.getMonth() + 1); }
    return ui.calMonth;
  }

  /* ---------- SVG wykresy ---------- */
  function barChart(data) {
    const W = 320, H = 160, top = 18, bottom = 22, n = data.length || 1;
    const max = Math.max(1, ...data.map(d => d.value));
    const slot = W / n, bw = Math.min(28, slot * 0.6), ch = H - top - bottom;
    let s = '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" width="100%" role="img" style="font-family:inherit">';
    s += '<line x1="0" x2="' + W + '" y1="' + (H - bottom) + '" y2="' + (H - bottom) + '" stroke="var(--sep)" stroke-width="1"/>';
    data.forEach((d, i) => {
      const h = d.value ? Math.max(2, ch * d.value / max) : 0;
      const x = slot * i + (slot - bw) / 2, y = H - bottom - h;
      if (h) s += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + h.toFixed(1) + '" rx="4" fill="var(--blue)"' + (d.hl ? '' : ' fill-opacity="0.4"') + '/>';
      s += '<text x="' + (x + bw / 2).toFixed(1) + '" y="' + (y - 5).toFixed(1) + '" text-anchor="middle" font-size="11" fill="' + (d.hl ? 'var(--text)' : 'var(--sec)') + '"' + (d.hl ? ' font-weight="600"' : '') + '>' + d.value + '</text>';
      s += '<text x="' + (x + bw / 2).toFixed(1) + '" y="' + (H - 6) + '" text-anchor="middle" font-size="10" fill="' + (d.hl ? 'var(--blue)' : 'var(--sec)') + '"' + (d.hl ? ' font-weight="600"' : '') + '>' + esc(d.label) + '</text>';
    });
    return s + '</svg>';
  }

  function lineChart(points, unit) {
    const W = 320, H = 170, L = 44, R = 12, T = 14, B = 22;
    if (!points.length) return '';
    const ys = points.map(p => p.y), xs = points.map(p => p.x);
    let minY = Math.min(...ys), maxY = Math.max(...ys);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const rawMin = minY, rawMax = maxY;
    if (maxY === minY) { minY -= 1; maxY += 1; }
    const padY = (maxY - minY) * 0.12; minY -= padY; maxY += padY;
    const px = x => maxX === minX ? L + (W - L - R) / 2 : L + (W - L - R) * (x - minX) / (maxX - minX);
    const py = y => T + (H - T - B) * (1 - (y - minY) / (maxY - minY));
    let s = '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" width="100%" role="img" style="font-family:inherit">';
    [rawMax, rawMin].forEach((v, i) => {
      if (i === 1 && rawMin === rawMax) return;
      const y = py(v).toFixed(1);
      s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y + '" y2="' + y + '" stroke="var(--sep)" stroke-width="1" stroke-dasharray="3 3"/>';
      s += '<text x="' + (L - 6) + '" y="' + (+y + 4) + '" text-anchor="end" font-size="11" fill="var(--sec)">' + esc(fmt(v)) + '</text>';
    });
    const path = points.map(p => px(p.x).toFixed(1) + ',' + py(p.y).toFixed(1)).join(' ');
    if (points.length > 1) s += '<polyline points="' + path + '" fill="none" stroke="var(--blue)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>';
    points.forEach((p, i) => {
      const last = i === points.length - 1;
      s += '<circle cx="' + px(p.x).toFixed(1) + '" cy="' + py(p.y).toFixed(1) + '" r="' + (last ? 4.5 : 3.5) + '" fill="' + (last ? 'var(--blue)' : 'var(--card)') + '" stroke="var(--blue)" stroke-width="2"/>';
    });
    const first = points[0], lastP = points[points.length - 1];
    s += '<text x="' + L + '" y="' + (H - 5) + '" font-size="10" fill="var(--sec)">' + esc(first.label) + '</text>';
    if (points.length > 1) s += '<text x="' + (W - R) + '" y="' + (H - 5) + '" text-anchor="end" font-size="10" fill="var(--sec)">' + esc(lastP.label) + '</text>';
    s += '<text x="' + (W - R) + '" y="' + (T - 2) + '" text-anchor="end" font-size="10" fill="var(--sec)">' + esc(unit) + '</text>';
    return s + '</svg>';
  }

  /* ================= HISTORIA ================= */
  function histRow(h) {
    const d = hDate(h);
    return '<div class="row tappable" data-act="vHist" data-id="' + esc(h.id) + '">' +
      '<span class="dot" style="--c:' + esc(wColor(h.wid)) + '"></span>' +
      '<div class="row-main"><div class="row-title">' + esc(h.name) + '</div>' +
      '<div class="row-sub">' + esc(fmtDate(h.date)) + ', ' + hm(d) + ' · ' + esc(fmtDur(h.dur || 0)) + ' · ' + doneSets(h) + ' ' + plural(doneSets(h), 'seria', 'serie', 'serii') + '</div></div>' +
      '<span class="chev">›</span></div>';
  }

  VIEWS.history = function () {
    const hist = S.history || [];
    const byDay = {};
    hist.forEach(h => { const k = hKey(h); (byDay[k] = byDay[k] || []).push(h); });
    const [y, m] = curMonth().split('-').map(Number);
    const first = new Date(y, m - 1, 1);
    const offset = (first.getDay() + 6) % 7;
    const daysIn = new Date(y, m, 0).getDate();
    const cells = Math.ceil((offset + daysIn) / 7) * 7;
    const today = dateKey(new Date());

    let cal = '<div class="card"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">' +
      '<button class="icon-btn" data-act="vCalPrev" aria-label="Poprzedni miesiąc">‹</button>' +
      '<div style="font-weight:600;font-size:17px">' + MONTHS[m - 1] + ' ' + y + '</div>' +
      '<button class="icon-btn" data-act="vCalNext" aria-label="Następny miesiąc">›</button></div><div class="cal">';
    DOW.forEach(d => { cal += '<div class="cal-h">' + d + '</div>'; });
    for (let i = 0; i < cells; i++) {
      const d = new Date(y, m - 1, 1 - offset + i);
      const k = dateKey(d);
      const cls = ['cal-d'];
      if (d.getMonth() !== m - 1) cls.push('muted');
      if (k === today) cls.push('today');
      if (k === ui.calSel) cls.push('sel');
      const dots = (byDay[k] || []).map(h => '<span class="dot" style="--c:' + esc(wColor(h.wid)) + '"></span>').join('');
      cal += '<div class="' + cls.join(' ') + '" data-act="vCalDay" data-d="' + k + '"><span>' + d.getDate() + '</span>' +
        (dots ? '<div class="cal-dots">' + dots + '</div>' : '') + '</div>';
    }
    cal += '</div></div>';

    let list;
    if (!hist.length) {
      list = '<div class="empty">Brak zapisanych treningów. Ukończ pierwszy trening, a pojawi się tutaj.</div>';
    } else if (ui.calSel) {
      const day = (byDay[ui.calSel] || []).slice().reverse();
      list = '<div class="section-title">' + esc(fdk(ui.calSel)) + '</div>' +
        (day.length ? '<div class="list">' + day.map(histRow).join('') + '</div>' : '<div class="empty">Brak treningów tego dnia.</div>');
    } else {
      list = '<div class="section-title">Ostatnie treningi</div><div class="list">' +
        hist.slice(-30).reverse().map(histRow).join('') + '</div>';
    }
    return page('<div class="large-title">Historia</div>' + cal + list);
  };

  function shiftMonth(delta) {
    const [y, m] = curMonth().split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    ui.calMonth = d.getFullYear() + '-' + pad2(d.getMonth() + 1);
    render();
  }
  ACTIONS.vCalPrev = () => shiftMonth(-1);
  ACTIONS.vCalNext = () => shiftMonth(1);
  ACTIONS.vCalDay = el => {
    const k = el.dataset.d;
    ui.calSel = ui.calSel === k ? null : k;
    const mk = k.slice(0, 7);
    if (ui.calSel && mk !== curMonth()) ui.calMonth = mk;
    render();
  };

  ACTIONS.vHist = el => {
    const h = (S.history || []).find(x => String(x.id) === el.dataset.id);
    if (!h) return;
    const d = hDate(h);
    let html = sheetHead(h.name, fmtDate(h.date) + ', ' + hm(d) + ' · ' + fmtDur(h.dur || 0));
    html += '<div class="list">' +
      '<div class="row"><div class="row-main"><div class="row-title">Rozgrzewka</div></div><span class="row-right">' + (h.warm ? '✓ zrobiona' : '—') + '</span></div>' +
      '<div class="row"><div class="row-main"><div class="row-title">Kardio</div>' + (h.cardioText ? '<div class="row-sub">' + esc(h.cardioText) + '</div>' : '') + '</div><span class="row-right">' + (h.cardio ? '✓ zrobione' : '—') + '</span></div>' +
      '</div><div class="section-title">Ćwiczenia</div><div class="list">';
    (h.items || []).forEach(it => {
      const def = EX[it.id];
      const title = it.vn || (def ? def.name : it.id);
      const gym = def && def.variants.length === 1;
      let sub;
      if (it.skip) sub = 'Pominięte';
      else if (!(it.sets || []).length) sub = 'Brak wykonanych serii';
      else sub = it.sets.map(r => r + (it.type === 'time' ? ' s' : '')).join(' · ');
      const wStr = it.w > 0 ? (gym ? fmt(it.w) + ' kg' : '+' + fmt(it.w) + ' kg') : '';
      html += '<div class="row"><div class="row-main"><div class="row-title">' + esc(title) + '</div>' +
        '<div class="row-sub">' + esc(sub) + '</div></div>' + (wStr && !it.skip ? '<span class="row-right">' + esc(wStr) + '</span>' : '') + '</div>';
    });
    html += '</div>';
    html += '<button class="btn btn-danger btn-block" data-act="vHistDel" data-id="' + esc(h.id) + '">Usuń trening</button>';
    html += '<div class="footnote">Usunięcie wpisu nie cofa poziomów progresji ćwiczeń – w razie potrzeby zmień je w Ustawieniach.</div>';
    html += closeBtn;
    sheet(html);
  };

  ACTIONS.vHistDel = el => {
    const id = el.dataset.id;
    confirmSheet('Usunąć ten trening z historii? Poziomy progresji nie zostaną cofnięte.', 'Usuń trening', true, () => {
      S.history = (S.history || []).filter(x => String(x.id) !== id);
      rerender();
      toast('Trening usunięty');
    });
  };

  /* ================= POSTĘP ================= */
  function streakWeeks(hist) {
    const weeks = new Set(hist.map(h => mondayKey(hDate(h))));
    let d = keyToDate(mondayKey(new Date()));
    if (!weeks.has(dateKey(d))) d = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 7);
    let n = 0;
    while (weeks.has(dateKey(d))) { n++; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 7); }
    return n;
  }

  VIEWS.progress = function () {
    const hist = S.history || [];
    const thisMon = mondayKey(new Date());
    const thisWeek = hist.filter(h => mondayKey(hDate(h)) === thisMon).length;
    const streak = streakWeeks(hist);

    let html = '<div class="large-title">Postęp</div>';
    html += '<div class="stats">' +
      '<div class="stat"><div class="stat-val">' + thisWeek + '</div><div class="stat-lbl">w tym tygodniu</div></div>' +
      '<div class="stat"><div class="stat-val">' + hist.length + '</div><div class="stat-lbl">' + plural(hist.length, 'trening', 'treningi', 'treningów') + ' łącznie</div></div>' +
      '<div class="stat"><div class="stat-val">' + streak + '</div><div class="stat-lbl">' + plural(streak, 'tydzień', 'tygodnie', 'tygodni') + ' z rzędu</div></div>' +
      '</div>';

    // Serie w tygodniu
    const base = keyToDate(thisMon);
    const weeks = [];
    for (let i = 7; i >= 0; i--) {
      const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() - 7 * i);
      weeks.push({ k: dateKey(d), label: pad2(d.getDate()) + '.' + pad2(d.getMonth() + 1), value: 0, hl: i === 0 });
    }
    const wIdx = {}; weeks.forEach((w, i) => { wIdx[w.k] = i; });
    hist.forEach(h => { const i = wIdx[mondayKey(hDate(h))]; if (i !== undefined) weeks[i].value += doneSets(h); });
    html += '<div class="section-title">Serie w tygodniu</div><div class="card">' + barChart(weeks) + '</div>';
    html += '<div class="footnote">Objętość tygodniowa = liczba wykonanych serii w tygodniu. Stopniowy wzrost (przy dobrej technice) to sygnał, że robisz postęp.</div>';

    // Ciało
    const body = (S.body || []).slice().sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : 0);
    const avail = METRICS.filter(mt => body.some(e => typeof e[mt.k] === 'number'));
    html += '<div class="section-title">Ciało</div>';
    if (avail.length) {
      let mt = avail.find(x => x.k === ui.bodyMetric);
      if (!mt) mt = avail[0];
      if (avail.length > 1) {
        html += '<div class="seg" style="margin-bottom:12px">' + avail.map(x =>
          '<button class="seg-btn' + (x.k === mt.k ? ' active' : '') + '" data-act="vMetric" data-k="' + x.k + '">' + x.l + '</button>').join('') + '</div>';
      }
      const pts = body.filter(e => typeof e[mt.k] === 'number').map(e => ({ x: keyToDate(e.date).getTime(), y: e[mt.k], label: fdkShort(e.date), date: e.date }));
      const firstP = pts[0], lastP = pts[pts.length - 1];
      const diff = Math.round((lastP.y - firstP.y) * 100) / 100;
      html += '<div class="card">' +
        '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px">' +
        '<div><span style="font-size:28px;font-weight:700">' + esc(fmt(lastP.y)) + '</span> <span class="muted">' + mt.u + '</span></div>' +
        (pts.length > 1 ? '<div class="' + (diff === 0 ? 'muted' : '') + '" style="font-size:15px;font-weight:600">' + esc(signed(diff) + ' ' + mt.u + ' od ' + fdkShort(firstP.date)) + '</div>' : '') +
        '</div>' + lineChart(pts, mt.u) + '</div>';
    } else {
      html += '<div class="empty">Dodaj pierwszy pomiar, aby śledzić wagę i obwody.</div>';
    }
    html += '<button class="btn btn-primary btn-block" data-act="vBodyAdd" style="margin:4px 0 12px">Dodaj pomiar</button>';
    if (body.length) {
      html += '<div class="list">' + body.slice(-10).reverse().map(e => {
        const parts = METRICS.filter(mt => typeof e[mt.k] === 'number').map(mt => mt.l + ' ' + fmt(e[mt.k]) + ' ' + mt.u);
        return '<div class="row tappable" data-act="vBodyDel" data-d="' + esc(e.date) + '"><div class="row-main">' +
          '<div class="row-title">' + esc(fdk(e.date)) + '</div><div class="row-sub">' + esc(parts.join(' · ')) + '</div></div></div>';
      }).join('') + '</div>';
    }
    html += '<div class="footnote">Waż się rano, na czczo, 1–2× w tygodniu. Talia mierzona na wysokości pępka – przy redukcji najlepszy wskaźnik.</div>';

    // Rekordy
    html += '<div class="section-title">Rekordy</div>';
    const recs = [];
    Object.keys(EX).forEach(id => {
      const def = EX[id];
      const b = bestSet(id);
      if (!b) return;
      let val;
      if (def.type === 'time') val = b.r + ' s';
      else if (b.w > 0) val = (def.variants.length === 1 ? fmt(b.w) + ' kg' : '+' + fmt(b.w) + ' kg') + ' × ' + b.r;
      else val = b.r + ' powt.';
      const sub = (b.vn && b.vn !== def.name ? b.vn + ' · ' : '') + val;
      recs.push('<div class="row"><div class="row-main"><div class="row-title">' + esc(def.name) + '</div>' +
        '<div class="row-sub">' + esc(sub) + '</div></div><span class="row-right">' + (b.date ? esc(fmtDate(b.date)) : '') + '</span></div>');
    });
    html += recs.length ? '<div class="list">' + recs.join('') + '</div>' : '<div class="empty">Rekordy pojawią się po pierwszych treningach.</div>';
    return page(html);
  };

  ACTIONS.vMetric = el => { ui.bodyMetric = el.dataset.k; render(); };

  ACTIONS.vBodyAdd = () => {
    let html = sheetHead('Nowy pomiar');
    html += '<div class="list"><label class="row field"><span>Data</span><input class="input" type="date" id="vbDate" value="' + dateKey(new Date()) + '"></label>';
    METRICS.forEach(mt => {
      html += '<label class="row field"><span>' + mt.f + '</span><input class="input" id="vb_' + mt.k + '" inputmode="decimal" autocomplete="off" placeholder="—"></label>';
    });
    html += '</div><button class="btn btn-primary btn-block" data-act="vBodySave">Zapisz</button>' + closeBtn;
    sheet(html);
  };

  ACTIONS.vBodySave = () => {
    const date = val('vbDate') || dateKey(new Date());
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) { toast('Nieprawidłowa data'); return; }
    const e = { date };
    let any = false;
    METRICS.forEach(mt => {
      const n = parseNum(val('vb_' + mt.k));
      e[mt.k] = (n !== null && n > 0) ? n : null;
      if (e[mt.k] !== null) any = true;
    });
    if (!any) { toast('Wpisz przynajmniej jedną wartość'); return; }
    S.body = (S.body || []).filter(x => x.date !== date);
    S.body.push(e);
    S.body.sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : 0);
    if (!S.body.some(b => typeof b[ui.bodyMetric] === 'number')) { const f = METRICS.find(x => e[x.k] !== null); if (f) ui.bodyMetric = f.k; }
    closeSheet();
    rerender();
    toast('Pomiar zapisany');
  };

  ACTIONS.vBodyDel = el => {
    const d = el.dataset.d;
    confirmSheet('Usunąć pomiar z ' + fdk(d) + '?', 'Usuń', true, () => {
      S.body = (S.body || []).filter(x => x.date !== d);
      rerender();
    });
  };

  /* ================= USTAWIENIA ================= */
  VIEWS.settings = function () {
    const st = S.settings || (S.settings = { sound: true, wake: true, remDays: [1, 3, 5], remTime: '18:00' });
    const next = WORKOUTS[S.nextIdx] || WORKOUTS[0];
    let html = '<div class="large-title">Ustawienia</div>';

    // Plan
    html += '<div class="section-title">Plan treningowy</div><div class="list">' +
      '<div class="row tappable" data-act="vNextPick"><div class="row-main"><div class="row-title">Następny trening</div></div>' +
      '<span class="row-right">' + esc(next.name) + '</span><span class="chev">›</span></div></div>';
    WORKOUTS.forEach(w => {
      html += '<div class="section-title"><span class="dot" style="--c:' + esc(w.color) + ';display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--c);margin-right:6px"></span>' + esc(w.name) + '</div><div class="list">';
      w.ex.forEach(id => {
        const def = EX[id], c = getSt(id), vr = def.variants[c.v] || def.variants[0];
        const vname = def.variants.length > 1 ? vr.n + ' · ' : '';
        html += '<div class="row tappable" data-act="vExEdit" data-id="' + id + '"><div class="row-main">' +
          '<div class="row-title">' + esc(def.name) + '</div><div class="row-sub">' + esc(vname + targetStr(def, c)) + '</div></div><span class="chev">›</span></div>';
      });
      html += '</div>';
    });
    html += '<div class="footnote">Gdy zrobisz wszystkie serie na górnej granicy zakresu, aplikacja podniesie ciężar albo przejdzie do trudniejszego wariantu. Gdy się nie uda – możesz utrzymać poziom albo cofnąć się o krok.</div>';

    // Trening
    const sw = (k, label) => '<label class="row"><div class="row-main"><div class="row-title">' + label + '</div></div>' +
      '<input type="checkbox" class="switch" data-chg="vToggle" data-k="' + k + '"' + (st[k] ? ' checked' : '') + '></label>';
    html += '<div class="section-title">Trening</div><div class="list">' + sw('sound', 'Dźwięk po przerwie') + sw('wake', 'Nie wygaszaj ekranu') +
      '<div class="row tappable" data-act="vBeep"><div class="row-main"><div class="row-title" style="color:var(--blue)">Testuj dźwięk</div></div></div></div>';

    // Przypomnienia
    const days = st.remDays || [];
    html += '<div class="section-title">Przypomnienia</div><div class="card"><div class="chips" style="margin-bottom:12px">' +
      DOW.map((d, i) => '<button class="chip' + (days.includes(DOW_VAL[i]) ? ' active' : '') + '" data-act="vRemDay" data-d="' + DOW_VAL[i] + '">' + d + '</button>').join('') +
      '</div><label class="field" style="margin-bottom:12px"><span>Godzina</span><input class="input" type="time" data-chg="vRemTime" value="' + esc(st.remTime || '18:00') + '"></label>' +
      '<button class="btn btn-primary btn-block" data-act="vIcs">Dodaj do Kalendarza</button></div>' +
      '<div class="footnote">Aplikacja z przeglądarki nie może sama wysyłać powiadomień bez serwera, dlatego przypomnienia trafiają do Kalendarza iPhone\'a. Jeśli w zainstalowanej apce nic się nie stanie, otwórz stronę w Safari i stuknij przycisk tam.</div>';

    // Dane
    const last = S.lastExport ? fmtDate(S.lastExport) + ' (' + relDay(S.lastExport) + ')' : 'nigdy';
    html += '<div class="section-title">Dane</div><div class="list">' +
      '<div class="row tappable" data-act="vExport"><div class="row-main"><div class="row-title" style="color:var(--blue)">Eksportuj kopię</div></div></div>' +
      '<div class="row tappable" data-act="vImport"><div class="row-main"><div class="row-title" style="color:var(--blue)">Importuj kopię</div></div></div>' +
      '<div class="row"><div class="row-main"><div class="row-title">Ostatnia kopia</div></div><span class="row-right">' + esc(last) + '</span></div>' +
      '<div class="row tappable" data-act="vWipe"><div class="row-main"><div class="row-title" style="color:var(--red)">Usuń wszystkie dane</div></div></div></div>' +
      '<div class="footnote">Kopia to plik JSON z całą historią, poziomami i pomiarami. Zapisz go w Plikach lub iCloud Drive.</div>';

    // O aplikacji
    html += '<div class="section-title">O aplikacji</div><div class="card">' +
      '<p style="margin:0 0 8px"><b>Siłka</b> – kalistenika, siłownia i kardio z automatyczną progresją.</p>' +
      '<p style="margin:0 0 8px">Instalacja na iPhonie: otwórz stronę w Safari → <b>Udostępnij</b> → <b>Do ekranu początkowego</b>.</p>' +
      '<p style="margin:0 0 8px">Wszystkie dane zostają tylko na Twoim telefonie – nic nie jest wysyłane na serwer. Rób regularnie kopie zapasowe (Eksportuj kopię).</p>' +
      '<p class="muted" style="margin:0">Wersja 1.0</p></div>';
    return page(html);
  };

  ACTIONS.vNextPick = () => {
    let html = sheetHead('Następny trening') + '<div class="list">';
    WORKOUTS.forEach((w, i) => {
      html += '<div class="row tappable" data-act="vNextSet" data-i="' + i + '"><span class="dot" style="--c:' + esc(w.color) + '"></span>' +
        '<div class="row-main"><div class="row-title">' + esc(w.name) + '</div><div class="row-sub">' + esc(w.sub) + '</div></div>' +
        (i === S.nextIdx ? '<span class="row-right" style="color:var(--blue)">✓</span>' : '') + '</div>';
    });
    sheet(html + '</div>' + closeBtn);
  };
  ACTIONS.vNextSet = el => { S.nextIdx = +el.dataset.i || 0; closeSheet(); rerender(); };

  function exEditorFields(def, v, c) {
    const vr = def.variants[v];
    const unit = def.type === 'time' ? 's' : 'powt.';
    let html = '';
    if (vr.w) {
      html += '<label class="row field"><span>' + (def.variants.length === 1 ? 'Ciężar (kg)' : 'Obciążenie (+kg)') + '</span>' +
        '<input class="input" id="veW" inputmode="decimal" autocomplete="off" placeholder="—" value="' + (c && c.w > 0 ? esc(fmt(c.w)) : '') + '"></label>';
    }
    html += '<label class="row field"><span>Cel (' + unit + ', ' + vr.min + '–' + vr.max + ')</span>' +
      '<input class="input" id="veT" inputmode="decimal" autocomplete="off" value="' + (c ? esc(fmt(c.t)) : vr.min) + '"></label>';
    return html;
  }

  ACTIONS.vExEdit = el => {
    const id = el.dataset.id, def = EX[id], c = getSt(id);
    let html = sheetHead(def.name, def.sets + ' ' + plural(def.sets, 'seria', 'serie', 'serii') + (def.note ? ' · ' + def.note : '')) + '<div class="list">';
    if (def.variants.length > 1) {
      html += '<label class="row field"><span>Wariant</span><select class="input" id="veV" data-chg="vExVar" data-id="' + id + '">' +
        def.variants.map((vr, i) => '<option value="' + i + '"' + (i === c.v ? ' selected' : '') + '>' + (i + 1) + '. ' + esc(vr.n) + '</option>').join('') +
        '</select></label>';
    }
    html += '<div id="veFields">' + exEditorFields(def, c.v, c) + '</div></div>';
    html += '<button class="btn btn-primary btn-block" data-act="vExSave" data-id="' + id + '">Zapisz</button>';
    html += '<button class="btn btn-danger btn-block" data-act="vExReset" data-id="' + id + '" style="margin-top:8px">Resetuj poziom</button>';
    html += '<div class="footnote">Reset przywraca wariant startowy i dolną granicę zakresu.</div>' + closeBtn;
    sheet(html);
  };

  ACTIONS.vExVar = el => {
    const def = EX[el.dataset.id], v = +el.value || 0, c = getSt(def.id);
    const box = document.getElementById('veFields');
    if (box) box.innerHTML = exEditorFields(def, v, v === c.v ? c : (def.variants[v].w && c.w > 0 ? { w: c.w, t: def.variants[v].min } : null));
  };

  ACTIONS.vExSave = el => {
    const id = el.dataset.id, def = EX[id], c = getSt(id);
    const vEl = document.getElementById('veV');
    const v = vEl ? (+vEl.value || 0) : c.v;
    const vr = def.variants[v];
    let w = null;
    if (vr.w) { const n = parseNum(val('veW')); w = n !== null && n > 0 ? n : null; }
    let t = parseNum(val('veT'));
    if (t === null || t <= 0) t = vr.min;
    t = Math.round(t);
    S.ex[id] = { v, w, t, fails: 0, prev: null };
    closeSheet();
    rerender();
    toast('Zapisano');
  };

  ACTIONS.vExReset = el => {
    const id = el.dataset.id;
    delete S.ex[id];
    closeSheet();
    rerender();
    toast('Poziom zresetowany');
  };

  ACTIONS.vToggle = el => {
    const k = el.dataset.k;
    S.settings[k] = !!el.checked;
    save();
    if (k === 'wake' && typeof keepAwake === 'function') keepAwake(!!(S.active && el.checked));
    render();
  };
  ACTIONS.vBeep = () => { if (!S.settings.sound) toast('Dźwięk jest wyłączony'); beep(); };

  ACTIONS.vRemDay = el => {
    const d = +el.dataset.d;
    const set = new Set(S.settings.remDays || []);
    set.has(d) ? set.delete(d) : set.add(d);
    S.settings.remDays = [...set].sort((a, b) => a - b);
    rerender();
  };
  ACTIONS.vRemTime = el => { if (/^\d{1,2}:\d{2}/.test(el.value)) { S.settings.remTime = el.value.slice(0, 5); save(); } };

  function icsEsc(s) { return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n'); }
  function icsFold(line) {
    const out = []; let s = line;
    while (s.length > 74) { out.push(s.slice(0, 74)); s = ' ' + s.slice(74); }
    out.push(s); return out.join('\r\n');
  }
  function buildIcs(days, time) {
    const [hh, mm] = time.split(':').map(Number);
    const now = new Date();
    let start = null;
    for (let i = 0; i <= 7 && !start; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, hh, mm, 0);
      if (days.includes(d.getDay()) && d > now) start = d;
    }
    const loc = d => d.getFullYear() + pad2(d.getMonth() + 1) + pad2(d.getDate()) + 'T' + pad2(d.getHours()) + pad2(d.getMinutes()) + '00';
    const utc = d => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const byday = days.slice().sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)).map(d => BYDAY[d]).join(',');
    const lines = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Silka//PL', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:silka-' + Date.now() + '@silka',
      'DTSTAMP:' + utc(now),
      'DTSTART:' + loc(start),
      'DURATION:PT1H30M',
      'RRULE:FREQ=WEEKLY;BYDAY=' + byday,
      'SUMMARY:' + icsEsc('Trening – Siłka'),
      'DESCRIPTION:' + icsEsc('Otwórz aplikację: ' + location.href),
      'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + icsEsc('Trening – Siłka'), 'TRIGGER:-PT15M', 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR',
    ];
    return lines.map(icsFold).join('\r\n') + '\r\n';
  }
  ACTIONS.vIcs = () => {
    const days = S.settings.remDays || [];
    if (!days.length) { toast('Wybierz przynajmniej jeden dzień'); return; }
    const ics = buildIcs(days, S.settings.remTime || '18:00');
    location.href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics);
  };

  ACTIONS.vExport = async () => {
    const name = 'silka-kopia-' + dateKey(new Date()) + '.json';
    const json = JSON.stringify(S, null, 1);
    const markDone = () => { S.lastExport = new Date().toISOString(); rerender(); };
    let file = null;
    try { file = new File([json], name, { type: 'application/json' }); } catch (e) { file = null; }
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: name }); markDone(); toast('Kopia gotowa'); }
      catch (e) { if (e && e.name !== 'AbortError') toast('Nie udało się udostępnić pliku'); }
      return;
    }
    const blob = file || new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; a.style.display = 'none';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    markDone();
    toast('Kopia pobrana');
  };

  let importBound = false;
  function bindImport() {
    if (importBound) return;
    const inp = document.getElementById('importFile');
    if (!inp) return;
    importBound = true;
    inp.addEventListener('change', () => {
      const f = inp.files && inp.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = () => {
        inp.value = '';
        let data;
        try { data = JSON.parse(reader.result); } catch (e) { data = null; }
        if (!data || typeof data !== 'object' || Array.isArray(data) || !data.version || !Array.isArray(data.history)) {
          toast('To nie jest prawidłowa kopia Siłki');
          return;
        }
        const n = data.history.length;
        confirmSheet('Zastąpić obecne dane? Kopia zawiera ' + n + ' ' + plural(n, 'trening', 'treningi', 'treningów') + '. Obecne dane zostaną nadpisane.', 'Zastąp', true, () => {
          const def = defState();
          Object.keys(S).forEach(k => { delete S[k]; });
          Object.assign(S, def, data);
          S.settings = Object.assign({}, def.settings, data.settings || {});
          rerender();
          toast('Dane zaimportowane');
        });
      };
      reader.onerror = () => { inp.value = ''; toast('Nie udało się odczytać pliku'); };
      reader.readAsText(f);
    });
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindImport);
    else bindImport();
  }
  ACTIONS.vImport = () => {
    bindImport();
    const inp = document.getElementById('importFile');
    if (inp) inp.click(); else toast('Import niedostępny');
  };

  ACTIONS.vWipe = () => {
    confirmSheet('Usunąć wszystkie dane? Historia, poziomy ćwiczeń i pomiary zostaną bezpowrotnie skasowane. Najpierw zrób kopię!', 'Usuń wszystko', true, () => {
      if (S.active) { if (typeof stopTimer === 'function') stopTimer(); if (typeof keepAwake === 'function') keepAwake(false); }
      Object.keys(S).forEach(k => { delete S[k]; });
      Object.assign(S, defState());
      ui.calSel = null;
      rerender();
      toast('Dane usunięte');
    });
  };
})();

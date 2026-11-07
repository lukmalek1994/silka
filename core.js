/* Siłka – core.js
 * Dane programu, stan, helpery, router widoków, delegacja zdarzeń,
 * bottom sheet, toast, timer, dźwięk, wake lock, App.init.
 * Zwykły skrypt (bez modułów) – wszystko poniżej jest globalne.
 */
'use strict';

/* ================================================================
 * DANE PROGRAMU
 * ================================================================ */
var EX = {
  pull:  {name:'Podciąganie nachwytem', sets:3, rest:150, inc:2.5, variants:[
    {n:'Wiosłowanie australijskie',min:8,max:15},{n:'Podciąganie negatywne (5 s w dół)',min:3,max:6},
    {n:'Podciąganie z gumą',min:5,max:10},{n:'Podciąganie',min:4,max:10},{n:'Podciąganie z obciążeniem',min:4,max:8,w:true}]},
  dip:   {name:'Dipsy', sets:3, rest:150, inc:2.5, variants:[
    {n:'Dipsy na ławce',min:8,max:15},{n:'Dipsy negatywne (5 s w dół)',min:3,max:6},
    {n:'Dipsy na poręczach',min:4,max:10},{n:'Dipsy z obciążeniem',min:4,max:8,w:true}]},
  incdb: {name:'Wyciskanie hantli – ławka skośna', sets:3, rest:120, inc:2, variants:[{min:8,max:12,w:true}]},
  row:   {name:'Wiosłowanie na wyciągu siedząc', sets:3, rest:90, inc:2.5, variants:[{min:8,max:12,w:true}]},
  pike:  {name:'Pompki na barki', sets:3, rest:120, variants:[
    {n:'Pompki pike',min:6,max:12},{n:'Pompki pike – nogi na ławce',min:5,max:10},
    {n:'Negatywy pompek w staniu na rękach (ściana)',min:3,max:6},{n:'Pompki w staniu na rękach przy ścianie',min:3,max:8}]},
  hang:  {name:'Brzuch w zwisie', sets:3, rest:60, variants:[
    {n:'Unoszenie kolan w zwisie',min:8,max:15},{n:'Unoszenie nóg w zwisie',min:6,max:12},{n:'Toes to bar',min:5,max:10}]},
  squat: {name:'Przysiad ze sztangą', sets:4, rest:180, inc:2.5, variants:[{min:5,max:8,w:true}]},
  rdl:   {name:'Rumuński martwy ciąg', sets:3, rest:150, inc:2.5, variants:[{min:8,max:10,w:true}]},
  bulg:  {name:'Przysiad bułgarski z hantlami', sets:3, rest:90, inc:2, note:'powtórzenia na każdą nogę', variants:[{min:8,max:12,w:true}]},
  pistol:{name:'Przysiad na jednej nodze', sets:3, rest:90, inc:2, note:'powtórzenia na każdą nogę', variants:[
    {n:'Pistol na ławkę',min:5,max:10},{n:'Pistol z asekuracją (trzymając się)',min:4,max:8},{n:'Pistol',min:3,max:8},{n:'Pistol z obciążeniem',min:3,max:6,w:true}]},
  calf:  {name:'Wspięcia na palce', sets:3, rest:60, inc:5, variants:[{min:10,max:15,w:true}]},
  hollow:{name:'Hollow body', type:'time', sets:3, rest:60, variants:[{n:'Hollow – nogi ugięte',min:20,max:45},{n:'Hollow body',min:20,max:45}]},
  push:  {name:'Pompki', sets:3, rest:90, inc:2.5, start:1, variants:[
    {n:'Pompki klasyczne',min:10,max:20},{n:'Pompki diamentowe',min:8,max:15},{n:'Pompki archer',min:5,max:10,nt:'na każdą stronę'},
    {n:'Pompki pseudo planche',min:5,max:10},{n:'Pompki z obciążeniem (talerz/kamizelka)',min:8,max:12,w:true}]},
  chin:  {name:'Podciąganie podchwytem', sets:3, rest:150, inc:2.5, variants:[
    {n:'Wiosłowanie australijskie podchwytem',min:8,max:15},{n:'Podciąganie podchwytem negatywne (5 s)',min:3,max:6},
    {n:'Podciąganie podchwytem z gumą',min:5,max:10},{n:'Podciąganie podchwytem',min:4,max:10},{n:'Podciąganie podchwytem z obciążeniem',min:4,max:8,w:true}]},
  ohp:   {name:'Wyciskanie hantli nad głowę siedząc', sets:3, rest:120, inc:2, variants:[{min:8,max:12,w:true}]},
  lat:   {name:'Ściąganie drążka wyciągu', sets:3, rest:90, inc:2.5, variants:[{min:8,max:12,w:true}]},
  face:  {name:'Face pull', sets:3, rest:60, inc:2.5, variants:[{min:12,max:15,w:true}]},
  lsit:  {name:'L-sit', type:'time', sets:3, rest:60, variants:[
    {n:'L-sit z ugiętymi nogami (tuck)',min:10,max:30},{n:'L-sit – jedna noga prosta',min:10,max:30},{n:'L-sit',min:10,max:30}]},
  hipt:  {name:'Hip thrust ze sztangą', sets:3, rest:120, inc:5, variants:[{min:8,max:12,w:true}]},
  press: {name:'Prasa nożna', sets:3, rest:120, inc:5, variants:[{min:10,max:15,w:true}]},
  lunge: {name:'Wykroki chodzone z hantlami', sets:3, rest:90, inc:2, note:'kroki łącznie', variants:[{min:10,max:16,w:true}]},
  legcurl:{name:'Uginanie nóg na maszynie', sets:3, rest:75, inc:2.5, variants:[{min:10,max:15,w:true}]},
  wheel: {name:'Kółko do brzucha', sets:3, rest:60, variants:[
    {n:'Kółko z kolan – krótki zakres',min:6,max:12},{n:'Kółko z kolan – pełny zakres',min:6,max:12},{n:'Kółko ze stania – negatyw',min:3,max:6}]},
};
var WORKOUTS = [
  {id:'UA', name:'Góra A', sub:'Podciąganie, dipsy, barki', color:'#0A84FF', ex:['pull','dip','incdb','row','pike','hang'], cardio:'15 min truchtu lub orbitreka', cardioMin:15},
  {id:'LA', name:'Dół A',  sub:'Przysiad, martwy ciąg, pistol', color:'#FF9F0A', ex:['squat','rdl','bulg','pistol','calf','hollow'], cardio:'20 min truchtu', cardioMin:20},
  {id:'UB', name:'Góra B', sub:'Pompki, podchwyt, L-sit', color:'#BF5AF2', ex:['push','chin','ohp','lat','face','lsit'], cardio:'15 min truchtu lub roweru', cardioMin:15},
  {id:'LB', name:'Dół B',  sub:'Pośladki, uda, brzuch', color:'#30D158', ex:['hipt','press','lunge','legcurl','calf','wheel'], cardio:'20 min truchtu', cardioMin:20},
];
var WARMUP = 'Rozgrzewka 5–10 min: krążenia ramion i bioder, mobilność barków, 1–2 lekkie serie pierwszego ćwiczenia';

// Normalizacja
Object.keys(EX).forEach(function (id) {
  var d = EX[id];
  d.id = id;
  d.type = d.type || 'reps';
  d.inc = d.inc || 0;
  d.variants.forEach(function (v) { v.n = v.n || d.name; });
});

/* ================================================================
 * HELPERY
 * ================================================================ */
var MONTHS_SHORT = ['sty','lut','mar','kwi','maj','cze','lip','sie','wrz','paź','lis','gru'];

function esc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function round2(n) { return Math.round(n * 100) / 100; }

function fmt(n) {
  if (n == null || n === '' || isNaN(n)) return '';
  return String(round2(Number(n))).replace('.', ',');
}

function parseNum(str) {
  if (str == null) return null;
  if (typeof str === 'number') return isFinite(str) ? str : null;
  var s = String(str).trim().replace(/\s+/g, '').replace(',', '.');
  if (s === '' || !/^[+-]?(\d+\.?\d*|\.\d+)$/.test(s)) return null;
  var n = Number(s);
  return isFinite(n) ? n : null;
}

/** Polska odmiana – zwraca SAMO słowo (bez liczby). */
function plural(n, one, few, many) {
  n = Math.abs(Math.floor(Number(n) || 0));
  if (n === 1) return one;
  var d = n % 10, h = n % 100;
  if (d >= 2 && d <= 4 && !(h >= 12 && h <= 14)) return few;
  return many;
}

function pad2(n) { return (n < 10 ? '0' : '') + n; }

/** Date | ms | ISO | 'YYYY-MM-DD' (traktowane lokalnie) → Date */
function toDate(x) {
  if (x instanceof Date) return new Date(x.getTime());
  if (typeof x === 'string') {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(x);
    if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
  }
  if (x == null) return new Date();
  return new Date(x);
}

function dateKey(dateOrMs) {
  var d = toDate(dateOrMs);
  return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
}

function dayDiff(a, b) { // pełne dni kalendarzowe b - a
  var da = toDate(dateKey(a)), db = toDate(dateKey(b));
  return Math.round((db - da) / 86400000);
}

function relDay(isoOrMs) {
  var n = dayDiff(isoOrMs, new Date());
  if (n === 0) return 'dzisiaj';
  if (n === 1) return 'wczoraj';
  if (n === -1) return 'jutro';
  if (n < 0) return 'za ' + (-n) + ' dni';
  return n + ' dni temu';
}

function fmtDur(sec) {
  sec = Math.max(0, Number(sec) || 0);
  var totalMin = Math.round(sec / 60);
  var h = Math.floor(totalMin / 60), m = totalMin % 60;
  if (h > 0) return m ? h + ' h ' + m + ' min' : h + ' h';
  return m + ' min';
}

function mmss(sec) {
  sec = Math.max(0, Math.floor(Number(sec) || 0));
  return Math.floor(sec / 60) + ':' + pad2(sec % 60);
}

function hmmss(sec) { // mm:ss lub h:mm:ss
  sec = Math.max(0, Math.floor(Number(sec) || 0));
  var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  return h > 0 ? h + ':' + pad2(m) + ':' + pad2(s) : pad2(m) + ':' + pad2(s);
}

function fmtDate(iso) {
  var d = toDate(iso);
  if (isNaN(d)) return '';
  return d.getDate() + ' ' + MONTHS_SHORT[d.getMonth()] + ' ' + d.getFullYear();
}

function mondayKey(date) {
  var d = toDate(date);
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - (d.getDay() + 6) % 7);
  return dateKey(d);
}

/* ================================================================
 * STAN
 * ================================================================ */
var STORE_KEY = 'silka.v1';

function defState() {
  return {
    version: 1,
    ex: {},
    nextIdx: 0,
    history: [],
    body: [],
    active: null,
    settings: {sound: true, wake: true, remDays: [1, 3, 5], remTime: '18:00'},
    lastExport: null,
    installHintHidden: false
  };
}

function loadState() {
  var st = defState(), raw = null;
  try { raw = localStorage.getItem(STORE_KEY); } catch (e) { raw = null; }
  if (!raw) return st;
  var obj;
  try { obj = JSON.parse(raw); } catch (e) { return st; }
  if (!obj || typeof obj !== 'object') return st;
  Object.keys(obj).forEach(function (k) {
    if (k === 'settings') {
      if (obj.settings && typeof obj.settings === 'object') {
        Object.keys(obj.settings).forEach(function (sk) { st.settings[sk] = obj.settings[sk]; });
      }
    } else {
      st[k] = obj[k];
    }
  });
  if (!st.ex || typeof st.ex !== 'object' || Array.isArray(st.ex)) st.ex = {};
  if (!Array.isArray(st.history)) st.history = [];
  if (!Array.isArray(st.body)) st.body = [];
  if (!Array.isArray(st.settings.remDays)) st.settings.remDays = [1, 3, 5];
  if (typeof st.nextIdx !== 'number' || st.nextIdx < 0 || st.nextIdx >= WORKOUTS.length) st.nextIdx = 0;
  if (st.active && (typeof st.active !== 'object' || !Array.isArray(st.active.items))) st.active = null;
  st.version = 1;
  return st;
}

var S = loadState();
var _saveWarned = false;

function save() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(S));
    return true;
  } catch (e) {
    if (!_saveWarned) { _saveWarned = true; try { toast('Nie udało się zapisać danych'); } catch (e2) {} }
    return false;
  }
}

var ui = {tab: 'today', pick: null, calMonth: null, calSel: null, bodyMetric: 'weight'};
var VIEWS = {};
var ACTIONS = {};

/* ================================================================
 * PROGRESJA
 * ================================================================ */
function getSt(id) {
  var d = EX[id];
  var c = S.ex[id];
  if (c && typeof c === 'object') {
    if (d && (typeof c.v !== 'number' || c.v < 0 || c.v >= d.variants.length)) {
      c.v = Math.max(0, Math.min(d.variants.length - 1, c.v | 0));
    }
    if (typeof c.fails !== 'number') c.fails = 0;
    if (c.prev === undefined) c.prev = null;
    if (c.w === undefined) c.w = null;
    if (d && typeof c.t !== 'number') c.t = d.variants[c.v].min;
    return c;
  }
  if (!d) return {v: 0, w: null, t: 0, fails: 0, prev: null};
  var v = d.start || 0;
  return {v: v, w: null, t: d.variants[v].min, fails: 0, prev: null};
}

function isGym(def) { return def.variants.length === 1 && !!def.variants[0].w; }

function targetStr(def, c) {
  var vr = def.variants[c.v] || def.variants[0];
  var s = def.sets + ' × ' + c.t + (def.type === 'time' ? ' s' : '');
  if (vr.w) {
    if (c.w > 0) s += ' · ' + (isGym(def) ? '' : '+') + fmt(c.w) + ' kg';
    else s += ' · ustaw ciężar';
  }
  return s;
}

function up(def, c) {
  var step = def.type === 'time' ? 5 : 1;
  var vr = def.variants[c.v];
  var w = c.w == null ? null : c.w;
  if (c.t + step <= vr.max) return {v: c.v, w: w, t: c.t + step};
  if (c.t < vr.max) return {v: c.v, w: w, t: vr.max};
  if (vr.w && def.inc) return {v: c.v, w: round2((c.w || 0) + def.inc), t: vr.min};
  var nx = def.variants[c.v + 1];
  if (nx) return {v: c.v + 1, t: nx.min, w: nx.w ? (c.w > 0 ? c.w : (def.inc || 2.5)) : null};
  return {v: c.v, w: w, t: c.t + step};
}

function down(def, c) {
  var step = def.type === 'time' ? 5 : 1;
  var vr = def.variants[c.v];
  var w = c.w == null ? null : c.w;
  if (c.t - step >= vr.min) return {v: c.v, w: w, t: c.t - step};
  if (vr.w && c.w > def.inc) return {v: c.v, w: round2(c.w - def.inc), t: vr.max};
  if (c.v > 0) {
    var pv = def.variants[c.v - 1];
    return {v: c.v - 1, t: pv.max, w: pv.w ? w : null};
  }
  return {v: c.v, w: w, t: c.t};
}

function bestSet(id, excludeId) {
  var best = null;
  (S.history || []).forEach(function (h) {
    if (!h || (excludeId != null && h.id === excludeId)) return;
    (h.items || []).forEach(function (it) {
      if (!it || it.id !== id || it.skip || !Array.isArray(it.sets)) return;
      var v = it.v || 0, w = it.w || 0;
      it.sets.forEach(function (r) {
        r = Number(r) || 0;
        if (r <= 0) return;
        var better = !best || v > best.v ||
          (v === best.v && (w > (best.w || 0) || (w === (best.w || 0) && r > best.r)));
        if (better) best = {v: v, w: it.w == null ? null : it.w, r: r, vn: it.vn, date: h.date};
      });
    });
  });
  return best;
}

/* ================================================================
 * RENDER / ROUTING
 * ================================================================ */
var TABS = [
  {id: 'today', label: 'Trening', icon:
    '<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M9 14h10"/><rect x="5" y="8" width="4" height="12" rx="1.5"/><rect x="19" y="8" width="4" height="12" rx="1.5"/>' +
    '<path d="M3 11.5v5M25 11.5v5"/></svg>'},
  {id: 'history', label: 'Historia', icon:
    '<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<rect x="4" y="6" width="20" height="18" rx="3"/><path d="M4 11h20M9 3.5v4M19 3.5v4"/>' +
    '<circle cx="10" cy="16" r="1" fill="currentColor"/><circle cx="14" cy="16" r="1" fill="currentColor"/><circle cx="18" cy="16" r="1" fill="currentColor"/>' +
    '<circle cx="10" cy="20" r="1" fill="currentColor"/><circle cx="14" cy="20" r="1" fill="currentColor"/></svg>'},
  {id: 'progress', label: 'Postęp', icon:
    '<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M4 24h20"/><path d="M5 18l6-6 4 4 8-8"/><path d="M17 8h6v6"/></svg>'},
  {id: 'settings', label: 'Ustawienia', icon:
    '<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<circle cx="14" cy="14" r="3.5"/>' +
    '<path d="M14 3.5v3M14 21.5v3M3.5 14h3M21.5 14h3M6.6 6.6l2.1 2.1M19.3 19.3l2.1 2.1M6.6 21.4l2.1-2.1M19.3 8.7l2.1-2.1"/>' +
    '<circle cx="14" cy="14" r="7.5"/></svg>'}
];

function $(id) { return typeof document !== 'undefined' ? document.getElementById(id) : null; }

function renderTabbar() {
  var el = $('tabbar');
  if (!el) return;
  el.innerHTML = TABS.map(function (t) {
    var badge = (t.id === 'today' && S.active && ui.tab !== 'today') ? '<span class="tab-badge"></span>' : '';
    return '<button type="button" class="tab' + (ui.tab === t.id ? ' active' : '') + '" data-act="tab" data-tab="' + t.id + '"' +
      (ui.tab === t.id ? ' aria-current="page"' : '') + '>' +
      '<span class="tab-icon">' + t.icon + badge + '</span><span class="tab-label">' + t.label + '</span></button>';
  }).join('');
}

function render() {
  var view = $('view');
  if (view) {
    var fn = VIEWS[ui.tab];
    var html;
    if (typeof fn === 'function') {
      try { html = fn(); }
      catch (e) {
        if (typeof console !== 'undefined') console.error(e);
        html = '<div class="page"><div class="empty">Coś poszło nie tak przy rysowaniu widoku.<br><span class="muted">' +
          esc(e && e.message) + '</span></div></div>';
      }
    } else {
      html = '<div class="page"><div class="empty">Ten widok jest jeszcze niedostępny.</div></div>';
    }
    view.innerHTML = html == null ? '' : html;
  }
  renderTabbar();
  renderTimerbar();
  updateElapsed();
}

function go(tab) {
  ui.tab = tab;
  render();
  try { window.scrollTo(0, 0); } catch (e) {}
}

/* ================================================================
 * SHEET / CONFIRM / TOAST
 * ================================================================ */
var _sheetTimer = null, _confirmCb = null;

function sheet(html) {
  var el = $('sheet');
  if (!el) return;
  clearTimeout(_sheetTimer);
  el.innerHTML = '<div class="sheet-backdrop" data-act="closeSheet"></div>' +
    '<div class="sheet-panel" role="dialog" aria-modal="true"><div class="sheet-grabber"></div>' +
    '<div class="sheet-body">' + html + '</div></div>';
  // wymuszenie reflow, żeby animacja ruszyła
  void el.offsetHeight;
  el.classList.add('open');
  document.body.classList.add('sheet-open');
}

function closeSheet() {
  var el = $('sheet');
  if (!el) return;
  el.classList.remove('open');
  document.body.classList.remove('sheet-open');
  clearTimeout(_sheetTimer);
  _sheetTimer = setTimeout(function () {
    if (!el.classList.contains('open')) el.innerHTML = '';
  }, 320);
}

function confirmSheet(text, okLabel, danger, cb) {
  _confirmCb = cb || null;
  sheet('<div class="confirm-text">' + esc(text) + '</div>' +
    '<button type="button" class="btn btn-block ' + (danger ? 'btn-danger-fill' : 'btn-primary') + '" data-act="confirmOk">' +
    esc(okLabel || 'OK') + '</button>' +
    '<button type="button" class="btn btn-block btn-secondary" data-act="closeSheet">Anuluj</button>');
}

var _toastTimer = null;
function toast(msg) {
  var el = $('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2400);
}

/* ================================================================
 * TIMER
 * ================================================================ */
var _tbKey = null, _tickHandle = null;

function startTimer(o) {
  if (!S.active) return;
  var secs = Math.max(1, Number(o.secs) || 0);
  var t = {mode: o.mode || 'rest', end: Date.now() + secs * 1000, total: secs, label: o.label || ''};
  if (o.i != null) t.i = o.i;
  if (o.s != null) t.s = o.s;
  if (o.next != null) t.next = o.next;
  S.active.timer = t;
  save();
  renderTimerbar();
  ensureTick();
}

function stopTimer() {
  if (S.active && S.active.timer) {
    S.active.timer = null;
    save();
  }
  renderTimerbar();
}

function timerKey(t) { return t ? t.mode + '|' + t.end + '|' + t.total + '|' + (t.label || '') : null; }

function renderTimerbar() {
  var el = $('timerbar');
  if (!el) return;
  var t = S.active && S.active.timer;
  var key = timerKey(t);
  _tbKey = key;
  if (!t) {
    el.classList.remove('show');
    el.innerHTML = '';
    if (typeof document !== 'undefined') document.body.classList.remove('has-timer');
    return;
  }
  var rem = Math.max(0, (t.end - Date.now()) / 1000);
  var pct = t.total > 0 ? Math.max(0, Math.min(100, (1 - rem / t.total) * 100)) : 100;
  var btns = t.mode === 'rest'
    ? '<button type="button" class="tb-btn" data-act="tAdd" data-d="-15">−15</button>' +
      '<button type="button" class="tb-btn" data-act="tAdd" data-d="15">+15</button>' +
      '<button type="button" class="tb-btn tb-btn-main" data-act="tSkip">Pomiń</button>'
    : '<button type="button" class="tb-btn tb-btn-stop" data-act="tStop">Stop</button>';
  var modeLbl = {rest: 'Przerwa', prep: 'Przygotuj się', hold: 'Trzymaj', cardio: 'Kardio'}[t.mode] || '';
  el.className = 'show mode-' + t.mode;
  el.innerHTML =
    '<div class="tb-inner">' +
      '<div class="tb-info">' +
        '<div class="tb-label">' + esc(t.label || modeLbl) + '</div>' +
        '<div class="tb-time" id="tbTime">' + mmss(Math.ceil(rem)) + '</div>' +
      '</div>' +
      '<div class="tb-btns">' + btns + '</div>' +
    '</div>' +
    '<div class="tb-track"><div class="tb-progress" id="tbProg" style="width:' + pct.toFixed(1) + '%"></div></div>';
  document.body.classList.add('has-timer');
}

function updateTimerbar() {
  var t = S.active && S.active.timer;
  if (timerKey(t) !== _tbKey) { renderTimerbar(); return; }
  if (!t) return;
  var rem = Math.max(0, (t.end - Date.now()) / 1000);
  var tm = $('tbTime'), pr = $('tbProg');
  var txt = mmss(Math.ceil(rem));
  if (tm && tm.textContent !== txt) tm.textContent = txt;
  if (pr) {
    var pct = t.total > 0 ? Math.max(0, Math.min(100, (1 - rem / t.total) * 100)) : 100;
    pr.style.width = pct.toFixed(1) + '%';
  }
}

function updateElapsed() {
  var el = $('elapsed');
  if (!el || !S.active || !S.active.start) return;
  var txt = hmmss((Date.now() - S.active.start) / 1000);
  if (el.textContent !== txt) el.textContent = txt;
}

function timerDone(t) {
  // nie piszczymy, jeśli wracamy do aplikacji długo po czasie
  if (Date.now() - t.end < 30000) beep(3);
  if (typeof onTimerDone === 'function') {
    try { onTimerDone(t); } catch (e) { if (typeof console !== 'undefined') console.error(e); }
  }
  if (S.active && S.active.timer === t) {
    S.active.timer = null;
    save();
  }
  renderTimerbar();
}

function tick() {
  if (!S.active) {
    if (_tbKey !== null) renderTimerbar();
    return;
  }
  updateElapsed();
  var t = S.active.timer;
  if (t && Date.now() >= t.end) { timerDone(t); return; }
  updateTimerbar();
}

function ensureTick() {
  if (_tickHandle == null) _tickHandle = setInterval(tick, 250);
}

/* ================================================================
 * DŹWIĘK
 * ================================================================ */
var _actx = null;

function unlockAudio() {
  try {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!_actx) _actx = new AC();
    if (_actx.state === 'suspended') _actx.resume();
    // cichy bufor odblokowujący na iOS
    var b = _actx.createBuffer(1, 1, 22050), src = _actx.createBufferSource();
    src.buffer = b; src.connect(_actx.destination); src.start(0);
  } catch (e) {}
}

function beep(n) {
  if (n == null) n = 3;
  try { if (navigator.vibrate) navigator.vibrate(n > 1 ? [150, 100, 150, 100, 300].slice(0, n * 2 - 1) : 200); } catch (e) {}
  if (!S.settings || !S.settings.sound) return;
  try {
    if (!_actx) unlockAudio();
    if (!_actx) return;
    if (_actx.state === 'suspended') _actx.resume();
    var now = _actx.currentTime + 0.02;
    for (var i = 0; i < n; i++) {
      var last = i === n - 1;
      var start = now + i * 0.32, dur = last ? 0.35 : 0.16;
      var osc = _actx.createOscillator(), g = _actx.createGain();
      osc.type = 'sine';
      osc.frequency.value = last ? 1320 : 880;
      g.gain.setValueAtTime(0.0001, start);
      g.gain.exponentialRampToValueAtTime(0.5, start + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      osc.connect(g); g.connect(_actx.destination);
      osc.start(start); osc.stop(start + dur + 0.05);
    }
  } catch (e) {}
}

/* ================================================================
 * WAKE LOCK
 * ================================================================ */
var _wakeWanted = false, _wakeLock = null;

function keepAwake(on) {
  _wakeWanted = !!on;
  var allowed = on && S.settings && S.settings.wake;
  try {
    if (allowed) {
      if (_wakeLock || typeof navigator === 'undefined' || !navigator.wakeLock) return;
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
      navigator.wakeLock.request('screen').then(function (lock) {
        if (!_wakeWanted) { try { lock.release(); } catch (e) {} return; }
        _wakeLock = lock;
        lock.addEventListener('release', function () { if (_wakeLock === lock) _wakeLock = null; });
      }).catch(function () {});
    } else if (_wakeLock) {
      var l = _wakeLock; _wakeLock = null;
      l.release().catch(function () {});
    }
  } catch (e) {}
}

/* ================================================================
 * AKCJE CORE + DELEGACJA
 * ================================================================ */
ACTIONS.tab = function (el) {
  var t = el.dataset.tab;
  if (t === ui.tab) { try { window.scrollTo({top: 0, behavior: 'smooth'}); } catch (e) { window.scrollTo(0, 0); } return; }
  go(t);
};
ACTIONS.closeSheet = function () { _confirmCb = null; closeSheet(); };
ACTIONS.confirmOk = function () {
  var cb = _confirmCb; _confirmCb = null;
  closeSheet();
  if (typeof cb === 'function') cb();
};
ACTIONS.tAdd = function (el) {
  var t = S.active && S.active.timer;
  if (!t) return;
  var d = Number(el.dataset.d) || 0;
  var now = Date.now();
  t.end = Math.max(now, t.end + d * 1000);
  var rem = (t.end - now) / 1000;
  t.total = Math.max(1, Math.max(t.total + d, Math.ceil(rem)));
  save();
  if (t.end <= now) { timerDone(t); return; }
  renderTimerbar();
};
ACTIONS.tSkip = function () { stopTimer(); render(); };
ACTIONS.tStop = function () { stopTimer(); render(); };

function bindEvents() {
  document.addEventListener('click', function (ev) {
    var tg = ev.target;
    if (tg && tg.nodeType !== 1) tg = tg.parentElement;
    var el = tg && tg.closest ? tg.closest('[data-act]') : null;
    if (!el || el.disabled) return;
    var fn = ACTIONS[el.dataset.act];
    if (typeof fn === 'function') {
      if (el.tagName === 'A') ev.preventDefault();
      try { fn(el, ev); } catch (e) { if (typeof console !== 'undefined') console.error(e); }
    }
  });
  document.addEventListener('change', function (ev) {
    var tg = ev.target;
    var el = tg && tg.closest ? tg.closest('[data-chg]') : null;
    if (!el) return;
    var fn = ACTIONS[el.dataset.chg];
    if (typeof fn === 'function') {
      try { fn(el, ev); } catch (e) { if (typeof console !== 'undefined') console.error(e); }
    }
  });
  var unlock = function () {
    unlockAudio();
    document.removeEventListener('touchend', unlock, true);
    document.removeEventListener('click', unlock, true);
  };
  document.addEventListener('touchend', unlock, true);
  document.addEventListener('click', unlock, true);

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') {
      if (_wakeWanted) keepAwake(true);
      if (_actx && _actx.state === 'suspended') { try { _actx.resume(); } catch (e) {} }
      tick();
    }
  });
}

/* ================================================================
 * APP
 * ================================================================ */
var App = {
  _inited: false,
  init: function () {
    if (App._inited) return;
    App._inited = true;
    S = loadState();
    bindEvents();
    render();
    ensureTick();
    try {
      if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(function () {});
    } catch (e) {}
    try {
      if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(function () {});
    } catch (e) {}
    if (S.active) keepAwake(true);
  }
};

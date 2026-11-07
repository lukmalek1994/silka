/* Siłka – stretch.js: dział „Rozciąganie” – gotowe sesje z prowadzącym timerem */
(function () {
  'use strict';

  // t: czas utrzymania w s, sides: na każdą stronę, dyn: ruch dynamiczny
  var ST = {
    kforearm: {n: 'Nadgarstki i przedramiona', t: 30, how: 'Klęk podparty, palce skierowane do kolan. Delikatnie przenoś ciężar do tyłu, aż poczujesz rozciąganie przedramion.'},
    wristc: {n: 'Krążenia nadgarstków', t: 30, dyn: true, how: 'Spleć dłonie lub trzymaj je luźno i rób spokojne krążenia w obie strony.'},
    shcirc: {n: 'Krążenia barków', t: 30, dyn: true, how: 'Ręce luźno wzdłuż ciała, zataczaj barkami duże koła – do przodu, potem do tyłu.'},
    dynchest: {n: 'Otwieranie klatki', t: 30, dyn: true, how: 'Ręce przed sobą, potem szeroko na boki do tyłu, otwierając klatkę. Rytmicznie, bez szarpania.'},
    chestsh: {n: 'Klatka i przód barków', t: 30, how: 'Trzymaj kij lub ręcznik szerokim chwytem i przenieś proste ręce nad głową do tyłu, na tyle, na ile pozwalają barki.'},
    shoulder: {n: 'Bark – ręka przez klatkę', t: 30, sides: true, how: 'Prostą rękę przełóż przed klatką, drugą ręką dociągnij ją za łokieć do siebie. Bark nisko.'},
    latst: {n: 'Skłon w bok', t: 30, sides: true, how: 'Ręka za głowę, łokieć w górę i skłoń się w bok – rozciągasz triceps i mięsień najszerszy.'},
    upback: {n: 'Górna część pleców', t: 30, how: 'Spleć dłonie przed sobą, wypchnij ręce do przodu i zaokrąglij górną część pleców, rozsuwając łopatki.'},
    neck: {n: 'Szyja w bok', t: 20, sides: true, how: 'Przechyl głowę uchem do barku, ręką delikatnie dociśnij. Przeciwny bark opuść w dół.'},
    child: {n: 'Pozycja dziecka', t: 45, how: 'Usiądź na piętach, połóż tułów na udach i wyciągnij ręce daleko przed siebie. Spokojnie oddychaj.'},
    cat: {n: 'Koci grzbiet', t: 40, dyn: true, how: 'W klęku podpartym na zmianę zaokrąglaj plecy w górę i wyginaj je w dół – powoli, z oddechem.'},
    spinal: {n: 'Skręt tułowia siedząc', t: 30, sides: true, how: 'Usiądź prosto, dłonie za głową i skręć tułów w bok, aż poczujesz rozciąganie wzdłuż kręgosłupa.'},
    kneeacross: {n: 'Skręt tułowia leżąc', t: 30, sides: true, how: 'Leżąc na plecach przełóż ugiętą nogę na drugą stronę ciała, barki zostają na podłodze.'},
    hipflex: {n: 'Zginacze bioder w klęku', t: 30, sides: true, how: 'Klęk jednonóż, spnij pośladek tylnej nogi i przesuń biodra lekko do przodu. Tułów prosto.'},
    quad: {n: 'Przód uda leżąc na boku', t: 30, sides: true, how: 'Leżąc na boku złap stopę górnej nogi i przyciągnij piętę do pośladka, kolana razem.'},
    hamstr: {n: 'Tył uda siedząc', t: 40, sides: true, how: 'Jedna noga prosta, druga ugięta. Skłoń się z prostymi plecami w stronę stopy prostej nogi.'},
    hamband: {n: 'Tył uda leżąc z ręcznikiem', t: 30, sides: true, how: 'Leżąc na plecach załóż ręcznik lub gumę na stopę i przyciągaj prostą nogę w górę.'},
    glute4: {n: 'Pośladek – „czwórka”', t: 30, sides: true, how: 'Leżąc na plecach połóż kostkę na kolanie drugiej nogi i przyciągnij tę nogę do klatki.'},
    knee2chest: {n: 'Kolano do klatki', t: 30, sides: true, how: 'Leżąc na plecach przyciągnij jedno kolano do klatki, druga noga leży prosto na podłodze.'},
    straddle: {n: 'Rozkrok siedząc', t: 45, how: 'Usiądź w szerokim rozkroku i pochylaj się z prostymi plecami do przodu i do nóg.'},
    calfwall: {n: 'Łydka przy ścianie', t: 30, sides: true, how: 'Dłonie na ścianie, jedna noga z tyłu prosta, pięta wciśnięta w podłogę. Przesuwaj biodra do ściany.'},
    wgs: {n: 'World’s greatest stretch', t: 40, sides: true, dyn: true, how: 'Wykrok, dłoń przy stopie przedniej nogi, łokieć do podłogi, potem skręć tułów i wyciągnij rękę w górę. Kilka powtórzeń.'},
    runner: {n: 'Skłon biegacza', t: 30, sides: true, how: 'Jedna noga z przodu, skłoń się do niej z prostymi plecami, tylne kolano lekko ugięte.'},
    hipcirc: {n: 'Krążenia bioder', t: 30, sides: true, dyn: true, how: 'Stojąc unieś ugiętą nogę i zataczaj kolanem duże koła na zewnątrz i do środka.'},
    inchworm: {n: 'Inchworm (gąsienica)', t: 40, dyn: true, how: 'Skłon do podłogi, przejdź dłońmi do podporu, wróć dłońmi do stóp i wstań. Powtarzaj.'},
    armcirc: {n: 'Krążenia ramion', t: 30, dyn: true, photo: 'armcirc', how: 'Proste ręce w bok, zataczaj coraz większe koła – do przodu i do tyłu.'}
  };

  var ROUTINES = [
    {id: 'warm', name: 'Rozgrzewka – mobilność', sub: 'Przed treningiem', color: '#FF9F0A', list: ['armcirc', 'shcirc', 'wristc', 'dynchest', 'hipcirc', 'inchworm', 'wgs']},
    {id: 'upper', name: 'Po treningu góry', sub: 'Klatka, barki, plecy', color: '#0A84FF', list: ['kforearm', 'chestsh', 'shoulder', 'latst', 'upback', 'child', 'neck']},
    {id: 'lower', name: 'Po treningu nóg', sub: 'Biodra, uda, łydki', color: '#30D158', list: ['hipflex', 'quad', 'hamstr', 'glute4', 'calfwall', 'straddle', 'kneeacross']},
    {id: 'full', name: 'Całe ciało', sub: 'Po każdym treningu', color: '#BF5AF2', list: ['cat', 'child', 'wgs', 'hipflex', 'hamstr', 'glute4', 'shoulder', 'chestsh', 'kneeacross']},
    {id: 'spine', name: 'Kręgosłup i biodra', sub: 'Wieczorem, na rozluźnienie', color: '#64D2FF', list: ['cat', 'child', 'spinal', 'kneeacross', 'knee2chest', 'glute4', 'hipflex']},
    {id: 'wrist', name: 'Nadgarstki i barki', sub: 'Pod kalistenikę', color: '#FF375F', list: ['wristc', 'kforearm', 'shcirc', 'dynchest', 'chestsh', 'shoulder', 'latst']}
  ];
  var PREP = 5; // sekundy na przygotowanie przed każdą pozycją

  function photo(id) { return ST[id].photo || ('st_' + id); }
  // lista kroków: każda strona osobno
  function steps(r) {
    var out = [];
    r.list.forEach(function (id) {
      var s = ST[id];
      if (s.sides) { out.push({id: id, side: 'Lewa strona'}); out.push({id: id, side: 'Prawa strona'}); }
      else out.push({id: id, side: ''});
    });
    return out;
  }
  function routineSecs(r) { return steps(r).reduce(function (a, x) { return a + ST[x.id].t + PREP; }, 0); }
  function rById(id) { return ROUTINES.find(function (r) { return r.id === id; }); }

  /* ---------- sekcja na ekranie głównym ---------- */
  globalThis.stretchHomeHTML = function () {
    return '<div class="section-title">Rozciąganie</div><div class="lib">' + ROUTINES.map(function (r) {
      return '<button class="lib-card" style="--c:' + r.color + '" data-act="stInfo" data-id="' + r.id + '">' +
        '<span class="lib-media"><div class="ex-thumb ph-thumb"><img src="img/' + photo(r.list[1]) + '-1.jpg" alt="" loading="lazy"></div></span>' +
        '<span class="lib-name">' + esc(r.name) + '</span>' +
        '<span class="lib-sub">' + esc(r.sub) + ' · ' + Math.round(routineSecs(r) / 60) + ' min</span></button>';
    }).join('') + '</div>';
  };

  ACTIONS.stInfo = function (el) {
    var r = rById(el.dataset.id);
    var h = '<div style="--c:' + r.color + '"><div class="ex-group">Rozciąganie · ok. ' + Math.round(routineSecs(r) / 60) + ' min</div>' +
      '<div class="ex-name" style="font-size:20px;line-height:25px;color:var(--c)">' + esc(r.name) + '</div>' +
      '<div class="list" style="margin-top:12px">';
    r.list.forEach(function (id) {
      var s = ST[id];
      h += '<div class="row"><div class="ex-thumb ph-thumb"><img src="img/' + photo(id) + '-1.jpg" alt="" loading="lazy"></div>' +
        '<div class="row-main"><div class="row-title">' + esc(s.n) + '</div>' +
        '<div class="row-sub">' + (s.dyn ? 'ruch' : 'utrzymaj') + ' ' + s.t + ' s' + (s.sides ? ' · na każdą stronę' : '') + '</div></div></div>';
    });
    h += '</div><button class="btn btn-primary btn-block" data-act="stStart" data-id="' + r.id + '">Start</button>' +
      '<button class="btn btn-secondary btn-block" style="margin-top:8px" data-act="closeSheet">Zamknij</button></div>';
    sheet(h);
  };

  /* ---------- odtwarzacz sesji ---------- */
  var tick = null;
  function stopTick() { if (tick) { clearInterval(tick); tick = null; } }
  function startPhase(phase) {
    var st = ui.st, cur = st.list[st.i], secs = phase === 'prep' ? PREP : ST[cur.id].t;
    st.phase = phase; st.total = secs; st.end = Date.now() + secs * 1000; st.paused = null;
  }
  function begin(rid) {
    var r = rById(rid);
    ui.st = {rid: rid, list: steps(r), i: 0};
    startPhase('prep');
    keepAwake(true);
    stopTick(); tick = setInterval(onTick, 250);
    render(); try { window.scrollTo(0, 0); } catch (e) {}
  }
  function finish(completed) {
    stopTick();
    var rid = ui.st && ui.st.rid;
    ui.st = null;
    if (!S.active) keepAwake(false);
    if (completed) {
      if (!Array.isArray(S.stretchLog)) S.stretchLog = [];
      S.stretchLog.push({date: new Date().toISOString(), rid: rid});
      save();
      toast('Rozciąganie zakończone 🧘');
    }
    render(); try { window.scrollTo(0, 0); } catch (e) {}
  }
  function go(i) {
    var st = ui.st;
    if (i >= st.list.length) { finish(true); return; }
    st.i = Math.max(0, i);
    startPhase('prep');
    render();
  }
  function remSecs() {
    var st = ui.st;
    if (st.paused != null) return st.paused;
    return Math.max(0, (st.end - Date.now()) / 1000);
  }
  function onTick() {
    var st = ui.st;
    if (!st) { stopTick(); return; }
    if (st.paused != null) return;
    var rem = remSecs();
    if (rem <= 0) {
      if (st.phase === 'prep') { beep(1); startPhase('hold'); render(); }
      else { beep(3); go(st.i + 1); }
      return;
    }
    var t = document.getElementById('stTime'), p = document.getElementById('stProg');
    var txt = String(Math.ceil(rem));
    if (t && t.textContent !== txt) t.textContent = txt;
    if (p) p.style.width = ((1 - rem / st.total) * 100).toFixed(1) + '%';
  }

  function playerView() {
    var st = ui.st, r = rById(st.rid), cur = st.list[st.i], s = ST[cur.id], nxt = st.list[st.i + 1];
    var rem = remSecs(), pct = (1 - rem / st.total) * 100, prep = st.phase === 'prep';
    var h = '<div class="page" style="--c:' + r.color + '">' +
      '<div style="display:flex;justify-content:space-between;align-items:center">' +
        '<button class="btn btn-danger btn-small" data-act="stStop">Zakończ</button>' +
        '<span class="subtitle" style="margin:0">' + (st.i + 1) + ' / ' + st.list.length + '</span></div>' +
      '<div class="large-title" style="color:var(--c);font-size:28px;line-height:34px">' + esc(r.name) + '</div>' +
      '<div class="st-steps">' + st.list.map(function (x, k) {
        return '<span class="' + (k < st.i ? 'done' : k === st.i ? 'cur' : '') + '"></span>';
      }).join('') + '</div>' +
      '<div class="ex-card" style="--c:' + r.color + '">' +
        exMedia({photo: photo(cur.id)}, 'ex-fig-lg') +
        '<div class="ex-group">' + (prep ? 'Przygotuj się' : (s.dyn ? 'Ruch' : 'Utrzymaj')) + (cur.side ? ' · ' + cur.side : '') + '</div>' +
        '<div class="ex-name" style="font-size:20px;line-height:25px">' + esc(s.n) + '</div>' +
        '<div class="st-timer' + (prep ? ' prep' : '') + '">' +
          '<div class="st-time" id="stTime">' + Math.ceil(rem) + '</div>' +
          '<div class="rest-track"><div class="rest-prog" id="stProg" style="width:' + pct.toFixed(1) + '%"></div></div>' +
        '</div>' +
        '<div class="st-ctrl">' +
          '<button class="tb-btn" data-act="stPrev"' + (st.i === 0 ? ' disabled' : '') + ' aria-label="Poprzednie">‹</button>' +
          '<button class="tb-btn tb-btn-main st-play" data-act="stPause">' + (st.paused != null ? '▶ Wznów' : 'Ⅱ Pauza') + '</button>' +
          '<button class="tb-btn" data-act="stNext" aria-label="Następne">›</button>' +
        '</div>' +
        '<div class="howto"><div class="howto-v">' + esc(s.how) + '</div></div>' +
      '</div>' +
      (nxt ? '<div class="footnote">Następne: ' + esc(ST[nxt.id].n) + (nxt.side ? ' (' + nxt.side.toLowerCase() + ')' : '') + '</div>' : '<div class="footnote">To ostatnia pozycja 💪</div>') +
      '</div>';
    return h;
  }

  var origToday = VIEWS.today;
  VIEWS.today = function () {
    if (ui.st && !S.active) return playerView();
    return origToday();
  };

  ACTIONS.stStart = function (el) { closeSheet(); begin(el.dataset.id); };
  ACTIONS.stStop = function () { finish(false); };
  ACTIONS.stNext = function () { go(ui.st.i + 1); };
  ACTIONS.stPrev = function () { go(ui.st.i - 1); };
  ACTIONS.stPause = function () {
    var st = ui.st;
    if (st.paused != null) { st.end = Date.now() + st.paused * 1000; st.paused = null; }
    else st.paused = remSecs();
    render();
  };

  // wywoływane z podsumowania treningu
  globalThis.stretchAfter = function (wid) {
    var rid = /^U/.test(wid) || wid === 'L_PUSH' || wid === 'L_PULL' ? 'upper' : /^L[AB]$/.test(wid) || wid === 'L_LEGS' ? 'lower' : 'full';
    ui.tab = 'today';
    begin(rid);
  };
  globalThis.stretchRoutineName = function (wid) {
    var rid = /^U/.test(wid) || wid === 'L_PUSH' || wid === 'L_PULL' ? 'upper' : /^L[AB]$/.test(wid) || wid === 'L_LEGS' ? 'lower' : 'full';
    return rById(rid).name;
  };
})();

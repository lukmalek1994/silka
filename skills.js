/* Siłka – skills.js: zakładka „Skille” – drzewka umiejętności kalistenicznych */
(function () {
  'use strict';

  // m: ilustracja ({ex, v} – zdjęcie/rysunek ćwiczenia, {fig} – rysunek pozy)
  var SKILLS = [
    {id: 'mu', name: 'Muscle up', color: '#0A84FF', m: {fig: 'sk_mu'},
     desc: 'Podciągnięcie i przejście nad drążek do podporu w jednym ruchu. Wymaga mocnego, wysokiego podciągania i dipsów.',
     steps: [
       {n: 'Zwis aktywny', goal: '3 × 30 s', m: {fig: 'sk_hang'}, how: 'Zwis na prostych rękach, ściągnij łopatki w dół – ciało lekko się unosi, łokcie zostają proste.'},
       {n: 'Wiosłowanie australijskie', goal: '3 × 12', m: {ex: 'pull', v: 0}, how: 'Ciało proste, przyciągaj klatkę do drążka na wysokości bioder.'},
       {n: 'Podciąganie negatywne', goal: '3 × 5 (5 s w dół)', m: {ex: 'pull', v: 1}, how: 'Zacznij z brodą nad drążkiem i opuszczaj się powoli przez 5 sekund.'},
       {n: 'Podciąganie', goal: '3 × 8', m: {ex: 'pull', v: 3}, how: 'Pełne powtórzenia z martwego zwisu, bez bujania.'},
       {n: 'Dipsy na poręczach', goal: '3 × 12', m: {ex: 'dip', v: 2}, how: 'Pełny zakres – ramię równolegle do podłogi i pełny wyprost.'},
       {n: 'Wysokie podciąganie', goal: '3 × 5', m: {ex: 'pull', v: 3}, how: 'Ciągnij eksplozywnie, aż drążek dotknie dolnej części klatki (okolice mostka). Lekko odchyl się do tyłu.'},
       {n: 'Muscle up negatywne', goal: '3 × 3', m: {fig: 'sk_mu'}, how: 'Z podporu nad drążkiem opuszczaj się powoli przez przejście do zwisu – to uczy ruchu.'},
       {n: 'Muscle up z gumą', goal: '3 × 3', m: {fig: 'sk_mu'}, how: 'Guma pod stopami lub kolanami pomaga w przejściu nad drążek. Ciągnij wysoko i szybko przerzuć łokcie nad drążek.'},
       {n: 'Muscle up', goal: '3 × 1–3', m: {fig: 'sk_mu'}, how: 'Lekki zamach, eksplozywne wysokie podciągnięcie, szybkie przerzucenie nadgarstków i dociśnięcie do podporu.'}
     ]},
    {id: 'hs', name: 'Stanie na rękach', color: '#FF9F0A', m: {fig: 'sk_hs'},
     desc: 'Równowaga na rękach bez podparcia. Buduje barki i kontrolę ciała, prowadzi do pompek w staniu na rękach.',
     steps: [
       {n: 'Pompki pike', goal: '3 × 10', m: {ex: 'pike', v: 0}, how: 'Biodra wysoko, opuszczaj głowę przed dłonie – przyzwyczaja barki do ciężaru.'},
       {n: 'Pike z nogami na ławce', goal: '3 × 8', m: {ex: 'pike', v: 1}, how: 'Stopy na podwyższeniu – więcej ciężaru na rękach.'},
       {n: 'Stanie plecami do ściany', goal: '3 × 30 s', m: {fig: 'sk_hsw'}, how: 'Wejdź wymachem nogą, pięty opierają się o ścianę. Ręce proste, barki wypchnięte do uszu, brzuch spięty.'},
       {n: 'Stanie przodem do ściany', goal: '3 × 45 s', m: {fig: 'sk_hsc'}, how: 'Wejdź „po ścianie” stopami, dłonie ok. 10–20 cm od ściany. Ciało prostsze niż plecami – to właściwa linia.'},
       {n: 'Odrywanie od ściany', goal: '5 × 5–10 s', m: {fig: 'sk_hsc'}, how: 'Przodem do ściany odsuń stopy i szukaj równowagi palcami dłoni (dociskaj palce, gdy lecisz na plecy).'},
       {n: 'Stanie bez podparcia', goal: '5 × 10 s', m: {fig: 'sk_hs'}, how: 'Wejdź z wymachu na środku pokoju. Naucz się wychodzić bezpiecznie – obrót w bok (cartwheel).'},
       {n: 'Stanie bez podparcia', goal: '3 × 30 s', m: {fig: 'sk_hs'}, how: 'Stabilna, prosta linia: dłonie, barki, biodra, stopy w jednej osi.'},
       {n: 'Pompki w staniu na rękach przy ścianie', goal: '3 × 5', m: {ex: 'pike', v: 3}, how: 'Głowa schodzi do podłogi (poduszka), wypchnij do pełnego wyprostu.'}
     ]},
    {id: 'fl', name: 'Front lever', color: '#BF5AF2', m: {fig: 'sk_fl3'},
     desc: 'Poziomy zwis twarzą do góry na prostych rękach. Ogromna siła pleców i brzucha.',
     steps: [
       {n: 'Zwis aktywny', goal: '3 × 30 s', m: {fig: 'sk_hang'}, how: 'Łopatki w dół, ręce proste.'},
       {n: 'Podciąganie', goal: '3 × 8', m: {ex: 'pull', v: 3}, how: 'Solidna baza siły przed pracą nad leverem.'},
       {n: 'Unoszenie nóg w zwisie', goal: '3 × 10', m: {ex: 'hang', v: 1}, how: 'Proste nogi do poziomu bez bujania.'},
       {n: 'Tuck front lever', goal: '5 × 10 s', m: {fig: 'sk_fl0'}, how: 'Kolana przyciągnięte do klatki, plecy poziomo, ręce proste – wciskaj drążek w dół w stronę bioder.'},
       {n: 'Advanced tuck', goal: '5 × 10 s', m: {fig: 'sk_fl1'}, how: 'Plecy płasko, biodra wyprostowane, uda pionowo w dół, kolana ugięte.'},
       {n: 'Front lever na jednej nodze', goal: '5 × 8 s', m: {fig: 'sk_fl2'}, how: 'Jedna noga prosta, druga ugięta – zmieniaj co serię.'},
       {n: 'Straddle front lever', goal: '5 × 5 s', m: {fig: 'sk_fl3'}, how: 'Obie nogi proste i szeroko rozstawione – krótsza dźwignia niż pełny lever.'},
       {n: 'Front lever', goal: '3 × 5 s', m: {fig: 'sk_fl3'}, how: 'Ciało proste i poziome, nogi razem, napięte pośladki.'}
     ]},
    {id: 'pl', name: 'Planche', color: '#FF375F', m: {fig: 'sk_pl3'},
     desc: 'Poziomy podpór na prostych rękach, ciało w powietrzu. Jeden z najtrudniejszych skilli – barki, nadgarstki i cierpliwość.',
     steps: [
       {n: 'Pompki', goal: '3 × 20', m: {ex: 'push', v: 0}, how: 'Baza – pełny zakres, ciało w linii.'},
       {n: 'Planche lean', goal: '3 × 30 s', m: {fig: 'sk_lean'}, how: 'W podporze przodem przesuń barki daleko przed dłonie, ręce proste, plecy lekko zaokrąglone.'},
       {n: 'Frog stand (wrona)', goal: '3 × 30 s', m: {fig: 'sk_frog'}, how: 'Kolana opierają się o łokcie, przenieś ciężar do przodu, aż stopy oderwą się od podłogi.'},
       {n: 'Pompki pseudo planche', goal: '3 × 8', m: {ex: 'push', v: 3}, how: 'Dłonie przy biodrach, barki przed dłońmi przez cały ruch.'},
       {n: 'Tuck planche', goal: '5 × 10 s', m: {fig: 'sk_pl1'}, how: 'Ręce proste, kolana pod klatką, biodra na wysokości barków, stopy w powietrzu.'},
       {n: 'Advanced tuck planche', goal: '5 × 8 s', m: {fig: 'sk_pl2'}, how: 'Plecy płasko, biodra odsunięte do tyłu, kolana ugięte.'},
       {n: 'Straddle planche', goal: '5 × 5 s', m: {fig: 'sk_pl3'}, how: 'Proste, szeroko rozstawione nogi, ciało poziomo.'},
       {n: 'Planche', goal: '3 × 3–5 s', m: {fig: 'sk_pl3'}, how: 'Nogi razem, ciało jak deska nad podłogą.'}
     ]},
    {id: 'pistol', name: 'Pistol squat', color: '#30D158', m: {ex: 'pistol', v: 2},
     desc: 'Pełny przysiad na jednej nodze. Siła nóg, mobilność kostki i równowaga.',
     steps: [
       {n: 'Głęboki przysiad', goal: '3 × 30 s w dole', m: {fig: 'sk_deep'}, how: 'Siedź w dole przysiadu, pięty na podłodze, plecy jak najprościej.'},
       {n: 'Przysiad', goal: '3 × 25', m: {ex: 'bwsquat', v: 0}, how: 'Pełny zakres bez obciążenia.'},
       {n: 'Przysiad bułgarski', goal: '3 × 10 / noga', m: {ex: 'bulg', v: 0}, how: 'Tylna stopa na ławce – można bez hantli.'},
       {n: 'Pistol na ławkę', goal: '3 × 8 / noga', m: {ex: 'pistol', v: 0}, how: 'Usiądź na ławce na jednej nodze i wstań.'},
       {n: 'Pistol z asekuracją', goal: '3 × 6 / noga', m: {ex: 'pistol', v: 1}, how: 'Trzymaj się słupka – pomagaj rękami jak najmniej.'},
       {n: 'Pistol', goal: '3 × 5 / noga', m: {ex: 'pistol', v: 2}, how: 'Bez podparcia, kontrolowane zejście.'},
       {n: 'Pistol z obciążeniem', goal: '3 × 5 / noga', m: {ex: 'pistol', v: 3}, how: 'Hantla lub kettlebell przy klatce.'}
     ]},
    {id: 'lsit', name: 'L-sit → V-sit', color: '#64D2FF', m: {fig: 'sk_vsit'},
     desc: 'Podpór z nogami w powietrzu. Brzuch, zginacze bioder i mocne triceps/barki.',
     steps: [
       {n: 'Podpór', goal: '3 × 30 s', m: {fig: 'sk_support'}, how: 'Na poręczach lub uchwytach: ręce proste, barki wciśnięte w dół.'},
       {n: 'Hollow body', goal: '3 × 30 s', m: {ex: 'hollow', v: 1}, how: 'Lędźwie dociśnięte do podłogi, ręce i nogi nisko.'},
       {n: 'Tuck L-sit', goal: '3 × 20 s', m: {ex: 'lsit', v: 0}, how: 'Kolana przy klatce, biodra w powietrzu.'},
       {n: 'L-sit na jednej nodze', goal: '3 × 15 s', m: {ex: 'lsit', v: 1}, how: 'Jedna noga prosta – zmieniaj co serię.'},
       {n: 'L-sit', goal: '3 × 20 s', m: {ex: 'lsit', v: 2}, how: 'Obie nogi proste w poziomie, palce wyciągnięte.'},
       {n: 'V-sit', goal: '3 × 5 s', m: {fig: 'sk_vsit'}, how: 'Pochyl barki do tyłu i unieś proste nogi wysoko ponad poziom.'}
     ]},
    {id: 'oap', name: 'Pompka na jednej ręce', color: '#FFD60A', m: {photo: 'pushone'},
     desc: 'Pompka na jednej ręce z ciałem w linii. Siła klatki, tricepsa i stabilizacja tułowia.',
     steps: [
       {n: 'Pompki klasyczne', goal: '3 × 20', m: {ex: 'push', v: 0}, how: 'Pełny zakres, ciało w linii.'},
       {n: 'Pompki diamentowe', goal: '3 × 15', m: {ex: 'push', v: 1}, how: 'Dłonie razem pod klatką.'},
       {n: 'Pompki archer', goal: '3 × 8 / stronę', m: {ex: 'push', v: 2}, how: 'Szeroko, ciężar na jedną rękę, druga prosta.'},
       {n: 'Na jednej ręce z podwyższenia', goal: '3 × 5 / rękę', m: {photo: 'pushone'}, how: 'Dłoń na ławce lub stole – im niżej, tym trudniej. Stopy szeroko.'},
       {n: 'Pompka na jednej ręce', goal: '3 × 3 / rękę', m: {photo: 'pushone'}, how: 'Stopy szeroko, biodra nie skręcają się, łokieć blisko ciała.'}
     ]}
  ];

  function done(sk) { return Math.max(0, Math.min(sk.steps.length, (S.skills && S.skills[sk.id]) || 0)); }
  function skillById(id) { return SKILLS.find(function (s) { return s.id === id; }); }

  function listView() {
    var h = '<div class="page"><div class="large-title">Skille</div>' +
      '<div class="subtitle">Ucz się umiejętności krok po kroku – odhaczaj kolejne progresje.</div>';
    SKILLS.forEach(function (sk) {
      var d = done(sk), n = sk.steps.length, cur = sk.steps[Math.min(d, n - 1)], pct = Math.round(d / n * 100);
      h += '<button class="skill-card" style="--c:' + sk.color + '" data-act="skOpen" data-id="' + sk.id + '">' +
        '<div class="skill-media">' + exMedia(sk.m) + '</div>' +
        '<div class="skill-body">' +
          '<div class="skill-name">' + esc(sk.name) + (d >= n ? ' <span class="pr-badge">🏆</span>' : '') + '</div>' +
          '<div class="skill-next">' + (d >= n ? 'Opanowane!' : 'Teraz: ' + esc(cur.n) + ' · ' + esc(cur.goal)) + '</div>' +
          '<div class="skill-bar"><div style="width:' + pct + '%"></div></div>' +
          '<div class="skill-count">' + d + ' / ' + n + '</div>' +
        '</div></button>';
    });
    return h + '</div>';
  }

  function treeView(sk) {
    var d = done(sk), n = sk.steps.length;
    var h = '<div class="page" style="--c:' + sk.color + '">' +
      '<button class="btn btn-secondary btn-small" data-act="skBack">‹ Skille</button>' +
      '<div class="large-title" style="color:var(--c)">' + esc(sk.name) + '</div>' +
      '<div class="subtitle">' + esc(sk.desc) + '</div>' +
      '<div class="card skill-hero">' + exMedia(sk.m, 'ex-fig-lg') + '</div>' +
      '<div class="tree">';
    sk.steps.forEach(function (st, i) {
      var state = i < d ? 'done' : i === d ? 'cur' : 'lock';
      h += '<div class="node ' + state + '" data-act="skStep" data-id="' + sk.id + '" data-i="' + i + '">' +
        '<div class="node-dot">' + (state === 'done' ? '✓' : state === 'lock' ? '🔒' : (i + 1)) + '</div>' +
        '<div class="node-card">' +
          '<div class="node-name">' + esc(st.n) + '</div>' +
          '<div class="node-goal">Cel: ' + esc(st.goal) + '</div>' +
          (state === 'cur' ? '<div class="node-how">' + esc(st.how) + '</div>' +
            '<button class="btn btn-primary btn-small" style="margin-top:8px" data-act="skDone" data-id="' + sk.id + '" data-i="' + i + '">Zaliczone ✓</button>' : '') +
        '</div></div>';
    });
    if (d >= n) h += '<div class="card" style="text-align:center;margin-top:8px">🏆 Masz ten skill! Utrzymuj go, robiąc ostatni krok 1–2× w tygodniu.</div>';
    return h + '</div></div>';
  }

  VIEWS.skills = function () {
    var sk = ui.skill && skillById(ui.skill);
    return sk ? treeView(sk) : listView();
  };

  function top() { try { window.scrollTo(0, 0); } catch (e) {} }
  ACTIONS.skOpen = function (el) { ui.skill = el.dataset.id; render(); top(); };
  ACTIONS.skBack = function () { ui.skill = null; render(); top(); };
  ACTIONS.skDone = function (el, ev) {
    if (ev) ev.stopPropagation();
    var sk = skillById(el.dataset.id), i = +el.dataset.i;
    S.skills[sk.id] = i + 1;
    save(); closeSheet(); render();
    toast(i + 1 >= sk.steps.length ? '🏆 Skill opanowany!' : 'Odblokowano: ' + sk.steps[i + 1].n);
  };
  ACTIONS.skSet = function (el) {
    var sk = skillById(el.dataset.id);
    S.skills[sk.id] = +el.dataset.i;
    save(); closeSheet(); render();
  };
  ACTIONS.skStep = function (el, ev) {
    if (ev && ev.target && ev.target.closest && ev.target.closest('[data-act="skDone"]')) return;
    var sk = skillById(el.dataset.id), i = +el.dataset.i, st = sk.steps[i], d = done(sk);
    var h = '<div style="--c:' + sk.color + '">' +
      '<div class="ex-group">' + esc(sk.name) + ' · krok ' + (i + 1) + '/' + sk.steps.length + '</div>' +
      '<div class="ex-name" style="font-size:20px;line-height:25px">' + esc(st.n) + '</div>' +
      exMedia(st.m, 'ex-fig-lg') +
      '<div class="howto"><div class="howto-v"><b>Cel: ' + esc(st.goal) + '</b></div><div class="howto-v" style="margin-top:4px">' + esc(st.how) + '</div></div>';
    if (i >= d) h += '<button class="btn btn-primary btn-block" style="margin-top:12px" data-act="skDone" data-id="' + sk.id + '" data-i="' + i + '">' + (i === d ? 'Zaliczone ✓' : 'Umiem już to – zalicz do tego kroku') + '</button>';
    else h += '<button class="btn btn-secondary btn-block" style="margin-top:12px" data-act="skSet" data-id="' + sk.id + '" data-i="' + i + '">Wróć do tego kroku</button>';
    h += '<button class="btn btn-secondary btn-block" style="margin-top:8px" data-act="closeSheet">Zamknij</button></div>';
    sheet(h);
  };
})();

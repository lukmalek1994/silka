/* Siłka – figures.js
 * Animowane ilustracje ćwiczeń (SVG + SMIL, działa offline) i wskazówki techniki.
 * Figurka z boku (twarzą w prawo). Pozy opisane punktami końcowymi
 * (biodro, kąt tułowia, dłoń, kostka) – łokcie i kolana liczy prosta kinematyka odwrotna,
 * więc długości kończyn zostają stałe w całej animacji.
 * Globalnie: figSVG(id, v, opts), figHow(id, v)
 */
'use strict';
(function () {
  var L = {t: 34, u: 20, f: 19, th: 25, sh: 24, ft: 8, hd: 12};
  var RAD = Math.PI / 180;
  function dir(a) { return [Math.cos(a * RAD), Math.sin(a * RAD)]; }
  function add(p, v, k) { k = k == null ? 1 : k; return [p[0] + v[0] * k, p[1] + v[1] * k]; }

  // 2-członowa kinematyka odwrotna: zwraca [staw, koniec]
  function ik(a, b, l1, l2, bend) {
    var dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy);
    var base = Math.atan2(dy, dx);
    var dc = Math.min(Math.max(d, Math.abs(l1 - l2) + 0.5), l1 + l2 - 0.01);
    var ca = (l1 * l1 + dc * dc - l2 * l2) / (2 * l1 * dc);
    var al = Math.acos(Math.max(-1, Math.min(1, ca)));
    var j = [a[0] + l1 * Math.cos(base + bend * al), a[1] + l1 * Math.sin(base + bend * al)];
    var e = [a[0] + dc * Math.cos(base), a[1] + dc * Math.sin(base)];
    return [j, e];
  }

  // punkt: [x,y] albo ['sh'|'hip'|'mid', dx, dy] względem stawu
  function rp(p, J) { return typeof p[0] === 'string' ? [J[p[0]][0] + p[1], J[p[0]][1] + p[2]] : p; }

  function norm(raw) {
    var P = {};
    for (var k in raw) P[k] = raw[k];
    if (P.ft == null) P.ft = 0;
    if (P.kb == null) P.kb = -1;
    if (P.eb == null) P.eb = 1;
    if (P.ha2 == null) P.ha2 = P.ha;
    if (P.an2 == null) P.an2 = P.an;
    if (P.ft2 == null) P.ft2 = P.ft;
    if (P.kb2 == null) P.kb2 = P.kb;
    if (P.eb2 == null) P.eb2 = P.eb;
    if (P.kn && !P.kn2) P.kn2 = P.kn;
    if (P.kn && P.shin2 == null) P.shin2 = P.shin;
    return P;
  }

  function lerpV(a, b, t) {
    if (typeof a === 'number') return typeof b === 'number' ? a + (b - a) * t : a;
    if (Array.isArray(a)) {
      if (!Array.isArray(b)) return a;
      return a.map(function (x, i) { return typeof x === 'number' ? x + (b[i] - x) * t : x; });
    }
    return a;
  }
  function lerpPose(A, B, t) {
    var P = {};
    for (var k in A) P[k] = (k === 'kb' || k === 'eb' || k === 'kb2' || k === 'eb2') ? A[k] : lerpV(A[k], B[k], t);
    return P;
  }

  function solve(P) {
    var J = {};
    J.hip = P.hip;
    J.sh = add(P.hip, dir(P.tor), L.t);
    J.mid = [(J.hip[0] + J.sh[0]) / 2, (J.hip[1] + J.sh[1]) / 2];
    J.hd = add(J.sh, dir(P.hd != null ? P.hd : P.tor), L.hd);
    function leg(an, kn, shin, ft, kb) {
      var k, a;
      if (kn) {
        var dx = kn[0] - J.hip[0], dy = kn[1] - J.hip[1], d = Math.hypot(dx, dy) || 1;
        k = [J.hip[0] + dx / d * L.th, J.hip[1] + dy / d * L.th];
        a = add(k, dir(shin || 180), L.sh);
      } else {
        var r = ik(J.hip, an, L.th, L.sh, kb); k = r[0]; a = r[1];
      }
      return [k, a, add(a, dir(ft), L.ft)];
    }
    var l1 = leg(P.an, P.kn, P.shin, P.ft, P.kb), l2 = leg(P.an2, P.kn2, P.shin2, P.ft2, P.kb2);
    J.kn = l1[0]; J.an = l1[1]; J.to = l1[2];
    J.kn2 = l2[0]; J.an2 = l2[1]; J.to2 = l2[2];
    var a1 = ik(J.sh, rp(P.ha, J), L.u, L.f, P.eb), a2 = ik(J.sh, rp(P.ha2, J), L.u, L.f, P.eb2);
    J.el = a1[0]; J.ha = a1[1]; J.el2 = a2[0]; J.ha2 = a2[1];
    return J;
  }

  function f1(n) { return (Math.round(n * 10) / 10).toString(); }
  function pt(p) { return f1(p[0]) + ' ' + f1(p[1]); }
  function pth(ps) { return 'M' + ps.map(pt).join('L'); }

  /* ---------- sprzęt (statyczny) ---------- */
  var E = {
    bar: function (x, y) { return '<line class="eqt" x1="' + x + '" y1="' + y + '" x2="' + (x + 30) + '" y2="' + (y - 16) + '"/><circle class="eqf" cx="' + x + '" cy="' + y + '" r="4"/>'; },
    post: function (x, y) { return '<line class="eq" x1="' + x + '" y1="' + y + '" x2="' + x + '" y2="111"/><circle class="eqf" cx="' + x + '" cy="' + y + '" r="4"/>'; },
    bench: function (x, y, w) {
      return '<line class="eqt" x1="' + (x + 5) + '" y1="' + y + '" x2="' + (x + 5) + '" y2="111"/><line class="eqt" x1="' + (x + w - 5) + '" y1="' + y + '" x2="' + (x + w - 5) + '" y2="111"/>' +
        '<rect class="eqf" x="' + x + '" y="' + (y + 1) + '" width="' + w + '" height="6" rx="2"/>';
    },
    line: function (x1, y1, x2, y2, c) { return '<line class="' + (c || 'eq') + '" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '"/>'; },
    rect: function (x, y, w, h) { return '<rect class="eqo" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="3"/>'; },
    circ: function (x, y, r) { return '<circle class="eqf" cx="' + x + '" cy="' + y + '" r="' + r + '"/>'; }
  };

  /* ---------- ruchome rekwizyty ---------- */
  var PROP = {
    db: '<rect class="pr" x="-6.5" y="-6.5" width="13" height="13" rx="4"/>',
    bb: '<circle class="pr2" r="11"/><circle class="pr" r="3"/>',
    plate: '<circle class="pr2" r="8"/><circle class="pr" r="2.5"/>',
    wheel: '<circle class="whl" r="7.5"/><circle class="pr" r="2.5"/>',
    pad: '<circle class="pr" r="5"/>',
    handle: '<circle class="pr" r="3"/>'
  };

  /* ---------- definicje póz ---------- */
  var STAND = {hip: [80, 58], tor: -90, an: [80, 107]};
  function S(o) { var r = {}; for (var k in STAND) r[k] = STAND[k]; for (var j in o) r[j] = o[j]; return r; }

  var HANG_PULL = {
    vb: [0, 0, 160, 130], floor: false, eq: E.bar(84, 16),
    f: [{hip: [78, 88], tor: -92, ha: [84, 16], an: [64, 106], ft: 100},
        {hip: [74, 58], tor: -96, an: [60, 76]}]
  };
  var AUS_ROW = {
    eq: E.line(100, 60, 100, 111, 'eqt') + E.circ(100, 60, 4),
    f: [{hip: [58, 102], tor: -7, ha: [100, 60], an: [10, 106], ft: -80, eb: -1},
        {hip: [56, 84], tor: -26}]
  };
  function pullSet() {
    return [
      AUS_ROW,
      ext(HANG_PULL, {tempo: 'neg'}),
      ext(HANG_PULL, {dyn: [{t: 'band', from: [84, 16], at: 'kn'}]}),
      HANG_PULL,
      ext(HANG_PULL, {dyn: [{t: 'plate', at: 'hip', d: [3, 13]}]})
    ];
  }
  function ext(base, o) { var r = {}; for (var k in base) r[k] = base[k]; for (var j in o) r[j] = o[j]; return r; }

  var DIP_BARS = {
    floor: true, eq: E.post(82, 60),
    f: [{hip: [76, 56], tor: -86, ha: [82, 60], an: [62, 86], ft: 110},
        {hip: [70, 80], tor: -72, an: [56, 100]}]
  };
  var PUSH = {
    f: [{hip: [63, 83.5], tor: -24, ha: [92, 108], an: [20, 103], ft: 70},
        {hip: [68, 92.6], tor: -12.4}]
  };
  var PISTOL = {
    f: [S({tor: -86, an2: [98, 100], ft2: -10, ha: ['sh', 36, 6]}),
        {hip: [64, 94], tor: -55, an2: [112, 96], ha: ['sh', 36, 2]}]
  };

  var FIGS = {
    pull: pullSet(),
    chin: pullSet(),
    dip: [
      {eq: E.bench(30, 70, 36),
       f: [{hip: [68, 66], tor: -92, ha: [62, 70], an: [100, 107], ft: -70},
           {hip: [70, 90]}]},
      ext(DIP_BARS, {w: [3, 1]}),
      DIP_BARS,
      ext(DIP_BARS, {dyn: [{t: 'plate', at: 'hip', d: [2, 13]}]})
    ],
    incdb: {
      eq: E.line(54, 86, 54, 111, 'eqt') + E.line(74, 86, 74, 111, 'eqt') + E.line(46, 85, 78, 85) + E.line(48, 85, 22, 50),
      f: [{hip: [62, 79], tor: -132, ha: ['sh', 4, -38], an: [92, 107]},
          {ha: ['sh', 16, 2]}],
      dyn: [{t: 'db', at: 'ha'}]
    },
    row: {
      eq: E.bench(28, 88, 42) + E.line(104, 84, 108, 111) + E.rect(132, 20, 14, 91) + E.circ(130, 66, 3.5),
      f: [{hip: [50, 84], tor: -72, ha: [96, 66], an: [98, 97], ft: -70},
          {tor: -98, ha: [66, 70]}],
      dyn: [{t: 'cable', from: [130, 66], at: 'ha'}, {t: 'handle', at: 'ha'}]
    },
    pike: [
      {f: [{hip: [58, 56], tor: 30, ha: [100, 108], an: [46, 107], ft: 20, eb: -1},
           {hip: [60, 58], tor: 58}]},
      {eq: E.bench(14, 78, 32),
       f: [{hip: [58, 42], tor: 64, ha: [92, 108], an: [30, 75], ft: 20, eb: -1},
           {hip: [61, 48], tor: 74}]},
      {vb: [0, -22, 160, 135], eq: E.line(116, -22, 116, 111),
       w: [3, 1],
       f: [{hip: [98, 32], tor: 90, ha: [98, 108], an: [108, -15], ft: -80, eb: -1},
           {hip: [97, 52], tor: 92, an: [108, 4]}]},
      {vb: [0, -22, 160, 135], eq: E.line(116, -22, 116, 111),
       f: [{hip: [98, 32], tor: 90, ha: [98, 108], an: [108, -15], ft: -80, eb: -1},
           {hip: [97, 52], tor: 92, an: [108, 4]}]}
    ],
    hang: [
      {vb: [0, 0, 160, 140], floor: false, eq: E.bar(84, 16),
       f: [{hip: [77, 88], tor: -92, ha: [84, 16], an: [74, 136], ft: 80},
           {hip: [80, 84], tor: -98, an: [96, 104], ft: 60}]},
      {vb: [0, 0, 160, 140], floor: false, eq: E.bar(84, 16),
       f: [{hip: [77, 88], tor: -92, ha: [84, 16], an: [74, 136], ft: 80},
           {hip: [80, 86], tor: -100, an: [128, 82], ft: -10}]},
      {vb: [0, 0, 160, 140], floor: false, eq: E.bar(84, 16),
       f: [{hip: [77, 88], tor: -92, ha: [84, 16], an: [74, 136], ft: 80},
           {hip: [68, 78], tor: -70, an: [88, 22], ft: -100}]}
    ],
    squat: {
      f: [S({tor: -88, an: [82, 107], ha: ['sh', -4, -3], eb: -1}),
          {hip: [62, 84], tor: -58}],
      dyn: [{t: 'bb', at: 'sh', d: [-3, -4]}]
    },
    rdl: {
      f: [S({tor: -88, ha: ['sh', 2, 38]}),
          {hip: [64, 62], tor: -18, ha: ['sh', 0, 38]}],
      dyn: [{t: 'bb', at: 'ha', d: [0, 2]}]
    },
    bulg: {
      eq: E.bench(18, 76, 30),
      f: [{hip: [76, 60], tor: -88, an: [96, 107], an2: [42, 72], ft2: 170, ha: ['sh', 0, 38]},
          {hip: [72, 82], tor: -80}],
      dyn: [{t: 'db', at: 'ha'}]
    },
    pistol: [
      {eq: E.bench(40, 84, 28),
       f: [S({tor: -86, an2: [98, 100], ft2: -10, ha: ['sh', 36, 6]}),
           {hip: [62, 80], tor: -60, an2: [108, 86], ha: ['sh', 36, 4]}]},
      {eq: E.line(124, 30, 124, 111),
       f: [S({tor: -86, an2: [98, 100], ft2: -10, ha: [118, 48]}),
           {hip: [64, 92], tor: -55, an2: [110, 98], ha: [120, 66]}]},
      PISTOL,
      ext(PISTOL, {
        f: [S({tor: -86, an2: [98, 100], ft2: -10, ha: ['sh', 14, 8]}),
            {hip: [64, 94], tor: -55, an2: [112, 96]}],
        dyn: [{t: 'db', at: 'ha'}]
      })
    ],
    calf: {
      f: [S({ha: ['sh', 0, 38]}),
          {hip: [80, 51], an: [80, 100], ft: 62}],
      dyn: [{t: 'db', at: 'ha'}]
    },
    hollow: [
      {tempo: 'hold',
       f: [{hip: [80, 104], tor: 180, ha: ['sh', -36, 0], an: [106, 104], ft: -60},
           {tor: 196, hd: 205, ha: ['sh', -36, -10], an: [104, 86], ft: -20}]},
      {tempo: 'hold',
       f: [{hip: [80, 104], tor: 180, ha: ['sh', -36, 0], an: [129, 104], ft: -90},
           {tor: 196, hd: 205, ha: ['sh', -36, -10], an: [126, 88], ft: -40}]}
    ],
    push: [
      PUSH, PUSH, PUSH,
      {f: [{hip: [58, 84], tor: -22, ha: [74, 108], an: [20, 103], ft: 70},
           {hip: [62, 95], tor: -10}]},
      ext(PUSH, {dyn: [{t: 'plate', at: 'mid', d: [0, -8]}]})
    ],
    ohp: {
      eq: E.line(56, 86, 56, 111, 'eqt') + E.line(76, 86, 76, 111, 'eqt') + E.line(48, 85, 80, 85) + E.line(51, 85, 51, 38),
      f: [{hip: [62, 80], tor: -90, ha: ['sh', 2, -38], an: [92, 107]},
          {ha: ['sh', 6, -2]}],
      dyn: [{t: 'db', at: 'ha'}]
    },
    lat: {
      vb: [0, -8, 160, 128],
      eq: E.line(36, -4, 120, -4, 'eqt') + E.line(120, -4, 120, 111) + E.circ(78, -4, 3.5) + E.bench(44, 86, 38) + E.circ(90, 66, 5),
      f: [{hip: [66, 82], tor: -98, ha: ['sh', 14, -42], an: [96, 107]},
          {ha: ['sh', 8, -2]}],
      dyn: [{t: 'cable', from: [78, -4], at: 'ha'}, {t: 'handle', at: 'ha'}]
    },
    face: {
      eq: E.rect(144, 8, 12, 103) + E.circ(144, 22, 3.5),
      f: [S({ha: ['sh', 38, 0]}),
          {ha: ['sh', 8, -14]}],
      dyn: [{t: 'cable', from: [144, 22], at: 'ha'}, {t: 'handle', at: 'ha'}]
    },
    lsit: [
      {tempo: 'hold', eq: E.line(64, 100, 92, 100) + E.line(68, 100, 66, 111, 'eqt') + E.line(88, 100, 90, 111, 'eqt'),
       f: [{hip: [80, 92], tor: -92, ha: [78, 98], an: [104, 107]},
           {an: [100, 90]}]},
      {tempo: 'hold', eq: E.line(64, 100, 92, 100) + E.line(68, 100, 66, 111, 'eqt') + E.line(88, 100, 90, 111, 'eqt'),
       f: [{hip: [80, 92], tor: -92, ha: [78, 98], an: [118, 107], an2: [104, 107]},
           {an: [128, 92], an2: [100, 90]}]},
      {tempo: 'hold', eq: E.line(64, 100, 92, 100) + E.line(68, 100, 66, 111, 'eqt') + E.line(88, 100, 90, 111, 'eqt'),
       f: [{hip: [80, 92], tor: -92, ha: [78, 98], an: [120, 107]},
           {an: [129, 92]}]}
    ],
    hipt: {
      eq: E.bench(12, 80, 34),
      f: [{hip: [70, 100], tor: -150, hd: -165, ha: ['hip', -2, -8], an: [100, 107]},
          {hip: [74, 78], tor: 177}],
      dyn: [{t: 'bb', at: 'hip', d: [0, -10]}]
    },
    press: {
      eq: E.line(66, 100, 136, 30, 'eqt') + E.line(44, 98, 68, 98) + E.line(46, 96, 16, 72) + E.line(56, 98, 56, 111, 'eqt'),
      f: [{hip: [52, 92], tor: -146, ha: ['hip', 2, 4], an: [92, 58], ft: -120},
          {an: [72, 76]}],
      dyn: [{t: 'sled', at: 'an', d: [4, -4], rot: 46.6}]
    },
    lunge: {
      f: [{hip: [76, 60], tor: -90, an: [100, 107], an2: [48, 103], ft2: 50, ha: ['sh', 0, 38]},
          {hip: [74, 82]}],
      dyn: [{t: 'db', at: 'ha'}]
    },
    legcurl: {
      eq: E.bench(16, 84, 90) + E.line(26, 92, 26, 111, 'eqt'),
      f: [{hip: [72, 79], tor: 182, ha: [26, 92], an: [121, 80], ft: 90, kb: 1},
          {an: [98, 50], ft: 30}],
      dyn: [{t: 'pad', at: 'an', d: [0, -6]}]
    },
    wheel: [
      {vb: [0, 0, 180, 120],
       f: [{hip: [72, 82], tor: -30, kn: [62, 105], shin: 180, ft: 150, ha: [104, 103], eb: -1},
           {hip: [80, 90], tor: -14, ha: [140, 103]}],
       dyn: [{t: 'wheel', at: 'ha'}]},
      {vb: [0, 0, 180, 120],
       f: [{hip: [72, 82], tor: -30, kn: [62, 105], shin: 180, ft: 150, ha: [104, 103], eb: -1},
           {hip: [84, 96], tor: -6, ha: [154, 103]}],
       dyn: [{t: 'wheel', at: 'ha'}]},
      {vb: [0, 0, 180, 120], w: [3, 1],
       f: [{hip: [70, 48], tor: 40, ha: [104, 103], an: [52, 107], eb: -1},
           {hip: [96, 90], tor: -6, ha: [166, 103], ft: 30}],
       dyn: [{t: 'wheel', at: 'ha'}]}
    ],

    // ---------- pozy do drzewek umiejętności ----------
    sk_hang: {vb: [0, 0, 160, 140], floor: false, eq: E.bar(84, 16), tempo: 'hold',
      f: [{hip: [80, 90], tor: -90, ha: [84, 16], an: [80, 136], ft: 80}, {hip: [79, 86], tor: -93, an: [79, 133]}]},
    sk_fl0: {vb: [0, 0, 160, 140], floor: false, eq: E.bar(110, 16), tempo: 'hold',
      f: [{hip: [104, 88], tor: -92, ha: [110, 16], an: [100, 132], ft: 80}, {hip: [76, 76], tor: -42, an: [94, 70], ft: 0}]},
    sk_fl1: {vb: [0, 0, 160, 140], floor: false, eq: E.bar(110, 16), tempo: 'hold',
      f: [{hip: [104, 88], tor: -92, ha: [110, 16], an: [100, 132], ft: 80}, {hip: [69, 62], tor: -14, an: [80, 84], ft: 60}]},
    sk_fl2: {vb: [0, 0, 160, 140], floor: false, eq: E.bar(110, 16), tempo: 'hold',
      f: [{hip: [104, 88], tor: -92, ha: [110, 16], an: [100, 132], an2: [98, 128], ft: 80}, {hip: [68, 56], tor: -3, an: [19, 58], an2: [80, 76], ft: 180, ft2: 60}]},
    sk_fl3: {vb: [0, 0, 160, 140], floor: false, eq: E.bar(110, 16), tempo: 'hold',
      f: [{hip: [104, 88], tor: -92, ha: [110, 16], an: [100, 132], ft: 80}, {hip: [68, 55], tor: -1, an: [19, 56], ft: 180}]},
    sk_lean: {tempo: 'hold',
      f: [{hip: [63, 83.5], tor: -24, ha: [80, 108], an: [20, 103], ft: 70}, {hip: [56, 84], tor: -20}]},
    sk_frog: {tempo: 'hold',
      f: [{hip: [70, 80], tor: 10, ha: [92, 108], an: [70, 107], ft: 0, eb: -1}, {hip: [72, 66], tor: 22, an: [74, 92], ft: 30}]},
    sk_pl1: {tempo: 'hold',
      f: [{hip: [62, 90], tor: -26, ha: [88, 108], an: [44, 107], ft: 40}, {hip: [64, 76], tor: -8, an: [82, 84], ft: 20, kb: 1}]},
    sk_pl2: {tempo: 'hold',
      f: [{hip: [62, 90], tor: -26, ha: [88, 108], an: [44, 107], ft: 40}, {hip: [63, 72], tor: -1, an: [56, 94], ft: 160}]},
    sk_pl3: {tempo: 'hold',
      f: [{hip: [62, 90], tor: -26, ha: [88, 108], an: [44, 107], ft: 40}, {hip: [62, 72], tor: 0, an: [14, 74], ft: 180}]},
    sk_hsw: {vb: [0, -22, 160, 135], eq: E.line(116, -22, 116, 111), tempo: 'hold',
      f: [{hip: [80, 60], tor: 50, ha: [98, 108], an: [116, 64], ft: -90, eb: -1}, {hip: [98, 32], tor: 90, an: [108, -15], ft: -80}]},
    sk_hsc: {vb: [0, -22, 160, 135], eq: E.line(84, -22, 84, 111), tempo: 'hold',
      f: [{hip: [96, 60], tor: 120, ha: [94, 108], an: [86, 70], ft: -60, eb: -1}, {hip: [92, 32], tor: 92, an: [88, -16], ft: -100}]},
    sk_hs: {vb: [0, -22, 160, 135], tempo: 'hold',
      f: [{hip: [78, 56], tor: 40, ha: [100, 108], an: [64, 104], ft: 20, eb: -1}, {hip: [100, 32], tor: 90, an: [100, -16], ft: -80}]},
    sk_mu: {vb: [0, -14, 160, 160], floor: false, eq: E.bar(84, 50), seq: [0, 1, 2, 3, 3, 2, 1, 0], dur: 4.5,
      f: [{hip: [79, 122], tor: -92, ha: [84, 50], an: [66, 140], ft: 100},
          {hip: [70, 92], tor: -100},
          {hip: [80, 72], tor: -78},
          {hip: [83, 46], tor: -92}]},
    sk_vsit: {tempo: 'hold', eq: E.line(64, 100, 92, 100) + E.line(68, 100, 66, 111, 'eqt') + E.line(88, 100, 90, 111, 'eqt'),
      f: [{hip: [80, 92], tor: -92, ha: [78, 98], an: [120, 107]}, {tor: -112, an: [116, 52], ft: -40}]},
    sk_deep: {tempo: 'hold',
      f: [S({tor: -88, an: [82, 107], ha: ['sh', 36, 6]}), {hip: [70, 98], tor: -62, ha: ['sh', 34, 8]}]},
    sk_support: {tempo: 'hold', eq: E.line(64, 100, 92, 100) + E.line(68, 100, 66, 111, 'eqt') + E.line(88, 100, 90, 111, 'eqt'),
      f: [{hip: [80, 98], tor: -92, ha: [78, 98], an: [96, 107]}, {hip: [80, 92], an: [72, 104], ft: 100}]},
    _warm: {
      ease: false, seq: [0, 1, 2, 3, 0], dur: 3.2,
      f: [S({ha: ['sh', 2, 38], ha2: ['sh', -2, 38]}),
          {ha: ['sh', 38, 2], ha2: ['sh', -38, 2]},
          {ha: ['sh', 2, -38], ha2: ['sh', -2, -38]},
          {ha: ['sh', -38, 2], ha2: ['sh', 38, 2]}]
    },
    _run: {
      dur: 0.9,
      f: [{hip: [80, 60], tor: -82, an: [98, 102], an2: [60, 96], ft2: 40, ha: ['sh', -12, 26], ha2: ['sh', 18, 22], eb: -1, eb2: -1},
          {hip: [80, 57], an: [60, 96], an2: [98, 102], ft: 40, ft2: 0, ha: ['sh', 18, 22], ha2: ['sh', -12, 26]}]
    }
  };

  /* ---------- render ---------- */
  function pickSpec(id, v) {
    var s = FIGS[id];
    if (!s) return null;
    if (Array.isArray(s)) s = s[Math.min(v || 0, s.length - 1)];
    return s;
  }

  function frames(spec) {
    var raw0 = spec.f[0];
    return spec.f.map(function (f, i) {
      if (!i) return norm(raw0);
      var m = {}; for (var k in raw0) m[k] = raw0[k];
      // pochodne domyślne (ha2, an2, ft2) liczone od nowa, chyba że podane wprost
      ['ha2', 'an2', 'ft2'].forEach(function (k) { if (!(k in raw0)) delete m[k]; });
      for (var j in f) m[j] = f[j];
      return norm(m);
    });
  }

  var reduceMotion = false;
  try { reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  function figSVG(id, v, opts) {
    opts = opts || {};
    var spec = pickSpec(id, v);
    if (!spec) return '';
    var F = frames(spec);
    var vb = spec.vb || [0, 0, 160, 120];
    var stat = opts.static || reduceMotion;

    // sekwencja i wagi odcinków
    var seq = spec.seq || (F.length === 2 ? (spec.tempo === 'hold' ? [0, 1, 1, 0] : [0, 1, 0]) : F.map(function (_, i) { return i; }).concat([0]));
    var w = spec.w || (spec.tempo === 'neg' ? [1, 3] : spec.tempo === 'hold' ? [1, 2.5, 1] : null);
    var dur = spec.dur || (spec.tempo === 'neg' || spec.w ? 4 : spec.tempo === 'hold' ? 4.5 : 2.4);
    var ease = spec.ease !== false;

    var poses = [], times = [];
    if (stat) {
      poses.push(solve(F[opts.frame != null ? opts.frame : Math.min(1, F.length - 1)]));
    } else {
      var N = 8, total = 0, segW = [];
      for (var s = 0; s < seq.length - 1; s++) { segW.push(w ? (w[s] || 1) : 1); total += segW[s]; }
      var acc = 0;
      for (s = 0; s < seq.length - 1; s++) {
        var A = F[seq[s]], B = F[seq[s + 1]];
        for (var j = 0; j < N; j++) {
          var t = j / N, te = ease ? t * t * (3 - 2 * t) : t;
          poses.push(solve(lerpPose(A, B, te)));
          times.push((acc + segW[s] * t) / total);
        }
        acc += segW[s];
      }
      poses.push(solve(F[seq[seq.length - 1]]));
      times.push(1);
    }

    var kt = times.map(function (x) { return x.toFixed(4); }).join(';');
    function anim(attr, vals, type) {
      if (stat) return '';
      if (type) return '<animateTransform attributeName="transform" type="translate" dur="' + dur + 's" repeatCount="indefinite" keyTimes="' + kt + '" values="' + vals.join(';') + '"/>';
      return '<animate attributeName="' + attr + '" dur="' + dur + 's" repeatCount="indefinite" keyTimes="' + kt + '" values="' + vals.join(';') + '"/>';
    }
    function path(cls, fn) {
      var vals = poses.map(fn);
      return '<path class="' + cls + '" d="' + vals[0] + '">' + anim('d', vals) + '</path>';
    }

    var h = '<svg class="fig" viewBox="' + vb.join(' ') + '" preserveAspectRatio="xMidYMid meet" aria-hidden="true">';
    if (spec.floor !== false) h += '<line class="fl" x1="' + (vb[0] - 10) + '" y1="111" x2="' + (vb[0] + vb[2] + 10) + '" y2="111"/>';
    if (spec.eq) h += spec.eq;
    // linki (kabel, guma) – za figurką
    (spec.dyn || []).forEach(function (d) {
      if (d.t !== 'cable' && d.t !== 'band') return;
      h += path(d.t === 'cable' ? 'cb' : 'bd', function (J) { var p = rp(d.at.length ? [d.at, 0, 0] : d.at, J); return pth([d.from, p]); });
    });
    h += path('lb lb2', function (J) { return pth([J.hip, J.kn2, J.an2, J.to2]); });
    h += path('lb lb2', function (J) { return pth([J.sh, J.el2, J.ha2]); });
    h += path('lb tr', function (J) { return pth([J.hip, J.sh]); });
    h += path('lb', function (J) { return pth([J.hip, J.kn, J.an, J.to]); });
    var hd = poses.map(function (J) { return J.hd; });
    h += '<circle class="hd" r="7" cx="' + f1(hd[0][0]) + '" cy="' + f1(hd[0][1]) + '">' +
      anim('cx', hd.map(function (p) { return f1(p[0]); })) + anim('cy', hd.map(function (p) { return f1(p[1]); })) + '</circle>';
    h += path('lb', function (J) { return pth([J.sh, J.el, J.ha]); });
    // rekwizyty przy stawach
    (spec.dyn || []).forEach(function (d) {
      if (d.t === 'cable' || d.t === 'band') return;
      var off = d.d || [0, 0];
      var vals = poses.map(function (J) { var p = J[d.at]; return f1(p[0] + off[0]) + ',' + f1(p[1] + off[1]); });
      var shape = d.t === 'sled'
        ? '<line class="sl" x1="-16" y1="0" x2="16" y2="0" transform="rotate(' + (d.rot || 0) + ')"/>'
        : PROP[d.t];
      h += '<g transform="translate(' + vals[0] + ')">' + anim('transform', vals, true) + shape + '</g>';
    });
    return h + '</svg>';
  }

  /* ---------- wskazówki ---------- */
  var PULL_V = [
    'Drążek mniej więcej na wysokości bioder, ciało proste jak deska, pięty na ziemi – przyciągnij klatkę do drążka.',
    'Wejdź na podwyższenie do pozycji z brodą nad drążkiem i opuszczaj się powoli przez 5 sekund.',
    'Zaczep gumę o drążek i włóż w nią kolano lub stopę – pomaga w najtrudniejszym, dolnym fragmencie.',
    'Pełne powtórzenia z martwego zwisu – bez bujania i wymachów nóg.',
    'Obciążenie na pasie lub w kamizelce; technika jak w zwykłym podciąganiu.'
  ];
  var HOW = {

    bwsquat: {t: ['Stopy na szerokość barków, palce lekko na zewnątrz, ręce przed sobą lub za głową.', 'Biodra w tył i w dół, kolana nad palcami, pięty na podłodze.', 'Zejdź poniżej równoległej i wstań dynamicznie.'],
      v: ['Spokojne, pełne przysiady.', 'Z dołu wyskocz w górę, wyląduj miękko i od razu schodź do kolejnego.']},
    plank: {t: ['Przedramiona pod barkami, ciało w jednej linii.', 'Spnij brzuch i pośladki – biodra ani nie opadają, ani nie sterczą.', 'Oddychaj spokojnie, patrz w podłogę.']},
    sideplank: {t: ['Leż na boku, łokieć pod barkiem, nogi proste jedna na drugiej.', 'Unieś biodra, aż ciało będzie w linii.', 'Trzymaj, potem zmień stronę.']},
    bridge: {t: ['Leż na plecach, stopy blisko pośladków, ręce wzdłuż ciała.', 'Wypchnij biodra w górę przez pięty, aż ciało będzie w linii od barków do kolan.', 'Spnij pośladki na górze i opuszczaj powoli.'],
      v: ['Obie stopy na podłodze.', 'Jedna noga uniesiona prosto – pracuje tylko druga.']},
    climber: {t: ['Pozycja jak do pompki, dłonie pod barkami.', 'Na zmianę przyciągaj kolana do klatki w szybkim tempie.', 'Biodra nisko, brzuch spięty.']},
    superman: {t: ['Leż na brzuchu, ręce wyciągnięte przed siebie.', 'Unieś jednocześnie ręce, klatkę i nogi.', 'Zatrzymaj na 1–2 s i opuść powoli.']},
    twist: {t: ['Usiądź, odchyl tułów do tyłu, stopy lekko nad podłogą (lub na podłodze – łatwiej).', 'Skręcaj tułów na boki, dotykając dłońmi (lub ciężarem) podłogi.', 'Plecy proste, ruch z tułowia, nie z rąk.']},
    curl: {t: ['Stań prosto, hantle w dłoniach, łokcie przy tułowiu.', 'Uginaj ręce, unosząc hantle do barków – łokcie się nie ruszają.', 'Opuszczaj powoli do pełnego wyprostu.']},
    pull: {t: ['Chwyt nachwytem, nieco szerzej niż barki.', 'Zacznij od ściągnięcia łopatek w dół, potem prowadź łokcie do żeber.', 'Broda nad drążek, opuszczaj się powoli do pełnego wyprostu rąk.'], v: PULL_V},
    chin: {t: ['Chwyt podchwytem (dłonie do siebie) na szerokość barków.', 'Ciągnij łokcie w dół i do tyłu, klatka do drążka.', 'Pełny zakres: broda nad drążek, w dole proste ręce.'], v: PULL_V},
    dip: {t: ['Barki nisko, z dala od uszu, klatka do przodu.', 'Schodź, aż ramię będzie mniej więcej równoległe do podłogi – bez bólu w barku.', 'Wypchnij się do pełnego wyprostu łokci.'],
      v: ['Dłonie na krawędzi ławki za sobą, nogi przed sobą. Łokcie idą prosto do tyłu.', 'Zacznij w podporze na poręczach i opuszczaj się przez 5 sekund; na górę wróć ze stopnia.', 'Lekko pochyl tułów do przodu, łokcie blisko ciała.', 'Obciążenie na pasie lub w kamizelce.']},
    incdb: {t: ['Ławka ustawiona na 30–45°, łopatki ściągnięte i wciśnięte w oparcie.', 'Opuszczaj hantle do boków klatki, łokcie ok. 45° od tułowia.', 'Wypchnij hantle nad barki, bez uderzania nimi o siebie.']},
    row: {t: ['Usiądź prosto, stopy na podestach, kolana lekko ugięte.', 'Ciągnij uchwyt do brzucha, ściągając łopatki – łokcie blisko ciała.', 'Wracaj powoli do wyprostu rąk, bez zaokrąglania pleców.']},
    pike: {t: ['Biodra wysoko – ciało w kształcie odwróconego V.', 'Opuszczaj głowę w stronę podłogi przed dłońmi, łokcie idą do tyłu.', 'Wypchnij się do wyprostu, ciężar na barkach.'],
      v: ['Stopy na podłodze, nogi możliwie proste.', 'Stopy na ławce – więcej ciężaru na barkach.', 'Stań na rękach przy ścianie i opuszczaj się przez 3–5 s, aż głowa dotknie podłogi (podłóż poduszkę).', 'Pełne pompki w staniu na rękach przy ścianie – kontroluj zejście.']},
    hang: {t: ['Zwis na prostych rękach, łopatki lekko spięte.', 'Podwiń miednicę i unieś nogi bez bujania.', 'Opuszczaj nogi powoli, nie odbijaj się.'],
      v: ['Unieś kolana do klatki piersiowej.', 'Proste nogi do poziomu lub wyżej.', 'Dotknij palcami stóp drążka, ręce zostają prawie proste.']},
    squat: {t: ['Sztanga na górnej części pleców, stopy na szerokość barków, palce lekko na zewnątrz.', 'Biodra w tył i w dół, kolana podążają za palcami stóp, plecy proste.', 'Zejdź co najmniej do równoległej i wypchnij się przez całą stopę.']},
    rdl: {t: ['Stań prosto ze sztangą, kolana lekko ugięte – i tak zostają.', 'Wypychaj biodra do tyłu, sztanga sunie blisko ud i goleni, plecy proste.', 'Zejdź do mocnego rozciągnięcia tyłu ud i wróć, spinając pośladki.']},
    bulg: {t: ['Tylna stopa grzbietem na ławce, przednia ok. dużego kroku przed nią.', 'Opuszczaj się pionowo, aż tylne kolano prawie dotknie podłogi.', 'Wypchnij się przez piętę przedniej nogi.']},
    pistol: {t: ['Stań na jednej nodze, druga noga i ręce wyciągnięte przed siebie.', 'Schodź powoli, biodra w tył, pięta cały czas na podłodze.', 'Wstań bez odbijania się z dołu.'],
      v: ['Usiądź na ławce/skrzyni za sobą i wstań na jednej nodze.', 'Trzymaj się słupka lub framugi – pomagaj rękami tylko tyle, ile trzeba.', 'Pełny przysiad na jednej nodze bez podparcia.', 'Trzymaj hantlę lub talerz przy klatce – to też pomaga w równowadze.']},
    calf: {t: ['Stań na przodostopiu (najlepiej na krawędzi stopnia), hantle w dłoniach.', 'Wspinaj się maksymalnie wysoko i zatrzymaj na sekundę.', 'Opuszczaj pięty powoli, do pełnego rozciągnięcia łydek.']},
    hollow: {t: ['Leżąc na plecach, dociśnij lędźwie do podłogi – to najważniejsze.', 'Unieś łopatki i nogi, ręce wyciągnij za głowę.', 'Trzymaj pozycję „banana”, oddychaj spokojnie.'],
      v: ['Nogi ugięte w kolanach – łatwiejsza wersja.', 'Nogi proste, nisko nad podłogą.']},
    push: {t: ['Dłonie pod barkami, ciało w jednej linii od głowy do pięt.', 'Opuszczaj klatkę nisko, łokcie ok. 45° od tułowia.', 'Spięty brzuch i pośladki – wypchnij się do pełnego wyprostu.'],
      v: ['Dłonie nieco szerzej niż barki.', 'Dłonie razem pod klatką (palce tworzą romb) – więcej pracy tricepsów.', 'Dłonie szeroko; schodź na jedną rękę, druga zostaje prosta. Zmieniaj strony.', 'Dłonie przy biodrach, palce lekko na zewnątrz, barki wysunięte przed dłonie.', 'Talerz na plecach albo kamizelka obciążeniowa.']},
    ohp: {t: ['Usiądź z oparciem w pionie, hantle na wysokości barków.', 'Wypchnij hantle nad głowę do wyprostu łokci, nie wyginaj lędźwi.', 'Opuszczaj powoli do wysokości uszu.']},
    lat: {t: ['Usiądź, zablokuj uda pod wałkiem, chwyt nieco szerzej niż barki.', 'Ściągnij drążek do górnej części klatki – łokcie w dół i lekko w tył.', 'Wracaj powoli do pełnego wyprostu rąk.']},
    face: {t: ['Wyciąg na wysokości twarzy, lina chwytem kciukami do tyłu.', 'Ciągnij linę do twarzy, rozchylając dłonie i unosząc łokcie wysoko.', 'Zatrzymaj na chwilę ze ściągniętymi łopatkami, wracaj powoli.']},
    lsit: {t: ['Dłonie na podłodze lub uchwytach przy biodrach.', 'Wypchnij się w górę – barki w dół, ręce proste.', 'Unieś nogi i trzymaj pozycję, nie garbiąc się.'],
      v: ['Kolana podciągnięte do klatki.', 'Jedna noga prosta, druga ugięta – zmieniaj co serię.', 'Obie nogi proste, w poziomie.']},
    hipt: {t: ['Łopatki oparte o ławkę, sztanga (z gąbką) na biodrach.', 'Wypchnij biodra w górę przez pięty, aż tułów i uda będą w linii.', 'Na górze mocno spnij pośladki, broda lekko przy klatce.']},
    press: {t: ['Plecy i biodra dociśnięte do oparcia, stopy na szerokość bioder.', 'Opuszczaj platformę, aż kolana będą blisko klatki – bez odrywania bioder.', 'Wypchnij, nie blokując kolan na siłę w wyproście.']},
    lunge: {t: ['Hantle w dłoniach, tułów prosto.', 'Zrób duży krok i opuść się, aż tylne kolano prawie dotknie podłogi.', 'Wypchnij się przez przednią piętę i przejdź w kolejny krok.']},
    legcurl: {t: ['Połóż się tak, by kolana były tuż za krawędzią ławki, wałek nad piętami.', 'Uginaj nogi, przyciągając pięty do pośladków – biodra przy ławce.', 'Opuszczaj powoli do prawie pełnego wyprostu.']},
    wheel: {t: ['Napnij brzuch i pośladki, plecy lekko zaokrąglone.', 'Tocz kółko do przodu tylko tak daleko, jak utrzymasz lędźwie bez wygięcia.', 'Wróć, „ściągając” kółko brzuchem, nie biodrami.'],
      v: ['Z kolan, krótki zakres – mniej więcej połowa drogi.', 'Z kolan, pełny zakres – prawie do leżenia.', 'Ze stania: tocz się powoli w dół (negatyw), na górę wróć z kolan.']}
  };

  function figHow(id, v) {
    var h = HOW[id];
    if (!h) return null;
    return {tips: h.t, how: h.v ? h.v[Math.min(v || 0, h.v.length - 1)] : ''};
  }


  /* ---------- prawdziwe zdjęcia (free-exercise-db, public domain) ---------- */
  var PHOTO = {
    pull: ['invrow', 'pullup', 'bandpull', 'pullup', 'wpull'],
    chin: ['invrow', 'chinup', 'bandpull', 'chinup', 'chinup'],
    dip: ['benchdip', 'dip', 'dip', 'dipchest'],
    incdb: 'incdb', row: 'cablerow',
    pike: [null, null, 'hspu', 'hspu'],
    hang: ['hangknee', 'hangknee', 'hangpike'],
    squat: 'squat', rdl: 'rdl', bulg: 'bulg',
    pistol: [null, null, 'pistol', 'pistol'],
    calf: 'calf',
    push: ['pushup', 'pushclose', null, null, 'pushup'],
    ohp: 'ohp', lat: 'lat', face: 'face', hipt: 'hipt', press: 'legpress', lunge: 'lunge', legcurl: 'legcurl',
    wheel: ['abwheel', 'abwheel', 'rollout'],
    bwsquat: ['bwsquat', 'jumpsq'], plank: 'plank', sideplank: 'sideplank', bridge: 'bridge',
    climber: 'climber', superman: 'superman', twist: 'twist', curl: 'curl',
    _warm: 'armcirc', _run: 'jog'
  };
  function photoKey(id, v) {
    var p = PHOTO[id];
    if (Array.isArray(p)) p = p[Math.min(v || 0, p.length - 1)];
    return p || null;
  }
  function photoHTML(k) {
    return '<div class="ph"><img src="img/' + k + '-0.jpg" alt="" decoding="async">' +
      '<img class="ph2" src="img/' + k + '-1.jpg" alt="" decoding="async">' +
      '<span class="ph-tag ph-a">Start</span><span class="ph-tag ph-b">Koniec</span></div>';
  }
  // Ramka z ilustracją: zdjęcie, jeśli jest, w przeciwnym razie animowany rysunek.
  // src: {ex, v} | {fig} | {photo}
  function exMedia(src, cls) {
    cls = cls || '';
    var k = src.photo || (src.ex ? photoKey(src.ex, src.v) : null);
    if (k) return '<div class="ex-fig has-ph ' + cls + '">' + photoHTML(k) + '</div>';
    return '<div class="ex-fig ' + cls + '">' + figSVG(src.fig || src.ex, src.fig ? 0 : src.v) + '</div>';
  }
  function exThumb(id, v) {
    var k = photoKey(id, v);
    if (k) return '<div class="ex-thumb ph-thumb"><img src="img/' + k + '-1.jpg" alt="" loading="lazy"></div>';
    return '<div class="ex-thumb">' + figSVG(id, v, {static: true}) + '</div>';
  }
  window.exMedia = exMedia;
  window.exThumb = exThumb;

  window.figSVG = figSVG;
  window.figHow = figHow;
  window.FIG_SPECS = FIGS; // do podglądu/testów
})();

// Siłka – service worker (działanie offline)
const CACHE = 'silka-v5';
const ASSETS = ['./', './index.html', './styles.css', './core.js', './figures.js', './workout.js', './stretch.js', './views.js', './skills.js', './manifest.webmanifest','./icon-180.png', './icon-192.png', './icon-512.png',
  './img/abwheel-0.jpg', './img/abwheel-1.jpg', './img/armcirc-0.jpg', './img/armcirc-1.jpg', './img/bandpull-0.jpg', './img/bandpull-1.jpg', './img/benchdip-0.jpg', './img/benchdip-1.jpg', './img/bridge-0.jpg', './img/bridge-1.jpg', './img/bulg-0.jpg', './img/bulg-1.jpg', './img/bwsquat-0.jpg', './img/bwsquat-1.jpg', './img/cablerow-0.jpg', './img/cablerow-1.jpg', './img/calf-0.jpg', './img/calf-1.jpg', './img/chinup-0.jpg', './img/chinup-1.jpg', './img/climber-0.jpg', './img/climber-1.jpg', './img/curl-0.jpg', './img/curl-1.jpg', './img/dip-0.jpg', './img/dip-1.jpg', './img/dipchest-0.jpg', './img/dipchest-1.jpg', './img/face-0.jpg', './img/face-1.jpg', './img/hangknee-0.jpg', './img/hangknee-1.jpg', './img/hangpike-0.jpg', './img/hangpike-1.jpg', './img/hipt-0.jpg', './img/hipt-1.jpg', './img/hspu-0.jpg', './img/hspu-1.jpg', './img/incdb-0.jpg', './img/incdb-1.jpg', './img/invrow-0.jpg', './img/invrow-1.jpg', './img/jog-0.jpg', './img/jog-1.jpg', './img/jumpsq-0.jpg', './img/jumpsq-1.jpg', './img/lat-0.jpg', './img/lat-1.jpg', './img/legcurl-0.jpg', './img/legcurl-1.jpg', './img/legpress-0.jpg', './img/legpress-1.jpg', './img/lunge-0.jpg', './img/lunge-1.jpg', './img/ohp-0.jpg', './img/ohp-1.jpg', './img/pistol-0.jpg', './img/pistol-1.jpg', './img/plank-0.jpg', './img/plank-1.jpg', './img/pullup-0.jpg', './img/pullup-1.jpg', './img/pushclose-0.jpg', './img/pushclose-1.jpg', './img/pushdecl-0.jpg', './img/pushdecl-1.jpg', './img/pushone-0.jpg', './img/pushone-1.jpg', './img/pushup-0.jpg', './img/pushup-1.jpg', './img/pushwide-0.jpg', './img/pushwide-1.jpg', './img/rdl-0.jpg', './img/rdl-1.jpg', './img/rollout-0.jpg', './img/rollout-1.jpg', './img/sideplank-0.jpg', './img/sideplank-1.jpg', './img/squat-0.jpg', './img/squat-1.jpg', './img/st_calfwall-0.jpg', './img/st_calfwall-1.jpg', './img/st_cat-0.jpg', './img/st_cat-1.jpg', './img/st_chestsh-0.jpg', './img/st_chestsh-1.jpg', './img/st_child-0.jpg', './img/st_child-1.jpg', './img/st_dynchest-0.jpg', './img/st_dynchest-1.jpg', './img/st_glute4-0.jpg', './img/st_glute4-1.jpg', './img/st_hamband-0.jpg', './img/st_hamband-1.jpg', './img/st_hamstr-0.jpg', './img/st_hamstr-1.jpg', './img/st_hipcirc-0.jpg', './img/st_hipcirc-1.jpg', './img/st_hipflex-0.jpg', './img/st_hipflex-1.jpg', './img/st_inchworm-0.jpg', './img/st_inchworm-1.jpg', './img/st_kforearm-0.jpg', './img/st_kforearm-1.jpg', './img/st_knee2chest-0.jpg', './img/st_knee2chest-1.jpg', './img/st_kneeacross-0.jpg', './img/st_kneeacross-1.jpg', './img/st_latst-0.jpg', './img/st_latst-1.jpg', './img/st_neck-0.jpg', './img/st_neck-1.jpg', './img/st_quad-0.jpg', './img/st_quad-1.jpg', './img/st_runner-0.jpg', './img/st_runner-1.jpg', './img/st_shcirc-0.jpg', './img/st_shcirc-1.jpg', './img/st_shoulder-0.jpg', './img/st_shoulder-1.jpg', './img/st_spinal-0.jpg', './img/st_spinal-1.jpg', './img/st_straddle-0.jpg', './img/st_straddle-1.jpg', './img/st_upback-0.jpg', './img/st_upback-1.jpg', './img/st_wgs-0.jpg', './img/st_wgs-1.jpg', './img/st_wristc-0.jpg', './img/st_wristc-1.jpg', './img/superman-0.jpg', './img/superman-1.jpg', './img/twist-0.jpg', './img/twist-1.jpg', './img/wpull-0.jpg', './img/wpull-1.jpg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    // Strona: najpierw sieć (żeby łapać aktualizacje), offline z pamięci
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put('./index.html', copy));
        return res;
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});

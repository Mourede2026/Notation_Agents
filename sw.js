/* Service worker : permet d’ouvrir le formulaire sans connexion.
   Stratégie : page HTML en « réseau d’abord » (avec repli sur la copie locale),
   autres fichiers en « cache d’abord ». Les envois vers Google ne sont jamais interceptés.
   Changez le numéro de VERSION à chaque grosse mise à jour pour forcer le renouvellement. */
const VERSION = 'eval-v2';
const PRECACHE = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function withTimeout(p, ms) {
  return new Promise((res, rej) => {
    const t = setTimeout(() => rej(new Error('timeout')), ms);
    p.then(v => { clearTimeout(t); res(v); }, err => { clearTimeout(t); rej(err); });
  });
}

async function networkFirst(req) {
  const cache = await caches.open(VERSION);
  try {
    const res = await withTimeout(fetch(req), 4000);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    return (await cache.match(req)) || (await cache.match('index.html')) || (await cache.match('./')) ||
      new Response('Hors connexion', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }
}

async function cacheFirst(req) {
  const cache = await caches.open(VERSION);
  const hit = await cache.match(req);
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    return new Response('', { status: 504 });
  }
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;          // Google Apps Script : jamais intercepté
  if (url.pathname.endsWith('/admin.html')) return;          // l’administration exige une connexion
  const isHtml = req.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('/');
  e.respondWith(isHtml ? networkFirst(req) : cacheFirst(req));
});

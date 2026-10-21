/* Pisteputki service worker. Sivu haetaan aina ensin verkosta (uusin versio), ja välimuistista vain jos verkkoa ei ole.
   Tätä tiedostoa ei tarvitse muuttaa päivityksissä: riittää, että index.html vaihdetaan. */
const CACHE='pisteputki-v1';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{ const r=e.request; if(r.method!=='GET') return; const u=new URL(r.url);
  if(r.mode==='navigate' || (u.origin===location.origin && u.pathname.endsWith('/index.html'))){
    e.respondWith(fetch(r,{cache:'no-store'}).then(res=>{ const cp=res.clone(); caches.open(CACHE).then(c=>c.put('./index.html',cp)); return res; }).catch(()=>caches.match('./index.html').then(m=>m||caches.match('./'))));
    return; }
  if(u.origin===location.origin || /fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){
    e.respondWith(caches.match(r).then(m=>{ const net=fetch(r).then(res=>{ if(res && (res.ok||res.type==='opaque')){ const cp=res.clone(); caches.open(CACHE).then(c=>c.put(r,cp)); } return res; }).catch(()=>m); return m||net; })); }
});

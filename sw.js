const CACHE = "vendas-mn9-v12";
const FILES = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, {cache: "reload"}))))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const guardar = res => { if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return res; };
  // Página e manifesto: primeiro a rede (versão mais recente), sem rede usa a cópia guardada.
  if (e.request.mode === "navigate" || /\/(index\.html|manifest\.json)?$/.test(new URL(e.request.url).pathname)) {
    e.respondWith(fetch(e.request, {cache: "no-store"}).then(guardar)
      .catch(() => caches.match(e.request, {ignoreSearch: true}).then(r => r || caches.match("./index.html"))));
    return;
  }
  // Resto (ícones): primeiro a cópia guardada.
  e.respondWith(caches.match(e.request, {ignoreSearch: true}).then(r => r || fetch(e.request).then(guardar))
    .catch(() => caches.match("./index.html")));
});

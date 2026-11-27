// Mis Tarjetas - service worker. Cambia la versión cada vez que subas cambios.
const VERSION="mis-tarjetas-v31";
const ARCHIVOS=["./","index.html","manifest.json","icon-192.png","icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(ARCHIVOS)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION&&k!=="compartido").map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
// Primero la red (para que siempre veas la versión nueva); si no hay internet, usa la copia guardada.
self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url);
  // Archivos compartidos desde la galería, WhatsApp o el correo (botón "Compartir")
  if(e.request.method==="POST"&&u.pathname.endsWith("/compartir")){
    e.respondWith((async()=>{try{const fd=await e.request.formData();const f=fd.get("archivo");
      if(f&&f.size){const c=await caches.open("compartido");await c.put("archivo-compartido",new Response(f,{headers:{"content-type":f.type||"application/octet-stream","x-nombre":encodeURIComponent(f.name||"archivo")}}));}}catch(err){}
      return Response.redirect("./?compartido=1",303);})());
    return;
  }
  if(e.request.method!=="GET"||u.origin!==location.origin)return;
  e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(VERSION).then(ca=>ca.put(e.request,c));return r;}).catch(()=>caches.match(e.request).then(r=>r||caches.match("index.html"))));
});
self.addEventListener("notificationclick",e=>{e.notification.close();e.waitUntil(self.clients.matchAll({type:"window"}).then(cs=>cs.length?cs[0].focus():self.clients.openWindow("./")));});

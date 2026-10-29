const CACHE='discipline-task-problem-links-v21';
const SDK='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/dist/umd/supabase.js';
const ROOT=new URL('./',self.location.href);
const INDEX=new URL('./index.html',ROOT).href;
const ASSETS=['./','./index.html','./manifest.webmanifest','./argument-review.webmanifest'].map(p=>new URL(p,ROOT).href);
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll([...ASSETS,SDK])).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>(k.startsWith('discipline-task-')||k==='daily-discipline-pwa-v1')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 const url=e.request.url;
 if(url===SDK){e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));return}
 const target=new URL(url),appDocument=e.request.mode==='navigate'&&target.origin===ROOT.origin&&(target.pathname===ROOT.pathname||target.pathname===new URL(INDEX).pathname);
 if(!appDocument&&!ASSETS.includes(url))return;
 const key=appDocument?INDEX:e.request;
 e.respondWith(fetch(e.request).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(key,copy))}return r}).catch(()=>caches.match(key).then(r=>r||Response.error())));
});
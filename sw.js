const CACHE='discipline-task-copy-v28';
const SDK='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/dist/umd/supabase.js';
const ROOT=new URL('./',self.location.href);
const INDEX=new URL('./index.html',ROOT).href;
const ASSETS=['./','./index.html','./manifest.webmanifest','./argument-review.webmanifest','./icons/orbit.svg','./icons/orbit-180.png','./icons/orbit-192.png','./icons/orbit-512.png'].map(p=>new URL(p,ROOT).href);
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
self.addEventListener('push',event=>{let data={};try{data=event.data?.json()||{}}catch{}const raw=typeof data.url==='string'?data.url:'./',url=new URL(raw,self.location.href),root=new URL('./',self.location.href);const safe=url.origin===root.origin&&url.pathname.startsWith(root.pathname)?url.href:root.href;event.waitUntil(self.registration.showNotification(String(data.title==='Daily Discipline'?'ORBIT':data.title||'ORBIT').slice(0,100),{icon:new URL('./icons/orbit-192.png',self.location.href).href,body:String(data.body||'アプリを開いて予定を確認しましょう。').slice(0,240),tag:String(data.tag||'discipline-update').slice(0,180),data:{url:safe},renotify:false}))});
self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil((async()=>{const root=new URL('./',self.location.href),url=new URL(event.notification.data?.url||root.href,root);if(url.origin!==root.origin||!url.pathname.startsWith(root.pathname))return;const clientsList=await self.clients.matchAll({type:'window',includeUncontrolled:true});for(const client of clientsList)if(client.url.startsWith(root.href)){await client.focus();client.postMessage({type:'discipline-notification-open',url:url.href});return}await self.clients.openWindow(url.href)})())});
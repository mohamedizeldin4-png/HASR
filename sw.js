/* يخزّن الصفحة على الهاتف بعد أول فتح بالإنترنت، فتعمل بعدها دون اتصال. عند وصول نسخة جديدة تُحدَّث الصفحة المفتوحة تلقائياً */
var V='hasr-pwa-v8';
var CORE=['./','./index.html','./manifest-hasr.json','./icon-192.png','./icon-512.png'];
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(V).then(function(c){
    return Promise.all(CORE.map(function(u){
      return fetch(new Request(u,{cache:'reload'})).then(function(r){if(r&&r.ok) return c.put(u,r)}).catch(function(){});
    }));
  }).then(function(){return self.skipWaiting()}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){
    var had=ks.some(function(k){return k!==V&&k.indexOf('hasr-pwa-')===0});
    return Promise.all(ks.filter(function(k){return k!==V}).map(function(k){return caches.delete(k)}))
      .then(function(){return self.clients.claim()})
      .then(function(){
        if(!had) return;
        return self.clients.matchAll({type:'window'}).then(function(cs){cs.forEach(function(c){try{c.navigate(c.url)}catch(x){}})});
      });
  }));
});
self.addEventListener('fetch',function(e){
  var r=e.request;
  if(r.method!=='GET'||new URL(r.url).origin!==location.origin) return;
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(function(hit){
    var net=fetch(r).then(function(res){
      if(res&&res.ok){var cp=res.clone(); caches.open(V).then(function(c){c.put(r,cp)})}
      return res;
    }).catch(function(){return hit||(r.mode==='navigate'?caches.match('./index.html'):undefined)});
    return hit||net;
  }));
});

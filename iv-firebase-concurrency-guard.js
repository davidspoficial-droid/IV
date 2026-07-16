// IV - salvamento transacional com mesclagem para múltiplos usuários e dispositivos
(function(){
  'use strict';
  if(window.__IV_FIREBASE_CONCURRENCY_GUARD__) return;
  window.__IV_FIREBASE_CONCURRENCY_GUARD__ = true;

  var baseline = null;
  var patched = false;
  var sdkPromise = null;
  var lastGeneratedId = 0;
  var MISSING = {__ivMissing:true};

  function clone(value){
    if(value === MISSING) return MISSING;
    if(value === undefined) return undefined;
    try{return structuredClone(value);}catch(error){
      try{return JSON.parse(JSON.stringify(value));}catch(inner){return value;}
    }
  }

  function isPlainObject(value){
    return !!value && Object.prototype.toString.call(value) === '[object Object]' && value !== MISSING;
  }

  function stable(value){
    if(value === MISSING) return '__IV_MISSING__';
    if(value === undefined) return '__IV_UNDEFINED__';
    if(value === null || typeof value !== 'object') return JSON.stringify(value);
    if(Array.isArray(value)) return '[' + value.map(stable).join(',') + ']';
    return '{' + Object.keys(value).sort().map(function(key){return JSON.stringify(key)+':'+stable(value[key]);}).join(',') + '}';
  }

  function same(a,b){
    if(a === b) return true;
    if(a === MISSING || b === MISSING) return false;
    return stable(a) === stable(b);
  }

  function identity(item, path){
    if(!isPlainObject(item)) return null;
    if(item.id !== undefined && item.id !== null && item.id !== '') return 'id:'+String(item.id);
    if(item.uid) return 'uid:'+String(item.uid);
    if(item.username) return 'username:'+String(item.username).trim().toLowerCase();
    if(item.email && /usuarios/i.test(path||'')) return 'email:'+String(item.email).trim().toLowerCase();
    if(item.link) return 'link:'+String(item.link);
    if(item.criadoEm) return 'created:'+String(item.criadoEm)+':'+String(item.tipo||item.acao||item.nome||'');
    if(item.data && (item.acao || item.alvo || item.tipo)) return 'event:'+String(item.data)+':'+String(item.tipo||'')+':'+String(item.acao||'')+':'+String(item.alvo||'');
    return null;
  }

  function keyedArray(values, path){
    var map = Object.create(null), order = [], valid = true;
    (values||[]).forEach(function(item,index){
      var key = identity(item,path);
      if(!key || Object.prototype.hasOwnProperty.call(map,key)){
        valid = false;
        key = '__index__:'+index+':'+stable(item);
      }
      map[key] = item;
      order.push(key);
    });
    return {map:map,order:order,valid:valid};
  }

  function mergeUnkeyedArray(base, local, remote){
    if(same(local,base)) return clone(remote);
    if(same(remote,base)) return clone(local);
    if(same(local,remote)) return clone(local);

    var result = [], seen = Object.create(null);
    function add(item){
      var key = stable(item);
      if(seen[key]) return;
      seen[key] = true;
      result.push(clone(item));
    }
    (remote||[]).forEach(add);
    (local||[]).forEach(add);
    return result;
  }

  function mergeArray(base, local, remote, path){
    if(same(local,base)) return clone(remote);
    if(same(remote,base)) return clone(local);
    if(same(local,remote)) return clone(local);

    var b = keyedArray(base,path), l = keyedArray(local,path), r = keyedArray(remote,path);
    if(!b.valid || !l.valid || !r.valid) return mergeUnkeyedArray(base,local,remote);

    var order = [], used = Object.create(null);
    function include(key){if(!used[key]){used[key]=true;order.push(key);}}
    r.order.forEach(include);
    l.order.forEach(include);
    b.order.forEach(include);

    var output = [];
    order.forEach(function(key){
      var bv = Object.prototype.hasOwnProperty.call(b.map,key) ? b.map[key] : MISSING;
      var lv = Object.prototype.hasOwnProperty.call(l.map,key) ? l.map[key] : MISSING;
      var rv = Object.prototype.hasOwnProperty.call(r.map,key) ? r.map[key] : MISSING;
      var merged = mergeNode(bv,lv,rv,path+'['+key+']');
      if(merged !== MISSING) output.push(merged);
    });
    return output;
  }

  function mergeNode(base, local, remote, path){
    if(local === MISSING){
      if(base === MISSING) return clone(remote);
      if(remote === MISSING) return MISSING;
      return MISSING;
    }
    if(remote === MISSING){
      if(base === MISSING) return clone(local);
      if(same(local,base)) return MISSING;
      return clone(local);
    }
    if(base === MISSING){
      if(same(local,remote)) return clone(local);
      if(Array.isArray(local) && Array.isArray(remote)) return mergeArray([],local,remote,path);
      if(isPlainObject(local) && isPlainObject(remote)){
        var added = {}, addedKeys = new Set(Object.keys(local).concat(Object.keys(remote)));
        addedKeys.forEach(function(key){
          var merged = mergeNode(MISSING,
            Object.prototype.hasOwnProperty.call(local,key)?local[key]:MISSING,
            Object.prototype.hasOwnProperty.call(remote,key)?remote[key]:MISSING,
            path+'.'+key);
          if(merged !== MISSING) added[key] = merged;
        });
        return added;
      }
      return clone(local);
    }

    if(same(local,base)) return clone(remote);
    if(same(remote,base)) return clone(local);
    if(same(local,remote)) return clone(local);

    if(Array.isArray(base) && Array.isArray(local) && Array.isArray(remote)){
      return mergeArray(base,local,remote,path);
    }
    if(isPlainObject(base) && isPlainObject(local) && isPlainObject(remote)){
      var result = {}, keys = new Set(Object.keys(base).concat(Object.keys(local),Object.keys(remote)));
      keys.forEach(function(key){
        var merged = mergeNode(
          Object.prototype.hasOwnProperty.call(base,key)?base[key]:MISSING,
          Object.prototype.hasOwnProperty.call(local,key)?local[key]:MISSING,
          Object.prototype.hasOwnProperty.call(remote,key)?remote[key]:MISSING,
          path+'.'+key
        );
        if(merged !== MISSING) result[key] = merged;
      });
      return result;
    }

    return clone(local);
  }

  function nextSafeId(used){
    var random = 0;
    try{var bytes=new Uint16Array(1);crypto.getRandomValues(bytes);random=bytes[0]%1000;}catch(error){random=Math.floor(Math.random()*1000);}
    var candidate = Date.now()*1000 + random;
    if(candidate <= lastGeneratedId) candidate = lastGeneratedId + 1;
    while(used.has(String(candidate))) candidate += 1;
    lastGeneratedId = candidate;
    used.add(String(candidate));
    return candidate;
  }

  function remapPresenceKeys(presencas, oldId, newId){
    if(!isPlainObject(presencas)) return;
    Object.keys(presencas).forEach(function(key){
      if(key.indexOf(String(oldId)+'_') !== 0) return;
      var next = String(newId)+key.slice(String(oldId).length);
      if(!Object.prototype.hasOwnProperty.call(presencas,next)) presencas[next] = presencas[key];
      delete presencas[key];
    });
  }

  function preventIdCollisions(base, local, remote){
    ['equipes','alunos'].forEach(function(collection){
      var baseIds = new Set((base[collection]||[]).map(function(item){return String(item&&item.id);}));
      var remoteMap = Object.create(null), used = new Set();
      (remote[collection]||[]).forEach(function(item){if(item&&item.id!==undefined){remoteMap[String(item.id)]=item;used.add(String(item.id));}});
      (local[collection]||[]).forEach(function(item){if(item&&item.id!==undefined) used.add(String(item.id));});

      (local[collection]||[]).forEach(function(item){
        if(!item || item.id===undefined || item.id===null) return;
        var oldId = item.id, key = String(oldId), remoteItem = remoteMap[key];
        if(baseIds.has(key) || !remoteItem || same(item,remoteItem)) return;
        var newId = nextSafeId(used);
        item.id = newId;
        if(collection === 'equipes'){
          (local.alunos||[]).forEach(function(student){if(String(student.equipeId)===key) student.equipeId=newId;});
        }else{
          remapPresenceKeys(local.presencas,oldId,newId);
        }
      });
    });

    var maxId = 0;
    ['equipes','alunos'].forEach(function(collection){
      (local[collection]||[]).forEach(function(item){var id=Number(item&&item.id);if(Number.isFinite(id))maxId=Math.max(maxId,id);});
      (remote[collection]||[]).forEach(function(item){var id=Number(item&&item.id);if(Number.isFinite(id))maxId=Math.max(maxId,id);});
    });
    local._nextId = Math.max(Number(local._nextId)||1,Number(remote._nextId)||1,maxId+1);
    return local;
  }

  function replaceObject(target, source){
    if(!target || typeof target !== 'object') return;
    Object.keys(target).forEach(function(key){delete target[key];});
    Object.keys(source||{}).forEach(function(key){target[key]=clone(source[key]);});
  }

  function currentActor(){
    try{
      var user = window._firebase && window._firebase.currentUser && window._firebase.currentUser();
      return {uid:user&&user.uid||'',email:user&&user.email||''};
    }catch(error){return {uid:'',email:''};}
  }

  function sdk(){
    if(!sdkPromise){
      sdkPromise = Promise.all([
        import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js'),
        import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js')
      ]).then(function(parts){
        var app = parts[0], firestore = parts[1];
        var db = firestore.getFirestore(app.getApp());
        return {db:db,ref:firestore.doc(db,'sistema','dados'),runTransaction:firestore.runTransaction};
      });
    }
    return sdkPromise;
  }

  function refreshViews(){
    window.setTimeout(function(){
      ['renderDashboard','renderAlunos','renderEquipes','renderUsuarios','refreshEquipeSelects'].forEach(function(name){
        try{if(typeof window[name] === 'function') window[name]();}catch(error){}
      });
      try{if(typeof window.initPresenca === 'function') window.initPresenca();}catch(error){}
    },40);
  }

  function patchNewId(){
    if(typeof window.newId !== 'function' || window.newId._ivConcurrentSafe) return;
    var safe = function(){return nextSafeId(new Set());};
    safe._ivConcurrentSafe = true;
    window.newId = safe;
  }

  function patchFirebase(){
    var firebase = window._firebase;
    if(!firebase || patched) return false;
    patched = true;

    var originalLoad = typeof firebase.load === 'function' ? firebase.load.bind(firebase) : null;
    if(originalLoad){
      firebase.load = async function(){
        var data = await originalLoad();
        baseline = clone(data || {});
        return data;
      };
    }

    firebase.save = async function(localData){
      try{
        var tools = await sdk(), merged = null, actor = currentActor();
        await tools.runTransaction(tools.db,async function(transaction){
          var snapshot = await transaction.get(tools.ref);
          var remote = snapshot.exists() ? snapshot.data() : {};
          var base = clone(baseline || remote || {});
          var local = preventIdCollisions(base,clone(localData || {}),clone(remote || {}));
          merged = mergeNode(base,local,remote,'DB');
          if(!isPlainObject(merged)) merged = local;
          var previousVersion = Number(remote&&remote._sync&&remote._sync.version)||0;
          merged._sync = {
            version: previousVersion + 1,
            updatedAt: new Date().toISOString(),
            updatedBy: actor,
            mode: 'transactional-merge-v1'
          };
          transaction.set(tools.ref,merged);
        });

        baseline = clone(merged || localData || {});
        if(merged) replaceObject(localData,merged);
        refreshViews();
        try{window.dispatchEvent(new CustomEvent('iv-concurrency-saved',{detail:{version:merged&&merged._sync&&merged._sync.version}}));}catch(error){}
        return true;
      }catch(error){
        console.error('Falha no salvamento transacional do IV',error);
        return false;
      }
    };

    patchNewId();
    return true;
  }

  function init(){
    patchFirebase();
    patchNewId();
  }

  if(window._firebaseReady) init();
  else document.addEventListener('firebase-ready',init,{once:true});
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
  window.setTimeout(init,200);
  window.setTimeout(init,800);
})();
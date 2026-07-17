// IV - mantém ações dos cartões mobile ligadas ao índice original do usuário
(function(){
  'use strict';
  if(window.__IV_MOBILE_USERS_ACTION_INDEX_FIX__) return;
  window.__IV_MOBILE_USERS_ACTION_INDEX_FIX__=true;
  var observer=null,observed=null;
  function db(){try{return typeof DB!=='undefined'?DB:null}catch(e){return null}}
  function repair(){
    var d=db(),list=document.getElementById('iv-mobile-users-list');
    if(!d||!list)return;
    Array.prototype.forEach.call(list.querySelectorAll('.iv-mobile-user-card'),function(card){
      var handle=card.querySelector('.iv-mobile-user-handle');
      var username=String(handle&&handle.textContent||'').replace(/^@/,'').trim().toLowerCase();
      if(!username)return;
      var index=(d.usuarios||[]).findIndex(function(user){return String(user.username||'').trim().toLowerCase()===username});
      if(index<0)return;
      ['edit','status','delete'].forEach(function(action){
        var button=card.querySelector('[data-iv-user-'+action+']');
        if(button)button.setAttribute('data-iv-user-'+action,String(index));
      });
    });
  }
  function watch(){
    var list=document.getElementById('iv-mobile-users-list');
    if(!list||observed===list)return;
    if(observer)observer.disconnect();
    observed=list;
    observer=new MutationObserver(repair);
    observer.observe(list,{childList:true});
    repair();
  }
  function patch(){
    var current=window.renderUsuarios;
    if(typeof current!=='function'||current._ivMobileUserIndexFix)return;
    var wrapped=function(){var result=current.apply(this,arguments);setTimeout(function(){watch();repair();},50);return result};
    wrapped._ivMobileUserIndexFix=true;
    window.renderUsuarios=wrapped;
  }
  function init(){patch();watch();repair()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  setTimeout(init,600);setTimeout(init,1600);
  import('./iv-current-user-premium.js?v=20260717-3').catch(function(error){console.error('Erro ao carregar identificação do usuário',error);});
})();
// IV - garante um unico menu mobile e entrada sempre fechada
(function(){
  'use strict';
  if(window.__IV_MOBILE_MENU_SINGLETON__) return;
  window.__IV_MOBILE_MENU_SINGLETON__=true;
  var media=window.matchMedia('(max-width:820px)');
  var observer=null;
  var observedTargets=new WeakSet();
  var timer=null;

  function close(){
    if(!document.body)return;
    document.body.classList.remove('iv-mobile-menu-open','mobile-menu-open');
    var button=document.getElementById('iv-mobile-menu-toggle');
    if(button)button.setAttribute('aria-label','Abrir menu');
  }

  function pageKey(button){
    var code=button&&button.getAttribute('onclick')||'';
    var match=code.match(/showPage\(['"]([^'"]+)['"]/i);
    return match?match[1]:String(button&&button.textContent||'').trim().toLowerCase();
  }

  function keepOne(selector,preferredId){
    var nodes=Array.prototype.slice.call(document.querySelectorAll(selector));
    if(nodes.length<2)return nodes[0]||null;
    var keep=preferredId?document.getElementById(preferredId):nodes[0];
    if(!keep||nodes.indexOf(keep)<0)keep=nodes[0];
    nodes.forEach(function(node){if(node!==keep)node.remove();});
    return keep;
  }

  function dedupe(){
    keepOne('#iv-mobile-menu-toggle,.iv-mobile-menu-toggle','iv-mobile-menu-toggle');
    keepOne('#iv-mobile-menu-backdrop,.iv-mobile-menu-backdrop','iv-mobile-menu-backdrop');

    var navs=Array.prototype.slice.call(document.querySelectorAll('.main-nav'));
    if(navs.length>1){
      var keep=navs.find(function(nav){return nav.querySelector('.mnav[onclick*="showPage"]');})||navs[0];
      navs.forEach(function(nav){if(nav!==keep)nav.remove();});
    }

    var nav=document.querySelector('.main-nav');
    if(nav){
      var seen=Object.create(null);
      nav.querySelectorAll('.mnav').forEach(function(button){
        var key=pageKey(button);
        if(key&&seen[key])button.remove();
        else if(key)seen[key]=true;
      });
    }
  }

  function patchAfter(name){
    var current=window[name];
    if(typeof current!=='function'||current._ivMenuSingleton)return;
    var wrapped=function(){
      var result=current.apply(this,arguments);
      var done=function(){close();schedule(false);};
      if(result&&typeof result.finally==='function')result.finally(done);else setTimeout(done,0);
      return result;
    };
    try{Object.keys(current).forEach(function(key){wrapped[key]=current[key];});}catch(error){}
    wrapped._ivMenuSingleton=true;
    window[name]=wrapped;
  }

  function observe(){
    if(!observer){
      observer=new MutationObserver(function(records){
        if(records.some(function(record){return record.addedNodes&&record.addedNodes.length;}))schedule(false);
      });
    }
    [document.body,document.querySelector('.header'),document.querySelector('.main-nav')].forEach(function(target){
      if(!target||observedTargets.has(target))return;
      observedTargets.add(target);
      observer.observe(target,{childList:true});
    });
  }

  function apply(closeNow){
    dedupe();
    patchAfter('entrarSistema');
    patchAfter('loadDB');
    patchAfter('sairSistema');
    observe();
    if(closeNow)close();
  }

  function schedule(closeNow){
    clearTimeout(timer);
    timer=setTimeout(function(){apply(closeNow);},20);
    [120,500,1300].forEach(function(delay){setTimeout(function(){apply(false);},delay);});
  }

  document.addEventListener('click',function(event){
    var navButton=event.target&&event.target.closest&&event.target.closest('.main-nav .mnav');
    if(navButton)setTimeout(close,30);
  },true);

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){schedule(true);},{once:true});
  else schedule(true);
  document.addEventListener('firebase-ready',function(){schedule(true);});
  window.addEventListener('pageshow',function(){schedule(true);});
  if(media.addEventListener)media.addEventListener('change',function(){schedule(true);});
  else if(media.addListener)media.addListener(function(){schedule(true);});
})();
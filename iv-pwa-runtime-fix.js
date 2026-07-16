// IV - runtime seguro do PWA: raiz estável, fullscreen e área segura
(function(){
  'use strict';
  if(window.__IV_PWA_RUNTIME_FIX__) return;
  window.__IV_PWA_RUNTIME_FIX__ = true;

  function meta(name, content){
    var selector = 'meta[name="'+name+'"]';
    var element = document.head.querySelector(selector);
    if(!element){
      element = document.createElement('meta');
      element.setAttribute('name', name);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  }

  function configureHead(){
    var viewport = document.head.querySelector('meta[name="viewport"]');
    if(!viewport){
      viewport = document.createElement('meta');
      viewport.setAttribute('name','viewport');
      document.head.appendChild(viewport);
    }
    viewport.setAttribute('content','width=device-width, initial-scale=1.0, viewport-fit=cover');
    meta('theme-color','#050A14');
    meta('mobile-web-app-capable','yes');
    meta('apple-mobile-web-app-capable','yes');
    meta('apple-mobile-web-app-status-bar-style','black-translucent');
    meta('application-name','IV Gestão');
  }

  function installedMode(){
    return !!(
      (window.matchMedia && (window.matchMedia('(display-mode: fullscreen)').matches || window.matchMedia('(display-mode: standalone)').matches)) ||
      window.navigator.standalone
    );
  }

  function applyMode(){
    var installed = installedMode();
    document.documentElement.classList.toggle('iv-pwa-installed',installed);
    if(document.body) document.body.classList.toggle('iv-pwa-installed',installed);
  }

  function addStyle(){
    if(document.getElementById('iv-pwa-runtime-style')) return;
    var style = document.createElement('style');
    style.id = 'iv-pwa-runtime-style';
    style.textContent = `
      html.iv-pwa-installed,html.iv-pwa-installed body{min-height:100%;background:#050A14!important}
      html.iv-pwa-installed body{min-height:100dvh!important;overscroll-behavior-y:none}
      @media(max-width:820px){
        html.iv-pwa-installed .header{padding-top:calc(8px + env(safe-area-inset-top))!important;min-height:calc(58px + env(safe-area-inset-top))!important;background:#071020!important}
        html.iv-pwa-installed .main-nav{padding-top:calc(88px + env(safe-area-inset-top))!important;padding-bottom:calc(18px + env(safe-area-inset-bottom))!important}
        html.iv-pwa-installed .page{padding-bottom:calc(30px + env(safe-area-inset-bottom))!important}
        html.iv-pwa-installed #auth-screen{padding-top:env(safe-area-inset-top)!important;padding-bottom:env(safe-area-inset-bottom)!important;background:#050A14!important}
      }
    `;
    document.head.appendChild(style);
  }

  function cleanLegacyLaunchUrl(){
    try{
      var path = location.pathname.replace(/\/+/g,'/');
      if(path === '/index.html' || path === '/index'){
        history.replaceState(history.state,'','/'+location.hash);
      }else if(location.search && new URLSearchParams(location.search).has('v')){
        var params = new URLSearchParams(location.search);
        params.delete('v');
        var next = location.pathname + (params.toString() ? '?'+params.toString() : '') + location.hash;
        history.replaceState(history.state,'',next);
      }
    }catch(error){}
  }

  function registerWorker(){
    if(!('serviceWorker' in navigator) || location.protocol !== 'https:') return;
    window.addEventListener('load',function(){
      navigator.serviceWorker.register('/service-worker.js',{scope:'/',updateViaCache:'none'})
        .then(function(registration){
          registration.update().catch(function(){});
          if(registration.waiting) registration.waiting.postMessage({type:'SKIP_WAITING'});
          registration.addEventListener('updatefound',function(){
            var worker = registration.installing;
            if(!worker) return;
            worker.addEventListener('statechange',function(){
              if(worker.state === 'installed' && navigator.serviceWorker.controller){
                worker.postMessage({type:'SKIP_WAITING'});
              }
            });
          });
        })
        .catch(function(error){console.error('Falha ao registrar PWA',error);});
    },{once:true});
  }

  configureHead();
  addStyle();
  cleanLegacyLaunchUrl();
  applyMode();
  registerWorker();

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',applyMode,{once:true});
  window.addEventListener('pageshow',applyMode);
  window.addEventListener('appinstalled',applyMode);
  if(window.matchMedia){
    ['(display-mode: fullscreen)','(display-mode: standalone)'].forEach(function(query){
      var media = window.matchMedia(query);
      if(media.addEventListener) media.addEventListener('change',applyMode);
      else if(media.addListener) media.addListener(applyMode);
    });
  }
})();

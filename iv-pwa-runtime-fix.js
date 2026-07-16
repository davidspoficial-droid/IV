// IV - runtime seguro do PWA: raiz estável, modo app e rolagem mobile
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
      (window.matchMedia && (
        window.matchMedia('(display-mode: fullscreen)').matches ||
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: minimal-ui)').matches
      )) || window.navigator.standalone
    );
  }

  function unlockScroll(){
    var html=document.documentElement;
    var body=document.body;
    if(!body) return;

    // Nenhum menu deve permanecer travando a tela depois de abrir ou retomar o PWA.
    body.classList.remove('iv-mobile-menu-open');
    body.classList.remove('mobile-menu-open');

    ['overflow','overflow-y','position','height','max-height','touch-action'].forEach(function(prop){
      html.style.removeProperty(prop);
      body.style.removeProperty(prop);
    });

    html.classList.add('iv-scroll-ready');
    body.classList.add('iv-scroll-ready');
  }

  function applyMode(){
    var installed = installedMode();
    document.documentElement.classList.toggle('iv-pwa-installed',installed);
    if(document.body) document.body.classList.toggle('iv-pwa-installed',installed);
    unlockScroll();
  }

  function addStyle(){
    if(document.getElementById('iv-pwa-runtime-style')) return;
    var style = document.createElement('style');
    style.id = 'iv-pwa-runtime-style';
    style.textContent = `
      html.iv-pwa-installed{
        height:auto!important;
        min-height:100%!important;
        overflow-x:hidden!important;
        overflow-y:auto!important;
        touch-action:pan-x pan-y!important;
        background:#050A14!important;
        -webkit-overflow-scrolling:touch!important;
      }
      html.iv-pwa-installed body{
        position:relative!important;
        width:100%!important;
        height:auto!important;
        min-height:100dvh!important;
        max-height:none!important;
        overflow-x:hidden!important;
        overflow-y:visible!important;
        touch-action:pan-x pan-y!important;
        overscroll-behavior-y:auto!important;
        -webkit-overflow-scrolling:touch!important;
        background:#050A14!important;
      }
      html.iv-pwa-installed body:not(.iv-mobile-menu-open):not(.mobile-menu-open){
        overflow-y:visible!important;
        position:relative!important;
        height:auto!important;
        max-height:none!important;
      }
      html.iv-pwa-installed .page,
      html.iv-pwa-installed .page.active{
        position:relative!important;
        height:auto!important;
        min-height:0!important;
        max-height:none!important;
        overflow:visible!important;
        touch-action:pan-x pan-y!important;
      }
      html.iv-pwa-installed .tbl-wrap,
      html.iv-pwa-installed .audit-list,
      html.iv-pwa-installed .mobile-list{
        touch-action:pan-x pan-y!important;
        -webkit-overflow-scrolling:touch!important;
      }
      @media(max-width:820px){
        html.iv-pwa-installed .header{
          padding-top:calc(8px + env(safe-area-inset-top))!important;
          min-height:calc(58px + env(safe-area-inset-top))!important;
          background:#071020!important;
        }
        html.iv-pwa-installed .main-nav{
          padding-top:calc(88px + env(safe-area-inset-top))!important;
          padding-bottom:calc(18px + env(safe-area-inset-bottom))!important;
        }
        html.iv-pwa-installed .page{
          padding-bottom:calc(30px + env(safe-area-inset-bottom))!important;
        }
        html.iv-pwa-installed #auth-screen{
          padding-top:env(safe-area-inset-top)!important;
          padding-bottom:env(safe-area-inset-bottom)!important;
          background:#050A14!important;
        }
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

  function scheduleUnlock(){
    [0,60,180,420,900].forEach(function(delay){
      window.setTimeout(unlockScroll,delay);
    });
  }

  configureHead();
  addStyle();
  cleanLegacyLaunchUrl();
  applyMode();
  registerWorker();
  scheduleUnlock();

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',function(){applyMode();scheduleUnlock();},{once:true});
  window.addEventListener('pageshow',function(){applyMode();scheduleUnlock();});
  window.addEventListener('focus',scheduleUnlock);
  window.addEventListener('appinstalled',function(){applyMode();scheduleUnlock();});
  document.addEventListener('visibilitychange',function(){if(!document.hidden)scheduleUnlock();});
  document.addEventListener('click',function(event){
    if(event.target && event.target.closest && event.target.closest('.mnav')) scheduleUnlock();
  },true);

  if(window.matchMedia){
    ['(display-mode: fullscreen)','(display-mode: standalone)','(display-mode: minimal-ui)'].forEach(function(query){
      var media = window.matchMedia(query);
      if(media.addEventListener) media.addEventListener('change',function(){applyMode();scheduleUnlock();});
      else if(media.addListener) media.addListener(function(){applyMode();scheduleUnlock();});
    });
  }
})();
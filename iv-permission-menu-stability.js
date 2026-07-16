// IV - mantém menus não autorizados ocultos sem piscar entre páginas
(function(){
  'use strict';
  if(window.__IV_PERMISSION_MENU_STABILITY__) return;
  window.__IV_PERMISSION_MENU_STABILITY__ = true;

  var MAP = {
    dashboard:'dashboard_view',
    alunos:'alunos_view',
    equipes:'equipes_view',
    presenca:'presenca_view',
    exportar:'relatorios_view',
    usuarios:'usuarios_view',
    historico:'usuarios_view'
  };
  var timer = null;
  var observedNav = null;
  var observer = null;

  function currentProfile(){
    try{
      if(window.IVPermissionAuthority && typeof window.IVPermissionAuthority.profile === 'function') return window.IVPermissionAuthority.profile();
      if(typeof window.getUsuarioAtual === 'function') return window.getUsuarioAtual();
    }catch(error){}
    return null;
  }

  function can(permission){
    try{return typeof window.userCan === 'function' && window.userCan(permission) === true;}catch(error){return false;}
  }

  function pageName(button){
    if(!button) return '';
    var code = button.getAttribute('onclick') || '';
    var match = code.match(/showPage\(['"]([^'"]+)['"]/i);
    if(match) return match[1];
    var text = String(button.textContent || '').toLowerCase();
    return text.indexOf('hist') >= 0 ? 'historico' : '';
  }

  function style(){
    if(document.getElementById('iv-permission-menu-stability-style')) return;
    var element = document.createElement('style');
    element.id = 'iv-permission-menu-stability-style';
    element.textContent =
      'body.iv-permission-menu-resolved .main-nav .mnav:not([data-iv-menu-access="allow"]){display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important}' +
      'body.iv-permission-menu-resolved .main-nav .mnav[data-iv-menu-access="allow"]{visibility:visible!important;opacity:1!important}' +
      '@media(max-width:820px){body.iv-permission-menu-resolved .main-nav .mnav:not([data-iv-menu-access="allow"]){display:none!important}}';
    document.head.appendChild(element);
  }

  function mark(button, allowed){
    button.setAttribute('data-iv-menu-access', allowed ? 'allow' : 'deny');
    if(allowed){
      button.removeAttribute('aria-hidden');
      if(button.dataset.ivPermissionHidden === '1'){
        button.style.removeProperty('display');
        delete button.dataset.ivPermissionHidden;
      }
    }else{
      button.setAttribute('aria-hidden','true');
    }
  }

  function classify(){
    style();
    var profile = currentProfile();
    if(!profile){
      if(document.body) document.body.classList.remove('iv-permission-menu-resolved');
      return false;
    }

    var nav = document.querySelector('.main-nav');
    if(!nav) return false;
    nav.querySelectorAll('.mnav').forEach(function(button){
      var page = pageName(button);
      mark(button, !!page && !!MAP[page] && can(MAP[page]));
    });
    if(document.body) document.body.classList.add('iv-permission-menu-resolved');
    observeNav(nav);
    return true;
  }

  function observeNav(nav){
    if(!nav || observedNav === nav) return;
    if(observer) observer.disconnect();
    observedNav = nav;
    observer = new MutationObserver(function(records){
      var changed = records.some(function(record){return record.addedNodes && record.addedNodes.length;});
      if(changed) schedule();
    });
    observer.observe(nav,{childList:true});
  }

  function patchShowPage(){
    var current = window.showPage;
    if(typeof current !== 'function' || current._ivMenuNoFlash) return;
    var wrapped = function(){
      classify();
      var result = current.apply(this,arguments);
      queueMicrotask(classify);
      return result;
    };
    try{Object.keys(current).forEach(function(key){wrapped[key]=current[key];});}catch(error){}
    wrapped._ivMenuNoFlash = true;
    window.showPage = wrapped;
  }

  function refresh(){
    patchShowPage();
    classify();
  }

  function schedule(){
    clearTimeout(timer);
    timer = setTimeout(refresh,0);
    [30,120,350,900].forEach(function(delay){setTimeout(refresh,delay);});
  }

  document.addEventListener('click',function(event){
    if(event.target && event.target.closest && event.target.closest('.main-nav .mnav')) classify();
  },true);

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',schedule,{once:true});
  else schedule();
  document.addEventListener('firebase-ready',schedule);
  window.addEventListener('iv-concurrency-saved',schedule);
  window.addEventListener('pageshow',schedule);
  window.addEventListener('focus',schedule);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)schedule();});

  window.IVPermissionMenuStability = {refresh:refresh};
})();

// IV - recupera a primeira pagina permitida sem exibir tela intermediaria
(function(){
  'use strict';
  if(window.__IV_PERMISSION_ENTRY_RECOVERY__) return;
  window.__IV_PERMISSION_ENTRY_RECOVERY__=true;

  var ORDER=['dashboard','alunos','equipes','presenca','exportar','usuarios','historico'];
  var MAP={dashboard:'dashboard_view',alunos:'alunos_view',equipes:'equipes_view',presenca:'presenca_view',exportar:'relatorios_view',usuarios:'usuarios_view',historico:'usuarios_view'};
  var timer=null;
  var observer=null;

  function profile(){
    try{
      if(window.IVPermissionAuthority&&typeof window.IVPermissionAuthority.profile==='function')return window.IVPermissionAuthority.profile();
      if(typeof window.getUsuarioAtual==='function')return window.getUsuarioAtual();
    }catch(error){}
    return null;
  }

  function can(area){
    try{return typeof window.userCan==='function'&&window.userCan(area)===true;}catch(error){return false;}
  }

  function pageName(button){
    var code=button&&button.getAttribute('onclick')||'';
    var match=code.match(/showPage\(['"]([^'"]+)['"]/i);
    if(match)return match[1];
    var text=String(button&&button.textContent||'').toLowerCase();
    return text.indexOf('hist')>=0?'historico':'';
  }

  function closeMenu(){
    try{
      if(window.IVMobileMenuControl&&typeof window.IVMobileMenuControl.close==='function'){
        window.IVMobileMenuControl.close();
        return;
      }
    }catch(error){}
    if(!document.body)return;
    document.body.classList.remove('iv-mobile-menu-user-open','iv-mobile-menu-open','mobile-menu-open');
    var button=document.getElementById('iv-mobile-menu-toggle');
    if(button)button.setAttribute('aria-label','Abrir menu');
  }

  function removeMessage(){
    var page=document.getElementById('iv-no-permission-page');
    if(page)page.remove();
  }

  function firstAllowed(){
    for(var i=0;i<ORDER.length;i++){
      var name=ORDER[i];
      if(document.getElementById('page-'+name)&&can(MAP[name]))return name;
    }
    return '';
  }

  function activate(name){
    var page=document.getElementById('page-'+name);
    if(!page)return false;
    document.querySelectorAll('.page').forEach(function(item){item.classList.remove('active');});
    document.querySelectorAll('.main-nav .mnav').forEach(function(button){button.classList.remove('active');});
    page.classList.add('active');
    document.querySelectorAll('.main-nav .mnav').forEach(function(button){if(pageName(button)===name)button.classList.add('active');});
    try{
      var renderers={dashboard:'renderDashboard',alunos:'renderAlunos',equipes:'renderEquipes',presenca:'initPresenca',usuarios:'renderUsuarios'};
      var fn=renderers[name];
      if(fn&&typeof window[fn]==='function')window[fn]();
    }catch(error){}
    closeMenu();
    return true;
  }

  function style(){
    if(document.getElementById('iv-permission-entry-recovery-style'))return;
    var element=document.createElement('style');
    element.id='iv-permission-entry-recovery-style';
    element.textContent='#iv-no-permission-page{display:none!important}body.iv-permission-entry-pending .main-nav,body.iv-permission-entry-pending .page{visibility:hidden!important;pointer-events:none!important}';
    document.head.appendChild(element);
  }

  function recover(){
    style();
    removeMessage();
    var user=profile();
    if(!user){
      if(document.body)document.body.classList.add('iv-permission-entry-pending');
      return;
    }
    if(document.body)document.body.classList.remove('iv-permission-entry-pending');
    var allowed=firstAllowed();
    if(!allowed){
      document.querySelectorAll('.page').forEach(function(item){item.classList.remove('active');});
      return;
    }
    var active=document.querySelector('.page.active');
    var activeName=active&&active.id?active.id.replace(/^page-/,''):'';
    if(!activeName||activeName==='iv-no-permission-page'||!can(MAP[activeName]))activate(allowed);
  }

  function schedule(){
    clearTimeout(timer);
    timer=setTimeout(recover,0);
    [40,120,300,700,1300,2400,4200].forEach(function(delay){setTimeout(recover,delay);});
  }

  function observe(){
    if(observer||!document.body)return;
    observer=new MutationObserver(function(records){
      if(records.some(function(record){return record.addedNodes&&record.addedNodes.length;}))schedule();
    });
    observer.observe(document.body,{childList:true});
  }

  function init(){
    style();
    closeMenu();
    if(document.body)document.body.classList.add('iv-permission-entry-pending');
    observe();
    schedule();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  document.addEventListener('firebase-ready',schedule);
  window.addEventListener('iv-concurrency-saved',schedule);
  window.addEventListener('pageshow',schedule);
  window.addEventListener('focus',schedule);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)schedule();});
})();
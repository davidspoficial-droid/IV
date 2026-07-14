// IV - navegação imediata, pré-aquecimento e cores dos módulos
(function(){
  'use strict';
  var mobile=window.matchMedia('(max-width:820px)');
  var cache=Object.create(null);
  var areas={dashboard:'dashboard_view',alunos:'alunos_view',equipes:'equipes_view',presenca:'presenca_view',exportar:'relatorios_view',usuarios:'usuarios_view'};

  function once(path){
    if(!cache[path]) cache[path]=import(path).catch(function(e){delete cache[path];throw e;});
    return cache[path];
  }
  function many(paths){return Promise.all(paths.map(once));}
  function students(){
    return many(['./iv-custom-improvements.js?v=20260714-2','./iv-phone-column-order-fix.js?v=20260714-2','./iv-student-rules-modal-fix.js?v=20260714-2','./iv-search-case-insensitive-fix.js?v=20260714-2','./iv-system-adjustments-202607.js?v=20260714-3'])
      .then(function(){return once('./iv-revision-core.js?v=20260714-2');})
      .then(function(){var f=['./iv-student-table-premium.js?v=20260714-2','./iv-student-id-column-fix.js?v=20260714-2','./iv-student-selection-ui-fix.js?v=20260714-2','./iv-advance-selective.js?v=20260714-3','./iv-history-trajectory-accordion-fix.js?v=20260714-3'];if(mobile.matches)f.push('./iv-mobile-students-page.js?v=20260714-4');return many(f);});
  }
  function presence(){return once('./iv-presence-filters-stable.js?v=20260714-2').then(function(){if(mobile.matches)return once('./iv-mobile-presence-page.js?v=20260714-5');});}
  function teams(){var f=['./iv-final-retention-history-login-teams.js?v=20260714-2'];if(mobile.matches)f.push('./iv-mobile-teams-page.js?v=20260714-4');return many(f);}
  function reports(){
    return many(['./iv-custom-improvements.js?v=20260714-2','./iv-report-compact-ui-fix.js?v=20260714-2','./iv-system-adjustments-202607.js?v=20260714-3','./iv-final-retention-history-login-teams.js?v=20260714-2','./iv-history-trajectory-accordion-fix.js?v=20260714-3'])
      .then(function(){return once('./iv-revision-core.js?v=20260714-2');})
      .then(function(){return once('./iv-reports-review-premium.js?v=20260714-2');})
      .then(function(){return once('./iv-report-page-cleanup.js?v=20260714-1');})
      .then(function(){return once('./iv-report-review-enhancer.js?v=20260714-1');});
  }
  function dashboard(){if(!mobile.matches)return Promise.resolve();return many(['./iv-mobile-hamburger-menu-fix.js?v=20260714-4','./iv-mobile-dashboard-premium-v2.js?v=20260714-2']);}
  var pages=Object.create(null);
  function ensure(name){
    if(pages[name])return pages[name];
    var p=name==='alunos'?students():name==='presenca'?presence():name==='equipes'?teams():name==='exportar'?reports():name==='dashboard'?dashboard():Promise.resolve();
    pages[name]=Promise.resolve(p).catch(function(e){delete pages[name];throw e;});
    return pages[name];
  }
  function refresh(name){
    try{
      if(name==='dashboard'&&typeof renderDashboard==='function')renderDashboard();
      else if(name==='alunos'&&typeof renderAlunos==='function')renderAlunos();
      else if(name==='equipes'&&typeof renderEquipes==='function')renderEquipes();
      else if(name==='presenca'&&typeof initPresenca==='function')initPresenca();
      else if(name==='usuarios'&&typeof renderUsuarios==='function'){renderUsuarios();if(typeof aplicarPerfilUsuario==='function')aplicarPerfilUsuario();}
    }catch(e){console.error('Erro ao atualizar página:',name,e);}
  }
  function activate(name,btn){
    var area=areas[name]||name;
    if(typeof userCan==='function'&&!userCan(area)){if(typeof toast==='function')toast('Você não tem permissão para acessar esta tela.',true);name='dashboard';btn=null;}
    var page=document.getElementById('page-'+name);if(!page)return'dashboard';
    document.querySelectorAll('.page').forEach(function(p){p.classList.remove('active');});
    document.querySelectorAll('.main-nav .mnav').forEach(function(b){b.classList.remove('active');});
    page.classList.add('active');
    if(btn&&btn.classList)btn.classList.add('active');else document.querySelectorAll('.main-nav .mnav').forEach(function(b){if((b.getAttribute('onclick')||'').indexOf("'"+name+"'")>=0)b.classList.add('active');});
    return name;
  }
  function patch(){
    if(typeof window.showPage!=='function'||window.showPage._ivInstant)return;
    var fast=function(name,btn){name=activate(name,btn);requestAnimationFrame(function(){ensure(name).then(function(){requestAnimationFrame(function(){refresh(name);});}).catch(function(){if(typeof toast==='function')toast('Não foi possível carregar todos os recursos desta página.',true);});});return true;};
    fast._ivInstant=true;window.showPage=fast;
  }
  function styles(){
    if(document.getElementById('iv-module-colors-style'))return;
    var s=document.createElement('style');s.id='iv-module-colors-style';s.textContent=
      '.badge[title^="1º Módulo"]{color:#BFEAFF!important;background:linear-gradient(135deg,rgba(47,128,237,.28),rgba(34,211,238,.10))!important;border-color:rgba(126,200,240,.52)!important}' +
      '.badge[title^="2º Módulo"]{color:#B9FFD2!important;background:linear-gradient(135deg,rgba(62,201,122,.27),rgba(126,219,168,.09))!important;border-color:rgba(62,201,122,.52)!important}' +
      '.badge[title^="3º Módulo"]{color:#FFE1E1!important;background:linear-gradient(135deg,rgba(224,85,85,.28),rgba(240,128,128,.09))!important;border-color:rgba(224,85,85,.54)!important}' +
      '#iv-mobile-alunos .iv-stu-card .iv-stu-mini-pill:first-child{color:var(--c,#7EC8F0)!important;border-color:var(--c,#7EC8F0)!important;background:color-mix(in srgb,var(--c,#7EC8F0) 14%,transparent)!important}';document.head.appendChild(s);
  }
  function idle(fn){if(typeof requestIdleCallback==='function')requestIdleCallback(fn,{timeout:850});else setTimeout(fn,220);}
  function warm(){var q=['alunos','presenca','equipes','exportar'],i=0;function next(){if(i>=q.length)return;ensure(q[i++]).catch(function(){}).then(function(){idle(next);});}idle(next);}
  function start(){styles();patch();warm();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
  window.addEventListener('pageshow',patch);
})();
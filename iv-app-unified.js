// IV - entrada unificada e carregamento sob demanda por página
(function(){
  'use strict';

  window.IV_UNIFIED_APP = true;

  var mobile = window.matchMedia('(max-width: 820px)');
  var loaded = Object.create(null);
  var originalShowPage = null;

  function importOnce(path){
    if(loaded[path]) return loaded[path];
    loaded[path] = import(path).catch(function(error){
      delete loaded[path];
      console.error('Erro ao carregar módulo IV:', path, error);
      throw error;
    });
    return loaded[path];
  }

  function parallel(paths){
    return Promise.all(paths.map(importOnce));
  }

  function studentGroup(){
    return parallel([
      './iv-custom-improvements.js?v=20260714-2',
      './iv-phone-column-order-fix.js?v=20260714-2',
      './iv-student-rules-modal-fix.js?v=20260714-2',
      './iv-search-case-insensitive-fix.js?v=20260714-2',
      './iv-system-adjustments-202607.js?v=20260714-3'
    ]).then(function(){
      return importOnce('./iv-revision-core.js?v=20260714-2');
    }).then(function(){
      var files = [
        './iv-student-table-premium.js?v=20260714-2',
        './iv-student-id-column-fix.js?v=20260714-2',
        './iv-student-selection-ui-fix.js?v=20260714-2',
        './iv-advance-selective.js?v=20260714-3',
        './iv-history-trajectory-accordion-fix.js?v=20260714-3'
      ];
      if(mobile.matches) files.push('./iv-mobile-students-page.js?v=20260714-4');
      return parallel(files);
    });
  }

  function presenceGroup(){
    return importOnce('./iv-presence-filters-stable.js?v=20260714-2').then(function(){
      if(mobile.matches) return importOnce('./iv-mobile-presence-page.js?v=20260714-5');
    });
  }

  function reportGroup(){
    return parallel([
      './iv-custom-improvements.js?v=20260714-2',
      './iv-report-compact-ui-fix.js?v=20260714-2',
      './iv-system-adjustments-202607.js?v=20260714-3',
      './iv-final-retention-history-login-teams.js?v=20260714-2',
      './iv-history-trajectory-accordion-fix.js?v=20260714-3'
    ]).then(function(){
      return importOnce('./iv-revision-core.js?v=20260714-2');
    }).then(function(){
      return importOnce('./iv-reports-review-premium.js?v=20260714-2');
    }).then(function(){
      return importOnce('./iv-report-page-cleanup.js?v=20260714-1');
    });
  }

  function teamGroup(){
    var files = ['./iv-final-retention-history-login-teams.js?v=20260714-2'];
    if(mobile.matches) files.push('./iv-mobile-teams-page.js?v=20260714-4');
    return parallel(files);
  }

  function dashboardGroup(){
    if(!mobile.matches) return Promise.resolve();
    return parallel([
      './iv-mobile-hamburger-menu-fix.js?v=20260714-4',
      './iv-mobile-dashboard-premium-v2.js?v=20260714-2'
    ]);
  }

  function ensurePage(name){
    if(name === 'alunos') return studentGroup();
    if(name === 'presenca') return presenceGroup();
    if(name === 'exportar') return reportGroup();
    if(name === 'equipes') return teamGroup();
    if(name === 'dashboard') return dashboardGroup();
    return Promise.resolve();
  }

  function pageElement(name){
    return document.getElementById('page-' + name);
  }

  function setBusy(name, busy){
    var page = pageElement(name);
    if(!page) return;
    page.classList.toggle('iv-module-loading', !!busy);
    var old = page.querySelector(':scope > .iv-module-loading-note');
    if(!busy){ if(old) old.remove(); return; }
    if(old) return;
    var note = document.createElement('div');
    note.className = 'iv-module-loading-note';
    note.textContent = 'Preparando recursos desta página...';
    page.insertBefore(note, page.firstChild);
  }

  function refreshPage(name){
    try{
      if(name === 'dashboard' && typeof window.renderDashboard === 'function') window.renderDashboard();
      else if(name === 'alunos' && typeof window.renderAlunos === 'function') window.renderAlunos();
      else if(name === 'equipes' && typeof window.renderEquipes === 'function') window.renderEquipes();
      else if(name === 'presenca' && typeof window.initPresenca === 'function') window.initPresenca();
      else if(name === 'usuarios' && typeof window.renderUsuarios === 'function') window.renderUsuarios();
    }catch(error){ console.error('Erro ao atualizar página IV:', name, error); }
  }

  function patchShowPage(){
    if(typeof window.showPage !== 'function' || window.showPage._ivUnified) return;
    originalShowPage = window.showPage;
    var wrapped = function(name, btn){
      var result = originalShowPage.apply(this, arguments);
      setBusy(name, true);
      ensurePage(name).then(function(){
        setBusy(name, false);
        refreshPage(name);
      }).catch(function(){
        setBusy(name, false);
        if(typeof window.toast === 'function') window.toast('Não foi possível carregar todos os recursos desta página.', true);
      });
      return result;
    };
    wrapped._ivUnified = true;
    window.showPage = wrapped;
  }

  function addStyles(){
    if(document.getElementById('iv-unified-app-style')) return;
    var style = document.createElement('style');
    style.id = 'iv-unified-app-style';
    style.textContent =
      '.iv-module-loading-note{margin:0 0 12px;padding:9px 12px;border:1px solid rgba(126,200,240,.16);border-radius:12px;background:rgba(126,200,240,.06);color:#9FC7E8;font-size:11px;font-weight:800}' +
      '@media(min-width:821px){#modal-aluno{padding:24px!important}#modal-aluno .modal{width:min(920px,calc(100vw - 56px))!important;max-width:920px!important;max-height:90vh!important;overflow-y:auto!important;overflow-x:hidden!important;padding:26px 28px!important;box-sizing:border-box!important}#modal-aluno .form-row{width:100%!important;max-width:100%!important;gap:14px!important;box-sizing:border-box!important}#modal-aluno .form-row:first-of-type{grid-template-columns:minmax(0,1.7fr) minmax(190px,.65fr)!important}#modal-aluno .form-row.tri{grid-template-columns:repeat(3,minmax(0,1fr))!important}#modal-aluno .form-row>div{min-width:0!important}#modal-aluno input,#modal-aluno select{width:100%!important;max-width:100%!important;min-width:0!important;box-sizing:border-box!important}#modal-aluno #al-nome{font-size:15px!important;padding-left:14px!important;padding-right:14px!important}#modal-aluno .modal-title{font-size:21px!important;margin-bottom:18px!important}}';
    document.head.appendChild(style);
  }

  function loadBase(){
    var files = [
      './iv-ui-auth-polish.js?v=20260714-2',
      './permissions-split-fix.js?v=3'
    ];
    if(mobile.matches) files.push('./iv-mobile-hamburger-menu-fix.js?v=20260714-4');
    return parallel(files);
  }

  function start(){
    addStyles();
    patchShowPage();
    loadBase();
    var active = document.querySelector('.page.active');
    var name = active && active.id ? active.id.replace(/^page-/, '') : 'dashboard';
    ensurePage(name).then(function(){ refreshPage(name); });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true});
  else start();

  window.addEventListener('pageshow', function(){ patchShowPage(); });
  if(mobile.addEventListener) mobile.addEventListener('change', function(){
    if(mobile.matches) importOnce('./iv-mobile-hamburger-menu-fix.js?v=20260714-4');
    var active = document.querySelector('.page.active');
    var name = active && active.id ? active.id.replace(/^page-/, '') : 'dashboard';
    ensurePage(name).then(function(){ refreshPage(name); });
  });
})();

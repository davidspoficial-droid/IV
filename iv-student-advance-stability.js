// IV - estabilidade visual da tabela e do avanço seletivo
(function(){
  'use strict';

  var STYLE_ID = 'iv-student-advance-stability-style';
  var selectionState = new Map();

  function ready(fn){
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, {once:true});
    else fn();
  }

  function ensureStyle(){
    if(document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #page-alunos .tbl-wrap.iv-table-stabilizing table{visibility:hidden!important}

      #modal-avancar .modal{
        width:min(920px,calc(100vw - 32px))!important;
        max-width:920px!important;
        max-height:92vh!important;
        overflow-y:auto!important;
        overflow-x:hidden!important;
        padding:24px!important;
        box-sizing:border-box!important;
      }
      #modal-avancar .modal>*{max-width:100%;box-sizing:border-box}
      #modal-avancar .form-row{grid-template-columns:minmax(0,1fr)!important}
      #modal-avancar #iv-advance-selective{
        width:100%!important;
        max-width:100%!important;
        min-width:0!important;
        overflow:hidden!important;
        box-sizing:border-box!important;
      }
      #modal-avancar .iv-advance-top{
        width:100%!important;
        grid-template-columns:minmax(0,1.35fr) minmax(0,1fr) minmax(0,1fr) auto!important;
        gap:10px!important;
      }
      #modal-avancar .iv-advance-top>*{min-width:0!important;max-width:100%!important}
      #modal-avancar .iv-advance-top input,
      #modal-avancar .iv-advance-top select,
      #modal-avancar .iv-advance-top button{width:100%!important;max-width:100%!important;min-width:0!important;box-sizing:border-box!important}
      #modal-avancar #iv-advance-all{width:auto!important;white-space:nowrap!important;padding-left:14px!important;padding-right:14px!important}
      #modal-avancar .iv-advance-list{width:100%!important;max-width:100%!important;overflow-y:auto!important;overflow-x:hidden!important}
      #modal-avancar .iv-advance-item{
        width:100%!important;
        max-width:100%!important;
        min-width:0!important;
        grid-template-columns:auto minmax(0,1fr) minmax(0,240px)!important;
        box-sizing:border-box!important;
      }
      #modal-avancar .iv-advance-name,
      #modal-avancar .iv-advance-meta{min-width:0!important;max-width:100%!important;overflow:hidden!important;text-overflow:ellipsis!important}
      #modal-avancar .modal>div:last-child{display:flex!important;flex-wrap:wrap!important;max-width:100%!important}
      #modal-avancar .modal>div:last-child .btn{min-width:0!important;white-space:normal!important;justify-content:center!important}

      @media(max-width:820px){
        #modal-avancar{padding:6px!important;align-items:center!important}
        #modal-avancar .modal{
          width:calc(100vw - 12px)!important;
          max-width:none!important;
          max-height:94dvh!important;
          padding:15px 13px!important;
          border-radius:22px!important;
        }
        #modal-avancar .modal-title{font-size:17px!important;line-height:1.25!important}
        #modal-avancar .iv-advance-top{grid-template-columns:1fr!important;gap:8px!important}
        #modal-avancar #iv-advance-all{width:100%!important;white-space:normal!important}
        #modal-avancar .iv-advance-list{max-height:36dvh!important}
        #modal-avancar .iv-advance-item{grid-template-columns:auto minmax(0,1fr)!important;padding:9px!important}
        #modal-avancar .iv-advance-meta{grid-column:2!important;white-space:normal!important;line-height:1.35!important}
        #modal-avancar .modal>div:last-child{display:grid!important;grid-template-columns:1fr 1fr!important;gap:7px!important;margin-top:12px!important}
        #modal-avancar .modal>div:last-child .btn{width:100%!important;height:auto!important;min-height:41px!important;padding:8px 9px!important;font-size:11px!important}
        #modal-avancar .modal>div:last-child .btn:last-child{grid-column:1/-1!important}
      }
      @media(max-width:390px){
        #modal-avancar .modal>div:last-child{grid-template-columns:1fr!important}
        #modal-avancar .modal>div:last-child .btn:last-child{grid-column:auto!important}
      }
    `;
    document.head.appendChild(style);
  }

  function premiumTableReady(){
    var body = document.getElementById('tb-alunos');
    if(!body) return true;
    var table = body.closest('table');
    var header = table && table.querySelector('thead tr');
    if(!header || !header.querySelector('[data-col="acoes"]')) return false;
    var rows = Array.prototype.slice.call(body.querySelectorAll('tr'));
    if(!rows.length) return true;
    return rows.every(function(row){
      if(row.querySelector('td[data-col]')) return true;
      var cell = row.querySelector('td[colspan]');
      return !!cell && String(cell.getAttribute('colspan')) === '10';
    });
  }

  function revealTable(wrap){
    if(wrap) wrap.classList.remove('iv-table-stabilizing');
  }

  function waitForPremiumTable(wrap, attempt){
    if(!wrap || !wrap.isConnected) return;
    if(premiumTableReady() || attempt >= 14){
      revealTable(wrap);
      return;
    }
    window.setTimeout(function(){ waitForPremiumTable(wrap, attempt + 1); }, 18);
  }

  function patchStudentRender(){
    var current = window.renderAlunos;
    if(typeof current !== 'function' || current._ivStableColumns) return;

    var wrapped = function(){
      var body = document.getElementById('tb-alunos');
      var wrap = body && body.closest('.tbl-wrap');
      if(wrap) wrap.classList.add('iv-table-stabilizing');
      var result;
      try{
        result = current.apply(this, arguments);
      }finally{
        window.setTimeout(function(){ waitForPremiumTable(wrap, 0); }, 0);
      }
      return result;
    };
    wrapped._ivStableColumns = true;
    window.renderAlunos = wrapped;
  }

  function advanceChecks(){
    return Array.prototype.slice.call(document.querySelectorAll('#iv-advance-list .iv-advance-check'));
  }

  function snapshotAdvanceSelection(){
    advanceChecks().forEach(function(check){
      selectionState.set(Number(check.value), !!check.checked);
    });
  }

  function applyAdvanceSelection(){
    advanceChecks().forEach(function(check){
      var id = Number(check.value);
      if(!selectionState.has(id)) return;
      var desired = selectionState.get(id);
      if(check.checked === desired) return;
      check.checked = desired;
      check.dispatchEvent(new Event('change', {bubbles:true}));
    });
  }

  function applyAfterSearch(){
    window.setTimeout(applyAdvanceSelection, 105);
    window.setTimeout(applyAdvanceSelection, 165);
    window.setTimeout(applyAdvanceSelection, 240);
  }

  function patchAdvanceOpen(){
    var current = window.openAvancarModuloModal;
    if(typeof current !== 'function' || current._ivAdvanceStableOpen) return;

    var wrapped = function(){
      selectionState.clear();
      var result = current.apply(this, arguments);
      window.setTimeout(snapshotAdvanceSelection, 130);
      window.setTimeout(snapshotAdvanceSelection, 230);
      return result;
    };
    wrapped._ivAdvanceStableOpen = true;
    wrapped._ivSelective = true;
    window.openAvancarModuloModal = wrapped;
  }

  function bindAdvanceSelection(){
    if(document.documentElement.dataset.ivAdvanceSelectionStableBound) return;
    document.documentElement.dataset.ivAdvanceSelectionStableBound = '1';

    document.addEventListener('change', function(event){
      if(!event.target) return;
      if(event.target.classList && event.target.classList.contains('iv-advance-check')){
        selectionState.set(Number(event.target.value), !!event.target.checked);
        return;
      }
      if(event.target.matches && event.target.matches('#avancar-origem,#iv-advance-review,#iv-advance-turma')){
        selectionState.clear();
        window.setTimeout(snapshotAdvanceSelection, 130);
        window.setTimeout(snapshotAdvanceSelection, 230);
      }
    }, true);

    document.addEventListener('input', function(event){
      if(!event.target || event.target.id !== 'iv-advance-search') return;
      // Captura as caixas antes de o filtro substituir a lista.
      snapshotAdvanceSelection();
      applyAfterSearch();
    }, true);

    document.addEventListener('click', function(event){
      var button = event.target && event.target.closest && event.target.closest('#iv-advance-all');
      if(!button) return;
      window.setTimeout(snapshotAdvanceSelection, 0);
      window.setTimeout(snapshotAdvanceSelection, 80);
    }, true);
  }

  function init(){
    ensureStyle();
    patchStudentRender();
    patchAdvanceOpen();
    bindAdvanceSelection();
  }

  ready(function(){
    init();
    window.setTimeout(init, 500);
    window.setTimeout(init, 1400);
    window.setTimeout(init, 2600);
  });
})();
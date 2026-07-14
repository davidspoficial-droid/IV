// IV - botão de exclusão em massa depende somente de checkboxes marcadas e visíveis
(function(){
  'use strict';

  var STYLE_ID = 'iv-student-selection-ui-fix-style';
  var mql = window.matchMedia('(max-width: 820px)');

  function ready(fn){
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, {once:true});
    else fn();
  }

  function ensureStyle(){
    if(document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #page-alunos #btn-excluir-sel{display:none!important}
      #page-alunos.iv-has-student-selection #btn-excluir-sel{display:inline-flex!important}

      @media(max-width:820px){
        #iv-mobile-alunos [data-act="removerMarcados"]{display:none!important}
        #iv-mobile-alunos .iv-stu-actions-row{grid-template-columns:repeat(2,minmax(0,1fr))!important}
        #iv-mobile-alunos.iv-has-student-selection [data-act="removerMarcados"]{display:flex!important}
        #iv-mobile-alunos.iv-has-student-selection .iv-stu-actions-row{grid-template-columns:repeat(3,minmax(0,1fr))!important}
      }
    `;
    document.head.appendChild(style);
  }

  function checkedDesktop(){
    if(mql.matches) return [];
    return Array.prototype.slice.call(document.querySelectorAll('#tb-alunos .chk-aluno:checked')).filter(function(check){
      var row = check.closest('tr');
      return row && row.isConnected && row.style.display !== 'none';
    });
  }

  function checkedMobile(){
    if(!mql.matches) return [];
    return Array.prototype.slice.call(document.querySelectorAll('#iv-mobile-alunos .iv-stu-check:checked')).filter(function(check){
      var card = check.closest('.iv-stu-card');
      return card && card.isConnected && card.style.display !== 'none';
    });
  }

  function syncDesktop(){
    var page = document.getElementById('page-alunos');
    if(!page) return;

    var checks = checkedDesktop();
    var count = checks.length;
    page.classList.toggle('iv-has-student-selection', count > 0);

    var button = document.getElementById('btn-excluir-sel');
    var counter = document.getElementById('count-sel');
    if(counter) counter.textContent = String(count);
    if(button){
      button.disabled = count === 0;
      button.setAttribute('aria-hidden', count > 0 ? 'false' : 'true');
      button.tabIndex = count > 0 ? 0 : -1;
    }

    var all = document.getElementById('chk-all');
    if(all){
      var visible = Array.prototype.slice.call(document.querySelectorAll('#tb-alunos .chk-aluno'));
      all.checked = visible.length > 0 && visible.every(function(check){ return check.checked; });
      all.indeterminate = !all.checked && visible.some(function(check){ return check.checked; });
    }
  }

  function syncMobile(){
    var box = document.getElementById('iv-mobile-alunos');
    if(!box) return;

    var count = checkedMobile().length;
    box.classList.toggle('iv-has-student-selection', count > 0);

    var button = box.querySelector('[data-act="removerMarcados"]');
    if(button){
      button.disabled = count === 0;
      button.setAttribute('aria-hidden', count > 0 ? 'false' : 'true');
      button.tabIndex = count > 0 ? 0 : -1;
      button.innerHTML = '🗑️ Excluir ('+count+')';
    }
  }

  function sync(){
    ensureStyle();
    syncDesktop();
    syncMobile();
  }

  function schedule(){
    window.setTimeout(sync, 0);
    window.setTimeout(sync, 120);
    window.setTimeout(sync, 260);
  }

  function patchUpdateSelection(){
    var current = window.updateSelUI;
    if(typeof current !== 'function' || current._ivVisibleSelectionOnly) return;

    var wrapped = function(){
      var result = current.apply(this, arguments);
      schedule();
      return result;
    };
    wrapped._ivVisibleSelectionOnly = true;
    window.updateSelUI = wrapped;
  }

  function patchRender(){
    var current = window.renderAlunos;
    if(typeof current !== 'function' || current._ivSelectionUiSchedule) return;

    var wrapped = function(){
      var result = current.apply(this, arguments);
      schedule();
      return result;
    };
    wrapped._ivSelectionUiSchedule = true;
    window.renderAlunos = wrapped;
  }

  function bind(){
    if(document.documentElement.dataset.ivStudentSelectionUiBound) return;
    document.documentElement.dataset.ivStudentSelectionUiBound = '1';

    document.addEventListener('input', function(event){
      if(event.target && (event.target.id === 'busca-aluno' || event.target.id === 'iv-stu-search')) schedule();
    }, true);

    document.addEventListener('change', function(event){
      if(!event.target) return;
      if(event.target.matches('.chk-aluno,.iv-stu-check,#chk-all,#filtro-equipe,#filtro-turma,#filtro-revisao,#iv-stu-equipe,#iv-stu-turma,#iv-stu-revisao')) schedule();
    }, true);

    document.addEventListener('click', function(event){
      if(event.target && event.target.closest('#page-alunos button,#iv-mobile-alunos button')) schedule();
    }, true);

    window.addEventListener('pageshow', schedule);
    if(mql.addEventListener) mql.addEventListener('change', schedule);
    else if(mql.addListener) mql.addListener(schedule);
  }

  function init(){
    ensureStyle();
    patchUpdateSelection();
    patchRender();
    bind();
    schedule();
  }

  ready(function(){
    init();
    window.setTimeout(init, 500);
    window.setTimeout(init, 1400);
    window.setTimeout(init, 2600);
  });
})();
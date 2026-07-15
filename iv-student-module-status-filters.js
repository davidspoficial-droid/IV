// IV - filtros persistentes de módulo e situação da tabela de alunos
(function(){
  'use strict';
  if(window.__IV_STUDENT_EXTRA_FILTERS__) return;
  window.__IV_STUDENT_EXTRA_FILTERS__ = true;

  var tableObserver = null;
  var observedBody = null;
  var filterState = {module:'', status:'', initialized:false};

  function db(){
    try{return typeof DB !== 'undefined' ? DB : null;}catch(error){return null;}
  }

  function situation(student){
    return String(student && student.situacao || 'ATIVO').trim().toUpperCase();
  }

  function controls(){
    return {
      module:document.getElementById('filtro-modulo-aluno'),
      status:document.getElementById('filtro-situacao-aluno')
    };
  }

  function rememberState(){
    var fields = controls();
    if(fields.module) filterState.module = fields.module.value || '';
    if(fields.status) filterState.status = fields.status.value || '';
    filterState.initialized = true;
  }

  function restoreState(){
    var fields = controls();
    if(fields.module && fields.module.value !== filterState.module) fields.module.value = filterState.module;
    if(fields.status && fields.status.value !== filterState.status) fields.status.value = filterState.status;
  }

  function addControls(){
    var search = document.getElementById('busca-aluno');
    if(!search || !search.parentElement) return false;
    var bar = search.parentElement;
    bar.classList.add('iv-student-filter-bar');

    if(!document.getElementById('filtro-modulo-aluno')){
      var moduleSelect = document.createElement('select');
      moduleSelect.id = 'filtro-modulo-aluno';
      moduleSelect.title = 'Módulo';
      moduleSelect.setAttribute('aria-label','Filtrar por módulo');
      moduleSelect.innerHTML = '<option value="">Todos os módulos</option><option value="1">1º Módulo</option><option value="2">2º Módulo</option><option value="3">3º Módulo</option>';
      bar.appendChild(moduleSelect);
    }

    if(!document.getElementById('filtro-situacao-aluno')){
      var statusSelect = document.createElement('select');
      statusSelect.id = 'filtro-situacao-aluno';
      statusSelect.title = 'Situação';
      statusSelect.setAttribute('aria-label','Filtrar por situação');
      statusSelect.innerHTML = '<option value="">Todas as situações</option><option value="ATIVO">Ativos</option><option value="DESISTENTE">Desistentes</option><option value="INATIVO">Inativos</option>';
      bar.appendChild(statusSelect);
    }

    if(!filterState.initialized) rememberState();
    else restoreState();
    return true;
  }

  function clearSelection(row){
    var checkbox = row.querySelector('.chk-aluno[data-id]');
    if(!checkbox || !checkbox.checked) return;
    checkbox.checked = false;
    try{
      if(typeof window.ivSafeToggleStudent === 'function') window.ivSafeToggleStudent(Number(checkbox.dataset.id),checkbox);
    }catch(error){}
  }

  function apply(){
    if(!addControls()) return;
    var data = db();
    var body = document.getElementById('tb-alunos');
    if(!data || !body) return;
    observeBody();
    restoreState();

    var moduleValue = filterState.module;
    var statusValue = filterState.status;
    var byId = Object.create(null);
    (data.alunos || []).forEach(function(student){byId[String(student.id)] = student;});

    var oldEmpty = document.getElementById('iv-extra-filter-empty');
    var visible = 0;
    var dataRows = 0;

    Array.prototype.forEach.call(body.querySelectorAll('tr'),function(row){
      if(row.id === 'iv-extra-filter-empty') return;
      var checkbox = row.querySelector('.chk-aluno[data-id]');
      if(!checkbox) return;
      dataRows += 1;
      var student = byId[String(checkbox.dataset.id)];
      if(!student) return;
      var show = (!moduleValue || String(student.modulo || '1') === moduleValue) && (!statusValue || situation(student) === statusValue);
      row.style.display = show ? '' : 'none';
      row.hidden = !show;
      if(show) visible += 1;
      else clearSelection(row);
    });

    if(dataRows && !visible){
      if(!oldEmpty){
        var empty = document.createElement('tr');
        empty.id = 'iv-extra-filter-empty';
        empty.innerHTML = '<td colspan="10" style="text-align:center;padding:32px;color:var(--muted)">Nenhum aluno encontrado para estes filtros</td>';
        body.appendChild(empty);
      }
    }else if(oldEmpty){
      oldEmpty.remove();
    }
    try{if(typeof window.updateSelUI === 'function') window.updateSelUI();}catch(error){}
  }

  function schedule(){
    [0,80,180,350,700,1200,1900].forEach(function(delay){
      window.setTimeout(function(){restoreState();apply();},delay);
    });
  }

  function observeBody(){
    var body = document.getElementById('tb-alunos');
    if(!body || observedBody === body) return;
    if(tableObserver) tableObserver.disconnect();
    observedBody = body;
    tableObserver = new MutationObserver(function(records){
      var relevant = records.some(function(record){
        return Array.prototype.some.call(record.addedNodes,function(node){return node && node.id !== 'iv-extra-filter-empty';}) ||
          Array.prototype.some.call(record.removedNodes,function(node){return node && node.id !== 'iv-extra-filter-empty';});
      });
      if(relevant) schedule();
    });
    tableObserver.observe(body,{childList:true});
  }

  function patchRender(){
    var current = window.renderAlunos;
    if(typeof current !== 'function' || current._ivExtraStudentFilters) return;
    var wrapped = function(){
      var result = current.apply(this,arguments);
      schedule();
      return result;
    };
    wrapped._ivExtraStudentFilters = true;
    if(current._ivStudentPremium) wrapped._ivStudentPremium = current._ivStudentPremium;
    window.renderAlunos = wrapped;
  }

  function patchSaveAction(name){
    var current = window[name];
    if(typeof current !== 'function' || current._ivPersistentStudentFilters) return;
    var wrapped = function(){
      rememberState();
      var result;
      try{
        result = current.apply(this,arguments);
      }finally{
        schedule();
      }
      if(result && typeof result.finally === 'function') result.finally(schedule);
      return result;
    };
    wrapped._ivPersistentStudentFilters = true;
    window[name] = wrapped;
  }

  function patchSaveActions(){
    patchSaveAction('salvarAluno');
    patchSaveAction('importarAlunos');
    patchSaveAction('marcarDesistente');
    patchSaveAction('reativarAluno');
  }

  function style(){
    if(document.getElementById('iv-extra-student-filters-style')) return;
    var element = document.createElement('style');
    element.id = 'iv-extra-student-filters-style';
    element.textContent = '#page-alunos #filtro-modulo-aluno,#page-alunos #filtro-situacao-aluno{width:170px;flex:0 0 170px}@media(max-width:820px){#page-alunos #filtro-modulo-aluno,#page-alunos #filtro-situacao-aluno{width:100%;flex:1 1 100%}}';
    document.head.appendChild(element);
  }

  function bind(){
    if(document.documentElement.dataset.ivExtraStudentFilters) return;
    document.documentElement.dataset.ivExtraStudentFilters = '1';
    document.addEventListener('change',function(event){
      if(!event.target) return;
      if(event.target.id === 'filtro-modulo-aluno' || event.target.id === 'filtro-situacao-aluno'){
        rememberState();
        apply();
      }else if(event.target.id === 'filtro-equipe' || event.target.id === 'filtro-turma' || event.target.id === 'filtro-revisao'){
        schedule();
      }
    },true);
    document.addEventListener('input',function(event){
      if(event.target && event.target.id === 'busca-aluno') schedule();
    },true);
  }

  function init(){
    style();
    addControls();
    observeBody();
    patchRender();
    patchSaveActions();
    bind();
    schedule();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
  window.setTimeout(init,500);
  window.setTimeout(init,1300);
  window.setTimeout(init,2400);
})();
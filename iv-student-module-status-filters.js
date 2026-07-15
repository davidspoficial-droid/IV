// IV - filtros adicionais da tabela de alunos
(function(){
  'use strict';
  if(window.__IV_STUDENT_EXTRA_FILTERS__) return;
  window.__IV_STUDENT_EXTRA_FILTERS__ = true;

  function db(){
    try{return typeof DB !== 'undefined' ? DB : null;}catch(error){return null;}
  }

  function situation(student){
    return String(student && student.situacao || 'ATIVO').trim().toUpperCase();
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

    var moduleValue = document.getElementById('filtro-modulo-aluno').value;
    var statusValue = document.getElementById('filtro-situacao-aluno').value;
    var byId = Object.create(null);
    (data.alunos || []).forEach(function(student){byId[String(student.id)] = student;});

    var oldEmpty = document.getElementById('iv-extra-filter-empty');
    if(oldEmpty) oldEmpty.remove();
    var visible = 0;
    var dataRows = 0;

    Array.prototype.forEach.call(body.querySelectorAll('tr'),function(row){
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
      var empty = document.createElement('tr');
      empty.id = 'iv-extra-filter-empty';
      empty.innerHTML = '<td colspan="10" style="text-align:center;padding:32px;color:var(--muted)">Nenhum aluno encontrado para estes filtros</td>';
      body.appendChild(empty);
    }
    try{if(typeof window.updateSelUI === 'function') window.updateSelUI();}catch(error){}
  }

  function schedule(){
    window.setTimeout(apply,0);
    window.setTimeout(apply,100);
    window.setTimeout(apply,220);
  }

  function patch(){
    var current = window.renderAlunos;
    if(typeof current !== 'function' || current._ivExtraStudentFilters) return;
    var wrapped = function(){var result=current.apply(this,arguments);schedule();return result;};
    wrapped._ivExtraStudentFilters = true;
    if(current._ivStudentPremium) wrapped._ivStudentPremium = current._ivStudentPremium;
    window.renderAlunos = wrapped;
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
      if(event.target.id === 'filtro-modulo-aluno' || event.target.id === 'filtro-situacao-aluno') apply();
      else if(event.target.id === 'filtro-equipe' || event.target.id === 'filtro-turma' || event.target.id === 'filtro-revisao') schedule();
    },true);
    document.addEventListener('input',function(event){if(event.target && event.target.id === 'busca-aluno') schedule();},true);
  }

  function init(){style();addControls();patch();bind();schedule();}
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
  window.setTimeout(init,600);
  window.setTimeout(init,1600);
})();
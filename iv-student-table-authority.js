// IV - autoridade final da tabela de alunos
(function(){
  'use strict';
  if(window.__IV_STUDENT_TABLE_AUTHORITY__) return;
  window.__IV_STUDENT_TABLE_AUTHORITY__ = true;

  var rendering = false;
  var scheduled = false;
  var observer = null;
  var observedTable = null;
  var authorityRender = null;
  var previousRender = null;

  function data(){
    try{return typeof DB !== 'undefined' ? DB : null;}catch(error){return null;}
  }

  function review(){
    return window.IVReview || {
      key:function(){return '';},
      label:function(){return 'Sem revisão';},
      match:function(){return true;}
    };
  }

  function escapeHtml(value){
    return String(value == null ? '' : value).replace(/[&<>"']/g,function(char){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char];
    });
  }

  function normalize(value){
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  }

  function phone(student){
    return student && (student.telefone || student.celular || student.whatsapp || student.contato || student.phone) || '';
  }

  function teamName(student, db){
    var team = (db.equipes || []).find(function(item){return String(item.id) === String(student.equipeId);});
    return team ? String(team.nome || '') : '';
  }

  function moduleName(student){
    var number = String(student && student.modulo || '1');
    try{return MODULOS[number] ? MODULOS[number].nome : number + 'º Módulo';}
    catch(error){return number + 'º Módulo';}
  }

  function classForStatus(status){
    if(status === 'ATIVO') return 'badge-g';
    if(status === 'DESISTENTE' || status === 'INATIVO') return 'badge-r';
    return 'badge-p';
  }

  function selectedIds(){
    var ids = new Set();
    document.querySelectorAll('#tb-alunos .chk-aluno[data-id]:checked').forEach(function(checkbox){
      ids.add(String(checkbox.dataset.id));
    });
    return ids;
  }

  function filteredStudents(db){
    var query = normalize((document.getElementById('busca-aluno') || {}).value || '');
    var team = (document.getElementById('filtro-equipe') || {}).value || '';
    var turma = (document.getElementById('filtro-turma') || {}).value || '';
    var revision = (document.getElementById('filtro-revisao') || {}).value || '';
    var module = (document.getElementById('filtro-modulo-aluno') || {}).value || '';
    var status = String((document.getElementById('filtro-situacao-aluno') || {}).value || '').toUpperCase();
    var reviewCore = review();

    return (db.alunos || []).slice().sort(function(a,b){
      return String(a.nome || '').localeCompare(String(b.nome || ''),'pt-BR');
    }).filter(function(student){
      var studentStatus = String(student.situacao || 'ATIVO').toUpperCase();
      var haystack = normalize([
        student.nome,
        student.inscricao,
        phone(student),
        teamName(student,db),
        moduleName(student),
        student.turma === 'quinta' ? 'Quinta-feira' : student.turma === 'sabado' ? 'Sábado' : 'Sem turma',
        reviewCore.label(student),
        studentStatus
      ].join(' '));

      return (!query || haystack.indexOf(query) >= 0) &&
        (!team || String(student.equipeId || '') === String(team)) &&
        (!turma || String(student.turma || '') === String(turma)) &&
        reviewCore.match(student,revision) &&
        (!module || String(student.modulo || '1') === String(module)) &&
        (!status || studentStatus === status);
    });
  }

  function rowHtml(student, db, selected){
    var team = teamName(student,db);
    var status = String(student.situacao || 'ATIVO').toUpperCase();
    var number = String(phone(student)).replace(/\D/g,'');
    var reviewCore = review();
    var revision = reviewCore.key(student);
    var checked = selected.has(String(student.id)) ? ' checked' : '';
    var turma = student.turma === 'quinta'
      ? '<span class="badge" style="background:rgba(74,144,217,.15);color:#7EC8F0;font-size:10px">📅 Quinta</span>'
      : student.turma === 'sabado'
        ? '<span class="badge" style="background:rgba(155,89,182,.15);color:#C39BD3;font-size:10px">📅 Sábado</span>'
        : '<span class="iv-review-muted">—</span>';

    return '<tr class="'+(checked ? 'row-sel' : '')+'">' +
      '<td data-col="select" style="text-align:center"><input type="checkbox"'+checked+' class="chk-aluno" data-id="'+escapeHtml(student.id)+'" onchange="ivSafeToggleStudent('+Number(student.id)+',this)" style="cursor:pointer;accent-color:var(--blue)"></td>' +
      '<td data-col="inscricao">'+escapeHtml(student.inscricao || '—')+'</td>' +
      '<td data-col="nome"><strong>'+escapeHtml(student.nome || '')+'</strong></td>' +
      '<td data-col="telefone" class="iv-phone-cell">'+(phone(student) ? '<a href="tel:'+escapeHtml(number)+'">'+escapeHtml(phone(student))+'</a>' : '<span class="iv-review-muted">—</span>')+'</td>' +
      '<td data-col="equipe">'+(team ? '<span class="badge badge-b" title="'+escapeHtml(team)+'">'+escapeHtml(team)+'</span>' : '<span class="iv-review-muted">—</span>')+'</td>' +
      '<td data-col="modulo"><span class="badge badge-p" title="'+escapeHtml(moduleName(student))+'">'+escapeHtml(moduleName(student))+'</span></td>' +
      '<td data-col="turma">'+turma+'</td>' +
      '<td data-col="revisao">'+(revision ? '<span class="iv-review-badge">'+escapeHtml(reviewCore.label(student).replace('Revisão ',''))+'</span>' : '<span class="iv-review-muted">Sem revisão</span>')+'</td>' +
      '<td data-col="situacao"><span class="badge '+classForStatus(status)+'">'+escapeHtml(status)+'</span></td>' +
      '<td data-col="acoes"><div>' +
        (status !== 'DESISTENTE' ? '<button class="btn btn-red btn-xs" onclick="marcarDesistente('+Number(student.id)+')">📉</button>' : '<button class="btn btn-green btn-xs" onclick="reativarAluno('+Number(student.id)+')">↩️</button>') +
        '<button class="btn btn-ghost btn-xs" onclick="openAlunoModal('+Number(student.id)+')">✏️</button>' +
        '<button class="btn btn-red btn-xs" onclick="deletarAluno('+Number(student.id)+')">🗑️</button>' +
      '</div></td>' +
    '</tr>';
  }

  function renderFinalTable(){
    if(rendering) return;
    var db = data();
    var body = document.getElementById('tb-alunos');
    if(!db || !body) return;
    var table = body.closest('table');
    var header = table && table.querySelector('thead tr');
    if(!table || !header) return;

    rendering = true;
    try{
      var selected = selectedIds();
      header.innerHTML = '<th data-col="select"><input type="checkbox" id="chk-all" onchange="toggleCheckAll(this)" style="cursor:pointer;accent-color:var(--blue)"></th>' +
        '<th data-col="inscricao">Nº Insc.</th>' +
        '<th data-col="nome">Nome</th>' +
        '<th data-col="telefone">Telefone</th>' +
        '<th data-col="equipe">Equipe</th>' +
        '<th data-col="modulo">Módulo</th>' +
        '<th data-col="turma">Turma</th>' +
        '<th data-col="revisao">Revisão</th>' +
        '<th data-col="situacao">Situação</th>' +
        '<th data-col="acoes">Ações</th>';

      var students = filteredStudents(db);
      body.innerHTML = students.length
        ? students.map(function(student){return rowHtml(student,db,selected);}).join('')
        : '<tr><td colspan="10" style="text-align:center;padding:32px;color:var(--muted)">Nenhum aluno encontrado</td></tr>';

      try{if(typeof window.updateSelUI === 'function') window.updateSelUI();}catch(error){}
    }finally{
      rendering = false;
    }
  }

  function schedule(){
    if(scheduled) return;
    scheduled = true;
    Promise.resolve().then(function(){
      scheduled = false;
      renderFinalTable();
    });
    window.setTimeout(renderFinalTable,90);
    window.setTimeout(renderFinalTable,240);
  }

  function tableIsCorrect(){
    var body = document.getElementById('tb-alunos');
    var table = body && body.closest('table');
    var header = table && table.querySelector('thead tr');
    if(!header || !header.querySelector('[data-col="revisao"]')) return false;
    if(header.children.length !== 10) return false;
    return !Array.prototype.some.call(body.querySelectorAll('tr'),function(row){
      return row.querySelector('.chk-aluno[data-id]') && !row.querySelector('[data-col="revisao"]');
    });
  }

  function observeTable(){
    var body = document.getElementById('tb-alunos');
    var table = body && body.closest('table');
    if(!table || observedTable === table) return;
    if(observer) observer.disconnect();
    observedTable = table;
    observer = new MutationObserver(function(){
      if(!rendering && !tableIsCorrect()) schedule();
    });
    observer.observe(table,{childList:true,subtree:true});
  }

  function installAuthority(){
    var current = window.renderAlunos;
    if(typeof current !== 'function') return;
    if(current === authorityRender || current._ivStudentTableAuthority) return;
    previousRender = current;
    authorityRender = function(){
      var result = previousRender.apply(this,arguments);
      schedule();
      return result;
    };
    authorityRender._ivStudentTableAuthority = true;
    window.renderAlunos = authorityRender;
  }

  function patchAction(name){
    var current = window[name];
    if(typeof current !== 'function' || current._ivStudentTableAuthorityAction) return;
    var wrapped = function(){
      var result = current.apply(this,arguments);
      schedule();
      if(result && typeof result.finally === 'function') result.finally(schedule);
      return result;
    };
    wrapped._ivStudentTableAuthorityAction = true;
    window[name] = wrapped;
  }

  function init(){
    installAuthority();
    observeTable();
    ['salvarAluno','importarAlunos','marcarDesistente','reativarAluno','deletarAluno'].forEach(patchAction);
    schedule();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
  window.setTimeout(init,500);
  window.setTimeout(init,1400);
  window.setTimeout(init,2800);
  window.addEventListener('pageshow',init);
})();
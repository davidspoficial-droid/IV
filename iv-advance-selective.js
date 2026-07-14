// IV - avanço seletivo de módulo por aluno, revisão, turma e pesquisa por nome
(function(){
  'use strict';

  var chosen = new Set();
  var searchTimer = null;

  function ready(fn){
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, {once:true});
    else fn();
  }

  function D(){
    try { return typeof DB !== 'undefined' ? DB : null; }
    catch(e){ return null; }
  }

  function R(){
    return window.IVReview || {
      label:function(){ return 'Sem revisão'; },
      options:function(){ return '<option value="">Todas as revisões</option>'; },
      match:function(){ return true; }
    };
  }

  function esc(value){
    return String(value == null ? '' : value).replace(/[&<>"']/g, function(char){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char];
    });
  }

  function normalize(value){
    return String(value || '')
      .trim()
      .replace(/\s+/g, ' ')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('pt-BR');
  }

  function turmaLabel(value){
    if(value === 'quinta') return 'Quinta-feira';
    if(value === 'sabado') return 'Sábado';
    return 'Sem turma';
  }

  function css(){
    if(document.getElementById('iv-advance-selective-style')) return;
    var style = document.createElement('style');
    style.id = 'iv-advance-selective-style';
    style.textContent = `
      #iv-advance-selective{margin-top:12px;padding:12px;border:1px solid rgba(126,200,240,.17);border-radius:15px;background:linear-gradient(145deg,rgba(126,200,240,.055),rgba(255,255,255,.012))}
      .iv-advance-top{display:grid;grid-template-columns:minmax(180px,1.15fr) minmax(150px,1fr) minmax(150px,1fr) auto;gap:9px;align-items:end}
      #iv-advance-search{width:100%;min-height:39px}
      .iv-advance-list{display:grid;gap:6px;max-height:280px;overflow:auto;margin-top:10px}
      .iv-advance-item{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:8px;align-items:center;padding:9px 10px;border:1px solid rgba(126,200,240,.12);border-radius:12px;background:rgba(255,255,255,.024);cursor:pointer}
      .iv-advance-item input{width:auto;accent-color:#4A90D9}
      .iv-advance-name{font-size:12px;font-weight:850;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .iv-advance-meta{font-size:10px;color:#8FAACB;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:260px}
      .iv-advance-count{margin-top:8px;color:#BFEAFF;font-size:11px;font-weight:800;line-height:1.4}
      .iv-advance-empty{padding:16px;text-align:center;color:#8FAACB;border:1px dashed rgba(126,200,240,.18);border-radius:12px}
      @media(max-width:820px){
        .iv-advance-top{grid-template-columns:1fr}
        #iv-advance-search{min-height:43px}
        .iv-advance-list{max-height:42vh}
        .iv-advance-item{grid-template-columns:auto minmax(0,1fr)}
        .iv-advance-meta{grid-column:2;max-width:none}
      }
    `;
    document.head.appendChild(style);
  }

  function turmaOptions(value){
    return '<option value="">Todas as turmas</option>' +
      '<option value="quinta" '+(value === 'quinta' ? 'selected' : '')+'>Quinta-feira</option>' +
      '<option value="sabado" '+(value === 'sabado' ? 'selected' : '')+'>Sábado</option>' +
      '<option value="__sem_turma__" '+(value === '__sem_turma__' ? 'selected' : '')+'>Sem turma</option>';
  }

  function ensure(){
    var modal = document.getElementById('modal-avancar');
    var origem = document.getElementById('avancar-origem');
    if(!modal || !origem) return;

    var box = document.getElementById('iv-advance-selective');
    if(!box){
      box = document.createElement('div');
      box.id = 'iv-advance-selective';
      box.innerHTML =
        '<div class="iv-advance-top">' +
          '<div><label>Pesquisar aluno</label><input id="iv-advance-search" type="search" placeholder="Digite o nome do aluno" autocomplete="off"></div>' +
          '<div><label>Filtrar por Revisão</label><select id="iv-advance-review"></select></div>' +
          '<div><label>Filtrar por Turma</label><select id="iv-advance-turma"></select></div>' +
          '<button type="button" class="btn btn-ghost btn-sm" id="iv-advance-all">Selecionar tudo</button>' +
        '</div>' +
        '<div id="iv-advance-list" class="iv-advance-list"></div>' +
        '<div id="iv-advance-count" class="iv-advance-count"></div>';
      origem.closest('.form-row').insertAdjacentElement('afterend', box);
    }

    var top = box.querySelector('.iv-advance-top');
    var search = document.getElementById('iv-advance-search');
    var review = document.getElementById('iv-advance-review');
    var turma = document.getElementById('iv-advance-turma');
    var allButton = document.getElementById('iv-advance-all');

    if(!search){
      search = document.createElement('input');
      search.id = 'iv-advance-search';
      search.type = 'search';
      search.placeholder = 'Digite o nome do aluno';
      search.autocomplete = 'off';
      var searchWrap = document.createElement('div');
      searchWrap.innerHTML = '<label>Pesquisar aluno</label>';
      searchWrap.appendChild(search);
      top.insertBefore(searchWrap, top.firstChild);
    }

    if(!review){
      review = document.createElement('select');
      review.id = 'iv-advance-review';
      var reviewWrap = document.createElement('div');
      reviewWrap.innerHTML = '<label>Filtrar por Revisão</label>';
      reviewWrap.appendChild(review);
      top.insertBefore(reviewWrap, allButton);
    }

    if(!turma){
      turma = document.createElement('select');
      turma.id = 'iv-advance-turma';
      var turmaWrap = document.createElement('div');
      turmaWrap.innerHTML = '<label>Filtrar por Turma</label>';
      turmaWrap.appendChild(turma);
      top.insertBefore(turmaWrap, allButton);
    }

    var reviewValue = review.value || '';
    review.innerHTML = R().options(reviewValue, 'Todas as revisões');
    review.value = reviewValue;

    var turmaValue = turma.value || '';
    turma.innerHTML = turmaOptions(turmaValue);
    turma.value = turmaValue;

    if(!search.dataset.ivBound){
      search.dataset.ivBound = '1';
      search.addEventListener('input', function(){
        window.clearTimeout(searchTimer);
        searchTimer = window.setTimeout(function(){ render(false); }, 90);
      });
    }

    if(!box.dataset.bound){
      box.dataset.bound = '1';
      origem.addEventListener('change', function(){ render(true); });
      review.addEventListener('change', function(){ render(true); });
      turma.addEventListener('change', function(){ render(true); });

      allButton.addEventListener('click', function(){
        var checks = Array.prototype.slice.call(document.querySelectorAll('.iv-advance-check'));
        var selectAll = checks.some(function(check){ return !check.checked; });
        checks.forEach(function(check){
          check.checked = selectAll;
          if(selectAll) chosen.add(+check.value);
          else chosen.delete(+check.value);
        });
        count();
      });

      document.getElementById('iv-advance-list').addEventListener('change', function(event){
        if(!event.target.classList.contains('iv-advance-check')) return;
        if(event.target.checked) chosen.add(+event.target.value);
        else chosen.delete(+event.target.value);
        count();
      });
    }
  }

  function candidates(ignoreSearch){
    var data = D();
    if(!data) return [];

    var origem = (document.getElementById('avancar-origem') || {}).value || '1';
    var revisao = (document.getElementById('iv-advance-review') || {}).value || '';
    var turma = (document.getElementById('iv-advance-turma') || {}).value || '';
    var query = ignoreSearch ? '' : normalize((document.getElementById('iv-advance-search') || {}).value || '');

    return (data.alunos || []).filter(function(aluno){
      var alunoTurma = aluno.turma || '';
      var turmaCorreta = !turma ||
        (turma === '__sem_turma__' ? !alunoTurma : alunoTurma === turma);
      var nomeCorreto = !query || normalize(aluno.nome).indexOf(query) >= 0;

      return String(aluno.modulo || '1') === String(origem) &&
        (aluno.situacao || 'ATIVO') === 'ATIVO' &&
        R().match(aluno, revisao) &&
        turmaCorreta &&
        nomeCorreto;
    }).sort(function(a,b){
      return String(a.nome || '').localeCompare(String(b.nome || ''), 'pt-BR');
    });
  }

  function count(){
    var visibleChecks = Array.prototype.slice.call(document.querySelectorAll('.iv-advance-check'));
    var visibleSelected = visibleChecks.filter(function(check){ return check.checked; }).length;
    var base = candidates(true);
    var baseIds = new Set(base.map(function(aluno){ return +aluno.id; }));
    var selectedTotal = 0;
    chosen.forEach(function(id){ if(baseIds.has(+id)) selectedTotal += 1; });

    var total = visibleChecks.length;
    var query = normalize((document.getElementById('iv-advance-search') || {}).value || '');
    var label = document.getElementById('iv-advance-count');
    var button = document.getElementById('iv-advance-all');

    if(label){
      label.textContent = selectedTotal+' de '+base.length+' aluno(s) selecionado(s)' +
        (query ? ' · '+total+' resultado(s) exibido(s)' : '');
    }

    if(button){
      button.disabled = total === 0;
      var allVisibleSelected = total > 0 && visibleSelected === total;
      button.textContent = query
        ? (allVisibleSelected ? 'Limpar exibidos' : 'Selecionar exibidos')
        : (allVisibleSelected ? 'Limpar seleção' : 'Selecionar tudo');
      button.setAttribute('aria-label', button.textContent);
      button.title = button.textContent;
    }
  }

  function render(reset){
    ensure();
    var data = D();
    var list = document.getElementById('iv-advance-list');
    if(!data || !list) return;

    var alunos = candidates(false);
    if(reset){
      chosen.clear();
      candidates(true).forEach(function(aluno){ chosen.add(+aluno.id); });
    }

    var query = normalize((document.getElementById('iv-advance-search') || {}).value || '');
    list.innerHTML = alunos.length ? alunos.map(function(aluno){
      var equipe = (data.equipes || []).find(function(item){
        return String(item.id) === String(aluno.equipeId);
      });
      var meta = (equipe ? equipe.nome : 'Sem equipe')+' · '+turmaLabel(aluno.turma)+' · '+R().label(aluno).replace('Revisão ','');
      return '<label class="iv-advance-item">' +
        '<input class="iv-advance-check" type="checkbox" value="'+aluno.id+'" '+(chosen.has(+aluno.id) ? 'checked' : '')+'>' +
        '<span class="iv-advance-name">'+esc(aluno.nome)+'</span>' +
        '<span class="iv-advance-meta">'+esc(meta)+'</span>' +
      '</label>';
    }).join('') : '<div class="iv-advance-empty">'+(query ? 'Nenhum aluno encontrado com esse nome.' : 'Nenhum aluno ativo encontrado para os filtros selecionados.')+'</div>';

    count();
  }

  function selected(){
    var data = D();
    var origem = (document.getElementById('avancar-origem') || {}).value || '1';
    var allowed = new Set(candidates(true).map(function(aluno){ return +aluno.id; }));
    return {
      ativos: data ? (data.alunos || []).filter(function(aluno){ return chosen.has(+aluno.id) && allowed.has(+aluno.id); }) : [],
      origem: origem,
      destino: String(+origem + 1)
    };
  }

  function patch(){
    if(typeof window.openAvancarModuloModal === 'function' && !window.openAvancarModuloModal._ivSelective){
      window.openAvancarModuloModal = function(){
        if(typeof userCan === 'function' && !userCan('alunos_manage')){
          return toast('Você não tem permissão para avançar módulos.', true);
        }
        ensure();
        var search = document.getElementById('iv-advance-search');
        if(search) search.value = '';
        var preview = document.getElementById('avancar-preview');
        if(preview) preview.style.display = 'none';
        openModal('modal-avancar');
        render(true);
        window.setTimeout(function(){ if(search) search.focus(); }, 80);
      };
      window.openAvancarModuloModal._ivSelective = 1;
    }

    window.getAlunosParaAvancar = selected;

    window.previewAvancar = function(){
      var result = selected();
      var preview = document.getElementById('avancar-preview');
      if(!preview) return;
      if(!result.ativos.length){
        preview.innerHTML = '<span style="color:var(--muted)">Selecione pelo menos um aluno.</span>';
      }else{
        preview.innerHTML = '<strong style="color:var(--blue-l)">'+result.ativos.length+' aluno(s)</strong> serão movidos para o próximo módulo:<br><br>' +
          result.ativos.map(function(aluno){
            return '<span style="display:inline-block;margin:2px 4px 2px 0;padding:2px 8px;background:rgba(74,144,217,.1);border-radius:12px;font-size:11px">'+esc(aluno.nome)+'</span>';
          }).join('');
      }
      preview.style.display = 'block';
    };

    window.confirmarAvancar = function(){
      var result = selected();
      if(!result.ativos.length) return toast('Selecione pelo menos um aluno.', true);
      if(!confirm('Avançar '+result.ativos.length+' aluno(s) para o próximo módulo?')) return;
      result.ativos.forEach(function(aluno){ aluno.modulo = result.destino; });
      saveDB();
      closeModal('modal-avancar');
      renderAlunos();
      renderDashboard();
      toast('✅ '+result.ativos.length+' aluno(s) avançados!');
    };
  }

  function init(){
    css();
    ensure();
    patch();
  }

  ready(function(){
    init();
    setTimeout(init, 600);
    setTimeout(init, 1600);
  });
})();
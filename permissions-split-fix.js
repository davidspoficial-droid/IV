// Separa permissões: cadastrar x editar, gerar x exportar
(function(){
  if(window.__IV_PERMISSIONS_SPLIT_FIX__) return;
  window.__IV_PERMISSIONS_SPLIT_FIX__ = true;

  const NOVAS_LABELS = {
    dashboard_view:'Dashboard: visualizar painel',
    alunos_view:'Alunos: visualizar lista',
    alunos_create:'Alunos: cadastrar',
    alunos_edit:'Alunos: editar/importar/situação/módulo',
    alunos_delete:'Alunos: excluir',
    equipes_view:'Equipes: visualizar',
    equipes_create:'Equipes: cadastrar',
    equipes_edit:'Equipes: editar',
    equipes_delete:'Equipes: excluir',
    presenca_view:'Presença: visualizar',
    presenca_manage:'Presença: lançar/alterar',
    relatorios_view:'Relatórios: visualizar',
    relatorios_generate:'Relatórios: gerar link',
    relatorios_export:'Relatórios: exportar arquivo',
    usuarios_view:'Usuários: visualizar',
    usuarios_create:'Usuários: cadastrar',
    usuarios_edit:'Usuários: editar dados/permissões',
    usuarios_status:'Usuários: ativar/bloquear',
    usuarios_delete:'Usuários: excluir'
  };

  function expandPerms(perms){
    const p = Object.assign({}, perms || {});

    if(p.alunos_manage === true){
      if(!Object.prototype.hasOwnProperty.call(p,'alunos_create')) p.alunos_create = true;
      if(!Object.prototype.hasOwnProperty.call(p,'alunos_edit')) p.alunos_edit = true;
    }

    if(p.equipes_manage === true){
      if(!Object.prototype.hasOwnProperty.call(p,'equipes_create')) p.equipes_create = true;
      if(!Object.prototype.hasOwnProperty.call(p,'equipes_edit')) p.equipes_edit = true;
    }

    if(p.relatorios_generate === true && !Object.prototype.hasOwnProperty.call(p,'relatorios_export')){
      p.relatorios_export = true;
    }

    return p;
  }

  function patchModels(){
    try{
      if(typeof PERMISSOES_LABELS !== 'undefined'){
        Object.keys(PERMISSOES_LABELS).forEach(k => delete PERMISSOES_LABELS[k]);
        Object.assign(PERMISSOES_LABELS, NOVAS_LABELS);
      }
    }catch(e){}

    try{
      if(typeof PERFIS_PERMISSOES !== 'undefined'){
        Object.keys(PERFIS_PERMISSOES).forEach(nome => {
          const p = PERFIS_PERMISSOES[nome] || {};
          const alunos = !!p.alunos_manage;
          const equipes = !!p.equipes_manage;
          const rel = !!p.relatorios_generate;

          if(!Object.prototype.hasOwnProperty.call(p,'alunos_create')) p.alunos_create = alunos;
          if(!Object.prototype.hasOwnProperty.call(p,'alunos_edit')) p.alunos_edit = alunos;
          if(!Object.prototype.hasOwnProperty.call(p,'equipes_create')) p.equipes_create = equipes;
          if(!Object.prototype.hasOwnProperty.call(p,'equipes_edit')) p.equipes_edit = equipes;
          if(!Object.prototype.hasOwnProperty.call(p,'relatorios_export')) p.relatorios_export = rel;

          delete p.alunos_manage;
          delete p.equipes_manage;
        });
      }
    }catch(e){}
  }

  function makePermCard(value, titulo, desc, checked){
    const label = document.createElement('label');
    label.className = 'perm-card';
    label.innerHTML = `<input type="checkbox" class="usr-perm" value="${value}" ${checked ? 'checked' : ''}> <span>${titulo}<small>${desc}</small></span>`;
    return label;
  }

  function updateCard(oldValue, newValue, titulo, desc){
    const input = document.querySelector(`.usr-perm[value="${oldValue}"]`);
    if(!input) return null;
    const card = input.closest('.perm-card');
    if(!card) return null;
    const wasChecked = input.checked;
    input.value = newValue;
    input.checked = wasChecked;
    const span = card.querySelector('span');
    if(span) span.innerHTML = `${titulo}<small>${desc}</small>`;
    return {card, checked:wasChecked};
  }

  function insertAfter(refCard, value, titulo, desc, checked){
    if(!refCard || document.querySelector(`.usr-perm[value="${value}"]`)) return;
    const novo = makePermCard(value, titulo, desc, checked);
    refCard.insertAdjacentElement('afterend', novo);
  }

  function patchPermissionCards(){
    const help = document.querySelector('.perm-help');
    if(help) help.textContent = 'Selecione exatamente o que esse acesso poderá visualizar, cadastrar, editar, excluir, gerar ou exportar.';

    const alunos = updateCard('alunos_manage','alunos_create','Cadastrar','Criar novos alunos e importar lista de alunos.');
    if(alunos) insertAfter(alunos.card,'alunos_edit','Editar','Alterar dados, situação e módulo dos alunos.', alunos.checked);

    const equipes = updateCard('equipes_manage','equipes_create','Cadastrar','Criar novas equipes.');
    if(equipes) insertAfter(equipes.card,'equipes_edit','Editar','Alterar dados das equipes já cadastradas.', equipes.checked);

    const rel = document.querySelector('.usr-perm[value="relatorios_generate"]');
    if(rel){
      const card = rel.closest('.perm-card');
      const span = card && card.querySelector('span');
      if(span) span.innerHTML = 'Gerar<small>Criar link de relatório para compartilhar.</small>';
      insertAfter(card,'relatorios_export','Exportar','Exportar arquivo/relatório para uso externo.', rel.checked);
    }

    if(typeof atualizarResumoPermissoesUsuario === 'function') atualizarResumoPermissoesUsuario();
  }

  function patchFunctions(){
    if(window.__IV_PERMISSIONS_SPLIT_WRAPPED__) return;
    window.__IV_PERMISSIONS_SPLIT_WRAPPED__ = true;

    patchModels();

    try{
      const oldUserCan = window.userCan || userCan;
      window.userCan = userCan = function(area){
        try{
          const u = typeof getUsuarioAtual === 'function' ? getUsuarioAtual() : null;
          if(!u) return true;
          if(u.ativo === false) return false;
          if(u.perfil === 'administrador') return true;
          const p = expandPerms(u.permissoes || {});

          if(area === 'alunos_manage') return !!(p.alunos_create || p.alunos_edit);
          if(area === 'equipes_manage') return !!(p.equipes_create || p.equipes_edit);
          if(area === 'relatorios_generate') return !!p.relatorios_generate;
          if(area === 'relatorios_export') return !!p.relatorios_export;

          if(p[area] === true) return true;
          return oldUserCan ? oldUserCan(area) : false;
        }catch(e){
          return oldUserCan ? oldUserCan(area) : false;
        }
      };
    }catch(e){}

    try{
      const oldSet = window.setPermissoesForm || setPermissoesForm;
      window.setPermissoesForm = setPermissoesForm = function(perms){
        patchPermissionCards();
        return oldSet(expandPerms(perms || {}));
      };
    }catch(e){}

    try{
      const oldSel = window.permissoesSelecionadas || permissoesSelecionadas;
      window.permissoesSelecionadas = permissoesSelecionadas = function(){
        const obj = oldSel();
        delete obj.alunos_manage;
        delete obj.equipes_manage;
        return obj;
      };
    }catch(e){}

    try{
      window.resumoPermissoesUsuario = resumoPermissoesUsuario = function(u){
        const permissoes = expandPerms((u && u.permissoes) || {});
        const keys = Object.keys(NOVAS_LABELS);
        const ativas = keys.filter(k => !!permissoes[k]);
        const total = keys.length;
        const qtd = ativas.length;
        const grupos = [
          ['Dashboard', ['dashboard_view']],
          ['Alunos', ['alunos_view','alunos_create','alunos_edit','alunos_delete']],
          ['Equipes', ['equipes_view','equipes_create','equipes_edit','equipes_delete']],
          ['Presença', ['presenca_view','presenca_manage']],
          ['Relatórios', ['relatorios_view','relatorios_generate','relatorios_export']],
          ['Usuários', ['usuarios_view','usuarios_create','usuarios_edit','usuarios_status','usuarios_delete']]
        ].filter(([_, ks]) => ks.some(k => permissoes[k]));
        const title = ativas.map(k => NOVAS_LABELS[k] || k).join(' | ') || 'Sem permissões liberadas';
        if(qtd === total){
          return `<div class="user-perm-compact" title="${title}"><span class="perm-total perm-total-all">Todas</span></div>`;
        }
        const chips = grupos.slice(0,3).map(([nome]) => `<span class="perm-mini-chip">${nome}</span>`).join('');
        const extra = grupos.length > 3 ? `<span class="perm-mini-more">+${grupos.length - 3}</span>` : '';
        return `<div class="user-perm-compact" title="${title}"><span class="perm-total">${qtd}/${total}</span><span class="perm-mini-list">${chips}${extra}</span></div>`;
      };
    }catch(e){}

    try{
      const oldUI = window.aplicarPermissoesUI || aplicarPermissoesUI;
      window.aplicarPermissoesUI = aplicarPermissoesUI = function(){
        if(oldUI) oldUI();
        applyFineUI();
      };
    }catch(e){}

    wrapAction('openAlunoModal', function(old, id){
      if(id && !userCan('alunos_edit')) return toast('Você não tem permissão para editar alunos.', true);
      if(!id && !userCan('alunos_create')) return toast('Você não tem permissão para cadastrar alunos.', true);
      return old.apply(this, arguments);
    });

    wrapAction('salvarAluno', function(old){
      const id = (document.getElementById('al-id') || {}).value;
      if(id && !userCan('alunos_edit')) return toast('Você não tem permissão para editar alunos.', true);
      if(!id && !userCan('alunos_create')) return toast('Você não tem permissão para cadastrar alunos.', true);
      return old.apply(this, arguments);
    });

    wrapAction('openImportModal', function(old){
      if(!userCan('alunos_create')) return toast('Você não tem permissão para importar/cadastrar alunos.', true);
      return old.apply(this, arguments);
    });

    wrapAction('importarAlunos', function(old){
      if(!userCan('alunos_create')) return toast('Você não tem permissão para importar/cadastrar alunos.', true);
      return old.apply(this, arguments);
    });

    wrapAction('openAvancarModuloModal', function(old){
      if(!userCan('alunos_edit')) return toast('Você não tem permissão para alterar módulo dos alunos.', true);
      return old.apply(this, arguments);
    });

    wrapAction('openEquipeModal', function(old, id){
      if(id && !userCan('equipes_edit')) return toast('Você não tem permissão para editar equipes.', true);
      if(!id && !userCan('equipes_create')) return toast('Você não tem permissão para cadastrar equipes.', true);
      return old.apply(this, arguments);
    });

    wrapAction('salvarEquipe', function(old){
      const id = (document.getElementById('eq-id') || {}).value;
      if(id && !userCan('equipes_edit')) return toast('Você não tem permissão para editar equipes.', true);
      if(!id && !userCan('equipes_create')) return toast('Você não tem permissão para cadastrar equipes.', true);
      return old.apply(this, arguments);
    });

    wrapAction('deletarEquipe', function(old){
      if(!userCan('equipes_delete')) return toast('Você não tem permissão para excluir equipes.', true);
      return old.apply(this, arguments);
    });

    wrapAction('gerarRelatorioLink', function(old){
      if(!userCan('relatorios_generate')) return toast('Você não tem permissão para gerar relatório.', true);
      return old.apply(this, arguments);
    });

    wrapAction('gerarRelatorio', function(old){
      if(!userCan('relatorios_export')) return toast('Você não tem permissão para exportar relatório.', true);
      return old.apply(this, arguments);
    });

    ['renderAlunos','renderEquipes','renderUsuarios','showPage'].forEach(name => {
      try{
        const old = window[name] || eval(name);
        if(typeof old !== 'function' || old.__splitWrapped) return;
        const novo = function(){
          const r = old.apply(this, arguments);
          setTimeout(() => { patchPermissionCards(); applyFineUI(); }, 0);
          return r;
        };
        novo.__splitWrapped = true;
        window[name] = eval(name + ' = novo');
      }catch(e){}
    });
  }

  function wrapAction(name, wrapper){
    try{
      const old = window[name] || eval(name);
      if(typeof old !== 'function' || old.__splitActionWrapped) return;
      const novo = function(){ return wrapper.apply(this, [old, ...arguments]); };
      novo.__splitActionWrapped = true;
      window[name] = eval(name + ' = novo');
    }catch(e){}
  }

  function applyFineUI(){
    const show = (sel, ok) => document.querySelectorAll(sel).forEach(el => el.style.display = ok ? '' : 'none');

    show('[onclick="openAlunoModal()"],[onclick*="openImportModal"]', userCan('alunos_create'));
    document.querySelectorAll('[onclick*="openAlunoModal("]').forEach(el => {
      const oc = el.getAttribute('onclick') || '';
      el.style.display = oc.includes('openAlunoModal()') ? (userCan('alunos_create') ? '' : 'none') : (userCan('alunos_edit') ? '' : 'none');
    });
    show('[onclick*="openAvancarModuloModal"]', userCan('alunos_edit'));

    show('[onclick="openEquipeModal()"]', userCan('equipes_create'));
    document.querySelectorAll('[onclick*="openEquipeModal("]').forEach(el => {
      const oc = el.getAttribute('onclick') || '';
      el.style.display = oc.includes('openEquipeModal()') ? (userCan('equipes_create') ? '' : 'none') : (userCan('equipes_edit') ? '' : 'none');
    });

    show('[onclick*="gerarRelatorioLink"]', userCan('relatorios_generate'));
    show('[onclick*="gerarRelatorio(\'web\')"],[onclick*="gerarRelatorio(\"web\")"]', userCan('relatorios_export'));
  }

  function start(){
    patchModels();
    patchPermissionCards();
    patchFunctions();
    applyFineUI();
    setTimeout(() => { patchPermissionCards(); applyFineUI(); }, 300);
    setTimeout(() => { patchPermissionCards(); applyFineUI(); }, 1200);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();

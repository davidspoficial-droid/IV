// Correção das permissões separadas sem seletor inválido
(function(){
  if(window.__IV_PERMISSIONS_SPLIT_FIXED_V2__) return;
  window.__IV_PERMISSIONS_SPLIT_FIXED_V2__ = true;

  var NOVAS_CHAVES = [
    'alunos_create','alunos_edit',
    'equipes_create','equipes_edit',
    'presenca_launch','presenca_edit',
    'relatorios_export'
  ];

  function card(valor,titulo,desc,checked){
    var label=document.createElement('label');
    label.className='perm-card';
    label.innerHTML='<input type="checkbox" class="usr-perm" value="'+valor+'" '+(checked?'checked':'')+'> <span>'+titulo+'<small>'+desc+'</small></span>';
    return label;
  }

  function trocar(antigo,novo,titulo,desc){
    var input=document.querySelector('.usr-perm[value="'+antigo+'"]');
    if(!input) return null;
    var box=input.closest('.perm-card');
    if(!box) return null;
    var checked=input.checked;
    input.value=novo;
    input.checked=checked;
    var span=box.querySelector('span');
    if(span) span.innerHTML=titulo+'<small>'+desc+'</small>';
    return {box:box,checked:checked};
  }

  function depois(box,valor,titulo,desc,checked){
    if(!box || document.querySelector('.usr-perm[value="'+valor+'"]')) return;
    box.insertAdjacentElement('afterend',card(valor,titulo,desc,checked));
  }

  function ajustarTela(){
    var help=document.querySelector('.perm-help');
    if(help) help.textContent='Selecione exatamente o que esse acesso poderá visualizar, cadastrar, editar, excluir, lançar, alterar, gerar ou exportar.';

    var a=trocar('alunos_manage','alunos_create','Cadastrar','Criar novos alunos e importar lista de alunos.');
    if(a) depois(a.box,'alunos_edit','Editar','Alterar dados, situação e módulo dos alunos.',a.checked);

    var e=trocar('equipes_manage','equipes_create','Cadastrar','Criar novas equipes.');
    if(e) depois(e.box,'equipes_edit','Editar','Alterar dados das equipes já cadastradas.',e.checked);

    var p=trocar('presenca_manage','presenca_launch','Lançar','Marcar presença onde ainda não existe lançamento.');
    if(p) depois(p.box,'presenca_edit','Alterar','Remover ou alterar uma presença já lançada.',p.checked);

    var r=document.querySelector('.usr-perm[value="relatorios_generate"]');
    if(r){
      var rb=r.closest('.perm-card');
      var sp=rb&&rb.querySelector('span');
      if(sp) sp.innerHTML='Gerar<small>Gerar link ou relatório para visualização.</small>';
      depois(rb,'relatorios_export','Exportar','Exportar ou baixar relatório/backup.',r.checked);
    }

    if(typeof atualizarResumoPermissoesUsuario==='function') atualizarResumoPermissoesUsuario();
  }

  function expandir(p){
    p=Object.assign({},p||{});
    if(p.alunos_manage===true){p.alunos_create=true;p.alunos_edit=true;}
    if(p.equipes_manage===true){p.equipes_create=true;p.equipes_edit=true;}
    if(p.presenca_manage===true){p.presenca_launch=true;p.presenca_edit=true;}
    if(p.relatorios_generate===true && p.relatorios_export!==false){p.relatorios_export=true;}
    return p;
  }

  function instalar(){
    try{
      if(typeof PERMISSOES_LABELS==='object'){
        PERMISSOES_LABELS.alunos_create='Alunos: cadastrar';
        PERMISSOES_LABELS.alunos_edit='Alunos: editar/importar/situação';
        PERMISSOES_LABELS.equipes_create='Equipes: cadastrar';
        PERMISSOES_LABELS.equipes_edit='Equipes: editar';
        PERMISSOES_LABELS.presenca_launch='Presença: lançar';
        PERMISSOES_LABELS.presenca_edit='Presença: alterar';
        PERMISSOES_LABELS.relatorios_export='Relatórios: exportar';
        delete PERMISSOES_LABELS.alunos_manage;
        delete PERMISSOES_LABELS.equipes_manage;
        delete PERMISSOES_LABELS.presenca_manage;
        PERMISSOES_LABELS.relatorios_generate='Relatórios: gerar';
      }
    }catch(err){}

    try{
      if(typeof PERFIS_PERMISSOES==='object'){
        Object.keys(PERFIS_PERMISSOES).forEach(function(k){
          var p=PERFIS_PERMISSOES[k]||{};
          var al=!!p.alunos_manage;
          var eq=!!p.equipes_manage;
          var pr=!!p.presenca_manage;
          var rel=!!p.relatorios_generate;
          if(!('alunos_create' in p)) p.alunos_create=al;
          if(!('alunos_edit' in p)) p.alunos_edit=al;
          if(!('equipes_create' in p)) p.equipes_create=eq;
          if(!('equipes_edit' in p)) p.equipes_edit=eq;
          if(!('presenca_launch' in p)) p.presenca_launch=pr;
          if(!('presenca_edit' in p)) p.presenca_edit=pr;
          if(!('relatorios_export' in p)) p.relatorios_export=rel;
          delete p.alunos_manage;
          delete p.equipes_manage;
          delete p.presenca_manage;
        });
      }
    }catch(err){}

    try{
      if(typeof userCan==='function' && !userCan.__splitV2){
        var oldCan=userCan;
        var novoCan=function(area){
          try{
            if(area==='alunos_manage') return novoCan('alunos_create') || novoCan('alunos_edit');
            if(area==='equipes_manage') return novoCan('equipes_create') || novoCan('equipes_edit');
            if(area==='presenca_manage') return novoCan('presenca_launch') || novoCan('presenca_edit');
            if(NOVAS_CHAVES.indexOf(area)>=0){
              var u=typeof getUsuarioAtual==='function' ? getUsuarioAtual() : null;
              if(!u) return true;
              if(u.ativo===false) return false;
              if(u.perfil==='administrador') return true;
              var perms=expandir(u.permissoes||{});
              return perms[area]===true;
            }
            return oldCan(area);
          }catch(err){
            return oldCan(area);
          }
        };
        novoCan.__splitV2=true;
        window.userCan=userCan=novoCan;
      }
    }catch(err){}

    try{
      if(typeof setPermissoesForm==='function' && !setPermissoesForm.__splitV2){
        var oldSet=setPermissoesForm;
        var novoSet=function(perms){ajustarTela();return oldSet(expandir(perms));};
        novoSet.__splitV2=true;
        window.setPermissoesForm=setPermissoesForm=novoSet;
      }
    }catch(err){}

    try{
      if(typeof permissoesSelecionadas==='function' && !permissoesSelecionadas.__splitV2){
        var oldGet=permissoesSelecionadas;
        var novoGet=function(){
          var p=oldGet();
          delete p.alunos_manage;
          delete p.equipes_manage;
          delete p.presenca_manage;
          return p;
        };
        novoGet.__splitV2=true;
        window.permissoesSelecionadas=permissoesSelecionadas=novoGet;
      }
    }catch(err){}

    try{
      if(typeof togglePres==='function' && !togglePres.__splitV2){
        var oldToggle=togglePres;
        var novoToggle=function(alunoId,modulo,semIdx,aula,el){
          var key=presKey(alunoId,modulo,semIdx,aula);
          var jaLancada=!!DB.presencas[key];
          if(!jaLancada && !userCan('presenca_launch')) return toast('Você não tem permissão para lançar presença.',true);
          if(jaLancada && !userCan('presenca_edit')) return toast('Você não tem permissão para alterar presença.',true);
          return oldToggle.apply(this,arguments);
        };
        novoToggle.__splitV2=true;
        window.togglePres=togglePres=novoToggle;
      }
    }catch(err){}

    try{
      if(typeof marcarTodos==='function' && !marcarTodos.__splitV2){
        var oldMarcarTodos=marcarTodos;
        var novoMarcarTodos=function(pres){
          if(pres && !userCan('presenca_launch')) return toast('Você não tem permissão para lançar presença.',true);
          if(!pres && !userCan('presenca_edit')) return toast('Você não tem permissão para alterar/remover presença.',true);
          return oldMarcarTodos.apply(this,arguments);
        };
        novoMarcarTodos.__splitV2=true;
        window.marcarTodos=marcarTodos=novoMarcarTodos;
      }
    }catch(err){}
  }

  function iniciar(){
    instalar();
    ajustarTela();
    setTimeout(ajustarTela,300);
    setTimeout(ajustarTela,1000);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',iniciar);
  else iniciar();
})();

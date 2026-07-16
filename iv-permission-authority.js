// IV - autoridade de permissoes para Web e Mobile (nega por padrao)
(function(){
  'use strict';
  if(window.__IV_PERMISSION_AUTHORITY_V1__) return;
  window.__IV_PERMISSION_AUTHORITY_V1__ = true;

  var PAGE_PERMISSIONS = {
    dashboard:'dashboard_view',
    alunos:'alunos_view',
    equipes:'equipes_view',
    presenca:'presenca_view',
    exportar:'relatorios_view',
    usuarios:'usuarios_view',
    historico:'usuarios_view'
  };
  var PAGE_ORDER = ['dashboard','alunos','equipes','presenca','exportar','usuarios','historico'];
  var displayMemory = new WeakMap();
  var pageObservers = new WeakSet();
  var navObserver = null;
  var enforcing = false;
  var refreshTimer = null;

  function data(){
    try{return typeof DB !== 'undefined' && DB ? DB : null;}catch(error){return null;}
  }

  function authUser(){
    try{return window._firebase && typeof window._firebase.currentUser === 'function' ? window._firebase.currentUser() : null;}catch(error){return null;}
  }

  function profile(){
    var user = authUser();
    var db = data();
    if(!user || !db || !Array.isArray(db.usuarios)) return null;
    var uid = String(user.uid || '');
    var email = String(user.email || '').trim().toLowerCase();
    return db.usuarios.find(function(item){
      if(!item) return false;
      if(uid && item.uid && String(item.uid) === uid) return true;
      return !!email && String(item.email || '').trim().toLowerCase() === email;
    }) || null;
  }

  function expandedPermissions(user){
    var source = user && user.permissoes || {};
    var permissions = Object.assign({}, source);

    if(permissions.dashboard === true && permissions.dashboard_view !== false) permissions.dashboard_view = true;
    if(permissions.alunos === true && permissions.alunos_view !== false) permissions.alunos_view = true;
    if(permissions.equipes === true && permissions.equipes_view !== false) permissions.equipes_view = true;
    if(permissions.presenca === true && permissions.presenca_view !== false) permissions.presenca_view = true;
    if(permissions.relatorios === true && permissions.relatorios_view !== false) permissions.relatorios_view = true;
    if(permissions.usuarios === true && permissions.usuarios_view !== false) permissions.usuarios_view = true;

    if(permissions.alunos_manage === true){
      if(permissions.alunos_create !== false) permissions.alunos_create = true;
      if(permissions.alunos_edit !== false) permissions.alunos_edit = true;
    }
    if(permissions.equipes_manage === true){
      if(permissions.equipes_create !== false) permissions.equipes_create = true;
      if(permissions.equipes_edit !== false) permissions.equipes_edit = true;
    }
    if(permissions.presenca_manage === true){
      if(permissions.presenca_launch !== false) permissions.presenca_launch = true;
      if(permissions.presenca_edit !== false) permissions.presenca_edit = true;
    }
    if(permissions.relatorios_generate === true && permissions.relatorios_export !== false){
      permissions.relatorios_export = true;
    }
    return permissions;
  }

  function can(area){
    var user = profile();
    if(!user || user.ativo === false) return false;
    if(String(user.perfil || '').toLowerCase() === 'administrador') return true;

    var permissions = expandedPermissions(user);
    if(area === 'alunos_manage') return permissions.alunos_create === true || permissions.alunos_edit === true;
    if(area === 'equipes_manage') return permissions.equipes_create === true || permissions.equipes_edit === true;
    if(area === 'presenca_manage') return permissions.presenca_launch === true || permissions.presenca_edit === true;
    if(area === 'relatorios_generate') return permissions.relatorios_generate === true;
    return permissions[area] === true;
  }
  can.__ivPermissionAuthority = true;
  can.__splitV2 = true;

  function isAdmin(){
    var user = profile();
    return !!user && user.ativo !== false && String(user.perfil || '').toLowerCase() === 'administrador';
  }
  isAdmin.__ivPermissionAuthority = true;

  function toastDenied(permission){
    var labels = {
      dashboard_view:'acessar o Dashboard', alunos_view:'ver a página de Alunos', alunos_create:'cadastrar alunos', alunos_edit:'editar alunos', alunos_delete:'excluir alunos',
      equipes_view:'ver a página de Equipes', equipes_create:'cadastrar equipes', equipes_edit:'editar equipes', equipes_delete:'excluir equipes',
      presenca_view:'ver a página de Presença', presenca_launch:'lançar presença', presenca_edit:'alterar presença',
      relatorios_view:'ver a página de Relatórios', relatorios_generate:'gerar relatórios', relatorios_export:'exportar dados ou relatórios',
      usuarios_view:'ver a página de Usuários', usuarios_create:'cadastrar usuários', usuarios_edit:'editar usuários', usuarios_status:'ativar ou bloquear usuários', usuarios_delete:'excluir usuários'
    };
    var message = 'Você não tem permissão para ' + (labels[permission] || 'executar esta ação') + '.';
    try{if(typeof window.toast === 'function') window.toast(message,true);else window.alert(message);}catch(error){}
    return false;
  }

  function pagePermission(name){return PAGE_PERMISSIONS[String(name || '').replace(/^page-/,'')] || null;}
  function pageAllowed(name){
    var permission = pagePermission(name);
    if(permission) return can(permission);
    return isAdmin();
  }

  function pageNameFromButton(button){
    if(!button) return '';
    var onclick = button.getAttribute('onclick') || '';
    var match = onclick.match(/showPage\(['"]([^'"]+)['"]/i);
    if(match) return match[1];
    var text = String(button.textContent || '').toLowerCase();
    if(text.indexOf('histórico') >= 0 || text.indexOf('historico') >= 0) return 'historico';
    return button.dataset && button.dataset.page || '';
  }

  function rememberAndHide(element){
    if(!element) return;
    if(!displayMemory.has(element)) displayMemory.set(element,{value:element.style.getPropertyValue('display'),priority:element.style.getPropertyPriority('display')});
    element.style.setProperty('display','none','important');
    element.setAttribute('aria-hidden','true');
    element.dataset.ivPermissionHidden = '1';
  }

  function restoreDisplay(element){
    if(!element || element.dataset.ivPermissionHidden !== '1') return;
    var old = displayMemory.get(element) || {value:'',priority:''};
    if(old.value) element.style.setProperty('display',old.value,old.priority || '');
    else element.style.removeProperty('display');
    element.removeAttribute('aria-hidden');
    delete element.dataset.ivPermissionHidden;
    displayMemory.delete(element);
  }

  function setVisible(element, allowed){
    if(allowed) restoreDisplay(element);
    else rememberAndHide(element);
  }

  function applyNavigation(){
    document.querySelectorAll('.main-nav .mnav').forEach(function(button){
      var page = pageNameFromButton(button);
      if(page) setVisible(button,pageAllowed(page));
    });
  }

  function applyActionVisibility(){
    var groups = [
      ['[onclick*="openAlunoModal"],[data-iv-student-create]', can('alunos_create') || can('alunos_edit')],
      ['[onclick*="openImportModal"],[onclick*="importarAlunos"]', can('alunos_create')],
      ['[onclick*="openAvancarModuloModal"],[onclick*="confirmarAvancar"],[onclick*="marcarDesistente"],[onclick*="reativarAluno"]', can('alunos_edit')],
      ['[onclick*="deletarAluno"],[onclick*="excluirSelecionados"]', can('alunos_delete')],
      ['[onclick*="openEquipeModal"]', can('equipes_create') || can('equipes_edit')],
      ['[onclick*="deletarEquipe"]', can('equipes_delete')],
      ['#page-presenca [onclick*="marcarTodos"],#page-presenca [data-iv-pres-id]', can('presenca_launch') || can('presenca_edit')],
      ['#page-exportar .export-card,[onclick*="gerarRelatorio"]', can('relatorios_generate')],
      ['#page-exportar [onclick*="exportarDados"],#page-exportar [onchange*="importarDados"],#page-exportar label:has([onchange*="importarDados"])', can('relatorios_export')],
      ['[data-iv-user-edit],[onclick*="editarUsuarioSistema"]', can('usuarios_edit')],
      ['[data-iv-user-status],[onclick*="alternarUsuarioAtivo"]', can('usuarios_status')],
      ['[data-iv-user-delete],[onclick*="excluirUsuarioSistema"]', can('usuarios_delete')]
    ];
    groups.forEach(function(group){
      try{document.querySelectorAll(group[0]).forEach(function(element){setVisible(element,group[1]);});}catch(error){}
    });

    var userForm = document.querySelector('#page-usuarios > .card:first-of-type');
    if(userForm) setVisible(userForm,can('usuarios_create') || can('usuarios_edit'));
  }

  function firstAllowedPage(){
    for(var i=0;i<PAGE_ORDER.length;i++) if(pageAllowed(PAGE_ORDER[i]) && document.getElementById('page-'+PAGE_ORDER[i])) return PAGE_ORDER[i];
    return '';
  }

  function noAccessPage(){
    document.querySelectorAll('.page').forEach(function(page){page.classList.remove('active');});
    var page = document.getElementById('iv-no-permission-page');
    if(!page){
      page = document.createElement('div');
      page.id = 'iv-no-permission-page';
      page.className = 'page';
      page.innerHTML = '<div class="card" style="max-width:620px;margin:30px auto;text-align:center"><div style="font-size:34px;margin-bottom:10px">🔒</div><div class="stitle" style="justify-content:center">Acesso limitado</div><p style="color:var(--muted);line-height:1.55">Este usuário não possui nenhuma página liberada. Solicite ao administrador a atualização das permissões.</p></div>';
      var nav = document.querySelector('.main-nav');
      if(nav && nav.parentNode) nav.parentNode.insertBefore(page,nav.nextSibling); else document.body.appendChild(page);
    }
    page.classList.add('active');
  }

  function activateDirect(name){
    var page = document.getElementById('page-'+name);
    if(!page){noAccessPage();return;}
    document.querySelectorAll('.page').forEach(function(item){item.classList.remove('active');});
    document.querySelectorAll('.main-nav .mnav').forEach(function(button){button.classList.remove('active');});
    page.classList.add('active');
    document.querySelectorAll('.main-nav .mnav').forEach(function(button){if(pageNameFromButton(button)===name)button.classList.add('active');});
    try{
      var renderers={dashboard:'renderDashboard',alunos:'renderAlunos',equipes:'renderEquipes',presenca:'initPresenca',usuarios:'renderUsuarios'};
      var fn=renderers[name];if(fn&&typeof window[fn]==='function')window[fn]();
    }catch(error){}
  }

  function enforceActivePage(){
    if(enforcing) return;
    enforcing = true;
    try{
      var active = document.querySelector('.page.active');
      if(active){
        var name = active.id === 'iv-no-permission-page' ? '' : active.id.replace(/^page-/,'');
        if(name && !pageAllowed(name)){
          var fallback = firstAllowedPage();
          if(fallback) activateDirect(fallback); else noAccessPage();
        }
      }
    }finally{enforcing=false;}
  }

  function copyFlags(source,target){
    try{Object.keys(source || {}).forEach(function(key){try{target[key]=source[key];}catch(error){}});}catch(error){}
  }

  function patchShowPage(){
    var current = window.showPage;
    if(typeof current !== 'function' || current._ivPermissionGuard) return;
    var guarded = function(name,button){
      var permission = pagePermission(name);
      if(!pageAllowed(name)){
        toastDenied(permission || 'dashboard_view');
        var fallback = firstAllowedPage();
        if(fallback) activateDirect(fallback); else noAccessPage();
        return false;
      }
      return current.apply(this,arguments);
    };
    copyFlags(current,guarded);
    guarded._ivPermissionGuard = true;
    window.showPage = guarded;
  }

  function requirementAllowed(requirement){
    if(typeof requirement === 'boolean') return requirement;
    if(Array.isArray(requirement)) return requirement.some(can);
    return can(requirement);
  }

  function patchAction(name,resolver){
    var current = window[name];
    if(typeof current !== 'function' || current._ivPermissionGuard) return;
    var guarded = function(){
      var requirement = typeof resolver === 'function' ? resolver.apply(this,arguments) : resolver;
      if(!requirementAllowed(requirement)) return toastDenied(Array.isArray(requirement)?requirement[0]:requirement);
      return current.apply(this,arguments);
    };
    copyFlags(current,guarded);
    guarded._ivPermissionGuard = true;
    window[name] = guarded;
  }

  function studentModeFromArgs(args){return args.length && args[0] !== null && args[0] !== undefined && args[0] !== '' ? 'alunos_edit' : 'alunos_create';}
  function studentSaveMode(){var field=document.getElementById('al-id');return field&&field.value?'alunos_edit':'alunos_create';}
  function teamModeFromArgs(args){return args.length && args[0] !== null && args[0] !== undefined && args[0] !== '' ? 'equipes_edit' : 'equipes_create';}
  function teamSaveMode(){var field=document.getElementById('eq-id');return field&&field.value?'equipes_edit':'equipes_create';}
  function userSaveMode(){var field=document.getElementById('usr-edit-idx');return field&&field.value!==''?'usuarios_edit':'usuarios_create';}
  function presenceMode(args){
    try{
      var db=data()||{},id=args[0],module=args[1],week=args[2],lesson=args[3];
      var key=typeof window.presKey==='function'?window.presKey(id,module,week,lesson):id+'_'+module+'_'+week+'_'+lesson;
      return db.presencas&&db.presencas[key]?'presenca_edit':'presenca_launch';
    }catch(error){return 'presenca_launch';}
  }

  function patchActions(){
    patchAction('openAlunoModal',function(){return studentModeFromArgs(arguments);});
    patchAction('salvarAluno',studentSaveMode);
    patchAction('openImportModal','alunos_create');
    patchAction('previewImport','alunos_create');
    patchAction('importarAlunos','alunos_create');
    patchAction('openAvancarModuloModal','alunos_edit');
    patchAction('previewAvancar','alunos_edit');
    patchAction('confirmarAvancar','alunos_edit');
    patchAction('marcarDesistente','alunos_edit');
    patchAction('reativarAluno','alunos_edit');
    patchAction('deletarAluno','alunos_delete');
    patchAction('excluirSelecionados','alunos_delete');

    patchAction('openEquipeModal',function(){return teamModeFromArgs(arguments);});
    patchAction('salvarEquipe',teamSaveMode);
    patchAction('deletarEquipe','equipes_delete');

    patchAction('togglePres',function(){return presenceMode(arguments);});
    patchAction('marcarTodos',function(on){return on?'presenca_launch':'presenca_edit';});

    patchAction('gerarRelatorioLink','relatorios_generate');
    patchAction('gerarRelatorio','relatorios_generate');
    patchAction('IVGenerateGeneralView','relatorios_generate');
    patchAction('copiarLink','relatorios_generate');
    patchAction('abrirWhatsApp','relatorios_generate');
    patchAction('exportarDados','relatorios_export');
    patchAction('importarDados','relatorios_export');

    patchAction('cadastrarUsuarioSistema',userSaveMode);
    patchAction('editarUsuarioSistema','usuarios_edit');
    patchAction('atualizarUsuarioSistema','usuarios_edit');
    patchAction('alternarUsuarioAtivo','usuarios_status');
    patchAction('excluirUsuarioSistema','usuarios_delete');
    patchAction('abrirHistoricoAlteracoes','usuarios_view');
  }

  function patchAfter(name){
    var current=window[name];
    if(typeof current!=='function'||current._ivPermissionAfter)return;
    var wrapped=function(){
      var result=current.apply(this,arguments);
      if(result&&typeof result.finally==='function') result.finally(scheduleRefresh);
      else scheduleRefresh();
      return result;
    };
    copyFlags(current,wrapped);
    wrapped._ivPermissionAfter=true;
    window[name]=wrapped;
  }

  function patchLifecycle(){
    ['loadDB','entrarSistema','garantirUsuarioAdminInicial','aplicarPermissoesUI'].forEach(patchAfter);
  }

  function observePages(){
    document.querySelectorAll('.page').forEach(function(page){
      if(pageObservers.has(page)) return;
      pageObservers.add(page);
      new MutationObserver(function(){enforceActivePage();}).observe(page,{attributes:true,attributeFilter:['class']});
    });
    var nav=document.querySelector('.main-nav');
    if(nav&&!navObserver){
      navObserver=new MutationObserver(function(){scheduleRefresh();});
      navObserver.observe(nav,{childList:true});
    }
  }

  function installGlobals(){
    window.getUsuarioAtual = profile;
    window.userCan = can;
    window.isAdminAtual = isAdmin;
  }

  function refresh(){
    installGlobals();
    patchShowPage();
    patchActions();
    patchLifecycle();
    applyNavigation();
    applyActionVisibility();
    observePages();
    enforceActivePage();
  }

  function scheduleRefresh(){
    clearTimeout(refreshTimer);
    refreshTimer=setTimeout(refresh,20);
    [100,450,1200,2800].forEach(function(delay){setTimeout(refresh,delay);});
  }

  document.addEventListener('click',function(event){
    var button=event.target&&event.target.closest&&event.target.closest('.main-nav .mnav');
    if(!button)return;
    var page=pageNameFromButton(button);
    if(page&&!pageAllowed(page)){
      event.preventDefault();
      event.stopImmediatePropagation();
      toastDenied(pagePermission(page)||'dashboard_view');
      enforceActivePage();
    }
  },true);

  window.IVPermissionAuthority={refresh:refresh,can:can,profile:profile,isAdmin:isAdmin,pageAllowed:pageAllowed};

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scheduleRefresh,{once:true});
  else scheduleRefresh();
  document.addEventListener('firebase-ready',scheduleRefresh);
  window.addEventListener('pageshow',scheduleRefresh);
  window.addEventListener('focus',scheduleRefresh);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)scheduleRefresh();});
  window.addEventListener('iv-concurrency-saved',scheduleRefresh);
})();
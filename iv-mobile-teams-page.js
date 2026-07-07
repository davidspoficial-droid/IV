// IV - Equipes em layout mobile proprio
(function(){
  'use strict';

  var mql = window.matchMedia('(max-width: 820px)');
  var timer = null;

  function ready(fn){
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, {once:true});
    else fn();
  }

  function DBx(){ try { return typeof DB !== 'undefined' ? DB : null; } catch(e){ return null; } }
  function MODx(){ try { return typeof MODULOS !== 'undefined' ? MODULOS : null; } catch(e){ return null; } }
  function esc(v){ return String(v == null ? '' : v).replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]; }); }
  function norm(v){ return String(v || '').trim().replace(/\s+/g,' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR'); }

  function loadCSS(){
    if(document.getElementById('iv-mobile-teams-css')) return;
    var l = document.createElement('link');
    l.id = 'iv-mobile-teams-css';
    l.rel = 'stylesheet';
    l.href = './iv-mobile-teams.css?v=1';
    document.head.appendChild(l);
  }

  function setMobileClass(){
    document.body.classList.toggle('iv-mobile-app', !!mql.matches);
  }

  function limparTextoPremium(){
    var sub = document.querySelector('.header-subtitle');
    if(sub) sub.textContent = 'Sistema de gestão de presença';
  }

  function ensureBox(){
    var page = document.getElementById('page-equipes');
    if(!page) return null;
    var box = document.getElementById('iv-mobile-equipes');
    if(!box){
      box = document.createElement('div');
      box.id = 'iv-mobile-equipes';
      page.insertBefore(box, page.firstChild);
    }
    return box;
  }

  function modName(eq){
    var mods = MODx() || {};
    if(!eq || eq.modulo === 'todos') return 'Todos os módulos';
    return mods[eq.modulo] ? mods[eq.modulo].nome : (eq.modulo || '—');
  }

  function corMod(eq){
    var m = String((eq && eq.modulo) || '1');
    return m === '1' ? '#7EC8F0' : m === '2' ? '#7EDBA8' : m === '3' ? '#F08080' : '#C39BD3';
  }

  function alunosEquipe(eq){
    var db = DBx() || {};
    return (db.alunos || []).filter(function(a){ return String(a.equipeId || '') === String(eq.id); }).sort(function(a,b){ return String(a.nome || '').localeCompare(String(b.nome || ''),'pt-BR'); });
  }

  function filtros(){
    return {
      q: (document.getElementById('iv-team-search') || {}).value || '',
      modulo: (document.getElementById('iv-team-modulo') || {}).value || ''
    };
  }

  function lista(){
    var db = DBx() || {};
    var f = filtros();
    var q = norm(f.q);
    return (db.equipes || []).slice().sort(function(a,b){ return String(a.nome || '').localeCompare(String(b.nome || ''),'pt-BR'); }).filter(function(eq){
      var alunos = alunosEquipe(eq);
      var alvo = [eq.nome, modName(eq), alunos.map(function(a){ return a.nome; }).join(' ')].map(norm).join(' ');
      if(q && alvo.indexOf(q) < 0) return false;
      if(f.modulo && String(eq.modulo || '') !== String(f.modulo)) return false;
      return true;
    });
  }

  function card(eq){
    var alunos = alunosEquipe(eq);
    var alunosHtml = alunos.length ? alunos.slice(0,20).map(function(a){ return '<span class="iv-team-student">' + esc(a.nome || '—') + '</span>'; }).join('') : '<span class="iv-team-student">Sem alunos vinculados</span>';
    if(alunos.length > 20) alunosHtml += '<span class="iv-team-student">+' + (alunos.length - 20) + '</span>';
    return '<article class="iv-team-card" data-id="' + esc(eq.id) + '" style="--c:' + corMod(eq) + '">' +
      '<div class="iv-team-compact">' +
        '<div class="iv-team-avatar">👥</div>' +
        '<div><div class="iv-team-name">' + esc(eq.nome || '—') + '</div><div class="iv-team-mini"><span class="iv-team-pill">' + esc(modName(eq)) + '</span><span class="iv-team-pill count">' + alunos.length + ' aluno' + (alunos.length !== 1 ? 's' : '') + '</span></div></div>' +
        '<div class="iv-team-card-actions"><button type="button" class="iv-team-icon-btn edit" data-act="editar" title="Editar" aria-label="Editar equipe">✏️</button><button type="button" class="iv-team-icon-btn red" data-act="remover" title="Excluir" aria-label="Excluir equipe">🗑️</button></div>' +
      '</div>' +
      '<details class="iv-team-details"><summary><span>✦ Ver informações</span><span class="chev">⌄</span></summary><div class="iv-team-info"><div class="iv-team-chip"><span>ID</span><strong>#' + esc(eq.id) + '</strong></div><div class="iv-team-chip"><span>Módulo</span><strong>' + esc(modName(eq)) + '</strong></div><div class="iv-team-students">' + alunosHtml + '</div></div></details>' +
    '</article>';
  }

  function renderMobileEquipes(){
    var box = ensureBox();
    var db = DBx();
    if(!box || !db) return;
    var f = filtros();
    var itens = lista();
    box.innerHTML = '<div class="iv-team-hero"><div class="iv-team-hero-top"><div><div class="iv-team-title">Equipes</div></div><div class="iv-team-count"><strong>' + itens.length + '</strong><span>Exibidas</span></div></div></div>' +
      '<div class="iv-team-actions"><button type="button" class="iv-team-btn primary" data-act="nova">+ Nova Equipe</button></div>' +
      '<div class="iv-team-filter"><input id="iv-team-search" class="iv-team-search" placeholder="🔍 Buscar equipe ou aluno..." value="' + esc(f.q) + '"><div class="iv-team-filter-grid"><select id="iv-team-modulo" class="iv-team-select"><option value="">Todos os módulos</option><option value="1" ' + (f.modulo === '1' ? 'selected' : '') + '>1º Módulo</option><option value="2" ' + (f.modulo === '2' ? 'selected' : '') + '>2º Módulo</option><option value="3" ' + (f.modulo === '3' ? 'selected' : '') + '>3º Módulo</option><option value="todos" ' + (f.modulo === 'todos' ? 'selected' : '') + '>Todos</option></select></div></div>' +
      '<div class="iv-team-list">' + (itens.length ? itens.map(card).join('') : '<div class="iv-team-empty">Nenhuma equipe encontrada.</div>') + '</div>';
  }

  function handleInput(ev){
    if(!ev.target || !ev.target.closest('#iv-mobile-equipes')) return;
    if(ev.target.id === 'iv-team-search'){
      clearTimeout(timer);
      timer = setTimeout(renderMobileEquipes, 90);
    }
  }

  function handleChange(ev){
    if(!ev.target || !ev.target.closest('#iv-mobile-equipes')) return;
    if(ev.target.id === 'iv-team-modulo') renderMobileEquipes();
  }

  function handleClick(ev){
    var btn = ev.target && ev.target.closest('[data-act]');
    if(!btn || !btn.closest('#iv-mobile-equipes')) return;
    var act = btn.dataset.act;
    var cardEl = btn.closest('.iv-team-card');
    var id = cardEl ? parseInt(cardEl.dataset.id, 10) : null;
    if(act === 'nova' && typeof openEquipeModal === 'function') return openEquipeModal();
    if(act === 'editar' && typeof openEquipeModal === 'function') return openEquipeModal(id);
    if(act === 'remover' && typeof deletarEquipe === 'function'){
      deletarEquipe(id);
      return setTimeout(renderMobileEquipes, 220);
    }
  }

  function patchRender(){
    if(typeof window.renderEquipes !== 'function' || window.renderEquipes._ivMobileTeams) return;
    var old = window.renderEquipes;
    window.renderEquipes = function(){
      var r = old.apply(this, arguments);
      setTimeout(renderMobileEquipes, 0);
      return r;
    };
    window.renderEquipes._ivMobileTeams = true;
  }

  function bind(){
    if(document.body.dataset.ivMobileTeams) return;
    document.body.dataset.ivMobileTeams = '1';
    document.addEventListener('input', handleInput);
    document.addEventListener('change', handleChange);
    document.addEventListener('click', handleClick);
  }

  function aplicar(){
    loadCSS();
    setMobileClass();
    limparTextoPremium();
    ensureBox();
    bind();
    patchRender();
    renderMobileEquipes();
  }

  ready(function(){
    aplicar();
    setTimeout(aplicar, 300);
    setTimeout(aplicar, 900);
    setTimeout(aplicar, 1800);
    if(mql.addEventListener) mql.addEventListener('change', aplicar);
    else if(mql.addListener) mql.addListener(aplicar);
  });
})();

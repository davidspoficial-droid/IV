// IV - Alunos em layout mobile proprio compacto com sanfona
(function(){
  'use strict';

  var mql = window.matchMedia('(max-width: 820px)');
  var marcados = new Set();
  var timer = null;

  function ready(fn){
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, {once:true});
    else fn();
  }

  function DBx(){ try { return typeof DB !== 'undefined' ? DB : null; } catch(e){ return null; } }
  function MODx(){ try { return typeof MODULOS !== 'undefined' ? MODULOS : null; } catch(e){ return null; } }
  function esc(v){ return String(v == null ? '' : v).replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]; }); }
  function norm(v){ return String(v || '').trim().replace(/\s+/g,' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR'); }
  function dig(v){ return String(v || '').replace(/\D/g,''); }

  function loadCSS(){
    if(document.getElementById('iv-mobile-students-css')){
      var old = document.getElementById('iv-mobile-students-css');
      if(old.getAttribute('href') !== './iv-mobile-students.css?v=2') old.setAttribute('href','./iv-mobile-students.css?v=2');
      return;
    }
    var l = document.createElement('link');
    l.id = 'iv-mobile-students-css';
    l.rel = 'stylesheet';
    l.href = './iv-mobile-students.css?v=2';
    document.head.appendChild(l);
  }

  function setMobileClass(){
    document.body.classList.toggle('iv-mobile-app', !!mql.matches);
  }

  function ensureBox(){
    var page = document.getElementById('page-alunos');
    if(!page) return null;
    var box = document.getElementById('iv-mobile-alunos');
    if(!box){
      box = document.createElement('div');
      box.id = 'iv-mobile-alunos';
      page.insertBefore(box, page.firstChild);
    }
    return box;
  }

  function tel(a){ return a && (a.telefone || a.celular || a.whatsapp || a.contato || a.phone) || ''; }
  function eq(a){ var db = DBx() || {}; return (db.equipes || []).find(function(e){ return String(e.id) === String(a.equipeId); }) || null; }
  function modName(a){ var mods = MODx() || {}; var m = String(a.modulo || '1'); return mods[m] ? mods[m].nome : m + 'º Módulo'; }
  function turma(t){ return t === 'quinta' ? 'Quinta-feira' : t === 'sabado' ? 'Sábado' : 'Sem turma'; }
  function iniciais(nome){ return String(nome || '?').trim().split(/\s+/).slice(0,2).map(function(p){ return p.charAt(0).toUpperCase(); }).join('') || '?'; }
  function stClass(s){ s = norm(s || 'ATIVO'); if(s.indexOf('desistente') >= 0) return 'desistente'; if(s.indexOf('inativo') >= 0) return 'inativo'; if(s.indexOf('trancado') >= 0) return 'trancado'; return 'ativo'; }
  function corMod(a){ var m = String(a.modulo || '1'); return m === '1' ? '#7EC8F0' : m === '2' ? '#7EDBA8' : '#F08080'; }

  function filtros(){
    return {
      q: (document.getElementById('iv-stu-search') || document.getElementById('busca-aluno') || {}).value || '',
      eq: (document.getElementById('iv-stu-equipe') || document.getElementById('filtro-equipe') || {}).value || '',
      turma: (document.getElementById('iv-stu-turma') || document.getElementById('filtro-turma') || {}).value || ''
    };
  }

  function lista(){
    var db = DBx() || {};
    var f = filtros();
    var q = norm(f.q);
    var qd = dig(f.q);
    return (db.alunos || []).slice().sort(function(a,b){ return String(a.nome || '').localeCompare(String(b.nome || ''),'pt-BR'); }).filter(function(a){
      var e = eq(a);
      var telefone = tel(a);
      var alvo = [a.nome, a.inscricao, telefone, e && e.nome, modName(a), turma(a.turma), a.situacao].map(norm).join(' ');
      if(q && alvo.indexOf(q) < 0 && !(qd && dig(telefone).indexOf(qd) >= 0)) return false;
      if(f.eq && String(a.equipeId || '') !== String(f.eq)) return false;
      if(f.turma && String(a.turma || '') !== String(f.turma)) return false;
      return true;
    });
  }

  function optEquipes(valor){
    var db = DBx() || {};
    var html = '<option value="">Todas as equipes</option>';
    (db.equipes || []).slice().sort(function(a,b){ return String(a.nome || '').localeCompare(String(b.nome || ''),'pt-BR'); }).forEach(function(e){
      html += '<option value="' + esc(e.id) + '" ' + (String(valor) === String(e.id) ? 'selected' : '') + '>' + esc(e.nome) + '</option>';
    });
    return html;
  }

  function card(a){
    var e = eq(a);
    var telefone = tel(a);
    var sit = a.situacao || 'ATIVO';
    var marcado = marcados.has(a.id);
    var statusClass = stClass(sit);
    return '<article class="iv-stu-card ' + (marcado ? 'selected' : '') + '" data-id="' + esc(a.id) + '" style="--c:' + corMod(a) + '">' +
      '<div class="iv-stu-compact">' +
        '<div class="iv-stu-avatar">' + esc(iniciais(a.nome)) + '</div>' +
        '<div><div class="iv-stu-name">' + esc(a.nome || '—') + '</div><div class="iv-stu-mini"><span class="iv-stu-mini-pill">' + esc(modName(a)) + '</span><span class="iv-stu-mini-pill status ' + statusClass + '">' + esc(sit) + '</span></div></div>' +
        '<div class="iv-stu-right"><input class="iv-stu-check" type="checkbox" data-act="marcar" aria-label="Selecionar aluno" ' + (marcado ? 'checked' : '') + '><div class="iv-stu-card-actions">' +
          '<button type="button" class="iv-stu-icon-btn edit" data-act="editar" title="Editar" aria-label="Editar aluno">✏️</button>' +
          (sit !== 'DESISTENTE' ? '<button type="button" class="iv-stu-icon-btn warn" data-act="desistente" title="Marcar desistente" aria-label="Marcar desistente">📉</button>' : '<button type="button" class="iv-stu-icon-btn warn" data-act="reativar" title="Reativar" aria-label="Reativar aluno">↩️</button>') +
          '<button type="button" class="iv-stu-icon-btn red" data-act="remover" title="Excluir" aria-label="Excluir aluno">🗑️</button></div></div>' +
      '</div>' +
      '<details class="iv-stu-details"><summary><span>✦ Ver informações</span><span class="chev">⌄</span></summary>' +
        '<div class="iv-stu-info">' +
          '<div class="iv-stu-chip"><span>Inscrição</span><strong>' + esc(a.inscricao || '—') + '</strong></div>' +
          '<div class="iv-stu-chip"><span>Telefone</span>' + (telefone ? '<a href="tel:' + esc(dig(telefone)) + '">' + esc(telefone) + '</a>' : '<strong class="muted">—</strong>') + '</div>' +
          '<div class="iv-stu-chip"><span>Equipe</span><strong>' + esc(e ? e.nome : 'Sem equipe') + '</strong></div>' +
          '<div class="iv-stu-chip"><span>Turma</span><strong>' + esc(turma(a.turma)) + '</strong></div>' +
          '<div class="iv-stu-chip"><span>Situação</span><strong><em class="iv-stu-status ' + statusClass + '">' + esc(sit) + '</em></strong></div>' +
          '<div class="iv-stu-chip"><span>ID</span><strong>#' + esc(a.id) + '</strong></div>' +
        '</div>' +
      '</details>' +
    '</article>';
  }

  function renderMobileAlunos(){
    var box = ensureBox();
    var db = DBx();
    if(!box || !db) return;
    var f = filtros();
    var itens = lista();
    var ativos = (db.alunos || []).filter(function(a){ return (a.situacao || 'ATIVO') === 'ATIVO'; }).length;
    box.innerHTML = '<div class="iv-stu-hero"><div class="iv-stu-hero-top"><div><div class="iv-stu-title">Cadastro de Alunos</div><div class="iv-stu-sub">Cards compactos no mobile com informações extras em sanfona.</div></div><div class="iv-stu-count"><strong>' + itens.length + '</strong><span>Exibidos</span></div></div></div>' +
      '<div class="iv-stu-actions"><button type="button" class="iv-stu-btn primary" data-act="novo">+ Novo aluno</button><button type="button" class="iv-stu-btn" data-act="importar">📋 Importar</button></div>' +
      '<div class="iv-stu-actions-row"><button type="button" class="iv-stu-btn" data-act="avancar">⬆️ Avançar</button><button type="button" class="iv-stu-btn" data-act="todos">☑️ Selecionar</button><button type="button" class="iv-stu-btn danger" data-act="removerMarcados">🗑️ ' + marcados.size + '</button></div>' +
      '<div class="iv-stu-filter"><input id="iv-stu-search" class="iv-stu-search" placeholder="🔍 Buscar por nome, telefone, equipe..." value="' + esc(f.q) + '"><div class="iv-stu-filter-grid"><select id="iv-stu-equipe" class="iv-stu-select">' + optEquipes(f.eq) + '</select><select id="iv-stu-turma" class="iv-stu-select"><option value="">Todas as turmas</option><option value="quinta" ' + (f.turma === 'quinta' ? 'selected' : '') + '>Quinta-feira</option><option value="sabado" ' + (f.turma === 'sabado' ? 'selected' : '') + '>Sábado</option></select></div><div class="iv-stu-sub" style="margin-top:8px">' + ativos + ' alunos ativos no total · ' + (db.alunos || []).length + ' cadastrados</div></div>' +
      '<div class="iv-stu-list">' + (itens.length ? itens.map(card).join('') : '<div class="iv-stu-empty">Nenhum aluno encontrado com os filtros selecionados.</div>') + '</div>';
  }

  function syncFiltros(){
    var f = filtros();
    var b = document.getElementById('busca-aluno'); if(b) b.value = f.q;
    var e = document.getElementById('filtro-equipe'); if(e) e.value = f.eq;
    var t = document.getElementById('filtro-turma'); if(t) t.value = f.turma;
  }

  function marca(id, checked){
    if(checked) marcados.add(id); else marcados.delete(id);
    if(typeof toggleSelAluno === 'function') toggleSelAluno(id, {checked:checked, closest:function(){ return null; }});
  }

  function handleInput(ev){
    if(!ev.target || !ev.target.closest('#iv-mobile-alunos')) return;
    if(ev.target.id === 'iv-stu-search'){
      syncFiltros();
      clearTimeout(timer);
      timer = setTimeout(renderMobileAlunos, 90);
    }
  }

  function handleChange(ev){
    if(!ev.target || !ev.target.closest('#iv-mobile-alunos')) return;
    if(ev.target.id === 'iv-stu-equipe' || ev.target.id === 'iv-stu-turma'){
      syncFiltros();
      renderMobileAlunos();
      return;
    }
    if(ev.target.dataset.act === 'marcar'){
      var cardEl = ev.target.closest('.iv-stu-card');
      if(cardEl) marca(parseInt(cardEl.dataset.id,10), ev.target.checked);
      renderMobileAlunos();
    }
  }

  function handleClick(ev){
    var btn = ev.target && ev.target.closest('[data-act]');
    if(!btn || !btn.closest('#iv-mobile-alunos')) return;
    var act = btn.dataset.act;
    var cardEl = btn.closest('.iv-stu-card');
    var id = cardEl ? parseInt(cardEl.dataset.id,10) : null;
    if(act === 'novo' && typeof openAlunoModal === 'function') return openAlunoModal();
    if(act === 'importar' && typeof openImportModal === 'function') return openImportModal();
    if(act === 'avancar' && typeof openAvancarModuloModal === 'function') return openAvancarModuloModal();
    if(act === 'todos'){
      var itens = lista();
      var all = itens.length && itens.every(function(a){ return marcados.has(a.id); });
      itens.forEach(function(a){ marca(a.id, !all); });
      return renderMobileAlunos();
    }
    if(act === 'removerMarcados'){
      if(typeof excluirSelecionados === 'function') excluirSelecionados();
      marcados.clear();
      return setTimeout(renderMobileAlunos, 220);
    }
    if(act === 'editar' && typeof openAlunoModal === 'function') return openAlunoModal(id);
    if(act === 'desistente' && typeof marcarDesistente === 'function'){ marcarDesistente(id); return setTimeout(renderMobileAlunos, 220); }
    if(act === 'reativar' && typeof reativarAluno === 'function'){ reativarAluno(id); return setTimeout(renderMobileAlunos, 220); }
    if(act === 'remover' && typeof deletarAluno === 'function'){
      deletarAluno(id);
      marcados.delete(id);
      return setTimeout(renderMobileAlunos, 220);
    }
  }

  function patchRender(){
    if(typeof window.renderAlunos !== 'function' || window.renderAlunos._ivMobileStudents) return;
    var old = window.renderAlunos;
    window.renderAlunos = function(){
      var r = old.apply(this, arguments);
      setTimeout(renderMobileAlunos, 0);
      return r;
    };
    window.renderAlunos._ivMobileStudents = true;
  }

  function bind(){
    if(document.body.dataset.ivMobileStudents) return;
    document.body.dataset.ivMobileStudents = '1';
    document.addEventListener('input', handleInput);
    document.addEventListener('change', handleChange);
    document.addEventListener('click', handleClick);
  }

  function aplicar(){
    loadCSS();
    setMobileClass();
    ensureBox();
    bind();
    patchRender();
    renderMobileAlunos();
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

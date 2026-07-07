// IV - Presenca em layout mobile proprio
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
  function key(alunoId, modulo, semana, aula){ if(typeof presKey === 'function') return presKey(alunoId, modulo, semana, aula); return alunoId + '_' + modulo + '_' + semana + '_' + aula; }

  function loadCSS(){
    if(document.getElementById('iv-mobile-presence-css')) return;
    var l = document.createElement('link');
    l.id = 'iv-mobile-presence-css';
    l.rel = 'stylesheet';
    l.href = './iv-mobile-presence.css?v=1';
    document.head.appendChild(l);
  }

  function setMobileClass(){ document.body.classList.toggle('iv-mobile-app', !!mql.matches); }

  function ensureBox(){
    var page = document.getElementById('page-presenca');
    if(!page) return null;
    var box = document.getElementById('iv-mobile-presenca');
    if(!box){
      box = document.createElement('div');
      box.id = 'iv-mobile-presenca';
      page.insertBefore(box, page.firstChild);
    }
    return box;
  }

  function iniciais(nome){ return String(nome || '?').trim().split(/\s+/).slice(0,2).map(function(p){ return p.charAt(0).toUpperCase(); }).join('') || '?'; }
  function equipe(al){ var db = DBx() || {}; return (db.equipes || []).find(function(e){ return String(e.id) === String(al.equipeId); }) || null; }
  function aulaLabel(a){ if(a === 'AP') return 'Apresentação'; if(a === 'INAU') return 'Inaugural'; return 'Aula ' + a; }
  function corTotal(total, max){ return total === max ? 'ok' : total === 0 ? 'no' : 'mid'; }

  function estado(){
    var mods = MODx() || {};
    var m = (document.getElementById('iv-pres-modulo') || document.getElementById('pres-modulo') || {}).value || '1';
    var mod = mods[m] || mods[parseInt(m,10)] || {semanas:[]};
    var s = (document.getElementById('iv-pres-semana') || document.getElementById('pres-semana') || {}).value || '0';
    if(!mod.semanas[parseInt(s,10)]) s = '0';
    return {
      modulo: String(m),
      semana: parseInt(s,10),
      equipe: (document.getElementById('iv-pres-equipe') || document.getElementById('pres-equipe-filtro') || {}).value || '',
      busca: (document.getElementById('iv-pres-busca') || document.getElementById('pres-busca') || {}).value || ''
    };
  }

  function syncOrig(){
    var e = estado();
    var m = document.getElementById('pres-modulo'); if(m) m.value = e.modulo;
    var s = document.getElementById('pres-semana'); if(s) s.value = String(e.semana);
    var eq = document.getElementById('pres-equipe-filtro'); if(eq) eq.value = e.equipe;
    var b = document.getElementById('pres-busca'); if(b) b.value = e.busca;
  }

  function semanasOptions(modulo, atual){
    var mods = MODx() || {};
    var mod = mods[modulo] || mods[parseInt(modulo,10)] || {semanas:[]};
    return (mod.semanas || []).map(function(s,i){ return '<option value="' + i + '" ' + (String(i) === String(atual) ? 'selected' : '') + '>' + esc(s.label || ('Semana ' + (i+1))) + '</option>'; }).join('');
  }

  function equipesOptions(valor){
    var db = DBx() || {};
    var html = '<option value="">Todas as equipes</option>';
    (db.equipes || []).slice().sort(function(a,b){ return String(a.nome || '').localeCompare(String(b.nome || ''),'pt-BR'); }).forEach(function(e){ html += '<option value="' + esc(e.id) + '" ' + (String(valor) === String(e.id) ? 'selected' : '') + '>' + esc(e.nome) + '</option>'; });
    return html;
  }

  function alunosFiltrados(){
    var db = DBx() || {};
    var e = estado();
    var q = norm(e.busca);
    return (db.alunos || []).filter(function(a){
      if((a.situacao || 'ATIVO') !== 'ATIVO') return false;
      if(String(a.modulo || '1') !== String(e.modulo)) return false;
      if(e.equipe && String(a.equipeId || '') !== String(e.equipe)) return false;
      var eq = equipe(a);
      var alvo = [a.nome, a.inscricao, eq && eq.nome].map(norm).join(' ');
      if(q && alvo.indexOf(q) < 0) return false;
      return true;
    }).sort(function(a,b){ return String(a.nome || '').localeCompare(String(b.nome || ''),'pt-BR'); });
  }

  function aulaInfo(modulo, semana){
    var mods = MODx() || {};
    var mod = mods[modulo] || mods[parseInt(modulo,10)] || {semanas:[]};
    var sem = mod.semanas[semana] || {label:'Semana', aulas:[]};
    var aulas = sem.aulas || [];
    var texto = aulas.length === 1 ? aulaLabel(aulas[0]) : aulas.map(aulaLabel).join(' e ');
    return {sem:sem, aulas:aulas, texto:(sem.label || 'Semana') + ' — ' + texto};
  }

  function cardAluno(al, e, info){
    var db = DBx() || {};
    var eq = equipe(al);
    var total = 0;
    var botoes = info.aulas.map(function(a){
      var pres = !!(db.presencas || {})[key(al.id, e.modulo, e.semana, a)];
      if(pres) total++;
      return '<button type="button" class="iv-pres-aula ' + (pres ? 'sim' : 'nao') + '" data-act="toggle" data-id="' + esc(al.id) + '" data-aula="' + esc(a) + '"><span>' + (pres ? '✅' : '❌') + '</span><span>' + esc(aulaLabel(a)) + '</span></button>';
    }).join('');
    return '<article class="iv-pres-card" style="--c:#7EC8F0" data-id="' + esc(al.id) + '">' +
      '<div class="iv-pres-head"><div class="iv-pres-avatar">' + esc(iniciais(al.nome)) + '</div><div><div class="iv-pres-name">' + esc(al.nome || '—') + '</div><div class="iv-pres-mini"><span class="iv-pres-pill">' + esc(al.inscricao || 'Sem inscrição') + '</span><span class="iv-pres-pill">' + esc(eq ? eq.nome : 'Sem equipe') + '</span></div></div><span class="iv-pres-pill total ' + corTotal(total, info.aulas.length) + '">' + total + '/' + info.aulas.length + '</span></div>' +
      '<div class="iv-pres-aulas">' + botoes + '</div>' +
    '</article>';
  }

  function renderMobilePresenca(){
    var box = ensureBox();
    var db = DBx();
    var mods = MODx();
    if(!box || !db || !mods) return;
    var e = estado();
    var info = aulaInfo(e.modulo, e.semana);
    var alunos = alunosFiltrados();
    var totalPres = alunos.reduce(function(acc,al){ return acc + info.aulas.filter(function(a){ return !!(db.presencas || {})[key(al.id, e.modulo, e.semana, a)]; }).length; }, 0);
    var max = alunos.length * info.aulas.length;
    box.innerHTML = '<div class="iv-pres-hero"><div class="iv-pres-hero-top"><div><div class="iv-pres-title">Presença</div></div><div class="iv-pres-count"><strong>' + totalPres + '/' + max + '</strong><span>Presenças</span></div></div></div>' +
      '<div class="iv-pres-filters"><div class="iv-pres-grid"><select id="iv-pres-modulo" class="iv-pres-select"><option value="1" ' + (e.modulo === '1' ? 'selected' : '') + '>1º Módulo</option><option value="2" ' + (e.modulo === '2' ? 'selected' : '') + '>2º Módulo</option><option value="3" ' + (e.modulo === '3' ? 'selected' : '') + '>3º Módulo</option></select><select id="iv-pres-semana" class="iv-pres-select">' + semanasOptions(e.modulo, e.semana) + '</select><select id="iv-pres-equipe" class="iv-pres-select">' + equipesOptions(e.equipe) + '</select><input id="iv-pres-busca" class="iv-pres-search" placeholder="🔍 Buscar aluno..." value="' + esc(e.busca) + '"></div><div class="iv-pres-aula-info">📚 ' + esc(info.texto) + '</div></div>' +
      '<div class="iv-pres-actions"><button type="button" class="iv-pres-btn green" data-act="todos-sim">✅ Todos presentes</button><button type="button" class="iv-pres-btn red" data-act="todos-nao">❌ Limpar presença</button></div>' +
      '<div class="iv-pres-list">' + (alunos.length ? alunos.map(function(al){ return cardAluno(al, e, info); }).join('') : '<div class="iv-pres-empty">Nenhum aluno ativo neste filtro.</div>') + '</div>';
    syncOrig();
  }

  function alterarPresenca(id, aula){
    if(typeof userCan === 'function' && !userCan('presenca_manage')){ if(typeof toast === 'function') toast('Você não tem permissão para lançar presença.', true); return; }
    var e = estado();
    var k = key(id, e.modulo, e.semana, aula);
    var db = DBx();
    if(!db) return;
    db.presencas[k] = !db.presencas[k];
    if(typeof saveDB === 'function') saveDB();
    renderMobilePresenca();
  }

  function marcarTodosMobile(presente){
    if(typeof userCan === 'function' && !userCan('presenca_manage')){ if(typeof toast === 'function') toast('Você não tem permissão para lançar presença.', true); return; }
    var db = DBx();
    if(!db) return;
    var e = estado();
    var info = aulaInfo(e.modulo, e.semana);
    var alunos = alunosFiltrados();
    alunos.forEach(function(al){ info.aulas.forEach(function(a){ db.presencas[key(al.id, e.modulo, e.semana, a)] = !!presente; }); });
    if(typeof saveDB === 'function') saveDB();
    if(typeof toast === 'function') toast(presente ? alunos.length + ' alunos marcados presentes!' : 'Presenças removidas.');
    renderMobilePresenca();
  }

  function handleInput(ev){
    if(!ev.target || !ev.target.closest('#iv-mobile-presenca')) return;
    if(ev.target.id === 'iv-pres-busca'){
      clearTimeout(timer);
      timer = setTimeout(renderMobilePresenca, 90);
    }
  }

  function handleChange(ev){
    if(!ev.target || !ev.target.closest('#iv-mobile-presenca')) return;
    if(ev.target.id === 'iv-pres-modulo'){
      setTimeout(function(){
        var s = document.getElementById('iv-pres-semana');
        if(s) s.value = '0';
        renderMobilePresenca();
      }, 0);
      return;
    }
    if(ev.target.id === 'iv-pres-semana' || ev.target.id === 'iv-pres-equipe') renderMobilePresenca();
  }

  function handleClick(ev){
    var btn = ev.target && ev.target.closest('[data-act]');
    if(!btn || !btn.closest('#iv-mobile-presenca')) return;
    var act = btn.dataset.act;
    if(act === 'toggle') return alterarPresenca(parseInt(btn.dataset.id,10), btn.dataset.aula);
    if(act === 'todos-sim') return marcarTodosMobile(true);
    if(act === 'todos-nao') return marcarTodosMobile(false);
  }

  function patchInit(){
    if(typeof window.initPresenca === 'function' && !window.initPresenca._ivMobilePresence){
      var old = window.initPresenca;
      window.initPresenca = function(){
        var r = old.apply(this, arguments);
        setTimeout(renderMobilePresenca, 0);
        return r;
      };
      window.initPresenca._ivMobilePresence = true;
    }
    if(typeof window.renderPresencaTabela === 'function' && !window.renderPresencaTabela._ivMobilePresence){
      var oldR = window.renderPresencaTabela;
      window.renderPresencaTabela = function(){
        var r = oldR.apply(this, arguments);
        setTimeout(renderMobilePresenca, 0);
        return r;
      };
      window.renderPresencaTabela._ivMobilePresence = true;
    }
  }

  function bind(){
    if(document.body.dataset.ivMobilePresence) return;
    document.body.dataset.ivMobilePresence = '1';
    document.addEventListener('input', handleInput);
    document.addEventListener('change', handleChange);
    document.addEventListener('click', handleClick);
  }

  function aplicar(){
    loadCSS();
    setMobileClass();
    ensureBox();
    bind();
    patchInit();
    renderMobilePresenca();
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

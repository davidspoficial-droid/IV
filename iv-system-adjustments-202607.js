// IV — ajustes solicitados: alunos, telefone, presença e retenção
// HOTFIX: removido bloqueio visual "Entrando no sistema..." para não travar o login.
(function(){
  'use strict';

  var renderLock = false;
  var styleId = 'iv-system-adjustments-202607-style';

  function ready(fn){
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, {once:true});
    else fn();
  }

  function esc(v){
    return String(v == null ? '' : v).replace(/[&<>"']/g, function(m){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m];
    });
  }

  function getDB(){ try { return typeof DB !== 'undefined' ? DB : null; } catch(e){ return null; } }
  function getMODULOS(){ try { return typeof MODULOS !== 'undefined' ? MODULOS : null; } catch(e){ return null; } }
  function getSelected(){ try { return typeof _selectedIds !== 'undefined' ? _selectedIds : null; } catch(e){ return null; } }
  function digitos(v){ return String(v || '').replace(/\D/g, '').slice(0, 11); }

  function formatarTelefone(v){
    var d = digitos(v);
    if(!d) return '';
    if(d.length <= 2) return '(' + d;
    if(d.length <= 6) return '(' + d.slice(0,2) + ') ' + d.slice(2);
    if(d.length <= 10) return '(' + d.slice(0,2) + ') ' + d.slice(2,6) + '-' + d.slice(6);
    return '(' + d.slice(0,2) + ') ' + d.slice(2,7) + '-' + d.slice(7);
  }

  function valorTelefone(aluno){
    return aluno && (aluno.telefone || aluno.celular || aluno.whatsapp || aluno.contato || aluno.phone) || '';
  }

  function nomeEquipe(aluno){
    var D = getDB();
    var eq = D && Array.isArray(D.equipes) ? D.equipes.find(function(e){ return String(e.id) === String(aluno.equipeId); }) : null;
    return eq ? eq.nome : '';
  }

  function nomeModulo(aluno){
    var M = getMODULOS();
    var m = String(aluno && aluno.modulo || '1');
    return M && M[m] ? M[m].nome : m + 'º Módulo';
  }

  function normalizarTelefones(){
    var D = getDB();
    if(!D || !Array.isArray(D.alunos)) return;
    D.alunos.forEach(function(a){ if(a) a.telefone = formatarTelefone(valorTelefone(a)); });
  }

  function ensureStyles(){
    if(document.getElementById(styleId)) return;
    var s = document.createElement('style');
    s.id = styleId;
    s.textContent = [
      '#page-alunos{max-width:min(1540px,calc(100vw - 32px))!important}',
      '#page-alunos .tbl-wrap,#page-presenca .tbl-wrap{overflow-x:auto!important;width:100%!important}',
      '#page-alunos table{min-width:1320px!important;table-layout:auto!important}',
      '#page-alunos th,#page-alunos td,#tbl-presenca-wrap th{white-space:nowrap!important}',
      '#page-alunos .c-nome{min-width:260px}',
      '#page-alunos .c-phone{min-width:145px;width:145px}',
      '#page-alunos .c-equipe{min-width:230px;width:230px}',
      '#page-alunos .c-mod{min-width:132px;width:132px}',
      '#page-alunos .c-turma{min-width:120px;width:120px}',
      '#page-alunos .c-sit{min-width:115px;width:115px}',
      '#page-alunos .c-acoes{min-width:150px;width:150px}',
      '.iv-phone-cell a{color:#BFEAFF!important;text-decoration:none!important;font-weight:850}',
      '#tbl-presenca-wrap{min-width:760px!important;table-layout:auto!important}',
      '#tbl-presenca-wrap #th-a1,#tbl-presenca-wrap #th-a2{min-width:112px!important;padding-left:12px!important;padding-right:12px!important}'
    ].join('\n');
    document.head.appendChild(s);
  }

  function limparTravamentoLoginAntigo(){
    document.body.classList.remove('iv-session-restore');
    var old = document.getElementById('iv-session-restore-style');
    if(old) old.remove();
    try { localStorage.removeItem('ivAuthOk'); } catch(e) {}
  }

  function ensureCampoTelefone(){
    var inscricao = document.getElementById('al-inscricao');
    if(!inscricao) return null;

    var input = document.getElementById('al-telefone');
    if(!input){
      var box = document.createElement('div');
      box.innerHTML = '<label>Telefone</label><input id="al-telefone" type="tel" inputmode="tel" autocomplete="tel" maxlength="15" placeholder="(11) 99999-9999">';
      if(inscricao.parentElement) inscricao.parentElement.insertAdjacentElement('afterend', box);
      input = document.getElementById('al-telefone');
      var row = inscricao.closest('.form-row');
      if(row) row.classList.add('tri');
    }

    var label = (input.closest('div') || document).querySelector('label');
    if(label) label.textContent = 'Telefone';

    if(!input.dataset.ivMask){
      input.dataset.ivMask = '1';
      input.addEventListener('input', function(){ this.value = formatarTelefone(this.value); });
      input.addEventListener('blur', function(){ this.value = formatarTelefone(this.value); });
    }
    return input;
  }

  function headerAlunos(){
    var page = document.getElementById('page-alunos');
    var tr = page && page.querySelector('thead tr');
    if(!tr) return;
    tr.innerHTML = '<th style="width:36px"><input type="checkbox" id="chk-all" onchange="toggleCheckAll(this)" style="cursor:pointer;accent-color:var(--blue)"></th>' +
      '<th style="width:52px">#</th><th style="width:110px">Nº Insc.</th><th class="c-nome">Nome</th>' +
      '<th class="c-phone" data-iv-phone-th="1">Telefone</th><th class="c-equipe">Equipe</th><th class="c-mod">Módulo</th>' +
      '<th class="c-turma">📅 Turma</th><th class="c-sit">Situação</th><th class="c-acoes" style="text-align:center">Ações</th>';
  }

  function turmaHTML(v){
    if(v === 'quinta') return '<span class="badge" style="background:rgba(74,144,217,.15);color:#7EC8F0;font-size:10px">📅 Quinta</span>';
    if(v === 'sabado') return '<span class="badge" style="background:rgba(155,89,182,.15);color:#C39BD3;font-size:10px">📅 Sábado</span>';
    return '<span style="color:var(--muted);font-size:11px">—</span>';
  }

  function listaAlunos(){
    var D = getDB();
    if(!D || !Array.isArray(D.alunos)) return [];

    var busca = ((document.getElementById('busca-aluno') || {}).value || '').toLowerCase().trim();
    var buscaDig = digitos(busca);
    var fEq = (document.getElementById('filtro-equipe') || {}).value;
    var fTurma = (document.getElementById('filtro-turma') || {}).value;

    var lista = D.alunos.slice().sort(function(a,b){ return String(a.nome || '').localeCompare(String(b.nome || ''), 'pt-BR'); });

    if(busca){
      lista = lista.filter(function(a){
        var tel = valorTelefone(a);
        var eq = nomeEquipe(a).toLowerCase();
        return String(a.nome || '').toLowerCase().includes(busca) ||
          String(a.inscricao || '').toLowerCase().includes(busca) ||
          eq.includes(busca) ||
          String(tel || '').toLowerCase().includes(busca) ||
          (buscaDig && digitos(tel).includes(buscaDig));
      });
    }
    if(fEq) lista = lista.filter(function(a){ return String(a.equipeId || '') === String(fEq); });
    if(fTurma) lista = lista.filter(function(a){ return String(a.turma || '') === String(fTurma); });
    return lista;
  }

  function rowAluno(al, i){
    var selected = getSelected();
    var checked = selected && selected.has && selected.has(al.id);
    var sit = al.situacao || 'ATIVO';
    var sitClass = sit === 'ATIVO' ? 'badge-g' : (sit === 'DESISTENTE' || sit === 'INATIVO') ? 'badge-r' : 'badge-p';
    var tel = formatarTelefone(valorTelefone(al));
    var eq = nomeEquipe(al);
    var id = esc(al.id);

    return '<tr class="' + (checked ? 'row-sel' : '') + '">' +
      '<td style="text-align:center"><input type="checkbox" ' + (checked ? 'checked' : '') + ' class="chk-aluno" data-id="' + id + '" onchange="toggleSelAluno(' + id + ',this)" style="cursor:pointer;accent-color:var(--blue)"></td>' +
      '<td style="color:var(--muted)">' + (i + 1) + '</td>' +
      '<td style="color:var(--muted);font-size:12px">' + esc(al.inscricao || '—') + '</td>' +
      '<td class="c-nome"><strong>' + esc(al.nome || '—') + '</strong></td>' +
      '<td class="iv-phone-cell c-phone">' + (tel ? '<a href="tel:' + esc(digitos(tel)) + '">' + esc(tel) + '</a>' : '<span style="color:var(--muted)">—</span>') + '</td>' +
      '<td class="c-equipe">' + (eq ? '<span class="badge badge-b">' + esc(eq) + '</span>' : '<span style="color:var(--muted)">—</span>') + '</td>' +
      '<td class="c-mod"><span class="badge badge-p" style="font-size:10px">' + esc(nomeModulo(al)) + '</span></td>' +
      '<td class="c-turma">' + turmaHTML(al.turma) + '</td>' +
      '<td class="c-sit"><span class="badge ' + sitClass + '">' + esc(sit) + '</span></td>' +
      '<td class="c-acoes"><div style="display:flex;gap:6px;justify-content:center;white-space:nowrap">' +
        (sit !== 'DESISTENTE' ? '<button class="btn btn-red btn-xs" title="Marcar como Desistente" onclick="marcarDesistente(' + id + ')">📉</button>' : '<button class="btn btn-green btn-xs" title="Reativar" onclick="reativarAluno(' + id + ')">↩️</button>') +
        '<button class="btn btn-ghost btn-xs" onclick="openAlunoModal(' + id + ')">✏️</button>' +
        '<button class="btn btn-red btn-xs" onclick="deletarAluno(' + id + ')">🗑️</button>' +
      '</div></td></tr>';
  }

  function renderAlunosSeguro(){
    if(renderLock) return;
    renderLock = true;
    try{
      normalizarTelefones();
      headerAlunos();
      var tb = document.getElementById('tb-alunos');
      var lista = listaAlunos();
      if(!tb) return;
      tb.innerHTML = lista.length ? lista.map(rowAluno).join('') : '<tr><td colspan="10" style="text-align:center;padding:32px;color:var(--muted)">Nenhum aluno encontrado</td></tr>';
      if(typeof updateSelUI === 'function') updateSelUI();
      if(typeof aplicarPermissoesUI === 'function') aplicarPermissoesUI();
    } finally {
      setTimeout(function(){ renderLock = false; }, 0);
    }
  }

  function patchAlunos(){
    if(typeof window.renderAlunos === 'function' && !window.renderAlunos._ivStable){
      window.renderAlunos = function(){ return renderAlunosSeguro(); };
      window.renderAlunos._ivStable = true;
    }

    if(typeof window.openAlunoModal === 'function' && !window.openAlunoModal._ivFone){
      var oldOpen = window.openAlunoModal;
      window.openAlunoModal = function(id){
        var r = oldOpen.apply(this, arguments);
        setTimeout(function(){
          var input = ensureCampoTelefone();
          var D = getDB();
          var aluno = id && D && D.alunos ? D.alunos.find(function(a){ return String(a.id) === String(id); }) : null;
          if(input) input.value = formatarTelefone(valorTelefone(aluno));
        }, 0);
        return r;
      };
      window.openAlunoModal._ivFone = true;
    }

    if(typeof window.salvarAluno === 'function' && !window.salvarAluno._ivFone){
      var oldSave = window.salvarAluno;
      window.salvarAluno = function(){
        var input = ensureCampoTelefone();
        var tel = formatarTelefone(input && input.value || '');
        var id = (document.getElementById('al-id') || {}).value || '';
        var nome = ((document.getElementById('al-nome') || {}).value || '').trim();
        if(input) input.value = tel;
        var r = oldSave.apply(this, arguments);
        setTimeout(function(){
          var D = getDB();
          if(!D || !D.alunos) return;
          var aluno = id ? D.alunos.find(function(a){ return String(a.id) === String(id); }) : D.alunos.slice().reverse().find(function(a){ return String(a.nome || '').trim() === nome; });
          if(aluno && formatarTelefone(valorTelefone(aluno)) !== tel){
            aluno.telefone = tel;
            if(typeof saveDB === 'function') saveDB();
          }
          renderAlunosSeguro();
        }, 40);
        return r;
      };
      window.salvarAluno._ivFone = true;
    }

    ensureCampoTelefone();
    renderAlunosSeguro();
  }

  function addRetencaoOption(){
    var s = document.getElementById('exp-tipo');
    if(s && !s.querySelector('option[value="retencao_modulo"]')){
      var o = document.createElement('option');
      o.value = 'retencao_modulo';
      o.textContent = '📈 Retenção por módulo';
      s.appendChild(o);
    }
  }

  function alunoIniciou(aluno, modulo, presencas){
    var atual = parseInt(aluno.modulo || '1', 10);
    if(atual >= modulo) return true;
    var pref = String(aluno.id) + '_' + modulo + '_';
    return Object.keys(presencas || {}).some(function(k){ return k.indexOf(pref) === 0 && !!presencas[k]; });
  }

  function alunoConcluiu(aluno, modulo, presencas, M){
    var atual = parseInt(aluno.modulo || '1', 10);
    if(atual > modulo) return true;
    var mod = M && M[modulo];
    if(!mod || !mod.semanas) return false;
    var si = mod.semanas.length - 1;
    var aulas = mod.semanas[si].aulas || [];
    return aulas.some(function(au){ return !!presencas[presKey(aluno.id, modulo, si, au)]; });
  }

  function dadosRetencao(){
    var D = getDB() || {};
    var M = getMODULOS() || {};
    var P = D.presencas || {};
    var alunos = D.alunos || [];
    var filtro = (document.getElementById('exp-modulo') || {}).value || 'todos';
    var modulos = filtro === 'todos' ? [1,2,3] : [parseInt(filtro, 10)];

    return modulos.map(function(m){
      var iniciaram = alunos.filter(function(a){ return alunoIniciou(a, m, P); });
      var concluiram = iniciaram.filter(function(a){ return alunoConcluiu(a, m, P, M); });
      var desistentes = iniciaram.filter(function(a){ return (a.situacao || 'ATIVO') === 'DESISTENTE' && !alunoConcluiu(a, m, P, M); });
      var andamento = Math.max(iniciaram.length - concluiram.length - desistentes.length, 0);
      var mod = M[m] || {nome:m + 'º Módulo', cor:'#7EC8F0'};
      return {m:m, nome:mod.nome, cor:mod.cor || '#7EC8F0', iniciaram:iniciaram.length, concluiram:concluiram.length, desistentes:desistentes.length, andamento:andamento, pct:iniciaram.length ? Math.round(concluiram.length / iniciaram.length * 100) : 0};
    });
  }

  function htmlRetencao(titulo, versao){
    var rows = dadosRetencao();
    var totalIni = rows.reduce(function(s,x){ return s + x.iniciaram; }, 0);
    var totalCon = rows.reduce(function(s,x){ return s + x.concluiram; }, 0);
    var totalAnd = rows.reduce(function(s,x){ return s + x.andamento; }, 0);
    var pctGeral = totalIni ? Math.round(totalCon / totalIni * 100) : 0;
    var mobile = versao !== 'web';
    var dt = new Date().toLocaleDateString('pt-BR', {day:'2-digit', month:'long', year:'numeric'});

    var css = '<style>*{box-sizing:border-box}body{margin:0;padding:' + (mobile?'12px':'28px') + ';background:radial-gradient(circle at 12% 0,rgba(47,128,237,.24),transparent 32%),linear-gradient(145deg,#020611,#07111F 48%,#030712);color:#EAF4FF;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Arial,sans-serif}.shell{max-width:' + (mobile?'760px':'1120px') + ';margin:auto;background:rgba(8,19,36,.88);border:1px solid rgba(126,200,240,.18);border-radius:26px;box-shadow:0 28px 80px rgba(0,0,0,.44);overflow:hidden}.hero{padding:26px;background:linear-gradient(135deg,rgba(7,17,31,.98),rgba(16,40,70,.84));border-bottom:1px solid rgba(126,200,240,.16)}.badge{display:inline-block;padding:7px 12px;border-radius:999px;background:linear-gradient(135deg,#2F80ED,#22D3EE);font-size:11px;font-weight:900}.title{font-size:' + (mobile?'25px':'34px') + ';font-weight:950;margin-top:10px}.sub{color:#9CB8D6;font-size:12px;margin-top:7px}.content{padding:' + (mobile?'14px':'24px') + '}.kpis,.grid{display:grid;grid-template-columns:repeat(' + (mobile?'2':'4') + ',1fr);gap:10px}.grid{grid-template-columns:repeat(' + (mobile?'1':'3') + ',1fr);margin-top:16px}.kpi,.card{background:linear-gradient(145deg,rgba(255,255,255,.048),rgba(255,255,255,.012)),rgba(7,17,31,.78);border:1px solid rgba(126,200,240,.15);border-radius:18px;padding:15px;box-shadow:0 16px 40px rgba(0,0,0,.24)}.num,.big{font-size:31px;font-weight:950;color:var(--c);line-height:1}.txt{font-size:10px;color:#8FAACB;text-transform:uppercase;font-weight:900;letter-spacing:1px;margin-top:5px}.big{font-size:40px}.line{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(126,200,240,.09);font-size:13px}.tag{display:inline-flex;padding:4px 9px;border-radius:999px;font-size:10px;font-weight:900}.g{background:rgba(62,201,122,.14);color:#7EDBA8}.b{background:rgba(74,144,217,.14);color:#7EC8F0}.r{background:rgba(224,85,85,.14);color:#F08080}.note{font-size:11px;line-height:1.55;color:#9CB8D6;margin-top:14px}@media(max-width:780px){.kpis{grid-template-columns:1fr 1fr}.grid{grid-template-columns:1fr}}</style>';

    var body = '<div class="kpis"><div class="kpi" style="--c:#7EC8F0"><div class="num">' + totalIni + '</div><div class="txt">Iniciaram</div></div><div class="kpi" style="--c:#3EC97A"><div class="num">' + totalCon + '</div><div class="txt">Concluíram</div></div><div class="kpi" style="--c:#F39C12"><div class="num">' + totalAnd + '</div><div class="txt">Em andamento</div></div><div class="kpi" style="--c:#9B59B6"><div class="num">' + pctGeral + '%</div><div class="txt">Retenção geral</div></div></div><div class="grid">' +
      rows.map(function(r){
        return '<div class="card" style="--c:' + esc(r.cor) + '"><h2 style="margin:0 0 10px;color:var(--c);font-size:18px">' + esc(r.nome) + '</h2><div class="big">' + r.pct + '%</div><div class="txt">Retenção do módulo</div><div style="margin-top:13px"><div class="line"><span>Iniciaram</span><strong>' + r.iniciaram + '</strong></div><div class="line"><span>Concluíram</span><span class="tag g">' + r.concluiram + '</span></div><div class="line"><span>Em andamento</span><span class="tag b">' + r.andamento + '</span></div><div class="line"><span>Desistentes</span><span class="tag ' + (r.desistentes ? 'r' : 'g') + '">' + r.desistentes + '</span></div></div></div>';
      }).join('') +
      '</div><div class="card note">Critério: “iniciou” = aluno atualmente no módulo ou com presença registrada nele. “concluiu” = aluno avançou para o módulo seguinte ou possui presença na última semana/apresentação do módulo.</div>';

    return '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + esc(titulo) + ' — Retenção por módulo</title>' + css + '</head><body><main class="shell"><header class="hero"><div class="badge">📈 Retenção por módulo · ' + (versao === 'web' ? 'Web' : 'Mobile') + '</div><div class="title">' + esc(titulo) + '</div><div class="sub">Gerado em ' + dt + ' · Instituto de Vencedores</div></header><section class="content">' + body + '</section></main></body></html>';
  }

  function patchRelatorioRetencao(){
    addRetencaoOption();
    if(typeof window.gerarRelatorioLink !== 'function' || window.gerarRelatorioLink._ivRetencao) return;

    var old = window.gerarRelatorioLink;
    window.gerarRelatorioLink = async function(){
      addRetencaoOption();
      var tipo = (document.getElementById('exp-tipo') || {}).value;
      if(tipo !== 'retencao_modulo') return old.apply(this, arguments);

      var titulo = (document.getElementById('exp-titulo') || {}).value || 'Instituto de Vencedores';
      var modulo = (document.getElementById('exp-modulo') || {}).value || 'todos';
      var web = document.getElementById('tab-web');
      var versao = web && web.classList.contains('active') ? 'web' : 'mobile';
      var html = htmlRetencao(titulo, versao);

      if(typeof toast === 'function') toast('Gerando link, aguarde...⏳');
      try{
        var id = 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2,6);
        var fb = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
        await fb.setDoc(fb.doc(fb.getFirestore(), 'relatorios', id), {html:html, titulo:titulo, tipo:'Retenção por módulo', modulo:modulo, versao:versao, criadoEm:new Date().toISOString()});
        var link = location.origin + '/relatorio?id=' + id;
        var input = document.getElementById('link-gerado');
        if(input) input.value = link;
        window._ultimaSemana = [];
        window._tipoRelatorioAtual = 'Retenção por módulo';
        var prev = document.getElementById('whats-preview');
        if(prev) prev.textContent = typeof window.montarMensagemWhats === 'function' ? window.montarMensagemWhats(link, [], 'Retenção por módulo') : '📈 *Retenção por módulo – Instituto de Vencedores*\n\n🔗 Acesse pelo link:\n' + link;
        var modal = document.getElementById('modal-link');
        if(modal) modal.style.display = 'flex';
        if(typeof toast === 'function') toast('Link gerado! ✓');
      } catch(e){
        console.error(e);
        if(typeof toast === 'function') toast('Erro ao gerar link. Tente novamente.', true);
      }
    };
    window.gerarRelatorioLink._ivRetencao = true;
    window.gerarRelatorio = function(){ return window.gerarRelatorioLink(); };
  }

  function ajustarCabecalhoPresenca(){
    var M = getMODULOS();
    var modEl = document.getElementById('pres-modulo');
    var semEl = document.getElementById('pres-semana');
    if(!M || !modEl || !semEl) return;

    var modulo = parseInt(modEl.value, 10);
    var si = parseInt(semEl.value, 10);
    var sem = M[modulo] && M[modulo].semanas && M[modulo].semanas[si];
    if(!sem) return;

    var aulas = sem.aulas || [];
    var unica = aulas.length === 1;
    var th1 = document.getElementById('th-a1');
    var th2 = document.getElementById('th-a2');
    var label = aulas[0] === 'INAU' ? 'Aula Inaugural' : aulas[0] === 'AP' ? 'Apresentação' : 'Aula ' + (aulas[0] || 1);

    if(th1){
      th1.textContent = unica ? label : 'Aula ' + aulas[0];
      th1.style.display = '';
      th1.style.minWidth = unica ? '140px' : '92px';
      th1.style.width = unica ? '140px' : '92px';
    }
    if(th2){
      th2.textContent = unica ? '' : 'Aula ' + aulas[1];
      th2.style.display = unica ? 'none' : '';
      th2.style.minWidth = unica ? '0' : '92px';
      th2.style.width = unica ? '0' : '92px';
    }

    var table = document.getElementById('tbl-presenca-wrap');
    if(table) table.style.minWidth = unica ? '700px' : '760px';

    Array.prototype.forEach.call(document.querySelectorAll('#tb-presenca tr'), function(tr){
      if(tr.children && tr.children.length >= 6) tr.children[4].style.display = unica ? 'none' : '';
    });
  }

  function patchPresenca(){
    if(typeof window.renderPresencaTabela === 'function' && !window.renderPresencaTabela._ivHead){
      var oldRender = window.renderPresencaTabela;
      window.renderPresencaTabela = function(){
        var r = oldRender.apply(this, arguments);
        setTimeout(ajustarCabecalhoPresenca, 0);
        return r;
      };
      window.renderPresencaTabela._ivHead = true;
    }
    if(typeof window.updateAulasInfo === 'function' && !window.updateAulasInfo._ivHead){
      var oldInfo = window.updateAulasInfo;
      window.updateAulasInfo = function(){
        var r = oldInfo.apply(this, arguments);
        setTimeout(ajustarCabecalhoPresenca, 0);
        return r;
      };
      window.updateAulasInfo._ivHead = true;
    }
    setTimeout(ajustarCabecalhoPresenca, 0);
  }

  function aplicarTudo(){
    limparTravamentoLoginAntigo();
    ensureStyles();
    patchAlunos();
    patchRelatorioRetencao();
    patchPresenca();
    addRetencaoOption();
  }

  ready(function(){
    aplicarTudo();
    setTimeout(aplicarTudo, 250);
    setTimeout(aplicarTudo, 900);
    setTimeout(aplicarTudo, 1800);
  });
})();

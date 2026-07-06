// IV - correcao final: retencao, historico, equipes e modal/login
(function(){
  'use strict';

  var STYLE_ID = 'iv-final-retention-history-login-teams-style';
  var timer = null;

  function ready(fn){
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, {once:true});
    else fn();
  }

  function D(){ try { return typeof DB !== 'undefined' ? DB : null; } catch(e){ return null; } }
  function M(){ try { return typeof MODULOS !== 'undefined' ? MODULOS : null; } catch(e){ return null; } }
  function esc(v){ return String(v == null ? '' : v).replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]; }); }
  function pad2(n){ return String(n).padStart(2, '0'); }
  function toastSafe(msg, erro){ if(typeof toast === 'function') toast(msg, !!erro); }

  function ensureCSS(){
    if(document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
      #page-equipes{max-width:min(1040px,calc(100vw - 36px))!important;}
      #page-equipes .tbl-wrap{max-width:100%!important;overflow-x:auto!important;}
      #page-equipes table{min-width:760px!important;table-layout:fixed!important;}
      #page-equipes thead th:nth-child(1){width:70px!important;}
      #page-equipes thead th:nth-child(2){width:auto!important;}
      #page-equipes thead th:nth-child(3){width:170px!important;text-align:center!important;}
      #page-equipes thead th:nth-child(4){width:150px!important;text-align:center!important;}
      #page-equipes thead th:nth-child(5){width:170px!important;text-align:center!important;}
      #tb-equipes td:nth-child(3),#tb-equipes td:nth-child(4),#tb-equipes td:nth-child(5){text-align:center!important;}
      #tb-equipes td:nth-child(5)>div{justify-content:center!important;display:inline-flex!important;gap:7px!important;}
      #tb-equipes .btn{padding:6px 11px!important;font-size:12px!important;}
      .iv-ret-shell,.iv-hist-shell{max-width:1120px;margin:auto;background:rgba(8,19,36,.90);border:1px solid rgba(126,200,240,.18);border-radius:26px;overflow:hidden;box-shadow:0 28px 80px rgba(0,0,0,.44)}
    `;
    document.head.appendChild(s);
  }

  function addRetencaoOption(){
    var select = document.getElementById('exp-tipo');
    if(!select) return;
    if(!select.querySelector('option[value="retencao_modulo"]')){
      var opt = document.createElement('option');
      opt.value = 'retencao_modulo';
      opt.textContent = '📈 Retenção por módulo';
      select.appendChild(opt);
    }
  }

  function equipeNome(aluno){
    var db = D();
    var eq = db && db.equipes ? db.equipes.find(function(e){ return String(e.id) === String(aluno.equipeId); }) : null;
    return eq ? eq.nome : 'Sem equipe';
  }

  function turmaNome(t){ return t === 'quinta' ? 'Quinta-feira' : t === 'sabado' ? 'Sábado' : 'Sem turma'; }

  function keyPresenca(alunoId, modulo, semIdx, aula){
    if(typeof presKey === 'function') return presKey(alunoId, modulo, semIdx, aula);
    return alunoId + '_' + modulo + '_' + semIdx + '_' + aula;
  }

  function aulaRegistrada(modulo, semIdx, aula){
    var db = D();
    var p = db && db.presencas || {};
    var alvo = '_' + modulo + '_' + semIdx + '_' + aula;
    return Object.keys(p).some(function(k){ return k.indexOf(alvo) > -1; });
  }

  function alunoPresente(aluno, modulo, semIdx, aula){
    var db = D();
    var p = db && db.presencas || {};
    return !!p[keyPresenca(aluno.id, modulo, semIdx, aula)];
  }

  function alunoIniciouModulo(aluno, modulo){
    var atual = parseInt(aluno.modulo || '1', 10);
    if(modulo === 1) return true;
    if(atual >= modulo) return true;
    var db = D();
    var p = db && db.presencas || {};
    var prefix = String(aluno.id) + '_' + modulo + '_';
    return Object.keys(p).some(function(k){ return k.indexOf(prefix) === 0 && !!p[k]; });
  }

  function alunoConcluiuModulo(aluno, modulo){
    var atual = parseInt(aluno.modulo || '1', 10);
    if(atual > modulo) return true;
    var modulos = M();
    var mod = modulos && modulos[modulo];
    if(!mod || !mod.semanas || !mod.semanas.length) return false;
    var ultimaSemana = mod.semanas.length - 1;
    var aulas = mod.semanas[ultimaSemana].aulas || [];
    return aulas.some(function(aula){ return alunoPresente(aluno, modulo, ultimaSemana, aula); });
  }

  function dadosRetencao(){
    var db = D() || {};
    var alunos = db.alunos || [];
    var modulos = M() || {};
    var filtro = (document.getElementById('exp-modulo') || {}).value || 'todos';
    var listaModulos = filtro === 'todos' ? [1,2,3] : [parseInt(filtro, 10)];

    return listaModulos.map(function(m){
      var iniciaram = alunos.filter(function(a){ return alunoIniciouModulo(a, m); });
      var concluiram = iniciaram.filter(function(a){ return alunoConcluiuModulo(a, m); });
      var desistentes = iniciaram.filter(function(a){ return (a.situacao || 'ATIVO') === 'DESISTENTE' && !alunoConcluiuModulo(a, m); });
      var pendentes = Math.max(iniciaram.length - concluiram.length - desistentes.length, 0);
      var mod = modulos[m] || {nome:m + 'º Módulo', cor:'#7EC8F0'};
      return {
        modulo:m,
        nome:mod.nome || (m + 'º Módulo'),
        cor:mod.cor || '#7EC8F0',
        iniciaram:iniciaram.length,
        concluiram:concluiram.length,
        pendentes:pendentes,
        desistentes:desistentes.length,
        pct:iniciaram.length ? Math.round(concluiram.length / iniciaram.length * 100) : 0
      };
    });
  }

  function cssRelatorio(mobile){
    return '<style>*{box-sizing:border-box}body{margin:0;padding:' + (mobile ? '12px' : '28px') + ';background:radial-gradient(circle at 12% 0,rgba(47,128,237,.24),transparent 32%),radial-gradient(circle at 88% 8%,rgba(34,211,238,.13),transparent 28%),linear-gradient(145deg,#020611,#07111F 48%,#030712);color:#EAF4FF;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Arial,sans-serif}.shell{max-width:' + (mobile ? '760px' : '1120px') + ';margin:auto;background:linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.016)),rgba(8,19,36,.88);border:1px solid rgba(126,200,240,.18);border-radius:26px;box-shadow:0 28px 80px rgba(0,0,0,.44);overflow:hidden}.hero{padding:' + (mobile ? '22px 18px' : '28px 32px') + ';background:linear-gradient(135deg,rgba(7,17,31,.98),rgba(16,40,70,.84));border-bottom:1px solid rgba(126,200,240,.16)}.badge{display:inline-flex;padding:7px 12px;border-radius:999px;background:linear-gradient(135deg,#2F80ED,#22D3EE);font-size:11px;font-weight:900;color:#fff}.title{font-size:' + (mobile ? '25px' : '34px') + ';font-weight:950;margin-top:10px;line-height:1.05}.sub{color:#9CB8D6;font-size:12px;margin-top:7px;line-height:1.45}.content{padding:' + (mobile ? '14px' : '24px') + '}.kpis{display:grid;grid-template-columns:repeat(' + (mobile ? '2' : '4') + ',1fr);gap:10px;margin-bottom:16px}.kpi,.card{background:linear-gradient(145deg,rgba(255,255,255,.048),rgba(255,255,255,.012)),rgba(7,17,31,.78);border:1px solid rgba(126,200,240,.15);border-radius:18px;padding:15px;margin-bottom:14px;box-shadow:0 16px 40px rgba(0,0,0,.24),inset 0 1px 0 rgba(255,255,255,.04)}.num{font-size:31px;font-weight:950;color:var(--c);line-height:1}.txt{font-size:10px;color:#8FAACB;text-transform:uppercase;font-weight:900;letter-spacing:1px;margin-top:5px}.grid{display:grid;grid-template-columns:repeat(' + (mobile ? '1' : '3') + ',1fr);gap:12px}.big{font-size:42px;font-weight:950;color:var(--c);line-height:1}.line{display:flex;justify-content:space-between;gap:12px;padding:8px 0;border-bottom:1px solid rgba(126,200,240,.09);font-size:13px}.tag{display:inline-flex;padding:4px 9px;border-radius:999px;font-size:10px;font-weight:900}.g{background:rgba(62,201,122,.14);color:#7EDBA8}.b{background:rgba(74,144,217,.14);color:#7EC8F0}.r{background:rgba(224,85,85,.14);color:#F08080}.p{background:rgba(155,89,182,.16);color:#D8A7ED}.note{font-size:11px;color:#9CB8D6;line-height:1.55}.aluno{font-size:17px;font-weight:950;color:#fff;margin-bottom:4px}.meta{font-size:12px;color:#9CB8D6;line-height:1.45}.miss{display:flex;align-items:flex-start;gap:10px;margin-top:9px;padding:10px 11px;border:1px solid rgba(224,85,85,.20);border-radius:14px;background:rgba(224,85,85,.07)}.miss-ico{width:28px;height:28px;min-width:28px;display:inline-flex;align-items:center;justify-content:center;border-radius:999px;background:radial-gradient(circle at 30% 20%,rgba(255,255,255,.22),rgba(224,85,85,.14));border:1px solid rgba(255,130,130,.30);color:#FFD7D7;box-shadow:0 10px 20px rgba(0,0,0,.22)}.miss-text{font-size:12px;color:#F6B0B0;font-weight:850;line-height:1.45}.ok{display:inline-flex;margin-top:9px;padding:7px 10px;border-radius:999px;background:rgba(62,201,122,.12);border:1px solid rgba(62,201,122,.25);color:#9EF0BC;font-size:11px;font-weight:850}@media(max-width:780px){.kpis{grid-template-columns:1fr 1fr}.grid{grid-template-columns:1fr}}</style>';
  }

  function htmlRetencao(titulo, versao){
    var rows = dadosRetencao();
    var mobile = versao !== 'web';
    var dt = new Date().toLocaleDateString('pt-BR', {day:'2-digit', month:'long', year:'numeric'});
    var totalIni = rows.reduce(function(s,x){ return s + x.iniciaram; }, 0);
    var totalCon = rows.reduce(function(s,x){ return s + x.concluiram; }, 0);
    var totalPen = rows.reduce(function(s,x){ return s + x.pendentes; }, 0);
    var pct = totalIni ? Math.round(totalCon / totalIni * 100) : 0;
    var body = '<div class="kpis"><div class="kpi" style="--c:#7EC8F0"><div class="num">' + totalIni + '</div><div class="txt">Alunos que iniciaram</div></div><div class="kpi" style="--c:#3EC97A"><div class="num">' + totalCon + '</div><div class="txt">Concluíram até o fim</div></div><div class="kpi" style="--c:#F39C12"><div class="num">' + totalPen + '</div><div class="txt">Ainda não concluíram</div></div><div class="kpi" style="--c:#9B59B6"><div class="num">' + pct + '%</div><div class="txt">Retenção geral</div></div></div><div class="grid">' +
      rows.map(function(r){
        return '<div class="card" style="--c:' + esc(r.cor) + '"><h2 style="font-size:18px;margin:0 0 10px;color:var(--c)">' + esc(r.nome) + '</h2><div class="big">' + r.pct + '%</div><div class="txt">Retenção do módulo</div><div style="margin-top:13px"><div class="line"><span>Alunos que iniciaram</span><strong>' + r.iniciaram + '</strong></div><div class="line"><span>Concluíram até o fim</span><span class="tag g">' + r.concluiram + '</span></div><div class="line"><span>Ainda não concluíram</span><span class="tag b">' + r.pendentes + '</span></div><div class="line"><span>Desistentes</span><span class="tag ' + (r.desistentes ? 'r' : 'g') + '">' + r.desistentes + '</span></div></div></div>';
      }).join('') +
      '</div><div class="card note">Critério usado: iniciou = aluno cadastrado no módulo, avançado para módulo posterior ou com presença registrada no módulo. Concluiu = aluno avançou para o módulo seguinte ou possui presença registrada na última semana/apresentação do módulo.</div>';
    return '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + esc(titulo) + ' — Retenção por módulo</title>' + cssRelatorio(mobile) + '</head><body><main class="shell"><header class="hero"><div class="badge">📈 Relatório de retenção por módulo</div><div class="title">' + esc(titulo) + '</div><div class="sub">Gerado em ' + dt + ' · Instituto de Vencedores</div></header><section class="content">' + body + '</section></main></body></html>';
  }

  function aulaLabel(aula){
    if(aula === 'INAU') return 'Aula Inaugural';
    if(aula === 'AP') return 'Apresentação';
    return pad2(aula);
  }

  function aulasPerdidasPorModulo(aluno, modulo){
    var modulos = M();
    var mod = modulos && modulos[modulo];
    if(!mod || !mod.semanas) return [];
    var out = [];
    mod.semanas.forEach(function(sem, si){
      (sem.aulas || []).forEach(function(aula){
        if(!aulaRegistrada(modulo, si, aula)) return;
        if(!alunoPresente(aluno, modulo, si, aula)) out.push(aulaLabel(aula));
      });
    });
    return out;
  }

  function linhaPerdidas(aluno, modulo){
    var perdidas = aulasPerdidasPorModulo(aluno, modulo);
    if(!perdidas.length) return '';
    var nums = perdidas.filter(function(x){ return /^\d+$/.test(x); });
    var especiais = perdidas.filter(function(x){ return !/^\d+$/.test(x); });
    var partes = [];
    especiais.forEach(function(x){ partes.push(x); });
    if(nums.length) partes.push('Aula ' + nums.join(' | '));
    return '<div class="miss"><span class="miss-ico">✦</span><div class="miss-text"><strong>MD ' + pad2(modulo) + '</strong> — ' + esc(partes.join(' | ')) + '</div></div>';
  }

  function htmlHistorico(titulo, filtro, versao){
    var db = D() || {};
    var alunos = (db.alunos || []).slice().filter(function(a){ return filtro === 'todos' || String(a.modulo || '1') === String(filtro); }).sort(function(a,b){ return String(a.nome||'').localeCompare(String(b.nome||''), 'pt-BR'); });
    var mobile = versao !== 'web';
    var dt = new Date().toLocaleDateString('pt-BR', {day:'2-digit', month:'long', year:'numeric'});
    var cards = alunos.map(function(a){
      var modAtual = (M() && M()[a.modulo || '1'] && M()[a.modulo || '1'].nome) || ((a.modulo || '1') + 'º Módulo');
      var linhas = [1,2,3].map(function(m){ return linhaPerdidas(a, m); }).filter(Boolean).join('');
      if(!linhas) linhas = '<span class="ok">✓ Nenhuma aula perdida registrada</span>';
      return '<div class="card"><div class="aluno">' + esc(a.nome || '—') + '</div><div class="meta">' + esc(equipeNome(a)) + ' · ' + esc(turmaNome(a.turma)) + ' · Módulo atual: ' + esc(modAtual) + '</div>' + linhas + '</div>';
    }).join('');
    if(!cards) cards = '<div class="card"><div class="aluno">Nenhum aluno encontrado</div><div class="meta">O filtro selecionado não encontrou alunos.</div></div>';
    return '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + esc(titulo) + ' — Histórico de um Vencedor</title>' + cssRelatorio(mobile) + '</head><body><main class="shell"><header class="hero"><div class="badge">🧭 Histórico de um Vencedor</div><div class="title">' + esc(titulo) + '</div><div class="sub">Aulas perdidas por módulo, sem agrupamento por semana · Gerado em ' + dt + '</div></header><section class="content">' + cards + '</section></main></body></html>';
  }

  async function salvarRelatorio(html, titulo, tipo, modulo, versao){
    var id = 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2,6);
    var fb = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
    await fb.setDoc(fb.doc(fb.getFirestore(), 'relatorios', id), {html:html, titulo:titulo, tipo:tipo, modulo:modulo, versao:versao, criadoEm:new Date().toISOString()});
    return location.origin + '/relatorio?id=' + id;
  }

  function mensagem(tipo, link){
    return '📊 *' + tipo + ' – Instituto de Vencedores*\n\n🔗 Acesse pelo link:\n' + link;
  }

  function abrirModalLink(link, tipo){
    var input = document.getElementById('link-gerado');
    if(input) input.value = link;
    window._ultimaSemana = [];
    window._tipoRelatorioAtual = tipo;
    var prev = document.getElementById('whats-preview');
    if(prev) prev.textContent = mensagem(tipo, link);
    var modal = document.getElementById('modal-link');
    if(modal) modal.style.display = 'flex';
    if(typeof premiumizeModal === 'function') premiumizeModal();
  }

  function versaoAtual(){
    var web = document.getElementById('tab-web');
    return web && web.classList.contains('active') ? 'web' : 'mobile';
  }

  function patchGerarRelatorio(){
    addRetencaoOption();
    if(typeof window.gerarRelatorioLink !== 'function') return;
    if(window.gerarRelatorioLink._ivFinalRetentionHistory) return;
    var old = window.gerarRelatorioLink;
    window.gerarRelatorioLink = async function(){
      addRetencaoOption();
      var tipo = (document.getElementById('exp-tipo') || {}).value || 'visao';
      if(tipo !== 'retencao_modulo' && tipo !== 'caminho') return old.apply(this, arguments);
      var titulo = (document.getElementById('exp-titulo') || {}).value || 'Instituto de Vencedores';
      var modulo = (document.getElementById('exp-modulo') || {}).value || 'todos';
      var versao = versaoAtual();
      var tipoNome = tipo === 'retencao_modulo' ? 'Retenção por módulo' : 'Histórico de um Vencedor';
      var html = tipo === 'retencao_modulo' ? htmlRetencao(titulo, versao) : htmlHistorico(titulo, modulo, versao);
      toastSafe('Gerando link, aguarde...⏳');
      try{
        var link = await salvarRelatorio(html, titulo, tipoNome, modulo, versao);
        abrirModalLink(link, tipoNome);
        toastSafe('Link gerado! ✓');
      } catch(e){
        console.error(e);
        toastSafe('Erro ao gerar link. Tente novamente.', true);
      }
    };
    window.gerarRelatorioLink._ivFinalRetentionHistory = true;
    window.gerarRelatorio = function(){ return window.gerarRelatorioLink(); };
  }

  function patchCopiarWhats(){
    if(typeof window.copiarLink === 'function' && !window.copiarLink._ivFinalMsg){
      window.copiarLink = function(){
        var link = (document.getElementById('link-gerado') || {}).value || '';
        var msg = mensagem(window._tipoRelatorioAtual || 'Relatório', link);
        navigator.clipboard.writeText(msg).then(function(){ toastSafe('Mensagem copiada! ✓'); }).catch(function(){ toastSafe('Mensagem copiada! ✓'); });
      };
      window.copiarLink._ivFinalMsg = true;
    }
    if(typeof window.abrirWhatsApp === 'function' && !window.abrirWhatsApp._ivFinalMsg){
      window.abrirWhatsApp = function(){
        var link = (document.getElementById('link-gerado') || {}).value || '';
        window.open('https://wa.me/?text=' + encodeURIComponent(mensagem(window._tipoRelatorioAtual || 'Relatório', link)), '_blank');
      };
      window.abrirWhatsApp._ivFinalMsg = true;
    }
  }

  function aplicar(){
    ensureCSS();
    addRetencaoOption();
    patchGerarRelatorio();
    patchCopiarWhats();
    clearTimeout(timer);
    timer = setTimeout(function(){
      addRetencaoOption();
      patchGerarRelatorio();
    }, 450);
  }

  ready(function(){
    aplicar();
    setTimeout(aplicar, 300);
    setTimeout(aplicar, 1000);
    setTimeout(aplicar, 2200);
    new MutationObserver(aplicar).observe(document.body, {childList:true, subtree:true});
  });
})();

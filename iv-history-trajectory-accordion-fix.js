// IV - Historico de um Vencedor V2: trajetoria completa + sanfona premium de aulas perdidas
(function(){
  'use strict';

  function ready(fn){
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, {once:true});
    else fn();
  }

  function DBx(){ try { return typeof DB !== 'undefined' ? DB : null; } catch(e){ return null; } }
  function MODx(){ try { return typeof MODULOS !== 'undefined' ? MODULOS : null; } catch(e){ return null; } }
  function esc(v){ return String(v == null ? '' : v).replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]; }); }
  function pad2(v){ return String(v).padStart(2, '0'); }

  function presKeySafe(alunoId, modulo, semana, aula){
    if(typeof presKey === 'function') return presKey(alunoId, modulo, semana, aula);
    return alunoId + '_' + modulo + '_' + semana + '_' + aula;
  }

  function alunoPresente(aluno, modulo, semana, aula){
    var db = DBx() || {};
    var presencas = db.presencas || {};
    return !!presencas[presKeySafe(aluno.id, modulo, semana, aula)];
  }

  function aulaTeveLancamento(modulo, semana, aula){
    var db = DBx() || {};
    var presencas = db.presencas || {};
    var alvo = '_' + modulo + '_' + semana + '_' + aula;
    return Object.keys(presencas).some(function(k){ return k.indexOf(alvo) > -1; });
  }

  function equipeNome(aluno){
    var db = DBx() || {};
    var eq = (db.equipes || []).find(function(e){ return String(e.id) === String(aluno.equipeId); });
    return eq ? eq.nome : 'Sem equipe';
  }

  function turmaNome(turma){
    if(turma === 'quinta') return 'Quinta-feira';
    if(turma === 'sabado') return 'Sábado';
    return 'Sem turma';
  }

  function labelAula(aula){
    if(aula === 'INAU') return 'Aula Inaugural';
    if(aula === 'AP') return 'Apresentação';
    return pad2(aula);
  }

  function alunoJaChegouNoModulo(aluno, modulo){
    var atual = parseInt(aluno.modulo || '1', 10);
    if(atual >= modulo) return true;
    var db = DBx() || {};
    var presencas = db.presencas || {};
    var prefixo = String(aluno.id) + '_' + modulo + '_';
    return Object.keys(presencas).some(function(k){ return k.indexOf(prefixo) === 0; });
  }

  function aulasPrevistasModulo(modulo){
    var mods = MODx() || {};
    var mod = mods[modulo];
    if(!mod || !mod.semanas) return 0;
    return mod.semanas.reduce(function(total, sem){ return total + ((sem.aulas || []).length); }, 0);
  }

  function dadosModuloAluno(aluno, modulo){
    var mods = MODx() || {};
    var mod = mods[modulo];
    var atual = parseInt(aluno.modulo || '1', 10);
    var chegou = alunoJaChegouNoModulo(aluno, modulo);
    var pres = 0, faltas = 0, aulasRealizadas = 0, perdidas = [];
    var previsto = aulasPrevistasModulo(modulo);

    if(mod && mod.semanas && chegou){
      mod.semanas.forEach(function(sem, si){
        (sem.aulas || []).forEach(function(aula){
          if(!aulaTeveLancamento(modulo, si, aula)) return;
          aulasRealizadas++;
          if(alunoPresente(aluno, modulo, si, aula)){
            pres++;
          } else {
            faltas++;
            perdidas.push(labelAula(aula));
          }
        });
      });
    }

    var status = atual > modulo ? 'Concluído' : atual === modulo ? 'Módulo atual' : 'Próximo módulo';
    var pct = aulasRealizadas ? Math.round((pres / aulasRealizadas) * 100) : 0;
    return {modulo:modulo, nome:(mod && mod.nome) || (modulo + 'º Módulo'), status:status, previsto:previsto, realizadas:aulasRealizadas, pres:pres, faltas:faltas, pct:pct, perdidas:perdidas};
  }

  function agruparPerdidas(dadosModulos){
    return dadosModulos.filter(function(d){ return d.perdidas.length; }).map(function(d){
      var numericas = d.perdidas.filter(function(x){ return /^\d+$/.test(x); });
      var especiais = d.perdidas.filter(function(x){ return !/^\d+$/.test(x); });
      var partes = [];
      especiais.forEach(function(x){ partes.push(x); });
      if(numericas.length) partes.push('Aula ' + numericas.join(' | '));
      return '<div class="miss-line"><strong>MD ' + pad2(d.modulo) + '</strong><span>' + esc(partes.join(' | ')) + '</span></div>';
    }).join('');
  }

  function cssHistorico(mobile){
    return '<style>*{box-sizing:border-box}body{margin:0;padding:' + (mobile ? '12px' : '28px') + ';background:radial-gradient(circle at 12% 0,rgba(47,128,237,.25),transparent 32%),radial-gradient(circle at 88% 8%,rgba(34,211,238,.13),transparent 28%),linear-gradient(145deg,#020611,#07111F 48%,#030712);color:#EAF4FF;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Arial,sans-serif}.shell{max-width:' + (mobile ? '780px' : '1180px') + ';margin:auto;background:linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.016)),rgba(8,19,36,.90);border:1px solid rgba(126,200,240,.18);border-radius:28px;box-shadow:0 28px 84px rgba(0,0,0,.48);overflow:hidden}.hero{padding:' + (mobile ? '22px 18px' : '30px 34px') + ';background:linear-gradient(135deg,rgba(7,17,31,.98),rgba(16,40,70,.84));border-bottom:1px solid rgba(126,200,240,.16)}.badge{display:inline-flex;padding:7px 12px;border-radius:999px;background:linear-gradient(135deg,#2F80ED,#22D3EE);color:#fff;font-size:11px;font-weight:900}.title{font-size:' + (mobile ? '25px' : '34px') + ';font-weight:950;margin-top:10px;line-height:1.06}.sub{color:#9CB8D6;font-size:12px;margin-top:7px;line-height:1.5}.content{padding:' + (mobile ? '14px' : '24px') + '}.student{background:linear-gradient(145deg,rgba(255,255,255,.048),rgba(255,255,255,.012)),rgba(7,17,31,.78);border:1px solid rgba(126,200,240,.15);border-radius:22px;padding:' + (mobile ? '15px' : '18px') + ';margin-bottom:16px;box-shadow:0 16px 42px rgba(0,0,0,.25),inset 0 1px 0 rgba(255,255,255,.04)}.student-top{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;flex-wrap:wrap}.name{font-size:20px;font-weight:950;color:#fff}.meta{font-size:12px;color:#9CB8D6;margin-top:5px;line-height:1.45}.pill{display:inline-flex;padding:6px 10px;border-radius:999px;background:rgba(126,200,240,.10);border:1px solid rgba(126,200,240,.18);font-size:11px;font-weight:900;color:#BFEAFF}.kpis{display:grid;grid-template-columns:repeat(' + (mobile ? '2' : '4') + ',1fr);gap:10px;margin:14px 0}.kpi{background:rgba(5,12,24,.58);border:1px solid rgba(126,200,240,.12);border-radius:16px;padding:12px}.num{font-size:25px;font-weight:950;color:var(--c);line-height:1}.txt{font-size:9px;color:#8FAACB;text-transform:uppercase;font-weight:900;letter-spacing:.08em;margin-top:4px}.route{display:grid;grid-template-columns:repeat(' + (mobile ? '1' : '3') + ',1fr);gap:10px;margin-top:12px}.step{border:1px solid rgba(126,200,240,.14);border-radius:17px;padding:12px;background:rgba(255,255,255,.028)}.step h3{margin:0 0 6px;font-size:14px;color:#EAF4FF}.status{display:inline-flex;font-size:9px;font-weight:950;text-transform:uppercase;letter-spacing:.08em;color:#7EC8F0;margin-bottom:9px}.bar{height:7px;background:#13223A;border-radius:999px;overflow:hidden;margin:10px 0 8px}.fill{height:100%;width:var(--w);background:linear-gradient(90deg,#2F80ED,#22D3EE);border-radius:999px}.mini{display:flex;justify-content:space-between;gap:8px;font-size:11px;color:#9CB8D6;line-height:1.65}.tag{display:inline-flex;padding:3px 8px;border-radius:999px;font-size:10px;font-weight:900}.g{background:rgba(62,201,122,.14);color:#7EDBA8}.r{background:rgba(224,85,85,.14);color:#F08080}.b{background:rgba(74,144,217,.14);color:#7EC8F0}.accordion{margin-top:13px;border:1px solid rgba(224,85,85,.22);border-radius:17px;background:rgba(224,85,85,.055);overflow:hidden}.accordion summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:10px;padding:12px 13px;font-size:12px;font-weight:950;color:#FFD7D7}.accordion summary::-webkit-details-marker{display:none}.acc-icon{width:30px;height:30px;min-width:30px;display:inline-flex;align-items:center;justify-content:center;border-radius:999px;background:radial-gradient(circle at 30% 20%,rgba(255,255,255,.25),rgba(224,85,85,.16));border:1px solid rgba(255,150,150,.32);box-shadow:0 10px 22px rgba(0,0,0,.24);color:#FFD7D7}.chev{margin-left:auto;color:#F6B0B0;transition:.18s transform}.accordion[open] .chev{transform:rotate(180deg)}.miss-body{padding:0 13px 13px 53px}.miss-line{display:flex;align-items:flex-start;gap:9px;padding:7px 0;border-top:1px solid rgba(255,255,255,.06);font-size:12px;color:#F4BBBB;line-height:1.45}.miss-line strong{color:#fff;min-width:52px}.ok{display:inline-flex;margin-top:13px;padding:8px 11px;border-radius:999px;background:rgba(62,201,122,.12);border:1px solid rgba(62,201,122,.25);color:#9EF0BC;font-size:11px;font-weight:850}@media(max-width:780px){.kpis{grid-template-columns:1fr 1fr}.route{grid-template-columns:1fr}}</style>';
  }

  function htmlHistorico(titulo, filtroModulo, versao){
    var db = DBx() || {};
    var alunos = (db.alunos || []).slice().filter(function(a){ return filtroModulo === 'todos' || String(a.modulo || '1') === String(filtroModulo); }).sort(function(a,b){ return String(a.nome || '').localeCompare(String(b.nome || ''), 'pt-BR'); });
    var mobile = versao !== 'web';
    var dt = new Date().toLocaleDateString('pt-BR', {day:'2-digit', month:'long', year:'numeric'});
    var mods = MODx() || {};

    var cards = alunos.map(function(aluno){
      var dados = [1,2,3].map(function(m){ return dadosModuloAluno(aluno, m); });
      var totalPres = dados.reduce(function(s,d){ return s + d.pres; }, 0);
      var totalFaltas = dados.reduce(function(s,d){ return s + d.faltas; }, 0);
      var totalRealizadas = dados.reduce(function(s,d){ return s + d.realizadas; }, 0);
      var totalPrevistas = dados.reduce(function(s,d){ return s + d.previsto; }, 0);
      var pctGeral = totalRealizadas ? Math.round(totalPres / totalRealizadas * 100) : 0;
      var atual = parseInt(aluno.modulo || '1', 10);
      var nomeAtual = (mods[atual] && mods[atual].nome) || (atual + 'º Módulo');
      var perdidasHTML = agruparPerdidas(dados);
      var acc = perdidasHTML ? '<details class="accordion"><summary><span class="acc-icon">✦</span><span>Aulas perdidas do aluno</span><span class="chev">⌄</span></summary><div class="miss-body">' + perdidasHTML + '</div></details>' : '<span class="ok">✓ Nenhuma aula perdida registrada até agora</span>';

      var rota = dados.map(function(d){
        return '<div class="step"><h3>' + esc(d.nome) + '</h3><span class="status">' + esc(d.status) + '</span><div class="bar"><div class="fill" style="--w:' + d.pct + '%"></div></div><div class="mini"><span>Presenças</span><strong class="tag g">' + d.pres + '</strong></div><div class="mini"><span>Faltas</span><strong class="tag r">' + d.faltas + '</strong></div><div class="mini"><span>Aulas realizadas</span><strong class="tag b">' + d.realizadas + '/' + d.previsto + '</strong></div><div class="mini"><span>Aproveitamento</span><strong>' + d.pct + '%</strong></div></div>';
      }).join('');

      return '<article class="student"><div class="student-top"><div><div class="name">' + esc(aluno.nome || '—') + '</div><div class="meta">' + esc(equipeNome(aluno)) + ' · ' + esc(turmaNome(aluno.turma)) + ' · Módulo atual: ' + esc(nomeAtual) + '</div></div><span class="pill">Trajetória completa</span></div><div class="kpis"><div class="kpi" style="--c:#3EC97A"><div class="num">' + totalPres + '</div><div class="txt">Presenças desde o início</div></div><div class="kpi" style="--c:#E05555"><div class="num">' + totalFaltas + '</div><div class="txt">Faltas desde o início</div></div><div class="kpi" style="--c:#7EC8F0"><div class="num">' + totalRealizadas + '/' + totalPrevistas + '</div><div class="txt">Aulas realizadas/previstas</div></div><div class="kpi" style="--c:#9B59B6"><div class="num">' + pctGeral + '%</div><div class="txt">Presença geral</div></div></div><div class="route">' + rota + '</div>' + acc + '</article>';
    }).join('');

    if(!cards) cards = '<article class="student"><div class="name">Nenhum aluno encontrado</div><div class="meta">O filtro selecionado não encontrou alunos.</div></article>';

    return '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + esc(titulo) + ' - Histórico de um Vencedor</title>' + cssHistorico(mobile) + '</head><body><main class="shell"><header class="hero"><div class="badge">🧭 Histórico de um Vencedor</div><div class="title">' + esc(titulo) + '</div><div class="sub">Trajetória do aluno desde o início do curso, passando pelo módulo atual e até o final do último módulo. Gerado em ' + dt + '.</div></header><section class="content">' + cards + '</section></main></body></html>';
  }

  async function salvarRelatorio(html, titulo, tipo, modulo, versao){
    var id = 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2,6);
    var fb = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
    await fb.setDoc(fb.doc(fb.getFirestore(), 'relatorios', id), {html:html, titulo:titulo, tipo:tipo, modulo:modulo, versao:versao, criadoEm:new Date().toISOString()});
    return location.origin + '/relatorio?id=' + id;
  }

  function abrirModal(link, tipo){
    var input = document.getElementById('link-gerado');
    if(input) input.value = link;
    window._ultimaSemana = [];
    window._tipoRelatorioAtual = tipo;
    var prev = document.getElementById('whats-preview');
    if(prev) prev.textContent = '📊 *' + tipo + ' – Instituto de Vencedores*\n\n🔗 Acesse pelo link:\n' + link;
    var modal = document.getElementById('modal-link');
    if(modal) modal.style.display = 'flex';
  }

  function versaoAtual(){
    var web = document.getElementById('tab-web');
    return web && web.classList.contains('active') ? 'web' : 'mobile';
  }

  function patchGerarRelatorio(){
    if(typeof window.gerarRelatorioLink !== 'function') return;
    if(window.gerarRelatorioLink._ivTrajectoryAccordionV2) return;

    var old = window.gerarRelatorioLink;
    var novo = async function(){
      var tipo = (document.getElementById('exp-tipo') || {}).value || 'visao';
      if(tipo !== 'caminho') return old.apply(this, arguments);
      var titulo = (document.getElementById('exp-titulo') || {}).value || 'Instituto de Vencedores';
      var modulo = (document.getElementById('exp-modulo') || {}).value || 'todos';
      var versao = versaoAtual();
      var nomeTipo = 'Histórico de um Vencedor';
      var html = htmlHistorico(titulo, modulo, versao);
      if(typeof toast === 'function') toast('Gerando link, aguarde...⏳');
      try{
        var link = await salvarRelatorio(html, titulo, nomeTipo, modulo, versao);
        abrirModal(link, nomeTipo);
        if(typeof toast === 'function') toast('Link gerado! ✓');
      }catch(e){
        console.error(e);
        if(typeof toast === 'function') toast('Erro ao gerar link. Tente novamente.', true);
      }
    };
    novo._ivTrajectoryAccordionV2 = true;
    window.gerarRelatorioLink = novo;
    window.gerarRelatorio = function(){ return window.gerarRelatorioLink(); };
  }

  ready(function(){
    patchGerarRelatorio();
    setTimeout(patchGerarRelatorio, 300);
    setTimeout(patchGerarRelatorio, 900);
    setTimeout(patchGerarRelatorio, 1800);
    setInterval(patchGerarRelatorio, 1200);
  });
})();

// IV — relatório compacto premium e botões do modal corrigidos
(function(){
  'use strict';

  function ready(fn){
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, {once:true});
    else fn();
  }

  function esc(v){
    return String(v == null ? '' : v).replace(/[&<>"']/g, function(m){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m];
    });
  }
  function getDB(){ try { return (typeof DB !== 'undefined') ? DB : null; } catch(e){ return null; } }
  function getMODULOS(){ try { return (typeof MODULOS !== 'undefined') ? MODULOS : null; } catch(e){ return null; } }
  function formatarTelefone(valor){
    var d = String(valor || '').replace(/\D/g,'').slice(0,11);
    if(!d) return '';
    if(d.length <= 2) return '(' + d;
    if(d.length <= 6) return '(' + d.slice(0,2) + ') ' + d.slice(2);
    if(d.length <= 10) return '(' + d.slice(0,2) + ') ' + d.slice(2,6) + '-' + d.slice(6);
    return '(' + d.slice(0,2) + ') ' + d.slice(2,7) + '-' + d.slice(7);
  }
  function presencaKey(id, m, si, au){
    try { if(typeof presKey === 'function') return presKey(id, m, si, au); } catch(e){}
    return id + '_' + m + '_' + si + '_' + au;
  }
  function nomeTurma(v){ return v === 'quinta' ? 'Quinta-feira' : v === 'sabado' ? 'Sábado' : 'Sem turma'; }
  function nomeEquipe(al){
    var db = getDB();
    var e = db && Array.isArray(db.equipes) ? db.equipes.find(function(x){ return x.id === al.equipeId; }) : null;
    return e ? e.nome : 'Sem equipe';
  }
  function modulosSelecionados(modFiltro){
    var mods = getMODULOS();
    if(!mods) return [];
    if(modFiltro === 'todos') return [1,2,3].filter(function(m){ return !!mods[m]; });
    var n = parseInt(modFiltro, 10);
    return mods[n] ? [n] : [];
  }
  function mapaAulasRegistradas(){
    var db = getDB();
    var out = {};
    if(!db || !db.presencas) return out;
    Object.keys(db.presencas).forEach(function(k){
      var parts = k.split('_');
      if(parts.length < 4) return;
      out[parts[1] + '_' + parts[2] + '_' + parts.slice(3).join('_')] = true;
    });
    return out;
  }
  function rotuloAulaObj(m, si, au){
    var mods = getMODULOS();
    var mod = mods && mods[m];
    var sem = mod && mod.semanas && mod.semanas[si];
    var aulaCurta = au === 'INAU' ? 'Inaugural' : au === 'AP' ? 'Apresent.' : 'Aula ' + String(au).padStart(2,'0');
    var semLabel = sem && sem.label ? sem.label.replace(/\s+/g,' ').trim() : 'Semana ' + (Number(si) + 1);
    var semCurta = 'S' + String(Number(si) + 1).padStart(2,'0');
    var moduloNome = (mod && mod.nome) || (m + 'º Módulo');
    return {
      modulo: m,
      moduloNome: moduloNome,
      curto: 'M' + m + ' · ' + semCurta + ' · ' + aulaCurta,
      completo: moduloNome + ' · ' + semLabel + ' · ' + aulaCurta
    };
  }
  function statsAlunoModulo(al, m, registradas){
    var mods = getMODULOS();
    var db = getDB();
    var mod = mods && mods[m];
    var total = 0, presencas = 0, perdidas = [];
    if(!mod || !mod.semanas || !db) return {modulo:m,total:0,presencas:0,faltas:0,pct:0,perdidas:[]};
    mod.semanas.forEach(function(sem, si){
      (sem.aulas || []).forEach(function(au){
        if(!registradas[m + '_' + si + '_' + au]) return;
        total++;
        var presente = !!db.presencas[presencaKey(al.id, m, si, au)];
        if(presente) presencas++;
        else perdidas.push(rotuloAulaObj(m, si, au));
      });
    });
    return {modulo:m,total:total,presencas:presencas,faltas:perdidas.length,pct:total ? Math.round(presencas / total * 100) : 0,perdidas:perdidas};
  }
  function rowsRelatorio(modFiltro){
    var db = getDB();
    var mods = getMODULOS();
    if(!db || !mods || !Array.isArray(db.alunos)) return [];
    var selecionados = modulosSelecionados(modFiltro);
    var registradas = mapaAulasRegistradas();
    return db.alunos.filter(function(a){ return modFiltro === 'todos' || String(a.modulo || '1') === String(modFiltro); }).map(function(a){
      var at = parseInt(a.modulo || '1', 10);
      var stats = selecionados.map(function(m){ return statsAlunoModulo(a, m, registradas); });
      var pres = stats.reduce(function(s,x){ return s + x.presencas; }, 0);
      var faltas = stats.reduce(function(s,x){ return s + x.faltas; }, 0);
      var total = stats.reduce(function(s,x){ return s + x.total; }, 0);
      var perdidas = [];
      stats.forEach(function(x){ perdidas = perdidas.concat(x.perdidas); });
      return {id:a.id,nome:a.nome || '—',ins:a.inscricao || '',telefone:formatarTelefone(a.telefone || ''),mod:mods[at] ? mods[at].nome : at + 'º Módulo',at:at,equipe:nomeEquipe(a),turma:nomeTurma(a.turma),sit:a.situacao || 'ATIVO',stats:stats,pres:pres,faltas:faltas,total:total,pct:total ? Math.round(pres / total * 100) : 0,perdidas:perdidas};
    }).sort(function(a,b){ return a.at - b.at || a.nome.localeCompare(b.nome, 'pt-BR'); });
  }
  function resumoRows(rows){
    var ativos = rows.filter(function(a){ return (a.sit || 'ATIVO') === 'ATIVO'; }).length;
    var pres = rows.reduce(function(s,a){ return s + a.pres; }, 0);
    var faltas = rows.reduce(function(s,a){ return s + a.faltas; }, 0);
    return {total:rows.length, ativos:ativos, desistentes:rows.length - ativos, pres:pres, faltas:faltas, pct:(pres + faltas) ? Math.round(pres / (pres + faltas) * 100) : 0};
  }
  function agrupar(rows, fn){
    var out = {};
    rows.forEach(function(a){ var k = fn(a) || '—'; if(!out[k]) out[k] = []; out[k].push(a); });
    return Object.entries(out).sort(function(a,b){ return b[1].length - a[1].length || a[0].localeCompare(b[0], 'pt-BR'); });
  }
  function painelAulas(perdidas){
    var grupos = {};
    perdidas.forEach(function(p){ if(!grupos[p.moduloNome]) grupos[p.moduloNome] = []; grupos[p.moduloNome].push(p); });
    return Object.entries(grupos).map(function(g){
      return '<div class="missed-group"><div class="missed-group-title">' + esc(g[0]) + '</div><div class="missed-chip-grid">' +
        g[1].map(function(p){ return '<span class="missed-chip" title="' + esc(p.completo) + '">' + esc(p.curto) + '</span>'; }).join('') +
      '</div></div>';
    }).join('');
  }
  function aulasPerdidasCompact(perdidas){
    if(!perdidas || !perdidas.length) return '<div class="missed-ok">✓ Nenhuma aula perdida</div>';
    var preview = perdidas.slice(0,3).map(function(p){ return p.curto; }).join(' • ');
    if(perdidas.length > 3) preview += ' +' + (perdidas.length - 3);
    return '<details class="missed-accordion"><summary><span class="missed-count">' + perdidas.length + ' ' + (perdidas.length === 1 ? 'aula perdida' : 'aulas perdidas') + '</span><span class="missed-preview">' + esc(preview) + '</span><span class="missed-toggle">Ver</span></summary><div class="missed-panel">' + painelAulas(perdidas) + '</div></details>';
  }

  function cssRelatorio(mob){
    return `<style>
      *{box-sizing:border-box}body{margin:0;padding:${mob?'12px':'28px'};background:radial-gradient(circle at 12% 0,rgba(47,128,237,.24),transparent 32%),radial-gradient(circle at 88% 8%,rgba(34,211,238,.13),transparent 28%),linear-gradient(145deg,#020611,#07111F 48%,#030712);color:#EAF4FF;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Arial,sans-serif}.shell{max-width:${mob?'760px':'1180px'};margin:auto;background:linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.016)),rgba(8,19,36,.86);border:1px solid rgba(126,200,240,.18);border-radius:26px;box-shadow:0 28px 80px rgba(0,0,0,.44);overflow:hidden}.hero{padding:${mob?'22px 18px':'28px 32px'};background:linear-gradient(135deg,rgba(7,17,31,.98),rgba(16,40,70,.84));border-bottom:1px solid rgba(126,200,240,.16)}.badge{display:inline-block;padding:7px 12px;border-radius:999px;background:linear-gradient(135deg,#2F80ED,#22D3EE);font-size:11px;font-weight:900;color:#fff}.title{font-size:${mob?'25px':'34px'};font-weight:950;margin-top:10px;line-height:1.05}.sub{color:#9CB8D6;font-size:12px;margin-top:7px;line-height:1.45}.content{padding:${mob?'14px':'24px'}}.kpis{display:grid;grid-template-columns:repeat(${mob?'2':'5'},1fr);gap:10px;margin-bottom:16px}.kpi,.card{background:linear-gradient(145deg,rgba(255,255,255,.048),rgba(255,255,255,.012)),rgba(7,17,31,.78);border:1px solid rgba(126,200,240,.15);border-radius:18px;padding:14px;margin-bottom:14px;box-shadow:0 16px 40px rgba(0,0,0,.24),inset 0 1px 0 rgba(255,255,255,.04)}.num{font-size:30px;font-weight:950;color:var(--c);line-height:1}.txt{font-size:10px;color:#8FAACB;text-transform:uppercase;font-weight:900;letter-spacing:1px;margin-top:5px}.st{font-size:17px;font-weight:950;color:#7EC8F0;margin-bottom:12px}.table{overflow:auto;border-radius:14px}table{width:100%;border-collapse:collapse;font-size:12px;min-width:900px}th{background:#102846;color:#7EC8F0;text-align:left;padding:9px;font-size:10px;text-transform:uppercase;letter-spacing:.06em}td{padding:9px;border-bottom:1px solid rgba(126,200,240,.1);vertical-align:top}.tag{display:inline-flex;padding:4px 9px;border-radius:999px;font-size:10px;font-weight:900}.b{background:rgba(74,144,217,.14);color:#7EC8F0}.g{background:rgba(62,201,122,.14);color:#7EDBA8}.r{background:rgba(224,85,85,.14);color:#F08080}.p{background:rgba(155,89,182,.16);color:#D8A7ED}.history-grid{display:grid;grid-template-columns:repeat(${mob?'1':'2'},minmax(0,1fr));gap:14px}.history-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:10px}.history-name{font-size:18px;font-weight:950;color:#fff}.meta{color:#9CB8D6;font-size:12px;line-height:1.5}.route{display:grid;grid-template-columns:repeat(${mob?'1':'3'},1fr);gap:8px;margin-top:12px}.step{border:1px solid rgba(126,200,240,.15);border-radius:15px;padding:10px;background:rgba(255,255,255,.032)}.missed-ok{display:inline-flex;align-items:center;padding:6px 10px;border-radius:999px;background:rgba(62,201,122,.12);border:1px solid rgba(62,201,122,.25);color:#9EF0BC;font-size:10px;font-weight:900}.missed-accordion{margin-top:8px;border:1px solid rgba(224,85,85,.22);border-radius:14px;background:linear-gradient(145deg,rgba(224,85,85,.105),rgba(255,255,255,.018));overflow:hidden}.missed-accordion summary{list-style:none;cursor:pointer;display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:8px;align-items:center;padding:8px 9px}.missed-accordion summary::-webkit-details-marker{display:none}.missed-count{white-space:nowrap;padding:4px 8px;border-radius:999px;background:rgba(224,85,85,.16);color:#FFB5B5;font-size:10px;font-weight:950}.missed-preview{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#F6A2A2;font-size:10px;font-weight:800}.missed-toggle{white-space:nowrap;color:#7EC8F0;font-size:10px;font-weight:950}.missed-accordion[open] .missed-toggle{color:#fff}.missed-panel{padding:0 9px 9px}.missed-group{border-top:1px solid rgba(126,200,240,.10);padding-top:8px;margin-top:2px}.missed-group-title{font-size:10px;color:#8FAACB;text-transform:uppercase;letter-spacing:.06em;font-weight:950;margin-bottom:6px}.missed-chip-grid{display:flex;flex-wrap:wrap;gap:6px}.missed-chip{display:inline-flex;align-items:center;max-width:100%;padding:5px 8px;border-radius:999px;background:rgba(255,255,255,.045);border:1px solid rgba(224,85,85,.25);color:#FFD0D0;font-size:10px;font-weight:850;line-height:1.15}.missed-block-title{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:14px;margin-bottom:6px}.missed-block-title b{font-size:13px;color:#F08080}.missed-block-title span{font-size:10px;color:#8FAACB;font-weight:900;text-transform:uppercase;letter-spacing:.06em}@media(max-width:780px){body{padding:10px}.kpis{grid-template-columns:1fr 1fr}.content{padding:14px}.history-grid{grid-template-columns:1fr}.route{grid-template-columns:1fr}table{min-width:860px}.missed-accordion summary{grid-template-columns:1fr auto}.missed-preview{grid-column:1/-1;white-space:normal}.missed-count{white-space:normal}}
    </style>`;
  }

  function gerarHTMLRelatorioCompacto(tipo, modFiltro, titulo, versao){
    var rows = rowsRelatorio(modFiltro);
    var rr = resumoRows(rows);
    var mob = versao === 'mobile';
    var tipoNome = tipo === 'alunos' ? 'Relatório geral dos alunos' : tipo === 'modulo' ? 'Relatório por módulo' : tipo === 'turma' ? 'Relatório por turma' : 'Histórico de um Vencedor';
    var filtroNome = modFiltro === 'todos' ? 'Todos os Módulos' : ((getMODULOS() && getMODULOS()[modFiltro] && getMODULOS()[modFiltro].nome) || (modFiltro + 'º Módulo'));
    var dt = new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'});
    var body = `<div class="kpis"><div class="kpi" style="--c:#7EC8F0"><div class="num">${rr.total}</div><div class="txt">Alunos</div></div><div class="kpi" style="--c:#3EC97A"><div class="num">${rr.ativos}</div><div class="txt">Ativos</div></div><div class="kpi" style="--c:#E05555"><div class="num">${rr.faltas}</div><div class="txt">Total de Faltas</div></div><div class="kpi" style="--c:#9B59B6"><div class="num">${rr.pres}</div><div class="txt">Presenças</div></div><div class="kpi" style="--c:#F39C12"><div class="num">${rr.pct}%</div><div class="txt">Presença</div></div></div>`;
    var tabelaAlunos = function(){ return `<div class="table"><table><thead><tr><th>Aluno</th><th>Inscrição</th><th>Telefone</th><th>Módulo ativo</th><th>Turma</th><th>Equipe</th><th>Situação</th><th>Presenças</th><th>Faltas</th><th>Aulas perdidas</th></tr></thead><tbody>${rows.map(function(a){ return `<tr><td><b>${esc(a.nome)}</b></td><td>${esc(a.ins || '—')}</td><td>${esc(a.telefone || '—')}</td><td><span class="tag b">${esc(a.mod)}</span></td><td>${esc(a.turma)}</td><td>${esc(a.equipe)}</td><td><span class="tag ${a.sit === 'DESISTENTE' ? 'r' : 'g'}">${esc(a.sit)}</span></td><td><span class="tag p">${a.pres}/${a.total || 0}</span></td><td><span class="tag ${a.faltas ? 'r' : 'g'}">${a.faltas}</span></td><td>${aulasPerdidasCompact(a.perdidas)}</td></tr>`; }).join('')}</tbody></table></div>`; };
    var tabelaGrupo = function(items){ return `<div class="table"><table><thead><tr><th>Grupo</th><th>Alunos</th><th>Ativos</th><th>Desist.</th><th>Presenças</th><th>Faltas</th><th>Presença</th></tr></thead><tbody>${items.map(function(item){ var x = resumoRows(item[1]); return `<tr><td><b>${esc(item[0])}</b></td><td>${x.total}</td><td><span class="tag g">${x.ativos}</span></td><td><span class="tag r">${x.desistentes}</span></td><td>${x.pres}</td><td><span class="tag ${x.faltas ? 'r' : 'g'}">${x.faltas}</span></td><td><span class="tag p">${x.pct}%</span></td></tr>`; }).join('')}</tbody></table></div>`; };
    if(tipo === 'alunos') body += `<div class="card"><div class="st">Relatório geral dos alunos</div>${tabelaAlunos()}</div>`;
    if(tipo === 'modulo') body += `<div class="card"><div class="st">Relatório por módulo</div>${tabelaGrupo(agrupar(rows, function(a){ return a.mod; }))}</div>`;
    if(tipo === 'turma') body += `<div class="card"><div class="st">Relatório por turma</div>${tabelaGrupo(agrupar(rows, function(a){ return a.turma; }))}</div>`;
    if(tipo === 'caminho') body += `<div class="history-grid">${rows.map(function(a){ var steps = a.stats.map(function(s){ var nomeMod = (getMODULOS() && getMODULOS()[s.modulo] && getMODULOS()[s.modulo].nome) || (s.modulo + 'º Módulo'); return `<div class="step"><b>${esc(nomeMod)}</b><div class="meta">Aulas registradas: ${s.total}</div><div style="margin-top:8px"><span class="tag g">${s.presencas} pres.</span> <span class="tag ${s.faltas ? 'r' : 'g'}">${s.faltas} faltas</span> <span class="tag b">${s.pct}%</span></div></div>`; }).join(''); return `<div class="card"><div class="history-head"><div><div class="history-name">${esc(a.nome)}</div><div class="meta">${esc(a.equipe)} · ${esc(a.turma)} · ${esc(a.mod)}${a.telefone ? ' · ' + esc(a.telefone) : ''}</div></div><span class="tag ${a.sit === 'DESISTENTE' ? 'r' : 'g'}">${esc(a.sit)}</span></div><div class="route">${steps}</div><div class="missed-block-title"><b>Aulas perdidas</b><span>Clique para detalhar</span></div>${aulasPerdidasCompact(a.perdidas)}</div>`; }).join('')}</div>`;
    if(!rows.length) body += '<div class="card"><div class="st">Nenhum aluno encontrado</div><div class="meta">O filtro selecionado não encontrou alunos cadastrados neste módulo.</div></div>';
    return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(titulo)} — ${esc(tipoNome)}</title>${cssRelatorio(mob)}</head><body><main class="shell"><header class="hero"><div class="badge">${esc(tipoNome)} · ${esc(filtroNome)} · Versão ${versao === 'web' ? 'Web' : 'Mobile'}</div><div class="title">${esc(titulo)}</div><div class="sub">Gerado em ${dt} · Instituto de Vencedores</div></header><section class="content">${body}</section></main></body></html>`;
  }

  function ensureModalStyles(){
    if(document.getElementById('iv-compact-modal-style')) return;
    var style = document.createElement('style');
    style.id = 'iv-compact-modal-style';
    style.textContent = `
      #modal-link .iv-link-actions-premium{display:grid!important;grid-template-columns:repeat(auto-fit,minmax(118px,1fr))!important;gap:10px!important;align-items:stretch!important;justify-content:stretch!important;width:100%!important;margin-top:14px!important;overflow:visible!important;}
      #modal-link .iv-link-actions-premium .btn,#modal-link .iv-link-actions-premium button{min-width:0!important;width:100%!important;max-width:100%!important;min-height:46px!important;height:auto!important;padding:11px 10px!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;text-align:center!important;white-space:normal!important;overflow:hidden!important;text-overflow:clip!important;line-height:1.12!important;word-break:normal!important;overflow-wrap:anywhere!important;border-radius:999px!important;font-size:11px!important;font-weight:950!important;letter-spacing:.01em!important;}
      #modal-link .iv-link-actions-premium .btn span,#modal-link .iv-link-actions-premium button span{display:block!important;min-width:0!important;max-width:100%!important;overflow:hidden!important;text-overflow:ellipsis!important;}
      #modal-link .iv-link-actions-premium .iv-btn-whats{background:linear-gradient(135deg,#25D366,#7EDBA8)!important;color:#02120A!important;border:0!important;}
      #modal-link .iv-link-actions-premium .iv-btn-open{background:linear-gradient(135deg,#2F80ED,#22D3EE)!important;color:#fff!important;border:0!important;}
      #modal-link .iv-link-actions-premium .iv-btn-copy{background:linear-gradient(135deg,rgba(126,200,240,.16),rgba(47,128,237,.10))!important;color:#DFF6FF!important;border:1px solid rgba(126,200,240,.28)!important;}
      #modal-link .iv-link-actions-premium .iv-btn-close{background:rgba(255,255,255,.035)!important;color:#B9CBE2!important;border:1px solid rgba(126,200,240,.16)!important;}
      @media(max-width:520px){#modal-link .iv-link-actions-premium{grid-template-columns:repeat(2,minmax(0,1fr))!important}#modal-link .iv-link-actions-premium .btn,#modal-link .iv-link-actions-premium button{font-size:10.5px!important;padding-left:8px!important;padding-right:8px!important}}
      @media(max-width:350px){#modal-link .iv-link-actions-premium{grid-template-columns:1fr!important}}
    `;
    document.head.appendChild(style);
  }
  function premiumizeModalCompact(){
    ensureModalStyles();
    var modal = document.getElementById('modal-link');
    if(!modal) return;
    var input = document.getElementById('link-gerado');
    var actions = input && input.nextElementSibling;
    if(!actions || !actions.querySelectorAll) actions = modal.querySelector('div[style*="justify-content:flex-end"]');
    if(!actions) return;
    actions.classList.add('iv-link-actions-premium');
    Array.prototype.forEach.call(actions.querySelectorAll('button,.btn'), function(btn){
      var txt = (btn.textContent || '').toLowerCase();
      btn.classList.add('iv-link-btn');
      if(txt.indexOf('whatsapp') >= 0){ btn.classList.add('iv-btn-whats'); btn.innerHTML = '<span>Abrir WhatsApp</span>'; }
      else if(txt.indexOf('abrir link') >= 0 || txt.indexOf('abrir o link') >= 0){ btn.classList.add('iv-btn-open'); btn.innerHTML = '<span>Abrir Link</span>'; }
      else if(txt.indexOf('copiar') >= 0){ btn.classList.add('iv-btn-copy'); btn.innerHTML = '<span>Copiar Link</span>'; }
      else if(txt.indexOf('fechar') >= 0){ btn.classList.add('iv-btn-close'); btn.innerHTML = '<span>Fechar</span>'; }
    });
  }

  function versaoAtual(){ var web = document.getElementById('tab-web'); return web && web.classList.contains('active') ? 'web' : 'mobile'; }
  function tipoNomeRelatorio(tipo){ return tipo === 'visao' ? 'Visão Geral atual' : tipo === 'alunos' ? 'Relatório geral dos alunos' : tipo === 'modulo' ? 'Relatório por módulo' : tipo === 'turma' ? 'Relatório por turma' : 'Histórico de um Vencedor'; }

  function patchRelatorioCompacto(){
    if(typeof window.gerarRelatorioLink !== 'function' || window.gerarRelatorioLink._ivCompactReport) return;
    window.gerarRelatorioLink = async function(){
      var modEl = document.getElementById('exp-modulo');
      var tipoEl = document.getElementById('exp-tipo');
      var tituloEl = document.getElementById('exp-titulo');
      var modFiltro = modEl && modEl.value ? modEl.value : 'todos';
      var tipo = tipoEl && tipoEl.value ? tipoEl.value : 'visao';
      var titulo = tituloEl && tituloEl.value ? tituloEl.value : 'Instituto de Vencedores';
      var mods = modulosSelecionados(modFiltro);
      var versao = versaoAtual();
      var html;
      if(tipo === 'visao'){
        var data = typeof buildReportData === 'function' ? buildReportData(mods) : {modulos:[]};
        if(versao === 'web' && typeof gerarHTMLWeb === 'function') html = gerarHTMLWeb(data, titulo);
        else if(typeof gerarHTMLMobile === 'function') html = gerarHTMLMobile(data, titulo);
        else html = gerarHTMLRelatorioCompacto('alunos', modFiltro, titulo, versao);
      } else html = gerarHTMLRelatorioCompacto(tipo, modFiltro, titulo, versao);
      var ultima = typeof detectarUltimaSemana === 'function' ? detectarUltimaSemana(mods) : [];
      if(typeof toast === 'function') toast('Gerando link, aguarde...⏳');
      try{
        var id = 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2,6);
        var fb = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
        await fb.setDoc(fb.doc(fb.getFirestore(), 'relatorios', id), {html:html,titulo:titulo,tipo:tipoNomeRelatorio(tipo),modulo:modFiltro,versao:versao,criadoEm:new Date().toISOString()});
        var link = location.origin + '/relatorio?id=' + id;
        var linkInput = document.getElementById('link-gerado');
        if(linkInput) linkInput.value = link;
        window._ultimaSemana = ultima;
        window._tipoRelatorioAtual = tipoNomeRelatorio(tipo);
        var prev = document.getElementById('whats-preview');
        if(prev){
          if(typeof window.montarMensagemWhats === 'function') prev.textContent = window.montarMensagemWhats(link, ultima, window._tipoRelatorioAtual);
          else prev.textContent = '📊 *' + window._tipoRelatorioAtual + ' – Instituto de Vencedores*\n\n🔗 Acesse pelo link:\n' + link;
        }
        var modal = document.getElementById('modal-link');
        if(modal) modal.style.display = 'flex';
        premiumizeModalCompact();
        if(typeof toast === 'function') toast('Link gerado! ✓');
      }catch(e){ console.error(e); if(typeof toast === 'function') toast('Erro ao gerar link. Tente novamente.', true); }
    };
    window.gerarRelatorioLink._ivCompactReport = true;
    window.gerarRelatorioLink._ivCustomReport = true;
    window.gerarRelatorio = function(){ return window.gerarRelatorioLink(); };
  }

  function init(){
    ensureModalStyles();
    premiumizeModalCompact();
    patchRelatorioCompacto();
    setTimeout(function(){ premiumizeModalCompact(); patchRelatorioCompacto(); }, 250);
    setTimeout(function(){ premiumizeModalCompact(); patchRelatorioCompacto(); }, 900);
    setTimeout(function(){ premiumizeModalCompact(); patchRelatorioCompacto(); }, 1800);
    setTimeout(function(){ premiumizeModalCompact(); patchRelatorioCompacto(); }, 2800);
  }

  ready(init);
})();

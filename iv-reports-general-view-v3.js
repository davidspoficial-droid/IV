// IV - Visão Geral V3: mesmo layout mobile no Web e resumo completo por Revisão
(function(){
  'use strict';

  var VERSION = 'v3-general-mobile-layout';
  var MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  var previous = window.gerarRelatorioLink;

  function data(){
    try { return typeof DB !== 'undefined' ? DB : null; }
    catch(e){ return null; }
  }

  function esc(value){
    return String(value == null ? '' : value).replace(/[&<>"']/g, function(char){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char];
    });
  }

  function number(value){
    var parsed = parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function moduleName(value){
    var key = String(value || '1');
    try { return MODULOS[key] ? MODULOS[key].nome : key + 'º Módulo'; }
    catch(e){ return key + 'º Módulo'; }
  }

  function className(value){
    if(value === 'quinta') return 'Quinta-feira';
    if(value === 'sabado') return 'Sábado';
    return 'Sem turma';
  }

  function teamName(student){
    var d = data();
    var team = d && (d.equipes || []).find(function(item){
      return String(item.id) === String(student.equipeId);
    });
    return team ? team.nome : 'Sem equipe';
  }

  function reviewKey(student){
    try {
      if(window.IVReview && typeof window.IVReview.key === 'function'){
        var fromCore = window.IVReview.key(student);
        if(fromCore) return String(fromCore);
      }
    } catch(e){}

    var year = String(student && student.revisaoAno || '').replace(/\D/g, '').slice(0, 4);
    var month = String(student && student.revisaoMes || '').replace(/\D/g, '').slice(0, 2);
    if(month) month = String(parseInt(month, 10)).padStart(2, '0');

    if((!year || !month) && student){
      var match = String(student.revisao || '').match(/(20\d{2})[-\/]?(\d{1,2})/);
      if(match){
        year = match[1];
        month = String(parseInt(match[2], 10)).padStart(2, '0');
      }
    }

    return /^20\d{2}$/.test(year) && /^(0[1-9]|1[0-2])$/.test(month) ? year + '-' + month : '';
  }

  function reviewLabel(value){
    var key = typeof value === 'string' ? value : reviewKey(value);
    if(!key) return 'Sem revisão';
    try {
      if(window.IVReview && typeof window.IVReview.label === 'function'){
        var fromCore = window.IVReview.label(key);
        if(fromCore && fromCore !== 'Sem revisão') return fromCore;
      }
    } catch(e){}
    var parts = key.split('-');
    return 'Revisão ' + (MONTHS[number(parts[1]) - 1] || parts[1]) + '/' + parts[0];
  }

  function presence(student){
    var d = data();
    var present = 0;
    var total = 0;
    var activeModule = Math.max(1, Math.min(3, number(student.modulo || 1)));
    if(!d) return {present:0,total:0,absence:0,pct:0};

    [1,2,3].forEach(function(moduleNumber){
      var moduleData;
      try { moduleData = MODULOS[moduleNumber]; }
      catch(e){ moduleData = null; }
      if(!moduleData) return;

      (moduleData.semanas || []).forEach(function(week, weekIndex){
        var hasPresence = (week.aulas || []).some(function(lesson){
          try { return !!d.presencas[presKey(student.id, moduleNumber, weekIndex, lesson)]; }
          catch(e){ return false; }
        });
        var started = moduleNumber < activeModule || hasPresence;
        if(moduleNumber === activeModule){
          try {
            started = (typeof semanaIniciada === 'function' ? semanaIniciada(moduleNumber, weekIndex) : true) || hasPresence;
          } catch(e){ started = true; }
        }
        if(moduleNumber > activeModule && !hasPresence) started = false;
        if(!started) return;

        (week.aulas || []).forEach(function(lesson){
          total += 1;
          try {
            if(d.presencas[presKey(student.id, moduleNumber, weekIndex, lesson)]) present += 1;
          } catch(e){}
        });
      });
    });

    return {
      present: present,
      total: total,
      absence: Math.max(total - present, 0),
      pct: total ? Math.round(present / total * 100) : 0
    };
  }

  function rows(moduleFilter){
    var d = data();
    if(!d) return [];
    return (d.alunos || []).filter(function(student){
      return moduleFilter === 'todos' || !moduleFilter || String(student.modulo || '1') === String(moduleFilter);
    }).map(function(student){
      return {
        raw: student,
        id: student.id,
        name: student.nome || 'Sem nome',
        registration: student.inscricao || '',
        module: moduleName(student.modulo),
        moduleNumber: number(student.modulo || 1),
        team: teamName(student),
        turma: className(student.turma),
        status: String(student.situacao || 'ATIVO').toUpperCase(),
        reviewKey: reviewKey(student),
        review: reviewLabel(student),
        attendance: presence(student)
      };
    }).sort(function(a,b){
      return a.moduleNumber - b.moduleNumber || a.name.localeCompare(b.name, 'pt-BR');
    });
  }

  function summary(items){
    var teams = {};
    var present = 0;
    var total = 0;
    var active = 0;
    var quit = 0;
    items.forEach(function(item){
      if(item.status === 'ATIVO') active += 1;
      if(item.status === 'DESISTENTE') quit += 1;
      if(item.team !== 'Sem equipe') teams[item.team] = true;
      present += item.attendance.present;
      total += item.attendance.total;
    });
    return {
      total: items.length,
      active: active,
      quit: quit,
      teams: Object.keys(teams).length,
      absence: Math.max(total - present, 0),
      pct: total ? Math.round(present / total * 100) : 0
    };
  }

  function group(items, getter){
    var result = {};
    items.forEach(function(item){
      var key = getter(item) || 'Não informado';
      if(!result[key]) result[key] = [];
      result[key].push(item);
    });
    return Object.keys(result).sort(function(a,b){
      return result[b].length - result[a].length || a.localeCompare(b, 'pt-BR');
    }).map(function(key){ return [key, result[key]]; });
  }

  function reviewGroups(items){
    var result = {};
    var withoutReview = [];
    items.forEach(function(item){
      if(item.reviewKey){
        if(!result[item.reviewKey]) result[item.reviewKey] = [];
        result[item.reviewKey].push(item);
      } else {
        withoutReview.push(item);
      }
    });
    var output = Object.keys(result).sort().reverse().map(function(key){
      return {key:key,label:reviewLabel(key),items:result[key]};
    });
    if(withoutReview.length) output.push({key:'__none__',label:'Sem revisão',items:withoutReview});
    return output;
  }

  function cards(items){
    var values = summary(items);
    return '<div class="kpis">' +
      '<div class="kpi" style="--c:#7EC8F0"><b>'+values.total+'</b><span>Alunos</span></div>' +
      '<div class="kpi" style="--c:#3EC97A"><b>'+values.active+'</b><span>Ativos</span></div>' +
      '<div class="kpi" style="--c:#E05555"><b>'+values.quit+'</b><span>Desistentes</span></div>' +
      '<div class="kpi" style="--c:#C39BD3"><b>'+values.teams+'</b><span>Equipes</span></div>' +
      '<div class="kpi" style="--c:#F0B866"><b>'+values.absence+'</b><span>Faltas</span></div>' +
      '<div class="kpi" style="--c:#22D3EE"><b>'+values.pct+'%</b><span>Presença</span></div>' +
    '</div>';
  }

  function tags(item){
    return '<div class="tags">' +
      '<span class="tag module m'+item.moduleNumber+'">'+esc(item.module)+'</span>' +
      '<span class="tag purple">'+esc(item.turma)+'</span>' +
      '<span class="tag">'+esc(item.review)+'</span>' +
      '<span class="tag green">'+item.attendance.pct+'% presença</span>' +
      '<span class="tag red">'+item.attendance.absence+' faltas</span>' +
    '</div>';
  }

  function students(items){
    if(!items.length) return '<div class="empty">Nenhum aluno encontrado.</div>';
    return '<div class="students">' + items.map(function(item){
      return '<article class="student"><div class="student-head"><div><strong>'+esc(item.name)+'</strong><small>'+esc(item.registration || 'Sem inscrição')+' · '+esc(item.team)+'</small></div><span class="status '+(item.status === 'DESISTENTE' ? 'red' : 'green')+'">'+esc(item.status)+'</span></div>'+tags(item)+'</article>';
    }).join('') + '</div>';
  }

  function groupRows(entries){
    if(!entries.length) return '<div class="empty">Nenhuma informação encontrada.</div>';
    var max = Math.max.apply(Math, entries.map(function(entry){ return entry[1].length; }).concat([1]));
    return entries.map(function(entry){
      var values = summary(entry[1]);
      var width = Math.max(4, Math.round(entry[1].length / max * 100));
      return '<div class="group"><div class="group-top"><strong>'+esc(entry[0])+'</strong><b>'+entry[1].length+' aluno(s)</b></div><div class="bar"><i style="width:'+width+'%"></i></div><div class="tags"><span class="tag green">'+values.active+' ativos</span><span class="tag red">'+values.quit+' desist.</span><span class="tag purple">'+values.pct+'% presença</span><span class="tag">'+values.absence+' faltas</span></div></div>';
    }).join('');
  }

  function section(title, icon, body, open){
    return '<details class="section" '+(open ? 'open' : '')+'><summary><span class="icon">'+icon+'</span><strong>'+esc(title)+'</strong><span class="chev">⌄</span></summary><div class="section-body">'+body+'</div></details>';
  }

  function reviewOverview(items){
    var groups = reviewGroups(items);
    if(!groups.length){
      return section('Informações por Revisão', '◈', '<div class="empty">Nenhuma Revisão cadastrada.</div>', true);
    }
    var html = '<div class="review-grid">' + groups.map(function(item){
      var values = summary(item.items);
      var modules = group(item.items, function(student){ return student.module; }).map(function(entry){ return entry[0]; });
      var classes = group(item.items, function(student){ return student.turma; }).map(function(entry){ return entry[0]; });
      return '<article class="review-card"><div class="review-head"><div><strong>'+esc(item.label)+'</strong><small>Informações desta Revisão</small></div><b>'+item.items.length+' aluno(s)</b></div><div class="review-metrics"><div><b>'+values.active+'</b><span>Ativos</span></div><div><b>'+values.quit+'</b><span>Desistentes</span></div><div><b>'+values.teams+'</b><span>Equipes</span></div><div><b>'+values.pct+'%</b><span>Presença</span></div></div><div class="tags">'+modules.map(function(value){ return '<span class="tag">'+esc(value)+'</span>'; }).join('')+classes.map(function(value){ return '<span class="tag purple">'+esc(value)+'</span>'; }).join('')+'</div></article>';
    }).join('') + '</div>';
    return section('Informações por Revisão', '◈', html, true);
  }

  function overview(items, includeReviewOverview){
    return cards(items) +
      (includeReviewOverview ? reviewOverview(items) : '') +
      section('Alunos por módulo', '▥', groupRows(group(items, function(item){ return item.module; })), true) +
      section('Alunos por turma', '◫', groupRows(group(items, function(item){ return item.turma; })), false) +
      section('Alunos por equipe', '✦', groupRows(group(items, function(item){ return item.team; })), false) +
      section('Lista de alunos', '☰', students(items), false);
  }

  function overviewTabs(items, selectedReview){
    var tabs = [{key:'__all__',label:'Visão geral',items:items}].concat(reviewGroups(items));
    var active = selectedReview && tabs.some(function(tab){ return tab.key === selectedReview; }) ? selectedReview : '__all__';
    return '<div class="tabs" role="tablist">' + tabs.map(function(tab){
      return '<button type="button" class="tab '+(tab.key === active ? 'active' : '')+'" data-tab="'+esc(tab.key)+'">'+esc(tab.label)+'</button>';
    }).join('') + '</div>' + tabs.map(function(tab){
      return '<section class="pane '+(tab.key === active ? 'active' : '')+'" data-pane="'+esc(tab.key)+'">'+overview(tab.items, tab.key === '__all__')+'</section>';
    }).join('');
  }

  function css(version){
    var maxWidth = version === 'web' ? '900px' : '620px';
    var padding = version === 'web' ? '24px' : '10px';
    return '<style>' +
      '*{box-sizing:border-box}' +
      'body{margin:0;min-height:100vh;padding:'+padding+';background:radial-gradient(circle at 12% 0,rgba(47,128,237,.27),transparent 32%),radial-gradient(circle at 91% 9%,rgba(34,211,238,.14),transparent 30%),linear-gradient(145deg,#020611,#07111F 48%,#030712);color:#EAF4FF;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif}' +
      '.shell{width:100%;max-width:'+maxWidth+';margin:auto;border:1px solid rgba(126,200,240,.18);border-radius:23px;overflow:hidden;background:linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.014)),rgba(8,19,36,.88);box-shadow:0 30px 90px rgba(0,0,0,.46)}' +
      '.hero{padding:20px 16px;background:radial-gradient(circle at 10% 0,rgba(47,128,237,.26),transparent 38%),linear-gradient(135deg,rgba(7,17,31,.98),rgba(16,40,70,.86));border-bottom:1px solid rgba(126,200,240,.16)}' +
      '.eyebrow{display:inline-flex;padding:6px 10px;border-radius:999px;background:linear-gradient(135deg,#2F80ED,#22D3EE);font-size:9px;font-weight:900}' +
      '.title{font-size:25px;line-height:1.04;font-weight:950;margin-top:9px}' +
      '.meta{margin-top:7px;color:#91AACA;font-size:11px;line-height:1.5}' +
      '.content{padding:14px 11px 22px}' +
      '.tabs{display:flex;gap:7px;overflow-x:auto;padding:2px 1px 10px;scrollbar-width:none}.tabs::-webkit-scrollbar{display:none}' +
      '.tab{border:1px solid rgba(126,200,240,.16);border-radius:999px;background:rgba(255,255,255,.026);color:#9CB8D6;padding:8px 11px;font-size:10px;font-weight:900;white-space:nowrap;cursor:pointer}.tab.active{color:#fff;background:linear-gradient(135deg,#2F80ED,#22A8E8)}' +
      '.pane{display:none}.pane.active{display:block}' +
      '.kpis{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin-bottom:12px}' +
      '.kpi{min-height:82px;padding:9px 5px;border-radius:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;border:1px solid rgba(126,200,240,.14);background:rgba(7,17,31,.82)}.kpi b{font-size:clamp(20px,7vw,27px);color:var(--c);line-height:1}.kpi span{font-size:7px;color:#8FAACB;font-weight:900;text-transform:uppercase;margin-top:5px}' +
      '.section,.student,.review-card{border:1px solid rgba(126,200,240,.15);border-radius:19px;background:rgba(7,17,31,.82);box-shadow:0 15px 36px rgba(0,0,0,.25)}' +
      '.section{margin-bottom:10px;overflow:hidden}.section>summary{list-style:none;min-height:55px;padding:10px 12px;display:grid;grid-template-columns:36px minmax(0,1fr) 25px;gap:9px;align-items:center;cursor:pointer}.section>summary::-webkit-details-marker{display:none}.icon{width:36px;height:36px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:rgba(47,128,237,.11);color:#BFEAFF}.section>summary strong{font-size:12px}.chev{font-size:18px;color:#7EC8F0}.section-body{padding:10px 11px 11px;border-top:1px solid rgba(126,200,240,.09)}' +
      '.students,.review-grid{display:grid;grid-template-columns:1fr;gap:8px}.student,.review-card{padding:12px}' +
      '.student-head,.review-head,.group-top{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.student-head strong,.review-head strong{display:block;font-size:13px}.student-head small,.review-head small{display:block;color:#8FAACB;font-size:9px;margin-top:3px}.status,.review-head>b{padding:5px 8px;border-radius:999px;font-size:9px;font-weight:900;white-space:nowrap}' +
      '.green{background:rgba(62,201,122,.12)!important;color:#7EDBA8!important}.red{background:rgba(224,85,85,.12)!important;color:#F08080!important}.purple{background:rgba(155,89,182,.13)!important;color:#D8A7ED!important}' +
      '.tags{display:flex;gap:5px;flex-wrap:wrap;margin-top:8px}.tag{display:inline-flex;padding:4px 8px;border-radius:999px;font-size:9px;font-weight:900;background:rgba(126,200,240,.09);color:#BFEAFF}.m1{background:rgba(47,128,237,.18);color:#BFEAFF}.m2{background:rgba(62,201,122,.18);color:#B9FFD2}.m3{background:rgba(224,85,85,.18);color:#FFE1E1}' +
      '.review-metrics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin-top:10px}.review-metrics>div{padding:9px;border-radius:13px;background:rgba(255,255,255,.019)}.review-metrics b{display:block;font-size:15px}.review-metrics span{font-size:7px;color:#7F9DBF;text-transform:uppercase}' +
      '.group{padding:11px 2px;border-bottom:1px solid rgba(126,200,240,.085)}.group-top strong{font-size:12px}.group-top b{font-size:10px;color:#7EC8F0}.bar{height:5px;margin-top:7px;border-radius:999px;background:rgba(126,200,240,.10);overflow:hidden}.bar i{display:block;height:100%;background:linear-gradient(90deg,#2F80ED,#22D3EE)}' +
      '.empty{padding:24px 12px;text-align:center;color:#8FAACB}.footer{text-align:center;padding:0 14px 20px;color:#6685AA;font-size:9px}' +
      '@media(max-width:390px){.kpis{grid-template-columns:repeat(2,minmax(0,1fr))}}' +
      '@media print{body{background:#fff;color:#102033;padding:0}.shell{box-shadow:none}.tabs{display:none}.pane{display:block!important}}' +
    '</style>';
  }

  function tabsScript(){
    return '<script>(function(){document.querySelectorAll(".tab[data-tab]").forEach(function(button){button.addEventListener("click",function(){var key=button.getAttribute("data-tab");document.querySelectorAll(".tab[data-tab]").forEach(function(item){item.classList.toggle("active",item===button)});document.querySelectorAll(".pane[data-pane]").forEach(function(pane){pane.classList.toggle("active",pane.getAttribute("data-pane")===key)})})})})();<\/script>';
  }

  function build(moduleFilter, reviewFilter, title, version){
    var items = rows(moduleFilter);
    var moduleText = moduleFilter === 'todos' ? 'Todos os módulos' : moduleName(moduleFilter);
    var dateText = new Date().toLocaleString('pt-BR', {day:'2-digit',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'});
    return '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(title)+' — Visão Geral atual</title>'+css(version)+'</head><body><main class="shell"><header class="hero"><span class="eyebrow">Relatório Premium · '+(version === 'web' ? 'Web' : 'Mobile')+'</span><div class="title">'+esc(title)+'</div><div class="meta">Visão Geral atual<br>'+esc(moduleText)+' · Todas as Revisões com informações completas<br>Gerado em '+esc(dateText)+'</div></header><section class="content">'+overviewTabs(items, reviewFilter)+'</section><div class="footer">Instituto de Vencedores · Sistema de Gestão</div></main>'+tabsScript()+'</body></html>';
  }

  async function generateGeneral(){
    var moduleFilter = (document.getElementById('exp-modulo') || {}).value || 'todos';
    var reviewFilter = (document.getElementById('exp-revisao') || {}).value || '';
    var title = (document.getElementById('exp-titulo') || {}).value || 'Instituto de Vencedores';
    var webButton = document.getElementById('tab-web');
    var version = webButton && webButton.classList.contains('active') ? 'web' : 'mobile';
    var html = build(moduleFilter, reviewFilter, title, version);

    if(typeof toast === 'function') toast('Gerando link, aguarde...⏳');
    var firebase = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
    var id = 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    await firebase.setDoc(firebase.doc(firebase.getFirestore(), 'relatorios', id), {
      html: html,
      titulo: title,
      tipo: 'Visão Geral atual',
      versao: version,
      revisao: reviewFilter || 'todas',
      modulo: moduleFilter,
      gerador: VERSION,
      criadoEm: new Date().toISOString()
    });

    var link = location.origin + '/relatorio?id=' + id;
    var input = document.getElementById('link-gerado');
    if(input) input.value = link;
    window._tipoRelatorioAtual = 'Visão Geral atual';
    var preview = document.getElementById('whats-preview');
    if(preview && typeof montarMensagemWhats === 'function'){
      preview.textContent = montarMensagemWhats(link, window._ultimaSemana || [], window._tipoRelatorioAtual);
    }
    var modal = document.getElementById('modal-link');
    if(modal) modal.style.display = 'flex';
    if(typeof registrarAlteracaoIV === 'function'){
      registrarAlteracaoIV('relatorio', 'Gerou relatório', 'Visão Geral atual', moduleFilter + ' · todas as revisões');
    }
    if(typeof toast === 'function') toast('Link gerado! ✓');
    return link;
  }

  async function generate(){
    var type = (document.getElementById('exp-tipo') || {}).value || 'visao';
    if(type !== 'visao' && typeof previous === 'function') return previous.apply(this, arguments);
    return generateGeneral();
  }

  generate._ivReportsGeneratorV2 = true;
  generate._ivGeneralViewV3 = true;
  generate._ivRevSafe = 1;

  function install(){
    window.gerarRelatorioLink = generate;
    var alias = function(){ return generate(); };
    alias._ivReportsGeneratorV2 = true;
    alias._ivGeneralViewV3 = true;
    alias._ivRevSafe = 1;
    window.gerarRelatorio = alias;
  }

  install();
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, {once:true});
  [100,500,1400,2500,4000].forEach(function(delay){ window.setTimeout(install, delay); });
})();
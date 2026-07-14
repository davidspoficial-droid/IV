// IV - autoridade final da Visão Geral: o Web reutiliza literalmente o relatório Mobile
(function(){
  'use strict';

  var VERSION = 'general-mobile-authority-v1';
  var MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  var generating = false;

  function esc(value){
    return String(value == null ? '' : value).replace(/[&<>"']/g, function(char){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char];
    });
  }

  function database(){
    try { return typeof DB !== 'undefined' ? DB : null; }
    catch(error){ return null; }
  }

  function reviewKey(student){
    try {
      if(window.IVReview && typeof window.IVReview.key === 'function'){
        var coreKey = window.IVReview.key(student);
        if(coreKey) return String(coreKey);
      }
    } catch(error){}

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

  function reviewLabel(key){
    if(!key) return 'Sem revisão';
    try {
      if(window.IVReview && typeof window.IVReview.label === 'function'){
        var label = window.IVReview.label(key);
        if(label && label !== 'Sem revisão') return label;
      }
    } catch(error){}
    var parts = String(key).split('-');
    return 'Revisão ' + (MONTHS[parseInt(parts[1], 10) - 1] || parts[1]) + '/' + parts[0];
  }

  function teamName(student){
    var data = database();
    var team = data && (data.equipes || []).find(function(item){
      return String(item.id) === String(student.equipeId);
    });
    return team ? team.nome : 'Sem equipe';
  }

  function className(value){
    if(value === 'quinta') return 'Quinta-feira';
    if(value === 'sabado') return 'Sábado';
    return 'Sem turma';
  }

  function attendance(student, moduleNumber){
    var data = database();
    var moduleData;
    try { moduleData = MODULOS[moduleNumber]; }
    catch(error){ moduleData = null; }
    if(!data || !moduleData) return {present:0,total:0,absence:0,pct:0};

    var present = 0;
    var total = 0;
    (moduleData.semanas || []).forEach(function(week, weekIndex){
      var started = false;
      try {
        started = typeof semanaIniciada === 'function' ? semanaIniciada(moduleNumber, weekIndex) : true;
      } catch(error){ started = true; }
      var ownPresence = (week.aulas || []).some(function(lesson){
        try { return !!data.presencas[presKey(student.id, moduleNumber, weekIndex, lesson)]; }
        catch(error){ return false; }
      });
      if(!started && !ownPresence) return;
      (week.aulas || []).forEach(function(lesson){
        total += 1;
        try {
          if(data.presencas[presKey(student.id, moduleNumber, weekIndex, lesson)]) present += 1;
        } catch(error){}
      });
    });

    return {
      present: present,
      total: total,
      absence: Math.max(total - present, 0),
      pct: total ? Math.round(present / total * 100) : 0
    };
  }

  function reviewGroups(moduleNumber){
    var data = database();
    if(!data) return [];
    var groups = {};
    (data.alunos || []).filter(function(student){
      return String(student.modulo || '1') === String(moduleNumber);
    }).forEach(function(student){
      var key = reviewKey(student) || '__none__';
      if(!groups[key]) groups[key] = [];
      groups[key].push(student);
    });

    return Object.keys(groups).sort(function(a, b){
      if(a === '__none__') return 1;
      if(b === '__none__') return -1;
      return b.localeCompare(a);
    }).map(function(key){
      return {
        key: key,
        label: key === '__none__' ? 'Sem revisão' : reviewLabel(key),
        students: groups[key].slice().sort(function(a,b){
          return String(a.nome || '').localeCompare(String(b.nome || ''), 'pt-BR');
        })
      };
    });
  }

  function groupSummary(group, moduleNumber){
    var teams = {};
    var classes = {};
    var present = 0;
    var total = 0;
    var active = 0;
    var quit = 0;

    group.students.forEach(function(student){
      var status = String(student.situacao || 'ATIVO').toUpperCase();
      if(status === 'ATIVO') active += 1;
      if(status === 'DESISTENTE') quit += 1;
      var team = teamName(student);
      if(team !== 'Sem equipe') teams[team] = true;
      var classLabel = className(student.turma);
      if(classLabel !== 'Sem turma') classes[classLabel] = true;
      var stats = attendance(student, moduleNumber);
      present += stats.present;
      total += stats.total;
    });

    return {
      total: group.students.length,
      active: active,
      quit: quit,
      teams: Object.keys(teams).length,
      classes: Object.keys(classes),
      pct: total ? Math.round(present / total * 100) : 0,
      absence: Math.max(total - present, 0)
    };
  }

  function reviewPanel(group, moduleNumber, moduleIndex, reviewIndex){
    var summary = groupSummary(group, moduleNumber);
    var studentHtml = group.students.map(function(student){
      var status = String(student.situacao || 'ATIVO').toUpperCase();
      var stats = attendance(student, moduleNumber);
      return '<div style="padding:9px 0;border-bottom:1px solid rgba(30,46,74,.38)">' +
        '<div style="display:flex;justify-content:space-between;gap:9px;align-items:flex-start">' +
          '<div style="min-width:0"><div style="font-size:12px;font-weight:800;color:#E8F0FF;overflow-wrap:anywhere">'+esc(student.nome || 'Sem nome')+'</div>' +
          '<div style="font-size:10px;color:#6B8AB0;margin-top:3px">'+esc(teamName(student))+' · '+esc(className(student.turma))+'</div></div>' +
          '<span style="padding:3px 7px;border-radius:999px;font-size:8px;font-weight:900;background:'+(status === 'DESISTENTE' ? 'rgba(224,85,85,.14);color:#F08080' : 'rgba(62,201,122,.14);color:#7EDBA8')+'">'+esc(status)+'</span>' +
        '</div>' +
        '<div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:7px">' +
          '<span style="padding:3px 7px;border-radius:999px;background:rgba(47,128,237,.12);color:#BFEAFF;font-size:9px;font-weight:800">'+stats.pct+'% presença</span>' +
          '<span style="padding:3px 7px;border-radius:999px;background:rgba(224,85,85,.12);color:#F08080;font-size:9px;font-weight:800">'+stats.absence+' faltas</span>' +
        '</div>' +
      '</div>';
    }).join('') || '<div style="padding:18px;text-align:center;color:#6B8AB0;font-size:11px">Nenhum aluno nesta Revisão.</div>';

    return '<div data-iv-review-panel="'+moduleIndex+'" id="iv-rev-panel-'+moduleIndex+'-'+reviewIndex+'" style="display:'+(reviewIndex === 0 ? 'block' : 'none')+'">' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:10px">' +
        '<div style="padding:10px;border:1px solid #1E2E4A;border-radius:11px;background:rgba(255,255,255,.025);text-align:center"><div style="font-size:20px;font-weight:900;color:#7EC8F0">'+summary.total+'</div><div style="font-size:8px;color:#6B8AB0;text-transform:uppercase">Alunos</div></div>' +
        '<div style="padding:10px;border:1px solid #1E2E4A;border-radius:11px;background:rgba(255,255,255,.025);text-align:center"><div style="font-size:20px;font-weight:900;color:#3EC97A">'+summary.active+'</div><div style="font-size:8px;color:#6B8AB0;text-transform:uppercase">Ativos</div></div>' +
        '<div style="padding:10px;border:1px solid #1E2E4A;border-radius:11px;background:rgba(255,255,255,.025);text-align:center"><div style="font-size:20px;font-weight:900;color:#E05555">'+summary.quit+'</div><div style="font-size:8px;color:#6B8AB0;text-transform:uppercase">Desistentes</div></div>' +
        '<div style="padding:10px;border:1px solid #1E2E4A;border-radius:11px;background:rgba(255,255,255,.025);text-align:center"><div style="font-size:20px;font-weight:900;color:#22D3EE">'+summary.pct+'%</div><div style="font-size:8px;color:#6B8AB0;text-transform:uppercase">Presença</div></div>' +
      '</div>' +
      '<div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:8px">' +
        '<span style="padding:4px 8px;border-radius:999px;background:rgba(155,89,182,.13);color:#D8A7ED;font-size:9px;font-weight:900">'+summary.teams+' equipe(s)</span>' +
        summary.classes.map(function(value){ return '<span style="padding:4px 8px;border-radius:999px;background:rgba(126,200,240,.09);color:#BFEAFF;font-size:9px;font-weight:900">'+esc(value)+'</span>'; }).join('') +
      '</div>' +
      '<details style="border:1px solid rgba(126,200,240,.12);border-radius:12px;background:rgba(255,255,255,.015);overflow:hidden"><summary style="padding:10px 11px;color:#BFEAFF;font-size:10px;font-weight:900;cursor:pointer">Ver alunos desta Revisão</summary><div style="padding:0 11px 8px">'+studentHtml+'</div></details>' +
    '</div>';
  }

  function reviewSection(moduleNumber, moduleIndex){
    var groups = reviewGroups(moduleNumber);
    if(!groups.length) return '';

    var tabs = groups.map(function(group, reviewIndex){
      return '<button type="button" onclick="ivShowReview('+moduleIndex+','+reviewIndex+',this)" data-iv-review-tab="'+moduleIndex+'" style="flex:0 0 auto;padding:6px 10px;border:1px solid rgba(126,200,240,.16);border-radius:999px;background:'+(reviewIndex === 0 ? '#4A90D9' : 'rgba(255,255,255,.055)')+';color:'+(reviewIndex === 0 ? '#fff' : '#8FAACB')+';font-size:9px;font-weight:900;cursor:pointer;white-space:nowrap">'+esc(group.label)+'</button>';
    }).join('');

    var panels = groups.map(function(group, reviewIndex){
      return reviewPanel(group, moduleNumber, moduleIndex, reviewIndex);
    }).join('');

    return '<section data-iv-review-section style="padding:0 13px 6px">' +
      '<div style="font-size:14px;font-weight:700;color:#7EC8F0;margin-bottom:10px;margin-top:18px;padding-bottom:7px;border-bottom:1px solid #1E2E4A">◈ Informações por Revisão</div>' +
      '<div style="background:#0D1626;border:1px solid #1E2E4A;border-radius:12px;padding:12px;margin-bottom:14px">' +
        '<div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:9px;scrollbar-width:none">'+tabs+'</div>' +
        panels +
      '</div>' +
    '</section>';
  }

  function enhanceMobileHtml(html, modules, version){
    var parser = new DOMParser();
    var documentReport = parser.parseFromString(html, 'text/html');
    documentReport.body.classList.add(version === 'web' ? 'iv-report-web' : 'iv-report-mobile');

    modules.forEach(function(moduleNumber, moduleIndex){
      var modulePanel = documentReport.getElementById('mod-' + moduleIndex);
      if(!modulePanel) return;
      var section = documentReport.createElement('div');
      section.innerHTML = reviewSection(moduleNumber, moduleIndex);
      if(section.firstElementChild){
        var weeks = documentReport.getElementById('sems-' + moduleIndex);
        if(weeks && weeks.nextSibling) modulePanel.insertBefore(section.firstElementChild, weeks.nextSibling);
        else modulePanel.appendChild(section.firstElementChild);
      }
    });

    var style = documentReport.createElement('style');
    style.id = 'iv-general-authority-style';
    style.textContent =
      'body.iv-report-web{padding:24px 0!important}' +
      'body.iv-report-web>.header,body.iv-report-web>.top-nav,body.iv-report-web>#modulos{width:min(900px,calc(100% - 48px))!important;margin-left:auto!important;margin-right:auto!important}' +
      'body.iv-report-web>.header{border-radius:22px 22px 0 0}' +
      'body.iv-report-web>#modulos{border-radius:0 0 22px 22px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.38)}' +
      '@media(max-width:820px){body.iv-report-web{padding:0!important}body.iv-report-web>.header,body.iv-report-web>.top-nav,body.iv-report-web>#modulos{width:100%!important;border-radius:0!important}}';
    documentReport.head.appendChild(style);

    var badge = documentReport.querySelector('.hbadge');
    if(badge) badge.textContent = version === 'web' ? '📋 Relatório Web' : '📋 Relatório Mobile';

    var script = documentReport.createElement('script');
    script.textContent = 'function ivShowReview(mi,ri,btn){document.querySelectorAll("[data-iv-review-panel=\\""+mi+"\\"]").forEach(function(p){p.style.display="none"});var panel=document.getElementById("iv-rev-panel-"+mi+"-"+ri);if(panel)panel.style.display="block";document.querySelectorAll("[data-iv-review-tab=\\""+mi+"\\"]").forEach(function(b){b.style.background="rgba(255,255,255,.055)";b.style.color="#8FAACB"});if(btn){btn.style.background="#4A90D9";btn.style.color="#fff"}}';
    documentReport.body.appendChild(script);

    return '<!DOCTYPE html>\n' + documentReport.documentElement.outerHTML;
  }

  function selectedVersion(){
    var webButton = document.getElementById('tab-web');
    return webButton && webButton.classList.contains('active') ? 'web' : 'mobile';
  }

  async function generateGeneralView(){
    if(generating) return;
    if(typeof userCan === 'function' && !userCan('relatorios_generate')){
      if(typeof toast === 'function') toast('Você não tem permissão para gerar relatórios.', true);
      return;
    }

    var moduleFilter = (document.getElementById('exp-modulo') || {}).value || 'todos';
    var title = (document.getElementById('exp-titulo') || {}).value || 'Instituto de Vencedores';
    var version = selectedVersion();
    var modules = moduleFilter === 'todos' ? [1,2,3] : [parseInt(moduleFilter, 10)];

    if(typeof buildReportData !== 'function' || typeof gerarHTMLMobile !== 'function'){
      if(typeof toast === 'function') toast('O gerador principal ainda não está pronto.', true);
      return;
    }

    generating = true;
    if(typeof toast === 'function') toast('Gerando link, aguarde...⏳');

    try {
      var reportData = buildReportData(modules);
      var html = gerarHTMLMobile(reportData, title);
      html = enhanceMobileHtml(html, modules, version);

      var firebase = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
      var id = 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      await firebase.setDoc(firebase.doc(firebase.getFirestore(), 'relatorios', id), {
        html: html,
        titulo: title,
        tipo: 'Visão Geral atual',
        versao: version,
        revisao: 'todas',
        modulo: moduleFilter,
        gerador: VERSION,
        criadoEm: new Date().toISOString()
      });

      var link = location.origin + '/relatorio?id=' + id;
      var input = document.getElementById('link-gerado');
      if(input) input.value = link;
      var lastWeek = typeof detectarUltimaSemana === 'function' ? detectarUltimaSemana(modules) : [];
      window._ultimaSemana = lastWeek;
      window._tipoRelatorioAtual = 'Visão Geral atual';
      var preview = document.getElementById('whats-preview');
      if(preview && typeof montarMensagemWhats === 'function'){
        preview.textContent = montarMensagemWhats(link, lastWeek, window._tipoRelatorioAtual);
      }
      var modal = document.getElementById('modal-link');
      if(modal) modal.style.display = 'flex';
      if(typeof registrarAlteracaoIV === 'function'){
        registrarAlteracaoIV('relatorio', 'Gerou relatório', 'Visão Geral atual', moduleFilter + ' · todas as revisões');
      }
      if(typeof toast === 'function') toast('Link gerado! ✓');
      return link;
    } catch(error){
      console.error('Erro no gerador definitivo da Visão Geral:', error);
      if(typeof toast === 'function') toast('Erro ao gerar a Visão Geral.', true);
      throw error;
    } finally {
      generating = false;
    }
  }

  function isGeneralViewTrigger(target){
    if(!target || !target.closest) return false;
    var trigger = target.closest('#page-exportar .report-generate-btn, #page-exportar [onclick*="gerarRelatorioLink"]');
    if(!trigger) return false;
    var type = (document.getElementById('exp-tipo') || {}).value || 'visao';
    return type === 'visao';
  }

  document.addEventListener('click', function(event){
    if(!isGeneralViewTrigger(event.target)) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    generateGeneralView();
  }, true);

  window.IVGenerateGeneralView = generateGeneralView;
})();
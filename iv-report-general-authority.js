// IV - autoridade final da Visão Geral: layout móvel responsivo, proporções Web e Revisões por equipe
(function(){
  'use strict';

  if(window.__IV_GENERAL_REPORT_AUTHORITY_V2__) return;
  window.__IV_GENERAL_REPORT_AUTHORITY_V2__ = true;

  var VERSION = 'general-mobile-authority-v2';
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

  function moduleData(moduleNumber){
    try { return MODULOS[moduleNumber] || null; }
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
    if(!key || key === '__none__') return 'SEM REVISÃO';
    var parts = String(key).split('-');
    var month = MONTHS[parseInt(parts[1], 10) - 1] || parts[1];
    return 'REVISÃO - ' + String(month).toUpperCase() + ' | ' + parts[0];
  }

  function teamName(student){
    var data = database();
    var team = data && (data.equipes || []).find(function(item){
      return String(item.id) === String(student.equipeId);
    });
    return team ? team.nome : 'Sem equipe';
  }

  function presenceValue(studentId, moduleNumber, weekIndex, lesson){
    var data = database();
    if(!data || !data.presencas) return false;
    try { return !!data.presencas[presKey(studentId, moduleNumber, weekIndex, lesson)]; }
    catch(error){ return false; }
  }

  function weekStarted(moduleNumber, weekIndex){
    try {
      if(typeof semanaIniciada === 'function') return !!semanaIniciada(moduleNumber, weekIndex);
    } catch(error){}

    var data = database();
    var module = moduleData(moduleNumber);
    var week = module && module.semanas && module.semanas[weekIndex];
    if(!data || !week) return false;
    return (data.alunos || []).some(function(student){
      return (week.aulas || []).some(function(lesson){
        return presenceValue(student.id, moduleNumber, weekIndex, lesson);
      });
    });
  }

  function lessonOccurred(moduleNumber, weekIndex, lesson){
    var data = database();
    if(!data) return false;
    return (data.alunos || []).some(function(student){
      return presenceValue(student.id, moduleNumber, weekIndex, lesson);
    });
  }

  function registrationPoint(moduleNumber){
    var module = moduleData(moduleNumber);
    if(!module || !(module.semanas || []).length) return {week:0, lesson:0};

    var latestWeek = -1;
    (module.semanas || []).forEach(function(week, weekIndex){
      if(weekStarted(moduleNumber, weekIndex)) latestWeek = weekIndex;
    });
    if(latestWeek < 0) return {week:0, lesson:0};

    var lessons = module.semanas[latestWeek].aulas || [];
    var lastOccurred = -1;
    lessons.forEach(function(lesson, lessonIndex){
      if(lessonOccurred(moduleNumber, latestWeek, lesson)) lastOccurred = lessonIndex;
    });
    return {week:latestWeek, lesson:Math.min(lastOccurred + 1, lessons.length)};
  }

  function earliestOwnPresencePoint(student, moduleNumber){
    var module = moduleData(moduleNumber);
    if(!module) return null;
    for(var weekIndex = 0; weekIndex < (module.semanas || []).length; weekIndex += 1){
      var lessons = module.semanas[weekIndex].aulas || [];
      for(var lessonIndex = 0; lessonIndex < lessons.length; lessonIndex += 1){
        if(presenceValue(student.id, moduleNumber, weekIndex, lessons[lessonIndex])){
          return {week:weekIndex, lesson:0};
        }
      }
    }
    return null;
  }

  function attendanceMemory(student){
    if(!student._ivAttendanceStart || typeof student._ivAttendanceStart !== 'object'){
      student._ivAttendanceStart = {};
    }
    return student._ivAttendanceStart;
  }

  function setAttendanceStart(student, moduleNumber, point, createdAt){
    if(!student) return false;
    var memory = attendanceMemory(student);
    var key = String(moduleNumber);
    var normalized = {
      week: Math.max(0, parseInt(point && point.week, 10) || 0),
      lesson: Math.max(0, parseInt(point && point.lesson, 10) || 0),
      createdAt: createdAt || new Date().toISOString()
    };
    var previous = memory[key];
    if(previous && Number(previous.week) === normalized.week && Number(previous.lesson) === normalized.lesson) return false;
    memory[key] = normalized;
    if(!student.criadoEm) student.criadoEm = normalized.createdAt;
    return true;
  }

  function ensureAttendanceStart(student, moduleNumber){
    var memory = attendanceMemory(student);
    var key = String(moduleNumber);
    var saved = memory[key];
    if(saved && Number.isFinite(Number(saved.week)) && Number.isFinite(Number(saved.lesson))){
      return {week:Math.max(0, Number(saved.week)), lesson:Math.max(0, Number(saved.lesson))};
    }

    // Dados antigos não possuíam data de cadastro. A primeira presença registrada é usada
    // como referência; sem histórico individual, o ponto atual evita faltas retroativas.
    var inferred = earliestOwnPresencePoint(student, moduleNumber) || registrationPoint(moduleNumber);
    setAttendanceStart(student, moduleNumber, inferred, student.criadoEm || new Date().toISOString());
    return inferred;
  }

  function attendance(student, moduleNumber){
    var module = moduleData(moduleNumber);
    if(!module) return {absence:0, countedLessons:0};

    var start = ensureAttendanceStart(student, moduleNumber);
    var countedLessons = 0;
    var present = 0;

    (module.semanas || []).forEach(function(week, weekIndex){
      var ownPresence = (week.aulas || []).some(function(lesson){
        return presenceValue(student.id, moduleNumber, weekIndex, lesson);
      });
      if(!weekStarted(moduleNumber, weekIndex) && !ownPresence) return;
      if(weekIndex < start.week) return;

      var firstLesson = weekIndex === start.week ? start.lesson : 0;
      (week.aulas || []).forEach(function(lesson, lessonIndex){
        if(lessonIndex < firstLesson) return;
        countedLessons += 1;
        if(presenceValue(student.id, moduleNumber, weekIndex, lesson)) present += 1;
      });
    });

    return {absence:Math.max(countedLessons - present, 0), countedLessons:countedLessons};
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
      return {key:key,label:reviewLabel(key),students:groups[key]};
    });
  }

  function teamGroups(students){
    var result = {};
    students.forEach(function(student){
      var name = teamName(student);
      if(!result[name]) result[name] = [];
      result[name].push(student);
    });
    return Object.keys(result).sort(function(a,b){
      if(a === 'Sem equipe') return 1;
      if(b === 'Sem equipe') return -1;
      return a.localeCompare(b, 'pt-BR');
    }).map(function(name){
      return {
        name:name,
        students:result[name].slice().sort(function(a,b){
          return String(a.nome || '').localeCompare(String(b.nome || ''), 'pt-BR');
        })
      };
    });
  }

  function studentRows(students, moduleNumber){
    return students.map(function(student){
      var stats = attendance(student, moduleNumber);
      return '<div class="iv-review-student">' +
        '<span class="iv-review-student-name">'+esc(student.nome || 'Sem nome')+'</span>' +
        '<span class="iv-review-absence">'+stats.absence+' falta'+(stats.absence === 1 ? '' : 's')+'</span>' +
      '</div>';
    }).join('');
  }

  function reviewPanel(group, moduleNumber, moduleIndex, reviewIndex){
    var teams = teamGroups(group.students);
    var teamsHtml = teams.map(function(team, teamIndex){
      return '<details class="iv-review-team" '+(teamIndex === 0 ? 'open' : '')+'>' +
        '<summary><span>'+esc(team.name)+'</span><b>'+team.students.length+' aluno'+(team.students.length === 1 ? '' : 's')+'</b><i>⌄</i></summary>' +
        '<div class="iv-review-team-body">'+studentRows(team.students, moduleNumber)+'</div>' +
      '</details>';
    }).join('') || '<div class="iv-review-empty">Nenhum aluno nesta Revisão.</div>';

    return '<div class="iv-review-panel" data-iv-review-panel="'+moduleIndex+'" id="iv-rev-panel-'+moduleIndex+'-'+reviewIndex+'" style="display:'+(reviewIndex === 0 ? 'block' : 'none')+'">' +
      '<div class="iv-review-heading"><div><strong>'+esc(group.label)+'</strong><span>Equipes e faltas registradas por aluno</span></div><b>'+group.students.length+' aluno'+(group.students.length === 1 ? '' : 's')+'</b></div>' +
      '<div class="iv-review-teams">'+teamsHtml+'</div>' +
    '</div>';
  }

  function reviewSection(moduleNumber, moduleIndex){
    var groups = reviewGroups(moduleNumber);
    if(!groups.length) return '';

    var tabs = groups.map(function(group, reviewIndex){
      return '<button type="button" onclick="ivShowReview('+moduleIndex+','+reviewIndex+',this)" data-iv-review-tab="'+moduleIndex+'" class="iv-review-tab '+(reviewIndex === 0 ? 'active' : '')+'">'+esc(group.label)+'</button>';
    }).join('');

    var panels = groups.map(function(group, reviewIndex){
      return reviewPanel(group, moduleNumber, moduleIndex, reviewIndex);
    }).join('');

    return '<section data-iv-review-section class="iv-review-section">' +
      '<div class="iv-review-section-title">◈ Informações por Revisão</div>' +
      '<div class="iv-review-card"><div class="iv-review-tabs">'+tabs+'</div>'+panels+'</div>' +
    '</section>';
  }

  function reportStyles(version){
    var web = version === 'web';
    return '' +
      '.iv-review-section{padding:0 13px 7px}.iv-review-section-title{font-size:14px;font-weight:800;color:#7EC8F0;margin:20px 0 10px;padding-bottom:8px;border-bottom:1px solid #1E2E4A}.iv-review-card{background:#0D1626;border:1px solid #1E2E4A;border-radius:13px;padding:12px;margin-bottom:15px}.iv-review-tabs{display:flex;gap:7px;overflow-x:auto;padding-bottom:11px;scrollbar-width:none}.iv-review-tabs::-webkit-scrollbar{display:none}.iv-review-tab{flex:0 0 auto;padding:7px 11px;border:1px solid rgba(126,200,240,.16);border-radius:999px;background:rgba(255,255,255,.055);color:#8FAACB;font-size:9px;font-weight:900;cursor:pointer;white-space:nowrap}.iv-review-tab.active{background:#4A90D9;color:#fff}.iv-review-heading{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;padding:5px 1px 11px}.iv-review-heading strong{display:block;color:#EAF4FF;font-size:13px}.iv-review-heading span{display:block;color:#6B8AB0;font-size:9px;margin-top:3px}.iv-review-heading>b{padding:5px 9px;border-radius:999px;background:rgba(126,200,240,.09);color:#BFEAFF;font-size:9px;white-space:nowrap}.iv-review-teams{display:grid;grid-template-columns:1fr;gap:8px}.iv-review-team{border:1px solid rgba(126,200,240,.12);border-radius:12px;background:rgba(255,255,255,.018);overflow:hidden}.iv-review-team>summary{list-style:none;display:grid;grid-template-columns:minmax(0,1fr) auto 18px;align-items:center;gap:8px;padding:11px 12px;cursor:pointer}.iv-review-team>summary::-webkit-details-marker{display:none}.iv-review-team>summary span{font-size:11px;font-weight:900;color:#DDEEFF;overflow-wrap:anywhere}.iv-review-team>summary b{font-size:9px;color:#7EC8F0;white-space:nowrap}.iv-review-team>summary i{font-style:normal;color:#7EC8F0;transition:transform .2s}.iv-review-team[open]>summary i{transform:rotate(180deg)}.iv-review-team-body{padding:0 12px 7px;border-top:1px solid rgba(126,200,240,.08)}.iv-review-student{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:9px 0;border-bottom:1px solid rgba(30,46,74,.38)}.iv-review-student:last-child{border-bottom:0}.iv-review-student-name{font-size:11px;font-weight:800;color:#E8F0FF;overflow-wrap:anywhere}.iv-review-absence{flex:0 0 auto;padding:4px 8px;border-radius:999px;background:rgba(224,85,85,.12);color:#F08080;font-size:9px;font-weight:900}.iv-review-empty{padding:18px;text-align:center;color:#6B8AB0;font-size:11px}' +
      (web ? 'body.iv-report-web{padding:32px 0!important}body.iv-report-web>.header,body.iv-report-web>.top-nav,body.iv-report-web>#modulos{width:min(1180px,calc(100% - 64px))!important;margin-left:auto!important;margin-right:auto!important}body.iv-report-web>.header{padding:28px 32px 24px!important;border-radius:26px 26px 0 0}body.iv-report-web .report-logo{width:64px!important;min-width:64px!important;max-width:64px!important}body.iv-report-web .header h1{font-size:30px!important}body.iv-report-web .hbadge{font-size:11px!important;padding:7px 14px!important}body.iv-report-web .hsub{font-size:13px!important}body.iv-report-web>.top-nav button{padding:15px 10px!important;font-size:13px!important}body.iv-report-web>#modulos{border-radius:0 0 26px 26px;overflow:hidden;box-shadow:0 32px 90px rgba(0,0,0,.42)}body.iv-report-web #modulos [style*="padding:14px 13px 4px"]{padding:22px 26px 8px!important}body.iv-report-web #modulos [style*="padding:0 13px 36px"]{padding:0 26px 50px!important}body.iv-report-web .iv-review-section{padding:0 26px 12px}body.iv-report-web .iv-review-section-title{font-size:18px;margin-top:28px}body.iv-report-web .iv-review-card{padding:18px;border-radius:17px}body.iv-report-web .iv-review-tab{padding:9px 14px;font-size:11px}body.iv-report-web .iv-review-heading strong{font-size:17px}body.iv-report-web .iv-review-heading span{font-size:11px}body.iv-report-web .iv-review-heading>b{font-size:11px;padding:7px 11px}body.iv-report-web .iv-review-team>summary{padding:15px 16px}body.iv-report-web .iv-review-team>summary span{font-size:14px}body.iv-report-web .iv-review-team>summary b{font-size:11px}body.iv-report-web .iv-review-team-body{padding:0 16px 9px}body.iv-report-web .iv-review-student{padding:12px 0}body.iv-report-web .iv-review-student-name{font-size:13px}body.iv-report-web .iv-review-absence{font-size:11px;padding:5px 10px}' : '') +
      '@media(max-width:820px){body.iv-report-web{padding:0!important}body.iv-report-web>.header,body.iv-report-web>.top-nav,body.iv-report-web>#modulos{width:100%!important;border-radius:0!important}body.iv-report-web .header{padding:18px 16px 16px!important}body.iv-report-web .report-logo{width:48px!important;min-width:48px!important;max-width:48px!important}body.iv-report-web .header h1{font-size:19px!important}body.iv-report-web #modulos [style*="padding:14px 13px 4px"]{padding:14px 13px 4px!important}body.iv-report-web #modulos [style*="padding:0 13px 36px"]{padding:0 13px 36px!important}body.iv-report-web .iv-review-section{padding:0 13px 7px}}';
  }

  function enhanceMobileHtml(html, modules, version){
    var parser = new DOMParser();
    var documentReport = parser.parseFromString(html, 'text/html');
    documentReport.body.classList.add(version === 'web' ? 'iv-report-web' : 'iv-report-mobile');

    modules.forEach(function(moduleNumber, moduleIndex){
      var modulePanel = documentReport.getElementById('mod-' + moduleIndex);
      if(!modulePanel) return;
      var holder = documentReport.createElement('div');
      holder.innerHTML = reviewSection(moduleNumber, moduleIndex);
      if(holder.firstElementChild){
        var weeks = documentReport.getElementById('sems-' + moduleIndex);
        if(weeks && weeks.nextSibling) modulePanel.insertBefore(holder.firstElementChild, weeks.nextSibling);
        else modulePanel.appendChild(holder.firstElementChild);
      }
    });

    var style = documentReport.createElement('style');
    style.id = 'iv-general-authority-style';
    style.textContent = reportStyles(version);
    documentReport.head.appendChild(style);

    var badge = documentReport.querySelector('.hbadge');
    if(badge) badge.textContent = version === 'web' ? '📋 Relatório Web' : '📋 Relatório Mobile';

    var script = documentReport.createElement('script');
    script.textContent = 'function ivShowReview(mi,ri,btn){document.querySelectorAll("[data-iv-review-panel=\\\""+mi+"\\\"]").forEach(function(p){p.style.display="none"});var panel=document.getElementById("iv-rev-panel-"+mi+"-"+ri);if(panel)panel.style.display="block";document.querySelectorAll("[data-iv-review-tab=\\\""+mi+"\\\"]").forEach(function(b){b.classList.remove("active")});if(btn)btn.classList.add("active")}';
    documentReport.body.appendChild(script);

    return '<!DOCTYPE html>\n' + documentReport.documentElement.outerHTML;
  }

  function selectedVersion(){
    if(typeof window.IVReportSelectedVersion === 'function') return window.IVReportSelectedVersion();
    var webButton = document.getElementById('tab-web');
    return webButton && webButton.classList.contains('active') ? 'web' : 'mobile';
  }

  function newStudentIds(beforeIds){
    var data = database();
    if(!data) return [];
    return (data.alunos || []).filter(function(student){
      return !beforeIds[String(student.id)];
    });
  }

  function markNewStudents(beforeIds, moduleHint){
    var changed = false;
    newStudentIds(beforeIds).forEach(function(student){
      var moduleNumber = parseInt(student.modulo || moduleHint || 1, 10);
      changed = setAttendanceStart(student, moduleNumber, registrationPoint(moduleNumber), new Date().toISOString()) || changed;
    });
    if(changed && typeof saveDB === 'function') saveDB();
  }

  function wrapCreationFunction(name){
    var original = window[name];
    if(typeof original !== 'function' || original._ivAttendanceBaseline) return;
    var wrapped = function(){
      var data = database();
      var beforeIds = {};
      (data && data.alunos || []).forEach(function(student){ beforeIds[String(student.id)] = true; });
      var result = original.apply(this, arguments);
      window.setTimeout(function(){ markNewStudents(beforeIds); }, 70);
      window.setTimeout(function(){ markNewStudents(beforeIds); }, 220);
      return result;
    };
    wrapped._ivAttendanceBaseline = true;
    window[name] = wrapped;
  }

  function wrapAdvanceFunction(){
    var original = window.confirmarAvancar;
    if(typeof original !== 'function' || original._ivAttendanceBaseline) return;
    var wrapped = function(){
      var data = database();
      var origin = (document.getElementById('avancar-origem') || {}).value || '1';
      var destination = String(parseInt(origin, 10) + 1);
      var ids = (data && data.alunos || []).filter(function(student){
        return String(student.modulo || '1') === String(origin) && String(student.situacao || 'ATIVO').toUpperCase() === 'ATIVO';
      }).map(function(student){ return String(student.id); });
      var result = original.apply(this, arguments);
      window.setTimeout(function(){
        var current = database();
        var changed = false;
        (current && current.alunos || []).forEach(function(student){
          if(ids.indexOf(String(student.id)) >= 0 && String(student.modulo || '') === destination){
            changed = setAttendanceStart(student, parseInt(destination, 10), registrationPoint(parseInt(destination, 10)), new Date().toISOString()) || changed;
          }
        });
        if(changed && typeof saveDB === 'function') saveDB();
      }, 100);
      return result;
    };
    wrapped._ivAttendanceBaseline = true;
    window.confirmarAvancar = wrapped;
  }

  function installAttendanceHooks(){
    wrapCreationFunction('salvarAluno');
    wrapCreationFunction('importarAlunos');
    wrapAdvanceFunction();
  }

  function backfillAttendanceMemory(modules){
    var data = database();
    if(!data) return;
    var allowed = {};
    modules.forEach(function(moduleNumber){ allowed[String(moduleNumber)] = true; });
    var changed = false;
    (data.alunos || []).forEach(function(student){
      var moduleNumber = parseInt(student.modulo || 1, 10);
      if(!allowed[String(moduleNumber)]) return;
      var memory = attendanceMemory(student);
      if(!memory[String(moduleNumber)]){
        ensureAttendanceStart(student, moduleNumber);
        changed = true;
      }
    });
    if(changed && typeof saveDB === 'function') saveDB();
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
      backfillAttendanceMemory(modules);
      var reportData = buildReportData(modules);
      var html = gerarHTMLMobile(reportData, title);
      html = enhanceMobileHtml(html, modules, version);

      var firebase = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
      var id = 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      await firebase.setDoc(firebase.doc(firebase.getFirestore(), 'relatorios', id), {
        html:html,
        titulo:title,
        tipo:'Visão Geral atual',
        versao:version,
        revisao:'todas',
        modulo:moduleFilter,
        gerador:VERSION,
        criadoEm:new Date().toISOString()
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

  installAttendanceHooks();
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installAttendanceHooks, {once:true});
  [500,1400,2600].forEach(function(delay){ window.setTimeout(installAttendanceHooks, delay); });

  window.IVGenerateGeneralView = generateGeneralView;
})();
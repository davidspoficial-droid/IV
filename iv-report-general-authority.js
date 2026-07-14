// IV - autoridade final da Visão Geral: abas principais por Revisão e equipes premium
(function(){
  'use strict';

  if(window.__IV_GENERAL_REPORT_AUTHORITY_V3__) return;
  window.__IV_GENERAL_REPORT_AUTHORITY_V3__ = true;

  var VERSION = 'general-review-tabs-v3';
  var MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  var TEAM_COLORS = ['#4A90D9','#3EC97A','#A85AC7','#F38A1F','#EF5361','#22B8CF','#F2C94C','#8B7CF6','#2EC4B6','#FF7A90'];
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
        var keyFromCore = window.IVReview.key(student);
        if(keyFromCore) return String(keyFromCore);
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
    if(!key || key === '__none__') return 'Sem revisão';
    var parts = String(key).split('-');
    var month = MONTHS[parseInt(parts[1], 10) - 1] || parts[1];
    return 'Revisão - ' + month + ' | ' + parts[0];
  }

  function teamName(student){
    var data = database();
    var team = data && (data.equipes || []).find(function(item){
      return String(item.id) === String(student.equipeId);
    });
    return team ? String(team.nome || 'Sem equipe') : 'Sem equipe';
  }

  function turmaLabel(value){
    if(value === 'quinta') return {text:'Qui', full:'Quinta-feira', className:'quinta'};
    if(value === 'sabado') return {text:'Sáb', full:'Sábado', className:'sabado'};
    return {text:'Sem turma', full:'Sem turma', className:'sem-turma'};
  }

  function presenceValue(studentId, moduleNumber, weekIndex, lesson){
    var data = database();
    if(!data || !data.presencas) return false;
    try { return !!data.presencas[presKey(studentId, moduleNumber, weekIndex, lesson)]; }
    catch(error){ return false; }
  }

  function latestStartedWeek(moduleNumber){
    var data = database();
    var module = moduleData(moduleNumber);
    if(!data || !module) return -1;

    var students = (data.alunos || []).filter(function(student){
      return String(student.modulo || '1') === String(moduleNumber);
    });
    var latest = -1;

    (module.semanas || []).forEach(function(week, weekIndex){
      var started = students.some(function(student){
        return (week.aulas || []).some(function(lesson){
          return presenceValue(student.id, moduleNumber, weekIndex, lesson);
        });
      });
      if(started) latest = weekIndex;
    });
    return latest;
  }

  function isPresentInCurrentWeek(student, latestWeeks){
    var moduleNumber = parseInt(student.modulo || 1, 10);
    var weekIndex = latestWeeks[String(moduleNumber)];
    var module = moduleData(moduleNumber);
    if(!module || weekIndex == null || weekIndex < 0 || !module.semanas[weekIndex]) return false;
    return (module.semanas[weekIndex].aulas || []).some(function(lesson){
      return presenceValue(student.id, moduleNumber, weekIndex, lesson);
    });
  }

  function revisionGroups(modules){
    var data = database();
    if(!data) return [];

    var allowed = {};
    var latestWeeks = {};
    modules.forEach(function(moduleNumber){
      allowed[String(moduleNumber)] = true;
      latestWeeks[String(moduleNumber)] = latestStartedWeek(moduleNumber);
    });

    var groups = {};
    (data.alunos || []).filter(function(student){
      return allowed[String(student.modulo || '1')];
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
      var allStudents = groups[key];
      return {
        key:key,
        label:reviewLabel(key),
        allStudents:allStudents,
        presentStudents:allStudents.filter(function(student){
          return isPresentInCurrentWeek(student, latestWeeks);
        })
      };
    });
  }

  function teamGroups(students){
    var groups = {};
    students.forEach(function(student){
      var name = teamName(student);
      if(!groups[name]) groups[name] = [];
      groups[name].push(student);
    });

    return Object.keys(groups).map(function(name){
      return {
        name:name,
        students:groups[name].slice().sort(function(a,b){
          return String(a.nome || '').localeCompare(String(b.nome || ''), 'pt-BR');
        })
      };
    }).sort(function(a,b){
      if(a.name === 'Sem equipe') return 1;
      if(b.name === 'Sem equipe') return -1;
      return b.students.length - a.students.length || a.name.localeCompare(b.name, 'pt-BR');
    });
  }

  function studentRows(students, color){
    return students.map(function(student){
      var turma = turmaLabel(student.turma);
      return '<div class="iv-present-student">' +
        '<span class="iv-present-dot" style="background:'+color+'"></span>' +
        '<span class="iv-present-name">'+esc(student.nome || 'Sem nome')+'</span>' +
        '<span class="iv-turma-badge '+turma.className+'" title="'+esc(turma.full)+'">'+esc(turma.text)+'</span>' +
      '</div>';
    }).join('');
  }

  function teamCard(team, index, maxCount){
    var color = TEAM_COLORS[index % TEAM_COLORS.length];
    var count = team.students.length;
    var width = maxCount ? Math.max(7, Math.round(count / maxCount * 100)) : 7;
    return '<details class="iv-premium-team" style="--team-color:'+color+'" '+(index === 0 ? 'open' : '')+'>' +
      '<summary>' +
        '<span class="iv-team-rank">'+(index + 1)+'</span>' +
        '<span class="iv-team-center"><strong>'+esc(team.name)+'</strong><span class="iv-team-bar"><i style="width:'+width+'%"></i></span></span>' +
        '<span class="iv-team-count"><b>'+count+'</b><small>aluno'+(count === 1 ? '' : 's')+'</small></span>' +
        '<span class="iv-team-arrow">▼</span>' +
      '</summary>' +
      '<div class="iv-team-body"><div class="iv-present-title">Alunos presentes</div>'+studentRows(team.students, color)+'</div>' +
    '</details>';
  }

  function revisionPanel(group, index){
    var teams = teamGroups(group.presentStudents);
    var maxCount = teams.length ? teams[0].students.length : 0;
    var teamsHtml = teams.map(function(team, teamIndex){
      return teamCard(team, teamIndex, maxCount);
    }).join('');

    if(!teamsHtml){
      teamsHtml = '<div class="iv-review-empty">Nenhum aluno presente na última semana registrada desta Revisão.</div>';
    }

    return '<section class="iv-main-review-panel" id="iv-main-review-'+index+'" style="display:'+(index === 0 ? 'block' : 'none')+'">' +
      '<div class="iv-review-panel-heading"><div><strong>'+esc(group.label)+'</strong><span>Equipes e alunos presentes</span></div><b>'+group.presentStudents.length+' presente'+(group.presentStudents.length === 1 ? '' : 's')+'</b></div>' +
      '<div class="iv-premium-team-list">'+teamsHtml+'</div>' +
    '</section>';
  }

  function revisionTabs(groups){
    return groups.map(function(group, index){
      return '<button type="button" class="iv-main-review-tab '+(index === 0 ? 'active' : '')+'" onclick="ivShowMainReview('+index+',this)"><span>'+esc(group.label)+'</span><small>'+group.presentStudents.length+'</small></button>';
    }).join('');
  }

  function reportStyles(version){
    var web = version === 'web';
    return '' +
      '.iv-revision-main-tabs{display:flex!important;overflow-x:auto!important;background:rgba(7,17,31,.9)!important;border-bottom:1px solid rgba(126,200,240,.16)!important;scrollbar-width:none}.iv-revision-main-tabs::-webkit-scrollbar{display:none}.iv-main-review-tab{flex:1 0 190px;min-height:70px;padding:12px 14px;border:0;border-bottom:3px solid transparent;background:transparent;color:#7892B4;cursor:pointer;font-family:inherit}.iv-main-review-tab span{display:block;font-size:11px;font-weight:900;white-space:nowrap}.iv-main-review-tab small{display:inline-flex;margin-top:5px;min-width:22px;height:18px;padding:0 6px;align-items:center;justify-content:center;border-radius:999px;background:rgba(126,200,240,.08);font-size:9px;font-weight:900}.iv-main-review-tab.active{color:#F2F8FF;border-bottom-color:#4A90D9;background:linear-gradient(180deg,rgba(74,144,217,.12),transparent)}.iv-main-review-tab.active small{background:rgba(74,144,217,.24);color:#BFEAFF}.iv-revision-root{padding:14px 13px 38px}.iv-review-panel-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin:5px 0 15px;padding:0 1px 12px;border-bottom:1px solid rgba(126,200,240,.14)}.iv-review-panel-heading strong{display:block;font-size:17px;font-weight:950;color:#F2F8FF}.iv-review-panel-heading span{display:block;margin-top:4px;color:#7892B4;font-size:10px}.iv-review-panel-heading>b{flex:0 0 auto;padding:6px 10px;border-radius:999px;background:rgba(74,144,217,.12);color:#7EC8F0;font-size:10px}.iv-premium-team-list{display:grid;grid-template-columns:1fr;gap:10px}.iv-premium-team{border:1px solid rgba(126,200,240,.15);border-radius:15px;background:#0B1628;overflow:hidden;box-shadow:0 12px 28px rgba(0,0,0,.20)}.iv-premium-team>summary{list-style:none;display:grid;grid-template-columns:36px minmax(0,1fr) 52px 20px;gap:11px;align-items:center;min-height:76px;padding:13px 15px;cursor:pointer}.iv-premium-team>summary::-webkit-details-marker{display:none}.iv-team-rank{width:35px;height:35px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--team-color);color:#fff;font-size:13px;font-weight:950;box-shadow:0 8px 18px rgba(0,0,0,.24)}.iv-team-center{display:block;min-width:0}.iv-team-center>strong{display:block;color:#EEF5FF;font-size:13px;font-weight:900;line-height:1.2;overflow-wrap:anywhere}.iv-team-bar{display:block;height:5px;margin-top:9px;border-radius:999px;background:#213452;overflow:hidden}.iv-team-bar>i{display:block;height:100%;border-radius:999px;background:var(--team-color)}.iv-team-count{text-align:right}.iv-team-count>b{display:block;color:var(--team-color);font-size:25px;font-weight:950;line-height:1}.iv-team-count>small{display:block;margin-top:3px;color:#7C96B8;font-size:8px}.iv-team-arrow{color:#7892B4;font-size:12px;transition:transform .2s}.iv-premium-team[open] .iv-team-arrow{transform:rotate(180deg)}.iv-team-body{padding:0 15px 13px;border-top:1px solid rgba(126,200,240,.08)}.iv-present-title{padding:11px 0 6px;color:#7892B4;font-size:9px;font-weight:950;letter-spacing:.14em;text-transform:uppercase}.iv-present-student{display:grid;grid-template-columns:6px minmax(0,1fr) auto;gap:8px;align-items:center;min-height:31px;border-bottom:1px solid rgba(126,200,240,.07)}.iv-present-student:last-child{border-bottom:0}.iv-present-dot{width:6px;height:6px;border-radius:50%}.iv-present-name{color:#E8F0FF;font-size:11px;overflow-wrap:anywhere}.iv-turma-badge{padding:2px 7px;border-radius:999px;font-size:8px;font-weight:900}.iv-turma-badge.quinta{background:rgba(74,144,217,.18);color:#7EC8F0}.iv-turma-badge.sabado{background:rgba(155,89,182,.18);color:#D4A7EA}.iv-turma-badge.sem-turma{background:rgba(255,255,255,.06);color:#7892B4}.iv-review-empty{padding:38px 18px;text-align:center;border:1px dashed rgba(126,200,240,.16);border-radius:14px;color:#7892B4;font-size:12px}' +
      (web ? 'body.iv-report-web{padding:32px 0!important}body.iv-report-web>.header,body.iv-report-web>.top-nav,body.iv-report-web>#modulos{width:min(1180px,calc(100% - 64px))!important;margin-left:auto!important;margin-right:auto!important}body.iv-report-web>.header{padding:28px 32px 24px!important;border-radius:26px 26px 0 0}body.iv-report-web .report-logo{width:64px!important;min-width:64px!important;max-width:64px!important}body.iv-report-web .header h1{font-size:30px!important}body.iv-report-web .hbadge{font-size:11px!important;padding:7px 14px!important}body.iv-report-web .hsub{font-size:13px!important}body.iv-report-web>.top-nav{border-radius:0}body.iv-report-web .iv-main-review-tab{flex-basis:240px;min-height:92px;padding:17px 20px}body.iv-report-web .iv-main-review-tab span{font-size:14px}body.iv-report-web .iv-main-review-tab small{height:22px;min-width:28px;font-size:10px}body.iv-report-web>#modulos{border-radius:0 0 26px 26px;overflow:hidden;box-shadow:0 32px 90px rgba(0,0,0,.42)}body.iv-report-web .iv-revision-root{padding:25px 30px 52px}body.iv-report-web .iv-review-panel-heading strong{font-size:22px}body.iv-report-web .iv-review-panel-heading span{font-size:12px}body.iv-report-web .iv-review-panel-heading>b{font-size:12px;padding:8px 13px}body.iv-report-web .iv-premium-team-list{gap:12px}body.iv-report-web .iv-premium-team>summary{grid-template-columns:42px minmax(0,1fr) 70px 24px;min-height:92px;padding:17px 20px;gap:14px}body.iv-report-web .iv-team-rank{width:40px;height:40px;font-size:15px}body.iv-report-web .iv-team-center>strong{font-size:16px}body.iv-report-web .iv-team-bar{height:6px;margin-top:11px}body.iv-report-web .iv-team-count>b{font-size:31px}body.iv-report-web .iv-team-count>small{font-size:9px}body.iv-report-web .iv-team-body{padding:0 20px 16px}body.iv-report-web .iv-present-title{font-size:10px;padding-top:14px}body.iv-report-web .iv-present-student{min-height:39px}body.iv-report-web .iv-present-name{font-size:13px}body.iv-report-web .iv-turma-badge{font-size:9px;padding:3px 8px}' : '') +
      '@media(max-width:820px){body.iv-report-web{padding:0!important}body.iv-report-web>.header,body.iv-report-web>.top-nav,body.iv-report-web>#modulos{width:100%!important;border-radius:0!important}body.iv-report-web .header{padding:18px 16px 16px!important}body.iv-report-web .report-logo{width:48px!important;min-width:48px!important;max-width:48px!important}body.iv-report-web .header h1{font-size:19px!important}.iv-main-review-tab{flex-basis:165px}.iv-review-panel-heading{align-items:center}.iv-review-panel-heading strong{font-size:15px}.iv-premium-team>summary{grid-template-columns:34px minmax(0,1fr) 48px 18px;padding:12px 11px;gap:9px}.iv-team-rank{width:33px;height:33px}.iv-team-center>strong{font-size:12px}.iv-team-count>b{font-size:23px}}';
  }

  function enhanceMobileHtml(html, modules, version){
    var parser = new DOMParser();
    var report = parser.parseFromString(html, 'text/html');
    report.body.classList.add(version === 'web' ? 'iv-report-web' : 'iv-report-mobile');

    var groups = revisionGroups(modules);
    var nav = report.querySelector('.top-nav');
    var root = report.getElementById('modulos');

    if(nav){
      nav.classList.add('iv-revision-main-tabs');
      nav.innerHTML = groups.length ? revisionTabs(groups) : '<div class="iv-review-empty" style="width:100%">Nenhuma Revisão cadastrada.</div>';
    }

    if(root){
      root.className = 'iv-revision-root';
      root.innerHTML = groups.map(function(group, index){ return revisionPanel(group, index); }).join('') || '<div class="iv-review-empty">Nenhuma Revisão cadastrada.</div>';
    }

    var style = report.createElement('style');
    style.id = 'iv-general-authority-style';
    style.textContent = reportStyles(version);
    report.head.appendChild(style);

    var badge = report.querySelector('.hbadge');
    if(badge) badge.textContent = version === 'web' ? '📋 Relatório Web' : '📋 Relatório Mobile';

    var script = report.createElement('script');
    script.textContent = 'function ivShowMainReview(index,button){document.querySelectorAll(".iv-main-review-panel").forEach(function(panel){panel.style.display="none"});var panel=document.getElementById("iv-main-review-"+index);if(panel)panel.style.display="block";document.querySelectorAll(".iv-main-review-tab").forEach(function(tab){tab.classList.remove("active")});if(button)button.classList.add("active");try{window.scrollTo(0,0)}catch(error){}}';
    report.body.appendChild(script);

    return '<!DOCTYPE html>\n' + report.documentElement.outerHTML;
  }

  function selectedVersion(){
    if(typeof window.IVReportSelectedVersion === 'function') return window.IVReportSelectedVersion();
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
        html:html,
        titulo:title,
        tipo:'Visão Geral atual',
        versao:version,
        revisao:'abas-principais',
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
        registrarAlteracaoIV('relatorio', 'Gerou relatório', 'Visão Geral atual', moduleFilter + ' · abas por Revisão');
      }
      if(typeof toast === 'function') toast('Link gerado! ✓');
      return link;
    } catch(error){
      console.error('Erro no gerador da Visão Geral por Revisão:', error);
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
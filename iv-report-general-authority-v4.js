// IV - autoridade final da Visão Geral: Revisões, módulos e comparativos completos
(function(){
  'use strict';

  if(window.__IV_GENERAL_REPORT_AUTHORITY_V4__) return;
  window.__IV_GENERAL_REPORT_AUTHORITY_V4__ = true;

  var VERSION = 'general-review-dashboard-v4';
  var MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  var TEAM_COLORS = ['#4A90D9','#3EC97A','#A85AC7','#F38A1F','#EF5361','#22B8CF','#F2C94C','#8B7CF6','#2EC4B6','#FF7A90'];
  var WEEK_COLORS = ['#4A90D9','#3EC97A','#F38A1F','#A85AC7','#EF5361','#22B8CF','#F2C94C','#8B7CF6'];
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

  function moduleColor(moduleNumber){
    var module = moduleData(moduleNumber);
    return module && module.cor ? module.cor : (moduleNumber === 2 ? '#3EC97A' : moduleNumber === 3 ? '#EF5361' : '#4A90D9');
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

  function statusOf(student){
    return String(student && student.situacao || 'ATIVO').toUpperCase();
  }

  function isActive(student){
    return statusOf(student) === 'ATIVO';
  }

  function isQuit(student){
    return statusOf(student) === 'DESISTENTE';
  }

  function teamName(student){
    var data = database();
    var team = data && (data.equipes || []).find(function(item){
      return String(item.id) === String(student.equipeId);
    });
    return team ? String(team.nome || 'Sem equipe') : 'Sem equipe';
  }

  function teamColor(name){
    var hash = 0;
    String(name || '').split('').forEach(function(char){
      hash = ((hash << 5) - hash) + char.charCodeAt(0);
      hash |= 0;
    });
    return TEAM_COLORS[Math.abs(hash) % TEAM_COLORS.length];
  }

  function turmaLabel(value){
    if(value === 'quinta') return {text:'Qui', full:'Quinta-feira', className:'quinta'};
    if(value === 'sabado') return {text:'Sáb', full:'Sábado', className:'sabado'};
    return {text:'Sem turma', full:'Sem turma', className:'sem-turma'};
  }

  function lessonLabel(lesson){
    if(lesson === 'INAU') return 'Aula inaugural';
    if(lesson === 'AP') return 'Apresentação';
    return 'Aula ' + String(lesson).padStart(2, '0');
  }

  function shortWeekLabel(week, index){
    if(index === 0 && String(week.label || '').toLowerCase().indexOf('inaugural') >= 0) return 'Inaugural';
    if(String(week.label || '').toLowerCase().indexOf('apresenta') >= 0) return 'Apresentação';
    return 'Sem ' + String(index + 1).padStart(2, '0');
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
      return String(student.modulo || '1') === String(moduleNumber) &&
        (week.aulas || []).some(function(lesson){
          return presenceValue(student.id, moduleNumber, weekIndex, lesson);
        });
    });
  }

  function startedWeekIndexes(moduleNumber){
    var module = moduleData(moduleNumber);
    if(!module) return [];
    var result = [];
    (module.semanas || []).forEach(function(week, weekIndex){
      if(weekStarted(moduleNumber, weekIndex)) result.push(weekIndex);
    });
    return result;
  }

  function latestStartedWeek(moduleNumber){
    var started = startedWeekIndexes(moduleNumber);
    return started.length ? started[started.length - 1] : 0;
  }

  function presentInWeek(student, moduleNumber, weekIndex){
    var module = moduleData(moduleNumber);
    var week = module && module.semanas && module.semanas[weekIndex];
    if(!week) return false;
    return (week.aulas || []).some(function(lesson){
      return presenceValue(student.id, moduleNumber, weekIndex, lesson);
    });
  }

  function attendanceStats(students){
    var present = 0;
    var possible = 0;

    (students || []).filter(isActive).forEach(function(student){
      var moduleNumber = parseInt(student.modulo || 1, 10);
      var module = moduleData(moduleNumber);
      if(!module) return;
      (module.semanas || []).forEach(function(week, weekIndex){
        if(!weekStarted(moduleNumber, weekIndex)) return;
        (week.aulas || []).forEach(function(lesson){
          possible += 1;
          if(presenceValue(student.id, moduleNumber, weekIndex, lesson)) present += 1;
        });
      });
    });

    return {
      present:present,
      possible:possible,
      pct:possible ? Math.round(present / possible * 100) : 0
    };
  }

  function revisionGroups(modules){
    var data = database();
    if(!data) return [];

    var allowed = {};
    modules.forEach(function(moduleNumber){ allowed[String(moduleNumber)] = true; });

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
      var students = groups[key].slice().sort(function(a,b){
        return String(a.nome || '').localeCompare(String(b.nome || ''), 'pt-BR');
      });
      return {key:key,label:reviewLabel(key),students:students};
    });
  }

  function groupByTeam(students){
    var groups = {};
    (students || []).forEach(function(student){
      var name = teamName(student);
      if(!groups[name]) groups[name] = [];
      groups[name].push(student);
    });

    return Object.keys(groups).map(function(name){
      return {
        name:name,
        color:teamColor(name),
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
    return (students || []).map(function(student){
      var turma = turmaLabel(student.turma);
      return '<div class="iv-present-student">' +
        '<span class="iv-present-dot" style="background:'+color+'"></span>' +
        '<span class="iv-present-name">'+esc(student.nome || 'Sem nome')+'</span>' +
        '<span class="iv-turma-badge '+turma.className+'" title="'+esc(turma.full)+'">'+esc(turma.text)+'</span>' +
      '</div>';
    }).join('');
  }

  function premiumTeamCard(team, index, maxCount){
    var count = team.students.length;
    var width = maxCount ? Math.max(7, Math.round(count / maxCount * 100)) : 7;
    return '<details class="iv-premium-team" style="--team-color:'+team.color+'" '+(index === 0 ? 'open' : '')+'>' +
      '<summary>' +
        '<span class="iv-team-rank">'+(index + 1)+'</span>' +
        '<span class="iv-team-center"><strong>'+esc(team.name)+'</strong><span class="iv-team-bar"><i style="width:'+width+'%"></i></span></span>' +
        '<span class="iv-team-count"><b>'+count+'</b><small>aluno'+(count === 1 ? '' : 's')+'</small></span>' +
        '<span class="iv-team-arrow">▼</span>' +
      '</summary>' +
      '<div class="iv-team-body"><div class="iv-present-title">Alunos presentes</div>'+studentRows(team.students, team.color)+'</div>' +
    '</details>';
  }

  function weekPanel(group, moduleNumber, reviewIndex, weekIndex, selected){
    var moduleStudents = group.students.filter(function(student){
      return String(student.modulo || '1') === String(moduleNumber) && isActive(student);
    });
    var presentStudents = moduleStudents.filter(function(student){
      return presentInWeek(student, moduleNumber, weekIndex);
    });
    var teams = groupByTeam(presentStudents);
    var maxCount = teams.length ? teams[0].students.length : 0;
    var week = moduleData(moduleNumber).semanas[weekIndex];
    var lessons = (week.aulas || []).map(lessonLabel).join(' · ');
    var teamsHtml = teams.map(function(team, index){
      return premiumTeamCard(team, index, maxCount);
    }).join('');

    if(!teamsHtml){
      teamsHtml = '<div class="iv-review-empty">Nenhum aluno presente nesta semana.</div>';
    }

    return '<div class="iv-week-panel" id="iv-week-'+reviewIndex+'-'+moduleNumber+'-'+weekIndex+'" style="display:'+(selected ? 'block' : 'none')+'">' +
      '<div class="iv-week-heading"><div><strong>'+esc(week.label || shortWeekLabel(week, weekIndex))+'</strong><span>'+esc(lessons)+'</span></div><b>'+presentStudents.length+' presente'+(presentStudents.length === 1 ? '' : 's')+'</b></div>' +
      '<div class="iv-premium-team-list">'+teamsHtml+'</div>' +
    '</div>';
  }

  function moduleSection(group, moduleNumber, reviewIndex){
    var module = moduleData(moduleNumber);
    if(!module) return '';

    var latest = latestStartedWeek(moduleNumber);
    var weeks = module.semanas || [];
    var activeCount = group.students.filter(function(student){
      return String(student.modulo || '1') === String(moduleNumber) && isActive(student);
    }).length;
    var quitCount = group.students.filter(function(student){
      return String(student.modulo || '1') === String(moduleNumber) && isQuit(student);
    }).length;

    var tabs = weeks.map(function(week, weekIndex){
      var started = weekStarted(moduleNumber, weekIndex);
      return '<button type="button" class="iv-week-tab '+(weekIndex === latest ? 'active' : '')+' '+(started ? 'started' : 'future')+'" onclick="ivShowWeek('+reviewIndex+','+moduleNumber+','+weekIndex+',this)">'+esc(shortWeekLabel(week, weekIndex))+'</button>';
    }).join('');

    var panels = weeks.map(function(week, weekIndex){
      return weekPanel(group, moduleNumber, reviewIndex, weekIndex, weekIndex === latest);
    }).join('');

    return '<section class="iv-module-section" style="--module-color:'+moduleColor(moduleNumber)+'">' +
      '<div class="iv-module-heading">' +
        '<div><span class="iv-module-icon">▣</span><div><strong>'+esc(module.nome || (moduleNumber+'º Módulo'))+'</strong><span>Módulo atual desta Revisão</span></div></div>' +
        '<div class="iv-module-counts"><b>'+activeCount+' ativos</b><span>'+quitCount+' desistentes</span></div>' +
      '</div>' +
      '<div class="iv-week-tabs">'+tabs+'</div>' +
      '<div class="iv-week-panels">'+panels+'</div>' +
    '</section>';
  }

  function kpiCards(group){
    var active = group.students.filter(isActive);
    var quit = group.students.filter(isQuit);
    var teams = groupByTeam(group.students);
    var retention = attendanceStats(active);

    var items = [
      {label:'Total de alunos',value:group.students.length,className:'blue'},
      {label:'Alunos ativos',value:active.length,className:'green'},
      {label:'Desistentes',value:quit.length,className:'red'},
      {label:'Equipes',value:teams.length,className:'purple'},
      {label:'Retenção',value:retention.pct+'%',className:'cyan'}
    ];

    return '<div class="iv-kpi-grid">'+items.map(function(item){
      return '<div class="iv-kpi '+item.className+'"><b>'+item.value+'</b><span>'+item.label+'</span></div>';
    }).join('')+'</div>';
  }

  function presenceComparison(group){
    var moduleNumbers = Array.from(new Set(group.students.map(function(student){
      return parseInt(student.modulo || 1, 10);
    }))).sort();

    var sections = moduleNumbers.map(function(moduleNumber){
      var module = moduleData(moduleNumber);
      var started = startedWeekIndexes(moduleNumber);
      var students = group.students.filter(function(student){
        return String(student.modulo || '1') === String(moduleNumber) && isActive(student);
      });
      var teams = groupByTeam(students);
      if(!module || !started.length || !teams.length) return '';

      var header = '<div class="iv-compare-head"><span>Equipe</span>'+started.map(function(weekIndex){
        return '<b style="--week-color:'+WEEK_COLORS[weekIndex % WEEK_COLORS.length]+'">'+esc(shortWeekLabel(module.semanas[weekIndex], weekIndex))+'</b>';
      }).join('')+'</div>';

      var rows = teams.map(function(team){
        return '<div class="iv-compare-row"><strong>'+esc(team.name)+'</strong>'+started.map(function(weekIndex){
          var present = team.students.filter(function(student){
            return presentInWeek(student, moduleNumber, weekIndex);
          }).length;
          var pct = team.students.length ? Math.round(present / team.students.length * 100) : 0;
          return '<span title="'+present+' de '+team.students.length+' alunos"><i style="height:'+pct+'%;background:'+WEEK_COLORS[weekIndex % WEEK_COLORS.length]+'"></i><b>'+pct+'%</b></span>';
        }).join('')+'</div>';
      }).join('');

      return '<div class="iv-analysis-block"><div class="iv-analysis-subtitle" style="color:'+moduleColor(moduleNumber)+'">'+esc(module.nome)+'</div><div class="iv-compare-scroll"><div class="iv-compare-table" style="--week-count:'+started.length+'">'+header+rows+'</div></div></div>';
    }).join('');

    return '<section class="iv-analysis-card"><div class="iv-analysis-title">Presença de cada semana por equipe</div>'+ (sections || '<div class="iv-review-empty">Ainda não existem semanas iniciadas para comparação.</div>') +'</section>';
  }

  function retentionByTeam(group){
    var teams = groupByTeam(group.students.filter(isActive));
    var rows = teams.map(function(team){
      var stats = attendanceStats(team.students);
      return '<div class="iv-retention-row" style="--team-color:'+team.color+'"><div><strong>'+esc(team.name)+'</strong><span>'+team.students.length+' aluno'+(team.students.length === 1 ? '' : 's')+'</span></div><div class="iv-retention-bar"><i style="width:'+stats.pct+'%"></i></div><b>'+stats.pct+'%</b></div>';
    }).join('');

    return '<section class="iv-analysis-card"><div class="iv-analysis-title">Retenção total por equipe</div>'+(rows || '<div class="iv-review-empty">Nenhuma equipe ativa nesta Revisão.</div>')+'</section>';
  }

  function statusComparison(group){
    var teams = groupByTeam(group.students);
    var rows = teams.map(function(team, index){
      var active = team.students.filter(isActive);
      var quit = team.students.filter(isQuit);
      var total = team.students.length || 1;
      var activePct = Math.round(active.length / total * 100);
      var quitPct = Math.round(quit.length / total * 100);
      var quitNames = quit.map(function(student){
        var turma = turmaLabel(student.turma);
        return '<div class="iv-quit-student"><span>'+esc(student.nome || 'Sem nome')+'</span><small>'+esc(turma.full)+'</small></div>';
      }).join('');

      return '<details class="iv-status-team" '+(index === 0 ? 'open' : '')+'>' +
        '<summary><span class="iv-status-team-name">'+esc(team.name)+'</span><span class="iv-status-numbers"><b class="active">'+active.length+' ativos</b><b class="quit">'+quit.length+' desist.</b></span><i>▼</i></summary>' +
        '<div class="iv-status-body">' +
          '<div class="iv-status-bar"><i class="active" style="width:'+activePct+'%"></i><i class="quit" style="width:'+quitPct+'%"></i></div>' +
          '<div class="iv-status-legend"><span><i class="active"></i>Ativos '+activePct+'%</span><span><i class="quit"></i>Desistentes '+quitPct+'%</span></div>' +
          '<div class="iv-quit-list"><strong>Alunos desistentes</strong>'+(quitNames || '<span class="iv-no-quit">Nenhum aluno desistente nesta equipe.</span>')+'</div>' +
        '</div>' +
      '</details>';
    }).join('');

    return '<section class="iv-analysis-card"><div class="iv-analysis-title">Alunos ativos e desistentes por equipe</div>'+(rows || '<div class="iv-review-empty">Nenhuma equipe nesta Revisão.</div>')+'</section>';
  }

  function revisionPanel(group, reviewIndex){
    var moduleNumbers = Array.from(new Set(group.students.map(function(student){
      return parseInt(student.modulo || 1, 10);
    }))).sort();

    var modulesHtml = moduleNumbers.map(function(moduleNumber){
      return moduleSection(group, moduleNumber, reviewIndex);
    }).join('');

    return '<section class="iv-main-review-panel" id="iv-main-review-'+reviewIndex+'" style="display:'+(reviewIndex === 0 ? 'block' : 'none')+'">' +
      '<div class="iv-review-panel-heading"><div><strong>'+esc(group.label)+'</strong><span>Visão geral completa da Revisão</span></div><b>'+group.students.length+' aluno'+(group.students.length === 1 ? '' : 's')+'</b></div>' +
      kpiCards(group) +
      '<div class="iv-section-label">Módulo atual, semanas e aulas</div>' +
      modulesHtml +
      '<div class="iv-section-label">Comparativos da Revisão</div>' +
      presenceComparison(group) +
      retentionByTeam(group) +
      statusComparison(group) +
    '</section>';
  }

  function revisionTabs(groups){
    return groups.map(function(group, index){
      return '<button type="button" class="iv-main-review-tab '+(index === 0 ? 'active' : '')+'" onclick="ivShowMainReview('+index+',this)"><span>'+esc(group.label)+'</span><small>'+group.students.length+'</small></button>';
    }).join('');
  }

  function reportStyles(version){
    var web = version === 'web';
    return '' +
      '.iv-revision-main-tabs{display:flex!important;overflow-x:auto!important;background:rgba(7,17,31,.9)!important;border-bottom:1px solid rgba(126,200,240,.16)!important;scrollbar-width:none}.iv-revision-main-tabs::-webkit-scrollbar{display:none}.iv-main-review-tab{flex:1 0 190px;min-height:70px;padding:12px 14px;border:0;border-bottom:3px solid transparent;background:transparent;color:#7892B4;cursor:pointer;font-family:inherit}.iv-main-review-tab span{display:block;font-size:11px;font-weight:900;white-space:nowrap}.iv-main-review-tab small{display:inline-flex;margin-top:5px;min-width:22px;height:18px;padding:0 6px;align-items:center;justify-content:center;border-radius:999px;background:rgba(126,200,240,.08);font-size:9px;font-weight:900}.iv-main-review-tab.active{color:#F2F8FF;border-bottom-color:#4A90D9;background:linear-gradient(180deg,rgba(74,144,217,.12),transparent)}.iv-main-review-tab.active small{background:rgba(74,144,217,.24);color:#BFEAFF}.iv-revision-root{padding:14px 13px 42px}.iv-review-panel-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin:5px 0 15px;padding:0 1px 12px;border-bottom:1px solid rgba(126,200,240,.14)}.iv-review-panel-heading strong{display:block;font-size:17px;font-weight:950;color:#F2F8FF}.iv-review-panel-heading span{display:block;margin-top:4px;color:#7892B4;font-size:10px}.iv-review-panel-heading>b{flex:0 0 auto;padding:6px 10px;border-radius:999px;background:rgba(74,144,217,.12);color:#7EC8F0;font-size:10px}.iv-kpi-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-bottom:20px}.iv-kpi{padding:13px 10px;border:1px solid #1E2E4A;border-radius:13px;background:#0B1628;text-align:center}.iv-kpi>b{display:block;font-size:24px;font-weight:950}.iv-kpi>span{display:block;margin-top:4px;color:#7892B4;font-size:8px;font-weight:800;text-transform:uppercase;letter-spacing:.04em}.iv-kpi.blue>b{color:#4A90D9}.iv-kpi.green>b{color:#3EC97A}.iv-kpi.red>b{color:#EF5361}.iv-kpi.purple>b{color:#A85AC7}.iv-kpi.cyan>b{color:#22B8CF}.iv-section-label{margin:22px 0 10px;color:#7EC8F0;font-size:13px;font-weight:900;padding-bottom:7px;border-bottom:1px solid #1E2E4A}.iv-module-section{margin-bottom:16px;border:1px solid rgba(126,200,240,.15);border-radius:16px;background:#081426;overflow:hidden;box-shadow:0 14px 32px rgba(0,0,0,.22)}.iv-module-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 15px;border-bottom:1px solid rgba(126,200,240,.10)}.iv-module-heading>div:first-child{display:flex;align-items:center;gap:10px}.iv-module-icon{width:34px;height:34px;display:flex;align-items:center;justify-content:center;border-radius:10px;background:var(--module-color);color:#fff}.iv-module-heading strong{display:block;color:#F2F8FF;font-size:14px}.iv-module-heading span{display:block;margin-top:3px;color:#7892B4;font-size:9px}.iv-module-counts{text-align:right}.iv-module-counts b{display:block;color:var(--module-color);font-size:11px}.iv-module-counts span{font-size:8px}.iv-week-tabs{display:flex;gap:7px;overflow-x:auto;padding:12px 14px;background:#071120;scrollbar-width:none}.iv-week-tabs::-webkit-scrollbar{display:none}.iv-week-tab{flex:0 0 auto;padding:8px 12px;border:0;border-radius:999px;background:#162033;color:#7892B4;font-size:9px;font-weight:900;cursor:pointer}.iv-week-tab.active{background:var(--module-color);color:#fff}.iv-week-tab.future{opacity:.55}.iv-week-panels{padding:0 14px 14px}.iv-week-heading{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;padding:13px 0 10px}.iv-week-heading strong{display:block;color:#EAF4FF;font-size:13px}.iv-week-heading span{display:block;margin-top:4px;color:#7892B4;font-size:9px}.iv-week-heading>b{padding:5px 9px;border-radius:999px;background:rgba(126,200,240,.09);color:#BFEAFF;font-size:9px;white-space:nowrap}.iv-premium-team-list{display:grid;grid-template-columns:1fr;gap:10px}.iv-premium-team{border:1px solid rgba(126,200,240,.15);border-radius:15px;background:#0B1628;overflow:hidden;box-shadow:0 12px 28px rgba(0,0,0,.20)}.iv-premium-team>summary{list-style:none;display:grid;grid-template-columns:36px minmax(0,1fr) 52px 20px;gap:11px;align-items:center;min-height:76px;padding:13px 15px;cursor:pointer}.iv-premium-team>summary::-webkit-details-marker{display:none}.iv-team-rank{width:35px;height:35px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--team-color);color:#fff;font-size:13px;font-weight:950}.iv-team-center{display:block;min-width:0}.iv-team-center>strong{display:block;color:#EEF5FF;font-size:13px;font-weight:900;overflow-wrap:anywhere}.iv-team-bar{display:block;height:5px;margin-top:9px;border-radius:999px;background:#213452;overflow:hidden}.iv-team-bar>i{display:block;height:100%;border-radius:999px;background:var(--team-color)}.iv-team-count{text-align:right}.iv-team-count>b{display:block;color:var(--team-color);font-size:25px;font-weight:950;line-height:1}.iv-team-count>small{display:block;margin-top:3px;color:#7C96B8;font-size:8px}.iv-team-arrow{color:#7892B4;font-size:12px;transition:transform .2s}.iv-premium-team[open] .iv-team-arrow{transform:rotate(180deg)}.iv-team-body{padding:0 15px 13px;border-top:1px solid rgba(126,200,240,.08)}.iv-present-title{padding:11px 0 6px;color:#7892B4;font-size:9px;font-weight:950;letter-spacing:.14em;text-transform:uppercase}.iv-present-student{display:grid;grid-template-columns:6px minmax(0,1fr) auto;gap:8px;align-items:center;min-height:31px;border-bottom:1px solid rgba(126,200,240,.07)}.iv-present-student:last-child{border-bottom:0}.iv-present-dot{width:6px;height:6px;border-radius:50%}.iv-present-name{color:#E8F0FF;font-size:11px}.iv-turma-badge{padding:2px 7px;border-radius:999px;font-size:8px;font-weight:900}.iv-turma-badge.quinta{background:rgba(74,144,217,.18);color:#7EC8F0}.iv-turma-badge.sabado{background:rgba(155,89,182,.18);color:#D4A7EA}.iv-turma-badge.sem-turma{background:rgba(255,255,255,.06);color:#7892B4}.iv-analysis-card{margin-bottom:13px;padding:14px;border:1px solid rgba(126,200,240,.14);border-radius:15px;background:#0B1628}.iv-analysis-title{margin-bottom:13px;color:#EAF4FF;font-size:13px;font-weight:900}.iv-analysis-subtitle{margin:12px 0 8px;font-size:11px;font-weight:900}.iv-compare-scroll{overflow-x:auto}.iv-compare-table{min-width:560px}.iv-compare-head,.iv-compare-row{display:grid;grid-template-columns:130px repeat(var(--week-count),minmax(48px,1fr));gap:6px;align-items:end}.iv-compare-head{padding-bottom:7px;border-bottom:1px solid rgba(126,200,240,.10)}.iv-compare-head>span{color:#7892B4;font-size:9px;font-weight:900}.iv-compare-head>b{text-align:center;color:#7892B4;font-size:8px}.iv-compare-row{min-height:70px;padding:8px 0;border-bottom:1px solid rgba(126,200,240,.07)}.iv-compare-row:last-child{border-bottom:0}.iv-compare-row>strong{align-self:center;color:#DDEEFF;font-size:10px}.iv-compare-row>span{position:relative;height:52px;border-radius:6px;background:#15233A;overflow:hidden;display:flex;align-items:flex-end;justify-content:center}.iv-compare-row>span>i{position:absolute;left:0;right:0;bottom:0;opacity:.55}.iv-compare-row>span>b{position:relative;z-index:2;padding-bottom:4px;color:#fff;font-size:8px}.iv-retention-row{display:grid;grid-template-columns:minmax(90px,160px) minmax(80px,1fr) 42px;gap:10px;align-items:center;padding:10px 0;border-bottom:1px solid rgba(126,200,240,.07)}.iv-retention-row:last-child{border-bottom:0}.iv-retention-row>div:first-child strong{display:block;color:#EAF4FF;font-size:10px}.iv-retention-row>div:first-child span{display:block;margin-top:3px;color:#7892B4;font-size:8px}.iv-retention-bar{height:7px;border-radius:999px;background:#213452;overflow:hidden}.iv-retention-bar>i{display:block;height:100%;border-radius:999px;background:var(--team-color)}.iv-retention-row>b{color:var(--team-color);font-size:11px;text-align:right}.iv-status-team{margin-bottom:8px;border:1px solid rgba(126,200,240,.12);border-radius:12px;background:#081426;overflow:hidden}.iv-status-team>summary{list-style:none;display:grid;grid-template-columns:minmax(0,1fr) auto 18px;gap:8px;align-items:center;padding:12px;cursor:pointer}.iv-status-team>summary::-webkit-details-marker{display:none}.iv-status-team-name{color:#EAF4FF;font-size:11px;font-weight:900}.iv-status-numbers{display:flex;gap:5px}.iv-status-numbers>b{padding:4px 7px;border-radius:999px;font-size:8px}.iv-status-numbers>.active{background:rgba(62,201,122,.13);color:#7EDBA8}.iv-status-numbers>.quit{background:rgba(239,83,97,.13);color:#FF8C98}.iv-status-team>summary>i{font-style:normal;color:#7892B4;font-size:9px;transition:transform .2s}.iv-status-team[open]>summary>i{transform:rotate(180deg)}.iv-status-body{padding:0 12px 12px;border-top:1px solid rgba(126,200,240,.08)}.iv-status-bar{display:flex;height:7px;margin:12px 0 7px;border-radius:999px;background:#213452;overflow:hidden}.iv-status-bar>.active{background:#3EC97A}.iv-status-bar>.quit{background:#EF5361}.iv-status-legend{display:flex;gap:12px;flex-wrap:wrap;color:#7892B4;font-size:8px}.iv-status-legend span{display:flex;align-items:center;gap:4px}.iv-status-legend i{width:7px;height:7px;border-radius:50%}.iv-status-legend i.active{background:#3EC97A}.iv-status-legend i.quit{background:#EF5361}.iv-quit-list{margin-top:12px;padding-top:10px;border-top:1px solid rgba(126,200,240,.07)}.iv-quit-list>strong{display:block;margin-bottom:7px;color:#FF8C98;font-size:9px;text-transform:uppercase;letter-spacing:.08em}.iv-quit-student{display:flex;justify-content:space-between;gap:10px;padding:7px 0;border-bottom:1px solid rgba(126,200,240,.06)}.iv-quit-student span{color:#E8F0FF;font-size:10px}.iv-quit-student small{color:#7892B4;font-size:8px}.iv-no-quit{display:block;color:#7892B4;font-size:9px}.iv-review-empty{padding:28px 16px;text-align:center;border:1px dashed rgba(126,200,240,.16);border-radius:13px;color:#7892B4;font-size:11px}' +
      (web ? 'body.iv-report-web{padding:32px 0!important}body.iv-report-web>.header,body.iv-report-web>.top-nav,body.iv-report-web>#modulos{width:min(1220px,calc(100% - 64px))!important;margin-left:auto!important;margin-right:auto!important}body.iv-report-web>.header{padding:28px 32px 24px!important;border-radius:26px 26px 0 0}body.iv-report-web .report-logo{width:64px!important;min-width:64px!important;max-width:64px!important}body.iv-report-web .header h1{font-size:30px!important}body.iv-report-web .hbadge{font-size:11px!important;padding:7px 14px!important}body.iv-report-web .hsub{font-size:13px!important}body.iv-report-web .iv-main-review-tab{flex-basis:240px;min-height:92px;padding:17px 20px}body.iv-report-web .iv-main-review-tab span{font-size:14px}body.iv-report-web .iv-revision-root{padding:25px 30px 55px}body.iv-report-web .iv-kpi-grid{grid-template-columns:repeat(5,minmax(0,1fr));gap:12px}body.iv-report-web .iv-kpi{padding:18px 12px}body.iv-report-web .iv-kpi>b{font-size:31px}body.iv-report-web .iv-kpi>span{font-size:9px}body.iv-report-web .iv-section-label{font-size:17px;margin-top:28px}body.iv-report-web .iv-module-heading{padding:18px 20px}body.iv-report-web .iv-module-heading strong{font-size:18px}body.iv-report-web .iv-week-tabs{padding:15px 20px}body.iv-report-web .iv-week-tab{font-size:11px;padding:10px 15px}body.iv-report-web .iv-week-panels{padding:0 20px 20px}body.iv-report-web .iv-week-heading strong{font-size:16px}body.iv-report-web .iv-premium-team>summary{grid-template-columns:42px minmax(0,1fr) 70px 24px;min-height:92px;padding:17px 20px}body.iv-report-web .iv-team-rank{width:40px;height:40px;font-size:15px}body.iv-report-web .iv-team-center>strong{font-size:16px}body.iv-report-web .iv-team-count>b{font-size:31px}body.iv-report-web .iv-team-body{padding:0 20px 16px}body.iv-report-web .iv-present-student{min-height:39px}body.iv-report-web .iv-present-name{font-size:13px}body.iv-report-web .iv-analysis-card{padding:20px}body.iv-report-web .iv-analysis-title{font-size:16px}body.iv-report-web .iv-retention-row>div:first-child strong{font-size:13px}body.iv-report-web .iv-status-team-name{font-size:13px}' : '') +
      '@media(max-width:820px){body.iv-report-web{padding:0!important}body.iv-report-web>.header,body.iv-report-web>.top-nav,body.iv-report-web>#modulos{width:100%!important;border-radius:0!important}body.iv-report-web .header{padding:18px 16px 16px!important}body.iv-report-web .report-logo{width:48px!important;min-width:48px!important;max-width:48px!important}body.iv-report-web .header h1{font-size:19px!important}.iv-main-review-tab{flex-basis:165px}.iv-review-panel-heading{align-items:center}.iv-review-panel-heading strong{font-size:15px}.iv-premium-team>summary{grid-template-columns:34px minmax(0,1fr) 48px 18px;padding:12px 11px;gap:9px}.iv-status-numbers{flex-direction:column;align-items:flex-end}.iv-compare-head,.iv-compare-row{grid-template-columns:105px repeat(var(--week-count),46px)}}';
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
      root.innerHTML = groups.map(function(group, index){
        return revisionPanel(group, index);
      }).join('') || '<div class="iv-review-empty">Nenhuma Revisão cadastrada.</div>';
    }

    var style = report.createElement('style');
    style.id = 'iv-general-authority-style';
    style.textContent = reportStyles(version);
    report.head.appendChild(style);

    var badge = report.querySelector('.hbadge');
    if(badge) badge.textContent = version === 'web' ? '📋 Relatório Web' : '📋 Relatório Mobile';

    var script = report.createElement('script');
    script.textContent =
      'function ivShowMainReview(index,button){document.querySelectorAll(".iv-main-review-panel").forEach(function(panel){panel.style.display="none"});var panel=document.getElementById("iv-main-review-"+index);if(panel)panel.style.display="block";document.querySelectorAll(".iv-main-review-tab").forEach(function(tab){tab.classList.remove("active")});if(button)button.classList.add("active");try{window.scrollTo(0,0)}catch(error){}}' +
      'function ivShowWeek(reviewIndex,moduleNumber,weekIndex,button){document.querySelectorAll("[id^=\\"iv-week-"+reviewIndex+"-"+moduleNumber+"-\\"]").forEach(function(panel){panel.style.display="none"});var panel=document.getElementById("iv-week-"+reviewIndex+"-"+moduleNumber+"-"+weekIndex);if(panel)panel.style.display="block";var section=button&&button.closest(".iv-module-section");if(section)section.querySelectorAll(".iv-week-tab").forEach(function(tab){tab.classList.remove("active")});if(button)button.classList.add("active")}';
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
        revisao:'dashboard-completo',
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
        registrarAlteracaoIV('relatorio', 'Gerou relatório', 'Visão Geral atual', moduleFilter + ' · painel completo por Revisão');
      }
      if(typeof toast === 'function') toast('Link gerado! ✓');
      return link;
    } catch(error){
      console.error('Erro no relatório completo por Revisão:', error);
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
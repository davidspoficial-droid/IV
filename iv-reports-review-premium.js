// IV - Relatórios por revisão, visão geral em abas e página mobile premium
(function(){
  'use strict';

  var reportVersion = 'mobile';
  var STYLE_ID = 'iv-reports-review-premium-style';

  function ready(fn){
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, {once:true});
    else fn();
  }

  function data(){
    try { return typeof DB !== 'undefined' ? DB : null; }
    catch(e){ return null; }
  }

  function review(){
    return window.IVReview || {
      key:function(){ return ''; },
      label:function(){ return 'Sem revisão'; },
      options:function(){ return '<option value="">Todas as revisões</option>'; },
      match:function(){ return true; }
    };
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

  function turmaLabel(value){
    if(value === 'quinta') return 'Quinta-feira';
    if(value === 'sabado') return 'Sábado';
    return 'Sem turma';
  }

  function moduleLabel(value){
    var key = String(value || '1');
    try { return MODULOS[key] ? MODULOS[key].nome : key+'º Módulo'; }
    catch(e){ return key+'º Módulo'; }
  }

  function teamName(student){
    var d = data();
    var item = d && (d.equipes || []).find(function(team){
      return String(team.id) === String(student.equipeId);
    });
    return item ? item.nome : 'Sem equipe';
  }

  function reviewShort(student){
    return review().label(student).replace(/^Revisão\s+/i, '');
  }

  function ensureStyle(){
    if(document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #page-exportar .iv-reports-grid-four{grid-template-columns:minmax(190px,1.15fr) minmax(190px,1.05fr) minmax(150px,.72fr) minmax(190px,1fr)!important}
      #page-exportar #iv-report-review-field{min-width:0}
      #page-exportar .iv-report-filter-note{margin-top:12px;padding:10px 12px;border:1px solid rgba(126,200,240,.12);border-radius:14px;background:rgba(126,200,240,.045);color:#91AACA;font-size:11px;line-height:1.45}
      #page-exportar .iv-report-filter-note strong{color:#DFF6FF}
      #page-exportar .iv-report-mobile-help{display:none}
      @media(max-width:820px){
        #page-exportar{padding:13px 10px 30px!important;max-width:100%!important;overflow:hidden!important}
        #page-exportar .reports-page-premium{width:100%!important;max-width:100%!important}
        #page-exportar .reports-titlebar{align-items:center!important;gap:11px!important;margin:2px 2px 15px!important}
        #page-exportar .reports-title-icon{width:46px!important;height:46px!important;flex:0 0 46px!important;border-radius:15px!important;font-size:21px!important;box-shadow:0 13px 30px rgba(0,0,0,.30),0 0 20px rgba(47,128,237,.12),inset 0 1px 0 rgba(255,255,255,.07)!important}
        #page-exportar .reports-titlebar h1{font-size:27px!important;line-height:1!important;letter-spacing:-.025em!important}
        #page-exportar .reports-titlebar p{font-size:11px!important;line-height:1.35!important;margin-top:4px!important;color:#8FAACB!important}
        #page-exportar .reports-panel{padding:13px!important;margin-bottom:11px!important;border-radius:20px!important;background:radial-gradient(circle at 10% 0%,rgba(47,128,237,.13),transparent 34%),linear-gradient(145deg,rgba(18,35,64,.92),rgba(4,13,27,.97))!important;box-shadow:0 16px 38px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.045)!important}
        #page-exportar .reports-grid,#page-exportar .iv-reports-grid-four{display:grid!important;grid-template-columns:1fr 1fr!important;gap:9px!important}
        #page-exportar .reports-field:first-child{grid-column:1/-1!important}
        #page-exportar .reports-field label,#page-exportar .reports-inline label{font-size:10px!important;margin-bottom:5px!important;letter-spacing:.045em!important;text-transform:uppercase!important}
        #page-exportar .reports-field input,#page-exportar .reports-field select{height:45px!important;padding:0 11px!important;border-radius:13px!important;font-size:12px!important;background:rgba(2,10,24,.82)!important}
        #page-exportar .reports-bottom{grid-template-columns:1fr!important;gap:11px!important;margin-top:13px!important}
        #page-exportar .reports-segmented{display:grid!important;grid-template-columns:1fr 1fr!important;gap:7px!important}
        #page-exportar .seg-btn{width:100%!important;min-width:0!important;height:38px!important;padding:0 8px!important;border-radius:13px!important;font-size:11px!important}
        #page-exportar .iv-report-filter-note{margin-top:10px!important;font-size:10px!important;padding:9px 10px!important;border-radius:12px!important}
        #page-exportar .reports-main-grid{display:block!important}
        #page-exportar .report-hero-card{min-height:0!important;padding:22px 15px 18px!important;border-radius:20px!important;margin-bottom:10px!important;background:radial-gradient(circle at 50% 14%,rgba(34,150,255,.20),transparent 37%),linear-gradient(145deg,rgba(2,18,55,.98),rgba(5,16,35,.96))!important}
        #page-exportar .report-link-icon{width:64px!important;height:64px!important;font-size:27px!important;margin-bottom:12px!important}
        #page-exportar .report-hero-card h2{font-size:23px!important;margin-bottom:8px!important}
        #page-exportar .report-hero-card p{font-size:12px!important;line-height:1.5!important;margin-bottom:17px!important}
        #page-exportar .report-generate-btn{width:100%!important;height:44px!important;border-radius:14px!important;font-size:12px!important}
        #page-exportar .report-info-card{display:none!important}
        #page-exportar .iv-report-mobile-help{display:block!important;margin:0 0 10px!important;border:1px solid rgba(126,200,240,.16)!important;border-radius:18px!important;background:linear-gradient(145deg,rgba(255,255,255,.04),rgba(255,255,255,.009)),rgba(7,17,31,.88)!important;box-shadow:0 14px 34px rgba(0,0,0,.25),inset 0 1px 0 rgba(255,255,255,.04)!important;overflow:hidden!important}
        #page-exportar .iv-report-mobile-help summary{list-style:none!important;min-height:54px!important;padding:10px 12px!important;display:grid!important;grid-template-columns:36px 1fr 24px!important;gap:9px!important;align-items:center!important;color:#EAF7FF!important;font-size:12px!important;font-weight:900!important;cursor:pointer!important}
        #page-exportar .iv-report-mobile-help summary::-webkit-details-marker{display:none!important}
        #page-exportar .iv-report-help-icon{width:36px;height:36px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:rgba(47,128,237,.12);border:1px solid rgba(126,200,240,.18);color:#BFEAFF;font-size:17px}
        #page-exportar .iv-report-help-chevron{color:#7EC8F0;font-size:18px;transition:transform .2s ease}
        #page-exportar .iv-report-mobile-help[open] .iv-report-help-chevron{transform:rotate(180deg)}
        #page-exportar .iv-report-help-body{padding:0 13px 13px;border-top:1px solid rgba(126,200,240,.10);color:#91AACA;font-size:11px;line-height:1.55}
        #page-exportar .iv-report-help-body div{display:flex;gap:7px;margin-top:9px}
        #page-exportar .iv-report-help-body b{color:#7EC8F0}
        #page-exportar .reports-modal{padding:10px!important}
        #page-exportar .reports-modal-box{padding:18px 14px!important;border-radius:18px!important;max-height:90vh!important;overflow:auto!important}
      }
      @media(max-width:390px){
        #page-exportar .reports-grid,#page-exportar .iv-reports-grid-four{grid-template-columns:1fr!important}
        #page-exportar .reports-field:first-child{grid-column:auto!important}
      }
    `;
    document.head.appendChild(style);
  }

  function ensureReviewField(){
    var grid = document.querySelector('#page-exportar .reports-grid');
    if(!grid) return null;
    grid.classList.add('iv-reports-grid-four');

    var select = document.getElementById('exp-revisao');
    var field = document.getElementById('iv-report-review-field');
    if(!field){
      field = document.createElement('div');
      field.id = 'iv-report-review-field';
      field.className = 'reports-field';
      field.innerHTML = '<label>Revisão</label>';
      grid.appendChild(field);
    }

    if(!select){
      select = document.createElement('select');
      select.id = 'exp-revisao';
    }
    if(select.parentNode !== field) field.appendChild(select);

    var current = select.value || '';
    select.innerHTML = review().options(current, 'Todas as revisões');
    select.value = current;
    return select;
  }

  function ensureType(){
    var select = document.getElementById('exp-tipo');
    if(!select) return;
    var option = Array.prototype.find.call(select.options, function(item){ return item.value === 'revisao'; });
    if(!option){
      option = document.createElement('option');
      option.value = 'revisao';
      option.textContent = '📚 Relatório por Revisão';
      var turma = Array.prototype.find.call(select.options, function(item){ return item.value === 'turma'; });
      if(turma && turma.nextSibling) select.insertBefore(option, turma.nextSibling);
      else select.appendChild(option);
    }
  }

  function ensureNote(){
    var panel = document.querySelector('#page-exportar .reports-panel');
    if(!panel || document.getElementById('iv-report-filter-note')) return;
    var note = document.createElement('div');
    note.id = 'iv-report-filter-note';
    note.className = 'iv-report-filter-note';
    note.innerHTML = '<strong>Filtro por Revisão:</strong> todos os relatórios respeitam o filtro. Na Visão Geral, as Revisões também ficam disponíveis em abas interativas.';
    panel.appendChild(note);
  }

  function ensureMobileHelp(){
    var grid = document.querySelector('#page-exportar .reports-main-grid');
    if(!grid || document.getElementById('iv-report-mobile-help')) return;
    var details = document.createElement('details');
    details.id = 'iv-report-mobile-help';
    details.className = 'iv-report-mobile-help';
    details.innerHTML = '<summary><span class="iv-report-help-icon">✦</span><span>Como funciona o relatório</span><span class="iv-report-help-chevron">⌄</span></summary><div class="iv-report-help-body"><div><b>✓</b><span>Escolha o tipo, módulo e Revisão.</span></div><div><b>✓</b><span>Gere um link otimizado para celular ou computador.</span></div><div><b>✓</b><span>Compartilhe pelo WhatsApp sem baixar arquivos.</span></div></div>';
    grid.appendChild(details);
  }

  function trackVersion(){
    if(window.setVersaoRelatorio && !window.setVersaoRelatorio._ivReviewPremium){
      var old = window.setVersaoRelatorio;
      window.setVersaoRelatorio = function(version, button){
        reportVersion = version === 'web' ? 'web' : 'mobile';
        return old.apply(this, arguments);
      };
      window.setVersaoRelatorio._ivReviewPremium = true;
    }
    var web = document.getElementById('tab-web');
    reportVersion = web && web.classList.contains('active') ? 'web' : 'mobile';
  }

  function ensurePage(){
    ensureStyle();
    ensureType();
    ensureReviewField();
    ensureNote();
    ensureMobileHelp();
    trackVersion();
  }

  function presenceStats(student){
    var d = data();
    if(!d) return {present:0,total:0,absence:0,pct:0};
    var present = 0;
    var total = 0;
    var activeModule = Math.max(1, Math.min(3, number(student.modulo || 1)));

    [1,2,3].forEach(function(moduleNumber){
      var moduleData;
      try { moduleData = MODULOS[moduleNumber]; }
      catch(e){ moduleData = null; }
      if(!moduleData) return;

      moduleData.semanas.forEach(function(week, weekIndex){
        var hasPresence = week.aulas.some(function(lesson){
          try { return !!d.presencas[presKey(student.id, moduleNumber, weekIndex, lesson)]; }
          catch(e){ return false; }
        });
        var started = moduleNumber < activeModule || hasPresence;
        if(moduleNumber === activeModule){
          try { started = typeof semanaIniciada === 'function' ? semanaIniciada(moduleNumber, weekIndex) || hasPresence : true; }
          catch(e){ started = true; }
        }
        if(moduleNumber > activeModule && !hasPresence) started = false;
        if(!started) return;

        week.aulas.forEach(function(lesson){
          total += 1;
          try { if(d.presencas[presKey(student.id, moduleNumber, weekIndex, lesson)]) present += 1; }
          catch(e){}
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

  function students(moduleFilter, reviewFilter, ignoreReview){
    var d = data();
    if(!d) return [];
    return (d.alunos || []).filter(function(student){
      var moduleMatches = moduleFilter === 'todos' || !moduleFilter || String(student.modulo || '1') === String(moduleFilter);
      var reviewMatches = ignoreReview || review().match(student, reviewFilter || '');
      return moduleMatches && reviewMatches;
    }).map(function(student){
      var attendance = presenceStats(student);
      return {
        raw: student,
        id: student.id,
        name: student.nome || 'Sem nome',
        registration: student.inscricao || '',
        module: moduleLabel(student.modulo),
        moduleNumber: number(student.modulo || 1),
        team: teamName(student),
        turma: turmaLabel(student.turma),
        status: String(student.situacao || 'ATIVO').toUpperCase(),
        reviewKey: review().key(student),
        review: reviewShort(student),
        attendance: attendance
      };
    }).sort(function(a,b){
      return a.moduleNumber - b.moduleNumber || a.name.localeCompare(b.name, 'pt-BR');
    });
  }

  function summary(items){
    var active = items.filter(function(item){ return item.status === 'ATIVO'; }).length;
    var quit = items.filter(function(item){ return item.status === 'DESISTENTE'; }).length;
    var teams = {};
    var present = 0;
    var total = 0;
    items.forEach(function(item){
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

  function reportCss(version){
    var web = version === 'web';
    return `<style>
      *{box-sizing:border-box}html{min-height:100%}body{margin:0;min-height:100vh;padding:${web?'26px':'10px'};background:radial-gradient(circle at 12% 0,rgba(47,128,237,.27),transparent 32%),radial-gradient(circle at 91% 9%,rgba(34,211,238,.14),transparent 30%),linear-gradient(145deg,#020611,#07111F 48%,#030712);color:#EAF4FF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif}body:before{content:'';position:fixed;inset:0;pointer-events:none;background-image:linear-gradient(rgba(255,255,255,.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.022) 1px,transparent 1px);background-size:38px 38px}.shell{position:relative;z-index:1;width:100%;max-width:${web?'1180px':'620px'};margin:auto;border:1px solid rgba(126,200,240,.18);border-radius:${web?'30px':'23px'};overflow:hidden;background:linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.014)),rgba(8,19,36,.88);box-shadow:0 30px 90px rgba(0,0,0,.46),inset 0 1px 0 rgba(255,255,255,.055)}.hero{padding:${web?'27px 30px':'20px 16px'};background:radial-gradient(circle at 10% 0,rgba(47,128,237,.26),transparent 38%),linear-gradient(135deg,rgba(7,17,31,.98),rgba(16,40,70,.86));border-bottom:1px solid rgba(126,200,240,.16)}.eyebrow{display:inline-flex;padding:6px 10px;border-radius:999px;background:linear-gradient(135deg,#2F80ED,#22D3EE);color:white;font-size:9px;font-weight:900;letter-spacing:.09em;text-transform:uppercase;box-shadow:0 10px 24px rgba(47,128,237,.25)}.title{font-size:${web?'34px':'25px'};line-height:1.04;font-weight:950;margin-top:9px;color:#F7FBFF;letter-spacing:-.025em}.meta{margin-top:7px;color:#91AACA;font-size:11px;line-height:1.5}.content{padding:${web?'26px 28px 34px':'14px 11px 22px'}}.tabs{display:flex;gap:7px;overflow-x:auto;padding:2px 1px 10px;margin-bottom:8px;scrollbar-width:none}.tabs::-webkit-scrollbar{display:none}.tab{flex:0 0 auto;border:1px solid rgba(126,200,240,.16);border-radius:999px;background:rgba(255,255,255,.026);color:#9CB8D6;padding:8px 11px;font-size:10px;font-weight:900;cursor:pointer;white-space:nowrap}.tab.active{color:#fff;border-color:rgba(126,200,240,.44);background:linear-gradient(135deg,#2F80ED,#22A8E8);box-shadow:0 10px 22px rgba(47,128,237,.24)}.pane{display:none}.pane.active{display:block;animation:paneIn .2s ease both}@keyframes paneIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}.kpis{display:grid;grid-template-columns:repeat(${web?'6':'3'},minmax(0,1fr));gap:${web?'10px':'7px'};margin-bottom:12px}.kpi{min-width:0;aspect-ratio:${web?'auto':'1/1'};padding:${web?'15px 12px':'9px 5px'};border-radius:${web?'18px':'16px'};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;border:1px solid rgba(126,200,240,.14);background:radial-gradient(circle at 23% 10%,rgba(255,255,255,.09),transparent 32%),linear-gradient(145deg,rgba(255,255,255,.048),rgba(255,255,255,.01)),rgba(7,17,31,.82);box-shadow:0 13px 30px rgba(0,0,0,.24),inset 0 1px 0 rgba(255,255,255,.04)}.num{font-size:${web?'29px':'clamp(20px,7vw,27px)'};font-weight:950;line-height:.95;color:var(--c,#7EC8F0)}.label{font-size:${web?'9px':'7px'};line-height:1.2;color:#8FAACB;font-weight:900;text-transform:uppercase;letter-spacing:.055em;margin-top:5px;overflow-wrap:anywhere}.section,.person{margin-bottom:10px;border:1px solid rgba(126,200,240,.15);border-radius:19px;background:linear-gradient(145deg,rgba(255,255,255,.045),rgba(255,255,255,.009)),rgba(7,17,31,.82);box-shadow:0 15px 36px rgba(0,0,0,.25),inset 0 1px 0 rgba(255,255,255,.04);overflow:hidden}.section>summary{list-style:none;min-height:55px;padding:10px 12px;display:grid;grid-template-columns:36px minmax(0,1fr) 25px;gap:9px;align-items:center;cursor:pointer}.section>summary::-webkit-details-marker{display:none}.section-icon{width:36px;height:36px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:rgba(47,128,237,.11);border:1px solid rgba(126,200,240,.17);color:#BFEAFF;font-size:17px}.section-title{font-size:12px;font-weight:950;color:#EAF7FF}.chev{font-size:18px;color:#7EC8F0;transition:transform .2s}.section[open] .chev{transform:rotate(180deg)}.section-body{padding:0 11px 11px;border-top:1px solid rgba(126,200,240,.09)}.group{padding:11px 2px;border-bottom:1px solid rgba(126,200,240,.085)}.group:last-child{border-bottom:0}.group-top{display:flex;justify-content:space-between;gap:9px;align-items:center}.group-name{font-size:12px;font-weight:900;color:#fff;min-width:0;overflow-wrap:anywhere}.group-count{font-size:10px;color:#7EC8F0;font-weight:900;white-space:nowrap}.bar{height:5px;margin-top:7px;border-radius:999px;background:rgba(126,200,240,.10);overflow:hidden}.bar>span{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#2F80ED,#22D3EE)}.group-meta{display:flex;gap:6px;flex-wrap:wrap;margin-top:7px}.tag{display:inline-flex;align-items:center;padding:4px 8px;border-radius:999px;font-size:9px;font-weight:900;background:rgba(126,200,240,.09);color:#BFEAFF;border:1px solid rgba(126,200,240,.10)}.tag.green{background:rgba(62,201,122,.12);color:#7EDBA8}.tag.red{background:rgba(224,85,85,.12);color:#F08080}.tag.purple{background:rgba(155,89,182,.13);color:#D8A7ED}.student-list{display:grid;gap:7px}.student-row{padding:10px;border:1px solid rgba(126,200,240,.10);border-radius:14px;background:rgba(255,255,255,.018)}.student-top{display:flex;justify-content:space-between;gap:9px;align-items:flex-start}.student-name{font-size:12px;font-weight:950;color:#fff;overflow-wrap:anywhere}.student-meta{font-size:9px;color:#8FAACB;line-height:1.45;margin-top:3px}.student-tags{display:flex;gap:5px;flex-wrap:wrap;margin-top:8px}.person{padding:13px}.person-title{font-size:15px;font-weight:950;color:#fff}.route{display:grid;grid-template-columns:${web?'repeat(3,1fr)':'1fr'};gap:7px;margin-top:10px}.step{padding:10px;border-radius:14px;border:1px solid rgba(126,200,240,.12);background:rgba(255,255,255,.022)}.step b{font-size:11px;color:#DFF4FF}.empty{padding:24px 12px;text-align:center;color:#8FAACB;border:1px dashed rgba(126,200,240,.17);border-radius:17px}.footer{text-align:center;padding:0 14px 20px;color:#6685AA;font-size:9px}@media(max-width:390px){.kpis{grid-template-columns:repeat(2,minmax(0,1fr))}.kpi{aspect-ratio:auto;min-height:82px}}@media print{body{background:white;color:#102033;padding:0}.shell{box-shadow:none;border:1px solid #d8e3ef}.tabs{display:none}.pane{display:block!important}.section{break-inside:avoid}}
    </style>`;
  }

  function summaryCards(items){
    var values = summary(items);
    return '<div class="kpis">'+
      '<div class="kpi" style="--c:#7EC8F0"><div class="num">'+values.total+'</div><div class="label">Alunos</div></div>'+
      '<div class="kpi" style="--c:#3EC97A"><div class="num">'+values.active+'</div><div class="label">Ativos</div></div>'+
      '<div class="kpi" style="--c:#E05555"><div class="num">'+values.quit+'</div><div class="label">Desistentes</div></div>'+
      '<div class="kpi" style="--c:#C39BD3"><div class="num">'+values.teams+'</div><div class="label">Equipes</div></div>'+
      '<div class="kpi" style="--c:#F0B866"><div class="num">'+values.absence+'</div><div class="label">Faltas</div></div>'+
      '<div class="kpi" style="--c:#22D3EE"><div class="num">'+values.pct+'%</div><div class="label">Presença</div></div>'+
    '</div>';
  }

  function groupRows(entries){
    if(!entries.length) return '<div class="empty">Nenhuma informação encontrada.</div>';
    var max = Math.max.apply(Math, entries.map(function(entry){ return entry[1].length; }).concat([1]));
    return entries.map(function(entry){
      var values = summary(entry[1]);
      var width = Math.max(4, Math.round(entry[1].length / max * 100));
      return '<div class="group"><div class="group-top"><div class="group-name">'+esc(entry[0])+'</div><div class="group-count">'+entry[1].length+' aluno(s)</div></div><div class="bar"><span style="width:'+width+'%"></span></div><div class="group-meta"><span class="tag green">'+values.active+' ativos</span><span class="tag red">'+values.quit+' desist.</span><span class="tag purple">'+values.pct+'% presença</span><span class="tag">'+values.absence+' faltas</span></div></div>';
    }).join('');
  }

  function section(title, icon, body, open){
    return '<details class="section" '+(open?'open':'')+'><summary><span class="section-icon">'+icon+'</span><span class="section-title">'+esc(title)+'</span><span class="chev">⌄</span></summary><div class="section-body">'+body+'</div></details>';
  }

  function studentRows(items){
    if(!items.length) return '<div class="empty">Nenhum aluno encontrado.</div>';
    return '<div class="student-list">'+items.map(function(item){
      return '<div class="student-row"><div class="student-top"><div><div class="student-name">'+esc(item.name)+'</div><div class="student-meta">'+esc(item.registration || 'Sem inscrição')+' · '+esc(item.team)+'</div></div><span class="tag '+(item.status === 'DESISTENTE'?'red':'green')+'">'+esc(item.status)+'</span></div><div class="student-tags"><span class="tag">'+esc(item.module)+'</span><span class="tag purple">'+esc(item.turma)+'</span><span class="tag">Revisão '+esc(item.review)+'</span><span class="tag green">'+item.attendance.pct+'% presença</span><span class="tag red">'+item.attendance.absence+' faltas</span></div></div>';
    }).join('')+'</div>';
  }

  function overviewContent(items){
    return summaryCards(items)+
      section('Alunos por módulo', '▥', groupRows(group(items, function(item){ return item.module; })), true)+
      section('Alunos por turma', '◫', groupRows(group(items, function(item){ return item.turma; })), false)+
      section('Alunos por equipe', '✦', groupRows(group(items, function(item){ return item.team; })), false)+
      section('Lista de alunos', '☰', studentRows(items), false);
  }

  function overviewTabs(items, selectedReview){
    var keys = {};
    var hasNone = false;
    items.forEach(function(item){
      if(item.reviewKey) keys[item.reviewKey] = true;
      else hasNone = true;
    });
    var tabs = [{key:'__all__', label:'Visão geral', items:items}];
    Object.keys(keys).sort().reverse().forEach(function(key){
      tabs.push({key:key,label:review().label(key).replace(/^Revisão\s+/i,''),items:items.filter(function(item){return item.reviewKey===key;})});
    });
    if(hasNone) tabs.push({key:'__none__',label:'Sem revisão',items:items.filter(function(item){return !item.reviewKey;})});

    var active = selectedReview && tabs.some(function(tab){ return tab.key === selectedReview; }) ? selectedReview : '__all__';
    return '<div class="tabs" role="tablist">'+tabs.map(function(tab){
      return '<button type="button" class="tab '+(tab.key===active?'active':'')+'" data-tab="'+esc(tab.key)+'">'+esc(tab.label)+'</button>';
    }).join('')+'</div>'+tabs.map(function(tab){
      return '<section class="pane '+(tab.key===active?'active':'')+'" data-pane="'+esc(tab.key)+'">'+overviewContent(tab.items)+'</section>';
    }).join('');
  }

  function groupedReport(items, getter, title, icon){
    var entries = group(items, getter);
    if(!entries.length) return '<div class="empty">Nenhum aluno encontrado para os filtros escolhidos.</div>';
    return summaryCards(items)+entries.map(function(entry,index){
      return section(entry[0], icon, '<div style="padding-top:10px">'+summaryCards(entry[1])+studentRows(entry[1])+'</div>', index===0);
    }).join('');
  }

  function historyReport(items){
    if(!items.length) return '<div class="empty">Nenhum aluno encontrado para os filtros escolhidos.</div>';
    return summaryCards(items)+items.map(function(item){
      var steps = [1,2,3].map(function(moduleNumber){
        var current = item.moduleNumber;
        var status = moduleNumber < current ? 'Concluído' : moduleNumber === current ? 'Módulo ativo' : 'Próximo módulo';
        return '<div class="step"><b>'+esc(moduleLabel(moduleNumber))+'</b><div class="student-meta">'+esc(status)+'</div></div>';
      }).join('');
      return '<div class="person"><div class="person-title">'+esc(item.name)+'</div><div class="student-meta">'+esc(item.team)+' · '+esc(item.turma)+' · Revisão '+esc(item.review)+'</div><div class="student-tags"><span class="tag '+(item.status==='DESISTENTE'?'red':'green')+'">'+esc(item.status)+'</span><span class="tag green">'+item.attendance.pct+'% presença</span><span class="tag red">'+item.attendance.absence+' faltas</span></div><div class="route">'+steps+'</div></div>';
    }).join('');
  }

  function tabsScript(){
    return `<script>(function(){var root=document;root.querySelectorAll('.tab[data-tab]').forEach(function(button){button.addEventListener('click',function(){var key=button.getAttribute('data-tab');root.querySelectorAll('.tab[data-tab]').forEach(function(item){item.classList.toggle('active',item===button)});root.querySelectorAll('.pane[data-pane]').forEach(function(pane){pane.classList.toggle('active',pane.getAttribute('data-pane')===key)});});});})();<\/script>`;
  }

  function buildHtml(type, moduleFilter, reviewFilter, title, version){
    var typeNames = {
      visao:'Visão Geral atual',
      alunos:'Relatório geral dos alunos',
      modulo:'Relatório por módulo',
      turma:'Relatório por turma',
      revisao:'Relatório por Revisão',
      caminho:'Histórico de um Vencedor'
    };
    var reportName = typeNames[type] || 'Relatório';
    var base = students(moduleFilter, '', true);
    var filtered = type === 'visao' ? base : students(moduleFilter, reviewFilter, false);
    var body = '';

    if(type === 'visao') body = overviewTabs(base, reviewFilter);
    else if(type === 'alunos') body = summaryCards(filtered)+section('Lista geral dos alunos','☰',studentRows(filtered),true);
    else if(type === 'modulo') body = groupedReport(filtered,function(item){return item.module;},'Módulo','▥');
    else if(type === 'turma') body = groupedReport(filtered,function(item){return item.turma;},'Turma','◫');
    else if(type === 'revisao') body = groupedReport(filtered,function(item){return item.reviewKey ? 'Revisão '+item.review : 'Sem revisão';},'Revisão','✦');
    else if(type === 'caminho') body = historyReport(filtered);

    var moduleText = moduleFilter === 'todos' ? 'Todos os módulos' : moduleLabel(moduleFilter);
    var reviewText = reviewFilter ? (reviewFilter === '__none__' ? 'Sem revisão' : review().label(reviewFilter)) : 'Todas as revisões';
    var dateText = new Date().toLocaleString('pt-BR',{day:'2-digit',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'});

    return '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(title)+' — '+esc(reportName)+'</title>'+reportCss(version)+'</head><body><main class="shell"><header class="hero"><span class="eyebrow">Relatório Premium · '+(version==='web'?'Web':'Mobile')+'</span><div class="title">'+esc(title)+'</div><div class="meta">'+esc(reportName)+'<br>'+esc(moduleText)+' · '+esc(type==='visao'?'Revisões disponíveis em abas':reviewText)+'<br>Gerado em '+esc(dateText)+'</div></header><section class="content">'+body+'</section><div class="footer">Instituto de Vencedores · Sistema de Gestão</div></main>'+tabsScript()+'</body></html>';
  }

  function reportTypeName(type){
    return {
      visao:'Visão Geral atual',
      alunos:'Relatório geral dos alunos',
      modulo:'Relatório por módulo',
      turma:'Relatório por turma',
      revisao:'Relatório por Revisão',
      caminho:'Histórico de um Vencedor'
    }[type] || 'Relatório';
  }

  async function generateReport(){
    ensurePage();
    var moduleFilter = (document.getElementById('exp-modulo') || {}).value || 'todos';
    var reviewFilter = (document.getElementById('exp-revisao') || {}).value || '';
    var type = (document.getElementById('exp-tipo') || {}).value || 'visao';
    var title = (document.getElementById('exp-titulo') || {}).value || 'Instituto de Vencedores';
    var version = reportVersion === 'web' ? 'web' : 'mobile';
    var html = buildHtml(type,moduleFilter,reviewFilter,title,version);
    var modules = moduleFilter === 'todos' ? [1,2,3] : [number(moduleFilter)];
    var lastWeek = [];
    try { if(typeof detectarUltimaSemana === 'function') lastWeek = detectarUltimaSemana(modules); }
    catch(e){}

    if(typeof toast === 'function') toast('Gerando link, aguarde...⏳');
    try{
      var id = 'r'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
      var firebase = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
      await firebase.setDoc(firebase.doc(firebase.getFirestore(),'relatorios',id),{
        html:html,
        titulo:title,
        tipo:reportTypeName(type),
        versao:version,
        revisao:reviewFilter || 'todas',
        modulo:moduleFilter,
        criadoEm:new Date().toISOString()
      });

      var link = location.origin+'/relatorio?id='+id;
      var input = document.getElementById('link-gerado');
      if(input) input.value = link;
      window._ultimaSemana = lastWeek;
      var suffix = reviewFilter ? ' — '+(reviewFilter==='__none__'?'Sem revisão':review().label(reviewFilter)) : '';
      window._tipoRelatorioAtual = reportTypeName(type)+suffix;
      var preview = document.getElementById('whats-preview');
      if(preview && typeof montarMensagemWhats === 'function') preview.textContent = montarMensagemWhats(link,lastWeek,window._tipoRelatorioAtual);
      var modal = document.getElementById('modal-link');
      if(modal) modal.style.display = 'flex';
      if(typeof registrarAlteracaoIV === 'function') registrarAlteracaoIV('relatorio','Gerou relatório',reportTypeName(type),moduleFilter+' · '+(reviewFilter||'todas as revisões'));
      if(typeof toast === 'function') toast('Link gerado! ✓');
      return link;
    }catch(error){
      console.error(error);
      if(typeof toast === 'function') toast('Erro ao gerar link. Tente novamente.',true);
      throw error;
    }
  }

  function installGenerator(){
    window.gerarRelatorioLink = generateReport;
    window.gerarRelatorioLink._ivRevSafe = 1;
    window.gerarRelatorioLink._ivReportsReviewPremium = 1;
    window.gerarRelatorio = function(){ return generateReport(); };
    window.gerarRelatorio._ivRevSafe = 1;
    window.gerarRelatorio._ivReportsReviewPremium = 1;
  }

  function init(){
    ensurePage();
    installGenerator();
  }

  ready(function(){
    init();
    window.setTimeout(init,450);
    window.setTimeout(init,1300);
    window.setTimeout(init,2400);
  });
})();

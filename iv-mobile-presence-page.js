// IV - Presença mobile com faltas reais e cores dos módulos
(function(){
  'use strict';
  var mql=window.matchMedia('(max-width:820px)');
  function ready(fn){document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn()}
  function D(){try{return typeof DB!=='undefined'?DB:null}catch(e){return null}}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]})}
  function initials(name){return String(name||'?').trim().split(/\s+/).slice(0,2).map(function(p){return p.charAt(0).toUpperCase()}).join('')||'?'}
  function team(al){var db=D()||{};return(db.equipes||[]).find(function(e){return String(e.id)===String(al.equipeId)})||null}
  function moduleName(id){try{return MODULOS[id]&&MODULOS[id].nome?MODULOS[id].nome:id+'º Módulo'}catch(e){return id+'º Módulo'}}
  function loadCSS(){var l=document.getElementById('iv-mobile-presence-css');if(l){l.href='./iv-mobile-presence.css?v=2';return}l=document.createElement('link');l.id='iv-mobile-presence-css';l.rel='stylesheet';l.href='./iv-mobile-presence.css?v=2';document.head.appendChild(l)}
  function mobileClass(){document.body.classList.toggle('iv-mobile-app',!!mql.matches)}
  function box(){var page=document.getElementById('page-presenca');if(!page)return null;var b=document.getElementById('iv-mobile-presenca');if(!b){b=document.createElement('div');b.id='iv-mobile-presenca';page.insertBefore(b,page.firstChild)}return b}
  function palette(api,id){return api.modulePalette?api.modulePalette(id):(Number(id)===2?{color:'#7EDBA8',bg:'rgba(62,201,122,.18)',border:'rgba(62,201,122,.42)'}:Number(id)===3?{color:'#F08080',bg:'rgba(224,85,85,.18)',border:'rgba(224,85,85,.44)'}:{color:'#7EC8F0',bg:'rgba(47,128,237,.20)',border:'rgba(126,200,240,.44)'})}

  function card(al,slots,detail,api){
    var eq=team(al),own=slots.filter(function(x){return String(x.modulo)===String(al.modulo||'1')}),v=api.stats(al,own),content,moduleId=Number(al.modulo||1),p=palette(api,moduleId);
    if(detail){
      content=own.map(function(x){var db=D()||{},on=!!(db.presencas||{})[(typeof presKey==='function'?presKey(al.id,x.modulo,x.semana,x.aula):al.id+'_'+x.modulo+'_'+x.semana+'_'+x.aula)];return'<button type="button" class="iv-pres-aula '+(on?'sim':'nao')+'" data-act="toggle" data-id="'+al.id+'" data-mod="'+x.modulo+'" data-week="'+x.semana+'" data-aula="'+esc(x.aula)+'"><span>'+(on?'✅':'❌')+'</span><span>'+esc(x.aulaNome)+'</span></button>'}).join('');
    }else{
      content='<div class="iv-pres-aula nao"><span>❌</span><span>'+v.absence+' faltas</span></div><div class="iv-pres-aula"><span>📚</span><span>'+v.total+' aulas</span></div>';
    }
    return'<article class="iv-pres-card" style="--c:'+p.color+'" data-id="'+al.id+'"><div class="iv-pres-head"><div class="iv-pres-avatar">'+esc(initials(al.nome))+'</div><div><div class="iv-pres-name">'+esc(al.nome||'—')+'</div><div class="iv-pres-mini"><span class="iv-pres-pill">'+esc(al.inscricao||'Sem inscrição')+'</span><span class="iv-pres-pill">'+esc(eq?eq.nome:'Sem equipe')+'</span><span class="iv-pres-pill" style="color:'+p.color+';background:'+p.bg+';border-color:'+p.border+'">'+esc(moduleName(moduleId))+'</span></div></div><span class="iv-pres-pill total '+(v.absence?'no':'ok')+'">'+v.absence+' faltas</span></div><div class="iv-pres-aulas">'+content+'</div></article>';
  }

  function render(){
    var api=window.IVPresenceFilters,b=box(),db=D();if(!api||!b||!db)return;
    var state=api.getState(),list=api.students(),slots=api.slots(),detail=api.isDetail(),totalPresent=0,totalMax=0,totalAbsence=0;
    list.forEach(function(al){var own=slots.filter(function(x){return String(x.modulo)===String(al.modulo||'1')}),v=api.stats(al,own);totalPresent+=v.present;totalMax+=v.total;totalAbsence+=v.absence});
    b.innerHTML='<div class="iv-pres-hero"><div class="iv-pres-hero-top"><div><div class="iv-pres-title">Presença</div></div><div class="iv-pres-count"><strong>'+(detail?totalPresent+'/'+totalMax:totalAbsence)+'</strong><span>'+(detail?'Presenças':'Faltas')+'</span></div></div></div><div class="iv-pres-filters"><div class="iv-pres-grid"><select id="iv-pres-modulo" class="iv-pres-select">'+api.moduleOptions()+'</select><select id="iv-pres-semana" class="iv-pres-select">'+api.weekOptions()+'</select><select id="iv-pres-equipe" class="iv-pres-select">'+api.teamOptions()+'</select><input id="iv-pres-busca" class="iv-pres-search" placeholder="🔍 Buscar aluno..." value="'+esc(state.busca)+'"></div><div class="iv-pres-aula-info">📚 '+esc(api.description())+(detail?'':' · visão consolidada')+'</div></div><div class="iv-pres-actions"><button type="button" class="iv-pres-btn green" data-act="todos-sim">✅ Todos presentes</button><button type="button" class="iv-pres-btn red" data-act="todos-nao">❌ Todos ausentes</button></div><div class="iv-pres-list">'+(list.length?list.map(function(al){return card(al,slots,detail,api)}).join(''):'<div class="iv-pres-empty">Nenhum aluno ativo encontrado para os filtros.</div>')+'</div>';
  }

  function bind(){if(document.documentElement.dataset.ivMobilePresenceStable)return;document.documentElement.dataset.ivMobilePresenceStable='1';document.addEventListener('click',function(ev){var btn=ev.target&&ev.target.closest&&ev.target.closest('#iv-mobile-presenca [data-act]');if(!btn)return;var api=window.IVPresenceFilters;if(!api)return;var act=btn.dataset.act;if(act==='toggle')api.toggle(Number(btn.dataset.id),btn.dataset.mod,Number(btn.dataset.week),btn.dataset.aula);else if(act==='todos-sim')api.markAll(true);else if(act==='todos-nao')api.markAll(false)})}
  function init(){loadCSS();mobileClass();box();bind();var api=window.IVPresenceFilters;if(api){api.subscribe(render);render()}}
  ready(function(){init();setTimeout(init,450);setTimeout(init,1300);if(mql.addEventListener)mql.addEventListener('change',init);else if(mql.addListener)mql.addListener(init)});
})();
// IV - faltas reais e cores dos módulos na visão consolidada da Presença
(function(){
  'use strict';
  if(window.__IV_PRESENCE_REAL_ABSENCE_V2__) return;
  window.__IV_PRESENCE_REAL_ABSENCE_V2__ = true;

  var observer=null;
  var rendering=false;
  function D(){try{return typeof DB!=='undefined'?DB:null}catch(e){return null}}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]})}
  function key(id,m,w,a){try{return typeof presKey==='function'?presKey(id,m,w,a):id+'_'+m+'_'+w+'_'+a}catch(e){return id+'_'+m+'_'+w+'_'+a}}
  function own(o,k){return Object.prototype.hasOwnProperty.call(o||{},k)}
  function sid(x){return String(x.modulo)+'|'+String(x.semana)+'|'+String(x.aula)}
  function moduleName(id){try{return MODULOS[id]&&MODULOS[id].nome?MODULOS[id].nome:id+'º Módulo'}catch(e){return id+'º Módulo'}}
  function teamName(student,db){var item=(db.equipes||[]).find(function(team){return String(team.id)===String(student.equipeId)});return item?String(item.nome||''):''}
  function palette(id){id=Number(id||1);if(id===2)return{color:'#7EDBA8',bg:'rgba(62,201,122,.18)',border:'rgba(62,201,122,.44)'};if(id===3)return{color:'#F08080',bg:'rgba(224,85,85,.18)',border:'rgba(224,85,85,.46)'};return{color:'#7EC8F0',bg:'rgba(47,128,237,.20)',border:'rgba(126,200,240,.46)'}}
  function badge(id){var p=palette(id);return'<span class="badge" title="'+esc(moduleName(id))+'" style="font-size:10px;color:'+p.color+';background:'+p.bg+';border:1px solid '+p.border+'">'+esc(moduleName(id))+'</span>'}

  function startedMap(slots,db){
    var map=Object.create(null),pres=db.presencas||{},students=db.alunos||[];
    slots.forEach(function(slot){map[sid(slot)]=students.some(function(student){return own(pres,key(student.id,slot.modulo,slot.semana,slot.aula))})});
    return map;
  }

  function stats(student,slots,map,db){
    db=db||D()||{};map=map||startedMap(slots,db);
    var pres=db.presencas||{},present=0,absence=0,started=0;
    slots.forEach(function(slot){var value=!!pres[key(student.id,slot.modulo,slot.semana,slot.aula)],begun=!!map[sid(slot)];if(value)present++;if(begun){started++;if(!value)absence++}});
    return{present:present,absence:absence,total:slots.length,started:started};
  }

  function consolidated(api){var state=api.getState();return state.modulo==='todos'||state.semana==='todos'}

  function enhance(){
    var api=window.IVPresenceFilters,db=D(),body=document.getElementById('tb-presenca');
    if(!api||!db||!body||!consolidated(api)||rendering)return;
    var table=body.closest('table'),head=table&&table.querySelector('thead tr');if(!head)return;
    rendering=true;
    try{
      var students=api.students(),slots=api.slots(),started=startedMap(slots,db),totalAbsence=0;
      head.innerHTML='<th style="width:82px">Nº Insc.</th><th>Nome</th><th>Equipe</th><th>Módulo</th><th style="text-align:center">Faltas</th><th style="text-align:center">Aulas</th>';
      if(!students.length){body.innerHTML='<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--muted)">Nenhum aluno ativo encontrado para os filtros.</td></tr>'}
      else body.innerHTML=students.map(function(student){
        var moduleId=Number(student.modulo||1),team=teamName(student,db),ownSlots=slots.filter(function(slot){return String(slot.modulo)===String(moduleId)}),value=stats(student,ownSlots,started,db);totalAbsence+=value.absence;
        return'<tr><td style="color:var(--muted);font-size:11px">'+esc(student.inscricao||'—')+'</td><td><strong>'+esc(student.nome||'—')+'</strong></td><td>'+(team?'<span class="badge badge-b" style="font-size:10px">'+esc(team)+'</span>':'<span style="color:var(--muted)">—</span>')+'</td><td>'+badge(moduleId)+'</td><td style="text-align:center;color:'+(value.absence?'var(--red)':'var(--muted)')+';font-weight:900">'+value.absence+'</td><td style="text-align:center;color:var(--blue-l);font-weight:900">'+value.total+'</td></tr>';
      }).join('');
      var count=document.getElementById('pres-contador');if(count)count.textContent=totalAbsence+' falta(s) registrada(s) · '+students.length+' aluno(s)';
    }finally{rendering=false}
  }

  function watch(){
    var body=document.getElementById('tb-presenca'),table=body&&body.closest('table');if(!table||observer)return;
    observer=new MutationObserver(function(){if(rendering)return;var api=window.IVPresenceFilters,head=table.querySelector('thead tr');if(api&&consolidated(api)&&head&&/Presentes/i.test(head.textContent||''))setTimeout(enhance,0)});
    observer.observe(table,{childList:true,subtree:true});
  }

  function init(){
    var api=window.IVPresenceFilters;if(!api)return;
    api.stats=function(student,slots){return stats(student,slots,null,D()||{})};
    api.modulePalette=palette;
    api.subscribe(enhance);
    watch();
    api.render();
    setTimeout(enhance,80);
    setTimeout(enhance,260);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  setTimeout(init,500);
  setTimeout(init,1400);
})();
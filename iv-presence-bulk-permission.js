// IV - permissao para os botoes de presenca em massa
(function(){
  'use strict';
  if(window.__IV_PRESENCE_BULK_PERMISSION__) return;
  window.__IV_PRESENCE_BULK_PERMISSION__=true;
  var KEY='presenca_bulk',observer=null,timer=null;

  function can(key){try{return typeof window.userCan==='function'&&window.userCan(key)===true}catch(e){return false}}
  function allowed(absent){return can(KEY)&&can(absent?'presenca_edit':'presenca_launch')}
  function denied(absent){var msg=absent?'Você não tem permissão para marcar todos os alunos como ausentes.':'Você não tem permissão para marcar todos os alunos como presentes.';try{if(typeof window.toast==='function')window.toast(msg,true)}catch(e){}return false}

  function schema(){
    try{if(typeof PERMISSOES_LABELS==='object')PERMISSOES_LABELS[KEY]='Presença: ações em massa'}catch(e){}
    try{if(typeof PERFIS_PERMISSOES==='object')Object.keys(PERFIS_PERMISSOES).forEach(function(name){var p=PERFIS_PERMISSOES[name]||{};if(!(KEY in p))p[KEY]=String(name).toLowerCase()==='administrador'})}catch(e){}
  }

  function card(){
    var input=document.querySelector('.usr-perm[value="'+KEY+'"]');if(input)return input;
    var titles=document.querySelectorAll('#page-usuarios .perm-section-title'),section=null;
    for(var i=0;i<titles.length;i++)if(String(titles[i].textContent||'').trim().toLowerCase()==='presença'){section=titles[i].closest('.perm-section');break}
    var grid=section&&section.querySelector('.perm-grid');if(!grid)return null;
    var label=document.createElement('label');label.className='perm-card';label.innerHTML='<input type="checkbox" class="usr-perm" value="'+KEY+'"> <span>Ações em massa<small>Permitir os botões Todos presentes e Todos ausentes.</small></span>';grid.appendChild(label);
    input=label.querySelector('input');var profile=(document.getElementById('usr-perfil')||{}).value||'';
    try{input.checked=!!(PERFIS_PERMISSOES[profile]&&PERFIS_PERMISSOES[profile][KEY])}catch(e){input.checked=profile==='administrador'}
    try{if(typeof window.atualizarResumoPermissoesUsuario==='function')window.atualizarResumoPermissoesUsuario()}catch(e){}
    return input;
  }

  function kind(el){var a=el&&el.getAttribute('data-act')||'',o=el&&el.getAttribute('onclick')||'';if(a==='todos-nao'||/marcarTodos\s*\(\s*false/i.test(o))return'absent';if(a==='todos-sim'||/marcarTodos\s*\(\s*true/i.test(o))return'present';return''}
  function buttons(){return document.querySelectorAll('#page-presenca button[onclick*="marcarTodos"],#iv-mobile-presenca [data-act="todos-sim"],#iv-mobile-presenca [data-act="todos-nao"]')}
  function visibility(){buttons().forEach(function(b){var k=kind(b),ok=k&&allowed(k==='absent');if(ok){b.removeAttribute('data-iv-bulk-denied');b.removeAttribute('aria-hidden')}else{b.setAttribute('data-iv-bulk-denied','1');b.setAttribute('aria-hidden','true')}})}

  function guardGlobal(){var fn=window.marcarTodos;if(typeof fn!=='function'||fn._ivBulk)return;var g=function(on){var absent=on===false;if(!allowed(absent))return denied(absent);return fn.apply(this,arguments)};g._ivBulk=true;window.marcarTodos=g}
  function guardApi(){var api=window.IVPresenceFilters;if(!api)return;var fn=api.markAll;if(typeof fn==='function'&&!fn._ivBulk){var g=function(on){var absent=on===false;if(!allowed(absent))return denied(absent);return fn.apply(this,arguments)};g._ivBulk=true;api.markAll=g}if(typeof api.subscribe==='function'&&!api._ivBulkSub){api._ivBulkSub=true;api.subscribe(function(){setTimeout(visibility,0)})}}
  function observe(){var page=document.getElementById('page-presenca');if(!page||observer)return;observer=new MutationObserver(function(){schedule()});observer.observe(page,{childList:true,subtree:true})}
  function style(){if(document.getElementById('iv-presence-bulk-permission-style'))return;var s=document.createElement('style');s.id='iv-presence-bulk-permission-style';s.textContent='[data-iv-bulk-denied="1"]{display:none!important}';document.head.appendChild(s)}
  function refresh(){schema();card();style();guardGlobal();guardApi();observe();visibility()}
  function schedule(){clearTimeout(timer);timer=setTimeout(refresh,20);[120,500,1300,2600].forEach(function(ms){setTimeout(refresh,ms)})}

  document.addEventListener('click',function(e){var b=e.target&&e.target.closest&&e.target.closest('#page-presenca button[onclick*="marcarTodos"],#iv-mobile-presenca [data-act="todos-sim"],#iv-mobile-presenca [data-act="todos-nao"]');if(!b)return;var k=kind(b),absent=k==='absent';if(k&&!allowed(absent)){e.preventDefault();e.stopImmediatePropagation();denied(absent)}},true);
  document.addEventListener('change',function(e){if(e.target&&(e.target.id==='usr-perfil'||e.target.classList.contains('usr-perm')))setTimeout(function(){card();visibility()},0)},true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
  document.addEventListener('firebase-ready',schedule);window.addEventListener('pageshow',schedule);window.addEventListener('focus',schedule);window.addEventListener('iv-concurrency-saved',schedule);
})();
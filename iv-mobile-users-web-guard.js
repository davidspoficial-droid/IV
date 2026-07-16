// IV - separa a sanfona mobile da pagina Usuarios no modo Web
(function(){
  'use strict';
  if(window.__IV_MOBILE_USERS_WEB_GUARD__) return;
  window.__IV_MOBILE_USERS_WEB_GUARD__ = true;

  var media = window.matchMedia('(max-width: 820px)');

  function addStyle(){
    if(document.getElementById('iv-mobile-users-web-guard-style')) return;
    var style = document.createElement('style');
    style.id = 'iv-mobile-users-web-guard-style';
    style.textContent = `
      .iv-mobile-user-form-toggle{display:none!important}
      @media(max-width:820px){
        body.iv-mobile-app .iv-mobile-user-form-toggle{display:flex!important}
      }
      @media(min-width:821px){
        #page-usuarios>.card:first-of-type.iv-mobile-form-collapsed>:not(.iv-mobile-user-form-toggle){display:initial!important}
        #page-usuarios>.card:first-of-type.iv-mobile-form-collapsed>.form-row{display:grid!important}
        #page-usuarios>.card:first-of-type.iv-mobile-form-collapsed>.perm-toolbar{display:flex!important}
        #page-usuarios>.card:first-of-type.iv-mobile-form-collapsed>.perm-section{display:grid!important}
      }
    `;
    document.head.appendChild(style);
  }

  function apply(){
    addStyle();
    var page = document.getElementById('page-usuarios');
    if(!page) return;
    var card = page.querySelector(':scope > .card:first-of-type');
    if(!card) return;

    if(!media.matches){
      card.classList.remove('iv-mobile-form-collapsed');
      var toggle = card.querySelector('.iv-mobile-user-form-toggle');
      if(toggle) toggle.remove();
      return;
    }

    // No Mobile, o modulo premium recria a sanfona quando necessario.
    if(typeof window.renderUsuarios === 'function'){
      window.setTimeout(function(){
        try{window.renderUsuarios();}catch(error){}
      },30);
    }
  }

  function schedule(){
    [0,80,300,700,1600].forEach(function(delay){window.setTimeout(apply,delay);});
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',schedule,{once:true});
  else schedule();
  window.addEventListener('pageshow',schedule);
  if(media.addEventListener) media.addEventListener('change',schedule);
  else if(media.addListener) media.addListener(schedule);
})();
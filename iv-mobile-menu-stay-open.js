// IV - mantém o menu mobile aberto até ação explícita do usuário
(function(){
  'use strict';
  if(window.__IV_MOBILE_MENU_STAY_OPEN__) return;
  window.__IV_MOBILE_MENU_STAY_OPEN__=true;

  var OPEN_CLASS='iv-mobile-menu-user-open';

  function body(){return document.body;}
  function isOpen(){var b=body();return !!b&&(b.classList.contains(OPEN_CLASS)||b.classList.contains('iv-mobile-menu-open'));}
  function setLabel(open){var button=document.getElementById('iv-mobile-menu-toggle');if(button)button.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');}

  function open(){
    var b=body();if(!b)return;
    b.classList.add(OPEN_CLASS,'iv-mobile-menu-open');
    b.classList.remove('mobile-menu-open');
    setLabel(true);
  }

  function close(){
    var b=body();if(!b)return;
    b.classList.remove(OPEN_CLASS,'iv-mobile-menu-open','mobile-menu-open');
    setLabel(false);
  }

  function style(){
    if(document.getElementById('iv-mobile-menu-stay-open-style'))return;
    var element=document.createElement('style');
    element.id='iv-mobile-menu-stay-open-style';
    element.textContent='@media(max-width:820px){body.iv-mobile-app.'+OPEN_CLASS+'{overflow:hidden!important}body.iv-mobile-app.'+OPEN_CLASS+' .main-nav{transform:translateX(0)!important}body.iv-mobile-app.'+OPEN_CLASS+' .iv-mobile-menu-backdrop{opacity:1!important;pointer-events:auto!important}body.iv-mobile-app.'+OPEN_CLASS+' .iv-mobile-menu-lines{transform:rotate(45deg)!important}body.iv-mobile-app.'+OPEN_CLASS+' .iv-mobile-menu-lines::before{top:0!important;transform:rotate(90deg)!important}body.iv-mobile-app.'+OPEN_CLASS+' .iv-mobile-menu-lines::after{top:0!important;opacity:0!important}}';
    document.head.appendChild(element);
  }

  document.addEventListener('click',function(event){
    var toggle=event.target&&event.target.closest&&event.target.closest('#iv-mobile-menu-toggle,.iv-mobile-menu-toggle');
    if(toggle){
      event.preventDefault();
      event.stopImmediatePropagation();
      if(isOpen())close();else open();
      return;
    }

    var navButton=event.target&&event.target.closest&&event.target.closest('.main-nav .mnav');
    var backdrop=event.target&&event.target.closest&&event.target.closest('#iv-mobile-menu-backdrop,.iv-mobile-menu-backdrop');
    var logout=event.target&&event.target.closest&&event.target.closest('.auth-logout');
    if(navButton||backdrop||logout)close();
  },true);

  function init(){style();close();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();

  window.IVMobileMenuControl={open:open,close:close,isOpen:isOpen};
})();
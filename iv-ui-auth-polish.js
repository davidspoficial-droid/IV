// IV - acabamento do cabeçalho de alunos e carregamento seguro da autenticação
(function(){
  'use strict';

  function ready(fn){
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, {once:true});
    else fn();
  }

  function ensureMeta(){
    if(!document.querySelector('meta[name="mobile-web-app-capable"]')){
      var meta = document.createElement('meta');
      meta.name = 'mobile-web-app-capable';
      meta.content = 'yes';
      document.head.appendChild(meta);
    }
  }

  function associatePasswordFields(){
    var authForm = document.getElementById('iv-auth-form');
    if(!authForm){
      authForm = document.createElement('form');
      authForm.id = 'iv-auth-form';
      authForm.style.display = 'none';
      authForm.addEventListener('submit', function(ev){
        ev.preventDefault();
        if(typeof window.entrarSistema === 'function') window.entrarSistema();
      });
      document.body.appendChild(authForm);
    }

    ['auth-email','auth-senha'].forEach(function(id){
      var field = document.getElementById(id);
      if(field) field.setAttribute('form','iv-auth-form');
    });

    var enter = document.querySelector('#auth-screen .auth-enter-btn');
    if(enter){
      enter.type = 'submit';
      enter.setAttribute('form','iv-auth-form');
    }

    var userForm = document.getElementById('iv-user-password-form');
    if(!userForm){
      userForm = document.createElement('form');
      userForm.id = 'iv-user-password-form';
      userForm.style.display = 'none';
      document.body.appendChild(userForm);
    }
    var userPassword = document.getElementById('usr-senha');
    if(userPassword) userPassword.setAttribute('form','iv-user-password-form');
  }

  function removeStudentTitleExtras(){
    document.querySelectorAll('.iv-student-title-icon,.iv-mobile-student-icon,.iv-student-title-sub').forEach(function(el){
      el.remove();
    });
  }

  function loader(){ return document.getElementById('iv-auth-loader'); }

  function ensureLoader(){
    if(!document.body || !document.body.classList.contains('auth-lock')) return null;
    var overlay = loader();
    if(!overlay){
      overlay = document.createElement('div');
      overlay.id = 'iv-auth-loader';
      overlay.setAttribute('role','status');
      overlay.setAttribute('aria-label','Validando acesso');
      overlay.innerHTML = '<div class="loader"><div class="inner one"></div><div class="inner two"></div><div class="inner three"></div></div><div class="iv-auth-loader-text">Validando acesso...</div>';
      document.body.appendChild(overlay);
    }
    document.body.classList.add('iv-auth-validating');
    return overlay;
  }

  function finishLoading(){
    document.body.classList.remove('iv-auth-validating');
    var overlay = loader();
    if(overlay){
      overlay.classList.add('is-leaving');
      window.setTimeout(function(){ if(overlay.parentNode) overlay.remove(); }, 220);
    }
  }

  function listenAuth(){
    var attach = function(){
      if(!window._firebase || typeof window._firebase.onAuth !== 'function') return false;
      window._firebase.onAuth(function(){ finishLoading(); });
      return true;
    };

    if(!attach()){
      document.addEventListener('firebase-ready', function(){ attach(); }, {once:true});
    }

    // Segurança: nunca mantém a interface coberta indefinidamente se o serviço externo falhar.
    window.setTimeout(finishLoading, 10000);
  }

  function ensureStyle(){
    if(document.getElementById('iv-ui-auth-polish-style')) return;
    var style = document.createElement('style');
    style.id = 'iv-ui-auth-polish-style';
    style.textContent = '\
      .iv-student-title-icon,.iv-mobile-student-icon,.iv-student-title-sub{display:none!important}\
      .iv-premium-student-title{gap:0!important}\
      .iv-premium-student-title>span:nth-child(2){display:flex;align-items:center;min-width:0}\
      body.iv-auth-validating #auth-screen{visibility:hidden!important;opacity:0!important;pointer-events:none!important}\
      #iv-auth-loader{position:fixed;inset:0;z-index:1000001;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;background-image:radial-gradient(circle farthest-corner at center,#3C4B57 0%,#1C262B 100%);opacity:1;transition:opacity .2s ease;isolation:isolate}\
      #iv-auth-loader.is-leaving{opacity:0;pointer-events:none}\
      #iv-auth-loader .loader{position:relative;width:64px;height:64px;border-radius:50%;perspective:800px}\
      #iv-auth-loader .inner{position:absolute;box-sizing:border-box;width:100%;height:100%;border-radius:50%}\
      #iv-auth-loader .inner.one{left:0;top:0;animation:iv-rotate-one 1s linear infinite;border-bottom:3px solid #EFEFFA}\
      #iv-auth-loader .inner.two{right:0;top:0;animation:iv-rotate-two 1s linear infinite;border-right:3px solid #EFEFFA}\
      #iv-auth-loader .inner.three{right:0;bottom:0;animation:iv-rotate-three 1s linear infinite;border-top:3px solid #EFEFFA}\
      .iv-auth-loader-text{font-family:"DM Sans",sans-serif;font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#EFEFFA;text-shadow:0 8px 24px rgba(0,0,0,.42)}\
      @keyframes iv-rotate-one{0%{transform:rotateX(35deg) rotateY(-45deg) rotateZ(0deg)}100%{transform:rotateX(35deg) rotateY(-45deg) rotateZ(360deg)}}\
      @keyframes iv-rotate-two{0%{transform:rotateX(50deg) rotateY(10deg) rotateZ(0deg)}100%{transform:rotateX(50deg) rotateY(10deg) rotateZ(360deg)}}\
      @keyframes iv-rotate-three{0%{transform:rotateX(35deg) rotateY(55deg) rotateZ(0deg)}100%{transform:rotateX(35deg) rotateY(55deg) rotateZ(360deg)}}\
      @media(prefers-reduced-motion:reduce){#iv-auth-loader .inner{animation-duration:2.4s!important}}';
    document.head.appendChild(style);
  }

  ready(function(){
    ensureStyle();
    ensureMeta();
    associatePasswordFields();
    ensureLoader();
    listenAuth();
    removeStudentTitleExtras();
    window.setTimeout(removeStudentTitleExtras, 1500);
    window.setTimeout(removeStudentTitleExtras, 3000);
  });
})();
// IV - menu mobile hamburger premium
(function(){
  'use strict';

  var STYLE_ID = 'iv-mobile-hamburger-menu-style';
  var mql = window.matchMedia('(max-width: 820px)');

  function ready(fn){
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, {once:true});
    else fn();
  }

  function ensureStyle(){
    if(document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
      .iv-mobile-menu-toggle,
      .iv-mobile-menu-backdrop{display:none;}

      @media(max-width:820px){
        body.iv-mobile-app{padding-bottom:16px!important;}
        body.iv-mobile-app.mobile-menu-open::after{display:none!important;content:none!important;}

        body.iv-mobile-app .header{
          padding:8px 10px 8px 12px!important;
          gap:8px!important;
        }

        body.iv-mobile-app .brand-area{
          flex:1 1 auto!important;
          min-width:0!important;
        }

        body.iv-mobile-app .auth-logout{
          margin-left:0!important;
          order:3!important;
        }

        .iv-mobile-menu-toggle{
          order:2;
          width:40px!important;
          height:40px!important;
          padding:0!important;
          margin-left:auto!important;
          border-radius:15px!important;
          border:1px solid rgba(126,200,240,.34)!important;
          background:
            radial-gradient(circle at 28% 18%,rgba(255,255,255,.18),transparent 34%),
            linear-gradient(145deg,rgba(126,200,240,.16),rgba(47,128,237,.10)),
            rgba(7,17,31,.90)!important;
          box-shadow:
            0 14px 28px rgba(0,0,0,.34),
            0 0 22px rgba(126,200,240,.16),
            inset 0 1px 0 rgba(255,255,255,.10)!important;
          color:#DFF6FF!important;
          display:inline-flex!important;
          align-items:center!important;
          justify-content:center!important;
          position:relative!important;
          z-index:9002!important;
          cursor:pointer!important;
          transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease,background .18s ease!important;
        }
        .iv-mobile-menu-toggle:hover,
        .iv-mobile-menu-toggle:active{
          transform:translateY(-1px) scale(1.02)!important;
          border-color:rgba(126,200,240,.68)!important;
          box-shadow:
            0 18px 36px rgba(0,0,0,.42),
            0 0 30px rgba(126,200,240,.28),
            inset 0 1px 0 rgba(255,255,255,.16)!important;
        }
        .iv-mobile-menu-lines,
        .iv-mobile-menu-lines::before,
        .iv-mobile-menu-lines::after{
          content:"";
          width:19px;
          height:2px;
          border-radius:999px;
          background:linear-gradient(90deg,#FFFFFF,#BFEAFF,#7EC8F0);
          display:block;
          position:absolute;
          box-shadow:0 0 10px rgba(126,200,240,.55);
          transition:transform .22s ease,top .22s ease,opacity .18s ease;
        }
        .iv-mobile-menu-lines{top:19px;left:10px;}
        .iv-mobile-menu-lines::before{top:-7px;left:0;}
        .iv-mobile-menu-lines::after{top:7px;left:0;}
        body.iv-mobile-menu-open .iv-mobile-menu-lines{transform:rotate(45deg);}
        body.iv-mobile-menu-open .iv-mobile-menu-lines::before{top:0;transform:rotate(90deg);}
        body.iv-mobile-menu-open .iv-mobile-menu-lines::after{top:0;opacity:0;}

        .iv-mobile-menu-backdrop{
          position:fixed;
          inset:0;
          z-index:7900;
          background:rgba(0,0,0,.58);
          backdrop-filter:blur(7px);
          -webkit-backdrop-filter:blur(7px);
          opacity:0;
          pointer-events:none;
          display:block!important;
          transition:opacity .22s ease;
        }
        body.iv-mobile-menu-open .iv-mobile-menu-backdrop{
          opacity:1;
          pointer-events:auto;
        }
        body.iv-mobile-menu-open{overflow:hidden!important;}

        body.iv-mobile-app .main-nav{
          position:fixed!important;
          top:0!important;
          left:0!important;
          right:auto!important;
          bottom:0!important;
          width:min(326px,86vw)!important;
          height:100dvh!important;
          z-index:8001!important;
          display:flex!important;
          flex-direction:column!important;
          gap:8px!important;
          padding:88px 14px 18px!important;
          border:0!important;
          border-right:1px solid rgba(126,200,240,.18)!important;
          border-radius:0 28px 28px 0!important;
          background:
            radial-gradient(circle at 20% 0%,rgba(47,128,237,.28),transparent 34%),
            radial-gradient(circle at 78% 18%,rgba(34,211,238,.12),transparent 32%),
            linear-gradient(180deg,rgba(7,17,31,.98),rgba(3,7,18,.98))!important;
          box-shadow:
            24px 0 58px rgba(0,0,0,.62),
            inset -1px 0 0 rgba(255,255,255,.04)!important;
          backdrop-filter:blur(22px)!important;
          -webkit-backdrop-filter:blur(22px)!important;
          transform:translateX(-112%)!important;
          transition:transform .28s cubic-bezier(.2,.8,.2,1)!important;
          overflow-y:auto!important;
          overflow-x:hidden!important;
        }
        body.iv-mobile-app .main-nav::before{
          content:"Menu"!important;
          position:absolute!important;
          top:18px!important;
          left:16px!important;
          right:16px!important;
          height:46px!important;
          display:flex!important;
          align-items:center!important;
          color:#F6FBFF!important;
          font-size:22px!important;
          font-weight:950!important;
          letter-spacing:.02em!important;
          border-bottom:1px solid rgba(126,200,240,.16)!important;
          padding-bottom:13px!important;
          background:linear-gradient(90deg,#FFFFFF,#BFEAFF 62%,#7EC8F0);
          -webkit-background-clip:text;
          background-clip:text;
          -webkit-text-fill-color:transparent;
        }
        body.iv-mobile-app.iv-mobile-menu-open .main-nav{
          transform:translateX(0)!important;
        }

        body.iv-mobile-app .mnav{
          width:100%!important;
          height:48px!important;
          min-height:48px!important;
          min-width:0!important;
          padding:0 13px!important;
          border-radius:17px!important;
          display:flex!important;
          align-items:center!important;
          justify-content:flex-start!important;
          text-align:left!important;
          white-space:nowrap!important;
          font-size:13px!important;
          line-height:1!important;
          font-weight:850!important;
          color:#B9CBE2!important;
          border:1px solid rgba(126,200,240,.10)!important;
          background:linear-gradient(145deg,rgba(255,255,255,.045),rgba(255,255,255,.010))!important;
          box-shadow:0 10px 22px rgba(0,0,0,.16),inset 0 1px 0 rgba(255,255,255,.04)!important;
          transition:transform .16s ease,border-color .16s ease,background .16s ease,box-shadow .16s ease,color .16s ease!important;
        }
        body.iv-mobile-app .mnav:hover,
        body.iv-mobile-app .mnav:active{
          transform:translateX(2px)!important;
          color:#FFFFFF!important;
          border-color:rgba(126,200,240,.30)!important;
          background:linear-gradient(145deg,rgba(126,200,240,.10),rgba(255,255,255,.018))!important;
        }
        body.iv-mobile-app .mnav.active{
          color:#FFFFFF!important;
          border-color:rgba(126,200,240,.52)!important;
          background:
            radial-gradient(circle at 18% 0%,rgba(255,255,255,.20),transparent 36%),
            linear-gradient(135deg,rgba(47,128,237,.92),rgba(34,211,238,.76))!important;
          box-shadow:
            0 15px 34px rgba(47,128,237,.30),
            0 0 24px rgba(126,200,240,.18),
            inset 0 1px 0 rgba(255,255,255,.18)!important;
        }
      }
    `;
    document.head.appendChild(s);
  }

  function ensureButton(){
    var header = document.querySelector('.header');
    if(!header) return;

    var btn = document.getElementById('iv-mobile-menu-toggle');
    if(!btn){
      btn = document.createElement('button');
      btn.id = 'iv-mobile-menu-toggle';
      btn.className = 'iv-mobile-menu-toggle';
      btn.type = 'button';
      btn.setAttribute('aria-label','Abrir menu');
      btn.innerHTML = '<span class="iv-mobile-menu-lines" aria-hidden="true"></span>';
      var logout = header.querySelector('.auth-logout');
      if(logout) header.insertBefore(btn, logout);
      else header.appendChild(btn);
    }

    if(!btn.dataset.ivMenuReady){
      btn.dataset.ivMenuReady = '1';
      btn.addEventListener('click', function(ev){
        ev.preventDefault();
        ev.stopPropagation();
        toggleMenu();
      });
    }
  }

  function ensureBackdrop(){
    var back = document.getElementById('iv-mobile-menu-backdrop');
    if(!back){
      back = document.createElement('div');
      back.id = 'iv-mobile-menu-backdrop';
      back.className = 'iv-mobile-menu-backdrop';
      document.body.appendChild(back);
    }
    if(!back.dataset.ivMenuReady){
      back.dataset.ivMenuReady = '1';
      back.addEventListener('click', closeMenu);
    }
  }

  function openMenu(){
    document.body.classList.remove('mobile-menu-open');
    document.body.classList.add('iv-mobile-menu-open');
    var btn = document.getElementById('iv-mobile-menu-toggle');
    if(btn) btn.setAttribute('aria-label','Fechar menu');
  }

  function closeMenu(){
    document.body.classList.remove('iv-mobile-menu-open');
    document.body.classList.remove('mobile-menu-open');
    var btn = document.getElementById('iv-mobile-menu-toggle');
    if(btn) btn.setAttribute('aria-label','Abrir menu');
  }

  function toggleMenu(){
    if(document.body.classList.contains('iv-mobile-menu-open')) closeMenu();
    else openMenu();
  }

  function patchNavClicks(){
    document.querySelectorAll('.main-nav .mnav').forEach(function(btn){
      if(btn.dataset.ivHamburgerClose) return;
      btn.dataset.ivHamburgerClose = '1';
      btn.addEventListener('click', function(){ setTimeout(closeMenu, 80); });
    });
  }

  function setMobileClass(){
    document.body.classList.toggle('iv-mobile-app', !!mql.matches);
    if(!mql.matches) closeMenu();
  }

  function aplicar(){
    ensureStyle();
    setMobileClass();
    ensureButton();
    ensureBackdrop();
    patchNavClicks();
  }

  ready(function(){
    aplicar();
    setTimeout(aplicar, 350);
    setTimeout(aplicar, 1000);
    if(mql.addEventListener) mql.addEventListener('change', aplicar);
    else if(mql.addListener) mql.addListener(aplicar);
  });
})();

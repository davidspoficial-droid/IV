// IV - dashboard mobile seguro: mantém o conteúdo original e adiciona somente o título premium
(function(){
  'use strict';

  var STYLE_ID = 'iv-mobile-dashboard-menu-style';
  var TITLE_ID = 'iv-mobile-dashboard-title';
  var mql = window.matchMedia('(max-width: 820px)');

  function ready(fn){
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, {once:true});
    else fn();
  }

  function ensureStyle(){
    var old = document.getElementById(STYLE_ID);
    if(old) old.remove();

    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #${TITLE_ID}{display:none}
      @media(max-width:820px){
        body.iv-mobile-app #page-dashboard{
          width:100%!important;
          max-width:100%!important;
          padding:14px 10px 28px!important;
          margin:0!important;
        }
        body.iv-mobile-app #${TITLE_ID}{
          position:relative;
          display:block!important;
          margin:0 0 14px;
          padding:20px 16px 18px;
          overflow:hidden;
          border:1px solid rgba(126,200,240,.20);
          border-radius:22px;
          background:radial-gradient(circle at 12% 0%,rgba(47,128,237,.28),transparent 38%),linear-gradient(145deg,rgba(255,255,255,.06),rgba(255,255,255,.012)),rgba(7,17,31,.82);
          box-shadow:0 18px 46px rgba(0,0,0,.30),inset 0 1px 0 rgba(255,255,255,.06);
          color:#fff;
          font-family:'Playfair Display',serif;
          font-size:27px;
          font-weight:950;
          line-height:1.05;
          letter-spacing:-.02em;
          text-shadow:0 8px 24px rgba(0,0,0,.35);
        }
        body.iv-mobile-app #${TITLE_ID}::after{
          content:'';
          position:absolute;
          left:16px;
          bottom:0;
          width:62px;
          height:3px;
          border-radius:999px;
          background:linear-gradient(90deg,#2F80ED,#22D3EE);
          box-shadow:0 0 18px rgba(34,211,238,.55);
        }
      }
    `;
    document.head.appendChild(style);
  }

  function removeLegacyDashboard(){
    var legacy = document.getElementById('iv-mobile-dashboard');
    if(legacy) legacy.remove();
  }

  function ensureTitle(){
    var page = document.getElementById('page-dashboard');
    if(!page) return;

    removeLegacyDashboard();

    var title = document.getElementById(TITLE_ID);
    if(!title){
      title = document.createElement('div');
      title.id = TITLE_ID;
      title.textContent = 'Dashboard';
      page.insertBefore(title, page.firstChild);
    }
  }

  function keepSingleMenu(){
    var menus = Array.prototype.slice.call(document.querySelectorAll('.main-nav'));
    if(menus.length < 2) return;

    menus.sort(function(a,b){
      return b.querySelectorAll('.mnav').length - a.querySelectorAll('.mnav').length;
    });

    menus.slice(1).forEach(function(menu){ menu.remove(); });
  }

  function patchDashboard(){
    if(typeof window.renderDashboard !== 'function' || window.renderDashboard._ivSafeMobileTitle) return;

    var original = window.renderDashboard;
    window.renderDashboard = function(){
      var result = original.apply(this, arguments);
      ensureTitle();
      return result;
    };
    window.renderDashboard._ivSafeMobileTitle = true;
  }

  function apply(){
    document.body.classList.toggle('iv-mobile-app', !!mql.matches);
    ensureStyle();
    keepSingleMenu();
    patchDashboard();
    ensureTitle();
  }

  ready(function(){
    apply();
    setTimeout(apply, 350);
    setTimeout(apply, 1000);
    window.addEventListener('pageshow', apply);
    if(mql.addEventListener) mql.addEventListener('change', apply);
    else if(mql.addListener) mql.addListener(apply);
  });
})();

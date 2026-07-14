// IV - Dashboard mobile premium dedicado + correção visual do menu hambúrguer
(function(){
  'use strict';

  var STYLE_ID = 'iv-mobile-dashboard-premium-v2-style';
  var TITLE_ID = 'iv-mobile-dashboard-title';
  var mql = window.matchMedia('(max-width: 820px)');

  function ready(fn){
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, {once:true});
    else fn();
  }

  function esc(value){
    return String(value == null ? '' : value).replace(/[&<>"']/g, function(char){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char];
    });
  }

  function normalize(value){
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g,'')
      .toLowerCase();
  }

  function iconFor(title){
    var text = normalize(title);

    if(text.indexOf('presenca') >= 0){
      return '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 3.8v3M17 3.8v3M4.5 9.1h15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><rect x="4.5" y="5.3" width="15" height="14.2" rx="3" stroke="currentColor" stroke-width="1.8"/><path d="m8.2 14 2.1 2.1 5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    }

    if(text.indexOf('retencao') >= 0){
      return '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3.5 19 6v5.1c0 4.3-2.7 7.7-7 9.4-4.3-1.7-7-5.1-7-9.4V6l7-2.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="m8.5 12.2 2.1 2.1 4.8-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    }

    if(text.indexOf('desistente') >= 0){
      return '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19V9M12 19V5M19 19v-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="m5 6 5 4 4-3 5 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    }

    if(text.indexOf('equipe') >= 0){
      return '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9.3 11.2a3.3 3.3 0 1 0 0-6.6 3.3 3.3 0 0 0 0 6.6ZM16.8 10.2a2.7 2.7 0 1 0 0-5.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M3.8 19.2c.5-3.3 2.5-5.4 5.5-5.4s5 2.1 5.5 5.4M15.2 13.5c2.7.2 4.4 2.1 4.8 4.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
    }

    return '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4.5 18.5h15M6.5 16V9.5M11.8 16V5.5M17.2 16v-3.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="m5.5 7.3 5-3 4.2 3 4-2.3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  function ensureStyle(){
    if(document.getElementById(STYLE_ID)) return;

    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      @media(max-width:820px){
        html,body{overflow-x:hidden!important}

        /* Remove o hambúrguer antigo desenhado pelo mobile-upgrade.css. */
        body.iv-mobile-app .header::after,
        body.iv-mobile-app.mobile-menu-open .header::after,
        body.iv-mobile-app.iv-mobile-menu-open .header::after{
          content:none!important;
          display:none!important;
          width:0!important;
          height:0!important;
          border:0!important;
          background:none!important;
          box-shadow:none!important;
        }
        body.iv-mobile-app .header{
          cursor:default!important;
          padding-right:10px!important;
        }
        body.iv-mobile-app .iv-mobile-menu-toggle{
          isolation:isolate!important;
          outline:0!important;
          -webkit-tap-highlight-color:transparent!important;
        }
        body.iv-mobile-app .iv-mobile-menu-toggle::before,
        body.iv-mobile-app .iv-mobile-menu-toggle::after{
          content:none!important;
          display:none!important;
        }

        body.iv-mobile-app.iv-dashboard-premium-v2 #page-dashboard{
          width:100%!important;
          max-width:100%!important;
          margin:0!important;
          padding:14px 10px 30px!important;
          overflow:hidden!important;
        }

        /* Título simples e premium, sem card desnecessário. */
        body.iv-mobile-app.iv-dashboard-premium-v2 #${TITLE_ID}{
          display:block!important;
          position:relative!important;
          margin:2px 2px 16px!important;
          padding:3px 0 12px!important;
          border:0!important;
          border-radius:0!important;
          background:none!important;
          box-shadow:none!important;
          overflow:visible!important;
          color:#F7FBFF!important;
          font-family:'Playfair Display',serif!important;
          font-size:27px!important;
          font-weight:950!important;
          line-height:1!important;
          letter-spacing:-.025em!important;
          text-shadow:0 8px 24px rgba(0,0,0,.35)!important;
        }
        body.iv-mobile-app.iv-dashboard-premium-v2 #${TITLE_ID}::after{
          content:''!important;
          position:absolute!important;
          left:0!important;
          bottom:0!important;
          width:52px!important;
          height:3px!important;
          border-radius:999px!important;
          background:linear-gradient(90deg,#2F80ED,#22D3EE)!important;
          box-shadow:0 0 18px rgba(34,211,238,.48)!important;
        }

        /* Seis métricas em duas linhas, três cards quadrados por linha. */
        body.iv-mobile-app.iv-dashboard-premium-v2 #dash-kpis{
          display:grid!important;
          grid-template-columns:repeat(3,minmax(0,1fr))!important;
          gap:8px!important;
          width:100%!important;
          margin:0 0 12px!important;
        }
        body.iv-mobile-app.iv-dashboard-premium-v2 #dash-kpis .kpi{
          width:100%!important;
          min-width:0!important;
          min-height:0!important;
          aspect-ratio:1/1!important;
          padding:10px 6px 11px!important;
          border-radius:18px!important;
          display:flex!important;
          flex-direction:column!important;
          align-items:center!important;
          justify-content:center!important;
          gap:3px!important;
          border:1px solid rgba(126,200,240,.16)!important;
          background:
            radial-gradient(circle at 24% 12%,rgba(255,255,255,.10),transparent 34%),
            linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.012)),
            rgba(7,17,31,.88)!important;
          box-shadow:0 13px 30px rgba(0,0,0,.25),inset 0 1px 0 rgba(255,255,255,.055)!important;
          overflow:hidden!important;
        }
        body.iv-mobile-app.iv-dashboard-premium-v2 #dash-kpis .kpi::before{
          content:'';
          position:absolute;
          width:52px;
          height:52px;
          right:-22px;
          top:-24px;
          border-radius:50%;
          background:rgba(126,200,240,.11);
          filter:blur(2px);
          pointer-events:none;
        }
        body.iv-mobile-app.iv-dashboard-premium-v2 #dash-kpis .kpi:nth-child(2)::before{background:rgba(224,85,85,.12)}
        body.iv-mobile-app.iv-dashboard-premium-v2 #dash-kpis .kpi:nth-child(3)::before{background:rgba(155,89,182,.14)}
        body.iv-mobile-app.iv-dashboard-premium-v2 #dash-kpis .kpi:nth-child(5)::before{background:rgba(62,201,122,.12)}
        body.iv-mobile-app.iv-dashboard-premium-v2 #dash-kpis .kpi:nth-child(6)::before{background:rgba(224,85,85,.12)}
        body.iv-mobile-app.iv-dashboard-premium-v2 #dash-kpis .kpi-num{
          font-size:clamp(22px,7vw,29px)!important;
          line-height:.95!important;
          margin:0!important;
          position:relative!important;
          z-index:1!important;
        }
        body.iv-mobile-app.iv-dashboard-premium-v2 #dash-kpis .kpi-lbl{
          width:100%!important;
          margin:3px 0 0!important;
          color:#8FAACB!important;
          font-size:clamp(7px,2.2vw,9px)!important;
          line-height:1.22!important;
          letter-spacing:.045em!important;
          text-align:center!important;
          white-space:normal!important;
          overflow-wrap:anywhere!important;
          position:relative!important;
          z-index:1!important;
        }

        /* Remove o grid desktop de duas colunas. */
        body.iv-mobile-app.iv-dashboard-premium-v2 #page-dashboard > div[style*="grid-template-columns"]{
          display:block!important;
          grid-template-columns:1fr!important;
          gap:0!important;
          margin-top:0!important;
          margin-bottom:0!important;
        }
        body.iv-mobile-app.iv-dashboard-premium-v2 #page-dashboard > div[style*="grid-template-columns"] > div{
          width:100%!important;
          min-width:0!important;
        }

        /* Sanfonas premium para os cards detalhados. */
        body.iv-mobile-app.iv-dashboard-premium-v2 .iv-dashboard-accordion{
          display:block!important;
          width:100%!important;
          margin:0 0 10px!important;
          padding:0!important;
          overflow:hidden!important;
          border:1px solid rgba(126,200,240,.17)!important;
          border-radius:20px!important;
          background:
            radial-gradient(circle at 10% 0%,rgba(47,128,237,.12),transparent 32%),
            linear-gradient(145deg,rgba(255,255,255,.045),rgba(255,255,255,.010)),
            rgba(7,17,31,.86)!important;
          box-shadow:0 15px 36px rgba(0,0,0,.25),inset 0 1px 0 rgba(255,255,255,.05)!important;
        }
        body.iv-mobile-app.iv-dashboard-premium-v2 .iv-dashboard-accordion > summary{
          min-height:58px!important;
          padding:10px 12px!important;
          display:grid!important;
          grid-template-columns:38px minmax(0,1fr) 26px!important;
          gap:10px!important;
          align-items:center!important;
          list-style:none!important;
          cursor:pointer!important;
          -webkit-tap-highlight-color:transparent!important;
          user-select:none!important;
        }
        body.iv-mobile-app.iv-dashboard-premium-v2 .iv-dashboard-accordion > summary::-webkit-details-marker{display:none!important}
        body.iv-mobile-app.iv-dashboard-premium-v2 .iv-dash-summary-icon{
          width:38px!important;
          height:38px!important;
          display:inline-flex!important;
          align-items:center!important;
          justify-content:center!important;
          border-radius:13px!important;
          color:#CFF1FF!important;
          border:1px solid rgba(126,200,240,.23)!important;
          background:radial-gradient(circle at 28% 18%,rgba(255,255,255,.18),rgba(47,128,237,.10))!important;
          box-shadow:0 10px 24px rgba(0,0,0,.24),0 0 18px rgba(47,128,237,.11),inset 0 1px 0 rgba(255,255,255,.08)!important;
        }
        body.iv-mobile-app.iv-dashboard-premium-v2 .iv-dash-summary-icon svg{width:20px!important;height:20px!important;display:block!important}
        body.iv-mobile-app.iv-dashboard-premium-v2 .iv-dash-summary-title{
          min-width:0!important;
          color:#EAF7FF!important;
          font-size:12px!important;
          line-height:1.25!important;
          font-weight:900!important;
          letter-spacing:.015em!important;
        }
        body.iv-mobile-app.iv-dashboard-premium-v2 .iv-dash-summary-chevron{
          width:26px!important;
          height:26px!important;
          border-radius:9px!important;
          display:flex!important;
          align-items:center!important;
          justify-content:center!important;
          color:#7EC8F0!important;
          background:rgba(126,200,240,.07)!important;
          border:1px solid rgba(126,200,240,.12)!important;
          transition:transform .22s ease,background .22s ease!important;
        }
        body.iv-mobile-app.iv-dashboard-premium-v2 .iv-dash-summary-chevron svg{width:14px!important;height:14px!important}
        body.iv-mobile-app.iv-dashboard-premium-v2 .iv-dashboard-accordion[open] .iv-dash-summary-chevron{
          transform:rotate(180deg)!important;
          background:rgba(126,200,240,.13)!important;
        }
        body.iv-mobile-app.iv-dashboard-premium-v2 .iv-dashboard-accordion[open] > summary{
          border-bottom:1px solid rgba(126,200,240,.12)!important;
        }
        body.iv-mobile-app.iv-dashboard-premium-v2 .iv-dashboard-accordion[open] .iv-dashboard-accordion-body{
          animation:ivDashAccordionIn .22s ease both!important;
        }
        @keyframes ivDashAccordionIn{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}
        body.iv-mobile-app.iv-dashboard-premium-v2 .iv-dashboard-accordion-body{
          width:100%!important;
          padding:11px 11px 13px!important;
          overflow:hidden!important;
        }
        body.iv-mobile-app.iv-dashboard-premium-v2 .iv-dashboard-accordion-body > *{
          width:100%!important;
          max-width:100%!important;
          min-width:0!important;
        }
        body.iv-mobile-app.iv-dashboard-premium-v2 .iv-dashboard-accordion-body .mod-block{
          margin:0 0 8px!important;
          padding:12px!important;
          border-radius:16px!important;
          border:1px solid rgba(126,200,240,.12)!important;
          background:linear-gradient(145deg,rgba(255,255,255,.035),rgba(255,255,255,.008)),rgba(4,12,24,.62)!important;
          box-shadow:inset 0 1px 0 rgba(255,255,255,.035)!important;
        }
        body.iv-mobile-app.iv-dashboard-premium-v2 .iv-dashboard-accordion-body .mod-block:last-child{margin-bottom:0!important}
        body.iv-mobile-app.iv-dashboard-premium-v2 .iv-dashboard-accordion-body .card-title{
          margin-bottom:10px!important;
          font-size:10px!important;
          line-height:1.3!important;
          letter-spacing:.055em!important;
        }
        body.iv-mobile-app.iv-dashboard-premium-v2 .iv-dashboard-accordion-body .ret-bar-bg{min-width:0!important}
        body.iv-mobile-app.iv-dashboard-premium-v2 #dash-ret-semana-equipe .mod-block > div[style*="align-items:flex-start"]{
          gap:7px!important;
        }
        body.iv-mobile-app.iv-dashboard-premium-v2 #dash-ret-semana-equipe .mod-block > div[style*="align-items:flex-start"] > div[style*="width:120px"]{
          width:82px!important;
          font-size:10px!important;
          line-height:1.25!important;
          overflow-wrap:anywhere!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function ensureTitle(){
    var page = document.getElementById('page-dashboard');
    if(!page) return null;

    var legacy = document.getElementById('iv-mobile-dashboard');
    if(legacy) legacy.remove();

    var title = document.getElementById(TITLE_ID);
    if(!title){
      title = document.createElement('div');
      title.id = TITLE_ID;
      page.insertBefore(title, page.firstChild);
    }
    title.textContent = 'Dashboard';
    return title;
  }

  function addKpiMarkers(){
    var row = document.getElementById('dash-kpis');
    if(!row) return;
    Array.prototype.forEach.call(row.children, function(card, index){
      card.classList.add('iv-mobile-square-kpi');
      card.setAttribute('data-iv-kpi-index', String(index + 1));
    });
  }

  function makeAccordion(title, index){
    if(!title || title.closest('.iv-dashboard-accordion')) return;

    var content = title.nextElementSibling;
    var parent = title.parentNode;
    if(!content || !parent) return;

    var text = (title.textContent || '').trim();
    if(!text) return;

    var details = document.createElement('details');
    details.className = 'iv-dashboard-accordion';
    details.dataset.ivDashboardSection = text;
    if(index === 0) details.open = true;

    var summary = document.createElement('summary');
    summary.innerHTML =
      '<span class="iv-dash-summary-icon">'+iconFor(text)+'</span>'+
      '<span class="iv-dash-summary-title">'+esc(text)+'</span>'+
      '<span class="iv-dash-summary-chevron" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="m7 9.5 5 5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';

    var body = document.createElement('div');
    body.className = 'iv-dashboard-accordion-body';

    parent.insertBefore(details, title);
    details.appendChild(summary);
    details.appendChild(body);
    body.appendChild(content);
    title.remove();
  }

  function decorateSections(){
    var page = document.getElementById('page-dashboard');
    if(!page || !mql.matches) return;

    var titles = Array.prototype.slice.call(page.querySelectorAll('.stitle')).filter(function(title){
      return !title.closest('.iv-dashboard-accordion');
    });

    titles.forEach(function(title, index){ makeAccordion(title, index); });
  }

  function restoreSections(){
    var page = document.getElementById('page-dashboard');
    if(!page) return;

    Array.prototype.slice.call(page.querySelectorAll('.iv-dashboard-accordion')).forEach(function(details){
      var parent = details.parentNode;
      var body = details.querySelector('.iv-dashboard-accordion-body');
      if(!parent || !body) return;

      var title = document.createElement('div');
      title.className = 'stitle';
      title.textContent = details.dataset.ivDashboardSection || 'Indicadores';
      parent.insertBefore(title, details);

      while(body.firstChild) parent.insertBefore(body.firstChild, details);
      details.remove();
    });
  }

  function cleanLegacyMenuFrame(){
    var header = document.querySelector('.header');
    if(!header) return;
    header.classList.add('iv-single-hamburger-header');
  }

  function applyMobileLayout(){
    ensureStyle();
    cleanLegacyMenuFrame();

    if(mql.matches){
      document.body.classList.add('iv-dashboard-premium-v2');
      ensureTitle();
      addKpiMarkers();
      decorateSections();
    }else{
      document.body.classList.remove('iv-dashboard-premium-v2');
      restoreSections();
    }
  }

  function patchDashboard(){
    if(typeof window.renderDashboard !== 'function' || window.renderDashboard._ivPremiumMobileV2) return;

    var original = window.renderDashboard;
    window.renderDashboard = function(){
      var result = original.apply(this, arguments);
      applyMobileLayout();
      return result;
    };
    window.renderDashboard._ivPremiumMobileV2 = true;
  }

  function init(){
    ensureStyle();
    patchDashboard();
    applyMobileLayout();
  }

  ready(function(){
    init();
    window.setTimeout(init, 420);
    window.setTimeout(init, 1150);
    window.addEventListener('pageshow', applyMobileLayout);
    if(mql.addEventListener) mql.addEventListener('change', applyMobileLayout);
    else if(mql.addListener) mql.addListener(applyMobileLayout);
  });
})();

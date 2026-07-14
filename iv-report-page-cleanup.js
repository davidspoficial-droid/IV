// IV - limpeza e reorganização visual da página de Relatórios
(function(){
  'use strict';

  var STYLE_ID='iv-report-page-cleanup-style';

  function addStyle(){
    if(document.getElementById(STYLE_ID)) return;
    var style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #page-exportar #iv-report-filter-note,
      #page-exportar .iv-report-filter-note,
      #page-exportar #iv-report-mobile-help,
      #page-exportar .iv-report-mobile-help,
      #page-exportar .report-info-card,
      #page-exportar .reports-info-card,
      #page-exportar .report-side-card{display:none!important}

      #page-exportar .reports-page-premium{
        width:100%!important;
        max-width:1120px!important;
        margin-left:auto!important;
        margin-right:auto!important;
        box-sizing:border-box!important;
      }
      #page-exportar .reports-panel,
      #page-exportar .report-hero-card{
        width:100%!important;
        max-width:none!important;
        min-width:0!important;
        box-sizing:border-box!important;
      }
      #page-exportar .reports-main-grid{
        display:grid!important;
        grid-template-columns:minmax(0,1fr)!important;
        gap:0!important;
        width:100%!important;
        max-width:100%!important;
      }
      #page-exportar .reports-main-grid>*{
        grid-column:1/-1!important;
        min-width:0!important;
        max-width:100%!important;
      }
      #page-exportar .report-hero-card{
        min-height:0!important;
        padding:clamp(28px,4vw,46px)!important;
        border-radius:24px!important;
      }
      #page-exportar .report-hero-card p{
        max-width:720px!important;
        margin-left:auto!important;
        margin-right:auto!important;
      }
      #page-exportar .reports-panel{
        padding:22px!important;
        border-radius:22px!important;
        margin-bottom:14px!important;
      }
      #page-exportar .reports-bottom{
        align-items:end!important;
      }

      @media(max-width:820px){
        #page-exportar .reports-page-premium{max-width:100%!important}
        #page-exportar .reports-main-grid{display:block!important}
        #page-exportar .reports-panel{
          padding:13px!important;
          border-radius:19px!important;
          margin-bottom:10px!important;
        }
        #page-exportar .report-hero-card{
          width:100%!important;
          padding:21px 14px 17px!important;
          border-radius:19px!important;
          margin:0!important;
        }
        #page-exportar .report-hero-card p{
          max-width:none!important;
          margin-bottom:16px!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function normalize(value){
    return String(value||'').replace(/\s+/g,' ').trim().toLowerCase();
  }

  function removeCardByHeading(page, headingText){
    var target=normalize(headingText);
    Array.prototype.forEach.call(page.querySelectorAll('h1,h2,h3,h4,.card-title,.report-info-title,.reports-info-title,strong'),function(el){
      if(normalize(el.textContent)!==target) return;
      var card=el.closest('.report-info-card,.reports-info-card,.report-side-card');
      if(!card){
        var candidate=el.closest('.card');
        if(candidate&&!candidate.classList.contains('reports-panel')) card=candidate;
      }
      if(card) card.remove();
    });
  }

  function cleanup(){
    addStyle();
    var page=document.getElementById('page-exportar');
    if(!page) return;

    ['iv-report-filter-note','iv-report-mobile-help'].forEach(function(id){
      var el=document.getElementById(id);
      if(el) el.remove();
    });
    Array.prototype.forEach.call(page.querySelectorAll('.report-info-card,.reports-info-card,.report-side-card'),function(el){el.remove();});
    removeCardByHeading(page,'Compartilhamento simplificado');

    var grid=page.querySelector('.reports-main-grid');
    if(grid) grid.classList.add('iv-report-single-card-layout');
  }

  function start(){
    cleanup();
    [80,520,1450,2750].forEach(function(delay){window.setTimeout(cleanup,delay);});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();

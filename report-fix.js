// IV - bootstrap único dos relatórios e autoridade da Visão Geral
(function(){
  'use strict';

  var reportVersion = 'mobile';

  window.setVersaoRelatorio = function(version, button){
    reportVersion = version === 'web' ? 'web' : 'mobile';
    document.querySelectorAll('#tab-mobile,#tab-web').forEach(function(item){
      item.classList.remove('active');
    });
    if(button) button.classList.add('active');
    var mobileBox = document.getElementById('device-mobile-box');
    if(mobileBox) mobileBox.style.display = reportVersion === 'mobile' ? '' : 'none';
  };

  window.IVReportSelectedVersion = function(){
    var webButton = document.getElementById('tab-web');
    return webButton && webButton.classList.contains('active') ? 'web' : reportVersion;
  };

  import('./iv-report-general-authority.js?v=20260714-3').catch(function(error){
    console.error('Erro ao carregar o gerador definitivo da Visão Geral:', error);
  });
})();
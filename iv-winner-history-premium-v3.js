// IV - autoridade de geração do Histórico de um Vencedor V3
(function(){
'use strict';
if(window.__IV_HISTORY_INSTALLER_V3__) return;
window.__IV_HISTORY_INSTALLER_V3__ = true;

function allowed(){
  try{return typeof window.userCan !== 'function' || window.userCan('relatorios_generate') === true;}
  catch(error){return false;}
}

function showLink(link){
  var input=document.getElementById('link-gerado');
  if(input) input.value=link;
  window._ultimaSemana=[];
  window._tipoRelatorioAtual='Histórico de um Vencedor';
  var preview=document.getElementById('whats-preview');
  if(preview) preview.textContent='📊 *Histórico de um Vencedor – Instituto de Vencedores*\n\n🔗 Acesse pelo link:\n'+link;
  var modal=document.getElementById('modal-link');
  if(modal) modal.style.display='flex';
}

function install(){
  var previous=window.gerarRelatorioLink;
  if(typeof previous!=='function' || previous._ivHistoryV3) return;

  var generate=async function(){
    var type=(document.getElementById('exp-tipo')||{}).value||'visao';
    if(type!=='caminho') return previous.apply(this,arguments);

    if(!allowed()){
      if(typeof window.toast==='function') window.toast('Você não tem permissão para gerar relatórios.',true);
      return false;
    }
    if(typeof window.IVSaveReportHTML!=='function' || !window.IVWinnerHistoryBuilderV3){
      if(typeof window.toast==='function') window.toast('O gerador do Histórico ainda está carregando. Tente novamente.',true);
      return false;
    }

    var title=(document.getElementById('exp-titulo')||{}).value||'Instituto de Vencedores';
    var moduleFilter=(document.getElementById('exp-modulo')||{}).value||'todos';
    if(typeof window.toast==='function') window.toast('Gerando Histórico premium, aguarde...');

    try{
      var html=window.IVWinnerHistoryBuilderV3.build(title,moduleFilter);
      var link=await window.IVSaveReportHTML({
        html:html,
        titulo:title,
        tipo:'Histórico de um Vencedor',
        modulo:moduleFilter,
        versao:'responsivo',
        gerador:'winner-history-premium-v3'
      });
      showLink(link);
      if(typeof window.toast==='function') window.toast('Link gerado! ✓');
      return link;
    }catch(error){
      console.error(error);
      if(typeof window.toast==='function') window.toast('Erro ao gerar o Histórico.',true);
      return false;
    }
  };

  generate._ivHistoryV3=1;
  generate._ivTrajectoryAccordionV2=1;
  generate._ivPermissionGuard=1;
  window.gerarRelatorioLink=generate;

  var desktop=function(){return window.gerarRelatorioLink();};
  desktop._ivHistoryV3=1;
  desktop._ivTrajectoryAccordionV2=1;
  desktop._ivPermissionGuard=1;
  window.gerarRelatorio=desktop;
}

install();
[80,250,700,1400].forEach(function(delay){setTimeout(install,delay);});
window.IVWinnerHistoryPremiumV3={install:install};
})();

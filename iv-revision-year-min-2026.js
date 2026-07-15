// IV - limita o ano da Revisão a 2026 em diante
(function(){
  'use strict';
  if(window.__IV_REVIEW_YEAR_2026__) return;
  window.__IV_REVIEW_YEAR_2026__ = true;

  var FIRST_YEAR = 2026;

  function yearOptions(selected){
    var current = Math.max(FIRST_YEAR, new Date().getFullYear());
    var html = '<option value="">Selecione o ano</option>';
    for(var year = FIRST_YEAR; year <= current + 6; year += 1){
      html += '<option value="' + year + '"' + (String(selected) === String(year) ? ' selected' : '') + '>' + year + '</option>';
    }
    return html;
  }

  function normalizeSelect(select){
    if(!select) return;
    var selected = parseInt(select.value || '', 10);
    select.innerHTML = yearOptions(selected >= FIRST_YEAR ? selected : '');
    select.min = String(FIRST_YEAR);
    select.dataset.ivReviewMinYear = String(FIRST_YEAR);
  }

  function apply(){
    normalizeSelect(document.getElementById('al-revisao-ano'));
    normalizeSelect(document.getElementById('imp-revisao-ano'));
  }

  function schedule(){
    window.setTimeout(apply, 0);
    window.setTimeout(apply, 80);
    window.setTimeout(apply, 220);
  }

  function wrap(name){
    var current = window[name];
    if(typeof current !== 'function' || current._ivReviewYear2026) return;
    var wrapped = function(){
      var result = current.apply(this, arguments);
      schedule();
      return result;
    };
    wrapped._ivReviewYear2026 = true;
    window[name] = wrapped;
  }

  function bind(){
    if(document.documentElement.dataset.ivReviewYear2026Bound) return;
    document.documentElement.dataset.ivReviewYear2026Bound = '1';

    document.addEventListener('focusin', function(event){
      if(event.target && (event.target.id === 'al-revisao-ano' || event.target.id === 'imp-revisao-ano')) normalizeSelect(event.target);
    }, true);

    document.addEventListener('change', function(event){
      if(!event.target || (event.target.id !== 'al-revisao-ano' && event.target.id !== 'imp-revisao-ano')) return;
      var value = parseInt(event.target.value || '', 10);
      if(value && value < FIRST_YEAR){
        event.target.value = '';
        if(typeof window.toast === 'function') window.toast('O ano da Revisão deve ser 2026 ou posterior.', true);
      }
    }, true);
  }

  function init(){
    wrap('openAlunoModal');
    wrap('openImportModal');
    apply();
    bind();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
  window.setTimeout(init, 500);
  window.setTimeout(init, 1500);
})();
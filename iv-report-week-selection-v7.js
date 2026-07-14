// IV - corrige a seleção acumulada das semanas no HTML do relatório
(function(){
  'use strict';
  if(window.__IV_WEEK_SELECTION_V7__) return;
  window.__IV_WEEK_SELECTION_V7__ = true;

  var nativeParse = DOMParser.prototype.parseFromString;

  DOMParser.prototype.parseFromString = function(source, type){
    var doc = nativeParse.call(this, source, type);
    if(type !== 'text/html' || String(source || '').indexOf('iv-main-review-panel') < 0 || String(source || '').indexOf('iv-week-tab') < 0){
      return doc;
    }
    if(doc.getElementById('iv-week-selection-v7')) return doc;

    var script = doc.createElement('script');
    script.id = 'iv-week-selection-v7';
    script.textContent = '(function(){window.ivShowWeek=function(reviewIndex,moduleNumber,weekIndex,button){document.querySelectorAll("[id^=\\"iv-week-"+reviewIndex+"-"+moduleNumber+"-\\"]").forEach(function(panel){panel.style.display="none"});var panel=document.getElementById("iv-week-"+reviewIndex+"-"+moduleNumber+"-"+weekIndex);if(panel)panel.style.display="block";var container=button&&button.closest(".iv-module-accordion,.iv-module-section");if(container)container.querySelectorAll(".iv-week-tab").forEach(function(tab){tab.classList.remove("active");tab.setAttribute("aria-selected","false")});if(button){button.classList.add("active");button.setAttribute("aria-selected","true");button.blur()}try{var selection=window.getSelection&&window.getSelection();if(selection)selection.removeAllRanges()}catch(error){}}})();';
    doc.body.appendChild(script);
    return doc;
  };
})();
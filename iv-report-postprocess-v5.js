// IV - acabamento final dos relatórios: sanfonas, livros por módulo e cards compactos
(function(){
  'use strict';

  if(window.__IV_REPORT_POSTPROCESS_V5__) return;
  window.__IV_REPORT_POSTPROCESS_V5__ = true;

  var busy = false;

  function isGeneralViewTrigger(target){
    if(!target || !target.closest) return false;
    var trigger = target.closest('#page-exportar .report-generate-btn, #page-exportar [onclick*="gerarRelatorioLink"]');
    if(!trigger) return false;
    var type = (document.getElementById('exp-tipo') || {}).value || 'visao';
    return type === 'visao';
  }

  function bookFor(text){
    var value = String(text || '');
    if(value.indexOf('2') >= 0) return '📗';
    if(value.indexOf('3') >= 0) return '📕';
    return '📘';
  }

  function makeArrow(doc, className){
    var arrow = doc.createElement('span');
    arrow.className = className;
    arrow.textContent = '▼';
    return arrow;
  }

  function transformModules(doc){
    Array.from(doc.querySelectorAll('.iv-module-section')).forEach(function(section){
      if(section.closest('.iv-module-accordion')) return;

      var heading = section.querySelector(':scope > .iv-module-heading');
      var details = doc.createElement('details');
      details.className = 'iv-module-accordion';
      details.style.cssText = section.style.cssText;

      var summary = doc.createElement('summary');
      summary.className = 'iv-module-heading';
      summary.innerHTML = heading ? heading.innerHTML : '<div><span class="iv-module-icon">📘</span><div><strong>Módulo</strong><span>Semanas e aulas</span></div></div>';

      var moduleName = (summary.querySelector('strong') || {}).textContent || '';
      var icon = summary.querySelector('.iv-module-icon');
      if(icon) icon.textContent = bookFor(moduleName);
      summary.appendChild(makeArrow(doc, 'iv-module-accordion-arrow'));
      details.appendChild(summary);

      Array.from(section.childNodes).forEach(function(node){
        if(node !== heading) details.appendChild(node);
      });
      section.replaceWith(details);
    });
  }

  function transformComparisonModules(doc, root){
    Array.from(root.querySelectorAll('.iv-analysis-block')).forEach(function(block){
      if(block.closest('.iv-compare-module-accordion')) return;
      var subtitle = block.querySelector(':scope > .iv-analysis-subtitle');
      var title = subtitle ? subtitle.textContent.trim() : 'Módulo';

      var details = doc.createElement('details');
      details.className = 'iv-compare-module-accordion';
      var summary = doc.createElement('summary');
      summary.innerHTML = '<span class="iv-compare-book">'+bookFor(title)+'</span><strong>'+title+'</strong>';
      summary.appendChild(makeArrow(doc, 'iv-compare-arrow'));
      details.appendChild(summary);

      var body = doc.createElement('div');
      body.className = 'iv-compare-module-body';
      Array.from(block.childNodes).forEach(function(node){
        if(node !== subtitle) body.appendChild(node);
      });
      details.appendChild(body);
      block.replaceWith(details);
    });
  }

  function transformAnalysisCards(doc, root){
    Array.from(root.querySelectorAll(':scope > .iv-analysis-card')).forEach(function(card){
      if(card.closest('.iv-analysis-accordion')) return;
      var titleNode = card.querySelector(':scope > .iv-analysis-title');
      var title = titleNode ? titleNode.textContent.trim() : 'Comparativo';

      var details = doc.createElement('details');
      details.className = 'iv-analysis-accordion';
      var summary = doc.createElement('summary');
      summary.innerHTML = '<strong>'+title+'</strong>';
      summary.appendChild(makeArrow(doc, 'iv-analysis-arrow'));
      details.appendChild(summary);

      var body = doc.createElement('div');
      body.className = 'iv-analysis-accordion-body';
      Array.from(card.childNodes).forEach(function(node){
        if(node !== titleNode) body.appendChild(node);
      });
      details.appendChild(body);
      card.replaceWith(details);
    });
  }

  function transformComparisons(doc){
    Array.from(doc.querySelectorAll('.iv-main-review-panel')).forEach(function(panel){
      var label = Array.from(panel.querySelectorAll(':scope > .iv-section-label')).find(function(item){
        return String(item.textContent || '').toLowerCase().indexOf('comparativos') >= 0;
      });
      if(!label || label.nextElementSibling && label.nextElementSibling.classList.contains('iv-comparisons-accordion')) return;

      var details = doc.createElement('details');
      details.className = 'iv-comparisons-accordion';
      var summary = doc.createElement('summary');
      summary.innerHTML = '<span class="iv-comparison-symbol">▥</span><strong>Comparativos da Revisão</strong><small>Clique para visualizar</small>';
      summary.appendChild(makeArrow(doc, 'iv-comparisons-arrow'));
      details.appendChild(summary);

      var body = doc.createElement('div');
      body.className = 'iv-comparisons-body';
      var node = label.nextSibling;
      while(node){
        var next = node.nextSibling;
        body.appendChild(node);
        node = next;
      }
      details.appendChild(body);
      label.replaceWith(details);

      transformComparisonModules(doc, body);
      transformAnalysisCards(doc, body);
    });
  }

  function injectStyles(doc){
    if(doc.getElementById('iv-report-postprocess-v5-style')) return;
    var style = doc.createElement('style');
    style.id = 'iv-report-postprocess-v5-style';
    style.textContent =
      '.iv-kpi-grid{gap:6px!important;margin-bottom:14px!important}.iv-kpi{padding:9px 7px!important;border-radius:11px!important;background:linear-gradient(145deg,#0B1628,#091321)!important;box-shadow:0 7px 18px rgba(0,0,0,.14)!important}.iv-kpi>b{font-size:20px!important}.iv-kpi>span{font-size:7px!important;margin-top:3px!important}' +
      '.iv-module-accordion{margin-bottom:10px;border:1px solid rgba(126,200,240,.13);border-radius:13px;background:#081426;overflow:hidden;box-shadow:0 9px 22px rgba(0,0,0,.17)}.iv-module-accordion>summary{list-style:none;cursor:pointer;min-height:58px!important;padding:10px 12px!important;border-bottom:0!important}.iv-module-accordion>summary::-webkit-details-marker{display:none}.iv-module-accordion[open]>summary{border-bottom:1px solid rgba(126,200,240,.09)!important}.iv-module-accordion-arrow{margin-left:8px;color:var(--module-color);font-size:9px;transition:transform .2s}.iv-module-accordion[open] .iv-module-accordion-arrow{transform:rotate(180deg)}.iv-module-icon{width:30px!important;height:30px!important;background:rgba(255,255,255,.035)!important;font-size:19px!important}.iv-module-heading strong{font-size:13px!important}.iv-module-heading span{font-size:8px!important}.iv-module-counts b{font-size:10px!important}.iv-week-tabs{padding:9px 11px!important;gap:5px!important}.iv-week-tab{padding:6px 9px!important;font-size:8px!important}.iv-week-panels{padding:0 11px 11px!important}' +
      '.iv-premium-team-list{gap:7px!important}.iv-premium-team{border-radius:12px!important;box-shadow:0 7px 18px rgba(0,0,0,.15)!important}.iv-premium-team>summary{grid-template-columns:29px minmax(0,1fr) 46px 16px!important;gap:8px!important;min-height:59px!important;padding:9px 11px!important}.iv-team-rank{width:28px!important;height:28px!important;font-size:11px!important}.iv-team-center>strong{color:var(--team-color)!important;font-size:13px!important;font-weight:950!important;letter-spacing:.01em!important;text-shadow:0 1px 12px rgba(0,0,0,.20)}.iv-team-bar{height:4px!important;margin-top:6px!important}.iv-team-count>b{font-size:20px!important}.iv-team-count>small{font-size:7px!important}.iv-team-body{padding:0 11px 9px!important;background:rgba(1,8,18,.28)}.iv-present-title{padding:8px 0 4px!important;font-size:8px!important}.iv-present-student{min-height:27px!important}.iv-present-name{font-size:10px!important;font-weight:500!important;color:#C9D8E9!important}.iv-turma-badge{font-size:7px!important;padding:2px 6px!important}' +
      '.iv-comparisons-accordion{margin-top:19px;border:1px solid rgba(126,200,240,.15);border-radius:14px;background:linear-gradient(145deg,#0A172A,#07111F);overflow:hidden;box-shadow:0 10px 24px rgba(0,0,0,.17)}.iv-comparisons-accordion>summary{list-style:none;display:grid;grid-template-columns:28px minmax(0,1fr) auto 17px;align-items:center;gap:9px;min-height:58px;padding:11px 13px;cursor:pointer}.iv-comparisons-accordion>summary::-webkit-details-marker{display:none}.iv-comparison-symbol{width:27px;height:27px;display:flex;align-items:center;justify-content:center;border-radius:9px;background:rgba(74,144,217,.16);color:#7EC8F0}.iv-comparisons-accordion>summary strong{font-size:12px;color:#EAF4FF}.iv-comparisons-accordion>summary small{font-size:8px;color:#7892B4}.iv-comparisons-arrow{font-size:9px;color:#7EC8F0;transition:transform .2s}.iv-comparisons-accordion[open] .iv-comparisons-arrow{transform:rotate(180deg)}.iv-comparisons-body{padding:0 10px 10px;border-top:1px solid rgba(126,200,240,.08)}' +
      '.iv-analysis-accordion{margin-top:9px;border:1px solid rgba(126,200,240,.10);border-radius:11px;background:#091525;overflow:hidden}.iv-analysis-accordion>summary{list-style:none;display:grid;grid-template-columns:minmax(0,1fr) 16px;align-items:center;gap:8px;min-height:46px;padding:9px 11px;cursor:pointer}.iv-analysis-accordion>summary::-webkit-details-marker{display:none}.iv-analysis-accordion>summary strong{font-size:10px;color:#DDEBFA}.iv-analysis-arrow{font-size:8px;color:#7892B4;transition:transform .2s}.iv-analysis-accordion[open] .iv-analysis-arrow{transform:rotate(180deg)}.iv-analysis-accordion-body{padding:0 10px 10px;border-top:1px solid rgba(126,200,240,.07)}' +
      '.iv-compare-module-accordion{margin-top:8px;border:1px solid rgba(126,200,240,.09);border-radius:10px;background:#07111F;overflow:hidden}.iv-compare-module-accordion>summary{list-style:none;display:grid;grid-template-columns:25px minmax(0,1fr) 15px;align-items:center;gap:8px;min-height:43px;padding:8px 10px;cursor:pointer}.iv-compare-module-accordion>summary::-webkit-details-marker{display:none}.iv-compare-book{font-size:17px}.iv-compare-module-accordion>summary strong{font-size:10px;color:#E5F1FF}.iv-compare-arrow{font-size:8px;color:#7892B4;transition:transform .2s}.iv-compare-module-accordion[open] .iv-compare-arrow{transform:rotate(180deg)}.iv-compare-module-body{padding:0 9px 9px;border-top:1px solid rgba(126,200,240,.06)}' +
      '.iv-retention-row{padding:8px 0!important}.iv-status-team>summary{padding:9px 10px!important}.iv-status-team-name{font-size:10px!important;font-weight:950!important;color:#DDEBFA!important}.iv-quit-student span{font-size:9px!important}' +
      'body.iv-report-web .iv-kpi{padding:12px 9px!important}body.iv-report-web .iv-kpi>b{font-size:25px!important}body.iv-report-web .iv-module-accordion>summary{min-height:66px!important;padding:12px 15px!important}body.iv-report-web .iv-module-heading strong{font-size:15px!important}body.iv-report-web .iv-premium-team>summary{grid-template-columns:33px minmax(0,1fr) 55px 18px!important;min-height:68px!important;padding:11px 14px!important}body.iv-report-web .iv-team-rank{width:32px!important;height:32px!important}body.iv-report-web .iv-team-center>strong{font-size:15px!important}body.iv-report-web .iv-present-name{font-size:12px!important}body.iv-report-web .iv-comparisons-accordion>summary{min-height:66px;padding:13px 16px}body.iv-report-web .iv-comparisons-accordion>summary strong{font-size:14px}' +
      '@media(max-width:820px){.iv-comparisons-accordion>summary{grid-template-columns:27px minmax(0,1fr) 16px}.iv-comparisons-accordion>summary small{display:none}.iv-kpi-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important}.iv-kpi:last-child{grid-column:auto!important}}';
    doc.head.appendChild(style);
  }

  function transformReportHtml(html){
    if(!html || html.indexOf('iv-main-review-panel') < 0) return html;
    var parser = new DOMParser();
    var report = parser.parseFromString(html, 'text/html');
    if(report.getElementById('iv-report-postprocess-v5-style')) return html;

    transformModules(report);
    transformComparisons(report);
    injectStyles(report);
    return '<!DOCTYPE html>\n' + report.documentElement.outerHTML;
  }

  async function postprocessLink(link){
    var url = new URL(link, location.origin);
    var id = url.searchParams.get('id');
    if(!id) return;

    var firebase = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
    var reference = firebase.doc(firebase.getFirestore(), 'relatorios', id);
    var snapshot = await firebase.getDoc(reference);
    if(!snapshot.exists()) throw new Error('Relatório recém-gerado não encontrado.');

    var data = snapshot.data();
    var transformed = transformReportHtml(data.html || '');
    if(transformed === data.html) return;

    await firebase.setDoc(reference, {
      html:transformed,
      acabamento:'sanfonas-premium-v5'
    }, {merge:true});
  }

  document.addEventListener('click', async function(event){
    if(!isGeneralViewTrigger(event.target) || busy) return;
    if(typeof window.IVGenerateGeneralView !== 'function') return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    busy = true;

    var modal = document.getElementById('modal-link');
    var previousVisibility = modal ? modal.style.visibility : '';
    if(modal) modal.style.visibility = 'hidden';

    try {
      var link = await window.IVGenerateGeneralView();
      if(link){
        if(typeof toast === 'function') toast('Finalizando o layout do relatório...');
        await postprocessLink(link);
      }
      if(typeof toast === 'function') toast('Relatório pronto! ✓');
    } catch(error){
      console.error('Erro no acabamento final do relatório:', error);
      if(typeof toast === 'function') toast('O relatório foi gerado, mas o acabamento visual falhou.', true);
    } finally {
      if(modal) modal.style.visibility = previousVisibility || 'visible';
      busy = false;
    }
  }, true);
})();
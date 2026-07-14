// IV - proporção e alinhamento final do cabeçalho dos módulos no relatório
(function(){
  'use strict';

  if(window.__IV_REPORT_MODULE_HEADER_V8__) return;
  window.__IV_REPORT_MODULE_HEADER_V8__ = true;

  var nativeParse = DOMParser.prototype.parseFromString;

  DOMParser.prototype.parseFromString = function(source, type){
    var doc = nativeParse.call(this, source, type);
    var html = String(source || '');

    if(type !== 'text/html' || html.indexOf('iv-main-review-panel') < 0 || html.indexOf('iv-module-heading') < 0){
      return doc;
    }
    if(doc.getElementById('iv-report-module-header-v8-style')) return doc;

    var style = doc.createElement('style');
    style.id = 'iv-report-module-header-v8-style';
    style.textContent =
      '.iv-module-accordion>summary.iv-module-heading{display:grid!important;grid-template-columns:minmax(0,1fr) auto 18px!important;align-items:center!important;gap:14px!important;width:100%!important}' +
      '.iv-module-accordion>summary.iv-module-heading>div:first-child{display:flex!important;align-items:center!important;gap:12px!important;min-width:0!important}' +
      '.iv-module-accordion>summary.iv-module-heading>div:first-child>div{min-width:0!important}' +
      '.iv-module-accordion>summary.iv-module-heading .iv-module-icon{width:36px!important;height:36px!important;min-width:36px!important;flex:0 0 36px!important;font-size:26px!important;line-height:1!important}' +
      '.iv-module-accordion>summary.iv-module-heading .iv-module-counts{display:block!important;justify-self:end!important;align-self:center!important;margin:0!important;padding-left:18px!important;min-width:96px!important;text-align:right!important;white-space:nowrap!important}' +
      '.iv-module-accordion>summary.iv-module-heading .iv-module-counts b{display:block!important;margin:0!important;font-size:11px!important;line-height:1.15!important}' +
      '.iv-module-accordion>summary.iv-module-heading .iv-module-counts span{display:block!important;margin-top:4px!important;font-size:8px!important;line-height:1.15!important}' +
      '.iv-module-accordion>summary.iv-module-heading .iv-module-accordion-arrow{justify-self:end!important;align-self:center!important;margin-left:0!important}' +
      'body.iv-report-web .iv-module-accordion>summary.iv-module-heading{grid-template-columns:minmax(0,1fr) auto 20px!important;gap:18px!important}' +
      'body.iv-report-web .iv-module-accordion>summary.iv-module-heading .iv-module-icon{width:40px!important;height:40px!important;min-width:40px!important;flex-basis:40px!important;font-size:30px!important}' +
      'body.iv-report-web .iv-module-accordion>summary.iv-module-heading .iv-module-counts{min-width:118px!important;padding-left:24px!important}' +
      'body.iv-report-web .iv-module-accordion>summary.iv-module-heading .iv-module-counts b{font-size:13px!important}' +
      'body.iv-report-web .iv-module-accordion>summary.iv-module-heading .iv-module-counts span{font-size:9px!important}' +
      '@media(max-width:820px){.iv-module-accordion>summary.iv-module-heading{grid-template-columns:minmax(0,1fr) auto 16px!important;gap:9px!important}.iv-module-accordion>summary.iv-module-heading .iv-module-icon{width:34px!important;height:34px!important;min-width:34px!important;flex-basis:34px!important;font-size:25px!important}.iv-module-accordion>summary.iv-module-heading .iv-module-counts{min-width:76px!important;padding-left:8px!important}.iv-module-accordion>summary.iv-module-heading .iv-module-counts b{font-size:9px!important}.iv-module-accordion>summary.iv-module-heading .iv-module-counts span{font-size:7px!important}}';

    doc.head.appendChild(style);
    return doc;
  };
})();
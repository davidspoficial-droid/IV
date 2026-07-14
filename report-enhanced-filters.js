import('./iv-revision-core.js?v=20260714-2')
  .then(function(){ return import('./iv-reports-generator-v2.js?v=20260714-1'); })
  .then(function(){ return import('./iv-reports-general-view-v3.js?v=20260714-1'); })
  .then(function(){ return import('./iv-app-unified.js?v=20260714-8'); })
  .then(function(){ return import('./iv-navigation-speed-colors.js?v=20260714-6'); })
  .catch(function(error){ console.error('Erro ao iniciar aplicação unificada do IV', error); });
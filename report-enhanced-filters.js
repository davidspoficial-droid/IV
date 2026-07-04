// Ativa ajuste de permissões separadas
import('./permissions-split-fix.js?v=2').catch(function(e){console.error('Erro ao carregar permissões separadas', e);});

// Melhorias solicitadas: telefone do aluno, histórico com aulas perdidas, filtro de módulos e modal premium
import('./iv-custom-improvements.js?v=1').catch(function(e){console.error('Erro ao carregar melhorias personalizadas do IV', e);});

// Ajuste fino: rótulo Telefone e coluna na ordem Nome → Telefone
import('./iv-phone-column-order-fix.js?v=1').catch(function(e){console.error('Erro ao carregar ajuste da coluna telefone', e);});

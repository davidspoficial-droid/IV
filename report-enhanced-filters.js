// Ativa ajuste de permissões separadas
import('./permissions-split-fix.js?v=2').catch(function(e){console.error('Erro ao carregar permissões separadas', e);});

// Melhorias solicitadas: telefone do aluno, histórico com aulas perdidas, filtro de módulos e modal premium
import('./iv-custom-improvements.js?v=1').catch(function(e){console.error('Erro ao carregar melhorias personalizadas do IV', e);});

// Ajuste fino: rótulo Telefone e coluna na ordem Nome → Telefone
import('./iv-phone-column-order-fix.js?v=1').catch(function(e){console.error('Erro ao carregar ajuste da coluna telefone', e);});

// Ajuste visual: botões do link e aulas perdidas compactas em sanfona premium
import('./iv-report-compact-ui-fix.js?v=1').catch(function(e){console.error('Erro ao carregar ajuste compacto dos relatórios', e);});

// Ajustes gerais: tabela de alunos, telefone, login, relatório de retenção e cabeçalho de presença
import('./iv-system-adjustments-202607.js?v=1').catch(function(e){console.error('Erro ao carregar ajustes gerais do sistema', e);});

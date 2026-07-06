// Ativa ajuste de permissoes separadas
import('./permissions-split-fix.js?v=2').catch(function(e){console.error('Erro ao carregar permissoes separadas', e);});

// Melhorias solicitadas: telefone do aluno, historico com aulas perdidas, filtro de modulos e modal premium
import('./iv-custom-improvements.js?v=1').catch(function(e){console.error('Erro ao carregar melhorias personalizadas do IV', e);});

// Ajuste fino: rotulo Telefone e coluna na ordem Nome -> Telefone
import('./iv-phone-column-order-fix.js?v=1').catch(function(e){console.error('Erro ao carregar ajuste da coluna telefone', e);});

// Ajuste visual: botoes do link e aulas perdidas compactas em sanfona premium
import('./iv-report-compact-ui-fix.js?v=1').catch(function(e){console.error('Erro ao carregar ajuste compacto dos relatorios', e);});

// Ajustes gerais: tabela de alunos, telefone, relatorio de retencao e cabecalho de presenca
import('./iv-system-adjustments-202607.js?v=2').catch(function(e){console.error('Erro ao carregar ajustes gerais do sistema', e);});

// Regras de cadastro: nome repetido, nomes padronizados e modal de link compacto
import('./iv-student-rules-modal-fix.js?v=1').catch(function(e){console.error('Erro ao carregar regras de alunos e modal compacto', e);});

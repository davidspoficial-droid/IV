// Ativa ajuste de permissoes separadas
import('./permissions-split-fix.js?v=2').catch(function(e){console.error('Erro ao carregar permissoes separadas', e);});

// Melhorias solicitadas: telefone do aluno, historico com aulas perdidas e filtro de modulos
import('./iv-custom-improvements.js?v=1').catch(function(e){console.error('Erro ao carregar melhorias personalizadas do IV', e);});

// Ajuste fino: rotulo Telefone e coluna na ordem Nome -> Telefone
import('./iv-phone-column-order-fix.js?v=1').catch(function(e){console.error('Erro ao carregar ajuste da coluna telefone', e);});

// Ajuste visual: botoes do link e aulas perdidas compactas em sanfona
import('./iv-report-compact-ui-fix.js?v=1').catch(function(e){console.error('Erro ao carregar ajuste compacto dos relatorios', e);});

// Ajustes gerais: tabela de alunos, telefone, relatorio de retencao e cabecalho de presenca
import('./iv-system-adjustments-202607.js?v=2').catch(function(e){console.error('Erro ao carregar ajustes gerais do sistema', e);});

// Regras de cadastro: nome repetido, nomes padronizados e modal de link compacto
import('./iv-student-rules-modal-fix.js?v=1').catch(function(e){console.error('Erro ao carregar regras de alunos e modal compacto', e);});

// Correcao final: retencao, historico sem botao Ver, login sem flash e tabela de equipes compacta
import('./iv-final-retention-history-login-teams.js?v=1').catch(function(e){console.error('Erro ao carregar correcao final de retencao/historico/login/equipes', e);});

// Pesquisa sem diferenciar maiusculas, minusculas e acentos nas telas Alunos e Presenca
import('./iv-search-case-insensitive-fix.js?v=1').catch(function(e){console.error('Erro ao carregar ajuste de pesquisa sem diferenciar letras', e);});

// Historico de um Vencedor: trajetoria completa com presencas, faltas e sanfona de aulas perdidas
import('./iv-history-trajectory-accordion-fix.js?v=2').catch(function(e){console.error('Erro ao carregar historico de trajetoria com sanfona', e);});

// Dashboard mobile seguro: somente titulo premium, sem esconder o conteudo original
import('./iv-mobile-dashboard-menu.js?v=20260714-3').catch(function(e){console.error('Erro ao carregar titulo mobile do dashboard', e);});

// Menu mobile hamburger
import('./iv-mobile-hamburger-menu-fix.js?v=20260714-3').catch(function(e){console.error('Erro ao carregar menu hamburger mobile', e);});

// Pagina Alunos mobile compacta com sanfona
import('./iv-mobile-students-page.js?v=20260714-3').catch(function(e){console.error('Erro ao carregar pagina mobile de alunos', e);});

// Pagina Equipes mobile
import('./iv-mobile-teams-page.js?v=20260714-3').catch(function(e){console.error('Erro ao carregar pagina mobile de equipes', e);});

// Pagina Presenca mobile
import('./iv-mobile-presence-page.js?v=20260714-3').catch(function(e){console.error('Erro ao carregar pagina mobile de presenca', e);});

// Revisão por aluno, tabela premium e avanço seletivo. Carregamento sequencial e sem observadores globais.
setTimeout(function(){
  import('./iv-revision-core.js?v=20260714-1')
    .then(function(){
      return Promise.all([
        import('./iv-student-table-premium.js?v=20260714-1'),
        import('./iv-advance-selective.js?v=20260714-1')
      ]);
    })
    .catch(function(e){console.error('Erro ao carregar melhorias seguras de alunos e revisões', e);});
},1200);

// Recovery deploy marker 2026-07-14

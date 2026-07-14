// Bootstrap visual imediato: evita mostrar a tela de login enquanto a sessão está sendo validada.
(function(){
  if(!document.body || !document.body.classList.contains('auth-lock')) return;
  if(!document.getElementById('iv-auth-loader-bootstrap-style')){
    var s=document.createElement('style');
    s.id='iv-auth-loader-bootstrap-style';
    s.textContent='body.iv-auth-validating #auth-screen{visibility:hidden!important;opacity:0!important;pointer-events:none!important}#iv-auth-loader{position:fixed;inset:0;z-index:1000001;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;background-image:radial-gradient(circle farthest-corner at center,#3C4B57 0%,#1C262B 100%)}#iv-auth-loader .loader{position:relative;width:64px;height:64px;border-radius:50%;perspective:800px}#iv-auth-loader .inner{position:absolute;box-sizing:border-box;width:100%;height:100%;border-radius:50%}#iv-auth-loader .inner.one{left:0;top:0;animation:iv-rotate-one 1s linear infinite;border-bottom:3px solid #EFEFFA}#iv-auth-loader .inner.two{right:0;top:0;animation:iv-rotate-two 1s linear infinite;border-right:3px solid #EFEFFA}#iv-auth-loader .inner.three{right:0;bottom:0;animation:iv-rotate-three 1s linear infinite;border-top:3px solid #EFEFFA}.iv-auth-loader-text{font:800 12px "DM Sans",sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#EFEFFA}@keyframes iv-rotate-one{0%{transform:rotateX(35deg) rotateY(-45deg) rotateZ(0)}100%{transform:rotateX(35deg) rotateY(-45deg) rotateZ(360deg)}}@keyframes iv-rotate-two{0%{transform:rotateX(50deg) rotateY(10deg) rotateZ(0)}100%{transform:rotateX(50deg) rotateY(10deg) rotateZ(360deg)}}@keyframes iv-rotate-three{0%{transform:rotateX(35deg) rotateY(55deg) rotateZ(0)}100%{transform:rotateX(35deg) rotateY(55deg) rotateZ(360deg)}}';
    document.head.appendChild(s);
  }
  document.body.classList.add('iv-auth-validating');
  if(!document.getElementById('iv-auth-loader')){
    var o=document.createElement('div');
    o.id='iv-auth-loader';
    o.innerHTML='<div class="loader"><div class="inner one"></div><div class="inner two"></div><div class="inner three"></div></div><div class="iv-auth-loader-text">Validando acesso...</div>';
    document.body.appendChild(o);
  }
})();

// Acabamento visual e controle seguro do carregamento/autenticação
import('./iv-ui-auth-polish.js?v=20260714-1').catch(function(e){console.error('Erro ao carregar acabamento da autenticação', e);});

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
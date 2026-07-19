// IV - auditoria de presença com usuário responsável
(function () {
  'use strict';

  if (window.__IV_PRESENCE_HISTORY_AUDIT_V2__) return;
  window.__IV_PRESENCE_HISTORY_AUDIT_V2__ = true;

  function db() {
    try { return typeof DB !== 'undefined' ? DB : null; }
    catch (error) { return null; }
  }

  function alunoNome(id) {
    var banco = db();
    var aluno = banco && Array.isArray(banco.alunos)
      ? banco.alunos.find(function (item) { return String(item.id) === String(id); })
      : null;
    return aluno && aluno.nome ? aluno.nome : 'Aluno ' + id;
  }

  function semanaNome(modulo, semana) {
    try {
      var item = MODULOS[Number(modulo)].semanas[Number(semana)];
      return item && item.label ? item.label : 'Semana ' + (Number(semana) + 1);
    } catch (error) {
      return 'Semana ' + (Number(semana) + 1);
    }
  }

  function aulaNome(aula) {
    if (aula === 'INAU') return 'Aula Inaugural';
    if (aula === 'AP') return 'Apresentação';
    return 'Aula ' + String(aula).padStart(2, '0');
  }

  function registrar(acao, alvo, detalhe) {
    if (typeof window.registrarAlteracaoIV === 'function') {
      window.registrarAlteracaoIV('presenca', acao, alvo, detalhe);
    }
  }

  function wrapToggle() {
    var original = window.togglePres;
    if (typeof original !== 'function' || original._ivPresenceHistoryAuditV2) return;

    var wrapped = function (alunoId, modulo, semana, aula) {
      var banco = db();
      var chave = typeof presKey === 'function'
        ? presKey(alunoId, modulo, semana, aula)
        : alunoId + '_' + modulo + '_' + semana + '_' + aula;
      var antes = !!(banco && banco.presencas && banco.presencas[chave]);
      var tamanhoAntes = banco && Array.isArray(banco.historicoAlteracoes) ? banco.historicoAlteracoes.length : 0;

      var resultado = original.apply(this, arguments);

      banco = db();
      var depois = !!(banco && banco.presencas && banco.presencas[chave]);
      var tamanhoDepois = banco && Array.isArray(banco.historicoAlteracoes) ? banco.historicoAlteracoes.length : 0;

      if (antes !== depois && tamanhoDepois === tamanhoAntes) {
        registrar(
          depois ? 'Marcou presença' : 'Removeu presença',
          alunoNome(alunoId),
          'Módulo ' + modulo + ' · ' + semanaNome(modulo, semana) + ' · ' + aulaNome(aula)
        );
      }
      return resultado;
    };

    wrapped._ivPresenceHistoryAuditV2 = true;
    window.togglePres = wrapped;
  }

  function wrapTodos() {
    var original = window.marcarTodos;
    if (typeof original !== 'function' || original._ivPresenceHistoryAuditV2) return;

    var wrapped = function (presente) {
      var banco = db();
      var antes = Object.assign({}, banco && banco.presencas || {});
      var tamanhoAntes = banco && Array.isArray(banco.historicoAlteracoes) ? banco.historicoAlteracoes.length : 0;
      var modulo = (document.getElementById('pres-modulo') || {}).value || '';
      var semana = (document.getElementById('pres-semana') || {}).value || '';

      var resultado = original.apply(this, arguments);

      banco = db();
      var depois = banco && banco.presencas || {};
      var alterados = 0;
      var chaves = Object.create(null);
      Object.keys(antes).forEach(function (chave) { chaves[chave] = true; });
      Object.keys(depois).forEach(function (chave) { chaves[chave] = true; });
      Object.keys(chaves).forEach(function (chave) {
        if (!!antes[chave] !== !!depois[chave]) alterados++;
      });

      var tamanhoDepois = banco && Array.isArray(banco.historicoAlteracoes) ? banco.historicoAlteracoes.length : 0;
      if (alterados > 0 && tamanhoDepois === tamanhoAntes) {
        registrar(
          presente ? 'Marcou todos presentes' : 'Marcou todos ausentes',
          'Lançamento em massa',
          'Módulo ' + modulo + ' · ' + semanaNome(modulo, semana) + ' · ' + alterados + ' registro(s) alterado(s)'
        );
      }
      return resultado;
    };

    wrapped._ivPresenceHistoryAuditV2 = true;
    window.marcarTodos = wrapped;
  }

  function instalar() {
    wrapToggle();
    wrapTodos();
  }

  function agendar() {
    setTimeout(instalar, 0);
    setTimeout(instalar, 250);
    setTimeout(instalar, 900);
  }

  function wrapShowPage() {
    var original = window.showPage;
    if (typeof original !== 'function' || original._ivPresenceHistoryAuditPage) return;

    var wrapped = function (pagina) {
      var resultado = original.apply(this, arguments);
      if (pagina === 'presenca') agendar();
      return resultado;
    };
    wrapped._ivPresenceHistoryAuditPage = true;
    window.showPage = wrapped;
  }

  function iniciar() {
    instalar();
    wrapShowPage();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar, { once: true });
  } else {
    iniciar();
  }
  document.addEventListener('firebase-ready', agendar);
  window.addEventListener('pageshow', agendar);
})();

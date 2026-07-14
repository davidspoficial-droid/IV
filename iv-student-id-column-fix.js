// IV - remove imediatamente a coluna interna de ID/numeração do renderizador legado
(function(){
  'use strict';

  function ready(fn){
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, {once:true});
    else fn();
  }

  function normalize(value){
    return String(value || '')
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g,'')
      .toLowerCase();
  }

  function removeLegacyIdColumn(){
    var body = document.getElementById('tb-alunos');
    if(!body) return;

    var table = body.closest('table');
    var header = table && table.querySelector('thead tr');

    // Cabeçalho antigo: checkbox, #/ID, inscrição, nome...
    if(header && !header.querySelector('[data-col]')){
      var headers = Array.prototype.slice.call(header.children);
      var idIndex = headers.findIndex(function(cell){
        var text = normalize(cell.textContent);
        return text === '#' || text === 'id' || text === 'nº' || text === 'n°' || text === 'numero';
      });
      if(idIndex > 0 && headers[idIndex]) headers[idIndex].remove();
    }

    // Linhas antigas não possuem data-col e trazem a numeração sequencial na segunda célula.
    Array.prototype.forEach.call(body.querySelectorAll('tr'), function(row){
      if(row.querySelector('[data-col]')) return;
      var cells = row.children;
      if(cells.length < 3) return;
      var internalId = cells[1];
      if(internalId && /^\s*\d+\s*$/.test(internalId.textContent || '')) internalId.remove();
    });
  }

  function schedule(){
    removeLegacyIdColumn();
    window.setTimeout(removeLegacyIdColumn, 0);
    window.setTimeout(removeLegacyIdColumn, 40);
    window.setTimeout(removeLegacyIdColumn, 110);
  }

  function patchRender(){
    var current = window.renderAlunos;
    if(typeof current !== 'function' || current._ivNoLegacyStudentId) return;

    var wrapped = function(){
      var result = current.apply(this, arguments);
      // Executa no mesmo ciclo da pesquisa, antes da próxima pintura do navegador.
      removeLegacyIdColumn();
      window.setTimeout(removeLegacyIdColumn, 0);
      return result;
    };
    wrapped._ivNoLegacyStudentId = true;
    window.renderAlunos = wrapped;
  }

  function bind(){
    if(document.documentElement.dataset.ivNoLegacyStudentIdBound) return;
    document.documentElement.dataset.ivNoLegacyStudentIdBound = '1';

    document.addEventListener('input', function(event){
      if(event.target && (event.target.id === 'busca-aluno' || event.target.id === 'iv-stu-search')) schedule();
    }, true);

    document.addEventListener('change', function(event){
      if(!event.target) return;
      if(event.target.matches('#filtro-equipe,#filtro-turma,#filtro-revisao,#iv-stu-equipe,#iv-stu-turma,#iv-stu-revisao')) schedule();
    }, true);
  }

  function init(){
    patchRender();
    bind();
    schedule();
  }

  ready(function(){
    init();
    window.setTimeout(init, 500);
    window.setTimeout(init, 1500);
    // Carrega por último para estabilizar a tabela e o modal depois dos demais módulos.
    window.setTimeout(function(){
      import('./iv-student-advance-stability.js?v=20260714-1').catch(function(error){
        console.error('Erro ao carregar estabilidade de alunos e avanço', error);
      });
    }, 1900);
  });
})();
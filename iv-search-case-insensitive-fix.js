// IV - pesquisa de alunos e presenca sem diferenciar maiusculas, minusculas e acentos
(function(){
  'use strict';

  function ready(fn){
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, {once:true});
    else fn();
  }

  function norm(v){
    return String(v || '')
      .trim()
      .replace(/\s+/g, ' ')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('pt-BR');
  }

  function filtrarLinhas(tbodyId, query, colspan, vazioMsg){
    var tb = document.getElementById(tbodyId);
    if(!tb) return;

    var q = norm(query);
    var rows = Array.prototype.slice.call(tb.querySelectorAll('tr'));
    var visiveis = 0;

    rows.forEach(function(row){
      if(row.dataset && row.dataset.ivEmptySearch === '1'){
        row.remove();
        return;
      }
      var texto = norm(row.textContent || '');
      var ok = !q || texto.indexOf(q) >= 0;
      row.style.display = ok ? '' : 'none';
      if(ok) visiveis++;
    });

    if(q && visiveis === 0){
      var tr = document.createElement('tr');
      tr.dataset.ivEmptySearch = '1';
      tr.innerHTML = '<td colspan="' + colspan + '" style="text-align:center;padding:32px;color:var(--muted)">' + vazioMsg + '</td>';
      tb.appendChild(tr);
    }
  }

  function patchAlunos(){
    if(typeof window.renderAlunos !== 'function' || window.renderAlunos._ivSearchInsensitive) return;
    var old = window.renderAlunos;

    window.renderAlunos = function(){
      var input = document.getElementById('busca-aluno');
      var termo = input ? input.value : '';

      if(input) input.value = '';
      var r = old.apply(this, arguments);
      if(input) input.value = termo;

      filtrarLinhas('tb-alunos', termo, 10, 'Nenhum aluno encontrado');
      if(typeof updateSelUI === 'function') updateSelUI();
      return r;
    };
    window.renderAlunos._ivSearchInsensitive = true;
  }

  function patchPresenca(){
    if(typeof window.renderPresencaTabela !== 'function' || window.renderPresencaTabela._ivSearchInsensitive) return;
    var old = window.renderPresencaTabela;

    window.renderPresencaTabela = function(){
      var input = document.getElementById('pres-busca');
      var termo = input ? input.value : '';

      if(input) input.value = '';
      var r = old.apply(this, arguments);
      if(input) input.value = termo;

      filtrarLinhas('tb-presenca', termo, 6, 'Nenhum aluno encontrado na pesquisa');
      atualizarContadorPresencaFiltrado();
      return r;
    };
    window.renderPresencaTabela._ivSearchInsensitive = true;
  }

  function atualizarContadorPresencaFiltrado(){
    var busca = norm((document.getElementById('pres-busca') || {}).value || '');
    if(!busca) return;

    var contador = document.getElementById('pres-contador');
    var moduloEl = document.getElementById('pres-modulo');
    var semanaEl = document.getElementById('pres-semana');
    if(!contador || !moduloEl || !semanaEl) return;

    try{
      var modulo = parseInt(moduloEl.value, 10);
      var semIdx = parseInt(semanaEl.value, 10);
      var aulas = MODULOS[modulo].semanas[semIdx].aulas || [];
      var rows = Array.prototype.slice.call(document.querySelectorAll('#tb-presenca tr')).filter(function(row){
        return row.style.display !== 'none' && !(row.dataset && row.dataset.ivEmptySearch === '1');
      });
      var totalPres = 0;
      rows.forEach(function(row){
        totalPres += row.querySelectorAll('.pres-dot.sim').length;
      });
      var max = rows.length * aulas.length;
      contador.textContent = totalPres + ' de ' + max + ' presenças registradas na pesquisa';
    }catch(e){}
  }

  function patchInputs(){
    var aluno = document.getElementById('busca-aluno');
    if(aluno && !aluno.dataset.ivSearchInsensitive){
      aluno.dataset.ivSearchInsensitive = '1';
      aluno.addEventListener('input', function(){ if(typeof renderAlunos === 'function') renderAlunos(); });
    }

    var pres = document.getElementById('pres-busca');
    if(pres && !pres.dataset.ivSearchInsensitive){
      pres.dataset.ivSearchInsensitive = '1';
      pres.addEventListener('input', function(){ if(typeof renderPresencaTabela === 'function') renderPresencaTabela(); });
    }
  }

  function aplicar(){
    patchAlunos();
    patchPresenca();
    patchInputs();
  }

  ready(function(){
    aplicar();
    setTimeout(aplicar, 300);
    setTimeout(aplicar, 900);
    setTimeout(aplicar, 1800);
  });
})();

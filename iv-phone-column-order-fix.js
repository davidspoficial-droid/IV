// IV — ajuste final do campo/coluna Telefone
(function(){
  'use strict';

  function ready(fn){
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, {once:true});
    else fn();
  }

  function normalizarCampoTelefone(){
    var input = document.getElementById('al-telefone');
    if(!input) return;

    var box = input.closest('div') || input.parentElement;
    if(box){
      var label = box.querySelector('label');
      if(label) label.textContent = 'Telefone';

      var hint = box.querySelector('.iv-phone-input-hint');
      if(hint) hint.remove();
    }
  }

  function moverTelefoneDepoisDoNome(){
    var page = document.getElementById('page-alunos');
    var tbody = document.getElementById('tb-alunos');
    if(!page || !tbody) return;

    var headerRow = page.querySelector('thead tr');
    if(headerRow){
      var phoneTh = headerRow.querySelector('[data-iv-phone-th]');
      if(phoneTh){
        phoneTh.textContent = 'Telefone';
        var nomeTh = Array.prototype.find.call(headerRow.children, function(th){
          return (th.textContent || '').trim().toLowerCase() === 'nome';
        });
        if(nomeTh && nomeTh.nextSibling !== phoneTh){
          headerRow.insertBefore(phoneTh, nomeTh.nextSibling);
        }
      }
    }

    Array.prototype.forEach.call(tbody.children, function(tr){
      var phoneTd = tr.querySelector('.iv-phone-cell');
      if(!phoneTd) return;

      var cells = Array.prototype.slice.call(tr.children);
      var currentIndex = cells.indexOf(phoneTd);
      var nomeTd = cells[currentIndex + 1] || tr.children[3];

      if(nomeTd && nomeTd !== phoneTd && nomeTd.nextSibling !== phoneTd){
        tr.insertBefore(phoneTd, nomeTd.nextSibling);
      }
    });
  }

  function aplicarAjuste(){
    normalizarCampoTelefone();
    moverTelefoneDepoisDoNome();
  }

  function wrapRenderAlunos(){
    if(typeof window.renderAlunos !== 'function' || window.renderAlunos._ivPhoneOrderFix) return;
    var old = window.renderAlunos;
    window.renderAlunos = function(){
      var r = old.apply(this, arguments);
      setTimeout(aplicarAjuste, 0);
      setTimeout(aplicarAjuste, 80);
      return r;
    };
    window.renderAlunos._ivPhoneOrderFix = true;
  }

  function wrapOpenAlunoModal(){
    if(typeof window.openAlunoModal !== 'function' || window.openAlunoModal._ivPhoneLabelFix) return;
    var old = window.openAlunoModal;
    window.openAlunoModal = function(){
      var r = old.apply(this, arguments);
      setTimeout(normalizarCampoTelefone, 0);
      setTimeout(normalizarCampoTelefone, 80);
      return r;
    };
    window.openAlunoModal._ivPhoneLabelFix = true;
  }

  function init(){
    wrapRenderAlunos();
    wrapOpenAlunoModal();
    aplicarAjuste();
    setTimeout(function(){ wrapRenderAlunos(); wrapOpenAlunoModal(); aplicarAjuste(); }, 250);
    setTimeout(function(){ wrapRenderAlunos(); wrapOpenAlunoModal(); aplicarAjuste(); }, 900);
    setTimeout(function(){ wrapRenderAlunos(); wrapOpenAlunoModal(); aplicarAjuste(); }, 1800);
  }

  ready(init);
})();

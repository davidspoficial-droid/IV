// IV — regras de cadastro de alunos + modal de link premium compacto
(function(){
  'use strict';

  var STYLE_ID = 'iv-student-rules-modal-fix-style';

  function ready(fn){
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, {once:true});
    else fn();
  }

  function getDB(){
    try { return typeof DB !== 'undefined' ? DB : null; } catch(e){ return null; }
  }

  function avisar(msg){
    if(typeof toast === 'function') toast(msg, true);
    else alert(msg);
  }

  function nomeNormalizado(nome){
    return String(nome || '')
      .trim()
      .replace(/\s+/g, ' ')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('pt-BR');
  }

  function nomePadrao(nome){
    return String(nome || '')
      .trim()
      .replace(/\s+/g, ' ')
      .toLocaleLowerCase('pt-BR')
      .replace(/(^|[\s'’-])([a-zà-ÿ])/g, function(_, sep, letra){
        return sep + letra.toLocaleUpperCase('pt-BR');
      });
  }

  function alunoDuplicado(nome, idIgnorar){
    var D = getDB();
    if(!D || !Array.isArray(D.alunos)) return null;
    var alvo = nomeNormalizado(nome);
    if(!alvo) return null;
    return D.alunos.find(function(al){
      return String(al.id) !== String(idIgnorar || '') && nomeNormalizado(al.nome) === alvo;
    }) || null;
  }

  function aplicarCSSModal(){
    if(document.getElementById(STYLE_ID)) return;
    var css = document.createElement('style');
    css.id = STYLE_ID;
    css.textContent = `
      #modal-link > div{
        max-width:720px!important;
        width:min(720px,calc(100vw - 34px))!important;
        padding:24px!important;
        border-radius:22px!important;
        background:linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.014)),#07111F!important;
        border:1px solid rgba(126,200,240,.18)!important;
        box-shadow:0 34px 90px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.06)!important;
      }
      #modal-link .iv-link-actions-premium,
      #modal-link div[style*="justify-content:flex-end"]{
        display:flex!important;
        flex-direction:row!important;
        flex-wrap:nowrap!important;
        align-items:center!important;
        justify-content:center!important;
        gap:10px!important;
        margin-top:14px!important;
      }
      #modal-link .iv-link-actions-premium .btn,
      #modal-link div[style*="justify-content:flex-end"] .btn{
        width:auto!important;
        min-width:118px!important;
        min-height:38px!important;
        height:38px!important;
        padding:8px 15px!important;
        border-radius:999px!important;
        font-size:12px!important;
        font-weight:850!important;
        letter-spacing:.01em!important;
        justify-content:center!important;
        flex:0 0 auto!important;
        box-shadow:0 12px 26px rgba(0,0,0,.24),inset 0 1px 0 rgba(255,255,255,.08)!important;
      }
      #modal-link #whats-preview{
        margin-bottom:12px!important;
      }
      @media(max-width:620px){
        #modal-link .iv-link-actions-premium,
        #modal-link div[style*="justify-content:flex-end"]{
          flex-wrap:wrap!important;
          justify-content:center!important;
        }
        #modal-link .iv-link-actions-premium .btn,
        #modal-link div[style*="justify-content:flex-end"] .btn{
          min-width:calc(50% - 8px)!important;
          flex:1 1 calc(50% - 8px)!important;
        }
      }
    `;
    document.head.appendChild(css);
  }

  function reforcarModal(){
    aplicarCSSModal();
    var modal = document.getElementById('modal-link');
    if(!modal) return;
    var input = document.getElementById('link-gerado');
    var actions = input && input.nextElementSibling;
    if(actions && actions.classList) actions.classList.add('iv-link-actions-premium');
  }

  function patchNomeAluno(){
    var input = document.getElementById('al-nome');
    if(input && !input.dataset.ivNameTitleCase){
      input.dataset.ivNameTitleCase = '1';
      input.addEventListener('blur', function(){
        this.value = nomePadrao(this.value);
      });
    }
  }

  function patchSalvarAluno(){
    if(typeof window.salvarAluno !== 'function' || window.salvarAluno._ivDuplicadoNome) return;

    var old = window.salvarAluno;
    window.salvarAluno = function(){
      var nomeInput = document.getElementById('al-nome');
      var id = (document.getElementById('al-id') || {}).value || '';
      if(nomeInput){
        nomeInput.value = nomePadrao(nomeInput.value);
        var nome = nomeInput.value.trim();
        var duplicado = alunoDuplicado(nome, id);
        if(duplicado){
          avisar('Esse aluno já está cadastrado: ' + (duplicado.nome || nome) + '. Revise o cadastro antes de salvar novamente.');
          nomeInput.focus();
          nomeInput.select && nomeInput.select();
          return false;
        }
      }
      return old.apply(this, arguments);
    };
    window.salvarAluno._ivDuplicadoNome = true;
  }

  function patchOpenAlunoModal(){
    if(typeof window.openAlunoModal !== 'function' || window.openAlunoModal._ivNomePadrao) return;
    var old = window.openAlunoModal;
    window.openAlunoModal = function(){
      var r = old.apply(this, arguments);
      setTimeout(patchNomeAluno, 0);
      return r;
    };
    window.openAlunoModal._ivNomePadrao = true;
  }

  function parseLinhaParaValidacao(linha){
    if(typeof window.parseLinha === 'function') return window.parseLinha(linha);
    var sep = linha.indexOf(';') >= 0 ? ';' : linha.indexOf(',') >= 0 ? ',' : null;
    if(!sep) return {nome:linha.trim()};
    var parts = linha.split(sep).map(function(p){ return p.trim(); });
    if(parts[0] === '1' || parts[0] === '2' || parts[0] === '3') return {nome:parts[1] || ''};
    return {nome:parts[0] || ''};
  }

  function patchImportacao(){
    if(typeof window.importarAlunos === 'function' && !window.importarAlunos._ivDuplicadoNome){
      var oldImport = window.importarAlunos;
      window.importarAlunos = function(){
        var txt = document.getElementById('imp-nomes');
        if(txt && txt.value.trim()){
          var linhas = txt.value.split('\n').map(function(l){ return l.trim(); }).filter(Boolean);
          var vistos = {};
          var D = getDB();
          for(var i = 0; i < linhas.length; i++){
            var dados = parseLinhaParaValidacao(linhas[i]);
            var nome = nomePadrao(dados.nome || '');
            var chave = nomeNormalizado(nome);
            if(!chave) continue;
            if(vistos[chave]){
              avisar('Nome repetido na lista de importação: ' + nome + '. Revise antes de importar.');
              return false;
            }
            vistos[chave] = true;
            if(D && Array.isArray(D.alunos)){
              var existe = D.alunos.find(function(al){ return nomeNormalizado(al.nome) === chave; });
              if(existe){
                avisar('Esse aluno já está cadastrado: ' + (existe.nome || nome) + '. Revise antes de importar.');
                return false;
              }
            }
          }
        }
        return oldImport.apply(this, arguments);
      };
      window.importarAlunos._ivDuplicadoNome = true;
    }

    if(typeof window.parseLinha === 'function' && !window.parseLinha._ivNomePadrao){
      var oldParse = window.parseLinha;
      window.parseLinha = function(linha){
        var r = oldParse.apply(this, arguments);
        if(r && r.nome) r.nome = nomePadrao(r.nome);
        return r;
      };
      window.parseLinha._ivNomePadrao = true;
    }
  }

  function patchRelatorioModal(){
    ['gerarRelatorioLink','copiarLink','abrirWhatsApp'].forEach(function(fn){
      if(typeof window[fn] !== 'function' || window[fn]._ivModalCompacto) return;
      var old = window[fn];
      window[fn] = function(){
        var r = old.apply(this, arguments);
        setTimeout(reforcarModal, 0);
        setTimeout(reforcarModal, 120);
        return r;
      };
      window[fn]._ivModalCompacto = true;
    });
    reforcarModal();
  }

  function aplicar(){
    aplicarCSSModal();
    patchNomeAluno();
    patchSalvarAluno();
    patchOpenAlunoModal();
    patchImportacao();
    patchRelatorioModal();
  }

  ready(function(){
    aplicar();
    setTimeout(aplicar, 300);
    setTimeout(aplicar, 900);
    setTimeout(aplicar, 1800);
  });
})();

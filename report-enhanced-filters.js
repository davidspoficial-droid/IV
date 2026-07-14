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

// Entrada única, seguida pela otimização final da navegação.
import('./iv-app-unified.js?v=20260714-2')
  .then(function(){ return import('./iv-navigation-speed-colors.js?v=20260714-1'); })
  .catch(function(error){ console.error('Erro ao iniciar aplicação unificada do IV', error); });
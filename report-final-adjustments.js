// FINAL_REPORT_OVERRIDE_V8
import('./report-mobile-premium.js?v=1');

(function(){
  const css = `
  body.auth-lock #loading-overlay,
  body.auth-lock #login,
  body.auth-lock #shell,
  body.auth-lock iframe,
  body.auth-lock .login,
  body.auth-lock .top{
    display:none !important;
    opacity:0 !important;
    visibility:hidden !important;
    pointer-events:none !important;
  }

  body.auth-lock #auth-screen{
    background:
      radial-gradient(circle at 18% 8%, rgba(47,128,237,.34), transparent 34%),
      radial-gradient(circle at 84% 14%, rgba(34,211,238,.20), transparent 32%),
      radial-gradient(circle at 50% 104%, rgba(126,200,240,.12), transparent 36%),
      linear-gradient(145deg,#020611 0%,#07111F 48%,#030712 100%) !important;
  }

  body.auth-lock #auth-screen::before{ opacity:.42 !important; }
  body.auth-lock #auth-screen::after{ opacity:.85 !important; filter:blur(26px) !important; }

  body.auth-lock .auth-card{
    width:min(500px,calc(100vw - 36px)) !important;
    padding:42px 36px 36px !important;
    border-radius:34px !important;
    background:
      linear-gradient(145deg,rgba(255,255,255,.105),rgba(255,255,255,.020) 42%,rgba(255,255,255,.012) 100%),
      linear-gradient(180deg,rgba(10,23,43,.975),rgba(5,13,26,.985)) !important;
    border:1px solid rgba(126,200,240,.26) !important;
    box-shadow:
      0 58px 150px rgba(0,0,0,.72),
      0 28px 70px rgba(0,0,0,.48),
      0 0 0 1px rgba(255,255,255,.025),
      inset 0 1px 0 rgba(255,255,255,.12),
      inset 0 -1px 0 rgba(126,200,240,.09) !important;
    overflow:visible !important;
  }

  body.auth-lock .auth-card::before{
    left:28px !important;
    right:28px !important;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,.70),rgba(126,200,240,.44),transparent) !important;
  }

  body.auth-lock .auth-card::after{
    content:"" !important;
    position:absolute !important;
    inset:-1px !important;
    border-radius:34px !important;
    pointer-events:none !important;
    background:linear-gradient(135deg,rgba(126,200,240,.20),transparent 28%,transparent 72%,rgba(47,128,237,.16)) !important;
    opacity:.68 !important;
    filter:none !important;
    z-index:-1 !important;
  }

  body.auth-lock .auth-brand{
    display:flex !important;
    flex-direction:column !important;
    align-items:center !important;
    justify-content:center !important;
    text-align:center !important;
    gap:18px !important;
    margin:0 0 32px !important;
  }

  body.auth-lock .auth-logo-shell{
    width:auto !important;
    height:auto !important;
    padding:0 !important;
    margin:0 !important;
    border:0 !important;
    border-radius:0 !important;
    background:transparent !important;
    box-shadow:none !important;
    display:flex !important;
    align-items:center !important;
    justify-content:center !important;
  }

  body.auth-lock .auth-logo{
    width:118px !important;
    max-width:118px !important;
    height:auto !important;
    border:0 !important;
    border-radius:0 !important;
    background:transparent !important;
    box-shadow:none !important;
    filter:
      brightness(1.48)
      contrast(1.18)
      saturate(1.22)
      drop-shadow(0 34px 36px rgba(0,0,0,.58))
      drop-shadow(0 18px 18px rgba(0,0,0,.36))
      drop-shadow(0 0 18px rgba(255,255,255,.10))
      drop-shadow(0 0 32px rgba(126,200,240,.36))
      drop-shadow(0 0 54px rgba(47,128,237,.22)) !important;
  }

  body.auth-lock .auth-card h1{
    font-size:38px !important;
    line-height:1.02 !important;
    letter-spacing:.012em !important;
    background:linear-gradient(90deg,#FFFFFF 0%,#F4FBFF 22%,#CFEFFF 62%,#7EC8F0 100%) !important;
    -webkit-background-clip:text !important;
    background-clip:text !important;
    color:transparent !important;
    filter:
      drop-shadow(0 22px 22px rgba(0,0,0,.68))
      drop-shadow(0 10px 10px rgba(0,0,0,.42))
      drop-shadow(0 0 18px rgba(126,200,240,.18)) !important;
  }

  body.auth-lock .auth-card label{
    color:#C2D7EF !important;
    text-shadow:0 8px 16px rgba(0,0,0,.45) !important;
  }

  body.auth-lock .auth-card input{
    background:linear-gradient(180deg,rgba(5,14,28,.98),rgba(8,20,37,.98)) !important;
    border-color:rgba(126,200,240,.20) !important;
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,.05),
      inset 0 -1px 0 rgba(0,0,0,.26),
      0 18px 38px rgba(0,0,0,.24) !important;
  }

  body.auth-lock .auth-card button{
    box-shadow:
      0 28px 58px rgba(47,128,237,.36),
      0 16px 26px rgba(0,0,0,.30),
      inset 0 1px 0 rgba(255,255,255,.28) !important;
  }

  @media(max-width:700px){
    body.auth-lock .auth-card{padding:34px 24px 28px !important;border-radius:28px !important;}
    body.auth-lock .auth-logo{width:96px !important;max-width:96px !important;}
    body.auth-lock .auth-card h1{font-size:30px !important;}
  }
  `;

  function cleanupOldLoginLayers(){
    try { localStorage.removeItem('iv_shell_session'); } catch(e) {}

    ['login','shell'].forEach(id => {
      const el = document.getElementById(id);
      if(el && !el.closest('#auth-screen')) el.remove();
    });

    document.querySelectorAll('iframe').forEach(frame => {
      const src = frame.getAttribute('src') || '';
      if(src.includes('index.html') || src.includes('app.html')) frame.remove();
    });

    const overlay = document.getElementById('loading-overlay');
    if(document.body.classList.contains('auth-lock') && overlay){
      overlay.classList.add('hide');
      overlay.style.display = 'none';
      overlay.style.visibility = 'hidden';
      overlay.style.opacity = '0';
    }
  }

  function applyLoginPremiumStyle(){
    let style = document.getElementById('iv-login-premium-depth-style');
    if(!style){
      style = document.createElement('style');
      style.id = 'iv-login-premium-depth-style';
      document.head.appendChild(style);
    }
    style.textContent = css;
    cleanupOldLoginLayers();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', applyLoginPremiumStyle);
  } else {
    applyLoginPremiumStyle();
  }

  setInterval(cleanupOldLoginLayers, 800);
})();

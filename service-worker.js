const IV_CACHE = 'iv-gestao-v6';

const LOGIN_PREMIUM_STYLE = `
<style id="iv-login-critical-premium">
body.auth-lock #loading-overlay{display:none!important;opacity:0!important;visibility:hidden!important;pointer-events:none!important}
body.auth-lock #auth-screen{z-index:999999!important;background:radial-gradient(circle at 18% 8%,rgba(47,128,237,.36),transparent 34%),radial-gradient(circle at 84% 14%,rgba(34,211,238,.22),transparent 32%),linear-gradient(145deg,#020611 0%,#07111F 48%,#030712 100%)!important}
body.auth-lock #auth-screen .auth-card{width:min(500px,calc(100vw - 36px))!important;border-radius:34px!important;background:linear-gradient(145deg,rgba(255,255,255,.11),rgba(255,255,255,.02)),linear-gradient(180deg,rgba(10,23,43,.98),rgba(5,13,26,.99))!important;box-shadow:0 64px 160px rgba(0,0,0,.76),0 30px 76px rgba(0,0,0,.52),inset 0 1px 0 rgba(255,255,255,.12)!important;overflow:visible!important}
body.auth-lock #auth-screen .auth-brand{flex-direction:column!important;text-align:center!important;align-items:center!important;gap:18px!important}
body.auth-lock #auth-screen .auth-logo-shell{width:auto!important;height:auto!important;padding:0!important;margin:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important}
body.auth-lock #auth-screen .auth-logo{width:118px!important;max-width:118px!important;background:transparent!important;border:0!important;border-radius:0!important;box-shadow:none!important;filter:brightness(1.6) contrast(1.2) saturate(1.3) drop-shadow(0 38px 38px rgba(0,0,0,.64)) drop-shadow(0 0 24px rgba(255,255,255,.28)) drop-shadow(0 0 44px rgba(126,200,240,.68)) drop-shadow(0 0 82px rgba(47,128,237,.46))!important;animation:ivLogoGlow 3.4s ease-in-out infinite!important}
body.auth-lock #auth-screen .auth-card h1{font-size:38px!important;background:linear-gradient(100deg,#fff 0%,#EAF8FF 18%,#7EC8F0 34%,#fff 48%,#BFEAFF 60%,#7EC8F0 76%,#fff 100%)!important;background-size:320% 100%!important;-webkit-background-clip:text!important;background-clip:text!important;color:transparent!important;filter:drop-shadow(0 24px 24px rgba(0,0,0,.74)) drop-shadow(0 0 24px rgba(126,200,240,.34))!important;animation:ivTextSweep 3.2s ease-in-out infinite!important}
@keyframes ivLogoGlow{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-2px) scale(1.025);filter:brightness(1.8) contrast(1.25) saturate(1.36) drop-shadow(0 42px 42px rgba(0,0,0,.66)) drop-shadow(0 0 34px rgba(255,255,255,.36)) drop-shadow(0 0 62px rgba(126,200,240,.82)) drop-shadow(0 0 106px rgba(47,128,237,.56))}}
@keyframes ivTextSweep{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
</style>
`;

self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

async function htmlPremiumResponse(request){
  const response = await fetch(request, { cache: 'no-store' });
  const original = await response.text();

  let html = original
    .replace(/<!-- LOADING OVERLAY -->[\s\S]*?<!-- SYNC BADGE -->/i, '<!-- SYNC BADGE -->')
    .replace('./report-final-adjustments.js?v=2', './report-final-adjustments.js?v=9');

  if(!html.includes('iv-login-critical-premium')){
    html = html.replace('</head>', LOGIN_PREMIUM_STYLE + '</head>');
  }

  return new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
    }
  });
}

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isHtml = event.request.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('.html');
  const isScriptOrCss = url.pathname.endsWith('.js') || url.pathname.endsWith('.css');

  if (isHtml) {
    event.respondWith(htmlPremiumResponse(event.request));
    return;
  }

  if (isScriptOrCss) {
    event.respondWith(fetch(event.request, { cache: 'no-store' }));
    return;
  }

  event.respondWith(fetch(event.request));
});

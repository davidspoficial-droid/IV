const IV_CACHE = 'iv-gestao-pwa-v7';
const APP_ROOT = '/';

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

function offlineHtml(){
  return new Response('<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#050A14"><title>IV Gestão</title><style>*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:#050A14;color:#E8F0FF;font-family:Arial,sans-serif}body{min-height:100dvh;display:grid;place-items:center;padding:24px}.box{max-width:420px;padding:24px;border:1px solid #1E2E4A;border-radius:22px;background:#0D1626;text-align:center;box-shadow:0 24px 70px rgba(0,0,0,.45)}h1{font-size:21px;margin:0 0 10px;color:#7EC8F0}p{font-size:13px;line-height:1.55;color:#9CB8D6;margin:0}</style></head><body><main class="box"><h1>IV Gestão</h1><p>Não foi possível conectar agora. Verifique a internet e abra o aplicativo novamente.</p></main></body></html>', {
    status: 200,
    headers: {'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}
  });
}

async function premiumHtml(response){
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

async function cacheShell(response){
  try{
    const cache = await caches.open(IV_CACHE);
    await cache.put(APP_ROOT, response.clone());
    await cache.put('/index.html', response.clone());
  }catch(error){}
  return response;
}

async function fetchRoot(){
  const response = await fetch(APP_ROOT, {cache:'no-store', redirect:'follow'});
  if(!response.ok) throw new Error('Falha ao abrir raiz');
  return cacheShell(await premiumHtml(response));
}

async function navigationResponse(request){
  try{
    const response = await fetch(request, {cache:'no-store', redirect:'follow'});
    if(!response.ok) throw new Error('Falha de navegação');
    return cacheShell(await premiumHtml(response));
  }catch(error){
    try{return await fetchRoot();}catch(rootError){}
    const cached = await caches.match(APP_ROOT) || await caches.match('/index.html');
    return cached || offlineHtml();
  }
}

self.addEventListener('install', event => {
  event.waitUntil((async function(){
    await self.skipWaiting();
    try{await fetchRoot();}catch(error){}
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async function(){
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key !== IV_CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if(event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if(url.origin !== self.location.origin) return;

  const isHtml = event.request.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('.html');
  const isScriptOrCss = url.pathname.endsWith('.js') || url.pathname.endsWith('.css') || url.pathname.endsWith('.json');

  if(isHtml){
    event.respondWith(navigationResponse(event.request));
    return;
  }

  if(isScriptOrCss){
    event.respondWith(fetch(event.request, {cache:'no-store'}).catch(() => caches.match(event.request)));
    return;
  }

  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});

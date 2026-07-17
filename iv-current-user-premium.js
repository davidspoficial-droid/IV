// IV - identificação premium do usuário logado, sem exibir e-mail
(function(){
  'use strict';
  if(window.__IV_CURRENT_USER_PREMIUM__) return;
  window.__IV_CURRENT_USER_PREMIUM__ = true;
  var timer = null;

  function profile(){
    try{
      if(window.IVPermissionAuthority && typeof window.IVPermissionAuthority.profile === 'function') return window.IVPermissionAuthority.profile();
      if(typeof window.getUsuarioAtual === 'function') return window.getUsuarioAtual();
      if(typeof CURRENT_PROFILE !== 'undefined' && CURRENT_PROFILE) return CURRENT_PROFILE;
    }catch(error){}
    return null;
  }

  function initials(name){
    var parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    if(!parts.length) return 'U';
    return ((parts[0][0] || '') + (parts.length > 1 ? parts[parts.length - 1][0] || '' : '')).toUpperCase();
  }

  function style(){
    if(document.getElementById('iv-current-user-premium-style')) return;
    var element = document.createElement('style');
    element.id = 'iv-current-user-premium-style';
    element.textContent =
      '.iv-current-user-premium{display:inline-flex;align-items:center;gap:8px;width:max-content;max-width:260px;margin-top:7px;padding:5px 10px 5px 6px;border-radius:999px;border:1px solid rgba(126,200,240,.24);background:linear-gradient(135deg,rgba(126,200,240,.12),rgba(47,128,237,.065)),rgba(5,13,26,.52);box-shadow:0 10px 24px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.07);color:#EAF7FF}' +
      '.iv-current-user-premium-avatar{width:24px;height:24px;flex:0 0 24px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#2F80ED,#22D3EE);color:#fff;font-size:9px;font-weight:950;letter-spacing:.02em;box-shadow:0 7px 16px rgba(47,128,237,.34),inset 0 1px 0 rgba(255,255,255,.25)}' +
      '.iv-current-user-premium-copy{min-width:0;display:flex;align-items:center;gap:6px}.iv-current-user-premium-dot{width:6px;height:6px;flex:0 0 6px;border-radius:50%;background:#3EC97A;box-shadow:0 0 10px rgba(62,201,122,.8)}' +
      '.iv-current-user-premium-name{min-width:0;max-width:205px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10.5px;line-height:1;font-weight:900;color:#DFF6FF}' +
      'body.auth-lock .iv-current-user-premium{display:none!important}' +
      '@media(max-width:820px){.iv-current-user-premium{margin-top:5px;max-width:185px;padding:4px 8px 4px 5px;gap:6px}.iv-current-user-premium-avatar{width:21px;height:21px;flex-basis:21px;font-size:8px}.iv-current-user-premium-name{max-width:132px;font-size:9.5px}}';
    document.head.appendChild(element);
  }

  function render(){
    style();
    var brand = document.querySelector('.header .brand-area');
    if(!brand) return;
    var host = brand.querySelector(':scope > div') || brand;
    var badge = document.getElementById('iv-current-user-premium');
    var user = profile();
    if(!user || user.ativo === false || !String(user.nome || '').trim()){
      if(badge) badge.remove();
      return;
    }
    if(!badge){
      badge = document.createElement('div');
      badge.id = 'iv-current-user-premium';
      badge.className = 'iv-current-user-premium';
      badge.setAttribute('aria-label','Usuário conectado');
      badge.innerHTML = '<span class="iv-current-user-premium-avatar"></span><span class="iv-current-user-premium-copy"><span class="iv-current-user-premium-dot"></span><span class="iv-current-user-premium-name"></span></span>';
      host.appendChild(badge);
    }
    badge.querySelector('.iv-current-user-premium-avatar').textContent = initials(user.nome);
    badge.querySelector('.iv-current-user-premium-name').textContent = String(user.nome).trim();
    badge.title = 'Usuário conectado: ' + String(user.nome).trim();
  }

  function patchAfter(name){
    var current = window[name];
    if(typeof current !== 'function' || current._ivCurrentUserPremium) return;
    var wrapped = function(){
      var result = current.apply(this,arguments);
      var done = function(){schedule();};
      if(result && typeof result.finally === 'function') result.finally(done); else setTimeout(done,0);
      return result;
    };
    try{Object.keys(current).forEach(function(key){wrapped[key]=current[key];});}catch(error){}
    wrapped._ivCurrentUserPremium = true;
    window[name] = wrapped;
  }

  function refresh(){
    patchAfter('entrarSistema');
    patchAfter('loadDB');
    patchAfter('sairSistema');
    render();
  }

  function schedule(){
    clearTimeout(timer);
    timer = setTimeout(refresh,0);
    [100,350,900,1800].forEach(function(delay){setTimeout(refresh,delay);});
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',schedule,{once:true}); else schedule();
  document.addEventListener('firebase-ready',schedule);
  window.addEventListener('pageshow',schedule);
  window.addEventListener('iv-concurrency-saved',schedule);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)schedule();});
})();

// IV - layout mobile proprio: dashboard e menu
(function(){
  'use strict';

  var STYLE_ID = 'iv-mobile-dashboard-menu-style';
  var mql = window.matchMedia('(max-width: 820px)');

  function ready(fn){
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, {once:true});
    else fn();
  }

  function DBx(){ try { return typeof DB !== 'undefined' ? DB : null; } catch(e){ return null; } }
  function MODx(){ try { return typeof MODULOS !== 'undefined' ? MODULOS : null; } catch(e){ return null; } }
  function presKeySafe(id,m,s,a){ if(typeof presKey === 'function') return presKey(id,m,s,a); return id + '_' + m + '_' + s + '_' + a; }
  function esc(v){ return String(v == null ? '' : v).replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]; }); }

  function ensureStyle(){
    if(document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
      #iv-mobile-dashboard{display:none;}
      @media(max-width:820px){
        body.iv-mobile-app{background:#050A14!important;padding-bottom:112px!important;overflow-x:hidden!important;}
        body.iv-mobile-app::before{opacity:.55!important;background-size:34px 34px!important;}
        body.iv-mobile-app .header{position:sticky!important;top:0!important;z-index:6400!important;min-height:58px!important;padding:8px 12px!important;border-bottom:1px solid rgba(126,200,240,.16)!important;background:linear-gradient(135deg,rgba(7,17,31,.98),rgba(13,31,55,.92))!important;box-shadow:0 14px 34px rgba(0,0,0,.36)!important;cursor:default!important;}
        body.iv-mobile-app .header::after{display:none!important;content:none!important;}
        body.iv-mobile-app .brand-area{gap:9px!important;min-width:0!important;}
        body.iv-mobile-app .brand-logo,body.iv-mobile-app .brand-mark img{width:38px!important;max-width:38px!important;height:auto!important;filter:brightness(1.28) contrast(1.12) drop-shadow(0 8px 14px rgba(0,0,0,.42))!important;}
        body.iv-mobile-app .header-logo{font-size:15px!important;max-width:calc(100vw - 116px)!important;line-height:1.02!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;}
        body.iv-mobile-app .header-subtitle{display:block!important;font-size:9px!important;color:#86A6CA!important;max-width:calc(100vw - 116px)!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;margin-top:2px!important;}
        body.iv-mobile-app .auth-logout{display:inline-flex!important;margin-left:auto!important;width:36px!important;height:36px!important;padding:0!important;border-radius:14px!important;justify-content:center!important;}
        body.iv-mobile-app .auth-logout span:not(.auth-logout-icon){display:none!important;}
        body.iv-mobile-app .auth-logout-icon{width:18px!important;height:18px!important;}

        body.iv-mobile-app .main-nav{position:fixed!important;left:10px!important;right:10px!important;bottom:10px!important;top:auto!important;width:auto!important;height:auto!important;z-index:7600!important;display:grid!important;grid-template-columns:repeat(3,1fr)!important;gap:6px!important;padding:8px!important;border:1px solid rgba(126,200,240,.18)!important;border-radius:22px!important;background:linear-gradient(145deg,rgba(8,19,36,.94),rgba(5,12,24,.94))!important;box-shadow:0 18px 48px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.06)!important;backdrop-filter:blur(18px)!important;-webkit-backdrop-filter:blur(18px)!important;transform:none!important;overflow:visible!important;}
        body.iv-mobile-app .main-nav::before{display:none!important;content:none!important;}
        body.iv-mobile-app .mnav{height:40px!important;min-width:0!important;padding:4px 3px!important;border-radius:16px!important;font-size:10px!important;line-height:1.05!important;font-weight:850!important;text-align:center!important;display:flex!important;align-items:center!important;justify-content:center!important;white-space:normal!important;color:#9CB8D6!important;border:1px solid rgba(126,200,240,.08)!important;background:rgba(255,255,255,.018)!important;}
        body.iv-mobile-app .mnav.active{background:linear-gradient(135deg,#2F80ED,#22D3EE)!important;color:#fff!important;border-color:rgba(255,255,255,.22)!important;box-shadow:0 12px 26px rgba(47,128,237,.28)!important;}
        body.iv-mobile-app .mnav:hover:not(.active){background:rgba(126,200,240,.08)!important;color:#DFF6FF!important;}

        body.iv-mobile-app .page{max-width:100%!important;width:100%!important;padding:14px 10px 118px!important;margin:0!important;}
        body.iv-mobile-app #page-dashboard{padding-top:12px!important;}
        body.iv-mobile-app #page-dashboard > :not(#iv-mobile-dashboard){display:none!important;}
        body.iv-mobile-app #iv-mobile-dashboard{display:block!important;}
        body.iv-mobile-app .mobile-list{display:block!important;}

        .iv-mobile-hero{padding:14px 14px 12px;border:1px solid rgba(126,200,240,.16);border-radius:22px;background:radial-gradient(circle at 12% 0%,rgba(47,128,237,.22),transparent 36%),linear-gradient(145deg,rgba(255,255,255,.05),rgba(255,255,255,.012)),rgba(7,17,31,.78);box-shadow:0 18px 46px rgba(0,0,0,.30),inset 0 1px 0 rgba(255,255,255,.05);margin-bottom:10px;}
        .iv-mobile-hero-title{font-size:18px;font-weight:950;color:#fff;line-height:1.08;}
        .iv-mobile-hero-sub{font-size:11px;color:#8FAACB;margin-top:4px;line-height:1.35;}
        .iv-mobile-kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:10px 0 12px;}
        .iv-mkpi{aspect-ratio:1/1;border:1px solid rgba(126,200,240,.15);border-radius:18px;background:linear-gradient(145deg,rgba(255,255,255,.052),rgba(255,255,255,.012)),rgba(7,17,31,.82);box-shadow:0 14px 34px rgba(0,0,0,.24),inset 0 1px 0 rgba(255,255,255,.04);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:7px;position:relative;overflow:hidden;}
        .iv-mkpi::after{content:"";position:absolute;left:0;right:0;bottom:0;height:3px;background:var(--c,#7EC8F0);}
        .iv-mkpi-num{font-family:'Playfair Display',serif;font-size:24px;font-weight:950;line-height:1;color:var(--c,#7EC8F0);}
        .iv-mkpi-lbl{font-size:8.5px;color:#8FAACB;text-transform:uppercase;font-weight:900;letter-spacing:.05em;margin-top:5px;line-height:1.15;}
        .iv-m-section{margin-bottom:10px;border:1px solid rgba(126,200,240,.16);border-radius:20px;background:linear-gradient(145deg,rgba(255,255,255,.045),rgba(255,255,255,.010)),rgba(7,17,31,.72);overflow:hidden;box-shadow:0 16px 40px rgba(0,0,0,.24),inset 0 1px 0 rgba(255,255,255,.04);}
        .iv-m-section summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:10px;padding:13px 13px;color:#DFF6FF;font-size:13px;font-weight:950;letter-spacing:.01em;}
        .iv-m-section summary::-webkit-details-marker{display:none;}
        .iv-m-section-ico{width:30px;height:30px;min-width:30px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 30% 20%,rgba(255,255,255,.22),rgba(126,200,240,.10));border:1px solid rgba(126,200,240,.22);box-shadow:0 10px 22px rgba(0,0,0,.22);}
        .iv-m-section-chev{margin-left:auto;color:#7EC8F0;transition:.18s transform;}
        .iv-m-section[open] .iv-m-section-chev{transform:rotate(180deg);}
        .iv-m-body{padding:0 12px 13px;display:grid;gap:8px;}
        .iv-m-card{border:1px solid rgba(126,200,240,.12);border-radius:16px;padding:10px;background:rgba(255,255,255,.026);}
        .iv-m-card-top{display:flex;justify-content:space-between;gap:8px;align-items:center;font-size:12px;font-weight:900;color:#F4F8FF;margin-bottom:6px;}
        .iv-m-card-note{font-size:10.5px;color:#8FAACB;line-height:1.35;}
        .iv-m-bar{height:6px;border-radius:999px;background:rgba(126,200,240,.10);overflow:hidden;margin:7px 0 4px;}
        .iv-m-fill{height:100%;border-radius:999px;background:var(--c,#7EC8F0);width:var(--w,0%);}
        .iv-m-row{display:flex;justify-content:space-between;gap:10px;font-size:11px;color:#9CB8D6;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.045);}
        .iv-m-row:last-child{border-bottom:0;}
        .iv-m-tag{display:inline-flex;padding:3px 8px;border-radius:999px;font-size:10px;font-weight:900;background:rgba(126,200,240,.10);color:#BFEAFF;border:1px solid rgba(126,200,240,.16);}
        .iv-m-empty{font-size:12px;color:#8FAACB;padding:10px;text-align:center;border:1px dashed rgba(126,200,240,.16);border-radius:16px;}
      }
    `;
    document.head.appendChild(s);
  }

  function semanaIniciada(m, si){
    var db = DBx() || {};
    var p = db.presencas || {};
    return Object.keys(p).some(function(k){
      var parts = k.split('_');
      return parts[1] === String(m) && parts[2] === String(si) && !!p[k];
    });
  }

  function calcRet(alunos, m){
    var mods = MODx() || {};
    var mod = mods[m];
    var db = DBx() || {};
    var p = db.presencas || {};
    var feitas = 0, poss = 0;
    if(!mod || !mod.semanas) return {feitas:0, possiveis:0, pct:0};
    mod.semanas.forEach(function(sem, si){
      if(!semanaIniciada(m, si)) return;
      alunos.forEach(function(al){
        (sem.aulas || []).forEach(function(a){ poss++; if(p[presKeySafe(al.id,m,si,a)]) feitas++; });
      });
    });
    return {feitas:feitas, possiveis:poss, pct:poss ? Math.round(feitas / poss * 100) : 0};
  }

  function modColor(m){
    return m === 1 ? '#7EC8F0' : m === 2 ? '#7EDBA8' : '#F08080';
  }

  function retColor(pct){
    if(pct >= 75) return '#7EDBA8';
    if(pct >= 40) return '#F39C12';
    return '#F08080';
  }

  function section(title, icon, body, open){
    return '<details class="iv-m-section" ' + (open ? 'open' : '') + '><summary><span class="iv-m-section-ico">' + icon + '</span><span>' + title + '</span><span class="iv-m-section-chev">⌄</span></summary><div class="iv-m-body">' + (body || '<div class="iv-m-empty">Sem dados ainda.</div>') + '</div></details>';
  }

  function renderMobileDashboard(){
    var page = document.getElementById('page-dashboard');
    var db = DBx();
    var mods = MODx();
    if(!page || !db || !mods) return;

    var box = document.getElementById('iv-mobile-dashboard');
    if(!box){
      box = document.createElement('div');
      box.id = 'iv-mobile-dashboard';
      page.insertBefore(box, page.firstChild);
    }

    var alunos = db.alunos || [];
    var ativos = alunos.filter(function(a){ return (a.situacao || 'ATIVO') === 'ATIVO'; });
    var desist = alunos.filter(function(a){ return a.situacao === 'DESISTENTE'; });
    var equipes = db.equipes || [];
    var byModAtivos = function(m){ return ativos.filter(function(a){ return (a.modulo || '1') === String(m); }); };
    var byModTodos = function(m){ return alunos.filter(function(a){ return (a.modulo || '1') === String(m); }); };
    var byModDesist = function(m){ return desist.filter(function(a){ return (a.modulo || '1') === String(m); }); };

    var kpis = [
      ['Ativos', ativos.length, '#7EC8F0'],
      ['Desistentes', desist.length, '#F08080'],
      ['Equipes', equipes.length, '#C39BD3']
    ];
    [1,2,3].forEach(function(m){
      var ret = calcRet(byModAtivos(m), m);
      kpis.push(['Módulo ' + m, byModAtivos(m).length, modColor(m), ret.pct + '% presença']);
    });
    var kpiHtml = kpis.map(function(k){
      return '<div class="iv-mkpi" style="--c:' + k[2] + '"><div class="iv-mkpi-num">' + k[1] + '</div><div class="iv-mkpi-lbl">' + esc(k[0]) + (k[3] ? '<br>' + esc(k[3]) : '') + '</div></div>';
    }).join('');

    var modBody = [1,2,3].map(function(m){
      var arr = byModAtivos(m), c = modColor(m), mod = mods[m] || {nome:'Módulo ' + m};
      var semEquipe = arr.filter(function(a){ return !a.equipeId; }).length;
      var eqs = equipes.filter(function(eq){ return arr.some(function(a){ return a.equipeId === eq.id; }); }).map(function(eq){
        var n = arr.filter(function(a){ return a.equipeId === eq.id; }).length;
        return '<div class="iv-m-row"><span>' + esc(eq.nome) + '</span><strong style="color:' + c + '">' + n + '</strong></div>';
      }).join('');
      return '<div class="iv-m-card"><div class="iv-m-card-top"><span>' + esc(mod.nome) + '</span><span class="iv-m-tag">' + arr.length + ' ativos</span></div>' + (eqs || '<div class="iv-m-card-note">Nenhuma equipe com alunos ativos.</div>') + (semEquipe ? '<div class="iv-m-card-note">+ ' + semEquipe + ' sem equipe</div>' : '') + '</div>';
    }).join('');

    var sitBody = [1,2,3].map(function(m){
      var total = byModTodos(m).length;
      if(!total) return '';
      var a = byModAtivos(m).length, d = byModDesist(m).length, c = modColor(m);
      var pa = Math.round(a / total * 100), pd = Math.round(d / total * 100);
      return '<div class="iv-m-card"><div class="iv-m-card-top"><span style="color:' + c + '">' + esc((mods[m] || {}).nome || ('Módulo ' + m)) + '</span><span class="iv-m-tag">' + total + ' total</span></div><div class="iv-m-row"><span>Ativos</span><strong style="color:#7EDBA8">' + a + ' (' + pa + '%)</strong></div><div class="iv-m-row"><span>Desistentes</span><strong style="color:#F08080">' + d + ' (' + pd + '%)</strong></div><div class="iv-m-bar"><div class="iv-m-fill" style="--w:' + pa + '%;--c:#7EDBA8"></div></div></div>';
    }).filter(Boolean).join('');

    var retBody = [1,2,3].map(function(m){
      var arr = byModAtivos(m);
      if(!arr.length) return '';
      var eqs = equipes.filter(function(eq){ return arr.some(function(a){ return a.equipeId === eq.id; }); }).map(function(eq){
        var alunosEq = arr.filter(function(a){ return a.equipeId === eq.id; });
        var ret = calcRet(alunosEq, m);
        var c = retColor(ret.pct);
        return '<div class="iv-m-card"><div class="iv-m-card-top"><span>' + esc(eq.nome) + '</span><span class="iv-m-tag">' + alunosEq.length + ' alunos</span></div><div class="iv-m-bar"><div class="iv-m-fill" style="--w:' + ret.pct + '%;--c:' + c + '"></div></div><div class="iv-m-card-note">Retenção: <strong style="color:' + c + '">' + ret.pct + '%</strong></div></div>';
      }).join('');
      return eqs ? '<div class="iv-m-card"><div class="iv-m-card-top"><span style="color:' + modColor(m) + '">' + esc((mods[m] || {}).nome || ('Módulo ' + m)) + '</span></div>' + eqs + '</div>' : '';
    }).filter(Boolean).join('');

    var semanaBody = [1,2,3].map(function(m){
      var arr = byModAtivos(m), mod = mods[m];
      if(!arr.length || !mod) return '';
      var semanas = (mod.semanas || []).map(function(sem, si){
        var poss = 0, feitas = 0;
        arr.forEach(function(al){ (sem.aulas || []).forEach(function(a){ poss++; if((db.presencas || {})[presKeySafe(al.id,m,si,a)]) feitas++; }); });
        var pct = poss ? Math.round(feitas / poss * 100) : 0;
        if(!pct) return '';
        return '<div class="iv-m-row"><span>' + esc(sem.label.replace('Semana ', 'Sem. ')) + '</span><strong style="color:' + retColor(pct) + '">' + pct + '%</strong></div>';
      }).filter(Boolean).join('');
      return semanas ? '<div class="iv-m-card"><div class="iv-m-card-top"><span style="color:' + modColor(m) + '">' + esc(mod.nome) + '</span></div>' + semanas + '</div>' : '';
    }).filter(Boolean).join('');

    box.innerHTML = '<div class="iv-mobile-hero"><div class="iv-mobile-hero-title">Dashboard Mobile</div><div class="iv-mobile-hero-sub">Layout próprio para celular, com cards compactos e seções em sanfona.</div></div><div class="iv-mobile-kpis">' + kpiHtml + '</div>' + section('Alunos ativos por módulo', '🎓', modBody, true) + section('Ativos × desistentes', '📊', sitBody, false) + section('Retenção total por equipe', '🏆', retBody, false) + section('Presença por semana', '📅', semanaBody, false);
  }

  function patchDashboard(){
    if(typeof window.renderDashboard === 'function' && !window.renderDashboard._ivMobileDashboard){
      var old = window.renderDashboard;
      window.renderDashboard = function(){
        var r = old.apply(this, arguments);
        setTimeout(renderMobileDashboard, 0);
        return r;
      };
      window.renderDashboard._ivMobileDashboard = true;
    }
    renderMobileDashboard();
  }

  function setMobileClass(){
    document.body.classList.toggle('iv-mobile-app', !!mql.matches);
    if(mql.matches) renderMobileDashboard();
  }

  function patchMenu(){
    document.querySelectorAll('.main-nav .mnav').forEach(function(btn){
      if(btn.dataset.ivMobileDone) return;
      btn.dataset.ivMobileDone = '1';
      btn.addEventListener('click', function(){
        document.body.classList.remove('mobile-menu-open');
        setTimeout(renderMobileDashboard, 50);
      });
    });
  }

  function aplicar(){
    ensureStyle();
    setMobileClass();
    patchMenu();
    patchDashboard();
  }

  ready(function(){
    aplicar();
    setTimeout(aplicar, 350);
    setTimeout(aplicar, 1000);
    setTimeout(aplicar, 2200);
    if(mql.addEventListener) mql.addEventListener('change', aplicar);
    else if(mql.addListener) mql.addListener(aplicar);
  });
})();

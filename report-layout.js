// Layout premium da página de relatórios — remove backup, reorganiza os cards e oculta botões duplicados do topo
(function(){
function hideTopHeaderButtons(){
  const headerRight=document.querySelector('.header-right');
  if(headerRight){
    headerRight.style.setProperty('display','none','important');
    headerRight.innerHTML='';
  }
  document.querySelectorAll('button').forEach(btn=>{
    const txt=(btn.textContent||'').trim().toLowerCase();
    if(txt.includes('salvar backup') || (txt.includes('gerar relatório') && btn.closest('.header'))){
      btn.style.setProperty('display','none','important');
      btn.remove();
    }
  });
}
function applyReportLayout(){
  hideTopHeaderButtons();
  const p=document.getElementById('page-exportar');
  if(!p) return;
  if(document.getElementById('premium-report-layout-style') && document.querySelector('.reports-page-premium')) return;

  let css=document.getElementById('premium-report-layout-style');
  if(!css){
    css=document.createElement('style');
    css.id='premium-report-layout-style';
    css.textContent=`
.header-right{display:none!important}#page-exportar{max-width:1240px!important;padding:28px 24px 44px!important}.reports-page-premium{color:#EAF4FF}.reports-titlebar{display:flex;align-items:center;gap:16px;margin-bottom:26px}.reports-title-icon{width:68px;height:68px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;background:linear-gradient(145deg,rgba(47,128,237,.28),rgba(4,13,27,.92));border:1px solid rgba(126,200,240,.22);box-shadow:0 20px 42px rgba(0,0,0,.36),inset 0 1px 0 rgba(255,255,255,.05)}.reports-titlebar h1{margin:0;font-size:38px;font-weight:900;letter-spacing:-.03em;color:#fff}.reports-titlebar p{margin:5px 0 0;color:#9DB2D1;font-size:15px}.reports-panel,.report-hero-card,.report-info-card{background:linear-gradient(145deg,rgba(18,35,64,.92),rgba(4,13,27,.96));border:1px solid rgba(126,200,240,.18);border-radius:24px;box-shadow:0 28px 60px rgba(0,0,0,.36),inset 0 1px 0 rgba(255,255,255,.05)}.reports-panel{padding:24px;margin-bottom:24px}.reports-grid{display:grid;grid-template-columns:1.1fr 1.1fr 1fr;gap:16px}.reports-field label,.reports-inline label{display:block;margin-bottom:8px;font-size:13px;color:#95ABC8;font-weight:700;letter-spacing:.02em}.reports-field input,.reports-field select{width:100%;height:54px;border-radius:16px;border:1px solid rgba(126,200,240,.16);background:rgba(2,10,24,.86);color:#fff;padding:0 16px;font-size:15px;font-weight:700;outline:none}.reports-field input:focus,.reports-field select:focus{border-color:rgba(126,200,240,.45);box-shadow:0 0 0 3px rgba(47,128,237,.12)}.reports-bottom{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:22px}.reports-segmented{display:flex;gap:8px;flex-wrap:wrap}.seg-btn{min-width:104px;height:36px;padding:0 14px;border-radius:999px;border:1px solid rgba(126,200,240,.18);background:linear-gradient(145deg,rgba(8,19,36,.92),rgba(3,10,23,.82));color:#DDEBFF;font-size:12px;font-weight:800;cursor:pointer;transition:.2s;box-shadow:0 8px 18px rgba(0,0,0,.20),inset 0 1px 0 rgba(255,255,255,.035)}.seg-btn:hover{transform:translateY(-1px);border-color:rgba(126,200,240,.36);box-shadow:0 12px 24px rgba(0,0,0,.26),0 0 14px rgba(47,128,237,.10)}.seg-btn.active{background:linear-gradient(135deg,#256FDF,#1E9BFF);box-shadow:0 10px 24px rgba(47,128,237,.24),inset 0 1px 0 rgba(255,255,255,.18);color:white;border-color:rgba(126,200,240,.36)}.reports-main-grid{display:grid;grid-template-columns:1.75fr .98fr;gap:24px;align-items:stretch}.report-hero-card{min-height:390px;padding:36px 32px;position:relative;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;background:radial-gradient(circle at 50% 25%,rgba(34,150,255,.20),transparent 38%),radial-gradient(circle at 50% 120%,rgba(47,128,237,.28),transparent 42%),linear-gradient(145deg,rgba(2,18,55,.98),rgba(5,16,35,.94))}.report-hero-card:before{content:"";position:absolute;inset:0;background-image:radial-gradient(rgba(126,200,240,.18) 1px,transparent 1px);background-size:38px 38px;opacity:.32}.report-hero-card>*{position:relative;z-index:1}.report-link-icon{width:96px;height:96px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:38px;margin-bottom:20px;background:radial-gradient(circle,rgba(33,115,255,.42),rgba(5,16,35,.95));border:1px solid rgba(126,200,240,.26);box-shadow:0 18px 38px rgba(0,0,0,.42),0 0 28px rgba(47,128,237,.22)}.report-hero-card h2{margin:0 0 12px;font-size:34px;font-weight:900;color:#fff}.report-hero-card p{max-width:650px;margin:0 auto 26px;color:#A9BDD8;font-size:16px;line-height:1.65}.report-generate-btn{min-width:0;width:auto;height:42px;padding:0 22px;border:0;border-radius:999px;background:linear-gradient(135deg,#2388F2,#155DFC);color:#fff;font-size:14px;font-weight:900;letter-spacing:.01em;cursor:pointer;box-shadow:0 14px 28px rgba(33,150,243,.28),inset 0 1px 0 rgba(255,255,255,.18);transition:.2s}.report-generate-btn:hover{transform:translateY(-2px);box-shadow:0 18px 36px rgba(33,150,243,.34)}.report-info-card{padding:30px;min-height:390px}.report-info-icon{width:78px;height:78px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:32px;margin-bottom:20px;background:radial-gradient(circle,rgba(33,150,243,.3),rgba(5,16,35,.9));border:1px solid rgba(126,200,240,.24);box-shadow:0 18px 38px rgba(0,0,0,.34)}.report-info-card h3{margin:0 0 13px;font-size:24px;font-weight:900;color:#fff}.report-info-card p{color:#A7BDD7;font-size:15px;line-height:1.75;margin:0 0 22px}.report-info-list{border-top:1px solid rgba(126,200,240,.12);padding-top:18px;display:grid;gap:14px}.report-info-item{display:flex;gap:10px;align-items:flex-start;color:#D9E8FF;font-size:14px;line-height:1.4}.report-info-item span{width:20px;height:20px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;border:1px solid rgba(47,128,237,.8);color:#5BB7FF;font-size:12px;flex-shrink:0}.reports-modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:9000;align-items:center;justify-content:center;padding:20px}.reports-modal-box{background:#0D1626;border:1px solid #1E2E4A;border-radius:18px;padding:28px;max-width:520px;width:100%;box-shadow:0 30px 80px rgba(0,0,0,.55)}@media(max-width:980px){#page-exportar{padding:18px 12px 34px!important}.reports-grid,.reports-bottom,.reports-main-grid{grid-template-columns:1fr}.report-generate-btn{width:auto;min-width:210px;height:40px;font-size:13px;padding:0 18px}.seg-btn{min-width:94px;height:34px;font-size:11px;padding:0 12px}.reports-titlebar h1{font-size:32px}.report-hero-card{min-height:auto;padding:30px 20px}.report-hero-card h2{font-size:28px}.report-info-card{min-height:auto}.reports-title-icon{width:58px;height:58px}.reports-titlebar{align-items:flex-start}}`;
    document.head.appendChild(css);
  }

  p.innerHTML=`<div class="reports-page-premium">
    <div class="reports-titlebar"><div class="reports-title-icon">📊</div><div><h1>Relatórios</h1><p>Gere e compartilhe relatórios com facilidade.</p></div></div>
    <div class="reports-panel">
      <div class="reports-grid">
        <div class="reports-field"><label>Título do Relatório</label><input id="exp-titulo" value="Instituto de Vencedores"></div>
        <div class="reports-field"><label>Tipo de Relatório</label><select id="exp-tipo"><option value="visao">📊 Visão Geral atual</option><option value="alunos">🎓 Relatório geral dos alunos</option><option value="modulo">📘 Relatório por módulo</option><option value="turma">🏫 Relatório por turma</option><option value="caminho">🧭 Histórico de um Vencedor</option></select></div>
        <div class="reports-field"><label>Módulo</label><select id="exp-modulo"><option value="todos">Todos os Módulos</option><option value="1">1º Módulo</option><option value="2">2º Módulo</option><option value="3">3º Módulo</option></select></div>
      </div>
      <div class="reports-bottom">
        <div class="reports-inline"><label>Versão do relatório</label><div class="reports-segmented"><button class="seg-btn active" id="tab-mobile" onclick="setVersaoRelatorio('mobile',this)">📱 Mobile</button><button class="seg-btn" id="tab-web" onclick="setVersaoRelatorio('web',this)">💻 Web</button></div></div>
        <div class="reports-inline" id="device-mobile-box"><label>Dispositivo mobile</label><div class="reports-segmented"><button class="seg-btn active" id="tab-android" onclick="setDisp('android',this)">🤖 Android</button><button class="seg-btn" id="tab-iphone" onclick="setDisp('iphone',this)">🍎 iPhone</button></div></div>
      </div>
    </div>
    <div class="reports-main-grid">
      <div class="report-hero-card"><div class="report-link-icon">🔗</div><h2>Gerar Link do Relatório</h2><p>Escolha o tipo de relatório e a versão Web ou Mobile. O sistema gera um link para compartilhar no WhatsApp, sem baixar arquivo HTML.</p><button class="report-generate-btn" onclick="gerarRelatorioLink()">🔗 Gerar Link</button></div>
      <div class="report-info-card"><div class="report-info-icon">✈️</div><h3>Compartilhamento simplificado</h3><p>O link gerado pode ser compartilhado instantaneamente via WhatsApp ou qualquer outro canal.</p><div class="report-info-list"><div class="report-info-item"><span>✓</span>Visualização otimizada para o dispositivo</div><div class="report-info-item"><span>✓</span>Não requer download de arquivos</div><div class="report-info-item"><span>✓</span>Acesso rápido e seguro</div></div></div>
    </div>
    <div id="modal-link" class="reports-modal"><div class="reports-modal-box"><div style="font-size:18px;font-weight:800;color:#fff;margin-bottom:8px">🔗 Link gerado!</div><div style="font-size:13px;color:#6B8AB0;margin-bottom:14px">Mensagem que será enviada no WhatsApp:</div><div id="whats-preview" style="background:#0A2E1A;border:1px solid #1E5C36;border-radius:10px;padding:12px 14px;font-size:13px;color:#E8F0FF;white-space:pre-line;line-height:1.6;margin-bottom:14px;font-family:'DM Sans',sans-serif"></div><input id="link-gerado" readonly style="display:none"><div style="display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap"><button class="btn btn-ghost" onclick="document.getElementById('modal-link').style.display='none'">Fechar</button><button class="btn btn-blue" onclick="copiarLink()">📋 Copiar mensagem</button><button class="btn btn-green" onclick="abrirWhatsApp()">📲 Abrir WhatsApp</button><button class="btn btn-ghost" onclick="window.open(document.getElementById('link-gerado').value,'_blank')">🌐 Abrir link</button></div></div></div>
  </div>`;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{hideTopHeaderButtons();applyReportLayout();});else{hideTopHeaderButtons();applyReportLayout();}
setTimeout(hideTopHeaderButtons,300);
setTimeout(hideTopHeaderButtons,1200);
})();

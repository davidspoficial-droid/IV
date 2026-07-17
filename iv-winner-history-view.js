(function(){
'use strict';
var q=document.getElementById('hs'),m=document.getElementById('hm'),r=document.getElementById('hr'),t=document.getElementById('ht'),cards=[].slice.call(document.querySelectorAll('.student-card')),count=document.getElementById('hc'),empty=document.getElementById('he');
function norm(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
function apply(){var x=norm(q&&q.value),a=m&&m.value,b=r&&r.value,d=t&&t.value,n=0;cards.forEach(function(card){var ok=(!x||card.dataset.name.indexOf(x)>=0)&&(!a||card.dataset.module===a)&&(!b||card.dataset.review===b)&&(!d||card.dataset.class===d);card.style.display=ok?'':'none';if(ok)n++});if(count)count.textContent=n+' aluno(s)';if(empty)empty.style.display=n?'none':'block'}
[q,m,r,t].forEach(function(el){if(el)el.addEventListener(el===q?'input':'change',apply)});
var initial=document.body&&document.body.dataset.initialModule||'';if(m)m.value=initial==='todos'?'':initial;apply();
})();

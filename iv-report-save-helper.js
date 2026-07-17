// IV - helper compartilhado para salvar HTML de relatórios no Firestore
(function(){
'use strict';if(window.IVSaveReportHTML)return;
window.IVSaveReportHTML=async function(payload){
  var data=payload||{},id=data.id||('r'+Date.now().toString(36)+Math.random().toString(36).slice(2,7));
  var fb=await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
  await fb.setDoc(fb.doc(fb.getFirestore(),'relatorios',id),Object.assign({},data,{id:undefined,criadoEm:data.criadoEm||new Date().toISOString()}));
  return location.origin+'/relatorio?id='+id;
};
})();

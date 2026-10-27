const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>{errs.push('DIALOG '+d.message());d.dismiss();});
await p.goto('file:///home/claude/billdnamobile/www/index.html');await p.waitForTimeout(600);
await p.click('[data-act="demo"]');await p.waitForTimeout(500);
const act=(a,ds)=>p.evaluate(([a,ds])=>{const x=document.createElement('button');x.dataset.act=a;Object.assign(x.dataset,ds);document.body.appendChild(x);x.click();x.remove();},[a,ds]);
const close=()=>p.evaluate(()=>{const m=document.querySelector('#modal');if(!m.hidden){const c=m.querySelector('[data-act=closeModal]');if(c)c.click();else{m.hidden=true;m.innerHTML='';}}});
await close();
const SKIP=/^(delete|del|cancel|doCancel|rm|doRm|doReset|askReset|logout|mOut|switchCo|mSwitch|doDel|restore|doRestore|dlBackup|copyBackup|docPdf|docXlsx|waShare|waPay|print|doExport|doShare|exportView|dlDayBook|payPdf|mImg|mImgShare|mImgSave|abPick|abNow|camScan|nBak|qbClear|qbSave|saveDoc|closeModal|cancelDraft|nav|mOpen|mMenu|mDay|mBack|mCreate|tab|subtab|sflt|clrFlt|moreRows|mDo|mGo|mToBill|thisMonth|lastMonth|thisFy|hsnside|dbDay|demo|mode|editDoc|receive|convert|setStatus|newDoc|newDocGo)/i;
const screens={sales:['invoice','receipt','creditnote','quotation','estimate','proforma','salesorder','challan','debitnote','enquiry'],purchases:['pinvoice','payment','preturn','po'],parties:['customer','supplier'],inventory:['products','adjust','warehouses','transfers','ledger','valuation'],accounting:['cash','inex','journal','exprep','recv','pay','tds','bank','loans','bin'],gst:['sum','gstr1','gstr3b','hsn','purreg','r2b','gstr9','sales','purchase','pl','stock','out','byuser','billprofit','partysales','lowstock'],crm:['ov','cust','dues','items','coll','profit'],settings:['company','series','prefs','users','backup','bin','audit']};
let clicked=0,opened=0;const log=[];
for(const v in screens) for(const t of screens[v]){
  await act('mOpen',{v,t}); await p.waitForTimeout(60);
  const acts=await p.$$eval('#app main [data-act]',a=>{const seen={};return a.map(x=>({act:x.dataset.act,sel:Object.entries(x.dataset).map(([k,v])=>'[data-'+k.replace(/[A-Z]/g,m=>'-'+m.toLowerCase())+'="'+v+'"]').join('')})).filter(x=>{if(seen[x.act])return false;seen[x.act]=1;return true;});});
  for(const a of acts){ if(SKIP.test(a.act)) continue;
    const e0=errs.length; const el=await p.$('#app main '+a.sel); if(!el) continue;
    await el.click({force:true}).catch(()=>{}); await p.waitForTimeout(80); clicked++;
    const modalOpen=await p.evaluate(()=>!document.querySelector('#modal').hidden); if(modalOpen) opened++;
    if(errs.length>e0) log.push(v+'/'+t+' '+a.act+' ERR '+errs.slice(e0).join(';'));
    await close(); await act('mOpen',{v,t}); await p.waitForTimeout(40);
  }
}
// create sheet: every option opens something
await act('mCreate',{}); const cr=await p.$$eval('#modal .m-qa,#modal .m-big',a=>a.map(x=>x.innerText.trim()));
for(const label of cr){ await act('mCreate',{}); const e0=errs.length; await p.click('#modal :is(.m-qa,.m-big) >> text="'+label+'"').catch(e=>log.push('create click fail '+label)); await p.waitForTimeout(150);
  const st=await p.evaluate(()=>({modal:!document.querySelector('#modal').hidden, draft:!!document.querySelector('#rows,[data-f=partyId]'), view:document.querySelector('.m-co b').textContent}));
  if(!st.modal&&!st.draft&&!/Quick|Items/.test(st.view)) log.push('create '+label+' did nothing '+JSON.stringify(st));
  if(errs.length>e0) log.push('create '+label+' ERR '+errs.slice(e0).join(';')); await close(); await act('cancelDraft',{}); }
console.log('row/screen actions clicked',clicked,'opened sheets',opened,'create options',cr.length);
console.log(log.join('\n')||'no problems'); console.log('ERRORS',errs.length?errs:'none'); await b.close();})();

const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{ window.__files={}; window.__shares=[];
  window.Capacitor={isNativePlatform:()=>true,Plugins:{
    Filesystem:{writeFile:async o=>{window.__files[o.directory+':'+o.path]=o.data;return {uri:'file:///'+o.directory+'/'+o.path};},readdir:async o=>({files:Object.keys(window.__files).filter(k=>k.startsWith('DOCUMENTS:'+o.path+'/')).map(k=>({name:k.split('/').pop()}))}),deleteFile:async o=>{delete window.__files[o.directory+':'+o.path];}},
    Share:{share:async o=>{window.__shares.push(o);return {};}},
    App:{addListener:()=>{},exitApp:()=>{}}}}; });
await p.goto('file:///home/claude/billdnamobile/www/index.html');await p.waitForTimeout(600);
await p.click('[data-act="demo"]');await p.waitForTimeout(500);
const act=(a,ds)=>p.evaluate(([a,ds])=>{const x=document.createElement('button');x.dataset.act=a;Object.assign(x.dataset,ds);document.body.appendChild(x);x.click();x.remove();},[a,ds]);
const head=async k=>p.evaluate(k=>{const d=window.__files[k];return d?atob(d).slice(0,8):null},k);
await act('closeModal',{});
await act('mOpen',{v:'sales',t:'invoice'}); await p.evaluate(()=>document.querySelector('tr.clk').click()); await p.waitForTimeout(300);
const btns=await p.$$eval('#modal [data-act]',a=>a.map(x=>x.dataset.act+':'+x.innerText.trim()).filter(x=>/waShare|docPdf|docXlsx|print|mImg/.test(x))); console.log('preview buttons',btns);
await p.click('#modal [data-act="waShare"][data-fmt="pdf"]'); await p.waitForTimeout(2500);
let sh=await p.evaluate(()=>window.__shares.slice(-1)[0]); console.log('WA share:',JSON.stringify(sh).slice(0,200));
const k1=await p.evaluate(()=>Object.keys(window.__files).find(k=>/\.pdf$/.test(k))); console.log('pdf file',k1, await head(k1));
await p.evaluate(()=>document.querySelector('tr.clk').click()); await p.waitForTimeout(300);
await p.click('#modal [data-act="docPdf"]'); await p.waitForTimeout(2500); console.log('download sheet:',(await p.textContent('#modal')).replace(/\s+/g,' ').slice(0,160));
await p.screenshot({path:'shots/n_saved.png'});
await act('closeModal',{}); await p.evaluate(()=>document.querySelector('tr.clk').click()); await p.waitForTimeout(300);
await p.click('#modal [data-act="print"]'); await p.waitForTimeout(2500); console.log('print share:',JSON.stringify(await p.evaluate(()=>window.__shares.slice(-1)[0])).slice(0,160));
await act('closeModal',{});
await act('mOpen',{v:'gst',t:'pl'}); await p.waitForTimeout(200); await p.screenshot({path:'shots/n_pl.png',fullPage:true});
await act('exportView',{}); await p.waitForTimeout(300); const ex=await p.$$eval('#modal [data-act]',a=>a.map(x=>x.dataset.act+':'+(x.dataset.fmt||'')+':'+x.innerText.trim())); console.log('export opts',ex.join(' | '));
p.on('console',m=>console.log('C:',m.text().slice(0,200)));await p.click('#modal [data-act="doExport"][data-fmt="xlsx"]'); await p.waitForTimeout(4000);console.log('toast:',await p.textContent('#toast')); console.log('xlsx files',await p.evaluate(()=>Object.keys(window.__files).filter(k=>/xlsx$/.test(k))));
await act('closeModal',{});
await act('mOpen',{v:'settings',t:'backup'}); await p.waitForTimeout(200); await p.screenshot({path:'shots/n_backup.png',fullPage:true});
await act('nBakNow',{}); await p.waitForTimeout(800); console.log('backup files',await p.evaluate(()=>Object.keys(window.__files).filter(k=>/Backup/.test(k))), 'toast',await p.textContent('#toast'));
console.log('ERR',errs); await b.close();})();

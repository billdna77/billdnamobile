const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{ window.__files={}; window.__wa=[]; window.__shares=[];
  window.Capacitor={isNativePlatform:()=>true,Plugins:{
    Filesystem:{writeFile:async o=>{window.__files[o.directory+':'+o.path]=o.data;return {uri:'file:///'+o.directory+'/'+o.path};},readdir:async()=>({files:[]}),deleteFile:async()=>{}},
    Share:{share:async o=>{window.__shares.push(o);return {};}},
    WaShare:{apps:async()=>({whatsapp:true,business:true}),send:async o=>{window.__wa.push(o);},chat:async o=>{window.__wa.push(Object.assign({chat:1},o));}},
    App:{addListener:()=>{},exitApp:()=>{}}}}; });
await p.goto('file:///home/claude/billdnamobile/www/index.html');await p.waitForTimeout(600);
await p.click('[data-act="demo"]');await p.waitForTimeout(500);
const act=(a,ds)=>p.evaluate(([a,ds])=>{const x=document.createElement('button');x.dataset.act=a;Object.assign(x.dataset,ds);document.body.appendChild(x);x.click();x.remove();},[a,ds]);
await act('closeModal',{});
// 1) party with phone: Annai Textiles invoice
await act('mOpen',{v:'sales',t:'invoice'}); await p.evaluate(()=>[...document.querySelectorAll('tr.clk')].find(r=>/Annai/.test(r.textContent)).click()); await p.waitForTimeout(300);
await p.click('#modal [data-act="waShare"][data-fmt="pdf"]'); await p.waitForTimeout(800);
console.log('first time asks which WhatsApp:', /Which WhatsApp/.test(await p.textContent('#modal')));
await p.screenshot({path:'shots/wa_pick.png'});
await p.click('#modal [data-act="nWaPkg"][data-pkg="com.whatsapp.w4b"]'); await p.waitForTimeout(2500);
console.log('sent:',JSON.stringify(await p.evaluate(()=>window.__wa.slice(-1)[0])).slice(0,260));
// 2) second send does not ask again
await p.evaluate(()=>[...document.querySelectorAll('tr.clk')].find(r=>/Annai/.test(r.textContent)).click()); await p.waitForTimeout(300);
await p.click('#modal [data-act="waShare"][data-fmt="pdf"]'); await p.waitForTimeout(2500); console.log('second send count:',await p.evaluate(()=>window.__wa.length),'pkg',await p.evaluate(()=>window.__wa.slice(-1)[0].pkg));
// 3) party without phone
await act('closeModal',{}); await act('mOpen',{v:'parties',t:'customer'}); await act('newParty',{side:'customer'}); await p.waitForTimeout(200);
console.log('party form?', !!(await p.$('form[data-submit=saveParty]')));await p.evaluate(()=>{const f=document.querySelector('form[data-submit=saveParty]');f.elements.name.value='No Phone Shop';f.elements.phone.value='';f.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));}); await p.waitForTimeout(300); console.log('party toast:',await p.textContent('#toast')); await act('closeModal',{});
await act('newDocGo',{t:'invoice'}); await p.waitForTimeout(200);
await p.evaluate(()=>{const s=document.querySelector('select[data-f=partyId]');s.value=[...s.options].find(o=>/No Phone/.test(o.text)).value;s.dispatchEvent(new Event('input',{bubbles:true}));s.dispatchEvent(new Event('change',{bubbles:true}));const q=document.querySelector('select[data-f=pid][data-i="0"]');q.value=q.options[2].value;q.dispatchEvent(new Event('input',{bubbles:true}));q.dispatchEvent(new Event('change',{bubbles:true}));});
await p.waitForTimeout(150); await p.evaluate(()=>document.querySelector('[data-act=saveDoc]').click()); await p.waitForTimeout(800); console.log('inv toast:',await p.textContent('#toast'), (await p.textContent('#modal')).slice(0,100));
await act('closeModal',{}); await act('mOpen',{v:'sales',t:'invoice'}); await p.evaluate(()=>[...document.querySelectorAll('tr.clk')].find(r=>/No Phone/.test(r.textContent)).click()); await p.waitForTimeout(300);
await p.click('#modal [data-act="waShare"][data-fmt="pdf"]'); await p.waitForTimeout(400);
console.log('asks number:',/WhatsApp number/.test(await p.textContent('#modal')));
await p.screenshot({path:'shots/wa_num.png'});
await p.fill('#modal input[name=ph]','98765 43210'); await p.click('#modal button[type=submit]'); await p.waitForTimeout(2500);
console.log('sent to new number:',JSON.stringify(await p.evaluate(()=>window.__wa.slice(-1)[0].phone)), 'saved on party:', await p.evaluate(()=>JSON.parse(localStorage.getItem('billdna_web_v1')||'{}').companies?'ls':'idb'));
// 4) reminder links
await act('closeModal',{}); await act('mOpen',{v:'accounting',t:'recv'}); await p.waitForTimeout(200);
const rb=await p.$('#app main [data-act=remOpen],#app main [data-act=remind],#app main [data-act^=rem]'); if(rb){await rb.click(); await p.waitForTimeout(300);}
const rem=await p.$('a[href^="https://wa.me/"]'); if(rem){await rem.click(); await p.waitForTimeout(400); console.log('reminder via app chat:',JSON.stringify(await p.evaluate(()=>window.__wa.slice(-1)[0])).slice(0,160));} else console.log('no reminder link present');
console.log('ERR',errs);await b.close();})();

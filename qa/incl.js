// GST-inclusive sale price and party statement button
const { boot } = require('./harness');
const R = []; const ok = (n, c, i) => { R.push(!!c); if (!c) console.log('  FAIL ' + n, i === undefined ? '' : JSON.stringify(i).slice(0, 300)); };
(async () => {
  const H = await boot(null); const close = () => { const c = H.$('#modal [data-act=closeModal]'); if (c) c.click(); };
  const _act = H.act; H.act = (a, x) => { try { _act(a, x); } catch (e) { const m = /^\[data-([a-z0-9-]+)=["']?([^"'\]]*)["']?\]$/i.exec(x || ''); const el = H.w.document.createElement('button'); el.setAttribute('data-act', a); if (m) el.setAttribute('data-' + m[1], m[2]); H.w.document.body.appendChild(el); el.click(); el.remove(); } };
  const D = () => H.co().d;
  H.submit('form[data-submit=signup]', { name: 'O', email: 'o@i.in', pass: 'secret1' }); close();
  H.submit('form[data-submit=createCompany]', { name: 'Incl Co', gstin: '33AAAPS1234Q1ZL', state: 'Tamil Nadu', sample: false, biz: 'retail', scheme: 'regular', mode: 'full' }); close();
  H.act('nav', '[data-v=inventory]'); H.act('newProd');
  ok('item form has includes-GST option', !!H.$('#modal [name=incl]'));
  H.submit('form[data-submit=saveProd]', { name: 'MRP Item', cat: '', hsn: '3920', unit: 'pcs', gst: '18', sale: '3400', cost: '2000', min: '0', open: '0', tracked: false, incl: true }); close();
  const p = D().products[0]; ok('saved incl flag', p.incl === true, p);
  H.act('nav', '[data-v=quick]'); H.act('qbAdd', '[data-id=' + p.id + ']'); H.act('qbSave'); close();
  const inv = D().docs.filter(d => d.type === 'invoice').pop();
  ok('customer pays printed price 3400', inv.total === 340000, inv.total);
  ok('GST is 18% inside the price', inv.cgst + inv.sgst === Math.round(inv.sub * 18 / 100) && inv.sub === 288136, [inv.sub, inv.cgst, inv.sgst]);
  H.act('nav', '[data-v=parties]'); H.act('newParty', '[data-side=customer]'); H.submit('form[data-submit=saveParty]', { name: 'Stmt Cust', type: 'customer', state: 'Tamil Nadu', gstin: '', phone: '9876543210', email: '', address: '', opening: '500' }); close();
  const c = D().parties.find(x => x.name === 'Stmt Cust'); H.act('ledger', '[data-id="' + c.id + '"]');
  ok('ledger has Statement on WhatsApp', !!H.$('#modal [data-act=ledgerWa]'));
  ok('no runtime errors', H.errors.length === 0, H.errors);
  const bad = R.filter(x => !x).length; console.log('incl: ' + (R.length - bad) + '/' + R.length); process.exit(bad ? 1 : 0);
})().catch(e => { console.log('ERR', e.stack); process.exit(1); });

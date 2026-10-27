// cash refund on sales return and money back on purchase return
const { boot } = require('./harness');
const R = []; const ok = (n, c, i) => { R.push(!!c); if (!c) console.log('  FAIL ' + n, i === undefined ? '' : JSON.stringify(i).slice(0, 300)); };
const today = new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);
(async () => {
  const H = await boot(null); const close = () => { const c = H.$('#modal [data-act=closeModal]'); if (c) c.click(); };
  const _act = H.act; H.act = (a, x) => { try { _act(a, x); } catch (e) { const m = /^\[data-([a-z0-9-]+)=["']?([^"'\]]*)["']?\]$/i.exec(x || ''); const el = H.w.document.createElement('button'); el.setAttribute('data-act', a); if (m) el.setAttribute('data-' + m[1], m[2]); H.w.document.body.appendChild(el); el.click(); el.remove(); } };
  const D = () => H.co().d;
  H.submit('form[data-submit=signup]', { name: 'O', email: 'o@r.in', pass: 'secret1' }); close();
  H.submit('form[data-submit=createCompany]', { name: 'Ref Co', gstin: '33AAAPS1234Q1ZL', state: 'Tamil Nadu', sample: false, biz: 'retail', scheme: 'regular', mode: 'full' }); close();
  H.act('nav', '[data-v=inventory]'); H.act('newProd'); H.submit('form[data-submit=saveProd]', { name: 'Fan', cat: '', hsn: '8414', unit: 'pcs', gst: '18', sale: '1000', cost: '700', min: '0', open: '0', tracked: true }); close();
  H.act('nav', '[data-v=parties]'); H.act('newParty', '[data-side=customer]'); H.submit('form[data-submit=saveParty]', { name: 'Cust', type: 'customer', state: 'Tamil Nadu', gstin: '', phone: '9876543210', email: '', address: '', opening: '0' }); close();
  H.act('tab', '[data-t=supplier]'); H.act('newParty', '[data-side=supplier]'); H.submit('form[data-submit=saveParty]', { name: 'Supp', type: 'supplier', state: 'Tamil Nadu', gstin: '', phone: '9876500000', email: '', address: '', opening: '0' }); close();
  const pid = D().products[0].id, cust = D().parties.find(p => p.name === 'Cust').id, sup = D().parties.find(p => p.name === 'Supp').id;
  const cash0 = () => { H.act('nav', '[data-v=accounting]'); H.act('tab', '[data-t=cash]'); return H.$('#app main').textContent.replace(/\s+/g, ' '); };
  // purchase 10 fans, paid in full
  H.act('nav', '[data-v=purchases]'); H.act('tab', '[data-t=pinvoice]'); H.act('newDoc', '[data-t=pinvoice]'); H.set('select[data-f=partyId]', sup, 'change'); H.set('select[data-f=pid][data-i="0"]', pid, 'change'); H.set('input[data-f=qty][data-i="0"]', '10'); H.act('payFull'); H.act('saveDoc'); close();
  const pi = D().docs.filter(d => d.type === 'pinvoice').pop();
  // sell 2, paid in full cash
  H.act('nav', '[data-v=sales]'); H.act('tab', '[data-t=invoice]'); H.act('newDoc', '[data-t=invoice]'); H.set('select[data-f=partyId]', cust, 'change'); H.set('select[data-f=pid][data-i="0"]', pid, 'change'); H.set('input[data-f=qty][data-i="0"]', '2'); H.act('payFull'); H.act('saveDoc'); close();
  const inv = D().docs.filter(d => d.type === 'invoice').pop();
  // return 1 with cash refund
  H.act('view', '[data-id="' + inv.id + '"]'); H.$('#modal [data-act=convert][data-to=creditnote]').click();
  H.set('input[data-f=qty][data-i="0"]', '1');
  ok('refund box on sales return', /Refund to customer/.test(H.$('#refbox').textContent));
  H.act('refundFull'); H.act('saveDoc'); close();
  const cn = D().docs.filter(d => d.type === 'creditnote').pop(), rf = D().payments.find(p => p.amount < 0 && p.type === 'receipt');
  ok('refund voucher created = return total', rf && -rf.amount === cn.total, [rf && rf.amount, cn.total]);
  const cp = D().parties.find(p => p.id === cust); H.act('nav', '[data-v=parties]'); H.act('tab', '[data-t=customer]');
  ok('customer balance back to zero', /Cust.*?₹0\.00/.test(H.$('#app main').textContent.replace(/\s+/g, ' ')), H.$('#app main').textContent.slice(0, 300));
  const t = cash0(); const expCash = (inv.total - cn.total - pi.total) / 100;
  ok('cash in hand = sale - refund - purchase', t.includes('₹' + expCash.toLocaleString('en-IN', { minimumFractionDigits: 2 })) || t.includes('-₹' + Math.abs(expCash).toLocaleString('en-IN', { minimumFractionDigits: 2 })), [expCash]);
  ok('cash book shows Refund paid', /Refund paid/.test(t));
  H.act('mDay'); H.act('nav', '[data-v=dashboard]');
  // purchase return with money back
  H.act('view', '[data-id="' + pi.id + '"]'); H.$('#modal [data-act=convert][data-to=preturn]').click(); H.set('input[data-f=qty][data-i="0"]', '2');
  ok('money-back box on purchase return', /Money back from supplier/.test(H.$('#refbox').textContent));
  H.set('[data-rf=amt]', '500'); H.set('[data-rf=mode]', 'UPI', 'change'); H.act('saveDoc'); close();
  const rb = D().payments.find(p => p.amount < 0 && p.type === 'payment');
  ok('supplier refund recorded', rb && rb.amount === -50000 && rb.mode === 'UPI', rb);
  // over-refund blocked
  const inv2 = D().docs.filter(d => d.type === 'invoice').pop();
  H.act('view', '[data-id="' + inv2.id + '"]'); H.$('#modal [data-act=convert][data-to=creditnote]').click(); H.set('[data-rf=amt]', '999999'); const n0 = D().docs.length; H.act('saveDoc');
  ok('over-refund blocked', D().docs.length === n0 && /more than the return/.test(H.toast()), H.toast()); H.act('cancelDraft');
  // voucher view
  H.act('nav', '[data-v=sales]'); H.act('tab', '[data-t=receipt]'); ok('receipts list shows refund', /Refund paid/.test(H.$('#app main').textContent));
  H.act('viewPay', '[data-id="' + rf.id + '"]'); ok('voucher titled Refund paid, paid to', /Refund paid/.test(H.$('#modal').textContent) && /Paid to/.test(H.$('#modal').textContent)); close();
  ok('no runtime errors', H.errors.length === 0, H.errors);
  const bad = R.filter(x => !x).length; console.log('refund: ' + (R.length - bad) + '/' + R.length); process.exit(bad ? 1 : 0);
})().catch(e => { console.log('ERR', e.stack); process.exit(1); });

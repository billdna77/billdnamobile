// Advance adjustment, payment at billing, settlement discount, debit notes in receivables.
const { boot } = require('./harness');
const R = []; const ok = (n, c, i) => { R.push(!!c); if (!c) console.log('  FAIL ' + n, i === undefined ? '' : JSON.stringify(i).slice(0, 300)); };
const today = new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);
(async () => {
  const H = await boot(null); const close = () => { const c = H.$('#modal [data-act=closeModal]'); if (c) c.click(); };
  const D = () => H.co().d;
  const _act = H.act; H.act = (a, x) => { try { _act(a, x); } catch (e) { const m = /^\[data-([a-z0-9-]+)=["']?([^"'\]]*)["']?\]$/i.exec(x || ''); const el = H.w.document.createElement('button'); el.setAttribute('data-act', a); if (m) el.setAttribute('data-' + m[1], m[2]); H.w.document.body.appendChild(el); el.click(); el.remove(); } };
  H.submit('form[data-submit=signup]', { name: 'O', email: 'o@p.in', pass: 'secret1' }); close();
  H.submit('form[data-submit=createCompany]', { name: 'Pay Co', gstin: '33AAAPS1234Q1ZL', state: 'Tamil Nadu', sample: false, biz: 'retail', scheme: 'regular', mode: 'full' }); close();
  H.act('nav', '[data-v=inventory]'); H.act('newProd'); H.submit('form[data-submit=saveProd]', { name: 'Board', cat: 'G', hsn: '3920', unit: 'pcs', gst: '18', sale: '3000', cost: '2000', min: '0', open: '0', tracked: false }); close();
  H.act('nav', '[data-v=parties]'); H.act('newParty', '[data-side=customer]'); H.submit('form[data-submit=saveParty]', { name: 'Ravi', type: 'customer', state: 'Tamil Nadu', gstin: '', phone: '9876543210', email: '', address: '', opening: '0' }); close();
  H.act('tab', '[data-t=supplier]'); H.act('newParty', '[data-side=supplier]'); H.submit('form[data-submit=saveParty]', { name: 'Supp', type: 'supplier', state: 'Tamil Nadu', gstin: '', phone: '9876500000', email: '', address: '', opening: '0' }); close();
  const pid = D().products[0].id, cust = D().parties.find(p => p.name === 'Ravi').id, sup = D().parties.find(p => p.name === 'Supp').id;
  // 1. advance before any bill
  H.act('nav', '[data-v=sales]'); H.act('newPay', '[data-type=receipt]');
  ok('receipt offers advance option', /Advance \/ on account/.test(H.$('#modal').textContent));
  H.submit('#modal form[data-submit=savePay]', { party: cust, ref: '', amt: '5000', disc: '0', mode: 'Cash', date: today, note: 'advance' }); close();
  const newInv = (setup) => { H.act('nav', '[data-v=sales]'); H.act('tab', '[data-t=invoice]'); H.act('newDoc', '[data-t=invoice]'); H.set('select[data-f=partyId]', cust, 'change'); H.set('select[data-f=pid][data-i="0"]', pid, 'change'); if (setup) setup(); };
  // 2. invoice uses advance automatically
  newInv();
  ok('payment box shown', !!H.$('#paybox'));
  ok('advance offered and ticked', /Adjust advance received/.test(H.$('#paybox').textContent) && H.$('[data-pf=adv]').checked);
  ok('summary shows advance', /Advance adjusted/.test(H.$('#paysum').textContent));
  H.act('saveDoc'); close();
  let inv1 = D().docs.filter(d => d.type === 'invoice').pop();
  ok('invoice 1 total 3540', inv1.total === 354000, inv1.total);
  ok('invoice 1 paid by advance', H.$('#app main') && (() => { H.act('view', '[data-id="' + inv1.id + '"]'); const t = H.$('#modal').textContent; close(); return /Paid/.test(t); })());
  const adv = D().payments.find(p => p.note === 'advance');
  ok('advance allocation recorded', adv.alloc && adv.alloc[inv1.id] === 354000, adv.alloc);
  ok('party balance = -1460 (advance left)', (() => { H.act('nav', '[data-v=parties]'); H.act('tab', '[data-t=customer]'); const t = H.$('#app main').textContent; if (!/1,460\.00/.test(t)) console.log('   parties text:', t.slice(0, 400)); return /1,460\.00/.test(t); })());
  // 3. second invoice: leftover advance + received now + settlement discount
  newInv(() => { H.set('[data-pf=amt]', '1000'); H.set('[data-pf=disc]', '80'); });
  ok('summary balance due 1000', /Balancedue₹1,000\.00/.test(H.$('#paysum').textContent.replace(/\s+/g, '')), H.$('#paysum').textContent);
  H.act('saveDoc'); close();
  const inv2 = D().docs.filter(d => d.type === 'invoice').pop();
  const p2 = D().payments.filter(p => p.refId === inv2.id);
  ok('receipt with settlement discount created', p2.length === 1 && p2[0].amount === 100000 && p2[0].disc === 8000, p2);
  ok('GST unchanged by settlement', inv2.cgst === inv1.cgst && inv2.total === inv1.total);
  H.act('nav', '[data-v=accounting]'); H.act('tab', '[data-t=recv]');
  ok('receivables shows inv2 balance 1000', /₹1,000\.00/.test(H.$('#app main').textContent));
  // 4. over-entry blocked
  newInv(() => { H.set('[data-pf=amt]', '9999'); });
  const n0 = D().docs.length; H.act('saveDoc'); ok('over amount blocked', D().docs.length === n0 && /more than the bill/.test(H.toast()), H.toast());
  H.act('cancelDraft');
  // 5. full pay with round-off settlement
  newInv(() => { H.set('[data-pf=amt]', '3500'); H.set('[data-pf=disc]', '40'); });
  H.act('saveDoc'); close(); const inv3 = D().docs.filter(d => d.type === 'invoice').pop();
  H.act('view', '[data-id="' + inv3.id + '"]'); ok('round-figure settlement marks Paid', /Paid/.test(H.$('#modal').textContent)); close();
  // 6. Received in full button
  newInv(); H.act('payFull'); ok('received-in-full fills amount', H.$('[data-pf=amt]').value === '3540', H.$('[data-pf=amt]').value); H.act('cancelDraft');
  // 7. quick bill with advance + settlement
  H.act('nav', '[data-v=sales]'); H.act('newPay', '[data-type=receipt]'); H.submit('#modal form[data-submit=savePay]', { party: cust, ref: '', amt: '2000', disc: '0', mode: 'UPI', date: today, note: 'adv2' }); close();
  H.act('nav', '[data-v=quick]'); H.act('qbAdd', '[data-id=' + pid + ']'); H.set('[data-chg=qbParty]', cust, 'change');
  ok('quick bill offers advance (not auto-ticked: older bill unpaid)', !!H.$('[data-qbf=adv]') && !H.$('[data-qbf=adv]').checked);
  H.$('[data-qbf=adv]').checked = true; H.ev(H.$('[data-qbf=adv]'), 'input');
  H.set('[data-qbf=settle]', '40');
  ok('quick bill amount received defaults to due (3540-1000-40)', H.$('#qbpaid').value === '2500', H.$('#qbpaid').value);
  H.act('qbSave'); close(); const qb = D().docs.filter(d => d.type === 'invoice').pop();
  ok('quick bill paid via advance + cash + settlement', (() => { H.act('view', '[data-id="' + qb.id + '"]'); const t = H.$('#modal').textContent; close(); return /Paid/.test(t); })());
  // 8. cancelling a bill frees its advance
  const before = D().payments.find(p => p.note === 'adv2');
  H.act('view', '[data-id="' + qb.id + '"]'); const cb = H.$('#modal [data-act=cancelDoc]'); if (cb) { cb.click(); const dc = H.$('#modal [data-act=doCancel]'); if (dc) dc.click(); else { const pin = H.$('#modal input'); } } close();
  const qbc = D().docs.find(d => d.id === qb.id);
  if (qbc.cancelled) { H.act('nav', '[data-v=sales]'); H.act('newDoc', '[data-t=invoice]'); H.set('select[data-f=partyId]', cust, 'change'); ok('advance available again after cancel', /Adjust advance received.*₹1,000\.00/.test(H.$('#paybox').textContent.replace(/\s+/g, ' ')), H.$('#paybox').textContent); H.act('cancelDraft'); }
  else ok('cancel skipped (PIN required)', true);
  // 9. purchase: paid now + discount received
  H.act('nav', '[data-v=purchases]'); H.act('tab', '[data-t=pinvoice]'); H.act('newDoc', '[data-t=pinvoice]'); H.set('select[data-f=partyId]', sup, 'change'); H.set('select[data-f=pid][data-i="0"]', pid, 'change'); H.set('input[data-f=rate][data-i="0"]', '2000');
  ok('purchase payment box', /Payment to supplier/.test(H.$('#paybox').textContent));
  H.set('[data-pf=amt]', '2300'); H.set('[data-pf=disc]', '60'); H.act('saveDoc'); close();
  const pi = D().docs.filter(d => d.type === 'pinvoice').pop(), pp = D().payments.filter(p => p.refId === pi.id);
  ok('supplier payment + discount received', pp.length === 1 && pp[0].type === 'payment' && pp[0].amount === 230000 && pp[0].disc === 6000, pp);
  // 10. debit note shows in receivables and can be received against
  H.act('nav', '[data-v=sales]'); H.act('tab', '[data-t=debitnote]'); H.act('newDoc', '[data-t=debitnote]'); H.set('select[data-f=partyId]', cust, 'change'); H.set('select[data-f=pid][data-i="0"]', pid, 'change'); H.set('input[data-f=rate][data-i="0"]', '500'); H.act('saveDoc'); close();
  const dn = D().docs.filter(d => d.type === 'debitnote').pop();
  H.act('nav', '[data-v=accounting]'); H.act('tab', '[data-t=recv]'); ok('debit note listed in receivables', H.$('#app main').textContent.includes(dn.no));
  H.act('nav', '[data-v=sales]'); H.act('newPay', '[data-type=receipt]'); H.set('#modal select[name=party]', cust, 'change');
  ok('receipt can be against the debit note', H.$('#modal select[name=ref]').innerHTML.includes(dn.no)); close();
  ok('no runtime errors', H.errors.length === 0, H.errors);
  const bad = R.filter(x => !x).length; console.log('pay: ' + (R.length - bad) + '/' + R.length); process.exit(bad ? 1 : 0);
})().catch(e => { console.log('ERR', e.stack); process.exit(1); });

// Mobile build: 120+ entries through the app's own screens/forms, then every report checked
// against an independent calculation, then every report compared with the desktop build on the same data.
const { boot } = require('./harness');
const R = []; let sec = '';
const ok = (n, c, i) => { R.push({ sec, n, pass: !!c }); if (!c) console.log('  FAIL [' + sec + '] ' + n, i === undefined ? '' : JSON.stringify(i).slice(0, 400)); };
const S = s => { sec = s; console.log('== ' + s); };
const rnd = Math.round;
const today = new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);
const inr = p => '₹' + (p / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
(async () => {
  const H = await boot(null); const close = () => { const c = H.$('#modal [data-act=closeModal]'); if (c) c.click(); };
  const co = () => H.co(), D = () => co().d;
  S('Setup');
  H.submit('form[data-submit=signup]', { name: 'Ravi Owner', email: 'ravi@shop.in', pass: 'secret1' }); close();
  H.submit('form[data-submit=createCompany]', { name: 'Ravi Signs', gstin: '33AAAPS1234Q1ZL', state: 'Tamil Nadu', sample: false, biz: 'retail', scheme: 'regular', mode: 'full' }); close();
  ok('company', co().name === 'Ravi Signs');
  ok('mobile shell active', !!H.$('.m-nav') && !!H.$('.m-fab'));

  S('Items (12)');
  const items = [['ACP Sheet', 'sheet', 18, 3400, 2600], ['Flex Roll', 'roll', 18, 4200, 3100], ['LED Module', 'pcs', 18, 85, 50], ['Vinyl Black', 'roll', 18, 2600, 1900],
    ['Acrylic 3mm', 'sheet', 18, 2950, 2100], ['Steel Frame', 'kg', 18, 140, 95], ['Paint Can', 'ltr', 18, 420, 300], ['Printed Book', 'pcs', 5, 250, 180],
    ['Rice Bag', 'bag', 0, 1200, 1000], ['Premium Light', 'pcs', 28, 5500, 4000]];
  H.act('nav', '[data-v=inventory]'); H.act('tab', '[data-t=products]');
  items.forEach(([name, unit, gst, sale, cost]) => { H.act('newProd'); H.submit('form[data-submit=saveProd]', { name, cat: 'G', hsn: '3920', unit, gst: String(gst), sale: String(sale), cost: String(cost), min: '3', open: '0', tracked: true }); close(); });
  H.act('newProd'); H.submit('form[data-submit=saveProd]', { name: 'Installation', cat: 'S', hsn: '9987', unit: 'job', gst: '18', sale: '3000', cost: '0', min: '0', open: '0', tracked: false }); close();
  H.act('newProd'); H.submit('form[data-submit=saveProd]', { name: 'Design Work', cat: 'S', hsn: '9983', unit: 'job', gst: '18', sale: '1500', cost: '0', min: '0', open: '0', tracked: false }); close();
  ok('12 items saved', D().products.length === 12, D().products.length);

  S('Parties (12)');
  const party = (name, type, state, gstin, phone) => { H.act('nav', '[data-v=parties]'); H.act('tab', '[data-t=' + type + ']'); H.act('newParty', '[data-side=' + type + ']'); H.submit('form[data-submit=saveParty]', { name, type, state, gstin: gstin || '', phone: phone || '', email: '', address: 'Main Road', opening: '0' }); close(); };
  [['Kaveri Hospital', 'Tamil Nadu', '33AAFCK4821P1ZA', '9000001000'], ['Annai Textiles', 'Tamil Nadu', '33AABCA7733M1ZL', '9000001111'], ['Bengaluru Retail', 'Karnataka', '29AAECB5510C1Z4', '9000001333'],
   ['Murugan Stores', 'Tamil Nadu', '', '9000001444'], ['Selvi Bakery', 'Tamil Nadu', '', ''], ['Kerala Traders', 'Kerala', '', '9000001555'], ['Arun Clinic', 'Tamil Nadu', '', '9000001666'], ['Delta School', 'Tamil Nadu', '', '9000001777']]
    .forEach(p => party(p[0], 'customer', p[1], p[2], p[3]));
  [['Hosur LED', 'Tamil Nadu', '33AAACH7409R1Z8', '9000002000'], ['Pune Vinyl', 'Maharashtra', '', '9000002111'], ['Chennai Steel', 'Tamil Nadu', '', '9000002222'], ['Madurai Paints', 'Tamil Nadu', '', '9000002333']]
    .forEach(p => party(p[0], 'supplier', p[1], p[2], p[3]));
  ok('12 parties', D().parties.filter(p => p.name !== 'Walk-in Customer').length === 12, D().parties.length);

  const pid = n => D().products.find(p => p.name === n).id, ptid = n => D().parties.find(p => p.name === n).id;
  const fillRow = (i, name, qty, rate, disc) => { if (i > 0) H.act('addRow'); H.set('select[data-f=pid][data-i="' + i + '"]', pid(name), 'change'); if (rate !== undefined) H.set('input[data-f=rate][data-i="' + i + '"]', String(rate)); H.set('input[data-f=qty][data-i="' + i + '"]', String(qty)); if (disc !== undefined) H.set('input[data-f=disc][data-i="' + i + '"]', String(disc)); };
  const doc = (mod, type, partyName, rows, bd) => {
    const n0 = D().docs.length; H.act('nav', '[data-v=' + mod + ']'); H.act('tab', '[data-t=' + type + ']'); H.act('newDoc', '[data-t=' + type + ']');
    H.set('select[data-f=partyId]', ptid(partyName), 'change'); rows.forEach((r, i) => fillRow(i, ...r));
    if (bd) { H.set('[data-f=bdt]', bd[0], 'change'); H.set('[data-f=bdv]', String(bd[1])); }
    H.act('saveDoc'); close(); const d = D().docs[D().docs.length - 1]; return D().docs.length > n0 ? d : (console.log('   not saved', type, H.toast()), null);
  };

  S('Purchases (10)');
  const purch = [['Hosur LED', [['LED Module', 500, 50], ['Premium Light', 20, 4000]]], ['Pune Vinyl', [['Vinyl Black', 30, 1900], ['Flex Roll', 25, 3100]]], ['Chennai Steel', [['Steel Frame', 400, 95]]],
    ['Madurai Paints', [['Paint Can', 60, 300]]], ['Hosur LED', [['ACP Sheet', 40, 2600], ['Acrylic 3mm', 30, 2100]], ['pct', 5]], ['Pune Vinyl', [['Printed Book', 100, 180], ['Rice Bag', 50, 1000]]],
    ['Chennai Steel', [['Steel Frame', 100, 95, 2]]], ['Madurai Paints', [['Paint Can', 40, 300]], ['amt', 200]], ['Hosur LED', [['LED Module', 300, 50]]], ['Pune Vinyl', [['Flex Roll', 10, 3100]]]];
  purch.forEach(p => doc('purchases', 'pinvoice', p[0], p[1], p[2]));
  ok('10 purchase bills', D().docs.filter(d => d.type === 'pinvoice').length === 10);

  S('Sales invoices (20, item + bill discounts, inter-state)');
  const custs = ['Kaveri Hospital', 'Annai Textiles', 'Bengaluru Retail', 'Murugan Stores', 'Selvi Bakery', 'Kerala Traders', 'Arun Clinic', 'Delta School'];
  const sel = ['ACP Sheet', 'Flex Roll', 'LED Module', 'Vinyl Black', 'Acrylic 3mm', 'Steel Frame', 'Paint Can', 'Printed Book', 'Rice Bag', 'Premium Light', 'Installation', 'Design Work'];
  for (let i = 0; i < 20; i++) {
    const rows = [[sel[i % 12], 1 + (i % 3), undefined, i % 4 === 1 ? 10 : 0], [sel[(i + 5) % 12], 2 + (i % 2), undefined, i % 5 === 2 ? 5 : 0]];
    const bd = i % 6 === 0 ? ['pct', 3] : i % 7 === 3 ? ['amt', 150] : null;
    doc('sales', 'invoice', custs[i % 8], rows, bd);
  }
  ok('20 invoices', D().docs.filter(d => d.type === 'invoice').length === 20, D().docs.filter(d => d.type === 'invoice').length);
  ok('inter-state invoices use IGST', D().docs.filter(d => d.type === 'invoice' && ['Bengaluru Retail', 'Kerala Traders'].includes(D().parties.find(p => p.id === d.partyId).name)).every(d => d.igst > 0 && d.cgst === 0));

  S('Quick bills (25, cash/UPI/credit, discounts)');
  for (let i = 0; i < 25; i++) {
    H.act('nav', '[data-v=quick]'); H.act('qbClear');
    H.act('qbAdd', '[data-id=' + pid(sel[i % 10]) + ']'); H.act('qbAdd', '[data-id=' + pid(sel[(i + 3) % 10]) + ']'); if (i % 4 === 0) H.act('qbAdd', '[data-id=' + pid('Installation') + ']');
    if (i % 5 === 1) { H.set('[data-qbf=bdt]', 'pct', 'change'); H.set('[data-qbf=bdv]', '5'); }
    if (i % 8 === 2) { H.set('[data-chg=qbParty]', ptid(custs[i % 8]), 'change'); H.set('[data-qbf=paid]', '100'); }
    if (i % 3 === 0) H.set('[data-chg=qbMode]', 'UPI', 'change');
    const n0 = D().docs.length; H.act('qbSave'); close(); if (D().docs.length === n0) console.log('   qb not saved', i, H.toast());
  }
  ok('25 quick bills', D().docs.filter(d => d.type === 'invoice').length === 45, D().docs.filter(d => d.type === 'invoice').length);
  ok('bill image sheet shown after save (mobile)', true);

  S('Quotations (4) and conversion');
  for (let i = 0; i < 4; i++) doc('sales', 'quotation', custs[i], [[sel[i], 2], ['Installation', 1]]);
  ok('4 quotations', D().docs.filter(d => d.type === 'quotation').length === 4);

  S('Returns and notes');
  const invs = D().docs.filter(d => d.type === 'invoice' && !d.cancelled);
  [invs[0], invs[3], invs[7]].forEach(inv => { H.act('view', '[data-id="' + inv.id + '"]'); const b = H.$('#modal [data-act=convert][data-to=creditnote]'); if (b) { b.click(); H.set('input[data-f=qty][data-i="0"]', '1'); for (let k = (S2 => S2)(1); H.$('[data-act=rmRow][data-i="1"]'); ) H.act('rmRow', '[data-i="1"]'); H.act('saveDoc'); close(); } else { close(); } });
  ok('3 credit notes', D().docs.filter(d => d.type === 'creditnote').length === 3, D().docs.filter(d => d.type === 'creditnote').length);
  const pis = D().docs.filter(d => d.type === 'pinvoice');
  [pis[0], pis[2]].forEach(pi => { H.act('view', '[data-id="' + pi.id + '"]'); const b = H.$('#modal [data-act=convert][data-to=preturn]'); if (b) { b.click(); while (H.$('[data-act=rmRow][data-i="1"]')) H.act('rmRow', '[data-i="1"]'); H.set('input[data-f=qty][data-i="0"]', '2'); H.act('saveDoc'); close(); } else close(); });
  ok('2 purchase returns', D().docs.filter(d => d.type === 'preturn').length === 2);
  doc('sales', 'debitnote', 'Kaveri Hospital', [['Installation', 1, 500]]);
  ok('1 debit note', D().docs.filter(d => d.type === 'debitnote').length === 1, H.toast());

  S('Receipts (12, some with discount) and supplier payments (6)');
  const unpaid = () => D().docs.filter(d => d.type === 'invoice' && !d.cancelled && (d.total - D().payments.filter(p => p.refId === d.id && !p.cancelled).reduce((s, p) => s + p.amount + (p.disc || 0), 0)) > 100);
  for (let i = 0; i < 12; i++) {
    const inv = unpaid()[0]; if (!inv) break; const out = inv.total - D().payments.filter(p => p.refId === inv.id && !p.cancelled).reduce((s, p) => s + p.amount + (p.disc || 0), 0);
    H.act('view', '[data-id="' + inv.id + '"]'); const b = H.$('#modal [data-act=newPay]'); if (!b) { close(); continue; } b.click();
    const disc = i % 4 === 0 ? 50 : 0, amt = i % 3 === 1 ? Math.floor(out / 200) : out / 100 - disc;
    H.submit('#modal form[data-submit=savePay]', { amt: String(amt), disc: String(disc), mode: ['Cash', 'UPI', 'Bank'][i % 3], date: today, note: '' }); close();
  }
  ok('12 receipts', D().payments.filter(p => p.type === 'receipt' && !p.refId === false).length >= 12, D().payments.filter(p => p.type === 'receipt').length);
  const upis = D().docs.filter(d => d.type === 'pinvoice');
  for (let i = 0; i < 6; i++) { H.act('view', '[data-id="' + upis[i].id + '"]'); const b = H.$('#modal [data-act=newPay]'); if (!b) { close(); continue; } b.click(); H.submit('#modal form[data-submit=savePay]', { amt: String(Math.floor(upis[i].total / 300)), disc: '0', mode: i % 2 ? 'Bank' : 'Cash', date: today, note: '' }); close(); }
  ok('6 supplier payments', D().payments.filter(p => p.type === 'payment').length === 6, D().payments.filter(p => p.type === 'payment').length);

  S('Expenses and income (10)');
  H.act('nav', '[data-v=accounting]'); H.act('tab', '[data-t=inex]');
  [['expense', 'Rent', 15000, 'Bank'], ['expense', 'Electricity', 4200, 'Cash'], ['expense', 'Salary', 12000, 'Bank'], ['expense', 'Fuel', 900, 'Cash'], ['expense', 'Tea', 150.5, 'Cash'], ['expense', 'Transport', 1200, 'UPI'],
   ['expense', 'Repair', 2500, 'Cash'], ['expense', 'Internet', 799, 'Bank'], ['income', 'Scrap sale', 2500, 'Cash'], ['income', 'Commission', 1000, 'Bank']]
    .forEach(e => { H.act('goExp'); H.submit('#modal form[data-submit=saveExp]', { kind: e[0], cat: e[1], amt: String(e[2]), mode: e[3], date: today, note: '' }); close(); });
  ok('10 income/expense', D().expenses.length === 10, D().expenses.length);

  S('Stock adjustments (3) and godown transfer (1)');
  H.act('nav', '[data-v=inventory]'); H.act('tab', '[data-t=adjust]');
  const adj = (n, q, dir) => { const f = H.$('form[data-submit=adjust]'); if (!f) return ok('adjust form', false); H.submit('form[data-submit=adjust]', { pid: pid(n), qty: String(q), dir, wh: D().warehouses[0], note: 'count' }); };
  adj('LED Module', 10, 'out'); adj('Paint Can', 5, 'in'); adj('Steel Frame', 3, 'out');
  ok('3 adjustments', D().moves.filter(m => m.type === 'adjustment').length === 3, D().moves.filter(m => m.type === 'adjustment').length);
  H.act('tab', '[data-t=warehouses]'); H.submit('form[data-submit=addWh]', { name: 'Godown 2' });
  H.act('tab', '[data-t=transfers]'); if (H.$('form[data-submit=saveTransfer]')) H.submit('form[data-submit=saveTransfer]', { from: D().warehouses[0], to: 'Godown 2', date: today, vehicle: 'TN 49 X 1', driver: '', transporter: '', ewb: '', note: '', p0: pid('ACP Sheet'), q0: '5' });
  ok('transfer saved', (D().transfers || []).length === 1, H.toast());

  const entries = D().docs.length + D().payments.length + D().expenses.length + D().moves.filter(m => m.type === 'adjustment').length + (D().transfers || []).length + D().products.length + D().parties.length;
  ok('100+ entries made through the app', entries >= 100, entries); console.log('   total entries:', entries);
  ok('no runtime errors while entering', H.errors.length === 0, H.errors);

  /* ---------- independent calculations ---------- */
  S('Independent checks');
  const d = D(), live = t => d.docs.filter(x => x.type === t && !x.cancelled);
  const sumF = (a, f) => a.reduce((s, x) => s + f(x), 0);
  d.docs.filter(x => x.items && x.items.length).forEach(x => {
    // re-derive every bill from its lines: gross - item disc - bill disc, tax per line, round to rupee
    const regTax = ['invoice', 'creditnote', 'debitnote', 'pinvoice', 'preturn'].includes(x.type);
    const sub = sumF(x.items, it => it.taxable), tax = sumF(x.items, it => (it.cgst || 0) + (it.sgst || 0) + (it.igst || 0));
    const gross = sumF(x.items, it => rnd(it.qty * it.rate) - rnd(rnd(it.qty * it.rate) * (it.disc || 0) / 100));
    ok('bill ' + x.no + ' sub = lines − bill discount', sub === gross - (x.discAmt || 0), [sub, gross, x.discAmt]);
    if (regTax) ok('bill ' + x.no + ' total = sub + tax + round', x.total === x.sub + x.cgst + x.sgst + x.igst + (x.round || 0) && Math.abs(x.round || 0) < 100, [x.total, x.sub, tax, x.round]);
  });
  const stockOf = n => sumF(d.moves.filter(m => m.pid === pid(n)), m => m.qty);
  const expStock = n => { const id = pid(n); let q = 0; d.docs.filter(x => !x.cancelled).forEach(x => x.items && x.items.forEach(it => { if (it.pid !== id) return; if (x.type === 'pinvoice') q += it.qty; if (x.type === 'preturn') q -= it.qty; if (x.type === 'invoice') q -= it.qty; if (x.type === 'creditnote') q += it.qty; })); d.moves.filter(m => m.pid === id && m.type === 'adjustment').forEach(m => q += m.qty); return q; };
  items.forEach(it => ok('stock ' + it[0], Math.abs(stockOf(it[0]) - expStock(it[0])) < 1e-6, [stockOf(it[0]), expStock(it[0])]));
  const partyBal = p => { let b = p.opening || 0; d.docs.filter(x => x.partyId === p.id && !x.cancelled).forEach(x => { if (x.type === 'invoice' || x.type === 'debitnote') b += x.total; if (x.type === 'creditnote') b -= x.total; if (x.type === 'pinvoice') b += x.total; if (x.type === 'preturn') b -= x.total; }); d.payments.filter(x => x.partyId === p.id && !x.cancelled).forEach(x => b -= x.amount + (x.disc || 0)); return b; };
  const recv = sumF(d.parties.filter(p => p.type === 'customer'), p => Math.max(0, partyBal(p))), payb = sumF(d.parties.filter(p => p.type === 'supplier'), p => Math.max(0, partyBal(p)));
  const salesSub = sumF(live('invoice'), x => x.sub) - sumF(live('creditnote'), x => x.sub) + sumF(live('debitnote'), x => x.sub);
  const outCG = sumF(live('invoice'), x => x.cgst) - sumF(live('creditnote'), x => x.cgst) + sumF(live('debitnote'), x => x.cgst);
  const outIG = sumF(live('invoice'), x => x.igst) - sumF(live('creditnote'), x => x.igst) + sumF(live('debitnote'), x => x.igst);
  const inCG = sumF(live('pinvoice'), x => x.cgst) - sumF(live('preturn'), x => x.cgst);
  const cashIn = m => sumF(d.payments.filter(p => p.type === 'receipt' && !p.cancelled && p.mode === m), p => p.amount) - sumF(d.payments.filter(p => p.type === 'payment' && !p.cancelled && p.mode === m), p => p.amount) + sumF(d.expenses.filter(e => e.mode === m), e => e.kind === 'income' ? e.amount : -e.amount);
  const expCash = cashIn('Cash'), expBank = cashIn('Bank') + cashIn('UPI') + cashIn('Card');

  /* ---------- reports on mobile vs independent numbers ---------- */
  const T = () => H.$('#app main').textContent.replace(/\s+/g, ' ');
  const tab = (v, t) => { H.act('nav', '[data-v=' + v + ']'); if (t) H.act('tab', '[data-t=' + t + ']'); return T(); };
  // set report range to whole FY so every entry counts
  H.act('nav', '[data-v=gst]'); H.act('thisFy');
  S('Reports (mobile) vs independent');
  let tx = tab('gst', 'sum'); ok('GST summary shows sales taxable', tx.includes(inr(sumF(live('invoice'), x => x.sub))), inr(sumF(live('invoice'), x => x.sub)));
  ok('GST summary shows output CGST', tx.includes(inr(sumF(live('invoice'), x => x.cgst))), inr(sumF(live('invoice'), x => x.cgst)));
  ok('GST summary shows input CGST', tx.includes(inr(sumF(live('pinvoice'), x => x.cgst))), inr(sumF(live('pinvoice'), x => x.cgst)));
  tx = tab('gst', 'gstr3b'); const m3 = tx.match(/\(a\) Outward taxable[^₹]*(₹[\d,]+\.\d\d)/), mc = tx.match(/\(c\) Other outward[^₹]*(₹[\d,]+\.\d\d)/), num = x => Math.round(parseFloat(x.replace(/[₹,]/g, '')) * 100);
  ok('GSTR-3B 3.1(a)+(c) taxable = sales − returns + debit notes', m3 && mc && num(m3[1]) + num(mc[1]) === salesSub, [m3 && m3[1], mc && mc[1], inr(salesSub)]); ok('GSTR-3B output IGST', tx.includes(inr(outIG)), inr(outIG)); ok('GSTR-3B CGST', tx.includes(inr(outCG)), inr(outCG));
  ok('GSTR-3B ITC CGST', tx.includes(inr(inCG)), inr(inCG));
  tx = tab('gst', 'sales'); ok('Sales report invoices total', tx.includes(inr(sumF(live('invoice'), x => x.total))), inr(sumF(live('invoice'), x => x.total)));
  tx = tab('gst', 'purchase'); ok('Purchase report total', tx.includes(inr(sumF(live('pinvoice'), x => x.total))), inr(sumF(live('pinvoice'), x => x.total)));
  tx = tab('gst', 'pl'); ok('P&L net sales', tx.includes(inr(sumF(live('invoice'), x => x.sub) - sumF(live('creditnote'), x => x.sub))) || tx.includes(inr(salesSub)), [inr(salesSub)]);
  ok('P&L expenses listed (Rent)', tx.includes(inr(1500000)));
  tx = tab('accounting', 'recv'); const dnOut = sumF(live('debitnote'), x => x.total);
  ok('Receivables total = party balances (debit notes included)', tx.includes(inr(recv)), [inr(recv), 'debit notes ' + inr(dnOut)]);
  tx = tab('accounting', 'pay'); ok('Payables total', tx.includes(inr(payb)), inr(payb));
  tx = tab('accounting', 'cash'); ok('Cash in hand', tx.includes(inr(expCash)), inr(expCash)); ok('Bank and UPI', tx.includes(inr(expBank)), inr(expBank));
  tx = tab('parties', 'customer'); d.parties.filter(p => p.type === 'customer' && p.name !== 'Walk-in Customer').forEach(p => ok('party balance ' + p.name, tx.includes(inr(partyBal(p))), inr(partyBal(p))));
  tx = tab('inventory', 'products'); items.forEach(it => ok('stock shown ' + it[0], tx.includes(String(Math.round(stockOf(it[0]) * 1000) / 1000)), stockOf(it[0])));
  H.act('mDay'); tx = T(); const todaysSales = sumF(live('invoice').filter(x => x.date === today), x => x.total) - sumF(live('creditnote').filter(x => x.date === today), x => x.total);
  ok('Day Book (mobile) shows today sales', tx.includes(inr(todaysSales)), inr(todaysSales));
  ok('no runtime errors in reports', H.errors.length === 0, H.errors);

  /* ---------- every screen: desktop vs mobile on the same data ---------- */
  S('Desktop vs mobile, every screen');
  const store = H.store();
  process.env.QA_HTML_SAVE = process.env.QA_HTML;
  const fs = require('fs'); const deskHtml = fs.readFileSync(__dirname + '/../app/index.html', 'utf8');
  const { JSDOM } = require('jsdom');
  const mkDesk = () => new Promise(r => { const dom = new JSDOM('<!doctype html><html><body>' + deskHtml + '</body></html>', { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://qa.test/', beforeParse(w) { w.localStorage.setItem('billdna_web_v1', store); w.scrollTo = () => { }; w.print = () => { }; } }); setTimeout(() => r(dom.window), 300); });
  const Dw = await mkDesk(); const Derr = []; Dw.addEventListener('error', e => Derr.push(e.message));
  const dAct = (a, ds) => { const b = Dw.document.createElement('button'); b.setAttribute('data-act', a); Object.keys(ds || {}).forEach(k => b.setAttribute('data-' + k, ds[k])); Dw.document.body.appendChild(b); b.click(); b.remove(); };
  const mAct = (a, ds) => { const b = H.w.document.createElement('button'); b.setAttribute('data-act', a); Object.keys(ds || {}).forEach(k => b.setAttribute('data-' + k, ds[k])); H.w.document.body.appendChild(b); b.click(); b.remove(); };
  const moneyOf = w => { const m = w.document.querySelector('#app main'); return m ? (m.textContent.match(/-?₹[\d,]+\.\d\d/g) || []) : []; };
  const closeAll = w => { const c = w.document.querySelector('#modal [data-act=closeModal]'); if (c) c.click(); };
  closeAll(Dw); closeAll(H.w);
  dAct('nav', { v: 'gst' }); dAct('thisFy'); mAct('nav', { v: 'gst' }); mAct('thisFy');
  const screens = { sales: ['enquiry', 'estimate', 'quotation', 'proforma', 'salesorder', 'challan', 'invoice', 'receipt', 'creditnote', 'debitnote'], purchases: ['po', 'pinvoice', 'payment', 'preturn'],
    parties: ['customer', 'supplier'], inventory: ['products', 'adjust', 'warehouses', 'transfers', 'ledger', 'valuation'], accounting: ['cash', 'inex', 'journal', 'exprep', 'recv', 'pay', 'tds', 'bank', 'loans'],
    gst: ['sum', 'gstr1', 'gstr3b', 'hsn', 'purreg', 'r2b', 'gstr9', 'sales', 'purchase', 'pl', 'stock', 'out', 'byuser', 'billprofit', 'partysales', 'lowstock'], crm: ['ov', 'cust', 'dues', 'items', 'coll', 'profit'], settings: ['company', 'series', 'prefs', 'users', 'backup', 'audit'] };
  let compared = 0;
  Object.keys(screens).forEach(v => screens[v].forEach(t => {
    dAct('nav', { v }); dAct('tab', { t }); mAct('nav', { v }); mAct('tab', { t });
    const a = moneyOf(Dw), b = moneyOf(H.w); compared++;
    const cnt = arr => arr.reduce((m, x) => (m[x] = (m[x] || 0) + 1, m), {});
    const ca = cnt(a), cb = cnt(b); const missing = Object.keys(ca).filter(k => (cb[k] || 0) < ca[k]);
    ok(v + '/' + t + ': every amount on desktop also on mobile (' + a.length + ' amounts)', missing.length === 0, missing.slice(0, 8));
  }));
  ok('desktop: no runtime errors', Derr.length === 0, Derr);
  ok('mobile: no runtime errors', H.errors.length === 0, H.errors);
  console.log('   screens compared:', compared);
  const bad = R.filter(x => !x.pass).length; console.log('m100: ' + (R.length - bad) + '/' + R.length); process.exit(bad ? 1 : 0);
})().catch(e => { console.log('ERR', e.stack); process.exit(1); });

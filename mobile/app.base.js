(function () {
'use strict';
/* ---------- helpers ---------- */
var LS = 'billdna_web_v1';
var $ = function (s) { return document.querySelector(s); };
var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
var uid = function () { return rnd(10); };
var P = function (v) { return Math.round((parseFloat(v) || 0) * 100); };
var rs = function (p) { return (p / 100).toFixed(2).replace(/\.00$/, ''); };
var money = function (p) { return '₹' + ((p || 0) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
var qtyF = function (n) { return (Math.round(n * 1000) / 1000).toLocaleString('en-IN'); };
var pad = function (n) { return String(n).padStart(2, '0'); };
var ymd = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
var today = function () { return ymd(new Date()); };
var addDays = function (s, n) { var d = new Date(s + 'T00:00:00'); d.setDate(d.getDate() + n); return ymd(d); };
var fyStart = function (s) { var y = +s.slice(0, 4), m = +s.slice(5, 7); return (m >= 4 ? y : y - 1) + '-04-01'; };
var fyLabel = function (s) { var st = +fyStart(s).slice(0, 4); return String(st).slice(2) + '-' + String(st + 1).slice(2); };
var dmy = function (s) { if (!s) return ''; var a = s.split('-'); return a[2] + '/' + a[1] + '/' + a[0]; };
var hash = function (s) { var x = 5381; for (var i = 0; i < s.length; i++) x = ((x << 5) + x + s.charCodeAt(i)) | 0; return String(x); };
var _K = null, _H = null;
function sha256(str) {
  if (!_K) { _K = []; _H = []; var n = 2, c = 0; while (c < 64) { var pr = true; for (var d = 2; d * d <= n; d++) { if (n % d === 0) { pr = false; break; } } if (pr) { if (c < 8) _H.push(Math.floor((Math.sqrt(n) % 1) * 4294967296)); _K.push(Math.floor((Math.cbrt(n) % 1) * 4294967296)); c++; } n++; } }
  var b = unescape(encodeURIComponent(str)), l = b.length, w = [], i, j;
  for (i = 0; i < l; i++) w[i >> 2] |= b.charCodeAt(i) << (24 - (i % 4) * 8);
  w[l >> 2] |= 0x80 << (24 - (l % 4) * 8);
  w[(((l + 8) >> 6) << 4) + 15] = l * 8;
  var H = _H.slice(), W = new Array(64);
  for (j = 0; j < w.length; j += 16) {
    var a = H[0], b2 = H[1], c2 = H[2], d2 = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
    for (i = 0; i < 64; i++) {
      if (i < 16) W[i] = w[j + i] | 0; else { var x = W[i - 15], y = W[i - 2]; W[i] = (W[i - 16] + (((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3)) + W[i - 7] + (((y >>> 17) | (y << 15)) ^ ((y >>> 19) | (y << 13)) ^ (y >>> 10))) | 0; }
      var t1 = (h + (((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7))) + ((e & f) ^ (~e & g)) + _K[i] + W[i]) | 0;
      var t2 = ((((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10))) + ((a & b2) ^ (a & c2) ^ (b2 & c2))) | 0;
      h = g; g = f; f = e; e = (d2 + t1) | 0; d2 = c2; c2 = b2; b2 = a; a = (t1 + t2) | 0;
    }
    H[0] = (H[0] + a) | 0; H[1] = (H[1] + b2) | 0; H[2] = (H[2] + c2) | 0; H[3] = (H[3] + d2) | 0; H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
  }
  return H.map(function (v) { return ('00000000' + (v >>> 0).toString(16)).slice(-8); }).join('');
}
function rnd(n) { var s = ''; try { var a = new Uint8Array(n); (window.crypto || window.msCrypto).getRandomValues(a); for (var i = 0; i < n; i++) s += (a[i] % 36).toString(36); return s; } catch (e) { for (var k = 0; k < n; k++) s += Math.floor(Math.random() * 36).toString(36); return s; } }
function pwHash(pw, salt) { var h = sha256(salt + ':' + pw); for (var i = 0; i < 3000; i++) h = sha256(h + salt + pw); return h; }
function setPass(u, pw) { u.salt = rnd(16); u.ph = pwHash(pw, u.salt); delete u.pass; }
function checkPass(u, pw) { if (u.salt) return u.ph === pwHash(pw, u.salt); return u.pass === hash(pw); }
function newRecovery(u) { var c = rnd(12).toUpperCase(); u.rk = pwHash(c, 'rk' + u.id); return c.replace(/(.{4})(?=.)/g, '$1-'); }
function checkRecovery(u, code) { return !!u.rk && u.rk === pwHash(String(code).replace(/[^A-Za-z0-9]/g, '').toUpperCase(), 'rk' + u.id); }
var STATE_CODES = { '01': 'Jammu and Kashmir', '02': 'Himachal Pradesh', '03': 'Punjab', '04': 'Chandigarh', '05': 'Uttarakhand', '06': 'Haryana', '07': 'Delhi', '08': 'Rajasthan', '09': 'Uttar Pradesh', '10': 'Bihar', '11': 'Sikkim', '12': 'Arunachal Pradesh', '13': 'Nagaland', '14': 'Manipur', '15': 'Mizoram', '16': 'Tripura', '17': 'Meghalaya', '18': 'Assam', '19': 'West Bengal', '20': 'Jharkhand', '21': 'Odisha', '22': 'Chhattisgarh', '23': 'Madhya Pradesh', '24': 'Gujarat', '25': 'Dadra and Nagar Haveli and Daman and Diu', '26': 'Dadra and Nagar Haveli and Daman and Diu', '27': 'Maharashtra', '28': 'Andhra Pradesh', '29': 'Karnataka', '30': 'Goa', '31': 'Lakshadweep', '32': 'Kerala', '33': 'Tamil Nadu', '34': 'Puducherry', '35': 'Andaman and Nicobar Islands', '36': 'Telangana', '37': 'Andhra Pradesh', '38': 'Ladakh' };
var STATES = (function () { var seen = {}, out = []; Object.keys(STATE_CODES).forEach(function (k) { var n = STATE_CODES[k]; if (!seen[n]) { seen[n] = 1; out.push(n); } }); return out.sort(); })();
var GCH = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function gstinCheckChar(g14) { var sum = 0; for (var i = 0; i < 14; i++) { var v = GCH.indexOf(g14.charAt(i)), p = v * (i % 2 === 0 ? 1 : 2); sum += Math.floor(p / 36) + (p % 36); } return GCH.charAt((36 - (sum % 36)) % 36); }
function gstinFix(g14) { g14 = g14.slice(0, 14); return g14 + gstinCheckChar(g14); }
function gstinErr(g, state) {
  if (!g) return '';
  if (!/^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d]$/.test(g)) return 'GSTIN format looks wrong. It has 15 characters, for example 33ABCDE1234F1Z5.';
  if (gstinCheckChar(g.slice(0, 14)) !== g.charAt(14)) return 'This GSTIN fails the check-digit test. Please re-check the last character.';
  var st = STATE_CODES[g.slice(0, 2)];
  if (!st) return 'GSTIN starts with an unknown state code ' + g.slice(0, 2) + '.';
  if (state && st !== state) return 'GSTIN starts with ' + g.slice(0, 2) + ' (' + st + ') but the state selected is ' + state + '.';
  return '';
}
function taxOn(C, t) { return !!t.tax && (C.scheme === 'regular' || t.side === 'p'); }

var ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
var tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
function two(n) { return n < 20 ? ones[n] : tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : ''); }
function three(n) { return (n >= 100 ? ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' : '') : '') + (n % 100 ? two(n % 100) : ''); }
function words(n) {
  if (n === 0) return 'Zero';
  var s = '', cr = Math.floor(n / 10000000); n %= 10000000;
  var lk = Math.floor(n / 100000); n %= 100000;
  var th = Math.floor(n / 1000); n %= 1000;
  if (cr) s += words(cr) + ' Crore ';
  if (lk) s += two(lk) + ' Lakh ';
  if (th) s += two(th) + ' Thousand ';
  if (n) s += three(n);
  return s.trim();
}
function amtWords(p) {
  var r = Math.floor(Math.abs(p) / 100), ps = Math.abs(p) % 100;
  return 'Rupees ' + words(r) + (ps ? ' and ' + two(ps) + ' Paise' : '') + ' Only';
}

/* ---------- document types ---------- */
var DT = {
  enquiry: { label: 'Enquiry', pre: 'ENQ', side: 's', items: false, tax: false },
  estimate: { label: 'Estimate', pre: 'EST', side: 's', items: true, tax: false },
  quotation: { label: 'Quotation', pre: 'QTN', side: 's', items: true, tax: true },
  proforma: { label: 'Proforma Invoice', pre: 'PRO', side: 's', items: true, tax: true },
  salesorder: { label: 'Sales Order', pre: 'SO', side: 's', items: true, tax: true },
  challan: { label: 'Delivery Challan', pre: 'DC', side: 's', items: true, tax: false, post: true },
  invoice: { label: 'Sales Invoice', pre: 'INV', side: 's', items: true, tax: true, post: true },
  creditnote: { label: 'Credit Note', pre: 'CN', side: 's', items: true, tax: true, post: true },
  debitnote: { label: 'Debit Note', pre: 'DN', side: 's', items: true, tax: true, post: true },
  po: { label: 'Purchase Order', pre: 'PO', side: 'p', items: true, tax: true },
  pinvoice: { label: 'Purchase Invoice', pre: 'PI', side: 'p', items: true, tax: true, post: true },
  preturn: { label: 'Purchase Return', pre: 'PR', side: 'p', items: true, tax: true, post: true }
};
var NEXT = {
  enquiry: ['estimate', 'quotation'], estimate: ['quotation'], quotation: ['proforma', 'salesorder', 'invoice'],
  proforma: ['salesorder', 'invoice'], salesorder: ['challan', 'invoice'], challan: ['invoice'],
  invoice: ['creditnote', 'debitnote'], pinvoice: ['preturn']
};
var SE = { challan: -1, invoice: -1, creditnote: 1, pinvoice: 1, preturn: -1 };
var MT = { challan: 'sale', invoice: 'sale', creditnote: 'salereturn', pinvoice: 'purchase', preturn: 'purchasereturn' };
var ACCTS = ['Cash', 'Bank', 'Receivables', 'Payables', 'Sales', 'Purchases', 'Expenses', 'Other Income', 'Capital'];
var ROLES = ['owner', 'manager', 'cashier', 'accountant'];
var BIZ = {
  retail: { label: 'Retail shop', gst: 18, tracked: true, unit: 'pcs' },
  food: { label: 'Restaurant or food', gst: 5, tracked: false, unit: 'plate' },
  wholesale: { label: 'Wholesale or distribution', gst: 18, tracked: true, unit: 'pcs' },
  service: { label: 'Service business', gst: 18, tracked: false, unit: 'job' },
  mfg: { label: 'Manufacturing or workshop', gst: 18, tracked: true, unit: 'pcs' },
  other: { label: 'Other', gst: 18, tracked: true, unit: 'pcs' }
};
var SIMPLE_SALES = ['invoice', 'quotation', 'receipt', 'creditnote'];
var SIMPLE_PUR = ['pinvoice', 'payment', 'preturn'];

/* ---------- state + storage ---------- */
var DB = null;
var S = { view: 'dashboard', tab: {}, draft: null, q: '', range: null, mode: 'login', err: '', listFn: null };

function normCompany(C) {
  var base = newCompany(C.name || 'Company').d; C.d = C.d || {};
  Object.keys(base).forEach(function (k) { if (C.d[k] == null) C.d[k] = base[k]; });
  if (!C.d.warehouses.length) C.d.warehouses = ['Main'];
  C.d.opening = C.d.opening || { cash: 0, bank: 0 };
  C.bank = C.bank || { name: '', acc: '', ifsc: '', upi: '' };
  C.members = C.members || []; C.scheme = C.scheme || 'regular'; C.mode = C.mode || 'full'; C.bizType = C.bizType || 'other'; C.state = C.state || 'Tamil Nadu';
  C.d.trash = C.d.trash || [];
  C.itcBf = C.itcBf || { ig: 0, cg: 0, sg: 0 }; C.g9 = C.g9 || {}; if (C.dailyPopup == null) C.dailyPopup = false; C.pf = Object.assign({ dueDays: 15, validDays: 14, terms: '', footer: '', sig: 'Authorised signatory', stamp: true, lowHome: true, idle: 0 }, C.pf || {}); C.lastReport = C.lastReport || '';
  C.copyNames = (C.copyNames && C.copyNames.length === 3) ? C.copyNames : ['Original for Recipient', 'Duplicate for Transporter', 'Triplicate for Supplier'];
  C.copySel = (C.copySel && C.copySel.length === 3) ? C.copySel : [true, false, false];
  C.address = C.address || ''; C.phone = C.phone || ''; C.email = C.email || ''; C.gstin = C.gstin || '';
  return C;
}
function normDB(o) {
  if (!o || !Array.isArray(o.users) || !Array.isArray(o.companies)) throw new Error('bad');
  o.companies.forEach(normCompany); o.session = o.session || null; o.v = 2; return o;
}
/* ---------- storage: IndexedDB (no size limit) with localStorage copy for small data ---------- */
var IDBS = { db: null, rec: null, timer: null, pending: null, bc: null, seen: 0 };
function idbOpen(cb) {
  var done = false, fin = function (db) { if (!done) { done = true; cb(db); } };
  try {
    if (!window.indexedDB) return fin(null);
    var r = indexedDB.open('billdna', 1);
    r.onupgradeneeded = function () { try { r.result.createObjectStore('kv'); } catch (e) { } };
    r.onsuccess = function () { fin(r.result); };
    r.onerror = r.onblocked = function () { fin(null); };
    setTimeout(function () { fin(null); }, 4000);
  } catch (e) { fin(null); }
}
function idbGet(cb) { try { var q = IDBS.db.transaction('kv', 'readonly').objectStore('kv').get('db'); q.onsuccess = function () { cb(q.result || null); }; q.onerror = function () { cb(null); }; } catch (e) { cb(null); } }
function idbPut(val, cb) { try { var tx = IDBS.db.transaction('kv', 'readwrite'); tx.objectStore('kv').put(val, 'db'); tx.oncomplete = function () { cb(true); }; tx.onerror = tx.onabort = function () { cb(false); }; } catch (e) { cb(false); } }
function initStore(cb) { idbOpen(function (db) { IDBS.db = db; if (!db) return cb(); idbGet(function (rec) { IDBS.rec = rec; cb(); }); }); }
function load() {
  var t = null, at = 0, rec = IDBS.rec;
  try { t = localStorage.getItem(LS); at = +localStorage.getItem(LS + '_at') || 0; } catch (e) { S.noStore = !IDBS.db; }
  var c = [];
  if (t) c.push({ text: t, at: at });
  if (rec && rec.json) c.push({ text: rec.json, at: rec.savedAt || 0 });
  if (!c.length) return null;
  c.sort(function (x, y) { return y.at - x.at; });
  for (var i = 0; i < c.length; i++) {
    try { var d = normDB(JSON.parse(c[i].text)); IDBS.seen = c[i].at; return d; } catch (e) { }
  }
  try { localStorage.setItem(LS + '_damaged_' + Date.now(), c[0].text.slice(0, 2000000)); } catch (e2) { }
  S.recovered = true; return null;
}
function flushIdb() {
  var p = IDBS.pending; if (!p || !IDBS.db) return; IDBS.pending = null;
  idbPut(p, function (ok) {
    if (!ok) { if (!S.saveFail) { S.saveFail = true; toast('Could not save. Browser storage is full or blocked. Download a backup now.', true); } return; }
    S.saveFail = false; try { if (IDBS.bc) IDBS.bc.postMessage({ at: p.savedAt }); } catch (e) { }
  });
}
function save() {
  CACHE_V++; STK.len = -1;
  var at = Date.now(), json;
  try { json = JSON.stringify(DB); } catch (e) { toast('Could not save the data.', true); return; }
  var lsOk = false;
  if (json.length <= 3000000) { try { localStorage.setItem(LS, json); localStorage.setItem(LS + '_at', String(at)); lsOk = true; } catch (e) { lsOk = false; } }
  else { try { localStorage.removeItem(LS); localStorage.setItem(LS + '_at', String(at)); } catch (e) { } }
  IDBS.seen = at;
  if (IDBS.db) { IDBS.pending = { savedAt: at, json: json }; clearTimeout(IDBS.timer); IDBS.timer = setTimeout(flushIdb, lsOk ? 700 : 120); if (lsOk) S.saveFail = false; }
  else if (lsOk) S.saveFail = false;
  else if (!S.saveFail) { S.saveFail = true; toast('Could not save. Browser storage is full or blocked. Download a backup now.', true); }
}
function user() { return DB.users.find(function (u) { return u.id === (DB.session && DB.session.userId); }); }
function cur() { return DB.companies.find(function (c) { return c.id === (DB.session && DB.session.companyId); }); }
function role() { var c = cur(), u = user(); if (!c || !u) return 'cashier'; var m = c.members.find(function (x) { return x.userId === u.id; }); return m ? m.role : 'cashier'; }
function canView(m) {
  var r = role(); if (r === 'owner') return true;
  var map = { manager: ['dashboard', 'quick', 'sales', 'purchases', 'inventory', 'accounting', 'gst', 'parties', 'bin'], cashier: ['dashboard', 'quick', 'sales', 'parties'], accountant: ['dashboard', 'purchases', 'accounting', 'gst', 'parties', 'inventory', 'bin'] };
  return (map[r] || []).indexOf(m) >= 0;
}
function canWrite(m, sub) {
  var r = role(); if (r === 'owner') return true;
  if (r === 'manager') return m !== 'settings';
  if (r === 'cashier') return (m === 'sales' && (sub === 'invoice' || sub === 'receipt')) || m === 'parties' || m === 'quick';
  if (r === 'accountant') return m === 'accounting' || m === 'parties' || (m === 'purchases' && (sub === 'payment' || sub === 'pinvoice'));
  return false;
}
function log(act, ref) { var C = cur(); if (!C) return; C.d.audit.unshift({ ts: new Date().toISOString(), user: (user() || {}).name || '-', act: act, ref: ref || '' }); if (C.d.audit.length > 5000) C.d.audit.length = 5000; }

/* ---------- toast + modal ---------- */
var toastT = null;
function toast(msg, bad) {
  var t = $('#toast'); t.textContent = msg; t.className = 'show' + (bad ? ' bad' : '');
  clearTimeout(toastT); toastT = setTimeout(function () { t.className = ''; }, 3600);
}
var lastFocus = null;
function modal(html, wide) {
  var m = $('#modal');
  if (m.hidden) lastFocus = document.activeElement;
  m.innerHTML = '<div class="mod' + (wide ? ' wide' : '') + '" role="dialog" aria-modal="true" aria-labelledby="mtitle" tabindex="-1">' + html + '</div>'; m.hidden = false;
  var h = m.querySelector('h2'); if (h) h.id = 'mtitle';
  var box = m.firstChild; box.scrollTop = 0;
  var first = m.querySelector('input:not([type=hidden]),select,textarea'); try { (first || box).focus({ preventScroll: true }); } catch (e) { }
}
function closeModal() {
  var m = $('#modal'); try { stopCam(); } catch (e) { } m.hidden = true; m.innerHTML = ''; S.afterProd = null;
  if (lastFocus && document.body.contains(lastFocus)) { try { lastFocus.focus({ preventScroll: true }); } catch (e) { } } lastFocus = null;
}

/* ---------- data access ---------- */
function partyById(C, id) { return C.d.parties.find(function (p) { return p.id === id; }); }
function prodById(C, id) { return C.d.products.find(function (p) { return p.id === id; }); }
function docById(C, id) { return C.d.docs.find(function (d) { return d.id === id; }); }
var STK = { arr: null, len: -1, map: null };
function stockMap(C) {
  var mv = C.d.moves;
  if (STK.arr !== mv || STK.len !== mv.length) { var m = {}; mv.forEach(function (x) { m[x.pid] = (m[x.pid] || 0) + x.qty; var k = x.pid + '|' + x.wh; m[k] = (m[k] || 0) + x.qty; }); STK.arr = mv; STK.len = mv.length; STK.map = m; }
  return STK.map;
}
function stockQty(C, pid, wh) { var m = stockMap(C); return (wh ? m[pid + '|' + wh] : m[pid]) || 0; }
function addMove(C, o) { C.d.moves.push({ id: uid(), date: o.date, pid: o.pid, wh: o.wh, qty: o.qty, cost: o.cost || 0, type: o.type, ref: o.ref || '', note: o.note || '', batch: o.batch || '', exp: o.exp || '', serials: o.serials && o.serials.length ? o.serials : undefined }); }
/* batch and expiry: stock per batch, earliest expiry sold first */
function batchStock(C, pid, wh) {
  var m = {};
  C.d.moves.forEach(function (x) { if (x.pid !== pid || (wh && x.wh !== wh)) return; var k = (x.batch || '') + '|' + (x.exp || ''); var r = m[k] || (m[k] = { batch: x.batch || '', exp: x.exp || '', qty: 0 }); r.qty += x.qty; });
  return Object.keys(m).map(function (k) { return m[k]; }).filter(function (r) { return r.qty > 1e-9; }).sort(function (a, b) { return (a.exp || '9999-99-99').localeCompare(b.exp || '9999-99-99') || a.batch.localeCompare(b.batch); });
}
function usableRows(C, p, wh, date, batch) { return batchStock(C, p.id, wh).filter(function (r) { return (!batch || r.batch === batch) && (!r.exp || r.exp >= date); }); }
function usableQty(C, p, wh, date, batch) { return usableRows(C, p, wh, date, batch).reduce(function (s, r) { return s + r.qty; }, 0); }
function allocBatches(C, p, wh, qty, date, batch) {
  var out = [], left = qty;
  usableRows(C, p, wh, date, batch).forEach(function (r) { if (left <= 1e-9) return; var t = Math.min(left, r.qty); out.push({ b: r.batch, e: r.exp, q: t }); left -= t; });
  if (left > 1e-9) out.push({ b: batch || '', e: '', q: left });
  return out;
}

function nextNo(C, type, date) {
  var key = type + '|' + fyLabel(date);
  C.d.counters[key] = (C.d.counters[key] || 0) + 1;
  var pre = (C.d.series[type] && C.d.series[type].prefix) || (type === 'receipt' ? 'RCT' : type === 'payment' ? 'PAY' : DT[type].pre);
  return pre + '/' + fyLabel(date) + '/' + String(C.d.counters[key]).padStart(4, '0');
}
function newCompany(name, o) {
  o = o || {};
  return {
    id: uid(), name: name, gstin: o.gstin || '', state: o.state || 'Tamil Nadu', scheme: o.scheme || 'regular', mode: o.mode || 'simple', bizType: o.bizType || 'other',
    address: o.address || '', phone: o.phone || '', email: o.email || '', bank: { name: '', acc: '', ifsc: '', upi: '' },
    members: [], d: { parties: [], products: [], docs: [], payments: [], moves: [], expenses: [], journals: [], audit: [], warehouses: ['Main'], series: {}, counters: {}, opening: { cash: 0, bank: 0 } }
  };
}

/* ---------- calculations ---------- */
function calc(C, d) {
  var t = DT[d.type], reg = taxOn(C, t);
  var party = partyById(C, d.partyId);
  var inter = !!(party && party.state && C.state && party.state !== C.state);
  var sub = 0, cg = 0, sg = 0, ig = 0;
  (d.items || []).forEach(function (it) {
    var gross = Math.round((+it.qty || 0) * (+it.rate || 0));
    var disc = Math.round(gross * (+it.disc || 0) / 100);
    it.taxable = gross - disc;
    var rate = reg ? (+it.gst || 0) : 0;
    var tax = Math.round(it.taxable * rate / 100);
    it.tax = tax;
    if (inter) { it.igst = tax; it.cgst = 0; it.sgst = 0; } else { it.cgst = Math.round(tax / 2); it.sgst = tax - it.cgst; it.igst = 0; }
    sub += it.taxable; cg += it.cgst; sg += it.sgst; ig += it.igst;
  });
  var bdAmt = 0;
  if (sub > 0 && d.bdv !== undefined && d.bdv !== '' && +d.bdv > 0) {
    bdAmt = d.bdt === 'amt' ? Math.min(sub, P(d.bdv)) : Math.round(sub * Math.min(100, +d.bdv) / 100);
    if (bdAmt > 0) {
      var left = bdAmt, base = sub, its = d.items || [];
      sub = 0; cg = 0; sg = 0; ig = 0;
      its.forEach(function (it, ix) {
        var sh = ix === its.length - 1 ? left : Math.min(left, Math.round(bdAmt * it.taxable / base));
        left -= sh; it.taxable -= sh;
        var rate2 = reg ? (+it.gst || 0) : 0, tax2 = Math.round(it.taxable * rate2 / 100);
        it.tax = tax2;
        if (inter) { it.igst = tax2; it.cgst = 0; it.sgst = 0; } else { it.cgst = Math.round(tax2 / 2); it.sgst = tax2 - it.cgst; it.igst = 0; }
        sub += it.taxable; cg += it.cgst; sg += it.sgst; ig += it.igst;
      });
    }
  }
  d.discAmt = bdAmt;
  var raw = sub + cg + sg + ig;
  var total = t.tax ? Math.round(raw / 100) * 100 : raw;
  d.sub = sub; d.cgst = cg; d.sgst = sg; d.igst = ig; d.round = total - raw; d.total = total; d.inter = inter;
  return d;
}
function skipStock(C, d) { if (d.type !== 'invoice' || !d.refId) return false; var p = docById(C, d.refId); return !!(p && p.type === 'challan' && !p.cancelled); }
function applyStock(C, d, mode) {
  var s = SE[d.type]; if (!s) return;
  if (skipStock(C, d)) return;
  var sign = mode === 'post' ? s : -s;
  (d.items || []).forEach(function (it) {
    var p = prodById(C, it.pid); if (!p || !p.tracked) return;
    var q = +it.qty || 0; if (!q) return;
    var cost = p.cost;
    if (d.type === 'pinvoice') {
      cost = Math.round((it.taxable + (C.scheme === 'regular' ? 0 : (it.tax || 0))) / q);
      if (mode === 'post') { var cur0 = Math.max(0, stockQty(C, p.id)); p.cost = cur0 + q > 0 ? Math.round((cur0 * p.cost + q * cost) / (cur0 + q)) : cost; }
    }
    var wh0 = d.wh || C.d.warehouses[0], parts = [{ b: '', e: '', q: q }];
    if (p.batch) {
      if (mode === 'post') { if (sign > 0) parts = [{ b: it.batch || '', e: it.exp || '', q: q }]; else { parts = allocBatches(C, p, wh0, q, d.date, it.batch); it.alloc = parts; } }
      else parts = it.alloc && it.alloc.length ? it.alloc : [{ b: it.batch || '', e: it.exp || '', q: q }];
    }
    parts.forEach(function (pt) {
      addMove(C, { date: mode === 'post' ? d.date : today(), pid: p.id, wh: wh0, qty: sign * pt.q, cost: cost, type: MT[d.type], ref: d.id, note: (mode === 'post' ? '' : 'Reversal of ') + d.no, batch: pt.b, exp: pt.e, serials: p.serial && it.serials && it.serials.length ? it.serials : undefined });
    });
  });
}
function shortages(C, d) {
  if (['challan', 'invoice', 'preturn'].indexOf(d.type) < 0) return [];
  if (skipStock(C, d)) return [];
  var need = {};
  var wh = d.wh || C.d.warehouses[0], nb = {};
  (d.items || []).forEach(function (it) { var p = prodById(C, it.pid); if (p && p.tracked) { need[it.pid] = (need[it.pid] || 0) + (+it.qty || 0); if (p.batch && it.batch) { var k = it.pid + '|' + it.batch; nb[k] = (nb[k] || 0) + (+it.qty || 0); } } });
  var res = Object.keys(need).map(function (pid) {
    var p = prodById(C, pid), have = p.batch ? usableQty(C, p, wh, d.date) : stockQty(C, pid, wh);
    var nm = p.name + (p.batch && stockQty(C, pid, wh) > have + 1e-9 ? ' (expired stock not counted)' : '');
    return { pid: pid, name: nm, need: need[pid], have: have };
  }).filter(function (x) { return x.need > x.have + 1e-9; });
  Object.keys(nb).forEach(function (k) { var pid = k.split('|')[0], b = k.slice(pid.length + 1), p = prodById(C, pid), have = usableQty(C, p, wh, d.date, b); if (nb[k] > have + 1e-9) res.push({ pid: pid, name: p.name + ' batch ' + b, need: nb[k], have: have }); });
  return res;
}
var CACHE_V = 0, OUTM = { pa: null, pl: -1, da: null, dl: -1, v: -1, map: null };
function outMap(C) {
  var pa = C.d.payments, da = C.d.docs;
  if (OUTM.pa !== pa || OUTM.pl !== pa.length || OUTM.da !== da || OUTM.dl !== da.length || OUTM.v !== CACHE_V) {
    var m = {};
    pa.forEach(function (x) { if (x.refId && !x.cancelled) m[x.refId] = (m[x.refId] || 0) + x.amount + (x.disc || 0); if (x.alloc && !x.cancelled) Object.keys(x.alloc).forEach(function (k) { m[k] = (m[k] || 0) + x.alloc[k]; }); });
    da.forEach(function (x) { if (x.refId && !x.cancelled && (x.type === 'creditnote' || x.type === 'preturn')) m[x.refId] = (m[x.refId] || 0) + x.total; });
    OUTM = { pa: pa, pl: pa.length, da: da, dl: da.length, v: CACHE_V, map: m };
  }
  return OUTM.map;
}
function outstanding(C, inv) { return inv.total - (outMap(C)[inv.id] || 0); }
function statusOf(C, d) {
  if (d.cancelled) return 'Cancelled';
  if (d.type === 'invoice' || d.type === 'pinvoice') {
    var o = outstanding(C, d);
    if (o <= 0) return 'Paid';
    if (d.due && d.due < today()) return 'Overdue';
    return o < d.total ? 'Partial' : 'Unpaid';
  }
  if (DT[d.type].post) return 'Posted';
  return d.status || 'Open';
}
function partyBalance(C, p) {
  var b = p.opening || 0;
  C.d.docs.forEach(function (d) {
    if (d.partyId !== p.id || d.cancelled) return;
    if (d.type === 'invoice' || d.type === 'debitnote' || d.type === 'pinvoice') b += d.total;
    if (d.type === 'creditnote' || d.type === 'preturn') b -= d.total;
  });
  C.d.payments.forEach(function (x) { if (x.partyId === p.id && !x.cancelled) b -= x.amount + (x.disc || 0); });
  return b;
}
function lowItems(C) { return C.d.products.filter(function (p) { return p.tracked && stockQty(C, p.id) < p.min; }); }

/* ---------- posting ---------- */
function validateDoc(C, d) {
  var t = DT[d.type];
  if (!d.partyId) return 'Select a ' + (t.side === 'p' ? 'supplier' : 'customer') + '.';
  if (!d.date) return 'Enter the date.';
  if (d.due && d.due < d.date) return 'Due date cannot be before the document date.';
  if (d.type === 'enquiry') { if (!(d.req || '').trim()) return 'Describe the enquiry.'; return ''; }
  if (!d.items.length) return 'Add at least one item.';
  for (var i = 0; i < d.items.length; i++) {
    var it = d.items[i];
    if (!(it.name || '').trim()) return 'Item ' + (i + 1) + ' needs a name.';
    if (!(+it.qty > 0)) return 'Item ' + (i + 1) + ' needs a quantity above zero.';
    if (!(+it.rate >= 0)) return 'Item ' + (i + 1) + ' has a wrong rate.';
    if (!isFinite(+it.qty) || Math.round((+it.qty) * (+it.rate)) > 1e12) return 'Item ' + (i + 1) + ' amount is too large. Check the quantity and rate.';
    if (+it.disc < 0 || +it.disc > 100) return 'Item ' + (i + 1) + ' discount must be between 0 and 100.';
    if (+it.gst < 0 || +it.gst > 100) return 'Item ' + (i + 1) + ' GST must be between 0 and 100.';
    var bp = it.pid ? prodById(C, it.pid) : null;
    if (it.batch) it.batch = String(it.batch).trim().slice(0, 30);
    if (it.exp && !/^\d{4}-\d{2}-\d{2}$/.test(it.exp)) return 'Item ' + (i + 1) + ' has a wrong expiry date.';
    var se = serialErr(C, d, it, i); if (se) return se;
    if (bp && bp.batch && d.type === 'pinvoice' && !it.batch) return 'Item ' + (i + 1) + ' (' + bp.name + ') needs a batch number.';
  }
  var le = limitErr(C, d); if (le) return le;
  if ((d.type === 'creditnote' || d.type === 'preturn') && d.refId) {
    var src = docById(C, d.refId);
    if (src) {
      var prev = {};
      C.d.docs.forEach(function (x) { if (x.refId === src.id && x.type === d.type && !x.cancelled && x.id !== d.id) x.items.forEach(function (it) { prev[it.pid || it.name] = (prev[it.pid || it.name] || 0) + (+it.qty || 0); }); });
      var base = {};
      src.items.forEach(function (it) { base[it.pid || it.name] = (base[it.pid || it.name] || 0) + (+it.qty || 0); });
      var mine = {};
      d.items.forEach(function (it) { mine[it.pid || it.name] = (mine[it.pid || it.name] || 0) + (+it.qty || 0); });
      for (var k in mine) { if (mine[k] + (prev[k] || 0) > (base[k] || 0) + 1e-9) return 'Return quantity is more than what was billed on ' + src.no + '.'; }
    }
  }
  return '';
}
function commitDoc(C, d) {
  var isNew = !d.id;
  if (isNew) { d.id = uid(); d.no = nextNo(C, d.type, d.date); d.by = (user() || {}).name || ''; d.at = new Date().toISOString(); }
  calc(C, d);
  if (isNew) {
    d.status = DT[d.type].post ? 'Posted' : 'Open';
    C.d.docs.push(d);
    applyStock(C, d, 'post');
    if (d.refId) {
      var par = docById(C, d.refId);
      if (par && !DT[par.type].post) par.status = 'Converted';
      if (par && par.type === 'challan') par.status = 'Invoiced';
    }
    log('Created ' + DT[d.type].label, d.no);
  } else {
    var i = C.d.docs.findIndex(function (x) { return x.id === d.id; }), old = C.d.docs[i];
    var posted = DT[d.type].post && !old.cancelled;
    if (posted) applyStock(C, old, 'reverse');
    d.by = old.by; d.at = old.at; d.editedBy = (user() || {}).name || ''; d.editedAt = new Date().toISOString();
    C.d.docs[i] = d;
    if (posted) applyStock(C, d, 'post');
    log('Edited ' + DT[d.type].label, d.no);
  }
  return d;
}
function cancelDoc(C, id) {
  var d = docById(C, id); if (!d || d.cancelled) return 'Already cancelled.';
  if (d.irn) return 'This bill has an IRN. Cancel the IRN on the e-invoice portal (allowed within 24 hours), then open E-invoice on this bill, remove the IRN record and cancel it here.';
  if (C.d.payments.some(function (p) { return p.refId === id && !p.cancelled; })) return 'Cancel the payments recorded against ' + d.no + ' first.';
  if (C.d.docs.some(function (x) { return x.refId === id && !x.cancelled && DT[x.type].post; })) return 'Cancel the documents created from ' + d.no + ' first (returns, invoices).';
  if (DT[d.type].post && SE[d.type] && d.type === 'pinvoice') {
    var short = d.items.some(function (it) { var p = prodById(C, it.pid); return p && p.tracked && stockQty(C, p.id, d.wh || C.d.warehouses[0]) < (+it.qty || 0); });
    if (!short) short = d.items.some(function (it) { var p = prodById(C, it.pid); if (!p || !p.batch) return false; var r = batchStock(C, p.id, d.wh || C.d.warehouses[0]).filter(function (x) { return x.batch === (it.batch || '') && x.exp === (it.exp || ''); })[0]; return !r || r.qty < (+it.qty || 0) - 1e-9; });
    if (short) return 'Some of this stock is already sold. Use a Purchase Return instead.';
  }
  if (DT[d.type].post) applyStock(C, d, 'reverse');
  d.cancelled = true; d.cancelledAt = today();
  if (d.refId) { var par = docById(C, d.refId); if (par && (par.status === 'Converted' || par.status === 'Invoiced')) par.status = 'Open'; }
  log('Cancelled ' + DT[d.type].label, d.no);
  return '';
}
/* advance / on-account money: payments not tied to a bill can later be adjusted against bills (p.alloc = {docId: paise}) */
function allocUsed(C, p) { var s = 0; if (p.alloc) Object.keys(p.alloc).forEach(function (k) { var d = docById(C, k); if (d && !d.cancelled) s += p.alloc[k]; }); return s; }
function advFree(C, p) { return p.cancelled || p.refId ? 0 : Math.max(0, p.amount - allocUsed(C, p)); }
function advAvail(C, partyId, payType) {
  var free = sumBy(C.d.payments.filter(function (p) { return p.partyId === partyId && p.type === payType; }), function (p) { return advFree(C, p); });
  var pa = partyById(C, partyId); if (!pa) return 0;
  /* money that also covers old dues (opening balance, unlinked bills) is not an advance */
  return Math.max(0, Math.min(free, -partyBalance(C, pa)));
}
function useAdvance(C, d, amt) {
  var payType = d.type === 'pinvoice' ? 'payment' : 'receipt', want = Math.max(0, Math.min(amt, outstanding(C, d))), left = want;
  C.d.payments.filter(function (p) { return p.partyId === d.partyId && p.type === payType && advFree(C, p) > 0; }).sort(function (a, b) { return (a.date + a.no).localeCompare(b.date + b.no); }).forEach(function (p) {
    if (left <= 0) return; var take = Math.min(advFree(C, p), left); if (take <= 0) return;
    p.alloc = p.alloc || {}; p.alloc[d.id] = (p.alloc[d.id] || 0) + take; left -= take; CACHE_V++;
    log('Advance ' + money(take) + ' from ' + p.no + ' adjusted', d.no);
  });
  return want - left;
}
/* refunds are stored as negative receipts (cash back to a customer) or negative payments (supplier pays you back) */
function isRefund(p) { return p.amount < 0; }
function payLabel(p) { return isRefund(p) ? (p.type === 'receipt' ? 'Refund paid' : 'Refund received') : (p.type === 'receipt' ? 'Receipt' : 'Payment'); }
function unpaidDocs(C, partyId, payType) {
  var types = payType === 'payment' ? ['pinvoice'] : ['invoice', 'debitnote'];
  return C.d.docs.filter(function (d) { return d.partyId === partyId && types.indexOf(d.type) >= 0 && !d.cancelled && outstanding(C, d) > 0; }).sort(function (a, b) { return (a.date + a.no).localeCompare(b.date + b.no); });
}
/* spread an on-account payment over the oldest unpaid bills; anything left stays as advance */
function allocOldest(C, p) {
  var left = advFree(C, p);
  unpaidDocs(C, p.partyId, p.type).forEach(function (d) { if (left <= 0) return; var take = Math.min(left, outstanding(C, d)); if (take <= 0) return; p.alloc = p.alloc || {}; p.alloc[d.id] = (p.alloc[d.id] || 0) + take; left -= take; CACHE_V++; });
  return left;
}
function addPayment(C, o) {
  o.disc = Math.max(0, o.disc || 0);
  if (o.refund) { if (!(o.amount < 0)) return 'Enter the refund amount.'; o.disc = 0; o.refId = ''; }
  else if (!(o.amount > 0) && !(o.refId && o.disc > 0)) return 'Enter an amount above zero.';
  if (!o.partyId) return 'Select a party.';
  if (o.refId) {
    var inv = docById(C, o.refId);
    o.disc = Math.max(0, o.disc || 0);
    if (inv && o.amount + o.disc > outstanding(C, inv) + 0) return 'Amount plus discount is more than the ' + money(outstanding(C, inv)) + ' outstanding on ' + inv.no + '.';
  }
  o.disc = Math.max(0, o.disc || 0);
  var p = { id: uid(), no: nextNo(C, o.type, o.date), date: o.date, type: o.type, partyId: o.partyId, amount: o.amount, disc: o.disc || 0, mode: o.mode, refId: o.refId || '', note: o.note || '', by: (user() || {}).name || '', at: new Date().toISOString() };
  C.d.payments.push(p);
  log(payLabel(o) + ' ' + money(Math.abs(o.amount)) + (p.disc ? ' with discount ' + money(p.disc) : ''), p.no);
  return '';
}
function addProduct(C, o) {
  var p = { incl: !!o.incl, id: uid(), name: o.name, cat: o.cat || '', sku: o.sku || '', hsn: o.hsn || '', unit: o.unit || 'pcs', gst: +o.gst || 0, sale: o.sale || 0, cost: o.cost || 0, min: +o.min || 0, tracked: o.tracked !== false, barcode: o.barcode || '', batch: !!o.batch, serial: !!o.serial, wsale: o.wsale || 0, mrp: o.mrp || 0 };
  C.d.products.push(p);
  if (p.tracked && +o.openQty > 0) addMove(C, { date: today(), pid: p.id, wh: o.wh || C.d.warehouses[0], qty: +o.openQty, cost: p.cost, type: 'opening', note: 'Opening stock', batch: p.batch ? (o.openBatch || 'OPENING') : '', exp: p.batch ? (o.openExp || '') : '', serials: p.serial ? o.openSerials : undefined });
  return p;
}
function addParty(C, o) {
  var p = { id: uid(), type: o.type, name: o.name, gstin: o.gstin || '', state: o.state || C.state, phone: o.phone || '', email: o.email || '', address: o.address || '', city: o.city || '', pin: o.pin || '', opening: o.opening || 0, level: o.level || '', disc: +o.disc || 0 };
  C.d.parties.push(p); return p;
}

/* ---------- sample data ---------- */
function seedSample(C) {
  var T = today();
  var cust = {}, sup = {}, prod = {};
  [['Kaveri Hospital', gstinFix('33AAFCK4821P1Z'), 'Tamil Nadu'], ['Annai Textiles', gstinFix('33AABCA7733M1Z'), 'Tamil Nadu'], ['Sri Murugan Jewellers', gstinFix('33AAGFS9120K1Z'), 'Tamil Nadu'], ['Bengaluru Retail Hub', gstinFix('29AAECB5510C1Z'), 'Karnataka'], ['Walk-in Customer', '', 'Tamil Nadu']].forEach(function (a) {
    cust[a[0]] = addParty(C, { type: 'customer', name: a[0], gstin: a[1], state: a[2], phone: '90000 0' + String(1000 + Object.keys(cust).length * 111) });
  });
  [['Chennai ACP Traders', gstinFix('33AAHCC3300D1Z'), 'Tamil Nadu'], ['Hosur LED Components', gstinFix('33AADCH6612E1Z'), 'Tamil Nadu'], ['Pune Vinyl Supply', gstinFix('27AAFCP2208F1Z'), 'Maharashtra']].forEach(function (a) {
    sup[a[0]] = addParty(C, { type: 'supplier', name: a[0], gstin: a[1], state: a[2] });
  });
  [['ACP Sheet 3mm 8x4 ft', '3921', 'sheet', 3400, 2650, 10, true], ['LED Module 12V', '8541', 'pcs', 85, 52, 100, true], ['Flex Roll 5 ft', '3920', 'roll', 4200, 3100, 4, true], ['Vinyl Black 24 in', '3919', 'roll', 2600, 1900, 5, true], ['Installation charges', '9987', 'job', 3000, 0, 0, false]].forEach(function (a) {
    prod[a[0]] = addProduct(C, { name: a[0], hsn: a[1], unit: a[2], sale: a[3] * 100, cost: a[4] * 100, min: a[5], tracked: a[6], gst: 18 });
  });
  function items(list, purchase) {
    return list.map(function (x) { var p = prod[x[0]]; return { pid: p.id, name: p.name, hsn: p.hsn, unit: p.unit, qty: x[1], rate: purchase ? p.cost : p.sale, disc: 0, gst: p.gst }; });
  }
  function mk(type, party, ago, list, extra) {
    var pur = DT[type].side === 'p'; var pt = pur ? sup[party] : cust[party];
    var d = Object.assign({ type: type, partyId: pt.id, date: addDays(T, -ago), due: addDays(T, -ago + 15), wh: 'Main', items: items(list, pur), notes: '' }, extra || {});
    if (type !== 'invoice' && type !== 'pinvoice') delete d.due;
    return commitDoc(C, d);
  }
  C.d.opening = { cash: 5000000, bank: 20000000 };
  var pi1 = mk('pinvoice', 'Chennai ACP Traders', 40, [['ACP Sheet 3mm 8x4 ft', 40]]);
  var pi2 = mk('pinvoice', 'Hosur LED Components', 38, [['LED Module 12V', 400]]);
  mk('pinvoice', 'Pune Vinyl Supply', 35, [['Flex Roll 5 ft', 10], ['Vinyl Black 24 in', 12]]);
  addPayment(C, { type: 'payment', date: addDays(T, -30), partyId: pi1.partyId, amount: pi1.total, mode: 'Bank', refId: pi1.id, note: 'Full payment' });
  addPayment(C, { type: 'payment', date: addDays(T, -20), partyId: pi2.partyId, amount: Math.round(pi2.total / 2), mode: 'UPI', refId: pi2.id, note: 'Part payment' });
  mk('invoice', 'Annai Textiles', 30, [['ACP Sheet 3mm 8x4 ft', 8]]);
  var i2 = mk('invoice', 'Kaveri Hospital', 22, [['ACP Sheet 3mm 8x4 ft', 20], ['Flex Roll 5 ft', 7], ['Installation charges', 1]]);
  addPayment(C, { type: 'receipt', date: addDays(T, -18), partyId: i2.partyId, amount: i2.total, mode: 'UPI', refId: i2.id, note: 'Paid in full' });
  var i3 = mk('invoice', 'Sri Murugan Jewellers', 12, [['Vinyl Black 24 in', 9]]);
  addPayment(C, { type: 'receipt', date: addDays(T, -8), partyId: i3.partyId, amount: 1500000, mode: 'Cash', refId: i3.id, note: 'Advance' });
  mk('invoice', 'Bengaluru Retail Hub', 5, [['LED Module 12V', 320]]);
  var i5 = mk('invoice', 'Walk-in Customer', 0, [['Installation charges', 1]], { due: T });
  addPayment(C, { type: 'receipt', date: T, partyId: i5.partyId, amount: i5.total, mode: 'Cash', refId: i5.id });
  mk('enquiry', 'Annai Textiles', 3, [], { req: 'Shop front LED board, 12 x 3 ft, with installation.', source: 'Phone' });
  mk('quotation', 'Kaveri Hospital', 1, [['ACP Sheet 3mm 8x4 ft', 6], ['Installation charges', 1]], { valid: addDays(T, 13) });
  mk('po', 'Pune Vinyl Supply', 2, [['Flex Roll 5 ft', 6], ['Vinyl Black 24 in', 6]], { delivery: addDays(T, 7) });
  C.d.expenses.push({ id: uid(), date: addDays(T, -25), kind: 'expense', cat: 'Rent', amount: 1500000, mode: 'Bank', note: 'Workshop rent' });
  C.d.expenses.push({ id: uid(), date: addDays(T, -10), kind: 'expense', cat: 'Electricity', amount: 420000, mode: 'Cash', note: '' });
  C.d.expenses.push({ id: uid(), date: addDays(T, -6), kind: 'income', cat: 'Scrap sale', amount: 250000, mode: 'Cash', note: '' });
}
function seedDB() { return { v: 2, users: [], companies: [], session: null }; }
function seedDemo() {
  var u = DB.users.find(function (x) { return x.email === 'demo@billdna.in'; });
  if (!u) { u = { id: uid(), name: 'Demo User', email: 'demo@billdna.in' }; setPass(u, rnd(14)); DB.users.push(u); }
  var C = DB.companies.find(function (c) { return c.demo && c.members.some(function (m) { return m.userId === u.id; }); });
  if (!C) {
    C = newCompany('Sample Company (demo)', { mode: 'full', gstin: gstinFix('33AAAPS1234Q1Z'), state: 'Tamil Nadu', address: 'Thanjavur, Tamil Nadu', phone: '90000 00000', bizType: 'other' });
    C.demo = true;
    C.bank = { name: 'Sample Bank', acc: '000012345678', ifsc: 'SAMP0000001', upi: 'sample@upi' };
    C.members = [{ userId: u.id, role: 'owner' }];
    DB.companies.push(C); seedSample(C);
  }
  DB.session = { userId: u.id, companyId: C.id };
}

/* ---------- ui helpers ---------- */
function chip(t, c) { return '<span class="chip ' + (c || '') + '">' + esc(t) + '</span>'; }
function statusChip(s) { var c = /^(Paid|Posted|Accepted|Received|Invoiced)/.test(s) ? 'ok' : /^(Overdue|Lost|Cancelled)/.test(s) ? 'warn' : /^(Unpaid|Partial)/.test(s) ? 'amb' : ''; return chip(s, c); }
function dattr(o) { return Object.keys(o || {}).map(function (k) { return ' data-' + k + '="' + esc(o[k]) + '"'; }).join(''); }
function btn(act, label, data, cls) { return '<button type="button" class="btn ' + (cls || '') + '" data-act="' + act + '"' + dattr(data) + '>' + esc(label) + '</button>'; }
function field(label, inner, cls) { return '<label class="fld ' + (cls || '') + '"><span>' + esc(label) + '</span>' + inner + '</label>'; }
function opts(list, sel, valFn, labFn) { return list.map(function (x) { var v = valFn ? valFn(x) : x, l = labFn ? labFn(x) : x; return '<option value="' + esc(v) + '"' + (String(v) === String(sel) ? ' selected' : '') + '>' + esc(l) + '</option>'; }).join(''); }
function tabsH(list, active, act) { return '<div class="tabs" role="tablist">' + list.map(function (t) { return '<button type="button" class="tab' + (t[0] === active ? ' on' : '') + '" data-act="' + act + '" data-t="' + t[0] + '">' + esc(t[1]) + '</button>'; }).join('') + '</div>'; }
function table(head, rows, empty, foot, ids) {
  if (!rows.length) return '<div class="empty">' + esc(empty || 'Nothing here yet.') + '</div>';
  return '<div class="tw"><table><thead><tr>' + head.map(function (h) { return '<th class="' + (h[1] || '') + '">' + esc(h[0]) + '</th>'; }).join('') + '</tr></thead><tbody>' +
    rows.map(function (r, ri) { var a = ids && ids[ri]; return '<tr' + (a ? ' class="clk" tabindex="0" data-act="' + a[0] + '" data-id="' + esc(a[1]) + '" title="Click to open"' : '') + '>' + r.map(function (c, i) { return '<td class="' + (head[i][1] || '') + '">' + c + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody>' + (foot ? '<tfoot><tr>' + foot.map(function (c, i) { return '<td class="' + (head[i][1] || '') + '">' + c + '</td>'; }).join('') + '</tr></tfoot>' : '') + '</table></div>';
}
function partyName(C, id) { var p = partyById(C, id); return p ? p.name : '-'; }
function match(q, arr) { if (!q) return true; q = q.toLowerCase(); return arr.join(' ').toLowerCase().indexOf(q) >= 0; }
function searchBar(extra) { return '<div class="bar"><input id="q" class="inp" style="max-width:280px" placeholder="Search" value="' + esc(S.q) + '" aria-label="Search">' + (extra || '') + '</div>'; }

/* ---------- document editor ---------- */
function blankItem() { return { pid: '', name: '', hsn: '', unit: '', qty: 1, rate: 0, disc: 0, gst: 18 }; }
function newDraft(type, over) {
  var C = cur(), t = DT[type];
  var pf = pfOf(C), d = { type: type, partyId: '', date: today(), items: t.items ? [blankItem()] : [], notes: t.side === 's' && t.items ? pf.terms : '', wh: C.d.warehouses[0] };
  if (type === 'invoice' || type === 'pinvoice') d.due = addDays(today(), pf.dueDays);
  if (type === 'quotation' || type === 'estimate') d.valid = addDays(today(), pf.validDays);
  if (type === 'salesorder' || type === 'po') d.delivery = addDays(today(), 7);
  return Object.assign(d, over || {});
}
function expF(e) { return e ? e.slice(5, 7) + '/' + e.slice(0, 4) : ''; }
function batchTag(it) {
  var a = it.alloc && it.alloc.length ? it.alloc.map(function (x) { return { b: x.b, e: x.e }; }) : (it.batch ? [{ b: it.batch, e: it.exp || '' }] : []);
  var bt = a.filter(function (x) { return x.b; }).map(function (x) { return 'Batch ' + x.b + (x.e ? ' · Exp ' + expF(x.e) : ''); }).join(', ');
  return bt + (it.serials && it.serials.length ? (bt ? ' · ' : '') + 'S/N ' + it.serials.join(', ') : '');
}
function batchCell(C, d, it, i) {
  var p = it.pid ? prodById(C, it.pid) : null, sg = SE[d.type]; if (!p || !p.batch || !sg) return '';
  if (sg > 0) return '<div style="display:flex;gap:4px;margin-top:4px"><input class="inp" data-f="batch" data-i="' + i + '" value="' + esc(it.batch || '') + '" placeholder="Batch no" aria-label="Batch number"><input class="inp" type="date" data-f="exp" data-i="' + i + '" value="' + esc(it.exp || '') + '" title="Expiry date" aria-label="Expiry date"></div>';
  var rows = usableRows(C, p, d.wh || C.d.warehouses[0], d.date || today());
  return '<select class="inp" style="margin-top:4px" data-f="batch" data-i="' + i + '" aria-label="Batch"><option value="">Auto: earliest expiry first</option>' + rows.map(function (r) { return '<option value="' + esc(r.batch) + '"' + (it.batch === r.batch ? ' selected' : '') + '>' + esc(r.batch || 'No batch') + (r.exp ? ' · exp ' + expF(r.exp) : '') + ' · ' + qtyF(r.qty) + ' left</option>'; }).join('') + '</select>';
}
function itemRow(C, d, it, i) {
  var pur = DT[d.type].side === 'p';
  var plist = C.d.products;
  return '<tr data-row="' + i + '"><td style="min-width:200px"><select class="inp" data-f="pid" data-i="' + i + '" aria-label="Product"><option value="">Custom item</option>' + opts(plist, it.pid, function (p) { return p.id; }, function (p) { return p.name; }) + '</select><input class="inp" style="margin-top:4px" data-f="name" data-i="' + i + '" value="' + esc(it.name) + '" placeholder="Type item name" aria-label="Item name" list="plist" autocomplete="off">' + batchCell(C, d, it, i) + serialCell(C, d, it, i) + '</td>' +
    '<td style="min-width:86px"><input class="inp" data-f="hsn" data-i="' + i + '" value="' + esc(it.hsn) + '" aria-label="HSN or SAC"></td>' +
    '<td style="min-width:80px"><input class="inp num" type="number" min="0" step="any" data-f="qty" data-i="' + i + '" value="' + esc(it.qty) + '" aria-label="Quantity"></td>' +
    '<td style="min-width:104px"><input class="inp num" type="number" min="0" step="any" data-f="rate" data-i="' + i + '" value="' + esc(rs(it.rate)) + '" aria-label="Rate in rupees"></td>' +
    '<td style="min-width:70px"><input class="inp num" type="number" min="0" max="100" step="any" data-f="disc" data-i="' + i + '" value="' + esc(it.disc || 0) + '" aria-label="Discount percent"></td>' +
    '<td style="min-width:74px"><input class="inp num" type="number" min="0" max="100" step="any" data-f="gst" data-i="' + i + '" value="' + esc(it.gst) + '" aria-label="GST percent"' + (!taxOn(C, DT[d.type]) ? ' disabled' : '') + '></td>' +
    '<td class="r" id="amt-' + i + '" style="white-space:nowrap">' + money((it.taxable || 0)) + '</td>' +
    '<td><button type="button" class="btn sm line" data-act="rmRow" data-i="' + i + '" aria-label="Remove item">Remove</button></td></tr>';
}
function totalsH(C, d) {
  var t = DT[d.type];
  if (!t.items) return '';
  var h = '<div class="tot">' + (d.discAmt > 0 ? '<div><span>Bill discount' + (d.bdt === 'amt' ? '' : ' (' + esc(d.bdv) + '%)') + ' (already deducted)</span><span class="num">-' + money(d.discAmt) + '</span></div>' : '') + '<div><span>Taxable value</span><span class="num">' + money(d.sub) + '</span></div>';
  if (taxOn(C, t)) {
    if (d.inter) h += '<div><span>IGST</span><span class="num">' + money(d.igst) + '</span></div>';
    else h += '<div><span>CGST</span><span class="num">' + money(d.cgst) + '</span></div><div><span>SGST</span><span class="num">' + money(d.sgst) + '</span></div>';
  }
  if (t.tax) h += '<div><span>Round off</span><span class="num">' + money(d.round) + '</span></div>';
  h += '<div class="g"><span>' + esc(t.label) + ' total</span><span class="num">' + money(d.total) + '</span></div><div class="note">' + esc(amtWords(d.total)) + '</div></div>';
  return h;
}
function supplyNote(C, d) {
  var t = DT[d.type]; if (!t.tax) return t.items ? 'Approximate amounts. No tax is added on this document.' : '';
  if (C.scheme !== 'regular' && t.side === 'p') return 'Tax charged by the supplier is added to your cost. No input credit is claimed under this scheme.';
  if (C.scheme === 'composition') return 'Composition scheme: this is a Bill of Supply. No tax is charged.';
  if (C.scheme === 'notax') return 'No tax company: this is a cash bill without GST.';
  return d.inter ? 'Other state supply: IGST applies.' : 'Same state supply: CGST + SGST apply.';
}
function editorH() {
  var C = cur(), d = S.draft, t = DT[d.type], pur = t.side === 'p';
  calc(C, d);
  var parties = C.d.parties.filter(function (p) { return p.type === (pur ? 'supplier' : 'customer'); });
  var h = '<div class="card"><div class="bar"><h2>' + (d.id ? 'Edit ' : 'New ') + esc(t.label) + (d.no ? ' ' + esc(d.no) : '') + '</h2>' + btn('cancelDraft', 'Close', {}, 'line') + '</div>';
  h += '<div class="fg">';
  h += field(pur ? 'Supplier' : 'Customer', '<select data-f="partyId"><option value="">Select</option>' + opts(parties, d.partyId, function (p) { return p.id; }, function (p) { return p.name; }) + '</select>');
  h += field('Date', '<input type="date" data-f="date" value="' + esc(d.date) + '">');
  if (d.due !== undefined) h += field('Due date', '<input type="date" data-f="due" value="' + esc(d.due) + '">');
  if (d.valid !== undefined) h += field('Valid until', '<input type="date" data-f="valid" value="' + esc(d.valid) + '">');
  if (d.delivery !== undefined) h += field('Delivery date', '<input type="date" data-f="delivery" value="' + esc(d.delivery) + '">');
  if (d.type === 'pinvoice' || d.type === 'preturn') h += field("Supplier's bill no. (for GST matching)", '<input data-f="sno" value="' + esc(d.sno || '') + '" maxlength="40" placeholder="As printed on supplier bill">');
  if (SE[d.type] && C.mode !== 'simple') h += field('Warehouse', '<select data-f="wh">' + opts(C.d.warehouses, d.wh) + '</select>');
  h += '</div><div>' + btn('newParty', pur ? 'New supplier' : 'New customer', { side: pur ? 'supplier' : 'customer' }, 'sm line') + '</div>';
  if (!t.items) {
    h += '<div class="fg"><label class="fld wide"><span>What does the customer need?</span><textarea data-f="req">' + esc(d.req || '') + '</textarea></label>' + field('Source', '<select data-f="source">' + opts(['Phone', 'Walk-in', 'WhatsApp', 'Email', 'Referral'], d.source || 'Phone') + '</select>') + '</div>';
  } else {
    h += '<datalist id="plist">' + C.d.products.map(function (p) { return '<option value="' + esc(p.name) + '">'; }).join('') + '</datalist>';
    h += '<div class="tw"><table style="min-width:760px"><thead><tr><th>Item</th><th>HSN/SAC</th><th class="r">Qty</th><th class="r">Rate</th><th class="r">Disc %</th><th class="r">GST %</th><th class="r">Taxable</th><th></th></tr></thead><tbody id="rows">' +
      d.items.map(function (it, i) { return itemRow(C, d, it, i); }).join('') + '</tbody></table></div>';
    h += '<div class="bar"><div class="row">' + (C.d.products.some(function (x) { return x.barcode; }) ? scanBox('doc') : '') + btn('addRow', 'Add item', {}, 'sm') + (canWrite('inventory') ? btn('edNewItem', 'New item', {}, 'sm line') : '') + '<span class="note" id="supply">' + esc(supplyNote(C, d)) + '</span></div></div>';
    h += '<div class="row" style="align-items:flex-end"><label class="fld" style="max-width:190px"><span>Discount on whole bill</span><select data-f="bdt"><option value="pct"' + (d.bdt === 'amt' ? '' : ' selected') + '>Percent (%)</option><option value="amt"' + (d.bdt === 'amt' ? ' selected' : '') + '>Cash amount (Rs)</option></select></label><label class="fld" style="max-width:150px"><span>Value</span><input class="num" type="number" min="0" step="any" data-f="bdv" value="' + esc(d.bdv || '') + '" placeholder="0"></label><span class="note">Taken off before GST. Leave empty for none.</span></div>';
    h += '<div id="totbox">' + totalsH(C, d) + '</div>';
    if (!d.id && (d.type === 'invoice' || d.type === 'pinvoice')) h += payBoxH(C, d);
    if (!d.id && (d.type === 'creditnote' || d.type === 'preturn')) h += refundBoxH(C, d);
  }
  if (t.side === 's' && t.items) h += shipH(d);
  h += '<label class="fld"><span>Notes and terms</span><textarea data-f="notes">' + esc(d.notes || '') + '</textarea></label>';
  if (d.shortage && d.shortage.length) h += '<div class="hint">Shortage or damage recorded: ' + esc(d.shortage.map(function (s) { return s.name + ' (short ' + s.short + ', damaged ' + s.dmg + ')'; }).join('; ')) + '</div>';
  h += '<div class="row">' + btn('saveDoc', d.id ? 'Save changes' : 'Save ' + t.label, {}, 'pri') + btn('cancelDraft', 'Cancel', {}, 'line') + '</div></div>';
  return h;
}
function refreshTotals() {
  var C = cur(), d = S.draft; calc(C, d);
  var tb = $('#totbox'); if (tb) tb.innerHTML = totalsH(C, d);
  var ps = $('#paysum'); if (ps) ps.innerHTML = paySumH(C, d);
  var sp = $('#supply'); if (sp) sp.textContent = supplyNote(C, d);
  d.items.forEach(function (it, i) { var a = $('#amt-' + i); if (a) a.textContent = money(it.taxable || 0); });
}
function applyProduct(C, d, i, pid) {
  var it = d.items[i], p = prodById(C, pid); it.pid = pid || '';
  it.batch = ''; it.exp = ''; delete it.alloc;
  if (p) { it.name = p.name; it.hsn = p.hsn; it.unit = p.unit; it.gst = p.gst; var sd = DT[d.type].side; it.rate = rateFor(C, p, d.partyId, sd); it.disc = discFor(C, d.partyId, sd); it.mrp = p.mrp || 0; }
}

/* ---------- document preview ---------- */
function docPreview(d) {
  var C = cur(), t = DT[d.type], p = partyById(C, d.partyId) || {};
  var status = statusOf(C, d);
  var h = '<div class="mh"><h2>' + esc(t.label) + ' ' + esc(d.no) + '</h2>' + btn('closeModal', 'Close', {}, 'sm line') + '</div><div class="pre"' + (COPYDOCS.indexOf(d.type) >= 0 ? ' data-copies="1"' : '') + '>';
  h += '<div class="hd"><div><b style="font-size:17px">' + esc(C.name) + '</b><div style="font-size:12px;opacity:.8">' + esc(C.address) + (C.gstin ? ' · GSTIN ' + esc(C.gstin) : '') + '</div></div><div style="text-align:right"><b>' + esc(t.side === 's' && C.scheme === 'composition' && t.tax ? 'Bill of Supply' : t.side === 's' && C.scheme === 'notax' && t.tax ? 'Cash Bill' : t.label) + '</b><div style="font-size:12px;opacity:.8">' + esc(d.no) + ' · ' + dmy(d.date) + '</div></div></div>';
  h += '<div class="fg"><div><div class="note">' + (t.side === 'p' ? 'Supplier' : 'Customer') + '</div><b>' + esc(p.name || '-') + '</b><div class="note">' + esc(p.address || '') + (p.gstin ? ' GSTIN ' + esc(p.gstin) : '') + (p.state ? ' · ' + esc(p.state) : '') + '</div></div>' +
    '<div><div class="note">Status</div>' + statusChip(status) + (d.due ? '<div class="note">Due ' + dmy(d.due) + '</div>' : '') + (d.valid ? '<div class="note">Valid until ' + dmy(d.valid) + '</div>' : '') + (d.delivery ? '<div class="note">Delivery ' + dmy(d.delivery) + '</div>' : '') + '</div></div>';
  shipView(d).forEach(function (ln) { h += '<div class="note">' + esc(ln) + '</div>'; });
  if (!t.items) h += '<div class="hint">' + esc(d.req || '') + (d.source ? ' (Source: ' + esc(d.source) + ')' : '') + '</div>';
  else {
    h += table([['Item'], ['HSN/SAC'], ['Qty', 'r'], ['Rate', 'r'], ['Disc %', 'r'], ['GST %', 'r'], ['Taxable', 'r']], d.items.map(function (it) {
      return [esc(it.name) + mrpTag(it) + (batchTag(it) ? '<div class="note">' + esc(batchTag(it)) + '</div>' : ''), esc(it.hsn), qtyF(it.qty) + ' ' + esc(it.unit || ''), money(it.rate), esc(it.disc || 0), taxOn(C, t) ? esc(it.gst) : '-', money(it.taxable)];
    }));
    h += totalsH(C, d) + upiBlockH(C, d);
  }
  if (d.notes) h += '<div class="note">' + esc(d.notes) + '</div>';
  if (pfOf(C).footer) h += '<div class="note" style="text-align:center">' + esc(pfOf(C).footer) + '</div>';
  if (d.irn) h += '<div class="note"><b>IRN</b> ' + esc(d.irn) + (d.ack ? ' · Ack ' + esc(d.ack) : '') + (d.ackDt ? ' · ' + esc(dmy(d.ackDt)) : '') + '</div>';
  if (d.ewb && d.ewb.no) h += '<div class="note"><b>E-way bill</b> ' + esc(d.ewb.no) + (d.ewb.till ? ' · valid till ' + esc(dmy(d.ewb.till)) : '') + '</div>';
  if (d.shortage && d.shortage.length) h += '<div class="hint">Shortage or damage: ' + esc(d.shortage.map(function (s) { return s.name + ' short ' + s.short + ', damaged ' + s.dmg; }).join('; ')) + '</div>';
  if (d.type === 'invoice' && C.bank && C.bank.acc) h += '<div class="note">Bank: ' + esc(C.bank.name) + ' · A/c ' + esc(C.bank.acc) + ' · IFSC ' + esc(C.bank.ifsc) + (C.bank.upi ? ' · UPI ' + esc(C.bank.upi) : '') + '</div>';
  var links = C.d.docs.filter(function (x) { return x.refId === d.id; });
  if (d.refId) { var par = docById(C, d.refId); if (par) links.unshift(par); }
  if (links.length) h += '<div class="note">Linked: ' + links.map(function (x) { return esc(DT[x.type].label + ' ' + x.no); }).join(', ') + '</div>';
  h += '<div class="note">' + (d.by ? 'Created by <b>' + esc(d.by) + '</b>' + (d.at ? ' on ' + tmStr(d.at) : '') : '') + (d.editedBy ? ' · Edited by <b>' + esc(d.editedBy) + '</b>' + (d.editedAt ? ' on ' + tmStr(d.editedAt) : '') : '') + (d.cancelled ? ' · Cancelled ' + dmy(d.cancelledAt) : '') + '</div>';
  if (!d.cancelled) {
    var mod = t.side === 's' ? 'sales' : 'purchases', ac = '';
    if (d.type === 'invoice' && outstanding(C, d) > 0 && canWrite('sales', 'receipt')) ac += btn('newPay', 'Receive payment (' + money(outstanding(C, d)) + ' due)', { type: 'receipt', ref: d.id }, 'pri');
    if (d.type === 'pinvoice' && outstanding(C, d) > 0 && canWrite('purchases', 'payment')) ac += btn('newPay', 'Pay supplier (' + money(outstanding(C, d)) + ' due)', { type: 'payment', ref: d.id }, 'pri');
    if (canWrite(mod, d.type) && ((!t.post && d.status === 'Open') || (t.post && t.items && canAdmin(mod)))) ac += btn('editDoc', 'Edit', { id: d.id }, 'line');
    if (canWrite(mod, d.type) && (!t.post || canAdmin(mod))) ac += btn('cancelDoc', 'Cancel', { id: d.id }, 'warn');
    if (C.scheme === 'regular' && (d.type === 'invoice' || d.type === 'creditnote' || d.type === 'debitnote') && canWrite(mod, d.type)) ac += btn('govDoc', 'E-invoice / E-way bill', { id: d.id }, 'line');
    if (ac) h += '<div class="row">' + ac + '</div>';
    h += actionsH(d);
  }
  if (t.items && !d.cancelled) h += shareH(d);
  return h + '</div>';
}

/* ---------- views: dashboard, sales, purchases ---------- */
function top(title, sub, right) { return '<div class="top"><div><h1>' + esc(title) + '</h1>' + (sub ? '<div class="sub">' + sub + '</div>' : '') + '</div><div class="row">' + (right || '') + expTopBtn() + '</div></div>'; }
function kpi(l, v, n, warn) { return '<div class="card kpi"><div class="l">' + esc(l) + '</div><div class="v">' + v + '</div><div class="n' + (warn ? ' w' : '') + '">' + esc(n) + '</div></div>'; }
function sumBy(arr, fn) { return arr.reduce(function (s, x) { return s + fn(x); }, 0); }

function hmGreet() { var h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; }
function hmSpark(C, days) {
  var t = today(), vals = [], labs = [], mx = 1, i;
  for (i = days - 1; i >= 0; i--) {
    var dt = addDays(t, -i), v = 0;
    C.d.docs.forEach(function (x) { if (x.date === dt && !x.cancelled) { if (x.type === 'invoice' || x.type === 'debitnote') v += x.total; else if (x.type === 'creditnote') v -= x.total; } });
    vals.push(Math.max(0, v)); labs.push(dt); if (v > mx) mx = v;
  }
  var W = 560, H = 120, gw = W / days, bw = Math.max(6, gw - 8), g = '';
  vals.forEach(function (v, k) {
    var h = Math.round((H - 8) * v / mx), x = k * gw + (gw - bw) / 2, last = k === days - 1;
    g += '<rect x="' + x.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + Math.max(h, 3) + '" y="' + (H - Math.max(h, 3)) + '" rx="3" fill="' + (last ? 'var(--hm-acc)' : 'var(--hm-bar)') + '"><title>' + esc(dmy(labs[k]) + ': ' + money(v)) + '</title></rect>';
  });
  return '<svg class="hm-spark" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" role="img" aria-label="Sales, last ' + days + ' days">' + g + '</svg>';
}
function vDashboard() {
  var C = cur(), d = C.d, t = today(), m = t.slice(0, 7), u = user();
  var inv = d.docs.filter(function (x) { return x.type === 'invoice' && !x.cancelled; });
  var mon = inv.filter(function (x) { return x.date.slice(0, 7) === m; });
  var prevM = (function () { var y = +t.slice(0, 4), mo = +t.slice(5, 7) - 1; if (!mo) { mo = 12; y--; } return y + '-' + String(mo).padStart(2, '0'); })();
  var monAmt = sumBy(mon, function (x) { return x.total; }), prevAmt = sumBy(inv.filter(function (x) { return x.date.slice(0, 7) === prevM; }), function (x) { return x.total; });
  var recv = sumBy(d.parties.filter(function (p) { return p.type === 'customer'; }), function (p) { return Math.max(0, partyBalance(C, p)); });
  var pay = sumBy(d.parties.filter(function (p) { return p.type === 'supplier'; }), function (p) { return Math.max(0, partyBalance(C, p)); });
  var over = inv.filter(function (x) { return x.due < t && outstanding(C, x) > 0; });
  var overAmt = sumBy(over, function (x) { return outstanding(C, x); });
  var stockVal = sumBy(d.products, function (p) { return p.tracked ? Math.max(0, stockQty(C, p.id)) * p.cost : 0; });
  var low = lowItems(C), cb = cashBank(C);
  var trend = prevAmt ? Math.round(100 * (monAmt - prevAmt) / prevAmt) : null;
  var first = String((u && u.name) || '').split(' ')[0] || 'there';
  var h = '<div class="hm-hero"><div class="hm-hl' + '">' + clockH() + '<div class="hm-hi">' + hmGreet() + ', ' + esc(first) + '</div><h1>' + esc(C.name) + '</h1><div class="hm-sub">FY ' + fyLabel(t) + ' · ' + esc(role()) + '</div>' +
    '<div class="hm-big"><span class="hm-bl">This month</span><span class="hm-bv">' + money(monAmt) + '</span><span class="hm-bn">' + mon.length + ' invoice(s)' + (trend === null ? '' : ' · <b class="' + (trend >= 0 ? 'hm-up' : 'hm-dn') + '">' + (trend >= 0 ? '▲ ' : '▼ ') + Math.abs(trend) + '%</b> vs last month') + '</span></div>' +
    '<div class="hm-btns">' + (canWrite('quick') ? btn('nav', '+ New Bill', { v: 'quick' }, 'hm-b1') : '') + (canWrite('sales', 'receipt') ? btn('newPay', 'Money received', { type: 'receipt' }, 'hm-b2') : '') + (canWrite('accounting') ? btn('goExp', 'Add expense', {}, 'hm-b2') : '') + '</div></div>' +
    '<div class="hm-hr"><div class="hm-cl">Sales, last 14 days</div>' + hmSpark(C, 14) + '<div class="hm-ax"><span>' + dmy(addDays(t, -13)) + '</span><span>Today</span></div></div></div>';
  h += homeActions(C, true) + hmSearchH(C);
  h += '<div class="hm-kpis">' +
    '<div class="hm-k k1"><div class="l">Receivables</div><div class="v">' + money(recv) + '</div><div class="n' + (over.length ? ' w' : '') + '">' + (over.length ? money(overAmt) + ' overdue' : 'Nothing overdue') + '</div></div>' +
    '<div class="hm-k k2"><div class="l">Payables</div><div class="v">' + money(pay) + '</div><div class="n">Owed to suppliers</div></div>' +
    '<div class="hm-k k3"><div class="l">Cash and bank</div><div class="v">' + money(cb.cash + cb.bank) + '</div><div class="n">Cash ' + money(cb.cash) + ' · Bank ' + money(cb.bank) + '</div></div>' +
    (stockOn(C) ? '<div class="hm-k k4"><div class="l">Stock value</div><div class="v">' + money(stockVal) + '</div><div class="n' + (low.length ? ' w' : '') + '">' + low.length + ' item(s) below minimum</div></div></div>' : '<div class="hm-k k4"><div class="l">Unpaid invoices</div><div class="v">' + inv.filter(function (x) { return outstanding(C, x) > 0; }).length + '</div><div class="n">' + (over.length ? over.length + ' overdue' : 'None overdue') + '</div></div></div>');
  var stages = ['enquiry', 'estimate', 'quotation', 'proforma', 'salesorder', 'challan'];
  var cnt = stages.map(function (s) { var n = d.docs.filter(function (x) { return x.type === s && !x.cancelled && (x.status === 'Open' || x.status === 'Accepted' || x.status === 'Posted'); }).length; return [DT[s].label, n, s, 'pipe']; });
  cnt.push(['Unpaid invoices', inv.filter(function (x) { return outstanding(C, x) > 0; }).length, 'invoice', 'unpaid']);
  h += '<div class="card"><h2>Sales pipeline</h2><div class="hm-pipe">' + cnt.map(function (c) { return '<div class="hm-st clk' + (c[1] ? ' on' : '') + '" tabindex="0" data-act="goDoc" data-t="' + c[2] + '" data-f="' + c[3] + '" title="Click to open"><b>' + c[1] + '</b><span>' + esc(c[0]) + '</span></div>'; }).join('') + '</div></div>';
  h += dayBookH(C);
  var recentAll = d.docs.slice().sort(function (a, b) { return (b.date + b.no).localeCompare(a.date + a.no); }), recent = recentAll.slice(0, S.hmMore && S.hmMore.r ? 25 : 5);
  h += '<div class="cols"><div class="card" style="flex:2 1 460px"><h2>Recent documents</h2>' + table([['Document'], ['Date'], ['Party'], ['Amount', 'r'], ['Status']], recent.map(function (x) {
    return ['<b>' + esc(x.no) + '</b><div class="note">' + esc(DT[x.type].label) + '</div>', dmy(x.date), esc(partyName(C, x.partyId)), DT[x.type].items ? money(x.total) : '-', statusChip(statusOf(C, x))];
  }), 'No documents yet.', null, recent.map(function (x) { return ['view', x.id]; })) + hmMoreBtn('r', recentAll.length, 5, 25) + '</div>' +
    '<div style="flex:1 1 340px;display:flex;flex-direction:column;gap:16px">' + (stockOn(C) && pfOf(C).lowHome !== false ? '<div class="card"><div class="bar"><h2>Low stock</h2>' + (low.length && canWrite('purchases', 'po') ? btn('poFromLow', 'Create purchase order', {}, 'sm') : '') + '</div>' +
    table([['Item'], ['In stock', 'r'], ['Minimum', 'r']], low.map(function (p) { return [esc(p.name), '<span class="warn-t">' + qtyF(stockQty(C, p.id)) + '</span>', qtyF(p.min)]; }), 'All items are above minimum.') + '</div>' : '') +
    '<div class="card"><h2>Overdue invoices</h2>' + table([['Invoice'], ['Customer'], ['Balance', 'r']], over.slice(0, S.hmMore && S.hmMore.o ? 25 : 5).map(function (x) { return ['<b>' + esc(x.no) + '</b><div class="note warn-t">Due ' + dmy(x.due) + '</div>', esc(partyName(C, x.partyId)), money(outstanding(C, x))]; }), 'No overdue invoices.', null, over.slice(0, S.hmMore && S.hmMore.o ? 25 : 5).map(function (x) { return ['view', x.id]; })) + hmMoreBtn('o', over.length, 5, 25) + '</div></div></div>';
  return h;
}

function actionsH(d) {
  var C = cur(), t = DT[d.type], mod = t.side === 's' ? 'sales' : 'purchases', w = canWrite(mod, d.type), h = '';
  if (w && !d.cancelled) {
    var st = d.status, open = !t.post && (st === 'Open' || st === 'Accepted');
    if (d.type === 'po' && st === 'Open') h += btn('receive', 'Receive goods', { id: d.id }, 'sm');
    if (open && NEXT[d.type]) NEXT[d.type].forEach(function (n) { h += btn('convert', 'To ' + DT[n].label, { id: d.id, to: n }, 'sm'); });
    if (t.post && NEXT[d.type] && st !== 'Invoiced') NEXT[d.type].forEach(function (n) { h += btn('convert', n === 'creditnote' ? 'Return' : 'To ' + DT[n].label, { id: d.id, to: n }, 'sm'); });
    if (d.type === 'quotation' && st === 'Open') h += btn('setStatus', 'Accepted', { id: d.id, s: 'Accepted' }, 'sm line') + btn('setStatus', 'Lost', { id: d.id, s: 'Lost' }, 'sm line');
  }
  return h ? '<div class="note" style="margin-top:8px">Next steps</div><div class="acts" style="justify-content:flex-start;flex-wrap:wrap">' + h + '</div>' : '';
}
function docsFor(type) {
  var C = cur();
  return C.d.docs.filter(function (d) { if (type === 'invoice' && S.flt === 'unpaid' && (d.cancelled || outstanding(C, d) <= 0)) return false; if (type === 'invoice' && S.flt === 'paid' && (d.cancelled || outstanding(C, d) > 0)) return false; if (type === 'invoice' && S.flt === 'overdue' && (d.cancelled || outstanding(C, d) <= 0 || d.due >= today())) return false; if (S.flt === 'pipe' && (d.cancelled || !(d.status === 'Open' || d.status === 'Accepted' || d.status === 'Posted'))) return false; return d.type === type && match(S.q, [d.no, partyName(C, d.partyId), statusOf(C, d), d.by || '']); }).sort(function (a, b) { return (b.date + b.no).localeCompare(a.date + a.no); });
}
function lim(key, rows) { S.lim = S.lim || {}; var n = S.lim[key] || 200; return { rows: rows.slice(0, n), note: rows.length > n ? '<div class="row" style="margin-top:10px"><span class="note">Showing ' + n + ' of ' + rows.length + '. Download exports everything.</span>' + btn('moreRows', 'Show 200 more', { k: key }, 'sm line') + '</div>' : '' }; }
function avatar(name) { var n = String(name || '?').trim(), ini = (n.split(/\s+/).map(function (w) { return w[0]; }).join('').slice(0, 2) || '?').toUpperCase(), hue = 0; for (var i = 0; i < n.length; i++) hue = (hue * 31 + n.charCodeAt(i)) % 360; return '<span class="av" style="--h:' + hue + '">' + esc(ini) + '</span>'; }
function listActs(C, d, mod) {
  if (d.cancelled) return '<div class="acts">' + btn('view', 'View', { id: d.id }, 'sm line') + '</div>';
  var t = DT[d.type], h = '<div class="acts">';
  if (d.type === 'invoice' && outstanding(C, d) > 0 && canWrite('sales', 'receipt')) h += btn('newPay', 'Receive', { type: 'receipt', ref: d.id }, 'sm pri');
  else if (d.type === 'pinvoice' && outstanding(C, d) > 0 && canWrite('purchases', 'payment')) h += btn('newPay', 'Pay', { type: 'payment', ref: d.id }, 'sm pri');
  else if (d.type === 'po' && d.status === 'Open' && canWrite('purchases', 'po')) h += btn('receive', 'Receive goods', { id: d.id }, 'sm pri');
  else if (!t.post && (d.status === 'Open' || d.status === 'Accepted') && NEXT[d.type] && canWrite(mod, d.type)) h += btn('convert', 'To ' + DT[NEXT[d.type][0]].label, { id: d.id, to: NEXT[d.type][0] }, 'sm pri');
  return h + btn('view', 'Open', { id: d.id }, 'sm line') + '</div>';
}
function docList(type) {
  var C = cur(), t = DT[type], pur = t.side === 'p', mod = pur ? 'purchases' : 'sales', tdy = today();
  var showBal = type === 'invoice' || type === 'pinvoice';
  var all = docsFor(type), lm = lim('doc' + type, all), rows = lm.rows;
  var head = [['Document'], [pur ? 'Supplier' : 'Customer'], ['Amount', 'r']];
  if (showBal) head.push(['Balance', 'r']);
  head.push(['Status'], ['']);
  return table(head, rows.map(function (d) {
    var nm = partyName(C, d.partyId), sub = dmy(d.date);
    if (showBal && !d.cancelled && outstanding(C, d) > 0 && d.due) { var dd = Math.round((new Date(tdy) - new Date(d.due)) / 86400000); sub += dd > 0 ? ' · <span class="warn-t">' + dd + ' day(s) overdue</span>' : ' · due ' + dmy(d.due); }
    var r = ['<b>' + esc(d.no) + '</b><div class="note">' + sub + (d.by ? ' · ' + esc(d.by) : '') + '</div>', '<div class="pn">' + avatar(nm) + '<span>' + esc(nm) + '</span></div>', t.items ? '<b>' + money(d.total) + '</b>' : esc((d.req || '').slice(0, 40))];
    if (showBal) { var o = d.cancelled ? 0 : outstanding(C, d); r.push(d.cancelled ? '-' : o > 0 ? '<span class="warn-t">' + money(o) + '</span>' : '<span class="mute">' + money(0) + '</span>'); }
    r.push(statusChip(statusOf(C, d)), listActs(C, d, mod));
    return r;
  }), 'No ' + t.label.toLowerCase() + ' yet. Press New ' + t.label + ' to make the first one.', null, rows.map(function (d) { return ['view', d.id]; })) + lm.note;
}
function paysFor(type) {
  var C = cur();
  return C.d.payments.filter(function (p) { return p.type === type && match(S.q, [p.no, partyName(C, p.partyId), p.mode, p.by || '']); }).sort(function (a, b) { return (b.date + b.no).localeCompare(a.date + a.no); });
}
function payList(type) {
  var C = cur(), lm = lim('pay' + type, paysFor(type)), rows = lm.rows;
  var mod = type === 'receipt' ? 'sales' : 'purchases';
  return table([['No'], ['Date'], [type === 'receipt' ? 'Customer' : 'Supplier'], ['Mode'], ['Against'], ['Amount', 'r'], ['By'], ['Status'], ['']], rows.map(function (p) {
    var inv = p.refId ? docById(C, p.refId) : null;
    return ['<b>' + esc(p.no) + '</b>', dmy(p.date), esc(partyName(C, p.partyId)), esc(p.mode), inv ? esc(inv.no) : isRefund(p) ? '<b>' + esc(payLabel(p)) + '</b>' + (p.note ? '<div class="note">' + esc(p.note) + '</div>' : '') : '<span class="mute">Advance / on account</span>' + (p.alloc ? '<div class="note">Adjusted: ' + Object.keys(p.alloc).map(function (k) { var x = docById(C, k); return x && !x.cancelled ? esc(x.no) + ' ' + money(p.alloc[k]) : ''; }).filter(Boolean).join(', ') + (advFree(C, p) > 0 ? ' · left ' + money(advFree(C, p)) : '') + '</div>' : ''), money(p.amount), esc(p.by || '-'), statusChip(p.cancelled ? 'Cancelled' : type === 'receipt' ? 'Received' : 'Paid'),
      '<div class="acts">' + btn('viewPay', 'View', { id: p.id }, 'sm line') + (canWrite(mod, type) && canAdmin(mod) && !p.cancelled ? btn('editPay', 'Edit', { id: p.id }, 'sm line') : '') + (canWrite(mod, type) && !p.cancelled ? btn('cancelPay', 'Cancel', { id: p.id }, 'sm warn') : '') + '</div>'];
  }), 'No ' + (type === 'receipt' ? 'receipts' : 'payments') + ' yet.', null, rows.map(function (p) { return ['viewPay', p.id]; })) + lm.note;
}
function flowStrip(tabs, active) {
  var C = cur();
  return '<div class="flow">' + tabs.map(function (t, i) {
    var n = t[0] === 'receipt' ? C.d.payments.filter(function (p) { return p.type === 'receipt' && !p.cancelled; }).length : t[0] === 'payment' ? C.d.payments.filter(function (p) { return p.type === 'payment' && !p.cancelled; }).length : C.d.docs.filter(function (d) { return d.type === t[0] && !d.cancelled; }).length;
    return (i ? '<span class="mute">›</span>' : '') + '<button type="button" class="st' + (t[0] === active ? ' on' : '') + '" data-act="tab" data-t="' + t[0] + '">' + esc(t[1]) + '<b>' + n + '</b></button>';
  }).join('') + '</div>';
}
function vSales() {
  var C = cur();
  if (S.draft && DT[S.draft.type].side === 's') return editorH();
  var tabs = [['enquiry', 'Enquiry'], ['estimate', 'Estimate'], ['quotation', 'Quotation'], ['proforma', 'Proforma'], ['salesorder', 'Sales Order'], ['challan', 'Delivery Challan'], ['invoice', 'Sales Invoice'], ['receipt', 'Receipt'], ['creditnote', 'Return / Credit Note'], ['debitnote', 'Debit Note']];
  tabs = visTabs(C, tabs, SIMPLE_SALES.concat(S.force ? [S.force] : [])); var tab = pickTab(tabs, S.tab.sales, C.mode === 'simple' ? 'invoice' : 'quotation');
  var isPay = tab === 'receipt'; S.cur = { view: 'sales', tab: tab };
  S.listFn = function () { return isPay ? payList('receipt') : docList(tab); };
  var label = isPay ? 'Receipt' : DT[tab].label;
  var h = top('Sales', 'Enquiry to receipt, with returns and credit notes', '');
  var t0 = today(), invs = C.d.docs.filter(function (x) { return x.type === 'invoice' && !x.cancelled; });
  var sm1 = sumBy(invs.filter(function (x) { return x.date.slice(0, 7) === t0.slice(0, 7); }), function (x) { return x.total; });
  var pend = sumBy(invs, function (x) { return outstanding(C, x); }), ovd = invs.filter(function (x) { return x.due < t0 && outstanding(C, x) > 0; });
  var rcv = sumBy(C.d.payments.filter(function (x) { return x.type === 'receipt' && !x.cancelled && x.date.slice(0, 7) === t0.slice(0, 7); }), function (x) { return x.amount; });
  h += '<div class="sm-kpis">' + kpi('Sales this month', money(sm1), 'Invoices posted') + kpi('To collect', money(pend), invs.filter(function (x) { return outstanding(C, x) > 0; }).length + ' unpaid invoice(s)') + kpi('Overdue', money(sumBy(ovd, function (x) { return outstanding(C, x); })), ovd.length + ' invoice(s) past due date', ovd.length > 0) + kpi('Received this month', money(rcv), 'Receipts') + '</div>';
  h += '<div class="card">' + flowStrip(tabs, tab);
  if (tab === 'invoice') {
    var f = S.flt || '';
    h += '<div class="sm-fl">' + [['', 'All'], ['unpaid', 'Unpaid'], ['overdue', 'Overdue'], ['paid', 'Paid']].map(function (x) { return btn('sflt', x[1], { f: x[0] }, 'btnchip' + (f === x[0] ? ' on' : '')); }).join('') + '</div>';
  } else if (S.flt && tab === S.force) h += '<div class="note" style="display:flex;gap:10px;align-items:center">' + (S.flt === 'unpaid' ? 'Showing unpaid invoices only.' : 'Showing open ones only (the same as the Home count).') + btn('clrFlt', 'Show all', {}, 'sm line') + '</div>';
  if (tab === 'estimate') h += '<div class="note">Estimate is optional and gives an approximate cost. It carries no tax.</div>';
  if (tab === 'proforma') h += '<div class="note">Proforma Invoice is optional and is not a tax invoice.</div>';
  if (tab === 'challan') h += '<div class="note">Challan moves stock out. An invoice made from a challan does not move stock again.</div>';
  if (tab === 'creditnote') h += '<div class="note">Make a return from an invoice using the Return button. Stock goes back and the balance reduces.</div>';
  if (tab === 'debitnote') h += '<div class="note">Use a debit note only when extra amount is due on an invoice.</div>';
  var canNew = isPay ? canWrite('sales', 'receipt') : canWrite('sales', tab) && tab !== 'creditnote' && tab !== 'debitnote';
  h += searchBar(canNew ? btn(isPay ? 'newPay' : 'newDoc', 'New ' + label, isPay ? { type: 'receipt' } : { t: tab }, 'pri') + (tab === 'invoice' ? btn('recurUi', 'Recurring invoices' + (recDue(C).length ? ' (' + recDue(C).length + ' due)' : ''), {}, 'line') : '') : '') + '<div id="list">' + S.listFn() + '</div></div>';
  return h;
}
function vPurchases() {
  var C = cur();
  if (S.draft && DT[S.draft.type].side === 'p') return editorH();
  var tabs = visTabs(C, [['po', 'Purchase Order'], ['pinvoice', 'Purchase Invoice'], ['payment', 'Supplier Payment'], ['preturn', 'Return / Debit Note']], SIMPLE_PUR);
  var tab = pickTab(tabs, S.tab.purchases, C.mode === 'simple' ? 'pinvoice' : 'po');
  var isPay = tab === 'payment'; S.cur = { view: 'purchases', tab: tab };
  S.listFn = function () { return isPay ? payList('payment') : docList(tab); };
  var label = isPay ? 'Payment' : DT[tab].label;
  var h = top('Purchases', 'Order, receive, record the bill, pay the supplier', '');
  h += '<div class="card">' + flowStrip(tabs, tab);
  if (tab === 'po') h += '<div class="note">Purchase Order is optional. Use Receive goods to check quantity and quality before the invoice.</div>';
  if (tab === 'pinvoice') h += '<div class="note">Posting a purchase invoice adds stock and updates the average cost.</div>';
  if (tab === 'preturn') h += '<div class="note">Make a return from a purchase invoice using the Return button. Stock goes out and the payable reduces.</div>';
  var canNew = isPay ? canWrite('purchases', 'payment') : canWrite('purchases', tab) && tab !== 'preturn';
  h += searchBar(canNew ? btn(isPay ? 'newPay' : 'newDoc', 'New ' + label, isPay ? { type: 'payment' } : { t: tab }, 'pri') : '') + '<div id="list">' + S.listFn() + '</div></div>';
  return h;
}

/* ---------- day book ---------- */
function dayBookRows(C, dt) {
  var rows = [];
  var DOCL = { invoice: ['Sales', 1], pinvoice: ['Purchase', -1], creditnote: ['Sales return', -1], debitnote: ['Debit note', 1], preturn: ['Purchase return', 1] };
  C.d.docs.forEach(function (x) { var m = DOCL[x.type]; if (!m || x.date !== dt) return; rows.push({ k: x.type, label: m[0], no: x.no, who: partyName(C, x.partyId), amt: x.total || 0, st: statusOf(C, x), cancelled: !!x.cancelled, act: ['view', x.id] }); });
  C.d.payments.forEach(function (p) { if (p.date !== dt) return; rows.push({ k: isRefund(p) ? (p.type === 'receipt' ? 'payment' : 'receipt') : p.type, label: payLabel(p), no: p.no, who: partyName(C, p.partyId) + (p.mode ? ' · ' + p.mode : ''), amt: Math.abs(p.amount), st: p.cancelled ? 'Cancelled' : p.type === 'receipt' ? 'Received' : 'Paid', cancelled: !!p.cancelled, act: ['viewPay', p.id] }); });
  C.d.expenses.forEach(function (e) { if (e.date !== dt) return; rows.push({ k: e.kind === 'income' ? 'income' : 'expense', label: e.kind === 'income' ? 'Income' : 'Expense', no: '-', who: e.cat + (e.mode ? ' · ' + e.mode : ''), amt: e.amount, st: e.kind === 'income' ? 'Received' : 'Paid', cancelled: false, act: null }); });
  return rows;
}
function dayBookH(C) {
  if (role() === 'cashier' && !canView('accounting')) return '';
  var dt = S.dbDate || today(), rows = dayBookRows(C, dt), live = rows.filter(function (r) { return !r.cancelled; });
  function sm(k) { return sumBy(live.filter(function (r) { return r.k === k; }), function (r) { return r.amt; }); }
  var recvd = sm('receipt') + sm('income'), paid = sm('payment') + sm('expense');
  var h = '<div class="card"><div class="bar"><h2>Day Book</h2><div class="row">' + btn('dbDay', 'Previous day', { n: -1 }, 'sm line') + '<input type="date" class="inp" style="max-width:160px" data-chg="dbDate" value="' + esc(dt) + '" aria-label="Day Book date">' + btn('dbDay', 'Next day', { n: 1 }, 'sm line') + (dt !== today() ? btn('dbDay', 'Today', { n: 0 }, 'sm') : '') + btn('dlDayBook', 'Detail PDF with graph', { fmt: 'pdf' }, 'sm pri') + btn('dlDayBook', 'Excel', { fmt: 'xlsx' }, 'sm') + '</div></div>';
  h += '<div class="grid">' + kpi('Sales', money(sm('invoice') - sm('creditnote')), 'Invoices less returns') + kpi('Purchases', money(sm('pinvoice') - sm('preturn')), 'Bills less returns') + kpi('Money received', money(recvd), 'Receipts and income') + kpi('Money paid', money(paid), 'Payments and expenses') + '</div>';
  var order = { invoice: 1, creditnote: 2, debitnote: 3, pinvoice: 4, preturn: 5, receipt: 6, payment: 7, income: 8, expense: 9 };
  rows.sort(function (a, b) { return (order[a.k] - order[b.k]) || String(a.no).localeCompare(String(b.no)); });
  h += table([['Type'], ['No'], ['Party / details'], ['Amount', 'r'], ['Status']], rows.map(function (r) {
    return [esc(r.label), '<b>' + esc(r.no) + '</b>', esc(r.who), r.cancelled ? '<span style="text-decoration:line-through">' + money(r.amt) + '</span>' : money(r.amt), statusChip(r.st)];
  }), 'No entries on ' + dmy(dt) + '.', null, rows.map(function (r) { return r.act || null; })) + '</div>';
  return h;
}

/* ---------- friendly layer: simple mode, quick bill, sharing ---------- */
function visTabs(C, tabs, simple) { return C.mode === 'simple' ? tabs.filter(function (t) { return simple.indexOf(t[0]) >= 0; }) : tabs; }
function pickTab(tabs, want, def) { var ids = tabs.map(function (t) { return t[0]; }); return ids.indexOf(want) >= 0 ? want : ids.indexOf(def) >= 0 ? def : ids[0]; }

function waPhone(p) { var ph = String((p && p.phone) || '').replace(/\D/g, ''); if (ph.length === 10) ph = '91' + ph; return ph; }
function waLink(d) { var C = cur(), p = partyById(C, d.partyId) || {}; return 'https://wa.me/' + waPhone(p) + '?text=' + encodeURIComponent(billText(d)); }
function billText(d) {
  var C = cur(), t = DT[d.type], L = ['*' + C.name + '*', t.label + ' ' + d.no, 'Date: ' + dmy(d.date), ''];
  (d.items || []).forEach(function (it) { L.push(it.name + ' x ' + qtyF(it.qty) + ' = ' + money((it.taxable || 0) + (it.tax || 0))); });
  L.push('', '*Total: ' + money(d.total) + '*');
  if (d.type === 'invoice') {
    var bal = outstanding(C, d);
    if (bal > 0) L.push('Balance due: ' + money(bal)); else L.push('Paid. Thank you!');
    var tb = totalDueLines(C, d); if (tb) L.push(tb);
    if ((bal > 0 || tb) && C.bank && C.bank.upi) L.push('Pay by UPI: ' + C.bank.upi);
  } else L.push('Thank you.');
  if (C.phone) L.push(C.phone);
  return L.join('\n');
}
/* old dues of the customer beyond this bill, so the message shows the full amount to pay */
function totalDueLines(C, d) {
  var p = partyById(C, d.partyId); if (!p || /walk-in/i.test(p.name)) return '';
  var all = partyBalance(C, p), here = Math.max(0, outstanding(C, d)), prev = all - here;
  if (prev > 0 && all > 0) return 'Previous balance: ' + money(prev) + '\n*Total due: ' + money(all) + '*';
  if (all < 0) return 'Advance with us: ' + money(-all);
  return '';
}
function waShortText(d) {
  var C = cur(), t = DT[d.type], L = [C.name + ' - ' + t.label + ' ' + d.no, 'Amount: ' + money(d.total)];
  if (d.type === 'invoice') { var bal = outstanding(C, d), tb = totalDueLines(C, d); L.push(bal > 0 ? 'Balance due: ' + money(bal) : 'Paid. Thank you!'); if (tb) L.push(tb); if ((bal > 0 || tb) && C.bank && C.bank.upi) L.push('Pay by UPI: ' + C.bank.upi); }
  return L.join('\n');
}
/* invoice copies: Original / Duplicate / Triplicate, names can be changed in Settings */
var COPYDOCS = ['invoice', 'creditnote', 'debitnote', 'challan', 'proforma'];
function copyNames(C) { var n = C.copyNames || []; return [n[0] || 'Original for Recipient', n[1] || 'Duplicate for Transporter', n[2] || 'Triplicate for Supplier']; }
function copySel(C) { var s = C.copySel; return s && s.length === 3 && s.some(Boolean) ? s : [true, false, false]; }
function pickedCopies(C) { var n = copyNames(C), s = copySel(C); return n.filter(function (x, i) { return s[i]; }); }
function shareH(d) {
  var C = cur(), s = DT[d.type].side === 's', cp = COPYDOCS.indexOf(d.type) >= 0, n = copyNames(C), sel = copySel(C);
  var h = '';
  if (cp) h += '<div class="copies row"><span class="note">Copies for print and PDF:</span>' + n.map(function (x, i) { return '<label class="ck"><input type="checkbox" data-chg="copy" data-i="' + i + '"' + (sel[i] ? ' checked' : '') + '> ' + esc(x) + '</label>'; }).join('') + '</div>';
  h += '<div class="row">' + (s ? btn('waShare', 'Send on WhatsApp (PDF)', { id: d.id, fmt: 'pdf' }, 'pri') + btn('waShare', 'WhatsApp Excel', { id: d.id, fmt: 'xlsx' }, 'line') : '') + btn('docPdf', 'Download PDF', { id: d.id }, s ? 'line' : 'pri') + btn('docXlsx', 'Download Excel', { id: d.id }, 'line') + btn('print', 'Print', {}, 'line') + (s ? (d.type === 'invoice' && !d.cancelled && canWrite('sales', 'invoice') ? btn('repeatDoc', 'Repeat this invoice', { id: d.id }, 'line') : '') + btn('rcpt', 'Receipt 80mm', { id: d.id, w: 80 }, 'line') + btn('rcpt', 'Receipt 58mm', { id: d.id, w: 58 }, 'line') : '') + (s ? btn('copyText', 'Copy bill text', { id: d.id }, 'line') : '') + '</div>';
  return h;
}

function homeActions(C, noTiles) {
  var a = [];
  if (canWrite('quick')) a.push(['nav', 'New Bill', 'Sell items and take payment', { v: 'quick' }, true]);
  if (canWrite('sales', 'receipt')) a.push(['newPay', 'Money received', 'Record a customer payment', { type: 'receipt' }]);
  if (canWrite('accounting')) a.push(['goExp', 'Add expense', 'Rent, fuel, salary', {}]);
  if (canWrite('inventory')) a.push(['newProd', 'Add item', 'New product or service', {}]);
  if (canWrite('parties')) a.push(['newParty', 'Add customer', 'Name, phone, GSTIN', { side: 'customer' }]);
  var nag = '';
  if (role() === 'owner') {
    if (C.scheme === 'regular' && (!C.gstin || !C.address)) nag += '<div class="hint">Add your GSTIN and address in Settings so your bills are valid tax invoices. ' + btn('nav', 'Open Settings', { v: 'settings' }, 'sm') + '</div>';
    var age = C.lastBackup ? Math.round((new Date(today()) - new Date(C.lastBackup)) / 86400000) : 999;
    if (C.d.docs.length && age > 7 && !C.demo) nag += '<div class="hint">' + (C.lastBackup ? 'Your last backup was ' + age + ' days ago. ' : 'You have not downloaded a backup yet. ') + 'Your data is stored only on this device. ' + btn('dlBackup', 'Download backup', {}, 'sm') + '</div>';
  }
  var h = nag + (noTiles ? '' : '<div class="grid">' + a.map(function (x) { return '<button type="button" class="tile' + (x[4] ? ' pri' : '') + '" data-act="' + x[0] + '"' + dattr(x[3]) + '><b>' + esc(x[1]) + '</b><span>' + esc(x[2]) + '</span></button>'; }).join('') + '</div>');
  if (!C.d.docs.length) {
    var hasCust = C.d.parties.some(function (p) { return p.type === 'customer'; });
    var steps = [['Add your items', C.d.products.length > 0, 'newProd', {}, canWrite('inventory')], ['Add a customer (optional)', hasCust, 'newParty', { side: 'customer' }, canWrite('parties')], ['Make your first bill', false, 'nav', { v: 'quick' }, canWrite('quick')]];
    h += '<div class="card"><h2>Get started</h2>' + steps.map(function (s) { return '<div class="bar"><span>' + esc(s[0]) + '</span>' + (s[1] ? chip('Done', 'ok') : s[4] ? btn(s[2], 'Start', s[3], 'sm') : '') + '</div>'; }).join('') + '<div class="note">You can also open the Customers and Settings pages from the menu. Your data stays in this browser.</div></div>';
  }
  return h;
}

/* quick bill: tap items, type to find items, add a new item without leaving the bill */
function qbState() { if (!S.qb) S.qb = { partyId: '', cart: [], mode: 'Cash', paid: null, q: '', grp: 'top', hi: 0 }; if (!S.qb.grp) S.qb.grp = 'top'; return S.qb; }
function qbWalkin(C) { var p = C.d.parties.find(function (x) { return x.type === 'customer' && x.name === 'Walk-in Customer'; }); return p || addParty(C, { type: 'customer', name: 'Walk-in Customer' }); }
function qbCalc(C) { var s = qbState(), d = { type: 'invoice', partyId: s.partyId, items: s.cart, bdt: s.bdt, bdv: s.bdv }; calc(C, d); return d; }
function soldCount(C) {
  var m = {}; C.d.docs.forEach(function (d) { if (d.type !== 'invoice' || d.cancelled || d.date < addDays(today(), -120)) return; d.items.forEach(function (it) { if (it.pid) m[it.pid] = (m[it.pid] || 0) + 1; }); });
  return m;
}
function topItems(C, n) {
  var m = soldCount(C), list = C.d.products.slice().sort(function (a, b) { return (m[b.id] || 0) - (m[a.id] || 0) || a.name.localeCompare(b.name); });
  return list.slice(0, n);
}
function recentItems(C, n) {
  var seen = {}, out = [];
  C.d.docs.slice().filter(function (d) { return d.type === 'invoice' && !d.cancelled; }).sort(function (a, b) { return (b.date + b.no).localeCompare(a.date + a.no); }).forEach(function (d) { d.items.forEach(function (it) { if (it.pid && !seen[it.pid] && out.length < n) { var p = prodById(C, it.pid); if (p) { seen[it.pid] = 1; out.push(p); } } }); });
  return out;
}
function itemGroups(C) { var m = {}; C.d.products.forEach(function (p) { if (p.cat) m[p.cat] = 1; }); return Object.keys(m).sort().slice(0, 14); }
function qbMatches(C, q) {
  q = q.trim().toLowerCase(); if (!q) return [];
  var words = q.split(/\s+/);
  return C.d.products.filter(function (p) { var hay = (p.name + ' ' + p.sku + ' ' + (p.barcode || '') + ' ' + p.hsn + ' ' + (p.cat || '')).toLowerCase(); return words.every(function (w) { return hay.indexOf(w) >= 0; }); })
    .sort(function (a, b) { var as = a.name.toLowerCase().indexOf(q) === 0 ? 0 : 1, bs = b.name.toLowerCase().indexOf(q) === 0 ? 0 : 1; return as - bs || a.name.localeCompare(b.name); });
}
function ptile(C, p) {
  var q0 = stockQty(C, p.id), low = p.tracked && q0 <= 0;
  return '<button type="button" class="ptile" data-act="qbAdd" data-id="' + p.id + '"><b>' + esc(p.name) + '</b><span class="num">' + money(p.sale) + (p.unit ? ' / ' + esc(p.unit) : '') + '</span><span class="' + (low ? 'warn-t' : 'mute') + '">' + (p.tracked ? (low ? 'Out of stock' : qtyF(q0) + ' in stock') : 'Service') + '</span></button>';
}
function qbChips(C) {
  var s = qbState(), gs = [['top', 'Top items'], ['recent', 'Recent'], ['all', 'All items (' + C.d.products.length + ')']].concat(itemGroups(C).map(function (g) { return ['g:' + g, g]; }));
  return gs.map(function (g) { return '<button type="button" class="chip btnchip' + (g[0] === s.grp ? ' on' : '') + '" data-act="qbGrp" data-g="' + esc(g[0]) + '">' + esc(g[1]) + '</button>'; }).join('');
}
function qbTiles(C) {
  var s = qbState(), list;
  if (!C.d.products.length) return '<div class="empty">No items yet. ' + (canWrite('inventory') ? btn('qbNewItem', 'Add your first item', { name: '' }, 'sm pri') : 'Ask the owner to add items.') + '</div>';
  if (s.grp === 'top') list = topItems(C, 6);
  else if (s.grp === 'recent') list = recentItems(C, 12);
  else if (s.grp === 'all') list = C.d.products.slice().sort(function (a, b) { return a.name.localeCompare(b.name); });
  else list = C.d.products.filter(function (p) { return p.cat === s.grp.slice(2); }).sort(function (a, b) { return a.name.localeCompare(b.name); });
  if (!list.length) return '<div class="empty">Nothing here yet. Bill a few items, or pick All items.</div>';
  return list.map(function (p) { return ptile(C, p); }).join('') + (s.grp === 'top' && C.d.products.length > 6 ? '<button type="button" class="btn line" style="grid-column:1/-1" data-act="qbGrp" data-g="all">More items (' + (C.d.products.length - list.length) + ' more)</button>' : '');
}
function qbSugH(C) {
  var s = qbState(), q = s.q.trim(); if (!q) return '';
  var m = qbMatches(C, q), shown = m.slice(0, 7); if (s.hi >= shown.length) s.hi = 0;
  var h = shown.map(function (p, i) {
    var q0 = stockQty(C, p.id);
    return '<button type="button" class="sug-row' + (i === s.hi ? ' hi' : '') + '" data-act="qbAdd" data-id="' + p.id + '" data-from="sug"><span><b>' + esc(p.name) + '</b>' + (p.cat ? ' <span class="note">' + esc(p.cat) + '</span>' : '') + '</span><span class="num">' + money(p.sale) + ' · ' + (p.tracked ? (q0 <= 0 ? 'Out of stock' : qtyF(q0) + ' in stock') : 'Service') + '</span></button>';
  }).join('');
  if (m.length > shown.length) h += '<div class="note sug-note">Showing ' + shown.length + ' of ' + m.length + ' matches. Keep typing to narrow.</div>';
  if (!m.length) h += '<div class="note sug-note">No item matches "' + esc(q) + '".</div>';
  if (canWrite('inventory')) h += '<button type="button" class="sug-row new" data-act="qbNewItem" data-name="' + esc(q) + '"><span>+ Add "' + esc(q) + '" as a new item</span><span class="note">saves to your item list</span></button>';
  return h;
}
function qbCartH(C) {
  var s = qbState(); qbCalc(C);
  if (!s.cart.length) return '<div class="empty">The bill is empty. Tap an item, or type its name.</div>';
  return s.cart.map(function (it, i) {
    return '<div class="cart-row"><div style="min-width:0"><b>' + esc(it.name) + '</b><div class="row" style="gap:6px;margin-top:4px"><span class="note">Price</span><input class="inp num" style="width:100px;min-height:32px;padding:3px 8px" type="number" min="0" step="any" data-qbf="rate" data-qi="' + i + '" value="' + rs(it.rate) + '" aria-label="Price"></div></div>' +
      '<div class="stepper"><button type="button" class="btn sm line" data-act="qbQty" data-qi="' + i + '" data-d="-1" aria-label="Less">-</button><input class="inp num" type="number" min="0" step="any" data-qbf="qty" data-qi="' + i + '" value="' + esc(it.qty) + '" aria-label="Quantity"><button type="button" class="btn sm line" data-act="qbQty" data-qi="' + i + '" data-d="1" aria-label="More">+</button></div>' +
      '<div class="num" id="qba-' + i + '" style="text-align:right;min-width:84px">' + money(it.taxable || 0) + '</div><button type="button" class="btn sm line" data-act="qbRm" data-qi="' + i + '" aria-label="Remove item">Remove</button></div>';
  }).join('');
}
function qbTotH(C) {
  var s = qbState(), d = qbCalc(C);
  var h = '<div class="tot" style="width:100%;margin:0">' + (d.discAmt > 0 ? '<div><span>Discount (already deducted)</span><span class="num">-' + money(d.discAmt) + '</span></div>' : '') + '<div><span>Taxable value</span><span class="num">' + money(d.sub) + '</span></div>';
  if (C.scheme === 'regular') h += '<div><span>GST added</span><span class="num">' + money(d.cgst + d.sgst + d.igst) + '</span></div>';
  h += '<div class="g"><span>Total</span><span class="num">' + money(d.total) + '</span></div>';
  var q = qbPlan(C);
  if (q.adv) h += '<div><span>Advance adjusted</span><span class="num">-' + money(q.adv) + '</span></div>';
  if (q.settle) h += '<div><span>Settlement discount</span><span class="num">-' + money(q.settle) + '</span></div>';
  if (q.adv || q.settle) h += '<div class="g"><span>To collect now</span><span class="num">' + money(q.due) + '</span></div>';
  return h + '</div>';
}
function qbRefresh() {
  var C = cur(), s = qbState(), d = qbCalc(C), tb = $('#qbtot');
  if (tb) tb.innerHTML = qbTotH(C);
  s.cart.forEach(function (it, i) { var a = $('#qba-' + i); if (a) a.textContent = money(it.taxable || 0); });
  var pi = $('#qbpaid'); if (pi && s.paid === null) pi.value = rs(qbPlan(C).due);
}
function vQuick() {
  var C = cur(), s = qbState(), custs = C.d.parties.filter(function (p) { return p.type === 'customer' && p.name !== 'Walk-in Customer'; });
  var d = qbCalc(C);
  var h = top('New Bill', 'Tap an item, or type a name and press Enter.', s.cart.length ? btn('qbClear', 'Clear bill', {}, 'sm line') : '');
  h += '<div class="cols"><div class="card" style="flex:1 1 380px"><div class="sugwrap"><input id="qbq" class="inp" placeholder="Search ' + C.d.products.length + ' items or scan a barcode" value="' + esc(s.q) + '" aria-label="Search items" autocomplete="off">' + (camBtn('qb') ? '<div style="margin-top:6px">' + camBtn('qb') + '</div>' : '') + '<div id="qbsug" class="sug"' + (s.q.trim() ? '' : ' hidden') + '>' + qbSugH(C) + '</div></div>' +
    '<div class="chips" id="qbchips">' + qbChips(C) + '</div><div id="tiles" class="tiles">' + qbTiles(C) + '</div>' +
    (canWrite('inventory') ? '<div class="row">' + btn('qbNewItem', '+ New item', { name: '' }, 'sm') + '<span class="note">New items are saved in your item list and show in reports.</span></div>' : '') +
    (C.scheme === 'regular' ? '<div class="note">Prices are before GST and GST is added, except items marked \'Sale price includes GST\'.</div>' : '') + '</div>';
  h += '<div class="card" style="flex:1 1 380px"><h2>Bill</h2><div id="cart">' + qbCartH(C) + '</div>' +
    '<label class="fld"><span>Customer</span><select data-chg="qbParty"><option value="">Walk-in customer</option>' + opts(custs, s.partyId, function (p) { return p.id; }, function (p) { return p.name; }) + '</select></label>' +
    (canWrite('parties') ? '<div>' + btn('newParty', 'New customer', { side: 'customer' }, 'sm line') + '</div>' : '') +
    '<div class="row" style="align-items:flex-end"><label class="fld" style="max-width:150px"><span>Discount</span><select data-qbf="bdt"><option value="pct"' + (s.bdt === 'amt' ? '' : ' selected') + '>Percent (%)</option><option value="amt"' + (s.bdt === 'amt' ? ' selected' : '') + '>Cash (Rs)</option></select></label><label class="fld" style="max-width:120px"><span>Value</span><input class="num" type="number" min="0" step="any" data-qbf="bdv" value="' + esc(s.bdv || '') + '" placeholder="0"></label></div>' +
    (function () { var av = s.partyId ? advAvail(C, s.partyId, 'receipt') : 0; return av > 0 ? '<label class="ck" style="display:flex;gap:8px;align-items:center"><input type="checkbox" data-qbf="adv"' + (s.adv ? ' checked' : '') + '> Adjust advance received <b class="num">' + money(av) + '</b></label>' : ''; })() +
    '<div id="qbtot">' + qbTotH(C) + '</div>' +
    '<div class="fg">' + field('Payment mode', '<select data-chg="qbMode">' + opts(['Cash', 'UPI', 'Card', 'Bank'], s.mode) + '</select>') + field('Amount received', '<input id="qbpaid" class="num" type="number" min="0" step="any" inputmode="decimal" data-qbf="paid" aria-label="Amount received" value="' + (s.paid === null ? rs(qbPlan(C).due) : esc(s.paid)) + '">') + field('Settlement discount (Rs)', '<input class="num" type="number" min="0" step="any" inputmode="decimal" data-qbf="settle" value="' + esc(s.settle || '') + '" placeholder="0" aria-label="Settlement discount">') + '</div>' +
    '<div class="note">Received less than the total? The rest stays as balance due. Pick a customer for part payment.</div>' +
    '<div class="row">' + btn('qbSave', 'Save bill', {}, 'pri') + '</div></div></div>';
  return h;
}

/* ---------- accounting data ---------- */
function cashBank(C) {
  var o = C.d.opening, tx = [];
  C.d.payments.forEach(function (p) { if (p.cancelled || p.mode === 'TDS') return; tx.push({ id: p.id, chq: p.mode === 'Cheque', date: p.date, acct: p.mode === 'Cash' ? 'Cash' : 'Bank', desc: payLabel(p) + ' ' + p.no + ' · ' + partyName(C, p.partyId), inn: (p.type === 'receipt') === (p.amount >= 0) ? Math.abs(p.amount) : 0, out: (p.type === 'payment') === (p.amount >= 0) ? Math.abs(p.amount) : 0 }); });
  C.d.expenses.forEach(function (e) { tx.push({ id: e.id, date: e.date, acct: e.mode === 'Cash' ? 'Cash' : 'Bank', desc: (e.kind === 'income' ? 'Income: ' : 'Expense: ') + e.cat, inn: e.kind === 'income' ? e.amount : 0, out: e.kind === 'expense' ? e.amount : 0 }); });
  (C.loans || []).forEach(function (l) {
    if (l.recv) tx.push({ id: 'L' + l.id, date: l.start, acct: 'Bank', desc: 'Loan received · ' + l.name, inn: l.principal, out: 0 });
    (l.paid || []).forEach(function (x) { tx.push({ id: 'L' + l.id + '-' + x.n, date: x.date, acct: 'Bank', desc: 'Loan principal repaid · ' + l.name, inn: 0, out: x.prin }); });
  });
  var cash = o.cash, bank = o.bank;
  tx.forEach(function (t) { if (t.acct === 'Cash') cash += t.inn - t.out; else bank += t.inn - t.out; });
  return { cash: cash, bank: bank, tx: tx };
}

/* ---------- inventory ---------- */
function vInventory() {
  var C = cur(), w = canWrite('inventory');
  var tabs = visTabs(C, [['products', 'Products'], ['adjust', 'Stock In/Out and Adjustments'], ['warehouses', 'Warehouses'], ['transfers', 'Godown Transfer'], ['ledger', 'Stock Ledger'], ['valuation', 'Valuation']].concat(C.d.products.some(function (p) { return p.batch; }) ? [['batches', 'Batches and Expiry']] : []).concat(C.d.products.some(function (p) { return p.serial; }) ? [['serials', 'Serial Numbers']] : []), ['products', 'adjust', 'valuation', 'batches', 'serials']);
  var tab = pickTab(tabs, S.tab.inventory, 'products');
  var h = top('Items and Stock', 'Stock changes only through approved documents and adjustments', '') + '<div class="card">' + tabsH(tabs, tab, 'tab');
  if (tab === 'products') {
    S.cur = { view: 'inventory', tab: 'products' };
    S.listFn = function () {
      var all = C.d.products.filter(function (p) { return match(S.q, [p.name, p.hsn, p.sku, p.cat, p.barcode]); }), lm = lim('prod', all), rows = lm.rows;
      return table([['Item'], ['Group'], ['HSN/SAC'], ['In stock', 'r'], ['Minimum', 'r'], ['Avg cost', 'r'], ['Sale price', 'r'], ['GST', 'r'], ['']], rows.map(function (p) {
        var q = stockQty(C, p.id), low = p.tracked && q < p.min;
        return ['<b>' + esc(p.name) + '</b>' + (p.tracked ? '' : '<div class="note">Service, no stock</div>') + (p.barcode ? '<div class="note">' + esc(p.barcode) + (p.batch ? ' · batch tracked' : '') + '</div>' : (p.batch ? '<div class="note">Batch tracked</div>' : '')), esc(p.cat || ''), esc(p.hsn), p.tracked ? '<span class="' + (low ? 'warn-t' : '') + '">' + qtyF(q) + ' ' + esc(p.unit) + '</span>' : '-', p.tracked ? qtyF(p.min) : '-', money(p.cost), money(p.sale), p.gst + '%', w ? '<div class="acts">' + (p.tracked ? btn('labels', 'Labels', { id: p.id }, 'sm line') : '') + btn('editProd', 'Edit', { id: p.id }, 'sm line') + (canAdmin('inventory') ? btn('delProd', 'Delete', { id: p.id }, 'sm warn') : '') + '</div>' : ''];
      }), 'No products yet.', null, w ? rows.map(function (p) { return ['editProd', p.id]; }) : null) + lm.note;
    };
    h += searchBar(w ? btn('newProd', 'New product', {}, 'pri') + btn('impProducts', 'Import from Excel', {}, 'line') + (lowItems(C).length && canWrite('purchases', 'po') ? btn('poFromLow', 'Create PO for low stock') : '') : '') + '<div id="list">' + S.listFn() + '</div>';
  } else if (tab === 'serials') {
    h += searchBar('') + '<div id="list">' + (S.listFn = function () { return serialReport(C); })() + '</div>';
  } else if (tab === 'batches') {
    h += batchReport(C);
  } else if (tab === 'adjust') {
    var tracked = C.d.products.filter(function (p) { return p.tracked; });
    if (w) {
      h += '<div class="cols"><form data-submit="adjust" class="card" style="flex:1 1 320px"><h2>Stock in or out</h2><div class="fg">' +
        field('Product', '<select name="pid" required>' + opts(tracked, '', function (p) { return p.id; }, function (p) { return p.name; }) + '</select>', 'wide') + field('Direction', '<select name="dir"><option value="in">Stock in</option><option value="out">Stock out</option></select>') +
        field('Quantity', '<input name="qty" type="number" min="0.001" step="any" required>') + field('Warehouse', '<select name="wh">' + opts(C.d.warehouses) + '</select>') + field('Reason', '<input name="note" placeholder="Damage, count correction, sample">', 'wide') + field('Serial numbers (serial items only)', '<textarea name="serials" rows="2" placeholder="One per line or comma separated"></textarea>', 'wide') + field('Batch no (batch items only)', '<input name="batch" maxlength="30" placeholder="Needed for stock in">') + field('Expiry date (stock in)', '<input name="exp" type="date">') +
        '</div><div><button class="btn pri" type="submit">Record adjustment</button></div></form>' +
        '<form data-submit="transfer" class="card" style="flex:1 1 320px"><h2>Transfer between warehouses</h2><div class="fg">' +
        field('Product', '<select name="pid" required>' + opts(tracked, '', function (p) { return p.id; }, function (p) { return p.name; }) + '</select>', 'wide') + field('From', '<select name="from">' + opts(C.d.warehouses) + '</select>') + field('To', '<select name="to">' + opts(C.d.warehouses, C.d.warehouses[1] || '') + '</select>') + field('Quantity', '<input name="qty" type="number" min="0.001" step="any" required>') +
        '</div><div><button class="btn pri" type="submit">Transfer</button></div></form></div>';
    }
    var mv = C.d.moves.filter(function (m) { return m.type === 'adjustment' || m.type === 'transfer' || m.type === 'opening'; }).sort(function (a, b) { return b.date.localeCompare(a.date); }).slice(0, 60);
    h += '<h2>Adjustments, transfers and opening stock</h2>' + table([['Date'], ['Item'], ['Warehouse'], ['Type'], ['Qty', 'r'], ['Note']], mv.map(function (m) { var p = prodById(C, m.pid); return [dmy(m.date), esc(p ? p.name : '-'), esc(m.wh), esc(m.type), (m.qty > 0 ? '+' : '') + qtyF(m.qty), esc(m.note)]; }), 'No adjustments yet.');
  } else if (tab === 'warehouses') {
    if (w) h += '<form data-submit="addWh" class="row"><input class="inp" style="max-width:240px" name="name" placeholder="New warehouse name" required aria-label="Warehouse name"><button class="btn pri" type="submit">Add warehouse</button></form>';
    var tr = C.d.products.filter(function (p) { return p.tracked; });
    h += table([['Item']].concat(C.d.warehouses.map(function (x) { return [x, 'r']; })).concat([['Total', 'r']]), tr.map(function (p) {
      return ['<b>' + esc(p.name) + '</b>'].concat(C.d.warehouses.map(function (x) { return qtyF(stockQty(C, p.id, x)); })).concat([qtyF(stockQty(C, p.id))]);
    }), 'No stocked products yet.');
  } else if (tab === 'transfers') {
    h += trTabH(C);
  } else if (tab === 'ledger') {
    var tp = C.d.products.filter(function (p) { return p.tracked; }); var sel = S.tab.ledgerP || (tp[0] && tp[0].id);
    h += '<label class="fld" style="max-width:320px"><span>Product</span><select data-chg="ledgerP">' + opts(tp, sel, function (p) { return p.id; }, function (p) { return p.name; }) + '</select></label>';
    var bal = 0, mvs = C.d.moves.filter(function (m) { return m.pid === sel; }).sort(function (a, b) { return a.date.localeCompare(b.date); });
    h += table([['Date'], ['Type'], ['Reference'], ['Warehouse'], ['In', 'r'], ['Out', 'r'], ['Balance', 'r']], mvs.map(function (m) { bal += m.qty; return [dmy(m.date), esc(m.type), esc(m.note), esc(m.wh), m.qty > 0 ? qtyF(m.qty) : '', m.qty < 0 ? qtyF(-m.qty) : '', qtyF(bal)]; }), 'No stock movement for this product.', null, mvs.map(function (m) { return mvAct(C, m); }));
  } else {
    var tot = 0;
    var rows = C.d.products.filter(function (p) { return p.tracked; }).map(function (p) { var q = stockQty(C, p.id), v = Math.max(0, q) * p.cost; tot += v; return ['<b>' + esc(p.name) + '</b>', qtyF(q) + ' ' + esc(p.unit), money(p.cost), money(v)]; });
    h += '<div class="note">Valuation uses weighted average cost, updated on each purchase invoice.</div>' + table([['Item'], ['Quantity', 'r'], ['Average cost', 'r'], ['Value', 'r']], rows, 'No stocked products yet.', ['Total', '', '', money(tot)]);
  }
  return h + '</div>';
}

/* ---------- accounting ---------- */
function vAccounting() {
  var C = cur(), w = canWrite('accounting');
  var tabs = visTabs(C, [['cash', 'Cash and Bank'], ['inex', 'Income and Expenses'], ['journal', 'Journals'], ['exprep', 'Expense Report'], ['recv', 'Receivables'], ['pay', 'Payables'], ['tds', 'TDS and TCS'], ['bank', 'Bank Reconciliation'], ['loans', 'Loans and EMI']].concat(canWrite('accounting') ? [['bin', 'Recycle Bin']] : []), ['cash', 'inex', 'exprep', 'recv', 'pay']);
  var tab = pickTab(tabs, S.tab.accounting, 'cash');
  var h = top('Money', 'Every receipt and payment updates cash or bank', '') + '<div class="card">' + tabsH(tabs, tab, 'tab');
  if (tab === 'cash') {
    var cb = cashBank(C), af = S.tab.acct || 'All';
    h += '<div class="grid">' + kpi('Cash in hand', money(cb.cash), 'Opening ' + money(C.d.opening.cash)) + kpi('Bank and UPI', money(cb.bank), 'Opening ' + money(C.d.opening.bank)) + kpi('Total', money(cb.cash + cb.bank), 'All accounts') + '</div>';
    if (w) h += '<form data-submit="opening" class="row"><label class="fld"><span>Opening cash</span><input class="inp" name="cash" type="number" step="any" value="' + rs(C.d.opening.cash) + '"></label><label class="fld"><span>Opening bank</span><input class="inp" name="bank" type="number" step="any" value="' + rs(C.d.opening.bank) + '"></label><button class="btn" type="submit" style="align-self:flex-end">Save opening balances</button></form>';
    h += '<label class="fld" style="max-width:220px"><span>Account</span><select data-chg="acct">' + opts(['All', 'Cash', 'Bank']) .replace('value="' + af + '"', 'value="' + af + '" selected') + '</select></label>';
    var list = cb.tx.filter(function (t) { return af === 'All' || t.acct === af; }).sort(function (a, b) { return a.date.localeCompare(b.date); });
    var run = af === 'Cash' ? C.d.opening.cash : af === 'Bank' ? C.d.opening.bank : C.d.opening.cash + C.d.opening.bank;
    h += table([['Date'], ['Account'], ['Details'], ['In', 'r'], ['Out', 'r'], ['Balance', 'r']], list.map(function (t) { run += t.inn - t.out; return [dmy(t.date), esc(t.acct), esc(t.desc), t.inn ? money(t.inn) : '', t.out ? money(t.out) : '', money(run)]; }), 'No transactions yet.');
  } else if (tab === 'inex') {
    if (w && false) h += '<form data-submit="addExp" class="card" style="background:var(--bg)"><div class="fg">' + field('Type', '<select name="kind"><option value="expense">Expense</option><option value="income">Other income</option></select>') + field('Category', '<input name="cat" required placeholder="Rent, Fuel, Salary">') + field('Amount', '<input name="amt" type="number" min="0.01" step="any" required>') + field('Paid or received by', '<select name="mode"><option>Cash</option><option>Bank</option><option>UPI</option></select>') + field('Date', '<input name="date" type="date" value="' + today() + '" required>') + field('Note', '<input name="note">') + '</div><div><button class="btn pri" type="submit">Add entry</button></div></form>';
    S.listFn = function () {
      var ex = C.d.expenses.filter(function (e) { return match(S.q, [e.cat, e.note, e.mode, e.by || '', e.kind]); }).sort(function (a, b) { return b.date.localeCompare(a.date); });
      return table([['Date'], ['Type'], ['Category'], ['Mode'], ['Amount', 'r'], ['Note'], ['Added by'], ['']], ex.map(function (e) { return [dmy(e.date), e.kind === 'income' ? 'Income' : 'Expense', esc(e.cat), esc(e.mode), money(e.amount), esc(e.note), esc(e.by || '-'), w ? '<div class="acts">' + btn('editExp', 'Edit', { id: e.id }, 'sm line') + (canAdmin('accounting') ? btn('delExp', 'Delete', { id: e.id }, 'sm warn') : '') + '</div>' : '']; }), 'No entries yet. Press New entry to add rent, fuel, salary or other income.', null, w ? ex.map(function (e) { return ['editExp', e.id]; }) : null);
    };
    h += searchBar(w ? btn('newExp', 'New entry', {}, 'pri') : '') + '<div id="list">' + S.listFn() + '</div>';
  } else if (tab === 'exprep') {
    h += expReport(C);
  } else if (tab === 'tds') {
    h += tdsTabH(C);
  } else if (tab === 'bank') {
    h += bankTabH(C);
  } else if (tab === 'loans') {
    h += loanTabH(C);
  } else if (tab === 'bin') {
    h += binTab(['expense', 'journal']);
  } else if (tab === 'journal') {
    if (w) h += '<form data-submit="addJrn" class="card" style="background:var(--bg)"><div class="fg">' + field('Date', '<input name="date" type="date" value="' + today() + '" required>') + field('Debit account', '<select name="dr">' + opts(ACCTS) + '</select>') + field('Credit account', '<select name="cr">' + opts(ACCTS, 'Capital') + '</select>') + field('Amount', '<input name="amt" type="number" min="0.01" step="any" required>') + field('Narration', '<input name="note">', 'wide') + '</div><div><button class="btn pri" type="submit">Post journal</button></div></form>';
    var jt = sumBy(C.d.journals, function (j) { return j.amount; });
    h += table([['Date'], ['Debit'], ['Credit'], ['Amount', 'r'], ['Narration'], ['']], C.d.journals.slice().sort(function (a, b) { return b.date.localeCompare(a.date); }).map(function (j) { return [dmy(j.date), esc(j.dr), esc(j.cr), money(j.amount), esc(j.note), w && canAdmin('accounting') ? btn('delJrn', 'Delete', { id: j.id }, 'sm warn') : '']; }), 'No journal entries yet.', ['Total debit = total credit', '', '', money(jt), '', '']);
  } else {
    var isR = tab === 'recv', type = isR ? 'invoice' : 'pinvoice', t = today();
    var inv = C.d.docs.filter(function (d) { return (d.type === type || (isR && d.type === 'debitnote')) && !d.cancelled && outstanding(C, d) > 0; }).sort(function (a, b) { return (a.due || '').localeCompare(b.due || ''); });
    var tot = sumBy(inv, function (d) { return outstanding(C, d); });
    if (isR && remList(C).length && canWrite('sales', 'invoice')) h += '<div class="row" style="margin:8px 0">' + btn('remindUi', 'Payment reminders (' + remList(C).length + ' customers overdue)', {}, 'pri') + '</div>';
    h += table([['Invoice'], [isR ? 'Customer' : 'Supplier'], ['Due'], ['Total', 'r'], ['Balance', 'r'], ['Age']], inv.map(function (d) {
      var late = d.due < t; var days = Math.round((new Date(t) - new Date(d.due)) / 86400000);
      return ['<b>' + esc(d.no) + '</b>', esc(partyName(C, d.partyId)), dmy(d.due), money(d.total), money(outstanding(C, d)), late ? '<span class="warn-t">' + days + ' days overdue</span>' : 'Not due'];
    }), isR ? 'No receivables. All invoices are paid.' : 'No payables. All bills are paid.', ['Total outstanding', '', '', '', money(tot), ''], inv.map(function (d) { return ['view', d.id]; }));
  }
  return h + '</div>';
}

/* ---------- GST and reports ---------- */
function rng() { if (!S.range) S.range = { from: fyStart(today()), to: today() }; return S.range; }
function inR(d) { var r = rng(); return d.date >= r.from && d.date <= r.to; }
function docsOf(type) { var C = cur(); return C.d.docs.filter(function (d) { return d.type === type && !d.cancelled && inR(d); }); }
function csvOf(head, rows) { return [head].concat(rows).map(function (r) { return r.map(function (c) { c = String(c == null ? '' : c); return /[",\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c; }).join(','); }).join('\n'); }
var CSV = '';
function gstTotals(list, sign) { return { cg: sign * sumBy(list, function (d) { return d.cgst; }), sg: sign * sumBy(list, function (d) { return d.sgst; }), ig: sign * sumBy(list, function (d) { return d.igst; }), tx: sign * sumBy(list, function (d) { return d.sub; }) }; }
/* ---------- customers and suppliers ---------- */
function vParties() {
  var C = cur(), tab = S.tab.parties || 'customer', w = canWrite('parties'); S.cur = { view: 'parties', tab: tab };
  var h = top('Customers and Suppliers', 'Profiles, ledgers and balances', '') + '<div class="card">' + tabsH([['customer', 'Customers'], ['supplier', 'Suppliers']], tab, 'tab');
  S.listFn = function () {
    var all = C.d.parties.filter(function (p) { return p.type === tab && match(S.q, [p.name, p.gstin, p.phone]); }), lm = lim('party' + tab, all), rows = lm.rows;
    return table([['Name'], ['GSTIN'], ['State'], ['Phone'], [tab === 'customer' ? 'Receivable' : 'Payable', 'r'], ['']], rows.map(function (p) {
      var b = partyBalance(C, p);
      return ['<b>' + esc(p.name) + '</b>', esc(p.gstin || '-'), esc(p.state), esc(p.phone), '<span class="' + (b > 0 && tab === 'customer' ? 'warn-t' : '') + '">' + money(b) + '</span>', '<div class="acts">' + btn('ledger', 'Ledger', { id: p.id }, 'sm line') + (tab === 'customer' && w ? btn('partyPrices', 'Prices', { id: p.id }, 'sm line') : '') + (w ? btn('editParty', 'Edit', { id: p.id }, 'sm line') : '') + (w && canAdmin('parties') ? btn('delParty', 'Delete', { id: p.id }, 'sm warn') : '') + '</div>'];
    }), 'No ' + (tab === 'customer' ? 'customers' : 'suppliers') + ' yet.', null, rows.map(function (p) { return ['ledger', p.id]; })) + lm.note;
  };
  h += searchBar(w ? btn('newParty', 'New ' + (tab === 'customer' ? 'customer' : 'supplier'), { side: tab }, 'pri') + btn('impParties', 'Import from Excel', {}, 'line') : '') + '<div id="list">' + S.listFn() + '</div></div>';
  return h;
}
function partyForm(p, side) {
  var C = cur(); p = p || { type: side, state: C.state };
  return '<div class="mh"><h2>' + (p.id ? 'Edit ' : 'New ') + (p.type === 'customer' ? 'customer' : 'supplier') + '</h2>' + btn('closeModal', 'Close', {}, 'sm line') + '</div><form data-submit="saveParty"><input type="hidden" name="id" value="' + esc(p.id || '') + '"><input type="hidden" name="type" value="' + esc(p.type) + '"><div class="fg">' +
    field('Name', '<input name="name" required value="' + esc(p.name || '') + '">', 'wide') + field('GSTIN (optional)', '<input name="gstin" value="' + esc(p.gstin || '') + '" maxlength="15">') + field('State', '<select name="state">' + opts(STATES, p.state) + '</select>') + field('Phone', '<input name="phone" value="' + esc(p.phone || '') + '">') + field('Email', '<input name="email" type="email" value="' + esc(p.email || '') + '">') + field('Address', '<input name="address" value="' + esc(p.address || '') + '">', 'wide') + field('City', '<input name="city" maxlength="50" value="' + esc(p.city || '') + '">') + field('PIN code', '<input name="pin" maxlength="6" inputmode="numeric" value="' + esc(p.pin || '') + '">') + field('Opening balance (' + (p.type === 'customer' ? 'they owe you' : 'you owe them') + ')', '<input name="opening" type="number" step="any" value="' + rs(p.opening || 0) + '">') +
    (p.type === 'customer' ? field('Price level', '<select name="level">' + opts([['', 'Retail'], ['wholesale', 'Wholesale']], p.level || '', function (x) { return x[0]; }, function (x) { return x[1]; }) + '</select>') + field('Default discount %', '<input name="disc" type="number" min="0" max="100" step="any" value="' + (+p.disc || 0) + '">') : '') +
    '</div><div class="row" style="margin-top:14px"><button class="btn pri" type="submit">Save</button></div></form>';
}
function ledgerH(p) {
  var C = cur(), cu = p.type === 'customer', ev = [];
  if (p.opening) ev.push({ date: '0000-00-00', t: 'Opening balance', dr: cu ? p.opening : 0, cr: cu ? 0 : p.opening });
  C.d.docs.forEach(function (d) {
    if (d.partyId !== p.id || !DT[d.type].post || d.type === 'challan') return;
    var up = d.type === 'invoice' || d.type === 'debitnote' || d.type === 'pinvoice';
    ev.push({ date: d.date, t: DT[d.type].label + ' ' + d.no, up: up, amt: d.total, can: !!d.cancelled, act: 'view', id: d.id });
  });
  C.d.payments.forEach(function (x) { if (x.partyId === p.id) ev.push({ date: x.date, t: payLabel(x) + ' ' + x.no + ' (' + x.mode + ')' + (x.disc ? ' incl. discount ' + money(x.disc) : ''), up: false, amt: x.amount + (x.disc || 0), can: !!x.cancelled, act: 'viewPay', id: x.id }); });
  ev.sort(function (a, b) { return a.date.localeCompare(b.date); });
  var bal = 0;
  var rows = ev.map(function (e) {
    var inc = e.can ? 0 : (e.dr !== undefined ? e.dr - e.cr : (e.up ? e.amt : -e.amt));
    bal += inc;
    if (e.can) return [dmy(e.date), '<s>' + esc(e.t) + '</s> <span class="warn-t">Cancelled</span>', '', '', money(bal)];
    var dr = cu ? (inc > 0 ? inc : 0) : (inc < 0 ? -inc : 0), cr = cu ? (inc < 0 ? -inc : 0) : (inc > 0 ? inc : 0);
    return [e.date === '0000-00-00' ? '' : dmy(e.date), esc(e.t), dr ? money(dr) : '', cr ? money(cr) : '', money(bal)];
  });
  return '<div class="mh"><div><h2>' + esc(p.name) + '</h2><div class="note">' + esc(p.gstin || 'No GSTIN') + ' · ' + esc(p.state) + ' · ' + esc(p.phone || 'No phone') + (p.email ? ' · ' + esc(p.email) : '') + '</div></div>' + btn('closeModal', 'Close', {}, 'sm line') + '</div>' +
    '<div class="grid">' + kpi(cu ? 'Receivable' : 'Payable', money(partyBalance(C, p)), cu ? 'Customer owes you' : 'You owe supplier') + '</div><div class="row">' + (partyBalance(C, p) > 0 && canWrite(cu ? 'sales' : 'purchases', cu ? 'receipt' : 'payment') ? btn('newPay', cu ? 'Receive payment' : 'Pay supplier', { type: cu ? 'receipt' : 'payment', party: p.id }, 'pri') : '') + btn('ledgerWa', 'Statement on WhatsApp', { id: p.id }, 'line') + expBtns('modal') + '</div>' + table([['Date'], ['Entry'], ['Debit', 'r'], ['Credit', 'r'], ['Balance', 'r']], rows, 'No entries yet.', null, ev.map(function (e) { return e.act ? [e.act, e.id] : null; }));
}

/* ---------- settings ---------- */
function vSettings() {
  var C = cur(), tab = S.tab.settings || 'company';
  var h = top('Settings', 'Company, tax, users and backup', '') + '<div class="card">' + tabsH([['company', 'Company and Tax'], ['series', 'Number Series'], ['prefs', 'Preferences'], ['users', 'Users and Roles'], ['backup', 'Backup'], ['bin', 'Recycle Bin'], ['audit', 'Audit Log']], tab, 'tab');
  if (tab === 'company') {
    h += '<form data-submit="saveCompany"><div class="fg">' + field('Company name', '<input name="name" required value="' + esc(C.name) + '">', 'wide') + field('GSTIN', '<input name="gstin" maxlength="15" value="' + esc(C.gstin) + '">') + field('State', '<select name="state">' + opts(STATES, C.state) + '</select>') +
      field('Tax scheme (locked)', '<select name="scheme_view" disabled title="Tax scheme cannot be changed after the company is created">' + opts([['regular', 'Regular GST'], ['composition', 'Composition (Bill of Supply)'], ['notax', 'No tax (Cash Bill)']], C.scheme, function (x) { return x[0]; }, function (x) { return x[1]; }) + '</select>') + field('Phone', '<input name="phone" value="' + esc(C.phone) + '">') + field('Email', '<input name="email" value="' + esc(C.email) + '">') + field('Address', '<input name="address" value="' + esc(C.address) + '">', 'wide') + field('City', '<input name="city" maxlength="50" value="' + esc(C.city || '') + '">') + field('PIN code', '<input name="pin" maxlength="6" inputmode="numeric" value="' + esc(C.pin || '') + '">') + '<label class="ck wide"><input type="checkbox" name="einv"' + (C.einv ? ' checked' : '') + '> E-invoicing applies to my business (yearly turnover above 5 crore)</label>' +
      field('Business type', '<select name="biz">' + opts(Object.keys(BIZ), C.bizType || 'other', null, function (k) { return BIZ[k].label; }) + '</select><div class="note" id="bizHint">' + esc(bizNote(C.bizType || 'other')) + '</div>') + field('Screen mode', '<select name="mode">' + opts([['simple', 'Simple (fewer screens)'], ['full', 'Full (all document types)']], C.mode || 'full', function (x) { return x[0]; }, function (x) { return x[1]; }) + '</select>') + field('Bank name', '<input name="bname" value="' + esc(C.bank.name) + '">') + field('Account number', '<input name="bacc" value="' + esc(C.bank.acc) + '">') + field('IFSC', '<input name="bifsc" value="' + esc(C.bank.ifsc) + '">') + field('UPI ID', '<input name="bupi" value="' + esc(C.bank.upi) + '">') +
      field('Copy 1 name on invoice', '<input name="cp0" maxlength="40" value="' + esc(copyNames(C)[0]) + '">') + field('Copy 2 name', '<input name="cp1" maxlength="40" value="' + esc(copyNames(C)[1]) + '">') + field('Copy 3 name', '<input name="cp2" maxlength="40" value="' + esc(copyNames(C)[2]) + '">') +
      '</div><label class="ck" style="margin-top:10px"><input type="checkbox" name="popup"' + (C.dailyPopup === false ? '' : ' checked') + '> Show Today\'s report popup once a day when I open the app</label>' + '<div class="note">Copy names appear on printed and PDF invoices, for example Original for Recipient, Duplicate for Transporter, Triplicate for Supplier. Change them to anything you like.</div><div class="note"><b>Tax scheme is locked.</b> It cannot be changed after the company is created, because old bills would no longer match. If your tax scheme changes, create a new company (Switch company, then Set up your business). Old company data stays safe.</div>' + '<div class="row" style="margin-top:14px"><button class="btn pri" type="submit">Save settings</button></div></form>';
  } else if (tab === 'prefs') {
    h += prefsH(C);
  } else if (tab === 'series') {
    var types = Object.keys(DT).concat(['receipt', 'payment']);
    h += '<form data-submit="saveSeries"><div class="fg">' + types.map(function (t) { var pre = (C.d.series[t] && C.d.series[t].prefix) || (t === 'receipt' ? 'RCT' : t === 'payment' ? 'PAY' : DT[t].pre); return field((t === 'receipt' ? 'Receipt' : t === 'payment' ? 'Supplier Payment' : DT[t].label) + ' prefix', '<input name="s_' + t + '" value="' + esc(pre) + '" maxlength="8" required>'); }).join('') + '</div><div class="note" style="margin-top:8px">Numbers restart each financial year, for example INV/' + fyLabel(today()) + '/0001.</div><div class="row" style="margin-top:14px"><button class="btn pri" type="submit">Save number series</button></div></form>';
  } else if (tab === 'users') {
    h += table([['Name'], ['Email'], ['Role'], ['']], C.members.map(function (m) {
      var u = DB.users.find(function (x) { return x.id === m.userId; }) || { name: '?', email: '?' }; var me = m.userId === DB.session.userId;
      return [esc(u.name) + (me ? ' (you)' : ''), esc(u.email), '<select class="inp" style="max-width:150px" data-chg="role" data-uid="' + m.userId + '"' + (me ? ' disabled' : '') + ' aria-label="Role for ' + esc(u.name) + '">' + opts(ROLES, m.role) + '</select>', me ? '' : '<div class="acts">' + btn('userPass', 'Set password', { id: m.userId }, 'sm line') + btn('rmUser', 'Remove', { id: m.userId }, 'sm warn') + '</div>'];
    }));
    h += '<form data-submit="addUser" class="card" style="background:var(--bg)"><h2>Add a user</h2><div class="fg">' + field('Name', '<input name="name" required>') + field('Email', '<input name="email" type="email" required>') + field('Password (new users, 6 or more characters)', '<input name="pass" type="password" minlength="6" autocomplete="new-password">') + field('Role', '<select name="role">' + opts(ROLES, 'cashier') + '</select>') + '</div><div><button class="btn pri" type="submit">Add user</button></div></form>' +
      '<div class="note">Owner: everything. Manager: all modules except Settings. Cashier: sales invoices, receipts, customers. Accountant: purchases, accounting, reports, inventory view.</div>' + (role() === 'owner' ? pinCardH(C) + limitsCardH(C) : '');
  } else if (tab === 'backup') {
    var abc = role() === 'owner' ? abCardH() : '';
    var lb = C.lastBackup ? 'Last backup: ' + dmy(C.lastBackup) : 'No backup downloaded yet';
    h += abc + '<div class="hint">Your data is saved in this browser on this device only. If you clear browser data or lose the device, it is gone. Download a backup file often and keep it safe (for example in Google Drive or WhatsApp to yourself). ' + esc(lb) + '.</div><div class="row">' + btn('dlBackup', 'Download backup file', {}, 'pri') + btn('copyBackup', 'Copy backup text', {}, 'line') + '</div>' +
      '<form data-submit="restore" class="card" style="background:var(--bg)"><h2>Restore from backup</h2><label class="fld"><span>Choose a backup file</span><input type="file" accept=".json,application/json" data-chg="backupFile"></label><label class="fld"><span>Or paste backup text</span><textarea name="json" required></textarea></label><div><button class="btn warn" type="submit">Restore</button></div></form>' +
      '<div class="card" style="background:var(--bg)"><h2>Reset</h2><div class="note">Clears all documents, parties and products of this company.</div><div class="row">' + (S.confirmReset ? btn('doReset', 'Yes, erase this company data', {}, 'warn') + btn('cancelReset', 'Keep data', {}, 'line') : btn('askReset', 'Reset company data', {}, 'warn')) + '</div></div><div class="note">Bill DNA version ' + VERSION + '</div>';
  } else if (tab === 'bin') {
    h += binTab(['expense', 'journal', 'party', 'product']);
  } else {
    h += '<div class="bar"><div class="note">' + C.d.audit.length + ' entries recorded. The download has all of them.</div><div class="row">' + btn('dlAudit', 'PDF', { fmt: 'pdf' }, 'sm pri') + btn('dlAudit', 'Excel', { fmt: 'xlsx' }, 'sm') + btn('dlAudit', 'CSV', { fmt: 'csv' }, 'sm') + '</div></div>' + table([['Time'], ['User'], ['Action'], ['Reference']], C.d.audit.slice(0, 300).map(function (a) { return [tmStr(a.ts), esc(a.user), esc(a.act), esc(a.ref)]; }), 'No activity yet.') + (C.d.audit.length > 300 ? '<div class="note">Showing the latest 300. Download for the full log.</div>' : '');
  }
  return h + '</div>';
}

/* ---------- GST returns and reports ---------- */
function stCode(name) { var ks = Object.keys(STATE_CODES); for (var i = 0; i < ks.length; i++) if (STATE_CODES[ks[i]] === name) return ks[i]; return ''; }
function posLabel(state) { var c = stCode(state); return c ? c + '-' + state : (state || ''); }
function docsIn(type, from, to) { var C = cur(); return C.d.docs.filter(function (d) { return d.type === type && !d.cancelled && d.date >= from && d.date <= to; }); }
function isReg(p) { return !!(p && p.gstin); }
function sumF(arr, f) { var s = 0; arr.forEach(function (x) { s += f(x); }); return s; }
var UQC = { pcs: 'PCS', piece: 'PCS', pieces: 'PCS', nos: 'NOS', no: 'NOS', number: 'NOS', kg: 'KGS', kgs: 'KGS', g: 'GMS', gm: 'GMS', ltr: 'LTR', l: 'LTR', litre: 'LTR', liter: 'LTR', ml: 'MLT', m: 'MTR', mtr: 'MTR', meter: 'MTR', metre: 'MTR', box: 'BOX', set: 'SET', pair: 'PRS', pack: 'PAC', roll: 'ROL', bag: 'BAG', bottle: 'BTL', dozen: 'DOZ', ton: 'TON', can: 'CAN', carton: 'CTN', sqft: 'SQF', sqm: 'SQM', unit: 'UNT', units: 'UNT' };
function uqcOf(unit, hsn) { if (/^99/.test(hsn || '')) return 'NA'; return UQC[String(unit || '').toLowerCase().trim()] || 'OTH'; }

/* per-rate split of a document: [{rate, t, cg, sg, ig}] */
function rateRows(d) {
  var m = {};
  (d.items || []).forEach(function (it) { var r = +it.gst || 0, o = m[r] = m[r] || { rate: r, t: 0, cg: 0, sg: 0, ig: 0 }; o.t += it.taxable || 0; o.cg += it.cgst || 0; o.sg += it.sgst || 0; o.ig += it.igst || 0; });
  return Object.keys(m).map(Number).sort(function (a, b) { return a - b; }).map(function (k) { return m[k]; });
}

/* HSN / SAC summary. side 's' = outward (invoices minus credit notes plus debit notes), 'p' = inward */
function hsnSummary(side, from, to) {
  var types = side === 's' ? [['invoice', 1], ['debitnote', 1], ['creditnote', -1]] : [['pinvoice', 1], ['preturn', -1]], m = {}, blank = 0;
  types.forEach(function (tp) {
    docsIn(tp[0], from, to).forEach(function (d) {
      (d.items || []).forEach(function (it) {
        var h = (it.hsn || '').trim(); if (!h) blank++;
        var k = (h || '-') + '|' + (+it.gst || 0) + '|' + (it.unit || ''), o = m[k] = m[k] || { hsn: h || 'Not set', desc: it.name, unit: it.unit || '', rate: +it.gst || 0, q: 0, v: 0, t: 0, cg: 0, sg: 0, ig: 0 };
        var sg = tp[1]; o.q += sg * (+it.qty || 0); o.t += sg * (it.taxable || 0); o.cg += sg * (it.cgst || 0); o.sg += sg * (it.sgst || 0); o.ig += sg * (it.igst || 0); o.v += sg * ((it.taxable || 0) + (it.tax || 0));
      });
    });
  });
  var rows = Object.keys(m).sort().map(function (k) { return m[k]; });
  return { rows: rows, blank: blank };
}
function hsnTable(side, from, to) {
  var r = hsnSummary(side, from, to), C = cur();
  var head = [['HSN/SAC'], ['Description'], ['UQC'], ['Total quantity', 'r'], ['Total value', 'r'], ['Taxable value', 'r'], ['IGST', 'r'], ['CGST', 'r'], ['SGST', 'r'], ['Rate', 'r']];
  var body = r.rows.map(function (o) { return [esc(o.hsn), esc(o.desc), esc(uqcOf(o.unit, o.hsn)), qtyF(o.q), money(o.v), money(o.t), money(o.ig), money(o.cg), money(o.sg), o.rate + '%']; });
  var foot = r.rows.length ? ['Total', '', '', '', money(sumF(r.rows, function (o) { return o.v; })), money(sumF(r.rows, function (o) { return o.t; })), money(sumF(r.rows, function (o) { return o.ig; })), money(sumF(r.rows, function (o) { return o.cg; })), money(sumF(r.rows, function (o) { return o.sg; })), ''] : null;
  var warn = r.blank ? '<div class="hint">' + r.blank + ' line(s) have no HSN/SAC code. Add the code in Items and Stock so this summary is complete. Use 4 digits if your yearly turnover is up to 5 crore, 6 digits above that.</div>' : '';
  return warn + table(head, body, 'No data in this period.', foot);
}

/* GSTR-3B workings for a date range */
function calc3b(C, from, to) {
  var neg = { tx: 0, ig: 0, cg: 0, sg: 0 };
  var a = { tx: 0, ig: 0, cg: 0, sg: 0 }, nil = 0, pos = {}, nilInReg = 0, nilInUnreg = 0, nilOutReg = 0, nilOutUnreg = 0;
  var outT = [['invoice', 1], ['debitnote', 1], ['creditnote', -1]];
  outT.forEach(function (tp) {
    docsIn(tp[0], from, to).forEach(function (d) {
      var p = partyById(C, d.partyId), reg = isReg(p);
      (d.items || []).forEach(function (it) {
        var sg = tp[1];
        if ((+it.gst || 0) > 0) { a.tx += sg * it.taxable; a.ig += sg * (it.igst || 0); a.cg += sg * (it.cgst || 0); a.sg += sg * (it.sgst || 0); }
        else { nil += sg * it.taxable; if (d.inter) { if (reg) nilOutReg += sg * it.taxable; else nilOutUnreg += sg * it.taxable; } else if (reg) nilInReg += sg * it.taxable; else nilInUnreg += sg * it.taxable; }
        if (d.inter && !reg && (+it.gst || 0) > 0) { var k = (p && p.state) || '-'; pos[k] = pos[k] || { t: 0, ig: 0 }; pos[k].t += sg * it.taxable; pos[k].ig += sg * (it.igst || 0); }
      });
    });
  });
  var itc = { ig: 0, cg: 0, sg: 0 }, itcM = { ig: 0, cg: 0, sg: 0 }, inNil = { intra: 0, inter: 0 };
  if (C.scheme === 'regular') {
    [['pinvoice', 1], ['preturn', -1]].forEach(function (tp) {
      docsIn(tp[0], from, to).forEach(function (d) {
        var s = tp[1], p = partyById(C, d.partyId);
        if (d.items.some(function (it) { return (+it.gst || 0) > 0; })) { itc.ig += s * d.igst; itc.cg += s * d.cgst; itc.sg += s * d.sgst; if (d.m2b) { itcM.ig += s * d.igst; itcM.cg += s * d.cgst; itcM.sg += s * d.sgst; } }
        d.items.forEach(function (it) { if (!((+it.gst || 0) > 0)) { if (d.inter) inNil.inter += s * it.taxable; else inNil.intra += s * it.taxable; } });
      });
    });
  }
  var bf = C.itcBf || { ig: 0, cg: 0, sg: 0 };
  var cr = { ig: Math.max(0, itc.ig + (bf.ig || 0)), cg: Math.max(0, itc.cg + (bf.cg || 0)), sg: Math.max(0, itc.sg + (bf.sg || 0)) };
  var so = setoff({ ig: Math.max(0, a.ig), cg: Math.max(0, a.cg), sg: Math.max(0, a.sg) }, cr);
  return { out: a, nil: nil, nilSplit: { inReg: nilInReg, inUnreg: nilInUnreg, outReg: nilOutReg, outUnreg: nilOutUnreg }, pos: pos, itc: itc, itcM: itcM, inNil: inNil, bf: bf, credit: cr, setoff: so, cash: so.cash, carry: so.carry };
}
/* set-off order under GST law: IGST credit first (IGST, CGST, SGST), then CGST credit (CGST, IGST), then SGST credit (SGST, IGST) */
function setoff(L, Cr) {
  var l = { ig: L.ig, cg: L.cg, sg: L.sg }, c = { ig: Cr.ig, cg: Cr.cg, sg: Cr.sg }, pay = { ig: { ig: 0, cg: 0, sg: 0 }, cg: { ig: 0, cg: 0, sg: 0 }, sg: { ig: 0, cg: 0, sg: 0 } };
  function use(lh, ch) { var u = Math.min(l[lh], c[ch]); l[lh] -= u; c[ch] -= u; pay[lh][ch] += u; }
  use('ig', 'ig'); use('cg', 'ig'); use('sg', 'ig'); use('cg', 'cg'); use('ig', 'cg'); use('sg', 'sg'); use('ig', 'sg');
  return { pay: pay, cash: l, carry: c };
}

/* ---------- screens ---------- */
function gstScope() {
  var C = cur();
  if (C.scheme === 'regular') return '';
  return '<div class="hint">' + (C.scheme === 'composition' ? 'Composition scheme: you do not file GSTR-1, GSTR-3B or take input credit. You pay tax on turnover (CMP-08) and file GSTR-4 once a year. Use the Sales Report and Profit and Loss tabs for your figures.' : 'This company does not charge GST, so GST returns do not apply.') + '</div>';
}
function g9Years() { var t = today(), y = +fyStart(t).slice(0, 4); return [y, y - 1, y - 2]; }
function vGst() {
  var C = cur(), tab = S.tab.gst || 'sum', r = rng();
  var tabs = [['sum', 'GST Summary'], ['gstr1', 'GSTR-1 (Sales)'], ['gstr3b', 'GSTR-3B'], ['hsn', 'HSN / SAC'], ['purreg', 'GSTR-2 (Purchases / ITC)'], ['r2b', 'GSTR-2B Match'], ['gstr9', 'GSTR-9 (Yearly)'], ['sales', 'Sales Report'], ['purchase', 'Purchase Report'], ['pl', 'Profit and Loss'], ['stock', 'Stock Report'], ['out', 'Outstanding'], ['byuser', 'Sales by User'], ['billprofit', 'Bill-wise Profit'], ['partysales', 'Party-wise Sales'], ['lowstock', 'Low Stock']];
  var h = top('Reports and GST', 'Reports come from posted documents only', '') + '<div class="card">';
  if (tab !== 'gstr9') h += '<div class="row"><label class="fld"><span>From</span><input class="inp" type="date" data-range="from" value="' + r.from + '"></label><label class="fld"><span>To</span><input class="inp" type="date" data-range="to" value="' + r.to + '"></label>' + btn('thisMonth', 'This month', {}, 'sm line') + btn('lastMonth', 'Last month', {}, 'sm line') + btn('thisFy', 'This year', {}, 'sm line') + '</div>';
  h += tabsH(tabs, tab, 'tab');
  CSV = '';
  var gtab = ['sum', 'gstr1', 'gstr3b', 'hsn', 'purreg', 'r2b', 'gstr9'].indexOf(tab) >= 0;
  if (gtab && tab !== 'sum' && C.scheme !== 'regular') return h + gstScope() + '</div>';
  if (tab === 'sum') h += gstSummary(C, r);
  else if (tab === 'gstr1') h += gstr1H(C, r);
  else if (tab === 'gstr3b') h += gstr3bH(C, r);
  else if (tab === 'hsn') {
    var sd = S.tab.hsnSide || 's';
    h += tabsH([['s', 'Outward (sales)'], ['p', 'Inward (purchases)']], sd, 'hsnside') + '<div class="note">Table 12 of GSTR-1 asks for the HSN/SAC summary of what you sold. Inward summary is needed in GSTR-9. Credit notes are subtracted.</div>' + hsnTable(sd, r.from, r.to);
  } else if (tab === 'purreg') h += purRegH(C, r);
  else if (tab === 'r2b') h += r2bTab(C, r);
  else if (tab === 'gstr9') h += gstr9H(C);
  else if (tab === 'byuser') h += userReport(C);
  else if (tab === 'billprofit') h += billProfitH(C, r);
  else if (tab === 'partysales') h += partySalesH(C, r);
  else if (tab === 'lowstock') h += lowStockH(C);
  else if (tab === 'sales' || tab === 'purchase') {
    var isS = tab === 'sales', main = docsIn(isS ? 'invoice' : 'pinvoice', r.from, r.to), ret = docsIn(isS ? 'creditnote' : 'preturn', r.from, r.to);
    var net2 = sumF(main, function (d) { return d.total; }) - sumF(ret, function (d) { return d.total; });
    h += '<div class="grid">' + kpi(isS ? 'Invoices' : 'Purchase invoices', money(sumF(main, function (d) { return d.total; })), main.length + ' document(s)') + kpi(isS ? 'Returns' : 'Purchase returns', money(sumF(ret, function (d) { return d.total; })), ret.length + ' document(s)') + kpi('Net', money(net2), 'After returns') + '</div>';
    main.sort(function (a, b) { return a.date.localeCompare(b.date); });
    h += table([['No'], ['Date'], [isS ? 'Customer' : 'Supplier'], ['GSTIN'], ['Taxable', 'r'], ['Tax', 'r'], ['Total', 'r'], ['Status']], main.map(function (d) { var p = partyById(C, d.partyId) || {}; return ['<b>' + esc(d.no) + '</b>', dmy(d.date), esc(p.name || '-'), esc(p.gstin || ''), money(d.sub), money(d.cgst + d.sgst + d.igst), money(d.total), statusChip(statusOf(C, d))]; }), 'No documents in this period.', ['Total', '', '', '', money(sumF(main, function (d) { return d.sub; })), money(sumF(main, function (d) { return d.cgst + d.sgst + d.igst; })), money(sumF(main, function (d) { return d.total; })), ''], main.map(function (d) { return ['view', d.id]; }));
  } else if (tab === 'pl') {
    var ns = sumF(docsIn('invoice', r.from, r.to), function (d) { return d.sub; }) - sumF(docsIn('creditnote', r.from, r.to), function (d) { return d.sub; }) + sumF(docsIn('debitnote', r.from, r.to), function (d) { return d.sub; });
    var cogs = 0; C.d.moves.forEach(function (m) { if ((m.type === 'sale' || m.type === 'salereturn') && m.date >= r.from && m.date <= r.to) cogs -= m.qty * m.cost; });
    cogs = Math.round(cogs);
    var gp = ns - cogs;
    var oi = sumF(C.d.expenses.filter(function (e) { return e.kind === 'income' && e.date >= r.from && e.date <= r.to; }), function (e) { return e.amount; });
    var exp = {}; C.d.expenses.forEach(function (e) { if (e.kind === 'expense' && e.date >= r.from && e.date <= r.to) exp[e.cat] = (exp[e.cat] || 0) + e.amount; });
    var te = sumF(Object.keys(exp), function (k) { return exp[k]; });
    var dAll = sumF(C.d.payments.filter(function (x) { return x.type === 'receipt' && !x.cancelled && x.date >= r.from && x.date <= r.to; }), function (x) { return x.disc || 0; });
    var dRec = sumF(C.d.payments.filter(function (x) { return x.type === 'payment' && !x.cancelled && x.date >= r.from && x.date <= r.to; }), function (x) { return x.disc || 0; });
    oi += dRec; if (dAll) { exp['Discount allowed to customers'] = (exp['Discount allowed to customers'] || 0) + dAll; te += dAll; }
    var rowsPl = [['Net sales (excluding tax)', money(ns)], ['Cost of goods sold', money(cogs)], ['<b>Gross profit</b>', '<b>' + money(gp) + '</b>'], ['Other income', money(oi)]].concat(Object.keys(exp).map(function (k) { return ['Expense: ' + esc(k), money(exp[k])]; }));
    h += table([['Particulars'], ['Amount', 'r']], rowsPl, '', ['Net profit', money(gp + oi - te)]) + '<div class="note">Cost of goods sold uses the average cost at the time of sale.</div>';
  } else if (tab === 'stock') {
    var tt = 0;
    h += table([['Item'], ['HSN'], ['In stock', 'r'], ['Avg cost', 'r'], ['Value', 'r'], ['Status']], C.d.products.filter(function (p) { return p.tracked; }).map(function (p) { var q = stockQty(C, p.id), v = Math.max(0, q) * p.cost; tt += v; return [esc(p.name), esc(p.hsn), qtyF(q) + ' ' + esc(p.unit), money(p.cost), money(v), q < p.min ? '<span class="chip warn">Low</span>' : '<span class="chip">OK</span>']; }), 'No stocked products.', ['Total stock value', '', '', '', money(tt), '']);
  } else {
    var pr = C.d.parties.map(function (p) { return [p, partyBalance(C, p)]; }).filter(function (x) { return Math.abs(x[1]) > 0; });
    h += table([['Party'], ['Type'], ['Phone'], ['Balance', 'r'], ['Meaning']], pr.map(function (x) { var cu = x[0].type === 'customer'; return [esc(x[0].name), cu ? 'Customer' : 'Supplier', esc(x[0].phone || ''), money(Math.abs(x[1])), x[1] > 0 ? (cu ? 'Customer owes you' : 'You owe supplier') : (cu ? 'Advance from customer' : 'Advance to supplier')]; }), 'Nothing outstanding.', (function () { var rcv = sumBy(pr.filter(function (x) { return x[0].type === 'customer' && x[1] > 0; }), function (x) { return x[1]; }), pyb = sumBy(pr.filter(function (x) { return x[0].type === 'supplier' && x[1] > 0; }), function (x) { return x[1]; }); return ['Total', '', '', money(rcv) + ' to get · ' + money(pyb) + ' to pay', '']; })(), pr.map(function (x) { return ['ledger', x[0].id]; }));
  }
  return h + '</div>';
}

function gstSummary(C, r) {
  var h = '';
  if (C.scheme !== 'regular') {
    var turn = sumF(docsIn('invoice', r.from, r.to), function (d) { return d.sub; }) - sumF(docsIn('creditnote', r.from, r.to), function (d) { return d.sub; });
    return '<div class="hint">' + (C.scheme === 'composition' ? 'Composition scheme: no input credit and no tax on invoices. Pay tax on turnover at your composition rate (for example 1% for traders). Turnover for this period: ' + money(turn) + '.' : 'No tax company: GST reports are not applicable.') + '</div>';
  }
  var tot = function (list, sign) { return { cg: sign * sumF(list, function (d) { return d.cgst; }), sg: sign * sumF(list, function (d) { return d.sgst; }), ig: sign * sumF(list, function (d) { return d.igst; }), tx: sign * sumF(list, function (d) { return d.sub; }) }; };
  var rows = [['Sales invoices', tot(docsIn('invoice', r.from, r.to), 1)], ['Debit notes (extra charge)', tot(docsIn('debitnote', r.from, r.to), 1)], ['Credit notes (returns)', tot(docsIn('creditnote', r.from, r.to), -1)]];
  var o = { cg: 0, sg: 0, ig: 0, tx: 0 }; rows.forEach(function (x) { for (var k in o) o[k] += x[1][k]; });
  var rows2 = [['Purchase invoices', tot(docsIn('pinvoice', r.from, r.to), 1)], ['Purchase returns', tot(docsIn('preturn', r.from, r.to), -1)]];
  var i = { cg: 0, sg: 0, ig: 0, tx: 0 }; rows2.forEach(function (x) { for (var k in i) i[k] += x[1][k]; });
  var line = function (n, x) { return [esc(n), money(x.tx), money(x.cg), money(x.sg), money(x.ig)]; };
  var head = [['Source'], ['Taxable value', 'r'], ['CGST', 'r'], ['SGST', 'r'], ['IGST', 'r']];
  h += '<h2>Output tax (collected)</h2>' + table(head, rows.map(function (x) { return line(x[0], x[1]); }), '', line('Total output tax', o).map(function (c) { return '<b>' + c + '</b>'; }));
  h += '<h2>Input tax credit (paid)</h2>' + table(head, rows2.map(function (x) { return line(x[0], x[1]); }), '', line('Total input credit', i).map(function (c) { return '<b>' + c + '</b>'; }));
  var net = { cg: o.cg - i.cg, sg: o.sg - i.sg, ig: o.ig - i.ig };
  h += '<div class="grid">' + kpi('Net CGST payable', money(net.cg), net.cg < 0 ? 'Credit carried forward' : 'To pay') + kpi('Net SGST payable', money(net.sg), net.sg < 0 ? 'Credit carried forward' : 'To pay') + kpi('Net IGST payable', money(net.ig), net.ig < 0 ? 'Credit carried forward' : 'To pay') + kpi('Total GST payable', money(net.cg + net.sg + net.ig), 'Output minus input credit') + '</div><div class="note">For the exact amount to pay after the legal set-off order, open the GSTR-3B tab. Check the figures with your accountant before filing.</div>';
  return h;
}

/* GSTR-1 */
function gstr1H(C, r) {
  var sub = S.tab.gstr || 'b2b', h = tabsH([['b2b', 'B2B'], ['b2cl', 'B2C Large'], ['b2cs', 'B2C Small'], ['cdn', 'Credit / Debit Notes'], ['nil', 'Nil Rated'], ['hsn', 'HSN Summary'], ['docs', 'Documents Issued']], sub, 'subtab');
  h += '<div class="note">Due on the 11th of next month (monthly filers). These tables follow the tables of the GSTR-1 form so you can key them into the GST portal or give them to your accountant.</div>';
  var invs = docsIn('invoice', r.from, r.to), head1, body, ids = null;
  if (C.scheme === 'regular') h += '<div class="row" style="margin:8px 0">' + btn('gstr1Pop', 'Download GSTR-1 JSON for the GST portal', {}, 'pri') + btn('einvBulk', 'E-invoice JSON (all B2B bills)', {}, 'line') + btn('ewbBulk', 'E-way bill JSON (bills with transport details)', {}, 'line') + '</div>';
  if (sub === 'b2b') {
    head1 = [['GSTIN'], ['Customer'], ['Invoice'], ['Date'], ['Invoice value', 'r'], ['Place of supply'], ['Rate', 'r'], ['Taxable', 'r'], ['IGST', 'r'], ['CGST', 'r'], ['SGST', 'r']]; body = []; ids = [];
    invs.filter(function (d) { return isReg(partyById(C, d.partyId)); }).sort(function (a, b) { return a.date.localeCompare(b.date); }).forEach(function (d) {
      var p = partyById(C, d.partyId);
      rateRows(d).forEach(function (x) { body.push([p.gstin, p.name, d.no, dmy(d.date), money(d.total), posLabel(p.state), x.rate + '%', money(x.t), money(x.ig), money(x.cg), money(x.sg)]); ids.push(['view', d.id]); });
    });
  } else if (sub === 'b2cl') {
    head1 = [['Invoice'], ['Date'], ['Invoice value', 'r'], ['Place of supply'], ['Rate', 'r'], ['Taxable', 'r'], ['IGST', 'r']]; body = []; ids = [];
    invs.filter(function (d) { return !isReg(partyById(C, d.partyId)) && d.inter && d.total > 10000000; }).forEach(function (d) {
      var p = partyById(C, d.partyId) || {};
      rateRows(d).forEach(function (x) { body.push([d.no, dmy(d.date), money(d.total), posLabel(p.state), x.rate + '%', money(x.t), money(x.ig)]); ids.push(['view', d.id]); });
    });
  } else if (sub === 'b2cs') {
    head1 = [['Type'], ['Place of supply'], ['Rate', 'r'], ['Taxable', 'r'], ['IGST', 'r'], ['CGST', 'r'], ['SGST', 'r']];
    var agg = {};
    invs.filter(function (d) { return !isReg(partyById(C, d.partyId)) && !(d.inter && d.total > 10000000); }).forEach(function (d) {
      var p = partyById(C, d.partyId) || {};
      rateRows(d).forEach(function (x) { var k = (p.state || C.state) + '|' + x.rate, o = agg[k] = agg[k] || { s: p.state || C.state, rate: x.rate, t: 0, ig: 0, cg: 0, sg: 0 }; o.t += x.t; o.ig += x.ig; o.cg += x.cg; o.sg += x.sg; });
    });
    docsIn('creditnote', r.from, r.to).filter(function (d) { return !isReg(partyById(C, d.partyId)) && !b2clNote(C, d); }).concat(docsIn('debitnote', r.from, r.to).filter(function (d) { return !isReg(partyById(C, d.partyId)) && !b2clNote(C, d); })).forEach(function (d) {
      var p = partyById(C, d.partyId) || {}, sg = d.type === 'creditnote' ? -1 : 1;
      rateRows(d).forEach(function (x) { var k = (p.state || C.state) + '|' + x.rate, o = agg[k] = agg[k] || { s: p.state || C.state, rate: x.rate, t: 0, ig: 0, cg: 0, sg: 0 }; o.t += sg * x.t; o.ig += sg * x.ig; o.cg += sg * x.cg; o.sg += sg * x.sg; });
    });
    body = Object.keys(agg).sort().map(function (k) { var o = agg[k]; return ['OE', posLabel(o.s), o.rate + '%', money(o.t), money(o.ig), money(o.cg), money(o.sg)]; });
  } else if (sub === 'cdn') {
    head1 = [['Type'], ['Note'], ['Date'], ['Customer'], ['GSTIN'], ['Against'], ['Rate', 'r'], ['Taxable', 'r'], ['IGST', 'r'], ['CGST', 'r'], ['SGST', 'r']]; body = []; ids = [];
    docsIn('creditnote', r.from, r.to).concat(docsIn('debitnote', r.from, r.to)).sort(function (a, b) { return a.date.localeCompare(b.date); }).forEach(function (d) {
      var p = partyById(C, d.partyId) || {}, src = d.refId ? docById(C, d.refId) : null;
      rateRows(d).forEach(function (x) { body.push([d.type === 'creditnote' ? 'Credit' : 'Debit', d.no, dmy(d.date), p.name || '-', p.gstin || '', src ? src.no : '-', x.rate + '%', money(x.t), money(x.ig), money(x.cg), money(x.sg)]); ids.push(['view', d.id]); });
    });
  } else if (sub === 'nil') {
    var n = calc3b(C, r.from, r.to).nilSplit;
    head1 = [['Description'], ['Nil rated supplies', 'r']];
    body = [['Inter-State supplies to registered persons', money(n.outReg)], ['Inter-State supplies to unregistered persons', money(n.outUnreg)], ['Intra-State supplies to registered persons', money(n.inReg)], ['Intra-State supplies to unregistered persons', money(n.inUnreg)]];
  } else if (sub === 'hsn') {
    return h + '<div class="note">Table 12. Same as the HSN / SAC tab.</div>' + hsnTable('s', r.from, r.to);
  } else {
    head1 = [['Document type'], ['From'], ['To'], ['Total issued', 'r'], ['Cancelled', 'r'], ['Net issued', 'r']]; body = [];
    [['invoice', 'Invoices for outward supply'], ['creditnote', 'Credit notes'], ['debitnote', 'Debit notes']].forEach(function (tp) {
      var all = C.d.docs.filter(function (d) { return d.type === tp[0] && d.date >= r.from && d.date <= r.to; }).sort(function (a, b) { return a.no.localeCompare(b.no); });
      if (all.length) { var can = all.filter(function (d) { return d.cancelled; }).length; body.push([tp[1], all[0].no, all[all.length - 1].no, String(all.length), String(can), String(all.length - can)]); }
    });
  }
  CSV = csvOf(head1.map(function (x) { return x[0]; }), body);
  h += table(head1, body.map(function (r2) { return r2.map(function (c) { return esc(c); }); }), 'No data in this period.', null, ids && ids.length ? ids : null);
  if (body.length) h += '<div>' + btn('showCsv', 'Show as CSV to copy', {}, 'sm') + '</div>';
  return h;
}

/* GSTR-3B */
function gstr3bH(C, r) {
  var x = calc3b(C, r.from, r.to), h = '', o = x.out;
  h += '<div class="note">Due on the 20th of next month (monthly filers). Figures come from your posted bills. Match your purchase credit with GSTR-2B on the portal before you claim it.</div>';
  h += '<h2>3.1 Outward supplies and inward supplies liable to reverse charge</h2>' + table([['Nature of supply'], ['Taxable value', 'r'], ['IGST', 'r'], ['CGST', 'r'], ['SGST', 'r']], [
    ['(a) Outward taxable supplies (other than zero rated, nil rated, exempt)', money(o.tx), money(o.ig), money(o.cg), money(o.sg)],
    ['(b) Outward taxable supplies (zero rated)', money(0), money(0), '', ''],
    ['(c) Other outward supplies (nil rated, exempt)', money(x.nil), '', '', ''],
    ['(d) Inward supplies (liable to reverse charge)', money(0), money(0), money(0), money(0)],
    ['(e) Non-GST outward supplies', money(0), '', '', '']]);
  var pk = Object.keys(x.pos).sort();
  h += '<h2>3.2 Inter-State supplies to unregistered persons</h2>' + table([['Place of supply'], ['Taxable value', 'r'], ['IGST', 'r']], pk.map(function (k) { return [esc(posLabel(k)), money(x.pos[k].t), money(x.pos[k].ig)]; }), 'No inter-State supplies to unregistered persons.');
  h += '<h2>4. Eligible ITC</h2>' + table([['Details'], ['IGST', 'r'], ['CGST', 'r'], ['SGST', 'r']], [
    ['(A)(5) All other ITC (from your purchase bills)', money(x.itc.ig), money(x.itc.cg), money(x.itc.sg)],
    ['ITC brought forward from earlier months', money(x.bf.ig || 0), money(x.bf.cg || 0), money(x.bf.sg || 0)],
    ['(B) ITC reversed', money(0), money(0), money(0)],
    ['<b>(C) Net ITC available</b>', '<b>' + money(x.credit.ig) + '</b>', '<b>' + money(x.credit.cg) + '</b>', '<b>' + money(x.credit.sg) + '</b>'],
    ['Of this, matched with GSTR-2B (you ticked it in the Purchases tab)', money(x.itcM.ig), money(x.itcM.cg), money(x.itcM.sg)],
    ['Of this, not yet matched with GSTR-2B (check before claiming)', money(x.itc.ig - x.itcM.ig), money(x.itc.cg - x.itcM.cg), money(x.itc.sg - x.itcM.sg)]]);
  h += '<h2>5. Inward supplies from composition, exempt, nil rated suppliers</h2>' + table([['Nature of supply'], ['Inter-State', 'r'], ['Intra-State', 'r']], [['Nil rated and exempt inward supplies', money(x.inNil.inter), money(x.inNil.intra)]]);
  var so = x.setoff, rows = [];
  [['ig', 'IGST'], ['cg', 'CGST'], ['sg', 'SGST']].forEach(function (hd) {
    var p = so.pay[hd[0]], liab = Math.max(0, o[hd[0]]);
    rows.push([hd[1], money(liab), money(p.ig), money(p.cg), money(p.sg), '<b>' + money(so.cash[hd[0]]) + '</b>']);
  });
  h += '<h2>6.1 Payment of tax</h2>' + table([['Tax head'], ['Tax payable', 'r'], ['Paid by IGST credit', 'r'], ['Paid by CGST credit', 'r'], ['Paid by SGST credit', 'r'], ['Paid in cash', 'r']], rows, '', ['Total', money(Math.max(0, o.ig) + Math.max(0, o.cg) + Math.max(0, o.sg)), '', '', '', '<b>' + money(so.cash.ig + so.cash.cg + so.cash.sg) + '</b>']);
  h += '<div class="grid">' + kpi('Pay in cash', money(so.cash.ig + so.cash.cg + so.cash.sg), 'After using input credit') + kpi('Credit carried forward', money(so.carry.ig + so.carry.cg + so.carry.sg), 'IGST ' + money(so.carry.ig) + ' · CGST ' + money(so.carry.cg) + ' · SGST ' + money(so.carry.sg)) + '</div>';
  if (role() === 'owner' || role() === 'manager') h += '<form data-submit="saveBf" class="card" style="background:var(--bg)"><h2>ITC brought forward</h2><div class="note">Credit left over from your last filed GSTR-3B. It is added to this report. Change it when you change the period.</div><div class="fg">' + field('IGST', '<input name="ig" type="number" step="any" min="0" value="' + rs((C.itcBf || {}).ig || 0) + '">') + field('CGST', '<input name="cg" type="number" step="any" min="0" value="' + rs((C.itcBf || {}).cg || 0) + '">') + field('SGST', '<input name="sg" type="number" step="any" min="0" value="' + rs((C.itcBf || {}).sg || 0) + '">') + '</div><div><button class="btn" type="submit">Save</button></div></form>';
  h += '<div class="note">Not included: reverse charge, imports, ITC reversals and interest or late fee. Add those on the portal.</div>';
  return h;
}

/* GSTR-2 style purchase register with GSTR-2B tick */
function purRegH(C, r) {
  var list = docsIn('pinvoice', r.from, r.to).concat(docsIn('preturn', r.from, r.to)).sort(function (a, b) { return a.date.localeCompare(b.date); });
  var sg = function (d) { return d.type === 'preturn' ? -1 : 1; };
  var itcOf = function (d) { return sg(d) * (d.cgst + d.sgst + d.igst); };
  var tot = sumF(list, itcOf), mt = sumF(list.filter(function (d) { return d.m2b; }), itcOf);
  var h = '<div class="note">GSTR-2 is no longer filed. The portal gives you GSTR-2B instead. Tick each bill that you find in your GSTR-2B so you claim only matched credit. Supplier bill no. is entered on the purchase invoice.</div>';
  h += '<div class="grid">' + kpi('Purchase credit (ITC)', money(tot), list.length + ' document(s)') + kpi('Matched with GSTR-2B', money(mt), list.filter(function (d) { return d.m2b; }).length + ' ticked') + kpi('Not matched yet', money(tot - mt), 'Claim only after it shows in 2B', tot - mt > 0) + '</div>';
  h += table([['Date'], ['Supplier'], ['GSTIN'], ['Our no'], ['Supplier bill no'], ['Taxable', 'r'], ['IGST', 'r'], ['CGST', 'r'], ['SGST', 'r'], ['Total', 'r'], ['In GSTR-2B?']], list.map(function (d) {
    var p = partyById(C, d.partyId) || {}, s = sg(d);
    return [dmy(d.date), esc(p.name || '-'), esc(p.gstin || '-'), '<b>' + esc(d.no) + '</b>', esc(d.sno || ''), money(s * d.sub), money(s * d.igst), money(s * d.cgst), money(s * d.sgst), money(s * d.total), '<label class="ck"><input type="checkbox" data-chg="m2b" data-id="' + d.id + '"' + (d.m2b ? ' checked' : '') + ' aria-label="Found in GSTR-2B"><span>' + (d.m2b ? 'Yes' : 'No') + '</span></label>'];
  }), 'No purchase documents in this period.', list.length ? ['Total', '', '', '', '', money(sumF(list, function (d) { return sg(d) * d.sub; })), money(sumF(list, function (d) { return sg(d) * d.igst; })), money(sumF(list, function (d) { return sg(d) * d.cgst; })), money(sumF(list, function (d) { return sg(d) * d.sgst; })), money(sumF(list, function (d) { return sg(d) * d.total; })), ''] : null, list.map(function (d) { return ['view', d.id]; }));
  return h;
}

/* GSTR-9 workings for a financial year */
function fyRange(y) { return { from: y + '-04-01', to: (y + 1) + '-03-31' }; }
function gstr9H(C) {
  var ys = g9Years(), y = +(S.tab.g9y || ys[0]); if (ys.indexOf(y) < 0) y = ys[0];
  var fr = fyRange(y), rv = (C.g9 && C.g9[y]) || { ig: 0, cg: 0, sg: 0 };
  var h = '<div class="row"><label class="fld"><span>Financial year</span><select class="inp" data-chg="g9y">' + ys.map(function (v) { return '<option value="' + v + '"' + (v === y ? ' selected' : '') + '>' + String(v) + '-' + String(v + 1).slice(2) + '</option>'; }).join('') + '</select></label></div>';
  h += '<div class="note">Workings to fill GSTR-9 (annual return) on the GST portal. GSTR-9 is optional below 2 crore yearly turnover and compulsory above it. Above 5 crore you also need GSTR-9C from a CA. Month-wise figures are worked out from your bills and may differ from what you actually filed, so check each line.</div>';
  var inv = docsIn('invoice', fr.from, fr.to), dn = docsIn('debitnote', fr.from, fr.to), cn = docsIn('creditnote', fr.from, fr.to);
  var line = function (list) { return { t: sumF(list, function (d) { return d.sub; }), ig: sumF(list, function (d) { return d.igst; }), cg: sumF(list, function (d) { return d.cgst; }), sg: sumF(list, function (d) { return d.sgst; }) }; };
  var taxedItems = function (list) { var t = 0; list.forEach(function (d) { (d.items || []).forEach(function (it) { if ((+it.gst || 0) > 0) t += it.taxable; }); }); return t; };
  var b2b = inv.filter(function (d) { return isReg(partyById(C, d.partyId)); }), b2c = inv.filter(function (d) { return !isReg(partyById(C, d.partyId)); });
  var lb2b = line(b2b), lb2c = line(b2c), lcn = line(cn), ldn = line(dn);
  var nilV = 0; inv.concat(dn).forEach(function (d) { d.items.forEach(function (it) { if (!((+it.gst || 0) > 0)) nilV += it.taxable; }); }); cn.forEach(function (d) { d.items.forEach(function (it) { if (!((+it.gst || 0) > 0)) nilV -= it.taxable; }); });
  var fm = function (a) { return [money(a.t), money(a.ig), money(a.cg), money(a.sg)]; };
  var tx = { t: taxedItems(inv) + taxedItems(dn) - taxedItems(cn), ig: lb2b.ig + lb2c.ig + ldn.ig - lcn.ig, cg: lb2b.cg + lb2c.cg + ldn.cg - lcn.cg, sg: lb2b.sg + lb2c.sg + ldn.sg - lcn.sg };
  h += '<h2>Part II. Outward supplies declared (Table 4)</h2>' + table([['Description'], ['Taxable value', 'r'], ['IGST', 'r'], ['CGST', 'r'], ['SGST', 'r']], [
    ['4A Supplies to unregistered persons (B2C)'].concat(fm(lb2c)), ['4B Supplies to registered persons (B2B)'].concat(fm(lb2b)), ['4C Zero rated supply (export) on payment of tax', money(0), money(0), '', ''], ['4D Supply to SEZs on payment of tax', money(0), money(0), '', ''], ['4G Inward supplies on which tax is payable on reverse charge', money(0), money(0), money(0), money(0)],
    ['4I Credit notes issued (reduce)'].concat(fm(lcn)), ['4J Debit notes issued (add)'].concat(fm(ldn)),
    ['<b>4N Total taxable outward supplies</b>', '<b>' + money(tx.t) + '</b>', '<b>' + money(tx.ig) + '</b>', '<b>' + money(tx.cg) + '</b>', '<b>' + money(tx.sg) + '</b>']]);
  h += '<h2>Part II. Supplies on which no tax is payable (Table 5)</h2>' + table([['Description'], ['Value', 'r']], [['5A Zero rated supply (export) without payment of tax', money(0)], ['5D Exempted', money(0)], ['5E Nil rated', money(nilV)], ['5F Non-GST supply', money(0)]]);
  var itc = { ig: 0, cg: 0, sg: 0 }, inputs = { ig: 0, cg: 0, sg: 0 }, serv = { ig: 0, cg: 0, sg: 0 };
  [['pinvoice', 1], ['preturn', -1]].forEach(function (tp) { docsIn(tp[0], fr.from, fr.to).forEach(function (d) { d.items.forEach(function (it) { var tgt = /^99/.test(it.hsn || '') ? serv : inputs; tgt.ig += tp[1] * (it.igst || 0); tgt.cg += tp[1] * (it.cgst || 0); tgt.sg += tp[1] * (it.sgst || 0); }); }); });
  itc.ig = inputs.ig + serv.ig; itc.cg = inputs.cg + serv.cg; itc.sg = inputs.sg + serv.sg;
  var fi = function (a) { return [money(a.ig), money(a.cg), money(a.sg)]; };
  var net = { ig: itc.ig - (rv.ig || 0), cg: itc.cg - (rv.cg || 0), sg: itc.sg - (rv.sg || 0) };
  h += '<h2>Part III. Input tax credit (Tables 6 and 7)</h2>' + table([['Description'], ['IGST', 'r'], ['CGST', 'r'], ['SGST', 'r']], [
    ['6B(1) Inputs (goods)'].concat(fi(inputs)), ['6B(2) Capital goods', money(0), money(0), money(0)], ['6B(3) Input services'].concat(fi(serv)), ['<b>6A Total ITC availed (as per your bills)</b>'].concat(fi(itc).map(function (c) { return '<b>' + c + '</b>'; })),
    ['7 ITC reversed (you enter this below)', money(rv.ig || 0), money(rv.cg || 0), money(rv.sg || 0)], ['<b>Net ITC available for utilisation</b>'].concat(fi(net).map(function (c) { return '<b>' + c + '</b>'; }))]);
  /* Part IV: month by month set-off with carry forward of credit */
  var paid = { ig: 0, cg: 0, sg: 0 }, itcUsed = { ig: 0, cg: 0, sg: 0 }, carry = { ig: 0, cg: 0, sg: 0 }, liab = { ig: 0, cg: 0, sg: 0 }, t0 = today();
  for (var m = 0; m < 12; m++) {
    var ms = addMonths(fr.from, m); if (ms > t0 && m > 0) break;
    var me = lastDayOf(ms), mo = calc3bPlain(C, ms, me);
    var cr = { ig: Math.max(0, mo.itc.ig + carry.ig), cg: Math.max(0, mo.itc.cg + carry.cg), sg: Math.max(0, mo.itc.sg + carry.sg) };
    var sf = setoff({ ig: Math.max(0, mo.out.ig), cg: Math.max(0, mo.out.cg), sg: Math.max(0, mo.out.sg) }, cr);
    ['ig', 'cg', 'sg'].forEach(function (k) { liab[k] += Math.max(0, mo.out[k]); paid[k] += sf.cash[k]; carry[k] = sf.carry[k]; itcUsed[k] += sf.pay.ig[k] + sf.pay.cg[k] + sf.pay.sg[k]; });
  }
  h += '<h2>Part IV. Tax paid (Table 9)</h2>' + table([['Tax head'], ['Tax payable', 'r'], ['Paid through ITC', 'r'], ['Paid in cash', 'r']], [['IGST', money(liab.ig), money(itcUsed.ig), money(paid.ig)], ['CGST', money(liab.cg), money(itcUsed.cg), money(paid.cg)], ['SGST', money(liab.sg), money(itcUsed.sg), money(paid.sg)]], '', ['Total', money(liab.ig + liab.cg + liab.sg), money(itcUsed.ig + itcUsed.cg + itcUsed.sg), money(paid.ig + paid.cg + paid.sg)]);
  h += '<div class="note">Part IV is worked out month by month with the legal set-off order and credit carried forward. If the amounts you actually paid were different, use your filed GSTR-3B figures on the portal.</div>';
  h += '<h2>Part V and VI. HSN summary, outward (Table 17)</h2>' + hsnTable('s', fr.from, fr.to) + '<h2>HSN summary, inward (Table 18)</h2>' + hsnTable('p', fr.from, fr.to);
  var aggT = sumF(inv, function (d) { return d.sub; }) + sumF(dn, function (d) { return d.sub; }) - sumF(cn, function (d) { return d.sub; });
  h += '<div class="grid">' + kpi('Yearly turnover (excl. tax)', money(aggT), aggT > 20000000000 ? 'Above 2 crore: GSTR-9 is compulsory' : 'Up to 2 crore: GSTR-9 is optional') + '</div>';
  if (role() === 'owner' || role() === 'manager') h += '<form data-submit="saveG9" class="card" style="background:var(--bg)"><input type="hidden" name="y" value="' + y + '"><h2>ITC reversed in this year (Table 7)</h2><div class="note">Enter the credit you reversed or that was blocked, for example on personal use items. It reduces the net credit above.</div><div class="fg">' + field('IGST', '<input name="ig" type="number" step="any" min="0" value="' + rs(rv.ig || 0) + '">') + field('CGST', '<input name="cg" type="number" step="any" min="0" value="' + rs(rv.cg || 0) + '">') + field('SGST', '<input name="sg" type="number" step="any" min="0" value="' + rs(rv.sg || 0) + '">') + '</div><div><button class="btn" type="submit">Save</button></div></form>';
  return h;
}
/* same as calc3b but without carry-forward and manual brought-forward, for yearly workings */
function calc3bPlain(C, from, to) {
  var a = { ig: 0, cg: 0, sg: 0 }, itc = { ig: 0, cg: 0, sg: 0 };
  [['invoice', 1], ['debitnote', 1], ['creditnote', -1]].forEach(function (tp) { docsIn(tp[0], from, to).forEach(function (d) { (d.items || []).forEach(function (it) { if ((+it.gst || 0) > 0) { a.ig += tp[1] * (it.igst || 0); a.cg += tp[1] * (it.cgst || 0); a.sg += tp[1] * (it.sgst || 0); } }); }); });
  if (C.scheme === 'regular') [['pinvoice', 1], ['preturn', -1]].forEach(function (tp) { docsIn(tp[0], from, to).forEach(function (d) { (d.items || []).forEach(function (it) { if ((+it.gst || 0) > 0) { itc.ig += tp[1] * (it.igst || 0); itc.cg += tp[1] * (it.cgst || 0); itc.sg += tp[1] * (it.sgst || 0); } }); }); });
  return { out: a, itc: itc };
}

/* ---------- Today's report: simple business rules, worked out on this device from your own bills ---------- */
function netSales(C, a, b) {
  var s = 0;
  C.d.docs.forEach(function (d) {
    if (d.cancelled || d.date < a || d.date > b) return;
    if (d.type === 'invoice' || d.type === 'debitnote') s += d.total; else if (d.type === 'creditnote') s -= d.total;
  });
  return s;
}
function pctChange(a, b) { return b ? Math.round((a - b) / b * 100) : 0; }
function monthStart(s) { return s.slice(0, 8) + '01'; }
function addMonths(s, n) { var d = new Date(s.slice(0, 7) + '-01T00:00:00'); d.setMonth(d.getMonth() + n); return ymd(d); }
function lastDayOf(s) { var d = new Date(s.slice(0, 7) + '-01T00:00:00'); d.setMonth(d.getMonth() + 1); d.setDate(0); return ymd(d); }
var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
function nameList(arr, n) { return arr.slice(0, n).join(', ') + (arr.length > n ? ' and ' + (arr.length - n) + ' more' : ''); }

function insights(C) {
  var out = [], t = today(), d = C.d;
  var inv = d.docs.filter(function (x) { return x.type === 'invoice' && !x.cancelled; });
  if (!inv.length) return out;
  function add(pri, kind, title, text, act) { out.push({ pri: pri, kind: kind, title: title, text: text, act: act || null }); }
  var isWalk = function (id) { var p = partyById(C, id); return !p || p.name === 'Walk-in Customer'; };

  /* 1. sales this week against last week */
  var w1 = addDays(t, -6), w0 = addDays(t, -13), w0e = addDays(t, -7);
  var cw = netSales(C, w1, t), pw = netSales(C, w0, w0e);
  if (cw > 0 || pw > 0) {
    if (pw > 0) {
      var ch = pctChange(cw, pw);
      if (Math.abs(ch) < 3) add(5, 'info', 'Sales are steady this week', money(cw) + ' in the last 7 days, about the same as the 7 days before (' + money(pw) + ').', { act: 'nav', data: { v: 'sales' }, label: 'See sales' });
      else if (ch > 0) add(5, 'good', 'Sales are up ' + ch + '% this week', money(cw) + ' in the last 7 days against ' + money(pw) + ' in the 7 days before. Keep the stock ready for the items that are selling.', { act: 'nav', data: { v: 'sales' }, label: 'See sales' });
      else {
        var byP = {}; inv.concat(d.docs.filter(function (x) { return x.type === 'creditnote' && !x.cancelled; })).forEach(function (x) { var sg = x.type === 'creditnote' ? -1 : 1; if (x.date >= w1 && x.date <= t) byP[x.partyId] = (byP[x.partyId] || 0) + sg * x.total; else if (x.date >= w0 && x.date <= w0e) byP[x.partyId] = (byP[x.partyId] || 0) - sg * x.total; });
        var worst = Object.keys(byP).filter(function (k) { return !isWalk(k); }).sort(function (a, b) { return byP[a] - byP[b]; })[0];
        add(5, 'warn', 'Sales are down ' + Math.abs(ch) + '% this week', money(cw) + ' in the last 7 days against ' + money(pw) + ' in the 7 days before.' + (worst && byP[worst] < 0 ? ' Biggest drop: ' + partyName(C, worst) + ' (' + money(-byP[worst]) + ' less). Call them.' : ''), { act: 'nav', data: { v: 'sales' }, label: 'See sales' });
      }
    } else add(5, 'good', money(cw) + ' sales this week', 'There were no sales in the 7 days before.', { act: 'nav', data: { v: 'sales' }, label: 'See sales' });
  } else {
    var lastInv = inv.slice().sort(function (a, b) { return b.date.localeCompare(a.date); })[0];
    if (lastInv) { var gap = Math.round((new Date(t) - new Date(lastInv.date)) / 86400000); if (gap >= 14) add(5, 'warn', 'No bills for ' + gap + ' days', 'Your last bill was on ' + dmy(lastInv.date) + '. Message your regular customers today.', { act: 'nav', data: { v: 'quick' }, label: 'Make a bill' }); }
  }

  /* 2. money to collect */
  var over = inv.filter(function (x) { return x.due < t && outstanding(C, x) > 0; });
  if (over.length) {
    var op = {}; over.forEach(function (x) { op[x.partyId] = (op[x.partyId] || 0) + outstanding(C, x); });
    var ok = Object.keys(op).sort(function (a, b) { return op[b] - op[a]; });
    add(10, 'warn', money(over.reduce(function (s, x) { return s + outstanding(C, x); }, 0)) + ' overdue from ' + ok.length + ' customer' + (ok.length > 1 ? 's' : ''), 'Call first: ' + nameList(ok.map(function (k) { return partyName(C, k) + ' (' + money(op[k]) + ')'; }), 3) + '.', { act: 'goRecv', data: {}, label: 'See who owes' });
  }

  /* 3. GST filing reminder (monthly filers) */
  if (C.scheme === 'regular') {
    var dd = +t.slice(8, 10), pm = addMonths(t, -1), pmFrom = monthStart(pm), pmTo = lastDayOf(pm);
    if (dd <= 20 && netSalesOrBuys(C, pmFrom, pmTo)) {
      var est = calc3b(C, pmFrom, pmTo), due = dd <= 11 ? 11 : 20, left = due - dd, nm = MONTHS[+pm.slice(5, 7) - 1] + ' ' + pm.slice(0, 4);
      var cash = est.cash.ig + est.cash.cg + est.cash.sg;
      add(left <= 3 ? 8 : 18, left <= 3 ? 'warn' : 'info', (dd <= 11 ? 'GSTR-1' : 'GSTR-3B') + ' for ' + nm + ' is due on ' + due + (left <= 0 ? ' (today)' : ' (' + left + ' day' + (left > 1 ? 's' : '') + ' left)'), 'Estimated GST to pay in cash for ' + nm + ': ' + money(cash) + '. If you file quarterly, ignore this. Check with your accountant before filing.', { act: 'goGst', data: { t: dd <= 11 ? 'gstr1' : 'gstr3b' }, label: 'Open report' });
    }
  }

  /* 3b. expiring stock */
  var exl = expiryList(C, 30);
  if (exl.length) {
    var gone = exl.filter(function (x) { return x.r.exp < t; }), soon = exl.length - gone.length;
    add(gone.length ? 9 : 19, 'warn', gone.length ? gone.length + ' batch' + (gone.length > 1 ? 'es have' : ' has') + ' expired' : soon + ' batch' + (soon > 1 ? 'es expire' : ' expires') + ' within 30 days', nameList(exl.map(function (x) { return x.p.name + ' ' + (x.r.batch || '') + ' (' + (x.r.exp < t ? 'expired' : expF(x.r.exp)) + ')'; }), 3) + '.', { act: 'goBatches', data: {}, label: 'See batches' });
  }
  /* 4. stock running out */
  var low = lowItems(C);
  if (low.length) add(20, 'warn', low.length + ' item' + (low.length > 1 ? 's' : '') + ' running low', 'Order soon: ' + nameList(low.map(function (p) { return p.name + ' (' + qtyF(Math.max(0, stockQty(C, p.id))) + ' left)'; }), 3) + '.', canWrite('purchases', 'po') ? { act: 'poFromLow', data: {}, label: 'Make purchase order' } : { act: 'nav', data: { v: 'inventory' }, label: 'See stock' });

  /* 5. expenses and profit margin */
  var ms = monthStart(t), pms = addMonths(ms, -1), pme = pms.slice(0, 8) + String(Math.min(+t.slice(8, 10), +lastDayOf(pms).slice(8, 10))).padStart(2, '0');
  var ex = function (a, b) { var m = {}, s = 0; d.expenses.forEach(function (e) { if (e.kind === 'expense' && e.date >= a && e.date <= b) { m[e.cat] = (m[e.cat] || 0) + e.amount; s += e.amount; } }); return { s: s, m: m }; };
  var e1 = ex(ms, t), e0 = ex(pms, pme);
  if (e0.s > 0 && e1.s > e0.s * 1.25 && e1.s - e0.s >= 50000) {
    var topc = Object.keys(e1.m).sort(function (a, b) { return e1.m[b] - e1.m[a]; })[0];
    add(35, 'warn', 'Expenses are up ' + pctChange(e1.s, e0.s) + '% this month', money(e1.s) + ' so far, against ' + money(e0.s) + ' in the same days last month. Biggest: ' + topc + ' (' + money(e1.m[topc]) + ').', { act: 'goExp', data: {}, label: 'See expenses' });
  }
  var mg = function (a, b) {
    var rev = 0, cogs = 0;
    inv.forEach(function (x) { if (x.date >= a && x.date <= b) rev += x.sub; });
    d.docs.forEach(function (x) { if (x.type === 'creditnote' && !x.cancelled && x.date >= a && x.date <= b) rev -= x.sub; });
    d.moves.forEach(function (m) { if ((m.type === 'sale' || m.type === 'salereturn') && m.date >= a && m.date <= b) cogs -= m.qty * m.cost; });
    return { rev: rev, cogs: cogs, pct: rev > 0 ? (rev - cogs) / rev * 100 : null };
  };
  var m1 = mg(addDays(t, -29), t), m0 = mg(addDays(t, -59), addDays(t, -30));
  if (m1.pct !== null && m0.pct !== null && m1.cogs > 0 && m0.cogs > 0 && m0.pct - m1.pct >= 3) add(38, 'warn', 'Profit margin fell to ' + Math.round(m1.pct) + '%', 'It was ' + Math.round(m0.pct) + '% in the 30 days before. Check your selling prices and what your suppliers now charge.', { act: 'nav', data: { v: 'gst' }, label: 'See profit report' });

  /* 6. regular customers gone quiet */
  var stat = {};
  inv.forEach(function (x) { if (isWalk(x.partyId)) return; var o = stat[x.partyId] = stat[x.partyId] || { n: 0, last: '', sum: 0 }; o.n++; o.sum += x.total; if (x.date > o.last) o.last = x.date; });
  var quiet = Object.keys(stat).filter(function (k) { return stat[k].n >= 2 && stat[k].last < addDays(t, -45); }).sort(function (a, b) { return stat[b].sum - stat[a].sum; });
  if (quiet.length) add(40, 'info', quiet.length + ' regular customer' + (quiet.length > 1 ? 's' : '') + ' have not bought for 45+ days', 'Call: ' + nameList(quiet.map(function (k) { return partyName(C, k) + ' (' + Math.round((new Date(t) - new Date(stat[k].last)) / 86400000) + ' days)'; }), 3) + '.', { act: 'nav', data: { v: 'parties' }, label: 'Open customers' });

  /* 7. stock that does not sell */
  var dead = [], deadVal = 0;
  d.products.forEach(function (p) {
    if (!p.tracked) return; var q = stockQty(C, p.id); if (q <= 0) return;
    var lastSale = '', firstIn = '';
    d.moves.forEach(function (m) { if (m.pid !== p.id) return; if (m.type === 'sale' && m.date > lastSale) lastSale = m.date; if (m.qty > 0 && (!firstIn || m.date < firstIn)) firstIn = m.date; });
    var ref = lastSale || firstIn; if (ref && ref < addDays(t, -60)) { dead.push(p.name); deadVal += q * p.cost; }
  });
  if (dead.length && deadVal > 0) add(50, 'info', money(deadVal) + ' of stock is not selling', nameList(dead, 3) + ': no sale in 60 days. Offer a discount or bundle to turn it into cash.', { act: 'nav', data: { v: 'inventory' }, label: 'See stock' });

  /* 8. the 80/20 rule on the last 90 days */
  var since = addDays(t, -89), cs = {}, is = {}, ct = 0, it0 = 0;
  inv.forEach(function (x) {
    if (x.date < since) return;
    if (!isWalk(x.partyId)) { cs[x.partyId] = (cs[x.partyId] || 0) + x.total; ct += x.total; }
    x.items.forEach(function (it) { var k = it.pid || it.name; is[k] = is[k] || { n: it.name, v: 0 }; is[k].v += it.taxable; it0 += it.taxable; });
  });
  var top80 = function (map, total, nameFn) { var ks = Object.keys(map).sort(function (a, b) { return (map[b].v !== undefined ? map[b].v : map[b]) - (map[a].v !== undefined ? map[a].v : map[a]); }), acc = 0, pick = []; for (var i = 0; i < ks.length && acc < total * 0.8; i++) { acc += map[ks[i]].v !== undefined ? map[ks[i]].v : map[ks[i]]; pick.push(nameFn(ks[i])); } return { k: pick.length, n: ks.length, names: pick }; };
  if (Object.keys(cs).length >= 5 && ct > 0) { var r1 = top80(cs, ct, function (k) { return partyName(C, k); }); add(60, 'info', '80/20: ' + r1.k + ' of ' + r1.n + ' customers bring 80% of sales', 'Look after them first: ' + nameList(r1.names, 3) + '. Last 90 days.', { act: 'nav', data: { v: 'parties' }, label: 'Open customers' }); }
  if (Object.keys(is).length >= 5 && it0 > 0) { var r2 = top80(is, it0, function (k) { return is[k].n; }); add(65, 'info', '80/20: ' + r2.k + ' of ' + r2.n + ' items bring 80% of sales', 'Never run out of: ' + nameList(r2.names, 3) + '. Last 90 days.', { act: 'nav', data: { v: 'inventory' }, label: 'See items' }); }

  /* 9. best and slowest day of the week */
  var recentInv = inv.filter(function (x) { return x.date >= since; });
  if (recentInv.length >= 10) {
    var span = Math.round((new Date(t) - new Date(recentInv.reduce(function (m, x) { return x.date < m ? x.date : m; }, t))) / 86400000);
    if (span >= 21) {
      var wd = [0, 0, 0, 0, 0, 0, 0]; recentInv.forEach(function (x) { wd[new Date(x.date + 'T00:00:00').getDay()] += x.total; });
      var best = 0, worst2 = 0; for (var i = 1; i < 7; i++) { if (wd[i] > wd[best]) best = i; if (wd[i] < wd[worst2]) worst2 = i; }
      if (wd[best] > 0 && best !== worst2) add(70, 'info', 'Your best day is ' + DAYS[best], DAYS[best] + ' brings the most sales (' + money(wd[best]) + '); ' + DAYS[worst2] + ' is the slowest (' + money(wd[worst2]) + '). Plan offers for the slow day.', null);
    }
  }
  var rd = recDue(C); if (rd.length && canWrite('sales', 'invoice')) add(2, 'warn', rd.length + ' recurring invoice' + (rd.length > 1 ? 's are' : ' is') + ' due', 'Open Recurring invoices and press Create.', { act: 'recurUi', data: {}, label: 'Open recurring' });
  var wl = watchList(C, 7); if (wl.bad.length && role() === 'owner') add(2, 'warn', 'Check staff activity', wl.bad.map(function (s) { return s.n + ': ' + s.flag.replace(/; $/, ''); }).join(' | '), { act: 'nav', data: { v: 'settings' }, label: 'See staff check' });
  return out.sort(function (a, b) { return a.pri - b.pri; });
}
function netSalesOrBuys(C, a, b) { return C.d.docs.some(function (x) { return !x.cancelled && x.date >= a && x.date <= b && (x.type === 'invoice' || x.type === 'pinvoice'); }); }
function insH(i) {
  var cls = i.kind === 'warn' ? 'warn' : i.kind === 'good' ? 'good' : 'info';
  return '<div class="ins ' + cls + '"><b>' + esc(i.title) + '</b><div class="note">' + esc(i.text) + '</div>' + (i.act ? '<div>' + btn(i.act.act, i.act.label, i.act.data, 'sm line') + '</div>' : '') + '</div>';
}
function reportCard(C) {
  var list = insights(C);
  if (!list.length) return '';
  var all = !!S.showAllIns, shown = all ? list : list.slice(0, 3);
  return '<div class="card"><div class="bar"><h2>Today\'s report</h2><span class="note">Worked out from your own bills · ' + dmy(today()) + '</span></div><div class="insg">' + shown.map(insH).join('') + '</div>' +
    (list.length > 3 ? '<div>' + btn('moreIns', all ? 'Show less' : 'Show all ' + list.length + ' points', {}, 'sm line') + '</div>' : '') + '</div>';
}
function maybeDailyReport() {
  try {
    var C = cur(); if (!C || !DB.session || S.view !== 'dashboard' || !$('#modal').hidden) return;
    if (C.dailyPopup === false || C.lastReport === today() || role() === 'cashier') return;
    var list = insights(C); if (!list.length) return;
    C.lastReport = today(); save();
    modal('<div class="mh"><h2>Today\'s report</h2>' + btn('closeModal', 'Close', {}, 'sm line') + '</div><div class="note">' + esc(C.name) + ' · ' + dmy(today()) + '</div><div class="insg" style="grid-template-columns:1fr">' + list.slice(0, 5).map(insH).join('') + '</div><div class="row">' + btn('closeModal', 'Got it', {}, 'pri') + '</div><div class="note">You can turn this popup off in Settings.</div>', true);
  } catch (e) { if (window.console) console.error(e); }
}
/* ---------- v6: edit, delete with recycle bin, expense report, user tracking ---------- */
function canAdmin(m) { var r = role(); return r === 'owner' || r === 'manager' || (r === 'accountant' && (m === 'accounting' || m === 'purchases')); }
function byName() { return (user() || {}).name || ''; }
function trashList(C) { C.d.trash = C.d.trash || []; return C.d.trash; }
function trashPush(C, kind, label, data) {
  trashList(C).unshift({ id: uid(), kind: kind, label: label, data: data, by: byName(), at: new Date().toISOString() });
  if (C.d.trash.length > 300) C.d.trash.length = 300;
}
var KIND = { expense: 'Income / expense', journal: 'Journal', party: 'Party', product: 'Item' };

/* --- expenses --- */
function expForm(e) {
  e = e || { kind: 'expense', date: today(), mode: 'Cash', cat: '', amount: 0, note: '' };
  var C = cur(), cats = {}; C.d.expenses.forEach(function (x) { if (x.cat) cats[x.cat] = 1; });
  return '<div class="mh"><h2>' + (e.id ? 'Edit entry' : 'New entry') + '</h2>' + btn('closeModal', 'Close', {}, 'sm line') + '</div><form data-submit="saveExp"><input type="hidden" name="id" value="' + esc(e.id || '') + '"><div class="fg">' +
    field('Type', '<select name="kind"><option value="expense"' + (e.kind !== 'income' ? ' selected' : '') + '>Expense</option><option value="income"' + (e.kind === 'income' ? ' selected' : '') + '>Other income</option></select>') +
    field('Category', '<input name="cat" required list="expcats" value="' + esc(e.cat) + '" placeholder="Rent, Fuel, Salary"><datalist id="expcats">' + Object.keys(cats).sort().map(function (c) { return '<option value="' + esc(c) + '">'; }).join('') + '</datalist>') +
    field('Amount', '<input name="amt" type="number" min="0.01" step="any" required value="' + (e.id ? rs(e.amount) : '') + '">') +
    field('Paid or received by', '<select name="mode">' + opts(['Cash', 'Bank', 'UPI'], e.mode) + '</select>') + field('Date', '<input name="date" type="date" required value="' + esc(e.date) + '">') + field('Note', '<input name="note" value="' + esc(e.note || '') + '">') +
    '</div>' + (e.id && e.by ? '<div class="note" style="margin-top:8px">Added by ' + esc(e.by) + (e.editedBy ? ' · last edited by ' + esc(e.editedBy) : '') + '</div>' : '') + '<div style="margin-top:12px"><button class="btn pri" type="submit">Save</button></div></form>';
}
function expRows(C, from, to, kind) { return C.d.expenses.filter(function (e) { return e.kind === kind && e.date >= from && e.date <= to; }); }
function expReport(C) {
  var r = rng(), ex = expRows(C, r.from, r.to, 'expense'), inc = expRows(C, r.from, r.to, 'income');
  var te = sumBy(ex, function (e) { return e.amount; }), ti = sumBy(inc, function (e) { return e.amount; });
  var cat = {}; ex.forEach(function (e) { var k = e.cat.trim() || 'Other'; cat[k] = (cat[k] || 0) + e.amount; });
  var cats = Object.keys(cat).sort(function (a, b) { return cat[b] - cat[a]; }), mx = cats.length ? cat[cats[0]] : 1;
  var mon = {}; C.d.expenses.forEach(function (e) { if (e.date < r.from || e.date > r.to) return; var m = e.date.slice(0, 7); mon[m] = mon[m] || { e: 0, i: 0 }; mon[m][e.kind === 'income' ? 'i' : 'e'] += e.amount; });
  var h = '<div class="row"><label class="fld"><span>From</span><input class="inp" type="date" data-range="from" value="' + r.from + '"></label><label class="fld"><span>To</span><input class="inp" type="date" data-range="to" value="' + r.to + '"></label>' + btn('thisMonth', 'This month', {}, 'sm line') + btn('lastMonth', 'Last month', {}, 'sm line') + btn('thisFy', 'This year', {}, 'sm line') + '</div>';
  h += '<div class="grid">' + kpi('Total expenses', money(te), ex.length + ' entries') + kpi('Other income', money(ti), inc.length + ' entries') + kpi('Net', money(ti - te), ti - te < 0 ? 'More spent than earned here' : 'Income minus expenses', ti - te < 0) + '</div>';
  h += '<h2 style="margin-top:8px">By category</h2>' + table([['Category'], ['Entries', 'r'], ['Amount', 'r'], ['Share', 'r'], ['']], cats.map(function (k) {
    var n = ex.filter(function (e) { return (e.cat.trim() || 'Other') === k; }).length;
    return [esc(k), n, money(cat[k]), (te ? Math.round(cat[k] * 100 / te) : 0) + '%', '<div style="background:var(--soft);height:8px;min-width:120px"><div style="background:var(--ink);height:8px;width:' + Math.round(cat[k] * 100 / mx) + '%"></div></div>'];
  }), 'No expenses in this period.', ['Total', ex.length, money(te), '100%', '']);
  var ms = Object.keys(mon).sort();
  h += '<h2 style="margin-top:8px">By month</h2>' + table([['Month'], ['Expenses', 'r'], ['Other income', 'r'], ['Net', 'r']], ms.map(function (m) { return [MONTHS[+m.slice(5) - 1] + ' ' + m.slice(0, 4), money(mon[m].e), money(mon[m].i), money(mon[m].i - mon[m].e)]; }), 'Nothing in this period.');
  h += '<h2 style="margin-top:8px">All entries in this period</h2>' + table([['Date'], ['Type'], ['Category'], ['Mode'], ['Amount', 'r'], ['Note'], ['Added by']], ex.concat(inc).sort(function (a, b) { return b.date.localeCompare(a.date); }).map(function (e) { return [dmy(e.date), e.kind === 'income' ? 'Income' : 'Expense', esc(e.cat), esc(e.mode), money(e.amount), esc(e.note), esc(e.by || '-')]; }), 'No entries.', null, null);
  return h;
}

/* --- edit posted documents --- */
function editBlock(C, x) {
  if (x.cancelled) return 'This document is cancelled.';
  if (x.irn) return 'This bill has an IRN, so it cannot be edited. Make a credit note instead, or cancel the IRN on the portal and remove the IRN record first.';
  if (C.d.docs.some(function (y) { return y.refId === x.id && !y.cancelled && DT[y.type].post; })) return 'Cancel the returns or notes made from ' + x.no + ' first, then edit.';
  return '';
}
function editPostedCheck(C, d, old) {
  var paid = sumBy(C.d.payments.filter(function (p) { return p.refId === d.id && !p.cancelled; }), function (p) { return p.amount + (p.disc || 0); }) + sumBy(C.d.payments.filter(function (p) { return p.alloc && p.alloc[d.id] && !p.cancelled; }), function (p) { return p.alloc[d.id]; });
  if ((d.type === 'invoice' || d.type === 'pinvoice') && d.total < paid) return 'The new total is less than ' + money(paid) + ' already recorded. Edit or cancel the payment first.';
  var s = SE[d.type]; if (!s || skipStock(C, d)) return '';
  var wh = d.wh || C.d.warehouses[0], ow = old.wh || C.d.warehouses[0], need = {}, was = {};
  (d.items || []).forEach(function (it) { var p = prodById(C, it.pid); if (p && p.tracked) need[it.pid] = (need[it.pid] || 0) + (+it.qty || 0); });
  if (!skipStock(C, old)) (old.items || []).forEach(function (it) { var p = prodById(C, it.pid); if (p && p.tracked) was[it.pid] = (was[it.pid] || 0) + (+it.qty || 0); });
  var bad = Object.keys(need).concat(Object.keys(was)).filter(function (k, i, a) { return a.indexOf(k) === i; }).filter(function (pid) {
    var pp = prodById(C, pid), base = (pp && pp.batch && s < 0) ? usableQty(C, pp, wh, d.date) : stockQty(C, pid, wh); if (ow === wh) base -= s * (was[pid] || 0);
    return base + s * (need[pid] || 0) < -1e-9;
  });
  if (!bad.length && s > 0) {
    var delta = {};
    (old.items || []).forEach(function (it) { var p = prodById(C, it.pid); if (p && p.tracked && p.batch) { var k = it.pid + '|' + (it.batch || '') + '|' + (it.exp || ''); delta[k] = (delta[k] || 0) - (+it.qty || 0); } });
    (d.items || []).forEach(function (it) { var p = prodById(C, it.pid); if (p && p.tracked && p.batch) { var k = it.pid + '|' + (it.batch || '') + '|' + (it.exp || ''); delta[k] = (delta[k] || 0) + (+it.qty || 0); } });
    Object.keys(delta).forEach(function (k) { if (bad.length) return; var a = k.split('|'), p = prodById(C, a[0]), r = batchStock(C, p.id, wh).filter(function (x) { return x.batch === a[1] && x.exp === a[2]; })[0]; if ((r ? r.qty : 0) + delta[k] < -1e-9) bad.push(a[0]); });
  }
  if (bad.length) return s < 0 ? 'Stock is not enough for ' + prodById(C, bad[0]).name + '.' : 'Part of this stock is already sold, so the quantity cannot go down that far.';
  return '';
}

/* --- payments (receipts and vouchers) --- */
function payEditForm(x) {
  var C = cur(), pr = partyById(C, x.partyId) || {}, inv = x.refId ? docById(C, x.refId) : null;
  return '<div class="mh"><h2>Edit ' + esc(x.no) + '</h2>' + btn('closeModal', 'Close', {}, 'sm line') + '</div><div class="note">' + (x.type === 'receipt' ? 'Received from ' : 'Paid to ') + '<b>' + esc(pr.name || '-') + '</b> · ' + (inv ? 'against ' + esc(inv.no) : 'on account') + '</div><form data-submit="saveEditPay"><input type="hidden" name="id" value="' + x.id + '"><div class="fg">' +
    field('Amount', '<input name="amt" type="number" min="0.01" step="any" required value="' + rs(x.amount) + '">') + field('Discount given (Rs)', '<input name="disc" type="number" min="0" step="any" value="' + (x.disc ? rs(x.disc) : '') + '">') + field('Mode', '<select name="mode">' + opts(['Cash', 'UPI', 'Bank', 'Card', 'Cheque'], x.mode) + '</select>') + field('Date', '<input name="date" type="date" required value="' + esc(x.date) + '">') + field('Note', '<input name="note" value="' + esc(x.note || '') + '">') +
    '</div>' + (x.by ? '<div class="note" style="margin-top:8px">Entered by ' + esc(x.by) + (x.editedBy ? ' · last edited by ' + esc(x.editedBy) : '') + '</div>' : '') + '<div style="margin-top:12px"><button class="btn pri" type="submit">Save</button></div></form>';
}

/* --- reports by user --- */
function userReport(C) {
  var r = rng(), rows = {};
  function row(n) { n = n || 'Not recorded'; return rows[n] = rows[n] || { inv: 0, sales: 0, rc: 0, coll: 0, ex: 0, exa: 0, ed: 0 }; }
  C.d.docs.forEach(function (d) { if (d.date < r.from || d.date > r.to) return; if (d.type === 'invoice') { var o = row(d.by); if (!d.cancelled) { o.inv++; o.sales += d.total; } } if (d.editedBy && !d.cancelled) row(d.editedBy).ed++; });
  C.d.payments.forEach(function (p) { if (p.cancelled || p.type !== 'receipt' || p.date < r.from || p.date > r.to) return; var o = row(p.by); o.rc++; o.coll += p.amount; });
  C.d.expenses.forEach(function (e) { if (e.date < r.from || e.date > r.to || e.kind !== 'expense') return; var o = row(e.by); o.ex++; o.exa += e.amount; });
  var names = Object.keys(rows).sort(function (a, b) { return rows[b].sales - rows[a].sales; });
  var h = '<div class="row"><label class="fld"><span>From</span><input class="inp" type="date" data-range="from" value="' + r.from + '"></label><label class="fld"><span>To</span><input class="inp" type="date" data-range="to" value="' + r.to + '"></label>' + btn('thisMonth', 'This month', {}, 'sm line') + btn('lastMonth', 'Last month', {}, 'sm line') + btn('thisFy', 'This year', {}, 'sm line') + '</div>';
  h += '<div class="note">Who made which bill, receipt and expense entry. Every document remembers the user who created it.</div>';
  h += table([['User'], ['Invoices', 'r'], ['Sales', 'r'], ['Receipts', 'r'], ['Collected', 'r'], ['Expense entries', 'r'], ['Expenses', 'r'], ['Bills edited', 'r']], names.map(function (n) { var o = rows[n]; return [esc(n), o.inv, money(o.sales), o.rc, money(o.coll), o.ex, money(o.exa), o.ed]; }), 'No activity in this period.');
  return h;
}

/* --- recycle bin --- */
function binTab(kinds) {
  var C = cur(), list = trashList(C).filter(function (t) { return kinds.indexOf(t.kind) >= 0; }), ow = role() === 'owner';
  var h = '<div class="note">Deleted entries wait here. Restore brings them back exactly as they were.' + (ow ? '' : ' Only the owner can delete them for good.') + '</div>';
  h += table([['Deleted'], ['Type'], ['Details'], ['Deleted by'], ['']], list.map(function (t) {
    return [new Date(t.at).toLocaleString('en-IN'), esc(KIND[t.kind] || t.kind), esc(t.label), esc(t.by || '-'), '<div class="acts">' + btn('binRestore', 'Restore', { id: t.id }, 'sm') + (ow ? btn('binPurge', 'Delete forever', { id: t.id }, 'sm warn') : '') + '</div>'];
  }), 'The recycle bin is empty.');
  if (ow && list.length) h += '<div style="margin-top:12px">' + btn('binEmpty', 'Empty recycle bin', {}, 'warn') + '</div>';
  return h;
}
function partyUsed(C, id) { return C.d.docs.some(function (d) { return d.partyId === id; }) || C.d.payments.some(function (p) { return p.partyId === id; }); }
function prodUsed(C, id) { return C.d.docs.some(function (d) { return (d.items || []).some(function (it) { return it.pid === id; }); }); }

function prodsRichModel() {
  var C = cur(), n = function (x) { return (x || 0) / 100; }, tv = 0;
  var head = ['Item', 'Group', 'HSN/SAC', 'Unit', 'GST %', 'In stock', 'Minimum', 'Avg cost', 'Sale price', 'Stock value'];
  var rows = C.d.products.filter(function (p) { return match(S.q, [p.name, p.hsn, p.sku, p.cat]); }).map(function (p) { var q = p.tracked ? stockQty(C, p.id) : 0, v = Math.round(q * p.cost); tv += v; return [p.name, p.cat || '', p.hsn || '', p.unit, p.gst, p.tracked ? q : '', p.tracked ? p.min : '', n(p.cost), n(p.sale), p.tracked ? n(v) : '']; });
  return { title: 'Items and stock', sub: C.name + ' · Generated ' + dmy(today()), tables: [{ name: '', head: head, right: head.map(function (h, i) { return i >= 4; }), rows: rows, foot: rows.length ? ['Total', '', '', '', '', '', '', '', '', n(tv)] : null }] };
}
function partiesRichModel(tab) {
  var C = cur(), n = function (x) { return (x || 0) / 100; };
  var head = ['Name', 'GSTIN', 'State', 'Phone', 'Email', 'Address', tab === 'customer' ? 'Receivable' : 'Payable'];
  var rows = C.d.parties.filter(function (p) { return p.type === tab && match(S.q, [p.name, p.gstin, p.phone]); }).map(function (p) { return [p.name, p.gstin || '', p.state || '', p.phone || '', p.email || '', p.address || '', n(partyBalance(C, p))]; });
  return { title: tab === 'customer' ? 'Customers' : 'Suppliers', sub: C.name + ' · Generated ' + dmy(today()), tables: [{ name: '', head: head, right: head.map(function (h, i) { return i === 6; }), rows: rows, foot: null }] };
}
function bindExtra(A) {
  A.moreRows = function (d) { S.lim = S.lim || {}; S.lim[d.k] = (S.lim[d.k] || 200) + 200; render(); };
  A.addExp = function (fd) { A.saveExp(fd); };
  A.editExp = function (d) { var e = cur().d.expenses.find(function (x) { return x.id === d.id; }); if (e) modal(expForm(e)); };
  A.newExp = function () { modal(expForm()); };
  A.saveExp = function (fd) {
    var C = cur(), id = fd.get('id'), amt = P(fd.get('amt')), cat = String(fd.get('cat') || '').trim();
    if (!(amt > 0)) { toast('Enter an amount above zero.', true); return; }
    if (!cat) { toast('Enter a category.', true); return; }
    if (!fd.get('date')) { toast('Choose the date.', true); return; }
    var o = { date: fd.get('date'), kind: fd.get('kind'), cat: cat, amount: amt, mode: fd.get('mode'), note: String(fd.get('note') || '') };
    if (id) { var e = C.d.expenses.find(function (x) { return x.id === id; }); if (!e) return; Object.assign(e, o); e.editedBy = byName(); log('Edited ' + o.kind, cat); toast('Entry updated.'); }
    else { o.id = uid(); o.by = byName(); C.d.expenses.push(o); log('Added ' + o.kind, cat); toast('Entry added.'); }
    closeModal(); afterChange();
  };
  A.delExp = function (d) { confirmBox('Delete this entry?', 'It moves to the recycle bin. You can restore it from there.', 'doDelExp', d.id); };
  A.doDelExp = function (d) { closeModal(); var C = cur(), e = C.d.expenses.find(function (x) { return x.id === d.id; }); if (!e) return; C.d.expenses = C.d.expenses.filter(function (x) { return x.id !== d.id; }); trashPush(C, 'expense', dmy(e.date) + ' · ' + e.cat + ' · ' + money(e.amount), e); log('Deleted ' + e.kind + ' (recycle bin)', e.cat); toast('Moved to recycle bin.'); afterChange(); };
  A.delJrn = function (d) { confirmBox('Delete this journal?', 'It moves to the recycle bin. You can restore it from there.', 'doDelJrn', d.id); };
  A.doDelJrn = function (d) { closeModal(); var C = cur(), j = C.d.journals.find(function (x) { return x.id === d.id; }); if (!j) return; C.d.journals = C.d.journals.filter(function (x) { return x.id !== d.id; }); trashPush(C, 'journal', dmy(j.date) + ' · ' + j.dr + ' / ' + j.cr + ' · ' + money(j.amount), j); log('Deleted journal (recycle bin)'); toast('Moved to recycle bin.'); afterChange(); };
  A.delParty = function (d) {
    var C = cur(), p = partyById(C, d.id);
    if (partyUsed(C, d.id)) { toast(p.name + ' has bills or payments, so it cannot be deleted. Edit the details instead.', true); return; }
    confirmBox('Delete ' + p.name + '?', 'It moves to the recycle bin. You can restore it from there.', 'doDelParty', d.id);
  };
  A.doDelParty = function (d) { closeModal(); var C = cur(), p = partyById(C, d.id); if (!p || partyUsed(C, d.id)) return; C.d.parties = C.d.parties.filter(function (x) { return x.id !== d.id; }); trashPush(C, 'party', p.name + ' (' + p.type + ')', p); log('Deleted party (recycle bin)', p.name); toast('Moved to recycle bin.'); afterChange(); };
  A.delProd = function (d) {
    var C = cur(), p = prodById(C, d.id);
    if (prodUsed(C, d.id)) { toast(p.name + ' is used in bills, so it cannot be deleted. Edit it instead.', true); return; }
    confirmBox('Delete ' + p.name + '?', 'It moves to the recycle bin with its stock entries. You can restore it from there.', 'doDelProd', d.id);
  };
  A.doDelProd = function (d) { closeModal(); var C = cur(), p = prodById(C, d.id); if (!p || prodUsed(C, d.id)) return; var mv = C.d.moves.filter(function (m) { return m.pid === d.id; }); C.d.moves = C.d.moves.filter(function (m) { return m.pid !== d.id; }); C.d.products = C.d.products.filter(function (x) { return x.id !== d.id; }); trashPush(C, 'product', p.name, { p: p, moves: mv }); log('Deleted item (recycle bin)', p.name); toast('Moved to recycle bin.'); afterChange(); };
  A.binRestore = function (d) {
    var C = cur(), t = trashList(C).find(function (x) { return x.id === d.id; }); if (!t) return;
    if (t.kind === 'expense') C.d.expenses.push(t.data);
    else if (t.kind === 'journal') C.d.journals.push(t.data);
    else if (t.kind === 'party') C.d.parties.push(t.data);
    else if (t.kind === 'product') {
      if (C.d.products.some(function (x) { return x.name.trim().toLowerCase() === t.data.p.name.trim().toLowerCase(); })) { toast('An item with this name exists now. Rename it first.', true); return; }
      C.d.products.push(t.data.p); t.data.moves.forEach(function (m) { C.d.moves.push(m); });
    }
    C.d.trash = C.d.trash.filter(function (x) { return x.id !== d.id; }); log('Restored from recycle bin', t.label); toast('Restored.'); afterChange();
  };
  A.binPurge = function (d) { if (role() !== 'owner') return; confirmBox('Delete for good?', 'This cannot be undone.', 'doBinPurge', d.id); };
  A.doBinPurge = function (d) { closeModal(); var C = cur(); C.d.trash = trashList(C).filter(function (x) { return x.id !== d.id; }); log('Deleted from recycle bin'); afterChange(); };
  A.binEmpty = function () { if (role() !== 'owner') return; confirmBox('Empty the recycle bin?', 'Everything in it is deleted for good.', 'doBinEmpty'); };
  A.doBinEmpty = function () { closeModal(); var C = cur(); C.d.trash = []; log('Emptied recycle bin'); afterChange(); };

  A.editPay = function (d) { var x = cur().d.payments.find(function (p) { return p.id === d.id; }); if (x && !x.cancelled) modal(payEditForm(x)); };
  A.saveEditPay = function (fd) {
    var C = cur(), x = C.d.payments.find(function (p) { return p.id === fd.get('id'); }); if (!x) return;
    var amt = P(fd.get('amt')); if (!(amt > 0)) { toast('Enter an amount above zero.', true); return; }
    var inv = x.refId ? docById(C, x.refId) : null;
    var dsc = P(fd.get('disc')); if (inv && amt + dsc > outstanding(C, inv) + x.amount + (x.disc || 0)) { toast('Amount plus discount is more than the ' + money(outstanding(C, inv) + x.amount + (x.disc || 0)) + ' this invoice can take.', true); return; }
    x.disc = dsc; x.amount = amt; x.mode = fd.get('mode'); x.date = fd.get('date'); x.note = String(fd.get('note') || ''); x.editedBy = byName();
    log('Edited ' + (x.type === 'receipt' ? 'receipt' : 'payment'), x.no); closeModal(); afterChange(); modal(receiptH(x)); toast('Saved.');
  };
  A.editDoc = function (d) {
    var C = cur(), x = docById(C, d.id); if (!x) return;
    if (DT[x.type].post) {
      if (!canAdmin(DT[x.type].side === 's' ? 'sales' : 'purchases')) { toast('Only the owner or manager can edit a posted bill.', true); return; }
      var er = editBlock(C, x); if (er) { toast(er, true); return; }
    }
    closeModal(); S.view = DT[x.type].side === 's' ? 'sales' : 'purchases'; S.tab[S.view] = x.type;
    S.draft = JSON.parse(JSON.stringify(x)); S.top = true; render();
    if (DT[x.type].post) toast('Editing ' + x.no + '. Stock and balances are corrected when you save.');
  };
  A.sharePending = function () {
    var p = PENDING; if (!p) return;
    navigator.share({ files: [p.file], title: p.name, text: p.text }).then(function () { closeModal(); }, function (e) { if (e && e.name !== 'AbortError') toast('Sharing is not available here. The file was not sent.', true); });
  };
  A.deskOpen = function (d) {
    var D = window.billdnaDesktop; if (!D) return;
    var ph = S.deskPhone || '', u = d.k === 'web' ? 'https://web.whatsapp.com/send?phone=' + ph : 'whatsapp://send' + (ph ? '?phone=' + ph : '');
    D.open(u);
  };
  A.deskCopy = function () { var D = window.billdnaDesktop; if (D && S.deskFile) D.copyFile(S.deskFile).then(function (ok) { toast(ok ? 'PDF copied. Press Ctrl + V in the WhatsApp chat.' : 'Could not copy. Use Show file and attach it.', !ok); }); };
  A.deskShow = function () { var D = window.billdnaDesktop; if (D && S.deskFile) D.showFile(S.deskFile); };
}
/* ---------- barcode, labels, batch and expiry ---------- */
var C128 = '212222,222122,222221,121223,121322,131222,122213,122312,132212,221213,221312,231212,112232,122132,122231,113222,123122,123221,223211,221132,221231,213212,223112,312131,311222,321122,321221,312212,322112,322211,212123,212321,232121,111323,131123,131321,112313,132113,132311,211313,231113,231311,112133,112331,132131,113123,113321,133121,313121,211331,231131,213113,213311,213131,311123,311321,331121,312113,312311,332111,314111,221411,431111,111224,111422,121124,121421,141122,141221,112214,112412,122114,122411,142112,142211,241211,221114,413111,241112,134111,111242,121142,121241,114212,124112,124211,411212,421112,421211,212141,214121,412121,111143,111341,131141,114113,114311,411113,411311,113141,114131,311141,411131,211412,211214,211232'.split(',');
function code128Svg(text, h) {
  text = String(text || ''); var vals = [104], sum = 104;
  for (var i = 0; i < text.length; i++) { var v = text.charCodeAt(i) - 32; if (v < 0 || v > 95) v = 0; vals.push(v); sum += v * (i + 1); }
  vals.push(sum % 103);
  var pats = vals.map(function (v) { return C128[v]; }); pats.push('2331112');
  var x = 10, bars = '';
  pats.forEach(function (pt) { for (var k = 0; k < pt.length; k++) { var w = +pt[k]; if (k % 2 === 0) bars += '<rect x="' + x + '" y="0" width="' + w + '" height="50"/>'; x += w; } });
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + (x + 10) + ' 50" preserveAspectRatio="none" shape-rendering="crispEdges" style="height:' + (h || 11) + 'mm;width:100%" fill="#000"><rect x="0" y="0" width="' + (x + 10) + '" height="50" fill="#fff"/>' + bars + '</svg>';
}
function ean13Digit(b12) { var s = 0; for (var i = 0; i < 12; i++) s += (+b12[i]) * (i % 2 ? 3 : 1); return String((10 - s % 10) % 10); }
function makeBarcode(C) {
  var used = {}; C.d.products.forEach(function (p) { if (p.barcode) used[p.barcode] = 1; });
  for (var n = C.d.products.length + 1; n < 1e9; n++) { var b = '20' + String(n).padStart(10, '0'); b += ean13Digit(b); if (!used[b]) return b; }
  return '';
}
function findByCode(C, code) {
  code = String(code || '').trim().toLowerCase(); if (!code) return null;
  return C.d.products.filter(function (p) { return (p.barcode && p.barcode.toLowerCase() === code) || (p.sku && p.sku.toLowerCase() === code); })[0] || null;
}
function scanAdd(code, where) {
  var C = cur(), p = findByCode(C, code); if (!p) return false;
  if (where === 'qb') { A.qbAdd({ id: p.id, from: 'sug' }); return true; }
  var d = S.draft; if (!d || !DT[d.type].items) return false;
  var row = d.items.filter(function (it) { return it.pid === p.id; })[0];
  if (row) row.qty = (+row.qty || 0) + 1;
  else {
    var blank = d.items.filter(function (it) { return !it.pid && !(it.name || '').trim(); })[0];
    if (!blank) { blank = blankItem(); d.items.push(blank); }
    applyProduct(C, d, d.items.indexOf(blank), p.id);
  }
  render(); return true;
}
var CAM = { stream: null, timer: 0 };
function stopCam() { if (CAM.timer) { clearInterval(CAM.timer); CAM.timer = 0; } if (CAM.stream) { try { CAM.stream.getTracks().forEach(function (t) { t.stop(); }); } catch (e) { } CAM.stream = null; } }
function camBtn(where) { return ('BarcodeDetector' in window && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) ? btn('camScan', 'Scan with camera', { k: where }, 'sm line') : ''; }
function scanBox(where) { return '<input id="scanin" class="inp" style="max-width:260px" placeholder="Scan barcode here and press Enter" aria-label="Scan barcode" autocomplete="off">' + camBtn(where); }
function dateAdd(n) { return addDays(today(), n); }
function expiryList(C, within) {
  var lim = dateAdd(within), out = [];
  C.d.products.forEach(function (p) { if (!p.tracked || !p.batch) return; batchStock(C, p.id).forEach(function (r) { if (r.exp && r.exp <= lim) out.push({ p: p, r: r }); }); });
  return out.sort(function (a, b) { return a.r.exp.localeCompare(b.r.exp); });
}
function daysLeft(e) { return Math.round((new Date(e + 'T00:00:00') - new Date(today() + 'T00:00:00')) / 86400000); }
function batchRows(C) {
  var out = [];
  C.d.products.forEach(function (p) { if (!p.tracked || !p.batch) return; batchStock(C, p.id).forEach(function (r) { out.push({ p: p, r: r, days: r.exp ? daysLeft(r.exp) : null }); }); });
  return out.sort(function (a, b) { return (a.r.exp || '9999').localeCompare(b.r.exp || '9999') || a.p.name.localeCompare(b.p.name); });
}
function batchFilter(rows) {
  var f = S.bf || 'all';
  return rows.filter(function (x) { if (f === 'exp') return x.days !== null && x.days < 0; if (f === '30') return x.days !== null && x.days >= 0 && x.days <= 30; if (f === '90') return x.days !== null && x.days >= 0 && x.days <= 90; return true; });
}
function batchStatus(x) { if (x.days === null) return chip('No expiry', ''); if (x.days < 0) return chip('Expired ' + (-x.days) + ' days ago', 'bad'); if (x.days <= 30) return chip(x.days + ' days left', 'warn'); if (x.days <= 90) return chip(x.days + ' days left', ''); return chip('OK', 'ok'); }
function batchReport(C) {
  S.cur = { view: 'inventory', tab: 'batches' };
  var all = batchRows(C), rows = batchFilter(all), f = S.bf || 'all', tv = 0;
  var chips = [['all', 'All batches'], ['exp', 'Expired'], ['30', 'Within 30 days'], ['90', 'Within 90 days']].map(function (c) { return '<button type="button" class="chip btnchip' + (c[0] === f ? ' on' : '') + '" data-act="batchF" data-f="' + c[0] + '">' + c[1] + '</button>'; }).join('');
  var body = rows.map(function (x) { var v = Math.round(x.r.qty * x.p.cost); tv += v; return ['<b>' + esc(x.p.name) + '</b>', esc(x.r.batch || '-'), x.r.exp ? dmy(x.r.exp) : '-', qtyF(x.r.qty) + ' ' + esc(x.p.unit), money(v), batchStatus(x)]; });
  var ex = all.filter(function (x) { return x.days !== null && x.days < 0; }), exv = ex.reduce(function (s, x) { return s + Math.round(x.r.qty * x.p.cost); }, 0);
  return '<div class="note">Sales use the batch that expires first. Expired batches are never sold. To write off expired stock use Stock In/Out, Stock out.</div>' +
    (ex.length ? '<div class="hint warn-t"><b>' + ex.length + ' expired batch' + (ex.length > 1 ? 'es' : '') + ' still in stock, worth ' + money(exv) + '.</b> Write them off under Stock In/Out.</div>' : '') +
    '<div class="chips">' + chips + '</div>' + table([['Item'], ['Batch'], ['Expiry'], ['In stock', 'r'], ['Value at cost', 'r'], ['Status']], body, 'No batch stock. Turn on "Track batch and expiry date" for an item, then record a purchase with the batch number and expiry.', ['Total', '', '', '', money(tv), '']);
}
function batchRichModel() {
  var C = cur(), n = function (x) { return (x || 0) / 100; }, rows = batchFilter(batchRows(C)), tv = 0;
  var head = ['Item', 'Batch', 'Expiry', 'Days left', 'In stock', 'Unit', 'Value at cost'];
  var data = rows.map(function (x) { var v = Math.round(x.r.qty * x.p.cost); tv += v; return [x.p.name, x.r.batch || '', x.r.exp ? dmy(x.r.exp) : '', x.days === null ? '' : x.days, x.r.qty, x.p.unit, n(v)]; });
  return { title: 'Batches and expiry', sub: C.name + ' · Generated ' + dmy(today()), tables: [{ name: '', head: head, right: head.map(function (h, i) { return i >= 3; }), rows: data, foot: data.length ? ['Total', '', '', '', '', '', n(tv)] : null }] };
}
function labelModal(p) {
  var C = cur(), q = Math.max(1, Math.round(stockQty(C, p.id)) || 1);
  modal('<div class="mh"><h2>Print barcode labels</h2>' + btn('closeModal', 'Close', {}, 'sm line') + '</div><form data-submit="printLabels"><input type="hidden" name="id" value="' + esc(p.id) + '"><div class="note"><b>' + esc(p.name) + '</b>' + (p.barcode ? ' · ' + esc(p.barcode) : ' · a barcode will be made and saved for this item') + '</div><div class="fg">' +
    field('Number of labels', '<input name="n" type="number" min="1" max="500" step="1" value="' + Math.min(q, 500) + '">') +
    field('Paper', '<select name="size"><option value="sheet">A4 sheet (3 across)</option><option value="roll">Label roll 50 x 25 mm</option></select>') +
    '<label class="ck"><input type="checkbox" name="price" checked> Show price</label></div><div style="margin-top:12px"><button class="btn pri" type="submit">Print labels</button></div></form>');
}
function labelsPrint(p, n, size, withPrice) {
  var C = cur();
  var one = '<div class="lbl"><b>' + esc(p.name) + '</b>' + code128Svg(p.barcode, 11) + '<span class="lc">' + esc(p.barcode) + '</span>' + (withPrice ? '<span class="lp">' + esc(money(p.sale)) + '</span>' : '') + '</div>';
  var area = document.createElement('div'); area.id = 'printarea'; area.className = 'lblsheet ' + size; var h = ''; for (var i = 0; i < n; i++) h += one; area.innerHTML = h;
  var old = $('#printarea'); if (old) old.remove();
  var st = document.createElement('style'); st.id = 'lblpage'; st.textContent = size === 'roll' ? '@page{size:50mm 25mm;margin:0}' : '@page{size:A4;margin:8mm}'; document.head.appendChild(st);
  document.body.appendChild(area); document.body.classList.add('printing');
  var done = function () { document.body.classList.remove('printing'); var a = $('#printarea'); if (a) a.remove(); var s2 = $('#lblpage'); if (s2) s2.remove(); window.removeEventListener('afterprint', done); };
  window.addEventListener('afterprint', done);
  try { window.print(); } finally { if (!('onafterprint' in window)) done(); }
}
function bindBatch(A) {
  A.genBarcode = function () { var i = $('#modal input[name=barcode]'); if (i && !i.value.trim()) i.value = makeBarcode(cur()); else if (i) toast('This item already has a barcode.', true); };
  A.goBatches = function () { S.view = 'inventory'; S.tab.inventory = 'batches'; S.top = true; closeModal(); render(); };
  A.batchF = function (d) { S.bf = d.f; render(); };
  A.labels = function (d) { var p = prodById(cur(), d.id); if (p) labelModal(p); };
  A.printLabels = function (fd) {
    var C = cur(), p = prodById(C, fd.get('id')), n = Math.max(1, Math.min(500, parseInt(fd.get('n'), 10) || 1)); if (!p) return;
    if (!p.barcode) { p.barcode = makeBarcode(C); save(); log('Barcode made', p.name); }
    closeModal(); labelsPrint(p, n, fd.get('size') === 'roll' ? 'roll' : 'sheet', !!fd.get('price'));
  };
  A.camScan = function (d) {
    stopCam();
    modal('<div class="mh"><h2>Scan barcode</h2>' + btn('closeModal', 'Close', {}, 'sm line') + '</div><video id="camv" playsinline muted style="width:100%;max-height:60vh;background:#000;border-radius:8px"></video><div class="note">Hold the barcode in front of the camera.</div>');
    var v = $('#camv'), det;
    try { det = new window.BarcodeDetector(); } catch (e) { toast('Camera scanning is not supported here. Use a scanner or type the code.', true); return; }
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(function (st) {
      CAM.stream = st; v.srcObject = st; v.play();
      CAM.timer = setInterval(function () {
        det.detect(v).then(function (r) { if (r && r.length) { var code = r[0].rawValue; stopCam(); closeModal(); if (!scanAdd(code, d.k)) toast('No item has barcode ' + code + '.', true); } }).catch(function () { });
      }, 300);
    }).catch(function () { toast('Camera is not allowed. Allow camera access or use a scanner.', true); });
  };
  var adjust0 = A.adjust, transfer0 = A.transfer;
  A.adjust = function (fd) {
    var C = cur(), p = prodById(C, fd.get('pid')); if (!p || !p.batch) return adjust0(fd);
    var q = parseFloat(fd.get('qty')) || 0, wh = fd.get('wh'), out = fd.get('dir') === 'out', b = String(fd.get('batch') || '').trim(), e = fd.get('exp') || '';
    if (!(q > 0)) { toast('Enter a quantity above zero.', true); return; }
    var note = fd.get('note') || (out ? 'Stock out' : 'Stock in');
    if (!out) {
      if (!b) { toast('Enter the batch number for this stock.', true); return; }
      addMove(C, { date: today(), pid: p.id, wh: wh, qty: q, cost: p.cost, type: 'adjustment', note: note, batch: b, exp: e });
    } else {
      var have = usableQty(C, p, wh, '0000-00-00', b);
      if (q > have + 1e-9) { toast('Only ' + qtyF(have) + ' in ' + wh + (b ? ' for batch ' + b : '') + '. Reduce the quantity.', true); return; }
      allocBatches(C, p, wh, q, '0000-00-00', b).forEach(function (a) { addMove(C, { date: today(), pid: p.id, wh: wh, qty: -a.q, cost: p.cost, type: 'adjustment', note: note, batch: a.b, exp: a.e }); });
    }
    log('Stock ' + (out ? 'out ' : 'in ') + qtyF(q), p.name); toast('Adjustment saved.'); afterChange();
  };
  A.transfer = function (fd) {
    var C = cur(), p = prodById(C, fd.get('pid')); if (!p || !p.batch) return transfer0(fd);
    var q = parseFloat(fd.get('qty')) || 0, a = fd.get('from'), b = fd.get('to');
    if (a === b) { toast('Choose two different warehouses.', true); return; }
    if (!(q > 0)) { toast('Enter a quantity above zero.', true); return; }
    var have = usableQty(C, p, a, '0000-00-00'); if (q > have + 1e-9) { toast('Only ' + qtyF(have) + ' in ' + a + '.', true); return; }
    allocBatches(C, p, a, q, '0000-00-00').forEach(function (x) {
      addMove(C, { date: today(), pid: p.id, wh: a, qty: -x.q, cost: p.cost, type: 'transfer', note: 'To ' + b, batch: x.b, exp: x.e });
      addMove(C, { date: today(), pid: p.id, wh: b, qty: x.q, cost: p.cost, type: 'transfer', note: 'From ' + a, batch: x.b, exp: x.e });
    });
    log('Transfer ' + qtyF(q), p.name); toast('Transferred.'); afterChange();
  };
}
/* ---------- GST portal files: GSTR-1 JSON, e-invoice JSON, e-way bill JSON ---------- */
function r2(n) { return +((+n || 0) / 100).toFixed(2); }
function dDash(s) { return s.slice(8, 10) + '-' + s.slice(5, 7) + '-' + s.slice(0, 4); }
function dSlash(s) { return s.slice(8, 10) + '/' + s.slice(5, 7) + '/' + s.slice(0, 4); }
function stCodeNum(name) { var c = stCode(name); return c ? c : ''; }
function pinOk(p) { return /^[1-9]\d{5}$/.test(String(p || '').trim()); }
function inv16(n) { return /^[A-Za-z1-9][A-Za-z0-9\/-]{0,15}$/.test(n); }
function cleanHsn(h) { return String(h || '').replace(/\D/g, ''); }
function b2clNote(C, d) { var src = d.refId ? docById(C, d.refId) : null, b = src || d; return !!(b.inter && b.total > 10000000 && !isReg(partyById(C, d.partyId))); }
function ratesOf(d) { return rateRows(d).filter(function (x) { return x.rate > 0; }); }
function itmsOf(d, inter) {
  return ratesOf(d).map(function (x, i) {
    var det = { rt: x.rate, txval: r2(x.t) };
    if (inter) det.iamt = r2(x.ig); else { det.camt = r2(x.cg); det.samt = r2(x.sg); } det.csamt = 0;
    return { num: i + 1, itm_det: det };
  });
}
function gstr1Json(C, r) {
  var warns = [], out = { gstin: C.gstin, fp: r.to.slice(5, 7) + r.to.slice(0, 4), version: 'GST3.0.4', hash: 'hash', gt: r2(C.gt1 || 0), cur_gt: 0 };
  if (C.scheme !== 'regular') warns.push('GSTR-1 is only for the Regular GST scheme.');
  if (!C.gstin) warns.push('Add your GSTIN in Settings.');
  else if (gstinErr(C.gstin, C.state)) warns.push('Your GSTIN: ' + gstinErr(C.gstin, C.state));
  if (r.from.slice(0, 7) !== r.to.slice(0, 7)) warns.push('The period covers more than one month. Pick one month (or the quarter if you file quarterly). The file is marked for ' + out.fp + '.');
  var invs = docsIn('invoice', r.from, r.to), notes = docsIn('creditnote', r.from, r.to).concat(docsIn('debitnote', r.from, r.to));
  var b2b = {}, b2cl = {}, b2cs = {}, cdnr = {}, cdnur = [];
  function pos(p) { return stCodeNum((p && p.state) || C.state); }
  function bad(p, what) { if (p && p.gstin && gstinErr(p.gstin)) warns.push(what + ' ' + p.name + ': ' + gstinErr(p.gstin)); }
  invs.forEach(function (d) {
    var p = partyById(C, d.partyId) || {}, its = itmsOf(d, d.inter);
    if (isReg(p)) {
      bad(p, 'Customer');
      if (!its.length) return;
      (b2b[p.gstin] = b2b[p.gstin] || []).push({ inum: d.no, idt: dDash(d.date), val: r2(d.total), pos: pos(p), rchrg: 'N', inv_typ: 'R', itms: its });
    } else if (d.inter && d.total > 10000000) {
      if (!its.length) return;
      var k = pos(p); (b2cl[k] = b2cl[k] || []).push({ inum: d.no, idt: dDash(d.date), val: r2(d.total), itms: its.map(function (x) { delete x.itm_det.camt; delete x.itm_det.samt; return x; }) });
    } else {
      ratesOf(d).forEach(function (x) { var k = pos(p) + '|' + x.rate, o = b2cs[k] = b2cs[k] || { sply_ty: d.inter ? 'INTER' : 'INTRA', typ: 'OE', pos: pos(p), rt: x.rate, txval: 0, iamt: 0, camt: 0, samt: 0, csamt: 0 }; o.txval += x.t; o.iamt += x.ig; o.camt += x.cg; o.samt += x.sg; });
    }
  });
  notes.forEach(function (d) {
    var p = partyById(C, d.partyId) || {}, ty = d.type === 'creditnote' ? 'C' : 'D', sg = ty === 'C' ? -1 : 1, its = itmsOf(d, d.inter);
    if (isReg(p)) {
      bad(p, 'Customer'); if (!its.length) return;
      (cdnr[p.gstin] = cdnr[p.gstin] || []).push({ ntty: ty, nt_num: d.no, nt_dt: dDash(d.date), pos: pos(p), rchrg: 'N', inv_typ: 'R', val: r2(d.total), itms: its });
    } else if (b2clNote(C, d)) {
      if (its.length) cdnur.push({ typ: 'B2CL', ntty: ty, nt_num: d.no, nt_dt: dDash(d.date), pos: pos(p), val: r2(d.total), itms: its.map(function (x) { delete x.itm_det.camt; delete x.itm_det.samt; return x; }) });
    } else {
      ratesOf(d).forEach(function (x) { var k = pos(p) + '|' + x.rate, o = b2cs[k] = b2cs[k] || { sply_ty: d.inter ? 'INTER' : 'INTRA', typ: 'OE', pos: pos(p), rt: x.rate, txval: 0, iamt: 0, camt: 0, samt: 0, csamt: 0 }; o.txval += sg * x.t; o.iamt += sg * x.ig; o.camt += sg * x.cg; o.samt += sg * x.sg; });
    }
  });
  var b2bA = Object.keys(b2b).sort().map(function (g) { return { ctin: g, inv: b2b[g] }; }); if (b2bA.length) out.b2b = b2bA;
  var b2clA = Object.keys(b2cl).sort().map(function (k) { return { pos: k, inv: b2cl[k] }; }); if (b2clA.length) out.b2cl = b2clA;
  var b2csA = Object.keys(b2cs).sort().map(function (k) { var o = b2cs[k]; var z = { sply_ty: o.sply_ty, typ: o.typ, pos: o.pos, rt: o.rt, txval: r2(o.txval) }; if (o.sply_ty === 'INTER') z.iamt = r2(o.iamt); else { z.camt = r2(o.camt); z.samt = r2(o.samt); } z.csamt = 0; return z; }).filter(function (o) { return o.txval !== 0 || (o.iamt || o.camt || o.samt); }); if (b2csA.length) out.b2cs = b2csA;
  var cdnrA = Object.keys(cdnr).sort().map(function (g) { return { ctin: g, nt: cdnr[g] }; }); if (cdnrA.length) out.cdnr = cdnrA;
  if (cdnur.length) out.cdnur = cdnur;
  var nl = calc3b(C, r.from, r.to).nilSplit;
  var nilRows = [['INTRB2B', nl.outReg], ['INTRB2C', nl.outUnreg], ['INTRAB2B', nl.inReg], ['INTRAB2C', nl.inUnreg]].filter(function (x) { return x[1]; }).map(function (x) { return { sply_ty: x[0], expt_amt: 0, nil_amt: r2(x[1]), ngsup_amt: 0 }; });
  if (nilRows.length) out.nil = { inv: nilRows };
  var hs = hsnSummary('s', r.from, r.to), hrows = [];
  if (hs.blank) warns.push(hs.blank + ' item line(s) have no HSN/SAC code. Table 12 needs it. Add the code in Items and Stock.');
  hs.rows.forEach(function (o) { if (o.hsn === 'Not set') return; hrows.push({ num: hrows.length + 1, hsn_sc: cleanHsn(o.hsn), desc: String(o.desc || '').slice(0, 30), uqc: uqcOf(o.unit, o.hsn), qty: +(+o.q).toFixed(3), val: r2(o.v), txval: r2(o.t), iamt: r2(o.ig), camt: r2(o.cg), samt: r2(o.sg), csamt: 0, rt: o.rate }); });
  if (hrows.length) out.hsn = { data: hrows };
  var dd = [];
  [['invoice', 1, 'Invoices for outward supply'], ['debitnote', 4, 'Debit Note'], ['creditnote', 5, 'Credit Note']].forEach(function (tp) {
    var all = C.d.docs.filter(function (d) { return d.type === tp[0] && d.date >= r.from && d.date <= r.to; }).sort(function (a, b) { return a.no.localeCompare(b.no); });
    if (!all.length) return; var can = all.filter(function (d) { return d.cancelled; }).length;
    dd.push({ doc_num: tp[1], docs: [{ num: 1, from: all[0].no, to: all[all.length - 1].no, totnum: all.length, cancel: can, net_issue: all.length - can }] });
  });
  if (dd.length) out.doc_issue = { doc_det: dd };
  var cur = 0; C.d.docs.forEach(function (d) { if (d.cancelled || d.date < fyStartOf(r.to) || d.date > r.to) return; if (d.type === 'invoice' || d.type === 'debitnote') cur += d.total; else if (d.type === 'creditnote') cur -= d.total; });
  out.cur_gt = r2(cur);
  var sum = { b2b: b2bA.reduce(function (s, x) { return s + x.inv.length; }, 0), b2cl: Object.keys(b2cl).reduce(function (s, k) { return s + b2cl[k].length; }, 0), b2cs: b2csA.length, cdnr: cdnrA.reduce(function (s, x) { return s + x.nt.length; }, 0), cdnur: cdnur.length, hsn: hrows.length, docs: invs.length + notes.length };
  return { json: out, warns: warns.filter(function (w, i, a) { return a.indexOf(w) === i; }), sum: sum };
}
function fyStartOf(date) { var y = +date.slice(0, 4), m = +date.slice(5, 7); return (m >= 4 ? y : y - 1) + '-04-01'; }

/* e-invoice (IRP schema 1.1) */
function einvOk(C, d) {
  var e = [], p = partyById(C, d.partyId) || {};
  if (C.scheme !== 'regular') e.push('E-invoice is for the Regular GST scheme.');
  if (!['invoice', 'creditnote', 'debitnote'].some(function (t) { return t === d.type; })) e.push('E-invoice is made for invoices, credit notes and debit notes.');
  if (!C.gstin || gstinErr(C.gstin, C.state)) e.push('Your GSTIN is missing or wrong (Settings).');
  if (!isReg(p)) e.push('The customer has no GSTIN. E-invoice is only for GST-registered customers.');
  else if (gstinErr(p.gstin)) e.push('Customer GSTIN: ' + gstinErr(p.gstin));
  if ((C.name || '').trim().length < 3) e.push('Business name must be at least 3 letters.');
  if (!(C.address || '').trim()) e.push('Add your address in Settings.');
  if (!(C.city || '').trim() || C.city.trim().length < 3) e.push('Add your city (at least 3 letters) in Settings.');
  if (!pinOk(C.pin)) e.push('Add your 6-digit PIN code in Settings.');
  if (isReg(p)) {
    if (!(p.address || '').trim()) e.push('Add the customer address.');
    if (!(p.city || '').trim() || p.city.trim().length < 3) e.push('Add the customer city (at least 3 letters).');
    if (!pinOk(p.pin)) e.push('Add the customer 6-digit PIN code.');
  }
  if (!inv16(d.no)) e.push('Bill number ' + d.no + ' is not accepted by the portal. It can have at most 16 characters (letters, digits, / and -) and cannot start with 0, / or -. Change the prefix in Settings, Series.');
  (d.items || []).forEach(function (it, i) { if (cleanHsn(it.hsn).length < 4) e.push('Item ' + (i + 1) + ' (' + it.name + ') needs an HSN/SAC code of at least 4 digits.'); });
  return e;
}
function einvJson(C, d) {
  var p = partyById(C, d.partyId) || {}, typ = d.type === 'invoice' ? 'INV' : d.type === 'creditnote' ? 'CRN' : 'DBN';
  var items = (d.items || []).map(function (it, i) {
    var q = +it.qty || 0, gross = Math.round(q * (+it.rate || 0)), disc = Math.round(gross * (+it.disc || 0) / 100), h = cleanHsn(it.hsn);
    var o = { SlNo: String(i + 1), PrdDesc: String(it.name || '').slice(0, 300), IsServc: /^99/.test(h) ? 'Y' : 'N', HsnCd: h, Qty: +q.toFixed(3), Unit: uqcOf(it.unit, h) === 'NA' ? 'OTH' : uqcOf(it.unit, h), UnitPrice: +((+it.rate || 0) / 100).toFixed(3), TotAmt: r2(gross), Discount: r2(disc), AssAmt: r2(it.taxable), GstRt: +it.gst || 0, IgstAmt: r2(it.igst), CgstAmt: r2(it.cgst), SgstAmt: r2(it.sgst), CesRt: 0, CesAmt: 0, CesNonAdvlAmt: 0, StateCesRt: 0, StateCesAmt: 0, StateCesNonAdvlAmt: 0, OthChrg: 0, TotItemVal: r2((it.taxable || 0) + (it.tax || 0)) };
    var pr = it.pid ? prodById(C, it.pid) : null;
    if (pr && pr.batch && (it.alloc && it.alloc[0] || it.batch)) { var b = it.alloc && it.alloc[0] ? it.alloc[0] : { b: it.batch, e: it.exp }; if (b.b) { o.BchDtls = { Nm: String(b.b).slice(0, 20) }; if (b.e) o.BchDtls.ExpDt = dSlash(b.e); } }
    return o;
  });
  var o = {
    Version: '1.1',
    TranDtls: { TaxSch: 'GST', SupTyp: 'B2B', RegRev: 'N', EcmGstin: null, IgstOnIntra: 'N' },
    DocDtls: { Typ: typ, No: d.no, Dt: dSlash(d.date) },
    SellerDtls: { Gstin: C.gstin, LglNm: C.name.trim().slice(0, 100), Addr1: (C.address || '').trim().slice(0, 100), Loc: (C.city || '').trim().slice(0, 50), Pin: +String(C.pin || '').trim(), Stcd: (C.gstin || '').slice(0, 2) },
    BuyerDtls: { Gstin: p.gstin, LglNm: String(p.name || '').trim().slice(0, 100), Pos: stCodeNum(p.state || C.state), Addr1: (p.address || '').trim().slice(0, 100), Loc: (p.city || '').trim().slice(0, 50), Pin: +String(p.pin || '').trim(), Stcd: (p.gstin || '').slice(0, 2) },
    ItemList: items,
    ValDtls: { AssVal: r2(d.sub), CgstVal: r2(d.cgst), SgstVal: r2(d.sgst), IgstVal: r2(d.igst), CesVal: 0, StCesVal: 0, Discount: 0, OthChrg: 0, RndOffAmt: r2(d.round), TotInvVal: r2(d.total) }
  };
  if (C.phone && /^\d{6,12}$/.test(String(C.phone).replace(/\D/g, ''))) o.SellerDtls.Ph = String(C.phone).replace(/\D/g, '');
  if (C.email) o.SellerDtls.Em = C.email;
  if (p.phone && /^\d{6,12}$/.test(String(p.phone).replace(/\D/g, ''))) o.BuyerDtls.Ph = String(p.phone).replace(/\D/g, '');
  if (p.email) o.BuyerDtls.Em = p.email;
  if (d.refId && (d.type === 'creditnote' || d.type === 'debitnote')) { var src = docById(C, d.refId); if (src) o.RefDtls = { PrecDocDtls: [{ InvNo: src.no, InvDt: dSlash(src.date) }] }; }
  return o;
}

/* e-way bill (bulk upload JSON of the e-way bill portal) */
function ewbOk(C, d) {
  var e = [], p = partyById(C, d.partyId) || {}, w = d.ewb || {};
  if (C.scheme === 'notax') e.push('Make bills with GST for the e-way bill.');
  if (d.type !== 'invoice') e.push('The e-way bill is made from a sales invoice.');
  if (!C.gstin || gstinErr(C.gstin, C.state)) e.push('Your GSTIN is missing or wrong (Settings).');
  if (isReg(p) && gstinErr(p.gstin)) e.push('Customer GSTIN: ' + gstinErr(p.gstin));
  if (!(C.address || '').trim() || !(C.city || '').trim() || !pinOk(C.pin)) e.push('Add your address, city and 6-digit PIN code in Settings.');
  if (!(p.address || '').trim() || !(p.city || '').trim() || !pinOk(p.pin)) e.push('Add the customer address, city and 6-digit PIN code.');
  if (!(+w.dist > 0)) e.push('Enter the distance in km.');
  if ((w.mode || '1') === '1' && !w.veh && !w.tid) e.push('For road transport enter the vehicle number or the transporter ID.');
  if (w.veh && !/^[A-Z]{2}\d{1,2}[A-Z]{0,3}\d{4}$/.test(String(w.veh).toUpperCase().replace(/[\s-]/g, ''))) e.push('Vehicle number looks wrong. Example: TN49AB1234.');
  if (w.tid && gstinErr(String(w.tid).toUpperCase())) e.push('Transporter ID must be a valid GSTIN.');
  (d.items || []).forEach(function (it, i) { if (cleanHsn(it.hsn).length < 4) e.push('Item ' + (i + 1) + ' (' + it.name + ') needs an HSN code of at least 4 digits.'); });
  return e;
}
function ewbBill(C, d) {
  var p = partyById(C, d.partyId) || {}, w = d.ewb || {}, fs = +stCodeNum(C.state), ts = +stCodeNum(p.state || C.state);
  var o = {
    userGstin: C.gstin, supplyType: 'O', subSupplyType: 1, subSupplyDesc: '', docType: 'INV', docNo: d.no, docDate: dSlash(d.date), transType: 1,
    fromGstin: C.gstin, fromTrdName: C.name.trim().slice(0, 100), fromAddr1: (C.address || '').trim().slice(0, 120), fromAddr2: '', fromPlace: (C.city || '').trim().slice(0, 50), fromPincode: +String(C.pin || '').trim(), fromStateCode: fs, actualFromStateCode: fs,
    toGstin: isReg(p) ? p.gstin : 'URP', toTrdName: String(p.name || '').trim().slice(0, 100), toAddr1: (p.address || '').trim().slice(0, 120), toAddr2: '', toPlace: (p.city || '').trim().slice(0, 50), toPincode: +String(p.pin || '').trim(), toStateCode: ts, actualToStateCode: ts,
    totalValue: r2(d.sub), cgstValue: r2(d.cgst), sgstValue: r2(d.sgst), igstValue: r2(d.igst), cessValue: 0, cessNonAdvolValue: 0, otherValue: r2(d.round), totInvValue: r2(d.total),
    transMode: String(w.mode || '1'), transDistance: String(Math.round(+w.dist || 0)), transporterName: w.tname || '', transporterId: (w.tid || '').toUpperCase(), transDocNo: w.tdoc || '', transDocDate: w.tdt ? dSlash(w.tdt) : '', vehicleNo: String(w.veh || '').toUpperCase().replace(/[\s-]/g, ''), vehicleType: w.vtype || 'R'
  };
  o.itemList = (d.items || []).map(function (it, i) {
    var g = +it.gst || 0, h = cleanHsn(it.hsn);
    return { itemNo: i + 1, productName: String(it.name || '').slice(0, 100), productDesc: String(it.name || '').slice(0, 100), hsnCode: +h, quantity: +(+it.qty || 0).toFixed(3), qtyUnit: uqcOf(it.unit, h) === 'NA' ? 'OTH' : uqcOf(it.unit, h), taxableAmount: r2(it.taxable), sgstRate: d.inter ? 0 : g / 2, cgstRate: d.inter ? 0 : g / 2, igstRate: d.inter ? g : 0, cessRate: 0, cessNonadvol: 0 };
  });
  return o;
}
function govDownload(name, obj) { browserSave(name, JSON.stringify(obj, null, 2)); }
function govList(a) { return a.length ? '<ul class="steps">' + a.map(function (x) { return '<li class="warn-t">' + esc(x) + '</li>'; }).join('') + '</ul>' : ''; }
function govModal(d) {
  var C = cur(), t = DT[d.type], h = '<div class="mh"><h2>E-invoice and e-way bill</h2>' + btn('closeModal', 'Close', {}, 'sm line') + '</div><div class="note"><b>' + esc(t.label + ' ' + d.no) + '</b> · ' + money(d.total) + '</div>';
  var ee = einvOk(C, d);
  h += '<h3>E-invoice (IRN)</h3>';
  if (d.irn) h += '<div class="hint"><b>IRN recorded.</b><br><span style="word-break:break-all">' + esc(d.irn) + '</span><br>Ack no ' + esc(d.ack || '-') + (d.ackDt ? ' · ' + esc(dmy(d.ackDt)) : '') + '</div><div class="row">' + btn('irnClear', 'Remove IRN record', { id: d.id }, 'sm line') + '</div>';
  else {
    h += '<div class="note">Needed only if your yearly turnover is above 5 crore. Download the file, upload it on the e-invoice portal, then paste the IRN it gives you below. This app cannot create the IRN or QR itself.</div>' + govList(ee);
    if (!ee.length) h += '<div class="row">' + btn('einvDl', 'Download e-invoice JSON', { id: d.id }, 'pri') + '</div>';
    h += '<form data-submit="irnSave" class="fg" style="margin-top:8px"><input type="hidden" name="id" value="' + esc(d.id) + '">' + field('IRN (64 characters)', '<input name="irn" maxlength="64" autocomplete="off" placeholder="Paste from the portal">', 'wide') + field('Ack no', '<input name="ack" maxlength="20">') + field('Ack date', '<input name="ackDt" type="date" value="' + esc(today()) + '">') + '<div><button class="btn line" type="submit">Save IRN</button></div></form>';
  }
  if (d.type === 'invoice') {
    var w = d.ewb || {}, ew = ewbOk(C, d);
    h += '<h3 style="margin-top:16px">E-way bill</h3>';
    if (d.sub + d.cgst + d.sgst + d.igst < 5000000 && !w.no) h += '<div class="note">An e-way bill is needed when the goods value is above 50,000.</div>';
    if (w.no) h += '<div class="hint"><b>E-way bill ' + esc(w.no) + '</b>' + (w.dt ? ' · ' + esc(dmy(w.dt)) : '') + (w.till ? ' · valid till ' + esc(dmy(w.till)) : '') + '</div>';
    h += '<form data-submit="ewbSave" class="fg"><input type="hidden" name="id" value="' + esc(d.id) + '">' +
      field('Transport', '<select name="mode">' + opts([['1', 'Road'], ['2', 'Rail'], ['3', 'Air'], ['4', 'Ship']], w.mode || '1', function (x) { return x[0]; }, function (x) { return x[1]; }) + '</select>') +
      field('Distance (km)', '<input name="dist" type="number" min="1" max="4000" step="1" value="' + esc(w.dist || '') + '">') +
      field('Vehicle number', '<input name="veh" maxlength="15" value="' + esc(w.veh || '') + '" placeholder="TN49AB1234">') +
      field('Vehicle type', '<select name="vtype">' + opts([['R', 'Regular'], ['O', 'Over dimensional cargo']], w.vtype || 'R', function (x) { return x[0]; }, function (x) { return x[1]; }) + '</select>') +
      field('Transporter name', '<input name="tname" maxlength="100" value="' + esc(w.tname || '') + '">') + field('Transporter ID (GSTIN)', '<input name="tid" maxlength="15" value="' + esc(w.tid || '') + '">') +
      field('Transport doc no (LR / RR / AWB)', '<input name="tdoc" maxlength="15" value="' + esc(w.tdoc || '') + '">') + field('Transport doc date', '<input name="tdt" type="date" value="' + esc(w.tdt || '') + '">') +
      '<div class="wide row"><button class="btn line" type="submit">Save transport details</button></div></form>' + govList(w.dist ? ew : []);
    if (w.dist && !ew.length) h += '<div class="row">' + btn('ewbDl', 'Download e-way bill JSON', { id: d.id }, 'pri') + '</div>';
    h += '<form data-submit="ewbNo" class="fg" style="margin-top:8px"><input type="hidden" name="id" value="' + esc(d.id) + '">' + field('E-way bill number (after the portal makes it)', '<input name="no" maxlength="12" value="' + esc(w.no || '') + '" inputmode="numeric">') + field('Valid till', '<input name="till" type="date" value="' + esc(w.till || '') + '">') + '<div><button class="btn line" type="submit">Save e-way bill number</button></div></form>';
  }
  modal(h, true);
}
function gstr1Modal(C, r) {
  var g = gstr1Json(C, r), s = g.sum;
  var h = '<div class="mh"><h2>GSTR-1 file for the GST portal</h2>' + btn('closeModal', 'Close', {}, 'sm line') + '</div><div class="note">Period ' + esc(dmy(r.from)) + ' to ' + esc(dmy(r.to)) + '. Upload this file on the GST portal: Returns, GSTR-1, Prepare Offline, Upload. Check the figures on the portal before you file.</div>' +
    table([['Section'], ['Entries', 'r']], [['B2B invoices', String(s.b2b)], ['B2C Large invoices', String(s.b2cl)], ['B2C Small (state and rate lines)', String(s.b2cs)], ['Credit / debit notes (registered)', String(s.cdnr)], ['Credit / debit notes (unregistered, large)', String(s.cdnur)], ['HSN lines', String(s.hsn)], ['Documents issued', String(s.docs)]]) + govList(g.warns);
  h += '<form data-submit="gt1Save" class="fg" style="margin-top:8px">' + field('Last year total turnover (optional)', '<input name="gt" type="number" min="0" step="any" value="' + rs(C.gt1 || 0) + '">') + '<div><button class="btn line" type="submit">Save</button></div></form>';
  if (g.sum.docs) h += '<div class="row">' + btn('gstr1Dl', 'Download GSTR-1 JSON', {}, 'pri') + '</div>'; else h += '<div class="note">No bills in this period.</div>';
  modal(h, true);
}
function bindGov(A) {
  A.govDoc = function (d) { var x = docById(cur(), d.id); if (x) govModal(x); };
  A.einvDl = function (d) { var C = cur(), x = docById(C, d.id); if (!x) return; var e = einvOk(C, x); if (e.length) { toast(e[0], true); return; } govDownload('einvoice-' + slug(x.no) + '.json', [einvJson(C, x)]); };
  A.ewbDl = function (d) { var C = cur(), x = docById(C, d.id); if (!x) return; var e = ewbOk(C, x); if (e.length) { toast(e[0], true); return; } govDownload('ewaybill-' + slug(x.no) + '.json', { version: '1.0.0621', billLists: [ewbBill(C, x)] }); };
  A.irnSave = function (fd) {
    var C = cur(), x = docById(C, fd.get('id')), irn = String(fd.get('irn') || '').trim();
    if (!x) return; if (!/^[0-9a-fA-F]{64}$/.test(irn)) { toast('IRN is 64 letters and digits (0 to 9, a to f). Copy it again from the portal.', true); return; }
    x.irn = irn.toLowerCase(); x.ack = String(fd.get('ack') || '').trim(); x.ackDt = fd.get('ackDt') || ''; log('IRN recorded', x.no); save(); govModal(x); render(); toast('IRN saved.');
  };
  A.irnClear = function (d) { var x = docById(cur(), d.id); if (!x) return; delete x.irn; delete x.ack; delete x.ackDt; log('IRN removed', x.no); save(); govModal(x); render(); };
  A.ewbSave = function (fd) {
    var x = docById(cur(), fd.get('id')); if (!x) return; var w = x.ewb || {};
    ['mode', 'dist', 'veh', 'vtype', 'tname', 'tid', 'tdoc', 'tdt'].forEach(function (k) { w[k] = String(fd.get(k) || '').trim(); });
    x.ewb = w; save(); govModal(x); toast('Transport details saved.');
  };
  A.ewbNo = function (fd) {
    var x = docById(cur(), fd.get('id')); if (!x) return; var n = String(fd.get('no') || '').trim();
    if (n && !/^\d{12}$/.test(n)) { toast('E-way bill number has 12 digits.', true); return; }
    x.ewb = x.ewb || {}; x.ewb.no = n; x.ewb.dt = n ? (x.ewb.dt || today()) : ''; x.ewb.till = fd.get('till') || ''; save(); govModal(x); render(); toast('Saved.');
  };
  A.gstr1Pop = function () { gstr1Modal(cur(), rng()); };
  A.gstr1Dl = function () { var C = cur(), r = rng(), g = gstr1Json(C, r); govDownload('gstr1-' + g.json.fp + '.json', g.json); };
  A.gt1Save = function (fd) { var C = cur(); C.gt1 = P(fd.get('gt')); save(); gstr1Modal(C, rng()); };
  A.einvBulk = function () {
    var C = cur(), r = rng(), list = [], skip = 0;
    docsIn('invoice', r.from, r.to).concat(docsIn('creditnote', r.from, r.to), docsIn('debitnote', r.from, r.to)).forEach(function (d) { var p = partyById(C, d.partyId); if (!isReg(p) || d.irn) return; if (einvOk(C, d).length) { skip++; return; } list.push(einvJson(C, d)); });
    if (!list.length) { toast(skip ? skip + ' bill(s) have missing details. Open a bill, E-invoice, to see what is missing.' : 'No B2B bills without IRN in this period.', true); return; }
    govDownload('einvoice-bulk-' + r.from + '.json', list); toast(list.length + ' bill(s) in the file' + (skip ? '; ' + skip + ' skipped for missing details.' : '.'));
  };
  A.ewbBulk = function () {
    var C = cur(), r = rng(), list = [], skip = 0;
    docsIn('invoice', r.from, r.to).forEach(function (d) { if (!d.ewb || !d.ewb.dist || d.ewb.no) return; if (ewbOk(C, d).length) { skip++; return; } list.push(ewbBill(C, d)); });
    if (!list.length) { toast(skip ? skip + ' bill(s) have missing details.' : 'No bills with transport details saved and no e-way bill yet.', true); return; }
    govDownload('ewaybill-bulk-' + r.from + '.json', { version: '1.0.0621', billLists: list }); toast(list.length + ' bill(s) in the file.');
  };
}
/* ---------- delete PIN: asked before delete, cancel, reset and restore ---------- */
var PIN_ACTS = ['doCancel', 'doCancelPay', 'doDelExp', 'doDelJrn', 'doDelParty', 'doDelProd', 'doBinPurge', 'doBinEmpty', 'doReset', 'doRestore', 'doRmUser', 'editDoc', 'editPay'];
var PIN_REQ = ['doCancel', 'doCancelPay', 'editDoc', 'editPay'];
function pinReq() { return window.BILLDNA_PIN_REQUIRED === true; }
function pinOn(C) { return !!(C && C.delPin && C.delPin.h); }
function pinHash(C, pin) { return pwHash(String(pin), 'dp' + C.id); }
function pinLocked() { return S.pinLock && Date.now() < S.pinLock; }
function askPin(next) {
  S.pinNext = next;
  modal('<div class="mh"><h2>Enter your PIN</h2>' + btn('closeModal', 'Cancel', {}, 'sm line') + '</div><form data-submit="pinCheck"><div class="note">This action needs the 4-digit PIN set by the owner.</div><label class="fld"><span>PIN</span><input name="pin" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" required style="max-width:140px;letter-spacing:6px;font-size:20px"></label><div class="row" style="margin-top:12px"><button class="btn pri" type="submit">Continue</button></div></form>');
  var i = $('#modal input[name=pin]'); if (i) { try { i.focus(); } catch (e) { } }
}
function pinCardH(C) {
  var h = '<div class="card" style="background:var(--bg)"><h2>Delete PIN</h2><div class="note">A 4-digit PIN asked before any delete, cancel, reset or restore. It protects your data from mistakes and from staff who use your login.</div>';
  if (pinOn(C)) {
    h += '<div class="hint"><b>PIN is on.</b></div><form data-submit="pinSet" class="fg">' + field('Current PIN', '<input name="cur" type="password" inputmode="numeric" maxlength="4" autocomplete="off" required>') + field('New PIN', '<input name="pin" type="password" inputmode="numeric" maxlength="4" autocomplete="off" required>') + field('New PIN again', '<input name="pin2" type="password" inputmode="numeric" maxlength="4" autocomplete="off" required>') + '<div class="wide row"><button class="btn line" type="submit">Change PIN</button></div></form>' +
      '<form data-submit="pinRemove" class="fg" style="margin-top:8px">' + field('Current PIN', '<input name="cur" type="password" inputmode="numeric" maxlength="4" autocomplete="off" required>') + '<div class="wide row"><button class="btn warn" type="submit">Turn PIN off</button></div></form>' +
      '<form data-submit="pinReset" class="fg" style="margin-top:8px">' + field('Forgot the PIN? Enter your login password', '<input name="pw" type="password" autocomplete="current-password" required>', 'wide') + '<div class="wide row"><button class="btn line" type="submit">Turn PIN off with password</button></div></form>';
  } else {
    h += '<form data-submit="pinSet" class="fg">' + field('New PIN (4 digits)', '<input name="pin" type="password" inputmode="numeric" maxlength="4" autocomplete="off" required>') + field('New PIN again', '<input name="pin2" type="password" inputmode="numeric" maxlength="4" autocomplete="off" required>') + '<div class="wide row"><button class="btn pri" type="submit">Turn PIN on</button></div></form>';
  }
  return h + '</div>';
}
function pinBad(C, p) { if (pinLocked()) { toast('Too many wrong tries. Wait a minute and try again.', true); return true; } if (p === null) return false; return false; }
function pinTry(C, p) {
  if (pinLocked()) { toast('Too many wrong tries. Wait a minute and try again.', true); return false; }
  if (pinHash(C, String(p || '').trim()) === C.delPin.h) { S.pinFails = 0; return true; }
  S.pinFails = (S.pinFails || 0) + 1; log('Wrong delete PIN entered', ''); if (S.pinFails >= 5) { S.pinLock = Date.now() + 60000; S.pinFails = 0; toast('Too many wrong tries. Wait a minute and try again.', true); } else toast('Wrong PIN.', true);
  return false;
}
function bindPin(A) {
  PIN_ACTS.forEach(function (n) {
    var o = A[n]; if (!o) return;
    A[n] = function (d, t) { var C = cur(); if (!pinOn(C)) { if (pinReq() && PIN_REQ.indexOf(n) >= 0) return needPinSetup(function () { o(d, t); }); return o(d, t); } askPin(function () { o(d, t); }); };
  });
  A.pinCheck = function (fd) { var C = cur(); if (!pinOn(C)) { closeModal(); return; } if (!pinTry(C, fd.get('pin'))) return; var f = S.pinNext; S.pinNext = null; closeModal(); if (f) f(); };
  A.pinFirst = function (fd) {
    if (!ownerOnly()) return; var C = cur(), p = String(fd.get('pin') || '').trim();
    if (!/^\d{4}$/.test(p)) { toast('PIN must be exactly 4 digits.', true); return; }
    if (p !== String(fd.get('pin2') || '').trim()) { toast('The two PINs do not match.', true); return; }
    C.delPin = { h: pinHash(C, p), at: new Date().toISOString() }; log('Delete PIN set', ''); save(); var f = S.pinNext2; S.pinNext2 = null; closeModal(); toast('PIN saved.'); if (f) f();
  };
  A.pinSet = function (fd) {
    if (!ownerOnly()) return; var C = cur(), p = String(fd.get('pin') || '').trim();
    if (pinOn(C) && !pinTry(C, fd.get('cur'))) return;
    if (!/^\d{4}$/.test(p)) { toast('PIN must be exactly 4 digits.', true); return; }
    if (p !== String(fd.get('pin2') || '').trim()) { toast('The two PINs do not match.', true); return; }
    C.delPin = { h: pinHash(C, p), at: new Date().toISOString() }; log('Delete PIN set', ''); toast('PIN saved.'); afterChange();
  };
  A.pinRemove = function (fd) { if (!ownerOnly()) return; var C = cur(); if (!pinOn(C) || !pinTry(C, fd.get('cur'))) return; delete C.delPin; log('Delete PIN turned off', ''); toast('PIN is off.'); afterChange(); };
  A.pinReset = function (fd) {
    if (!ownerOnly()) return; var C = cur(), u = user();
    if (S.pwLock && Date.now() < S.pwLock) { toast('Too many wrong tries. Wait a minute.', true); return; }
    if (!u || !checkPass(u, String(fd.get('pw') || ''))) { S.pwFails = (S.pwFails || 0) + 1; if (S.pwFails >= 5) { S.pwLock = Date.now() + 60000; S.pwFails = 0; } toast('Wrong password.', true); return; }
    S.pwFails = 0; delete C.delPin; log('Delete PIN turned off with password', ''); toast('PIN is off. Set a new one.'); afterChange();
  };
}
/* ---------- staff limits + activity watchdog ---------- */
function staffLim(C) { return C.limits || {}; }
function limOn(C) { var l = staffLim(C); return role() !== 'owner' && (+l.disc > 0 || +l.maxBill > 0 || l.cost || l.noEdit); }
function limitErr(C, d) {
  if (!limOn(C) || !DT[d.type] || DT[d.type].side !== 's' || d.type === 'enquiry') return '';
  var l = staffLim(C);
  for (var i = 0; i < d.items.length; i++) {
    var it = d.items[i], p = it.pid ? prodById(C, it.pid) : null, n = 'Item ' + (i + 1);
    if (+l.disc > 0 && +it.disc > +l.disc) return n + ': your discount limit is ' + l.disc + '%. Ask the owner.';
    if (p && l.noEdit && p.sale > 0 && Math.round(+it.rate) !== p.sale && d.type !== 'creditnote') return n + ': price change is not allowed for your login. Ask the owner.';
    if (p && l.cost && p.cost > 0 && Math.round((+it.rate) * (1 - (+it.disc || 0) / 100)) < p.cost && d.type !== 'creditnote') return n + ': this price is below the cost. Ask the owner.';
  }
  if (+l.maxBill > 0 && d.total > Math.round(+l.maxBill * 100) && d.type !== 'creditnote') return 'Bill amount is above your limit of ' + money(Math.round(+l.maxBill * 100)) + '. Ask the owner.';
  return '';
}
function watchList(C, days) {
  var from = addDays(today(), -(days || 7) + 1), out = [], by = {};
  function u(n) { return by[n] = by[n] || { n: n, bills: 0, cancel: 0, edit: 0, disc: 0, loss: 0, night: 0 }; }
  C.d.docs.forEach(function (d) {
    if (!DT[d.type] || DT[d.type].side !== 's' || d.date < from) return;
    var s = u(d.by || '-');
    if (d.cancelled) s.cancel++; else s.bills++;
    if (d.editedBy && d.type === 'invoice') u(d.editedBy).edit++;
    if (d.at && d.type === 'invoice' && !d.cancelled) { var h = new Date(d.at).getHours(); if (h >= 22 || h < 6) s.night++; }
    (d.items || []).forEach(function (it) {
      var p = it.pid ? prodById(C, it.pid) : null;
      if (+it.disc >= 20) { s.disc++; out.push({ u: d.by, t: d.no + ': ' + (+it.disc) + '% discount on ' + it.name }); }
      if (p && p.cost > 0 && Math.round((+it.rate) * (1 - (+it.disc || 0) / 100)) < p.cost && d.type === 'invoice' && !d.cancelled) { s.loss++; out.push({ u: d.by, t: d.no + ': ' + it.name + ' sold below cost' }); }
    });
  });
  var rows = Object.keys(by).map(function (k) { return by[k]; });
  rows.forEach(function (s) { s.flag = (s.cancel >= 3 ? 'many cancels; ' : '') + (s.edit >= 3 ? 'many edits; ' : '') + (s.night >= 2 ? 'night bills; ' : '') + (s.loss ? 'below-cost sales; ' : '') + (s.disc ? 'big discounts; ' : ''); });
  return { rows: rows, items: out, bad: rows.filter(function (s) { return s.flag; }) };
}
function limitsCardH(C) {
  var l = staffLim(C), w = watchList(C, 7);
  var h = '<div class="card" style="background:var(--bg)"><h2>Staff limits</h2><div class="note">Applied to every login except the owner. Leave 0 / unticked for no limit.</div><form data-submit="saveLimits" class="fg">' +
    field('Max discount % per item', '<input name="disc" type="number" min="0" max="100" step="any" value="' + (+l.disc || 0) + '">') +
    field('Max bill amount (₹)', '<input name="maxBill" type="number" min="0" step="any" value="' + (+l.maxBill || 0) + '">') +
    field('Block sales below cost', '<input name="cost" type="checkbox"' + (l.cost ? ' checked' : '') + '>') +
    field('Block price change on bills', '<input name="noEdit" type="checkbox"' + (l.noEdit ? ' checked' : '') + '>') +
    '<div class="wide row"><button class="btn pri" type="submit">Save limits</button></div></form></div>';
  h += '<div class="card" style="background:var(--bg)"><h2>Staff activity check (last 7 days)</h2>';
  if (!w.rows.length) h += '<div class="note">No sales activity yet.</div>';
  else {
    h += table([['Staff'], ['Bills', 'r'], ['Cancelled', 'r'], ['Edited', 'r'], ['Flag']], w.rows.map(function (s) { return [esc(s.n), s.bills, s.cancel, s.edit, s.flag ? '<span class="warn-t">' + esc(s.flag) + '</span>' : 'OK']; }));
    if (w.items.length) h += '<div class="note" style="margin-top:8px">' + w.items.slice(0, 10).map(function (x) { return esc((x.u || '-') + ' - ' + x.t); }).join('<br>') + '</div>';
  }
  return h + '</div>';
}
function bindLimits(A) {
  A.saveLimits = function (fd) {
    if (!ownerOnly()) return; var C = cur(), n = function (k) { return Math.max(0, +fd.get(k) || 0); };
    var disc = n('disc'); if (disc > 100) { toast('Discount limit cannot be above 100.', true); return; }
    C.limits = { disc: disc, maxBill: n('maxBill'), cost: !!fd.get('cost'), noEdit: !!fd.get('noEdit') };
    log('Staff limits changed', ''); toast('Limits saved.'); afterChange();
  };
}
/* ---------- licence: activate once, then online check; 2 minutes without internet and the app locks ---------- */
var LIC = { ok: 0, timer: null, busy: false };
function licGrace() { return +window.BILLDNA_LICENSE_GRACE_MS || 120000; }
function licOn() { return !!(window.BILLDNA_LICENSE_URL && window.BILLDNA_LICENSE_REQUIRED); }
function licGet() { try { return JSON.parse(localStorage.getItem('bd_lic') || 'null'); } catch (e) { return null; } }
function licPut(o) { try { localStorage.setItem('bd_lic', JSON.stringify(o)); } catch (e) { } }
function licDevice() {
  var d = ''; try { d = localStorage.getItem('bd_dev') || ''; } catch (e) { }
  if (!d) { d = 'D' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10); try { localStorage.setItem('bd_dev', d); } catch (e) { } }
  return d;
}
function licKind() {
  if (window.BILLDNA_EXE) return 'desktop';
  try { if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) return 'mobile'; } catch (e) { }
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '') ? 'mobile' : 'desktop';
}
function licCall(body) {
  body.kind = licKind();
  return fetch(window.BILLDNA_LICENSE_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(function (r) { return r.json(); });
}
function licOverlay(html) {
  var o = document.getElementById('licov');
  if (!o) { o = document.createElement('div'); o.id = 'licov'; o.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#f4f7f6;overflow:auto;display:flex;align-items:flex-start;justify-content:center;padding:20px;font-family:system-ui,sans-serif;color:#13302a'; document.body.appendChild(o); }
  o.innerHTML = '<div style="max-width:420px;width:100%;background:#fff;border:1px solid #cfe0db;border-radius:14px;padding:20px;margin-top:6vh">' + html + '</div>'; return o;
}
function licHide() { LIC.locked = false; var o = document.getElementById('licov'); if (o) o.remove(); }
var LIC_IN = 'style="width:100%;padding:10px;border:1px solid #b9cfc8;border-radius:8px;margin:4px 0 10px;font-size:15px;box-sizing:border-box"';
function licActivateUi(msg) {
  var o = licOverlay('<h2 style="margin:0 0 4px">Activate Bill DNA</h2><div style="color:#5a7a72;font-size:13px;margin-bottom:12px">Enter the licence key you received. Internet is needed.</div>' +
    (msg ? '<div id="licmsg" style="background:#fdecea;color:#a12b1f;padding:8px;border-radius:8px;margin-bottom:10px;font-size:13px">' + esc(msg) + '</div>' : '<div id="licmsg"></div>') +
    '<label>Licence key</label><input id="lk" ' + LIC_IN + ' autocomplete="off"><label>Your name</label><input id="ln" ' + LIC_IN + '><label>Mobile number</label><input id="lm" inputmode="numeric" ' + LIC_IN + '><label>Shop / business name</label><input id="ls" ' + LIC_IN + '><label>GSTIN (optional)</label><input id="lg" ' + LIC_IN + '><label>Email (optional)</label><input id="le" ' + LIC_IN + '><label>City</label><input id="lc" ' + LIC_IN + '>' +
    '<label style="display:flex;gap:8px;align-items:flex-start;font-size:13px;margin-bottom:12px"><input id="lq" type="checkbox"> <span>I agree that Bill DNA may keep these details and contact me about my licence, updates and offers.</span></label><button id="lgo" style="width:100%;padding:12px;border:0;border-radius:8px;background:#0b5d4b;color:#fff;font-size:16px">Activate</button>');
  o.querySelector('#lgo').onclick = function () {
    var v = function (i) { return (o.querySelector('#' + i).value || '').trim(); };
    var b = { action: 'activate', key: v('lk'), device: licDevice(), label: (navigator.platform || '') + ' ' + (window.BILLDNA_EXE ? 'exe' : 'web'), buyer: { name: v('ln'), mobile: v('lm'), shop: v('ls'), gstin: v('lg'), email: v('le'), city: v('lc'), consent: !!o.querySelector('#lq').checked } };
    if (!b.key) { o.querySelector('#licmsg').textContent = 'Enter the licence key.'; return; }
    o.querySelector('#lgo').disabled = true; o.querySelector('#lgo').textContent = 'Please wait...';
    licCall(b).then(function (r) {
      if (r && r.ok) { licPut({ key: b.key.toUpperCase(), ok: Date.now(), plan: r.plan, exp: r.expires_at }); LIC.ok = Date.now(); licHide(); licLoop(); }
      else licActivateUi((r && r.msg) || 'Could not activate. Check the key.');
    }).catch(function () { licActivateUi('No internet. Connect to the internet and try again.'); });
  };
}
function licLockUi(msg, retry) {
  LIC.locked = true;
  var o = licOverlay('<h2 style="margin:0 0 8px">Bill DNA is locked</h2><div style="margin-bottom:14px">' + esc(msg) + '</div><div style="color:#5a7a72;font-size:13px;margin-bottom:14px">Your data is safe. It opens again as soon as the check passes.</div>' + (retry ? '<button id="lre" style="width:100%;padding:12px;border:0;border-radius:8px;background:#0b5d4b;color:#fff;font-size:16px">Try again</button>' : ''));
  var b = o.querySelector('#lre'); if (b) b.onclick = function () { b.textContent = 'Checking...'; licCheck(); };
}
function licCheck() {
  var l = licGet(); if (!l) { licActivateUi(''); return; }
  if (LIC.busy) return; LIC.busy = true;
  licCall({ action: 'verify', key: l.key, device: licDevice() }).then(function (r) {
    LIC.busy = false;
    if (r && r.ok) { LIC.ok = Date.now(); l.ok = LIC.ok; l.plan = r.plan; l.exp = r.expires_at; licPut(l); if (document.getElementById('licov')) licHide(); return; }
    var e = r && r.error;
    if (e === 'invalid_key' || e === 'not_activated') { try { localStorage.removeItem('bd_lic'); } catch (x) { } licActivateUi((r && r.msg) || ''); return; }
    LIC.ok = 0; licLockUi((r && r.msg) || 'Licence check failed.', true);
  }).catch(function () { LIC.busy = false; });
}
function licLoop() {
  if (LIC.timer) return;
  LIC.timer = setInterval(function () {
    var l = licGet(); if (!l) return;
    var last = Math.max(LIC.ok || 0, +l.ok || 0);
    if (Date.now() - last > licGrace() && !LIC.locked) { LIC.locked = true; licLockUi('Internet is needed. Connect and try again.', true); }
    if (Date.now() - (LIC.try || 0) > 45000) { LIC.try = Date.now(); licCheck(); }
  }, 5000);
}
function licStart() {
  if (!licOn()) return;
  var l = licGet(); LIC.ok = l ? (+l.ok || 0) : 0;
  if (!l) { licActivateUi(''); } else if (Date.now() - LIC.ok > licGrace()) licLockUi('Checking your licence...', false);
  if (l) licCheck();
  LIC.try = Date.now(); licLoop();
}
//---------------------------------------------------------------------
//
// QR Code Generator for JavaScript
//
// Copyright (c) 2009 Kazuhiko Arase
//
// URL: http://www.d-project.com/
//
// Licensed under the MIT license:
//  http://www.opensource.org/licenses/mit-license.php
//
// The word 'QR Code' is registered trademark of
// DENSO WAVE INCORPORATED
//  http://www.denso-wave.com/qrcode/faqpatent-e.html
//
//---------------------------------------------------------------------

var qrcode = function() {

  //---------------------------------------------------------------------
  // qrcode
  //---------------------------------------------------------------------

  /**
   * qrcode
   * @param typeNumber 1 to 40
   * @param errorCorrectionLevel 'L','M','Q','H'
   */
  var qrcode = function(typeNumber, errorCorrectionLevel) {

    var PAD0 = 0xEC;
    var PAD1 = 0x11;

    var _typeNumber = typeNumber;
    var _errorCorrectionLevel = QRErrorCorrectionLevel[errorCorrectionLevel];
    var _modules = null;
    var _moduleCount = 0;
    var _dataCache = null;
    var _dataList = [];

    var _this = {};

    var makeImpl = function(test, maskPattern) {

      _moduleCount = _typeNumber * 4 + 17;
      _modules = function(moduleCount) {
        var modules = new Array(moduleCount);
        for (var row = 0; row < moduleCount; row += 1) {
          modules[row] = new Array(moduleCount);
          for (var col = 0; col < moduleCount; col += 1) {
            modules[row][col] = null;
          }
        }
        return modules;
      }(_moduleCount);

      setupPositionProbePattern(0, 0);
      setupPositionProbePattern(_moduleCount - 7, 0);
      setupPositionProbePattern(0, _moduleCount - 7);
      setupPositionAdjustPattern();
      setupTimingPattern();
      setupTypeInfo(test, maskPattern);

      if (_typeNumber >= 7) {
        setupTypeNumber(test);
      }

      if (_dataCache == null) {
        _dataCache = createData(_typeNumber, _errorCorrectionLevel, _dataList);
      }

      mapData(_dataCache, maskPattern);
    };

    var setupPositionProbePattern = function(row, col) {

      for (var r = -1; r <= 7; r += 1) {

        if (row + r <= -1 || _moduleCount <= row + r) continue;

        for (var c = -1; c <= 7; c += 1) {

          if (col + c <= -1 || _moduleCount <= col + c) continue;

          if ( (0 <= r && r <= 6 && (c == 0 || c == 6) )
              || (0 <= c && c <= 6 && (r == 0 || r == 6) )
              || (2 <= r && r <= 4 && 2 <= c && c <= 4) ) {
            _modules[row + r][col + c] = true;
          } else {
            _modules[row + r][col + c] = false;
          }
        }
      }
    };

    var getBestMaskPattern = function() {

      var minLostPoint = 0;
      var pattern = 0;

      for (var i = 0; i < 8; i += 1) {

        makeImpl(true, i);

        var lostPoint = QRUtil.getLostPoint(_this);

        if (i == 0 || minLostPoint > lostPoint) {
          minLostPoint = lostPoint;
          pattern = i;
        }
      }

      return pattern;
    };

    var setupTimingPattern = function() {

      for (var r = 8; r < _moduleCount - 8; r += 1) {
        if (_modules[r][6] != null) {
          continue;
        }
        _modules[r][6] = (r % 2 == 0);
      }

      for (var c = 8; c < _moduleCount - 8; c += 1) {
        if (_modules[6][c] != null) {
          continue;
        }
        _modules[6][c] = (c % 2 == 0);
      }
    };

    var setupPositionAdjustPattern = function() {

      var pos = QRUtil.getPatternPosition(_typeNumber);

      for (var i = 0; i < pos.length; i += 1) {

        for (var j = 0; j < pos.length; j += 1) {

          var row = pos[i];
          var col = pos[j];

          if (_modules[row][col] != null) {
            continue;
          }

          for (var r = -2; r <= 2; r += 1) {

            for (var c = -2; c <= 2; c += 1) {

              if (r == -2 || r == 2 || c == -2 || c == 2
                  || (r == 0 && c == 0) ) {
                _modules[row + r][col + c] = true;
              } else {
                _modules[row + r][col + c] = false;
              }
            }
          }
        }
      }
    };

    var setupTypeNumber = function(test) {

      var bits = QRUtil.getBCHTypeNumber(_typeNumber);

      for (var i = 0; i < 18; i += 1) {
        var mod = (!test && ( (bits >> i) & 1) == 1);
        _modules[Math.floor(i / 3)][i % 3 + _moduleCount - 8 - 3] = mod;
      }

      for (var i = 0; i < 18; i += 1) {
        var mod = (!test && ( (bits >> i) & 1) == 1);
        _modules[i % 3 + _moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
      }
    };

    var setupTypeInfo = function(test, maskPattern) {

      var data = (_errorCorrectionLevel << 3) | maskPattern;
      var bits = QRUtil.getBCHTypeInfo(data);

      // vertical
      for (var i = 0; i < 15; i += 1) {

        var mod = (!test && ( (bits >> i) & 1) == 1);

        if (i < 6) {
          _modules[i][8] = mod;
        } else if (i < 8) {
          _modules[i + 1][8] = mod;
        } else {
          _modules[_moduleCount - 15 + i][8] = mod;
        }
      }

      // horizontal
      for (var i = 0; i < 15; i += 1) {

        var mod = (!test && ( (bits >> i) & 1) == 1);

        if (i < 8) {
          _modules[8][_moduleCount - i - 1] = mod;
        } else if (i < 9) {
          _modules[8][15 - i - 1 + 1] = mod;
        } else {
          _modules[8][15 - i - 1] = mod;
        }
      }

      // fixed module
      _modules[_moduleCount - 8][8] = (!test);
    };

    var mapData = function(data, maskPattern) {

      var inc = -1;
      var row = _moduleCount - 1;
      var bitIndex = 7;
      var byteIndex = 0;
      var maskFunc = QRUtil.getMaskFunction(maskPattern);

      for (var col = _moduleCount - 1; col > 0; col -= 2) {

        if (col == 6) col -= 1;

        while (true) {

          for (var c = 0; c < 2; c += 1) {

            if (_modules[row][col - c] == null) {

              var dark = false;

              if (byteIndex < data.length) {
                dark = ( ( (data[byteIndex] >>> bitIndex) & 1) == 1);
              }

              var mask = maskFunc(row, col - c);

              if (mask) {
                dark = !dark;
              }

              _modules[row][col - c] = dark;
              bitIndex -= 1;

              if (bitIndex == -1) {
                byteIndex += 1;
                bitIndex = 7;
              }
            }
          }

          row += inc;

          if (row < 0 || _moduleCount <= row) {
            row -= inc;
            inc = -inc;
            break;
          }
        }
      }
    };

    var createBytes = function(buffer, rsBlocks) {

      var offset = 0;

      var maxDcCount = 0;
      var maxEcCount = 0;

      var dcdata = new Array(rsBlocks.length);
      var ecdata = new Array(rsBlocks.length);

      for (var r = 0; r < rsBlocks.length; r += 1) {

        var dcCount = rsBlocks[r].dataCount;
        var ecCount = rsBlocks[r].totalCount - dcCount;

        maxDcCount = Math.max(maxDcCount, dcCount);
        maxEcCount = Math.max(maxEcCount, ecCount);

        dcdata[r] = new Array(dcCount);

        for (var i = 0; i < dcdata[r].length; i += 1) {
          dcdata[r][i] = 0xff & buffer.getBuffer()[i + offset];
        }
        offset += dcCount;

        var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
        var rawPoly = qrPolynomial(dcdata[r], rsPoly.getLength() - 1);

        var modPoly = rawPoly.mod(rsPoly);
        ecdata[r] = new Array(rsPoly.getLength() - 1);
        for (var i = 0; i < ecdata[r].length; i += 1) {
          var modIndex = i + modPoly.getLength() - ecdata[r].length;
          ecdata[r][i] = (modIndex >= 0)? modPoly.getAt(modIndex) : 0;
        }
      }

      var totalCodeCount = 0;
      for (var i = 0; i < rsBlocks.length; i += 1) {
        totalCodeCount += rsBlocks[i].totalCount;
      }

      var data = new Array(totalCodeCount);
      var index = 0;

      for (var i = 0; i < maxDcCount; i += 1) {
        for (var r = 0; r < rsBlocks.length; r += 1) {
          if (i < dcdata[r].length) {
            data[index] = dcdata[r][i];
            index += 1;
          }
        }
      }

      for (var i = 0; i < maxEcCount; i += 1) {
        for (var r = 0; r < rsBlocks.length; r += 1) {
          if (i < ecdata[r].length) {
            data[index] = ecdata[r][i];
            index += 1;
          }
        }
      }

      return data;
    };

    var createData = function(typeNumber, errorCorrectionLevel, dataList) {

      var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectionLevel);

      var buffer = qrBitBuffer();

      for (var i = 0; i < dataList.length; i += 1) {
        var data = dataList[i];
        buffer.put(data.getMode(), 4);
        buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber) );
        data.write(buffer);
      }

      // calc num max data.
      var totalDataCount = 0;
      for (var i = 0; i < rsBlocks.length; i += 1) {
        totalDataCount += rsBlocks[i].dataCount;
      }

      if (buffer.getLengthInBits() > totalDataCount * 8) {
        throw 'code length overflow. ('
          + buffer.getLengthInBits()
          + '>'
          + totalDataCount * 8
          + ')';
      }

      // end code
      if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
        buffer.put(0, 4);
      }

      // padding
      while (buffer.getLengthInBits() % 8 != 0) {
        buffer.putBit(false);
      }

      // padding
      while (true) {

        if (buffer.getLengthInBits() >= totalDataCount * 8) {
          break;
        }
        buffer.put(PAD0, 8);

        if (buffer.getLengthInBits() >= totalDataCount * 8) {
          break;
        }
        buffer.put(PAD1, 8);
      }

      return createBytes(buffer, rsBlocks);
    };

    _this.addData = function(data, mode) {

      mode = mode || 'Byte';

      var newData = null;

      switch(mode) {
      case 'Numeric' :
        newData = qrNumber(data);
        break;
      case 'Alphanumeric' :
        newData = qrAlphaNum(data);
        break;
      case 'Byte' :
        newData = qr8BitByte(data);
        break;
      case 'Kanji' :
        newData = qrKanji(data);
        break;
      default :
        throw 'mode:' + mode;
      }

      _dataList.push(newData);
      _dataCache = null;
    };

    _this.isDark = function(row, col) {
      if (row < 0 || _moduleCount <= row || col < 0 || _moduleCount <= col) {
        throw row + ',' + col;
      }
      return _modules[row][col];
    };

    _this.getModuleCount = function() {
      return _moduleCount;
    };

    _this.make = function() {
      if (_typeNumber < 1) {
        var typeNumber = 1;

        for (; typeNumber < 40; typeNumber++) {
          var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, _errorCorrectionLevel);
          var buffer = qrBitBuffer();

          for (var i = 0; i < _dataList.length; i++) {
            var data = _dataList[i];
            buffer.put(data.getMode(), 4);
            buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber) );
            data.write(buffer);
          }

          var totalDataCount = 0;
          for (var i = 0; i < rsBlocks.length; i++) {
            totalDataCount += rsBlocks[i].dataCount;
          }

          if (buffer.getLengthInBits() <= totalDataCount * 8) {
            break;
          }
        }

        _typeNumber = typeNumber;
      }

      makeImpl(false, getBestMaskPattern() );
    };

    _this.createTableTag = function(cellSize, margin) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var qrHtml = '';

      qrHtml += '<table style="';
      qrHtml += ' border-width: 0px; border-style: none;';
      qrHtml += ' border-collapse: collapse;';
      qrHtml += ' padding: 0px; margin: ' + margin + 'px;';
      qrHtml += '">';
      qrHtml += '<tbody>';

      for (var r = 0; r < _this.getModuleCount(); r += 1) {

        qrHtml += '<tr>';

        for (var c = 0; c < _this.getModuleCount(); c += 1) {
          qrHtml += '<td style="';
          qrHtml += ' border-width: 0px; border-style: none;';
          qrHtml += ' border-collapse: collapse;';
          qrHtml += ' padding: 0px; margin: 0px;';
          qrHtml += ' width: ' + cellSize + 'px;';
          qrHtml += ' height: ' + cellSize + 'px;';
          qrHtml += ' background-color: ';
          qrHtml += _this.isDark(r, c)? '#000000' : '#ffffff';
          qrHtml += ';';
          qrHtml += '"/>';
        }

        qrHtml += '</tr>';
      }

      qrHtml += '</tbody>';
      qrHtml += '</table>';

      return qrHtml;
    };

    _this.createSvgTag = function(cellSize, margin, alt, title) {

      var opts = {};
      if (typeof arguments[0] == 'object') {
        // Called by options.
        opts = arguments[0];
        // overwrite cellSize and margin.
        cellSize = opts.cellSize;
        margin = opts.margin;
        alt = opts.alt;
        title = opts.title;
      }

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      // Compose alt property surrogate
      alt = (typeof alt === 'string') ? {text: alt} : alt || {};
      alt.text = alt.text || null;
      alt.id = (alt.text) ? alt.id || 'qrcode-description' : null;

      // Compose title property surrogate
      title = (typeof title === 'string') ? {text: title} : title || {};
      title.text = title.text || null;
      title.id = (title.text) ? title.id || 'qrcode-title' : null;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var c, mc, r, mr, qrSvg='', rect;

      rect = 'l' + cellSize + ',0 0,' + cellSize +
        ' -' + cellSize + ',0 0,-' + cellSize + 'z ';

      qrSvg += '<svg version="1.1" xmlns="http://www.w3.org/2000/svg"';
      qrSvg += !opts.scalable ? ' width="' + size + 'px" height="' + size + 'px"' : '';
      qrSvg += ' viewBox="0 0 ' + size + ' ' + size + '" ';
      qrSvg += ' preserveAspectRatio="xMinYMin meet"';
      qrSvg += (title.text || alt.text) ? ' role="img" aria-labelledby="' +
          escapeXml([title.id, alt.id].join(' ').trim() ) + '"' : '';
      qrSvg += '>';
      qrSvg += (title.text) ? '<title id="' + escapeXml(title.id) + '">' +
          escapeXml(title.text) + '</title>' : '';
      qrSvg += (alt.text) ? '<description id="' + escapeXml(alt.id) + '">' +
          escapeXml(alt.text) + '</description>' : '';
      qrSvg += '<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>';
      qrSvg += '<path d="';

      for (r = 0; r < _this.getModuleCount(); r += 1) {
        mr = r * cellSize + margin;
        for (c = 0; c < _this.getModuleCount(); c += 1) {
          if (_this.isDark(r, c) ) {
            mc = c*cellSize+margin;
            qrSvg += 'M' + mc + ',' + mr + rect;
          }
        }
      }

      qrSvg += '" stroke="transparent" fill="black"/>';
      qrSvg += '</svg>';

      return qrSvg;
    };

    _this.createDataURL = function(cellSize, margin) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      return createDataURL(size, size, function(x, y) {
        if (min <= x && x < max && min <= y && y < max) {
          var c = Math.floor( (x - min) / cellSize);
          var r = Math.floor( (y - min) / cellSize);
          return _this.isDark(r, c)? 0 : 1;
        } else {
          return 1;
        }
      } );
    };

    _this.createImgTag = function(cellSize, margin, alt) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;

      var img = '';
      img += '<img';
      img += '\u0020src="';
      img += _this.createDataURL(cellSize, margin);
      img += '"';
      img += '\u0020width="';
      img += size;
      img += '"';
      img += '\u0020height="';
      img += size;
      img += '"';
      if (alt) {
        img += '\u0020alt="';
        img += escapeXml(alt);
        img += '"';
      }
      img += '/>';

      return img;
    };

    var escapeXml = function(s) {
      var escaped = '';
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charAt(i);
        switch(c) {
        case '<': escaped += '&lt;'; break;
        case '>': escaped += '&gt;'; break;
        case '&': escaped += '&amp;'; break;
        case '"': escaped += '&quot;'; break;
        default : escaped += c; break;
        }
      }
      return escaped;
    };

    var _createHalfASCII = function(margin) {
      var cellSize = 1;
      margin = (typeof margin == 'undefined')? cellSize * 2 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      var y, x, r1, r2, p;

      var blocks = {
        '██': '█',
        '█ ': '▀',
        ' █': '▄',
        '  ': ' '
      };

      var blocksLastLineNoMargin = {
        '██': '▀',
        '█ ': '▀',
        ' █': ' ',
        '  ': ' '
      };

      var ascii = '';
      for (y = 0; y < size; y += 2) {
        r1 = Math.floor((y - min) / cellSize);
        r2 = Math.floor((y + 1 - min) / cellSize);
        for (x = 0; x < size; x += 1) {
          p = '█';

          if (min <= x && x < max && min <= y && y < max && _this.isDark(r1, Math.floor((x - min) / cellSize))) {
            p = ' ';
          }

          if (min <= x && x < max && min <= y+1 && y+1 < max && _this.isDark(r2, Math.floor((x - min) / cellSize))) {
            p += ' ';
          }
          else {
            p += '█';
          }

          // Output 2 characters per pixel, to create full square. 1 character per pixels gives only half width of square.
          ascii += (margin < 1 && y+1 >= max) ? blocksLastLineNoMargin[p] : blocks[p];
        }

        ascii += '\n';
      }

      if (size % 2 && margin > 0) {
        return ascii.substring(0, ascii.length - size - 1) + Array(size+1).join('▀');
      }

      return ascii.substring(0, ascii.length-1);
    };

    _this.createASCII = function(cellSize, margin) {
      cellSize = cellSize || 1;

      if (cellSize < 2) {
        return _createHalfASCII(margin);
      }

      cellSize -= 1;
      margin = (typeof margin == 'undefined')? cellSize * 2 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      var y, x, r, p;

      var white = Array(cellSize+1).join('██');
      var black = Array(cellSize+1).join('  ');

      var ascii = '';
      var line = '';
      for (y = 0; y < size; y += 1) {
        r = Math.floor( (y - min) / cellSize);
        line = '';
        for (x = 0; x < size; x += 1) {
          p = 1;

          if (min <= x && x < max && min <= y && y < max && _this.isDark(r, Math.floor((x - min) / cellSize))) {
            p = 0;
          }

          // Output 2 characters per pixel, to create full square. 1 character per pixels gives only half width of square.
          line += p ? white : black;
        }

        for (r = 0; r < cellSize; r += 1) {
          ascii += line + '\n';
        }
      }

      return ascii.substring(0, ascii.length-1);
    };

    _this.renderTo2dContext = function(context, cellSize) {
      cellSize = cellSize || 2;
      var length = _this.getModuleCount();
      for (var row = 0; row < length; row++) {
        for (var col = 0; col < length; col++) {
          context.fillStyle = _this.isDark(row, col) ? 'black' : 'white';
          context.fillRect(row * cellSize, col * cellSize, cellSize, cellSize);
        }
      }
    }

    return _this;
  };

  //---------------------------------------------------------------------
  // qrcode.stringToBytes
  //---------------------------------------------------------------------

  qrcode.stringToBytesFuncs = {
    'default' : function(s) {
      var bytes = [];
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charCodeAt(i);
        bytes.push(c & 0xff);
      }
      return bytes;
    }
  };

  qrcode.stringToBytes = qrcode.stringToBytesFuncs['default'];

  //---------------------------------------------------------------------
  // qrcode.createStringToBytes
  //---------------------------------------------------------------------

  /**
   * @param unicodeData base64 string of byte array.
   * [16bit Unicode],[16bit Bytes], ...
   * @param numChars
   */
  qrcode.createStringToBytes = function(unicodeData, numChars) {

    // create conversion map.

    var unicodeMap = function() {

      var bin = base64DecodeInputStream(unicodeData);
      var read = function() {
        var b = bin.read();
        if (b == -1) throw 'eof';
        return b;
      };

      var count = 0;
      var unicodeMap = {};
      while (true) {
        var b0 = bin.read();
        if (b0 == -1) break;
        var b1 = read();
        var b2 = read();
        var b3 = read();
        var k = String.fromCharCode( (b0 << 8) | b1);
        var v = (b2 << 8) | b3;
        unicodeMap[k] = v;
        count += 1;
      }
      if (count != numChars) {
        throw count + ' != ' + numChars;
      }

      return unicodeMap;
    }();

    var unknownChar = '?'.charCodeAt(0);

    return function(s) {
      var bytes = [];
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charCodeAt(i);
        if (c < 128) {
          bytes.push(c);
        } else {
          var b = unicodeMap[s.charAt(i)];
          if (typeof b == 'number') {
            if ( (b & 0xff) == b) {
              // 1byte
              bytes.push(b);
            } else {
              // 2bytes
              bytes.push(b >>> 8);
              bytes.push(b & 0xff);
            }
          } else {
            bytes.push(unknownChar);
          }
        }
      }
      return bytes;
    };
  };

  //---------------------------------------------------------------------
  // QRMode
  //---------------------------------------------------------------------

  var QRMode = {
    MODE_NUMBER :    1 << 0,
    MODE_ALPHA_NUM : 1 << 1,
    MODE_8BIT_BYTE : 1 << 2,
    MODE_KANJI :     1 << 3
  };

  //---------------------------------------------------------------------
  // QRErrorCorrectionLevel
  //---------------------------------------------------------------------

  var QRErrorCorrectionLevel = {
    L : 1,
    M : 0,
    Q : 3,
    H : 2
  };

  //---------------------------------------------------------------------
  // QRMaskPattern
  //---------------------------------------------------------------------

  var QRMaskPattern = {
    PATTERN000 : 0,
    PATTERN001 : 1,
    PATTERN010 : 2,
    PATTERN011 : 3,
    PATTERN100 : 4,
    PATTERN101 : 5,
    PATTERN110 : 6,
    PATTERN111 : 7
  };

  //---------------------------------------------------------------------
  // QRUtil
  //---------------------------------------------------------------------

  var QRUtil = function() {

    var PATTERN_POSITION_TABLE = [
      [],
      [6, 18],
      [6, 22],
      [6, 26],
      [6, 30],
      [6, 34],
      [6, 22, 38],
      [6, 24, 42],
      [6, 26, 46],
      [6, 28, 50],
      [6, 30, 54],
      [6, 32, 58],
      [6, 34, 62],
      [6, 26, 46, 66],
      [6, 26, 48, 70],
      [6, 26, 50, 74],
      [6, 30, 54, 78],
      [6, 30, 56, 82],
      [6, 30, 58, 86],
      [6, 34, 62, 90],
      [6, 28, 50, 72, 94],
      [6, 26, 50, 74, 98],
      [6, 30, 54, 78, 102],
      [6, 28, 54, 80, 106],
      [6, 32, 58, 84, 110],
      [6, 30, 58, 86, 114],
      [6, 34, 62, 90, 118],
      [6, 26, 50, 74, 98, 122],
      [6, 30, 54, 78, 102, 126],
      [6, 26, 52, 78, 104, 130],
      [6, 30, 56, 82, 108, 134],
      [6, 34, 60, 86, 112, 138],
      [6, 30, 58, 86, 114, 142],
      [6, 34, 62, 90, 118, 146],
      [6, 30, 54, 78, 102, 126, 150],
      [6, 24, 50, 76, 102, 128, 154],
      [6, 28, 54, 80, 106, 132, 158],
      [6, 32, 58, 84, 110, 136, 162],
      [6, 26, 54, 82, 110, 138, 166],
      [6, 30, 58, 86, 114, 142, 170]
    ];
    var G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
    var G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);
    var G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);

    var _this = {};

    var getBCHDigit = function(data) {
      var digit = 0;
      while (data != 0) {
        digit += 1;
        data >>>= 1;
      }
      return digit;
    };

    _this.getBCHTypeInfo = function(data) {
      var d = data << 10;
      while (getBCHDigit(d) - getBCHDigit(G15) >= 0) {
        d ^= (G15 << (getBCHDigit(d) - getBCHDigit(G15) ) );
      }
      return ( (data << 10) | d) ^ G15_MASK;
    };

    _this.getBCHTypeNumber = function(data) {
      var d = data << 12;
      while (getBCHDigit(d) - getBCHDigit(G18) >= 0) {
        d ^= (G18 << (getBCHDigit(d) - getBCHDigit(G18) ) );
      }
      return (data << 12) | d;
    };

    _this.getPatternPosition = function(typeNumber) {
      return PATTERN_POSITION_TABLE[typeNumber - 1];
    };

    _this.getMaskFunction = function(maskPattern) {

      switch (maskPattern) {

      case QRMaskPattern.PATTERN000 :
        return function(i, j) { return (i + j) % 2 == 0; };
      case QRMaskPattern.PATTERN001 :
        return function(i, j) { return i % 2 == 0; };
      case QRMaskPattern.PATTERN010 :
        return function(i, j) { return j % 3 == 0; };
      case QRMaskPattern.PATTERN011 :
        return function(i, j) { return (i + j) % 3 == 0; };
      case QRMaskPattern.PATTERN100 :
        return function(i, j) { return (Math.floor(i / 2) + Math.floor(j / 3) ) % 2 == 0; };
      case QRMaskPattern.PATTERN101 :
        return function(i, j) { return (i * j) % 2 + (i * j) % 3 == 0; };
      case QRMaskPattern.PATTERN110 :
        return function(i, j) { return ( (i * j) % 2 + (i * j) % 3) % 2 == 0; };
      case QRMaskPattern.PATTERN111 :
        return function(i, j) { return ( (i * j) % 3 + (i + j) % 2) % 2 == 0; };

      default :
        throw 'bad maskPattern:' + maskPattern;
      }
    };

    _this.getErrorCorrectPolynomial = function(errorCorrectLength) {
      var a = qrPolynomial([1], 0);
      for (var i = 0; i < errorCorrectLength; i += 1) {
        a = a.multiply(qrPolynomial([1, QRMath.gexp(i)], 0) );
      }
      return a;
    };

    _this.getLengthInBits = function(mode, type) {

      if (1 <= type && type < 10) {

        // 1 - 9

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 10;
        case QRMode.MODE_ALPHA_NUM : return 9;
        case QRMode.MODE_8BIT_BYTE : return 8;
        case QRMode.MODE_KANJI     : return 8;
        default :
          throw 'mode:' + mode;
        }

      } else if (type < 27) {

        // 10 - 26

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 12;
        case QRMode.MODE_ALPHA_NUM : return 11;
        case QRMode.MODE_8BIT_BYTE : return 16;
        case QRMode.MODE_KANJI     : return 10;
        default :
          throw 'mode:' + mode;
        }

      } else if (type < 41) {

        // 27 - 40

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 14;
        case QRMode.MODE_ALPHA_NUM : return 13;
        case QRMode.MODE_8BIT_BYTE : return 16;
        case QRMode.MODE_KANJI     : return 12;
        default :
          throw 'mode:' + mode;
        }

      } else {
        throw 'type:' + type;
      }
    };

    _this.getLostPoint = function(qrcode) {

      var moduleCount = qrcode.getModuleCount();

      var lostPoint = 0;

      // LEVEL1

      for (var row = 0; row < moduleCount; row += 1) {
        for (var col = 0; col < moduleCount; col += 1) {

          var sameCount = 0;
          var dark = qrcode.isDark(row, col);

          for (var r = -1; r <= 1; r += 1) {

            if (row + r < 0 || moduleCount <= row + r) {
              continue;
            }

            for (var c = -1; c <= 1; c += 1) {

              if (col + c < 0 || moduleCount <= col + c) {
                continue;
              }

              if (r == 0 && c == 0) {
                continue;
              }

              if (dark == qrcode.isDark(row + r, col + c) ) {
                sameCount += 1;
              }
            }
          }

          if (sameCount > 5) {
            lostPoint += (3 + sameCount - 5);
          }
        }
      };

      // LEVEL2

      for (var row = 0; row < moduleCount - 1; row += 1) {
        for (var col = 0; col < moduleCount - 1; col += 1) {
          var count = 0;
          if (qrcode.isDark(row, col) ) count += 1;
          if (qrcode.isDark(row + 1, col) ) count += 1;
          if (qrcode.isDark(row, col + 1) ) count += 1;
          if (qrcode.isDark(row + 1, col + 1) ) count += 1;
          if (count == 0 || count == 4) {
            lostPoint += 3;
          }
        }
      }

      // LEVEL3

      for (var row = 0; row < moduleCount; row += 1) {
        for (var col = 0; col < moduleCount - 6; col += 1) {
          if (qrcode.isDark(row, col)
              && !qrcode.isDark(row, col + 1)
              &&  qrcode.isDark(row, col + 2)
              &&  qrcode.isDark(row, col + 3)
              &&  qrcode.isDark(row, col + 4)
              && !qrcode.isDark(row, col + 5)
              &&  qrcode.isDark(row, col + 6) ) {
            lostPoint += 40;
          }
        }
      }

      for (var col = 0; col < moduleCount; col += 1) {
        for (var row = 0; row < moduleCount - 6; row += 1) {
          if (qrcode.isDark(row, col)
              && !qrcode.isDark(row + 1, col)
              &&  qrcode.isDark(row + 2, col)
              &&  qrcode.isDark(row + 3, col)
              &&  qrcode.isDark(row + 4, col)
              && !qrcode.isDark(row + 5, col)
              &&  qrcode.isDark(row + 6, col) ) {
            lostPoint += 40;
          }
        }
      }

      // LEVEL4

      var darkCount = 0;

      for (var col = 0; col < moduleCount; col += 1) {
        for (var row = 0; row < moduleCount; row += 1) {
          if (qrcode.isDark(row, col) ) {
            darkCount += 1;
          }
        }
      }

      var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
      lostPoint += ratio * 10;

      return lostPoint;
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // QRMath
  //---------------------------------------------------------------------

  var QRMath = function() {

    var EXP_TABLE = new Array(256);
    var LOG_TABLE = new Array(256);

    // initialize tables
    for (var i = 0; i < 8; i += 1) {
      EXP_TABLE[i] = 1 << i;
    }
    for (var i = 8; i < 256; i += 1) {
      EXP_TABLE[i] = EXP_TABLE[i - 4]
        ^ EXP_TABLE[i - 5]
        ^ EXP_TABLE[i - 6]
        ^ EXP_TABLE[i - 8];
    }
    for (var i = 0; i < 255; i += 1) {
      LOG_TABLE[EXP_TABLE[i] ] = i;
    }

    var _this = {};

    _this.glog = function(n) {

      if (n < 1) {
        throw 'glog(' + n + ')';
      }

      return LOG_TABLE[n];
    };

    _this.gexp = function(n) {

      while (n < 0) {
        n += 255;
      }

      while (n >= 256) {
        n -= 255;
      }

      return EXP_TABLE[n];
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // qrPolynomial
  //---------------------------------------------------------------------

  function qrPolynomial(num, shift) {

    if (typeof num.length == 'undefined') {
      throw num.length + '/' + shift;
    }

    var _num = function() {
      var offset = 0;
      while (offset < num.length && num[offset] == 0) {
        offset += 1;
      }
      var _num = new Array(num.length - offset + shift);
      for (var i = 0; i < num.length - offset; i += 1) {
        _num[i] = num[i + offset];
      }
      return _num;
    }();

    var _this = {};

    _this.getAt = function(index) {
      return _num[index];
    };

    _this.getLength = function() {
      return _num.length;
    };

    _this.multiply = function(e) {

      var num = new Array(_this.getLength() + e.getLength() - 1);

      for (var i = 0; i < _this.getLength(); i += 1) {
        for (var j = 0; j < e.getLength(); j += 1) {
          num[i + j] ^= QRMath.gexp(QRMath.glog(_this.getAt(i) ) + QRMath.glog(e.getAt(j) ) );
        }
      }

      return qrPolynomial(num, 0);
    };

    _this.mod = function(e) {

      if (_this.getLength() - e.getLength() < 0) {
        return _this;
      }

      var ratio = QRMath.glog(_this.getAt(0) ) - QRMath.glog(e.getAt(0) );

      var num = new Array(_this.getLength() );
      for (var i = 0; i < _this.getLength(); i += 1) {
        num[i] = _this.getAt(i);
      }

      for (var i = 0; i < e.getLength(); i += 1) {
        num[i] ^= QRMath.gexp(QRMath.glog(e.getAt(i) ) + ratio);
      }

      // recursive call
      return qrPolynomial(num, 0).mod(e);
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // QRRSBlock
  //---------------------------------------------------------------------

  var QRRSBlock = function() {

    var RS_BLOCK_TABLE = [

      // L
      // M
      // Q
      // H

      // 1
      [1, 26, 19],
      [1, 26, 16],
      [1, 26, 13],
      [1, 26, 9],

      // 2
      [1, 44, 34],
      [1, 44, 28],
      [1, 44, 22],
      [1, 44, 16],

      // 3
      [1, 70, 55],
      [1, 70, 44],
      [2, 35, 17],
      [2, 35, 13],

      // 4
      [1, 100, 80],
      [2, 50, 32],
      [2, 50, 24],
      [4, 25, 9],

      // 5
      [1, 134, 108],
      [2, 67, 43],
      [2, 33, 15, 2, 34, 16],
      [2, 33, 11, 2, 34, 12],

      // 6
      [2, 86, 68],
      [4, 43, 27],
      [4, 43, 19],
      [4, 43, 15],

      // 7
      [2, 98, 78],
      [4, 49, 31],
      [2, 32, 14, 4, 33, 15],
      [4, 39, 13, 1, 40, 14],

      // 8
      [2, 121, 97],
      [2, 60, 38, 2, 61, 39],
      [4, 40, 18, 2, 41, 19],
      [4, 40, 14, 2, 41, 15],

      // 9
      [2, 146, 116],
      [3, 58, 36, 2, 59, 37],
      [4, 36, 16, 4, 37, 17],
      [4, 36, 12, 4, 37, 13],

      // 10
      [2, 86, 68, 2, 87, 69],
      [4, 69, 43, 1, 70, 44],
      [6, 43, 19, 2, 44, 20],
      [6, 43, 15, 2, 44, 16],

      // 11
      [4, 101, 81],
      [1, 80, 50, 4, 81, 51],
      [4, 50, 22, 4, 51, 23],
      [3, 36, 12, 8, 37, 13],

      // 12
      [2, 116, 92, 2, 117, 93],
      [6, 58, 36, 2, 59, 37],
      [4, 46, 20, 6, 47, 21],
      [7, 42, 14, 4, 43, 15],

      // 13
      [4, 133, 107],
      [8, 59, 37, 1, 60, 38],
      [8, 44, 20, 4, 45, 21],
      [12, 33, 11, 4, 34, 12],

      // 14
      [3, 145, 115, 1, 146, 116],
      [4, 64, 40, 5, 65, 41],
      [11, 36, 16, 5, 37, 17],
      [11, 36, 12, 5, 37, 13],

      // 15
      [5, 109, 87, 1, 110, 88],
      [5, 65, 41, 5, 66, 42],
      [5, 54, 24, 7, 55, 25],
      [11, 36, 12, 7, 37, 13],

      // 16
      [5, 122, 98, 1, 123, 99],
      [7, 73, 45, 3, 74, 46],
      [15, 43, 19, 2, 44, 20],
      [3, 45, 15, 13, 46, 16],

      // 17
      [1, 135, 107, 5, 136, 108],
      [10, 74, 46, 1, 75, 47],
      [1, 50, 22, 15, 51, 23],
      [2, 42, 14, 17, 43, 15],

      // 18
      [5, 150, 120, 1, 151, 121],
      [9, 69, 43, 4, 70, 44],
      [17, 50, 22, 1, 51, 23],
      [2, 42, 14, 19, 43, 15],

      // 19
      [3, 141, 113, 4, 142, 114],
      [3, 70, 44, 11, 71, 45],
      [17, 47, 21, 4, 48, 22],
      [9, 39, 13, 16, 40, 14],

      // 20
      [3, 135, 107, 5, 136, 108],
      [3, 67, 41, 13, 68, 42],
      [15, 54, 24, 5, 55, 25],
      [15, 43, 15, 10, 44, 16],

      // 21
      [4, 144, 116, 4, 145, 117],
      [17, 68, 42],
      [17, 50, 22, 6, 51, 23],
      [19, 46, 16, 6, 47, 17],

      // 22
      [2, 139, 111, 7, 140, 112],
      [17, 74, 46],
      [7, 54, 24, 16, 55, 25],
      [34, 37, 13],

      // 23
      [4, 151, 121, 5, 152, 122],
      [4, 75, 47, 14, 76, 48],
      [11, 54, 24, 14, 55, 25],
      [16, 45, 15, 14, 46, 16],

      // 24
      [6, 147, 117, 4, 148, 118],
      [6, 73, 45, 14, 74, 46],
      [11, 54, 24, 16, 55, 25],
      [30, 46, 16, 2, 47, 17],

      // 25
      [8, 132, 106, 4, 133, 107],
      [8, 75, 47, 13, 76, 48],
      [7, 54, 24, 22, 55, 25],
      [22, 45, 15, 13, 46, 16],

      // 26
      [10, 142, 114, 2, 143, 115],
      [19, 74, 46, 4, 75, 47],
      [28, 50, 22, 6, 51, 23],
      [33, 46, 16, 4, 47, 17],

      // 27
      [8, 152, 122, 4, 153, 123],
      [22, 73, 45, 3, 74, 46],
      [8, 53, 23, 26, 54, 24],
      [12, 45, 15, 28, 46, 16],

      // 28
      [3, 147, 117, 10, 148, 118],
      [3, 73, 45, 23, 74, 46],
      [4, 54, 24, 31, 55, 25],
      [11, 45, 15, 31, 46, 16],

      // 29
      [7, 146, 116, 7, 147, 117],
      [21, 73, 45, 7, 74, 46],
      [1, 53, 23, 37, 54, 24],
      [19, 45, 15, 26, 46, 16],

      // 30
      [5, 145, 115, 10, 146, 116],
      [19, 75, 47, 10, 76, 48],
      [15, 54, 24, 25, 55, 25],
      [23, 45, 15, 25, 46, 16],

      // 31
      [13, 145, 115, 3, 146, 116],
      [2, 74, 46, 29, 75, 47],
      [42, 54, 24, 1, 55, 25],
      [23, 45, 15, 28, 46, 16],

      // 32
      [17, 145, 115],
      [10, 74, 46, 23, 75, 47],
      [10, 54, 24, 35, 55, 25],
      [19, 45, 15, 35, 46, 16],

      // 33
      [17, 145, 115, 1, 146, 116],
      [14, 74, 46, 21, 75, 47],
      [29, 54, 24, 19, 55, 25],
      [11, 45, 15, 46, 46, 16],

      // 34
      [13, 145, 115, 6, 146, 116],
      [14, 74, 46, 23, 75, 47],
      [44, 54, 24, 7, 55, 25],
      [59, 46, 16, 1, 47, 17],

      // 35
      [12, 151, 121, 7, 152, 122],
      [12, 75, 47, 26, 76, 48],
      [39, 54, 24, 14, 55, 25],
      [22, 45, 15, 41, 46, 16],

      // 36
      [6, 151, 121, 14, 152, 122],
      [6, 75, 47, 34, 76, 48],
      [46, 54, 24, 10, 55, 25],
      [2, 45, 15, 64, 46, 16],

      // 37
      [17, 152, 122, 4, 153, 123],
      [29, 74, 46, 14, 75, 47],
      [49, 54, 24, 10, 55, 25],
      [24, 45, 15, 46, 46, 16],

      // 38
      [4, 152, 122, 18, 153, 123],
      [13, 74, 46, 32, 75, 47],
      [48, 54, 24, 14, 55, 25],
      [42, 45, 15, 32, 46, 16],

      // 39
      [20, 147, 117, 4, 148, 118],
      [40, 75, 47, 7, 76, 48],
      [43, 54, 24, 22, 55, 25],
      [10, 45, 15, 67, 46, 16],

      // 40
      [19, 148, 118, 6, 149, 119],
      [18, 75, 47, 31, 76, 48],
      [34, 54, 24, 34, 55, 25],
      [20, 45, 15, 61, 46, 16]
    ];

    var qrRSBlock = function(totalCount, dataCount) {
      var _this = {};
      _this.totalCount = totalCount;
      _this.dataCount = dataCount;
      return _this;
    };

    var _this = {};

    var getRsBlockTable = function(typeNumber, errorCorrectionLevel) {

      switch(errorCorrectionLevel) {
      case QRErrorCorrectionLevel.L :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
      case QRErrorCorrectionLevel.M :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
      case QRErrorCorrectionLevel.Q :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
      case QRErrorCorrectionLevel.H :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
      default :
        return undefined;
      }
    };

    _this.getRSBlocks = function(typeNumber, errorCorrectionLevel) {

      var rsBlock = getRsBlockTable(typeNumber, errorCorrectionLevel);

      if (typeof rsBlock == 'undefined') {
        throw 'bad rs block @ typeNumber:' + typeNumber +
            '/errorCorrectionLevel:' + errorCorrectionLevel;
      }

      var length = rsBlock.length / 3;

      var list = [];

      for (var i = 0; i < length; i += 1) {

        var count = rsBlock[i * 3 + 0];
        var totalCount = rsBlock[i * 3 + 1];
        var dataCount = rsBlock[i * 3 + 2];

        for (var j = 0; j < count; j += 1) {
          list.push(qrRSBlock(totalCount, dataCount) );
        }
      }

      return list;
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // qrBitBuffer
  //---------------------------------------------------------------------

  var qrBitBuffer = function() {

    var _buffer = [];
    var _length = 0;

    var _this = {};

    _this.getBuffer = function() {
      return _buffer;
    };

    _this.getAt = function(index) {
      var bufIndex = Math.floor(index / 8);
      return ( (_buffer[bufIndex] >>> (7 - index % 8) ) & 1) == 1;
    };

    _this.put = function(num, length) {
      for (var i = 0; i < length; i += 1) {
        _this.putBit( ( (num >>> (length - i - 1) ) & 1) == 1);
      }
    };

    _this.getLengthInBits = function() {
      return _length;
    };

    _this.putBit = function(bit) {

      var bufIndex = Math.floor(_length / 8);
      if (_buffer.length <= bufIndex) {
        _buffer.push(0);
      }

      if (bit) {
        _buffer[bufIndex] |= (0x80 >>> (_length % 8) );
      }

      _length += 1;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrNumber
  //---------------------------------------------------------------------

  var qrNumber = function(data) {

    var _mode = QRMode.MODE_NUMBER;
    var _data = data;

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _data.length;
    };

    _this.write = function(buffer) {

      var data = _data;

      var i = 0;

      while (i + 2 < data.length) {
        buffer.put(strToNum(data.substring(i, i + 3) ), 10);
        i += 3;
      }

      if (i < data.length) {
        if (data.length - i == 1) {
          buffer.put(strToNum(data.substring(i, i + 1) ), 4);
        } else if (data.length - i == 2) {
          buffer.put(strToNum(data.substring(i, i + 2) ), 7);
        }
      }
    };

    var strToNum = function(s) {
      var num = 0;
      for (var i = 0; i < s.length; i += 1) {
        num = num * 10 + chatToNum(s.charAt(i) );
      }
      return num;
    };

    var chatToNum = function(c) {
      if ('0' <= c && c <= '9') {
        return c.charCodeAt(0) - '0'.charCodeAt(0);
      }
      throw 'illegal char :' + c;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrAlphaNum
  //---------------------------------------------------------------------

  var qrAlphaNum = function(data) {

    var _mode = QRMode.MODE_ALPHA_NUM;
    var _data = data;

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _data.length;
    };

    _this.write = function(buffer) {

      var s = _data;

      var i = 0;

      while (i + 1 < s.length) {
        buffer.put(
          getCode(s.charAt(i) ) * 45 +
          getCode(s.charAt(i + 1) ), 11);
        i += 2;
      }

      if (i < s.length) {
        buffer.put(getCode(s.charAt(i) ), 6);
      }
    };

    var getCode = function(c) {

      if ('0' <= c && c <= '9') {
        return c.charCodeAt(0) - '0'.charCodeAt(0);
      } else if ('A' <= c && c <= 'Z') {
        return c.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
      } else {
        switch (c) {
        case ' ' : return 36;
        case '$' : return 37;
        case '%' : return 38;
        case '*' : return 39;
        case '+' : return 40;
        case '-' : return 41;
        case '.' : return 42;
        case '/' : return 43;
        case ':' : return 44;
        default :
          throw 'illegal char :' + c;
        }
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qr8BitByte
  //---------------------------------------------------------------------

  var qr8BitByte = function(data) {

    var _mode = QRMode.MODE_8BIT_BYTE;
    var _data = data;
    var _bytes = qrcode.stringToBytes(data);

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _bytes.length;
    };

    _this.write = function(buffer) {
      for (var i = 0; i < _bytes.length; i += 1) {
        buffer.put(_bytes[i], 8);
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrKanji
  //---------------------------------------------------------------------

  var qrKanji = function(data) {

    var _mode = QRMode.MODE_KANJI;
    var _data = data;

    var stringToBytes = qrcode.stringToBytesFuncs['SJIS'];
    if (!stringToBytes) {
      throw 'sjis not supported.';
    }
    !function(c, code) {
      // self test for sjis support.
      var test = stringToBytes(c);
      if (test.length != 2 || ( (test[0] << 8) | test[1]) != code) {
        throw 'sjis not supported.';
      }
    }('\u53cb', 0x9746);

    var _bytes = stringToBytes(data);

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return ~~(_bytes.length / 2);
    };

    _this.write = function(buffer) {

      var data = _bytes;

      var i = 0;

      while (i + 1 < data.length) {

        var c = ( (0xff & data[i]) << 8) | (0xff & data[i + 1]);

        if (0x8140 <= c && c <= 0x9FFC) {
          c -= 0x8140;
        } else if (0xE040 <= c && c <= 0xEBBF) {
          c -= 0xC140;
        } else {
          throw 'illegal char at ' + (i + 1) + '/' + c;
        }

        c = ( (c >>> 8) & 0xff) * 0xC0 + (c & 0xff);

        buffer.put(c, 13);

        i += 2;
      }

      if (i < data.length) {
        throw 'illegal char at ' + (i + 1);
      }
    };

    return _this;
  };

  //=====================================================================
  // GIF Support etc.
  //

  //---------------------------------------------------------------------
  // byteArrayOutputStream
  //---------------------------------------------------------------------

  var byteArrayOutputStream = function() {

    var _bytes = [];

    var _this = {};

    _this.writeByte = function(b) {
      _bytes.push(b & 0xff);
    };

    _this.writeShort = function(i) {
      _this.writeByte(i);
      _this.writeByte(i >>> 8);
    };

    _this.writeBytes = function(b, off, len) {
      off = off || 0;
      len = len || b.length;
      for (var i = 0; i < len; i += 1) {
        _this.writeByte(b[i + off]);
      }
    };

    _this.writeString = function(s) {
      for (var i = 0; i < s.length; i += 1) {
        _this.writeByte(s.charCodeAt(i) );
      }
    };

    _this.toByteArray = function() {
      return _bytes;
    };

    _this.toString = function() {
      var s = '';
      s += '[';
      for (var i = 0; i < _bytes.length; i += 1) {
        if (i > 0) {
          s += ',';
        }
        s += _bytes[i];
      }
      s += ']';
      return s;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // base64EncodeOutputStream
  //---------------------------------------------------------------------

  var base64EncodeOutputStream = function() {

    var _buffer = 0;
    var _buflen = 0;
    var _length = 0;
    var _base64 = '';

    var _this = {};

    var writeEncoded = function(b) {
      _base64 += String.fromCharCode(encode(b & 0x3f) );
    };

    var encode = function(n) {
      if (n < 0) {
        // error.
      } else if (n < 26) {
        return 0x41 + n;
      } else if (n < 52) {
        return 0x61 + (n - 26);
      } else if (n < 62) {
        return 0x30 + (n - 52);
      } else if (n == 62) {
        return 0x2b;
      } else if (n == 63) {
        return 0x2f;
      }
      throw 'n:' + n;
    };

    _this.writeByte = function(n) {

      _buffer = (_buffer << 8) | (n & 0xff);
      _buflen += 8;
      _length += 1;

      while (_buflen >= 6) {
        writeEncoded(_buffer >>> (_buflen - 6) );
        _buflen -= 6;
      }
    };

    _this.flush = function() {

      if (_buflen > 0) {
        writeEncoded(_buffer << (6 - _buflen) );
        _buffer = 0;
        _buflen = 0;
      }

      if (_length % 3 != 0) {
        // padding
        var padlen = 3 - _length % 3;
        for (var i = 0; i < padlen; i += 1) {
          _base64 += '=';
        }
      }
    };

    _this.toString = function() {
      return _base64;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // base64DecodeInputStream
  //---------------------------------------------------------------------

  var base64DecodeInputStream = function(str) {

    var _str = str;
    var _pos = 0;
    var _buffer = 0;
    var _buflen = 0;

    var _this = {};

    _this.read = function() {

      while (_buflen < 8) {

        if (_pos >= _str.length) {
          if (_buflen == 0) {
            return -1;
          }
          throw 'unexpected end of file./' + _buflen;
        }

        var c = _str.charAt(_pos);
        _pos += 1;

        if (c == '=') {
          _buflen = 0;
          return -1;
        } else if (c.match(/^\s$/) ) {
          // ignore if whitespace.
          continue;
        }

        _buffer = (_buffer << 6) | decode(c.charCodeAt(0) );
        _buflen += 6;
      }

      var n = (_buffer >>> (_buflen - 8) ) & 0xff;
      _buflen -= 8;
      return n;
    };

    var decode = function(c) {
      if (0x41 <= c && c <= 0x5a) {
        return c - 0x41;
      } else if (0x61 <= c && c <= 0x7a) {
        return c - 0x61 + 26;
      } else if (0x30 <= c && c <= 0x39) {
        return c - 0x30 + 52;
      } else if (c == 0x2b) {
        return 62;
      } else if (c == 0x2f) {
        return 63;
      } else {
        throw 'c:' + c;
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // gifImage (B/W)
  //---------------------------------------------------------------------

  var gifImage = function(width, height) {

    var _width = width;
    var _height = height;
    var _data = new Array(width * height);

    var _this = {};

    _this.setPixel = function(x, y, pixel) {
      _data[y * _width + x] = pixel;
    };

    _this.write = function(out) {

      //---------------------------------
      // GIF Signature

      out.writeString('GIF87a');

      //---------------------------------
      // Screen Descriptor

      out.writeShort(_width);
      out.writeShort(_height);

      out.writeByte(0x80); // 2bit
      out.writeByte(0);
      out.writeByte(0);

      //---------------------------------
      // Global Color Map

      // black
      out.writeByte(0x00);
      out.writeByte(0x00);
      out.writeByte(0x00);

      // white
      out.writeByte(0xff);
      out.writeByte(0xff);
      out.writeByte(0xff);

      //---------------------------------
      // Image Descriptor

      out.writeString(',');
      out.writeShort(0);
      out.writeShort(0);
      out.writeShort(_width);
      out.writeShort(_height);
      out.writeByte(0);

      //---------------------------------
      // Local Color Map

      //---------------------------------
      // Raster Data

      var lzwMinCodeSize = 2;
      var raster = getLZWRaster(lzwMinCodeSize);

      out.writeByte(lzwMinCodeSize);

      var offset = 0;

      while (raster.length - offset > 255) {
        out.writeByte(255);
        out.writeBytes(raster, offset, 255);
        offset += 255;
      }

      out.writeByte(raster.length - offset);
      out.writeBytes(raster, offset, raster.length - offset);
      out.writeByte(0x00);

      //---------------------------------
      // GIF Terminator
      out.writeString(';');
    };

    var bitOutputStream = function(out) {

      var _out = out;
      var _bitLength = 0;
      var _bitBuffer = 0;

      var _this = {};

      _this.write = function(data, length) {

        if ( (data >>> length) != 0) {
          throw 'length over';
        }

        while (_bitLength + length >= 8) {
          _out.writeByte(0xff & ( (data << _bitLength) | _bitBuffer) );
          length -= (8 - _bitLength);
          data >>>= (8 - _bitLength);
          _bitBuffer = 0;
          _bitLength = 0;
        }

        _bitBuffer = (data << _bitLength) | _bitBuffer;
        _bitLength = _bitLength + length;
      };

      _this.flush = function() {
        if (_bitLength > 0) {
          _out.writeByte(_bitBuffer);
        }
      };

      return _this;
    };

    var getLZWRaster = function(lzwMinCodeSize) {

      var clearCode = 1 << lzwMinCodeSize;
      var endCode = (1 << lzwMinCodeSize) + 1;
      var bitLength = lzwMinCodeSize + 1;

      // Setup LZWTable
      var table = lzwTable();

      for (var i = 0; i < clearCode; i += 1) {
        table.add(String.fromCharCode(i) );
      }
      table.add(String.fromCharCode(clearCode) );
      table.add(String.fromCharCode(endCode) );

      var byteOut = byteArrayOutputStream();
      var bitOut = bitOutputStream(byteOut);

      // clear code
      bitOut.write(clearCode, bitLength);

      var dataIndex = 0;

      var s = String.fromCharCode(_data[dataIndex]);
      dataIndex += 1;

      while (dataIndex < _data.length) {

        var c = String.fromCharCode(_data[dataIndex]);
        dataIndex += 1;

        if (table.contains(s + c) ) {

          s = s + c;

        } else {

          bitOut.write(table.indexOf(s), bitLength);

          if (table.size() < 0xfff) {

            if (table.size() == (1 << bitLength) ) {
              bitLength += 1;
            }

            table.add(s + c);
          }

          s = c;
        }
      }

      bitOut.write(table.indexOf(s), bitLength);

      // end code
      bitOut.write(endCode, bitLength);

      bitOut.flush();

      return byteOut.toByteArray();
    };

    var lzwTable = function() {

      var _map = {};
      var _size = 0;

      var _this = {};

      _this.add = function(key) {
        if (_this.contains(key) ) {
          throw 'dup key:' + key;
        }
        _map[key] = _size;
        _size += 1;
      };

      _this.size = function() {
        return _size;
      };

      _this.indexOf = function(key) {
        return _map[key];
      };

      _this.contains = function(key) {
        return typeof _map[key] != 'undefined';
      };

      return _this;
    };

    return _this;
  };

  var createDataURL = function(width, height, getPixel) {
    var gif = gifImage(width, height);
    for (var y = 0; y < height; y += 1) {
      for (var x = 0; x < width; x += 1) {
        gif.setPixel(x, y, getPixel(x, y) );
      }
    }

    var b = byteArrayOutputStream();
    gif.write(b);

    var base64 = base64EncodeOutputStream();
    var bytes = b.toByteArray();
    for (var i = 0; i < bytes.length; i += 1) {
      base64.writeByte(bytes[i]);
    }
    base64.flush();

    return 'data:image/gif;base64,' + base64;
  };

  //---------------------------------------------------------------------
  // returns qrcode function.

  return qrcode;
}();

// multibyte support
!function() {

  qrcode.stringToBytesFuncs['UTF-8'] = function(s) {
    // http://stackoverflow.com/questions/18729405/how-to-convert-utf8-string-to-byte-array
    function toUTF8Array(str) {
      var utf8 = [];
      for (var i=0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
          utf8.push(0xc0 | (charcode >> 6),
              0x80 | (charcode & 0x3f));
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
          utf8.push(0xe0 | (charcode >> 12),
              0x80 | ((charcode>>6) & 0x3f),
              0x80 | (charcode & 0x3f));
        }
        // surrogate pair
        else {
          i++;
          // UTF-16 encodes 0x10000-0x10FFFF by
          // subtracting 0x10000 and splitting the
          // 20 bits of 0x0-0xFFFFF into two halves
          charcode = 0x10000 + (((charcode & 0x3ff)<<10)
            | (str.charCodeAt(i) & 0x3ff));
          utf8.push(0xf0 | (charcode >>18),
              0x80 | ((charcode>>12) & 0x3f),
              0x80 | ((charcode>>6) & 0x3f),
              0x80 | (charcode & 0x3f));
        }
      }
      return utf8;
    }
    return toUTF8Array(s);
  };

}();


/* ---------- UPI payment QR on invoices ---------- */
function upiOk(v) { return /^[a-zA-Z0-9._-]{2,}@[a-zA-Z][a-zA-Z0-9.-]{1,}$/.test(String(v || '').trim()); }
function upiBal(C, d) { return d && d.type === 'invoice' && !d.cancelled ? Math.max(0, outstanding(C, d)) : 0; }
function upiLink(C, d, paise) {
  var u = String(C.bank.upi).trim();
  return 'upi://pay?pa=' + encodeURIComponent(u).replace(/%40/g, '@') + '&pn=' + encodeURIComponent(String(C.name || '').slice(0, 40)) + '&am=' + (paise / 100).toFixed(2) + '&cu=INR&tn=' + encodeURIComponent('Bill ' + d.no);
}
function upiMatrix(text) {
  var q = qrcode(0, 'M'); q.addData(text, 'Byte'); q.make();
  var n = q.getModuleCount(), m = []; for (var r = 0; r < n; r++) { m[r] = []; for (var c = 0; c < n; c++) m[r][c] = q.isDark(r, c); } return m;
}
function upiSvg(text, px) {
  var m = upiMatrix(text), n = m.length, b = 3, p = '';
  for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (m[r][c]) p += 'M' + (c + b) + ' ' + (r + b) + 'h1v1h-1z';
  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + px + '" height="' + px + '" viewBox="0 0 ' + (n + 2 * b) + ' ' + (n + 2 * b) + '" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path d="' + p + '" fill="#000"/></svg>';
}
function upiBlockH(C, d) {
  var bal = upiBal(C, d); if (!bal || !C.bank || !upiOk(C.bank.upi)) return '';
  return '<div class="upiqr" style="display:flex;gap:12px;align-items:center;margin:10px 0;page-break-inside:avoid">' + upiSvg(upiLink(C, d, bal), 120) + '<div><b>Scan to pay ' + money(bal) + '</b><div class="note">Any UPI app. UPI ID: ' + esc(C.bank.upi) + '</div></div></div>';
}
function pdfUpi(doc, C, d, x, y, size) {
  var bal = upiBal(C, d); if (!bal || !C.bank || !upiOk(C.bank.upi)) return 0;
  var m = upiMatrix(upiLink(C, d, bal)), n = m.length, b = 3, cell = size / (n + 2 * b);
  doc.setFillColor(255); doc.rect(x, y, size, size, 'F'); doc.setFillColor(0);
  for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (m[r][c]) doc.rect(x + (c + b) * cell, y + (r + b) * cell, cell + 0.15, cell + 0.15, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); doc.setTextColor(21); doc.text('Scan to pay ' + inr(bal), x + size + 10, y + size / 2 - 2);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.text('Any UPI app. UPI ID: ' + pdfTxt(C.bank.upi), x + size + 10, y + size / 2 + 11);
  return size + 10;
}
/* ---------- thermal receipt (58 / 80 mm roll printers) ---------- */
function rcptHtml(C, d, w) {
  var t = DT[d.type], p = partyById(C, d.partyId) || {}, mm = w === 58 ? 48 : 72, fs = w === 58 ? 10 : 11;
  var title = t.tax && d.type === 'invoice' ? (C.scheme === 'composition' ? 'BILL OF SUPPLY' : C.scheme === 'notax' ? 'CASH BILL' : 'TAX INVOICE') : t.label.toUpperCase();
  var line = '<div style="border-top:1px dashed #000;margin:4px 0"></div>', row = function (a, b, bold) { return '<div style="display:flex;justify-content:space-between;gap:6px' + (bold ? ';font-weight:700' : '') + '"><span>' + a + '</span><span>' + b + '</span></div>'; };
  var h = '<div style="width:' + mm + 'mm;font:' + fs + 'px/1.35 \'Courier New\',monospace;color:#000;background:#fff">';
  h += '<div style="text-align:center"><b style="font-size:' + (fs + 3) + 'px">' + esc(C.name) + '</b>' + (C.address ? '<div>' + esc(C.address) + '</div>' : '') + (C.phone ? '<div>Ph: ' + esc(C.phone) + '</div>' : '') + (C.gstin && C.scheme !== 'notax' ? '<div>GSTIN: ' + esc(C.gstin) + '</div>' : '') + '<div style="font-weight:700;margin-top:3px">' + title + '</div></div>' + line;
  h += row('No: ' + esc(d.no), dmy(d.date)) + (p.name && p.name !== 'Walk-in Customer' ? '<div>To: ' + esc(p.name) + (p.phone ? ' ' + esc(p.phone) : '') + '</div>' : '') + line;
  (d.items || []).forEach(function (it) {
    h += '<div>' + esc(it.name) + mrpTag(it) + (batchTag(it) ? ' (' + esc(batchTag(it)) + ')' : '') + '</div>' + row(qtyF(it.qty) + ' x ' + rs(it.rate) + (+it.disc ? ' -' + it.disc + '%' : '') + (taxOn(C, t) && +it.gst ? ' [' + it.gst + '%]' : ''), rs(it.taxable));
  });
  h += line + row('Items: ' + (d.items || []).length, '') + (d.discAmt > 0 ? row('Discount given', '-' + rs(d.discAmt)) : '');
  if (taxOn(C, t)) { h += row('Taxable', rs(d.sub)); if (d.inter) h += row('IGST', rs(d.igst)); else h += row('CGST', rs(d.cgst)) + row('SGST', rs(d.sgst)); }
  if (t.tax && d.round) h += row('Round off', rs(d.round));
  h += '<div style="font-size:' + (fs + 3) + 'px">' + row('TOTAL', rs(d.total), true) + '</div>';
  if (d.type === 'invoice' && !d.cancelled) { var bal = outstanding(C, d); h += row('Paid', rs(d.total - bal)) + (bal > 0 ? row('Balance due', rs(bal), true) : '<div style="text-align:center;font-weight:700">PAID</div>'); }
  var q = upiBlockQr(C, d, w === 58 ? 100 : 130); if (q) h += line + q;
  h += line + '<div style="text-align:center">Thank you. Visit again.</div></div>';
  return h;
}
function upiBlockQr(C, d, px) {
  var bal = upiBal(C, d); if (!bal || !C.bank || !upiOk(C.bank.upi)) return '';
  return '<div style="text-align:center">' + upiSvg(upiLink(C, d, bal), px) + '<div>Scan to pay ' + money(bal) + '</div></div>';
}
function rcptPrint(C, d, w) {
  var old = $('#printarea'); if (old) old.remove(); var o2 = $('#lblpage'); if (o2) o2.remove();
  var st = document.createElement('style'); st.id = 'lblpage'; st.textContent = '@page{size:' + (w === 58 ? 58 : 80) + 'mm auto;margin:2mm}'; document.head.appendChild(st);
  var area = document.createElement('div'); area.id = 'printarea'; area.innerHTML = rcptHtml(C, d, w); document.body.appendChild(area); document.body.classList.add('printing');
  var done = function () { document.body.classList.remove('printing'); var a = $('#printarea'); if (a) a.remove(); var s2 = $('#lblpage'); if (s2) s2.remove(); window.removeEventListener('afterprint', done); };
  window.addEventListener('afterprint', done);
  try { window.print(); } finally { if (!('onafterprint' in window)) done(); }
}
function bindRcpt(A) {
  A.rcpt = function (d) { var C = cur(), x = docById(C, d.id); if (!x) return; rcptPrint(C, x, +d.w === 58 ? 58 : 80); };
}
/* ---------- import items and parties from Excel / CSV (Vyapar, Tally exports, own sheets) ---------- */
var IMP = { kind: '', rows: [], bad: [] };
var IMP_COLS = {
  product: { name: ['name', 'itemname', 'productname', 'item', 'product', 'description'], unit: ['unit', 'uom', 'basicunit', 'primaryunit'], hsn: ['hsn', 'hsnsac', 'hsncode', 'sac'], gst: ['gst', 'gstrate', 'tax', 'taxrate', 'taxratein', 'gstin_rate'], sale: ['saleprice', 'sellingprice', 'price', 'rate', 'salerate'], wsale: ['wholesaleprice', 'wholesale', 'wsale'], mrp: ['mrp', 'maximumretailprice'], cost: ['costprice', 'purchaseprice', 'cost', 'buyprice', 'purchaserate'], qty: ['stock', 'openingstock', 'openingstockquantity', 'openingquantity', 'qty', 'quantity', 'currentstock'], min: ['minstock', 'minimumstock', 'minstockqty', 'reorderlevel', 'lowstock'], barcode: ['barcode', 'ean', 'upc'], sku: ['sku', 'code', 'itemcode', 'productcode'], cat: ['category', 'group', 'itemcategory'] },
  party: { name: ['name', 'partyname', 'customername', 'suppliername', 'party', 'customer', 'supplier'], type: ['type', 'partytype'], phone: ['phone', 'mobile', 'contactnumber', 'phonenumber', 'mobilenumber', 'contact'], gstin: ['gstin', 'gstnumber', 'gstno'], state: ['state', 'placeofsupply'], address: ['address', 'billingaddress'], city: ['city', 'town'], pin: ['pin', 'pincode', 'zip', 'postalcode'], email: ['email', 'emailid'], opening: ['openingbalance', 'opening', 'balance', 'openingamount'] }
};
function impNorm(s) { return String(s == null ? '' : s).toLowerCase().replace(/[^a-z0-9]/g, ''); }
function impPick(row, names) { for (var i = 0; i < names.length; i++) for (var k in row) if (impNorm(k) === names[i]) { var v = row[k]; if (v !== '' && v != null) return v; } return ''; }
function impNum(v) { var n = parseFloat(String(v).replace(/[₹,\s]/g, '')); return isFinite(n) ? n : 0; }
function impState(v) { var s = String(v || '').trim(); if (!s) return ''; var l = s.toLowerCase(); for (var i = 0; i < STATES.length; i++) if (STATES[i].toLowerCase() === l) return STATES[i]; if (/^\d{1,2}$/.test(s) && STATE_CODES[('0' + s).slice(-2)]) return STATE_CODES[('0' + s).slice(-2)]; return ''; }
function impParse(kind, rows) {
  var C = cur(), good = [], bad = [], seen = {};
  rows.forEach(function (r, i) {
    var ln = i + 2, g = function (k) { return impPick(r, IMP_COLS[kind][k]); }, name = String(g('name')).trim();
    if (!name) { if (Object.keys(r).some(function (k) { return String(r[k]).trim(); })) bad.push('Row ' + ln + ': name is empty'); return; }
    var key = name.toLowerCase();
    if (kind === 'product') {
      if (seen[key] || C.d.products.some(function (p) { return p.name.toLowerCase() === key; })) { bad.push('Row ' + ln + ': ' + name + ' already exists'); return; }
      var bc = String(g('barcode')).trim(); if (bc && C.d.products.some(function (p) { return p.barcode === bc; })) { bad.push('Row ' + ln + ': barcode of ' + name + ' already used'); return; }
      var gst = impNum(g('gst')); if (gst < 0 || gst > 100) { bad.push('Row ' + ln + ': GST rate of ' + name + ' is wrong'); return; }
      var sale = impNum(g('sale')), cost = impNum(g('cost')), qty = impNum(g('qty')); if (sale < 0 || cost < 0 || qty < 0) { bad.push('Row ' + ln + ': ' + name + ' has a negative number'); return; }
      seen[key] = 1;
      good.push({ name: name.slice(0, 120), unit: String(g('unit')).trim() || 'pcs', hsn: String(g('hsn')).replace(/\D/g, '').slice(0, 8), gst: gst, sale: Math.round(sale * 100), cost: Math.round(cost * 100), wsale: Math.round(impNum(g('wsale')) * 100), mrp: Math.round(impNum(g('mrp')) * 100), openQty: qty, min: impNum(g('min')), barcode: bc, sku: String(g('sku')).trim(), cat: String(g('cat')).trim(), tracked: true });
    } else {
      var tp = /supp|vend|purch/i.test(String(g('type'))) ? 'supplier' : /cust|client|sale/i.test(String(g('type'))) ? 'customer' : (S.tab.parties || 'customer');
      if (seen[tp + key] || C.d.parties.some(function (p) { return p.type === tp && p.name.toLowerCase() === key; })) { bad.push('Row ' + ln + ': ' + name + ' already exists'); return; }
      var gs = String(g('gstin')).trim().toUpperCase(), st = impState(g('state')) || C.state, ge = gs ? gstinErr(gs, st) : ''; if (ge) { bad.push('Row ' + ln + ': ' + name + ' - ' + ge); return; }
      var pin = String(g('pin')).replace(/\D/g, ''); if (pin && !pinOk(pin)) pin = '';
      seen[tp + key] = 1;
      good.push({ type: tp, name: name.slice(0, 120), gstin: gs, state: st, phone: String(g('phone')).replace(/[^\d+]/g, '').slice(-13), email: String(g('email')).trim(), address: String(g('address')).trim(), city: String(g('city')).trim(), pin: pin, opening: Math.round(impNum(g('opening')) * 100) });
    }
  });
  return { good: good, bad: bad };
}
function impModal(kind) {
  IMP = { kind: kind, rows: [], bad: [] };
  var nm = kind === 'product' ? 'items' : 'customers / suppliers';
  modal('<div class="mh"><h2>Import ' + nm + ' from Excel</h2>' + btn('closeModal', 'Close', {}, 'sm line') + '</div><div class="note">Works with Excel (.xlsx) or CSV, including exports from Vyapar and other billing apps. The first row must be the column names. Names that already exist are skipped.</div>' +
    '<div class="row" style="margin:8px 0">' + btn('impTemplate', 'Download sample sheet', { k: kind }, 'line') + '</div>' +
    '<label class="fld"><span>Choose the file</span><input type="file" data-chg="impFile" accept=".xlsx,.xls,.csv"></label><div id="impout"></div>');
}
function impPreview() {
  var o = $('#impout'); if (!o) return;
  var k = IMP.kind, h = '<div class="hint"><b>' + IMP.rows.length + '</b> ready to import' + (IMP.bad.length ? ', <b>' + IMP.bad.length + '</b> skipped' : '') + '.</div>';
  if (IMP.rows.length) {
    h += k === 'product' ? table([['Item'], ['Unit'], ['GST', 'r'], ['Sale', 'r'], ['Stock', 'r']], IMP.rows.slice(0, 8).map(function (r) { return [esc(r.name), esc(r.unit), r.gst + '%', money(r.sale), qtyF(r.openQty)]; }))
      : table([['Name'], ['Type'], ['Phone'], ['GSTIN'], ['Opening', 'r']], IMP.rows.slice(0, 8).map(function (r) { return [esc(r.name), esc(r.type), esc(r.phone), esc(r.gstin), money(r.opening)]; }));
    if (IMP.rows.length > 8) h += '<div class="note">and ' + (IMP.rows.length - 8) + ' more</div>';
    h += '<div class="row" style="margin-top:8px">' + btn('impGo', 'Import ' + IMP.rows.length + ' ' + (k === 'product' ? 'items' : 'parties'), {}, 'pri') + '</div>';
  }
  if (IMP.bad.length) h += '<div class="note" style="margin-top:8px;max-height:140px;overflow:auto">' + IMP.bad.slice(0, 30).map(esc).join('<br>') + (IMP.bad.length > 30 ? '<br>and ' + (IMP.bad.length - 30) + ' more' : '') + '</div>';
  o.innerHTML = h;
}
function impRead(file) {
  if (file.size > 10 * 1024 * 1024) { toast('That file is too large.', true); return; }
  var fr = new FileReader();
  fr.onerror = function () { toast('Could not read that file.', true); };
  fr.onload = function () {
    needXls().then(function () {
      try {
        var wb = window.XLSX.read(fr.result, { type: 'array' }), ws = wb.Sheets[wb.SheetNames[0]], rows = window.XLSX.utils.sheet_to_json(ws, { defval: '', raw: false });
        if (!rows.length) { toast('The file has no rows.', true); return; }
        if (rows.length > 5000) { toast('Import up to 5000 rows at a time.', true); return; }
        var r = impParse(IMP.kind, rows); IMP.rows = r.good; IMP.bad = r.bad; impPreview();
      } catch (e) { toast('Could not read this file. Use .xlsx or .csv.', true); }
    }, function () { toast('Could not load the Excel reader. Check the internet once.', true); });
  };
  fr.readAsArrayBuffer(file);
}
function bindImport(A) {
  A.impProducts = function () { if (!canWrite('inventory')) return; impModal('product'); };
  A.impParties = function () { if (!canWrite('parties')) return; impModal('party'); };
  A.impTemplate = function (d) {
    var t = d.k === 'product' ? 'Name,Unit,HSN,GST %,Sale price,Cost price,Opening stock,Min stock,Barcode,SKU,Category\nSample item,pcs,9983,18,100,70,25,5,,SKU1,General\n'
      : 'Name,Type,Phone,GSTIN,State,Address,City,PIN,Email,Opening balance\nSample customer,customer,9876543210,,Tamil Nadu,1 Main St,Thanjavur,613001,,0\n';
    browserSave(fname(d.k === 'product' ? 'items sample' : 'parties sample', 'csv'), t);
  };
  A.impGo = function () {
    var C = cur(); if (!IMP.rows.length) return;
    if (IMP.kind === 'product') { if (!canWrite('inventory')) return; IMP.rows.forEach(function (r) { addProduct(C, r); }); log('Imported items', String(IMP.rows.length)); }
    else { if (!canWrite('parties')) return; IMP.rows.forEach(function (r) { addParty(C, r); }); log('Imported parties', String(IMP.rows.length)); }
    var n = IMP.rows.length; IMP = { kind: '', rows: [], bad: [] }; closeModal(); toast(n + ' imported.'); afterChange();
  };
  document.addEventListener('change', function (e) { var t = e.target; if (t && t.dataset && t.dataset.chg === 'impFile' && t.files && t.files[0]) impRead(t.files[0]); });
}
/* ---------- overdue payment reminders on WhatsApp ---------- */
var REM_DEF = 'Dear {name}, this is a friendly reminder from {shop}. Rs. {amount} is pending ({bills}). Please pay at your earliest. Thank you.';
function remList(C) {
  var t = today(), by = {};
  C.d.docs.forEach(function (d) {
    if (d.type !== 'invoice' || d.cancelled) return; var b = outstanding(C, d); if (b <= 0 || !d.due || d.due >= t) return;
    var g = by[d.partyId] = by[d.partyId] || { id: d.partyId, amt: 0, days: 0, inv: [] };
    g.amt += b; g.inv.push(d.no); g.days = Math.max(g.days, Math.round((new Date(t) - new Date(d.due)) / 86400000));
  });
  return Object.keys(by).map(function (k) { return by[k]; }).filter(function (g) { var p = partyById(C, g.id); return p && p.name !== 'Walk-in Customer'; }).sort(function (a, b) { return b.amt - a.amt; });
}
function remText(C, g) {
  var p = partyById(C, g.id) || {}, tpl = C.remindMsg || REM_DEF;
  var m = tpl.replace(/\{name\}/g, p.name || 'Sir/Madam').replace(/\{shop\}/g, C.name).replace(/\{amount\}/g, (g.amt / 100).toFixed(2)).replace(/\{bills\}/g, 'Invoice ' + g.inv.slice(0, 4).join(', ') + (g.inv.length > 4 ? ' and ' + (g.inv.length - 4) + ' more' : ''));
  if (C.bank && upiOk(C.bank.upi)) m += ' UPI: ' + C.bank.upi;
  return m;
}
function remModalH() {
  var C = cur(), L = remList(C), rem = C.reminded || {};
  var h = '<div class="mh"><h2>Payment reminders</h2>' + btn('closeModal', 'Close', {}, 'sm line') + '</div><div class="note">Customers whose invoices are past the due date. Press WhatsApp to open the chat with the message ready, then press Send.</div>';
  h += '<form data-submit="remSave" class="fg"><label class="fld wide"><span>Message ({name} {shop} {amount} {bills} are filled in for each customer)</span><textarea name="msg" rows="3">' + esc(C.remindMsg || REM_DEF) + '</textarea></label><div class="wide row"><button class="btn line" type="submit">Save message</button></div></form>';
  h += table([['Customer'], ['Overdue', 'r'], ['Late'], ['Last reminded'], ['']], L.map(function (g) {
    var p = partyById(C, g.id), ph = waPhone(p);
    return [esc(p.name), money(g.amt), g.days + ' days', rem[g.id] ? dmy(rem[g.id]) : '-', ph.length >= 11 ? '<a class="btn sm pri" target="_blank" rel="noopener" data-rem="' + g.id + '" href="' + esc(waLinkFor(ph, remText(C, g))) + '">WhatsApp</a>' : '<span class="note">No phone</span>'];
  }), 'Nothing is overdue.');
  return h;
}
function bindRemind(A) {
  A.remindUi = function () { modal(remModalH(), true); };
  A.remSave = function (fd) { var C = cur(), m = String(fd.get('msg') || '').trim().slice(0, 500); C.remindMsg = m === REM_DEF ? '' : m; save(); toast('Message saved.'); modal(remModalH(), true); };
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest && e.target.closest('a[data-rem]'); if (!a) return;
    var C = cur(); C.reminded = C.reminded || {}; C.reminded[a.getAttribute('data-rem')] = today(); log('Payment reminder sent', partyName(C, a.getAttribute('data-rem'))); save();
  });
}
/* ---------- party-wise prices, wholesale level, MRP, ship-to and transport ---------- */
function rateFor(C, p, partyId, side) {
  if (side === 'p') return p.cost;
  var pa = partyId ? partyById(C, partyId) : null, r;
  if (pa && pa.prices && pa.prices[p.id] > 0) r = pa.prices[p.id];
  else if (pa && pa.level === 'wholesale' && p.wsale > 0) r = p.wsale;
  else r = p.sale;
  /* price typed with GST included: bill the value before GST so the customer pays the printed price */
  if (p.incl && C.scheme === 'regular' && +p.gst > 0) r = Math.round(r * 100 / (100 + +p.gst));
  return r;
}
function discFor(C, partyId, side) { var pa = partyId ? partyById(C, partyId) : null; return side === 'p' || !pa ? 0 : (+pa.disc || 0); }
function mrpTag(it) { return +it.mrp > +it.rate ? ' (MRP ' + rs(it.mrp) + ')' : ''; }
function partyPricesH(p) {
  var C = cur(), pr = p.prices || {};
  var h = '<div class="mh"><h2>Special prices for ' + esc(p.name) + '</h2>' + btn('closeModal', 'Close', {}, 'sm line') + '</div><div class="note">Leave blank to use the normal price. A price here is used automatically when this customer is on a bill.</div><form data-submit="savePartyPrices"><input type="hidden" name="id" value="' + esc(p.id) + '"><div style="max-height:55vh;overflow:auto">';
  h += table([['Item'], ['Normal', 'r'], ['Special price', 'r']], C.d.products.map(function (x) { return [esc(x.name), money(p.level === 'wholesale' && x.wsale > 0 ? x.wsale : x.sale), '<input name="pp_' + x.id + '" type="number" min="0" step="any" value="' + (pr[x.id] > 0 ? rs(pr[x.id]) : '') + '" style="max-width:110px;text-align:right">']; }));
  return h + '</div><div class="row" style="margin-top:10px"><button class="btn pri" type="submit">Save prices</button></div></form>';
}
function shipH(d) {
  return '<details style="margin:8px 0"' + (d.shipTo || d.shipAddr || d.transporter || d.vehicle || d.lrNo ? ' open' : '') + '><summary>Ship to and transport (optional)</summary><div class="fg">' +
    field('Ship to (name)', '<input data-f="shipTo" value="' + esc(d.shipTo || '') + '">') + field('Ship to address', '<input data-f="shipAddr" value="' + esc(d.shipAddr || '') + '">') +
    field('Transporter', '<input data-f="transporter" value="' + esc(d.transporter || '') + '">') + field('Vehicle number', '<input data-f="vehicle" value="' + esc(d.vehicle || '') + '">') + field('LR / GR number', '<input data-f="lrNo" value="' + esc(d.lrNo || '') + '">') + '</div></details>';
}
function shipView(d) {
  var a = [];
  if (d.shipTo || d.shipAddr) a.push('Ship to: ' + (d.shipTo || '') + (d.shipTo && d.shipAddr ? ', ' : '') + (d.shipAddr || ''));
  if (d.transporter || d.vehicle || d.lrNo) a.push('Transport: ' + [d.transporter, d.vehicle ? 'Vehicle ' + d.vehicle : '', d.lrNo ? 'LR ' + d.lrNo : ''].filter(Boolean).join(', '));
  return a;
}
function bindPrice(A) {
  A.partyPrices = function (d) { var p = partyById(cur(), d.id); if (p && canWrite('parties')) modal(partyPricesH(p), true); };
  A.savePartyPrices = function (fd) {
    var C = cur(), p = partyById(C, fd.get('id')); if (!p || !canWrite('parties')) return; var pr = {};
    C.d.products.forEach(function (x) { var v = P(fd.get('pp_' + x.id)); if (v > 0) pr[x.id] = v; });
    p.prices = pr; log('Special prices set', p.name); closeModal(); toast('Prices saved.'); afterChange();
  };
}
/* ---------- recurring invoices (rent, AMC, subscriptions): you press Create when due ---------- */
var REC_EVERY = [['weekly', 'Every week'], ['monthly', 'Every month'], ['quarterly', 'Every 3 months'], ['yearly', 'Every year']];
function recAdd(s, every, anchorDay) {
  if (every === 'weekly') return addDays(s, 7);
  var n = every === 'monthly' ? 1 : every === 'quarterly' ? 3 : 12, a = s.split('-'), y = +a[0], m = +a[1] - 1 + n, dd = anchorDay || +a[2];
  y += Math.floor(m / 12); m = ((m % 12) + 12) % 12;
  var last = new Date(y, m + 1, 0).getDate(); dd = Math.min(dd, last);
  return y + '-' + ('0' + (m + 1)).slice(-2) + '-' + ('0' + dd).slice(-2);
}
function recDue(C) { var t = today(); return (C.recurring || []).filter(function (r) { return r.on !== false && r.next <= t && (!r.end || r.next <= r.end); }); }
function recMake(C, r) {
  var items = JSON.parse(JSON.stringify(r.items || [])); items.forEach(function (it) { delete it.alloc; it.batch = ''; it.exp = ''; });
  var d = newDraft('invoice', { partyId: r.partyId, items: items, notes: r.notes || '', wh: C.d.warehouses[0], shipTo: r.shipTo || '', shipAddr: r.shipAddr || '' });
  d.recurId = r.id; calc(C, d);
  var err = validateDoc(C, d); if (err) return err;
  var sh = shortages(C, d); if (sh.length) return 'Stock is not enough for ' + sh[0].name + '.';
  commitDoc(C, d); r.next = recAdd(r.next, r.every, r.day); r.last = today(); r.count = (r.count || 0) + 1;
  log('Recurring invoice created', d.no); return '';
}
function recModalH() {
  var C = cur(), L = C.recurring || [], t = today();
  var h = '<div class="mh"><h2>Recurring invoices</h2>' + btn('closeModal', 'Close', {}, 'sm line') + '</div><div class="note">Open an invoice and press "Repeat this invoice" to add one here. When it is due, press Create and the invoice is made for you.</div>';
  if (recDue(C).length > 1) h += '<div class="row" style="margin:8px 0">' + btn('recAll', 'Create all ' + recDue(C).length + ' due invoices', {}, 'pri') + '</div>';
  h += table([['Customer'], ['Amount', 'r'], ['Repeats'], ['Next'], ['']], L.map(function (r) {
    var due = r.on !== false && r.next <= t && (!r.end || r.next <= r.end), tot = 0; try { var x = { items: JSON.parse(JSON.stringify(r.items)), partyId: r.partyId, type: 'invoice' }; calc(C, x); tot = x.total; } catch (e) { }
    return [esc(partyName(C, r.partyId)), money(tot), esc((REC_EVERY.filter(function (e) { return e[0] === r.every; })[0] || ['', ''])[1]), (r.on === false ? '<span class="note">Stopped</span>' : due ? '<span class="warn-t">' + dmy(r.next) + ' (due)</span>' : dmy(r.next)) + (r.end ? '<div class="note">until ' + dmy(r.end) + '</div>' : ''),
      '<div class="acts">' + (due ? btn('recNow', 'Create', { id: r.id }, 'sm pri') : '') + btn('recToggle', r.on === false ? 'Start' : 'Stop', { id: r.id }, 'sm line') + btn('recDel', 'Delete', { id: r.id }, 'sm line') + '</div>'];
  }), 'No recurring invoices yet.');
  return h;
}
function bindRecur(A) {
  A.recurUi = function () { modal(recModalH(), true); };
  A.repeatDoc = function (d) {
    var C = cur(), x = docById(C, d.id); if (!x || x.type !== 'invoice') return;
    modal('<div class="mh"><h2>Repeat ' + esc(x.no) + '</h2>' + btn('closeModal', 'Close', {}, 'sm line') + '</div><form data-submit="recSave" class="fg"><input type="hidden" name="id" value="' + esc(x.id) + '">' +
      field('Repeats', '<select name="every">' + opts(REC_EVERY, 'monthly', function (e) { return e[0]; }, function (e) { return e[1]; }) + '</select>') + field('Next invoice date', '<input type="date" name="next" value="' + recAdd(x.date, 'monthly') + '" required>') + field('Stop after (optional)', '<input type="date" name="end">') +
      '<div class="wide note">The items, prices and customer are copied from this invoice.</div><div class="wide row"><button class="btn pri" type="submit">Save</button></div></form>');
  };
  A.recSave = function (fd) {
    var C = cur(), x = docById(C, fd.get('id')); if (!x || !canWrite('sales', 'invoice')) return;
    var next = String(fd.get('next') || ''), end = String(fd.get('end') || ''); if (!/^\d{4}-\d{2}-\d{2}$/.test(next)) { toast('Choose the next invoice date.', true); return; }
    if (end && end < next) { toast('The stop date is before the next invoice date.', true); return; }
    var items = JSON.parse(JSON.stringify(x.items)); items.forEach(function (it) { delete it.alloc; delete it.taxable; delete it.tax; delete it.cgst; delete it.sgst; delete it.igst; });
    C.recurring = C.recurring || []; C.recurring.push({ id: uid(), partyId: x.partyId, items: items, notes: x.notes || '', shipTo: x.shipTo || '', shipAddr: x.shipAddr || '', every: fd.get('every'), next: next, day: +next.slice(8, 10), end: end, on: true, count: 0 });
    log('Recurring invoice added', x.no); closeModal(); toast('Saved. See Recurring invoices on the Sales Invoice screen.'); afterChange();
  };
  A.recNow = function (d) {
    var C = cur(), r = (C.recurring || []).filter(function (z) { return z.id === d.id; })[0]; if (!r || !canWrite('sales', 'invoice')) return;
    var e = recMake(C, r); if (e) { toast(e, true); return; } save(); toast('Invoice created.'); modal(recModalH(), true); render();
  };
  A.recAll = function () {
    var C = cur(), n = 0, msg = ''; if (!canWrite('sales', 'invoice')) return;
    recDue(C).forEach(function (r) { var g = 0; while (r.on !== false && r.next <= today() && (!r.end || r.next <= r.end) && g++ < 12) { var e = recMake(C, r); if (e) { msg = e; break; } n++; } });
    save(); toast(n + ' invoice' + (n === 1 ? '' : 's') + ' created.' + (msg ? ' ' + msg : ''), !!msg); modal(recModalH(), true); render();
  };
  A.recToggle = function (d) { var C = cur(), r = (C.recurring || []).filter(function (z) { return z.id === d.id; })[0]; if (r) { r.on = r.on === false; save(); modal(recModalH(), true); } };
  A.recDel = function (d) { var C = cur(); C.recurring = (C.recurring || []).filter(function (z) { return z.id !== d.id; }); log('Recurring invoice deleted', ''); save(); modal(recModalH(), true); };
}
/* ---------- serial / IMEI number tracking ---------- */
function serParse(txt) { return String(txt || '').split(/[\n,;]+/).map(function (s) { return s.trim().slice(0, 40); }).filter(Boolean); }
function serState(C, pid, exceptRef) {
  var set = {};
  C.d.moves.forEach(function (m) {
    if (m.pid !== pid || !m.serials || !m.serials.length || (exceptRef && m.ref === exceptRef)) return;
    m.serials.forEach(function (s) { if (m.qty > 0) set[s] = { ref: m.ref || '', date: m.date, type: m.type, in: true }; else set[s] = { ref: m.ref || '', date: m.date, type: m.type, in: false }; });
  });
  return set;
}
function serCheck(C, pid, list, qty, dir, exceptRef) {
  if (!list.length) return 'Enter the serial numbers.';
  if (Math.abs(qty - Math.round(qty)) > 1e-9) return 'Quantity must be a whole number for serial items.';
  if (list.length !== Math.round(qty)) return 'Quantity is ' + qty + ' but ' + list.length + ' serial number' + (list.length === 1 ? ' is' : 's are') + ' entered.';
  var seen = {}, st = serState(C, pid, exceptRef);
  for (var i = 0; i < list.length; i++) {
    var s = list[i]; if (seen[s]) return 'Serial ' + s + ' is entered twice.'; seen[s] = 1;
    if (dir > 0 && st[s] && st[s].in) return 'Serial ' + s + ' is already in stock.';
    if (dir < 0 && !(st[s] && st[s].in)) return 'Serial ' + s + ' is not in stock.';
  }
  return '';
}
function serialErr(C, d, it, i) {
  var p = it.pid ? prodById(C, it.pid) : null, sg = SE[d.type]; if (!p || !p.serial || !sg) return '';
  var list = it.serialsTxt !== undefined ? serParse(it.serialsTxt) : (it.serials || []);
  var e = serCheck(C, p.id, list, +it.qty || 0, sg, d.id); if (e) return 'Item ' + (i + 1) + ' (' + p.name + '): ' + e;
  it.serials = list; return '';
}
function serialCell(C, d, it, i) {
  var p = it.pid ? prodById(C, it.pid) : null; if (!p || !p.serial || !SE[d.type]) return '';
  var v = it.serialsTxt !== undefined ? it.serialsTxt : (it.serials || []).join('\n');
  return '<textarea class="inp" rows="2" style="margin-top:4px" data-f="serialsTxt" data-i="' + i + '" placeholder="Serial / IMEI numbers, one per line or comma separated" aria-label="Serial numbers">' + esc(v) + '</textarea>';
}
function serialReport(C) {
  var rows = [], q = (S.q || '').toLowerCase();
  C.d.products.forEach(function (p) {
    if (!p.serial) return; var st = serState(C, p.id);
    Object.keys(st).forEach(function (s) {
      var x = st[s], doc = x.ref ? docById(C, x.ref) : null, who = doc ? partyName(C, doc.partyId) : '';
      var line = [s, p.name, who, doc ? doc.no : ''].join(' ').toLowerCase(); if (q && line.indexOf(q) < 0) return;
      rows.push({ s: s, p: p.name, in: x.in, date: x.date, doc: doc ? doc.no : (x.type === 'opening' ? 'Opening' : 'Adjustment'), who: who });
    });
  });
  rows.sort(function (a, b) { return (b.in ? 1 : 0) - (a.in ? 1 : 0) || a.p.localeCompare(b.p) || a.s.localeCompare(b.s); });
  var n = rows.filter(function (r) { return r.in; }).length;
  return '<div class="hint"><b>' + n + '</b> in stock, <b>' + (rows.length - n) + '</b> sold or out. Search a serial number or customer name above.</div>' +
    table([['Serial / IMEI'], ['Item'], ['Status'], ['Last entry'], ['Date']], rows.slice(0, 300).map(function (r) { return [esc(r.s), esc(r.p), r.in ? '<span class="ok-t">In stock</span>' : 'Out' + (r.who ? ' to ' + esc(r.who) : ''), esc(r.doc), dmy(r.date)]; }), 'No serial items yet. Tick "Track serial / IMEI numbers" on an item.') +
    (rows.length > 300 ? '<div class="note">Showing 300 of ' + rows.length + '. Use search.</div>' : '');
}
function bindSerial(A) {
  var adj0 = A.adjust;
  A.adjust = function (fd) {
    var C = cur(), p = prodById(C, fd.get('pid')); if (!p || !p.serial) return adj0(fd);
    var q = parseFloat(fd.get('qty')) || 0, out = fd.get('dir') === 'out', list = serParse(fd.get('serials'));
    if (!(q > 0)) { toast('Enter a quantity above zero.', true); return; }
    var e = serCheck(C, p.id, list, q, out ? -1 : 1, ''); if (e) { toast(e, true); return; }
    addMove(C, { date: today(), pid: p.id, wh: fd.get('wh'), qty: out ? -q : q, cost: p.cost, type: 'adjustment', note: fd.get('note') || (out ? 'Stock out' : 'Stock in'), serials: list });
    log('Stock ' + (out ? 'out ' : 'in ') + qtyF(q), p.name); toast('Adjustment saved.'); afterChange();
  };
}
/* ---------- TDS and TCS register ---------- */
var TDS_SEC = [
  ['194C', 'Contractors (1% individual/HUF, 2% others)', 1], ['194J', 'Professional / technical fees', 10], ['194H', 'Commission or brokerage', 2],
  ['194I(a)', 'Rent of machinery', 2], ['194I(b)', 'Rent of land or building', 10], ['194Q', 'Purchase of goods above 50 lakh', 0.1],
  ['194A', 'Interest (other than bank)', 10], ['194O', 'E-commerce operator payments', 0.1], ['192', 'Salary (as per slab)', 0], ['Other', 'Any other section', 0]
];
var TCS_SEC = [['206C(1H)', 'Sale of goods above 50 lakh', 0.1], ['206C(1)', 'Scrap, timber, minerals', 1], ['Other', 'Any other section', 0]];
var TDS_KIND = { out: 'TDS we deducted (to deposit)', 'in': 'TDS customer deducted (credit for us)', tcs: 'TCS we collected (to deposit)' };
function tdsQ(date) { var m = +date.slice(5, 7), y = +date.slice(0, 4), fy = m >= 4 ? y : y - 1; return 'FY ' + fy + '-' + String(fy + 1).slice(2) + ' Q' + (m >= 4 && m <= 6 ? 1 : m >= 7 && m <= 9 ? 2 : m >= 10 ? 3 : 4); }
function tdsDue(date) {
  var y = +date.slice(0, 4), m = +date.slice(5, 7);
  if (m === 3) return y + '-04-30';
  var ny = m === 12 ? y + 1 : y, nm = m === 12 ? 1 : m + 1;
  return ny + '-' + (nm < 10 ? '0' : '') + nm + '-07';
}
function tdsAdd(C, o) {
  C.tds = C.tds || [];
  if (!TDS_KIND[o.kind]) return 'Choose the type.';
  if (!(o.base > 0)) return 'Enter the amount the tax is on.';
  if (!(o.rate >= 0 && o.rate <= 100)) return 'Rate must be between 0 and 100.';
  if (!o.date) return 'Enter the date.';
  var amt = Math.round(o.base * o.rate / 100);
  if (!(amt > 0)) return 'Tax amount is zero. Check the rate.';
  var inv = o.refId ? docById(C, o.refId) : null;
  var pid = inv ? inv.partyId : o.partyId;
  if (!pid) return 'Select the party.';
  var payId = '';
  if (o.settle && inv && o.kind !== 'tcs') {
    var e = addPayment(C, { type: o.kind === 'in' ? 'receipt' : 'payment', partyId: pid, amount: amt, mode: 'TDS', date: o.date, refId: inv.id, note: (o.kind === 'in' ? 'TDS deducted by customer ' : 'TDS deducted ') + o.sec });
    if (e) return e;
    payId = C.d.payments[C.d.payments.length - 1].id;
  }
  var x = { id: uid(), date: o.date, kind: o.kind, partyId: pid, sec: o.sec, base: o.base, rate: o.rate, amt: amt, refId: inv ? inv.id : '', payId: payId, pan: String(o.pan || '').toUpperCase().trim(), dep: null, note: o.note || '', by: (user() || {}).name || '' };
  C.tds.push(x); log('TDS/TCS entry ' + money(amt), o.sec); return '';
}
function tdsNoPan(x) { return x.kind === 'out' && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(x.pan || '') && x.rate < 20; }
function tdsFmt(C, x) {
  return [dmy(x.date), esc(partyName(C, x.partyId)), esc(x.sec), money(x.base), x.rate + '%', '<b>' + money(x.amt) + '</b>' + (tdsNoPan(x) ? '<div class="note warn-t">No valid PAN: 20% applies (206AA)</div>' : '')];
}
function tdsTabH(C) {
  var w = canWrite('accounting'), L = (C.tds || []).slice().sort(function (a, b) { return b.date < a.date ? -1 : 1; });
  var out = L.filter(function (x) { return x.kind === 'out'; }), tcs = L.filter(function (x) { return x.kind === 'tcs'; }), inn = L.filter(function (x) { return x.kind === 'in'; });
  var pend = out.concat(tcs).filter(function (x) { return !x.dep; }), t = today();
  var late = pend.filter(function (x) { return tdsDue(x.date) < t; });
  var h = '<div class="grid">' + kpi('To deposit to government', money(sumBy(pend, function (x) { return x.amt; })), pend.length + ' entries', late.length > 0) +
    kpi('Overdue deposits', money(sumBy(late, function (x) { return x.amt; })), late.length ? 'Interest is charged on late deposit' : 'None', late.length > 0) +
    kpi('TDS credit for us', money(sumBy(inn, function (x) { return x.amt; })), 'Match with Form 26AS') + '</div>';
  if (w) h += '<div class="row">' + btn('tdsNew', 'TDS we deducted', { k: 'out' }, 'pri') + btn('tdsNew', 'TDS customer deducted', { k: 'in' }, 'line') + btn('tdsNew', 'TCS we collected', { k: 'tcs' }, 'line') + '</div>';
  h += '<div class="note">Deposit due: 7th of next month (30 April for March). Enter the challan number once deposited. Quarterly returns: 26Q for TDS, 27EQ for TCS.</div>';
  var rows = [], csvRows = [];
  L.forEach(function (x) {
    var st = x.kind === 'in' ? 'Credit' : x.dep ? '<span class="ok-t">Deposited ' + dmy(x.dep.date) + ' · ' + esc(x.dep.chal) + '</span>' : (tdsDue(x.date) < t ? '<span class="warn-t">Overdue (due ' + dmy(tdsDue(x.date)) + ')</span>' : 'Due ' + dmy(tdsDue(x.date)));
    var acts = w ? ((x.kind !== 'in' && !x.dep ? btn('tdsDep', 'Mark deposited', { id: x.id }, 'sm') + ' ' : '') + btn('tdsDel', 'Delete', { id: x.id }, 'sm line')) : '';
    rows.push(tdsFmt(C, x).slice(0, 1).concat([esc(TDS_KIND[x.kind])], tdsFmt(C, x).slice(1), [st, acts]));
    csvRows.push([x.date, tdsQ(x.date), TDS_KIND[x.kind], partyName(C, x.partyId), x.pan || '', x.sec, rs(x.base), x.rate, rs(x.amt), x.dep ? x.dep.chal : '', x.dep ? x.dep.date : '']);
  });
  h += table([['Date'], ['Type'], ['Party'], ['Section'], ['Amount', 'r'], ['Rate', 'r'], ['Tax', 'r'], ['Status'], ['']], rows, 'No TDS or TCS entries yet.');
  var qs = {};
  out.concat(tcs).forEach(function (x) { var k = tdsQ(x.date) + ' · ' + x.sec + (x.kind === 'tcs' ? ' (TCS)' : ''); qs[k] = qs[k] || { b: 0, a: 0 }; qs[k].b += x.base; qs[k].a += x.amt; });
  var ks = Object.keys(qs).sort().reverse();
  if (ks.length) h += '<h3 style="margin:14px 0 6px">Quarter and section summary</h3>' + table([['Quarter and section'], ['Amount', 'r'], ['Tax', 'r']], ks.map(function (k) { return [esc(k), money(qs[k].b), money(qs[k].a)]; }));
  CSV = csvRows.length ? csvOf(['Date', 'Quarter', 'Type', 'Party', 'PAN', 'Section', 'Amount', 'Rate %', 'Tax', 'Challan', 'Deposit date'], csvRows) : '';
  if (CSV) h += '<div>' + btn('showCsv', 'Show as CSV to copy', {}, 'sm') + '</div>';
  return h;
}
function tdsFormH(C, k) {
  var secs = k === 'tcs' ? TCS_SEC : TDS_SEC, t = k === 'in' ? 'invoice' : k === 'out' ? 'pinvoice' : 'invoice';
  var ps = C.d.parties.filter(function (p) { return p.type === (k === 'out' ? 'supplier' : 'customer'); });
  var docs = C.d.docs.filter(function (d) { return d.type === t && !d.cancelled && outstanding(C, d) > 0; });
  return '<div class="mh"><h2>' + esc(TDS_KIND[k]) + '</h2>' + btn('closeModal', 'Close', {}, 'sm line') + '</div><form data-submit="tdsSave"><input type="hidden" name="kind" value="' + k + '"><div class="fg">' +
    field(k === 'out' ? 'Supplier' : 'Customer', '<select name="party">' + opts(ps, '', function (p) { return p.id; }, function (p) { return p.name; }) + '</select>') +
    field('Against invoice (optional)', '<select name="ref"><option value="">None</option>' + docs.map(function (d) { return '<option value="' + d.id + '">' + esc(d.no + ' · ' + partyName(C, d.partyId) + ' · balance ' + money(outstanding(C, d))) + '</option>'; }).join('') + '</select>') +
    field('Section', '<select name="sec">' + secs.map(function (s) { return '<option value="' + s[0] + '" data-r="' + s[2] + '">' + esc(s[0] + ' · ' + s[1]) + '</option>'; }).join('') + '</select>') +
    field('Rate %', '<input name="rate" type="number" min="0" max="100" step="any" required value="' + secs[0][2] + '">') +
    field('Amount tax is on', '<input name="base" type="number" min="0.01" step="any" required>') + field('Date', '<input name="date" type="date" value="' + today() + '" required>') +
    (k === 'out' ? field('PAN of deductee', '<input name="pan" maxlength="10" placeholder="ABCDE1234F" style="text-transform:uppercase">') : '') +
    field('Note', '<input name="note">') + '</div>' +
    (k !== 'tcs' ? '<label class="chk" style="display:block;margin:8px 0"><input type="checkbox" name="settle" checked> Reduce the selected invoice balance by this tax amount</label>' : '') +
    '<div class="note" style="margin:8px 0">Pick the section, then check the rate. Rates change, so confirm with your CA.</div><button class="btn pri" type="submit">Save</button></form>';
}
function bindTds(A) {
  A.tdsNew = function (d) { modal(tdsFormH(cur(), d.k)); var m = document.querySelector('select[name=sec]'); if (m) m.addEventListener('change', function () { var r = m.options[m.selectedIndex].getAttribute('data-r'); var f = document.querySelector('input[name=rate]'); if (f) f.value = r; }); };
  A.tdsSave = function (fd) {
    var C = cur(), e = tdsAdd(C, { kind: fd.get('kind'), partyId: fd.get('party'), refId: fd.get('ref'), sec: fd.get('sec'), rate: parseFloat(fd.get('rate')), base: P(fd.get('base')), date: fd.get('date'), pan: fd.get('pan'), note: fd.get('note'), settle: !!fd.get('settle') });
    if (e) { toast(e, true); return; } closeModal(); toast('Saved.'); afterChange();
  };
  A.tdsDep = function (d) {
    modal('<div class="mh"><h2>Mark as deposited</h2>' + btn('closeModal', 'Close', {}, 'sm line') + '</div><form data-submit="tdsDepSave"><input type="hidden" name="id" value="' + d.id + '"><div class="fg">' + field('Challan number (CIN)', '<input name="chal" required maxlength="40">') + field('Deposit date', '<input name="date" type="date" value="' + today() + '" required>') + '</div><button class="btn pri" type="submit">Save</button></form>');
  };
  A.tdsDepSave = function (fd) {
    var C = cur(), x = (C.tds || []).find(function (y) { return y.id === fd.get('id'); }); if (!x) return;
    x.dep = { chal: String(fd.get('chal') || '').trim(), date: fd.get('date') }; if (!x.dep.chal) { toast('Enter the challan number.', true); return; }
    log('TDS deposited ' + money(x.amt), x.dep.chal); closeModal(); toast('Saved.'); afterChange();
  };
  A.tdsDel = function (d) { modal('<div class="mh"><h2>Delete this entry?</h2></div><div class="note">If it reduced an invoice balance, that payment is cancelled and the balance comes back.</div><div class="row">' + btn('tdsDelYes', 'Yes, delete', { id: d.id }, 'warn') + btn('closeModal', 'Keep it', {}, 'line') + '</div>'); };
  A.tdsDelYes = function (d) {
    var C = cur(), i = (C.tds || []).findIndex(function (y) { return y.id === d.id; }); if (i < 0) return;
    var x = C.tds[i]; if (x.payId) { var p = C.d.payments.find(function (q) { return q.id === x.payId; }); if (p) p.cancelled = true; }
    C.tds.splice(i, 1); log('Deleted TDS/TCS entry', x.sec); closeModal(); toast('Deleted.'); afterChange();
  };
}
/* ---------- bank reconciliation, cheques, loans ---------- */
function brState(C) { C.bankRec = C.bankRec || { cleared: {}, stmt: { date: '', bal: 0 }, unmatched: [] }; C.bankRec.cleared = C.bankRec.cleared || {}; C.bankRec.stmt = C.bankRec.stmt || { date: '', bal: 0 }; return C.bankRec; }
function brTx(C) { return cashBank(C).tx.filter(function (t) { return t.acct === 'Bank' && t.id; }).sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; }); }
function brNums(C) {
  var br = brState(C), tx = brTx(C), st = br.stmt, upto = st.date || '9999-12-31';
  var book = C.d.opening.bank, clr = C.d.opening.bank, unOut = 0, unIn = 0;
  tx.forEach(function (t) {
    if (t.date > upto) return;
    book += t.inn - t.out;
    if (br.cleared[t.id]) clr += t.inn - t.out; else { unOut += t.out; unIn += t.inn; }
  });
  return { book: book, cleared: clr, unOut: unOut, unIn: unIn, diff: st.date ? st.bal - clr : 0 };
}
function brDate(s) {
  s = String(s || '').trim(); var m;
  if ((m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s))) return m[1] + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[3]).slice(-2);
  if ((m = /^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/.exec(s))) { var y = m[3].length === 2 ? '20' + m[3] : m[3]; return y + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[1]).slice(-2); }
  return '';
}
function brNum(s) { var t = String(s == null ? '' : s).replace(/[,\s₹]/g, ''); return t && !isNaN(+t) ? Math.round(+t * 100) : 0; }
function brParse(txt) {
  var out = [];
  String(txt || '').split(/\r?\n/).forEach(function (ln) {
    if (!ln.trim()) return; var f = ln.split(/\t|,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(function (x) { return x.trim().replace(/^"|"$/g, '').trim(); });
    var d = brDate(f[0]); if (!d || f.length < 3) return;
    var debit = brNum(f[f.length - 2]), credit = brNum(f[f.length - 1]);
    if (f.length === 3) { debit = 0; credit = 0; var a = brNum(f[2]); if (a < 0) debit = -a; else credit = a; }
    if (!debit && !credit) return;
    out.push({ date: d, desc: f.slice(1, f.length > 3 ? -2 : -1).join(' '), debit: debit, credit: credit });
  });
  return out;
}
function brMatch(C, lines) {
  var br = brState(C), tx = brTx(C), n = 0, miss = [];
  lines.forEach(function (l) {
    var best = null, bd = 99;
    tx.forEach(function (t) {
      if (br.cleared[t.id]) return;
      if (l.debit ? t.out !== l.debit : t.inn !== l.credit) return;
      var dd = Math.abs((new Date(t.date) - new Date(l.date)) / 86400000); if (dd <= 10 && dd < bd) { best = t; bd = dd; }
    });
    if (best) { br.cleared[best.id] = l.date; n++; } else miss.push(l);
  });
  br.unmatched = miss; return { matched: n, miss: miss };
}
function bankTabH(C) {
  var w = canWrite('accounting'), br = brState(C), N = brNums(C), tx = brTx(C), show = S.tab.brAll ? tx : tx.filter(function (t) { return !br.cleared[t.id]; });
  var h = '<div class="grid">' + kpi('Book balance (bank)', money(N.book), br.stmt.date ? 'Up to ' + dmy(br.stmt.date) : 'All entries') + kpi('Cleared in bank', money(N.cleared), 'Ticked as seen in statement') +
    kpi('Not yet in bank', money(N.unIn - N.unOut), 'In ' + money(N.unIn) + ' · out ' + money(N.unOut)) + kpi('Difference', br.stmt.date ? money(N.diff) : '-', br.stmt.date ? (N.diff === 0 ? 'Reconciled' : 'Check the entries below') : 'Enter the statement balance', br.stmt.date && N.diff !== 0) + '</div>';
  if (w) h += '<form data-submit="brStmt" class="row"><label class="fld"><span>Statement date</span><input class="inp" type="date" name="date" value="' + br.stmt.date + '" required></label><label class="fld"><span>Closing balance on statement</span><input class="inp" type="number" step="any" name="bal" value="' + (br.stmt.date ? rs(br.stmt.bal) : '') + '" required></label><button class="btn" type="submit" style="align-self:flex-end">Save</button></form>' +
    '<details style="margin:10px 0"><summary><b>Paste bank statement to match automatically</b></summary><form data-submit="brPaste"><div class="note">One line per entry: Date, Description, Debit, Credit. Download CSV from your bank and paste. Matching is by amount within 10 days.</div><textarea class="inp" name="txt" rows="5" style="width:100%" placeholder="01/05/2026, UPI from Ravi, 0, 2500"></textarea><button class="btn pri" type="submit">Match now</button></form></details>';
  if (br.unmatched && br.unmatched.length) h += '<div class="hint"><b>' + br.unmatched.length + ' statement lines not found in your books</b> (bank charges, interest or missing entries):</div>' + table([['Date'], ['Details'], ['Debit', 'r'], ['Credit', 'r']], br.unmatched.map(function (l) { return [dmy(l.date), esc(l.desc), l.debit ? money(l.debit) : '', l.credit ? money(l.credit) : '']; }));
  h += '<div class="row"><label class="chk"><input type="checkbox" data-chg="brAll"' + (S.tab.brAll ? ' checked' : '') + '> Show cleared entries too</label></div>';
  h += table([['Date'], ['Details'], ['In', 'r'], ['Out', 'r'], ['Status'], ['']], show.map(function (t) {
    var c = br.cleared[t.id];
    return [dmy(t.date), esc(t.desc) + (t.chq ? ' <span class="note">(cheque)</span>' : ''), t.inn ? money(t.inn) : '', t.out ? money(t.out) : '', c ? '<span class="ok-t">Cleared ' + dmy(c) + '</span>' : 'Pending', w ? btn('brToggle', c ? 'Undo' : 'Mark cleared', { id: t.id }, 'sm' + (c ? ' line' : '')) : ''];
  }), 'Nothing to reconcile.');
  var chq = tx.filter(function (t) { return t.chq && !br.cleared[t.id]; });
  h += '<h3 style="margin:14px 0 6px">Cheques not yet cleared (' + chq.length + ')</h3>' + table([['Date'], ['Details'], ['Amount', 'r'], ['Days waiting', 'r'], ['']], chq.map(function (t) {
    var dn = Math.round((new Date(today()) - new Date(t.date)) / 86400000);
    return [dmy(t.date), esc(t.desc), money(t.inn || t.out), dn > 90 ? '<span class="warn-t">' + dn + ' (stale after 3 months)</span>' : dn, w ? btn('brBounce', 'Bounced', { id: t.id }, 'sm line') : ''];
  }), 'No pending cheques.');
  return h;
}
function loanEmi(P, rate, n) { var r = rate / 1200; if (!(n > 0)) return 0; return Math.round(r === 0 ? P / n : P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)); }
function loanSched(l) {
  var emi = loanEmi(l.principal, l.rate, l.months), bal = l.principal, rows = [], r = l.rate / 1200;
  for (var i = 1; i <= l.months; i++) {
    var int = Math.round(bal * r), pr = i === l.months ? bal : emi - int, e = i === l.months ? bal + int : emi;
    var d = new Date(l.start + 'T00:00:00Z'); d.setUTCMonth(d.getUTCMonth() + i);
    rows.push({ n: i, date: d.toISOString().slice(0, 10), emi: e, int: int, prin: pr, bal: bal - pr }); bal -= pr;
  }
  return rows;
}
function loanTabH(C) {
  var w = canWrite('accounting'), L = C.loans || [], h = '';
  if (w) h += '<form data-submit="loanSave" class="card" style="background:var(--bg)"><div class="fg">' + field('Loan name', '<input name="name" required placeholder="Bank loan, vehicle loan">') + field('Amount borrowed', '<input name="amt" type="number" min="1" step="any" required>') + field('Interest % per year', '<input name="rate" type="number" min="0" step="any" required>') + field('Months', '<input name="months" type="number" min="1" max="360" required>') + field('Start date', '<input name="start" type="date" value="' + today() + '" required>') + '</div><label class="chk" style="display:block;margin:8px 0"><input type="checkbox" name="recv" checked> Money was received in the bank account (adds it to bank balance)</label><button class="btn pri" type="submit">Add loan</button></form>';
  if (!L.length) return h + '<div class="note">No loans added. Add a loan to see the EMI schedule and record each EMI.</div>';
  L.forEach(function (l) {
    var s = loanSched(l), paid = (l.paid || []).length, left = s.filter(function (x) { return !(l.paid || []).some(function (p) { return p.n === x.n; }); });
    var nxt = left[0], bal = nxt ? nxt.bal + nxt.prin : 0;
    h += '<div class="card" style="margin-top:10px"><div class="row"><b>' + esc(l.name) + '</b><span class="note">' + money(l.principal) + ' at ' + l.rate + '% for ' + l.months + ' months · EMI ' + money(s[0].emi) + '</span></div><div class="grid">' + kpi('Outstanding principal', money(bal), paid + ' of ' + l.months + ' EMIs paid') + kpi('Next EMI', nxt ? money(nxt.emi) : 'Done', nxt ? 'Due ' + dmy(nxt.date) + (nxt.date < today() ? ' (overdue)' : '') : '', !!(nxt && nxt.date < today())) + '</div>' +
      (w && nxt ? '<div class="row">' + btn('loanPay', 'Record EMI ' + nxt.n + ' paid', { id: l.id }, 'pri') + '</div>' : '') +
      '<details><summary>EMI schedule</summary>' + table([['No.', 'r'], ['Date'], ['EMI', 'r'], ['Interest', 'r'], ['Principal', 'r'], ['Balance', 'r'], ['']], s.map(function (x) { var pd = (l.paid || []).some(function (p) { return p.n === x.n; }); return [x.n, dmy(x.date), money(x.emi), money(x.int), money(x.prin), money(x.bal), pd ? '<span class="ok-t">Paid</span>' : '']; })) + '</details>' +
      (w && !paid ? '<div>' + btn('loanDel', 'Delete loan', { id: l.id }, 'sm line') + '</div>' : '') + '</div>';
  });
  return h + '<div class="note">Recording an EMI adds the interest part as an expense and the principal part as a bank payment, so profit is not overstated.</div>';
}
function bindBank(A) {
  A.brStmt = function (fd) { var br = brState(cur()); br.stmt = { date: fd.get('date'), bal: P(fd.get('bal')) }; toast('Saved.'); afterChange(); };
  A.brToggle = function (d) { var br = brState(cur()); if (br.cleared[d.id]) delete br.cleared[d.id]; else br.cleared[d.id] = today(); afterChange(); };
  A.brPaste = function (fd) {
    var C = cur(), ls = brParse(fd.get('txt')); if (!ls.length) { toast('No lines understood. Use: Date, Description, Debit, Credit.', true); return; }
    var r = brMatch(C, ls); log('Bank statement matched', r.matched + ' of ' + ls.length); toast(r.matched + ' of ' + ls.length + ' lines matched.'); afterChange();
  };
  A.brBounce = function (d) { modal('<div class="mh"><h2>Cheque bounced?</h2></div><div class="note">The payment is cancelled and the invoice balance comes back. Record any bank charge separately as an expense.</div><div class="row">' + btn('brBounceYes', 'Yes, bounced', { id: d.id }, 'warn') + btn('closeModal', 'No', {}, 'line') + '</div>'); };
  A.brBounceYes = function (d) {
    var C = cur(), p = C.d.payments.find(function (x) { return x.id === d.id; });
    if (p) { p.cancelled = true; p.note = (p.note ? p.note + ' · ' : '') + 'Cheque bounced'; log('Cheque bounced', p.no); }
    closeModal(); toast('Marked as bounced.'); afterChange();
  };
  A.loanSave = function (fd) {
    var C = cur(), amt = P(fd.get('amt')), rate = parseFloat(fd.get('rate')), m = parseInt(fd.get('months'), 10), nm = String(fd.get('name') || '').trim();
    if (!nm || !(amt > 0) || !(rate >= 0) || !(m > 0)) { toast('Fill all loan details.', true); return; }
    C.loans = C.loans || []; C.loans.push({ id: uid(), name: nm, principal: amt, rate: rate, months: m, start: fd.get('start'), recv: !!fd.get('recv'), paid: [] }); log('Added loan', nm); toast('Loan added.'); afterChange();
  };
  A.loanPay = function (d) {
    var C = cur(), l = (C.loans || []).find(function (x) { return x.id === d.id; }); if (!l) return;
    var s = loanSched(l), x = s.find(function (y) { return !(l.paid || []).some(function (p) { return p.n === y.n; }); }); if (!x) return;
    var eid = uid(); C.d.expenses.push({ id: eid, date: today(), kind: 'expense', cat: 'Loan interest', amount: x.int, mode: 'Bank', note: l.name + ' EMI ' + x.n, by: (user() || {}).name || '' });
    l.paid = l.paid || []; l.paid.push({ n: x.n, date: today(), prin: x.prin, int: x.int, expId: eid }); log('Loan EMI paid ' + money(x.emi), l.name); toast('EMI recorded.'); afterChange();
  };
  A.loanDel = function (d) { var C = cur(); C.loans = (C.loans || []).filter(function (x) { return x.id !== d.id || (x.paid || []).length; }); afterChange(); };
  document.addEventListener('change', function (e) { var t = e.target; if (t && t.getAttribute && t.getAttribute('data-chg') === 'brAll') { S.tab.brAll = t.checked; render(); } });
}
/* ---------- GSTR-2B reconciliation ---------- */
function r2bNo(s) { return String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/^0+/, ''); }
function r2bKey(g, n) { return String(g || '').toUpperCase().trim() + '|' + r2bNo(n); }
function r2bFromJson(txt) {
  var o; try { o = JSON.parse(txt); } catch (e) { return null; }
  var d = (o && o.data && o.data.docdata) || (o && o.docdata) || (o && o.data) || o || {}, out = [];
  var cv = function (v) { return Math.round((+v || 0) * 100); };
  (d.b2b || []).forEach(function (s) {
    (s.inv || []).forEach(function (i) { out.push({ g: String(s.ctin || '').toUpperCase(), name: s.trdnm || '', no: String(i.inum || ''), date: brDate(i.dt || i.idt), tx: cv(i.txval), ig: cv(i.igst), cg: cv(i.cgst), sg: cv(i.sgst), cn: false }); });
  });
  (d.cdnr || []).forEach(function (s) {
    (s.nt || []).forEach(function (i) { out.push({ g: String(s.ctin || '').toUpperCase(), name: s.trdnm || '', no: String(i.ntnum || i.inum || ''), date: brDate(i.dt || i.idt), tx: cv(i.txval), ig: cv(i.igst), cg: cv(i.cgst), sg: cv(i.sgst), cn: true }); });
  });
  return out;
}
function r2bFromGrid(grid) {
  var hi = -1, i;
  for (i = 0; i < grid.length && i < 15; i++) { if (grid[i].some(function (c) { return /invoice\s*(number|no)|bill\s*no|note\s*number/i.test(String(c)); })) { hi = i; break; } }
  if (hi < 0) return null;
  var H = grid[hi].map(function (c) { return String(c).toLowerCase(); });
  var col = function (re) { for (var k = 0; k < H.length; k++) if (re.test(H[k])) return k; return -1; };
  var c = { g: col(/gstin/), name: col(/trade|legal|name/), no: col(/invoice\s*(number|no)|bill\s*no|note\s*number/), date: col(/invoice date|note date|\bdate\b/), tx: col(/taxable/), ig: col(/integrated|igst/), cg: col(/central|cgst/), sg: col(/state|sgst/) };
  if (c.g < 0 || c.no < 0) return null;
  var out = [];
  for (i = hi + 1; i < grid.length; i++) {
    var r = grid[i], g = String(r[c.g] || '').trim().toUpperCase(), n = String(r[c.no] || '').trim();
    if (!/^[0-9]{2}[A-Z0-9]{13}$/.test(g) || !n) continue;
    out.push({ g: g, name: c.name >= 0 ? String(r[c.name] || '') : '', no: n, date: c.date >= 0 ? brDate(r[c.date]) : '', tx: c.tx >= 0 ? brNum(r[c.tx]) : 0, ig: c.ig >= 0 ? brNum(r[c.ig]) : 0, cg: c.cg >= 0 ? brNum(r[c.cg]) : 0, sg: c.sg >= 0 ? brNum(r[c.sg]) : 0, cn: /note/i.test(H[c.no]) });
  }
  return out;
}
function r2bIngest(text) {
  var C = cur(), rows = null, t = String(text || '').trim();
  if (!t) { toast('Nothing to read.', true); return; }
  if (t.charAt(0) === '{' || t.charAt(0) === '[') rows = r2bFromJson(t);
  else rows = r2bFromGrid(t.split(/\r?\n/).map(function (l) { return l.split(/\t|,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(function (x) { return x.trim().replace(/^"|"$/g, '').trim(); }); }));
  if (!rows || !rows.length) { toast('No invoices found. Use the GSTR-2B JSON, or Excel/CSV with GSTIN and Invoice number columns.', true); return; }
  if (rows.length > 20000) { toast('File is too large.', true); return; }
  C.r2b = { at: today(), rows: rows }; log('GSTR-2B loaded', String(rows.length)); toast(rows.length + ' invoices read from GSTR-2B.'); afterChange();
}
function r2bRead(file) {
  if (file.size > 15 * 1024 * 1024) { toast('That file is too large.', true); return; }
  var fr = new FileReader();
  fr.onerror = function () { toast('Could not read that file.', true); };
  if (/\.(json|csv|txt)$/i.test(file.name)) { fr.onload = function () { r2bIngest(String(fr.result)); }; fr.readAsText(file); return; }
  fr.onload = function () {
    needXls().then(function () {
      try {
        var wb = window.XLSX.read(fr.result, { type: 'array' }), nm = wb.SheetNames.filter(function (n) { return /^b2b$/i.test(n); })[0] || wb.SheetNames.filter(function (n) { return /b2b/i.test(n) && !/cdn|b2ba/i.test(n); })[0] || wb.SheetNames[0];
        var grid = window.XLSX.utils.sheet_to_json(wb.Sheets[nm], { header: 1, defval: '', raw: false }), rows = r2bFromGrid(grid) || [];
        var cd = wb.SheetNames.filter(function (n) { return /^b2b-?cdnr$|cdnr/i.test(n) && !/cdnra/i.test(n); })[0];
        if (cd) { var g2 = r2bFromGrid(window.XLSX.utils.sheet_to_json(wb.Sheets[cd], { header: 1, defval: '', raw: false })) || []; g2.forEach(function (x) { x.cn = true; rows.push(x); }); }
        if (!rows.length) { toast('No invoices found in this sheet.', true); return; }
        var C = cur(); C.r2b = { at: today(), rows: rows }; log('GSTR-2B loaded', String(rows.length)); toast(rows.length + ' invoices read from GSTR-2B.'); afterChange();
      } catch (e) { toast('Could not read this file.', true); }
    }, function () { toast('Could not load the Excel reader. Check the internet once.', true); });
  };
  fr.readAsArrayBuffer(file);
}
function r2bCompute(C, r) {
  var b = C.r2b ? C.r2b.rows : [], map = {}, used = {};
  b.forEach(function (x, i) { map[r2bKey(x.g, x.no)] = i; });
  var docs = docsIn('pinvoice', r.from, r.to).concat(docsIn('preturn', r.from, r.to)), res = { ok: [], diff: [], miss: [], poss: [], only: [] };
  docs.forEach(function (d) {
    var p = partyById(C, d.partyId) || {}, k = r2bKey(p.gstin, d.sno), i = map[k], isR = d.type === 'preturn';
    if (i != null && !used[i]) {
      used[i] = 1; var x = b[i], dg = Math.abs(x.ig - d.igst) + Math.abs(x.cg - d.cgst) + Math.abs(x.sg - d.sgst);
      (dg <= 300 ? res.ok : res.diff).push({ d: d, x: x, dg: dg });
      return;
    }
    var pk = -1;
    b.forEach(function (x, j) { if (pk < 0 && !used[j] && p.gstin && x.g === String(p.gstin).toUpperCase() && Math.abs(x.tx - d.sub) <= 100 && (x.cn === isR)) pk = j; });
    if (pk >= 0) { used[pk] = 1; res.poss.push({ d: d, x: b[pk] }); } else res.miss.push({ d: d });
  });
  b.forEach(function (x, j) { if (!used[j] && (!x.date || (x.date >= r.from && x.date <= r.to))) res.only.push({ x: x }); });
  return res;
}
function r2bTab(C, r) {
  var w = canWrite('gst'), h = '<div class="note">Download GSTR-2B from the GST portal (JSON or Excel) and load it here. Each purchase bill is matched with it using supplier GSTIN and the supplier bill number entered on the purchase invoice.</div>';
  if (w) h += '<div class="row"><label class="fld"><span>GSTR-2B file (.json, .xlsx, .csv)</span><input class="inp" type="file" accept=".json,.xlsx,.xls,.csv,.txt" data-chg="r2bFile"></label></div><details style="margin:8px 0"><summary>Or paste JSON / CSV text</summary><form data-submit="r2bPaste"><textarea class="inp" name="txt" rows="4" style="width:100%"></textarea><button class="btn" type="submit">Read</button></form></details>';
  if (!C.r2b) return h + '<div class="note">No GSTR-2B loaded yet.</div>';
  var R = r2bCompute(C, r), itc = function (a) { return sumBy(a, function (e) { var d = e.d, s = d.type === 'preturn' ? -1 : 1; return s * (d.cgst + d.sgst + d.igst); }); };
  h += '<div class="grid">' + kpi('Matched', String(R.ok.length), 'ITC ' + money(itc(R.ok))) + kpi('Tax differs', String(R.diff.length), 'Check with supplier', R.diff.length > 0) + kpi('Not in GSTR-2B', String(R.miss.length + R.poss.length), 'ITC at risk ' + money(itc(R.miss) + itc(R.poss)), R.miss.length + R.poss.length > 0) + kpi('In 2B, not in books', String(R.only.length), 'Maybe a missed purchase', R.only.length > 0) + '</div>';
  h += '<div class="note">GSTR-2B loaded on ' + dmy(C.r2b.at) + ' · ' + C.r2b.rows.length + ' invoices. Date range follows the filter above.' + (w && R.ok.length ? ' ' : '') + '</div>' + (w && R.ok.length ? '<div class="row">' + btn('r2bApply', 'Tick matched bills as "In GSTR-2B"', {}, 'pri') + '</div>' : '');
  var dl = function (e) { var d = e.d, p = partyById(C, d.partyId) || {}; return [dmy(d.date), esc(p.name || '-'), esc(d.sno || '-'), esc(d.no)]; };
  if (R.diff.length) h += '<h3 style="margin:12px 0 6px">Tax amount differs</h3>' + table([['Date'], ['Supplier'], ['Supplier bill'], ['Our no'], ['Our tax', 'r'], ['GSTR-2B tax', 'r']], R.diff.map(function (e) { return dl(e).concat([money(e.d.cgst + e.d.sgst + e.d.igst), money(e.x.ig + e.x.cg + e.x.sg)]); }));
  if (R.poss.length) h += '<h3 style="margin:12px 0 6px">Possible match, bill number differs</h3>' + table([['Date'], ['Supplier'], ['Our bill no'], ['Our no'], ['GSTR-2B bill no']], R.poss.map(function (e) { return dl(e).concat([esc(e.x.no)]); }));
  if (R.miss.length) h += '<h3 style="margin:12px 0 6px">In your books, not in GSTR-2B</h3><div class="note">Do not claim this credit until the supplier files. Ask them to upload the bill.</div>' + table([['Date'], ['Supplier'], ['Supplier bill'], ['Our no'], ['Tax', 'r']], R.miss.map(function (e) { return dl(e).concat([money(e.d.cgst + e.d.sgst + e.d.igst)]); }));
  if (R.only.length) h += '<h3 style="margin:12px 0 6px">In GSTR-2B, not in your books</h3>' + table([['Date'], ['Supplier'], ['GSTIN'], ['Bill no'], ['Taxable', 'r'], ['Tax', 'r']], R.only.slice(0, 200).map(function (e) { var x = e.x; return [dmy(x.date), esc(x.name || '-'), esc(x.g), esc(x.no) + (x.cn ? ' <span class="note">(credit note)</span>' : ''), money(x.tx), money(x.ig + x.cg + x.sg)]; }));
  return h;
}
function bindR2b(A) {
  A.r2bPaste = function (fd) { r2bIngest(fd.get('txt')); };
  A.r2bApply = function () {
    var C = cur(), R = r2bCompute(C, rng()), n = 0; R.ok.forEach(function (e) { if (!e.d.m2b) { e.d.m2b = true; n++; } });
    log('GSTR-2B matched bills ticked', String(n)); toast(n + ' bills ticked.'); afterChange();
  };
  document.addEventListener('change', function (e) { var t = e.target; if (t && t.dataset && t.dataset.chg === 'r2bFile' && t.files && t.files[0]) r2bRead(t.files[0]); });
}
/* ---------- CRM and Insights (owner only) ---------- */
function crmMonths(n) {
  var out = [], d = new Date(today() + 'T00:00:00');
  d.setDate(1);
  for (var i = n - 1; i >= 0; i--) { var x = new Date(d.getFullYear(), d.getMonth() - i, 1); out.push(x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0')); }
  return out;
}
function crmMonLabel(k) { var m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; return m[+k.slice(5) - 1] + ' ' + k.slice(2, 4); }
function crmBars(title, labels, series, colors, names) {
  var W = 640, H = 200, pl = 8, pb = 22, n = labels.length, mx = 1;
  series.forEach(function (s) { s.forEach(function (v) { if (v > mx) mx = v; }); });
  var gw = (W - pl) / n, bw = Math.max(4, Math.min(34, gw / (series.length + 1))), g = '';
  labels.forEach(function (lb, i) {
    series.forEach(function (s, j) {
      var h = Math.round((H - pb - 14) * s[i] / mx), x = pl + i * gw + (gw - bw * series.length) / 2 + j * bw;
      g += '<rect x="' + x.toFixed(1) + '" y="' + (H - pb - h) + '" width="' + (bw - 2) + '" height="' + Math.max(h, s[i] ? 1 : 0) + '" rx="2" fill="' + colors[j] + '"><title>' + esc(lb + ' - ' + (names ? names[j] + ': ' : '') + money(s[i])) + '</title></rect>';
    });
    g += '<text x="' + (pl + i * gw + gw / 2).toFixed(1) + '" y="' + (H - 6) + '" font-size="10" text-anchor="middle" fill="currentColor" opacity=".7">' + esc(lb) + '</text>';
  });
  var leg = names ? '<div class="note">' + names.map(function (nm, j) { return '<span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:' + colors[j] + ';margin-right:4px"></span>' + esc(nm); }).join(' &nbsp; ') + '</div>' : '';
  return '<div class="card" style="background:var(--bg)"><h2>' + esc(title) + '</h2><svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;height:auto;max-height:240px" role="img" aria-label="' + esc(title) + '">' + g + '</svg>' + leg + '</div>';
}
function crmHBars(title, rows, color) {
  var mx = 1; rows.forEach(function (r) { if (r[1] > mx) mx = r[1]; });
  if (!rows.length) return '<div class="card" style="background:var(--bg)"><h2>' + esc(title) + '</h2><div class="empty">No data in this period.</div></div>';
  return '<div class="card" style="background:var(--bg)"><h2>' + esc(title) + '</h2>' + rows.map(function (r) {
    return '<div style="margin:6px 0"><div class="row" style="justify-content:space-between;font-size:13px"><span>' + esc(r[0]) + '</span><b>' + money(r[1]) + '</b></div><div style="height:8px;border-radius:4px;background:var(--line,#ddd)"><div style="height:8px;border-radius:4px;width:' + Math.max(2, Math.round(100 * r[1] / mx)) + '%;background:' + color + '"></div></div></div>';
  }).join('') + '</div>';
}
function crmData(C, r) {
  var cust = {}, items = {}, modes = {}, months = crmMonths(12), mS = {}, mP = {}, mR = {};
  months.forEach(function (k) { mS[k] = 0; mP[k] = 0; mR[k] = 0; });
  var sales = 0, ret = 0, cnt = 0;
  C.d.docs.forEach(function (d) {
    if (d.cancelled) return;
    var mk = d.date.slice(0, 7);
    if (d.type === 'invoice' || d.type === 'debitnote') { if (mS[mk] !== undefined) mS[mk] += d.total; }
    if (d.type === 'creditnote') { if (mS[mk] !== undefined) mS[mk] -= d.total; }
    if (d.type === 'pinvoice' && mP[mk] !== undefined) mP[mk] += d.total;
    if (d.date < r.from || d.date > r.to) return;
    if (d.type === 'invoice' || d.type === 'debitnote') {
      sales += d.total; cnt++;
      var p = partyById(C, d.partyId), nm = p ? p.name : 'Walk-in';
      cust[nm] = (cust[nm] || 0) + d.total;
      (d.items || []).forEach(function (it) { var k = it.name || 'Item'; var v = Math.round((+it.qty || 0) * (+it.rate || 0) * (1 - (+it.disc || 0) / 100)); if (!items[k]) items[k] = { v: 0, q: 0 }; items[k].v += v; items[k].q += (+it.qty || 0); });
    }
    if (d.type === 'creditnote') ret += d.total;
  });
  C.d.payments.forEach(function (x) {
    if (x.cancelled || x.type !== 'receipt') return;
    var mk = x.date.slice(0, 7); if (mR[mk] !== undefined) mR[mk] += x.amount;
    if (x.date >= r.from && x.date <= r.to) modes[x.mode || 'Cash'] = (modes[x.mode || 'Cash'] || 0) + x.amount;
  });
  return { cust: cust, items: items, modes: modes, months: months, mS: mS, mP: mP, mR: mR, sales: sales, ret: ret, cnt: cnt };
}
function crmAging(C) {
  var b = { 'Not due': 0, '0-30 days': 0, '31-60 days': 0, '61-90 days': 0, '90+ days': 0 }, list = [], t = new Date(today() + 'T00:00:00');
  C.d.docs.forEach(function (d) {
    if (d.type !== 'invoice' || d.cancelled) return;
    var o = outstanding(C, d); if (o <= 0) return;
    var due = d.due || d.date, days = Math.floor((t - new Date(due + 'T00:00:00')) / 86400000);
    var k = days < 0 ? 'Not due' : days <= 30 ? '0-30 days' : days <= 60 ? '31-60 days' : days <= 90 ? '61-90 days' : '90+ days';
    b[k] += o; list.push({ d: d, o: o, days: days });
  });
  return { b: b, list: list };
}
function vCrm() {
  var C = cur(), tab = S.tab.crm || 'ov', r = rng();
  var tabs = [['ov', 'Overview'], ['cust', 'Customers'], ['dues', 'Dues and Aging'], ['items', 'Items'], ['coll', 'Collections'], ['profit', 'Profit and Cash']];
  var h = top('CRM and Insights', 'Owner view: how your business is doing, with graphs', '') + '<div class="card"><div class="row"><label class="fld"><span>From</span><input class="inp" type="date" data-range="from" value="' + r.from + '"></label><label class="fld"><span>To</span><input class="inp" type="date" data-range="to" value="' + r.to + '"></label></div>' + tabsH(tabs, tab, 'tab');
  var D = crmData(C, r), mlab = D.months.map(crmMonLabel);
  var custRows = Object.keys(D.cust).map(function (k) { return [k, D.cust[k]]; }).sort(function (a, b) { return b[1] - a[1]; });
  var itemRows = Object.keys(D.items).map(function (k) { return [k, D.items[k].v, D.items[k].q]; }).sort(function (a, b) { return b[1] - a[1]; });
  var recv = 0, pay = 0;
  C.d.parties.forEach(function (p) { var b = partyBalance(C, p); if (p.type === 'customer') recv += Math.max(b, 0); else pay += Math.max(b, 0); });
  var ag = crmAging(C);
  if (tab === 'ov') {
    h += '<div class="grid">' + kpi('Sales', money(D.sales - D.ret), D.cnt + ' invoice(s), after returns') + kpi('Customers who bought', String(custRows.length), 'in this period') + kpi('To receive', money(recv), 'Customers owe you', recv > 0) + kpi('To pay', money(pay), 'You owe suppliers') + '</div>';
    h += crmBars('Sales, last 12 months', mlab, [D.months.map(function (k) { return D.mS[k]; })], ['#2f7d5b']);
    h += '<div class="grid2">' + crmHBars('Top 5 customers', custRows.slice(0, 5), '#2f7d5b') + crmHBars('Top 5 items (sales value)', itemRows.slice(0, 5).map(function (x) { return [x[0], x[1]]; }), '#c7821f') + '</div>';
  } else if (tab === 'cust') {
    var tot = sumF(custRows, function (x) { return x[1]; });
    h += crmHBars('Top 10 customers by sales', custRows.slice(0, 10), '#2f7d5b');
    var top3 = sumF(custRows.slice(0, 3), function (x) { return x[1]; });
    h += '<div class="note">' + (tot ? 'Top 3 customers give ' + Math.round(100 * top3 / tot) + '% of sales.' : '') + '</div>';
    var last = {};
    C.d.docs.forEach(function (d) { if (d.type === 'invoice' && !d.cancelled && d.partyId && (!last[d.partyId] || d.date > last[d.partyId])) last[d.partyId] = d.date; });
    var t0 = new Date(today() + 'T00:00:00'), sleeping = C.d.parties.filter(function (p) { return p.type === 'customer' && last[p.id] && (t0 - new Date(last[p.id] + 'T00:00:00')) / 86400000 > 60; }).sort(function (a, b) { return last[a.id].localeCompare(last[b.id]); });
    h += '<h2>Not bought for 60+ days (call them)</h2>' + table([['Customer'], ['Phone'], ['Last bill'], ['Balance', 'r']], sleeping.slice(0, 25).map(function (p) { return [esc(p.name), esc(p.phone || '-'), dmy(last[p.id]), money(partyBalance(C, p))]; }), 'All customers bought recently.', null, sleeping.slice(0, 25).map(function (p) { return ['ledger', p.id]; }));
    h += '<h2>All customers in this period</h2>' + table([['Customer'], ['Sales', 'r'], ['Share', 'r']], custRows.slice(0, 50).map(function (x) { return [esc(x[0]), money(x[1]), tot ? Math.round(100 * x[1] / tot) + '%' : '']; }), 'No sales in this period.');
  } else if (tab === 'dues') {
    h += '<div class="grid">' + Object.keys(ag.b).map(function (k) { return kpi(k, money(ag.b[k]), 'outstanding', k === '90+ days' && ag.b[k] > 0); }).join('') + '</div>';
    h += crmHBars('Dues by age', Object.keys(ag.b).map(function (k) { return [k, ag.b[k]]; }), '#b4442f');
    ag.list.sort(function (a, b) { return b.days - a.days; });
    h += '<h2>Unpaid invoices, oldest first</h2>' + table([['Invoice'], ['Customer'], ['Date'], ['Days late', 'r'], ['Pending', 'r']], ag.list.slice(0, 50).map(function (x) { return [esc(x.d.no), esc(partyName(C, x.d.partyId)), dmy(x.d.date), x.days > 0 ? String(x.days) : '-', money(x.o)]; }), 'No pending dues.', null, ag.list.slice(0, 50).map(function (x) { return ['view', x.d.id]; }));
  } else if (tab === 'items') {
    h += crmHBars('Top 10 items by sales value', itemRows.slice(0, 10).map(function (x) { return [x[0], x[1]]; }), '#c7821f');
    h += '<h2>Item sales</h2>' + table([['Item'], ['Qty sold', 'r'], ['Sales value', 'r']], itemRows.slice(0, 60).map(function (x) { return [esc(x[0]), String(Math.round(x[2] * 100) / 100), money(x[1])]; }), 'No item sales in this period.');
    var sold = {}; itemRows.forEach(function (x) { sold[x[0]] = 1; });
    var dead = C.d.products.filter(function (p) { return p.tracked && stockQty(C, p.id) > 0 && !sold[p.name]; });
    h += '<h2>In stock but not sold in this period</h2>' + table([['Item'], ['In stock', 'r'], ['Value', 'r']], dead.slice(0, 40).map(function (p) { var q = stockQty(C, p.id); return [esc(p.name), String(q), money(Math.round(q * (p.cost || 0)))]; }), 'Everything in stock has moved.');
  } else if (tab === 'coll') {
    h += crmBars('Billed vs collected, last 12 months', mlab, [D.months.map(function (k) { return D.mS[k]; }), D.months.map(function (k) { return D.mR[k]; })], ['#2f7d5b', '#c7821f'], ['Sales', 'Receipts']);
    h += crmHBars('Money received by mode (this period)', Object.keys(D.modes).map(function (k) { return [k, D.modes[k]]; }).sort(function (a, b) { return b[1] - a[1]; }), '#2f7d5b');
  } else {
    var mExp = {}; D.months.forEach(function (k) { mExp[k] = 0; });
    C.d.expenses.forEach(function (e) { if (e.kind === 'expense') { var k = e.date.slice(0, 7); if (mExp[k] !== undefined) mExp[k] += e.amount; } });
    h += crmBars('Sales vs purchases, last 12 months', mlab, [D.months.map(function (k) { return D.mS[k]; }), D.months.map(function (k) { return D.mP[k]; })], ['#2f7d5b', '#6a6fb5'], ['Sales', 'Purchases']);
    h += crmBars('Expenses, last 12 months', mlab, [D.months.map(function (k) { return mExp[k]; })], ['#b4442f']);
    var cb = cashBank(C);
    h += '<div class="grid">' + kpi('Cash and bank', money(cb.cash + cb.bank), 'Cash ' + money(cb.cash) + ' / Bank ' + money(cb.bank)) + kpi('Receivable', money(recv), 'to collect') + kpi('Payable', money(pay), 'to pay') + '</div><div class="note">Full profit and loss, GST and stock reports are in Reports and GST.</div>';
  }
  return h + '</div>';
}
/* --- extra reports: bill-wise profit, party-wise sales, low stock --- */
function billProfitH(C, r) {
  var cost = {};
  C.d.moves.forEach(function (m) { if ((m.type === 'sale' || m.type === 'salereturn') && m.ref) cost[m.ref] = (cost[m.ref] || 0) - m.qty * m.cost; });
  var list = docsIn('invoice', r.from, r.to).sort(function (a, b) { return a.date.localeCompare(b.date); });
  var tS = 0, tC = 0;
  var rows = list.map(function (d) { var c = Math.round(cost[d.id] || 0), p = d.sub - c, pc = d.sub > 0 ? Math.round(p * 1000 / d.sub) / 10 : 0; tS += d.sub; tC += c; var pt = partyById(C, d.partyId) || {}; return ['<b>' + esc(d.no) + '</b>', dmy(d.date), esc(pt.name || '-'), money(d.sub), money(c), '<b>' + money(p) + '</b>', pc + '%']; });
  var h = '<div class="note">Profit per bill = sale value (without tax) minus the cost of items sold, at average cost on the day of sale. Services have no cost.</div>';
  h += table([['Bill'], ['Date'], ['Customer'], ['Sale', 'r'], ['Cost', 'r'], ['Profit', 'r'], ['Margin', 'r']], rows, 'No bills in this period.', ['Total', '', '', money(tS), money(tC), money(tS - tC), tS > 0 ? (Math.round((tS - tC) * 1000 / tS) / 10) + '%' : ''], list.map(function (d) { return ['view', d.id]; }));
  return h;
}
function partySalesH(C, r) {
  var m = {};
  function row(id) { return m[id] = m[id] || { n: 0, s: 0, ret: 0 }; }
  docsIn('invoice', r.from, r.to).forEach(function (d) { var o = row(d.partyId); o.n++; o.s += d.total; });
  docsIn('creditnote', r.from, r.to).forEach(function (d) { row(d.partyId).ret += d.total; });
  var ids = Object.keys(m).sort(function (a, b) { return (m[b].s - m[b].ret) - (m[a].s - m[a].ret); });
  var T = { n: 0, s: 0, ret: 0 };
  var rows = ids.map(function (id) { var o = m[id], p = partyById(C, id) || {}; T.n += o.n; T.s += o.s; T.ret += o.ret; return [esc(p.name || 'Walk-in'), esc(p.phone || ''), o.n, money(o.s), money(o.ret), '<b>' + money(o.s - o.ret) + '</b>', money(partyBalance(C, id))]; });
  return '<div class="note">Which customer bought how much in this period, best customer first.</div>' + table([['Customer'], ['Phone'], ['Bills', 'r'], ['Sales', 'r'], ['Returns', 'r'], ['Net', 'r'], ['Balance now', 'r']], rows, 'No sales in this period.', ['Total', '', T.n, money(T.s), money(T.ret), money(T.s - T.ret), '']);
}
function lowStockH(C) {
  var rows = [];
  C.d.products.forEach(function (p) { if (!p.tracked) return; var q = stockQty(C, p.id); if (q <= (p.min || 0)) rows.push({ p: p, q: q }); });
  rows.sort(function (a, b) { return a.q - b.q; });
  return '<div class="note">Items at or below the minimum stock you set. Order these first.</div>' + table([['Item'], ['In stock', 'r'], ['Minimum', 'r'], ['Short by', 'r'], ['Last cost', 'r'], ['Status']], rows.map(function (o) { var p = o.p; return [esc(p.name), qtyF(o.q) + ' ' + esc(p.unit), qtyF(p.min || 0), qtyF(Math.max(0, (p.min || 0) - o.q)), money(p.cost), o.q <= 0 ? '<span class="chip warn">Out of stock</span>' : '<span class="chip warn">Low</span>']; }), 'All items are above their minimum stock.');
}

/* --- time stamps, clock, preferences, business type, PIN-first --- */
function p2(n) { return (n < 10 ? '0' : '') + n; }
function tmStr(iso) {
  var x = iso ? new Date(iso) : new Date(); if (isNaN(x.getTime())) return '';
  var h = x.getHours(), ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
  return p2(x.getDate()) + '/' + p2(x.getMonth() + 1) + '/' + x.getFullYear() + ' ' + p2(h) + ':' + p2(x.getMinutes()) + ' ' + ap;
}
function nowStamp() { var u = (typeof user === 'function' && user()) || {}; return tmStr() + (u.name ? ' · ' + u.name : ''); }
function clockParts() {
  var x = new Date(), h = x.getHours(), ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
  var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return { t: p2(h) + ':' + p2(x.getMinutes()) + ':' + p2(x.getSeconds()) + ' ' + ap, d: days[x.getDay()] + ', ' + p2(x.getDate()) + '/' + p2(x.getMonth() + 1) + '/' + x.getFullYear() };
}
function clockH() { var c = clockParts(); return '<div class="hm-clock"><b id="hmClk">' + c.t + '</b><span id="hmClkD">' + c.d + '</span></div>'; }
function pfOf(C) { return Object.assign({ dueDays: 15, validDays: 14, terms: '', footer: '', sig: 'Authorised signatory', stamp: true, lowHome: true, idle: 0 }, (C && C.pf) || {}); }
function stockOn(C) { return !!((BIZ[C.bizType] || BIZ.other).tracked || C.d.products.some(function (p) { return p.tracked; })); }
function bizNote(k) { var b = BIZ[k] || BIZ.other; return b.label + ': new items start with GST ' + b.gst + '%, unit ' + b.unit + ', stock tracking ' + (b.tracked ? 'ON' : 'OFF') + (b.tracked ? '.' : '. Stock boxes are hidden on Home until you add a stocked item.'); }
var NOTIMERS = /jsdom/i.test((navigator && navigator.userAgent) || '');
(function () {
  if (!NOTIMERS) setInterval(function () { var a = document.getElementById('hmClk'); if (!a) return; var c = clockParts(); a.textContent = c.t; var b = document.getElementById('hmClkD'); if (b) b.textContent = c.d; }, 1000);
  window.addEventListener('beforeprint', function () { var C = null; try { C = cur(); } catch (e) { } if (C && pfOf(C).stamp === false) document.body.removeAttribute('data-stamp'); else document.body.setAttribute('data-stamp', 'Printed ' + nowStamp()); });
  document.addEventListener('change', function (e) { var t = e.target; if (t && t.name === 'biz' && t.tagName === 'SELECT') { var n = document.getElementById('bizHint'); if (n) n.textContent = bizNote(t.value); } });
  var lastAct = Date.now();
  ['click', 'keydown', 'touchstart'].forEach(function (ev) { document.addEventListener(ev, function () { lastAct = Date.now(); }, true); });
  if (!NOTIMERS) setInterval(function () { try { if (!DB || !DB.session || S.mode === 'login') return; var m = pfOf(cur()).idle; if (m > 0 && Date.now() - lastAct > m * 60000) { lastAct = Date.now(); A.logout(); toast('Logged out after ' + m + ' minutes without use.'); } } catch (e) { } }, 15000);
})();
function prefsH(C) {
  var p = pfOf(C);
  return '<form data-submit="savePrefs"><div class="fg">' +
    field('Invoice due after (days)', '<input name="dueDays" type="number" min="0" max="365" value="' + esc(p.dueDays) + '">') +
    field('Quotation valid for (days)', '<input name="validDays" type="number" min="1" max="365" value="' + esc(p.validDays) + '">') +
    field('Auto logout when idle', '<select name="idle">' + opts([[0, 'Never'], [5, '5 minutes'], [10, '10 minutes'], [30, '30 minutes'], [60, '1 hour']], p.idle, function (x) { return x[0]; }, function (x) { return x[1]; }) + '</select>') +
    field('Signature line on bills', '<input name="sig" maxlength="40" value="' + esc(p.sig) + '">') +
    field('Default notes and terms on new bills', '<textarea name="terms" maxlength="400">' + esc(p.terms) + '</textarea>', 'wide') +
    field('Thank-you line at the bottom of bills', '<input name="footer" maxlength="120" value="' + esc(p.footer) + '">', 'wide') +
    '</div><label class="ck" style="margin-top:10px"><input type="checkbox" name="stamp"' + (p.stamp === false ? '' : ' checked') + '> Print date, time and user name on every printout</label>' +
    '<label class="ck"><input type="checkbox" name="lowHome"' + (p.lowHome === false ? '' : ' checked') + '> Show low stock box on Home</label>' +
    '<div class="note">These settings apply to new bills. Old bills are not changed.</div><div style="margin-top:12px"><button class="btn pri" type="submit">Save preferences</button></div></form>';
}
function needPinSetup(next) {
  if (role() !== 'owner') { toast('Ask the owner to set the 4-digit PIN in Settings, Users and Roles.', true); return; }
  S.pinNext2 = next;
  modal('<div class="mh"><h2>Set a 4-digit PIN</h2>' + btn('closeModal', 'Cancel', {}, 'sm line') + '</div><form data-submit="pinFirst"><div class="note">Editing or cancelling a bill needs a PIN. Set it once now. Only you should know it.</div><label class="fld"><span>New PIN</span><input name="pin" type="password" inputmode="numeric" maxlength="4" autocomplete="off" required style="max-width:140px;letter-spacing:6px;font-size:20px"></label><label class="fld"><span>New PIN again</span><input name="pin2" type="password" inputmode="numeric" maxlength="4" autocomplete="off" required style="max-width:140px;letter-spacing:6px;font-size:20px"></label><div class="row" style="margin-top:12px"><button class="btn pri" type="submit">Save PIN and continue</button></div></form>');
}
/* --- home search, show-more, godown transfers, recycle bin view, exports, auto backup --- */
function hmMoreBtn(k, total, small, big) {
  if (total <= small) return '';
  var open = !!(S.hmMore && S.hmMore[k]);
  return '<div style="text-align:center;margin-top:8px"><button type="button" class="btn sm line" data-act="hmMore" data-k="' + k + '" aria-expanded="' + open + '">' + (open ? '▴ Show less' : '▾ Show ' + (Math.min(total, big) - small) + ' more') + '</button></div>';
}
function hmSearchH(C) {
  return '<div class="card hmsrch"><label class="fld" style="margin:0"><span>Search everything</span><input id="hq" class="inp" type="search" autocomplete="off" placeholder="Customer, supplier, item, bill number, phone, GSTIN, amount, vehicle..." value="' + esc(S.hq || '') + '" aria-label="Search all data"></label><div id="hqres">' + hmSearchRes(C, S.hq || '') + '</div></div>';
}
function hmSearchRes(C, q) {
  q = String(q || '').trim().toLowerCase(); if (q.length < 1) return '';
  var words = q.split(/\s+/), d = C.d, out = '', fin = canView('accounting');
  function hit(s) { s = String(s).toLowerCase(); return words.every(function (w) { return s.indexOf(w) >= 0; }); }
  function rup(n) { return (n / 100).toFixed(2); }
  function grp(title, rows, more) { if (!rows.length) return ''; return '<div class="sg"><div class="sgt">' + esc(title) + ' <span class="mute">(' + rows.length + (more ? '+' : '') + ')</span></div>' + rows.slice(0, 6).join('') + '</div>'; }
  function row(act, id, a, b, c) { return '<button type="button" class="sug-row" data-act="' + act + '" data-id="' + esc(id) + '"><span><b>' + esc(a) + '</b> <span class="note">' + esc(b) + '</span></span><span class="note">' + esc(c || '') + '</span></button>'; }
  var docs = d.docs.filter(function (x) { return hit([x.no, DT[x.type].label, partyName(C, x.partyId), x.notes || '', x.req || '', rup(x.total || 0), (x.items || []).map(function (i) { return i.name; }).join(' '), x.vehicle || '', x.ewb && x.ewb.no || ''].join(' ')); }).sort(function (a, b) { return (b.date + b.no).localeCompare(a.date + a.no); });
  out += grp('Bills and documents', docs.map(function (x) { return row('view', x.id, x.no, DT[x.type].label + ' · ' + partyName(C, x.partyId) + (x.cancelled ? ' · Cancelled' : ''), dmy(x.date) + (DT[x.type].items ? ' · ' + money(x.total) : '')); }));
  var ps = d.parties.filter(function (p) { return hit([p.name, p.phone, p.email, p.gstin, p.city, p.address].join(' ')); });
  out += grp('Customers and suppliers', ps.map(function (p) { return row('ledger', p.id, p.name, (p.type === 'customer' ? 'Customer' : 'Supplier') + (p.phone ? ' · ' + p.phone : ''), money(partyBalance(C, p))); }));
  var pr = d.products.filter(function (p) { return hit([p.name, p.sku, p.hsn, p.barcode || '', p.cat || ''].join(' ')); });
  out += grp('Items', pr.map(function (p) { return row('editProd', p.id, p.name, (p.cat || '') + (p.tracked ? ' · stock ' + qtyF(stockQty(C, p.id)) + ' ' + p.unit : ''), money(p.sale)); }));
  if (fin) {
    var pa = d.payments.filter(function (x) { return hit([x.no, partyName(C, x.partyId), x.mode, x.note || '', rup(x.amount)].join(' ')); });
    out += grp('Receipts and payments', pa.map(function (x) { return row('viewPay', x.id, x.no, partyName(C, x.partyId) + (x.cancelled ? ' · Cancelled' : ''), dmy(x.date) + ' · ' + money(x.amount)); }));
    var ex = d.expenses.filter(function (e) { return hit([e.cat, e.note || '', e.mode || '', rup(e.amount)].join(' ')); });
    out += grp('Income and expenses', ex.map(function (e) { return row('editExp', e.id, e.cat, (e.kind === 'income' ? 'Income' : 'Expense') + (e.note ? ' · ' + e.note : ''), dmy(e.date) + ' · ' + money(e.amount)); }));
  }
  var tr = (d.transfers || []).filter(function (t) { return hit([t.no, t.from, t.to, t.vehicle || '', t.driver || '', t.transporter || '', t.note || ''].join(' ')); });
  out += grp('Godown transfers', tr.map(function (t) { return row('viewTr', t.id, t.no, t.from + ' to ' + t.to + (t.vehicle ? ' · ' + t.vehicle : ''), dmy(t.date)); }));
  return out || '<div class="note" style="margin-top:8px">Nothing found for "' + esc(q) + '".</div>';
}

/* ---------- godown transfer documents ---------- */
function trList(C) { C.d.transfers = C.d.transfers || []; return C.d.transfers; }
function trNo(C, date) { var key = 'transfer|' + fyLabel(date); C.d.counters[key] = (C.d.counters[key] || 0) + 1; return ((C.d.series.transfer && C.d.series.transfer.prefix) || 'STF') + '/' + fyLabel(date) + '/' + String(C.d.counters[key]).padStart(4, '0'); }
function trFormH(C) {
  var tracked = C.d.products.filter(function (p) { return p.tracked; }), whs = C.d.warehouses;
  var lines = '';
  for (var i = 0; i < 6; i++) lines += '<div class="row" style="margin-bottom:6px"><select class="inp" name="p' + i + '" style="flex:2 1 220px" aria-label="Item ' + (i + 1) + '"><option value="">' + (i ? 'Another item (optional)' : 'Select item') + '</option>' + opts(tracked, '', function (p) { return p.id; }, function (p) { return p.name + ' (' + qtyF(stockQty(C, p.id)) + ' ' + p.unit + ')'; }) + '</select><input class="inp num" name="q' + i + '" type="number" min="0" step="any" placeholder="Qty" style="flex:1 1 90px" aria-label="Quantity ' + (i + 1) + '"></div>';
  return '<div class="card" style="background:var(--bg)"><h2>New godown transfer</h2><div class="note">Moves stock from one godown to another and makes a transfer challan with vehicle details. Carry the printed challan with the goods.</div><form data-submit="saveTransfer"><div class="fg">' +
    field('From godown', '<select name="from">' + opts(whs) + '</select>') + field('To godown', '<select name="to">' + opts(whs, whs[1] || '') + '</select>') + field('Date', '<input name="date" type="date" required value="' + today() + '">') +
    field('Vehicle number', '<input name="vehicle" maxlength="20" placeholder="TN 68 AB 1234" style="text-transform:uppercase">') + field('Driver name and phone', '<input name="driver" maxlength="60">') + field('Transporter (if any)', '<input name="transporter" maxlength="60">') +
    field('E-way bill number (if any)', '<input name="ewb" maxlength="20" inputmode="numeric">') + field('Note', '<input name="note" maxlength="120">') + '</div><h3 style="margin:10px 0 6px">Items to move</h3>' + lines + '<div style="margin-top:10px"><button class="btn pri" type="submit">Save transfer</button></div></form></div>';
}
function trTabH(C) {
  var list = trList(C).slice().sort(function (a, b) { return (b.date + b.no).localeCompare(a.date + a.no); });
  var h = C.d.warehouses.length < 2 ? '<div class="hint">Add a second godown in the Warehouses tab first.</div>' : (canWrite('inventory') ? trFormH(C) : '');
  h += '<h2 style="margin-top:12px">Transfer challans</h2>' + table([['No'], ['Date'], ['From'], ['To'], ['Vehicle'], ['Items', 'r'], ['Status']], list.map(function (t) { return ['<b>' + esc(t.no) + '</b>', dmy(t.date), esc(t.from), esc(t.to), esc(t.vehicle || '-'), t.items.length, t.cancelled ? '<span class="chip warn">Cancelled</span>' : '<span class="chip ok">Done</span>']; }), 'No godown transfers yet.', null, list.map(function (t) { return ['viewTr', t.id]; }));
  return h;
}
function trViewH(t) {
  var C = cur();
  var h = '<div class="mh"><h2>Transfer ' + esc(t.no) + '</h2>' + btn('closeModal', 'Close', {}, 'sm line') + '</div><div class="pre">' +
    '<div class="hd"><div><b style="font-size:17px">' + esc(C.name) + '</b><div style="font-size:12px;opacity:.8">' + esc(C.address || '') + (C.gstin ? ' · GSTIN ' + esc(C.gstin) : '') + '</div></div><div style="text-align:right"><b>STOCK TRANSFER CHALLAN</b><div style="font-size:12px;opacity:.8">' + esc(t.no) + ' · ' + dmy(t.date) + '</div></div></div>' +
    '<div class="fg"><div><div class="note">From godown</div><b>' + esc(t.from) + '</b></div><div><div class="note">To godown</div><b>' + esc(t.to) + '</b></div><div><div class="note">Vehicle</div><b>' + esc(t.vehicle || '-') + '</b></div><div><div class="note">Driver</div><b>' + esc(t.driver || '-') + '</b></div><div><div class="note">Transporter</div><b>' + esc(t.transporter || '-') + '</b></div><div><div class="note">E-way bill</div><b>' + esc(t.ewb || '-') + '</b></div></div>' +
    table([['Item'], ['HSN'], ['Qty', 'r']], t.items.map(function (it) { return [esc(it.name), esc(it.hsn || ''), qtyF(it.qty) + ' ' + esc(it.unit || '')]; }), '') +
    (t.note ? '<div class="note">' + esc(t.note) + '</div>' : '') + '<div class="note">Not a sale. Goods moved between own godowns. Entered by <b>' + esc(t.by || '-') + '</b> on ' + tmStr(t.at) + (t.cancelled ? ' · Cancelled ' + dmy(t.cancelledAt) : '') + '</div></div>' +
    '<div class="row">' + btn('print', 'Print', {}, 'pri') + (t.cancelled ? '' : btn('cancelTr', 'Cancel transfer', { id: t.id }, 'warn')) + '</div>';
  return h;
}
function bindMore(A) {
  A.hmMore = function (d) { S.hmMore = S.hmMore || {}; S.hmMore[d.k] = !S.hmMore[d.k]; render(); };
  A.viewTr = function (d) { var t = trList(cur()).find(function (x) { return x.id === d.id; }); if (t) modal(trViewH(t)); };
  A.saveTransfer = function (fd) {
    if (!canWrite('inventory')) { toast('You cannot move stock.', true); return; }
    var C = cur(), a = fd.get('from'), b = fd.get('to'), date = fd.get('date') || today();
    if (a === b) { toast('Choose two different godowns.', true); return; }
    var want = {}, order = [];
    for (var i = 0; i < 6; i++) { var pid = fd.get('p' + i), q = parseFloat(fd.get('q' + i)) || 0; if (!pid && !q) continue; if (!pid || !(q > 0)) { toast('Line ' + (i + 1) + ': choose the item and a quantity above zero.', true); return; } if (!want[pid]) { want[pid] = 0; order.push(pid); } want[pid] += q; }
    if (!order.length) { toast('Add at least one item.', true); return; }
    var plan = [];
    for (var k = 0; k < order.length; k++) {
      var p = prodById(C, order[k]), need = want[order[k]], have = p.batch ? usableQty(C, p, a, '0000-00-00') : stockQty(C, p.id, a);
      if (need > have + 1e-9) { toast('Only ' + qtyF(have) + ' ' + p.unit + ' of ' + p.name + ' in ' + a + '.', true); return; }
      plan.push({ p: p, q: need });
    }
    var t = { id: uid(), no: trNo(C, date), date: date, from: a, to: b, vehicle: String(fd.get('vehicle') || '').trim().toUpperCase(), driver: String(fd.get('driver') || '').trim(), transporter: String(fd.get('transporter') || '').trim(), ewb: String(fd.get('ewb') || '').trim(), note: String(fd.get('note') || '').trim(), items: [], by: (user() || {}).name || '', at: new Date().toISOString() };
    plan.forEach(function (x) {
      var p = x.p; t.items.push({ pid: p.id, name: p.name, hsn: p.hsn, unit: p.unit, qty: x.q });
      var parts = p.batch ? allocBatches(C, p, a, x.q, '0000-00-00') : [{ q: x.q, b: '', e: '' }];
      parts.forEach(function (y) {
        addMove(C, { date: date, pid: p.id, wh: a, qty: -y.q, cost: p.cost, type: 'transfer', ref: t.id, note: t.no + ' to ' + b, batch: y.b, exp: y.e });
        addMove(C, { date: date, pid: p.id, wh: b, qty: y.q, cost: p.cost, type: 'transfer', ref: t.id, note: t.no + ' from ' + a, batch: y.b, exp: y.e });
      });
    });
    trList(C).push(t); log('Godown transfer ' + a + ' to ' + b + (t.vehicle ? ' vehicle ' + t.vehicle : ''), t.no);
    S.tab.inventory = 'transfers'; afterChange(); modal(trViewH(t)); toast('Transfer saved.');
  };
  A.cancelTr = function (d) { modal('<div class="mh"><h2>Cancel transfer?</h2></div><div class="note">Stock goes back to the first godown.</div><div class="row">' + btn('doCancelTr', 'Yes, cancel it', { id: d.id }, 'warn') + btn('closeModal', 'Keep it', {}, 'line') + '</div>'); };
  A.doCancelTr = function (d) {
    var C = cur(), t = trList(C).find(function (x) { return x.id === d.id; }); if (!t || t.cancelled) { closeModal(); return; }
    C.d.moves.filter(function (m) { return m.ref === t.id && m.type === 'transfer'; }).forEach(function (m) { addMove(C, { date: today(), pid: m.pid, wh: m.wh, qty: -m.qty, cost: m.cost, type: 'transfer', ref: t.id, note: 'Reversal of ' + t.no, batch: m.batch, exp: m.exp }); });
    t.cancelled = true; t.cancelledAt = today(); log('Cancelled godown transfer', t.no); closeModal(); toast('Cancelled.'); afterChange();
  };
}

function mvAct(C, m) {
  if (!m.ref) return null;
  if (docById(C, m.ref)) return ['view', m.ref];
  if (trList(C).some(function (t) { return t.id === m.ref; })) return ['viewTr', m.ref];
  return null;
}

/* ---------- recycle bin view ---------- */
function vBin() {
  var C = cur();
  var h = top('Recycle Bin', 'Everything deleted or cancelled is kept here', '') + '<div class="card"><h2>Deleted items</h2>' + binTab(['expense', 'journal', 'party', 'product']) + '</div>';
  var canc = C.d.docs.filter(function (d) { return d.cancelled; }).map(function (d) { return { k: 'doc', id: d.id, no: d.no, t: DT[d.type].label, date: d.date, who: partyName(C, d.partyId), amt: DT[d.type].items ? d.total : null, on: d.cancelledAt || '' }; })
    .concat(C.d.payments.filter(function (p) { return p.cancelled; }).map(function (p) { return { k: 'pay', id: p.id, no: p.no, t: p.type === 'receipt' ? 'Receipt' : 'Payment', date: p.date, who: partyName(C, p.partyId), amt: p.amount, on: '' }; }))
    .concat(trList(C).filter(function (t) { return t.cancelled; }).map(function (t) { return { k: 'tr', id: t.id, no: t.no, t: 'Godown transfer', date: t.date, who: t.from + ' to ' + t.to, amt: null, on: t.cancelledAt || '' }; }))
    .sort(function (a, b) { return (b.date + b.no).localeCompare(a.date + a.no); });
  h += '<div class="card"><h2>Cancelled bills, receipts and transfers</h2><div class="note">These stay on record for audit. Click a row to open it.</div>' + table([['Type'], ['No'], ['Date'], ['Party / details'], ['Amount', 'r']], canc.map(function (x) { return [esc(x.t), '<b>' + esc(x.no) + '</b>', dmy(x.date), esc(x.who), x.amt === null ? '-' : money(x.amt)]; }), 'Nothing cancelled.', null, canc.map(function (x) { return [x.k === 'doc' ? 'view' : x.k === 'pay' ? 'viewPay' : 'viewTr', x.id]; })) + '</div>';
  return h;
}

/* ---------- audit log + day book downloads ---------- */
function auditModel() {
  var C = cur();
  return { title: 'Audit Log', sub: C.name + ' · ' + C.d.audit.length + ' entries · Generated ' + nowStamp(), tables: [{ name: '', head: ['Date and time', 'User', 'Action', 'Reference'], right: [false, false, false, false], rows: C.d.audit.map(function (a) { return [tmStr(a.ts), a.user, a.act, a.ref]; }), foot: null }] };
}
function dbDocLines(C, x) { return (x.items || []).map(function (i) { return i.name + ' x ' + qtyF(i.qty); }).join(', '); }
function dayBookData(C, dt) {
  var rows = dayBookRows(C, dt), live = rows.filter(function (r) { return !r.cancelled; });
  function sm(k) { return sumBy(live.filter(function (r) { return r.k === k; }), function (r) { return r.amt; }); }
  return { dt: dt, rows: rows, sales: sm('invoice') - sm('creditnote'), purch: sm('pinvoice') - sm('preturn'), recv: sm('receipt') + sm('income'), paid: sm('payment') + sm('expense') };
}
function dayBookModel(dt) {
  var C = cur(), D = dayBookData(C, dt), n = function (v) { return v / 100; };
  var modes = {}; C.d.payments.forEach(function (p) { if (p.date === dt && !p.cancelled) { var k = (p.type === 'receipt' ? 'Received ' : 'Paid ') + (p.mode || 'Cash'); modes[k] = (modes[k] || 0) + p.amount; } });
  C.d.expenses.forEach(function (e) { if (e.date === dt) { var k = (e.kind === 'income' ? 'Received ' : 'Paid ') + (e.mode || 'Cash'); modes[k] = (modes[k] || 0) + e.amount; } });
  var entries = [], lines = [];
  C.d.docs.forEach(function (x) { if (x.date !== dt || !DOCL_DB[x.type]) return; entries.push([DOCL_DB[x.type], x.no, x.at ? tmStr(x.at).slice(11) : '', partyName(C, x.partyId), dbDocLines(C, x), n(x.sub || 0), n((x.cgst || 0) + (x.sgst || 0) + (x.igst || 0)), n(x.discAmt || 0), n(x.total || 0), x.cancelled ? 'Cancelled' : statusOf(C, x), x.by || '']); (x.items || []).forEach(function (i) { lines.push([x.no, i.name, i.hsn || '', qtyF(i.qty) + ' ' + (i.unit || ''), n(i.rate), +i.disc || 0, n(i.taxable || 0)]); }); });
  C.d.payments.forEach(function (p) { if (p.date !== dt) return; var inv = p.refId ? docById(C, p.refId) : null; entries.push([payLabel(p), p.no, p.at ? tmStr(p.at).slice(11) : '', partyName(C, p.partyId), (p.mode || '') + (inv ? ' against ' + inv.no : ' on account') + (p.disc ? ' (discount ' + (p.disc / 100).toFixed(2) + ')' : ''), '', '', n(p.disc || 0), n(p.amount), p.cancelled ? 'Cancelled' : 'Done', p.by || '']); });
  C.d.expenses.forEach(function (e) { if (e.date !== dt) return; entries.push([e.kind === 'income' ? 'Income' : 'Expense', '-', '', e.cat, (e.mode || '') + (e.note ? ' ' + e.note : ''), '', '', '', n(e.amount), 'Done', e.by || '']); });
  var cash = cashBank(C);
  return { title: 'Day Book ' + dmy(dt), sub: C.name + ' · Generated ' + nowStamp(), tables: [
    { name: 'Summary', head: ['Particulars', 'Amount'], right: [false, true], rows: [['Sales (less returns)', n(D.sales)], ['Purchases (less returns)', n(D.purch)], ['Money received', n(D.recv)], ['Money paid', n(D.paid)], ['Net cash movement', n(D.recv - D.paid)], ['Cash in hand now', n(cash.cash)], ['Bank now', n(cash.bank)]], foot: null },
    { name: 'By payment mode', head: ['Mode', 'Amount'], right: [false, true], rows: Object.keys(modes).sort().map(function (k) { return [k, n(modes[k])]; }), foot: null },
    { name: 'All entries', head: ['Type', 'No', 'Time', 'Party / category', 'Details', 'Taxable', 'Tax', 'Discount', 'Amount', 'Status', 'By'], right: [false, false, false, false, false, true, true, true, true, false, false], rows: entries, foot: null },
    { name: 'Item lines', head: ['Bill', 'Item', 'HSN', 'Qty', 'Rate', 'Disc %', 'Taxable'], right: [false, false, false, false, true, true, true], rows: lines, foot: null }
  ].filter(function (t) { return t.rows.length; }) };
}
var DOCL_DB = { invoice: 'Sales', pinvoice: 'Purchase', creditnote: 'Sales return', debitnote: 'Debit note', preturn: 'Purchase return' };
function pdfBars(doc, x, y, w, h, labels, series, colors, title) {
  var max = 1; series.forEach(function (s) { s.forEach(function (v) { if (v > max) max = v; }); });
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(21); doc.text(title, x, y - 14);
  doc.setDrawColor(210, 208, 200); doc.line(x, y + h, x + w, y + h);
  var gw = w / labels.length, bw = Math.min(26, (gw - 10) / series.length);
  labels.forEach(function (lb, i) {
    series.forEach(function (s, j) {
      var bh = Math.max(0.5, h * s[i] / max), bx = x + i * gw + (gw - bw * series.length) / 2 + j * bw, c = colors[j];
      doc.setFillColor(c[0], c[1], c[2]); doc.rect(bx, y + h - bh, bw - 1.5, bh, 'F');
      if (s[i] > 0) { doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(60); doc.text(pdfTxt(s[i]).replace(/\.00$/, ''), bx + (bw - 1.5) / 2, y + h - bh - 2, { align: 'center' }); }
    });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(90); doc.text(lb, x + i * gw + gw / 2, y + h + 10, { align: 'center' });
  });
}
async function dayBookPdf(dt) {
  await needPdf();
  var C = cur(), D = dayBookData(C, dt), m = dayBookModel(dt), J = window.jspdf.jsPDF;
  var doc = new J({ orientation: 'landscape', unit: 'pt', format: 'a4' }), W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight(), M = 36;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.setTextColor(21); doc.text(pdfTxt(m.title), M, 40);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(110); doc.text(pdfTxt(m.sub), M, 55);
  var kp = [['Sales', D.sales], ['Purchases', D.purch], ['Money received', D.recv], ['Money paid', D.paid]], kw = (W - 2 * M - 30) / 4;
  kp.forEach(function (k, i) { var x = M + i * (kw + 10); doc.setDrawColor(210, 208, 200); doc.setFillColor(250, 249, 246); doc.rect(x, 66, kw, 44, 'FD'); doc.setFontSize(8); doc.setTextColor(110); doc.text(k[0].toUpperCase(), x + 8, 80); doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.setTextColor(21); doc.text(pdfTxt(k[1] / 100), x + 8, 100); doc.setFont('helvetica', 'normal'); });
  var BL = [[21, 21, 21], [242, 140, 58], [120, 120, 115], [190, 190, 185]];
  pdfBars(doc, M, 165, 250, 78, ['Sales', 'Purch', 'Recd', 'Paid'], [[Math.max(0, D.sales / 100), Math.max(0, D.purch / 100), Math.max(0, D.recv / 100), Math.max(0, D.paid / 100)]], [[242, 140, 58]], 'Today at a glance (Rs)');
  var days = [], sa = [], rc = []; for (var i = 6; i >= 0; i--) { var d2 = addDays(dt, -i), q = dayBookData(C, d2); days.push(d2.slice(8) + '/' + d2.slice(5, 7)); sa.push(Math.max(0, q.sales / 100)); rc.push(Math.max(0, q.recv / 100)); }
  pdfBars(doc, M + 290, 165, 330, 78, days, [sa, rc], [[21, 21, 21], [242, 140, 58]], 'Last 7 days, Rs (black = sales, orange = received)');
  var modes = m.tables.find(function (t) { return t.name === 'By payment mode'; });
  if (modes) { var yy = 158; doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(21); doc.text('By payment mode (Rs)', W - M - 150, 151); var mx = Math.max.apply(null, modes.rows.map(function (r) { return r[1]; }).concat([1])); modes.rows.slice(0, 6).forEach(function (r) { doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(70); doc.text(pdfTxt(r[0]), W - M - 150, yy + 8); doc.setFillColor(242, 140, 58); doc.rect(W - M - 150, yy + 11, Math.max(1, 120 * r[1] / mx), 6, 'F'); doc.text(pdfTxt(r[1]), W - M - 150 + 124, yy + 17); yy += 22; }); }
  var y = 290;
  m.tables.filter(function (t) { return t.name !== 'By payment mode'; }).forEach(function (t) {
    if (y > H - 100) { doc.addPage(); y = 40; }
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(21); doc.text(pdfTxt(t.name), M, y); y += 6;
    var cs = {}; t.right.forEach(function (r, i) { if (r) cs[i] = { halign: 'right' }; });
    doc.autoTable({ startY: y, head: [t.head.map(pdfTxt)], body: t.rows.map(function (r) { return r.map(pdfTxt); }), theme: 'grid', margin: { left: M, right: M }, styles: { fontSize: 7.5, cellPadding: 3, lineColor: [210, 208, 200], lineWidth: 0.4, textColor: [21, 21, 21] }, headStyles: { fillColor: [21, 21, 21], textColor: 255 }, columnStyles: cs });
    y = doc.lastAutoTable.finalY + 20;
  });
  var np = doc.internal.getNumberOfPages(); for (var p = 1; p <= np; p++) { doc.setPage(p); doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(120); doc.text(pdfTxt(C.name) + ' · Printed ' + pdfTxt(nowStamp()), M, H - 18); doc.text('Page ' + p + ' of ' + np, W - M, H - 18, { align: 'right' }); }
  return doc.output('arraybuffer');
}
function bindMore2(A) {
  A.dlDayBook = async function (d) {
    var dt = S.dbDate || today(), fmt = d.fmt;
    try {
      toast('Preparing ' + fmt.toUpperCase() + '...');
      var data = fmt === 'pdf' ? await dayBookPdf(dt) : fmt === 'xlsx' ? await xlsxModel(dayBookModel(dt)) : csvModel(dayBookModel(dt));
      await saveFile('day-book-' + dt + '.' + fmt, data);
    } catch (e) { toast('Could not prepare the file.', true); if (window.console) console.error(e); }
  };
  A.dlAudit = async function (d) {
    try { var m = auditModel(); toast('Preparing ' + d.fmt.toUpperCase() + '...'); var data = d.fmt === 'pdf' ? await pdfModel(m) : d.fmt === 'xlsx' ? await xlsxModel(m) : csvModel(m); await saveFile(fname('audit-log-' + cur().name, d.fmt), data); }
    catch (e) { toast('Could not prepare the file.', true); if (window.console) console.error(e); }
  };
}

/* ---------- automatic backup to Google Drive folder (Windows app) ---------- */
function deskBak() { return window.billdnaDesktop && window.billdnaDesktop.backup ? window.billdnaDesktop.backup : null; }
function abState() { DB.autoBak = DB.autoBak || { dir: '', last: '', lastAt: '', on: true, msg: '' }; return DB.autoBak; }
async function autoBackupRun(force) {
  var api = deskBak(), ab; if (!api || !DB) return false; ab = abState();
  if (!ab.dir || (!force && (ab.on === false || ab.last === today()))) return false;
  if (S.abBusy) return false; S.abBusy = true;
  try {
    var files = DB.companies.map(function (C) { return { name: 'BillDNA-' + slug(C.name) + '-' + today() + '.json', data: backupJson(C) }; });
    var r = await api.save({ dir: ab.dir, files: files, keep: 30 });
    if (r && r.ok) { ab.last = today(); ab.lastAt = new Date().toISOString(); ab.msg = 'Saved ' + files.length + ' file(s)'; save(); toast('Daily backup saved to your Google Drive folder.'); if (S.view === 'settings') render(); return true; }
    ab.msg = 'Failed: ' + ((r && r.error) || 'folder not found'); save(); toast('Auto backup failed. Check the backup folder in Settings, Backup.', true); return false;
  } catch (e) { ab.msg = 'Failed'; return false; } finally { S.abBusy = false; }
}
function autoBackupStart() { if (!deskBak()) return; setTimeout(function () { autoBackupRun(false); }, 4000); if (!NOTIMERS) setInterval(function () { autoBackupRun(false); }, 600000); }
function abCardH() {
  var ab = abState(), api = deskBak();
  var steps = '<ol class="note" style="margin:8px 0 0 18px;line-height:1.7"><li>Install <b>Google Drive for desktop</b> on this computer: search "Google Drive for desktop" and download it from Google, then sign in with your Gmail.</li><li>Open File Explorer. A new drive named <b>Google Drive</b> (letter G:) appears with a folder <b>My Drive</b>.</li><li>Inside My Drive make a new folder named <b>BillDNA Backup</b>.</li><li>Come back here, press <b>Choose Google Drive folder</b> and select that BillDNA Backup folder.</li><li>Done. Every day, the first time you open Bill DNA in the morning, a backup file is saved there and Google Drive uploads it by itself. The last 30 days are kept.</li></ol>';
  var h = '<div class="card" style="background:var(--bg)"><h2>Automatic Google Drive backup</h2>';
  if (!api) return h + '<div class="note">Daily automatic backup works in the Bill DNA Windows app. In the browser, use Download backup file below and save it to Google Drive.</div>' + steps + '</div>';
  h += '<div class="' + (ab.dir ? 'hint' : 'note') + '">' + (ab.dir ? '<b>Backup folder:</b> ' + esc(ab.dir) + '<br>' + (ab.last ? 'Last backup: ' + esc(tmStr(ab.lastAt)) + ' · ' + esc(ab.msg || '') : 'No backup taken yet.') : 'No folder chosen yet. Follow the steps below.') + '</div>';
  h += '<div class="row" style="margin:10px 0">' + btn('abPick', ab.dir ? 'Change folder' : 'Choose Google Drive folder', {}, 'pri') + (ab.dir ? btn('abNow', 'Back up now', {}, 'line') + btn('abToggle', ab.on === false ? 'Turn daily backup on' : 'Turn daily backup off', {}, 'line') : '') + '</div>';
  return h + '<b>How to set up</b>' + steps + '</div>';
}
function bindBackup(A) {
  A.abPick = async function () {
    if (!ownerOnly()) return; var api = deskBak(); if (!api) return;
    var r = await api.pick(); if (!r || !r.dir) return;
    var ab = abState(); ab.dir = r.dir; ab.on = true; ab.last = ''; save(); log('Backup folder set', r.dir);
    var ok = await autoBackupRun(true); if (!ok) render();
  };
  A.abNow = async function () { if (!ownerOnly()) return; var ok = await autoBackupRun(true); if (!ok) render(); };
  A.abToggle = function () { if (!ownerOnly()) return; var ab = abState(); ab.on = ab.on === false; save(); toast(ab.on ? 'Daily backup is on.' : 'Daily backup is off.'); render(); };
}

/* ---------- payment at billing: received now, advance adjustment, settlement discount ---------- */
function payState(C, d) {
  if (!d.pay) {
    var pt = d.type === 'pinvoice' ? 'payment' : 'receipt', av = d.partyId ? advAvail(C, d.partyId, pt) : 0;
    d.pay = { amt: '', mode: 'Cash', disc: '', adv: av > 0 && !unpaidDocs(C, d.partyId, pt).length, party: d.partyId };
  }
  if (d.pay.party !== d.partyId) { var pt2 = d.type === 'pinvoice' ? 'payment' : 'receipt'; d.pay.party = d.partyId; d.pay.adv = !!d.partyId && advAvail(C, d.partyId, pt2) > 0 && !unpaidDocs(C, d.partyId, pt2).length; }
  return d.pay;
}
function payPlan(C, d) {
  var ps = payState(C, d), pt = d.type === 'pinvoice' ? 'payment' : 'receipt', av = d.partyId ? advAvail(C, d.partyId, pt) : 0;
  var adv = ps.adv ? Math.min(av, d.total || 0) : 0, disc = P(ps.disc), amt = P(ps.amt);
  return { av: av, adv: adv, disc: disc, amt: amt, mode: ps.mode, bal: (d.total || 0) - adv - disc - amt };
}
function paySumH(C, d) {
  var pl = payPlan(C, d), pur = d.type === 'pinvoice';
  var h = '<div class="tot" style="margin:0;width:100%"><div><span>Bill total</span><span class="num">' + money(d.total || 0) + '</span></div>';
  if (pl.adv) h += '<div><span>Advance adjusted</span><span class="num">-' + money(pl.adv) + '</span></div>';
  if (pl.disc) h += '<div><span>' + (pur ? 'Discount received' : 'Settlement discount') + '</span><span class="num">-' + money(pl.disc) + '</span></div>';
  if (pl.amt) h += '<div><span>' + (pur ? 'Paid now' : 'Received now') + '</span><span class="num">-' + money(pl.amt) + '</span></div>';
  h += '<div class="g"><span>' + (pl.bal < 0 ? 'More than the bill' : 'Balance due') + '</span><span class="num' + (pl.bal < 0 ? ' warn-t' : '') + '">' + money(Math.abs(pl.bal)) + '</span></div></div>';
  return h;
}
function payBoxH(C, d) {
  var ps = payState(C, d), pl = payPlan(C, d), pur = d.type === 'pinvoice';
  var h = '<div class="card paybox" id="paybox" style="background:var(--bg)"><h2>' + (pur ? 'Payment to supplier' : 'Payment') + '</h2>';
  if (pl.av > 0) { var ub = unpaidDocs(C, d.partyId, pur ? 'payment' : 'receipt'); h += '<label class="ck" style="display:flex;gap:8px;align-items:center"><input type="checkbox" data-pf="adv"' + (ps.adv ? ' checked' : '') + '> Adjust ' + (pur ? 'advance paid' : 'advance received') + ' <b class="num">' + money(pl.av) + '</b></label>' + (ub.length ? '<div class="note warn-t">This party also has ' + ub.length + ' older unpaid bill(s). Tick only if this advance is for this bill.</div>' : ''); }
  h += '<div class="fg">' + field(pur ? 'Paid now (Rs)' : 'Received now (Rs)', '<input class="num" type="number" min="0" step="any" inputmode="decimal" data-pf="amt" value="' + esc(ps.amt) + '" placeholder="0 = credit bill">') +
    field('Payment mode', '<select data-pf="mode">' + opts(['Cash', 'UPI', 'Card', 'Bank'], ps.mode) + '</select>') +
    field(pur ? 'Discount received at payment (Rs)' : 'Settlement discount (Rs)', '<input class="num" type="number" min="0" step="any" inputmode="decimal" data-pf="disc" value="' + esc(ps.disc) + '" placeholder="0">') + '</div>';
  h += '<div class="row">' + btn('payFull', pur ? 'Paid in full' : 'Received in full', {}, 'sm line') + '</div>';
  h += '<div class="note">' + (pur ? 'Discount received is the amount the supplier reduced when you paid. ' : 'Settlement discount is the amount you reduce when the customer pays (for example round figure). ') + 'GST on the bill does not change.</div>';
  return h + '<div id="paysum">' + paySumH(C, d) + '</div></div>';
}
function payCheck(C, d) {
  var pl = payPlan(C, d);
  if (pl.amt < 0 || pl.disc < 0) return 'Amounts cannot be negative.';
  if (pl.bal < 0) return 'Received amount, discount and advance together are more than the bill total. Reduce them.';
  if ((pl.amt > 0 || pl.disc > 0) && !d.partyId) return 'Select the party first.';
  return '';
}
function paySettle(C, d, pl) {
  var pt = d.type === 'pinvoice' ? 'payment' : 'receipt', msg = [];
  if (pl.adv > 0) { var used = useAdvance(C, d, pl.adv); if (used) msg.push('advance ' + money(used) + ' adjusted'); }
  if (pl.amt > 0 || pl.disc > 0) { var e = addPayment(C, { type: pt, date: d.date || today(), partyId: d.partyId, amount: pl.amt, disc: pl.disc, mode: pl.mode, refId: d.id, note: pl.disc ? 'Settlement at billing' : '' }); if (e) toast(e, true); else msg.push((pt === 'receipt' ? 'received ' : 'paid ') + money(pl.amt) + (pl.disc ? ', discount ' + money(pl.disc) : '')); }
  return msg.join(', ');
}
function bindPay(A) {
  A.refundFull = function () { var C = cur(), d = S.draft; if (!d) return; calc(C, d); var rf = refundState(d); rf.amt = rs(d.total || 0); var i = $('[data-rf=amt]'); if (i) i.value = rf.amt; };
  A.ledgerWa = function (d) {
    var C = cur(), p = partyById(C, d.id); if (!p) return;
    if (!$('#modal table')) A.ledger(d);
    var m = modelFor('modal'), b = partyBalance(C, p);
    m.title = 'Statement ' + p.name;
    toast('Preparing statement...');
    pdfModel(m).then(function (buf) {
      var txt = C.name + ' - account statement for ' + p.name + '. ' + (b > 0 ? 'Balance due: ' + money(b) + '.' : b < 0 ? 'Advance with us: ' + money(-b) + '.' : 'No balance due. Thank you!');
      return shareFile(fname('Statement ' + p.name, 'pdf'), buf, txt, waPhone(p));
    }, function () { toast('Could not prepare the statement.', true); });
  }; A.payFull = function () { var C = cur(), d = S.draft; if (!d) return; calc(C, d); var ps = payState(C, d), pl = payPlan(C, d); ps.amt = rs(Math.max(0, (d.total || 0) - pl.adv - pl.disc)); var i = $('[data-pf=amt]'); if (i) i.value = ps.amt; var sm = $('#paysum'); if (sm) sm.innerHTML = paySumH(C, d); }; }
function payInput(t) {
  var k = t.dataset.pf, d = S.draft; if (!k || !d) return false;
  var ps = payState(cur(), d); ps[k] = t.type === 'checkbox' ? t.checked : t.value;
  var sm = $('#paysum'); if (sm) sm.innerHTML = paySumH(cur(), d); return true;
}
document.addEventListener('input', function (e) { if (e.target && e.target.dataset && e.target.dataset.pf) payInput(e.target); });
document.addEventListener('change', function (e) {
  var t = e.target; if (!t || !t.dataset) return;
  if (t.dataset.pf) { payInput(t); return; }
  if (t.dataset.f === 'partyId' && S.draft) setTimeout(function () { var pb = $('#paybox'), d = S.draft; if (pb && d) { calc(cur(), d); pb.outerHTML = payBoxH(cur(), d); } }, 0);
});

/* quick bill: advance and settlement discount */
function qbPlan(C) {
  var s = qbState(), d = qbCalc(C), av = s.partyId ? advAvail(C, s.partyId, 'receipt') : 0;
  var adv = s.adv && av > 0 ? Math.min(av, d.total) : 0, settle = Math.min(P(s.settle), Math.max(0, d.total - adv));
  return { d: d, av: av, adv: adv, settle: settle, due: d.total - adv - settle };
}

/* returns: give cash back to the customer (or take it back from the supplier) when saving the return */
function refundState(d) { if (!d.refund) d.refund = { amt: '', mode: 'Cash' }; return d.refund; }
function refundBoxH(C, d) {
  var rf = refundState(d), pur = d.type === 'preturn', p = partyById(C, d.partyId), bal = p ? partyBalance(C, p) : 0;
  var h = '<div class="card paybox" id="refbox" style="background:var(--bg)"><h2>' + (pur ? 'Money back from supplier' : 'Refund to customer') + '</h2>';
  h += '<div class="note">' + (pur ? 'If the supplier pays you back now, enter it. Otherwise this return reduces what you owe them.' : 'If you give money back now, enter it. Otherwise this return is kept as credit for the customer (adjusted in the next bill).') + (p ? ' Current balance: ' + money(bal) + (bal < 0 ? ' (advance)' : '') + '.' : '') + '</div>';
  h += '<div class="fg">' + field(pur ? 'Received back now (Rs)' : 'Refund now (Rs)', '<input class="num" type="number" min="0" step="any" inputmode="decimal" data-rf="amt" value="' + esc(rf.amt) + '" placeholder="0 = keep as credit">') + field('Mode', '<select data-rf="mode">' + opts(['Cash', 'UPI', 'Card', 'Bank'], rf.mode) + '</select>') + '</div>';
  return h + '<div class="row">' + btn('refundFull', pur ? 'Full amount received back' : 'Refund full amount', {}, 'sm line') + '</div></div>';
}
function refundCheck(C, d) { var a = P(refundState(d).amt); if (a < 0) return 'Refund cannot be negative.'; if (a > (d.total || 0)) return 'Refund is more than the return total ' + money(d.total || 0) + '.'; return ''; }
function refundDo(C, d, rf) {
  var a = P(rf.amt); if (!(a > 0)) return '';
  var pt = d.type === 'preturn' ? 'payment' : 'receipt';
  var e = addPayment(C, { type: pt, refund: true, date: d.date || today(), partyId: d.partyId, amount: -a, mode: rf.mode, note: (pt === 'receipt' ? 'Refund for ' : 'Money back for ') + d.no });
  return e ? (toast(e, true), '') : (pt === 'receipt' ? 'refunded ' : 'received back ') + money(a);
}
document.addEventListener('input', function (e) { var t = e.target; if (t && t.dataset && t.dataset.rf && S.draft) refundState(S.draft)[t.dataset.rf] = t.value; });
document.addEventListener('change', function (e) { var t = e.target; if (t && t.dataset && t.dataset.rf && S.draft) refundState(S.draft)[t.dataset.rf] = t.value; });

/* ---------- export: PDF, Excel, CSV ---------- */
var LIBS = {};
var LB = window.BILLDNA_LIBS || '';
var URL_PDF = LB ? LB + 'jspdf.umd.min.js' : 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
var URL_ATB = LB ? LB + 'jspdf.plugin.autotable.min.js' : 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js';
var URL_XLS = LB ? LB + 'xlsx.full.min.js' : 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
function loadScript(url) {
  if (!LIBS[url]) LIBS[url] = new Promise(function (res, rej) {
    var s = document.createElement('script'); s.src = url; s.onload = res;
    s.onerror = function () { delete LIBS[url]; rej(new Error('load')); };
    document.head.appendChild(s);
  });
  return LIBS[url];
}
function needPdf() {
  var ok = function () { return window.jspdf && window.jspdf.jsPDF && window.jspdf.jsPDF.API && window.jspdf.jsPDF.API.autoTable; };
  if (ok()) return Promise.resolve();
  return loadScript(URL_PDF).then(function () { return loadScript(URL_ATB); });
}
function needXls() { return window.XLSX ? Promise.resolve() : loadScript(URL_XLS); }
function expBtns(src) { return btn('doExport', 'PDF', { fmt: 'pdf', src: src }, 'sm pri') + btn('doExport', 'Excel', { fmt: 'xlsx', src: src }, 'sm') + btn('doExport', 'CSV', { fmt: 'csv', src: src }, 'sm') + btn('doShare', 'Share PDF', { fmt: 'pdf', src: src }, 'sm line') + btn('doShare', 'Share Excel', { fmt: 'xlsx', src: src }, 'sm line'); }
function expTopBtn() {
  return ['sales', 'purchases', 'inventory', 'accounting', 'gst', 'parties'].indexOf(S.view) >= 0 && !S.draft ? btn('exportView', 'Download', {}, 'line') : '';
}
function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'file'; }
function fname(title, ext) { return slug(title) + '-' + today() + '.' + ext; }
function browserSave(name, data) {
  var ty = /\.pdf$/.test(name) ? 'application/pdf' : /\.xlsx$/.test(name) ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : /\.json$/.test(name) ? 'application/json' : 'text/csv;charset=utf-8';
  var blob = new Blob([data], { type: ty });
  var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
  setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(a.href); }, 1500);
}
async function saveFile(name, data) {
  var dl = null;
  try { dl = window.claude && window.claude.use ? await window.claude.use('downloads') : null; } catch (e) { dl = null; }
  if (!dl) { try { browserSave(name, data); toast('Downloaded ' + name); } catch (e) { toast('Could not save the file on this device.', true); } return; }
  try { await dl.save({ filename: name, data: data }); toast('Saved ' + name); }
  catch (e) { if (e && e.code === 'declined') return; toast('Could not save the file (' + ((e && e.code) || 'error') + ').', true); }
}


/* share a file: phone share sheet when the device supports files (WhatsApp is in the list), otherwise save it and guide the user */
function fileMime(name) { return /\.pdf$/.test(name) ? 'application/pdf' : /\.xlsx$/.test(name) ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : /\.json$/.test(name) ? 'application/json' : 'text/csv'; }
var PENDING = null;
function toBytes(data) { return data instanceof Uint8Array ? data : new Uint8Array(data); }
function waLinkFor(phone, text) { return 'https://wa.me/' + (phone || '') + '?text=' + encodeURIComponent(text || ''); }
function deskModal(name, r, phone) {
  S.deskFile = r.path; S.deskPhone = phone || '';
  var h = '<div class="mh"><h2>Send on WhatsApp</h2>' + btn('closeModal', 'Close', {}, 'sm line') + '</div>';
  if (r.web && r.pasted) h += '<div class="hint"><b>PDF attached in the WhatsApp window.</b> ' + esc(name) + (r.sent ? ' was sent.' : ' is ready. Check the preview and press the green Send button.') + '</div>';
  else if (r.copied) h += '<div class="hint"><b>The PDF is copied.</b> ' + esc(name) + ' is ready to paste into WhatsApp.</div><ol class="steps"><li>' + (r.opened ? 'WhatsApp is opening' + (phone ? ' with the customer chat' : '. Choose the customer chat') + '.' : 'Press <b>Open WhatsApp</b> below' + (phone ? ' (the customer chat opens)' : '') + '.') + '</li><li>' + (r.pasted ? 'The PDF was pasted automatically as an attachment.' : 'Click the message box and press <b>Ctrl + V</b>. The PDF appears as an attachment.') + '</li><li>Press <b>Enter</b> to send.</li></ol>';
  else h += '<div class="hint">The PDF is saved. Your computer did not allow copying it, so attach it by hand.</div><ol class="steps"><li>Press <b>Open WhatsApp</b> below.</li><li>Click the clip icon, choose Document, and pick <b>' + esc(name) + '</b> (press Show file to find it).</li><li>Press Send.</li></ol>';
  h += '<div class="note">This box stays behind the WhatsApp window. Close WhatsApp to see it again. If you use both WhatsApp and WhatsApp Business, choose Open WhatsApp Web.</div>' + '<div class="row">' + btn('deskOpen', 'Open WhatsApp', { k: 'app' }, 'pri') + btn('deskOpen', 'Open WhatsApp Web', { k: 'web' }, 'line') + btn('deskCopy', 'Copy PDF again', {}, 'line') + btn('deskShow', 'Show file', {}, 'line') + '</div>';
  modal(h);
}
async function shareFile(name, data, text, phone) {
  var file = null, D = window.billdnaDesktop;
  try { file = new File([data], name, { type: fileMime(name) }); } catch (e) { file = null; }
  if (D && D.shareFile) {
    try { var r = await D.shareFile({ name: name, data: toBytes(data), phone: phone || '', noWeb: !(function () { try { return localStorage.getItem('bd_wa') === 'web'; } catch (e) { return false; } })() }); deskModal(name, r, phone); return; } catch (e) { if (window.console) console.error(e); }
  }
  try {
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: name, text: text || '' }); return; }
  } catch (e) {
    if (e && e.name === 'AbortError') return;
    if (e && e.name === 'NotAllowedError') {
      PENDING = { file: file, name: name, text: text || '' };
      modal('<div class="mh"><h2>Send on WhatsApp</h2>' + btn('closeModal', 'Close', {}, 'sm line') + '</div><div class="note">The file <b>' + esc(name) + '</b> is ready. Press the button to choose WhatsApp.</div><div class="row">' + btn('sharePending', 'Share now', {}, 'pri') + '</div>');
      return;
    }
  }
  await saveFile(name, data);
  modal('<div class="mh"><h2>Send the file on WhatsApp</h2>' + btn('closeModal', 'Close', {}, 'sm line') + '</div><div class="note">The file <b>' + esc(name) + '</b> is saved on this device. A web link cannot attach a file by itself, so do this:</div><ol class="steps"><li>Press Open WhatsApp below' + (phone ? ' (the chat opens with the customer)' : '') + '.</li><li>Click the clip or plus icon, choose Document, and pick <b>' + esc(name) + '</b> from your Downloads.</li><li>Press Send.</li></ol><div class="row"><a class="btn pri" target="_blank" rel="noopener" href="' + esc(waLinkFor(phone, text)) + '">Open WhatsApp</a>' + btn('closeModal', 'Done', {}, 'line') + '</div><div class="note">On a phone, this button opens the share sheet and sends the PDF directly.</div>');
}
function fmtNum(n) { return n; }
/* tables with full customer details for Excel, CSV and PDF */
function docsRichModel(list, pur, title) {
  var C = cur(), n = function (x) { return (x || 0) / 100; };
  var head = ['Document no', 'Date', pur ? 'Supplier' : 'Customer', 'GSTIN', 'State', 'Phone', 'Address', 'Taxable', 'CGST', 'SGST', 'IGST', 'Total', pur ? 'Paid' : 'Received', 'Balance', 'Status', 'Due date'];
  var right = head.map(function (h, i) { return i >= 7 && i <= 13; });
  var tot = [0, 0, 0, 0, 0, 0, 0];
  var rows = list.map(function (d) {
    var p = partyById(C, d.partyId) || {}, bal = (d.type === 'invoice' || d.type === 'pinvoice') && !d.cancelled ? outstanding(C, d) : null, rec = bal === null ? null : d.total - bal;
    if (!d.cancelled && DT[d.type].items) { tot[0] += d.sub || 0; tot[1] += d.cgst || 0; tot[2] += d.sgst || 0; tot[3] += d.igst || 0; tot[4] += d.total || 0; if (bal !== null) { tot[5] += rec; tot[6] += bal; } }
    return [d.no, dmy(d.date), p.name || '', p.gstin || '', p.state || '', p.phone || '', p.address || '', DT[d.type].items ? n(d.sub) : '', DT[d.type].items ? n(d.cgst) : '', DT[d.type].items ? n(d.sgst) : '', DT[d.type].items ? n(d.igst) : '', DT[d.type].items ? n(d.total) : '', rec === null ? '' : n(rec), bal === null ? '' : n(bal), statusOf(C, d), d.due ? dmy(d.due) : ''];
  });
  var foot = rows.length ? ['Total', '', '', '', '', '', ''].concat(tot.map(n)).concat(['', '']) : null;
  return { title: title, sub: C.name + ' · Generated ' + nowStamp(), tables: [{ name: '', head: head, right: right, rows: rows, foot: foot }] };
}
function paysRichModel(list, pur, title) {
  var C = cur(), n = function (x) { return (x || 0) / 100; }, total = 0;
  var head = ['Voucher no', 'Date', pur ? 'Supplier' : 'Customer', 'GSTIN', 'State', 'Phone', 'Mode', 'Against invoice', 'Amount', 'Status', 'Note'];
  var rows = list.map(function (p) { var pr = partyById(C, p.partyId) || {}, inv = p.refId ? docById(C, p.refId) : null; if (!p.cancelled) total += p.amount; return [p.no, dmy(p.date), pr.name || '', pr.gstin || '', pr.state || '', pr.phone || '', p.mode, inv ? inv.no : 'On account', n(p.amount), p.cancelled ? 'Cancelled' : (pur ? 'Paid' : 'Received'), p.note || '']; });
  return { title: title, sub: C.name + ' · Generated ' + nowStamp(), tables: [{ name: '', head: head, right: head.map(function (h, i) { return i === 8; }), rows: rows, foot: rows.length ? ['Total', '', '', '', '', '', '', '', n(total), '', ''] : null }] };
}
function richModel(src) {
  if (src !== 'main' || S.draft || !S.cur) return null;
  var C = cur(), v = S.view;
  if ((v === 'sales' || v === 'purchases') && S.cur.view === v) {
    var tab = S.cur.tab, pur = v === 'purchases';
    if (tab === 'receipt' || tab === 'payment') return paysRichModel(paysFor(tab), pur, (pur ? 'Supplier payments' : 'Receipts'));
    return docsRichModel(docsFor(tab), pur, DT[tab].label + ' list');
  }
  if (v === 'inventory' && S.cur.view === v && S.cur.tab === 'products') return prodsRichModel();
  if (v === 'inventory' && S.cur.view === v && S.cur.tab === 'batches') return batchRichModel();
  if (v === 'parties' && S.cur.view === v) return partiesRichModel(S.cur.tab);
  return null;
}

/* read the tables on screen */
function cellText(el) {
  var parts = []; el.childNodes.forEach(function (n) { var s = (n.textContent || '').replace(/\s+/g, ' ').trim(); if (s) parts.push(s); });
  return parts.join(' ');
}
function scrape(root) {
  var out = [];
  root.querySelectorAll('table').forEach(function (tb) {
    var ths = Array.prototype.slice.call(tb.querySelectorAll('thead th'));
    var keep = ths.map(function (th) { var h = th.textContent.trim(); return h !== '' && h !== 'Actions'; });
    var pick = function (arr) { return arr.filter(function (x, i) { return keep[i]; }); };
    var rowsOf = function (sel) { return Array.prototype.slice.call(tb.querySelectorAll(sel)).map(function (tr) { return pick(Array.prototype.slice.call(tr.children).map(cellText)); }); };
    var foot = rowsOf('tfoot tr')[0];
    var prev = tb.parentElement && tb.parentElement.previousElementSibling, name = prev && prev.tagName === 'H2' ? prev.textContent.trim() : '';
    out.push({ name: name, head: pick(ths.map(function (th) { return th.textContent.trim(); })), right: pick(ths.map(function (th) { return th.classList.contains('r'); })), rows: rowsOf('tbody tr'), foot: foot });
  });
  return out.filter(function (t) { return t.head.length; });
}
function modelFor(src) {
  var rich = richModel(src); if (rich) return rich;
  var C = cur(), root = src === 'modal' ? $('#modal') : $('#app main'), title, sub = C.name;
  if (src === 'modal') { var h = root.querySelector('h2'); title = h ? h.textContent.trim() : 'Statement'; sub += ' · Statement'; }
  else {
    var h1 = root.querySelector('h1'); title = h1 ? h1.textContent.trim() : 'Report';
    var on = root.querySelector('.tab.on, .flow .st.on'); if (on) title += ' - ' + on.textContent.replace(/\d+$/, '').trim();
    if (S.view === 'gst') sub += (S.tab.gst === 'gstr9' ? ' · Financial year ' + (S.tab.g9y || g9Years()[0]) + '-' + String(+(S.tab.g9y || g9Years()[0]) + 1).slice(2) : ' · ' + dmy(rng().from) + ' to ' + dmy(rng().to));
  }
  return { title: title, sub: sub + ' · Generated ' + nowStamp(), tables: scrape(root) };
}
function moneyNum(s) { var m = /^₹(-?[\d,]+\.\d{2})$/.exec(String(s)); return m ? parseFloat(m[1].replace(/,/g, '')) : null; }
function xlVal(v) { if (typeof v === 'number') return v; var n = moneyNum(v); return n === null ? v : n; }
function pdfTxt(v) { return typeof v === 'number' ? v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : String(v == null ? '' : v).replace(/₹/g, 'Rs. '); }

function csvModel(m) {
  var lines = [];
  m.tables.forEach(function (t, i) {
    if (i) lines.push('');
    if (t.name) lines.push(csvOf([t.name], []).split('\n')[0]);
    lines.push(csvOf(t.head, t.rows.concat(t.foot ? [t.foot] : []).map(function (r) { return r.map(function (v) { v = xlVal(v); return typeof v === 'string' && /^[=+\-@\t\r]/.test(v) ? "'" + v : v; }); })));
  });
  return '﻿' + lines.join('\n');
}
async function xlsxModel(m) {
  await needXls();
  var X = window.XLSX, wb = X.utils.book_new(), used = {};
  m.tables.forEach(function (t, i) {
    var aoa = [t.head].concat(t.rows).concat(t.foot ? [t.foot] : []).map(function (r) { return r.map(xlVal); });
    var ws = X.utils.aoa_to_sheet(aoa);
    var widths = t.head.map(function (h, c) { return { wch: Math.min(48, Math.max(String(h).length, 8, Math.max.apply(null, aoa.map(function (r) { return String(r[c] == null ? '' : r[c]).length; }))) + 2) }; });
    ws['!cols'] = widths;
    Object.keys(ws).forEach(function (k) { if (k[0] !== '!' && ws[k].t === 'n') ws[k].z = '#,##0.00'; });
    var nm = (t.name || (m.tables.length > 1 ? 'Table ' + (i + 1) : m.title)).replace(/[\\\/\?\*\[\]:]/g, ' ').slice(0, 28) || 'Sheet';
    var base = nm, n = 1; while (used[nm.toLowerCase()]) { n++; nm = base.slice(0, 26) + ' ' + n; } used[nm.toLowerCase()] = 1;
    X.utils.book_append_sheet(wb, ws, nm);
  });
  if (!m.tables.length) X.utils.book_append_sheet(wb, X.utils.aoa_to_sheet([['No data']]), 'Sheet1');
  return X.write(wb, { bookType: 'xlsx', type: 'array' });
}
async function pdfModel(m) {
  await needPdf();
  var J = window.jspdf.jsPDF, maxc = Math.max.apply(null, m.tables.map(function (t) { return t.head.length; }).concat([1]));
  var doc = new J({ orientation: maxc > 6 ? 'landscape' : 'portrait', unit: 'pt', format: 'a4' });
  var W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight(), M = 36, y = 74;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(15); doc.setTextColor(21); doc.text(pdfTxt(m.title), M, 42);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(110); doc.text(pdfTxt(m.sub), M, 58); doc.setTextColor(21);
  if (!m.tables.length) doc.text('Nothing to show.', M, y);
  m.tables.forEach(function (t) {
    if (t.name) { if (y > H - 90) { doc.addPage(); y = 40; } doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.text(pdfTxt(t.name), M, y + 10); y += 16; }
    var cs = {}; t.right.forEach(function (r, i) { if (r) cs[i] = { halign: 'right' }; });
    doc.autoTable({
      startY: y, head: [t.head.map(pdfTxt)], body: t.rows.map(function (r) { return r.map(pdfTxt); }), foot: t.foot ? [t.foot.map(pdfTxt)] : undefined,
      theme: 'grid', margin: { left: M, right: M }, styles: { fontSize: maxc > 12 ? 6 : maxc > 9 ? 7 : 8, cellPadding: maxc > 12 ? 3 : 4, lineColor: [210, 208, 200], lineWidth: 0.4, textColor: [21, 21, 21] },
      headStyles: { fillColor: [21, 21, 21], textColor: 255, fontStyle: 'bold' }, footStyles: { fillColor: [236, 234, 228], textColor: [21, 21, 21], fontStyle: 'bold' }, columnStyles: cs
    });
    y = doc.lastAutoTable.finalY + 22;
  });
  var n = doc.internal.getNumberOfPages();
  for (var i = 1; i <= n; i++) { doc.setPage(i); doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(120); doc.text(pdfTxt(cur().name), M, H - 18); doc.text('Page ' + i + ' of ' + n, W - M, H - 18, { align: 'right' }); }
  return doc.output('arraybuffer');
}
async function exportRun(fmt, src, share) {
  try {
    var m = modelFor(src);
    if (!m.tables.length) { toast('There is no table to download on this screen.', true); return; }
    toast('Preparing ' + (fmt === 'pdf' ? 'PDF' : fmt === 'xlsx' ? 'Excel' : 'CSV') + '...');
    var data = fmt === 'pdf' ? await pdfModel(m) : fmt === 'xlsx' ? await xlsxModel(m) : csvModel(m);
    if (share) await shareFile(fname(m.title, fmt), data, m.title + ' - ' + cur().name, ''); else await saveFile(fname(m.title, fmt), data);
  } catch (e) { toast('Could not prepare the file. Check your internet connection and try again.', true); if (window.console) console.error(e); }
}

/* single documents */
function docModel(d) {
  var C = cur(), t = DT[d.type], p = partyById(C, d.partyId) || {}, n = function (x) { return (x || 0) / 100; };
  var det = [[t.label + ' no', d.no], ['Date', dmy(d.date)], [t.side === 'p' ? 'Supplier' : 'Customer', p.name || ''], ['GSTIN', p.gstin || ''], ['State', p.state || ''], ['Phone', p.phone || ''], ['Address', p.address || ''], ['Status', statusOf(C, d)]];
  if (d.sno) det.push(['Supplier bill no', d.sno]);
  if (d.due) det.push(['Due date', dmy(d.due)]); if (d.valid) det.push(['Valid until', dmy(d.valid)]); if (d.delivery) det.push(['Delivery date', dmy(d.delivery)]);
  det.push(['Company', C.name], ['Company GSTIN', C.gstin || '']);
  var tabs = [{ name: 'Details', head: ['Field', 'Value'], rows: det }];
  if (t.items) {
    tabs.push({ name: 'Items', head: ['Item', 'HSN/SAC', 'Qty', 'Unit', 'Rate', 'Disc %', 'GST %', 'Taxable', 'Tax', 'Total'], rows: d.items.map(function (it) { return [it.name + mrpTag(it) + (batchTag(it) ? ' (' + batchTag(it) + ')' : ''), it.hsn || '', it.qty, it.unit || '', n(it.rate), it.disc || 0, it.gst, n(it.taxable), n(it.tax), n((it.taxable || 0) + (it.tax || 0))]; }) });
    var tot = (d.discAmt > 0 ? [['Bill discount (deducted)', n(d.discAmt)]] : []).concat([['Taxable value', n(d.sub)], ['CGST', n(d.cgst)], ['SGST', n(d.sgst)], ['IGST', n(d.igst)], ['Round off', n(d.round)], ['Total', n(d.total)]]);
    if (d.type === 'invoice') { tot.push(['Balance due', n(outstanding(C, d))]); }
    tabs.push({ name: 'Totals', head: ['Item', 'Amount'], rows: tot });
  }
  return { title: t.label + ' ' + d.no, sub: C.name, tables: tabs };
}
function inr(p) { return 'Rs. ' + ((p || 0) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
async function docPdf(d, copies) {
  await needPdf();
  var J = window.jspdf.jsPDF, doc = new J({ unit: 'pt', format: 'a4' }), W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight(), M = 36;
  var C = cur(), t = DT[d.type], p = partyById(C, d.partyId) || {};
  var sd = t.side === 's';
  var title = t.tax && sd && C.scheme === 'composition' ? 'BILL OF SUPPLY' : t.tax && sd && C.scheme === 'notax' ? 'CASH BILL' : t.label.toUpperCase();
  var reg = taxOn(C, t);
  var labels = copies && copies.length ? copies : [null];
  labels.forEach(function (label, ci) {
  if (ci > 0) doc.addPage();
  doc.setFillColor(21, 21, 21); doc.rect(0, 0, W, 84, 'F'); doc.setTextColor(255);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.text(pdfTxt(C.name), M, 34);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5);
  doc.text(doc.splitTextToSize([C.address, C.gstin ? 'GSTIN: ' + C.gstin : '', C.phone].filter(Boolean).join('  |  '), W / 2 - M), M, 50);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.text(title, W - M, 32, { align: 'right' });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.text(pdfTxt(d.no), W - M, 48, { align: 'right' }); doc.text('Date: ' + dmy(d.date), W - M, 62, { align: 'right' });
  if (label) { doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.text(pdfTxt(String(label).toUpperCase()), W - M, 76, { align: 'right' }); doc.setFont('helvetica', 'normal'); }
  doc.setTextColor(21);
  var y = 108;
  doc.setFontSize(8); doc.setTextColor(110); doc.text(t.side === 'p' ? 'SUPPLIER' : 'BILL TO', M, y); doc.text('DETAILS', W / 2 + 20, y);
  doc.setTextColor(21); doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.text(pdfTxt(p.name || '-'), M, y + 15);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
  var bl = doc.splitTextToSize([p.address, p.gstin ? 'GSTIN: ' + p.gstin : '', p.state, p.phone].filter(Boolean).join('\n'), W / 2 - M - 10); doc.text(bl, M, y + 29);
  var dl = ['Status: ' + statusOf(C, d)]; if (d.due) dl.push('Due: ' + dmy(d.due)); if (d.valid) dl.push('Valid until: ' + dmy(d.valid)); if (d.delivery) dl.push('Delivery: ' + dmy(d.delivery)); if (reg) dl.push(d.inter ? 'Supply: Other state (IGST)' : 'Supply: Same state (CGST + SGST)');
  doc.text(dl, W / 2 + 20, y + 15);
  y += 29 + Math.max(bl.length, dl.length) * 12 + 14;
  var sv = shipView(d); if (sv.length) { doc.setFontSize(8.5); sv.forEach(function (ln) { var sl = doc.splitTextToSize(pdfTxt(ln), W - 2 * M); doc.text(sl, M, y); y += sl.length * 11; }); y += 6; doc.setFontSize(9); }
  if (!t.items) {
    doc.setFontSize(10); doc.text(doc.splitTextToSize(pdfTxt(d.req || ''), W - 2 * M), M, y);
  } else {
    var head = ['#', 'Item', 'HSN/SAC', 'Qty', 'Rate', 'Disc %'].concat(reg ? ['GST %'] : []).concat(['Amount']);
    var body = d.items.map(function (it, i) { return [i + 1, pdfTxt(it.name + mrpTag(it) + (batchTag(it) ? '\n' + batchTag(it) : '')), it.hsn || '', qtyF(it.qty) + (it.unit ? ' ' + it.unit : ''), inr(it.rate), it.disc || 0].concat(reg ? [it.gst + '%'] : []).concat([inr(it.taxable)]); });
    var cs = { 0: { cellWidth: 24 }, 3: { halign: 'right' }, 4: { halign: 'right' }, 5: { halign: 'right' } }; cs[head.length - 1] = { halign: 'right' }; if (reg) cs[6] = { halign: 'right' };
    doc.autoTable({ startY: y, head: [head], body: body, theme: 'grid', margin: { left: M, right: M }, styles: { fontSize: 8.5, cellPadding: 5, lineColor: [210, 208, 200], lineWidth: 0.4, textColor: [21, 21, 21] }, headStyles: { fillColor: [21, 21, 21], textColor: 255 }, alternateRowStyles: { fillColor: [247, 246, 242] }, columnStyles: cs });
    y = doc.lastAutoTable.finalY + 16;
    if (y > H - 250) { doc.addPage(); y = 50; }
    var rows = (d.discAmt > 0 ? [['Bill discount (deducted)', '-' + inr(d.discAmt)]] : []).concat([['Taxable value', inr(d.sub)]]);
    if (reg) { if (d.inter) rows.push(['IGST', inr(d.igst)]); else { rows.push(['CGST', inr(d.cgst)]); rows.push(['SGST', inr(d.sgst)]); } }
    if (t.tax) rows.push(['Round off', inr(d.round)]);
    var tx = W - M - 200; doc.setFontSize(9.5);
    rows.forEach(function (r) { doc.text(r[0], tx, y); doc.text(r[1], W - M, y, { align: 'right' }); y += 15; });
    doc.setFillColor(21, 21, 21); doc.rect(tx - 8, y - 4, 208, 24, 'F'); doc.setTextColor(255); doc.setFont('helvetica', 'bold'); doc.setFontSize(10.5);
    doc.text('TOTAL', tx, y + 12); doc.text(inr(d.total), W - M - 4, y + 12, { align: 'right' }); doc.setTextColor(21); y += 38;
    if (d.type === 'invoice') {
      var bal = outstanding(C, d); doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
      doc.text(bal > 0 ? 'Balance due: ' + inr(bal) : 'PAID IN FULL', W - M, y - 8, { align: 'right' }); y += 10;
    }
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.text(doc.splitTextToSize(amtWords(d.total), W - 2 * M), M, y); y += 22;
    if (d.type === 'invoice' && C.bank && C.bank.acc) { doc.setFontSize(8.5); doc.text(doc.splitTextToSize('Bank: ' + [C.bank.name, 'A/c ' + C.bank.acc, 'IFSC ' + C.bank.ifsc, C.bank.upi ? 'UPI ' + C.bank.upi : ''].filter(Boolean).join('  |  '), W - 2 * M), M, y); y += 20; }
    if (d.type === 'invoice' && upiBal(C, d) && C.bank && upiOk(C.bank.upi)) { if (y + 90 > H - 70) { doc.addPage(); y = M; } pdfUpi(doc, C, d, M, y, 80); y += 90; }
    if (d.irn || (d.ewb && d.ewb.no)) { doc.setFontSize(8); var gl = (d.irn ? 'IRN: ' + d.irn + (d.ack ? '   Ack No: ' + d.ack : '') + (d.ackDt ? '   Ack Date: ' + dmy(d.ackDt) : '') : '') + (d.ewb && d.ewb.no ? (d.irn ? '\n' : '') + 'E-way bill: ' + d.ewb.no : ''); var gx = doc.splitTextToSize(gl, W - 2 * M); doc.text(gx, M, y); y += gx.length * 10 + 6; }
    if (pfOf(C).footer) d = Object.assign({}, d, { notes: (d.notes ? d.notes + '\n' : '') + pfOf(C).footer }); if (d.notes) { doc.setFontSize(8.5); var nl = doc.splitTextToSize('Notes: ' + pdfTxt(d.notes), W - 2 * M); doc.text(nl, M, y); y += nl.length * 11 + 6; }
  }
  doc.setFontSize(9); doc.setTextColor(110); doc.text('For ' + pdfTxt(C.name), W - M, H - 62, { align: 'right' }); doc.text(pdfTxt(pfOf(C).sig || 'Authorised signatory'), W - M, H - 36, { align: 'right' });
  doc.setFontSize(8); doc.text('Computer generated document. Printed ' + pdfTxt(nowStamp()), M, H - 24);
  });
  return doc.output('arraybuffer');
}
function payText(p) {
  var C = cur(), pr = partyById(C, p.partyId) || {}, isR = (p.type === 'receipt') === (p.amount >= 0), inv = p.refId ? docById(C, p.refId) : null;
  var L = ['*' + C.name + '*', (isRefund(p) ? payLabel(p) + ' ' : isR ? 'Receipt ' : 'Payment voucher ') + p.no, 'Date: ' + dmy(p.date), '', (isR ? 'Received from: ' : 'Paid to: ') + (pr.name || '-'), '*Amount: ' + money(Math.abs(p.amount)) + '*', 'Mode: ' + p.mode];
  if (inv) { L.push('Against: ' + inv.no); var b = outstanding(C, inv); L.push(b > 0 ? 'Balance due: ' + money(b) : 'Invoice fully paid'); }
  L.push('', isR ? 'Thank you.' : ''); return L.join('\n');
}
function receiptH(p) {
  var C = cur(), pr = partyById(C, p.partyId) || {}, isR = (p.type === 'receipt') === (p.amount >= 0), inv = p.refId ? docById(C, p.refId) : null;
  var ph = String(pr.phone || '').replace(/\D/g, ''); if (ph.length === 10) ph = '91' + ph;
  return '<div class="mh"><h2>' + (isRefund(p) ? payLabel(p) + ' ' : isR ? 'Receipt ' : 'Payment voucher ') + esc(p.no) + '</h2>' + btn('closeModal', 'Close', {}, 'sm line') + '</div><div class="pre">' +
    '<div class="hd"><div><b style="font-size:17px">' + esc(C.name) + '</b><div style="font-size:12px;opacity:.8">' + esc(C.address) + '</div></div><div style="text-align:right"><b>' + (isR ? 'RECEIPT' : 'PAYMENT VOUCHER') + '</b><div style="font-size:12px;opacity:.8">' + esc(p.no) + ' · ' + dmy(p.date) + '</div></div></div>' +
    '<div class="fg"><div><div class="note">' + (isR ? 'Received from' : 'Paid to') + '</div><b>' + esc(pr.name || '-') + '</b></div><div><div class="note">Mode</div><b>' + esc(p.mode) + '</b></div><div><div class="note">Against</div><b>' + (inv ? esc(inv.no) : 'On account') + '</b></div></div>' +
    '<div class="tot">' + (p.disc ? '<div><span>Discount given</span><span class="num">' + money(p.disc) + '</span></div>' : '') + '<div class="g"><span>Amount</span><span class="num">' + money(Math.abs(p.amount)) + '</span></div><div class="note">' + esc(amtWords(p.amount)) + '</div></div>' +
    (p.note ? '<div class="note">' + esc(p.note) + '</div>' : '') +
    '<div class="note">' + (p.by ? (isR ? 'Received' : 'Entered') + ' by <b>' + esc(p.by) + '</b>' + (p.at ? ' on ' + tmStr(p.at) : '') : '') + (p.editedBy ? ' · Edited by <b>' + esc(p.editedBy) + '</b>' : '') + (p.cancelled ? ' · Cancelled' : '') + '</div>' +
    '<div class="row">' + btn('payPdf', 'Download PDF', { id: p.id }, 'pri') + (isR ? btn('waPay', 'Send on WhatsApp (PDF)', { id: p.id }, '') : '') + btn('copyPay', 'Copy text', { id: p.id }, 'line') + (!p.cancelled && canAdmin(isR ? 'sales' : 'purchases') && canWrite(isR ? 'sales' : 'purchases', p.type) ? btn('editPay', 'Edit', { id: p.id }, 'line') + btn('cancelPay', 'Cancel', { id: p.id }, 'warn') : '') + '</div></div>';
}
async function payPdf(p) {
  await needPdf();
  var J = window.jspdf.jsPDF, doc = new J({ unit: 'pt', format: 'a5' }), W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight(), M = 32;
  var C = cur(), pr = partyById(C, p.partyId) || {}, isR = (p.type === 'receipt') === (p.amount >= 0), inv = p.refId ? docById(C, p.refId) : null;
  doc.setFillColor(21, 21, 21); doc.rect(0, 0, W, 70, 'F'); doc.setTextColor(255); doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.text(pdfTxt(C.name), M, 30);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.text(doc.splitTextToSize([C.address, C.phone].filter(Boolean).join('  |  '), W / 2 - M), M, 44);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.text(isR ? 'RECEIPT' : 'PAYMENT VOUCHER', W - M, 28, { align: 'right' }); doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.text(pdfTxt(p.no), W - M, 43, { align: 'right' }); doc.text('Date: ' + dmy(p.date), W - M, 56, { align: 'right' });
  doc.setTextColor(21); var y = 100; doc.setFontSize(9);
  [[isR ? 'Received from' : 'Paid to', pr.name || '-'], ['Payment mode', p.mode], ['Against', inv ? inv.no : 'On account']].forEach(function (r) { doc.setTextColor(110); doc.text(r[0], M, y); doc.setTextColor(21); doc.setFont('helvetica', 'bold'); doc.text(pdfTxt(r[1]), M + 100, y); doc.setFont('helvetica', 'normal'); y += 18; });
  if (inv) { var b = outstanding(C, inv); doc.setTextColor(110); doc.text('Invoice balance', M, y); doc.setTextColor(21); doc.text(b > 0 ? inr(b) : 'Fully paid', M + 100, y); y += 18; }
  y += 6; doc.setFillColor(21, 21, 21); doc.rect(M, y, W - 2 * M, 30, 'F'); doc.setTextColor(255); doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.text('AMOUNT', M + 10, y + 20); doc.text(inr(p.amount), W - M - 10, y + 20, { align: 'right' });
  doc.setTextColor(21); doc.setFont('helvetica', 'normal'); doc.setFontSize(9); y += 50; doc.text(doc.splitTextToSize(amtWords(p.amount), W - 2 * M), M, y);
  if (p.note) { y += 28; doc.setTextColor(110); doc.text(doc.splitTextToSize('Note: ' + pdfTxt(p.note), W - 2 * M), M, y); }
  doc.setTextColor(110); doc.text(pdfTxt(pfOf(C).sig || 'Authorised signatory'), W - M, H - 40, { align: 'right' }); doc.setFontSize(8); doc.text('Computer generated document. Printed ' + pdfTxt(nowStamp()), M, H - 24);
  return doc.output('arraybuffer');
}
function payModel(p) {
  var C = cur(), pr = partyById(C, p.partyId) || {}, inv = p.refId ? docById(C, p.refId) : null;
  return { title: payLabel(p) + ' ' + p.no, sub: C.name, tables: [{ name: 'Voucher', head: ['Field', 'Value'], rows: [['Number', p.no], ['Date', dmy(p.date)], [p.type === 'receipt' ? 'Received from' : 'Paid to', pr.name || ''], ['Mode', p.mode], ['Against', inv ? inv.no : 'On account'], ['Amount', p.amount / 100], ['Note', p.note || '']] }] };
}

/* ---------- auth and company screens ---------- */
var VERSION = '1.0.0';
function authH() {
  var m = S.mode, err = S.err ? '<div class="err" role="alert">' + esc(S.err) + '</div>' : '';
  var h = '<div class="auth"><div class="card"><div><h1>Bill DNA</h1><div class="note" style="margin-top:4px">Billing, stock and GST for your business</div></div>' + err;
  if (S.noStore) h += '<div class="err" role="alert">This browser is blocking storage, so your work cannot be saved. Turn off private mode or allow site data.</div>';
  if (S.recovered) h += '<div class="hint">Saved data on this device could not be read. A copy was kept aside. You can start fresh, then restore from a backup file in Settings.</div>';
  if (m === 'login') {
    h += '<form data-submit="login" style="display:flex;flex-direction:column;gap:12px">' + field('Email', '<input name="email" type="email" required autocomplete="username" autocapitalize="none">') + field('Password', '<input name="pass" type="password" required autocomplete="current-password">') + '<button class="btn pri" type="submit">Sign in</button></form>' +
      '<div class="row"><button type="button" class="btn sm line" data-act="mode" data-m="signup">Create account</button><button type="button" class="btn sm line" data-act="mode" data-m="reset">Forgot password</button></div>' +
      '<div class="demo"><div class="note">Want to look around first?</div>' + btn('demo', 'Try the demo with sample data', {}, 'line') + '</div>';
  } else if (m === 'signup') {
    h += '<form data-submit="signup" style="display:flex;flex-direction:column;gap:12px">' + (DB.users.length ? '' : '<div class="hint">Welcome. Create your account to start. Your data is saved on this device, so download a backup regularly.</div>') + field('Your name', '<input name="name" required autocomplete="name">') + field('Email', '<input name="email" type="email" required autocomplete="username" autocapitalize="none">') + field('Password (6 or more characters)', '<input name="pass" type="password" minlength="6" required autocomplete="new-password">') + '<button class="btn pri" type="submit">Create account</button></form><div class="row">' + (DB.users.length ? '<button type="button" class="btn sm line" data-act="mode" data-m="login">Back to sign in</button>' : '') + btn('demo', 'Try the demo with sample data', {}, 'sm line') + '</div>';
  } else {
    h += '<form data-submit="reset" style="display:flex;flex-direction:column;gap:12px"><div class="hint">Use the recovery code shown when you created your account. If you lost it, ask the owner to set a new password in Settings, Users.</div>' + field('Account email', '<input name="email" type="email" required autocomplete="username" autocapitalize="none">') + field('Recovery code', '<input name="code" required autocomplete="off" autocapitalize="characters" placeholder="XXXX-XXXX-XXXX">') + field('New password (6 or more characters)', '<input name="pass" type="password" minlength="6" required autocomplete="new-password">') + '<button class="btn pri" type="submit">Reset password</button></form><div><button type="button" class="btn sm line" data-act="mode" data-m="login">Back to sign in</button></div>';
  }
  return h + '<div class="note">Version ' + VERSION + ' · Data stays on this device</div></div></div>';
}
function companyPickH() {
  var u = user(), mine = DB.companies.filter(function (c) { return c.members.some(function (m) { return m.userId === u.id; }); });
  var h = '<div class="auth"><div class="card" style="width:min(560px,100%)"><div class="bar"><div><h1>Select company</h1><div class="note">Signed in as ' + esc(u.name) + '</div></div>' + btn('logout', 'Sign out', {}, 'sm line') + '</div>';
  h += mine.length ? mine.map(function (c) { var r = c.members.find(function (m) { return m.userId === u.id; }).role; return '<div class="co"><div><b>' + esc(c.name) + '</b><div class="note">' + esc(c.state) + ' · ' + esc(c.scheme === 'regular' ? 'Regular GST' : c.scheme === 'composition' ? 'Composition' : 'No tax') + ' · ' + esc(r) + '</div></div>' + btn('pickCompany', 'Open', { id: c.id }, 'pri') + '</div>'; }).join('') : '<div class="empty">No company yet. Create one below.</div>';
  h += '<form data-submit="createCompany" class="card" style="background:var(--bg)"><h2>Set up your business</h2><div class="fg">' + field('Company name', '<input name="name" required>', 'wide') + field('GSTIN (optional)', '<input name="gstin" maxlength="15">') + field('State', '<select name="state">' + opts(STATES, 'Tamil Nadu') + '</select>') +
    field('Type of business', '<select name="biz">' + opts(Object.keys(BIZ), 'retail', null, function (k) { return BIZ[k].label; }) + '</select>', 'wide') + field('Do you charge GST on bills?', '<select name="scheme"><option value="regular">Yes, I am GST registered</option><option value="composition">Composition scheme (Bill of Supply)</option><option value="notax">No, I do not charge GST</option></select>', 'wide') + field('How do you want to work?', '<select name="mode"><option value="simple">Simple: quick bills, items, customers, money (recommended)</option><option value="full">Full: quotation, order, challan, purchase order and more</option></select>', 'wide') + '</div><label class="ck"><input type="checkbox" name="sample"> Fill with sample data</label><div><button class="btn pri" type="submit">Create company</button></div></form></div></div>';
  return h;
}

/* ---------- shell ---------- */
var NAV = [['dashboard', 'Home'], ['quick', 'New Bill'], ['sales', 'Sales'], ['purchases', 'Purchases'], ['parties', 'Customers and Suppliers'], ['inventory', 'Items and Stock'], ['accounting', 'Money'], ['gst', 'Reports and GST'], ['crm', 'CRM and Insights'], ['settings', 'Settings'], ['bin', 'Recycle Bin']];
var NAV_GAP = { parties: 1, gst: 1, bin: 1 };
var V = { quick: vQuick, dashboard: vDashboard, sales: vSales, purchases: vPurchases, inventory: vInventory, accounting: vAccounting, gst: vGst, crm: vCrm, parties: vParties, settings: vSettings, bin: vBin };
function shellH() {
  var C = cur(), u = user();
  var nav = NAV.filter(function (n) { return canView(n[0]); });
  if (!canView(S.view)) S.view = 'dashboard';
  return '<div class="shell"><aside class="side"><div class="brand"><b>Bill DNA</b><span>' + esc(C.name) + ' · FY ' + fyLabel(today()) + '</span></div><nav class="nav" aria-label="Main">' +
    nav.map(function (n) { return '<button type="button" class="' + (n[0] === S.view ? 'on' : '') + (NAV_GAP[n[0]] ? ' gap' : '') + '" data-act="nav" data-v="' + n[0] + '"' + (n[0] === S.view ? ' aria-current="page"' : '') + '>' + esc(n[1]) + '</button>'; }).join('') +
    '</nav><div class="me"><b>' + esc(u.name) + '</b><span>Role: ' + esc(role()) + '</span><div class="row" style="margin-top:6px"><button type="button" class="btn sm" style="color:var(--side-ink);border-color:#4a4a45" data-act="switchCo">Switch company</button><button type="button" class="btn sm" style="color:var(--side-ink);border-color:#4a4a45" data-act="logout">Sign out</button></div></div></aside>' +
    '<main class="main">' + V[S.view]() + '</main>' + (canWrite('quick') && S.view !== 'quick' ? '<button type="button" class="fab" data-act="nav" data-v="quick">+ New Bill</button>' : '') + '</div>';
}
function render() {
  var y = window.scrollY, root = $('#app');
  try {
    if (!DB.session || !user()) root.innerHTML = authH();
    else if (!DB.session.companyId || !cur()) root.innerHTML = companyPickH();
    else root.innerHTML = shellH();
  } catch (e) {
    root.innerHTML = '<div class="auth"><div class="card"><h2>Something went wrong</h2><div class="err">' + esc(e && e.message) + '</div>' + btn('resetView', 'Back to dashboard', {}, 'pri') + '</div></div>';
    if (window.console) console.error(e);
  }
  window.scrollTo(0, S.top ? 0 : y); S.top = false;
  maybeDailyReport();
}
function afterChange() { save(); render(); }

/* ---------- actions ---------- */
var A = {};
A.mode = function (d) { S.mode = d.m; S.err = ''; render(); };
A.login = function (fd) {
  if (S.lockUntil && Date.now() < S.lockUntil) { S.err = 'Too many wrong attempts. Wait ' + Math.ceil((S.lockUntil - Date.now()) / 1000) + ' seconds and try again.'; render(); return; }
  var e = String(fd.get('email')).trim().toLowerCase(), p = String(fd.get('pass'));
  var u = DB.users.find(function (x) { return x.email.toLowerCase() === e; });
  if (!u || !checkPass(u, p)) {
    S.fails = (S.fails || 0) + 1; if (S.fails >= 5) { S.lockUntil = Date.now() + 30000; S.fails = 0; }
    S.err = 'Email or password is wrong. Check both, or use Forgot password.'; render(); return;
  }
  S.fails = 0; if (!u.salt) setPass(u, p);
  DB.session = { userId: u.id, companyId: null }; S.err = ''; S.top = true; afterChange();
};
A.demo = function () { seedDemo(); S.err = ''; S.view = 'dashboard'; S.tab = {}; S.top = true; log('Demo opened'); afterChange(); };
A.signup = function (fd) {
  var e = String(fd.get('email')).trim().toLowerCase(), name = String(fd.get('name')).trim(), pw = String(fd.get('pass'));
  if (!name) { S.err = 'Enter your name.'; render(); return; }
  if (pw.length < 6) { S.err = 'Password must be 6 or more characters.'; render(); return; }
  if (DB.users.some(function (x) { return x.email.toLowerCase() === e; })) { S.err = 'An account with this email already exists. Sign in instead.'; render(); return; }
  var u = { id: uid(), name: name, email: e }; setPass(u, pw); var code = newRecovery(u);
  DB.users.push(u); DB.session = { userId: u.id, companyId: null }; S.err = ''; S.mode = 'login'; afterChange();
  modal('<div class="mh"><h2>Save your recovery code</h2></div><div class="note">If you forget your password, this code is the only way to reset it. Write it down or save it in a safe place. It is shown only once.</div><div class="code">' + esc(code) + '</div><div class="row">' + btn('closeModal', 'I have saved it', {}, 'pri') + '</div>');
};
A.reset = function (fd) {
  var e = String(fd.get('email')).trim().toLowerCase(), u = DB.users.find(function (x) { return x.email.toLowerCase() === e; }), pw = String(fd.get('pass'));
  if (S.lockUntil && Date.now() < S.lockUntil) { S.err = 'Too many attempts. Wait a little and try again.'; render(); return; }
  if (!u || !checkRecovery(u, fd.get('code'))) { S.fails = (S.fails || 0) + 1; if (S.fails >= 5) { S.lockUntil = Date.now() + 30000; S.fails = 0; } S.err = 'Email and recovery code do not match.'; render(); return; }
  if (pw.length < 6) { S.err = 'Password must be 6 or more characters.'; render(); return; }
  setPass(u, pw); S.err = ''; S.mode = 'login'; save(); render(); toast('Password changed. Sign in with the new password.');
};
A.savePrefs = function (fd) {
  if (!ownerOnly()) return; var C = cur();
  C.pf = { dueDays: Math.min(365, Math.max(0, parseInt(fd.get('dueDays'), 10) || 0)), validDays: Math.min(365, Math.max(1, parseInt(fd.get('validDays'), 10) || 14)), idle: parseInt(fd.get('idle'), 10) || 0, sig: String(fd.get('sig') || '').trim().slice(0, 40) || 'Authorised signatory', terms: String(fd.get('terms') || '').trim().slice(0, 400), footer: String(fd.get('footer') || '').trim().slice(0, 120), stamp: !!fd.get('stamp'), lowHome: !!fd.get('lowHome') };
  log('Preferences saved'); toast('Preferences saved.'); afterChange();
};
A.logout = function () { DB.session = null; S.mode = 'login'; S.draft = null; afterChange(); };
A.switchCo = function () { DB.session.companyId = null; S.draft = null; afterChange(); };
A.pickCompany = function (d) { DB.session.companyId = d.id; S.view = 'dashboard'; S.tab = {}; S.draft = null; S.q = ''; S.top = true; afterChange(); };
A.createCompany = function (fd) {
  var gstin = String(fd.get('gstin')).trim().toUpperCase(), cname = String(fd.get('name')).trim();
  if (!cname) { toast('Enter the company name.', true); return; }
  var ge = gstinErr(gstin, fd.get('state')); if (ge) { toast(ge, true); return; }
  var C = newCompany(cname, { gstin: gstin, state: fd.get('state'), scheme: fd.get('scheme'), bizType: fd.get('biz'), mode: fd.get('mode') });
  C.members = [{ userId: DB.session.userId, role: 'owner' }];
  DB.companies.push(C);
  if (fd.get('sample')) seedSample(C);
  DB.session.companyId = C.id; S.view = 'dashboard'; S.tab = {}; S.top = true; log('Company created', C.name); afterChange();
};
A.resetView = function () { S.view = 'dashboard'; S.draft = null; render(); };
A.nav = function (d) { if (!canView(d.v)) return; S.force = null; S.flt = null; S.lim = {}; S.view = d.v; S.draft = null; S.q = ''; S.top = true; render(); };
A.goDoc = function (d) {
  if (!canView('sales')) return;
  S.force = d.t; S.flt = d.f; S.lim = {}; S.view = 'sales'; S.tab.sales = d.t; S.draft = null; S.q = ''; S.top = true; render();
};
A.sflt = function (d) { S.flt = d.f || null; S.lim = {}; render(); };
A.clrFlt = function () { S.flt = null; S.lim = {}; render(); };
A.dbDay = function (d) { var n = +d.n; S.dbDate = n === 0 ? today() : addDays(S.dbDate || today(), n); render(); };
A.tab = function (d) { S.flt = null; S.lim = {}; S.tab[S.view] = d.t; S.q = ''; S.draft = null; render(); };
A.subtab = function (d) { S.tab.gstr = d.t; render(); };
A.closeModal = function () { closeModal(); };
A.newDoc = function (d) { S.draft = newDraft(d.t); render(); };
A.newDocGo = function (d) { S.view = DT[d.t].side === 's' ? 'sales' : 'purchases'; S.tab[S.view] = d.t; S.draft = newDraft(d.t); S.top = true; render(); };
A.editDoc = function (d) { S.draft = JSON.parse(JSON.stringify(docById(cur(), d.id))); render(); };
A.cancelDraft = function () { S.draft = null; render(); };
A.addRow = function () { S.draft.items.push(blankItem()); render(); };
A.rmRow = function (d) { S.draft.items.splice(+d.i, 1); if (!S.draft.items.length) S.draft.items.push(blankItem()); render(); };
A.saveDoc = function () {
  var C = cur(), d = S.draft;
  calc(C, d);
  var err = validateDoc(C, d);
  if (err) { toast(err, true); return; }
  var old0 = d.id ? docById(C, d.id) : null, posted0 = !!(old0 && DT[old0.type].post && !old0.cancelled);
  if (posted0) { var pe = editPostedCheck(C, d, old0); if (pe) { toast(pe, true); return; } }
  var sh = posted0 ? [] : shortages(C, d);
  if (sh.length) {
    modal('<div class="mh"><h2>Stock is not enough</h2>' + btn('closeModal', 'Close', {}, 'sm line') + '</div><div class="note">Stock moves only from approved documents. Buy or produce the missing quantity, then save again.</div>' +
      table([['Item'], ['Needed', 'r'], ['Available', 'r'], ['Short', 'r']], sh.map(function (x) { return [esc(x.name), qtyF(x.need), qtyF(x.have), '<span class="warn-t">' + qtyF(x.need - x.have) + '</span>']; })) +
      '<div class="row">' + (canWrite('purchases', 'po') ? btn('poFromShort', 'Create purchase order for the shortage', {}, 'pri') : '') + btn('closeModal', 'Back to edit', {}, 'line') + '</div>');
    S.short = sh; return;
  }
  var wasNew = !d.id, pl = null;
  if (wasNew && (d.type === 'invoice' || d.type === 'pinvoice') && d.pay) { var pe = payCheck(C, d); if (pe) { toast(pe, true); return; } pl = payPlan(C, d); }
  var rfd = null; if (wasNew && (d.type === 'creditnote' || d.type === 'preturn') && d.refund) { var re = refundCheck(C, d); if (re) { toast(re, true); return; } rfd = d.refund; }
  delete d.pay; delete d.refund;
  commitDoc(C, d); S.draft = null; closeModal();
  var pm = pl ? paySettle(C, d, pl) : rfd ? refundDo(C, d, rfd) : '';
  toast(DT[d.type].label + ' ' + d.no + ' saved' + (pm ? ': ' + pm : '') + '.'); afterChange();
};
A.poFromShort = function () {
  var C = cur(), sh = S.short || []; closeModal();
  var dr = newDraft('po', { items: sh.map(function (x) { var p = prodById(C, x.pid); return { pid: p.id, name: p.name, hsn: p.hsn, unit: p.unit, qty: Math.ceil(x.need - x.have), rate: p.cost, disc: 0, gst: p.gst }; }) });
  S.view = 'purchases'; S.tab.purchases = 'po'; S.draft = dr; S.top = true; render(); toast('Choose the supplier and save the purchase order. Your sales draft was closed.');
};
A.poFromLow = function () {
  var C = cur(), low = lowItems(C);
  var dr = newDraft('po', { items: low.map(function (p) { return { pid: p.id, name: p.name, hsn: p.hsn, unit: p.unit, qty: Math.max(1, Math.ceil(p.min * 2 - stockQty(C, p.id))), rate: p.cost, disc: 0, gst: p.gst }; }) });
  S.view = 'purchases'; S.tab.purchases = 'po'; S.draft = dr; S.top = true; render();
};
A.view = function (d) { modal(docPreview(docById(cur(), d.id)), true); try { needPdf().catch(function () { }); } catch (e) { } };
A.convert = function (d) {
  var C = cur(), src = docById(C, d.id), to = d.to;
  var dr = newDraft(to, { partyId: src.partyId, refId: src.id, wh: src.wh || C.d.warehouses[0], notes: src.type === 'enquiry' ? (src.req || '') : (src.notes || '') });
  if (DT[to].items) {
    var items = JSON.parse(JSON.stringify(src.items || []));
    if (to === 'creditnote' || to === 'preturn') {
      var prev = {};
      C.d.docs.forEach(function (x) { if (x.refId === src.id && x.type === to && !x.cancelled) x.items.forEach(function (it) { prev[it.pid || it.name] = (prev[it.pid || it.name] || 0) + (+it.qty || 0); }); });
      items = items.map(function (it) { it.qty = Math.max(0, it.qty - (prev[it.pid || it.name] || 0)); return it; }).filter(function (it) { return it.qty > 0; });
      if (!items.length) { toast('Everything on this document is already returned.', true); return; }
    }
    if (to === 'debitnote') items = [{ pid: '', name: 'Additional charge', hsn: '', unit: '', qty: 1, rate: 0, disc: 0, gst: 18 }];
    dr.items = items.length ? items : [blankItem()];
  }
  S.view = DT[to].side === 's' ? 'sales' : 'purchases'; S.tab[S.view] = to; S.draft = dr; S.top = true; render();
  if (to === 'creditnote' || to === 'preturn') toast('Change the quantities for a partial return, then save.');
};
A.setStatus = function (d) { var x = docById(cur(), d.id); x.status = d.s; log('Marked ' + d.s, x.no); afterChange(); };
A.cancelDoc = function (d) {
  var x = docById(cur(), d.id);
  modal('<div class="mh"><h2>Cancel ' + esc(x.no) + '?</h2></div><div class="note">The document stays in the audit history. Stock and balances are reversed.</div><div class="row">' + btn('doCancel', 'Yes, cancel it', { id: d.id }, 'warn') + btn('closeModal', 'Keep it', {}, 'line') + '</div>');
};
A.doCancel = function (d) { var err = cancelDoc(cur(), d.id); closeModal(); if (err) toast(err, true); else toast('Cancelled.'); afterChange(); };
A.cancelPay = function (d) {
  var x = cur().d.payments.find(function (p) { return p.id === d.id; });
  modal('<div class="mh"><h2>Cancel ' + esc(x.no) + '?</h2></div><div class="note">The amount comes back onto the invoice balance.</div><div class="row">' + btn('doCancelPay', 'Yes, cancel it', { id: d.id }, 'warn') + btn('closeModal', 'Keep it', {}, 'line') + '</div>');
};
A.doCancelPay = function (d) { var x = cur().d.payments.find(function (p) { return p.id === d.id; }); x.cancelled = true; log('Cancelled ' + (x.type === 'receipt' ? 'receipt' : 'payment'), x.no); closeModal(); toast('Cancelled.'); afterChange(); };

function payInvOptions(type, partyId, sel) {
  var C = cur(), t = type === 'receipt' ? 'invoice' : 'pinvoice';
  var list = C.d.docs.filter(function (d) { return (d.type === t || (type === 'receipt' && d.type === 'debitnote')) && !d.cancelled && d.partyId === partyId && outstanding(C, d) > 0; });
  if (!sel && list.length === 1) sel = list[0].id;
  return (list.length > 1 && !sel ? '<option value="__auto" selected>Oldest unpaid bills first (auto)</option>' : '') + '<option value="">Advance / on account (not against a bill)</option>' + list.map(function (d) { return '<option value="' + d.id + '"' + (d.id === sel ? ' selected' : '') + '>' + esc(d.no) + ' · balance ' + esc(money(outstanding(C, d))) + '</option>'; }).join('');
}
A.newPay = function (d) {
  var C = cur(), type = d.type, ref = d.ref ? docById(C, d.ref) : null;
  var ps = C.d.parties.filter(function (p) { return p.type === (type === 'receipt' ? 'customer' : 'supplier'); });
  var pid = ref ? ref.partyId : d.party || (ps[0] && ps[0].id) || '';
  modal('<div class="mh"><h2>' + (type === 'receipt' ? 'Record receipt' : 'Record supplier payment') + '</h2>' + btn('closeModal', 'Close', {}, 'sm line') + '</div><form data-submit="savePay"><input type="hidden" name="type" value="' + type + '"><div class="fg">' +
    field(type === 'receipt' ? 'Customer' : 'Supplier', '<select name="party" data-chg="payParty" required>' + opts(ps, pid, function (p) { return p.id; }, function (p) { return p.name; }) + '</select>') +
    field('Against invoice', '<select name="ref" data-chg="payInv">' + payInvOptions(type, pid, ref ? ref.id : '') + '</select>') +
    field('Amount', '<input name="amt" type="number" min="0.01" step="any" required value="' + (ref ? rs(outstanding(C, ref)) : '') + '">') +
    field('Discount given (Rs, optional)', '<input name="disc" type="number" min="0" step="any" placeholder="0">') +
    field('Mode', '<select name="mode"><option>Cash</option><option>UPI</option><option>Bank</option><option>Card</option><option>Cheque</option></select>') + field('Date', '<input name="date" type="date" value="' + today() + '" required>') + field('Note', '<input name="note">') +
    '</div><div class="note" style="margin:8px 0">Partial payment keeps the balance outstanding. Full payment marks the invoice paid.</div><button class="btn pri" type="submit">Save</button></form>');
};
A.savePay = function (fd) {
  var C = cur(), type = fd.get('type');
  var auto = fd.get('ref') === '__auto';
  var err = addPayment(C, { type: type, partyId: fd.get('party'), amount: P(fd.get('amt')), disc: auto ? 0 : P(fd.get('disc')), mode: fd.get('mode'), date: fd.get('date'), refId: auto ? '' : fd.get('ref'), note: fd.get('note') });
  if (err) { toast(err, true); return; }
  if (auto) { var left = allocOldest(C, C.d.payments[C.d.payments.length - 1]); if (left > 0) toast('All bills settled. ' + money(left) + ' kept as advance.'); }
  closeModal(); afterChange(); modal(receiptH(C.d.payments[C.d.payments.length - 1])); toast((type === 'receipt' ? 'Receipt' : 'Payment') + ' saved.');
};
A.receive = function (d) {
  var C = cur(), po = docById(C, d.id);
  modal('<div class="mh"><h2>Receive goods for ' + esc(po.no) + '</h2>' + btn('closeModal', 'Close', {}, 'sm line') + '</div><div class="note">Check quantity and quality. Anything short or damaged is recorded, and only accepted goods go on the invoice.</div><form data-submit="doReceive"><input type="hidden" name="id" value="' + po.id + '">' +
    table([['Item'], ['Ordered', 'r'], ['Received', 'r'], ['Damaged', 'r']], po.items.map(function (it, i) { return [esc(it.name), qtyF(it.qty), '<input class="inp num" name="rc_' + i + '" type="number" min="0" step="any" value="' + it.qty + '" style="width:100px" aria-label="Received">', '<input class="inp num" name="dm_' + i + '" type="number" min="0" step="any" value="0" style="width:100px" aria-label="Damaged">']; })) +
    '<div style="margin-top:12px"><button class="btn pri" type="submit">Continue to purchase invoice</button></div></form>', true);
};
A.doReceive = function (fd) {
  var C = cur(), po = docById(C, fd.get('id')), items = [], sh = [];
  po.items.forEach(function (it, i) {
    var rc = parseFloat(fd.get('rc_' + i)) || 0, dm = parseFloat(fd.get('dm_' + i)) || 0, ok = Math.max(0, rc - dm), copy = JSON.parse(JSON.stringify(it));
    if (rc < it.qty || dm > 0) sh.push({ name: it.name, short: Math.max(0, it.qty - rc), dmg: dm });
    if (ok > 0) { copy.qty = ok; items.push(copy); }
  });
  if (!items.length) { toast('Nothing was accepted. Resolve this with the supplier first.', true); return; }
  closeModal();
  var dr = newDraft('pinvoice', { partyId: po.partyId, refId: po.id, items: items, shortage: sh, notes: sh.length ? 'Shortage or damage recorded on receipt. Resolve with supplier.' : '' });
  S.view = 'purchases'; S.tab.purchases = 'pinvoice'; S.draft = dr; S.top = true; render();
};
A.newParty = function (d) { modal(partyForm(null, d.side)); };
A.editParty = function (d) { modal(partyForm(partyById(cur(), d.id))); };
A.ledger = function (d) { modal(ledgerH(partyById(cur(), d.id)), true); };
function partyDups(C, o, selfId) {
  var ph = String(o.phone || '').replace(/\D/g, '').slice(-10), em = String(o.email || '').trim().toLowerCase(), gs = String(o.gstin || '').trim().toUpperCase(), out = [];
  C.d.parties.forEach(function (p) {
    if (p.id === selfId || p.type !== o.type) return;
    if (ph.length === 10 && String(p.phone || '').replace(/\D/g, '').slice(-10) === ph) out.push({ field: 'phone', label: 'Mobile number', val: ph, p: p });
    if (em && String(p.email || '').trim().toLowerCase() === em) out.push({ field: 'email', label: 'Email', val: em, p: p });
    if (gs && String(p.gstin || '').trim().toUpperCase() === gs) out.push({ field: 'gstin', label: 'GSTIN', val: gs, p: p });
  });
  var seen = {}; return out.filter(function (x) { var k = x.field + x.p.id; if (seen[k]) return false; seen[k] = 1; return true; });
}
A.saveParty = function (fd) {
  var C = cur(), g = String(fd.get('gstin')).trim().toUpperCase(), pname = String(fd.get('name')).trim();
  if (!pname) { toast('Enter the name.', true); return; }
  var ge = gstinErr(g, fd.get('state')); if (ge) { toast(ge, true); return; }
  var pin = String(fd.get('pin') || '').trim(); if (pin && !pinOk(pin)) { toast('PIN code has 6 digits.', true); return; }
  var dups = partyDups(C, { type: fd.get('type'), phone: fd.get('phone'), email: fd.get('email'), gstin: g }, fd.get('id'));
  if (dups.length) {
    toast(dups.map(function (x) { return x.label + ' ' + x.val + ' is already used by ' + x.p.name + ' (' + (x.p.type === 'supplier' ? 'Supplier' : 'Customer') + ').'; }).join(' ') + ' Correct it, or search that party and use it.', true);
    try { var fm = document.querySelector('#modal form'); var bad = fm && fm.elements[dups[0].field]; if (bad) { bad.focus(); dups.forEach(function (x) { var el = fm.elements[x.field]; if (el) { el.style.outline = '2px solid #b42318'; el.addEventListener('input', function () { el.style.outline = ''; }, { once: true }); } }); } } catch (e) { }
    return;
  }
  var o = { level: fd.get('level') === 'wholesale' ? 'wholesale' : '', disc: Math.min(100, Math.max(0, parseFloat(fd.get('disc')) || 0)), type: fd.get('type'), name: pname, gstin: g, state: fd.get('state'), phone: fd.get('phone'), email: fd.get('email'), address: fd.get('address'), city: String(fd.get('city') || '').trim(), pin: pin, opening: P(fd.get('opening')) };
  if (fd.get('id')) { Object.assign(partyById(C, fd.get('id')), o); log('Edited party', o.name); }
  else { var np = addParty(C, o); log('Added party', o.name); if (S.draft) S.draft.partyId = np.id; if (S.view === 'quick') qbState().partyId = np.id; }
  closeModal(); afterChange();
};
function prodForm(p, pre) {
  var C = cur(), bz = BIZ[C.bizType] || BIZ.other; p = p || { gst: bz.gst, unit: bz.unit, tracked: bz.tracked, min: 0, sale: 0, cost: 0 }; pre = pre || {};
  var cats = {}; C.d.products.forEach(function (x) { if (x.cat) cats[x.cat] = 1; });
  return '<div class="mh"><h2>' + (p.id ? 'Edit item' : 'New item') + '</h2>' + btn('closeModal', 'Close', {}, 'sm line') + '</div><form data-submit="saveProd"><input type="hidden" name="id" value="' + esc(p.id || '') + '"><label class="ck" style="margin:0 0 12px"><input type="checkbox" name="svc"' + (p.tracked === false ? ' checked' : '') + '> This is a service (no stock)</label><div class="fg">' +
    field('Name', '<input name="name" required value="' + esc(p.name || pre.name || '') + '">', 'wide') + field('Group (optional)', '<input name="cat" list="catlist" maxlength="30" value="' + esc(p.cat || '') + '" placeholder="Example: Sheets, LED, Services"><datalist id="catlist">' + Object.keys(cats).sort().map(function (c) { return '<option value="' + esc(c) + '">'; }).join('') + '</datalist>') + field('HSN/SAC', '<input name="hsn" value="' + esc(p.hsn || '') + '">') + field('Unit', '<input name="unit" value="' + esc(p.unit) + '">') + field('GST %', '<input name="gst" type="number" min="0" step="any" value="' + p.gst + '">') +
    field('Sale price', '<input name="sale" type="number" min="0" step="any" value="' + rs(p.sale) + '">') + '<label class="ck" style="align-self:end;padding-bottom:10px"><input type="checkbox" name="incl"' + (p.incl ? ' checked' : '') + '> Sale price includes GST (MRP style)</label>' + field('Cost price (what you paid)', '<input name="cost" type="number" min="0" step="any" value="' + rs(p.cost) + '">') + field('Wholesale price (optional)', '<input name="wsale" type="number" min="0" step="any" value="' + (p.wsale ? rs(p.wsale) : '') + '">') + field('MRP (optional)', '<input name="mrp" type="number" min="0" step="any" value="' + (p.mrp ? rs(p.mrp) : '') + '">') + field('Minimum stock', '<input name="min" type="number" min="0" step="any" value="' + p.min + '">') +
    (p.id ? '' : field('Opening stock (already in your shop)', '<input name="open" type="number" min="0" step="any" value="0">') + field('Warehouse', '<select name="wh">' + opts(C.d.warehouses) + '</select>')) +
    field('Barcode (scan or type)', '<div style="display:flex;gap:6px"><input name="barcode" maxlength="40" inputmode="numeric" autocomplete="off" value="' + esc(p.barcode || '') + '" placeholder="Scan with your scanner">' + btn('genBarcode', 'Make one', {}, 'sm line') + '</div>') +
    (p.id ? '' : field('Opening batch no (only if batch tracking is on)', '<input name="openBatch" maxlength="30" placeholder="Example: B2410">') + field('Opening expiry date', '<input name="openExp" type="date">')) + '</div>' +
    (p.id ? '' : '<div class="note">Opening stock is for goods you already have. For goods you buy now, save the item with 0 stock and record a Purchase Invoice. That keeps stock, supplier balance and GST credit correct.</div>') +
    '<label class="ck" style="margin:12px 0"><input type="checkbox" name="tracked"' + (p.tracked ? ' checked' : '') + '> Track stock (untick for services)</label><label class="ck" style="margin:0 0 12px"><input type="checkbox" name="batch"' + (p.batch ? ' checked' : '') + '> Track batch and expiry date (medicines, food, cosmetics). Sales then use the earliest expiry first.</label><label class="ck" style="margin:0 0 12px"><input type="checkbox" name="serial"' + (p.serial ? ' checked' : '') + '> Track serial / IMEI numbers (mobiles, electronics, appliances)</label>' + (p.id ? '' : field('Opening serial numbers (serial items, one per line)', '<textarea name="openSerials" rows="2"></textarea>', 'wide')) + '<button class="btn pri" type="submit">Save</button></form>';
}
A.newProd = function () { S.afterProd = null; modal(prodForm(null)); };
A.editProd = function (d) { S.afterProd = null; modal(prodForm(prodById(cur(), d.id))); };
A.saveProd = function (fd) {
  var C = cur(), pn = String(fd.get('name')).trim(), after = S.afterProd, eid = fd.get('id');
  if (!pn) { toast('Enter the item name.', true); return; }
  if ((+fd.get('gst') || 0) > 100 || (+fd.get('gst') || 0) < 0) { toast('GST % must be between 0 and 100.', true); return; }
  if (C.d.products.some(function (x) { return x.id !== eid && x.name.trim().toLowerCase() === pn.toLowerCase(); })) { toast('An item named "' + pn + '" already exists. Search for it instead of adding it again.', true); return; }
  var o = { incl: !!fd.get('incl'), serial: !!fd.get('serial') && !!fd.get('tracked') && !fd.get('batch'), wsale: P(fd.get('wsale')), mrp: P(fd.get('mrp')), name: pn, cat: String(fd.get('cat') || '').trim(), hsn: String(fd.get('hsn') || '').trim(), unit: fd.get('unit') || 'pcs', gst: +fd.get('gst') || 0, sale: P(fd.get('sale')), cost: P(fd.get('cost')), min: +fd.get('min') || 0, tracked: !!fd.get('tracked'), barcode: String(fd.get('barcode') || '').trim(), batch: !!fd.get('batch') && !!fd.get('tracked') };
  if (o.barcode) { var dupB = C.d.products.filter(function (x) { return x.id !== eid && x.barcode && x.barcode.toLowerCase() === o.barcode.toLowerCase(); })[0]; if (dupB) { toast('Barcode ' + o.barcode + ' is already used by ' + dupB.name + '.', true); return; } }
  if (fd.get('serial') && fd.get('batch')) { toast('Choose either batch tracking or serial numbers for one item, not both.', true); return; }
  if (eid && o.serial !== !!prodById(C, eid).serial && C.d.moves.some(function (m) { return m.pid === eid; })) { toast('Serial tracking cannot be changed after stock has moved. Make a new item instead.', true); return; }
  var np = null;
  if (eid) { Object.assign(prodById(C, eid), o); log('Edited product', o.name); }
  else {
    o.openQty = +fd.get('open') || 0; o.wh = fd.get('wh'); o.openBatch = String(fd.get('openBatch') || '').trim(); o.openExp = fd.get('openExp') || '';
    if (o.serial && o.openQty > 0) { o.openSerials = serParse(fd.get('openSerials')); var se0 = serCheck(C, 'new', o.openSerials, o.openQty, 1, ''); if (se0) { toast('Opening serial numbers: ' + se0, true); return; } }
    if (o.tracked && o.openQty > 0 && !(o.cost > 0)) { toast('Enter the cost price (what you paid) for the opening stock, so your profit is correct.', true); return; }
    np = addProduct(C, o); log('Added product', o.name);
  }
  S.afterProd = null; closeModal();
  if (np && after === 'qb') {
    var qs = qbState();
    if (!np.tracked || stockQty(C, np.id) >= 1) { qs.cart.push({ pid: np.id, name: np.name, hsn: np.hsn, unit: np.unit, qty: 1, rate: rateFor(C, np, qs.partyId), disc: discFor(C, qs.partyId), gst: np.gst, mrp: np.mrp || 0 }); qs.q = ''; toast('Item saved and added to the bill.'); }
    else toast('Item saved. It has no stock yet, so record a purchase before selling it.', true);
  } else if (np && after === 'ed' && S.draft) {
    var di = S.draft.items.findIndex(function (it) { return !it.pid && !(it.name || '').trim(); }); if (di < 0) { S.draft.items.push(blankItem()); di = S.draft.items.length - 1; }
    applyProduct(C, S.draft, di, np.id); toast('Item saved and added.');
  }
  afterChange();
};
A.adjust = function (fd) {
  var C = cur(), p = prodById(C, fd.get('pid')), q = parseFloat(fd.get('qty')) || 0, wh = fd.get('wh'), out = fd.get('dir') === 'out';
  if (!(q > 0)) { toast('Enter a quantity above zero.', true); return; }
  if (out && q > stockQty(C, p.id, wh) + 1e-9) { toast('Only ' + qtyF(stockQty(C, p.id, wh)) + ' in ' + wh + '. Reduce the quantity.', true); return; }
  addMove(C, { date: today(), pid: p.id, wh: wh, qty: out ? -q : q, cost: p.cost, type: 'adjustment', note: fd.get('note') || (out ? 'Stock out' : 'Stock in') });
  log('Stock ' + (out ? 'out ' : 'in ') + qtyF(q), p.name); toast('Adjustment saved.'); afterChange();
};
A.transfer = function (fd) {
  var C = cur(), p = prodById(C, fd.get('pid')), q = parseFloat(fd.get('qty')) || 0, a = fd.get('from'), b = fd.get('to');
  if (a === b) { toast('Choose two different warehouses.', true); return; }
  if (!(q > 0)) { toast('Enter a quantity above zero.', true); return; }
  if (q > stockQty(C, p.id, a) + 1e-9) { toast('Only ' + qtyF(stockQty(C, p.id, a)) + ' in ' + a + '.', true); return; }
  addMove(C, { date: today(), pid: p.id, wh: a, qty: -q, cost: p.cost, type: 'transfer', note: 'To ' + b });
  addMove(C, { date: today(), pid: p.id, wh: b, qty: q, cost: p.cost, type: 'transfer', note: 'From ' + a });
  log('Transfer ' + qtyF(q), p.name); toast('Transferred.'); afterChange();
};
A.addWh = function (fd) { var C = cur(), n = String(fd.get('name')).trim(); if (!n) { toast('Enter a name.', true); return; } if (C.d.warehouses.indexOf(n) >= 0) { toast('That warehouse exists.', true); return; } C.d.warehouses.push(n); afterChange(); };
A.opening = function (fd) { var C = cur(); C.d.opening = { cash: P(fd.get('cash')), bank: P(fd.get('bank')) }; log('Opening balances changed'); toast('Saved.'); afterChange(); };
A.addExp = function (fd) { var C = cur(); if (!(P(fd.get('amt')) > 0)) { toast('Enter an amount above zero.', true); return; } if (!String(fd.get('cat')).trim()) { toast('Enter a category.', true); return; } C.d.expenses.push({ id: uid(), date: fd.get('date'), kind: fd.get('kind'), cat: String(fd.get('cat')).trim(), amount: P(fd.get('amt')), mode: fd.get('mode'), note: fd.get('note') }); log('Added ' + fd.get('kind'), fd.get('cat')); toast('Entry added.'); afterChange(); };
A.delExp = function (d) { confirmBox('Delete this entry?', 'It will be removed from cash, bank and profit reports.', 'doDelExp', d.id); };
A.doDelExp = function (d) { closeModal(); var C = cur(); C.d.expenses = C.d.expenses.filter(function (e) { return e.id !== d.id; }); log('Deleted income/expense entry'); afterChange(); };
A.addJrn = function (fd) {
  if (!(P(fd.get('amt')) > 0)) { toast('Enter an amount above zero.', true); return; }
  if (fd.get('dr') === fd.get('cr')) { toast('Debit and credit accounts must be different.', true); return; }
  cur().d.journals.push({ id: uid(), date: fd.get('date'), dr: fd.get('dr'), cr: fd.get('cr'), amount: P(fd.get('amt')), note: fd.get('note') }); log('Journal posted'); toast('Journal posted.'); afterChange();
};
A.delJrn = function (d) { confirmBox('Delete this journal?', 'This cannot be undone.', 'doDelJrn', d.id); };
A.doDelJrn = function (d) { closeModal(); var C = cur(); C.d.journals = C.d.journals.filter(function (j) { return j.id !== d.id; }); log('Deleted journal'); afterChange(); };
function ownerOnly() { if (role() !== 'owner') { toast('Only the owner can do this.', true); return false; } return true; }
function confirmBox(title, msg, act, id) { modal('<div class="mh"><h2>' + esc(title) + '</h2></div><div class="note">' + esc(msg) + '</div><div class="row">' + btn(act, 'Yes, continue', { id: id || '' }, 'warn') + btn('closeModal', 'Keep it', {}, 'line') + '</div>'); }
A.saveCompany = function (fd) {
  if (!ownerOnly()) return;
  var C = cur(), g = String(fd.get('gstin')).trim().toUpperCase(), cn = String(fd.get('name')).trim();
  if (!cn) { toast('Enter the company name.', true); return; }
  var upv = String(fd.get('bupi') || '').trim(); if (upv && !upiOk(upv)) { toast('UPI ID looks wrong. Example: shopname@okaxis', true); return; }
  var ge = gstinErr(g, fd.get('state')); if (ge) { toast(ge, true); return; }
  var cpin = String(fd.get('pin') || '').trim(); if (cpin && !pinOk(cpin)) { toast('PIN code has 6 digits.', true); return; }
  var oldBiz = C.bizType;
  Object.assign(C, { city: String(fd.get('city') || '').trim(), pin: cpin, einv: !!fd.get('einv'), name: cn, gstin: g, state: fd.get('state'), bizType: fd.get('biz'), mode: fd.get('mode'), phone: fd.get('phone'), email: fd.get('email'), address: fd.get('address') });
  C.bank = { name: fd.get('bname'), acc: fd.get('bacc'), ifsc: fd.get('bifsc'), upi: String(fd.get('bupi') || '').trim() };
  C.copyNames = [0, 1, 2].map(function (i) { return String(fd.get('cp' + i) || '').trim().slice(0, 40); }); C.dailyPopup = !!fd.get('popup');
  log('Company settings saved'); toast(oldBiz !== C.bizType ? 'Business type changed. ' + bizNote(C.bizType) : 'Settings saved.'); afterChange();
};
A.saveSeries = function (fd) {
  if (!ownerOnly()) return;
  var C = cur(); Object.keys(DT).concat(['receipt', 'payment']).forEach(function (t) { var v = String(fd.get('s_' + t) || '').trim().toUpperCase(); if (v) C.d.series[t] = { prefix: v }; });
  log('Number series changed'); toast('Number series saved. New documents use the new prefix.'); afterChange();
};
A.addUser = function (fd) {
  if (!ownerOnly()) return;
  var C = cur(), e = String(fd.get('email')).trim().toLowerCase(), u = DB.users.find(function (x) { return x.email.toLowerCase() === e; });
  if (!u) {
    var pw = String(fd.get('pass') || '');
    if (pw.length < 6) { toast('Enter a password of 6 or more characters for the new user.', true); return; }
    if (!String(fd.get('name')).trim()) { toast('Enter the name.', true); return; }
    u = { id: uid(), name: String(fd.get('name')).trim(), email: e }; setPass(u, pw); DB.users.push(u);
  }
  if (C.members.some(function (m) { return m.userId === u.id; })) { toast('This user is already in the company.', true); return; }
  C.members.push({ userId: u.id, role: fd.get('role') }); log('Added user', u.email); toast('User added.'); afterChange();
};
A.rmUser = function (d) {
  if (!ownerOnly()) return;
  if (d.id === DB.session.userId) { toast('You cannot remove yourself.', true); return; }
  confirmBox('Remove this user?', 'They will no longer be able to open this company.', 'doRmUser', d.id);
};
A.doRmUser = function (d) { var C = cur(); closeModal(); C.members = C.members.filter(function (m) { return m.userId !== d.id; }); log('Removed user'); afterChange(); };
A.userPass = function (d) {
  if (!ownerOnly()) return;
  var u = DB.users.find(function (x) { return x.id === d.id; }); if (!u) return;
  modal('<div class="mh"><h2>New password for ' + esc(u.name) + '</h2>' + btn('closeModal', 'Close', {}, 'sm line') + '</div><form data-submit="saveUserPass"><input type="hidden" name="id" value="' + esc(u.id) + '">' + field('New password (6 or more characters)', '<input name="pass" type="password" minlength="6" required autocomplete="new-password">') + '<div style="margin-top:12px"><button class="btn pri" type="submit">Save password</button></div></form>');
};
A.saveUserPass = function (fd) {
  if (!ownerOnly()) return;
  var u = DB.users.find(function (x) { return x.id === fd.get('id'); }), pw = String(fd.get('pass'));
  if (!u || pw.length < 6) { toast('Password must be 6 or more characters.', true); return; }
  setPass(u, pw); log('Password changed for', u.email); closeModal(); toast('Password changed.'); afterChange();
};
function backupJson(C) { return JSON.stringify({ app: 'billdna', v: 2, exported: new Date().toISOString(), company: C }); }
A.dlBackup = function () {
  if (!ownerOnly()) return;
  var C = cur(); C.lastBackup = today(); save();
  saveFile(fname('billdna-backup-' + C.name, 'json'), backupJson(C)).then(function () { render(); });
};
A.copyBackup = function () {
  if (!ownerOnly()) return;
  var txt = backupJson(cur());
  var fallback = function () { modal('<div class="mh"><h2>Backup</h2>' + btn('closeModal', 'Close', {}, 'sm line') + '</div><div class="note">Select all and copy.</div><textarea class="inp" style="min-height:220px" readonly>' + esc(txt) + '</textarea>', true); };
  try { navigator.clipboard.writeText(txt).then(function () { cur().lastBackup = today(); save(); toast('Backup copied.'); }, fallback); } catch (e) { fallback(); }
};
A.showCsv = function () { modal('<div class="mh"><h2>CSV</h2>' + btn('closeModal', 'Close', {}, 'sm line') + '</div><div class="note">Select all and copy into a spreadsheet.</div><textarea class="inp" style="min-height:240px" readonly>' + esc(CSV) + '</textarea>', true); };
A.restore = function (fd) {
  if (!ownerOnly()) return;
  var o;
  try {
    o = JSON.parse(String(fd.get('json')).trim(), function (k, v) { return k === '__proto__' || k === 'constructor' || k === 'prototype' ? undefined : v; }); if (o && o.company) o = o.company;
    if (!o || !o.d || !Array.isArray(o.d.docs) || !Array.isArray(o.d.parties) || !Array.isArray(o.d.products)) throw new Error('bad');
  } catch (e) { toast('That is not a valid backup. Use the file from Download backup, or the full text from Copy backup.', true); return; }
  S.pending = o;
  modal('<div class="mh"><h2>Restore this backup?</h2></div><div class="note">Backup of <b>' + esc(o.name || 'company') + '</b> with ' + o.d.docs.length + ' documents, ' + o.d.parties.length + ' parties and ' + o.d.products.length + ' products. This replaces all current data of this company. Download a backup of the current data first if unsure.</div><div class="row">' + btn('doRestore', 'Yes, restore', {}, 'warn') + btn('closeModal', 'Cancel', {}, 'line') + '</div>');
};
A.doRestore = function () {
  if (!ownerOnly() || !S.pending) return;
  var C = cur(), o = S.pending, id = C.id, mem = C.members; S.pending = null;
  Object.keys(C).forEach(function (k) { delete C[k]; }); Object.assign(C, o, { id: id, members: mem }); delete C.demo; normCompany(C);
  closeModal(); log('Backup restored'); toast('Restored.'); afterChange();
};
A.print = function () {
  var C = cur(), pre = $('#modal .pre');
  if (!pre) { window.print(); return; }
  var labels = pre.getAttribute('data-copies') ? pickedCopies(C) : [''];
  var old = $('#printarea'); if (old) old.remove();
  var area = document.createElement('div'); area.id = 'printarea';
  labels.forEach(function (lb) {
    var c = pre.cloneNode(true); c.querySelectorAll('.row,.copies').forEach(function (x) { x.remove(); });
    var sec = document.createElement('section'); sec.className = 'pcopy';
    if (lb) { var l = document.createElement('div'); l.className = 'clabel'; l.textContent = lb; sec.appendChild(l); }
    sec.appendChild(c); area.appendChild(sec);
  });
  document.body.appendChild(area); document.body.classList.add('printing');
  var done = function () { document.body.classList.remove('printing'); var a = $('#printarea'); if (a) a.remove(); window.removeEventListener('afterprint', done); };
  window.addEventListener('afterprint', done);
  try { window.print(); } finally { if (!('onafterprint' in window)) done(); }
};
A.askReset = function () { if (!ownerOnly()) return; S.confirmReset = true; render(); };
A.cancelReset = function () { S.confirmReset = false; render(); };
A.doReset = function () { if (!ownerOnly()) return; var C = cur(); C.d = newCompany('x').d; S.confirmReset = false; log('Company data reset'); toast('Company data erased.'); afterChange(); };

A.exportView = function () {
  if (!$('#app main table')) { toast('There is no table to download on this screen.', true); return; }
  modal('<div class="mh"><h2>Download this screen</h2>' + btn('closeModal', 'Close', {}, 'sm line') + '</div><div class="note">Downloads the table as shown now, including your search and date filters. PDF and Excel keep the columns. CSV opens in any spreadsheet.</div><div class="row">' + expBtns('main') + '</div>');
};
A.doExport = function (d) { exportRun(d.fmt, d.src); };
A.docPdf = function (d) { var C = cur(), x = docById(C, d.id); toast('Preparing PDF...'); docPdf(x, COPYDOCS.indexOf(x.type) >= 0 ? pickedCopies(C) : null).then(function (buf) { return saveFile(fname(DT[x.type].label + ' ' + x.no, 'pdf'), buf); }, function () { toast('Could not prepare the PDF. Check your internet connection and try again.', true); }); };
A.docXlsx = function (d) { var x = docById(cur(), d.id), m = docModel(x); toast('Preparing Excel...'); xlsxModel(m).then(function (buf) { return saveFile(fname(m.title, 'xlsx'), buf); }, function () { toast('Could not prepare the Excel file. Check your internet connection and try again.', true); }); };
A.viewPay = function (d) { modal(receiptH(cur().d.payments.find(function (p) { return p.id === d.id; }))); try { needPdf().catch(function () { }); } catch (e) { } };
A.payPdf = function (d) { var x = cur().d.payments.find(function (p) { return p.id === d.id; }); toast('Preparing PDF...'); payPdf(x).then(function (buf) { return saveFile(fname((x.type === 'receipt' ? 'Receipt ' : 'Payment ') + x.no, 'pdf'), buf); }, function () { toast('Could not prepare the PDF. Check your internet connection and try again.', true); }); };
A.copyPay = function (d) {
  var txt = payText(cur().d.payments.find(function (p) { return p.id === d.id; }));
  var fallback = function () { modal('<div class="mh"><h2>Receipt text</h2>' + btn('closeModal', 'Close', {}, 'sm line') + '</div><div class="note">Select all and copy.</div><textarea class="inp" style="min-height:200px" readonly>' + esc(txt) + '</textarea>'); };
  try { navigator.clipboard.writeText(txt).then(function () { toast('Text copied.'); }, fallback); } catch (e) { fallback(); }
};
A.moreIns = function () { S.showAllIns = !S.showAllIns; render(); };
A.goRecv = function () { S.view = 'accounting'; S.tab.accounting = 'recv'; S.top = true; render(); };
A.goGst = function (d) { S.view = 'gst'; S.tab.gst = d.t || 'sum'; S.range = { from: addMonths(monthStart(today()), -1), to: lastDayOf(addMonths(today(), -1)) }; S.top = true; closeModal(); render(); };
A.thisMonth = function () { S.range = { from: monthStart(today()), to: today() }; render(); };
A.lastMonth = function () { var p = addMonths(today(), -1); S.range = { from: monthStart(p), to: lastDayOf(p) }; render(); };
A.thisFy = function () { S.range = { from: fyStart(today()), to: today() }; render(); };
A.hsnside = function (d) { S.tab.hsnSide = d.t; render(); };
A.saveBf = function (fd) { var C = cur(); C.itcBf = { ig: P(fd.get('ig')), cg: P(fd.get('cg')), sg: P(fd.get('sg')) }; log('ITC brought forward saved'); toast('Saved.'); afterChange(); };
A.saveG9 = function (fd) { var C = cur(), y = fd.get('y'); C.g9 = C.g9 || {}; C.g9[y] = { ig: P(fd.get('ig')), cg: P(fd.get('cg')), sg: P(fd.get('sg')) }; log('GSTR-9 ITC reversal saved', y); toast('Saved.'); afterChange(); };
A.doShare = function (d) { exportRun(d.fmt, d.src, true); closeModal(); };
A.waShare = function (d) {
  var C = cur(), x = docById(C, d.id), p = partyById(C, x.partyId) || {}, isX = d.fmt === 'xlsx';
  toast('Preparing ' + (isX ? 'Excel' : 'PDF') + '...');
  var make = isX ? xlsxModel(docModel(x)) : docPdf(x, COPYDOCS.indexOf(x.type) >= 0 ? [copyNames(C)[0]] : null);
  make.then(function (buf) { return shareFile(fname(DT[x.type].label + ' ' + x.no, isX ? 'xlsx' : 'pdf'), buf, waShortText(x), waPhone(p)); }, function (e) { toast('Could not prepare the file. Check your internet connection and try again.', true); if (window.console) console.error(e); });
};
A.waPay = function (d) {
  var C = cur(), x = C.d.payments.find(function (p) { return p.id === d.id; }), pr = partyById(C, x.partyId) || {};
  toast('Preparing PDF...');
  payPdf(x).then(function (buf) { return shareFile(fname((x.type === 'receipt' ? 'Receipt ' : 'Payment ') + x.no, 'pdf'), buf, payText(x), waPhone(pr)); }, function () { toast('Could not prepare the PDF. Check your internet connection and try again.', true); });
};
A.qbGrp = function (d) { var s = qbState(); s.grp = d.g; s.q = ''; render(); };
A.qbNewItem = function (d) { S.afterProd = 'qb'; modal(prodForm(null, { name: d.name || '' })); };
A.edNewItem = function () { S.afterProd = 'ed'; modal(prodForm(null)); };
A.goExp = function () { S.view = 'accounting'; S.tab.accounting = 'inex'; S.top = true; render(); if (canWrite('accounting')) modal(expForm()); };
A.copyText = function (d) {
  var txt = billText(docById(cur(), d.id));
  var fallback = function () { modal('<div class="mh"><h2>Bill text</h2>' + btn('closeModal', 'Close', {}, 'sm line') + '</div><div class="note">Select all and copy.</div><textarea class="inp" style="min-height:220px" readonly>' + esc(txt) + '</textarea>'); };
  try { navigator.clipboard.writeText(txt).then(function () { toast('Bill text copied.'); }, fallback); } catch (e) { fallback(); }
};
A.qbAdd = function (d) {
  var C = cur(), s = qbState(), p = prodById(C, d.id), ex = s.cart.find(function (x) { return x.pid === p.id; }), nq = (ex ? ex.qty : 0) + 1;
  if (p.tracked && nq > stockQty(C, p.id) + 1e-9) { toast('Only ' + qtyF(stockQty(C, p.id)) + ' ' + p.unit + ' of ' + p.name + ' in stock.', true); return; }
  if (p.serial) { toast('Serial / IMEI items need a Sales Invoice, to enter the serial number.', true); return; }
  if (ex) ex.qty = nq; else s.cart.push({ pid: p.id, name: p.name, hsn: p.hsn, unit: p.unit, qty: 1, rate: rateFor(C, p, s.partyId), disc: discFor(C, s.partyId), gst: p.gst, mrp: p.mrp || 0 });
  s.q = ''; s.hi = 0; render();
  if (d.from === 'sug') { var inp = $('#qbq'); if (inp) { try { inp.focus(); } catch (e) { } } }
};
A.qbQty = function (d) {
  var C = cur(), s = qbState(), it = s.cart[+d.qi]; if (!it) return;
  var nq = (+it.qty || 0) + (+d.d), p = prodById(C, it.pid);
  if (nq <= 0) { s.cart.splice(+d.qi, 1); render(); return; }
  if (p && p.tracked && nq > stockQty(C, p.id) + 1e-9) { toast('Only ' + qtyF(stockQty(C, p.id)) + ' ' + p.unit + ' in stock.', true); return; }
  it.qty = nq; render();
};
A.qbRm = function (d) { qbState().cart.splice(+d.qi, 1); render(); };
A.qbClear = function () { S.qb = null; render(); };
A.qbSave = function () {
  var C = cur(), s = qbState();
  if (!s.cart.length) { toast('Add at least one item to the bill.', true); return; }
  var walk = !s.partyId, pid = s.partyId || (C.d.parties.find(function (x) { return x.type === 'customer' && x.name === 'Walk-in Customer'; }) || {}).id || '';
  var d = newDraft('invoice', { partyId: pid || 'tmp', items: JSON.parse(JSON.stringify(s.cart)), due: today(), bdt: s.bdt, bdv: s.bdv });
  calc(C, d);
  var err = validateDoc(C, d); if (err) { toast(err, true); return; }
  var sh = shortages(C, d); if (sh.length) { toast('Not enough stock: ' + sh.map(function (x) { return x.name + ' (have ' + qtyF(x.have) + ')'; }).join(', ') + '.', true); return; }
  var q = qbPlan(C), paid = s.paid === null || s.paid === '' ? q.due : P(s.paid);
  if (P(s.settle) > d.total) { toast('Settlement discount is more than the bill total.', true); return; }
  if (paid > q.due) { toast('Amount received is more than ' + (q.adv || q.settle ? 'the amount to collect (' + money(q.due) + ').' : 'the bill total.'), true); return; }
  if (paid < q.due && walk) { toast('Pick a customer for a credit or part payment sale.', true); return; }
  if (!pid) pid = qbWalkin(C).id;
  d.partyId = pid; calc(C, d);
  commitDoc(C, d);
  if (q.adv > 0) useAdvance(C, d, q.adv);
  if (paid > 0 || q.settle > 0) { var e = addPayment(C, { type: 'receipt', date: today(), partyId: pid, amount: paid, disc: q.settle, mode: s.mode, refId: d.id, note: q.settle ? 'Settlement at billing' : '' }); if (e) toast(e, true); }
  S.qb = null; save(); render(); modal(docPreview(docById(C, d.id)), true); toast('Bill ' + d.no + ' saved.');
};

/* ---------- events ---------- */
document.addEventListener('click', function (e) {
  if (e.target === $('#modal')) { closeModal(); return; }
  var t = e.target.closest('[data-act]'); if (!t) return;
  if (t.tagName === 'TR' && e.target.closest('input,select,textarea,label,a,button')) return;
  var f = A[t.dataset.act]; if (f) { e.preventDefault(); f(t.dataset, t); }
});
document.addEventListener('submit', function (e) {
  var n = e.target.dataset && e.target.dataset.submit; if (!n || !A[n]) return;
  e.preventDefault(); A[n](new FormData(e.target), e.target);
});
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !$('#modal').hidden) closeModal();
  if (e.key === 'Tab' && !$('#modal').hidden) {
    var fs = Array.prototype.slice.call($('#modal').querySelectorAll('a[href],button:not([disabled]),input:not([type=hidden]):not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]'));
    if (!fs.length) { e.preventDefault(); return; }
    var i = fs.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) { e.preventDefault(); fs[fs.length - 1].focus(); }
    else if (!e.shiftKey && (i === fs.length - 1 || i < 0)) { e.preventDefault(); fs[0].focus(); }
  }
  if (e.key === 'Enter' && e.target.tagName === 'TR' && e.target.classList.contains('clk')) { e.preventDefault(); e.target.click(); return; }
  if (e.target.id === 'scanin' && e.key === 'Enter') { e.preventDefault(); if (scanAdd(e.target.value, 'doc')) { e.target.value = ''; var sc = $('#scanin'); if (sc) sc.focus(); } else toast('No item has this barcode.', true); return; }
  if (e.target.id === 'qbq') {
    var rows = Array.prototype.slice.call(document.querySelectorAll('#qbsug .sug-row'));
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { if (!rows.length) return; e.preventDefault(); var st = qbState(), n = rows.length; st.hi = (st.hi + (e.key === 'ArrowDown' ? 1 : n - 1)) % n; rows.forEach(function (r, i) { r.classList.toggle('hi', i === st.hi); }); return; }
    if (e.key === 'Escape') { var s2 = qbState(); s2.q = ''; s2.hi = 0; e.target.value = ''; var sg = $('#qbsug'); if (sg) { sg.innerHTML = ''; sg.hidden = true; } return; }
    if (e.key === 'Enter') { e.preventDefault(); if (scanAdd(e.target.value, 'qb')) return; var pick = rows[qbState().hi] || rows[0]; if (pick) pick.click(); return; }
  }
});
document.addEventListener('input', function (e) {
  var t = e.target;
  if (t.id === 'qbq') { var qs0 = qbState(); qs0.q = t.value; qs0.hi = 0; var sg0 = $('#qbsug'); if (sg0) { sg0.innerHTML = qbSugH(cur()); sg0.hidden = !t.value.trim(); } return; }
  if (t.dataset && t.dataset.qbf) {
    var s = qbState();
    if (t.dataset.qbf === 'paid') { s.paid = t.value === '' ? null : t.value; return; }
    if (t.dataset.qbf === 'bdt' || t.dataset.qbf === 'bdv' || t.dataset.qbf === 'settle') { s[t.dataset.qbf] = t.value; qbRefresh(); return; }
    if (t.dataset.qbf === 'adv') { s.adv = t.checked; qbRefresh(); return; }
    var ci = s.cart[+t.dataset.qi]; if (!ci) return;
    if (t.dataset.qbf === 'rate') ci.rate = P(t.value); else ci.qty = parseFloat(t.value) || 0;
    qbRefresh(); return;
  }
  if (t.id === 'hq') { S.hq = t.value; var hr = $('#hqres'); if (hr) hr.innerHTML = hmSearchRes(cur(), S.hq); return; }
  if (t.id === 'q') { S.q = t.value; S.lim = {}; var l = $('#list'); if (l && S.listFn) l.innerHTML = S.listFn(); return; }
  var f = t.dataset && t.dataset.f; if (!f || !S.draft) return;
  if (t.dataset.i !== undefined) {
    var it = S.draft.items[+t.dataset.i]; if (!it) return;
    if (f === 'pid') return;
    if (f === 'rate') it.rate = P(t.value);
    else if (f === 'qty' || f === 'disc' || f === 'gst') it[f] = parseFloat(t.value) || 0;
    else it[f] = t.value;
    if (f === 'rate' || f === 'qty' || f === 'disc' || f === 'gst') refreshTotals();
  } else { S.draft[f] = t.value; if (f === 'partyId' || f === 'bdt' || f === 'bdv') refreshTotals(); }
});
document.addEventListener('change', function (e) {
  var t = e.target, C = cur();
  if (t.name === 'svc' && t.form) { var tk = t.form.elements.tracked; if (tk) { tk.checked = !t.checked; if (t.checked) { ['batch', 'serial'].forEach(function (n) { if (t.form.elements[n]) t.form.elements[n].checked = false; }); } } return; }
  if (t.dataset.range) { rng()[t.dataset.range] = t.value; render(); return; }
  if (t.dataset.f === 'name' && S.draft && t.dataset.i !== undefined) { var ni = +t.dataset.i, nit = S.draft.items[ni], nm = String(t.value || '').trim().toLowerCase(), np = nm && C.d.products.find(function (p) { return p.name.trim().toLowerCase() === nm; }); if (nit && np && !nit.pid) { applyProduct(C, S.draft, ni, np.id); render(); return; } }
  if (t.dataset.f === 'pid' && S.draft) { applyProduct(C, S.draft, +t.dataset.i, t.value); render(); return; }
  var c = t.dataset.chg; if (!c) return;
  if (c === 'dbDate') { if (t.value) { S.dbDate = t.value; render(); } return; }
  if (c === 'backupFile') {
    var file = t.files && t.files[0]; if (!file) return;
    if (file.size > 20 * 1024 * 1024) { toast('That file is too large to be a backup.', true); return; }
    var fr = new FileReader(), form0 = t.form;
    fr.onload = function () { form0.elements.json.value = String(fr.result); toast('File loaded. Press Restore to continue.'); };
    fr.onerror = function () { toast('Could not read that file.', true); };
    fr.readAsText(file); return;
  }
  if (c === 'm2b') { var md = docById(C, t.dataset.id); if (md) { md.m2b = t.checked; save(); render(); } return; }
  if (c === 'g9y') { S.tab.g9y = t.value; render(); return; }
  if (c === 'copy') { var sel = copySel(C).slice(); sel[+t.dataset.i] = t.checked; if (!sel.some(Boolean)) { sel[+t.dataset.i] = true; t.checked = true; toast('Keep at least one copy ticked.', true); } C.copySel = sel; save(); return; }
  if (c === 'ledgerP') { S.tab.ledgerP = t.value; render(); }
  else if (c === 'acct') { S.tab.acct = t.value; render(); }
  else if (c === 'qbParty') { var qs1 = qbState(); qs1.partyId = t.value; qs1.adv = !!t.value && advAvail(cur(), t.value, 'receipt') > 0 && !unpaidDocs(cur(), t.value, 'receipt').length; qs1.paid = null; render(); }
  else if (c === 'qbMode') { qbState().mode = t.value; }
  else if (c === 'role') { var m = C.members.find(function (x) { return x.userId === t.dataset.uid; }); if (m) { m.role = t.value; log('Role changed', t.value); save(); toast('Role updated.'); } }
  else if (c === 'payParty') { var form = t.form; form.elements.ref.innerHTML = payInvOptions(form.elements.type.value, t.value, ''); form.elements.amt.value = ''; }
  else if (c === 'payInv') { var f2 = t.form, inv = docById(C, t.value); f2.elements.amt.value = inv ? rs(outstanding(C, inv)) : ''; }
});

/* ---------- boot ---------- */
window.addEventListener('beforeunload', function (e) { if (DB && DB.session && (S.draft || (S.qb && S.qb.cart && S.qb.cart.length))) { e.preventDefault(); e.returnValue = ''; } });
window.addEventListener('storage', function (e) {
  if (e.key !== LS || !e.newValue) return;
  try { DB = normDB(JSON.parse(e.newValue)); IDBS.seen = +localStorage.getItem(LS + '_at') || IDBS.seen; S.draft = null; S.qb = null; closeModal(); render(); toast('Updated from another tab.'); } catch (x) { }
});
window.addEventListener('error', function (e) { if (window.console) console.error(e.error || e.message); var t = $('#toast'); if (t && !t.className) toast('Something went wrong. Your saved data is safe. Reload if it keeps happening.', true); });
bindExtra(A);
bindBatch(A);
bindGov(A);
bindPin(A);
bindLimits(A);
bindRcpt(A);
bindImport(A);
bindRemind(A);
bindPrice(A);
bindRecur(A);
bindSerial(A); bindTds(A); bindBank(A); bindR2b(A); bindMore(A); bindMore2(A); bindBackup(A); bindPay(A);
function boot() {
  DB = load();
  if (!DB) DB = seedDB();
  S.mode = DB.users.length ? 'login' : 'signup';
  save();
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) { }
  try { if (window.BILLDNA_SW && 'serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('sw.js'); } catch (e) { }
  try {
    if (IDBS.db && window.BroadcastChannel) {
      IDBS.bc = new BroadcastChannel('billdna');
      IDBS.bc.onmessage = function (m) {
        if (!m.data || !(m.data.at > IDBS.seen)) return;
        idbGet(function (rec) { if (!rec || !(rec.savedAt > IDBS.seen)) return; try { DB = normDB(JSON.parse(rec.json)); IDBS.seen = rec.savedAt; S.draft = null; S.qb = null; closeModal(); render(); toast('Updated from another window.'); } catch (x) { } });
      };
    }
    window.addEventListener('pagehide', flushIdb);
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') flushIdb(); });
  } catch (e) { }
  render();
  licStart(); autoBackupStart();
}
initStore(boot);
})();

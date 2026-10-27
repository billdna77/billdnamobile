/* Bill DNA mobile layer v2 — "nothing hidden" navigation.
   Injected inside the desktop app's scope by scripts/build-www.sh. Active in the APK or on small screens.
   Principles: every feature reachable in <=2 taps and visible on screen (All page + Create sheet + section chips),
   one primary action (Create) in the thumb zone, black/white base with one orange accent. */
var MOB = !!window.BILLDNA_APK || !!(window.matchMedia && window.matchMedia('(max-width: 760px)').matches);
if (MOB) (function () {
  document.documentElement.classList.add('m');
  var IP = {
    home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h5v-6h4v6h5V10"/>',
    bill: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    box: '<path d="M3 7l9-4 9 4-9 4z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/>',
    all: '<rect x="4" y="4" width="6" height="6" rx="2"/><rect x="14" y="4" width="6" height="6" rx="2"/><rect x="4" y="14" width="6" height="6" rx="2"/><rect x="14" y="14" width="6" height="6" rx="2"/>',
    inr: '<path d="M7 4h10M7 9h10M7 4c6 0 6 9 0 9h-1l8 7"/>',
    cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/><path d="M3 4h2l2.4 11h11l2-8H6"/>',
    wallet: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M16 14h2"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-4 3.4-6 6.5-6s5.7 2 6.5 6"/><path d="M16 4.5a3.5 3.5 0 010 7M18 14c2 .7 3.2 2.6 3.5 6"/>',
    user: '<circle cx="12" cy="8" r="3.8"/><path d="M4.5 20.5c.9-4.2 3.8-6.5 7.5-6.5s6.6 2.3 7.5 6.5"/>',
    useradd: '<circle cx="10" cy="8" r="3.5"/><path d="M3.5 20c.8-4 3.4-6 6.5-6s5.7 2 6.5 6"/><path d="M19 8v6M16 11h6"/>',
    tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.3"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    pie: '<path d="M12 3a9 9 0 109 9h-9z"/><path d="M15 3.5A9 9 0 0120.5 9H15z"/>',
    doc: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
    docok: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 14l2 2 4-4"/>',
    clip: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
    truck: '<path d="M2 6h12v10H2zM14 9h4l3 3v4h-7"/><circle cx="6" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/>',
    ret: '<path d="M9 7L4 12l5 5"/><path d="M4 12h11a5 5 0 010 10h-2"/>',
    bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
    spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
    swap: '<path d="M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>',
    out: '<path d="M9 21H5V3h4M16 17l5-5-5-5M21 12H9"/>',
    alert: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/>',
    chev: '<path d="M9 6l6 6-6 6"/>',
    back: '<path d="M15 6l-6 6 6 6"/>',
    down: '<path d="M12 4v12M6 11l6 6 6-6M5 20h14"/>',
    up: '<path d="M12 20V8M6 13l6-6 6 6M5 4h14"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
    home2: '<path d="M4 20V9l8-5 8 5v11"/><path d="M9 20v-6h6v6"/>',
    book: '<path d="M4 4h7a3 3 0 013 3v13a2 2 0 00-2-2H4z"/><path d="M20 4h-4a2 2 0 00-2 2"/><path d="M20 4v14h-6"/>',
    scale: '<path d="M12 3v18M7 21h10M5 7h14"/><path d="M5 7l-3 7h6zM19 7l-3 7h6z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    bank: '<path d="M3 9l9-5 9 5M4 9v9M20 9v9M8 11v6M12 11v6M16 11v6M3 20h18"/>',
    percent: '<path d="M5 19L19 5"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>',
    hash: '<path d="M9 3L7 21M17 3l-2 18M4 8h17M3 16h17"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    cloud: '<path d="M7 18h10a4 4 0 00.5-8 6 6 0 00-11.4 1.5A3.5 3.5 0 007 18z"/><path d="M12 11v6M9.5 14.5L12 17l2.5-2.5"/>',
    trash: '<path d="M4 7h16M10 7V4h4v3M6 7l1 14h10l1-14"/>',
    hist: '<path d="M3 12a9 9 0 109-9 9 9 0 00-7 3.4"/><path d="M3 4v4h4M12 8v4l3 2"/>',
    barcode: '<path d="M4 5v14M7 5v14M10 5v14M14 5v14M16 5v14M20 5v14"/>',
    calc: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 18h4"/>',
    trend: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>'
  };
  function ic(n, cls) { return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (IP[n] || IP.doc) + '</svg>'; }

  /* ---------- feature map: the single source for the All page, search and section chips ---------- */
  function hasTab(fn) { try { return fn(); } catch (e) { return true; } }
  function featureMap() {
    var C = cur();
    var G = [
      { id: 'sales', name: 'Sales', icon: 'bill', v: 'sales', items: [
        ['Quick Bill', 'bolt', 'nav', { v: 'quick' }, 'Fast counter billing'],
        ['Sales Invoice', 'bill', 'mOpen', { v: 'sales', t: 'invoice' }, 'GST tax invoice'],
        ['Payment In', 'inr', 'mOpen', { v: 'sales', t: 'receipt' }, 'Money received'],
        ['Quotation', 'doc', 'mOpen', { v: 'sales', t: 'quotation' }],
        ['Estimate', 'calc', 'mOpen', { v: 'sales', t: 'estimate' }],
        ['Proforma', 'docok', 'mOpen', { v: 'sales', t: 'proforma' }],
        ['Sales Order', 'clip', 'mOpen', { v: 'sales', t: 'salesorder' }],
        ['Delivery Challan', 'truck', 'mOpen', { v: 'sales', t: 'challan' }],
        ['Enquiry', 'chat', 'mOpen', { v: 'sales', t: 'enquiry' }],
        ['Sales Return', 'ret', 'mOpen', { v: 'sales', t: 'creditnote' }, 'Credit note'],
        ['Debit Note', 'doc', 'mOpen', { v: 'sales', t: 'debitnote' }, 'Extra charge to customer']] },
      { id: 'purchases', name: 'Purchases', icon: 'cart', v: 'purchases', items: [
        ['Purchase Bill', 'cart', 'mOpen', { v: 'purchases', t: 'pinvoice' }],
        ['Payment Out', 'wallet', 'mOpen', { v: 'purchases', t: 'payment' }, 'Paid to supplier'],
        ['Purchase Order', 'clip', 'mOpen', { v: 'purchases', t: 'po' }],
        ['Purchase Return', 'ret', 'mOpen', { v: 'purchases', t: 'preturn' }, 'Debit note']] },
      { id: 'parties', name: 'Parties', icon: 'users', v: 'parties', items: [
        ['Customers', 'user', 'mOpen', { v: 'parties', t: 'customer' }],
        ['Suppliers', 'users', 'mOpen', { v: 'parties', t: 'supplier' }]] },
      { id: 'inventory', name: 'Items & Stock', icon: 'box', v: 'inventory', items: [
        ['Items', 'tag', 'mOpen', { v: 'inventory', t: 'products' }],
        ['Stock In / Out', 'layers', 'mOpen', { v: 'inventory', t: 'adjust' }, 'Adjust, transfer, opening'],
        ['Warehouses', 'home2', 'mOpen', { v: 'inventory', t: 'warehouses' }],
        ['Godown Transfer', 'swap', 'mOpen', { v: 'inventory', t: 'transfers' }],
        ['Stock Ledger', 'book', 'mOpen', { v: 'inventory', t: 'ledger' }],
        ['Stock Value', 'scale', 'mOpen', { v: 'inventory', t: 'valuation' }]]
        .concat(C.d.products.some(function (p) { return p.batch; }) ? [['Batches & Expiry', 'clock', 'mOpen', { v: 'inventory', t: 'batches' }]] : [])
        .concat(C.d.products.some(function (p) { return p.serial; }) ? [['Serial Numbers', 'barcode', 'mOpen', { v: 'inventory', t: 'serials' }]] : []) },
      { id: 'accounting', name: 'Money', icon: 'wallet', v: 'accounting', items: [
        ['Cash & Bank', 'bank', 'mOpen', { v: 'accounting', t: 'cash' }],
        ['Income & Expense', 'wallet', 'mOpen', { v: 'accounting', t: 'inex' }],
        ['To Collect', 'down', 'mOpen', { v: 'accounting', t: 'recv' }, 'Receivables'],
        ['To Pay', 'up', 'mOpen', { v: 'accounting', t: 'pay' }, 'Payables'],
        ['Expense Report', 'pie', 'mOpen', { v: 'accounting', t: 'exprep' }],
        ['Journals', 'book', 'mOpen', { v: 'accounting', t: 'journal' }],
        ['TDS & TCS', 'percent', 'mOpen', { v: 'accounting', t: 'tds' }],
        ['Bank Reconcile', 'docok', 'mOpen', { v: 'accounting', t: 'bank' }],
        ['Loans & EMI', 'calc', 'mOpen', { v: 'accounting', t: 'loans' }]] },
      { id: 'gst', name: 'GST', icon: 'percent', v: 'gst', items: [
        ['GST Summary', 'percent', 'mOpen', { v: 'gst', t: 'sum' }],
        ['GSTR-1', 'doc', 'mOpen', { v: 'gst', t: 'gstr1' }, 'Sales return'],
        ['GSTR-3B', 'docok', 'mOpen', { v: 'gst', t: 'gstr3b' }],
        ['GSTR-2', 'cart', 'mOpen', { v: 'gst', t: 'purreg' }, 'Purchases and ITC'],
        ['GSTR-2B Match', 'swap', 'mOpen', { v: 'gst', t: 'r2b' }],
        ['GSTR-9', 'book', 'mOpen', { v: 'gst', t: 'gstr9' }, 'Yearly'],
        ['HSN / SAC', 'hash', 'mOpen', { v: 'gst', t: 'hsn' }]] },
      { id: 'reports', name: 'Reports', icon: 'chart', v: 'gst', items: [
        ['Profit & Loss', 'trend', 'mOpen', { v: 'gst', t: 'pl' }],
        ['Sales Report', 'bill', 'mOpen', { v: 'gst', t: 'sales' }],
        ['Purchase Report', 'cart', 'mOpen', { v: 'gst', t: 'purchase' }],
        ['Bill-wise Profit', 'scale', 'mOpen', { v: 'gst', t: 'billprofit' }],
        ['Party-wise Sales', 'users', 'mOpen', { v: 'gst', t: 'partysales' }],
        ['Stock Report', 'box', 'mOpen', { v: 'gst', t: 'stock' }],
        ['Low Stock', 'alert', 'mOpen', { v: 'gst', t: 'lowstock' }],
        ['Outstanding', 'clock', 'mOpen', { v: 'gst', t: 'out' }],
        ['Sales by User', 'user', 'mOpen', { v: 'gst', t: 'byuser' }]] },
      { id: 'crm', name: 'Insights', icon: 'spark', v: 'crm', items: [
        ['Overview', 'spark', 'mOpen', { v: 'crm', t: 'ov' }],
        ['Top Customers', 'users', 'mOpen', { v: 'crm', t: 'cust' }],
        ['Dues & Aging', 'clock', 'mOpen', { v: 'crm', t: 'dues' }],
        ['Item Insights', 'tag', 'mOpen', { v: 'crm', t: 'items' }],
        ['Collections', 'inr', 'mOpen', { v: 'crm', t: 'coll' }],
        ['Profit & Cash', 'trend', 'mOpen', { v: 'crm', t: 'profit' }]] },
      { id: 'settings', name: 'Settings', icon: 'gear', v: 'settings', items: [
        ['Company & Tax', 'home2', 'mOpen', { v: 'settings', t: 'company' }],
        ['Number Series', 'hash', 'mOpen', { v: 'settings', t: 'series' }],
        ['Preferences', 'gear', 'mOpen', { v: 'settings', t: 'prefs' }],
        ['Users & Roles', 'shield', 'mOpen', { v: 'settings', t: 'users' }],
        ['Backup', 'cloud', 'mOpen', { v: 'settings', t: 'backup' }],
        ['Recycle Bin', 'trash', 'mOpen', { v: 'settings', t: 'bin' }],
        ['Audit Log', 'hist', 'mOpen', { v: 'settings', t: 'audit' }]] }
    ];
    return G.filter(function (g) { return canView(g.v); });
  }
  var GST_TABS = ['sum', 'gstr1', 'gstr3b', 'hsn', 'purreg', 'r2b', 'gstr9'];
  function sectionOf(v, t) { if (v === 'gst') return GST_TABS.indexOf(t || S.tab.gst || 'sum') >= 0 ? 'gst' : 'reports'; return v; }
  var TITLES = { dashboard: 'Home', quick: 'Quick Bill', sales: 'Sales', purchases: 'Purchases', parties: 'Parties', inventory: 'Items & Stock', accounting: 'Money', gst: 'GST', reports: 'Reports', crm: 'Insights', settings: 'Settings', menu: 'All features' };

  /* every sub-tab visible on mobile (simple mode only trims the desktop screens) */
  visTabs = function (C, tabs) { return tabs; };
  /* GST and Reports share one desktop screen: on mobile show only the group you are in */
  var _tabsH = tabsH;
  tabsH = function (list, active, act) {
    if (S.view === 'gst' && act === 'tab' && list.some(function (t) { return t[0] === 'gstr1'; })) {
      var g = GST_TABS.indexOf(active) >= 0; list = list.filter(function (t) { return (GST_TABS.indexOf(t[0]) >= 0) === g; });
    }
    return _tabsH(list, active, act);
  };

  /* lists: every table becomes a card list (labels come from the table header) */
  table = function (head, rows, empty, foot, ids) {
    if (!rows.length) return '<div class="empty">' + esc(empty || 'Nothing here yet.') + '</div>';
    var lab = function (i) { return head[i] && head[i][0] ? ' data-label="' + esc(head[i][0]) + '"' : ''; };
    if (head.length <= 2) return '<div class="tw"><table class="mt2"><thead><tr>' + head.map(function (h) { return '<th class="' + (h[1] || '') + '">' + esc(h[0]) + '</th>'; }).join('') + '</tr></thead><tbody>' + rows.map(function (r, ri) { var a = ids && ids[ri]; return '<tr' + (a ? ' class="clk" tabindex="0" data-act="' + a[0] + '" data-id="' + esc(a[1]) + '"' : '') + '>' + r.map(function (c, i) { return '<td class="' + (head[i][1] || '') + '">' + c + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody>' +
      (foot ? '<tfoot><tr>' + foot.map(function (c, i) { return '<td class="' + (head[i][1] || '') + '">' + c + '</td>'; }).join('') + '</tr></tfoot>' : '') + '</table></div>';
    return '<div class="tw"><table class="mt"><thead><tr>' + head.map(function (h) { return '<th class="' + (h[1] || '') + '">' + esc(h[0]) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      rows.map(function (r, ri) { var a = ids && ids[ri]; return '<tr' + (a ? ' class="clk" tabindex="0" data-act="' + a[0] + '" data-id="' + esc(a[1]) + '"' : '') + '>' + r.map(function (c, i) { return '<td class="' + (head[i][1] || '') + '"' + lab(i) + '>' + c + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody>' +
      (foot ? '<tfoot><tr>' + foot.map(function (c, i) { return '<td class="' + (head[i][1] || '') + '"' + lab(i) + '>' + c + '</td>'; }).join('') + '</tr></tfoot>' : '') + '</table></div>';
  };

  /* modals open as bottom sheets; do not pop the keyboard on open */
  var _modal = modal;
  modal = function (html, wide) { _modal(html, wide); var a = document.activeElement; if (a && /INPUT|TEXTAREA|SELECT/.test(a.tagName)) { try { a.blur(); $('#modal').firstChild.focus({ preventScroll: true }); } catch (e) { } } };

  function qbBar() {
    var C = cur(), s = qbState(); if (!s.cart.length) return '';
    var d = qbCalc(C), n = s.cart.reduce(function (a, x) { return a + (+x.qty || 0); }, 0);
    return '<div class="m-cbar" id="mcbar"><div><b class="num">' + money(d.total) + '</b><span>' + qtyF(n) + ' item(s) · ' + esc(s.mode) + '</span></div>' +
      '<button type="button" class="btn line" data-act="mToBill">Review</button><button type="button" class="btn pri" data-act="qbSave">Save bill</button></div>';
  }
  var _qbRefresh = qbRefresh;
  qbRefresh = function () { _qbRefresh(); var b = $('#mcbar'); if (b) b.outerHTML = qbBar(); };

  function navBtn(act, v, label, icon, on) {
    return '<button type="button" class="m-tab' + (on ? ' on' : '') + '" data-act="' + act + '"' + (v ? ' data-v="' + v + '"' : '') + (on ? ' aria-current="page"' : '') + '>' + ic(icon) + '<span>' + esc(label) + '</span></button>';
  }
  shellH = function () {
    var C = cur();
    if (S.view !== 'menu' && !canView(S.view)) S.view = 'dashboard';
    var v = S.view, home = v === 'dashboard', sec = sectionOf(v);
    var bar = '<header class="m-top">' + (home ? '<div class="m-co"><b>' + esc(C.name) + '</b><span>FY ' + fyLabel(today()) + ' · ' + esc(role()) + '</span></div>'
      : '<button type="button" class="m-ib" data-act="mHome" aria-label="Back to home">' + ic('back') + '</button><div class="m-co"><b>' + esc(TITLES[sec] || 'Bill DNA') + '</b><span>' + esc(C.name) + '</span></div>') +
      '<button type="button" class="m-ib" data-act="mMenu" data-s="1" aria-label="Search features">' + ic('search') + '</button></header>';
    var mainSecs = ['dashboard', 'sales', 'inventory', 'menu', 'quick'];
    var nav = '<nav class="m-nav" aria-label="Main">' + navBtn('nav', 'dashboard', 'Home', 'home', home) +
      (canView('sales') ? navBtn('mOpen', 'sales" data-t="invoice', 'Sales', 'bill', v === 'sales') : '') +
      '<button type="button" class="m-fab" data-act="mCreate" aria-label="Create">' + ic('plus') + '<span>Create</span></button>' +
      (canView('inventory') ? navBtn('nav', 'inventory', 'Items', 'box', v === 'inventory') : '') +
      navBtn('mMenu', '', 'All', 'all', mainSecs.indexOf(v) < 0 || v === 'menu') + '</nav>';
    return '<div class="shell m-shell v-' + esc(v) + '">' + bar + '<main class="main">' + (v === 'menu' ? menuH() : V[v]()) + '</main>' + (v === 'quick' ? qbBar() : '') + nav + '</div>';
  };

  function tile(x, cls) { return '<button type="button" class="m-qa ' + (cls || '') + '" data-act="' + x[2] + '"' + dattr(x[3]) + ' data-k="' + esc((x[0] + ' ' + (x[4] || '')).toLowerCase()) + '"><i>' + ic(x[1]) + '</i><span>' + esc(x[0]) + '</span></button>'; }

  /* All features page: every screen as a labelled tile, grouped, searchable */
  function menuH() {
    var u = user(), C = cur();
    var h = '<div class="m-search">' + ic('search') + '<input id="mfq" type="search" placeholder="Search any feature — GSTR, stock, expense…" autocomplete="off" aria-label="Search features" value="' + esc(S.mfq || '') + '"></div>';
    h += featureMap().map(function (g) {
      return '<section class="card m-card m-grp" data-g="' + g.id + '"><div class="m-gh"><span class="m-gi">' + ic(g.icon) + '</span><h2>' + esc(g.name) + '</h2></div><div class="m-qgrid">' + g.items.map(function (x) { return tile(x); }).join('') + '</div></section>';
    }).join('');
    h += '<div class="empty" id="mfnone" hidden>No feature matches. Try another word.</div>';
    h += '<section class="card m-card"><div class="m-me">' + avatar(u.name) + '<div><b>' + esc(u.name) + '</b><span>' + esc(C.name) + ' · ' + esc(role()) + '</span></div></div>' +
      '<div class="m-acts">' + btn('mSwitch', 'Switch company', {}, 'line') + btn('mOut', 'Sign out', {}, 'line') + '</div><div class="note">Bill DNA · data is kept on this phone. Take a backup from Settings › Backup.</div></section>';
    return h;
  }
  function filterMenu() {
    var q = String(S.mfq || '').trim().toLowerCase(), any = false;
    document.querySelectorAll('.m-grp').forEach(function (g) {
      var gname = g.querySelector('h2').textContent.toLowerCase(), shown = 0;
      g.querySelectorAll('.m-qa').forEach(function (t) { var ok = !q || t.dataset.k.indexOf(q) >= 0 || gname.indexOf(q) >= 0; t.hidden = !ok; if (ok) shown++; });
      g.hidden = !shown; if (shown) any = true;
    });
    var n = $('#mfnone'); if (n) n.hidden = any;
  }
  document.addEventListener('input', function (e) { if (e.target && e.target.id === 'mfq') { S.mfq = e.target.value; filterMenu(); } });

  A.mMenu = function (d) { S.view = 'menu'; S.draft = null; S.top = true; if (!d || !d.s) S.mfq = ''; render(); filterMenu(); if (d && d.s) { var i = $('#mfq'); if (i) i.focus(); } };
  A.mHome = function () { A.nav({ v: 'dashboard' }); };
  A.mOpen = function (d) {
    if (!canView(d.v)) return;
    closeModal(); S.flt = null; S.lim = {}; S.q = ''; S.draft = null; S.view = d.v; S.tab[d.v] = d.t; if (d.v === 'sales') S.force = d.t; S.top = true; render();
  };
  A.mDo = function (d) { closeModal(); var f = A[d.a]; if (f) f(d); };
  A.mSwitch = function () { closeModal(); A.switchCo(); };
  A.mOut = function () { closeModal(); A.logout(); };
  A.mToBill = function () { var t = $('#qbtot') || $('#cart'); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'center' }); };

  /* Create sheet: every "new" action in one place, quick bill first */
  function createItems() {
    var g = [];
    var sell = [];
    if (canWrite('sales', 'invoice')) sell.push(['Sales Invoice', 'bill', 'mDo', { a: 'newDocGo', t: 'invoice' }]);
    if (canWrite('sales', 'receipt')) sell.push(['Payment In', 'inr', 'mDo', { a: 'newPay', type: 'receipt' }]);
    [['quotation', 'Quotation', 'doc'], ['estimate', 'Estimate', 'calc'], ['proforma', 'Proforma', 'docok'], ['salesorder', 'Sales Order', 'clip'], ['challan', 'Delivery Challan', 'truck'], ['creditnote', 'Sales Return', 'ret'], ['enquiry', 'Enquiry', 'chat']].forEach(function (x) { if (canWrite('sales', x[0])) sell.push([x[1], x[2], 'mDo', { a: 'newDocGo', t: x[0] }]); });
    if (sell.length) g.push(['Sell', sell]);
    var buy = [];
    [['pinvoice', 'Purchase Bill', 'cart'], ['po', 'Purchase Order', 'clip'], ['preturn', 'Purchase Return', 'ret']].forEach(function (x) { if (canWrite('purchases', x[0])) buy.push([x[1], x[2], 'mDo', { a: 'newDocGo', t: x[0] }]); });
    if (canWrite('purchases', 'payment')) buy.splice(1, 0, ['Payment Out', 'wallet', 'mDo', { a: 'newPay', type: 'payment' }]);
    if (buy.length) g.push(['Buy', buy]);
    var oth = [];
    if (canWrite('accounting')) oth.push(['Expense / Income', 'wallet', 'mDo', { a: 'goExp' }]);
    if (canWrite('inventory')) oth.push(['Item', 'tag', 'mDo', { a: 'newProd' }], ['Stock In / Out', 'layers', 'mOpen', { v: 'inventory', t: 'adjust' }]);
    if (canWrite('parties')) oth.push(['Customer', 'useradd', 'mDo', { a: 'newParty', side: 'customer' }], ['Supplier', 'users', 'mDo', { a: 'newParty', side: 'supplier' }]);
    if (oth.length) g.push(['Add', oth]);
    return g;
  }
  A.mCreate = function () {
    var h = '<div class="mh"><h2>Create</h2>' + btn('closeModal', 'Close', {}, 'sm line') + '</div>';
    if (canWrite('quick')) h += '<button type="button" class="m-big" data-act="mDo" data-a="nav" data-v="quick"><i>' + ic('bolt') + '</i><span><b>Quick Bill</b><em>Tap items, take payment, share on WhatsApp</em></span>' + ic('chev') + '</button>';
    h += createItems().map(function (g) { return '<div class="m-sh">' + esc(g[0]) + '</div><div class="m-qgrid">' + g[1].map(function (x) { return tile(x); }).join('') + '</div>'; }).join('');
    modal(h);
  };

  /* Home: numbers first, then actions, then everything else one tap away */
  V.dashboard = function () {
    var C = cur(), d = C.d, t = today(), m = t.slice(0, 7), u = user();
    var inv = d.docs.filter(function (x) { return x.type === 'invoice' && !x.cancelled; });
    var tod = inv.filter(function (x) { return x.date === t; }), mon = inv.filter(function (x) { return x.date.slice(0, 7) === m; });
    var recv = sumBy(d.parties.filter(function (p) { return p.type === 'customer'; }), function (p) { return Math.max(0, partyBalance(C, p)); });
    var pay = sumBy(d.parties.filter(function (p) { return p.type === 'supplier'; }), function (p) { return Math.max(0, partyBalance(C, p)); });
    var over = inv.filter(function (x) { return x.due && x.due < t && outstanding(C, x) > 0; });
    var low = lowItems(C), cb = cashBank(C), first = String((u && u.name) || '').split(' ')[0];
    var h = '<div class="m-greet">' + hmGreet() + (first ? ', ' + esc(first) : '') + '<span>' + DAYS[new Date().getDay()] + ', ' + dmy(t) + '</span></div>';
    h += '<section class="m-hero"><div class="m-hl">Today\'s sale</div><div class="m-hv num">' + money(sumBy(tod, function (x) { return x.total; })) + '</div>' +
      '<div class="m-hs">' + tod.length + ' bill(s) today · This month <b class="num">' + money(sumBy(mon, function (x) { return x.total; })) + '</b></div>' +
      '<div class="m-hc"><button type="button" data-act="mOpen" data-v="accounting" data-t="cash">Cash<b class="num">' + money(cb.cash) + '</b></button><button type="button" data-act="mOpen" data-v="accounting" data-t="cash">Bank<b class="num">' + money(cb.bank) + '</b></button></div></section>';
    h += '<div class="m-two"><button type="button" class="m-sum get" data-act="mOpen" data-v="accounting" data-t="recv"><span>' + ic('down') + 'To collect</span><b class="num">' + money(recv) + '</b><em>' + (over.length ? over.length + ' bill(s) overdue' : 'From customers') + '</em></button>' +
      '<button type="button" class="m-sum give" data-act="mOpen" data-v="accounting" data-t="pay"><span>' + ic('up') + 'To pay</span><b class="num">' + money(pay) + '</b><em>To suppliers</em></button></div>';
    var qa = [];
    if (canWrite('quick')) qa.push(['Quick Bill', 'bolt', 'nav', { v: 'quick' }]);
    if (canWrite('sales', 'invoice')) qa.push(['Invoice', 'bill', 'newDocGo', { t: 'invoice' }]);
    if (canWrite('sales', 'receipt')) qa.push(['Payment In', 'inr', 'newPay', { type: 'receipt' }]);
    if (canWrite('purchases', 'pinvoice')) qa.push(['Purchase', 'cart', 'newDocGo', { t: 'pinvoice' }]);
    if (canWrite('accounting')) qa.push(['Expense', 'wallet', 'goExp', {}]);
    if (canWrite('sales', 'quotation')) qa.push(['Quotation', 'doc', 'newDocGo', { t: 'quotation' }]);
    if (canWrite('parties')) qa.push(['Add Party', 'useradd', 'newParty', { side: 'customer' }]);
    qa = qa.slice(0, 7);
    h += '<section class="card m-card"><div class="m-gh"><h2>Create</h2></div><div class="m-qgrid">' + qa.map(function (x, i) { return tile(x, i === 0 ? 'pri' : ''); }).join('') +
      '<button type="button" class="m-qa" data-act="mCreate"><i>' + ic('plus') + '</i><span>More</span></button></div></section>';
    var al = '';
    if (over.length) al += '<button type="button" class="m-alert" data-act="goDoc" data-t="invoice" data-f="overdue">' + ic('alert') + '<span><b>' + over.length + ' bill(s) overdue</b>' + money(sumBy(over, function (x) { return outstanding(C, x); })) + ' to collect</span>' + ic('chev') + '</button>';
    if (low.length) al += '<button type="button" class="m-alert" data-act="mOpen" data-v="gst" data-t="lowstock">' + ic('box') + '<span><b>' + low.length + ' item(s) low on stock</b>' + esc(nameList(low.map(function (p) { return p.name; }), 2)) + '</span>' + ic('chev') + '</button>';
    h += homeActions(C, true) + al;
    if (typeof hmSearchH === 'function') h += hmSearchH(C);
    var secs = featureMap().map(function (g) { return [g.name, g.icon, 'mOpen', { v: g.v, t: g.items[0][3].t || '' }]; }).filter(function (x) { return x[0] !== 'Sales' || true; });
    secs.forEach(function (x) { if (x[0] === 'Sales') x[3] = { v: 'sales', t: 'invoice' }; });
    h += '<section class="card m-card"><div class="m-gh"><h2>Your business</h2>' + btn('mMenu', 'See all', {}, 'sm line') + '</div><div class="m-qgrid">' + secs.map(function (x) { return tile(x, 'sec'); }).join('') + '</div></section>';
    var docs = d.docs.filter(function (x) { return DT[x.type] && DT[x.type].items; }).sort(function (a, b) { return (b.date + b.no).localeCompare(a.date + a.no); }).slice(0, 8);
    h += '<section class="card m-card"><div class="m-gh"><h2>Recent</h2>' + (canView('sales') ? btn('mOpen', 'See all', { v: 'sales', t: 'invoice' }, 'sm line') : '') + '</div>' +
      (docs.length ? '<div class="m-list">' + docs.map(function (x) {
        var nm = partyName(C, x.partyId), st = statusOf(C, x), o = (x.type === 'invoice' || x.type === 'pinvoice') && !x.cancelled ? outstanding(C, x) : 0;
        return '<button type="button" class="m-row" data-act="view" data-id="' + x.id + '">' + avatar(nm) + '<span class="m-rm"><b>' + esc(nm) + '</b><em>' + esc(DT[x.type].label) + ' · ' + esc(x.no) + ' · ' + dmy(x.date) + '</em></span>' +
          '<span class="m-rr"><b class="num">' + money(x.total) + '</b>' + (o > 0 ? '<em class="warn-t">Due ' + money(o) + '</em>' : statusChip(st)) + '</span></button>';
      }).join('') + '</div>' : '<div class="empty">No bills yet. Tap Create to make your first bill.</div>') + '</section>';
    h += '<section class="card m-card"><h2>Sales, last 14 days</h2>' + hmSpark(C, 14) + '</section>';
    return h;
  };

  /* Android back button: close sheet, then draft, then go home, then exit */
  try {
    var CapApp = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
    if (CapApp && CapApp.addListener) CapApp.addListener('backButton', function () {
      if (!$('#modal').hidden) { closeModal(); return; }
      if (DB && DB.session && cur()) {
        if (S.draft) { S.draft = null; render(); return; }
        if (S.view !== 'dashboard') { A.nav({ v: 'dashboard' }); return; }
      }
      CapApp.exitApp();
    });
  } catch (e) { }
})();

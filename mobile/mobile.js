/* Bill DNA mobile layer: app-style shell (top bar + bottom tabs + sheets), mobile home, card lists.
   Injected inside the desktop app's scope by scripts/build-www.sh. Only active in the APK or on small screens. */
var MOB = !!window.BILLDNA_APK || !!(window.matchMedia && window.matchMedia('(max-width: 760px)').matches);
if (MOB) (function () {
  document.documentElement.classList.add('m');
  var IP = {
    home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h5v-6h4v6h5V10"/>',
    bill: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    box: '<path d="M3 7l9-4 9 4-9 4z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/>',
    grid: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
    inr: '<path d="M7 4h10M7 9h10M7 4c6 0 6 9 0 9h-1l8 7"/>',
    cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/><path d="M3 4h2l2.4 11h11l2-8H6"/>',
    wallet: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M16 14h2"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-4 3.4-6 6.5-6s5.7 2 6.5 6"/><path d="M16 4.5a3.5 3.5 0 010 7M18 14c2 .7 3.2 2.6 3.5 6"/>',
    useradd: '<circle cx="10" cy="8" r="3.5"/><path d="M3.5 20c.8-4 3.4-6 6.5-6s5.7 2 6.5 6"/><path d="M19 8v6M16 11h6"/>',
    tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.3"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    doc: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
    spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/>',
    swap: '<path d="M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>',
    out: '<path d="M9 21H5V3h4M16 17l5-5-5-5M21 12H9"/>',
    alert: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/>',
    chev: '<path d="M9 6l6 6-6 6"/>',
    back: '<path d="M15 6l-6 6 6 6"/>',
    down: '<path d="M12 4v12M6 11l6 6 6-6M5 20h14"/>',
    up: '<path d="M12 20V8M6 13l6-6 6 6M5 4h14"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>'
  };
  function ic(n, cls) { return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (IP[n] || '') + '</svg>'; }
  var TITLES = { dashboard: 'Home', quick: 'New Bill', sales: 'Sales', purchases: 'Purchases', parties: 'Parties', inventory: 'Items', accounting: 'Money', gst: 'Reports', crm: 'Insights', settings: 'Settings' };

  /* lists: every table becomes a card list (labels come from the table header) */
  table = function (head, rows, empty, foot, ids) {
    if (!rows.length) return '<div class="empty">' + esc(empty || 'Nothing here yet.') + '</div>';
    var lab = function (i) { return head[i] && head[i][0] ? ' data-label="' + esc(head[i][0]) + '"' : ''; };
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

  function tabBtn(v, label, icon) {
    if (!canView(v)) return '';
    var on = S.view === v; return '<button type="button" class="m-tab' + (on ? ' on' : '') + '" data-act="nav" data-v="' + v + '"' + (on ? ' aria-current="page"' : '') + '>' + ic(icon) + '<span>' + esc(label) + '</span></button>';
  }
  shellH = function () {
    var C = cur();
    if (!canView(S.view)) S.view = 'dashboard';
    var home = S.view === 'dashboard', moreOn = ['purchases', 'parties', 'accounting', 'gst', 'crm', 'settings'].indexOf(S.view) >= 0;
    var bar = '<header class="m-top">' + (home ? '<div class="m-co"><b>' + esc(C.name) + '</b><span>FY ' + fyLabel(today()) + ' · ' + esc(role()) + '</span></div>'
      : '<button type="button" class="m-ib" data-act="nav" data-v="dashboard" aria-label="Back to home">' + ic('back') + '</button><div class="m-co"><b>' + esc(TITLES[S.view] || 'Bill DNA') + '</b><span>' + esc(C.name) + '</span></div>') +
      '<button type="button" class="m-ib" data-act="mMore" aria-label="Menu">' + ic('menu') + '</button></header>';
    var nav = '<nav class="m-nav" aria-label="Main">' + tabBtn('dashboard', 'Home', 'home') + tabBtn('sales', 'Sales', 'bill') +
      (canWrite('quick') ? '<button type="button" class="m-fab' + (S.view === 'quick' ? ' on' : '') + '" data-act="nav" data-v="quick" aria-label="New bill">' + ic('plus') + '<span>New Bill</span></button>' : '') +
      tabBtn('inventory', 'Items', 'box') + '<button type="button" class="m-tab' + (moreOn ? ' on' : '') + '" data-act="mMore">' + ic('grid') + '<span>More</span></button></nav>';
    return '<div class="shell m-shell v-' + esc(S.view) + '">' + bar + '<main class="main">' + V[S.view]() + '</main>' + (S.view === 'quick' ? qbBar() : '') + nav + '</div>';
  };

  function mTile(act, label, icon, data, cls) { return '<button type="button" class="m-qa ' + (cls || '') + '" data-act="' + act + '"' + dattr(data) + '><i>' + ic(icon) + '</i><span>' + esc(label) + '</span></button>'; }
  A.mMore = function () {
    var u = user(), it = [];
    if (canView('purchases')) it.push(['mGo', 'Purchases', 'cart', { v: 'purchases' }]);
    if (canView('parties')) it.push(['mGo', 'Parties', 'users', { v: 'parties' }]);
    if (canView('accounting')) it.push(['mGo', 'Money', 'wallet', { v: 'accounting' }]);
    if (canView('gst')) it.push(['mGo', 'Reports & GST', 'chart', { v: 'gst' }]);
    if (canView('crm')) it.push(['mGo', 'Insights', 'spark', { v: 'crm' }]);
    if (canView('settings')) it.push(['mGo', 'Settings', 'gear', { v: 'settings' }]);
    it.push(['mSwitch', 'Switch company', 'swap', {}], ['mOut', 'Sign out', 'out', {}]);
    modal('<div class="mh"><h2>Menu</h2>' + btn('closeModal', 'Close', {}, 'sm line') + '</div><div class="m-me">' + avatar(u.name) + '<div><b>' + esc(u.name) + '</b><span>' + esc(cur().name) + ' · ' + esc(role()) + '</span></div></div>' +
      '<div class="m-qgrid">' + it.map(function (x) { return mTile(x[0], x[1], x[2], x[3]); }).join('') + '</div>');
  };
  A.mGo = function (d) { closeModal(); A.nav(d); };
  A.mSwitch = function () { closeModal(); A.switchCo(); };
  A.mOut = function () { closeModal(); A.logout(); };
  A.mToBill = function () { var t = $('#qbtot') || $('#cart'); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'center' }); };
  A.mParties = function (d) { S.view = 'parties'; S.tab.parties = d.t; S.q = ''; S.draft = null; S.top = true; render(); };

  /* mobile home: summary, quick actions, alerts, recent activity */
  V.dashboard = function () {
    var C = cur(), d = C.d, t = today(), m = t.slice(0, 7);
    var inv = d.docs.filter(function (x) { return x.type === 'invoice' && !x.cancelled; });
    var tod = inv.filter(function (x) { return x.date === t; }), mon = inv.filter(function (x) { return x.date.slice(0, 7) === m; });
    var recv = sumBy(d.parties.filter(function (p) { return p.type === 'customer'; }), function (p) { return Math.max(0, partyBalance(C, p)); });
    var pay = sumBy(d.parties.filter(function (p) { return p.type === 'supplier'; }), function (p) { return Math.max(0, partyBalance(C, p)); });
    var over = inv.filter(function (x) { return x.due && x.due < t && outstanding(C, x) > 0; });
    var low = lowItems(C), cb = cashBank(C);
    var h = '<section class="m-hero"><div class="m-hl">Today\'s sale</div><div class="m-hv num">' + money(sumBy(tod, function (x) { return x.total; })) + '</div>' +
      '<div class="m-hs">' + tod.length + ' bill(s) today · This month <b class="num">' + money(sumBy(mon, function (x) { return x.total; })) + '</b></div>' +
      '<div class="m-hc"><span>Cash <b class="num">' + money(cb.cash) + '</b></span><span>Bank <b class="num">' + money(cb.bank) + '</b></span></div></section>';
    h += '<div class="m-two"><button type="button" class="m-sum get" data-act="mParties" data-t="customer"><span>' + ic('down') + 'You will get</span><b class="num">' + money(recv) + '</b><em>' + (over.length ? over.length + ' overdue bill(s)' : 'From customers') + '</em></button>' +
      '<button type="button" class="m-sum give" data-act="mParties" data-t="supplier"><span>' + ic('up') + 'You will pay</span><b class="num">' + money(pay) + '</b><em>To suppliers</em></button></div>';
    var qa = [];
    if (canWrite('quick')) qa.push(['nav', 'New Bill', 'bill', { v: 'quick' }, 'pri']);
    if (canWrite('sales', 'receipt')) qa.push(['newPay', 'Payment In', 'inr', { type: 'receipt' }]);
    if (canWrite('purchases', 'pinvoice')) qa.push(['newDocGo', 'Purchase', 'cart', { t: 'pinvoice' }]);
    if (canWrite('accounting')) qa.push(['goExp', 'Expense', 'wallet', {}]);
    if (canWrite('sales', 'quotation')) qa.push(['newDocGo', 'Quotation', 'doc', { t: 'quotation' }]);
    if (canWrite('inventory')) qa.push(['newProd', 'Add Item', 'tag', {}]);
    if (canWrite('parties')) qa.push(['newParty', 'Add Party', 'useradd', { side: 'customer' }]);
    if (canView('gst')) qa.push(['nav', 'Reports', 'chart', { v: 'gst' }]);
    h += '<section class="card m-card"><h2>Quick actions</h2><div class="m-qgrid">' + qa.map(function (x) { return mTile(x[0], x[1], x[2], x[3], x[4]); }).join('') + '</div></section>';
    var al = '';
    if (over.length) al += '<button type="button" class="m-alert" data-act="goDoc" data-t="invoice" data-f="overdue">' + ic('alert') + '<span><b>' + over.length + ' bill(s) overdue</b>' + money(sumBy(over, function (x) { return outstanding(C, x); })) + ' to collect</span>' + ic('chev') + '</button>';
    if (low.length) al += '<button type="button" class="m-alert" data-act="nav" data-v="inventory">' + ic('box') + '<span><b>' + low.length + ' item(s) low on stock</b>' + esc(nameList(low.map(function (p) { return p.name; }), 2)) + '</span>' + ic('chev') + '</button>';
    h += homeActions(C, true) + al;
    var docs = d.docs.filter(function (x) { return DT[x.type] && DT[x.type].items; }).sort(function (a, b) { return (b.date + b.no).localeCompare(a.date + a.no); }).slice(0, 10);
    h += '<section class="card m-card"><div class="bar"><h2>Recent transactions</h2>' + (canView('sales') ? btn('nav', 'See all', { v: 'sales' }, 'sm line') : '') + '</div>' +
      (docs.length ? '<div class="m-list">' + docs.map(function (x) {
        var nm = partyName(C, x.partyId), st = statusOf(C, x), o = (x.type === 'invoice' || x.type === 'pinvoice') && !x.cancelled ? outstanding(C, x) : 0;
        return '<button type="button" class="m-row" data-act="view" data-id="' + x.id + '">' + avatar(nm) + '<span class="m-rm"><b>' + esc(nm) + '</b><em>' + esc(DT[x.type].label) + ' · ' + esc(x.no) + ' · ' + dmy(x.date) + '</em></span>' +
          '<span class="m-rr"><b class="num">' + money(x.total) + '</b>' + (o > 0 ? '<em class="warn-t">Due ' + money(o) + '</em>' : statusChip(st)) + '</span></button>';
      }).join('') + '</div>' : '<div class="empty">No bills yet. Tap New Bill to make your first bill.</div>') + '</section>';
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

/* Bill DNA mobile: bill as a JPEG image (drawn on canvas, black/white + orange).
   Shown automatically after a new bill is saved, and from any bill via the "Bill image" button. */
if (MOB) (function () {
  var ACC = '#EE7417', INK = '#151515', MUTE = '#6b6a64', LINE = '#E2E0DA';
  var W = 1080, PAD = 64;
  function rsM(p) { return (p < 0 ? '-₹' : '₹') + (Math.abs(p || 0) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function font(w, s, mono) { return w + ' ' + s + 'px ' + (mono ? "'IBM Plex Mono', monospace" : "'IBM Plex Sans', system-ui, sans-serif"); }
  function wrap(ctx, text, maxW) {
    var words = String(text || '').split(/\s+/), lines = [], ln = '';
    words.forEach(function (w) { var t = ln ? ln + ' ' + w : w; if (ctx.measureText(t).width > maxW && ln) { lines.push(ln); ln = w; } else ln = t; });
    if (ln) lines.push(ln); return lines.length ? lines : [''];
  }
  function docTitle(C, d) { var t = DT[d.type]; return t.side === 's' && C.scheme === 'composition' && t.tax ? 'Bill of Supply' : t.side === 's' && C.scheme === 'notax' && t.tax ? 'Cash Bill' : t.label; }

  /* draws twice: first pass measures height, second pass paints */
  function paint(ctx, C, d, draw) {
    var t = DT[d.type], p = partyById(C, d.partyId) || {}, y = 0, x2 = W - PAD;
    var tx = function (s, x, yy, f, col, al) { if (!draw) return; ctx.font = f; ctx.fillStyle = col || INK; ctx.textAlign = al || 'left'; ctx.fillText(s, x, yy); };
    var rect = function (x, yy, w, h, col) { if (draw) { ctx.fillStyle = col; ctx.fillRect(x, yy, w, h); } };
    // header band
    ctx.font = font(400, 24);
    var addr = wrap(ctx, [C.address, C.phone].filter(Boolean).join(' · '), W - 2 * PAD - 300);
    var hh = 70 + 46 + addr.length * 32 + (C.gstin ? 34 : 0) + 34;
    rect(0, 0, W, hh, INK); rect(0, hh, W, 8, ACC);
    y = 70 + 40; tx(C.name, PAD, y, font(600, 44), '#fff');
    addr.forEach(function (l) { y += 34; tx(l, PAD, y, font(400, 24), '#cfcdc6'); });
    if (C.gstin) { y += 34; tx('GSTIN ' + C.gstin, PAD, y, font(500, 24, true), '#cfcdc6'); }
    tx(docTitle(C, d).toUpperCase(), x2, 110, font(600, 28), ACC, 'right');
    tx(d.no, x2, 152, font(500, 26, true), '#fff', 'right');
    tx(dmy(d.date), x2, 188, font(400, 24, true), '#cfcdc6', 'right');
    y = hh + 8 + 60;
    // bill to + dates
    tx(t.side === 'p' ? 'SUPPLIER' : 'BILL TO', PAD, y, font(600, 20), MUTE);
    var meta = [];
    if (d.due && t.side === 's') meta.push(['Due date', dmy(d.due)]);
    if (d.valid) meta.push(['Valid until', dmy(d.valid)]);
    if (d.sno) meta.push(["Supplier bill", d.sno]);
    meta.forEach(function (m, i) { tx(m[0].toUpperCase(), x2, y + i * 64, font(600, 20), MUTE, 'right'); tx(m[1], x2, y + i * 64 + 32, font(500, 26, true), INK, 'right'); });
    y += 40; tx(p.name || '-', PAD, y, font(600, 32));
    ctx.font = font(400, 24);
    wrap(ctx, [p.address, p.state].filter(Boolean).join(', '), 600).forEach(function (l) { if (!l) return; y += 32; tx(l, PAD, y, font(400, 24), MUTE); });
    if (p.gstin) { y += 32; tx('GSTIN ' + p.gstin, PAD, y, font(400, 24, true), MUTE); }
    if (p.phone) { y += 32; tx(p.phone, PAD, y, font(400, 24, true), MUTE); }
    y = Math.max(y, hh + 68 + meta.length * 64) + 48;
    // items table
    var cQty = 620, cRate = 800, cAmt = x2;
    rect(PAD, y, W - 2 * PAD, 56, '#F1F0EC');
    tx('ITEM', PAD + 20, y + 36, font(600, 20), MUTE); tx('QTY', cQty, y + 36, font(600, 20), MUTE, 'right'); tx('RATE', cRate, y + 36, font(600, 20), MUTE, 'right'); tx('AMOUNT', cAmt - 20, y + 36, font(600, 20), MUTE, 'right');
    y += 56;
    var tax = taxOn(C, t);
    (d.items || []).forEach(function (it, i) {
      ctx.font = font(500, 26);
      var nl = wrap(ctx, it.name, cQty - PAD - 150), sub = [it.hsn ? 'HSN ' + it.hsn : '', tax ? 'GST ' + it.gst + '%' : '', +it.disc ? 'Disc ' + it.disc + '%' : ''].filter(Boolean).join(' · ');
      var rh = 28 + nl.length * 34 + (sub ? 30 : 0) + 18;
      if (i % 2) rect(PAD, y, W - 2 * PAD, rh, '#FAFAF8');
      var yy = y + 44;
      nl.forEach(function (l, k) { tx(l, PAD + 20, yy + k * 34, font(500, 26)); });
      if (sub) tx(sub, PAD + 20, yy + nl.length * 34 - 4, font(400, 20), MUTE);
      tx(qtyF(it.qty) + (it.unit ? ' ' + it.unit : ''), cQty, yy, font(400, 24, true), INK, 'right');
      tx(rsM(it.rate).replace('₹', ''), cRate, yy, font(400, 24, true), INK, 'right');
      tx(rsM(it.taxable).replace('₹', ''), cAmt - 20, yy, font(500, 24, true), INK, 'right');
      y += rh; rect(PAD, y, W - 2 * PAD, 1, LINE);
    });
    y += 40;
    // totals
    var rows = [['Taxable value', d.sub]];
    if (tax) { if (d.inter) rows.push(['IGST', d.igst]); else rows.push(['CGST', d.cgst], ['SGST', d.sgst]); }
    if (t.tax && d.round) rows.push(['Round off', d.round]);
    var tl = 560;
    rows.forEach(function (r) { tx(r[0], tl, y, font(400, 24), MUTE); tx(rsM(r[1]), cAmt, y, font(400, 24, true), INK, 'right'); y += 40; });
    y += 4; rect(tl - 24, y, cAmt - tl + 24, 76, INK);
    tx('TOTAL', tl, y + 50, font(600, 26), '#fff'); tx(rsM(d.total), cAmt - 20, y + 51, font(600, 32, true), ACC, 'right');
    y += 76 + 44;
    if (d.type === 'invoice' || d.type === 'pinvoice') {
      var o = d.cancelled ? 0 : outstanding(C, d), live = C.d.payments.filter(function (q) { return !q.cancelled; });
      var adv = live.reduce(function (s2, q) { return s2 + (q.alloc && q.alloc[d.id] ? q.alloc[d.id] : 0); }, 0);
      var dsc = live.filter(function (q) { return q.refId === d.id; }).reduce(function (s2, q) { return s2 + (q.disc || 0); }, 0);
      var cr = C.d.docs.filter(function (x) { return x.refId === d.id && !x.cancelled && (x.type === 'creditnote' || x.type === 'preturn'); }).reduce(function (s2, x) { return s2 + x.total; }, 0);
      var paid = d.total - o - adv - dsc - cr;
      if (adv) { tx('Advance adjusted', tl, y, font(400, 24), MUTE); tx(rsM(adv), cAmt, y, font(400, 24, true), INK, 'right'); y += 40; }
      if (dsc) { tx(d.type === 'pinvoice' ? 'Discount received' : 'Discount allowed', tl, y, font(400, 24), MUTE); tx(rsM(dsc), cAmt, y, font(400, 24, true), INK, 'right'); y += 40; }
      if (cr) { tx('Returned', tl, y, font(400, 24), MUTE); tx(rsM(cr), cAmt, y, font(400, 24, true), INK, 'right'); y += 40; }
      tx('Paid', tl, y, font(400, 24), MUTE); tx(rsM(paid), cAmt, y, font(400, 24, true), INK, 'right'); y += 40;
      tx(o > 0 ? 'Balance due' : 'Fully paid', tl, y, font(600, 24), o > 0 ? ACC : INK); tx(rsM(o), cAmt, y, font(600, 24, true), o > 0 ? ACC : INK, 'right'); y += 40;
      var pp = partyById(C, d.partyId);
      if (d.type === 'invoice' && pp && !/walk-in/i.test(pp.name)) {
        var all = partyBalance(C, pp), prev = all - Math.max(0, o);
        if (prev > 0 && all > 0) { tx('Previous balance', tl, y, font(400, 24), MUTE); tx(rsM(prev), cAmt, y, font(400, 24, true), INK, 'right'); y += 40; rect(tl - 24, y - 26, cAmt - tl + 24, 2, LINE); y += 10; tx('Total due', tl, y, font(600, 26), ACC); tx(rsM(all), cAmt, y, font(600, 26, true), ACC, 'right'); y += 44; }
        else if (all < 0) { tx('Advance with us', tl, y, font(400, 24), MUTE); tx(rsM(-all), cAmt, y, font(400, 24, true), INK, 'right'); y += 40; }
      }
    }
    ctx.font = font(400, 22);
    wrap(ctx, amtWords(d.total), W - 2 * PAD).forEach(function (l) { y += 8; tx(l, PAD, y + 22, font(400, 22), MUTE); y += 30; });
    y += 20;
    // UPI QR + bank
    var bal = d.type === 'invoice' && !d.cancelled ? Math.max(0, outstanding(C, d)) : 0;
    if (bal && C.bank && /^[a-zA-Z0-9._-]{2,}@[a-zA-Z][a-zA-Z0-9.-]{1,}$/.test(String(C.bank.upi || '').trim())) {
      var m = upiMatrix(upiLink(C, d, bal)), n = m.length, sz = 220, cell = sz / (n + 6);
      rect(PAD, y, sz, sz, '#fff');
      if (draw) { ctx.fillStyle = '#000'; for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (m[r][c]) ctx.fillRect(PAD + (c + 3) * cell, y + (r + 3) * cell, Math.ceil(cell), Math.ceil(cell)); }
      tx('Scan to pay ' + rsM(bal), PAD + sz + 30, y + 80, font(600, 28));
      tx('Any UPI app · ' + C.bank.upi, PAD + sz + 30, y + 120, font(400, 22), MUTE);
      y += sz + 30;
    }
    if (C.bank && C.bank.acc && d.type === 'invoice') { tx('Bank: ' + [C.bank.name, 'A/c ' + C.bank.acc, 'IFSC ' + C.bank.ifsc].filter(Boolean).join(' · '), PAD, y + 10, font(400, 22), MUTE); y += 46; }
    if (d.notes) { ctx.font = font(400, 22); wrap(ctx, d.notes, W - 2 * PAD).forEach(function (l) { tx(l, PAD, y + 10, font(400, 22), MUTE); y += 32; }); y += 10; }
    // footer
    y += 30; rect(0, y, W, 96, '#F1F0EC');
    tx('Thank you for your business', PAD, y + 58, font(600, 24));
    tx('Made with Bill DNA', x2, y + 58, font(400, 20), MUTE, 'right');
    return y + 96;
  }
  function billJpeg(d) {
    var C = cur(), c = document.createElement('canvas'), ctx = c.getContext('2d');
    c.width = W; c.height = 10; var h = paint(ctx, C, d, false);
    c.height = Math.ceil(h); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, c.height); ctx.textBaseline = 'alphabetic';
    paint(ctx, C, d, true);
    return c.toDataURL('image/jpeg', 0.92);
  }
  function fontsReady() {
    try { return Promise.all([document.fonts.load(font(600, 20)), document.fonts.load(font(400, 20)), document.fonts.load(font(500, 20, true))]).catch(function () { }); } catch (e) { return Promise.resolve(); }
  }
  var IMG = { url: '', name: '' };
  function fileName(d) { return String(d.no || 'bill').replace(/[^A-Za-z0-9-]+/g, '_') + '.jpg'; }
  function showImage(d, fresh) {
    fontsReady().then(function () {
      var url; try { url = billJpeg(d); } catch (e) { toast('Could not make the bill image.', true); return; }
      IMG.url = url; IMG.name = fileName(d); IMG.id = d.id;
      modal('<div class="mh"><h2>' + (fresh ? 'Saved · ' : '') + esc(d.no) + '</h2>' + btn('closeModal', 'Close', {}, 'sm line') + '</div>' +
        '<div class="m-img"><img src="' + url + '" alt="Bill ' + esc(d.no) + '"></div>' +
        '<div class="m-imgacts">' + btn('mImgShare', 'Share', {}, 'pri') + btn('mImgSave', 'Save JPEG', {}, 'line') + '</div>' +
        '<div class="m-imgacts">' + btn('view', 'Bill details & PDF', { id: d.id }, 'line') + (fresh && canWrite('quick') ? btn('mDo', 'New bill', { a: 'nav', v: 'quick' }, 'line') : '') + '</div>');
    });
  }
  function b64() { return IMG.url.split(',')[1]; }
  function plugins() { var P = window.Capacitor && window.Capacitor.Plugins; return P || {}; }
  function saveFile() {
    var FS = plugins().Filesystem;
    if (!FS) return Promise.reject(new Error('nofs'));
    return FS.writeFile({ path: 'BillDNA/' + IMG.name, data: b64(), directory: 'DOCUMENTS', recursive: true });
  }
  function webDownload() { var a = document.createElement('a'); a.href = IMG.url; a.download = IMG.name; document.body.appendChild(a); a.click(); a.remove(); }
  A.mImgSave = function () {
    saveFile().then(function () { toast('Saved to Documents/BillDNA/' + IMG.name); }).catch(function (e) { if (plugins().Share) A.mImgShare(); else webDownload(); });
  };
  A.mImgShare = function () {
    var P = plugins(), FS = P.Filesystem, SH = P.Share;
    if (FS && SH) {
      FS.writeFile({ path: IMG.name, data: b64(), directory: 'CACHE' }).then(function (r) {
        return SH.share({ title: IMG.name, files: [r.uri], dialogTitle: 'Share bill' });
      }).catch(function (e) { if (!/cancel/i.test(String(e && e.message))) toast('Could not share. Try Save JPEG.', true); });
      return;
    }
    try {
      fetch(IMG.url).then(function (r) { return r.blob(); }).then(function (bl) {
        var f = new File([bl], IMG.name, { type: 'image/jpeg' });
        if (navigator.canShare && navigator.canShare({ files: [f] })) return navigator.share({ files: [f], title: IMG.name });
        webDownload();
      }).catch(function () { webDownload(); });
    } catch (e) { webDownload(); }
  };
  A.mImg = function (d) { var x = docById(cur(), d.id); if (x) showImage(x, false); };

  /* after a new bill is created, show it as an image */
  function newestItemsDoc(C, before) {
    if (C.d.docs.length <= before) return null;
    var d = C.d.docs[C.d.docs.length - 1]; return d && DT[d.type] && DT[d.type].items ? d : null;
  }
  ['qbSave', 'saveDoc'].forEach(function (k) {
    var orig = A[k]; if (!orig) return;
    A[k] = function () {
      var C = cur(), before = C ? C.d.docs.length : 0;
      var r = orig.apply(this, arguments);
      var d = C && newestItemsDoc(C, before); if (d) setTimeout(function () { showImage(d, true); }, 60);
      return r;
    };
  });
  /* every bill preview gets a "Bill image" button */
  var _view = A.view;
  A.view = function (d) {
    _view(d);
    var x = docById(cur(), d.id), mh = document.querySelector('#modal .mh');
    if (x && DT[x.type] && DT[x.type].items && mh && !mh.querySelector('[data-act="mImg"]')) {
      var b = document.createElement('div'); b.innerHTML = btn('mImg', 'Bill image', { id: x.id }, 'sm pri'); mh.insertBefore(b.firstChild, mh.lastChild);
    }
  };
})();

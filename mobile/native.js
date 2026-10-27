/* Bill DNA APK: phone file system. The Android app view cannot download blobs, share files through the
   browser API or print, so every Download / WhatsApp / Print / Backup goes through native plugins here. */
if (window.BILLDNA_APK && window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) (function () {
  var P = window.Capacitor.Plugins || {}, FS = P.Filesystem, SH = P.Share, AP = P.App;
  if (!FS) return;
  var DIR = 'BillDNA';
  function b64(data) {
    if (typeof data === 'string') data = new TextEncoder().encode(data);
    else if (!(data instanceof Uint8Array)) data = new Uint8Array(data);
    var s = '', CH = 0x8000;
    for (var i = 0; i < data.length; i += CH) s += String.fromCharCode.apply(null, data.subarray(i, i + CH));
    return btoa(s);
  }
  /* write to Documents/BillDNA (visible in the Files app); fall back to the app's own folder */
  function writeDoc(name, data, sub) {
    var path = DIR + (sub ? '/' + sub : '') + '/' + name, d64 = b64(data);
    return FS.writeFile({ path: path, data: d64, directory: 'DOCUMENTS', recursive: true })
      .then(function (r) { return { uri: r.uri, where: 'Documents/' + path }; })
      .catch(function () {
        return FS.writeFile({ path: path, data: d64, directory: 'EXTERNAL', recursive: true })
          .then(function (r) { return { uri: r.uri, where: 'Android/data/com.billdna.mobile/files/' + path }; });
      });
  }
  function writeCache(name, data) { return FS.writeFile({ path: 'share/' + name, data: b64(data), directory: 'CACHE', recursive: true }); }
  function shareUri(uri, name, text) {
    if (!SH) return Promise.reject(new Error('Share not available'));
    return SH.share({ title: name, text: text || undefined, files: [uri], dialogTitle: 'Send ' + name });
  }
  var LAST = null;
  function savedSheet(name, r) {
    LAST = r;
    modal('<div class="mh"><h2>File saved</h2>' + btn('closeModal', 'Close', {}, 'sm line') + '</div>' +
      '<div class="hint"><b>' + esc(name) + '</b><br>Saved in ' + esc(r.where) + '. Open the Files app › Documents › BillDNA to find it.</div>' +
      '<div class="m-imgacts">' + btn('nShareLast', 'Share / WhatsApp', {}, 'pri') + btn('closeModal', 'Done', {}, 'line') + '</div>');
  }
  A.nShareLast = function () { if (LAST) shareUri(LAST.uri, LAST.name || 'file').catch(shareErr); };
  function shareErr(e) { if (!/cancel/i.test(String(e && (e.message || e)))) toast('Could not open the share list. The file is saved in Documents/BillDNA.', true); }

  /* Download buttons (PDF, Excel, CSV, backup, reports) */
  browserSave = function (name, data) { writeDoc(name, data).then(function (r) { r.name = name; savedSheet(name, r); }, function () { toast('Could not save ' + name + ' on this phone.', true); }); };
  saveFile = async function (name, data) {
    try { var r = await writeDoc(name, data); r.name = name; savedSheet(name, r); }
    catch (e) { toast('Could not save ' + name + ' on this phone. Check storage space.', true); }
  };
  /* WhatsApp / share buttons: attach the real file */
  shareFile = async function (name, data, text) {
    try { var r = await writeCache(name, data); await shareUri(r.uri, name, text); }
    catch (e) { if (/cancel/i.test(String(e && (e.message || e)))) return; try { var s = await writeDoc(name, data); s.name = name; savedSheet(name, s); toast('Sharing did not open. The file is saved instead.', true); } catch (e2) { shareErr(e2); } }
  };
  /* Print: make the PDF and open the share list (pick your printer app, or Save to Drive) */
  A.print = function () {
    var C = cur(), id = S.mViewId, x = id && docById(C, id), pre = $('#modal .pre');
    if (x && pre && DT[x.type] && DT[x.type].items) {
      toast('Preparing PDF to print...');
      docPdf(x, COPYDOCS.indexOf(x.type) >= 0 ? pickedCopies(C) : null).then(function (buf) { return shareFile(fname(DT[x.type].label + ' ' + x.no, 'pdf'), buf, ''); }, function () { toast('Could not prepare the PDF.', true); });
      return;
    }
    toast('To print a report, press Download, choose PDF, then share it to your printer app.');
  };
  var _view = A.view; A.view = function (d) { S.mViewId = d.id; _view(d); };
  var _vp = A.viewPay; if (_vp) A.viewPay = function (d) { S.mViewId = null; _vp(d); };

  /* daily automatic backup to Documents/BillDNA/Backup, keeps the last 15 per company */
  function slug(s) { return String(s || 'company').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'company'; }
  function mobBak() { DB.mobBak = DB.mobBak || { last: '', at: '', where: '', on: true }; return DB.mobBak; }
  async function runBackup(force) {
    if (!DB || !DB.companies || !DB.companies.length) return false;
    var mb = mobBak(); if (!force && (mb.on === false || mb.last === today())) return false;
    var stamp = today() + '_' + new Date().toTimeString().slice(0, 5).replace(':', ''), where = '';
    try {
      for (var i = 0; i < DB.companies.length; i++) {
        var C = DB.companies[i]; var r = await writeDoc('billdna-backup-' + slug(C.name) + '-' + stamp + '.json', backupJson(C), 'Backup');
        where = r.where.replace(/\/[^\/]*$/, ''); C.lastBackup = today();
      }
      try {
        var ls = await FS.readdir({ path: DIR + '/Backup', directory: 'DOCUMENTS' }), names = (ls.files || []).map(function (f) { return f.name || f; }).sort();
        DB.companies.forEach(function (C) { var pre = 'billdna-backup-' + slug(C.name) + '-', mine = names.filter(function (n) { return n.indexOf(pre) === 0; }); mine.slice(0, Math.max(0, mine.length - 15)).forEach(function (n) { FS.deleteFile({ path: DIR + '/Backup/' + n, directory: 'DOCUMENTS' }).catch(function () { }); }); });
      } catch (e) { }
      mb.last = today(); mb.at = new Date().toISOString(); mb.where = where; mb.err = ''; save(); return true;
    } catch (e) { mb.err = 'Backup failed: ' + ((e && e.message) || 'storage error'); save(); return false; }
  }
  setTimeout(function () { runBackup(false); }, 5000);
  if (AP && AP.addListener) AP.addListener('appStateChange', function (s) { if (s && s.isActive === false) runBackup(false); });
  A.nBakNow = function () { toast('Backing up...'); runBackup(true).then(function (ok) { toast(ok ? 'Backup saved in ' + mobBak().where : (mobBak().err || 'Backup failed.'), !ok); render(); }); };
  A.nBakShare = function () { var C = cur(); writeCache(fname('billdna-backup-' + C.name, 'json'), backupJson(C)).then(function (r) { return shareUri(r.uri, 'Bill DNA backup', 'Bill DNA backup ' + C.name + ' ' + dmy(today())); }).catch(shareErr); };
  A.nBakToggle = function () { var mb = mobBak(); mb.on = mb.on === false; save(); render(); };
  abCardH = function () {
    var mb = mobBak();
    return '<div class="card" style="background:var(--bg)"><h2>Phone backup</h2>' +
      '<div class="' + (mb.last ? 'hint' : 'note') + '">' + (mb.last ? '<b>Last backup:</b> ' + esc(tmStr ? tmStr(mb.at) : mb.at) + '<br>Folder: ' + esc(mb.where || 'Documents/BillDNA/Backup') : 'No backup yet on this phone.') + (mb.err ? '<br><span class="warn-t">' + esc(mb.err) + '</span>' : '') + '</div>' +
      '<div class="note">Automatic backup runs once a day and keeps the last 15 copies in <b>Documents/BillDNA/Backup</b>. <b>Uninstalling the app deletes the data inside the app</b>, so keep these backup files or share one to Google Drive.</div>' +
      '<div class="row" style="margin:10px 0">' + btn('nBakNow', 'Back up now', {}, 'pri') + btn('nBakShare', 'Send backup to Drive / WhatsApp', {}, 'line') + btn('nBakToggle', mb.on === false ? 'Turn automatic backup on' : 'Turn automatic backup off', {}, 'line') + '</div></div>';
  };
  autoBackupStart = function () { };
})();

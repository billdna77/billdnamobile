const { JSDOM } = require('jsdom'); const fs = require('fs');
const HTML = fs.readFileSync(process.env.QA_HTML || (__dirname + '/mobile.html'), 'utf8');
exports.boot = function (store, pre) {
  const errors = [];
  const dom = new JSDOM('<!doctype html><html><body>' + HTML + '</body></html>', { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://qa.test/',
    beforeParse(w) { if (store) w.localStorage.setItem('billdna_web_v1', store); if (pre) pre(w); w.scrollTo = () => {}; w.print = () => {}; } });
  const w = dom.window; w.addEventListener('error', e => errors.push(e.message));
  const NAVV = [['dashboard','Home'],['quick','New Bill'],['sales','Sales'],['purchases','Purchases'],['parties','Customers and Suppliers'],['inventory','Items and Stock'],['accounting','Money'],['gst','Reports and GST'],['crm','CRM and Insights'],['settings','Settings']];
  const $ = s => w.document.querySelector(s), $$ = s => { if (s === '.nav button') { // mobile has no sidebar: expose the same destinations the role can open
      const can = w.__bdCanView; return NAVV.filter(n => !can || can(n[0])).map(n => ({ getAttribute: k => k === 'data-v' ? n[0] : null, textContent: n[1], click() { H.act('nav', '[data-v=' + n[0] + ']'); } })); }
    return [...w.document.querySelectorAll(s)]; };
  const H = { w, $, $$, errors,
    act(a, x) { let el = $('[data-act="' + a + '"]' + (x || ''));
      if (!el) { // mobile layout: menus live elsewhere; synthesize the same action
        const m = /^\[data-([a-z0-9-]+)=["']?([^"'\]]*)["']?\]$/i.exec(x || ''); if (x && !m) throw new Error('no act ' + a + (x || ''));
        el = w.document.createElement('button'); el.setAttribute('data-act', a); if (m) el.setAttribute('data-' + m[1], m[2]); w.document.body.appendChild(el); el.click(); el.remove(); return; }
      el.click(); },
    has(a, x) { return !!$('[data-act="' + a + '"]' + (x || '')); },
    submit(sel, vals) { const f = $(sel); if (!f) throw new Error('no form ' + sel); Object.keys(vals || {}).forEach(k => { const i = f.elements[k]; if (!i) throw new Error('no field ' + k); if (i.type === 'checkbox') i.checked = !!vals[k]; else i.value = vals[k]; }); f.dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true })); },
    ev(el, t) { el.dispatchEvent(new w.Event(t, { bubbles: true })); },
    set(sel, v, t) { const el = $(sel); if (!el) throw new Error('no el ' + sel); el.value = v; H.ev(el, 'input'); if (el.tagName === 'SELECT' || t === 'change') H.ev(el, 'change'); },
    txt() { return $('#app').textContent.replace(/\s+/g, ' '); },
    toast() { return $('#toast').textContent; },
    db() { return JSON.parse(w.localStorage.getItem('billdna_web_v1')); },
    store() { return w.localStorage.getItem('billdna_web_v1'); },
    co() { const d = H.db(); return d.companies.find(c => c.id === d.session.companyId) || d.companies[0]; }
  };
  return new Promise(r => setTimeout(() => r(H), 300));
};

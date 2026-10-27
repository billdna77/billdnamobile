# Mobile QA
- `harness.js` + `m100.js`: jsdom suite for the mobile build. Copy both into `billdna/qa-m/` (a copy of `billdna/qa`), build `qa-m/mobile.html` as
  `(cat app/p1.html; echo "window.BILLDNA_APK=true;"; cat <mobile>/www/app.js; echo '</script>') > qa-m/mobile.html`, then `node m100.js`.
  Enters 130+ entries through the app's screens, checks every bill/stock/party/GST/cash number independently, and compares all 59 screens with the desktop build.
- The desktop suites (`e2e.js`, `deep.js`, `audit2.js`, `gov.js`, `multi.js`, `shop.js`, ...) run unchanged in `qa-m` against the mobile build.
- `nat.js`, `wa.js`, `crawl2.js`: Playwright checks with mocked Android plugins (files, share, WhatsApp direct send, every screen action).

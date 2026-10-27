# Bill DNA — Android app
Capacitor wrapper of the Bill DNA web app (desktop source: billdna77/billdna `desktop/`).
- `mobile/app.base.js` : copy of desktop `app.js`
- `mobile/mobile.js` + `mobile/mobile.css` : mobile layer (bottom tabs, app home, card lists, bottom sheets, back button)
- `scripts/build-www.sh` : builds `www/` (injects the mobile layer into the app)
- Every push to `main` builds the APK → https://github.com/billdna77/billdnamobile/releases/download/latest/BillDNA.apk
- Update from desktop: copy new `desktop/app.js` to `mobile/app.base.js` (other desktop files into `www/`), push.

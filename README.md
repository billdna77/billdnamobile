# Bill DNA — Android app
Capacitor wrapper of the Bill DNA web app (source: billdna77/billdna `desktop/`).
- `www/` : web app copy (APK flag set in `www/config.js`)
- Every push to `main` builds `BillDNA.apk` in GitHub Actions → Actions tab → latest run → Artifacts.
- Update app: copy new `desktop/` files into `www/`, push.

#!/usr/bin/env bash
# Copy the latest desktop web app (billdna77/billdna desktop/) into the mobile build. Usage: scripts/sync-desktop.sh /path/to/billdna
set -e
SRC="${1:-../billdna}/desktop"
cd "$(dirname "$0")/.."
test -f "$SRC/app.js" || { echo "desktop app not found at $SRC"; exit 1; }
cp "$SRC/app.js" mobile/app.base.js
for f in styles.css index.html manifest.webmanifest robots.txt; do cp "$SRC/$f" www/$f; done
cp "$SRC/config.js" www/config.js
sed -i 's/window.BILLDNA_SW=true;/window.BILLDNA_SW=false;window.BILLDNA_APK=true;/' www/config.js
rm -rf www/lib www/fonts www/icons && cp -r "$SRC/lib" "$SRC/fonts" "$SRC/icons" www/
git -C "$SRC/.." log -1 --format='%h %s' > mobile/DESKTOP_VERSION
echo "synced desktop $(cat mobile/DESKTOP_VERSION)"

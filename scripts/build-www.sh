#!/usr/bin/env bash
# Builds www/app.js = desktop app.js (mobile/app.base.js) + mobile layer injected inside the app's scope.
set -e
cd "$(dirname "$0")/.."
python3 - <<'PY'
base=open('mobile/app.base.js',encoding='utf-8').read()
mob=open('mobile/mobile.js',encoding='utf-8').read()+'\n'+open('mobile/billimg.js',encoding='utf-8').read()
marker='initStore(boot);\n})();'
assert base.rstrip().endswith('initStore(boot);\n})();'), 'unexpected app.js tail'
i=base.rstrip().rfind(marker)
out=base[:i]+'/* ---------- mobile layer ---------- */\n'+mob+'\n'+base[i:]
open('www/app.js','w',encoding='utf-8').write(out)
html=open('www/index.html',encoding='utf-8').read()
if 'mobile.css' not in html:
    html=html.replace('<link rel="stylesheet" href="styles.css">','<link rel="stylesheet" href="styles.css">\n<link rel="stylesheet" href="mobile.css">')
    open('www/index.html','w',encoding='utf-8').write(html)
PY
cp mobile/mobile.css www/mobile.css
echo built

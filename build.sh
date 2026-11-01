#!/usr/bin/env bash
# Builds artifact.html (fragment for publishing), index.html (standalone page) and dev.html (with ?debug test hooks).
set -e
cd "$(dirname "$0")"
python tools/tr_build.py | head -5
HEAD='<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no"></head><body>'
pack() {
  cat src/page.html
  echo '<script>'
  echo "(()=>{'use strict';"
  for f in src/js/*.js; do
    if [ "$1" = "nodebug" ] && [[ "$f" == *debug* ]]; then continue; fi
    case "$(basename "$f")" in 000*) cat "$f" ;; *) python tools/i18n_wrap.py "$f" ;; esac; echo
  done
  echo '})();'
  echo '</script>'
}
pack nodebug > artifact.html
{ echo "$HEAD"; echo '<script>window.CATAKLEM_LOCAL=1</script>'; cat artifact.html; echo '</body></html>'; } > index.html
{ echo "$HEAD"; echo '<script>window.CATAKLEM_LOCAL=1</script>'; pack; echo '</body></html>'; } > dev.html
mkdir -p docs
{ echo "$HEAD"; cat artifact.html; echo '</body></html>'; } > docs/index.html
touch docs/.nojekyll
# desktop build: same page, fonts from the local folder instead of Google
mkdir -p desktop/app
{ echo "$HEAD"; echo '<script>window.CATAKLEM_PC=1</script>'; sed -e '/fonts.gstatic.com/d' -e '/rel="preconnect" href="https:\/\/fonts.googleapis.com"/d' -e 's#<link rel="stylesheet" href="https://fonts.googleapis.com[^>]*>#<link rel="stylesheet" href="fonts/fonts.css">#' artifact.html; echo '</body></html>'; } > desktop/app/index.html
echo "built: $(wc -c < artifact.html) bytes"

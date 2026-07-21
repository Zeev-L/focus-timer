#!/usr/bin/env bash
# Regenerate the macOS app icon from tools/icon.html.
# Produces build/icon.png (1024²) and build/icon.icns (used by electron-builder).
# Requires Google Chrome + macOS iconutil/sips. Run from the repo root:  bash tools/gen-icon.sh
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
mkdir -p "$ROOT/build"

"$CHROME" --headless=new --disable-gpu --hide-scrollbars --no-first-run \
  --user-data-dir=/tmp/fticon-gen --force-device-scale-factor=1 --window-size=1024,1024 \
  --default-background-color=00000000 \
  --screenshot="$ROOT/build/icon.png" "file://$ROOT/tools/icon.html" >/dev/null 2>&1

cd "$ROOT/build"
SET=icon.iconset; rm -rf "$SET"; mkdir "$SET"; M=icon.png
sips -z 16 16   "$M" --out "$SET/icon_16x16.png"      >/dev/null
sips -z 32 32   "$M" --out "$SET/icon_16x16@2x.png"   >/dev/null
sips -z 32 32   "$M" --out "$SET/icon_32x32.png"      >/dev/null
sips -z 64 64   "$M" --out "$SET/icon_32x32@2x.png"   >/dev/null
sips -z 128 128 "$M" --out "$SET/icon_128x128.png"    >/dev/null
sips -z 256 256 "$M" --out "$SET/icon_128x128@2x.png" >/dev/null
sips -z 256 256 "$M" --out "$SET/icon_256x256.png"    >/dev/null
sips -z 512 512 "$M" --out "$SET/icon_256x256@2x.png" >/dev/null
sips -z 512 512 "$M" --out "$SET/icon_512x512.png"    >/dev/null
cp "$M" "$SET/icon_512x512@2x.png"
iconutil -c icns "$SET" -o icon.icns
rm -rf "$SET"
echo "Wrote build/icon.png and build/icon.icns"

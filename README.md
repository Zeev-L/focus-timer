# Focus Timer 🍵

A small floating focus timer for macOS — a glassy disc that sits on top of everything, counts down, and gently warms in color as your time runs out. When the time is up it jumps to the front, plays a soft chime, and starts counting **overtime** (`+2:14`) so you can see exactly how far you've drifted past your planned block.

Built because it's easy to get swept up in work and lose track of time.

![Focus Timer](assets/screenshot.png)

## What it does

- **Floating disc** — always on top, drag it anywhere, remembers where you left it.
- **Glanceable** — big countdown + a ring that depletes, with a glowing dot running along it.
- **Ambient color cue** — the ring warms from mint → gold → coral as time runs out, so you notice in peripheral vision.
- **Overtime counter** — when time's up it counts *up* in a faded coral (`+M:SS`) until you dismiss it.
- **Jumps to the front + chime** when the timer ends, even if it was hidden behind other windows.
- **Edit on hover** — hover the disc, click the ✎, and set the duration (type any number of minutes), the disc size, and the language.
- **Hide / show** — tuck it away and bring it back instantly from the menu-bar icon or a global shortcut.
- **Hebrew / English** — switch in settings.

## Controls

| Action | How |
| --- | --- |
| Start / pause | Click the disc |
| Move | Drag the disc anywhere on screen |
| Edit (time / size / language) | Hover the disc → click ✎ |
| Reset after it ends | Click the disc |
| Hide the disc | ✎ → "Hide timer", the menu-bar ring icon, or `⌃⌥T` |
| Show it again | Click the menu-bar ring icon, or press `⌃⌥T` |
| Quit | Menu-bar icon → "Quit", or ✎ → "Quit" |

Settings (duration, size, language, position) are saved automatically and restored next launch.

### Hiding & bringing it back

The app lives in the **menu bar** (a small ring icon), so it keeps running even when the disc is hidden:

- **Hide:** click the disc's ✎ → "Hide timer", or click the menu-bar icon, or press **⌃⌥T** (Control-Option-T).
- **Show:** click the menu-bar icon again, or press **⌃⌥T**.

Hiding never loses your timer — it keeps running in the background and reappears where you left it.

## Run it

Requires [Node.js](https://nodejs.org) (v18+). Check with `node -v`; if it's missing, install it (`brew install node`).

```bash
git clone https://github.com/Zeev-L/focus-timer.git
cd focus-timer
npm install
npm start
```

`npm start` opens the timer — a small glassy disc that floats near the center of the screen (drag it wherever you like). **The disc stays open only while that terminal/`npm start` is running.** Closing the terminal quits the app. For an always-available version you can double-click, build the standalone app below.

> The window has no frame or Dock icon on purpose — if you don't see it, it may be behind another window or off to the side. Move windows aside, or run `npm start` again.

## Standalone app (double-click, no terminal)

Build a real macOS `.app` you can keep in Applications:

```bash
npm run dist
```

The `.app` and a `.dmg` land in `dist/`. Because it isn't code-signed, the first launch needs **right-click → Open** (then "Open" in the dialog) — after that it opens normally. To quit: hover the disc → ✎ → "Quit app".

The app icon lives in `build/icon.icns` (source: `tools/icon.html`). To regenerate it after changing the design, run `bash tools/gen-icon.sh`.

## Troubleshooting

**`Error: Electron failed to install correctly` on `npm start`** — this happens when npm's script sandbox blocks Electron's post-install download, so the binary never lands. Fix it once:

```bash
# 1) run Electron's own installer to fetch the binary into its cache
node node_modules/electron/install.js

# 2) if node_modules/electron/dist/ still has no Electron.app, unzip the cached build into it:
ZIP=$(ls "$HOME/Library/Caches/electron/"*/electron-v*-darwin-*.zip | tail -1)
rm -rf node_modules/electron/dist && mkdir -p node_modules/electron/dist
unzip -q "$ZIP" -d node_modules/electron/dist

# 3) point Electron's loader at the binary
printf 'Electron.app/Contents/MacOS/Electron' > node_modules/electron/path.txt

npm start
```

On most machines `npm install && npm start` just works — this is only needed where the post-install step is sandboxed.

---

## 🤖 Install prompt (for a new machine / fresh Claude Code session)

Paste this into Claude Code (or any capable coding agent) on another Mac to get it running from scratch:

> Clone `https://github.com/Zeev-L/focus-timer` into `~/Desktop/focus-timer`. It's an Electron app (a floating always-on-top focus-timer disc for macOS). Make sure Node.js 18+ is installed (`node -v`); if not, install it via Homebrew (`brew install node`). Then run `npm install` inside the folder, and launch it with `npm start`. The app has no window frame — it's a small glassy circle that floats on top of everything. Hover it and click the pencil to set the duration, size, and language (Hebrew/English). If you'd like a double-clickable app instead of `npm start`, run `npm run dist` and open the `.app` from the `dist/` folder. Report back whether it launched and show a screenshot of the floating disc.

## License

MIT © Zeev-L

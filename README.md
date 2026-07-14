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
- **Hebrew / English** — switch in settings.

## Controls

| Action | How |
| --- | --- |
| Start / pause | Click the disc |
| Move | Drag the disc anywhere on screen |
| Edit (time / size / language) | Hover the disc → click ✎ |
| Reset after it ends | Click the disc |
| Quit | ✎ → "Quit app" |

Settings (duration, size, language, position) are saved automatically and restored next launch.

## Run it (development)

Requires [Node.js](https://nodejs.org) (v18+).

```bash
git clone https://github.com/Zeev-L/focus-timer.git
cd focus-timer
npm install
npm start
```

## Build a standalone .app (optional)

```bash
npm run dist
```

The packaged app + DMG land in `dist/`.

---

## 🤖 Install prompt (for a new machine / fresh Claude Code session)

Paste this into Claude Code (or any capable coding agent) on another Mac to get it running from scratch:

> Clone `https://github.com/Zeev-L/focus-timer` into `~/Desktop/focus-timer`. It's an Electron app (a floating always-on-top focus-timer disc for macOS). Make sure Node.js 18+ is installed (`node -v`); if not, install it via Homebrew (`brew install node`). Then run `npm install` inside the folder, and launch it with `npm start`. The app has no window frame — it's a small glassy circle that floats on top of everything. Hover it and click the pencil to set the duration, size, and language (Hebrew/English). If you'd like a double-clickable app instead of `npm start`, run `npm run dist` and open the `.app` from the `dist/` folder. Report back whether it launched and show a screenshot of the floating disc.

## License

MIT © Zeev-L

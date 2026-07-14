// Generates assets/trayTemplate.png — a small ring glyph for the macOS menu bar.
// Template image: black (RGB 0) with an alpha mask; macOS recolors it for light/dark.
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    let c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}
function png(S, draw) {
  const raw = Buffer.alloc((S * 4 + 1) * S);
  for (let y = 0; y < S; y++) {
    raw[y * (S * 4 + 1)] = 0;
    for (let x = 0; x < S; x++) {
      const a = draw(x, y);
      const o = y * (S * 4 + 1) + 1 + x * 4;
      raw[o] = 0; raw[o + 1] = 0; raw[o + 2] = 0; raw[o + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(S, 0); ihdr.writeUInt32BE(S, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
function ring(S) {
  const c = (S - 1) / 2, outer = S * 0.45, inner = S * 0.29;
  return png(S, (x, y) => {
    const d = Math.hypot(x - c, y - c);
    const cov = Math.max(0, Math.min(1, outer - d + 0.5)) * Math.max(0, Math.min(1, d - inner + 0.5));
    return Math.round(255 * cov);
  });
}
const dir = path.join(__dirname, '..', 'assets');
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'trayTemplate.png'), ring(18));
fs.writeFileSync(path.join(dir, 'trayTemplate@2x.png'), ring(36));
console.log('wrote assets/trayTemplate.png (18) and @2x (36)');

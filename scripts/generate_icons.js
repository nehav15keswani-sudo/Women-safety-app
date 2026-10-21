import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPng(width, height, r, g, b, innerR, innerG, innerB) {
  // Simple uncompressed or deflated RGBA PNG generator
  const buffer = Buffer.alloc(height * (width * 4 + 1));
  let offset = 0;

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.4;

  for (let y = 0; y < height; y++) {
    buffer[offset++] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const dist = Math.hypot(x - cx, y - cy);
      if (dist < radius) {
        // Shield inner
        buffer[offset++] = innerR;
        buffer[offset++] = innerG;
        buffer[offset++] = innerB;
        buffer[offset++] = 255;
      } else {
        // Background
        buffer[offset++] = r;
        buffer[offset++] = g;
        buffer[offset++] = b;
        buffer[offset++] = 255;
      }
    }
  }

  const deflated = zlib.deflateSync(buffer);

  function crc32(buf) {
    let crc = -1;
    for (let i = 0; i < buf.length; i++) {
      let byte = buf[i];
      for (let j = 0; j < 8; j++) {
        if ((crc ^ byte) & 1) {
          crc = (crc >>> 1) ^ 0xedb88320;
        } else {
          crc = crc >>> 1;
        }
        byte = byte >>> 1;
      }
    }
    return (crc ^ -1) >>> 0;
  }

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const crcVal = crc32(Buffer.concat([typeBuf, data]));
    crcBuf.writeUInt32BE(crcVal, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const ihdr = chunk('IHDR', ihdrData);
  const idat = chunk('IDAT', deflated);
  const iend = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Rose: #e11d48 (225, 29, 72), Dark: #0f172a (15, 23, 42)
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192, 15, 23, 42, 225, 29, 72));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512, 15, 23, 42, 225, 29, 72));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512, 15, 23, 42, 244, 63, 94));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, 15, 23, 42, 225, 29, 72));
console.log('Icons generated successfully in public/');

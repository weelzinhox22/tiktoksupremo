import fs from 'node:fs';
import path from 'node:path';

const srcDir = path.resolve('node_modules/@ffmpeg/core/dist/esm');
const destDir = path.resolve('public/ffmpeg');

if (fs.existsSync(srcDir)) {
  fs.mkdirSync(destDir, { recursive: true });
  const files = ['ffmpeg-core.js', 'ffmpeg-core.wasm'];
  for (const file of files) {
    const srcFile = path.join(srcDir, file);
    const destFile = path.join(destDir, file);
    if (fs.existsSync(srcFile)) {
      fs.copyFileSync(srcFile, destFile);
      console.log(`[FFmpeg Setup] Copiado ${file} -> public/ffmpeg/`);
    }
  }
} else {
  console.warn('[FFmpeg Setup] Avisos: node_modules/@ffmpeg/core/dist/esm não encontrado.');
}

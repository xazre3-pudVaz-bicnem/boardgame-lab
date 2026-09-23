/**
 * 旧公式サイトのお知らせ記事に貼られていた告知画像を、そのまま public/news に移す。
 * 画像は店舗自身がWixに載せていたもので、リニューアル後も同じ記事で使う。
 * 本文は各画像から読み取って src/data/news.ts に文字として持たせている。
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SRC = 'data/source/news/img';
const OUT = 'public/news';
const WIDTHS = [480, 960];

fs.mkdirSync(OUT, { recursive: true });

const out = {};
for (const file of fs.readdirSync(SRC)) {
  const key = file.replace(/\.(png|jpg|jpeg)$/i, '');
  const img = sharp(path.join(SRC, file));
  const meta = await img.metadata();
  for (const w of WIDTHS) {
    await sharp(path.join(SRC, file))
      .resize({ width: Math.min(w, meta.width), withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(path.join(OUT, `${key}-${w}.webp`));
  }
  const ratio = meta.height / meta.width;
  out[key] = { width: 960, height: Math.round(960 * ratio) };
  console.log(`${key}  ${meta.width}x${meta.height}`);
}
fs.writeFileSync('src/data/news-images.json', JSON.stringify(out, null, 2) + '\n');

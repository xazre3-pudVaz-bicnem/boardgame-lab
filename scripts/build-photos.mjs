// Optimise the store photos supplied by BODOlab. (assets-src/) into public/photos/.
// Source files are the shop's own LINE album; originals stay in assets-src/ (not served).
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'assets-src';
const OUT = 'public/photos';
const P = (n) => path.join(SRC, `LINE_ALBUM_店舗内写真_260920_${n}.jpg`);

// n -> { name, alt, crop? }  — every entry checked against the actual photo.
//
// 人の顔が写っている写真は使わない（店舗の指示、2026-09-27）。
// 集合写真・イベント時の店内・自撮りなどは、小さく写っているだけでもここに入れない。
// 使ってよいのは、無人の店内・盤面や手元のアップ・看板・入口のように、顔が写っていないものだけ。
// 除外した写真: 2,4,5,15,16,17,18,21,29,30,31,32,33,34,35,37,38（人物）、12（背景に人物）
const MAP = [
  { n: 39, name: 'room-empty', alt: '木のテーブルと黒い椅子が並ぶBODOlab.の店内。壁一面のボードゲーム棚' },
  { n: 36, name: 'game-catan-top', alt: '六角形タイルを並べた定番ボードゲームの盤面' },
  { n: 23, name: 'game-catan-hand', alt: 'ボードゲームの盤面にコマを置くプレイヤーの手元' },
  { n: 22, name: 'game-catan-close', alt: '木製コマが置かれたボードゲームの盤面のクローズアップ' },
  { n: 14, name: 'game-scenery', alt: '立体的な地形とミニチュアが並ぶボードゲームの盤面' },
  { n: 11, name: 'game-strategy', alt: 'タイルとカードを大きく広げた戦略系ボードゲームの盤面' },
  { n: 13, name: 'game-tokens', alt: 'コインとトークンが並ぶボードゲームの盤面' },
  { n: 19, name: 'game-grid', alt: '格子状のボードとチップを使うボードゲームのプレイ中の様子' },
  { n: 1, name: 'game-family', alt: 'カラフルなすごろく型ボードで遊ぶファミリー向けゲーム' },
  { n: 3, name: 'game-family-close', alt: 'キャラクターの立ちコマが並ぶファミリーゲームの盤面' },
  { n: 28, name: 'game-boxes', alt: 'テーブルに積まれたボードゲームの箱' },
  { n: 40, name: 'game-pawns', alt: 'カラフルな木製コマが並ぶボードゲームのクローズアップ' },
  { n: 41, name: 'chalkboard', alt: '「友達ができる場所 ボードゲームラボ」と営業時間が書かれた店頭の黒板' },
  { n: 9, name: 'entrance-stairs', alt: 'ビル3階のBODOlab.へ上がる階段と入口' },
  { n: 6, name: 'pano-a', alt: '店内を見渡したパノラマ写真。テーブル席とボードゲーム棚' },
  { n: 8, name: 'pano-b', alt: '窓側から見た店内のパノラマ写真' },
  { n: 10, name: 'pano-c', alt: 'ショップ側から見た店内のパノラマ写真' },
];

const LOGOS = [
  { n: 25, name: 'logo-lockup', alt: 'BODOlab.（ボードゲームラボ）ロゴ ― ボードゲームが遊べる場所' },
  { n: 26, name: 'logo-horizontal', alt: 'BODOlab.（ボードゲームラボ）横組みロゴ' },
];
const POSTERS = [{ n: 24, name: 'price-poster', alt: 'BODOlab.の営業時間と料金を掲示した店頭ポスター' }];

const WIDTHS = [480, 960, 1600];

async function emit(file, name, widths = WIDTHS, fit = 'inside') {
  if (!fs.existsSync(file)) throw new Error(`missing source: ${file}`);
  const meta = await sharp(file).metadata();
  const out = [];
  for (const w of widths) {
    if (w > meta.width * 1.05) continue;
    await sharp(file)
      .rotate()
      .resize({ width: w, fit, withoutEnlargement: true })
      .webp({ quality: 78, effort: 5 })
      .toFile(path.join(OUT, `${name}-${w}.webp`));
    out.push(w);
  }
  // always emit at least the native size
  if (out.length === 0) {
    await sharp(file).rotate().webp({ quality: 80 }).toFile(path.join(OUT, `${name}-${meta.width}.webp`));
    out.push(meta.width);
  }
  return { widths: out, width: meta.width, height: meta.height };
}

fs.mkdirSync(OUT, { recursive: true });
const manifest = {};

for (const item of [...MAP, ...POSTERS]) {
  const r = await emit(P(item.n), item.name);
  manifest[item.name] = { alt: item.alt, ...r, src: `/photos/${item.name}-${r.widths.at(-1)}.webp` };
  console.log(`${item.name}: ${r.width}x${r.height} -> ${r.widths.join(',')}`);
}
for (const item of LOGOS) {
  const r = await emit(P(item.n), item.name, [480, 960]);
  manifest[item.name] = { alt: item.alt, ...r, src: `/photos/${item.name}-${r.widths.at(-1)}.webp` };
  console.log(`${item.name}: ${r.width}x${r.height} -> ${r.widths.join(',')}`);
}

/*
 * ロゴマーク（フラスコ）。白地のロゴ画像からフラスコ部分だけを切り出す。
 * ヘッダーは背景が写真のときと白のときがあるため、白を透明に抜いて両方で使えるようにする。
 * （白地のまま置くと、写真の上で白い四角が浮いてしまう）
 */
const markCrop = { left: 52, top: 52, width: 348, height: 416 };
const flask = await sharp(P(26)).extract(markCrop).resize(512, 512, { fit: 'contain', background: '#ffffff' });

const { data, info } = await flask.raw().toBuffer({ resolveWithObject: true });
const rgba = Buffer.alloc(info.width * info.height * 4);
for (let i = 0, j = 0; i < data.length; i += info.channels, j += 4) {
  const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
  rgba[j] = r;
  rgba[j + 1] = g;
  rgba[j + 2] = b;
  // ほぼ白い画素だけを抜く。ロゴの水色（#7fd0f2 相当）は残る明るさに収まっている。
  const min = Math.min(r, g, b);
  rgba[j + 3] = min > 246 ? 0 : min > 232 ? Math.round(((246 - min) / 14) * 255) : 255;
}
await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
  .png()
  .toFile('public/logo-mark.png');

/*
 * ロゴの文字部分（横1行の「BODOlab.」）。料金ポスターの上部から切り出す。
 * 文字は黒、「O」「D」の中に水色が入るのが正しい配色。ヘッダーで文字を組んで色を付けると
 * 正式なロゴと違って見えるため、店舗の図版をそのまま使う（店舗の指摘、2026-10-02）。
 * 白地は透明に抜く。黒い文字なので、明るい背景の上でだけ使うこと。
 */
{
  const crop = { left: 180, top: 84, width: 440, height: 88 };
  const { data: wd, info: wi } = await sharp(P(24)).extract(crop).raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(wi.width * wi.height * 4);
  for (let i = 0, j = 0; i < wd.length; i += wi.channels, j += 4) {
    const [r, g, b] = [wd[i], wd[i + 1], wd[i + 2]];
    out[j] = r;
    out[j + 1] = g;
    out[j + 2] = b;
    const min = Math.min(r, g, b);
    out[j + 3] = min > 244 ? 0 : min > 222 ? Math.round(((244 - min) / 22) * 255) : 255;
  }
  await sharp(out, { raw: { width: wi.width, height: wi.height, channels: 4 } })
    .trim()
    .png()
    .toFile('public/logo-wordmark.png');
}

// アイコン類は背景が透明だと環境によって見えづらいので、白地のまま残す。
await sharp(P(26)).extract(markCrop).resize(180, 180, { fit: 'contain', background: '#ffffff' }).png().toFile('public/apple-touch-icon.png');
await sharp(P(26)).extract(markCrop).resize(32, 32, { fit: 'contain', background: '#ffffff' }).png().toFile('public/icon.png');

// Open Graph image: 無人の店内（room-empty）を 1200x630 で。
await sharp(P(39)).rotate().resize(1200, 630, { fit: 'cover', position: 'centre' }).jpeg({ quality: 82 }).toFile('public/og-image.jpg');

fs.writeFileSync('src/data/photos.json', JSON.stringify(manifest, null, 2));
console.log(`\nWROTE src/data/photos.json (${Object.keys(manifest).length} photos)`);

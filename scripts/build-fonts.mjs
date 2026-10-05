/**
 * 見出し用の丸ゴシック（Zen Maru Gothic、OFL-1.1）を public/fonts/ に用意する。
 *
 * 日本語フォントは字数が多く、next/font で読み込むと @font-face の定義だけで
 * 圧縮後60KBのCSSになり、それが最初の表示を止めていた（Lighthouse の LCP が 1秒以上悪化）。
 * そこで、文字の範囲ごとに分割されたフォント（@fontsource/zen-maru-gothic）を自前で配信し、
 * 定義のCSSは layout.tsx から「表示を止めない形」で後から読み込む。
 * 読み込み前はシステムフォントで表示され、届いたら丸ゴシックに置き換わる（font-display: swap）。
 *
 * 使うのは 700（太字）だけ。見出しはすべて太字なので 500 は入れていない。
 * 出力先はパッケージのバージョンを含むので、長期キャッシュ（immutable）にしてよい。
 *
 * `npm run build` / `npm run dev` の前に自動で実行される（package.json の prebuild / predev）。
 */

import fs from 'node:fs';
import path from 'node:path';

const PKG = 'node_modules/@fontsource/zen-maru-gothic';
const WEIGHT = 700;

const { version } = JSON.parse(fs.readFileSync(path.join(PKG, 'package.json'), 'utf8'));
const dirName = `zen-maru-${version}`;
const outDir = path.join('public/fonts', dirName);
const publicBase = `/fonts/${dirName}`;

/* 以前のバージョンの出力は消す */
if (fs.existsSync('public/fonts')) {
  for (const d of fs.readdirSync('public/fonts')) {
    if (d !== dirName) fs.rmSync(path.join('public/fonts', d), { recursive: true, force: true });
  }
}
fs.mkdirSync(outDir, { recursive: true });

/* woff2 だけを使う（woff は対象ブラウザに不要） */
const css = fs
  .readFileSync(path.join(PKG, `${WEIGHT}.css`), 'utf8')
  .replace(/src: url\(\.\/files\/([^)]+\.woff2)\) format\('woff2'\), url\([^)]+\) format\('woff'\);/g, (_, file) => {
    fs.copyFileSync(path.join(PKG, 'files', file), path.join(outDir, file));
    return `src: url(${publicBase}/${file}) format('woff2');`;
  })
  .replace(/\/\*[^*]*\*\/\n/g, '');

if (css.includes('./files/')) throw new Error('フォントCSSの書き換えに失敗しました（@fontsource の形式が変わった可能性）');

fs.writeFileSync(path.join(outDir, 'maru.css'), css);

/* layout.tsx が読むパス。バージョンが変わったときだけ差分が出る。 */
const manifest = `${JSON.stringify({ css: `${publicBase}/maru.css` }, null, 2)}\n`;
if (!fs.existsSync('src/data/fonts.json') || fs.readFileSync('src/data/fonts.json', 'utf8') !== manifest) {
  fs.writeFileSync('src/data/fonts.json', manifest);
}

const files = fs.readdirSync(outDir).filter((f) => f.endsWith('.woff2'));
console.log(`fonts: ${publicBase}/maru.css（${files.length} ファイル）`);

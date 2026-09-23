/**
 * 取得した画像を格子状に並べた確認用シートを作る。
 *
 *   node scripts/contact-sheet.mjs <出力先> <slug> <slug> ...
 *   node scripts/contact-sheet.mjs out.png --risky      出所の弱い28件
 *   node scripts/contact-sheet.mjs out.png --random 24  無作為に24件
 *
 * 画像とゲーム名の対応を目視で確かめるためのもの。サイトには出ない。
 * 番号だけ振って、対応表は標準出力に出す（画像に日本語を焼き込むとフォント依存になるため）。
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'data/source/game-images');
const raw = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/source/games-raw.json'), 'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.join(SRC, 'manifest.json'), 'utf8'));
const bySlug = new Map(raw.games.map((g) => [g.slug, g]));

const base = (u) => (String(u || '').match(/\/([^/]+)$/) || [, ''])[1];

const [, , outPath, ...args] = process.argv;
let slugs = [];

if (args[0] === '--risky') {
  slugs = raw.games
    .filter((g) => {
      const f = base(g.sourceImage);
      return f && !/^picture_/.test(f) && !/^noimage_game\./.test(f);
    })
    .map((g) => g.slug);
} else if (args[0] === '--random') {
  const n = Number(args[1] ?? 24);
  const pool = Object.keys(manifest).filter((k) => !k.startsWith('__'));
  // 実行のたびに同じ並びになるよう、名前順から等間隔で選ぶ
  pool.sort();
  const step = Math.max(1, Math.floor(pool.length / n));
  for (let i = 0; i < pool.length && slugs.length < n; i += step) slugs.push(pool[i]);
} else {
  slugs = args;
}

slugs = slugs.filter((s) => manifest[s] && fs.existsSync(path.join(SRC, manifest[s].file)));
if (!slugs.length) {
  console.error('対象がありません');
  process.exit(1);
}

const CELL = 190;
const COLS = Math.min(6, slugs.length);
const ROWS = Math.ceil(slugs.length / COLS);

const cells = [];
for (let i = 0; i < slugs.length; i++) {
  const buf = await sharp(path.join(SRC, manifest[slugs[i]].file))
    .resize(CELL - 16, CELL - 34, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .toBuffer();
  cells.push({
    input: buf,
    left: (i % COLS) * CELL + 8,
    top: Math.floor(i / COLS) * CELL + 26,
  });
  // 通し番号を焼き込む（数字だけなのでフォントに左右されない）
  const label = Buffer.from(
    `<svg width="${CELL}" height="22"><text x="8" y="16" font-family="monospace" font-size="15" fill="#003870">${i + 1}</text></svg>`,
  );
  cells.push({ input: label, left: (i % COLS) * CELL, top: Math.floor(i / COLS) * CELL + 2 });
}

await sharp({
  create: {
    width: COLS * CELL,
    height: ROWS * CELL,
    channels: 3,
    background: { r: 0xef, g: 0xeb, b: 0xe3 },
  },
})
  .composite(cells)
  .png()
  .toFile(outPath);

console.log(`${outPath}  (${slugs.length}件 / ${COLS}列)`);
for (let i = 0; i < slugs.length; i++) {
  const g = bySlug.get(slugs[i]);
  console.log(`${String(i + 1).padStart(3)}. ${(g?.nameJa ?? slugs[i]).slice(0, 26).padEnd(28)} ${slugs[i]}`);
}

/**
 * 取得したパッケージ画像を、サイトで使う形に変換する。
 *
 *   node scripts/build-game-images.mjs
 *
 * 入力  data/source/game-images/<slug>.<ext>（fetch-game-images.mjs が取得）
 * 出力  public/games/<slug>-320.webp, <slug>-480.webp
 *       src/data/game-images.json … slug ごとの実寸と、取り違え検出用のハッシュ
 *
 * 箱の形は縦長も横長もあるので、正方形に切らずに「収める」。
 * 余白は白ではなく淡いグレーにして、白背景の箱でも輪郭が分かるようにする。
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'data/source/game-images');
const OUT = path.join(ROOT, 'public/games');
/**
 * 320 … 一覧のカード（実寸160px前後・DPR2でちょうど）
 * 480 … 詳細ページのヘッダー（実寸224px・DPR2で448px）
 * これ以上大きくしても画面では違いが出ず、LCPだけ遅くなる。
 */
const SIZES = [320, 480];

/** 余白の色。globals.css の --color-paper-2 と揃えている。 */
const PAD = { r: 0xef, g: 0xeb, b: 0xe3, alpha: 1 };

/** これより小さい画像は、拡大するとつぶれるので採用しない */
const MIN_EDGE = 160;

const manifest = JSON.parse(fs.readFileSync(path.join(SRC, 'manifest.json'), 'utf8'));
const raw = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/source/games-raw.json'), 'utf8'));
const validSlugs = new Set(raw.games.map((g) => g.slug));

fs.mkdirSync(OUT, { recursive: true });

const out = {};
const problems = [];
const byHash = new Map();

for (const [slug, info] of Object.entries(manifest)) {
  if (slug.startsWith('__')) continue;
  if (!validSlugs.has(slug)) {
    problems.push(`${slug}: games-raw.json に無いslug`);
    continue;
  }

  const file = path.join(SRC, info.file);
  if (!fs.existsSync(file)) {
    problems.push(`${slug}: 取得ファイルが見つからない (${info.file})`);
    continue;
  }

  let meta;
  try {
    meta = await sharp(file).metadata();
  } catch (e) {
    problems.push(`${slug}: 画像として読めない (${e.message})`);
    continue;
  }

  if (!meta.width || !meta.height) {
    problems.push(`${slug}: 実寸が取れない`);
    continue;
  }
  if (Math.max(meta.width, meta.height) < MIN_EDGE) {
    problems.push(`${slug}: 画像が小さすぎる (${meta.width}x${meta.height})`);
    continue;
  }

  // 同じ画像が複数のゲームに割り当たっていないか。取り違えの手がかりになる。
  const hash = info.sha256 ?? crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  if (byHash.has(hash)) byHash.get(hash).push(slug);
  else byHash.set(hash, [slug]);

  for (const size of SIZES) {
    await sharp(file)
      .resize(size, size, { fit: 'contain', background: PAD, withoutEnlargement: false })
      .webp({ quality: size === 320 ? 76 : 80 })
      .toFile(path.join(OUT, `${slug}-${size}.webp`));
  }

  out[slug] = {
    // 元画像の縦横比。詳細ページで箱の形に合わせて表示するために持つ。
    w: meta.width,
    h: meta.height,
    hash: hash.slice(0, 16),
  };
}

/* 同じ画像を使い回しているゲームを洗い出す */
const dupes = [...byHash.entries()].filter(([, slugs]) => slugs.length > 1);

fs.writeFileSync(
  path.join(ROOT, 'src/data/game-images.json'),
  JSON.stringify({ generatedAt: new Date().toISOString(), source: 'bodoge.hoobby.net', images: out }, null, 0) + '\n',
);

const totalKB = SIZES.reduce(
  (a, s) => a + fs.readdirSync(OUT).filter((f) => f.endsWith(`-${s}.webp`)).reduce((b, f) => b + fs.statSync(path.join(OUT, f)).size, 0),
  0,
) / 1024;

console.log(`変換 ${Object.keys(out).length}件 / 全${raw.games.length}件`);
console.log(`画像なし（SVGのまま） ${raw.games.length - Object.keys(out).length}件`);
console.log(`出力サイズ 合計 ${(totalKB / 1024).toFixed(1)} MB`);

if (dupes.length) {
  console.log(`\n同じ画像が複数のゲームに使われている: ${dupes.length}組`);
  for (const [, slugs] of dupes.slice(0, 20)) console.log(`  - ${slugs.join(' / ')}`);
}
if (problems.length) {
  console.log(`\n取り込めなかったもの ${problems.length}件`);
  for (const p of problems.slice(0, 20)) console.log(`  - ${p}`);
}

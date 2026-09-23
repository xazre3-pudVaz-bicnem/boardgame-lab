/**
 * 608タイトルのパッケージ画像を取得する。
 *
 *   node scripts/fetch-game-images.mjs
 *
 * 取得元はボドゲーマの各ゲームページに載っている画像。
 * games-raw.json の sourceImage は、こちらが slug で取得したゲームレコードに
 * 紐づくURLそのものなので、別のゲームの画像が混ざる余地がない。
 * （一覧ページの画像と詳細ページの og:image が608件すべて同一ファイルであることも確認済み）
 *
 * 取得のしかた
 *   - robots.txt は全許可だが、1件ごとに間隔を空けて順番に取る
 *   - すでに落としてあるファイルは飛ばすので、途中で止めても続きから再開できる
 *   - noimage_game.png（ボドゲーマ側の「画像なし」プレースホルダ）は取得しない
 *
 * 出力
 *   data/source/game-images/<slug>.<ext>
 *   data/source/game-images/manifest.json  … slug・元URL・ハッシュ・実寸
 */

import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'data/source/game-images');
const MANIFEST = path.join(OUT, 'manifest.json');

/** CDNの変換パラメータ。長辺640pxあればカード・詳細どちらにも足りる。 */
const TRANSFORM = 'small_light(dw=640,da=l,ds=s,q=88,cc=FFFFFF)';
const DELAY_MS = 450;
const RETRIES = 3;

const raw = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/source/games-raw.json'), 'utf8'));

fs.mkdirSync(OUT, { recursive: true });
const manifest = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : {};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** 変換プレフィックスを外して、元ファイル名だけ取り出す */
function sourceFile(url) {
  const m = String(url || '').match(/\/([^/]+)$/);
  return m ? m[1] : '';
}

/** 取得したい大きさのURLを組み立てる */
function imageUrl(url) {
  const file = sourceFile(url);
  if (!file) return null;
  return `https://image-bodoge.cdn-hoobby.net/${TRANSFORM}/${file}`;
}

function download(url) {
  return new Promise((resolve) => {
    https
      .get(
        url,
        {
          headers: {
            'user-agent': 'Mozilla/5.0 (compatible; BODOlab-site-build/1.0; +https://www.boardgame-lab.com/)',
            referer: 'https://bodoge.hoobby.net/',
            accept: 'image/webp,image/jpeg,image/png,*/*',
          },
        },
        (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            res.resume();
            return resolve(download(new URL(res.headers.location, url).href));
          }
          const chunks = [];
          res.on('data', (c) => chunks.push(c));
          res.on('end', () =>
            resolve({ status: res.statusCode, type: res.headers['content-type'] ?? '', body: Buffer.concat(chunks) }),
          );
        },
      )
      .on('error', (e) => resolve({ status: 0, type: '', body: Buffer.alloc(0), error: e.code }));
  });
}

const extOf = (type, file) => {
  if (/webp/.test(type)) return 'webp';
  if (/png/.test(type)) return 'png';
  if (/jpe?g/.test(type)) return 'jpg';
  const m = file.match(/\.(jpe?g|png|webp)$/i);
  return m ? m[1].toLowerCase().replace('jpeg', 'jpg') : 'jpg';
};

/* ------------------------------------------------------------------ 実行 */

const targets = [];
const skipped = { placeholder: [], noUrl: [] };

for (const g of raw.games) {
  const file = sourceFile(g.sourceImage);
  if (!file) {
    skipped.noUrl.push(g.slug);
    continue;
  }
  // ボドゲーマ側で画像が登録されていないもの。落としても意味がない。
  if (/^noimage_game\./i.test(file)) {
    skipped.placeholder.push(g.slug);
    continue;
  }
  targets.push({ slug: g.slug, nameJa: g.nameJa, file, url: imageUrl(g.sourceImage) });
}

console.log(`対象 ${targets.length}件（画像なし ${skipped.placeholder.length}件 / URLなし ${skipped.noUrl.length}件）`);

let done = 0;
let fetched = 0;
let failed = [];

for (const t of targets) {
  done++;
  const have = manifest[t.slug];
  if (have && fs.existsSync(path.join(OUT, have.file))) continue;

  let res = null;
  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    res = await download(t.url);
    if (res.status === 200 && res.body.length > 800) break;
    await sleep(DELAY_MS * attempt * 2);
  }

  if (!res || res.status !== 200 || res.body.length <= 800) {
    failed.push({ slug: t.slug, status: res?.status, size: res?.body.length, error: res?.error });
    console.error(`  x ${t.slug} (${res?.status ?? 'ERR'})`);
    await sleep(DELAY_MS);
    continue;
  }

  const ext = extOf(res.type, t.file);
  const name = `${t.slug}.${ext}`;
  fs.writeFileSync(path.join(OUT, name), res.body);
  manifest[t.slug] = {
    file: name,
    sourceFile: t.file,
    sourceUrl: `https://bodoge.hoobby.net/games/${t.slug}`,
    bytes: res.body.length,
    sha256: crypto.createHash('sha256').update(res.body).digest('hex'),
  };
  fetched++;

  if (fetched % 25 === 0) {
    fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
    console.log(`  ${done}/${targets.length} 取得 ${fetched}件`);
  }
  await sleep(DELAY_MS);
}

manifest.__skipped = skipped;
fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));

console.log(`\n取得 ${fetched}件 / 既存 ${targets.length - fetched - failed.length}件 / 失敗 ${failed.length}件`);
if (failed.length) {
  console.log('失敗したもの:');
  for (const f of failed.slice(0, 20)) console.log(`  ${f.slug} ${f.status ?? ''} ${f.error ?? ''}`);
  console.log('もう一度実行すると、失敗した分だけ取り直します。');
}

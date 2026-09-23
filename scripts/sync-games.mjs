/**
 * ボドゲーマの店舗ページに登録されているタイトルを取り直し、手元の一覧との差分を報告する。
 *
 *   node scripts/sync-games.mjs
 *
 * 報告するだけで、games-raw.json は書き換えない。
 * 外部の登録が変わっただけで、店舗が持っていないゲームがサイトに自動追加されないようにするため。
 * 差分があれば exit 1 にするので、月に一度など定期的に実行して気づけるようにしておく。
 *
 * 追加が必要になったら
 *   1. 表示された slug を data/source/games-raw.json / games-detail.json に取り込む（取得スクリプトを再実行）
 *   2. content/games/ に本文を書く（本文が無いタイトルは check-games.mjs が止める）
 *   3. npm run images:fetch && npm run check:games
 */

import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';

const ROOT = process.cwd();
const LIST_URL = 'https://bodoge.hoobby.net/spaces/boardgame-lab/games';
const DELAY_MS = 1500;

const raw = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/source/games-raw.json'), 'utf8'));
const local = new Set(raw.games.map((g) => g.slug));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const get = (url) =>
  new Promise((resolve, reject) => {
    https
      .get(
        url,
        { headers: { 'user-agent': 'Mozilla/5.0 (compatible; BODOlab-site-sync/1.0; +https://www.boardgame-lab.com/)' } },
        (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            res.resume();
            return resolve(get(new URL(res.headers.location, url).href));
          }
          let d = '';
          res.setEncoding('utf8');
          res.on('data', (c) => (d += c));
          res.on('end', () => resolve({ status: res.statusCode, body: d }));
        },
      )
      .on('error', reject);
  });

/** 一覧ページからゲームの slug を拾う。ページ送りは ?page=N。新しい slug が出なくなったら終わり。 */
async function fetchAllSlugs() {
  const found = new Set();
  let reportedTotal = null;
  for (let page = 1; page <= 80; page++) {
    const { status, body } = await get(`${LIST_URL}?page=${page}`);
    if (status !== 200) break;
    if (reportedTotal == null) {
      const m = body.match(/([\d,]+)\s*個/);
      if (m) reportedTotal = Number(m[1].replace(/,/g, ''));
    }
    const before = found.size;
    for (const m of body.matchAll(/href="\/games\/([a-z0-9][a-z0-9-]*)"/g)) found.add(m[1]);
    if (found.size === before) break;
    await sleep(DELAY_MS);
  }
  return { slugs: found, reportedTotal };
}

const { slugs: remote, reportedTotal } = await fetchAllSlugs();

const added = [...remote].filter((s) => !local.has(s)).sort();
const removed = [...local].filter((s) => !remote.has(s)).sort();

console.log(`ボドゲーマの登録: ${remote.size}件${reportedTotal ? `（表示上は ${reportedTotal}件）` : ''}`);
console.log(`手元の一覧: ${local.size}件`);

if (remote.size < local.size * 0.5) {
  console.error('\n取得件数が少なすぎます。ページ構造が変わったか、アクセスが制限された可能性があります。差分の判定はしません。');
  process.exit(2);
}

if (!added.length && !removed.length) {
  console.log('\n差分はありません。');
  process.exit(0);
}
if (added.length) {
  console.log(`\nボドゲーマにあって手元に無いもの（追加候補） ${added.length}件`);
  for (const s of added) console.log(`  + ${s}  https://bodoge.hoobby.net/games/${s}`);
}
if (removed.length) {
  console.log(`\n手元にあってボドゲーマから消えたもの ${removed.length}件`);
  console.log('  （サイトからは自動では消しません。店舗で確認のうえ data/stock.json を unavailable にしてください）');
  for (const s of removed) console.log(`  - ${s}`);
}
process.exit(1);

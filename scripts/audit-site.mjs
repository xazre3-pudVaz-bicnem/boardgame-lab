/**
 * ビルド済みのHTMLを直接読んで、公開前に確認したいことをまとめて見る。
 *   - 内部リンクの行き先が存在するか（リンク切れ・ダミーリンク）
 *   - title / description / canonical / h1 が各ページにあるか、重複していないか
 *   - img に alt があるか
 *   - 旧サイトのURLがすべて生きているか
 */
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.join(process.cwd(), '.next/server/app');
const errors = [];
const warnings = [];

/** 出力された .html を集める（Next.js の App Router の出力構造に依存） */
function collect(dir, base = '') {
  const res = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) res.push(...collect(p, `${base}/${e.name}`));
    else if (e.name.endsWith('.html')) {
      const route = `${base}/${e.name.replace(/\.html$/, '')}`.replace(/\/index$/, '/');
      res.push({ route: route === '' ? '/' : route, file: p });
    }
  }
  return res;
}

const pages = collect(OUT).filter((p) => !p.route.startsWith('/_'));
const routes = new Set(pages.map((p) => decodeURIComponent(p.route.replace(/\/$/, '') || '/')));

console.log(`HTML: ${pages.length}ページ`);

const titles = new Map();
const descs = new Map();
let imgs = 0;
let noAlt = 0;
const linkTargets = new Map();

for (const { route, file } of pages) {
  const html = fs.readFileSync(file, 'utf8');
  const r = decodeURIComponent(route.replace(/\/$/, '') || '/');

  const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '';
  const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';
  const canonical = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1] ?? '';
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)];

  if (!title) errors.push(`${r}: title が無い`);
  if (!desc) errors.push(`${r}: description が無い`);
  else if (desc.length > 170) warnings.push(`${r}: description が長い（${desc.length}字）`);
  if (!canonical) errors.push(`${r}: canonical が無い`);
  if (h1s.length === 0) errors.push(`${r}: h1 が無い`);
  if (h1s.length > 1) errors.push(`${r}: h1 が ${h1s.length} 個ある`);

  if (title) titles.set(title, [...(titles.get(title) ?? []), r]);
  if (desc) descs.set(desc, [...(descs.get(desc) ?? []), r]);

  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    imgs++;
    if (!/\balt=/.test(m[0])) {
      noAlt++;
      errors.push(`${r}: alt の無い img`);
    }
  }

  for (const m of html.matchAll(/href="(\/[^"#?]*)"/g)) {
    const href = decodeURIComponent(m[1].replace(/\/$/, '') || '/');
    if (href.startsWith('/_next/')) continue;
    if (/\.(xml|txt|json|webp|jpg|png|ico|svg|css|js)$/.test(href)) continue;
    linkTargets.set(href, (linkTargets.get(href) ?? 0) + 1);
  }
  // 空リンク・ダミーリンクの検出
  for (const m of html.matchAll(/<a\b[^>]*href="(#|javascript:[^"]*|)"[^>]*>/g)) {
    if (m[1] !== '') errors.push(`${r}: ダミーリンク href="${m[1]}"`);
  }
}

/* リンク切れ */
const STATIC_OK = new Set(['/sitemap.xml', '/robots.txt', '/games-index.json']);
for (const [href, count] of linkTargets) {
  if (routes.has(href) || STATIC_OK.has(href)) continue;
  errors.push(`リンク切れ: ${href}（${count}箇所から参照）`);
}

/* 重複 */
for (const [t, rs] of titles) if (rs.length > 1) errors.push(`title が重複: "${t.slice(0, 50)}" → ${rs.join(', ')}`);
for (const [d, rs] of descs) if (rs.length > 1) errors.push(`description が重複: ${rs.join(', ')}`);

/* 旧サイトのURLが生きているか */
const LEGACY = ['/', '/system', '/access', '/contact', '/schedule', '/news', '/part-timejob'];
const LEGACY_NEWS = [
  '/news/社員の結婚式に伴う臨時休業のお知らせ',
  '/news/2024年6月からの平日の営業時間とプレイスペース料金の変更のお知らせ',
  '/news/【期間限定】マーダーミステリー「サツジンハイシン」プラン',
  '/news/アルバイト募集！',
  '/news/定休日のお知らせ',
  '/news/プレイスペース料金変更のお知らせ',
  '/news/営業時間のお知らせ',
];
for (const u of [...LEGACY, ...LEGACY_NEWS]) {
  if (!routes.has(u.replace(/\/$/, '') || '/')) errors.push(`旧URLが生きていない: ${u}`);
}

console.log(`img: ${imgs}件（alt無し ${noAlt}件）`);
console.log(`内部リンクの行き先: ${linkTargets.size}種類`);

if (warnings.length) {
  console.log(`\n警告 ${warnings.length}件`);
  for (const w of warnings.slice(0, 20)) console.log(`  - ${w}`);
  if (warnings.length > 20) console.log(`  ... 他 ${warnings.length - 20}件`);
}
if (errors.length) {
  console.error(`\nエラー ${errors.length}件`);
  const seen = new Set();
  for (const e of errors) {
    const k = e.replace(/^[^:]*: /, '');
    if (seen.has(k) && seen.size > 40) continue;
    seen.add(k);
  }
  for (const e of errors.slice(0, 40)) console.error(`  x ${e}`);
  if (errors.length > 40) console.error(`  ... 他 ${errors.length - 40}件`);
  process.exit(1);
}
console.log('\nOK: 公開前の確認をすべて通過しました。');

/**
 * generate-blog.mjs の SHOP_FACTS / ALLOWED_* が、src/data/shop.ts と食い違っていないか確かめる。
 *
 * 記事生成スクリプトは .ts を読めないので店舗情報を文字列で持っている。
 * 片方だけ直したまま記事を書き続けると、サイトの表示と記事の数字がずれるため、
 * ビルド前にここで止める。
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const shopTs = fs.readFileSync(path.join(ROOT, 'src/data/shop.ts'), 'utf8');
const genJs = fs.readFileSync(path.join(ROOT, 'scripts/generate-blog.mjs'), 'utf8');

const errors = [];

/** shop.ts から値を1つ取り出す（値はソースにそのまま書かれている前提） */
const grab = (re, label) => {
  const m = shopTs.match(re);
  if (!m) {
    errors.push(`shop.ts から ${label} を読み取れませんでした（正規表現を直してください）`);
    return null;
  }
  return m;
};

const weekday = grab(/weekday: v\(\{ open: '([\d:]+)', close: '([\d:]+)' \}/, '平日の営業時間');
const weekend = grab(/weekend: v\(\{ open: '([\d:]+)', close: '([\d:]+)' \}/, '土日祝の営業時間');
const early = grab(/earlyClose: v\('([\d:]+)'/, '早仕舞いの時刻');
const unit = grab(/unit: v\(\{ label: '1時間', normal: (\d+), share: (\d+) \}/, 'プレイ料金');
const caps = grab(
  /weekday: \{ normal: (\d+), share: (\d+) \},\s*\n\s*weekend: \{ normal: (\d+), share: (\d+) \}/,
  '上限料金',
);
const listed = grab(/listed: v\((\d+),/, '登録タイトル数');

/** 記事生成側にその文字列が入っているか */
const expectInFacts = (needle, label) => {
  if (!genJs.includes(needle)) errors.push(`generate-blog.mjs の SHOP_FACTS に「${needle}」がありません（${label}）`);
};

if (weekday) expectInFacts(`平日${weekday[1]}〜${weekday[2]}`, '平日の営業時間');
if (weekend) expectInFacts(`土日祝${weekend[1]}〜${weekend[2]}`, '土日祝の営業時間');
if (early) expectInFacts(`${early[1]}の時点`, '早仕舞いの時刻');
if (unit) expectInFacts(`1時間${unit[1]}円（相席可でのご利用は1時間${unit[2]}円）`, 'プレイ料金');
if (caps)
  expectInFacts(
    `上限は平日${Number(caps[1]).toLocaleString()}円（相席${Number(caps[2]).toLocaleString()}円）、土日祝${Number(caps[3]).toLocaleString()}円（相席${Number(caps[4]).toLocaleString()}円）`,
    '上限料金',
  );
if (listed) expectInFacts(`タイトル数は${listed[1]}`, '登録タイトル数');

/** 本文に許可している数値が、shop.ts の値と一致しているか */
const allowedPrices = genJs.match(/const ALLOWED_PRICES = \[([^\]]*)\]/)?.[1];
if (allowedPrices && unit && caps) {
  const want = [unit[1], unit[2], caps[1], caps[2], caps[3], caps[4]].map(Number).sort((a, b) => a - b);
  const got = allowedPrices
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b);
  if (JSON.stringify([...new Set(want)]) !== JSON.stringify([...new Set(got)]))
    errors.push(`ALLOWED_PRICES が shop.ts の料金と一致しません（期待 ${[...new Set(want)]} / 実際 ${[...new Set(got)]}）`);
}

const allowedHours = genJs.match(/const ALLOWED_HOURS = \[([^\]]*)\]/)?.[1];
if (allowedHours && weekday && weekend && early) {
  const want = [...new Set([weekday[1], weekday[2], weekend[1], weekend[2], early[1]])].sort();
  const got = [...new Set(allowedHours.match(/[\d:]+/g) ?? [])].sort();
  if (JSON.stringify(want) !== JSON.stringify(got))
    errors.push(`ALLOWED_HOURS が shop.ts の営業時間と一致しません（期待 ${want} / 実際 ${got}）`);
}

if (errors.length) {
  console.error('店舗情報の二重管理がずれています。');
  for (const e of errors) console.error(`  x ${e}`);
  process.exit(1);
}
console.log('OK: generate-blog.mjs の店舗情報は shop.ts と一致しています。');

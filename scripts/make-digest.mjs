/**
 * 紹介文を書くための下書き資料を作る。
 * ボドゲーマから取得した事実（人数・時間・年齢・メカニクス・紹介文）を1ゲーム1ブロックにまとめ、
 * 20件ずつのバッチに分けて data/digest/ に書き出す。
 *
 * ここで出力した refText は「事実確認のための参考」であって、そのまま掲載しない。
 * 本文は content/games/<slug>.json に書き下ろす。
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const raw = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/source/games-raw.json'), 'utf8'));
const detail = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/source/games-detail.json'), 'utf8'));
const built = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/games.json'), 'utf8'));
const bySlug = new Map(built.games.map((g) => [g.slug, g]));

const OUT = path.join(ROOT, 'data/digest');
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

// 人気順（＝サイト上で目に触れやすい順）に並べてから分割する
const order = [...raw.games].sort((a, b) => (bySlug.get(b.slug)?.popularity ?? 0) - (bySlug.get(a.slug)?.popularity ?? 0));

const BATCH = 20;
const CONTENT_DIR = path.join(ROOT, 'content/games');
const done = new Set();
if (fs.existsSync(CONTENT_DIR)) {
  for (const f of fs.readdirSync(CONTENT_DIR).filter((x) => x.endsWith('.json'))) {
    for (const slug of Object.keys(JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, f), 'utf8')))) done.add(slug);
  }
}

let n = 0;
const batches = [];
for (let i = 0; i < order.length; i += BATCH) batches.push(order.slice(i, i + BATCH));

batches.forEach((batch, bi) => {
  const lines = [];
  for (const r of batch) {
    const d = detail[r.slug] ?? {};
    const g = bySlug.get(r.slug);
    lines.push(`### ${r.slug}${done.has(r.slug) ? '  [済]' : ''}`);
    lines.push(`和名: ${g?.nameJa ?? r.nameJa}`);
    lines.push(`英名: ${g?.nameEn ?? r.nameEn ?? '-'}`);
    lines.push(
      `人数: ${g?.playersLabel ?? '不明'} / 時間: ${g?.timeLabel ?? '不明'} / 対象年齢: ${g?.minAge != null ? g.minAge + '歳〜' : '不明'} / 発売: ${r.year ?? '不明'}`,
    );
    lines.push(`判定ジャンル: ${g?.genreLabel ?? '-'} (${g?.genre ?? '-'}) / 重さ: ${g?.weight ?? '-'} / 初心者向き: ${g?.beginner ? 'yes' : 'no'}`);
    lines.push(`コレクション: ${(g?.collections ?? []).join(', ') || '-'}`);
    lines.push(`メカニクス: ${(d.mechanics ?? []).join(', ') || '-'}`);
    lines.push(`テーマ: ${(d.themes ?? []).join(', ') || '-'}`);
    lines.push(`デザイナー: ${(d.designers ?? []).join(', ') || '-'}`);
    if (d.tags?.length) lines.push(`タグ: ${d.tags.join(', ')}`);
    if (d.catch) lines.push(`参考キャッチ: ${d.catch}`);
    lines.push(`参考(事実確認用・転載禁止): ${(d.refText ?? "（紹介文なし）").slice(0, 480)}`);
    lines.push('');
    n++;
  }
  fs.writeFileSync(path.join(OUT, `batch-${String(bi + 1).padStart(2, '0')}.md`), lines.join('\n'));
});

console.log(`wrote ${batches.length} batches (${n} games) to data/digest/`);
console.log(`already written: ${done.size}`);

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

/**
 * ブログ記事。content/blog/*.md をビルド時に読む。
 *
 * 記事は scripts/generate-blog.mjs（Claude API）で1日1本まで追加され、
 * GitHub Actions が main に push する。品質ゲートを通らなかった案は書き出さない。
 *
 * お知らせ（/news）とは役割を分けている。
 *   /news … 店舗からの告知。過去の告知も日付つきで残す。
 *   /blog … 遊び方やエリアの読みもの。店舗の営業情報は断定せず /system へ誘導する。
 */

export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated?: string;
  category: string;
  tags: string[];
  /** 本文中で触れたゲームのslug。内部リンクに使う。 */
  games: string[];
  /** 記事の主題にしたクエリ。1記事1クエリで作り、重複を避ける。 */
  intent: string;
  body: string;
  /** 自動生成か手書きか。表示はしないが運用で見分けるために持つ。 */
  source: 'auto' | 'manual';
};

const DIR = path.join(process.cwd(), 'content/blog');

function readAll(): Post[] {
  if (!fs.existsSync(DIR)) return [];

  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const raw = fs.readFileSync(path.join(DIR, file), 'utf8');
      const { data, content } = matter(raw);
      return {
        slug: file.replace(/\.md$/, ''),
        title: String(data.title ?? ''),
        description: String(data.description ?? ''),
        date: String(data.date ?? ''),
        updated: data.updated ? String(data.updated) : undefined,
        category: String(data.category ?? 'ボードゲームの楽しみ方'),
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        games: Array.isArray(data.games) ? data.games.map(String) : [],
        intent: String(data.intent ?? ''),
        body: content.trim(),
        source: data.source === 'manual' ? 'manual' : 'auto',
      } satisfies Post;
    })
    .filter((p) => p.title && p.date && p.body)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

let cache: Post[] | null = null;

export function getAllPosts(): Post[] {
  if (!cache) cache = readAll();
  return cache;
}

export function getPost(slug: string): Post | null {
  return getAllPosts().find((p) => p.slug === slug) ?? null;
}

export function postCategories(): { name: string; count: number }[] {
  const map = new Map<string, number>();
  for (const p of getAllPosts()) map.set(p.category, (map.get(p.category) ?? 0) + 1);
  return [...map.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
}

/** 同じカテゴリ → 同じタグの順に近いものを選ぶ。 */
export function relatedPosts(post: Post, limit = 3): Post[] {
  return getAllPosts()
    .filter((p) => p.slug !== post.slug)
    .map((p) => ({
      p,
      score:
        (p.category === post.category ? 3 : 0) +
        p.tags.filter((t) => post.tags.includes(t)).length * 2 +
        p.games.filter((g) => post.games.includes(g)).length,
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || (a.p.date < b.p.date ? 1 : -1))
    .slice(0, limit)
    .map((x) => x.p);
}

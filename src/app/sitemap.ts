import type { MetadataRoute } from 'next';
import { AREAS } from '@/data/areas';
import { NEWS } from '@/data/news';
import { SCENES } from '@/data/scenes';
import { abs, SITE_URL_CONFIGURED } from '@/data/shop';
import { getAllPosts } from '@/lib/blog';
import { CONDITION_SLUGS, GAMES, genreList } from '@/lib/games';

/**
 * サイトマップ。
 * 本番ドメインが未設定のうちは空を返す（プレビューURLを登録させない）。
 */
export default function sitemap(): MetadataRoute.Sitemap {
  if (!SITE_URL_CONFIGURED) return [];

  const now = new Date();

  const fixed: [string, number, MetadataRoute.Sitemap[number]['changeFrequency']][] = [
    ['/', 1, 'weekly'],
    ['/games', 0.9, 'weekly'],
    ['/scene', 0.8, 'monthly'],
    ['/system', 0.9, 'monthly'],
    ['/access', 0.8, 'monthly'],
    ['/faq', 0.7, 'monthly'],
    ['/schedule', 0.7, 'weekly'],
    ['/news', 0.6, 'monthly'],
    ['/blog', 0.7, 'daily'],
    ['/contact', 0.5, 'yearly'],
    ['/part-timejob', 0.5, 'monthly'],
    ['/games/list', 0.5, 'monthly'],
  ];

  const posts = getAllPosts();

  return [
    ...fixed.map(([path, priority, changeFrequency]) => ({
      url: abs(path),
      lastModified: now,
      changeFrequency,
      priority,
    })),
    ...CONDITION_SLUGS.map((key) => ({
      url: abs(`/games/${key}`),
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...genreList().map((g) => ({
      url: abs(`/games/genre/${g.key}`),
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...SCENES.map((s) => ({
      url: abs(`/scene/${s.slug}`),
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...AREAS.map((a) => ({
      url: abs(`/area/${a.slug}`),
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...NEWS.map((n) => ({
      url: abs(`/news/${encodeURIComponent(n.slug)}`),
      lastModified: new Date(n.date),
      changeFrequency: 'yearly' as const,
      priority: 0.4,
    })),
    ...posts.map((p) => ({
      url: abs(`/blog/${p.slug}`),
      lastModified: new Date(p.updated ?? p.date),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
    ...GAMES.filter((g) => g.indexable).map((g) => ({
      url: abs(`/games/${g.slug}`),
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
  ];
}

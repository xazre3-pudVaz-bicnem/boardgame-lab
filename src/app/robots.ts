import type { MetadataRoute } from 'next';
import { SITE_URL, SITE_URL_CONFIGURED } from '@/data/shop';

/**
 * 本番ドメインが設定されていないプレビュー環境では、サイト全体をクロール対象外にする。
 * プレビューURLが誤ってインデックスされるのを構造的に防ぐため。
 */
export default function robots(): MetadataRoute.Robots {
  if (!SITE_URL_CONFIGURED) {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // 絞り込み結果は canonical で /games に寄せているが、クロール自体も減らしておく
        disallow: ['/games?', '/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

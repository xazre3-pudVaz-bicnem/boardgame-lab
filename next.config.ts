import type { NextConfig } from 'next';
import { redirects } from './src/lib/redirects';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // 親ディレクトリにも lockfile があるため、トレースの起点をこのプロジェクトに固定する
  outputFileTracingRoot: __dirname,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [96, 160, 240, 320, 420],
  },
  async redirects() {
    return redirects;
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      /* 見出し用フォント。パスにバージョンが入っているので、長期キャッシュにしてよい。 */
      {
        source: '/fonts/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      /*
       * Vercel の *.vercel.app ではページを検索エンジンに載せない。
       * 本番ドメインと同じ内容が重複して登録されるのを、ホスト名で機械的に防ぐ。
       * NEXT_PUBLIC_SITE_URL の有無に関係なく効くので、環境変数の設定ミスにも耐える。
       * 本番ドメイン（www.boardgame-lab.com）にはこのヘッダーは付かない。
       */
      {
        source: '/:path*',
        has: [{ type: 'host', value: '(?<sub>.*)\.vercel\.app' }],
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
};

export default nextConfig;

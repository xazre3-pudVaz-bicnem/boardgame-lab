import type { Redirect } from 'next/dist/lib/load-custom-routes';

/**
 * 旧サイト（Wix）のURLは原則そのまま残している。
 *   /          /system  /access  /contact  /schedule  /news  /news/<日本語スラッグ>  /part-timejob
 * のすべてが新サイトでも同じURLで生きているため、301が必要なのは下の例外だけ。
 *
 * 新設したページは旧サイトに存在しなかったURLなので、リダイレクトは不要。
 */
export const redirects: Redirect[] = [
  // 旧サイトのナビゲーション表記ゆれ。Wix側で /system に集約されていた導線を維持する。
  { source: '/price', destination: '/system', permanent: true },
  { source: '/fee', destination: '/system', permanent: true },
  { source: '/information', destination: '/access', permanent: true },
  { source: '/event', destination: '/schedule', permanent: true },
  { source: '/boardgame', destination: '/games', permanent: true },
  { source: '/boardgames', destination: '/games', permanent: true },
  { source: '/recruit', destination: '/part-timejob', permanent: true },
  { source: '/parttimejob', destination: '/part-timejob', permanent: true },
  // 旧サイトの検索結果ページ（Wix）から。
  { source: '/blog-1', destination: '/news', permanent: true },
];

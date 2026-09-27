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

  /*
   * 2026-09 のページ整理。検索意図が重なるページを統合し、自動抽出の「おすすめ」ページを廃止した。
   *   おすすめ系（初心者・カップル・パーティー・重量級・1人用）は、スタッフの確認なしに
   *   数値条件で「おすすめ」を名乗っていたため廃止し、内容が近いページへ移す。
   */
  { source: '/games/for-couples', destination: '/scene/indoor-date', permanent: true },
  { source: '/games/for-beginners', destination: '/scene/first-time', permanent: true },
  { source: '/games/party', destination: '/games/for-groups', permanent: true },
  { source: '/games/heavy', destination: '/games', permanent: true },
  { source: '/games/solo', destination: '/games', permanent: true },
  { source: '/scene/indoor', destination: '/scene/rainy-day', permanent: true },
  { source: '/scene/with-friends', destination: '/scene/group', permanent: true },
  { source: '/scene/hobby', destination: '/scene/solo', permanent: true },
  { source: '/area/nakatsu', destination: '/access', permanent: true },
];

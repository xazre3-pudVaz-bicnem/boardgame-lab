/**
 * このページの最上部が写真（暗い背景）であることの目印。
 *
 * ヘッダーは layout で描いているのでページの事情を知らない。
 * ここで置いた印を globals.css の body:has(...) が拾って、
 * 最上部にいる間のヘッダーの文字色を白に切り替える。
 * JSを介さないので、最初の描画から色が合う。
 */
export default function DarkHeader() {
  return <span data-dark-header hidden />;
}

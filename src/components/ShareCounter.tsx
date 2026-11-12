'use client';

import { useEffect, useState } from 'react';
import { shop } from '@/data/shop';

/**
 * 相席カウンター（店舗が Netlify で公開している在籍状況のページ）を iframe で埋め込む。
 * 店舗の依頼（2026-11-12）。中身は「相席中の人数」と「空席あり／なし」で、店舗の受付の記録から自動で更新される。
 *
 * - 埋め込み先のページは、iframe の幅が700px以上になると約3倍の大きさに切り替わる。
 *   こちらでは小さい表示だけを使うので、幅は 22rem（352px）までに抑える。
 * - 中身のパネルの高さは約206px＋上下の余白10pxずつ（2026-11-12 に実測）。高さを固定して、
 *   読み込んだときに下の要素が動かないようにする（CLS対策）。
 * - 外部のページで、Googleフォントや Google Apps Script への通信を含む。
 *   こちらの写真や文字の表示を遅らせないよう、ページの読み込みが終わって手が空いてから差し込む。
 * - sandbox で、埋め込み先からこのサイトの画面遷移やポップアップを起こせないようにしている。
 *   人数の取得（fetch）には自分のオリジンが要るので allow-same-origin は付ける（別ドメインなのでこのサイトには触れない）。
 */
const HEIGHT = 236;

export default function ShareCounter({ className = '' }: { className?: string }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancel = () => {};
    const start = () => {
      // Safari には requestIdleCallback が無いので、そのときは少し待つだけにする
      if (typeof window.requestIdleCallback === 'function') {
        const id = window.requestIdleCallback(() => setReady(true), { timeout: 3000 });
        cancel = () => window.cancelIdleCallback(id);
      } else {
        const id = window.setTimeout(() => setReady(true), 300);
        cancel = () => window.clearTimeout(id);
      }
    };
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
    return () => {
      window.removeEventListener('load', start);
      cancel();
    };
  }, []);

  return (
    <div className={`w-full max-w-[22rem] ${className}`} style={{ height: HEIGHT }}>
      {ready ? (
        <iframe
          src={shop.links.shareCounter}
          title="いま相席で遊んでいる人数と、空席の有無（自動で更新されます）"
          loading="lazy"
          sandbox="allow-scripts allow-same-origin"
          className="block h-full w-full border-0"
        />
      ) : (
        <noscript>
          <a href={shop.links.shareCounter} target="_blank" rel="noopener noreferrer" className="prose-link">
            いまの相席の人数を見る
          </a>
        </noscript>
      )}
    </div>
  );
}

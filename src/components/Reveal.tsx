'use client';

import { useEffect } from 'react';

/**
 * [data-reveal] が付いた要素を、ビューポートに入った時点で 1 回だけフェードインさせる。
 * CSS 側の .reveal は初期状態 opacity:0 なので、このスクリプトが動かない環境で
 * 内容が消えないよう、まず .reveal を「付ける」方式にしている（no-JS では常に表示）。
 */
export default function Reveal() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (reduce || !('IntersectionObserver' in window)) {
      targets.forEach((el) => el.setAttribute('data-shown', 'true'));
      return;
    }

    targets.forEach((el) => el.classList.add('reveal'));

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          const delay = Number(el.dataset.revealDelay ?? 0);
          window.setTimeout(() => el.setAttribute('data-shown', 'true'), delay);
          io.unobserve(el);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}

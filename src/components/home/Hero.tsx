import { getImageProps } from 'next/image';
import photos from '@/data/photos.json';

/**
 * ファーストビュー。
 * 指示によりヒーロー内にCTAボタンは置かない。写真とコピーだけで世界観を伝える。
 * 予約導線はヘッダーと、この下の各セクションに置く。
 *
 * スマホとPCで写真を変えているが、<Image> を2枚重ねて display で出し分けると
 * 両方が preload されて、スマホで使わないほうまで落としてしまう。
 * getImageProps で srcset だけ受け取り、<picture> の media で1枚だけ取りに行かせる。
 */

const SP = photos['hero-mobile'];
const PC = photos['hero-floor'];

export default function Hero() {
  const common = { fill: true, sizes: '100vw', priority: true, alt: '' } as const;
  const sp = getImageProps({ ...common, src: SP.src, quality: 68 }).props;
  const pc = getImageProps({ ...common, src: PC.src, quality: 72 }).props;

  return (
    <section className="relative isolate flex min-h-[86svh] items-end overflow-hidden bg-navy-deep sm:min-h-[92svh]">
      <picture className="absolute inset-0 -z-10">
        <source media="(min-width: 640px)" srcSet={pc.srcSet} sizes="100vw" />
        {/*
          スマホは縦位置で切り抜くので、天井ばかりにならないよう焦点を下げる（人物とテーブルが残る）。
          src は付けない。付けるとPCで <source> が採用されたあとに src の取得が始まって中断される。
        */}
        <img
          srcSet={sp.srcSet}
          sizes="100vw"
          alt={SP.alt}
          fetchPriority="high"
          decoding="async"
          className="h-full w-full object-cover object-[58%_68%] sm:object-[center_55%]"
        />
      </picture>

      {/* 文字の可読性を保つグラデーション。写真の表情は上半分に残す */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-deep/92 via-navy-deep/45 to-navy-deep/25"
      />

      <div className="relative mx-auto w-full max-w-[92rem] px-5 pt-32 pb-20 sm:px-8 sm:pb-24 lg:px-12 lg:pb-28">
        <p className="display text-[0.62rem] font-semibold tracking-[0.34em] text-cyan uppercase sm:text-[0.7rem]">
          Board Game Play Space — Osaka Nakatsu
        </p>

        <h1 className="display mt-6 text-[clamp(2.1rem,8.2vw,5.1rem)] leading-[1.18] font-bold tracking-[-0.02em] text-white">
          遊ぶ時間が、
          <br />
          もっと好きになる。
        </h1>

        <p className="mt-7 max-w-lg text-[0.92rem] leading-[2] text-white/82 sm:text-[1rem]">
          608種類のボードゲームと、ルールを説明してくれるスタッフがいる場所。
          <br className="hidden sm:block" />
          大阪・中津駅から徒歩3分、梅田から歩いて10分。
        </p>

        {/* スクロール案内。控えめに */}
        <div className="mt-14 flex items-center gap-3 sm:mt-20" aria-hidden="true">
          <span className="display text-[0.58rem] tracking-[0.3em] text-white/55 uppercase">Scroll</span>
          <span className="relative block h-px w-14 overflow-hidden bg-white/25">
            <span className="absolute inset-y-0 left-0 w-1/3 animate-[scrollhint_2.4s_var(--ease-out-expo)_infinite] bg-cyan" />
          </span>
        </div>
      </div>

      <style>{`@keyframes scrollhint{0%{transform:translateX(-100%)}60%,100%{transform:translateX(320%)}}`}</style>
    </section>
  );
}

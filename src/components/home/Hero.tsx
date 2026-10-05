import Photo from '@/components/Photo';
import { Container } from '@/components/ui';
import { shop } from '@/data/shop';

/**
 * ファーストビュー。
 *
 * 「のんびりできる、おしゃれなカフェのような雰囲気に」という店舗の要望で、
 * 写真に紺色を重ねた暗い全面ヒーローをやめ、生成りの地に写真を角丸で置く形にした。
 * ヘッダーのロゴ（黒い文字）もこの明るい地の上なら正しい色で見える。
 *
 * - 指示によりヒーロー内にCTAボタンは置かない。予約導線はヘッダーと下の各セクションにある。
 * - 飲食の販売はないので「カフェ」とは名乗らない。雰囲気は色・書体・余白で出す。
 * - 人の顔が写っている写真は使わない。
 */

/** ロゴの上にある3本のきらめき。見出しの飾りに使う。 */
function Sparkle() {
  return (
    <svg viewBox="0 0 48 22" className="h-5 w-11 text-amber" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round">
        <path d="M6 5l7 12" />
        <path d="M24 3v13" />
        <path d="M42 5l-7 12" />
      </g>
    </svg>
  );
}

export default function Hero() {
  const u = shop.pricing.unit.value;
  const facts = ['中津駅から歩いて3分', `1時間${u.normal}円・上限あり`, 'ふた付きの飲みものは持ち込みOK'];

  return (
    <section className="relative overflow-hidden bg-paper pt-24 sm:pt-32">
      {/* 写真の後ろに置く、やわらかい円 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -right-20 hidden h-[40rem] w-[40rem] rounded-full bg-paper-2 lg:block"
      />

      <Container size="wide" className="relative">
        <div className="grid items-center gap-12 pb-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.12fr)] lg:gap-16 lg:pb-28">
          <div>
            <Sparkle />
            <p className="mt-3 text-[0.85rem] font-medium tracking-[0.08em] text-caramel-ink">
              大阪・中津のボードゲームスペース
            </p>

            <h1 className="mt-4 text-[clamp(2.05rem,7.6vw,3.7rem)] leading-[1.4] font-bold text-ink">
              今日は、ゆっくり
              <br />
              ボードゲーム。
            </h1>

            <p className="mt-6 max-w-xl text-[0.98rem] leading-[2.1] text-ink-soft">
              棚から気になる箱を選んで、テーブルでのんびり。
              <br className="hidden sm:block" />
              ルールはスタッフが説明するので、はじめての方も手ぶらでどうぞ。
            </p>

            <ul className="mt-7 flex flex-wrap gap-2 text-[0.8rem] text-ink-soft">
              {facts.map((f) => (
                <li key={f} className="rounded-full border border-line bg-surface px-3.5 py-1.5">
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative pb-8 sm:pb-10">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] shadow-[0_18px_50px_-18px_rgba(75,56,45,0.35)]">
              <Photo
                name="room-empty"
                fill
                priority
                sizes="(max-width:1024px) 92vw, 52vw"
                className="object-cover"
              />
            </div>
            {/* 手前に重ねる小さな写真 */}
            <div className="absolute bottom-0 -left-1 w-[34%] -rotate-3 overflow-hidden rounded-2xl border-[5px] border-surface shadow-[0_12px_30px_-12px_rgba(75,56,45,0.45)] sm:-left-6">
              <div className="relative aspect-square">
                <Photo name="game-pawns" fill sizes="(max-width:1024px) 32vw, 18vw" className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* 次のセクションへ、ゆるい波でつなぐ（料金ポスターの波と同じ形） */}
      <svg
        viewBox="0 0 1440 56"
        preserveAspectRatio="none"
        className="relative block h-7 w-full text-surface sm:h-12"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M0 28c120-28 240-28 360 0s240 28 360 0 240-28 360 0 240 28 360 0v28H0z"
        />
      </svg>
    </section>
  );
}

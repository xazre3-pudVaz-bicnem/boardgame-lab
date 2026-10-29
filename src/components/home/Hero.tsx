import Photo from '@/components/Photo';
import { Container } from '@/components/ui';

/**
 * ファーストビュー。大きな店内写真と、短いコピーだけ。
 *
 * - 店舗の要望（のんびりできる、おしゃれなカフェのような雰囲気）に合わせ、明るい地に写真を大きく置く。
 *   背景の円・傾けた写真・波線のような飾りは置かない（Codex との検討で外した）。
 * - 指示によりヒーロー内にCTAボタンは置かない。予約導線はヘッダーと下の各セクションにある。
 * - 飲食の販売はないので「カフェ」とは名乗らない。
 * - 人の顔が写っている写真は使わない。
 *
 * スマホでは「見出し → 写真 → 業態と説明」の順に積み、写真が画面の上から200px前後で始まるようにする。
 * PCでは左に業態・見出し・説明、右に写真。
 */
/** 業態。スマホでは写真の下、PCでは見出しの上に出す（同じ文を2か所に置き、画面幅でどちらか一方だけ表示） */
const KIND = '大阪・中津のボードゲームプレイスペース＆ショップ';

export default function Hero() {
  return (
    <section className="bg-paper pt-24 pb-14 sm:pt-28 sm:pb-20">
      <Container size="wide">
        <div className="grid gap-x-14 gap-y-5 [grid-template-areas:'title'_'photo'_'text'] lg:grid-cols-[minmax(0,5fr)_minmax(0,9fr)] lg:grid-rows-[1fr_auto] lg:[grid-template-areas:'title_photo'_'text_photo']">
          <div className="self-end [grid-area:title]">
            <p className="mb-4 hidden text-[0.85rem] font-medium tracking-[0.06em] text-ink-soft lg:block">{KIND}</p>
            <h1 className="text-[2rem] leading-[1.45] font-bold text-ink sm:text-[2.6rem] lg:text-[3rem]">
              今日は、ゆっくり
              <br />
              ボードゲーム。
            </h1>
          </div>

          <div className="[grid-area:photo]">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
              <Photo name="room-empty" fill priority sizes="(max-width:1024px) 92vw, 62vw" className="object-cover" />
            </div>
          </div>

          <div className="max-w-md self-start [grid-area:text] lg:mt-6">
            <p className="mb-2 text-[0.85rem] font-medium tracking-[0.06em] text-ink-soft lg:hidden">{KIND}</p>
            <p className="text-[1rem] leading-[2] text-ink-soft">
              棚から気になる箱を選んで、テーブルでのんびり。ルールはスタッフが説明するので、はじめての方も手ぶらでどうぞ。
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

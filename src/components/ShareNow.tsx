import Link from 'next/link';
import ShareCounter from '@/components/ShareCounter';
import { Container } from '@/components/ui';
import { shop } from '@/data/shop';

/**
 * 「いま、相席で遊んでいる人」— 店舗の相席カウンター（ShareCounter）に、読み方の説明を添えたもの。
 *
 * 置いている場所
 *   - トップ：ヒーローのすぐ下（variant="band"）
 *   - 料金・ご利用案内：相席可の料金の横（variant="block"）
 *   - 1人で来る場合（/scene/solo）：本文の前（variant="block"）
 *
 * カウンターは営業時間外も表示が出たままで、閉店中でも「空席あり」と出ることがある（2026-11-12 に確認）。
 * そのまま来店されないよう、営業時間・早仕舞い・営業の変更の確認先（公式X）を必ず並べて出す。
 * 人数がどこから来ているか（店舗の仕組み）は確かめていないので、「自動で更新される」とだけ書く。
 */

const LEAD = '1人で来ても、受付で「相席可」を選べば、その場にいるお客様と同じテーブルで遊べます。';

function Note({ className = '' }: { className?: string }) {
  const wd = shop.hours.weekday.value;
  const we = shop.hours.weekend.value;
  return (
    <div className={`space-y-1.5 text-[0.85rem] leading-[1.9] text-ink-faint ${className}`}>
      <p>
        お店の相席カウンターを表示しています（自動で更新されます）。営業時間外も表示は出たままなので、「空席あり」でも営業中とは限りません。
      </p>
      <p>
        営業時間は平日 {wd.open}〜{wd.close}／土日祝 {we.open}〜{we.close}（{shop.hours.closedDays.value.join('・')}定休・祝日は営業）。
        {shop.hours.earlyCloseNote}営業の変更は
        <a href={shop.links.x} target="_blank" rel="noopener noreferrer" className="prose-link mx-0.5">
          公式X
        </a>
        でお知らせしています。
      </p>
    </div>
  );
}

type Props = {
  variant?: 'band' | 'block';
  /** 見出しのレベル。置く場所の見出し構造に合わせる */
  as?: 'h2' | 'h3';
  /** 「1人で来る場合」へのリンクと、相席の一言説明を出すか（/scene/solo 自身では、本文と重なるので出さない） */
  soloLink?: boolean;
  className?: string;
};

export default function ShareNow({ variant = 'block', as: H = 'h2', soloLink = true, className = '' }: Props) {
  const id = 'share-now';
  const solo = soloLink ? (
    <p className="mt-2 text-[0.92rem]">
      {/* 単独のリンクなので、指で押しやすい高さを取る */}
      <Link href="/scene/solo" className="prose-link inline-block py-2">
        1人で来る場合（相席について）
      </Link>
    </p>
  ) : null;

  if (variant === 'band') {
    return (
      <section aria-labelledby={id} className={`bg-paper pb-4 sm:pb-6 ${className}`}>
        <Container size="wide">
          {/*
            スマホ：見出し → カウンター → 注意書き の順（カウンターを文章の下に埋もれさせない）。
            PC：左に見出しと注意書き、右にカウンター。
          */}
          <div className="grid gap-x-14 gap-y-5 border-y border-line py-8 sm:py-10 md:grid-cols-[minmax(0,1fr)_22rem] md:[grid-template-areas:'head_counter'_'note_counter']">
            <div className="max-w-xl md:[grid-area:head] md:self-end">
              <H id={id} className="text-[1.3rem] leading-[1.5] font-bold text-ink sm:text-[1.5rem]">
                いま、相席で遊んでいる人
              </H>
              <p className="mt-3 text-[1rem] leading-[2] text-ink-soft [word-break:auto-phrase]">{LEAD}</p>
            </div>
            <ShareCounter className="mx-auto md:mx-0 md:self-center md:[grid-area:counter]" />
            <div className="max-w-xl md:[grid-area:note]">
              <Note />
              {solo}
            </div>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section aria-labelledby={id} className={className}>
      <H id={id} className="text-[1.1rem] leading-[1.5] font-bold text-ink">
        いま、相席で遊んでいる人
      </H>
      {soloLink ? <p className="mt-3 text-[0.95rem] leading-[1.9] text-ink-soft [word-break:auto-phrase]">{LEAD}</p> : null}
      <ShareCounter className="mt-4" />
      <Note className="mt-3" />
      {solo}
    </section>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import Photo from '@/components/Photo';
import { FaqList } from '@/components/home/HomeFaq';
import { Breadcrumbs, Button, Container, ConfirmNote, Eyebrow, PageHeader } from '@/components/ui';
import { HOME_FAQ } from '@/data/faq';
import { shop } from '@/data/shop';
import { breadcrumbSchema, buildMetadata, faqSchema, JsonLd } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: '料金・ご利用案内｜1時間600円・上限あり｜大阪 梅田中津のボードゲーム BODOlab.',
  description:
    'BODOlab.の料金とご利用方法です。プレイ料金は1時間600円（相席500円）、上限は平日2,500円・土日祝3,000円。学生20%引き、小学生半額、未就学児無料。ご予約方法、飲食のルール、営業時間もこちらで確認いただけます。',
  path: '/system',
  keywords: ['大阪 ボードゲーム 料金', 'ボードゲームカフェ 料金 大阪', '梅田 ボードゲーム 値段', 'BODOlab 料金'],
});

const crumbs = [{ name: 'ホーム', href: '/' }, { name: '料金・ご利用案内' }];

const u = shop.pricing.unit.value;
const c = shop.pricing.caps.value;
const wd = shop.hours.weekday.value;
const we = shop.hours.weekend.value;

export default function SystemPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <JsonLd data={faqSchema(HOME_FAQ)} />

      <PageHeader
        eyebrow="System"
        title="料金・ご利用案内"
        breadcrumbs={crumbs}
        lead="プレイ料金は1時間600円。上限があるので、長く遊んでも金額が読めます。はじめての方は「ご利用の流れ」からご覧ください。"
      />

      {/* ------------------------------------------------ 料金表（通常と相席可を1つの表で比べる） */}
      <section className="bg-paper py-12 sm:py-16">
        <Container>
          <h2 className="text-[clamp(1.45rem,3.4vw,1.85rem)] font-bold text-ink">プレイ料金</h2>

          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[30rem] border-y border-line text-left text-[0.98rem]">
              <caption className="sr-only">プレイ料金（1時間あたりと、1日の上限）</caption>
              <thead className="text-[0.8rem] text-ink-faint">
                <tr className="border-b border-line">
                  <th scope="col" className="py-3 pr-4 font-medium">
                    区分
                  </th>
                  <th scope="col" className="py-3 pr-4 text-right font-medium">
                    {u.label}あたり
                  </th>
                  <th scope="col" className="py-3 pr-4 text-right font-medium">
                    平日の上限
                  </th>
                  <th scope="col" className="py-3 text-right font-medium">
                    土日祝の上限
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-line">
                  <th scope="row" className="py-4 pr-4 font-bold text-ink">
                    通常
                  </th>
                  <td className="py-4 pr-4 text-right text-[1.15rem] font-bold text-ink tabular-nums">{u.normal}円</td>
                  <td className="py-4 pr-4 text-right tabular-nums">{c.weekday.normal.toLocaleString()}円</td>
                  <td className="py-4 text-right tabular-nums">{c.weekend.normal.toLocaleString()}円</td>
                </tr>
                <tr>
                  <th scope="row" className="py-4 pr-4 font-bold text-ink">
                    相席可
                  </th>
                  <td className="py-4 pr-4 text-right text-[1.15rem] font-bold text-ink tabular-nums">{u.share}円</td>
                  <td className="py-4 pr-4 text-right tabular-nums">{c.weekday.share.toLocaleString()}円</td>
                  <td className="py-4 text-right tabular-nums">{c.weekend.share.toLocaleString()}円</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 max-w-2xl text-[0.9rem] leading-[1.9] text-ink-soft">
            相席可は、ほかのお客様と同じテーブルで遊ぶことを希望される場合の料金です。相席は選択制なので、お連れ様だけで過ごしたい日は通常料金でご利用ください。
            上限の金額を超えて料金がかかることはありません。
          </p>

          <ul className="mt-8 max-w-2xl list-disc space-y-2 pl-5 text-[0.92rem] leading-[1.9] text-ink-soft marker:text-ink-faint">
            <li>
              学生の方は、お会計時に学生証をご提示いただくと{shop.pricing.studentDiscount.value}%引きの料金でご利用いただけます。
            </li>
            {shop.pricing.kids.value.map((k) => (
              <li key={k.label}>
                {k.label}のお客様は{k.rule}でご利用いただけます。
              </li>
            ))}
            <li>{shop.pricing.guaranteedHoursNote}</li>
            <li>{shop.pricing.privateHire.value}</li>
            <li>お支払いは{shop.payments.value.join('、')}に対応しています。</li>
          </ul>

          <p className="mt-6 text-[0.82rem] text-ink-faint">ご利用の目安は{shop.pricing.averageBudget.value}です。</p>
        </Container>
      </section>

      {/* ------------------------------------------------ ご利用の流れ（番号カードではなく、縦の文章で） */}
      <section className="cv-auto bg-surface py-16 sm:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-16">
            <h2 className="text-[clamp(1.45rem,3.4vw,1.85rem)] font-bold text-ink">ご利用の流れ</h2>
            <ol className="border-t border-line">
              {[
                {
                  t: 'ご予約（しなくても大丈夫です）',
                  d: '空席があれば、ご予約なしでもご利用いただけます。確実にお席を確保したい場合や人数が多い場合は、ご来店予約フォームからどうぞ。',
                },
                {
                  t: 'ご来店・受付',
                  d: '人数と、相席を希望されるかどうかをお伝えください。はじめての方は、その旨も教えていただけると助かります。',
                },
                {
                  t: 'ゲームを選んで、遊ぶ',
                  d: '棚からゲームを選んでください。遊ぶゲームが決まったら、スタッフがルールを説明します。',
                },
                {
                  t: 'お会計',
                  d: 'お帰りの際に、ご利用時間に応じて精算します。時間内であれば、何本遊んでも料金は変わりません。',
                },
              ].map((step) => (
                <li key={step.t} className="border-b border-line py-5">
                  <h3 className="text-[1.05rem] font-bold text-ink">{step.t}</h3>
                  <p className="mt-1.5 text-[0.95rem] leading-[1.95] text-ink-soft">{step.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------ 予約方法 */}
      <section id="reserve" className="cv-auto section-y bg-paper-2">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-16">
            <div>
              <Eyebrow>Reservation</Eyebrow>
              <h2 className="display mt-3 text-[clamp(1.4rem,3.6vw,2.1rem)] text-ink">ご予約方法</h2>
              <p className="text-pretty mt-6 text-[0.92rem] leading-[1.95] text-ink-soft">
                {shop.reservationNote}
              </p>
              <p className="text-pretty mt-4 text-[0.92rem] leading-[1.95] text-ink-soft">
                フォームで日時・人数・お名前・ご連絡先をご入力ください。内容を確認のうえ、こちらからご連絡します。
              </p>
              <p className="text-pretty mt-4 text-[0.85rem] leading-[1.95] text-ink-faint">
                {shop.rules.cancel}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href={shop.reservationUrl} variant="solid" external>
                  ご来店予約フォームへ
                </Button>
                <Button href="/contact" variant="outline">
                  ご予約以外のお問い合わせ
                </Button>
              </div>
            </div>

            <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
              <Photo
                name="room-empty"
                fill
                sizes="(max-width:1024px) 92vw, 42vw"
                className="object-cover"
              />
            </div>
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------ 営業時間 */}
      <section className="cv-auto section-y bg-paper">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <Eyebrow>Hours</Eyebrow>
              <h2 className="display mt-3 text-[clamp(1.4rem,3.6vw,2.1rem)] text-ink">営業時間</h2>
              <dl className="mt-8">
                <div className="spec-row">
                  <dt className="text-ink-soft">平日</dt>
                  <dd className="font-semibold text-ink">
                    {wd.open} – {wd.close}
                  </dd>
                </div>
                <div className="spec-row">
                  <dt className="text-ink-soft">{shop.hours.weekendNote}</dt>
                  <dd className="font-semibold text-ink">
                    {we.open} – {we.close}
                  </dd>
                </div>
                <div className="spec-row">
                  <dt className="text-ink-soft">定休日</dt>
                  <dd className="font-semibold text-ink">
                    {shop.hours.closedDays.value.join('・')}
                    <span className="ml-2 text-[0.78rem] font-normal text-ink-faint">
                      {shop.hours.closedDaysNote}
                    </span>
                  </dd>
                </div>
              </dl>
              <p className="mt-6 text-[0.82rem] leading-relaxed text-ink-soft">{shop.hours.earlyCloseNote}</p>
              <div className="mt-6">
                <ConfirmNote>{shop.hours.changeNote}</ConfirmNote>
              </div>
            </div>

            <div>
              <Eyebrow>Rules</Eyebrow>
              <h2 className="display mt-3 text-[clamp(1.4rem,3.6vw,2.1rem)] text-ink">ご飲食について</h2>
              <ul className="mt-8 space-y-3 text-[0.88rem] leading-[1.9] text-ink-soft">
                {shop.rules.food.map((r) => (
                  <li key={r} className="flex gap-2.5">
                    <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                    {r}
                  </li>
                ))}
                <li className="flex gap-2.5">
                  <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                  {shop.rules.minors}
                </li>
              </ul>

              <h3 className="display mt-10 text-[1.05rem] text-ink">ボードゲームの販売について</h3>
              <ul className="mt-4 space-y-3 text-[0.88rem] leading-[1.9] text-ink-soft">
                {shop.shopService.value.map((r) => (
                  <li key={r} className="flex gap-2.5">
                    <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-amber" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------ FAQ */}
      <section className="cv-auto section-y bg-surface">
        <Container size="narrow">
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="display mt-3 mb-8 text-[clamp(1.4rem,3.6vw,2.1rem)] text-ink">よくあるご質問</h2>
          <FaqList items={HOME_FAQ} />
          <p className="mt-6 text-[0.82rem]">
            <Link href="/faq" className="prose-link">
              その他の質問もこちらにまとめています
            </Link>
          </p>
          <div className="mt-10">
            <Breadcrumbs items={crumbs} />
          </div>
        </Container>
      </section>
    </>
  );
}

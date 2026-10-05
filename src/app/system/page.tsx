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

      {/* ------------------------------------------------ 料金表 */}
      <section className="section-y bg-paper">
        <Container>
          <Eyebrow>Price</Eyebrow>
          <h2 className="display mt-3 text-[clamp(1.4rem,3.6vw,2.1rem)] text-ink">プレイ料金</h2>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {/* 通常 */}
            <div className="rounded-2xl border border-line bg-white p-7 sm:p-9">
              <p className="text-[0.78rem] font-semibold tracking-wide text-ink-faint">通常のご利用</p>
              <p className="display mt-3 text-[2.6rem] leading-none text-cocoa">
                {u.normal}
                <span className="ml-1 text-[1rem] font-medium">円 / {u.label}</span>
              </p>
              <dl className="mt-7 space-y-0">
                <div className="spec-row">
                  <dt className="text-ink-soft">平日の上限</dt>
                  <dd className="font-semibold text-ink">{c.weekday.normal.toLocaleString()}円</dd>
                </div>
                <div className="spec-row">
                  <dt className="text-ink-soft">土日祝の上限</dt>
                  <dd className="font-semibold text-ink">{c.weekend.normal.toLocaleString()}円</dd>
                </div>
              </dl>
            </div>

            {/* 相席 */}
            <div className="rounded-2xl border border-caramel/30 bg-caramel-wash p-7 sm:p-9">
              <p className="text-[0.78rem] font-semibold tracking-wide text-caramel-ink">相席可でのご利用</p>
              <p className="display mt-3 text-[2.6rem] leading-none text-cocoa">
                {u.share}
                <span className="ml-1 text-[1rem] font-medium">円 / {u.label}</span>
              </p>
              <dl className="mt-7 space-y-0">
                <div className="spec-row border-caramel/25">
                  <dt className="text-ink-soft">平日の上限</dt>
                  <dd className="font-semibold text-ink">{c.weekday.share.toLocaleString()}円</dd>
                </div>
                <div className="spec-row border-caramel/25">
                  <dt className="text-ink-soft">土日祝の上限</dt>
                  <dd className="font-semibold text-ink">{c.weekend.share.toLocaleString()}円</dd>
                </div>
              </dl>
              <p className="mt-6 text-[0.8rem] leading-relaxed text-ink-soft">
                他のお客様と同じテーブルで遊ぶことを希望される場合の料金です。相席は選択制なので、
                お連れ様だけで過ごしたい日は通常料金でご利用ください。
              </p>
            </div>
          </div>

          <ul className="mt-8 space-y-2.5 text-[0.85rem] leading-relaxed text-ink-soft">
            {shop.pricing.kids.value.map((k) => (
              <li key={k.label} className="flex gap-2">
                <span aria-hidden="true" className="text-caramel-ink">
                  ・
                </span>
                {k.label}のお客様は{k.rule}でご利用いただけます。
              </li>
            ))}
            <li className="flex gap-2">
              <span aria-hidden="true" className="text-caramel-ink">
                ・
              </span>
              お会計時に学生証をご提示いただくと、{shop.pricing.studentDiscount.value}%引きの料金でご利用いただけます。
            </li>
            <li className="flex gap-2">
              <span aria-hidden="true" className="text-caramel-ink">
                ・
              </span>
              {shop.pricing.guaranteedHoursNote}
            </li>
            <li className="flex gap-2">
              <span aria-hidden="true" className="text-caramel-ink">
                ・
              </span>
              {shop.pricing.privateHire.value}
            </li>
            <li className="flex gap-2">
              <span aria-hidden="true" className="text-caramel-ink">
                ・
              </span>
              お支払いは{shop.payments.value.join('、')}に対応しています。
            </li>
          </ul>

          <p className="mt-6 text-[0.78rem] text-ink-faint">
            ご利用の目安は{shop.pricing.averageBudget.value}です。
          </p>
        </Container>
      </section>

      {/* ------------------------------------------------ ご利用の流れ */}
      <section className="cv-auto section-y bg-surface">
        <Container>
          <Eyebrow>Flow</Eyebrow>
          <h2 className="display mt-3 text-[clamp(1.4rem,3.6vw,2.1rem)] text-ink">ご利用の流れ</h2>

          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                n: '01',
                t: 'ご予約（任意）',
                d: '空席があればご予約なしでもご利用いただけます。確実にお席を確保したい場合や人数が多い場合は、ご来店予約フォームからどうぞ。',
              },
              {
                n: '02',
                t: 'ご来店・受付',
                d: '人数と、相席を希望されるかどうかをお伝えください。はじめての方はその旨も教えていただけると助かります。',
              },
              {
                n: '03',
                t: 'ゲーム選び・ルール説明',
                d: '「2人でじっくり」「初めて」「大人数で盛り上がりたい」。遊ぶゲームが決まったら、スタッフがルールを説明します。',
              },
              {
                n: '04',
                t: 'お会計',
                d: 'ご利用時間に応じてお帰りの際に精算します。時間内であれば、何本遊んでも料金は変わりません。',
              },
            ].map((s) => (
              <li key={s.n} className="rounded-xl border border-line bg-white p-6">
                <span className="display text-[0.85rem] tracking-widest text-caramel-ink">{s.n}</span>
                <h3 className="mt-3 text-[0.95rem] font-semibold text-ink">{s.t}</h3>
                <p className="text-pretty mt-2.5 text-[0.83rem] leading-[1.9] text-ink-soft">{s.d}</p>
              </li>
            ))}
          </ol>
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

            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
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
                    <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-caramel" />
                    {r}
                  </li>
                ))}
                <li className="flex gap-2.5">
                  <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-caramel" />
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

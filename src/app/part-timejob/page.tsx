import type { Metadata } from 'next';
import Photo from '@/components/Photo';
import { Breadcrumbs, Button, Container, ConfirmNote, Eyebrow, PageHeader } from '@/components/ui';
import { isJobPostingReady, job } from '@/data/job';
import { abs, shop, SITE_URL } from '@/data/shop';
import { breadcrumbSchema, buildMetadata, JsonLd } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'アルバイト募集｜中津駅徒歩3分のボードゲームショップ｜BODOlab.',
  description:
    'BODOlab.（大阪市北区豊崎・中津駅徒歩3分）のアルバイト募集要項です。時給1,200円〜、交通費全額支給、月1〜週1程度から。履歴書不要、応募フォームから24時間受付しています。',
  path: '/part-timejob',
  keywords: ['中津 バイト', '大阪 ボードゲーム バイト', '梅田 バイト ボードゲーム', 'ボードゲームショップ 求人 大阪'],
});

const crumbs = [{ name: 'ホーム', href: '/' }, { name: 'アルバイト募集' }];

/**
 * 募集中かつ必要項目がそろっているときだけ JobPosting を出す。
 * 応募締切は公表されていないため validThrough は入れない。
 */
function jobPostingSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: [
      job.lead.join(' '),
      `【仕事内容】${job.duties.join('、')}`,
      `【勤務時間】${job.shift.frequency}／${job.shift.hours}（${job.shift.note}）`,
      `【福利厚生】${job.benefits.join('、')}`,
    ].join('\n'),
    datePosted: job.confirmedOn,
    employmentType: 'PART_TIME',
    hiringOrganization: { '@id': `${SITE_URL}/#organization` },
    jobLocation: {
      '@type': 'Place',
      name: job.workplaceName,
      address: {
        '@type': 'PostalAddress',
        postalCode: shop.address.postalCode,
        addressRegion: shop.address.region,
        addressLocality: shop.address.city,
        streetAddress: shop.address.street,
        addressCountry: 'JP',
      },
    },
    baseSalary: {
      '@type': 'MonetaryAmount',
      currency: 'JPY',
      value: { '@type': 'QuantitativeValue', value: job.wage.amount, unitText: 'HOUR' },
    },
    directApply: false,
    url: abs('/part-timejob'),
  };
}

export default function PartTimeJobPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      {isJobPostingReady() ? <JsonLd data={jobPostingSchema()} /> : null}

      <PageHeader
        eyebrow="Recruit"
        title="アルバイト募集"
        breadcrumbs={crumbs}
        lead="ボードゲームが好きな方、TRPGが好きな方、マーダーミステリーが好きな方。ぜひ趣味を職業にしませんか。副業も大歓迎です。"
      />

      <section className="section-y bg-paper">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-16">
            <div>
              {job.lead.map((p) => (
                <p key={p} className="text-pretty mb-4 text-[0.95rem] leading-[2] text-ink-soft">
                  {p}
                </p>
              ))}

              <h2 className="display mt-12 text-[clamp(1.3rem,3.4vw,1.9rem)] text-ink">募集要項</h2>
              <dl className="mt-7">
                <div className="spec-row">
                  <dt className="shrink-0 text-ink-soft">雇用形態</dt>
                  <dd className="text-right text-ink">{job.employmentType}</dd>
                </div>
                <div className="spec-row">
                  <dt className="shrink-0 text-ink-soft">仕事内容</dt>
                  <dd className="text-right text-ink">{job.duties.join('／')}</dd>
                </div>
                <div className="spec-row">
                  <dt className="shrink-0 text-ink-soft">勤務時間</dt>
                  <dd className="text-right text-ink">
                    {job.shift.frequency}
                    <br />
                    {job.shift.hours}
                    <span className="block text-[0.78rem] text-ink-faint">（{job.shift.note}）</span>
                  </dd>
                </div>
                <div className="spec-row">
                  <dt className="shrink-0 text-ink-soft">勤務地</dt>
                  <dd className="text-right text-ink">
                    {job.workplaceName}
                    <span className="block text-[0.78rem] text-ink-faint">{shop.address.full}</span>
                  </dd>
                </div>
                <div className="spec-row">
                  <dt className="shrink-0 text-ink-soft">給与</dt>
                  <dd className="text-right text-ink">
                    {job.wage.unit} {job.wage.amount.toLocaleString()}円〜
                    <span className="block text-[0.78rem] text-ink-faint">
                      （{job.wage.trialNote}は{job.wage.trial.toLocaleString()}円）／{job.wage.transport}
                    </span>
                  </dd>
                </div>
                <div className="spec-row">
                  <dt className="shrink-0 text-ink-soft">福利厚生</dt>
                  <dd className="text-right text-ink">{job.benefits.join('／')}</dd>
                </div>
              </dl>

              <h2 className="display mt-14 text-[clamp(1.3rem,3.4vw,1.9rem)] text-ink">採用までの流れ</h2>
              <ol className="mt-7 space-y-4">
                {job.flow.map((f, i) => (
                  <li key={f} className="flex gap-4">
                    <span className="display shrink-0 text-[0.85rem] text-cyan-ink">0{i + 1}</span>
                    <p className="text-pretty text-[0.9rem] leading-[1.95] text-ink-soft">{f}</p>
                  </li>
                ))}
              </ol>
            </div>

            <aside className="space-y-8">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
                <Photo name="shelf-staff" fill sizes="(max-width:1024px) 92vw, 38vw" className="object-cover" />
              </div>

              <div className="rounded-2xl border border-line bg-white p-7">
                <h2 className="display text-[1.05rem] text-ink">こんな方におすすめ</h2>
                <ul className="mt-4 space-y-2.5 text-[0.86rem] leading-[1.9] text-ink-soft">
                  {job.idealFor.map((t) => (
                    <li key={t} className="flex gap-2.5">
                      <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-amber" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-navy/15 bg-surface p-7">
                <Eyebrow>Entry</Eyebrow>
                <h2 className="display mt-2 text-[1.05rem] text-ink">ご応募はこちら</h2>
                <p className="text-pretty mt-3 text-[0.85rem] leading-[1.9] text-ink-soft">
                  履歴書は不要です。応募フォームに必要事項をご入力のうえ送信してください。
                </p>
                <div className="mt-5">
                  <Button href={shop.links.jobForm} variant="solid" external>
                    応募フォームへ
                  </Button>
                </div>
              </div>

              <ConfirmNote>
                募集状況・条件は時期によって変わります。掲載内容は{job.confirmedOn.replace(/-/g, '/')}
                時点で店舗が公開していたものです。詳細はお問い合わせください。
              </ConfirmNote>
            </aside>
          </div>

          <div className="mt-16">
            <Breadcrumbs items={crumbs} />
          </div>
        </Container>
      </section>
    </>
  );
}

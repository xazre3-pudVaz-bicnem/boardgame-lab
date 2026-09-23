import type { Metadata } from 'next';
import Link from 'next/link';
import Photo from '@/components/Photo';
import { Breadcrumbs, Button, Container, ConfirmNote, Eyebrow, PageHeader } from '@/components/ui';
import { AREAS } from '@/data/areas';
import { shop } from '@/data/shop';
import { breadcrumbSchema, buildMetadata, JsonLd, localBusinessSchema } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'アクセス・店舗情報｜中津駅から徒歩3分｜大阪市北区豊崎 BODOlab.',
  description:
    'BODOlab.（ボードゲームラボ）へのアクセスです。大阪メトロ御堂筋線・中津駅1番出口から徒歩3分、阪急大阪梅田駅の茶屋町口から徒歩10分。住所は大阪市北区豊崎5-7-21 おおきに豊崎西公園ビル3F。',
  path: '/access',
  keywords: ['中津 ボードゲーム アクセス', '大阪市北区 豊崎 ボードゲーム', 'BODOlab アクセス', '梅田 中津 徒歩'],
});

const crumbs = [{ name: 'ホーム', href: '/' }, { name: 'アクセス・店舗情報' }];

const wd = shop.hours.weekday.value;
const we = shop.hours.weekend.value;

/** 中津駅からの道順。旧サイトの案内をそのまま引き継いでいる。 */
const STEPS = [
  { n: '1', t: '中津駅 1番出口を出る', d: '大阪メトロ御堂筋線・中津駅の1番出口が最寄りです。' },
  { n: '2', t: '左後ろの方向へ進む', d: '出口を出たら、左後ろの方向へ進んでください。' },
  { n: '3', t: '左手に河合塾', d: '左手に河合塾があります。ガラス張りの綺麗な建物です。' },
  { n: '4', t: '公園の角を左へ', d: '左前方向に公園がありますので、その角を左に進んでください。' },
  { n: '5', t: '緑色の整骨院のビル', d: '左手に緑色の整骨院が見えてきます。そのビルの3階がBODOlab.です。' },
  { n: '6', t: '階段を上がる', d: '入り口から入って階段を上がってください。ご来店をお待ちしております。' },
];

export default function AccessPage() {
  const mapQuery = encodeURIComponent(`${shop.address.region}${shop.address.city}${shop.address.street}`);

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <JsonLd data={localBusinessSchema()} />

      <PageHeader
        eyebrow="Access"
        title="アクセス・店舗情報"
        breadcrumbs={crumbs}
        lead="大阪メトロ御堂筋線・中津駅の1番出口から徒歩3分。阪急大阪梅田駅の茶屋町口からは徒歩10分ほどで、梅田から歩いてお越しいただけます。"
      />

      {/* ------------------------------------------------ 店舗情報 */}
      <section className="section-y bg-paper">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16">
            <div>
              <Eyebrow>Information</Eyebrow>
              <h2 className="display mt-3 text-[clamp(1.4rem,3.6vw,2.1rem)] text-ink">店舗情報</h2>
              <dl className="mt-8">
                <div className="spec-row">
                  <dt className="shrink-0 text-ink-soft">店舗名</dt>
                  <dd className="text-right font-semibold text-ink">
                    {shop.name}（{shop.nameJa}）
                  </dd>
                </div>
                <div className="spec-row">
                  <dt className="shrink-0 text-ink-soft">住所</dt>
                  <dd className="text-right text-ink">{shop.address.full}</dd>
                </div>
                <div className="spec-row">
                  <dt className="shrink-0 text-ink-soft">電話</dt>
                  <dd className="text-right">
                    <a href={`tel:${shop.tel.value.replace(/-/g, '')}`} className="inline-block py-1 font-semibold text-navy">
                      {shop.tel.value}
                    </a>
                  </dd>
                </div>
                <div className="spec-row">
                  <dt className="shrink-0 text-ink-soft">営業時間</dt>
                  <dd className="text-right text-ink">
                    平日 {wd.open}–{wd.close}
                    <br />
                    {shop.hours.weekendNote} {we.open}–{we.close}
                  </dd>
                </div>
                <div className="spec-row">
                  <dt className="shrink-0 text-ink-soft">定休日</dt>
                  <dd className="text-right text-ink">
                    {shop.hours.closedDays.value.join('・')}
                    <span className="block text-[0.78rem] text-ink-faint">{shop.hours.closedDaysNote}</span>
                  </dd>
                </div>
                <div className="spec-row">
                  <dt className="shrink-0 text-ink-soft">業態</dt>
                  <dd className="text-right text-ink">{shop.type}</dd>
                </div>
              </dl>

              <p className="mt-6 text-[0.82rem] leading-relaxed text-ink-soft">{shop.hours.earlyCloseNote}</p>
              <p className="mt-3 text-[0.82rem] leading-relaxed text-ink-soft">
                {shop.telNote}ご予約は
                <a href={shop.reservationUrl} target="_blank" rel="noopener noreferrer" className="prose-link">
                  ご来店予約フォーム
                </a>
                からお願いします。
              </p>
              <div className="mt-6">
                <ConfirmNote>{shop.hours.changeNote}</ConfirmNote>
              </div>
            </div>

            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Photo name="entrance-stairs" fill sizes="(max-width:1024px) 92vw, 48vw" className="object-cover" />
            </div>
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------ 地図 */}
      <section className="cv-auto section-y bg-surface">
        <Container>
          <Eyebrow>Map</Eyebrow>
          <h2 className="display mt-3 text-[clamp(1.4rem,3.6vw,2.1rem)] text-ink">地図</h2>
          <div className="mt-8 overflow-hidden rounded-2xl border border-line">
            <iframe
              title={`${shop.name}の地図`}
              src={`https://www.google.com/maps?q=${mapQuery}&output=embed&hl=ja`}
              width="100%"
              height="420"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              style={{ border: 0, display: 'block' }}
            />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`} variant="outline" external>
              Googleマップで開く
            </Button>
            <Button href={`tel:${shop.tel.value.replace(/-/g, '')}`} variant="ghost">
              電話をかける（{shop.tel.value}）
            </Button>
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------ 道順 */}
      <section className="cv-auto section-y bg-paper-2">
        <Container>
          <Eyebrow>Route</Eyebrow>
          <h2 className="display mt-3 text-[clamp(1.4rem,3.6vw,2.1rem)] text-ink">中津駅からの道順</h2>
          <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="rounded-xl border border-line bg-white p-6">
                <span className="display text-[0.85rem] tracking-widest text-cyan-ink">STEP {s.n}</span>
                <h3 className="mt-2.5 text-[0.95rem] font-semibold text-ink">{s.t}</h3>
                <p className="text-pretty mt-2 text-[0.83rem] leading-[1.9] text-ink-soft">{s.d}</p>
              </li>
            ))}
          </ol>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {AREAS.map((a) => (
              <Link
                key={a.slug}
                href={`/area/${a.slug}`}
                className="group rounded-xl border border-line bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-navy/25"
              >
                <span className="display text-[0.6rem] tracking-[0.22em] text-cyan-ink uppercase">{a.en}</span>
                <h3 className="display mt-2 text-[1.05rem] text-ink transition-colors group-hover:text-cyan-ink">
                  {a.h1}
                </h3>
                <p className="text-pretty mt-2 line-clamp-2 text-[0.83rem] leading-[1.9] text-ink-soft">{a.lead}</p>
              </Link>
            ))}
          </div>

          <div className="mt-12">
            <Breadcrumbs items={crumbs} />
          </div>
        </Container>
      </section>
    </>
  );
}

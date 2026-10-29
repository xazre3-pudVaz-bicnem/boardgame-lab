import type { Metadata } from 'next';
import Link from 'next/link';
import Photo from '@/components/Photo';
import { Breadcrumbs, Container, ConfirmNote, PageHeader } from '@/components/ui';
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

      {/* ------------------------------------------------ 住所と地図（いちばん上に） */}
      <section className="bg-paper py-12 sm:py-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
            <div>
              <h2 className="text-[clamp(1.45rem,3.4vw,1.85rem)] font-bold text-ink">店舗情報</h2>
              <dl className="mt-6 border-t border-line text-[0.97rem]">
                {(
                  [
                    ['店舗名', `${shop.name}（${shop.nameJa}）`],
                    ['住所', shop.address.full],
                    [
                      '電話',
                      <a key="tel" href={`tel:${shop.tel.value.replace(/-/g, '')}`} className="font-semibold text-cocoa underline underline-offset-4">
                        {shop.tel.value}
                      </a>,
                    ],
                    [
                      '営業時間',
                      <>
                        平日 {wd.open}〜{wd.close}
                        <br />
                        {shop.hours.weekendNote} {we.open}〜{we.close}
                      </>,
                    ],
                    [
                      '定休日',
                      <>
                        {shop.hours.closedDays.value.join('・')}
                        <span className="ml-2 text-[0.82rem] text-ink-faint">{shop.hours.closedDaysNote}</span>
                      </>,
                    ],
                    ['業態', shop.type],
                  ] as [string, React.ReactNode][]
                ).map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[5.5rem_1fr] gap-3 border-b border-line py-3.5">
                    <dt className="text-ink-faint">{k}</dt>
                    <dd className="leading-[1.8] text-ink">{v}</dd>
                  </div>
                ))}
              </dl>

              <p className="mt-5 text-[0.85rem] leading-relaxed text-ink-soft">{shop.hours.earlyCloseNote}</p>
              <p className="mt-2 text-[0.85rem] leading-relaxed text-ink-soft">
                {shop.telNote}ご予約は
                <a href={shop.reservationUrl} target="_blank" rel="noopener noreferrer" className="prose-link">
                  ご来店予約フォーム
                </a>
                からお願いします。
              </p>
              <div className="mt-5">
                <ConfirmNote>{shop.hours.changeNote}</ConfirmNote>
              </div>
            </div>

            <div>
              <div className="overflow-hidden rounded-lg border border-line">
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
              <p className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[0.92rem]">
                <a href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`} target="_blank" rel="noopener noreferrer" className="prose-link">
                  Googleマップで開く
                </a>
                <a href={`tel:${shop.tel.value.replace(/-/g, '')}`} className="prose-link">
                  電話をかける（{shop.tel.value}）
                </a>
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------ 道順（順番が大事なので番号は残す。カードにはしない） */}
      <section className="cv-auto bg-surface py-16 sm:py-20">
        <Container>
          <h2 className="text-[clamp(1.45rem,3.4vw,1.85rem)] font-bold text-ink">中津駅からの道順</h2>
          <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14">
            <ol className="border-t border-line">
              {STEPS.map((step) => (
                <li key={step.n} className="grid grid-cols-[2rem_1fr] gap-3 border-b border-line py-4">
                  <span className="text-[1rem] font-bold text-ink-faint tabular-nums">{step.n}.</span>
                  <div>
                    <h3 className="text-[1rem] font-bold text-ink">{step.t}</h3>
                    <p className="mt-1 text-[0.93rem] leading-[1.9] text-ink-soft">{step.d}</p>
                  </div>
                </li>
              ))}
            </ol>
            <figure className="self-start">
              <div className="relative aspect-[2/1] overflow-hidden rounded-lg">
                <Photo name="entrance-stairs" fill sizes="(max-width:1024px) 92vw, 40vw" className="object-cover" />
              </div>
              <figcaption className="mt-2 text-[0.78rem] text-ink-faint">1階の入口と階段（360度カメラの写真）。階段で3階へ上がります。</figcaption>
            </figure>
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------ ほかの駅から */}
      <section className="cv-auto bg-paper py-12 sm:py-16">
        <Container>
          <h2 className="text-[1.2rem] font-bold text-ink">梅田・ほかの駅から</h2>
          <ul className="mt-4 border-t border-line">
            {AREAS.map((a) => (
              <li key={a.slug} className="border-b border-line">
                <Link href={`/area/${a.slug}`} className="group block py-4">
                  <span className="font-bold text-ink group-hover:text-accent-ink">{a.h1}</span>
                  <span className="mt-1 block line-clamp-2 text-[0.9rem] leading-[1.9] text-ink-soft">{a.lead}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-12">
            <Breadcrumbs items={crumbs} />
          </div>
        </Container>
      </section>
    </>
  );
}

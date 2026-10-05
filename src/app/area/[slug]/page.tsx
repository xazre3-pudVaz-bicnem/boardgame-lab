import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Photo from '@/components/Photo';
import { FaqList } from '@/components/home/HomeFaq';
import { Breadcrumbs, Button, Container, ConfirmNote, Eyebrow } from '@/components/ui';
import { AREAS, getArea } from '@/data/areas';
import { shop } from '@/data/shop';
import { breadcrumbSchema, buildMetadata, faqSchema, JsonLd, localBusinessSchema } from '@/lib/seo';

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return AREAS.map((a) => ({ slug: a.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const area = getArea(slug);
  if (!area) return { title: 'ページが見つかりません', robots: { index: false, follow: false } };

  return buildMetadata({
    title: area.title,
    description: area.description,
    path: `/area/${area.slug}`,
    keywords: area.keywords,
  });
}

export default async function AreaPage({ params }: Params) {
  const { slug } = await params;
  const area = getArea(slug);
  if (!area) notFound();

  const crumbs = [{ name: 'ホーム', href: '/' }, { name: 'アクセス', href: '/access' }, { name: area.label }];
  const mapQuery = encodeURIComponent(`${shop.address.region}${shop.address.city}${shop.address.street}`);
  const others = AREAS.filter((a) => a.slug !== area.slug);

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <JsonLd data={faqSchema(area.faq)} />
      <JsonLd data={localBusinessSchema()} />

      {/* ------------------------------------------------ ヘッダー */}
      <header className="relative border-b border-line bg-cocoa-deep pt-28 pb-14 text-white sm:pt-32 sm:pb-20">
        <div className="absolute inset-0">
          <Photo name={area.photo} fill sizes="100vw" priority className="object-cover opacity-30" />
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-cocoa-deep via-cocoa-deep/78 to-cocoa-deep/55"
        />
        <Container className="relative">
          <Breadcrumbs items={crumbs} tone="light-text" />
          <div className="mt-7 max-w-3xl">
            <p className="eyebrow text-caramel">{area.en}</p>
            <h1 className="display text-balance mt-3 text-[clamp(1.75rem,5vw,3rem)] leading-[1.3] text-white">
              {area.h1}
            </h1>
            <p className="text-pretty mt-6 text-[0.975rem] leading-[2] text-white/78">{area.lead}</p>
          </div>
        </Container>
      </header>

      {/* ------------------------------------------------ 所在地の明示 */}
      {area.locationNote ? (
        <div className="bg-paper pt-10">
          <Container size="narrow">
            <ConfirmNote>{area.locationNote}</ConfirmNote>
          </Container>
        </div>
      ) : null}

      {/* ------------------------------------------------ 行き方 */}
      <section className="section-y bg-paper">
        <Container>
          <Eyebrow>Route</Eyebrow>
          <h2 className="display mt-3 text-[clamp(1.4rem,3.6vw,2.1rem)] text-ink">行き方</h2>
          <ul className="mt-9 grid gap-5 sm:grid-cols-3">
            {area.routes.map((r) => (
              <li key={r.from} className="rounded-xl border border-line bg-white p-6">
                <p className="text-[0.88rem] font-semibold text-ink">{r.from}</p>
                <p className="display mt-2 text-[1.05rem] text-caramel-ink">{r.minutes}</p>
                <p className="text-pretty mt-3 text-[0.83rem] leading-[1.9] text-ink-soft">{r.how}</p>
              </li>
            ))}
          </ul>

          <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
            <div>
              {area.sections.map((s) => (
                <div key={s.h2} className="mb-10 last:mb-0">
                  <h2 className="display text-[clamp(1.15rem,3vw,1.5rem)] text-ink">{s.h2}</h2>
                  {s.body.map((p) => (
                    <p key={p} className="text-pretty mt-4 text-[0.93rem] leading-[2.05] text-ink-soft">
                      {p}
                    </p>
                  ))}
                </div>
              ))}
            </div>

            <div>
              <div className="overflow-hidden rounded-2xl border border-line">
                <iframe
                  title={`${shop.name}の地図`}
                  src={`https://www.google.com/maps?q=${mapQuery}&output=embed&hl=ja`}
                  width="100%"
                  height="360"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  style={{ border: 0, display: 'block' }}
                />
              </div>
              <dl className="mt-6">
                <div className="spec-row">
                  <dt className="shrink-0 text-ink-soft">住所</dt>
                  <dd className="text-right text-[0.85rem] text-ink">{shop.address.full}</dd>
                </div>
                <div className="spec-row">
                  <dt className="shrink-0 text-ink-soft">電話</dt>
                  <dd className="text-right">
                    <a href={`tel:${shop.tel.value.replace(/-/g, '')}`} className="inline-block py-1 font-semibold text-cocoa">
                      {shop.tel.value}
                    </a>
                  </dd>
                </div>
                <div className="spec-row">
                  <dt className="shrink-0 text-ink-soft">営業時間</dt>
                  <dd className="text-right text-[0.85rem] text-ink">
                    平日 {shop.hours.weekday.value.open}–{shop.hours.weekday.value.close}
                    <br />
                    土日祝 {shop.hours.weekend.value.open}–{shop.hours.weekend.value.close}
                  </dd>
                </div>
                <div className="spec-row">
                  <dt className="shrink-0 text-ink-soft">定休日</dt>
                  <dd className="text-right text-[0.85rem] text-ink">
                    {shop.hours.closedDays.value.join('・')}（{shop.hours.closedDaysNote.replace('。', '')}）
                  </dd>
                </div>
              </dl>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button href={shop.reservationUrl} variant="solid" external>
                  ご来店予約
                </Button>
                <Button href="/access" variant="outline">
                  詳しいアクセス
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------ FAQ */}
      <section className="cv-auto section-y bg-paper">
        <Container size="narrow">
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="display mt-3 mb-8 text-[clamp(1.3rem,3.4vw,1.9rem)] text-ink">アクセスについてのご質問</h2>
          <FaqList items={area.faq} />

          <nav aria-label="ほかのエリアから" className="mt-14">
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {others.map((a) => (
                <li key={a.slug}>
                  <Link
                    href={`/area/${a.slug}`}
                    className="block rounded-2xl border border-line bg-white px-4 py-3 text-[0.85rem] text-ink-soft transition-colors hover:border-cocoa/30 hover:text-ink"
                  >
                    {a.h1}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-12">
            <Breadcrumbs items={crumbs} />
          </div>
        </Container>
      </section>
    </>
  );
}

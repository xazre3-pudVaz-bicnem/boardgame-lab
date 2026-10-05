import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import NewsImage from '@/components/NewsImage';
import { Breadcrumbs, Button, Container, Chip, ConfirmNote, Eyebrow } from '@/components/ui';
import { getNews, NEWS, newsByDate } from '@/data/news';
import { shop } from '@/data/shop';
import { articleSchema, breadcrumbSchema, buildMetadata, JsonLd } from '@/lib/seo';

type Params = { params: Promise<{ slug: string }> };

/** 旧サイトと同じ日本語スラッグ。URLは1本も変えていない。 */
export function generateStaticParams() {
  return NEWS.map((n) => ({ slug: n.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const article = getNews(decodeURIComponent(slug));
  if (!article) return buildMetadata({ title: 'お知らせ', description: '', path: '/news', noindex: true });

  return buildMetadata({
    title: `${article.title}｜お知らせ｜大阪・梅田中津のボードゲーム BODOlab.`,
    description: article.summary,
    path: `/news/${encodeURIComponent(article.slug)}`,
    type: 'article',
    publishedTime: article.date,
  });
}

export default async function NewsArticlePage({ params }: Params) {
  const { slug } = await params;
  const article = getNews(decodeURIComponent(slug));
  if (!article) notFound();

  const crumbs = [{ name: 'ホーム', href: '/' }, { name: 'お知らせ', href: '/news' }, { name: article.title }];
  const others = newsByDate()
    .filter((n) => n.slug !== article.slug)
    .slice(0, 3);

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <JsonLd
        data={articleSchema({
          title: article.title,
          description: article.summary,
          path: `/news/${encodeURIComponent(article.slug)}`,
          published: article.date,
        })}
      />

      <article>
        <header className="border-b border-line bg-surface pt-28 pb-12 sm:pt-32 sm:pb-16">
          <Container size="narrow">
            <Breadcrumbs items={crumbs} />
            <div className="mt-6 flex items-center gap-3">
              <time dateTime={article.date} className="display text-[0.78rem] text-ink-faint">
                {article.date.replace(/-/g, '.')}
              </time>
              <Chip>{article.category}</Chip>
            </div>
            <h1 className="display text-balance mt-4 text-[clamp(1.5rem,4.4vw,2.4rem)] leading-[1.4] text-ink">
              {article.title}
            </h1>
          </Container>
        </header>

        <div className="section-y bg-paper">
          <Container size="narrow">
            {article.superseded && article.supersededNote ? (
              <div className="mb-10">
                <ConfirmNote>{article.supersededNote}</ConfirmNote>
              </div>
            ) : null}

            <div className="overflow-hidden rounded-2xl border border-line bg-white">
              <NewsImage name={article.image} alt={article.imageAlt} priority className="h-auto w-full" />
            </div>

            <div className="mt-10 space-y-5">
              {article.body.map((p) => (
                <p key={p} className="text-pretty text-[0.95rem] leading-[2] text-ink-soft">
                  {p}
                </p>
              ))}
            </div>

            <div className="mt-12 rounded-2xl border border-line bg-white p-7">
              <Eyebrow>Now</Eyebrow>
              <h2 className="display mt-2 text-[1.05rem] text-ink">現在のご案内</h2>
              <dl className="mt-5">
                <div className="spec-row">
                  <dt className="text-ink-soft">営業時間</dt>
                  <dd className="text-right text-ink">
                    平日 {shop.hours.weekday.value.open}–{shop.hours.weekday.value.close}
                    <br />
                    {shop.hours.weekendNote} {shop.hours.weekend.value.open}–{shop.hours.weekend.value.close}
                  </dd>
                </div>
                <div className="spec-row">
                  <dt className="text-ink-soft">定休日</dt>
                  <dd className="text-right text-ink">
                    {shop.hours.closedDays.value.join('・')}（{shop.hours.closedDaysNote.replace('。', '')}）
                  </dd>
                </div>
                <div className="spec-row">
                  <dt className="text-ink-soft">プレイ料金</dt>
                  <dd className="text-right text-ink">
                    1時間 {shop.pricing.unit.value.normal}円（相席 {shop.pricing.unit.value.share}円）
                  </dd>
                </div>
              </dl>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button href="/system" variant="solid">
                  料金・ご利用案内
                </Button>
                <Button href={shop.reservationUrl} variant="outline" external>
                  ご来店予約
                </Button>
              </div>
            </div>

            <nav aria-label="他のお知らせ" className="mt-16">
              <h2 className="display text-[1.05rem] text-ink">他のお知らせ</h2>
              <ul className="mt-4 divide-y divide-line border-y border-line">
                {others.map((n) => (
                  <li key={n.slug}>
                    <Link
                      href={`/news/${encodeURIComponent(n.slug)}`}
                      className="group flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:gap-5"
                    >
                      <time dateTime={n.date} className="display shrink-0 text-[0.75rem] text-ink-faint">
                        {n.date.replace(/-/g, '.')}
                      </time>
                      <span className="text-[0.88rem] leading-snug text-ink transition-colors group-hover:text-caramel-ink">
                        {n.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-[0.82rem]">
                <Link href="/news" className="prose-link">
                  お知らせ一覧へ戻る
                </Link>
              </p>
            </nav>
          </Container>
        </div>
      </article>
    </>
  );
}

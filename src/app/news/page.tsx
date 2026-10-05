import type { Metadata } from 'next';
import Link from 'next/link';
import NewsImage from '@/components/NewsImage';
import { Breadcrumbs, Button, Container, Chip, PageHeader } from '@/components/ui';
import { newsByDate } from '@/data/news';
import { shop } from '@/data/shop';
import { breadcrumbSchema, buildMetadata, itemListSchema, JsonLd } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'お知らせ｜大阪・梅田中津のボードゲーム BODOlab.',
  description:
    'BODOlab.（ボードゲームラボ）からのお知らせ一覧です。営業時間・料金の変更、イベント、アルバイト募集などの過去の告知を掲載しています。',
  path: '/news',
  keywords: ['BODOlab お知らせ', 'ボードゲームラボ 営業時間', '大阪 ボードゲーム 休業'],
});

const crumbs = [{ name: 'ホーム', href: '/' }, { name: 'お知らせ' }];

export default function NewsIndexPage() {
  const items = newsByDate();

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <JsonLd
        data={itemListSchema(
          items.map((n) => ({ name: n.title, href: `/news/${encodeURIComponent(n.slug)}` })),
          'BODOlab. お知らせ一覧',
        )}
      />

      <PageHeader
        eyebrow="News"
        title="お知らせ"
        breadcrumbs={crumbs}
        lead="これまでにお伝えしてきた告知です。営業時間や料金はその後変更されている場合がありますので、現在の内容はご利用案内のページをご覧ください。"
      />

      <section className="section-y bg-paper">
        <Container>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((n, i) => (
              <li key={n.slug}>
                <Link
                  href={`/news/${encodeURIComponent(n.slug)}`}
                  className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white transition-all duration-300 hover:-translate-y-1 hover:border-cocoa/25 hover:shadow-[0_10px_30px_rgba(0,40,79,0.09)]"
                >
                  <div className="overflow-hidden bg-paper-2">
                    <NewsImage
                      name={n.image}
                      alt={n.imageAlt}
                      priority={i < 3}
                      className="h-44 w-full object-cover object-top transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center gap-3">
                      <time dateTime={n.date} className="display text-[0.72rem] text-ink-faint">
                        {n.date.replace(/-/g, '.')}
                      </time>
                      <Chip>{n.category}</Chip>
                    </div>
                    <h2 className="mt-2.5 line-clamp-2 text-[0.95rem] leading-snug font-semibold text-ink transition-colors group-hover:text-caramel-ink">
                      {n.title}
                    </h2>
                    <p className="text-pretty mt-2.5 line-clamp-3 flex-1 text-[0.8rem] leading-[1.85] text-ink-soft">
                      {n.summary}
                    </p>
                    {n.superseded ? (
                      <p className="mt-3 text-[0.72rem] text-amber-ink">過去のお知らせ</p>
                    ) : null}
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-14 rounded-2xl border border-line bg-white p-7 sm:p-9">
            <h2 className="display text-[1.1rem] text-ink">いまの営業情報をお探しですか？</h2>
            <p className="text-pretty mt-3 text-[0.88rem] leading-[1.95] text-ink-soft">
              現在の営業時間・定休日・料金は、ご利用案内のページにまとめています。
              臨時の営業変更は公式Instagramでお知らせしています。
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="/system" variant="solid">
                料金・ご利用案内
              </Button>
              <Button href={shop.links.instagram} variant="outline" external>
                公式Instagram
              </Button>
            </div>
          </div>

          <div className="mt-14">
            <Breadcrumbs items={crumbs} />
          </div>
        </Container>
      </section>
    </>
  );
}

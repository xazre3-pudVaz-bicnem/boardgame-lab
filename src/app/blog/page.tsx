import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs, Button, Chip, Container, PageHeader } from '@/components/ui';
import { shop } from '@/data/shop';
import { getAllPosts, postCategories } from '@/lib/blog';
import { breadcrumbSchema, buildMetadata, itemListSchema, JsonLd } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'ボードゲームの読みもの｜遊び方・選び方のコラム｜大阪・梅田中津 BODOlab.',
  description:
    'ボードゲームの選び方、人数別の遊び方、大阪・梅田・中津で遊ぶときのヒントをまとめた読みものです。店舗からの営業案内はお知らせのページに掲載しています。',
  path: '/blog',
  keywords: ['ボードゲーム コラム', 'ボードゲーム 選び方', '大阪 ボードゲーム ブログ'],
});

const crumbs = [{ name: 'ホーム', href: '/' }, { name: '読みもの' }];

export default function BlogIndexPage() {
  const posts = getAllPosts();
  const categories = postCategories();

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      {posts.length ? (
        <JsonLd
          data={itemListSchema(
            posts.slice(0, 50).map((p) => ({ name: p.title, href: `/blog/${p.slug}` })),
            'BODOlab. 読みもの',
          )}
        />
      ) : null}

      <PageHeader
        eyebrow="Journal"
        title="読みもの"
        breadcrumbs={crumbs}
        lead="ボードゲームの選び方や遊び方、大阪で遊ぶときのヒントをまとめています。営業時間や料金などの店舗からのお知らせは、お知らせのページをご覧ください。"
      />

      <section className="section-y bg-paper">
        <Container>
          {posts.length === 0 ? (
            <div className="rounded-2xl border border-line bg-white p-10 text-center">
              <p className="display text-[1.1rem] text-ink">記事はこれから公開します</p>
              <p className="mt-3 text-[0.88rem] leading-[1.95] text-ink-soft">
                いまのところ公開している記事はありません。
                先にゲームの一覧や、目的別のガイドをご覧ください。
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Button href="/games" variant="solid">
                  ボードゲーム一覧
                </Button>
                <Button href="/scene/first-time" variant="outline">
                  はじめての方へ
                </Button>
              </div>
            </div>
          ) : (
            <>
              {categories.length > 1 ? (
                <ul className="mb-10 flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <li key={c.name}>
                      <Chip tone="cyan">
                        {c.name} {c.count}
                      </Chip>
                    </li>
                  ))}
                </ul>
              ) : null}

              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={`/blog/${p.slug}`}
                      className="group flex h-full flex-col rounded-xl border border-line bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-navy/25 hover:shadow-[0_10px_30px_rgba(0,40,79,0.09)]"
                    >
                      <div className="flex items-center gap-3">
                        <time dateTime={p.date} className="display text-[0.72rem] text-ink-faint">
                          {p.date.replace(/-/g, '.')}
                        </time>
                        <Chip>{p.category}</Chip>
                      </div>
                      <h2 className="mt-3 line-clamp-3 text-[0.98rem] leading-snug font-semibold text-ink transition-colors group-hover:text-cyan-ink">
                        {p.title}
                      </h2>
                      <p className="text-pretty mt-3 line-clamp-3 flex-1 text-[0.82rem] leading-[1.85] text-ink-soft">
                        {p.description}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className="mt-14 rounded-2xl border border-line bg-white p-7">
            <h2 className="display text-[1.05rem] text-ink">店舗からのお知らせをお探しですか？</h2>
            <p className="text-pretty mt-3 text-[0.88rem] leading-[1.95] text-ink-soft">
              営業時間・定休日・料金の変更、臨時休業などのお知らせは、お知らせのページにまとめています。
              臨時の営業変更は公式Instagramでもお伝えしています。
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="/news" variant="outline">
                お知らせ一覧
              </Button>
              <Button href={shop.links.instagram} variant="ghost" external>
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

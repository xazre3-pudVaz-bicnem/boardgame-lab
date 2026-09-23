import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Markdown from '@/components/blog/Markdown';
import { GameGrid } from '@/components/GameCard';
import { Breadcrumbs, Button, Chip, Container, Eyebrow } from '@/components/ui';
import { shop } from '@/data/shop';
import { getAllPosts, getPost, relatedPosts } from '@/lib/blog';
import { getGame } from '@/lib/games';
import { articleSchema, breadcrumbSchema, buildMetadata, JsonLd } from '@/lib/seo';

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: 'ページが見つかりません', robots: { index: false, follow: false } };

  return buildMetadata({
    title: `${post.title}｜読みもの｜大阪・梅田中津のボードゲーム BODOlab.`,
    description: post.description,
    path: `/blog/${post.slug}`,
    keywords: post.tags,
    type: 'article',
    publishedTime: post.date,
  });
}

export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const crumbs = [{ name: 'ホーム', href: '/' }, { name: '読みもの', href: '/blog' }, { name: post.title }];
  const games = post.games.map(getGame).filter((g): g is NonNullable<typeof g> => Boolean(g));
  const related = relatedPosts(post);

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <JsonLd
        data={articleSchema({
          title: post.title,
          description: post.description,
          path: `/blog/${post.slug}`,
          published: post.date,
          modified: post.updated,
        })}
      />

      <article>
        <header className="border-b border-line bg-surface pt-28 pb-12 sm:pt-32 sm:pb-16">
          <Container size="narrow">
            <Breadcrumbs items={crumbs} />
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <time dateTime={post.date} className="display text-[0.78rem] text-ink-faint">
                {post.date.replace(/-/g, '.')}
              </time>
              <Chip tone="cyan">{post.category}</Chip>
            </div>
            <h1 className="display text-balance mt-4 text-[clamp(1.5rem,4.4vw,2.4rem)] leading-[1.4] text-ink">
              {post.title}
            </h1>
            <p className="text-pretty mt-5 text-[0.95rem] leading-[1.95] text-ink-soft">{post.description}</p>
          </Container>
        </header>

        <div className="section-y bg-paper">
          <Container size="narrow">
            <Markdown source={post.body} />

            {post.tags.length ? (
              <ul className="mt-12 flex flex-wrap gap-2">
                {post.tags.map((t) => (
                  <li key={t}>
                    <Chip>{t}</Chip>
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="mt-14 rounded-2xl border border-navy/15 bg-surface p-7 sm:p-9">
              <Eyebrow>BODOlab.</Eyebrow>
              <h2 className="display mt-2 text-[1.15rem] text-ink">大阪・中津のボードゲームスペース</h2>
              <p className="text-pretty mt-4 text-[0.9rem] leading-[1.95] text-ink-soft">
                大阪メトロ中津駅から徒歩3分、梅田から徒歩10分。プレイ料金は1時間
                {shop.pricing.unit.value.normal}円で、上限は平日
                {shop.pricing.caps.value.weekday.normal.toLocaleString()}円・土日祝
                {shop.pricing.caps.value.weekend.normal.toLocaleString()}円です。
                ルール説明はスタッフが行いますので、はじめての方もそのまま遊んでいただけます。
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button href="/system" variant="solid">
                  料金・ご利用案内
                </Button>
                <Button href={shop.reservationUrl} variant="outline" external>
                  ご来店予約
                </Button>
              </div>
            </div>
          </Container>
        </div>

        {games.length ? (
          <section className="cv-auto section-y bg-surface">
            <Container>
              <Eyebrow>Games</Eyebrow>
              <h2 className="display mt-3 text-[clamp(1.3rem,3.4vw,1.9rem)] text-ink">この記事で取り上げたゲーム</h2>
              <div className="mt-9">
                <GameGrid games={games} />
              </div>
            </Container>
          </section>
        ) : null}

        {related.length ? (
          <section className="cv-auto section-y bg-paper">
            <Container size="narrow">
              <h2 className="display text-[1.05rem] text-ink">関連する記事</h2>
              <ul className="mt-4 divide-y divide-line border-y border-line">
                {related.map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={`/blog/${p.slug}`}
                      className="group flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:gap-5"
                    >
                      <time dateTime={p.date} className="display shrink-0 text-[0.75rem] text-ink-faint">
                        {p.date.replace(/-/g, '.')}
                      </time>
                      <span className="text-[0.88rem] leading-snug text-ink transition-colors group-hover:text-cyan-ink">
                        {p.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-[0.82rem]">
                <Link href="/blog" className="prose-link">
                  読みもの一覧へ戻る
                </Link>
              </p>
              <div className="mt-12">
                <Breadcrumbs items={crumbs} />
              </div>
            </Container>
          </section>
        ) : null}
      </article>
    </>
  );
}

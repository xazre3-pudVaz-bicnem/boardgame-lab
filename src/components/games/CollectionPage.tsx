import type { Metadata } from 'next';
import Link from 'next/link';
import DarkHeader from '@/components/DarkHeader';
import Photo from '@/components/Photo';
import { GameGrid } from '@/components/GameCard';
import { Breadcrumbs, Button, Container, Eyebrow } from '@/components/ui';
import { shop } from '@/data/shop';
import { COLLECTIONS, type CollectionDef, gamesInCollection } from '@/lib/games';
import { breadcrumbSchema, buildMetadata, itemListSchema, JsonLd } from '@/lib/seo';

export function collectionMetadata(c: CollectionDef): Metadata {
  return buildMetadata({
    title: c.title,
    description: c.description,
    path: `/games/${c.key}`,
    keywords: c.keywords,
  });
}

/** 画像を先に読む件数（最初の1〜2行ぶん）。 */
const PRIORITY = 5;

/**
 * 1ページに並べる上限。
 *
 * 条件に当てはまるタイトルが400件を超える棚があり、全件を1ページに並べると
 * HTMLが2MBを超えてモバイルの表示が重くなる。ここは「おすすめの棚」なので人気順に絞り、
 * 全件を見たい人には絞り込みと索引へ案内する（どのタイトルにも必ず辿り着ける）。
 */
const LIMIT = 120;

export default function CollectionPage({ collection }: { collection: CollectionDef }) {
  const all = gamesInCollection(collection.key);
  const games = all.slice(0, LIMIT);
  const hidden = all.length - games.length;
  const crumbs = [
    { name: 'ホーム', href: '/' },
    { name: 'ボードゲーム一覧', href: '/games' },
    { name: collection.label },
  ];
  const others = COLLECTIONS.filter((c) => c.key !== collection.key);

  return (
    <>
      <DarkHeader />
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <JsonLd
        data={itemListSchema(
          games.slice(0, 50).map((g) => ({ name: g.nameJa, href: `/games/${g.slug}` })),
          collection.heading,
        )}
      />

      {/* ------------------------------------------------ ヘッダー */}
      <header className="relative border-b border-line bg-navy-deep pt-28 pb-14 text-white sm:pt-32 sm:pb-20">
        <div className="absolute inset-0">
          <Photo name={collection.photo} fill sizes="100vw" priority className="object-cover opacity-30" />
        </div>
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/75 to-navy-deep/55" />
        <Container className="relative">
          <Breadcrumbs items={crumbs} tone="light-text" />
          <div className="mt-7">
            <p className="eyebrow text-cyan">{collection.en}</p>
            <h1 className="display text-balance mt-3 text-[clamp(1.75rem,5vw,3rem)] leading-[1.3] text-white">
              {collection.heading}
            </h1>
            <p className="text-pretty mt-5 max-w-2xl text-[0.975rem] leading-[1.95] text-white/75">
              {collection.lead}
            </p>
            <p className="mt-6 text-[0.85rem] text-cyan">
              {all.length}タイトル / 全{shop.gameCount.listed.value}タイトル中
            </p>
          </div>
        </Container>
      </header>

      {/* ------------------------------------------------ 一覧 */}
      <section className="section-y bg-paper">
        <Container>
          <div className="rounded-xl border border-line bg-white p-5 sm:p-6">
            <h2 className="text-[0.85rem] font-semibold text-ink">この一覧の選び方</h2>
            <p className="text-pretty mt-2 text-[0.84rem] leading-[1.9] text-ink-soft">{collection.criteria}</p>
            <p className="mt-2 text-[0.78rem] leading-relaxed text-ink-faint">
              {shop.gameCount.rotationNote}ご来店時に棚にあるとは限りませんので、
              遊びたいタイトルが決まっている場合は事前にお問い合わせください。
            </p>
          </div>

          <div className="mt-10">
            <GameGrid games={games} priorityCount={PRIORITY} />
          </div>

          {hidden > 0 ? (
            <div className="mt-12 rounded-2xl border border-line bg-white p-7 text-center">
              <p className="display text-[1.05rem] text-ink">
                このほかに{hidden}タイトルが条件に当てはまります
              </p>
              <p className="text-pretty mx-auto mt-3 max-w-xl text-[0.86rem] leading-[1.95] text-ink-soft">
                このページには、よく遊ばれている順に{LIMIT}
                タイトルを並べています。残りは検索の絞り込み、または全タイトルの索引からご覧いただけます。
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button href="/games" variant="solid">
                  条件を指定して探す
                </Button>
                <Button href="/games/list" variant="outline">
                  全{shop.gameCount.listed.value}タイトルの索引
                </Button>
              </div>
            </div>
          ) : null}

          <div className="mt-14 flex flex-wrap gap-3">
            <Button href="/games" variant="solid">
              条件を指定して探す
            </Button>
            <Button href={shop.reservationUrl} variant="outline" external>
              ご来店予約
            </Button>
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------ 他の棚 */}
      <section className="cv-auto section-y bg-surface">
        <Container>
          <Eyebrow>Other Collections</Eyebrow>
          <h2 className="display mt-3 text-[clamp(1.3rem,3.4vw,1.9rem)] text-ink">ほかの棚も見る</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {others.map((c) => (
              <li key={c.key}>
                <Link
                  href={`/games/${c.key}`}
                  className="group flex h-full flex-col rounded-xl border border-line bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-navy/25"
                >
                  <span className="display text-[0.58rem] tracking-[0.22em] text-cyan-ink uppercase">{c.en}</span>
                  <h3 className="mt-2 text-[0.92rem] leading-snug font-semibold text-ink transition-colors group-hover:text-cyan-ink">
                    {c.heading}
                  </h3>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-14">
            <Breadcrumbs items={crumbs} />
          </div>
        </Container>
      </section>
    </>
  );
}

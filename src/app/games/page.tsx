import type { Metadata } from 'next';
import Link from 'next/link';
import GameSearch from '@/components/games/GameSearch';
import { GameGrid } from '@/components/GameCard';
import { Breadcrumbs, Button, Container, Eyebrow, PageHeader } from '@/components/ui';
import { shop } from '@/data/shop';
import { COLLECTIONS, GAME_COUNT, genreList, popularGames } from '@/lib/games';
import { breadcrumbSchema, buildMetadata, JsonLd } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: `ボードゲーム一覧 ${GAME_COUNT}タイトル｜人数・時間・ジャンルで探す｜大阪 BODOlab.`,
  description: `大阪・中津のBODOlab.に置いているボードゲーム${GAME_COUNT}タイトルの一覧です。人数、プレイ時間、ジャンル、初心者向けかどうかで絞り込めます。1タイトルずつ、遊び方と面白さを紹介しています。`,
  path: '/games',
  keywords: [
    '大阪 ボードゲーム 種類',
    'ボードゲーム 一覧',
    'ボードゲーム 人数 検索',
    'ボードゲーム おすすめ',
    '大阪 ボードゲームショップ',
  ],
});

const crumbs = [{ name: 'ホーム', href: '/' }, { name: 'ボードゲーム一覧' }];

export default function GamesHubPage() {
  const genres = genreList();
  const popular = popularGames(20);

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />

      <PageHeader
        eyebrow="Game Collection"
        title={`棚にある${GAME_COUNT}タイトル`}
        breadcrumbs={crumbs}
        lead={
          <>
            ボドゲーマの当店ページに登録されている{GAME_COUNT}
            タイトルを、1件ずつ紹介しています。人数・プレイ時間・ジャンルで絞り込んでお探しください。
            {shop.gameCount.rotationNote}そのため、特定のタイトルが常に店内にあるとは限りません。
            遊びたいゲームが決まっている場合は、事前にお問い合わせいただけると確実です。
          </>
        }
      />

      {/* ------------------------------------------------ 検索 */}
      <section id="search" className="section-y bg-paper">
        <Container>
          <GameSearch genres={genres} total={GAME_COUNT} />
        </Container>
      </section>

      {/* ------------------------------------------------ 目的から探す */}
      <section className="cv-auto section-y bg-surface">
        <Container>
          <Eyebrow>Collections</Eyebrow>
          <h2 className="display mt-3 text-[clamp(1.4rem,3.6vw,2.1rem)] text-ink">目的から探す</h2>
          <p className="mt-4 max-w-2xl text-[0.9rem] leading-[1.95] text-ink-soft">
            「2人で」「大人数で」「短時間で」。遊ぶ状況が決まっているときは、こちらからどうぞ。
          </p>

          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {COLLECTIONS.map((c) => (
              <li key={c.key}>
                <Link
                  href={`/games/${c.key}`}
                  className="group flex h-full flex-col rounded-xl border border-line bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-navy/25 hover:shadow-[0_10px_30px_rgba(0,40,79,0.09)]"
                >
                  <span className="display text-[0.6rem] tracking-[0.22em] text-cyan-ink uppercase">{c.en}</span>
                  <h3 className="display mt-2 text-[1.05rem] text-ink transition-colors group-hover:text-cyan-ink">
                    {c.heading}
                  </h3>
                  <p className="text-pretty mt-2.5 line-clamp-3 flex-1 text-[0.82rem] leading-[1.9] text-ink-soft">
                    {c.criteria}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ------------------------------------------------ ジャンル */}
      <section className="cv-auto section-y bg-paper-2">
        <Container>
          <Eyebrow>Genre</Eyebrow>
          <h2 className="display mt-3 text-[clamp(1.4rem,3.6vw,2.1rem)] text-ink">ジャンルから探す</h2>
          <ul className="mt-8 flex flex-wrap gap-2.5">
            {genres.map((g) => (
              <li key={g.key}>
                <Link
                  href={`/games/genre/${g.key}`}
                  className="ease-out-expo inline-flex min-h-10 items-center gap-1.5 rounded-full border border-line bg-white px-4 py-2 text-[0.82rem] text-ink-soft transition-all duration-200 hover:border-navy/40 hover:text-ink"
                >
                  {g.label}
                  <span className="text-[0.7rem] text-ink-faint">{g.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ------------------------------------------------ 人気 */}
      <section className="cv-auto section-y bg-paper">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <Eyebrow>Popular</Eyebrow>
              <h2 className="display mt-3 text-[clamp(1.4rem,3.6vw,2.1rem)] text-ink">よく遊ばれているタイトル</h2>
              <p className="mt-3 max-w-xl text-[0.85rem] leading-[1.9] text-ink-soft">
                ボドゲーマで「遊んだことがある」と登録している人が多い順です。当店での貸出回数ではありません。
              </p>
            </div>
            <Button href="/games/list" variant="outline">
              全{GAME_COUNT}タイトルの一覧
            </Button>
          </div>

          <div className="mt-10">
            <GameGrid games={popular} priorityCount={5} />
          </div>

          <div className="mt-16">
            <Breadcrumbs items={crumbs} />
          </div>
        </Container>
      </section>
    </>
  );
}

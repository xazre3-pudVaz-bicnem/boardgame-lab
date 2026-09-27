import type { Metadata } from 'next';
import Link from 'next/link';
import GameSearch from '@/components/games/GameSearch';
import { GameCard } from '@/components/GameCard';
import { Breadcrumbs, Container } from '@/components/ui';
import { CONDITIONS, GAME_COUNT, gamesWithCondition, genreList, staffPicks } from '@/lib/games';
import { breadcrumbSchema, buildMetadata, JsonLd } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: `ボードゲーム一覧｜人数・時間・ジャンルで探す｜大阪・中津 BODOlab.`,
  description: `BODOlab.（大阪・中津）がボドゲーマに登録している${GAME_COUNT}タイトルを、人数・プレイ時間・ジャンルで探せます。拡張セットは区別して表示しています。`,
  path: '/games',
});

const crumbs = [{ name: 'ホーム', href: '/' }, { name: 'ボードゲーム一覧' }];

export default function GamesHubPage() {
  const genres = genreList();
  const picks = staffPicks();

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />

      <div className="bg-paper pt-24 pb-16 sm:pt-28 sm:pb-24">
        <Container>
          <Breadcrumbs items={crumbs} />
          <h1 className="mt-6 text-[clamp(1.5rem,4.4vw,2.2rem)] font-bold text-ink">ボードゲーム一覧</h1>
          <p className="mt-4 max-w-2xl text-[0.9rem] leading-[1.9] text-ink-soft">
            ボドゲーマの当店ページに登録されている{GAME_COUNT}
            タイトルです。これは店内に常にある数ではありません。取り扱いは入れ替わることがあるので、遊びたいゲームが決まっている場合は事前にお問い合わせください。
          </p>

          {/* スタッフおすすめ：登録されたものがあるときだけ出す */}
          {picks.length ? (
            <section className="mt-10 rounded-lg bg-navy-deep p-5 text-white sm:p-7">
              <h2 className="text-[1.15rem] font-bold">BODOlab.スタッフのおすすめ</h2>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {picks.map((g) => (
                  <li key={g.slug}>
                    <GameCard game={g} comment={g.staff.comments.general} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section id="search" className="mt-10">
            <h2 className="sr-only">条件で探す</h2>
            <GameSearch genres={genres} total={GAME_COUNT} />
          </section>

          <section className="mt-14 grid gap-10 border-t border-line pt-10 md:grid-cols-2">
            <div>
              <h2 className="text-[1rem] font-bold text-ink">人数・時間の条件で見る</h2>
              <ul className="mt-3 space-y-2 text-[0.9rem]">
                {CONDITIONS.map((c) => (
                  <li key={c.key}>
                    <Link href={`/games/${c.slug}`} className="prose-link">
                      {c.heading}
                    </Link>
                    <span className="ml-2 text-[0.8rem] text-ink-faint">{gamesWithCondition(c.key).length}件</span>
                  </li>
                ))}
                <li>
                  <Link href="/games/list" className="prose-link">
                    全タイトルの五十音索引
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="text-[1rem] font-bold text-ink">ジャンルで見る</h2>
              <p className="mt-1 text-[0.78rem] text-ink-faint">ジャンルは、ボドゲーマに登録されたメカニクスをもとに当サイトで分類しています。</p>
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[0.88rem]">
                {genres.map((g) => (
                  <li key={g.key}>
                    <Link href={`/games/genre/${g.key}`} className="prose-link">
                      {g.label}
                    </Link>
                    <span className="ml-1 text-[0.75rem] text-ink-faint">{g.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <div className="mt-12">
            <Breadcrumbs items={crumbs} />
          </div>
        </Container>
      </div>
    </>
  );
}

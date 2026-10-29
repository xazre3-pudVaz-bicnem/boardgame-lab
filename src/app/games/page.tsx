import type { Metadata } from 'next';
import Link from 'next/link';
import GameSearch from '@/components/games/GameSearch';
import { Breadcrumbs, Container } from '@/components/ui';
import { STAFF_KIND_HREF, StaffPickNote, StaffPicksOverview } from '@/components/games/StaffPicks';
import { CONDITIONS, gamesWithCondition, genreList, STAFF_KIND_LABEL, type StaffKind, staffPicks } from '@/lib/games';
import { breadcrumbSchema, buildMetadata, JsonLd } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: `ボードゲーム一覧｜人数・時間・ジャンルで探す｜大阪・中津 BODOlab.`,
  description: 'BODOlab.（大阪・中津）で遊べるボードゲームを、人数・プレイ時間・ジャンルで探せます。拡張セットは区別して表示しています。',
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
            ボドゲーマの当店ページに登録しているボードゲームの一覧です。タイトルは日々増えていて、入れ替わることもあります。
            遊びたいゲームが決まっている場合は、事前にお問い合わせください。
          </p>

          {/* 一覧は検索が主役。スタッフのおすすめは、上では一行の案内だけにして、全体は検索の後ろに置く */}
          {picks.length ? (
            <p className="mt-5 text-[0.92rem] leading-[2] text-ink-soft">
              <span className="mr-2 font-bold text-ink">スタッフが選んだゲーム</span>
              {(['two', 'couples', 'beginners', 'groups'] as StaffKind[]).map((k, i) => (
                <span key={k}>
                  {i > 0 ? '／' : ''}
                  <Link href={STAFF_KIND_HREF[k]} className="prose-link">
                    {STAFF_KIND_LABEL[k]}
                  </Link>
                </span>
              ))}
              ／
              <a href="#staff-picks" className="prose-link">
                まとめて見る
              </a>
            </p>
          ) : null}

          <section id="search" className="mt-8">
            <h2 className="sr-only">条件で探す</h2>
            <GameSearch genres={genres} />
          </section>

          {/* スタッフのおすすめ：登録されたものがあるときだけ出す。場面ごとの行で、お店から届いた順 */}
          {picks.length ? (
            <section id="staff-picks" className="mt-16 scroll-mt-24">
              <h2 className="text-[1.25rem] font-bold text-ink">スタッフが選んだゲーム</h2>
              <StaffPickNote className="mt-2" />
              <div className="mt-6">
                <StaffPicksOverview />
              </div>
            </section>
          ) : null}

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

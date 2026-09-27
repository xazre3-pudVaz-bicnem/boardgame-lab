import type { Metadata } from 'next';
import Link from 'next/link';
import { GameCard, GameTable } from '@/components/GameCard';
import { Breadcrumbs, Container } from '@/components/ui';
import { CONDITIONS, type ConditionDef, type Game, gamesWithCondition, staffForGroups, staffForTwo } from '@/lib/games';
import { breadcrumbSchema, buildMetadata, JsonLd } from '@/lib/seo';

/**
 * 条件で抽出した一覧ページ（/games/for-two など）。
 *
 * 上に「スタッフが推薦しているもの」（data/staff-picks.json）、
 * 下に「条件に当てはまるもの」（客観データ）を分けて置く。
 * 前者が0件のあいだは、推薦の欄そのものを出さない（空の枠やダミーを置かない）。
 */

export function collectionMetadata(c: ConditionDef): Metadata {
  return buildMetadata({ title: c.title, description: c.description, path: `/games/${c.slug}` });
}

function staffListFor(c: ConditionDef): { heading: string; games: Game[]; comment: (g: Game) => string | undefined } | null {
  if (c.key === 'two-only') {
    const games = staffForTwo();
    return games.length
      ? { heading: 'スタッフが2人におすすめしているゲーム', games, comment: (g) => g.staff.comments.two }
      : null;
  }
  if (c.key === 'six-plus') {
    const games = staffForGroups();
    return games.length
      ? { heading: 'スタッフが大人数におすすめしているゲーム', games, comment: (g) => g.staff.comments.groups }
      : null;
  }
  return null;
}

export default function CollectionPage({ collection: c }: { collection: ConditionDef }) {
  const games = gamesWithCondition(c.key);
  const staff = staffListFor(c);
  const crumbs = [{ name: 'ホーム', href: '/' }, { name: 'ボードゲーム一覧', href: '/games' }, { name: c.heading }];

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <div className="bg-paper pt-24 pb-16 sm:pt-28 sm:pb-24">
        <Container>
          <Breadcrumbs items={crumbs} />
          <h1 className="mt-6 text-[clamp(1.5rem,4.4vw,2.2rem)] font-bold text-ink">{c.heading}</h1>

          {staff ? (
            <section className="mt-8">
              <h2 className="text-[1.1rem] font-bold text-ink">{staff.heading}</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {staff.games.map((g) => (
                  <li key={g.slug}>
                    <GameCard game={g} comment={staff.comment(g)} />
                  </li>
                ))}
              </ul>
            </section>
          ) : c.key === 'two-only' ? (
            <p className="mt-5 max-w-2xl text-[0.9rem] leading-[1.9] text-ink-soft">
              スタッフが2人におすすめするゲームは、確認がとれたものから掲載します。
              「2〜4人」のように2人を含むゲームでも、2人だと遊びにくいものがあります。迷ったら来店時にスタッフへご相談ください。
            </p>
          ) : null}

          <section className="mt-10">
            <h2 className="text-[1.1rem] font-bold text-ink">
              {c.label}のゲーム（{games.length}件）
            </h2>
            <p className="mt-2 max-w-2xl text-[0.85rem] leading-relaxed text-ink-soft">{c.criteria}</p>
            <p className="mt-1 text-[0.8rem] text-ink-faint">
              ボドゲーマの当店ページに登録されているタイトルから抽出しています。取り扱いは入れ替わることがあります。
            </p>
            <div className="mt-5">
              <GameTable games={games} />
            </div>
          </section>

          <nav aria-label="ほかの条件" className="mt-12 flex flex-wrap gap-x-5 gap-y-2 text-[0.88rem]">
            {CONDITIONS.filter((o) => o.key !== c.key).map((o) => (
              <Link key={o.key} href={`/games/${o.slug}`} className="prose-link">
                {o.heading}
              </Link>
            ))}
            <Link href="/games" className="prose-link">
              条件を組み合わせて探す
            </Link>
          </nav>
        </Container>
      </div>
    </>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { GameTable } from '@/components/GameCard';
import { StaffPickList } from '@/components/games/StaffPicks';
import { Breadcrumbs, Container } from '@/components/ui';
import { CONDITIONS, type ConditionDef, type StaffKind, gamesWithCondition, staffList } from '@/lib/games';
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

/** この一覧に対応する、スタッフのおすすめの場面 */
function staffKindFor(c: ConditionDef): { kind: StaffKind; heading: string } | null {
  const pick = (kind: StaffKind, heading: string) => {
    const l = staffList(kind);
    return l.items.length ? { kind, heading } : null;
  };
  if (c.key === 'two-only') return pick('two', 'スタッフが選んだ、2人向けのゲーム');
  if (c.key === 'six-plus') return pick('groups', 'スタッフが選んだ、大人数向けのゲーム');
  return null;
}

export default function CollectionPage({ collection: c }: { collection: ConditionDef }) {
  const games = gamesWithCondition(c.key);
  const staff = staffKindFor(c);
  const crumbs = [{ name: 'ホーム', href: '/' }, { name: 'ボードゲーム一覧', href: '/games' }, { name: c.heading }];

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <div className="bg-paper pt-24 pb-16 sm:pt-28 sm:pb-24">
        <Container>
          <Breadcrumbs items={crumbs} />
          <h1 className="mt-6 text-[clamp(1.5rem,4.4vw,2.2rem)] font-bold text-ink">{c.heading}</h1>

          {staff ? (
            <div className="mt-10">
              <StaffPickList kind={staff.kind} heading={staff.heading} />
            </div>
          ) : c.key === 'two-only' ? (
            <p className="mt-5 max-w-2xl text-[0.9rem] leading-[1.9] text-ink-soft">
              スタッフが2人におすすめするゲームは、確認がとれたものから掲載します。
              「2〜4人」のように2人を含むゲームでも、2人だと遊びにくいものがあります。迷ったら来店時にスタッフへご相談ください。
            </p>
          ) : null}

          <section className="mt-14">
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

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { GameGrid } from '@/components/GameCard';
import { Breadcrumbs, Button, Container, Eyebrow, PageHeader } from '@/components/ui';
import { shop } from '@/data/shop';
import { gamesInGenre, genreList } from '@/lib/games';
import { breadcrumbSchema, buildMetadata, itemListSchema, JsonLd } from '@/lib/seo';

type Params = { params: Promise<{ genre: string }> };

/**
 * ジャンルは /games/genre/<key> に置いている。
 * ゲームのslugに "bluff" のようなジャンル名と同じものがあるため、
 * /games/<slug> と同じ階層に置くとURLが衝突する。
 */
export function generateStaticParams() {
  return genreList().map((g) => ({ genre: g.key }));
}

export const dynamicParams = false;

const find = (key: string) => genreList().find((g) => g.key === key) ?? null;

/** ジャンルごとの説明。件数だけのページにしないために1つずつ書いている。 */
const GENRE_COPY: Record<string, { lead: string; keywords: string[] }> = {
  strategy: {
    lead: '手番ごとの選択が積み上がって、終盤の形になるタイプです。運より判断が結果を左右するので、2回目以降に伸びしろを感じやすいジャンルです。',
    keywords: ['戦略 ボードゲーム', 'ボードゲーム 戦略級', '大阪 ボードゲーム 戦略'],
  },
  party: {
    lead: '説明が短く、人数が多いほど盛り上がるタイプです。勝ち負けよりも、その場のやりとりそのものが面白さになります。',
    keywords: ['パーティーゲーム', '盛り上がる ボードゲーム', '大人数 ゲーム'],
  },
  card: {
    lead: '手札の引きと出し方で勝負が決まるタイプです。準備も片付けも早く、短い時間でも遊べます。',
    keywords: ['カードゲーム ボードゲーム', 'ボードゲーム カード', 'カードゲーム おすすめ'],
  },
  cooperative: {
    lead: 'プレイヤー同士が争わず、全員でゲームに勝つタイプです。初対面の方と遊ぶときや、力の差が気になるときに向いています。',
    keywords: ['協力型 ボードゲーム', 'ボードゲーム 協力', '初対面 ボードゲーム'],
  },
  'hidden-role': {
    lead: '誰かが正体を隠していて、会話の中からそれを探すタイプです。人狼系と呼ばれることもあります。',
    keywords: ['正体隠匿 ボードゲーム', '人狼 ボードゲーム', 'ボードゲーム 裏切り'],
  },
  bluff: {
    lead: '嘘とハッタリで相手の判断を狂わせるタイプです。表情と間の取り方が、そのままゲームの手になります。',
    keywords: ['心理戦 ボードゲーム', 'ブラフ ボードゲーム', '読み合い ボードゲーム'],
  },
  word: {
    lead: '言葉を出す、連想する、伝える。語彙よりも発想の切り口が問われるタイプです。',
    keywords: ['ワードゲーム', '言葉 ボードゲーム', '連想ゲーム ボードゲーム'],
  },
  deduction: {
    lead: '与えられた手がかりから答えを組み立てるタイプです。当たったときの気持ちよさが、このジャンルの中心にあります。',
    keywords: ['推理 ボードゲーム', 'ボードゲーム 謎解き', '推理ゲーム おすすめ'],
  },
  dice: {
    lead: 'サイコロの出目が絡むタイプです。運の要素があるぶん、経験の差が出にくく、はじめての方でも勝てます。',
    keywords: ['ダイスゲーム', 'サイコロ ボードゲーム', '運 ボードゲーム'],
  },
  dexterity: {
    lead: '手先の器用さや反射神経を使うタイプです。考えるより体が動くので、言葉が少なくても盛り上がります。',
    keywords: ['アクションゲーム ボードゲーム', 'バランスゲーム', '反射神経 ゲーム'],
  },
  abstract: {
    lead: '運の要素がほとんどなく、盤面の形だけで勝負が決まるタイプです。2人用の名作が多いジャンルです。',
    keywords: ['アブストラクト ボードゲーム', '2人用 ボードゲーム', '運なし ボードゲーム'],
  },
  trick: {
    lead: '出したカードの強さでその回の勝者が決まる、トリックテイキングと呼ばれるタイプです。ルールは短いのに、読み合いは深くなります。',
    keywords: ['トリックテイキング', 'ボードゲーム トリテ', 'カードゲーム 読み合い'],
  },
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { genre } = await params;
  const g = find(genre);
  if (!g) return { title: 'ページが見つかりません', robots: { index: false, follow: false } };
  const copy = GENRE_COPY[genre];

  return buildMetadata({
    title: `${g.label}のボードゲーム${g.count}タイトル｜大阪・梅田中津 BODOlab.`,
    description: `${g.label}に分類されるボードゲーム${g.count}タイトルの一覧です。${copy?.lead ?? ''}大阪・中津のBODOlab.で遊べます。`,
    path: `/games/genre/${genre}`,
    keywords: copy?.keywords ?? [`${g.label} ボードゲーム`, '大阪 ボードゲーム'],
  });
}

export default async function GenrePage({ params }: Params) {
  const { genre } = await params;
  const g = find(genre);
  if (!g) notFound();

  const games = gamesInGenre(genre);
  const copy = GENRE_COPY[genre];
  const crumbs = [
    { name: 'ホーム', href: '/' },
    { name: 'ボードゲーム一覧', href: '/games' },
    { name: g.label },
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <JsonLd
        data={itemListSchema(
          games.slice(0, 50).map((x) => ({ name: x.nameJa, href: `/games/${x.slug}` })),
          `${g.label}のボードゲーム`,
        )}
      />

      <PageHeader
        eyebrow="Genre"
        title={`${g.label}のボードゲーム`}
        breadcrumbs={crumbs}
        lead={
          <>
            {copy?.lead}
          </>
        }
      />

      <section className="section-y bg-paper">
        <Container>
          <h2 className="display mb-8 text-[clamp(1.3rem,3.4vw,1.9rem)] text-ink">
            {g.label}のタイトル一覧
          </h2>
          <GameGrid games={games} />

          <div className="mt-14 flex flex-wrap gap-3">
            <Button href="/games" variant="solid">
              条件を指定して探す
            </Button>
            <Button href="/games/list" variant="outline">
              全タイトルの一覧
            </Button>
          </div>
        </Container>
      </section>

      <section className="cv-auto section-y bg-surface">
        <Container>
          <Eyebrow>Other Genres</Eyebrow>
          <h2 className="display mt-3 text-[clamp(1.3rem,3.4vw,1.9rem)] text-ink">ほかのジャンル</h2>
          <ul className="mt-8 flex flex-wrap gap-2.5">
            {genreList()
              .filter((x) => x.key !== genre)
              .map((x) => (
                <li key={x.key}>
                  <Link
                    href={`/games/genre/${x.key}`}
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-line bg-white px-4 py-2 text-[0.82rem] text-ink-soft transition-all duration-200 hover:border-cocoa/40 hover:text-ink"
                  >
                    {x.label}
                    <span className="text-[0.7rem] text-ink-faint">{x.count}</span>
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

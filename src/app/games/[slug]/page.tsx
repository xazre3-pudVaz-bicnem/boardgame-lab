import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CollectionPage, { collectionMetadata } from '@/components/games/CollectionPage';
import GameDetail, { gameMetadata } from '@/components/games/GameDetail';
import { CONDITION_SLUGS, GAMES, getCondition, getGame } from '@/lib/games';

type Params = { params: Promise<{ slug: string }> };

/**
 * /games/<slug> は「条件の一覧」（/games/for-two など）と「ゲーム詳細」を担当する。
 * 両者のslugが衝突していないことは scripts/check-games.mjs で確認している。
 */
export function generateStaticParams() {
  return [...CONDITION_SLUGS.map((slug) => ({ slug })), ...GAMES.map((g) => ({ slug: g.slug }))];
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const c = getCondition(slug);
  if (c) return collectionMetadata(c);
  const game = getGame(slug);
  if (game) return gameMetadata(game);
  return { title: 'ページが見つかりません', robots: { index: false, follow: false } };
}

export default async function GamesSlugPage({ params }: Params) {
  const { slug } = await params;
  const c = getCondition(slug);
  if (c) return <CollectionPage collection={c} />;
  const game = getGame(slug);
  if (game) return <GameDetail game={game} />;
  notFound();
}

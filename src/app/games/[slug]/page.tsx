import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CollectionPage, { collectionMetadata } from '@/components/games/CollectionPage';
import GameDetail, { gameMetadata } from '@/components/games/GameDetail';
import { COLLECTION_KEYS, GAMES, getCollection, getGame } from '@/lib/games';

type Params = { params: Promise<{ slug: string }> };

/**
 * /games/<slug> は2種類のページを担当している。
 *   - コレクション（/games/for-beginners など）
 *   - ゲーム詳細（/games/die-siedler-von-catan など）
 * 両者のslugが衝突していないことは scripts/check-games.mjs で確認している。
 */
export function generateStaticParams() {
  return [...COLLECTION_KEYS.map((key) => ({ slug: key })), ...GAMES.map((g) => ({ slug: g.slug }))];
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (collection) return collectionMetadata(collection);

  const game = getGame(slug);
  if (game) return gameMetadata(game);

  return { title: 'ページが見つかりません', robots: { index: false, follow: false } };
}

export default async function GamesSlugPage({ params }: Params) {
  const { slug } = await params;

  const collection = getCollection(slug);
  if (collection) return <CollectionPage collection={collection} />;

  const game = getGame(slug);
  if (game) return <GameDetail game={game} />;

  notFound();
}

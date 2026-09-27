import type { Metadata } from 'next';
import DarkHeader from '@/components/DarkHeader';
import Hero from '@/components/home/Hero';
import {
  About,
  AccessSummary,
  CtaBand,
  GameCollection,
  HowToEnjoy,
  PhotoBand,
  SceneGrid,
  SystemSummary,
  Why,
  type MoodTile,
} from '@/components/home/Sections';
import { NewsPreview } from '@/components/home/NewsPreview';
import { HomeFaq } from '@/components/home/HomeFaq';
import { SCENES } from '@/data/scenes';
import { shop } from '@/data/shop';
import { COLLECTIONS, GAME_COUNT, gamesInCollection } from '@/lib/games';
import { buildMetadata, faqSchema, JsonLd } from '@/lib/seo';
import { HOME_FAQ } from '@/data/faq';

export const metadata: Metadata = buildMetadata({
  title: '大阪のボードゲームカフェ・プレイスペース｜BODOlab.（ボードゲームラボ）梅田・中津',
  description:
    '大阪メトロ中津駅から徒歩3分、梅田から徒歩10分。608種類のボードゲームをスタッフのルール説明つきで遊べるプレイスペース＆ショップです。1時間600円、上限は平日2,500円・土日祝3,000円。初めての方も1人でも歓迎。',
  path: '/',
  keywords: [
    '大阪 ボードゲーム',
    '大阪 ボードゲームカフェ',
    '大阪市 ボードゲーム',
    '梅田 ボードゲーム',
    '梅田 ボードゲームカフェ',
    '中津 ボードゲーム',
    '大阪 ボードゲームショップ',
    'ボードゲーム 初心者 大阪',
    '大阪 室内 遊び',
    '大阪 雨の日 デート',
  ],
});

/**
 * 「目的から選ぶ」タイル。ゲーム名を知らない人の入口。
 * 2人・デート向けには大人数の写真を使わず、盤面のアップを使う（店内に2人組の写真が無いため）。
 */
const MOODS: MoodTile[] = [
  { key: 'for-beginners', label: '初めての方に', en: 'Beginners', href: '/games/for-beginners', photo: 'game-catan-hand' },
  { key: 'for-two', label: '2人で', en: 'For two', href: '/games/for-two', photo: 'game-catan-close' },
  { key: 'for-couples', label: 'デート・カップルで', en: 'Date', href: '/games/for-couples', photo: 'game-family-close' },
  { key: 'party', label: '大人数で', en: 'Party', href: '/games/party', photo: 'players-cards' },
  { key: 'short-play', label: '30分以内で', en: 'Short', href: '/games/short-play', photo: 'game-boxes' },
  { key: 'heavy', label: 'じっくり戦略', en: 'Heavy', href: '/games/heavy', photo: 'game-strategy' },
];

/** トップの棚に出す4つのコレクション */
const HOME_SHELVES = ['for-beginners', 'for-two', 'party', 'short-play'] as const;

/** シーンの並び。先頭が大きく出る。残りはリンクの列に */
const HOME_SCENES = ['first-time', 'rainy-day', 'indoor-date', 'with-friends', 'solo', 'after-work'] as const;

export default function HomePage() {
  /**
   * 棚ごとに人気順で6件。ただし前の棚に出したタイトルは飛ばす。
   * 人気順のまま並べると、どの棚も同じ顔ぶれになって棚を分けた意味がなくなるため。
   */
  const used = new Set<string>();
  const groups = HOME_SHELVES.map((key) => {
    const def = COLLECTIONS.find((c) => c.key === key)!;
    const games = gamesInCollection(key)
      .filter((g) => !used.has(g.slug))
      .slice(0, 6);
    for (const g of games) used.add(g.slug);
    return { key, label: def.label, href: `/games/${key}`, caption: def.criteria, games };
  });

  const bySlug = new Map(SCENES.map((s) => [s.slug, s]));
  const scenes = HOME_SCENES.map((slug) => bySlug.get(slug)!).map((s) => ({
    href: `/scene/${s.slug}`,
    label: s.label,
    en: s.en,
    body: s.card,
    photo: s.photo,
  }));
  const more = SCENES.filter((s) => !(HOME_SCENES as readonly string[]).includes(s.slug)).map((s) => ({
    href: `/scene/${s.slug}`,
    label: s.label,
  }));

  return (
    <>
      <DarkHeader />
      <JsonLd data={faqSchema(HOME_FAQ)} />
      <Hero />
      <About gameCount={GAME_COUNT} />
      <Why />
      <PhotoBand />
      <GameCollection moods={MOODS} groups={groups} total={GAME_COUNT} />
      <HowToEnjoy />
      <SceneGrid scenes={scenes} more={more} />
      <SystemSummary />
      <NewsPreview />
      <AccessSummary />
      <HomeFaq items={HOME_FAQ} />
      <CtaBand />
      <p className="sr-only">
        {shop.name}（{shop.nameJa}）は{shop.address.full}
        にあるボードゲームプレイスペース＆ショップです。
      </p>
    </>
  );
}

import type { Metadata } from 'next';
import DarkHeader from '@/components/DarkHeader';
import Hero from '@/components/home/Hero';
import {
  About,
  AccessSummary,
  CtaBand,
  GameCollection,
  HowToEnjoy,
  SceneGrid,
  SystemSummary,
  Why,
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
    '大阪メトロ中津駅から徒歩3分、梅田から徒歩10分。600種類以上のボードゲームをスタッフのルール説明つきで遊べるプレイスペース＆ショップです。1時間600円、上限は平日2,500円・土日祝3,000円。初めての方も1人でも歓迎。',
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
  ],
});

/** トップのGAME COLLECTIONに出す4つの棚 */
const HOME_SHELVES = ['for-beginners', 'for-two', 'party', 'short-play'] as const;

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
    return {
      key,
      label: def.label,
      href: `/games/${key}`,
      caption: def.criteria,
      games,
    };
  });

  const scenes = SCENES.map((s) => ({
    href: `/scene/${s.slug}`,
    label: s.label,
    en: s.en,
    body: s.card,
    photo: s.photo,
  }));

  return (
    <>
      <DarkHeader />
      <JsonLd data={faqSchema(HOME_FAQ)} />
      <Hero />
      <About gameCount={GAME_COUNT} />
      <Why />
      <GameCollection groups={groups} total={GAME_COUNT} />
      <HowToEnjoy />
      <SceneGrid scenes={scenes} />
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

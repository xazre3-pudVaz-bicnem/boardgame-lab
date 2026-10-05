import type { Metadata } from 'next';
import Hero from '@/components/home/Hero';
import { About, Access, Events, Games, HowAndPrice, SceneLinks, Space, StaffGuide } from '@/components/home/Sections';
import { buildMetadata } from '@/lib/seo';

/**
 * BODOlab. は飲食販売のないプレイスペース＆ショップなので、title や H1 では「カフェ」と名乗らない。
 * 「ボードゲームカフェ」で探している人向けには、description で実態を説明する。
 */
export const metadata: Metadata = buildMetadata({
  title: 'BODOlab.（ボードゲームラボ）｜大阪・中津のボードゲームプレイスペース＆ショップ',
  description:
    '大阪でボードゲームカフェを探している方へ。中津駅から徒歩3分・梅田から徒歩10分のBODOlab.は、飲食販売のないボードゲームのプレイスペース＆ショップです。1時間600円、ルールはスタッフが説明します。',
  path: '/',
});

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Space />
      <StaffGuide />
      <Games />
      <HowAndPrice />
      <Events />
      <Access />
      <SceneLinks />
    </>
  );
}

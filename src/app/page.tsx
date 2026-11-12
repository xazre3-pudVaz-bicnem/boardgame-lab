import type { Metadata } from 'next';
import Hero from '@/components/home/Hero';
import ShareNow from '@/components/ShareNow';
import { About, Access, Events, Games, HowAndPrice, SceneLinks, Shop } from '@/components/home/Sections';
import { buildMetadata } from '@/lib/seo';

/*
 * その月の営業カレンダー（src/data/calendar.ts）を出しているので、1時間ごとに作り直す（ISR）。
 * 月が終わったカレンダーは currentCalendar が null を返すので、月が変わってから1時間以内に表示が切り替わる。
 */
export const revalidate = 3600;

/**
 * BODOlab. は飲食販売のないプレイスペース＆ショップなので、title や H1 では「カフェ」と名乗らない。
 * 「ボードゲームカフェ」で探している人向けには、description で実態を説明する。
 */
export const metadata: Metadata = buildMetadata({
  title: 'BODOlab.（ボードゲームラボ）｜大阪・中津のボードゲームプレイスペース＆ショップ',
  description:
    '大阪でボードゲームカフェを探している方へ。中津駅から徒歩3分のBODOlab.は、飲食販売のないボードゲームのプレイスペース＆ショップです。1時間600円、ルールはスタッフが説明します。遊べるゲームを中心に販売もしています。',
  path: '/',
});

export default function HomePage() {
  return (
    <>
      <Hero />
      {/* 店舗の相席カウンター（2026-11-12 依頼）。ヒーローの中ではなく、すぐ下に置く */}
      <ShareNow variant="band" />
      <About />
      <Games />
      <Shop />
      <HowAndPrice />
      <Events />
      <Access />
      <SceneLinks />
    </>
  );
}

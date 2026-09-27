/**
 * エリア別ページ。
 *
 * 店舗の所在地は大阪市北区豊崎（中津駅そば）の1店舗だけ。
 * 梅田ページも「梅田にある店」とは書かず、「梅田から歩いて行ける中津の店」として書く。
 * 地域名を入れた見出しだけ量産すると内容が重なるので、ページごとに書く話題を変えている。
 */

import type { PhotoKey } from '@/components/Photo';

export type AreaDef = {
  slug: string;
  label: string;
  en: string;
  title: string;
  description: string;
  keywords: string[];
  h1: string;
  lead: string;
  /** 「ここにある店ではない」ことを最初に明示する一文（梅田・大阪市ページで使う） */
  locationNote: string;
  photo: PhotoKey;
  sections: { h2: string; body: string[] }[];
  /** 徒歩・乗り換えの具体的な行き方 */
  routes: { from: string; how: string; minutes: string }[];
  faq: { q: string; a: string }[];
};

export const AREAS: AreaDef[] = [
  {
    slug: 'umeda',
    label: '梅田から',
    en: 'From Umeda',
    title: '梅田からの行き方｜中津のボードゲームプレイスペース BODOlab.（梅田から徒歩10分）',
    description:
      '梅田でボードゲームが遊べる場所をお探しの方へ。BODOlab.は梅田の隣駅・中津にあります。阪急大阪梅田駅の茶屋町口から徒歩10分、中津駅からは徒歩3分。1時間600円です。',
    keywords: ['梅田 ボードゲーム', '梅田 ボードゲームカフェ', '梅田 遊び場', '梅田 室内', '茶屋町 ボードゲーム'],
    h1: '梅田からの行き方',
    lead: '梅田でボードゲームが遊べる場所を探している方へ。BODOlab.は梅田ではなく、隣の中津にあります。阪急大阪梅田駅の茶屋町口からは徒歩10分ほどで、歩いて来られる距離です。',
    locationNote: '当店の所在地は大阪市北区豊崎です。梅田エリア内ではありませんが、阪急大阪梅田駅の茶屋町口から徒歩10分、大阪メトロ中津駅からは徒歩3分の場所にあります。',
    photo: 'entrance-stairs',
    sections: [
      {
        h2: '阪急大阪梅田駅から歩く場合',
        body: [
          '阪急大阪梅田駅の茶屋町口から徒歩10分です（旧公式サイトの案内による）。',
          '道順に自信がない場合は、大阪メトロ御堂筋線で梅田駅から1駅の中津駅まで乗ると、1番出口から徒歩3分です。',
        ],
      },
      {
        h2: '料金',
        body: ['プレイ料金は1時間600円（相席可の場合は500円）。上限は平日2,500円・土日祝3,000円です。'],
      },
      {
        h2: 'ボードゲームの販売',
        body: ['店頭または公式LINEから購入できます。3点で10%引き、4点以上で15%引き。取り置き（最大1週間）やお取り寄せも可能です。'],
      },
    ],
    routes: [
      { from: '阪急 大阪梅田駅', how: '茶屋町口から徒歩。', minutes: '徒歩10分' },
      { from: '大阪メトロ御堂筋線 中津駅', how: '1番出口を出て左後ろへ。公園の角を左に曲がった先のビル3階です。', minutes: '徒歩3分' },
      { from: '大阪メトロ 梅田駅', how: '御堂筋線で中津駅まで1駅。', minutes: '1駅＋徒歩3分' },
    ],
    faq: [
      { q: '梅田駅から歩けますか？', a: '阪急大阪梅田駅の茶屋町口から徒歩10分です。' },
      { q: '梅田に店舗はありますか？', a: 'いいえ。店舗は大阪市北区豊崎（大阪メトロ中津駅から徒歩3分）の1か所のみです。' },
    ],
  },
];

export const getArea = (slug: string) => AREAS.find((a) => a.slug === slug) ?? null;

import raw from '@/data/games.json';

/**
 * ゲームデータ。scripts/build-games.mjs が作る src/data/games.json を読む。
 *
 * このサイトでは次の2つを必ず分けて扱う。
 *   検索条件（CONDITIONS） … 「2人専用」「6人以上対応」など、人数・時間などの客観データだけで決まるもの。
 *                            「おすすめ」という言葉は使わない。
 *   スタッフ推薦（staff）   … data/staff-picks.json に BODOlab. スタッフが書いたものだけ。
 *                            自動では1件も付かない。
 */

export type RelatedGroup = { type: 'series' | 'designer' | 'shorter' | 'longer'; slugs: string[] };

export type Game = {
  slug: string;
  nameJa: string;
  nameEn: string | null;
  search: string;
  aliases: string[];
  /* 事実データ（出典: ボドゲーマ） */
  players: { min: number; max: number } | null;
  playersLabel: string | null;
  time: { min: number; max: number } | null;
  timeLabel: string | null;
  minAge: number | null;
  year: number | null;
  mechanics: string[];
  designers: string[];
  sourceUrl: string;
  dataStatus: 'complete' | 'partial';
  /* 当サイトの分類 */
  genre: string;
  genreLabel: string;
  weight: 'light' | 'middle' | 'heavy';
  conditions: ConditionKey[];
  contentType: 'base' | 'expansion' | 'standalone-expansion' | 'edition';
  isExpansion: boolean;
  standalone: boolean;
  requiresBaseGame: boolean;
  baseGameSlug: string | null;
  /* スタッフ監修（data/staff-picks.json） */
  staff: {
    reviewed: boolean;
    pick: boolean;
    forTwo: 'best' | 'good' | 'more' | null;
    forCouples: boolean;
    forBeginners: boolean;
    forGroups: boolean;
    comments: Partial<Record<'two' | 'couples' | 'beginners' | 'groups' | 'general', string>>;
  };
  /* 説明文（staff.reviewed が false のあいだは当サイト作成の下書き） */
  overview: string;
  howToPlay: string;
  rulesUnknown: boolean;
  indexable: boolean;
  popularity: number;
  stock: 'available' | 'unavailable' | 'unknown';
  stockCheckedAt: string | null;
  relatedGroups: RelatedGroup[];
};

const data = raw as unknown as { generatedAt: string; source: string; count: number; games: Game[] };

export const GAMES: Game[] = data.games;
export const GAME_COUNT = GAMES.length;

const bySlug = new Map(GAMES.map((g) => [g.slug, g]));
export const getGame = (slug: string) => bySlug.get(slug) ?? null;
export const hasGame = (slug: string) => bySlug.has(slug);

export const byPopularity = (a: Game, b: Game) => b.popularity - a.popularity;
export const byName = (a: Game, b: Game) => a.nameJa.localeCompare(b.nameJa, 'ja');

/* -------------------------------------------------------------- 検索条件 */

export type ConditionKey = 'two-only' | 'six-plus' | 'within-30' | 'cooperative';

export type ConditionDef = {
  key: ConditionKey;
  /** URL（/games/<slug>）。旧サイト構成との互換のため既存のものを使う */
  slug: string;
  label: string;
  heading: string;
  title: string;
  description: string;
  /** 何の条件で並べているか。「おすすめではない」ことをはっきり書く */
  criteria: string;
};

export const CONDITIONS: ConditionDef[] = [
  {
    key: 'two-only',
    slug: 'for-two',
    label: '2人専用',
    heading: '2人で遊ぶボードゲーム',
    title: '2人で遊ぶボードゲーム｜2人専用ゲーム一覧｜大阪・中津 BODOlab.',
    description:
      'BODOlab.（大阪・中津）のボドゲーマ登録タイトルのうち、対応人数が2人ちょうどの「2人専用」ゲームの一覧です。スタッフが2人におすすめするゲームは確認がとれたものから掲載します。',
    criteria: '対応人数がちょうど2人のゲームを並べています。人数の条件で抽出した一覧で、おすすめ順ではありません。',
  },
  {
    key: 'six-plus',
    slug: 'for-groups',
    label: '6人以上で遊べる',
    heading: '6人以上で遊べるボードゲーム',
    title: '6人以上で遊べるボードゲーム一覧｜大人数・グループ｜大阪・中津 BODOlab.',
    description: 'BODOlab.（大阪・中津）のボドゲーマ登録タイトルのうち、対応人数の上限が6人以上のゲームの一覧です。',
    criteria: '対応人数の上限が6人以上のゲームです。遊べる人数の条件で抽出した一覧で、6人で遊ぶと面白いという意味ではありません。',
  },
  {
    key: 'within-30',
    slug: 'short-play',
    label: '30分以内',
    heading: '30分以内で遊べるボードゲーム',
    title: '30分以内で遊べるボードゲーム一覧｜短時間｜大阪・中津 BODOlab.',
    description: 'BODOlab.（大阪・中津）のボドゲーマ登録タイトルのうち、プレイ時間の目安が30分以内のゲームの一覧です。',
    criteria: 'プレイ時間の目安（箱やメーカーの表記）の上限が30分以内のゲームです。ルール説明の時間は含みません。',
  },
  {
    key: 'cooperative',
    slug: 'cooperative',
    label: '協力型',
    heading: '協力型のボードゲーム',
    title: '協力型ボードゲーム一覧｜全員で勝ちを目指す｜大阪・中津 BODOlab.',
    description: 'BODOlab.（大阪・中津）のボドゲーマ登録タイトルのうち、プレイヤー全員で協力して遊ぶ協力型のゲームの一覧です。',
    criteria: 'ボドゲーマのメカニクスに「協力プレイ」が登録されているゲームです。',
  },
];

const conditionBySlug = new Map(CONDITIONS.map((c) => [c.slug, c]));
export const getCondition = (slug: string) => conditionBySlug.get(slug) ?? null;
export const CONDITION_SLUGS = CONDITIONS.map((c) => c.slug);

export function gamesWithCondition(key: ConditionKey): Game[] {
  return GAMES.filter((g) => g.conditions.includes(key)).sort(byPopularity);
}

/* -------------------------------------------------------------- スタッフ推薦 */

export const staffPicks = () => GAMES.filter((g) => g.staff.pick).sort(byPopularity);
export const staffForTwo = () =>
  GAMES.filter((g) => g.staff.forTwo === 'best' || g.staff.forTwo === 'good').sort(
    (a, b) => (a.staff.forTwo === 'best' ? 0 : 1) - (b.staff.forTwo === 'best' ? 0 : 1) || byPopularity(a, b),
  );
export const staffForCouples = () => GAMES.filter((g) => g.staff.forCouples).sort(byPopularity);
export const staffForBeginners = () => GAMES.filter((g) => g.staff.forBeginners).sort(byPopularity);
export const staffForGroups = () => GAMES.filter((g) => g.staff.forGroups).sort(byPopularity);

/* -------------------------------------------------------------- ジャンル */

export function genreList() {
  const map = new Map<string, { key: string; label: string; count: number }>();
  for (const g of GAMES) {
    if (g.requiresBaseGame) continue;
    const cur = map.get(g.genre);
    if (cur) cur.count++;
    else map.set(g.genre, { key: g.genre, label: g.genreLabel, count: 1 });
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

/** ジャンル別の一覧。単体で遊べない拡張は入れない。 */
export function gamesInGenre(key: string): Game[] {
  return GAMES.filter((g) => g.genre === key && !g.requiresBaseGame).sort(byPopularity);
}

/* -------------------------------------------------------------- 関連 */

export const RELATED_LABEL: Record<RelatedGroup['type'], string> = {
  series: '同じシリーズ',
  designer: '同じデザイナーのゲーム',
  shorter: '同じジャンルで、もっと短く遊べるゲーム',
  longer: '同じジャンルで、じっくり遊ぶゲーム',
};

export function relatedGroups(game: Game) {
  return game.relatedGroups
    .map((g) => ({ ...g, games: g.slugs.map((s) => bySlug.get(s)).filter((x): x is Game => Boolean(x)) }))
    .filter((g) => g.games.length > 0);
}

/* -------------------------------------------------------------- 表示ヘルパー */

export const playersText = (g: Game) => g.playersLabel;
export const timeText = (g: Game) => g.timeLabel;
export const ageText = (g: Game) => (g.minAge != null ? `${g.minAge}歳〜` : null);

export const CONTENT_TYPE_LABEL: Record<Game['contentType'], string | null> = {
  base: null,
  expansion: '拡張',
  'standalone-expansion': '単体で遊べる拡張',
  edition: '別版',
};

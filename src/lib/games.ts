import type { PhotoKey } from '@/components/Photo';
import raw from '@/data/games.json';

export type Game = {
  slug: string;
  nameJa: string;
  nameEn: string | null;
  /** ひらがな・カタカナ・英字をまたいだ検索用の正規化文字列 */
  search: string;
  players: { min: number; max: number } | null;
  playersLabel: string | null;
  time: { min: number; max: number } | null;
  timeLabel: string | null;
  minAge: number | null;
  year: number | null;
  genre: string;
  genreLabel: string;
  weight: 'light' | 'middle' | 'heavy';
  beginner: boolean;
  collections: string[];
  themes: string[];
  mechanics: string[];
  designers: string[];
  /** 掲載情報の充足度。数値が1つも取れていないものは partial */
  dataStatus: 'complete' | 'partial';
  sourceUrl: string;
  /** 内部での並べ替え用。ボドゲーマの「経験あり」「持ってる」件数から算出（画面には出さない） */
  popularity: number;
  related: string[];
  /** パッケージ画像があるか（public/games/<slug>-{320,480}.webp） */
  hasImage: boolean;
  /** 店舗で確認した在庫。data/stock.json 由来。載っていなければ unknown */
  stock: 'available' | 'unavailable' | 'unknown';
  stockCheckedAt: string | null;
  /** 通称・略称。検索にだけ使う */
  aliases: string[];
  /* 自社で執筆した本文 */
  catch: string;
  overview: string;
  howToPlay: string;
  appeal: string;
  recommended: string;
};

type RawFile = {
  generatedAt: string;
  source: string;
  count: number;
  games: Game[];
};

const data = raw as unknown as RawFile;

export const GAMES: Game[] = data.games;
export const GAME_COUNT = GAMES.length;
export const GAMES_SOURCE = data.source;
export const GAMES_GENERATED_AT = data.generatedAt;

const bySlug = new Map(GAMES.map((g) => [g.slug, g]));
export const getGame = (slug: string) => bySlug.get(slug) ?? null;
export const hasGame = (slug: string) => bySlug.has(slug);

/* -------------------------------------------------------------- コレクション */

export type CollectionKey =
  | 'for-beginners'
  | 'for-two'
  | 'party'
  | 'short-play'
  | 'for-couples'
  | 'for-groups'
  | 'heavy'
  | 'cooperative'
  | 'solo';

export type CollectionDef = {
  key: CollectionKey;
  label: string;
  /** ページタイトル（H1）。検索意図をそのまま拾う */
  heading: string;
  title: string;
  description: string;
  /** ページ冒頭のリード文。コレクションごとに書き下ろし */
  lead: string;
  /** 選定基準の説明。何をもってこのリストに入れたかを明示する */
  criteria: string;
  keywords: string[];
  photo: PhotoKey;
  en: string;
};

export const COLLECTIONS: CollectionDef[] = [
  {
    key: 'for-beginners',
    label: '初心者におすすめ',
    en: 'For Beginners',
    heading: '初心者におすすめのボードゲーム',
    title: '初心者におすすめのボードゲーム｜大阪・梅田中津で遊べる入門の一本',
    description:
      'ボードゲームを遊んだことがない方へ。ルール説明が短く、1回遊べば流れがつかめる入門向けのタイトルを、大阪・中津のBODOlab.の棚から選びました。人数と時間から探せます。',
    lead: 'ボードゲームは「ルールを覚えるのが大変そう」と思われがちです。けれど最初の一本さえ合っていれば、説明を聞いてから遊び終わるまで30分もかかりません。ここでは、プレイ時間が短く対象年齢も低めで、1回まわせば流れがつかめるタイトルを集めました。',
    criteria:
      'プレイ時間の目安が30分以内、対象年齢が10歳以下、軽量級に分類されるもののうち、ボドゲーマで遊んだ人の多さが全タイトルの中央値を超えているもの。数値はすべて出典の公表値をもとに機械的に絞り込んでいます。',
    keywords: ['ボードゲーム 初心者', '大阪 ボードゲーム 初心者', '梅田 ボードゲーム 初心者', 'ボードゲーム おすすめ 入門'],
    photo: 'table-standing',
  },
  {
    key: 'for-two',
    label: '2人で遊べる',
    en: 'For Two',
    heading: '2人で遊べるボードゲーム',
    title: '2人で遊べるボードゲーム｜大阪・梅田中津のBODOlab.で遊べる二人用',
    description:
      '2人から成立するボードゲームの一覧です。読み合いが濃くなる二人用の定番から、短時間で決着するカードゲームまで。大阪・中津のBODOlab.の棚にあるタイトルから探せます。',
    lead: '2人用のボードゲームは、大人数でやるゲームとは面白さの質が変わります。相手の手が読める人数だからこそ、一手一手の意味が濃くなる。ここでは2人から成立するタイトルを集めました。',
    criteria: '対応人数の下限が2人以下かつ上限が2人以上のタイトル。2人専用ではないものも含みます。',
    keywords: ['2人 ボードゲーム', '大阪 ボードゲーム 2人', 'ボードゲーム 二人用', '2人用 ボードゲーム おすすめ'],
    photo: 'table-pairs',
  },
  {
    key: 'party',
    label: 'パーティーゲーム',
    en: 'Party',
    heading: '盛り上がるパーティーゲーム',
    title: 'パーティーゲーム｜大人数で盛り上がるボードゲーム｜大阪・梅田中津 BODOlab.',
    description:
      '5人以上で遊べて、ルール説明が短く、笑いが起きやすいパーティー向けのボードゲーム一覧。会社の集まりや友達グループでの利用に。大阪・中津のBODOlab.で遊べます。',
    lead: '人数が集まったときに強いのは、説明が短くて一斉に盛り上がるタイプです。会話・ブラフ・反射神経といった、勝ち負けよりその場のやりとりが楽しいタイトルを集めました。',
    criteria:
      '5人以上に対応し、プレイ時間の目安が45分以内、かつパーティー・ワード・心理戦・正体隠匿・アクション系に分類されるもの。',
    keywords: ['パーティーゲーム ボードゲーム', '大阪 ボードゲーム 大人数', '盛り上がる ボードゲーム', 'ボードゲーム グループ'],
    photo: 'floor-group',
  },
  {
    key: 'short-play',
    label: '短時間で遊べる',
    en: 'Short Play',
    heading: '30分以内で遊べるボードゲーム',
    title: '短時間で遊べるボードゲーム｜30分以内｜大阪・梅田中津 BODOlab.',
    description:
      'プレイ時間の目安が30分以内のボードゲーム一覧。仕事帰りの1〜2時間や、待ち合わせまでのすきま時間にも。大阪・中津のBODOlab.の棚から探せます。',
    lead: '短いゲームには短いなりの良さがあります。負けても次がすぐ来るので、1本目で覚えたことを2本目で試せる。時間が限られている日ほど、この棚が効きます。',
    criteria: 'プレイ時間の目安の上限が30分以内のタイトル。',
    keywords: ['短時間 ボードゲーム', 'ボードゲーム 30分', '仕事帰り ボードゲーム', 'すきま時間 ボードゲーム'],
    photo: 'game-boxes',
  },
  {
    key: 'for-couples',
    label: 'カップル・デート向け',
    en: 'For Couples',
    heading: 'カップルで遊べるボードゲーム',
    title: 'カップルで遊べるボードゲーム｜梅田の室内デートに｜大阪・中津 BODOlab.',
    description:
      '2人で向かい合って遊べて、会話が生まれやすいボードゲームの一覧。梅田・中津での室内デートに。大阪・中津のBODOlab.は中津駅から徒歩3分、梅田から徒歩10分です。',
    lead: '向かい合って座って、同じものを見て、同じ時間を使う。デートでボードゲームが強いのは、沈黙が気まずくならないからです。2人で成立して、ルールが重すぎないタイトルを選びました。',
    criteria: '2人で成立し、プレイ時間の目安が60分以内、対象年齢12歳以下、重量級ではないタイトル。',
    keywords: ['カップル ボードゲーム', '大阪 ボードゲーム デート', '梅田 室内デート', '大阪 室内 デート'],
    photo: 'players-cards',
  },
  {
    key: 'for-groups',
    label: '大人数で遊べる',
    en: 'For Groups',
    heading: '6人以上で遊べるボードゲーム',
    title: '大人数で遊べるボードゲーム｜6人以上｜大阪・梅田中津 BODOlab.',
    description:
      '6人以上に対応するボードゲームの一覧です。人数が多い日でも全員が同じテーブルに入れるタイトルを集めました。大阪・中津のBODOlab.で遊べます。',
    lead: '人数が多い日にいちばん困るのは「全員が入れるゲームがない」ことです。ここでは6人以上に対応するタイトルだけを並べました。分かれて遊ぶ前に、まずこの棚から。',
    criteria: '対応人数の上限が6人以上のタイトル。',
    keywords: ['大人数 ボードゲーム', '大阪 ボードゲーム 大人数', 'ボードゲーム 6人', 'ボードゲーム 8人'],
    photo: 'floor-daytime',
  },
  {
    key: 'heavy',
    label: 'じっくり遊ぶ重量級',
    en: 'Heavy',
    heading: 'じっくり遊ぶ重量級ボードゲーム',
    title: '重量級ボードゲーム｜じっくり遊ぶ本格派｜大阪・梅田中津 BODOlab.',
    description:
      'プレイ時間75分以上の重量級ボードゲーム一覧。腰を据えて遊びたい日のための棚です。大阪・中津のBODOlab.なら最大5時間まで席を確保できます。',
    lead: '1本に2時間かける遊び方があります。序盤に組み立てた方針が終盤で形になる感覚は、短いゲームでは味わえません。時間に余裕のある日に。',
    criteria: 'プレイ時間の目安の上限が75分を超えるタイトル。',
    keywords: ['重量級 ボードゲーム', 'ボードゲーム 戦略', 'ボードゲーム 本格', '大阪 ボードゲーム じっくり'],
    photo: 'players-longtable',
  },
  {
    key: 'cooperative',
    label: 'みんなで協力',
    en: 'Cooperative',
    heading: '全員で協力して遊ぶボードゲーム',
    title: '協力型ボードゲーム｜勝ち負けが分かれない｜大阪・梅田中津 BODOlab.',
    description:
      'プレイヤー同士が争わず、全員でゲームに勝つ協力型ボードゲームの一覧。初対面の相手や相席でも空気が固くなりません。大阪・中津のBODOlab.で遊べます。',
    lead: '協力型は、誰かが勝って誰かが負けるという構造がありません。初対面同士や、力の差が気になる相手と遊ぶときにいちばん頼りになるタイプです。',
    criteria: 'メカニクスに「協力」が含まれるタイトル。',
    keywords: ['協力型 ボードゲーム', 'ボードゲーム 協力', '初対面 ボードゲーム', '大阪 ボードゲーム 相席'],
    photo: 'players-longtable',
  },
  {
    key: 'solo',
    label: '1人でも遊べる',
    en: 'Solo',
    heading: '1人でも遊べるボードゲーム',
    title: '1人で遊べるボードゲーム｜ソロプレイ対応｜大阪・梅田中津 BODOlab.',
    description:
      '1人から遊べるソロプレイ対応のボードゲーム一覧。大阪・中津のBODOlab.は相席ありでのご利用もできるので、1人でのご来店も歓迎しています。',
    lead: '1人でも遊べるように設計されたゲームがあります。もちろん、相席で他のお客様の輪に入っていただくこともできます。おひとりでのご来店は珍しいことではありません。',
    criteria: '対応人数の下限が1人のタイトル。',
    keywords: ['1人 ボードゲーム', '大阪 ボードゲーム 1人', 'ソロプレイ ボードゲーム', '大阪 1人でも楽しめる場所'],
    photo: 'game-grid',
  },
];

const collectionByKey = new Map(COLLECTIONS.map((c) => [c.key, c]));
export const getCollection = (key: string) => collectionByKey.get(key as CollectionKey) ?? null;
export const COLLECTION_KEYS = COLLECTIONS.map((c) => c.key);

/** そのコレクションに属するゲーム（人気順） */
export function gamesInCollection(key: string): Game[] {
  return GAMES.filter((g) => g.collections.includes(key)).sort((a, b) => b.popularity - a.popularity);
}

/* -------------------------------------------------------------- ジャンル */

export function genreList() {
  const map = new Map<string, { key: string; label: string; count: number }>();
  for (const g of GAMES) {
    const cur = map.get(g.genre);
    if (cur) cur.count++;
    else map.set(g.genre, { key: g.genre, label: g.genreLabel, count: 1 });
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

export function gamesInGenre(key: string): Game[] {
  return GAMES.filter((g) => g.genre === key).sort((a, b) => b.popularity - a.popularity);
}

/* -------------------------------------------------------------- 並べ替え・抽出 */

export const byPopularity = (a: Game, b: Game) => b.popularity - a.popularity;
export const byName = (a: Game, b: Game) => a.nameJa.localeCompare(b.nameJa, 'ja');

export function popularGames(n: number): Game[] {
  return [...GAMES].sort(byPopularity).slice(0, n);
}

/** 詳細ページの「関連するゲーム」。ビルド時に決めた related を引く。 */
export function relatedGames(game: Game): Game[] {
  return game.related.map((s) => bySlug.get(s)).filter((g): g is Game => Boolean(g));
}

/* -------------------------------------------------------------- 表示ヘルパー */

export const playersText = (g: Game) =>
  g.players ? (g.players.min === g.players.max ? `${g.players.min}人` : `${g.players.min}〜${g.players.max}人`) : null;

export const timeText = (g: Game) =>
  g.time ? (g.time.min === g.time.max ? `${g.time.min}分` : `${g.time.min}〜${g.time.max}分`) : null;

export const ageText = (g: Game) => (g.minAge != null ? `${g.minAge}歳〜` : null);

export const WEIGHT_LABEL: Record<Game['weight'], string> = {
  light: '軽め',
  middle: '中量級',
  heavy: '重量級',
};

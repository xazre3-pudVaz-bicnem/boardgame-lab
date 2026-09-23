/**
 * ボドゲーマから取得した素データ（人数・時間・年齢・メカニクス・テーマ）から、
 * サイト側で使う分類（ジャンル・重さ・初心者向き・コレクション）を導出する。
 *
 * 導出はすべてルールベース。元データにない数値は作らない。
 * 欠けている項目は null のままにして、画面にも構造化データにも出さない。
 *
 * メカニクス名はボドゲーマの表記そのまま（完全一致で判定する）。
 */

/* ------------------------------------------------------------ 数値のパース */

/** "2人～4人" / "3人" -> { min, max } */
export function parsePlayers(raw) {
  if (!raw) return null;
  const nums = [...String(raw).matchAll(/(\d+)\s*人/g)].map((m) => +m[1]);
  if (nums.length === 0) return null;
  const min = nums[0];
  const max = nums.length > 1 ? nums[nums.length - 1] : nums[0];
  if (!Number.isFinite(min) || !Number.isFinite(max) || min < 1 || max > 99 || max < min) return null;
  return { min, max };
}

/** "30分～60分" / "15分前後" -> { min, max }（分） */
export function parseTime(raw) {
  if (!raw) return null;
  const nums = [...String(raw).matchAll(/(\d+)\s*分/g)].map((m) => +m[1]);
  if (nums.length === 0) return null;
  const min = nums[0];
  const max = nums.length > 1 ? nums[nums.length - 1] : nums[0];
  if (!Number.isFinite(min) || min <= 0 || max > 1200 || max < min) return null;
  return { min, max };
}

/** "10歳～" / "10歳から" -> 10 */
export function parseAge(raw) {
  if (!raw) return null;
  const m = String(raw).match(/(\d+)\s*歳/);
  if (!m) return null;
  const n = +m[1];
  return n >= 2 && n <= 20 ? n : null;
}

/* ------------------------------------------------------------ ジャンル判定 */

/**
 * ジャンルはメカニクスの重み付けスコアで決める。
 * 「ハンドマネージメント」のようにほぼ全てのゲームに付く汎用メカニクスは重みを小さく、
 * 「トリックテイキング」「協力プレイ」のように1つで性格が決まるものは大きくしている。
 * 同点のときは下の配列の並び順（上が優先）で決まる。
 */
export const GENRES = [
  {
    key: 'cooperative',
    label: '協力',
    short: 'みんなで協力',
    description: '全員で力を合わせてゲームに勝つ、勝ち負けが分かれないタイプ。',
    weights: { '協力プレイ': 18, 'コミュニケーション禁止': 3 },
  },
  {
    key: 'hidden-role',
    label: '正体隠匿',
    short: '正体を隠す',
    description: '誰かが正体を隠している。会話と疑いから相手の立場を見抜く。',
    weights: { '正体隠匿/隠蔽': 12, 'シークレットユニット': 2, 'チーム戦': 2 },
  },
  {
    key: 'word',
    label: 'ワード・表現',
    short: '言葉で伝える',
    description: '言葉や絵で伝えて、当ててもらう。会話そのものが遊びになる。',
    weights: { '言葉遊び': 20, 'ストーリーメイキング': 12, 'ドローイング（描画）': 10 },
  },
  {
    key: 'deduction',
    label: '推理・記憶',
    short: '当てる・思い出す',
    description: '手がかりを集めて答えにたどり着く。閃いた瞬間が気持ちいい。',
    weights: { '謎解き': 12, '推理': 8, 'メモリー（記憶する）': 7, 'パターン認識（正解の絵が存在）': 4 },
  },
  {
    key: 'dexterity',
    label: 'アクション・バランス',
    short: '手先で勝負',
    description: '手先の感覚がそのまま結果になる。見ているだけでも盛り上がる。',
    weights: { 'バランスゲーム': 10, 'アクションゲーム': 8 },
  },
  {
    key: 'party',
    label: 'パーティー',
    short: '一斉に盛り上がる',
    description: '全員が同時に動く、テンポの速いゲーム。説明も短い。',
    weights: { 'リアルタイム': 9 },
  },
  {
    key: 'trick',
    label: 'トリックテイキング',
    short: 'カードで競る',
    description: '1枚ずつ出して場の勝者を決める、カードゲームの古典的な型。',
    weights: { 'トリックテイキング': 12, 'ラダーゲーム': 6 },
  },
  {
    key: 'strategy',
    label: '戦略・箱庭',
    short: 'じっくり組み立てる',
    description: '資源をやりくりして自分の場を育てる、腰を据えて考えるタイプ。',
    weights: {
      'ワーカープレイスメント': 10,
      '路線/ネットワーク形成': 9,
      'ロンデル': 8,
      '株/投資（価値変動）': 7,
      'エリアマジョリティ（陣取り）': 6,
      'オークション（競り）': 6,
      '取引内容の交渉': 6,
      '交換/貿易': 6,
      'デッキビルディング（デッキ構築）': 6,
      'アクションポイントシステム': 5,
      'タイムトラック（行動順変動）': 5,
      'バリアブルフェーズオーダー': 4,
      'モジュラーボード': 4,
      'タイル・カード配置': 4,
    },
  },
  {
    key: 'dice',
    label: 'ダイス',
    short: 'サイコロを振る',
    description: 'サイコロを振る瞬間が主役。運と判断のバランスを楽しむ。',
    weights: { 'ダイスロール': 9, '出目移動': 7, 'ダイスプレイスメント': 8 },
  },
  {
    key: 'bluff',
    label: '心理戦・ブラフ',
    short: '読み合う',
    description: '相手の考えを読み、ときにハッタリを仕掛ける駆け引きのゲーム。',
    weights: {
      'ブラフ': 8,
      '投票/多数決': 6,
      'バッティング': 5,
      'チキンレース': 5,
      'ベッティング（賭け）': 5,
      // バースト（引き際の判断）はダイスでなく読み合いの要素として数える
      'バースト': 5,
      'アクション事前決定': 4,
    },
  },
  {
    key: 'abstract',
    label: 'アブストラクト・パズル',
    short: '盤面を読む',
    description: '運の要素が少なく、盤面の形をどう作るかで勝負が決まる。',
    weights: {
      'アブストラクト': 9,
      'エリアエンクロージャ（囲み）': 7,
      'パターンビルディング': 7,
      'パズル': 5,
      '迷路': 4,
      'グリッド移動': 3,
    },
  },
  {
    key: 'card',
    label: 'カード',
    short: '手札をやりくり',
    description: '手札の使いどころで差がつく、カードが中心のゲーム。',
    weights: {
      'バトルカード（攻撃値-防御値）': 4,
      '場札の獲得（ドラフト / リミテッド）': 3,
      'ドラフト': 3,
      'ハンドマネージメント': 2,
      'セットコレクション': 2,
      'プレイヤー別固有能力': 1,
      '直接攻撃（強奪/破壊）': 1,
    },
  },
];

export const GENRE_FALLBACK = {
  key: 'family',
  label: 'ファミリー',
  short: '誰とでも',
  description: '幅広い年齢で遊べる、間口の広いゲーム。',
};

export function deriveGenre(mechanics = []) {
  const set = new Set(mechanics.map((m) => String(m).trim()));
  let best = null;
  for (const g of GENRES) {
    let score = 0;
    for (const [m, w] of Object.entries(g.weights)) if (set.has(m)) score += w;
    if (score > 0 && (best === null || score > best.score)) best = { key: g.key, score };
  }
  return best ? best.key : GENRE_FALLBACK.key;
}

export const ALL_GENRES = [
  ...GENRES.map(({ key, label, short, description }) => ({ key, label, short, description })),
  GENRE_FALLBACK,
];
const genreMap = new Map(ALL_GENRES.map((g) => [g.key, g]));
export const genreLabel = (key) => genreMap.get(key)?.label ?? GENRE_FALLBACK.label;
export const genreShort = (key) => genreMap.get(key)?.short ?? GENRE_FALLBACK.short;
export const genreDescription = (key) => genreMap.get(key)?.description ?? GENRE_FALLBACK.description;

/* ------------------------------------------------------------ 重さ */

/**
 * light  … その場で説明して遊べる軽さ
 * middle … ひと通りの説明が要る中量級
 * heavy  … 腰を据えて遊ぶ重量級
 * 確認できた「プレイ時間」と「対象年齢」だけから決める。
 */
export function deriveWeight(time, minAge) {
  const t = time?.max ?? time?.min ?? null;
  if (t == null) return minAge != null && minAge >= 14 ? 'middle' : 'light';
  if (t <= 30) return minAge != null && minAge >= 14 ? 'middle' : 'light';
  if (t <= 75) return 'middle';
  return 'heavy';
}

export const WEIGHT_LABEL = { light: '軽め', middle: '中量級', heavy: '重量級' };

/** 初心者向き：短時間・低年齢・重すぎないもの。 */
/**
 * 「初心者向け」の判定。
 *
 * 条件をゆるくすると棚の7割が入ってしまい、おすすめとして意味をなさなくなる。
 * 軽量級・30分以内・対象年齢10歳以下に加えて、遊ばれている数が中央値以上のものに絞る。
 * よく遊ばれているタイトルは、説明する側も慣れていて最初の1本に向く。
 */
export const BEGINNER_POPULARITY_FLOOR = 2300;

export function deriveBeginner({ time, minAge, weight, popularity = 0 }) {
  if (weight !== 'light') return false;
  const t = time?.max ?? time?.min ?? null;
  if (t == null || t > 30) return false;
  if (minAge != null && minAge > 10) return false;
  return popularity >= BEGINNER_POPULARITY_FLOOR;
}

/* ------------------------------------------------------------ コレクション */

export function deriveCollections({ players, time, minAge, weight, genre, beginner, mechanics = [] }) {
  const out = [];
  const t = time?.max ?? time?.min ?? null;
  const pMin = players?.min ?? null;
  const pMax = players?.max ?? null;

  if (beginner) out.push('for-beginners');
  if (pMin != null && pMin <= 2 && pMax != null && pMax >= 2) out.push('for-two');
  if (pMax != null && pMax >= 6) out.push('for-groups');
  if (t != null && t <= 30) out.push('short-play');
  if (weight === 'heavy') out.push('heavy');
  if (pMin === 1) out.push('solo');
  if (mechanics.includes('協力プレイ')) out.push('cooperative');

  // パーティー：5人以上で回せて、説明が短く、盛り上がる系
  if (
    pMax != null &&
    pMax >= 5 &&
    (t == null || t <= 45) &&
    ['party', 'word', 'bluff', 'hidden-role', 'dexterity', 'deduction'].includes(genre)
  )
    out.push('party');

  // カップル・デート：2人で成立、重すぎず、年齢制限が高すぎない
  if (
    pMin != null &&
    pMin <= 2 &&
    pMax != null &&
    pMax >= 2 &&
    (t == null || t <= 60) &&
    (minAge == null || minAge <= 12) &&
    weight !== 'heavy'
  )
    out.push('for-couples');

  return [...new Set(out)];
}

export const COLLECTION_LABEL = {
  'for-beginners': '初心者におすすめ',
  'for-two': '2人で遊べる',
  party: 'パーティーゲーム',
  'short-play': '短時間で遊べる',
  'for-couples': 'カップル・デート向け',
  'for-groups': '大人数で遊べる',
  heavy: 'じっくり遊ぶ重量級',
  cooperative: 'みんなで協力',
  solo: '1人でも遊べる',
};

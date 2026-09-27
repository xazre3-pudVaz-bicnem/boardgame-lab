/**
 * ゲームデータのビルド。
 *
 *   data/source/games-raw.json      … ボドゲーマの所蔵リストから取得した一覧（608件）【事実データ】
 *   data/source/games-detail.json   … 各ゲームのメカニクス・デザイナー等            【事実データ】
 *   content/games/*.json            … 当サイトが作成した説明文（スタッフ監修前）     【AIを含む下書き】
 *   data/content-types.json         … 基本ゲーム／拡張の区別
 *   data/staff-picks.json           … スタッフが確認・推薦したもの                  【スタッフ監修】
 *        ↓
 *   src/data/games.json             … サイトが読むデータ（サーバー側のみ）
 *   public/games-index.json         … 絞り込み用の軽量インデックス
 *
 * 大事な決まり
 *   - 「おすすめ」は data/staff-picks.json に書かれたものだけ。人数・時間・年齢などから自動で付けない。
 *   - 人数・時間などから作るのは「2人専用」「6人以上対応」「30分以内」のような検索条件だけ。
 *   - 単体で遊べない拡張は、条件の一覧にも推薦にも単独で出さない。
 */
import fs from 'node:fs';
import path from 'node:path';
import { parsePlayers, parseTime, parseAge, deriveGenre, deriveWeight, genreLabel, ALL_GENRES } from './lib/derive.mjs';

const ROOT = process.cwd();
const readJson = (p, fallback) => (fs.existsSync(path.join(ROOT, p)) ? JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8')) : fallback);

const raw = readJson('data/source/games-raw.json');
const detail = readJson('data/source/games-detail.json');
const contentTypes = readJson('data/content-types.json', { games: {} }).games;
const staffFile = readJson('data/staff-picks.json', { games: {}, updatedAt: '' });
const stockFile = readJson('data/stock.json', { updatedAt: '', games: {} });

/* ------------------------------------------------------- 検索用の正規化 */

const KATA_TO_HIRA = (s) => s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
const normalize = (s) =>
  KATA_TO_HIRA(
    String(s ?? '')
      .toLowerCase()
      .replace(/[！-～]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
      .replace(/[\s　・:：!！?？'"'".,()（）\-–—_]/g, ''),
  );

/** ボドゲーマの会員登録数。並べ替えの内部指標にのみ使い、画面には出さない（おすすめ度ではない）。 */
const popularityOf = (d) => {
  const c = d?.counts ?? {};
  return (c['経験あり'] ?? 0) * 2 + (c['持ってる'] ?? 0) + (c['お気に入り'] ?? 0) * 3 + (c['興味あり'] ?? 0);
};

/* ------------------------------------------------------- 説明文 */

/**
 * 根拠のない評価表現を含む文は、表示用の説明文から外す（下書きの元データは残す）。
 * 受賞歴のような事実は残す。「名作」「完成度が高い」のような評価は、スタッフ監修が付くまで出さない。
 */
const EVALUATIVE = /(名作|傑作|完成度|鉄板(?!焼)|屈指|定番|人気の|人気が高|評価が高|高く評価|代表作|まず候補|間違いな|最高傑作|最高に)/;
let removedSentences = 0;
function sanitize(text) {
  const sentences = text.split(/(?<=。)/).filter(Boolean);
  const kept = sentences.filter((s) => !EVALUATIVE.test(s));
  removedSentences += sentences.length - kept.length;
  return kept.join('').trim();
}

const CONTENT = new Map();
for (const file of fs.readdirSync(path.join(ROOT, 'content/games')).filter((f) => f.endsWith('.json')).sort()) {
  const parsed = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/games', file), 'utf8'));
  for (const [slug, c] of Object.entries(parsed)) {
    if (CONTENT.has(slug)) throw new Error(`content/games: slug "${slug}" が重複しています（${file}）`);
    CONTENT.set(slug, c);
  }
}

/* ------------------------------------------------------- スタッフの推薦 */

const STAFF = staffFile.games ?? {};
const FOR_TWO = new Set(['best', 'good', 'more']);

/* ------------------------------------------------------- 組み立て */

const games = [];
const missingContent = [];
const known = new Set(raw.games.map((r) => r.slug));

for (const [slug] of Object.entries(contentTypes)) if (!known.has(slug)) console.warn(`content-types.json: "${slug}" というゲームはありません`);
for (const [slug] of Object.entries(STAFF)) if (!known.has(slug)) throw new Error(`staff-picks.json: "${slug}" というゲームはありません`);
for (const slug of Object.keys(stockFile.games ?? {})) if (!known.has(slug)) console.warn(`stock.json: "${slug}" というゲームはありません`);

for (const r of raw.games) {
  const d = detail[r.slug] ?? {};
  const c = CONTENT.get(r.slug);
  if (!c) missingContent.push(r.slug);

  const players = parsePlayers(r.playersRaw ?? d.players);
  const time = parseTime(r.timeRaw ?? d.time);
  const minAge = parseAge(r.ageRaw ?? d.age) ?? (Number.isInteger(c?.minAge) ? c.minAge : null);
  const mechanics = Array.isArray(d.mechanics) ? d.mechanics : [];
  const designers = Array.isArray(d.designers) ? d.designers : [];
  const genre = c?.genre && ALL_GENRES.some((g) => g.key === c.genre) ? c.genre : deriveGenre(mechanics);
  const weight = deriveWeight(time, minAge);

  // 種類
  const ct = contentTypes[r.slug] ?? { contentType: 'base', baseGameSlug: null, evidence: null };
  const requiresBaseGame = ct.contentType === 'expansion';
  const baseGameSlug = ct.baseGameSlug && known.has(ct.baseGameSlug) ? ct.baseGameSlug : null;

  // スタッフの推薦（無ければすべて未設定）
  const s = STAFF[r.slug] ?? {};
  if (requiresBaseGame && (s.staffPick || s.forTwo || s.forCouples || s.forBeginners || s.forGroups)) {
    throw new Error(`staff-picks.json: "${r.slug}" は単体で遊べない拡張なので、単独のおすすめにできません`);
  }
  if (s.forTwo && !FOR_TWO.has(s.forTwo)) throw new Error(`staff-picks.json: "${r.slug}" の forTwo は best / good / more のどれかにしてください`);
  const staff = {
    reviewed: s.staffReviewed === true,
    pick: s.staffPick === true,
    forTwo: FOR_TWO.has(s.forTwo) ? s.forTwo : null,
    forCouples: s.forCouples === true,
    forBeginners: s.forBeginners === true,
    forGroups: s.forGroups === true,
    comments: typeof s.comments === 'object' && s.comments ? s.comments : {},
  };

  // 検索条件（客観データだけで決まるもの）。単体で遊べない拡張は入れない。
  const conditions = [];
  if (!requiresBaseGame) {
    if (players && players.min === 2 && players.max === 2) conditions.push('two-only');
    if (players && players.max >= 6) conditions.push('six-plus');
    if (time && time.max <= 30) conditions.push('within-30');
    if (mechanics.includes('協力プレイ')) conditions.push('cooperative');
  }

  const overview = c ? sanitize(c.overview.trim()) : '';
  const howToPlay = c ? sanitize(c.howToPlay.trim()) : '';
  const rulesUnknown = /詳しいルールは店頭でご説明します/.test(c?.howToPlay ?? '');

  const nameJa = (d.titleJa || r.nameJa || '').trim();
  const nameEn = (d.titleEn || r.nameEn || '').trim() || null;
  const aliases = Array.isArray(c?.aliases) ? c.aliases.map(String) : [];

  games.push({
    slug: r.slug,
    nameJa,
    nameEn,
    search: [normalize(nameJa), normalize(nameEn), ...aliases.map(normalize)].filter(Boolean).join(' '),
    aliases,
    // 事実データ（出典: ボドゲーマ）
    players,
    playersLabel: players ? (players.min === players.max ? `${players.min}人` : `${players.min}〜${players.max}人`) : null,
    time,
    timeLabel: time ? (time.min === time.max ? `${time.min}分` : `${time.min}〜${time.max}分`) : null,
    minAge,
    year: r.year ?? null,
    mechanics,
    designers,
    sourceUrl: r.sourceUrl,
    dataStatus: players && time ? 'complete' : 'partial',
    // 当サイトの分類
    genre,
    genreLabel: genreLabel(genre),
    weight,
    conditions,
    contentType: ct.contentType,
    isExpansion: ct.contentType === 'expansion' || ct.contentType === 'standalone-expansion',
    standalone: !requiresBaseGame,
    requiresBaseGame,
    baseGameSlug,
    // スタッフ監修
    staff,
    // 説明文（スタッフ監修前は当サイト作成の下書き）
    overview,
    howToPlay,
    rulesUnknown,
    // 公開ページとして検索に載せてよいか
    indexable: !requiresBaseGame && Boolean(players && time) && !rulesUnknown && overview.length >= 60,
    popularity: popularityOf(d),
    stock: ['available', 'unavailable'].includes(stockFile.games?.[r.slug]) ? stockFile.games[r.slug] : 'unknown',
    stockCheckedAt: ['available', 'unavailable'].includes(stockFile.games?.[r.slug]) ? stockFile.updatedAt || null : null,
    relatedGroups: [],
  });
}

/* ------------------------------------------------------- 関連ゲーム */

/**
 * 類似度で6件埋めるのではなく、関係の意味ごとに分けて出す。該当が無い区分は出さない。
 *   series   … 同じシリーズ（基本ゲーム・拡張・別版）
 *   designer … 同じデザイナー
 *   shorter  … 同じジャンルで、プレイ時間が短いもの
 *   longer   … 同じジャンルで、プレイ時間が長いもの
 */
const bySlug = new Map(games.map((g) => [g.slug, g]));
const familyOf = (g) => g.baseGameSlug ?? g.slug;
const standaloneBase = (o) => !o.requiresBaseGame;

for (const g of games) {
  const others = games.filter((o) => o.slug !== g.slug);
  const groups = [];

  const series = others.filter((o) => familyOf(o) === familyOf(g));
  if (series.length) groups.push({ type: 'series', slugs: series.sort((a, b) => b.popularity - a.popularity).slice(0, 8).map((o) => o.slug) });

  const designer = g.designers.length
    ? others.filter((o) => familyOf(o) !== familyOf(g) && standaloneBase(o) && o.designers.some((x) => g.designers.includes(x)))
    : [];
  if (designer.length) groups.push({ type: 'designer', slugs: designer.sort((a, b) => b.popularity - a.popularity).slice(0, 4).map((o) => o.slug) });

  if (g.time) {
    const pool = others.filter((o) => standaloneBase(o) && familyOf(o) !== familyOf(g) && o.genre === g.genre && o.time);
    const shorter = pool.filter((o) => o.time.max < g.time.min).sort((a, b) => b.popularity - a.popularity).slice(0, 4);
    const longer = pool.filter((o) => o.time.min > g.time.max).sort((a, b) => b.popularity - a.popularity).slice(0, 4);
    if (shorter.length) groups.push({ type: 'shorter', slugs: shorter.map((o) => o.slug) });
    if (longer.length) groups.push({ type: 'longer', slugs: longer.map((o) => o.slug) });
  }
  g.relatedGroups = groups;
}

/* ------------------------------------------------------- 書き出し */

fs.writeFileSync(
  path.join(ROOT, 'src/data/games.json'),
  JSON.stringify({ generatedAt: new Date().toISOString(), source: 'https://bodoge.hoobby.net/spaces/boardgame-lab/games', count: games.length, games }),
);

// クライアントの絞り込み用。本文は入れない。人気順で並べておく。
const index = [...games]
  .sort((a, b) => b.popularity - a.popularity)
  .map((g) => ({
    s: g.slug,
    n: g.nameJa,
    e: [g.nameEn ?? '', ...g.aliases].filter(Boolean).join(' / '),
    p: g.players ? [g.players.min, g.players.max] : null,
    t: g.time ? [g.time.min, g.time.max] : null,
    g: g.genre,
    // 1 なら単体で遊べない拡張
    x: g.requiresBaseGame ? 1 : 0,
    // 1 なら同じシリーズの独立拡張・別版（単体で遊べる）
    v: g.isExpansion && !g.requiresBaseGame ? 1 : 0,
    // 1 ならスタッフおすすめ
    k: g.staff.pick ? 1 : 0,
    c: g.conditions,
  }));
fs.writeFileSync(path.join(ROOT, 'public/games-index.json'), JSON.stringify(index));

const count = (f) => games.filter(f).length;
console.log(`games: ${games.length}`);
console.log(`種類: 基本 ${count((g) => g.contentType === 'base')} / 拡張(単体不可) ${count((g) => g.requiresBaseGame)} / 独立拡張 ${count((g) => g.contentType === 'standalone-expansion')} / 別版 ${count((g) => g.contentType === 'edition')}`);
console.log(`条件: 2人専用 ${count((g) => g.conditions.includes('two-only'))} / 6人以上 ${count((g) => g.conditions.includes('six-plus'))} / 30分以内 ${count((g) => g.conditions.includes('within-30'))} / 協力 ${count((g) => g.conditions.includes('cooperative'))}`);
console.log(`スタッフ: 監修済み ${count((g) => g.staff.reviewed)} / おすすめ ${count((g) => g.staff.pick)} / 2人 ${count((g) => g.staff.forTwo === 'best' || g.staff.forTwo === 'good')} / デート ${count((g) => g.staff.forCouples)} / 初心者 ${count((g) => g.staff.forBeginners)} / 大人数 ${count((g) => g.staff.forGroups)}`);
console.log(`検索に載せるページ: ${count((g) => g.indexable)} / noindex: ${count((g) => !g.indexable)}`);
console.log(`評価表現として外した文: ${removedSentences}`);
console.log(`本文未執筆: ${missingContent.length}`);

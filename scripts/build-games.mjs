/**
 * ゲームデータのビルド。
 *
 *   data/source/games-raw.json      … ボドゲーマの所蔵リストから取得した一覧（608件）
 *   data/source/games-detail.json   … 各ゲームのメカニクス・テーマ・人気度など
 *   content/games/*.json            … 当サイトで書き下ろした紹介文（自社コンテンツ）
 *        ↓ merge + derive
 *   src/data/games.json             … サイトが読むデータ（サーバー側のみ）
 *   public/games-index.json         … 絞り込み用の軽量インデックス（クライアントが遅延取得）
 *
 * 紹介文が未執筆のゲームは status を 'draft' として書き出し、
 * ページは生成するが本文の代わりに「準備中」を出す……のではなく、
 * check-games.mjs で落として公開させない（空ページを作らないため）。
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  parsePlayers,
  parseTime,
  parseAge,
  deriveGenre,
  deriveWeight,
  deriveBeginner,
  deriveCollections,
  genreLabel,
  ALL_GENRES,
} from './lib/derive.mjs';

const ROOT = process.cwd();
const RAW = path.join(ROOT, 'data/source/games-raw.json');
const DETAIL = path.join(ROOT, 'data/source/games-detail.json');
const CONTENT_DIR = path.join(ROOT, 'content/games');

const raw = JSON.parse(fs.readFileSync(RAW, 'utf8'));
const detail = JSON.parse(fs.readFileSync(DETAIL, 'utf8'));

/* ------------------------------------------------------- 検索用の正規化 */

const KATA_TO_HIRA = (s) => s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
const normalize = (s) =>
  KATA_TO_HIRA(
    String(s ?? '')
      .toLowerCase()
      .replace(/[！-～]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
      .replace(/[\s　・:：!！?？'"'".,()（）\-–—_]/g, ''),
  );

/* ------------------------------------------------------- 人気度 */

// ボドゲーマの会員登録数。並べ替えの内部指標にのみ使い、画面には出さない。
const popularityOf = (d) => {
  const c = d?.counts ?? {};
  return (c['経験あり'] ?? 0) * 2 + (c['持ってる'] ?? 0) + (c['お気に入り'] ?? 0) * 3 + (c['興味あり'] ?? 0);
};

/* ------------------------------------------------------- 本文の読み込み */

/**
 * content/games/*.json は「slug をキーにした紹介文のかたまり」。
 * 1ゲーム1ファイルにすると608ファイルになって扱いづらいので、20件ずつのまとまりで置いている。
 * 同じ slug が2つのファイルにあった場合はビルドを失敗させる（どちらが正か決められないため）。
 */
const CONTENT = new Map();
const CONTENT_FILE_OF = new Map();

if (fs.existsSync(CONTENT_DIR)) {
  for (const file of fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.json')).sort()) {
    const parsed = JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8'));
    for (const [slug, c] of Object.entries(parsed)) {
      if (CONTENT.has(slug)) {
        throw new Error(`content/games: slug "${slug}" が ${CONTENT_FILE_OF.get(slug)} と ${file} に重複しています`);
      }
      CONTENT.set(slug, c);
      CONTENT_FILE_OF.set(slug, file);
    }
  }
}

function loadContent(slug) {
  const c = CONTENT.get(slug);
  if (!c) return null;
  const need = ['catch', 'overview', 'howToPlay', 'appeal', 'recommended'];
  for (const k of need) if (typeof c[k] !== 'string' || c[k].trim().length < 10) return null;
  return {
    catch: c.catch.trim(),
    overview: c.overview.trim(),
    howToPlay: c.howToPlay.trim(),
    appeal: c.appeal.trim(),
    recommended: c.recommended.trim(),
    // メカニクスが未登録でジャンルを機械判定できないゲームは、
    // 執筆時に確認した内容にもとづいて genre を上書きできるようにしている。
    genreOverride: typeof c.genre === 'string' ? c.genre : null,
    // 一覧・詳細の項目が「未登録」でも、出典ページの解説文に対象年齢が書かれている
    // ことがある。その場合だけ、執筆時に読み取った値をここで補う。
    minAgeOverride: Number.isInteger(c.minAge) ? c.minAge : null,
    // 通称・略称・別表記。「ito」「6ニムト」のように、正式名と違う呼び方で探されるものを書く。
    aliases: Array.isArray(c.aliases) ? c.aliases.map(String) : [],
  };
}

/**
 * パッケージ画像があるかどうか。build-game-images.mjs が作るファイルを読む。
 * まだ画像を取得していない段階でもビルドが通るよう、無ければ空として扱う。
 */
const imagesPath = path.join(ROOT, 'src/data/game-images.json');
const gameImages = fs.existsSync(imagesPath) ? JSON.parse(fs.readFileSync(imagesPath, 'utf8')).images : {};

/**
 * 店舗で確認した在庫の記録（data/stock.json）。スタッフが手で書き換える。
 * 載っていないタイトルは 'unknown'。ボドゲーマの登録数と店内の実態は一致しないので、
 * 「ある」と書けるのは店舗が確認したものだけにする。
 */
const stockPath = path.join(ROOT, 'data/stock.json');
const stockFile = fs.existsSync(stockPath)
  ? JSON.parse(fs.readFileSync(stockPath, 'utf8'))
  : { updatedAt: '', games: {} };
const STOCK_VALUES = new Set(['available', 'unavailable']);
for (const [slug, v] of Object.entries(stockFile.games ?? {})) {
  if (!STOCK_VALUES.has(v)) console.warn('stock.json: ' + slug + ' の値 "' + v + '" は available / unavailable のどちらかにしてください');
}

/* ------------------------------------------------------- 組み立て */

const games = [];
const missingContent = [];

for (const r of raw.games) {
  const d = detail[r.slug] ?? {};

  // 数値は一覧ページと詳細ページの両方から取り、食い違ったら一覧側（新しい方）を採る
  const players = parsePlayers(r.playersRaw ?? d.players);
  const time = parseTime(r.timeRaw ?? d.time);

  const mechanics = Array.isArray(d.mechanics) ? d.mechanics : [];
  const themes = Array.isArray(d.themes) ? d.themes : [];
  const designers = Array.isArray(d.designers) ? d.designers : [];

  const content = loadContent(r.slug);
  if (!content) missingContent.push(r.slug);

  const minAge = parseAge(r.ageRaw ?? d.age) ?? content?.minAgeOverride ?? null;

  const genre =
    content?.genreOverride && ALL_GENRES.some((g) => g.key === content.genreOverride)
      ? content.genreOverride
      : deriveGenre(mechanics);
  const weight = deriveWeight(time, minAge);
  const popularity = popularityOf(d);
  const beginner = deriveBeginner({ time, minAge, weight, popularity });
  const collections = deriveCollections({ players, time, minAge, weight, genre, beginner, mechanics });

  const nameJa = (d.titleJa || r.nameJa || '').trim();
  const nameEn = (d.titleEn || r.nameEn || '').trim() || null;

  games.push({
    slug: r.slug,
    nameJa,
    nameEn,
    search: [normalize(nameJa), normalize(nameEn)].filter(Boolean).join(' '),
    players,
    playersLabel: players ? (players.min === players.max ? `${players.min}人` : `${players.min}〜${players.max}人`) : null,
    time,
    timeLabel: time ? (time.min === time.max ? `${time.min}分` : `${time.min}〜${time.max}分`) : null,
    minAge,
    year: r.year ?? null,
    genre,
    genreLabel: genreLabel(genre),
    weight,
    beginner,
    collections,
    themes,
    mechanics,
    designers,
    dataStatus: players && time ? 'complete' : 'partial',
    sourceUrl: r.sourceUrl,
    popularity,
    hasImage: Object.hasOwn(gameImages, r.slug),
    stock: STOCK_VALUES.has(stockFile.games?.[r.slug]) ? stockFile.games[r.slug] : 'unknown',
    stockCheckedAt: STOCK_VALUES.has(stockFile.games?.[r.slug]) ? stockFile.updatedAt || null : null,
    aliases: content?.aliases ?? [],
    related: [],
    catch: content?.catch ?? '',
    overview: content?.overview ?? '',
    howToPlay: content?.howToPlay ?? '',
    appeal: content?.appeal ?? '',
    recommended: content?.recommended ?? '',
  });
}

// stock.json に、存在しない slug が書かれていないか
{
  const known = new Set(games.map((g) => g.slug));
  for (const slug of Object.keys(stockFile.games ?? {})) {
    if (!known.has(slug)) console.warn('stock.json: "' + slug + '" というゲームはありません（slugの綴りを確認してください）');
  }
}

/* ------------------------------------------------------- 関連ゲーム */

/**
 * 同ジャンル → 人数帯が近い → プレイ時間が近い、の順でスコアをつけて上位6件。
 * 一方向だけのリンクにならないよう、相手からも辿れるかは check-games.mjs で確認する。
 */
const overlap = (a, b) => a.filter((x) => b.includes(x)).length;

for (const g of games) {
  const scored = games
    .filter((o) => o.slug !== g.slug)
    .map((o) => {
      let s = 0;
      if (o.genre === g.genre) s += 6;
      s += overlap(g.mechanics, o.mechanics) * 2;
      s += overlap(g.collections, o.collections);
      if (g.players && o.players) {
        const d = Math.abs(g.players.min - o.players.min) + Math.abs(g.players.max - o.players.max);
        s += Math.max(0, 4 - d);
      }
      if (g.time && o.time) {
        const d = Math.abs((g.time.max ?? 0) - (o.time.max ?? 0));
        s += d <= 15 ? 3 : d <= 40 ? 1 : 0;
      }
      if (g.designers.length && overlap(g.designers, o.designers)) s += 5;
      // 同じ作品の別版・拡張は名前が似るので拾いやすくする
      if (o.nameJa.startsWith(g.nameJa.slice(0, 4)) && g.nameJa.length >= 4) s += 4;
      return { slug: o.slug, s, pop: o.popularity };
    })
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || b.pop - a.pop);

  g.related = scored.slice(0, 6).map((x) => x.slug);
}

/**
 * どこからも関連リンクされないゲーム（行き止まり）をなくす。
 * 自分が関連として挙げた相手の枠を1つ借りて、相互に行き来できるようにする。
 * 枠を空けたことで新たな行き止まりが生まれないよう、被リンクが2件以上ある相手だけ外す。
 */
const bySlug = new Map(games.map((g) => [g.slug, g]));
const inbound = new Map(games.map((g) => [g.slug, 0]));
for (const g of games) for (const r of g.related) inbound.set(r, inbound.get(r) + 1);

for (const g of games) {
  if (inbound.get(g.slug) > 0) continue;
  for (const cand of g.related) {
    const n = bySlug.get(cand);
    if (n.related.includes(g.slug)) break;
    const last = n.related[n.related.length - 1];
    if (!last || inbound.get(last) <= 1) continue;
    n.related[n.related.length - 1] = g.slug;
    inbound.set(last, inbound.get(last) - 1);
    inbound.set(g.slug, 1);
    break;
  }
}

/* ------------------------------------------------------- 書き出し */

fs.mkdirSync(path.join(ROOT, 'src/data'), { recursive: true });
fs.writeFileSync(
  path.join(ROOT, 'src/data/games.json'),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      source: raw.games[0]?.sourceUrl ? 'https://bodoge.hoobby.net/spaces/boardgame-lab/games' : '',
      count: games.length,
      games,
    },
    null,
    0,
  ),
);

// クライアントの絞り込み用。本文と、クライアント側で再計算できる項目は入れない。
// 人気順であらかじめ並べておくので、並べ替え用のスコアも持たせない。
const index = [...games]
  .sort((a, b) => b.popularity - a.popularity)
  .map((g) => ({
    s: g.slug,
    n: g.nameJa,
    // 英名と別名をまとめて検索対象にする（表示には使わない）
    e: [g.nameEn ?? '', ...(g.aliases ?? [])].filter(Boolean).join(' / '),
    p: g.players ? [g.players.min, g.players.max] : null,
    t: g.time ? [g.time.min, g.time.max] : null,
    a: g.minAge,
    g: g.genre,
    w: g.weight,
    b: g.beginner ? 1 : 0,
    c: g.collections,
    // 1 ならパッケージ画像あり。0 の場合クライアントはSVGを描く。
    i: Object.hasOwn(gameImages, g.slug) ? 1 : 0,
  }));
fs.mkdirSync(path.join(ROOT, 'public'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'public/games-index.json'), JSON.stringify(index));

const stats = {};
for (const g of games) stats[g.genre] = (stats[g.genre] ?? 0) + 1;
const colStats = {};
for (const g of games) for (const c of g.collections) colStats[c] = (colStats[c] ?? 0) + 1;

console.log(`games: ${games.length}`);
console.log(`genres:`, stats);
console.log(`collections:`, colStats);
console.log(`dataStatus partial: ${games.filter((g) => g.dataStatus === 'partial').length}`);
console.log(`本文未執筆: ${missingContent.length}`);
if (missingContent.length) {
  fs.writeFileSync(path.join(ROOT, 'data/source/missing-content.json'), JSON.stringify(missingContent, null, 2));
  console.log(`  -> data/source/missing-content.json に書き出しました`);
}
console.log(`index: ${(fs.statSync(path.join(ROOT, 'public/games-index.json')).size / 1024).toFixed(1)} KB`);

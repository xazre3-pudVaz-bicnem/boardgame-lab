/**
 * 公開前のゲームデータ検証。
 * 1件でも落ちたら exit 1 にして、ビルドを止める。
 *
 *  - ボドゲーマで確認できた全タイトルが登録されているか（件数照合）
 *  - slug が重複していないか
 *  - 全ゲームに本文が揃っているか（空欄・ダミーがないか）
 *  - 別のゲームに同じ説明文を使い回していないか
 *  - 本文に、数値データにない人数・時間・年齢を書いていないか
 *  - 関連ゲームのリンク先がすべて存在するか
 *  - コレクション／ジャンルのページに載るゲームが1件以上あるか
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const built = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/games.json'), 'utf8'));
const raw = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/source/games-raw.json'), 'utf8'));
const games = built.games;

const errors = [];
const warnings = [];
const fail = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

/* ---------------------------------------------------- 件数とスラッグ */

if (raw.reportedTotal && games.length !== raw.reportedTotal) {
  fail(`件数不一致: サイト ${games.length}件 / 取得元の表示 ${raw.reportedTotal}件`);
}
if (games.length !== raw.games.length) {
  fail(`件数不一致: サイト ${games.length}件 / 取得データ ${raw.games.length}件`);
}
const slugs = new Set();
for (const g of games) {
  if (slugs.has(g.slug)) fail(`slug重複: ${g.slug}`);
  slugs.add(g.slug);
  if (!/^[a-z0-9][a-z0-9-]*$/.test(g.slug)) fail(`slugに使えない文字: ${g.slug}`);
}

/* ---------------------------------------------------- 本文の充足 */

const FIELDS = ['catch', 'overview', 'howToPlay', 'appeal', 'recommended'];
const MIN = { catch: 10, overview: 70, howToPlay: 70, appeal: 60, recommended: 34 };
const PLACEHOLDER = /(準備中|coming soon|TBD|ダミーテキスト|ダミー文|lorem ipsum|未定です|テキストを入力|ここに説明)/i;

for (const g of games) {
  if (!g.nameJa) fail(`${g.slug}: 和名が空`);
  for (const f of FIELDS) {
    const v = g[f] ?? '';
    if (!v.trim()) fail(`${g.slug}: ${f} が空`);
    else if (v.length < MIN[f]) fail(`${g.slug}: ${f} が短すぎる (${v.length}字)`);
    if (PLACEHOLDER.test(v)) fail(`${g.slug}: ${f} にダミー文言`);
  }
}

/* ---------------------------------------------------- 使い回しの検出 */

// 完全一致
for (const f of FIELDS) {
  const seen = new Map();
  for (const g of games) {
    const key = g[f].trim();
    if (!key) continue;
    if (seen.has(key)) fail(`${f} が完全一致: ${seen.get(key)} と ${g.slug}`);
    else seen.set(key, g.slug);
  }
}

// 近似（3-gram の Jaccard 係数）。テンプレ流用を検出する。
const grams = (s) => {
  const t = s.replace(/[\s。、！？「」『』（）()・]/g, '');
  const out = new Set();
  for (let i = 0; i + 3 <= t.length; i++) out.add(t.slice(i, i + 3));
  return out;
};
const jaccard = (a, b) => {
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter || 1);
};

for (const f of ['overview', 'howToPlay', 'appeal']) {
  const vecs = games.map((g) => ({ slug: g.slug, s: grams(g[f]) }));
  for (let i = 0; i < vecs.length; i++) {
    for (let j = i + 1; j < vecs.length; j++) {
      const sim = jaccard(vecs[i].s, vecs[j].s);
      if (sim > 0.62) fail(`${f} が酷似 (${(sim * 100) | 0}%): ${vecs[i].slug} / ${vecs[j].slug}`);
      else if (sim > 0.5) warn(`${f} がやや似ている (${(sim * 100) | 0}%): ${vecs[i].slug} / ${vecs[j].slug}`);
    }
  }
}

/* ---------------------------------------------------- 数値の整合 */

/**
 * 本文に書いた人数・時間・年齢が、取得できた数値と矛盾していないかを確認する。
 *
 * 「2〜3人用の裏面がある」「5〜6人用モジュール」のように、対応範囲の一部を
 * 指す書き方は正しいので、範囲の外にはみ出したときだけエラーにする。
 * 数値がまったく取れていないゲームで本文に数値を書いていた場合もエラーにする。
 */
const outside = (lo, hi, d) => lo < d.min || hi > d.max;

for (const g of games) {
  const text = `${g.overview} ${g.howToPlay} ${g.appeal} ${g.recommended}`;

  for (const m of text.matchAll(/(d+)〜(d+)人/g)) {
    const [lo, hi] = [+m[1], +m[2]];
    if (!g.players) fail(`${g.slug}: 人数データがないのに本文に「${m[0]}」`);
    else if (outside(lo, hi, g.players))
      fail(`${g.slug}: 本文「${m[0]}」がデータ(${g.players.min}〜${g.players.max}人)の範囲外`);
  }
  // 「3〜4人専用」の「4人専用」を拾わないよう、直前が数字や範囲記号でないものだけ見る
  for (const m of text.matchAll(/(?<![0-9〜～])(d+)人専用/g)) {
    const n = +m[1];
    if (!g.players) fail(`${g.slug}: 人数データがないのに本文に「${m[0]}」`);
    else if (g.players.min !== n || g.players.max !== n)
      fail(`${g.slug}: 本文「${m[0]}」がデータ(${g.players.min}〜${g.players.max}人)と不一致`);
  }
  for (const m of text.matchAll(/(d+)歳から/g)) {
    const n = +m[1];
    if (g.minAge == null) fail(`${g.slug}: 対象年齢データがないのに本文に「${m[0]}」`);
    else if (g.minAge !== n) fail(`${g.slug}: 本文「${m[0]}」がデータ(${g.minAge}歳〜)と不一致`);
  }
  for (const m of text.matchAll(/(d+)〜(d+)分/g)) {
    const [lo, hi] = [+m[1], +m[2]];
    if (!g.time) fail(`${g.slug}: 時間データがないのに本文に「${m[0]}」`);
    else if (outside(lo, hi, g.time))
      fail(`${g.slug}: 本文「${m[0]}」がデータ(${g.time.min}〜${g.time.max}分)の範囲外`);
  }
}

/* ---------------------------------------------------- 内部リンク */

for (const g of games) {
  if (g.related.length === 0) warn(`${g.slug}: 関連ゲームが0件`);
  for (const r of g.related) {
    if (!slugs.has(r)) fail(`${g.slug}: 関連ゲーム "${r}" が存在しない`);
    if (r === g.slug) fail(`${g.slug}: 自分自身を関連ゲームに含んでいる`);
  }
}

// 誰からも関連として参照されないゲーム（行き止まり）を把握する
const referenced = new Set();
for (const g of games) for (const r of g.related) referenced.add(r);
const orphans = games.filter((g) => !referenced.has(g.slug));
if (orphans.length) warn(`どこからも関連リンクされていないゲーム: ${orphans.length}件`);

/* ---------------------------------------------------- 一覧ページの中身 */

const COLLECTION_KEYS = [
  'for-beginners',
  'for-two',
  'party',
  'short-play',
  'for-couples',
  'for-groups',
  'heavy',
  'cooperative',
  'solo',
];
for (const key of COLLECTION_KEYS) {
  const n = games.filter((g) => g.collections.includes(key)).length;
  if (n === 0) fail(`コレクション "${key}" に該当するゲームが0件`);
  else if (n < 8) warn(`コレクション "${key}" が ${n}件しかない`);
}
// /games/<slug> はゲーム詳細とコレクションで共有している。衝突すると片方が消える。
for (const key of COLLECTION_KEYS) {
  if (slugs.has(key)) fail(`コレクション "${key}" と同じslugのゲームがある（URLが衝突する）`);
}
for (const reserved of ['list', 'genre', 'search']) {
  if (slugs.has(reserved)) fail(`予約語 "${reserved}" と同じslugのゲームがある（URLが衝突する）`);
}

const genreCount = {};
for (const g of games) genreCount[g.genre] = (genreCount[g.genre] ?? 0) + 1;
for (const [k, n] of Object.entries(genreCount)) {
  if (n < 5) warn(`ジャンル "${k}" が ${n}件しかない`);
}

/* ---------------------------------------------------- 画像 */

for (const g of games) {
  if (typeof g.sourceUrl !== 'string' || !g.sourceUrl.startsWith('https://bodoge.hoobby.net/games/'))
    fail(`${g.slug}: 出典URLが不正`);
}

/**
 * パッケージ画像。
 * hasImage が立っているゲームは、2サイズとも書き出されていなければならない。
 * 画像が無いゲームはインラインSVG（GameTile）に落ちるので、欠けていること自体は問題にしない。
 */
const imagesPath = path.join(ROOT, 'src/data/game-images.json');
if (fs.existsSync(imagesPath)) {
  const meta = JSON.parse(fs.readFileSync(imagesPath, 'utf8')).images;
  const pubDir = path.join(ROOT, 'public/games');
  const files = fs.existsSync(pubDir) ? new Set(fs.readdirSync(pubDir)) : new Set();

  let withImage = 0;
  for (const g of games) {
    const declared = Boolean(g.hasImage);
    const known = Object.hasOwn(meta, g.slug);
    if (declared !== known) fail(`${g.slug}: hasImage と game-images.json が食い違う`);
    if (!declared) continue;
    withImage++;
    for (const size of [320, 480]) {
      if (!files.has(`${g.slug}-${size}.webp`)) fail(`${g.slug}: 画像 ${size}px が書き出されていない`);
    }
  }

  // 同じ画像が2つ以上のゲームに割り当たっていたら、取り違えの可能性がある
  const byHash = new Map();
  for (const [slug, m] of Object.entries(meta)) {
    if (!byHash.has(m.hash)) byHash.set(m.hash, []);
    byHash.get(m.hash).push(slug);
  }
  for (const [, slugs] of byHash) {
    if (slugs.length > 1) fail(`同じ画像が複数のゲームに使われている: ${slugs.join(' / ')}`);
  }

  // 使われていない画像ファイルが public に残っていないか
  const expected = new Set();
  for (const slug of Object.keys(meta)) for (const s of [320, 480]) expected.add(`${slug}-${s}.webp`);
  for (const f of files) if (!expected.has(f)) warn(`public/games に不要なファイル: ${f}`);

  console.log(`パッケージ画像あり: ${withImage}件 / 画像なし（SVG表示）: ${games.length - withImage}件`);
}

/* ---------------------------------------------------- 結果 */

console.log(`検証対象: ${games.length}件`);
console.log(`人数・時間の両方が取れているもの: ${games.filter((g) => g.dataStatus === 'complete').length}件`);
console.log(`一部の数値が未確認のもの: ${games.filter((g) => g.dataStatus === 'partial').length}件`);

if (warnings.length) {
  console.log(`\n警告 ${warnings.length}件`);
  for (const w of warnings.slice(0, 30)) console.log(`  - ${w}`);
  if (warnings.length > 30) console.log(`  ... 他 ${warnings.length - 30}件`);
}
if (errors.length) {
  console.error(`\nエラー ${errors.length}件`);
  for (const e of errors.slice(0, 60)) console.error(`  x ${e}`);
  if (errors.length > 60) console.error(`  ... 他 ${errors.length - 60}件`);
  process.exit(1);
}
console.log('\nOK: すべての検証を通過しました。');

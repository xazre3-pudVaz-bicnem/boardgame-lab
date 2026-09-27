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

// 画面に出す説明文は overview と howToPlay だけ（キャッチ・魅力・おすすめ文は表示しない）
const FIELDS = ['overview', 'howToPlay'];
const MIN = { overview: 40, howToPlay: 40 };
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

for (const f of ['overview', 'howToPlay']) {
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
  const text = `${g.overview} ${g.howToPlay}`;

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

/* ---------------------------------------------------- 関連ゲーム */

for (const g of games) {
  for (const grp of g.relatedGroups) {
    for (const r of grp.slugs) {
      if (!slugs.has(r)) fail(`${g.slug}: 関連ゲーム "${r}" が存在しない`);
      if (r === g.slug) fail(`${g.slug}: 自分自身を関連ゲームに含んでいる`);
    }
  }
}

/* ---------------------------------------------------- 種類・推薦 */

for (const g of games) {
  // 単体で遊べない拡張は、条件の一覧にも推薦にも単独で出さない
  if (g.requiresBaseGame) {
    if (g.conditions.length) fail(`${g.slug}: 単体で遊べない拡張が条件の一覧に入っている`);
    if (g.staff.pick || g.staff.forTwo || g.staff.forCouples || g.staff.forBeginners || g.staff.forGroups)
      fail(`${g.slug}: 単体で遊べない拡張が推薦されている`);
    if (g.indexable) fail(`${g.slug}: 単体で遊べない拡張が検索対象になっている`);
  }
  if (g.baseGameSlug && !slugs.has(g.baseGameSlug)) fail(`${g.slug}: baseGameSlug "${g.baseGameSlug}" が存在しない`);
  // 「おすすめ」は staff-picks.json 由来だけ。説明文に評価表現が残っていないか
  if (/(名作|傑作|完成度|鉄板(?!焼)|屈指|定番)/.test(g.overview + g.howToPlay)) fail(`${g.slug}: 説明文に根拠のない評価表現が残っている`);
}

// 条件ページとゲームのslugが衝突していないか（/games/<slug> を共有しているため）
for (const key of ['for-two', 'for-groups', 'short-play', 'cooperative', 'list', 'genre']) {
  if (slugs.has(key)) fail(`"${key}" と同じslugのゲームがある（URLが衝突する）`);
}

/* ---------------------------------------------------- シーンページの写真 */

// 同じ写真を複数のシーンページのヒーローに使わない
{
  const src = fs.readFileSync(path.join(ROOT, 'src/data/scenes.ts'), 'utf8');
  const photos = [...src.matchAll(/^s{4}photo: '([a-z0-9-]+)'/gm)].map((m) => m[1]);
  const seen = new Set();
  for (const p of photos) {
    if (seen.has(p)) fail(`シーンページで写真 "${p}" が複数のヒーローに使われている`);
    seen.add(p);
  }
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

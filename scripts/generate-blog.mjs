/**
 * 読みもの（/blog）の記事を1本だけ書き足す。
 *
 *   node scripts/generate-blog.mjs
 *
 * 使うもの
 *   ANTHROPIC_API_KEY … Claude API のキー（GitHub Actions の Secret）
 *   CLAUDE_MODEL      … 省略時 claude-haiku-4-5-20251001
 *   DRY_RUN_FIXTURE   … APIを呼ばずに、指定したJSONを応答として扱う（検証用）
 *
 * 設計のねらい
 *   - 量を出すための記事は書かない。ゲートを1つでも落ちたら何も書き出さずに終わる。
 *   - 店舗の営業情報（時間・料金・定休日）は src/data/shop.ts の値だけを事実として渡し、
 *     それ以外の数字を本文に書いたら落とす。在庫・イベント開催の断定も落とす。
 *   - ゲームの人数・時間は games.json の値と突き合わせ、食い違ったら落とす。
 *   - /news（店舗からの告知）と役割が重ならないよう、営業案内そのものは題材にしない。
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'content/blog');
const MODEL = process.env.CLAUDE_MODEL ?? 'claude-haiku-4-5-20251001';

const games = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/games.json'), 'utf8')).games;
const gameBySlug = new Map(games.map((g) => [g.slug, g]));

/* ------------------------------------------------------------ 店舗の事実 */

/**
 * 本文に書いてよい店舗の数値。src/data/shop.ts と同じ値をここに写している。
 * （.ts を直接読めないので二重管理になる。値を変えたら両方直すこと。
 *   ズレたら scripts/check-shop-facts.mjs が落ちる）
 */
const SHOP_FACTS = {
  name: 'BODOlab.（ボードゲームラボ／ボドラボ）',
  address: '大阪府大阪市北区豊崎5-7-21 おおきに豊崎西公園ビル3F',
  access: '大阪メトロ御堂筋線・中津駅1番出口から徒歩3分、阪急大阪梅田駅の茶屋町口から徒歩10分',
  hoursWeekday: '平日18:30〜23:30',
  hoursWeekend: '土日祝13:00〜23:30',
  closed: '月曜日（祝日の場合は営業）',
  earlyClose: '21:00の時点でお客様がいない場合は閉店することがある',
  priceUnit: '1時間600円（相席可でのご利用は1時間500円）',
  priceCap: '上限は平日2,500円（相席2,000円）、土日祝3,000円（相席2,500円）',
  guaranteed: '席の利用時間の保証は5時間まで',
  student: '学生証の提示で20%引きの料金で利用できる',
  food: '飲食物の販売はしていない。持ち込みは可能で、蓋付きの飲み物はプレイ中も飲める',
  reservation: '席の予約はご来店予約フォームからのみ。電話・メール・LINEでは受け付けていない',
  titles: '取り扱いタイトルは日々増えているので、タイトル数・種類数の数字は書かない',
  rotation: '取り扱いタイトルは入れ替わることがあるため、特定のタイトルが常にあるとは限らない',
};

/** 本文に出てよい数字。これ以外の「◯円」「◯時」は捏造とみなす。 */
const ALLOWED_PRICES = [500, 600, 2000, 2500, 3000];
const ALLOWED_HOURS = ['18:30', '23:30', '13:00', '21:00'];

/* ------------------------------------------------------------ お題 */

/**
 * 1記事1クエリ。すでに書いた intent は二度と出さない。
 * トップや /scene・/games のページと主題が重ならないものを選んでいる。
 */
const TOPICS = [
  { intent: 'ボードゲーム 2人 おすすめ', title: '2人で遊ぶときのゲームの選び方', category: '選び方' },
  { intent: 'ボードゲーム 初心者 選び方', title: 'はじめての1本をどう選ぶか', category: '選び方' },
  { intent: 'ボードゲーム 4人 定番', title: '4人そろった日に遊びたいタイプ', category: '選び方' },
  { intent: 'ボードゲーム 短時間', title: '30分で終わるゲームの良さ', category: '遊び方' },
  { intent: 'ボードゲーム ルール 覚え方', title: 'ルール説明を聞くときのコツ', category: '遊び方' },
  { intent: 'ボードゲーム 協力型 とは', title: '勝ち負けが分かれない協力型という遊び方', category: 'ジャンル' },
  { intent: 'トリックテイキング とは', title: 'トリックテイキングを一度も遊んだことがない人へ', category: 'ジャンル' },
  { intent: '正体隠匿 ボードゲーム とは', title: '正体を隠すゲームが苦手な人にも向く遊び方', category: 'ジャンル' },
  { intent: 'アブストラクト ボードゲーム とは', title: '運が絡まないアブストラクトの魅力', category: 'ジャンル' },
  { intent: 'ボードゲーム 大人数 コツ', title: '人数が多い日にゲームを選ぶときの考え方', category: '遊び方' },
  { intent: 'ボードゲーム 相席 不安', title: '相席ではじめて会う人と遊ぶとき', category: '遊び方' },
  { intent: 'ボードゲーム プレゼント 選び方', title: '贈りものにボードゲームを選ぶなら', category: '選び方' },
  { intent: 'ボードゲーム 重さ 中量級 とは', title: '「重さ」という言葉が指しているもの', category: '用語' },
  { intent: 'ワーカープレイスメント とは', title: 'ワーカープレイスメントという仕組み', category: '用語' },
  { intent: 'ドラフト ボードゲーム とは', title: 'ドラフトという仕組みが面白い理由', category: '用語' },
  { intent: 'ボードゲーム デッキ構築 とは', title: 'デッキ構築という遊び方の入口', category: '用語' },
  { intent: '梅田 遊ぶところ 大人', title: '梅田周辺で大人が時間をつぶせる場所を探すなら', category: 'エリア' },
  { intent: '中津 駅前 過ごし方', title: '中津という街の、夜の過ごし方', category: 'エリア' },
  { intent: '大阪 雨 予定変更', title: '雨で予定が流れた日の切り替え方', category: 'エリア' },
  { intent: 'ボードゲーム 一人 遊べる', title: 'ひとりで遊ぶボードゲームという選択', category: '遊び方' },
];

/* ------------------------------------------------------------ 既存記事 */

fs.mkdirSync(OUT_DIR, { recursive: true });

function existingPosts() {
  return fs
    .readdirSync(OUT_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const raw = fs.readFileSync(path.join(OUT_DIR, f), 'utf8');
      const fm = raw.match(/^---\n([\s\S]*?)\n---/);
      const get = (k) => {
        const m = fm?.[1].match(new RegExp(`^${k}:\\s*(.*)$`, 'm'));
        return m ? m[1].trim().replace(/^['"]|['"]$/g, '') : '';
      };
      return { file: f, slug: f.replace(/\.md$/, ''), intent: get('intent'), title: get('title'), body: raw };
    });
}

/* ------------------------------------------------------------ 類似度 */

const bigrams = (s) => {
  const t = s.replace(/[\s。、！？「」『』（）()・\n#*[\]-]/g, '');
  const out = new Set();
  for (let i = 0; i + 2 <= t.length; i++) out.add(t.slice(i, i + 2));
  return out;
};
const jaccard = (a, b) => {
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter || 1);
};

/* ------------------------------------------------------------ 検証 */

const NG_PATTERNS = [
  { re: /在庫(が)?(あり|ございま|確実)/, why: '在庫があると断定している' },
  { re: /必ず(遊べ|ご用意|あり)/, why: '在庫や提供を保証している' },
  { re: /開催(します|いたします|予定です)/, why: '未確認のイベント開催を断定している' },
  { re: /カフェ(で|の)(food|フード|ドリンクを提供|食事を提供)/, why: '飲食提供があると読める' },
  { re: /ドリンク(が|も)?(飲み放題|付き|提供)/, why: '飲食提供があると読める' },
  { re: /梅田(駅)?(に|の)(ある|店舗|お店)/, why: '所在地を梅田だと書いている' },
  { re: /(検索|SEO)(で|に)(上位|強く|有利)/, why: '検索順位についての言及' },
  { re: /口コミ|レビュー評価|★|評価\d/, why: '実在しない評価に触れている' },
  { re: /(https?:\/\/)(?!www\.boardgame-lab\.com)/, why: '外部URLを本文に書いている' },
  // 特定のゲームを「おすすめ」と断定できるのはスタッフだけ（data/staff-picks.json）。記事では書かせない
  { re: /(おすすめ|オススメ)(です|します|の(一本|ゲーム|タイトル))|一押し|イチオシ/, why: 'スタッフが確認していないゲームのおすすめ' },
];

function validate(post) {
  const errs = [];
  const body = post.body ?? '';
  const all = `${post.title} ${post.description} ${body}`;

  if (!post.title || post.title.length < 10 || post.title.length > 46) errs.push('titleの長さが範囲外');
  if (!post.description || post.description.length < 60 || post.description.length > 120)
    errs.push('descriptionの長さが範囲外（60〜120字）');
  if (body.length < 900) errs.push(`本文が短い（${body.length}字）`);
  if (body.length > 3200) errs.push(`本文が長い（${body.length}字）`);

  const h2 = body.match(/^##\s+/gm)?.length ?? 0;
  if (h2 < 3) errs.push(`h2が少ない（${h2}個）`);

  for (const ng of NG_PATTERNS) if (ng.re.test(all)) errs.push(`禁止表現: ${ng.why}`);

  // 店舗の数字。許可した値以外は出させない。
  for (const m of all.matchAll(/([0-9,]+)\s*円/g)) {
    const n = Number(m[1].replace(/,/g, ''));
    if (!ALLOWED_PRICES.includes(n)) errs.push(`未確認の金額: ${m[0]}`);
  }
  for (const m of all.matchAll(/(\d{1,2}):(\d{2})/g)) {
    if (!ALLOWED_HOURS.includes(m[0])) errs.push(`未確認の時刻: ${m[0]}`);
  }
  for (const m of all.matchAll(/徒歩\s*(\d+)\s*分/g)) {
    if (!['3', '10'].includes(m[1])) errs.push(`未確認の所要時間: ${m[0]}`);
  }

  // 取り上げたゲームは実在していること、数値が一致していること
  for (const slug of post.games ?? []) {
    const g = gameBySlug.get(slug);
    if (!g) {
      errs.push(`存在しないゲーム: ${slug}`);
      continue;
    }
    if (!all.includes(g.nameJa)) errs.push(`games に挙げた ${g.nameJa} が本文に出てこない`);
  }
  // 本文中の人数・時間が、挙げたゲームのデータと矛盾していないか
  for (const m of body.matchAll(/([^\s、。]{2,20})は(\d+)〜(\d+)人/g)) {
    const g = games.find((x) => x.nameJa === m[1]);
    if (g && g.players && (g.players.min !== +m[2] || g.players.max !== +m[3]))
      errs.push(`${m[1]} の人数がデータと不一致（本文 ${m[2]}〜${m[3]}人 / データ ${g.players.min}〜${g.players.max}人）`);
  }

  // 内部リンクの行き先が存在するか
  // 2026-09 のページ整理後の構成。条件の一覧は客観データだけで作ったもの（おすすめではない）
  const COLLECTIONS = new Set(['for-two', 'for-groups', 'short-play', 'cooperative', 'list']);
  const PAGES = new Set([
    '/', '/games', '/games/list', '/system', '/access', '/faq', '/news', '/schedule', '/contact', '/blog',
    '/part-timejob', '/scene', '/area/umeda',
    '/scene/rainy-day', '/scene/indoor-date', '/scene/group', '/scene/solo', '/scene/after-work', '/scene/first-time',
  ]);
  let links = 0;
  for (const m of body.matchAll(/\[[^\]]+\]\((\/[^)]*)\)/g)) {
    links++;
    const href = m[1];
    if (PAGES.has(href)) continue;
    if (href.startsWith('/games/genre/')) continue;
    if (href.startsWith('/games/')) {
      const key = href.slice('/games/'.length);
      if (COLLECTIONS.has(key) || gameBySlug.has(key)) continue;
    }
    errs.push(`リンク切れ: ${href}`);
  }
  if (links < 2) errs.push('内部リンクが2本未満');

  return errs;
}

/* ------------------------------------------------------------ プロンプト */

function buildPrompt(topic, posted) {
  const pool = games
    .filter((g) => g.popularity > 0)
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 120)
    .map((g) => `- ${g.nameJa}（slug: ${g.slug} / ${g.playersLabel ?? '人数未確認'} / ${g.timeLabel ?? '時間未確認'} / ${g.genreLabel}）`)
    .join('\n');

  return `あなたは大阪・中津のボードゲームプレイスペース「${SHOP_FACTS.name}」のウェブ担当です。
読みもののコラムを1本書いてください。

# 今回のテーマ
検索意図: ${topic.intent}
仮タイトル: ${topic.title}
カテゴリ: ${topic.category}

# すでに公開している記事（題材が重ならないようにしてください）
${posted.length ? posted.map((p) => `- ${p.title}（intent: ${p.intent}）`).join('\n') : '- （まだありません）'}

# 事実として使ってよい店舗情報（これ以外の数字を書かないでください）
${Object.entries(SHOP_FACTS)
  .map(([k, v]) => `- ${v}`)
  .join('\n')}

# 本文に出してよいゲーム（この一覧にあるものだけ。人数・時間はここに書かれた値をそのまま使う）
${pool}

# 守ること
- 在庫や貸出状況を保証しない。「必ず遊べます」「在庫があります」とは書かない。
- イベントの開催を断定しない。
- 当店は飲食物を販売していません。カフェとして食事や飲み物を出すとは書かない。
- 店舗は大阪市北区豊崎（中津）にあります。梅田にあるとは書かない。
- 検索順位やSEO効果に触れない。
- 外部サイトのURLは書かない。内部リンクだけを使う。
- 一文は60文字以内を目安に。誇張や感嘆符の多用は避け、落ち着いた文体で。
- 内部リンクを2〜5本入れる。使えるパスは /games, /games/<slug>, /games/for-two, /games/for-groups, /games/short-play, /games/cooperative, /system, /access, /faq, /scene/<slug>, /area/umeda です。
- 特定のゲームを「おすすめ」と書かない。ゲームを紹介するときは、人数・時間・仕組みなど事実だけを書く。

# 書式
Markdownの見出し(## / ###)、段落、箇条書き(-)、番号つき(1.)、強調(**)、内部リンク([文字](/path))だけを使う。
画像・表・引用・コードブロックは使わない。

# 出力
次のJSONだけを返してください。前後に説明文をつけないでください。

{
  "title": "28〜44文字の記事タイトル",
  "description": "60〜120文字の説明文",
  "slug": "英小文字とハイフンのURL用スラッグ",
  "category": "${topic.category}",
  "tags": ["タグ", "タグ", "タグ"],
  "games": ["本文で触れたゲームのslug"],
  "body": "## 見出し\\n\\n本文…（1200〜2600字）"
}`;
}

/* ------------------------------------------------------------ API */

async function callClaude(prompt) {
  if (process.env.DRY_RUN_FIXTURE) {
    console.log(`[dry-run] ${process.env.DRY_RUN_FIXTURE} を応答として使います`);
    return JSON.parse(fs.readFileSync(process.env.DRY_RUN_FIXTURE, 'utf8'));
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY が設定されていません');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4000,
      temperature: 0.7,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) throw new Error(`Claude API ${res.status}: ${(await res.text()).slice(0, 400)}`);

  const json = await res.json();
  const text = json.content?.map((c) => c.text ?? '').join('') ?? '';
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('JSONが返ってきませんでした');
  return JSON.parse(m[0]);
}

/* ------------------------------------------------------------ 実行 */

const posted = existingPosts();
const used = new Set(posted.map((p) => p.intent));
const remaining = TOPICS.filter((t) => !used.has(t.intent));

if (remaining.length === 0) {
  console.log('未執筆のお題がありません。TOPICS にお題を足してください。');
  process.exit(0);
}

// 日付から決めるので、同じ日に何度走らせても同じお題になる
const today = new Date().toISOString().slice(0, 10);
const pick = remaining[crypto.createHash('sha1').update(today).digest()[0] % remaining.length];
console.log(`お題: ${pick.intent}`);

let post;
try {
  post = await callClaude(buildPrompt(pick, posted));
} catch (e) {
  console.error(`生成に失敗しました: ${e.message}`);
  process.exit(1);
}

post.intent = pick.intent;
post.category = post.category || pick.category;

const errs = validate(post);

// 既存記事との重複
const nb = bigrams(post.body ?? '');
for (const p of posted) {
  const sim = jaccard(nb, bigrams(p.body));
  if (sim > 0.45) errs.push(`既存記事「${p.title}」と内容が近すぎる（${(sim * 100) | 0}%）`);
}

if (errs.length) {
  console.error('品質ゲートを通らなかったため、記事を書き出しません。');
  for (const e of errs) console.error(`  x ${e}`);
  process.exit(1);
}

const slug = String(post.slug || '')
  .toLowerCase()
  .replace(/[^a-z0-9-]/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '')
  .slice(0, 60);
if (!slug) {
  console.error('slugが作れませんでした。');
  process.exit(1);
}
const file = path.join(OUT_DIR, `${today}-${slug}.md`);
if (fs.existsSync(file)) {
  console.log('同じファイルが既にあります。何もしません。');
  process.exit(0);
}

const fm = [
  '---',
  `title: ${JSON.stringify(post.title)}`,
  `description: ${JSON.stringify(post.description)}`,
  `date: "${today}"`,
  `category: ${JSON.stringify(post.category)}`,
  `intent: ${JSON.stringify(post.intent)}`,
  `tags: [${(post.tags ?? []).map((t) => JSON.stringify(t)).join(', ')}]`,
  `games: [${(post.games ?? []).map((g) => JSON.stringify(g)).join(', ')}]`,
  'source: auto',
  '---',
  '',
  post.body.trim(),
  '',
].join('\n');

fs.writeFileSync(file, fm);
console.log(`書き出しました: ${path.relative(ROOT, file)}（${post.body.length}字）`);

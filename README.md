# BODOlab. 公式サイト

大阪市北区豊崎（大阪メトロ中津駅 徒歩3分）のボードゲームプレイスペース＆ショップ
**BODOlab.（ボードゲームラボ／ボドラボ）** の公式サイトです。

- 本番ドメイン: https://www.boardgame-lab.com/
- 構成: Next.js 15（App Router）＋ TypeScript ＋ Tailwind CSS v4
- ホスティング: Vercel を想定（全ページを静的生成）

---

## 開発

```bash
npm install
npm run dev          # http://localhost:3000

npm run check        # ゲームデータ・店舗情報・型の検証
npm run build        # 本番ビルド（全661ページを静的生成）
npm start            # ビルド結果を確認する
```

### 環境変数

| 変数 | 必須 | 役割 |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | **本番のみ必須** | `https://www.boardgame-lab.com`。未設定だと canonical・OG・sitemap を出さず、robots.txt が全ページ拒否になる（プレビューURLの誤インデックス防止） |
| `RESEND_API_KEY` | 任意 | お問い合わせフォームの送信に使う。未設定のうちはフォームを表示せず、電話とInstagramへの導線だけを出す |
| `CONTACT_TO_EMAIL` | 任意 | 問い合わせの受信先（店舗のアドレス） |
| `CONTACT_FROM_EMAIL` | 任意 | 送信元。Resendで認証済みドメインのアドレス |
| `ANTHROPIC_API_KEY` | 任意 | 読みもの（/blog）の自動生成。GitHub Actions の Secret に入れる |

---

## 店舗情報を変更する

営業時間・料金・定休日などは **`src/data/shop.ts` の1か所** にまとまっています。
ここを直せばサイト全体（トップ・ご利用案内・アクセス・構造化データ・フッター）が同時に変わります。

```ts
hours: {
  weekday: v({ open: '18:30', close: '23:30' }, 'official / poster / chalk'),
  ...
}
```

- `v(値, 出典)` … 裏が取れている情報。画面に出ます。
- `unverified(値, 出典, メモ)` … 出典どうしが食い違っている情報。**画面には出ません。**
  確認が取れたら `v(...)` に書き換えてください。

料金や営業時間を変えたら、読みものの自動生成が使う値ともズレないように確認します。

```bash
npm run check:shop
```

ズレていたら `scripts/generate-blog.mjs` の `SHOP_FACTS` / `ALLOWED_PRICES` /
`ALLOWED_HOURS` も同じ値に直してください（ズレたままだとCIが止まります）。

---

## お知らせ（/news）を追加する

`src/data/news.ts` の `NEWS` 配列に1件足します。

```ts
{
  slug: '年末年始の営業について',   // そのままURLになります（日本語のままでOK）
  title: '年末年始の営業について',
  date: '2026-12-20',
  category: '営業案内',
  summary: '一覧と検索結果に出る要約。',
  body: ['本文を段落ごとに', '配列で書きます。'],
  image: 'nenmatsu',               // public/news/nenmatsu-{480,960}.webp
  imageAlt: '画像の内容を説明する文',
  superseded: false,               // 過去の告知になったら true
}
```

画像を使う場合は `data/source/news/img/` に元画像を置いて、次を実行します。

```bash
node scripts/build-news-images.mjs
```

画像だけのお知らせにはせず、**画像に書いてある内容を `body` にも文字で書いてください。**
検索エンジンと読み上げソフトは画像の中の文字を読めません。

---

## ボードゲームのデータを更新する

608タイトルのデータは2つに分かれています。

| 置き場所 | 中身 | 誰が書くか |
| --- | --- | --- |
| `data/source/games-raw.json`, `games-detail.json` | 人数・時間・対象年齢・メカニクス（ボドゲーマから取得した事実） | 取得スクリプト |
| `content/games/batch-*.json` | キャッチ・概要・遊び方・魅力・おすすめ（当店で書いた文章） | 人 |

タイトルを足す・文章を直したときは、必ずこの順で実行します。

```bash
node scripts/build-games.mjs     # src/data/games.json と public/games-index.json を作り直す
npm run check:games              # 件数・重複・数値の矛盾・リンク切れを検証
```

`check:games` は次を見ています。1つでも落ちるとビルドを止めます。

- 取得元の件数と登録件数が一致しているか
- slug の重複、URLとして使えない文字
- 本文の空欄・短すぎ・ダミー文言
- 別のゲームに同じ説明文を使い回していないか（完全一致と3-gram類似）
- 本文に書いた人数・時間・年齢が、取得できた数値と矛盾していないか
- 関連ゲームのリンク先が存在するか、自分自身を指していないか
- コレクション／ジャンルのページに載るゲームが1件以上あるか
- コレクションのURLとゲームのslugが衝突していないか

店舗写真の一覧と使用箇所は [docs/images.md](docs/images.md) にまとめています。

### ゲームの画像について

パッケージ画像はボドゲーマの各ゲームページから取得しています。

```bash
node scripts/fetch-game-images.mjs    # 元画像を data/source/game-images/ に取得（再実行で差分だけ）
node scripts/build-game-images.mjs    # public/games/<slug>-{320,480}.webp と src/data/game-images.json を作る
node scripts/build-games.mjs          # hasImage フラグを games.json と索引に反映
```

取り違えが起きない理由は、`games-raw.json` の `sourceImage` が
**こちらが slug で取得したゲームレコードに紐づくURLそのもの**だからです。
一覧ページの画像と詳細ページの og:image が608件すべて同一ファイルであることも確認しています。
`check:games` が、同じ画像が2つ以上のゲームに割り当たっていないかも見ています。

画像が登録されていないタイトルは、ゲーム名とジャンルから組み立てたSVG
（`src/components/GameTile.tsx`）に自動で落ちます。切り替えは `GameImage` が行います。

**著作権は各出版社にあります。** 詳細ページに出典と帰属を明記していますが、
権利者から掲載の停止を求められた場合は、`public/games/` を空にして
`node scripts/build-games.mjs` を実行すれば、全件がSVG表示に戻ります。
店舗で撮影した写真に差し替える場合も、同じ命名で `public/games/` に置けば入れ替わります。

---

## 在庫の状況を記録する

ボドゲーマの登録数（608）と店内の実態は一致しません。
店舗で確認した「いま店内にあるか」は `data/stock.json` に書きます。

```json
{
  "updatedAt": "2026-10-01",
  "games": {
    "die-siedler-von-catan": "available",
    "some-old-title": "unavailable"
  }
}
```

- `available` … 詳細ページに「店舗で確認済み：店内にあります（2026/10/01時点）」と出ます
- `unavailable` … 「現在このタイトルは店内にありません」と出ます（ページは残ります）
- 書いていないタイトルは何も出ません（「入れ替わることがある」の注記だけ）

書き換えたら `node scripts/build-games.mjs` を実行してください。存在しない slug は警告が出ます。

### ボドゲーマ側の登録が変わっていないか調べる

```bash
npm run games:sync
```

ボドゲーマの店舗ページを取り直して、手元の608件との差分を報告します。**報告するだけで、自動では追加も削除もしません。**
店舗が持っていないゲームが、外部の登録変更だけでサイトに増えないようにするためです。
追加が必要なときは、表示された slug の本文を `content/games/` に書いてから `npm run images:fetch` と `npm run check:games` を実行します。

### 検索の別名（通称・略称）

「ごきポ」「6ニムト」のように正式名と違う呼び方で探されるゲームは、本文JSONに `aliases` を足します。

```json
"kakerlakenpoker": { "catch": "...", "aliases": ["ごきポ", "ゴキブリポーカー"] }
```

検索欄はひらがな・カタカナ・全角半角の違いを吸収するので、読みの揺れまで書く必要はありません。

---

## 読みもの（/blog）

`content/blog/*.md` に置いた Markdown がそのまま記事になります。
`source: manual` は人が書いたもの、`source: auto` は自動生成されたものです。

### 自動生成

`.github/workflows/blog.yml` が毎日 10:40 JST に1本だけ生成し、main に push します。

```bash
npm run blog:generate                            # 手動で1本作る
DRY_RUN_FIXTURE=path/to.json npm run blog:generate  # APIを使わずに検証だけする
```

次のどれかに引っかかった案は、**ファイルを書き出さずに失敗で終わります。**

- 本文の長さ・見出しの数が基準から外れている
- `src/data/shop.ts` にない金額・時刻・徒歩分数を書いた
- 在庫やイベント開催を断定した／飲食提供があるように書いた／所在地を梅田と書いた
- 挙げたゲームが実在しない、または本文中の人数がデータと食い違う
- 内部リンクの行き先が存在しない、リンクが2本未満
- すでにある記事と内容が近すぎる（2-gram類似が45%超）

お題は `scripts/generate-blog.mjs` の `TOPICS` にあります。
1記事1クエリで作り、公開済みの `intent` は二度と選ばれません。書くことがなくなったら追記してください。

---

## 公開前の確認

```bash
npm run build
node scripts/audit-site.mjs      # 出力HTMLを読んで、リンク切れ・title/description重複・alt抜けを見る
npx next start -p 4321 &
node scripts/audit-render.mjs    # 実際にブラウザで開いて、横スクロール・画像抜け・h1の数を見る
```

`audit-site.mjs` は旧サイトのURL（`/system` `/access` `/contact` `/schedule` `/news`
`/part-timejob` と日本語スラッグのお知らせ7本）がすべて生きていることも確認します。
**URLを変える改修をするときは、必ずこの検査を通してください。**

---

## ディレクトリ

```
src/
  app/            ページ（App Router）
  components/     UI部品
  data/           店舗情報・お知らせ・シーン・エリア・FAQ・求人・ゲームデータ
  lib/            SEO・ゲーム・ブログ・リダイレクト
content/
  games/          608タイトルの本文（slug をキーにしたJSON）
  blog/           読みものの記事（Markdown）
data/source/      取得した元データ（サイトには出ない）
scripts/          データ生成と検証
public/           画像・games-index.json
```

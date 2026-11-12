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
| `RESEND_API_KEY` | フォームを使うなら必須 | お問い合わせフォームの送信（Resend）に使う。下の受信先と揃うまではフォームを表示せず、電話・公式LINE・Instagramへの導線だけを出す |
| `CONTACT_TO_EMAIL` | フォームを使うなら必須 | 問い合わせの受信先。店舗の指定アドレス（2026-11-12 のLINE）を入れる。リポジトリが公開なのでコードには書かない |
| `CONTACT_FROM_EMAIL` | 任意 | 送信元。未設定なら Resend の共用アドレス `onboarding@resend.dev`（後述の条件あり） |
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

ボドゲーマのパッケージ画像は、同サイトの利用規約（第5条）で運営の事前同意なく転載できないため、**公開を停止しています**。
今はすべてゲーム名から作った表示（`GameTile`）です。店舗で撮影した写真や、権利者から許諾を得た画像ができたら
`public/games/<slug>-{320,480}.webp` に置いて `src/data/game-images.json` に登録してください。写真の監査表は [docs/images.md](docs/images.md)。

---

## おすすめを登録する（スタッフ用）

このサイトは、人数や時間のデータから自動で「おすすめ」を付けません。
「2人向け」「デート向け」「初めての人向け」「大人数向け」のおすすめは、
**`data/staff-picks.json` の `lists` に書いたゲームだけ**が表示されます（2026-10-29 にお店から届いた一覧を登録済み）。

```json
"lists": {
  "two": ["geister", "gobblet-gobblers", { "name": "cat and cucumber" }],
  "couples": ["spots", "azato-karuta"],
  "beginners": ["strike"],
  "groups": ["dixit", "hitster"]
}
```

- 値はゲームの slug。お店から届いた順に並べ、画面にもこの順で出します（順位ではないので番号は付けません）。
- このサイトにまだページが無いゲームは `{ "name": "ゲーム名" }` と書くと、名前だけ表示します（今は cat and cucumber・おばけパレード・ラクガキカルタ）。
- 表示される場所：トップ「スタッフが選んだ、こんな日に遊ぶゲーム」、/games（検索の下）、/games/for-two、/games/for-groups、
  /scene/indoor-date・/scene/first-time・/scene/group、各ゲームの詳細ページ（「BODOlab.スタッフのおすすめ：2人向け」など）。
- おすすめの理由（コメント）は、届いたら `games` の `comments` に書くと一覧に出ます。理由をこちらで作文しないでください。
- `staffReviewed: true` にすると、そのゲームの説明文に「BODOlab.スタッフ監修」と表示されます（説明文をスタッフが確認したものだけ。おすすめに選ばれただけでは付けない）。
- 単体で遊べない拡張は推薦できません（ビルドが止まります）。存在しない slug もビルドが止まります。

書き換えたら `node scripts/build-games.mjs` → `npm run check:games`。

## 毎月の営業カレンダーを差し替える

店舗は毎月、定休日とイベント（ボドゲ会など）を書いたカレンダー画像を作っています。
サイトでは、その画像と、同じ内容を文字にしたものを /schedule とトップの「イベント」に出します。

1. 届いた画像を `assets-src/` に置き、`scripts/build-photos.mjs` の `CALENDARS` に1行足して `node scripts/build-photos.mjs`
2. `src/data/calendar.ts` の `CALENDAR`（month・image・closed・events）を、画像の文字どおりに書き換える
   （内容・参加費・申し込み方法はカレンダーに書かれていないので、書き足さない）

月が終わったカレンダーは自動で表示しなくなります（日本時間で判定）。
トップと /schedule は1時間ごとに作り直す設定（ISR、`revalidate = 3600`）なので、再デプロイしなくても、月が変わってから1時間以内に切り替わります。
差し替えが遅れても古い月の予定が出続けることはなく、トップのイベント欄はテストプレイ会の案内に戻ります。

## 販売の紹介

店舗の希望（2026-11-11）で、サイトでの紹介は「スペース利用7割・販売3割」ほどにしています。
販売はトップの「販売」セクションと /shop で紹介し、ヘッダー・フッターから /shop へ行けます。
書いているのは店舗から聞いた事実だけです（`src/data/shop.ts` の shopConcept・shopService・shopDiscount）。
値段・在庫・取り扱いタイトルは書きません。

/shop の「ゲームを探す」（店舗の依頼で追加、2026-11-12）は、/games と同じ検索（`GameSearch` の `variant="shop"`）です。
販売中の一覧（在庫）は預かっていないので、検索の対象は**店内で遊べるゲーム**で、買えるかどうかは店頭・公式LINEで聞いてもらいます。
何も入力していないうちは一覧を出しません（全タイトルを並べると、全部売っているように見えるため）。
販売中のタイトルを別に出す場合は、店舗から一覧をもらってから作ります。

## 相席カウンター

店舗が予約フォームと同じ Netlify のサイトで公開している「相席中の人数／空席あり・なし」のページ（`shop.links.shareCounter`）を、
iframe で埋め込んでいます（店舗の依頼、2026-11-12）。表示は自動で更新されます（人数をどこから取っているかは店舗側の仕組みで、こちらでは確かめていないので、サイトにも書きません）。

- 置き場所：トップ（ヒーローのすぐ下）、料金・ご利用案内（相席可の料金の横）、1人で来る場合（/scene/solo）。中身は `src/components/ShareNow.tsx`
- 埋め込み先のページは、幅が700px以上になると約3倍の大きさに切り替わるので、iframe の幅は 352px までにしています。高さは 236px で固定（中身のパネルが約206px）
- 外部のページなので、ページの読み込みが終わってから差し込みます（こちらの表示を遅らせないため）
- 営業時間外も表示は出たままで、閉店中でも「空席あり」と出ることがあります。そのため、横に営業時間・22時の早仕舞い・公式X（営業の変更のお知らせ）を必ず並べています
- 店舗がページのURLやデザインを変えたら、`shop.links.shareCounter` と高さ（`ShareCounter.tsx` の `HEIGHT`）を見直します

## お問い合わせフォーム

フォームの画面と送信処理はできていて、**環境変数が揃うまでは表示しません**（動かないフォームを置かないため）。
送信は Resend のAPIで、届いたメールに返信すると、お客様のアドレス宛てに返ります（reply_to）。

公開の手順

1. 店舗の受信アドレスで Resend のアカウントを作り、APIキーを発行する
   （`CONTACT_FROM_EMAIL` を入れずに共用アドレス `onboarding@resend.dev` から送る場合、送れるのは**アカウントに登録したアドレス宛てだけ**なので、受信アドレスで登録します）
2. Vercel の Environment Variables に `RESEND_API_KEY` と `CONTACT_TO_EMAIL` を入れて、再デプロイする（フォームの表示はビルド時に決まる）
3. プレビューで1通送り、店舗に届いたことを確かめてもらう
4. 本番ドメインに切り替えるときに boardgame-lab.com を Resend で認証すれば（DNS にレコードを足す作業が要る）、
   `CONTACT_FROM_EMAIL` をそのドメインのアドレスにできます。DNS の変更は、指示があるまで行いません

送信に失敗したときは、画面に電話・公式LINE・InstagramのDMを案内し、Vercel のログに Resend の応答のステータスとエラーの種類（例：validation_error）だけを残します。応答の本文やお客様の入力内容はログに出しません。

続けての送信は、同じ送信元から10分に5通、全体で10分に20通までに止めています（サーバーのメモリで数えるだけなので、効き目はベストエフォート）。
スパムが増えたら、Vercel Firewall のレート制限か Cloudflare Turnstile を足します（キーは環境変数に入れる）。

## ゲームの種類（拡張）

`data/content-types.json` に、拡張・独立拡張・別版を登録しています。ここに無いものは単体で遊べる基本ゲームとして扱います。
単体で遊べない拡張は、カードに「拡張」と表示し、条件の一覧に入れず、詳細ページは検索に載せません（noindex）。

## 在庫の状況を記録する

ボドゲーマの登録数（608）と店内の実態は一致しません。
タイトル数は日々増えるので、**サイトの画面・title・description にはタイトル数を書きません**（店舗の指示、2026-10-02）。
ボードゲーム一覧の件数も、絞り込んだときだけ表示します。
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

## デザインの方針（2026-10 に変更）

店舗から「会社のホームページのように見える。のんびりできる、おしゃれなカフェのような雰囲気に」という要望があり、見た目を作り直しました。

- **配色**：紺と水色をやめ、生成りの地にココア色・キャラメル色を合わせています（`src/app/globals.css` の `@theme`）。ロゴの水色とオレンジは差し色としてだけ使います。
- **書体**：見出しは丸ゴシック（Zen Maru Gothic、`next/font`）。本文はシステムフォントのままです。
- **形**：写真やカードの角を大きく丸め、料金は「品名 …… 値段」のメニュー表の書き方にしています（`.menu-row`）。
- **ロゴ**：ヘッダーとフッターの「BODOlab.」は文字を組まず、店舗の料金ポスターから切り出した図版（`public/logo-wordmark.png`、黒文字に水色の差し色）を使います。黒い文字なので、ヘッダーの背景は常に明るい色です。
- **書かないこと**：飲食の販売はないので、title・H1・本文で「カフェ」とは名乗りません。雰囲気は色・書体・余白で出します。

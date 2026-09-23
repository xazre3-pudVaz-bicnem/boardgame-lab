# 画像管理表

店舗から提供された写真（`assets-src/LINE_ALBUM_店舗内写真_260920_N.jpg`、41枚）と、サイトでの扱いをまとめたもの。
`scripts/build-photos.mjs` が `public/photos/<name>-{480,960,1600}.webp` と `src/data/photos.json`（alt・実寸）を生成する。
新しい写真を足すときは、この表と `build-photos.mjs` の `MAP` を両方更新する。

**架空の店舗写真は作らない。** ここにある写真だけを使う。

## 店内・人物（サイトで使用）

| # | name | 内容 | 主な使用箇所 |
|---|---|---|---|
| 30 | `hero-floor` | 満席の店内を見渡した引きの写真（夜） | トップ ヒーロー（PC）、OG画像 |
| 35 | `hero-mobile` | 同じ店内をやや近くから（夜） | トップ ヒーロー（スマホ） |
| 34 | `hero-floor-wide` | スクリーンのある明るい店内 | 予備 |
| 18 | `room-daytime-wide` | 昼の店内全景。プロジェクター前で遊ぶ人たち | トップ ABOUT、/scene/indoor |
| 39 | `room-empty` | 無人の店内。木のテーブルと壁一面の棚 | トップ WHY（棚）、/system 予約 |
| 32 | `floor-evening` | 夜の店内で遊ぶお客様 | トップ WHY（相席）、/scene/after-work |
| 31 | `floor-evening-wide` | 夜の店内。複数卓が同時に進む | 予備（フォトバンド候補） |
| 33 | `floor-daytime` | 昼の店内で遊ぶグループ | /scene/rainy-day、コレクション見出し |
| 38 | `floor-group` | 大人数のグループ | トップ CTA背景、/scene/with-friends、/scene/group |
| 37 | `shelf-staff` | 棚の前に並ぶスタッフ | トップ ABOUT、/scene/first-time、/part-timejob |
| 16 | `group-peace` | 棚の前でポーズをとる参加者の記念写真 | /scene/hobby 候補 |
| 15 | `group-photo` | イベント参加者の集合写真 | 予備 |
| 29 | `table-four` | 4人でテーブルを囲む（縦位置） | 予備 |
| 17 | `table-pairs` | 2人ずつに分かれた卓 | トップ ACCESS、コレクション見出し（2人） |
| 21 | `table-standing` | スクリーン前でゲームを準備する様子 | トップ WHY（ルール説明）、/scene/solo |
| 4 | `players-cards` | カードを手にテーブルを囲む | /scene/indoor-date、/scene/hobby、コレクション見出し（カップル） |
| 5 | `players-longtable` | 長テーブルに広げた大型ゲーム | /schedule、コレクション見出し（重量級・協力） |

## ゲームの盤面・小物（サイトで使用）

| # | name | 内容 | 主な使用箇所 |
|---|---|---|---|
| 36 | `game-catan-top` | 六角タイルの盤面 | 予備 |
| 23 | `game-catan-hand` | 盤面にコマを置く手元 | 予備 |
| 22 | `game-catan-close` | 木製コマのクローズアップ | 予備 |
| 14 | `game-scenery` | 立体地形とミニチュア | 予備 |
| 11 | `game-strategy` | 広げた戦略系ゲーム | 予備 |
| 12 | `game-map` | マップ型ボード | 予備 |
| 13 | `game-tokens` | コインとトークン | 予備 |
| 19 | `game-grid` | 格子状ボードとチップ | コレクション見出し（1人） |
| 1 | `game-family` | すごろく型のファミリーゲーム | 予備 |
| 3 | `game-family-close` | 立ちコマのクローズアップ | 予備 |
| 28 | `game-boxes` | 積まれたゲームの箱 | トップ WHY（ショップ）、コレクション見出し（短時間） |
| 40 | `game-pawns` | カラフルな木製コマ | トップ ABOUT |

## 店舗の外観・掲示

| # | name | 内容 | 主な使用箇所 |
|---|---|---|---|
| 9 | `entrance-stairs` | ビル3階への階段と入口 | /access、/area、トップ ACCESS |
| 41 | `chalkboard` | 「友達ができる場所」と営業時間の黒板 | トップ ACCESS |
| 24 | `price-poster` | 営業時間と料金の店頭ポスター | 出典確認用（画面には出さない） |
| 6 | `pano-a` | 店内パノラマ（テーブル席と棚） | トップ フォトバンド |
| 8 | `pano-b` | 店内パノラマ（窓側から） | 予備 |
| 10 | `pano-c` | 店内パノラマ（ショップ側から） | 予備 |

## ロゴ

| # | name | 内容 | 主な使用箇所 |
|---|---|---|---|
| 25 | `logo-lockup` | ロゴ縦組み「ボードゲームが遊べる場所」 | 予備 |
| 26 | `logo-horizontal` | ロゴ横組み。フラスコを切り出して `public/logo-mark.png`（透過）に | ヘッダー、favicon、apple-touch-icon |

## 未登録（サイトでは使わない）

| # | 内容 | 使わない理由 |
|---|---|---|
| 2 | ファミリーゲームの盤面 | #3 とほぼ同じ構図 |
| 7 | 店内パノラマ | #6 とほぼ同じ |
| 20 | 格子状ゲームの手元 | #19 とほぼ同じ |
| 27 | ロゴ横組み（白地） | #26 と同じ |

## 店舗の外観写真について

**建物の外観・看板の写真は提供されていない。** アクセスページには入口の階段（#9）を使っている。
外観写真を撮って `assets-src/` に置き、`build-photos.mjs` の `MAP` に `{ n: 42, name: 'exterior', alt: '...' }` のように足すと、/access で使えるようになる。

## ゲームのパッケージ画像

`public/games/<slug>-{320,480}.webp`（602件）。出典と取り違え防止の仕組みは `scripts/fetch-game-images.mjs` のコメントと README を参照。
店舗で撮影した写真に差し替えるときも同じ命名で置けば入れ替わる。

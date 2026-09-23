import type { Metadata } from 'next';
import Link from 'next/link';
import GameTile from '@/components/GameTile';
import { GameGrid } from '@/components/GameCard';
import { Breadcrumbs, Button, Chip, Container, ConfirmNote, Eyebrow } from '@/components/ui';
import { abs, shop, SITE_URL } from '@/data/shop';
import {
  ageText,
  COLLECTIONS,
  type Game,
  playersText,
  relatedGames,
  timeText,
  WEIGHT_LABEL,
} from '@/lib/games';
import { breadcrumbSchema, buildMetadata, JsonLd } from '@/lib/seo';

/* ----------------------------------------------------------------- metadata */

export function gameMetadata(game: Game): Metadata {
  const meta = [playersText(game), timeText(game)].filter(Boolean).join('・');
  const head = meta ? `${meta}の${game.genreLabel}` : game.genreLabel;

  // 説明文は本文から作らず、確認できた数値と自分で書いたキャッチだけで組む。
  // 英題は長いものがあるので、120字の枠を超えそうなときは入れない。
  const en = game.nameEn && game.nameEn !== game.nameJa && game.nameEn.length <= 24 ? `（${game.nameEn}）` : '';
  const description = `${game.nameJa}${en}は${meta ? `${meta}の` : ''}${game.genreLabel}です。${game.catch}遊び方・面白さ・どんな方に向くかを紹介します。大阪・中津のBODOlab.で遊べます。`;

  return buildMetadata({
    title: `${game.nameJa}の遊び方とルール｜${head}｜大阪・梅田中津で遊べる BODOlab.`,
    description,
    path: `/games/${game.slug}`,
    keywords: [
      `${game.nameJa} ルール`,
      `${game.nameJa} 遊び方`,
      `${game.nameJa} ボードゲーム`,
      '大阪 ボードゲーム',
    ],
  });
}

/* ----------------------------------------------------------------- schema */

/**
 * Game 構造化データ。
 * 在庫や貸出状況は保証できないので Offer / availability は出さない。
 * 評価もこちらで集計していないため aggregateRating は出さない。
 */
function gameSchema(game: Game) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Game',
    name: game.nameJa,
    ...(game.nameEn ? { alternateName: game.nameEn } : {}),
    description: game.overview,
    url: abs(`/games/${game.slug}`),
    inLanguage: 'ja',
    genre: game.genreLabel,
    ...(game.players
      ? {
          numberOfPlayers: {
            '@type': 'QuantitativeValue',
            minValue: game.players.min,
            maxValue: game.players.max,
          },
        }
      : {}),
    ...(game.minAge != null ? { typicalAgeRange: `${game.minAge}-` } : {}),
    ...(game.designers.length ? { author: game.designers.map((d) => ({ '@type': 'Person', name: d })) } : {}),
    ...(game.year ? { datePublished: String(game.year) } : {}),
    isPartOf: { '@id': `${SITE_URL}/#localbusiness` },
  };
}

/* ----------------------------------------------------------------- page */

export default function GameDetail({ game }: { game: Game }) {
  const crumbs = [
    { name: 'ホーム', href: '/' },
    { name: 'ボードゲーム一覧', href: '/games' },
    { name: game.genreLabel, href: `/games/genre/${game.genre}` },
    { name: game.nameJa },
  ];
  const related = relatedGames(game);
  const collections = COLLECTIONS.filter((c) => game.collections.includes(c.key));
  const players = playersText(game);
  const time = timeText(game);
  const age = ageText(game);

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <JsonLd data={gameSchema(game)} />

      {/* ------------------------------------------------ ヘッダー */}
      <header className="border-b border-line bg-surface pt-28 pb-12 sm:pt-32 sm:pb-16">
        <Container>
          <Breadcrumbs items={crumbs} />

          <div className="mt-8 grid gap-8 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] sm:items-start sm:gap-12">
            <div className="max-w-[14rem] overflow-hidden rounded-2xl shadow-[0_10px_30px_rgba(0,40,79,0.12)]">
              <GameTile slug={game.slug} name={game.nameJa} nameEn={game.nameEn} genre={game.genre} large />
            </div>

            <div>
              <Eyebrow>{game.genreLabel}</Eyebrow>
              <h1 className="display text-balance mt-3 text-[clamp(1.6rem,4.6vw,2.6rem)] leading-[1.32] text-ink">
                {game.nameJa}
              </h1>
              {game.nameEn && game.nameEn !== game.nameJa ? (
                <p className="display mt-2 text-[0.85rem] tracking-wide text-ink-faint">{game.nameEn}</p>
              ) : null}
              <p className="text-pretty mt-5 text-[1rem] leading-[1.9] text-ink-soft">{game.catch}</p>

              <div className="mt-6 flex flex-wrap gap-2">
                {players ? <Chip tone="navy">{players}</Chip> : null}
                {time ? <Chip tone="navy">{time}</Chip> : null}
                {age ? <Chip>{age}</Chip> : null}
                <Chip>{WEIGHT_LABEL[game.weight]}</Chip>
                {game.beginner ? <Chip tone="amber">初心者向け</Chip> : null}
                {game.year ? <Chip>{game.year}年</Chip> : null}
              </div>

              {game.dataStatus === 'partial' ? (
                <p className="mt-5 text-[0.78rem] text-ink-faint">
                  人数・プレイ時間の一部が確認できていないため、確認できた項目のみ表示しています。
                </p>
              ) : null}
            </div>
          </div>
        </Container>
      </header>

      {/* ------------------------------------------------ 本文 */}
      <section className="section-y bg-paper">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:gap-16">
            <article>
              <h2 className="display text-[clamp(1.2rem,3.2vw,1.6rem)] text-ink">どんなゲーム？</h2>
              <p className="text-pretty mt-4 text-[0.95rem] leading-[2.05] text-ink-soft">{game.overview}</p>

              <h2 className="display mt-12 text-[clamp(1.2rem,3.2vw,1.6rem)] text-ink">遊び方</h2>
              <p className="text-pretty mt-4 text-[0.95rem] leading-[2.05] text-ink-soft">{game.howToPlay}</p>

              <h2 className="display mt-12 text-[clamp(1.2rem,3.2vw,1.6rem)] text-ink">ここが面白い</h2>
              <p className="text-pretty mt-4 text-[0.95rem] leading-[2.05] text-ink-soft">{game.appeal}</p>

              <h2 className="display mt-12 text-[clamp(1.2rem,3.2vw,1.6rem)] text-ink">こんな方におすすめ</h2>
              <p className="text-pretty mt-4 text-[0.95rem] leading-[2.05] text-ink-soft">{game.recommended}</p>

              {/* BODOlab.で遊ぶ */}
              <div className="mt-14 rounded-2xl border border-navy/15 bg-surface p-7 sm:p-9">
                <Eyebrow>Play at BODOlab.</Eyebrow>
                <h2 className="display mt-2 text-[1.2rem] text-ink">BODOlab.で遊ぶ</h2>
                <p className="text-pretty mt-4 text-[0.9rem] leading-[1.95] text-ink-soft">
                  ルールの説明はスタッフが行いますので、はじめての方でもそのまま遊んでいただけます。
                  プレイ料金は1時間{shop.pricing.unit.value.normal}円（相席{shop.pricing.unit.value.share}円）。
                  時間内であれば、何本遊んでも料金は変わりません。
                </p>
                <div className="mt-5">
                  <ConfirmNote>
                    {shop.gameCount.rotationNote}
                    そのため、ご来店時にこのタイトルが店内にあるとは限りません。
                    遊びたいゲームが決まっている場合は、事前にお問い合わせいただけると確実です。
                  </ConfirmNote>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button href={shop.reservationUrl} variant="solid" external>
                    ご来店予約
                  </Button>
                  <Button href="/contact" variant="outline">
                    在庫を問い合わせる
                  </Button>
                </div>
              </div>
            </article>

            {/* ------------------------------------------------ サイドバー */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-2xl border border-line bg-white p-6">
                <h2 className="display text-[1rem] text-ink">基本データ</h2>
                <dl className="mt-4">
                  <div className="spec-row">
                    <dt className="text-ink-soft">人数</dt>
                    <dd className="font-medium text-ink">{players ?? '未確認'}</dd>
                  </div>
                  <div className="spec-row">
                    <dt className="text-ink-soft">プレイ時間</dt>
                    <dd className="font-medium text-ink">{time ?? '未確認'}</dd>
                  </div>
                  <div className="spec-row">
                    <dt className="text-ink-soft">対象年齢</dt>
                    <dd className="font-medium text-ink">{age ?? '未確認'}</dd>
                  </div>
                  <div className="spec-row">
                    <dt className="text-ink-soft">ジャンル</dt>
                    <dd className="font-medium text-ink">{game.genreLabel}</dd>
                  </div>
                  <div className="spec-row">
                    <dt className="text-ink-soft">重さ</dt>
                    <dd className="font-medium text-ink">{WEIGHT_LABEL[game.weight]}</dd>
                  </div>
                  {game.designers.length ? (
                    <div className="spec-row">
                      <dt className="shrink-0 text-ink-soft">デザイナー</dt>
                      <dd className="text-right text-[0.85rem] font-medium text-ink">{game.designers.join('／')}</dd>
                    </div>
                  ) : null}
                  {game.year ? (
                    <div className="spec-row">
                      <dt className="text-ink-soft">発売年</dt>
                      <dd className="font-medium text-ink">{game.year}年</dd>
                    </div>
                  ) : null}
                </dl>

                {game.mechanics.length ? (
                  <>
                    <h3 className="mt-6 text-[0.8rem] font-medium text-ink">メカニクス</h3>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {game.mechanics.map((m) => (
                        <Chip key={m}>{m}</Chip>
                      ))}
                    </div>
                  </>
                ) : null}

                <p className="mt-6 text-[0.72rem] leading-relaxed text-ink-faint">
                  人数・時間・対象年齢・メカニクスは
                  <a href={game.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" className="prose-link">
                    ボドゲーマの該当ページ
                  </a>
                  で確認した値です。紹介文は当店が書き下ろしています。
                </p>
              </div>

              {collections.length ? (
                <div className="mt-6 rounded-2xl border border-line bg-white p-6">
                  <h2 className="display text-[1rem] text-ink">このゲームが入っている棚</h2>
                  <ul className="mt-3 space-y-1.5">
                    {collections.map((c) => (
                      <li key={c.key}>
                        <Link href={`/games/${c.key}`} className="prose-link text-[0.85rem]">
                          {c.heading}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </aside>
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------ 関連 */}
      {related.length ? (
        <section className="cv-auto section-y bg-surface">
          <Container>
            <Eyebrow>Related</Eyebrow>
            <h2 className="display mt-3 text-[clamp(1.3rem,3.4vw,1.9rem)] text-ink">このゲームが好きなら</h2>
            <p className="mt-3 max-w-2xl text-[0.85rem] leading-[1.9] text-ink-soft">
              ジャンル・メカニクス・対応人数・プレイ時間の近さから選んでいます。
            </p>
            <div className="mt-10">
              <GameGrid games={related} />
            </div>

            <div className="mt-14 flex flex-wrap gap-3">
              <Button href="/games" variant="outline">
                ほかのゲームを探す
              </Button>
              <Button href={`/games/genre/${game.genre}`} variant="ghost">
                {game.genreLabel}の一覧を見る
              </Button>
            </div>

            <div className="mt-12">
              <Breadcrumbs items={crumbs} />
            </div>
          </Container>
        </section>
      ) : null}
    </>
  );
}

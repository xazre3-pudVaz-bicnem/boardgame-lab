import type { Metadata } from 'next';
import Link from 'next/link';
import GameImage from '@/components/GameImage';
import { GameGrid } from '@/components/GameCard';
import { Breadcrumbs, Button, Container } from '@/components/ui';
import { abs, shop, SITE_URL } from '@/data/shop';
import { ageText, CONTENT_TYPE_LABEL, type Game, getGame, RELATED_LABEL, relatedGroups } from '@/lib/games';
import { breadcrumbSchema, buildMetadata, JsonLd } from '@/lib/seo';

/* ----------------------------------------------------------------- metadata */

export function gameMetadata(game: Game): Metadata {
  const facts = [game.playersLabel, game.timeLabel].filter(Boolean).join('・');
  const kind = CONTENT_TYPE_LABEL[game.contentType];
  return buildMetadata({
    title: `${game.nameJa}${kind ? `（${kind}）` : ''}｜${facts ? `${facts}｜` : ''}ボードゲーム｜大阪・中津 BODOlab.`,
    description: `${game.nameJa}の人数・プレイ時間・遊び方の概要。${game.overview.slice(0, 70)}${game.overview.length > 70 ? '…' : ''}`,
    path: `/games/${game.slug}`,
    // 単体で遊べない拡張、ルールや人数が確認できていないページは、品質確認まで検索に載せない
    noindex: !game.indexable,
  });
}

/* ----------------------------------------------------------------- schema */

/** 在庫・価格・評価は出さない（店舗が保証・集計しているものではないため）。 */
function gameSchema(game: Game) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Game',
    name: game.nameJa,
    ...(game.nameEn ? { alternateName: game.nameEn } : {}),
    url: abs(`/games/${game.slug}`),
    inLanguage: 'ja',
    ...(game.players
      ? { numberOfPlayers: { '@type': 'QuantitativeValue', minValue: game.players.min, maxValue: game.players.max } }
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
    { name: game.nameJa },
  ];
  const base = game.baseGameSlug ? getGame(game.baseGameSlug) : null;
  const kind = CONTENT_TYPE_LABEL[game.contentType];
  const groups = relatedGroups(game);
  const staffNotes = Object.entries(game.staff.comments).filter(([, v]) => v);

  const facts: [string, string | null][] = [
    ['人数', game.playersLabel],
    ['プレイ時間', game.timeLabel],
    ['対象年齢', ageText(game)],
    ['発売年', game.year ? `${game.year}年` : null],
    ['デザイナー', game.designers.length ? game.designers.join('／') : null],
    ['ジャンル', game.genreLabel],
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <JsonLd data={gameSchema(game)} />

      <article className="bg-paper pt-24 pb-16 sm:pt-28 sm:pb-24">
        <Container size="narrow">
          <Breadcrumbs items={crumbs} />

          <header className="mt-6 flex items-start gap-5">
            <div className="w-24 shrink-0 overflow-hidden rounded-2xl sm:w-32">
              <GameImage slug={game.slug} name={game.nameJa} nameEn={game.nameEn} genre={game.genre} large priority />
            </div>
            <div className="min-w-0">
              {kind ? (
                <span
                  className={`inline-block rounded px-2 py-0.5 text-[0.72rem] font-semibold ${
                    game.requiresBaseGame ? 'bg-amber-wash text-amber-ink' : 'bg-paper-2 text-ink-soft'
                  }`}
                >
                  {kind}
                </span>
              ) : null}
              <h1 className="mt-1.5 text-[clamp(1.4rem,4.2vw,2rem)] leading-[1.35] font-bold text-ink">{game.nameJa}</h1>
              {game.nameEn && game.nameEn !== game.nameJa ? (
                <p className="mt-1 text-[0.82rem] text-ink-faint">{game.nameEn}</p>
              ) : null}
              {game.staff.reviewed ? (
                <p className="mt-2 inline-block rounded bg-cocoa px-2 py-0.5 text-[0.72rem] font-semibold text-white">
                  BODOlab.スタッフ監修
                </p>
              ) : null}
            </div>
          </header>

          {game.requiresBaseGame ? (
            <p className="mt-6 rounded-2xl border border-amber/50 bg-amber-wash px-4 py-3 text-[0.88rem] leading-relaxed text-amber-ink">
              これは拡張セットです。この箱だけでは遊べません。
              {base ? (
                <>
                  基本セット
                  <Link href={`/games/${base.slug}`} className="mx-1 underline">
                    {base.nameJa}
                  </Link>
                  と組み合わせて遊びます。
                </>
              ) : (
                '基本セットと組み合わせて遊びます。'
              )}
            </p>
          ) : game.contentType === 'standalone-expansion' && base ? (
            <p className="mt-6 text-[0.85rem] leading-relaxed text-ink-soft">
              <Link href={`/games/${base.slug}`} className="prose-link">
                {base.nameJa}
              </Link>
              と同じシリーズですが、この箱だけで遊べます。
            </p>
          ) : null}

          {/* 事実データ */}
          <dl className="mt-8 grid grid-cols-2 gap-x-6 border-y border-line sm:grid-cols-3">
            {facts
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k} className="border-b border-line py-3 last:border-0 sm:[&:nth-last-child(-n+3)]:border-0">
                  <dt className="text-[0.72rem] text-ink-faint">{k}</dt>
                  <dd className="mt-0.5 text-[0.9rem] text-ink">{v}</dd>
                </div>
              ))}
          </dl>

          {staffNotes.length ? (
            <section className="mt-10 rounded-2xl bg-cocoa-deep p-5 text-white">
              <h2 className="text-[0.95rem] font-semibold">BODOlab.スタッフより</h2>
              {staffNotes.map(([k, v]) => (
                <p key={k} className="mt-2 text-[0.88rem] leading-[1.9] text-white/85">
                  {v}
                </p>
              ))}
            </section>
          ) : null}

          <section className="mt-10">
            <h2 className="text-[1.1rem] font-bold text-ink">どんなゲームか</h2>
            <p className="mt-3 text-[0.95rem] leading-[2] text-ink-soft">{game.overview}</p>
          </section>

          {game.howToPlay && !game.rulesUnknown ? (
            <section className="mt-8">
              <h2 className="text-[1.1rem] font-bold text-ink">遊び方の概要</h2>
              <p className="mt-3 text-[0.95rem] leading-[2] text-ink-soft">{game.howToPlay}</p>
            </section>
          ) : (
            <p className="mt-8 text-[0.9rem] leading-[1.9] text-ink-soft">ルールの詳細は、店頭でスタッフにお尋ねください。</p>
          )}

          <p className="mt-8 text-[0.75rem] leading-relaxed text-ink-faint">
            人数・時間・対象年齢・デザイナーは
            <a href={game.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" className="underline">
              ボドゲーマの登録情報
            </a>
            によります。
            {game.staff.reviewed
              ? '説明文はBODOlab.スタッフが確認しています。'
              : '説明文は公開されている情報をもとに当サイトが作成したもので、スタッフの確認前です。誤りがあればお知らせください。'}
          </p>

          {/* 店舗で遊ぶ */}
          <section className="mt-10 border-t border-line pt-6 text-[0.88rem] leading-[1.9] text-ink-soft">
            {game.stock === 'available' ? (
              <p>
                店内にあることを確認済みです
                {game.stockCheckedAt ? `（${game.stockCheckedAt.replace(/-/g, '/')}時点）` : ''}。
              </p>
            ) : game.stock === 'unavailable' ? (
              <p>現在このタイトルは店内にありません{game.stockCheckedAt ? `（${game.stockCheckedAt.replace(/-/g, '/')}時点）` : ''}。</p>
            ) : (
              <p>
                ボドゲーマの当店ページに登録されているタイトルです。取り扱いは入れ替わることがあるので、遊びたい場合は事前にお問い合わせください。
              </p>
            )}
            <p className="mt-1">
              プレイ料金は1時間{shop.pricing.unit.value.normal}円（相席可は{shop.pricing.unit.value.share}円）、ルールはスタッフが説明します。
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button href={shop.reservationUrl} variant="solid" external>
                ご来店予約
              </Button>
              <Button href="/contact" variant="outline">
                このゲームがあるか問い合わせる
              </Button>
            </div>
          </section>
        </Container>
      </article>

      {groups.length ? (
        <section className="cv-auto border-t border-line bg-surface py-14 sm:py-20">
          <Container>
            {groups.map((g) => (
              <div key={g.type} className="mb-12 last:mb-0">
                <h2 className="mb-4 text-[1rem] font-bold text-ink">{RELATED_LABEL[g.type]}</h2>
                <GameGrid games={g.games} />
              </div>
            ))}
          </Container>
        </section>
      ) : null}
    </>
  );
}

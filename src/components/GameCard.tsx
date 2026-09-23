import Link from 'next/link';
import type { Game } from '@/lib/games';
import { playersText, timeText } from '@/lib/games';
import GameImage from './GameImage';
import { Chip } from './ui';

/** 一覧に並べるゲーム1件分のカード。数値が取れていない項目は出さない。 */
export function GameCard({ game, priority }: { game: Game; priority?: boolean }) {
  const players = playersText(game);
  const time = timeText(game);

  return (
    <Link
      href={`/games/${game.slug}`}
      className="group ease-out-expo focus-visible:ring-cyan focus-visible:ring-offset-paper block overflow-hidden rounded-xl border border-line bg-white transition-all duration-300 hover:-translate-y-1 hover:border-navy/25 hover:shadow-[0_10px_30px_rgba(0,40,79,0.09)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <GameImage
        slug={game.slug}
        name={game.nameJa}
        nameEn={game.nameEn}
        genre={game.genre}
        priority={priority}
      />
      <div className="p-4">
        <h3 className="line-clamp-2 text-[0.92rem] leading-snug font-semibold text-ink transition-colors group-hover:text-cyan-ink">
          {game.nameJa}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-[0.78rem] leading-relaxed text-ink-faint">{game.catch}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Chip tone="cyan">{game.genreLabel}</Chip>
          {players ? <Chip>{players}</Chip> : null}
          {time ? <Chip>{time}</Chip> : null}
          {game.beginner ? <Chip tone="amber">初心者向け</Chip> : null}
        </div>
      </div>
    </Link>
  );
}

/**
 * ゲームカードの一覧。
 *
 * コレクションによっては400件を超えるので、最初の数行を除いて
 * content-visibility で画面外の描画を後回しにする（これが無いとモバイルのTBTが跳ね上がる）。
 * 高さのゆれでスクロール位置が飛ばないよう、contain-intrinsic-size で見込みの高さを渡す。
 */
const EAGER_ROWS = 10;

/**
 * priorityCount は受け取るが、画像の先読みには使わない。
 * スマホではどのページでもカードは画面外から始まるので、先読みすると
 * 本文の表示（LCP）と帯域を奪い合って遅くなる。実測で /games が 2.6s → 2.0s。
 * 画面内に入った順に読む lazy のほうが速い。
 */
export function GameGrid({ games, priorityCount = 0 }: { games: Game[]; priorityCount?: number }) {
  void priorityCount;
  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {games.map((g, i) => (
        <li key={g.slug} className={i < EAGER_ROWS ? undefined : 'card-cv'}>
          <GameCard game={g} />
        </li>
      ))}
    </ul>
  );
}

/** 本文中の内部リンク用。画像を出さない軽い行リンク。 */
export function GameLinkRow({ game }: { game: Game }) {
  const meta = [playersText(game), timeText(game)].filter(Boolean).join('・');
  return (
    <Link
      href={`/games/${game.slug}`}
      className="flex items-baseline justify-between gap-4 border-b border-line py-3 transition-colors hover:text-cyan-ink"
    >
      <span className="text-[0.9rem] font-medium">{game.nameJa}</span>
      {meta ? <span className="shrink-0 text-[0.75rem] text-ink-faint">{meta}</span> : null}
    </Link>
  );
}

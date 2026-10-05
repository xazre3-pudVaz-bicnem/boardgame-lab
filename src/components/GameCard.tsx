import Link from 'next/link';
import type { Game } from '@/lib/games';
import { CONTENT_TYPE_LABEL } from '@/lib/games';
import GameImage from './GameImage';

/**
 * 一覧に並べるゲーム1件分。ゲーム一覧はデータベースとして見せるので、
 * 事実データ（人数・時間・ジャンル・種類）だけを出す。キャッチコピーは付けない。
 * 拡張は必ず「拡張」と表示する（これだけで遊べると誤解させないため）。
 */
export function GameCard({ game, comment }: { game: Game; comment?: string }) {
  const kind = CONTENT_TYPE_LABEL[game.contentType];
  return (
    <Link
      href={`/games/${game.slug}`}
      className="group block overflow-hidden rounded-2xl border border-line bg-white transition-colors duration-200 hover:border-cocoa/40 focus-visible:ring-2 focus-visible:ring-caramel focus-visible:outline-none"
    >
      <GameImage slug={game.slug} name={game.nameJa} nameEn={game.nameEn} genre={game.genre} />
      <div className="p-3.5">
        {kind ? (
          <span
            className={`mb-1.5 inline-block rounded px-1.5 py-0.5 text-[0.68rem] font-semibold ${
              game.requiresBaseGame ? 'bg-amber-wash text-amber-ink' : 'bg-paper-2 text-ink-soft'
            }`}
          >
            {kind}
          </span>
        ) : null}
        <h3 className="line-clamp-2 text-[0.9rem] leading-snug font-semibold text-ink group-hover:text-caramel-ink">
          {game.nameJa}
        </h3>
        <p className="mt-1 text-[0.75rem] text-ink-faint">
          {[game.playersLabel, game.timeLabel, game.genreLabel].filter(Boolean).join(' ・ ')}
        </p>
        {comment ? <p className="mt-2 text-[0.8rem] leading-relaxed text-ink-soft">{comment}</p> : null}
      </div>
    </Link>
  );
}

/**
 * ゲームカードの一覧。長い一覧は画面外のカードを後回しに描画する（モバイルの負荷対策）。
 */
const EAGER = 10;

export function GameGrid({ games }: { games: Game[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {games.map((g, i) => (
        <li key={g.slug} className={i < EAGER ? undefined : 'card-cv'}>
          <GameCard game={g} />
        </li>
      ))}
    </ul>
  );
}

/** 表組みの一覧。条件で抽出したリストはカードより行のほうが読みやすい。 */
export function GameTable({ games }: { games: Game[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white">
      <table className="w-full min-w-[34rem] text-left text-[0.86rem]">
        <thead className="border-b border-line bg-paper-2 text-[0.75rem] text-ink-soft">
          <tr>
            <th scope="col" className="px-4 py-2.5 font-medium">
              ゲーム
            </th>
            <th scope="col" className="px-3 py-2.5 font-medium">
              人数
            </th>
            <th scope="col" className="px-3 py-2.5 font-medium">
              時間
            </th>
            <th scope="col" className="px-3 py-2.5 font-medium">
              ジャンル
            </th>
          </tr>
        </thead>
        <tbody>
          {games.map((g) => (
            <tr key={g.slug} className="border-b border-line last:border-0">
              <td className="px-4 py-2.5">
                <Link href={`/games/${g.slug}`} className="font-medium text-ink hover:text-caramel-ink">
                  {g.nameJa}
                </Link>
                {CONTENT_TYPE_LABEL[g.contentType] ? (
                  <span className="ml-2 text-[0.7rem] text-amber-ink">{CONTENT_TYPE_LABEL[g.contentType]}</span>
                ) : null}
              </td>
              <td className="px-3 py-2.5 whitespace-nowrap text-ink-soft">{g.playersLabel ?? '—'}</td>
              <td className="px-3 py-2.5 whitespace-nowrap text-ink-soft">{g.timeLabel ?? '—'}</td>
              <td className="px-3 py-2.5 whitespace-nowrap text-ink-soft">{g.genreLabel}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

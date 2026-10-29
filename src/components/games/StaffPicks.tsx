import Link from 'next/link';
import Photo from '@/components/Photo';
import GameImage from '@/components/GameImage';
import { type Game, type StaffKind, STAFF_KIND_LABEL, STAFF_META, staffList } from '@/lib/games';

/*
 * BODOlab.スタッフが選んだおすすめ（data/staff-picks.json の lists）。
 *
 * - お店から届いた順に並べる。順位ではないので番号は付けない。
 *   このサイトにページが無いゲームも、届いた順の位置にそのまま入れる（末尾にまとめない）。
 * - おすすめの理由はまだ届いていないので、文章で理由を足さない（comments が届いたら出す）。
 * - ページが無いゲームは、名前だけを「＊」付きで出す（リンクしない）。
 * - カードを並べた商品棚にはしない。場面ごとの行で、雑誌の目次のように見せる。
 */

const KINDS: StaffKind[] = ['two', 'couples', 'beginners', 'groups'];

/** 場面ごとの詳しいページ */
export const STAFF_KIND_HREF: Record<StaffKind, string> = {
  two: '/games/for-two',
  couples: '/scene/indoor-date',
  beginners: '/scene/first-time',
  groups: '/scene/group',
};

const meta = (g: Game) => [g.playersLabel, g.timeLabel].filter(Boolean).join('・');

/** 「2026-10-29」→「2026年10月」 */
const month = (d: string | null) => (d ? `${Number(d.slice(0, 4))}年${Number(d.slice(5, 7))}月` : null);

export function StaffPickNote({ className = '' }: { className?: string }) {
  const m = month(STAFF_META.updatedAt);
  return (
    <p className={`text-[0.82rem] leading-[1.9] text-ink-faint ${className}`}>
      BODOlab.のスタッフが選んだゲームです{m ? `（${m}）` : ''}。並びはお店から届いた順で、順位ではありません。
    </p>
  );
}

const UNLISTED_NOTE = '＊はこのサイトにまだ詳しいページが無いゲームです。店頭でお尋ねください。';

/**
 * 4つの場面をまとめて見せる（トップ・ゲーム一覧）。
 * withPhoto のときは、大人数の行に「HITSTER」の卓の写真を添える（大人数のおすすめに入っているゲーム）。
 */
export function StaffPicksOverview({ withPhoto = false }: { withPhoto?: boolean }) {
  const rows = KINDS.map((kind) => ({ kind, ...staffList(kind) })).filter((r) => r.items.length);
  const hasUnlisted = rows.some((r) => r.items.some((i) => !i.game));
  return (
    <div>
      <div className="divide-y divide-line border-y border-line">
        {rows.map(({ kind, items, games }) => {
          const showPhoto = withPhoto && kind === 'groups' && games.some((g) => g.slug === 'hitster');
          return (
            <div
              key={kind}
              className={`grid gap-x-10 gap-y-4 py-8 sm:py-9 ${
                showPhoto ? 'lg:grid-cols-[11rem_minmax(0,1fr)_17rem]' : 'lg:grid-cols-[11rem_minmax(0,1fr)]'
              }`}
            >
              <div>
                <h3 className="text-[1.2rem] font-bold text-ink sm:text-[1.3rem]">{STAFF_KIND_LABEL[kind]}</h3>
                <p className="mt-2 text-[0.85rem]">
                  <Link href={STAFF_KIND_HREF[kind]} className="prose-link">
                    {STAFF_KIND_LABEL[kind]}をくわしく
                  </Link>
                </p>
              </div>
              <ul className="flex flex-wrap content-start gap-x-6 gap-y-3 text-[0.98rem]">
                {items.map((item) =>
                  item.game ? (
                    <li key={item.game.slug}>
                      <Link
                        href={`/games/${item.game.slug}`}
                        className="font-medium text-ink decoration-line underline-offset-4 hover:text-accent-ink hover:underline"
                      >
                        {item.game.nameJa}
                      </Link>
                      {meta(item.game) ? <span className="ml-1.5 text-[0.75rem] text-ink-faint">{meta(item.game)}</span> : null}
                    </li>
                  ) : (
                    <li key={`name:${item.name}`} className="font-medium text-ink">
                      {item.name}
                      <span className="text-ink-faint">＊</span>
                    </li>
                  ),
                )}
              </ul>
              {showPhoto ? (
                <figure className="hidden lg:block">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                    <Photo name="play-hitster" fill sizes="17rem" className="object-cover" />
                  </div>
                  <figcaption className="mt-2 text-[0.75rem] text-ink-faint">HITSTERを遊んでいる卓。</figcaption>
                </figure>
              ) : null}
            </div>
          );
        })}
      </div>
      {hasUnlisted ? <p className="mt-3 text-[0.78rem] text-ink-faint">{UNLISTED_NOTE}</p> : null}
    </div>
  );
}

/**
 * 1つの場面のおすすめを全部見せる（目的別ページ・2人／大人数の一覧ページ）。
 * 小さなサムネイル＋名前＋人数・時間の行。ページが無いゲームも同じ並びに、名前だけで入れる。
 */
export function StaffPickList({ kind, heading }: { kind: StaffKind; heading: string }) {
  const { items, games } = staffList(kind);
  if (!items.length) return null;
  const hasUnlisted = items.some((i) => !i.game);
  // 2人・デートの一覧で、3人以上でないと遊べないゲームがあれば、そのことを書き添える（事実だけ）
  const threePlus = kind === 'two' || kind === 'couples' ? games.filter((g) => (g.players?.min ?? 0) >= 3) : [];
  return (
    <section>
      <h2 className="text-[clamp(1.3rem,3.2vw,1.65rem)] font-bold text-ink">{heading}</h2>
      <StaffPickNote className="mt-2" />
      <ul className="mt-6 grid gap-x-8 border-t border-line sm:grid-cols-2">
        {items.map((item) => {
          if (!item.game) {
            return (
              <li key={`name:${item.name}`} className="flex items-center gap-4 border-b border-line py-3.5">
                <div aria-hidden="true" className="aspect-square w-14 shrink-0 rounded-md bg-paper-2" />
                <div className="min-w-0">
                  <p className="font-medium text-ink">
                    {item.name}
                    <span className="text-ink-faint">＊</span>
                  </p>
                  <p className="mt-0.5 text-[0.78rem] text-ink-faint">このサイトにはまだ詳しいページがありません</p>
                </div>
              </li>
            );
          }
          const g = item.game;
          const comment = g.staff.comments[kind];
          return (
            <li key={g.slug} className="border-b border-line">
              <Link href={`/games/${g.slug}`} className="group flex items-center gap-4 py-3.5">
                <div className="w-14 shrink-0 overflow-hidden rounded-md">
                  <GameImage slug={g.slug} name={g.nameJa} nameEn={g.nameEn} genre={g.genre} />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-ink group-hover:text-accent-ink">{g.nameJa}</p>
                  <p className="mt-0.5 text-[0.78rem] text-ink-faint">
                    {[g.playersLabel, g.timeLabel, g.genreLabel].filter(Boolean).join('・')}
                  </p>
                  {comment ? <p className="mt-1 text-[0.85rem] leading-relaxed text-ink-soft">{comment}</p> : null}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
      {threePlus.length ? (
        <p className="mt-4 text-[0.88rem] leading-[1.9] text-ink-soft">
          {threePlus.map((g) => `「${g.nameJa}」`).join('')}は3人以上で遊ぶゲームです。
        </p>
      ) : null}
      {hasUnlisted ? <p className="mt-3 text-[0.8rem] text-ink-faint">{UNLISTED_NOTE}</p> : null}
    </section>
  );
}

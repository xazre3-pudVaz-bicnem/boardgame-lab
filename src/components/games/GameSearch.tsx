'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import GameTile from '@/components/GameTile';

/**
 * ボードゲーム一覧の絞り込み。
 *
 * 全件の本文をクライアントへ送ると重いので、
 * public/games-index.json（名前・人数・時間・ジャンルだけの軽い配列、人気順）を
 * 最初の操作のタイミングで取りに行く。読み込み前でもサーバーが描いた一覧は読める。
 *
 * 絞り込みの状態は URL の検索文字列にも書く（?players=2&time=s30 など）。
 * 「2人で30分以内」のような条件を、そのままリンクとして共有したり、
 * 他のページから条件つきで飛ばしたりできるようにするため。
 * canonical は常に /games なので、条件つきURLが重複ページとして登録されることはない。
 */

type Row = {
  s: string;
  n: string;
  /** 英名と別名（通称・略称）をまとめた検索用文字列。表示には使わない */
  e: string | null;
  p: [number, number] | null;
  t: [number, number] | null;
  g: string;
  /** 1 なら単体で遊べない拡張 */
  x: 0 | 1;
  /** 1 なら同じシリーズの独立拡張・別版 */
  v: 0 | 1;
  /** 1 ならスタッフおすすめ */
  k: 0 | 1;
  c: string[];
};

type Props = {
  genres: { key: string; label: string; count: number }[];
};

const PAGE = 60;

const TIME_FILTERS = [
  { key: 'any', label: 'すべて', test: () => true },
  { key: 's15', label: '15分以内', test: (r: Row) => Boolean(r.t && r.t[1] <= 15) },
  { key: 's30', label: '30分以内', test: (r: Row) => Boolean(r.t && r.t[1] <= 30) },
  { key: 's60', label: '60分以内', test: (r: Row) => Boolean(r.t && r.t[1] <= 60) },
  { key: 'l60', label: '60分以上', test: (r: Row) => Boolean(r.t && r.t[1] > 60) },
] as const;
type TimeKey = (typeof TIME_FILTERS)[number]['key'];

const PLAYERS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

/** カタカナ→ひらがな、全角英数→半角、大文字→小文字、記号と空白を除く。表記ゆれを吸収する。 */
function normalize(s: string) {
  return s
    .replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[・･\s：:！!？?'’"”（）()【】「」\-‐−–—/／]/g, '')
    .toLowerCase();
}

const chipBase =
  'ease-out-expo min-h-10 rounded-full px-3.5 py-2 text-[0.8rem] font-medium transition-all duration-200 border select-none';
const chipOn = 'border-cocoa bg-cocoa text-white shadow-[0_2px_10px_rgba(75,56,45,0.2)]';
const chipOff = 'border-line bg-white text-ink-soft hover:border-cocoa/40 hover:text-ink';

type State = {
  q: string;
  players: number | null;
  time: TimeKey;
  genre: string | null;
  expansions: boolean;
  sort: 'popular' | 'name';
};

const EMPTY: State = { q: '', players: null, time: 'any', genre: null, expansions: false, sort: 'popular' };

/** URLの検索文字列から状態を復元する。不正な値は無視する。 */
function fromSearch(search: string, genreKeys: Set<string>): State {
  const sp = new URLSearchParams(search);
  const players = Number(sp.get('players'));
  const time = sp.get('time') as TimeKey | null;
  const genre = sp.get('genre');
  return {
    q: sp.get('q') ?? '',
    players: PLAYERS.includes(players as (typeof PLAYERS)[number]) ? players : null,
    time: time && TIME_FILTERS.some((t) => t.key === time) ? time : 'any',
    genre: genre && genreKeys.has(genre) ? genre : null,
    expansions: sp.get('exp') === '1',
    sort: sp.get('sort') === 'name' ? 'name' : 'popular',
  };
}

function toSearch(st: State) {
  const sp = new URLSearchParams();
  if (st.q) sp.set('q', st.q);
  if (st.players) sp.set('players', String(st.players));
  if (st.time !== 'any') sp.set('time', st.time);
  if (st.genre) sp.set('genre', st.genre);
  if (st.expansions) sp.set('exp', '1');
  if (st.sort !== 'popular') sp.set('sort', st.sort);
  const s = sp.toString();
  return s ? `?${s}` : '';
}

export default function GameSearch({ genres }: Props) {
  const genreKeys = useMemo(() => new Set(genres.map((g) => g.key)), [genres]);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [st, setSt] = useState<State>(EMPTY);
  const [shown, setShown] = useState(PAGE);
  const loaded = useRef(false);

  /** 索引の取得。最初の操作、またはURLに条件が付いていたときに読む。 */
  const ensureLoaded = useCallback(() => {
    if (loaded.current) return;
    loaded.current = true;
    setLoading(true);
    fetch('/games-index.json')
      .then((r) => r.json())
      .then((d: Row[]) => setRows(d))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  // URLに条件が付いて開かれたら、その状態で始める
  useEffect(() => {
    const initial = fromSearch(window.location.search, genreKeys);
    if (toSearch(initial)) {
      setSt(initial);
      ensureLoaded();
    }
  }, [ensureLoaded, genreKeys]);

  // 状態をURLに写す。履歴は増やさない（戻るボタンが条件の数だけ増えないように）。
  useEffect(() => {
    const id = window.setTimeout(() => {
      const url = new URL(window.location.href);
      url.search = toSearch(st);
      window.history.replaceState(null, '', url.toString());
    }, 300);
    return () => window.clearTimeout(id);
  }, [st]);

  const update = (patch: Partial<State>) => {
    ensureLoaded();
    setShown(PAGE);
    setSt((prev) => ({ ...prev, ...patch }));
  };
  const reset = () => {
    setSt(EMPTY);
    setShown(PAGE);
  };

  const active = Boolean(st.q || st.players || st.time !== 'any' || st.genre || st.expansions || st.sort !== 'popular');

  const results = useMemo(() => {
    if (!rows) return null;
    const nq = normalize(st.q.trim());
    const timeTest = TIME_FILTERS.find((t) => t.key === st.time)!.test;

    let out = rows.filter((r) => {
      if (nq && !normalize(r.n).includes(nq) && !(r.e && normalize(r.e).includes(nq))) return false;
      if (st.players && !(r.p && r.p[0] <= st.players && st.players <= r.p[1])) return false;
      if (!timeTest(r)) return false;
      if (st.genre && r.g !== st.genre) return false;
      if (!st.expansions && r.x) return false;
      return true;
    });
    if (st.sort === 'name') out = [...out].sort((a, b) => a.n.localeCompare(b.n, 'ja'));
    return out;
  }, [rows, st]);

  /** いま効いている条件を、人が読める形にする（結果の見出しに出す） */
  const summary = useMemo(() => {
    const parts: string[] = [];
    if (st.players) parts.push(`${st.players}人`);
    if (st.time !== 'any') parts.push(TIME_FILTERS.find((t) => t.key === st.time)!.label);
    if (st.genre) parts.push(genres.find((g) => g.key === st.genre)?.label ?? '');
    if (st.expansions) parts.push('拡張を含む');
    if (st.q.trim()) parts.push(`「${st.q.trim()}」`);
    return parts.filter(Boolean).join(' × ');
  }, [st, genres]);

  return (
    <div>
      {/* ------------------------------------------------ 入力 */}
      <div className="rounded-2xl border border-line bg-white p-5 shadow-[0_2px_20px_rgba(0,40,79,0.04)] sm:p-7">
        <label htmlFor="game-q" className="mb-2 block text-[0.8rem] font-medium text-ink">
          ゲーム名で探す
          <span className="ml-2 text-[0.7rem] font-normal text-ink-faint">ひらがな・カタカナ・英語名・通称でも</span>
        </label>
        <div className="relative">
          <input
            id="game-q"
            type="search"
            value={st.q}
            placeholder="カタン、ito、ニムト、ごきポ…"
            onChange={(e) => update({ q: e.target.value })}
            onFocus={ensureLoaded}
            enterKeyHint="search"
            className="w-full rounded-xl border border-line bg-paper py-3.5 pr-4 pl-11 text-[1rem] text-ink transition-colors placeholder:text-ink-faint focus:border-caramel focus:bg-white focus:ring-2 focus:ring-caramel/25 focus:outline-none"
          />
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-ink-faint"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
        </div>

        <div className="mt-6 space-y-5">
          {/* fieldset は既定で min-width: min-content を持ち、横スクロールの行を縮めてくれない。min-w-0 で外す */}
          <fieldset className="min-w-0">
            <legend className="mb-2.5 text-[0.8rem] font-medium text-ink">人数</legend>
            {/* スマホでは横に流して、9個のチップが3段に折り返さないようにする */}
            <div className="hide-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
              <button
                type="button"
                onClick={() => update({ players: null })}
                className={`${chipBase} shrink-0 ${st.players === null ? chipOn : chipOff}`}
              >
                指定なし
              </button>
              {PLAYERS.map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-pressed={st.players === n}
                  onClick={() => update({ players: st.players === n ? null : n })}
                  className={`${chipBase} shrink-0 ${st.players === n ? chipOn : chipOff}`}
                >
                  {n}人{n === 8 ? '〜' : ''}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="min-w-0">
            <legend className="mb-2.5 text-[0.8rem] font-medium text-ink">プレイ時間</legend>
            <div className="hide-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
              {TIME_FILTERS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  aria-pressed={st.time === t.key}
                  onClick={() => update({ time: t.key })}
                  className={`${chipBase} shrink-0 ${st.time === t.key ? chipOn : chipOff}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2.5 text-[0.8rem] font-medium text-ink">ジャンル</legend>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => update({ genre: null })}
                className={`${chipBase} ${st.genre === null ? chipOn : chipOff}`}
              >
                すべて
              </button>
              {genres.map((g) => (
                <button
                  key={g.key}
                  type="button"
                  aria-pressed={st.genre === g.key}
                  onClick={() => update({ genre: st.genre === g.key ? null : g.key })}
                  className={`${chipBase} ${st.genre === g.key ? chipOn : chipOff}`}
                >
                  {g.label}
                  <span className="ml-1 text-[0.68rem] opacity-80">{g.count}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
            <button
              type="button"
              aria-pressed={st.expansions}
              onClick={() => update({ expansions: !st.expansions })}
              className={`${chipBase} ${st.expansions ? chipOn : chipOff}`}
            >
              単体で遊べない拡張も表示
            </button>

            <label htmlFor="game-sort" className="ml-auto text-[0.78rem] text-ink-soft">
              並び順
            </label>
            <select
              id="game-sort"
              value={st.sort}
              onChange={(e) => update({ sort: e.target.value as State['sort'] })}
              className="min-h-10 rounded-full border border-line bg-white px-3.5 py-1.5 text-[0.8rem] text-ink focus:border-caramel focus:outline-none"
            >
              <option value="popular">人気順</option>
              <option value="name">名前順</option>
            </select>

            {active ? (
              <button
                type="button"
                onClick={reset}
                className="min-h-10 text-[0.8rem] text-cocoa underline underline-offset-4 hover:text-caramel-ink"
              >
                条件をリセット
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------ 結果 */}
      <div aria-live="polite" className="mt-8 scroll-mt-24">
        {!rows && !loading ? (
          <p className="text-[0.85rem] text-ink-faint">
            条件を選ぶと、その場で絞り込みます。下には人気順の一覧を表示しています。
          </p>
        ) : null}

        {loading ? <p className="text-[0.85rem] text-ink-faint">読み込んでいます…</p> : null}

        {results ? (
          <>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              {/* 件数は絞り込んだときだけ出す。全体の数は日々増えるので表示しない（店舗の指示）。 */}
              {active ? (
                <p className="text-[0.85rem] text-ink-soft">
                  <strong className="display text-[1.2rem] text-ink">{results.length}</strong> 件
                </p>
              ) : null}
              {summary ? <p className="text-[0.8rem] text-cocoa">{summary}</p> : null}
            </div>

            {results.length === 0 ? (
              <div className="mt-6 rounded-xl border border-line bg-white p-8 text-center">
                <p className="text-[0.95rem] font-semibold text-ink">条件に合うゲームが見つかりませんでした</p>
                <p className="mt-2 text-[0.85rem] leading-[1.9] text-ink-soft">
                  人数や時間の条件をひとつ外すか、
                  {st.q ? '別の呼び方（カタカナ・英語名）で' : ''}お試しください。
                  <br />
                  <Link href="/games/list" className="prose-link">
                    全タイトルの索引
                  </Link>
                  から探すこともできます。
                </p>
                <button
                  type="button"
                  onClick={reset}
                  className="ease-out-expo mt-5 min-h-11 rounded-full border border-cocoa/25 px-7 py-3 text-[0.85rem] font-semibold text-cocoa transition-all duration-300 hover:border-cocoa hover:bg-cocoa/5"
                >
                  条件をリセット
                </button>
              </div>
            ) : (
              <>
                <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {results.slice(0, shown).map((r) => (
                    <li key={r.s}>
                      <Link
                        href={`/games/${r.s}`}
                        className="group block overflow-hidden rounded-xl border border-line bg-white transition-all duration-300 hover:-translate-y-1 hover:border-cocoa/25 hover:shadow-[0_10px_30px_rgba(0,40,79,0.09)]"
                      >
                        <div className="overflow-hidden">
                          <GameTile slug={r.s} name={r.n} nameEn={r.e ? r.e.split(' / ')[0] : null} genre={r.g} className="aspect-square w-full" />
                        </div>
                        <div className="p-3.5">
                          {r.x ? (
                            <span className="mb-1 inline-block rounded bg-amber-wash px-1.5 py-0.5 text-[0.68rem] font-semibold text-amber-ink">拡張</span>
                          ) : r.v ? (
                            <span className="mb-1 inline-block rounded bg-paper-2 px-1.5 py-0.5 text-[0.68rem] font-semibold text-ink-soft">シリーズ作品</span>
                          ) : null}
                          <h3 className="line-clamp-2 text-[0.85rem] leading-snug font-semibold text-ink transition-colors group-hover:text-caramel-ink">
                            {r.n}
                          </h3>
                          <p className="mt-1.5 text-[0.72rem] text-ink-faint">
                            {r.p ? (r.p[0] === r.p[1] ? `${r.p[0]}人` : `${r.p[0]}〜${r.p[1]}人`) : '人数未確認'}
                            {r.t ? ` ・ ${r.t[0] === r.t[1] ? r.t[0] : `${r.t[0]}〜${r.t[1]}`}分` : ''}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>

                {shown < results.length ? (
                  <div className="mt-10 text-center">
                    <button
                      type="button"
                      onClick={() => setShown(shown + PAGE)}
                      className="ease-out-expo min-h-11 rounded-full border border-cocoa/25 px-8 py-3.5 text-[0.88rem] font-semibold text-cocoa transition-all duration-300 hover:border-cocoa hover:bg-cocoa/5"
                    >
                      さらに{Math.min(PAGE, results.length - shown)}件を表示
                      <span className="ml-2 text-[0.75rem] font-normal text-ink-faint">
                        （{shown} / {results.length}）
                      </span>
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}

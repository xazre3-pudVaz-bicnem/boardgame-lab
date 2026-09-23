'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import GameTile from '@/components/GameTile';

/**
 * 608タイトルの絞り込み。
 *
 * 全件の本文をクライアントへ送ると重いので、
 * public/games-index.json（名前・人数・時間・ジャンルだけの軽い配列、人気順）を
 * 最初の操作のタイミングで取りに行く。読み込み前でもサーバーが描いた一覧は読める。
 */

type Row = {
  s: string;
  n: string;
  e: string | null;
  p: [number, number] | null;
  t: [number, number] | null;
  a: number | null;
  g: string;
  w: 'light' | 'middle' | 'heavy';
  b: 0 | 1;
  c: string[];
  /** 1 ならパッケージ画像がある。0 ならSVGを描く。 */
  i: 0 | 1;
};

type Props = {
  genres: { key: string; label: string; count: number }[];
  total: number;
};

const PAGE = 60;

const TIME_FILTERS = [
  { key: 'any', label: 'すべて', test: () => true },
  { key: 's15', label: '15分以内', test: (r: Row) => Boolean(r.t && r.t[1] <= 15) },
  { key: 's30', label: '30分以内', test: (r: Row) => Boolean(r.t && r.t[1] <= 30) },
  { key: 's60', label: '60分以内', test: (r: Row) => Boolean(r.t && r.t[1] <= 60) },
  { key: 'l60', label: '60分以上', test: (r: Row) => Boolean(r.t && r.t[1] > 60) },
] as const;

const PLAYERS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

/** カタカナ→ひらがな、全角英数→半角、大文字→小文字。表記ゆれを吸収する。 */
function normalize(s: string) {
  return s
    .replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[・･\s：:！!？?'’"”（）()【】「」]/g, '')
    .toLowerCase();
}

const chipBase =
  'ease-out-expo min-h-9 rounded-full px-3.5 py-1.5 text-[0.78rem] font-medium transition-all duration-200 border';
const chipOn = 'border-navy bg-navy text-white';
const chipOff = 'border-line bg-white text-ink-soft hover:border-navy/40 hover:text-ink';

export default function GameSearch({ genres, total }: Props) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [players, setPlayers] = useState<number | null>(null);
  const [time, setTime] = useState<(typeof TIME_FILTERS)[number]['key']>('any');
  const [genre, setGenre] = useState<string | null>(null);
  const [beginner, setBeginner] = useState(false);
  const [sort, setSort] = useState<'popular' | 'name'>('popular');
  const [shown, setShown] = useState(PAGE);
  const loaded = useRef(false);

  /** 索引の取得。最初の操作、またはURLに ?q= が付いていたときに読む。 */
  const ensureLoaded = useMemo(
    () => () => {
      if (loaded.current) return;
      loaded.current = true;
      setLoading(true);
      fetch('/games-index.json')
        .then((r) => r.json())
        .then((d: Row[]) => setRows(d))
        .catch(() => setRows([]))
        .finally(() => setLoading(false));
    },
    [],
  );

  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get('q');
    if (initial) {
      setQ(initial);
      ensureLoaded();
    }
  }, [ensureLoaded]);

  /** 入力内容をURLに残す。履歴は増やさない（canonicalは常に /games）。 */
  useEffect(() => {
    const id = window.setTimeout(() => {
      const url = new URL(window.location.href);
      if (q) url.searchParams.set('q', q);
      else url.searchParams.delete('q');
      window.history.replaceState(null, '', url.toString());
    }, 400);
    return () => window.clearTimeout(id);
  }, [q]);

  const active = Boolean(q || players || time !== 'any' || genre || beginner || sort !== 'popular');

  const results = useMemo(() => {
    if (!rows) return null;
    const nq = normalize(q.trim());
    const timeTest = TIME_FILTERS.find((t) => t.key === time)!.test;

    let out = rows.filter((r) => {
      if (nq && !normalize(r.n).includes(nq) && !(r.e && normalize(r.e).includes(nq))) return false;
      if (players && !(r.p && r.p[0] <= players && players <= r.p[1])) return false;
      if (!timeTest(r)) return false;
      if (genre && r.g !== genre) return false;
      if (beginner && !r.b) return false;
      return true;
    });
    if (sort === 'name') out = [...out].sort((a, b) => a.n.localeCompare(b.n, 'ja'));
    return out;
  }, [rows, q, players, time, genre, beginner, sort]);

  const reset = () => {
    setQ('');
    setPlayers(null);
    setTime('any');
    setGenre(null);
    setBeginner(false);
    setSort('popular');
    setShown(PAGE);
  };

  const touch = () => {
    ensureLoaded();
    setShown(PAGE);
  };

  return (
    <div>
      {/* ------------------------------------------------ 入力 */}
      <div className="rounded-2xl border border-line bg-white p-5 sm:p-7">
        <label htmlFor="game-q" className="mb-2 block text-[0.8rem] font-medium text-ink">
          ゲーム名で探す
        </label>
        <input
          id="game-q"
          type="search"
          value={q}
          placeholder="カタン、ito、ワードバスケット…"
          onChange={(e) => {
            setQ(e.target.value);
            touch();
          }}
          onFocus={ensureLoaded}
          className="w-full rounded-lg border border-line bg-paper px-4 py-3 text-[0.92rem] text-ink transition-colors placeholder:text-ink-faint focus:border-cyan focus:ring-2 focus:ring-cyan/25 focus:outline-none"
        />

        <div className="mt-6 space-y-5">
          <fieldset>
            <legend className="mb-2.5 text-[0.8rem] font-medium text-ink">人数</legend>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setPlayers(null);
                  touch();
                }}
                className={`${chipBase} ${players === null ? chipOn : chipOff}`}
              >
                指定なし
              </button>
              {PLAYERS.map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-pressed={players === n}
                  onClick={() => {
                    setPlayers(players === n ? null : n);
                    touch();
                  }}
                  className={`${chipBase} ${players === n ? chipOn : chipOff}`}
                >
                  {n}人
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2.5 text-[0.8rem] font-medium text-ink">プレイ時間</legend>
            <div className="flex flex-wrap gap-2">
              {TIME_FILTERS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  aria-pressed={time === t.key}
                  onClick={() => {
                    setTime(t.key);
                    touch();
                  }}
                  className={`${chipBase} ${time === t.key ? chipOn : chipOff}`}
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
                onClick={() => {
                  setGenre(null);
                  touch();
                }}
                className={`${chipBase} ${genre === null ? chipOn : chipOff}`}
              >
                すべて
              </button>
              {genres.map((g) => (
                <button
                  key={g.key}
                  type="button"
                  aria-pressed={genre === g.key}
                  onClick={() => {
                    setGenre(genre === g.key ? null : g.key);
                    touch();
                  }}
                  className={`${chipBase} ${genre === g.key ? chipOn : chipOff}`}
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
              aria-pressed={beginner}
              onClick={() => {
                setBeginner(!beginner);
                touch();
              }}
              className={`${chipBase} ${beginner ? 'border-amber bg-amber text-ink' : chipOff}`}
            >
              初心者向けだけ
            </button>

            <label htmlFor="game-sort" className="ml-auto text-[0.78rem] text-ink-soft">
              並び順
            </label>
            <select
              id="game-sort"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as 'popular' | 'name');
                touch();
              }}
              className="min-h-9 rounded-full border border-line bg-white px-3.5 py-1.5 text-[0.78rem] text-ink focus:border-cyan focus:outline-none"
            >
              <option value="popular">人気順</option>
              <option value="name">名前順</option>
            </select>

            {active ? (
              <button type="button" onClick={reset} className="text-[0.78rem] text-navy underline underline-offset-4">
                条件をリセット
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------ 結果 */}
      <div aria-live="polite" className="mt-8">
        {!rows && !loading ? (
          <p className="text-[0.85rem] text-ink-faint">
            条件を選ぶと、{total}タイトルの中から絞り込みます。下には人気順の一覧を表示しています。
          </p>
        ) : null}

        {loading ? <p className="text-[0.85rem] text-ink-faint">読み込んでいます…</p> : null}

        {results ? (
          <>
            <p className="text-[0.85rem] text-ink-soft">
              <strong className="display text-[1.1rem] text-ink">{results.length}</strong> 件
              {active ? <span className="ml-2 text-ink-faint">／ 全{total}タイトル中</span> : null}
            </p>

            {results.length === 0 ? (
              <div className="mt-6 rounded-xl border border-line bg-white p-8 text-center">
                <p className="text-[0.9rem] text-ink">条件に合うゲームが見つかりませんでした。</p>
                <p className="mt-2 text-[0.82rem] text-ink-soft">
                  条件をゆるめるか、
                  <Link href="/games/list" className="prose-link">
                    全タイトルの一覧
                  </Link>
                  からお探しください。
                </p>
              </div>
            ) : (
              <>
                <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {results.slice(0, shown).map((r) => (
                    <li key={r.s}>
                      <Link
                        href={`/games/${r.s}`}
                        className="group block overflow-hidden rounded-xl border border-line bg-white transition-all duration-300 hover:-translate-y-1 hover:border-navy/25"
                      >
                        {r.i ? (
                          // 実寸ちょうどのwebpを事前生成しているので変換は挟まない（GameImage と同じ理由）
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={`/games/${r.s}-320.webp`}
                            width={320}
                            height={320}
                            alt={`${r.n}のゲーム画像`}
                            loading="lazy"
                            decoding="async"
                            className="aspect-square w-full bg-paper-2 object-contain"
                          />
                        ) : (
                          <GameTile slug={r.s} name={r.n} nameEn={r.e} genre={r.g} />
                        )}
                        <div className="p-3.5">
                          <h3 className="line-clamp-2 text-[0.85rem] leading-snug font-semibold text-ink transition-colors group-hover:text-cyan-ink">
                            {r.n}
                          </h3>
                          <p className="mt-1.5 text-[0.72rem] text-ink-faint">
                            {r.p ? `${r.p[0]}〜${r.p[1]}人` : '人数未確認'}
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
                      className="ease-out-expo min-h-11 rounded-full border border-navy/25 px-8 py-3.5 text-[0.88rem] font-semibold text-navy transition-all duration-300 hover:border-navy hover:bg-navy/5"
                    >
                      さらに{Math.min(PAGE, results.length - shown)}件を表示
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

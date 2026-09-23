import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs, Container, PageHeader } from '@/components/ui';
import { GAME_COUNT, GAMES, playersText, timeText } from '@/lib/games';
import { breadcrumbSchema, buildMetadata, JsonLd } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: `全${GAME_COUNT}タイトルの索引｜ボードゲーム一覧｜大阪・梅田中津 BODOlab.`,
  description: `BODOlab.に置いているボードゲーム${GAME_COUNT}タイトルを五十音順に並べた索引です。タイトル名が分かっている場合はこちらから探せます。`,
  path: '/games/list',
  keywords: ['ボードゲーム 一覧', 'ボードゲーム 索引', '大阪 ボードゲーム 種類'],
});

const crumbs = [
  { name: 'ホーム', href: '/' },
  { name: 'ボードゲーム一覧', href: '/games' },
  { name: '全タイトルの索引' },
];

/** 五十音の行。読みではなく表示名の先頭文字で振り分ける簡易版。 */
const ROWS: { label: string; test: (c: string) => boolean }[] = [
  { label: 'あ', test: (c) => /[ぁ-おァ-オ]/.test(c) },
  { label: 'か', test: (c) => /[か-ごカ-ゴ]/.test(c) },
  { label: 'さ', test: (c) => /[さ-ぞサ-ゾ]/.test(c) },
  { label: 'た', test: (c) => /[た-どタ-ド]/.test(c) },
  { label: 'な', test: (c) => /[な-のナ-ノ]/.test(c) },
  { label: 'は', test: (c) => /[は-ぽハ-ポ]/.test(c) },
  { label: 'ま', test: (c) => /[ま-もマ-モ]/.test(c) },
  { label: 'や', test: (c) => /[ゃ-よャ-ヨ]/.test(c) },
  { label: 'ら', test: (c) => /[ら-ろラ-ロ]/.test(c) },
  { label: 'わ', test: (c) => /[わ-んヮ-ンー]/.test(c) },
  { label: 'A–Z', test: (c) => /[A-Za-zＡ-Ｚａ-ｚ]/.test(c) },
  { label: '数字・記号', test: () => true },
];

export default function GameListPage() {
  const sorted = [...GAMES].sort((a, b) => a.nameJa.localeCompare(b.nameJa, 'ja'));
  const groups = ROWS.map((r) => ({ label: r.label, games: [] as typeof sorted }));

  for (const g of sorted) {
    const c = g.nameJa[0] ?? '';
    const idx = ROWS.findIndex((r) => r.test(c));
    groups[idx === -1 ? ROWS.length - 1 : idx].games.push(g);
  }
  const filled = groups.filter((g) => g.games.length > 0);

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />

      <PageHeader
        eyebrow="Index"
        title={`全${GAME_COUNT}タイトルの索引`}
        breadcrumbs={crumbs}
        lead="タイトル名の五十音順に並べた索引です。条件で絞り込みたい場合は、ボードゲーム一覧の検索をお使いください。"
      />

      <section className="section-y bg-paper">
        <Container>
          <nav aria-label="行で移動" className="flex flex-wrap gap-2">
            {filled.map((g) => (
              <a
                key={g.label}
                href={`#row-${encodeURIComponent(g.label)}`}
                className="inline-flex min-h-10 items-center rounded-full border border-line bg-white px-4 py-2 text-[0.82rem] text-ink-soft transition-colors hover:border-navy/40 hover:text-ink"
              >
                {g.label}
                <span className="ml-1.5 text-[0.78rem] text-ink-faint">{g.games.length}</span>
              </a>
            ))}
          </nav>

          <div className="mt-12 space-y-14">
            {filled.map((group) => (
              <section key={group.label} id={`row-${encodeURIComponent(group.label)}`} className="scroll-mt-24">
                <h2 className="display border-b border-line pb-3 text-[1.3rem] text-ink">
                  {group.label}
                  <span className="ml-3 text-[0.8rem] font-normal text-ink-faint">{group.games.length}タイトル</span>
                </h2>
                <ul className="mt-4 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
                  {group.games.map((g) => {
                    const meta = [playersText(g), timeText(g)].filter(Boolean).join('・');
                    return (
                      <li key={g.slug}>
                        <Link
                          href={`/games/${g.slug}`}
                          className="flex items-baseline justify-between gap-4 border-b border-line py-2.5 transition-colors hover:text-cyan-ink"
                        >
                          <span className="text-[0.86rem] leading-snug">{g.nameJa}</span>
                          {meta ? <span className="shrink-0 text-[0.78rem] text-ink-faint">{meta}</span> : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>

          <div className="mt-16">
            <Breadcrumbs items={crumbs} />
          </div>
        </Container>
      </section>
    </>
  );
}

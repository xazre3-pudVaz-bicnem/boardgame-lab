import Link from 'next/link';
import { Button, Container } from '@/components/ui';
import { popularGames } from '@/lib/games';

export const metadata = {
  title: 'ページが見つかりません｜BODOlab.（ボードゲームラボ）',
  robots: { index: false, follow: true },
};

const LINKS = [
  { href: '/games', label: 'ボードゲーム一覧', note: '608タイトルを人数・時間・ジャンルで探せます' },
  { href: '/system', label: '料金・ご利用案内', note: '1時間600円、上限あり。ご予約方法もこちら' },
  { href: '/access', label: 'アクセス', note: '中津駅から徒歩3分、梅田から徒歩10分' },
  { href: '/news', label: 'お知らせ', note: '営業に関する過去の告知' },
];

export default function NotFound() {
  const games = popularGames(5);

  return (
    <section className="section-y bg-paper pt-36">
      <Container size="narrow">
        <p className="display text-[0.7rem] tracking-[0.28em] text-cyan-ink uppercase">404 Not Found</p>
        <h1 className="display text-balance mt-4 text-[clamp(1.6rem,4.6vw,2.4rem)] leading-[1.35] text-ink">
          お探しのページが見つかりませんでした
        </h1>
        <p className="text-pretty mt-5 text-[0.95rem] leading-[1.95] text-ink-soft">
          URLが変わったか、ページが削除された可能性があります。
          お探しの内容が以下にあるかもしれません。
        </p>

        <ul className="mt-10 divide-y divide-line border-y border-line">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="group flex flex-col gap-1 py-4">
                <span className="text-[0.95rem] font-semibold text-ink transition-colors group-hover:text-cyan-ink">
                  {l.label}
                </span>
                <span className="text-[0.82rem] text-ink-soft">{l.note}</span>
              </Link>
            </li>
          ))}
        </ul>

        <h2 className="display mt-14 text-[1.05rem] text-ink">よく見られているゲーム</h2>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {games.map((g) => (
            <li key={g.slug}>
              <Link
                href={`/games/${g.slug}`}
                className="flex items-baseline justify-between gap-4 py-3 transition-colors hover:text-cyan-ink"
              >
                <span className="text-[0.9rem]">{g.nameJa}</span>
                <span className="shrink-0 text-[0.75rem] text-ink-faint">{g.playersLabel ?? ''}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-12 flex flex-wrap gap-3">
          <Button href="/" variant="solid">
            トップページへ
          </Button>
          <Button href="/contact" variant="outline">
            お問い合わせ
          </Button>
        </div>
      </Container>
    </section>
  );
}

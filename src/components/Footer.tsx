import Link from 'next/link';
import Image from 'next/image';
import { shop, hoursLine } from '@/data/shop';
import { Container } from './ui';

const columns: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: 'ゲームを探す',
    links: [
      { href: '/games', label: 'ゲームコレクション' },
      { href: '/games/for-beginners', label: '初心者におすすめ' },
      { href: '/games/for-two', label: '2人で遊べる' },
      { href: '/games/party', label: 'パーティーゲーム' },
      { href: '/games/short-play', label: '短時間で遊べる' },
      { href: '/games/for-couples', label: 'カップル・デート向け' },
      { href: '/games/for-groups', label: '大人数で遊べる' },
      { href: '/games/heavy', label: 'じっくり遊ぶ重量級' },
    ],
  },
  {
    title: 'お店のこと',
    links: [
      { href: '/system', label: '料金・利用案内' },
      { href: '/access', label: 'アクセス' },
      { href: '/schedule', label: 'イベント' },
      { href: '/news', label: 'お知らせ' },
      { href: '/faq', label: 'よくあるご質問' },
      { href: '/contact', label: 'お問い合わせ' },
      { href: '/part-timejob', label: 'スタッフ募集' },
    ],
  },
  {
    title: '遊び方から探す',
    links: [
      { href: '/scene', label: '遊び方・シーン一覧' },
      { href: '/scene/rainy-day', label: '大阪の雨の日に' },
      { href: '/scene/indoor-date', label: '梅田で室内デート' },
      { href: '/scene/with-friends', label: '友達と遊ぶ場所' },
      { href: '/scene/solo', label: '1人で参加する' },
      { href: '/scene/after-work', label: '仕事帰りに' },
      { href: '/scene/indoor', label: '大阪の室内遊び' },
      { href: '/scene/group', label: '5人以上で' },
      { href: '/scene/hobby', label: '社会人の新しい趣味に' },
      { href: '/area/umeda', label: '梅田から行く' },
      { href: '/area/nakatsu', label: '中津から行く' },
      { href: '/blog', label: 'コラム' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="cv-auto mt-auto border-t border-line bg-surface">
      <Container size="wide" className="py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,2fr)]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3" aria-label="BODOlab. ホームへ">
              <Image src="/logo-mark.png" alt="" width={44} height={44} className="h-10 w-10" />
              <span className="display text-[1.35rem] font-bold tracking-tight text-ink">
                BODOlab<span className="text-cyan">.</span>
              </span>
            </Link>
            <p className="mt-4 text-[0.85rem] leading-[1.9] text-ink-soft">
              大阪市北区豊崎、中津駅から徒歩3分。
              <br />
              {shop.tagline}。
            </p>

            <address className="mt-6 space-y-1.5 text-[0.82rem] leading-relaxed text-ink-soft not-italic">
              <div>{shop.address.full}</div>
              <div>
                TEL ＆ FAX{' '}
                <a href={`tel:${shop.tel.value.replace(/-/g, '')}`} className="prose-link">
                  {shop.tel.value}
                </a>
              </div>
              <div>{hoursLine()}</div>
            </address>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={shop.reservationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center rounded-full bg-navy px-6 text-[0.82rem] font-semibold text-white transition-colors hover:bg-navy-deep"
              >
                ご来店予約
              </a>
              <a
                href={shop.links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center rounded-full border border-line px-5 text-[0.82rem] font-medium text-ink-soft transition-colors hover:border-navy/30 hover:text-navy"
              >
                Instagram
              </a>
              <a
                href={shop.links.bodogeGames}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center rounded-full border border-line px-5 text-[0.82rem] font-medium text-ink-soft transition-colors hover:border-navy/30 hover:text-navy"
              >
                ボドゲーマの所蔵リスト
              </a>
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            {columns.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h2 className="display text-[0.65rem] font-semibold tracking-[0.18em] text-ink-faint uppercase">
                  {col.title}
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-[0.84rem] text-ink-soft transition-colors hover:text-cyan-ink">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-line pt-7 text-[0.72rem] text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} BODOlab.（ボードゲームラボ） All Rights Reserved.</p>
          <p>大阪 梅田・中津のボードゲームプレイスペース＆ショップ</p>
        </div>
      </Container>
    </footer>
  );
}

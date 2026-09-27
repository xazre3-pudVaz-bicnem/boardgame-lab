'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { shop } from '@/data/shop';

const nav = [
  { href: '/games', label: 'ゲーム', en: 'Games' },
  { href: '/system', label: '料金・利用案内', en: 'System' },
  { href: '/scene', label: '目的別', en: 'Scene' },
  { href: '/schedule', label: 'イベント', en: 'Event' },
  { href: '/news', label: 'お知らせ', en: 'News' },
  { href: '/access', label: 'アクセス', en: 'Access' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header
      /*
        backdrop-filter を持つ要素の中では position:fixed が効かなくなるため、
        ドロワーはこのヘッダーの外（下の <div>）に absolute で出す。
      */
      /* 写真の上に重なるページでは globals.css 側で文字色を白に切り替える（data-at-top を見ている） */
      data-at-top={scrolled || open ? undefined : 'true'}
      className={`site-header fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-[var(--ease-out-expo)] ${
        scrolled || open ? 'bg-paper/92 shadow-[0_1px_0_rgba(0,0,0,0.06)] backdrop-blur-lg' : 'bg-transparent'
      }`}
    >
      <div className="relative mx-auto flex h-16 w-full max-w-[92rem] items-center justify-between px-4 sm:h-20 sm:px-6 lg:px-10">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="BODOlab. ホームへ">
          <Image src="/logo-mark.png" alt="" width={36} height={36} className="h-8 w-8 sm:h-9 sm:w-9" priority />
          <span className="header-ink display text-[1.05rem] leading-none font-bold tracking-tight text-ink sm:text-[1.2rem]">
            BODOlab<span className="text-cyan">.</span>
          </span>
        </Link>

        <nav aria-label="メインナビゲーション" className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {nav.map((n) => {
              const active = pathname === n.href || pathname.startsWith(`${n.href}/`);
              return (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    className={`group flex flex-col items-center gap-0.5 text-[0.82rem] font-medium transition-colors ${
                      active ? 'text-cyan-ink' : 'header-ink text-ink hover:text-cyan-ink'
                    }`}
                  >
                    {n.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={shop.reservationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden min-h-10 items-center rounded-full bg-navy px-5 py-2.5 text-[0.82rem] font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-navy-deep sm:inline-flex"
          >
            ご来店予約
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'メニューを閉じる' : 'メニューを開く'}
            className="header-ink flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5 lg:hidden"
          >
            <span className="relative block h-3.5 w-5" aria-hidden="true">
              <span
                className={`absolute left-0 block h-[1.5px] w-5 bg-current transition-all duration-300 ${open ? 'top-1.5 rotate-45' : 'top-0'}`}
              />
              <span
                className={`absolute top-1.5 left-0 block h-[1.5px] w-5 bg-current transition-opacity duration-200 ${open ? 'opacity-0' : ''}`}
              />
              <span
                className={`absolute left-0 block h-[1.5px] w-5 bg-current transition-all duration-300 ${open ? 'top-1.5 -rotate-45' : 'top-3'}`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* モバイルドロワー：親が backdrop-blur を持つので fixed ではなく absolute + top-full で出す */}
      <div
        id="mobile-nav"
        hidden={!open}
        className="absolute inset-x-0 top-full max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-paper lg:hidden"
      >
        <nav aria-label="モバイルナビゲーション" className="px-5 py-6">
          <ul className="divide-y divide-line">
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="flex items-baseline gap-3 py-4 text-[1rem] font-medium text-ink">
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/scene/first-time" className="flex items-baseline gap-3 py-4 text-[1rem] text-ink">
                はじめての方へ
              </Link>
            </li>
            <li>
              <Link href="/blog" className="flex items-baseline gap-3 py-4 text-[1rem] text-ink">
                コラム
              </Link>
            </li>
          </ul>
          <div className="mt-6 grid gap-3">
            <a
              href={shop.reservationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-12 items-center justify-center rounded-full bg-navy px-6 text-[0.9rem] font-semibold text-white"
            >
              ご来店予約フォーム
            </a>
            <a
              href={`tel:${shop.tel.value.replace(/-/g, '')}`}
              className="flex min-h-12 items-center justify-center rounded-full border border-navy/25 px-6 text-[0.9rem] font-semibold text-navy"
            >
              電話で問い合わせる（{shop.tel.value}）
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}

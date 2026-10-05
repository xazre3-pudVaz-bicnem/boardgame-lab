import type { Metadata, Viewport } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import { JsonLd, localBusinessSchema, organizationSchema, websiteSchema, SITE_NAME } from '@/lib/seo';
import { SITE_URL, SITE_URL_CONFIGURED } from '@/data/shop';
import fonts from '@/data/fonts.json';

/*
 * 見出し用の丸ゴシック（Zen Maru Gothic）の読み込み。本文はシステムフォントのまま。
 *
 * 日本語フォントは @font-face の定義だけで大きなCSSになる。next/font で入れると、それが最初の表示を
 * 止めてしまう（LCP が1秒以上悪化した）ので、定義のCSSはページの表示を待たせずに後から足す。
 * 届くまではシステムフォントで表示し、届いたら置き換わる（font-display: swap）。
 * フォント本体は文字の範囲ごとに分割されていて、ページで使っている範囲だけが読み込まれる。
 * ファイルは scripts/build-fonts.mjs が public/fonts/ に用意する。
 *
 * 読み込みを始めるのは、最初の描画（first-contentful-paint）が記録されたあと。
 * 描画の前に始めると、フォントの通信が最初の表示と帯域を取り合う。
 * 描画の記録を取れないブラウザや、タブが裏にある場合に備えて、3秒後にも試す。
 */
const FONT_LOADER = `(function(){var d=0;function f(){if(d)return;d=1;var l=document.createElement('link');l.rel='stylesheet';l.href='${fonts.css}';document.head.appendChild(l)}try{new PerformanceObserver(function(e,o){if(e.getEntriesByName('first-contentful-paint').length){o.disconnect();setTimeout(f,0)}}).observe({type:'paint',buffered:true})}catch(_){}setTimeout(f,3000)})()`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: '大阪・梅田中津のボードゲームプレイスペース｜BODOlab.（ボドラボ）',
    template: '%s',
  },
  description:
    '大阪市北区豊崎、中津駅から徒歩3分のボードゲームプレイスペース＆ショップ。1時間600円、ルールはスタッフが説明します。飲食物の販売はありません。',
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: { telephone: true, address: false, email: false },
  icons: { icon: '/icon.png', apple: '/apple-touch-icon.png' },
  ...(SITE_URL_CONFIGURED ? {} : { robots: { index: false, follow: false } }),
};

export const viewport: Viewport = {
  themeColor: '#faf5ec',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <script dangerouslySetInnerHTML={{ __html: FONT_LOADER }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only rounded-full focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100] focus:bg-cocoa focus:px-5 focus:py-3 focus:text-white"
        >
          本文へスキップ
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <Reveal />
        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema()} />
        <JsonLd data={localBusinessSchema()} />
      </body>
    </html>
  );
}

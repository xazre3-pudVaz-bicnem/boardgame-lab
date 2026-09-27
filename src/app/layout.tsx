import type { Metadata, Viewport } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import { JsonLd, localBusinessSchema, organizationSchema, websiteSchema, SITE_NAME } from '@/lib/seo';
import { SITE_URL, SITE_URL_CONFIGURED } from '@/data/shop';

/* 欧文見出し用。日本語はシステムフォントなのでWebフォントの読み込みはこれ1本だけ。 */
const outfit = Outfit({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  display: 'swap',
  variable: '--font-outfit',
});

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
  themeColor: '#f7f5f0',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={outfit.variable}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only rounded-full focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100] focus:bg-navy focus:px-5 focus:py-3 focus:text-white"
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

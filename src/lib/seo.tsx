import type { Metadata } from 'next';
import { shop, SITE_URL, SITE_URL_CONFIGURED, abs } from '@/data/shop';

export const SITE_NAME = 'BODOlab.（ボードゲームラボ）';
export const SITE_TITLE_SUFFIX = '｜大阪・梅田中津のボードゲームプレイスペース BODOlab.';

type MetaInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  /** 一覧のフィルター結果など、インデックスさせたくないページ */
  noindex?: boolean;
  ogImage?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
};

/**
 * 全ページ共通のメタデータ生成。
 * NEXT_PUBLIC_SITE_URL が未設定のプレビュー環境では canonical / OG URL を出さず、
 * 誤ってプレビューURLがインデックスされるのを防ぐ（robots も noindex になる）。
 */
export function buildMetadata({
  title,
  description,
  path,
  keywords,
  noindex,
  ogImage = '/og-image.jpg',
  type = 'website',
  publishedTime,
}: MetaInput): Metadata {
  const url = abs(path);
  const fullTitle = title.includes('BODOlab') ? title : `${title}${SITE_TITLE_SUFFIX}`;
  const blocked = noindex || !SITE_URL_CONFIGURED;

  return {
    title: fullTitle,
    description,
    ...(keywords?.length ? { keywords } : {}),
    ...(SITE_URL_CONFIGURED ? { alternates: { canonical: url } } : {}),
    robots: blocked
      ? { index: false, follow: true }
      : { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
    openGraph: {
      title: fullTitle,
      description,
      ...(SITE_URL_CONFIGURED ? { url } : {}),
      siteName: SITE_NAME,
      locale: 'ja_JP',
      type,
      ...(publishedTime ? { publishedTime } : {}),
      images: [{ url: abs(ogImage), width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: { card: 'summary_large_image', title: fullTitle, description, images: [abs(ogImage)] },
  };
}

/* ---------------------------------------------------------------- Schema.org */

/**
 * 実態は「ボードゲームのプレイスペース＋物販」。飲食提供はないので
 * Restaurant/CafeOrCoffeeShop ではなく EntertainmentBusiness + Store を使う。
 * 営業時間は verified な曜日だけを出す（定休日は確認中のため openingHours に含めない）。
 */
export function localBusinessSchema() {
  const wd = shop.hours.weekday.value;
  const we = shop.hours.weekend.value;
  return {
    '@context': 'https://schema.org',
    '@type': ['EntertainmentBusiness', 'Store'],
    '@id': `${SITE_URL}/#localbusiness`,
    name: `${shop.name}（${shop.nameJa}）`,
    alternateName: [shop.nameJa, shop.nickname, 'ボードゲームラボ'],
    description:
      '大阪市北区豊崎、大阪メトロ中津駅から徒歩3分のボードゲームプレイスペース＆ショップ。ボードゲームをスタッフのルール説明つきで遊べます。飲食物の販売はしていません。',
    url: SITE_URL,
    telephone: shop.tel.value,
    image: [abs('/og-image.jpg')],
    logo: abs('/logo-mark.png'),
    priceRange: '¥500–¥3,000',
    currenciesAccepted: 'JPY',
    address: {
      '@type': 'PostalAddress',
      postalCode: shop.address.postalCode,
      addressRegion: shop.address.region,
      addressLocality: shop.address.city,
      streetAddress: shop.address.street,
      addressCountry: 'JP',
    },
    areaServed: [
      { '@type': 'City', name: '大阪市' },
      { '@type': 'Place', name: '梅田' },
      { '@type': 'Place', name: '中津' },
    ],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: wd.open,
        closes: wd.close,
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday', 'Sunday'],
        opens: we.open,
        closes: we.close,
      },
    ],
    publicAccess: true,
    isAccessibleForFree: false,
    sameAs: [shop.links.instagram, shop.links.x, shop.links.bodoge].filter(Boolean),
    potentialAction: {
      '@type': 'ReserveAction',
      target: { '@type': 'EntryPoint', urlTemplate: shop.reservationUrl, actionPlatform: 'https://schema.org/DesktopWebPlatform' },
      result: { '@type': 'Reservation', name: 'ご来店予約' },
    },
  };
}

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: `${shop.name}（${shop.nameJa}）`,
    url: SITE_URL,
    logo: { '@type': 'ImageObject', url: abs('/logo-mark.png'), width: 512, height: 512 },
    telephone: shop.tel.value,
    address: {
      '@type': 'PostalAddress',
      postalCode: shop.address.postalCode,
      addressRegion: shop.address.region,
      addressLocality: shop.address.city,
      streetAddress: shop.address.street,
      addressCountry: 'JP',
    },
    sameAs: [shop.links.instagram, shop.links.x, shop.links.bodoge].filter(Boolean),
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: 'ja',
    publisher: { '@id': `${SITE_URL}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/games?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function breadcrumbSchema(items: { name: string; href?: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      ...(it.href ? { item: abs(it.href) } : {}),
    })),
  };
}

export function faqSchema(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: it.a },
    })),
  };
}

export function itemListSchema(items: { name: string; href: string }[], listName: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName,
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      url: abs(it.href),
    })),
  };
}

export function articleSchema(a: {
  title: string;
  description: string;
  path: string;
  published: string;
  modified?: string;
  image?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.title,
    description: a.description,
    mainEntityOfPage: { '@type': 'WebPage', '@id': abs(a.path) },
    datePublished: a.published,
    dateModified: a.modified ?? a.published,
    image: [abs(a.image ?? '/og-image.jpg')],
    author: { '@id': `${SITE_URL}/#organization` },
    publisher: { '@id': `${SITE_URL}/#organization` },
    inLanguage: 'ja',
  };
}

/** JSON-LD を安全に埋め込む。</script> の混入だけ潰す。 */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}

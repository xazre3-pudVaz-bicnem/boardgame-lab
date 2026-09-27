import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs, Container } from '@/components/ui';
import { AREAS } from '@/data/areas';
import { SCENES } from '@/data/scenes';
import { breadcrumbSchema, buildMetadata, JsonLd } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: '目的別のご案内｜雨の日・デート・グループ・1人で｜大阪・中津 BODOlab.',
  description: '雨の日、デート、友達やグループ、1人で、仕事帰り、はじめての方。目的ごとに、料金・予約・遊び方の案内をまとめました。',
  path: '/scene',
});

const crumbs = [{ name: 'ホーム', href: '/' }, { name: '目的別のご案内' }];

export default function SceneIndexPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <div className="bg-paper pt-24 pb-16 sm:pt-28 sm:pb-24">
        <Container size="narrow">
          <Breadcrumbs items={crumbs} />
          <h1 className="mt-6 text-[clamp(1.5rem,4.4vw,2.2rem)] font-bold text-ink">目的別のご案内</h1>
          <ul className="mt-8 divide-y divide-line border-y border-line">
            {SCENES.map((s) => (
              <li key={s.slug}>
                <Link href={`/scene/${s.slug}`} className="group block py-5">
                  <span className="text-[1.05rem] font-semibold text-ink group-hover:text-cyan-ink">{s.label}</span>
                  <span className="mt-1 block text-[0.88rem] leading-relaxed text-ink-soft">{s.card}</span>
                </Link>
              </li>
            ))}
          </ul>
          <h2 className="mt-12 text-[1rem] font-bold text-ink">駅からの行き方</h2>
          <ul className="mt-3 space-y-2 text-[0.9rem]">
            <li>
              <Link href="/access" className="prose-link">
                アクセス（中津駅から徒歩3分）
              </Link>
            </li>
            {AREAS.map((a) => (
              <li key={a.slug}>
                <Link href={`/area/${a.slug}`} className="prose-link">
                  {a.h1}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </div>
    </>
  );
}

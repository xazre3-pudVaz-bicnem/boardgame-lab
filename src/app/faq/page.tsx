import type { Metadata } from 'next';
import Link from 'next/link';
import { FaqList } from '@/components/home/HomeFaq';
import { Breadcrumbs, Button, Container, Eyebrow, PageHeader } from '@/components/ui';
import { ALL_FAQ, EXTRA_FAQ, HOME_FAQ } from '@/data/faq';
import { shop } from '@/data/shop';
import { breadcrumbSchema, buildMetadata, faqSchema, JsonLd } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'よくあるご質問｜大阪・梅田中津のボードゲーム BODOlab.',
  description:
    '料金・予約・営業時間・飲食・お子様のご利用・相席・貸切など、BODOlab.へのよくあるご質問をまとめました。初めての方が気になりやすいことから順に並べています。',
  path: '/faq',
  keywords: ['ボードゲームカフェ 初めて', '大阪 ボードゲーム 料金', 'ボードゲームカフェ 一人', 'BODOlab よくある質問'],
});

const crumbs = [{ name: 'ホーム', href: '/' }, { name: 'よくあるご質問' }];

export default function FaqPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <JsonLd data={faqSchema(ALL_FAQ)} />

      <PageHeader
        eyebrow="FAQ"
        title="よくあるご質問"
        breadcrumbs={crumbs}
        lead="はじめてのご来店で気になりやすいことから順にまとめました。ここにない質問は、お問い合わせフォームからお気軽にどうぞ。"
      />

      <section className="section-y bg-paper">
        <Container size="narrow">
          <Eyebrow>Basic</Eyebrow>
          <h2 className="display mt-3 mb-8 text-[clamp(1.3rem,3.4vw,1.9rem)] text-ink">はじめての方へ</h2>
          <FaqList items={HOME_FAQ} />

          <Eyebrow className="mt-16">Details</Eyebrow>
          <h2 className="display mt-3 mb-8 text-[clamp(1.3rem,3.4vw,1.9rem)] text-ink">ご利用についての詳細</h2>
          <FaqList items={EXTRA_FAQ} />

          <div className="mt-16 rounded-2xl border border-line bg-white p-7 sm:p-9">
            <h2 className="display text-[1.1rem] text-ink">解決しなかったときは</h2>
            <p className="text-pretty mt-3 text-[0.88rem] leading-[1.95] text-ink-soft">
              在庫確認・お取り置き、貸切のご相談、メディア関連のお問い合わせはフォームから承っています。
              お席のご予約は{' '}
              <a href={shop.reservationUrl} target="_blank" rel="noopener noreferrer" className="prose-link">
                ご来店予約フォーム
              </a>{' '}
              からお願いします。
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="/contact" variant="solid">
                お問い合わせ
              </Button>
              <Button href="/system" variant="outline">
                料金・ご利用案内
              </Button>
            </div>
          </div>

          <p className="mt-10 text-[0.82rem]">
            <Link href="/scene/first-time" className="prose-link">
              ボードゲームが初めての方へ：来てから帰るまでの流れ
            </Link>
          </p>

          <div className="mt-12">
            <Breadcrumbs items={crumbs} />
          </div>
        </Container>
      </section>
    </>
  );
}

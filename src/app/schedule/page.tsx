import type { Metadata } from 'next';
import Link from 'next/link';
import Photo from '@/components/Photo';
import { Breadcrumbs, Button, Container, ConfirmNote, Eyebrow, PageHeader } from '@/components/ui';
import { newsByDate } from '@/data/news';
import { shop } from '@/data/shop';
import { breadcrumbSchema, buildMetadata, JsonLd } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'イベント情報｜テストプレイ会は毎月最終火曜｜大阪・梅田中津 BODOlab.',
  description:
    'BODOlab.のイベント情報です。ボードゲーム製作者を応援するテストプレイ会を毎月最終火曜日に開催しています（参加費500円・TwiPlaで受付）。貸切でのご利用もご相談いただけます。',
  path: '/schedule',
  keywords: ['大阪 ボードゲーム イベント', 'テストプレイ会 大阪', '大阪 ボードゲーム会', '梅田 ボードゲーム イベント'],
});

const crumbs = [{ name: 'ホーム', href: '/' }, { name: 'イベント情報' }];
const ev = shop.testPlayEvent.value;

export default function SchedulePage() {
  const pastEvents = newsByDate().filter((n) => n.category === 'イベント');

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />

      <PageHeader
        eyebrow="Event"
        title="イベント情報"
        breadcrumbs={crumbs}
        lead="定期開催しているイベントと、貸切でのご利用についてのご案内です。開催予定は変わることがあるため、直近の告知はTwiPlaと公式Instagramでご確認ください。"
      />

      {/* ------------------------------------------------ 定期イベント */}
      <section className="section-y bg-paper">
        <Container>
          <Eyebrow>Monthly</Eyebrow>
          <h2 className="display mt-3 text-[clamp(1.4rem,3.6vw,2.1rem)] text-ink">毎月のイベント</h2>

          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-16">
            <div className="rounded-2xl border border-line bg-white p-7 sm:p-9">
              <p className="eyebrow text-cyan-ink">{ev.schedule}</p>
              <h3 className="display mt-3 text-[1.5rem] text-ink">{ev.name}</h3>
              <p className="text-pretty mt-5 text-[0.9rem] leading-[1.95] text-ink-soft">
                ボードゲーム製作者の方を応援する、テストプレイ会兼交流会です。
                お互いの作品をブラッシュアップしましょう。
              </p>
              <p className="text-pretty mt-3 text-[0.9rem] leading-[1.95] text-ink-soft">
                いまオリジナルのボードゲームを作っている方、他の方が作ったゲームを遊んでみたい方、どちらの参加も歓迎です。
              </p>
              <dl className="mt-7">
                <div className="spec-row">
                  <dt className="text-ink-soft">開催日</dt>
                  <dd className="font-semibold text-ink">{ev.schedule}</dd>
                </div>
                <div className="spec-row">
                  <dt className="text-ink-soft">参加費</dt>
                  <dd className="font-semibold text-ink">{ev.fee}円</dd>
                </div>
                <div className="spec-row">
                  <dt className="text-ink-soft">お申し込み</dt>
                  <dd className="font-semibold text-ink">{ev.entry}</dd>
                </div>
              </dl>
              <div className="mt-7">
                <Button href={shop.links.twipla} variant="solid" external>
                  TwiPlaで参加を申し込む
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <Photo name="players-longtable" fill sizes="(max-width:1024px) 92vw, 42vw" className="object-cover" />
              </div>
              <ConfirmNote>
                開催日・参加費は変更になる場合があります。最新の開催予定はTwiPlaまたは
                <a href={shop.links.instagram} target="_blank" rel="noopener noreferrer" className="underline">
                  公式Instagram
                </a>
                をご確認ください。当サイトには、確認が取れた予定のみを掲載しています。
              </ConfirmNote>
            </div>
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------ 貸切 */}
      <section className="cv-auto section-y bg-surface">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <Eyebrow>Private</Eyebrow>
              <h2 className="display mt-3 text-[clamp(1.4rem,3.6vw,2.1rem)] text-ink">貸切でのご利用</h2>
              <p className="text-pretty mt-6 text-[0.92rem] leading-[1.95] text-ink-soft">
                {shop.pricing.privateHire.value}
              </p>
              <p className="text-pretty mt-4 text-[0.92rem] leading-[1.95] text-ink-soft">
                歓迎会や部活動の集まり、誕生日会など、団体でのご利用にも対応しています。
                ご希望の日時・人数を添えて、お問い合わせフォームからご相談ください。
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href="/contact" variant="solid">
                  貸切について相談する
                </Button>
                <Button href="/scene/with-friends" variant="outline">
                  大人数で遊ぶときのガイド
                </Button>
              </div>
            </div>

            <div>
              <Eyebrow>Past</Eyebrow>
              <h2 className="display mt-3 text-[clamp(1.4rem,3.6vw,2.1rem)] text-ink">過去に開催したイベント</h2>
              <p className="mt-4 text-[0.82rem] leading-relaxed text-ink-faint">
                以下は過去に実施した内容です。現在ご利用いただけるかは店舗へお問い合わせください。
              </p>
              <ul className="mt-6 divide-y divide-line border-y border-line">
                {pastEvents.map((n) => (
                  <li key={n.slug}>
                    <Link
                      href={`/news/${encodeURIComponent(n.slug)}`}
                      className="group flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:gap-5"
                    >
                      <time dateTime={n.date} className="display shrink-0 text-[0.75rem] text-ink-faint">
                        {n.date.replace(/-/g, '.')}
                      </time>
                      <span className="text-[0.88rem] leading-snug text-ink transition-colors group-hover:text-cyan-ink">
                        {n.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-[0.82rem]">
                <Link href="/news" className="prose-link">
                  お知らせ一覧を見る
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-16">
            <Breadcrumbs items={crumbs} />
          </div>
        </Container>
      </section>
    </>
  );
}

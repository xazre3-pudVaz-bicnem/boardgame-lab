import type { Metadata } from 'next';
import Link from 'next/link';
import Photo from '@/components/Photo';
import { Breadcrumbs, Button, Container } from '@/components/ui';
import { newsByDate } from '@/data/news';
import { shop } from '@/data/shop';
import { breadcrumbSchema, buildMetadata, JsonLd } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'イベント｜ボドラボテスプ塾（テストプレイ会）・貸切｜大阪・中津 BODOlab.',
  description:
    'BODOlab.のイベント情報。自作ボードゲームのテストプレイ会兼交流会「ボドラボテスプ塾」を毎月開いています（参加費500円・TwiPlaで申し込み）。貸切のご相談も承ります。',
  path: '/schedule',
});

const crumbs = [{ name: 'ホーム', href: '/' }, { name: 'イベント' }];
const ev = shop.testPlayEvent.value;

export default function SchedulePage() {
  const pastEvents = newsByDate().filter((n) => n.category === 'イベント');

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />

      <div className="bg-paper-2 pt-24 pb-16 sm:pt-28 sm:pb-24">
        <Container>
          <Breadcrumbs items={crumbs} />
          <h1 className="mt-6 text-[clamp(1.5rem,4.4vw,2.2rem)] font-bold text-ink">イベント</h1>

          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14">
            <section>
              <h2 className="text-[1.35rem] font-bold text-ink">{ev.name}</h2>
              <p className="mt-4 text-[0.98rem] leading-[2] text-ink-soft">
                ボードゲーム製作者を応援する、テストプレイ会兼交流会です。自作のゲームを持ち込む人、これから作りたい人、
                まだ世に出ていないゲームを遊んでみたい人など、経験を問わず参加できます。
              </p>

              <dl className="mt-6 rounded-md border border-line bg-surface text-[0.92rem]">
                {[
                  ['開催', ev.schedule],
                  ['時間', ev.hours],
                  ['参加費', `${ev.fee}円（${ev.feeNote}）`],
                  ['申し込み', `${ev.entry}（各回の告知ページから）`],
                ].map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[5.5rem_1fr] gap-3 border-b border-line px-5 py-3 last:border-0">
                    <dt className="text-ink-faint">{k}</dt>
                    <dd className="text-ink">{v}</dd>
                  </div>
                ))}
              </dl>

              <h3 className="mt-8 text-[1rem] font-bold text-ink">参加する前に</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-[0.92rem] leading-[1.9] text-ink-soft">
                {ev.notes.slice(1).map((n) => (
                  <li key={n}>{n}</li>
                ))}
                <li>自作ゲームを持ち込む場合は、どんなゲームか（必要人数・プレイ時間）を告知ページのコメントで知らせてください。</li>
              </ul>
              <p className="mt-5 text-[0.82rem] leading-relaxed text-ink-faint">
                {ev.scheduleNote}。開催日は変わることがあるので、必ずTwiPlaの告知をご確認ください。
              </p>
              <div className="mt-6">
                <Button href={shop.links.twipla} variant="solid" external>
                  TwiPlaで開催予定を見る
                </Button>
              </div>
            </section>

            <figure>
              <div className="relative aspect-[4/3] overflow-hidden rounded-md">
                <Photo name="game-strategy" fill sizes="(max-width:1024px) 92vw, 44vw" className="object-cover" />
              </div>
              <figcaption className="mt-2 text-[0.78rem] text-ink-faint">店内のテーブルで遊んでいる様子。</figcaption>
            </figure>
          </div>
        </Container>
      </div>

      <div className="bg-surface py-14 sm:py-20">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <section>
              <h2 className="text-[1.15rem] font-bold text-ink">貸切</h2>
              <p className="mt-3 text-[0.95rem] leading-[1.95] text-ink-soft">{shop.pricing.privateHire.value}</p>
              <p className="mt-2 text-[0.95rem] leading-[1.95] text-ink-soft">ご希望の日時と人数を添えて、お問い合わせフォームからご相談ください。</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button href="/contact" variant="outline">
                  貸切について相談する
                </Button>
                <Button href="/scene/group" variant="ghost">
                  友達・グループで来る場合
                </Button>
              </div>
            </section>

            <section>
              <h2 className="text-[1.15rem] font-bold text-ink">過去のイベント告知</h2>
              <p className="mt-2 text-[0.82rem] text-ink-faint">過去に実施したものです。現在も行っているかは店舗へお問い合わせください。</p>
              <ul className="mt-4 divide-y divide-line border-y border-line">
                {pastEvents.map((n) => (
                  <li key={n.slug}>
                    <Link href={`/news/${encodeURIComponent(n.slug)}`} className="flex gap-4 py-3 text-[0.9rem] hover:text-cyan-ink">
                      <time dateTime={n.date} className="shrink-0 text-ink-faint tabular-nums">
                        {n.date.replace(/-/g, '.')}
                      </time>
                      {n.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
          <div className="mt-14">
            <Breadcrumbs items={crumbs} />
          </div>
        </Container>
      </div>
    </>
  );
}

import Link from 'next/link';
import { newsByDate } from '@/data/news';
import { shop } from '@/data/shop';
import { Button, Container, SectionHeading } from '@/components/ui';

const formatDate = (d: string) => {
  const [y, m, day] = d.split('-');
  return `${y}.${m}.${day}`;
};

/**
 * お知らせとイベント。
 * 掲載しているのは旧サイトから引き継いだ過去の告知だけなので、
 * 「過去のお知らせ」と明示し、現在開催中であるかのようには見せない。
 */
export function NewsPreview() {
  const items = newsByDate().slice(0, 4);

  return (
    <section id="news" className="cv-auto section-y bg-paper">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] lg:gap-20">
          <div data-reveal>
            <SectionHeading
              eyebrow="News & Event"
              title="お知らせとイベント"
              lead={
                <>
                  当店では{shop.testPlayEvent.value.name}を{shop.testPlayEvent.value.schedule}
                  に開催しています（参加費{shop.testPlayEvent.value.fee}円）。
                  開催予定は変わることがありますので、最新の告知はTwiPlaと公式Instagramをご覧ください。
                </>
              }
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/schedule" variant="outline">
                イベント情報
              </Button>
              <Button href={shop.links.twipla} variant="ghost" external>
                TwiPlaで開催予定を見る
              </Button>
            </div>
          </div>

          <div data-reveal>
            <p className="eyebrow mb-4 text-ink-faint">過去のお知らせ</p>
            <ul className="divide-y divide-line border-y border-line">
              {items.map((n) => (
                <li key={n.slug}>
                  <Link
                    href={`/news/${encodeURIComponent(n.slug)}`}
                    className="group flex flex-col gap-1 py-4 transition-colors sm:flex-row sm:items-baseline sm:gap-5"
                  >
                    <time dateTime={n.date} className="display shrink-0 text-[0.75rem] text-ink-faint">
                      {formatDate(n.date)}
                    </time>
                    <span className="rounded-full bg-paper-2 px-2 py-0.5 text-[0.68rem] text-ink-soft sm:shrink-0">
                      {n.category}
                    </span>
                    <span className="line-clamp-2 text-[0.88rem] leading-snug text-ink transition-colors group-hover:text-cyan-ink">
                      {n.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/news"
              className="mt-5 inline-block text-[0.82rem] text-navy underline underline-offset-4 transition-colors hover:text-cyan-ink"
            >
              お知らせ一覧 →
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}

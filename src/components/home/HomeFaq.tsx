import Link from 'next/link';
import type { Faq } from '@/data/faq';
import { Container, SectionHeading } from '@/components/ui';

/** よくある質問。details/summary で開閉するのでJSを使わない。 */
export function HomeFaq({ items }: { items: Faq[] }) {
  return (
    <section id="faq" className="cv-auto section-y bg-surface">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)] lg:gap-20">
          <div data-reveal>
            <SectionHeading
              eyebrow="FAQ"
              title="よくあるご質問"
              lead="来る前に気になりやすいことをまとめました。ここにないことは、お問い合わせフォームからどうぞ。"
            />
            <Link
              href="/faq"
              className="mt-6 inline-block text-[0.82rem] text-cocoa underline underline-offset-4 transition-colors hover:text-caramel-ink"
            >
              すべての質問を見る →
            </Link>
          </div>

          <ul className="divide-y divide-line border-y border-line" data-reveal>
            {items.map((f) => (
              <li key={f.q}>
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-start gap-4 py-5 text-[0.92rem] leading-relaxed font-medium text-ink transition-colors hover:text-caramel-ink">
                    <span aria-hidden="true" className="display mt-0.5 shrink-0 text-[0.8rem] text-caramel-ink">
                      Q
                    </span>
                    <span className="flex-1">{f.q}</span>
                    <span
                      aria-hidden="true"
                      className="mt-1 shrink-0 text-ink-faint transition-transform duration-300 group-open:rotate-45"
                    >
                      ＋
                    </span>
                  </summary>
                  <p className="text-pretty pb-5 pl-8 text-[0.85rem] leading-[1.95] text-ink-soft">{f.a}</p>
                </details>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}

/** 下層ページ用。見出しを差し替えられるようにした同じ見た目のリスト。 */
export function FaqList({ items, className = '' }: { items: Faq[]; className?: string }) {
  return (
    <ul className={`divide-y divide-line border-y border-line ${className}`}>
      {items.map((f) => (
        <li key={f.q}>
          <details className="group">
            <summary className="flex cursor-pointer list-none items-start gap-4 py-5 text-[0.92rem] leading-relaxed font-medium text-ink transition-colors hover:text-caramel-ink">
              <span aria-hidden="true" className="display mt-0.5 shrink-0 text-[0.8rem] text-caramel-ink">
                Q
              </span>
              <span className="flex-1">{f.q}</span>
              <span
                aria-hidden="true"
                className="mt-1 shrink-0 text-ink-faint transition-transform duration-300 group-open:rotate-45"
              >
                ＋
              </span>
            </summary>
            <p className="text-pretty pb-5 pl-8 text-[0.85rem] leading-[1.95] text-ink-soft">{f.a}</p>
          </details>
        </li>
      ))}
    </ul>
  );
}

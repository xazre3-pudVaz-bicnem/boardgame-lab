import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import DarkHeader from '@/components/DarkHeader';
import Photo from '@/components/Photo';
import { GameGrid } from '@/components/GameCard';
import { FaqList } from '@/components/home/HomeFaq';
import { Breadcrumbs, Button, Container, Eyebrow } from '@/components/ui';
import { getScene, SCENES } from '@/data/scenes';
import { shop } from '@/data/shop';
import { GAMES } from '@/lib/games';
import { breadcrumbSchema, buildMetadata, faqSchema, JsonLd } from '@/lib/seo';

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return SCENES.map((s) => ({ slug: s.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const scene = getScene(slug);
  if (!scene) return { title: 'ページが見つかりません', robots: { index: false, follow: false } };

  return buildMetadata({
    title: scene.title,
    description: scene.description,
    path: `/scene/${scene.slug}`,
    keywords: scene.keywords,
  });
}

/** 1つの棚に出す件数。多すぎるとページが重くなるので抑えている。 */
const PICK_LIMIT = 10;

export default async function ScenePage({ params }: Params) {
  const { slug } = await params;
  const scene = getScene(slug);
  if (!scene) notFound();

  const crumbs = [{ name: 'ホーム', href: '/' }, { name: '目的から探す', href: '/scene' }, { name: scene.label }];
  const others = SCENES.filter((s) => s.slug !== scene.slug);

  const picks = scene.picks.map((p) => ({
    ...p,
    games: GAMES.filter(p.filter)
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, PICK_LIMIT),
  }));

  return (
    <>
      <DarkHeader />
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <JsonLd data={faqSchema(scene.faq)} />

      {/* ------------------------------------------------ ヘッダー */}
      <header className="relative border-b border-line bg-navy-deep pt-28 pb-14 text-white sm:pt-32 sm:pb-20">
        <div className="absolute inset-0">
          <Photo name={scene.photo} fill sizes="100vw" priority className="object-cover opacity-32" />
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/75 to-navy-deep/55"
        />
        <Container className="relative">
          <Breadcrumbs items={crumbs} tone="light-text" />
          <div className="mt-7 max-w-3xl">
            <p className="eyebrow text-cyan">{scene.en}</p>
            <h1 className="display text-balance mt-3 text-[clamp(1.75rem,5vw,3rem)] leading-[1.3] text-white">
              {scene.h1}
            </h1>
            <p className="text-pretty mt-6 text-[0.975rem] leading-[2] text-white/78">{scene.lead}</p>
          </div>
        </Container>
      </header>

      {/* ------------------------------------------------ 本文 */}
      <section className="section-y bg-paper">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,19rem)] lg:gap-16">
            <div>
              {scene.sections.map((s) => (
                <div key={s.h2} className="mb-12 last:mb-0">
                  <h2 className="display text-[clamp(1.2rem,3.2vw,1.65rem)] text-ink">{s.h2}</h2>
                  {s.body.map((p) => (
                    <p key={p} className="text-pretty mt-4 text-[0.95rem] leading-[2.05] text-ink-soft">
                      {p}
                    </p>
                  ))}
                </div>
              ))}
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-2xl border border-navy/15 bg-surface p-6">
                <Eyebrow>Summary</Eyebrow>
                <h2 className="display mt-2 text-[1rem] text-ink">かんたんな店舗情報</h2>
                <dl className="mt-4">
                  <div className="spec-row">
                    <dt className="text-ink-soft">最寄り</dt>
                    <dd className="text-right text-[0.85rem] text-ink">中津駅 徒歩3分</dd>
                  </div>
                  <div className="spec-row">
                    <dt className="text-ink-soft">料金</dt>
                    <dd className="text-right text-[0.85rem] text-ink">
                      1時間 {shop.pricing.unit.value.normal}円
                    </dd>
                  </div>
                  <div className="spec-row">
                    <dt className="text-ink-soft">上限</dt>
                    <dd className="text-right text-[0.85rem] text-ink">
                      平日 {shop.pricing.caps.value.weekday.normal.toLocaleString()}円
                      <br />
                      土日祝 {shop.pricing.caps.value.weekend.normal.toLocaleString()}円
                    </dd>
                  </div>
                  <div className="spec-row">
                    <dt className="text-ink-soft">営業</dt>
                    <dd className="text-right text-[0.85rem] text-ink">
                      平日 {shop.hours.weekday.value.open}–{shop.hours.weekday.value.close}
                      <br />
                      土日祝 {shop.hours.weekend.value.open}–{shop.hours.weekend.value.close}
                    </dd>
                  </div>
                </dl>
                <div className="mt-6 flex flex-col gap-2.5">
                  <Button href={shop.reservationUrl} variant="solid" external>
                    ご来店予約
                  </Button>
                  <Button href="/access" variant="outline">
                    アクセスを見る
                  </Button>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------ おすすめの棚 */}
      <section className="cv-auto section-y bg-surface">
        <Container>
          <Eyebrow>Pick up</Eyebrow>
          <h2 className="display mt-3 text-[clamp(1.4rem,3.6vw,2.1rem)] text-ink">この日に向いているゲーム</h2>

          <div className="mt-12 space-y-16">
            {picks.map((p) => (
              <div key={p.heading}>
                <h3 className="display text-[1.1rem] text-ink">{p.heading}</h3>
                <p className="mt-2 max-w-2xl text-[0.83rem] leading-[1.9] text-ink-soft">{p.note}</p>
                <div className="mt-6">
                  <GameGrid games={p.games} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14 flex flex-wrap gap-3">
            <Button href="/games" variant="solid">
              全タイトルから探す
            </Button>
            <Button href="/system" variant="outline">
              料金・ご利用案内
            </Button>
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------ FAQ */}
      <section className="cv-auto section-y bg-paper">
        <Container size="narrow">
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="display mt-3 mb-8 text-[clamp(1.3rem,3.4vw,1.9rem)] text-ink">このページについてのご質問</h2>
          <FaqList items={scene.faq} />

          <nav aria-label="ほかの目的から探す" className="mt-16">
            <h2 className="display text-[1.05rem] text-ink">ほかの目的から探す</h2>
            <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {others.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/scene/${s.slug}`}
                    className="block rounded-lg border border-line bg-white px-4 py-3 text-[0.85rem] text-ink-soft transition-colors hover:border-navy/30 hover:text-ink"
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-12">
            <Breadcrumbs items={crumbs} />
          </div>
        </Container>
      </section>
    </>
  );
}

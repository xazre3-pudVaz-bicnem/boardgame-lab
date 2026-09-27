import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Photo from '@/components/Photo';
import { GameCard, GameTable } from '@/components/GameCard';
import { FaqList } from '@/components/home/HomeFaq';
import { Breadcrumbs, Button, Container } from '@/components/ui';
import { getScene, SCENES } from '@/data/scenes';
import { shop } from '@/data/shop';
import { type Game, gamesWithCondition, CONDITIONS, staffForBeginners, staffForCouples, staffForGroups, staffForTwo } from '@/lib/games';
import { breadcrumbSchema, buildMetadata, faqSchema, JsonLd } from '@/lib/seo';

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return SCENES.map((s) => ({ slug: s.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const s = getScene(slug);
  if (!s) return { title: 'ページが見つかりません', robots: { index: false, follow: false } };
  return buildMetadata({ title: s.title, description: s.description, path: `/scene/${s.slug}` });
}

const STAFF: Record<string, () => Game[]> = {
  couples: staffForCouples,
  beginners: staffForBeginners,
  groups: staffForGroups,
  two: staffForTwo,
};
const COMMENT: Record<string, keyof Game['staff']['comments']> = { couples: 'couples', beginners: 'beginners', groups: 'groups', two: 'two' };

export default async function ScenePage({ params }: Params) {
  const { slug } = await params;
  const s = getScene(slug);
  if (!s) notFound();

  const crumbs = [{ name: 'ホーム', href: '/' }, { name: '目的別のご案内', href: '/scene' }, { name: s.label }];
  const staff = s.staffList ? STAFF[s.staffList.kind]() : [];
  const objective = s.objective ? gamesWithCondition(s.objective.key).slice(0, s.objective.limit ?? 12) : [];
  const objectiveTotal = s.objective ? gamesWithCondition(s.objective.key).length : 0;
  const condition = s.objective ? CONDITIONS.find((c) => c.key === s.objective!.key) : null;

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <JsonLd data={faqSchema(s.faq)} />

      <div className="bg-paper pt-24 pb-16 sm:pt-28 sm:pb-24">
        <Container size="narrow">
          <Breadcrumbs items={crumbs} />
          <h1 className="mt-6 text-[clamp(1.5rem,4.4vw,2.2rem)] leading-[1.35] font-bold text-ink">{s.h1}</h1>
          <p className="mt-4 text-[0.98rem] leading-[2] text-ink-soft">{s.lead}</p>

          {s.photo ? (
            <figure className="mt-8">
              <div className="relative aspect-[3/2] overflow-hidden rounded-md">
                <Photo name={s.photo} fill priority sizes="(max-width:768px) 92vw, 46rem" className="object-cover" />
              </div>
              {s.photoCaption ? <figcaption className="mt-2 text-[0.78rem] text-ink-faint">{s.photoCaption}</figcaption> : null}
            </figure>
          ) : null}

          {s.sections.map((sec) => (
            <section key={sec.h2} className="mt-10">
              <h2 className="text-[1.15rem] font-bold text-ink">{sec.h2}</h2>
              {sec.body.map((p) => (
                <p key={p} className="mt-3 text-[0.95rem] leading-[2] text-ink-soft">
                  {p}
                </p>
              ))}
            </section>
          ))}

          <div className="mt-8 flex flex-wrap gap-3">
            <Button href={shop.reservationUrl} variant="solid" external>
              ご来店予約
            </Button>
            <Button href="/system" variant="outline">
              料金・ご利用案内
            </Button>
          </div>
        </Container>

        {s.staffList && staff.length ? (
          <Container className="mt-14">
            <h2 className="text-[1.15rem] font-bold text-ink">{s.staffList.heading}</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {staff.map((g) => (
                <li key={g.slug}>
                  <GameCard game={g} comment={g.staff.comments[COMMENT[s.staffList!.kind]]} />
                </li>
              ))}
            </ul>
          </Container>
        ) : null}

        {s.objective && objective.length ? (
          <Container className="mt-14">
            <h2 className="text-[1.15rem] font-bold text-ink">{s.objective.heading}</h2>
            <p className="mt-2 max-w-2xl text-[0.85rem] leading-relaxed text-ink-soft">{s.objective.note}</p>
            <div className="mt-4">
              <GameTable games={objective} />
            </div>
            {condition && objectiveTotal > objective.length ? (
              <p className="mt-3 text-[0.88rem]">
                <Link href={`/games/${condition.slug}`} className="prose-link">
                  {condition.heading}をすべて見る（{objectiveTotal}件）
                </Link>
              </p>
            ) : null}
          </Container>
        ) : null}

        <Container size="narrow" className="mt-14">
          <h2 className="mb-4 text-[1.15rem] font-bold text-ink">よくあるご質問</h2>
          <FaqList items={s.faq} />

          <nav aria-label="ほかの目的" className="mt-12 flex flex-wrap gap-x-5 gap-y-2 text-[0.9rem]">
            {SCENES.filter((o) => o.slug !== s.slug).map((o) => (
              <Link key={o.slug} href={`/scene/${o.slug}`} className="prose-link">
                {o.label}
              </Link>
            ))}
          </nav>
          <div className="mt-10">
            <Breadcrumbs items={crumbs} />
          </div>
        </Container>
      </div>
    </>
  );
}


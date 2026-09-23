import type { Metadata } from 'next';
import Link from 'next/link';
import Photo from '@/components/Photo';
import { Breadcrumbs, Button, Container, Eyebrow, PageHeader } from '@/components/ui';
import { AREAS } from '@/data/areas';
import { SCENES } from '@/data/scenes';
import { shop } from '@/data/shop';
import { breadcrumbSchema, buildMetadata, itemListSchema, JsonLd } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: '目的から探す｜雨の日・デート・友達と・1人で｜大阪 梅田中津 BODOlab.',
  description:
    '雨の日の行き先、梅田での室内デート、友達と集まる日、ひとりで過ごす夜。ボードゲームを遊びたいという理由以外でも使っていただける場所です。目的別のガイドをまとめました。',
  path: '/scene',
  keywords: ['大阪 遊び場 大人', '梅田 室内 遊び', '大阪 雨の日 遊び', '大阪 友達と遊ぶ場所'],
});

const crumbs = [{ name: 'ホーム', href: '/' }, { name: '目的から探す' }];

export default function SceneIndexPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <JsonLd
        data={itemListSchema(
          SCENES.map((s) => ({ name: s.label, href: `/scene/${s.slug}` })),
          '目的から探す',
        )}
      />

      <PageHeader
        eyebrow="Scene"
        title="目的から探す"
        breadcrumbs={crumbs}
        lead="「ボードゲームがしたい」以外の理由で来ていただいて大丈夫です。雨で予定が流れた日、デートの行き先に困った日、ひとりで時間をつぶしたい夜。状況ごとの使い方をまとめました。"
      />

      <section className="section-y bg-paper">
        <Container>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SCENES.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/scene/${s.slug}`}
                  className="group relative block h-full overflow-hidden rounded-2xl bg-navy-deep text-white"
                >
                  <div className="absolute inset-0">
                    <Photo
                      name={s.photo}
                      fill
                      sizes="(max-width:640px) 92vw, (max-width:1024px) 46vw, 31vw"
                      className="object-cover opacity-55 transition-all duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-105 group-hover:opacity-45"
                    />
                  </div>
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/60 to-transparent"
                  />
                  <div className="relative flex min-h-[16rem] flex-col justify-end p-6">
                    <span className="display text-[0.58rem] tracking-[0.24em] text-cyan uppercase">{s.en}</span>
                    <h2 className="display mt-2 text-[1.1rem] leading-snug font-semibold">{s.label}</h2>
                    <p className="text-pretty mt-2 text-[0.8rem] leading-[1.85] text-white/72">{s.card}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="cv-auto section-y bg-surface">
        <Container>
          <Eyebrow>Area</Eyebrow>
          <h2 className="display mt-3 text-[clamp(1.4rem,3.6vw,2.1rem)] text-ink">エリアから探す</h2>
          <p className="mt-4 max-w-2xl text-[0.9rem] leading-[1.95] text-ink-soft">
            当店は{shop.address.city}豊崎、大阪メトロ中津駅から徒歩3分の1か所です。
            梅田からは徒歩10分ほどで歩いてお越しいただけます。
          </p>
          <ul className="mt-9 grid gap-5 sm:grid-cols-2">
            {AREAS.map((a) => (
              <li key={a.slug}>
                <Link
                  href={`/area/${a.slug}`}
                  className="group block h-full rounded-xl border border-line bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-navy/25"
                >
                  <span className="display text-[0.58rem] tracking-[0.22em] text-cyan-ink uppercase">{a.en}</span>
                  <h3 className="display mt-2 text-[1.05rem] text-ink transition-colors group-hover:text-cyan-ink">
                    {a.h1}
                  </h3>
                  <p className="text-pretty mt-2.5 line-clamp-3 text-[0.83rem] leading-[1.9] text-ink-soft">{a.lead}</p>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-12 flex flex-wrap gap-3">
            <Button href="/games" variant="solid">
              ボードゲームを探す
            </Button>
            <Button href="/system" variant="outline">
              料金・ご利用案内
            </Button>
          </div>

          <div className="mt-14">
            <Breadcrumbs items={crumbs} />
          </div>
        </Container>
      </section>
    </>
  );
}

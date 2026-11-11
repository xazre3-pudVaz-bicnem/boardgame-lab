import type { Metadata } from 'next';
import Link from 'next/link';
import Photo from '@/components/Photo';
import { Breadcrumbs, Container } from '@/components/ui';
import { shop } from '@/data/shop';
import { breadcrumbSchema, buildMetadata, JsonLd } from '@/lib/seo';

/**
 * ボードゲームの販売（2026-11 に新設）。
 *
 * 店舗の希望（2026-11-11）：「ボードゲームの販売も行っているので、スペース利用を7割、販売を3割ほどで紹介してほしい」
 * 「主にはプレイできるものを置いていて、遊んだ後にそのまま購入することができるようにしている」。
 *
 * 書いてよいのは、店舗から聞いた・旧公式サイトのQ&Aにあった事実だけ（shop.ts の shopConcept・shopService・shopDiscount）。
 * 値段・在庫・取り扱いタイトルは書かない（写真の値札はそのまま見える）。
 */

export const metadata: Metadata = buildMetadata({
  title: 'ボードゲームの販売｜遊んでから買える｜大阪・中津 BODOlab.（ボードゲームラボ）',
  description:
    '大阪・中津のBODOlab.では、ボードゲームの販売もしています。販売しているのは主に店内で遊べるゲームなので、遊んで気に入ったらそのまま購入できます。3点で10%引き、4点以上で15%引き。取り置き・お取り寄せも承ります。',
  path: '/shop',
  keywords: ['大阪 ボードゲーム 販売', '中津 ボードゲームショップ', '梅田 ボードゲーム 購入', 'ボードゲーム 遊んでから買える'],
});

const crumbs = [{ name: 'ホーム', href: '/' }, { name: 'ボードゲームの販売' }];

export default function ShopPage() {
  const discounts = shop.pricing.shopDiscount.value;

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />

      <div className="bg-paper pt-24 pb-16 sm:pt-28 sm:pb-24">
        <Container size="wide">
          <Breadcrumbs items={crumbs} />
          <div className="mt-6 max-w-3xl">
            <h1 className="text-[clamp(1.7rem,4.6vw,2.6rem)] leading-[1.4] font-bold text-ink">ボードゲームの販売</h1>
            <p className="mt-5 text-[1rem] leading-[2] text-ink-soft [word-break:auto-phrase]">
              BODOlab.は、ボードゲームのプレイスペースであり、ショップでもあります。{shop.shopConcept.value}
            </p>
          </div>

          {/* 写真は大きさと切り抜きを変えて並べる（同じ比率のカードを並べない） */}
          <div className="mt-10 grid gap-4 lg:grid-cols-12">
            <figure className="lg:col-span-7">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                <Photo name="shop-case" fill priority sizes="(max-width:1024px) 92vw, 56vw" className="object-cover" />
              </div>
            </figure>
            <div className="grid grid-cols-2 gap-4 lg:col-span-5 lg:grid-cols-1">
              <figure>
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg lg:aspect-[16/10]">
                  <Photo name="shop-shelf-large" fill sizes="(max-width:1024px) 45vw, 38vw" className="object-cover" />
                </div>
              </figure>
              <figure>
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg lg:aspect-[16/10]">
                  <Photo name="shop-shelf-b" fill sizes="(max-width:1024px) 45vw, 38vw" className="object-cover" />
                </div>
              </figure>
            </div>
          </div>
          <p className="mt-2 text-[0.78rem] text-ink-faint">店内で販売しているボードゲーム。</p>
        </Container>
      </div>

      {/* ------------------------------------------------ 買い方 */}
      <section className="bg-surface py-16 sm:py-20">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-16">
            <div>
              <h2 className="text-[clamp(1.45rem,3.4vw,1.85rem)] font-bold text-ink">遊んでから選べます</h2>
              <div className="mt-6 space-y-5 text-[1rem] leading-[2] text-ink-soft [word-break:auto-phrase]">
                <p>
                  販売しているのは、主に店内で遊べるゲームです。気になるゲームをプレイスペースで遊んでみて、気に入ったら、そのまま買って帰れます。
                </p>
                <p>
                  店頭でお買い求めいただけるほか、公式LINEからもご購入いただけます。お目当てのゲームを扱っているかは、店頭または公式LINEでお問い合わせください。
                </p>
              </div>
              <p className="mt-7 flex flex-wrap gap-3">
                {shop.links.line ? (
                  <a
                    href={shop.links.line}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-12 items-center rounded-full bg-cocoa px-7 text-[0.9rem] font-semibold text-white transition-colors hover:bg-cocoa-deep"
                  >
                    公式LINEで問い合わせる
                  </a>
                ) : null}
                <Link
                  href="/access"
                  className="inline-flex min-h-12 items-center rounded-full border border-cocoa/30 px-7 text-[0.9rem] font-semibold text-cocoa transition-colors hover:border-cocoa"
                >
                  お店への行き方
                </Link>
              </p>
            </div>

            <dl className="self-start border-t border-line text-[0.97rem]">
              {[
                ['まとめ買い', discounts.map((d) => `${d.label}で${d.rule}`).join('、')],
                ['取り置き', '最大1週間'],
                ['お取り寄せ', '承ります'],
                ['お支払い', shop.payments.value.join('、')],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[6rem_1fr] gap-3 border-b border-line py-4">
                  <dt className="text-ink-faint">{k}</dt>
                  <dd className="leading-[1.8] text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------ 棚の様子 */}
      <section className="cv-auto bg-paper py-16 sm:py-20">
        <Container>
          <div className="grid gap-4 sm:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            <figure>
              <div className="relative aspect-[4/5] overflow-hidden rounded-lg">
                <Photo name="shop-case-small" fill sizes="(max-width:640px) 92vw, 38vw" className="object-cover" />
              </div>
            </figure>
            <figure className="self-end">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                <Photo name="shop-shelf-a" fill sizes="(max-width:640px) 92vw, 54vw" className="object-cover" />
              </div>
            </figure>
          </div>

          <div className="mt-12 max-w-2xl text-[0.95rem] leading-[2] text-ink-soft">
            <p>
              どれを遊ぶか迷ったら、
              <Link href="/games#staff-picks" className="prose-link">
                スタッフが選んだゲーム
              </Link>
              も参考にしてください。プレイスペースの料金は
              <Link href="/system" className="prose-link">
                料金・ご利用案内
              </Link>
              にまとめています。
            </p>
          </div>

          <div className="mt-12">
            <Breadcrumbs items={crumbs} />
          </div>
        </Container>
      </section>
    </>
  );
}

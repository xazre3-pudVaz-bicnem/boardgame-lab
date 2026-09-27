import type { Metadata } from 'next';
import { Breadcrumbs, Button, Container, ConfirmNote, Eyebrow, PageHeader } from '@/components/ui';
import { shop } from '@/data/shop';
import { breadcrumbSchema, buildMetadata, JsonLd } from '@/lib/seo';
import ContactForm from './ContactForm';

export const metadata: Metadata = buildMetadata({
  title: 'お問い合わせ｜大阪・梅田中津のボードゲーム BODOlab.',
  description:
    'BODOlab.へのお問い合わせページです。在庫確認・お取り置き、貸切や団体利用のご相談、メディア関連のお問い合わせはこちらから。お席のご予約はご来店予約フォームで承っています。',
  path: '/contact',
  keywords: ['BODOlab 問い合わせ', '大阪 ボードゲーム 貸切', 'ボードゲーム 取り置き 大阪'],
});

const crumbs = [{ name: 'ホーム', href: '/' }, { name: 'お問い合わせ' }];

/** 送信先が設定されていないうちは、動かないフォームを置かずに連絡先だけ出す。 */
const CONTACT_ENABLED = Boolean(
  process.env.RESEND_API_KEY && process.env.CONTACT_TO_EMAIL && process.env.CONTACT_FROM_EMAIL,
);

const TOPICS = [
  '販売商品の在庫確認、お取り置き（最大1週間）',
  '貸切・団体でのご利用のご相談',
  'メディア関連のお問い合わせ',
  'その他のご質問',
];

export default function ContactPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />

      <PageHeader
        eyebrow="Contact"
        title="お問い合わせ"
        breadcrumbs={crumbs}
        lead="ご不明な点はお気軽にご連絡ください。なお、お席のご予約はこのページでは承っていません。ご来店予約フォームからお願いします。"
      />

      <section className="section-y bg-paper">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:gap-20">
            <div>
              <Eyebrow>Form</Eyebrow>
              <h2 className="display mt-3 mb-8 text-[clamp(1.3rem,3.4vw,1.9rem)] text-ink">
                {CONTACT_ENABLED ? 'フォームからのお問い合わせ' : 'ご連絡方法'}
              </h2>

              {CONTACT_ENABLED ? (
                <ContactForm />
              ) : (
                <div className="space-y-6">
                  <ConfirmNote>
                    お問い合わせフォームは、送信先メールアドレスの設定が完了しだい公開します。
                    それまでは、お電話・公式LINE・公式Instagramのダイレクトメッセージからご連絡ください。
                  </ConfirmNote>
                  <div className="flex flex-wrap gap-3">
                    <Button href={`tel:${shop.tel.value.replace(/-/g, '')}`} variant="solid">
                      電話でお問い合わせ（{shop.tel.value}）
                    </Button>
                    {shop.links.line ? (
                      <Button href={shop.links.line} variant="outline" external>
                        公式LINEで問い合わせる
                      </Button>
                    ) : null}
                    <Button href={shop.links.instagram} variant="outline" external>
                      InstagramのDMで問い合わせる
                    </Button>
                  </div>
                  <p className="text-[0.82rem] leading-[1.9] text-ink-faint">
                    お電話は営業時間内（平日{shop.hours.weekday.value.open}〜{shop.hours.weekday.value.close}／
                    {shop.hours.weekendNote} {shop.hours.weekend.value.open}〜{shop.hours.weekend.value.close}）
                    にお願いします。{shop.hours.closedDays.value.join('・')}は定休日です。
                  </p>
                </div>
              )}
            </div>

            <aside className="space-y-10">
              <div>
                <h2 className="display text-[1.05rem] text-ink">こんなご用件を承っています</h2>
                <ul className="mt-4 space-y-2.5 text-[0.86rem] leading-[1.9] text-ink-soft">
                  {TOPICS.map((t) => (
                    <li key={t} className="flex gap-2.5">
                      <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-cyan" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-navy/15 bg-surface p-6">
                <h2 className="display text-[1.05rem] text-ink">お席のご予約について</h2>
                <p className="text-pretty mt-3 text-[0.85rem] leading-[1.9] text-ink-soft">
                  {shop.reservationNote}
                </p>
                <div className="mt-5">
                  <Button href={shop.reservationUrl} variant="solid" external>
                    ご来店予約フォームへ
                  </Button>
                </div>
              </div>

              <div>
                <h2 className="display text-[1.05rem] text-ink">その他の連絡先</h2>
                <dl className="mt-4">
                  <div className="spec-row">
                    <dt className="text-ink-soft">電話</dt>
                    <dd>
                      <a href={`tel:${shop.tel.value.replace(/-/g, '')}`} className="inline-block py-1 font-semibold text-navy">
                        {shop.tel.value}
                      </a>
                    </dd>
                  </div>
                  {shop.links.line ? (
                    <div className="spec-row">
                      <dt className="text-ink-soft">公式LINE</dt>
                      <dd>
                        <a href={shop.links.line} target="_blank" rel="noopener noreferrer" className="prose-link">
                          @pmb9803r
                        </a>
                      </dd>
                    </div>
                  ) : null}
                  <div className="spec-row">
                    <dt className="text-ink-soft">Instagram</dt>
                    <dd>
                      <a href={shop.links.instagram} target="_blank" rel="noopener noreferrer" className="prose-link">
                        @bodo_lab_
                      </a>
                    </dd>
                  </div>
                  <div className="spec-row">
                    <dt className="text-ink-soft">住所</dt>
                    <dd className="text-right text-[0.85rem] text-ink">{shop.address.full}</dd>
                  </div>
                </dl>
              </div>
            </aside>
          </div>

          <div className="mt-16">
            <Breadcrumbs items={crumbs} />
          </div>
        </Container>
      </section>
    </>
  );
}

import Link from 'next/link';
import Photo, { type PhotoKey } from '@/components/Photo';
import GameTile from '@/components/GameTile';
import { Container, SectionHeading, Button, Chip, Eyebrow } from '@/components/ui';
import { shop, hoursLine } from '@/data/shop';
import type { Game } from '@/lib/games';

/* --------------------------------------------------------------- ABOUT */

export function About({ gameCount }: { gameCount: number }) {
  return (
    <section id="about" className="cv-auto section-y bg-paper">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center lg:gap-20">
          <div data-reveal>
            <SectionHeading
              eyebrow="About"
              title={
                <>
                  「何して遊ぶ？」に、
                  <br />
                  {gameCount}通りの答えがある場所。
                </>
              }
              lead={
                <>
                  <p>
                    BODOlab.（ボドラボ）は、大阪市北区豊崎にあるボードゲームのプレイスペース＆ショップです。
                    棚に並ぶ{gameCount}種類のなかから好きなゲームを取り出して、時間いっぱい遊べます。
                  </p>
                  <p className="mt-4">
                    ボードゲームを一度も遊んだことがなくても大丈夫です。
                    「2人で楽しめるものを」「初対面でも盛り上がるものを」と声をかけていただければ、
                    スタッフがその日のメンバーと気分に合う一本を選んで、ルールを説明します。
                    説明を聞いてから遊ぶので、箱の裏を読む時間はいりません。
                  </p>
                </>
              }
            />
            <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-4">
              {[
                { t: `${gameCount}`, s: '種類のボードゲーム', u: '' },
                { t: '600', s: '円／1時間', u: '¥' },
                { t: '3', s: '分／中津駅から', u: '' },
                { t: '10', s: '分／梅田から', u: '' },
              ].map((d) => (
                <div key={d.s}>
                  <dt className="sr-only">{d.s}</dt>
                  <dd>
                    <span className="display block text-[2rem] leading-none font-bold text-navy">
                      <span className="text-[1.1rem] align-top text-cyan">{d.u}</span>
                      {d.t}
                    </span>
                    <span className="mt-2 block text-[0.76rem] text-ink-faint">{d.s}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4" data-reveal data-reveal-delay="120">
            <div className="relative col-span-2 aspect-[16/10] overflow-hidden rounded-2xl">
              <Photo name="room-empty" fill sizes="(max-width:1024px) 92vw, 46vw" className="object-cover" />
            </div>
            <div className="relative aspect-square overflow-hidden rounded-2xl">
              <Photo name="shelf-staff" fill sizes="(max-width:1024px) 45vw, 23vw" className="object-cover" />
            </div>
            <div className="relative aspect-square overflow-hidden rounded-2xl">
              <Photo name="game-pawns" fill sizes="(max-width:1024px) 45vw, 23vw" className="object-cover" />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* --------------------------------------------------------------- WHY */

const reasons = [
  {
    no: '01',
    title: 'ルールは、スタッフが説明します',
    body: '遊びたいゲームを選んだら、スタッフがその場でルールを説明します。説明書を読む時間も、誰かが先に覚えてくる必要もありません。遊んだことがない人しかいないテーブルでも、そのまま始められます。',
    photo: 'table-standing' as const,
  },
  {
    no: '02',
    title: '棚から自由に、何本でも',
    body: '料金は時間制なので、遊ぶ本数に制限はありません。短いゲームを何本も試すのも、重量級を1本じっくり遊ぶのも自由です。合わなければ途中で別の棚に戻ってきてください。',
    photo: 'room-empty' as const,
  },
  {
    no: '03',
    title: '1人でも、相席で輪に入れる',
    body: '相席ありを選ぶと、その日いらっしゃった他のお客様と一緒に遊べます。料金も1時間500円と安くなります。ボードゲームは初対面でも会話が生まれる遊びなので、1人でのご来店も珍しくありません。',
    photo: 'floor-evening' as const,
  },
  {
    no: '04',
    title: '気に入ったら、そのまま買って帰れる',
    body: '当店はショップも兼ねています。遊んで気に入ったゲームは店頭でご購入いただけます。取り置き（最大1週間）やお取り寄せにも対応。3点で10%、4点以上で15%引きになります。',
    photo: 'game-boxes' as const,
  },
] as const;

export function Why() {
  return (
    <section id="why" className="cv-auto section-y bg-surface">
      <Container>
        <SectionHeading
          eyebrow="Why BODOlab."
          title="はじめてでも、ひとりでも、手ぶらで来てください。"
          lead="608種類が並んでいても、選び方がわからなければ意味がありません。BODOlab.がやっているのは、遊ぶまでのハードルをできるだけ低くすることです。"
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {reasons.map((r, i) => (
            <article
              key={r.no}
              data-reveal
              data-reveal-delay={i * 90}
              className="group overflow-hidden rounded-2xl border border-line bg-paper transition-shadow duration-500 hover:shadow-[0_10px_40px_rgba(0,40,79,0.08)]"
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <Photo
                  name={r.photo}
                  fill
                  sizes="(max-width:640px) 92vw, 44vw"
                  className="object-cover transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
                />
              </div>
              <div className="p-6 sm:p-8">
                <span className="display text-[0.7rem] font-semibold tracking-[0.2em] text-cyan-ink">{r.no}</span>
                <h3 className="display mt-2 text-[1.12rem] leading-snug font-semibold text-ink">{r.title}</h3>
                <p className="text-pretty mt-3 text-[0.875rem] leading-[1.95] text-ink-soft">{r.body}</p>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* --------------------------------------------------------------- GAME COLLECTION */

export function GameCollection({
  groups,
  total,
}: {
  groups: { key: string; label: string; href: string; caption: string; games: Game[] }[];
  total: number;
}) {
  return (
    <section id="games" className="cv-auto section-y bg-navy-deep text-white">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl" data-reveal>
            <p className="eyebrow text-cyan">Game Collection</p>
            <h2 className="display text-balance mt-4 text-[clamp(1.6rem,4.2vw,2.6rem)] leading-[1.35] text-white">
              棚にある{total}種類を、ぜんぶ載せました。
            </h2>
            <p className="text-pretty mt-5 text-[0.95rem] leading-[1.95] text-white/72">
              人数・時間・ジャンルで絞り込めます。遊びたいゲームを決めてから来ても、棚の前で決めても構いません。
            </p>
          </div>
          <Button href="/games" variant="amber" className="shrink-0">
            {total}種類をすべて見る
          </Button>
        </div>

        <div className="mt-14 space-y-14">
          {groups.map((g, gi) => (
            <div key={g.key} data-reveal data-reveal-delay={gi * 70}>
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h3 className="display text-[1.05rem] font-semibold text-white">{g.label}</h3>
                <Link
                  href={g.href}
                  className="text-[0.78rem] text-cyan transition-colors hover:text-white"
                  aria-label={`${g.label}のゲームをすべて見る`}
                >
                  すべて見る →
                </Link>
              </div>
              <p className="mt-1.5 text-[0.8rem] text-white/55">{g.caption}</p>

              {/* スマホは横スクロール、PCはグリッド */}
              <ul className="hide-scrollbar mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible lg:grid-cols-6">
                {g.games.map((game) => (
                  <li key={game.slug} className="w-[42vw] shrink-0 snap-start sm:w-auto">
                    <Link href={`/games/${game.slug}`} className="group block">
                      <div className="overflow-hidden rounded-xl">
                        <GameTile
                          slug={game.slug}
                          name={game.nameJa}
                          nameEn={game.nameEn}
                          genre={game.genre}
                          className="aspect-square w-full transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
                        />
                      </div>
                      <p className="mt-2.5 line-clamp-2 text-[0.78rem] leading-snug text-white/85 transition-colors group-hover:text-cyan">
                        {game.nameJa}
                      </p>
                      <p className="mt-1 text-[0.68rem] text-white/45">
                        {game.playersLabel ?? '人数未確認'}
                        {game.timeLabel ? ` ・ ${game.timeLabel}` : ''}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* --------------------------------------------------------------- HOW TO ENJOY */

const enjoySteps = [
  { n: '1', t: '予約して来店', d: 'ご来店予約フォームから日時と人数を送信。当日空いていればそのままのご来店も歓迎です。' },
  { n: '2', t: 'やりたいことを伝える', d: '「2人でじっくり」「初めて」「大人数で盛り上がりたい」。スタッフがそれに合うゲームを出します。' },
  { n: '3', t: 'ルール説明を聞いて遊ぶ', d: '説明は5〜15分ほど。終わったら別のゲームへ。時間内なら何本遊んでも料金は変わりません。' },
  { n: '4', t: '会計は帰るときに', d: '1時間600円、上限は平日2,500円・土日祝3,000円。気に入ったゲームは購入もできます。' },
] as const;

export function HowToEnjoy() {
  return (
    <section id="how" className="cv-auto section-y bg-paper">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-20">
          <div data-reveal>
            <SectionHeading
              eyebrow="How to enjoy"
              title="来てから帰るまで、4ステップ。"
              lead="予約から会計までの流れです。むずかしい準備はひとつもありません。"
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={shop.reservationUrl} variant="solid" external>
                ご来店予約フォームへ
              </Button>
              <Button href="/system" variant="outline">
                料金と利用案内を見る
              </Button>
            </div>
          </div>

          <ol className="space-y-0" data-reveal data-reveal-delay="120">
            {enjoySteps.map((s) => (
              <li key={s.n} className="flex gap-5 border-t border-line py-6 last:border-b">
                <span className="display flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy text-[0.85rem] font-bold text-white">
                  {s.n}
                </span>
                <div>
                  <h3 className="text-[1rem] font-semibold text-ink">{s.t}</h3>
                  <p className="text-pretty mt-1.5 text-[0.86rem] leading-[1.9] text-ink-soft">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}

/* --------------------------------------------------------------- SCENE */

export function SceneGrid({
  scenes,
}: {
  scenes: { href: string; label: string; en: string; body: string; photo: PhotoKey }[];
}) {
  return (
    <section id="scene" className="cv-auto section-y bg-surface">
      <Container>
        <SectionHeading
          eyebrow="Scene"
          title="雨の日も、デートも、仕事帰りも。"
          lead="「ボードゲームがしたい」以外の理由で来ていただいて大丈夫です。目的から探せるガイドを用意しました。"
        />

        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {scenes.map((s, i) => (
            <li key={s.href} data-reveal data-reveal-delay={i * 70}>
              <Link
                href={s.href}
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
                <div className="relative flex min-h-[15rem] flex-col justify-end p-6 sm:min-h-[16.5rem]">
                  <span className="display text-[0.58rem] tracking-[0.24em] text-cyan uppercase">{s.en}</span>
                  <h3 className="display mt-2 text-[1.1rem] leading-snug font-semibold">{s.label}</h3>
                  <p className="text-pretty mt-2 text-[0.8rem] leading-[1.85] text-white/72">{s.body}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/* --------------------------------------------------------------- SYSTEM */

export function SystemSummary() {
  const u = shop.pricing.unit.value;
  const c = shop.pricing.caps.value;
  return (
    <section id="system" className="cv-auto section-y bg-paper-2">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
          <div data-reveal>
            <SectionHeading
              eyebrow="System"
              title="料金は時間制。あとは何本遊んでも同じです。"
              lead="ご利用時間ぶんのプレイスペース料金だけをいただきます。ゲームごとの追加料金はありません。"
            />
            <p className="mt-6 text-[0.82rem] leading-[1.9] text-ink-faint">{shop.pricing.guaranteedHoursNote}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/system" variant="solid">
                料金・利用案内の詳細
              </Button>
              <Button href="/faq" variant="outline">
                よくあるご質問
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-7 sm:p-9" data-reveal data-reveal-delay="120">
            <table className="w-full text-left">
              <caption className="sr-only">プレイスペース料金</caption>
              <thead>
                <tr className="text-[0.72rem] text-ink-faint">
                  <th scope="col" className="pb-3 font-medium">
                    区分
                  </th>
                  <th scope="col" className="pb-3 text-right font-medium">
                    1時間
                  </th>
                  <th scope="col" className="pb-3 text-right font-medium">
                    平日上限
                  </th>
                  <th scope="col" className="pb-3 text-right font-medium">
                    土日祝上限
                  </th>
                </tr>
              </thead>
              <tbody className="text-[0.92rem]">
                <tr className="border-t border-line">
                  <th scope="row" className="py-4 font-semibold text-ink">
                    通常
                  </th>
                  <td className="py-4 text-right tabular-nums">
                    <span className="display text-[1.35rem] font-bold text-navy">{u.normal}</span>円
                  </td>
                  <td className="py-4 text-right tabular-nums text-ink-soft">{c.weekday.normal.toLocaleString()}円</td>
                  <td className="py-4 text-right tabular-nums text-ink-soft">{c.weekend.normal.toLocaleString()}円</td>
                </tr>
                <tr className="border-t border-line">
                  <th scope="row" className="py-4 font-semibold text-ink">
                    相席あり
                  </th>
                  <td className="py-4 text-right tabular-nums">
                    <span className="display text-[1.35rem] font-bold text-cyan-ink">{u.share}</span>円
                  </td>
                  <td className="py-4 text-right tabular-nums text-ink-soft">{c.weekday.share.toLocaleString()}円</td>
                  <td className="py-4 text-right tabular-nums text-ink-soft">{c.weekend.share.toLocaleString()}円</td>
                </tr>
              </tbody>
            </table>

            <ul className="mt-7 space-y-2 border-t border-line pt-6 text-[0.82rem] leading-relaxed text-ink-soft">
              <li>・小学生は半額、未就学児は無料です。</li>
              <li>・学生証のご提示で学生割が適用されます（割引率は店頭でご確認ください）。</li>
              <li>・中学生以下のご利用は、成人の保護者の方の同伴が必要です。</li>
              <li>・飲食物の販売はしていません。お持ち込みは可能です。</li>
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* --------------------------------------------------------------- ACCESS */

export function AccessSummary() {
  return (
    <section id="access" className="cv-auto section-y bg-surface">
      <Container>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div data-reveal>
            <SectionHeading eyebrow="Access" title="大阪メトロ中津駅から、徒歩3分。" />
            <dl className="mt-8">
              {[
                { k: '住所', v: shop.address.full },
                { k: 'アクセス', v: '大阪メトロ御堂筋線 中津駅 1番出口から徒歩3分／阪急 大阪梅田駅 茶屋町口から徒歩10分' },
                { k: '営業時間', v: hoursLine() },
                { k: '定休日', v: `${shop.hours.closedDays.value.join('・')}（${shop.hours.closedDaysNote.replace('。', '')}）` },
                { k: 'TEL ＆ FAX', v: shop.tel.value },
              ].map((r) => (
                <div key={r.k} className="spec-row">
                  <dt className="text-[0.78rem] font-medium text-ink-faint">{r.k}</dt>
                  <dd className="text-[0.9rem] leading-relaxed text-ink">{r.v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 text-[0.84rem] leading-[1.95] text-ink-soft">{shop.accessDirections}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/access" variant="solid">
                アクセスの詳細
              </Button>
              <Button href={shop.reservationUrl} variant="outline" external>
                ご来店予約
              </Button>
            </div>
          </div>

          <div data-reveal data-reveal-delay="120">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Photo name="chalkboard" fill sizes="(max-width:1024px) 92vw, 46vw" className="object-cover" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <Photo name="entrance-stairs" fill sizes="(max-width:1024px) 45vw, 23vw" className="object-cover" />
              </div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <Photo name="table-pairs" fill sizes="(max-width:1024px) 45vw, 23vw" className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* --------------------------------------------------------------- CTA */

export function CtaBand() {
  return (
    <section className="cv-auto relative isolate overflow-hidden bg-navy">
      <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-20">
        <Photo name="floor-group" fill sizes="100vw" className="object-cover" />
      </div>
      <Container className="py-20 text-center sm:py-24">
        <Eyebrow className="text-cyan">Reservation</Eyebrow>
        <h2 className="display text-balance mx-auto mt-4 max-w-2xl text-[clamp(1.5rem,4.4vw,2.4rem)] leading-[1.4] font-semibold text-white">
          今日の予定が決まっていないなら、
          <br />
          ボードゲームはどうですか。
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-[0.9rem] leading-[1.95] text-white/72">
          ご予約はフォームからお願いします。お問い合わせフォーム・メール・お電話では席のご予約を承っていません。
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Button href={shop.reservationUrl} variant="amber" external>
            ご来店予約フォーム
          </Button>
          <Button
            href={`tel:${shop.tel.value.replace(/-/g, '')}`}
            variant="outline"
            className="border-white/30 text-white hover:border-white hover:bg-white/10"
          >
            電話で問い合わせる
          </Button>
        </div>
        <p className="mt-6 text-[0.75rem] text-white/50">
          <Chip tone="navy" className="bg-white/12 text-white/80">
            {hoursLine()}
          </Chip>
        </p>
      </Container>
    </section>
  );
}

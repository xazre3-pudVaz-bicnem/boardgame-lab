import Link from 'next/link';
import type { ReactNode } from 'react';
import Photo from '@/components/Photo';
import { GameCard } from '@/components/GameCard';
import { Container } from '@/components/ui';
import { shop } from '@/data/shop';
import { SCENES } from '@/data/scenes';
import { newsByDate } from '@/data/news';
import { CONDITIONS, staffPicks } from '@/lib/games';

/*
 * トップページ。
 *
 * 「どんな場所か → 店内 → はじめての方へ → ゲーム → 使い方と料金 → イベント → アクセス」の順に、
 * 店を紹介する流れにしている。
 *
 * 2026-10 に店舗から「会社のホームページのように見える。のんびりできるカフェのような雰囲気に」
 * という要望があり、見せ方を変えた。
 *   - 罫線で区切った表をやめ、角丸のカードとメニュー表の書き方（品名 …… 値段）にした
 *   - 余白を広く取り、文章を説明口調からやわらかい口調にした
 *   - 見出しの下にゆるい波線を入れた
 * 飲食の販売はないので「カフェ」とは書かない。タイトル数も書かない（日々増えるため）。
 * 写真は顔が写っていないものだけを使い、何が写っているかをキャプションに正直に書く。
 */

const SECTION = 'py-20 sm:py-28';
const H2 = 'text-[clamp(1.45rem,3.8vw,2.05rem)] font-bold text-ink';
/* 本文は文節の切れ目で折り返す（「ショッ／プです」のような泣き別れを防ぐ） */
const BODY = 'text-[0.98rem] leading-[2.1] text-ink-soft [word-break:auto-phrase]';
const CARD = 'rounded-3xl border border-line bg-surface';
const CAPTION = 'mt-2.5 text-[0.78rem] text-ink-faint';
const BTN_SOLID =
  'inline-flex min-h-12 items-center rounded-full bg-cocoa px-7 text-[0.9rem] font-semibold text-white transition-colors hover:bg-cocoa-deep';
const BTN_OUTLINE =
  'inline-flex min-h-12 items-center rounded-full border border-cocoa/30 bg-surface px-7 text-[0.9rem] font-semibold text-cocoa transition-colors hover:border-cocoa';
const PILL =
  'inline-flex min-h-11 items-center rounded-full border border-line bg-surface px-4 text-[0.88rem] text-ink transition-colors hover:border-caramel hover:text-caramel-ink';

/** 見出しと、その下のゆるい波線 */
function Heading({ children, center = false }: { children: ReactNode; center?: boolean }) {
  return (
    <div className={center ? 'text-center' : ''}>
      <h2 className={H2}>{children}</h2>
      <svg
        viewBox="0 0 66 8"
        className={`mt-3 h-2 w-16 text-amber ${center ? 'mx-auto' : ''}`}
        aria-hidden="true"
      >
        <path
          d="M2 5c5-5 10 5 15.5 0s10 5 15.5 0 10 5 15.5 0 10 5 15.5 0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

/** 品名 …… 値段 の1行（メニュー表の書き方） */
function MenuRow({ name, price, note }: { name: string; price: string; note?: string }) {
  return (
    <div className="menu-row py-2">
      <dt className="text-ink">
        {name}
        {note ? <span className="ml-1.5 text-[0.78rem] text-ink-faint">{note}</span> : null}
      </dt>
      <dd className="font-bold text-ink tabular-nums">{price}</dd>
    </div>
  );
}

/* --------------------------------------------------------------- どんな場所か */

const ICON = 'h-6 w-6 text-caramel';

function IconClock() {
  return (
    <svg viewBox="0 0 24 24" className={ICON} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}
function IconYen() {
  return (
    <svg viewBox="0 0 24 24" className={ICON} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9 7.5l3 4.5 3-4.5M12 12v5M9.5 12.5h5M9.5 15h5" />
    </svg>
  );
}
function IconPin() {
  return (
    <svg viewBox="0 0 24 24" className={ICON} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21s6.5-5.6 6.5-10.5a6.5 6.5 0 1 0-13 0C5.5 15.4 12 21 12 21Z" />
      <circle cx="12" cy="10.5" r="2.2" />
    </svg>
  );
}
function IconNote() {
  return (
    <svg viewBox="0 0 24 24" className={ICON} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4.5" y="5.5" width="15" height="14" rx="3" />
      <path d="M8.5 3.5v4M15.5 3.5v4M4.5 10.5h15" />
    </svg>
  );
}

export function About() {
  const u = shop.pricing.unit.value;
  const c = shop.pricing.caps.value;
  const wd = shop.hours.weekday.value;
  const we = shop.hours.weekend.value;

  const cards: { icon: ReactNode; label: string; lines: string[] }[] = [
    {
      icon: <IconClock />,
      label: '営業時間',
      lines: [
        `平日 ${wd.open}〜${wd.close}`,
        `土日祝 ${we.open}〜${we.close}`,
        `${shop.hours.closedDays.value.join('・')}定休（祝日は営業）`,
      ],
    },
    {
      icon: <IconYen />,
      label: '料金',
      lines: [
        `1時間 ${u.normal}円`,
        `相席可なら ${u.share}円`,
        `上限 平日${c.weekday.normal.toLocaleString()}円・土日祝${c.weekend.normal.toLocaleString()}円`,
      ],
    },
    {
      icon: <IconPin />,
      label: '場所',
      lines: ['中津駅1番出口から歩いて3分', '梅田（茶屋町口）から10分', 'ビルの3階です'],
    },
    {
      icon: <IconNote />,
      label: 'ご予約',
      lines: ['ご来店予約フォームから', '空席があれば予約なしでも'],
    },
  ];

  return (
    <section className={`bg-surface ${SECTION}`}>
      <Container>
        <div className="mx-auto max-w-2xl">
          <Heading center>ボドラボは、こんな場所です</Heading>
          <div className={`mt-8 space-y-5 ${BODY}`}>
            <p>
              BODOlab.（ボードゲームラボ、通称ボドラボ）は、中津駅のすぐ近くにあるボードゲームのプレイスペース＆ショップです。
            </p>
            <p>
              壁いっぱいの棚から気になる箱を選んで、テーブルで好きなだけ。
              時間制なので、1本だけでも、じっくり何本でも大丈夫です。
            </p>
            <p>
              飲食の販売はありませんが、持ち込みはできます。ふた付きの飲みものなら、遊びながらでもどうぞ。
              気に入ったゲームは、そのまま店頭で買えます。
            </p>
          </div>
        </div>

        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <li key={card.label} className={`${CARD} bg-paper p-6`}>
              {card.icon}
              <h3 className="mt-3 text-[1rem] font-bold text-ink">{card.label}</h3>
              <ul className="mt-2 space-y-1 text-[0.88rem] leading-[1.8] text-ink-soft">
                {card.lines.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/* --------------------------------------------------------------- 店内 */

export function Space() {
  return (
    <section className={`cv-auto bg-paper ${SECTION}`}>
      <Container>
        <Heading>店内のようす</Heading>
        <p className={`mt-6 max-w-2xl ${BODY}`}>
          白い棚と木のテーブルの、明るい部屋です。棚にはボードゲームの箱が並んでいます。
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-12">
          <figure className="md:col-span-8">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
              <Photo name="room-empty" fill sizes="(max-width:768px) 92vw, 62vw" className="object-cover" />
            </div>
            <figcaption className={CAPTION}>営業前の店内。棚のゲームから選んで遊びます。</figcaption>
          </figure>
          <div className="grid grid-cols-2 gap-5 md:col-span-4 md:grid-cols-1">
            <figure>
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
                <Photo name="game-pawns" fill sizes="(max-width:768px) 45vw, 30vw" className="object-cover" />
              </div>
              <figcaption className={CAPTION}>店内のテーブルで遊んでいるゲーム。</figcaption>
            </figure>
            <figure>
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
                <Photo name="game-boxes" fill sizes="(max-width:768px) 45vw, 30vw" className="object-cover" />
              </div>
              <figcaption className={CAPTION}>選んだゲームはテーブルで遊びます。</figcaption>
            </figure>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* --------------------------------------------------------------- はじめての方へ */

export function StaffGuide() {
  const asks = [
    '何人で遊ぶか（2人で来た、など）',
    'ボードゲームが初めてかどうか',
    'どれくらいの時間いる予定か',
    '1人の場合、相席を希望するかどうか',
  ];
  return (
    <section className={`cv-auto bg-paper-2 ${SECTION}`}>
      <Container>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center lg:gap-16">
          <div>
            <Heading>はじめてでも、だいじょうぶ</Heading>
            <div className={`mt-6 space-y-4 ${BODY}`}>
              <p>ルールを覚えてくる必要はありません。遊ぶゲームが決まったら、スタッフがその場で説明します。</p>
              <p>受付で次の4つを教えてもらえると、ゲームを選ぶときの参考になります。</p>
            </div>
            <p className="mt-7">
              <Link href="/scene/first-time" className={BTN_OUTLINE}>
                はじめての方へ
              </Link>
            </p>
          </div>

          <ol className="grid gap-3 sm:grid-cols-2">
            {asks.map((a, i) => (
              <li key={a} className={`${CARD} flex items-start gap-3.5 p-5`}>
                <span
                  aria-hidden="true"
                  className="display flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-wash text-[0.9rem] text-amber-ink"
                >
                  {i + 1}
                </span>
                <span className="text-[0.92rem] leading-[1.8] text-ink">{a}</span>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}

/* --------------------------------------------------------------- ゲーム */

export function Games() {
  const picks = staffPicks().slice(0, 6);
  return (
    <section className={`cv-auto bg-surface ${SECTION}`}>
      <Container>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <Heading>遊べるボードゲーム</Heading>
            <div className={`mt-6 space-y-4 ${BODY}`}>
              <p>さっと終わるカードゲームから、じっくり考えるゲームまで。タイトルは少しずつ増えています。</p>
              <p>入れ替わることもあるので、遊びたいゲームが決まっているときは、事前にお問い合わせください。</p>
            </div>
            <p className="mt-7">
              <Link href="/games" className={BTN_SOLID}>
                ゲームを探す
              </Link>
            </p>
          </div>

          <div className="self-center">
            <h3 className="text-[0.95rem] font-bold text-ink">人数や時間から探す</h3>
            <ul className="mt-4 flex flex-wrap gap-2.5">
              {CONDITIONS.map((c) => (
                <li key={c.key}>
                  <Link href={`/games/${c.slug}`} className={PILL}>
                    {c.heading}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/games/list" className={PILL}>
                  五十音で探す
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {picks.length ? (
          <div className="mt-16">
            <h3 className="text-[1.1rem] font-bold text-ink">スタッフのおすすめ</h3>
            <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {picks.map((g) => (
                <li key={g.slug}>
                  <GameCard game={g} />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Container>
    </section>
  );
}

/* --------------------------------------------------------------- 使い方と料金 */

export function HowAndPrice() {
  const u = shop.pricing.unit.value;
  const c = shop.pricing.caps.value;
  const steps: { title: string; body: string }[] = [
    { title: '予約する（しなくてもOK）', body: 'ご来店予約フォームから日時と人数を送ります。空席があれば、予約なしでも入れます。' },
    { title: '受付', body: '人数と、相席を希望するかどうかを伝えます。' },
    { title: '遊ぶ', body: 'ゲームを選ぶと、スタッフがルールを説明します。時間内なら何本遊んでも料金は同じです。' },
    { title: 'お会計', body: '帰るときに、利用した時間のぶんをお支払いいただきます。' },
  ];

  return (
    <section className={`cv-auto bg-paper ${SECTION}`}>
      <Container>
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-20">
          <div>
            <Heading>来てから帰るまで</Heading>
            <ol className="mt-8 space-y-6">
              {steps.map((s, i) => (
                <li key={s.title} className="flex gap-4">
                  <span
                    aria-hidden="true"
                    className="display flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cocoa text-[0.9rem] text-white"
                  >
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-[1rem] font-bold text-ink">{s.title}</h3>
                    <p className="mt-1 text-[0.92rem] leading-[1.9] text-ink-soft">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <Heading>料金</Heading>
            <div className={`${CARD} mt-8 p-6 shadow-[0_14px_40px_-22px_rgba(75,56,45,0.35)] sm:p-8`}>
              <h3 className="text-[0.82rem] font-bold tracking-[0.08em] text-caramel-ink">1時間あたり</h3>
              <dl className="mt-2 text-[0.98rem]">
                <MenuRow name="通常" price={`${u.normal}円`} />
                <MenuRow name="相席可" price={`${u.share}円`} />
              </dl>

              <h3 className="mt-6 text-[0.82rem] font-bold tracking-[0.08em] text-caramel-ink">
                1日の上限（これ以上はかかりません）
              </h3>
              <dl className="mt-2 text-[0.98rem]">
                <MenuRow name="平日" price={`${c.weekday.normal.toLocaleString()}円`} />
                <MenuRow name="平日" note="相席可" price={`${c.weekday.share.toLocaleString()}円`} />
                <MenuRow name="土日祝" price={`${c.weekend.normal.toLocaleString()}円`} />
                <MenuRow name="土日祝" note="相席可" price={`${c.weekend.share.toLocaleString()}円`} />
              </dl>
            </div>
            <p className="mt-5 text-[0.85rem] leading-[1.9] text-ink-soft">
              小学生は半額、未就学児は無料です（中学生以下は保護者の方とご一緒に）。
              学生の方は、学生証の提示で{shop.pricing.studentDiscount.value}%引きになります。お席の利用時間の保証は5時間までです。
            </p>
            <p className="mt-3 text-[0.9rem]">
              <Link href="/system" className="prose-link">
                料金・ご利用案内をくわしく見る
              </Link>
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* --------------------------------------------------------------- イベント */

export function Events() {
  const ev = shop.testPlayEvent.value;
  const news = newsByDate().slice(0, 3);
  return (
    <section className={`cv-auto bg-paper-2 ${SECTION}`}>
      <Container>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
          <figure className="order-last lg:order-first">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
              <Photo name="game-catan-hand" fill sizes="(max-width:1024px) 92vw, 46vw" className="object-cover" />
            </div>
            <figcaption className={CAPTION}>店内のテーブルで遊んでいる様子。</figcaption>
          </figure>
          <div>
            <p className="text-[0.82rem] font-bold tracking-[0.08em] text-caramel-ink">毎月のイベント</p>
            <div className="mt-2">
              <Heading>{ev.name}</Heading>
            </div>
            <p className={`mt-6 ${BODY}`}>{ev.notes[0]}</p>
            <dl className={`${CARD} mt-6 px-5 py-2 text-[0.92rem]`}>
              {[
                ['開催', `${ev.schedule} ${ev.hours}`],
                ['参加費', `${ev.fee}円（${ev.feeNote}）`],
                ['申し込み', ev.entry],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[5rem_1fr] gap-3 border-b border-line py-3 last:border-0">
                  <dt className="text-ink-faint">{k}</dt>
                  <dd className="text-ink">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-[0.8rem] leading-relaxed text-ink-faint">
              {ev.scheduleNote}。開催日は変わることがあるので、最新の告知をご確認ください。
            </p>
            <p className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[0.9rem]">
              <a href={shop.links.twipla} target="_blank" rel="noopener noreferrer" className="prose-link">
                TwiPlaで開催予定を見る
              </a>
              <Link href="/schedule" className="prose-link">
                イベントについて
              </Link>
            </p>
          </div>
        </div>

        <div className={`${CARD} mt-14 p-6 sm:p-8`}>
          <h3 className="text-[1rem] font-bold text-ink">お知らせ</h3>
          <ul className="mt-3 space-y-2.5 text-[0.9rem]">
            {news.map((n) => (
              <li key={n.slug} className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
                <time dateTime={n.date} className="shrink-0 text-ink-faint tabular-nums">
                  {n.date.replace(/-/g, '.')}
                </time>
                <Link href={`/news/${encodeURIComponent(n.slug)}`} className="text-ink hover:text-caramel-ink">
                  {n.title}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[0.85rem]">
            <Link href="/news" className="prose-link">
              お知らせをもっと見る
            </Link>
          </p>
        </div>
      </Container>
    </section>
  );
}

/* --------------------------------------------------------------- アクセス */

export function Access() {
  return (
    <section className={`cv-auto bg-surface ${SECTION}`}>
      <Container>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <Heading>お店への行き方</Heading>
            <p className={`mt-6 ${BODY}`}>
              大阪メトロ御堂筋線 中津駅1番出口から歩いて3分。阪急大阪梅田駅 茶屋町口からは10分ほどです。
            </p>
            <p className="mt-4 text-[0.92rem] leading-[2] text-ink-soft">{shop.accessDirections}</p>
            <address className="mt-5 text-[0.88rem] leading-[1.9] text-ink-soft not-italic">
              {shop.address.full}
              <br />
              TEL {shop.tel.value}（席のご予約は電話では承っていません）
            </address>
            <p className="mt-7 flex flex-wrap gap-3">
              <Link href="/access" className={BTN_SOLID}>
                地図と道順を見る
              </Link>
              <a href={shop.reservationUrl} target="_blank" rel="noopener noreferrer" className={BTN_OUTLINE}>
                ご来店予約フォーム
              </a>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <figure className="col-span-2">
              <div className="relative aspect-[2/1] overflow-hidden rounded-3xl">
                <Photo name="entrance-stairs" fill sizes="(max-width:1024px) 92vw, 46vw" className="object-cover" />
              </div>
              <figcaption className={CAPTION}>ビル入口。階段で3階へ上がります（360度カメラの写真）。</figcaption>
            </figure>
            <figure className="col-span-2 sm:col-span-1">
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
                <Photo name="chalkboard" fill sizes="(max-width:640px) 92vw, 23vw" className="object-cover" />
              </div>
              <figcaption className={CAPTION}>店頭の黒板。</figcaption>
            </figure>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* --------------------------------------------------------------- 目的別 */

export function SceneLinks() {
  return (
    <section className="cv-auto bg-paper py-16 sm:py-20">
      <Container>
        <h2 className="text-[1.1rem] font-bold text-ink">こんなときに</h2>
        <ul className="mt-5 flex flex-wrap gap-2.5">
          {SCENES.map((s) => (
            <li key={s.slug}>
              <Link href={`/scene/${s.slug}`} className={PILL}>
                {s.label}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/faq" className={PILL}>
              よくあるご質問
            </Link>
          </li>
        </ul>
      </Container>
    </section>
  );
}

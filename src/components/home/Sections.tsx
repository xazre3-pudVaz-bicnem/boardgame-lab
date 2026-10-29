import Link from 'next/link';
import Photo from '@/components/Photo';
import { Container } from '@/components/ui';
import { StaffPickNote, StaffPicksOverview } from '@/components/games/StaffPicks';
import { shop } from '@/data/shop';
import { SCENES } from '@/data/scenes';
import { newsByDate } from '@/data/news';
import { CONDITIONS } from '@/lib/games';

/*
 * トップページ。
 *
 * 「どんな場所か → スタッフが選んだゲーム → 料金と使い方 → イベント・お知らせ → 行き方」の順。
 *
 * 店舗の要望（2026-10）：「のんびりできる、おしゃれなカフェのような雰囲気に。今はビジネスのホームページに見える」。
 * Codex と検討して、次のことをやめた。
 *   - アイコン付きの情報カード、①②③の番号カード、ピル型のタグを並べること
 *   - 見出しの下の波線、背景の円、傾けた写真、影のような飾り
 *   - すべてのセクションを同じ余白・同じ形で区切ること
 * 代わりに、写真の大きさの差と、罫線で区切った文章で見せる。
 *
 * 飲食の販売はないので「カフェ」とは書かない。タイトル数も書かない（日々増えるため）。
 * 写真は顔が写っていないものだけ。イベントの開催風景の写真は無いので、イベント欄には写真を置かない。
 */

const H2 = 'text-[clamp(1.55rem,3.4vw,1.9rem)] leading-[1.45] font-bold text-ink';
const BODY = 'text-[1rem] leading-[2] text-ink-soft [word-break:auto-phrase]';
const CAPTION = 'mt-2 text-[0.78rem] text-ink-faint';
const BTN_SOLID =
  'inline-flex min-h-12 items-center rounded-full bg-cocoa px-7 text-[0.9rem] font-semibold text-white transition-colors hover:bg-cocoa-deep';
const BTN_OUTLINE =
  'inline-flex min-h-12 items-center rounded-full border border-cocoa/30 px-7 text-[0.9rem] font-semibold text-cocoa transition-colors hover:border-cocoa';

/* --------------------------------------------------------------- どんな場所か */

export function About() {
  const u = shop.pricing.unit.value;
  const c = shop.pricing.caps.value;
  const wd = shop.hours.weekday.value;
  const we = shop.hours.weekend.value;

  const info: [string, React.ReactNode][] = [
    [
      '営業時間',
      <>
        平日 {wd.open}〜{wd.close}／土日祝 {we.open}〜{we.close}
        <span className="block text-[0.82rem] text-ink-faint">
          {shop.hours.closedDays.value.join('・')}定休（祝日は営業）
        </span>
      </>,
    ],
    [
      '料金',
      <>
        1時間{u.normal}円（相席可は{u.share}円）
        <span className="block text-[0.82rem] text-ink-faint">
          1日の上限 平日{c.weekday.normal.toLocaleString()}円・土日祝{c.weekend.normal.toLocaleString()}円
        </span>
      </>,
    ],
    [
      '場所',
      <>
        中津駅1番出口から徒歩3分
        <span className="block text-[0.82rem] text-ink-faint">ビルの3階です</span>
      </>,
    ],
    [
      'ご予約',
      <>
        空席があれば予約なしでも入れます
        <span className="block text-[0.82rem]">
          <a href={shop.reservationUrl} target="_blank" rel="noopener noreferrer" className="prose-link">
            ご来店予約フォーム
          </a>
        </span>
      </>,
    ],
  ];

  return (
    <section className="bg-paper pt-10 pb-20 sm:pt-16 sm:pb-28">
      <Container size="wide">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-x-12">
          <div className="lg:col-span-5 lg:pt-6">
            <h2 className={H2}>ボドラボで過ごす時間</h2>
            <div className={`mt-6 space-y-5 ${BODY}`}>
              <p>
                BODOlab.（ボードゲームラボ、通称ボドラボ）は、中津駅のすぐ近くにあるボードゲームのプレイスペース＆ショップです。
                棚に並んだボードゲームから好きなものを選んで、テーブルで遊べます。
              </p>
              <p>ルールはスタッフが説明するので、はじめてでも大丈夫です。料金は時間制で、遊ぶゲームの数では変わりません。</p>
              <p>
                飲食物の販売はありませんが、持ち込みはできます。ふた付きの飲み物なら、遊びながらでも大丈夫です。
                気に入ったゲームは、店頭で買うこともできます。
              </p>
            </div>
          </div>
          <figure className="lg:col-span-7">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
              <Photo name="play-halligalli" fill sizes="(max-width:1024px) 92vw, 55vw" className="object-cover" />
            </div>
            <figcaption className={CAPTION}>テーブルで遊んでいるところ。</figcaption>
          </figure>
        </div>

        <div className="mt-14 grid gap-10 lg:mt-20 lg:grid-cols-12 lg:gap-x-12">
          <figure className="lg:col-span-6 lg:col-start-2">
            <div className="relative aspect-[5/4] overflow-hidden rounded-lg">
              <Photo name="room-wide" fill sizes="(max-width:1024px) 92vw, 45vw" className="object-cover" />
            </div>
            <figcaption className={CAPTION}>営業前の店内。テーブル席の奥に、ゲームの棚があります。</figcaption>
          </figure>
          <dl className="self-end border-t border-line lg:col-span-4 lg:col-start-9">
            {info.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[5rem_1fr] gap-3 border-b border-line py-4 text-[0.95rem]">
                <dt className="text-ink-faint">{k}</dt>
                <dd className="leading-[1.8] text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  );
}

/* --------------------------------------------------------------- スタッフが選んだゲーム */

export function Games() {
  return (
    <section className="cv-auto bg-surface py-16 sm:py-24">
      <Container size="wide">
        <div className="max-w-2xl">
          <h2 className={H2}>スタッフが選んだ、こんな日に遊ぶゲーム</h2>
          <StaffPickNote className="mt-3" />
        </div>

        <div className="mt-10">
          <StaffPicksOverview withPhoto />
        </div>

        <div className="mt-12 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.92rem] leading-[2] text-ink-soft">
            人数や時間から探す：
            {CONDITIONS.map((c, i) => (
              <span key={c.key}>
                {i > 0 ? '／' : ''}
                <Link href={`/games/${c.slug}`} className="prose-link">
                  {c.label}
                </Link>
              </span>
            ))}
            ／
            <Link href="/games/list" className="prose-link">
              五十音
            </Link>
          </p>
          <p className="shrink-0">
            <Link href="/games" className={BTN_OUTLINE}>
              ボードゲーム一覧へ
            </Link>
          </p>
        </div>
      </Container>
    </section>
  );
}

/* --------------------------------------------------------------- 料金とご利用 */

/** 品名 …… 値段 の1行（メニュー表の書き方。枠では囲まない） */
function MenuRow({ name, price, note }: { name: string; price: string; note?: string }) {
  return (
    <div className="menu-row py-2.5">
      <dt className="text-ink">
        {name}
        {note ? <span className="ml-1.5 text-[0.78rem] text-ink-faint">{note}</span> : null}
      </dt>
      <dd className="font-bold text-ink tabular-nums">{price}</dd>
    </div>
  );
}

export function HowAndPrice() {
  const u = shop.pricing.unit.value;
  const c = shop.pricing.caps.value;
  return (
    <section className="cv-auto bg-paper py-20 sm:py-28">
      <Container>
        <h2 className={H2}>料金とご利用について</h2>
        <div className="mt-10 grid gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-20">
          <div>
            <h3 className="text-[0.85rem] font-bold tracking-[0.06em] text-ink-soft">1時間あたり</h3>
            <dl className="mt-1 text-[1rem]">
              <MenuRow name="通常" price={`${u.normal}円`} />
              <MenuRow name="相席可" price={`${u.share}円`} />
            </dl>
            <h3 className="mt-8 text-[0.85rem] font-bold tracking-[0.06em] text-ink-soft">1日の上限（これ以上はかかりません）</h3>
            <dl className="mt-1 text-[1rem]">
              <MenuRow name="平日" price={`${c.weekday.normal.toLocaleString()}円`} />
              <MenuRow name="平日" note="相席可" price={`${c.weekday.share.toLocaleString()}円`} />
              <MenuRow name="土日祝" price={`${c.weekend.normal.toLocaleString()}円`} />
              <MenuRow name="土日祝" note="相席可" price={`${c.weekend.share.toLocaleString()}円`} />
            </dl>
            <p className="mt-6 text-[0.88rem] leading-[1.9] text-ink-soft">
              学生の方は、学生証の提示で{shop.pricing.studentDiscount.value}%引き。小学生は半額、未就学児は無料です（中学生以下は保護者の方とご一緒に）。
            </p>
          </div>

          <div className={`space-y-5 ${BODY}`}>
            <p>
              空席があれば、予約なしで入れます。確実に席を取りたいときや人数が多いときは、ご来店予約フォームからどうぞ。
            </p>
            <p>
              受付では、何人で遊ぶか、ボードゲームが初めてかどうか、どれくらいいる予定か、1人の場合は相席を希望するかを伝えてください。
              遊ぶゲームが決まったら、スタッフがルールを説明します。
            </p>
            <p>お会計は帰るときに、利用した時間のぶんだけです。お席の利用時間の保証は5時間までです。</p>
            <p className="flex flex-wrap gap-3 pt-3">
              <a href={shop.reservationUrl} target="_blank" rel="noopener noreferrer" className={BTN_SOLID}>
                ご来店予約フォーム
              </a>
              <Link href="/system" className={BTN_OUTLINE}>
                料金・ご利用案内
              </Link>
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* --------------------------------------------------------------- イベント・お知らせ */

export function Events() {
  const ev = shop.testPlayEvent.value;
  const news = newsByDate().slice(0, 3);
  return (
    <section className="cv-auto bg-paper-2 py-16 sm:py-24">
      <Container>
        <div className="grid gap-14 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-20">
          <div>
            <p className="text-[0.85rem] font-bold tracking-[0.06em] text-ink-soft">毎月のイベント</p>
            <h2 className={`mt-2 ${H2}`}>{ev.name}</h2>
            <p className={`mt-5 ${BODY}`}>
              自作のボードゲームを持ち寄って、テストプレイをする会です。作っている人も、遊んでみたい人も参加できます。
            </p>
            <dl className="mt-6 border-t border-ink/15 text-[0.95rem]">
              {[
                ['開催', `${ev.schedule} ${ev.hours}`],
                ['参加費', `${ev.fee}円（${ev.feeNote}）`],
                ['申し込み', `${ev.entry}の告知ページから`],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[5.5rem_1fr] gap-3 border-b border-ink/15 py-3.5">
                  <dt className="text-ink-faint">{k}</dt>
                  <dd className="text-ink">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-[0.82rem] leading-relaxed text-ink-faint">
              {ev.scheduleNote}。開催日は変わることがあるので、最新の告知をご確認ください。
            </p>
            <p className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[0.92rem]">
              <a href={shop.links.twipla} target="_blank" rel="noopener noreferrer" className="prose-link">
                TwiPlaで開催予定を見る
              </a>
              <Link href="/schedule" className="prose-link">
                イベントについて
              </Link>
            </p>
          </div>

          <div>
            <h2 className="text-[1.2rem] font-bold text-ink">お知らせ</h2>
            <ul className="mt-4 border-t border-ink/15">
              {news.map((n) => (
                <li key={n.slug} className="border-b border-ink/15">
                  <Link
                    href={`/news/${encodeURIComponent(n.slug)}`}
                    className="flex flex-col gap-0.5 py-3.5 text-[0.95rem] hover:text-accent-ink sm:flex-row sm:gap-4"
                  >
                    <time dateTime={n.date} className="shrink-0 text-[0.85rem] text-ink-faint tabular-nums">
                      {n.date.replace(/-/g, '.')}
                    </time>
                    <span className="text-ink">{n.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[0.9rem]">
              <Link href="/news" className="prose-link">
                お知らせをもっと見る
              </Link>
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* --------------------------------------------------------------- 行き方 */

export function Access() {
  return (
    <section className="cv-auto bg-paper py-20 sm:py-28">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-16">
          <div>
            <h2 className={H2}>中津駅から徒歩3分、ビルの3階です</h2>
            <address className="mt-6 text-[1rem] leading-[2] text-ink not-italic">{shop.address.full}</address>
            <p className={`mt-4 ${BODY}`}>
              大阪メトロ御堂筋線 中津駅1番出口から徒歩3分。阪急大阪梅田駅の茶屋町口からは徒歩10分ほどです。
            </p>
            <p className="mt-4 text-[0.95rem] leading-[2] text-ink-soft">{shop.accessDirections}</p>
            <p className="mt-4 text-[0.9rem] text-ink-soft">
              TEL{' '}
              <a href={`tel:${shop.tel.value.replace(/-/g, '')}`} className="prose-link">
                {shop.tel.value}
              </a>
              （席のご予約は電話では承っていません）
            </p>
            <p className="mt-7 flex flex-wrap gap-3">
              <Link href="/access" className={BTN_SOLID}>
                地図と道順
              </Link>
              <a href={shop.reservationUrl} target="_blank" rel="noopener noreferrer" className={BTN_OUTLINE}>
                ご来店予約フォーム
              </a>
            </p>
          </div>
          <div className="grid grid-cols-5 gap-4 self-start">
            <figure className="col-span-5">
              <div className="relative aspect-[2/1] overflow-hidden rounded-lg">
                <Photo name="entrance-stairs" fill sizes="(max-width:1024px) 92vw, 40vw" className="object-cover" />
              </div>
              <figcaption className={CAPTION}>1階の入口。階段で3階へ上がります（360度カメラの写真）。</figcaption>
            </figure>
            <figure className="col-span-3">
              <div className="relative aspect-[3/2] overflow-hidden rounded-lg">
                <Photo name="chalkboard" fill sizes="(max-width:1024px) 55vw, 24vw" className="object-cover" />
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
    <section className="cv-auto border-t border-line bg-paper py-10 sm:py-12">
      <Container>
        <p className="text-[0.92rem] leading-[2.1] text-ink-soft">
          <span className="mr-2 font-bold text-ink">目的別のご案内</span>
          {SCENES.map((s, i) => (
            <span key={s.slug}>
              {i > 0 ? '／' : ''}
              <Link href={`/scene/${s.slug}`} className="prose-link">
                {s.label}
              </Link>
            </span>
          ))}
          ／
          <Link href="/faq" className="prose-link">
            よくあるご質問
          </Link>
        </p>
      </Container>
    </section>
  );
}

import Link from 'next/link';
import Photo from '@/components/Photo';
import { GameCard } from '@/components/GameCard';
import { Container } from '@/components/ui';
import { shop, hoursLine } from '@/data/shop';
import { SCENES } from '@/data/scenes';
import { newsByDate } from '@/data/news';
import { CONDITIONS, GAME_COUNT, gamesWithCondition, staffPicks } from '@/lib/games';

/*
 * トップページ。
 *
 * SEO用のセクションを並べるのではなく、「どんな場所か → 店内 → スタッフの案内 → ゲーム棚
 * → 使い方と料金 → イベント → アクセス」の順に、店を紹介する流れにしている。
 * 見出しに英語の小見出しは付けない。セクションごとに見せ方を変え、同じ型のカードを続けない。
 * 写真は何が写っているかをキャプションで正直に書く（イベント時の写真はそう書く）。
 */

const H2 = 'text-[clamp(1.35rem,3.4vw,1.9rem)] leading-[1.4] font-bold text-ink';

/* --------------------------------------------------------------- どんな場所か */

export function About() {
  const u = shop.pricing.unit.value;
  return (
    <section className="bg-paper py-16 sm:py-24">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <h2 className={H2}>BODOlab.について</h2>
            <div className="mt-5 space-y-4 text-[0.98rem] leading-[2] text-ink-soft">
              <p>
                BODOlab.（ボードゲームラボ、通称ボドラボ）は、大阪メトロ中津駅の近くにあるボードゲームのプレイスペース兼ショップです。
                棚にあるボードゲームを選んで、時間制の料金で遊べます。
              </p>
              <p>
                ルールはスタッフが説明します。遊んで気に入ったゲームは、店頭で買うこともできます。
                飲食物の販売はしていません（持ち込みは可能です）。
              </p>
            </div>
          </div>

          <dl className="self-start rounded-md border border-line bg-surface text-[0.9rem]">
            {[
              ['場所', '大阪市北区豊崎5-7-21 おおきに豊崎西公園ビル3F（中津駅1番出口から徒歩3分）'],
              ['営業', `${hoursLine()}／${shop.hours.closedDays.value.join('・')}定休（祝日は営業）`],
              ['料金', `1時間${u.normal}円（相席可は${u.share}円）、上限あり`],
              ['予約', 'ご来店予約フォームから（空席があれば予約なしでも可）'],
            ].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[4.5rem_1fr] gap-3 border-b border-line px-5 py-3.5 last:border-0">
                <dt className="text-ink-faint">{k}</dt>
                <dd className="leading-relaxed text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  );
}

/* --------------------------------------------------------------- 店内 */

export function Space() {
  return (
    <section className="cv-auto bg-surface py-16 sm:py-24">
      <Container>
        <h2 className={H2}>店内</h2>
        <p className="mt-4 max-w-2xl text-[0.95rem] leading-[1.95] text-ink-soft">
          ビルの3階です。壁沿いの白い棚にボードゲームが並び、テーブル席で遊びます。
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-12">
          <figure className="md:col-span-8">
            <div className="relative aspect-[4/3] overflow-hidden rounded-md">
              <Photo name="room-empty" fill sizes="(max-width:768px) 92vw, 62vw" className="object-cover" />
            </div>
            <figcaption className="mt-2 text-[0.78rem] text-ink-faint">営業前の店内。棚のゲームから選んで遊びます。</figcaption>
          </figure>
          <div className="grid gap-4 md:col-span-4">
            <figure>
              <div className="relative aspect-[4/3] overflow-hidden rounded-md">
                <Photo name="game-pawns" fill sizes="(max-width:768px) 92vw, 30vw" className="object-cover" />
              </div>
              <figcaption className="mt-2 text-[0.78rem] text-ink-faint">店内のテーブルで遊んでいるゲーム。</figcaption>
            </figure>
            <figure>
              <div className="relative aspect-[4/3] overflow-hidden rounded-md">
                <Photo name="game-boxes" fill sizes="(max-width:768px) 92vw, 30vw" className="object-cover" />
              </div>
              <figcaption className="mt-2 text-[0.78rem] text-ink-faint">選んだゲームはテーブルで遊びます。</figcaption>
            </figure>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* --------------------------------------------------------------- スタッフの案内 */

export function StaffGuide() {
  return (
    <section className="cv-auto bg-navy-deep py-16 text-white sm:py-24">
      <Container size="narrow">
        <h2 className="text-[clamp(1.35rem,3.4vw,1.9rem)] leading-[1.4] font-bold">ルールはスタッフが説明します</h2>
        <p className="mt-5 text-[0.98rem] leading-[2] text-white/80">
          ボードゲームを遊んだことがなくても、事前にルールを覚えてくる必要はありません。
          遊ぶゲームが決まったら、スタッフがルールを説明します。
        </p>
        <p className="mt-4 text-[0.98rem] leading-[2] text-white/80">受付で次のことを伝えていただくと、ゲームを選ぶときの参考になります。</p>
        <ul className="mt-4 space-y-2 border-l-2 border-cyan/60 pl-5 text-[0.95rem] leading-[1.9] text-white/90">
          <li>何人で遊ぶか（2人で来た、など）</li>
          <li>ボードゲームが初めてかどうか</li>
          <li>どれくらいの時間いる予定か</li>
          <li>1人の場合、相席を希望するかどうか</li>
        </ul>
      </Container>
    </section>
  );
}

/* --------------------------------------------------------------- ゲーム棚 */

export function Games() {
  const picks = staffPicks().slice(0, 6);
  return (
    <section className="cv-auto bg-paper py-16 sm:py-24">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <h2 className={H2}>ボードゲーム</h2>
            <p className="mt-4 text-[0.95rem] leading-[1.95] text-ink-soft">
              ボドゲーマの当店ページには{GAME_COUNT}
              タイトルが登録されています。取り扱いは入れ替わることがあるので、遊びたいゲームが決まっている場合は事前にお問い合わせください。
            </p>
            <p className="mt-6">
              <Link
                href="/games"
                className="inline-flex min-h-11 items-center rounded-full bg-navy px-6 text-[0.9rem] font-semibold text-white hover:bg-navy-deep"
              >
                ゲームを探す（人数・時間・ジャンル）
              </Link>
            </p>
          </div>
          <ul className="self-end divide-y divide-line border-y border-line text-[0.93rem]">
            {CONDITIONS.map((c) => (
              <li key={c.key}>
                <Link href={`/games/${c.slug}`} className="flex items-baseline justify-between gap-4 py-3.5 hover:text-cyan-ink">
                  <span>{c.heading}</span>
                  <span className="text-[0.8rem] text-ink-faint">{gamesWithCondition(c.key).length}件</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {picks.length ? (
          <div className="mt-14">
            <h3 className="text-[1.1rem] font-bold text-ink">スタッフのおすすめ</h3>
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
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
  return (
    <section className="cv-auto bg-surface py-16 sm:py-24">
      <Container>
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <h2 className={H2}>利用の流れ</h2>
            <ol className="mt-6 space-y-5 text-[0.95rem] leading-[1.9] text-ink-soft">
              <li>
                <strong className="text-ink">予約（任意）</strong>
                ：ご来店予約フォームから日時と人数を送ります。空席があれば予約なしでも入れます。
              </li>
              <li>
                <strong className="text-ink">受付</strong>：人数と、相席を希望するかどうかを伝えます。
              </li>
              <li>
                <strong className="text-ink">遊ぶ</strong>：ゲームを選ぶと、スタッフがルールを説明します。時間内なら何本遊んでも料金は同じです。
              </li>
              <li>
                <strong className="text-ink">お会計</strong>：帰るときに、利用時間ぶんをお支払いいただきます。
              </li>
            </ol>
          </div>

          <div>
            <h2 className={H2}>料金</h2>
            <table className="mt-6 w-full text-left text-[0.92rem]">
              <caption className="sr-only">プレイスペース料金</caption>
              <thead className="text-[0.75rem] text-ink-faint">
                <tr className="border-b border-line">
                  <th scope="col" className="py-2 font-medium">
                    区分
                  </th>
                  <th scope="col" className="py-2 text-right font-medium">
                    1時間
                  </th>
                  <th scope="col" className="py-2 text-right font-medium">
                    平日上限
                  </th>
                  <th scope="col" className="py-2 text-right font-medium">
                    土日祝上限
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-line">
                  <th scope="row" className="py-3 font-semibold">
                    通常
                  </th>
                  <td className="py-3 text-right tabular-nums">{u.normal}円</td>
                  <td className="py-3 text-right tabular-nums">{c.weekday.normal.toLocaleString()}円</td>
                  <td className="py-3 text-right tabular-nums">{c.weekend.normal.toLocaleString()}円</td>
                </tr>
                <tr className="border-b border-line">
                  <th scope="row" className="py-3 font-semibold">
                    相席可
                  </th>
                  <td className="py-3 text-right tabular-nums">{u.share}円</td>
                  <td className="py-3 text-right tabular-nums">{c.weekday.share.toLocaleString()}円</td>
                  <td className="py-3 text-right tabular-nums">{c.weekend.share.toLocaleString()}円</td>
                </tr>
              </tbody>
            </table>
            <p className="mt-4 text-[0.85rem] leading-[1.9] text-ink-soft">
              小学生は半額、未就学児は無料（中学生以下は保護者の方の同伴が必要）。学生証の提示で学生割引があります（割引率は店頭でご確認ください）。
              お席の利用時間の保証は5時間までです。
            </p>
            <p className="mt-3 text-[0.9rem]">
              <Link href="/system" className="prose-link">
                料金・ご利用案内の詳細
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
    <section className="cv-auto bg-paper-2 py-16 sm:py-24">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
          <figure className="order-last lg:order-first">
            <div className="relative aspect-[4/3] overflow-hidden rounded-md">
              <Photo name="game-tokens" fill sizes="(max-width:1024px) 92vw, 46vw" className="object-cover" />
            </div>
            <figcaption className="mt-2 text-[0.78rem] text-ink-faint">店内のテーブルで遊んでいる様子。</figcaption>
          </figure>
          <div>
            <h2 className={H2}>{ev.name}</h2>
            <p className="mt-4 text-[0.95rem] leading-[1.95] text-ink-soft">{ev.notes[0]}</p>
            <dl className="mt-5 text-[0.9rem]">
              {[
                ['開催', `${ev.schedule} ${ev.hours}`],
                ['参加費', `${ev.fee}円（${ev.feeNote}）`],
                ['申し込み', ev.entry],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[5rem_1fr] gap-3 border-b border-line/80 py-2.5">
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
                イベント情報
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-14 border-t border-line pt-6">
          <h3 className="text-[0.95rem] font-bold text-ink">お知らせ</h3>
          <ul className="mt-3 space-y-2 text-[0.88rem]">
            {news.map((n) => (
              <li key={n.slug} className="flex gap-4">
                <time dateTime={n.date} className="shrink-0 text-ink-faint tabular-nums">
                  {n.date.replace(/-/g, '.')}
                </time>
                <Link href={`/news/${encodeURIComponent(n.slug)}`} className="text-ink hover:text-cyan-ink">
                  {n.title}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[0.85rem]">
            <Link href="/news" className="prose-link">
              お知らせ一覧
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
    <section className="cv-auto bg-surface py-16 sm:py-24">
      <Container>
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className={H2}>アクセス</h2>
            <p className="mt-4 text-[0.95rem] leading-[1.95] text-ink-soft">
              {shop.address.full}
              <br />
              大阪メトロ御堂筋線 中津駅1番出口から徒歩3分、阪急大阪梅田駅 茶屋町口から徒歩10分。
            </p>
            <p className="mt-4 text-[0.9rem] leading-[1.9] text-ink-soft">{shop.accessDirections}</p>
            <p className="mt-4 text-[0.9rem] text-ink-soft">TEL {shop.tel.value}（席のご予約は電話では承っていません）</p>
            <p className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/access"
                className="inline-flex min-h-11 items-center rounded-full bg-navy px-6 text-[0.9rem] font-semibold text-white hover:bg-navy-deep"
              >
                地図と道順
              </Link>
              <a
                href={shop.reservationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center rounded-full border border-navy/30 px-6 text-[0.9rem] font-semibold text-navy hover:border-navy"
              >
                ご来店予約フォーム
              </a>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <figure className="col-span-2">
              <div className="relative aspect-[2/1] overflow-hidden rounded-md">
                <Photo name="entrance-stairs" fill sizes="(max-width:1024px) 92vw, 46vw" className="object-cover" />
              </div>
              <figcaption className="mt-2 text-[0.78rem] text-ink-faint">ビル入口。階段で3階へ上がります（360度カメラの写真）。</figcaption>
            </figure>
            <figure className="col-span-2 sm:col-span-1">
              <div className="relative aspect-[4/3] overflow-hidden rounded-md">
                <Photo name="chalkboard" fill sizes="(max-width:640px) 92vw, 23vw" className="object-cover" />
              </div>
              <figcaption className="mt-2 text-[0.78rem] text-ink-faint">店頭の黒板。</figcaption>
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
    <section className="cv-auto border-t border-line bg-paper py-12">
      <Container>
        <h2 className="text-[1rem] font-bold text-ink">目的別のご案内</h2>
        <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[0.92rem]">
          {SCENES.map((s) => (
            <li key={s.slug}>
              <Link href={`/scene/${s.slug}`} className="prose-link">
                {s.label}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/faq" className="prose-link">
              よくあるご質問
            </Link>
          </li>
        </ul>
      </Container>
    </section>
  );
}

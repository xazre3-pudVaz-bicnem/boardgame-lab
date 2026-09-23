import Link from 'next/link';
import Photo, { type PhotoKey } from '@/components/Photo';
import GameImage from '@/components/GameImage';
import { Container, SectionHeading, Button, Chip, Eyebrow } from '@/components/ui';
import { shop, hoursLine } from '@/data/shop';
import type { Game } from '@/lib/games';

/*
 * トップページの各セクション。
 *
 * 並びは page.tsx。背景と見せ方をセクションごとに変えて、同じ型のカードが続かないようにしている。
 *   HERO（写真・暗）→ ABOUT（明・写真＋問答）→ WHY（白・写真と文の互い違い）→ PHOTO BAND（写真・暗）
 *   → GAME COLLECTION（紺）→ HOW TO（明・4段）→ SCENE（白・写真カード）→ SYSTEM（明2・表）
 *   → NEWS（白）→ ACCESS（明・写真）→ FAQ（白）→ CTA（紺・写真）
 */

/* --------------------------------------------------------------- 小さな飾り */

/** サイコロの目。手順の番号に使う。1〜6 */
function DieFace({ n, className = '' }: { n: 1 | 2 | 3 | 4 | 5 | 6; className?: string }) {
  const pips: Record<number, [number, number][]> = {
    1: [[12, 12]],
    2: [[7, 7], [17, 17]],
    3: [[7, 7], [12, 12], [17, 17]],
    4: [[7, 7], [17, 7], [7, 17], [17, 17]],
    5: [[7, 7], [17, 7], [12, 12], [7, 17], [17, 17]],
    6: [[7, 6], [17, 6], [7, 12], [17, 12], [7, 18], [17, 18]],
  };
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <rect x="1.5" y="1.5" width="21" height="21" rx="5" fill="currentColor" opacity="0.12" />
      <rect x="1.5" y="1.5" width="21" height="21" rx="5" fill="none" stroke="currentColor" strokeWidth="1.4" />
      {pips[n].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="2" fill="currentColor" />
      ))}
    </svg>
  );
}

/** ミープル（人型のコマ）。見出しの脇にひとつだけ置く。 */
function Meeple({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M12 2.5a3.2 3.2 0 0 1 3.2 3.2c0 1.2-.6 2.2-1.5 2.8l3.9 2.3c1.3.8 2.2 1.7 2.2 3.2v.7c0 .6-.5 1-1 1h-3.4l1 4.6c.1.6-.3 1.2-1 1.2h-2.1l-1.3-4.7L10 21.5H7.9c-.7 0-1.1-.6-1-1.2l1-4.6H4.5c-.6 0-1-.5-1-1v-.7c0-1.5.9-2.4 2.2-3.2l3.9-2.3A3.3 3.3 0 0 1 8.8 5.7 3.2 3.2 0 0 1 12 2.5Z" />
    </svg>
  );
}

/* --------------------------------------------------------------- ABOUT */

/** 来たことがない人が最初に気にすること。短く答えて、詳しくは各ページへ。 */
const FIRST_QUESTIONS = [
  {
    q: 'ボードゲームを知らなくても楽しめる？',
    a: 'はい。ルールはその場でスタッフが説明します。人生ゲームしか知らなくても大丈夫です。',
    href: '/scene/first-time',
  },
  {
    q: '2人で行っても楽しめる？',
    a: '2人から成立するゲームが439タイトル。読み合いが濃くなる2人用の定番も揃っています。',
    href: '/games/for-two',
  },
  {
    q: '1人で行っても遊べる？',
    a: 'おひとりのご来店は珍しくありません。相席可を選べば、その日いらした方と同じ卓で遊べます。',
    href: '/scene/solo',
  },
  {
    q: 'どんな雰囲気？',
    a: '木のテーブルと壁一面の棚。夜は仕事帰りの2〜3人、休日は昼からグループで賑わいます。',
    href: '/access',
  },
] as const;

export function About({ gameCount }: { gameCount: number }) {
  return (
    <section id="about" className="cv-auto section-y bg-paper">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-start lg:gap-20">
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
                <p>
                  BODOlab.（ボドラボ）は、大阪市北区豊崎にあるボードゲームのプレイスペース＆ショップです。
                  棚から好きなゲームを取り出して、時間いっぱい遊べます。飲食物の販売はしていない、遊ぶための場所です。
                </p>
              }
            />

            <dl className="mt-10 divide-y divide-line border-y border-line">
              {FIRST_QUESTIONS.map((f) => (
                <div key={f.q} className="py-4">
                  <dt className="flex items-start gap-2.5 text-[0.95rem] font-semibold text-ink">
                    <span aria-hidden="true" className="display mt-0.5 text-[0.8rem] text-cyan-ink">
                      Q
                    </span>
                    {f.q}
                  </dt>
                  <dd className="text-pretty mt-1.5 pl-6 text-[0.85rem] leading-[1.9] text-ink-soft">
                    {f.a}{' '}
                    <Link href={f.href} className="prose-link whitespace-nowrap">
                      詳しく →
                    </Link>
                  </dd>
                </div>
              ))}
            </dl>

            <dl className="mt-10 grid grid-cols-4 gap-x-4 gap-y-6">
              {[
                { t: `${gameCount}`, s: '種類', u: '' },
                { t: '600', s: '円／時間', u: '¥' },
                { t: '3', s: '分／中津駅', u: '' },
                { t: '10', s: '分／梅田', u: '' },
              ].map((d) => (
                <div key={d.s}>
                  <dt className="sr-only">{d.s}</dt>
                  <dd>
                    <span className="display block text-[clamp(1.5rem,4vw,2rem)] leading-none font-bold text-navy">
                      <span className="align-top text-[0.6em] text-cyan">{d.u}</span>
                      {d.t}
                    </span>
                    <span className="mt-1.5 block text-[0.72rem] text-ink-faint">{d.s}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:sticky lg:top-24" data-reveal data-reveal-delay="120">
            <div className="relative col-span-2 aspect-[16/10] overflow-hidden rounded-2xl">
              <Photo name="room-daytime-wide" fill sizes="(max-width:1024px) 92vw, 46vw" className="object-cover" />
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

const reasons: { no: string; title: string; body: string; photo: PhotoKey; link: { href: string; label: string } }[] = [
  {
    no: '01',
    title: 'ルールは、スタッフが説明します',
    body: '遊びたいゲームを選んだら、スタッフがその場でルールを説明します。説明書を読む時間も、誰かが先に覚えてくる必要もありません。全員が初めてのテーブルでも、そのまま始められます。',
    photo: 'table-standing',
    link: { href: '/scene/first-time', label: 'はじめての方へ' },
  },
  {
    no: '02',
    title: '棚から自由に、何本でも',
    body: '料金は時間制なので、遊ぶ本数に制限はありません。短いゲームを何本も試すのも、重量級を1本じっくり遊ぶのも自由です。合わなければ、途中で別の棚に戻ってきてください。',
    photo: 'room-empty',
    link: { href: '/games', label: `${shop.gameCount.listed.value}タイトルを見る` },
  },
  {
    no: '03',
    title: '1人でも、相席で輪に入れる',
    body: '相席ありを選ぶと、その日いらっしゃった他のお客様と一緒に遊べます。料金も1時間500円になります。ボードゲームは初対面でも会話が生まれる遊びなので、1人でのご来店も珍しくありません。',
    photo: 'floor-evening',
    link: { href: '/scene/solo', label: '1人で来るときのこと' },
  },
  {
    no: '04',
    title: '気に入ったら、そのまま買って帰れる',
    body: '当店はショップも兼ねています。遊んで気に入ったゲームは店頭でご購入いただけます。取り置き（最大1週間）やお取り寄せにも対応。3点で10%、4点以上で15%引きです。',
    photo: 'game-boxes',
    link: { href: '/system', label: '販売について' },
  },
];

export function Why() {
  return (
    <section id="why" className="cv-auto section-y bg-surface">
      <Container>
        <div className="flex items-start gap-3">
          <Meeple className="mt-1 h-6 w-6 shrink-0 text-cyan" />
          <SectionHeading
            eyebrow="Why BODOlab."
            title="はじめてでも、ひとりでも、手ぶらで来てください。"
            lead="608種類が並んでいても、選び方がわからなければ意味がありません。BODOlab.がやっているのは、遊ぶまでのハードルをできるだけ低くすることです。"
          />
        </div>

        {/* 写真と文章を左右交互に。カードの繰り返しにしない */}
        <div className="mt-12 space-y-12 sm:mt-20 sm:space-y-20">
          {reasons.map((r, i) => (
            <article
              key={r.no}
              data-reveal
              className={`grid items-center gap-6 sm:gap-10 lg:grid-cols-12 lg:gap-14 ${
                i % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''
              }`}
            >
              <div className="group relative aspect-[16/10] overflow-hidden rounded-2xl sm:aspect-[4/3] lg:col-span-7">
                <Photo
                  name={r.photo}
                  fill
                  sizes="(max-width:1024px) 92vw, 54vw"
                  className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
                />
              </div>
              <div className="lg:col-span-5">
                <span className="display text-[0.72rem] font-semibold tracking-[0.22em] text-cyan-ink">{r.no}</span>
                <h3 className="display text-balance mt-3 text-[clamp(1.25rem,2.6vw,1.6rem)] leading-[1.4] font-semibold text-ink">
                  {r.title}
                </h3>
                <p className="text-pretty mt-4 text-[0.9rem] leading-[2] text-ink-soft">{r.body}</p>
                <Link
                  href={r.link.href}
                  className="group/link mt-5 inline-flex items-center gap-1.5 text-[0.85rem] font-medium text-navy transition-colors hover:text-cyan-ink"
                >
                  {r.link.label}
                  <span aria-hidden="true" className="transition-transform duration-300 group-hover/link:translate-x-1">
                    →
                  </span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* --------------------------------------------------------------- PHOTO BAND */

/** 文字を減らして写真だけで見せる帯。セクションの単調さを断ち切る役目。 */
export function PhotoBand() {
  return (
    <section className="cv-auto relative isolate overflow-hidden bg-navy-deep">
      <div className="absolute inset-0 -z-10">
        <Photo name="pano-a" fill sizes="100vw" quality={70} className="object-cover object-[center_60%]" />
      </div>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-deep/80 via-navy-deep/35 to-navy-deep/20" />
      <Container className="flex min-h-[38svh] items-end py-12 sm:min-h-[54svh] sm:py-20">
        <div data-reveal className="max-w-xl">
          <p className="eyebrow text-cyan">The Space</p>
          <p className="display text-balance mt-3 text-[clamp(1.5rem,3.8vw,2.4rem)] leading-[1.35] font-semibold text-white">
            壁一面の棚から、
            <br />
            今日の一本を。
          </p>
          <p className="mt-4 text-[0.88rem] leading-[1.9] text-white/75">
            木のテーブルと、手の届く高さに並んだ{shop.gameCount.listed.value}タイトル。棚の前で決めても、決めてから来ても。
          </p>
        </div>
      </Container>
    </section>
  );
}

/* --------------------------------------------------------------- GAME COLLECTION */

export type MoodTile = { key: string; label: string; en: string; href: string; photo: PhotoKey };

export function GameCollection({
  moods,
  groups,
  total,
}: {
  moods: MoodTile[];
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

        {/* 目的から選ぶ。ゲーム名を知らない人の入口 */}
        {/* スマホは横に流す（2列3段だと画面1つぶん使ってしまう）。PCは6列 */}
        <ul
          className="hide-scrollbar mt-10 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 sm:mt-12 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible lg:grid-cols-6"
          data-reveal
        >
          {moods.map((m) => (
            <li key={m.key} className="w-[38vw] shrink-0 snap-start sm:w-auto">
              <Link
                href={m.href}
                className="group relative block aspect-[4/5] overflow-hidden rounded-xl sm:aspect-[3/4]"
              >
                <Photo
                  name={m.photo}
                  fill
                  sizes="(max-width:640px) 46vw, (max-width:1024px) 30vw, 15vw"
                  className="object-cover opacity-70 transition-all duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105 group-hover:opacity-85"
                />
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-4">
                  <span className="display block text-[0.55rem] tracking-[0.22em] text-cyan uppercase">{m.en}</span>
                  <span className="display mt-1 block text-[0.95rem] leading-snug font-semibold">{m.label}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-16 space-y-14">
          {groups.map((g, gi) => (
            <div key={g.key} data-reveal data-reveal-delay={gi * 70}>
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h3 className="display text-[1.05rem] font-semibold text-white">{g.label}</h3>
                <Link
                  href={g.href}
                  className="group/more text-[0.78rem] text-cyan transition-colors hover:text-white"
                  aria-label={`${g.label}のゲームをすべて見る`}
                >
                  すべて見る{' '}
                  <span aria-hidden="true" className="inline-block transition-transform duration-300 group-hover/more:translate-x-1">
                    →
                  </span>
                </Link>
              </div>
              <p className="mt-1.5 text-[0.8rem] text-white/55">{g.caption}</p>

              {/* スマホは横スクロール、PCはグリッド */}
              <ul className="hide-scrollbar mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible lg:grid-cols-6">
                {g.games.map((game) => (
                  <li key={game.slug} className="w-[38vw] shrink-0 snap-start sm:w-auto">
                    <Link href={`/games/${game.slug}`} className="group block">
                      <div className="overflow-hidden rounded-xl">
                        <GameImage
                          slug={game.slug}
                          name={game.nameJa}
                          nameEn={game.nameEn}
                          genre={game.genre}
                          className="transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
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

const enjoySteps: { n: 1 | 2 | 3 | 4; t: string; d: string }[] = [
  { n: 1, t: '予約して来店', d: 'ご来店予約フォームから日時と人数を送信。当日空いていれば、そのままのご来店も歓迎です。' },
  { n: 2, t: 'やりたいことを伝える', d: '「2人でじっくり」「初めて」「大人数で盛り上がりたい」。それに合うゲームをスタッフが出します。' },
  { n: 3, t: 'ルール説明を聞いて遊ぶ', d: '説明は5〜15分ほど。終わったら別のゲームへ。時間内なら何本遊んでも料金は変わりません。' },
  { n: 4, t: '会計は帰るときに', d: '1時間600円、上限は平日2,500円・土日祝3,000円。気に入ったゲームは購入もできます。' },
];

export function HowToEnjoy() {
  return (
    <section id="how" className="cv-auto section-y bg-paper">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6" data-reveal>
          <SectionHeading eyebrow="How to enjoy" title="来てから帰るまで、4ステップ。" lead="予約から会計までの流れです。むずかしい準備はひとつもありません。" />
          <div className="flex flex-wrap gap-3">
            <Button href={shop.reservationUrl} variant="solid" external>
              ご来店予約フォームへ
            </Button>
            <Button href="/system" variant="outline">
              料金・利用案内
            </Button>
          </div>
        </div>

        <ol className="mt-10 grid grid-cols-2 gap-3 sm:mt-12 sm:gap-4 lg:grid-cols-4" data-reveal data-reveal-delay="100">
          {enjoySteps.map((s, i) => (
            <li key={s.n} className="relative rounded-2xl border border-line bg-surface p-4 sm:p-6">
              <DieFace n={s.n} className="h-8 w-8 text-navy sm:h-9 sm:w-9" />
              <h3 className="mt-3 text-[0.92rem] font-semibold text-ink sm:mt-4 sm:text-[1rem]">{s.t}</h3>
              <p className="text-pretty mt-2 text-[0.8rem] leading-[1.85] text-ink-soft sm:text-[0.84rem] sm:leading-[1.9]">{s.d}</p>
              {i < enjoySteps.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute top-1/2 -right-3 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-paper text-[0.7rem] text-ink-faint lg:flex"
                >
                  →
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

/* --------------------------------------------------------------- SCENE */

export type SceneCard = { href: string; label: string; en: string; body: string; photo: PhotoKey };

/** 先頭1枚を大きく、残りをグリッドに。9ページのうち6つを見せ、残りは /scene へ。 */
export function SceneGrid({ scenes, more }: { scenes: SceneCard[]; more: { href: string; label: string }[] }) {
  const [featured, ...rest] = scenes;
  return (
    <section id="scene" className="cv-auto section-y bg-surface">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Scene"
            title="雨の日も、デートも、仕事帰りも。"
            lead="「ボードゲームがしたい」以外の理由で来ていただいて大丈夫です。目的から探せるガイドを用意しました。"
          />
          <Link href="/scene" className="prose-link shrink-0 text-[0.85rem]">
            すべての目的を見る →
          </Link>
        </div>

        <div className="mt-12 grid gap-4 sm:gap-5 lg:grid-cols-3">
          {featured ? (
            <Link
              href={featured.href}
              data-reveal
              className="group relative block overflow-hidden rounded-2xl bg-navy-deep text-white lg:col-span-2 lg:row-span-2"
            >
              <div className="absolute inset-0">
                <Photo
                  name={featured.photo}
                  fill
                  sizes="(max-width:1024px) 92vw, 62vw"
                  className="object-cover opacity-60 transition-all duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-105 group-hover:opacity-50"
                />
              </div>
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/55 to-transparent" />
              <div className="relative flex min-h-[18rem] flex-col justify-end p-6 sm:min-h-[22rem] sm:p-8 lg:min-h-full">
                <span className="display text-[0.6rem] tracking-[0.24em] text-cyan uppercase">{featured.en}</span>
                <h3 className="display text-balance mt-2 text-[clamp(1.25rem,2.6vw,1.7rem)] leading-snug font-semibold">
                  {featured.label}
                </h3>
                <p className="text-pretty mt-2 max-w-md text-[0.85rem] leading-[1.85] text-white/75">{featured.body}</p>
              </div>
            </Link>
          ) : null}

          {rest.map((s, i) => (
            <Link
              key={s.href}
              href={s.href}
              data-reveal
              data-reveal-delay={(i + 1) * 60}
              className="group relative block overflow-hidden rounded-2xl bg-navy-deep text-white"
            >
              <div className="absolute inset-0">
                <Photo
                  name={s.photo}
                  fill
                  sizes="(max-width:640px) 92vw, (max-width:1024px) 46vw, 31vw"
                  className="object-cover opacity-55 transition-all duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-105 group-hover:opacity-45"
                />
              </div>
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/55 to-transparent" />
              <div className="relative flex min-h-[9.5rem] flex-col justify-end p-5 sm:min-h-[13rem]">
                <span className="display text-[0.55rem] tracking-[0.24em] text-cyan uppercase">{s.en}</span>
                <h3 className="display mt-1.5 text-[1rem] leading-snug font-semibold">{s.label}</h3>
                <p className="text-pretty mt-1.5 line-clamp-2 text-[0.78rem] leading-[1.8] text-white/70 sm:line-clamp-none">
                  {s.body}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {more.length ? (
          <ul className="mt-6 flex flex-wrap gap-2.5" data-reveal>
            {more.map((m) => (
              <li key={m.href}>
                <Link
                  href={m.href}
                  className="inline-flex min-h-10 items-center rounded-full border border-line bg-paper px-4 py-2 text-[0.82rem] text-ink-soft transition-colors hover:border-navy/40 hover:text-ink"
                >
                  {m.label}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
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

          <div className="rounded-2xl border border-line bg-surface p-6 sm:p-9" data-reveal data-reveal-delay="120">
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
    <section id="access" className="cv-auto section-y bg-paper">
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
                アクセスの詳細・地図
              </Button>
              <Button href={shop.reservationUrl} variant="outline" external>
                ご来店予約
              </Button>
            </div>
          </div>

          <div data-reveal data-reveal-delay="120">
            {/* 入口の写真を大きく。はじめて来る人が迷わないための一枚 */}
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
              <Photo name="entrance-stairs" fill sizes="(max-width:1024px) 92vw, 46vw" className="object-cover" />
              <span className="absolute bottom-3 left-3 rounded-full bg-navy-deep/80 px-3 py-1 text-[0.7rem] text-white backdrop-blur">
                ビル3階への入口
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <Photo name="chalkboard" fill sizes="(max-width:1024px) 45vw, 23vw" className="object-cover" />
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
          空席があれば、ご予約なしでもご利用いただけます。
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Button href={shop.reservationUrl} variant="amber" external>
            ご来店予約フォーム
          </Button>
          <Button href="/system" variant="outline" className="border-white/30 text-white hover:border-white hover:bg-white/10">
            料金・利用案内を見る
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

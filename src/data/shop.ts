/**
 * BODOlab. の店舗情報。サイト全体で参照する唯一の情報源。
 *
 * `verified: true`  … 公式サイト・店頭掲示物・店舗提供写真のいずれかで裏が取れた情報。
 * `verified: false` … 出典によって食い違いがあり、店舗確認待ちの情報。画面には出さない。
 *
 * 出典の略号
 *   official  : https://www.boardgame-lab.com/ （旧公式サイト）
 *   faq-image : 旧公式サイト /system に掲示されていたQ&A画像
 *   poster    : 料金・営業時間ポスター（旧公式サイト /system 掲示 ＋ 店舗提供写真 _24.jpg）
 *   chalk     : 店舗提供写真の店頭黒板（assets-src ... _41.jpg）
 *   bodoge    : https://bodoge.hoobby.net/spaces/boardgame-lab
 *   reserve   : 予約サイト（下記 reservationUrl）
 *   line      : 公式LINEのプロフィール https://page.line.me/pmb9803r
 *   news      : 旧公式サイトのお知らせ記事（掲示画像を読み取ったもの。日付を併記する）
 */

export type Verified<T> = { value: T; verified: boolean; source: string; note?: string };

const v = <T,>(value: T, source: string): Verified<T> => ({ value, verified: true, source });
const unverified = <T,>(value: T, source: string, note: string): Verified<T> => ({
  value,
  verified: false,
  source,
  note,
});

export const shop = {
  name: 'BODOlab.',
  nameJa: 'ボードゲームラボ',
  nickname: 'ボドラボ',
  legalNote: 'ボードゲームラボDDT',
  tagline: 'ボードゲームが遊べる場所',
  chalkboardCopy: '友達ができる場所',
  type: 'ボードゲームプレイスペース＆ショップ',
  /** 飲食物の提供・販売はしていない。カフェではない。 */
  servesFood: false,

  address: {
    postalCode: '531-0072',
    region: '大阪府',
    city: '大阪市北区',
    street: '豊崎5-7-21 おおきに豊崎西公園ビル3F',
    full: '〒531-0072 大阪府大阪市北区豊崎5-7-21 おおきに豊崎西公園ビル3F',
    /** ビル位置。Googleマップの埋め込み・LocalBusiness Schema 用。 */
    geo: { lat: 34.7095, lng: 135.4956 },
    geoVerified: false,
  },

  tel: v('06-6131-9606', 'official / reserve'),
  telNote: '電話・FAXの共用番号。席の予約は電話では受け付けていない。',
  /** ボドゲーマの店舗ページにだけ載っている携帯番号。用途が不明なため画面には出さない。 */
  telAlt: unverified(
    '090-6557-9811',
    'bodoge',
    '旧公式サイトには記載がなく、代表番号との使い分けが不明。店舗確認まで掲載しない。',
  ),

  access: [
    { station: '大阪メトロ御堂筋線 中津駅', exit: '1番出口', minutes: 3, source: 'official' },
    { station: '阪急 大阪梅田駅', exit: '茶屋町口', minutes: 10, source: 'official' },
  ],
  accessDirections:
    '中津駅1番出口を出て左後ろへ。河合塾を左手に見ながら直進し、公園の角を左折。緑色の看板の整骨院が入ったビルの3階です。',

  hours: {
    weekday: v({ open: '18:30', close: '23:30' }, 'official / poster / chalk'),
    weekend: v({ open: '13:00', close: '23:30' }, 'official / chalk'),
    weekendNote: '土日祝',
    /**
     * 月曜定休は、旧公式サイトのフッター・/access・/system のQ&A画像・ボドゲーマの
     * 4か所で一致している。2024年9月1日のお知らせだけが「月・火曜」としているが、
     * これは同年秋の改装・店長交代より前の告知のため、現行の表記を採る。
     */
    closedDays: v(['月曜日'], 'official / faq-image / bodoge'),
    closedDaysNote: '祝日の場合は営業します。',
    /**
     * ノーゲスト時の早仕舞い。旧公式サイトの営業時間欄は20時、公式LINE・Q&A画像は21時と食い違っていたが、
     * 店舗から「21時で」と回答があった（2026-10-02）。
     */
    earlyClose: v('21:00', 'store 2026-10-02 / line / faq-image'),
    earlyCloseNote: '21:00の時点でお客様がいらっしゃらない場合は、閉店させていただくことがあります。',
    changeNote: '営業時間・定休日は変更になる場合があります。ご来店前に公式Instagramでご確認ください。',
  },

  pricing: {
    unit: v({ label: '1時間', normal: 600, share: 500 }, 'poster / faq-image'),
    caps: v(
      {
        weekday: { normal: 2500, share: 2000 },
        weekend: { normal: 3000, share: 2500 },
      },
      'poster / faq-image',
    ),
    guaranteedHours: v(5, 'faq-image'),
    guaranteedHoursNote:
      'ご利用時間の保証は5時間まで。保証時間を過ぎてお待ちのお客様がいる場合は、お席をお譲りいただくことがあります。',
    kids: v(
      [
        { label: '小学生', rule: '半額' },
        { label: '未就学児', rule: '無料' },
      ],
      'official /system',
    ),
    /**
     * 学生割引（%）。旧公式サイトのQ&A画像（20%）と本文（10%）で食い違っていたが、
     * 店舗から「20%」と回答があった（2026-10-05）。学生証の提示が必要。
     */
    studentDiscount: v(20, 'store 2026-10-05 / faq-image'),
    shopDiscount: v(
      [
        { label: '3点購入', rule: '10%引き' },
        { label: '4点以上購入', rule: '15%引き' },
      ],
      'faq-image',
    ),
    averageBudget: v('2,000円前後', 'bodoge'),
    /** 2023年2月の料金表では「プレイスペースの貸切利用も可能」と案内されている。 */
    privateHire: v('プレイスペースの貸切利用も承ります。詳しくはスタッフまでお声がけください。', 'news 2023-02-01'),
  },

  /**
   * 取り扱いタイトルについて。
   * タイトル数は日々増えるので、サイトには数を書かない（店舗の指示、2026-10-02）。
   * 以前は「608タイトル」（ボドゲーマの登録数）を出していた。
   */
  gameCount: {
    /**
     * 入れ替えがあること自体は公式Q&Aにも書かれているので画面に出す。
     * 「毎月1000種類以上の中から厳選」という具体的な運用は公式Q&A画像に書かれているが、
     * 現在もその運用かは確認できていないため、数字は出さない（下の unverified に記録）。
     */
    rotationNote: '取り扱いタイトルは入れ替わることがあります。',
    rotationClaim: unverified(
      '毎月1000種類以上の中から厳選して入れ替え',
      'faq-image',
      '旧公式サイト /system のQ&A画像（A4）に記載。現在の運用かどうか店舗に要確認。確認が取れるまで画面には出さない。',
    ),
  },

  /** 店舗が定期開催しているイベント。開催有無は変わるため、告知は店舗のTwiPlaを見てもらう。 */
  /**
   * テストプレイ会「ボドラボテスプ塾」。出典は TwiPla の告知（2026-09-27 確認）。
   * 開催曜日は 2026年7月まで「毎月最終木曜」、2026年8月の第19回から「毎月最終火曜」に変わっている
   * （第20回の告知本文に「毎月最終火曜日へと変更になりました」とある）。
   * 開催日は変わりうるので、サイトでは必ず TwiPla の最新告知へ案内する。
   */
  testPlayEvent: v(
    {
      name: 'ボドラボテスプ塾（テストプレイ会）',
      schedule: '毎月最終火曜日',
      scheduleNote: '2026年8月から最終火曜日に変更（それ以前は最終木曜日）',
      hours: '18:30〜23:30（途中参加可）',
      fee: 500,
      feeNote: '時間に関係なく500円',
      entry: 'TwiPla',
      notes: [
        '自作ボードゲームのテストプレイ会兼交流会です。制作者でなくても参加できます。',
        'イベント中は店内常設のボードゲームは使えません。',
        '前日の時点で参加者が2人以下の場合は中止になることがあります。',
      ],
    },
    'twipla 2026-09',
  ),

  /** 支払い方法。公式LINEのプロフィールに記載（2026-09-27 確認）。 */
  payments: v(
    ['現金', 'クレジットカード（Visa・Mastercard・JCB・Diners・American Express）', 'QRコード決済（PayPay・楽天ペイ・d払い・au PAY）', '電子マネー'],
    'line',
  ),

  /** ボードゲーム販売について。 */
  shopService: v(
    [
      '店頭または公式LINEからボードゲームをご購入いただけます。',
      '取り置き（最大1週間）・お取り寄せも承ります。',
      '3点ご購入で10%引き、4点以上のご購入で15%引きになります。',
    ],
    'faq-image',
  ),

  rules: {
    food: [
      '店内での飲食物の販売は行っていません。',
      'お客様による飲食物の持ち込みは可能です。',
      'ボードゲームのプレイ中のお食事はご遠慮ください。',
      '蓋の付いたお飲み物はプレイ中もお飲みいただけます。',
    ],
    minors: '中学生以下のお子様のご利用には、成人の保護者の方の同伴が必要です。',
    cancel:
      'ご予約の変更・キャンセルは、ご来店予定時刻までにお電話または公式LINEでご連絡ください。30分以上の遅刻は無断キャンセル扱いとなり、ご予約が取り消される場合があります。',
  },

  reservationUrl: 'https://fantastic-semolina-c3a2d8.netlify.app/%E4%BA%88%E7%B4%84',
  reservationNote:
    '席のご予約はご来店予約フォームからのみ受け付けています。お問い合わせフォーム・メール・お電話では受け付けていません。',

  links: {
    instagram: 'https://www.instagram.com/bodo_lab_/',
    /**
     * 現在使われているのは @BODOlab_（ボドゲーマの店舗ページ・TwiPla の主催者アカウントが同じ）。
     * 旧アカウント @BOARDGAMELabDDT は使わない。
     */
    x: 'https://x.com/BODOlab_',
    twipla: 'https://twipla.jp/users/BODOlab_',
    bodoge: 'https://bodoge.hoobby.net/spaces/boardgame-lab',
    bodogeGames: 'https://bodoge.hoobby.net/spaces/boardgame-lab/games',
    /** 公式LINE（ベーシックID @pmb9803r、アカウント名 BODOlab.）。2026-09-27 確認。 */
    line: 'https://page.line.me/pmb9803r' as string | null,
    /**
     * Googleビジネスプロフィールの共有URL。Googleマップの自動取得は規約上行わないため、
     * オーナー管理画面の「プロフィールを共有」「クチコミを依頼」のURLを店舗からもらって設定する。
     */
    googleBusiness: null as string | null,
    /** アルバイト応募フォーム（旧サイトは編集用URLを掲載していたため viewform に直した）。 */
    jobForm: 'https://docs.google.com/forms/d/e/1FAIpQLScrPzSO9if3yyyruiCEwsySqR8oaO7e9SS-OXoD8IUa18ixWg/viewform',
  },

  /** 店舗が公表している開店時期。2024年10月のスタッフブログで「12月で8周年」。 */
  openedYear: 2016,
} as const;

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.boardgame-lab.com';
/**
 * 本番ドメインが設定されているときだけ canonical / OG / sitemap を出し、robots で index を許可する。
 *
 * NODE_ENV での判定はしない。Vercel はプレビューでも NODE_ENV=production でビルドするため、
 * それを条件にすると *.vercel.app が index, follow で公開されてしまう（実際に起きた）。
 * 本番に切り替えるときは NEXT_PUBLIC_SITE_URL=https://www.boardgame-lab.com を環境変数に入れる。
 */
export const SITE_URL_CONFIGURED = Boolean(process.env.NEXT_PUBLIC_SITE_URL);

export const abs = (path: string) => `${SITE_URL.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;

/** 「平日18:30-23:30 / 土日祝13:00-23:30」のような表示用文字列。 */
export const hoursLine = () => {
  const wd = shop.hours.weekday.value;
  const we = shop.hours.weekend.value;
  return `平日 ${wd.open}–${wd.close} ／ 土日祝 ${we.open}–${we.close}`;
};

export const priceLine = () => {
  const u = shop.pricing.unit.value;
  const c = shop.pricing.caps.value;
  return `1時間 ${u.normal}円（相席 ${u.share}円）／ 上限 平日 ${c.weekday.normal}円・土日祝 ${c.weekend.normal}円`;
};

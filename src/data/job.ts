/**
 * アルバイト募集要項。旧公式サイト /part-timejob の記載をそのまま引き継いでいる。
 *
 * `status` が 'open' のときだけ JobPosting 構造化データを出す。
 * 募集を終了したら 'closed' にすれば、画面の表示と構造化データが同時に切り替わる。
 * 条件が1つでも欠けている状態で JobPosting を出さないよう、isJobPostingReady で確かめる。
 */

export type JobStatus = 'open' | 'closed';

export const job = {
  status: 'open' as JobStatus,
  /** 旧サイトに掲載されていた内容を確認した日。 */
  confirmedOn: '2026-09-20',
  title: 'ボードゲームプレイスペースのホールスタッフ（アルバイト）',
  employmentType: 'アルバイト',
  /** 旧サイトの表記。法人名の表記ゆれをそのまま残す。 */
  workplaceName: 'BOARDGAME Lab DDT（中津駅より徒歩3分）',
  duties: ['受付業務', '清掃', '販売接客', 'イベント運営等'],
  /** 勤務時間。旧サイトの募集要項とお知らせ記事で表記が揃っている。 */
  shift: {
    frequency: '月1〜週1程度',
    hours: '土日祝 11:45〜22:15',
    note: '閉店時間変更に伴う早上がりあり',
  },
  wage: {
    amount: 1200,
    unit: '時給',
    trial: 1064,
    trialNote: '試用期間中',
    transport: '交通費全額支給',
  },
  benefits: ['非番時の店舗利用無料', '商品購入時の社員割引あり'],
  flow: [
    '応募フォームの内容を一次審査とします。',
    '一次審査を通過した方にのみご連絡いたします。',
    '通過された方には、二次審査（店舗での面接）の日程調整のメールをお送りします。',
  ],
  idealFor: [
    'TRPG・マーダーミステリー・ボードゲームが大好きな方',
    '人におすすめを紹介するのが楽しい方',
    '面白いイベントを企画するのが好きな方',
    '人と会話するのが好きな方',
    '他にお仕事をされている方、学校に通われている方',
  ],
  lead: [
    '履歴書は不要です。下記フォームより必要事項をご入力・送信いただくことで、24時間いつでもご応募いただけます。',
    'ボードゲームが好きな方、TRPGが好きな方、マーダーミステリーが好きな方。ぜひ趣味を職業にしませんか。副業も大歓迎です。',
  ],
} as const;

/** JobPosting を出してよいかどうか。条件が欠けていたら出さない。 */
export function isJobPostingReady() {
  return (
    job.status === 'open' &&
    Boolean(job.title) &&
    job.duties.length > 0 &&
    Boolean(job.shift.hours) &&
    Boolean(job.wage.amount) &&
    Boolean(job.workplaceName)
  );
}

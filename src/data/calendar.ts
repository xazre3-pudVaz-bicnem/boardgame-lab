import type { PhotoKey } from '@/components/Photo';

/**
 * 月ごとの営業カレンダー（店舗が毎月作っている画像と、その中身）。
 *
 * 出典：店舗スタッフからのLINE（2026-11-11）で届いた「2026年11月」のカレンダー画像。
 * 画像の文字をそのまま書き写している。イベントの内容・参加費・申し込み方法はカレンダーに無いので、ここにも書かない。
 *
 * 翌月のカレンダーが届いたら：
 *   1. 画像を assets-src/ に置き、scripts/build-photos.mjs の CALENDARS に足して `node scripts/build-photos.mjs`
 *   2. 下の CALENDAR を書き換える（month・image・closed・events・notes）
 *
 * 月が終わったカレンダーは表示しない（currentCalendar が null を返す）。
 * これを使うページ（トップ・/schedule）は1時間ごとに作り直す設定（revalidate = 3600）にしてあるので、
 * 月が変わってから1時間以内に表示が切り替わる。
 */

export type CalendarEvent = {
  /** 日（1〜31） */
  day: number;
  /** 開始時刻（カレンダーの表記のまま） */
  time: string;
  title: string;
  /** カレンダーに書かれている補足（「予約不可」など） */
  note?: string;
  /** このサイトに詳しい説明があるとき */
  href?: string;
};

export type MonthCalendar = {
  /** 'YYYY-MM' */
  month: string;
  /** public/photos のカレンダー画像（photos.json のキー） */
  image: PhotoKey;
  /** 定休日（日） */
  closed: number[];
  events: CalendarEvent[];
  /** カレンダーの凡例など */
  notes: string[];
  source: string;
};

export const CALENDAR: MonthCalendar = {
  month: '2026-11',
  image: 'calendar-2026-11',
  closed: [2, 9, 16, 30],
  events: [
    { day: 5, time: '19:00', title: '世界三大ボドゲ会' },
    { day: 6, time: '19:00', title: '金曜ボドゲ会' },
    { day: 12, time: '19:00', title: '世界三大ボドゲ会' },
    { day: 13, time: '19:00', title: '金曜ボドゲ会' },
    { day: 15, time: '13:00', title: 'ボドゲ女子会' },
    { day: 19, time: '19:00', title: '世界三大ボドゲ会' },
    { day: 20, time: '19:00', title: '金曜ボドゲ会' },
    { day: 22, time: '10:00', title: 'ボドゲ大会', note: 'この日は予約不可' },
    { day: 24, time: '18:30', title: 'テストプレイ会', href: '/schedule#test-play' },
    { day: 26, time: '19:00', title: '世界三大ボドゲ会' },
    { day: 27, time: '19:00', title: '金曜ボドゲ会' },
    { day: 28, time: '19:00', title: '正体隠匿会' },
    { day: 29, time: '10:00', title: '重ゲー会' },
  ],
  notes: ['カレンダーで色の付いた日は、土日祝の料金です。', '「休」の日は定休日です。'],
  source: '店舗スタッフからのLINE（2026-11-11）',
};

const WEEKDAY = ['日', '月', '火', '水', '木', '金', '土'];

/** 'YYYY-MM' と日から曜日（日〜土） */
export const weekdayOf = (month: string, day: number) => {
  const [y, m] = month.split('-').map(Number);
  return WEEKDAY[new Date(Date.UTC(y, m - 1, day)).getUTCDay()];
};

/** '2026-11' → '2026年11月' / '11月' */
export const monthLabel = (month: string, withYear = true) => {
  const [y, m] = month.split('-').map(Number);
  return withYear ? `${y}年${m}月` : `${m}月`;
};

/**
 * 表示してよいカレンダー。月が終わっていたら null。
 * 日付は日本時間で判定する（Vercel のビルドは UTC で動くため）。
 */
export function currentCalendar(now: Date = new Date()): MonthCalendar | null {
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const ym = `${jst.getUTCFullYear()}-${String(jst.getUTCMonth() + 1).padStart(2, '0')}`;
  return CALENDAR.month >= ym ? CALENDAR : null;
}

/**
 * 同じ名前の会をまとめる（毎週の会を1行で見せるため）。
 * 例：世界三大ボドゲ会 → 木曜 19:00〜（5・12・19・26日）
 * カレンダーに書かれた日だけを並べる。「毎週」とは書かない（翌月も続くかは分からないため）。
 */
export function groupedEvents(cal: MonthCalendar) {
  const map = new Map<
    string,
    { title: string; time: string; href?: string; days: number[]; weekdays: Set<string>; notes: { day: number; text: string }[] }
  >();
  for (const e of cal.events) {
    const key = `${e.title}|${e.time}`;
    const g = map.get(key) ?? { title: e.title, time: e.time, href: e.href, days: [], weekdays: new Set<string>(), notes: [] };
    g.days.push(e.day);
    g.weekdays.add(weekdayOf(cal.month, e.day));
    if (e.note) g.notes.push({ day: e.day, text: e.note });
    map.set(key, g);
  }
  return [...map.values()]
    .map((g) => ({ ...g, weekday: g.weekdays.size === 1 ? [...g.weekdays][0] : null }))
    .sort((a, b) => b.days.length - a.days.length || a.days[0] - b.days[0]);
}

import Link from 'next/link';
import { type MonthCalendar, groupedEvents, monthLabel, weekdayOf } from '@/data/calendar';

/*
 * 月ごとの営業カレンダー（src/data/calendar.ts）の中身を、文字で見せる。
 * 画像だけだと読み上げや検索で中身が伝わらないので、同じ内容を行で並べる。
 * カレンダーに書かれていないこと（内容・参加費・申し込み方法）は書かない。
 */

const days = (list: number[]) => `${list.join('・')}日`;

/** 同じ会をまとめた予定の一覧 */
export function MonthEventList({ cal, className = '' }: { cal: MonthCalendar; className?: string }) {
  const groups = groupedEvents(cal);
  return (
    <ul className={`border-t border-ink/15 ${className}`}>
      {groups.map((g) => {
        const repeated = g.days.length > 1;
        const when = repeated
          ? `${g.weekday ? `${g.weekday}曜` : ''} ${g.time}〜`
          : `${g.days[0]}日（${weekdayOf(cal.month, g.days[0])}）${g.time}〜`;
        return (
          <li key={`${g.title}-${g.time}`} className="grid gap-x-5 gap-y-0.5 border-b border-ink/15 py-3.5 sm:grid-cols-[9.5rem_1fr]">
            <span className="text-[0.92rem] text-ink-soft tabular-nums">{when}</span>
            <span className="text-[0.98rem]">
              {g.href ? (
                <Link href={g.href} className="font-bold text-ink underline decoration-line underline-offset-4 hover:text-accent-ink">
                  {g.title}
                </Link>
              ) : (
                <span className="font-bold text-ink">{g.title}</span>
              )}
              {repeated ? <span className="ml-2 text-[0.85rem] text-ink-faint">{days(g.days)}</span> : null}
              {g.notes.length ? (
                <span className="ml-2 text-[0.85rem] text-accent-ink">
                  {/* 1日だけの会は日付がすでに左にあるので、補足だけを出す */}
                  {g.notes.map((n) => (repeated ? `${n.day}日：${n.text}` : n.text)).join('／')}
                </span>
              ) : null}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/** 定休日の1行 */
export function ClosedDays({ cal, className = '' }: { cal: MonthCalendar; className?: string }) {
  if (!cal.closed.length) return null;
  const wds = new Set(cal.closed.map((d) => weekdayOf(cal.month, d)));
  return (
    <p className={`text-[0.9rem] text-ink-soft ${className}`}>
      {monthLabel(cal.month, false)}の定休日：{days(cal.closed)}
      {wds.size === 1 ? `（${[...wds][0]}曜）` : ''}
    </p>
  );
}

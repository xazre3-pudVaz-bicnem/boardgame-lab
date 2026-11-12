'use server';

import { headers } from 'next/headers';
import { z } from 'zod';
import { shop } from '@/data/shop';
import { contactConfig } from '@/lib/contact';
import { CATEGORIES, type ContactField, type ContactState } from './shared';

/**
 * お問い合わせフォームの送信。Resend のAPIで、店舗のアドレスへメールを送る。
 *
 * 送信先が未設定のうちはフォーム自体を画面に出さない（page.tsx）。設定は lib/contact.ts。
 * 返信は、届いたメールにそのまま返せばお客様に届く（reply_to にお客様のアドレスを入れている）。
 */

const schema = z.object({
  name: z.string().trim().min(1, 'お名前をご入力ください。').max(80, 'お名前が長すぎます。'),
  email: z.string().trim().email('メールアドレスの形式をご確認ください。').max(200, 'メールアドレスが長すぎます。'),
  tel: z
    .string()
    .trim()
    .max(20, '電話番号の形式をご確認ください。')
    .refine((v) => v === '' || /^[0-9+\-() ]{8,20}$/.test(v), '電話番号の形式をご確認ください。'),
  category: z.enum(CATEGORIES, { message: 'お問い合わせの種類を選んでください。' }),
  message: z
    .string()
    .trim()
    .min(10, 'お問い合わせ内容を10文字以上でご入力ください。')
    .max(2000, 'お問い合わせ内容は2000文字以内でご入力ください。'),
});

const FIELDS: ContactField[] = ['name', 'email', 'tel', 'category', 'message'];

/** 件名に入れる値から改行などを除く */
const oneLine = (s: string) => s.replace(/[\r\n\t]+/g, ' ').trim();

/** フォーム以外の連絡先（送れなかったときの案内に使う） */
const others = () => `お電話（${shop.tel.value}）・公式LINE・InstagramのDM`;

/*
 * 続けての送信を止める（スパムで受信箱や Resend の送信枠を使い切られないように）。
 *   - 同じ送信元（IP）からは、10分に5通まで
 *   - 全体でも、10分に20通まで（このお店への問い合わせとしては十分に多い数）
 * サーバーのメモリで数えるだけなので、Vercel のインスタンスをまたぐと数え直しになる（効き目はベストエフォート）。
 * それでも足りなくなったら、Vercel Firewall のレート制限か Cloudflare Turnstile を足す。
 */
const WINDOW_MS = 10 * 60 * 1000;
const sent = new Map<string, number[]>();

function overLimit(key: string, max: number, now: number) {
  const recent = (sent.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  sent.set(key, recent);
  return recent.length >= max;
}

function record(keys: string[], now: number) {
  for (const k of keys) {
    const list = sent.get(k);
    if (list) list.push(now);
    else sent.set(k, [now]);
  }
  // 古い記録を掃除して、メモリが増え続けないようにする
  if (sent.size > 500) for (const [k, v] of sent) if (!v.some((t) => now - t < WINDOW_MS)) sent.delete(k);
}

async function clientIp() {
  const h = await headers();
  return h.get('x-real-ip') ?? h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
}

export async function sendContact(prev: ContactState, formData: FormData): Promise<ContactState> {
  const attempt = prev.attempt + 1;
  const str = (k: string) => {
    const v = formData.get(k);
    return typeof v === 'string' ? v : '';
  };

  // 人には見えない欄に入力がある＝自動送信。送らずに、成功したように見せる。
  if (str('website')) return { ok: true, message: '送信しました。', attempt };

  const values = Object.fromEntries(FIELDS.map((k) => [k, str(k)])) as Record<ContactField, string>;

  const parsed = schema.safeParse(values);
  if (!parsed.success) {
    const errors: ContactState['errors'] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as ContactField;
      if (key && !errors[key]) errors[key] = issue.message;
    }
    return { ok: false, message: 'ご入力内容をご確認ください。', errors, values, attempt };
  }

  const config = contactConfig();
  if (!config) {
    return { ok: false, message: `ただいまフォームからの送信を受け付けられません。お手数ですが、${others()}からご連絡ください。`, values, attempt };
  }

  const now = Date.now();
  const ipKey = `ip:${await clientIp()}`;
  if (overLimit(ipKey, 5, now) || overLimit('all', 20, now)) {
    return {
      ok: false,
      message: `短い時間に続けて送信されたため、受け付けを止めています。時間をおいてお試しください。お急ぎの場合は、${others()}からご連絡ください。`,
      values,
      attempt,
    };
  }
  record([ipKey, 'all'], now);

  const d = parsed.data;
  const received = new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());

  const text = [
    `${shop.name} のサイトのお問い合わせフォームから届きました。`,
    'このメールに返信すると、お客様のメールアドレス宛てに送られます。',
    '',
    `受付日時: ${received}（日本時間）`,
    `お名前: ${d.name}`,
    `メール: ${d.email}`,
    `電話: ${d.tel || '（未入力）'}`,
    `種類: ${d.category}`,
    '',
    '― お問い合わせ内容 ―',
    d.message,
  ].join('\n');

  let failure: string | null = null;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${config.apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from: config.from,
        to: [config.to],
        reply_to: d.email,
        subject: `[${shop.name} お問い合わせ] ${d.category}／${oneLine(d.name)} 様`,
        text,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      /*
       * 原因の切り分け用に、ステータスと Resend のエラーの種類（name。例：validation_error）だけを残す。
       * 応答の本文（message）にはメールアドレスが入ることがあるので、ログには出さない。
       */
      let kind = '';
      try {
        const j = (await res.json()) as { name?: unknown };
        if (typeof j.name === 'string' && /^[a-z_]{1,40}$/.test(j.name)) kind = j.name;
      } catch {
        // 本文が JSON でなければ、種類は残さない
      }
      failure = `Resend responded ${res.status}${kind ? ` (${kind})` : ''}`;
    }
  } catch (e) {
    // 通信エラー・タイムアウト。エラーの種類だけを残す
    failure = `request failed (${e instanceof Error ? e.name : 'unknown'})`;
  }
  if (failure) {
    console.error(`contact: ${failure}`);
    return { ok: false, message: `送信に失敗しました。お手数ですが、${others()}からご連絡ください。`, values, attempt };
  }

  return {
    ok: true,
    message: 'お問い合わせを受け付けました。内容を確認のうえ、折り返しご連絡いたします。',
    attempt,
  };
}

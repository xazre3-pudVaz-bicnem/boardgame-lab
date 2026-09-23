'use server';

import { z } from 'zod';
import { shop } from '@/data/shop';

/**
 * お問い合わせフォームの送信。
 *
 * 送信先が未設定のうちはフォーム自体を画面に出さない（page.tsx の CONTACT_ENABLED）。
 * 動かないフォームを置かないための作りなので、ここでは env が揃っている前提で書いている。
 *
 * 必要な環境変数
 *   RESEND_API_KEY    … Resend のAPIキー
 *   CONTACT_TO_EMAIL  … 受信するメールアドレス（店舗のアドレス）
 *   CONTACT_FROM_EMAIL… 送信元（Resendで認証済みのドメインのアドレス）
 */

const schema = z.object({
  name: z.string().trim().min(1, 'お名前をご入力ください。').max(80, 'お名前が長すぎます。'),
  email: z.string().trim().email('メールアドレスの形式をご確認ください。').max(200),
  tel: z
    .string()
    .trim()
    .max(20)
    .refine((v) => v === '' || /^[0-9+\-() ]{8,20}$/.test(v), '電話番号の形式をご確認ください。'),
  category: z.enum(['在庫確認・お取り置き', '貸切・団体利用のご相談', 'メディア関連', 'その他のご質問']),
  message: z.string().trim().min(10, 'お問い合わせ内容を10文字以上でご入力ください。').max(2000),
  /** 入力されていたら機械的な送信とみなす隠しフィールド */
  website: z.string().max(0).optional(),
});

export type ContactState = {
  ok: boolean;
  /** フォーム全体のメッセージ */
  message?: string;
  /** 項目ごとのエラー */
  errors?: Partial<Record<keyof z.infer<typeof schema>, string>>;
  /**
   * 入力値の控え。React 19 の form action は送信のたびに入力を初期化するので、
   * defaultValue に戻すためにここへ持ち帰る。
   */
  values?: Record<string, string>;
  /** 再描画を強制するためのカウンタ（key に使う） */
  attempt: number;
};

export const emptyContactState: ContactState = { ok: false, attempt: 0 };

export async function sendContact(prev: ContactState, formData: FormData): Promise<ContactState> {
  const raw = Object.fromEntries(formData.entries()) as Record<string, string>;
  const attempt = prev.attempt + 1;
  const values = {
    name: raw.name ?? '',
    email: raw.email ?? '',
    tel: raw.tel ?? '',
    category: raw.category ?? '',
    message: raw.message ?? '',
  };

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const errors: ContactState['errors'] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof z.infer<typeof schema>;
      if (key && !errors[key]) errors[key] = issue.message;
    }
    return { ok: false, message: 'ご入力内容をご確認ください。', errors, values, attempt };
  }

  // 隠しフィールドに入力がある＝自動送信。静かに成功扱いにする。
  if (parsed.data.website) return { ok: true, message: '送信しました。', attempt };

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !to || !from) {
    return {
      ok: false,
      message: `ただいまフォームからの送信を受け付けられません。お手数ですが、お電話（${shop.tel.value}）またはInstagramのDMからご連絡ください。`,
      values,
      attempt,
    };
  }

  const d = parsed.data;
  const body = [
    `お名前: ${d.name}`,
    `メール: ${d.email}`,
    `電話: ${d.tel || '（未入力）'}`,
    `種別: ${d.category}`,
    '',
    d.message,
  ].join('\n');

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: d.email,
        subject: `[${shop.name} お問い合わせ] ${d.category} / ${d.name} 様`,
        text: body,
      }),
    });
    if (!res.ok) throw new Error(`resend ${res.status}`);
  } catch {
    return {
      ok: false,
      message: `送信に失敗しました。お手数ですが、お電話（${shop.tel.value}）またはInstagramのDMからご連絡ください。`,
      values,
      attempt,
    };
  }

  return {
    ok: true,
    message: 'お問い合わせを受け付けました。内容を確認のうえ、折り返しご連絡いたします。',
    attempt,
  };
}

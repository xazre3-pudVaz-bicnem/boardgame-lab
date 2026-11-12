/**
 * お問い合わせフォームの送信設定。サーバー側（contact/page.tsx と contact/actions.ts）だけで読む。
 *
 * 環境変数（Vercel の Environment Variables に入れる。アドレスもキーもリポジトリには書かない）
 *   RESEND_API_KEY     … Resend のAPIキー（必須）
 *   CONTACT_TO_EMAIL   … 問い合わせを受け取るアドレス。店舗の指定は 2026-11-12 のLINE（必須）
 *   CONTACT_FROM_EMAIL … 送信元（任意）。未設定なら Resend の共用アドレス onboarding@resend.dev から送る。
 *
 * 共用アドレスから送れるのは「Resend のアカウントに登録したメールアドレス」宛てだけ。
 * なので、DNS を触らずに始めるときは、受信先（店舗のアドレス）で Resend のアカウントを作る。
 * boardgame-lab.com を Resend で認証したら（DNS にレコードを足す必要がある）、
 * CONTACT_FROM_EMAIL をそのドメインのアドレスにする。
 *
 * APIキーと受信先が揃っていないうちは、フォームを画面に出さない（動かないフォームを置かない）。
 */

const DEFAULT_FROM = '"BODOlab. お問い合わせフォーム" <onboarding@resend.dev>';

export type ContactConfig = { apiKey: string; to: string; from: string };

export function contactConfig(): ContactConfig | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.CONTACT_TO_EMAIL?.trim();
  if (!apiKey || !to) return null;
  return { apiKey, to, from: process.env.CONTACT_FROM_EMAIL?.trim() || DEFAULT_FROM };
}

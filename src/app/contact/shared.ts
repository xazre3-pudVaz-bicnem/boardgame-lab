/**
 * お問い合わせフォームの、画面（ContactForm.tsx）と送信処理（actions.ts）で共用するもの。
 * 'use server' のファイルからは async 関数しか書き出せないので、定数と型はここに置く。
 */

/** お問い合わせの種類。並びはフォームの選択肢の順。 */
export const CATEGORIES = [
  '在庫確認・お取り置き・お取り寄せ',
  '貸切・団体利用のご相談',
  'メディア関連',
  'その他のご質問',
] as const;

export type ContactField = 'name' | 'email' | 'tel' | 'category' | 'message';

export type ContactState = {
  ok: boolean;
  /** フォーム全体のメッセージ */
  message?: string;
  /** 項目ごとのエラー */
  errors?: Partial<Record<ContactField, string>>;
  /**
   * 入力値の控え。React 19 の form action は送信のたびに入力を初期化するので、
   * defaultValue に戻すためにここへ持ち帰る。
   */
  values?: Partial<Record<ContactField, string>>;
  /** 再描画を強制するためのカウンタ（key に使う） */
  attempt: number;
};

export const emptyContactState: ContactState = { ok: false, attempt: 0 };

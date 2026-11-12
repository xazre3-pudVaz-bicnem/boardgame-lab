'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { sendContact } from './actions';
import { CATEGORIES, type ContactField, emptyContactState } from './shared';

const field =
  'w-full rounded-lg border border-line bg-white px-4 py-3 text-[1rem] text-ink transition-colors placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25 aria-[invalid=true]:border-[#b3261e]';
const labelCls = 'mb-2 block text-[0.85rem] font-medium text-ink';
const Required = () => (
  <span className="ml-1 text-[0.75rem] font-normal text-[#b3261e]">
    必須
  </span>
);

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-12 rounded-full bg-cocoa px-9 py-3.5 text-[0.95rem] font-semibold text-white transition-colors hover:bg-cocoa-deep disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? '送信しています…' : '送信する'}
    </button>
  );
}

function FieldError({ id, children }: { id: string; children?: string }) {
  if (!children) return null;
  return (
    <p id={id} className="mt-1.5 text-[0.8rem] text-[#b3261e]">
      {children}
    </p>
  );
}

const FIELD_ORDER: ContactField[] = ['name', 'email', 'tel', 'category', 'message'];

export default function ContactForm() {
  const [state, action] = useActionState(sendContact, emptyContactState);
  const v = state.values ?? {};
  const err = state.errors ?? {};
  /** エラーのある欄には aria-invalid と、エラー文への aria-describedby を付ける */
  const a11y = (k: ContactField) =>
    err[k] ? { 'aria-invalid': true as const, 'aria-describedby': `${k}-error` } : {};

  /*
   * 送信のあと、結果が目に入る位置へ動かす。
   * 送信ボタンはフォームの一番下なので、そのままだと（特にスマホでは）
   * 完了の表示や、上のほうの欄のエラーが画面の外に出てしまう。
   */
  const doneRef = useRef<HTMLDivElement>(null);
  const alertRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (state.attempt === 0) return;
    if (state.ok) {
      doneRef.current?.focus({ preventScroll: true });
      doneRef.current?.scrollIntoView({ block: 'center' });
      return;
    }
    const first = FIELD_ORDER.find((k) => state.errors?.[k]);
    if (first) document.getElementById(first)?.focus();
    else alertRef.current?.scrollIntoView({ block: 'center' });
  }, [state]);

  if (state.ok) {
    return (
      <div
        ref={doneRef}
        tabIndex={-1}
        role="status"
        className="rounded-lg border border-accent/35 bg-accent-wash p-8 text-center outline-none"
      >
        <p className="text-[1.1rem] font-bold text-cocoa">送信が完了しました</p>
        <p className="mt-3 text-[0.92rem] leading-[1.9] text-ink-soft">{state.message}</p>
      </div>
    );
  }

  return (
    // key に attempt を入れて、送信のたびに defaultValue を入れ直す
    <form key={state.attempt} action={action} className="space-y-6" noValidate>
      {state.message ? (
        <p
          ref={alertRef}
          role="alert"
          className="rounded-lg border border-amber/40 bg-amber-wash px-4 py-3 text-[0.85rem] text-amber-ink"
        >
          {state.message}
        </p>
      ) : null}

      <div>
        <label htmlFor="name" className={labelCls}>
          お名前
          <Required />
        </label>
        <input id="name" name="name" defaultValue={v.name} required autoComplete="name" className={field} {...a11y('name')} />
        <FieldError id="name-error">{err.name}</FieldError>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className={labelCls}>
            メールアドレス
            <Required />
          </label>
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            defaultValue={v.email}
            required
            autoComplete="email"
            className={field}
            {...a11y('email')}
          />
          <FieldError id="email-error">{err.email}</FieldError>
        </div>
        <div>
          <label htmlFor="tel" className={labelCls}>
            電話番号<span className="ml-1 text-[0.75rem] font-normal text-ink-faint">（任意）</span>
          </label>
          <input
            id="tel"
            name="tel"
            type="tel"
            inputMode="tel"
            defaultValue={v.tel}
            autoComplete="tel"
            className={field}
            {...a11y('tel')}
          />
          <FieldError id="tel-error">{err.tel}</FieldError>
        </div>
      </div>

      <div>
        <label htmlFor="category" className={labelCls}>
          お問い合わせの種類
          <Required />
        </label>
        <select id="category" name="category" defaultValue={v.category || CATEGORIES[0]} className={field} {...a11y('category')}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <FieldError id="category-error">{err.category}</FieldError>
      </div>

      <div>
        <label htmlFor="message" className={labelCls}>
          お問い合わせ内容
          <Required />
        </label>
        <textarea id="message" name="message" rows={7} defaultValue={v.message} required className={field} {...a11y('message')} />
        <FieldError id="message-error">{err.message}</FieldError>
      </div>

      {/* 自動送信よけ。人には見えない。 */}
      <div aria-hidden="true" className="absolute h-px w-px overflow-hidden opacity-0">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="space-y-4 border-t border-line pt-6">
        <p className="text-[0.82rem] leading-[1.9] text-ink-soft">
          ご入力いただいた内容は、お問い合わせへのお返事のためだけに使います。お席のご予約は、このフォームでは承っていません。
        </p>
        <Submit />
      </div>
    </form>
  );
}

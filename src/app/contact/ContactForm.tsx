'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { emptyContactState, sendContact } from './actions';

const CATEGORIES = ['在庫確認・お取り置き', '貸切・団体利用のご相談', 'メディア関連', 'その他のご質問'] as const;

const field =
  'w-full rounded-2xl border border-line bg-white px-4 py-3 text-[0.9rem] text-ink transition-colors placeholder:text-ink-faint focus:border-caramel focus:outline-none focus:ring-2 focus:ring-caramel/25';

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="ease-out-expo min-h-11 rounded-full bg-cocoa px-8 py-3.5 text-[0.9rem] font-semibold text-white shadow-[0_2px_14px_rgba(75,56,45,0.22)] transition-all duration-300 hover:bg-cocoa-deep disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? '送信中…' : '送信する'}
    </button>
  );
}

function Error({ children }: { children?: string }) {
  if (!children) return null;
  return (
    <p role="alert" className="mt-1.5 text-[0.78rem] text-[#b3261e]">
      {children}
    </p>
  );
}

export default function ContactForm() {
  const [state, action] = useActionState(sendContact, emptyContactState);
  const v = state.values ?? {};

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-caramel/35 bg-caramel-wash p-8 text-center">
        <p className="display text-[1.1rem] text-cocoa">送信が完了しました</p>
        <p className="mt-3 text-[0.88rem] leading-[1.9] text-ink-soft">{state.message}</p>
      </div>
    );
  }

  return (
    // key に attempt を入れて、送信のたびに defaultValue を入れ直す
    <form key={state.attempt} action={action} className="space-y-6" noValidate>
      {state.message ? (
        <p role="alert" className="rounded-2xl border border-amber/40 bg-amber-wash px-4 py-3 text-[0.82rem] text-amber-ink">
          {state.message}
        </p>
      ) : null}

      <div>
        <label htmlFor="name" className="mb-2 block text-[0.82rem] font-medium text-ink">
          お名前 <span className="text-[#b3261e]">*</span>
        </label>
        <input id="name" name="name" defaultValue={v.name} required autoComplete="name" className={field} />
        <Error>{state.errors?.name}</Error>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="mb-2 block text-[0.82rem] font-medium text-ink">
            メールアドレス <span className="text-[#b3261e]">*</span>
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
          />
          <Error>{state.errors?.email}</Error>
        </div>
        <div>
          <label htmlFor="tel" className="mb-2 block text-[0.82rem] font-medium text-ink">
            電話番号<span className="ml-1 text-[0.72rem] text-ink-faint">（任意）</span>
          </label>
          <input
            id="tel"
            name="tel"
            type="tel"
            inputMode="tel"
            defaultValue={v.tel}
            autoComplete="tel"
            className={field}
          />
          <Error>{state.errors?.tel}</Error>
        </div>
      </div>

      <div>
        <label htmlFor="category" className="mb-2 block text-[0.82rem] font-medium text-ink">
          お問い合わせの種類 <span className="text-[#b3261e]">*</span>
        </label>
        <select id="category" name="category" defaultValue={v.category || CATEGORIES[0]} className={field}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <Error>{state.errors?.category}</Error>
      </div>

      <div>
        <label htmlFor="message" className="mb-2 block text-[0.82rem] font-medium text-ink">
          お問い合わせ内容 <span className="text-[#b3261e]">*</span>
        </label>
        <textarea id="message" name="message" rows={7} defaultValue={v.message} required className={field} />
        <Error>{state.errors?.message}</Error>
      </div>

      {/* 自動送信よけ。人には見えない。 */}
      <div aria-hidden="true" className="absolute h-px w-px overflow-hidden opacity-0">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <Submit />
    </form>
  );
}

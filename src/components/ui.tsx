import Link from 'next/link';
import type { ReactNode } from 'react';

export function Container({
  children,
  className = '',
  size = 'default',
}: {
  children: ReactNode;
  className?: string;
  size?: 'default' | 'wide' | 'narrow';
}) {
  const max = size === 'wide' ? 'max-w-[92rem]' : size === 'narrow' ? 'max-w-[46rem]' : 'max-w-[76rem]';
  return <div className={`${max} container-x mx-auto w-full ${className}`}>{children}</div>;
}

export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`eyebrow ${className}`}>{children}</p>;
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = 'left',
  as: Tag = 'h2',
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: 'left' | 'center';
  as?: 'h1' | 'h2' | 'h3';
}) {
  return (
    <div className={`max-w-3xl ${align === 'center' ? 'mx-auto text-center' : ''}`}>
      {eyebrow ? <Eyebrow className="mb-4">{eyebrow}</Eyebrow> : null}
      <Tag className="display text-balance text-[clamp(1.6rem,4.2vw,2.6rem)] leading-[1.35] text-ink">{title}</Tag>
      {lead ? <div className="text-pretty mt-5 text-[0.975rem] leading-[1.95] text-ink-soft">{lead}</div> : null}
    </div>
  );
}

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: 'solid' | 'outline' | 'ghost' | 'amber';
  className?: string;
  external?: boolean;
  ariaLabel?: string;
};

export function Button({ href, children, variant = 'solid', className = '', external, ariaLabel }: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[0.9rem] font-semibold tracking-wide transition-all duration-300 ease-[var(--ease-out-expo)] min-h-11';
  const styles = {
    solid: 'bg-navy text-white hover:bg-navy-deep hover:-translate-y-0.5 shadow-[0_2px_14px_rgba(0,56,112,0.22)]',
    amber: 'bg-amber text-ink hover:brightness-95 hover:-translate-y-0.5 shadow-[0_2px_14px_rgba(240,152,0,0.3)]',
    outline: 'border border-navy/25 text-navy hover:border-navy hover:bg-navy/5',
    ghost: 'text-navy hover:text-cyan-ink underline underline-offset-4 px-0 py-1',
  }[variant];
  const cls = `${base} ${styles} ${className}`;

  if (external || href.startsWith('http') || href.startsWith('tel:') || href.startsWith('mailto:')) {
    return (
      <a
        href={href}
        className={cls}
        aria-label={ariaLabel}
        {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}

/** ラベル付きのメタ情報チップ（人数・時間・ジャンルなど） */
export function Chip({
  children,
  tone = 'plain',
  className = '',
}: {
  children: ReactNode;
  tone?: 'plain' | 'cyan' | 'amber' | 'navy';
  className?: string;
}) {
  const tones = {
    plain: 'bg-paper-2 text-ink-soft',
    cyan: 'bg-cyan-wash text-cyan-ink',
    amber: 'bg-amber-wash text-amber-ink',
    navy: 'bg-navy text-white',
  }[tone];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.72rem] leading-none font-medium whitespace-nowrap ${tones} ${className}`}
    >
      {children}
    </span>
  );
}

export function Breadcrumbs({
  items,
  tone = 'dark-text',
}: {
  items: { name: string; href?: string }[];
  /** 写真の上に置くときは 'light-text'。暗い背景で薄いグレーだと読めないため。 */
  tone?: 'dark-text' | 'light-text';
}) {
  const light = tone === 'light-text';
  return (
    <nav aria-label="パンくずリスト" className={`text-[0.75rem] ${light ? 'text-white/70' : 'text-ink-faint'}`}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((it, i) => (
          <li key={`${it.name}-${i}`} className="flex items-center gap-2">
            {i > 0 && (
              <span aria-hidden="true" className={light ? 'text-white/35' : 'text-line'}>
                ／
              </span>
            )}
            {it.href ? (
              <Link
                href={it.href}
                className={`inline-block py-1.5 transition-colors ${light ? 'hover:text-white' : 'hover:text-cyan-ink'}`}
              >
                {it.name}
              </Link>
            ) : (
              <span aria-current="page" className={light ? 'text-white/90' : 'text-ink-soft'}>
                {it.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** ページ上部の見出しブロック（下層ページ共通） */
export function PageHeader({
  eyebrow,
  title,
  lead,
  breadcrumbs,
}: {
  eyebrow: string;
  title: string;
  lead?: ReactNode;
  breadcrumbs: { name: string; href?: string }[];
}) {
  return (
    <header className="border-b border-line bg-surface pt-28 pb-12 sm:pt-32 sm:pb-16">
      <Container>
        <Breadcrumbs items={breadcrumbs} />
        <div className="mt-6">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="display text-balance mt-3 text-[clamp(1.75rem,5vw,3rem)] leading-[1.3] text-ink">{title}</h1>
          {lead ? (
            <div className="text-pretty mt-5 max-w-2xl text-[0.975rem] leading-[1.95] text-ink-soft">{lead}</div>
          ) : null}
        </div>
      </Container>
    </header>
  );
}

/** 未確認情報であることを明示する注記 */
export function ConfirmNote({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-amber/40 bg-amber-wash px-4 py-3 text-[0.8rem] leading-relaxed text-amber-ink">
      {children}
    </p>
  );
}

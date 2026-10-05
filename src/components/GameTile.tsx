/**
 * ゲームのサムネイル。
 *
 * 出版社やボドゲーマのパッケージ画像は利用許諾が取れていないため転載せず、
 * ゲーム名とジャンルからその場で組み立てたインラインSVGを表示する。
 * 画像リクエストが増えず、どのサイズでも破綻しないので一覧の表示も速い。
 */

type Props = {
  slug: string;
  name: string;
  nameEn?: string | null;
  genre: string;
  className?: string;
  /** 詳細ページのヘッダーなど、大きく出すとき */
  large?: boolean;
};

/** slug から決まる 0..1 の値。色と模様の選択に使う（毎回同じ結果になる） */
function hash01(s: string, salt = 0) {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

/*
 * 焙煎した豆・キャラメル・ハーブ・陶器のような、落ち着いた色でそろえた配色。
 * どれも白文字が十分読める暗さに収めている。
 */
const PALETTES = [
  { from: '#4b382d', to: '#6a5244', ink: '#ffffff', accent: '#e9c9a0' },
  { from: '#34261e', to: '#5a4234', ink: '#ffffff', accent: '#f0b15a' },
  { from: '#7d4f24', to: '#a87238', ink: '#ffffff', accent: '#ffe6c2' },
  { from: '#3f5241', to: '#5f7a5a', ink: '#ffffff', accent: '#d6e6c8' },
  { from: '#2f4a5c', to: '#4f7690', ink: '#ffffff', accent: '#cfe6f2' },
  { from: '#7a3b2a', to: '#a3563d', ink: '#ffffff', accent: '#f6cdbd' },
  { from: '#4a2f3f', to: '#775068', ink: '#ffffff', accent: '#ecc9dc' },
  { from: '#5e4a14', to: '#8a6f20', ink: '#ffffff', accent: '#fbe9a8' },
];

/** ジャンルごとのモチーフ。すべて 0 0 120 120 のビューボックス内に描く。 */
function Motif({ genre, accent, seed }: { genre: string; accent: string; seed: number }) {
  const o = 0.9;
  switch (genre) {
    case 'dice':
      return (
        <g fill={accent} opacity={o}>
          <rect x="24" y="24" width="72" height="72" rx="16" fill="none" stroke={accent} strokeWidth="4" />
          <circle cx="45" cy="45" r="6" />
          <circle cx="75" cy="45" r="6" />
          <circle cx="60" cy="60" r="6" />
          <circle cx="45" cy="75" r="6" />
          <circle cx="75" cy="75" r="6" />
        </g>
      );
    case 'card':
      return (
        <g opacity={o}>
          <rect x="20" y="34" width="46" height="64" rx="7" fill="none" stroke={accent} strokeWidth="4" transform="rotate(-12 43 66)" />
          <rect x="54" y="30" width="46" height="64" rx="7" fill="none" stroke={accent} strokeWidth="4" transform="rotate(10 77 62)" />
        </g>
      );
    case 'strategy':
      return (
        <g fill="none" stroke={accent} strokeWidth="4" opacity={o}>
          <polygon points="60,20 89,37 89,71 60,88 31,71 31,37" />
          <polygon points="60,40 74,48 74,64 60,72 46,64 46,48" fill={accent} opacity="0.35" stroke="none" />
        </g>
      );
    case 'cooperative':
      return (
        <g fill={accent} opacity={o}>
          <path d="M42 46a10 10 0 1 1 20 0c0 9-10 12-10 22h-1c0-10-9-13-9-22Z" transform="translate(-8 4)" />
          <path d="M42 46a10 10 0 1 1 20 0c0 9-10 12-10 22h-1c0-10-9-13-9-22Z" transform="translate(16 4)" />
          <rect x="30" y="82" width="60" height="6" rx="3" />
        </g>
      );
    case 'hidden-role':
      return (
        <g fill="none" stroke={accent} strokeWidth="4" opacity={o}>
          <path d="M26 54c0-8 12-14 34-14s34 6 34 14-10 10-18 10-12-6-16-6-8 6-16 6-18-2-18-10Z" />
          <circle cx="44" cy="54" r="5" fill={accent} stroke="none" />
          <circle cx="76" cy="54" r="5" fill={accent} stroke="none" />
          <path d="M40 76c6 6 34 6 40 0" />
        </g>
      );
    case 'word':
      return (
        <g fill="none" stroke={accent} strokeWidth="4" opacity={o}>
          <path d="M24 36h52a8 8 0 0 1 8 8v22a8 8 0 0 1-8 8H50l-14 12V74h-12a8 8 0 0 1-8-8V44a8 8 0 0 1 8-8Z" />
          <path d="M38 50h30M38 62h20" strokeLinecap="round" />
        </g>
      );
    case 'deduction':
      return (
        <g fill="none" stroke={accent} strokeWidth="4" opacity={o}>
          <circle cx="54" cy="52" r="22" />
          <path d="M70 68l20 22" strokeLinecap="round" />
        </g>
      );
    case 'bluff':
      return (
        <g fill="none" stroke={accent} strokeWidth="4" opacity={o}>
          <circle cx="60" cy="60" r="30" />
          <path d="M40 60c8-10 32-10 40 0" />
          <circle cx="60" cy="60" r="7" fill={accent} stroke="none" />
        </g>
      );
    case 'party':
      return (
        <g opacity={o}>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const a = (i / 6) * Math.PI * 2 + seed;
            return (
              <circle key={i} cx={60 + Math.cos(a) * 26} cy={60 + Math.sin(a) * 26} r={i % 2 ? 6 : 9} fill={accent} />
            );
          })}
        </g>
      );
    case 'dexterity':
      return (
        <g fill="none" stroke={accent} strokeWidth="4" opacity={o}>
          <rect x="34" y="70" width="52" height="12" rx="3" />
          <rect x="42" y="54" width="36" height="12" rx="3" />
          <rect x="50" y="38" width="20" height="12" rx="3" />
          <path d="M26 90h68" strokeLinecap="round" />
        </g>
      );
    case 'abstract':
      return (
        <g opacity={o}>
          <rect x="26" y="26" width="68" height="68" rx="6" fill="none" stroke={accent} strokeWidth="4" />
          <rect x="26" y="26" width="34" height="34" fill={accent} opacity="0.3" />
          <rect x="60" y="60" width="34" height="34" fill={accent} opacity="0.3" />
        </g>
      );
    default:
      // ファミリー：ミープル
      return (
        <g fill={accent} opacity={o}>
          <path d="M60 26a12 12 0 0 1 12 12c0 4-2 7-4 9l10 5c5 3 8 8 8 14v14H34V66c0-6 3-11 8-14l10-5c-2-2-4-5-4-9a12 12 0 0 1 12-12Z" />
        </g>
      );
  }
}

export default function GameTile({ slug, name, nameEn, genre, className = '', large = false }: Props) {
  const pal = PALETTES[Math.floor(hash01(slug) * PALETTES.length)];
  const seed = hash01(slug, 7) * Math.PI * 2;
  const gid = `g-${slug.replace(/[^a-z0-9-]/gi, '')}`;

  // 文字数でサイズを落とす（長いタイトルでもはみ出さない）
  const len = name.length;
  const fs = large ? (len > 18 ? 9.5 : len > 12 ? 11.5 : len > 7 ? 14 : 17) : len > 18 ? 8.5 : len > 12 ? 10 : len > 7 ? 12.5 : 15;
  const lines: string[] = [];
  const per = Math.max(5, Math.floor(46 / fs) + (large ? 2 : 1));
  for (let i = 0; i < name.length; i += per) lines.push(name.slice(i, i + per));
  const shown = lines.slice(0, 3);
  if (lines.length > 3) shown[2] = `${shown[2].slice(0, per - 1)}…`;

  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label={`${name} のイメージ`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={pal.from} />
          <stop offset="100%" stopColor={pal.to} />
        </linearGradient>
      </defs>
      <rect width="120" height="120" fill={`url(#${gid})`} />

      {/* モチーフは上寄せ・半透明で、文字の邪魔をしない */}
      <g transform="translate(0,-14) scale(1)" opacity="0.26">
        <Motif genre={genre} accent={pal.accent} seed={seed} />
      </g>

      {/* 下部の文字帯 */}
      <rect y="66" width="120" height="54" fill={pal.from} opacity="0.55" />
      <text
        x="10"
        y={shown.length === 1 ? 96 : shown.length === 2 ? 89 : 83}
        fill={pal.ink}
        fontSize={fs}
        fontWeight="700"
        style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}
      >
        {shown.map((l, i) => (
          <tspan key={i} x="10" dy={i === 0 ? 0 : fs * 1.25}>
            {l}
          </tspan>
        ))}
      </text>
      {nameEn && shown.length < 3 ? (
        <text
          x="10"
          y="112"
          fill={pal.accent}
          fontSize="6"
          letterSpacing="0.6"
          style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}
        >
          {nameEn.length > 26 ? `${nameEn.slice(0, 25)}…` : nameEn}
        </text>
      ) : null}
    </svg>
  );
}

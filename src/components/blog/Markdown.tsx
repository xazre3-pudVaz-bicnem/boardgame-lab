import Link from 'next/link';
import { hasGame } from '@/lib/games';

/**
 * 記事本文のMarkdownを描く。
 *
 * 外部ライブラリを足さずに済むよう、生成側で使う記法を絞っている。
 *   ## 見出し / ### 小見出し / 段落 / - 箇条書き / 1. 番号つき
 *   [文字](/path) の内部リンク / **強調**
 * 記法の範囲は scripts/generate-blog.mjs のプロンプトと検証で揃えている。
 */

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** 行内の記法（リンク・強調）をReactノードに変換する。 */
function inline(text: string, keyBase: string) {
  const out: React.ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));

    if (m[1] && m[2]) {
      const href = m[2];
      const internal = href.startsWith('/');
      // 存在しないゲームへのリンクは、本文だけ残してリンクにしない
      const gameSlug = href.startsWith('/games/') ? href.slice('/games/'.length) : null;
      const broken = gameSlug !== null && !gameSlug.includes('/') && !hasGame(gameSlug) && !COLLECTIONISH.has(gameSlug);

      if (broken) out.push(m[1]);
      else if (internal)
        out.push(
          <Link key={`${keyBase}-l${i}`} href={href} className="prose-link">
            {m[1]}
          </Link>,
        );
      else
        out.push(
          <a
            key={`${keyBase}-l${i}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="prose-link"
          >
            {m[1]}
          </a>,
        );
    } else if (m[3]) {
      out.push(
        <strong key={`${keyBase}-b${i}`} className="font-semibold text-ink">
          {m[3]}
        </strong>,
      );
    }
    last = re.lastIndex;
    i++;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** /games/<key> のうちゲームではないもの（コレクション）。リンク切れ判定から除く。 */
const COLLECTIONISH = new Set([
  'for-two',
  'short-play',
  'for-groups',
  'cooperative',
  'list',
]);

export default function Markdown({ source }: { source: string }) {
  const lines = source.split('\n');
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const flushList = (key: string) => {
    if (!list.length || !listType) return;
    const items = list.map((t, i) => (
      <li key={`${key}-i${i}`} className="text-pretty leading-[2] text-ink-soft">
        {inline(t, `${key}-i${i}`)}
      </li>
    ));
    blocks.push(
      listType === 'ul' ? (
        <ul key={key} className="my-6 list-disc space-y-2 pl-6 text-[0.95rem] marker:text-cyan">
          {items}
        </ul>
      ) : (
        <ol key={key} className="my-6 list-decimal space-y-2 pl-6 text-[0.95rem] marker:text-cyan-ink">
          {items}
        </ol>
      ),
    );
    list = [];
    listType = null;
  };

  lines.forEach((raw, idx) => {
    const line = raw.trimEnd();
    const key = `b${idx}`;

    if (/^###\s+/.test(line)) {
      flushList(`${key}-l`);
      blocks.push(
        <h3 key={key} className="display mt-10 mb-3 text-[1.05rem] leading-snug text-ink">
          {inline(line.replace(/^###\s+/, ''), key)}
        </h3>,
      );
      return;
    }
    if (/^##\s+/.test(line)) {
      flushList(`${key}-l`);
      blocks.push(
        <h2 key={key} className="display mt-14 mb-4 text-[clamp(1.2rem,3.2vw,1.6rem)] leading-snug text-ink">
          {inline(line.replace(/^##\s+/, ''), key)}
        </h2>,
      );
      return;
    }
    if (/^[-*]\s+/.test(line)) {
      if (listType === 'ol') flushList(`${key}-l`);
      listType = 'ul';
      list.push(line.replace(/^[-*]\s+/, ''));
      return;
    }
    if (/^\d+\.\s+/.test(line)) {
      if (listType === 'ul') flushList(`${key}-l`);
      listType = 'ol';
      list.push(line.replace(/^\d+\.\s+/, ''));
      return;
    }
    if (line.trim() === '') {
      flushList(`${key}-l`);
      return;
    }
    flushList(`${key}-l`);
    blocks.push(
      <p key={key} className="text-pretty my-5 text-[0.95rem] leading-[2.05] text-ink-soft">
        {inline(line, key)}
      </p>,
    );
  });
  flushList('tail');

  return <div>{blocks}</div>;
}

export { escape };

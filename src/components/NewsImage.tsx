import Image from 'next/image';
import sizes from '@/data/news-images.json';

/**
 * お知らせ記事の告知画像。
 * 旧公式サイト（Wix）に店舗が掲載していた画像を、そのまま引き継いでいる。
 * 画像内の文字は本文としても書き起こしてあるので、altは内容の要約にとどめる。
 */
export default function NewsImage({
  name,
  alt,
  className = '',
  priority = false,
}: {
  name: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const meta = (sizes as Record<string, { width: number; height: number }>)[name];
  if (!meta) return null;

  return (
    <Image
      src={`/news/${name}-960.webp`}
      alt={alt}
      width={meta.width}
      height={meta.height}
      sizes="(max-width:768px) 92vw, 44rem"
      priority={priority}
      className={className}
    />
  );
}

export const newsImageKeys = Object.keys(sizes);

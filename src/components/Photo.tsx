import Image from 'next/image';
import photos from '@/data/photos.json';

export type PhotoKey = keyof typeof photos;

export const photoKeys = Object.keys(photos) as PhotoKey[];
export const getPhoto = (key: PhotoKey) => photos[key];

type Props = {
  name: PhotoKey;
  /** alt を上書きしたいとき。省略時は photos.json の alt を使う */
  alt?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** 親要素を fill する（親に position/aspect が必要） */
  fill?: boolean;
  width?: number;
  height?: number;
  quality?: number;
};

/**
 * 店舗提供写真の表示。src と実寸は src/data/photos.json（scripts/build-photos.mjs が生成）から引く。
 * fill を使うときは親側で aspect-ratio と position:relative を必ず指定すること
 * （高さ0で消える事故を防ぐため、ここでは position を付けない）。
 */
export default function Photo({
  name,
  alt,
  className = '',
  sizes = '100vw',
  priority = false,
  fill = false,
  width,
  height,
  quality = 74,
}: Props) {
  const p = photos[name];
  if (!p) throw new Error(`Photo "${name}" is not in photos.json`);

  if (fill) {
    return (
      <Image
        src={p.src}
        alt={alt ?? p.alt}
        fill
        sizes={sizes}
        priority={priority}
        quality={quality}
        className={className}
      />
    );
  }
  return (
    <Image
      src={p.src}
      alt={alt ?? p.alt}
      width={width ?? p.width}
      height={height ?? p.height}
      sizes={sizes}
      priority={priority}
      quality={quality}
      className={className}
    />
  );
}

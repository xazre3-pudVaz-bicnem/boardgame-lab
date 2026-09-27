import GameTile from './GameTile';
import images from '@/data/game-images.json';

/**
 * ゲームのサムネイル。
 *
 * 以前はボドゲーマ掲載のパッケージ画像を取得して使っていたが、同サイトの利用規約（第5条）で
 * 運営の事前同意なく転載することが禁じられているため、公開を停止した。
 * 今は画像が登録されていないので、すべてゲーム名から組み立てた表示（GameTile）になる。
 *
 * 店舗で撮影した写真、または出版社・権利者から使用許諾を得た画像を
 * public/games/<slug>-{320,480}.webp に置いて src/data/game-images.json に登録すると、そちらが出る。
 */

const HAS = (images as { images: Record<string, unknown> }).images;

export const hasGameImage = (slug: string) => Object.hasOwn(HAS, slug);

type Props = {
  slug: string;
  name: string;
  nameEn?: string | null;
  genre: string;
  className?: string;
  large?: boolean;
  priority?: boolean;
};

export default function GameImage({ slug, name, nameEn, genre, className = '', large, priority }: Props) {
  if (!hasGameImage(slug)) {
    return (
      <GameTile slug={slug} name={name} nameEn={nameEn} genre={genre} large={large} className={`aspect-square w-full ${className}`} />
    );
  }
  const px = large ? 480 : 320;
  return (
    // 実寸ちょうどのwebpを事前生成するので next/image の変換は挟まない
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/games/${slug}-${px}.webp`}
      width={px}
      height={px}
      alt={`${name}の写真`}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      className={`aspect-square w-full bg-paper-2 object-contain ${className}`}
    />
  );
}

import GameTile from './GameTile';
import images from '@/data/game-images.json';

/**
 * ゲームのサムネイル。
 *
 * パッケージ画像がある場合はそれを出し、無い場合だけ GameTile（インラインSVG）に落とす。
 * 画像は scripts/build-game-images.mjs で正方形に「収めて」書き出してあるので、
 * ここで縦横比を計算する必要がなく、幅高さを固定で渡せる（レイアウトのずれが起きない）。
 *
 * srcSet は付けていない。カードは実寸160px前後なのでDPR2でちょうど320px、
 * 詳細ページのヘッダーは実寸224pxなのでDPR2で448px。用途ごとに1枚だけ指すのが軽い。
 * 2枚を候補に出すと、スマホが大きいほうを選んで一覧が一気に重くなる。
 *
 * 画像の取得元と、取り違えが起きない理由は scripts/fetch-game-images.mjs のコメントを参照。
 */

const HAS = images.images as Record<string, { w: number; h: number; hash: string }>;

export const hasGameImage = (slug: string) => Object.hasOwn(HAS, slug);
export const gameImageCount = Object.keys(HAS).length;

type Props = {
  slug: string;
  name: string;
  nameEn?: string | null;
  genre: string;
  className?: string;
  /** 詳細ページのヘッダーなど、大きく出すとき */
  large?: boolean;
  /** 画面に入る前から読み込むか（一覧の最初の数枚だけ true にする） */
  priority?: boolean;
};

export default function GameImage({ slug, name, nameEn, genre, className = '', large, priority }: Props) {
  // 画像が無いタイトル。写真側と同じ大きさ・比率で描く。
  if (!hasGameImage(slug)) {
    return (
      <GameTile
        slug={slug}
        name={name}
        nameEn={nameEn}
        genre={genre}
        large={large}
        className={`aspect-square w-full ${className}`}
      />
    );
  }

  const px = large ? 480 : 320;
  return (
    // next/image を通さないのは、表示する実寸ちょうどのwebpを事前に書き出しているため。
    // 変換を挟んでも画質は変わらず、602件ぶんの最適化がホスティングの従量課金になるだけ。
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/games/${slug}-${px}.webp`}
      width={px}
      height={px}
      alt={`${name}のゲーム画像`}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      className={`aspect-square w-full bg-paper-2 object-contain ${className}`}
    />
  );
}

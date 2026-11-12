import { ConfirmNote } from '@/components/ui';
import { shop } from '@/data/shop';

/**
 * 営業時間・定休日の確認先の案内。
 * 店舗の指定で公式Xにしている（2026-11-12。以前は公式Instagramと案内していた）。
 */
export default function HoursChangeNote() {
  return (
    <ConfirmNote>
      営業時間・定休日は変更になる場合があります。ご来店前に
      <a href={shop.links.x} target="_blank" rel="noopener noreferrer" className="mx-0.5 font-semibold underline underline-offset-2">
        公式X（{shop.links.xHandle}）
      </a>
      でご確認ください。
    </ConfirmNote>
  );
}

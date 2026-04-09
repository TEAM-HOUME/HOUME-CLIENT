import TestImage from '@assets/v2/images/TestImg.png';

import { logMyPageClickBtnFurnitureCard } from '@/pages/mypage/utils/analytics';
import { useJjymMutation } from '@/shared/apis/mutations/useJjymMutation';
import TextButton from '@/shared/components/v2/btnText/TextButton';
import ListProductCard from '@/shared/components/v2/productCard/ListProductCard';

import * as styles from './GenImgCard.css';

import type { UsedProduct } from '@/pages/mypage/types/apis/generateList';

interface GenImgCardProps {
  cardType?: 'list' | 'curation';
  productSummaryText?: string;
  imageUrl?: string;
  usedProducts?: UsedProduct[];
  onCurationClick?: () => void;
}

const GenImgCard = ({
  cardType = 'list',
  productSummaryText,
  imageUrl,
  usedProducts = [],
  onCurationClick,
}: GenImgCardProps) => {
  const isListType = cardType === 'list';

  // 찜 토글
  const { mutate: toggleJjym } = useJjymMutation();

  const handleToggleSave = (id: number) => {
    toggleJjym(id);
  };

  return (
    <div className={styles.wrapper}>
      <section className={styles.textContainer} onClick={onCurationClick}>
        <span className={styles.headingText}>{productSummaryText}</span>
        {/* 컴포넌트 수정 필요 */}
        <TextButton
          color="secondary"
          size="s"
          rightIcon={'ArrowRight'}
          onClick={(e) => {
            e.stopPropagation();
            onCurationClick?.();
          }}
        >
          더보기
        </TextButton>
      </section>
      <section className={styles.imgContainer}>
        <img
          src={imageUrl || TestImage}
          alt={productSummaryText ?? '생성 이미지'}
          className={styles.cardImg}
        />
      </section>

      {isListType && (
        <section className={styles.listCardContainer}>
          {/* 찜 부분 수정 필요 */}
          {usedProducts.map((item) => (
            <ListProductCard
              key={item.rawProductId}
              cardSize="s"
              product={{
                title: item.productName,
                imageUrl: item.productImageUrl,
              }}
              price={{
                original: item.listPrice,
                discount: item.discountPrice,
                discountRate: item.discountRate,
              }}
              save={{
                isSaved: item.isJjym,
                onToggle: () => handleToggleSave(item.rawProductId),
              }}
              link={{
                href: item.productSiteUrl,
                onClick: logMyPageClickBtnFurnitureCard,
              }}
              enableWholeCardLink={true}
            />
          ))}
        </section>
      )}
    </div>
  );
};
export default GenImgCard;

import { useNavigate, useLocation, useParams } from 'react-router-dom';

import { ROUTES } from '@routes/paths';

import { ENTRY_ROUTE, useImageFlowStore } from '@store/useImageFlowStore';
import { useSavedItemsStore } from '@store/useSavedItemsStore';
import { useUserStore } from '@store/useUserStore';

import { useJjymMutation } from '@apis/mutations/useJjymMutation';

import ActionButton from '@components/v2/button/actionButton/ActionButton';
import TitleNavBar from '@components/v2/navBar/TitleNavBar';
import ListCardProduct from '@components/v2/productCard/ListProductCard';
import StyleCard from '@components/v2/styleCard/StyleCard';

import { setLoginRedirect } from '@utils/loginRedirect';

import { STYLE_DETAIL_MOCK } from './mocks/styleDetail';
import * as styles from './StyleDetailPage.css';
import { normalizeColorHexes } from '../generate/pages/result/curationSection/curationProducts';

const StyleDetailPage = () => {
  const { styleId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!useUserStore((state) => state.accessToken);

  const savedProductIds = useSavedItemsStore((state) => state.savedProductIds);

  // 찜 해제 토글
  const { mutate: toggleJjym } = useJjymMutation();

  const handleToggleSave = (id: number) => {
    toggleJjym(id);
  };

  // 스타일 상세 CTA: setFlow(STYLE_RESTYLE) → 로그인 체크 → 스타일 상세로 복귀
  const handleCta = () => {
    const parsedId = Number(styleId);
    if (Number.isNaN(parsedId)) return;

    useImageFlowStore.getState().setFlow({
      entryRoute: ENTRY_ROUTE.STYLE_RESTYLE,
      preset: { type: 'style', styleId: parsedId },
    });

    if (isLoggedIn) {
      navigate(ROUTES.IMAGE_SETUP);
    } else {
      // pathname과 쿼리 파라미터 모두 저장
      setLoginRedirect(location.pathname + location.search);
      navigate(ROUTES.LOGIN);
    }
  };

  return (
    <div className={styles.wrapper}>
      <TitleNavBar
        title="스타일 상세 보기"
        backLabel="이전"
        onBackClick={() => navigate(-1)}
      />
      <div className={styles.container}>
        <section className={styles.styleCardInfo}>
          <StyleCard
            size="L"
            title={STYLE_DETAIL_MOCK.data.styleName}
            largeContents={{
              title: STYLE_DETAIL_MOCK.data.styleName,
              description: STYLE_DETAIL_MOCK.data.styleDescription,
            }}
            imageSrc={STYLE_DETAIL_MOCK.data.styleImageUrl}
            imageLoading="eager"
          />
        </section>
        <section className={styles.productList}>
          <span className={styles.sectionTitle}>사용된 가구</span>
          <div className={styles.products}>
            {STYLE_DETAIL_MOCK.data.products.map((item) => (
              <ListCardProduct
                key={item.id}
                product={{
                  title: item.name,
                  imageUrl: item.imageUrl,
                  colorHexes: normalizeColorHexes(item.colors),
                }}
                price={{
                  original: item.originalPrice,
                  discount: item.finalPrice,
                  discountRate: item.discountRate,
                }}
                save={{
                  isSaved: savedProductIds.has(item.id),
                  onToggle: () => handleToggleSave(item.id),
                }}
                link={{
                  href: item.linkUrl,
                  // onClick: logMyPageClickBtnFurnitureCard,
                }}
                enableWholeCardLink={true}
              />
            ))}
          </div>
        </section>
      </div>
      <ActionButton onClick={handleCta} className={styles.ctaBtn}>
        이 스타일로 우리 집 꾸미기
      </ActionButton>
    </div>
  );
};

export default StyleDetailPage;

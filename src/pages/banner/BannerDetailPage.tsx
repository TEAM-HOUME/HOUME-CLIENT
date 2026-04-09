import { useId, useState } from 'react';

import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { ROUTES } from '@routes/paths';

import { ENTRY_ROUTE, useImageFlowStore } from '@store/useImageFlowStore';
import { useUserStore } from '@store/useUserStore';

import ActionButton from '@shared/components/v2/button/actionButton/ActionButton';
import Icon from '@shared/components/v2/icon/Icon';
import TitleNavBar from '@shared/components/v2/navBar/TitleNavBar';

import imgBanner01 from '@assets/v2/images/ImgBanner_01.png';
import imgBanner02 from '@assets/v2/images/ImgBanner_02.png';
import imgBanner03 from '@assets/v2/images/ImgBanner_03.png';
import imgBanner04 from '@assets/v2/images/ImgBanner_04.png';

import { setLoginRedirect } from '@utils/loginRedirect';

import StyleCard from '@/shared/components/v2/styleCard/StyleCard';

import * as styles from './BannerDetailPage.css';

type BannerDetailMock = {
  bannerId: string;
  bannerTitle: string;
  imageSrc: string;
  question: string;
  options: readonly string[];
};

// TODO: API 연동 후 제거
const BANNER_DETAIL_MOCK: readonly BannerDetailMock[] = [
  {
    bannerId: '1',
    bannerTitle: '잦은 재택근무하기 좋은 우리 집',
    imageSrc: imgBanner01,
    question: '업무 시 어떤 책상을 선호하시나요?',
    options: [
      '모니터 받침대가 결합된 책상',
      '데스크테리어 가능한 깔끔한 책상',
      '식사도 해결할 수 있는 식탁 겸용 테이블',
      '자유로운 활용이 가능한 접이식 테이블',
    ] as const,
  },
  {
    bannerId: '2',
    bannerTitle: '브런치 즐기기 좋은 우리 집',
    imageSrc: imgBanner02,
    question: '브런치로 어떤 음식을 주로 드시나요?',
    options: [
      '간단한 커피와 디저트',
      '파스타 같은 양식',
      '밥과 국이 있는 한식',
      '편리한 배달음식',
    ] as const,
  },
  {
    bannerId: '3',
    bannerTitle: '친구 초대하기 좋은 우리 집',
    imageSrc: imgBanner03,
    question: '우리 집에 누구를 자주 초대하시나요?',
    options: ['연인', '3명 이하 친구들', '4명 이상 단체'] as const,
  },
  {
    bannerId: '4',
    bannerTitle: 'OTT 감상하기 좋은 우리 집',
    imageSrc: imgBanner04,
    question: '어떤 기기로 OTT를 시청하시나요?',
    options: [
      '빔 프로젝터',
      '스탠딩 모니터',
      '아이패드/휴대폰',
      '벽걸이 TV',
    ] as const,
  },
] as const;

const BannerDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { bannerId = '' } = useParams<{ bannerId: string }>();
  const questionId = useId();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const isLoggedIn = !!useUserStore((state) => state.accessToken);

  const bannerDetail = BANNER_DETAIL_MOCK.find(
    (item) => item.bannerId === bannerId
  );

  if (!bannerDetail) {
    throw new Response('Banner not found', { status: 404 });
  }

  // 배너 상세 CTA: setFlow(HOME_BANNER) → 로그인 체크 → 배너 상세로 복귀
  const handleCta = () => {
    const parsedId = Number(bannerId);
    if (Number.isNaN(parsedId) || selectedIndex === null) return;

    useImageFlowStore.getState().setFlow({
      entryRoute: ENTRY_ROUTE.HOME_BANNER,
      preset: {
        type: 'banner',
        bannerId: parsedId,
        // 현재는 옵션 index를 answerId로 사용 (API 명세 확정 시 조정)
        answerId: selectedIndex,
      },
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
    <div className={styles.page} key={bannerId}>
      <TitleNavBar
        title="원하는 공간 선택하기"
        backLabel="이전"
        onBackClick={() => navigate(-1)}
      />
      <main className={styles.body}>
        <div className={styles.bannerContainer}>
          <StyleCard
            size="L"
            scaleOnPress={false}
            imageSrc={bannerDetail.imageSrc}
            title={bannerDetail.bannerTitle}
          />
        </div>

        <div className={styles.questionContainer}>
          <h2 className={styles.question} id={questionId}>
            {bannerDetail.question}
          </h2>
          <ul
            className={styles.optionList}
            role="radiogroup"
            aria-labelledby={questionId}
          >
            {bannerDetail.options.map((label, index) => {
              const selected = selectedIndex === index;
              return (
                <li key={label}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={styles.optionRow}
                    onClick={() => setSelectedIndex(index)}
                  >
                    <span className={styles.optionIcon} aria-hidden>
                      <Icon
                        name={selected ? 'RadioSelected' : 'RadioDefault'}
                        size="20"
                      />
                    </span>
                    <span className={styles.optionLabel}>{label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </main>

      <div className={styles.ctaBar}>
        <ActionButton
          variant="solid"
          color="primary"
          size="2XL"
          fullWidth
          disabled={selectedIndex === null}
          onClick={handleCta}
        >
          이 스타일로 우리 집 꾸미기
        </ActionButton>
      </div>
    </div>
  );
};

export default BannerDetailPage;

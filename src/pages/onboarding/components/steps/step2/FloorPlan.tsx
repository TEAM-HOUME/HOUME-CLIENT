// FloorPlan.tsx
import { useEffect, useState } from 'react';
import * as styles from './FloorPlan.css';
import type { OpenSheetKey } from '@/pages/onboarding/types/OpenSheet';
import { type FloorPlanList } from '@/pages/onboarding/types/apis/step2Api.types';
import FloorCard from '@/shared/components/card/floorCard/FloorCard';
import NoMatchButton from '@/shared/components/button/noMatchButton/NoMatchButton';
import NoMatchSheet from '@/shared/components/bottomSheet/noMatchSheet/NoMatchSheet';
import FlipSheet from '@/shared/components/bottomSheet/flipSheet/FlipSheet';
import { useToast } from '@/shared/components/toast/useToast';
import { useBottomSheetAddress } from '@/pages/onboarding/hooks/useBottomSheetAddress';

interface FloorPlanProps {
  floorPlanList: FloorPlanList[];
  selectedId: number | null;
  isMirror: boolean;
  selectedImage: FloorPlanList | null | undefined;
  onImageSelect: (id: number) => void;
  onFlipToggle: () => void;
  onFloorPlanSelection: () => void;
}

const FloorPlan = ({
  floorPlanList,
  selectedId,
  isMirror,
  selectedImage,
  onImageSelect,
  onFlipToggle,
  onFloorPlanSelection,
}: FloorPlanProps) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [openSheet, setOpenSheet] = useState<OpenSheetKey>(null);
  const { notify } = useToast();
  const { mutate: postAddress } = useBottomSheetAddress();

  // toast를 NoMatchSheet의 상위 컴포넌트인 FloorPlan에서 호출해야
  // toast의 option에 준 autoClose가 정상적으로 적용됨
  const handleAddressSubmit = (region: string, address: string) => {
    postAddress({ sigungu: region, roadName: address });
    handleCloseSheet();
    notify({
      text: '주소가 성공적으로 제출되었어요',
      type: 'success',
      options: {
        style: { marginBottom: '1.6rem' },
        autoClose: 3000,
      },
    });
  };

  const handleImageClick = (id: number) => {
    onImageSelect(id);
    handleOpenSheet('flip');
  };

  const handleOpenSheet = (type: 'noMatch' | 'flip') => {
    setOpenSheet(type);
  };

  useEffect(() => {
    if (openSheet) {
      // 도면 이미지 클릭 -> FlipSheet 컴포넌트가 DOM에 마운트, 동시에 isOpen={true}로 렌더링 -> 바텀시트 애니메이션 없이 바로 나타남
      // 따라서 requestAnimationFrame()으로 Flipsheet 마운트 후 1프레임 뒤에 isOpen을 true로 변경
      requestAnimationFrame(() => {
        setIsSheetOpen(true);
      });
    }
  }, [openSheet]);

  const handleCloseSheet = () => {
    setIsSheetOpen(false); // 닫힘 애니메이션 시작
  };

  const handleExited = () => {
    setOpenSheet(null); // 애니메이션 끝나면 DOM에서 제거
  };

  const handleChooseClick = () => {
    handleCloseSheet();
    onFloorPlanSelection();
  };

  return (
    <section className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.gridbox}>
          {floorPlanList.map((item: FloorPlanList) => (
            <button
              type="button"
              key={item.id}
              onClick={() => handleImageClick(item.id)}
            >
              <FloorCard
                src={item.floorPlanImage}
                selected={selectedId === item.id}
              />
            </button>
          ))}
        </div>
      </div>

      <div className={styles.buttonContainer}>
        <NoMatchButton
          message={'우리 집 구조와 유사한 템플릿이 없어요'}
          onClick={() => handleOpenSheet('noMatch')}
        />
      </div>

      {openSheet === 'noMatch' && (
        <NoMatchSheet
          isOpen={isSheetOpen}
          onClose={handleCloseSheet}
          onExited={handleExited}
          onSubmit={handleAddressSubmit}
        />
      )}

      {openSheet === 'flip' && (
        <FlipSheet
          isOpen={isSheetOpen}
          onClose={handleCloseSheet}
          onExited={handleExited}
          onFlipClick={onFlipToggle}
          onChooseClick={handleChooseClick}
          src={selectedImage?.floorPlanImage ?? ''}
          isFlipped={isMirror}
        />
      )}
    </section>
  );
};

export default FloorPlan;

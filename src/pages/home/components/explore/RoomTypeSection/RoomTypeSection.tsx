import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@routes/paths';

import { ENTRY_ROUTE, useImageFlowStore } from '@store/useImageFlowStore';

import RoomTypeCard from '@components/v2/roomTypeCard/RoomTypeCard';

import TextButton from '@/shared/components/v2/btnText/TextButton';

import * as styles from './RoomTypeSection.css';

const ROOM_TYPE_MOCK = [
  {
    id: 'living',
    label: '거실',
    imageSrc: ' ',
  },
  {
    id: 'bedroom',
    label: '침실',
    imageSrc: ' ',
  },
  {
    id: 'kitchen',
    label: '주방',
    imageSrc: ' ',
  },
  {
    id: 'study',
    label: '서재',
    imageSrc: ' ',
  },
  {
    id: 'bathroom',
    label: '욕실',
    imageSrc: ' ',
  },
] as const;

const RoomTypeSection = () => {
  const navigate = useNavigate();

  const handleRoomTypeClick = () => {
    useImageFlowStore
      .getState()
      .setFlow({ entryRoute: ENTRY_ROUTE.FLOOR_PLAN });
    navigate(ROUTES.IMAGE_SETUP);
  };

  return (
    <section className={styles.section}>
      <div className={styles.headerRow}>
        <h2 className={styles.sectionTitle}>우리 집 공간으로 시작하기</h2>
        <TextButton
          color="secondary"
          size="s"
          rightIcon="ArrowRight"
          onClick={() => {}}
        >
          더보기
        </TextButton>
      </div>
      <div className={styles.cardScroll}>
        <div className={styles.cardList}>
          {ROOM_TYPE_MOCK.map((room) => (
            // cardList가 가로 스크롤 가능한 컴포넌트(width: max-content + flex-wrap:nowrap) + RoomTypeCard는 반응형 대응 가능(width: 100%)
            // => cardItem으로 명시적으로 너비를 설정해야 RoomTypeCard의 너비가 무한히 커지지 않음
            <div key={room.id} className={styles.cardItem}>
              <RoomTypeCard
                type="default"
                size="s"
                label={room.label}
                imageSrc={room.imageSrc}
                onClick={handleRoomTypeClick}
              />
            </div>
          ))}
          <div className={styles.cardItem}>
            <RoomTypeCard type="more" size="s" onClick={() => {}} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoomTypeSection;

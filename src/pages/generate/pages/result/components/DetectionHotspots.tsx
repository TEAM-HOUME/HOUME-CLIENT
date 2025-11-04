// DetectionHotspots
// - 역할: 훅(useFurnitureHotspots)이 만든 가구 핫스팟을 렌더
// - 파이프라인 요약: Obj365 → 가구만 선별 → cabinet만 리파인 → 가구 전체 핫스팟 렌더
// - 비고: 로직은 훅으로 이동, 컴포넌트는 표시만 담당
import { useState } from 'react';

import { useFurnitureHotspots } from '@pages/generate/hooks/useFurnitureHotspots';
import HotspotColor from '@shared/assets/icons/icnHotspotColor.svg?react';
import HotspotGray from '@shared/assets/icons/icnHotspotGray.svg?react';

import * as styles from './DetectionHotspots.css.ts';

import type { FurnitureHotspot } from '@pages/generate/hooks/useFurnitureHotspots';

interface DetectionHotspotsProps {
  imageUrl: string;
  mirrored?: boolean;
}

const DetectionHotspots = ({
  imageUrl,
  mirrored = false,
}: DetectionHotspotsProps) => {
  // 선택 토글 상태만 로컬로 유지
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // 훅으로 로직 이동: refs/hotspots/isLoading/error 제공
  const { imgRef, containerRef, hotspots, isLoading, error } =
    useFurnitureHotspots(imageUrl, mirrored);

  if (error) {
    // 모델 로드 실패 시에도 이미지 자체는 보여주도록
    console.warn('[Detection] model error:', error);
  }
  if (isLoading) {
    return (
      <div ref={containerRef} className={styles.container}>
        <img
          ref={imgRef}
          crossOrigin="anonymous"
          src={imageUrl}
          alt="generated"
          className={styles.image}
        />
      </div>
    );
  }

  return (
    <div ref={containerRef} className={styles.container}>
      <img
        ref={imgRef}
        crossOrigin="anonymous"
        src={imageUrl}
        alt="generated"
        className={styles.image}
      />
      <div className={styles.overlay}>
        {hotspots.map((hotspot: FurnitureHotspot) => (
          <button
            key={hotspot.id}
            className={styles.hotspot}
            style={{ left: hotspot.cx, top: hotspot.cy }}
            onClick={() =>
              setSelectedId((prev) => (prev === hotspot.id ? null : hotspot.id))
            }
            aria-label={`hotspot ${hotspot.refinedKoLabel ?? 'furniture'}`}
          >
            {selectedId === hotspot.id ? <HotspotColor /> : <HotspotGray />}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DetectionHotspots;

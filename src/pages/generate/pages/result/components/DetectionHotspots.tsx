// DetectionHotspots
// - 역할: 훅(useFurnitureHotspots)이 만든 가구 핫스팟을 렌더
// - 파이프라인 요약: Obj365 → 가구만 선별 → cabinet만 리파인 → 가구 전체 핫스팟 렌더
// - 비고: 로직은 훅으로 이동, 컴포넌트는 표시만 담당
import { useState } from 'react';

import { useFurnitureHotspots } from '@pages/generate/hooks/useFurnitureHotspots';
import { FURNITURE_CATEGORY_LABELS } from '@pages/generate/utils/furnitureCategories';
import HotspotColor from '@shared/assets/icons/icnHotspotColor.svg?react';
import HotspotGray from '@shared/assets/icons/icnHotspotGray.svg?react';

import * as styles from './DetectionHotspots.css.ts';

import type { FurnitureHotspot } from '@pages/generate/hooks/useFurnitureHotspots';

interface DetectionHotspotsProps {
  imageUrl: string;
  mirrored?: boolean;
  shouldInferHotspots?: boolean;
}

const DetectionHotspots = ({
  imageUrl,
  mirrored = false,
  shouldInferHotspots = true,
}: DetectionHotspotsProps) => {
  // 선택 토글 상태만 로컬로 유지
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // 훅으로 로직 이동: refs/hotspots/isLoading/error 제공
  // 페이지 시나리오별로 추론 사용 여부 제어
  const { imgRef, containerRef, hotspots, isLoading, error } =
    useFurnitureHotspots(imageUrl, mirrored, shouldInferHotspots);
  const hasHotspots = hotspots.length > 0;

  const handleHotspotClick = (hotspot: FurnitureHotspot) => {
    setSelectedId((prev) => {
      const next = prev === hotspot.id ? null : hotspot.id;
      if (next) {
        const refinedInfo = hotspot.refinedLabel
          ? FURNITURE_CATEGORY_LABELS[hotspot.refinedLabel]
          : null;
        console.info('[DetectionHotspots] 활성 핫스팟(active hotspot)', {
          id: hotspot.id,
          score: hotspot.score,
          confidence: hotspot.confidence,
          label: {
            ko: hotspot.refinedKoLabel ?? null,
            en: refinedInfo?.en ?? hotspot.className ?? null,
            rawEn: hotspot.className ?? null,
            rawIndex: hotspot.label ?? null,
            refinedKey: hotspot.refinedLabel ?? null,
          },
          coords: { cx: hotspot.cx, cy: hotspot.cy },
        });
      } else {
        console.info('[DetectionHotspots] 핫스팟 선택 해제(clear hotspot)', {
          id: hotspot.id,
        });
      }
      return next;
    });
  };

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
          className={styles.image({ mirrored })}
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
        className={styles.image({ mirrored })}
      />
      <div className={styles.overlay({ visible: hasHotspots })}>
        {hotspots.map((hotspot: FurnitureHotspot) => (
          <button
            key={hotspot.id}
            className={styles.hotspot}
            style={{ left: hotspot.cx, top: hotspot.cy }}
            onClick={() => handleHotspotClick(hotspot)}
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

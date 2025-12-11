import { useEffect } from 'react';

import { useABTest } from '@/pages/generate/hooks/useABTest';
import { useOpenCurationSheet } from '@/pages/generate/hooks/useFurnitureCuration';
import { logResultImgClickBtnTag } from '@/pages/generate/utils/analytics';

import Tag from '@shared/assets/icons/tagIcon.svg?react';

import DetectionHotspots from './DetectionHotspots';
import * as styles from './GeneratedImg.css.ts';

import type { DetectionCacheEntry } from '@pages/generate/stores/useDetectionCacheStore';
import type {
  GenerateImageData,
  GenerateImageAResponse,
  GenerateImageBResponse,
} from '@pages/generate/types/generate';

// 통일된 타입 정의
interface UnifiedGenerateImageResult {
  imageInfoResponses: GenerateImageData[];
}

interface GeneratedImgBProps {
  result:
    | UnifiedGenerateImageResult
    | GenerateImageData
    | GenerateImageAResponse['data']
    | GenerateImageBResponse['data'];
  onCurrentImgIdChange?: (currentImgId: number) => void;
  shouldInferHotspots?: boolean;
  detectionCache?: Record<number, DetectionCacheEntry> | null;
  groupId?: number | null;
}

const GeneratedImgB = ({
  result: propResult,
  onCurrentImgIdChange,
  shouldInferHotspots = true,
  detectionCache,
  groupId,
}: GeneratedImgBProps) => {
  const result = propResult;

  // 단일 이미지 데이터로 정규화
  let image: GenerateImageData | undefined;
  if ('imageInfoResponses' in (result as UnifiedGenerateImageResult)) {
    image = (result as UnifiedGenerateImageResult).imageInfoResponses?.[0];
  } else if ('imageId' in (result as GenerateImageData)) {
    image = result as GenerateImageData;
  }

  const imageId = image?.imageId ?? 0;
  const openSheet = useOpenCurationSheet();
  const { variant } = useABTest();

  // currentImgId를 부모에게 전달하는 useEffect
  useEffect(() => {
    // console.log('GeneratedImgB - onCurrentImgIdChange 호출:', imageId);
    if (imageId > 0) {
      onCurrentImgIdChange?.(imageId);
    }
  }, [imageId, onCurrentImgIdChange]);

  if (!image) {
    console.error('Single image data could not be resolved');
    return null;
  }

  const cachedDetection =
    image?.imageId && detectionCache
      ? (detectionCache[image.imageId] ?? null)
      : null;

  return (
    <div className={styles.container}>
      <DetectionHotspots
        imageId={image.imageId}
        imageUrl={image.imageUrl}
        mirrored={image.isMirror}
        // 결과 페이지 플래그로 추론 on/off 제어
        shouldInferHotspots={shouldInferHotspots}
        cachedDetection={cachedDetection}
        groupId={groupId}
      />
      <button
        type="button"
        className={styles.tagBtn}
        onClick={() => {
          logResultImgClickBtnTag(variant);
          openSheet('expanded');
        }}
      >
        <Tag />
      </button>
    </div>
  );
};

export default GeneratedImgB;

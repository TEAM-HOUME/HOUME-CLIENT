import { useEffect } from 'react';

import Tag from '@shared/assets/icons/tagIcon.svg?react';

import DetectionHotspots from './DetectionHotspots';
import * as styles from './GeneratedImg.css.ts';

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
}

const GeneratedImgB = ({
  result: propResult,
  onCurrentImgIdChange,
  shouldInferHotspots = true,
}: GeneratedImgBProps) => {
  // currentImgId를 부모에게 전달하는 useEffect
  useEffect(() => {
    let imageId = 0;

    // 단일 이미지 데이터에서 imageId 추출
    if ('imageInfoResponses' in (propResult as UnifiedGenerateImageResult)) {
      const firstImage = (propResult as UnifiedGenerateImageResult)
        .imageInfoResponses?.[0];
      imageId = firstImage?.imageId || 0;
    } else if ('imageId' in (propResult as GenerateImageData)) {
      imageId = (propResult as GenerateImageData).imageId;
    }

    console.log('GeneratedImgB - onCurrentImgIdChange 호출:', imageId);
    onCurrentImgIdChange?.(imageId);
  }, [propResult, onCurrentImgIdChange]);

  // 부모로부터 받은 데이터 사용 (필수 prop)
  const result = propResult;

  // 단일 이미지 데이터로 정규화
  let image: GenerateImageData | undefined;
  if ('imageInfoResponses' in (result as UnifiedGenerateImageResult)) {
    image = (result as UnifiedGenerateImageResult).imageInfoResponses?.[0];
  } else if ('imageId' in (result as GenerateImageData)) {
    image = result as GenerateImageData;
  }

  if (!image) {
    console.error('Single image data could not be resolved');
    return null;
  }

  return (
    <div className={styles.container}>
      <DetectionHotspots
        imageUrl={image.imageUrl}
        mirrored={image.isMirror}
        // 결과 페이지 플래그로 추론 on/off 제어
        shouldInferHotspots={shouldInferHotspots}
      />
      <button type="button" className={styles.tagBtn}>
        <Tag />
      </button>
    </div>
  );
};

export default GeneratedImgB;

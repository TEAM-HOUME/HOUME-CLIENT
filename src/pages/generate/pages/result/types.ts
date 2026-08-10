import type { GeneratedImagePayload } from '@pages/generate/types/generate';

// 결과 페이지(ResultPage)에서 자식 컴포넌트(CurationResult, ListResult, GeneratedImg)에 전달하는 이미지 메타 정보
// 이미지 생성 mutation 응답을 narrow한 GeneratedImagePayload와 동일 shape이라 alias로 통일
export type ResultImageMeta = GeneratedImagePayload;

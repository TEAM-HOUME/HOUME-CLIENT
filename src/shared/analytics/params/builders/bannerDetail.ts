import type { BannerChipParams } from '@analytics/params/bannerDetail';

export interface BannerChipInput {
  chipId?: number | string;
  chipName?: string;
  selectedText?: string;
  answerId?: number;
  answerText?: string;
}

/** 배너 상세 chip 클릭 / CTA 이벤트 파라미터 */
export const getBannerChipParams = (
  input: BannerChipInput
): BannerChipParams => {
  const chipText = input.selectedText ?? input.answerText;

  return {
    banner_chip_id: input.chipId ?? input.answerId,
    banner_chip_name: input.chipName ?? chipText,
    selected_banner_chip: chipText,
  };
};

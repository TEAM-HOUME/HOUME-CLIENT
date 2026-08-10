// 주요활동 code → v2 Icon name 매핑
// 서버가 아이콘을 내려주지 않으므로, 클라이언트에서 code 기반으로 매핑
import type { IconName } from '@components/icon/Icon';

interface ActivityIconNames {
  gray: IconName;
  black: IconName;
}

const ACTIVITY_ICON_MAP: Record<string, ActivityIconNames> = {
  REMOTE_WORK: { gray: 'MouseGray', black: 'MouseBlack' },
  READING: { gray: 'BookGray', black: 'BookBlack' },
  FLOOR_LIVING: { gray: 'DeskGray', black: 'DeskBlack' },
  HOME_CAFE: { gray: 'CupGray', black: 'CupBlack' },
};

export const getActivityIconName = (
  activityCode: string,
  variant: 'gray' | 'black' = 'black'
): IconName | null => {
  return ACTIVITY_ICON_MAP[activityCode]?.[variant] ?? null;
};

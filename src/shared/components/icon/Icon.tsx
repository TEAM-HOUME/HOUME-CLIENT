import ArrowLeft from '@assets/icons/ArrowLeft.svg?url';
import ArrowLeftFill from '@assets/icons/ArrowLeftFill.svg?url';
import ArrowLeftStrokeWhite from '@assets/icons/ArrowLeftStrokeWhite.svg?url';
import ArrowRight from '@assets/icons/ArrowRight.svg?url';
import ArrowRightFill from '@assets/icons/ArrowRightFill.svg?url';
import ArrowUp from '@assets/icons/ArrowUp.svg?url';
import BookBlack from '@assets/icons/BookBlack.svg?url';
import BookGray from '@assets/icons/BookGray.svg?url';
import ChevronDown from '@assets/icons/ChevronDown.svg?url';
import ChevronDownFill from '@assets/icons/ChevronDownFill.svg?url';
import ChevronUp from '@assets/icons/ChevronUp.svg?url';
import Close from '@assets/icons/Close.svg?url';
import CloseFillBlack from '@assets/icons/CloseFillBlack.svg?url';
import CloseFillDanger from '@assets/icons/CloseFillDanger.svg?url';
import CloseFillGrayA40 from '@assets/icons/CloseFillGray-a40.svg?url';
import CloseFillGray from '@assets/icons/CloseFillGray.svg?url';
import Credit from '@assets/icons/Credit.svg?url';
import CupBlack from '@assets/icons/CupBlack.svg?url';
import CupGray from '@assets/icons/CupGray.svg?url';
import DeskBlack from '@assets/icons/DeskBlack.svg?url';
import DeskGray from '@assets/icons/DeskGray.svg?url';
import DislikeDefault from '@assets/icons/DislikeDefault.svg?url';
import DislikeSelected from '@assets/icons/DislikeSelected.svg?url';
import DislikeWhite from '@assets/icons/DislikeWhite.svg?url';
import DoubleStar from '@assets/icons/DoubleStar.svg?url';
import FlipHorizontal from '@assets/icons/FlipHorizontal.svg?url';
import Grid1ColDefault from '@assets/icons/Grid1ColDefault.svg?url';
import Grid1ColSelected from '@assets/icons/Grid1ColSelected.svg?url';
import Grid2ColDefault from '@assets/icons/Grid2ColDefault.svg?url';
import Grid2ColSelected from '@assets/icons/Grid2ColSelected.svg?url';
import HeartFillColor from '@assets/icons/HeartFillColor.svg?url';
import HeartFillGray from '@assets/icons/HeartFillGray.svg?url';
import HeartFillWhite from '@assets/icons/HeartFillWhite.svg?url';
import HeartStrokeGray from '@assets/icons/HeartStrokeGray.svg?url';
import HeartStrokeWhite from '@assets/icons/HeartStrokeWhite.svg?url';
import Kakao from '@assets/icons/Kakao.svg?url';
import LikeDefault from '@assets/icons/LikeDefault.svg?url';
import LikeSelected from '@assets/icons/likeSelected.svg?url';
import Link from '@assets/icons/Link.svg?url';
import Lock from '@assets/icons/Lock.svg?url';
import MouseBlack from '@assets/icons/MouseBlack.svg?url';
import MouseGray from '@assets/icons/MouseGray.svg?url';
import PlusFill from '@assets/icons/PlusFill.svg?url';
import Profile from '@assets/icons/Profile.svg?url';
import RadioDefault from '@assets/icons/RadioDefault.svg?url';
import RadioSelected from '@assets/icons/RadioSelected.svg?url';
import Refresh from '@assets/icons/Refresh.svg?url';
import RefreshStrokeWhite from '@assets/icons/RefreshStrokeWhite.svg?url';
import Search from '@assets/icons/Search.svg?url';
import StepActive from '@assets/icons/StepActive.svg?url';
import StepDefault from '@assets/icons/StepDefault.svg?url';
import ViewDetail from '@assets/icons/ViewDetail.svg?url';
import WarningFillDanger from '@assets/icons/WarningFillDanger.svg?url';

import * as styles from './Icon.css';

const IconsName = {
  ArrowLeft,
  ArrowLeftFill,
  ArrowLeftStrokeWhite,
  ArrowRight,
  ArrowRightFill,
  ArrowUp,
  BookBlack,
  BookGray,
  ChevronDown,
  ChevronDownFill,
  ChevronUp,
  Close,
  CloseFillBlack,
  CloseFillDanger,
  CloseFillGray,
  CloseFillGrayA40,
  CupBlack,
  CupGray,
  DeskBlack,
  DeskGray,
  DoubleStar,
  FlipHorizontal,
  Grid1ColDefault,
  Grid1ColSelected,
  Grid2ColDefault,
  Grid2ColSelected,
  HeartFillColor,
  HeartFillGray,
  HeartStrokeGray,
  HeartStrokeWhite,
  Link,
  Lock,
  MouseBlack,
  MouseGray,
  PlusFill,
  Profile,
  RadioDefault,
  RadioSelected,
  Refresh,
  RefreshStrokeWhite,
  Search,
  ViewDetail,
  Credit,
  Kakao,
  WarningFillDanger,
  StepActive,
  StepDefault,
  HeartFillWhite,
  LikeSelected,
  LikeDefault,
  DislikeSelected,
  DislikeDefault,
  DislikeWhite,
} as const;

export type IconName = keyof typeof IconsName;
export type IconSize = '40' | '32' | '24' | '20' | '16' | '14' | '12';

export interface IconProps {
  name: IconName;
  size?: IconSize;
}

const Icon = ({ name, size = '24' }: IconProps) => {
  return (
    <img className={styles.iconSize[size]} src={IconsName[name]} alt={name} />
  );
};

export default Icon;

import ArrowLeft from '@assets/v2/svg/ArrowLeft.svg?url';
import ArrowLeftFill from '@assets/v2/svg/ArrowLeftFill.svg?url';
import ArrowRight from '@assets/v2/svg/ArrowRight.svg?url';
import ArrowRightFill from '@assets/v2/svg/ArrowRightFill.svg?url';
import ArrowUp from '@assets/v2/svg/ArrowUp.svg?url';
import BookBlack from '@assets/v2/svg/BookBlack.svg?url';
import BookGray from '@assets/v2/svg/BookGray.svg?url';
import ChevronDown from '@assets/v2/svg/ChevronDown.svg?url';
import ChevronDownFill from '@assets/v2/svg/ChevronDownFill.svg?url';
import ChevronUp from '@assets/v2/svg/ChevronUp.svg?url';
import Close from '@assets/v2/svg/Close.svg?url';
import CloseFillBlack from '@assets/v2/svg/CloseFillBlack.svg?url';
import CloseFillGray from '@assets/v2/svg/CloseFillGray.svg?url';
import Credit from '@assets/v2/svg/Credit.svg?url';
import CupBlack from '@assets/v2/svg/CupBlack.svg?url';
import CupGray from '@assets/v2/svg/CupGray.svg?url';
import DeskBlack from '@assets/v2/svg/DeskBlack.svg?url';
import DeskGray from '@assets/v2/svg/DeskGray.svg?url';
import DoubleStar from '@assets/v2/svg/DoubleStar.svg?url';
import FlipHorizontal from '@assets/v2/svg/FlipHorizontal.svg?url';
import HeartFillColor from '@assets/v2/svg/HeartFillColor.svg?url';
import HeartFillGray from '@assets/v2/svg/HeartFillGray.svg?url';
import HeartStrokeGray from '@assets/v2/svg/HeartStrokeGray.svg?url';
import HeartStrokeWhite from '@assets/v2/svg/HeartStrokeWhite.svg?url';
import Link from '@assets/v2/svg/Link.svg?url';
import Lock from '@assets/v2/svg/Lock.svg?url';
import MouseBlack from '@assets/v2/svg/MouseBlack.svg?url';
import MouseGray from '@assets/v2/svg/MouseGray.svg?url';
import PlusFill from '@assets/v2/svg/PlusFill.svg?url';
import Profile from '@assets/v2/svg/Profile.svg?url';
import RadioDefault from '@assets/v2/svg/RadioDefault.svg?url';
import RadioSelected from '@assets/v2/svg/RadioSelected.svg?url';
import Refresh from '@assets/v2/svg/Refresh.svg?url';
import Search from '@assets/v2/svg/Search.svg?url';
import ViewDetail from '@assets/v2/svg/ViewDetail.svg?url';

import * as styles from './Icon.css';

const IconsName = {
  ArrowLeft,
  ArrowLeftFill,
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
  CloseFillGray,
  CupBlack,
  CupGray,
  DeskBlack,
  DeskGray,
  DoubleStar,
  FlipHorizontal,
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
  Search,
  ViewDetail,
  Credit,
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

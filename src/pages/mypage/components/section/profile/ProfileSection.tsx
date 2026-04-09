import CreditBox from '@pages/mypage/components/creditBox/CreditBox';

import ProfileImage from '@assets/v2/svg/ProfileImage.svg?react';

import * as styles from './ProfileSection.css';

interface ProfileSectionProps {
  userName: string;
  credit: number;
  maxCredit: number;
}

const ProfileSection = ({
  userName,
  credit,
  maxCredit,
}: ProfileSectionProps) => {
  return (
    <section className={styles.container}>
      <div className={styles.profileBox}>
        <ProfileImage className={styles.profileImage} />
        <p className={styles.userName}>{userName}님</p>
      </div>
      <CreditBox creditCount={credit} maxCredit={maxCredit} />
    </section>
  );
};

export default ProfileSection;

import CreditBox from '@pages/mypage/components/creditBox/CreditBox';

import profileImage from '@assets/images/ProfileImage.svg';

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
        <img src={profileImage} alt="" className={styles.profileImage} />
        <p className={styles.userName}>{userName}님</p>
      </div>
      <CreditBox creditCount={credit} maxCredit={maxCredit} />
    </section>
  );
};

export default ProfileSection;

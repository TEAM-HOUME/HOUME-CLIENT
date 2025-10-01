import profileImage from '@/shared/assets/images/cardExImg.svg';
import CreditBox from '@/shared/components/creditBox/CreditBox';

import * as styles from './ProfileSection.css';

interface ProfileSectionProps {
  userName: string;
  credit: number;
  isChargeDisabled: boolean;
}

const ProfileSection = ({
  userName,
  credit,
  isChargeDisabled,
}: ProfileSectionProps) => {
  return (
    <section className={styles.container}>
      <div className={styles.profileBox}>
        <div
          className={styles.profileImage}
          style={{ backgroundImage: `url(${profileImage})` }}
        />
        <p className={styles.userName}>{userName}님</p>
      </div>
      <CreditBox credit={credit} disabled={isChargeDisabled} />
    </section>
  );
};

export default ProfileSection;

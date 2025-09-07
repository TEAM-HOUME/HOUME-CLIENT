import * as styles from './ProfileSection.css';
import ProfileIcon from '@/shared/assets/icons/me.svg?react';
import CreditBox from '@/shared/components/creditBox/CreditBox';

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
        <div className={styles.iconWrapper}>
          <ProfileIcon />
        </div>

        <div className={styles.creditWrapper}>
          <div className={styles.textArea}>
            <p>{userName}님,</p>
            <p>또 오셨네요!</p>
          </div>
          <CreditBox credit={credit} disabled={isChargeDisabled} />
        </div>
      </div>
    </section>
  );
};

export default ProfileSection;

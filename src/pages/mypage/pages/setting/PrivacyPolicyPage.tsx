import TitleNavBar from '@/shared/components/navBar/TitleNavBar';

import * as styles from './PolicyPage.css';

const PrivacyPolicy = () => {
  return (
    <div className={styles.container}>
      <TitleNavBar title="개인정보 처리방침" />

      <div className={styles.content}>
        <div className={styles.dateText}>25.10.16 개정안</div>

        <div className={styles.policyText}>
          {/* TODO: 실제 개인정보 처리방침 내용으로 교체 */}
          텍스트를 위한 공간입니다. 텍스트를 위한 공간입니다.텍스트를 위한
          공간입니다. 텍스트를 위한 공간입니다. 텍스트를 위한
          공간입니다.텍스트를 위한 공간입니다. 텍스트를 위한 공간입니다.
          텍스트를 위한 공간입니다.텍스트를 위한 공간입니다. 텍스트를 위한
          공간입니다. 텍스트를 위한 공간입니다.텍스트를 위한 공간입니다.
          텍스트를 위한 공간입니다. 텍스트를 위한 공간입니다.텍스트를 위한
          공간입니다.
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

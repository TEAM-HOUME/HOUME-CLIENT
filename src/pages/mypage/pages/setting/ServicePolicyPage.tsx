import TitleNavBar from '@/shared/components/navBar/TitleNavBar';

import * as styles from './PolicyPage.css';

const ServicePolicy = () => {
  return (
    <div className={styles.container}>
      <TitleNavBar title="서비스 이용 약관" />

      <div className={styles.content}>
        <div className={styles.dateText}>25.10.16 개정안</div>

        <div className={styles.policyText}>
          {/* TODO: 실제 서비스 이용 약관 내용으로 교체 */}
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

export default ServicePolicy;

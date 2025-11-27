import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import TitleNavBar from '@/shared/components/navBar/TitleNavBar';

import { PRIVACY_POLICY } from './constants/policies';
import * as styles from './PolicyPage.css';

const PrivacyPolicy = () => {
  return (
    <div className={styles.container}>
      <TitleNavBar title="개인정보 처리방침" />

      <div className={styles.content}>
        <div className={styles.dateText}>25.11.12 시행 </div>

        <div className={styles.policyText}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {PRIVACY_POLICY}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

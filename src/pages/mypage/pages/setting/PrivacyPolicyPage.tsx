import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import remarkGfm from 'remark-gfm';

import TitleNavBar from '@/shared/components/v2/navBar/TitleNavBar';

import { PRIVACY_POLICY } from './constants/policies';
import * as styles from './PolicyPage.css';

const PrivacyPolicyPage = () => {
  const navigate = useNavigate();
  return (
    <div className={styles.container}>
      <TitleNavBar
        title="개인정보 처리방침"
        backLabel="이전"
        onBackClick={() => navigate(-1)}
      />

      <div className={styles.content}>
        <div className={styles.dateText}>25.11.12 시행</div>

        <div className={styles.policyText}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {PRIVACY_POLICY}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;

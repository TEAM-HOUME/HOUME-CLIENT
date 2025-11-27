import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import TitleNavBar from '@/shared/components/navBar/TitleNavBar';

import { SERVICE_TERMS } from './constants/policies';
import * as styles from './PolicyPage.css';

const ServicePolicy = () => {
  return (
    <div className={styles.container}>
      <TitleNavBar title="서비스 이용 약관" />
      <div className={styles.content}>
        <div className={styles.dateText}>25.11.12 시행</div>
        <div className={styles.policyText}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {SERVICE_TERMS}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default ServicePolicy;

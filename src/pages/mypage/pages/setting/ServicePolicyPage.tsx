import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import remarkGfm from 'remark-gfm';

import { GA_EVENTS } from '@analytics/events';
import { useAnalyticsPageView } from '@analytics/hooks/useAnalyticsPageView';
import { SCREEN_NAME } from '@analytics/screenNames';

import TitleNavBar from '@components/navBar/TitleNavBar';

import { SERVICE_TERMS } from './constants/policies';
import * as styles from './PolicyPage.css';

const ServicePolicyPage = () => {
  const navigate = useNavigate();

  useAnalyticsPageView(
    GA_EVENTS.serviceTerm.PAGE_VIEW,
    SCREEN_NAME.SERVICE_TERM
  );

  return (
    <div className={styles.container}>
      <TitleNavBar
        title="서비스 이용 약관"
        backLabel="이전"
        onBackClick={() => navigate(-1)}
      />
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

export default ServicePolicyPage;

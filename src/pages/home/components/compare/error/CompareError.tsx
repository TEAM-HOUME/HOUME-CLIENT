import type { CompareErrorCase } from '@pages/home/constants/compareErrorCode';
import { COMPARE_ERROR_CONTENT } from '@pages/home/utils/compareErrorPresentation';

import img404Error from '@assets/images/img404Error.png';

import ActionButton from '@components/button/actionButton/ActionButton';

import * as styles from './CompareError.css';

interface CompareErrorProps {
  errorCase: CompareErrorCase;
  onAction: () => void;
}

const SUPPORT_EMAIL = 'houme.dev@gmail.com';

const CompareError = ({ errorCase, onAction }: CompareErrorProps) => {
  const { title, description, buttonLabel } = COMPARE_ERROR_CONTENT[errorCase];
  const [firstLine, secondLine] = description;
  const [beforeEmail, afterEmail] = firstLine.split(SUPPORT_EMAIL);

  return (
    <div className={styles.container}>
      <div className={styles.contents}>
        <img className={styles.image} src={img404Error} alt="" />
        <div className={styles.textContents}>
          <div className={styles.text}>
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.description}>
              {firstLine.includes(SUPPORT_EMAIL) ? (
                <>
                  {beforeEmail}
                  <a className={styles.email} href={`mailto:${SUPPORT_EMAIL}`}>
                    {SUPPORT_EMAIL}
                  </a>
                  {afterEmail}
                </>
              ) : (
                firstLine
              )}
              <br />
              {secondLine}
            </p>
          </div>
        </div>
      </div>
      <ActionButton
        variant="outlined"
        color="inverse"
        size="M"
        leftIcon="Search"
        onClick={onAction}
      >
        {buttonLabel}
      </ActionButton>
    </div>
  );
};

export default CompareError;

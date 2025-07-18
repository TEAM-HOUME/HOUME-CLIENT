import { useEffect, useState } from 'react';
import * as styles from './LoadingPage.css';
import { PROGRESS_CONFIG } from '../../constants/progressConfig';
import { useGenerateStore } from '../../stores/useGenerateStore';

const ProgressLoadingBar = () => {
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const { isApiCompleted } = useGenerateStore();

  // 90%까지 천천히 증가
  useEffect(() => {
    if (isDone) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= PROGRESS_CONFIG.SLOW_PHASE_END) {
          return PROGRESS_CONFIG.SLOW_PHASE_END;
        }
        return prev + PROGRESS_CONFIG.SLOW_INCREMENT;
      });
    }, PROGRESS_CONFIG.SLOW_INTERVAL);

    return () => clearInterval(interval);
  }, [isDone]);

  // 90%→100% 빠르게 증가
  useEffect(() => {
    if (!isDone) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= PROGRESS_CONFIG.FAST_PHASE_END) {
          console.log(
            '📊 프로그레스 바 100% 완료:',
            new Date().toLocaleTimeString()
          );
          return PROGRESS_CONFIG.FAST_PHASE_END;
        }
        return prev + PROGRESS_CONFIG.FAST_INCREMENT;
      });
    }, PROGRESS_CONFIG.FAST_INTERVAL);

    return () => clearInterval(interval);
  }, [isDone]);

  // API 완료 시 isDone = true
  useEffect(() => {
    if (isApiCompleted && !isDone) {
      setIsDone(true);
    }
  }, [isApiCompleted, isDone]);

  return (
    <div className={styles.progressBarBox}>
      <div className={styles.progressBack}>
        <div className={styles.progressBar} style={{ width: `${progress}%` }} />
      </div>
      <p className={styles.loadText}>
        이미지를 생성하는 중이에요 ({Math.floor(progress)}%)
      </p>
    </div>
  );
};

export default ProgressLoadingBar;

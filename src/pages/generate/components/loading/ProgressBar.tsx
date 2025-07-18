import { useEffect, useState } from 'react';
import * as styles from './LoadingPage.css';
import { PROGRESS_CONFIG } from '../../constants/progressConfig';
import { useGenerateStore } from '../../stores/useGenerateStore';

const ProgressLoadingBar = () => {
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const { isApiCompleted } = useGenerateStore();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    // 90% 까지 (1분 기준 약 49.5초)
    if (!isDone) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= PROGRESS_CONFIG.SLOW_PHASE_END) {
            if (interval) clearInterval(interval);
            return PROGRESS_CONFIG.SLOW_PHASE_END;
          }

          return prev + PROGRESS_CONFIG.SLOW_INCREMENT;
        });
      }, PROGRESS_CONFIG.SLOW_INTERVAL); // 0.1씩 0.1초마다 = 1% 오르는데 0.1초

      // API 완료 신호를 받으면 isDone을 true로 설정
      if (isApiCompleted) {
        if (timeout) clearTimeout(timeout);
        setIsDone(true);
      } else {
        // 기존 타이머 방식 (fallback)
        timeout = setTimeout(() => {
          setIsDone(true);
        }, PROGRESS_CONFIG.TOTAL_TIME);
      }
    } else {
      // 완료되었을 때 - 빠르게 100%로
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= PROGRESS_CONFIG.FAST_PHASE_END) {
            if (interval) clearInterval(interval);
            console.log(
              '📊 프로그레스 바 100% 완료:',
              new Date().toLocaleTimeString()
            );
            return PROGRESS_CONFIG.FAST_PHASE_END;
          }
          return prev + PROGRESS_CONFIG.FAST_INCREMENT;
        });
      }, PROGRESS_CONFIG.FAST_INTERVAL); // 0.1씩 약 0.122초마다
    }

    return () => {
      if (interval) clearInterval(interval);
      if (timeout) clearTimeout(timeout);
    };
  }, [isDone, isApiCompleted]);

  // API 완료 신호를 받으면 즉시 isDone 상태로 전환
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

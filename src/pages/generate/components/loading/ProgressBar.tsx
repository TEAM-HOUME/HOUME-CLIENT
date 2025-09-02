import { useEffect, useRef, useState } from 'react';
import * as styles from './LoadingPage.css';
import { PROGRESS_CONFIG } from '../../constants/progressConfig';
import { useGenerateStore } from '../../stores/useGenerateStore';

interface ProgressLoadingBarProps {
  onComplete?: () => void;
}

const ProgressLoadingBar = ({ onComplete }: ProgressLoadingBarProps) => {
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

  const doneRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 90%→100% 빠르게 증가
  useEffect(() => {
    if (!isDone) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= PROGRESS_CONFIG.FAST_PHASE_END) {
          if (!doneRef.current) {
            doneRef.current = true; // 렌더 간에도 유지되어 중복 방지
            clearInterval(interval);

            // 100% 완료 시 약간의 지연 후 onComplete 콜백 호출
            timeoutRef.current = setTimeout(() => {
              onComplete?.();
            }, PROGRESS_CONFIG.DELAY_BEFORE_COMPLETE_MS);
          }

          console.log(
            '📊 프로그레스 바 100% 완료:',
            new Date().toLocaleTimeString()
          );

          return PROGRESS_CONFIG.FAST_PHASE_END;
        }
        return prev + PROGRESS_CONFIG.FAST_INCREMENT;
      });
    }, PROGRESS_CONFIG.FAST_INTERVAL);

    return () => {
      clearInterval(interval);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isDone, onComplete]);

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

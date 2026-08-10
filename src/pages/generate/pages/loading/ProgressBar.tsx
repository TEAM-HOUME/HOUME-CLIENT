import { useEffect, useRef, useState } from 'react';

import * as styles from './ProgressBar.css';
import { PROGRESS_CONFIG } from '../../constants/progressConfig';
import { useGenerateStore } from '../../stores/useGenerateStore';

interface ProgressLoadingBarProps {
  onComplete?: () => void;
}

// 로테이션할 안내 문구 배열
const LOADING_MESSAGES = [
  '새로고침이나 페이지 이탈 시, 이미지 생성이 중단돼요',
  '이미지를 생성하는 중이에요',
] as const;

const MESSAGE_ROTATION_INTERVAL = 3000; // 3초

const ProgressLoadingBar = ({ onComplete }: ProgressLoadingBarProps) => {
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const { isApiCompleted } = useGenerateStore();
  const doneRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCompleteRef = useRef(onComplete);

  // onComplete이 변경될 때마다 ref 업데이트
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

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
          if (!doneRef.current) {
            doneRef.current = true; // 렌더 간에도 유지되어 중복 방지
            clearInterval(interval);

            // 100% 완료 시 약간의 지연 후 onComplete 콜백 호출
            timeoutRef.current = setTimeout(() => {
              onCompleteRef.current?.();
            }, PROGRESS_CONFIG.DELAY_BEFORE_COMPLETE_MS);
          }

          // console.log(
          //   '📊 프로그레스 바 100% 완료:',
          //   new Date().toLocaleTimeString()
          // );

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
  }, [isDone]);

  // API 완료 시 isDone = true
  useEffect(() => {
    if (isApiCompleted && !isDone) {
      setIsDone(true);
    }
  }, [isApiCompleted, isDone]);

  // 문구 로테이션 효과 (3초마다 변경)
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, MESSAGE_ROTATION_INTERVAL);

    return () => clearInterval(messageInterval);
  }, []);

  return (
    <div className={styles.progressBarBox}>
      <div className={styles.progressTrack}>
        <div className={styles.progressBack} />
        <div className={styles.progressBar} style={{ width: `${progress}%` }} />
      </div>

      <div className={styles.progressInfo}>
        <span className={styles.progressPercent}>{Math.floor(progress)}%</span>
        <div className={styles.loadTextContainer}>
          <p key={messageIndex} className={styles.loadText}>
            {LOADING_MESSAGES[messageIndex]}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProgressLoadingBar;

import { useCallback, useEffect, useRef } from 'react';

import {
  trackSignupBrowserBackClick,
  trackSignupBrowserBackSwipe,
  trackSignupErrorBirthIncorrectView,
  trackSignupErrorBirthUnder14View,
  trackSignupErrorNickNumView,
  trackSignupErrorNickSignView,
} from '@pages/signup/analytics/signupFormAnalytics';
import { getSignupStep } from '@pages/signup/utils/getSignupStep';

import { GA_EVENTS } from '@analytics/events';
import { useAnalyticsPageView } from '@analytics/hooks/useAnalyticsPageView';
import { SCREEN_NAME } from '@analytics/screenNames';
import { getLoginSocialParams } from '@analytics/utils/loginEntryRoute/buildLoginSocialEventParams';

import {
  VALIDATION_RULES,
  isMinLength,
  isValidNicknameFormat,
} from '@utils/userFormValidation';

/** iOS 뒤로가기 제스처 휴리스틱 — 화면 왼쪽 가장자리에서 오른쪽으로 스와이프 */
const SWIPE_START_MAX_X = 50;
const SWIPE_MIN_DELTA_X = 80;
const SWIPE_MAX_DELTA_Y = 50;
/** desktop Chrome trackpad history swipe arrives as horizontal wheel before popstate */
const WHEEL_SWIPE_MIN_DELTA_X = 80;
const WHEEL_SWIPE_MAX_DELTA_Y = 50;
const SWIPE_GESTURE_TTL_MS = 1000;

interface UseSignupFormAnalyticsOptions {
  enabled: boolean;
  handleNicknameChange: (value: string) => void;
  isNameSectionValid: boolean;
  isNameSubmitted: boolean;
  isBirthSectionValid: boolean;
  yearFormatError: boolean;
  yearAgeError: boolean;
  monthFieldError: boolean;
  dayFieldError: boolean;
}

/**
 * 회원가입 폼 GA — page_view, 에러 view, 브라우저 뒤로가기(click/swipe) 전송.
 * `trackBrowserBackPop`은 SignupPage 브라우저 뒤로가기 가드에 연결.
 */
export const useSignupFormAnalytics = ({
  enabled,
  handleNicknameChange,
  isNameSectionValid,
  isNameSubmitted,
  isBirthSectionValid,
  yearFormatError,
  yearAgeError,
  monthFieldError,
  dayFieldError,
}: UseSignupFormAnalyticsOptions) => {
  /** touchmove에서 swipe를 먼저 표시 — popstate보다 touchend가 늦게 오는 경우 대비 */
  const backGestureRef = useRef<'click' | 'swipe' | null>(null);
  const swipeResetTimeoutRef = useRef<number | null>(null);
  /** 동일 에러 메시지 view 이벤트 중복 전송 방지 (생년월일) */
  const trackedErrorsRef = useRef(new Set<string>());
  const prevNicknameFormatInvalidRef = useRef(false);
  const prevNicknameLengthInvalidRef = useRef(false);

  const signupStep = getSignupStep({
    isNameSectionValid,
    isNameSubmitted,
    isBirthSectionValid,
  });

  useAnalyticsPageView(
    GA_EVENTS.signupForm.PAGE_VIEW,
    SCREEN_NAME.SIGNUP_FORM,
    getLoginSocialParams(),
    { enabled }
  );

  const clearSwipeResetTimer = useCallback(() => {
    if (swipeResetTimeoutRef.current === null) return;

    window.clearTimeout(swipeResetTimeoutRef.current);
    swipeResetTimeoutRef.current = null;
  }, []);

  const markBackSwipe = useCallback(() => {
    backGestureRef.current = 'swipe';
    clearSwipeResetTimer();

    swipeResetTimeoutRef.current = window.setTimeout(() => {
      if (backGestureRef.current === 'swipe') {
        backGestureRef.current = null;
      }
      swipeResetTimeoutRef.current = null;
    }, SWIPE_GESTURE_TTL_MS);
  }, [clearSwipeResetTimer]);

  useEffect(() => {
    if (!enabled) return;

    let touchStartX = 0;
    let touchStartY = 0;
    let isEdgeSwipeCandidate = false;

    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;

      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      isEdgeSwipeCandidate = touchStartX <= SWIPE_START_MAX_X;

      if (isEdgeSwipeCandidate) {
        backGestureRef.current = null;
      }
    };

    const markSwipeIfNeeded = (clientX: number, clientY: number) => {
      if (!isEdgeSwipeCandidate) return;

      const deltaX = clientX - touchStartX;
      const deltaY = Math.abs(clientY - touchStartY);

      if (deltaX >= SWIPE_MIN_DELTA_X && deltaY <= SWIPE_MAX_DELTA_Y) {
        markBackSwipe();
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;

      markSwipeIfNeeded(touch.clientX, touch.clientY);
    };

    const handleTouchEnd = (event: TouchEvent) => {
      const touch = event.changedTouches[0];
      if (!touch) return;

      markSwipeIfNeeded(touch.clientX, touch.clientY);
      isEdgeSwipeCandidate = false;
    };

    const handleWheel = (event: WheelEvent) => {
      if (
        Math.abs(event.deltaX) >= WHEEL_SWIPE_MIN_DELTA_X &&
        Math.abs(event.deltaY) <= WHEEL_SWIPE_MAX_DELTA_Y
      ) {
        markBackSwipe();
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('wheel', handleWheel);
      clearSwipeResetTimer();
    };
  }, [clearSwipeResetTimer, enabled, markBackSwipe]);

  const trackNicknameChange = useCallback(
    (value: string) => {
      const nextFormatInvalid = value !== '' && !isValidNicknameFormat(value);
      const nextLengthInvalid =
        value !== '' && !isMinLength(value, VALIDATION_RULES.NAME_MIN_LENGTH);
      const visibleLengthInvalid = nextLengthInvalid && !nextFormatInvalid;

      handleNicknameChange(value);

      if (!enabled) {
        prevNicknameFormatInvalidRef.current = nextFormatInvalid;
        prevNicknameLengthInvalidRef.current = visibleLengthInvalid;
        return;
      }

      if (nextFormatInvalid && !prevNicknameFormatInvalidRef.current) {
        trackSignupErrorNickSignView();
      }

      if (visibleLengthInvalid && !prevNicknameLengthInvalidRef.current) {
        trackSignupErrorNickNumView();
      }

      prevNicknameFormatInvalidRef.current = nextFormatInvalid;
      prevNicknameLengthInvalidRef.current = visibleLengthInvalid;
    },
    [enabled, handleNicknameChange]
  );

  useEffect(() => {
    if (!enabled || !yearAgeError) return;
    if (trackedErrorsRef.current.has('birthUnder14')) return;

    trackedErrorsRef.current.add('birthUnder14');
    trackSignupErrorBirthUnder14View();
  }, [enabled, yearAgeError]);

  // 만 14세 미만 에러가 우선 — 동시에 birthIncorrect view는 보내지 않음
  useEffect(() => {
    if (!enabled || yearAgeError) return;

    const hasBirthFormatError =
      yearFormatError || monthFieldError || dayFieldError;
    if (!hasBirthFormatError) return;
    if (trackedErrorsRef.current.has('birthIncorrect')) return;

    trackedErrorsRef.current.add('birthIncorrect');
    trackSignupErrorBirthIncorrectView();
  }, [dayFieldError, enabled, monthFieldError, yearAgeError, yearFormatError]);

  /** 브라우저 뒤로가기(POP) — click / swipe 이벤트 분기 */
  const trackBrowserBackPop = useCallback(() => {
    const gesture = backGestureRef.current ?? 'click';
    clearSwipeResetTimer();
    backGestureRef.current = null;

    if (gesture === 'swipe') {
      trackSignupBrowserBackSwipe(signupStep);
      return;
    }

    trackSignupBrowserBackClick(signupStep);
  }, [clearSwipeResetTimer, signupStep]);

  return {
    signupStep,
    trackBrowserBackPop,
    trackNicknameChange,
  };
};

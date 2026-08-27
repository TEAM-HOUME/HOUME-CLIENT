import { useCallback, useEffect, useRef, useState } from 'react';

import { overlay } from 'overlay-kit';
import { NavigationType, useLocation, useNavigate } from 'react-router-dom';

import {
  trackSignupBirthFocus,
  trackSignupCtaClick,
  trackSignupGenderClick,
  trackSignupNickClearClick,
  trackSignupNickRandomClick,
  trackSignupNicknameFocus,
  trackSignupNotCompModalKeepClick,
  trackSignupNotCompModalQuitClick,
  trackSignupNotCompModalView,
} from '@pages/signup/analytics/signupFormAnalytics';
import { useSignupFormAnalytics } from '@pages/signup/analytics/useSignupFormAnalytics';

import { ROUTES } from '@routes/paths';

import ActionButton from '@components/button/actionButton/ActionButton';
import Chip from '@components/chip/Chip';
import Icon from '@components/icon/Icon';
import Popup from '@components/popup/Popup';
import DateField from '@components/userFormField/DateField';
import TextField from '@components/userFormField/TextField';

import { ERROR_MESSAGES } from '@constants/clientErrorMessage';

import {
  SIGNUP_EXIT_MODAL_PENDING_KEY,
  useBrowserBackTrap,
} from '@hooks/useBrowserBackTrap';
import { useExitBlocker } from '@hooks/useExitBlocker';
import { useRandomNickname } from '@hooks/useRandomNickname';
import useUserForm from '@hooks/useUserForm';

import { useSignupMutation } from './apis/mutations/useSignupMutation';
import * as styles from './SignupPage.css';

interface SignupLocationState {
  signupToken?: string | null;
}

const isSignupLocationState = (
  value: unknown
): value is SignupLocationState => {
  if (!value || typeof value !== 'object') return false;

  const state = value as Record<string, unknown>;
  if (!('signupToken' in state)) return false;

  const signupToken = state['signupToken'];
  return signupToken == null || typeof signupToken === 'string';
};

const SignupPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isInitialized = useRef(false);
  const nicknameRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);
  const [isNameSubmitted, setIsNameSubmitted] = useState(false);
  const shouldFocusBirthFieldRef = useRef(false);

  const routeSignupToken = isSignupLocationState(location.state)
    ? (location.state['signupToken'] ?? null)
    : null;
  const signupToken = routeSignupToken ?? sessionStorage.getItem('signupToken');

  useEffect(() => {
    if (routeSignupToken) {
      sessionStorage.setItem('signupToken', routeSignupToken);
    }
  }, [routeSignupToken]);

  useEffect(() => {
    if (!signupToken) {
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }, [signupToken, navigate]);

  const {
    nickname,
    birthYear,
    birthMonth,
    birthDay,
    gender,
    handleNicknameChange,
    handleBirthYearChange,
    handleBirthMonthChange,
    handleBirthDayChange,
    setGender,
    isNameFormatInvalid,
    isNameLengthInvalid,
    yearFormatError,
    yearAgeError,
    monthFieldError,
    dayFieldError,
    isFormValid,
  } = useUserForm();

  const isNameSectionValid =
    nickname !== '' && !isNameFormatInvalid && !isNameLengthInvalid;

  const isBirthSectionValid =
    birthYear !== '' &&
    birthMonth !== '' &&
    birthDay !== '' &&
    !yearFormatError &&
    !yearAgeError &&
    !monthFieldError &&
    !dayFieldError;

  const { signupStep, trackBrowserBackPop, trackNicknameChange } =
    useSignupFormAnalytics({
      enabled: !!signupToken,
      handleNicknameChange,
      isNameSectionValid,
      isNameSubmitted,
      isBirthSectionValid,
      yearFormatError,
      yearAgeError,
      monthFieldError,
      dayFieldError,
    });

  const isExitModalOpenRef = useRef(false);
  const isIntentionalQuitRef = useRef(false);
  const allowBrowserBackExitRef = useRef<() => void>(() => {});

  const clearSignupSession = useCallback(() => {
    sessionStorage.removeItem('signupToken');
    sessionStorage.removeItem(SIGNUP_EXIT_MODAL_PENDING_KEY);
  }, []);

  const quitSignup = useCallback(() => {
    isIntentionalQuitRef.current = true;
    allowBrowserBackExitRef.current();
    clearSignupSession();
    navigate(ROUTES.LOGIN, { replace: true });
  }, [clearSignupSession, navigate]);

  const openSignupExitModal = useCallback(
    ({ onStay, onQuit }: { onStay?: () => void; onQuit: () => void }) => {
      if (isExitModalOpenRef.current) return;
      isExitModalOpenRef.current = true;

      trackSignupNotCompModalView(signupStep);

      overlay.open(({ unmount }) => {
        const stay = () => {
          isExitModalOpenRef.current = false;
          onStay?.();
          unmount();
        };

        const quit = () => {
          isExitModalOpenRef.current = false;
          unmount();
          onQuit();
        };

        return (
          <Popup
            btnStyle="text"
            containerSize="creditRequest"
            btnText="계속하기"
            weakBtnText="그만두기"
            topIconName="WarningFillDanger"
            onClose={() => {
              trackSignupNotCompModalKeepClick(signupStep);
              stay();
            }}
            onConfirm={() => {
              trackSignupNotCompModalKeepClick(signupStep);
              stay();
            }}
            onCancel={() => {
              trackSignupNotCompModalQuitClick(signupStep);
              quit();
            }}
            content={
              <div className={styles.popupContent}>
                <h3 className={styles.popupTitle}>
                  아직 회원가입이 완료되지 않았어요!
                </h3>
                <p className={styles.popupDetail}>
                  지금 나가면 무료로 이미지를 만들 수 있는
                  <br />
                  토큰이 사라져요. 가입을 그만두시겠어요?
                </p>
              </div>
            }
          />
        );
      });
    },
    [signupStep]
  );

  const { allowExit: allowBrowserBackExit } = useBrowserBackTrap({
    enabled: !!signupToken,
    onBack: () => {
      trackBrowserBackPop();
      openSignupExitModal({ onQuit: quitSignup });
    },
  });

  useEffect(() => {
    allowBrowserBackExitRef.current = allowBrowserBackExit;
  }, [allowBrowserBackExit]);

  // OAuth callback으로 잠깐 이동했다 복귀한 경우 모달 복구
  useEffect(() => {
    if (!signupToken) return;
    if (sessionStorage.getItem(SIGNUP_EXIT_MODAL_PENDING_KEY) !== '1') return;

    sessionStorage.removeItem(SIGNUP_EXIT_MODAL_PENDING_KEY);
    trackBrowserBackPop();
    openSignupExitModal({ onQuit: quitSignup });
  }, [signupToken, trackBrowserBackPop, openSignupExitModal, quitSignup]);

  useExitBlocker({
    enabled: !!signupToken,
    shouldBlockNavigation: ({ nextLocation, historyAction }) => {
      if (isIntentionalQuitRef.current) return false;
      if (nextLocation.pathname === ROUTES.WELCOME) return false;

      // 브라우저 뒤로가기(POP)는 useBrowserBackTrap이 처리
      if (historyAction === NavigationType.Pop) return false;

      return true;
    },
    onBlocked: ({ proceed, reset }) => {
      openSignupExitModal({
        onStay: reset,
        onQuit: () => {
          isIntentionalQuitRef.current = true;
          clearSignupSession();
          proceed();
        },
      });
    },
  });

  const { mutate: signUp } = useSignupMutation();
  const { randomNickname, refresh } = useRandomNickname(trackNicknameChange);

  useEffect(() => {
    if (!isNameSectionValid) {
      setIsNameSubmitted(false);
    }
  }, [isNameSectionValid]);

  useEffect(() => {
    if (randomNickname && !isInitialized.current && nickname === '') {
      trackNicknameChange(randomNickname);
      isInitialized.current = true;

      const el = nicknameRef.current;
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
    }
  }, [randomNickname, nickname, trackNicknameChange]);

  const handleNicknameEnter = () => {
    if (isNameSectionValid) {
      shouldFocusBirthFieldRef.current = true;
      setIsNameSubmitted(true);

      if (isNameSubmitted) {
        yearRef.current?.focus();
        shouldFocusBirthFieldRef.current = false;
      }
    }
  };

  const handleNicknameFieldBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const nextFocusedElement = e.relatedTarget;
    if (
      nextFocusedElement instanceof Node &&
      e.currentTarget.contains(nextFocusedElement)
    ) {
      return;
    }

    if (isNameSectionValid) {
      shouldFocusBirthFieldRef.current = false;
      setIsNameSubmitted(true);
    }
  };

  useEffect(() => {
    if (
      isNameSubmitted &&
      isNameSectionValid &&
      shouldFocusBirthFieldRef.current
    ) {
      yearRef.current?.focus();
      shouldFocusBirthFieldRef.current = false;
    }
  }, [isNameSubmitted, isNameSectionValid]);

  const handleRandomNicknameRefresh = useCallback(() => {
    trackSignupNickRandomClick();
    refresh();
  }, [refresh]);

  const handleGenderSelect = useCallback(
    (nextGender: NonNullable<typeof gender>) => {
      trackSignupGenderClick();
      setGender(nextGender);
    },
    [setGender]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid || !gender || !signupToken) return;

    const formattedBirthday = `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`;

    trackSignupCtaClick();
    signUp({
      signupToken,
      nickname,
      gender,
      birthday: formattedBirthday,
    });
  };

  if (!signupToken) return null;

  const nameErrorMessage = (() => {
    if (isNameFormatInvalid) return ERROR_MESSAGES.NAME_INVALID;
    if (isNameLengthInvalid) return ERROR_MESSAGES.LENGTH_INVALID;
    return '';
  })();

  const birthErrorMessage = (() => {
    if (yearAgeError) return ERROR_MESSAGES.AGE_INVALID;
    if (yearFormatError || monthFieldError || dayFieldError)
      return ERROR_MESSAGES.BIRTH_INVALID;
    return '';
  })();

  const dateErrorStatus = {
    year: birthYear !== '' && (yearFormatError || yearAgeError),
    month: birthMonth !== '' && monthFieldError,
    day: birthDay !== '' && dayFieldError,
  };

  return (
    <form onSubmit={handleSubmit} className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.iconContainer}>
          <Icon name="StepDefault" size="12" />
          <Icon name="StepActive" size="12" />
        </div>
        <h1 className={styles.title}>완료까지 한 걸음 남았어요!</h1>
      </header>

      <div className={styles.container}>
        <div
          className={styles.fieldbox}
          onBlurCapture={handleNicknameFieldBlur}
        >
          <h2 className={styles.fieldtitle}>닉네임</h2>
          <div className={styles.flexbox}>
            <TextField
              value={nickname}
              ref={nicknameRef}
              onChange={trackNicknameChange}
              isError={isNameFormatInvalid || isNameLengthInvalid}
              errorMessage={nameErrorMessage}
              maxLength={18}
              onFocus={trackSignupNicknameFocus}
              onRefresh={handleRandomNicknameRefresh}
              onClear={trackSignupNickClearClick}
              onEnter={handleNicknameEnter}
            />
          </div>
        </div>

        {isNameSectionValid && isNameSubmitted && (
          <div className={styles.fieldbox}>
            <h2 className={styles.fieldtitle}>생년월일</h2>
            <div className={styles.flexbox}>
              <DateField
                ref={yearRef}
                value={{ year: birthYear, month: birthMonth, day: birthDay }}
                onChange={(value) => {
                  handleBirthYearChange(value.year);
                  handleBirthMonthChange(value.month);
                  handleBirthDayChange(value.day);
                }}
                error={dateErrorStatus}
                errorMessage={birthErrorMessage}
                onFocus={trackSignupBirthFocus}
              />
            </div>
          </div>
        )}

        {isNameSectionValid && isNameSubmitted && isBirthSectionValid && (
          <div className={styles.fieldbox}>
            <h2 className={styles.fieldtitle}>성별</h2>
            <div className={styles.flexbox}>
              <Chip
                selected={gender === 'MALE'}
                color="weak"
                onClick={() => handleGenderSelect('MALE')}
              >
                남성
              </Chip>
              <Chip
                selected={gender === 'FEMALE'}
                color="weak"
                onClick={() => handleGenderSelect('FEMALE')}
              >
                여성
              </Chip>
              <Chip
                selected={gender === 'NONBINARY'}
                color="weak"
                onClick={() => handleGenderSelect('NONBINARY')}
              >
                밝히고 싶지 않음
              </Chip>
            </div>
          </div>
        )}
      </div>

      <div className={styles.btnarea}>
        <ActionButton
          disabled={!isFormValid || !signupToken}
          type="submit"
          fullWidth
        >
          완료하기
        </ActionButton>
      </div>
    </form>
  );
};

export default SignupPage;

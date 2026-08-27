import { SIGNUP_STEP, type SignupStep } from '@analytics/params/auth';

interface SignupStepInput {
  isNameSectionValid: boolean;
  isNameSubmitted: boolean;
  isBirthSectionValid: boolean;
}

/**
 * 회원가입 폼 진행 단계(signup_step) 계산 — 폼 상태 기반 도메인 규칙.
 * GA param이 아니라 폼 진행도이므로 analytics 밖 utils에 둔다.
 */
export const getSignupStep = ({
  isNameSectionValid,
  isNameSubmitted,
  isBirthSectionValid,
}: SignupStepInput): SignupStep => {
  if (isNameSectionValid && isNameSubmitted && isBirthSectionValid) {
    return SIGNUP_STEP.GENDER_SELECT;
  }

  if (isNameSectionValid && isNameSubmitted) {
    return SIGNUP_STEP.BIRTH_INPUT;
  }

  return SIGNUP_STEP.NICKNAME_INPUT;
};

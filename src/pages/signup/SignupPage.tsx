import CtaButton from '@/shared/components/button/ctaButton/CtaButton.tsx';
import ErrorMessage from '@/shared/components/button/ErrorButton/ErrorMessage';
import LargeFilled from '@/shared/components/button/largeFilledButton/LargeFilledButton.tsx';
import TitleNavBar from '@/shared/components/navBar/TitleNavBar.tsx';
import TextField from '@/shared/components/textField/TextField.tsx';
import { ERROR_MESSAGES } from '@/shared/constants/clientErrorMessage.ts';

import { useSignupMutation } from './apis/signup';
import useSignupForm from './hooks/useSignupForm';
import * as styles from './SignupPage.css';

const SignupPage = () => {
  const {
    name,
    birthYear,
    birthMonth,
    birthDay,
    gender,
    handleNameChange,
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
  } = useSignupForm();

  const { mutate: patchSignup } = useSignupMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || !gender) return;

    const formattedBirthday = `${birthYear}-${birthMonth}-${birthDay}`;

    console.log(name, gender.value, formattedBirthday);

    patchSignup({
      name,
      gender: gender.value,
      birthday: formattedBirthday,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <TitleNavBar title="회원가입" isBackIcon={false} isLoginBtn={false} />

      <div className={styles.container}>
        <h1 className={styles.title}>추가 회원가입 정보</h1>

        {/* 이름 입력 */}
        <div className={styles.fieldbox}>
          <h2 className={styles.fieldtitle}>이름</h2>
          <TextField
            fieldSize="large"
            placeholder="이름을 입력해주세요."
            maxLength={25}
            value={name}
            onChange={handleNameChange}
            isError={isNameFormatInvalid || isNameLengthInvalid}
          />
          {isNameFormatInvalid && (
            <ErrorMessage message={ERROR_MESSAGES.NAME_INVALID} />
          )}
          {!isNameFormatInvalid && isNameLengthInvalid && (
            <ErrorMessage message={ERROR_MESSAGES.LENGTH_INVALID} />
          )}
        </div>

        {/* 생년월일 입력 */}
        <div className={styles.fieldbox}>
          <h2 className={styles.fieldtitle}>생년월일</h2>
          <div className={styles.flexbox}>
            <TextField
              fieldSize="small"
              placeholder="YYYY"
              maxLength={4}
              value={birthYear}
              onChange={handleBirthYearChange}
              isError={birthYear !== '' && (yearFormatError || yearAgeError)}
              inputMode="numeric"
            />
            <TextField
              fieldSize="small"
              placeholder="MM"
              maxLength={2}
              value={birthMonth}
              onChange={handleBirthMonthChange}
              isError={birthMonth !== '' && monthFieldError}
              inputMode="numeric"
            />
            <TextField
              fieldSize="small"
              placeholder="DD"
              maxLength={2}
              value={birthDay}
              onChange={handleBirthDayChange}
              isError={birthDay !== '' && dayFieldError}
              inputMode="numeric"
            />
          </div>
          {(() => {
            if (yearAgeError)
              return <ErrorMessage message={ERROR_MESSAGES.AGE_INVALID} />;
            if (yearFormatError || monthFieldError || dayFieldError)
              return <ErrorMessage message={ERROR_MESSAGES.BIRTH_INVALID} />;
            return null;
          })()}
        </div>

        {/* 성별 선택 */}
        <div className={styles.fieldbox}>
          <h2 className={styles.fieldtitle}>성별</h2>
          <div className={styles.flexbox}>
            <LargeFilled
              buttonSize="small"
              isSelected={gender?.value === 'MALE'}
              onClick={() => setGender({ value: 'MALE', label: '남성' })}
            >
              남성
            </LargeFilled>
            <LargeFilled
              buttonSize="small"
              isSelected={gender?.value === 'FEMALE'}
              onClick={() => setGender({ value: 'FEMALE', label: '여성' })}
            >
              여성
            </LargeFilled>
            <LargeFilled
              buttonSize="small"
              isSelected={gender?.value === 'NONBINARY'}
              onClick={() =>
                setGender({ value: 'NONBINARY', label: '논바이너리' })
              }
            >
              논바이너리
            </LargeFilled>
          </div>
        </div>
      </div>

      <div className={styles.btnarea}>
        <CtaButton isActive={isFormValid} type="submit">
          회원가입 완료하기
        </CtaButton>
      </div>
    </form>
  );
};

export default SignupPage;

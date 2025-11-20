import { useState, useMemo } from 'react';

import {
  VALIDATION_RULES,
  isKoreanOnly,
  isMinLength,
  filterKorean,
  isValidYearFormat,
  isValidMonthFormat,
  isValidDayFormat,
  isMinimumAge,
  isValidDate,
} from '../utils/validation';

import type { GenderOption } from '../types/formOptions';

const useSignupForm = () => {
  // -------------------------
  // 상태 관리
  // -------------------------
  const [name, setName] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [gender, setGender] = useState<GenderOption | null>(null);

  // -------------------------
  // 이름 유효성 검사
  // -------------------------
  // 한글만, 최소 길이 이상
  const isNameValid =
    isKoreanOnly(name) && isMinLength(name, VALIDATION_RULES.NAME_MIN_LENGTH);

  // 한글이 아닌 경우 에러
  const isNameFormatInvalid = name !== '' && !isKoreanOnly(name);

  // 한글이지만 길이 부족 에러
  const isNameLengthInvalid =
    name !== '' &&
    isKoreanOnly(name) &&
    !isMinLength(name, VALIDATION_RULES.NAME_MIN_LENGTH);

  // -------------------------
  // 생년월일 숫자 변환
  // -------------------------
  const yearNum = Number.parseInt(birthYear, 10);
  const monthNum = Number.parseInt(birthMonth, 10);
  const dayNum = Number.parseInt(birthDay, 10);

  // -------------------------
  // 생년월일 유효성 검사
  // -------------------------
  // 연도 형식 에러
  const yearFormatError = birthYear !== '' && !isValidYearFormat(birthYear);

  // 만 나이(14세 이상) 에러
  const yearAgeError = useMemo(() => {
    if (birthYear === '' || yearFormatError) return false;
    return !isMinimumAge(yearNum, monthNum, dayNum, VALIDATION_RULES.MIN_AGE);
  }, [birthYear, yearFormatError, yearNum, monthNum, dayNum]);

  // 월 형식/범위 에러
  const monthFieldError = useMemo(() => {
    if (birthMonth === '') return false;
    return !isValidMonthFormat(birthMonth) || monthNum < 1 || monthNum > 12;
  }, [birthMonth, monthNum]);

  // 일 형식/존재 에러
  const dayFieldError = useMemo(() => {
    if (birthDay === '') return false;
    if (!isValidDayFormat(birthDay)) return true;
    if (!isValidMonthFormat(birthMonth) || !isValidYearFormat(birthYear)) {
      return dayNum < 1 || dayNum > 31;
    }
    return !isValidDate(yearNum, monthNum, dayNum);
  }, [birthDay, birthMonth, birthYear, dayNum, monthNum, yearNum]);

  // -------------------------
  // 폼 전체 유효성 검사
  // -------------------------
  const validationResult = useMemo(() => {
    // 모든 필드가 입력되었는지
    const allFieldsFilled =
      name !== '' &&
      birthYear !== '' &&
      birthMonth !== '' &&
      birthDay !== '' &&
      gender !== null;

    // 모든 에러가 없는지
    const noErrors =
      isNameValid &&
      !yearFormatError &&
      !yearAgeError &&
      !monthFieldError &&
      !dayFieldError;

    // 에러가 있는지 확인
    const hasError = Boolean(
      isNameFormatInvalid ||
        isNameLengthInvalid ||
        yearFormatError ||
        yearAgeError ||
        monthFieldError ||
        dayFieldError
    );

    return {
      allFieldsFilled,
      noErrors,
      isFormValid: allFieldsFilled && noErrors,
      hasError,
    };
  }, [
    name,
    birthYear,
    birthMonth,
    birthDay,
    gender,
    isNameValid,
    isNameFormatInvalid,
    isNameLengthInvalid,
    yearFormatError,
    yearAgeError,
    monthFieldError,
    dayFieldError,
  ]);

  const { isFormValid, hasError } = validationResult;

  // -------------------------
  // 입력 핸들러
  // -------------------------
  // 이름 입력 핸들러 (한글만 필터)
  const handleNameChange = (input: string) => {
    const filtered = filterKorean(input);
    setName(filtered);
  };

  // 숫자만 입력받도록 처리하는 핸들러 생성 함수
  const handleNumericChange =
    (setter: (val: string) => void) => (val: string) => {
      const numeric = val.replace(/\D/g, '');
      setter(numeric);
    };

  // 각각의 생년/월/일 핸들러
  const handleBirthYearChange = handleNumericChange(setBirthYear);
  const handleBirthMonthChange = handleNumericChange(setBirthMonth);
  const handleBirthDayChange = handleNumericChange(setBirthDay);

  // -------------------------
  // 반환값: 상태, 핸들러, 검증 결과
  // -------------------------
  return {
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
    isFormValid,
    hasError,
    yearFormatError,
    yearAgeError,
    monthFieldError,
    dayFieldError,
  };
};

export default useSignupForm;

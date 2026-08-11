import { ErrorBoundary } from 'react-error-boundary';
import { useNavigate } from 'react-router-dom';

import { trackEditProfileCtaClick } from '@pages/mypage/analytics/editProfileAnalytics';
import { useEditProfileMutation } from '@pages/mypage/apis/mutations/useEditProfileMutation';
import { useMyPageProfileQuery } from '@pages/mypage/apis/queries/useEditProfileQuery';

import { GA_EVENTS } from '@shared/analytics/events';
import { useAnalyticsPageView } from '@shared/analytics/hooks';
import { SCREEN_NAME } from '@shared/analytics/screenNames';

import ActionButton from '@components/button/actionButton/ActionButton';
import Chip from '@components/chip/Chip';
import FeatureErrorFallback from '@components/errorFallback/FeatureErrorFallback';
import Loading from '@components/loading/Loading';
import TitleNavBar from '@components/navBar/TitleNavBar';
import DateField from '@components/userFormField/DateField';
import TextField from '@components/userFormField/TextField';

import { ERROR_MESSAGES } from '@constants/clientErrorMessage';

import { useRandomNickname } from '@hooks/useGetRandomNickname';
import useUserForm from '@hooks/useUserForm';

import * as styles from './ProfileEditPage.css';

const ProfileEditPage = () => {
  const { data: profile, isPending: isProfilePending } =
    useMyPageProfileQuery(); // 기본 정보 불러오기
  const birthParts = profile?.birthday?.split('-') ?? [];

  const navigate = useNavigate();

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
    isDirty,
  } = useUserForm({
    nickname: profile?.nickname,
    birthYear: birthParts[0],
    birthMonth: birthParts[1],
    birthDay: birthParts[2],
    gender: profile?.gender,
  });

  const { refresh } = useRandomNickname(handleNicknameChange);
  const { mutate: editProfile, isPending } = useEditProfileMutation();

  useAnalyticsPageView(
    GA_EVENTS.editProfile.PAGE_VIEW,
    SCREEN_NAME.EDIT_PROFILE,
    undefined,
    { enabled: !isProfilePending }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || !isDirty || !gender) return;

    trackEditProfileCtaClick();

    editProfile({
      nickname,
      gender,
      birthday: `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`,
    });
  };

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
    <ErrorBoundary FallbackComponent={FeatureErrorFallback}>
      {isProfilePending ? (
        <Loading />
      ) : (
        <>
          <TitleNavBar
            title="설정"
            backLabel="이전"
            onBackClick={() => navigate(-1)}
          />
          <form onSubmit={handleSubmit} className={styles.wrapper}>
            <div className={styles.container}>
              <div className={styles.fieldbox}>
                <h2 className={styles.fieldtitle}>닉네임</h2>
                <div className={styles.flexbox}>
                  <TextField
                    value={nickname}
                    onChange={handleNicknameChange}
                    isError={isNameFormatInvalid || isNameLengthInvalid}
                    errorMessage={nameErrorMessage}
                    maxLength={18}
                    onRefresh={refresh}
                  />
                </div>
              </div>

              <div className={styles.fieldbox}>
                <h2 className={styles.fieldtitle}>생년월일</h2>
                <div className={styles.flexbox}>
                  <DateField
                    value={{
                      year: birthYear,
                      month: birthMonth,
                      day: birthDay,
                    }}
                    onChange={(value) => {
                      handleBirthYearChange(value.year);
                      handleBirthMonthChange(value.month);
                      handleBirthDayChange(value.day);
                    }}
                    error={dateErrorStatus}
                    errorMessage={birthErrorMessage}
                  />
                </div>
              </div>

              <div className={styles.fieldbox}>
                <h2 className={styles.fieldtitle}>성별</h2>
                <div className={styles.flexbox}>
                  <Chip
                    selected={gender === 'MALE'}
                    color="weak"
                    onClick={() => setGender('MALE')}
                  >
                    남성
                  </Chip>
                  <Chip
                    selected={gender === 'FEMALE'}
                    color="weak"
                    onClick={() => setGender('FEMALE')}
                  >
                    여성
                  </Chip>
                  <Chip
                    selected={gender === 'NONBINARY'}
                    color="weak"
                    onClick={() => setGender('NONBINARY')}
                  >
                    밝히고 싶지 않음
                  </Chip>
                </div>
              </div>
            </div>

            <div className={styles.btnarea}>
              <ActionButton
                disabled={!isFormValid || !isDirty || isPending}
                type="submit"
                fullWidth
              >
                저장하기
              </ActionButton>
            </div>
          </form>
        </>
      )}
    </ErrorBoundary>
  );
};

export default ProfileEditPage;

import { memo, useEffect, useRef, useState } from 'react';

import { useDeleteResultPreferenceMutation } from '@pages/generate/apis/mutations/useDeleteResultPreferenceMutation';
import { useFactorPreferenceMutation } from '@pages/generate/apis/mutations/useFactorPreferenceMutation';
import { useResultPreferenceMutation } from '@pages/generate/apis/mutations/useResultPreferenceMutation';
import { useFactorsQuery } from '@pages/generate/apis/queries/useFactorsQuery';
import type { ResultPageLikeState } from '@pages/generate/types/generate';

import type { FactorItem } from '@shared/apis/__generated__/data-contracts';
import { TOAST_MESSAGE } from '@shared/constants/toastMessage';
import { TOAST_TYPE, TOASTER_ID } from '@shared/types/toast';

import IconButton from '@components/button/IconButton';
import Chip from '@components/chip/Chip';
import { useToast } from '@components/toast/useToast';

import * as styles from './ImgFeedback.css.ts';

export interface ImgFeedbackProps {
  imageId: number;
  onPreferenceClick?: (params: { genImgId: number; isLike: boolean }) => void;
  onFactorFeedbackThankYou?: () => void;
}

const ImgFeedback = memo(
  ({
    imageId,
    onPreferenceClick,
    onFactorFeedbackThankYou,
  }: ImgFeedbackProps) => {
    const [lockedPreference, setLockedPreference] =
      useState<ResultPageLikeState>(null);
    const [selectedFactorId, setSelectedFactorId] = useState<number | null>(
      null
    );
    const [isPreferenceSubmitting, setIsPreferenceSubmitting] = useState(false);
    const [isFactorSubmitting, setIsFactorSubmitting] = useState(false);
    const factorRequestSeqRef = useRef(0);
    const lockedPreferenceRef = useRef<ResultPageLikeState>(lockedPreference);
    const likeFactorsCacheRef = useRef<FactorItem[]>([]);
    const dislikeFactorsCacheRef = useRef<FactorItem[]>([]);

    const commitLockedPreference = (next: ResultPageLikeState) => {
      lockedPreferenceRef.current = next;
      setLockedPreference(next);
    };

    const { mutate: sendPreference } = useResultPreferenceMutation();
    const { mutate: deletePreference } = useDeleteResultPreferenceMutation();
    const { mutate: sendFactorPreference } = useFactorPreferenceMutation();
    const { notify } = useToast();
    const { data: likeFactorsResponse } = useFactorsQuery(true, {
      enabled: lockedPreference === 'like',
    });
    const { data: dislikeFactorsResponse } = useFactorsQuery(false, {
      enabled: lockedPreference === 'dislike',
    });
    const likeFactorsData = likeFactorsResponse?.factors;
    const dislikeFactorsData = dislikeFactorsResponse?.factors;

    useEffect(() => {
      if (likeFactorsData && likeFactorsData.length > 0) {
        likeFactorsCacheRef.current = likeFactorsData;
      }
    }, [likeFactorsData]);

    useEffect(() => {
      if (dislikeFactorsData && dislikeFactorsData.length > 0) {
        dislikeFactorsCacheRef.current = dislikeFactorsData;
      }
    }, [dislikeFactorsData]);

    const submitPreference = (
      targetImageId: number,
      finalState: Exclude<ResultPageLikeState, null>
    ) => {
      sendPreference(
        { imageId: targetImageId, isLike: finalState === 'like' },
        {
          onSuccess: () => {
            commitLockedPreference(finalState);
            setSelectedFactorId(null);
          },
          onSettled: () => setIsPreferenceSubmitting(false),
        }
      );
    };

    const handleLockedPreference = (isLike: boolean) => {
      if (isPreferenceSubmitting || isFactorSubmitting) return;

      const nextState: ResultPageLikeState = isLike ? 'like' : 'dislike';
      const finalState: ResultPageLikeState =
        lockedPreference === nextState ? null : nextState;

      setIsPreferenceSubmitting(true);

      if (finalState === null) {
        deletePreference(imageId, {
          onSuccess: () => {
            commitLockedPreference(null);
            setSelectedFactorId(null);
          },
          onSettled: () => setIsPreferenceSubmitting(false),
        });
        return;
      }

      onPreferenceClick?.({
        genImgId: imageId,
        isLike: finalState === 'like',
      });

      if (lockedPreference !== null && lockedPreference !== finalState) {
        if (selectedFactorId !== null) {
          const previousFactorId = selectedFactorId;
          setSelectedFactorId(null);
          sendFactorPreference(
            {
              imageId,
              factorId: previousFactorId,
            },
            {
              onSettled: () => {
                submitPreference(imageId, finalState);
              },
            }
          );
          return;
        }
      }

      submitPreference(imageId, finalState);
    };

    const handleFactorClick = (factorId: number) => {
      if (isFactorSubmitting || isPreferenceSubmitting) return;

      const isSelected = selectedFactorId === factorId;
      const expectedPreference = lockedPreference;
      const requestSeq = factorRequestSeqRef.current + 1;
      factorRequestSeqRef.current = requestSeq;
      setIsFactorSubmitting(true);

      sendFactorPreference(
        { imageId, factorId },
        {
          onSuccess: () => {
            if (factorRequestSeqRef.current !== requestSeq) return;
            if (lockedPreferenceRef.current !== expectedPreference) return;
            setSelectedFactorId(isSelected ? null : factorId);
            if (!isSelected) {
              onFactorFeedbackThankYou?.();
              notify({
                text: TOAST_MESSAGE.IMAGE_FEEDBACK_THANKS,
                type: TOAST_TYPE.INFO,
                options: { toasterId: TOASTER_ID.BOTTOM_4 },
              });
            }
          },
          onSettled: () => {
            if (factorRequestSeqRef.current !== requestSeq) return;
            setIsFactorSubmitting(false);
          },
        }
      );
    };

    const activeFactors =
      lockedPreference === 'like'
        ? likeFactorsData && likeFactorsData.length > 0
          ? likeFactorsData
          : likeFactorsCacheRef.current
        : lockedPreference === 'dislike'
          ? dislikeFactorsData && dislikeFactorsData.length > 0
            ? dislikeFactorsData
            : dislikeFactorsCacheRef.current
          : [];

    const factorRows =
      activeFactors.length > 0
        ? [activeFactors.slice(0, 2), activeFactors.slice(2, 4)]
        : [];

    return (
      <section className={styles.section}>
        <div className={styles.box}>
          <div className={styles.contentBox}>
            <div className={styles.textGroup}>
              <p className={styles.title}>생성된 이미지가 만족스러우신가요?</p>
              <p className={styles.description}>
                퀄리티 개선을 위해 피드백을 남겨주세요.
              </p>
            </div>
            <div className={styles.buttonGroup}>
              <IconButton
                name={
                  lockedPreference === 'like' ? 'LikeSelected' : 'LikeDefault'
                }
                size="M"
                disabled={isPreferenceSubmitting || isFactorSubmitting}
                onClick={() => handleLockedPreference(true)}
                aria-label="이미지 좋아요 버튼"
                aria-pressed={lockedPreference === 'like'}
              />
              <IconButton
                name={
                  lockedPreference === 'dislike'
                    ? 'DislikeSelected'
                    : 'DislikeDefault'
                }
                size="M"
                disabled={isPreferenceSubmitting || isFactorSubmitting}
                onClick={() => handleLockedPreference(false)}
                aria-label="이미지 싫어요 버튼"
                aria-pressed={lockedPreference === 'dislike'}
              />
            </div>
          </div>
          <div
            className={styles.tagGroup({ opened: lockedPreference !== null })}
          >
            {factorRows.map((rowFactors, rowIndex) => (
              <div key={rowIndex} className={styles.tagRow}>
                {rowFactors.map((factor) => (
                  <Chip
                    key={factor.id}
                    selected={selectedFactorId === factor.id}
                    onClick={() =>
                      factor.id !== undefined && handleFactorClick(factor.id)
                    }
                    disabled={isFactorSubmitting || isPreferenceSubmitting}
                  >
                    {factor.text}
                  </Chip>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
);

ImgFeedback.displayName = 'ImgFeedback';

export default ImgFeedback;

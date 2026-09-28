import { TOASTER_ID, TOAST_TYPE } from '@shared/types/toast';

import { useToast } from '@components/toast/useToast';

import { TOAST_ACTION_LABEL, TOAST_MESSAGE } from '@constants/toastMessage';

interface NotifyJjymToastParams {
  favorited: boolean;
  onAction?: () => void;
}

const TOAST_OPTIONS = { toasterId: TOASTER_ID.BOTTOM_4 };

export const useJjymToast = () => {
  const { notify } = useToast();

  const notifyJjymToast = ({ favorited, onAction }: NotifyJjymToastParams) => {
    notify({
      text: favorited
        ? TOAST_MESSAGE.SAVED_ITEM_STORED
        : TOAST_MESSAGE.SAVED_ITEM_REMOVED,
      type: TOAST_TYPE.ACTION,
      actionLabel: favorited
        ? TOAST_ACTION_LABEL.VIEW
        : TOAST_ACTION_LABEL.UNDO,
      onClick: onAction,
      options: TOAST_OPTIONS,
    });
  };

  const notifyJjymError = () => {
    notify({
      text: TOAST_MESSAGE.ACTION_SERVER_ERROR,
      type: TOAST_TYPE.ERROR,
      options: TOAST_OPTIONS,
    });
  };

  return { notifyJjymToast, notifyJjymError };
};

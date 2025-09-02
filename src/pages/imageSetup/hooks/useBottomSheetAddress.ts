import { useMutation } from '@tanstack/react-query';
import { postAddress } from '../apis/bottomSheetAddressApi';
import type { BottomSheetAddressRequest } from '../types/apis/bottomSheetAddress.types';

export const useBottomSheetAddress = () => {
  return useMutation({
    mutationFn: (body: BottomSheetAddressRequest) => postAddress(body),
    onSuccess: () => {
      console.log('주소 등록 성공!');
    },
    onError: (error) => {
      console.error('주소 등록 실패', error);
    },
  });
};

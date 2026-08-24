import type { SaveStatus, TriggerContext } from '@analytics/params/product';

/** 상품 카드 공통 DB 파라미터 */
export interface ProductCardParams {
  trigger_context?: TriggerContext;
  product_id?: number;
  product_name?: string;
  product_brand?: string;
  product_price?: number;
  product_category?: string;
  product_sub_category?: string;
  save_status?: SaveStatus;
}

import type { JjymV2ItemResponse } from '@apis/__generated__/data-contracts';

export const getCompareJjymSavedKeys = (
  items: JjymV2ItemResponse[]
): Set<string> =>
  new Set(
    items.flatMap((item) => {
      if (
        item.catalogItemId == null ||
        (item.source !== 'EBAY' &&
          item.source !== 'COUPANG' &&
          item.source !== 'RAW')
      ) {
        return [];
      }

      return [`${item.source}:${item.catalogItemId}`];
    })
  );

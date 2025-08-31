export const OPEN_SHEET_KEYS = ['noMatch', 'flip'] as const;
export type OpenSheetKey = (typeof OPEN_SHEET_KEYS)[number] | null;

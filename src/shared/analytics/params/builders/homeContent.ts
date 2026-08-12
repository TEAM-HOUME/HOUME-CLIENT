import type {
  HomeBannerParams,
  HomeStyleParams,
} from '@analytics/params/homeContent';

export const getHomeBannerParams = (input: {
  bannerId?: number;
  bannerName?: string;
}): HomeBannerParams => ({
  home_banner_id: input.bannerId,
  home_banner_name: input.bannerName,
});

export const getHomeStyleParams = (input: {
  styleId?: number;
  styleName?: string;
}): HomeStyleParams => ({
  home_style_id: input.styleId,
  home_style_name: input.styleName,
});

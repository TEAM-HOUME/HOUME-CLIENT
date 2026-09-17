/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface SavePresetRequest {
  sourceUrl: string;
  title: string;
  thumbnailUrl: string;
  brand?: string;
  /** @format int64 */
  price?: number;
  currency: string;
  similarProducts: SimilarProductRequest[];
}

export interface SimilarProductRequest {
  source: string;
  productId: string;
  title: string;
  imageUrl?: string;
  /** @format double */
  price: number;
  currency: string;
  siteName?: string;
  productUrl: string;
  /** @format date-time */
  priceUpdatedAt: string;
}

export interface ApiResponseVoid {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: object;
  traceId?: string;
}

export interface ApiResponseString {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: string;
  traceId?: string;
}

export interface GenerateImageV4Request {
  /** @format int64 */
  floorPlanId: number;
  floorPlanView: string;
  isMirror: boolean;
  /**
   * @maxItems 5
   * @minItems 1
   */
  moodBoardIds: number[];
  activity: string;
  /**
   * @maxItems 6
   * @minItems 0
   */
  furnitureIds: number[];
}

export interface ApiResponseGenerateImageV4Response {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: GenerateImageV4Response;
  traceId?: string;
}

export interface GenerateImageV4Response {
  /** @format int64 */
  imageId?: number;
  imageUrl?: string;
  isMirror?: boolean;
}

export interface FloorPlanInfo {
  /** @format int64 */
  floorPlanId: number;
  isMirror: boolean;
}

export interface GenerateImageRequest {
  /** @format int64 */
  houseId: number;
  equilibrium: string;
  floorPlan: FloorPlanInfo;
  /**
   * @maxItems 5
   * @minItems 1
   */
  moodBoardIds: number[];
  activity: string;
  /**
   * @maxItems 6
   * @minItems 0
   */
  selectiveIds?: number[];
}

export interface ApiResponseImageInfoListResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: ImageInfoListResponse;
  traceId?: string;
}

export interface ImageInfoListResponse {
  imageInfoResponses?: ImageInfoResponse[];
}

export interface ImageInfoResponse {
  /** @format int64 */
  imageId?: number;
  imageUrl?: string;
  isMirror?: boolean;
  equilibrium?: string;
  houseForm?: string;
  tagName?: string;
  name?: string;
}

export interface SocialSignUpV2Request {
  signupToken: string;
  /** @pattern ^[가-힣a-zA-Z0-9]+$ */
  nickname: string;
  /** @pattern MALE|FEMALE|NONBINARY */
  gender: string;
  birthday: string;
}

export interface PromptFurnitureListDTO {
  furnitureTagIds?: number[];
}

export interface PromptRequestDTO {
  /** @format int64 */
  floorPlanId?: number;
  /** @format int64 */
  tagId?: number;
  equilibrium?: "UNDER_5" | "BETWEEN_6_10" | "BETWEEN_11_15" | "OVER_16";
  promptFurnitureListDTO?: PromptFurnitureListDTO;
}

export interface ApiResponseImageInfoResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: ImageInfoResponse;
  traceId?: string;
}

export interface ApiResponseJjymToggleResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: JjymToggleResponse;
  traceId?: string;
}

export interface JjymToggleResponse {
  favorited?: boolean;
}

export interface SocialSignUpRequest {
  signupToken: string;
  /** @pattern ^[가-힣a-zA-Z]+$ */
  name: string;
  /** @pattern MALE|FEMALE|NONBINARY */
  gender: string;
  birthday: string;
}

export interface ProductScrapeRequest {
  url: string;
}

export interface ApiResponseScrapedProductResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: ScrapedProductResponse;
  traceId?: string;
}

export interface ScrapedProductResponse {
  sourceUrl?: string;
  title?: string;
  thumbnailUrl?: string;
  brand?: string;
  /** @format int64 */
  price?: number;
  currency?: string;
  additionalImageUrls?: string[];
  description?: string;
  quality?: string;
}

export interface CreateCompareJobRequest {
  url: string;
}

export interface ApiResponseCreateJobResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: CreateJobResponse;
  traceId?: string;
}

export interface CreateJobResponse {
  jobId?: string;
  status?: string;
  sourceUrl?: string;
  title?: string;
  thumbnail?: string;
  /** @format int64 */
  price?: number;
}

export interface HouseSelectRequest {
  houseType: string;
  roomType: string;
  areaType: string;
  isValid: boolean;
}

export interface ApiResponseHouseIdResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: HouseIdResponse;
  traceId?: string;
}

export interface HouseIdResponse {
  /** @format int64 */
  houseId?: number;
}

export interface IsLikeRequest {
  isLike?: boolean;
}

export interface ProductGenerateImageRequest {
  /** @format int64 */
  floorPlanId: number;
  floorPlanView: string;
  isMirror: boolean;
  /**
   * @maxItems 6
   * @minItems 1
   */
  productIds: number[];
}

export interface OtherStyleGenerateImageRequest {
  /** @format int64 */
  bannerId: number;
  /** @format int64 */
  floorPlanId: number;
  floorPlanView: string;
  isMirror: boolean;
}

export interface ApiResponseOtherStyleGenerateImageResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: OtherStyleGenerateImageResponse;
  traceId?: string;
}

export interface OtherStyleGenerateImageResponse {
  /** @format int64 */
  imageId?: number;
  imageUrl?: string;
  isMirror?: boolean;
}

export interface BannerGenerateImageRequest {
  /** @format int64 */
  bannerId: number;
  /** @format int64 */
  answerId: number;
  /** @format int64 */
  floorPlanId: number;
  floorPlanView: string;
  isMirror: boolean;
}

export interface ApiResponseBannerGenerateImageResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: BannerGenerateImageResponse;
  traceId?: string;
}

export interface BannerGenerateImageResponse {
  /** @format int64 */
  imageId?: number;
  imageUrl?: string;
  isMirror?: boolean;
}

export interface AdminTagRequestDTO {
  /** @format int32 */
  priority?: number;
  tagName?: string;
  tag_name_kr?: string;
  tag_prompt?: string;
}

export interface AdminStyleCreateRequest {
  bannerImageUrl: string;
  bannerTitle: string;
  styleDescription: string;
  stylePrompt: string;
  mappedRawProductIds: number[];
}

export interface AdminBannerMappedRawProductResponse {
  /** @format int64 */
  id?: number;
  source?: string;
  category?:
    | "MINI_ELECTRONICS"
    | "FURNITURE"
    | "LIGHTING"
    | "LIVING_GOODS"
    | "HOME_FABRIC"
    | "ACCESSORY";
  /** @format int64 */
  productId?: number;
  productName?: string;
  productImageUrl?: string;
  brand?: string;
}

export interface AdminStyleResponse {
  /** @format int64 */
  id?: number;
  bannerImageUrl?: string;
  bannerTitle?: string;
  styleDescription?: string;
  stylePrompt?: string;
  mappedRawProducts?: AdminBannerMappedRawProductResponse[];
  /** @format date-time */
  createdAt?: string;
  /** @format date-time */
  updatedAt?: string;
}

export interface ApiResponseAdminStyleResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: AdminStyleResponse;
  traceId?: string;
}

export interface AdminBannerImageUploadRequest {
  /** @pattern ^(?i)(jpg|jpeg|png|gif|webp)$ */
  imageExtension: string;
}

export interface AdminBannerImageUploadResponse {
  uploadUrl?: string;
  publicUrl?: string;
}

export interface ApiResponseAdminBannerImageUploadResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: AdminBannerImageUploadResponse;
  traceId?: string;
}

export interface AdminMoodBoardCreateRequestDTO {
  imageExtension?: string;
  originalFilename?: string;
  /** @format int64 */
  tagId?: number;
}

export interface AdminMoodBoardCreateResponseDTO {
  presignedUrl?: string;
  /** @format int64 */
  tasteId?: number;
}

export interface ApiResponseAdminMoodBoardCreateResponseDTO {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: AdminMoodBoardCreateResponseDTO;
  traceId?: string;
}

export interface AdminCreditGrantRequest {
  /**
   * @format int32
   * @max 1000
   */
  amount: number;
}

export interface AdminCreditGrantResponse {
  /** @format int64 */
  memberId?: number;
  /** @format int32 */
  grantedAmount?: number;
  /** @format int64 */
  creditBalance?: number;
}

export interface ApiResponseAdminCreditGrantResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: AdminCreditGrantResponse;
  traceId?: string;
}

export interface AdminLandingCreateRequest {
  bannerImageUrl: string;
  bannerTitle: string;
}

export interface AdminLandingResponse {
  /** @format int64 */
  id?: number;
  bannerImageUrl?: string;
  bannerTitle?: string;
  /** @format date-time */
  createdAt?: string;
  /** @format date-time */
  updatedAt?: string;
}

export interface ApiResponseAdminLandingResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: AdminLandingResponse;
  traceId?: string;
}

export interface AdminFurnitureRequestDTO {
  /** 추가되는 가구의 한글명 입니다 */
  furnitureNameKr?: string;
  /** 추가되는 가구의 영어명 입니다 */
  furnitureNameEng?: string;
  /**
   * 추가되는 가구의 가구 타입 입니다
   * @format int64
   */
  furnitureType?: number;
}

export interface AdminFurnitureTypeRequest {
  /** 추가할 가구 타입 한글명 */
  furnitureTypeNameKr?: string;
  /** 추가할 가구 타입 영어명 */
  furnitureTypeNameEng?: string;
}

export interface AdminFurniturePromptRequestDTO {
  /** 가구의 한글명 입니다 */
  furnitureNameKr?: string;
  /** 가구에 대한 프롬프트 입니다 */
  prompt?: string;
  /**
   * 가구의 스타일 태그 입니다
   * @format int64
   */
  tagId?: number;
  /** 가구의 검색 키워드입니다 */
  searchKeyword?: string;
  /**
   * 가구의 우선순위입니다
   * @format int32
   */
  priority?: number;
  imageExtension?: string;
  originalFilename?: string;
}

export interface AdminFurniturePromptCreateResponseDTO {
  presignedUrl?: string;
  /** @format int64 */
  furnitureTagId?: number;
}

export interface ApiResponseAdminFurniturePromptCreateResponseDTO {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: AdminFurniturePromptCreateResponseDTO;
  traceId?: string;
}

export interface AdminFloorPlanCreateRequest {
  name: string;
  forms: ("OFFICETEL" | "VILLA" | "APARTMENT" | "ETC")[];
  structures: (
    | "OPEN_ONE_ROOM"
    | "SEPARATED_ONE_ROOM"
    | "DUPLEX"
    | "TWO_ROOM"
    | "THREE_ROOM_OVER"
  )[];
  equilibriums: ("UNDER_5" | "BETWEEN_6_10" | "BETWEEN_11_15" | "OVER_16")[];
  floorPlanPrompt: string;
  images: AdminFloorPlanImageRequest[];
}

export interface AdminFloorPlanImageRequest {
  url: string;
  filename: string;
  originalFilename: string;
  fileExtension: string;
  /**
   * @format int32
   * @min 1
   */
  sortOrder: number;
  view?: string;
}

export interface AdminFloorPlanImageResponse {
  url?: string;
  filename?: string;
  originalFilename?: string;
  fileExtension?: string;
  /** @format int32 */
  sortOrder?: number;
  view?: string;
}

export interface AdminFloorPlanResponse {
  /** @format int64 */
  id?: number;
  name?: string;
  forms?: ("OFFICETEL" | "VILLA" | "APARTMENT" | "ETC")[];
  structures?: (
    | "OPEN_ONE_ROOM"
    | "SEPARATED_ONE_ROOM"
    | "DUPLEX"
    | "TWO_ROOM"
    | "THREE_ROOM_OVER"
  )[];
  equilibriums?: ("UNDER_5" | "BETWEEN_6_10" | "BETWEEN_11_15" | "OVER_16")[];
  floorPlanPrompt?: string;
  representativeImageUrl?: string;
  images?: AdminFloorPlanImageResponse[];
}

export interface ApiResponseAdminFloorPlanResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: AdminFloorPlanResponse;
  traceId?: string;
}

export interface AdminFloorPlanImageUploadRequest {
  imageExtension: string;
}

export interface AdminFloorPlanImageUploadResponse {
  uploadUrl?: string;
  publicUrl?: string;
}

export interface ApiResponseAdminFloorPlanImageUploadResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: AdminFloorPlanImageUploadResponse;
  traceId?: string;
}

export interface ApiResponseSoozipRawProductSaveResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: SoozipRawProductSaveResponse;
  traceId?: string;
}

export interface SoozipRawProductSaveResponse {
  source?: string;
  category?:
    | "MINI_ELECTRONICS"
    | "FURNITURE"
    | "LIGHTING"
    | "LIVING_GOODS"
    | "HOME_FABRIC"
    | "ACCESSORY";
  /** @format int32 */
  productCount?: number;
  /** @format int32 */
  insertedCount?: number;
  /** @format int32 */
  updatedCount?: number;
  /** @format int32 */
  skippedCount?: number;
}

export interface AdminCurationRawProductColorRequest {
  rawColorName?: string;
  clientColorName?: string;
}

export interface AdminCurationRawProductCreateRequest {
  /** @pattern ^[a-zA-Z0-9][a-zA-Z0-9_-]{0,49}$ */
  source: string;
  category:
    | "MINI_ELECTRONICS"
    | "FURNITURE"
    | "LIGHTING"
    | "LIVING_GOODS"
    | "HOME_FABRIC"
    | "ACCESSORY";
  /** @format int64 */
  productId: number;
  /**
   * @minLength 0
   * @maxLength 2048
   */
  productImageUrl: string;
  /**
   * @minLength 0
   * @maxLength 2048
   */
  productSiteUrl: string;
  productName: string;
  productMallName?: string;
  brand?: string;
  /** @format int64 */
  listPrice?: number;
  /**
   * @format int32
   * @min 0
   * @max 100
   */
  discountRate?: number;
  /** @format int64 */
  discountPrice?: number;
  /** @format int64 */
  baseShippingFee?: number;
  /** @format int64 */
  freeShippingCondition?: number;
  isExposed?: boolean;
  /** @format date-time */
  fetchedAt?: string;
  colors?: AdminCurationRawProductColorRequest[];
  furnitureIds?: number[];
  furnitureTagIds?: number[];
}

export interface AdminCurationRawProductColorResponse {
  /** @format int64 */
  id?: number;
  rawColorName?: string;
  clientColorName?: string;
}

export interface AdminCurationRawProductFurnitureResponse {
  /** @format int64 */
  mappingId?: number;
  /** @format int64 */
  furnitureId?: number;
  furnitureNameKr?: string;
  furnitureNameEng?: string;
  /** @format int64 */
  furnitureTypeId?: number;
  furnitureTypeNameKr?: string;
}

export interface AdminCurationRawProductFurnitureTagResponse {
  /** @format int64 */
  mappingId?: number;
  /** @format int64 */
  furnitureTagId?: number;
  /** @format int64 */
  furnitureId?: number;
  furnitureNameKr?: string;
  /** @format int64 */
  furnitureTypeId?: number;
  furnitureTypeNameKr?: string;
  /** @format int64 */
  tagId?: number;
  tagNameKr?: string;
  /** @format int32 */
  priority?: number;
  searchKeyword?: string;
}

export interface AdminCurationRawProductResponse {
  /** @format int64 */
  id?: number;
  source?: string;
  category?:
    | "MINI_ELECTRONICS"
    | "FURNITURE"
    | "LIGHTING"
    | "LIVING_GOODS"
    | "HOME_FABRIC"
    | "ACCESSORY";
  /** @format int64 */
  productId?: number;
  productImageUrl?: string;
  productSiteUrl?: string;
  productName?: string;
  productMallName?: string;
  brand?: string;
  /** @format int64 */
  listPrice?: number;
  /** @format int32 */
  discountRate?: number;
  /** @format int64 */
  discountPrice?: number;
  /** @format int64 */
  baseShippingFee?: number;
  /** @format int64 */
  freeShippingCondition?: number;
  /** @format date-time */
  fetchedAt?: string;
  isExposed?: boolean;
  colors?: AdminCurationRawProductColorResponse[];
  furnitures?: AdminCurationRawProductFurnitureResponse[];
  furnitureTags?: AdminCurationRawProductFurnitureTagResponse[];
}

export interface ApiResponseAdminCurationRawProductResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: AdminCurationRawProductResponse;
  traceId?: string;
}

export interface AdminCurationRawProductFurnitureTagCreateRequest {
  /** @format int64 */
  furnitureTagId: number;
}

export interface ApiResponseAdminCurationRawProductFurnitureTagResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: AdminCurationRawProductFurnitureTagResponse;
  traceId?: string;
}

export interface AdminBannerCreateRequest {
  bannerImageUrl: string;
  bannerTitle: string;
  styleDescription: string;
  styleQuestion: string;
  stylePrompt: string;
  /**
   * @maxItems 4
   * @minItems 0
   */
  styleAnswerChips: AdminBannerStyleAnswerChipRequest[];
  mappedRawProductIds: number[];
}

export interface AdminBannerStyleAnswerChipRequest {
  /**
   * @format int32
   * @min 1
   * @max 4
   */
  order: number;
  label: string;
  selectedPrompt: string;
  /** @format int64 */
  curationRawProductId: number;
}

export interface AdminBannerResponse {
  /** @format int64 */
  id?: number;
  bannerImageUrl?: string;
  bannerTitle?: string;
  styleDescription?: string;
  styleQuestion?: string;
  stylePrompt?: string;
  styleAnswerChips?: AdminBannerStyleAnswerChipResponse[];
  mappedRawProducts?: AdminBannerMappedRawProductResponse[];
  /** @format date-time */
  createdAt?: string;
  /** @format date-time */
  updatedAt?: string;
}

export interface AdminBannerStyleAnswerChipResponse {
  /** @format int64 */
  id?: number;
  /** @format int32 */
  order?: number;
  label?: string;
  selectedPrompt?: string;
  /** @format int64 */
  curationRawProductId?: number;
  curationRawProductName?: string;
  curationRawProductImageUrl?: string;
}

export interface ApiResponseAdminBannerResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: AdminBannerResponse;
  traceId?: string;
}

export interface AddressRequest {
  sigungu: string;
  roadName: string;
}

export interface AdminTextSearchRequest {
  title: string;
  imageUrl?: string;
  /** @format double */
  priceKrw: number;
  category?: string;
}

export interface AdminSearchCandidate {
  title?: string;
  imageUrl?: string;
  /** @format double */
  priceUsd?: number;
  productUrl?: string;
  /** @format double */
  textSimilarity?: number;
  /** @format double */
  imageSimilarity?: number;
  /** @format double */
  combinedScore?: number;
}

export interface AdminSearchResult {
  items?: AdminSearchCandidate[];
  filterStats?: FilterStats;
}

export interface ApiResponseAdminSearchResult {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: AdminSearchResult;
  traceId?: string;
}

export interface FilterStats {
  /** @format int32 */
  totalFetched?: number;
  /** @format int32 */
  afterCategoryFilter?: number;
  /** @format int32 */
  afterPriceFilter?: number;
  /** @format int32 */
  scored?: number;
}

export interface ApiResponseLong {
  /** @format int32 */
  code?: number;
  msg?: string;
  /** @format int64 */
  data?: number;
  traceId?: string;
}

export interface KeywordCheckRequest {
  productName: string;
}

export interface ApiResponseKeywordCheckResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: KeywordCheckResponse;
  traceId?: string;
}

export interface KeywordCheckResponse {
  english?: string;
  korean?: string;
}

export interface AdminImageSearchRequest {
  imageUrl: string;
  /** @format double */
  priceKrw: number;
  category?: string;
}

export interface CreateUserV2Request {
  /**
   * @minLength 2
   * @maxLength 20
   * @pattern ^[가-힣a-zA-Z0-9]+$
   */
  nickname: string;
  /** @pattern MALE|FEMALE|NONBINARY */
  gender: string;
  birthday: string;
}

export interface UpdateMyPageProfileRequest {
  /**
   * @minLength 2
   * @maxLength 20
   * @pattern ^[가-힣a-zA-Z0-9]+$
   */
  nickname?: string;
  /** @pattern MALE|FEMALE|NONBINARY */
  gender?: string;
  birthday?: string;
}

export interface ApiResponseMyPageProfileResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: MyPageProfileResponse;
  traceId?: string;
}

export interface MyPageProfileResponse {
  /** @format int64 */
  userId?: number;
  nickname?: string;
  /** @format date */
  birthday?: string;
  gender?: "MALE" | "FEMALE" | "NONBINARY";
}

export interface CreateUserRequest {
  /** @pattern ^[가-힣a-zA-Z]+$ */
  name: string;
  /** @pattern MALE|FEMALE|NONBINARY */
  gender: string;
  birthday: string;
}

export interface AdminTagUpdateRequestDTO {
  /** @format int64 */
  tagId: number;
  /** @format int32 */
  newPriority?: number;
  /** @pattern ^[a-zA-Z0-9\s\-_.()&/]*$ */
  newTagNameEng?: string;
  newTagPrompt?: string;
  newTagNameKr?: string;
}

export interface AdminStyleUpdateRequest {
  bannerImageUrl?: string;
  bannerTitle?: string;
  styleDescription?: string;
  stylePrompt?: string;
  mappedRawProductIds?: number[];
}

export interface AdminLandingUpdateRequest {
  bannerImageUrl?: string;
  bannerTitle?: string;
}

export interface AdminFurnitureUpdateRequestDTO {
  /** 업데이트할 가구의 한글 이름(식별자) */
  furnitureNameKr?: string;
  /**
   * 업데이트할 가구의 태그 ID(식별자)
   * @format int64
   */
  tagId?: number;
  /** 새로운 가구 영어 이름 */
  newFurnitureNameEng?: string;
  /** 새로운 프롬프트 */
  newPrompt?: string;
  /** 새로운 검색 키워드 */
  newSearchKeyword?: string;
  /**
   * 새로운 우선순위
   * @format int32
   */
  newPriority?: number;
  /** 이미지 업데이트 시 사용할 확장자 (예: jpg, png) */
  imageExtension?: string;
  /** 이미지 업데이트 시 표시용 원본 파일명 */
  originalFilename?: string;
}

export interface AdminFurnitureUpdateResponseDTO {
  presignedUrl?: string;
  /** @format int64 */
  furnitureTagId?: number;
}

export interface ApiResponseAdminFurnitureUpdateResponseDTO {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: AdminFurnitureUpdateResponseDTO;
  traceId?: string;
}

export interface AdminUpdateFurnitureTypeRequest {
  /**
   * 수정할 가구 타입 식별자
   * @format int64
   */
  id?: number;
  /** 새로운 가구 타입 한글명 */
  furnitureTypeNameKr?: string;
  /** 새로운 가구 타입 영어명 */
  furnitureTypeNameEng?: string;
}

export interface AdminFloorPlanUpdateRequest {
  name?: string;
  forms?: ("OFFICETEL" | "VILLA" | "APARTMENT" | "ETC")[];
  structures?: (
    | "OPEN_ONE_ROOM"
    | "SEPARATED_ONE_ROOM"
    | "DUPLEX"
    | "TWO_ROOM"
    | "THREE_ROOM_OVER"
  )[];
  equilibriums?: ("UNDER_5" | "BETWEEN_6_10" | "BETWEEN_11_15" | "OVER_16")[];
  floorPlanPrompt: string;
  images?: AdminFloorPlanImageRequest[];
}

export interface AdminCurationRawProductUpdateRequest {
  /** @pattern ^[a-zA-Z0-9][a-zA-Z0-9_-]{0,49}$ */
  source?: string;
  category?:
    | "MINI_ELECTRONICS"
    | "FURNITURE"
    | "LIGHTING"
    | "LIVING_GOODS"
    | "HOME_FABRIC"
    | "ACCESSORY";
  /** @format int64 */
  productId?: number;
  /**
   * @minLength 0
   * @maxLength 2048
   */
  productImageUrl?: string;
  /**
   * @minLength 0
   * @maxLength 2048
   */
  productSiteUrl?: string;
  productName?: string;
  productMallName?: string;
  brand?: string;
  /** @format int64 */
  listPrice?: number;
  /**
   * @format int32
   * @min 0
   * @max 100
   */
  discountRate?: number;
  /** @format int64 */
  discountPrice?: number;
  /** @format int64 */
  baseShippingFee?: number;
  /** @format int64 */
  freeShippingCondition?: number;
  isExposed?: boolean;
  /** @format date-time */
  fetchedAt?: string;
  colors?: AdminCurationRawProductColorRequest[];
  furnitureIds?: number[];
  furnitureTagIds?: number[];
}

export interface AdminCurationRawProductFurnitureTagUpdateRequest {
  /** @format int64 */
  furnitureTagId: number;
}

export interface AdminCurationRawProductExposureUpdateRequest {
  rawProductIds: number[];
  isExposed: boolean;
}

export interface AdminBannerUpdateRequest {
  bannerImageUrl?: string;
  bannerTitle?: string;
  styleDescription?: string;
  styleQuestion?: string;
  stylePrompt?: string;
  /**
   * @maxItems 4
   * @minItems 0
   */
  styleAnswerChips?: AdminBannerStyleAnswerChipRequest[];
  mappedRawProductIds?: number[];
}

export interface ApiResponseKakaoLoginResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: KakaoLoginResponse;
  traceId?: string;
}

export interface KakaoLoginResponse {
  isNewUser?: boolean;
  signupToken?: string;
  prefill?: Prefill;
}

export interface Prefill {
  email?: string;
  nickname?: string;
}

export interface ApiResponseRecentFloorPlanResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: RecentFloorPlanResponse;
  traceId?: string;
}

export interface RecentFloorPlanItemResponse {
  imageUrl?: string;
  view?: string;
  isRecentUsedView?: boolean;
}

export interface RecentFloorPlanResponse {
  hasRecentImage?: boolean;
  /** @format int64 */
  floorPlanId?: number;
  floorPlanName?: string;
  equilibrium?: string;
  floorPlans?: RecentFloorPlanItemResponse[];
}

export interface ApiResponseMyPageGeneratedImageV2Response {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: MyPageGeneratedImageV2Response;
  traceId?: string;
}

export interface DateGroupResponse {
  /** @format date */
  date?: string;
  items?: ItemResponse[];
}

export interface ItemResponse {
  /** @format int64 */
  imageId?: number;
  viewType?: "BANNER" | "STYLE" | "PRODUCT" | "FULL_FUNNEL" | "LEGACY";
  generatedImageUrl?: string;
  /** @format date-time */
  generatedAt?: string;
  bannerTitle?: string | null;
  productSummaryText?: string | null;
  isMirror?: boolean;
  usedProducts?: UsedProductResponse[];
}

export interface MyPageGeneratedImageV2Response {
  groups?: DateGroupResponse[];
}

export interface UsedProductResponse {
  /** @format int64 */
  rawProductId?: number;
  productImageUrl?: string;
  colors?: string[];
  productName?: string;
  /** @format int64 */
  listPrice?: number;
  /** @format int32 */
  discountRate?: number;
  /** @format int64 */
  discountPrice?: number;
  productSiteUrl?: string;
  isJjym?: boolean;
}

export interface ApiResponseJjymV2ListResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: JjymV2ListResponse;
  traceId?: string;
}

export interface JjymV2ItemResponse {
  /** @format int64 */
  rawProductId?: number;
  isJjym?: boolean;
  productImageUrl?: string;
  productSiteUrl?: string;
  colors?: string[];
  brandName?: string;
  productName?: string;
  /** @format int64 */
  listPrice?: number;
  /** @format int32 */
  discountRate?: number;
  /** @format int64 */
  discountPrice?: number;
  /** @format int64 */
  jjymCount?: number;
}

export interface JjymV2ListResponse {
  items?: JjymV2ItemResponse[];
}

export interface ApiResponseExploreHouseTemplateListResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: ExploreHouseTemplateListResponse;
  traceId?: string;
}

export interface ExploreHouseTemplateItemResponse {
  /** @format int64 */
  id?: number;
  name?: string;
  imageUrl?: string;
  isLatest?: boolean;
}

export interface ExploreHouseTemplateListResponse {
  isExact?: boolean;
  floorPlans?: ExploreHouseTemplateItemResponse[];
}

export interface ApiResponseExploreHouseTemplateDetailResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: ExploreHouseTemplateDetailResponse;
  traceId?: string;
}

export interface ExploreHouseTemplateDetailItemResponse {
  imageUrl?: string;
  view?: string;
}

export interface ExploreHouseTemplateDetailResponse {
  /** @format int64 */
  floorPlanId?: number;
  floorPlanName?: string;
  equilibrium?: string;
  floorPlans?: ExploreHouseTemplateDetailItemResponse[];
}

export interface ApiResponseFurnitureCategoriesResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: FurnitureCategoriesResponse;
  traceId?: string;
}

export interface FurnitureCategoriesResponse {
  categories?: FurnitureCategoryResponse[];
}

export interface FurnitureCategoryResponse {
  /** @format int64 */
  id?: number;
  categoryName?: string;
}

export interface ApiResponseDashboardCategoriesResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: DashboardCategoriesResponse;
  traceId?: string;
}

export interface DashboardCategoriesResponse {
  categories?: FurnitureCategoryGroup[];
}

export interface FurnitureCategoryGroup {
  /** @format int64 */
  categoryId?: number;
  nameKr?: string;
  nameEng?: string;
  furnitures?: FurnitureCategoryItem[];
}

export interface FurnitureCategoryItem {
  /** @format int64 */
  id?: number;
  code?: string;
  label?: string;
}

export interface ActivityFurnitureMappingsResponse {
  activities?: ActivityWithFurnitureResponse[];
}

export interface ActivityWithFurnitureResponse {
  code?: string;
  label?: string;
  furnitures?: FurnitureItem[];
}

export interface ApiResponseActivityFurnitureMappingsResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: ActivityFurnitureMappingsResponse;
  traceId?: string;
}

export interface FurnitureItem {
  /** @format int64 */
  id?: number;
  code?: string;
  label?: string;
  /** @format int32 */
  priority?: number;
}

export interface ApiResponseCurationProductListResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: CurationProductListResponse;
  traceId?: string;
}

export interface CurationProductAppliedFilterResponse {
  category?: string;
  id?: string;
  label?: string;
  value?: string;
}

export interface CurationProductListResponse {
  products?: CurationProductResponse[];
  meta?: CurationProductMetaResponse;
}

export interface CurationProductMetaResponse {
  /** @format int64 */
  nextCursor?: number;
  hasNext?: boolean;
  appliedFilters?: CurationProductAppliedFilterResponse[];
  isRecommended?: boolean;
}

export interface CurationProductResponse {
  /** @format int64 */
  id?: number;
  /** @format int64 */
  productId?: number;
  categoryName?: string;
  source?: string;
  brand?: string;
  name?: string;
  imageUrl?: string;
  /** @format int64 */
  originalPrice?: number;
  /** @format int32 */
  discountRate?: number;
  /** @format int64 */
  finalPrice?: number;
  mallName?: string;
  linkUrl?: string;
}

export interface ApiResponseGetCarouselV2ListResponseDTO {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: GetCarouselV2ListResponseDTO;
  traceId?: string;
}

export interface GetCarouselResponseDTO {
  /** @format int64 */
  rawProductId?: number;
  url?: string;
}

export interface GetCarouselV2ListResponseDTO {
  carousels?: GetCarouselResponseDTO[];
}

export interface ApiResponsePresetListResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: PresetListResponse;
  traceId?: string;
}

export interface PresetItemResponse {
  /** @format int64 */
  presetId?: number;
  thumbnailUrl?: string;
  title?: string;
}

export interface PresetListResponse {
  presets?: PresetItemResponse[];
}

export interface ApiResponsePresetDetailResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: PresetDetailResponse;
  traceId?: string;
}

export interface PresetDetailResponse {
  originalProduct?: PresetOriginalProductResponse;
  similarProducts?: PresetSimilarProductResponse[];
  /** @format int64 */
  totalCount?: number;
}

export interface PresetOriginalProductResponse {
  sourceUrl?: string;
  title?: string;
  thumbnailUrl?: string;
  brand?: string;
  /** @format int64 */
  price?: number;
  currency?: string;
}

export interface PresetSimilarProductResponse {
  source?: string;
  productId?: string;
  title?: string;
  imageUrl?: string;
  /** @format double */
  price?: number;
  currency?: string;
  siteName?: string;
  productUrl?: string;
  /** @format date-time */
  priceUpdatedAt?: string;
}

export interface ApiResponseCompareJobResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: CompareJobResponse;
  traceId?: string;
}

export interface CompareJobResponse {
  jobId?: string;
  status?: string;
  sources?: SourcesStatusResponse;
  originalProduct?: OriginalProductResponse;
  result?: JobResultResponse;
}

export interface JobResultResponse {
  /** @format int32 */
  totalCount?: number;
  similarProducts?: SimilarProductItemResponse[];
}

export interface OriginalProductResponse {
  title?: string;
  imageUrl?: string;
  /** @format double */
  price?: number;
  currency?: string;
  quality?: string;
}

export interface SimilarProductItemResponse {
  source?: string;
  title?: string;
  imageUrl?: string;
  /** @format double */
  price?: number;
  currency?: string;
  productUrl?: string;
}

export interface SourcesStatusResponse {
  ebay?: string;
  coupang?: string;
  catalog?: string;
}

export interface ApiResponseCompareHistoryResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: CompareHistoryResponse;
  traceId?: string;
}

export interface CompareHistoryResponse {
  items?: HistoryItem[];
}

export interface HistoryItem {
  sourceUrl?: string;
  thumbnailUrl?: string;
  title?: string;
  /** @format int64 */
  price?: number;
  currency?: string;
  /** @format date-time */
  createdAt?: string;
}

export interface ApiResponseOtherStyleListResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: OtherStyleListResponse;
  traceId?: string;
}

export interface OtherStyleListResponse {
  otherStyles?: OtherStyleResponse[];
}

export interface OtherStyleResponse {
  /** @format int64 */
  id?: number;
  name?: string;
  imageUrl?: string;
}

export interface ApiResponseOtherStyleDetailResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: OtherStyleDetailResponse;
  traceId?: string;
}

export interface OtherStyleDetailProductResponse {
  /** @format int64 */
  id?: number;
  name?: string;
  imageUrl?: string;
  /** @format int64 */
  originalPrice?: number;
  /** @format int32 */
  discountRate?: number;
  /** @format int64 */
  finalPrice?: number;
  linkUrl?: string;
  colors?: ProductColorResponse[];
  isLiked?: boolean;
}

export interface OtherStyleDetailResponse {
  styleName?: string;
  styleImageUrl?: string;
  styleDescription?: string;
  products?: OtherStyleDetailProductResponse[];
}

export interface ProductColorResponse {
  name?: string;
  value?: string;
}

export interface ApiResponseMyPageInfoResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: MyPageInfoResponse;
  traceId?: string;
}

export interface MyPageInfoResponse {
  /** @format int64 */
  userId?: number;
  name?: string;
  /** @format int64 */
  CreditCount?: number;
  email?: string;
}

export interface ApiResponseUserImageHistoryListResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: UserImageHistoryListResponse;
  traceId?: string;
}

export interface UserImageHistoryDTO {
  /** @format int64 */
  houseId?: number;
  /** @format int64 */
  imageId?: number;
  generatedImageUrl?: string;
  tasteTag?: string;
  equilibrium?: string;
  houseForm?: string;
  isMirror?: boolean;
}

export interface UserImageHistoryListResponse {
  histories?: UserImageHistoryDTO[];
}

export interface ApiResponseImageHistoriesResultPageResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: ImageHistoriesResultPageResponse;
  traceId?: string;
}

export interface ImageHistoriesResultPageResponse {
  histories?: ImageHistoryResultPageResponse[];
}

export interface ImageHistoryResultPageResponse {
  /** @format int64 */
  imageId?: number;
  equilibrium?: string;
  houseForm?: string;
  tasteTag?: string;
  name?: string;
  generatedImageUrl?: string;
  /** 좋아요 여부 */
  isLike?: boolean | null;
  /**
   * 선호도 요인 식별자
   * @format int64
   */
  factorId?: number | null;
  /** 선호도 요인 */
  factorText?: string | null;
}

export interface ApiResponseMoodBoardListResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: MoodBoardListResponse;
  traceId?: string;
}

export interface MoodBoardListResponse {
  moodBoardResponseList?: MoodBoardResponse[];
}

export interface MoodBoardResponse {
  /** @format int64 */
  id?: number;
  imageUrl?: string;
  fileExtension?: string;
}

export interface ApiResponseLandingListResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: LandingListResponse;
  traceId?: string;
}

export interface LandingListResponse {
  landings?: LandingResponse[];
}

export interface LandingResponse {
  /** @format int64 */
  id?: number;
  /** @format int64 */
  bannerId?: number;
  name?: string;
  imageUrl?: string;
}

export interface ApiResponseJjymListResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: JjymListResponse;
  traceId?: string;
}

export interface JjymItemResponse {
  /** @format int64 */
  id?: number;
  furnitureProductImageUrl?: string;
  furnitureProductSiteUrl?: string;
  furnitureProductName?: string;
  /** @format int64 */
  furnitureProductId?: number;
}

export interface JjymListResponse {
  items?: JjymItemResponse[];
}

export interface ApiResponseHouseOptionsResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: HouseOptionsResponse;
  traceId?: string;
}

export interface HouseOptionDTO {
  code?: string;
  label?: string;
}

export interface HouseOptionsResponse {
  houseTypes?: HouseOptionDTO[];
  roomTypes?: HouseOptionDTO[];
  areaTypes?: HouseOptionDTO[];
}

export interface ApiResponseFloorPlanListResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: FloorPlanListResponse;
  traceId?: string;
}

export interface FloorPlanListResponse {
  floorPlanList?: FloorPlanResponse[];
}

export interface FloorPlanResponse {
  /** @format int64 */
  id?: number;
  form?: "OFFICETEL" | "VILLA" | "APARTMENT" | "ETC";
  structure?:
    | "OPEN_ONE_ROOM"
    | "SEPARATED_ONE_ROOM"
    | "DUPLEX"
    | "TWO_ROOM"
    | "THREE_ROOM_OVER";
  floorPlanImage?: string;
}

export interface ApiResponseFurnitureProductsInfoResponseForPlan {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: FurnitureProductsInfoResponseForPlan;
  traceId?: string;
}

export interface FurnitureProductInfo {
  baseFurnitureImageUrl?: string;
  furnitureProductImageUrl?: string;
  furnitureProductSiteUrl?: string;
  furnitureProductName?: string;
  furnitureProductMallName?: string;
  furnitureProductId?: string;
  /** @format double */
  similarity?: number;
}

export interface FurnitureProductsInfoResponseForPlan {
  userName?: string;
  products?: FurnitureProductInfo[];
}

export interface ApiResponseGeneratedImageMetaResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: GeneratedImageMetaResponse;
  traceId?: string;
}

export interface GeneratedImageMetaResponse {
  /** @format int64 */
  imageId?: number;
  imageUrl?: string;
  isMirror?: boolean;
  generationType?: string;
}

export interface ApiResponseFurnitureProductsInfoResponseV2 {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: FurnitureProductsInfoResponseV2;
  traceId?: string;
}

export interface FurnitureProductsInfoResponseV2 {
  userName?: string;
  products?: ProductWrapper[];
}

export interface ProductInfo {
  /** @format int64 */
  id?: number;
  /** @format int64 */
  productId?: number;
  categoryName?: string;
  source?: string;
  brand?: string;
  name?: string;
  imageUrl?: string;
  /** @format int64 */
  originalPrice?: number;
  /** @format int32 */
  discountRate?: number;
  /** @format int64 */
  finalPrice?: number;
  mallName?: string;
  linkUrl?: string;
  colors?: ProductColorResponse[];
  isLiked?: boolean;
}

export interface ProductWrapper {
  product?: ProductInfo;
}

export interface ApiResponseSimilarItemsResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: SimilarItemsResponse;
  traceId?: string;
}

export interface SimilarItemResponse {
  /** @format int64 */
  id?: number;
  brand?: string;
  name?: string;
  imageUrl?: string;
  /** @format int64 */
  originalPrice?: number;
  /** @format int32 */
  discountRate?: number;
  /** @format int64 */
  finalPrice?: number;
  linkUrl?: string;
  colors?: ProductColorResponse[];
  isLiked?: boolean;
  /** @format int64 */
  jjymCount?: number;
}

export interface SimilarItemsResponse {
  products?: SimilarItemResponse[];
}

export interface ApiResponseRelatedImagesResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: RelatedImagesResponse;
  traceId?: string;
}

export interface RelatedImageResponse {
  /** @format int64 */
  id?: number;
  imageUrl?: string;
  resultType?: string;
}

export interface RelatedImagesResponse {
  name?: string;
  images?: RelatedImageResponse[];
}

export interface ApiResponseGenerateImageResultResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: GenerateImageResultResponse;
  traceId?: string;
}

export interface GenerateImageResultProductResponse {
  /** @format int64 */
  id?: number;
  name?: string;
  imageUrl?: string;
  /** @format int64 */
  originalPrice?: number;
  /** @format int32 */
  discountRate?: number;
  /** @format int64 */
  finalPrice?: number;
  linkUrl?: string;
  colors?: ProductColorResponse[];
  isLiked?: boolean;
}

export interface GenerateImageResultResponse {
  /** @format int64 */
  imageId?: number;
  products?: GenerateImageResultProductResponse[];
}

export interface ApiResponseFactorsResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: FactorsResponse;
  traceId?: string;
}

export interface FactorItem {
  /** @format int64 */
  id?: number;
  text?: string;
}

export interface FactorsResponse {
  factors?: FactorItem[];
}

export interface ActivityItem {
  code?: string;
  label?: string;
}

export interface ApiResponseFurnitureAndActivityResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: FurnitureAndActivityResponse;
  traceId?: string;
}

export interface FurnitureAndActivityResponse {
  activities?: ActivityItem[];
  categories?: FurnitureCategoryGroup[];
}

export interface ApiResponseCurationProductDetailResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: CurationProductDetailResponse;
  traceId?: string;
}

export interface CurationProductDetailResponse {
  product?: ProductDetail;
}

export interface ProductColorDetail {
  name?: string;
  value?: string;
}

export interface ProductDetail {
  /** @format int64 */
  id?: number;
  /** @format int64 */
  productId?: number;
  categoryName?: string;
  source?: string;
  brand?: string;
  name?: string;
  imageUrl?: string;
  /** @format int64 */
  originalPrice?: number;
  /** @format int32 */
  discountRate?: number;
  /** @format int64 */
  finalPrice?: number;
  mallName?: string;
  linkUrl?: string;
  colors?: ProductColorDetail[];
  isLiked?: boolean;
  /** @format int64 */
  jjymCount?: number;
}

export interface ApiResponseCurationProductFilterResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: CurationProductFilterResponse;
  traceId?: string;
}

export interface ColorFilterResponse {
  /** @format int64 */
  id?: number;
  label?: string;
  value?: string;
}

export interface CurationProductFilterResponse {
  furnitureTypes?: FurnitureTypeFilterResponse[];
  priceRanges?: PriceRangeFilterResponse[];
  colors?: ColorFilterResponse[];
}

export interface FurnitureTypeFilterResponse {
  /** @format int64 */
  id?: number;
  nameKr?: string;
  nameEng?: string;
}

export interface PriceRangeFilterResponse {
  id?: string;
  label?: string;
  /** @format int64 */
  min?: number;
  /** @format int64 */
  max?: number;
}

export interface ApiResponseCompareCatalogJjymListResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: CompareCatalogJjymListResponse;
  traceId?: string;
}

export interface CompareCatalogJjymItemResponse {
  /** @format int64 */
  catalogItemId?: number;
  title?: string;
  imageUrl?: string;
  /** @format double */
  priceUsd?: number;
  productUrl?: string;
}

export interface CompareCatalogJjymListResponse {
  items?: CompareCatalogJjymItemResponse[];
}

export interface ApiResponseBoolean {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: boolean;
  traceId?: string;
}

export interface ApiResponseGetCarouselListResponseDTO {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: GetCarouselListResponseDTO;
  traceId?: string;
}

export interface GetCarouselListResponseDTO {
  carouselResponseDTOS?: GetCarouselResponseDTO[];
}

export interface ApiResponseBannerExploreListResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: BannerExploreListResponse;
  traceId?: string;
}

export interface BannerExploreListResponse {
  banners?: BannerExploreResponse[];
}

export interface BannerExploreResponse {
  /** @format int64 */
  id?: number;
  name?: string;
  imageUrl?: string;
}

export interface ApiResponseBannerDetailResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: BannerDetailResponse;
  traceId?: string;
}

export interface BannerDetailAnswerResponse {
  /** @format int64 */
  id?: number;
  text?: string;
}

export interface BannerDetailResponse {
  bannerName?: string;
  bannerImageUrl?: string;
  question?: string;
  answers?: BannerDetailAnswerResponse[];
}

export interface AdminTagGetAllResponseDTO {
  tagGetResponseDTOS?: AdminTagGetResponseDTO[];
}

export interface AdminTagGetResponseDTO {
  /** @format int64 */
  id?: number;
  /** @format int32 */
  priority?: number;
  tagName?: string;
  tag_name_kr?: string;
  tag_prompt?: string;
}

export interface ApiResponseAdminTagGetAllResponseDTO {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: AdminTagGetAllResponseDTO;
  traceId?: string;
}

export interface AdminStyleListResponse {
  styles?: AdminStyleResponse[];
}

export interface ApiResponseAdminStyleListResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: AdminStyleListResponse;
  traceId?: string;
}

export interface AdminBannerRawProductSearchResponse {
  rawProducts?: AdminBannerMappedRawProductResponse[];
}

export interface ApiResponseAdminBannerRawProductSearchResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: AdminBannerRawProductSearchResponse;
  traceId?: string;
}

export interface AdminMoodBoardGetAllResponseDTO {
  dtos?: AdminMoodBoardGetResponseDTO[];
}

export interface AdminMoodBoardGetResponseDTO {
  filename?: string;
  originalFilename?: string;
  url?: string;
}

export interface ApiResponseAdminMoodBoardGetAllResponseDTO {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: AdminMoodBoardGetAllResponseDTO;
  traceId?: string;
}

export interface AdminMemberResponse {
  /** @format int64 */
  memberId?: number;
  nickname?: string;
  nicknameTag?: string;
  email?: string;
  /** @format int64 */
  creditBalance?: number;
}

export interface AdminMemberSearchResponse {
  members?: AdminMemberResponse[];
}

export interface ApiResponseAdminMemberSearchResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: AdminMemberSearchResponse;
  traceId?: string;
}

export interface AdminLandingListResponse {
  landings?: AdminLandingResponse[];
}

export interface ApiResponseAdminLandingListResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: AdminLandingListResponse;
  traceId?: string;
}

export interface AdminFurnitureGetDTO {
  furnitures?: FurnitureInfo[];
}

export interface ApiResponseAdminFurnitureGetDTO {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: AdminFurnitureGetDTO;
  traceId?: string;
}

export interface FurnitureInfo {
  /**
   * 가구 ID
   * @format int64
   */
  furnitureId?: number;
  /** 가구 한글 이름 */
  furnitureNameKr?: string;
  /** 연결된 태그 정보 리스트 */
  tags?: TagInfo[];
}

/** 연결된 태그 정보 리스트 */
export interface TagInfo {
  /**
   * 가구-태그 매핑 ID (FurnitureTag ID)
   * @format int64
   */
  furnitureTagId?: number;
  /**
   * 태그 ID
   * @format int64
   */
  tagId?: number;
  /** 태그 이름 */
  tagName?: string;
  /** 가구 대표 이미지 URL */
  imageUrl?: string;
  /** 검색 키워드 */
  searchKeyword?: string;
  /**
   * 우선순위
   * @format int32
   */
  priority?: number;
}

export interface AdminFurnitureTypeListResponse {
  /** 전체 가구 타입 */
  furnitureTypeList?: AdminFurnitureTypeResponse[];
}

/** 전체 가구 타입 */
export interface AdminFurnitureTypeResponse {
  /**
   * 가구 타입 식별자
   * @format int64
   */
  furnitureTypeId?: number;
  /** 가구 타입 한글명 */
  furnitureTypeNameKr?: string;
  /** 가구 타입 영어명 */
  furnitureTypeNameEng?: string;
}

export interface ApiResponseAdminFurnitureTypeListResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: AdminFurnitureTypeListResponse;
  traceId?: string;
}

export interface AdminFurnitureTagOptionListResponse {
  /** 선택한 가구 타입에 연결된 가구 태그 목록 */
  furnitureTags?: AdminFurnitureTagOptionResponse[];
}

/** 선택한 가구 타입에 연결된 가구 태그 목록 */
export interface AdminFurnitureTagOptionResponse {
  /**
   * 가구 태그 식별자
   * @format int64
   */
  furnitureTagId?: number;
  /**
   * 가구 식별자
   * @format int64
   */
  furnitureId?: number;
  /** 가구 한글 이름 */
  furnitureNameKr?: string;
  /**
   * 가구 타입 식별자
   * @format int64
   */
  furnitureTypeId?: number;
  /** 가구 타입 한글 이름 */
  furnitureTypeNameKr?: string;
  /**
   * 스타일 태그 식별자
   * @format int64
   */
  tagId?: number;
  /** 스타일 태그 한글 이름 */
  tagNameKr?: string;
  /** 검색 키워드 */
  searchKeyword?: string;
  /**
   * 우선순위
   * @format int32
   */
  priority?: number;
}

export interface ApiResponseAdminFurnitureTagOptionListResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: AdminFurnitureTagOptionListResponse;
  traceId?: string;
}

export interface AdminFurnitureOptionListResponse {
  furnitures?: AdminFurnitureOptionResponse[];
}

export interface AdminFurnitureOptionResponse {
  /**
   * 가구 ID
   * @format int64
   */
  furnitureId?: number;
  /** 가구 한글 이름 */
  furnitureNameKr?: string;
  /** 가구 영어 이름 */
  furnitureNameEng?: string;
}

export interface ApiResponseAdminFurnitureOptionListResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: AdminFurnitureOptionListResponse;
  traceId?: string;
}

export interface AdminFurnitureTagGetDTO {
  /** tag 식별자 입니다 */
  tagId?: number[];
  /** tag의 한글 이름 입니다 */
  tagNameKr?: string[];
}

export interface ApiResponseAdminFurnitureTagGetDTO {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: AdminFurnitureTagGetDTO;
  traceId?: string;
}

export interface AdminFurnitureDetailsResponseDTO {
  prompt?: string;
}

export interface ApiResponseAdminFurnitureDetailsResponseDTO {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: AdminFurnitureDetailsResponseDTO;
  traceId?: string;
}

export interface AdminFloorPlanListResponse {
  floorPlans?: AdminFloorPlanResponse[];
}

export interface ApiResponseAdminFloorPlanListResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: AdminFloorPlanListResponse;
  traceId?: string;
}

export interface AdminCurationRawProductListResponse {
  products?: AdminCurationRawProductResponse[];
  /** @format int32 */
  page?: number;
  /** @format int32 */
  size?: number;
  /** @format int64 */
  totalElements?: number;
  /** @format int32 */
  totalPages?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export interface ApiResponseAdminCurationRawProductListResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: AdminCurationRawProductListResponse;
  traceId?: string;
}

export interface AdminCurationRawProductColorOptionResponse {
  label?: string;
  value?: string;
}

export interface ApiResponseListAdminCurationRawProductColorOptionResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: AdminCurationRawProductColorOptionResponse[];
  traceId?: string;
}

export interface AdminBannerListResponse {
  banners?: AdminBannerResponse[];
}

export interface ApiResponseAdminBannerListResponse {
  /** @format int32 */
  code?: number;
  msg?: string;
  data?: AdminBannerListResponse;
  traceId?: string;
}

export interface AdminTagDeleteRequestDTO {
  /** @format int64 */
  tagId: number;
}

export interface AdminFurnitureDeleteDTO {
  /** 업데이트할 가구의 한글 이름(식별자) */
  furnitureNameKr?: string;
}

export interface AdminDeleteFurnitureTypeRequest {
  /**
   * 삭제할 가구 타입 식별자
   * @format int64
   */
  furnitureTypeId?: number;
}

export interface AdminFurnitureTagDeleteDTO {
  /** 업데이트할 가구의 한글 이름(식별자) */
  furnitureNameKr?: string;
  /**
   * 업데이트할 가구의 태그 ID(식별자)
   * @format int64
   */
  tagId?: number;
}

export type UpdatePresetData = ApiResponseVoid;

export type DeletePresetData = ApiResponseVoid;

export type ReissueData = ApiResponseString;

export type LogoutData = ApiResponseString;

export type GenerateImageV4ByGeminiData = ApiResponseGenerateImageV4Response;

export type Generate2ImageByFastApiData = ApiResponseImageInfoListResponse;

export type Generate2ImageByFastApiGeminiData =
  ApiResponseImageInfoListResponse;

export type SignUpData = ApiResponseString;

export type UpdateUserData = ApiResponseString;

export type GenerateData = ApiResponseString;

export type GenerateImageByFastApiData = ApiResponseImageInfoResponse;

export type GenerateImageByFastApiGeminiData = ApiResponseImageInfoResponse;

export type ToggleRawProductJjymData = ApiResponseJjymToggleResponse;

export type LikeCarouselV2Data = ApiResponseString;

export type HateCarouselV2Data = ApiResponseString;

export type SignUp1Data = ApiResponseString;

export type UpdateUser1Data = ApiResponseString;

export type ToggleJjymData = ApiResponseJjymToggleResponse;

export type ScrapeData = ApiResponseScrapedProductResponse;

export type CreateJobData = ApiResponseCreateJobResponse;

export type Generate1Data = ApiResponseString;

export type HousingSelectionsData = ApiResponseHouseIdResponse;

export type GenerateImagePreferenceData = ApiResponseVoid;

export type DeleteGenerateImagePreferenceData = ApiResponseVoid;

export type ToggleFactorLogData = ApiResponseVoid;

export type GetImageFallbackData = ApiResponseImageInfoResponse;

export type GenerateImageData = ApiResponseImageInfoResponse;

export type GenerateImageByProductsData = ApiResponseGenerateImageV4Response;

export type GenerateOtherStyleImageByGeminiData =
  ApiResponseOtherStyleGenerateImageResponse;

export type GenerateImageByGeminiData = ApiResponseImageInfoResponse;

export type GenerateBannerImageByGeminiData =
  ApiResponseBannerGenerateImageResponse;

export type CreateFurnitureRecommendBtnClickLogData = ApiResponseVoid;

export type CreatePaymentBtnClickLogData = ApiResponseVoid;

export type ToggleCatalogItemJjymData = ApiResponseJjymToggleResponse;

export type LikeCarouselData = ApiResponseString;

export type HateCarouselData = ApiResponseString;

export type CreateTagData = ApiResponseString;

export type DeleteTagData = ApiResponseString;

export type UpdateTagData = ApiResponseString;

export type GetStylesData = ApiResponseAdminStyleListResponse;

export type CreateStyleData = ApiResponseAdminStyleResponse;

export type CreateStyleImageUploadUrlData =
  ApiResponseAdminBannerImageUploadResponse;

export type CreateMoodBoardData = ApiResponseAdminMoodBoardCreateResponseDTO;

export type DeleteMoodBoardData = ApiResponseString;

export type GrantCreditsData = ApiResponseAdminCreditGrantResponse;

export type GetLandings1Data = ApiResponseAdminLandingListResponse;

export type CreateLandingData = ApiResponseAdminLandingResponse;

export type CreateLandingImageUploadUrlData =
  ApiResponseAdminBannerImageUploadResponse;

export type AdminFurnitureData = ApiResponseString;

export type DeleteFurnitureData = ApiResponseString;

export type UpdateFurnitureData = ApiResponseAdminFurnitureUpdateResponseDTO;

export type AdminFurnitureTypeData = ApiResponseString;

export type DeleteFurnitureTypeData = ApiResponseString;

export type UpdateFurnitureTypeData = ApiResponseString;

export type GetFurniturePromptData =
  ApiResponseAdminFurnitureDetailsResponseDTO;

export type AdminFurniturePromptData =
  ApiResponseAdminFurniturePromptCreateResponseDTO;

export type GetFloorPlansData = ApiResponseAdminFloorPlanListResponse;

export type CreateFloorPlanData = ApiResponseAdminFloorPlanResponse;

export type CreateFloorPlanImageUploadUrlData =
  ApiResponseAdminFloorPlanImageUploadResponse;

export type SaveSoozipRawProductsData = ApiResponseSoozipRawProductSaveResponse;

export type GetRawProductsData = ApiResponseAdminCurationRawProductListResponse;

export type CreateRawProductData = ApiResponseAdminCurationRawProductResponse;

export type CreateRawProductFurnitureTagMappingData =
  ApiResponseAdminCurationRawProductFurnitureTagResponse;

export type GetBannersData = ApiResponseAdminBannerListResponse;

export type CreateBannerData = ApiResponseAdminBannerResponse;

export type CreateBannerImageUploadUrlData =
  ApiResponseAdminBannerImageUploadResponse;

export type CreateAddressData = ApiResponseVoid;

export type TextSearchData = ApiResponseAdminSearchResult;

export type GetPresets1Data = ApiResponsePresetListResponse;

export type CreatePresetData = ApiResponseLong;

export type KeywordCheckData = ApiResponseKeywordCheckResponse;

export type ImageSearchData = ApiResponseAdminSearchResult;

export type GetMyPageProfileData = ApiResponseMyPageProfileResponse;

export type UpdateMyPageProfileData = ApiResponseMyPageProfileResponse;

export type GetStyleData = ApiResponseAdminStyleResponse;

export type DeleteStyleData = ApiResponseString;

export type UpdateStyleData = ApiResponseAdminStyleResponse;

export type GetLandingData = ApiResponseAdminLandingResponse;

export type DeleteLandingData = ApiResponseString;

export type UpdateLandingData = ApiResponseAdminLandingResponse;

export type GetFloorPlanData = ApiResponseAdminFloorPlanResponse;

export type DeleteFloorPlanData = ApiResponseString;

export type UpdateFloorPlanData = ApiResponseAdminFloorPlanResponse;

export type GetRawProductData = ApiResponseAdminCurationRawProductResponse;

export type DeleteRawProductData = ApiResponseString;

export type UpdateRawProductData = ApiResponseAdminCurationRawProductResponse;

export type DeleteRawProductFurnitureTagMappingData = ApiResponseString;

export type UpdateRawProductFurnitureTagMappingData =
  ApiResponseAdminCurationRawProductFurnitureTagResponse;

export type UpdateRawProductExposureData = ApiResponseString;

export type GetBannerData = ApiResponseAdminBannerResponse;

export type DeleteBannerData = ApiResponseString;

export type UpdateBannerData = ApiResponseAdminBannerResponse;

export type KakaoOAuthCallbackData = any;

export type KakaoLoginData = ApiResponseKakaoLoginResponse;

export type GetRecentFloorPlanData = ApiResponseRecentFloorPlanResponse;

export type RotateNicknameData = ApiResponseString;

export type GetUserImageHistoryListV2Data =
  ApiResponseMyPageGeneratedImageV2Response;

export type GetMyRawProductJjymsData = ApiResponseJjymV2ListResponse;

export type GetExploreHouseTemplatesData =
  ApiResponseExploreHouseTemplateListResponse;

export type GetExploreHouseTemplateDetailData =
  ApiResponseExploreHouseTemplateDetailResponse;

export type GetFurnitureCategoriesV2Data =
  ApiResponseFurnitureCategoriesResponse;

export type GetDashboardCategoriesData = ApiResponseDashboardCategoriesResponse;

export type GetActivityFurnitureMappingsData =
  ApiResponseActivityFurnitureMappingsResponse;

export type GetProductsData = ApiResponseCurationProductListResponse;

export type GetCarouselsV2Data = ApiResponseGetCarouselV2ListResponseDTO;

export type GetPresetsData = ApiResponsePresetListResponse;

export type GetPresetDetailData = ApiResponsePresetDetailResponse;

export type GetJobData = ApiResponseCompareJobResponse;

export type GetHistoryData = ApiResponseCompareHistoryResponse;

export type GetOtherStylesData = ApiResponseOtherStyleListResponse;

export type GetOtherStyleDetailData = ApiResponseOtherStyleDetailResponse;

export type GetMyPageInfoData = ApiResponseMyPageInfoResponse;

export type GetUserImageHistoryListData =
  ApiResponseUserImageHistoryListResponse;

export type GetImageHistoryResultPageData =
  ApiResponseImageHistoriesResultPageResponse;

export type MoodboardImagesData = ApiResponseMoodBoardListResponse;

export type GetLandingsData = ApiResponseLandingListResponse;

export type GetMyJjymsData = ApiResponseJjymListResponse;

export type HousingOptionsData = ApiResponseHouseOptionsResponse;

export type GetHouseTemplatesData = ApiResponseFloorPlanListResponse;

export type GetFurnitureProductInfoFromNaverApiForPlanData =
  ApiResponseFurnitureProductsInfoResponseForPlan;

export type GetFurnitureProductInfoFromNaverApiForPlanV2Data =
  ApiResponseFurnitureProductsInfoResponseForPlan;

export type GetGeneratedImageMetaData = ApiResponseGeneratedImageMetaResponse;

export type GetFurnitureProductInfoFromNaverApiData =
  ApiResponseFurnitureProductsInfoResponseV2;

export type GetFurnitureCategoriesData = ApiResponseFurnitureCategoriesResponse;

export type GetSimilarItemsData = ApiResponseSimilarItemsResponse;

export type GetRelatedImagesData = ApiResponseRelatedImagesResponse;

export type GetListResultItemsData = ApiResponseGenerateImageResultResponse;

export type GetFactorsData = ApiResponseFactorsResponse;

export type GetEnvData = Record<string, string>;

export type GetFurnitureAndActivityData =
  ApiResponseFurnitureAndActivityResponse;

export type GetProducts1Data = ApiResponseCurationProductListResponse;

export type GetProductDetailData = ApiResponseCurationProductDetailResponse;

export type GetFiltersData = ApiResponseCurationProductFilterResponse;

export type GetMyEbayJjymsData = ApiResponseCompareCatalogJjymListResponse;

export type CheckHasGeneratedImageData = ApiResponseBoolean;

export type GetCarouselsData = ApiResponseGetCarouselListResponseDTO;

export type GetExploreBannersData = ApiResponseBannerExploreListResponse;

export type GetExploreBannerDetailData = ApiResponseBannerDetailResponse;

export type AdminOnlyTestData = ApiResponseString;

export type GetTagsData = ApiResponseAdminTagGetAllResponseDTO;

export type SearchRawProductsData =
  ApiResponseAdminBannerRawProductSearchResponse;

export type GetAllData = ApiResponseAdminMoodBoardGetAllResponseDTO;

export type SearchMembersData = ApiResponseAdminMemberSearchResponse;

export type GetFurnituresData = ApiResponseAdminFurnitureGetDTO;

export type GetFurnitureTypesData = ApiResponseAdminFurnitureTypeListResponse;

export type GetFurnitureTagsByTypeData =
  ApiResponseAdminFurnitureTagOptionListResponse;

export type GetFurnituresByTypeData =
  ApiResponseAdminFurnitureOptionListResponse;

export type GetFurnitureTagsData = ApiResponseAdminFurnitureTagGetDTO;

export type GetColorOptionsData =
  ApiResponseListAdminCurationRawProductColorOptionResponse;

export type SearchRawProducts1Data =
  ApiResponseAdminBannerRawProductSearchResponse;

export type CreateAccessData = ApiResponseString;

export type AccessTestData = ApiResponseString;

export type DeleteUserData = ApiResponseString;

export type DeleteFurnitureTagData = ApiResponseString;

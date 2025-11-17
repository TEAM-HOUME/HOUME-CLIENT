// 가구 찜하기 API
export interface SaveItemsRequest {
  recommendFurnitureId: number;
}

export interface SaveItemsResponse {
  favorited: boolean;
}

export interface FloorPlanData {
  id: number;
  form: string;
  structure: string;
  floorPlanImage: string;
}

export interface FloorPlanResponse {
  code: number;
  msg: string;
  data: {
    floorPlanList: FloorPlanData[];
  };
}

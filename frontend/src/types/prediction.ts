export interface HouseFeatures {
  carpet_area_sqft: number;
  floor_num: number;
  Bathroom: number;
  Balcony: number;
  "Car Parking": number;
  location_grouped: string;
  Furnishing: string;
  Transaction: string;
  Ownership: string;
  facing: string;
}

export interface PredictionResponse {
  predicted_price: number;
}

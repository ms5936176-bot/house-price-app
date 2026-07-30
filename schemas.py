from pydantic import BaseModel, Field
from typing import Literal


class HouseFeatures(BaseModel):
    # Numeric features
    carpet_area_sqft: float = Field(..., gt=0, description="Carpet area in square feet")
    floor_num: int = Field(..., description="Floor number (0 = ground, -1 = basement)")
    Bathroom: int = Field(..., ge=0, description="Number of bathrooms")
    Balcony: int = Field(..., ge=0, description="Number of balconies")
    Car_Parking: int = Field(..., ge=0, alias="Car Parking", description="Number of car parking spots")

    # Categorical features
    location_grouped: str = Field(..., description="Location (must be one from /locations)")
    Furnishing: str
    Transaction: str
    Ownership: str
    facing: str

    class Config:
        populate_by_name = True


class PredictionResponse(BaseModel):
    predicted_price: float
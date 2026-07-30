import joblib
import json
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from schemas import HouseFeatures, PredictionResponse

app = FastAPI(title="House Price Prediction API")

# Allow the React frontend (running on a different port) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # في التطوير بس؛ في الإنتاج حدد الدومين الحقيقي
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the model and allowed locations ONCE at startup (not on every request)
model = joblib.load("house_price.pkl")
with open("locations.json") as f:
    allowed_locations = json.load(f)


@app.get("/locations")
def get_locations():
    return {"locations": allowed_locations}


@app.post("/predict", response_model=PredictionResponse)
def predict(features: HouseFeatures):
    if features.location_grouped not in allowed_locations:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown location. Must be one of the values from /locations."
        )

    # Build a single-row DataFrame with EXACT column names used in training
    input_df = pd.DataFrame([{
        "carpet_area_sqft": features.carpet_area_sqft,
        "floor_num": features.floor_num,
        "Bathroom": features.Bathroom,
        "Balcony": features.Balcony,
        "Car Parking": features.Car_Parking,
        "location_grouped": features.location_grouped,
        "Furnishing": features.Furnishing,
        "Transaction": features.Transaction,
        "Ownership": features.Ownership,
        "facing": features.facing,
    }])

    prediction = model.predict(input_df)[0]
    return PredictionResponse(predicted_price=float(prediction))
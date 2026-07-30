# House Price Prediction — End-to-End ML Web App

An end-to-end machine learning product that predicts house prices in India, built from
raw Kaggle data to a deployed web application: a Jupyter notebook for data cleaning and
model training, a FastAPI backend serving the trained model, and a React (TypeScript)
frontend where users enter property details and get an instant price prediction.

## Overview

The project takes ~187K real property listings scraped from Indian real-estate
platforms, cleans and engineers features from messy text fields (prices written as
"42 Lac" or "1.2 Cr", areas in sqft/sqm, floors like "3 out of 10"), trains and compares
several regression models, and serves the best one through a REST API consumed by a
React form.

## Architecture

```
┌─────────────────┐        HTTP POST /predict        ┌──────────────────┐        ┌────────────────────┐
│  React Frontend  │ ───────────────────────────────► │  FastAPI Backend  │ ─────► │  house_price.pkl    │
│  (Vite + TS)     │ ◄─────────────────────────────── │  (Uvicorn)        │        │  (sklearn Pipeline) │
└─────────────────┘        JSON { predicted_price }   └──────────────────┘        └────────────────────┘
```

## Tech Stack

| Layer      | Technology                                              |
|------------|----------------------------------------------------------|
| Notebook   | Python, pandas, numpy, scikit-learn, matplotlib, seaborn |
| Backend    | FastAPI, Pydantic, Uvicorn, joblib                       |
| Frontend   | React, TypeScript, Vite                                  |
| Model      | scikit-learn Pipeline (ColumnTransformer + RandomForestRegressor) |

## Project Structure

```
APP/
├── notebooks/
│   └── house_price_model.ipynb   # data cleaning, EDA, training, evaluation, export
├── main.py                       # FastAPI app entry point
├── schemas.py                    # Pydantic request/response schemas
├── house_price.pkl               # trained sklearn Pipeline (exported from the notebook)
├── locations.json                # allowed location list for the frontend dropdown
├── requirements.txt              # backend Python dependencies
├── frontend/                     # React + TypeScript + Vite app
│   ├── src/
│   │   ├── api/predictionClient.ts
│   │   ├── components/PredictionForm.tsx
│   │   ├── pages/HomePage.tsx | ResultPage.tsx | NotFoundPage.tsx
│   │   └── types/prediction.ts
│   └── .env.example
└── README.md
```

## Dataset

**Source:** [House Price by Juhi Bhojani](https://www.kaggle.com/datasets/juhibhojani/house-price) on Kaggle
**File:** `house_prices.csv` — ~187,531 rows, 21 columns of real property listings from India.

### Download

**Option A — Manual:** Download the CSV from the Kaggle link above and place it at `notebooks/data/house_prices.csv`.

**Option B — Kaggle CLI:**
```bash
pip install kaggle
# Get your API token: Kaggle → Settings → API → "Create New Token"
# Place kaggle.json in ~/.kaggle/ (macOS/Linux) or C:\Users\<you>\.kaggle\ (Windows)
kaggle datasets download -d juhibhojani/house-price -p notebooks/data --unzip
```

## Data Cleaning & Feature Engineering

The raw data required significant cleaning before it could be modeled:

- **Price** (`Amount(in rupees)`) was text like `"42 Lac"` or `"1.2 Cr"` → converted to a
  numeric rupee value (`price_clean`).
- **Carpet Area** was text like `"1200 sqft"` or `"140 sqm"` → parsed and normalized to
  square feet (`carpet_area_sqft`).
- **Floor** was text like `"3 out of 10"`, `"Ground"`, `"Basement"` → converted to a
  numeric floor level (`floor_num`).
- **Bathroom / Balcony / Car Parking** were converted to numeric and missing values were
  imputed with the median (or 0 for Car Parking).
- **Location / Society** are high-cardinality categoricals (thousands of unique values)
  → grouped to the top 50 most frequent values, with the rest mapped to `"Other"`.
- Unused columns (`Index`, `Title`, `Description`, `Dimensions`, `Plot Area`, `Society`)
  were dropped.
- **Outliers** were removed based on price-per-square-foot, keeping only the 1st–99th
  percentile range.

After cleaning, the dataset was reduced from 187,531 rows to **99,968 rows** used for
training.

## Model Training & Evaluation

Six models were trained and compared — three algorithms, each with and without a
log-transformed target (`np.log1p`) to reduce the effect of the highly skewed price
distribution:

| Model                     | MAE (₹)      | RMSE (₹)     | R²      |
|---------------------------|-------------:|-------------:|--------:|
| **Random Forest (winner)**| 1,072,937    | 4,259,504    | 0.9099  |
| Random Forest (log)       | 1,044,037    | 4,285,934    | 0.9088  |
| Gradient Boosting         | 2,800,047    | 5,335,379    | 0.8586  |
| Gradient Boosting (log)   | 2,800,876    | 6,107,390    | 0.8148  |
| Linear Regression         | 4,571,537    | 7,542,829    | 0.7175  |
| Linear Regression (log)   | 4,460,805    | 33,481,720   | -4.5670 |

**Winner: Random Forest Regressor** — it achieved the lowest error and highest R² of all
six models, explaining about 91% of the variance in house prices on the held-out test
set. A 3-fold cross-validation on the full dataset gave a mean R² of 0.56, reflecting
the real-world noise and variability in the raw listings data (the test-set R² above is
the more representative single-split evaluation used for model selection).

The full pipeline — imputation, scaling, one-hot encoding, and the regressor — is
bundled into a single scikit-learn `Pipeline` and exported with `joblib` as
`house_price.pkl`, so the backend does not need to duplicate any preprocessing logic.

## Backend Setup (FastAPI)

```bash
cd APP
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS / Linux

pip install -r requirements.txt

uvicorn main:app --reload
# API available at http://localhost:8000
# Interactive docs at http://localhost:8000/docs
```

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| *(see `.env.example` in the backend for any configuration values used)* | | |

### API Reference

**GET /health**
```bash
curl http://localhost:8000/health
```
Response:
```json
{ "status": "ok" }
```

**POST /predict**
```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "location": "bangalore",
    "carpet_area_sqft": 1200,
    "floor_num": 3,
    "bathroom": 2,
    "balcony": 1,
    "furnishing": "Semi-Furnished",
    "transaction": "Resale",
    "ownership": "Freehold",
    "facing": "East"
  }'
```
Response:
```json
{ "predicted_price": 4250000.0 }
```

> Field names in the request must exactly match the schema defined in `schemas.py`.

## Frontend Setup (React + TypeScript + Vite)

```bash
cd frontend
npm install
cp .env.example .env
# .env should contain: VITE_API_BASE_URL=http://localhost:8000

npm run dev
# App available at http://localhost:5173
```

## Running the Full App

1. Start the backend: `uvicorn main:app --reload` (port 8000)
2. Start the frontend: `npm run dev` inside `frontend/` (port 5173)
3. Open `http://localhost:5173   , fill in the property details, and submit the form to
   see a live prediction. 

## Team

ms5936176-bot
- Malak Mohamed

## License

This project was built as part of an academic assignment (ITI).

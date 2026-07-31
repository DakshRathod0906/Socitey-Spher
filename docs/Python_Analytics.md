# Python Analytics Documentation

The Python Analytics service is a dedicated subsystem responsible for ETL, synthetic data generation, and Machine Learning operations. It runs independently from the operational Node.js backend.

## 1. Analytics Lifecycle Pipeline

The analytics process follows a strict pipeline from operational data extraction to final dashboard prediction:

```text
MongoDB
   │
   ▼
Extract
   │
   ▼
Synthetic Data
   │
   ▼
Cleaning
   │
   ▼
Feature Engineering
   │
   ▼
Model Training
   │
   ▼
.joblib Models
   │
   ▼
Prediction API
   │
   ▼
React Dashboard
```

## 2. Folder Structure

```text
python-analytics/
├── api/            # API routes and controllers (FastAPI / Flask)
├── charts/         # Generated output charts (.png, .svg)
├── datasets/       # Local storage for CSVs
├── etl/            # Scripts for data extraction, transformation, loading
├── metadata/       # Model metadata, scaler parameters, encoders
├── models/         # Trained model artifacts (.pkl, .joblib)
├── prediction/     # Scripts for loading models and generating predictions
├── reports/        # Generated JSON/CSV analytical reports
├── services/       # Core business logic for analytics
├── training/       # Model training and evaluation scripts
├── utils/          # Helper functions (logging, data processing)
├── app.py          # API Server entry point
└── config.py       # Configuration and Environment variable loading
```

## 3. Synthetic Data Generation & ETL

To simulate a fully operational society for academic purposes, the ETL pipeline:
1. **Extracts** core structural data (Towers, Flats, Users) from MongoDB.
2. **Generates Synthetic History**: Scripts create realistic, chronological histories of complaints, visitors, and billing payments.
3. **Cleans & Transforms**: Normalizes data, handles categorical encoding, scales numerical features.
4. **Saves Data**: Stores final datasets in `datasets/training/` for ML.

## 4. Machine Learning Models

Models are trained using `scikit-learn`.
- **Algorithms Used**: Random Forest, XGBoost (or similar classifiers).
- **Features Engineered**: Time of day, historical complaint frequency, resident payment history, categorization keywords.
- **Outputs**: Complaint Categorization Prediction, Resolution Time Estimation, Priority Classification.

Models are serialized using `joblib` and stored in the `models/` directory alongside their evaluation metrics.

## 5. Analytics API & Output

The `app.py` server exposes endpoints (`http://localhost:8000/api/v1/...`) that load these `.joblib` models into memory. The React Frontend queries this API directly for dashboards and reporting. The pipeline also generates evaluation metrics and saves them in `reports/`, leveraging `matplotlib` and `seaborn` to generate visual charts (`charts/`).

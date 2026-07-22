import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
import config
import logging
from training.utils import save_model_artifacts, calculate_regression_metrics

logger = logging.getLogger(__name__)

def train_complaint_resolution_model():
    logger.info("Training Complaint Resolution Time Model (Regression)")
    
    train_path = config.TRAINING_DATA_DIR / "complaints_resolution_training.csv"
    test_path = config.TEST_DATA_DIR / "complaints_resolution_test.csv"
    
    if not train_path.exists() or not test_path.exists():
        logger.warning("Training/test data for complaint resolution not found.")
        return

    df_train = pd.read_csv(train_path)
    df_test = pd.read_csv(test_path)
    
    features = ['category', 'priority']
    target = 'resolution_time_hours'
    
    X_train = df_train[features]
    y_train = df_train[target]
    
    X_test = df_test[features]
    y_test = df_test[target]

    # Preprocessing pipeline
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore'), features)
        ]
    )
    
    # Define model
    model = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', RandomForestRegressor(n_estimators=100, random_state=42))
    ])
    
    # Train
    model.fit(X_train, y_train)
    
    # Predict and evaluate
    y_pred = model.predict(X_test)
    metrics = calculate_regression_metrics(y_test, y_pred)
    
    # Feature Importances
    try:
        ohe = model.named_steps['preprocessor'].named_transformers_['cat']
        feature_names = ohe.get_feature_names_out(features)
        importances = model.named_steps['regressor'].feature_importances_
        feature_importances = {name: float(imp) for name, imp in zip(feature_names, importances)}
    except Exception as e:
        logger.warning(f"Could not extract feature importances: {e}")
        feature_importances = {}
    
    # Save artifacts
    metadata = {
        "version": "1.0.0",
        "algorithm": "RandomForestRegressor",
        "features": features,
        "target": target,
        "description": "Predicts complaint resolution time in hours based on category and priority.",
        "feature_importances": feature_importances
    }
    
    save_model_artifacts(
        model_name="complaint_resolution",
        model=model,
        metadata=metadata,
        metrics=metrics,
        y_test=y_test,
        y_pred=y_pred,
        model_type="regression"
    )

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    train_complaint_resolution_model()

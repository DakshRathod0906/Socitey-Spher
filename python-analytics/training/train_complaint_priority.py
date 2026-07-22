import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
import config
import logging
from training.utils import save_model_artifacts, calculate_classification_metrics

logger = logging.getLogger(__name__)

def train_complaint_priority_model():
    logger.info("Training Complaint Priority Model (Classification)")
    
    train_path = config.TRAINING_DATA_DIR / "complaints_priority_training.csv"
    test_path = config.TEST_DATA_DIR / "complaints_priority_test.csv"
    
    if not train_path.exists() or not test_path.exists():
        logger.warning("Training/test data for complaint priority not found.")
        return

    df_train = pd.read_csv(train_path)
    df_test = pd.read_csv(test_path)
    
    features = ['category']
    target = 'priority'
    
    # Check if target exists
    if target not in df_train.columns:
        logger.warning(f"Target '{target}' not found in training data.")
        return
        
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
        ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))
    ])
    
    # Train
    model.fit(X_train, y_train)
    
    # Predict and evaluate
    y_pred = model.predict(X_test)
    metrics = calculate_classification_metrics(y_test, y_pred)
    
    # Feature Importances
    try:
        ohe = model.named_steps['preprocessor'].named_transformers_['cat']
        feature_names = ohe.get_feature_names_out(features)
        importances = model.named_steps['classifier'].feature_importances_
        feature_importances = {name: float(imp) for name, imp in zip(feature_names, importances)}
    except Exception as e:
        logger.warning(f"Could not extract feature importances: {e}")
        feature_importances = {}
        
    # Save artifacts
    metadata = {
        "version": "1.0.0",
        "algorithm": "RandomForestClassifier",
        "features": features,
        "target": target,
        "description": "Predicts complaint priority based on category.",
        "feature_importances": feature_importances
    }
    
    save_model_artifacts(
        model_name="complaint_priority",
        model=model,
        metadata=metadata,
        metrics=metrics,
        y_test=y_test,
        y_pred=y_pred,
        model_type="classification"
    )

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    train_complaint_priority_model()

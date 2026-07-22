import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import Pipeline
import config
import logging
from training.utils import save_model_artifacts, calculate_regression_metrics

logger = logging.getLogger(__name__)

def train_visitor_forecast_model():
    logger.info("Training Visitor Forecast Model (Time Series / Regression)")
    
    train_path = config.TRAINING_DATA_DIR / "visitors_forecast_training.csv"
    test_path = config.TEST_DATA_DIR / "visitors_forecast_test.csv"
    
    if not train_path.exists() or not test_path.exists():
        logger.warning("Training/test data for visitor forecast not found.")
        return

    df_train = pd.read_csv(train_path)
    df_test = pd.read_csv(test_path)
    
    features = ['prev_month_count']
    target = 'visitor_count'
    
    if df_train.empty or df_test.empty:
        logger.warning("Not enough data to train visitor forecast model.")
        return
        
    X_train = df_train[features]
    y_train = df_train[target]
    
    X_test = df_test[features]
    y_test = df_test[target]

    # Define model
    model = Pipeline(steps=[
        ('regressor', LinearRegression())
    ])
    
    # Train
    model.fit(X_train, y_train)
    
    # Predict and evaluate
    y_pred = model.predict(X_test)
    metrics = calculate_regression_metrics(y_test, y_pred)
    
    # Save artifacts
    metadata = {
        "version": "1.0.0",
        "algorithm": "LinearRegression",
        "features": features,
        "target": target,
        "description": "Predicts next month's visitor count based on previous month's count."
    }
    
    save_model_artifacts(
        model_name="visitor_forecast",
        model=model,
        metadata=metadata,
        metrics=metrics,
        y_test=y_test,
        y_pred=y_pred,
        model_type="regression"
    )

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    train_visitor_forecast_model()

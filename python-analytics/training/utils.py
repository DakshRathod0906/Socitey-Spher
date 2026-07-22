import os
import json
import joblib
from datetime import datetime, UTC
import config
import logging
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns

logger = logging.getLogger(__name__)

def save_model_artifacts(model_name: str, model, metadata: dict, metrics: dict, y_test=None, y_pred=None, model_type="regression"):
    """
    Saves the model, metadata, and evaluation metrics in a standardized structure.
    Also saves prediction plots if applicable.
    """
    model_dir = config.MODEL_DIR / model_name
    model_dir.mkdir(parents=True, exist_ok=True)
    
    # Save Model
    joblib.dump(model, model_dir / "model.joblib")
    
    # Save Metadata
    metadata["trainedAt"] = datetime.now(UTC).isoformat()
    with open(model_dir / "metadata.json", "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
        
    # Save Metrics (to model dir AND evaluation dir for global reports)
    with open(model_dir / "metrics.json", "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)
        
    config.EVALUATION_DIR.mkdir(parents=True, exist_ok=True)
    with open(config.EVALUATION_DIR / f"{model_name}.json", "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)
        
    # Save feature importances if provided
    if "feature_importances" in metadata:
        with open(model_dir / "feature_importance.json", "w", encoding="utf-8") as f:
            json.dump(metadata["feature_importances"], f, indent=2)
            
    # Prediction Plots
    if y_test is not None and y_pred is not None:
        plot_path = config.EVALUATION_DIR / f"{model_name}_plot.png"
        plt.figure(figsize=(8, 6))
        
        if model_type == "regression":
            plt.scatter(y_test, y_pred, alpha=0.5)
            plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'r--', lw=2)
            plt.xlabel("Actual")
            plt.ylabel("Predicted")
            plt.title(f"{model_name} - Actual vs Predicted")
        elif model_type == "classification":
            cm = confusion_matrix(y_test, y_pred)
            sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
            plt.xlabel("Predicted")
            plt.ylabel("Actual")
            plt.title(f"{model_name} - Confusion Matrix")
            
        plt.tight_layout()
        plt.savefig(plot_path)
        plt.close()
        
    logger.info(f"Saved artifacts for model '{model_name}'")

def calculate_regression_metrics(y_true, y_pred):
    mae = mean_absolute_error(y_true, y_pred)
    rmse = mean_squared_error(y_true, y_pred) ** 0.5

    r2 = None
    if len(y_true) >= 2:
        r2 = r2_score(y_true, y_pred)

    return {
        "MAE": float(mae),
        "RMSE": float(rmse),
        "R2": None if r2 is None else float(r2)
    }

def calculate_classification_metrics(y_true, y_pred, average="weighted"):
    return {
        "Accuracy": float(accuracy_score(y_true, y_pred)),
        "Precision": float(precision_score(y_true, y_pred, average=average, zero_division=0)),
        "Recall": float(recall_score(y_true, y_pred, average=average, zero_division=0)),
        "F1": float(f1_score(y_true, y_pred, average=average, zero_division=0))
    }

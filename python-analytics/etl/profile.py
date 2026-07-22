import os
import json
import logging
import pandas as pd
import numpy as np
import config

logger = logging.getLogger(__name__)

def generate_profile(df: pd.DataFrame, collection_name: str):
    """Generates a data profile for a given dataframe."""
    profile = {
        "collection": collection_name,
        "row_count": len(df),
        "column_count": len(df.columns),
        "memory_usage_mb": float(df.memory_usage(deep=True).sum() / (1024 * 1024)),
        "columns": {}
    }

    if df.empty:
        return profile

    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    categorical_cols = df.select_dtypes(exclude=[np.number]).columns.tolist()

    for col in df.columns:
        col_data = df[col]
        col_profile = {
            "type": str(col_data.dtype),
            "missing_count": int(col_data.isnull().sum()),
            "missing_percentage": float(col_data.isnull().sum() / len(df) * 100),
            "unique_count": int(col_data.nunique())
        }

        if col in numeric_cols:
            clean_data = col_data.dropna()
            if clean_data.empty:
                col_profile.update({
                    "mean": None, "std": None, "min": None,
                    "25%": None, "50%": None, "75%": None, "max": None,
                    "outliers_count": 0
                })
            else:
                q1 = clean_data.quantile(0.25)
                q3 = clean_data.quantile(0.75)
                iqr = q3 - q1
                lower_bound = q1 - 1.5 * iqr
                upper_bound = q3 + 1.5 * iqr
                outliers = clean_data[(clean_data < lower_bound) | (clean_data > upper_bound)]
                
                col_profile.update({
                    "mean": float(clean_data.mean()),
                    "std": float(clean_data.std()),
                    "min": float(clean_data.min()),
                    "25%": float(q1),
                    "50%": float(clean_data.median()),
                    "75%": float(q3),
                    "max": float(clean_data.max()),
                    "outliers_count": len(outliers)
                })
        elif col in categorical_cols:
            col_profile["top_categories"] = col_data.value_counts().head(5).to_dict()

        profile["columns"][col] = col_profile

    # Correlations for numeric columns
    if len(numeric_cols) > 1:
        corr_matrix = df[numeric_cols].corr().fillna(0).round(3).to_dict()
        profile["correlations"] = corr_matrix
    else:
        profile["correlations"] = {}

    return profile

def run_profiling():
    """Runs data profiling on all processed datasets."""
    logger.info("Starting Data Profiling Phase")
    
    collections = ["complaints", "expenses", "visitors", "vehicles", "users", "notices"]
    dataset_summary = {
        "generated_at": pd.Timestamp.now().isoformat(),
        "datasets": {}
    }

    for collection in collections:
        file_path = config.PROCESSED_DATA_DIR / f"{collection}.csv"
        if not file_path.exists():
            logger.warning(f"File {file_path} not found. Skipping profiling for {collection}.")
            continue

        try:
            df = pd.read_csv(file_path)
            profile = generate_profile(df, collection)
            
            # Save individual profile
            profile_path = config.PROFILING_DIR / f"{collection}_profile.json"
            with open(profile_path, "w", encoding="utf-8") as f:
                json.dump(profile, f, indent=2, default=str)
                
            dataset_summary["datasets"][collection] = {
                "row_count": profile["row_count"],
                "column_count": profile["column_count"],
                "memory_usage_mb": profile["memory_usage_mb"]
            }
            logger.info(f"Generated profile for {collection} ({profile['row_count']} rows)")
        except Exception as e:
            logger.error(f"Failed to profile {collection}: {e}")

    # Save summary
    summary_path = config.PROFILING_DIR / "dataset_summary.json"
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(dataset_summary, f, indent=2, default=str)
        
    logger.info("Data Profiling Phase Completed")

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    run_profiling()

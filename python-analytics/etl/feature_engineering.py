import time
import pandas as pd
import config
from etl.utils import setup_logger, write_metadata

logger = setup_logger("FeatureEngineering")

def engineer_features(df: pd.DataFrame, collection_name: str) -> pd.DataFrame:
    logger.info(f"Engineering features for {collection_name}...")
    if df.empty:
        return df
        
    df = df.copy()
        
    # Time-based features for collections with createdAt
    if 'createdAt' in df.columns:
        df['created_month'] = df['createdAt'].dt.month
        df['created_weekday'] = df['createdAt'].dt.dayofweek
        df['created_hour'] = df['createdAt'].dt.hour
        
    if collection_name == "complaints":
        if 'createdAt' in df.columns:
            now = pd.Timestamp.utcnow()
            # Complaint age in days
            df['complaint_age_days'] = (now - df['createdAt']).dt.total_seconds() / (3600 * 24)
            
            if 'updatedAt' in df.columns and 'status' in df.columns:
                # resolution time (only if resolved or closed)
                resolved_mask = df['status'].isin(['resolved', 'closed'])
                df.loc[resolved_mask, 'resolution_time_hours'] = (
                    df.loc[resolved_mask, 'updatedAt'] - df.loc[resolved_mask, 'createdAt']
                ).dt.total_seconds() / 3600
                
        if 'status' in df.columns:
            df['is_open'] = df['status'].isin(['pending', 'in_progress'])
            
        # Add derived features for ML
        if 'complaint_age_days' in df.columns:
            # Age buckets
            bins = [-1, 2, 7, 30, float('inf')]
            labels = ['0-2 days', '3-7 days', '8-30 days', '30+ days']
            df['complaint_age_bucket'] = pd.cut(df['complaint_age_days'], bins=bins, labels=labels, ordered=True)
            
            # SLA Missed (Assuming SLA is 7 days)
            df['resolution_sla_missed'] = (df['complaint_age_days'] > 7) & df['is_open']
            
    elif collection_name == "expenses":
        if 'dueDate' in df.columns and 'createdAt' in df.columns:
            # Payment delay (mocked via due date)
            df['dueDate'] = pd.to_datetime(df['dueDate'], errors='coerce')
            now = pd.Timestamp.utcnow()
            delay_seconds = (now - df['dueDate']).dt.total_seconds()
            df['payment_delay_days'] = (delay_seconds / (3600 * 24)).clip(lower=0)
            
    return df

def run_feature_engineering(dataframes: dict):
    logger.info("Starting feature engineering process...")
    start_time = time.time()
    
    engineered_dfs = {}
    total_records = 0
    
    try:
        for coll, df in dataframes.items():
            e_df = engineer_features(df, coll)
            engineered_dfs[coll] = e_df
            total_records += len(e_df)
            
        duration = time.time() - start_time
        write_metadata("Sprint10_ETL", "feature_engineering", total_records, duration, "SUCCESS")
        logger.info(f"Feature engineering completed successfully in {duration:.2f} seconds.")
        return engineered_dfs
        
    except Exception as e:
        duration = time.time() - start_time
        logger.error(f"Feature engineering failed: {str(e)}")
        write_metadata("Sprint10_ETL", "feature_engineering", total_records, duration, f"FAILED: {str(e)}")
        raise

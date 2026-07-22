import time
import pandas as pd
import config
from etl.utils import setup_logger, write_metadata

logger = setup_logger("Transform")

def transform_dataframe(df: pd.DataFrame, collection_name: str) -> pd.DataFrame:
    logger.info(f"Transforming {collection_name}...")
    if df.empty:
        return df
        
    # Common transformations
    # Convert created_at / updated_at to datetime if they exist
    for col in ['createdAt', 'updatedAt', 'date', 'publishDate']:
        if col in df.columns:
            df[col] = pd.to_datetime(df[col], errors='coerce', utc=True)
            
    # Collection-specific transformations
    if collection_name == "users":
        # Handle missing roles or normalize text
        if 'role' in df.columns:
            df['role'] = df['role'].str.lower()
            
    elif collection_name == "complaints":
        if 'status' in df.columns:
            df['status'] = df['status'].str.lower()
            
    elif collection_name == "expenses":
        # Ensure amounts are numeric
        if 'amount' in df.columns:
            df['amount'] = pd.to_numeric(df['amount'], errors='coerce').fillna(0.0)
            
    # Drop completely empty columns
    df = df.dropna(axis=1, how='all')
    
    return df

def run_transformation(dataframes: dict):
    logger.info("Starting transformation process...")
    start_time = time.time()
    
    transformed_dfs = {}
    total_records = 0
    
    try:
        for coll, df in dataframes.items():
            t_df = transform_dataframe(df, coll)
            
            # Save transformed snapshot to clean directory
            clean_path = config.CLEAN_DATA_DIR / f"{coll}.csv"
            t_df.to_csv(clean_path, index=False)
            
            transformed_dfs[coll] = t_df
            total_records += len(t_df)
            
        duration = time.time() - start_time
        write_metadata("Sprint10_ETL", "transform", total_records, duration, "SUCCESS")
        logger.info(f"Transformation completed successfully in {duration:.2f} seconds.")
        return transformed_dfs
        
    except Exception as e:
        duration = time.time() - start_time
        logger.error(f"Transformation failed: {str(e)}")
        write_metadata("Sprint10_ETL", "transform", total_records, duration, f"FAILED: {str(e)}")
        raise

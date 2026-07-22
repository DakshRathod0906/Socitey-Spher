import time
import pandas as pd
from pymongo import MongoClient

import config
from etl.utils import setup_logger, write_metadata

logger = setup_logger("Extract")

def get_db():
    if not config.MONGO_URI:
        raise ValueError("MONGO_URI is not set in the environment variables.")
    client = MongoClient(config.MONGO_URI)
    db = client[config.DATABASE_NAME]
    return db

def extract_collection_to_df(db, collection_name: str) -> pd.DataFrame:
    logger.info(f"Extracting collection: {collection_name}")
    collection = db[collection_name]
    # Fetch all records
    cursor = collection.find()
    
    # Convert to DataFrame
    df = pd.DataFrame(list(cursor))
    
    # Convert ObjectId to string for easier processing if needed
    if '_id' in df.columns:
        df['_id'] = df['_id'].astype(str)
        
    return df

def run_extraction():
    logger.info("Starting extraction process...")
    start_time = time.time()
    
    try:
        db = get_db()
        
        collections_to_extract = [
            "complaints",
            "expenses",    # Billing/Payments
            "notices",
            "visitors",
            "vehicles",    # Parking
            "users"
        ]
        
        dataframes = {}
        total_records = 0
        collection_counts = {}
        
        for coll in collections_to_extract:
            df = extract_collection_to_df(db, coll)
            
            # Save raw snapshot
            raw_path = config.RAW_DATA_DIR / f"{coll}.csv"
            df.to_csv(raw_path, index=False)
            
            records_count = len(df)
            total_records += records_count
            collection_counts[coll] = records_count
            dataframes[coll] = df
            
            logger.info(f"Extracted {records_count} records from {coll}. Snapshot saved.")

        duration = time.time() - start_time
        write_metadata("Sprint10_ETL", "extract", total_records, duration, "SUCCESS", collections=collection_counts)
        logger.info(f"Extraction completed successfully in {duration:.2f} seconds.")
        
        return dataframes
        
    except Exception as e:
        duration = time.time() - start_time
        logger.error(f"Extraction failed: {str(e)}")
        write_metadata("Sprint10_ETL", "extract", 0, duration, f"FAILED: {str(e)}")
        raise

if __name__ == "__main__":
    run_extraction()

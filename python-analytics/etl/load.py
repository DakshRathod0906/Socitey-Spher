import time
import pandas as pd
import config
from etl.utils import setup_logger, write_metadata

logger = setup_logger("Load")

def load_data(dataframes: dict):
    logger.info("Starting data loading/saving process...")
    start_time = time.time()
    total_records = 0
    
    try:
        for coll, df in dataframes.items():
            if df.empty:
                logger.info(f"Skipping empty collection: {coll}")
                continue
                
            out_path = config.PROCESSED_DATA_DIR / f"{coll}.csv"
            df.to_csv(out_path, index=False)
            total_records += len(df)
            logger.info(f"Saved processed {coll} data ({len(df)} records) to {out_path}")
            
        duration = time.time() - start_time
        write_metadata("Sprint10_ETL", "load", total_records, duration, "SUCCESS")
        logger.info(f"Loading completed successfully in {duration:.2f} seconds.")
        
    except Exception as e:
        duration = time.time() - start_time
        logger.error(f"Loading failed: {str(e)}")
        write_metadata("Sprint10_ETL", "load", total_records, duration, f"FAILED: {str(e)}")
        raise

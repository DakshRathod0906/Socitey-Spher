import config
import time
import pandas as pd
from etl.extract import run_extraction
from etl.validate import run_validation
from etl.transform import run_transformation
from etl.feature_engineering import run_feature_engineering
from etl.load import load_data
from etl.utils import setup_logger

logger = setup_logger("MainPipeline")

def main():
    config.RUN_ID = pd.Timestamp.utcnow().strftime("%Y%m%dT%H%M%SZ")
    
    logger.info("==================================================")
    logger.info("Starting Analytics Pipeline (Sprint 10)")
    logger.info("==================================================")
    
    start_time = time.time()
    
    try:
        # 1. Extract
        raw_dfs = run_extraction()
        
        # 2. Validate
        run_validation(raw_dfs)
        
        # 3. Transform
        clean_dfs = run_transformation(raw_dfs)
        
        # 4. Feature Engineering
        processed_dfs = run_feature_engineering(clean_dfs)
        
        # 5. Load (Save processed data)
        load_data(processed_dfs)
        
        # Phase B: Analytics Reports
        from reports.summary import generate_kpis
        from reports.exports import export_summaries
        from reports.charts import generate_charts
        
        kpis = generate_kpis(processed_dfs)
        export_summaries(kpis)
        generate_charts(processed_dfs)
        
        total_time = time.time() - start_time
        logger.info("==================================================")
        logger.info(f"Pipeline completed successfully in {total_time:.2f} seconds.")
        logger.info("==================================================")
        
    except Exception as e:
        logger.error(f"Pipeline failed: {str(e)}")
        logger.error("Stopping pipeline execution.")

if __name__ == "__main__":
    main()

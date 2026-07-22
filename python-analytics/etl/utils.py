import json
import logging
from datetime import datetime
from pathlib import Path
import sys

# Assume config is available
import config

def setup_logger(name: str):
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    
    # Check if handler is already added to prevent duplicates
    if not logger.handlers:
        # Formatter
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        
        # File Handler
        log_file = config.LOG_DIR / "pipeline.log"
        file_handler = logging.FileHandler(log_file)
        file_handler.setFormatter(formatter)
        
        # Console Handler
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setFormatter(formatter)
        
        logger.addHandler(file_handler)
        logger.addHandler(console_handler)
        
    return logger

def write_metadata(pipeline_name: str, step: str, records: int, duration: float, status: str, collections: dict = None):
    metadata_file = config.METADATA_DIR / "pipeline_runs.json"
    
    # Determine warning status
    if status == "SUCCESS" and records == 0 and step == "extract":
        status = "SUCCESS_WITH_WARNINGS"
        
    entry = {
        "runId": config.RUN_ID,
        "pipeline": pipeline_name,
        "pipelineVersion": config.PIPELINE_VERSION,
        "database": config.DATABASE_NAME,
        "step": step,
        "recordsProcessed": records,
        "durationSeconds": round(duration, 3),
        "completedAt": datetime.utcnow().isoformat() + "Z",
        "status": status
    }
    
    if collections:
        entry["collections"] = collections
        
    if status == "SUCCESS_WITH_WARNINGS":
        entry["warning"] = "No records extracted"
    
    # Read existing metadata
    metadata = []
    if metadata_file.exists():
        try:
            with open(metadata_file, "r") as f:
                metadata = json.load(f)
        except json.JSONDecodeError:
            pass
            
    metadata.append(entry)
    
    with open(metadata_file, "w") as f:
        json.dump(metadata, f, indent=2)

import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    raise RuntimeError("MONGO_URI is not configured in environment variables.")
    
DATABASE_NAME = os.getenv("DATABASE_NAME", "societysphere")
PIPELINE_VERSION = "1.0.0"
RUN_ID = None  # Will be set dynamically by main_pipeline.py

# Determine the project root directory
BASE_DIR = Path(__file__).parent.resolve()

# Directory definitions
RAW_DATA_DIR = BASE_DIR / "datasets" / "raw"
CLEAN_DATA_DIR = BASE_DIR / "datasets" / "clean"
PROCESSED_DATA_DIR = BASE_DIR / "datasets" / "processed"
TRAINING_DATA_DIR = BASE_DIR / "datasets" / "training"
VALIDATION_DATA_DIR = BASE_DIR / "datasets" / "validation"
TEST_DATA_DIR = BASE_DIR / "datasets" / "test"

REPORT_DIR = BASE_DIR / "reports"
PROFILING_DIR = REPORT_DIR / "profiling"
EVALUATION_DIR = REPORT_DIR / "evaluation"
CHART_DIR = BASE_DIR / "charts"
LOG_DIR = BASE_DIR / "logs"
METADATA_DIR = BASE_DIR / "metadata"
MODEL_DIR = BASE_DIR / "models"

# Create directories if they don't exist
for d in [RAW_DATA_DIR, CLEAN_DATA_DIR, PROCESSED_DATA_DIR, TRAINING_DATA_DIR, VALIDATION_DATA_DIR, TEST_DATA_DIR, REPORT_DIR, PROFILING_DIR, EVALUATION_DIR, CHART_DIR, LOG_DIR, METADATA_DIR, MODEL_DIR]:
    d.mkdir(parents=True, exist_ok=True)

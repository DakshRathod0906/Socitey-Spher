import os
import json
import pandas as pd
from pathlib import Path
import config
from api.core.exceptions import ResourceNotFoundException, DataProcessingException
from etl.utils import setup_logger

logger = setup_logger("DataService")

class DataService:
    @staticmethod
    def get_manifest() -> dict:
        manifest_path = config.REPORT_DIR / "manifest.json"
        if not manifest_path.exists():
            raise ResourceNotFoundException("Manifest file")
        try:
            with open(manifest_path, "r") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Failed to read manifest: {e}")
            raise DataProcessingException("Failed to read manifest file.")

    @staticmethod
    def get_dashboard_summary() -> dict:
        summary_path = config.REPORT_DIR / "dashboard_summary.json"
        if not summary_path.exists():
            raise ResourceNotFoundException("Dashboard summary JSON")
        try:
            with open(summary_path, "r") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Failed to read dashboard summary: {e}")
            raise DataProcessingException("Failed to read dashboard summary file.")

    @staticmethod
    def get_collection_data(collection_name: str) -> list[dict]:
        csv_path = config.PROCESSED_DATA_DIR / f"{collection_name}.csv"
        if not csv_path.exists():
            # Return empty list instead of 404 for empty/missing datasets 
            # to prevent server errors on fresh databases.
            return []
        try:
            df = pd.read_csv(csv_path)
            return df.fillna("").to_dict(orient="records")
        except pd.errors.EmptyDataError:
            return []
        except Exception as e:
            logger.error(f"Failed to read {collection_name} CSV: {e}")
            raise DataProcessingException(f"Failed to read {collection_name} data.")

    @staticmethod
    def get_chart_path(chart_name: str) -> Path:
        manifest = DataService.get_manifest()
        if chart_name not in manifest.get("charts", []):
            raise ResourceNotFoundException(f"Chart '{chart_name}'")
            
        chart_path = config.CHART_DIR / chart_name
        if not chart_path.exists():
            raise ResourceNotFoundException(f"Chart file '{chart_name}'")
            
        return chart_path

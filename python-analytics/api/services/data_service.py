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
    def get_pipeline_metadata() -> dict:
        pipeline_runs_path = config.METADATA_DIR / "pipeline_runs.json"
        if not pipeline_runs_path.exists():
            return {"status": "Unknown", "lastRun": "Unknown", "duration": 0.0, "recordsProcessed": 0, "version": "Unknown"}
        try:
            with open(pipeline_runs_path, "r") as f:
                runs = json.load(f)
            
            if not runs:
                return {"status": "Unknown", "lastRun": "Unknown", "duration": 0.0, "recordsProcessed": 0, "version": "Unknown"}
            
            # Find the last run sequence (all steps with the same runId)
            # The last element should be the 'load' step of the last run.
            # We can aggregate duration and get recordsProcessed from the load step.
            last_run_item = runs[-1]
            last_run_id = last_run_item.get("runId")
            if not last_run_id:
                # Fallback for old logs
                return {
                    "status": last_run_item.get("status", "Unknown"),
                    "lastRun": last_run_item.get("completedAt", "Unknown"),
                    "duration": last_run_item.get("durationSeconds", 0.0),
                    "recordsProcessed": last_run_item.get("recordsProcessed", 0),
                    "version": "1.0.0"
                }

            last_run_steps = [r for r in runs if r.get("runId") == last_run_id]
            total_duration = sum(step.get("durationSeconds", 0.0) for step in last_run_steps)
            
            return {
                "status": "SUCCESS" if all(step.get("status", "").startswith("SUCCESS") for step in last_run_steps) else "FAILED",
                "lastRun": last_run_steps[-1].get("completedAt", "Unknown"),
                "duration": round(total_duration, 2),
                "recordsProcessed": last_run_steps[0].get("recordsProcessed", 0),
                "version": last_run_steps[0].get("pipelineVersion", "1.0.0")
            }
        except Exception as e:
            logger.error(f"Failed to read pipeline metadata: {e}")
            return {"status": "Error", "lastRun": "Unknown", "duration": 0.0, "recordsProcessed": 0, "version": "Unknown"}

    @staticmethod
    def get_collection_data(collection_name: str) -> list[dict]:
        csv_path = config.PROCESSED_DATA_DIR / f"{collection_name}.csv"
        if not csv_path.exists():
            return []
        try:
            df = DataService.get_collection_df(collection_name)
            if df.empty:
                return []
            return df.fillna("").to_dict(orient="records")
        except Exception as e:
            logger.error(f"Failed to read {collection_name} CSV: {e}")
            raise DataProcessingException(f"Failed to read {collection_name} data.")

    @staticmethod
    def get_collection_df(collection_name: str) -> pd.DataFrame:
        csv_path = config.PROCESSED_DATA_DIR / f"{collection_name}.csv"
        if not csv_path.exists():
            return pd.DataFrame()
        try:
            return pd.read_csv(csv_path)
        except pd.errors.EmptyDataError:
            return pd.DataFrame()
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

import logging
import sys
import subprocess

logger = logging.getLogger(__name__)

def run_command(command):
    logger.info(f"Running: {command}")
    result = subprocess.run(command, shell=True)
    if result.returncode != 0:
        logger.error(f"Command failed with exit code {result.returncode}: {command}")
        sys.exit(result.returncode)

def run_pipeline():
    logger.info("=== Starting Full ML Training Pipeline ===")
    
    commands = [
        "python -m etl.profile",
        "python -m etl.build_training",
        "python -m training.train_complaint_resolution",
        "python -m training.train_complaint_priority",
        "python -m training.train_expense_forecast",
        "python -m training.train_visitor_forecast",
        "python -m training.build_registry"
    ]
    
    for cmd in commands:
        run_command(cmd)
        
    logger.info("=== ML Training Pipeline Completed Successfully ===")

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
    run_pipeline()

import json
import pandas as pd
import config
from etl.utils import setup_logger

logger = setup_logger("Exports")

def export_summaries(kpis: dict):
    logger.info("Exporting JSON and CSV summaries...")
    
    # Export JSON
    json_path = config.REPORT_DIR / "dashboard_summary.json"
    with open(json_path, "w") as f:
        json.dump(kpis, f, indent=2)
        
    # Export flattened CSV for dashboard metrics
    csv_path = config.REPORT_DIR / "dashboard_summary.csv"
    flat_kpis = []
    
    for category, metrics in kpis.items():
        for key, value in metrics.items():
            if isinstance(value, dict):
                for sub_key, sub_val in value.items():
                    flat_kpis.append({"Category": category, "Metric": f"{key}_{sub_key}", "Value": sub_val})
            else:
                flat_kpis.append({"Category": category, "Metric": key, "Value": value})
                
    if flat_kpis:
        df = pd.DataFrame(flat_kpis)
    else:
        df = pd.DataFrame(columns=["Category", "Metric", "Value"])
        
    df.to_csv(csv_path, index=False)
        
    # Generate Manifest
    manifest_path = config.REPORT_DIR / "manifest.json"
    
    chart_files = sorted(
        p.name for p in config.CHART_DIR.glob("*.png")
    )
    
    manifest = {
        "generatedAt": pd.Timestamp.utcnow().isoformat() + "Z",
        "reports": [
            "dashboard_summary.csv",
            "dashboard_summary.json"
        ],
        "charts": chart_files
    }
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)
        
    logger.info(f"Summaries and manifest exported to {config.REPORT_DIR}")

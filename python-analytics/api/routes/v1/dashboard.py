from fastapi import APIRouter
from api.schemas.dashboard import DashboardResponse, DashboardMetadata
from api.services.data_service import DataService
import config
import os
from datetime import datetime

router = APIRouter()

@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard():
    dashboard_data = DataService.get_dashboard_summary()
    manifest = DataService.get_manifest()
    
    # We can fetch the file modification time for last_updated
    summary_path = config.REPORT_DIR / "dashboard_summary.json"
    last_updated_ts = os.path.getmtime(summary_path)
    last_updated = datetime.fromtimestamp(last_updated_ts).isoformat() + "Z"
    
    metadata = DashboardMetadata(generated_at=manifest.get("generatedAt", last_updated))
    
    return DashboardResponse(
        metadata=metadata,
        kpis=dashboard_data,
        available_charts=manifest.get("charts", []),
        last_updated=last_updated
    )

from fastapi import APIRouter
from api.schemas.health import HealthResponse
from api.services.data_service import DataService

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
def get_health():
    try:
        manifest = DataService.get_manifest()
        
        # Determine pipeline last run from manifest generatedAt
        pipeline_last_run = manifest.get("generatedAt", "Unknown")
        manifest_version = "1.0.0" # Static for now
        
        reports_generated = len(manifest.get("reports", []))
        charts_generated = len(manifest.get("charts", []))
        
        return HealthResponse(
            status="ok",
            pipeline_last_run=pipeline_last_run,
            manifest_version=manifest_version,
            reports_generated=reports_generated,
            charts_generated=charts_generated
        )
    except Exception as e:
        return HealthResponse(
            status="error",
            pipeline_last_run="Unknown",
            manifest_version="Unknown",
            reports_generated=0,
            charts_generated=0
        )

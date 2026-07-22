from fastapi import APIRouter
from fastapi.responses import FileResponse
from api.services.data_service import DataService

router = APIRouter()

@router.get("/charts/{chart_name}")
def get_chart(chart_name: str):
    # DataService handles validation against manifest and file existence
    chart_path = DataService.get_chart_path(chart_name)
    return FileResponse(chart_path, media_type="image/png")

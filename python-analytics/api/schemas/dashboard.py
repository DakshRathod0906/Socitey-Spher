from pydantic import BaseModel
from typing import Any

class DashboardMetadata(BaseModel):
    generated_at: str

class DashboardResponse(BaseModel):
    metadata: DashboardMetadata
    kpis: dict[str, Any]
    available_charts: list[str]
    last_updated: str

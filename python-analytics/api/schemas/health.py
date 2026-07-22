from pydantic import BaseModel

class HealthResponse(BaseModel):
    status: str
    pipeline_last_run: str
    manifest_version: str
    reports_generated: int
    charts_generated: int

from pydantic import BaseModel
from typing import Any

class ComplaintAnalyticsResponse(BaseModel):
    total_records: int
    data: list[dict[str, Any]]

class ExpenseAnalyticsResponse(BaseModel):
    total_records: int
    data: list[dict[str, Any]]

class UserAnalyticsResponse(BaseModel):
    total_records: int
    data: list[dict[str, Any]]

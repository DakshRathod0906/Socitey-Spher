from pydantic import BaseModel
from typing import Any

class ComplaintSummaryResponse(BaseModel):
    statusDistribution: list[dict[str, Any]]
    categoryDistribution: list[dict[str, Any]]
    monthlyTrend: list[dict[str, Any]]

class ExpenseSummaryResponse(BaseModel):
    categoryDistribution: list[dict[str, Any]]
    monthlyTrend: list[dict[str, Any]]

class VisitorSummaryResponse(BaseModel):
    typeDistribution: list[dict[str, Any]]
    monthlyTrend: list[dict[str, Any]]

class VehicleSummaryResponse(BaseModel):
    typeDistribution: list[dict[str, Any]]
    statusDistribution: list[dict[str, Any]]

class UserSummaryResponse(BaseModel):
    roleDistribution: list[dict[str, Any]]

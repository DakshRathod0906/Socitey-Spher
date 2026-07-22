from fastapi import APIRouter
from api.schemas.domain import (
    ComplaintSummaryResponse,
    ExpenseSummaryResponse,
    VisitorSummaryResponse,
    VehicleSummaryResponse,
    UserSummaryResponse
)
from api.services.data_service import DataService

router = APIRouter()

def aggregate_distribution(df, column, key_name):
    if df.empty or column not in df.columns:
        return []
    counts = df[column].value_counts().reset_index()
    counts.columns = [key_name, "count"]
    return counts.to_dict(orient="records")

@router.get("/complaints/summary", response_model=ComplaintSummaryResponse)
def get_complaints_summary():
    df = DataService.get_collection_df("complaints")
    return ComplaintSummaryResponse(
        statusDistribution=aggregate_distribution(df, "status", "status"),
        categoryDistribution=aggregate_distribution(df, "category", "category"),
        monthlyTrend=aggregate_distribution(df, "created_month", "month")
    )

@router.get("/expenses/summary", response_model=ExpenseSummaryResponse)
def get_expenses_summary():
    df = DataService.get_collection_df("expenses")
    return ExpenseSummaryResponse(
        categoryDistribution=aggregate_distribution(df, "category", "category"),
        monthlyTrend=aggregate_distribution(df, "created_month", "month")
    )

@router.get("/visitors/summary", response_model=VisitorSummaryResponse)
def get_visitors_summary():
    df = DataService.get_collection_df("visitors")
    return VisitorSummaryResponse(
        typeDistribution=aggregate_distribution(df, "visitorType", "type"),
        monthlyTrend=aggregate_distribution(df, "created_month", "month")
    )

@router.get("/vehicles/summary", response_model=VehicleSummaryResponse)
def get_vehicles_summary():
    df = DataService.get_collection_df("vehicles")
    return VehicleSummaryResponse(
        typeDistribution=aggregate_distribution(df, "type", "type"),
        statusDistribution=aggregate_distribution(df, "status", "status")
    )

@router.get("/users/summary", response_model=UserSummaryResponse)
def get_users_summary():
    df = DataService.get_collection_df("users")
    return UserSummaryResponse(
        roleDistribution=aggregate_distribution(df, "role", "role")
    )

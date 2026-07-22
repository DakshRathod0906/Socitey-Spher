from fastapi import APIRouter
from api.schemas.domain import ComplaintAnalyticsResponse, ExpenseAnalyticsResponse, UserAnalyticsResponse
from api.services.data_service import DataService

router = APIRouter()

@router.get("/complaints", response_model=ComplaintAnalyticsResponse)
def get_complaints_data():
    data = DataService.get_collection_data("complaints")
    return ComplaintAnalyticsResponse(
        total_records=len(data),
        data=data
    )

@router.get("/expenses", response_model=ExpenseAnalyticsResponse)
def get_expenses_data():
    data = DataService.get_collection_data("expenses")
    return ExpenseAnalyticsResponse(
        total_records=len(data),
        data=data
    )

@router.get("/users", response_model=UserAnalyticsResponse)
def get_users_data():
    data = DataService.get_collection_data("users")
    return UserAnalyticsResponse(
        total_records=len(data),
        data=data
    )

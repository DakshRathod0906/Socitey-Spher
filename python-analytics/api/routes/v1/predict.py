from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from api.services.prediction_service import PredictionService
from api.services.model_loader import ModelLoader
router = APIRouter()

class ComplaintResolutionRequest(BaseModel):
    category: str
    priority: str

class ComplaintResolutionResponse(BaseModel):
    predicted_resolution_time_hours: float

class ComplaintPriorityRequest(BaseModel):
    category: str

class ComplaintPriorityResponse(BaseModel):
    predicted_priority: str

class ExpenseForecastRequest(BaseModel):
    prev_month_amount: float

class ExpenseForecastResponse(BaseModel):
    predicted_amount: float

class VisitorForecastRequest(BaseModel):
    prev_month_count: float

class VisitorForecastResponse(BaseModel):
    predicted_count: int

from typing import Dict, Any

class ModelRegistryResponse(BaseModel):
    models: Dict[str, Any]

@router.get("/models", response_model=ModelRegistryResponse)
def get_model_registry():
    try:
        registry = ModelLoader._registry
        if not registry:
            ModelLoader.load_registry()
            registry = ModelLoader._registry
        return ModelRegistryResponse(models=registry)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/complaint-resolution", response_model=ComplaintResolutionResponse)
def predict_complaint_resolution(req: ComplaintResolutionRequest):
    try:
        hours = PredictionService.predict_complaint_resolution(req.category, req.priority)
        return ComplaintResolutionResponse(predicted_resolution_time_hours=hours)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/complaint-priority", response_model=ComplaintPriorityResponse)
def predict_complaint_priority(req: ComplaintPriorityRequest):
    try:
        priority = PredictionService.predict_complaint_priority(req.category)
        return ComplaintPriorityResponse(predicted_priority=priority)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/expense-forecast", response_model=ExpenseForecastResponse)
def predict_expense_forecast(req: ExpenseForecastRequest):
    try:
        amount = PredictionService.forecast_expenses(req.prev_month_amount)
        return ExpenseForecastResponse(predicted_amount=amount)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/visitor-forecast", response_model=VisitorForecastResponse)
def predict_visitor_forecast(req: VisitorForecastRequest):
    try:
        count = PredictionService.forecast_visitors(req.prev_month_count)
        return VisitorForecastResponse(predicted_count=count)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

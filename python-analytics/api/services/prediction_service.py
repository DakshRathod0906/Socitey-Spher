import pandas as pd
from api.services.model_loader import ModelLoader

class PredictionService:
    @staticmethod
    def predict_complaint_resolution(category: str, priority: str):
        model = ModelLoader.get_model("complaint_resolution")
        df = pd.DataFrame([{ "category": category, "priority": priority }])
        pred = model.predict(df)[0]
        return max(0, float(pred)) # ensure no negative resolution time

    @staticmethod
    def predict_complaint_priority(category: str):
        model = ModelLoader.get_model("complaint_priority")
        df = pd.DataFrame([{ "category": category }])
        pred = model.predict(df)[0]
        return str(pred)

    @staticmethod
    def forecast_expenses(prev_month_amount: float):
        model = ModelLoader.get_model("expense_forecast")
        df = pd.DataFrame([{ "prev_month_amount": prev_month_amount }])
        pred = model.predict(df)[0]
        return max(0, float(pred))

    @staticmethod
    def forecast_visitors(prev_month_count: float):
        model = ModelLoader.get_model("visitor_forecast")
        df = pd.DataFrame([{ "prev_month_count": prev_month_count }])
        pred = model.predict(df)[0]
        return max(0, int(round(pred)))

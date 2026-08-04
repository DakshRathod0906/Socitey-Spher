import pandas as pd
from api.services.model_loader import ModelLoader

class PredictionService:
    @staticmethod
    def predict_complaint_resolution(category: str, priority: str):
        try:
            model = ModelLoader.get_model("complaint_resolution")
            df = pd.DataFrame([{ "category": category, "priority": priority }])
            pred = model.predict(df)[0]
            return max(1.0, float(pred))
        except Exception:
            # Domain rule fallback for resolution hours
            cat = str(category).upper()
            prio = str(priority).upper()

            base_hours = 24.0
            if "PLUMBING" in cat or "WATER" in cat:
                base_hours = 12.0
            elif "ELECTRICAL" in cat or "POWER" in cat:
                base_hours = 16.0
            elif "CLEANING" in cat or "GARBAGE" in cat:
                base_hours = 8.0
            elif "SECURITY" in cat:
                base_hours = 6.0
            elif "LIFT" in cat or "ELEVATOR" in cat:
                base_hours = 10.0

            if prio == "HIGH":
                base_hours *= 0.6
            elif prio == "LOW":
                base_hours *= 1.5

            return round(base_hours, 1)

    @staticmethod
    def predict_complaint_priority(category: str):
        try:
            model = ModelLoader.get_model("complaint_priority")
            df = pd.DataFrame([{ "category": category }])
            pred = model.predict(df)[0]
            return str(pred)
        except Exception:
            cat = str(category).upper()
            if any(k in cat for k in ["SECURITY", "FIRE", "ELECTRICAL", "LIFT", "LEAKAGE"]):
                return "HIGH"
            elif any(k in cat for k in ["CLEANING", "MAINTENANCE", "PARKING", "PLUMBING"]):
                return "MEDIUM"
            return "LOW"

    @staticmethod
    def forecast_expenses(prev_month_amount: float):
        try:
            model = ModelLoader.get_model("expense_forecast")
            df = pd.DataFrame([{ "prev_month_amount": prev_month_amount }])
            pred = model.predict(df)[0]
            return max(0.0, float(pred))
        except Exception:
            base = max(prev_month_amount, 10000.0)
            return round(base * 1.035, 2)

    @staticmethod
    def forecast_visitors(prev_month_count: float):
        try:
            model = ModelLoader.get_model("visitor_forecast")
            df = pd.DataFrame([{ "prev_month_count": prev_month_count }])
            pred = model.predict(df)[0]
            return max(0, int(round(pred)))
        except Exception:
            base = max(prev_month_count, 15.0)
            return max(1, int(round(base * 1.05)))

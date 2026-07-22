import pandas as pd
from etl.utils import setup_logger

logger = setup_logger("Summary")

def generate_kpis(dataframes: dict) -> dict:
    logger.info("Generating Summary KPIs...")
    
    kpis = {
        "complaints": {},
        "billing": {},
        "visitors": {},
        "users": {}
    }
    
    # Complaints KPIs
    if "complaints" in dataframes and not dataframes["complaints"].empty:
        df = dataframes["complaints"]
        kpis["complaints"]["total"] = len(df)
        if 'is_open' in df.columns:
            kpis["complaints"]["open_count"] = int(df['is_open'].sum())
            kpis["complaints"]["closed_count"] = len(df) - kpis["complaints"]["open_count"]
            
    # Billing/Expenses KPIs
    if "expenses" in dataframes and not dataframes["expenses"].empty:
        df = dataframes["expenses"]
        kpis["billing"]["total_transactions"] = len(df)
        if 'amount' in df.columns:
            kpis["billing"]["total_amount"] = float(df['amount'].sum())
            
    # Visitors
    if "visitors" in dataframes and not dataframes["visitors"].empty:
        kpis["visitors"]["total"] = len(dataframes["visitors"])
        
    # Users
    if "users" in dataframes and not dataframes["users"].empty:
        df = dataframes["users"]
        kpis["users"]["total"] = len(df)
        if 'role' in df.columns:
            roles = df['role'].value_counts().to_dict()
            kpis["users"]["by_role"] = {str(k): int(v) for k, v in roles.items()}
            
    logger.info("KPI generation complete.")
    return kpis

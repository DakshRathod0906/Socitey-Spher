import pandas as pd
import logging
import config
from etl.split_dataset import split_and_save

logger = logging.getLogger(__name__)

def build_complaints_dataset():
    file_path = config.PROCESSED_DATA_DIR / "complaints.csv"
    if not file_path.exists():
        logger.warning("Complaints data not found.")
        return

    df = pd.read_csv(file_path)
    
    # Feature Engineering for ML
    
    # Target 1: Resolution Time
    if 'resolution_time_hours' in df.columns:
        resolved_df = df[df['status'].str.upper().isin(['RESOLVED', 'CLOSED'])].copy()
        if not resolved_df.empty:
            if 'priority' not in resolved_df.columns or resolved_df['priority'].isnull().all():
                resolved_df['priority'] = 'MEDIUM'
                
            features = ['_id', 'category', 'priority', 'status', 'resolution_time_hours']
            training_df = resolved_df[features]
            split_and_save(training_df, target_col='resolution_time_hours', collection_name='complaints_resolution')
            
    # Target 2: Priority (Classification)
    if 'priority' not in df.columns or df['priority'].isnull().all():
        def map_priority(cat):
            if pd.isna(cat): return 'MEDIUM'
            c = str(cat).upper()
            if 'PLUMBING' in c or 'ELECTRICAL' in c or 'SECURITY' in c:
                return 'HIGH'
            elif 'CLEANING' in c or 'MAINTENANCE' in c:
                return 'MEDIUM'
            return 'LOW'
            
        df['priority'] = df['category'].apply(map_priority)
        
    split_and_save(df, target_col='priority', collection_name='complaints_priority')

def build_expenses_dataset():
    file_path = config.PROCESSED_DATA_DIR / "expenses.csv"
    if not file_path.exists():
        logger.warning("Expenses data not found.")
        return
        
    df = pd.read_csv(file_path)
    
    if 'expenseDate' in df.columns and 'amount' in df.columns:
        df['expense_month'] = pd.to_datetime(df['expenseDate'], errors='coerce', utc=True).dt.to_period('M')
        monthly_df = df.groupby('expense_month')['amount'].sum().reset_index()
        monthly_df['expense_month'] = monthly_df['expense_month'].dt.to_timestamp()
        monthly_df = monthly_df.sort_values('expense_month')
        
        monthly_df['month'] = monthly_df['expense_month'].dt.month
        monthly_df['year'] = monthly_df['expense_month'].dt.year
        monthly_df['prev_month_amount'] = monthly_df['amount'].shift(1)
        monthly_df = monthly_df.dropna().drop(columns=['expense_month'])
        
        split_and_save(monthly_df, target_col='amount', collection_name='expenses_forecast', test_size=0.2, val_size=0.1)

def build_visitors_dataset():
    file_path = config.PROCESSED_DATA_DIR / "visits.csv"
    if not file_path.exists():
        logger.warning("Visits data not found.")
        return
        
    df = pd.read_csv(file_path)
    
    if 'expectedArrival' in df.columns:
        df['visit_month'] = pd.to_datetime(df['expectedArrival'], errors='coerce', utc=True).dt.to_period('M')
        monthly_df = df.groupby('visit_month').size().reset_index(name='visitor_count')
        monthly_df['visit_month'] = monthly_df['visit_month'].dt.to_timestamp()
        monthly_df = monthly_df.sort_values('visit_month')
        
        monthly_df['month'] = monthly_df['visit_month'].dt.month
        monthly_df['year'] = monthly_df['visit_month'].dt.year
        monthly_df['prev_month_count'] = monthly_df['visitor_count'].shift(1)
        monthly_df = monthly_df.dropna().drop(columns=['visit_month'])
        
        split_and_save(monthly_df, target_col='visitor_count', collection_name='visitors_forecast', test_size=0.2, val_size=0.1)

def run_build_training():
    logger.info("Starting ML Dataset Builder Phase")
    build_complaints_dataset()
    build_expenses_dataset()
    build_visitors_dataset()
    logger.info("ML Dataset Builder Phase Completed")

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    run_build_training()

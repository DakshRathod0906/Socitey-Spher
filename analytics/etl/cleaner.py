import os
import pandas as pd
import numpy as np

def clean_data(extracted_data):
    """
    Takes dictionary of raw extracted collections, converts to Pandas DataFrames,
    cleans, standardizes, and engineers derived features.
    """
    cleaned_dfs = {}
    
    for col_name, data in extracted_data.items():
        if not data:
            # Create empty DF if no data
            cleaned_dfs[col_name] = pd.DataFrame()
            continue
            
        df = pd.DataFrame(data)
        
        # Generic Cleaning
        if "createdAt" in df.columns:
            df["createdAt"] = pd.to_datetime(df["createdAt"], errors="coerce")
        if "updatedAt" in df.columns:
            df["updatedAt"] = pd.to_datetime(df["updatedAt"], errors="coerce")
            
        # Collection Specific Cleaning
        if col_name == "complaints":
            df = _clean_complaints(df)
        elif col_name == "bills":
            df = _clean_bills(df)
        elif col_name == "payments":
            df = _clean_payments(df)
        elif col_name == "visitors":
            df = _clean_visitors(df)
        elif col_name == "bookings":
            df = _clean_bookings(df)
            
        cleaned_dfs[col_name] = df
        
    return cleaned_dfs

def _clean_complaints(df):
    if "resolvedAt" in df.columns:
        df["resolvedAt"] = pd.to_datetime(df["resolvedAt"], errors="coerce")
        # Feature Engineering: Resolution time in hours
        df["resolution_time_hours"] = (df["resolvedAt"] - df["createdAt"]).dt.total_seconds() / 3600.0
    return df

def _clean_bills(df):
    df["amountPaid"] = df.get("amountPaid", 0).fillna(0)
    df["totalAmount"] = df.get("totalAmount", 0).fillna(0)
    df["lateFee"] = df.get("lateFee", 0).fillna(0)
    
    if "dueDate" in df.columns:
        df["dueDate"] = pd.to_datetime(df["dueDate"], errors="coerce")
    if "issueDate" in df.columns:
        df["issueDate"] = pd.to_datetime(df["issueDate"], errors="coerce")
        
    # Feature Engineering
    df["overdue_amount"] = df["totalAmount"] - df["amountPaid"]
    df["is_fully_paid"] = df["overdue_amount"] <= 0
    return df

def _clean_payments(df):
    if "paymentDate" in df.columns:
        df["paymentDate"] = pd.to_datetime(df["paymentDate"], errors="coerce")
    df["amount"] = df.get("amount", 0).fillna(0)
    return df

def _clean_visitors(df):
    if "checkInTime" in df.columns:
        df["checkInTime"] = pd.to_datetime(df["checkInTime"], errors="coerce")
    if "checkOutTime" in df.columns:
        df["checkOutTime"] = pd.to_datetime(df["checkOutTime"], errors="coerce")
        
    # Feature Engineering
    if "checkInTime" in df.columns and "checkOutTime" in df.columns:
        df["visit_duration_hours"] = (df["checkOutTime"] - df["checkInTime"]).dt.total_seconds() / 3600.0
    return df

def _clean_bookings(df):
    if "bookingDate" in df.columns:
        df["bookingDate"] = pd.to_datetime(df["bookingDate"], errors="coerce")
    return df

def save_to_parquet(cleaned_dfs, output_dir):
    """
    Saves cleaned DataFrames to .parquet files for fast retrieval.
    """
    os.makedirs(output_dir, exist_ok=True)
    
    for col_name, df in cleaned_dfs.items():
        output_path = os.path.join(output_dir, f"{col_name}.parquet")
        # Ensure all columns are string names
        df.columns = df.columns.astype(str)
        # Drop complex object columns (like dicts/lists) before saving to parquet
        for col in df.columns:
            if df[col].apply(type).eq(dict).any() or df[col].apply(type).eq(list).any():
                df = df.drop(columns=[col])
        df.to_parquet(output_path, engine="pyarrow", index=False)

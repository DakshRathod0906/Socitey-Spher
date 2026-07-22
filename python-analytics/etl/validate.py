import time
import pandas as pd
import config
from etl.utils import setup_logger, write_metadata

logger = setup_logger("Validate")

def validate_dataframe(df: pd.DataFrame, collection_name: str, rules: dict):
    logger.info(f"Validating {collection_name}...")
    errors = []
    
    if df.empty:
        logger.warning(f"Collection {collection_name} is empty.")
        return True, errors
        
    # Check required columns
    required_columns = rules.get('required', [])
    missing_cols = [col for col in required_columns if col not in df.columns]
    if missing_cols:
        errors.append(f"Missing required columns: {missing_cols}")
        
    # Check duplicate _id
    if '_id' in df.columns:
        duplicates = df['_id'].duplicated().sum()
        if duplicates > 0:
            errors.append(f"Found {duplicates} duplicate _id values")
            
        # Check invalid ObjectId format (24 hex characters)
        invalid_ids = df[~df['_id'].astype(str).str.match(r'^[0-9a-fA-F]{24}$', na=False)]
        if not invalid_ids.empty:
            errors.append(f"Found {len(invalid_ids)} invalid ObjectId formats in _id")
            
    # Check required dates
    required_dates = rules.get('dates', [])
    for date_col in required_dates:
        if date_col in df.columns:
            null_dates = df[date_col].isna().sum()
            if null_dates > 0:
                errors.append(f"Found {null_dates} null timestamps in required date field {date_col}")
            # Check impossible dates (e.g., year > 2100)
            parsed_dates = pd.to_datetime(df[date_col], errors='coerce')
            future_dates = (parsed_dates.dt.year > 2100).sum()
            if future_dates > 0:
                errors.append(f"Found {future_dates} impossible future dates in {date_col}")

    # Check enums
    enums = rules.get('enums', {})
    for enum_col, allowed_values in enums.items():
        if enum_col in df.columns:
            # Normalize enum strings before comparison
            if df[enum_col].dtype == 'object':
                normalized_col = df[enum_col].astype(str).str.lower().str.strip()
            else:
                normalized_col = df[enum_col]
            invalid_enums = df[~normalized_col.isin(allowed_values) & df[enum_col].notna()]
            if not invalid_enums.empty:
                errors.append(f"Found {len(invalid_enums)} invalid values in enum field {enum_col}")
                
    if errors:
        for err in errors:
            logger.error(f"Validation error in {collection_name}: {err}")
        return False, errors
        
    logger.info(f"Collection {collection_name} passed validation.")
    return True, errors

def run_validation(dataframes: dict):
    logger.info("Starting validation process...")
    start_time = time.time()
    
    # Define required columns and rules for each collection
    validation_rules = {
        "users": {
            "required": ["_id", "name", "email", "role"],
            "dates": ["createdAt"],
            "enums": {
                "role": ["super_admin", "society_admin", "resident", "security", "service_staff"]
            }
        },
        "complaints": {
            "required": ["_id", "title", "description", "status"],
            "dates": ["createdAt", "updatedAt"],
            "enums": {
                "status": ["open", "assigned", "in_progress", "resolved", "closed", "reopen_requested", "cancelled", "rejected"]
            }
        },
        "expenses": {
            "required": ["_id", "title", "amount", "status", "category"],
            "dates": ["createdAt", "expenseDate"],
            "enums": {
                "status": ["pending", "approved", "rejected"],
                "category": ["maintenance", "utilities", "salary", "security", "event", "administration", "repair", "other"]
            }
        },
        "notices": {
            "required": ["_id", "title", "content"],
            "dates": ["createdAt"]
        },
        "visitors": {
            "required": ["_id", "name", "visitorType"],
            "dates": ["createdAt"],
            "enums": {
                "visitorType": ["guest", "delivery", "cab", "service_provider", "maintenance", "emergency", "other"]
            }
        },
        "vehicles": {
            "required": ["_id", "type", "licensePlate"],
            "dates": ["createdAt"],
            "enums": {
                "status": ["active", "inactive", "archived"],
                "type": ["two_wheeler", "four_wheeler", "bicycle", "ev_two_wheeler", "ev_four_wheeler", "other"]
            }
        }
    }
    
    all_passed = True
    total_records = sum(len(df) for df in dataframes.values())
    
    for coll, df in dataframes.items():
        rules = validation_rules.get(coll, {"required": ["_id"]})
        passed, errors = validate_dataframe(df, coll, rules)
        if not passed:
            all_passed = False
            
    duration = time.time() - start_time
    
    if all_passed:
        write_metadata("Sprint10_ETL", "validate", total_records, duration, "SUCCESS")
        logger.info(f"Validation completed successfully in {duration:.2f} seconds.")
    else:
        write_metadata("Sprint10_ETL", "validate", total_records, duration, "FAILED")
        raise ValueError("Data validation failed. Check logs for details.")
        
    return dataframes

import pandas as pd
from sklearn.model_selection import train_test_split
import config
import logging
import os

logger = logging.getLogger(__name__)

def split_and_save(df: pd.DataFrame, target_col: str, collection_name: str, test_size=0.2, val_size=0.1):
    """
    Splits dataframe into train, validation, and test sets and saves them.
    """
    if df.empty or target_col not in df.columns:
        logger.warning(f"Cannot split {collection_name}: empty df or missing target column {target_col}")
        return

    # Handle missing targets (drop rows where target is missing)
    df = df.dropna(subset=[target_col])
    if df.empty:
        logger.warning(f"No valid rows after dropping missing targets for {collection_name}")
        return

    # First split: train+val and test
    train_val, test = train_test_split(df, test_size=test_size, random_state=42)
    
    # Second split: train and val
    # calculate the proportion of val in the remaining dataset
    val_prop = val_size / (1 - test_size)
    train, val = train_test_split(train_val, test_size=val_prop, random_state=42)
    
    # Save datasets
    train.to_csv(config.TRAINING_DATA_DIR / f"{collection_name}_training.csv", index=False)
    val.to_csv(config.VALIDATION_DATA_DIR / f"{collection_name}_validation.csv", index=False)
    test.to_csv(config.TEST_DATA_DIR / f"{collection_name}_test.csv", index=False)
    
    logger.info(f"Split {collection_name}: {len(train)} train, {len(val)} val, {len(test)} test")
    
    return train, val, test

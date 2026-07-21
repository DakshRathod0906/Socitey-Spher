from django.core.management.base import BaseCommand
import os
import time
from etl.extractor import extract_all
from etl.cleaner import clean_data, save_to_parquet
from django.conf import settings

class Command(BaseCommand):
    help = 'Runs the ETL pipeline to extract data from MongoDB, clean it with Pandas, and save to Parquet.'

    def handle(self, *args, **kwargs):
        start_time = time.time()
        self.stdout.write("Starting ETL Pipeline...")
        
        # 1. Extract
        self.stdout.write("Extracting from MongoDB...")
        try:
            raw_data = extract_all()
            for col, data in raw_data.items():
                self.stdout.write(f"  - Extracted {len(data)} records from {col}")
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Extraction Failed: {e}"))
            return
            
        # 2. Transform & Clean
        self.stdout.write("Cleaning data with Pandas...")
        try:
            cleaned_dfs = clean_data(raw_data)
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Data Cleaning Failed: {e}"))
            return
            
        # 3. Load / Export
        self.stdout.write("Saving to Parquet...")
        output_dir = os.path.join(settings.BASE_DIR, 'data', 'processed')
        try:
            save_to_parquet(cleaned_dfs, output_dir)
            self.stdout.write(self.style.SUCCESS(f"Saved Parquet files to {output_dir}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Saving Parquet Failed: {e}"))
            return
            
        elapsed = time.time() - start_time
        self.stdout.write(self.style.SUCCESS(f"ETL Pipeline completed successfully in {elapsed:.2f} seconds."))

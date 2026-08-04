import pandas as pd
import numpy as np
import random
from pathlib import Path
from datetime import datetime, timedelta

processed_dir = Path(r"d:\Socitey-Spher\python-analytics\datasets\processed")
processed_dir.mkdir(parents=True, exist_ok=True)

# 1. Generate Complaints dataset (100 rows)
random.seed(42)
np.random.seed(42)

categories = ["PLUMBING", "ELECTRICAL", "LIFT", "CLEANING", "SECURITY", "PARKING", "GARDENING", "MAINTENANCE"]
priorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
statuses = ["RESOLVED", "CLOSED", "IN_PROGRESS", "OPEN"]

complaints_data = []
for i in range(1, 101):
    cat = random.choice(categories)
    if cat in ["PLUMBING", "ELECTRICAL", "SECURITY", "LIFT"]:
        prio = random.choice(["HIGH", "CRITICAL"])
        res_time = round(random.uniform(2.0, 18.0), 2)
    elif cat in ["CLEANING", "MAINTENANCE"]:
        prio = random.choice(["MEDIUM", "HIGH"])
        res_time = round(random.uniform(12.0, 36.0), 2)
    else:
        prio = random.choice(["LOW", "MEDIUM"])
        res_time = round(random.uniform(24.0, 72.0), 2)

    status = random.choice(statuses)
    complaints_data.append({
        "_id": f"cmp_{i:04d}",
        "title": f"Issue with {cat.lower()} in block {random.choice(['A', 'B', 'C'])}",
        "category": cat,
        "priority": prio,
        "status": status,
        "resolution_time_hours": res_time if status in ["RESOLVED", "CLOSED"] else np.nan,
        "createdAt": (datetime.now() - timedelta(days=random.randint(1, 90))).isoformat()
    })

df_complaints = pd.DataFrame(complaints_data)
df_complaints.to_csv(processed_dir / "complaints.csv", index=False)
print(f"Generated {len(df_complaints)} rows for complaints.csv")

# 2. Generate Expenses dataset (24 months of monthly historical expenses)
expense_categories = ["MAINTENANCE", "UTILITIES", "SALARY", "SECURITY", "REPAIR"]
expenses_data = []
base_date = datetime(2024, 1, 1)

for month_idx in range(24):
    current_month_date = base_date + timedelta(days=month_idx * 30)
    for cat in expense_categories:
        base_amt = {"MAINTENANCE": 4000, "UTILITIES": 6500, "SALARY": 12000, "SECURITY": 8000, "REPAIR": 2500}[cat]
        num_entries = random.randint(3, 6)
        for _ in range(num_entries):
            amt = base_amt + random.randint(-500, 1500)
            entry_date = current_month_date + timedelta(days=random.randint(1, 25))
            expenses_data.append({
                "_id": f"exp_{len(expenses_data)+1:04d}",
                "title": f"{cat} bill/payment",
                "category": cat,
                "amount": amt,
                "expenseDate": entry_date.isoformat(),
                "status": "APPROVED"
            })

df_expenses = pd.DataFrame(expenses_data)
df_expenses.to_csv(processed_dir / "expenses.csv", index=False)
print(f"Generated {len(df_expenses)} rows for expenses.csv")

# 3. Generate Visitors / Visits dataset (180 days of visit entries)
visit_types = ["GUEST", "DELIVERY", "CAB", "SERVICE_PROVIDER"]
visits_data = []

start_visit_date = datetime(2025, 6, 1)
for day in range(180):
    date_curr = start_visit_date + timedelta(days=day)
    # Generate 5-20 visits per day
    num_visits_today = random.randint(5, 20)
    for v in range(num_visits_today):
        visits_data.append({
            "_id": f"vis_{len(visits_data)+1:05d}",
            "visitorName": f"Visitor {len(visits_data)+1}",
            "visitorType": random.choice(visit_types),
            "expectedArrival": (date_curr + timedelta(hours=random.randint(8, 20))).isoformat(),
            "status": "APPROVED"
        })

df_visits = pd.DataFrame(visits_data)
df_visits.to_csv(processed_dir / "visits.csv", index=False)
print(f"Generated {len(df_visits)} rows for visits.csv")

print("Sample dataset generation complete!")

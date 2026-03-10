import pandas as pd
import math
from supabase import create_client, Client
import os

url = "https://zidvplwggyfmwvtffxyv.supabase.co"
# Use the anon key for now since we haven't locked down RLS
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppZHZwbHdnZ3lmbXd2dGZmeHl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTQ2NjEsImV4cCI6MjA4ODYzMDY2MX0.3moS4iITdmU54xTRn9gavaoBERp08IM6kkkgU7GEs8o"
supabase: Client = create_client(url, key)

base_dir = "../churchDB"

# Mapping between CSV files and Supabase tables
tables_map = {
    "EffectiveChurch - Members.csv": "members",
    "EffectiveChurch - Visitors.csv": "visitors",
    "EffectiveChurch - Staff.csv": "staff",
    "EffectiveChurch - Groups.csv": "groups",
    "EffectiveChurch - Donations.csv": "donations",
    "EffectiveChurch - Activities.csv": "activities",
    "EffectiveChurch - Announcements.csv": "announcements",
    "EffectiveChurch - AttendanceRecords.csv": "attendance_records",
    "EffectiveChurch - PrayerRequests.csv": "prayer_requests",
    "EffectiveChurch - Tasks.csv": "tasks",
    "EffectiveChurch - TrainingPrograms.csv": "training_programs",
    "EffectiveChurch - Transactions.csv": "transactions"
}

def clean_data(df):
    """
    Cleans DataFrame:
    1. Replaces standard NaN strings with None
    2. Drops identical duplicate rows based on ID
    """
    df = df.where(pd.notnull(df), None)
    
    # Handle date conversions if needed (Supabase is strict on dates)
    for col in df.columns:
        if df[col].dtype == 'object':
            # specifically for attendance records, "Sunday, 25-01-2026"
            if col == 'date' and any(df[col].astype(str).str.contains(r', \d{2}-\d{2}-\d{4}')):
                 df[col] = df[col].astype(str).str.extract(r'(\d{2}-\d{2}-\d{4})')
                 df[col] = pd.to_datetime(df[col], format="%d-%m-%Y").dt.strftime('%Y-%m-%d')
            # specifically for members sheet '8-Jun-87' formats
            elif col in ['birthday', 'baptism'] and any(df[col].astype(str).str.contains(r'^\d{1,2}-[A-Za-z]{3}-\d{2}$')):
                try:
                    df[col] = pd.to_datetime(df[col], format="%d-%b-%y").dt.strftime('%Y-%m-%d')
                except:
                    pass
    
    # Replace math.nan explicitly with None
    return [{k: v for k, v in record.items() if not (isinstance(v, float) and math.isnan(v)) and v is not None} for record in df.to_dict(orient="records")]
    

for file_name, table_name in tables_map.items():
    file_path = os.path.join(base_dir, file_name)
    if not os.path.exists(file_path):
        print(f"Skipping {file_name}: File not found.")
        continue
    
    print(f"Loading {file_name} into table '{table_name}'...")
    try:
        df = pd.read_csv(file_path)
        records = clean_data(df)
        
        if not records:
            print(f"Skipping {file_name}: Empty data.")
            continue
            
        # Bulk Insert
        data, count = supabase.table(table_name).upsert(records).execute()
        print(f"Successfully inserted {len(records)} records into {table_name}")
    except Exception as e:
        print(f"Failed to process {file_name}. Error: {e}")

print("Seeding complete.")

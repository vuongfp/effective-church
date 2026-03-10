"""
import_churchdb.py - Import all churchDB CSV files into Supabase via service role
Uses the Supabase REST API (service role) to bypass any publishable-key restrictions.
"""
import csv
import json
import os
import sys
import urllib.request
import urllib.error

# ─── Config ──────────────────────────────────────────────────────────────────
SUPABASE_URL = "https://zidvplwggyfmwvtffxyv.supabase.co"

# Read from env or hardcode anon key (RLS is OFF so anon key can insert)
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
if not SUPABASE_KEY:
    # Fallback: read .env.local
    env_path = os.path.join(os.path.dirname(__file__), "..", ".env.local")
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line.startswith("NEXT_PUBLIC_SUPABASE_ANON_KEY="):
                    SUPABASE_KEY = line.split("=", 1)[1]

CSV_DIR = os.path.join(os.path.dirname(__file__), "..", "churchDB")

TABLES = [
    ("members",            "EffectiveChurch - Members.csv"),
    ("visitors",           "EffectiveChurch - Visitors.csv"),
    ("staff",              "EffectiveChurch - Staff.csv"),
    ("groups",             "EffectiveChurch - Groups.csv"),
    ("activities",         "EffectiveChurch - Activities.csv"),
    ("attendance_records", "EffectiveChurch - AttendanceRecords.csv"),
    ("tasks",              "EffectiveChurch - Tasks.csv"),
    ("announcements",      "EffectiveChurch - Announcements.csv"),
    ("donations",          "EffectiveChurch - Donations.csv"),
    ("prayer_requests",    "EffectiveChurch - PrayerRequests.csv"),
    ("transactions",       "EffectiveChurch - Transactions.csv"),
    ("training_programs",  "EffectiveChurch - TrainingPrograms.csv"),
]


def clean_value(v):
    v = v.strip()
    if v == "":
        return None
    if v.upper() == "TRUE":
        return True
    if v.upper() == "FALSE":
        return False
    return v


def read_csv(filepath):
    rows = []
    with open(filepath, encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            cleaned = {k.strip(): clean_value(v) for k, v in row.items()}
            rows.append(cleaned)
    return rows


def upsert_batch(table, batch):
    url = f"{SUPABASE_URL}/rest/v1/{table}?on_conflict=id"
    data = json.dumps(batch).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        method="POST",
        headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates",
        },
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return True, None
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        return False, f"HTTP {e.code}: {body[:200]}"


def import_table(table, csv_file):
    filepath = os.path.join(CSV_DIR, csv_file)
    if not os.path.exists(filepath):
        print(f"  ⚠️  File not found: {csv_file}")
        return

    rows = read_csv(filepath)
    if not rows:
        print(f"  ⚠️  No rows in {csv_file}")
        return

    print(f"\n📦 [{table}] {len(rows)} rows found...")

    BATCH = 50
    inserted = 0
    errors = 0
    for i in range(0, len(rows), BATCH):
        batch = rows[i:i + BATCH]
        ok, err = upsert_batch(table, batch)
        if ok:
            inserted += len(batch)
            print(f"  ✅ {inserted}/{len(rows)}", end="\r")
        else:
            errors += 1
            print(f"\n  ❌ Batch {i//BATCH+1} error: {err}")

    if errors == 0:
        print(f"  ✅ Done! {inserted}/{len(rows)} rows into [{table}]")
    else:
        print(f"  ⚠️  {inserted}/{len(rows)} rows with {errors} batch errors in [{table}]")


def get_count(table):
    url = f"{SUPABASE_URL}/rest/v1/{table}?select=id"
    req = urllib.request.Request(
        url,
        headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Prefer": "count=exact",
            "Range": "0-0",
        },
    )
    try:
        with urllib.request.urlopen(req) as resp:
            cr = resp.headers.get("Content-Range", "*/0")
            return cr.split("/")[-1]
    except Exception:
        return "?"


def main():
    print("🚀 ChurchDB Import (Python — Sequential)\n")
    print(f"   Supabase URL : {SUPABASE_URL}")
    print(f"   Key prefix   : {SUPABASE_KEY[:20]}...\n")

    for table, csv_file in TABLES:
        try:
            import_table(table, csv_file)
        except Exception as e:
            print(f"  ❌ Unexpected error for [{table}]: {e}")

    print("\n\n📊 Final row counts:")
    for table, _ in TABLES:
        print(f"   {table:25s}: {get_count(table)}")

    print("\n🎉 Import complete!")


if __name__ == "__main__":
    main()

"""
import_members_fixed.py - Import all churchDB data with proper date handling
"""
import csv, urllib.request, json, re, sys, os

sys.stdout.reconfigure(encoding='utf-8')

SUPABASE_URL = "https://zidvplwggyfmwvtffxyv.supabase.co"
KEY = "sb_publishable_GW-jcJ04iO4PEoP7DQBAAw_-YpLV-rM"

CSV_DIR = os.path.join(os.path.dirname(__file__), "..", "churchDB")

# Date fields per table that may need normalization
DATE_FIELDS = {
    "attendance_records": ["date"],
    "activities": ["due_date"],
    "tasks": ["due_date"],
    "training_programs": ["start_date", "end_date"],
    "prayer_requests": ["request_date"],
    "donations": [],
    "transactions": ["date"],
}


MONTH_MAP = {
    "jan": "01", "feb": "02", "mar": "03", "apr": "04",
    "may": "05", "jun": "06", "jul": "07", "aug": "08",
    "sep": "09", "oct": "10", "nov": "11", "dec": "12",
}


def norm_date(v):
    """Normalize various date formats to ISO yyyy-mm-dd."""
    if not v or not v.strip():
        return None
    v = v.strip()

    # Already ISO yyyy-mm-dd — return as-is
    if re.match(r"^\d{4}-\d{2}-\d{2}$", v):
        return v

    # dd-Mon-yy or dd-Mon-yyyy (e.g. '14-Mar-88', '22-Jul-2003')
    m = re.match(r"^(\d{1,2})-([A-Za-z]{3})-(\d{2,4})$", v)
    if m:
        day = m.group(1).zfill(2)
        month = MONTH_MAP.get(m.group(2).lower())
        year_raw = m.group(3)
        if month:
            if len(year_raw) == 2:
                yr = int(year_raw)
                year = f"19{year_raw}" if yr >= 24 else f"20{year_raw}"
            else:
                year = year_raw
            return f"{year}-{month}-{day}"

    # dd-mm-yyyy with optional weekday prefix (e.g. 'Sunday, 21-07-2024')
    m = re.search(r"(\d{2})-(\d{2})-(\d{4})", v)
    if m:
        return f"{m.group(3)}-{m.group(2)}-{m.group(1)}"

    return None


ALL_DATE_KEYS = {
    "birthday", "baptism", "member_since", "first_visit_date", "last_visit_date",
    "created_date", "published_date", "due_date", "start_date", "end_date",
    "request_date", "date",
}


def clean(key, table, v):
    v = v.strip() if isinstance(v, str) else v
    if not v:
        return None
    sv = str(v).upper()
    # Date columns: normalize, and treat TRUE/FALSE as null
    if key in ALL_DATE_KEYS or (table in DATE_FIELDS and key in DATE_FIELDS[table]):
        if sv in ("TRUE", "FALSE", "YES", "NO"):
            return None
        return norm_date(str(v))
    # Boolean columns
    if sv == "TRUE":
        return True
    if sv == "FALSE":
        return False
    return v


def read_csv(table, filepath):
    rows = []
    with open(filepath, encoding="utf-8-sig", newline="") as f:
        for row in csv.DictReader(f):
            cleaned = {k.strip(): clean(k.strip(), table, v) for k, v in row.items()}
            rows.append(cleaned)
    return rows


def upsert(table, batch):
    url = SUPABASE_URL + f"/rest/v1/{table}?on_conflict=id"
    req = urllib.request.Request(
        url, data=json.dumps(batch).encode(), method="POST",
        headers={
            "apikey": KEY, "Authorization": f"Bearer {KEY}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates",
        }
    )
    try:
        with urllib.request.urlopen(req) as r:
            return True, r.status
    except urllib.error.HTTPError as e:
        return False, e.read().decode()[:400]


def get_count(table):
    url = SUPABASE_URL + f"/rest/v1/{table}?select=id"
    req = urllib.request.Request(
        url, headers={"apikey": KEY, "Authorization": f"Bearer {KEY}",
                      "Prefer": "count=exact", "Range": "0-0"}
    )
    try:
        with urllib.request.urlopen(req) as r:
            return r.headers.get("Content-Range", "*/0").split("/")[-1]
    except Exception:
        return "?"


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

print("=== ChurchDB Import ===")
print(f"URL: {SUPABASE_URL}")
print()

for table, csvfile in TABLES:
    fp = os.path.join(CSV_DIR, csvfile)
    if not os.path.exists(fp):
        print(f"[{table}] SKIP: file not found")
        continue
    rows = read_csv(table, fp)
    if not rows:
        print(f"[{table}] SKIP: no data rows")
        continue

    print(f"[{table}] {len(rows)} rows...", flush=True)
    ok_count = 0
    batch_errors = []

    for i in range(0, len(rows), 50):
        batch = rows[i:i + 50]
        success, info = upsert(table, batch)
        if success:
            ok_count += len(batch)
        else:
            batch_errors.append(f"  batch {i // 50 + 1}: {info}")

    if batch_errors:
        print(f"  ERRORS:")
        for e in batch_errors:
            print(e)
    print(f"  => {ok_count}/{len(rows)} inserted", flush=True)

print()
print("=== Final Counts ===")
for table, _ in TABLES:
    print(f"  {table:25s}: {get_count(table)}")

print()
print("Done!")

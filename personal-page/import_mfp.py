"""
MFP Printable Diary → food_intake SQL import script
Usage: python import_mfp.py > mfp_food.sql
"""

import re
from datetime import datetime

HTML_FILE = r"C:/Users/Karl/Downloads/Free Calorie Counter, Diet & Exercise Journal _ MyFitnessPal.html"

MEAL_LABELS = {"Breakfast", "Lunch", "Dinner", "Snacks", "Morning Snack",
               "Afternoon Snack", "Evening Snack"}

def parse_date(text):
    """Convert 'Apr 6, 2025' → '2025-04-06'"""
    text = text.strip()
    try:
        return datetime.strptime(text, "%b %d, %Y").strftime("%Y-%m-%d")
    except ValueError:
        return None

def strip_tags(html):
    return re.sub(r"<[^>]+>", "", html)

def clean_text(text):
    """Remove HTML entities, extra whitespace, and non-printable chars."""
    text = text.replace("&nbsp;", " ").replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")
    text = re.sub(r"&[a-z]+;", "", text)          # remaining named entities
    text = re.sub(r"&#\d+;", "", text)             # numeric entities
    text = re.sub(r"[^\x20-\x7E\u00C0-\u024F]", "", text)  # non-latin chars
    text = re.sub(r"\s+", " ", text).strip()
    return text

def extract_food_names(section_html):
    """Pull food item names from all meal rows (not meal headers, not TOTALS)."""
    rows = re.findall(r"<tr[^>]*>(.*?)</tr>", section_html, re.DOTALL)
    names = []
    for row in rows:
        text = clean_text(re.sub(r"\s+", " ", strip_tags(row)).strip())
        # Skip meal headers (Breakfast / Lunch etc.) and TOTALS
        if not text or text in MEAL_LABELS or text.startswith("TOTALS") or text.startswith("FOODS"):
            continue
        # First token before digits is the food name (ends before the calorie number)
        name = re.split(r"\s+\d", text)[0].strip()
        # Remove trailing serving info like ", 1 serving"
        name = re.sub(r",\s*[\d.]+\s+serving.*$", "", name)
        name = name.strip(" ,")
        if name and len(name) > 2:
            names.append(name)
    return names

def escape_sql(s):
    return s.replace("'", "''")

def main():
    with open(HTML_FILE, encoding="utf-8") as f:
        content = f.read()

    day_sections = re.split(r'data-testid="qa-regression-report"', content)[1:]
    print(f"-- Found {len(day_sections)} day sections")
    print("-- Run this against your Neon database\n")
    print("BEGIN;")

    imported = 0
    skipped = 0

    for section in day_sections:
        date_match = re.search(r'data-testid="qa-regression-report-date">([^<]+)<', section)
        totals_match = re.search(
            r'qa-regression-foods-total-data.*?TOTALS.*?css-u45une[^>]*>(\d+)<',
            section, re.DOTALL
        )

        if not date_match or not totals_match:
            skipped += 1
            continue

        raw_date = date_match.group(1).strip()
        iso_date = parse_date(raw_date)
        if not iso_date:
            skipped += 1
            continue

        kcal = int(totals_match.group(1))
        if kcal <= 0:
            skipped += 1
            continue

        # Build description from food names
        names = extract_food_names(section)
        if names:
            preview = ", ".join(n for n in names[:4] if n)
            preview = re.sub(r",\s*,", ",", preview).strip(" ,")  # remove double commas
            if len(preview) > 80:
                preview = preview[:77] + "..."
        else:
            preview = f"MFP - {iso_date}"

        description = escape_sql(clean_text(preview))
        timestamp = f"{iso_date}T12:00:00Z"

        print(
            f"INSERT INTO food_intake (kcal, description, created_at, mfp_id) "
            f"VALUES ({kcal}, '{description}', '{timestamp}', '{iso_date}') "
            f"ON CONFLICT DO NOTHING;"
        )
        imported += 1

    print("\nCOMMIT;")
    print(f"\n-- {imported} rows generated, {skipped} days skipped (no data)")

if __name__ == "__main__":
    import sys, io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
    main()

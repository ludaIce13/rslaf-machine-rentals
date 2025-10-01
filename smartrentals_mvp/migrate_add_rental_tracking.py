#!/usr/bin/env python3
"""
Migration script to add rental tracking fields to public_order_meta table.
Run this once on production to add the new columns.
"""
import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("❌ DATABASE_URL not set")
    exit(1)

# Fix postgres:// to postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)

# SQL to add new columns if they don't exist
migrations = [
    "ALTER TABLE public_order_meta ADD COLUMN IF NOT EXISTS delivery_pickup_time TIMESTAMP;",
    "ALTER TABLE public_order_meta ADD COLUMN IF NOT EXISTS actual_return_time TIMESTAMP;",
    "ALTER TABLE public_order_meta ADD COLUMN IF NOT EXISTS expected_delivery_time TIMESTAMP;",
    "ALTER TABLE public_order_meta ADD COLUMN IF NOT EXISTS expected_return_time TIMESTAMP;",
    "ALTER TABLE public_order_meta ADD COLUMN IF NOT EXISTS is_late_delivery BOOLEAN DEFAULT FALSE;",
    "ALTER TABLE public_order_meta ADD COLUMN IF NOT EXISTS is_late_return BOOLEAN DEFAULT FALSE;",
    "ALTER TABLE public_order_meta ADD COLUMN IF NOT EXISTS extra_billing_hours FLOAT DEFAULT 0.0;",
    "ALTER TABLE public_order_meta ADD COLUMN IF NOT EXISTS delivery_method VARCHAR DEFAULT 'pickup';",
]

print("🔄 Running migrations...")
with engine.connect() as conn:
    for sql in migrations:
        try:
            conn.execute(text(sql))
            conn.commit()
            print(f"✅ {sql[:60]}...")
        except Exception as e:
            print(f"⚠️  {sql[:60]}... (may already exist)")
            print(f"   Error: {e}")

print("\n✅ Migration complete!")
print("New columns added to public_order_meta:")
print("  - delivery_pickup_time")
print("  - actual_return_time") 
print("  - expected_delivery_time")
print("  - expected_return_time")
print("  - is_late_delivery")
print("  - is_late_return")
print("  - extra_billing_hours")
print("  - delivery_method")

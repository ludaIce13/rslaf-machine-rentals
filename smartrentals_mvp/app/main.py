from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import os
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from .database import Base, engine
from .routers import auth, products, inventory, customers, orders, payments, availability, reports

# Create tables that don't exist yet
Base.metadata.create_all(bind=engine)

# Lightweight startup migration for SQLite to add missing Product columns
def run_startup_migrations():
    try:
        with engine.begin() as conn:
            # Only run SQLite-specific migrations if using SQLite
            if "sqlite" in str(engine.url):
                # Inspect existing columns in products table
                cols = {row[1] for row in conn.exec_driver_sql("PRAGMA table_info(products)").fetchall()}
                # Add columns if missing
                if 'image_url' not in cols:
                    conn.exec_driver_sql("ALTER TABLE products ADD COLUMN image_url TEXT DEFAULT ''")
                if 'category' not in cols:
                    conn.exec_driver_sql("ALTER TABLE products ADD COLUMN category TEXT DEFAULT ''")
                if 'published' not in cols:
                    conn.exec_driver_sql("ALTER TABLE products ADD COLUMN published BOOLEAN DEFAULT 1")
                if 'hourly_rate' not in cols:
                    conn.exec_driver_sql("ALTER TABLE products ADD COLUMN hourly_rate REAL DEFAULT 0.0")
                if 'min_hours' not in cols:
                    conn.exec_driver_sql("ALTER TABLE products ADD COLUMN min_hours INTEGER DEFAULT 1")
                if 'max_hours' not in cols:
                    conn.exec_driver_sql("ALTER TABLE products ADD COLUMN max_hours INTEGER")
    except Exception as e:
        print(f"Migration skipped: {e}")

run_startup_migrations()

app = FastAPI(title="SmartRentals API", version="1.0.0")

# CORS middleware for frontend integration
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001,http://localhost:3002").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure static directory exists and mount it for serving uploads (must happen after app is created)
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(STATIC_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(inventory.router)
app.include_router(customers.router)
app.include_router(orders.router)
app.include_router(payments.router)
app.include_router(availability.router)
app.include_router(reports.router)

@app.get("/")
def root():
    return {"message": "RSLAF Machine Rentals API is running", "status": "healthy"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "RSLAF Machine Rentals API"}

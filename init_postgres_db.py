#!/usr/bin/env python3
"""
PostgreSQL Database Initialization Script for RSLAF Machine Rentals
This script creates all tables and initializes the database with sample data.
"""

import os
import sys
from dotenv import load_dotenv

# Add the app directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'smartrentals_mvp'))

from app.database import engine, Base
from app.models import User, Equipment, Booking, Payment
from app.auth import get_password_hash
from sqlalchemy.orm import sessionmaker

# Load environment variables
load_dotenv()

def init_database():
    """Initialize the database with tables and sample data"""
    
    print("🔧 Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created successfully!")
    
    # Create session
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Check if admin user already exists
        existing_admin = db.query(User).filter(User.email == "admin@rslaf.com").first()
        if existing_admin:
            print("⚠️  Admin user already exists, skipping user creation")
        else:
            # Create admin user
            print("👤 Creating admin user...")
            admin_user = User(
                email="admin@rslaf.com",
                username="admin",
                full_name="RSLAF Administrator",
                hashed_password=get_password_hash("admin123"),
                is_active=True,
                is_admin=True
            )
            db.add(admin_user)
            print("✅ Admin user created (email: admin@rslaf.com, password: admin123)")
        
        # Check if equipment already exists
        existing_equipment = db.query(Equipment).first()
        if existing_equipment:
            print("⚠️  Equipment already exists, skipping equipment creation")
        else:
            # Create sample equipment
            print("🚜 Creating sample equipment...")
            
            equipment_list = [
                {
                    "name": "Road Roller - Heavy Duty",
                    "category": "Compaction",
                    "description": "Professional road roller for asphalt and soil compaction. Perfect for road construction and maintenance projects.",
                    "daily_rate": 150.00,
                    "specifications": "Weight: 12 tons, Engine: Diesel, Width: 2.1m",
                    "availability_status": "available",
                    "location": "Cockerill Barracks, Freetown"
                },
                {
                    "name": "Excavator - 20 Ton",
                    "category": "Excavation",
                    "description": "Heavy-duty excavator suitable for digging, trenching, and demolition work.",
                    "daily_rate": 200.00,
                    "specifications": "Operating weight: 20 tons, Bucket capacity: 1.2m³, Max dig depth: 6.5m",
                    "availability_status": "available",
                    "location": "Cockerill Barracks, Freetown"
                },
                {
                    "name": "Bulldozer - D6",
                    "category": "Earthmoving",
                    "description": "Powerful bulldozer for land clearing, grading, and earthmoving operations.",
                    "daily_rate": 180.00,
                    "specifications": "Engine: 140HP, Blade width: 3.4m, Operating weight: 18 tons",
                    "availability_status": "available",
                    "location": "Cockerill Barracks, Freetown"
                },
                {
                    "name": "Concrete Mixer - 500L",
                    "category": "Concrete",
                    "description": "Mobile concrete mixer for small to medium construction projects.",
                    "daily_rate": 50.00,
                    "specifications": "Capacity: 500L, Engine: Petrol, Portable design",
                    "availability_status": "available",
                    "location": "Cockerill Barracks, Freetown"
                },
                {
                    "name": "Generator - 100KVA",
                    "category": "Power",
                    "description": "Industrial generator for construction sites and events.",
                    "daily_rate": 80.00,
                    "specifications": "Power: 100KVA, Fuel: Diesel, Runtime: 12 hours",
                    "availability_status": "available",
                    "location": "Cockerill Barracks, Freetown"
                }
            ]
            
            for eq_data in equipment_list:
                equipment = Equipment(**eq_data)
                db.add(equipment)
            
            print(f"✅ Created {len(equipment_list)} equipment items")
        
        # Commit all changes
        db.commit()
        print("\n🎉 Database initialization completed successfully!")
        print("\n📋 Summary:")
        print("- Database: PostgreSQL (Production)")
        print("- Admin Login: admin@rslaf.com / admin123")
        print("- Equipment: 5 items available for rental")
        print("- Location: Cockerill Barracks, Freetown, Sierra Leone")
        
    except Exception as e:
        print(f"❌ Error during initialization: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Initializing RSLAF Machine Rentals Database (PostgreSQL)")
    print("=" * 60)
    
    # Check if DATABASE_URL is set
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("⚠️  DATABASE_URL not set, using SQLite for local development")
    else:
        print(f"🔗 Using database: {database_url.split('@')[0]}@***")
    
    init_database()

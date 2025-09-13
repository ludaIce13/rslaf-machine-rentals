import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import models after setting up the path
from smartrentals_mvp.app.database import Base, engine
from smartrentals_mvp.app import models
from smartrentals_mvp.app.auth import get_password_hash

def init_db():
    # Create all tables
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    
    # Create a session
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Check if admin user exists
        admin_user = db.query(models.User).filter(models.User.email == 'admin@smartrentals.com').first()
        
        if admin_user:
            print(f"Admin user already exists: {admin_user.email}")
        else:
            # Create admin user
            print("Creating admin user...")
            admin_user = models.User(
                email='admin@smartrentals.com',
                password_hash=get_password_hash('admin123'),
                role=models.UserRole.admin.value,
                first_name='Admin',
                last_name='User'
            )
            db.add(admin_user)
            db.commit()
            print(f"Admin user created: {admin_user.email}")
            
    except Exception as e:
        print(f"Error initializing database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
    print("Database initialization complete.")

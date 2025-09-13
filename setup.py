from setuptools import setup, find_packages
import os
import sys
import subprocess
from pathlib import Path

def setup_backend():
    print("=== Setting up Backend ===")
    
    # Set environment variables
    os.environ['PYTHONPATH'] = str(Path.cwd())
    os.environ['SMARTRENTALS_API_KEY'] = 'test123'
    os.environ['DATABASE_URL'] = 'sqlite:///./smartrentals.db'
    
    # Install backend dependencies
    print("Installing backend dependencies...")
    try:
        subprocess.run([".venv/Scripts/python.exe", "-m", "pip", "install", "-r", "smartrentals_mvp/requirements.txt"], 
                      check=True, shell=True)
        print("✓ Backend dependencies installed")
    except subprocess.CalledProcessError as e:
        print(f"✗ Failed to install backend dependencies: {e}")
        return False
    
    # Initialize database with test data
    print("Initializing database with test data...")
    try:
        subprocess.run([".venv/Scripts/python.exe", "init_test_db.py"], 
                      check=True, shell=True, env=os.environ)
        print("✓ Database initialized with test data")
    except subprocess.CalledProcessError as e:
        print(f"✗ Failed to initialize database: {e}")
        return False
    
    return True

def setup_frontend():
    print("\n=== Setting up Frontend ===")
    
    # Install frontend dependencies
    print("Installing frontend dependencies...")
    try:
        subprocess.run(["npm", "install"], cwd="frontend", check=True, shell=True)
        print("✓ Frontend dependencies installed")
    except subprocess.CalledProcessError as e:
        print(f"✗ Failed to install frontend dependencies: {e}")
        return False
    
    return True

def main():
    print("🚀 Setting up SmartRentals MVP...\n")
    
    if not setup_backend():
        print("\n❌ Backend setup failed!")
        return False
    
    if not setup_frontend():
        print("\n❌ Frontend setup failed!")
        return False
    
    print("\n✅ Setup complete!")
    print("\nTo start the application:")
    print("1. Backend: run 'start_backend.bat'")
    print("2. Frontend: cd frontend && npm start")
    print("\nLogin credentials:")
    print("Email: admin@smartrentals.com")
    print("Password: admin123")
    
    return True

if __name__ == "__main__":
    main()

setup(
    name="smartrentals_mvp",
    version="0.1",
    packages=find_packages(),
    install_requires=[
        'fastapi>=0.68.0',
        'uvicorn>=0.15.0',
        'sqlalchemy>=1.4.0',
        'pydantic>=1.8.0',
        'python-jose[cryptography]>=3.3.0',
        'passlib[bcrypt]>=1.7.4',
        'python-multipart>=0.0.5',
    ],
)

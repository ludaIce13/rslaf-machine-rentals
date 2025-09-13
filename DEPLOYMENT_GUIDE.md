# SmartRentals Production Deployment Guide

## System Overview
SmartRentals is a complete rental management system with:
- **Backend API** (FastAPI + SQLAlchemy)
- **Admin Portal** (React - Equipment management)
- **Customer Portal** (React - Equipment catalog & booking)

## Quick Start Commands

### 1. Start Backend API
```bash
cd smartrentals_mvp
python start_server.py
# Runs on: http://localhost:8000
```

### 2. Start Admin Portal
```bash
cd frontend
npm install  # First time only
npm start
# Runs on: http://localhost:3000
```

### 3. Start Customer Portal
```bash
cd customer-portal
npm install  # First time only
npm start
# Runs on: http://localhost:3001
```

## System Requirements
- Python 3.8+ with pip
- Node.js 16+ with npm
- SQLite (included with Python)

## Database
- **File**: `smartrentals.db`
- **Status**: Clean (no demo data)
- **Location**: Root directory

## Key Features
- ✅ Professional equipment catalog design
- ✅ Real-time admin/customer synchronization
- ✅ Hourly rental booking system
- ✅ JWT authentication for admin
- ✅ Mobile responsive design
- ✅ RSLAF branding (#1b7a23 green)

## Health Check URLs
- Backend API Docs: http://localhost:8000/docs
- Admin Dashboard: http://localhost:3000
- Customer Catalog: http://localhost:3001/products

## Troubleshooting
- **Port conflicts**: Change ports in configuration files
- **Database issues**: Restart all services
- **API failures**: Check dependencies with `pip install -r requirements.txt`
- **Frontend issues**: Run `npm install` in respective directories

## Production Ready
- No demo/sample data
- Clean database
- Professional UI
- Error handling implemented
- Security features enabled

---
**System Status**: Production Ready ✅
**Last Updated**: January 2025

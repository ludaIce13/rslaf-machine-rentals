# SmartRentals MVP - Setup Guide

## Quick Start

### 1. Start Backend Server
```bash
# Run this in the project root directory
.\start_backend.bat
```
The backend will start on http://localhost:8000

### 2. Start Frontend Server
```bash
# In a new terminal, navigate to frontend directory
cd frontend
npm start
```
The frontend will start on http://localhost:3000

### 3. Login Credentials
- **Email:** admin@smartrentals.com
- **Password:** admin123

## System Architecture

### Backend (FastAPI + SQLite)
- **Location:** `smartrentals_mvp/` directory
- **Database:** SQLite (`smartrentals.db`)
- **API Documentation:** http://localhost:8000/docs
- **Key Features:**
  - JWT Authentication
  - Products, Inventory, Customers, Orders management
  - Availability checking and price quoting
  - Real-time reservation conflict prevention

### Frontend (React)
- **Location:** `frontend/` directory
- **Features:**
  - Admin dashboard with navigation
  - Protected routes with authentication
  - Orders management page
  - Products and inventory management
  - Customer management
  - Reports and analytics

## API Endpoints

### Authentication
- `POST /auth/login` - Login with email/password
- `GET /auth/me` - Get current user profile

### Core Resources
- `GET /products` - List all products
- `GET /orders` - List orders (requires authentication)
- `GET /customers` - List customers (requires authentication)
- `GET /inventory` - List inventory items

### Availability & Booking
- `GET /availability/products/{id}` - Check product availability
- `POST /availability/quote` - Get pricing quote
- `POST /orders` - Create new order

## Troubleshooting

### Backend Issues
1. **Port 8000 already in use:**
   ```bash
   netstat -ano | findstr :8000
   # Kill the process if needed
   ```

2. **Database not initialized:**
   ```bash
   python quick_init_db.py
   ```

3. **Missing dependencies:**
   ```bash
   .venv\Scripts\pip install -r smartrentals_mvp\requirements.txt
   ```

### Frontend Issues
1. **Dependencies not installed:**
   ```bash
   cd frontend
   npm install
   ```

2. **Authentication errors:**
   - Ensure backend is running on port 8000
   - Check browser console for errors
   - Clear localStorage and try logging in again

### Common Solutions
- **CORS errors:** Backend includes CORS middleware for localhost:3000
- **Token issues:** Tokens are stored in localStorage and automatically included in API requests
- **Database issues:** Database file is created automatically when backend starts

## Development

### Adding New Features
1. **Backend:** Add routes in `smartrentals_mvp/app/routers/`
2. **Frontend:** Add components in `frontend/src/components/`
3. **Database:** Update models in `smartrentals_mvp/app/models.py`

### Environment Variables
- `SMARTRENTALS_API_KEY`: API key for write operations
- `DATABASE_URL`: Database connection string
- `REACT_APP_API_BASE`: Frontend API base URL

## Production Deployment

### Backend
- Replace SQLite with PostgreSQL
- Set proper environment variables
- Use production ASGI server (Gunicorn + Uvicorn)

### Frontend
- Build production bundle: `npm run build`
- Serve static files with nginx or similar
- Update API base URL for production

## Support

For issues or questions:
1. Check the browser console for frontend errors
2. Check backend logs for API errors
3. Verify all services are running on correct ports
4. Ensure database is properly initialized

---

**System Status:**
- ✅ Backend API running on port 8000
- ✅ Frontend React app on port 3000
- ✅ Authentication system working
- ✅ Database initialized with test data
- ✅ Orders page functional

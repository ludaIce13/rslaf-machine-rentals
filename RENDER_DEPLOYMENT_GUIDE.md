# RSLAF Machine Rentals - Render Deployment Guide

## Prerequisites
- GitHub account (to host your code)
- Render account (your company pays for this)
- Git installed on your machine

## Step 1: Prepare Your Repository

### 1.1 Initialize Git Repository
```bash
cd c:\Users\vidai\OneDrive\Desktop\smartrentals_mvp
git init
git add .
git commit -m "Initial commit - RSLAF Machine Rentals System"
```

### 1.2 Create GitHub Repository
1. Go to GitHub.com and create a new repository named `rslaf-machine-rentals`
2. Push your code:
```bash
git remote add origin https://github.com/YOUR_USERNAME/rslaf-machine-rentals.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy Backend API on Render

### 2.1 Create Web Service
1. Login to Render Dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `rslaf-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python start_server.py`
   - **Plan**: Starter ($7/month)

### 2.2 Environment Variables
Add these environment variables:
- `DATABASE_URL`: `sqlite:///./smartrentals.db`
- `SECRET_KEY`: (Generate a random secret key)
- `CORS_ORIGINS`: `https://rslaf-admin.onrender.com,https://rslaf-customer.onrender.com`

## Step 3: Deploy Admin Portal

### 3.1 Create Static Site
1. Click "New +" → "Static Site"
2. Connect same GitHub repository
3. Configure:
   - **Name**: `rslaf-admin`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/build`
   - **Plan**: Free (Static sites are free)

### 3.2 Environment Variables
- `REACT_APP_API_URL`: `https://rslaf-backend.onrender.com`

## Step 4: Deploy Customer Portal

### 4.1 Create Static Site
1. Click "New +" → "Static Site"
2. Connect same GitHub repository
3. Configure:
   - **Name**: `rslaf-customer`
   - **Build Command**: `cd customer-portal && npm install && npm run build`
   - **Publish Directory**: `customer-portal/build`
   - **Plan**: Free (Static sites are free)

### 4.2 Environment Variables
- `REACT_APP_API_URL`: `https://rslaf-backend.onrender.com`

## Step 5: Update API URLs in Frontend

### 5.1 Update Admin Portal API URL
Create `frontend/.env.production`:
```
REACT_APP_API_URL=https://rslaf-backend.onrender.com
```

### 5.2 Update Customer Portal API URL
Create `customer-portal/.env.production`:
```
REACT_APP_API_URL=https://rslaf-backend.onrender.com
```

## Step 6: Final Deployment URLs

After deployment, your system will be available at:
- **Backend API**: `https://rslaf-backend.onrender.com`
- **Admin Portal**: `https://rslaf-admin.onrender.com`
- **Customer Portal**: `https://rslaf-customer.onrender.com`

## Step 7: Post-Deployment Setup

### 7.1 Initialize Database
1. Go to `https://rslaf-backend.onrender.com/docs`
2. Test API endpoints
3. Create admin user if needed

### 7.2 Test System
1. Test admin portal login
2. Test customer portal functionality
3. Test equipment booking flow
4. Verify payment gateway integration

## Monthly Costs (Render)
- **Backend Web Service**: $7/month (Starter plan)
- **Admin Portal**: Free (Static site)
- **Customer Portal**: Free (Static site)
- **Total**: $7/month

## Custom Domain (Optional)
To use your own domain:
1. Purchase domain (e.g., rslafrentals.com)
2. In Render dashboard, go to each service → Settings → Custom Domains
3. Add your domains:
   - `api.rslafrentals.com` → Backend
   - `admin.rslafrentals.com` → Admin Portal
   - `www.rslafrentals.com` → Customer Portal

## Support
- Render Documentation: https://render.com/docs
- For issues, contact Render support (included with paid plans)

## Security Notes
- All connections use HTTPS automatically
- Database is included in the deployment
- Environment variables are encrypted
- Regular backups recommended for production data

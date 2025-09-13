# SmartRentals MVP (Booqable-like System)
A minimal FastAPI + SQLite starter to manage rental products, inventory, customers, orders, and payments.

## Features (MVP)
- Products & inventory (with availability windows)
- Customers
- Orders (reserve, confirm, return)
- Simple pricing (daily rate) and availability conflict check
- Local payment record (manual verification flow)
- API Key auth for write endpoints (optional in dev)

## Tech
- FastAPI
- SQLite (via SQLAlchemy)
- Pydantic
- Uvicorn

## Quick Start
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```
Open docs at http://127.0.0.1:8000/docs

## API Key Auth (optional)
Set an environment variable to protect write endpoints (POSTs):

Windows PowerShell
```powershell
$env:SMARTRENTALS_API_KEY = "your-secret-key"
```
Linux/Mac
```bash
export SMARTRENTALS_API_KEY="your-secret-key"
```
Then include header on write requests:
```
X-API-Key: your-secret-key
```

Example (create product):
```bash
curl -X POST "http://127.0.0.1:8000/products" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-secret-key" \
  -d '{"name":"Solar Lamp","sku":"SL-08","daily_rate":5.0}'
```

## Example Flow
1. Create a product (`POST /products`)
2. Create inventory item(s) for that product (`POST /inventory`)
3. Create a customer (`POST /customers`)
4. Create an order with desired rental dates (`POST /orders`)
5. Record a local payment reference (`POST /payments`)
6. Mark order as `confirmed` (staff) and later `returned`

## New Endpoints
- Availability
  - `GET /availability/products/{product_id}?start=ISO&end=ISO`
  - `POST /availability/quote` with `{ reservations: [ { inventory_item_id, start_date, end_date } ] }`
- Reports
  - `GET /reports/upcoming-reservations?start=ISO&end=ISO`
  - `GET /reports/utilization?start=ISO&end=ISO`

## Notes
- This is a starter; security (JWT), RBAC, and advanced pricing tiers should be added before production.
- Swap SQLite for Postgres in `app/database.py` and configure env vars.
- Consider adding Redis + Celery for background tasks (reminders, report generation).
```
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime
from ..database import get_db
from .. import models, schemas
from ..utils import available_inventory_items, rental_days, rental_hours, calculate_reservations_total

router = APIRouter(prefix="/availability", tags=["availability"]) 

@router.get("/products/{product_id}", response_model=list[schemas.AvailableItem])
def get_available_items(
    product_id: int,
    start: datetime = Query(..., alias="start"),
    end: datetime = Query(..., alias="end"),
    db: Session = Depends(get_db)
):
    if end <= start:
        raise HTTPException(status_code=400, detail="end must be after start")
    items = available_inventory_items(db, product_id, start, end)
    return items

@router.post("/quote", response_model=schemas.QuoteOut)
def quote(payload: schemas.QuoteRequest, db: Session = Depends(get_db)):
    if not payload.reservations:
        return schemas.QuoteOut(subtotal=0.0, total=0.0)

    # Validate ranges and min/max hours per product
    for r in payload.reservations:
        if r.end_date <= r.start_date:
            raise HTTPException(status_code=400, detail="Reservation end_date must be after start_date")
        inv = db.query(models.InventoryItem).get(r.inventory_item_id)
        if not inv:
            raise HTTPException(status_code=404, detail=f"Inventory item {r.inventory_item_id} not found")
        product = db.query(models.Product).get(inv.product_id)
        if not product:
            raise HTTPException(status_code=404, detail=f"Product for item {r.inventory_item_id} not found")
        hrs = rental_hours(r.start_date, r.end_date)
        if getattr(product, 'min_hours', None) and hrs < product.min_hours:
            raise HTTPException(status_code=400, detail=f"Minimum rental is {product.min_hours} hour(s)")
        if getattr(product, 'max_hours', None) and product.max_hours and hrs > product.max_hours:
            raise HTTPException(status_code=400, detail=f"Maximum rental is {product.max_hours} hour(s)")

    # Use utility that prefers hourly pricing when available
    # We need model instances to reuse the calculator
    res_models = []
    for r in payload.reservations:
        inv = db.query(models.InventoryItem).get(r.inventory_item_id)
        if not inv:
            raise HTTPException(status_code=404, detail=f"Inventory item {r.inventory_item_id} not found")
        # Create a transient Reservation-like object for calculation
        class R:
            pass
        rr = R()
        rr.inventory_item = inv
        rr.inventory_item_id = inv.id
        rr.start_date = r.start_date
        rr.end_date = r.end_date
        res_models.append(rr)

    subtotal = calculate_reservations_total(db, res_models)
    # Hook for taxes/fees/discounts could go here; for now total == subtotal
    return schemas.QuoteOut(subtotal=subtotal, total=subtotal)

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from ..database import get_db
from .. import models

router = APIRouter(prefix="/reports", tags=["reports"]) 

@router.get("/upcoming-reservations")
def upcoming_reservations(
    start: datetime = Query(default_factory=lambda: datetime.utcnow()),
    end: datetime = Query(default_factory=lambda: datetime.utcnow() + timedelta(days=30)),
    db: Session = Depends(get_db)
):
    # Reservations overlapping [start, end)
    q = db.query(models.Reservation).filter(
        models.Reservation.start_date < end,
        models.Reservation.end_date > start
    ).all()
    # Return minimal info
    return [
        {
            "reservation_id": r.id,
            "order_id": r.order_id,
            "inventory_item_id": r.inventory_item_id,
            "start_date": r.start_date,
            "end_date": r.end_date,
        }
        for r in q
    ]

@router.get("/utilization")
def utilization(
    start: datetime = Query(...),
    end: datetime = Query(...),
    db: Session = Depends(get_db)
):
    if end <= start:
        return {"error": "end must be after start"}

    # Total item-days capacity for the range (per active item)
    range_days = max(1, (end - start).days)
    active_items = db.query(models.InventoryItem).filter(models.InventoryItem.active == True).all()
    capacity_item_days = len(active_items) * range_days

    # Compute reserved item-days by summing overlap days across reservations
    reservations = db.query(models.Reservation).filter(
        models.Reservation.start_date < end,
        models.Reservation.end_date > start
    ).all()

    def overlap_days(a_start: datetime, a_end: datetime, b_start: datetime, b_end: datetime) -> int:
        s = max(a_start, b_start)
        e = min(a_end, b_end)
        if e <= s:
            return 0
        return max(1, (e - s).days)

    reserved_item_days = 0
    for r in reservations:
        reserved_item_days += overlap_days(start, end, r.start_date, r.end_date)

    utilization_pct = 0.0
    if capacity_item_days > 0:
        utilization_pct = round(100.0 * reserved_item_days / capacity_item_days, 2)

    return {
        "start": start,
        "end": end,
        "capacity_item_days": capacity_item_days,
        "reserved_item_days": reserved_item_days,
        "utilization_percent": utilization_pct,
    }

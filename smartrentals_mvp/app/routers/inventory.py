from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from .. import models, schemas
from ..auth import get_staff_or_admin_user

router = APIRouter(prefix="/inventory", tags=["inventory"])

@router.post("", response_model=schemas.InventoryItemOut)
def create_item(payload: schemas.InventoryItemCreate, db: Session = Depends(get_db)):
    item = models.InventoryItem(**payload.dict())
    db.add(item); db.commit(); db.refresh(item)
    return item

@router.get("", response_model=list[schemas.InventoryItemOut])
def list_items(product_id: int | None = Query(None), db: Session = Depends(get_db)):
    q = db.query(models.InventoryItem)
    if product_id is not None:
        q = q.filter(models.InventoryItem.product_id == product_id)
    return q.all()

@router.put("/{item_id}", response_model=schemas.InventoryItemOut)
def update_item(item_id: int, payload: schemas.InventoryItemUpdate, db: Session = Depends(get_db)):
    item = db.get(models.InventoryItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    data = payload.dict(exclude_unset=True)
    for k, v in data.items():
        setattr(item, k, v)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.delete("/{item_id}")
def delete_item(item_id: int, db: Session = Depends(get_db)):
    item = db.get(models.InventoryItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    db.delete(item)
    db.commit()
    return {"ok": True}

@router.get("/counts")
def get_counts(db: Session = Depends(get_db)):
    # Returns counts per product: total and active
    try:
        # Simple approach - get all items and count in Python
        all_items = db.query(models.InventoryItem).all()
        print(f"Found {len(all_items)} total inventory items")
        
        counts_by_product = {}
        for item in all_items:
            pid = item.product_id
            if pid not in counts_by_product:
                counts_by_product[pid] = {"total": 0, "active": 0}
            counts_by_product[pid]["total"] += 1
            if item.active:
                counts_by_product[pid]["active"] += 1
        
        result = [
            {"product_id": pid, "total": counts["total"], "active": counts["active"]}
            for pid, counts in counts_by_product.items()
        ]
        print(f"Counts result: {result}")
        return result
    except Exception as e:
        print(f"Error in get_counts: {e}")
        import traceback
        traceback.print_exc()
        return []

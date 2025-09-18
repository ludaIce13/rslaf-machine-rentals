from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Request
import os
import uuid
from sqlalchemy.orm import Session
from sqlalchemy import distinct
from ..database import get_db
from .. import models, schemas
from ..auth import get_staff_or_admin_user

router = APIRouter(prefix="/products", tags=["products"])

@router.post("", response_model=schemas.ProductOut)
def create_product(payload: schemas.ProductCreate, db: Session = Depends(get_db)):
    try:
        # Create the product
        p = models.Product(**payload.dict())
        db.add(p)
        db.commit()
        db.refresh(p)
        
        # Automatically create a default inventory item for the product
        default_inventory = models.InventoryItem(
            product_id=p.id,
            label=f"{p.name} - Unit 1",
            location="Main Yard",
            active=True
        )
        db.add(default_inventory)
        db.commit()
        
        return p
    except Exception as e:
        db.rollback()
        print(f"Error creating product: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create product: {str(e)}")

@router.get("", response_model=list[schemas.ProductOut])
def list_products(
    published_only: bool = Query(False, description="Only include products where published=true"),
    in_stock_only: bool = Query(False, description="Only include products that have at least one active inventory item"),
    db: Session = Depends(get_db)
):
    q = db.query(models.Product)
    if published_only:
        q = q.filter(models.Product.published == True)
    if in_stock_only:
        # Ensure at least one active inventory item exists for the product
        q = q.join(models.InventoryItem, models.InventoryItem.product_id == models.Product.id).filter(models.InventoryItem.active == True).distinct()
    return q.all()

@router.get("/categories", response_model=list[str])
def list_categories(db: Session = Depends(get_db)):
    cats = (
        db.query(distinct(models.Product.category))
        .filter((models.Product.category != None) & (models.Product.category != ""))
        .all()
    )
    # result is list of tuples [("Excavator",), ...] -> flatten and sort
    cats = sorted([c[0] for c in cats])
    return cats

@router.get("/{product_id}", response_model=schemas.ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    # SQLAlchemy 2.x: use Session.get(Model, pk)
    product = db.get(models.Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.put("/{product_id}", response_model=schemas.ProductOut, dependencies=[Depends(get_staff_or_admin_user)])
def update_product(product_id: int, payload: schemas.ProductUpdate, db: Session = Depends(get_db)):
    product = db.get(models.Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    data = payload.dict(exclude_unset=True)
    for k, v in data.items():
        setattr(product, k, v)
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@router.delete("/{product_id}", dependencies=[Depends(get_staff_or_admin_user)])
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.get(models.Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Also delete associated inventory items
    inventory_items = db.query(models.InventoryItem).filter(models.InventoryItem.product_id == product_id).all()
    for item in inventory_items:
        db.delete(item)
    
    db.delete(product)
    db.commit()
    return {"message": "Product deleted successfully"}

# Upload endpoint for development/demo - no auth required
@router.post("/upload-image")
def upload_image(request: Request, file: UploadFile = File(...)):
    # Validate extension
    filename = file.filename or "upload"
    ext = os.path.splitext(filename)[1].lower()
    allowed = {".png", ".jpg", ".jpeg", ".gif", ".webp"}
    if ext not in allowed:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    # Build upload path under app/static/uploads/products
    base_dir = os.path.dirname(os.path.dirname(__file__))  # app/
    static_dir = os.path.join(base_dir, "static")
    upload_dir = os.path.join(static_dir, "uploads", "products")
    os.makedirs(upload_dir, exist_ok=True)

    uid = uuid.uuid4().hex
    safe_name = f"{uid}{ext}"
    abs_path = os.path.join(upload_dir, safe_name)

    # Save file
    with open(abs_path, "wb") as out:
        out.write(file.file.read())

    rel_path = f"/static/uploads/products/{safe_name}"
    base_url = str(request.base_url).rstrip("/")
    return {"path": rel_path, "url": f"{base_url}{rel_path}"}

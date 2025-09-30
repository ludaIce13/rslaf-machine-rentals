from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, Boolean, UniqueConstraint
from sqlalchemy.orm import relationship, Mapped, mapped_column
from datetime import datetime
from .database import Base
import enum

class UserRole(str, enum.Enum):
    admin = "admin"
    staff = "staff"
    customer = "customer"

class OrderStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"
    returned = "returned"

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String)
    role: Mapped[str] = mapped_column(String, default=UserRole.customer.value)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    last_login: Mapped[datetime] = mapped_column(DateTime, nullable=True)

    # Relationship to customer profile
    customer_profile = relationship("Customer", back_populates="user", uselist=False)

class Product(Base):
    __tablename__ = "products"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, index=True)
    description: Mapped[str] = mapped_column(String, default="")
    daily_rate: Mapped[float] = mapped_column(Float, default=0.0)
    hourly_rate: Mapped[float] = mapped_column(Float, default=0.0)
    # Rental duration constraints (hours)
    min_hours: Mapped[int] = mapped_column(Integer, default=1)
    max_hours: Mapped[int] = mapped_column(Integer, nullable=True)  # null/None means no max
    sku: Mapped[str] = mapped_column(String, unique=True, index=True)
    # New optional fields for customer site visuals and publish control
    image_url: Mapped[str] = mapped_column(String, default="")
    category: Mapped[str] = mapped_column(String, default="")
    published: Mapped[bool] = mapped_column(Boolean, default=True)

    inventory_items = relationship("InventoryItem", back_populates="product")


class InventoryItem(Base):
    __tablename__ = "inventory_items"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    product_id: Mapped[int] = mapped_column(Integer, ForeignKey("products.id"))
    label: Mapped[str] = mapped_column(String, index=True)  # e.g., "08 SL 24"
    location: Mapped[str] = mapped_column(String, default="")
    active: Mapped[bool] = mapped_column(Boolean, default=True)

    product = relationship("Product", back_populates="inventory_items")
    reservations = relationship("Reservation", back_populates="inventory_item")


class Customer(Base):
    __tablename__ = "customers"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    name: Mapped[str] = mapped_column(String, index=True)
    email: Mapped[str] = mapped_column(String, index=True)
    phone: Mapped[str] = mapped_column(String, index=True)

    user = relationship("User", back_populates="customer_profile")


class Order(Base):
    __tablename__ = "orders"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    customer_id: Mapped[int] = mapped_column(Integer, ForeignKey("customers.id"))
    status: Mapped[str] = mapped_column(String, default=OrderStatus.pending.value)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    subtotal: Mapped[float] = mapped_column(Float, default=0.0)
    total: Mapped[float] = mapped_column(Float, default=0.0)

    customer = relationship("Customer")
    reservations = relationship("Reservation", back_populates="order")
    payments = relationship("Payment", back_populates="order")


class PublicOrderMeta(Base):
    """
    Lightweight metadata attached to an order for public/demo flows (no auth).
    This avoids modifying the core orders table and works on Render without migrations.
    """
    __tablename__ = "public_order_meta"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    order_id: Mapped[int] = mapped_column(Integer, ForeignKey("orders.id"), index=True, unique=True)
    customer_name: Mapped[str] = mapped_column(String, default="")
    customer_email: Mapped[str] = mapped_column(String, default="")
    customer_phone: Mapped[str] = mapped_column(String, default="")
    equipment_name: Mapped[str] = mapped_column(String, default="")
    payment_method: Mapped[str] = mapped_column(String, default="")
    total_price: Mapped[float] = mapped_column(Float, default=0.0)
    total_hours: Mapped[float] = mapped_column(Float, default=0.0)
    start_date: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    end_date: Mapped[datetime] = mapped_column(DateTime, nullable=True)


class Reservation(Base):
    __tablename__ = "reservations"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    order_id: Mapped[int] = mapped_column(Integer, ForeignKey("orders.id"))
    inventory_item_id: Mapped[int] = mapped_column(Integer, ForeignKey("inventory_items.id"))
    start_date: Mapped[datetime] = mapped_column(DateTime)
    end_date: Mapped[datetime] = mapped_column(DateTime)

    order = relationship("Order", back_populates="reservations")
    inventory_item = relationship("InventoryItem", back_populates="reservations")

    __table_args__ = (
        UniqueConstraint('inventory_item_id', 'start_date', 'end_date', name='uq_item_time_window'),
    )


class Payment(Base):
    __tablename__ = "payments"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    order_id: Mapped[int] = mapped_column(Integer, ForeignKey("orders.id"))
    method: Mapped[str] = mapped_column(String)  # Orange Money, AfriMoney, Bank, etc.
    amount: Mapped[float] = mapped_column(Float, default=0.0)
    reference: Mapped[str] = mapped_column(String)  # transaction ID
    received_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    order = relationship("Order", back_populates="payments")

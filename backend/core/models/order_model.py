from typing import List, Optional
from datetime import datetime
from enum import Enum
from odmantic import Field, Model, ObjectId

class OrderStatus(str, Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    SHIPPED = "SHIPPED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"

class Order(Model):
    user_id: ObjectId = Field(..., description="ID of the user who placed the order")
    items: List[str] = Field(..., description="List of items in the order")
    total_amount: float = Field(..., gt=0, description="Total price of the order")
    status: OrderStatus = Field(default=OrderStatus.PENDING, description="Current status of the order")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Order creation timestamp")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Last update timestamp")

    model_config = {
        "collection": "orders"
    }

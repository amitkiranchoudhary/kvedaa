from typing import List, Optional
from pydantic import BaseModel, Field
from core.models.order_model import OrderStatus


class OrderCreate(BaseModel):
    items: List[str] = Field(..., min_items=1, description="List of items to order")
    total_amount: float = Field(..., gt=0, description="Total price of the order")


class OrderUpdate(BaseModel):
    items: Optional[List[str]] = Field(
        None, min_items=1, description="List of items to order"
    )
    total_amount: Optional[float] = Field(
        None, gt=0, description="Total price of the order"
    )
    status: Optional[OrderStatus] = Field(None, description="New status of the order")

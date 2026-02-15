from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from core.models.order_model import OrderStatus


class OrderResponse(BaseModel):
    id: str
    user_id: str
    items: List[str]
    total_amount: float
    status: OrderStatus
    created_at: datetime
    updated_at: datetime
    user_details: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True)

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field


class BuildingResponse(BaseModel):
    id: str = Field(..., description="Building ID")
    name: str
    address: str
    floors: int
    manager_id: str
    description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class BuildingListResponse(BaseModel):
    buildings: List[BuildingResponse]
    total: int

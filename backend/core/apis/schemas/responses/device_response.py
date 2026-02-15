from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field
from core.models.device_model import DeviceType, DeviceStatus


class DeviceResponse(BaseModel):
    id: str = Field(..., description="Device MongoDB ID")
    device_id: str = Field(..., description="Hardware ID")
    name: str
    type: DeviceType
    building_id: str
    location: str
    status: DeviceStatus
    api_key: str
    firmware_version: Optional[str] = None
    last_seen: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class DeviceListResponse(BaseModel):
    devices: List[DeviceResponse]
    total: int


class DeviceStatusResponse(BaseModel):
    device_id: str
    name: str
    status: DeviceStatus
    last_seen: Optional[datetime] = None

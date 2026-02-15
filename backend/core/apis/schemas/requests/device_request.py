from typing import Optional
from pydantic import BaseModel, Field
from core.models.device_model import DeviceType, DeviceStatus


class DeviceCreateRequest(BaseModel):
    device_id: str = Field(..., min_length=2, max_length=100, description="Hardware ID (e.g. MAC address)")
    name: str = Field(..., min_length=2, max_length=200, description="Display name for the device")
    type: DeviceType = Field(..., description="Type of sensor/device")
    building_id: str = Field(..., description="ID of the building where installed")
    location: str = Field(default="", max_length=200, description="Floor/room location, e.g. 'Floor 2, Room 301'")
    firmware_version: Optional[str] = Field(default=None, max_length=50)


class DeviceUpdateRequest(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=200)
    type: Optional[DeviceType] = Field(default=None)
    building_id: Optional[str] = Field(default=None)
    location: Optional[str] = Field(default=None, max_length=200)
    status: Optional[DeviceStatus] = Field(default=None)
    firmware_version: Optional[str] = Field(default=None, max_length=50)

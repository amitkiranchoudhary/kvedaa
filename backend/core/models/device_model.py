from enum import Enum
from typing import Optional
from datetime import datetime
from odmantic import Field, Model, ObjectId


class DeviceType(str, Enum):
    ENERGY_METER = "ENERGY_METER"
    TEMP_SENSOR = "TEMP_SENSOR"
    CO2_SENSOR = "CO2_SENSOR"
    WATER_METER = "WATER_METER"
    GAS_METER = "GAS_METER"
    HUMIDITY_SENSOR = "HUMIDITY_SENSOR"
    GATEWAY = "GATEWAY"


class DeviceStatus(str, Enum):
    ONLINE = "ONLINE"
    OFFLINE = "OFFLINE"
    MAINTENANCE = "MAINTENANCE"


class Device(Model):
    """Represents an IoT device/sensor installed in a building."""
    device_id: str = Field(..., min_length=2, max_length=100, description="Unique hardware ID (e.g. MAC address)")
    name: str = Field(..., min_length=2, max_length=200)
    type: DeviceType = Field(...)
    building_id: ObjectId = Field(..., description="ID of the building where device is installed")
    location: str = Field(default="", max_length=200, description="e.g. Floor 2, Room 301")
    status: DeviceStatus = Field(default=DeviceStatus.OFFLINE)
    api_key: str = Field(..., min_length=16, description="API key for device authentication")
    firmware_version: Optional[str] = Field(default=None, max_length=50)
    last_seen: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {"collection": "devices"}

from typing import Optional
from datetime import datetime
from odmantic import Field, Model, ObjectId


class Building(Model):
    """Represents a building/facility being monitored."""
    name: str = Field(..., min_length=2, max_length=200)
    address: str = Field(..., min_length=5, max_length=500)
    floors: int = Field(default=1, ge=1)
    manager_id: ObjectId = Field(..., description="ID of the building manager (User)")
    description: Optional[str] = Field(default=None, max_length=1000)
    latitude: Optional[float] = Field(default=None)
    longitude: Optional[float] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {"collection": "buildings"}

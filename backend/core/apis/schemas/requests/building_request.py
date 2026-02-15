from typing import Optional
from pydantic import BaseModel, Field


class BuildingCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=200, description="Building name")
    address: str = Field(..., min_length=5, max_length=500, description="Full address")
    floors: int = Field(default=1, ge=1, description="Number of floors")
    description: Optional[str] = Field(default=None, max_length=1000)
    latitude: Optional[float] = Field(default=None)
    longitude: Optional[float] = Field(default=None)


class BuildingUpdateRequest(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=200)
    address: Optional[str] = Field(default=None, min_length=5, max_length=500)
    floors: Optional[int] = Field(default=None, ge=1)
    description: Optional[str] = Field(default=None, max_length=1000)
    latitude: Optional[float] = Field(default=None)
    longitude: Optional[float] = Field(default=None)

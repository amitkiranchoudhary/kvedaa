from enum import Enum
from typing import Optional
from datetime import datetime
from odmantic import Field, Model
from pydantic import BaseModel, EmailStr, field_validator

class UserAddress(BaseModel):
    street_address: str = Field(..., min_length=5, max_length=200)
    city: str = Field(..., min_length=2, max_length=100)
    state: str = Field(..., min_length=2, max_length=100)
    postal_code: str = Field(..., min_length=5, max_length=10)
    country: str = Field(default="India", min_length=2, max_length=100)

class UserStatus(str, Enum):
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"
    INACTIVE = "INACTIVE"
    BLOCKED = "BLOCKED"

class User(Model):
    first_name: str = Field(..., min_length=2, max_length=50)
    last_name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr = Field(...)
    mobile_number: str = Field(..., min_length=10, max_length=15)
    hashed_password: str = Field(...)
    address: Optional[UserAddress] = Field(default=None)
    status: UserStatus = Field(default="INACTIVE")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    otp_code: Optional[str] = Field(default=None)
    otp_expires_at: Optional[datetime] = Field(default=None)

    @field_validator("mobile_number")
    @classmethod
    def validate_mobile_number(cls, value: str) -> str:
        cleaned = value.replace("+", "").replace("-", "").replace(" ", "")
        if not cleaned.isdigit():
            raise ValueError("Mobile number must contain only digits")
        return value

    model_config = {"collection": "users", "extra": "ignore"}

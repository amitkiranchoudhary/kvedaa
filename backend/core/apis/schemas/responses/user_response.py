"""
User Response Schemas Module

This module defines Pydantic schemas for user-related API responses including:
- AddressResponse: Schema for address output
- UserResponse: Schema for single user response
- UserListResponse: Schema for paginated list of users
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field

from core.models.user_model import UserStatus


class AddressResponse(BaseModel):
    """
    Schema for user address in API responses.

    Attributes:
        street_address: Street name and number
        city: City name
        state: State or province
        postal_code: ZIP or postal code
        country: Country name
    """

    street_address: str = Field(
        ..., description="Street address with house/building number"
    )
    city: str = Field(..., description="City name")
    state: str = Field(..., description="State or province")
    postal_code: str = Field(..., description="ZIP or postal code")
    country: str = Field(..., description="Country name")

    model_config = {"from_attributes": True}


class UserResponse(BaseModel):
    """
    Schema for single user response from API.

    This schema excludes sensitive data like hashed_password.

    Attributes:
        id: Unique user identifier (MongoDB ObjectId as string)
        first_name: User's first name
        last_name: User's last name
        email: User's email address
        mobile_number: User's mobile number
        address: User's physical address (if provided)
        status: Current account status
        created_at: Account creation timestamp
        updated_at: Last update timestamp
    """

    id: str = Field(..., description="Unique user identifier")
    first_name: str = Field(..., description="User's first name")
    last_name: str = Field(..., description="User's last name")
    email: EmailStr = Field(..., description="User's email address")
    mobile_number: str = Field(
        ..., description="User's mobile number with country code"
    )
    address: Optional[AddressResponse] = Field(
        default=None,
        description="User's physical address",
    )
    status: UserStatus = Field(..., description="Current account status")
    created_at: datetime = Field(..., description="Account creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    model_config = {"from_attributes": True}

    @property
    def full_name(self) -> str:
        """Get user's full name."""
        return f"{self.first_name} {self.last_name}"


class UserListResponse(BaseModel):
    """
    Schema for paginated list of users response.

    Attributes:
        users: List of user objects
        total: Total number of users matching the query
        page: Current page number (1-indexed)
        page_size: Number of users per page
        total_pages: Total number of pages
    """

    users: List[UserResponse] = Field(..., description="List of users")
    total: int = Field(..., ge=0, description="Total number of users")
    page: int = Field(..., ge=1, description="Current page number")
    page_size: int = Field(..., ge=1, le=100, description="Number of users per page")
    total_pages: int = Field(..., ge=0, description="Total number of pages")

    model_config = {"from_attributes": True}


class UserDeleteResponse(BaseModel):
    """
    Schema for user deletion response.

    Attributes:
        message: Success message
        deleted_user_id: ID of the deleted user
    """

    message: str = Field(
        default="User deleted successfully",
        description="Deletion confirmation message",
    )
    deleted_user_id: str = Field(..., description="ID of the deleted user")


class UserAuthResponse(BaseModel):
    """
    Schema for response containing user data and authentication token.
    """

    user: UserResponse
    access_token: str


class PasswordResetResponse(BaseModel):
    message: str = Field(..., description="Success message")

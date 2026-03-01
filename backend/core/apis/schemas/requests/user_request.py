"""
User Request Schemas Module

This module defines Pydantic schemas for user-related API requests including:
- AddressRequest: Schema for address input
- UserCreateRequest: Schema for creating a new user
- UserUpdateRequest: Schema for updating an existing user
"""

from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


class AddressRequest(BaseModel):
    """
    Schema for user address input in API requests.

    Attributes:
        street_address: Street name and number
        city: City name
        state: State or province
        postal_code: ZIP or postal code
        country: Country name (defaults to India)
    """

    street_address: str = Field(
        ..., min_length=5, max_length=200, description="Enter the address"
    )
    city: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="City name",
    )
    state: str = Field(
        ..., min_length=2, max_length=100, description="State or province"
    )
    postal_code: str = Field(
        ..., min_length=5, max_length=10, description="ZIP or postal code"
    )
    country: str = Field(min_length=2, max_length=100, description="Country name")


class UserCreateRequest(BaseModel):
    """
    Schema for creating a new user via API.

    This schema accepts the plain password which will be hashed
    before storing in the database.

    Attributes:
        first_name: User's first name
        last_name: User's last name
        email: User's email address (must be unique)
        mobile_number: User's mobile number with country code
        password: Plain text password (will be hashed)
        address: Optional user address
    """

    first_name: str = Field(
        ...,
        min_length=2,
        max_length=50,
        description="User's first name",
    )
    last_name: str = Field(
        ...,
        min_length=2,
        max_length=50,
        description="User's last name",
    )
    email: EmailStr = Field(
        ...,
        description="User's email address (must be unique)",
    )
    mobile_number: str = Field(
        ...,
        min_length=10,
        max_length=15,
        description="User's mobile number with country code",
    )
    password: str = Field(
        ...,
        min_length=8,
        max_length=100,
        description="User's password (min 8 characters)",
    )
    address: Optional[AddressRequest] = Field(
        default=None,
        description="User's physical address (optional)",
    )

    @field_validator("mobile_number")
    @classmethod
    def validate_mobile_number(cls, value: str) -> str:
        """Validate that mobile number contains only digits (with optional + prefix)."""
        cleaned = value.replace("+", "").replace("-", "").replace(" ", "")
        if not cleaned.isdigit():
            raise ValueError("Mobile number must contain only digits")
        return value

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        """Validate password strength."""
        if not any(char.isupper() for char in value):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(char.islower() for char in value):
            raise ValueError("Password must contain at least one lowercase letter")
        if not any(char.isdigit() for char in value):
            raise ValueError("Password must contain at least one digit")
        return value


class UserUpdateRequest(BaseModel):
    """
    Schema for updating an existing user via API.

    All fields are optional - only provided fields will be updated.

    Attributes:
        first_name: User's first name
        last_name: User's last name
        mobile_number: User's mobile number
        address: User's physical address
    """

    first_name: Optional[str] = Field(
        default=None, min_length=2, max_length=50, description="User's first name"
    )
    last_name: Optional[str] = Field(
        default=None, min_length=2, max_length=50, description="User's last name"
    )
    mobile_number: Optional[str] = Field(
        default=None,
        min_length=10,
        max_length=15,
        description="User's mobile number with country code",
    )
    address: Optional[AddressRequest] = Field(
        default=None,
        description="User's physical address",
    )
    hashed_password: Optional[str] = Field(
        default=None,
        description="hashed password",
    )
    otp_code: Optional[str] = Field(
        default=None,
        description="OTP code",
    )
    otp_expires_at: Optional[str] = Field(
        default=None,
        description="OTP expiry",
    )

    @field_validator("mobile_number")
    @classmethod
    def validate_mobile_number(cls, value: Optional[str]) -> Optional[str]:
        """Validate that mobile number contains only digits (with optional + prefix)."""
        if value is None:
            return value
        cleaned = value.replace("+", "").replace("-", "").replace(" ", "")
        if not cleaned.isdigit():
            raise ValueError("Mobile number must contain only digits")
        return value


class LoginRequest(BaseModel):
    email: str = Field(
        ...,
        description="User's email address or mobile number",
    )
    password: str = Field(
        ...,
        min_length=8,
        max_length=100,
        description="User's password (min 8 characters)",
    )


class PasswordResetRequest(BaseModel):
    old_password: str = Field(..., min_length=8, description="User's old password")
    new_password: str = Field(..., min_length=8, description="User's new password")


class ForgetPasswordRequest(BaseModel):
    email: EmailStr = Field(..., description="User's email address to send OTP")


class ResetPasswordOTPRequest(BaseModel):
    email: EmailStr = Field(..., description="User's email address")
    otp: str = Field(..., min_length=4, max_length=4, description="4-digit OTP code")
    new_password: str = Field(
        ..., min_length=8, max_length=100, description="New password"
    )
    confirm_password: str = Field(
        ..., min_length=8, max_length=100, description="Confirm new password"
    )

    @field_validator("new_password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        """Validate password strength."""
        if not any(char.isupper() for char in value):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(char.islower() for char in value):
            raise ValueError("Password must contain at least one lowercase letter")
        if not any(char.isdigit() for char in value):
            raise ValueError("Password must contain at least one digit")
        return value

"""
API Key validation for IoT device authentication.
IoT devices use API keys (not JWT tokens) to authenticate telemetry data pushes.
"""

from fastapi import Header, HTTPException, status
from commons.logger import logger

logging = logger(__name__)


async def validate_api_key(x_api_key: str = Header(..., alias="X-API-Key")):
    """
    FastAPI dependency to validate IoT device API keys.
    Devices must send their API key in the X-API-Key header.

    Usage in router:
        @router.post("/api/telemetry")
        async def push_data(data: TelemetryDataRequest, api_key: str = Depends(validate_api_key)):
            ...
    """
    if not x_api_key or len(x_api_key) < 16:
        logging.warning("Invalid API key received")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API key",
        )
    return x_api_key

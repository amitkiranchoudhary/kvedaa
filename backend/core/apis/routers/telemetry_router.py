from fastapi import APIRouter, HTTPException, Depends, Query
from commons.security import validate_api_key
from commons.auth import decodeJWT
from commons.logger import logger
from fastapi.security import OAuth2PasswordBearer
from core.controllers.telemetry_controller import TelemetryController
from core.apis.schemas.requests.telemetry_request import TelemetryDataRequest

logging = logger(__name__)

telemetry_router = APIRouter(prefix="/api/telemetry")
oauth2_schema = OAuth2PasswordBearer(tokenUrl="v1/login")


def get_authenticated_user(token: str):
    user = decodeJWT(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return user


@telemetry_router.post("/")
async def push_telemetry(
    data: TelemetryDataRequest, api_key: str = Depends(validate_api_key)
):
    """
    IoT devices push sensor data here.
    Authentication: X-API-Key header (not JWT).
    This endpoint:
      1. Validates the API key
      2. Saves telemetry data
      3. Marks device as ONLINE
      4. Evaluates alert rules
    """
    try:
        return await TelemetryController().ingest_data(data.model_dump(), api_key)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error ingesting telemetry: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@telemetry_router.get("/{device_id}")
async def get_device_telemetry(
    device_id: str,
    limit: int = Query(default=100, ge=1, le=1000),
    token: str = Depends(oauth2_schema),
):
    """Get telemetry data for a specific device."""
    try:
        get_authenticated_user(token)
        return await TelemetryController().get_device_telemetry(device_id, limit)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error getting telemetry: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@telemetry_router.get("/{device_id}/latest")
async def get_latest_reading(device_id: str, token: str = Depends(oauth2_schema)):
    """Get the most recent telemetry reading for a device."""
    try:
        get_authenticated_user(token)
        return await TelemetryController().get_latest_reading(device_id)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error getting latest telemetry: {e}")
        raise HTTPException(status_code=500, detail=str(e))

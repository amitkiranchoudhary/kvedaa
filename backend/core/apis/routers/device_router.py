from fastapi import APIRouter, HTTPException, Depends
from commons.auth import decodeJWT
from commons.logger import logger
from fastapi.security import OAuth2PasswordBearer
from core.controllers.device_controller import DeviceController
from core.apis.schemas.requests.device_request import (
    DeviceCreateRequest,
    DeviceUpdateRequest,
)

logging = logger(__name__)

device_router = APIRouter(prefix="/api/devices")
oauth2_schema = OAuth2PasswordBearer(tokenUrl="v1/login")


def get_authenticated_user(token: str):
    user = decodeJWT(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    if user.get("status") != "ACTIVE":
        raise HTTPException(status_code=401, detail="User not active")
    return user


@device_router.post("/")
async def register_device(
    request: DeviceCreateRequest, token: str = Depends(oauth2_schema)
):
    """Register a new IoT device/sensor."""
    try:
        get_authenticated_user(token)
        return await DeviceController().register_device(request.model_dump())
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error registering device: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@device_router.get("/")
async def get_all_devices(token: str = Depends(oauth2_schema)):
    """List all registered devices."""
    try:
        get_authenticated_user(token)
        return await DeviceController().get_all_devices()
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error listing devices: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@device_router.get("/building/{building_id}")
async def get_devices_by_building(
    building_id: str, token: str = Depends(oauth2_schema)
):
    """List devices for a specific building."""
    try:
        get_authenticated_user(token)
        return await DeviceController().get_devices_by_building(building_id)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error listing building devices: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@device_router.get("/{device_id}")
async def get_device(device_id: str, token: str = Depends(oauth2_schema)):
    """Get device details."""
    try:
        get_authenticated_user(token)
        return await DeviceController().get_device(device_id)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error getting device: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@device_router.get("/{device_id}/status")
async def get_device_status(device_id: str, token: str = Depends(oauth2_schema)):
    """Check if a device is online/offline."""
    try:
        get_authenticated_user(token)
        return await DeviceController().get_device_status(device_id)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error getting device status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@device_router.put("/{device_id}")
async def update_device(
    device_id: str,
    request: DeviceUpdateRequest,
    token: str = Depends(oauth2_schema),
):
    """Update device info."""
    try:
        get_authenticated_user(token)
        update_data = request.model_dump(exclude_none=True)
        return await DeviceController().update_device(device_id, update_data)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error updating device: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@device_router.delete("/{device_id}")
async def delete_device(device_id: str, token: str = Depends(oauth2_schema)):
    """Remove a device."""
    try:
        get_authenticated_user(token)
        return await DeviceController().delete_device(device_id)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error deleting device: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@device_router.post("/{device_id}/regenerate-key")
async def regenerate_api_key(device_id: str, token: str = Depends(oauth2_schema)):
    """Generate a new API key for a device."""
    try:
        get_authenticated_user(token)
        return await DeviceController().regenerate_api_key(device_id)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error regenerating API key: {e}")
        raise HTTPException(status_code=500, detail=str(e))

from fastapi import APIRouter, HTTPException, Depends
from commons.auth import decodeJWT
from commons.logger import logger
from fastapi.security import OAuth2PasswordBearer
from core.controllers.building_controller import BuildingController
from core.apis.schemas.requests.building_request import (
    BuildingCreateRequest,
    BuildingUpdateRequest,
)

logging = logger(__name__)

building_router = APIRouter(prefix="/api/buildings")
oauth2_schema = OAuth2PasswordBearer(tokenUrl="v1/login")


def get_authenticated_user(token: str):
    """Decode JWT and return user details."""
    user = decodeJWT(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    if user.get("status") != "ACTIVE":
        raise HTTPException(status_code=401, detail="User not active")
    return user


@building_router.post("/")
async def create_building(
    request: BuildingCreateRequest, token: str = Depends(oauth2_schema)
):
    try:
        user = get_authenticated_user(token)
        result = await BuildingController().create_building(
            request.model_dump(), user["id"]
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error creating building: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@building_router.get("/")
async def get_all_buildings(token: str = Depends(oauth2_schema)):
    try:
        get_authenticated_user(token)
        return await BuildingController().get_all_buildings()
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error listing buildings: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@building_router.get("/{building_id}")
async def get_building(building_id: str, token: str = Depends(oauth2_schema)):
    try:
        get_authenticated_user(token)
        return await BuildingController().get_building(building_id)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error getting building: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@building_router.put("/{building_id}")
async def update_building(
    building_id: str,
    request: BuildingUpdateRequest,
    token: str = Depends(oauth2_schema),
):
    try:
        get_authenticated_user(token)
        update_data = request.model_dump(exclude_none=True)
        return await BuildingController().update_building(building_id, update_data)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error updating building: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@building_router.delete("/{building_id}")
async def delete_building(building_id: str, token: str = Depends(oauth2_schema)):
    try:
        get_authenticated_user(token)
        return await BuildingController().delete_building(building_id)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error deleting building: {e}")
        raise HTTPException(status_code=500, detail=str(e))

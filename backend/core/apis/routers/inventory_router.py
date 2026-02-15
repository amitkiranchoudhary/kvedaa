"""
Inventory Router — PROTECTED routes for inventory management.
Part of the Owner Dashboard.
"""

from commons.auth import decodeJWT
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from core.controllers.inventory_controller import InventoryController
from core.apis.schemas.requests.farm_request import (
    InventoryCreateRequest,
    InventoryUpdateRequest,
    StockAdjustRequest,
)
from commons.logger import logger

logging = logger(__name__)

inventory_router = APIRouter(prefix="/api/farm/inventory")

oauth2_schema = OAuth2PasswordBearer(tokenUrl="v1/login")


async def get_current_user(token: str = Depends(oauth2_schema)) -> dict:
    user = decodeJWT(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    if user.get("status") != "ACTIVE":
        raise HTTPException(status_code=401, detail="User not active")
    return user


@inventory_router.post("/")
async def create_item(request: InventoryCreateRequest, user: dict = Depends(get_current_user)):
    return await InventoryController().create_item(request.model_dump(), user["id"])


@inventory_router.get("/")
async def get_all_items(category: str = None, user: dict = Depends(get_current_user)):
    return await InventoryController().get_all_items(user["id"], category)


@inventory_router.get("/low-stock")
async def get_low_stock(user: dict = Depends(get_current_user)):
    return await InventoryController().get_low_stock_alerts(user["id"])


@inventory_router.get("/{item_id}")
async def get_item(item_id: str, user: dict = Depends(get_current_user)):
    return await InventoryController().get_item(item_id)


@inventory_router.put("/{item_id}")
async def update_item(item_id: str, request: InventoryUpdateRequest,
                      user: dict = Depends(get_current_user)):
    return await InventoryController().update_item(item_id, request.model_dump(exclude_none=True))


@inventory_router.post("/{item_id}/adjust")
async def adjust_stock(item_id: str, request: StockAdjustRequest,
                       user: dict = Depends(get_current_user)):
    return await InventoryController().adjust_stock(
        item_id, user["id"], request.quantity_change,
        request.reason, request.batch_id, request.transaction_type
    )


@inventory_router.delete("/{item_id}")
async def delete_item(item_id: str, user: dict = Depends(get_current_user)):
    return await InventoryController().delete_item(item_id)

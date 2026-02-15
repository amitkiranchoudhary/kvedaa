"""
Batch Router — PROTECTED routes for batch lifecycle management.
All routes require JWT authentication.
Part of the Owner Dashboard (/dashboard).
"""

from commons.auth import decodeJWT
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from core.controllers.batch_controller import BatchController
from core.apis.schemas.requests.farm_request import (
    BatchCreateRequest,
    BatchUpdateRequest,
    BatchAdvanceStageRequest,
)
from commons.logger import logger

logging = logger(__name__)

batch_router = APIRouter(prefix="/api/farm/batches")

oauth2_schema = OAuth2PasswordBearer(tokenUrl="v1/login")


async def get_current_user(token: str = Depends(oauth2_schema)) -> dict:
    """Auth middleware — verify token and extract user details."""
    user = decodeJWT(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    if user.get("status") != "ACTIVE":
        raise HTTPException(status_code=401, detail="User not active")
    return user


@batch_router.post("/")
async def create_batch(request: BatchCreateRequest, user: dict = Depends(get_current_user)):
    """Create a new batch and auto-generate its Antennary schedule."""
    result = await BatchController().create_batch(request.model_dump(), user["id"])
    return result


@batch_router.get("/")
async def get_all_batches(user: dict = Depends(get_current_user)):
    """Get all batches for the authenticated user."""
    return await BatchController().get_all_batches(user["id"])


@batch_router.get("/active")
async def get_active_batches(user: dict = Depends(get_current_user)):
    """Get only active (non-completed, non-failed) batches."""
    return await BatchController().get_active_batches(user["id"])


@batch_router.get("/dashboard")
async def get_dashboard(user: dict = Depends(get_current_user)):
    """Get the full farm dashboard summary — batches, tasks, alerts."""
    return await BatchController().get_dashboard_summary(user["id"])


@batch_router.get("/{batch_id}")
async def get_batch(batch_id: str, user: dict = Depends(get_current_user)):
    """Get a single batch with its full schedule."""
    return await BatchController().get_batch(batch_id, user["id"])


@batch_router.put("/{batch_id}")
async def update_batch(batch_id: str, request: BatchUpdateRequest,
                       user: dict = Depends(get_current_user)):
    """Update batch details."""
    return await BatchController().update_batch(
        batch_id, request.model_dump(exclude_none=True), user["id"]
    )


@batch_router.post("/{batch_id}/advance")
async def advance_stage(batch_id: str, request: BatchAdvanceStageRequest,
                        user: dict = Depends(get_current_user)):
    """Advance a batch to the next growth stage."""
    return await BatchController().advance_batch_stage(batch_id, request.new_stage, user["id"])


@batch_router.delete("/{batch_id}")
async def delete_batch(batch_id: str, user: dict = Depends(get_current_user)):
    """Delete a batch and all its associated tasks."""
    return await BatchController().delete_batch(batch_id, user["id"])

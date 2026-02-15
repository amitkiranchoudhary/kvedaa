"""
Store Router — PUBLIC routes for the customer-facing storefront.
═══════════════════════════════════════════════════════════════
NO AUTHENTICATION REQUIRED for these routes.
These are the public /store/* endpoints visible to customers.

Also includes PROTECTED routes for product management (admin only).
"""

from commons.auth import decodeJWT
from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.security import OAuth2PasswordBearer
from core.controllers.product_controller import ProductController
from core.apis.schemas.requests.farm_request import (
    ProductCreateRequest,
    ProductUpdateRequest,
)
from commons.logger import logger

logging = logger(__name__)

store_router = APIRouter()

oauth2_schema = OAuth2PasswordBearer(tokenUrl="v1/login", auto_error=False)


async def get_current_user_optional(token: str = Depends(oauth2_schema)):
    """Optional auth — returns None if no token provided."""
    if not token:
        return None
    user = decodeJWT(token)
    return user


async def get_current_user_required(token: str = Depends(oauth2_schema)):
    """Required auth — raises 401 if no valid token."""
    if not token:
        raise HTTPException(status_code=401, detail="Authentication required")
    user = decodeJWT(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    if user.get("status") != "ACTIVE":
        raise HTTPException(status_code=401, detail="User not active")
    return user


# ═══════════════════════════════════════════════════════════════
# PUBLIC ROUTES — No authentication needed
# These are what customers see on the storefront
# ═══════════════════════════════════════════════════════════════

@store_router.get("/store/products", tags=["Public Store"])
async def public_product_list():
    """
    PUBLIC: Get all active products for the storefront.
    Includes traceability data but NOT trade secrets.
    """
    return await ProductController().get_public_products()


@store_router.get("/store/products/{product_id}", tags=["Public Store"])
async def public_product_detail(product_id: str):
    """
    PUBLIC: Get a single product's public details.
    """
    controller = ProductController()
    products = await controller.get_public_products()
    for p in products:
        if p["id"] == product_id:
            return p
    raise HTTPException(status_code=404, detail="Product not found")


# ═══════════════════════════════════════════════════════════════
# PROTECTED ROUTES — Admin product management
# ═══════════════════════════════════════════════════════════════

@store_router.post("/api/farm/products", tags=["Product Management"])
async def create_product(request: ProductCreateRequest,
                         user: dict = Depends(get_current_user_required)):
    return await ProductController().create_product(request.model_dump(), user["id"])


@store_router.get("/api/farm/products", tags=["Product Management"])
async def get_all_products(user: dict = Depends(get_current_user_required)):
    return await ProductController().get_all_products(user["id"])


@store_router.get("/api/farm/products/{product_id}", tags=["Product Management"])
async def get_product(product_id: str, user: dict = Depends(get_current_user_required)):
    return await ProductController().get_product(product_id)


@store_router.put("/api/farm/products/{product_id}", tags=["Product Management"])
async def update_product(product_id: str, request: ProductUpdateRequest,
                         user: dict = Depends(get_current_user_required)):
    return await ProductController().update_product(
        product_id, request.model_dump(exclude_none=True), user["id"]
    )


@store_router.delete("/api/farm/products/{product_id}", tags=["Product Management"])
async def delete_product(product_id: str, user: dict = Depends(get_current_user_required)):
    return await ProductController().delete_product(product_id, user["id"])

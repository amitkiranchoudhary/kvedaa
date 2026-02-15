from typing import List
from fastapi import APIRouter, Depends, Query, Request
from fastapi.security import OAuth2PasswordBearer
from odmantic import AIOEngine

from core.database.database import get_engine
from core.controllers.order_controller import OrderController
from core.apis.schemas.requests.order_request import OrderCreate, OrderUpdate
from core.apis.schemas.responses.order_response import OrderResponse
from commons.auth import decodeJWT

router = APIRouter(
    prefix="/orders",
    tags=["Orders"],
    responses={404: {"description": "Not found"}},
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="v1/login")

order_controller = OrderController()


@router.post("/", response_model=OrderResponse)
async def create_order(
    request: OrderCreate,
    token: str = Depends(oauth2_scheme),
    engine: AIOEngine = Depends(get_engine),
):
    decoded_token = decodeJWT(token)
    if not decoded_token:
        # In a real app, middleware handles this, but for extra safety:
        from fastapi import HTTPException, status

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )

    user_id = decoded_token.get("id")
    return await order_controller.create_order(request, user_id, engine)


@router.get("/", response_model=List[OrderResponse])
async def list_orders(
    skip: int = 0,
    limit: int = 10,
    populate: bool = Query(True, description="Populate user details"),
    engine: AIOEngine = Depends(get_engine),
):
    return await order_controller.get_all_orders(engine, skip, limit, populate)


@router.get("/my", response_model=List[OrderResponse])
async def get_my_orders(
    token: str = Depends(oauth2_scheme), engine: AIOEngine = Depends(get_engine)
):
    decoded_token = decodeJWT(token)
    user_id = decoded_token.get("id")
    return await order_controller.get_user_orders(user_id, engine)


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order_by_id(order_id: str, engine: AIOEngine = Depends(get_engine)):
    return await order_controller.get_order(order_id, engine)


@router.put("/{order_id}", response_model=OrderResponse)
async def update_order(
    order_id: str, request: OrderUpdate, engine: AIOEngine = Depends(get_engine)
):
    return await order_controller.update_order(order_id, request, engine)


@router.delete("/{order_id}")
async def delete_order(order_id: str, engine: AIOEngine = Depends(get_engine)):
    return await order_controller.delete_order(order_id, engine)

from typing import List, Optional
from fastapi import HTTPException, status
from odmantic import AIOEngine, ObjectId

from core.models.order_model import Order
from core.models.user_model import User
from core.cruds.order_crud import OrderCRUD
from core.apis.schemas.requests.order_request import OrderCreate, OrderUpdate
from core.apis.schemas.responses.order_response import OrderResponse


from core import logger

logging = logger(__name__)


class OrderController:
    def __init__(self):
        self.order_crud = OrderCRUD()

    async def create_order(
        self, request: OrderCreate, user_id: str, engine: AIOEngine
    ) -> OrderResponse:
        try:
            logging.info("Executing OrderController.create_order")
            # Verify user exists? Usually done implicitly by auth, but good safety
            # We assume user_id comes from a valid token

            new_order = Order(
                user_id=ObjectId(user_id),
                items=request.items,
                total_amount=request.total_amount,
            )

            created_order = await self.order_crud.create_order(engine, new_order)
            return OrderResponse(
                id=str(created_order.id),
                user_id=str(created_order.user_id),
                items=created_order.items,
                total_amount=created_order.total_amount,
                status=created_order.status,
                created_at=created_order.created_at,
                updated_at=created_order.updated_at,
            )
        except Exception as e:
            logging.error(f"Error creating order: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error creating order: {str(e)}",
            )

    async def get_all_orders(
        self, engine: AIOEngine, skip: int = 0, limit: int = 10, populate: bool = False
    ) -> List[OrderResponse]:
        try:
            logging.info("Executing OrderController.get_all_orders")
            orders = await self.order_crud.get_all_orders(engine, skip, limit)
            result = []

            # Populate data logic
            for order in orders:
                user_details = None
                if populate:
                    user = await engine.find_one(User, User.id == order.user_id)
                    if user:
                        user_details = {
                            "first_name": user.first_name,
                            "last_name": user.last_name,
                            "email": user.email,
                        }

                result.append(
                    OrderResponse(
                        id=str(order.id),
                        user_id=str(order.user_id),
                        items=order.items,
                        total_amount=order.total_amount,
                        status=order.status,
                        created_at=order.created_at,
                        updated_at=order.updated_at,
                        user_details=user_details,
                    )
                )
            return result
        except Exception as e:
            logging.error(f"Error retrieving orders: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error retrieving orders: {str(e)}",
            )

    async def get_user_orders(
        self, user_id: str, engine: AIOEngine
    ) -> List[OrderResponse]:
        try:
            logging.info("Executing OrderController.get_user_orders")
            orders = await self.order_crud.get_orders_by_user_id(engine, user_id)
            return [
                OrderResponse(
                    id=str(order.id),
                    user_id=str(order.user_id),
                    items=order.items,
                    total_amount=order.total_amount,
                    status=order.status,
                    created_at=order.created_at,
                    updated_at=order.updated_at,
                )
                for order in orders
            ]
        except Exception as e:
            logging.error(f"Error retrieving user orders: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error retrieving user orders: {str(e)}",
            )

    async def get_order(self, order_id: str, engine: AIOEngine) -> OrderResponse:
        try:
            logging.info("Executing OrderController.get_order")
            order = await self.order_crud.get_order_by_id(engine, order_id)
            if not order:
                logging.info("Order not found")
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, detail="Order not found"
                )

            return OrderResponse(
                id=str(order.id),
                user_id=str(order.user_id),
                items=order.items,
                total_amount=order.total_amount,
                status=order.status,
                created_at=order.created_at,
                updated_at=order.updated_at,
            )
        except Exception as e:
            logging.error(f"Error retrieving order: {str(e)}")
            raise e

    async def update_order(
        self, order_id: str, request: OrderUpdate, engine: AIOEngine
    ) -> OrderResponse:
        try:
            logging.info("Executing OrderController.update_order")
            update_data = request.model_dump(exclude_unset=True)
            updated_order = await self.order_crud.update_order(
                engine, order_id, update_data
            )

            if not updated_order:
                logging.info("Order not found for update")
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, detail="Order not found"
                )

            return OrderResponse(
                id=str(updated_order.id),
                user_id=str(updated_order.user_id),
                items=updated_order.items,
                total_amount=updated_order.total_amount,
                status=updated_order.status,
                created_at=updated_order.created_at,
                updated_at=updated_order.updated_at,
            )
        except Exception as e:
            logging.error(f"Error updating order: {str(e)}")
            raise e

    async def delete_order(self, order_id: str, engine: AIOEngine):
        try:
            logging.info("Executing OrderController.delete_order")
            success = await self.order_crud.delete_order(engine, order_id)
            if not success:
                logging.info("Order not found for deletion")
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, detail="Order not found"
                )
            return {"detail": "Order deleted successfully"}
        except Exception as e:
            logging.error(f"Error deleting order: {str(e)}")
            raise e

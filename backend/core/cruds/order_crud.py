from typing import List, Optional
from odmantic import ObjectId
from core.models.order_model import Order, OrderStatus
from core.models.user_model import User
from commons.logger import logger

logging = logger(__name__)


class OrderCRUD:
    async def create_order(self, engine, order_data: Order) -> Order:
        logging.info(f"Creating new order for user {order_data.user_id}")
        await engine.save(order_data)
        logging.info(f"Order created successfully: {order_data.id}")
        return order_data

    async def get_all_orders(
        self, engine, skip: int = 0, limit: int = 10
    ) -> List[Order]:
        logging.info(f"Fetching all orders with skip={skip}, limit={limit}")
        orders = await engine.find(
            Order, skip=skip, limit=limit, sort=Order.created_at.desc()
        )
        logging.info(f"Found {len(orders)} orders")
        return orders

    async def get_order_by_id(self, engine, order_id: str) -> Optional[Order]:
        try:
            logging.debug(f"Fetching order by ID: {order_id}")
            oid = ObjectId(order_id)
            order = await engine.find_one(Order, Order.id == oid)
            if order:
                logging.info(f"Order found: {order_id}")
            else:
                log.warning(f"Order not found: {order_id}")
            return order
        except Exception as e:
            logging.error(f"Error fetching order {order_id}: {e}")
            return None

    async def get_orders_by_user_id(self, engine, user_id: str) -> List[Order]:
        try:
            logging.info(f"Fetching orders for user: {user_id}")
            uid = ObjectId(user_id)
            orders = await engine.find(
                Order, Order.user_id == uid, sort=Order.created_at.desc()
            )
            logging.info(f"Found {len(orders)} orders for user {user_id}")
            return orders
        except Exception as e:
            log.error(f"Error fetching orders for user {user_id}: {e}")
            return []

    async def update_order(
        self, engine, order_id: str, update_data: dict
    ) -> Optional[Order]:
        logging.info(f"Updating order {order_id} with data: {update_data}")
        order = await self.get_order_by_id(engine, order_id)
        if not order:
            logging.warning(f"Update failed: Order {order_id} not found")
            return None

        for key, value in update_data.items():
            if value is not None:
                setattr(order, key, value)

        await engine.save(order)
        logging.info(f"Order {order_id} updated successfully")
        return order

    async def delete_order(self, engine, order_id: str) -> bool:
        logging.info(f"Deleting order {order_id}")
        order = await self.get_order_by_id(engine, order_id)
        if not order:
            logging.warning(f"Delete failed: Order {order_id} not found")
            return False
        await engine.delete(order)
        logging.info(f"Order {order_id} deleted successfully")
        return True

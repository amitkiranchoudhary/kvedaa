"""
Inventory Controller — Business logic for inventory management.
"""

from core.cruds.inventory_crud import InventoryCRUD
from fastapi import HTTPException
from core import logger

logging = logger(__name__)


class InventoryController:
    def __init__(self):
        self.crud = InventoryCRUD()

    async def create_item(self, item_data: dict, user_id: str):
        try:
            item_data["user_id"] = user_id
            item = await self.crud.create(item_data)
            d = item.model_dump()
            d["id"] = str(item.id)
            d["user_id"] = str(item.user_id)
            return d
        except Exception as e:
            logging.error(f"Error creating inventory item: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    async def get_all_items(self, user_id: str, category: str = None):
        try:
            items = await self.crud.get_all(user_id, category)
            result = []
            for i in items:
                d = i.model_dump()
                d["id"] = str(i.id)
                d["user_id"] = str(i.user_id)
                if i.batch_id:
                    d["batch_id"] = str(i.batch_id)
                d["is_low_stock"] = i.quantity <= i.low_stock_threshold
                result.append(d)
            return result
        except Exception as e:
            logging.error(f"Error getting inventory: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    async def get_item(self, item_id: str):
        try:
            item = await self.crud.get_by_id(item_id)
            if not item:
                raise HTTPException(status_code=404, detail="Item not found")
            d = item.model_dump()
            d["id"] = str(item.id)
            d["user_id"] = str(item.user_id)
            return d
        except HTTPException:
            raise
        except Exception as e:
            logging.error(f"Error getting inventory item: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    async def update_item(self, item_id: str, update_data: dict):
        try:
            item = await self.crud.update(item_id, update_data)
            if not item:
                raise HTTPException(status_code=404, detail="Item not found")
            d = item.model_dump()
            d["id"] = str(item.id)
            d["user_id"] = str(item.user_id)
            return d
        except HTTPException:
            raise
        except Exception as e:
            logging.error(f"Error updating inventory item: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    async def adjust_stock(self, item_id: str, user_id: str, quantity_change: float,
                           reason: str = None, batch_id: str = None, transaction_type: str = "ADJUST"):
        try:
            item = await self.crud.adjust_stock(
                item_id, user_id, quantity_change, reason, batch_id, transaction_type
            )
            if not item:
                raise HTTPException(status_code=404, detail="Item not found")
            d = item.model_dump()
            d["id"] = str(item.id)
            d["user_id"] = str(item.user_id)
            return d
        except HTTPException:
            raise
        except Exception as e:
            logging.error(f"Error adjusting stock: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    async def get_low_stock_alerts(self, user_id: str):
        try:
            items = await self.crud.get_low_stock_items(user_id)
            result = []
            for i in items:
                d = i.model_dump()
                d["id"] = str(i.id)
                d["user_id"] = str(i.user_id)
                result.append(d)
            return result
        except Exception as e:
            logging.error(f"Error getting low stock alerts: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    async def delete_item(self, item_id: str):
        try:
            deleted = await self.crud.delete(item_id)
            if not deleted:
                raise HTTPException(status_code=404, detail="Item not found")
            return {"message": "Item deleted"}
        except HTTPException:
            raise
        except Exception as e:
            logging.error(f"Error deleting inventory item: {e}")
            raise HTTPException(status_code=500, detail=str(e))

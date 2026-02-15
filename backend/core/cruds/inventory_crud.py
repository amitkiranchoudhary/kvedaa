"""
Inventory CRUD — Database operations for inventory items and transactions.
"""

from datetime import datetime
from typing import Optional, List
from odmantic import ObjectId
from core.database.database import get_engine
from core.models.inventory_model import (
    InventoryItem, InventoryTransaction, InventoryCategory
)
from core import logger

logging = logger(__name__)


class InventoryCRUD:
    """CRUD operations for inventory items."""

    async def create(self, item_data: dict) -> InventoryItem:
        """Create a new inventory item."""
        logging.info("Executing InventoryCRUD.create")
        engine = get_engine()
        item = InventoryItem(**item_data)
        await engine.save(item)
        logging.info(f"Created inventory item: {item.name} (ID: {item.id})")
        return item

    async def get_all(self, user_id: str, category: Optional[str] = None,
                      skip: int = 0, limit: int = 50) -> List[InventoryItem]:
        """Get all inventory items for a user, optionally filtered by category."""
        logging.info(f"Executing InventoryCRUD.get_all for user: {user_id}")
        engine = get_engine()
        query = InventoryItem.user_id == ObjectId(user_id)
        if category:
            query = query & (InventoryItem.category == category)
        items = await engine.find(InventoryItem, query, skip=skip, limit=limit)
        return items

    async def get_by_id(self, item_id: str) -> Optional[InventoryItem]:
        """Get a single inventory item by ID."""
        engine = get_engine()
        return await engine.find_one(InventoryItem, InventoryItem.id == ObjectId(item_id))

    async def update(self, item_id: str, update_data: dict) -> Optional[InventoryItem]:
        """Update an inventory item."""
        engine = get_engine()
        item = await engine.find_one(InventoryItem, InventoryItem.id == ObjectId(item_id))
        if not item:
            return None
        for key, value in update_data.items():
            if value is not None and hasattr(item, key):
                setattr(item, key, value)
        item.updated_at = datetime.utcnow()
        await engine.save(item)
        return item

    async def adjust_stock(self, item_id: str, user_id: str, quantity_change: float,
                           reason: str = None, batch_id: str = None,
                           transaction_type: str = "ADJUST") -> Optional[InventoryItem]:
        """
        Adjust stock level for an item and record the transaction.
        Positive quantity_change = ADD, Negative = DEDUCT.
        """
        engine = get_engine()
        item = await engine.find_one(InventoryItem, InventoryItem.id == ObjectId(item_id))
        if not item:
            return None

        new_quantity = item.quantity + quantity_change
        if new_quantity < 0:
            new_quantity = 0  # Don't allow negative stock

        item.quantity = new_quantity
        item.updated_at = datetime.utcnow()
        await engine.save(item)

        # Record transaction
        txn = InventoryTransaction(
            item_id=item.id,
            user_id=ObjectId(user_id),
            batch_id=ObjectId(batch_id) if batch_id else None,
            transaction_type=transaction_type,
            quantity_change=quantity_change,
            quantity_after=new_quantity,
            reason=reason,
        )
        await engine.save(txn)

        logging.info(f"Stock adjusted for {item.name}: {quantity_change:+.2f} → {new_quantity}")
        return item

    async def get_low_stock_items(self, user_id: str) -> List[InventoryItem]:
        """Get items where quantity is at or below the low_stock_threshold."""
        engine = get_engine()
        items = await engine.find(
            InventoryItem,
            InventoryItem.user_id == ObjectId(user_id)
        )
        # Filter in Python since odmantic doesn't support field-to-field comparison easily
        return [i for i in items if i.quantity <= i.low_stock_threshold]

    async def get_transactions(self, item_id: str, limit: int = 50) -> List[InventoryTransaction]:
        """Get transaction history for an item."""
        engine = get_engine()
        return await engine.find(
            InventoryTransaction,
            InventoryTransaction.item_id == ObjectId(item_id),
            sort=InventoryTransaction.timestamp.desc(),
            limit=limit
        )

    async def delete(self, item_id: str) -> bool:
        """Delete an inventory item."""
        engine = get_engine()
        item = await engine.find_one(InventoryItem, InventoryItem.id == ObjectId(item_id))
        if not item:
            return False
        await engine.delete(item)
        return True

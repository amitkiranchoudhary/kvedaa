"""
Inventory Model (Part of the "Antennary" System)
==================================================
Tracks both consumable materials and finished product inventory.

Consumables: Rice, Peptone, Jars, Spores, Alcohol, etc.
Finished Product: Dried Cordyceps (grams), Capsules, Tinctures, etc.

Integrates with Batch lifecycle — when a batch is created, consumables are deducted.
When a batch is harvested, finished product is added.
"""

from enum import Enum
from typing import Optional
from datetime import datetime
from odmantic import Field, Model, ObjectId


class InventoryCategory(str, Enum):
    """Classification of inventory items."""
    CONSUMABLE = "CONSUMABLE"           # Raw materials used in cultivation
    FINISHED_PRODUCT = "FINISHED_PRODUCT"  # Products ready for sale


class InventoryUnit(str, Enum):
    """Standard units of measurement."""
    GRAMS = "g"
    KILOGRAMS = "kg"
    LITERS = "L"
    MILLILITERS = "mL"
    UNITS = "units"     # For jars, bags, syringes, etc.
    PIECES = "pcs"


class InventoryItem(Model):
    """
    A single inventory item — either a consumable or finished product.
    """
    # ── Identity ──
    name: str = Field(..., min_length=2, max_length=200,
                      description="Item name, e.g. 'Brown Rice', 'Dried Cordyceps'")
    sku: Optional[str] = Field(default=None, max_length=50,
                                description="Stock Keeping Unit code")
    category: InventoryCategory = Field(...,
                                         description="CONSUMABLE or FINISHED_PRODUCT")
    user_id: ObjectId = Field(..., description="Owner of this inventory item")

    # ── Stock Tracking ──
    quantity: float = Field(default=0.0, ge=0,
                            description="Current quantity in stock")
    unit: InventoryUnit = Field(default=InventoryUnit.GRAMS)
    low_stock_threshold: float = Field(default=0.0, ge=0,
                                        description="Alert when stock falls below this level")

    # ── Cost Tracking ──
    cost_per_unit: Optional[float] = Field(default=None, ge=0,
                                            description="Cost per unit for consumables")
    sale_price_per_unit: Optional[float] = Field(default=None, ge=0,
                                                  description="Sale price for finished products")

    # ── Metadata ──
    supplier: Optional[str] = Field(default=None, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    batch_id: Optional[ObjectId] = Field(default=None,
                                          description="Linked batch for finished products")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {"collection": "inventory"}


class InventoryTransaction(Model):
    """
    Tracks every stock movement — additions, deductions, adjustments.
    Provides a full audit trail for inventory changes.
    """
    item_id: ObjectId = Field(..., description="The inventory item affected")
    user_id: ObjectId = Field(..., description="Who performed the transaction")
    batch_id: Optional[ObjectId] = Field(default=None,
                                          description="Linked batch, if applicable")
    transaction_type: str = Field(..., description="ADD, DEDUCT, ADJUST, HARVEST")
    quantity_change: float = Field(..., description="Positive for additions, negative for deductions")
    quantity_after: float = Field(..., description="Stock level after this transaction")
    reason: Optional[str] = Field(default=None, max_length=500)
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    model_config = {"collection": "inventory_transactions"}

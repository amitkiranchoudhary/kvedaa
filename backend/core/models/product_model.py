"""
Product Model — Public Storefront
===================================
Products listed on the public /store route.
Linked to Batches for traceability ("Quality Feature").

Only SAFE data is exposed publicly:
  - Harvest date
  - Strain name
  - Product weight
  - Quality grade

NOT exposed publicly:
  - Exact cultivation parameters
  - Substrate recipe details
  - Spore source
  - Internal notes
"""

from enum import Enum
from typing import Optional, List
from datetime import datetime
from odmantic import Field, Model, ObjectId


class ProductCategory(str, Enum):
    """Types of finished Cordyceps products."""
    DRIED_WHOLE = "DRIED_WHOLE"
    DRIED_POWDER = "DRIED_POWDER"
    CAPSULES = "CAPSULES"
    TINCTURE = "TINCTURE"
    EXTRACT = "EXTRACT"
    RAW_FRESH = "RAW_FRESH"


class ProductStatus(str, Enum):
    """Product availability status."""
    DRAFT = "DRAFT"             # Not yet visible
    ACTIVE = "ACTIVE"           # Listed and available
    OUT_OF_STOCK = "OUT_OF_STOCK"
    DISCONTINUED = "DISCONTINUED"


class Product(Model):
    """
    A product listed on the public storefront.
    Can be linked to a batch for traceability.
    """
    # ── Identity ──
    name: str = Field(..., min_length=2, max_length=200)
    slug: Optional[str] = Field(default=None, max_length=200,
                                 description="URL-friendly product name")
    description: str = Field(default="", max_length=5000)
    category: ProductCategory = Field(default=ProductCategory.DRIED_WHOLE)
    status: ProductStatus = Field(default=ProductStatus.DRAFT)

    # ── Pricing ──
    price: float = Field(..., gt=0, description="Price per unit in INR")
    compare_at_price: Optional[float] = Field(default=None, ge=0,
                                                description="Original price for showing discount")
    weight_grams: float = Field(default=0, ge=0, description="Product weight in grams")

    # ── Stock ──
    stock_quantity: int = Field(default=0, ge=0)
    allow_backorder: bool = Field(default=False)

    # ── Traceability (The "Quality" Feature) ──
    batch_id: Optional[ObjectId] = Field(default=None,
                                          description="Linked batch for traceability")
    strain: Optional[str] = Field(default=None, max_length=50,
                                   description="Strain name shown to customers (e.g. CM-1)")
    harvest_date: Optional[datetime] = Field(default=None,
                                               description="When this batch was harvested")
    quality_grade: Optional[str] = Field(default=None, max_length=20,
                                          description="Quality grade: A+, A, B, etc.")
    lab_tested: bool = Field(default=False)
    certifications: Optional[List[str]] = Field(default=None,
                                                  description="e.g. ['Organic', 'Lab Tested', 'GMP']")

    # ── Media ──
    image_urls: Optional[List[str]] = Field(default=None)

    # ── Owner ──
    user_id: ObjectId = Field(..., description="Store owner")

    # ── Metadata ──
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {"collection": "products"}

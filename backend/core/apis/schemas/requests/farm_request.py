"""Request schemas for Batch, Inventory, Schedule, and Product endpoints."""

from typing import Optional, Dict, List
from datetime import datetime
from pydantic import BaseModel, Field


# ─── BATCH REQUESTS ───

class BatchCreateRequest(BaseModel):
    batch_number: str = Field(..., min_length=1, max_length=50)
    strain: str = Field(default="CM-1", max_length=50)
    substrate: str = Field(default="Brown Rice + Peptone", max_length=200)
    jar_count: int = Field(default=12, ge=1, le=1000)
    spore_source: Optional[str] = None
    inoculation_date: Optional[datetime] = None
    expected_yield_grams: Optional[float] = None
    notes: Optional[str] = None
    tags: Optional[List[str]] = None
    is_public: bool = False
    stage_overrides: Optional[Dict] = None


class BatchUpdateRequest(BaseModel):
    strain: Optional[str] = None
    substrate: Optional[str] = None
    jar_count: Optional[int] = None
    spore_source: Optional[str] = None
    expected_yield_grams: Optional[float] = None
    actual_yield_grams: Optional[float] = None
    notes: Optional[str] = None
    tags: Optional[List[str]] = None
    is_public: Optional[bool] = None
    batch_status: Optional[str] = None
    stage_overrides: Optional[Dict] = None


class BatchAdvanceStageRequest(BaseModel):
    new_stage: str = Field(..., description="Target stage: INOCULATION, INCUBATION, FRUITING, HARVEST, COMPLETED, FAILED")


# ─── INVENTORY REQUESTS ───

class InventoryCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    sku: Optional[str] = None
    category: str = Field(..., description="CONSUMABLE or FINISHED_PRODUCT")
    quantity: float = Field(default=0.0, ge=0)
    unit: str = Field(default="g")
    low_stock_threshold: float = Field(default=0.0, ge=0)
    cost_per_unit: Optional[float] = None
    sale_price_per_unit: Optional[float] = None
    supplier: Optional[str] = None
    description: Optional[str] = None


class InventoryUpdateRequest(BaseModel):
    name: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    low_stock_threshold: Optional[float] = None
    cost_per_unit: Optional[float] = None
    sale_price_per_unit: Optional[float] = None
    supplier: Optional[str] = None
    description: Optional[str] = None


class StockAdjustRequest(BaseModel):
    quantity_change: float = Field(..., description="Positive to add, negative to deduct")
    reason: Optional[str] = None
    batch_id: Optional[str] = None
    transaction_type: str = Field(default="ADJUST", description="ADD, DEDUCT, ADJUST, HARVEST")


# ─── PRODUCT REQUESTS ───

class ProductCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    slug: Optional[str] = None
    description: str = Field(default="", max_length=5000)
    category: str = Field(default="DRIED_WHOLE")
    price: float = Field(..., gt=0)
    compare_at_price: Optional[float] = None
    weight_grams: float = Field(default=0, ge=0)
    stock_quantity: int = Field(default=0, ge=0)
    allow_backorder: bool = False
    batch_id: Optional[str] = None
    strain: Optional[str] = None
    harvest_date: Optional[datetime] = None
    quality_grade: Optional[str] = None
    lab_tested: bool = False
    certifications: Optional[List[str]] = None
    image_urls: Optional[List[str]] = None
    status: str = Field(default="DRAFT")


class ProductUpdateRequest(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    compare_at_price: Optional[float] = None
    weight_grams: Optional[float] = None
    stock_quantity: Optional[int] = None
    allow_backorder: Optional[bool] = None
    batch_id: Optional[str] = None
    strain: Optional[str] = None
    harvest_date: Optional[datetime] = None
    quality_grade: Optional[str] = None
    lab_tested: Optional[bool] = None
    certifications: Optional[List[str]] = None
    image_urls: Optional[List[str]] = None
    status: Optional[str] = None


# ─── TASK REQUESTS ───

class TaskUpdateRequest(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None

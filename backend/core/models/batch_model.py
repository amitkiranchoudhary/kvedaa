"""
Cordyceps Cultivation Batch Model
==================================
Represents a single batch of Cordyceps Militaris going through the 5-stage growth lifecycle.
Each batch auto-generates a schedule of tasks via the "Antennary" system.

Biological Lifecycle (Cordyceps Militaris):
-------------------------------------------
Stage 1 - Substrate Prep   (Day 0)      : Sterilize jars at 15 PSI
Stage 2 - Inoculation      (Day 1)      : Inject liquid culture in sterile flow hood
Stage 3 - Incubation       (Days 2-10)  : 20°C, 65% humidity, NO LIGHT (Dark Run)
Stage 4 - Fruiting          (Days 11-45) : 16-18°C, 80% humidity, 12h/12h light cycle (Light Run)
Stage 5 - Harvest           (Days 45-60) : Harvest when club heads form spores
"""

from enum import Enum
from typing import Optional, Dict, List
from datetime import datetime
from odmantic import Field, Model, ObjectId
from pydantic import BaseModel


class GrowthStage(str, Enum):
    """
    The 5 biological stages of Cordyceps Militaris cultivation.
    Each stage has specific environmental requirements.
    """
    SUBSTRATE_PREP = "SUBSTRATE_PREP"   # Day 0: Sterilize jars
    INOCULATION = "INOCULATION"         # Day 1: Inject liquid culture
    INCUBATION = "INCUBATION"           # Days 2-10: Dark run (no light)
    FRUITING = "FRUITING"               # Days 11-45: Light run (12h/12h)
    HARVEST = "HARVEST"                 # Days 45-60: Harvest formed spores
    COMPLETED = "COMPLETED"             # Post-harvest, batch is done
    FAILED = "FAILED"                   # Contamination or failure


class BatchStatus(str, Enum):
    """Overall batch health status."""
    HEALTHY = "HEALTHY"
    AT_RISK = "AT_RISK"         # Something needs attention
    CONTAMINATED = "CONTAMINATED"
    COMPLETED = "COMPLETED"


class StageParameters(BaseModel):
    """
    Per-stage environmental parameters that can be customized per batch.
    These override the defaults defined in DEFAULT_STAGE_CONFIG.
    """
    temperature_min: Optional[float] = None   # °C
    temperature_max: Optional[float] = None   # °C
    humidity_pct: Optional[float] = None      # % relative humidity
    light_hours: Optional[float] = None       # hours of light per day (0 = dark)
    duration_days: Optional[int] = None       # how many days this stage lasts
    notes: Optional[str] = None               # custom notes for this stage


# ─── DEFAULT BIOLOGICAL PARAMETERS ───
# These are the standard Cordyceps Militaris growth parameters.
# Each batch can override these via stage_overrides.
DEFAULT_STAGE_CONFIG = {
    GrowthStage.SUBSTRATE_PREP: {
        "day_start": 0,
        "day_end": 0,
        "duration_days": 1,
        "temperature_min": 20.0,
        "temperature_max": 25.0,
        "humidity_pct": 50.0,
        "light_hours": 0,
        "task": "Sterilize jars at 15 PSI for 90 minutes",
        "alert": None,
    },
    GrowthStage.INOCULATION: {
        "day_start": 1,
        "day_end": 1,
        "duration_days": 1,
        "temperature_min": 20.0,
        "temperature_max": 25.0,
        "humidity_pct": 50.0,
        "light_hours": 0,
        "task": "Inject liquid culture in sterile flow hood",
        "alert": None,
    },
    GrowthStage.INCUBATION: {
        "day_start": 2,
        "day_end": 10,
        "duration_days": 9,
        "temperature_min": 19.0,
        "temperature_max": 21.0,
        "humidity_pct": 65.0,
        "light_hours": 0,  # NO LIGHT - Dark Run
        "task": "Monitor mycelium growth, check for contamination daily",
        "alert": "Keep temp at 20°C, Humidity 65%. NO LIGHT.",
    },
    GrowthStage.FRUITING: {
        "day_start": 11,
        "day_end": 45,
        "duration_days": 35,
        "temperature_min": 16.0,
        "temperature_max": 18.0,
        "humidity_pct": 80.0,
        "light_hours": 12,  # 12h/12h light cycle - Light Run
        "task": "Monitor fruiting body development, maintain humidity",
        "alert": "Introduce 12h/12h light cycle. Drop Temp to 16-18°C. Increase Humidity to 80%.",
    },
    GrowthStage.HARVEST: {
        "day_start": 45,
        "day_end": 60,
        "duration_days": 16,
        "temperature_min": 16.0,
        "temperature_max": 20.0,
        "humidity_pct": 70.0,
        "light_hours": 12,
        "task": "Harvest when club heads form spores. Dry and weigh.",
        "alert": "Club heads should be forming spores. Check daily.",
    },
}


class Batch(Model):
    """
    A single cultivation batch of Cordyceps Militaris.
    Linked to an owner (user_id), and tracks the entire lifecycle.
    """
    # ── Identity ──
    batch_number: str = Field(..., min_length=1, max_length=50,
                              description="Human-readable batch ID, e.g. BATCH-2026-001")
    user_id: ObjectId = Field(..., description="Owner/cultivator who created this batch")

    # ── Biological Data ──
    strain: str = Field(default="CM-1", max_length=50,
                        description="Cordyceps strain identifier, e.g. CM-1, CM-Orange")
    substrate: str = Field(default="Brown Rice + Peptone", max_length=200,
                           description="Substrate composition used for this batch")
    jar_count: int = Field(default=12, ge=1, le=1000,
                           description="Number of jars/containers in this batch")
    spore_source: Optional[str] = Field(default=None, max_length=200,
                                         description="Source of spores/liquid culture")

    # ── Lifecycle State ──
    current_stage: GrowthStage = Field(default=GrowthStage.SUBSTRATE_PREP,
                                        description="Current biological growth stage")
    batch_status: BatchStatus = Field(default=BatchStatus.HEALTHY)
    inoculation_date: Optional[datetime] = Field(default=None,
                                                   description="Date inoculation was performed (Day 1)")
    started_at: datetime = Field(default_factory=datetime.utcnow,
                                  description="Date batch was created (Day 0)")
    completed_at: Optional[datetime] = Field(default=None,
                                               description="Date batch was completed/harvested")

    # ── Yield Data ──
    expected_yield_grams: Optional[float] = Field(default=None, ge=0,
                                                    description="Estimated dry yield in grams")
    actual_yield_grams: Optional[float] = Field(default=None, ge=0,
                                                  description="Actual harvested dry weight in grams")

    # ── Per-Stage Parameter Overrides ──
    # Keys are GrowthStage enum values, values are StageParameters
    stage_overrides: Optional[Dict[str, StageParameters]] = Field(
        default=None,
        description="Custom parameter overrides per stage. Keys: SUBSTRATE_PREP, INCUBATION, etc."
    )

    # ── Metadata ──
    notes: Optional[str] = Field(default=None, max_length=2000)
    tags: Optional[List[str]] = Field(default=None, description="Tags for filtering, e.g. ['organic', 'trial']")
    is_public: bool = Field(default=False,
                            description="If True, safe batch data is visible on the public storefront")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {"collection": "batches"}

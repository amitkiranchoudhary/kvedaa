"""
Schedule / Task Model — The "Antennary" Engine
================================================
The Antennary is a hybrid Inventory + Scheduler system.

When a new Batch is created, the Antennary automatically generates
a schedule of ScheduleTask entries based on the Cordyceps biological lifecycle.

Each task is tied to a specific growth stage and has calculated due dates
based on the batch's inoculation date.

Task Generation Logic:
─────────────────────
Given inoculation_date (Day 1), calculate:
  - Stage 1 (Substrate Prep):  inoculation_date - 1 day   (Day 0)
  - Stage 2 (Inoculation):     inoculation_date            (Day 1)
  - Stage 3 (Incubation):      inoculation_date + 1 day    (Day 2) → +9 days (Day 10)
  - Stage 4 (Fruiting):        inoculation_date + 10 days  (Day 11) → +34 days (Day 45)
  - Stage 5 (Harvest):         inoculation_date + 44 days  (Day 45) → +15 days (Day 60)

Additional recurring tasks are generated within each stage:
  - "Check humidity" every day during Incubation
  - "Check light cycle" every day during Fruiting
  - "Check for contamination" every 2 days during Incubation
"""

from enum import Enum
from typing import Optional
from datetime import datetime
from odmantic import Field, Model, ObjectId


class TaskStatus(str, Enum):
    """Status of a scheduled task."""
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    OVERDUE = "OVERDUE"
    SKIPPED = "SKIPPED"


class TaskPriority(str, Enum):
    """Priority level for task sorting."""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class TaskType(str, Enum):
    """Type of task — stage milestone vs. recurring check."""
    STAGE_TRANSITION = "STAGE_TRANSITION"   # Move batch to next stage
    DAILY_CHECK = "DAILY_CHECK"             # Recurring daily monitoring
    MILESTONE = "MILESTONE"                 # One-time milestone task
    CUSTOM = "CUSTOM"                       # User-created custom task


class ScheduleTask(Model):
    """
    A single task in the Antennary schedule.
    Auto-generated from batch lifecycle or manually created by the cultivator.
    """
    # ── Links ──
    batch_id: ObjectId = Field(..., description="The batch this task belongs to")
    user_id: ObjectId = Field(..., description="The cultivator who owns this task")

    # ── Task Details ──
    title: str = Field(..., min_length=2, max_length=300,
                       description="Task title, e.g. 'Sterilize jars at 15 PSI'")
    description: Optional[str] = Field(default=None, max_length=2000,
                                        description="Detailed instructions for the task")
    stage: str = Field(..., description="Growth stage this task belongs to (e.g. INCUBATION)")
    task_type: TaskType = Field(default=TaskType.MILESTONE)
    priority: TaskPriority = Field(default=TaskPriority.MEDIUM)

    # ── Scheduling ──
    due_date: datetime = Field(..., description="When this task should be completed")
    completed_at: Optional[datetime] = Field(default=None)
    status: TaskStatus = Field(default=TaskStatus.PENDING)

    # ── Environmental Targets (for monitoring tasks) ──
    target_temp_min: Optional[float] = Field(default=None, description="Target min temp °C")
    target_temp_max: Optional[float] = Field(default=None, description="Target max temp °C")
    target_humidity: Optional[float] = Field(default=None, description="Target humidity %")
    target_light_hours: Optional[float] = Field(default=None, description="Target light hours/day")

    # ── Alert flag ──
    alert_message: Optional[str] = Field(default=None, max_length=500,
                                          description="Warning/alert text for this task")
    is_overdue: bool = Field(default=False, description="Flagged by the system if past due_date")

    # ── Metadata ──
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {"collection": "schedule_tasks"}

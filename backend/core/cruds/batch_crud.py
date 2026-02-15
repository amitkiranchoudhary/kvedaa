"""
Batch CRUD — Database operations for Cordyceps cultivation batches.
Includes the core Antennary schedule generation logic.
"""

from datetime import datetime, timedelta
from typing import Optional, List
from odmantic import ObjectId
from core.database.database import get_engine
from core.models.batch_model import (
    Batch, GrowthStage, BatchStatus, DEFAULT_STAGE_CONFIG
)
from core.models.schedule_model import (
    ScheduleTask, TaskStatus, TaskPriority, TaskType
)
from core import logger

logging = logger(__name__)


class BatchCRUD:
    """CRUD operations for Batch documents + Antennary schedule generation."""

    async def create(self, batch_data: dict) -> Batch:
        """Create a new batch document in MongoDB."""
        logging.info("Executing BatchCRUD.create")
        engine = get_engine()
        batch = Batch(**batch_data)
        await engine.save(batch)
        logging.info(f"Created batch: {batch.batch_number} (ID: {batch.id})")
        return batch

    async def get_all(self, user_id: str, skip: int = 0, limit: int = 50) -> List[Batch]:
        """Get all batches for a specific user."""
        logging.info(f"Executing BatchCRUD.get_all for user: {user_id}")
        engine = get_engine()
        batches = await engine.find(
            Batch,
            Batch.user_id == ObjectId(user_id),
            skip=skip,
            limit=limit,
            sort=Batch.created_at.desc()
        )
        return batches

    async def get_by_id(self, batch_id: str) -> Optional[Batch]:
        """Get a single batch by its ID."""
        logging.info(f"Executing BatchCRUD.get_by_id: {batch_id}")
        engine = get_engine()
        batch = await engine.find_one(Batch, Batch.id == ObjectId(batch_id))
        return batch

    async def get_active_batches(self, user_id: str) -> List[Batch]:
        """Get all non-completed, non-failed batches for a user."""
        logging.info(f"Executing BatchCRUD.get_active_batches for user: {user_id}")
        engine = get_engine()
        batches = await engine.find(
            Batch,
            (Batch.user_id == ObjectId(user_id)) &
            (Batch.current_stage != GrowthStage.COMPLETED) &
            (Batch.current_stage != GrowthStage.FAILED),
            sort=Batch.started_at.desc()
        )
        return batches

    async def get_public_batches(self) -> List[Batch]:
        """Get batches marked as public (for storefront traceability)."""
        logging.info("Executing BatchCRUD.get_public_batches")
        engine = get_engine()
        batches = await engine.find(Batch, Batch.is_public == True)
        return batches

    async def update(self, batch_id: str, update_data: dict) -> Optional[Batch]:
        """Update a batch with new data."""
        logging.info(f"Executing BatchCRUD.update: {batch_id}")
        engine = get_engine()
        batch = await engine.find_one(Batch, Batch.id == ObjectId(batch_id))
        if not batch:
            return None

        for key, value in update_data.items():
            if value is not None and hasattr(batch, key):
                setattr(batch, key, value)

        batch.updated_at = datetime.utcnow()
        await engine.save(batch)
        logging.info(f"Updated batch: {batch.batch_number}")
        return batch

    async def advance_stage(self, batch_id: str, new_stage: GrowthStage) -> Optional[Batch]:
        """
        Advance a batch to the next growth stage.
        Also marks all tasks for the previous stage as COMPLETED.
        """
        logging.info(f"Advancing batch {batch_id} to stage: {new_stage}")
        engine = get_engine()
        batch = await engine.find_one(Batch, Batch.id == ObjectId(batch_id))
        if not batch:
            return None

        old_stage = batch.current_stage
        batch.current_stage = new_stage
        batch.updated_at = datetime.utcnow()

        # If advancing to COMPLETED, set completed_at
        if new_stage == GrowthStage.COMPLETED:
            batch.completed_at = datetime.utcnow()
            batch.batch_status = BatchStatus.COMPLETED

        await engine.save(batch)

        # Mark old stage tasks as completed
        old_tasks = await engine.find(
            ScheduleTask,
            (ScheduleTask.batch_id == ObjectId(batch_id)) &
            (ScheduleTask.stage == old_stage.value) &
            (ScheduleTask.status == TaskStatus.PENDING)
        )
        for task in old_tasks:
            task.status = TaskStatus.COMPLETED
            task.completed_at = datetime.utcnow()
            await engine.save(task)

        logging.info(f"Batch {batch.batch_number} advanced from {old_stage} to {new_stage}")
        return batch

    async def delete(self, batch_id: str) -> bool:
        """Delete a batch and all its associated tasks."""
        logging.info(f"Executing BatchCRUD.delete: {batch_id}")
        engine = get_engine()
        batch = await engine.find_one(Batch, Batch.id == ObjectId(batch_id))
        if not batch:
            return False

        # Delete associated schedule tasks
        tasks = await engine.find(ScheduleTask, ScheduleTask.batch_id == ObjectId(batch_id))
        for task in tasks:
            await engine.delete(task)

        await engine.delete(batch)
        logging.info(f"Deleted batch {batch.batch_number} and {len(tasks)} associated tasks")
        return True

    # ─────────────────────────────────────────────────────
    # ANTENNARY ENGINE — Schedule Generation Logic
    # ─────────────────────────────────────────────────────

    async def generate_schedule(self, batch: Batch) -> List[ScheduleTask]:
        """
        THE ANTENNARY ENGINE: Auto-generate a schedule of tasks based on
        the biological lifecycle of Cordyceps Militaris.

        Given a batch with a started_at date (Day 0), this function computes:
          - Stage transition tasks (milestones)
          - Recurring daily monitoring tasks
          - Environmental alert tasks

        Custom stage_overrides from the batch take priority over defaults.
        """
        logging.info(f"Antennary: Generating schedule for batch {batch.batch_number}")
        engine = get_engine()
        tasks = []
        day_zero = batch.started_at

        for stage, defaults in DEFAULT_STAGE_CONFIG.items():
            # ── Merge defaults with per-batch overrides ──
            override = None
            if batch.stage_overrides and stage.value in batch.stage_overrides:
                override = batch.stage_overrides[stage.value]

            day_start = defaults["day_start"]
            day_end = defaults["day_end"]
            duration = override.duration_days if (override and override.duration_days) else defaults["duration_days"]
            temp_min = override.temperature_min if (override and override.temperature_min) else defaults["temperature_min"]
            temp_max = override.temperature_max if (override and override.temperature_max) else defaults["temperature_max"]
            humidity = override.humidity_pct if (override and override.humidity_pct) else defaults["humidity_pct"]
            light = override.light_hours if (override and override.light_hours is not None) else defaults["light_hours"]

            # If duration was overridden, recalculate day_end
            if override and override.duration_days:
                day_end = day_start + override.duration_days - 1

            # ── 1. Stage Transition Milestone Task ──
            milestone = ScheduleTask(
                batch_id=batch.id,
                user_id=batch.user_id,
                title=f"[{stage.value}] {defaults['task']}",
                description=defaults.get("alert") or defaults["task"],
                stage=stage.value,
                task_type=TaskType.STAGE_TRANSITION,
                priority=TaskPriority.HIGH,
                due_date=day_zero + timedelta(days=day_start),
                target_temp_min=temp_min,
                target_temp_max=temp_max,
                target_humidity=humidity,
                target_light_hours=light,
                alert_message=defaults.get("alert"),
            )
            tasks.append(milestone)

            # ── 2. Daily Monitoring Tasks (for multi-day stages) ──
            if duration > 1:
                for day_offset in range(day_start, day_end + 1):
                    # Generate a daily check task
                    check_title = self._get_daily_check_title(stage, day_offset - day_start + 1, duration)
                    daily_task = ScheduleTask(
                        batch_id=batch.id,
                        user_id=batch.user_id,
                        title=check_title,
                        description=f"Day {day_offset}: Check environmental conditions. Temp: {temp_min}-{temp_max}°C, Humidity: {humidity}%, Light: {light}h/day",
                        stage=stage.value,
                        task_type=TaskType.DAILY_CHECK,
                        priority=TaskPriority.MEDIUM,
                        due_date=day_zero + timedelta(days=day_offset),
                        target_temp_min=temp_min,
                        target_temp_max=temp_max,
                        target_humidity=humidity,
                        target_light_hours=light,
                        alert_message=defaults.get("alert"),
                    )
                    tasks.append(daily_task)

        # ── Save all tasks to DB ──
        for task in tasks:
            await engine.save(task)

        logging.info(f"Antennary: Generated {len(tasks)} tasks for batch {batch.batch_number}")
        return tasks

    def _get_daily_check_title(self, stage: GrowthStage, day_in_stage: int, total_days: int) -> str:
        """Generate human-readable daily check titles based on the stage."""
        stage_labels = {
            GrowthStage.INCUBATION: f"🌑 Dark Run Day {day_in_stage}/{total_days}: Check temp (20°C) & humidity (65%). NO LIGHT.",
            GrowthStage.FRUITING: f"☀️ Light Run Day {day_in_stage}/{total_days}: Check temp (16-18°C), humidity (80%), light cycle (12h/12h)",
            GrowthStage.HARVEST: f"🍄 Harvest Window Day {day_in_stage}/{total_days}: Check if club heads have formed spores",
        }
        return stage_labels.get(stage, f"Day {day_in_stage}/{total_days}: Environmental check")

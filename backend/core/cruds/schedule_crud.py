"""
Schedule CRUD — Database operations for the task scheduling system.
"""

from datetime import datetime
from typing import Optional, List
from odmantic import ObjectId
from core.database.database import get_engine
from core.models.schedule_model import ScheduleTask, TaskStatus
from core import logger

logging = logger(__name__)


class ScheduleCRUD:
    """CRUD operations for schedule tasks."""

    async def create(self, task_data: dict) -> ScheduleTask:
        """Create a single schedule task."""
        engine = get_engine()
        task = ScheduleTask(**task_data)
        await engine.save(task)
        return task

    async def get_tasks_for_batch(self, batch_id: str) -> List[ScheduleTask]:
        """Get all tasks for a specific batch, sorted by due date."""
        engine = get_engine()
        return await engine.find(
            ScheduleTask,
            ScheduleTask.batch_id == ObjectId(batch_id),
            sort=ScheduleTask.due_date
        )

    async def get_tasks_for_user(self, user_id: str, status: Optional[str] = None,
                                  limit: int = 100) -> List[ScheduleTask]:
        """Get all tasks for a user, optionally filtered by status."""
        engine = get_engine()
        query = ScheduleTask.user_id == ObjectId(user_id)
        if status:
            query = query & (ScheduleTask.status == status)
        return await engine.find(
            ScheduleTask, query,
            sort=ScheduleTask.due_date,
            limit=limit
        )

    async def get_today_tasks(self, user_id: str) -> List[ScheduleTask]:
        """Get tasks due today for the user's daily to-do list."""
        engine = get_engine()
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = today_start.replace(hour=23, minute=59, second=59)

        all_tasks = await engine.find(
            ScheduleTask,
            (ScheduleTask.user_id == ObjectId(user_id)) &
            (ScheduleTask.status == TaskStatus.PENDING)
        )
        # Filter tasks due today
        today_tasks = [
            t for t in all_tasks
            if today_start <= t.due_date <= today_end
        ]
        return today_tasks

    async def get_overdue_tasks(self, user_id: str) -> List[ScheduleTask]:
        """Get all overdue tasks (past due_date and still PENDING)."""
        engine = get_engine()
        now = datetime.utcnow()
        all_pending = await engine.find(
            ScheduleTask,
            (ScheduleTask.user_id == ObjectId(user_id)) &
            (ScheduleTask.status == TaskStatus.PENDING)
        )
        overdue = []
        for task in all_pending:
            if task.due_date < now:
                task.is_overdue = True
                task.status = TaskStatus.OVERDUE
                await engine.save(task)
                overdue.append(task)
        return overdue

    async def complete_task(self, task_id: str) -> Optional[ScheduleTask]:
        """Mark a task as completed."""
        engine = get_engine()
        task = await engine.find_one(ScheduleTask, ScheduleTask.id == ObjectId(task_id))
        if not task:
            return None
        task.status = TaskStatus.COMPLETED
        task.completed_at = datetime.utcnow()
        task.is_overdue = False
        task.updated_at = datetime.utcnow()
        await engine.save(task)
        return task

    async def update_task(self, task_id: str, update_data: dict) -> Optional[ScheduleTask]:
        """Update a task with new data."""
        engine = get_engine()
        task = await engine.find_one(ScheduleTask, ScheduleTask.id == ObjectId(task_id))
        if not task:
            return None
        for key, value in update_data.items():
            if value is not None and hasattr(task, key):
                setattr(task, key, value)
        task.updated_at = datetime.utcnow()
        await engine.save(task)
        return task

    async def delete_task(self, task_id: str) -> bool:
        """Delete a single task."""
        engine = get_engine()
        task = await engine.find_one(ScheduleTask, ScheduleTask.id == ObjectId(task_id))
        if not task:
            return False
        await engine.delete(task)
        return True

    async def delete_batch_tasks(self, batch_id: str) -> int:
        """Delete all tasks for a batch. Returns count of deleted tasks."""
        engine = get_engine()
        tasks = await engine.find(ScheduleTask, ScheduleTask.batch_id == ObjectId(batch_id))
        count = len(tasks)
        for task in tasks:
            await engine.delete(task)
        return count

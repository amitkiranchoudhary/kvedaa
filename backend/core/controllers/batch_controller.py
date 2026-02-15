"""
Batch Controller — Business logic for batch management and the Antennary system.
"""

from core.cruds.batch_crud import BatchCRUD
from core.cruds.schedule_crud import ScheduleCRUD
from core.models.batch_model import GrowthStage
from fastapi import HTTPException
from core import logger

logging = logger(__name__)


class BatchController:
    def __init__(self):
        self.batch_crud = BatchCRUD()
        self.schedule_crud = ScheduleCRUD()

    async def create_batch(self, batch_data: dict, user_id: str):
        """
        Create a new batch and auto-generate the Antennary schedule.
        This is the main entry point for the Antennary system.
        """
        try:
            logging.info(f"Creating batch for user: {user_id}")
            batch_data["user_id"] = user_id

            # Create the batch document
            batch = await self.batch_crud.create(batch_data)

            # THE ANTENNARY: Auto-generate the full lifecycle schedule
            tasks = await self.batch_crud.generate_schedule(batch)

            batch_dict = batch.model_dump()
            batch_dict["id"] = str(batch.id)
            batch_dict["user_id"] = str(batch.user_id)
            batch_dict["tasks_generated"] = len(tasks)

            return batch_dict
        except HTTPException:
            raise
        except Exception as e:
            logging.error(f"Error creating batch: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    async def get_all_batches(self, user_id: str):
        """Get all batches for the authenticated user."""
        try:
            batches = await self.batch_crud.get_all(user_id)
            result = []
            for b in batches:
                d = b.model_dump()
                d["id"] = str(b.id)
                d["user_id"] = str(b.user_id)

                # Calculate current day in lifecycle
                from datetime import datetime
                delta = (datetime.utcnow() - b.started_at).days
                d["current_day"] = delta
                d["stage_display"] = self._get_stage_display(b.current_stage, delta)

                result.append(d)
            return result
        except Exception as e:
            logging.error(f"Error getting batches: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    async def get_active_batches(self, user_id: str):
        """Get only active (non-completed) batches."""
        try:
            batches = await self.batch_crud.get_active_batches(user_id)
            result = []
            for b in batches:
                d = b.model_dump()
                d["id"] = str(b.id)
                d["user_id"] = str(b.user_id)
                from datetime import datetime
                delta = (datetime.utcnow() - b.started_at).days
                d["current_day"] = delta
                d["stage_display"] = self._get_stage_display(b.current_stage, delta)
                result.append(d)
            return result
        except Exception as e:
            logging.error(f"Error getting active batches: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    async def get_batch(self, batch_id: str, user_id: str):
        """Get a single batch with its full schedule."""
        try:
            batch = await self.batch_crud.get_by_id(batch_id)
            if not batch:
                raise HTTPException(status_code=404, detail="Batch not found")
            if str(batch.user_id) != user_id:
                raise HTTPException(status_code=403, detail="Not authorized")

            d = batch.model_dump()
            d["id"] = str(batch.id)
            d["user_id"] = str(batch.user_id)

            from datetime import datetime
            delta = (datetime.utcnow() - batch.started_at).days
            d["current_day"] = delta
            d["stage_display"] = self._get_stage_display(batch.current_stage, delta)

            # Include schedule tasks
            tasks = await self.schedule_crud.get_tasks_for_batch(batch_id)
            d["tasks"] = []
            for t in tasks:
                td = t.model_dump()
                td["id"] = str(t.id)
                td["batch_id"] = str(t.batch_id)
                td["user_id"] = str(t.user_id)
                d["tasks"].append(td)

            return d
        except HTTPException:
            raise
        except Exception as e:
            logging.error(f"Error getting batch: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    async def update_batch(self, batch_id: str, update_data: dict, user_id: str):
        """Update batch details."""
        try:
            batch = await self.batch_crud.get_by_id(batch_id)
            if not batch:
                raise HTTPException(status_code=404, detail="Batch not found")
            if str(batch.user_id) != user_id:
                raise HTTPException(status_code=403, detail="Not authorized")

            updated = await self.batch_crud.update(batch_id, update_data)
            d = updated.model_dump()
            d["id"] = str(updated.id)
            d["user_id"] = str(updated.user_id)
            return d
        except HTTPException:
            raise
        except Exception as e:
            logging.error(f"Error updating batch: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    async def advance_batch_stage(self, batch_id: str, new_stage: str, user_id: str):
        """Advance a batch to the next growth stage."""
        try:
            batch = await self.batch_crud.get_by_id(batch_id)
            if not batch:
                raise HTTPException(status_code=404, detail="Batch not found")
            if str(batch.user_id) != user_id:
                raise HTTPException(status_code=403, detail="Not authorized")

            stage = GrowthStage(new_stage)
            updated = await self.batch_crud.advance_stage(batch_id, stage)
            d = updated.model_dump()
            d["id"] = str(updated.id)
            d["user_id"] = str(updated.user_id)

            from datetime import datetime
            delta = (datetime.utcnow() - updated.started_at).days
            d["current_day"] = delta
            d["stage_display"] = self._get_stage_display(updated.current_stage, delta)

            return d
        except HTTPException:
            raise
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid stage: {new_stage}")
        except Exception as e:
            logging.error(f"Error advancing stage: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    async def delete_batch(self, batch_id: str, user_id: str):
        """Delete a batch and its schedule."""
        try:
            batch = await self.batch_crud.get_by_id(batch_id)
            if not batch:
                raise HTTPException(status_code=404, detail="Batch not found")
            if str(batch.user_id) != user_id:
                raise HTTPException(status_code=403, detail="Not authorized")

            await self.batch_crud.delete(batch_id)
            return {"message": f"Batch {batch.batch_number} deleted successfully"}
        except HTTPException:
            raise
        except Exception as e:
            logging.error(f"Error deleting batch: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    async def get_dashboard_summary(self, user_id: str):
        """Get summary data for the dashboard — active batches, today's tasks, overdue alerts."""
        try:
            active_batches = await self.batch_crud.get_active_batches(user_id)
            today_tasks = await self.schedule_crud.get_today_tasks(user_id)
            overdue_tasks = await self.schedule_crud.get_overdue_tasks(user_id)

            # Build batch summaries
            batch_summaries = []
            from datetime import datetime
            for b in active_batches:
                delta = (datetime.utcnow() - b.started_at).days
                batch_summaries.append({
                    "id": str(b.id),
                    "batch_number": b.batch_number,
                    "strain": b.strain,
                    "current_stage": b.current_stage.value,
                    "current_day": delta,
                    "stage_display": self._get_stage_display(b.current_stage, delta),
                    "batch_status": b.batch_status.value,
                    "jar_count": b.jar_count,
                    "started_at": b.started_at.isoformat(),
                })

            # Build task lists
            today_list = []
            for t in today_tasks:
                today_list.append({
                    "id": str(t.id),
                    "title": t.title,
                    "batch_id": str(t.batch_id),
                    "stage": t.stage,
                    "priority": t.priority.value,
                    "due_date": t.due_date.isoformat(),
                    "status": t.status.value,
                })

            overdue_list = []
            for t in overdue_tasks:
                overdue_list.append({
                    "id": str(t.id),
                    "title": t.title,
                    "batch_id": str(t.batch_id),
                    "stage": t.stage,
                    "priority": t.priority.value,
                    "due_date": t.due_date.isoformat(),
                    "status": t.status.value,
                    "alert_message": t.alert_message,
                })

            return {
                "active_batches": len(active_batches),
                "total_jars": sum(b.jar_count for b in active_batches),
                "tasks_today": len(today_tasks),
                "overdue_tasks": len(overdue_tasks),
                "batches": batch_summaries,
                "today_tasks": today_list,
                "overdue_alerts": overdue_list,
            }
        except Exception as e:
            logging.error(f"Error getting dashboard summary: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    def _get_stage_display(self, stage: GrowthStage, day: int) -> str:
        """Generate a human-readable stage display string."""
        displays = {
            GrowthStage.SUBSTRATE_PREP: f"Substrate Prep (Day {day})",
            GrowthStage.INOCULATION: f"Inoculation (Day {day})",
            GrowthStage.INCUBATION: f"Incubation / Dark Run (Day {day})",
            GrowthStage.FRUITING: f"Fruiting / Light Run (Day {day})",
            GrowthStage.HARVEST: f"Harvest Window (Day {day})",
            GrowthStage.COMPLETED: "✅ Completed",
            GrowthStage.FAILED: "❌ Failed",
        }
        return displays.get(stage, f"Unknown (Day {day})")

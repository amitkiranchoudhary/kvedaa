"""
Schedule/Task Router — PROTECTED routes for task management.
Part of the Owner Dashboard.
"""

from commons.auth import decodeJWT
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from core.cruds.schedule_crud import ScheduleCRUD
from commons.logger import logger

logging = logger(__name__)

schedule_router = APIRouter(prefix="/api/farm/tasks")

oauth2_schema = OAuth2PasswordBearer(tokenUrl="v1/login")


async def get_current_user(token: str = Depends(oauth2_schema)) -> dict:
    user = decodeJWT(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    if user.get("status") != "ACTIVE":
        raise HTTPException(status_code=401, detail="User not active")
    return user


@schedule_router.get("/")
async def get_all_tasks(status: str = None, limit: int = 100,
                        user: dict = Depends(get_current_user)):
    """Get all tasks for the user, optionally filtered by status."""
    crud = ScheduleCRUD()
    tasks = await crud.get_tasks_for_user(user["id"], status, limit)
    result = []
    for t in tasks:
        d = t.model_dump()
        d["id"] = str(t.id)
        d["batch_id"] = str(t.batch_id)
        d["user_id"] = str(t.user_id)
        result.append(d)
    return result


@schedule_router.get("/today")
async def get_today_tasks(user: dict = Depends(get_current_user)):
    """Get the daily to-do list — tasks due today."""
    crud = ScheduleCRUD()
    tasks = await crud.get_today_tasks(user["id"])
    result = []
    for t in tasks:
        d = t.model_dump()
        d["id"] = str(t.id)
        d["batch_id"] = str(t.batch_id)
        d["user_id"] = str(t.user_id)
        result.append(d)
    return result


@schedule_router.get("/overdue")
async def get_overdue_tasks(user: dict = Depends(get_current_user)):
    """Get all overdue tasks that need immediate attention."""
    crud = ScheduleCRUD()
    tasks = await crud.get_overdue_tasks(user["id"])
    result = []
    for t in tasks:
        d = t.model_dump()
        d["id"] = str(t.id)
        d["batch_id"] = str(t.batch_id)
        d["user_id"] = str(t.user_id)
        result.append(d)
    return result


@schedule_router.get("/batch/{batch_id}")
async def get_batch_tasks(batch_id: str, user: dict = Depends(get_current_user)):
    """Get all tasks for a specific batch."""
    crud = ScheduleCRUD()
    tasks = await crud.get_tasks_for_batch(batch_id)
    result = []
    for t in tasks:
        d = t.model_dump()
        d["id"] = str(t.id)
        d["batch_id"] = str(t.batch_id)
        d["user_id"] = str(t.user_id)
        result.append(d)
    return result


@schedule_router.post("/{task_id}/complete")
async def complete_task(task_id: str, user: dict = Depends(get_current_user)):
    """Mark a task as completed."""
    crud = ScheduleCRUD()
    task = await crud.complete_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    d = task.model_dump()
    d["id"] = str(task.id)
    d["batch_id"] = str(task.batch_id)
    d["user_id"] = str(task.user_id)
    return d


@schedule_router.delete("/{task_id}")
async def delete_task(task_id: str, user: dict = Depends(get_current_user)):
    """Delete a single task."""
    crud = ScheduleCRUD()
    deleted = await crud.delete_task(task_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted"}

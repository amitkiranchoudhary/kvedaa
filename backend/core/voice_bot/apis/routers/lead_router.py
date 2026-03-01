from typing import Any

from bson import ObjectId
from fastapi import APIRouter, HTTPException

from core.voice_bot.apis.schemas.call_schemas import LeadUpdateRequest
from core.voice_bot.db import get_database

router = APIRouter()


def _serialize_doc(doc: dict[str, Any]) -> dict[str, Any]:
    doc["id"] = str(doc.pop("_id"))
    for key, value in list(doc.items()):
        if hasattr(value, "isoformat"):
            doc[key] = value.isoformat()
    return doc


@router.get("/leads")
async def get_leads(status: str | None = None, min_score: int | None = None):
    db = get_database()
    if db is None:
        return []

    query = {}
    if status:
        query["status"] = status
    if min_score is not None:
        query["lead_score"] = {"$gte": min_score}

    cursor = db["leads"].find(query).sort("timestamp", -1).limit(100)
    leads = await cursor.to_list(length=100)
    return [_serialize_doc(lead) for lead in leads]


@router.get("/leads/stats")
async def get_lead_stats():
    db = get_database()
    if db is None:
        return {"total": 0, "by_status": {}, "avg_score": 0}

    total = await db["leads"].count_documents({})
    by_status = {}
    async for row in db["leads"].aggregate(
        [{"$group": {"_id": "$status", "count": {"$sum": 1}}}]
    ):
        by_status[row.get("_id") or "unknown"] = row.get("count", 0)

    avg_score = 0
    async for row in db["leads"].aggregate(
        [{"$group": {"_id": None, "avg": {"$avg": "$lead_score"}}}]
    ):
        avg_score = round(row.get("avg", 0), 1)

    return {"total": total, "by_status": by_status, "avg_score": avg_score}


@router.get("/leads/{lead_id}")
async def get_lead(lead_id: str):
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database not available")
    try:
        oid = ObjectId(lead_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid lead id") from None

    lead = await db["leads"].find_one({"_id": oid})
    if lead is None:
        raise HTTPException(status_code=404, detail="Lead not found")
    return _serialize_doc(lead)


@router.put("/leads/{lead_id}")
async def update_lead(lead_id: str, request: LeadUpdateRequest):
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database not available")
    try:
        oid = ObjectId(lead_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid lead id") from None

    update_data = {}
    if request.status:
        update_data["status"] = request.status
    if request.notes:
        update_data["notes"] = request.notes
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")

    result = await db["leads"].update_one({"_id": oid}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"message": "Lead updated successfully"}


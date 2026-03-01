from typing import List, Optional

from pydantic import BaseModel


class DialoutRequest(BaseModel):
    to_number: str
    from_number: Optional[str] = None


class DialoutResponse(BaseModel):
    call_sid: str
    status: str
    to_number: str


class LeadUpdateRequest(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None


class CallRecord(BaseModel):
    id: str
    call_sid: str
    stream_sid: Optional[str] = None
    status: str = "unknown"
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    duration_seconds: Optional[int] = None
    transcript: Optional[List[dict]] = None
    analysis: Optional[dict] = None


import json
import os
from typing import Any

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Request, Response, WebSocket

from core import logger
from core.voice_bot.apis.schemas.call_schemas import DialoutRequest, DialoutResponse
from core.voice_bot.db import get_database

log = logger(__name__)
router = APIRouter()

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")
PUBLIC_URL = os.getenv("PUBLIC_URL")

twilio_client = None
VoiceResponse = None
Connect = None

try:
    from twilio.rest import Client
    from twilio.twiml.voice_response import Connect as TwiMLConnect
    from twilio.twiml.voice_response import VoiceResponse as TwiMLVoiceResponse

    VoiceResponse = TwiMLVoiceResponse
    Connect = TwiMLConnect
    if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN:
        twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
except Exception as exc:
    log.warning(f"Twilio features disabled: {exc}")


def _serialize_doc(doc: dict[str, Any]) -> dict[str, Any]:
    doc["id"] = str(doc.pop("_id"))
    for key, value in list(doc.items()):
        if hasattr(value, "isoformat"):
            doc[key] = value.isoformat()
    return doc


@router.post("/dialout", response_model=DialoutResponse)
async def dialout(request: DialoutRequest):
    if twilio_client is None:
        raise HTTPException(status_code=503, detail="Twilio is not configured")
    if not PUBLIC_URL:
        raise HTTPException(status_code=500, detail="PUBLIC_URL is not set")

    stream_url = f"wss://{PUBLIC_URL.replace('https://', '').replace('http://', '')}/ws"
    response = VoiceResponse()
    connect = Connect()
    stream = connect.stream(url=stream_url)
    stream.parameter(name="to_number", value=request.to_number)
    response.append(connect)

    call = twilio_client.calls.create(
        to=request.to_number,
        from_=request.from_number or TWILIO_PHONE_NUMBER,
        twiml=str(response),
        method="POST",
    )
    return DialoutResponse(
        call_sid=call.sid, status="call_initiated", to_number=request.to_number
    )


@router.post("/twiml")
async def twiml(_: Request):
    if not PUBLIC_URL:
        raise HTTPException(status_code=500, detail="PUBLIC_URL is not set")
    response = VoiceResponse()
    connect = Connect()
    stream_url = f"wss://{PUBLIC_URL.replace('https://', '').replace('http://', '')}/ws"
    connect.stream(url=stream_url)
    response.append(connect)
    return Response(content=str(response), media_type="application/xml")


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    try:
        from core.voice_bot.pipeline import bot
    except Exception as exc:
        log.error(f"Voice pipeline dependencies are missing: {exc}")
        await websocket.accept()
        await websocket.close(code=1011, reason="Voice pipeline unavailable")
        return

    try:
        await websocket.accept()
        log.info("WebSocket connection accepted for outbound call")

        # Wait for the initial 'start' message from Twilio to get the Stream SID
        start_message = None

        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            if message["event"] == "connected":
                log.info("Received connected event, waiting for start...")
                continue
            elif message["event"] == "start":
                start_message = message
                custom_params = start_message["start"].get("customParameters", {})
                log.info(f"Stream parameters received: {custom_params}")
                break
            else:
                log.warning(f"Ignoring unexpected event: {message['event']}")

        stream_sid = start_message["start"]["streamSid"]
        call_sid = start_message["start"]["callSid"]
        to_number = start_message["start"].get("customParameters", {}).get("to_number")

        log.info(f"Stream started with SID: {stream_sid} for Call SID: {call_sid} (To: {to_number})")

        # Hand off to the Bot logic
        await bot(websocket, stream_sid, call_sid)

    except Exception as exc:
        log.error(f"Error in websocket_endpoint: {exc}")
        await websocket.close()


@router.get("/calls")
async def get_calls():
    db = get_database()
    if db is None:
        return []
    cursor = db["calls"].find().sort("start_time", -1).limit(50)
    calls = await cursor.to_list(length=50)
    return [_serialize_doc(call) for call in calls]


@router.get("/calls/{call_id}")
async def get_call(call_id: str):
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database not available")
    try:
        oid = ObjectId(call_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid call id") from None

    call = await db["calls"].find_one({"_id": oid})
    if call is None:
        raise HTTPException(status_code=404, detail="Call not found")
    return _serialize_doc(call)


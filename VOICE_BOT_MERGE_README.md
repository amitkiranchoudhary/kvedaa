# KVedaa Voice Bot Merge Notes

This document explains the merge of the standalone `voice-bot` backend into the main `backend` service.

## What Was Merged

The voice bot backend is now part of the main backend codebase under:

- `backend/core/voice_bot/`

Key merged modules:

- API routers:
  - `backend/core/voice_bot/apis/routers/call_router.py`
  - `backend/core/voice_bot/apis/routers/lead_router.py`
  - `backend/core/voice_bot/apis/routers/ingestion_router.py`
- Pipeline:
  - `backend/core/voice_bot/pipeline.py`
- Tools/services/RAG:
  - `backend/core/voice_bot/tools/manager.py`
  - `backend/core/voice_bot/tools/web_search.py`
  - `backend/core/voice_bot/services/kvedaa_client.py`
  - `backend/core/voice_bot/services/analytics.py`
  - `backend/core/voice_bot/rag/knowledge_base.py`
- Shared DB accessor:
  - `backend/core/voice_bot/db.py`
- Startup ingest hook:
  - `backend/core/voice_bot/startup.py`

## Main Backend Integration

Main integration file:

- `backend/core/apis/api.py`

Changes in integration:

- Voice routers are imported and included when available.
- Voice bootstrapping is called in app lifespan startup.
- Added voice health endpoint:
  - `GET /voice/health`
- Main API now reports voice module status in root response.

## Frontend Impact

- No frontend merge changes were made to the main web app frontend code for this integration.
- Voice bot merge is backend-only.

## Database Behavior

Voice bot now reuses the main Mongo client and writes to a dedicated DB name:

- Default DB name: `kvedaa_voice_bot`
- Override env var: `VOICE_BOT_DB_NAME`

Collections used:

- `calls`
- `leads`
- `tool_logs`

## Endpoints Added (from merged voice bot)

Calls:

- `POST /dialout`
- `POST /twiml`
- `GET /calls`
- `GET /calls/{call_id}`
- `WS /ws`

Leads:

- `GET /leads`
- `GET /leads/stats`
- `GET /leads/{lead_id}`
- `PUT /leads/{lead_id}`

Knowledge Base:

- `POST /upload-document`
- `GET /documents`
- `DELETE /documents/{filename}`
- `POST /knowledge-base/clear`

Health:

- `GET /voice/health`

## Requirements Updated

`backend/requirements.txt` now includes optional voice-bot dependencies:

- `websockets`
- `twilio`
- `pipecat-ai[deepgram,twilio]`
- `groq`
- `langchain`
- `langchain-community`
- `langchain-huggingface`
- `langchain-chroma`
- `chromadb`
- `sentence-transformers`
- `pypdf`
- `tavily-python`

## Environment Variables To Set

Core:

- `MONGODB_URI`
- `DATABASE_NAME`

Voice/Twilio:

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`
- `PUBLIC_URL`

Voice AI:

- `DEEPGRAM_API_KEY`
- `GROQ_API_KEY`
- `GROQ_REALTIME_MODEL` (optional)
- `GROQ_ANALYSIS_MODEL` (optional)

RAG/Web:

- `TAVILY_API_KEY`
- `VOICE_BOT_DB_NAME` (optional)

## Knowledge File

The old voice bot knowledge file was moved to project root:

- `kvedaa_info.txt`

Startup auto-ingest now reads from root `kvedaa_info.txt`.

## Run Instructions

1. Install dependencies:

```powershell
cd backend
pip install -r requirements.txt
```

2. Start backend:

```powershell
cd backend
uvicorn core.apis.api:app --host 0.0.0.0 --port 8000 --reload
```

3. Validate:

- Open `http://localhost:8000/docs`
- Check `GET /voice/health`

## Notes About Old `voice-bot` Folder

- The old folder content was removed.
- If an empty `voice-bot` directory still appears, it is locked by a local process handle.
- Safe final removal command after closing terminals/explorer using that folder:

```powershell
Remove-Item -Path C:\Users\PC\documents\Expirements\kvedaa\voice-bot -Force
```


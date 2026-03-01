from contextlib import asynccontextmanager
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core import logger
from core.apis.routers.alert_router import alert_router
from core.apis.routers.analytics_router import analytics_router
from core.apis.routers.batch_router import batch_router
from core.apis.routers.building_router import building_router
from core.apis.routers.device_router import device_router
from core.apis.routers.inventory_router import inventory_router
from core.apis.routers.order_router import router as order_router
from core.apis.routers.schedule_router import schedule_router
from core.apis.routers.store_router import store_router
from core.apis.routers.telemetry_router import telemetry_router
from core.apis.routers.user_router import user_router
from core.database.database import close_mongo_connection, connect_to_mongo

logging = logger(__name__)

voice_bot_enabled = False
voice_bot_import_error = None
try:
    from core.voice_bot.apis.routers.call_router import router as voice_call_router
    from core.voice_bot.apis.routers.ingestion_router import (
        router as voice_ingestion_router,
    )
    from core.voice_bot.apis.routers.lead_router import router as voice_lead_router
    from core.voice_bot.services.kvedaa_client import kvedaa_client
    from core.voice_bot.startup import bootstrap_knowledge_base

    voice_bot_enabled = True
except Exception as exc:
    voice_bot_import_error = str(exc)


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        logging.info("Starting KVedaa Cordyceps Farm and SCADA Platform API")
        await connect_to_mongo()
        if voice_bot_enabled:
            await bootstrap_knowledge_base()
    except Exception as exc:
        logging.error(f"Startup error: {exc}")
    yield
    logging.info("Shutting down KVedaa Platform API")
    await close_mongo_connection()


app = FastAPI(
    title="KVedaa Cordyceps Farm and SCADA Platform API",
    description=(
        "Cordyceps cultivation management, public e-commerce storefront, "
        "and integrated voice bot."
    ),
    version="3.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router, tags=["User Management"])
app.include_router(order_router, tags=["Order Management"])
app.include_router(building_router, tags=["Building Management"])
app.include_router(device_router, tags=["Device Management"])
app.include_router(telemetry_router, tags=["Telemetry and Monitoring"])
app.include_router(analytics_router, tags=["Analytics and Reports"])
app.include_router(alert_router, tags=["Alerts and Automation"])
app.include_router(batch_router, tags=["Batch Lifecycle"])
app.include_router(inventory_router, tags=["Inventory Management"])
app.include_router(schedule_router, tags=["Task Scheduling"])
app.include_router(store_router, tags=["Store"])

if voice_bot_enabled:
    app.include_router(voice_call_router, tags=["Voice Bot - Calls"])
    app.include_router(voice_lead_router, tags=["Voice Bot - Leads"])
    app.include_router(voice_ingestion_router, tags=["Voice Bot - Knowledge Base"])
    logging.info("Voice bot routes enabled")
else:
    logging.warning(f"Voice bot routes disabled: {voice_bot_import_error}")


@app.get("/", tags=["Health"])
async def root():
    return {
        "message": "Welcome to the KVedaa Cordyceps Platform",
        "version": "3.1.0",
        "modules": [
            "User Management",
            "Building Management",
            "Device Management",
            "Telemetry and Monitoring",
            "Analytics and Reports",
            "Alerts and Automation",
            "Batch Lifecycle",
            "Inventory Management",
            "Task Scheduling",
            "Store",
            "Voice Bot" if voice_bot_enabled else "Voice Bot (disabled)",
        ],
    }


@app.get("/voice/health", tags=["Voice Bot - Health"])
async def voice_health():
    if not voice_bot_enabled:
        return {"status": "disabled", "reason": voice_bot_import_error}

    kvedaa_ok = await kvedaa_client.check_health()
    return {
        "status": "healthy",
        "kvedaa_backend": "connected" if kvedaa_ok else "disconnected",
    }


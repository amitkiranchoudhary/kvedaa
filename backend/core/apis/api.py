from fastapi import FastAPI
from contextlib import asynccontextmanager
from core.database.database import connect_to_mongo, close_mongo_connection
from fastapi.middleware.cors import CORSMiddleware

# ─── Auth & User ───
from core.apis.routers.user_router import user_router
from core.apis.routers.order_router import router as order_router

# ─── SCADA / IoT ───
from core.apis.routers.building_router import building_router
from core.apis.routers.device_router import device_router
from core.apis.routers.telemetry_router import telemetry_router
from core.apis.routers.analytics_router import analytics_router
from core.apis.routers.alert_router import alert_router

# ─── Farm / Cultivation (PROTECTED — Owner Dashboard) ───
from core.apis.routers.batch_router import batch_router
from core.apis.routers.inventory_router import inventory_router
from core.apis.routers.schedule_router import schedule_router

# ─── Store / E-commerce (PUBLIC + PROTECTED) ───
from core.apis.routers.store_router import store_router

from core import logger

logging = logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        logging.info("Starting KVedaa Cordyceps Farm & SCADA Platform API")
        await connect_to_mongo()
    except Exception as e:
        logging.error(f"Error connecting to MongoDB: {e}")
    yield
    logging.info("Shutting down KVedaa Platform API")
    await close_mongo_connection()


app = FastAPI(
    title="KVedaa Cordyceps Farm & SCADA Platform API",
    description="Dual-interface platform: Cordyceps cultivation management (Owner Dashboard) + Public E-commerce Storefront",
    version="3.0.0",
    lifespan=lifespan,
)

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ═══ Auth & User Management ═══
app.include_router(user_router, tags=["User Management"])
app.include_router(order_router, tags=["Order Management"])

# ═══ SCADA / IoT Modules ═══
app.include_router(building_router, tags=["Building Management"])
app.include_router(device_router, tags=["Device Management"])
app.include_router(telemetry_router, tags=["Telemetry & Monitoring"])
app.include_router(analytics_router, tags=["Analytics & Reports"])
app.include_router(alert_router, tags=["Alerts & Automation"])

# ═══ Farm / Cultivation Modules (PROTECTED) ═══
app.include_router(batch_router, tags=["Batch Lifecycle"])
app.include_router(inventory_router, tags=["Inventory Management"])
app.include_router(schedule_router, tags=["Task Scheduling"])

# ═══ Public Store (PUBLIC + Admin CRUD) ═══
app.include_router(store_router, tags=["Store"])


@app.get("/", tags=["Health"])
async def root():
    return {
        "message": "Welcome to the KVedaa Cordyceps Farm & SCADA Platform!",
        "version": "3.0.0",
        "interfaces": {
            "owner_dashboard": "/dashboard — Protected cultivation command center",
            "public_store": "/store — Customer-facing e-commerce storefront",
        },
        "modules": [
            "User Management",
            "Building Management",
            "Device Management",
            "Telemetry & Monitoring",
            "Analytics & Reports",
            "Alerts & Automation",
            "Batch Lifecycle (Antennary)",
            "Inventory Management",
            "Task Scheduling",
            "Public Store",
        ],
    }


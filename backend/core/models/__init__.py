"""
Models module initialization
Exports data models for the application.

Organized into two domains:
  1. SCADA/IoT — Buildings, Devices, Telemetry, Alerts
  2. Farm/Store — Batches, Inventory, Schedules, Products
"""

# ─── Core / Auth ───
from core.models.user_model import User, UserAddress, UserStatus

# ─── SCADA / IoT Modules ───
from core.models.building_model import Building
from core.models.device_model import Device, DeviceType, DeviceStatus
from core.models.telemetry_model import Telemetry
from core.models.alert_model import AlertRule, Alert, AlertSeverity, AlertOperator, AlertAction

# ─── Farm / Cultivation Modules ───
from core.models.batch_model import Batch, GrowthStage, BatchStatus, StageParameters, DEFAULT_STAGE_CONFIG
from core.models.inventory_model import InventoryItem, InventoryTransaction, InventoryCategory, InventoryUnit
from core.models.schedule_model import ScheduleTask, TaskStatus, TaskPriority, TaskType

# ─── Store / E-commerce Modules ───
from core.models.product_model import Product, ProductCategory, ProductStatus

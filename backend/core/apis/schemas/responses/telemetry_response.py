from typing import Optional, Dict, List
from datetime import datetime
from pydantic import BaseModel, Field


class TelemetryResponse(BaseModel):
    id: str
    device_id: str
    timestamp: datetime
    metrics: Optional[Dict[str, float]] = None
    readings: Optional[Dict[str, float]] = None

    model_config = {"from_attributes": True}


class TelemetryListResponse(BaseModel):
    data: List[TelemetryResponse]
    total: int


class EnergyReportItem(BaseModel):
    date: str
    total_kwh: float
    avg_voltage: float
    avg_amperage: float
    data_points: int


class ComfortReportItem(BaseModel):
    hour: str
    avg_temperature: float
    avg_co2: float
    avg_humidity: float
    data_points: int


class AnalyticsEnergyResponse(BaseModel):
    period_start: str
    period_end: str
    data: List[EnergyReportItem]


class AnalyticsComfortResponse(BaseModel):
    period_start: str
    period_end: str
    data: List[ComfortReportItem]


class DashboardStatsResponse(BaseModel):
    total_buildings: int
    total_devices: int
    devices_online: int
    devices_offline: int
    total_telemetry_records: int
    unacknowledged_alerts: int
    recent_alerts: List[dict] = Field(default_factory=list)

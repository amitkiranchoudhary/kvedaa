from typing import Optional, Dict
from pydantic import BaseModel, Field


class TelemetryDataRequest(BaseModel):
    """Schema for IoT devices pushing sensor data."""
    device_id: str = Field(..., description="Hardware device ID (MAC address)")
    metrics: Optional[Dict[str, float]] = Field(
        default=None,
        description="Energy metrics: voltage, amperage, kwh, water_flow_lpm, gas_flow_m3h, power_w"
    )
    readings: Optional[Dict[str, float]] = Field(
        default=None,
        description="Environmental readings: temperature_c, co2_ppm, humidity_pct"
    )


class TelemetryQueryRequest(BaseModel):
    """Schema for querying telemetry data."""
    device_id: str = Field(..., description="Device MongoDB ID")
    start_date: Optional[str] = Field(default=None, description="Start date ISO format")
    end_date: Optional[str] = Field(default=None, description="End date ISO format")
    limit: int = Field(default=100, ge=1, le=1000)

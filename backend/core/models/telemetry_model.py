from typing import Optional, Dict
from datetime import datetime
from odmantic import Field, Model, ObjectId


class Telemetry(Model):
    """
    Represents a single telemetry data point from an IoT device.
    Contains energy metrics and environmental readings.
    """
    device_id: ObjectId = Field(..., description="ID of the device that sent this data")
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    # Energy metrics (for energy meters, water meters, gas meters)
    metrics: Optional[Dict[str, float]] = Field(
        default=None,
        description="Energy metrics: voltage, amperage, kwh, water_flow_lpm, gas_flow_m3h, power_w"
    )

    # Environmental readings (for temp, CO2, humidity sensors)
    readings: Optional[Dict[str, float]] = Field(
        default=None,
        description="Environmental readings: temperature_c, co2_ppm, humidity_pct"
    )

    model_config = {"collection": "telemetry"}

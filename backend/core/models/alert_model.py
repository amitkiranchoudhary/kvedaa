from enum import Enum
from typing import Optional
from datetime import datetime
from odmantic import Field, Model, ObjectId


class AlertSeverity(str, Enum):
    INFO = "INFO"
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"


class AlertOperator(str, Enum):
    GREATER_THAN = "gt"
    LESS_THAN = "lt"
    EQUAL = "eq"
    GREATER_EQUAL = "gte"
    LESS_EQUAL = "lte"


class AlertAction(str, Enum):
    EMAIL = "EMAIL"
    WEBHOOK = "WEBHOOK"
    LOG = "LOG"


class AlertRule(Model):
    """
    Defines a threshold-based alert rule.
    Example: 'If CO2 > 1000ppm, send Email, severity Critical'
    """
    name: str = Field(..., min_length=2, max_length=200)
    metric: str = Field(..., description="Metric key to evaluate, e.g. 'co2_ppm', 'temperature_c', 'kwh'")
    operator: AlertOperator = Field(...)
    threshold: float = Field(...)
    action: AlertAction = Field(default=AlertAction.LOG)
    severity: AlertSeverity = Field(default=AlertSeverity.WARNING)
    building_id: Optional[ObjectId] = Field(default=None, description="Optional: scope rule to a building")
    enabled: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {"collection": "alert_rules"}


class Alert(Model):
    """
    Represents a triggered alert when a telemetry reading violates a rule.
    """
    rule_id: ObjectId = Field(..., description="ID of the AlertRule that triggered this")
    device_id: ObjectId = Field(..., description="ID of the device that triggered this")
    triggered_at: datetime = Field(default_factory=datetime.utcnow)
    metric: str = Field(...)
    value: float = Field(..., description="The actual value that triggered the alert")
    threshold: float = Field(..., description="The threshold that was violated")
    message: str = Field(default="")
    severity: AlertSeverity = Field(default=AlertSeverity.WARNING)
    acknowledged: bool = Field(default=False)
    acknowledged_at: Optional[datetime] = Field(default=None)
    acknowledged_by: Optional[ObjectId] = Field(default=None)

    model_config = {"collection": "alerts"}

from typing import Optional
from pydantic import BaseModel, Field
from core.models.alert_model import AlertOperator, AlertAction, AlertSeverity


class AlertRuleCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=200, description="Rule name")
    metric: str = Field(..., description="Metric key: co2_ppm, temperature_c, kwh, humidity_pct, voltage, etc.")
    operator: AlertOperator = Field(..., description="Comparison operator: gt, lt, eq, gte, lte")
    threshold: float = Field(..., description="Threshold value")
    action: AlertAction = Field(default=AlertAction.LOG, description="Action to take: EMAIL, WEBHOOK, LOG")
    severity: AlertSeverity = Field(default=AlertSeverity.WARNING, description="Alert severity")
    building_id: Optional[str] = Field(default=None, description="Scope rule to a specific building")
    enabled: bool = Field(default=True)


class AlertRuleUpdateRequest(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=200)
    metric: Optional[str] = Field(default=None)
    operator: Optional[AlertOperator] = Field(default=None)
    threshold: Optional[float] = Field(default=None)
    action: Optional[AlertAction] = Field(default=None)
    severity: Optional[AlertSeverity] = Field(default=None)
    building_id: Optional[str] = Field(default=None)
    enabled: Optional[bool] = Field(default=None)


class AlertAcknowledgeRequest(BaseModel):
    alert_id: str = Field(..., description="ID of the alert to acknowledge")

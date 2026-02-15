from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field
from core.models.alert_model import AlertOperator, AlertAction, AlertSeverity


class AlertRuleResponse(BaseModel):
    id: str
    name: str
    metric: str
    operator: AlertOperator
    threshold: float
    action: AlertAction
    severity: AlertSeverity
    building_id: Optional[str] = None
    enabled: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AlertResponse(BaseModel):
    id: str
    rule_id: str
    device_id: str
    triggered_at: datetime
    metric: str
    value: float
    threshold: float
    message: str
    severity: AlertSeverity
    acknowledged: bool
    acknowledged_at: Optional[datetime] = None
    acknowledged_by: Optional[str] = None

    model_config = {"from_attributes": True}


class AlertRuleListResponse(BaseModel):
    rules: List[AlertRuleResponse]
    total: int


class AlertListResponse(BaseModel):
    alerts: List[AlertResponse]
    total: int

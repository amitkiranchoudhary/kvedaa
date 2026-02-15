from fastapi import APIRouter, HTTPException, Depends, Query
from commons.auth import decodeJWT
from commons.logger import logger
from fastapi.security import OAuth2PasswordBearer
from core.controllers.alert_controller import AlertController
from core.apis.schemas.requests.alert_request import (
    AlertRuleCreateRequest,
    AlertRuleUpdateRequest,
)

logging = logger(__name__)

alert_router = APIRouter(prefix="/api/alerts")
oauth2_schema = OAuth2PasswordBearer(tokenUrl="v1/login")


def get_authenticated_user(token: str):
    user = decodeJWT(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    if user.get("status") != "ACTIVE":
        raise HTTPException(status_code=401, detail="User not active")
    return user


# ---- Alert Rules ----

@alert_router.post("/rules")
async def create_alert_rule(
    request: AlertRuleCreateRequest, token: str = Depends(oauth2_schema)
):
    """Create a new alert rule (e.g. 'If CO2 > 1000ppm')."""
    try:
        get_authenticated_user(token)
        return await AlertController().create_rule(request.model_dump())
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error creating alert rule: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@alert_router.get("/rules")
async def get_all_rules(token: str = Depends(oauth2_schema)):
    """List all alert rules."""
    try:
        get_authenticated_user(token)
        return await AlertController().get_all_rules()
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error listing rules: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@alert_router.get("/rules/{rule_id}")
async def get_rule(rule_id: str, token: str = Depends(oauth2_schema)):
    """Get a specific alert rule."""
    try:
        get_authenticated_user(token)
        return await AlertController().get_rule(rule_id)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error getting rule: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@alert_router.put("/rules/{rule_id}")
async def update_rule(
    rule_id: str,
    request: AlertRuleUpdateRequest,
    token: str = Depends(oauth2_schema),
):
    """Update an alert rule."""
    try:
        get_authenticated_user(token)
        return await AlertController().update_rule(rule_id, request.model_dump())
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error updating rule: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@alert_router.delete("/rules/{rule_id}")
async def delete_rule(rule_id: str, token: str = Depends(oauth2_schema)):
    """Delete an alert rule."""
    try:
        get_authenticated_user(token)
        return await AlertController().delete_rule(rule_id)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error deleting rule: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ---- Triggered Alerts ----

@alert_router.get("/")
async def get_alerts(
    limit: int = Query(default=50, ge=1, le=200),
    acknowledged: bool | None = Query(default=None),
    token: str = Depends(oauth2_schema),
):
    """List triggered alerts, optionally filtered by acknowledged status."""
    try:
        get_authenticated_user(token)
        return await AlertController().get_alerts(limit, acknowledged)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error listing alerts: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@alert_router.get("/device/{device_id}")
async def get_alerts_by_device(
    device_id: str, token: str = Depends(oauth2_schema)
):
    """Get alerts triggered by a specific device."""
    try:
        get_authenticated_user(token)
        return await AlertController().get_alerts_by_device(device_id)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error listing device alerts: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@alert_router.post("/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: str, token: str = Depends(oauth2_schema)):
    """Acknowledge a triggered alert."""
    try:
        user = get_authenticated_user(token)
        return await AlertController().acknowledge_alert(alert_id, user["id"])
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error acknowledging alert: {e}")
        raise HTTPException(status_code=500, detail=str(e))

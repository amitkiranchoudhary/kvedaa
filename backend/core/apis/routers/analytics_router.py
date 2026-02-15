from fastapi import APIRouter, HTTPException, Depends, Query
from commons.auth import decodeJWT
from commons.logger import logger
from fastapi.security import OAuth2PasswordBearer
from core.controllers.telemetry_controller import TelemetryController
from core.cruds.building_crud import BuildingCRUD
from core.cruds.device_crud import DeviceCRUD
from core.cruds.telemetry_crud import TelemetryCRUD
from core.cruds.alert_crud import AlertCRUD
from core.models.device_model import DeviceStatus

logging = logger(__name__)

analytics_router = APIRouter(prefix="/api/analytics")
oauth2_schema = OAuth2PasswordBearer(tokenUrl="v1/login")


def get_authenticated_user(token: str):
    user = decodeJWT(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return user


@analytics_router.get("/energy")
async def get_energy_analytics(
    start: str = Query(..., description="Start date ISO format, e.g. 2026-01-01"),
    end: str = Query(..., description="End date ISO format, e.g. 2026-01-31"),
    token: str = Depends(oauth2_schema),
):
    """Get aggregated energy usage data (daily kWh totals)."""
    try:
        get_authenticated_user(token)
        return await TelemetryController().get_energy_analytics(start, end)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error getting energy analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@analytics_router.get("/comfort")
async def get_comfort_analytics(
    start: str = Query(..., description="Start date ISO format"),
    end: str = Query(..., description="End date ISO format"),
    token: str = Depends(oauth2_schema),
):
    """Get aggregated comfort data (hourly temp/CO2/humidity averages)."""
    try:
        get_authenticated_user(token)
        return await TelemetryController().get_comfort_analytics(start, end)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error getting comfort analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@analytics_router.get("/dashboard")
async def get_dashboard_stats(token: str = Depends(oauth2_schema)):
    """Get dashboard overview statistics."""
    try:
        get_authenticated_user(token)

        building_crud = BuildingCRUD()
        device_crud = DeviceCRUD()
        telemetry_crud = TelemetryCRUD()
        alert_crud = AlertCRUD()

        buildings = await building_crud.get_all()
        devices = await device_crud.get_all()
        online_count = await device_crud.count_by_status(DeviceStatus.ONLINE)
        offline_count = await device_crud.count_by_status(DeviceStatus.OFFLINE)
        telemetry_count = await telemetry_crud.count_total()
        unack_alerts = await alert_crud.count_unacknowledged()

        # Get recent alerts (last 10 unacknowledged)
        recent_alerts = await alert_crud.get_alerts(limit=10, acknowledged=False)
        recent_alerts_data = []
        for a in recent_alerts:
            alert_dict = a.model_dump()
            alert_dict["id"] = str(a.id)
            alert_dict["rule_id"] = str(a.rule_id)
            alert_dict["device_id"] = str(a.device_id)
            if a.acknowledged_by:
                alert_dict["acknowledged_by"] = str(a.acknowledged_by)
            recent_alerts_data.append(alert_dict)

        return {
            "total_buildings": len(buildings),
            "total_devices": len(devices),
            "devices_online": online_count,
            "devices_offline": offline_count,
            "total_telemetry_records": telemetry_count,
            "unacknowledged_alerts": unack_alerts,
            "recent_alerts": recent_alerts_data,
        }

    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error getting dashboard stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

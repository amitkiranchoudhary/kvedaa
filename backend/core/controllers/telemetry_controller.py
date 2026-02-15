from datetime import datetime
from odmantic import ObjectId
from core import logger
from core.cruds.telemetry_crud import TelemetryCRUD
from core.cruds.device_crud import DeviceCRUD
from core.cruds.alert_crud import AlertCRUD
from core.models.device_model import DeviceStatus
from fastapi import HTTPException

logging = logger(__name__)


class TelemetryController:
    def __init__(self):
        self.telemetry_crud = TelemetryCRUD()
        self.device_crud = DeviceCRUD()
        self.alert_crud = AlertCRUD()

    async def ingest_data(self, data: dict, api_key: str):
        """
        High-performance endpoint logic:
        1. Validate API key → identify device
        2. Save telemetry data
        3. Mark device as ONLINE
        4. Check alert rules
        """
        try:
            logging.info("Executing TelemetryController.ingest_data")

            # Step 1: Validate API key
            device = await self.device_crud.get_by_api_key(api_key)
            if not device:
                raise HTTPException(status_code=401, detail="Invalid API key")

            # Verify hardware device_id matches
            if device.device_id != data.get("device_id"):
                raise HTTPException(
                    status_code=403,
                    detail="API key does not match device ID"
                )

            # Step 2: Save telemetry data
            telemetry_data = {
                "device_id": device.id,
                "timestamp": datetime.utcnow(),
                "metrics": data.get("metrics"),
                "readings": data.get("readings"),
            }
            saved = await self.telemetry_crud.create(telemetry_data)

            # Step 3: Mark device as online
            await self.device_crud.update_status(str(device.id), DeviceStatus.ONLINE)

            # Step 4: Check alert rules
            await self._evaluate_alerts(device, data)

            result = saved.model_dump()
            result["id"] = str(saved.id)
            result["device_id"] = str(saved.device_id)
            return {"message": "Telemetry data ingested", "telemetry_id": result["id"]}

        except HTTPException:
            raise
        except Exception as error:
            logging.error(f"Error in TelemetryController.ingest_data: {error}")
            raise HTTPException(status_code=500, detail=str(error))

    async def _evaluate_alerts(self, device, data: dict):
        """Evaluate incoming data against all enabled alert rules."""
        try:
            rules = await self.alert_crud.get_enabled_rules()
            if not rules:
                return

            # Combine metrics and readings into one dict for checking
            all_values = {}
            if data.get("metrics"):
                all_values.update(data["metrics"])
            if data.get("readings"):
                all_values.update(data["readings"])

            for rule in rules:
                if rule.metric not in all_values:
                    continue

                value = all_values[rule.metric]
                triggered = False

                if rule.operator.value == "gt" and value > rule.threshold:
                    triggered = True
                elif rule.operator.value == "lt" and value < rule.threshold:
                    triggered = True
                elif rule.operator.value == "eq" and value == rule.threshold:
                    triggered = True
                elif rule.operator.value == "gte" and value >= rule.threshold:
                    triggered = True
                elif rule.operator.value == "lte" and value <= rule.threshold:
                    triggered = True

                if triggered:
                    alert_data = {
                        "rule_id": rule.id,
                        "device_id": device.id,
                        "metric": rule.metric,
                        "value": value,
                        "threshold": rule.threshold,
                        "message": f"Alert: {rule.name} - {rule.metric} is {value} (threshold: {rule.operator.value} {rule.threshold})",
                        "severity": rule.severity,
                    }
                    await self.alert_crud.create_alert(alert_data)
                    logging.warning(
                        f"ALERT TRIGGERED: {rule.name} on device {device.name} "
                        f"({rule.metric}={value}, threshold {rule.operator.value} {rule.threshold})"
                    )

        except Exception as error:
            logging.error(f"Error evaluating alerts: {error}")
            # Don't raise - alert evaluation failure should not block telemetry ingestion

    async def get_device_telemetry(self, device_id: str, limit: int = 100):
        try:
            logging.info("Executing TelemetryController.get_device_telemetry")
            data = await self.telemetry_crud.get_by_device(device_id, limit)
            result = []
            for t in data:
                item = t.model_dump()
                item["id"] = str(t.id)
                item["device_id"] = str(t.device_id)
                result.append(item)
            return {"data": result, "total": len(result)}
        except Exception as error:
            logging.error(f"Error in TelemetryController.get_device_telemetry: {error}")
            raise HTTPException(status_code=500, detail=str(error))

    async def get_latest_reading(self, device_id: str):
        try:
            logging.info("Executing TelemetryController.get_latest_reading")
            telemetry = await self.telemetry_crud.get_latest_by_device(device_id)
            if not telemetry:
                raise HTTPException(status_code=404, detail="No telemetry data found")
            result = telemetry.model_dump()
            result["id"] = str(telemetry.id)
            result["device_id"] = str(telemetry.device_id)
            return result
        except HTTPException:
            raise
        except Exception as error:
            logging.error(f"Error in TelemetryController.get_latest_reading: {error}")
            raise HTTPException(status_code=500, detail=str(error))

    async def get_energy_analytics(self, start: str, end: str):
        try:
            logging.info("Executing TelemetryController.get_energy_analytics")
            start_dt = datetime.fromisoformat(start)
            end_dt = datetime.fromisoformat(end)
            data = await self.telemetry_crud.get_aggregated_energy(start_dt, end_dt)
            return {
                "period_start": start,
                "period_end": end,
                "data": data
            }
        except ValueError as e:
            raise HTTPException(status_code=400, detail=f"Invalid date format: {e}")
        except Exception as error:
            logging.error(f"Error in TelemetryController.get_energy_analytics: {error}")
            raise HTTPException(status_code=500, detail=str(error))

    async def get_comfort_analytics(self, start: str, end: str):
        try:
            logging.info("Executing TelemetryController.get_comfort_analytics")
            start_dt = datetime.fromisoformat(start)
            end_dt = datetime.fromisoformat(end)
            data = await self.telemetry_crud.get_comfort_summary(start_dt, end_dt)
            return {
                "period_start": start,
                "period_end": end,
                "data": data
            }
        except ValueError as e:
            raise HTTPException(status_code=400, detail=f"Invalid date format: {e}")
        except Exception as error:
            logging.error(f"Error in TelemetryController.get_comfort_analytics: {error}")
            raise HTTPException(status_code=500, detail=str(error))

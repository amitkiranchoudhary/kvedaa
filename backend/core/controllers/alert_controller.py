from core import logger
from core.cruds.alert_crud import AlertCRUD
from fastapi import HTTPException
from odmantic import ObjectId

logging = logger(__name__)


class AlertController:
    def __init__(self):
        self.crud = AlertCRUD()

    def _serialize_rule(self, rule) -> dict:
        data = rule.model_dump()
        data["id"] = str(rule.id)
        if rule.building_id:
            data["building_id"] = str(rule.building_id)
        return data

    def _serialize_alert(self, alert) -> dict:
        data = alert.model_dump()
        data["id"] = str(alert.id)
        data["rule_id"] = str(alert.rule_id)
        data["device_id"] = str(alert.device_id)
        if alert.acknowledged_by:
            data["acknowledged_by"] = str(alert.acknowledged_by)
        return data

    # ---- Alert Rules ----

    async def create_rule(self, data: dict):
        try:
            logging.info("Executing AlertController.create_rule")
            if data.get("building_id"):
                data["building_id"] = ObjectId(data["building_id"])
            rule = await self.crud.create_rule(data)
            return self._serialize_rule(rule)
        except Exception as error:
            logging.error(f"Error in AlertController.create_rule: {error}")
            raise HTTPException(status_code=500, detail=str(error))

    async def get_all_rules(self):
        try:
            logging.info("Executing AlertController.get_all_rules")
            rules = await self.crud.get_all_rules()
            result = [self._serialize_rule(r) for r in rules]
            return {"rules": result, "total": len(result)}
        except Exception as error:
            logging.error(f"Error in AlertController.get_all_rules: {error}")
            raise HTTPException(status_code=500, detail=str(error))

    async def get_rule(self, rule_id: str):
        try:
            rule = await self.crud.get_rule_by_id(rule_id)
            if not rule:
                raise HTTPException(status_code=404, detail="Alert rule not found")
            return self._serialize_rule(rule)
        except HTTPException:
            raise
        except Exception as error:
            logging.error(f"Error in AlertController.get_rule: {error}")
            raise HTTPException(status_code=500, detail=str(error))

    async def update_rule(self, rule_id: str, update_data: dict):
        try:
            logging.info("Executing AlertController.update_rule")
            clean_data = {k: v for k, v in update_data.items() if v is not None}
            if "building_id" in clean_data and clean_data["building_id"]:
                clean_data["building_id"] = ObjectId(clean_data["building_id"])
            rule = await self.crud.update_rule(rule_id, clean_data)
            if not rule:
                raise HTTPException(status_code=404, detail="Rule not found or no changes")
            return self._serialize_rule(rule)
        except HTTPException:
            raise
        except Exception as error:
            logging.error(f"Error in AlertController.update_rule: {error}")
            raise HTTPException(status_code=500, detail=str(error))

    async def delete_rule(self, rule_id: str):
        try:
            deleted = await self.crud.delete_rule(rule_id)
            if not deleted:
                raise HTTPException(status_code=404, detail="Rule not found")
            return {"message": "Alert rule deleted", "id": rule_id}
        except HTTPException:
            raise
        except Exception as error:
            logging.error(f"Error in AlertController.delete_rule: {error}")
            raise HTTPException(status_code=500, detail=str(error))

    # ---- Triggered Alerts ----

    async def get_alerts(self, limit: int = 50, acknowledged: bool | None = None):
        try:
            logging.info("Executing AlertController.get_alerts")
            alerts = await self.crud.get_alerts(limit, acknowledged)
            result = [self._serialize_alert(a) for a in alerts]
            return {"alerts": result, "total": len(result)}
        except Exception as error:
            logging.error(f"Error in AlertController.get_alerts: {error}")
            raise HTTPException(status_code=500, detail=str(error))

    async def get_alerts_by_device(self, device_id: str):
        try:
            alerts = await self.crud.get_alerts_by_device(device_id)
            result = [self._serialize_alert(a) for a in alerts]
            return {"alerts": result, "total": len(result)}
        except Exception as error:
            logging.error(f"Error in AlertController.get_alerts_by_device: {error}")
            raise HTTPException(status_code=500, detail=str(error))

    async def acknowledge_alert(self, alert_id: str, user_id: str):
        try:
            logging.info("Executing AlertController.acknowledge_alert")
            alert = await self.crud.acknowledge_alert(alert_id, user_id)
            if not alert:
                raise HTTPException(status_code=404, detail="Alert not found")
            return self._serialize_alert(alert)
        except HTTPException:
            raise
        except Exception as error:
            logging.error(f"Error in AlertController.acknowledge_alert: {error}")
            raise HTTPException(status_code=500, detail=str(error))

from odmantic import ObjectId
from core.models.alert_model import AlertRule, Alert
from commons.logger import logger
from core.database.database import get_engine
from datetime import datetime

logging = logger(__name__)


class AlertCRUD:
    def __init__(self):
        self.engine = get_engine()

    # ---- Alert Rules ----

    async def create_rule(self, data: dict) -> AlertRule:
        try:
            logging.info("Executing AlertCRUD.create_rule")
            rule = AlertRule(**data)
            saved = await self.engine.save(rule)
            logging.info(f"Alert rule created: {saved.id}")
            return saved
        except Exception as error:
            logging.error(f"Error in AlertCRUD.create_rule: {error}")
            raise

    async def get_rule_by_id(self, id: str) -> AlertRule | None:
        try:
            rule_id = ObjectId(id)
            return await self.engine.find_one(AlertRule, AlertRule.id == rule_id)
        except Exception as error:
            logging.error(f"Error in AlertCRUD.get_rule_by_id: {error}")
            raise

    async def get_all_rules(self) -> list[AlertRule]:
        try:
            logging.info("Executing AlertCRUD.get_all_rules")
            return await self.engine.find(AlertRule)
        except Exception as error:
            logging.error(f"Error in AlertCRUD.get_all_rules: {error}")
            raise

    async def get_enabled_rules(self) -> list[AlertRule]:
        """Get only active/enabled alert rules for evaluation."""
        try:
            logging.info("Executing AlertCRUD.get_enabled_rules")
            return await self.engine.find(AlertRule, AlertRule.enabled == True)
        except Exception as error:
            logging.error(f"Error in AlertCRUD.get_enabled_rules: {error}")
            raise

    async def update_rule(self, id: str, update_data: dict) -> AlertRule | None:
        try:
            logging.info("Executing AlertCRUD.update_rule")
            update_dict = {k: v for k, v in update_data.items() if v is not None}
            if not update_dict:
                return None
            update_dict["updated_at"] = datetime.utcnow()
            collection = self.engine.get_collection(AlertRule)
            mongo_id = ObjectId(id)
            result = await collection.update_one(
                {"_id": mongo_id}, {"$set": update_dict}
            )
            if result.modified_count == 0:
                return None
            return await self.engine.find_one(AlertRule, AlertRule.id == mongo_id)
        except Exception as error:
            logging.error(f"Error in AlertCRUD.update_rule: {error}")
            raise

    async def delete_rule(self, id: str) -> bool:
        try:
            rule = await self.get_rule_by_id(id)
            if not rule:
                return False
            await self.engine.delete(rule)
            logging.info(f"Alert rule deleted: {id}")
            return True
        except Exception as error:
            logging.error(f"Error in AlertCRUD.delete_rule: {error}")
            raise

    # ---- Triggered Alerts ----

    async def create_alert(self, data: dict) -> Alert:
        try:
            logging.info("Executing AlertCRUD.create_alert")
            alert = Alert(**data)
            saved = await self.engine.save(alert)
            logging.info(f"Alert triggered: {saved.id}")
            return saved
        except Exception as error:
            logging.error(f"Error in AlertCRUD.create_alert: {error}")
            raise

    async def get_alerts(self, limit: int = 50, acknowledged: bool | None = None) -> list[Alert]:
        """Get triggered alerts, optionally filtered by acknowledged status."""
        try:
            logging.info("Executing AlertCRUD.get_alerts")
            collection = self.engine.get_collection(Alert)
            query = {}
            if acknowledged is not None:
                query["acknowledged"] = acknowledged

            docs = await collection.find(query).sort(
                "triggered_at", -1
            ).limit(limit).to_list(length=limit)

            results = []
            for doc in docs:
                doc["id"] = doc.pop("_id")
                results.append(Alert(**doc))
            return results
        except Exception as error:
            logging.error(f"Error in AlertCRUD.get_alerts: {error}")
            raise

    async def get_alerts_by_device(self, device_id: str, limit: int = 20) -> list[Alert]:
        try:
            did = ObjectId(device_id)
            collection = self.engine.get_collection(Alert)
            docs = await collection.find(
                {"device_id": did}
            ).sort("triggered_at", -1).limit(limit).to_list(length=limit)

            results = []
            for doc in docs:
                doc["id"] = doc.pop("_id")
                results.append(Alert(**doc))
            return results
        except Exception as error:
            logging.error(f"Error in AlertCRUD.get_alerts_by_device: {error}")
            raise

    async def acknowledge_alert(self, alert_id: str, user_id: str) -> Alert | None:
        try:
            logging.info("Executing AlertCRUD.acknowledge_alert")
            collection = self.engine.get_collection(Alert)
            mongo_id = ObjectId(alert_id)
            result = await collection.update_one(
                {"_id": mongo_id},
                {
                    "$set": {
                        "acknowledged": True,
                        "acknowledged_at": datetime.utcnow(),
                        "acknowledged_by": ObjectId(user_id),
                    }
                },
            )
            if result.modified_count == 0:
                return None
            doc = await collection.find_one({"_id": mongo_id})
            if doc:
                doc["id"] = doc.pop("_id")
                return Alert(**doc)
            return None
        except Exception as error:
            logging.error(f"Error in AlertCRUD.acknowledge_alert: {error}")
            raise

    async def count_unacknowledged(self) -> int:
        """Count unacknowledged alerts."""
        try:
            collection = self.engine.get_collection(Alert)
            return await collection.count_documents({"acknowledged": False})
        except Exception as error:
            logging.error(f"Error in AlertCRUD.count_unacknowledged: {error}")
            raise

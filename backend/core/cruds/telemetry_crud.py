from odmantic import ObjectId
from core.models.telemetry_model import Telemetry
from commons.logger import logger
from core.database.database import get_engine
from datetime import datetime

logging = logger(__name__)


class TelemetryCRUD:
    def __init__(self):
        self.engine = get_engine()

    async def create(self, data: dict) -> Telemetry:
        try:
            logging.info("Executing TelemetryCRUD.create")
            telemetry = Telemetry(**data)
            saved = await self.engine.save(telemetry)
            logging.info(f"Telemetry saved for device: {data.get('device_id')}")
            return saved
        except Exception as error:
            logging.error(f"Error in TelemetryCRUD.create: {error}")
            raise

    async def get_by_device(self, device_id: str, limit: int = 100) -> list[Telemetry]:
        """Get telemetry data for a specific device, most recent first."""
        try:
            logging.info("Executing TelemetryCRUD.get_by_device")
            did = ObjectId(device_id)
            collection = self.engine.get_collection(Telemetry)
            docs = await collection.find(
                {"device_id": did}
            ).sort("timestamp", -1).limit(limit).to_list(length=limit)

            results = []
            for doc in docs:
                doc["id"] = doc.pop("_id")
                results.append(Telemetry(**doc))
            return results
        except Exception as error:
            logging.error(f"Error in TelemetryCRUD.get_by_device: {error}")
            raise

    async def get_latest_by_device(self, device_id: str) -> Telemetry | None:
        """Get the most recent telemetry reading for a device."""
        try:
            logging.info("Executing TelemetryCRUD.get_latest_by_device")
            did = ObjectId(device_id)
            collection = self.engine.get_collection(Telemetry)
            docs = await collection.find(
                {"device_id": did}
            ).sort("timestamp", -1).limit(1).to_list(length=1)

            if not docs:
                return None
            doc = docs[0]
            doc["id"] = doc.pop("_id")
            return Telemetry(**doc)
        except Exception as error:
            logging.error(f"Error in TelemetryCRUD.get_latest_by_device: {error}")
            raise

    async def get_by_timerange(
        self, device_id: str, start: datetime, end: datetime, limit: int = 1000
    ) -> list[Telemetry]:
        """Get telemetry data within a time range for a device."""
        try:
            logging.info("Executing TelemetryCRUD.get_by_timerange")
            did = ObjectId(device_id)
            collection = self.engine.get_collection(Telemetry)
            docs = await collection.find({
                "device_id": did,
                "timestamp": {"$gte": start, "$lte": end}
            }).sort("timestamp", 1).limit(limit).to_list(length=limit)

            results = []
            for doc in docs:
                doc["id"] = doc.pop("_id")
                results.append(Telemetry(**doc))
            return results
        except Exception as error:
            logging.error(f"Error in TelemetryCRUD.get_by_timerange: {error}")
            raise

    async def get_aggregated_energy(
        self, start: datetime, end: datetime
    ) -> list[dict]:
        """
        Aggregate energy data (kwh) across all devices within a time range.
        Returns daily totals.
        """
        try:
            logging.info("Executing TelemetryCRUD.get_aggregated_energy")
            collection = self.engine.get_collection(Telemetry)
            pipeline = [
                {
                    "$match": {
                        "timestamp": {"$gte": start, "$lte": end},
                        "metrics.kwh": {"$exists": True}
                    }
                },
                {
                    "$group": {
                        "_id": {
                            "$dateToString": {"format": "%Y-%m-%d", "date": "$timestamp"}
                        },
                        "total_kwh": {"$sum": "$metrics.kwh"},
                        "avg_voltage": {"$avg": "$metrics.voltage"},
                        "avg_amperage": {"$avg": "$metrics.amperage"},
                        "data_points": {"$sum": 1}
                    }
                },
                {"$sort": {"_id": 1}}
            ]
            results = await collection.aggregate(pipeline).to_list(length=365)
            return [
                {
                    "date": r["_id"],
                    "total_kwh": round(r["total_kwh"], 2),
                    "avg_voltage": round(r.get("avg_voltage", 0), 2),
                    "avg_amperage": round(r.get("avg_amperage", 0), 2),
                    "data_points": r["data_points"]
                }
                for r in results
            ]
        except Exception as error:
            logging.error(f"Error in TelemetryCRUD.get_aggregated_energy: {error}")
            raise

    async def get_comfort_summary(
        self, start: datetime, end: datetime
    ) -> list[dict]:
        """
        Aggregate comfort data (temperature, CO2, humidity) within a time range.
        Returns hourly averages.
        """
        try:
            logging.info("Executing TelemetryCRUD.get_comfort_summary")
            collection = self.engine.get_collection(Telemetry)
            pipeline = [
                {
                    "$match": {
                        "timestamp": {"$gte": start, "$lte": end},
                        "readings": {"$exists": True, "$ne": None}
                    }
                },
                {
                    "$group": {
                        "_id": {
                            "$dateToString": {
                                "format": "%Y-%m-%dT%H:00:00",
                                "date": "$timestamp"
                            }
                        },
                        "avg_temperature": {"$avg": "$readings.temperature_c"},
                        "avg_co2": {"$avg": "$readings.co2_ppm"},
                        "avg_humidity": {"$avg": "$readings.humidity_pct"},
                        "data_points": {"$sum": 1}
                    }
                },
                {"$sort": {"_id": 1}}
            ]
            results = await collection.aggregate(pipeline).to_list(length=1000)
            return [
                {
                    "hour": r["_id"],
                    "avg_temperature": round(r.get("avg_temperature") or 0, 1),
                    "avg_co2": round(r.get("avg_co2") or 0, 0),
                    "avg_humidity": round(r.get("avg_humidity") or 0, 1),
                    "data_points": r["data_points"]
                }
                for r in results
            ]
        except Exception as error:
            logging.error(f"Error in TelemetryCRUD.get_comfort_summary: {error}")
            raise

    async def count_total(self) -> int:
        """Count total telemetry records."""
        try:
            collection = self.engine.get_collection(Telemetry)
            return await collection.count_documents({})
        except Exception as error:
            logging.error(f"Error in TelemetryCRUD.count_total: {error}")
            raise

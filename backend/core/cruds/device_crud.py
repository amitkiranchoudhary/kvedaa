from odmantic import ObjectId
from core.models.device_model import Device, DeviceStatus
from commons.logger import logger
from core.database.database import get_engine
from datetime import datetime

logging = logger(__name__)


class DeviceCRUD:
    def __init__(self):
        self.engine = get_engine()

    async def create(self, data: dict) -> Device:
        try:
            logging.info("Executing DeviceCRUD.create")
            device = Device(**data)
            saved = await self.engine.save(device)
            logging.info(f"Device created with id: {saved.id}")
            return saved
        except Exception as error:
            logging.error(f"Error in DeviceCRUD.create: {error}")
            raise

    async def get_by_id(self, id: str) -> Device | None:
        try:
            logging.info("Executing DeviceCRUD.get_by_id")
            device_id = ObjectId(id)
            return await self.engine.find_one(Device, Device.id == device_id)
        except Exception as error:
            logging.error(f"Error in DeviceCRUD.get_by_id: {error}")
            raise

    async def get_by_device_id(self, device_id: str) -> Device | None:
        """Get device by its hardware ID (MAC address)."""
        try:
            logging.info("Executing DeviceCRUD.get_by_device_id")
            return await self.engine.find_one(Device, Device.device_id == device_id)
        except Exception as error:
            logging.error(f"Error in DeviceCRUD.get_by_device_id: {error}")
            raise

    async def get_by_api_key(self, api_key: str) -> Device | None:
        """Get device by its API key (used for telemetry authentication)."""
        try:
            logging.info("Executing DeviceCRUD.get_by_api_key")
            return await self.engine.find_one(Device, Device.api_key == api_key)
        except Exception as error:
            logging.error(f"Error in DeviceCRUD.get_by_api_key: {error}")
            raise

    async def get_all(self) -> list[Device]:
        try:
            logging.info("Executing DeviceCRUD.get_all")
            return await self.engine.find(Device)
        except Exception as error:
            logging.error(f"Error in DeviceCRUD.get_all: {error}")
            raise

    async def get_by_building(self, building_id: str) -> list[Device]:
        try:
            logging.info("Executing DeviceCRUD.get_by_building")
            bid = ObjectId(building_id)
            return await self.engine.find(Device, Device.building_id == bid)
        except Exception as error:
            logging.error(f"Error in DeviceCRUD.get_by_building: {error}")
            raise

    async def update(self, id: str, update_data: dict) -> Device | None:
        try:
            logging.info("Executing DeviceCRUD.update")
            update_dict = {k: v for k, v in update_data.items() if v is not None}
            if not update_dict:
                return None
            update_dict["updated_at"] = datetime.utcnow()
            collection = self.engine.get_collection(Device)
            mongo_id = ObjectId(id)
            result = await collection.update_one(
                {"_id": mongo_id}, {"$set": update_dict}
            )
            if result.modified_count == 0:
                return None
            return await self.engine.find_one(Device, Device.id == mongo_id)
        except Exception as error:
            logging.error(f"Error in DeviceCRUD.update: {error}")
            raise

    async def update_status(self, id: str, status: DeviceStatus) -> Device | None:
        """Update device status and last_seen timestamp."""
        try:
            logging.info(f"Executing DeviceCRUD.update_status -> {status}")
            return await self.update(id, {
                "status": status.value,
                "last_seen": datetime.utcnow()
            })
        except Exception as error:
            logging.error(f"Error in DeviceCRUD.update_status: {error}")
            raise

    async def delete(self, id: str) -> bool:
        try:
            logging.info("Executing DeviceCRUD.delete")
            device = await self.get_by_id(id)
            if not device:
                return False
            await self.engine.delete(device)
            logging.info(f"Device deleted: {id}")
            return True
        except Exception as error:
            logging.error(f"Error in DeviceCRUD.delete: {error}")
            raise

    async def count_by_building(self, building_id: str) -> int:
        """Count devices in a building."""
        try:
            collection = self.engine.get_collection(Device)
            bid = ObjectId(building_id)
            count = await collection.count_documents({"building_id": bid})
            return count
        except Exception as error:
            logging.error(f"Error in DeviceCRUD.count_by_building: {error}")
            raise

    async def count_by_status(self, status: DeviceStatus) -> int:
        """Count devices by status."""
        try:
            collection = self.engine.get_collection(Device)
            count = await collection.count_documents({"status": status.value})
            return count
        except Exception as error:
            logging.error(f"Error in DeviceCRUD.count_by_status: {error}")
            raise

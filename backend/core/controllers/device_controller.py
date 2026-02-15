import secrets
from odmantic import ObjectId
from core import logger
from core.cruds.device_crud import DeviceCRUD
from core.cruds.building_crud import BuildingCRUD
from fastapi import HTTPException

logging = logger(__name__)


class DeviceController:
    def __init__(self):
        self.device_crud = DeviceCRUD()
        self.building_crud = BuildingCRUD()

    def _generate_api_key(self) -> str:
        """Generate a secure random API key for IoT device authentication."""
        return f"kv_{secrets.token_urlsafe(32)}"

    def _serialize_device(self, device) -> dict:
        """Convert device model to response dict."""
        data = device.model_dump()
        data["id"] = str(device.id)
        data["building_id"] = str(device.building_id)
        return data

    async def register_device(self, data: dict):
        """Register a new IoT device/sensor."""
        try:
            logging.info("Executing DeviceController.register_device")

            # Check if device_id (hardware ID) already exists
            existing = await self.device_crud.get_by_device_id(data["device_id"])
            if existing:
                raise HTTPException(
                    status_code=409,
                    detail=f"Device with hardware ID '{data['device_id']}' already registered"
                )

            # Verify building exists
            building = await self.building_crud.get_by_id(data["building_id"])
            if not building:
                raise HTTPException(status_code=404, detail="Building not found")

            # Generate API key and set building_id as ObjectId
            data["api_key"] = self._generate_api_key()
            data["building_id"] = ObjectId(data["building_id"])

            device = await self.device_crud.create(data)
            return self._serialize_device(device)

        except HTTPException:
            raise
        except Exception as error:
            logging.error(f"Error in DeviceController.register_device: {error}")
            raise HTTPException(status_code=500, detail=str(error))

    async def get_device(self, device_id: str):
        try:
            logging.info("Executing DeviceController.get_device")
            device = await self.device_crud.get_by_id(device_id)
            if not device:
                raise HTTPException(status_code=404, detail="Device not found")
            return self._serialize_device(device)
        except HTTPException:
            raise
        except Exception as error:
            logging.error(f"Error in DeviceController.get_device: {error}")
            raise HTTPException(status_code=500, detail=str(error))

    async def get_all_devices(self):
        try:
            logging.info("Executing DeviceController.get_all_devices")
            devices = await self.device_crud.get_all()
            result = [self._serialize_device(d) for d in devices]
            return {"devices": result, "total": len(result)}
        except Exception as error:
            logging.error(f"Error in DeviceController.get_all_devices: {error}")
            raise HTTPException(status_code=500, detail=str(error))

    async def get_devices_by_building(self, building_id: str):
        try:
            logging.info("Executing DeviceController.get_devices_by_building")
            devices = await self.device_crud.get_by_building(building_id)
            result = [self._serialize_device(d) for d in devices]
            return {"devices": result, "total": len(result)}
        except Exception as error:
            logging.error(f"Error in DeviceController.get_devices_by_building: {error}")
            raise HTTPException(status_code=500, detail=str(error))

    async def get_device_status(self, device_id: str):
        try:
            device = await self.device_crud.get_by_id(device_id)
            if not device:
                raise HTTPException(status_code=404, detail="Device not found")
            return {
                "device_id": device.device_id,
                "name": device.name,
                "status": device.status,
                "last_seen": device.last_seen
            }
        except HTTPException:
            raise
        except Exception as error:
            logging.error(f"Error in DeviceController.get_device_status: {error}")
            raise HTTPException(status_code=500, detail=str(error))

    async def update_device(self, device_id: str, update_data: dict):
        try:
            logging.info("Executing DeviceController.update_device")
            # Convert building_id string to ObjectId if provided
            if "building_id" in update_data and update_data["building_id"]:
                building = await self.building_crud.get_by_id(update_data["building_id"])
                if not building:
                    raise HTTPException(status_code=404, detail="Building not found")
                update_data["building_id"] = ObjectId(update_data["building_id"])

            device = await self.device_crud.update(device_id, update_data)
            if not device:
                raise HTTPException(status_code=404, detail="Device not found or no changes")
            return self._serialize_device(device)
        except HTTPException:
            raise
        except Exception as error:
            logging.error(f"Error in DeviceController.update_device: {error}")
            raise HTTPException(status_code=500, detail=str(error))

    async def delete_device(self, device_id: str):
        try:
            logging.info("Executing DeviceController.delete_device")
            deleted = await self.device_crud.delete(device_id)
            if not deleted:
                raise HTTPException(status_code=404, detail="Device not found")
            return {"message": "Device deleted successfully", "id": device_id}
        except HTTPException:
            raise
        except Exception as error:
            logging.error(f"Error in DeviceController.delete_device: {error}")
            raise HTTPException(status_code=500, detail=str(error))

    async def regenerate_api_key(self, device_id: str):
        """Generate a new API key for a device."""
        try:
            logging.info("Executing DeviceController.regenerate_api_key")
            new_key = self._generate_api_key()
            device = await self.device_crud.update(device_id, {"api_key": new_key})
            if not device:
                raise HTTPException(status_code=404, detail="Device not found")
            return {"device_id": device_id, "api_key": new_key}
        except HTTPException:
            raise
        except Exception as error:
            logging.error(f"Error in DeviceController.regenerate_api_key: {error}")
            raise HTTPException(status_code=500, detail=str(error))

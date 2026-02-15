from odmantic import ObjectId
from core.models.building_model import Building
from commons.logger import logger
from core.database.database import get_engine
from datetime import datetime

logging = logger(__name__)


class BuildingCRUD:
    def __init__(self):
        self.engine = get_engine()

    async def create(self, data: dict) -> Building:
        try:
            logging.info("Executing BuildingCRUD.create")
            building = Building(**data)
            saved = await self.engine.save(building)
            logging.info(f"Building created with id: {saved.id}")
            return saved
        except Exception as error:
            logging.error(f"Error in BuildingCRUD.create: {error}")
            raise

    async def get_by_id(self, id: str) -> Building | None:
        try:
            logging.info("Executing BuildingCRUD.get_by_id")
            building_id = ObjectId(id)
            building = await self.engine.find_one(Building, Building.id == building_id)
            return building
        except Exception as error:
            logging.error(f"Error in BuildingCRUD.get_by_id: {error}")
            raise

    async def get_all(self) -> list[Building]:
        try:
            logging.info("Executing BuildingCRUD.get_all")
            buildings = await self.engine.find(Building)
            return buildings
        except Exception as error:
            logging.error(f"Error in BuildingCRUD.get_all: {error}")
            raise

    async def get_by_manager(self, manager_id: str) -> list[Building]:
        try:
            logging.info("Executing BuildingCRUD.get_by_manager")
            mid = ObjectId(manager_id)
            buildings = await self.engine.find(Building, Building.manager_id == mid)
            return buildings
        except Exception as error:
            logging.error(f"Error in BuildingCRUD.get_by_manager: {error}")
            raise

    async def update(self, id: str, update_data: dict) -> Building | None:
        try:
            logging.info("Executing BuildingCRUD.update")
            update_dict = {k: v for k, v in update_data.items() if v is not None}
            if not update_dict:
                return None
            update_dict["updated_at"] = datetime.utcnow()
            collection = self.engine.get_collection(Building)
            mongo_id = ObjectId(id)
            result = await collection.update_one(
                {"_id": mongo_id}, {"$set": update_dict}
            )
            if result.modified_count == 0:
                return None
            return await self.engine.find_one(Building, Building.id == mongo_id)
        except Exception as error:
            logging.error(f"Error in BuildingCRUD.update: {error}")
            raise

    async def delete(self, id: str) -> bool:
        try:
            logging.info("Executing BuildingCRUD.delete")
            building = await self.get_by_id(id)
            if not building:
                return False
            await self.engine.delete(building)
            logging.info(f"Building deleted: {id}")
            return True
        except Exception as error:
            logging.error(f"Error in BuildingCRUD.delete: {error}")
            raise

from core import logger
from core.cruds.building_crud import BuildingCRUD
from fastapi import HTTPException

logging = logger(__name__)


class BuildingController:
    def __init__(self):
        self.crud = BuildingCRUD()

    async def create_building(self, data: dict, user_id: str):
        try:
            logging.info("Executing BuildingController.create_building")
            data["manager_id"] = user_id
            building = await self.crud.create(data)
            result = building.model_dump()
            result["id"] = str(building.id)
            result["manager_id"] = str(building.manager_id)
            return result
        except Exception as error:
            logging.error(f"Error in BuildingController.create_building: {error}")
            raise HTTPException(status_code=500, detail=str(error))

    async def get_building(self, building_id: str):
        try:
            logging.info("Executing BuildingController.get_building")
            building = await self.crud.get_by_id(building_id)
            if not building:
                raise HTTPException(status_code=404, detail="Building not found")
            result = building.model_dump()
            result["id"] = str(building.id)
            result["manager_id"] = str(building.manager_id)
            return result
        except HTTPException:
            raise
        except Exception as error:
            logging.error(f"Error in BuildingController.get_building: {error}")
            raise HTTPException(status_code=500, detail=str(error))

    async def get_all_buildings(self):
        try:
            logging.info("Executing BuildingController.get_all_buildings")
            buildings = await self.crud.get_all()
            result = []
            for b in buildings:
                data = b.model_dump()
                data["id"] = str(b.id)
                data["manager_id"] = str(b.manager_id)
                result.append(data)
            return {"buildings": result, "total": len(result)}
        except Exception as error:
            logging.error(f"Error in BuildingController.get_all_buildings: {error}")
            raise HTTPException(status_code=500, detail=str(error))

    async def update_building(self, building_id: str, update_data: dict):
        try:
            logging.info("Executing BuildingController.update_building")
            building = await self.crud.update(building_id, update_data)
            if not building:
                raise HTTPException(status_code=404, detail="Building not found or no changes")
            result = building.model_dump()
            result["id"] = str(building.id)
            result["manager_id"] = str(building.manager_id)
            return result
        except HTTPException:
            raise
        except Exception as error:
            logging.error(f"Error in BuildingController.update_building: {error}")
            raise HTTPException(status_code=500, detail=str(error))

    async def delete_building(self, building_id: str):
        try:
            logging.info("Executing BuildingController.delete_building")
            deleted = await self.crud.delete(building_id)
            if not deleted:
                raise HTTPException(status_code=404, detail="Building not found")
            return {"message": "Building deleted successfully", "id": building_id}
        except HTTPException:
            raise
        except Exception as error:
            logging.error(f"Error in BuildingController.delete_building: {error}")
            raise HTTPException(status_code=500, detail=str(error))

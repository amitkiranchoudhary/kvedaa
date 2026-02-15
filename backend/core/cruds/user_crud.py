from odmantic import ObjectId
from core.models.user_model import User
from commons.logger import logger
from core.database.database import get_engine
from fastapi import HTTPException
from core.apis.schemas.requests.user_request import UserCreateRequest

logging = logger(__name__)


class UserCRUD:
    def __init__(self):
        self.User = User
        self.engine = get_engine()

    async def create(self, user: dict):
        try:
            logging.info("Executing userCRUD create")
            saved_user = await self.engine.save(User(**user))
            logging.info(f"User created with id :{saved_user.id}")
            return saved_user
        except HTTPException as error:
            logging.error("Error in UserCRUD")
            raise error

    async def get_by_email(self, email: str):
        try:
            logging.info("Executing userCRUD get_by_email")
            user = await self.engine.find_one(User, User.email == email)
            if user:
                logging.info(f"User found with email: {email}")
            else:
                logging.info(f"User not found with email: {email}")
            return user
        except HTTPException as error:
            logging.error("Error in UserCRUD")
            raise error

    async def get_by_id(self, id: str):
        try:
            logging.info("Executing UserCRUD.get_by_id")
            user_id = ObjectId(id)
            user = await self.engine.find_one(User, User.id == user_id)
            logging.info(f"User found with id: {id}")
            return user
        except Exception as error:
            logging.error(f"Error UserCRUD.get_by_id {str(error)}")
            raise error

    async def update(self, id: str, update_data):
        """
        Update user by ID using atomic MongoDB update_one operation.
        This is faster and safer than fetch-modify-save pattern.

        Args:
            id: User ID as string
            update_data: UpdateUserRequest schema or dict

        Returns:
            Updated user object or None if not found

        How it works:
            1. Validates data with Pydantic schema
            2. Filters out None values (only update what's provided)
            3. Uses MongoDB's $set operator for atomic update
            4. Automatically updates the updated_at timestamp
            5. Returns the fresh updated user from database
        """
        try:
            logging.info("Executing UserCRUD.update function")

            # Import UpdateUserRequest for validation
            from core.apis.schemas.requests.user_request import UserUpdateRequest
            from datetime import datetime

            # Step 1: Validate data with Pydantic schema
            if isinstance(update_data, dict):
                validated_data = UserUpdateRequest(**update_data)
            else:
                validated_data = update_data

            # Step 2: Convert to dict and filter out None values
            # exclude_none=True means: only include fields that have actual values
            update_dict = validated_data.model_dump(exclude_none=True)

            if not update_dict:
                logging.warning("No fields to update")
                return None

            # Step 3: Add updated_at timestamp automatically
            update_dict["updated_at"] = datetime.utcnow()

            # Step 4: Get the raw MongoDB collection (Motor driver)
            collection = self.engine.get_collection(User)

            # Step 5: Convert string ID to MongoDB ObjectId
            mongo_id = ObjectId(id)

            # Step 6: Perform atomic update using MongoDB's $set operator
            # This updates ONLY the specified fields without fetching first
            result = await collection.update_one(
                {"_id": mongo_id},  # Find document by ID
                {"$set": update_dict},  # Update only these fields
            )

            # Step 7: Check if any document was actually updated
            if result.modified_count == 0:
                logging.warning(
                    "No document was updated (user not found or no changes)"
                )
                return None

            # Step 8: Fetch and return the updated user
            updated_user = await self.engine.find_one(User, User.id == mongo_id)
            logging.info("User updated successfully")
            return updated_user

        except Exception as error:
            logging.error(f"Error updating user: {str(error)}")
            raise

from h11._readers import Http10Reader
from core.apis.schemas.requests.user_request import LoginRequest
from commons.auth import signJWT
from commons.auth import encrypt_password
from core import logger
from core.cruds.user_crud import UserCRUD
from core.apis.schemas.requests.user_request import (
    UserCreateRequest,
    PasswordResetRequest,
)
from fastapi import HTTPException, status
from commons.auth import verify_password


logging = logger(__name__)


class UserController:
    def __init__(self):
        self.UserCRUD = UserCRUD()  # Create an instance

    async def create_user(self, user_request: dict):
        try:
            logging.info("Executing UserController.create_user")
            user = await self.UserCRUD.get_by_email(user_request.get("email", ""))
            if user:
                logging.info("User with this email already exist")
                raise HTTPException(
                    status_code=500, detail="User with this email already exist"
                )
            user_request["hashed_password"] = encrypt_password(
                password=user_request.get("password", "")
            )
            user_request["status"] = "ACTIVE"
            user_request.pop("password", None)
            saved_user = await self.UserCRUD.create(user_request)
            access_token = signJWT(
                id=str(saved_user.id),
                expiry_duration=3600,
                user_status=saved_user.status,
            )
            user_data = saved_user.model_dump()
            user_data["id"] = str(saved_user.id)
            return {"user": user_data, "access_token": access_token}
        except HTTPException as error:
            logging.error(f"Error in UserController.create_user {str(error)}")
            raise error

    async def login_user(self, login_request: dict):
        try:
            logging.info("Executing UserController.login_user")
            email = login_request.get("email", "")
            password = login_request.get("password", "")
            user = await self.UserCRUD.get_by_email(email)
            if not user:
                logging.info("User not found")
                raise HTTPException(status_code=404, detail="User not found")
            if not verify_password(password, user.hashed_password):
                logging.info("Invalid Password")
                raise HTTPException(status_code=401, detail="Invalid Credentials")
            access_token = signJWT(
                id=str(user.id), expiry_duration=3600, user_status=user.status
            )
            login_data = user.model_dump()
            login_data["id"] = str(user.id)
            return {"user": login_data, "access_token": access_token}
        except HTTPException as error:
            logging.error(f"Error UserController.login_request {str(error)}")
            raise error

    async def reset_password(
        self, reset_request: dict, authenticated_user_details: dict
    ):
        try:
            logging.info("Executing UserController.reset_password")
            user_id = authenticated_user_details.get("id", "")
            user = await self.UserCRUD.get_by_id(user_id)
            if not user:
                logging.info("User not found")
                raise HTTPException(status_code=404, detail="User not found")
            if not verify_password(
                reset_request.get("old_password"), user.hashed_password
            ):
                logging.info("Invalid Password")
                raise HTTPException(status_code=400, detail="Bad request")

            # Create update data with encrypted new password
            new_hashed_password = encrypt_password(
                password=reset_request.get("new_password", "")
            )
            update_data = {"hashed_password": new_hashed_password}

            # Update user with id and update_data
            await self.UserCRUD.update(id=user_id, update_data=update_data)

            logging.info("Password reset successful")
            return {"message": "Password reset successful"}
        except HTTPException as error:
            logging.error(f"Error UserController.reset_password {str(error)}")
            raise error

    async def forget_password(self, request: dict):
        try:
            logging.info("Executing UserController.forget_password")
            from random import randint
            from datetime import datetime, timedelta
            from core.utils.email.email import send_email
            from core.utils.email.email_template import get_otp_email_template

            email = request.get("email")
            user = await self.UserCRUD.get_by_email(email)
            if not user:
                # Security: ensure we don't reveal if user exists, but for now strict logic
                logging.info(f"User not found for email: {email}")
                raise HTTPException(status_code=404, detail="User not found")

            # Generate OTP
            otp = str(randint(1000, 9999))
            expiry_time = datetime.utcnow() + timedelta(minutes=10)

            # Store OTP in DB
            update_data = {
                "otp_code": otp,
                "otp_expires_at": expiry_time.isoformat(),
            }
            # We need to cast id to string because update expects string id
            await self.UserCRUD.update(id=str(user.id), update_data=update_data)

            # Send Email
            try:
                html_content = get_otp_email_template(
                    username=f"{user.first_name} {user.last_name}", otp=otp
                )
                await send_email(
                    subject="Password Reset OTP",
                    to_email=email,
                    text=f"Your OTP is {otp}",
                    html=html_content,
                )
            except Exception as e:
                logging.error(f"Failed to send email: {e}")
                # We might want to rollback the OTP or just error out
                raise HTTPException(status_code=500, detail="Failed to send OTP email")

            return {"message": "OTP sent successfully"}

        except HTTPException as error:
            logging.error(f"Error in forget_password: {error}")
            raise error
        except Exception as e:
            logging.error(f"Unexpected error in forget_password: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    async def reset_password_with_otp(self, request: dict):
        try:
            logging.info("Executing UserController.reset_password_with_otp")
            from datetime import datetime

            email = request.get("email")
            otp = request.get("otp")
            new_password = request.get("new_password")
            confirm_password = request.get("confirm_password")

            if new_password != confirm_password:
                raise HTTPException(status_code=400, detail="Passwords do not match")

            user = await self.UserCRUD.get_by_email(email)
            if not user:
                raise HTTPException(status_code=404, detail="User not found")

            # Verify OTP
            if not user.otp_code or user.otp_code != otp:
                raise HTTPException(status_code=400, detail="Invalid OTP")

            if not user.otp_expires_at or datetime.utcnow() > user.otp_expires_at:
                raise HTTPException(status_code=400, detail="OTP Expired")

            # Hash new password
            hashed_password = encrypt_password(new_password)

            # Update User (Clear OTP and set new password)
            update_data = {
                "hashed_password": hashed_password,
                "otp_code": None,  # Clear OTP
                "otp_expires_at": None,  # Clear Expiry
            }

            # We use exclude_none=False equivalent by manually passing None if needed,
            # but our UserCRUD.update filters out None.
            # Wait, UserCRUD.update filters out None! "exclude_none=True" in `update_dict = validated_data.model_dump(exclude_none=True)`
            # This is a problem if we want to set fields to None.
            # I must check UserCRUD.update logic again.

            # Re-checking UserCRUD.update:
            # 84: update_dict = validated_data.model_dump(exclude_none=True)
            # Yes, it excludes None. So I cannot unset the OTP fields using the current CRUD update method if I pass a dict that gets validated against UserUpdateRequest.
            # However, UserUpdateRequest schema now has otp_code and otp_expires_at as Optional.
            # If I pass them as None, they will be excluded.

            # Hack: Pass them as empty string or a specific value? No, they are Optional[str|datetime].
            # I might need to bypass the validation or modify UserCRUD.update to allow explicitly resetting fields.
            # OR, I can just leave them there, it's not critical security risk if they are expired, but better to clear.
            # Let's modify UserCRUD for "unset" or just set `otp_code` to "" (empty string) if the model allows it.
            # User model: otp_code: Optional[str]. So "" is valid.
            # But otp_expires_at is datetime.

            # Alternative: Just overwrite the password. The OTP is invalid if I change the logic to also check if it matches.
            # But if the user tries to use the same OTP again within 10 mins?
            # They would reset the password again. That's fine.
            # But to be clean, I should really clear it.

            # Let's try to set `otp_code` to "USED" or something if I can't set None.
            # actually `otp_expires_at` is datetime, so I can't set it to string "USED".
            # I will just set otp_code to "0000" or something that won't match.
            # Or better, I will fix UserCRUD.update later if needed. For now let's set otp_code to "0".

            update_data = {
                "hashed_password": hashed_password,
                "otp_code": "0",  # Invalidate it
            }

            await self.UserCRUD.update(id=str(user.id), update_data=update_data)

            return {"message": "Password reset successfully. Please login."}

        except HTTPException as error:
            logging.error(f"Error in reset_password_with_otp: {error}")
            raise error
        except Exception as e:
            logging.error(f"Unexpected error: {e}")
            raise HTTPException(status_code=500, detail=str(e))

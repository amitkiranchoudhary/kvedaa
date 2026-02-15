from commons.auth import decodeJWT
from fastapi import APIRouter, HTTPException, Depends
from core.controllers.user_controller import UserController
from core.apis.schemas.requests.user_request import (
    UserCreateRequest,
    LoginRequest,
    PasswordResetRequest,
    ForgetPasswordRequest,
    ResetPasswordOTPRequest,
)
from core.apis.schemas.responses.user_response import (
    UserResponse,
    UserAuthResponse,
    PasswordResetResponse,
)
from fastapi.security import OAuth2PasswordBearer
from commons.logger import logger

logging = logger(__name__)

user_router = APIRouter()

oauth2_schema = OAuth2PasswordBearer(tokenUrl="v1/login")


@user_router.get("/v1/test_logs", tags=["Testing"])
async def test_logs():
    """Endpoint specifically for testing if logs are being captured."""
    logging.debug("TEST: Debug level log triggered")
    logging.info("TEST: Info level log triggered")
    logging.warning("TEST: Warning level log triggered")
    logging.error("TEST: Error level log triggered")
    return {
        "status": "Success",
        "message": "Test logs have been triggered. Check logs/debug.log",
    }


@user_router.post("/v1/users", response_model=UserAuthResponse)
async def create_user(user_request: UserCreateRequest):
    try:
        logging.info(
            f"Calling /v1/users endpoint with data: {user_request.model_dump_json(exclude={'password'})}"
        )
        request = user_request.model_dump()
        result = await UserController().create_user(request)
        return result
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error creating user: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error{str(e)}")


@user_router.post("/v1/login", response_model=UserAuthResponse)
async def login_user(login_request: LoginRequest):
    try:
        logging.info(f"Calling /v1/login endpoint for user: {login_request.email}")
        request = login_request.model_dump()
        result = await UserController().login_user(request)
        return result
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error logging in user: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error{str(e)}")


@user_router.post("/v1/reset_password")
async def update(request: PasswordResetRequest, token: str = Depends(oauth2_schema)):
    try:
        logging.info("Calling /v1/reset_password")
        logging.debug(f"Received token: {token[:15]}...")

        authenticated_user_details = decodeJWT(token)
        logging.debug(f"Authenticated user details: {authenticated_user_details}")

        if not authenticated_user_details:
            logging.warning("Invalid or expired token provided")
            raise HTTPException(
                status_code=401, detail="Invalid Token or token expired"
            )
        if authenticated_user_details.get("status") != "ACTIVE":
            logging.warning(
                f"User status is not ACTIVE: {authenticated_user_details.get('status')}"
            )
            raise HTTPException(status_code=401, detail="user not active")

        request_dict = request.model_dump()
        logging.info(
            f"Processing password reset for user ID: {authenticated_user_details.get('id')}"
        )
        result = await UserController().reset_password(
            reset_request=request_dict,
            authenticated_user_details=authenticated_user_details,
        )
        return PasswordResetResponse(**result)

    except Exception as error:
        logging.error(f"Error logging in user: {error}")
        raise HTTPException(
            status_code=500, detail=f"Internal server error{str(error)}"
        )


@user_router.post("/v1/forget-password")
async def forget_password_endpoint(request: ForgetPasswordRequest):
    try:
        logging.info(f"Calling /v1/forget-password for: {request.email}")
        result = await UserController().forget_password(request.model_dump())
        return result
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error in forget password: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@user_router.post("/v1/reset-password-otp")
async def reset_password_otp_endpoint(request: ResetPasswordOTPRequest):
    try:
        logging.info(f"Calling /v1/reset-password-otp for: {request.email}")
        result = await UserController().reset_password_with_otp(request.model_dump())
        return result
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error in reset password with OTP: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

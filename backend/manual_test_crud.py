import httpx
import asyncio
import time

BASE_URL = "http://localhost:8000"


async def test_crud():
    with open("last_run.log", "w") as log_file:

        def log(msg):
            print(msg)
            log_file.write(str(msg) + "\n")

        log(f"--- Starting CRUD Tests against {BASE_URL} ---")

        # Generate unique user
        timestamp = int(time.time())
        email = f"testuser_{timestamp}@example.com"
        password = "TestPassword123"

        # 1. Health Check
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(f"{BASE_URL}/")  # tags not needed in request
                log(f"Health Check: {resp.status_code}")
                if resp.status_code != 200:
                    log("Server might not be running or path is wrong.")
                    return
        except Exception as e:
            log(f"Failed to connect to server: {e}")
            return

        # 2. Create User
        log(f"\n--- 1. Creating User ({email}) ---")
        async with httpx.AsyncClient() as client:
            payload = {
                "first_name": "Test",
                "last_name": "User",
                "email": email,
                "mobile_number": "1234567890",
                "password": password,
            }
            resp = await client.post(f"{BASE_URL}/v1/users", json=payload)
            log(f"Status: {resp.status_code}")
            log(f"Response: {resp.json()}")

            if resp.status_code != 200:
                log("Failed to create user. Stopping.")
                return

        # 3. Login
        log(f"\n--- 2. Logging In ---")
        async with httpx.AsyncClient() as client:
            payload = {"email": email, "password": password}
            resp = await client.post(f"{BASE_URL}/v1/login", json=payload)
            log(f"Status: {resp.status_code}")
            data = resp.json()
            log(f"Response: {data}")

            if resp.status_code != 200:
                log("Failed to login.")
                return

            token = data.get("access_token")
            log(f"Got Access Token: {token[:20]}...")

        # 4. Reset Password (Authenticated)
        log(f"\n--- 3. Reset Password (Authenticated) ---")
        new_password = "NewTestPassword456"
        async with httpx.AsyncClient() as client:
            headers = {"Authorization": f"Bearer {token}"}
            payload = {"old_password": password, "new_password": new_password}
            resp = await client.post(
                f"{BASE_URL}/v1/reset_password", json=payload, headers=headers
            )
            log(f"Status: {resp.status_code}")
            log(f"Response: {resp.json()}")

        # 5. Login with NEW password
        log(f"\n--- 4. Logging In with NEW password ---")
        async with httpx.AsyncClient() as client:
            payload = {"email": email, "password": new_password}
            resp = await client.post(f"{BASE_URL}/v1/login", json=payload)
            log(f"Status: {resp.status_code}")
            if resp.status_code == 200:
                log("Login success with new password!")
            else:
                log(f"Login failed: {resp.json()}")

        # 6. Forget Password (Initiate)
        log(f"\n--- 5. Forget Password (Initiate) ---")
        async with httpx.AsyncClient() as client:
            # User real email for SMTP test compatibility
            real_email = "amitkchoudhary2019@gmail.com"
            # First ensure this user exists to test the flow properly
            # We will try to create it, if it exists, we proceed.
            create_payload = {
                "first_name": "Real",
                "last_name": "User",
                "email": real_email,
                "mobile_number": "1234567890",
                "password": password,
            }
            await client.post(f"{BASE_URL}/v1/users", json=create_payload)

            payload = {"email": real_email}
            # This will test the actual email sending capability
            resp = await client.post(
                f"{BASE_URL}/v1/forget-password", json=payload, timeout=20.0
            )  # Increased timeout for SMTP
            log(f"Status: {resp.status_code}")
            try:
                log(f"Response: {resp.json()}")
            except:
                log(f"Response text: {resp.text}")

        log("\n--- Tests Completed ---")


if __name__ == "__main__":
    asyncio.run(test_crud())

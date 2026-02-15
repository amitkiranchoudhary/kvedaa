import asyncio
import httpx
import json

BASE_URL = "http://localhost:8000"
TEST_RESULTS_FILE = "test_results.txt"

async def log_result(file, message):
    print(message)
    file.write(message + "\n")

async def test_orders():
    async with httpx.AsyncClient(timeout=30.0) as client:
        with open(TEST_RESULTS_FILE, "w") as f:
            await log_result(f, "=== STARTING ORDER SYSTEM TESTS ===\n")

            # 1. Login to get Token
            login_payload = {"email": "amitkchoudhary2019@gmail.com", "password": "Password123"}
            # Ensure user exists or create one (Skipping creation for brevity, assuming established env or handled manually)
            # Actually, let's create a user just in case to be safe
            user_payload = {
                "first_name": "Test", "last_name": "Captain", 
                "email": "testcaptain3@pirate.com", "mobile_number": "9998887776", 
                "password": "Password123"
            }
            try:
                resp = await client.post(f"{BASE_URL}/v1/users", json=user_payload)
                if resp.status_code not in [200, 201]:
                     print(f"User creation warning: {resp.text}")
            except Exception as e:
                print(f"User creation error: {e}")

            login_payload = {"email": "testcaptain3@pirate.com", "password": "Password123"}
            response = await client.post(f"{BASE_URL}/v1/login", json=login_payload)
            
            if response.status_code != 200:
                await log_result(f, f"FAIL: Login failed: {response.text}")
                return

            token = response.json().get("access_token")
            headers = {"Authorization": f"Bearer {token}"}
            await log_result(f, "PASS: Login successful, token received.")

            # 2. Create Order
            order_payload = {
                "items": ["Gum Gum Fruit", "Straw Hat"],
                "total_amount": 5000000.0
            }
            response = await client.post(f"{BASE_URL}/orders/", json=order_payload, headers=headers)
            if response.status_code == 200:
                order_data = response.json()
                order_id = order_data['id']
                await log_result(f, f"PASS: Create Order successful. Order ID: {order_id}")
                await log_result(f, f"      Response: {json.dumps(order_data, indent=2)}")
            else:
                await log_result(f, f"FAIL: Create Order failed: {response.text}")
                return

            # 3. Get My Orders
            response = await client.get(f"{BASE_URL}/orders/my", headers=headers)
            if response.status_code == 200:
                my_orders = response.json()
                await log_result(f, f"PASS: Get My Orders successful. Found {len(my_orders)} orders.")
            else:
                await log_result(f, f"FAIL: Get My Orders failed: {response.text}")

            # 4. List All Orders (with Populate)
            response = await client.get(f"{BASE_URL}/orders/?populate=true", headers=headers)
            if response.status_code == 200:
                all_orders = response.json()
                await log_result(f, f"PASS: List All Orders successful. First order user details: {all_orders[0].get('user_details')}")
            else:
                await log_result(f, f"FAIL: List All Orders failed: {response.text}")

            # 5. Update Order
            update_payload = {"status": "SHIPPED"}
            response = await client.put(f"{BASE_URL}/orders/{order_id}", json=update_payload, headers=headers)
            if response.status_code == 200:
                updated_data = response.json()
                await log_result(f, f"PASS: Update Order Status to SHIPPED successful.")
            else:
                await log_result(f, f"FAIL: Update Order failed: {response.text}")

            # 6. Delete Order
            # Create a dummy order to delete so we keep one for viewing
            dummy_resp = await client.post(f"{BASE_URL}/orders/", json={"items": ["Trash"], "total_amount": 10}, headers=headers)
            dummy_id = dummy_resp.json()['id']
            
            response = await client.delete(f"{BASE_URL}/orders/{dummy_id}", headers=headers)
            if response.status_code == 200:
                await log_result(f, "PASS: Delete Order successful.")
            else:
                 await log_result(f, f"FAIL: Delete Order failed: {response.text}")

            await log_result(f, "\n=== ALL TESTS COMPLETED ===")

if __name__ == "__main__":
    asyncio.run(test_orders())

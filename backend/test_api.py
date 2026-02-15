"""
End-to-end API test script for KVedaa SCADA Platform.
Tests all endpoints in order: Signup -> Login -> Buildings -> Devices -> Telemetry -> Alerts -> Analytics -> Dashboard
"""
import httpx
import json
import sys

BASE = "http://localhost:8000"
TOKEN = None
USER_ID = None
BUILDING_ID = None
DEVICE_ID = None  # MongoDB ID
DEVICE_HW_ID = "TEST-MAC-001"
DEVICE_API_KEY = None
ALERT_RULE_ID = None
ALERT_ID = None

results = []


def log(test_name, passed, detail=""):
    status = "[PASS]" if passed else "[FAIL]"
    results.append((test_name, passed, detail))
    print(f"  {status} | {test_name}" + (f" - {detail}" if detail else ""))


def auth_headers():
    return {"Authorization": f"Bearer {TOKEN}"}


def run_tests():
    global TOKEN, USER_ID, BUILDING_ID, DEVICE_ID, DEVICE_API_KEY, ALERT_RULE_ID, ALERT_ID

    client = httpx.Client(base_url=BASE, timeout=15)

    # =================== 1. HEALTH ===================
    print("\n=== 1. HEALTH CHECK ===")
    try:
        r = client.get("/")
        log("GET /", r.status_code == 200, f"status={r.status_code}")
    except Exception as e:
        log("GET /", False, str(e))

    # =================== 2. SIGNUP ===================
    print("\n=== 2. SIGNUP ===")
    import time
    unique_email = f"testscada_{int(time.time())}@example.com"
    try:
        r = client.post("/v1/users", json={
            "first_name": "Test",
            "last_name": "User",
            "email": unique_email,
            "mobile_number": "9876543210",
            "password": "Test@1234"
        })
        if r.status_code == 200:
            data = r.json()
            TOKEN = data.get("access_token")
            USER_ID = data.get("user", {}).get("id")
            log("POST /v1/users (signup)", True, f"user_id={USER_ID}")
        else:
            log("POST /v1/users (signup)", False, f"status={r.status_code} body={r.text[:200]}")
    except Exception as e:
        log("POST /v1/users (signup)", False, str(e))

    # =================== 3. LOGIN ===================
    print("\n=== 3. LOGIN ===")
    try:
        r = client.post("/v1/login", json={
            "email": unique_email,
            "password": "Test@1234"
        })
        if r.status_code == 200:
            data = r.json()
            TOKEN = data.get("access_token")
            USER_ID = data.get("user", {}).get("id")
            log("POST /v1/login", True, f"token={TOKEN[:30]}...")
        else:
            log("POST /v1/login", False, f"status={r.status_code} body={r.text[:200]}")
    except Exception as e:
        log("POST /v1/login", False, str(e))

    if not TOKEN:
        print("\n[FAIL] Cannot continue without auth token. Aborting.")
        return

    # =================== 4. BUILDINGS ===================
    print("\n=== 4. BUILDINGS ===")
    try:
        r = client.post("/api/buildings/", json={
            "name": "Test Office Building",
            "address": "123 SCADA Street, Tech Park",
            "floors": 5,
            "description": "Test building for API verification"
        }, headers=auth_headers())
        if r.status_code == 200:
            BUILDING_ID = r.json().get("id")
            log("POST /api/buildings/ (create)", True, f"id={BUILDING_ID}")
        else:
            log("POST /api/buildings/ (create)", False, f"status={r.status_code} body={r.text[:200]}")
    except Exception as e:
        log("POST /api/buildings/ (create)", False, str(e))

    try:
        r = client.get("/api/buildings/", headers=auth_headers())
        buildings = r.json().get("buildings", [])
        log("GET /api/buildings/ (list)", r.status_code == 200, f"count={len(buildings)}")
        if not BUILDING_ID and buildings:
            BUILDING_ID = buildings[0]["id"]
    except Exception as e:
        log("GET /api/buildings/ (list)", False, str(e))

    if BUILDING_ID:
        try:
            r = client.get(f"/api/buildings/{BUILDING_ID}", headers=auth_headers())
            log("GET /api/buildings/:id", r.status_code == 200, f"name={r.json().get('name')}")
        except Exception as e:
            log("GET /api/buildings/:id", False, str(e))

        try:
            r = client.put(f"/api/buildings/{BUILDING_ID}", json={"floors": 10}, headers=auth_headers())
            log("PUT /api/buildings/:id (update)", r.status_code == 200, f"floors={r.json().get('floors')}")
        except Exception as e:
            log("PUT /api/buildings/:id (update)", False, str(e))

    # =================== 5. DEVICES ===================
    print("\n=== 5. DEVICES ===")
    if BUILDING_ID:
        try:
            r = client.post("/api/devices/", json={
                "device_id": DEVICE_HW_ID,
                "name": "Test Energy Meter",
                "type": "ENERGY_METER",
                "building_id": BUILDING_ID,
                "location": "Floor 1, Room 101"
            }, headers=auth_headers())
            if r.status_code == 200:
                data = r.json()
                DEVICE_ID = data.get("id")
                DEVICE_API_KEY = data.get("api_key")
                log("POST /api/devices/ (register)", True, f"id={DEVICE_ID}, key={DEVICE_API_KEY[:25]}...")
            else:
                log("POST /api/devices/ (register)", False, f"status={r.status_code} body={r.text[:200]}")
        except Exception as e:
            log("POST /api/devices/ (register)", False, str(e))

        try:
            r = client.get("/api/devices/", headers=auth_headers())
            devices = r.json().get("devices", [])
            log("GET /api/devices/ (list)", r.status_code == 200, f"count={len(devices)}")
            if not DEVICE_ID and devices:
                DEVICE_ID = devices[0]["id"]
                DEVICE_API_KEY = devices[0].get("api_key")
        except Exception as e:
            log("GET /api/devices/ (list)", False, str(e))

        if DEVICE_ID:
            try:
                r = client.get(f"/api/devices/{DEVICE_ID}", headers=auth_headers())
                log("GET /api/devices/:id", r.status_code == 200)
            except Exception as e:
                log("GET /api/devices/:id", False, str(e))

            try:
                r = client.get(f"/api/devices/{DEVICE_ID}/status", headers=auth_headers())
                log("GET /api/devices/:id/status", r.status_code == 200, f"status={r.json().get('status')}")
            except Exception as e:
                log("GET /api/devices/:id/status", False, str(e))

            try:
                r = client.get(f"/api/devices/building/{BUILDING_ID}", headers=auth_headers())
                log("GET /api/devices/building/:id", r.status_code == 200, f"count={r.json().get('total')}")
            except Exception as e:
                log("GET /api/devices/building/:id", False, str(e))

    # =================== 6. ALERT RULES ===================
    print("\n=== 6. ALERT RULES ===")
    try:
        r = client.post("/api/alerts/rules", json={
            "name": "High Temperature Alert",
            "metric": "temperature_c",
            "operator": "gt",
            "threshold": 30.0,
            "severity": "WARNING",
            "action": "LOG"
        }, headers=auth_headers())
        if r.status_code == 200:
            ALERT_RULE_ID = r.json().get("id")
            log("POST /api/alerts/rules (create)", True, f"id={ALERT_RULE_ID}")
        else:
            log("POST /api/alerts/rules (create)", False, f"status={r.status_code} body={r.text[:200]}")
    except Exception as e:
        log("POST /api/alerts/rules (create)", False, str(e))

    try:
        r = client.get("/api/alerts/rules", headers=auth_headers())
        rules = r.json().get("rules", [])
        log("GET /api/alerts/rules (list)", r.status_code == 200, f"count={len(rules)}")
    except Exception as e:
        log("GET /api/alerts/rules (list)", False, str(e))

    # =================== 7. TELEMETRY ===================
    print("\n=== 7. TELEMETRY ===")
    if DEVICE_API_KEY:
        # Push energy data
        try:
            r = client.post("/api/telemetry/", json={
                "device_id": DEVICE_HW_ID,
                "metrics": {"voltage": 230.5, "amperage": 12.3, "kwh": 45.6}
            }, headers={"X-API-Key": DEVICE_API_KEY})
            log("POST /api/telemetry/ (push energy)", r.status_code == 200, f"body={r.text[:150]}")
        except Exception as e:
            log("POST /api/telemetry/ (push energy)", False, str(e))

        # Push environmental data (should trigger alert since temp > 30)
        try:
            r = client.post("/api/telemetry/", json={
                "device_id": DEVICE_HW_ID,
                "readings": {"temperature_c": 35.5, "co2_ppm": 800, "humidity_pct": 65.2}
            }, headers={"X-API-Key": DEVICE_API_KEY})
            log("POST /api/telemetry/ (push comfort, should trigger alert)", r.status_code == 200, f"body={r.text[:150]}")
        except Exception as e:
            log("POST /api/telemetry/ (push comfort)", False, str(e))

        # Get telemetry by device
        if DEVICE_ID:
            try:
                r = client.get(f"/api/telemetry/{DEVICE_ID}?limit=10", headers=auth_headers())
                data = r.json().get("data", [])
                log("GET /api/telemetry/:device_id", r.status_code == 200, f"count={len(data)}")
            except Exception as e:
                log("GET /api/telemetry/:device_id", False, str(e))

            try:
                r = client.get(f"/api/telemetry/{DEVICE_ID}/latest", headers=auth_headers())
                log("GET /api/telemetry/:device_id/latest", r.status_code == 200, f"body={r.text[:150]}")
            except Exception as e:
                log("GET /api/telemetry/:device_id/latest", False, str(e))

    # =================== 8. TRIGGERED ALERTS ===================
    print("\n=== 8. TRIGGERED ALERTS ===")
    try:
        r = client.get("/api/alerts/?limit=10", headers=auth_headers())
        alerts = r.json().get("alerts", [])
        log("GET /api/alerts/ (triggered)", r.status_code == 200, f"count={len(alerts)}")
        if alerts:
            ALERT_ID = alerts[0].get("id")
    except Exception as e:
        log("GET /api/alerts/ (triggered)", False, str(e))

    if ALERT_ID:
        try:
            r = client.post(f"/api/alerts/{ALERT_ID}/acknowledge", headers=auth_headers())
            log("POST /api/alerts/:id/acknowledge", r.status_code == 200, f"body={r.text[:150]}")
        except Exception as e:
            log("POST /api/alerts/:id/acknowledge", False, str(e))

    # =================== 9. ANALYTICS ===================
    print("\n=== 9. ANALYTICS ===")
    try:
        r = client.get("/api/analytics/dashboard", headers=auth_headers())
        log("GET /api/analytics/dashboard", r.status_code == 200, f"body={r.text[:200]}")
    except Exception as e:
        log("GET /api/analytics/dashboard", False, str(e))

    try:
        r = client.get("/api/analytics/energy?start=2026-01-01&end=2026-12-31", headers=auth_headers())
        log("GET /api/analytics/energy", r.status_code == 200, f"data_points={len(r.json().get('data', []))}")
    except Exception as e:
        log("GET /api/analytics/energy", False, str(e))

    try:
        r = client.get("/api/analytics/comfort?start=2026-01-01&end=2026-12-31", headers=auth_headers())
        log("GET /api/analytics/comfort", r.status_code == 200, f"data_points={len(r.json().get('data', []))}")
    except Exception as e:
        log("GET /api/analytics/comfort", False, str(e))

    # =================== 10. CLEANUP (optional) ===================
    print("\n=== 10. CLEANUP ===")
    if ALERT_RULE_ID:
        try:
            r = client.delete(f"/api/alerts/rules/{ALERT_RULE_ID}", headers=auth_headers())
            log("DELETE /api/alerts/rules/:id", r.status_code == 200)
        except Exception as e:
            log("DELETE /api/alerts/rules/:id", False, str(e))

    if DEVICE_ID:
        try:
            r = client.delete(f"/api/devices/{DEVICE_ID}", headers=auth_headers())
            log("DELETE /api/devices/:id", r.status_code == 200)
        except Exception as e:
            log("DELETE /api/devices/:id", False, str(e))

    if BUILDING_ID:
        try:
            r = client.delete(f"/api/buildings/{BUILDING_ID}", headers=auth_headers())
            log("DELETE /api/buildings/:id", r.status_code == 200)
        except Exception as e:
            log("DELETE /api/buildings/:id", False, str(e))

    # =================== SUMMARY ===================
    print("\n" + "=" * 60)
    passed = sum(1 for _, p, _ in results if p)
    failed = sum(1 for _, p, _ in results if not p)
    print(f"TOTAL: {len(results)} tests | [PASS] {passed} passed | [FAIL] {failed} failed")
    if failed:
        print("\nFAILED TESTS:")
        for name, p, detail in results:
            if not p:
                print(f"  [FAIL] {name}: {detail}")
    print("=" * 60)

    client.close()


if __name__ == "__main__":
    run_tests()

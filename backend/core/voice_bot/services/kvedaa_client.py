import os

import httpx

from core import logger

log = logger(__name__)

KVEDAA_API_URL = os.getenv("KVEDAA_API_URL", "http://localhost:8000")


class KvedaaClient:
    """HTTP client for the KVedaa backend store endpoints."""

    def __init__(self):
        self.base_url = KVEDAA_API_URL.rstrip("/")
        log.info(f"KvedaaClient initialized -> {self.base_url}")

    async def get_products(self) -> list:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(f"{self.base_url}/store/products")
                resp.raise_for_status()
                products = resp.json()
                return products if isinstance(products, list) else []
        except Exception as exc:
            log.error(f"Failed to fetch products: {exc}")
            return []

    async def check_health(self) -> bool:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(f"{self.base_url}/")
            return resp.status_code == 200
        except Exception:
            return False


kvedaa_client = KvedaaClient()


"""
Product CRUD — Database operations for storefront products.
"""

from datetime import datetime
from typing import Optional, List
from odmantic import ObjectId
from core.database.database import get_engine
from core.models.product_model import Product, ProductStatus
from core import logger

logging = logger(__name__)


class ProductCRUD:
    """CRUD operations for products."""

    async def create(self, product_data: dict) -> Product:
        """Create a new product."""
        engine = get_engine()
        product = Product(**product_data)
        await engine.save(product)
        logging.info(f"Created product: {product.name} (ID: {product.id})")
        return product

    async def get_all(self, user_id: str, skip: int = 0, limit: int = 50) -> List[Product]:
        """Get all products for a user (admin view)."""
        engine = get_engine()
        return await engine.find(
            Product,
            Product.user_id == ObjectId(user_id),
            skip=skip, limit=limit,
            sort=Product.created_at.desc()
        )

    async def get_public_products(self, skip: int = 0, limit: int = 50) -> List[Product]:
        """Get all active products for the public storefront. No auth required."""
        engine = get_engine()
        return await engine.find(
            Product,
            Product.status == ProductStatus.ACTIVE,
            skip=skip, limit=limit,
            sort=Product.created_at.desc()
        )

    async def get_by_id(self, product_id: str) -> Optional[Product]:
        """Get a single product by ID."""
        engine = get_engine()
        return await engine.find_one(Product, Product.id == ObjectId(product_id))

    async def get_by_slug(self, slug: str) -> Optional[Product]:
        """Get a product by its URL slug."""
        engine = get_engine()
        return await engine.find_one(Product, Product.slug == slug)

    async def update(self, product_id: str, update_data: dict) -> Optional[Product]:
        """Update a product."""
        engine = get_engine()
        product = await engine.find_one(Product, Product.id == ObjectId(product_id))
        if not product:
            return None
        for key, value in update_data.items():
            if value is not None and hasattr(product, key):
                setattr(product, key, value)
        product.updated_at = datetime.utcnow()
        await engine.save(product)
        return product

    async def delete(self, product_id: str) -> bool:
        """Delete a product."""
        engine = get_engine()
        product = await engine.find_one(Product, Product.id == ObjectId(product_id))
        if not product:
            return False
        await engine.delete(product)
        return True

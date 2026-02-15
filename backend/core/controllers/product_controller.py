"""
Product Controller — Business logic for storefront products.
Handles both admin CRUD and public storefront display.
"""

from core.cruds.product_crud import ProductCRUD
from core.cruds.batch_crud import BatchCRUD
from fastapi import HTTPException
from core import logger

logging = logger(__name__)


class ProductController:
    def __init__(self):
        self.crud = ProductCRUD()
        self.batch_crud = BatchCRUD()

    async def create_product(self, product_data: dict, user_id: str):
        try:
            product_data["user_id"] = user_id
            # Auto-generate slug from name
            if not product_data.get("slug"):
                product_data["slug"] = product_data["name"].lower().replace(" ", "-")
            product = await self.crud.create(product_data)
            d = product.model_dump()
            d["id"] = str(product.id)
            d["user_id"] = str(product.user_id)
            if product.batch_id:
                d["batch_id"] = str(product.batch_id)
            return d
        except Exception as e:
            logging.error(f"Error creating product: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    async def get_all_products(self, user_id: str):
        """Admin view — all products belonging to the owner."""
        try:
            products = await self.crud.get_all(user_id)
            result = []
            for p in products:
                d = p.model_dump()
                d["id"] = str(p.id)
                d["user_id"] = str(p.user_id)
                if p.batch_id:
                    d["batch_id"] = str(p.batch_id)
                result.append(d)
            return result
        except Exception as e:
            logging.error(f"Error getting products: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    async def get_public_products(self):
        """
        PUBLIC STOREFRONT — Returns only ACTIVE products.
        Includes safe traceability data (harvest date, strain, quality grade).
        Does NOT include:
          - Internal notes
          - Substrate recipes
          - Spore sources
          - User IDs
        """
        try:
            products = await self.crud.get_public_products()
            result = []
            for p in products:
                # Only expose safe, public-facing data
                public_data = {
                    "id": str(p.id),
                    "name": p.name,
                    "slug": p.slug,
                    "description": p.description,
                    "category": p.category.value,
                    "price": p.price,
                    "compare_at_price": p.compare_at_price,
                    "weight_grams": p.weight_grams,
                    "stock_quantity": p.stock_quantity,
                    "in_stock": p.stock_quantity > 0 or p.allow_backorder,
                    "image_urls": p.image_urls or [],
                    # ── Traceability (The "Quality" Feature) ──
                    "strain": p.strain,
                    "harvest_date": p.harvest_date.isoformat() if p.harvest_date else None,
                    "quality_grade": p.quality_grade,
                    "lab_tested": p.lab_tested,
                    "certifications": p.certifications or [],
                }

                # If linked to a batch, pull safe batch data
                if p.batch_id:
                    batch = await self.batch_crud.get_by_id(str(p.batch_id))
                    if batch and batch.is_public:
                        public_data["batch_info"] = {
                            "batch_number": batch.batch_number,
                            "strain": batch.strain,
                            "started_at": batch.started_at.isoformat(),
                            "completed_at": batch.completed_at.isoformat() if batch.completed_at else None,
                            "jar_count": batch.jar_count,
                        }

                result.append(public_data)
            return result
        except Exception as e:
            logging.error(f"Error getting public products: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    async def get_product(self, product_id: str):
        try:
            product = await self.crud.get_by_id(product_id)
            if not product:
                raise HTTPException(status_code=404, detail="Product not found")
            d = product.model_dump()
            d["id"] = str(product.id)
            d["user_id"] = str(product.user_id)
            if product.batch_id:
                d["batch_id"] = str(product.batch_id)
            return d
        except HTTPException:
            raise
        except Exception as e:
            logging.error(f"Error getting product: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    async def update_product(self, product_id: str, update_data: dict, user_id: str):
        try:
            product = await self.crud.get_by_id(product_id)
            if not product:
                raise HTTPException(status_code=404, detail="Product not found")
            if str(product.user_id) != user_id:
                raise HTTPException(status_code=403, detail="Not authorized")
            updated = await self.crud.update(product_id, update_data)
            d = updated.model_dump()
            d["id"] = str(updated.id)
            d["user_id"] = str(updated.user_id)
            return d
        except HTTPException:
            raise
        except Exception as e:
            logging.error(f"Error updating product: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    async def delete_product(self, product_id: str, user_id: str):
        try:
            product = await self.crud.get_by_id(product_id)
            if not product:
                raise HTTPException(status_code=404, detail="Product not found")
            if str(product.user_id) != user_id:
                raise HTTPException(status_code=403, detail="Not authorized")
            await self.crud.delete(product_id)
            return {"message": "Product deleted"}
        except HTTPException:
            raise
        except Exception as e:
            logging.error(f"Error deleting product: {e}")
            raise HTTPException(status_code=500, detail=str(e))

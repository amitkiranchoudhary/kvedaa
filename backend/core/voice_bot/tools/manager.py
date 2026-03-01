import asyncio
from datetime import datetime

from core import logger
from core.voice_bot.db import get_database
from core.voice_bot.rag.knowledge_base import kb
from core.voice_bot.services.kvedaa_client import kvedaa_client
from core.voice_bot.tools.web_search import web_searcher

log = logger(__name__)


class ToolManager:
    def __init__(self, task, call_sid: str):
        self.task = task
        self.call_sid = call_sid
        self.db = get_database()

    async def log_tool_usage(self, tool_name: str, query: str, result: str):
        if self.db is None:
            return
        try:
            await self.db["tool_logs"].insert_one(
                {
                    "call_sid": self.call_sid,
                    "tool": tool_name,
                    "query": query,
                    "result": str(result)[:500],
                    "timestamp": datetime.utcnow(),
                }
            )
        except Exception as exc:
            log.error(f"Tool logging failed for {tool_name}: {exc}")

    async def get_product_info(self, params, query: str):
        try:
            result = await asyncio.to_thread(kb.query, query)
            await self.log_tool_usage("get_product_info", query, result)
            return result
        except Exception as exc:
            log.error(f"get_product_info failed: {exc}")
            return "I cannot access product information right now."

    async def check_product_availability(self, params):
        try:
            products = await kvedaa_client.get_products()
            if not products:
                msg = "No products are available right now."
                await self.log_tool_usage("check_product_availability", "all", msg)
                return msg

            items = []
            for product in products[:5]:
                name = product.get("name", "Unknown")
                price = product.get("price", "N/A")
                status = product.get("status", "available")
                items.append(f"- {name}: {price} ({status})")
            msg = "Current products:\n" + "\n".join(items)
            await self.log_tool_usage("check_product_availability", "all", msg)
            return msg
        except Exception as exc:
            log.error(f"check_product_availability failed: {exc}")
            return "I cannot check availability right now."

    async def search_web(self, params, query: str):
        try:
            result = await asyncio.to_thread(web_searcher.search, query)
            await self.log_tool_usage("search_web", query, result)
            return result
        except Exception as exc:
            log.error(f"search_web failed: {exc}")
            return "I cannot search the web right now."

    async def capture_lead(self, params, name: str = "", phone: str = "", interest: str = ""):
        try:
            if self.db is not None:
                await self.db["leads"].insert_one(
                    {
                        "call_sid": self.call_sid,
                        "name": name or "Unknown",
                        "phone": phone or "From call",
                        "interest": interest or "General Inquiry",
                        "status": "new",
                        "source": "voice_bot",
                        "timestamp": datetime.utcnow(),
                    }
                )
            result = "Lead captured successfully."
            await self.log_tool_usage("capture_lead", f"{name}/{interest}", result)
            return "Thanks, I captured your details and our team will reach out soon."
        except Exception as exc:
            log.error(f"capture_lead failed: {exc}")
            return "I noted your interest and our team will follow up."

    async def end_call(self, params):
        try:
            await self.log_tool_usage("end_call", "n/a", "requested")
            if self.task:
                from pipecat.frames.frames import EndFrame, TextFrame

                await self.task.queue_frames(
                    [TextFrame(text="Thank you for calling Kvedaa. Goodbye.")]
                )
                await asyncio.sleep(1.2)
                await self.task.queue_frames([EndFrame()])
            return "Call ended."
        except Exception as exc:
            log.error(f"end_call failed: {exc}")
            return "Could not end call cleanly."


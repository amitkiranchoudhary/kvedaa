import os

from core import logger

log = logger(__name__)


class WebSearch:
    def __init__(self):
        self.client = None
        api_key = os.getenv("TAVILY_API_KEY", "").strip()
        if not api_key:
            log.warning("TAVILY_API_KEY not configured, web search disabled")
            return

        try:
            from tavily import TavilyClient

            self.client = TavilyClient(api_key=api_key)
        except Exception as exc:
            log.warning(f"Tavily unavailable, web search disabled: {exc}")

    def search(self, query: str, max_results: int = 3) -> str:
        if self.client is None:
            return "Web search is unavailable. Ask me about KVedaa products instead."

        try:
            response = self.client.search(
                query=query, search_depth="advanced", max_results=max_results
            )
            results = response.get("results", [])
            if not results:
                return "No relevant web results found."
            lines = []
            for item in results:
                title = item.get("title", "No title")
                summary = item.get("content", "")
                lines.append(f"Title: {title}\nSummary: {summary}")
            return "\n\n".join(lines)
        except Exception as exc:
            log.error(f"Web search failed: {exc}")
            return "Web search failed."


web_searcher = WebSearch()


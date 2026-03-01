import asyncio
from pathlib import Path

from core import logger
from core.voice_bot.rag.knowledge_base import kb

log = logger(__name__)

_bootstrapped = False


async def bootstrap_knowledge_base():
    """Load kvedaa_info.txt into the voice bot KB once at startup if present."""
    global _bootstrapped
    if _bootstrapped:
        return

    if not kb.ready:
        log.warning("Voice KB is not ready, skipping auto-ingestion")
        _bootstrapped = True
        return

    repo_root = Path(__file__).resolve().parents[3]
    candidates = [repo_root / "kvedaa_info.txt"]

    for path in candidates:
        if path.exists():
            try:
                await asyncio.to_thread(kb.add_document, str(path))
                log.info(f"Auto-ingested knowledge file: {path}")
            except Exception as exc:
                log.warning(f"Failed to ingest {path}: {exc}")
            break

    _bootstrapped = True

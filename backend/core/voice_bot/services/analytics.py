import json
import os

from core import logger
from core.voice_bot.prompts.system import ANALYSIS_PROMPT_TEMPLATE

log = logger(__name__)


async def analyze_call_transcript(transcript_data: list):
    """Analyze transcript using Groq. Returns fallback data on failure."""
    try:
        from groq import AsyncGroq
    except Exception as exc:
        log.warning(f"Groq SDK unavailable, skipping transcript analysis: {exc}")
        return {"is_interested": False, "error": "groq_dependency_missing"}

    try:
        transcript_str = str(transcript_data)[:10000]
        prompt = ANALYSIS_PROMPT_TEMPLATE.format(transcript=transcript_str)
        client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))
        completion = await client.chat.completions.create(
            model=os.getenv("GROQ_ANALYSIS_MODEL", "llama-3.3-70b-versatile"),
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
        )
        text = (completion.choices[0].message.content or "").strip()
        if text.startswith("```json"):
            text = text[7:-3]
        elif text.startswith("```"):
            text = text[3:-3]
        return json.loads(text)
    except Exception as exc:
        log.error(f"Failed to analyze call transcript: {exc}")
        return {"is_interested": False, "error": str(exc)}


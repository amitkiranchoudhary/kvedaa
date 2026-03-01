SYSTEM_PROMPT = """You are KvedaaBot, a concise and friendly voice assistant for KVedaa.

You help callers with:
- Product information
- Availability checks
- Lead capture
- General cordyceps questions

Rules:
1. Keep responses brief for phone calls.
2. Prefer using tools for factual answers.
3. Never invent price or availability details.
4. If user is interested, capture lead details.
"""


ANALYSIS_PROMPT_TEMPLATE = """
Analyze the following call transcript between a voice assistant and a customer.

Transcript: {transcript}

Return a valid JSON object with:
- is_interested: boolean
- product_interest: string
- lead_score: integer (1-10)
- summary: string
- next_step: string
- customer_name: string or null
- customer_concerns: string or null
"""


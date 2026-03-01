import os

from core.database.database import db_instance


def get_database():
    """Reuse the main backend Mongo client for voice bot collections."""
    if db_instance.client is None:
        return None
    db_name = os.getenv("VOICE_BOT_DB_NAME", "kvedaa_voice_bot")
    return db_instance.client[db_name]


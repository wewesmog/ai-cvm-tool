import json
from typing import Any, Dict, List, Optional
from uuid import UUID
from datetime import datetime

from ...shared_services.db import get_postgres_connection
from ...shared_services.logger_setup import setup_logger

logger = setup_logger()

def safe_json_parse(value: Any) -> Dict[str, Any]:
    """Safely parse JSON/JSONB columns that may arrive as str or already-parsed dict/list"""
    if value is None:
        return {}
    if isinstance(value, (dict, list)):
        return value
    if isinstance(value, (bytes, bytearray)):
        try:
            return json.loads(value.decode("utf-8"))
        except Exception:
            return {}
    if isinstance(value, str):
        try:
            return json.loads(value)
        except Exception:
            return {}
    return {}

def json_serial(obj: Any) -> str:
    """JSON serializer for datetime objects"""
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")

def ensure_uuid(journey_id: str) -> UUID:
    """Convert string to UUID, handling potential errors"""
    try:
        return UUID(journey_id)
    except ValueError as e:
        raise ValueError(f"Invalid journey ID format: {journey_id}") from e

def get_connection(operation: str = "journeys"):
    """Get database connection with proper error handling"""
    return get_postgres_connection(operation)

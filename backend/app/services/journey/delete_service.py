from ...models.journey_models import APIResponse
from .utils import get_connection, ensure_uuid
from ...shared_services.logger_setup import setup_logger

logger = setup_logger()

class JourneyDeleteService:
    """Service for deleting journeys"""
    
    def __init__(self):
        self.logger = logger
    
    async def delete_journey(self, journey_id: str, soft_delete: bool = True) -> APIResponse:
        """Delete a journey (soft delete by default)"""
        try:
            with get_connection("journeys") as conn:
                with conn.cursor() as cursor:
                    journey_uuid = ensure_uuid(journey_id)
                    
                    if soft_delete:
                        cursor.execute("""
                            UPDATE journeys SET is_deleted = TRUE, updated_at = NOW()
                            WHERE id = %s
                        """, (journey_uuid,))
                    else:
                        # Hard delete - cascade will handle related records
                        cursor.execute("DELETE FROM journeys WHERE id = %s", (journey_uuid,))
                    
                    return APIResponse(
                        success=True,
                        message="Journey deleted successfully",
                        data={"journey_id": journey_id}
                    )
                    
        except Exception as e:
            self.logger.error(f"Error deleting journey: {e}")
            return APIResponse(
                success=False,
                message="Failed to delete journey",
                error=str(e)
            )

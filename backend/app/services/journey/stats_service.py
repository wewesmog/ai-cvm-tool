from ...models.journey_models import JourneyStats, APIResponse
from .utils import get_connection, ensure_uuid
from ...shared_services.logger_setup import setup_logger

logger = setup_logger()

class JourneyStatsService:
    """Service for journey statistics"""
    
    def __init__(self):
        self.logger = logger
    
    async def get_journey_stats(self, journey_id: str) -> APIResponse:
        """Get statistics for a journey"""
        try:
            with get_connection("journeys") as conn:
                with conn.cursor() as cursor:
                    journey_uuid = ensure_uuid(journey_id)
                    
                    cursor.execute("""
                        SELECT total_nodes, total_edges, total_goals, completed_goals,
                               total_milestones, completed_milestones, total_reports
                        FROM journey_stats WHERE journey_id = %s
                    """, (journey_uuid,))
                    
                    stats_row = cursor.fetchone()
                    if not stats_row:
                        return APIResponse(
                            success=False,
                            message="Journey not found",
                            error="Journey not found"
                        )
                    
                    stats = JourneyStats(
                        totalNodes=stats_row[0] or 0,
                        totalEdges=stats_row[1] or 0,
                        totalGoals=stats_row[2] or 0,
                        completedGoals=stats_row[3] or 0,
                        totalMilestones=stats_row[4] or 0,
                        completedMilestones=stats_row[5] or 0,
                        totalReports=stats_row[6] or 0
                    )
                    
                    return APIResponse(
                        success=True,
                        message="Journey stats retrieved successfully",
                        data={"stats": stats.dict()}
                    )
                    
        except Exception as e:
            self.logger.error(f"Error getting journey stats: {e}")
            return APIResponse(
                success=False,
                message="Failed to get journey stats",
                error=str(e)
            )

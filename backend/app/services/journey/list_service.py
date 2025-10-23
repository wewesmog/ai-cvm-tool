from typing import Optional

from ...models.journey_models import APIResponse
from .utils import get_connection
from ...shared_services.logger_setup import setup_logger

logger = setup_logger()

class JourneyListService:
    """Service for listing journeys"""
    
    def __init__(self):
        self.logger = logger
    
    async def list_journeys(self, user_id: Optional[str] = None, limit: int = 50, offset: int = 0) -> APIResponse:
        """List journeys for a user"""
        try:
            with get_connection("journeys") as conn:
                with conn.cursor() as cursor:
                    # Build query
                    where_clause = "WHERE is_deleted = FALSE"
                    params = []
                    
                    if user_id:
                        where_clause += " AND user_id = %s"
                        params.append(user_id)
                    
                    # Get journeys with stats
                    cursor.execute(f"""
                        SELECT j.id, j.name, j.description, j.is_published, j.is_archived,
                               j.created_at, j.updated_at,
                               js.total_nodes, js.total_edges, js.total_goals, js.completed_goals,
                               js.total_milestones, js.completed_milestones, js.total_reports
                        FROM journeys j
                        LEFT JOIN journey_stats js ON j.id = js.journey_id
                        {where_clause}
                        ORDER BY j.updated_at DESC
                        LIMIT %s OFFSET %s
                    """, params + [limit, offset])
                    
                    journeys = []
                    for row in cursor.fetchall():
                        journeys.append({
                            "id": str(row[0]),
                            "name": row[1],
                            "description": row[2],
                            "isPublished": row[3],
                            "isArchived": row[4],
                            "createdAt": row[5],
                            "updatedAt": row[6],
                            "stats": {
                                "totalNodes": row[7] or 0,
                                "totalEdges": row[8] or 0,
                                "totalGoals": row[9] or 0,
                                "completedGoals": row[10] or 0,
                                "totalMilestones": row[11] or 0,
                                "completedMilestones": row[12] or 0,
                                "totalReports": row[13] or 0
                            }
                        })
                    
                    # Get total count
                    cursor.execute(f"""
                        SELECT COUNT(*) FROM journeys {where_clause}
                    """, params)
                    total = cursor.fetchone()[0]
                    
                    return APIResponse(
                        success=True,
                        message="Journeys retrieved successfully",
                        data={
                            "journeys": journeys,
                            "total": total,
                            "limit": limit,
                            "offset": offset
                        }
                    )
                    
        except Exception as e:
            self.logger.error(f"Error listing journeys: {e}")
            return APIResponse(
                success=False,
                message="Failed to list journeys",
                error=str(e)
            )

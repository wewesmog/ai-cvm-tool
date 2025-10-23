import json
from typing import Optional
from uuid import UUID

from ...models.journey_models import CompleteJourneyState, APIResponse
from .utils import get_connection, json_serial
from ...shared_services.logger_setup import setup_logger

logger = setup_logger()

class JourneyCreateService:
    """Service for creating new journeys"""
    
    def __init__(self):
        self.logger = logger
    
    async def create_journey(self, journey_data: CompleteJourneyState, user_id: Optional[str] = None) -> APIResponse:
        """Create a new journey with all its components"""
        try:
            with get_connection("journeys") as conn:
                with conn.cursor() as cursor:
                    # Start transaction
                    cursor.execute("BEGIN")
                    
                    # Create journey - let PostgreSQL generate the UUID
                    cursor.execute("""
                        INSERT INTO journeys (name, description, is_published, is_deleted, 
                                           is_archived, is_locked, is_read_only, is_editable, 
                                           is_view_only, user_id, created_at, updated_at)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        RETURNING id
                    """, (
                        journey_data.name, journey_data.description,
                        journey_data.isPublished, journey_data.isDeleted, journey_data.isArchived,
                        journey_data.isLocked, journey_data.isReadOnly, journey_data.isEditable,
                        journey_data.isViewOnly, user_id, journey_data.createdAt, journey_data.updatedAt
                    ))
                    
                    # Get the generated journey ID
                    journey_id = cursor.fetchone()[0]
                    
                    # Insert nodes
                    for node in journey_data.nodes:
                        cursor.execute("""
                            INSERT INTO journey_nodes (journey_id, node_id, node_type, node_subtype,
                                                    position_x, position_y, data, selected)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                        """, (
                            journey_id, node.id, node.type, node.node_subtype,
                            node.position.x, node.position.y, json.dumps(node.data), node.selected
                        ))
                    
                    # Insert edges
                    for edge in journey_data.edges:
                        cursor.execute("""
                            INSERT INTO journey_edges (journey_id, edge_id, source_node, target_node,
                                                    data, selected, edge_type, animated, style)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                        """, (
                            journey_id, edge.id, edge.source, edge.target,
                            json.dumps(edge.data), edge.selected, edge.type, edge.animated, json.dumps(edge.style)
                        ))
                    
                    # Insert goals
                    for goal in journey_data.goals:
                        cursor.execute("""
                            INSERT INTO journey_goals (journey_id, goal_id, title, description,
                                                    target_value, current_value, unit, deadline,
                                                    status, priority, category)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        """, (
                            journey_id, goal.id, goal.title, goal.description,
                            goal.targetValue, goal.currentValue, goal.unit, goal.deadline,
                            goal.status.value, goal.priority.value, goal.category
                        ))
                    
                    # Insert milestones
                    for milestone in journey_data.milestones:
                        cursor.execute("""
                            INSERT INTO journey_milestones (journey_id, milestone_id, title, description,
                                                           target_date, status, progress, dependencies)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                        """, (
                            journey_id, milestone.id, milestone.title, milestone.description,
                            milestone.targetDate, milestone.status.value, milestone.progress, json.dumps(milestone.dependencies)
                        ))
                    
                    # Insert reports
                    for report in journey_data.reports:
                        cursor.execute("""
                            INSERT INTO journey_reports (journey_id, report_id, name, report_type,
                                                       generated_at, data)
                            VALUES (%s, %s, %s, %s, %s, %s)
                        """, (
                            journey_id, report.id, report.name, report.type.value,
                            report.generatedAt, json.dumps(report.data)
                        ))
                    
                    # Commit transaction
                    cursor.execute("COMMIT")
                    
                    self.logger.info(f"Journey created successfully: {journey_id}")
                    return APIResponse(
                        success=True,
                        message="Journey created successfully",
                        data={"journey_id": str(journey_id)}
                    )
                    
        except Exception as e:
            self.logger.error(f"Error creating journey: {e}")
            # Rollback transaction if it was started
            try:
                with get_connection("journeys") as conn:
                    with conn.cursor() as cursor:
                        cursor.execute("ROLLBACK")
            except:
                pass  # Ignore rollback errors
            return APIResponse(
                success=False,
                message="Failed to create journey",
                error=str(e)
            )

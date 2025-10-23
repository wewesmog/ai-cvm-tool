from typing import Optional
from uuid import UUID

from ...models.journey_models import CompleteJourneyState, APIResponse
from .utils import get_connection, ensure_uuid, safe_json_parse
from ...shared_services.logger_setup import setup_logger

logger = setup_logger()

class JourneyLoadService:
    """Service for loading journeys"""
    
    def __init__(self):
        self.logger = logger
    
    async def load_journey(self, journey_id: str) -> APIResponse:
        """Load a complete journey by ID"""
        try:
            with get_connection("journeys") as conn:
                with conn.cursor() as cursor:
                    journey_uuid = ensure_uuid(journey_id)
                    
                    # Get journey metadata
                    cursor.execute("""
                        SELECT name, description, is_published, is_deleted, is_archived,
                               is_locked, is_read_only, is_editable, is_view_only,
                               created_at, updated_at
                        FROM journeys WHERE id = %s
                    """, (journey_uuid,))
                    
                    journey_row = cursor.fetchone()
                    if not journey_row:
                        return APIResponse(
                            success=False,
                            message="Journey not found",
                            error="Journey not found"
                        )
                    
                    # Get nodes
                    cursor.execute("""
                        SELECT node_id, node_type, node_subtype, position_x, position_y, data, selected
                        FROM journey_nodes WHERE journey_id = %s
                    """, (journey_uuid,))
                    nodes_data = cursor.fetchall()
                    
                    # Get edges
                    cursor.execute("""
                        SELECT edge_id, source_node, target_node, data, selected, edge_type, animated, style
                        FROM journey_edges WHERE journey_id = %s
                    """, (journey_uuid,))
                    edges_data = cursor.fetchall()
                    
                    # Get goals
                    cursor.execute("""
                        SELECT goal_id, title, description, target_value, current_value, unit,
                               deadline, status, priority, category, created_at, updated_at
                        FROM journey_goals WHERE journey_id = %s
                    """, (journey_uuid,))
                    goals_data = cursor.fetchall()
                    
                    # Get milestones
                    cursor.execute("""
                        SELECT milestone_id, title, description, target_date, status, progress, dependencies, created_at, updated_at
                        FROM journey_milestones WHERE journey_id = %s
                    """, (journey_uuid,))
                    milestones_data = cursor.fetchall()
                    
                    # Get reports
                    cursor.execute("""
                        SELECT report_id, name, report_type, generated_at, data
                        FROM journey_reports WHERE journey_id = %s
                    """, (journey_uuid,))
                    reports_data = cursor.fetchall()
                    
                    # Build complete journey state
                    journey_state = CompleteJourneyState(
                        id=journey_id,
                        name=journey_row[0],
                        description=journey_row[1],
                        createdAt=journey_row[9],
                        updatedAt=journey_row[10],
                        isPublished=journey_row[2],
                        isDeleted=journey_row[3],
                        isArchived=journey_row[4],
                        isLocked=journey_row[5],
                        isReadOnly=journey_row[6],
                        isEditable=journey_row[7],
                        isViewOnly=journey_row[8],
                        nodes=[], edges=[], goals=[], milestones=[], reports=[]
                    )
                    
                    # Process nodes
                    for node_row in nodes_data:
                        journey_state.nodes.append({
                            "id": node_row[0],
                            "type": node_row[1],
                            "node-subtype": node_row[2],
                            "position": {"x": node_row[3], "y": node_row[4]},
                            "data": safe_json_parse(node_row[5]),
                            "selected": node_row[6]
                        })
                    
                    # Process edges
                    for edge_row in edges_data:
                        journey_state.edges.append({
                            "id": edge_row[0],
                            "source": edge_row[1],
                            "target": edge_row[2],
                            "data": safe_json_parse(edge_row[3]),
                            "selected": edge_row[4],
                            "type": edge_row[5],
                            "animated": edge_row[6],
                            "style": safe_json_parse(edge_row[7])
                        })
                    
                    # Process goals
                    for goal_row in goals_data:
                        journey_state.goals.append({
                            "id": goal_row[0],
                            "title": goal_row[1],
                            "description": goal_row[2],
                            "targetValue": goal_row[3],
                            "currentValue": goal_row[4],
                            "unit": goal_row[5],
                            "deadline": goal_row[6],
                            "status": goal_row[7],
                            "priority": goal_row[8],
                            "category": goal_row[9],
                            "createdAt": goal_row[10],
                            "updatedAt": goal_row[11]
                        })
                    
                    # Process milestones
                    for milestone_row in milestones_data:
                        journey_state.milestones.append({
                            "id": milestone_row[0],
                            "title": milestone_row[1],
                            "description": milestone_row[2],
                            "targetDate": milestone_row[3],
                            "status": milestone_row[4],
                            "progress": milestone_row[5],
                            "dependencies": safe_json_parse(milestone_row[6]) or [],
                            "createdAt": milestone_row[7],
                            "updatedAt": milestone_row[8]
                        })
                    
                    # Process reports
                    for report_row in reports_data:
                        journey_state.reports.append({
                            "id": report_row[0],
                            "name": report_row[1],
                            "type": report_row[2],
                            "generatedAt": report_row[3],
                            "data": safe_json_parse(report_row[4])
                        })
                    
                    return APIResponse(
                        success=True,
                        message="Journey loaded successfully",
                        data={"journey": journey_state.dict()}
                    )
                    
        except Exception as e:
            self.logger.error(f"Error loading journey: {e}")
            return APIResponse(
                success=False,
                message="Failed to load journey",
                error=str(e)
            )
    
    async def get_journey_canvas(self, journey_id: str) -> APIResponse:
        """Get journey canvas data (nodes and edges only)"""
        try:
            with get_connection("journeys") as conn:
                with conn.cursor() as cursor:
                    journey_uuid = ensure_uuid(journey_id)
                    
                    # Get nodes
                    cursor.execute("""
                        SELECT node_id, node_type, node_subtype, position_x, position_y, data, selected
                        FROM journey_nodes WHERE journey_id = %s
                    """, (journey_uuid,))
                    nodes_data = cursor.fetchall()
                    
                    # Get edges
                    cursor.execute("""
                        SELECT edge_id, source_node, target_node, data, selected, edge_type, animated, style
                        FROM journey_edges WHERE journey_id = %s
                    """, (journey_uuid,))
                    edges_data = cursor.fetchall()
                    
                    # Process nodes
                    nodes = []
                    for node_row in nodes_data:
                        nodes.append({
                            "id": node_row[0],
                            "type": node_row[1],
                            "node-subtype": node_row[2],
                            "position": {"x": node_row[3], "y": node_row[4]},
                            "data": safe_json_parse(node_row[5]),
                            "selected": node_row[6]
                        })
                    
                    # Process edges
                    edges = []
                    for edge_row in edges_data:
                        edges.append({
                            "id": edge_row[0],
                            "source": edge_row[1],
                            "target": edge_row[2],
                            "data": safe_json_parse(edge_row[3]),
                            "selected": edge_row[4],
                            "type": edge_row[5],
                            "animated": edge_row[6],
                            "style": safe_json_parse(edge_row[7])
                        })
                    
                    return APIResponse(
                        success=True,
                        message="Canvas data loaded successfully",
                        data={"nodes": nodes, "edges": edges}
                    )
                    
        except Exception as e:
            self.logger.error(f"Error loading journey canvas: {e}")
            return APIResponse(
                success=False,
                message="Failed to load journey canvas",
                error=str(e)
            )
    
    async def get_journey_goals(self, journey_id: str) -> APIResponse:
        """Get journey goals only"""
        try:
            with get_connection("journeys") as conn:
                with conn.cursor() as cursor:
                    journey_uuid = ensure_uuid(journey_id)
                    
                    cursor.execute("""
                        SELECT goal_id, title, description, target_value, current_value, unit,
                               deadline, status, priority, category, created_at, updated_at
                        FROM journey_goals WHERE journey_id = %s
                    """, (journey_uuid,))
                    goals_data = cursor.fetchall()
                    
                    goals = []
                    for goal_row in goals_data:
                        goals.append({
                            "id": goal_row[0],
                            "title": goal_row[1],
                            "description": goal_row[2],
                            "targetValue": goal_row[3],
                            "currentValue": goal_row[4],
                            "unit": goal_row[5],
                            "deadline": goal_row[6],
                            "status": goal_row[7],
                            "priority": goal_row[8],
                            "category": goal_row[9],
                            "createdAt": goal_row[10],
                            "updatedAt": goal_row[11]
                        })
                    
                    return APIResponse(
                        success=True,
                        message="Goals loaded successfully",
                        data={"goals": goals}
                    )
                    
        except Exception as e:
            self.logger.error(f"Error loading journey goals: {e}")
            return APIResponse(
                success=False,
                message="Failed to load journey goals",
                error=str(e)
            )
    
    async def get_journey_milestones(self, journey_id: str) -> APIResponse:
        """Get journey milestones only"""
        try:
            with get_connection("journeys") as conn:
                with conn.cursor() as cursor:
                    journey_uuid = ensure_uuid(journey_id)
                    
                    cursor.execute("""
                        SELECT milestone_id, title, description, target_date, status, progress, dependencies, created_at, updated_at
                        FROM journey_milestones WHERE journey_id = %s
                    """, (journey_uuid,))
                    milestones_data = cursor.fetchall()
                    
                    milestones = []
                    for milestone_row in milestones_data:
                        milestones.append({
                            "id": milestone_row[0],
                            "title": milestone_row[1],
                            "description": milestone_row[2],
                            "targetDate": milestone_row[3],
                            "status": milestone_row[4],
                            "progress": milestone_row[5],
                            "dependencies": safe_json_parse(milestone_row[6]) or [],
                            "createdAt": milestone_row[7],
                            "updatedAt": milestone_row[8]
                        })
                    
                    return APIResponse(
                        success=True,
                        message="Milestones loaded successfully",
                        data={"milestones": milestones}
                    )
                    
        except Exception as e:
            self.logger.error(f"Error loading journey milestones: {e}")
            return APIResponse(
                success=False,
                message="Failed to load journey milestones",
                error=str(e)
            )

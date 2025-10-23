import json
from typing import Optional
from uuid import UUID
from datetime import datetime

from ...models.journey_models import CompleteJourneyState, APIResponse
from .utils import get_connection, ensure_uuid, json_serial
from ...shared_services.logger_setup import setup_logger

logger = setup_logger()

class JourneySaveService:
    """Service for saving/updating journeys"""
    
    def __init__(self):
        self.logger = logger
    
    async def save_journey(self, journey_id: str, journey_data: CompleteJourneyState) -> APIResponse:
        """Save/update an existing journey"""
        try:
            with get_connection("journeys") as conn:
                with conn.cursor() as cursor:
                    # Start transaction
                    cursor.execute("BEGIN")
                    
                    journey_uuid = ensure_uuid(journey_id)
                    
                    # Upsert journey metadata (insert if missing, otherwise update)
                    cursor.execute("""
                        INSERT INTO journeys (
                            id, name, description, is_published, is_deleted, is_archived,
                            is_locked, is_read_only, is_editable, is_view_only, updated_at
                        ) VALUES (
                            %s, %s, %s, %s, %s, %s,
                            %s, %s, %s, %s, %s
                        )
                        ON CONFLICT (id) DO UPDATE SET
                            name = EXCLUDED.name,
                            description = EXCLUDED.description,
                            is_published = EXCLUDED.is_published,
                            is_deleted = EXCLUDED.is_deleted,
                            is_archived = EXCLUDED.is_archived,
                            is_locked = EXCLUDED.is_locked,
                            is_read_only = EXCLUDED.is_read_only,
                            is_editable = EXCLUDED.is_editable,
                            is_view_only = EXCLUDED.is_view_only,
                            updated_at = EXCLUDED.updated_at
                    """, (
                        journey_uuid,
                        journey_data.name, journey_data.description, journey_data.isPublished,
                        journey_data.isDeleted, journey_data.isArchived, journey_data.isLocked,
                        journey_data.isReadOnly, journey_data.isEditable, journey_data.isViewOnly,
                        journey_data.updatedAt
                    ))
                    
                    # Upsert nodes (INSERT ... ON CONFLICT ... DO UPDATE)
                    for node in journey_data.nodes:
                        cursor.execute("""
                            INSERT INTO journey_nodes (journey_id, node_id, node_type, node_subtype,
                                                    position_x, position_y, data, selected, updated_at)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                            ON CONFLICT (journey_id, node_id) 
                            DO UPDATE SET 
                                node_type = EXCLUDED.node_type,
                                node_subtype = EXCLUDED.node_subtype,
                                position_x = EXCLUDED.position_x,
                                position_y = EXCLUDED.position_y,
                                data = EXCLUDED.data,
                                selected = EXCLUDED.selected,
                                updated_at = EXCLUDED.updated_at
                        """, (
                            journey_uuid, node.id, node.type, node.node_subtype,
                            node.position.x if node.position else 0, 
                            node.position.y if node.position else 0, 
                            json.dumps(node.data), node.selected,
                            journey_data.updatedAt
                        ))
                    
                    # Upsert edges
                    for edge in journey_data.edges:
                        cursor.execute("""
                            INSERT INTO journey_edges (journey_id, edge_id, source_node, target_node,
                                                    data, selected, edge_type, animated, style, updated_at)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                            ON CONFLICT (journey_id, edge_id) 
                            DO UPDATE SET 
                                source_node = EXCLUDED.source_node,
                                target_node = EXCLUDED.target_node,
                                data = EXCLUDED.data,
                                selected = EXCLUDED.selected,
                                edge_type = EXCLUDED.edge_type,
                                animated = EXCLUDED.animated,
                                style = EXCLUDED.style,
                                updated_at = EXCLUDED.updated_at
                        """, (
                            journey_uuid, edge.id, edge.source, edge.target,
                            json.dumps(edge.data), edge.selected, edge.type, edge.animated, json.dumps(edge.style),
                            journey_data.updatedAt
                        ))
                    
                    # Upsert goals
                    for goal in journey_data.goals:
                        cursor.execute("""
                            INSERT INTO journey_goals (journey_id, goal_id, title, description,
                                                    target_value, current_value, unit, deadline,
                                                    status, priority, category, updated_at)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                            ON CONFLICT (journey_id, goal_id) 
                            DO UPDATE SET 
                                title = EXCLUDED.title,
                                description = EXCLUDED.description,
                                target_value = EXCLUDED.target_value,
                                current_value = EXCLUDED.current_value,
                                unit = EXCLUDED.unit,
                                deadline = EXCLUDED.deadline,
                                status = EXCLUDED.status,
                                priority = EXCLUDED.priority,
                                category = EXCLUDED.category,
                                updated_at = EXCLUDED.updated_at
                        """, (
                            journey_uuid, goal.id, goal.title, goal.description,
                            goal.targetValue, goal.currentValue, goal.unit, goal.deadline,
                            goal.status.value, goal.priority.value, goal.category,
                            journey_data.updatedAt
                        ))
                    
                    # Upsert milestones
                    for milestone in journey_data.milestones:
                        cursor.execute("""
                            INSERT INTO journey_milestones (journey_id, milestone_id, title, description,
                                                         target_date, status, progress, dependencies, updated_at)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                            ON CONFLICT (journey_id, milestone_id) 
                            DO UPDATE SET 
                                title = EXCLUDED.title,
                                description = EXCLUDED.description,
                                target_date = EXCLUDED.target_date,
                                status = EXCLUDED.status,
                                progress = EXCLUDED.progress,
                                dependencies = EXCLUDED.dependencies,
                                updated_at = EXCLUDED.updated_at
                        """, (
                            journey_uuid, milestone.id, milestone.title, milestone.description,
                            milestone.targetDate, milestone.status.value, milestone.progress, json.dumps(milestone.dependencies),
                            journey_data.updatedAt
                        ))
                    
                    # Upsert reports
                    for report in journey_data.reports:
                        cursor.execute("""
                            INSERT INTO journey_reports (journey_id, report_id, name, report_type,
                                                       generated_at, data, updated_at)
                            VALUES (%s, %s, %s, %s, %s, %s, %s)
                            ON CONFLICT (journey_id, report_id) 
                            DO UPDATE SET 
                                name = EXCLUDED.name,
                                report_type = EXCLUDED.report_type,
                                generated_at = EXCLUDED.generated_at,
                                data = EXCLUDED.data,
                                updated_at = EXCLUDED.updated_at
                        """, (
                            journey_uuid, report.id, report.name, report.type.value,
                            report.generatedAt, json.dumps(report.data),
                            journey_data.updatedAt
                        ))
                    
                    # Clean up orphaned records (items that exist in DB but not in current state)
                    # This handles deletions from the frontend
                    cursor.execute("""
                        DELETE FROM journey_nodes 
                        WHERE journey_id = %s AND node_id NOT IN %s
                    """, (journey_uuid, tuple(node.id for node in journey_data.nodes) if journey_data.nodes else ('',)))
                    
                    cursor.execute("""
                        DELETE FROM journey_edges 
                        WHERE journey_id = %s AND edge_id NOT IN %s
                    """, (journey_uuid, tuple(edge.id for edge in journey_data.edges) if journey_data.edges else ('',)))
                    
                    cursor.execute("""
                        DELETE FROM journey_goals 
                        WHERE journey_id = %s AND goal_id NOT IN %s
                    """, (journey_uuid, tuple(goal.id for goal in journey_data.goals) if journey_data.goals else ('',)))
                    
                    cursor.execute("""
                        DELETE FROM journey_milestones 
                        WHERE journey_id = %s AND milestone_id NOT IN %s
                    """, (journey_uuid, tuple(milestone.id for milestone in journey_data.milestones) if journey_data.milestones else ('',)))
                    
                    cursor.execute("""
                        DELETE FROM journey_reports 
                        WHERE journey_id = %s AND report_id NOT IN %s
                    """, (journey_uuid, tuple(report.id for report in journey_data.reports) if journey_data.reports else ('',)))
                    
                    # Commit transaction
                    cursor.execute("COMMIT")
                    
                    # Write snapshot (best-effort, separate connection)
                    try:
                        with get_connection("journey_snapshots") as snap_conn:
                            with snap_conn.cursor() as snap_cur:
                                snap_cur.execute(
                                    "INSERT INTO journey_snapshots (journey_id, snapshot) VALUES (%s, %s)",
                                    (
                                        journey_uuid,
                                        json.dumps(
                                            journey_data.dict() if hasattr(journey_data, 'dict') else journey_data,
                                            default=json_serial
                                        )
                                    )
                                )
                                snap_conn.commit()
                    except Exception as snap_err:
                        self.logger.error(f"Failed to write journey snapshot: {snap_err}")
                    
                    self.logger.info(f"Journey saved successfully: {journey_id}")
                    return APIResponse(
                        success=True,
                        message="Journey saved successfully",
                        data={"journey_id": journey_id}
                    )
                    
        except Exception as e:
            self.logger.error(f"Error saving journey: {e}")
            return APIResponse(
                success=False,
                message="Failed to save journey",
                error=str(e)
            )
    
    async def save_journey_canvas(self, journey_id: str, canvas_data: dict) -> APIResponse:
        """Save journey canvas data (nodes and edges only)"""
        try:
            with get_connection("journeys") as conn:
                with conn.cursor() as cursor:
                    # Start transaction
                    cursor.execute("BEGIN")
                    
                    journey_uuid = ensure_uuid(journey_id)
                    
                    # Upsert nodes
                    for node in canvas_data.get("nodes", []):
                        cursor.execute("""
                            INSERT INTO journey_nodes (journey_id, node_id, node_type, node_subtype,
                                                    position_x, position_y, data, selected, updated_at)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                            ON CONFLICT (journey_id, node_id) 
                            DO UPDATE SET 
                                node_type = EXCLUDED.node_type,
                                node_subtype = EXCLUDED.node_subtype,
                                position_x = EXCLUDED.position_x,
                                position_y = EXCLUDED.position_y,
                                data = EXCLUDED.data,
                                selected = EXCLUDED.selected,
                                updated_at = EXCLUDED.updated_at
                        """, (
                            journey_uuid, node["id"], node["type"], node.get("node-subtype"),
                            node.get("position", {}).get("x", 0), node.get("position", {}).get("y", 0), 
                            json.dumps(node["data"]), node.get("selected", False),
                            datetime.now()
                        ))
                    
                    # Upsert edges
                    for edge in canvas_data.get("edges", []):
                        cursor.execute("""
                            INSERT INTO journey_edges (journey_id, edge_id, source_node, target_node,
                                                    data, selected, edge_type, animated, style, updated_at)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                            ON CONFLICT (journey_id, edge_id) 
                            DO UPDATE SET 
                                source_node = EXCLUDED.source_node,
                                target_node = EXCLUDED.target_node,
                                data = EXCLUDED.data,
                                selected = EXCLUDED.selected,
                                edge_type = EXCLUDED.edge_type,
                                animated = EXCLUDED.animated,
                                style = EXCLUDED.style,
                                updated_at = EXCLUDED.updated_at
                        """, (
                            journey_uuid, edge["id"], edge["source"], edge["target"],
                            json.dumps(edge["data"]), edge.get("selected", False), edge["type"], edge.get("animated", False), json.dumps(edge.get("style", {})),
                            datetime.now()
                        ))
                    
                    # Clean up orphaned records
                    cursor.execute("""
                        DELETE FROM journey_nodes 
                        WHERE journey_id = %s AND node_id NOT IN %s
                    """, (journey_uuid, tuple(node["id"] for node in canvas_data.get("nodes", [])) if canvas_data.get("nodes") else ('',)))
                    
                    cursor.execute("""
                        DELETE FROM journey_edges 
                        WHERE journey_id = %s AND edge_id NOT IN %s
                    """, (journey_uuid, tuple(edge["id"] for edge in canvas_data.get("edges", [])) if canvas_data.get("edges") else ('',)))
                    
                    # Commit transaction
                    cursor.execute("COMMIT")
                    
                    self.logger.info(f"Canvas saved successfully: {journey_id}")
                    return APIResponse(
                        success=True,
                        message="Canvas saved successfully",
                        data={"journey_id": journey_id}
                    )
                    
        except Exception as e:
            self.logger.error(f"Error saving canvas: {e}")
            return APIResponse(
                success=False,
                message="Failed to save canvas",
                error=str(e)
            )
    
    async def save_journey_goals(self, journey_id: str, goals_data: dict) -> APIResponse:
        """Save journey goals only"""
        try:
            with get_connection("journeys") as conn:
                with conn.cursor() as cursor:
                    # Start transaction
                    cursor.execute("BEGIN")
                    
                    journey_uuid = ensure_uuid(journey_id)
                    
                    # Upsert goals
                    goals = goals_data.get("goals", [])
                    for goal in goals:
                        # Handle both status and priority formats: string or object
                        status_value = goal["status"]
                        if isinstance(status_value, dict):
                            status_value = status_value.get("value", "active")
                        elif not isinstance(status_value, str):
                            status_value = "active"
                            
                        priority_value = goal["priority"]
                        if isinstance(priority_value, dict):
                            priority_value = priority_value.get("value", "medium")
                        elif not isinstance(priority_value, str):
                            priority_value = "medium"
                        
                        cursor.execute("""
                            INSERT INTO journey_goals (journey_id, goal_id, title, description,
                                                    target_value, current_value, unit, deadline,
                                                    status, priority, category, updated_at)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                            ON CONFLICT (journey_id, goal_id) 
                            DO UPDATE SET 
                                title = EXCLUDED.title,
                                description = EXCLUDED.description,
                                target_value = EXCLUDED.target_value,
                                current_value = EXCLUDED.current_value,
                                unit = EXCLUDED.unit,
                                deadline = EXCLUDED.deadline,
                                status = EXCLUDED.status,
                                priority = EXCLUDED.priority,
                                category = EXCLUDED.category,
                                updated_at = EXCLUDED.updated_at
                        """, (
                            journey_uuid, goal["id"], goal["title"], goal["description"],
                            goal["targetValue"], goal["currentValue"], goal["unit"], goal["deadline"],
                            status_value, priority_value, goal["category"],
                            datetime.now()
                        ))
                    
                    # Clean up orphaned records
                    cursor.execute("""
                        DELETE FROM journey_goals 
                        WHERE journey_id = %s AND goal_id NOT IN %s
                    """, (journey_uuid, tuple(goal["id"] for goal in goals) if goals else ('',)))
                    
                    # Commit transaction
                    cursor.execute("COMMIT")
                    
                    self.logger.info(f"Goals saved successfully: {journey_id}")
                    return APIResponse(
                        success=True,
                        message="Goals saved successfully",
                        data={"journey_id": journey_id}
                    )
                    
        except Exception as e:
            self.logger.error(f"Error saving goals: {e}")
            return APIResponse(
                success=False,
                message="Failed to save goals",
                error=str(e)
            )
    
    async def save_journey_milestones(self, journey_id: str, milestones_data: dict) -> APIResponse:
        """Save journey milestones only"""
        try:
            with get_connection("journeys") as conn:
                with conn.cursor() as cursor:
                    # Start transaction
                    cursor.execute("BEGIN")
                    
                    journey_uuid = ensure_uuid(journey_id)
                    
                    # Upsert milestones
                    milestones = milestones_data.get("milestones", [])
                    for milestone in milestones:
                        # Handle both status formats: string or object
                        status_value = milestone["status"]
                        if isinstance(status_value, dict):
                            status_value = status_value.get("value", "pending")
                        elif not isinstance(status_value, str):
                            status_value = "pending"
                        
                        cursor.execute("""
                            INSERT INTO journey_milestones (journey_id, milestone_id, title, description,
                                                         target_date, status, progress, dependencies, sort_order, updated_at)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                            ON CONFLICT (journey_id, milestone_id) 
                            DO UPDATE SET 
                                title = EXCLUDED.title,
                                description = EXCLUDED.description,
                                target_date = EXCLUDED.target_date,
                                status = EXCLUDED.status,
                                progress = EXCLUDED.progress,
                                dependencies = EXCLUDED.dependencies,
                                sort_order = EXCLUDED.sort_order,
                                updated_at = EXCLUDED.updated_at
                        """, (
                            journey_uuid, milestone["id"], milestone["title"], milestone["description"],
                            milestone["targetDate"], status_value, milestone["progress"], json.dumps(milestone.get("dependencies", [])),
                            milestone.get("sortOrder", 0), datetime.now()
                        ))
                    
                    # Clean up orphaned records
                    cursor.execute("""
                        DELETE FROM journey_milestones 
                        WHERE journey_id = %s AND milestone_id NOT IN %s
                    """, (journey_uuid, tuple(milestone["id"] for milestone in milestones) if milestones else ('',)))
                    
                    # Commit transaction
                    cursor.execute("COMMIT")
                    
                    self.logger.info(f"Milestones saved successfully: {journey_id}")
                    return APIResponse(
                        success=True,
                        message="Milestones saved successfully",
                        data={"journey_id": journey_id}
                    )
                    
        except Exception as e:
            self.logger.error(f"Error saving milestones: {e}")
            return APIResponse(
                success=False,
                message="Failed to save milestones",
                error=str(e)
            )

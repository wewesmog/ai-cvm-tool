from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Union
from datetime import datetime, date
from enum import Enum
from uuid import UUID

# ============================================================================
# ENUMS
# ============================================================================

class JourneyStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"
    DELETED = "deleted"

class GoalStatus(str, Enum):
    NOT_STARTED = "not-started"
    IN_PROGRESS = "in-progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    DELETED = "deleted"
    ARCHIVED = "archived"
    ACTIVE = "active"

class MilestoneStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in-progress"
    COMPLETED = "completed"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"
    DELETED = "deleted"
    ARCHIVED = "archived"
    ACTIVE = "active"

class Priority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class ReportType(str, Enum):
    PROGRESS = "progress"
    PERFORMANCE = "performance"
    SUMMARY = "summary"

# ============================================================================
# CORE JOURNEY MODELS
# ============================================================================

class Position(BaseModel):
    x: float
    y: float

class NodeData(BaseModel):
    id: str
    type: str
    node_subtype: str = Field(..., alias="node-subtype")
    position: Optional[Position] = None  # Position is optional since it's UI state
    data: Dict[str, Any] = Field(default_factory=dict)
    selected: bool = False

class EdgeData(BaseModel):
    id: str
    source: str
    target: str
    data: Dict[str, Any] = Field(default_factory=dict)
    selected: bool = False
    type: Optional[str] = None
    animated: bool = False
    style: Dict[str, Any] = Field(default_factory=dict)

class GoalData(BaseModel):
    id: str
    title: str
    description: str
    targetValue: float
    currentValue: float = 0
    unit: str
    deadline: Optional[datetime] = None
    status: GoalStatus = GoalStatus.NOT_STARTED
    priority: Priority = Priority.MEDIUM
    category: str = ""
    createdAt: datetime = Field(default_factory=datetime.now)
    updatedAt: datetime = Field(default_factory=datetime.now)

class MilestoneData(BaseModel):
    id: str
    title: str
    description: str
    targetDate: Optional[datetime] = None
    status: MilestoneStatus = MilestoneStatus.PENDING
    progress: int = Field(default=0, ge=0, le=100)
    dependencies: List[str] = Field(default_factory=list)
    createdAt: datetime = Field(default_factory=datetime.now)
    updatedAt: datetime = Field(default_factory=datetime.now)

class ReportData(BaseModel):
    id: str
    name: str
    type: ReportType
    generatedAt: datetime = Field(default_factory=datetime.now)
    data: Dict[str, Any]

# ============================================================================
# DATABASE MODELS
# ============================================================================

class Journey(BaseModel):
    id: Optional[UUID] = None
    name: str = "Untitled Journey"
    description: str = "No description"
    is_published: bool = False
    is_deleted: bool = False
    is_archived: bool = False
    is_locked: bool = False
    is_read_only: bool = False
    is_editable: bool = True
    is_view_only: bool = False
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    user_id: Optional[str] = None

class JourneyNode(BaseModel):
    id: Optional[UUID] = None
    journey_id: UUID
    node_id: str
    node_type: str
    node_subtype: str
    position_x: float
    position_y: float
    data: Dict[str, Any] = Field(default_factory=dict)
    selected: bool = False
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class JourneyEdge(BaseModel):
    id: Optional[UUID] = None
    journey_id: UUID
    edge_id: str
    source_node: str
    target_node: str
    data: Dict[str, Any] = Field(default_factory=dict)
    selected: bool = False
    edge_type: Optional[str] = None
    animated: bool = False
    style: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class JourneyGoal(BaseModel):
    id: Optional[UUID] = None
    journey_id: UUID
    goal_id: str
    title: str
    description: str
    target_value: float
    current_value: float = 0
    unit: str
    deadline: Optional[datetime] = None
    status: GoalStatus = GoalStatus.NOT_STARTED
    priority: Priority = Priority.MEDIUM
    category: str = ""
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class JourneyMilestone(BaseModel):
    id: Optional[UUID] = None
    journey_id: UUID
    milestone_id: str
    title: str
    description: str
    target_date: Optional[datetime] = None
    status: MilestoneStatus = MilestoneStatus.PENDING
    progress: int = Field(default=0, ge=0, le=100)
    dependencies: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class JourneyReport(BaseModel):
    id: Optional[UUID] = None
    journey_id: UUID
    report_id: str
    name: str
    report_type: ReportType
    generated_at: datetime = Field(default_factory=datetime.now)
    data: Dict[str, Any]
    created_at: datetime = Field(default_factory=datetime.now)

# ============================================================================
# COMPLETE JOURNEY STATE
# ============================================================================

class CompleteJourneyState(BaseModel):
    """Complete journey state matching the frontend store"""
    # Journey metadata
    id: str
    name: str
    description: str
    createdAt: datetime
    updatedAt: datetime
    
    # Journey state flags
    isPublished: bool = False
    isDeleted: bool = False
    isArchived: bool = False
    isLocked: bool = False
    isReadOnly: bool = False
    isEditable: bool = True
    isViewOnly: bool = False
    
    # Canvas content
    nodes: List[NodeData] = Field(default_factory=list)
    edges: List[EdgeData] = Field(default_factory=list)
    
    # Goals content
    goals: List[GoalData] = Field(default_factory=list)
    
    # Milestones content
    milestones: List[MilestoneData] = Field(default_factory=list)
    
    # Reports content
    reports: List[ReportData] = Field(default_factory=list)

# ============================================================================
# API REQUEST/RESPONSE MODELS
# ============================================================================

class JourneyCreateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    user_id: Optional[str] = None

class JourneyUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    isPublished: Optional[bool] = None
    isArchived: Optional[bool] = None
    isLocked: Optional[bool] = None
    isReadOnly: Optional[bool] = None
    isEditable: Optional[bool] = None
    isViewOnly: Optional[bool] = None

class JourneySaveRequest(BaseModel):
    """Save complete journey state"""
    journey: CompleteJourneyState

class JourneyResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None
    journey: Optional[CompleteJourneyState] = None

class JourneyListResponse(BaseModel):
    success: bool
    message: str
    journeys: List[Dict[str, Any]]
    total: int

class JourneyStats(BaseModel):
    totalGoals: int
    completedGoals: int
    totalMilestones: int
    completedMilestones: int
    totalNodes: int
    totalEdges: int

# ============================================================================
# UTILITY MODELS
# ============================================================================

class DatabaseOperation(BaseModel):
    operation_type: str
    table: str
    data: Dict[str, Any]
    success: bool = True
    error: Optional[str] = None

class APIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None



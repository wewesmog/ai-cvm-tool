from fastapi import APIRouter, HTTPException, Query, Path
from typing import Optional, List
from uuid import UUID
import uuid

from ..models.journey_models import (
    JourneyCreateRequest, JourneyUpdateRequest, JourneySaveRequest,
    JourneyResponse, JourneyListResponse, APIResponse
)
from ..journey_service import JourneyService
from ..shared_services.logger_setup import setup_logger

logger = setup_logger()
router = APIRouter(prefix="/api/journeys", tags=["journeys"])

# Initialize service
journey_service = JourneyService()

@router.post("/", response_model=JourneyResponse)
async def create_journey(request: JourneyCreateRequest):
    """
    Create a new journey
    """
    try:
        logger.info(f"Creating new journey: {request.name}")
        
        # Create a basic journey state
        from ..models.journey_models import CompleteJourneyState
        from datetime import datetime
        
        journey_state = CompleteJourneyState(
            id="",  # Will be set by the service after creation
            name=request.name or "Untitled Journey",
            description=request.description or "No description",
            createdAt=datetime.now(),
            updatedAt=datetime.now()
        )
        
        result = await journey_service.create_journey(journey_state, request.user_id)
        
        if result.success:
            # Update the journey state with the actual ID from the service
            journey_state.id = result.data["journey_id"]
            return JourneyResponse(
                success=True,
                message=result.message,
                journey=journey_state
            )
        else:
            raise HTTPException(status_code=400, detail=result.message)
            
    except Exception as e:
        logger.error(f"Error creating journey: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=JourneyListResponse)
async def list_journeys(
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    limit: int = Query(50, ge=1, le=100, description="Number of journeys to return"),
    offset: int = Query(0, ge=0, description="Number of journeys to skip")
):
    """
    List journeys for a user
    """
    try:
        logger.info(f"Listing journeys for user: {user_id}")
        
        result = await journey_service.list_journeys(user_id, limit, offset)
        
        if result.success:
            return JourneyListResponse(
                success=True,
                message=result.message,
                journeys=result.data["journeys"],
                total=result.data["total"]
            )
        else:
            raise HTTPException(status_code=400, detail=result.message)
            
    except Exception as e:
        logger.error(f"Error listing journeys: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{journey_id}", response_model=JourneyResponse)
async def get_journey(
    journey_id: str = Path(..., description="Journey ID")
):
    """
    Get a specific journey by ID
    """
    try:
        logger.info(f"Getting journey: {journey_id}")
        
        result = await journey_service.load_journey(journey_id)
        
        if result.success:
            return JourneyResponse(
                success=True,
                message=result.message,
                journey=result.data["journey"]
            )
        else:
            raise HTTPException(status_code=404, detail=result.message)
            
    except Exception as e:
        logger.error(f"Error getting journey: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{journey_id}", response_model=JourneyResponse)
async def update_journey(
    journey_id: str = Path(..., description="Journey ID"),
    request: JourneyUpdateRequest = None
):
    """
    Update journey metadata
    """
    try:
        logger.info(f"Updating journey metadata: {journey_id}")
        
        # First load the current journey
        load_result = await journey_service.load_journey(journey_id)
        if not load_result.success:
            raise HTTPException(status_code=404, detail="Journey not found")
        
        # Update the journey state with new metadata
        journey_state = load_result.data["journey"]
        
        if request.name is not None:
            journey_state["name"] = request.name
        if request.description is not None:
            journey_state["description"] = request.description
        if request.isPublished is not None:
            journey_state["isPublished"] = request.isPublished
        if request.isArchived is not None:
            journey_state["isArchived"] = request.isArchived
        if request.isLocked is not None:
            journey_state["isLocked"] = request.isLocked
        if request.isReadOnly is not None:
            journey_state["isReadOnly"] = request.isReadOnly
        if request.isEditable is not None:
            journey_state["isEditable"] = request.isEditable
        if request.isViewOnly is not None:
            journey_state["isViewOnly"] = request.isViewOnly
        
        # Save the updated journey
        from ..models.journey_models import CompleteJourneyState
        updated_journey = CompleteJourneyState(**journey_state)
        
        save_result = await journey_service.save_journey(journey_id, updated_journey)
        
        if save_result.success:
            return JourneyResponse(
                success=True,
                message="Journey updated successfully",
                journey=updated_journey
            )
        else:
            raise HTTPException(status_code=400, detail=save_result.message)
            
    except Exception as e:
        logger.error(f"Error updating journey: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{journey_id}/save", response_model=JourneyResponse)
async def save_journey(
    journey_id: str = Path(..., description="Journey ID"),
    request: JourneySaveRequest = None
):
    """
    Save complete journey state (nodes, edges, goals, milestones, reports)
    """
    try:
        logger.info(f"Saving journey: {journey_id}")
        
        result = await journey_service.save_journey(journey_id, request.journey)
        
        if result.success:
            return JourneyResponse(
                success=True,
                message=result.message,
                journey=request.journey
            )
        else:
            raise HTTPException(status_code=400, detail=result.message)
            
    except Exception as e:
        logger.error(f"Error saving journey: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{journey_id}", response_model=APIResponse)
async def delete_journey(
    journey_id: str = Path(..., description="Journey ID"),
    hard_delete: bool = Query(False, description="Perform hard delete instead of soft delete")
):
    """
    Delete a journey
    """
    try:
        logger.info(f"Deleting journey: {journey_id} (hard_delete={hard_delete})")
        
        result = await journey_service.delete_journey(journey_id, not hard_delete)
        
        if result.success:
            return APIResponse(
                success=True,
                message=result.message,
                data=result.data
            )
        else:
            raise HTTPException(status_code=400, detail=result.message)
            
    except Exception as e:
        logger.error(f"Error deleting journey: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{journey_id}/stats", response_model=APIResponse)
async def get_journey_stats(
    journey_id: str = Path(..., description="Journey ID")
):
    """
    Get journey statistics
    """
    try:
        logger.info(f"Getting journey stats: {journey_id}")
        
        result = await journey_service.get_journey_stats(journey_id)
        
        if result.success:
            return APIResponse(
                success=True,
                message=result.message,
                data=result.data
            )
        else:
            raise HTTPException(status_code=404, detail=result.message)
            
    except Exception as e:
        logger.error(f"Error getting journey stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{journey_id}/duplicate", response_model=JourneyResponse)
async def duplicate_journey(
    journey_id: str = Path(..., description="Journey ID to duplicate"),
    new_name: Optional[str] = Query(None, description="Name for the duplicated journey")
):
    """
    Duplicate an existing journey
    """
    try:
        logger.info(f"Duplicating journey: {journey_id}")
        
        # Load the original journey
        load_result = await journey_service.load_journey(journey_id)
        if not load_result.success:
            raise HTTPException(status_code=404, detail="Journey not found")
        
        # Create a new journey with the same data but new ID
        from ..models.journey_models import CompleteJourneyState
        from datetime import datetime
        
        original_journey = load_result.data["journey"]
        new_journey = CompleteJourneyState(
            id="",  # Will be set by the service after creation
            name=new_name or f"{original_journey['name']} (Copy)",
            description=original_journey["description"],
            createdAt=datetime.now(),
            updatedAt=datetime.now(),
            isPublished=False,  # Duplicated journeys start as unpublished
            isDeleted=False,
            isArchived=False,
            isLocked=False,
            isReadOnly=False,
            isEditable=True,
            isViewOnly=False,
            nodes=original_journey["nodes"],
            edges=original_journey["edges"],
            goals=original_journey["goals"],
            milestones=original_journey["milestones"],
            reports=[]  # Don't duplicate reports
        )
        
        # Create the new journey
        create_result = await journey_service.create_journey(new_journey)
        
        if create_result.success:
            return JourneyResponse(
                success=True,
                message="Journey duplicated successfully",
                journey=new_journey
            )
        else:
            raise HTTPException(status_code=400, detail=create_result.message)
            
    except Exception as e:
        logger.error(f"Error duplicating journey: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Domain-specific endpoints
@router.get("/{journey_id}/canvas", response_model=APIResponse)
async def get_journey_canvas(
    journey_id: str = Path(..., description="Journey ID")
):
    """
    Get journey canvas data (nodes and edges only)
    """
    try:
        logger.info(f"Getting journey canvas: {journey_id}")
        
        result = await journey_service.get_journey_canvas(journey_id)
        
        if result.success:
            return APIResponse(
                success=True,
                message=result.message,
                data=result.data
            )
        else:
            raise HTTPException(status_code=404, detail=result.message)
            
    except Exception as e:
        logger.error(f"Error getting journey canvas: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{journey_id}/canvas", response_model=APIResponse)
async def save_journey_canvas(
    journey_id: str = Path(..., description="Journey ID"),
    canvas_data: dict = None
):
    """
    Save journey canvas data (nodes and edges only)
    """
    try:
        logger.info(f"Saving journey canvas: {journey_id}")
        
        result = await journey_service.save_journey_canvas(journey_id, canvas_data)
        
        if result.success:
            return APIResponse(
                success=True,
                message=result.message,
                data=result.data
            )
        else:
            raise HTTPException(status_code=400, detail=result.message)
            
    except Exception as e:
        logger.error(f"Error saving journey canvas: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{journey_id}/goals", response_model=APIResponse)
async def get_journey_goals(
    journey_id: str = Path(..., description="Journey ID")
):
    """
    Get journey goals only
    """
    try:
        logger.info(f"Getting journey goals: {journey_id}")
        
        result = await journey_service.get_journey_goals(journey_id)
        
        if result.success:
            return APIResponse(
                success=True,
                message=result.message,
                data=result.data
            )
        else:
            raise HTTPException(status_code=404, detail=result.message)
            
    except Exception as e:
        logger.error(f"Error getting journey goals: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{journey_id}/goals", response_model=APIResponse)
async def save_journey_goals(
    journey_id: str = Path(..., description="Journey ID"),
    goals_data: dict = None
):
    """
    Save journey goals only
    """
    try:
        logger.info(f"Saving journey goals: {journey_id}")
        
        result = await journey_service.save_journey_goals(journey_id, goals_data)
        
        if result.success:
            return APIResponse(
                success=True,
                message=result.message,
                data=result.data
            )
        else:
            raise HTTPException(status_code=400, detail=result.message)
            
    except Exception as e:
        logger.error(f"Error saving journey goals: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{journey_id}/milestones", response_model=APIResponse)
async def get_journey_milestones(
    journey_id: str = Path(..., description="Journey ID")
):
    """
    Get journey milestones only
    """
    try:
        logger.info(f"Getting journey milestones: {journey_id}")
        
        result = await journey_service.get_journey_milestones(journey_id)
        
        if result.success:
            return APIResponse(
                success=True,
                message=result.message,
                data=result.data
            )
        else:
            raise HTTPException(status_code=404, detail=result.message)
            
    except Exception as e:
        logger.error(f"Error getting journey milestones: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{journey_id}/milestones", response_model=APIResponse)
async def save_journey_milestones(
    journey_id: str = Path(..., description="Journey ID"),
    milestones_data: dict = None
):
    """
    Save journey milestones only
    """
    try:
        logger.info(f"Saving journey milestones: {journey_id}")
        
        result = await journey_service.save_journey_milestones(journey_id, milestones_data)
        
        if result.success:
            return APIResponse(
                success=True,
                message=result.message,
                data=result.data
            )
        else:
            raise HTTPException(status_code=400, detail=result.message)
            
    except Exception as e:
        logger.error(f"Error saving journey milestones: {e}")
        raise HTTPException(status_code=500, detail=str(e))

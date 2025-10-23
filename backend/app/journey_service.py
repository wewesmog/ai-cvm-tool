from typing import List, Dict, Any, Optional
from uuid import UUID

from .models.journey_models import (
    Journey, JourneyNode, JourneyEdge, JourneyGoal, JourneyMilestone, JourneyReport,
    CompleteJourneyState, JourneyStats, APIResponse
)

# Import all the specialized services
from .services.journey.create_service import JourneyCreateService
from .services.journey.save_service import JourneySaveService
from .services.journey.load_service import JourneyLoadService
from .services.journey.list_service import JourneyListService
from .services.journey.delete_service import JourneyDeleteService
from .services.journey.stats_service import JourneyStatsService

class JourneyService:
    """Main facade for journey operations - delegates to specialized services"""
    
    def __init__(self):
        # Initialize all specialized services
        self.create_service = JourneyCreateService()
        self.save_service = JourneySaveService()
        self.load_service = JourneyLoadService()
        self.list_service = JourneyListService()
        self.delete_service = JourneyDeleteService()
        self.stats_service = JourneyStatsService()
    
    async def create_journey(self, journey_data: CompleteJourneyState, user_id: Optional[str] = None) -> APIResponse:
        """Create a new journey with all its components"""
        return await self.create_service.create_journey(journey_data, user_id)
    
    async def save_journey(self, journey_id: str, journey_data: CompleteJourneyState) -> APIResponse:
        """Save/update an existing journey"""
        return await self.save_service.save_journey(journey_id, journey_data)
    
    async def load_journey(self, journey_id: str) -> APIResponse:
        """Load a complete journey by ID"""
        return await self.load_service.load_journey(journey_id)
    
    async def list_journeys(self, user_id: Optional[str] = None, limit: int = 50, offset: int = 0) -> APIResponse:
        """List journeys for a user"""
        return await self.list_service.list_journeys(user_id, limit, offset)
    
    async def delete_journey(self, journey_id: str, soft_delete: bool = True) -> APIResponse:
        """Delete a journey (soft delete by default)"""
        return await self.delete_service.delete_journey(journey_id, soft_delete)
    
    async def get_journey_stats(self, journey_id: str) -> APIResponse:
        """Get statistics for a journey"""
        return await self.stats_service.get_journey_stats(journey_id)
    
    # Domain-specific methods
    async def get_journey_canvas(self, journey_id: str) -> APIResponse:
        """Get journey canvas data (nodes and edges only)"""
        return await self.load_service.get_journey_canvas(journey_id)
    
    async def save_journey_canvas(self, journey_id: str, canvas_data: dict) -> APIResponse:
        """Save journey canvas data (nodes and edges only)"""
        return await self.save_service.save_journey_canvas(journey_id, canvas_data)
    
    async def get_journey_goals(self, journey_id: str) -> APIResponse:
        """Get journey goals only"""
        return await self.load_service.get_journey_goals(journey_id)
    
    async def save_journey_goals(self, journey_id: str, goals_data: dict) -> APIResponse:
        """Save journey goals only"""
        return await self.save_service.save_journey_goals(journey_id, goals_data)
    
    async def get_journey_milestones(self, journey_id: str) -> APIResponse:
        """Get journey milestones only"""
        return await self.load_service.get_journey_milestones(journey_id)
    
    async def save_journey_milestones(self, journey_id: str, milestones_data: dict) -> APIResponse:
        """Save journey milestones only"""
        return await self.save_service.save_journey_milestones(journey_id, milestones_data)

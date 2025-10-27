"""
Frontend API client for journey operations
This shows how to integrate with the backend API from the frontend
"""

import httpx
from typing import Optional, Dict, Any, List
from ..models.journey_models import CompleteJourneyState, APIResponse

class JourneyAPIClient:
    """Client for journey API operations"""
    
    def __init__(self, base_url: str = "http://localhost:8001"):
        self.base_url = base_url
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def create_journey(self, name: str, description: str = "", user_id: Optional[str] = None) -> Dict[str, Any]:
        """Create a new journey"""
        try:
            response = await self.client.post(
                f"{self.base_url}/api/journeys/",
                json={
                    "name": name,
                    "description": description,
                    "user_id": user_id
                }
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            return {"success": False, "message": f"Failed to create journey: {e}"}
    
    async def save_journey(self, journey_id: str, journey_state: CompleteJourneyState) -> Dict[str, Any]:
        """Save complete journey state"""
        try:
            response = await self.client.post(
                f"{self.base_url}/api/journeys/{journey_id}/save",
                json={"journey": journey_state.dict()}
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            return {"success": False, "message": f"Failed to save journey: {e}"}
    
    async def load_journey(self, journey_id: str) -> Dict[str, Any]:
        """Load a journey by ID"""
        try:
            response = await self.client.get(f"{self.base_url}/api/journeys/{journey_id}")
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            return {"success": False, "message": f"Failed to load journey: {e}"}
    
    async def list_journeys(self, user_id: Optional[str] = None, limit: int = 50, offset: int = 0) -> Dict[str, Any]:
        """List journeys for a user"""
        try:
            params = {"limit": limit, "offset": offset}
            if user_id:
                params["user_id"] = user_id
            
            response = await self.client.get(
                f"{self.base_url}/api/journeys/",
                params=params
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            return {"success": False, "message": f"Failed to list journeys: {e}"}
    
    async def update_journey(self, journey_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Update journey metadata"""
        try:
            response = await self.client.put(
                f"{self.base_url}/api/journeys/{journey_id}",
                json=updates
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            return {"success": False, "message": f"Failed to update journey: {e}"}
    
    async def delete_journey(self, journey_id: str, hard_delete: bool = False) -> Dict[str, Any]:
        """Delete a journey"""
        try:
            response = await self.client.delete(
                f"{self.base_url}/api/journeys/{journey_id}",
                params={"hard_delete": hard_delete}
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            return {"success": False, "message": f"Failed to delete journey: {e}"}
    
    async def get_journey_stats(self, journey_id: str) -> Dict[str, Any]:
        """Get journey statistics"""
        try:
            response = await self.client.get(f"{self.base_url}/api/journeys/{journey_id}/stats")
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            return {"success": False, "message": f"Failed to get journey stats: {e}"}
    
    async def duplicate_journey(self, journey_id: str, new_name: Optional[str] = None) -> Dict[str, Any]:
        """Duplicate a journey"""
        try:
            params = {}
            if new_name:
                params["new_name"] = new_name
            
            response = await self.client.post(
                f"{self.base_url}/api/journeys/{journey_id}/duplicate",
                params=params
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            return {"success": False, "message": f"Failed to duplicate journey: {e}"}
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()

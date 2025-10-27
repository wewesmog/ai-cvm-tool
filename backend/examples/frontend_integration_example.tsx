// Example of how to integrate the backend API with your frontend journey store
// This shows how to replace localStorage with API calls and handle success/error toasts

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { toast } from 'sonner'; // or your preferred toast library

// API client for journey operations
class JourneyAPIClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:8001') {
    this.baseUrl = baseUrl;
  }

  async createJourney(name: string, description: string = '', userId?: string) {
    const response = await fetch(`${this.baseUrl}/api/journeys/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, user_id: userId })
    });
    return response.json();
  }

  async saveJourney(journeyId: string, journeyState: any) {
    const response = await fetch(`${this.baseUrl}/api/journeys/${journeyId}/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ journey: journeyState })
    });
    return response.json();
  }

  async loadJourney(journeyId: string) {
    const response = await fetch(`${this.baseUrl}/api/journeys/${journeyId}`);
    return response.json();
  }

  async listJourneys(userId?: string, limit = 50, offset = 0) {
    const params = new URLSearchParams({ limit: limit.toString(), offset: offset.toString() });
    if (userId) params.append('user_id', userId);
    
    const response = await fetch(`${this.baseUrl}/api/journeys/?${params}`);
    return response.json();
  }

  async updateJourney(journeyId: string, updates: any) {
    const response = await fetch(`${this.baseUrl}/api/journeys/${journeyId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return response.json();
  }

  async deleteJourney(journeyId: string, hardDelete = false) {
    const response = await fetch(`${this.baseUrl}/api/journeys/${journeyId}?hard_delete=${hardDelete}`, {
      method: 'DELETE'
    });
    return response.json();
  }

  async getJourneyStats(journeyId: string) {
    const response = await fetch(`${this.baseUrl}/api/journeys/${journeyId}/stats`);
    return response.json();
  }

  async duplicateJourney(journeyId: string, newName?: string) {
    const params = newName ? `?new_name=${encodeURIComponent(newName)}` : '';
    const response = await fetch(`${this.baseUrl}/api/journeys/${journeyId}/duplicate${params}`, {
      method: 'POST'
    });
    return response.json();
  }
}

// Enhanced journey store with API integration
interface JourneyState {
  // ... your existing state ...
  id: string;
  name: string;
  description: string;
  nodes: any[];
  edges: any[];
  goals: any[];
  milestones: any[];
  reports: any[];
  
  // API operations
  saveJourney: () => Promise<void>;
  loadJourney: (journeyId: string) => Promise<void>;
  createNewJourney: (name?: string) => Promise<void>;
  deleteJourney: () => Promise<void>;
  duplicateJourney: (newName?: string) => Promise<void>;
  
  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  lastError: string | null;
}

const useJourneyStore = create<JourneyState>()(
  devtools(
    (set, get) => {
      const apiClient = new JourneyAPIClient();

      return {
        // ... your existing state ...
        id: '1234567890',
        name: 'Untitled Journey',
        description: 'No description',
        nodes: [],
        edges: [],
        goals: [],
        milestones: [],
        reports: [],
        
        // Loading states
        isLoading: false,
        isSaving: false,
        lastError: null,

        // API operations with toast notifications
        saveJourney: async () => {
          const state = get();
          set({ isSaving: true, lastError: null });
          
          try {
            const result = await apiClient.saveJourney(state.id, {
              id: state.id,
              name: state.name,
              description: state.description,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              isPublished: false,
              isDeleted: false,
              isArchived: false,
              isLocked: false,
              isReadOnly: false,
              isEditable: true,
              isViewOnly: false,
              nodes: state.nodes,
              edges: state.edges,
              goals: state.goals,
              milestones: state.milestones,
              reports: state.reports
            });

            if (result.success) {
              toast.success('Journey saved successfully!', {
                description: 'All your changes have been saved to the database.'
              });
              set({ isSaving: false });
            } else {
              throw new Error(result.message || 'Failed to save journey');
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to save journey';
            toast.error('Failed to save journey', {
              description: errorMessage,
              action: {
                label: 'Retry',
                onClick: () => get().saveJourney()
              }
            });
            set({ isSaving: false, lastError: errorMessage });
          }
        },

        loadJourney: async (journeyId: string) => {
          set({ isLoading: true, lastError: null });
          
          try {
            const result = await apiClient.loadJourney(journeyId);
            
            if (result.success && result.journey) {
              const journey = result.journey;
              set({
                id: journey.id,
                name: journey.name,
                description: journey.description,
                nodes: journey.nodes || [],
                edges: journey.edges || [],
                goals: journey.goals || [],
                milestones: journey.milestones || [],
                reports: journey.reports || [],
                isLoading: false
              });
              
              toast.success('Journey loaded successfully!', {
                description: `Loaded "${journey.name}" with all components.`
              });
            } else {
              throw new Error(result.message || 'Failed to load journey');
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load journey';
            toast.error('Failed to load journey', {
              description: errorMessage
            });
            set({ isLoading: false, lastError: errorMessage });
          }
        },

        createNewJourney: async (name?: string) => {
          set({ isLoading: true, lastError: null });
          
          try {
            const result = await apiClient.createJourney(
              name || `Journey ${Date.now()}`,
              'New journey created'
            );
            
            if (result.success && result.journey) {
              const journey = result.journey;
              set({
                id: journey.id,
                name: journey.name,
                description: journey.description,
                nodes: [],
                edges: [],
                goals: [],
                milestones: [],
                reports: [],
                isLoading: false
              });
              
              toast.success('New journey created!', {
                description: `Created "${journey.name}" successfully.`
              });
            } else {
              throw new Error(result.message || 'Failed to create journey');
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create journey';
            toast.error('Failed to create journey', {
              description: errorMessage
            });
            set({ isLoading: false, lastError: errorMessage });
          }
        },

        deleteJourney: async () => {
          const state = get();
          
          try {
            const result = await apiClient.deleteJourney(state.id);
            
            if (result.success) {
              toast.success('Journey deleted successfully!', {
                description: 'The journey has been moved to trash.'
              });
              
              // Clear the current journey
              set({
                id: '',
                name: 'Untitled Journey',
                description: 'No description',
                nodes: [],
                edges: [],
                goals: [],
                milestones: [],
                reports: []
              });
            } else {
              throw new Error(result.message || 'Failed to delete journey');
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete journey';
            toast.error('Failed to delete journey', {
              description: errorMessage
            });
            set({ lastError: errorMessage });
          }
        },

        duplicateJourney: async (newName?: string) => {
          const state = get();
          set({ isLoading: true, lastError: null });
          
          try {
            const result = await apiClient.duplicateJourney(state.id, newName);
            
            if (result.success && result.journey) {
              const journey = result.journey;
              set({
                id: journey.id,
                name: journey.name,
                description: journey.description,
                nodes: journey.nodes || [],
                edges: journey.edges || [],
                goals: journey.goals || [],
                milestones: journey.milestones || [],
                reports: [],
                isLoading: false
              });
              
              toast.success('Journey duplicated successfully!', {
                description: `Created copy "${journey.name}" with all components.`
              });
            } else {
              throw new Error(result.message || 'Failed to duplicate journey');
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to duplicate journey';
            toast.error('Failed to duplicate journey', {
              description: errorMessage
            });
            set({ isLoading: false, lastError: errorMessage });
          }
        }
      };
    },
    { name: 'journey-store' }
  )
);

export default useJourneyStore;

// Usage examples:

// 1. Auto-save on changes (debounced)
import { useCallback, useEffect } from 'react';

export const useAutoSave = (delay = 2000) => {
  const { saveJourney, isSaving } = useJourneyStore();
  
  const debouncedSave = useCallback(
    debounce(() => {
      if (!isSaving) {
        saveJourney();
      }
    }, delay),
    [saveJourney, isSaving]
  );

  // Auto-save when state changes
  useEffect(() => {
    debouncedSave();
  }, [useJourneyStore.getState().nodes, useJourneyStore.getState().edges]);
};

// 2. Load journey on mount
export const useJourneyLoader = (journeyId: string) => {
  const { loadJourney, isLoading } = useJourneyStore();
  
  useEffect(() => {
    if (journeyId) {
      loadJourney(journeyId);
    }
  }, [journeyId, loadJourney]);
  
  return { isLoading };
};

// 3. Error handling component
export const JourneyErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const { lastError } = useJourneyStore();
  
  if (lastError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <h3 className="text-red-800 font-medium">Journey Error</h3>
        <p className="text-red-600 mt-1">{lastError}</p>
        <button 
          onClick={() => useJourneyStore.setState({ lastError: null })}
          className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm"
        >
          Dismiss
        </button>
      </div>
    );
  }
  
  return <>{children}</>;
};

// Utility function for debouncing
function debounce<T extends (...args: any[]) => any>(func: T, delay: number): T {
  let timeoutId: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
}



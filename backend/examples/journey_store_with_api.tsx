// Enhanced Journey Store with API Integration
// This extends your existing journey store with API methods and hooks

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'sonner'; // or your preferred toast library

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// API Client Class
class JourneyAPIClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async createJourney(name: string, description: string = '', userId?: string) {
    return this.request('/api/journeys/', {
      method: 'POST',
      body: JSON.stringify({ name, description, user_id: userId }),
    });
  }

  async saveJourney(journeyId: string, journeyState: any) {
    return this.request(`/api/journeys/${journeyId}/save`, {
      method: 'POST',
      body: JSON.stringify({ journey: journeyState }),
    });
  }

  async loadJourney(journeyId: string) {
    return this.request(`/api/journeys/${journeyId}`);
  }

  async listJourneys(userId?: string, limit = 50, offset = 0) {
    const params = new URLSearchParams({ limit: limit.toString(), offset: offset.toString() });
    if (userId) params.append('user_id', userId);
    return this.request(`/api/journeys/?${params}`);
  }

  async updateJourney(journeyId: string, updates: any) {
    return this.request(`/api/journeys/${journeyId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteJourney(journeyId: string, hardDelete = false) {
    return this.request(`/api/journeys/${journeyId}?hard_delete=${hardDelete}`, {
      method: 'DELETE',
    });
  }

  async getJourneyStats(journeyId: string) {
    return this.request(`/api/journeys/${journeyId}/stats`);
  }

  async duplicateJourney(journeyId: string, newName?: string) {
    const params = newName ? `?new_name=${encodeURIComponent(newName)}` : '';
    return this.request(`/api/journeys/${journeyId}/duplicate${params}`, {
      method: 'POST',
    });
  }
}

// Enhanced Journey Store with API Methods
interface JourneyState {
  // Existing state (keep your current structure)
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  isPublished: boolean;
  isDeleted: boolean;
  isArchived: boolean;
  isLocked: boolean;
  isReadOnly: boolean;
  isEditable: boolean;
  isViewOnly: boolean;
  nodes: any[];
  edges: any[];
  goals: any[];
  milestones: any[];
  reports: any[];

  // Existing methods (keep your current methods)
  addNode: (node: any) => void;
  updateNode: (id: string, updates: Partial<any>) => void;
  removeNode: (id: string) => void;
  getNode: (id: string) => any | undefined;
  addEdge: (edge: any) => void;
  updateEdge: (id: string, updates: Partial<any>) => void;
  removeEdge: (id: string) => void;
  getEdge: (id: string) => any | undefined;
  addGoal: (goal: any) => void;
  updateGoal: (id: string, updates: Partial<any>) => void;
  removeGoal: (id: string) => void;
  getGoal: (id: string) => any | undefined;
  completeGoal: (id: string) => void;
  addMilestone: (milestone: any) => void;
  updateMilestone: (id: string, updates: Partial<any>) => void;
  removeMilestone: (id: string) => void;
  getMilestone: (id: string) => any | undefined;
  updateMilestoneProgress: (id: string, progress: number) => void;
  generateReport: (type: string, name: string) => any;
  getReport: (id: string) => any | undefined;
  removeReport: (id: string) => void;
  updateJourney: (updates: any) => void;
  clearJourney: () => void;
  loadJourney: (journey: any) => void;
  createNewJourney: (name?: string) => void;
  getConnectedEdges: (nodeId: string) => any[];
  getNodeConnections: (nodeId: string) => { incoming: any[]; outgoing: any[] };
  getJourneyStats: () => any;

  // NEW API Methods
  saveToAPI: () => Promise<void>;
  loadFromAPI: (journeyId: string) => Promise<void>;
  createInAPI: (name?: string, description?: string) => Promise<void>;
  deleteFromAPI: () => Promise<void>;
  duplicateInAPI: (newName?: string) => Promise<void>;
  listFromAPI: (userId?: string) => Promise<any[]>;
  updateInAPI: (updates: any) => Promise<void>;

  // Loading and Error States
  isSaving: boolean;
  isLoading: boolean;
  lastError: string | null;
  apiClient: JourneyAPIClient;
}

const useJourneyStore = create<JourneyState>()(
  devtools(
    persist(
      (set, get) => {
        const apiClient = new JourneyAPIClient();

        return {
          // Initial state (your existing state)
          id: '1234567890',
          name: 'Untitled Journey',
          description: 'No description',
          createdAt: new Date(),
          updatedAt: new Date(),
          isPublished: false,
          isDeleted: false,
          isArchived: false,
          isLocked: false,
          isReadOnly: false,
          isEditable: true,
          isViewOnly: false,
          nodes: [],
          edges: [],
          goals: [],
          milestones: [],
          reports: [],

          // Loading and Error States
          isSaving: false,
          isLoading: false,
          lastError: null,
          apiClient,

          // Your existing methods (keep all your current methods)
          addNode: (node: any) => {
            console.log('🎨 Adding node:', node);
            set((state) => ({ 
              nodes: [...state.nodes, node],
              updatedAt: new Date()
            }));
          },
          
          updateNode: (id: string, updates: Partial<any>) => {
            console.log('🎨 Updating node:', id, updates);
            set((state) => ({
              nodes: state.nodes.map((node) => 
                node.id === id ? { ...node, ...updates } : node
              ),
              updatedAt: new Date()
            }));
          },
          
          removeNode: (id: string) => {
            console.log('🎨 Removing node:', id);
            set((state) => ({ 
              nodes: state.nodes.filter((node) => node.id !== id),
              edges: state.edges.filter((edge) => edge.source !== id && edge.target !== id),
              updatedAt: new Date()
            }));
          },
          
          getNode: (id: string) => {
            const node = get().nodes.find((node) => node.id === id);
            console.log('🎨 Getting node:', id, node);
            return node;
          },

          addEdge: (edge: any) => {
            console.log('🔗 Adding edge:', edge);
            set((state) => ({ 
              edges: [...state.edges, edge],
              updatedAt: new Date()
            }));
          },
          
          updateEdge: (id: string, updates: Partial<any>) => {
            console.log('🔗 Updating edge:', id, updates);
            set((state) => ({
              edges: state.edges.map((edge) => 
                edge.id === id ? { ...edge, ...updates } : edge
              ),
              updatedAt: new Date()
            }));
          },
          
          removeEdge: (id: string) => {
            console.log('🔗 Removing edge:', id);
            set((state) => ({ 
              edges: state.edges.filter((edge) => edge.id !== id),
              updatedAt: new Date()
            }));
          },
          
          getEdge: (id: string) => {
            const edge = get().edges.find((edge) => edge.id === id);
            console.log('🔗 Getting edge:', id, edge);
            return edge;
          },

          // Goals operations
          addGoal: (goalData: any) => {
            const newGoal = {
              ...goalData,
              id: Date.now().toString(),
              createdAt: new Date(),
              updatedAt: new Date()
            };
            console.log('🎯 Adding goal:', newGoal);
            set((state) => ({
              goals: [...state.goals, newGoal],
              updatedAt: new Date()
            }));
          },
          
          updateGoal: (id: string, updates: Partial<any>) => {
            console.log('🎯 Updating goal:', id, updates);
            set((state) => ({
              goals: state.goals.map((goal) => 
                goal.id === id ? { ...goal, ...updates, updatedAt: new Date() } : goal
              ),
              updatedAt: new Date()
            }));
          },
          
          removeGoal: (id: string) => {
            console.log('🎯 Removing goal:', id);
            set((state) => ({
              goals: state.goals.filter((goal) => goal.id !== id),
              updatedAt: new Date()
            }));
          },
          
          getGoal: (id: string) => {
            const goal = get().goals.find((goal) => goal.id === id);
            console.log('🎯 Getting goal:', id, goal);
            return goal;
          },
          
          completeGoal: (id: string) => {
            console.log('🎯 Completing goal:', id);
            set((state) => ({
              goals: state.goals.map((goal) => 
                goal.id === id ? { 
                  ...goal, 
                  status: 'completed',
                  currentValue: goal.targetValue,
                  updatedAt: new Date() 
                } : goal
              ),
              updatedAt: new Date()
            }));
          },

          // Milestones operations
          addMilestone: (milestoneData: any) => {
            const newMilestone = {
              ...milestoneData,
              id: Date.now().toString(),
              createdAt: new Date(),
              updatedAt: new Date()
            };
            console.log('🏁 Adding milestone:', newMilestone);
            set((state) => ({
              milestones: [...state.milestones, newMilestone],
              updatedAt: new Date()
            }));
          },
          
          updateMilestone: (id: string, updates: Partial<any>) => {
            console.log('🏁 Updating milestone:', id, updates);
            set((state) => ({
              milestones: state.milestones.map((milestone) => 
                milestone.id === id ? { ...milestone, ...updates, updatedAt: new Date() } : milestone
              ),
              updatedAt: new Date()
            }));
          },
          
          removeMilestone: (id: string) => {
            console.log('🏁 Removing milestone:', id);
            set((state) => ({
              milestones: state.milestones.filter((milestone) => milestone.id !== id),
              updatedAt: new Date()
            }));
          },
          
          getMilestone: (id: string) => {
            const milestone = get().milestones.find((milestone) => milestone.id === id);
            console.log('🏁 Getting milestone:', id, milestone);
            return milestone;
          },
          
          updateMilestoneProgress: (id: string, progress: number) => {
            console.log('🏁 Updating milestone progress:', id, progress);
            set((state) => ({
              milestones: state.milestones.map((milestone) => 
                milestone.id === id ? { 
                  ...milestone, 
                  progress: Math.max(0, Math.min(100, progress)),
                  status: progress === 100 ? 'completed' : 
                         progress > 0 ? 'in-progress' : 'pending',
                  updatedAt: new Date() 
                } : milestone
              ),
              updatedAt: new Date()
            }));
          },

          // Reports operations
          generateReport: (type: string, name: string) => {
            console.log('📊 Generating report:', type, name);
            const state = get();
            const reportData = {
              goals: state.goals,
              milestones: state.milestones,
              nodes: state.nodes,
              edges: state.edges,
              stats: {
                totalGoals: state.goals.length,
                completedGoals: state.goals.filter(g => g.status === 'completed').length,
                totalMilestones: state.milestones.length,
                completedMilestones: state.milestones.filter(m => m.status === 'completed').length,
                totalNodes: state.nodes.length,
                totalEdges: state.edges.length
              }
            };
            
            const newReport = {
              id: Date.now().toString(),
              name,
              type,
              generatedAt: new Date(),
              data: reportData
            };
            
            set((state) => ({
              reports: [...state.reports, newReport],
              updatedAt: new Date()
            }));
            
            console.log('📊 Report generated:', newReport);
            return newReport;
          },
          
          getReport: (id: string) => {
            const report = get().reports.find((report) => report.id === id);
            console.log('📊 Getting report:', id, report);
            return report;
          },
          
          removeReport: (id: string) => {
            console.log('📊 Removing report:', id);
            set((state) => ({
              reports: state.reports.filter((report) => report.id !== id),
              updatedAt: new Date()
            }));
          },

          // Journey operations
          updateJourney: (updates: any) => {
            console.log('🚀 Updating journey:', updates);
            set((state) => ({
              ...state,
              ...updates,
              updatedAt: new Date()
            }));
          },
          
          clearJourney: () => {
            console.log('🚀 Clearing journey - all data will be lost');
            set((state) => ({
              ...state,
              nodes: [],
              edges: [],
              goals: [],
              milestones: [],
              reports: [],
              updatedAt: new Date()
            }));
          },
          
          loadJourney: (journey: any) => {
            console.log('🚀 Loading journey:', journey);
            set((state) => ({
              ...state,
              ...journey,
              updatedAt: new Date()
            }));
          },
          
          createNewJourney: (name?: string) => {
            const newName = name || `Journey ${Date.now()}`;
            const newId = Date.now().toString();
            console.log('🆕 Creating new journey:', { newName, newId });
            
            set((state) => ({
              ...state,
              id: newId,
              name: newName,
              description: "New journey created",
              nodes: [],
              edges: [],
              goals: [],
              milestones: [],
              reports: [],
              createdAt: new Date(),
              updatedAt: new Date()
            }));
          },

          // Utility operations
          getConnectedEdges: (nodeId: string) => {
            const state = get();
            const edges = state.edges.filter(
              (edge) => edge.source === nodeId || edge.target === nodeId
            );
            console.log('🔗 Getting connected edges for node:', nodeId, edges);
            return edges;
          },
          
          getNodeConnections: (nodeId: string) => {
            const state = get();
            const connections = {
              incoming: state.edges.filter((edge) => edge.target === nodeId),
              outgoing: state.edges.filter((edge) => edge.source === nodeId)
            };
            console.log('🔗 Getting node connections:', nodeId, connections);
            return connections;
          },
          
          getJourneyStats: () => {
            const state = get();
            const stats = {
              totalGoals: state.goals.length,
              completedGoals: state.goals.filter(g => g.status === 'completed').length,
              totalMilestones: state.milestones.length,
              completedMilestones: state.milestones.filter(m => m.status === 'completed').length,
              totalNodes: state.nodes.length,
              totalEdges: state.edges.length
            };
            console.log('📈 Journey stats:', stats);
            return stats;
          },

          // NEW API METHODS
          saveToAPI: async () => {
            const state = get();
            set({ isSaving: true, lastError: null });
            
            try {
              const result = await apiClient.saveJourney(state.id, {
                id: state.id,
                name: state.name,
                description: state.description,
                createdAt: state.createdAt.toISOString(),
                updatedAt: state.updatedAt.toISOString(),
                isPublished: state.isPublished,
                isDeleted: state.isDeleted,
                isArchived: state.isArchived,
                isLocked: state.isLocked,
                isReadOnly: state.isReadOnly,
                isEditable: state.isEditable,
                isViewOnly: state.isViewOnly,
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
                  onClick: () => get().saveToAPI()
                }
              });
              set({ isSaving: false, lastError: errorMessage });
            }
          },

          loadFromAPI: async (journeyId: string) => {
            set({ isLoading: true, lastError: null });
            
            try {
              const result = await apiClient.loadJourney(journeyId);
              
              if (result.success && result.journey) {
                const journey = result.journey;
                set({
                  id: journey.id,
                  name: journey.name,
                  description: journey.description,
                  createdAt: new Date(journey.createdAt),
                  updatedAt: new Date(journey.updatedAt),
                  isPublished: journey.isPublished,
                  isDeleted: journey.isDeleted,
                  isArchived: journey.isArchived,
                  isLocked: journey.isLocked,
                  isReadOnly: journey.isReadOnly,
                  isEditable: journey.isEditable,
                  isViewOnly: journey.isViewOnly,
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

          createInAPI: async (name?: string, description?: string) => {
            set({ isLoading: true, lastError: null });
            
            try {
              const result = await apiClient.createJourney(
                name || `Journey ${Date.now()}`,
                description || 'New journey created'
              );
              
              if (result.success && result.journey) {
                const journey = result.journey;
                set({
                  id: journey.id,
                  name: journey.name,
                  description: journey.description,
                  createdAt: new Date(journey.createdAt),
                  updatedAt: new Date(journey.updatedAt),
                  isPublished: journey.isPublished,
                  isDeleted: journey.isDeleted,
                  isArchived: journey.isArchived,
                  isLocked: journey.isLocked,
                  isReadOnly: journey.isReadOnly,
                  isEditable: journey.isEditable,
                  isViewOnly: journey.isViewOnly,
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

          deleteFromAPI: async () => {
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

          duplicateInAPI: async (newName?: string) => {
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
                  createdAt: new Date(journey.createdAt),
                  updatedAt: new Date(journey.updatedAt),
                  isPublished: journey.isPublished,
                  isDeleted: journey.isDeleted,
                  isArchived: journey.isArchived,
                  isLocked: journey.isLocked,
                  isReadOnly: journey.isReadOnly,
                  isEditable: journey.isEditable,
                  isViewOnly: journey.isViewOnly,
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
          },

          listFromAPI: async (userId?: string) => {
            try {
              const result = await apiClient.listJourneys(userId);
              
              if (result.success) {
                return result.journeys || [];
              } else {
                throw new Error(result.message || 'Failed to list journeys');
              }
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Failed to list journeys';
              toast.error('Failed to list journeys', {
                description: errorMessage
              });
              set({ lastError: errorMessage });
              return [];
            }
          },

          updateInAPI: async (updates: any) => {
            const state = get();
            
            try {
              const result = await apiClient.updateJourney(state.id, updates);
              
              if (result.success) {
                // Update local state
                set((state) => ({
                  ...state,
                  ...updates,
                  updatedAt: new Date()
                }));
                
                toast.success('Journey updated successfully!', {
                  description: 'Journey metadata has been updated.'
                });
              } else {
                throw new Error(result.message || 'Failed to update journey');
              }
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Failed to update journey';
              toast.error('Failed to update journey', {
                description: errorMessage
              });
              set({ lastError: errorMessage });
            }
          }
        };
      },
      { 
        name: 'journey-state',
        storage: createJSONStorage(() => localStorage)
      }
    )
  )
);

export default useJourneyStore;

// Custom Hooks for Common Operations
export const useAutoSave = (delay = 2000) => {
  const { saveToAPI, isSaving, nodes, edges, goals, milestones } = useJourneyStore();
  
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!isSaving) {
        saveToAPI();
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [nodes, edges, goals, milestones, saveToAPI, isSaving, delay]);
};

export const useJourneyLoader = (journeyId: string) => {
  const { loadFromAPI, isLoading } = useJourneyStore();
  
  React.useEffect(() => {
    if (journeyId) {
      loadFromAPI(journeyId);
    }
  }, [journeyId, loadFromAPI]);
  
  return { isLoading };
};

export const useJourneyList = (userId?: string) => {
  const [journeys, setJourneys] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const { listFromAPI } = useJourneyStore();
  
  const loadJourneys = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await listFromAPI(userId);
      setJourneys(result);
    } finally {
      setIsLoading(false);
    }
  }, [listFromAPI, userId]);
  
  React.useEffect(() => {
    loadJourneys();
  }, [loadJourneys]);
  
  return { journeys, isLoading, reload: loadJourneys };
};



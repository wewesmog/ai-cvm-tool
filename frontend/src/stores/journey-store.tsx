// Zustand store for the complete journey
// This store manages the entire journey including canvas, goals, milestones, and reporting
// It persists the complete journey state to localStorage and API
// When user exits, the entire journey state is cleared

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'sonner'; // Add your preferred toast library

// Canvas interfaces
interface Node {
    id: string;
    type: string;
    'node-subtype': string; // Never changes - used for component lookup
    position: { x: number; y: number };
    data: any;
    selected?: boolean;
}

interface Edge {
    id: string;
    source: string;
    target: string;
    data: any;
    selected?: boolean;
    type?: string;
    animated?: boolean;
    style?: any;
}

// Goals interfaces
interface Goal {
    id: string;
    title: string;
    description: string;
    targetValue: number;
    currentValue: number;
    unit: string;
    deadline: Date;
    status: { value: 'not-started' | 'in-progress' | 'completed' | 'cancelled' | 'deleted' | 'archived' };
    priority: { value: 'low' | 'medium' | 'high' };
    category: string;
    createdAt: Date;
    updatedAt: Date;
}

// Milestones interfaces
interface Milestone {
    id: string;
    title: string;
    description: string;
    targetDate: Date;
    status: { value: 'pending' | 'in-progress' | 'completed' | 'overdue' | 'cancelled' | 'deleted' | 'archived' | 'active' };
    progress: number; // 0-100
    dependencies: string[]; // Array of milestone IDs
    sortOrder: number; // For ordering milestones
    createdAt: Date;
    updatedAt: Date;
}

// Reports interfaces
interface Report {
    id: string;
    name: string;
    type: 'progress' | 'performance' | 'summary';
    generatedAt: Date;
    data: any;
}

// Main Journey State
interface JourneyState {
    // Journey metadata
    id: string;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    
    // Journey state flags
    isPublished: boolean;
    isDeleted: boolean;
    isArchived: boolean;
    isLocked: boolean;
    isReadOnly: boolean;
    isEditable: boolean;
    isViewOnly: boolean;
    
    // Canvas content
    nodes: Node[];
    edges: Edge[];
    
    // Goals content
    goals: Goal[];
    goalLogicOperator: 'AND' | 'OR';
    
    // Milestones content
    milestones: Milestone[];
    
    // Reports content
    reports: Report[];
    
    // Change tracking
    lastSavedAt: Date | null;
    lastSavedHash: string | null;
    changedNodes: Set<string>;
    changedEdges: Set<string>;
    changedGoals: Set<string>;
    changedMilestones: Set<string>;
    changedReports: Set<string>;
    isJourneyMetadataChanged: boolean;
    unsavedChanges: boolean;
    
    // Canvas operations
    addNode: (node: Node) => void;
    updateNode: (id: string, updates: Partial<Node>) => void;
    updateNodePosition: (id: string, position: { x: number; y: number }) => void;
    removeNode: (id: string) => void;
    getNode: (id: string) => Node | undefined;
    
    addEdge: (edge: Edge) => void;
    updateEdge: (id: string, updates: Partial<Edge>) => void;
    removeEdge: (id: string) => void;
    getEdge: (id: string) => Edge | undefined;
    
    // Goals operations
    addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateGoal: (id: string, updates: Partial<Goal>) => void;
    removeGoal: (id: string) => void;
    getGoal: (id: string) => Goal | undefined;
    completeGoal: (id: string) => void;
    updateGoalLogicOperator: (operator: 'AND' | 'OR') => void;
    
    // Milestones operations
    addMilestone: (milestone: Omit<Milestone, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateMilestone: (id: string, updates: Partial<Milestone>) => void;
    removeMilestone: (id: string) => void;
    getMilestone: (id: string) => Milestone | undefined;
    updateMilestoneProgress: (id: string, progress: number) => void;
    reorderMilestones: (milestoneIds: string[]) => void;
    
    // Reports operations
    generateReport: (type: Report['type'], name: string) => Report;
    getReport: (id: string) => Report | undefined;
    removeReport: (id: string) => void;
    
    // Journey operations
    updateJourney: (updates: Partial<Pick<JourneyState, 'name' | 'description' | 'isPublished' | 'isArchived' | 'isLocked' | 'isReadOnly' | 'isEditable' | 'isViewOnly'>>) => void;
    clearJourney: () => void;
    loadJourney: (journey: Partial<JourneyState>) => void;
    createNewJourney: (name?: string) => void;
    
    // Utility operations
    getConnectedEdges: (nodeId: string) => Edge[];
    getNodeConnections: (nodeId: string) => { incoming: Edge[]; outgoing: Edge[] };
    getJourneyStats: () => {
        totalGoals: number;
        completedGoals: number;
        totalMilestones: number;
        completedMilestones: number;
        totalNodes: number;
        totalEdges: number;
    };

    // API operations
    saveToAPI: () => Promise<void>;
    saveCanvasToAPI: () => Promise<void>;
    loadFromAPI: (journeyId: string) => Promise<void>;
    loadCanvasFromAPI: (journeyId: string) => Promise<void>;
    loadGoalsFromAPI: (journeyId: string) => Promise<void>;
    loadMilestonesFromAPI: (journeyId: string) => Promise<void>;
    saveGoalsToAPI: () => Promise<void>;
    saveMilestonesToAPI: () => Promise<void>;
    createInAPI: (name?: string, description?: string) => Promise<void>;
    deleteFromAPI: () => Promise<void>;
    duplicateInAPI: (newName?: string) => Promise<void>;
    listFromAPI: (userId?: string) => Promise<any[]>;
    updateInAPI: (updates: any) => Promise<void>;
    
    // Change tracking operations
    markNodeChanged: (nodeId: string) => void;
    markEdgeChanged: (edgeId: string) => void;
    markGoalChanged: (goalId: string) => void;
    markMilestoneChanged: (milestoneId: string) => void;
    markReportChanged: (reportId: string) => void;
    markJourneyMetadataChanged: () => void;
    clearChangeTracking: () => void;
    getChangedItems: () => {
        nodes: Node[];
        edges: Edge[];
        goals: Goal[];
        milestones: Milestone[];
        reports: Report[];
        hasMetadataChanges: boolean;
    };
    
    // Loading and Error States
    isSaving: boolean;
    isLoading: boolean;
    lastError: string | null;
    clearError: () => void;
}

const useJourneyStore = create<JourneyState>()(
    devtools(
        persist(
            (set, get) => {
                // Global state logger - logs entire state on any change (disabled to prevent infinite loops)
                const logStateChange = (action: string, data?: any) => {
                    // Disabled to prevent infinite re-renders
                    // console.log(`🔄 ${action} - Full Journey State:`, { action, data });
                };

                // API Configuration
                const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

                return {
                    // Initial state
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
                
                // Canvas content
                nodes: [],
                edges: [],
                
                // Goals content
                goals: [],
                goalLogicOperator: 'AND',
                
                // Milestones content
                milestones: [],
                
                // Reports content
                reports: [],

                // Change tracking
                lastSavedAt: null,
                lastSavedHash: null,
                changedNodes: new Set<string>(),
                changedEdges: new Set<string>(),
                changedGoals: new Set<string>(),
                changedMilestones: new Set<string>(),
                changedReports: new Set<string>(),
                isJourneyMetadataChanged: false,
                unsavedChanges: false,

                // Loading and Error States
                isSaving: false,
                isLoading: false,
                lastError: null,

                // Canvas operations
                addNode: (node: Node) => {
                    set((state) => ({ 
                        nodes: [...state.nodes, node],
                        changedNodes: new Set([...state.changedNodes, node.id]),
                        updatedAt: new Date()
                    }));
                },
                
                updateNode: (id: string, updates: Partial<Node>) => {
                    set((state) => ({
                        nodes: state.nodes.map((node) => 
                            node.id === id ? { ...node, ...updates } : node
                        ),
                        changedNodes: new Set([...state.changedNodes, id]),
                        updatedAt: new Date()
                    }));
                },
                
                updateNodePosition: (id: string, position: { x: number; y: number }) => {
                    // Position updates don't trigger change tracking or saving
                    set((state) => ({
                        nodes: state.nodes.map((node) => 
                            node.id === id ? { ...node, position } : node
                        )
                    }));
                },
                
                removeNode: (id: string) => {
                    set((state) => ({ 
                        nodes: state.nodes.filter((node) => node.id !== id),
                        edges: state.edges.filter((edge) => edge.source !== id && edge.target !== id),
                        changedNodes: new Set([...state.changedNodes, id]), // Mark as changed for deletion
                        updatedAt: new Date()
                    }));
                },
                
                getNode: (id: string) => {
                    const node = get().nodes.find((node) => node.id === id);
                    return node;
                },

                addEdge: (edge: Edge) => {
                    set((state) => ({ 
                        edges: [...state.edges, edge],
                        changedEdges: new Set([...state.changedEdges, edge.id]),
                        updatedAt: new Date()
                    }));
                },
                
                updateEdge: (id: string, updates: Partial<Edge>) => {
                    set((state) => ({
                        edges: state.edges.map((edge) => 
                            edge.id === id ? { ...edge, ...updates } : edge
                        ),
                        changedEdges: new Set([...state.changedEdges, id]),
                        updatedAt: new Date()
                    }));
                },
                
                removeEdge: (id: string) => {
                    set((state) => ({ 
                        edges: state.edges.filter((edge) => edge.id !== id),
                        changedEdges: new Set([...state.changedEdges, id]),
                        updatedAt: new Date()
                    }));
                },
                
                getEdge: (id: string) => {
                    const edge = get().edges.find((edge) => edge.id === id);
                    return edge;
                },

                // Goals operations
                addGoal: (goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => {
                    // Normalize status and priority formats to ensure consistency
                    const normalizedStatus = typeof goalData.status === 'string' 
                        ? { value: goalData.status }
                        : goalData.status;
                    
                    const normalizedPriority = typeof goalData.priority === 'string' 
                        ? { value: goalData.priority }
                        : goalData.priority;
                    
                    const newGoal: Goal = {
                        ...goalData,
                        status: normalizedStatus,
                        priority: normalizedPriority,
                        id: Date.now().toString(),
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };
                    set((state) => ({
                        goals: [...state.goals, newGoal],
                        changedGoals: new Set([...state.changedGoals, newGoal.id]),
                        updatedAt: new Date(),
                        unsavedChanges: true
                    }));
                },
                
                updateGoal: (id: string, updates: Partial<Goal>) => {
                    console.log('🎯 Store updateGoal called with:', id, updates);
                    set((state) => {
                        const updatedGoals = state.goals.map((goal) => 
                            goal.id === id ? { ...goal, ...updates, updatedAt: new Date() } : goal
                        );
                        console.log('🎯 Updated goals:', updatedGoals.find(g => g.id === id));
                        return {
                            goals: updatedGoals,
                            updatedAt: new Date()
                        };
                    });
                    logStateChange('UPDATE_GOAL', { id, updates });
                },
                
                removeGoal: (id: string) => {
                    console.log('🎯 Removing goal:', id);
                    set((state) => ({
                        goals: state.goals.filter((goal) => goal.id !== id),
                        updatedAt: new Date()
                    }));
                    logStateChange('REMOVE_GOAL', { id });
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
                                status: { value: 'completed' },
                                currentValue: goal.targetValue,
                                updatedAt: new Date() 
                            } : goal
                        ),
                        updatedAt: new Date()
                    }));
                    logStateChange('COMPLETE_GOAL', { id });
                },
                
                updateGoalLogicOperator: (operator: 'AND' | 'OR') => {
                    console.log('🎯 Updating goal logic operator:', operator);
                    set((state) => ({
                        goalLogicOperator: operator,
                        updatedAt: new Date(),
                        unsavedChanges: true
                    }));
                    logStateChange('UPDATE_GOAL_LOGIC_OPERATOR', { operator });
                },

                // Milestones operations
                addMilestone: (milestoneData: Omit<Milestone, 'id' | 'createdAt' | 'updatedAt'>) => {
                    // Normalize status format to ensure consistency
                    const normalizedStatus = typeof milestoneData.status === 'string' 
                        ? { value: milestoneData.status }
                        : milestoneData.status || { value: 'active' };
                    
                    const newMilestone: Milestone = {
                        ...milestoneData,
                        status: normalizedStatus,
                        id: Date.now().toString(),
                        sortOrder: get().milestones.length, // Add to end
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };
                    console.log('🏁 Adding milestone:', newMilestone);
                    set((state) => ({
                        milestones: [...state.milestones, newMilestone],
                        updatedAt: new Date(),
                        unsavedChanges: true
                    }));
                    logStateChange('ADD_MILESTONE', newMilestone);
                },
                
                updateMilestone: (id: string, updates: Partial<Milestone>) => {
                    console.log('🏁 Store updateMilestone called with:', id, updates);
                    set((state) => {
                        const updatedMilestones = state.milestones.map((milestone) => 
                            milestone.id === id ? { ...milestone, ...updates, updatedAt: new Date() } : milestone
                        );
                        console.log('🏁 Updated milestones:', updatedMilestones.find(m => m.id === id));
                        return {
                            milestones: updatedMilestones,
                            updatedAt: new Date()
                        };
                    });
                    logStateChange('UPDATE_MILESTONE', { id, updates });
                },
                
                removeMilestone: (id: string) => {
                    console.log('🏁 Removing milestone:', id);
                    set((state) => ({
                        milestones: state.milestones.filter((milestone) => milestone.id !== id),
                        updatedAt: new Date()
                    }));
                    logStateChange('REMOVE_MILESTONE', { id });
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
                                status: { value: progress === 100 ? 'completed' : 
                                       progress > 0 ? 'in-progress' : 'pending' },
                                updatedAt: new Date() 
                            } : milestone
                        ),
                        updatedAt: new Date()
                    }));
                    logStateChange('UPDATE_MILESTONE_PROGRESS', { id, progress });
                },
                
                reorderMilestones: (milestoneIds: string[]) => {
                    console.log('🏁 Reordering milestones:', milestoneIds);
                    set((state) => {
                        // Create a map of new positions
                        const newOrder = new Map(milestoneIds.map((id, index) => [id, index]));
                        
                        // Reorder milestones and update sortOrder
                        const reorderedMilestones = state.milestones
                            .sort((a, b) => {
                                const aIndex = newOrder.get(a.id) ?? a.sortOrder;
                                const bIndex = newOrder.get(b.id) ?? b.sortOrder;
                                return aIndex - bIndex;
                            })
                            .map((milestone, index) => ({
                                ...milestone,
                                sortOrder: index,
                                updatedAt: new Date()
                            }));
                        
                        // Mark all reordered milestones as changed
                        const changedMilestones = new Set(milestoneIds);
                        
                        return {
                            milestones: reorderedMilestones,
                            changedMilestones: new Set([...state.changedMilestones, ...changedMilestones]),
                            updatedAt: new Date()
                        };
                    });
                    logStateChange('REORDER_MILESTONES', { milestoneIds });
                },

                // Reports operations
                generateReport: (type: Report['type'], name: string) => {
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
                    
                    const newReport: Report = {
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
                    logStateChange('GENERATE_REPORT', newReport);
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
                    logStateChange('REMOVE_REPORT', { id });
                },

                // Journey operations
                updateJourney: (updates) => {
                    console.log('🚀 Updating journey:', updates);
                    set((state) => ({
                        ...state,
                        ...updates,
                        updatedAt: new Date()
                    }));
                    logStateChange('UPDATE_JOURNEY', updates);
                },
                
                clearJourney: () => {
                    console.log('🚀 Clearing journey - all data will be lost');
                    set((state) => ({
                        ...state,
                        id: '',
                        name: 'Untitled Journey',
                        description: 'No description',
                        nodes: [],
                        edges: [],
                        goals: [],
                        milestones: [],
                        reports: [],
                        goalLogicOperator: 'AND',
                        changedNodes: new Set<string>(),
                        changedEdges: new Set<string>(),
                        changedGoals: new Set<string>(),
                        changedMilestones: new Set<string>(),
                        changedReports: new Set<string>(),
                        isJourneyMetadataChanged: false,
                        unsavedChanges: false,
                        lastSavedAt: null,
                        lastSavedHash: null,
                        updatedAt: new Date()
                    }));
                    logStateChange('CLEAR_JOURNEY', { message: 'All data cleared' });
                },
                
                loadJourney: (journey) => {
                    console.log('🚀 Loading journey:', journey);
                    set((state) => ({
                        ...state,
                        ...journey,
                        updatedAt: new Date()
                    }));
                    logStateChange('LOAD_JOURNEY', journey);
                },
                
                createNewJourney: (name?: string) => {
                    const newName = name || `Journey ${Date.now()}`;
                    const newId = Date.now().toString(); // Using timestamp as ID for now
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
                    
                    logStateChange('CREATE_NEW_JOURNEY', { newName, newId });
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

                // API Methods
                saveToAPI: async () => {
                    const state = get();
                    // Prevent concurrent saves
                    if (state.isSaving) {
                        return;
                    }
                    set({ isSaving: true, lastError: null });
                    
                    try {
                        // No-op check: if nothing changed, skip calling the API
                        const stateBeforeHash = JSON.stringify({
                            id: state.id,
                            name: state.name,
                            description: state.description,
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
                        const currentHash = await crypto.subtle.digest(
                            'SHA-256',
                            new TextEncoder().encode(stateBeforeHash)
                        ).then(buf => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join(''));

                        if (state.lastSavedHash && state.lastSavedHash === currentHash) {
                            console.log('No changes since last save (hash match)');
                            toast.info('Nothing new to save', {
                                description: 'No changes detected since last save'
                            });
                            set({ isSaving: false });
                            return;
                        }

                        const changedItems = get().getChangedItems();
                        if (!changedItems.hasMetadataChanges &&
                            changedItems.nodes.length === 0 &&
                            changedItems.edges.length === 0 &&
                            changedItems.goals.length === 0 &&
                            changedItems.milestones.length === 0 &&
                            changedItems.reports.length === 0) {
                            console.log('No changes to save');
                            toast.info('Nothing new to save', {
                                description: 'No changes detected since last save'
                            });
                            set({ isSaving: false });
                            return;
                        }

                        // Save all domains in parallel for efficiency
                        await Promise.all([
                            // Save canvas (nodes + edges)
                            fetch(`${API_BASE_URL}/api/journeys/${state.id}/canvas`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ 
                                    nodes: state.nodes, 
                                    edges: state.edges 
                                })
                            }).then(async (response) => {
                                if (!response.ok) throw new Error(`Canvas save failed: ${response.statusText}`);
                                const result = await response.json();
                                if (!result.success) throw new Error(result.message || 'Canvas save failed');
                            }),
                            
                            // Save goals
                            fetch(`${API_BASE_URL}/api/journeys/${state.id}/goals`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ goals: state.goals })
                            }).then(async (response) => {
                                if (!response.ok) throw new Error(`Goals save failed: ${response.statusText}`);
                                const result = await response.json();
                                if (!result.success) throw new Error(result.message || 'Goals save failed');
                            }),
                            
                            // Save milestones
                            fetch(`${API_BASE_URL}/api/journeys/${state.id}/milestones`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ milestones: state.milestones })
                            }).then(async (response) => {
                                if (!response.ok) throw new Error(`Milestones save failed: ${response.statusText}`);
                                const result = await response.json();
                                if (!result.success) throw new Error(result.message || 'Milestones save failed');
                            })
                        ]);
                        
                        // Create snapshot after successful saves
                        try {
                            // Transform nodes to ensure proper field names for backend
                            // Note: Position data is not saved as it's UI state that changes frequently
                            const transformedNodes = state.nodes.map(node => ({
                                id: node.id,
                                type: node.type,
                                'node-subtype': node['node-subtype'], // Keep the hyphenated field name
                                data: node.data || {},
                                selected: node.selected || false
                            }));

                            // Transform goals to ensure proper status/priority format for backend
                            const transformedGoals = state.goals.map(goal => ({
                                ...goal,
                                status: typeof goal.status === 'object' ? goal.status.value : goal.status,
                                priority: typeof goal.priority === 'object' ? goal.priority.value : goal.priority,
                                deadline: goal.deadline ? new Date(goal.deadline).toISOString() : null,
                                createdAt: new Date(goal.createdAt).toISOString(),
                                updatedAt: new Date(goal.updatedAt).toISOString()
                            }));

                            // Transform milestones to ensure proper status format for backend
                            const transformedMilestones = state.milestones.map(milestone => ({
                                ...milestone,
                                status: typeof milestone.status === 'object' ? milestone.status.value : milestone.status,
                                targetDate: milestone.targetDate ? new Date(milestone.targetDate).toISOString() : null,
                                createdAt: new Date(milestone.createdAt).toISOString(),
                                updatedAt: new Date(milestone.updatedAt).toISOString()
                            }));

                            // Transform reports to ensure proper date format for backend
                            const transformedReports = state.reports.map(report => ({
                                ...report,
                                generatedAt: new Date(report.generatedAt).toISOString()
                            }));

                            await fetch(`${API_BASE_URL}/api/journeys/${state.id}/save`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    journey: {
                                        id: state.id,
                                        name: state.name,
                                        description: state.description,
                                        createdAt: new Date(state.createdAt).toISOString(),
                                        updatedAt: new Date(state.updatedAt).toISOString(),
                                        isPublished: state.isPublished,
                                        isDeleted: state.isDeleted,
                                        isArchived: state.isArchived,
                                        isLocked: state.isLocked,
                                        isReadOnly: state.isReadOnly,
                                        isEditable: state.isEditable,
                                        isViewOnly: state.isViewOnly,
                                        nodes: transformedNodes,
                                        edges: state.edges,
                                        goals: transformedGoals,
                                        goalLogicOperator: state.goalLogicOperator,
                                        milestones: transformedMilestones,
                                        reports: transformedReports
                                    }
                                })
                            });
                        } catch (snapshotError) {
                            // Snapshot is best-effort, don't fail the whole save
                            console.warn('Snapshot creation failed:', snapshotError);
                        }
                        
                        // All saves successful
                        console.log('Journey saved successfully!');
                        toast.success('Journey saved successfully!', {
                            description: 'All changes have been saved to the server'
                        });
                        state.clearChangeTracking();
                        set({ 
                            isSaving: false, 
                            lastSavedHash: currentHash,
                            lastError: null, 
                            unsavedChanges: false, 
                            lastSavedAt: new Date() 
                        });
                    } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : 'Failed to save journey';
                        console.error('Failed to save journey:', errorMessage);
                        toast.error('Saving failed. Try again', {
                            description: errorMessage,
                            action: {
                                label: 'Retry',
                                onClick: () => state.saveToAPI()
                            }
                        });
                        set({ isSaving: false, lastError: errorMessage });
                    }
                },

                saveCanvasToAPI: async () => {
                    const state = get();
                    // Prevent concurrent saves
                    if (state.isSaving) {
                        return;
                    }
                    
                    // Check if canvas has actually changed using Set tracking
                    const hasNodeChanges = state.changedNodes.size > 0;
                    const hasEdgeChanges = state.changedEdges.size > 0;
                    
                    if (!hasNodeChanges && !hasEdgeChanges) {
                        console.log('No canvas changes to save');
                        toast.info('No changes to save', {
                            description: 'Canvas is already up to date'
                        });
                        return;
                    }
                    
                    set({ isSaving: true, lastError: null });
                    
                    try {
                        // Transform nodes to ensure proper field names for backend
                        // Note: Position data is not saved as it's UI state that changes frequently
                        const transformedNodes = state.nodes.map(node => ({
                            id: node.id,
                            type: node.type,
                            'node-subtype': node['node-subtype'], // Keep the hyphenated field name
                            data: node.data || {},
                            selected: node.selected || false
                        }));

                        // Save only canvas (nodes + edges)
                        const response = await fetch(`${API_BASE_URL}/api/journeys/${state.id}/canvas`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ 
                                nodes: transformedNodes, 
                                edges: state.edges 
                            })
                        });

                        if (!response.ok) {
                            throw new Error(`Canvas save failed: ${response.statusText}`);
                        }

                        const result = await response.json();
                        if (!result.success) {
                            throw new Error(result.message || 'Canvas save failed');
                        }

                        console.log('Canvas saved successfully!');
                        toast.success('Canvas saved successfully!', {
                            description: 'Your canvas changes have been saved'
                        });
                        
                        // Clear canvas change tracking after successful save
                        set({ 
                            isSaving: false, 
                            lastError: null, 
                            lastSavedAt: new Date(),
                            changedNodes: new Set<string>(),
                            changedEdges: new Set<string>()
                        });
                    } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : 'Failed to save canvas';
                        console.error('Failed to save canvas:', errorMessage);
                        toast.error('Canvas save failed', {
                            description: errorMessage,
                            action: {
                                label: 'Retry',
                                onClick: () => state.saveCanvasToAPI()
                            }
                        });
                        set({ isSaving: false, lastError: errorMessage });
                    }
                },

                loadFromAPI: async (journeyId: string) => {
                    set({ isLoading: true, lastError: null });
                    
                    try {
                        const response = await fetch(`${API_BASE_URL}/api/journeys/${journeyId}`);
                        const result = await response.json();
                        
                        if (result.success && result.journey) {
                            const journey = result.journey;
                            
                            // Normalize status format for goals and milestones
                            const normalizedGoals = (journey.goals || []).map((goal: any) => ({
                                ...goal,
                                status: typeof goal.status === 'string' 
                                    ? { value: goal.status }
                                    : goal.status || { value: 'active' }
                            }));
                            
                            const normalizedMilestones = (journey.milestones || []).map((milestone: any) => ({
                                ...milestone,
                                status: typeof milestone.status === 'string' 
                                    ? { value: milestone.status }
                                    : milestone.status || { value: 'active' }
                            }));
                            
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
                                goals: normalizedGoals,
                                goalLogicOperator: journey.goalLogicOperator || 'AND',
                                milestones: normalizedMilestones,
                                reports: journey.reports || [],
                                isLoading: false
                            });
                            
                            console.log('Journey loaded successfully!');
                            toast.success('Journey loaded successfully!');
                        } else {
                            throw new Error(result.message || 'Failed to load journey');
                        }
                    } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : 'Failed to load journey';
                        console.error('Failed to load journey:', errorMessage);
                        toast.error('Failed to load journey', { description: errorMessage });
                        set({ isLoading: false, lastError: errorMessage });
                    }
                },

                loadCanvasFromAPI: async (journeyId: string) => {
                    set({ isLoading: true, lastError: null });
                    
                    try {
                        const response = await fetch(`${API_BASE_URL}/api/journeys/${journeyId}/canvas`);
                        const result = await response.json();
                        
                        if (result.success && result.data) {
                            set({
                                nodes: result.data.nodes || [],
                                edges: result.data.edges || [],
                                isLoading: false
                            });
                            
                            console.log('Canvas loaded successfully!');
                        } else {
                            throw new Error(result.message || 'Failed to load canvas');
                        }
                    } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : 'Failed to load canvas';
                        console.error('Failed to load canvas:', errorMessage);
                        toast.error('Failed to load canvas', { description: errorMessage });
                        set({ isLoading: false, lastError: errorMessage });
                    }
                },

                loadGoalsFromAPI: async (journeyId: string) => {
                    set({ isLoading: true, lastError: null });
                    
                    try {
                        const response = await fetch(`${API_BASE_URL}/api/journeys/${journeyId}/goals`);
                        const result = await response.json();
                        
                        if (result.success && result.data) {
                            // Normalize status format for loaded goals
                            const normalizedGoals = (result.data.goals || []).map((goal: any) => ({
                                ...goal,
                                status: typeof goal.status === 'string' 
                                    ? { value: goal.status }
                                    : goal.status || { value: 'active' }
                            }));
                            
                            set({
                                goals: normalizedGoals,
                                isLoading: false
                            });
                            
                            console.log('Goals loaded successfully!');
                        } else {
                            throw new Error(result.message || 'Failed to load goals');
                        }
                    } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : 'Failed to load goals';
                        console.error('Failed to load goals:', errorMessage);
                        toast.error('Failed to load goals', { description: errorMessage });
                        set({ isLoading: false, lastError: errorMessage });
                    }
                },

                loadMilestonesFromAPI: async (journeyId: string) => {
                    set({ isLoading: true, lastError: null });
                    
                    try {
                        const response = await fetch(`${API_BASE_URL}/api/journeys/${journeyId}/milestones`);
                        const result = await response.json();
                        
                        if (result.success && result.data) {
                            // Normalize status format for loaded milestones
                            const normalizedMilestones = (result.data.milestones || []).map((milestone: any) => ({
                                ...milestone,
                                status: typeof milestone.status === 'string' 
                                    ? { value: milestone.status }
                                    : milestone.status || { value: 'active' }
                            }));
                            
                            set({
                                milestones: normalizedMilestones,
                                isLoading: false
                            });
                            
                            console.log('Milestones loaded successfully!');
                        } else {
                            throw new Error(result.message || 'Failed to load milestones');
                        }
                    } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : 'Failed to load milestones';
                        console.error('Failed to load milestones:', errorMessage);
                        toast.error('Failed to load milestones', { description: errorMessage });
                        set({ isLoading: false, lastError: errorMessage });
                    }
                },

                saveGoalsToAPI: async (retryCount = 0) => {
                    const state = get();
                    if (!state.id) {
                        toast.error('No journey ID available');
                        return;
                    }
                    
                    set({ isSaving: true, lastError: null });
                    
                    try {
                        const response = await fetch(`${API_BASE_URL}/api/journeys/${state.id}/goals`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ goals: state.goals })
                        });
                        
                        if (!response.ok) {
                            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                        }
                        
                        const result = await response.json();
                        if (result.success) {
                            toast.success('Goals saved successfully!');
                            set({ isSaving: false, lastError: null, unsavedChanges: false, lastSavedAt: new Date() });
                        } else {
                            throw new Error(result.message || 'Failed to save goals');
                        }
                    } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : 'Failed to save goals';
                        console.error('Failed to save goals:', errorMessage);
                        
                        // Retry logic for network errors
                        if (retryCount < 2 && (errorMessage.includes('fetch') || errorMessage.includes('network'))) {
                            console.log(`Retrying goals save (attempt ${retryCount + 1}/3)...`);
                            setTimeout(() => {
                                get().saveGoalsToAPI();
                            }, 1000 * (retryCount + 1)); // Exponential backoff
                            return;
                        }
                        
                        // Show error with retry option
                        toast.error('Failed to save goals', { 
                            description: errorMessage,
                            action: {
                                label: 'Retry',
                                onClick: () => get().saveGoalsToAPI()
                            }
                        });
                        set({ isSaving: false, lastError: errorMessage });
                    }
                },

                saveMilestonesToAPI: async (retryCount = 0) => {
                    const state = get();
                    if (!state.id) {
                        toast.error('No journey ID available');
                        return;
                    }
                    
                    set({ isSaving: true, lastError: null });
                    
                    try {
                        // Transform milestones to include sortOrder based on array position
                        const transformedMilestones = state.milestones.map((milestone, index) => ({
                            ...milestone,
                            sortOrder: index
                        }));

                        const response = await fetch(`${API_BASE_URL}/api/journeys/${state.id}/milestones`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ milestones: transformedMilestones })
                        });
                        
                        if (!response.ok) {
                            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                        }
                        
                        const result = await response.json();
                        if (result.success) {
                            toast.success('Milestones saved successfully!');
                            set({ isSaving: false, lastError: null, unsavedChanges: false, lastSavedAt: new Date() });
                        } else {
                            throw new Error(result.message || 'Failed to save milestones');
                        }
                    } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : 'Failed to save milestones';
                        console.error('Failed to save milestones:', errorMessage);
                        
                        // Retry logic for network errors
                        if (retryCount < 2 && (errorMessage.includes('fetch') || errorMessage.includes('network'))) {
                            console.log(`Retrying milestones save (attempt ${retryCount + 1}/3)...`);
                            setTimeout(() => {
                                get().saveMilestonesToAPI();
                            }, 1000 * (retryCount + 1)); // Exponential backoff
                            return;
                        }
                        
                        // Show error with retry option
                        toast.error('Failed to save milestones', { 
                            description: errorMessage,
                            action: {
                                label: 'Retry',
                                onClick: () => get().saveMilestonesToAPI()
                            }
                        });
                        set({ isSaving: false, lastError: errorMessage });
                    }
                },

                createInAPI: async (name?: string, description?: string) => {
                    set({ isLoading: true, lastError: null });
                    
                    try {
                        const response = await fetch(`${API_BASE_URL}/api/journeys/`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                name: name || `Journey ${Date.now()}`,
                                description: description || 'New journey created'
                            })
                        });
                        
                        const result = await response.json();
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
                            
                            console.log('New journey created!');
                        } else {
                            throw new Error(result.message || 'Failed to create journey');
                        }
                    } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : 'Failed to create journey';
                        console.error('Failed to create journey:', errorMessage);
                        set({ isLoading: false, lastError: errorMessage });
                        // CRITICAL: Re-throw the error so the calling code knows it failed
                        throw error;
                    }
                },

                deleteFromAPI: async () => {
                    const state = get();
                    
                    try {
                        const response = await fetch(`${API_BASE_URL}/api/journeys/${state.id}`, {
                            method: 'DELETE'
                        });
                        const result = await response.json();
                        
                        if (result.success) {
                            console.log('Journey deleted successfully!');
                            toast.success('Journey deleted successfully!');
                            
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
                        console.error('Failed to delete journey:', errorMessage);
                        toast.error('Failed to delete journey', { description: errorMessage });
                        set({ lastError: errorMessage });
                    }
                },

                duplicateInAPI: async (newName?: string) => {
                    const state = get();
                    set({ isLoading: true, lastError: null });
                    
                    try {
                        const params = newName ? `?new_name=${encodeURIComponent(newName)}` : '';
                        const response = await fetch(`${API_BASE_URL}/api/journeys/${state.id}/duplicate${params}`, {
                            method: 'POST'
                        });
                        const result = await response.json();
                        
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
                            
                            console.log('Journey duplicated successfully!');
                        } else {
                            throw new Error(result.message || 'Failed to duplicate journey');
                        }
                    } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : 'Failed to duplicate journey';
                        console.error('Failed to duplicate journey:', errorMessage);
                        set({ isLoading: false, lastError: errorMessage });
                    }
                },

                listFromAPI: async (userId?: string) => {
                    try {
                        const params = new URLSearchParams();
                        if (userId) params.append('user_id', userId);
                        
                        const response = await fetch(`${API_BASE_URL}/api/journeys/?${params}`);
                        const result = await response.json();
                        
                        if (result.success) {
                            return result.journeys || [];
                        } else {
                            throw new Error(result.message || 'Failed to list journeys');
                        }
                    } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : 'Failed to list journeys';
                        console.error('Failed to list journeys:', errorMessage);
                        set({ lastError: errorMessage });
                        return [];
                    }
                },

                updateInAPI: async (updates: any) => {
                    const state = get();
                    
                    try {
                        const response = await fetch(`${API_BASE_URL}/api/journeys/${state.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(updates)
                        });
                        const result = await response.json();
                        
                        if (result.success) {
                            // Update local state
                            set((state) => ({
                                ...state,
                                ...updates,
                                updatedAt: new Date()
                            }));
                            
                            console.log('Journey updated successfully!');
                        } else {
                            throw new Error(result.message || 'Failed to update journey');
                        }
                    } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : 'Failed to update journey';
                        console.error('Failed to update journey:', errorMessage);
                        set({ lastError: errorMessage });
                    }
                },

                // Clear error state
                clearError: () => {
                    set({ lastError: null });
                },

                // Change tracking methods
                markNodeChanged: (nodeId: string) => {
                    set((state) => ({
                        changedNodes: new Set([...state.changedNodes, nodeId])
                    }));
                },

                markEdgeChanged: (edgeId: string) => {
                    set((state) => ({
                        changedEdges: new Set([...state.changedEdges, edgeId])
                    }));
                },

                markGoalChanged: (goalId: string) => {
                    set((state) => ({
                        changedGoals: new Set([...state.changedGoals, goalId])
                    }));
                },

                markMilestoneChanged: (milestoneId: string) => {
                    set((state) => ({
                        changedMilestones: new Set([...state.changedMilestones, milestoneId])
                    }));
                },

                markReportChanged: (reportId: string) => {
                    set((state) => ({
                        changedReports: new Set([...state.changedReports, reportId])
                    }));
                },

                markJourneyMetadataChanged: () => {
                    set({ isJourneyMetadataChanged: true });
                },

                clearChangeTracking: () => {
                    set({
                        lastSavedAt: new Date(),
                        changedNodes: new Set<string>(),
                        changedEdges: new Set<string>(),
                        changedGoals: new Set<string>(),
                        changedMilestones: new Set<string>(),
                        changedReports: new Set<string>(),
                        isJourneyMetadataChanged: false
                    });
                },

                getChangedItems: () => {
                    const state = get();
                    
                    // Ensure changed sets are actually Set objects (localStorage might serialize them as arrays)
                    const changedNodes = Array.isArray(state.changedNodes) ? new Set(state.changedNodes) : state.changedNodes;
                    const changedEdges = Array.isArray(state.changedEdges) ? new Set(state.changedEdges) : state.changedEdges;
                    const changedGoals = Array.isArray(state.changedGoals) ? new Set(state.changedGoals) : state.changedGoals;
                    const changedMilestones = Array.isArray(state.changedMilestones) ? new Set(state.changedMilestones) : state.changedMilestones;
                    const changedReports = Array.isArray(state.changedReports) ? new Set(state.changedReports) : state.changedReports;
                    
                    return {
                        nodes: state.nodes.filter(node => changedNodes.has(node.id)),
                        edges: state.edges.filter(edge => changedEdges.has(edge.id)),
                        goals: state.goals.filter(goal => changedGoals.has(goal.id)),
                        milestones: state.milestones.filter(milestone => changedMilestones.has(milestone.id)),
                        reports: state.reports.filter(report => changedReports.has(report.id)),
                        hasMetadataChanges: state.isJourneyMetadataChanged
                    };
                },

                // Note: Use saveToAPI with a no-op check (below) instead of a separate save-changed
                };
            },
            { 
                name: 'journey-state',
                storage: createJSONStorage(() => localStorage),
                partialize: (state) => ({
                    ...state,
                    // Convert Sets to arrays for serialization
                    changedNodes: Array.from(state.changedNodes),
                    changedEdges: Array.from(state.changedEdges),
                    changedGoals: Array.from(state.changedGoals),
                    changedMilestones: Array.from(state.changedMilestones),
                    changedReports: Array.from(state.changedReports),
                })
            }
        )
    )
)

export default useJourneyStore;

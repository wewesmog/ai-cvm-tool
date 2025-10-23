// milestones page

"use client";

import React, { useState } from 'react';
import { MapPin, Plus, Clock, CheckCircle, Circle, ArrowRight, GripVertical, ChevronRight, MoreVertical, Copy, Trash2, X, Archive } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { MilestoneNodeModal } from "@/components/modals/MilestoneNodeModal";
import useJourneyStore from '@/stores/journey-store';
import { toast } from 'sonner';
// @ts-ignore
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

// Type definitions for react-beautiful-dnd
interface DropResult {
    draggableId: string;
    type: string;
    source: {
        droppableId: string;
        index: number;
    };
    destination?: {
        droppableId: string;
        index: number;
    } | null;
    reason: 'DROP' | 'CANCEL';
}

interface DroppableProvided {
    innerRef: (element: HTMLElement | null) => void;
    droppableProps: any;
    placeholder?: React.ReactElement;
}

interface DraggableProvided {
    innerRef: (element: HTMLElement | null) => void;
    draggableProps: any;
    dragHandleProps?: any;
}

interface DraggableStateSnapshot {
    isDragging: boolean;
    isDropAnimating: boolean;
    dropAnimation?: any;
    draggingOver?: string;
    combineWith?: string;
    combineTargetFor?: string;
    mode?: 'FLUID' | 'SNAP';
}
export default function MilestonesPage() {
    const { milestones, addMilestone, updateMilestone, removeMilestone, saveToAPI, loadMilestonesFromAPI, saveMilestonesToAPI, isLoading, id: journeyId } = useJourneyStore();
    
    // Helper function for milestone status colors
    const getMilestoneStatusColor = (status: string | { value: string } | undefined | null) => {
        console.log('🎨 Milestones getStatusColor called with:', status, 'type:', typeof status);
        if (!status) {
            console.log('⚠️ Milestones status is null/undefined, returning default');
            return 'bg-gray-100 text-gray-800';
        }
        const statusValue = typeof status === 'string' ? status : status.value;
        console.log('🎨 Milestones extracted status value:', statusValue);
        
        // Force return specific colors for testing
        if (statusValue === 'active') {
            console.log('🎨 Returning blue for active');
            return 'bg-blue-100 text-blue-800';
        }
        if (statusValue === 'completed') {
            console.log('🎨 Returning green for completed');
            return 'bg-green-100 text-green-800';
        }
        if (statusValue === 'pending') {
            console.log('🎨 Returning grey for pending');
            return 'bg-gray-100 text-gray-800';
        }
        if (statusValue === 'in-progress') {
            console.log('🎨 Returning blue for in-progress');
            return 'bg-blue-100 text-blue-800';
        }
        if (statusValue === 'overdue') {
            console.log('🎨 Returning red for overdue');
            return 'bg-red-100 text-red-800';
        }
        if (statusValue === 'cancelled') {
            console.log('🎨 Returning grey for cancelled');
            return 'bg-gray-100 text-gray-600';
        }
        if (statusValue === 'archived') {
            console.log('🎨 Returning grey for archived');
            return 'bg-gray-100 text-gray-600';
        }
        
        console.log('⚠️ Milestones unknown status value:', statusValue, 'returning blue for active');
        return 'bg-blue-100 text-blue-800'; // Default to blue for active status
    };
    
    // Load milestones when component mounts
    React.useEffect(() => {
        if (journeyId) {
            loadMilestonesFromAPI(journeyId);
        }
    }, [journeyId, loadMilestonesFromAPI]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'active': return 'bg-blue-100 text-blue-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'failed': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'active': return <Clock className="h-4 w-4 text-blue-600" />;
            case 'pending': return <Circle className="h-4 w-4 text-yellow-600" />;
            case 'failed': return <Circle className="h-4 w-4 text-red-600" />;
            default: return <Circle className="h-4 w-4 text-gray-600" />;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
    const [selectedMilestone, setSelectedMilestone] = useState<any>(null);

    const handleCreateMilestone = () => {
        setSelectedMilestone(null); // Clear selected milestone for new milestone creation
        setIsMilestoneModalOpen(true);
    };

    const handleSaveMilestone = async (milestoneData: any) => {
        try {
            // Add milestone to store
            addMilestone({
                title: milestoneData.title,
                description: milestoneData.description,
                targetDate: milestoneData.targetDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                status: { value: 'pending' },
                progress: 0,
                dependencies: milestoneData.dependencies || []
            });
            
            // Auto-save milestones to backend
            await saveMilestonesToAPI();
            
            setIsMilestoneModalOpen(false);
        } catch (error) {
            console.error('Failed to create milestone:', error);
            toast.error('Failed to create milestone');
        }
    };

    const handleMilestoneClick = async (milestone: any) => {
        // Open modal to edit the milestone
        console.log('Milestone clicked:', milestone);
        setSelectedMilestone(milestone);
        setIsMilestoneModalOpen(true);
    };

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) {
            return;
        }

        const { milestones, reorderMilestones } = useJourneyStore.getState();
        
        // Create new order array
        const items = Array.from(milestones);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        
        // Update order in store (marks as changed)
        reorderMilestones(items.map(item => item.id));
        
        console.log('Milestone reordered:', result);
    };

    // Milestone action handlers
    const handleMilestoneAction = async (action: string, milestoneId: string) => {
        const { updateMilestone, addMilestone, milestones } = useJourneyStore.getState();
        const milestone = milestones.find(m => m.id === milestoneId);
        
        if (!milestone) return;

        console.log('🎯 Milestone action:', action, 'on milestone:', milestone.title, 'current status:', milestone.status);

        try {
            switch (action) {
                case 'activate':
                    updateMilestone(milestoneId, { 
                        status: { value: 'active' } 
                    });
                    console.log('🟢 Milestone activated');
                    toast.success('Milestone activated!');
                    break;
                    
                case 'complete':
                    console.log('🏁 Before update - Milestone status:', milestone.status);
                    updateMilestone(milestoneId, { 
                        status: { value: 'completed' },
                        progress: 100 
                    });
                    // Check the updated state
                    const updatedMilestone = useJourneyStore.getState().milestones.find(m => m.id === milestoneId);
                    console.log('✅ Milestone completed, updated status:', updatedMilestone?.status);
                    toast.success('Milestone completed!');
                    break;
                    
                case 'cancel':
                    updateMilestone(milestoneId, { 
                        status: { value: 'cancelled' } 
                    });
                    console.log('❌ Milestone cancelled');
                    toast.success('Milestone cancelled!');
                    break;
                    
                case 'copy':
                    const newMilestone = {
                        ...milestone,
                        title: `${milestone.title} (Duplicate)`,
                        status: { value: 'pending' },
                        progress: 0,
                        sortOrder: milestones.length
                    };
                    addMilestone(newMilestone);
                    console.log('📋 Milestone duplicated');
                    toast.success('Milestone duplicated!');
                    break;
                    
                case 'delete':
                    updateMilestone(milestoneId, { 
                        status: { value: 'deleted' } 
                    });
                    console.log('🗑️ Milestone deleted');
                    toast.success('Milestone deleted!');
                    break;
                    
                case 'archive':
                    updateMilestone(milestoneId, { 
                        status: { value: 'archived' } 
                    });
                    console.log('📦 Milestone archived');
                    toast.success('Milestone archived!');
                    break;
            }
        } catch (error) {
            console.error('Failed to update milestone:', error);
            toast.error('Failed to update milestone');
        }
    };

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 h-full">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MapPin className="h-6 w-6 text-blue-600" />
                    <h1 className="text-2xl font-bold">Journey Milestones</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        onClick={saveMilestonesToAPI}
                        disabled={isLoading}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        {isLoading ? 'Saving...' : 'Save Milestones'}
                    </Button>
                    <Button className="flex items-center gap-2" onClick={handleCreateMilestone}>
                        <Plus className="h-4 w-4" />
                        Create Milestone
                    </Button>
                </div>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="milestones" isDropDisabled={false} isCombineEnabled={false} ignoreContainerClipping={false}>
                    {(provided: DroppableProvided) => (
                        <div 
                            ref={provided.innerRef} 
                            {...provided.droppableProps}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        >
                            {milestones
                                .filter(milestone => milestone.status.value !== 'deleted')
                                .map((milestone, index) => {
                                    console.log('🎨 Rendering milestone:', milestone.title, 'status:', milestone.status, 'status.value:', milestone.status.value);
                                    return (
                                <Draggable 
                                    key={milestone.id}
                                    draggableId={milestone.id.toString()} 
                                    index={index}
                                >
                                    {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className={`${snapshot.isDragging ? 'opacity-50' : ''}`}
                                        >
                                            <Card 
                                                className="hover:shadow-md transition-shadow relative h-full cursor-pointer hover:scale-105"
                                                onClick={() => handleMilestoneClick(milestone)}
                                            >
                                                {/* Drag Handle */}
                                                <div 
                                                    {...provided.dragHandleProps}
                                                    className="absolute top-2 right-2 p-1 cursor-grab active:cursor-grabbing opacity-50 hover:opacity-100 transition-opacity"
                                                >
                                                    <GripVertical className="h-4 w-4 text-gray-400" />
                                                </div>
                                                
                                                <CardHeader className="pb-3">
                                                    <div className="flex items-center justify-between">
                                                        <CardTitle className="text-lg flex items-center gap-2">
                                                            {getStatusIcon(milestone.status)}
                                                            {milestone.title}
                                                        </CardTitle>
                                                        <div className="flex items-center gap-2">
                                <Badge className={getMilestoneStatusColor(milestone.status)}>
                                    {milestone.status.value}
                                </Badge>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                        <MoreVertical className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            {milestone.status.value !== 'active' && (
                                                <DropdownMenuItem onClick={() => handleMilestoneAction('activate', milestone.id)}>
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    Activate
                                                </DropdownMenuItem>
                                            )}
                                            {milestone.status.value !== 'completed' && (
                                                <DropdownMenuItem onClick={() => handleMilestoneAction('complete', milestone.id)}>
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    Complete
                                                </DropdownMenuItem>
                                            )}
                                            {milestone.status.value !== 'cancelled' && (
                                                <DropdownMenuItem onClick={() => handleMilestoneAction('cancel', milestone.id)}>
                                                    <X className="h-4 w-4 mr-2" />
                                                    Cancel
                                                </DropdownMenuItem>
                                            )}
                                                                    <DropdownMenuItem onClick={() => handleMilestoneAction('copy', milestone.id)}>
                                                                        <Copy className="h-4 w-4 mr-2" />
                                                                        Duplicate
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem onClick={() => handleMilestoneAction('archive', milestone.id)}>
                                                                        <Archive className="h-4 w-4 mr-2" />
                                                                        Archive
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem 
                                                                        onClick={() => handleMilestoneAction('delete', milestone.id)}
                                                                        className="text-red-600 focus:text-red-600"
                                                                    >
                                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                                        Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </div>
                                                    <CardDescription className="flex items-center gap-1">
                                                        <ArrowRight className="h-3 w-3" />
                                                        {milestone.description}
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="text-muted-foreground">Progress</span>
                                                            <span className="font-medium">{milestone.progress}%</span>
                                                        </div>
                                                        
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="text-muted-foreground">Target Date</span>
                                                            <span className="font-medium">
                                                                {milestone.targetDate ? formatDate(milestone.targetDate) : 'No target date'}
                                                            </span>
                                                        </div>
                                                        
                                                        {milestone.dependencies && milestone.dependencies.length > 0 && (
                                                            <div className="flex items-center justify-between text-sm">
                                                                <span className="text-muted-foreground">Dependencies</span>
                                                                <span className="font-medium">{milestone.dependencies.length}</span>
                                                            </div>
                                                        )}
                                                        
                                                        {milestone.status.value === 'active' && (
                                                            <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                                                                <Clock className="h-3 w-3 inline mr-1" />
                                                                Currently in progress
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    )}
                                </Draggable>
                                );
                            })}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
            
            {/* Long arrow below the grid to show flow */}
            <div className="flex justify-center mt-6">
                <div className="flex items-center gap-2 text-gray-400">
                    <div className="h-px bg-gray-300 w-32"></div>
                    <ChevronRight className="h-6 w-6" />
                    <div className="h-px bg-gray-300 w-32"></div>
                    <ChevronRight className="h-6 w-6" />
                    <div className="h-px bg-gray-300 w-32"></div>
                    <ChevronRight className="h-6 w-6" />
                    <div className="h-px bg-gray-300 w-32"></div>
                </div>
            </div>

            <div className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Milestone Flow Overview
                        </CardTitle>
                        <CardDescription>
                            Visual representation of milestone progression across journeys
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-8 text-muted-foreground">
                            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Milestone flow visualization will be displayed here</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <MilestoneNodeModal  
                isOpen={isMilestoneModalOpen}
                onClose={() => setIsMilestoneModalOpen(false)}
                onSave={handleSaveMilestone}
                nodeData={{
                    title: "New Milestone",
                    description: "Create a new milestone",
                    milestoneType: "completion",
                    completionCriteria: "manual",
                    targetValue: 100,
                    targetMetric: "tasks",
                    timeFrame: "monthly",
                    priority: "medium",
                    trackProgress: true,
                    rewardType: "none",
                    rewardValue: 0,
                    rewardDescription: "",
                    actionOnCompletion: "none",
                    actionDescription: "",
                    dataSource: "analytics",
                    apiEndpoint: "",
                    sqlQuery: "",
                    userField: "",
                    scheduleMode: false,
                    startDate: undefined,
                    endDate: undefined,
                    startTime: "09:00",
                    endTime: "17:00",
                    repeatMode: "none",
                    maxParticipants: 100,
                    timezone: "UTC"
                }}
            />
        </div>
    );
}

// Helper functions
function getStatusIcon(status: string | { value: string } | undefined | null) {
    if (!status) {
        console.log('🎨 getStatusIcon called with null/undefined status');
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
    const statusValue = typeof status === 'string' ? status : status.value;
    console.log('🎨 getStatusIcon called with:', status, 'extracted value:', statusValue);
    switch (statusValue) {
        case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
        case 'in-progress': return <Clock className="h-4 w-4 text-blue-600" />;
        case 'pending': return <Circle className="h-4 w-4 text-gray-400" />;
        case 'overdue': return <Clock className="h-4 w-4 text-red-600" />;
        case 'cancelled': return <X className="h-4 w-4 text-gray-500" />;
        case 'deleted': return <Trash2 className="h-4 w-4 text-red-500" />;
        case 'archived': return <Archive className="h-4 w-4 text-gray-500" />;
        case 'active': return <Clock className="h-4 w-4 text-blue-600" />;
        default: 
            console.log('⚠️ Unknown status value:', statusValue);
            return <Circle className="h-4 w-4 text-gray-400" />;
    }
}

function getStatusColor(status: string | { value: string } | undefined | null) {
    console.log('🎨 Milestones getStatusColor called with:', status, 'type:', typeof status);
    if (!status) {
        console.log('⚠️ Milestones status is null/undefined, returning default');
        return 'bg-gray-100 text-gray-800';
    }
    const statusValue = typeof status === 'string' ? status : status.value;
    console.log('🎨 Milestones extracted status value:', statusValue);
    
    // Force return specific colors for testing
    if (statusValue === 'active') {
        console.log('🎨 Returning blue for active');
        return 'bg-blue-100 text-blue-800';
    }
    if (statusValue === 'completed') {
        console.log('🎨 Returning green for completed');
        return 'bg-green-100 text-green-800';
    }
    if (statusValue === 'pending') {
        console.log('🎨 Returning grey for pending');
        return 'bg-gray-100 text-gray-800';
    }
    
    console.log('⚠️ Milestones unknown status value:', statusValue, 'returning blue for active');
    return 'bg-blue-100 text-blue-800'; // Default to blue for active status
}

function formatDate(date: Date | string) {
    const d = new Date(date);
    return d.toLocaleDateString();
}
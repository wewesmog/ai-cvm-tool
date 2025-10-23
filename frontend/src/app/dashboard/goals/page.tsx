// goals page
"use client";


import React, { useState } from 'react';
import { Target, Plus, Calendar, TrendingUp, Users, MoreVertical, Copy, Trash2, X, Archive, CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { GoalNodeModal } from "@/components/modals/GoalNodeModal";
import useJourneyStore from '@/stores/journey-store';
import { toast } from 'sonner';

export default function GoalsPage() {
    const { goals, addGoal, updateGoal, removeGoal, saveToAPI, loadGoalsFromAPI, saveGoalsToAPI, id: journeyId, goalLogicOperator, updateGoalLogicOperator, isLoading } = useJourneyStore();
    
    // Load goals when component mounts
    React.useEffect(() => {
        if (journeyId) {
            loadGoalsFromAPI(journeyId);
        }
    }, [journeyId, loadGoalsFromAPI]);

    // Global operator for all goals - now managed by store

    const getStatusColor = (status: string | { value: string } | undefined | null) => {
        console.log('🎨 Goals getStatusColor called with:', status, 'type:', typeof status);
        if (!status) {
            console.log('⚠️ Goals status is null/undefined, returning default');
            return 'bg-gray-100 text-gray-800';
        }
        const statusValue = typeof status === 'string' ? status : status.value;
        console.log('🎨 Goals extracted status value:', statusValue);
        
        // Force return specific colors for testing
        if (statusValue === 'active') {
            console.log('🎨 Goals returning blue for active');
            return 'bg-blue-100 text-blue-800';
        }
        if (statusValue === 'completed') {
            console.log('🎨 Goals returning green for completed');
            return 'bg-green-100 text-green-800';
        }
        if (statusValue === 'not-started') {
            console.log('🎨 Goals returning grey for not-started');
            return 'bg-gray-100 text-gray-800';
        }
        if (statusValue === 'in-progress') {
            console.log('🎨 Goals returning blue for in-progress');
            return 'bg-blue-100 text-blue-800';
        }
        if (statusValue === 'cancelled') {
            console.log('🎨 Goals returning grey for cancelled');
            return 'bg-gray-100 text-gray-600';
        }
        if (statusValue === 'archived') {
            console.log('🎨 Goals returning grey for archived');
            return 'bg-gray-100 text-gray-600';
        }
        
        console.log('⚠️ Goals unknown status value:', statusValue, 'returning blue for active');
        return 'bg-blue-100 text-blue-800'; // Default to blue for active status
    };

    const getProgressPercentage = (achieved: number, target: number) => {
        return Math.min((achieved / target) * 100, 100);
    };

    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<any>(null);

    const handleCreateGoal = () => {
        setSelectedGoal(null); // Clear selected goal for new goal creation
        setIsGoalModalOpen(true);
    };

    const handleSaveGoal = async (goalData: any) => {
        try {
            // Add goal to store
            addGoal({
                title: goalData.title,
                description: goalData.description,
                targetValue: goalData.targetValue || 100,
                currentValue: 0,
                unit: goalData.targetMetric || 'units',
                deadline: goalData.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                status: { value: 'active' },
                priority: { value: goalData.priority || 'medium' },
                category: goalData.goalType || 'conversion'
            });
            
            // Auto-save goals to backend
            await saveGoalsToAPI();
            
            setIsGoalModalOpen(false);
        } catch (error) {
            console.error('Failed to create goal:', error);
            toast.error('Failed to create goal');
        }
    };

    const handleGoalClick = async (goal: any) => {
        // Open modal to edit the goal
        console.log('Goal clicked:', goal);
        setSelectedGoal(goal);
        setIsGoalModalOpen(true);
    };

    // Goal action handlers
    const handleGoalAction = async (action: string, goalId: string) => {
        const { updateGoal, addGoal, goals } = useJourneyStore.getState();
        const goal = goals.find(g => g.id === goalId);
        
        if (!goal) return;

        console.log('🎯 Goal action:', action, 'on goal:', goal.title, 'current status:', goal.status);

        try {
            switch (action) {
                case 'activate':
                    updateGoal(goalId, { 
                        status: { value: 'active' } 
                    });
                    console.log('🟢 Goal activated');
                    toast.success('Goal activated!');
                    break;
                    
                case 'complete':
                    console.log('🎯 Before update - Goal status:', goal.status);
                    updateGoal(goalId, { 
                        status: { value: 'completed' },
                        currentValue: goal.targetValue
                    });
                    // Check the updated state
                    const updatedGoal = useJourneyStore.getState().goals.find(g => g.id === goalId);
                    console.log('✅ Goal completed, updated status:', updatedGoal?.status);
                    toast.success('Goal completed!');
                    break;
                    
                case 'cancel':
                    updateGoal(goalId, { 
                        status: { value: 'cancelled' } 
                    });
                    console.log('❌ Goal cancelled');
                    toast.success('Goal cancelled!');
                    break;
                    
                case 'copy':
                    const newGoal = {
                        ...goal,
                        title: `${goal.title} (Duplicate)`,
                        status: { value: 'not-started' },
                        currentValue: 0
                    };
                    addGoal(newGoal);
                    console.log('📋 Goal duplicated');
                    toast.success('Goal duplicated!');
                    break;
                    
                case 'delete':
                    updateGoal(goalId, { 
                        status: { value: 'deleted' } 
                    });
                    console.log('🗑️ Goal deleted');
                    toast.success('Goal deleted!');
                    break;
                    
                case 'archive':
                    updateGoal(goalId, { 
                        status: { value: 'archived' } 
                    });
                    console.log('📦 Goal archived');
                    toast.success('Goal archived!');
                    break;
            }
        } catch (error) {
            console.error('Failed to update goal:', error);
            toast.error('Failed to update goal');
        }
    };

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 h-full">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Target className="h-6 w-6 text-green-600" />
                    <h1 className="text-2xl font-bold">Journey Goals</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        onClick={saveGoalsToAPI}
                        disabled={isLoading}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Target className="h-4 w-4" />
                                Save Goals
                            </>
                        )}
                    </Button>
                    <Button className="flex items-center gap-2" onClick={handleCreateGoal}>
                        <Plus className="h-4 w-4" />
                        Create Goal
                    </Button>
                </div>
            </div>

            {/* Global Operator Selector */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Goal Logic:</span>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">AND</span>
                    <Switch
                        checked={goalLogicOperator === 'OR'}
                        onCheckedChange={(checked) => updateGoalLogicOperator(checked ? 'OR' : 'AND')}
                    />
                    <span className="text-sm text-gray-600">OR</span>
                </div>
                <span className="text-xs text-gray-500">
                    (Applied between all goals)
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {goals.filter(goal => goal.status.value !== 'deleted').map((goal) => {
                    console.log('🎨 Rendering goal:', goal.title, 'status:', goal.status, 'status.value:', goal.status.value);
                    return (
                    <Card 
                        key={goal.id} 
                        className="hover:shadow-md transition-shadow cursor-pointer hover:scale-105"
                        onClick={() => handleGoalClick(goal)}
                    >
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">{goal.title}</CardTitle>
                                <div className="flex items-center gap-2">
                                    <Badge className={getStatusColor(goal.status)}>
                                        {goal.status.value}
                                    </Badge>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            {goal.status.value !== 'active' && (
                                                <DropdownMenuItem onClick={() => handleGoalAction('activate', goal.id)}>
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    Activate
                                                </DropdownMenuItem>
                                            )}
                                            {goal.status.value !== 'completed' && (
                                                <DropdownMenuItem onClick={() => handleGoalAction('complete', goal.id)}>
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    Complete
                                                </DropdownMenuItem>
                                            )}
                                            {goal.status.value !== 'cancelled' && (
                                                <DropdownMenuItem onClick={() => handleGoalAction('cancel', goal.id)}>
                                                    <X className="h-4 w-4 mr-2" />
                                                    Cancel
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuItem onClick={() => handleGoalAction('copy', goal.id)}>
                                                <Copy className="h-4 w-4 mr-2" />
                                                Duplicate
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => handleGoalAction('archive', goal.id)}>
                                                <Archive className="h-4 w-4 mr-2" />
                                                Archive
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleGoalAction('delete', goal.id)}>
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                            <CardDescription className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Due: {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'No deadline'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Progress</span>
                                    <span className="font-medium">
                                        {goal.currentValue.toLocaleString()} / {goal.targetValue.toLocaleString()}
                                    </span>
                                </div>
                                
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${getProgressPercentage(goal.currentValue, goal.targetValue)}%` }}
                                    ></div>
                                </div>
                                
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Category</span>
                                    <span className="font-medium">{goal.category}</span>
                                </div>
                                
                                <div className="flex items-center gap-2 text-sm">
                                    <TrendingUp className="h-3 w-3 text-green-600" />
                                    <span className="text-muted-foreground">
                                        {getProgressPercentage(goal.currentValue, goal.targetValue).toFixed(1)}% complete
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    );
                })}
            </div>

            {/* Logical Structure Visualization */}
            <div className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5" />
                            Goal Logic Structure
                        </CardTitle>
                        <CardDescription>
                            Visual representation of your goal logic
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-700">All Goals:</span>
                                <div className="flex items-center gap-1 flex-wrap">
                                    {goals.map((goal, goalIndex) => (
                                        <React.Fragment key={goal.id}>
                                            <Badge variant="outline" className="text-xs">
                                                {goal.title}
                                            </Badge>
                                            {goalIndex < goals.length - 1 && (
                                                <span className="text-xs font-medium text-gray-500">
                                                    {globalOperator}
                                                </span>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Summary */}
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-sm text-blue-800">
                                    <strong>Journey will end when:</strong> {
                                        goals.map(g => g.title).join(` ${goalLogicOperator} `)
                                    }
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <GoalNodeModal  
                isOpen={isGoalModalOpen}
                onClose={() => setIsGoalModalOpen(false)}
                onSave={handleSaveGoal}
                nodeData={{
                    title: "New Goal",
                    description: "Create a new goal",
                    goalType: "conversion",
                    targetValue: 100,
                    targetMetric: "sales",
                    timeFrame: "monthly",
                    priority: "medium",
                    trackProgress: true,
                    rewardType: "none",
                    rewardValue: 0,
                    rewardDescription: "",
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

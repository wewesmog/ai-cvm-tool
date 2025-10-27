'use client'
import React from 'react'

import JourneyPage from '@/app/dashboard/canvas/page'
import GoalsPage from '@/app/dashboard/goals/page'
import MilestonesPage from '@/app/dashboard/milestones/page'
import JourneyHomePage from '@/app/dashboard/journey-home/page'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import useJourneyStore from '@/stores/journey-store'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useState } from 'react'
import CanvasPage from '../canvas/page'
import { Download, Share, Play, Archive, MoreHorizontal, CheckCircle, Send } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function NewJourneyPage() {
    const router = useRouter()
    const { clearJourney, saveToAPI, isLoading, name: journeyName } = useJourneyStore()
    const [showCancelDialog, setShowCancelDialog] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    
    const handleCancel = () => {
        clearJourney() // Use store method instead of localStorage.clear()
        router.push('/dashboard/home')
        setShowCancelDialog(false)
    }
    
    const handleCancelClick = () => {
        setShowCancelDialog(true)
    }

    const handleSaveAndExit = async () => {
        setIsSaving(true)
        try {
            await saveToAPI()
            // All toasts (success, error, info) are handled in the store method
            // Redirect to dashboard after successful save
            router.push('/dashboard/home')
        } catch (error) {
            console.error('Failed to save journey:', error)
            // Error toast is also handled in the store method
        } finally {
            setIsSaving(false)
        }
    }
    return (
        <div className="h-full">
            {/* Clean header with minimal actions */}
            <div className="flex justify-between items-center gap-6 mb-6 px-4 pt-4">
                {/* Journey Name */}
                <div className="flex-1">
                    <h1 className="text-2xl font-semibold text-foreground">
                        {journeyName || 'Untitled Journey'}
                    </h1>
                </div>
                
                {/* Minimal Actions */}
                <div className="flex items-center gap-1">
                    {/* Primary Actions - Icon + Text */}
                    <Button 
                        variant="outline"
                        size="sm"
                        onClick={handleSaveAndExit}
                        disabled={isSaving || isLoading}
                        className="border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-900/20"
                    >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {isSaving ? 'Saving...' : 'Save & Exit'}
                    </Button>
                    
                    <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => toast.info('Play functionality coming soon!')}
                        className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/20"
                    >
                        <Play className="h-4 w-4 mr-2" />
                        Start
                    </Button>
                    
                    {/* More Actions Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="px-2">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => toast.info('Export functionality coming soon!')}>
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.info('Share functionality coming soon!')}>
                                <Share className="h-4 w-4 mr-2" />
                                Share
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.info('Validate functionality coming soon!')}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Validate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.info('Publish functionality coming soon!')}>
                                <Send className="h-4 w-4 mr-2" />
                                Publish
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                onClick={() => toast.info('Archive functionality coming soon!')}
                                className="text-red-600 focus:text-red-600"
                            >
                                <Archive className="h-4 w-4 mr-2" />
                                Archive
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    
                    {/* Cancel with confirmation dialog */}
                    <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/20">
                                Cancel
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Cancel Journey Creation?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to cancel? All unsaved changes will be lost, including:
                                    <ul className="mt-2 ml-4 list-disc">
                                        <li>Canvas nodes and connections</li>
                                        <li>Goals and milestones</li>
                                        <li>Any other journey data</li>
                                    </ul>
                                    <strong>Tip:</strong> Use "Save & Exit" to save your work and return to the dashboard.
                                    This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Keep Working</AlertDialogCancel>
                                <AlertDialogAction 
                                    onClick={handleCancel}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    Yes, Cancel & Lose Changes
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
            <Tabs defaultValue="home" className="h-full flex flex-col px-4">
                <TabsList className="grid w-full grid-cols-4 bg-muted/30">
                    <TabsTrigger value="home">Home</TabsTrigger>
                    <TabsTrigger value="journey">Journey</TabsTrigger>
                    <TabsTrigger value="milestones">Milestones</TabsTrigger>
                    <TabsTrigger value="goals">Goals</TabsTrigger>
                </TabsList>

                <TabsContent value="home" className="flex-1">
                    <JourneyHomePage />
                </TabsContent>
                <TabsContent value="journey" className="flex-1">
                    <CanvasPage />
                </TabsContent>
                
                <TabsContent value="goals" className="flex-1">
                    <GoalsPage />
                </TabsContent>
                
                <TabsContent value="milestones" className="flex-1">
                    <MilestonesPage />
                </TabsContent>
            </Tabs>
        </div>
    )
}
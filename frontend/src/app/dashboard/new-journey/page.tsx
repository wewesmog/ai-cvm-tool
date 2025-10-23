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
import { Download, Share, Play, Archive } from 'lucide-react'

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
            {/* Journey name and action buttons */}
            <div className="flex justify-between items-start gap-6 mb-4 px-4 pt-4">
                {/* Journey Name */}
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-foreground">
                        {journeyName || 'Untitled Journey'}
                    </h1>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2">
                    <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => toast.info('Export functionality coming soon!')}
                        title="Export Journey"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    
                    <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => toast.info('Share functionality coming soon!')}
                        title="Share Journey"
                    >
                        <Share className="h-4 w-4 mr-2" />
                        Share
                    </Button>
                    
                    <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => toast.info('Play functionality coming soon!')}
                        title="Start Journey"
                    >
                        <Play className="h-4 w-4 mr-2" />
                        Start
                    </Button>
                    
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toast.info('Archive functionality coming soon!')}
                        title="Archive Journey"
                        className="border-destructive/20 hover:border-destructive/40 hover:bg-destructive/5"
                    >
                        <Archive className="h-4 w-4 mr-2 text-destructive" />
                        <span className="text-destructive">Archive</span>
                    </Button>
                    
                    <Button 
                        variant="default"
                        size="sm"
                        onClick={handleSaveAndExit}
                        disabled={isSaving || isLoading}
                    >
                        {isSaving ? 'Saving...' : 'Save & Exit'}
                    </Button>
                    
                    {/* Cancel with confirmation dialog */}
                    <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={handleCancelClick}>
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
                    
                    <Button variant="default" size="sm">Validate</Button>
                    <Button variant="default" size="sm">Publish</Button>
                </div>
            </div>
            <Tabs defaultValue="home" className="h-full flex flex-col px-4">
                <TabsList className="grid w-full grid-cols-4 bg-muted/50">
                    <TabsTrigger 
                        value="home"
                        className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                    >
                        Home
                    </TabsTrigger>
                    <TabsTrigger 
                        value="journey"
                        className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                    >
                        Journey
                    </TabsTrigger>
                    <TabsTrigger 
                        value="milestones"
                        className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                    >
                        Milestones
                    </TabsTrigger>
                    <TabsTrigger 
                        value="goals"
                        className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                    >
                        Goals
                    </TabsTrigger>
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
// General info for existing or new journey

'use client'

import { useState, useEffect } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import useJourneyStore from '@/stores/journey-store'
import { toast } from 'sonner'
import { Edit, Save, X, Download, Share, Archive, Trash2, Settings, Play, Pause } from 'lucide-react'

const formSchema = z.object({
  name: z.string().min(1, "Journey name is required"),
  description: z.string().optional(),
})

export default function JourneyHomePage() {
    const { 
        id: journeyId,
        name: journeyName, 
        description: journeyDescription,
        updateJourney,
        createInAPI,
        clearJourney,
        isLoading,
        lastError,
        clearError
    } = useJourneyStore()

    const [isEditing, setIsEditing] = useState(false)
    const [isCreating, setIsCreating] = useState(false)

    // Check if this is a new journey (no ID) or existing journey
    const isNewJourney = !journeyId

    // React Hook Form setup
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        mode: "onChange",
        defaultValues: {
            name: journeyName || '',
            description: journeyDescription || '',
        }
    })

    // Update form when journey data changes
    useEffect(() => {
        form.reset({
            name: journeyName || '',
            description: journeyDescription || '',
        })
    }, [journeyName, journeyDescription, form])

    // Clear any previous errors when component loads
    useEffect(() => {
        if (lastError) {
            clearError()
        }
    }, [])

    const handleEdit = () => {
        setIsEditing(true)
    }

    const handleCancel = () => {
        setIsEditing(false)
        form.reset({
            name: journeyName || '',
            description: journeyDescription || '',
        })
    }

    const handleSave = async (data: z.infer<typeof formSchema>) => {
        if (isNewJourney) {
            // Create new journey
            setIsCreating(true)
            try {
                // Clear only journey-related localStorage data
                localStorage.removeItem('journey-state')
                clearJourney() // Clear the store state
                console.log('🧹 Cleared journey state for new journey')
                
                await createInAPI(data.name.trim(), data.description?.trim() || '')
                toast.success(`Journey "${data.name}" created successfully!`)
                setIsEditing(false)
            } catch (error) {
                console.error('Failed to create journey:', error)
                toast.error('Failed to create journey. Please try again.')
            } finally {
                setIsCreating(false)
            }
        } else {
            // Update existing journey
            try {
                await updateJourney({
                    name: data.name.trim(),
                    description: data.description?.trim() || ''
                })
                toast.success('Journey updated successfully!')
                setIsEditing(false)
            } catch (error) {
                console.error('Failed to update journey:', error)
                toast.error('Failed to update journey. Please try again.')
            }
        }
    }

    if (isNewJourney && !isEditing) {
        // Show creation prompt for new journey
        return (
            <div className="container mx-auto p-6 max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Create Your Journey</CardTitle>
                        <CardDescription>
                            Start by giving your journey a name and description.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={handleEdit} className="w-full">
                            <Edit className="h-4 w-4 mr-2" />
                            Create Journey
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (isEditing) {
        // Show edit form
        return (
            <div className="container mx-auto p-6 max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {isNewJourney ? 'Create New Journey' : 'Edit Journey Details'}
                        </CardTitle>
                        <CardDescription>
                            {isNewJourney 
                                ? 'Enter the details for your new journey.' 
                                : 'Update your journey information.'
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
                            <Controller
                                name="name"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="journey-name">Journey Name *</FieldLabel>
                                        <Input
                                            {...field}
                                            id="journey-name"
                                            placeholder="Enter journey name"
                                            disabled={isCreating}
                                            aria-invalid={fieldState.invalid}
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                            
                            <Controller
                                name="description"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="journey-description">Description</FieldLabel>
                                        <Textarea
                                            {...field}
                                            id="journey-description"
                                            placeholder="Enter journey description"
                                            disabled={isCreating}
                                            rows={3}
                                            aria-invalid={fieldState.invalid}
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                            
                            {/* Error Display */}
                            {lastError && (
                                <div className="text-red-600 text-sm">
                                    Error: {lastError}
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Button 
                                    type="submit"
                                    disabled={isCreating || !form.formState.isValid}
                                    className="flex-1"
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {isCreating ? 'Creating...' : (isNewJourney ? 'Create Journey' : 'Save Changes')}
                                </Button>
                                <Button 
                                    type="button"
                                    variant="outline" 
                                    onClick={handleCancel}
                                    disabled={isCreating}
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Show journey details for existing journey
    return (
        <div className="container mx-auto p-6 max-w-4xl">
            {/* Page Header with Journey Name and Action Buttons */}
            <div className="mb-8 flex items-start justify-between gap-6">
                {/* Journey Name and Description */}
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-foreground">{journeyName || 'Untitled Journey'}</h1>
                    <p className="text-muted-foreground mt-2">{journeyDescription || 'No description provided'}</p>
                </div>

                {/* Journey Action Buttons */}
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
                </div>
            </div>

            {/* Journey Details Card */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>Journey Details</CardTitle>
                            <CardDescription>
                                Manage your journey information and settings
                            </CardDescription>
                        </div>
                        <Button variant="outline" onClick={handleEdit}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Details
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Journey ID</h4>
                            <p className="text-sm font-mono bg-muted p-2 rounded">{journeyId}</p>
                        </div>
                        <div>
                            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Status</h4>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                Active
                            </span>
                        </div>
                        <div>
                            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Last Updated</h4>
                            <p className="text-sm text-muted-foreground">
                                {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
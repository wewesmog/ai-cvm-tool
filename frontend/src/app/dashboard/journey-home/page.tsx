// General info for existing or new journey

'use client'

import { useState, useEffect } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
    
    const [currentTime, setCurrentTime] = useState<string>('Loading...')
    
    useEffect(() => {
        const updateTime = () => {
            const now = new Date()
            setCurrentTime(`${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`)
        }
        
        updateTime()
        const interval = setInterval(updateTime, 1000)
        
        return () => clearInterval(interval)
    }, [])

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
                                    variant="outline"
                                    disabled={isCreating || !form.formState.isValid}
                                    className="flex-1 border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-900/20"
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {isCreating ? 'Creating...' : (isNewJourney ? 'Create Journey' : 'Save Changes')}
                                </Button>
                                <Button 
                                    type="button"
                                    variant="outline" 
                                    onClick={handleCancel}
                                    disabled={isCreating}
                                    className="border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
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

                {/* Minimal Action Buttons */}
                <div className="flex items-center gap-1">
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toast.info('Play functionality coming soon!')}
                        className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/20"
                    >
                        <Play className="h-4 w-4 mr-2" />
                        Start
                    </Button>
                    
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toast.info('Export functionality coming soon!')}
                        className="border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                        title="Export Journey"
                    >
                        <Download className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toast.info('Share functionality coming soon!')}
                        className="border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                        title="Share Journey"
                    >
                        <Share className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toast.info('Archive functionality coming soon!')}
                        className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/20"
                        title="Archive Journey"
                    >
                        <Archive className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Clean status bar */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                <div className="flex items-center gap-4">
                    <Badge variant="success" className="text-xs">
                        <Save className="h-3 w-3 mr-1" />
                        Active
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                        ID: {journeyId?.slice(0, 8)}...
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleEdit}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                    </Button>
                </div>
            </div>
        </div>
    )
}
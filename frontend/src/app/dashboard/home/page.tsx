// Home page - Journey management

'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import useJourneyStore from '@/stores/journey-store'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'

export default function HomePage() {
    const router = useRouter()
    
    // Get journey store methods
    const { 
        clearJourney,
        clearError,
        listFromAPI,
        loadFromAPI,
        isLoading, 
        lastError,
        id: currentJourneyId,
        name: currentJourneyName 
    } = useJourneyStore()

    // State for journey list
    const [journeyList, setJourneyList] = useState<any[]>([])
    const [isLoadingList, setIsLoadingList] = useState(false)

    // Clear any previous errors when component loads
    useEffect(() => {
        if (lastError) {
            clearError()
        }
    }, []) // Only run once on mount

    // Load journey list when component mounts
    useEffect(() => {
        loadJourneyList()
    }, [])

    // Function to load journey list
    const loadJourneyList = async () => {
        setIsLoadingList(true)
        try {
            const journeys = await listFromAPI()
            setJourneyList(journeys)
        } catch (error) {
            console.error('Failed to load journey list:', error)
        } finally {
            setIsLoadingList(false)
        }
    }

    // Function to load a specific journey (full journey data)
    const handleLoadJourney = async (journeyId: string) => {
        try {
            // Don't clear storage for existing journeys - just load the data
            await loadFromAPI(journeyId) // Load full journey data including metadata
            router.push('/dashboard/new-journey')
        } catch (error) {
            console.error('Failed to load journey:', error)
            toast.error('Failed to load journey')
        }
    }

    // Handle creating a new journey
    const handleCreateNewJourney = () => {
        // Clear only journey-related localStorage data
        localStorage.removeItem('journey-state')
        clearJourney() // Clear the store state
        console.log('🧹 Cleared journey state for new journey')
        router.push('/dashboard/new-journey')
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="space-y-6">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900">
                        Welcome to Safarys
                    </h1>
                    <p className="text-xl text-gray-600">
                        AI-Powered Journey Orchestrator
                    </p>
                </div>
                
                {/* Current Journey Info */}
                {currentJourneyId && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                            Current Journey: <strong>{currentJourneyName}</strong>
                        </p>
                    </div>
                )}

                {/* Create New Journey Button */}
                <div className="text-center">
                    <Button 
                        size="lg" 
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={handleCreateNewJourney}
                        disabled={isLoading}
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Create New Journey
                    </Button>
                </div>

                {/* Journey List */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Journeys</h2>
                    
                    {isLoadingList ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">Loading journeys...</p>
                        </div>
                    ) : journeyList.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No journeys yet. Create your first journey above!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {journeyList.map((journey) => (
                                <div 
                                    key={journey.id} 
                                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => handleLoadJourney(journey.id)}
                                >
                                    <h3 className="font-semibold text-lg mb-2">{journey.name}</h3>
                                    <p className="text-gray-600 text-sm mb-3">{journey.description}</p>
                                    <div className="flex justify-between items-center text-xs text-gray-500">
                                        <span>Created: {new Date(journey.created_at).toLocaleDateString()}</span>
                                        <span className={`px-2 py-1 rounded ${
                                            journey.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {journey.is_published ? 'Published' : 'Draft'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
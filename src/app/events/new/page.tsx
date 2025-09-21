'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { EventForm } from '@/components/events/EventForm'
import { CreateEventRequest, UpdateEventRequest } from '@/types/events'
import { SponsorWithTier } from '@/types/database'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Calendar, Plus } from 'lucide-react'
import Link from 'next/link'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

function NewEventContent() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submissionInProgress, setSubmissionInProgress] = useState(false)
  const [lastSubmissionData, setLastSubmissionData] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const submissionInProgressRef = useRef(false)
  const [availableSponsors, setAvailableSponsors] = useState<SponsorWithTier[]>([])
  const [loadingSponsors, setLoadingSponsors] = useState(true)

  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch available sponsors
  const fetchSponsors = async () => {
    try {
      setLoadingSponsors(true)
      const { data: sponsorsData, error: sponsorsError } = await supabase
        .from('sponsors')
        .select(`
          *,
          tier:tiers (*)
        `)
        .order('name', { ascending: true })

      if (sponsorsError) {
        console.error('Error fetching sponsors:', sponsorsError)
        return
      }

      setAvailableSponsors(sponsorsData || [])
    } catch (error) {
      console.error('Error fetching sponsors:', error)
    } finally {
      setLoadingSponsors(false)
    }
  }

  // Fetch sponsors when component mounts
  useEffect(() => {
    if (mounted) {
      fetchSponsors()
    }
  }, [mounted])

  const handleCreateEvent = async (eventData: CreateEventRequest | UpdateEventRequest) => {
    // Create a unique identifier for this submission data
    const submissionId = JSON.stringify(eventData)
    
    // Prevent duplicate submissions using ref (survives React StrictMode)
    if (submissionInProgressRef.current || isCreating) {
      return
    }

    // Prevent identical data submissions (debounce identical requests)
    if (lastSubmissionData === submissionId) {
      return
    }

    try {
      submissionInProgressRef.current = true
      setIsCreating(true)
      setSubmissionInProgress(true)
      setLastSubmissionData(submissionId)
      setError(null)
      
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': submissionId.slice(0, 32), // Use first 32 chars of JSON as request ID
        },
        body: JSON.stringify(eventData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create event')
      }

      const data = await response.json()
      
      // Clear submission tracking after successful creation
      submissionInProgressRef.current = false
      setTimeout(() => setLastSubmissionData(null), 5000) // Reset after 5 seconds
      
      // Redirect to the events list page or to the new event's detail page
      router.push('/events')
      // Optionally, you could redirect to the new event's page:
      // router.push(`/events/${data.event.id}`)
      
    } catch (err) {
      console.error('Error creating event:', err)
      setError(err instanceof Error ? err.message : 'Failed to create event')
      submissionInProgressRef.current = false // Reset on error so user can retry
      setSubmissionInProgress(false) // Reset on error so user can retry
    } finally {
      setIsCreating(false)
    }
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
          <span className="text-lg text-gray-600">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link 
            href="/events"
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back to Events
          </Link>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Plus className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
            <p className="text-gray-600 mt-1">
              Set up a new event and manage sponsor partnerships
            </p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error Creating Event
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {error}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Form */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <EventForm
            onSubmit={handleCreateEvent}
            onCancel={() => router.push('/events')}
            isLoading={isCreating}
            mode="create"
            availableSponsors={availableSponsors}
            loadingSponsors={loadingSponsors}
          />
        </div>
      </div>

      {/* Form Tips */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
          <Calendar className="w-4 h-4 mr-2" />
          Event Creation Tips
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Choose a clear, descriptive title that sponsors and attendees will understand</li>
          <li>• Set the event date carefully - this helps with planning and sponsor coordination</li>
          <li>• Add detailed information to help sponsors understand the event scope and audience</li>
          <li>• You can add sponsors to the event now or manage them later from the event details page</li>
        </ul>
      </div>
    </div>
  )
}

export default function NewEventPage() {
  return (
    <ProtectedRoute requiredPermission="sponsorship_chair">
      <NewEventContent />
    </ProtectedRoute>
  )
}

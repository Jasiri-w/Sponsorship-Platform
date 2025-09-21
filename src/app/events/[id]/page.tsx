'use client'

import { useState, useEffect, use, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { EventWithSponsors, UpdateEventRequest } from '@/types/events'
import { SponsorWithTier } from '@/types/database'
import { EventForm } from '@/components/events/EventForm'
import { formatDateWithWeekday, getEventStatus } from '@/lib/dateUtils'
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  Edit3, 
  Trash2, 
  UserPlus, 
  UserMinus,
  Loader2,
  ExternalLink 
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { supabase } from '@/lib/supabase'

interface EventPageProps {
  params: Promise<{ id: string }>
}

function EventDetailContent({ params }: EventPageProps) {
  const router = useRouter()
  const resolvedParams = use(params)
  const { canEdit: canEditContent } = useAuth()
  const [event, setEvent] = useState<EventWithSponsors | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [availableSponsors, setAvailableSponsors] = useState<SponsorWithTier[]>([])
  const [loadingSponsors, setLoadingSponsors] = useState(false)

  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch event details using direct Supabase query
  const fetchEvent = useCallback(async () => {
    if (!mounted || !resolvedParams?.id) return
    
    try {
      setLoading(true)
      setError(null)
      
      // Fetch event with sponsors using direct Supabase query
      const { data: eventData, error } = await supabase
        .from('events')
        .select(`
          *,
          event_sponsors(
            sponsor_id,
            sponsors(
              id,
              name,
              logo_url,
              tier_id,
              tiers:tier_id(
                id,
                name,
                amount
              )
            )
          )
        `)
        .eq('id', resolvedParams.id)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Event not found')
        }
        throw error
      }
      
      // Transform data to match EventWithSponsors interface
      const eventWithSponsors = {
        ...eventData,
        sponsors: eventData.event_sponsors?.map((es: any) => ({
          id: es.sponsors.id,
          name: es.sponsors.name,
          tier: es.sponsors.tiers || null,
          logo_url: es.sponsors.logo_url
        })) || []
      }
      
      setEvent(eventWithSponsors)
    } catch (err) {
      console.error('Error fetching event:', err)
      setError(err instanceof Error ? err.message : 'Failed to load event')
    } finally {
      setLoading(false)
    }
  }, [mounted, resolvedParams?.id])

  useEffect(() => {
    fetchEvent()
  }, [fetchEvent])

  const handleUpdateEvent = async (eventData: UpdateEventRequest) => {
    try {
      setIsUpdating(true)
      setError(null)
      
      // For now, just update basic event fields
      // TODO: Handle sponsor relationships in a separate implementation
      const { data: updatedEvent, error } = await supabase
        .from('events')
        .update({
          title: eventData.title,
          date: eventData.date,
          details: eventData.details
        })
        .eq('id', resolvedParams.id)
        .select(`
          *,
          event_sponsors(
            sponsor_id,
            sponsors(
              id,
              name,
              logo_url,
              tier_id,
              tiers:tier_id(
                id,
                name,
                amount
              )
            )
          )
        `)
        .single()
      
      if (error) {
        throw error
      }
      
      // Transform data to match EventWithSponsors interface
      const eventWithSponsors = {
        ...updatedEvent,
        sponsors: updatedEvent.event_sponsors?.map((es: any) => ({
          id: es.sponsors.id,
          name: es.sponsors.name,
          tier: es.sponsors.tiers || null,
          logo_url: es.sponsors.logo_url
        })) || []
      }
      
      setEvent(eventWithSponsors)
      setIsEditing(false)
    } catch (err) {
      console.error('Error updating event:', err)
      setError(err instanceof Error ? err.message : 'Failed to update event')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteEvent = async () => {
    if (!event || !window.confirm(
      `Are you sure you want to delete "${event.title}"? This action cannot be undone.`
    )) {
      return
    }

    try {
      setIsDeleting(true)
      setError(null)
      
      // Delete event using direct Supabase delete
      // Note: event_sponsors will be deleted automatically if there's a CASCADE constraint
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', resolvedParams.id)
      
      if (error) {
        throw error
      }

      router.push('/events')
    } catch (err) {
      console.error('Error deleting event:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete event')
    } finally {
      setIsDeleting(false)
    }
  }

  // Fetch available sponsors using direct Supabase query
  const fetchAvailableSponsors = async () => {
    try {
      setLoadingSponsors(true)
      
      const { data: sponsorsData, error } = await supabase
        .from('sponsors')
        .select(`
          *,
          tier:tiers (*)
        `)
        .order('name', { ascending: true })
      
      if (error) {
        throw error
      }
      
      setAvailableSponsors(sponsorsData || [])
    } catch (err) {
      console.error('Error fetching sponsors:', err)
    } finally {
      setLoadingSponsors(false)
    }
  }

  // Fetch sponsors when editing
  useEffect(() => {
    if (isEditing) {
      fetchAvailableSponsors()
    }
  }, [isEditing])

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary mr-3" />
          <span className="text-lg text-gray-600">Loading...</span>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary mr-3" />
          <span className="text-lg text-gray-600">Loading event...</span>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            {error || 'Event not found'}
          </h2>
          <p className="text-red-700 mb-4">
            {error === 'Event not found' 
              ? 'The event you\'re looking for doesn\'t exist or may have been deleted.'
              : error
            }
          </p>
          <Link href="/events" className="btn-primary">
            Back to Events
          </Link>
        </div>
      </div>
    )
  }

  const eventStatus = getEventStatus(event.date)

  if (isEditing) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button 
              onClick={() => setIsEditing(false)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              Cancel Editing
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Edit3 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Event</h1>
              <p className="text-gray-600 mt-1">Update event details and manage sponsors</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <EventForm
              event={event}
              onSubmit={handleUpdateEvent}
              onCancel={() => setIsEditing(false)}
              isLoading={isUpdating}
              mode="edit"
              availableSponsors={availableSponsors}
              loadingSponsors={loadingSponsors}
            />
          </div>
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
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <Calendar className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
              <div className="flex items-center gap-4 text-gray-600">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDateWithWeekday(event.date)}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${eventStatus.color}`}>
                  {eventStatus.label}
                </span>
              </div>
            </div>
          </div>
          
          {canEditContent() && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="btn-secondary flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={handleDeleteEvent}
                disabled={isDeleting}
                className="btn-danger flex items-center gap-2"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Details */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Details</h2>
            {event.details ? (
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{event.details}</p>
              </div>
            ) : (
              <p className="text-gray-500 italic">No additional details provided.</p>
            )}
          </div>

          {/* Sponsors Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Event Sponsors ({event.sponsors?.length || 0})
              </h2>
            </div>
            
            {event.sponsors && event.sponsors.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {event.sponsors.map((sponsor) => (
                  <div key={sponsor.id} className="flex items-center p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{sponsor.name}</h3>
                      <p className="text-sm text-gray-500">{sponsor.tier?.name || 'No tier'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No sponsors yet</h3>
                <p className="text-gray-500 mb-4">
                  Add sponsors to this event to track partnerships and collaborations.
                </p>
                {canEditContent() && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-primary flex items-center gap-2 mx-auto"
                  >
                    <UserPlus className="w-4 h-4" />
                    Add Sponsors
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3 text-gray-800">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Sponsors:</span>
                <span className="font-medium">{event.sponsors?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Event Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${eventStatus.color}`}>
                  {eventStatus.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="font-medium">
                  {event.created_at 
                    ? new Date(event.created_at).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          {canEditContent() && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full btn-secondary flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Event
                </button>
                <button
                  onClick={handleDeleteEvent}
                  disabled={isDeleting}
                  className="w-full btn-danger flex items-center gap-2"
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Delete Event
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function EventPage({ params }: EventPageProps) {
  return (
    <ProtectedRoute requiredPermission="approved">
      <EventDetailContent params={params} />
    </ProtectedRoute>
  )
}

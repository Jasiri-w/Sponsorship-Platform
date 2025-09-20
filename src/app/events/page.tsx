'use client'

import { useState, useEffect } from 'react'
import { EventWithSponsors, EventFilters } from '@/types/events'
import { EventCard } from '@/components/events/EventCard'
import { EventFiltersComponent } from '@/components/events/EventFilters'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Plus, Calendar, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

function EventsContent() {
  const [events, setEvents] = useState<EventWithSponsors[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<EventFilters>({})
  const [totalEvents, setTotalEvents] = useState(0)
  const [mounted, setMounted] = useState(false)
  const { canEdit: canEditContent } = useAuth()
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    event: EventWithSponsors | null
    isDeleting: boolean
  }>({ isOpen: false, event: null, isDeleting: false })

  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch events with filters using direct Supabase query
  const fetchEvents = async (currentFilters: EventFilters = filters) => {
    if (!mounted) return
    
    try {
      setLoading(true)
      setError(null)
      
      // Build the query
      let query = supabase
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
      
      // Apply search filter
      if (currentFilters.search) {
        query = query.or(`title.ilike.%${currentFilters.search}%,details.ilike.%${currentFilters.search}%`)
      }
      
      // Apply date filters
      if (currentFilters.date_from) {
        query = query.gte('date', currentFilters.date_from)
      }
      if (currentFilters.date_to) {
        query = query.lte('date', currentFilters.date_to)
      }
      
      // Execute query
      const { data: eventsData, error } = await query
        .order('date', { ascending: false })
      
      if (error) {
        throw error
      }
      
      // Transform data to match EventWithSponsors interface
      const eventsWithSponsors = eventsData?.map((event: any) => ({
        ...event,
        sponsors: event.event_sponsors?.map((es: any) => ({
          id: es.sponsors.id,
          name: es.sponsors.name,
          tier: es.sponsors.tiers || null,
          logo_url: es.sponsors.logo_url
        })) || []
      })) || []
      
      setEvents(eventsWithSponsors)
      setTotalEvents(eventsWithSponsors.length)
      
    } catch (err) {
      console.error('Error fetching events:', err)
      setError(err instanceof Error ? err.message : 'Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    if (mounted) {
      fetchEvents()
    }
  }, [mounted])

  // Fetch when filters change
  useEffect(() => {
    if (mounted && (Object.keys(filters).length > 0 || events.length > 0)) {
      fetchEvents(filters)
    }
  }, [filters, mounted])

  const handleFiltersChange = (newFilters: EventFilters) => {
    setFilters(newFilters)
  }

  const handleClearFilters = () => {
    setFilters({})
  }

  const handleEventUpdate = (updatedEvent: EventWithSponsors) => {
    setEvents(prev => 
      prev.map(event => 
        event.id === updatedEvent.id ? updatedEvent : event
      )
    )
  }

  const handleDeleteClick = (event: EventWithSponsors) => {
    setDeleteDialog({ isOpen: true, event, isDeleting: false })
  }

  const handleConfirmDelete = async () => {
    if (!deleteDialog.event) return

    try {
      setDeleteDialog(prev => ({ ...prev, isDeleting: true }))
      
      const response = await fetch(`/api/events/${deleteDialog.event.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete event')
      }

      // Remove event from UI after successful deletion
      setEvents(prev => prev.filter(event => event.id !== deleteDialog.event!.id))
      setTotalEvents(prev => prev - 1)
      
      // Close dialog
      setDeleteDialog({ isOpen: false, event: null, isDeleting: false })
      
    } catch (error) {
      console.error('Error deleting event:', error)
      // Reset deleting state but keep dialog open to show error
      setDeleteDialog(prev => ({ ...prev, isDeleting: false }))
      // You might want to add error state/notification here
    }
  }

  const handleCancelDelete = () => {
    if (deleteDialog.isDeleting) return // Prevent closing during deletion
    setDeleteDialog({ isOpen: false, event: null, isDeleting: false })
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary mr-3" />
          <span className="text-lg text-gray-600">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="w-8 h-8" />
            Events
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your events and track sponsor partnerships
          </p>
          {totalEvents > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              Showing {events.length} of {totalEvents} events
            </p>
          )}
        </div>
        
        {canEditContent && (
          <Link href="/events/new" className="btn-primary flex items-center gap-2">
            <Plus className="w-4 w-4" />
            Add Event
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <EventFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              Error Loading Events
            </h2>
            <p className="text-red-700 mb-4">{error}</p>
            <button 
              onClick={() => fetchEvents()}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mr-3" />
            <span className="text-lg text-gray-600">Loading events...</span>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              {Object.keys(filters).length > 0 ? 'No events match your filters' : 'No events yet'}
            </h2>
            <p className="text-gray-500 mb-6">
              {Object.keys(filters).length > 0 
                ? 'Try adjusting your search criteria or clear filters to see all events.'
                : 'Get started by creating your first event to track sponsors and partnerships.'
              }
            </p>
            {Object.keys(filters).length > 0 ? (
              <button 
                onClick={handleClearFilters}
                className="btn-secondary mr-3"
              >
                Clear Filters
              </button>
            ) : null}
            {canEditContent && (
              <Link href="/events/new" className="btn-primary">
                Create Your First Event
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onEdit={canEditContent ? (event) => {
                  // Navigate to edit page
                  window.location.href = `/events/${event.id}`
                } : undefined}
                onDelete={canEditContent ? handleDeleteClick : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        title="Delete Event"
        message={`Are you sure you want to delete "${deleteDialog.event?.title}"? This action cannot be undone and will also remove all sponsor associations with this event.`}
        confirmText="Delete Event"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteDialog.isDeleting}
      />
    </div>
  )
}

export default function EventsPage() {
  return (
    <ProtectedRoute requiredPermission="approved">
      <EventsContent />
    </ProtectedRoute>
  )
}

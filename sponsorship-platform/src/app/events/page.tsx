'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Calendar as CalendarIcon } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import EventCard from '@/components/ui/EventCard'
import SearchBar from '@/components/ui/SearchBar'
import FilterDropdown from '@/components/ui/FilterDropdown'
import { createClient } from '@/utils/supabase/client'
import type { Event } from '@/types/database.types'

interface EventsWithSponsors extends Event {
  event_sponsors?: Array<{
    id: string;
    sponsors?: {
      id: string;
      name: string;
      logo_url?: string;
      fulfilled: boolean;
    };
  }>;
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventsWithSponsors[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [sponsorFilter, setSponsorFilter] = useState('')
  const [userRole, setUserRole] = useState<string>('')
  const router = useRouter()
  const supabase = createClient()

  // Fetch events and user profile
  useEffect(() => {
    async function fetchData() {
      try {
        // Check authentication
        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError || !userData?.user) {
          router.push('/login')
          return
        }

        // Get user profile for role
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('user_id', userData.user.id)
          .single()
        
        setUserRole(profile?.role || 'user')

        // Fetch events with sponsors
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select(`
            *,
            event_sponsors (
              id,
              sponsors (
                id,
                name,
                logo_url,
                fulfilled
              )
            )
          `)
          .order('date', { ascending: false })

        if (eventsError) {
          throw eventsError
        }

        setEvents(eventsData || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter events based on search and filters
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.details?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const eventDate = new Date(event.date)
    const now = new Date()
    const matchesDate = !dateFilter || 
                       (dateFilter === 'upcoming' && eventDate > now) ||
                       (dateFilter === 'past' && eventDate <= now)
    
    const matchesSponsor = !sponsorFilter || 
                          (sponsorFilter === 'with-sponsors' && event.event_sponsors && event.event_sponsors.length > 0) ||
                          (sponsorFilter === 'no-sponsors' && (!event.event_sponsors || event.event_sponsors.length === 0))
    
    return matchesSearch && matchesDate && matchesSponsor
  })

  const dateOptions = [
    { value: 'upcoming', label: 'Upcoming Events' },
    { value: 'past', label: 'Past Events' }
  ]

  const sponsorOptions = [
    { value: 'with-sponsors', label: 'With Sponsors' },
    { value: 'no-sponsors', label: 'No Sponsors' }
  ]

  const isManagerOrAdmin = userRole === 'manager' || userRole === 'admin'

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <PageHeader 
          title="Events" 
          description="Manage events and view their associated sponsors"
        />
        {isManagerOrAdmin && (
          <button
            onClick={() => router.push('/events/add')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Event
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="md:col-span-2">
          <SearchBar
            placeholder="Search events by title or description..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>
        <FilterDropdown
          label="Filter by Date"
          value={dateFilter}
          onChange={setDateFilter}
          options={dateOptions}
        />
        <FilterDropdown
          label="Filter by Sponsors"
          value={sponsorFilter}
          onChange={setSponsorFilter}
          options={sponsorOptions}
        />
      </div>

      {/* Results Summary */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {filteredEvents.length} of {events.length} events
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="dashboard-card border-l-4 border-red-500 bg-red-50 mb-6">
          <div className="flex items-center">
            <div className="ml-3">
              <h3 className="text-red-800 font-semibold">Error Loading Events</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Events Grid */}
      {!error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <EventCard 
                key={event.id} 
                event={event}
                showSponsors={true}
                userRole={userRole}
                onViewMore={() => router.push(`/event/${event.id}`)}
                onEdit={() => router.push(`/events/edit/${event.id}`)}
              />
            ))
          ) : searchTerm || dateFilter || sponsorFilter ? (
            <div className="col-span-full dashboard-card text-center py-12">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No events match your filters</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search terms or filters to find events.
              </p>
              <button 
                onClick={() => {
                  setSearchTerm('')
                  setDateFilter('')
                  setSponsorFilter('')
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="col-span-full dashboard-card text-center py-12">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <CalendarIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No events yet</h3>
              <p className="text-gray-600 mb-4">
                Get started by creating your first event on the platform.
              </p>
              {isManagerOrAdmin && (
                <button 
                  onClick={() => router.push('/events/add')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create First Event
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
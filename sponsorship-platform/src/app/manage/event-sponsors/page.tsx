import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { assignSponsorToEvent, removeSponsorFromEvent } from './actions'

type EventSponsorRelationship = {
  event_id: string
  sponsor_id: string
  events?: { title: string } | null
  sponsors?: { name: string } | null
}

export default async function ManageEventSponsorsPage() {
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    redirect('/login')
  }

  // Get user profile to check role and approval status
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('role, is_approved')
    .eq('user_id', userData.user.id)
    .single()

  // Check if user has manager or admin role and is approved
  if (!profile || !profile.is_approved || !['manager', 'admin'].includes(profile.role)) {
    redirect('/error')
  }

  // Fetch all events
  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true })

  if (eventsError) {
    console.error('Error fetching events:', eventsError)
    redirect('/error')
  }

  // Fetch all sponsors
  const { data: sponsors, error: sponsorsError } = await supabase
    .from('sponsors')
    .select('*')
    .order('name', { ascending: true })

  if (sponsorsError) {
    console.error('Error fetching sponsors:', sponsorsError)
    redirect('/error')
  }

  // Fetch all existing event-sponsor relationships with joins
  const { data: eventSponsors, error: eventSponsorsError } = await supabase
    .from('event_sponsors')
    .select(`
      event_id,
      sponsor_id,
      events!inner(title),
      sponsors!inner(name)
    `)
    .order('event_id', { ascending: true })

  if (eventSponsorsError) {
    console.error('Error fetching event sponsors:', eventSponsorsError)
    redirect('/error')
  }

  // Cast to proper type
  const typedEventSponsors = eventSponsors as EventSponsorRelationship[]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Manage Event-Sponsor Relationships
          </h1>
          <p className="text-gray-600">
            Assign sponsors to events and manage existing relationships.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Assign New Sponsor to Event */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Assign Sponsor to Event
            </h2>
            
            <form action={assignSponsorToEvent} className="space-y-4">
              <div>
                <label htmlFor="event_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Event
                </label>
                <select
                  id="event_id"
                  name="event_id"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose an event...</option>
                  {events?.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title} ({new Date(event.date).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="sponsor_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Sponsor
                </label>
                <select
                  id="sponsor_id"
                  name="sponsor_id"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a sponsor...</option>
                  {sponsors?.map((sponsor) => (
                    <option key={sponsor.id} value={sponsor.id}>
                      {sponsor.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              >
                Assign Sponsor to Event
              </button>
            </form>
          </div>

          {/* Current Relationships */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Current Event-Sponsor Relationships
            </h2>
            
            {typedEventSponsors && typedEventSponsors.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {typedEventSponsors.map((relationship) => (
                  <div
                    key={`${relationship.event_id}-${relationship.sponsor_id}`}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-md"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {relationship.events?.title}
                      </p>
                      <p className="text-xs text-gray-600">
                        sponsored by {relationship.sponsors?.name}
                      </p>
                    </div>
                    
                    <form action={removeSponsorFromEvent} className="ml-3">
                      <input type="hidden" name="event_id" value={relationship.event_id} />
                      <input type="hidden" name="sponsor_id" value={relationship.sponsor_id} />
                      <button
                        type="submit"
                        className="text-red-600 hover:text-red-800 text-xs font-medium px-2 py-1 border border-red-300 rounded hover:bg-red-50 transition duration-200"
                      >
                        Remove
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                No event-sponsor relationships found.
              </p>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{events?.length || 0}</p>
              <p className="text-sm text-gray-600">Total Events</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{sponsors?.length || 0}</p>
              <p className="text-sm text-gray-600">Total Sponsors</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{typedEventSponsors?.length || 0}</p>
              <p className="text-sm text-gray-600">Active Relationships</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-center">
          <a
            href="/events-sponsors"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Events & Sponsors
          </a>
        </div>
      </div>
    </div>
  )
}
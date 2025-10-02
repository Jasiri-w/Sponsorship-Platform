import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { EventSponsor } from '@/types/database.types'
import { Calendar, MapPin, Users, Edit3, CheckCircle, XCircle } from 'lucide-react'
import ContentCard from '@/components/ui/ContentCard'
import StatsCard from '@/components/ui/StatsCard'

interface EventPageProps {
  params: Promise<{ id: string }>
}

export default async function EventPage({ params }: EventPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    redirect('/login')
  }

  // Get user profile for role-based features
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('user_id', userData.user.id)
    .single()
  
  const userRole = profile?.role || 'user'
  const isManagerOrAdmin = userRole === 'manager' || userRole === 'admin'

  // Fetch specific event with all related data
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select(`
      *,
      event_sponsors (
        id,
        created_at,
        sponsors (
          id,
          name,
          logo_url,
          address,
          contact_name,
          contact_email,
          contact_phone,
          fulfilled,
          sponsorship_agreement_url,
          receipt_url,
          tiers (
            id,
            name,
            amount,
            type
          )
        )
      )
    `)
    .eq('id', id)
    .single()

  if (eventError) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="dashboard-card border-l-4 border-red-500 bg-red-50">
          <div className="flex items-center">
            <XCircle className="w-5 h-5 text-red-500 mr-3" />
            <div>
              <h3 className="text-red-800 font-semibold">Event Not Found</h3>
              <p className="text-red-700 mt-1">{eventError.message}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const sponsorCount = event.event_sponsors?.length || 0
  const fulfilledSponsors = event.event_sponsors?.filter(
    (es: EventSponsor) => es.sponsors?.fulfilled || es.sponsor?.fulfilled
  ).length || 0

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{event.title}</h1>
          <div className="flex items-center text-gray-600">
            <Calendar className="w-5 h-5 mr-2" />
            <span className="text-lg">
              {new Date(event.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>
        {isManagerOrAdmin && (
          <a
            href={`/events/edit/${event.id}`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            Edit Event
          </a>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard
          label="Total Sponsors"
          value={sponsorCount}
          icon={Users}
          iconColor="text-blue-800"
          valueColor="text-black"
        />
        <StatsCard
          label="Fulfilled Sponsors"
          value={fulfilledSponsors}
          icon={CheckCircle}
          iconColor="text-green-800"
          valueColor="text-green-800"
        />
        <StatsCard
          label="Completion Rate"
          value={`${sponsorCount > 0 ? Math.round((fulfilledSponsors / sponsorCount) * 100) : 0}%`}
          icon={MapPin}
          iconColor="text-purple-800"
          valueColor="text-purple-800"
        />
      </div>

      {/* Event Details */}
      <ContentCard title="Event Details" className="mb-6">
        <div className="prose max-w-none">
          <p className="text-gray-700 text-lg leading-relaxed">
            {event.details || 'No additional details provided for this event.'}
          </p>
        </div>
        <div className="border-t border-gray-200 pt-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="text-gray-500 font-medium">Event ID</label>
              <p className="text-gray-800 mt-1">{event.id}</p>
            </div>
            <div>
              <label className="text-gray-500 font-medium">Created</label>
              <p className="text-gray-800 mt-1">{new Date(event.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </ContentCard>

      {/* Event Sponsors */}
      <ContentCard title="Event Sponsors">
        {event.event_sponsors && event.event_sponsors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {event.event_sponsors.map((eventSponsor: EventSponsor) => {
              const sponsor = eventSponsor.sponsors || eventSponsor.sponsor
              if (!sponsor) return null

              return (
                <div key={eventSponsor.id} className="bg-gray-50 p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-start gap-4">
                    {/* Sponsor Logo */}
                    <div className="flex-shrink-0">
                      {sponsor.logo_url ? (
                        <img
                          src={sponsor.logo_url}
                          alt={`${sponsor.name} logo`}
                          className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center border-2 border-gray-200">
                          <span className="text-white font-bold text-lg">
                            {sponsor.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Sponsor Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-800 truncate">{sponsor.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ml-2 ${
                          sponsor.fulfilled 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {sponsor.fulfilled ? 'Fulfilled' : 'Pending'}
                        </span>
                      </div>

                      {/* Tier Information */}
                      {sponsor.tiers && (
                        <div className="mb-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              sponsor.tiers.type === 'Custom' 
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {sponsor.tiers.name}
                            </span>
                            <span className="text-xs text-gray-500">{sponsor.tiers.type} Tier</span>
                          </div>
                          {sponsor.tiers.amount !== undefined && (
                            <p className="text-lg font-bold text-green-600">
                              ${typeof sponsor.tiers.amount === 'number' ? sponsor.tiers.amount.toLocaleString() : sponsor.tiers.amount}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Contact Information */}
                      <div className="space-y-1 text-sm mb-4">
                        {sponsor.contact_name && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">Contact:</span>
                            <span className="text-gray-800 font-medium">{sponsor.contact_name}</span>
                          </div>
                        )}
                        {sponsor.contact_email && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">Email:</span>
                            <span className="text-gray-800">{sponsor.contact_email}</span>
                          </div>
                        )}
                      </div>

                      {/* Document Status */}
                      <div className="border-t border-gray-200 pt-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Documents:</span>
                          <div className="flex gap-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              sponsor.sponsorship_agreement_url 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {sponsor.sponsorship_agreement_url ? 'Agreement ✓' : 'Agreement ✗'}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              sponsor.receipt_url 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {sponsor.receipt_url ? 'Receipt ✓' : 'Receipt ✗'}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          Added: {new Date(eventSponsor.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="mx-auto w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No sponsors yet</h3>
            <p className="text-gray-600">This event doesn&apos;t have any sponsors associated with it yet.</p>
          </div>
        )}
      </ContentCard>
    </div>
  )
}

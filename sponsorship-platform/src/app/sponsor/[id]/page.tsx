import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Building2, Calendar, DollarSign, Users, FileText, Receipt, CheckCircle, XCircle, Edit3 } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import ContentCard from '@/components/ui/ContentCard'
import StatsCard from '@/components/ui/StatsCard'

interface Event {
  id: string
  title: string
  date: string
  details?: string | null
}

interface EventSponsor {
  id: string
  created_at: string
  events: Event | null
}

interface SponsorTier {
  id: string
  name: string
  amount: string
  type: string
  created_at: string
}

interface Sponsor {
  id: string
  name: string
  contact_name?: string | null
  contact_email?: string | null
  contact_phone?: string | null
  address?: string | null
  logo_url?: string | null
  sponsorship_agreement_url?: string | null
  receipt_url?: string | null
  fulfilled: boolean
  created_at: string
  updated_at?: string | null
  tiers?: SponsorTier | null
  event_sponsors?: EventSponsor[]
}

interface SponsorPageProps {
  params: { id: string }
}

export default async function SponsorPage({ params }: SponsorPageProps) {
  const { id } = params
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

  // Fetch specific sponsor with all related data
  const { data: sponsor, error: sponsorError } = await supabase
    .from('sponsors')
    .select(`
      *,
      tiers (
        id,
        name,
        amount,
        type,
        created_at
      ),
      event_sponsors (
        id,
        created_at,
        events (
          id,
          title,
          date,
          details
        )
      )
    `)
    .eq('id', id)
    .single()

  if (sponsorError) {
    return (
      <div className="max-w-4xl mx-auto">
        <PageHeader 
          title="Sponsor Not Found" 
          description="Unable to load sponsor details"
        />
        <div className="dashboard-card border-l-4 border-red-500 bg-red-50">
          <div className="flex items-center">
            <XCircle className="w-5 h-5 text-red-500 mr-3" />
            <div>
              <h3 className="text-red-800 font-semibold">Error Loading Sponsor</h3>
              <p className="text-red-700 mt-1">{sponsorError.message}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-6">
          {sponsor.logo_url ? (
            <div className="h-20 w-20 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
              <img
                src={sponsor.logo_url}
                alt={`${sponsor.name} logo`}
                className="max-h-full max-w-full object-contain rounded"
              />
            </div>
          ) : (
            <div className="h-20 w-20 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {sponsor.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-3xl font-bold text-gray-800">{sponsor.name}</h1>
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                sponsor.fulfilled 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {sponsor.fulfilled ? 'Fulfilled' : 'Pending'}
              </span>
            </div>
            <p className="text-gray-600">
              Detailed information and statistics for this sponsor
            </p>
          </div>
        </div>
        {isManagerOrAdmin && (
          <a
            href={`/sponsors/edit/${sponsor.id}`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            Edit Sponsor
          </a>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <StatsCard
          label="Events Sponsored"
          value={sponsor.event_sponsors?.length || 0}
          icon={Calendar}
          iconColor="text-blue-800"
          valueColor="text-black"
        />
        <StatsCard
          label="Sponsorship Amount"
          value={sponsor.tiers?.amount ? `$${parseFloat(sponsor.tiers.amount).toLocaleString()}` : 'N/A'}
          icon={DollarSign}
          iconColor="text-green-800"
          valueColor="text-green-800"
        />
        <StatsCard
          label="Tier Level"
          value={sponsor.tiers?.name || 'N/A'}
          icon={Building2}
          iconColor="text-purple-800"
          valueColor="text-black"
        />
        <StatsCard
          label="Status"
          value={sponsor.fulfilled ? 'Fulfilled' : 'Pending'}
          icon={sponsor.fulfilled ? CheckCircle : XCircle}
          iconColor={sponsor.fulfilled ? 'text-green-800' : 'text-yellow-800'}
          valueColor={sponsor.fulfilled ? 'text-green-800' : 'text-yellow-800'}
        />
      </div>

      {/* Tier Information */}
      {sponsor.tiers && (
        <ContentCard title="Sponsorship Tier" className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-1">{sponsor.tiers.name}</h3>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                sponsor.tiers.type === 'Custom' 
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {sponsor.tiers.type} Tier
              </span>
            </div>
            {sponsor.tiers.amount && (
              <div className="text-3xl font-bold text-green-600">
                ${parseFloat(sponsor.tiers.amount).toLocaleString()}
              </div>
            )}
          </div>
        </ContentCard>
      )}

      {/* Contact Information */}
      <ContentCard title="Contact Information" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">Contact Name</label>
              <p className="text-gray-800 mt-1">{sponsor.contact_name || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Email Address</label>
              <p className="text-gray-800 mt-1 break-all">{sponsor.contact_email || 'Not provided'}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">Phone Number</label>
              <p className="text-gray-800 mt-1">{sponsor.contact_phone || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Address</label>
              <p className="text-gray-800 mt-1">{sponsor.address || 'Not provided'}</p>
            </div>
          </div>
        </div>
      </ContentCard>

      {/* Documents */}
      <ContentCard title="Documents" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-4 rounded-lg border-2 ${
            sponsor.sponsorship_agreement_url 
              ? 'border-green-200 bg-green-50' 
              : 'border-red-200 bg-red-50'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              {sponsor.sponsorship_agreement_url ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <h3 className="font-semibold text-gray-800">Sponsorship Agreement</h3>
            </div>
            <p className={`text-sm ${
              sponsor.sponsorship_agreement_url ? 'text-green-700' : 'text-red-700'
            }`}>
              {sponsor.sponsorship_agreement_url 
                ? 'Document uploaded and available'
                : 'Document missing or not uploaded'
              }
            </p>
          </div>

          <div className={`p-4 rounded-lg border-2 ${
            sponsor.receipt_url 
              ? 'border-green-200 bg-green-50' 
              : 'border-red-200 bg-red-50'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              {sponsor.receipt_url ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <h3 className="font-semibold text-gray-800">Receipt</h3>
            </div>
            <p className={`${sponsor.receipt_url ? 'text-green-700' : 'text-red-700'}`}>
              {sponsor.receipt_url 
                ? 'Receipt uploaded and available'
                : 'Receipt missing or not uploaded'
              }
            </p>
          </div>
        </div>
      </ContentCard>

      {/* Events Sponsored */}
      <ContentCard title="Events Sponsored" className="mb-6">
        {sponsor.event_sponsors && sponsor.event_sponsors.length > 0 ? (
          <div className="space-y-4">
            {(sponsor.event_sponsors || []).map((eventSponsor: EventSponsor) => {
              const event = eventSponsor.events;
              if (!event) return null;

              return (
                <div key={eventSponsor.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(event.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3">
                    {event.details || 'No additional details provided.'}
                  </p>
                  
                  <div className="text-xs text-gray-500 border-t border-gray-200 pt-2">
                    Sponsorship Added: {new Date(eventSponsor.created_at).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="mx-auto w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-600">This sponsor is not currently associated with any events.</p>
          </div>
        )}
      </ContentCard>

      {/* Metadata */}
      <ContentCard title="Details">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <label className="text-gray-500 font-medium">Sponsor ID</label>
            <p className="text-gray-800 mt-1">{sponsor.id}</p>
          </div>
          <div>
            <label className="text-gray-500 font-medium">Created</label>
            <p className="text-gray-800 mt-1">{new Date(sponsor.created_at).toLocaleDateString()}</p>
          </div>
          {sponsor.updated_at && (
            <div>
              <label className="text-gray-500 font-medium">Updated</label>
              <p className="text-gray-800 mt-1">{new Date(sponsor.updated_at).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </ContentCard>
    </div>
  )
}
import { DollarSign, Building2, Calendar, Link2, Plus } from "lucide-react";
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Image from 'next/image';

export default async function DashboardPage() {
  const supabase = await createClient();

  // Check if user is authenticated
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect('/login');
  }

  // Fetch all events with their sponsors
  const { data: eventsData } = await supabase
    .from('events')
    .select(`
      *,
      event_sponsors (
        id,
        sponsors (
          id,
          name,
          fulfilled,
          tiers (
            id,
            amount
          )
        )
      )
    `)
    .order('date', { ascending: false });

  // Fetch all sponsors with their tiers
  const { data: sponsorsData } = await supabase
    .from('sponsors')
    .select(`
      *,
      tiers (
        id,
        amount
      )
    `);

  // Calculate statistics
  const totalSponsors = sponsorsData?.length || 0;
  const totalEvents = eventsData?.length || 0;
  const totalSponsorship = sponsorsData?.reduce((sum, sponsor) => {
    const amount = sponsor.tiers?.amount || 0;
    return sum + (amount || 0);
  }, 0) || 0;
  const fulfilledSponsors = sponsorsData?.filter(s => s.fulfilled).length || 0;

  // Get user profile for role-based features
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();
  
  const userRole = profile?.role || 'user';
  const isManagerOrAdmin = userRole === 'manager' || userRole === 'admin';

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/nsbe_logo.png"
              alt="Logo"
              width={60}
              height={60}
            /> 
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your sponsors and events...
              </p>
            </div>
          </div>
          {isManagerOrAdmin && (
            <div className="flex items-center gap-3 text-white">
              <a
                href="/sponsors/add"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Sponsor
              </a>
              <a
                href="/events/add"
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Event
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="dashboard-card">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-green-100">
              <DollarSign className="w-6 h-6 text-green-800" />
            </div>
            <div className="ml-4">
              <p className="text-lg font-medium text-gray-800">Total Sponsorship</p>
              <p className="text-2xl font-bold text-green-800">${totalSponsorship.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="dashboard-card">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-blue-100">
              <Building2 className="w-6 h-6 text-blue-800" />
            </div>
            <div className="ml-4">
              <p className="text-lg font-medium text-gray-800">Active Sponsors</p>
              <p className="text-2xl font-bold text-black">{totalSponsors}</p>
            </div>
          </div>
        </div>
        <div className="dashboard-card">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-purple-100">
              <Link2 className="w-6 h-6 text-purple-800" />
            </div>
            <div className="ml-4">
              <p className="text-lg font-medium text-gray-800">Fulfilled</p>
              <p className="text-2xl font-bold text-black">
                {fulfilledSponsors}/{totalSponsors || 1} ({totalSponsors ? Math.round((fulfilledSponsors / totalSponsors) * 100) : 0}%)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Jump back in */}
      <div className="dashboard-card">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Jump back in!</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/sponsors"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-blue-100 rounded">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="font-medium text-gray-800">View Sponsors</p>
              <p className="text-sm text-gray-600">Browse all sponsors</p>
            </div>
          </a>

          <a
            href="/events"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-green-100 rounded">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v16a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="font-medium text-gray-800">View Events</p>
              <p className="text-sm text-gray-600">Browse all events</p>
            </div>
          </a>

          <a
            href="/sponsors/add"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-yellow-100 rounded">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="font-medium text-gray-800">Add Sponsor</p>
              <p className="text-sm text-gray-600">Create new sponsor</p>
            </div>
          </a>

          <a
            href="/events/add"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-purple-100 rounded">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="font-medium text-gray-800">Add Event</p>
              <p className="text-sm text-gray-600">Create new event</p>
            </div>
          </a>
        </div>
      </div>

      {/* Recent Data */}
      <div className="flex flex-col gap-6 md:flex-row md:w-full">
        {/* Recent Sponsors */}
        <div className="mt-8 dashboard-card p-6 flex-1">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Recent Sponsors</h2>
            <a href="/sponsors" className="text-sm text-blue-600 hover:underline">View All</a>
          </div>
          
          {sponsorsData && sponsorsData.length > 0 ? (
            <div className="space-y-4">
              {sponsorsData.slice(0, 5).map((sponsor) => (
                <div key={sponsor.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    {sponsor.logo_url ? (
                      <img 
                        src={sponsor.logo_url} 
                        alt={sponsor.name}
                        className="w-10 h-10 rounded-full object-cover mr-3"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium mr-3">
                        {sponsor.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium text-gray-800">{sponsor.name}</h3>
                      <p className="text-sm text-gray-500">
                        ${sponsor.tiers?.amount?.toLocaleString() || '0'} • 
                        <span className={`ml-1 ${sponsor.fulfilled ? 'text-green-600' : 'text-yellow-600'}`}>
                          {sponsor.fulfilled ? 'Fulfilled' : 'Pending'}
                        </span>
                      </p>
                    </div>
                  </div>
                  <a 
                    href={`/sponsor/${sponsor.id}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-800">No sponsors yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding your first sponsor.
              </p>
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="mt-8 dashboard-card p-6 flex-1">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Upcoming Events</h2>
            <a href="/events" className="text-sm text-blue-600 hover:underline">View All</a>
          </div>
          
          {eventsData && eventsData.length > 0 ? (
            <div className="space-y-4">
              {eventsData.slice(0, 5).map((event) => (
                <div key={event.id} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium text-gray-800">{event.title}</h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Calendar className="w-4 h-4 mr-1.5" />
                        {new Date(event.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-800">
                        {event.event_sponsors?.length || 0} sponsors
                      </div>
                      <a 
                        href={`/event/${event.id}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-800">No events yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Create your first event to get started.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
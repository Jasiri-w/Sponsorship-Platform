'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Calendar, DollarSign, Users, CheckCircle, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { SponsorWithTier, Event } from '@/types/database'
import { formatDate } from '@/lib/dateUtils'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

function DashboardContent() {
  const [sponsors, setSponsors] = useState<SponsorWithTier[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [totalSponsorship, setTotalSponsorship] = useState(0)
  const [loading, setLoading] = useState(true)
  const { canEdit: canEditContent } = useAuth()

  const fetchDashboardData = useCallback(async () => {
    try {
      // Fetch sponsors with their tier information
      const { data: sponsorsData, error: sponsorsError } = await supabase
        .from('sponsors')
        .select(`
          *,
          tier:tiers (*)
        `)
        .order('created_at', { ascending: false })

      if (sponsorsError) throw sponsorsError

      // Fetch recent events with sponsors
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select(`
          *,
          event_sponsors (
            sponsor:sponsors (
              id,
              name,
              logo_url
            )
          )
        `)
        .order('date', { ascending: false })
        .limit(sponsors.length > 5 ? sponsors.length : 5)

      if (eventsError) throw eventsError

      // Calculate total sponsorship amount
      const { data: allSponsors, error: totalError } = await supabase
        .from('sponsors')
        .select(`
          tier:tiers (amount)
        `)

      if (totalError) throw totalError

      const total = allSponsors?.reduce((sum: number, sponsor: { tier: { amount: number } | null }) => {
        return sum + (sponsor.tier?.amount || 0)
      }, 0) || 0

      setSponsors(sponsorsData || [])
      setEvents(eventsData || [])
      setTotalSponsorship(total)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [sponsors.length])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const getTierBadgeClass = (tierName: string) => {
    const name = tierName.toLowerCase()
    if (name.includes('bronze')) return 'tier-bronze'
    if (name.includes('silver')) return 'tier-silver'
    if (name.includes('gold')) return 'tier-gold'
    if (name.includes('quartz')) return 'tier-quartz'
    if (name.includes('emerald')) return 'tier-emerald'
    if (name.includes('diamond')) return 'tier-diamond'
    return 'tier-badge bg-gray-100 text-gray-800'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card">
              <div className="h-6 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-32"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Image 
            src="/images/logo.png"
            alt="Sponsorship Platform Logo"
            width={64}
            height={64}
            className="object-contain"
          />
          <h1 className="heading-lg text-gray-900 font-bold">Dashboard</h1>
        </div>
        {canEditContent() && (
          <div className="flex space-x-3">
            <Link href="/sponsors/add" className="btn-primary">
              <Plus className="h-4 w-4 mr-2 inline" />
              Add Sponsor
            </Link>
            <Link href="/events/new" className="btn-secondary">
              <Calendar className="h-4 w-4 mr-2 inline" />
              Add Event
            </Link>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-salmon-600" />
            </div>
            <div className="ml-4">
              <p className="label-text text-gray-500">Total Sponsorship</p>
              <p className="heading-sm text-emerald-600">{formatCurrency(totalSponsorship)}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="label-text text-gray-500">Active Sponsors</p>
              <p className="heading-sm text-gray-900">{sponsors.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="label-text text-gray-500">Fulfilled</p>
              <p className="heading-sm text-gray-900">
                {sponsors.filter(s => s.fulfilled).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Sponsors */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h2 className="heading-xs text-gray-900">Current Sponsors</h2>
              <Link href="/sponsors" className="text-salmon-600 hover:text-salmon-700 text-sm font-medium">
                View all
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            {sponsors.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No sponsors yet</p>
                {canEditContent() && (
                  <Link href="/sponsors/add" className="text-salmon-600 hover:text-salmon-700 text-sm font-medium">
                    Add your first sponsor
                  </Link>
                )}
              </div>
            ) : (
              sponsors.map((sponsor) => (
                <Link
                  key={sponsor.id}
                  href={`/sponsors/${sponsor.id}`}
                  className="w-full"
                >
                  <div key={sponsor.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50">
                    <div className="flex-shrink-0">
                      {sponsor.logo_url ? (
                        <img
                          src={sponsor.logo_url}
                          alt={`${sponsor.name} logo`}
                          className="h-10 w-10 rounded-lg object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            const parent = target.parentElement
                            if (parent) {
                              parent.innerHTML = '<div class="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center"><svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4m-5 0v-5a2 2 0 012-2h6a2 2 0 012 2v5M7 7h.01M7 3h.01"></path></svg></div>'
                            }
                          }}
                        />
                      ) : (
                        <div className="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Users className="h-6 w-6   text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {sponsor.name}
                      </p>
                      <div className="flex items-center mt-1">
                        <span className={`tier-badge ${getTierBadgeClass(sponsor.tier?.name || '')}`}>
                          {sponsor.tier?.name}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">
                          {formatCurrency(sponsor.tier?.amount || 0)}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {sponsor.fulfilled ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h2 className="heading-xs text-gray-900">Upcoming Events</h2>
              <Link href="/events" className="text-salmon-600 hover:text-salmon-700 text-sm font-medium">
                View all
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            {events.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No events scheduled</p>
                {canEditContent() && (
                  <Link href="/events/add" className="text-salmon-600 hover:text-salmon-700 text-sm font-medium">
                    Schedule your first event
                  </Link>
                )}
              </div>
            ) : (
              events.map((event) => {
                // Extract sponsors from event_sponsors relationship
                const sponsors = (event as any).event_sponsors?.map((es: any) => es.sponsor).filter(Boolean) || [];
                
                return (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="w-full"
                  >
                    <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 bg-salmon-100 rounded-lg flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-salmon-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {event.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(event.date)}
                        </p>
                        {sponsors.length > 0 && (
                          <div className="flex items-center mt-2">
                            <span className="text-xs text-gray-500 mr-2">
                              {sponsors.length} sponsor{sponsors.length !== 1 ? 's' : ''}:
                            </span>
                            <div className="flex -space-x-1">
                              {sponsors.slice(0, 3).map((sponsor: any) => (
                                <div
                                  key={sponsor.id}
                                  className="relative w-6 h-6 rounded-full border border-white overflow-hidden bg-gray-100"
                                  title={sponsor.name}
                                >
                                  {sponsor.logo_url ? (
                                    <img
                                      src={sponsor.logo_url}
                                      alt={`${sponsor.name} logo`}
                                      className="w-full h-full object-contain"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        const parent = target.parentElement;
                                        if (parent) {
                                          parent.innerHTML = '<div class="w-full h-full bg-gray-200 rounded-full flex items-center justify-center"><span class="text-xs font-medium text-gray-500">' + sponsor.name.charAt(0).toUpperCase() + '</span></div>';
                                        }
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                                      <span className="text-xs font-medium text-primary">
                                        {sponsor.name.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ))}
                              {sponsors.length > 3 && (
                                <div className="relative w-6 h-6 rounded-full border border-white bg-gray-100 flex items-center justify-center">
                                  <span className="text-xs font-medium text-gray-600">
                                    +{sponsors.length - 3}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <ProtectedRoute requiredPermission="authenticated" redirectTo="/auth/login">
      <DashboardContent />
    </ProtectedRoute>
  )
}

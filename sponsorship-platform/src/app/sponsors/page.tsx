'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import SponsorCard from '@/components/ui/SponsorCard'
import SearchBar from '@/components/ui/SearchBar'
import FilterDropdown from '@/components/ui/FilterDropdown'
import { createClient } from '@/utils/supabase/client'
import type { Sponsor } from '@/types/database.types'

interface SponsorsWithTiers extends Sponsor {
  tiers?: {
    id: string
    name: string
    amount: number | null
    type: 'Standard' | 'Custom'
  }
}

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState<SponsorsWithTiers[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [tierFilter, setTierFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [userRole, setUserRole] = useState<string>('')
  const router = useRouter()
  const supabase = createClient()

  // Fetch sponsors and user profile
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

        // Fetch sponsors with tiers
        const { data: sponsorsData, error: sponsorsError } = await supabase
          .from('sponsors')
          .select(`
            *,
            tiers (
              id,
              name,
              amount,
              type
            )
          `)
          .order('name', { ascending: true })

        if (sponsorsError) {
          throw sponsorsError
        }

        setSponsors(sponsorsData || [])
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter sponsors based on search and filters
  const filteredSponsors = sponsors.filter(sponsor => {
    const matchesSearch = sponsor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sponsor.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sponsor.contact_email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesTier = !tierFilter || sponsor.tiers?.name === tierFilter
    const matchesStatus = !statusFilter || 
                         (statusFilter === 'fulfilled' && sponsor.fulfilled) ||
                         (statusFilter === 'pending' && !sponsor.fulfilled)
    
    return matchesSearch && matchesTier && matchesStatus
  })

  // Get unique tiers for filter
  const tierOptions = Array.from(new Set(sponsors.map(s => s.tiers?.name).filter(Boolean)))
    .map(tier => ({ value: tier!, label: tier! }))

  const statusOptions = [
    { value: 'fulfilled', label: 'Fulfilled' },
    { value: 'pending', label: 'Pending' }
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
          title="Sponsors" 
          description="Manage and view all sponsors in your sponsorship platform"
        />
        {isManagerOrAdmin && (
          <button
            onClick={() => router.push('/sponsors/add')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Sponsor
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="md:col-span-2">
          <SearchBar
            placeholder="Search sponsors by name, contact, or email..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>
        <FilterDropdown
          label="Filter by Tier"
          value={tierFilter}
          onChange={setTierFilter}
          options={tierOptions}
        />
        <FilterDropdown
          label="Filter by Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={statusOptions}
        />
      </div>

      {/* Results Summary */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {filteredSponsors.length} of {sponsors.length} sponsors
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="dashboard-card border-l-4 border-red-500 bg-red-50 mb-6">
          <div className="flex items-center">
            <div className="ml-3">
              <h3 className="text-red-800 font-semibold">Error Loading Sponsors</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Sponsors Grid */}
      {!error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSponsors.length > 0 ? (
            filteredSponsors.map((sponsor) => (
              <SponsorCard 
                key={sponsor.id} 
                sponsor={sponsor}
                showDetails={false}
                userRole={userRole}
                onViewMore={() => router.push(`/sponsor/${sponsor.id}`)}
                onEdit={() => router.push(`/sponsors/edit/${sponsor.id}`)}
              />
            ))
          ) : searchTerm || tierFilter || statusFilter ? (
            <div className="col-span-full dashboard-card text-center py-12">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No sponsors match your filters</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search terms or filters to find sponsors.
              </p>
              <button 
                onClick={() => {
                  setSearchTerm('')
                  setTierFilter('')
                  setStatusFilter('')
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="col-span-full dashboard-card text-center py-12">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No sponsors yet</h3>
              <p className="text-gray-600 mb-4">
                Get started by adding your first sponsor to the platform.
              </p>
              {isManagerOrAdmin && (
                <button 
                  onClick={() => router.push('/sponsors/add')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add First Sponsor
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
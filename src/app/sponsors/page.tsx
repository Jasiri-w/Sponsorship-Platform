'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Search, Filter, Users, Edit, Eye, CheckCircle, Clock, FileText, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { SponsorWithTier, SponsorStatus } from '@/types/database'
import { calculateSponsorStatus } from '@/types/database'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

function SponsorsContent() {
  const [sponsors, setSponsors] = useState<SponsorWithTier[]>([])
  const [filteredSponsors, setFilteredSponsors] = useState<SponsorWithTier[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | SponsorStatus>('all')
  const [loading, setLoading] = useState(true)
  const { canEdit: canEditContent } = useAuth()

  // Debounce search term
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const fetchSponsors = useCallback(async () => {
    try {
      // Fetch all sponsors with their tier information using Supabase for consistency
      const { data: sponsorsData, error } = await supabase
        .from('sponsors')
        .select(`
          *,
          tier:tiers (*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Add calculated status to each sponsor
      const sponsorsWithStatus = sponsorsData?.map((sponsor: any) => ({
        ...sponsor,
        status: calculateSponsorStatus({
          sponsorship_agreement_url: sponsor.sponsorship_agreement_url,
          receipt_url: sponsor.receipt_url,
          fulfilled: sponsor.fulfilled
        })
      })) || []
      
      // Apply client-side filtering
      let filtered = sponsorsWithStatus
      
      // Filter by search term
      if (debouncedSearchTerm) {
        filtered = filtered.filter((sponsor: any) =>
          sponsor.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          sponsor.contact_email?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          sponsor.tier?.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        )
      }

      // Filter by status
      if (statusFilter !== 'all') {
        filtered = filtered.filter((sponsor: any) =>
          sponsor.status === statusFilter
        )
      }
      
      setSponsors(sponsorsWithStatus)
      setFilteredSponsors(filtered)
    } catch (error) {
      console.error('Error fetching sponsors:', error)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearchTerm, statusFilter])

  useEffect(() => {
    fetchSponsors()
  }, [fetchSponsors])

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

  const getStatusIcon = (status: SponsorStatus) => {
    switch (status) {
      case 'Pending':
        return <Clock className="h-4 w-4" />
      case 'In Progress':
        return <FileText className="h-4 w-4" />
      case 'Completed':
        return <AlertCircle className="h-4 w-4 text-blue-500" />
      case 'Fulfilled':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: SponsorStatus) => {
    switch (status) {
      case 'Pending':
        return 'text-gray-500'
      case 'In Progress':
        return 'text-blue-500'
      case 'Completed':
        return 'text-orange-500'
      case 'Fulfilled':
        return 'text-green-500'
      default:
        return 'text-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
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
        <div>
          <h1 className="heading-lg text-gray-900">Sponsors</h1>
          <p className="subheading mt-1">Manage your sponsorship partners</p>
        </div>
        {canEditContent() && (
          <Link href="/sponsors/add" className="btn-primary">
            <Plus className="h-4 w-4 mr-2 inline" />
            Add Sponsor
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search sponsors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | SponsorStatus)}
              className="input-field w-auto"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Fulfilled">Fulfilled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{sponsors.length}</p>
            <p className="text-sm text-gray-500">Total Sponsors</p>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">{sponsors.filter((s: any) => s.status === 'Completed').length}</p>
            <p className="text-sm text-gray-500">Completed</p>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{sponsors.filter((s: any) => s.status === 'Fulfilled').length}</p>
            <p className="text-sm text-gray-500">Fulfilled</p>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <p className="text-2xl font-bold text-salmon-600">
              {formatCurrency(sponsors.reduce((sum: number, s: any) => sum + (s.tier?.amount || 0), 0))}
            </p>
            <p className="text-sm text-gray-500">Total Value</p>
          </div>
        </div>
      </div>

      {/* Sponsors Grid */}
      {filteredSponsors.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-24 w-24 mx-auto mb-6 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || statusFilter !== 'all' ? 'No sponsors found' : 'No sponsors yet'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first sponsor'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && canEditContent() && (
            <Link href="/sponsors/add" className="btn-primary">
              Add Your First Sponsor
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSponsors.map((sponsor) => (
            <div key={sponsor.id} className="sponsor-card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {sponsor.logo_url ? (
                    <Image
                      src={sponsor.logo_url}
                      alt={sponsor.name}
                      width={48}
                      height={48}
                      className="rounded-lg object-cover"
                    />
                  ) : (
                    <Users className="text-gray-400" size={48} />
                  )}
                  <div>
                    <h3 className="font-spartan-semibold text-gray-900 text-xl">{sponsor.name}</h3>
                    <div className="flex items-center mt-1">
                      <span className={`mr-1 ${getStatusColor(sponsor.status || 'Pending')}`}>
                        {getStatusIcon(sponsor.status || 'Pending')}
                      </span>
                      <span className="text-sm text-gray-500">
                        {sponsor.status || 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className={`tier-badge ${getTierBadgeClass(sponsor.tier?.name || '')}`}>
                    {sponsor.tier?.name}
                  </span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(sponsor.tier?.amount || 0)}
                  </span>
                </div>
                
                {sponsor.contact_email && (
                  <p className="text-sm text-gray-500 truncate">
                    {sponsor.contact_email}
                  </p>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <Link
                  href={`/sponsors/${sponsor.id}`}
                  className="flex items-center text-salmon-600 hover:text-salmon-700 text-sm font-medium"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Link>
                {canEditContent() && (
                  <Link
                    href={`/sponsors/${sponsor.id}/edit`}
                    className="flex items-center text-gray-600 hover:text-gray-700 text-sm font-medium"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function SponsorsPage() {
  return (
    <ProtectedRoute requiredPermission="approved">
      <SponsorsContent />
    </ProtectedRoute>
  )
}

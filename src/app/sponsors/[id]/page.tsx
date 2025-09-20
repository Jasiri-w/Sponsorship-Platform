'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Mail, Phone, User, Building, CheckCircle, Clock, ExternalLink, FileText, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { SponsorWithTier, SponsorStatus } from '@/types/database'
import { calculateSponsorStatus } from '@/types/database'
import { DocumentProgressBar } from '@/components/ui/DocumentProgressBar'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

function SponsorDetailContent() {
  const params = useParams()
  const router = useRouter()
  const sponsorId = params?.id as string
  const [sponsor, setSponsor] = useState<SponsorWithTier | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const { canEdit: canEditContent } = useAuth()

  useEffect(() => {
    if (sponsorId) {
      fetchSponsor()
    }
  }, [sponsorId])

  const fetchSponsor = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch sponsor with tier information using direct Supabase query
      const { data: sponsorData, error } = await supabase
        .from('sponsors')
        .select(`
          *,
          tier:tiers (*)
        `)
        .eq('id', sponsorId)
        .single()
      
      if (error) {
        throw error
      }
      
      if (!sponsorData) {
        throw new Error('Sponsor not found')
      }
      
      // Calculate sponsor status
      const sponsorWithStatus = {
        ...sponsorData,
        status: calculateSponsorStatus({
          sponsorship_agreement_url: sponsorData.sponsorship_agreement_url,
          receipt_url: sponsorData.receipt_url,
          fulfilled: sponsorData.fulfilled
        })
      }
      
      setSponsor(sponsorWithStatus)
    } catch (error) {
      console.error('Error fetching sponsor:', error)
      setError(error instanceof Error ? error.message : 'Failed to load sponsor information')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

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

  const getStatusIcon = (status: SponsorStatus) => {
    switch (status) {
      case 'Pending':
        return <Clock className="h-5 w-5" />
      case 'In Progress':
        return <FileText className="h-5 w-5" />
      case 'Completed':
        return <AlertCircle className="h-5 w-5" />
      case 'Fulfilled':
        return <CheckCircle className="h-5 w-5" />
      default:
        return <Clock className="h-5 w-5" />
    }
  }

  const getStatusColor = (status: SponsorStatus) => {
    switch (status) {
      case 'Pending':
        return 'text-gray-500'
      case 'In Progress':
        return 'text-blue-500'
      case 'Completed':
        return 'text-green-500'
      case 'Fulfilled':
        return 'text-green-500'
      default:
        return 'text-gray-500'
    }
  }

  const toggleFulfilled = async () => {
    if (!sponsor) return
    
    try {
      setUpdatingStatus(true)
      setError(null)
      
      // Update sponsor fulfilled status using direct Supabase update
      const { data: updatedSponsor, error } = await supabase
        .from('sponsors')
        .update({ fulfilled: !sponsor.fulfilled })
        .eq('id', sponsorId)
        .select(`
          *,
          tier:tiers (*)
        `)
        .single()
      
      if (error) {
        throw error
      }
      
      // Calculate updated status
      const sponsorWithStatus = {
        ...updatedSponsor,
        status: calculateSponsorStatus({
          sponsorship_agreement_url: updatedSponsor.sponsorship_agreement_url,
          receipt_url: updatedSponsor.receipt_url,
          fulfilled: updatedSponsor.fulfilled
        })
      }
      
      setSponsor(sponsorWithStatus)
    } catch (error) {
      console.error('Error updating sponsor status:', error)
      setError(error instanceof Error ? error.message : 'Failed to update status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="card">
                <div className="h-48 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-200 rounded w-48"></div>
                  <div className="h-4 bg-gray-200 rounded w-40"></div>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !sponsor) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button onClick={() => router.back()} className="btn-secondary">
            <ArrowLeft className="h-4 w-4 mr-2 inline" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Sponsor Not Found</h1>
        </div>
        <div className="card text-center py-12">
          <Building className="h-24 w-24 mx-auto mb-6 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sponsor Not Found</h3>
          <p className="text-gray-500 mb-6">
            {error || 'The sponsor you\'re looking for doesn\'t exist or has been removed.'}
          </p>
          <Link href="/sponsors" className="btn-primary">
            View All Sponsors
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => router.back()} className="btn-secondary">
            <ArrowLeft className="h-4 w-4 mr-2 inline" />
            Back
          </button>
          <div>
            <h1 className="heading-lg text-gray-900">{sponsor.name}</h1>
            <p className="subheading mt-1">Sponsor Details</p>
          </div>
        </div>
        {canEditContent && (
          <Link href={`/sponsors/${sponsor.id}/edit`} className="btn-primary">
            <Edit className="h-4 w-4 mr-2 inline" />
            Edit Sponsor
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Overview */}
          <div className="card">
            <h2 className="heading-sm text-gray-900 mb-6">Company Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Logo */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Company Logo</h3>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6">
                  {sponsor.logo_url ? (
                    <div className="text-center">
                      <img
                        src={sponsor.logo_url}
                        alt={`${sponsor.name} logo`}
                        className="max-w-full max-h-32 mx-auto rounded-lg object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          const parent = target.parentElement
                          if (parent) {
                            parent.innerHTML = `
                              <div class="text-center">
                                <div class="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-2">
                                  <svg class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4m-5 0v-5a2 2 0 012-2h6a2 2 0 012 2v5M7 7h.01M7 3h.01" />
                                  </svg>
                                </div>
                                <p class="text-sm text-gray-500">Logo unavailable</p>
                              </div>
                            `
                          }
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-2 break-all">{sponsor.logo_url}</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Building className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500">No logo provided</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Company Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Company Name</h3>
                  <p className="text-lg font-semibold text-gray-900">{sponsor.name}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Sponsorship Status</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={getStatusColor(sponsor.status || 'Pending')}>
                        {getStatusIcon(sponsor.status || 'Pending')}
                      </span>
                      <span className={`font-medium ${getStatusColor(sponsor.status || 'Pending')}`}>
                        {sponsor.status || 'Pending'}
                      </span>
                    </div>
                    {canEditContent && (
                      <button
                        onClick={toggleFulfilled}
                        disabled={updatingStatus}
                        className={`px-3 py-1 text-xs font-medium rounded-full transition-colors duration-200 ${
                          sponsor.fulfilled
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        } ${updatingStatus ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {updatingStatus ? 'Updating...' : (sponsor.fulfilled ? 'Mark Unfulfilled' : 'Mark Fulfilled')}
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Company Address</h3>
                  <p className="text-gray-900">
                    {sponsor.address || 'Not provided'}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Member Since</h3>
                  <p className="text-gray-900">
                    {new Date(sponsor.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Contact Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Contact Person</h3>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{sponsor.contact_name || 'Not provided'}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Email Address</h3>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    {sponsor.contact_email ? (
                      <a
                        href={`mailto:${sponsor.contact_email}`}
                        className="text-salmon-600 hover:text-salmon-700 hover:underline"
                      >
                        {sponsor.contact_email}
                      </a>
                    ) : (
                      <span className="text-gray-900">Not provided</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Phone Number</h3>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    {sponsor.contact_phone ? (
                      <a
                        href={`tel:${sponsor.contact_phone}`}
                        className="text-salmon-600 hover:text-salmon-700 hover:underline"
                      >
                        {sponsor.contact_phone}
                      </a>
                    ) : (
                      <span className="text-gray-900">Not provided</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Documents</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Sponsorship Agreement</h3>
                {sponsor.sponsorship_agreement_url ? (
                  <a
                    href={sponsor.sponsorship_agreement_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-salmon-600 hover:text-salmon-700 text-sm"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View Agreement
                  </a>
                ) : (
                  <p className="text-sm text-gray-500">Not uploaded</p>
                )}
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Payment Receipt</h3>
                {sponsor.receipt_url ? (
                  <a
                    href={sponsor.receipt_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-salmon-600 hover:text-salmon-700 text-sm"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View Receipt
                  </a>
                ) : (
                  <p className="text-sm text-gray-500">Not uploaded</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tier Information */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sponsorship Tier</h2>
            
            {sponsor.tier ? (
              <div className="space-y-4">
                <div className="text-center">
                  <span className={`tier-badge text-lg px-4 py-2 ${getTierBadgeClass(sponsor.tier.name)}`}>
                    {sponsor.tier.name}
                  </span>
                </div>

                <div className="text-center">
                  <p className="heading-md text-emerald-600">
                    {formatCurrency(sponsor.tier.amount)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Sponsorship Value</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Tier Type</h3>
                  <p className="text-gray-900">{sponsor.tier.type}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No tier assigned</p>
            )}
          </div>

          {/* Document Progress */}
          <div className="card">
            <DocumentProgressBar
              hasAgreement={!!sponsor.sponsorship_agreement_url}
              hasReceipt={!!sponsor.receipt_url}
            />
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            
            <div className="space-y-3 w-full flex flex-col">
              {canEditContent && (
                <Link href={`/sponsors/${sponsor.id}/edit`} className="btn-primary w-full">
                  <Edit className="h-4 w-4 mr-2 inline" />
                  Edit Sponsor
                </Link>
              )}
              
              {sponsor.contact_email && (
                <a
                  href={`mailto:${sponsor.contact_email}`}
                  className="btn-secondary w-full"
                >
                  <Mail className="h-4 w-4 mr-2 inline" />
                  Send Email
                </a>
              )}

              <Link href="/sponsors" className="btn-secondary w-full">
                <ArrowLeft className="h-4 w-4 mr-2 inline" />
                Back to Sponsors
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SponsorDetailPage() {
  return (
    <ProtectedRoute requiredPermission="approved">
      <SponsorDetailContent />
    </ProtectedRoute>
  )
}

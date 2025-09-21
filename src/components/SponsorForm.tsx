'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Link as LinkIcon, Save } from 'lucide-react'
import type { Sponsor, Tier } from '@/types/database'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

interface SponsorFormData {
  name: string
  tier_id: string
  contact_name: string
  contact_email: string
  contact_phone: string
  fulfilled: boolean
  address: string
  sponsorship_agreement_url: string
  receipt_url: string
}

interface SponsorFormProps {
  sponsor?: Sponsor
  isEditing?: boolean
}

export default function SponsorForm({ sponsor, isEditing = false }: SponsorFormProps) {
  const router = useRouter()
  const [tiers, setTiers] = useState<Tier[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string>(sponsor?.logo_url || '')
  const [formData, setFormData] = useState<SponsorFormData>({
    name: sponsor?.name || '',
    tier_id: sponsor?.tier_id || '',
    contact_name: sponsor?.contact_name || '',
    contact_email: sponsor?.contact_email || '',
    contact_phone: sponsor?.contact_phone || '',
    fulfilled: sponsor?.fulfilled || false,
    address: sponsor?.address || '',
    sponsorship_agreement_url: sponsor?.sponsorship_agreement_url || '',
    receipt_url: sponsor?.receipt_url || '',
  })

  useEffect(() => {
    fetchTiers()
  }, [])

  const fetchTiers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('tiers')
        .select('*')
        .order('amount', { ascending: true })

      if (error) throw error
      setTiers(data || [])
    } catch (error) {
      console.error('Error fetching tiers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleLogoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogoUrl(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return

    setSubmitting(true)

    try {
      const sponsorData = {
        ...formData,
        logo_url: logoUrl || null,
        address: formData.address || null,
        sponsorship_agreement_url: formData.sponsorship_agreement_url || null,
        receipt_url: formData.receipt_url || null,
        updated_at: new Date().toISOString(),
      }

      if (isEditing && sponsor) {
        const { error } = await supabase
          .from('sponsors')
          .update(sponsorData)
          .eq('id', sponsor.id)

        if (error) throw error
        router.push(`/sponsors/${sponsor.id}`)
      } else {
        const { error } = await supabase
          .from('sponsors')
          .insert([sponsorData])

        if (error) throw error
        router.push('/sponsors')
      }
    } catch (error) {
      console.error('Error saving sponsor:', error)
      alert('Error saving sponsor. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="heading-lg text-gray-900">
          {isEditing ? 'Edit Sponsor' : 'Add Sponsor'}
        </h1>
        <p className="subheading mt-1">
          {isEditing ? 'Update sponsor information' : 'Add a new sponsorship partner'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Company Details */}
          <div className="card">
            <h2 className="heading-xs text-gray-900 mb-4">Company Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block label-text mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sponsorship Tier *
                </label>
                <select
                  name="tier_id"
                  value={formData.tier_id}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                >
                  <option value="">Select a tier</option>
                  {tiers.map((tier) => (
                    <option key={tier.id} value={tier.id}>
                      {tier.name} - {formatCurrency(tier.amount)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Logo URL
                </label>
                <div className="space-y-3">
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="url"
                      value={logoUrl}
                      onChange={handleLogoUrlChange}
                      className="input-field pl-10"
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                  
                  {/* Logo Preview */}
                  {logoUrl && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                      <div className="flex items-center justify-center bg-gray-50 rounded-lg p-4">
                        <Image
                          src={logoUrl}
                          alt="Logo preview"
                          width={128}
                          height={96}
                          className="max-h-24 max-w-32 object-contain rounded"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            const parent = target.parentElement
                            if (parent) {
                              parent.innerHTML = '<div class="text-center text-gray-400 text-sm">Unable to load image</div>'
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500">
                    Enter the URL of the company logo image (PNG, JPG, GIF)
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Address
                </label>
                <textarea
                  name="address"
                  value={formData.address || ''}
                  onChange={handleInputChange}
                  className="input-field resize-none"
                  rows={3}
                  placeholder="Company address (optional)"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="fulfilled"
                  name="fulfilled"
                  checked={formData.fulfilled}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-salmon-600 focus:ring-salmon-500 border-gray-300 rounded"
                />
                <label htmlFor="fulfilled" className="ml-2 block text-sm text-gray-900">
                  Mark as fulfilled
                </label>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Information */}
          <div className="card">
            <h2 className="heading-xs text-gray-900 mb-4">Contact Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Name
                </label>
                <input
                  type="text"
                  name="contact_name"
                  value={formData.contact_name}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Primary contact person"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="contact@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sponsorship Agreement URL
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="url"
                    name="sponsorship_agreement_url"
                    value={formData.sponsorship_agreement_url || ''}
                    onChange={handleInputChange}
                    className="input-field pl-10"
                    placeholder="https://example.com/agreement.pdf"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Link to the signed sponsorship agreement document
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Receipt URL
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="url"
                    name="receipt_url"
                    value={formData.receipt_url || ''}
                    onChange={handleInputChange}
                    className="input-field pl-10"
                    placeholder="https://example.com/receipt.pdf"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Link to the sponsorship payment receipt document
                </p>
              </div>

              {/* Tier Information Display */}
              {formData.tier_id && (
                <div className="mt-6 p-4 bg-salmon-50 border border-salmon-200 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Selected Tier</h3>
                  {(() => {
                    const selectedTier = tiers.find(t => t.id === formData.tier_id)
                    if (selectedTier) {
                      return (
                        <div className="space-y-1">
                          <p className="text-lg font-semibold text-salmon-800">{selectedTier.name}</p>
                          <p className="text-2xl font-bold text-salmon-900">{formatCurrency(selectedTier.amount)}</p>
                          <p className="text-sm text-salmon-700">{selectedTier.type} Tier</p>
                        </div>
                      )
                    }
                    return null
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !formData.name || !formData.tier_id}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </div>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2 inline" />
                {isEditing ? 'Update Sponsor' : 'Add Sponsor'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { updateSponsor } from './actions'
import Breadcrumb from '@/components/Breadcrumb'
import PageHeader from '@/components/ui/PageHeader'

// Define types
interface Sponsor {
  id: string
  name: string
  tier_id: string
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  address: string | null
  logo_url: string | null
  sponsorship_agreement_url: string | null
  receipt_url: string | null
  fulfilled: boolean
}

interface Tier {
  id: string
  name: string
  amount: number | null
  type: string
}

interface SponsorFormData {
  name: string
  tier_id: string
  contact_name: string
  contact_email: string
  contact_phone: string
  address: string
  logo_url: string
  sponsorship_agreement_url: string
  receipt_url: string
  fulfilled: boolean
}

export default function EditSponsorPage({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sponsor, setSponsor] = useState<Sponsor | null>(null)
  const [tiers, setTiers] = useState<Tier[]>([])
  const [formData, setFormData] = useState<SponsorFormData>({
    name: '',
    tier_id: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    logo_url: '',
    sponsorship_agreement_url: '',
    receipt_url: '',
    fulfilled: false
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement
    const { name, type } = target
    const value = target.value
    const checked = 'checked' in target ? target.checked : undefined
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }


  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient()
        
        // Check if user is authenticated
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
          router.push('/login')
          return
        }

        // Get user profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role, is_approved')
          .eq('user_id', user.id)
          .single()

        // Check permissions
        if (!profile || !profile.is_approved || !['manager', 'admin'].includes(profile.role)) {
          setError('You do not have permission to edit sponsors')
          setLoading(false)
          return
        }

        // Fetch sponsor
        const { data: sponsorData, error: sponsorError } = await supabase
          .from('sponsors')
          .select('*')
          .eq('id', id)
          .single()

        if (sponsorError || !sponsorData) {
          setError('Sponsor not found')
          setLoading(false)
          return
        }

        // Fetch tiers
        const { data: tiersData, error: tiersError } = await supabase
          .from('tiers')
          .select('id, name, amount, type')
          .order('name', { ascending: true })

        if (tiersError) {
          console.error('Error fetching tiers:', tiersError)
        }

        setSponsor(sponsorData)
        setTiers(tiersData || [])
        setFormData({
          name: sponsorData.name || '',
          tier_id: sponsorData.tier_id || '',
          contact_name: sponsorData.contact_name || '',
          contact_email: sponsorData.contact_email || '',
          contact_phone: sponsorData.contact_phone || '',
          address: sponsorData.address || '',
          logo_url: sponsorData.logo_url || '',
          sponsorship_agreement_url: sponsorData.sponsorship_agreement_url || '',
          receipt_url: sponsorData.receipt_url || '',
          fulfilled: sponsorData.fulfilled || false
        })
      } catch (err) {
        console.error('Error fetching sponsor data:', err)
        setError('An error occurred while loading the sponsor data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const formDataToSend = new FormData()
      
      // Append all form fields from the formData state
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formDataToSend.append(key, String(value))
        }
      })
      
      // Add the sponsor ID to the form data
      formDataToSend.append('id', id)

      // Call the server action to update the sponsor
      await updateSponsor(formDataToSend)
      
      // Redirect to sponsors list on success
      router.push('/sponsors')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update sponsor')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Breadcrumb items={[
          { label: 'Sponsors', href: '/sponsors' },
          { label: 'Loading...' }
        ]} />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Breadcrumb items={[
          { label: 'Sponsors', href: '/sponsors' },
          { label: 'Error' }
        ]} />
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg mt-4">
          <h1 className="text-xl font-semibold text-red-800 mb-2">Error</h1>
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => router.push('/sponsors')}
            className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium"
          >
            Back to Sponsors
          </button>
        </div>
      </div>
    )
  }

  if (!sponsor) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Breadcrumb items={[
          { label: 'Sponsors', href: '/sponsors' },
          { label: 'Not Found' }
        ]} />
        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg mt-4">
          <h1 className="text-xl font-semibold text-yellow-800 mb-2">Sponsor Not Found</h1>
          <p className="text-yellow-700">The requested sponsor could not be found.</p>
          <button
            onClick={() => router.push('/sponsors')}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
          >
            Back to Sponsors
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Breadcrumb items={[
        { label: 'Sponsors', href: '/sponsors' },
        { label: 'Edit Sponsor' }
      ]} />
      
      <PageHeader
        title="Edit Sponsor"
        description="Update the sponsor details below"
      />
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-6 text-black">
          <input type="hidden" name="id" value={id} />
          
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Sponsor Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter sponsor name"
              />
            </div>

            <div>
              <label htmlFor="tier_id" className="block text-sm font-medium text-gray-700 mb-1">
                Sponsorship Tier <span className="text-red-500">*</span>
              </label>
              <select
                id="tier_id"
                name="tier_id"
                required
                value={formData.tier_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a tier</option>
                {tiers.map((tier) => (
                  <option key={tier.id} value={tier.id}>
                    {tier.name} - {tier.amount ? `$${tier.amount.toLocaleString()}` : 'Custom Amount'} ({tier.type})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="contact_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      id="contact_name"
                      name="contact_name"
                      value={formData.contact_name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="contact_email"
                      name="contact_email"
                      value={formData.contact_email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="contact_phone"
                      name="contact_phone"
                      value={formData.contact_phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Mailing Address
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      rows={3}
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="123 Main St, City, State ZIP"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="logo_url" className="block text-sm font-medium text-gray-700 mb-1">
                      Logo URL
                    </label>
                    <input
                      type="url"
                      id="logo_url"
                      name="logo_url"
                      value={formData.logo_url}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/logo.png"
                    />
                  </div>

                  <div>
                    <label htmlFor="sponsorship_agreement_url" className="block text-sm font-medium text-gray-700 mb-1">
                      Sponsorship Agreement URL
                    </label>
                    <input
                      type="url"
                      id="sponsorship_agreement_url"
                      name="sponsorship_agreement_url"
                      value={formData.sponsorship_agreement_url}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/agreement.pdf"
                    />
                  </div>

                  <div>
                    <label htmlFor="receipt_url" className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Receipt URL
                    </label>
                    <input
                      type="url"
                      id="receipt_url"
                      name="receipt_url"
                      value={formData.receipt_url}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/receipt.pdf"
                    />
                  </div>

                  <div className="pt-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="fulfilled"
                        name="fulfilled"
                        checked={formData.fulfilled}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="fulfilled" className="ml-2 block text-sm text-gray-700">
                        Mark as fulfilled
                      </label>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Check this when all sponsorship benefits have been delivered.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : 'Update Sponsor'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
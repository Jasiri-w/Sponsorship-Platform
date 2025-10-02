import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createSponsor } from './actions'
import CancelButton from '@/components/CancelButton'
import Breadcrumb from '@/components/Breadcrumb'

export default async function AddSponsorPage() {
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
    return (
      <div className="max-w-4xl mx-auto">
        <Breadcrumb items={[{ label: 'Sponsors', href: '/sponsors' }, { label: 'Add Sponsor' }]} />
        
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
          <h1 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h1>
          <p className="text-red-700">
            You don&apos;t have permission to add sponsors. This page is only accessible to managers and administrators.
          </p>
          {!profile?.is_approved && (
            <p className="text-red-700 mt-2">
              Additionally, your account needs to be approved by an administrator.
            </p>
          )}
        </div>
      </div>
    )
  }

  // Fetch available tiers for the dropdown
  const { data: tiers, error: tiersError } = await supabase
    .from('tiers')
    .select('id, name, amount, type')
    .order('name', { ascending: true })

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: 'Sponsors', href: '/sponsors' }, { label: 'Add Sponsor' }]} />
      
      {/* Page Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Sponsor</h1>
        <p className="text-gray-600">Create a new sponsor entry in the system</p>
      </div>

      {/* Tier Loading Error */}
      {tiersError && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
          <h3 className="text-yellow-800 font-semibold">Warning</h3>
          <p className="text-yellow-700">Could not load tiers: {tiersError.message}</p>
        </div>
      )}

      {/* Add Sponsor Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <form action={createSponsor} className="space-y-6">
          {/* Sponsor Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Sponsor Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter sponsor name"
            />
          </div>

          {/* Tier Selection */}
          <div>
            <label htmlFor="tier_id" className="block text-sm font-medium text-gray-700 mb-2">
              Sponsorship Tier *
            </label>
            <select
              id="tier_id"
              name="tier_id"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a tier</option>
              {tiers?.map((tier) => (
                <option key={tier.id} value={tier.id}>
                  {tier.name} - {tier.amount ? `$${parseFloat(tier.amount).toLocaleString()}` : 'Custom Amount'} ({tier.type})
                </option>
              ))}
            </select>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contact_name" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Name
              </label>
              <input
                type="text"
                id="contact_name"
                name="contact_name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Contact person name"
              />
            </div>

            <div>
              <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Email
              </label>
              <input
                type="email"
                id="contact_email"
                name="contact_email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="contact@company.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700 mb-2">
              Contact Phone
            </label>
            <input
              type="tel"
              id="contact_phone"
              name="contact_phone"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <textarea
              id="address"
              name="address"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Full address including city, state, and zip"
            />
          </div>

          {/* Document URLs */}
          <div className="space-y-4">
            <div>
              <label htmlFor="logo_url" className="block text-sm font-medium text-gray-700 mb-2">
                Logo URL
              </label>
              <input
                type="url"
                id="logo_url"
                name="logo_url"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div>
              <label htmlFor="sponsorship_agreement_url" className="block text-sm font-medium text-gray-700 mb-2">
                Sponsorship Agreement URL
              </label>
              <input
                type="url"
                id="sponsorship_agreement_url"
                name="sponsorship_agreement_url"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/agreement.pdf"
              />
            </div>

            <div>
              <label htmlFor="receipt_url" className="block text-sm font-medium text-gray-700 mb-2">
                Receipt URL
              </label>
              <input
                type="url"
                id="receipt_url"
                name="receipt_url"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/receipt.pdf"
              />
            </div>
          </div>

          {/* Fulfilled Status */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="fulfilled"
                value="true"
                className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="ml-2 text-sm text-gray-700">Mark as fulfilled</span>
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              Create Sponsor
            </button>
            <CancelButton className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors duration-200">
              Cancel
            </CancelButton>
          </div>
        </form>
      </div>
    </div>
  )
}
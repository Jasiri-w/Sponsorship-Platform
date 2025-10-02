import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { updateSponsor } from './actions'
import CancelButton from '@/components/CancelButton'

interface EditSponsorPageProps {
  params: Promise<{ id: string }>
}

export default async function EditSponsorPage({ params }: EditSponsorPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    redirect('/login')
  }

  // Get user profile to check role and approval status
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, is_approved')
    .eq('user_id', userData.user.id)
    .single()

  // Check if user has manager or admin role and is approved
  if (!profile || !profile.is_approved || !['manager', 'admin'].includes(profile.role)) {
    return (
      <div className="min-h-screen bg-black p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-900 border border-red-600 p-6 rounded-lg">
            <h1 className="text-xl font-semibold text-red-300 mb-2">Access Denied</h1>
            <p className="text-red-200">
              You don&apos;t have permission to edit sponsors. This page is only accessible to managers and administrators.
            </p>
            {!profile?.is_approved && (
              <p className="text-red-200 mt-2">
                Additionally, your account needs to be approved by an administrator.
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Fetch the sponsor to edit
  const { data: sponsor, error: sponsorError } = await supabase
    .from('sponsors')
    .select('*')
    .eq('id', id)
    .single()

  if (sponsorError || !sponsor) {
    return (
      <div className="min-h-screen bg-black p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-900 border border-red-600 p-6 rounded-lg">
            <h1 className="text-xl font-semibold text-red-300 mb-2">Sponsor Not Found</h1>
            <p className="text-red-200">
              The sponsor you&apos;re trying to edit could not be found or you don&apos;t have permission to access it.
            </p>
            <p className="text-red-200 mt-2">Error: {sponsorError?.message}</p>
          </div>
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
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-2xl mx-auto">
        {/* Page Header */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-2xl border border-gray-700 mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Edit Sponsor</h1>
          <p className="text-gray-300">Update sponsor information</p>
        </div>

        {/* Tier Loading Error */}
        {tiersError && (
          <div className="bg-yellow-900 border border-yellow-600 p-4 rounded-lg mb-6">
            <h3 className="text-yellow-300 font-semibold">Warning</h3>
            <p className="text-yellow-200">Could not load tiers: {tiersError.message}</p>
          </div>
        )}

        {/* Edit Sponsor Form */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-2xl border border-gray-700">
          <form action={updateSponsor} className="space-y-6">
            {/* Hidden sponsor ID */}
            <input type="hidden" name="id" value={sponsor.id} />

            {/* Sponsor Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Sponsor Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                defaultValue={sponsor.name}
                className="w-full px-3 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter sponsor name"
              />
            </div>

            {/* Tier Selection */}
            <div>
              <label htmlFor="tier_id" className="block text-sm font-medium text-gray-300 mb-2">
                Sponsorship Tier *
              </label>
              <select
                id="tier_id"
                name="tier_id"
                required
                defaultValue={sponsor.tier_id}
                className="w-full px-3 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <label htmlFor="contact_name" className="block text-sm font-medium text-gray-300 mb-2">
                  Contact Name
                </label>
                <input
                  type="text"
                  id="contact_name"
                  name="contact_name"
                  defaultValue={sponsor.contact_name || ''}
                  className="w-full px-3 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Contact person name"
                />
              </div>

              <div>
                <label htmlFor="contact_email" className="block text-sm font-medium text-gray-300 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  id="contact_email"
                  name="contact_email"
                  defaultValue={sponsor.contact_email || ''}
                  className="w-full px-3 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="contact@company.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-300 mb-2">
                Contact Phone
              </label>
              <input
                type="tel"
                id="contact_phone"
                name="contact_phone"
                defaultValue={sponsor.contact_phone || ''}
                className="w-full px-3 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-2">
                Address
              </label>
              <textarea
                id="address"
                name="address"
                rows={3}
                defaultValue={sponsor.address || ''}
                className="w-full px-3 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Full address including city, state, and zip"
              />
            </div>

            {/* Document URLs */}
            <div className="space-y-4">
              <div>
                <label htmlFor="logo_url" className="block text-sm font-medium text-gray-300 mb-2">
                  Logo URL
                </label>
                <input
                  type="url"
                  id="logo_url"
                  name="logo_url"
                  defaultValue={sponsor.logo_url || ''}
                  className="w-full px-3 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div>
                <label htmlFor="sponsorship_agreement_url" className="block text-sm font-medium text-gray-300 mb-2">
                  Sponsorship Agreement URL
                </label>
                <input
                  type="url"
                  id="sponsorship_agreement_url"
                  name="sponsorship_agreement_url"
                  defaultValue={sponsor.sponsorship_agreement_url || ''}
                  className="w-full px-3 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/agreement.pdf"
                />
              </div>

              <div>
                <label htmlFor="receipt_url" className="block text-sm font-medium text-gray-300 mb-2">
                  Receipt URL
                </label>
                <input
                  type="url"
                  id="receipt_url"
                  name="receipt_url"
                  defaultValue={sponsor.receipt_url || ''}
                  className="w-full px-3 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  defaultChecked={sponsor.fulfilled}
                  className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="ml-2 text-sm text-gray-300">Mark as fulfilled</span>
              </label>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
              >
                Update Sponsor
              </button>
              <CancelButton className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200">
                Cancel
              </CancelButton>
            </div>
          </form>
        </div>

        {/* Debug Information */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-2xl border border-gray-700 mt-6">
          <h2 className="text-xl font-semibold text-white mb-4">Debug Information</h2>
          <div className="bg-gray-800 p-4 rounded overflow-x-auto">
            <pre className="text-green-400 text-xs">
              <strong>Sponsor Data:</strong>
              {JSON.stringify({ sponsor, tiers, tiersError }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
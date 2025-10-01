import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createTier, updateTier, deleteTier } from './actions'

export default async function TierManagementPage() {
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

  // Check if user has admin role and is approved (only admins can manage tiers)
  if (!profile || !profile.is_approved || profile.role !== 'admin') {
    redirect('/error')
  }

  // Fetch all tiers
  const { data: tiers, error: tiersError } = await supabase
    .from('tiers')
    .select('*')
    .order('level', { ascending: true })

  if (tiersError) {
    console.error('Error fetching tiers:', tiersError)
    redirect('/error')
  }

  // Get tier usage statistics
  const { data: tierUsage, error: tierUsageError } = await supabase
    .from('sponsors')
    .select('tier_id, tiers(name)')
    .not('tier_id', 'is', null)

  const usageStats = tierUsage?.reduce((acc, sponsor) => {
    const tierId = sponsor.tier_id
    if (tierId) {
      acc[tierId] = (acc[tierId] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>) || {}

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tier Management
          </h1>
          <p className="text-gray-600">
            Manage sponsorship tiers and levels. Only administrators can access this page.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create New Tier */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Create New Tier
              </h2>
              
              <form action={createTier} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Tier Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    placeholder="e.g., Gold, Silver, Bronze"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                    Level (Order)
                  </label>
                  <input
                    type="number"
                    id="level"
                    name="level"
                    required
                    min="1"
                    placeholder="1 = highest, 2 = second highest, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    placeholder="Brief description of this tier level..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                >
                  Create Tier
                </button>
              </form>
            </div>

            {/* Statistics */}
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Statistics</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Tiers:</span>
                  <span className="text-sm font-medium text-gray-900">{tiers?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Sponsors Assigned:</span>
                  <span className="text-sm font-medium text-gray-900">{tierUsage?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Existing Tiers */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Existing Tiers ({tiers?.length || 0})
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Ordered by level (1 = highest priority)
                </p>
              </div>

              {tiers && tiers.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {tiers.map((tier) => (
                    <div key={tier.id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                              tier.level === 1 ? 'bg-yellow-500' :
                              tier.level === 2 ? 'bg-gray-400' :
                              tier.level === 3 ? 'bg-amber-600' :
                              'bg-blue-500'
                            }`}>
                              {tier.level}
                            </div>
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">
                                {tier.name}
                              </h3>
                              {tier.description && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {tier.description}
                                </p>
                              )}
                              <div className="flex items-center space-x-4 mt-2">
                                <span className="text-xs text-gray-500">
                                  Level {tier.level}
                                </span>
                                {usageStats[tier.id] && (
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                    {usageStats[tier.id]} sponsor{usageStats[tier.id] !== 1 ? 's' : ''}
                                  </span>
                                )}
                                <span className="text-xs text-gray-500">
                                  Created {new Date(tier.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Edit Form (collapsed by default, would need client component for toggle) */}
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <details className="group">
                              <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-800">
                                Edit Tier
                              </summary>
                              <div className="mt-3 space-y-3">
                                <form action={updateTier} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <input type="hidden" name="id" value={tier.id} />
                                  
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Name
                                    </label>
                                    <input
                                      type="text"
                                      name="name"
                                      defaultValue={tier.name}
                                      required
                                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Level
                                    </label>
                                    <input
                                      type="number"
                                      name="level"
                                      defaultValue={tier.level}
                                      required
                                      min="1"
                                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                  </div>

                                  <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Description
                                    </label>
                                    <textarea
                                      name="description"
                                      defaultValue={tier.description || ''}
                                      rows={2}
                                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                  </div>

                                  <div className="md:col-span-2 flex space-x-2">
                                    <button
                                      type="submit"
                                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    >
                                      Update
                                    </button>
                                  </div>
                                </form>
                              </div>
                            </details>
                          </div>
                        </div>

                        {/* Delete Button */}
                        <div className="ml-4">
                          {!usageStats[tier.id] ? (
                            <form action={deleteTier}>
                              <input type="hidden" name="id" value={tier.id} />
                              <button
                                type="submit"
                                className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 border border-red-300 rounded hover:bg-red-50 transition duration-200"
                              >
                                Delete
                              </button>
                            </form>
                          ) : (
                            <span className="text-gray-400 text-sm px-3 py-1 border border-gray-200 rounded bg-gray-50">
                              In Use
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-12 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No tiers found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by creating your first sponsorship tier.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Information Note */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Tier Management Guidelines
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Level 1 = highest tier (typically Platinum/Gold), Level 2 = second highest (Gold/Silver), etc.</li>
                  <li>Tiers with assigned sponsors cannot be deleted (remove sponsors first)</li>
                  <li>Be careful when changing levels as this affects sponsor display order</li>
                  <li>Common tier names: Platinum, Gold, Silver, Bronze, Partner</li>
                  <li>Descriptions help users understand what each tier represents</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-center space-x-4">
          <a
            href="/manage/user-roles"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← User Roles
          </a>
          <span className="text-gray-300">|</span>
          <a
            href="/sponsors"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            View Sponsors →
          </a>
        </div>
      </div>
    </div>
  )
}
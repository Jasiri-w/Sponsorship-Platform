import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createEvent } from './actions'
import CancelButton from '@/components/CancelButton'

export default async function AddEventPage() {
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
      <div className="min-h-screen bg-black p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-900 border border-red-600 p-6 rounded-lg">
            <h1 className="text-xl font-semibold text-red-300 mb-2">Access Denied</h1>
            <p className="text-red-200">
              You don&apost have permission to add events. This page is only accessible to managers and administrators.
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

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-2xl mx-auto">
        {/* Page Header */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-2xl border border-gray-700 mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Add New Event</h1>
          <p className="text-gray-300">Create a new event entry in the system</p>
        </div>

        {/* Add Event Form */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-2xl border border-gray-700">
          <form action={createEvent} className="space-y-6">
            {/* Event Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                Event Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className="w-full px-3 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter event title"
              />
            </div>

            {/* Event Date */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-2">
                Event Date *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                required
                className="w-full px-3 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Event Details */}
            <div>
              <label htmlFor="details" className="block text-sm font-medium text-gray-300 mb-2">
                Event Details
              </label>
              <textarea
                id="details"
                name="details"
                rows={6}
                className="w-full px-3 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe the event, including location, time, agenda, and other important information..."
              />
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
              >
                Create Event
              </button>
              <CancelButton className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200">
                Cancel
              </CancelButton>
            </div>
          </form>
        </div>

        {/* Additional Information */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-2xl border border-gray-700 mt-6">
          <h2 className="text-lg font-semibold text-white mb-3">📋 Next Steps</h2>
          <div className="text-gray-300 space-y-2 text-sm">
            <p>✅ After creating the event, you&apos;ll be able to:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Assign sponsors to this event</li>
              <li>Edit event details if needed</li>
              <li>View all sponsors associated with this event</li>
              <li>Track sponsorship fulfillment for this event</li>
            </ul>
          </div>
        </div>

        {/* Debug Information */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-2xl border border-gray-700 mt-6">
          <h2 className="text-xl font-semibold text-white mb-4">Debug Information</h2>
          <div className="bg-gray-800 p-4 rounded overflow-x-auto">
            <pre className="text-green-400 text-xs">
              <strong>User Info:</strong>
              {JSON.stringify({ profile }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { updateEvent } from './actions'
import CancelButton from '@/components/CancelButton'

interface EditEventPageProps {
  params: Promise<{ id: string }>
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params
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
              You don't have permission to edit events. This page is only accessible to managers and administrators.
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

  // Fetch the event to edit
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (eventError || !event) {
    return (
      <div className="min-h-screen bg-black p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-900 border border-red-600 p-6 rounded-lg">
            <h1 className="text-xl font-semibold text-red-300 mb-2">Event Not Found</h1>
            <p className="text-red-200">
              The event you're trying to edit could not be found or you don't have permission to access it.
            </p>
            <p className="text-red-200 mt-2">Error: {eventError?.message}</p>
          </div>
        </div>
      </div>
    )
  }

  // Format date for input (YYYY-MM-DD)
  const formattedDate = new Date(event.date).toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-2xl mx-auto">
        {/* Page Header */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-2xl border border-gray-700 mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Edit Event</h1>
          <p className="text-gray-300">Update event information</p>
        </div>

        {/* Edit Event Form */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-2xl border border-gray-700">
          <form action={updateEvent} className="space-y-6">
            {/* Hidden event ID */}
            <input type="hidden" name="id" value={event.id} />

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
                defaultValue={event.title}
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
                defaultValue={formattedDate}
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
                defaultValue={event.details || ''}
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
                Update Event
              </button>
              <CancelButton className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200">
                Cancel
              </CancelButton>
            </div>
          </form>
        </div>

        {/* Event Statistics */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-2xl border border-gray-700 mt-6">
          <h2 className="text-lg font-semibold text-white mb-3">📊 Event Information</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Created:</span>
              <p className="text-white">{new Date(event.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="text-gray-400">Event ID:</span>
              <p className="text-white font-mono text-xs">{event.id}</p>
            </div>
          </div>
        </div>

        {/* Debug Information */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-2xl border border-gray-700 mt-6">
          <h2 className="text-xl font-semibold text-white mb-4">Debug Information</h2>
          <div className="bg-gray-800 p-4 rounded overflow-x-auto">
            <pre className="text-green-400 text-xs">
              <strong>Event Data:</strong>
              {JSON.stringify({ event, formattedDate }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
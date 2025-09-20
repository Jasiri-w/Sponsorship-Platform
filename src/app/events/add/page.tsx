'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'

function AddEventContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Add Event</h1>
        <p className="text-gray-600 mt-1">Create a new sponsorship event</p>
      </div>
      <div className="card">
        <div className="text-center py-12">
          <p className="text-gray-500">Add event form coming soon...</p>
        </div>
      </div>
    </div>
  )
}

export default function AddEventPage() {
  return (
    <ProtectedRoute requiredPermission="sponsorship_chair">
      <AddEventContent />
    </ProtectedRoute>
  )
}

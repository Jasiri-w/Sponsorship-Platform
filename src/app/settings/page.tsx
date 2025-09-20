'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'

function SettingsContent() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your application settings</p>
        </div>
      </div>
      <div className="card">
        <div className="text-center py-12">
          <p className="text-gray-500">Settings functionality coming soon...</p>
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <ProtectedRoute requiredPermission="sponsorship_chair">
      <SettingsContent />
    </ProtectedRoute>
  )
}

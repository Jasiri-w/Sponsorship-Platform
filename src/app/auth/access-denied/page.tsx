'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Shield, Home, Mail } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function AccessDeniedPage() {
  const { user, userProfile, isApproved, isSponsorshipChair, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login')
        return
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 mx-auto mb-4 border-4 border-salmon-600 border-t-transparent rounded-full"></div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Access Restricted
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            You don't have permission to access this feature
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {!isApproved ? (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md text-sm text-left">
              <div className="flex items-start">
                <Mail className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Account Pending Approval</p>
                  <p className="mt-1">
                    Your account is awaiting approval from a Sponsorship Chair. You can view content but cannot make changes until approved.
                  </p>
                </div>
              </div>
            </div>
          ) : !isSponsorshipChair ? (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm text-left">
              <div className="flex items-start">
                <Shield className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Sponsorship Chair Access Required</p>
                  <p className="mt-1">
                    This feature requires Sponsorship Chair privileges. Contact a current Sponsorship Chair if you need elevated access.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 text-gray-800 px-4 py-3 rounded-md text-sm text-left">
              <p className="font-medium">Unexpected Access Issue</p>
              <p className="mt-1">
                There seems to be an unexpected issue with your permissions. Please try logging out and back in, or contact support if the issue persists.
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Link
              href="/"
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-salmon-600 hover:bg-salmon-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-salmon-500"
            >
              <Home className="h-4 w-4 mr-2" />
              Return to Dashboard
            </Link>

            {userProfile && (
              <div className="text-xs text-gray-500 bg-gray-100 px-3 py-2 rounded">
                <p><strong>Account Status:</strong> {isApproved ? 'Approved' : 'Pending Approval'}</p>
                <p><strong>Role:</strong> {userProfile.role === 'sponsorship_chair' ? 'Sponsorship Chair' : 'User'}</p>
                <p><strong>Email:</strong> {userProfile.email}</p>
              </div>
            )}
          </div>

          {!isApproved && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md text-sm text-left">
              <h3 className="font-medium mb-2">While You Wait:</h3>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>You can browse and view all sponsors and events</li>
                <li>Dashboard statistics are available</li>
                <li>Contact information is visible</li>
                <li>You'll receive email notification when approved</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Clock, LogOut, RefreshCw } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function PendingApprovalPage() {
  const { user, userProfile, loading, isApproved, isEmailVerified, signOut, refreshUserProfile } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login')
        return
      }
      
      if (!isEmailVerified) {
        router.push('/auth/verify-email')
        return
      }
      
      if (isApproved) {
        router.push('/')
        return
      }
    }
  }, [loading, user, isEmailVerified, isApproved, router])

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/login')
  }

  const handleRefresh = async () => {
    await refreshUserProfile()
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-salmon-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (isApproved) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-yellow-500 rounded-full flex items-center justify-center">
            <Clock className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Account Pending Approval
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your email has been verified! Your account now needs approval from a Sponsorship Chair before you can access editing features.
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">Email:</span>
            <span className="text-sm text-gray-600">{user.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">Name:</span>
            <span className="text-sm text-gray-600">{userProfile?.full_name || 'Not provided'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">Email Status:</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Verified
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">Approval Status:</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Pending Review
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">Role:</span>
            <span className="text-sm text-gray-600">{userProfile?.role === 'sponsorship_chair' ? 'Sponsorship Chair' : 'User'}</span>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md text-sm">
          <p className="font-medium">What&apos;s Next?</p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>A Sponsorship Chair will review your account</li>
            <li>You&apos;ll receive an email notification when approved</li>
            <li>Once approved, you can create and edit sponsors and events</li>
            <li>Meanwhile, you can browse and view all content</li>
          </ul>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleRefresh}
            className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-salmon-500"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Check Approval Status
          </button>

          <Link
            href="/"
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-salmon-600 hover:bg-salmon-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-salmon-500"
          >
            Continue to Dashboard
          </Link>

          <button
            onClick={handleSignOut}
            className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-salmon-500"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
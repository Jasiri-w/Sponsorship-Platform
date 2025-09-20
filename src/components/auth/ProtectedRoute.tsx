'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2, Mail, UserCheck, Shield } from 'lucide-react'
import type { PermissionLevel } from '@/types/database'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermission?: PermissionLevel
  redirectTo?: string
  showAccessDenied?: boolean
}

export default function ProtectedRoute({ 
  children, 
  requiredPermission = 'approved', 
  redirectTo = '/auth/login',
  showAccessDenied = true
}: ProtectedRouteProps) {
  const { 
    user, 
    userProfile, 
    loading, 
    isAuthenticated, 
    isEmailVerified, 
    isApproved, 
    isSponsorshipChair,
    userStatus, 
    hasPermission 
  } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push(redirectTo)
        return
      }

      if (!isEmailVerified && requiredPermission !== 'authenticated') {
        router.push('/auth/verify-email')
        return
      }

      if (!hasPermission(requiredPermission)) {
        // Handle different permission levels
        switch (requiredPermission) {
          case 'approved':
            router.push('/auth/pending')
            break
          case 'sponsorship_chair':
            if (showAccessDenied) {
              router.push('/auth/access-denied')
            } else {
              router.push('/auth/pending')
            }
            break
          default:
            router.push(redirectTo)
        }
        return
      }
    }
  }, [loading, isAuthenticated, isEmailVerified, hasPermission, requiredPermission, router, redirectTo, showAccessDenied])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-salmon-600" />
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect via useEffect
  }

  if (!hasPermission(requiredPermission)) {
    // Show inline access denied message for sponsorship chair requirements
    if (requiredPermission === 'sponsorship_chair' && isApproved && !showAccessDenied) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full space-y-8 text-center">
            <div className="mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
              <p className="text-gray-600 mb-4">
                This feature requires Sponsorship Chair privileges. Please contact an administrator if you need access.
              </p>
              <button 
                onClick={() => router.push('/')} 
                className="btn-primary"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )
    }
    return null // Will redirect via useEffect for other cases
  }

  return <>{children}</>
}

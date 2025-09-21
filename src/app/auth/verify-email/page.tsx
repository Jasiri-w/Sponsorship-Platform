'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

export default function VerifyEmailPage() {
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [resendError, setResendError] = useState<string | null>(null)
  const { user, isEmailVerified, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login')
        return
      }
      
      if (isEmailVerified) {
        router.push('/auth/pending')
        return
      }
    }
  }, [user, isEmailVerified, loading, router])

  const handleResendEmail = async () => {
    if (!user?.email) return

    setResendLoading(true)
    setResendError(null)
    setResendSuccess(false)

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      })

      if (error) {
        setResendError(error.message)
      } else {
        setResendSuccess(true)
      }
    } catch (error) {
      setResendError('Failed to resend verification email')
    } finally {
      setResendLoading(false)
    }
  }

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
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center">
            <Mail className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Check Your Email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We&apos;ve sent a verification link to{' '}
            <span className="font-medium text-gray-900">{user?.email}</span>
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md text-sm">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              <div>
                <p className="font-medium">Email Verification Required</p>
                <p className="mt-1">Click the verification link in your email to continue. After verification, your account will need approval from a Sponsorship Chair.</p>
              </div>
            </div>
          </div>

          {resendSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md text-sm">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                <p>Verification email sent successfully!</p>
              </div>
            </div>
          )}

          {resendError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                <p>{resendError}</p>
              </div>
            </div>
          )}

          <div className="text-center space-y-4">
            <button
              onClick={handleResendEmail}
              disabled={resendLoading || resendSuccess}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-salmon-600 hover:bg-salmon-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-salmon-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendLoading ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Resend Verification Email
                </>
              )}
            </button>

            <div className="text-sm">
              <p className="text-gray-600 mb-2">
                Can&apos;t find the email? Check your spam folder.
              </p>
              <Link
                href="/auth/login"
                className="font-medium text-salmon-600 hover:text-salmon-500"
              >
                Back to Login
              </Link>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 rounded-md text-sm text-gray-600">
            <h3 className="font-medium text-gray-900 mb-2">Next Steps:</h3>
            <ol className="list-decimal list-inside space-y-1">
              <li>Check your email for the verification link</li>
              <li>Click the link to verify your email address</li>
              <li>Wait for approval from a Sponsorship Chair</li>
              <li>Once approved, you&apos;ll have access to all features</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import PageHeader from '@/components/ui/PageHeader'
import ContentCard from '@/components/ui/ContentCard'
import { User } from '@supabase/supabase-js'

interface UserProfile {
  id: string
  full_name?: string
  email?: string
  role: string
  is_approved: boolean
  created_at: string
  updated_at?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showSuccess, setShowSuccess] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check for success message
  useEffect(() => {
    if (searchParams.get('updated') === 'true') {
      setShowSuccess(true)
      const timer = setTimeout(() => setShowSuccess(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const supabase = createClient()
        
        // Get current user
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !currentUser) {
          throw new Error(userError?.message || 'No user found')
        }
        
        setUser(currentUser)

        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', currentUser.id)
          .single()

        if (profileError) {
          console.error('Error fetching profile:', profileError)
          // Create a default profile if not found
          setProfile({
            id: currentUser.id,
            email: currentUser.email || undefined,
            role: 'user',
            is_approved: false,
            created_at: new Date().toISOString(),
          })
        } else {
          setProfile(profileData)
        }
      } catch (err) {
        console.error('Error in fetchUserProfile:', err)
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [])

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-2 mt-8">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Error loading profile: {error}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <PageHeader 
        title="Profile" 
        description="View and manage your personal information"
      />

      {showSuccess && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                Profile updated successfully!
              </p>
            </div>
          </div>
        </div>
      )}

      <ContentCard title="User Information">
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white ${
                profile?.role === 'admin' ? 'bg-purple-600' :
                profile?.role === 'manager' ? 'bg-blue-600' :
                'bg-gray-600'
              }`}>
                {profile?.full_name?.charAt(0).toUpperCase() || profile?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {profile?.full_name || 'No name provided'}
              </h3>
              <p className="text-gray-600">{profile?.email}</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                profile?.is_approved 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {profile?.is_approved ? 'Approved' : 'Pending Approval'}
              </span>
              {profile?.role && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                </span>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {profile?.full_name || 'Not provided'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email address</dt>
                <dd className="mt-1 text-sm text-gray-900">{profile?.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Account Status</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {profile?.is_approved ? 'Active' : 'Pending Approval'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">User Role</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : 'User'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                </dd>
              </div>
              {profile?.updated_at && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(profile.updated_at).toLocaleString()}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Account Actions</h3>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => router.push('/profile/edit')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Edit Profile
              </button>
              <button
                type="button"
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      </ContentCard>
    </div>
  )
}

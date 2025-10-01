'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Sidebar from './Sidebar'
import MobileTopNav from './MobileTopNav'

interface UserProfile {
  role: string
  is_approved: boolean
}

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    let mounted = true

    const getUser = async () => {
      try {
        console.log('AppLayout: Starting getUser')
        
        // Get current user
        const { data: userData, error: userError } = await supabase.auth.getUser()
        
        console.log('AppLayout: Got user data', { userData: !!userData?.user, error: userError })
        
        if (!mounted) return
        
        if (userError || !userData?.user) {
          setIsAuthenticated(false)
          setUser(null)
          setProfile(null)
          setIsLoading(false)
          return
        }

        setUser(userData.user)
        setIsAuthenticated(true)

        // Get user profile
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('user_profiles')
            .select('role, is_approved')
            .eq('user_id', userData.user.id)
            .single()

          console.log('AppLayout: Got profile data', { profileData, profileError })
          
          if (!mounted) return

          if (!profileError && profileData) {
            setProfile(profileData)
          } else {
            console.error('Error fetching user profile:', profileError)
            // Set default profile for cases where profile doesn't exist yet
            setProfile({ role: 'user', is_approved: false })
          }
        } catch (profileErr) {
          console.error('Profile fetch error:', profileErr)
          if (mounted) {
            setProfile({ role: 'user', is_approved: false })
          }
        }
      } catch (error) {
        console.error('Error in getUser:', error)
        if (mounted) {
          setIsAuthenticated(false)
          setUser(null)
          setProfile(null)
        }
      } finally {
        if (mounted) {
          console.log('AppLayout: Finished loading')
          setIsLoading(false)
        }
      }
    }

    // Add a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('AppLayout: Timeout reached, stopping loading')
      if (mounted) {
        setIsLoading(false)
      }
    }, 10000) // 10 second timeout

    getUser().finally(() => {
      clearTimeout(timeout)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AppLayout: Auth state changed', event)
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (mounted) {
            setIsLoading(true)
            await getUser()
          }
        } else if (event === 'SIGNED_OUT') {
          if (mounted) {
            setIsAuthenticated(false)
            setUser(null)
            setProfile(null)
            setIsLoading(false)
          }
        }
      }
    )

    return () => {
      mounted = false
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  // Don't render sidebar on auth pages
  const authPages = ['/login', '/signup', '/auth']
  const isAuthPage = authPages.some(page => 
    typeof window !== 'undefined' && window.location.pathname.startsWith(page)
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar - Hidden on mobile */}
      {!isAuthPage && (
        <div className="hidden lg:block">
          <Sidebar 
            userRole={profile?.role}
            isApproved={profile?.is_approved}
            isAuthenticated={isAuthenticated}
          />
        </div>
      )}
      
      {/* Mobile Top Navigation */}
      <MobileTopNav 
        userRole={profile?.role}
        isApproved={profile?.is_approved}
        isAuthenticated={isAuthenticated}
      />
      
      {/* Main Content */}
      <main className={`min-h-screen ${
        !isAuthPage && isAuthenticated 
          ? 'lg:ml-64' // Add left margin on desktop to account for sidebar
          : ''
      }`}>
        <div className={!isAuthPage && isAuthenticated ? 'p-4 lg:p-6' : ''}>
          {children}
        </div>
      </main>
    </div>
  )
}
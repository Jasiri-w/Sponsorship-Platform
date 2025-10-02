'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import MobileTopNav from './MobileTopNav'

interface UserProfile {
  id: string
  role: string
  is_approved: boolean
  full_name?: string
  email?: string
  created_at: string
  updated_at?: string
}

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const isAuthPage = ['/login', '/signup', '/auth'].some(path => pathname?.startsWith(path))

  useEffect(() => {
    const supabase = createClient()
    let mounted: boolean = true

    const getUser = async () => {
      try {
        console.log('AppLayout: Starting getUser')
        
        // Get current user
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
        
        console.log('AppLayout: Got user data', { user: !!currentUser, error: userError })
        
        if (!mounted) return
        
        if (userError || !currentUser) {
          setIsAuthenticated(false)
          setUser(null)
          setProfile(null)
          setIsLoading(false)
          if (!isAuthPage) {
            router.push('/login')
          }
          return
        }

        setUser({ id: currentUser.id, email: currentUser.email })
        setIsAuthenticated(true)

        // Get user profile
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('user_profiles')
            .select('id, role, is_approved, full_name, email, created_at, updated_at')
            .eq('user_id', currentUser.id)
            .single()

          console.log('AppLayout: Got profile data', { profileData, profileError })
          
          if (!mounted) return

          if (!profileError && profileData) {
            setProfile(profileData)
          } else {
            console.error('Error fetching user profile:', profileError)
            // Set default profile for cases where profile doesn't exist yet
            setProfile({ 
              id: currentUser.id,
              role: 'user', 
              is_approved: false,
              full_name: currentUser.email?.split('@')[0] || 'User',
              email: currentUser.email || '',
              created_at: new Date().toISOString()
            })
          }
        } catch (profileErr) {
          console.error('Profile fetch error:', profileErr)
          if (mounted) {
            setProfile({ 
              id: currentUser.id,
              role: 'user', 
              is_approved: false,
              full_name: currentUser.email?.split('@')[0] || 'User',
              email: currentUser.email || '',
              created_at: new Date().toISOString()
            })
          }
        }
      } catch (error) {
        console.error('Error in getUser:', error)
        if (mounted) {
          setIsAuthenticated(false)
          setUser(null)
          setProfile(null)
          if (!isAuthPage) {
            router.push('/login')
          }
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
      async (event) => {
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
            if (!isAuthPage) {
              router.push('/login')
            }
          }
        }
      }
    )

    return () => {
      mounted = false
      clearTimeout(timeout)
      subscription?.unsubscribe()
    }
  }, [router, pathname, isAuthPage])
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar - Hidden on mobile */}
      {!isAuthPage && (
        <div className="hidden lg:block">
          <Sidebar 
            userRole={profile?.role}
            isApproved={profile?.is_approved}
            isAuthenticated={isAuthenticated}
            fullName={profile?.full_name}
            email={profile?.email}
          />
        </div>
      )}
      
      {/* Mobile Top Navigation */}
      {!isAuthPage && isAuthenticated && (
        <MobileTopNav 
          userRole={profile?.role || 'user'}
          isApproved={!!profile?.is_approved}
          isAuthenticated={isAuthenticated}
        />
      )}
      
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
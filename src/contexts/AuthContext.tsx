'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { 
  User, 
  AuthChangeEvent, 
  Session 
} from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { UserProfile, UserRole, PermissionLevel, UserStatus } from '@/types/database'

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  isAuthenticated: boolean
  isEmailVerified: boolean
  isApproved: boolean
  isSponsorshipChair: boolean
  userStatus: UserStatus
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshUserProfile: () => Promise<void>
  hasPermission: (level: PermissionLevel) => boolean
  canEdit: () => boolean
  canAccessSettings: () => boolean
  canManageUsers: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch user profile from database
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      // Handle "no rows returned" error (user profile doesn't exist yet)
      if (error && error.code === 'PGRST116') {
        console.log('User profile not found, will be created on first login')
        return null
      }

      // Handle other errors
      if (error) {
        console.error('Error fetching user profile:', error.message || error)
        // For policy errors, return null but don't crash
        if (error.message?.includes('policy') || error.message?.includes('recursion')) {
          console.warn('Database policy issue detected, falling back to safe defaults')
          return null
        }
        return null
      }

      return data
    } catch (error) {
      console.error('Error fetching user profile:', error instanceof Error ? error.message : 'Unknown error')
      return null
    }
  }

  // Create user profile after signup
  const createUserProfile = async (user: User): Promise<void> => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .insert({
          user_id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || null,
          is_approved: false, // Default to not approved
          role: 'user' // Default role
        })

      if (error) {
        console.error('Error creating user profile:', error.message || error)
      }
    } catch (error) {
      console.error('Error creating user profile:', error instanceof Error ? error.message : 'Unknown error')
    }
  }

  // Refresh user profile
  const refreshUserProfile = async () => {
    if (user) {
      const profile = await fetchUserProfile(user.id)
      setUserProfile(profile)
    }
  }

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          setUser(session.user)
          const profile = await fetchUserProfile(session.user.id)
          setUserProfile(profile)
        }
      } catch (error) {
        console.error('Error initializing auth:', error instanceof Error ? error.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (session?.user) {
          setUser(session.user)
          
          // If this is a new signup, create profile
          if (event === 'SIGNED_UP' as AuthChangeEvent) {
            await createUserProfile(session.user)
          }
          
          const profile = await fetchUserProfile(session.user.id)
          setUserProfile(profile)
        } else {
          setUser(null)
          setUserProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { error }
    } catch (error) {
      return { error: error as Error }
    }
  }

  // Sign up function
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })
      return { error }
    } catch (error) {
      return { error: error as Error }
    }
  }

  // Sign out function
  const signOut = async () => {
    await supabase.auth.signOut()
  }

  // Computed properties
  const isEmailVerified = !!user?.email_confirmed_at
  const isApproved = userProfile ? !!userProfile.is_approved : false
  const isSponsorshipChair = userProfile?.role === 'sponsorship_chair'
  
  // Calculate user status
  const getUserStatus = (): UserStatus => {
    if (!user) return 'pending_verification'
    if (!isEmailVerified) return 'pending_verification'
    if (!userProfile) return 'pending_approval'
    if (!isApproved) return 'pending_approval'
    return 'approved'
  }
  
  const userStatus = getUserStatus()

  // Permission checking methods
  const hasPermission = (level: PermissionLevel): boolean => {
    switch (level) {
      case 'public':
        return true
      case 'authenticated':
        return !!user
      case 'approved':
        return !!user && isEmailVerified && isApproved
      case 'sponsorship_chair':
        return !!user && isEmailVerified && isApproved && isSponsorshipChair
      default:
        return false
    }
  }

  const canEdit = (): boolean => hasPermission('sponsorship_chair')
  const canAccessSettings = (): boolean => hasPermission('sponsorship_chair')
  const canManageUsers = (): boolean => hasPermission('sponsorship_chair')

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    isAuthenticated: !!user,
    isEmailVerified,
    isApproved,
    isSponsorshipChair,
    userStatus,
    signIn,
    signUp,
    signOut,
    refreshUserProfile,
    hasPermission,
    canEdit,
    canAccessSettings,
    canManageUsers,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
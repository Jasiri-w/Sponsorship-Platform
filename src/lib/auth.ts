import { User } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { UserProfile, UserRole, PermissionLevel } from '@/types/database'

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (user: User | null): boolean => {
  return !!user
}

/**
 * Check if user is approved for admin access
 */
export const isApproved = (userProfile: UserProfile | null): boolean => {
  return !!userProfile?.is_approved
}

/**
 * Check if user has a specific role
 */
export const hasRole = (userProfile: UserProfile | null, role: UserRole): boolean => {
  return userProfile?.role === role
}

/**
 * Check if user is a sponsorship chair
 */
export const isSponsorshipChair = (userProfile: UserProfile | null): boolean => {
  return hasRole(userProfile, 'sponsorship_chair')
}

/**
 * Check if user is email verified
 */
export const isEmailVerified = (user: User | null): boolean => {
  return !!user?.email_confirmed_at
}

/**
 * Check if user has permission for a specific level
 */
export const hasPermission = (user: User | null, userProfile: UserProfile | null, level: PermissionLevel): boolean => {
  switch (level) {
    case 'public':
      return true
    case 'authenticated':
      return isAuthenticated(user)
    case 'approved':
      return isAuthenticated(user) && isEmailVerified(user) && isApproved(userProfile)
    case 'sponsorship_chair':
      return isAuthenticated(user) && isEmailVerified(user) && isApproved(userProfile) && isSponsorshipChair(userProfile)
    default:
      return false
  }
}

/**
 * Check if user can access admin features (deprecated - use hasPermission instead)
 */
export const canAccessAdminFeatures = (user: User | null, userProfile: UserProfile | null): boolean => {
  return hasPermission(user, userProfile, 'sponsorship_chair')
}

/**
 * Check if user can edit content (requires sponsorship chair role)
 */
export const canEdit = (user: User | null, userProfile: UserProfile | null): boolean => {
  return hasPermission(user, userProfile, 'sponsorship_chair')
}

/**
 * Check if user can access settings (requires sponsorship chair role)
 */
export const canAccessSettings = (user: User | null, userProfile: UserProfile | null): boolean => {
  return hasPermission(user, userProfile, 'sponsorship_chair')
}

/**
 * Check if user can manage other users (requires sponsorship chair role)
 */
export const canManageUsers = (user: User | null, userProfile: UserProfile | null): boolean => {
  return hasPermission(user, userProfile, 'sponsorship_chair')
}

/**
 * Get user profile by user ID
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user profile:', error.message || error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching user profile:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

/**
 * Update user approval status (admin function)
 */
export const updateUserApproval = async (userId: string, isApproved: boolean): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({ is_approved: isApproved })
      .eq('user_id', userId)

    return { error }
  } catch (error) {
    return { error: error as Error }
  }
}

/**
 * Update user role (admin function)
 */
export const updateUserRole = async (userId: string, role: UserRole): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({ role })
      .eq('user_id', userId)

    return { error }
  } catch (error) {
    return { error: error as Error }
  }
}

/**
 * Update user approval and role together (admin function)
 */
export const updateUserPermissions = async (
  userId: string, 
  isApproved: boolean, 
  role: UserRole
): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({ is_approved: isApproved, role })
      .eq('user_id', userId)

    return { error }
  } catch (error) {
    return { error: error as Error }
  }
}

/**
 * Get all pending approval users (admin function)
 */
export const getPendingUsers = async (): Promise<UserProfile[]> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('is_approved', false)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching pending users:', error.message || error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching pending users:', error instanceof Error ? error.message : 'Unknown error')
    return []
  }
}

/**
 * Get users by role (admin function)
 */
export const getUsersByRole = async (role: UserRole): Promise<UserProfile[]> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('role', role)
      .order('created_at', { ascending: false })

    if (error) {
      console.error(`Error fetching ${role} users:`, error.message || error)
      return []
    }

    return data || []
  } catch (error) {
    console.error(`Error fetching ${role} users:`, error instanceof Error ? error.message : 'Unknown error')
    return []
  }
}

/**
 * Get all users (admin function)
 */
export const getAllUsers = async (): Promise<UserProfile[]> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching all users:', error.message || error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching all users:', error instanceof Error ? error.message : 'Unknown error')
    return []
  }
}

/**
 * Check if current session user is approved
 */
export const checkCurrentUserApproval = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return false
    
    const profile = await getUserProfile(user.id)
    return isApproved(profile)
  } catch (error) {
    console.error('Error checking current user approval:', error instanceof Error ? error.message : 'Unknown error')
    return false
  }
}
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { UserRole } from '@/types/user'

export async function approveUser(formData: FormData) {
  console.log("Approve User")
  const supabase = await createClient()
  const userId = formData.get('userId') as string

  // Verify user is admin or manager
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, is_approved')
    .eq('user_id', user.id)
    .single()

  console.log("Profile Data 1")
  console.log(profile)
  if (!profile || !profile.is_approved || !['admin', 'manager'].includes(profile.role)) {
    console.log("Unauthorized")
    redirect('/unauthorized')
  }

  // Update the user's approval status
  const { error } = await supabase
    .from('user_profiles')
    .update({ is_approved: true })
    .eq('user_id', userId)

  if (error) {
    console.error('Error approving user:', error)
    throw new Error('Failed to approve user')
  }

  revalidatePath('/manage/users')
}

export async function rejectUser(formData: FormData) {
  const supabase = await createClient()
  const userId = formData.get('userId') as string

  // Verify user is admin or manager
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, is_approved')
    .eq('user_id', user.id)
    .single()

  console.log("Profile Data 2")
  console.log(profile)
  if (!profile || !profile.is_approved || !['admin', 'manager'].includes(profile.role)) {
    console.log("Unauthorized")
    redirect('/unauthorized')
  }

  // Delete the user profile (this will cascade to auth user due to foreign key)
  const { error } = await supabase
    .from('user_profiles')
    .delete()
    .eq('user_id', userId)

  if (error) {
    console.error('Error rejecting user:', error)
    throw new Error('Failed to reject user')
  }

  revalidatePath('/manage/users')
}

export async function promoteToManager(formData: FormData) {
  const supabase = await createClient()
  const userId = formData.get('userId') as string

  // Verify user is admin
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  console.log("Profile Data 3")
  console.log(profile)
  if (!profile || profile.role !== 'admin') {
    console.log("Unauthorized")
    redirect('/unauthorized')
  }

  // Update the user's role to manager
  const { error } = await supabase
    .from('user_profiles')
    .update({ role: 'manager' })
    .eq('user_id', userId)

  if (error) {
    console.error('Error promoting user:', error)
    throw new Error('Failed to promote user to manager')
  }

  revalidatePath('/manage/users')
}

export async function demoteFromManager(formData: FormData) {
  const supabase = await createClient()
  const userId = formData.get('userId') as string

  // Verify user is admin
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  console.log("Profile Data 4")
  console.log(profile)
  if (!profile || profile.role !== 'admin') {
    console.log("Unauthorized")
    redirect('/unauthorized')
  }

  // Prevent demoting yourself
  if (userId === user.id) {
    throw new Error('You cannot demote yourself')
  }

  // Update the user's role to user
  const { error } = await supabase
    .from('user_profiles')
    .update({ role: 'user' })
    .eq('user_id', userId)

  if (error) {
    console.error('Error demoting user:', error)
    throw new Error('Failed to demote user')
  }

  revalidatePath('/manage/users')
}

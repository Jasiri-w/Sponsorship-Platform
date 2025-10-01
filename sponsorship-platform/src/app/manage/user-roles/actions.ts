'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function promoteToManager(formData: FormData) {
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    redirect('/login')
  }

  // Get user profile to check role and approval status
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('role, is_approved')
    .eq('user_id', userData.user.id)
    .single()

  // Check if user has admin role and is approved (only admins can change roles)
  if (!profile || !profile.is_approved || profile.role !== 'admin') {
    redirect('/error')
  }

  // Extract and validate form data
  const targetUserId = formData.get('user_id') as string

  // Basic validation
  if (!targetUserId) {
    redirect('/error')
  }

  // Prevent admins from changing their own role
  if (targetUserId === userData.user.id) {
    redirect('/error')
  }

  // Check if target user exists, is approved, and currently has 'user' role
  const { data: targetUser, error: targetUserError } = await supabase
    .from('user_profiles')
    .select('user_id, role, is_approved')
    .eq('user_id', targetUserId)
    .eq('is_approved', true)
    .eq('role', 'user')
    .single()

  if (targetUserError || !targetUser) {
    console.error('Target user not found or not eligible for promotion:', targetUserError)
    redirect('/error')
  }

  // Update user role to manager
  const { error: updateError } = await supabase
    .from('user_profiles')
    .update({ role: 'manager' })
    .eq('user_id', targetUserId)

  if (updateError) {
    console.error('Error promoting user to manager:', updateError)
    redirect('/error')
  }

  // Revalidate the user roles page
  revalidatePath('/manage/user-roles')

  // Redirect back to the roles page
  redirect('/manage/user-roles')
}

export async function demoteFromManager(formData: FormData) {
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    redirect('/login')
  }

  // Get user profile to check role and approval status
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('role, is_approved')
    .eq('user_id', userData.user.id)
    .single()

  // Check if user has admin role and is approved (only admins can change roles)
  if (!profile || !profile.is_approved || profile.role !== 'admin') {
    redirect('/error')
  }

  // Extract and validate form data
  const targetUserId = formData.get('user_id') as string

  // Basic validation
  if (!targetUserId) {
    redirect('/error')
  }

  // Prevent admins from changing their own role
  if (targetUserId === userData.user.id) {
    redirect('/error')
  }

  // Check if target user exists, is approved, and currently has 'manager' role
  const { data: targetUser, error: targetUserError } = await supabase
    .from('user_profiles')
    .select('user_id, role, is_approved')
    .eq('user_id', targetUserId)
    .eq('is_approved', true)
    .eq('role', 'manager')
    .single()

  if (targetUserError || !targetUser) {
    console.error('Target user not found or not eligible for demotion:', targetUserError)
    redirect('/error')
  }

  // Update user role to user
  const { error: updateError } = await supabase
    .from('user_profiles')
    .update({ role: 'user' })
    .eq('user_id', targetUserId)

  if (updateError) {
    console.error('Error demoting manager to user:', updateError)
    redirect('/error')
  }

  // Revalidate the user roles page
  revalidatePath('/manage/user-roles')

  // Redirect back to the roles page
  redirect('/manage/user-roles')
}